// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { createBrowserClient } from "@/lib/supabase"

interface HabitHeatMapProps {
  lang: string
  userId?: string
  streak?: number
}

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

function generateMockData(): number[] {
  return Array.from({ length: 84 }, (_, i) => {
    const dayOfWeek = i % 7
    const isWeekend = dayOfWeek >= 5
    const rand = ((i * 2654435761) >>> 0) / 4294967296
    if (isWeekend) return rand < 0.3 ? Math.floor(rand * 3) : 0
    return rand < 0.6 ? Math.floor(rand * 5) : 0
  })
}

function getColor(count: number): string {
  if (count === 0) return "bg-slate-100 dark:bg-slate-800"
  if (count === 1) return "bg-emerald-200 dark:bg-emerald-900"
  if (count <= 3) return "bg-emerald-400 dark:bg-emerald-600"
  return "bg-emerald-600 dark:bg-emerald-400"
}

export function HabitHeatMap({ lang, userId, streak: streakProp }: HabitHeatMapProps) {
  const isTr = lang === "tr"
  const [data, setData] = useState<number[]>(() => Array.from({ length: 84 }, () => 0))
  const [realStreak, setRealStreak] = useState<number | null>(null)

  // Fetch real check-in data from Supabase
  useEffect(() => {
    if (!userId) return
    const fetchData = async () => {
      try {
        const supabase = createBrowserClient()
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        // Fetch both check-ins and daily logs for comprehensive data
        const [checkInsRes, logsRes] = await Promise.all([
          supabase
            .from("daily_check_ins")
            .select("check_date")
            .eq("user_id", userId)
            .gte("check_date", ninetyDaysAgo.toISOString().split("T")[0]),
          supabase
            .from("daily_logs")
            .select("log_date")
            .eq("user_id", userId)
            .eq("completed", true)
            .gte("log_date", ninetyDaysAgo.toISOString().split("T")[0]),
        ])
        const checkIns = checkInsRes.data
        const logs = logsRes.data

        const activeDates = new Set<string>()
        checkIns?.forEach((c: { check_date: string }) => activeDates.add(c.check_date))
        logs?.forEach((l: { log_date: string }) => activeDates.add(l.log_date))

        if (activeDates.size > 0) {

          // Map last 84 days to counts (0 or 1)
          const today = new Date()
          const newData = Array.from({ length: 84 }, (_, i) => {
            const d = new Date(today)
            d.setDate(d.getDate() - (83 - i))
            const dateStr = d.toISOString().split("T")[0]
            return activeDates.has(dateStr) ? 1 : 0
          })
          setData(newData)

          // Calculate streak: consecutive days from today backwards
          let s = 0
          for (let i = newData.length - 1; i >= 0; i--) {
            if (newData[i] > 0) s++
            else break
          }
          setRealStreak(s)
        } else {
          setData(Array.from({ length: 84 }, () => 0))
          setRealStreak(0)
        }
      } catch {
        setData(Array.from({ length: 84 }, () => 0))
        setRealStreak(0)
      }
    }
    fetchData()
  }, [userId])

  const streak = streakProp ?? (realStreak ?? (() => {
    let s = 0
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i] > 0) s++
      else break
    }
    return s
  })())

  // Split into weeks
  const weeks = useMemo(() => {
    const w: number[][] = []
    for (let i = 0; i < data.length; i += 7) {
      w.push(data.slice(i, i + 7))
    }
    return w
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-card p-4 shadow-sm max-w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <h3 className="text-sm font-semibold">
            {isTr ? `${streak} Günlük Seri` : `${streak}-Day Streak`}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {isTr ? "Son 84 gün" : "Last 84 days"}
        </p>
      </div>

      {/* Day labels + grid */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 mb-1 min-w-0">
          <div className="grid grid-rows-7 gap-1 shrink-0">
            {DAY_LABELS.map((d) => (
              <div key={d} className="h-3.5 w-5 text-[9px] text-muted-foreground flex items-center">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-rows-7 gap-1 shrink-0">
                {week.map((count, di) => (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.003, duration: 0.2 }}
                    className={`h-3.5 w-3.5 rounded-sm ${getColor(count)}`}
                    title={`${count} ${isTr ? "aktivite" : "activities"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px] text-muted-foreground">{isTr ? "Az" : "Less"}</span>
        {["bg-slate-100 dark:bg-slate-800", "bg-emerald-200 dark:bg-emerald-900", "bg-emerald-400 dark:bg-emerald-600", "bg-emerald-600 dark:bg-emerald-400"].map((cls, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-muted-foreground">{isTr ? "Çok" : "More"}</span>
      </div>
    </motion.div>
  )
}
