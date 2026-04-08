// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Activity, Droplets, Pill, Flame, TrendingUp, TrendingDown, Minus,
  ChevronRight, Sparkles,
} from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import type { HealthScoreBreakdown } from "@/lib/health-score"
import Link from "next/link"

interface DailySummaryCardProps {
  userId: string
  lang: Lang
  userName?: string | null
}

interface ScoreData {
  score: HealthScoreBreakdown
  streak: number
  components: {
    medsTotal: number
    medsTaken: number
    waterGlasses: number
    waterTarget: number
    hasVitals: boolean
    hasCheckIn: boolean
  }
  weekTrend: Array<{ check_date: string; health_score: number | null }>
}

export function DailySummaryCard({ userId, lang, userName }: DailySummaryCardProps) {
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchScore = useCallback(async () => {
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/health-score", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) return
      const result = await res.json()
      setData(result)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) fetchScore()
  }, [userId, fetchScore])

  // Listen for check-in completion to refresh
  useEffect(() => {
    const handler = () => fetchScore()
    window.addEventListener("checkin-complete", handler)
    return () => window.removeEventListener("checkin-complete", handler)
  }, [fetchScore])

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 rounded-lg bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { score, components, weekTrend } = data
  const hasScores = weekTrend.filter(w => w.health_score !== null)
  const prevScore = hasScores.length >= 2 ? hasScores[hasScores.length - 2]?.health_score : null
  const trend = prevScore !== null ? score.total - prevScore : 0

  const greeting = userName
    ? `${tx("summary.hi", lang)}, ${userName.split(" ")[0]}!`
    : `${tx("summary.hi", lang)}!`

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-5">
        {/* Header with greeting */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold">{greeting}</h3>
            <p className="text-xs text-muted-foreground">
              {tx("summary.todayOverview", lang)}
            </p>
          </div>
          <Link href="/calendar">
            <Button variant="ghost" size="sm" className="text-xs">
              {tx("summary.seeAll", lang)} <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* Score circle + breakdown */}
        <div className="flex items-center gap-5">
          {/* Score circle */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="currentColor"
                className="text-primary transition-all duration-1000"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score.total / 100) * 264} 264`}
              />
            </svg>
            <div className="text-center">
              <span className="text-2xl font-bold">{score.total}</span>
              <span className="block text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="flex-1 space-y-2">
            {/* Meds */}
            <div className="flex items-center gap-2 text-xs">
              <Pill className="h-3.5 w-3.5 text-primary" />
              <span className="flex-1 text-muted-foreground">
                {tx("summary.meds", lang)}
              </span>
              <span className="font-medium">
                {components.medsTaken}/{components.medsTotal}
              </span>
            </div>

            {/* Water */}
            <div className="flex items-center gap-2 text-xs">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              <span className="flex-1 text-muted-foreground">
                {tx("summary.water", lang)}
              </span>
              <span className="font-medium">
                {components.waterGlasses}/{components.waterTarget}
              </span>
            </div>

            {/* Check-in status */}
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="flex-1 text-muted-foreground">
                {tx("summary.checkin", lang)}
              </span>
              <span className={`font-medium ${components.hasCheckIn ? "text-primary" : "text-muted-foreground"}`}>
                {components.hasCheckIn ? "✓ " + tx("summary.done", lang) : tx("summary.pending", lang)}
              </span>
            </div>

            {/* Trend */}
            {prevScore !== null && (
              <div className="flex items-center gap-2 text-xs">
                {trend > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="flex-1 text-muted-foreground">
                  {tx("summary.vsYesterday", lang)}
                </span>
                <span className={`font-medium ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-500" : ""}`}>
                  {trend > 0 ? "+" : ""}{trend}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Score label */}
        <div className="mt-3 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">
            {score.emoji} {tx(`summary.label.${score.label}`, lang)}
          </span>
        </div>

        {/* Mini week sparkline */}
        {hasScores.length > 1 && (
          <div className="mt-3 flex items-end gap-1 h-8">
            {weekTrend.map((day, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-primary/20 transition-all"
                style={{
                  height: `${Math.max((day.health_score || 0) / 100 * 100, 4)}%`,
                  backgroundColor: day.health_score && day.health_score >= 60
                    ? "var(--primary)"
                    : day.health_score && day.health_score >= 40
                    ? "var(--gold)"
                    : undefined,
                  opacity: day.health_score ? 0.6 : 0.15,
                }}
                title={`${day.check_date}: ${day.health_score ?? "-"}`}
              />
            ))}
          </div>
        )}

        {/* Check-in CTA or streak */}
        {!components.hasCheckIn ? (
          <div className="mt-3 space-y-2">
            {/* Streak loss warning — Loss Aversion */}
            {data.streak > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 px-3 py-2 animate-pulse">
                <Flame className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                  {lang === "tr"
                    ? `${data.streak} günlük streak'ini kaybetmek üzeresin!`
                    : `You're about to lose your ${data.streak}-day streak!`}
                </span>
              </div>
            )}
            <button
              onClick={() => window.dispatchEvent(new Event("open-checkin"))}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              {tx("summary.doCheckin", lang)}
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400">
              <Flame className="h-4 w-4" />
              <span>{data.streak} {tx("summary.dayStreak", lang)}</span>
            </div>
            {data.streak >= 7 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                🔥 {tx("dailySummary.onFire", lang)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
