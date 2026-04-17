// © 2026 DoctoPal — All Rights Reserved
// Code-based family invites: POST generates a 6-char code, GET validates one
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { getPremiumStatus } from "@/lib/premium"

// Unambiguous charset: no 0/O, no 1/I/L
const CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
const CODE_LENGTH = 6
const CODE_TTL_MS = 48 * 60 * 60 * 1000 // 48h

function generateCode(): string {
  let out = ""
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH))
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_CHARSET[bytes[i] % CODE_CHARSET.length]
  }
  return out
}

async function generateUniqueCode(
  supabase: ReturnType<typeof createServerClient>
): Promise<string | null> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode()
    const { data } = await supabase
      .from("family_members")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle()
    if (!data) return code
  }
  return null
}

// ─────────────────────────────────────────
// POST — Generate a 6-digit invite code
// ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req)
    const rate = checkRateLimit(`family-invite-code:${clientIP}`, 5, 60_000)
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

    let body: { groupId?: string; nickname?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    const { groupId, nickname } = body
    if (!groupId) {
      return NextResponse.json({ error: "groupId required" }, { status: 400 })
    }

    // Validate group + owner/admin permission
    const { data: group } = await supabase
      .from("family_groups")
      .select("id, owner_id")
      .eq("id", groupId)
      .maybeSingle()
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (group.owner_id !== user.id) {
      const { data: adminCheck } = await supabase
        .from("family_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .eq("role", "admin")
        .eq("invite_status", "accepted")
        .maybeSingle()
      if (!adminCheck) {
        return NextResponse.json({ error: "Only owner or admin can create codes" }, { status: 403 })
      }
    }

    // Premium check (family management is a premium feature)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
    const premium = getPremiumStatus(profile || {})
    if (!premium.isPremium) {
      return NextResponse.json(
        { error: "Premium subscription required to generate invite codes" },
        { status: 402 }
      )
    }

    // Generate unique code
    const code = await generateUniqueCode(supabase)
    if (!code) {
      return NextResponse.json({ error: "Could not generate unique code, please retry" }, { status: 500 })
    }

    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString()

    const { data: member, error: insertErr } = await supabase
      .from("family_members")
      .insert({
        group_id: groupId,
        invite_code: code,
        nickname: nickname || null,
        role: "member",
        invite_status: "pending",
        expires_at: expiresAt,
      })
      .select("id, invite_code, expires_at")
      .single()

    if (insertErr || !member) {
      console.error("[INVITE-CODE] Insert error:", insertErr?.message, insertErr?.details)
      return NextResponse.json(
        { error: `Failed to create code: ${insertErr?.message || "Unknown"}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      code: member.invite_code,
      expiresAt: member.expires_at,
    })
  } catch (err) {
    console.error("[INVITE-CODE POST] Unhandled error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ─────────────────────────────────────────
// GET — Validate a code (no auth required; read-only info)
// /api/family/invite-code?code=AB3X7K
// ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const clientIP = getClientIP(req)
    const rate = checkRateLimit(`family-code-check:${clientIP}`, 20, 60_000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Retry in ${rate.resetInSeconds}s.` },
        { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
      )
    }

    const code = req.nextUrl.searchParams.get("code")?.toUpperCase()
    if (!code || code.length !== CODE_LENGTH) {
      return NextResponse.json({ valid: false, reason: "not_found" }, { status: 404 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("family_members")
      .select(`
        invite_status, expires_at,
        group:family_groups(name, owner_id)
      `)
      .eq("invite_code", code)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ valid: false, reason: "not_found" }, { status: 404 })
    }

    if (data.invite_status !== "pending") {
      return NextResponse.json({ valid: false, reason: "used" })
    }

    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ valid: false, reason: "expired" })
    }

    const groupArr = data.group
    const groupData = Array.isArray(groupArr) ? groupArr[0] : groupArr
    const groupRow = groupData as { name?: string; owner_id?: string } | null
    const groupName = groupRow?.name || "Family Group"
    const ownerId = groupRow?.owner_id

    let inviterName = "Someone"
    if (ownerId) {
      const { data: ownerProfile } = await supabase
        .from("user_profiles")
        .select("display_name, full_name")
        .eq("id", ownerId)
        .maybeSingle()
      inviterName = ownerProfile?.display_name || ownerProfile?.full_name || "Someone"
    }

    return NextResponse.json({ valid: true, groupName, inviterName })
  } catch (err) {
    console.error("[INVITE-CODE GET] Unhandled error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
