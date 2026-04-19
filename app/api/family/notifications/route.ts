// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { createServerClient } from "@/lib/supabase"
import {
  sendFamilyNotificationEmail,
  type FamilyNotificationType,
} from "@/lib/emails/family-notification"

const VALID_TYPES = ["reminder_meds", "reminder_checkin", "reminder_water", "emergency", "custom"] as const
type NotifType = typeof VALID_TYPES[number]

function userClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.slice("Bearer ".length).trim()
  if (!token) return null
  const supabase = userClient(token)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return { user, supabase }
}

/** Resolve caller's display name from user_profiles (service-role read so the
 *  user_profiles RLS of the caller's own row doesn't matter either way). */
async function getCallerDisplayName(
  admin: SupabaseClient,
  userId: string,
  fallbackEmail: string | null | undefined
): Promise<string> {
  try {
    const { data } = await admin
      .from("user_profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle()
    const full = (data?.full_name as string | undefined)?.trim()
    if (full) return full
  } catch {
    /* ignore */
  }
  return fallbackEmail?.split("@")[0] || "DoctoPal user"
}

/** Best-effort email fan-out after a successful insert. Failures are logged;
 *  we never rewrite the 200 response on email issues. */
async function fanoutEmails(
  admin: SupabaseClient,
  rows: Array<{ to_user_id: string; type: string; message: string }>,
  fromName: string,
  lang: "tr" | "en"
): Promise<void> {
  await Promise.allSettled(
    rows.map(async (row) => {
      try {
        // auth.admin.getUserById needs service role — we're on createServerClient here.
        const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(row.to_user_id)
        if (authErr || !authUser?.user?.email) {
          console.warn("[family-email] recipient has no email:", row.to_user_id, authErr?.message)
          return
        }
        const toEmail = authUser.user.email
        // Pull display name from user_profiles (no email column exists there).
        const { data: profile } = await admin
          .from("user_profiles")
          .select("full_name")
          .eq("id", row.to_user_id)
          .maybeSingle()
        const toName =
          (profile?.full_name as string | undefined)?.trim()
          || toEmail.split("@")[0]
          || (lang === "tr" ? "Aile üyesi" : "Family member")

        await sendFamilyNotificationEmail({
          toEmail,
          toName,
          fromName,
          type: row.type as FamilyNotificationType,
          message: row.message,
          lang,
        })
      } catch (err) {
        console.error("[family-email] per-recipient failure:", err)
      }
    })
  )
}

/** Derive email language from message content + sender profile fallback.
 *  We don't have the recipient's lang preference server-side cheaply, so we
 *  default to TR when the message is Turkish (non-ASCII chars typical of TR),
 *  else EN. This matches how the rest of the app infers language. */
function inferLang(message: string): "tr" | "en" {
  // Heuristic: Turkish-specific letters → Turkish email.
  return /[ıİşŞğĞüÜöÖçÇ]/.test(message) ? "tr" : "en"
}

// GET — list notifications for the caller (recipient)
export async function GET(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = checkRateLimit(`fnotif-get:${ip}`, 60, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const onlyUnread = searchParams.get("unread") === "1"
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 100)

  let query = auth.supabase
    .from("family_notifications")
    .select("*")
    .eq("to_user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (onlyUnread) query = query.eq("read", false)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ notifications: data || [] })
}

// POST — send a notification to another household member (or broadcast to all)
export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null) as {
    groupId?: string
    toUserId?: string
    type?: string
    message?: string
    broadcast?: boolean
  } | null

  if (!body?.groupId || !body?.type || !body?.message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  if (!VALID_TYPES.includes(body.type as NotifType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }
  if (typeof body.message !== "string" || body.message.length > 500) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 })
  }

  const isBroadcast = body.broadcast === true
  const isEmergency = body.type === "emergency"

  // Emergency SOS has a tighter per-user rate limit (2/min) to prevent spam.
  const rlKey = isEmergency ? `fnotif-sos:${auth.user.id}` : `fnotif-send:${ip}`
  const rlMax = isEmergency ? 2 : 20
  const rl = checkRateLimit(rlKey, rlMax, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: isEmergency ? "SOS rate limit (2/min)" : "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }

  if (isBroadcast) {
    // Sanity check: is the caller actually an accepted member of this group?
    // RLS's fn_sender_insert requires this. Also serves as a probe for auth.uid()
    // decode issues — if auth.uid() is NULL, family_members' own SELECT policy
    // (auth.uid() = user_id) returns zero rows and we get !callerMembership.
    const { data: callerMembership, error: callerErr } = await auth.supabase
      .from("family_members")
      .select("id, role, invite_status")
      .eq("group_id", body.groupId)
      .eq("user_id", auth.user.id)
      .maybeSingle()

    if (callerErr) {
      console.error("[notif:broadcast] caller-membership lookup failed:", callerErr.message)
      return NextResponse.json({ error: callerErr.message }, { status: 400 })
    }

    if (!callerMembership || callerMembership.invite_status !== "accepted") {
      console.warn("[notif:broadcast] caller not an accepted member:", {
        callerUserId: auth.user.id,
        groupId: body.groupId,
        membership: callerMembership,
      })
      return NextResponse.json({
        error: "Caller is not an accepted member of this group",
        detail: { hasMembership: !!callerMembership, status: callerMembership?.invite_status || null },
      }, { status: 403 })
    }

    // Broadcast: insert one row per accepted non-self member of the group
    const { data: members, error: memberErr } = await auth.supabase
      .from("family_members")
      .select("user_id")
      .eq("group_id", body.groupId)
      .eq("invite_status", "accepted")
      .neq("user_id", auth.user.id)

    if (memberErr) {
      console.error("[notif:broadcast] members query failed:", memberErr.message)
      return NextResponse.json({ error: memberErr.message }, { status: 400 })
    }
    if (!members || members.length === 0) {
      return NextResponse.json({ error: "No other household members to notify" }, { status: 400 })
    }

    const messageTrimmed = body.message!.trim()
    const rows = members
      .filter((m: { user_id: string | null }) => !!m.user_id)
      .map((m: { user_id: string | null }) => ({
        group_id: body.groupId!,
        from_user_id: auth.user.id,
        to_user_id: m.user_id!,
        type: body.type!,
        message: messageTrimmed,
      }))

    // Service-role client for the INSERT: we've already validated caller
    // membership + target membership under RLS above, so the only remaining
    // invariant (from_user_id === auth.user.id) is enforced in the server
    // code itself. Bypassing RLS here side-steps the stale-policy / JWT-decode
    // issues that were blocking SOS.
    const admin = createServerClient()
    const { data, error } = await admin
      .from("family_notifications")
      .insert(rows)
      .select()

    if (error) {
      console.error("[notif:broadcast] insert failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json({
        error: error.message,
        detail: { code: error.code, hint: error.hint, rowsAttempted: rows.length },
      }, { status: 400 })
    }

    // Best-effort email fan-out. Never blocks the 200 response.
    const lang = inferLang(messageTrimmed)
    const fromName = await getCallerDisplayName(admin, auth.user.id, auth.user.email)
    void fanoutEmails(admin, rows, fromName, lang)

    return NextResponse.json({ notifications: data, count: data?.length ?? 0 })
  }

  // Single-recipient path (reminders, management-permission requests)
  if (!body.toUserId) {
    return NextResponse.json({ error: "Missing toUserId" }, { status: 400 })
  }
  if (body.toUserId === auth.user.id) {
    return NextResponse.json({ error: "Cannot notify yourself" }, { status: 400 })
  }

  // Sanity check: caller is an accepted member of the same group. Relying on
  // user-RLS SELECT here (family_members own-row policy + cross-user SELECT
  // from Session 31). This guards against callers spamming notifications to
  // random user IDs.
  const { data: callerMembership, error: callerErr } = await auth.supabase
    .from("family_members")
    .select("id, invite_status")
    .eq("group_id", body.groupId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (callerErr) {
    return NextResponse.json({ error: callerErr.message }, { status: 400 })
  }
  if (!callerMembership || callerMembership.invite_status !== "accepted") {
    return NextResponse.json(
      { error: "Caller is not an accepted member of this group" },
      { status: 403 }
    )
  }

  // Verify recipient is also an accepted member of the same group.
  const { data: targetMembership } = await auth.supabase
    .from("family_members")
    .select("id, invite_status")
    .eq("group_id", body.groupId)
    .eq("user_id", body.toUserId)
    .maybeSingle()
  if (!targetMembership || targetMembership.invite_status !== "accepted") {
    return NextResponse.json(
      { error: "Recipient is not an accepted member of this group" },
      { status: 403 }
    )
  }

  // Service-role insert (RLS bypass, same rationale as broadcast).
  const messageTrimmed = body.message!.trim()
  const adminSingle = createServerClient()
  const { data, error } = await adminSingle
    .from("family_notifications")
    .insert({
      group_id: body.groupId,
      from_user_id: auth.user.id,
      to_user_id: body.toUserId,
      type: body.type,
      message: messageTrimmed,
    })
    .select()
    .single()

  if (error) {
    console.error("[notif:single] insert failed:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return NextResponse.json({
      error: error.message,
      detail: { code: error.code, hint: error.hint },
    }, { status: 400 })
  }

  // Best-effort email to the single recipient.
  const lang = inferLang(messageTrimmed)
  const fromName = await getCallerDisplayName(adminSingle, auth.user.id, auth.user.email)
  void fanoutEmails(
    adminSingle,
    [{ to_user_id: body.toUserId, type: body.type, message: messageTrimmed }],
    fromName,
    lang
  )

  return NextResponse.json({ notification: data })
}

// PATCH — mark notification(s) as read
export async function PATCH(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = checkRateLimit(`fnotif-patch:${ip}`, 60, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null) as {
    id?: string
    markAllRead?: boolean
  } | null

  if (body?.markAllRead) {
    const { error } = await auth.supabase
      .from("family_notifications")
      .update({ read: true })
      .eq("to_user_id", auth.user.id)
      .eq("read", false)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  if (!body?.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const { error } = await auth.supabase
    .from("family_notifications")
    .update({ read: true })
    .eq("id", body.id)
    .eq("to_user_id", auth.user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
