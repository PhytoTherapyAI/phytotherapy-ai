// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { askGeminiJSON } from "@/lib/ai-client"
import { tx } from "@/lib/translations"

export const maxDuration = 60

// ============================================
// Types
// ============================================

interface CycleRecord {
  id: string
  period_start: string
  period_end: string | null
  flow_intensity: string
  symptoms: string[]
  mood: string | null
  notes: string | null
  created_at: string
}

interface ContraceptiveRecord {
  id: string
  name: string
  type: string
  start_date: string
  notes: string | null
}

interface CycleAnalysis {
  cycleRegularity: "regular" | "irregular" | "insufficient_data"
  averageCycleLength: number | null
  currentPhase: "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown"
  currentPhaseDay: number | null
  pmsPatterns: Array<{
    symptom: string
    frequency: string
    severity: string
    recommendation: string
  }>
  contraceptiveStatus: {
    active: boolean
    name: string | null
    durationMonths: number | null
    annualReviewDue: boolean
    notes: string | null
  }
  phaseRecommendations: Array<{
    phase: string
    nutrition: string
    exercise: string
    supplements: string
    selfCare: string
  }>
  alerts: Array<{
    type: "warning" | "info" | "success"
    message: string
  }>
  disclaimer: string
}

// ============================================
// POST — AI Cycle Analysis
// ============================================

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`wh-analyze:${clientIP}`, 5, 60_000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      )
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const supabase = createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr"
    const langName = tx("api.respondLang", lang)

    // Fetch cycle records (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sinceDate = sixMonthsAgo.toISOString().split("T")[0]

    const { data: cycles } = await supabase
      .from("cycle_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("period_start", sinceDate)
      .order("period_start", { ascending: true })

    if (!cycles || cycles.length < 3) {
      return NextResponse.json(
        { error: "Need at least 3 cycle records for analysis" },
        { status: 400 }
      )
    }

    // Fetch contraceptive records
    const { data: contraceptives } = await supabase
      .from("contraceptive_records")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .limit(3)

    // Fetch user medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id)
      .eq("is_active", true)

    // Fetch user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("age, gender, is_pregnant, is_breastfeeding")
      .eq("id", user.id)
      .single()

    // Build prompt
    const prompt = buildAnalysisPrompt(
      cycles as CycleRecord[],
      (contraceptives as ContraceptiveRecord[]) || [],
      medications || [],
      profile
    )

    const systemPrompt = `You are a women's health analyst for Phytotherapy.ai. Analyze menstrual cycle data and provide evidence-based insights.

RULES:
1. You are NOT a doctor. Never diagnose conditions.
2. All supplement/lifestyle recommendations must be evidence-based.
3. Flag any concerning patterns (irregular cycles, heavy flow, etc.) with a recommendation to see a doctor.
4. Be empathetic and supportive in tone.
5. Consider any medications the user is taking for interaction warnings.
6. If contraceptive is active for >11 months, flag annual review.

IMPORTANT: Respond entirely in ${langName}.

Return ONLY a raw JSON object matching this schema:
{
  "cycleRegularity": "regular" | "irregular" | "insufficient_data",
  "averageCycleLength": number | null,
  "currentPhase": "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown",
  "currentPhaseDay": number | null,
  "pmsPatterns": [
    {
      "symptom": "symptom name",
      "frequency": "e.g. 4 out of 5 cycles",
      "severity": "mild/moderate/severe",
      "recommendation": "evidence-based recommendation"
    }
  ],
  "contraceptiveStatus": {
    "active": boolean,
    "name": string | null,
    "durationMonths": number | null,
    "annualReviewDue": boolean,
    "notes": string | null
  },
  "phaseRecommendations": [
    {
      "phase": "menstrual/follicular/ovulatory/luteal",
      "nutrition": "dietary advice for this phase",
      "exercise": "exercise recommendation",
      "supplements": "supplement suggestions with evidence grade",
      "selfCare": "self-care tips"
    }
  ],
  "alerts": [
    {
      "type": "warning" | "info" | "success",
      "message": "alert message"
    }
  ],
  "disclaimer": "standard medical disclaimer"
}`

    const geminiResponse = await askGeminiJSON(prompt, systemPrompt)
    const analysis = parseAnalysis(geminiResponse)

    // Save to query history
    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Women's health cycle analysis (${cycles.length} cycles)`,
        query_type: "womens_health",
      })
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true, analysis })
  } catch (err) {
    console.error("Women's health analysis error:", err)
    return NextResponse.json(
      { error: "Failed to analyze cycle data. Please try again." },
      { status: 500 }
    )
  }
}

// ============================================
// Helpers
// ============================================

function buildAnalysisPrompt(
  cycles: CycleRecord[],
  contraceptives: ContraceptiveRecord[],
  medications: Array<{ brand_name: string | null; generic_name: string | null; dosage: string | null }>,
  profile: { age: number | null; gender: string | null; is_pregnant: boolean | null; is_breastfeeding: boolean | null } | null
): string {
  let prompt = "## MENSTRUAL CYCLE DATA\n\n"

  // Profile context
  if (profile) {
    prompt += "### User Profile\n"
    if (profile.age) prompt += `- Age: ${profile.age}\n`
    if (profile.is_pregnant) prompt += "- **PREGNANT** (adjust all recommendations accordingly)\n"
    if (profile.is_breastfeeding) prompt += "- **BREASTFEEDING** (adjust all recommendations accordingly)\n"
    prompt += "\n"
  }

  // Cycle records
  prompt += `### Cycle Records (${cycles.length} cycles)\n`
  const today = new Date()
  for (const c of cycles) {
    const start = new Date(c.period_start)
    const end = c.period_end ? new Date(c.period_end) : null
    const duration = end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : "unknown"
    prompt += `- Start: ${c.period_start} | End: ${c.period_end || "ongoing"} | Duration: ${duration} days | Flow: ${c.flow_intensity}\n`
    if (c.symptoms && c.symptoms.length > 0) {
      prompt += `  Symptoms: ${c.symptoms.join(", ")}\n`
    }
    if (c.mood) {
      prompt += `  Mood: ${c.mood}\n`
    }
  }

  // Calculate cycle lengths
  prompt += "\n### Cycle Lengths\n"
  for (let i = 1; i < cycles.length; i++) {
    const prev = new Date(cycles[i - 1].period_start)
    const curr = new Date(cycles[i].period_start)
    const length = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    prompt += `- Cycle ${i}: ${length} days\n`
  }

  // Today's date for phase calculation
  prompt += `\nToday's date: ${today.toISOString().split("T")[0]}\n`
  prompt += `Last period start: ${cycles[cycles.length - 1].period_start}\n`

  // Contraceptives
  if (contraceptives.length > 0) {
    prompt += "\n### Contraceptive Records\n"
    for (const c of contraceptives) {
      const startDate = new Date(c.start_date)
      const monthsActive = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      prompt += `- ${c.name} (${c.type}) — started ${c.start_date} — ${monthsActive} months active\n`
    }
  }

  // Medications
  if (medications.length > 0) {
    prompt += "\n### Current Medications\n"
    for (const m of medications) {
      prompt += `- ${m.generic_name || m.brand_name}${m.dosage ? ` (${m.dosage})` : ""}\n`
    }
    prompt += "\nCross-check all supplement recommendations against these medications.\n"
  }

  prompt += "\n### Instructions\nAnalyze the cycle data above. Determine regularity, identify PMS patterns, estimate current cycle phase, and provide phase-specific recommendations."

  return prompt
}

function parseAnalysis(response: string): CycleAnalysis {
  try {
    const data = JSON.parse(response)
    return {
      cycleRegularity: ["regular", "irregular", "insufficient_data"].includes(data.cycleRegularity)
        ? data.cycleRegularity
        : "insufficient_data",
      averageCycleLength: typeof data.averageCycleLength === "number" ? data.averageCycleLength : null,
      currentPhase: ["menstrual", "follicular", "ovulatory", "luteal", "unknown"].includes(data.currentPhase)
        ? data.currentPhase
        : "unknown",
      currentPhaseDay: typeof data.currentPhaseDay === "number" ? data.currentPhaseDay : null,
      pmsPatterns: Array.isArray(data.pmsPatterns)
        ? data.pmsPatterns.map((p: Record<string, unknown>) => ({
            symptom: String(p.symptom || ""),
            frequency: String(p.frequency || ""),
            severity: String(p.severity || "mild"),
            recommendation: String(p.recommendation || ""),
          }))
        : [],
      contraceptiveStatus: {
        active: !!data.contraceptiveStatus?.active,
        name: data.contraceptiveStatus?.name ? String(data.contraceptiveStatus.name) : null,
        durationMonths: typeof data.contraceptiveStatus?.durationMonths === "number"
          ? data.contraceptiveStatus.durationMonths
          : null,
        annualReviewDue: !!data.contraceptiveStatus?.annualReviewDue,
        notes: data.contraceptiveStatus?.notes ? String(data.contraceptiveStatus.notes) : null,
      },
      phaseRecommendations: Array.isArray(data.phaseRecommendations)
        ? data.phaseRecommendations.map((r: Record<string, unknown>) => ({
            phase: String(r.phase || ""),
            nutrition: String(r.nutrition || ""),
            exercise: String(r.exercise || ""),
            supplements: String(r.supplements || ""),
            selfCare: String(r.selfCare || ""),
          }))
        : [],
      alerts: Array.isArray(data.alerts)
        ? data.alerts.map((a: Record<string, unknown>) => ({
            type: ["warning", "info", "success"].includes(String(a.type)) ? a.type as "warning" | "info" | "success" : "info",
            message: String(a.message || ""),
          }))
        : [],
      disclaimer: String(
        data.disclaimer ||
          "This analysis is for educational purposes only. It is not a medical diagnosis. Always consult your healthcare provider for medical concerns."
      ),
    }
  } catch (error) {
    console.error("Failed to parse cycle analysis:", error)
    return {
      cycleRegularity: "insufficient_data",
      averageCycleLength: null,
      currentPhase: "unknown",
      currentPhaseDay: null,
      pmsPatterns: [],
      contraceptiveStatus: {
        active: false,
        name: null,
        durationMonths: null,
        annualReviewDue: false,
        notes: null,
      },
      phaseRecommendations: [],
      alerts: [{ type: "warning", message: "Unable to generate analysis. Please try again." }],
      disclaimer: "This analysis is for educational purposes only.",
    }
  }
}
