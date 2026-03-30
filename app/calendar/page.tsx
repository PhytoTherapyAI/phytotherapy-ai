// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDays, Activity, Heart, Loader2, LogIn, Plus, Download,
  Droplets, Pill, Sun, Moon as MoonIcon, Sunset, Check, X,
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

const TodayView = lazy(() => import("@/components/calendar/TodayView").then(m => ({ default: m.TodayView })))
const MonthView = lazy(() => import("@/components/calendar/MonthView").then(m => ({ default: m.MonthView })))
const AddVitalDialog = lazy(() => import("@/components/calendar/AddVitalDialog").then(m => ({ default: m.AddVitalDialog })))

interface VitalRecord {
  id: string; user_id: string; vital_type: string; value: number
  systolic?: number; diastolic?: number; notes: string | null; recorded_at: string
}

// ── ICS Export ──
function generateICS(events: Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Phytotherapy.ai//Calendar//EN", "CALSCALE:GREGORIAN"]
  for (const evt of events) {
    const dateClean = evt.event_date.replace(/-/g, "")
    const dtStart = evt.event_time ? `${dateClean}T${evt.event_time.replace(":", "")}00` : dateClean
    const dtEnd = evt.event_time ? `${dateClean}T${String(parseInt(evt.event_time.split(":")[0]) + 1).padStart(2, "0")}${evt.event_time.split(":")[1]}00` : dateClean
    lines.push("BEGIN:VEVENT", `DTSTART:${dtStart}`, `DTEND:${dtEnd}`, `SUMMARY:${evt.title}`)
    if (evt.description) lines.push(`DESCRIPTION:${evt.description.replace(/\n/g, "\\n")}`)
    lines.push(`CATEGORIES:${evt.event_type}`, `UID:${evt.event_date}-${Math.random().toString(36).slice(2)}@phytotherapy.ai`, "END:VEVENT")
  }
  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

function downloadICS(events: Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>) {
  const ics = generateICS(events)
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a"); a.href = url; a.download = "phytotherapy-calendar.ics"
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ── Weekly Strip Component ──
function WeeklyStrip({ selectedDate, onSelect }: { selectedDate: Date; onSelect: (d: Date) => void }) {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d
  })
  const dayNames = { en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], tr: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
      {days.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString()
        const isSelected = d.toDateString() === selectedDate.toDateString()
        return (
          <motion.button key={i} whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(d)}
            className={`flex flex-col items-center gap-1 min-w-[52px] rounded-2xl py-3 px-2 transition-all ${
              isSelected ? "bg-primary text-white shadow-lg shadow-primary/25" : isToday ? "bg-primary/10" : "hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}>
            <span className={`text-[10px] font-medium ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
              {(dayNames as any)[lang]?.[i] || dayNames.en[i]}
            </span>
            <span className={`text-lg font-bold ${isSelected ? "text-white" : "text-foreground"}`}>{d.getDate()}</span>
            {isToday && !isSelected && <span className="h-1 w-1 rounded-full bg-primary" />}
          </motion.button>
        )
      })}
    </div>
  )
}

// ── Habit Ring ──
function HabitRing({ emoji, label, current, total, color }: { emoji: string; label: string; current: number; total: number; color: string }) {
  const percent = Math.min((current / total) * 100, 100)
  const r = 28; const c = 2 * Math.PI * r; const offset = c - (percent / 100) * c
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width={68} height={68} className="transform -rotate-90">
          <circle cx={34} cy={34} r={r} stroke="currentColor" strokeWidth={5} fill="none" className="text-stone-200 dark:text-stone-700" />
          <motion.circle cx={34} cy={34} r={r} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round"
            strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg">{emoji}</span>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      <span className="text-[10px] font-bold">{current}/{total}</span>
    </div>
  )
}

// ── Time Block ──
function TimeBlock({ icon, title, tasks, onToggle, onAdd, lang }: {
  icon: React.ReactNode; title: string; tasks: Array<{ id: string; label: string; done: boolean; emoji: string }>
  onToggle: (id: string) => void; onAdd: () => void; lang: string
}) {
  return (
    <div className="rounded-xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-1">
        {tasks.length === 0 ? (
          <button onClick={onAdd}
            className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-stone-300 dark:border-stone-700 text-xs text-muted-foreground hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
            <Plus className="h-3 w-3" />
            {lang === "tr" ? `+ ${title} ekle` : `+ Add to ${title}`}
          </button>
        ) : (
          tasks.map(t => (
            <motion.button key={t.id} whileTap={{ scale: 0.97 }} onClick={() => onToggle(t.id)}
              className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-left">
              <motion.div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${t.done ? "bg-primary border-primary" : "border-stone-300 dark:border-stone-600"}`}
                animate={t.done ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                {t.done && <Check className="h-3 w-3 text-white" />}
              </motion.div>
              <span className="text-sm">{t.emoji}</span>
              <span className={`text-sm flex-1 transition-all ${t.done ? "line-through text-muted-foreground/40" : ""}`}>{t.label}</span>
              {t.done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs">✨</motion.span>}
            </motion.button>
          ))
        )}
      </div>
    </div>
  )
}

// ── Quick Log FAB ──
function QuickLogFAB({ onAction, lang }: { onAction: (type: string) => void; lang: string }) {
  const [open, setOpen] = useState(false)
  const items = [
    { type: "water", emoji: "💧", label: lang === "tr" ? "Su İçtim" : "Drank Water" },
    { type: "pain", emoji: "🤕", label: lang === "tr" ? "Ağrı Kaydet" : "Log Pain" },
    { type: "med", emoji: "💊", label: lang === "tr" ? "İlacımı Aldım" : "Took Medication" },
  ]

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && items.map((item, i) => (
          <motion.button key={item.type} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }} transition={{ delay: i * 0.05 }}
            onClick={() => { onAction(item.type); setOpen(false) }}
            className="flex items-center gap-2 rounded-full bg-white dark:bg-card shadow-lg border px-4 py-2.5 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
            <span>{item.emoji}</span> {item.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary/90 transition-colors">
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="h-6 w-6" />
        </motion.div>
      </motion.button>
    </div>
  )
}

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

export default function CalendarPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, profile } = useAuth()
  const { lang } = useLang()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeView, setActiveView] = useState<"today" | "month" | "vitals">("today")
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [vitalsLoading, setVitalsLoading] = useState(false)
  const [addVitalOpen, setAddVitalOpen] = useState(false)
  const [allEvents, setAllEvents] = useState<any[]>([])

  // Mock daily tasks organized by time blocks
  const [morningTasks, setMorningTasks] = useState([
    { id: "m1", label: lang === "tr" ? "D3 Vitamini" : "Vitamin D3", done: false, emoji: "☀️" },
    { id: "m2", label: lang === "tr" ? "Probiyotik" : "Probiotic", done: false, emoji: "🌿" },
  ])
  const [noonTasks, setNoonTasks] = useState([
    { id: "n1", label: lang === "tr" ? "Omega-3" : "Omega-3", done: false, emoji: "🐟" },
    { id: "n2", label: lang === "tr" ? "2 bardak su" : "2 glasses water", done: false, emoji: "💧" },
  ])
  const [nightTasks, setNightTasks] = useState([
    { id: "e1", label: lang === "tr" ? "Magnezyum" : "Magnesium", done: false, emoji: "🌙" },
    { id: "e2", label: lang === "tr" ? "Kediotu çayı" : "Valerian tea", done: false, emoji: "🍵" },
  ])

  const toggleTask = (id: string) => {
    const update = (tasks: typeof morningTasks) => tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setMorningTasks(update); setNoonTasks(update); setNightTasks(update)
  }

  const allTasks = [...morningTasks, ...noonTasks, ...nightTasks]
  const completedTasks = allTasks.filter(t => t.done).length
  const waterCount = 3 // mock
  const supCount = allTasks.filter(t => t.done && t.emoji !== "💧").length
  const totalSup = allTasks.filter(t => t.emoji !== "💧").length

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
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 space-y-6">

        {/* ═══ WEEKLY STRIP ═══ */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <WeeklyStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
        </motion.div>

        {/* ═══ HABIT RINGS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex justify-center gap-6 py-2">
          <HabitRing emoji="💧" label={lang === "tr" ? "Su" : "Water"} current={waterCount} total={8} color="#3b82f6" />
          <HabitRing emoji="💊" label={lang === "tr" ? "İlaçlar" : "Meds"} current={1} total={2} color="#3c7a52" />
          <HabitRing emoji="🌿" label={lang === "tr" ? "Takviye" : "Supps"} current={supCount} total={totalSup} color="#6B8F71" />
          <HabitRing emoji="🚶" label={lang === "tr" ? "Hareket" : "Move"} current={1} total={3} color="#f59e0b" />
        </motion.div>

        {/* ═══ VIEW SWITCHER ═══ */}
        <div className="flex gap-2 bg-white dark:bg-card rounded-xl border p-1">
          {(["today", "month", "vitals"] as const).map(view => (
            <button key={view} onClick={() => setActiveView(view)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                activeView === view ? "bg-primary text-white shadow" : "text-muted-foreground hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}>
              {view === "today" ? (lang === "tr" ? "Bugün" : "Today") :
               view === "month" ? (lang === "tr" ? "Takvim" : "Calendar") :
               (lang === "tr" ? "Vitaller" : "Vitals")}
            </button>
          ))}
        </div>

        {/* ═══ TODAY VIEW: Time Blocks ═══ */}
        <AnimatePresence mode="wait">
          {activeView === "today" && (
            <motion.div key="today" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
              <TimeBlock icon={<Sun className="h-4 w-4 text-amber-500" />}
                title={lang === "tr" ? "🌅 Sabah Rutini" : "🌅 Morning Routine"}
                tasks={morningTasks} onToggle={toggleTask} onAdd={() => {}} lang={lang} />
              <TimeBlock icon={<Sunset className="h-4 w-4 text-orange-500" />}
                title={lang === "tr" ? "☀️ Öğle" : "☀️ Noon"}
                tasks={noonTasks} onToggle={toggleTask} onAdd={() => {}} lang={lang} />
              <TimeBlock icon={<MoonIcon className="h-4 w-4 text-indigo-400" />}
                title={lang === "tr" ? "🌙 Gece" : "🌙 Night"}
                tasks={nightTasks} onToggle={toggleTask} onAdd={() => {}} lang={lang} />

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
                      <Card key={vital.id}><CardContent className="flex items-center gap-4 py-3 px-4">
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
      <QuickLogFAB onAction={(type) => { /* handle quick log */ }} lang={lang} />
    </div>
  )
}
