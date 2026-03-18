import { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase"

// ============================================
// GET /api/user-data — Export all user data (KVKK/GDPR)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const token = authHeader.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch all user data in parallel
    const [profileRes, medsRes, allergiesRes, queryRes, bloodRes, consentRes] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_medications").select("*").eq("user_id", user.id),
      supabase.from("user_allergies").select("*").eq("user_id", user.id),
      supabase.from("query_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
      supabase.from("blood_tests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("consent_records").select("*").eq("user_id", user.id),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      platform: "Phytotherapy.ai",
      user: {
        email: user.email,
        createdAt: user.created_at,
      },
      profile: profileRes.data || null,
      medications: medsRes.data || [],
      allergies: allergiesRes.data || [],
      queryHistory: (queryRes.data || []).map((q: Record<string, unknown>) => ({
        date: q.created_at,
        type: q.query_type,
        query: q.query_text,
        response: q.response_text ? String(q.response_text).substring(0, 500) + "..." : null,
      })),
      bloodTests: bloodRes.data || [],
      consentRecords: consentRes.data || [],
    }

    const json = JSON.stringify(exportData, null, 2)
    const filename = `phytotherapy-data-${new Date().toISOString().split("T")[0]}.json`

    return new Response(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Data export error:", error)
    return new Response(JSON.stringify({ error: "Failed to export data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// ============================================
// DELETE /api/user-data — Delete all user data (KVKK/GDPR)
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const token = authHeader.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Delete all user data in order (respecting foreign keys)
    await Promise.all([
      supabase.from("query_history").delete().eq("user_id", user.id),
      supabase.from("blood_tests").delete().eq("user_id", user.id),
      supabase.from("consent_records").delete().eq("user_id", user.id),
      supabase.from("user_medications").delete().eq("user_id", user.id),
      supabase.from("user_allergies").delete().eq("user_id", user.id),
    ])

    // Delete profile last (may have FK constraints)
    await supabase.from("user_profiles").delete().eq("id", user.id)

    // Delete the auth user
    await supabase.auth.admin.deleteUser(user.id)

    return new Response(JSON.stringify({ success: true, message: "Account and all data deleted" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Data deletion error:", error)
    return new Response(JSON.stringify({ error: "Failed to delete account" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
