// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

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

// POST — send a notification to another household member
export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = checkRateLimit(`fnotif-send:${ip}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null) as {
    groupId?: string
    toUserId?: string
    type?: string
    message?: string
  } | null

  if (!body?.groupId || !body?.toUserId || !body?.type || !body?.message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  if (!VALID_TYPES.includes(body.type as NotifType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }
  if (typeof body.message !== "string" || body.message.length > 500) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 })
  }
  if (body.toUserId === auth.user.id) {
    return NextResponse.json({ error: "Cannot notify yourself" }, { status: 400 })
  }

  // RLS will enforce that both sender and recipient are accepted
  // members of the same group; the insert will fail otherwise.
  const { data, error } = await auth.supabase
    .from("family_notifications")
    .insert({
      group_id: body.groupId,
      from_user_id: auth.user.id,
      to_user_id: body.toUserId,
      type: body.type,
      message: body.message.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
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
