// © 2026 DoctoPal — All Rights Reserved
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
    const safe = (table: string, col = "user_id") => supabase.from(table).select("*").eq(col, user.id).then(r => r, () => ({ data: [] }))
    const familyRes = await safe("family_members", "owner_id")
    const checkInsRes = await safe("daily_check_ins")
    const calendarRes = await safe("calendar_events")
    const vitalsRes = await safe("vital_records")
    const waterRes = await safe("water_intake")
    const sleepRes = await safe("sleep_records")
    const suppsRes = await safe("supplements")
    const nudgeRes = await safe("nudge_log")

    const exportData = {
      exportedAt: new Date().toISOString(),
      platform: "DoctoPal",
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
      sleepRecords: sleepRes.data || [],
      supplements: suppsRes.data || [],
      nudgeLog: nudgeRes.data || [],
    }

    const json = JSON.stringify(exportData, null, 2)
    const filename = `doctopal-data-${new Date().toISOString().split("T")[0]}.json`

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
      "vital_records", "water_intake",
      "family_medications", "family_allergies", "family_members",
      "doctor_patients", "referral_records",
      "nudge_log", "bot_subscriptions", "bot_messages",
      "sleep_records", "supplements", "feedback",
    ]
    await Promise.all(
      phase1Tables.map(async (table) => {
        try {
          const idCol =
            table === "family_members" ? "owner_id" :
            table === "doctor_patients" ? "doctor_id" :
            table === "feedback" ? "user_id" :
            "user_id"
          await supabase.from(table).delete().eq(idCol, user.id)
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
