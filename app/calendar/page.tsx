// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDays, Activity, Heart, Loader2, LogIn, Plus, Download,
  Droplets, Pill, Sun, Moon as MoonIcon, Sunset, Check, X,
  Flame, Dumbbell, ChevronLeft, ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { NotificationSettings } from "@/components/pwa/NotificationSettings"
import { PageSkeleton } from "@/components/ui/page-skeleton"
import { InfoTooltip } from "@/components/ui/InfoTooltip"
import { HabitHeatMap } from "@/components/calendar/HabitHeatMap"

const TodayView = lazy(() => import("@/components/calendar/TodayView").then(m => ({ default: m.TodayView })))
const MonthView = lazy(() => import("@/components/calendar/MonthView").then(m => ({ default: m.MonthView })))
const AddVitalDialog = lazy(() => import("@/components/calendar/AddVitalDialog").then(m => ({ default: m.AddVitalDialog })))

interface VitalRecord {
  id: string; user_id: string; vital_type: string; value: number
  systolic?: number; diastolic?: number; notes: string | null; recorded_at: string
}

// ── ICS Export ──
function generateICS(events: Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Doctopal//Calendar//EN", "CALSCALE:GREGORIAN"]
  for (const evt of events) {
    const dateClean = evt.event_date.replace(/-/g, "")
    const dtStart = evt.event_time ? `${dateClean}T${evt.event_time.replace(":", "")}00` : dateClean
    const dtEnd = evt.event_time ? `${dateClean}T${String(parseInt(evt.event_time.split(":")[0]) + 1).padStart(2, "0")}${evt.event_time.split(":")[1]}00` : dateClean
    lines.push("BEGIN:VEVENT", `DTSTART:${dtStart}`, `DTEND:${dtEnd}`, `SUMMARY:${evt.title}`)
    if (evt.description) lines.push(`DESCRIPTION:${evt.description.replace(/\n/g, "\\n")}`)
    lines.push(`CATEGORIES:${evt.event_type}`, `UID:${evt.event_date}-${Math.random().toString(36).slice(2)}@doctopal.com`, "END:VEVENT")
  }
  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

function downloadICS(events: Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>) {
  const ics = generateICS(events)
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a"); a.href = url; a.download = "doctopal-calendar.ics"
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ── Confetti Burst ──
function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null
  const colors = ["#3c7a52", "#6B8F71", "#facc15", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c", "#34d399"]
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10">
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360
        const rad = (angle * Math.PI) / 180
        const tx = Math.cos(rad) * (30 + Math.random() * 20)
        const ty = Math.sin(rad) * (30 + Math.random() * 20)
        return (
          <motion.div
            key={i}
            initial={{ x: "50%", y: "50%", scale: 1, opacity: 1 }}
            animate={{ x: `calc(50% + ${tx}px)`, y: `calc(50% + ${ty}px)`, scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.02 }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors[i % colors.length], left: 0, top: 0 }}
          />
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════
// WEEKLY STRIP — Horizontal 7-day selector
// ══════════════════════════════════════════════════
function WeeklyStripEnhanced({ selectedDate, onSelect, lang }: { selectedDate: Date; onSelect: (d: Date) => void; lang: string }) {
  const today = useMemo(() => new Date(), [])

  const getWeekDays = useCallback((center: Date) => {
    const start = new Date(center)
    const day = start.getDay()
    start.setDate(start.getDate() - ((day + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i); return d
    })
  }, [])

  const [weekOffset, setWeekOffset] = useState(0)
  const days = useMemo(() => {
    const center = new Date(today)
    center.setDate(center.getDate() + weekOffset * 7)
    return getWeekDays(center)
  }, [today, weekOffset, getWeekDays])

  const dayNames: Record<string, string[]> = {
    en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    tr: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
  }

  const monthLabel = useMemo(() => {
    const d = days[3] || today
    return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "long", year: "numeric" })
  }, [days, lang, today])

  return (
    <div className="space-y-3">
      {/* Month header with navigation */}
      <div className="flex items-center justify-between px-1">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setWeekOffset(w => w - 1)}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </motion.button>
        <h2 className="text-sm font-semibold text-foreground capitalize">{monthLabel}</h2>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setWeekOffset(w => w + 1)}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Day pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {days.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString()
          const isSelected = d.toDateString() === selectedDate.toDateString()
          return (
            <motion.button key={d.toISOString()} whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center gap-1 min-w-[48px] rounded-2xl py-3 px-2.5 transition-all duration-200 ${
                isSelected
                  ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                  : isToday
                  ? "bg-primary/10 ring-1 ring-primary/20"
                  : "hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}>
              <span className={`text-[10px] font-medium uppercase ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                {dayNames[lang]?.[i] || dayNames.en[i]}
              </span>
              <span className={`text-lg font-bold leading-none ${isSelected ? "text-white" : "text-foreground"}`}>
                {d.getDate()}
              </span>
              {isToday && !isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// HABIT RINGS — Apple Watch style circular SVG
// ══════════════════════════════════════════════════
function CircularRing({ emoji, label, current, total, color }: {
  emoji: string; label: string; current: number; total: number; color: string
}) {
  const percent = Math.min((current / total) * 100, 100)
  const r = 26; const c = 2 * Math.PI * r; const offset = c - (percent / 100) * c
  const isDone = current >= total

  return (
    <motion.div className="flex flex-col items-center gap-1.5"
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}>
      <div className="relative">
        <svg width={64} height={64} className="transform -rotate-90">
          <circle cx={32} cy={32} r={r} stroke="currentColor" strokeWidth={5} fill="none"
            className="text-stone-200 dark:text-stone-700" />
          <motion.circle cx={32} cy={32} r={r} stroke={color} strokeWidth={5} fill="none"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base">{emoji}</span>
        {isDone && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
            <Check className="h-2.5 w-2.5 text-white" />
          </motion.div>
        )}
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      <span className={`text-[10px] font-bold ${isDone ? "text-emerald-500" : "text-foreground"}`}>{current}/{total}</span>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════
// TIME BLOCK — Circadian rhythm task groups
// ══════════════════════════════════════════════════
interface DailyTask {
  id: string; label: string; done: boolean; emoji: string
}

function TimeBlockEnhanced({ icon, title, tasks, onToggle, onAdd, isCurrent, hours, lang }: {
  icon: React.ReactNode; title: string; tasks: DailyTask[]
  onToggle: (id: string) => void; onAdd: () => void; isCurrent: boolean; hours: string; lang: string
}) {
  const [confettiId, setConfettiId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task && !task.done) {
      setConfettiId(id)
      setTimeout(() => setConfettiId(null), 700)
    }
    onToggle(id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 transition-all ${
        isCurrent
          ? "border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm"
          : "bg-white dark:bg-card border-stone-200/60 dark:border-stone-800"
      }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {isCurrent && (
            <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary px-1.5 py-0 animate-pulse">
              {lang === "tr" ? "Şimdi" : "Now"}
            </Badge>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{hours}</span>
      </div>

      <div className="space-y-1.5">
        {tasks.length === 0 ? (
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onAdd}
            className="w-full flex items-center gap-2 py-3 px-3 rounded-xl border border-dashed border-primary/20 text-xs text-muted-foreground/60 hover:border-primary/40 hover:text-muted-foreground transition-colors">
            <Plus className="h-3 w-3" />
            {lang === "tr" ? `${title.split(" ")[0]} takviyesi ekle` : `Add to ${title.split(" ")[0]}`}
          </motion.button>
        ) : (
          tasks.map((t, i) => (
            <motion.button key={t.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }} onClick={() => handleToggle(t.id)}
              className={`relative w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-left transition-all ${
                t.done
                  ? "bg-stone-50 dark:bg-stone-900/50 opacity-60"
                  : "bg-white dark:bg-card hover:bg-stone-50 dark:hover:bg-stone-900 hover:-translate-y-0.5 hover:shadow-sm"
              }`}>
              <motion.div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all shrink-0 ${
                  t.done ? "bg-emerald-500 border-emerald-500" : "border-stone-300 dark:border-stone-600"
                }`}
                animate={t.done ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}>
                {t.done && <Check className="h-3 w-3 text-white" />}
              </motion.div>
              <span className="text-sm">{t.emoji}</span>
              <span className={`text-sm flex-1 transition-all duration-300 ${t.done ? "line-through text-muted-foreground/40" : "font-medium"}`}>
                {t.label}
              </span>
              {t.done && (
                <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }} className="text-xs">
                  ✨
                </motion.span>
              )}
              <ConfettiBurst show={confettiId === t.id} />
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════
// QUICK LOG FAB — Sage-green floating action button
// ══════════════════════════════════════════════════
function QuickLogFABEnhanced({ onAction, lang }: { onAction: (type: string) => void; lang: string }) {
  const [open, setOpen] = useState(false)
  const items = [
    { type: "water", emoji: "💧", label: lang === "tr" ? "Su İçtim" : "Drank Water", color: "bg-blue-500" },
    { type: "pain", emoji: "🤕", label: lang === "tr" ? "Ağrı Kaydet" : "Log Pain", color: "bg-amber-500" },
    { type: "med", emoji: "💊", label: lang === "tr" ? "İlacımı Aldım" : "Took Medication", color: "bg-primary" },
  ]

  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && items.map((item, i) => (
          <motion.button key={item.type}
            initial={{ opacity: 0, y: 16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.8 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
            onClick={() => { onAction(item.type); setOpen(false) }}
            className={`flex items-center gap-2 rounded-full ${item.color} text-white shadow-lg px-4 py-2.5 text-sm font-medium hover:brightness-110 active:scale-95 transition-all`}>
            <span>{item.emoji}</span> {item.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-700 text-white shadow-xl shadow-primary/25 transition-colors">
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <X className="h-5 w-5" /> : <Plus className="h-6 w-6" />}
        </motion.div>
      </motion.button>
    </div>
  )
}

// ══════════════════════════════════════════════════
// VITAL HELPERS
// ══════════════════════════════════════════════════
function VitalIcon({ type }: { type: string }) {
  switch (type) {
    case "blood_pressure": return <Heart className="h-4 w-4 text-rose-500" />
    case "blood_sugar": return <Activity className="h-4 w-4 text-amber-500" />
    case "weight": return <Activity className="h-4 w-4 text-blue-500" />
    case "heart_rate": return <Heart className="h-4 w-4 text-red-500" />
    default: return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

function formatVitalValue(vital: VitalRecord, lang: string): string {
  switch (vital.vital_type) {
    case "blood_pressure": return `${vital.systolic ?? vital.value}/${vital.diastolic ?? "?"} mmHg`
    case "blood_sugar": return `${vital.value} mg/dL`
    case "weight": return `${vital.value} kg`
    case "heart_rate": return `${vital.value} bpm`
    default: return String(vital.value)
  }
}

// ══════════════════════════════════════════════════
// DAILY PROGRESS SUMMARY
// ══════════════════════════════════════════════════
function DailyProgressCard({ completed, total, lang }: { completed: number; total: number; lang: string }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const r = 36; const c = 2 * Math.PI * r; const offset = c - (pct / 100) * c
  const allDone = pct === 100

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-5 ${allDone
        ? "bg-gradient-to-br from-emerald-50 to-primary/5 dark:from-emerald-900/20 dark:to-primary/10 border border-emerald-200/50"
        : "bg-white dark:bg-card border border-stone-200/60 dark:border-stone-800"
      }`}>
      <div className="flex items-center gap-5">
        {/* Circular progress */}
        <div className="relative shrink-0">
          <svg width={84} height={84} className="transform -rotate-90">
            <circle cx={42} cy={42} r={r} stroke="currentColor" strokeWidth={6} fill="none"
              className="text-stone-200 dark:text-stone-700" />
            <motion.circle cx={42} cy={42} r={r} strokeWidth={6} fill="none"
              strokeLinecap="round" strokeDasharray={c}
              stroke={allDone ? "#22c55e" : "#3c7a52"}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-xl font-bold text-foreground"
              key={pct} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              {pct}%
            </motion.span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground">
            {allDone
              ? (lang === "tr" ? "Harika! Tüm görevler tamam!" : "Amazing! All tasks complete!")
              : (lang === "tr" ? "Günlük İlerleme" : "Daily Progress")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === "tr"
              ? `${completed}/${total} görev tamamlandı`
              : `${completed}/${total} tasks completed`}
          </p>
          {allDone && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-1 mt-2">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {lang === "tr" ? "Seri devam ediyor!" : "Streak going!"}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════
export default function CalendarPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, profile } = useAuth()
  const { lang } = useLang()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeView, setActiveView] = useState<"today" | "month" | "vitals">("today")
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [vitalsLoading, setVitalsLoading] = useState(false)
  const [addVitalOpen, setAddVitalOpen] = useState(false)
  const [allEvents, setAllEvents] = useState<Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>>([])

  // Current time block detection
  const currentBlock = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return "morning"
    if (h < 18) return "noon"
    return "night"
  }, [])

  // Mock daily tasks organized by circadian time blocks
  const [morningTasks, setMorningTasks] = useState<DailyTask[]>([
    { id: "m1", label: lang === "tr" ? "D3 Vitamini" : "Vitamin D3", done: false, emoji: "☀️" },
    { id: "m2", label: lang === "tr" ? "Probiyotik" : "Probiotic", done: false, emoji: "🌿" },
    { id: "m3", label: lang === "tr" ? "1 bardak su" : "1 glass water", done: false, emoji: "💧" },
  ])
  const [noonTasks, setNoonTasks] = useState<DailyTask[]>([
    { id: "n1", label: "Omega-3", done: false, emoji: "🐟" },
    { id: "n2", label: lang === "tr" ? "2 bardak su" : "2 glasses water", done: false, emoji: "💧" },
  ])
  const [nightTasks, setNightTasks] = useState<DailyTask[]>([
    { id: "e1", label: lang === "tr" ? "Magnezyum" : "Magnesium", done: false, emoji: "🌙" },
    { id: "e2", label: lang === "tr" ? "Kediotu çayı" : "Valerian tea", done: false, emoji: "🍵" },
  ])

  const toggleTask = useCallback((id: string) => {
    const update = (tasks: DailyTask[]) => tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setMorningTasks(prev => update(prev))
    setNoonTasks(prev => update(prev))
    setNightTasks(prev => update(prev))
  }, [])

  const allTasks = useMemo(() => [...morningTasks, ...noonTasks, ...nightTasks], [morningTasks, noonTasks, nightTasks])
  const completedTasks = allTasks.filter(t => t.done).length
  const waterDone = allTasks.filter(t => t.done && t.emoji === "💧").length
  const medsDone = allTasks.filter(t => t.done && (t.emoji === "💊" || t.emoji === "🌿" || t.emoji === "🐟" || t.emoji === "🌙" || t.emoji === "☀️" || t.emoji === "🍵")).length
  const totalMeds = allTasks.filter(t => t.emoji !== "💧").length

  const fetchAllEvents = useCallback(async () => {
    if (!profile?.id) return
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.from("calendar_events")
        .select("title, event_date, event_time, description, event_type")
        .eq("user_id", profile.id).order("event_date", { ascending: true }).limit(500)
      if (data) setAllEvents(data)
    } catch { /* ignore */ }
  }, [profile?.id])

  const fetchVitals = useCallback(async () => {
    if (!profile?.id) return
    setVitalsLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.from("vital_records")
        .select("*").eq("user_id", profile.id).order("recorded_at", { ascending: false }).limit(20)
      if (data) setVitals(data as VitalRecord[])
    } catch { /* ignore */ } finally { setVitalsLoading(false) }
  }, [profile?.id])

  useEffect(() => {
    if (profile?.id) { Promise.all([fetchAllEvents(), fetchVitals()]) }
  }, [profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) return <PageSkeleton />
  if (!isAuthenticated || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card><CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="font-heading text-2xl font-bold italic">{tx("cal.title", lang)}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{tx("cal.signInPrompt", lang)}</p>
          <Button onClick={() => router.push("/auth/login")}><LogIn className="mr-2 h-4 w-4" />{tx("cal.signIn", lang)}</Button>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-5">

        {/* ═══ PAGE HEADER ═══ */}
        <div className="flex items-center gap-2 px-1">
          <h1 className="font-heading text-2xl font-bold italic">{tx("cal.title", lang)}</h1>
          <InfoTooltip title="Habit & Healing Map" description="Track daily supplements, water intake, and health habits. Build streaks to stay motivated." />
        </div>

        {/* ═══ WEEKLY STRIP ═══ */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-card rounded-2xl border border-stone-200/60 dark:border-stone-800 p-4 shadow-sm">
          <WeeklyStripEnhanced selectedDate={selectedDate} onSelect={setSelectedDate} lang={lang} />
        </motion.div>

        {/* ═══ HABIT HEAT MAP ═══ */}
        <HabitHeatMap lang={lang} />

        {/* ═══ DAILY PROGRESS ═══ */}
        <DailyProgressCard completed={completedTasks} total={allTasks.length} lang={lang} />

        {/* ═══ HABIT RINGS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex justify-center gap-5 py-1">
          <CircularRing emoji="💧" label={lang === "tr" ? "Su" : "Water"} current={waterDone + 3} total={8} color="#3b82f6" />
          <CircularRing emoji="💊" label={lang === "tr" ? "İlaçlar" : "Meds"} current={1} total={2} color="#3c7a52" />
          <CircularRing emoji="🌿" label={lang === "tr" ? "Takviye" : "Supps"} current={medsDone} total={totalMeds} color="#6B8F71" />
          <CircularRing emoji="🚶" label={lang === "tr" ? "Hareket" : "Move"} current={1} total={3} color="#f59e0b" />
        </motion.div>

        {/* ═══ VIEW SWITCHER ═══ */}
        <div className="flex gap-1 bg-white dark:bg-card rounded-xl border p-1">
          {(["today", "month", "vitals"] as const).map(view => (
            <motion.button key={view} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(view)}
              className={`relative flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                activeView === view ? "text-white" : "text-muted-foreground hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}>
              {activeView === view && (
                <motion.div layoutId="calViewTab" className="absolute inset-0 bg-primary rounded-lg shadow"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className="relative z-10">
                {view === "today" ? (lang === "tr" ? "Bugün" : "Today") :
                 view === "month" ? (lang === "tr" ? "Takvim" : "Calendar") :
                 (lang === "tr" ? "Vitaller" : "Vitals")}
              </span>
            </motion.button>
          ))}
        </div>

        {/* ═══ TODAY VIEW: Circadian Time Blocks ═══ */}
        <AnimatePresence mode="wait">
          {activeView === "today" && (
            <motion.div key="today" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">

              <TimeBlockEnhanced
                icon={<Sun className="h-4 w-4 text-amber-500" />}
                title={lang === "tr" ? "Sabah Rutini" : "Morning Routine"}
                tasks={morningTasks} onToggle={toggleTask} onAdd={() => {}}
                isCurrent={currentBlock === "morning"} hours="06:00–12:00" lang={lang} />

              <TimeBlockEnhanced
                icon={<Sunset className="h-4 w-4 text-orange-500" />}
                title={lang === "tr" ? "Öğle" : "Afternoon"}
                tasks={noonTasks} onToggle={toggleTask} onAdd={() => {}}
                isCurrent={currentBlock === "noon"} hours="12:00–18:00" lang={lang} />

              <TimeBlockEnhanced
                icon={<MoonIcon className="h-4 w-4 text-indigo-400" />}
                title={lang === "tr" ? "Akşam Ritüeli" : "Evening Wind-Down"}
                tasks={nightTasks} onToggle={toggleTask} onAdd={() => {}}
                isCurrent={currentBlock === "night"} hours="18:00–00:00" lang={lang} />

              {/* Existing TodayView integration */}
              <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
                <TodayView userId={profile.id} lang={lang} userName={profile.full_name}
                  userWeight={profile.weight_kg} userHeight={profile.height_cm} userSupplements={profile.supplements} />
              </Suspense>
            </motion.div>
          )}

          {activeView === "month" && (
            <motion.div key="month" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
                <MonthView userId={profile.id} lang={lang} />
              </Suspense>
              {allEvents.length > 0 && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full rounded-xl h-11" onClick={() => downloadICS(allEvents)}>
                    <Download className="h-4 w-4 mr-2" />{tx("cal.exportIcs", lang)}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {activeView === "vitals" && (
            <motion.div key="vitals" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{tx("cal.recentVitals", lang)}</h3>
                <Button size="sm" onClick={() => setAddVitalOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />{tx("cal.addVital", lang)}
                </Button>
              </div>
              {vitalsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : vitals.length === 0 ? (
                <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <Activity className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">{tx("cal.noVitals", lang)}</p>
                  <Button variant="outline" size="sm" onClick={() => setAddVitalOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />{tx("cal.addVital", lang)}
                  </Button>
                </CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {vitals.map(vital => {
                    const d = new Date(vital.recorded_at)
                    return (
                      <motion.div key={vital.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <Card><CardContent className="flex items-center gap-4 py-3 px-4">
                          <VitalIcon type={vital.vital_type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{tx(`cal.vitalType.${vital.vital_type}`, lang)}</span>
                              <Badge variant="secondary" className="text-xs font-mono">{formatVitalValue(vital, lang)}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {d.toLocaleDateString(tx("common.locale", lang), { day: "numeric", month: "short" })} {d.toLocaleTimeString(tx("common.locale", lang), { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </CardContent></Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}
              {addVitalOpen && (
                <Suspense fallback={null}>
                  <AddVitalDialog userId={profile.id} lang={lang} open={addVitalOpen}
                    onOpenChange={setAddVitalOpen} onSaved={() => fetchVitals()} />
                </Suspense>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Settings */}
        <NotificationSettings />
      </div>

      {/* ═══ Quick Log FAB ═══ */}
      <QuickLogFABEnhanced onAction={() => { /* handle quick log */ }} lang={lang} />
    </div>
  )
}
