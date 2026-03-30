// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { askGeminiJSON } from "@/lib/gemini"
import { tx } from "@/lib/translations"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`sleep-analyze:${clientIP}`, 5, 60_000)
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

    // Fetch last 30 days of sleep records
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)

    const { data: records, error: fetchError } = await supabase
      .from("sleep_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", cutoff.toISOString().split("T")[0])
      .order("date", { ascending: true })

    if (fetchError) {
      console.error("Sleep analysis fetch error:", fetchError)
      return NextResponse.json({ error: "Failed to fetch sleep records" }, { status: 500 })
    }

    if (!records || records.length < 7) {
      return NextResponse.json(
        { error: "Need at least 7 days of sleep data for analysis" },
        { status: 400 }
      )
    }

    // Fetch user medications for interaction check
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage, frequency")
      .eq("user_id", user.id)

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported"

    // Build sleep data summary for AI
    const sleepSummary = records.map((r) => ({
      date: r.date,
      duration: r.sleep_duration,
      quality: r.sleep_quality,
      wakeCount: r.wake_count,
      dreams: r.dreams,
      factors: r.factors || [],
      bedtime: r.bedtime,
      wakeTime: r.wake_time,
    }))

    const systemPrompt = `You are a sleep health analyst for Phytotherapy.ai. Analyze sleep records and provide evidence-based insights.

RULES:
- Base analysis on the data provided only
- Note medication effects on sleep when relevant
- Be specific with recommendations
- Use PubMed-backed evidence when possible
- Respond in ${tx("api.respondLang", lang)}

OUTPUT FORMAT (strict JSON):
{
  "sleepHygieneScore": <number 0-100>,
  "averageDuration": <number in hours>,
  "averageQuality": <number 1-5>,
  "consistency": <"excellent" | "good" | "fair" | "poor">,
  "chronotype": <"early_bird" | "intermediate" | "night_owl">,
  "patterns": [<string: observed patterns, max 5>],
  "medicationEffects": [<string: how medications may affect sleep, empty array if none>],
  "recommendations": [<string: actionable tips, max 5>],
  "alertLevel": <"green" | "yellow" | "red">,
  "alertMessage": <string: brief alert explanation or empty string>,
  "weekdayVsWeekend": {
    "weekdayAvg": <number>,
    "weekendAvg": <number>,
    "socialJetLag": <boolean>
  }
}`

    const prompt = `Analyze these sleep records for the past ${records.length} days:

SLEEP DATA:
${JSON.stringify(sleepSummary, null, 2)}

USER MEDICATIONS: ${medicationList}

Provide a comprehensive sleep analysis as JSON.`

    const result = await askGeminiJSON(prompt, systemPrompt)
    const analysis = JSON.parse(result)

    return NextResponse.json({ analysis })
  } catch (err) {
    console.error("Sleep analysis error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
