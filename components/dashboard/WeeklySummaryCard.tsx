// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock, BarChart3, Share2, Trophy, Droplets, Pill } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { WeeklyShareCard } from "@/components/share/WeeklyShareCard"
import { ShareModal } from "@/components/share/ShareModal"

interface WeeklySummaryCardProps {
  userId: string
  lang: Lang
  isPremium?: boolean
}

interface WeekData {
  avgScore: number
  bestDay: string
  bestScore: number
  totalCheckIns: number
  days: Array<{
    date: string
    score: number | null
    dayName: string
  }>
}

const DAY_NAMES = [
  { en: "Sun", tr: "Paz" },
  { en: "Mon", tr: "Pzt" },
  { en: "Tue", tr: "Sal" },
  { en: "Wed", tr: "Çar" },
  { en: "Thu", tr: "Per" },
  { en: "Fri", tr: "Cum" },
  { en: "Sat", tr: "Cmt" },
]

export function WeeklySummaryCard({ userId, lang, isPremium = false }: WeeklySummaryCardProps) {
  const [data, setData] = useState<WeekData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareCard, setShowShareCard] = useState(false)

  const fetchWeekData = useCallback(async () => {
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: checkIns } = await supabase
        .from("daily_check_ins")
        .select("check_date, health_score")
        .eq("user_id", userId)
        .gte("check_date", weekAgo.toISOString().split("T")[0])
        .order("check_date", { ascending: true })

      if (!checkIns || checkIns.length === 0) {
        setData(null)
        setLoading(false)
        return
      }

      const dayNames = DAY_NAMES.map((d) => d[lang])
      const scores = checkIns.filter(c => c.health_score !== null)
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((s, c) => s + (c.health_score || 0), 0) / scores.length)
        : 0
      const best = scores.reduce((max, c) => (c.health_score || 0) > (max.health_score || 0) ? c : max, scores[0])

      // Build 7-day array
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        const found = checkIns.find(c => c.check_date === dateStr)
        days.push({
          date: dateStr,
          score: found?.health_score ?? null,
          dayName: dayNames[d.getDay()],
        })
      }

      setData({
        avgScore,
        bestDay: best?.check_date ? dayNames[new Date(best.check_date).getDay()] : "-",
        bestScore: best?.health_score || 0,
        totalCheckIns: scores.length,
        days,
      })
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [userId, lang])

  useEffect(() => {
    if (userId) fetchWeekData()
  }, [userId, fetchWeekData])

  if (!isPremium) {
    return (
      <Card className="relative overflow-hidden opacity-75">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">PREMIUM</Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            {tx("weekly.title", lang)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 rounded-lg bg-muted/30" />
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 rounded-lg bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.totalCheckIns === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            {tx("weekly.title", lang)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-4">
            {tx("weekly.noData", lang)}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          {tx("weekly.title", lang)}
          <Badge variant="secondary" className="ml-auto text-[10px]">PREMIUM</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-primary/5 p-2">
            <span className="text-lg font-bold text-primary">{data.avgScore}</span>
            <p className="text-[10px] text-muted-foreground">{tx("weekly.avgScore", lang)}</p>
          </div>
          <div className="rounded-lg bg-amber-500/5 p-2">
            <span className="text-lg font-bold text-amber-600">{data.bestScore}</span>
            <p className="text-[10px] text-muted-foreground">{tx("weekly.bestDay", lang)}</p>
          </div>
          <div className="rounded-lg bg-green-500/5 p-2">
            <span className="text-lg font-bold text-green-600">{data.totalCheckIns}/7</span>
            <p className="text-[10px] text-muted-foreground">{tx("summary.checkin", lang)}</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between gap-1 h-16">
          {data.days.map((day, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-sm transition-all ${
                  day.score !== null && day.score >= 60
                    ? "bg-primary"
                    : day.score !== null
                    ? "bg-amber-400"
                    : "bg-muted/30"
                }`}
                style={{ height: `${Math.max((day.score || 0) / 100 * 100, 4)}%` }}
              />
              <span className="text-[9px] text-muted-foreground">{day.dayName}</span>
            </div>
          ))}
        </div>

        {/* Share button */}
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowShareCard(true)}>
          <Share2 className="mr-2 h-3 w-3" />
          {tx("weekly.share", lang)}
        </Button>
      </CardContent>

      <ShareModal open={showShareCard && !!data} onClose={() => setShowShareCard(false)}>
        {data && (
          <WeeklyShareCard
            lang={lang}
            avgScore={data.avgScore}
            bestScore={data.bestScore}
            totalCheckIns={data.totalCheckIns}
            days={data.days}
          />
        )}
      </ShareModal>
    </Card>
  )
}
