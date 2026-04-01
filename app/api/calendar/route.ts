// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { sanitizeInput } from "@/lib/sanitize"

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`calendar-get:${clientIP}`, 30, 60_000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      )
    }

    // Auth
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

    // Query params
    const { searchParams } = new URL(request.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    if (!start || !end) {
      return NextResponse.json(
        { error: "start and end query params required (YYYY-MM-DD)" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("event_date", start)
      .lte("event_date", end)
      .order("event_date", { ascending: true })

    if (error) {
      console.error("Calendar fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }

    return NextResponse.json({ events: data })
  } catch (err) {
    console.error("Calendar GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`calendar-post:${clientIP}`, 10, 60_000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      )
    }

    // Auth
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
    const { event_type, title, description, event_date, event_time, recurrence } = body

    // Validate required fields
    const sanitizedTitle = sanitizeInput(title || "")
    if (!sanitizedTitle || sanitizedTitle.length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!event_date) {
      return NextResponse.json({ error: "event_date is required" }, { status: 400 })
    }

    const validTypes = ["medication", "supplement", "appointment", "sport", "symptom", "operation", "custom"]
    if (!validTypes.includes(event_type)) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 })
    }

    const validRecurrence = ["none", "daily", "weekly", "monthly"]
    const rec = recurrence && validRecurrence.includes(recurrence) ? recurrence : "none"

    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: user.id,
        event_type,
        title: sanitizedTitle,
        description: description ? sanitizeInput(description) : null,
        event_date,
        event_time: event_time || null,
        recurrence: rec,
      })
      .select()
      .single()

    if (error) {
      console.error("Calendar insert error:", error)
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }

    return NextResponse.json({ event: data }, { status: 201 })
  } catch (err) {
    console.error("Calendar POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
