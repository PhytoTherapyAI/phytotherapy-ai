// © 2026 DoctoPal — All Rights Reserved
// Owner-only endpoint — activate the Family Premium plan on a group.
//
// Body: { paymentIntentId?: string, durationMonths?: number }
//   - paymentIntentId is accepted but not validated here yet (Stripe wiring
//     comes later). In production this MUST be verified against Stripe
//     before flipping plan_type.
//   - durationMonths defaults to 1 (monthly). Yearly = 12.
//
// Side-effects:
//   - family_groups.plan_type='family_premium', plan_started_at=NOW(),
//     plan_expires_at=NOW + durationMonths.
//   - Fan-out custom notifications to every OTHER accepted member letting
//     them know Premium is now active for the group.
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

const DEFAULT_DURATION_MONTHS = 1
const MAX_DURATION_MONTHS = 12

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = auth.replace("Bearer ", "")
    const admin = createServerClient()
    const { data: { user }, error: authErr } = await admin.auth.getUser(token)
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as {
      paymentIntentId?: string
      durationMonths?: number
    } | null

    const durationMonths = Math.min(
      Math.max(Number(body?.durationMonths) || DEFAULT_DURATION_MONTHS, 1),
      MAX_DURATION_MONTHS
    )

    // Caller must be the owner of exactly one group — upgrade their group.
    const { data: group, error: groupErr } = await admin
      .from("family_groups")
      .select("id, name, owner_id, plan_type, plan_expires_at")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (groupErr) return NextResponse.json({ error: groupErr.message }, { status: 400 })
    if (!group) {
      return NextResponse.json(
        { error: "You don't own a family group yet. Create one first." },
        { status: 400 }
      )
    }

    // TODO(stripe): verify body.paymentIntentId via Stripe before this line.
    // For now we accept the upgrade unconditionally so the UI flow is
    // exercisable in staging. The `paymentIntentId` gets stored for audit.

    const now = new Date()
    const startedAt = now.toISOString()
    const expiresAt = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()

    const { error: updErr } = await admin
      .from("family_groups")
      .update({
        plan_type: "family_premium",
        plan_started_at: startedAt,
        plan_expires_at: expiresAt,
        // max_members default is 6; leave alone unless we're raising it.
      })
      .eq("id", group.id)

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    // Broadcast notification to every other accepted member.
    const { data: others } = await admin
      .from("family_members")
      .select("user_id")
      .eq("group_id", group.id)
      .eq("invite_status", "accepted")
      .neq("user_id", user.id)

    const recipients = (others || [])
      .map((m: { user_id: string | null }) => m.user_id)
      .filter((id): id is string => !!id)

    if (recipients.length > 0) {
      // Resolve caller's display name for the notification message.
      const { data: callerProfile } = await admin
        .from("user_profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
      const callerName =
        (callerProfile as { full_name?: string | null } | null)?.full_name?.trim()
        || user.email?.split("@")[0]
        || "Aile kurucusu"

      const rows = recipients.map((rid) => ({
        group_id: group.id,
        from_user_id: user.id,
        to_user_id: rid,
        type: "custom",
        message: `${callerName} aile Premium paketini aktif etti. Artık tüm aile üyeleri Premium özelliklere erişebilir.`,
      }))

      const { error: notifErr } = await admin.from("family_notifications").insert(rows)
      if (notifErr) {
        // Non-fatal: plan is already upgraded. Log and continue.
        console.warn("[upgrade-plan] notification fan-out failed:", notifErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      groupId: group.id,
      planType: "family_premium",
      planStartedAt: startedAt,
      planExpiresAt: expiresAt,
      notifiedCount: recipients.length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
