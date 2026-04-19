// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Max family members per plan tier
const FAMILY_LIMITS: Record<string, number> = {
  free: 1,
  premium: 3,
  family: 6,
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = auth.replace("Bearer ", "")
    const supabase = getServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Membership-first resolver — same idea as lib/family-context.tsx's
    // fetchFamilyData. Legacy flow (.eq("owner_id", user.id)) only worked
    // for owners; members got an empty list + needsMigration=true.
    const { data: memberships, error: mErr } = await supabase
      .from("family_members")
      .select("group_id")
      .eq("user_id", user.id)
      .eq("invite_status", "accepted")

    if (mErr) {
      if (mErr.message?.includes("does not exist") || mErr.code === "42P01") {
        return NextResponse.json({ members: [], needsMigration: true })
      }
      return NextResponse.json({ error: mErr.message }, { status: 500 })
    }

    const groupIds = Array.from(
      new Set(
        (memberships || [])
          .map((m: { group_id: string | null }) => m.group_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    )

    // No membership row → legacy fallback: older installs stored family
    // members on a flat table keyed by family_members.owner_id (no groups).
    if (groupIds.length === 0) {
      const { data: legacyMembers, error: legacyErr } = await supabase
        .from("family_members")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })

      if (legacyErr) {
        if (legacyErr.message?.includes("does not exist") || legacyErr.code === "42P01") {
          return NextResponse.json({ members: [], needsMigration: true })
        }
        return NextResponse.json({ error: legacyErr.message }, { status: 500 })
      }

      // Genuinely no family state at all — surface needsMigration so the UI
      // can nudge the user to create a group. Having legacy rows is fine;
      // just return them.
      return NextResponse.json({
        members: legacyMembers || [],
        needsMigration: (legacyMembers?.length || 0) === 0,
      })
    }

    // Pick most-populated group when the caller is in several (e.g. stale
    // solo group + real household).
    let selectedGroupId = groupIds[0]
    if (groupIds.length > 1) {
      const { data: allAcceptedRows } = await supabase
        .from("family_members")
        .select("group_id")
        .in("group_id", groupIds)
        .eq("invite_status", "accepted")

      const countByGroup = new Map<string, number>()
      for (const m of allAcceptedRows || []) {
        const gid = (m as { group_id: string | null }).group_id
        if (gid) countByGroup.set(gid, (countByGroup.get(gid) || 0) + 1)
      }
      selectedGroupId = groupIds.reduce((best, g) =>
        (countByGroup.get(g) || 0) > (countByGroup.get(best) || 0) ? g : best
      )
    }

    const { data: groupMembers, error: gmErr } = await supabase
      .from("family_members")
      .select("*")
      .eq("group_id", selectedGroupId)
      .order("created_at", { ascending: true })

    if (gmErr) {
      return NextResponse.json({ error: gmErr.message }, { status: 500 })
    }

    return NextResponse.json({
      members: groupMembers || [],
      groupId: selectedGroupId,
      needsMigration: false,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = auth.replace("Bearer ", "")
    const supabase = getServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check current family member count
    const { count } = await supabase
      .from("family_members")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)

    const plan = "premium" // TODO: integrate with actual subscription system
    const limit = FAMILY_LIMITS[plan] || 1
    if ((count || 0) >= limit) {
      return NextResponse.json(
        { error: `Family member limit reached (${limit})` },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Calculate is_minor from birth_date
    let isMinor = false
    if (body.birth_date) {
      const age = Math.floor(
        (Date.now() - new Date(body.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
      isMinor = age < 18
      body.age = age
    }

    const { data: member, error } = await supabase
      .from("family_members")
      .insert({
        owner_id: user.id,
        full_name: body.full_name,
        birth_date: body.birth_date || null,
        age: body.age || null,
        gender: body.gender || null,
        relationship: body.relationship || "other",
        is_minor: isMinor,
        is_pregnant: body.is_pregnant || false,
        is_breastfeeding: body.is_breastfeeding || false,
        chronic_conditions: body.chronic_conditions || [],
        supplements: body.supplements || [],
      })
      .select()
      .single()

    if (error) {
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return NextResponse.json({
          error: "Family profiles table not created yet. Please run the Supabase migration: sprint11_family_profiles.sql"
        }, { status: 500 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = auth.replace("Bearer ", "")
    const supabase = getServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get("id")
    if (!memberId) {
      return NextResponse.json({ error: "Missing member ID" }, { status: 400 })
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("family_members")
      .select("owner_id")
      .eq("id", memberId)
      .single()

    if (!existing || existing.owner_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await supabase.from("family_members").delete().eq("id", memberId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
