import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { sanitizeInput } from "@/lib/sanitize"

const VALID_FACTORS = [
  "caffeine", "screen", "exercise", "stress",
  "alcohol", "heavy_meal", "medication_change",
]

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`sleep-get:${clientIP}`, 30, 60_000)
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

    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get("days") || "30", 10), 90)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const { data: records, error } = await supabase
      .from("sleep_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", cutoff.toISOString().split("T")[0])
      .order("date", { ascending: false })

    if (error) {
      console.error("Sleep GET error:", error)
      return NextResponse.json({ error: "Failed to fetch sleep records" }, { status: 500 })
    }

    return NextResponse.json({ records: records || [] })
  } catch (err) {
    console.error("Sleep GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`sleep-post:${clientIP}`, 10, 60_000)
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
    const { bedtime, wake_time, sleep_quality, wake_count, dreams, factors, notes, date } = body

    // Validate sleep_quality 1-5
    const quality = Number(sleep_quality)
    if (isNaN(quality) || quality < 1 || quality > 5) {
      return NextResponse.json({ error: "sleep_quality must be between 1 and 5" }, { status: 400 })
    }

    // Validate wake_count
    const wakes = Number(wake_count) || 0
    if (wakes < 0 || wakes > 20) {
      return NextResponse.json({ error: "wake_count must be between 0 and 20" }, { status: 400 })
    }

    // Validate and sanitize factors
    const validFactors = Array.isArray(factors)
      ? factors.filter((f: string) => VALID_FACTORS.includes(f))
      : []

    // Calculate sleep duration from bedtime and wake_time
    let sleepDuration: number | null = null
    if (bedtime && wake_time) {
      const [bH, bM] = bedtime.split(":").map(Number)
      const [wH, wM] = wake_time.split(":").map(Number)
      let bedMinutes = bH * 60 + bM
      let wakeMinutes = wH * 60 + wM
      // If wake is "before" bed, it means next day
      if (wakeMinutes <= bedMinutes) {
        wakeMinutes += 24 * 60
      }
      sleepDuration = parseFloat(((wakeMinutes - bedMinutes) / 60).toFixed(2))
    }

    const recordDate = date || new Date().toISOString().split("T")[0]

    const sleepData = {
      user_id: user.id,
      date: recordDate,
      bedtime: bedtime || null,
      wake_time: wake_time || null,
      sleep_duration: sleepDuration,
      sleep_quality: quality,
      wake_count: wakes,
      dreams: Boolean(dreams),
      factors: validFactors,
      notes: notes ? sanitizeInput(String(notes)).slice(0, 500) : null,
    }

    // Upsert — one record per day
    const { data: existing } = await supabase
      .from("sleep_records")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", recordDate)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from("sleep_records")
        .update(sleepData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Sleep update error:", error)
        return NextResponse.json({ error: "Failed to update sleep record" }, { status: 500 })
      }
      return NextResponse.json({ record: data })
    }

    const { data, error } = await supabase
      .from("sleep_records")
      .insert(sleepData)
      .select()
      .single()

    if (error) {
      console.error("Sleep insert error:", error)
      return NextResponse.json({ error: "Failed to save sleep record" }, { status: 500 })
    }

    return NextResponse.json({ record: data }, { status: 201 })
  } catch (err) {
    console.error("Sleep POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
