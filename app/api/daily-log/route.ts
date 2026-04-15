// © 2026 DoctoPal — All Rights Reserved
import { NextResponse } from "next/server"
import { apiHandler, parseBody } from "@/lib/api-helpers"
import { sanitizeInput } from "@/lib/sanitize"

interface PostBody {
  log_id?: string
  item_type?: string
  item_id?: string
  item_name?: string
  completed?: boolean
  log_date?: string
}

interface PatchBody {
  date?: string
  glasses?: number
}

export const GET = apiHandler(async (request, auth) => {
  const { user, supabase } = auth!
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", date)

  if (error) {
    console.error("Daily log fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }

  const { data: waterData } = await supabase
    .from("water_intake")
    .select("*")
    .eq("user_id", user.id)
    .eq("intake_date", date)
    .single()

  return NextResponse.json({ logs: data, water: waterData || { glasses: 0 } })
}, { rateLimit: { max: 30, windowMs: 60_000 }, rateLimitKey: "daily-log-get" })

export const POST = apiHandler(async (request, auth) => {
  const { user, supabase } = auth!
  const body = await parseBody<PostBody>(request)
  const { log_id, item_type, item_id, item_name, completed, log_date } = body

  // Toggle existing log
  if (log_id) {
    const { data, error } = await supabase
      .from("daily_logs")
      .update({ completed: !!completed })
      .eq("id", log_id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Daily log toggle error:", error)
      return NextResponse.json({ error: "Failed to update log" }, { status: 500 })
    }

    return NextResponse.json({ log: data })
  }

  // Create new log entry
  const sanitizedName = sanitizeInput(item_name || "")
  if (!item_type || !item_id || !sanitizedName) {
    return NextResponse.json(
      { error: "item_type, item_id, and item_name are required" },
      { status: 400 },
    )
  }

  const date = log_date || new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("daily_logs")
    .insert({
      user_id: user.id,
      log_date: date,
      item_type,
      item_id,
      item_name: sanitizedName,
      completed: completed !== false,
    })
    .select()
    .single()

  if (error) {
    console.error("Daily log insert error:", error)
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 })
  }

  return NextResponse.json({ log: data }, { status: 201 })
}, { rateLimit: { max: 20, windowMs: 60_000 }, rateLimitKey: "daily-log-post" })

export const PATCH = apiHandler(async (request, auth) => {
  const { user, supabase } = auth!
  const body = await parseBody<PatchBody>(request)
  const { date, glasses } = body

  if (!date || typeof glasses !== "number" || glasses < 0 || glasses > 20) {
    return NextResponse.json(
      { error: "date and glasses (0-20) are required" },
      { status: 400 },
    )
  }

  // Upsert water intake
  const { data: existing } = await supabase
    .from("water_intake")
    .select("id")
    .eq("user_id", user.id)
    .eq("intake_date", date)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from("water_intake")
      .update({ glasses, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) {
      console.error("Water update error:", error)
      return NextResponse.json({ error: "Failed to update water" }, { status: 500 })
    }

    return NextResponse.json({ water: data })
  }

  const { data, error } = await supabase
    .from("water_intake")
    .insert({ user_id: user.id, intake_date: date, glasses })
    .select()
    .single()

  if (error) {
    console.error("Water insert error:", error)
    return NextResponse.json({ error: "Failed to create water record" }, { status: 500 })
  }

  return NextResponse.json({ water: data }, { status: 201 })
}, { rateLimit: { max: 20, windowMs: 60_000 }, rateLimitKey: "daily-log-patch" })
