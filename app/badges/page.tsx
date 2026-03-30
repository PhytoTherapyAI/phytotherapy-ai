"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx, txObj } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { BADGES, evaluateBadges, calculateAnonymousScore, type UserStats } from "@/lib/badges"
import { Trophy, Lock, Users, Crown, TrendingUp } from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"

interface LeaderboardData {
  rank: number
  total: number
  percentile: number
  topScores: number[]
  userScore: number
}

export default function BadgesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!user) return
    const supabase = createBrowserClient()
    setLoading(true)

    const [queries, checkIns, bloodTests, family] = await Promise.all([
      supabase.from("query_history").select("query_type", { count: "exact" }).eq("user_id", user.id),
      supabase.from("daily_check_ins").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("blood_tests").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("family_members").select("id", { count: "exact" }).eq("owner_id", user.id),
    ])

    const interactionCount = (queries.data || []).filter(
      (q: { query_type: string | null }) => q.query_type === "interaction"
    ).length

    const createdAt = new Date(user.created_at || Date.now())
    const daysActive = Math.max(1, Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))

    const userStats: UserStats = {
      totalQueries: queries.count || 0,
      totalCheckIns: checkIns.count || 0,
      streakDays: Math.min(daysActive, checkIns.count || 0),
      bloodTestCount: bloodTests.count || 0,
      supplementsTracked: 0,
      waterGoalHits: 0,
      interactionChecks: interactionCount,
      daysActive,
      familyMembers: family.count || 0,
      pdfReports: 0,
    }

    setStats(userStats)
    setLoading(false)

    // Fetch leaderboard
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        const res = await fetch("/api/leaderboard", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          setLeaderboard(await res.json())
        }
      }
    } catch {
      // leaderboard is optional
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) fetchStats()
  }, [user, fetchStats])

  if (isLoading || loading) {
    return <PageSkeleton />
  }

  if (!stats) return null

  const { earned, locked } = evaluateBadges(stats)
  const score = calculateAnonymousScore(stats)

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {tx("badges.title", lang)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{tx("badges.subtitle", lang)}</p>
      </div>

      {/* Anonymous Health Score */}
      <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/20" />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${score} 100`}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xl font-bold">{score}</span>
          </div>
          <div>
            <h3 className="font-semibold">
              {tx("badges.engagementScore", lang)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tx("badges.engagementDesc", lang)}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {tx("badges.communityAvg", lang)}
            </div>
          </div>
        </div>
      </div>

      {/* Global Leaderboard */}
      {leaderboard && (
        <div className="mb-8 rounded-2xl border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Crown className="h-5 w-5 text-amber-500" />
            {tx("badges.leaderboard", lang)}
          </h3>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-primary">#{leaderboard.rank}</p>
              <p className="text-[10px] text-muted-foreground">{tx("badges.yourRank", lang)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{leaderboard.percentile}%</p>
              <p className="text-[10px] text-muted-foreground">{tx("badges.percentile", lang)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-muted-foreground">{leaderboard.total}</p>
              <p className="text-[10px] text-muted-foreground">{tx("badges.totalUsers", lang)}</p>
            </div>
          </div>
          {leaderboard.topScores.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">{tx("badges.topScores", lang)}</p>
              <div className="space-y-1.5">
                {leaderboard.topScores.map((score, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <div className="h-2.5 flex-1 rounded-full bg-muted">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          score === leaderboard.userScore ? "bg-primary" : "bg-primary/40"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`w-8 text-right text-xs font-medium ${
                      score === leaderboard.userScore ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {score}
                    </span>
                    {score === leaderboard.userScore && (
                      <TrendingUp className="h-3 w-3 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-5 w-5 text-amber-500" />
            {tx("badges.earned", lang)} ({earned.length}/{BADGES.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {earned.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center rounded-xl border bg-gradient-to-b from-amber-50/50 to-orange-50/50 p-4 text-center dark:from-amber-950/20 dark:to-orange-950/20"
              >
                <span className="text-3xl">{badge.icon}</span>
                <h4 className="mt-2 text-sm font-semibold">
                  {txObj(badge, lang)}
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {txObj({ en: badge.descEn, tr: badge.descTr }, lang)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Lock className="h-5 w-5 text-muted-foreground" />
            {tx("badges.locked", lang)} ({locked.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center rounded-xl border bg-muted/30 p-4 text-center opacity-60"
              >
                <span className="text-3xl grayscale">{badge.icon}</span>
                <h4 className="mt-2 text-sm font-semibold">
                  {txObj(badge, lang)}
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {txObj({ en: badge.descEn, tr: badge.descTr }, lang)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
