// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`checkin-get:${clientIP}`, 30, 60_000)
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
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    // Get today's check-in
    const { data: checkIn } = await supabase
      .from("daily_check_ins")
      .select("*")
      .eq("user_id", user.id)
      .eq("check_date", date)
      .single()

    // Get last 7 days for trend
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { data: weekData } = await supabase
      .from("daily_check_ins")
      .select("check_date, energy_level, sleep_quality, mood, bloating, health_score")
      .eq("user_id", user.id)
      .gte("check_date", weekAgo.toISOString().split("T")[0])
      .order("check_date", { ascending: true })

    return NextResponse.json({
      checkIn: checkIn || null,
      weekTrend: weekData || [],
    })
  } catch (err) {
    console.error("Check-in GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`checkin-post:${clientIP}`, 10, 60_000)
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
    const { energy_level, sleep_quality, mood, bloating, notes, health_score } = body

    const today = new Date().toISOString().split("T")[0]

    // Validate ranges (1-5)
    const validate = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      if (isNaN(n) || n < 1 || n > 5) return null
      return n
    }

    const checkinData = {
      user_id: user.id,
      check_date: today,
      energy_level: validate(energy_level),
      sleep_quality: validate(sleep_quality),
      mood: validate(mood),
      bloating: validate(bloating),
      notes: typeof notes === "string" ? notes.slice(0, 500) : null,
      health_score: typeof health_score === "number" && health_score >= 0 && health_score <= 100
        ? Math.round(health_score) : null,
    }

    // Upsert — one check-in per day
    const { data: existing } = await supabase
      .from("daily_check_ins")
      .select("id")
      .eq("user_id", user.id)
      .eq("check_date", today)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from("daily_check_ins")
        .update(checkinData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Check-in update error:", error)
        return NextResponse.json({ error: "Failed to update check-in" }, { status: 500 })
      }
      return NextResponse.json({ checkIn: data })
    }

    const { data, error } = await supabase
      .from("daily_check_ins")
      .insert(checkinData)
      .select()
      .single()

    if (error) {
      console.error("Check-in insert error:", error)
      return NextResponse.json({ error: "Failed to save check-in" }, { status: 500 })
    }

    return NextResponse.json({ checkIn: data }, { status: 201 })
  } catch (err) {
    console.error("Check-in POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
