// © 2026 Doctopal — All Rights Reserved
"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface HabitHeatMapProps {
  lang: string
}

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

function generateMockData(): number[] {
  // 84 days (12 weeks), weekdays denser
  const seed = 42
  return Array.from({ length: 84 }, (_, i) => {
    const dayOfWeek = i % 7
    const isWeekend = dayOfWeek >= 5
    // Pseudo-random but deterministic
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

export function HabitHeatMap({ lang }: HabitHeatMapProps) {
  const isTr = lang === "tr"
  const data = useMemo(() => generateMockData(), [])

  // Calculate current streak (from end)
  const streak = useMemo(() => {
    let s = 0
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i] > 0) s++
      else break
    }
    return s
  }, [data])

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
      className="rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-card p-4 shadow-sm"
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

      {/* Day labels */}
      <div className="flex gap-1 mb-1 ml-0">
        <div className="grid grid-rows-7 gap-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="h-4 w-5 text-[9px] text-muted-foreground flex items-center">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-hide">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-rows-7 gap-1 shrink-0">
              {week.map((count, di) => (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.003, duration: 0.2 }}
                  className={`h-4 w-4 rounded-sm ${getColor(count)}`}
                  title={`${count} ${isTr ? "aktivite" : "activities"}`}
                />
              ))}
            </div>
          ))}
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
