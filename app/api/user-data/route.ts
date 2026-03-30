// © 2026 Phytotherapy.ai — All Rights Reserved
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

    // Additional tables — may not exist, handle errors gracefully
    const familyRes = await supabase.from("family_members").select("*").eq("owner_id", user.id).then(r => r, () => ({ data: [] }))
    const checkInsRes = await supabase.from("daily_check_ins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(365).then(r => r, () => ({ data: [] }))
    const calendarRes = await supabase.from("calendar_events").select("*").eq("user_id", user.id).then(r => r, () => ({ data: [] }))
    const vitalsRes = await supabase.from("vital_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(365).then(r => r, () => ({ data: [] }))
    const waterRes = await supabase.from("water_intake").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(365).then(r => r, () => ({ data: [] }))

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
      familyMembers: familyRes.data || [],
      dailyCheckIns: checkInsRes.data || [],
      calendarEvents: calendarRes.data || [],
      vitalRecords: vitalsRes.data || [],
      waterIntake: waterRes.data || [],
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

    // Delete all user data — comprehensive KVKK/GDPR erasure
    // Phase 1: Delete dependent records (tables that may have FK constraints)
    const phase1Tables = [
      "query_history", "blood_tests", "consent_records",
      "daily_check_ins", "daily_logs", "calendar_events",
      "vital_records", "water_intake", "family_members",
      "doctor_patients", "referral_records",
    ]
    await Promise.all(
      phase1Tables.map(async (table) => {
        try {
          await supabase.from(table).delete().eq(
            table === "family_members" ? "owner_id" :
            table === "doctor_patients" ? "doctor_id" : "user_id",
            user.id
          )
        } catch {
          // Silently skip tables that don't exist
        }
      })
    )

    // Phase 2: Delete core user records
    await Promise.all([
      supabase.from("user_medications").delete().eq("user_id", user.id),
      supabase.from("user_allergies").delete().eq("user_id", user.id),
    ])

    // Phase 3: Delete profile last (may have FK constraints)
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
