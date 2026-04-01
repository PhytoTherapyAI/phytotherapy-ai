// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { calculateHealthScore } from "@/lib/health-score"

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`health-score:${clientIP}`, 20, 60_000)
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

    const today = new Date().toISOString().split("T")[0]

    // Parallel fetch all data needed for score
    const [checkInResult, logsResult, waterResult, vitalsResult, medsResult] = await Promise.all([
      // Today's check-in
      supabase
        .from("daily_check_ins")
        .select("energy_level, sleep_quality, mood, bloating")
        .eq("user_id", user.id)
        .eq("check_date", today)
        .single(),
      // Today's medication logs
      supabase
        .from("daily_logs")
        .select("item_type, completed")
        .eq("user_id", user.id)
        .eq("log_date", today),
      // Today's water
      supabase
        .from("water_intake")
        .select("glasses, target_glasses")
        .eq("user_id", user.id)
        .eq("intake_date", today)
        .single(),
      // Today's vitals
      supabase
        .from("vital_records")
        .select("id")
        .eq("user_id", user.id)
        .gte("recorded_at", `${today}T00:00:00`)
        .limit(1),
      // User's active medications count
      supabase
        .from("user_medications")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true),
    ])

    // Calculate medication adherence
    const totalMeds = medsResult.data?.length ?? 0
    const medLogs = logsResult.data?.filter(l => l.item_type === "medication") ?? []
    const takenMeds = medLogs.filter(l => l.completed).length

    const score = calculateHealthScore(
      checkInResult.data || null,
      { totalMeds, takenMeds },
      { glasses: waterResult.data?.glasses ?? 0, target: waterResult.data?.target_glasses ?? 8 },
      { hasRecordToday: (vitalsResult.data?.length ?? 0) > 0 }
    )

    // Get last 7 days scores for trend
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { data: weekScores } = await supabase
      .from("daily_check_ins")
      .select("check_date, health_score")
      .eq("user_id", user.id)
      .gte("check_date", weekAgo.toISOString().split("T")[0])
      .order("check_date", { ascending: true })

    // Calculate consecutive check-in streak (count backward from today)
    const { data: streakData } = await supabase
      .from("daily_check_ins")
      .select("check_date")
      .eq("user_id", user.id)
      .order("check_date", { ascending: false })
      .limit(60)

    let streak = 0
    if (streakData) {
      const d = new Date()
      for (let i = 0; i < 30; i++) {
        const dateStr = d.toISOString().split("T")[0]
        if (streakData.some(s => s.check_date === dateStr)) {
          streak++
        } else if (i > 0) {
          break
        }
        d.setDate(d.getDate() - 1)
      }
    }

    return NextResponse.json({
      score,
      streak,
      weekTrend: weekScores || [],
      components: {
        medsTotal: totalMeds,
        medsTaken: takenMeds,
        waterGlasses: waterResult.data?.glasses ?? 0,
        waterTarget: waterResult.data?.target_glasses ?? 8,
        hasVitals: (vitalsResult.data?.length ?? 0) > 0,
        hasCheckIn: !!checkInResult.data,
      },
    })
  } catch (err) {
    console.error("Health score GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
