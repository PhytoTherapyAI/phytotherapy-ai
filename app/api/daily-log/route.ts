import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { sanitizeInput } from "@/lib/sanitize"

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`daily-log-get:${clientIP}`, 30, 60_000)
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

    // Also fetch water intake for the day
    const { data: waterData } = await supabase
      .from("water_intake")
      .select("*")
      .eq("user_id", user.id)
      .eq("intake_date", date)
      .single()

    return NextResponse.json({
      logs: data,
      water: waterData || { glasses: 0 },
    })
  } catch (err) {
    console.error("Daily log GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`daily-log-post:${clientIP}`, 20, 60_000)
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
        { status: 400 }
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
  } catch (err) {
    console.error("Daily log POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`daily-log-patch:${clientIP}`, 20, 60_000)
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
    const { date, glasses } = body

    if (!date || typeof glasses !== "number" || glasses < 0 || glasses > 20) {
      return NextResponse.json(
        { error: "date and glasses (0-20) are required" },
        { status: 400 }
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
      .insert({
        user_id: user.id,
        intake_date: date,
        glasses,
      })
      .select()
      .single()

    if (error) {
      console.error("Water insert error:", error)
      return NextResponse.json({ error: "Failed to create water record" }, { status: 500 })
    }

    return NextResponse.json({ water: data }, { status: 201 })
  } catch (err) {
    console.error("Daily log PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
