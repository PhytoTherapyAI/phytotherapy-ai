// © 2026 Doctopal — All Rights Reserved
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Activity,
  Loader2,
  FlaskConical,
  Shield,
  Droplets,
  Moon,
  Zap,
} from "lucide-react"

interface AnalyticsData {
  queriesByWeek: { week: string; count: number }[]
  checkInTrends: { date: string; energy: number; sleep: number; mood: number }[]
  topInteractions: { medication: string; count: number }[]
  totalQueries: number
  totalCheckIns: number
  avgEnergy: number
  avgSleep: number
  avgMood: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

  const fetchAnalytics = useCallback(async () => {
    if (!user) return
    const supabase = createBrowserClient()
    setLoading(true)

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString()

    const [queries, checkIns] = await Promise.all([
      supabase
        .from("query_history")
        .select("query_type, created_at")
        .eq("user_id", user.id)
        .gte("created_at", sinceStr)
        .order("created_at", { ascending: true }),
      supabase
        .from("daily_check_ins")
        .select("check_date, energy_level, sleep_quality, mood")
        .eq("user_id", user.id)
        .gte("check_date", sinceStr.split("T")[0])
        .order("check_date", { ascending: true }),
    ])

    const queryData = queries.data || []
    const checkInData = checkIns.data || []

    // Group queries by week
    const weekMap: Record<string, number> = {}
    for (const q of queryData) {
      const date = new Date(q.created_at)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const key = weekStart.toISOString().split("T")[0]
      weekMap[key] = (weekMap[key] || 0) + 1
    }
    const queriesByWeek = Object.entries(weekMap).map(([week, count]) => ({ week, count }))

    // Check-in trends
    const checkInTrends = checkInData.map((c: { check_date: string; energy_level: number | null; sleep_quality: number | null; mood: number | null }) => ({
      date: c.check_date,
      energy: c.energy_level || 0,
      sleep: c.sleep_quality || 0,
      mood: c.mood || 0,
    }))

    // Averages
    const avgEnergy = checkInData.length > 0 ? checkInData.reduce((a: number, c: { energy_level: number | null }) => a + (c.energy_level || 0), 0) / checkInData.length : 0
    const avgSleep = checkInData.length > 0 ? checkInData.reduce((a: number, c: { sleep_quality: number | null }) => a + (c.sleep_quality || 0), 0) / checkInData.length : 0
    const avgMood = checkInData.length > 0 ? checkInData.reduce((a: number, c: { mood: number | null }) => a + (c.mood || 0), 0) / checkInData.length : 0

    setData({
      queriesByWeek,
      checkInTrends,
      topInteractions: [],
      totalQueries: queryData.length,
      totalCheckIns: checkInData.length,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgMood: Math.round(avgMood * 10) / 10,
    })
    setLoading(false)
  }, [user, period])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) fetchAnalytics()
  }, [user, fetchAnalytics])

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {tx("analytics.title", lang)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{tx("analytics.subtitle", lang)}</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "7d" ? "7D" : p === "30d" ? "30D" : "90D"}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <>
          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <MiniStat icon={<FlaskConical className="h-4 w-4 text-blue-500" />} value={data.totalQueries} label={tx("analytics.queries", lang)} />
            <MiniStat icon={<Calendar className="h-4 w-4 text-purple-500" />} value={data.totalCheckIns} label={tx("analytics.checkIns", lang)} />
            <MiniStat icon={<Zap className="h-4 w-4 text-amber-500" />} value={data.avgEnergy} label={tx("analytics.avgEnergy", lang)} suffix="/5" />
            <MiniStat icon={<Moon className="h-4 w-4 text-indigo-500" />} value={data.avgSleep} label={tx("analytics.avgSleep", lang)} suffix="/5" />
            <MiniStat icon={<Activity className="h-4 w-4 text-green-500" />} value={data.avgMood} label={tx("analytics.avgMood", lang)} suffix="/5" />
          </div>

          {/* Query Activity Chart (simple bar) */}
          <div className="mb-6 rounded-xl border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <BarChart3 className="h-5 w-5 text-primary" />
              {tx("analytics.weeklyActivity", lang)}
            </h3>
            {data.queriesByWeek.length > 0 ? (
              <div className="flex items-end gap-2 h-32">
                {data.queriesByWeek.map((w) => {
                  const maxCount = Math.max(...data.queriesByWeek.map((x) => x.count))
                  const height = maxCount > 0 ? (w.count / maxCount) * 100 : 0
                  return (
                    <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] font-medium text-muted-foreground">{w.count}</span>
                      <div className="w-full rounded-t bg-primary/20" style={{ height: `${height}%`, minHeight: "4px" }}>
                        <div className="h-full w-full rounded-t bg-primary transition-all" />
                      </div>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(w.week).toLocaleDateString(tx("common.locale", lang), { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {tx("analytics.noData", lang)}
              </p>
            )}
          </div>

          {/* Check-in Trends */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              {tx("analytics.checkInTrends", lang)}
            </h3>
            {data.checkInTrends.length > 0 ? (
              <div className="space-y-3">
                {data.checkInTrends.slice(-7).map((c) => (
                  <div key={c.date} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-muted-foreground">
                      {new Date(c.date).toLocaleDateString(tx("common.locale", lang), { month: "short", day: "numeric" })}
                    </span>
                    <div className="flex flex-1 gap-2">
                      <MetricBar value={c.energy} max={5} color="bg-amber-400" label="E" />
                      <MetricBar value={c.sleep} max={5} color="bg-indigo-400" label="S" />
                      <MetricBar value={c.mood} max={5} color="bg-green-400" label="M" />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 pt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-400" /> {tx("analytics.energy", lang)}</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-indigo-400" /> {tx("analytics.sleep", lang)}</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-green-400" /> {tx("analytics.mood", lang)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {tx("analytics.noCheckInData", lang)}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function MiniStat({ icon, value, label, suffix }: { icon: React.ReactNode; value: number; label: string; suffix?: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-muted">{icon}</div>
      <p className="text-lg font-bold">{value}{suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

function MetricBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex flex-1 items-center gap-1">
      <span className="w-3 text-[9px] text-muted-foreground">{label}</span>
      <div className="h-3 flex-1 rounded-full bg-muted">
        <div className={`h-3 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-4 text-right text-[10px] font-medium">{value}</span>
    </div>
  )
}
