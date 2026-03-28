// ============================================
// Linked Accounts API
// ============================================
// GET: Fetch linked accounts for current user
// POST: Invite / Accept / Update permissions
// DELETE: Remove linked account
// ============================================

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

async function getAuthUser(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.replace("Bearer ", "")
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

export async function GET(req: Request) {
  const ip = getClientIP(req)
  const { allowed } = checkRateLimit(`linked-get:${ip}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServerClient()

  try {
    // Accounts I manage (I am parent)
    const { data: asParent } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("parent_user_id", user.id)

    // Accounts that manage me (I am linked)
    const { data: asLinked } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("linked_user_id", user.id)

    // Get names for linked users
    const allUserIds = new Set<string>()
    for (const a of asParent || []) {
      if (a.linked_user_id) allUserIds.add(a.linked_user_id)
    }
    for (const a of asLinked || []) {
      if (a.parent_user_id) allUserIds.add(a.parent_user_id)
    }

    const userNames: Record<string, string> = {}
    if (allUserIds.size > 0) {
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .in("id", Array.from(allUserIds))

      for (const p of profiles || []) {
        userNames[p.id] = p.full_name || "Unknown"
      }
    }

    return NextResponse.json({
      asParent: (asParent || []).map((a) => ({
        ...a,
        linkedName: userNames[a.linked_user_id] || a.invite_email || "Pending",
      })),
      asLinked: (asLinked || []).map((a) => ({
        ...a,
        parentName: userNames[a.parent_user_id] || "Unknown",
      })),
    })
  } catch (err) {
    console.error("Linked accounts GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const ip = getClientIP(req)
  const { allowed } = checkRateLimit(`linked-post:${ip}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: {
    action?: string
    email?: string
    relationship?: string
    permissions?: string[]
    pays_subscription?: boolean
    linkedAccountId?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { action } = body

  // === INVITE ===
  if (action === "invite") {
    const { email, relationship, permissions, pays_subscription } = body

    if (!email || !relationship) {
      return NextResponse.json({ error: "Email and relationship are required" }, { status: 400 })
    }

    // Validate relationship
    const validRelationships = ["mother", "father", "child", "spouse", "grandparent", "sibling", "other"]
    if (!validRelationships.includes(relationship)) {
      return NextResponse.json({ error: "Invalid relationship" }, { status: 400 })
    }

    try {
      // Check if the email belongs to an existing user
      const { data: targetProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .ilike("recovery_email", email.trim())
        .single()

      // Also check auth.users email
      let targetUserId: string | null = targetProfile?.id || null
      if (!targetUserId) {
        const { data: authUsers } = await supabase.auth.admin.listUsers()
        const matchedUser = authUsers?.users?.find(
          (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
        )
        targetUserId = matchedUser?.id || null
      }

      // Prevent self-linking
      if (targetUserId === user.id) {
        return NextResponse.json({ error: "Cannot link to yourself" }, { status: 400 })
      }

      // Check duplicate
      if (targetUserId) {
        const { data: existing } = await supabase
          .from("linked_accounts")
          .select("id")
          .eq("parent_user_id", user.id)
          .eq("linked_user_id", targetUserId)
          .single()

        if (existing) {
          return NextResponse.json({ error: "Account already linked" }, { status: 400 })
        }
      }

      const { data: newLink, error: insertError } = await supabase
        .from("linked_accounts")
        .insert({
          parent_user_id: user.id,
          linked_user_id: targetUserId,
          relationship,
          permissions: permissions || [],
          pays_subscription: pays_subscription || false,
          is_accepted: false,
          invite_email: email.trim().toLowerCase(),
        })
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 })
      }

      return NextResponse.json({ linked: newLink })
    } catch (err) {
      console.error("Invite linked account error:", err)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  // === ACCEPT ===
  if (action === "accept") {
    const { linkedAccountId } = body
    if (!linkedAccountId) {
      return NextResponse.json({ error: "linkedAccountId is required" }, { status: 400 })
    }

    try {
      const { error: updateError } = await supabase
        .from("linked_accounts")
        .update({ is_accepted: true, linked_user_id: user.id })
        .eq("id", linkedAccountId)
        .or(`linked_user_id.eq.${user.id},invite_email.ilike.${user.email}`)

      if (updateError) {
        return NextResponse.json({ error: "Failed to accept" }, { status: 500 })
      }

      return NextResponse.json({ accepted: true })
    } catch (err) {
      console.error("Accept linked account error:", err)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  // === UPDATE PERMISSIONS ===
  if (action === "update_permissions") {
    const { linkedAccountId, permissions } = body
    if (!linkedAccountId) {
      return NextResponse.json({ error: "linkedAccountId is required" }, { status: 400 })
    }

    try {
      const { error: updateError } = await supabase
        .from("linked_accounts")
        .update({ permissions: permissions || [] })
        .eq("id", linkedAccountId)
        .eq("parent_user_id", user.id)

      if (updateError) {
        return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 })
      }

      return NextResponse.json({ updated: true })
    } catch (err) {
      console.error("Update permissions error:", err)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

export async function DELETE(req: Request) {
  const ip = getClientIP(req)
  const { allowed } = checkRateLimit(`linked-delete:${ip}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { linkedAccountId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { linkedAccountId } = body
  if (!linkedAccountId) {
    return NextResponse.json({ error: "linkedAccountId is required" }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    // Only allow deletion if user is parent or linked
    const { error: deleteError } = await supabase
      .from("linked_accounts")
      .delete()
      .eq("id", linkedAccountId)
      .or(`parent_user_id.eq.${user.id},linked_user_id.eq.${user.id}`)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to remove linked account" }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error("Delete linked account error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
