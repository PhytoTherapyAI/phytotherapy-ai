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

    const { data: members, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })

    if (error) {
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return NextResponse.json({ members: [], needsMigration: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ members: members || [] })
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
