// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { askClaude } from "@/lib/ai-client"

export async function POST(req: NextRequest) {
  try {
    // Auth check — verify the requester IS the doctor
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { patientId } = await req.json()

    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 })
    }

    const doctorId = user.id // Use authenticated user as doctor

    // Verify doctor-patient relationship
    const { data: relationship } = await supabase
      .from("doctor_patients")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("patient_id", patientId)
      .eq("status", "active")
      .single()

    if (!relationship) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Fetch patient data
    const [profileRes, medsRes, queriesRes, checkInsRes] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", patientId).single(),
      supabase.from("user_medications").select("*").eq("user_id", patientId).eq("is_active", true),
      supabase.from("query_history").select("query_text, query_type, created_at").eq("user_id", patientId).order("created_at", { ascending: false }).limit(20),
      supabase.from("daily_check_ins").select("*").eq("user_id", patientId).order("check_date", { ascending: false }).limit(14),
    ])

    const profile = profileRes.data
    const meds = medsRes.data || []
    const queries = queriesRes.data || []
    const checkIns = checkInsRes.data || []

    const prompt = `You are generating a clinical visit summary for a doctor about their patient.

PATIENT PROFILE:
- Name: ${profile?.full_name || "N/A"}
- Age: ${profile?.age || "N/A"}
- Gender: ${profile?.gender || "N/A"}
- Chronic conditions: ${(profile?.chronic_conditions || []).join(", ") || "None"}
- Active medications: ${meds.map((m: { brand_name?: string; generic_name?: string; dosage?: string }) => `${m.brand_name || m.generic_name} ${m.dosage || ""}`).join(", ") || "None"}

RECENT ACTIVITY (last 2 weeks):
- Check-ins: ${checkIns.length} days
- Average energy: ${checkIns.length > 0 ? (checkIns.reduce((a: number, c: { energy_level?: number | null }) => a + (c.energy_level || 0), 0) / checkIns.length).toFixed(1) : "N/A"}
- Average sleep: ${checkIns.length > 0 ? (checkIns.reduce((a: number, c: { sleep_quality?: number | null }) => a + (c.sleep_quality || 0), 0) / checkIns.length).toFixed(1) : "N/A"}
- Average mood: ${checkIns.length > 0 ? (checkIns.reduce((a: number, c: { mood?: number | null }) => a + (c.mood || 0), 0) / checkIns.length).toFixed(1) : "N/A"}

RECENT HEALTH QUERIES:
${queries.map((q: { query_text: string; query_type?: string | null }) => `- [${q.query_type}] ${q.query_text}`).join("\n")}

Generate a concise clinical visit summary in English with:
1. Patient Overview (1-2 sentences)
2. Current Medications & Adherence
3. Health Trends (based on check-in data)
4. Key Concerns (from queries and profile)
5. Recommendations for Discussion

Keep it professional, concise, and clinically relevant.`

    const summary = await askClaude(prompt, "You are a clinical AI assistant generating visit summaries for doctors.", { userId: user.id })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[Doctor Summary] Error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
