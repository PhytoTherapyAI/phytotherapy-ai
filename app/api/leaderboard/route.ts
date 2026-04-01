// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`leaderboard:${clientIP}`, 10, 60_000)
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

    // Fetch all completed onboarding users with their activity counts
    const { data: allProfiles } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("onboarding_complete", true)

    if (!allProfiles || allProfiles.length === 0) {
      return NextResponse.json({
        rank: 1,
        total: 1,
        percentile: 100,
        topScores: [],
        userScore: 0,
      })
    }

    // Calculate scores for all users in parallel batches
    const userIds = allProfiles.map((p: { id: string }) => p.id)

    const [queryCounts, checkInCounts, bloodTestCounts] = await Promise.all([
      supabase
        .from("query_history")
        .select("user_id")
        .in("user_id", userIds),
      supabase
        .from("daily_check_ins")
        .select("user_id")
        .in("user_id", userIds),
      supabase
        .from("blood_tests")
        .select("user_id")
        .in("user_id", userIds),
    ])

    // Count per user
    const countByUser = (data: { user_id: string }[] | null) => {
      const counts: Record<string, number> = {}
      for (const row of data || []) {
        counts[row.user_id] = (counts[row.user_id] || 0) + 1
      }
      return counts
    }

    const qCounts = countByUser(queryCounts.data as { user_id: string }[] | null)
    const cCounts = countByUser(checkInCounts.data as { user_id: string }[] | null)
    const bCounts = countByUser(bloodTestCounts.data as { user_id: string }[] | null)

    // Calculate scores
    const scores: { userId: string; score: number }[] = userIds.map((uid: string) => ({
      userId: uid,
      score: Math.min(100, Math.round(
        (qCounts[uid] || 0) * 0.2 +
        (cCounts[uid] || 0) * 0.5 +
        (bCounts[uid] || 0) * 2
      )),
    }))

    // Sort descending
    scores.sort((a, b) => b.score - a.score)

    const userScore = scores.find((s) => s.userId === user.id)?.score ?? 0
    const rank = scores.findIndex((s) => s.userId === user.id) + 1
    const total = scores.length
    const percentile = total > 1 ? Math.round(((total - rank) / (total - 1)) * 100) : 100
    const topScores = scores.slice(0, 10).map((s) => s.score)

    return NextResponse.json({
      rank,
      total,
      percentile,
      topScores,
      userScore,
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
