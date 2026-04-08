// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    // Get user from Authorization header (Bearer token)
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.slice(7)

    // Use service role to get user from token, then fetch their medications
    const supabase = createServerClient()

    // Verify token and get user
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Fetch medications for this user
    const { data, error } = await supabase
      .from("user_medications")
      .select("id, brand_name, generic_name, dosage, frequency, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ medications: data ?? [] })
  } catch (err) {
    console.error("[/api/user/medications]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
