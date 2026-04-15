// © 2026 DoctoPal — All Rights Reserved
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
import { parseMedDoses, buildMedItemId, buildMedLabel } from "@/lib/med-dose-utils"
import { getSupplementDisplayName } from "@/lib/supplement-data"
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
    const dtEnd = evt.event_time ? `${dateClean}T${String(parseInt(evt.event_time.split(":")[0], 10) + 1).padStart(2, "0")}${evt.event_time.split(":")[1]}00` : dateClean
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
    // Use local date to avoid timezone/DST issues
    const d = new Date(center.getFullYear(), center.getMonth(), center.getDate())
    const dow = d.getDay() // 0=Sun, 1=Mon...
    const diffToMon = dow === 0 ? 6 : dow - 1
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diffToMon)
    return Array.from({ length: 7 }, (_, i) => {
      return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
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
      <div className="grid grid-cols-7 gap-1 pb-1">
        {days.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString()
          const isSelected = d.toDateString() === selectedDate.toDateString()
          return (
            <motion.button key={d.toISOString()} whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center gap-1 rounded-2xl py-3 px-1 transition-all duration-200 ${
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
    <motion.div className="flex flex-col items-center gap-1 min-w-0 flex-1"
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}>
      <div className="relative">
        <svg width={56} height={56} viewBox="0 0 64 64" className="transform -rotate-90">
          <circle cx={32} cy={32} r={r} stroke="currentColor" strokeWidth={5} fill="none"
            className="text-stone-200 dark:text-stone-700" />
          <motion.circle cx={32} cy={32} r={r} stroke={color} strokeWidth={5} fill="none"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm">{emoji}</span>
        {isDone && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
            <Check className="h-2 w-2 text-white" />
          </motion.div>
        )}
      </div>
      <span className="text-[9px] font-medium text-muted-foreground truncate max-w-full">{label}</span>
      <span className={`text-[9px] font-bold ${isDone ? "text-emerald-500" : "text-foreground"}`}>{current}/{total}</span>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════
// TIME BLOCK — Circadian rhythm task groups
// ══════════════════════════════════════════════════
interface DailyTask {
  id: string; label: string; done: boolean; emoji: string
}

function TimeBlockEnhanced({ icon, title, tasks, onToggle, onAdd, onRemoveTask, onAddCustomTask, isCurrent, hours, lang, blockKey }: {
  icon: React.ReactNode; title: string; tasks: DailyTask[]
  onToggle: (id: string) => void; onAdd: () => void
  onRemoveTask?: (id: string) => void; onAddCustomTask?: (task: DailyTask) => void
  isCurrent: boolean; hours: string; lang: "en" | "tr"; blockKey?: string
}) {
  const [confettiId, setConfettiId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [newTaskLabel, setNewTaskLabel] = useState("")
  const [newTaskEmoji, setNewTaskEmoji] = useState("✨")

  const EMOJI_OPTIONS = ["💊", "🌿", "💧", "🧘", "🏃", "📊", "🍵", "✨"]

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task && !task.done) {
      setConfettiId(id)
      setTimeout(() => setConfettiId(null), 700)
    }
    onToggle(id)
  }

  const handleAddCustom = () => {
    if (!newTaskLabel.trim() || !onAddCustomTask) return
    const id = `custom-${blockKey}-${Date.now()}`
    onAddCustomTask({ id, label: newTaskLabel.trim(), done: false, emoji: newTaskEmoji })
    setNewTaskLabel("")
    setNewTaskEmoji("✨")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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
              {tx("calendar.now", lang)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">{hours}</span>
          {onRemoveTask && (
            <button onClick={() => setEditMode(!editMode)}
              className={`p-1 rounded-md transition-colors ${editMode ? "bg-primary/10 text-primary" : "text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted"}`}>
              {editMode
                ? <Check className="h-3 w-3" />
                : <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              }
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {tasks.length === 0 && !editMode ? (
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onAdd}
            className="w-full flex items-center gap-2 py-3 px-3 rounded-xl border border-dashed border-primary/20 text-xs text-muted-foreground/60 hover:border-primary/40 hover:text-muted-foreground transition-colors">
            <Plus className="h-3 w-3" />
            {lang === "tr" ? `${title.split(" ")[0]} görevi ekle` : `Add to ${title.split(" ")[0]}`}
          </motion.button>
        ) : (
          tasks.map((t, i) => (
            <motion.div key={t.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.97 }} onClick={() => !editMode && handleToggle(t.id)}
                className={`relative flex-1 flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-left transition-all ${
                  editMode ? "opacity-80" :
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
                {t.done && !editMode && (
                  <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300 }} className="text-xs">
                    ✨
                  </motion.span>
                )}
                <ConfettiBurst show={confettiId === t.id} />
              </motion.button>
              {editMode && onRemoveTask && (
                <button onClick={() => onRemoveTask(t.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shrink-0">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </motion.div>
          ))
        )}

        {/* Add custom task input (edit mode) */}
        {editMode && onAddCustomTask && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-dashed">
            <div className="flex gap-0.5">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => setNewTaskEmoji(e)}
                  className={`text-sm p-0.5 rounded ${newTaskEmoji === e ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}>{e}</button>
              ))}
            </div>
            <input value={newTaskLabel} onChange={e => setNewTaskLabel(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddCustom()}
              placeholder={tx("calendar.taskNamePlaceholder", lang)}
              className="flex-1 text-xs bg-transparent border-b border-muted-foreground/20 focus:border-primary outline-none py-1 px-1" />
            <button onClick={handleAddCustom} disabled={!newTaskLabel.trim()}
              className="p-1 rounded-md bg-primary/10 text-primary disabled:opacity-30 hover:bg-primary/20 transition-colors">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════
// QUICK LOG FAB — Sage-green floating action button
// ══════════════════════════════════════════════════
function QuickLogFABEnhanced({ onAction, lang }: { onAction: (type: string) => void; lang: "en" | "tr" }) {
  const [open, setOpen] = useState(false)
  const items = [
    { type: "water", emoji: "💧", label: tx("calendar.drankWater", lang), color: "bg-blue-500" },
    { type: "pain", emoji: "🤕", label: tx("calendar.logPain", lang), color: "bg-amber-500" },
    { type: "med", emoji: "💊", label: tx("calendar.tookMedication", lang), color: "bg-primary" },
  ]

  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && items.map((item, i) => (
          <motion.button key={item.type}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
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
function DailyProgressCard({ completed, total, lang }: { completed: number; total: number; lang: "en" | "tr" }) {
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
              ? tx("calendar.allTasksComplete", lang)
              : tx("calendar.dailyProgress", lang)}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {`${completed}/${total} ${tx("calendar.tasksCompleted", lang)}`}
          </p>
          {allDone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-1 mt-2">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {tx("calendar.streakGoing", lang)}
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
  const { isAuthenticated, isLoading: authLoading, profile, user } = useAuth()
  const { lang } = useLang()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeView, setActiveView] = useState<"today" | "month" | "vitals">("today")
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [vitalsLoading, setVitalsLoading] = useState(false)
  const [addVitalOpen, setAddVitalOpen] = useState(false)
  const [allEvents, setAllEvents] = useState<Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>>([])
  const [waterCount, setWaterCount] = useState(0)
  const [waterToast, setWaterToast] = useState(false)
  const [realStreak, setRealStreak] = useState<number | null>(null)

  // Current time block detection
  const currentBlock = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return "morning"
    if (h < 18) return "noon"
    return "night"
  }, [])

  // Daily tasks organized by circadian time blocks — profile-driven
  const [morningTasks, setMorningTasks] = useState<DailyTask[]>([
    { id: "m1", label: tx("calendar.vitaminD3", lang), done: false, emoji: "☀️" },
    { id: "m2", label: tx("calendar.probiotic", lang), done: false, emoji: "🌿" },
    { id: "m3", label: tx("calendar.oneGlassWater", lang), done: false, emoji: "💧" },
  ])
  const [noonTasks, setNoonTasks] = useState<DailyTask[]>([
    { id: "n1", label: "Omega-3", done: false, emoji: "🐟" },
    { id: "n2", label: tx("calendar.twoGlassesWater", lang), done: false, emoji: "💧" },
  ])
  const [nightTasks, setNightTasks] = useState<DailyTask[]>([
    { id: "e1", label: tx("calendar.magnesium", lang), done: false, emoji: "🌙" },
    { id: "e2", label: tx("calendar.valerianTea", lang), done: false, emoji: "🍵" },
  ])

  // Shared completed items set for ritual sync (key = task label)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  // Helper: local date string (must be before useEffects that use it)
  const getDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
  const selectedDateStr = getDateStr(selectedDate)
  const todayDateStr = getDateStr(new Date())

  // Ritual restore is handled inside fetchProfileMeds (after tasks are set)
  // to avoid race condition where profile fetch overwrites restored done states
  const [ritualDataLoaded, setRitualDataLoaded] = useState(false)

  // Load water count from Supabase on mount
  const fetchWaterCount = useCallback(() => {
    if (!user?.id) return
    fetch(`/api/daily-log?date=${todayDateStr}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.water?.glasses != null) setWaterCount(data.water.glasses) })
      .catch(() => {})
  }, [user?.id, todayDateStr])

  useEffect(() => { fetchWaterCount() }, [fetchWaterCount])

  // Listen for water changes from other views
  useEffect(() => {
    const handler = () => { fetchWaterCount() }
    window.addEventListener("water-intake-changed", handler)
    return () => window.removeEventListener("water-intake-changed", handler)
  }, [fetchWaterCount])

  // Toggle a task — for med/sup writes to daily_logs, for others uses localStorage
  const toggleTask = useCallback(async (id: string) => {
    // Find the task across all blocks
    const allCurrent = [...morningTasks, ...noonTasks, ...nightTasks]
    const task = allCurrent.find(t => t.id === id)
    if (!task) return
    const newDone = !task.done

    // Optimistic UI update
    const update = (tasks: DailyTask[]) => tasks.map(t => t.id === id ? { ...t, done: newDone } : t)
    setMorningTasks(update)
    setNoonTasks(update)
    setNightTasks(update)

    // Update completedItems set
    setCompletedItems(ci => {
      const next = new Set(ci)
      if (newDone) { next.add(task.id); next.add(task.label) }
      else { next.delete(task.id); next.delete(task.label) }
      return next
    })

    // For med/sup tasks → write to daily_logs Supabase
    const isMedOrSup = task.emoji === "💊" || task.emoji === "🌿" || task.emoji === "🐟"
    if (isMedOrSup && user?.id) {
      try {
        const supabase = createBrowserClient()
        const itemType = task.emoji === "💊" ? "medication" : "supplement"
        if (newDone) {
          const { error } = await supabase.from("daily_logs").insert({
            user_id: user.id, log_date: todayDateStr, item_type: itemType, item_id: id, item_name: task.label, completed: true,
          })
          if (error) {
            await supabase.from("daily_logs").update({ completed: true })
              .eq("user_id", user.id).eq("log_date", todayDateStr).eq("item_type", itemType).eq("item_id", id)
          }
        } else {
          await supabase.from("daily_logs").delete()
            .eq("user_id", user.id).eq("log_date", todayDateStr).eq("item_type", itemType).eq("item_id", id)
        }
        // Notify other views
        window.dispatchEvent(new Event("daily-log-changed"))
      } catch {}
    }
  }, [morningTasks, noonTasks, nightTasks, user?.id, todayDateStr])

  // Remove a task from a specific block
  const removeTask = useCallback((id: string) => {
    setMorningTasks(prev => prev.filter(t => t.id !== id))
    setNoonTasks(prev => prev.filter(t => t.id !== id))
    setNightTasks(prev => prev.filter(t => t.id !== id))
    // Save custom removals
    try {
      const key = `cal-ritual-removed-${user?.id}`
      const removed = JSON.parse(localStorage.getItem(key) || "[]") as string[]
      if (!removed.includes(id)) { removed.push(id); localStorage.setItem(key, JSON.stringify(removed)) }
    } catch {}
  }, [user?.id])

  // Add a custom task to a specific block
  const addCustomTask = useCallback((block: "morning" | "noon" | "night", task: DailyTask) => {
    if (block === "morning") setMorningTasks(prev => [...prev, task])
    else if (block === "noon") setNoonTasks(prev => [...prev, task])
    else setNightTasks(prev => [...prev, task])
    // Save custom additions
    try {
      const key = `cal-ritual-custom-${user?.id}`
      const custom = JSON.parse(localStorage.getItem(key) || "[]") as Array<DailyTask & { block: string }>
      custom.push({ ...task, block } as any)
      localStorage.setItem(key, JSON.stringify(custom))
    } catch {}
  }, [user?.id])

  const allTasks = useMemo(() => [...morningTasks, ...noonTasks, ...nightTasks], [morningTasks, noonTasks, nightTasks])
  const completedTasks = allTasks.filter(t => t.done).length

  // Auto-persist custom (non-med/sup) task completions to localStorage
  useEffect(() => {
    if (!ritualDataLoaded) return
    // Only persist custom task completions (water, custom tasks) — med/sup use daily_logs
    const customDoneIds = allTasks.filter(t => t.done && t.emoji !== "💊" && t.emoji !== "🌿" && t.emoji !== "🐟").map(t => t.id)
    localStorage.setItem(`cal-rituals-${todayDateStr}`, JSON.stringify(customDoneIds))

    // Save task id↔emoji mapping for reference
    const taskMap = allTasks.map(t => ({ id: t.id, emoji: t.emoji }))
    localStorage.setItem(`cal-ritual-tasks-${todayDateStr}`, JSON.stringify(taskMap))
  }, [allTasks, todayDateStr, ritualDataLoaded])

  // waterCount from FAB + water tasks in rituals (no hardcoded +3)
  const waterDoneFromTasks = allTasks.filter(t => t.done && t.emoji === "💧").length
  const totalWater = waterCount + waterDoneFromTasks
  const medsDone = allTasks.filter(t => t.done && t.emoji === "💊").length
  const totalMedsOnly = allTasks.filter(t => t.emoji === "💊").length
  // Supplements: count only real DB supplements (sup-*) + default supplement emojis that are from profile
  const supsDone = allTasks.filter(t => t.done && (t.emoji === "🌿" || t.emoji === "🐟")).length
  const totalSups = allTasks.filter(t => t.emoji === "🌿" || t.emoji === "🐟").length

  // FAB quick log handler — saves to Supabase
  const handleQuickLog = useCallback((type: string) => {
    if (type === "water") {
      setWaterCount(prev => {
        const next = prev + 1
        fetch("/api/daily-log", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: todayDateStr, glasses: next }),
        }).then(() => {
          window.dispatchEvent(new Event("water-intake-changed"))
        }).catch(() => {})
        return next
      })
      setWaterToast(true)
      setTimeout(() => setWaterToast(false), 1500)
    } else if (type === "med") {
      // Toggle all medication tasks as done — write each to daily_logs
      const allCurrent = [...morningTasks, ...noonTasks, ...nightTasks]
      const pendingMeds = allCurrent.filter(t => t.emoji === "💊" && !t.done)
      setMorningTasks(prev => prev.map(t => t.emoji === "💊" ? { ...t, done: true } : t))
      setNoonTasks(prev => prev.map(t => t.emoji === "💊" ? { ...t, done: true } : t))
      setNightTasks(prev => prev.map(t => t.emoji === "💊" ? { ...t, done: true } : t))
      // Write each to Supabase
      if (user?.id && pendingMeds.length > 0) {
        const supabase = createBrowserClient()
        const inserts = pendingMeds.map(t => ({
          user_id: user.id, log_date: todayDateStr, item_type: "medication", item_id: t.id, item_name: t.label, completed: true,
        }))
        supabase.from("daily_logs").upsert(inserts, { onConflict: "user_id,log_date,item_type,item_id" }).then(() => {
          window.dispatchEvent(new Event("daily-log-changed"))
        })
      }
    }
  }, [todayDateStr, morningTasks, noonTasks, nightTasks, user?.id])

  // Fetch real profile medications + supplements to populate time blocks
  const fetchProfileMeds = useCallback(async () => {
    if (!user?.id) return
    try {
      const supabase = createBrowserClient()

      // Fetch medications, supplements, and daily_logs in parallel
      const [medsRes, supsRes, logsRes] = await Promise.all([
        supabase.from("user_medications").select("id, brand_name, generic_name, dosage, frequency")
          .eq("user_id", user.id).eq("is_active", true),
        supabase.from("calendar_events").select("id, title, event_time, metadata")
          .eq("user_id", user.id).eq("event_type", "supplement").eq("recurrence", "daily"),
        supabase.from("daily_logs").select("item_id, completed")
          .eq("user_id", user.id).eq("log_date", todayDateStr).eq("completed", true),
      ])

      const meds = medsRes.data
      const sups = supsRes.data
      // Build done set from daily_logs (single source of truth)
      const doneIds = new Set<string>()
      logsRes.data?.forEach((l: any) => { if (l.completed) doneIds.add(l.item_id) })

      const morning: DailyTask[] = []
      const noon: DailyTask[] = []
      const night: DailyTask[] = []

      // Add medications — split multi-dose using shared utility
      if (meds && meds.length > 0) {
        const langKey = (lang === "tr" ? "tr" : "en") as "en" | "tr"
        meds.forEach((m: any) => {
          const medName = m.brand_name || m.generic_name || "Med"
          const doses = parseMedDoses(m.frequency || "", langKey)
          for (const dose of doses) {
            const itemId = buildMedItemId(m.id, dose)
            const label = buildMedLabel(medName, dose)
            const task: DailyTask = { id: itemId, label, done: doneIds.has(itemId), emoji: "💊" }
            if (dose.timeBlock === "evening") night.push(task)
            else if (dose.timeBlock === "noon") noon.push(task)
            else morning.push(task)
          }
        })
      }

      // Add supplements by scheduled time — use UUID
      if (sups && sups.length > 0) {
        const langKey = (lang === "tr" ? "tr" : "en") as "en" | "tr"
        sups.forEach((s: any) => {
          const name = getSupplementDisplayName(s.title || "Supplement", langKey)
          const time = s.event_time || "08:00"
          const hour = parseInt(time.split(":")[0] || "8", 10)
          const meta = typeof s.metadata === "string" ? JSON.parse(s.metadata || "{}") : (s.metadata || {})
          const doseInfo = meta.dose ? ` (${meta.dose})` : ""
          const itemId = s.id
          const task: DailyTask = { id: itemId, label: `${name}${doseInfo}`, done: doneIds.has(itemId), emoji: "🌿" }

          if (hour >= 18) night.push(task)
          else if (hour >= 12) noon.push(task)
          else morning.push(task)
        })
      }

      // Water tasks
      const waterMorning: DailyTask = { id: "w1", label: tx("calendar.oneGlassWater", lang), done: doneIds.has("w1"), emoji: "💧" }
      const waterNoon: DailyTask = { id: "w2", label: tx("calendar.twoGlassesWater", lang), done: doneIds.has("w2"), emoji: "💧" }

      // Set task blocks
      if (morning.length > 0 || sups) {
        setMorningTasks([...morning.filter(t => t.emoji === "💊"), ...morning.filter(t => t.emoji === "🌿"), waterMorning])
      }
      if (noon.length > 0) {
        setNoonTasks([...noon, waterNoon])
      } else {
        setNoonTasks([waterNoon])
      }
      if (night.length > 0) {
        setNightTasks(night)
      }

      // Restore custom (non-med/sup) task completions from localStorage
      setTimeout(() => {
        const saved2 = localStorage.getItem(`cal-rituals-${todayDateStr}`)
        if (saved2) {
          try {
            const savedIds = new Set(JSON.parse(saved2) as string[])
            // Only restore water/custom tasks — med/sup completion comes from daily_logs above
            const customDoneIds = new Set([...savedIds].filter(id => id.startsWith("w") || id.startsWith("custom-")))
            if (customDoneIds.size > 0) {
              setMorningTasks(prev => prev.map(t => customDoneIds.has(t.id) ? { ...t, done: true } : t))
              setNoonTasks(prev => prev.map(t => customDoneIds.has(t.id) ? { ...t, done: true } : t))
              setNightTasks(prev => prev.map(t => customDoneIds.has(t.id) ? { ...t, done: true } : t))
            }
          } catch {}
        }
        setRitualDataLoaded(true)
      }, 100)
    } catch { /* ignore — keep defaults */ }
  }, [user?.id, lang, todayDateStr])

  // Listen for cross-view sync events — re-fetch from daily_logs
  useEffect(() => {
    const handler = () => { fetchProfileMeds() }
    window.addEventListener("daily-log-changed", handler)
    return () => window.removeEventListener("daily-log-changed", handler)
  }, [fetchProfileMeds])

  // Fetch streak from daily_check_ins
  const fetchStreak = useCallback(async () => {
    if (!user?.id) return
    try {
      const supabase = createBrowserClient()
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      const { data: checkIns } = await supabase
        .from("daily_check_ins")
        .select("check_date")
        .eq("user_id", user.id)
        .gte("check_date", ninetyDaysAgo.toISOString().split("T")[0])
        .order("check_date", { ascending: false })

      if (checkIns && checkIns.length > 0) {
        const activeDates = new Set(checkIns.map((c: { check_date: string }) => c.check_date))
        let s = 0
        const today = new Date()
        for (let i = 0; i < 90; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().split("T")[0]
          if (activeDates.has(dateStr)) s++
          else break
        }
        setRealStreak(s)
      } else {
        setRealStreak(0)
      }
    } catch { /* ignore */ }
  }, [user?.id])

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
    if (profile?.id) {
      Promise.all([fetchAllEvents(), fetchVitals(), fetchProfileMeds(), fetchStreak()])
    }
  }, [profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) return <PageSkeleton />
  if (!isAuthenticated || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card><CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/70" />
          <h2 className="font-heading text-2xl font-bold italic">{tx("cal.title", lang)}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{tx("cal.signInPrompt", lang)}</p>
          <Button onClick={() => router.push("/auth/login")}><LogIn className="mr-2 h-4 w-4" />{tx("cal.signIn", lang)}</Button>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">

        {/* ═══ PAGE HEADER ═══ */}
        <div className="flex items-center gap-2 px-1 mb-6">
          <h1 className="font-heading text-2xl font-bold italic">{tx("cal.title", lang)}</h1>
          <InfoTooltip title="Habit & Healing Map" description="Track daily supplements, water intake, and health habits. Build streaks to stay motivated." />
        </div>

        {/* ═══ DESKTOP 2-COLUMN LAYOUT ═══ */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* ═══ LEFT COLUMN: Navigation & Rings ═══ */}
          <div className="md:w-72 flex-shrink-0 space-y-4">

            {/* Weekly Strip */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white dark:bg-card rounded-2xl border border-stone-200/60 dark:border-stone-800 p-4 shadow-sm">
              <WeeklyStripEnhanced selectedDate={selectedDate} onSelect={setSelectedDate} lang={lang} />
            </motion.div>

            {/* Habit Heat Map */}
            <HabitHeatMap lang={lang} userId={user?.id} streak={realStreak ?? undefined} />

            {/* Daily Progress */}
            <DailyProgressCard completed={completedTasks} total={allTasks.length} lang={lang} />

            {/* Habit Rings */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="bg-white dark:bg-card rounded-2xl border border-stone-200/60 dark:border-stone-800 p-4 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {tx("calendar.dailyRings", lang)}
              </p>
              <div className="flex justify-around gap-1 px-1">
                <CircularRing emoji="💧" label={tx("calendar.water", lang)} current={Math.min(totalWater, 8)} total={8} color="#3b82f6" />
                <CircularRing emoji="💊" label={tx("calendar.meds", lang)} current={medsDone} total={Math.max(totalMedsOnly, 1)} color="#3c7a52" />
                <CircularRing emoji="🌿" label={tx("calendar.supps", lang)} current={supsDone} total={Math.max(totalSups, 1)} color="#6B8F71" />
                <CircularRing emoji="🚶" label={tx("calendar.move", lang)} current={1} total={3} color="#f59e0b" />
              </div>
            </motion.div>

            {/* Notification Settings — desktop sidebar */}
            <div className="hidden md:block">
              <NotificationSettings />
            </div>

          </div>

          {/* ═══ RIGHT COLUMN: Daily Content ═══ */}
          <div className="flex-1 space-y-4">

            {/* View Switcher */}
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
                    {view === "today" ? tx("calendar.today", lang) :
                     view === "month" ? tx("calendar.calendarView", lang) :
                     tx("calendar.vitals", lang)}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* ═══ TODAY VIEW: Circadian Time Blocks ═══ */}
            <AnimatePresence mode="wait">
              {activeView === "today" && (
                <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">

                  <TimeBlockEnhanced
                    icon={<Sun className="h-4 w-4 text-amber-500" />}
                    title={tx("calendar.morningRoutine", lang)}
                    tasks={morningTasks} onToggle={toggleTask} onAdd={() => {}}
                    onRemoveTask={removeTask} onAddCustomTask={(t) => addCustomTask("morning", t)}
                    isCurrent={currentBlock === "morning"} hours="06:00–12:00" lang={lang} blockKey="morning" />

                  <TimeBlockEnhanced
                    icon={<Sunset className="h-4 w-4 text-orange-500" />}
                    title={tx("calendar.afternoon", lang)}
                    tasks={noonTasks} onToggle={toggleTask} onAdd={() => {}}
                    onRemoveTask={removeTask} onAddCustomTask={(t) => addCustomTask("noon", t)}
                    isCurrent={currentBlock === "noon"} hours="12:00–18:00" lang={lang} blockKey="noon" />

                  <TimeBlockEnhanced
                    icon={<MoonIcon className="h-4 w-4 text-indigo-400" />}
                    title={tx("calendar.eveningWindDown", lang)}
                    tasks={nightTasks} onToggle={toggleTask} onAdd={() => {}}
                    onRemoveTask={removeTask} onAddCustomTask={(t) => addCustomTask("night", t)}
                    isCurrent={currentBlock === "night"} hours="18:00–00:00" lang={lang} blockKey="night" />

                  {/* Existing TodayView integration */}
                  <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
                    <TodayView userId={profile.id} lang={lang} userName={profile.full_name}
                      userWeight={profile.weight_kg} userHeight={profile.height_cm} userSupplements={(profile.supplements || []).filter((s: string) => !s.startsWith("meta:"))} />
                  </Suspense>
                </motion.div>
              )}

              {activeView === "month" && (
                <motion.div key="month" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
                <motion.div key="vitals" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
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
                          <motion.div key={vital.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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

          </div>
        </div>

        {/* Notification Settings — mobile only */}
        <div className="mt-4 md:hidden">
          <NotificationSettings />
        </div>
      </div>

      {/* ═══ Quick Log FAB ═══ */}
      <QuickLogFABEnhanced onAction={handleQuickLog} lang={lang} />

      {/* ═══ Water Toast ═══ */}
      <AnimatePresence>
        {waterToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="fixed bottom-40 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-blue-500 text-white px-4 py-2 text-sm font-medium shadow-lg"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 0.3 }}
            >
              💧
            </motion.span>
            {tx("calendar.waterAddedToast", lang)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
