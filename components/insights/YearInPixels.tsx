// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"

type MetricType = "overall" | "mood" | "energy" | "sleep"

const FILTERS: { id: MetricType; emoji: string; en: string; tr: string }[] = [
  { id: "overall", emoji: "🫀", en: "Overall Health", tr: "Genel Sağlık" },
  { id: "mood", emoji: "😊", en: "Mood", tr: "Ruh Hali" },
  { id: "energy", emoji: "⚡", en: "Energy", tr: "Enerji" },
  { id: "sleep", emoji: "😴", en: "Sleep", tr: "Uyku" },
]

const SCORE_COLORS = [
  "bg-slate-100 dark:bg-slate-800",      // 0 = no data
  "bg-red-300 dark:bg-red-700",           // 1
  "bg-amber-300 dark:bg-amber-600",       // 2-3
  "bg-emerald-300 dark:bg-emerald-600",   // 4
  "bg-emerald-600 dark:bg-emerald-500",   // 5
]

const SCORE_LABELS = {
  en: ["No data", "Rough day", "Below average", "Average", "Good day", "Great day"],
  tr: ["Veri yok", "Zor gün", "Ortanın altı", "Ortalama", "İyi gün", "Harika gün"],
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]
const DAYS_EN = ["", "Mon", "", "Wed", "", "Fri", ""]
const DAYS_TR = ["", "Pzt", "", "Çar", "", "Cum", ""]

function generateMockData(): Record<string, Record<MetricType, number>> {
  const data: Record<string, Record<MetricType, number>> = {}
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const base = isWeekend ? 4 : 3
    const rand = () => Math.max(0, Math.min(5, base + Math.floor(Math.random() * 3) - 1))
    // ~15% chance of no data
    if (Math.random() < 0.15 && i > 30) {
      data[key] = { overall: 0, mood: 0, energy: 0, sleep: 0 }
    } else {
      data[key] = { overall: rand(), mood: rand(), energy: rand(), sleep: rand() }
    }
  }
  return data
}

interface Props { lang: "en" | "tr" }

export function YearInPixels({ lang }: Props) {
  const [metric, setMetric] = useState<MetricType>("overall")
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const isTr = lang === "tr"

  const mockData = useMemo(() => generateMockData(), [])
  const months = isTr ? MONTHS_TR : MONTHS_EN
  const dayLabels = isTr ? DAYS_TR : DAYS_EN

  // Build 52 weeks × 7 days grid
  const weeks = useMemo(() => {
    const result: { date: Date; key: string; score: number }[][] = []
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 363)
    // Align to Monday
    while (start.getDay() !== 1) start.setDate(start.getDate() - 1)

    let currentWeek: { date: Date; key: string; score: number }[] = []
    const d = new Date(start)
    while (d <= today) {
      const key = d.toISOString().split("T")[0]
      const dayData = mockData[key]
      currentWeek.push({ date: new Date(d), key, score: dayData?.[metric] || 0 })
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
      d.setDate(d.getDate() + 1)
    }
    if (currentWeek.length > 0) result.push(currentWeek)
    return result
  }, [mockData, metric])

  const getColor = (score: number) => {
    if (score === 0) return SCORE_COLORS[0]
    if (score <= 1) return SCORE_COLORS[1]
    if (score <= 3) return SCORE_COLORS[2]
    if (score === 4) return SCORE_COLORS[3]
    return SCORE_COLORS[4]
  }

  return (
    <div className="rounded-2xl border bg-white dark:bg-card p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-bold flex items-center gap-2">
          🎨 {isTr ? "Piksel Yılınız" : "Your Year in Pixels"}
        </h3>
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setMetric(f.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                metric === f.id ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}>
              {f.emoji} {isTr ? f.tr : f.en}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1 pt-4">
            {dayLabels.map((d, i) => (
              <span key={i} className="h-2.5 md:h-3 text-[8px] text-muted-foreground leading-none flex items-center">{d}</span>
            ))}
          </div>
          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {/* Month label on first day of month */}
              <span className="h-3 text-[8px] text-muted-foreground leading-none">
                {week[0]?.date.getDate() <= 7 ? months[week[0].date.getMonth()] : ""}
              </span>
              {week.map((day) => (
                <motion.div key={day.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: wi * 0.01 }}
                  onMouseEnter={() => setHoveredDay(day.key)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm ${getColor(day.score)} cursor-pointer transition-transform hover:scale-150 relative`}>
                  {hoveredDay === day.key && day.score > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-lg bg-slate-900 text-white px-2.5 py-1.5 text-[10px] shadow-lg pointer-events-none">
                      <p className="font-semibold">{day.date.toLocaleDateString(isTr ? "tr-TR" : "en-US", { month: "short", day: "numeric" })}</p>
                      <p>{SCORE_LABELS[isTr ? "tr" : "en"][day.score]} ({day.score}/5)</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[9px] text-muted-foreground">{isTr ? "Az" : "Less"}</span>
        {SCORE_COLORS.map((c, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
        ))}
        <span className="text-[9px] text-muted-foreground">{isTr ? "Çok" : "More"}</span>
      </div>
    </div>
  )
}
