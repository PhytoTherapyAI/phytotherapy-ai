"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Pill, Plus, CalendarDays, Loader2, Bell, Minus,
  Droplets, Activity, Sparkles, Leaf, Check, Flame,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { AddEventDialog, eventTypeColor } from "./AddEventDialog"
import { AddVitalDialog } from "./AddVitalDialog"
import { AddSupplementDialog } from "./AddSupplementDialog"
import type { UserMedication } from "@/lib/database.types"

interface TodayViewProps {
  userId: string
  lang: Lang
}

interface DailyLog {
  id: string
  user_id: string
  log_date: string
  item_type: string
  item_id: string
  item_name: string
  completed: boolean
}

interface CalendarEvent {
  id: string
  event_type: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  recurrence: string
}

const DEFAULT_WATER_TARGET = 8
const TODAY = new Date().toISOString().split("T")[0]

// ── Fun motivational messages ──
const WATER_DONE_MESSAGES_EN = [
  "🎉 Daily goal reached! Your body thanks you!",
  "🏆 Water champion! Goal achieved!",
  "💪 Hydration master! Keep it up!",
  "🌊 Goal crushed! Your cells are dancing!",
]
const WATER_DONE_MESSAGES_TR = [
  "🎉 Günlük hedefe ulaştın! Vücudun teşekkür ediyor!",
  "🏆 Su şampiyonu! Hedefe ulaştın!",
  "💪 Hidrasyon ustası! Devam et!",
  "🌊 Hedef tamamlandı! Hücrelerin dans ediyor!",
]
const WATER_OVER_MESSAGES_EN = [
  "😄 Going above and beyond! Water lover!",
  "🐟 Are you growing gills? Just kidding — great job!",
  "🌊 Overachiever! Your kidneys appreciate the love!",
  "💧 Above and beyond! You're a hydration hero!",
]
const WATER_OVER_MESSAGES_TR = [
  "😄 Hedefin üstüne çıktın! Su aşığı!",
  "🐟 Solungaç mı çıkarıyorsun? Şaka yapıyorum — harika gidiyorsun!",
  "🌊 Üstün başarı! Böbreklerin sevgini takdir ediyor!",
  "💧 Hedefin ötesinde! Hidrasyon kahramanısın!",
]
const MED_DONE_MESSAGES_EN = [
  "Great job! 💊", "Done! ✨", "Way to go! 👏", "Nailed it! 🎯",
]
const MED_DONE_MESSAGES_TR = [
  "Harika! 💊", "Tamam! ✨", "Süper! 👏", "Başardın! 🎯",
]

function getRandomMessage(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function TodayView({ userId, lang }: TodayViewProps) {
  const today = TODAY
  const tr = lang === "tr"

  const [medications, setMedications] = useState<UserMedication[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [addVitalOpen, setAddVitalOpen] = useState(false)
  const [addSupplementOpen, setAddSupplementOpen] = useState(false)
  const [presetEventType, setPresetEventType] = useState<string | undefined>(undefined)

  // Animation states
  const [justCompletedMed, setJustCompletedMed] = useState<string | null>(null)
  const [medMessage, setMedMessage] = useState<string | null>(null)

  // Water
  const [glasses, setGlasses] = useState(0)
  const [waterTarget, setWaterTarget] = useState(DEFAULT_WATER_TARGET)
  const [waterLoading, setWaterLoading] = useState(true)
  const [editingTarget, setEditingTarget] = useState(false)
  const [waterBounce, setWaterBounce] = useState(false)

  // Streak
  const [streak, setStreak] = useState(0)

  // Bell notification dialog
  const [bellMedId, setBellMedId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const [medsRes, logsRes, eventsRes, waterRes] = await Promise.all([
        supabase.from("user_medications").select("*").eq("user_id", userId).eq("is_active", true),
        supabase.from("daily_logs").select("*").eq("user_id", userId).eq("log_date", today),
        supabase.from("calendar_events").select("*").eq("user_id", userId).eq("event_date", today),
        supabase.from("water_intake").select("glasses, target_glasses").eq("user_id", userId).eq("intake_date", today).single(),
      ])
      if (medsRes.data) setMedications(medsRes.data as UserMedication[])
      if (logsRes.data) setDailyLogs(logsRes.data as DailyLog[])
      if (eventsRes.data) setEvents(eventsRes.data as CalendarEvent[])
      if (waterRes.data) {
        setGlasses(waterRes.data.glasses ?? 0)
        if (waterRes.data.target_glasses) setWaterTarget(waterRes.data.target_glasses)
      }

      // Calculate streak (simplified — count consecutive days with all meds completed)
      try {
        const { data: recentLogs } = await supabase
          .from("daily_logs")
          .select("log_date, completed")
          .eq("user_id", userId)
          .eq("item_type", "medication")
          .eq("completed", true)
          .order("log_date", { ascending: false })
          .limit(60)
        if (recentLogs) {
          const uniqueDays = [...new Set(recentLogs.map((l: { log_date: string }) => l.log_date))]
          let s = 0
          const d = new Date()
          for (let i = 0; i < 30; i++) {
            const dateStr = d.toISOString().split("T")[0]
            if (uniqueDays.includes(dateStr)) { s++ } else if (i > 0) { break }
            d.setDate(d.getDate() - 1)
          }
          setStreak(s)
        }
      } catch { /* ignore streak calc failure */ }
    } catch (err) {
      console.error("Failed to fetch today data:", err)
    } finally {
      setLoading(false)
      setWaterLoading(false)
    }
  }, [userId, today])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Medication toggle with animation ──
  const toggleMedication = async (med: UserMedication) => {
    const medName = med.brand_name || med.generic_name || "Unknown"
    const existing = dailyLogs.find((l) => l.item_type === "medication" && l.item_id === med.id)
    const wasCompleted = existing?.completed ?? false
    setTogglingId(med.id)

    // Optimistic update
    if (existing) {
      setDailyLogs((prev) => prev.map((l) => l.id === existing.id ? { ...l, completed: !l.completed } : l))
    } else {
      setDailyLogs((prev) => [...prev, { id: `temp-${med.id}`, user_id: userId, log_date: today, item_type: "medication", item_id: med.id, item_name: medName, completed: true }])
    }

    // Show animation on marking complete (not unchecking)
    if (!wasCompleted) {
      setJustCompletedMed(med.id)
      setMedMessage(getRandomMessage(tr ? MED_DONE_MESSAGES_TR : MED_DONE_MESSAGES_EN))
      setTimeout(() => { setJustCompletedMed(null); setMedMessage(null) }, 1500)
    }

    try {
      const supabase = createBrowserClient()
      if (existing) {
        await supabase.from("daily_logs").update({ completed: !existing.completed }).eq("id", existing.id)
      } else {
        const { error: insertError } = await supabase.from("daily_logs").insert({
          user_id: userId, log_date: today, item_type: "medication", item_id: med.id, item_name: medName, completed: true,
        })
        if (insertError) {
          await supabase.from("daily_logs").update({ completed: true })
            .eq("user_id", userId).eq("log_date", today).eq("item_type", "medication").eq("item_id", med.id)
        }
      }
      const { data: freshLogs } = await supabase.from("daily_logs").select("*").eq("user_id", userId).eq("log_date", today)
      if (freshLogs) setDailyLogs(freshLogs as DailyLog[])
    } catch {
      fetchData()
    } finally {
      setTogglingId(null)
    }
  }

  const isMedCompleted = (medId: string) => dailyLogs.some((l) => l.item_type === "medication" && l.item_id === medId && l.completed)
  const completedMeds = medications.filter((m) => isMedCompleted(m.id)).length
  const allMedsDone = medications.length > 0 && completedMeds === medications.length

  // ── Water ──
  const updateWater = useCallback(async (newCount: number) => {
    const clamped = Math.max(0, newCount)
    setGlasses(clamped)
    setWaterBounce(true)
    setTimeout(() => setWaterBounce(false), 300)
    try {
      const supabase = createBrowserClient()
      const { data: existing } = await supabase.from("water_intake").select("id").eq("user_id", userId).eq("intake_date", today).single()
      if (existing) {
        await supabase.from("water_intake").update({ glasses: clamped, updated_at: new Date().toISOString() }).eq("id", existing.id)
      } else {
        await supabase.from("water_intake").insert({ user_id: userId, intake_date: today, glasses: clamped, target_glasses: waterTarget })
      }
    } catch { /* ignore */ }
  }, [userId, today, waterTarget])

  const updateWaterTarget = async (newTarget: number) => {
    setWaterTarget(newTarget)
    setEditingTarget(false)
    try {
      const supabase = createBrowserClient()
      const { data: existing } = await supabase.from("water_intake").select("id").eq("user_id", userId).eq("intake_date", today).single()
      if (existing) {
        await supabase.from("water_intake").update({ target_glasses: newTarget }).eq("id", existing.id)
      }
    } catch { /* ignore */ }
  }

  const waterPercent = Math.min(Math.round((glasses / waterTarget) * 100), 100)
  const waterFillPercent = Math.min(Math.round((glasses / waterTarget) * 100), 130) // Allow overflow visual

  // Water bar gradient color based on progress
  const getWaterBarColor = () => {
    if (glasses > waterTarget) return "from-blue-400 via-cyan-400 to-emerald-400"
    if (waterPercent >= 100) return "from-blue-400 to-cyan-400"
    if (waterPercent >= 75) return "from-blue-400 to-blue-500"
    if (waterPercent >= 50) return "from-blue-300 to-blue-400"
    return "from-blue-200 to-blue-300"
  }

  const getWaterMessage = () => {
    if (glasses > waterTarget) return getRandomMessage(tr ? WATER_OVER_MESSAGES_TR : WATER_OVER_MESSAGES_EN)
    if (glasses >= waterTarget) return getRandomMessage(tr ? WATER_DONE_MESSAGES_TR : WATER_DONE_MESSAGES_EN)
    if (glasses > waterTarget * 0.75) return tr ? "Az kaldı! Son hamle!" : "Almost there! Final push!"
    if (glasses > waterTarget * 0.5) return tr ? "Yarıyı geçtin! Devam et!" : "Past halfway! Keep going!"
    if (glasses > 0) return tr ? `Kalan: ${waterTarget - glasses} bardak` : `${waterTarget - glasses} glasses remaining`
    return tr ? "İlk bardağınla başla!" : "Start with your first glass!"
  }

  const openQuickEvent = (type: string) => { setPresetEventType(type); setAddEventOpen(true) }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-5">

      {/* ═══ Daily Progress + Streak ═══ */}
      <div className="flex items-center gap-3 rounded-xl border bg-primary/5 px-4 py-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {allMedsDone && glasses >= waterTarget
              ? (tr ? "Bugün harikasın! Tüm görevler tamam." : "Amazing day! All tasks completed.")
              : (tr ? `Bugünkü ilerleme: ${completedMeds}/${medications.length} ilaç` : `Today: ${completedMeds}/${medications.length} meds`)}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-500">{streak}</span>
          </div>
        )}
        {allMedsDone && glasses >= waterTarget && <span className="text-lg">🎉</span>}
      </div>

      {/* ═══ Medications ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              {tx("cal.medications", lang)}
            </span>
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <span className="flex items-center gap-1 text-xs text-amber-500">
                  <Flame className="h-3 w-3" /> {streak} {tr ? "gün seri" : "day streak"}
                </span>
              )}
              {medications.length > 0 && (
                <Badge variant={allMedsDone ? "default" : "secondary"} className={allMedsDone ? "bg-primary text-white" : ""}>
                  {allMedsDone ? "✓" : `${completedMeds}/${medications.length}`}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-4">
              <Pill className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">{tx("cal.noMeds", lang)}</p>
              <Button variant="link" size="sm" className="mt-1 text-primary" onClick={() => (window.location.href = "/profile")}>
                {tx("cal.addMedsProfile", lang)}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {medications.map((med) => {
                const completed = isMedCompleted(med.id)
                const isToggling = togglingId === med.id
                const justDone = justCompletedMed === med.id
                return (
                  <div key={med.id} className="relative">
                    <button
                      type="button"
                      onClick={() => !isToggling && toggleMedication(med)}
                      disabled={isToggling}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                        justDone ? "animate-pulse scale-[1.02] border-primary bg-primary/10" :
                        completed ? "bg-primary/5 border-primary/30" :
                        "hover:bg-muted/50 hover:border-primary/20 active:scale-[0.98]"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        completed ? "border-primary bg-primary scale-110" : "border-muted-foreground/30"
                      }`}>
                        {isToggling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        ) : completed ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-all ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {med.brand_name || med.generic_name}
                        </p>
                        {(med.dosage || med.frequency) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {[med.dosage, med.frequency].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); setBellMedId(bellMedId === med.id ? null : med.id) }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                    </button>
                    {/* Bell tooltip */}
                    {bellMedId === med.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border bg-card p-3 shadow-lg text-xs text-muted-foreground w-48">
                        <p className="font-medium text-foreground mb-1">{tr ? "Bildirimler" : "Notifications"}</p>
                        <p>{tr ? "Bildirim özelliği yakında geliyor! İlaç saatinizi hatırlatacağız." : "Notification feature coming soon! We'll remind you of your medication time."}</p>
                        <button onClick={(e) => { e.stopPropagation(); setBellMedId(null) }} className="mt-2 text-primary hover:underline">
                          {tr ? "Tamam" : "Got it"}
                        </button>
                      </div>
                    )}
                    {/* Completion message */}
                    {justDone && medMessage && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs text-white shadow-lg animate-bounce whitespace-nowrap">
                        {medMessage}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Supplements ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              {tx("cal.supplements", lang)}
            </span>
            <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setAddSupplementOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              {tr ? "Takviye Ekle" : "Add Supplement"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.filter((e) => e.event_type === "supplement").length === 0 ? (
            <div className="text-center py-4">
              <Leaf className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {tr ? "Takviye ekleyin — profilinize göre güvenlik kontrolü yapılır." : "Add supplements — safety checked against your profile."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.filter((e) => e.event_type === "supplement").map((sup) => (
                <div key={sup.id} className="flex items-center gap-3 rounded-xl border px-4 py-3">
                  <Leaf className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sup.title}</p>
                    {sup.description && <p className="text-xs text-muted-foreground truncate">{sup.description}</p>}
                  </div>
                  {sup.event_time && <span className="text-xs text-muted-foreground">{sup.event_time}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Events ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {tx("cal.events", lang)}
            </span>
            <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => { setPresetEventType(undefined); setAddEventOpen(true) }}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              {tx("cal.addEvent", lang)}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.filter((e) => e.event_type !== "supplement").length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
                <CalendarDays className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">{tx("cal.noEventsDesc", lang)}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">{tx("cal.quickAdd", lang)}</span>
                {["appointment", "sport", "symptom"].map((type) => (
                  <button key={type} onClick={() => openQuickEvent(type)}
                    className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-95">
                    {tx(`cal.eventType.${type}`, lang)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {events.filter((e) => e.event_type !== "supplement").map((evt) => (
                <div key={evt.id} className="flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted/30">
                  <span className={`mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full ${eventTypeColor(evt.event_type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{evt.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {evt.event_time && <span className="text-xs text-muted-foreground">{evt.event_time}</span>}
                      <span className="text-xs text-muted-foreground/50">{tx(`cal.eventType.${evt.event_type}`, lang)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Water Tracker ═══ */}
      <Card className={glasses >= waterTarget ? "border-primary/30" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              {tx("cal.water", lang)}
            </span>
            <button onClick={() => setEditingTarget(!editingTarget)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {tr ? `Hedef: ${waterTarget}` : `Goal: ${waterTarget}`}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waterLoading ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-4">
              {/* Target editor */}
              {editingTarget && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/30 py-2.5 px-3">
                  <span className="text-xs text-muted-foreground shrink-0">{tr ? "Hedef:" : "Goal:"}</span>
                  {[8, 10, 12, 14, 16].map((t) => (
                    <button key={t} onClick={() => updateWaterTarget(t)}
                      className={`h-8 w-8 rounded-full text-xs font-medium transition-all ${waterTarget === t ? "bg-blue-400 text-white scale-110" : "bg-card border hover:border-blue-400"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}

              {/* Main water display — big droplet that fills */}
              <div className="flex flex-col items-center gap-3">
                {/* Filling droplet icon */}
                <div className={`relative h-20 w-16 transition-transform duration-300 ${waterBounce ? "scale-110" : "scale-100"}`}>
                  <svg viewBox="0 0 64 80" className="h-full w-full">
                    <defs>
                      <clipPath id="dropClip">
                        <path d="M32 4C32 4 8 36 8 52C8 65.25 18.75 76 32 76C45.25 76 56 65.25 56 52C56 36 32 4 32 4Z" />
                      </clipPath>
                    </defs>
                    {/* Outer shape */}
                    <path d="M32 4C32 4 8 36 8 52C8 65.25 18.75 76 32 76C45.25 76 56 65.25 56 52C56 36 32 4 32 4Z"
                      fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400/30" />
                    {/* Fill */}
                    <rect x="0" y={80 - (Math.min(waterFillPercent, 100) / 100) * 72}
                      width="64" height={72} clipPath="url(#dropClip)"
                      className="transition-all duration-500"
                      fill={glasses >= waterTarget ? "#22d3ee" : glasses > waterTarget * 0.5 ? "#60a5fa" : "#93c5fd"} />
                    {/* Shine */}
                    <ellipse cx="24" cy="46" rx="4" ry="8" fill="white" opacity="0.2" />
                  </svg>
                </div>

                {/* Number */}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{glasses}</span>
                  <span className="text-lg text-muted-foreground/40">/</span>
                  <span className="text-lg text-muted-foreground/60">{waterTarget}</span>
                </div>

                {/* Progress bar with gradient */}
                <div className="w-full rounded-full bg-muted h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full bg-gradient-to-r ${getWaterBarColor()} transition-all duration-500`}
                    style={{ width: `${Math.min(waterFillPercent, 100)}%` }} />
                </div>

                {/* Message */}
                <p className={`text-sm text-center ${glasses >= waterTarget ? "font-medium text-blue-400" : "text-muted-foreground"}`}>
                  {getWaterMessage()}
                </p>
              </div>

              {/* +/- buttons */}
              <div className="flex items-center justify-center gap-6">
                <Button variant="outline" size="icon" onClick={() => updateWater(glasses - 1)} disabled={glasses <= 0} className="h-11 w-11 rounded-full">
                  <Minus className="h-5 w-5" />
                </Button>
                <Button variant="default" size="icon" onClick={() => updateWater(glasses + 1)}
                  className="h-14 w-14 rounded-full bg-blue-400 hover:bg-blue-500 text-white shadow-lg shadow-blue-400/20">
                  <Plus className="h-6 w-6" />
                </Button>
                <div className="w-11" /> {/* Spacer for visual balance */}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Quick Actions ═══ */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => { setPresetEventType(undefined); setAddEventOpen(true) }}>
          <CalendarDays className="h-4 w-4 mr-2" />
          {tx("cal.addEvent", lang)}
        </Button>
        <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setAddVitalOpen(true)}>
          <Activity className="h-4 w-4 mr-2" />
          {tx("cal.recordHealth", lang)}
        </Button>
      </div>

      {/* Dialogs */}
      <AddEventDialog userId={userId} lang={lang} open={addEventOpen} onOpenChange={setAddEventOpen} onSaved={fetchData} selectedDate={today} presetEventType={presetEventType} />
      <AddVitalDialog userId={userId} lang={lang} open={addVitalOpen} onOpenChange={setAddVitalOpen} onSaved={fetchData} />
      <AddSupplementDialog userId={userId} lang={lang} open={addSupplementOpen} onOpenChange={setAddSupplementOpen} onSaved={fetchData} />
    </div>
  )
}
