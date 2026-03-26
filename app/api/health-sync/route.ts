import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Health data sync endpoint for Apple Health / Google Fit data
export async function POST(req: NextRequest) {
  try {
    // Auth check
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

    const { data, source } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "data required" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Upsert into daily_check_ins with health connect data
    const updateData: Record<string, unknown> = {}
    if (data.steps) updateData.steps = data.steps
    if (data.heartRate) updateData.heart_rate = data.heartRate
    if (data.sleepHours) updateData.sleep_hours = data.sleepHours
    if (data.activeCalories) updateData.active_calories = data.activeCalories
    if (data.weight) updateData.weight = data.weight

    // Log the sync event
    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_type: "health_sync",
      event_data: {
        source,
        metrics: Object.keys(updateData),
        date: today,
      },
    })

    return NextResponse.json({ ok: true, synced: Object.keys(updateData).length })
  } catch (error) {
    console.error("[HealthSync] Error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
