// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { userId, eventType, eventData } = await req.json()

    if (!eventType) {
      return NextResponse.json({ error: "eventType required" }, { status: 400 })
    }

    const supabase = createServerClient()

    await supabase.from("analytics_events").insert({
      user_id: userId || null,
      event_type: eventType,
      event_data: eventData || {},
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[Analytics] Error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}

// Get aggregated analytics (admin/doctor use)
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const eventType = searchParams.get("type")
    const days = parseInt(searchParams.get("days") || "30")

    const supabase = createServerClient()
    const since = new Date()
    since.setDate(since.getDate() - days)

    let query = supabase
      .from("analytics_events")
      .select("event_type, event_data, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(1000)

    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aggregate by type
    const counts: Record<string, number> = {}
    for (const event of data || []) {
      counts[event.event_type] = (counts[event.event_type] || 0) + 1
    }

    return NextResponse.json({ counts, total: data?.length || 0 })
  } catch (error) {
    console.error("[Analytics GET] Error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
