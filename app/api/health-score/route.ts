// © 2026 DoctoPal — All Rights Reserved
import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-helpers"
import { calculateHealthScore } from "@/lib/health-score"

export const GET = apiHandler(async (_request, auth) => {
  // requireAuth defaults to true → auth is non-null here
  const { user, supabase } = auth!
  const today = new Date().toISOString().split("T")[0]

  // Parallel fetch all data needed for score
  const [checkInResult, logsResult, waterResult, vitalsResult, medsResult] = await Promise.all([
    supabase
      .from("daily_check_ins")
      .select("energy_level, sleep_quality, mood, bloating")
      .eq("user_id", user.id)
      .eq("check_date", today)
      .single(),
    supabase
      .from("daily_logs")
      .select("item_type, completed")
      .eq("user_id", user.id)
      .eq("log_date", today),
    supabase
      .from("water_intake")
      .select("glasses, target_glasses")
      .eq("user_id", user.id)
      .eq("intake_date", today)
      .single(),
    supabase
      .from("vital_records")
      .select("id")
      .eq("user_id", user.id)
      .gte("recorded_at", `${today}T00:00:00`)
      .limit(1),
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

  // Last 7 days scores for trend
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { data: weekScores } = await supabase
    .from("daily_check_ins")
    .select("check_date, health_score")
    .eq("user_id", user.id)
    .gte("check_date", weekAgo.toISOString().split("T")[0])
    .order("check_date", { ascending: true })

  // Consecutive check-in streak
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
}, { rateLimit: { max: 20, windowMs: 60_000 }, rateLimitKey: "health-score" })
