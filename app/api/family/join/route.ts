// © 2026 DoctoPal — All Rights Reserved
// Join a family group using a 6-digit invite code
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req)
    const rate = checkRateLimit(`family-join:${clientIP}`, 10, 60_000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Retry in ${rate.resetInSeconds}s.` },
        { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
      )
    }

    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = auth.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: { code?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    const code = body.code?.toUpperCase().trim()
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 })
    }

    // Find pending invite by code
    const { data: invite, error: findErr } = await supabase
      .from("family_members")
      .select("id, group_id, invite_status, expires_at")
      .eq("invite_code", code)
      .maybeSingle()

    if (findErr || !invite) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 })
    }

    if (invite.invite_status !== "pending") {
      return NextResponse.json({ error: "Code already used" }, { status: 410 })
    }

    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Code expired" }, { status: 410 })
    }

    // User already in this group?
    const { data: existingMembership } = await supabase
      .from("family_members")
      .select("id, invite_status")
      .eq("group_id", invite.group_id)
      .eq("user_id", user.id)
      .eq("invite_status", "accepted")
      .maybeSingle()

    if (existingMembership) {
      return NextResponse.json({ error: "Already a member of this group" }, { status: 409 })
    }

    // Accept the invite: bind user_id + mark accepted
    const { error: updateErr } = await supabase
      .from("family_members")
      .update({
        user_id: user.id,
        invite_status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id)

    if (updateErr) {
      console.error("[JOIN] Update error:", updateErr.message)
      return NextResponse.json({ error: `Failed to join: ${updateErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, groupId: invite.group_id })
  } catch (err) {
    console.error("[JOIN] Unhandled error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
