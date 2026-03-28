import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { sanitizeInput } from "@/lib/sanitize"

// ============================================
// GET — Fetch cycle & contraceptive records (last 6 months)
// ============================================

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`wh-get:${clientIP}`, 30, 60_000)
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

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sinceDate = sixMonthsAgo.toISOString().split("T")[0]

    // Fetch cycle records
    const { data: cycles, error: cycleError } = await supabase
      .from("cycle_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("period_start", sinceDate)
      .order("period_start", { ascending: false })

    if (cycleError) {
      console.error("Cycle records fetch error:", cycleError)
      return NextResponse.json({ error: "Failed to fetch cycle records" }, { status: 500 })
    }

    // Fetch contraceptive records
    const { data: contraceptives, error: contraError } = await supabase
      .from("contraceptive_records")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .limit(5)

    if (contraError) {
      console.error("Contraceptive records fetch error:", contraError)
      // Non-critical — continue without contraceptive data
    }

    return NextResponse.json({
      cycles: cycles || [],
      contraceptives: contraceptives || [],
    })
  } catch (err) {
    console.error("Women's health GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================
// POST — Save a new cycle record
// ============================================

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`wh-post:${clientIP}`, 15, 60_000)
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
    const {
      period_start,
      period_end,
      flow_intensity,
      symptoms,
      mood,
      notes,
    } = body

    // Validate required fields
    if (!period_start) {
      return NextResponse.json(
        { error: "period_start is required" },
        { status: 400 }
      )
    }

    // Validate date format
    const startDate = new Date(period_start)
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid period_start date" },
        { status: 400 }
      )
    }

    // Validate flow intensity
    const validFlows = ["light", "moderate", "heavy", "spotting"]
    if (flow_intensity && !validFlows.includes(flow_intensity)) {
      return NextResponse.json(
        { error: "Invalid flow_intensity. Must be: light, moderate, heavy, or spotting" },
        { status: 400 }
      )
    }

    // Validate symptoms array
    const validSymptoms = [
      "cramps", "headache", "bloating", "mood_swings",
      "breast_tenderness", "fatigue", "acne", "back_pain", "nausea",
    ]
    const sanitizedSymptoms = Array.isArray(symptoms)
      ? symptoms.filter((s: string) => validSymptoms.includes(s))
      : []

    // Validate mood
    const validMoods = ["happy", "neutral", "sad", "anxious", "irritable", "energetic"]
    const sanitizedMood = mood && validMoods.includes(mood) ? mood : null

    // Sanitize notes
    const sanitizedNotes = notes ? sanitizeInput(String(notes)).slice(0, 500) : null

    // Validate end date if provided
    let endDate: string | null = null
    if (period_end) {
      const end = new Date(period_end)
      if (!isNaN(end.getTime())) {
        if (end < startDate) {
          return NextResponse.json(
            { error: "period_end must be after period_start" },
            { status: 400 }
          )
        }
        endDate = period_end
      }
    }

    const { data, error } = await supabase
      .from("cycle_records")
      .insert({
        user_id: user.id,
        period_start,
        period_end: endDate,
        flow_intensity: flow_intensity || "moderate",
        symptoms: sanitizedSymptoms,
        mood: sanitizedMood,
        notes: sanitizedNotes,
      })
      .select()
      .single()

    if (error) {
      console.error("Cycle record insert error:", error)
      return NextResponse.json({ error: "Failed to save cycle record" }, { status: 500 })
    }

    return NextResponse.json({ record: data }, { status: 201 })
  } catch (err) {
    console.error("Women's health POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
