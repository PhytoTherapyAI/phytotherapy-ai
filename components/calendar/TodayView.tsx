// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  Pill, Plus, CalendarDays, Loader2, Bell, Minus,
  Droplets, Activity, Sparkles, Leaf, Check, Flame,
  Clock, X, AlertTriangle, Target, Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { tx, txRandom, txMessages, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { useDailyLogs } from "@/lib/daily-logs-context"
import { reportMutationError } from "@/lib/mutation-errors"
import { AddEventDialog, eventTypeColor } from "./AddEventDialog"
import { AddVitalDialog } from "./AddVitalDialog"
import { AddSupplementDialog } from "./AddSupplementDialog"
import type { UserMedication } from "@/lib/database.types"
import { getSupplementDisplayName } from "@/lib/supplement-data"
import { parseMedDoses, buildMedItemId, buildMedLabel, type MedDose } from "@/lib/med-dose-utils"

interface TodayViewProps {
  userId: string
  lang: Lang
  userName?: string | null
  userWeight?: number | null
  userHeight?: number | null
  userSupplements?: string[]
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
  metadata?: Record<string, unknown> | null
}

function getTodayString() {
  return new Date().toISOString().split("T")[0]
}

// ── Fun, humorous, personal medication messages ──
function medMessages(name: string | null, tr: boolean): string[] {
  const n = name?.split(" ")[0] || ""
  if (tr) {
    return [
      n ? `${n}, bi ilacı daha hallettin! 💊` : "Bi ilacı daha hallettin! 💊",
      n ? `Efsane ${n}! Vücudun alkışlıyor! 👏` : "Efsane! Vücudun alkışlıyor! 👏",
      "İlaç mı aldın? Sen bir kahramansın! 🦸",
      n ? `${n}, bugün de disiplini bozmadın! 🎯` : "Bugün de disiplini bozmadın! 🎯",
      "Hap hap hap! Sağlık yolunda emin adımlar! 🚀",
      n ? `${n}, ilaçların seni seviyor! 💚` : "İlaçların seni seviyor! 💚",
      "Bi' hap daha gitti! Düzenli kullanım = süper güç! 💪",
      "Check! Sağlık rutinin bomba! 💣",
      n ? `${n}, bugün formundasın! ✨` : "Bugün formundasın! ✨",
      "İlaç aldın, gönül aldın! Vücudun teşekkür ediyor 🙏",
      "Doktorun görse gurur duyardı! 👨‍⚕️",
      n ? `Tamam ${n}, bi tane daha gitti! Kolay gelsin! 😎` : "Bi tane daha gitti! Kolay gelsin! 😎",
      "İlaç? Alındı. Sen? Muhteşemsin! 🌟",
      "Sağlık bar'ın doldu! +10 HP! 🎮",
    ]
  }
  return [
    n ? `${n}, another one down! 💊` : "Another one down! 💊",
    n ? `Legend ${n}! Your body is cheering! 👏` : "Legend! Your body is cheering! 👏",
    "Took your meds? You're a hero! 🦸",
    n ? `${n}, discipline on point today! 🎯` : "Discipline on point today! 🎯",
    "Pop pop pop! Steady steps to health! 🚀",
    n ? `${n}, your meds love you back! 💚` : "Your meds love you back! 💚",
    "One more down! Consistency = superpower! 💪",
    "Check! Your health routine is fire! 💣",
    n ? `${n}, you're on a roll today! ✨` : "You're on a roll today! ✨",
    "Meds taken, soul fed! Your body thanks you 🙏",
    "Your doctor would be proud! 👨‍⚕️",
    n ? `Got it ${n}! Easy peasy! 😎` : "Got it! Easy peasy! 😎",
    "Meds? Done. You? Incredible! 🌟",
    "Health bar filled! +10 HP! 🎮",
  ]
}

function allMedsDoneMessages(name: string | null, tr: boolean): string[] {
  const n = name?.split(" ")[0] || ""
  if (tr) {
    return [
      n ? `🎉 ${n}, bugünkü tüm ilaçlarını aldın! Sen bir efsanesin!` : "🎉 Tüm ilaçlarını aldın! Efsane!",
      n ? `🏆 ${n}, tam puan! Bugün eksiksiz! Bravo!` : "🏆 Tam puan! Eksiksiz!",
      n ? `💯 ${n}, %100 tamamlama! Boss fight kazanıldı!` : "💯 %100 tamamlama! Boss fight kazanıldı!",
      "🌟 Hepsini hallettin! Sağlık level atladın!",
    ]
  }
  return [
    n ? `🎉 ${n}, all meds taken! You're a legend!` : "🎉 All meds taken! Legend!",
    n ? `🏆 ${n}, perfect score! Nothing missed! Bravo!` : "🏆 Perfect score!",
    n ? `💯 ${n}, 100% complete! Boss fight won!` : "💯 100% complete! Boss fight won!",
    "🌟 All done! Health level up!",
  ]
}

// ── Fun supplement messages ──
function supMessages(name: string | null, tr: boolean): string[] {
  const n = name?.split(" ")[0] || ""
  if (tr) {
    return [
      n ? `${n}, takviye alındı! 🌿` : "Takviye alındı! 🌿",
      "Doğanın gücü seninle! 💚",
      n ? `${n}, sağlık yatırımı yapıyorsun! 📈` : "Sağlık yatırımı yapıyorsun! 📈",
      "Yeşil ışık! Takviye tamam! ✅",
      "Vücudun teşekkür ediyor! 🙏",
      n ? `${n}, harika! Düzenli kullanım = sonuç! 💪` : "Harika! Düzenli kullanım = sonuç! 💪",
      "Bir adım daha sağlığa! 🌱",
    ]
  }
  return [
    n ? `${n}, supplement taken! 🌿` : "Supplement taken! 🌿",
    "Nature's power is with you! 💚",
    n ? `${n}, investing in your health! 📈` : "Investing in your health! 📈",
    "Green light! Supplement done! ✅",
    "Your body thanks you! 🙏",
    n ? `${n}, great! Consistency = results! 💪` : "Great! Consistency = results! 💪",
    "One step closer to health! 🌱",
  ]
}

function allSupsDoneMessages(name: string | null, tr: boolean): string[] {
  const n = name?.split(" ")[0] || ""
  if (tr) {
    return [
      n ? `🎉 ${n}, tüm takviyeleri aldın! Muhteşem!` : "🎉 Tüm takviyeler tamam!",
      n ? `🏆 ${n}, takviye şampiyonu!` : "🏆 Takviye şampiyonu!",
      "🌿 Tüm takviyeler alındı! Doğanın gücü seninle!",
    ]
  }
  return [
    n ? `🎉 ${n}, all supplements taken! Amazing!` : "🎉 All supplements done!",
    n ? `🏆 ${n}, supplement champion!` : "🏆 Supplement champion!",
    "🌿 All supplements taken! Nature's power is with you!",
  ]
}

const WATER_DONE_EN = [
  "🎉 Daily goal reached! Your cells are partying!",
  "🏆 Water champion! Hydration level: BOSS!",
  "💪 Hydration master! Glow mode activated!",
  "🌊 Goal crushed! Your kidneys are doing a happy dance!",
  "💧 Perfectly hydrated! Skin is glowing!",
  "🐬 Dolphin level hydration! Smooth sailing!",
]
const WATER_DONE_TR = [
  "🎉 Günlük hedefe ulaştın! Hücrelerin parti yapıyor!",
  "🏆 Su şampiyonu! Hidrasyon seviyesi: BOSS!",
  "💪 Hidrasyon ustası! Parlama modu aktif!",
  "🌊 Hedef ezildi! Böbreklerin mutluluk dansı yapıyor!",
  "💧 Mükemmel hidrasyon! Cilt parlıyor!",
  "🐬 Yunus seviye hidrasyon! Harika gidiyorsun!",
]
const WATER_OVER_EN = [
  "😄 Overachiever! Water lover!",
  "🐟 Growing gills? Just kidding — amazing!",
  "🌊 Your kidneys are sending thank you cards!",
  "💧 Above and beyond! Hydration hero!",
  "🏊 Olympic swimmer level hydration!",
  "🧊 Ice cold dedication! You're unstoppable!",
  "🫧 Bubble level unlocked! Keep flowing!",
  "🌈 Your cells are throwing a pool party!",
  "🚿 At this rate you'll need a snorkel!",
  "💎 Diamond tier hydration achieved!",
  "🐠 The fish are jealous of your water intake!",
  "🌊 Tsunami of health incoming!",
  "🧜 Mermaid/Merman transformation: 87% complete!",
  "💦 Even camels are impressed right now!",
  "🌴 Your body is basically an oasis at this point!",
  "🎮 Achievement unlocked: Hydration Overlord!",
  "🛁 Your blood is so clean it sparkles!",
  "🔱 Poseidon just followed you on Instagram!",
  "🎪 Your bladder is planning a protest march!",
  "🏆 Hall of Fame: Water Drinking Division!",
]
const WATER_OVER_TR = [
  "😄 Hedefin üstündesin! Su aşığı!",
  "🐟 Solungaç mı çıkarıyorsun? Şaka — harikasın!",
  "🌊 Böbreklerin teşekkür kartı gönderiyor!",
  "💧 Hedefin ötesinde! Hidrasyon kahramanısın!",
  "🏊 Olimpik yüzücü seviye hidrasyon!",
  "🧊 Buz gibi kararlılık! Durdurulamıyorsun!",
  "🫧 Kabarcık seviyesi açıldı! Akmaya devam!",
  "🌈 Hücrelerin havuz partisi veriyor!",
  "🚿 Bu gidişle şnorkele ihtiyacın olacak!",
  "💎 Elmas seviye hidrasyon kazanıldı!",
  "🐠 Balıklar su içme kapasiteni kıskanıyor!",
  "🌊 Sağlık tsunamisi yaklaşıyor!",
  "🧜 Deniz kızı/erkeği dönüşümü: %87 tamamlandı!",
  "💦 Develer bile etkilendi şu an!",
  "🌴 Vücudun artık bir vaha resmen!",
  "🎮 Başarım açıldı: Hidrasyon Lordu!",
  "🛁 Kanın o kadar temiz ki pırıl pırıl!",
  "🔱 Poseidon seni Instagram'da takip etti!",
  "🎪 Mesanen protesto yürüyüşü planlıyor!",
  "🏆 Şöhretler Salonu: Su İçme Dalı!",
]

// Mini splash messages (shown briefly on each +) — personal and fun
const SPLASH_EN = ["Nice sip! 💧", "Splash! 🌊", "Glug glug! 💦", "+1 glass! 💧", "Refreshing! 🥤", "H₂O power! 💙", "Keep it up! 💧", "Hydrated! 💦", "Your body loves this! 🫧", "Flow state! 🌊"]
const SPLASH_TR = ["Güzel yudum! 💧", "Şıp! 🌊", "Glu glu! 💦", "+1 bardak! 💧", "Ferahlatıcı! 🥤", "H₂O gücü! 💙", "Devam! 💧", "Hidratasyon! 💦", "Vücudun bunu seviyor! 🫧", "Akış modunda! 🌊"]

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Translate common English supplement terms to Turkish ──
const FREQ_MAP: Record<string, string> = {
  "once daily": "günde bir kez", "twice daily": "günde iki kez", "three times daily": "günde üç kez",
  "daily": "günlük", "weekly": "haftalık", "as needed": "gerektiğinde",
  "with meals": "yemeklerle birlikte", "before meals": "yemeklerden önce", "after meals": "yemeklerden sonra",
  "in the morning": "sabah", "at night": "gece", "before bed": "yatmadan önce",
  "with food": "yemekle birlikte", "on empty stomach": "aç karnına",
  "every other day": "gün aşırı", "once a week": "haftada bir",
}
function translateSupDesc(desc: string, tr: boolean): string {
  if (!tr || !desc) return desc
  let result = desc
  for (const [en, trVal] of Object.entries(FREQ_MAP)) {
    result = result.replace(new RegExp(en, "gi"), trVal)
  }
  return result
}

// ── Personal water limits based on weight ──
function calcWaterLimits(w: number | null | undefined): { min: number; max: number } {
  if (!w || w < 30) return { min: 6, max: 16 }
  return {
    min: Math.max(4, Math.round((w * 30) / 250)),
    max: Math.min(24, Math.round((w * 50) / 250)),
  }
}

// ── Full-page confetti ──
function ConfettiOverlay({ show, onDone }: { show: boolean; onDone: () => void }) {
  useEffect(() => {
    if (show) { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }
  }, [show, onDone])
  if (!show) return null
  const colors = ["#5aac74", "#b8965a", "#60a5fa", "#f472b6", "#facc15", "#34d399", "#a78bfa", "#fb923c"]
  // Use deterministic pseudo-random values based on index to avoid hydration mismatch
  const confettiPieces = useMemo(() => Array.from({ length: 50 }, (_, i) => {
    const seed1 = ((i * 7919) % 1000) / 1000
    const seed2 = ((i * 6271) % 1000) / 1000
    const seed3 = ((i * 4817) % 1000) / 1000
    const seed4 = ((i * 3541) % 1000) / 1000
    const seed5 = ((i * 2311) % 1000) / 1000
    return {
      left: seed1 * 100,
      width: 6 + seed2 * 10,
      height: 6 + seed3 * 10,
      isCircle: seed4 > 0.5,
      duration: 1.8 + seed5 * 1.5,
      delay: ((i * 1327) % 1000) / 1000 * 0.6,
      endRotate: 360 + ((i * 5939) % 1000) / 1000 * 360,
    }
  }), [])
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {confettiPieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.left}%`,
          top: "-12px",
          width: `${p.width}px`,
          height: `${p.height}px`,
          backgroundColor: colors[i % colors.length],
          borderRadius: p.isCircle ? "50%" : "2px",
          animation: `confetti-drop ${p.duration}s ${p.delay}s cubic-bezier(0.37,0,0.63,1) forwards`,
        }} />
      ))}
      <style jsx>{`
        @keyframes confetti-drop {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export function TodayView({ userId, lang, userName, userWeight, userHeight, userSupplements }: TodayViewProps) {
  const today = getTodayString()
  const tr = lang === "tr"

  // Session 44 Faz 5: med/sup completion writes flow through DailyLogsContext
  // (single source of truth; toast + Sentry on failure; no silent catch).
  // Local dailyLogs state is preserved for read-only UI bits because
  // TodayView still re-fetches on `daily-log-changed` (line ~770) so the
  // local state stays aligned with whatever the context wrote.
  const { setCompleted: setLogCompleted } = useDailyLogs()

  const [medications, setMedications] = useState<UserMedication[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [addVitalOpen, setAddVitalOpen] = useState(false)
  const [addSupplementOpen, setAddSupplementOpen] = useState(false)
  const [presetEventType, setPresetEventType] = useState<string | undefined>(undefined)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  // Animations
  const [justCompletedMed, setJustCompletedMed] = useState<string | null>(null)
  const [medMessage, setMedMessage] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [allDoneMsg, setAllDoneMsg] = useState<string | null>(null)

  // Supplement toggle + streak + animation
  const [togglingSupId, setTogglingSupId] = useState<string | null>(null)
  const [justCompletedSup, setJustCompletedSup] = useState<string | null>(null)
  const [supMessage, setSupMessage] = useState<string | null>(null)
  const [supStreak, setSupStreak] = useState(0)
  const [allSupsDoneMsg, setAllSupsDoneMsg] = useState<string | null>(null)

  // Supplement bell reminder
  const [bellSupId, setBellSupId] = useState<string | null>(null)
  const [supReminders, setSupReminders] = useState<Record<string, string>>({})
  const [pendingSupBellTime, setPendingSupBellTime] = useState("")

  // Check-in status
  const [checkinDone, setCheckinDone] = useState(false)

  // Water
  const [glasses, setGlasses] = useState(0)
  const [waterTarget, setWaterTarget] = useState(0)
  const [waterLoading, setWaterLoading] = useState(true)
  const [targetDialogOpen, setTargetDialogOpen] = useState(false)
  const [waterBounce, setWaterBounce] = useState(false)
  const [splashMsg, setSplashMsg] = useState<string | null>(null)
  const waterMsgRef = useRef<string | null>(null)
  const [waterMode, setWaterMode] = useState<"glass" | "ml">("glass") // bardak vs ml modu
  const [mlInput, setMlInput] = useState(0) // ml slider value

  // Streak
  const [streak, setStreak] = useState(0)

  // Bell notification — dialog-based
  const [bellMedId, setBellMedId] = useState<string | null>(null)
  const [medReminders, setMedReminders] = useState<Record<string, string>>({})

  // Water limits
  const waterLimits = useMemo(() => calcWaterLimits(userWeight), [userWeight])

  // Set default target = personal minimum (not 8)
  useEffect(() => {
    if (waterTarget === 0) {
      setWaterTarget(waterLimits.min)
    }
  }, [waterLimits, waterTarget])

  // Load saved reminders
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`med-reminders-${userId}`)
      if (saved) setMedReminders(JSON.parse(saved))
      const savedSup = localStorage.getItem(`sup-reminders-${userId}`)
      if (savedSup) setSupReminders(JSON.parse(savedSup))
    } catch { /* ignore */ }
  }, [userId])

  // Pending time in dialog (not saved until confirm)
  const [pendingBellTime, setPendingBellTime] = useState("")

  const confirmReminder = (medId: string) => {
    if (!pendingBellTime) return
    const updated = { ...medReminders, [medId]: pendingBellTime }
    setMedReminders(updated)
    localStorage.setItem(`med-reminders-${userId}`, JSON.stringify(updated))
    saveMedReminderToDb(medId, pendingBellTime)
    setBellMedId(null)
  }

  const removeReminder = async (medId: string) => {
    // Remove from localStorage
    const updated = { ...medReminders }
    delete updated[medId]
    setMedReminders(updated)
    localStorage.setItem(`med-reminders-${userId}`, JSON.stringify(updated))
    // Remove from Supabase
    try {
      const supabase = createBrowserClient()
      const med = medications.find((m) => m.id === medId)
      if (!med) return
      const medName = med.brand_name || med.generic_name || "Medication"
      await supabase.from("calendar_events").delete()
        .eq("user_id", userId).eq("event_type", "medication").eq("title", medName).eq("recurrence", "daily")
      fetchData()
    } catch { /* ignore */ }
    setBellMedId(null)
  }

  const saveMedReminderToDb = async (medId: string, time: string) => {
    try {
      const supabase = createBrowserClient()
      const med = medications.find((m) => m.id === medId)
      if (!med) return
      const medName = med.brand_name || med.generic_name || "Medication"
      const { data: existing } = await supabase.from("calendar_events").select("id")
        .eq("user_id", userId).eq("event_type", "medication").eq("title", medName).eq("recurrence", "daily").single()
      if (existing) {
        await supabase.from("calendar_events").update({ event_time: time }).eq("id", existing.id)
      } else {
        await supabase.from("calendar_events").insert({
          user_id: userId, event_type: "medication", title: medName,
          event_date: today, event_time: time, recurrence: "daily",
        })
      }
      fetchData()
    } catch { /* ignore */ }
  }

  // Supplement bell helpers
  const confirmSupReminder = (supId: string) => {
    if (!pendingSupBellTime) return
    const updated = { ...supReminders, [supId]: pendingSupBellTime }
    setSupReminders(updated)
    localStorage.setItem(`sup-reminders-${userId}`, JSON.stringify(updated))
    saveSupReminderToDb(supId, pendingSupBellTime)
    setBellSupId(null)
  }

  const removeSupReminder = async (supId: string) => {
    const updated = { ...supReminders }
    delete updated[supId]
    setSupReminders(updated)
    localStorage.setItem(`sup-reminders-${userId}`, JSON.stringify(updated))
    // Also clear event_time in DB
    try {
      const supabase = createBrowserClient()
      await supabase.from("calendar_events").update({ event_time: null }).eq("id", supId).eq("user_id", userId)
      fetchData()
    } catch { /* ignore */ }
    setBellSupId(null)
  }

  const saveSupReminderToDb = async (supId: string, time: string) => {
    try {
      const supabase = createBrowserClient()
      await supabase.from("calendar_events").update({ event_time: time }).eq("id", supId).eq("user_id", userId)
      fetchData()
    } catch { /* ignore */ }
  }

  // When bell dialog opens, initialize pending time
  useEffect(() => {
    if (bellMedId) {
      setPendingBellTime(medReminders[bellMedId] || "")
    }
  }, [bellMedId, medReminders])

  useEffect(() => {
    if (bellSupId) {
      const sup = events.find((e) => e.id === bellSupId)
      setPendingSupBellTime(supReminders[bellSupId] || sup?.event_time || "")
    }
  }, [bellSupId, supReminders, events])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const [medsRes, logsRes, eventsRes, recurringSupsRes, waterRes] = await Promise.all([
        supabase.from("user_medications").select("*").eq("user_id", userId).eq("is_active", true),
        supabase.from("daily_logs").select("*").eq("user_id", userId).eq("log_date", today),
        supabase.from("calendar_events").select("*").eq("user_id", userId).eq("event_date", today),
        // Also fetch ALL recurring supplement events (they may have been added on a different date)
        supabase.from("calendar_events").select("*").eq("user_id", userId).eq("event_type", "supplement").eq("recurrence", "daily"),
        supabase.from("water_intake").select("glasses, target_glasses").eq("user_id", userId).eq("intake_date", today).maybeSingle(),
      ])
      if (medsRes.data) setMedications(medsRes.data as UserMedication[])
      if (logsRes.data) setDailyLogs(logsRes.data as DailyLog[])
      // Merge today's events with recurring supplements (dedup by id)
      const todayEvents = (eventsRes.data || []) as CalendarEvent[]
      const recurringSups = (recurringSupsRes.data || []) as CalendarEvent[]
      const seenIds = new Set(todayEvents.map(e => e.id))
      const merged = [...todayEvents, ...recurringSups.filter(s => !seenIds.has(s.id))]
      // Dedup supplements by normalized title (keep first occurrence)
      const seenSuppNames = new Set<string>()
      const deduped = merged.filter(e => {
        if (e.event_type !== "supplement") return true
        const key = e.title.toLowerCase().replace(/[-_\s]/g, "")
        if (seenSuppNames.has(key)) return false
        seenSuppNames.add(key)
        return true
      })
      setEvents(deduped)
      if (waterRes.data) {
        setGlasses(waterRes.data.glasses ?? 0)
        if (waterRes.data.target_glasses) {
          // Use DB target only if within personal range, otherwise use personal min
          const dbTarget = waterRes.data.target_glasses
          const limits = calcWaterLimits(userWeight)
          setWaterTarget(dbTarget >= limits.min && dbTarget <= limits.max ? dbTarget : limits.min)
        }
      }

      // Check-in status
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          const ciRes = await fetch(`/api/check-in?date=${today}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          if (ciRes.ok) {
            const ciData = await ciRes.json()
            setCheckinDone(!!ciData.checkIn)
          }
        }
      } catch { /* ignore */ }

      // Streak (medication)
      try {
        const { data: recentLogs } = await supabase.from("daily_logs")
          .select("log_date, completed").eq("user_id", userId).eq("item_type", "medication")
          .eq("completed", true).order("log_date", { ascending: false }).limit(60)
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
      } catch { /* ignore */ }

      // Streak (supplement)
      try {
        const { data: supLogs } = await supabase.from("daily_logs")
          .select("log_date, completed").eq("user_id", userId).eq("item_type", "supplement")
          .eq("completed", true).order("log_date", { ascending: false }).limit(60)
        if (supLogs) {
          const uniqueDays = [...new Set(supLogs.map((l: { log_date: string }) => l.log_date))]
          let s = 0
          const d2 = new Date()
          for (let i = 0; i < 30; i++) {
            const dateStr = d2.toISOString().split("T")[0]
            if (uniqueDays.includes(dateStr)) { s++ } else if (i > 0) { break }
            d2.setDate(d2.getDate() - 1)
          }
          setSupStreak(s)
        }
      } catch { /* ignore */ }
    } catch (err) {
      console.error("Failed to fetch today data:", err)
    } finally {
      setLoading(false)
      setWaterLoading(false)
    }
  }, [userId, today])

  useEffect(() => { fetchData() }, [fetchData])

  // Evening reminder — if meds/supps not taken by 20:00, show browser notification
  useEffect(() => {
    const checkEvening = () => {
      const hour = new Date().getHours()
      if (hour < 20) return // Only after 8 PM
      const dismissed = sessionStorage.getItem(`evening-reminder-${today}`)
      if (dismissed) return

      const hasPendingMeds = medications.some(m => !dailyLogs.some(l => l.item_type === "medication" && l.item_id?.startsWith(m.id) && l.completed))
      const pendingSups = events.filter(e => e.event_type === "supplement").filter(s => !dailyLogs.some(l => l.item_type === "supplement" && l.item_id === s.id && l.completed))

      if (hasPendingMeds || pendingSups.length > 0) {
        if ("Notification" in window && Notification.permission === "granted") {
          const msg = tr
            ? `Bugün henüz almadığın ilaç/takviye var!`
            : `You have untaken meds/supplements today!`
          new Notification("DoctoPal", { body: msg, icon: "/icon-192.png" })
        }
        sessionStorage.setItem(`evening-reminder-${today}`, "true")
      }
    }
    const timer = setTimeout(checkEvening, 3000) // Check 3s after load
    return () => clearTimeout(timer)
  }, [medications, dailyLogs, events, today, tr])

  // Listen for checkin-complete to hide the card
  useEffect(() => {
    const handler = () => { setCheckinDone(true); fetchData() }
    window.addEventListener("checkin-complete", handler)
    return () => window.removeEventListener("checkin-complete", handler)
  }, [fetchData])

  const medMsgs = useMemo(() => medMessages(userName ?? null, tr), [userName, tr])
  const allDoneMsgs = useMemo(() => allMedsDoneMessages(userName ?? null, tr), [userName, tr])

  // ── Build dose rows: each medication expanded into individual dose tasks ──
  interface MedDoseRow {
    med: UserMedication
    dose: MedDose
    itemId: string   // e.g., raw UUID (single dose) or "uuid-morning" (multi-dose)
    label: string    // e.g., "Glifor (Sabah)" or "Cipralex"
  }
  const medDoseRows: MedDoseRow[] = useMemo(() => {
    const rows: MedDoseRow[] = []
    for (const med of medications) {
      const medName = med.brand_name || med.generic_name || ""
      const doses = parseMedDoses(med.frequency || "", lang)
      for (const dose of doses) {
        rows.push({
          med,
          dose,
          itemId: buildMedItemId(med.id, dose),
          label: buildMedLabel(medName, dose),
        })
      }
    }
    return rows
  }, [medications, lang])

  // ── Med toggle with full-page animation ──
  const toggleMedDose = async (row: MedDoseRow) => {
    const existing = dailyLogs.find((l) => l.item_type === "medication" && l.item_id === row.itemId)
    const wasCompleted = existing?.completed ?? false
    setTogglingId(row.itemId)

    // Optimistic UI update
    if (wasCompleted) {
      // Uncomplete: remove from local state (consistent with DELETE approach)
      setDailyLogs((prev) => prev.filter((l) => !(l.item_type === "medication" && l.item_id === row.itemId)))
    } else {
      // Complete: add to local state
      if (existing) {
        setDailyLogs((prev) => prev.map((l) => l.id === existing.id ? { ...l, completed: true } : l))
      } else {
        setDailyLogs((prev) => [...prev, { id: `temp-${row.itemId}`, user_id: userId, log_date: today, item_type: "medication", item_id: row.itemId, item_name: row.label, completed: true }])
      }
    }

    if (!wasCompleted) {
      setJustCompletedMed(row.itemId)
      setMedMessage(getRandom(medMsgs))
      setTimeout(() => { setJustCompletedMed(null); setMedMessage(null) }, 2500)

      // Check all doses done
      const willBeComplete = medDoseRows.every((r) =>
        r.itemId === row.itemId || dailyLogs.some((l) => l.item_type === "medication" && l.item_id === r.itemId && l.completed)
      )
      if (willBeComplete && medDoseRows.length > 0) {
        setTimeout(() => {
          setShowConfetti(true)
          setAllDoneMsg(getRandom(allDoneMsgs))
          setTimeout(() => setAllDoneMsg(null), 3500)
        }, 600)
      }
    }

    // Session 44 Faz 5: write through DailyLogsContext (toast + Sentry on
    // failure live there). Context dispatches `daily-log-changed` on
    // success which triggers our own listener (line ~772) to refetch
    // dailyLogs from DB and reconcile the local state with truth.
    try {
      await setLogCompleted("medication", row.itemId, row.label, !wasCompleted)
    } catch {
      // Context already toasted + rolled back its own Set; reconcile
      // our optimistic dailyLogs by re-reading from DB.
      void fetchData()
    } finally {
      setTogglingId(null)
    }
  }

  const isDoseCompleted = (itemId: string) => dailyLogs.some((l) => l.item_type === "medication" && l.item_id === itemId && l.completed)
  const completedMeds = medDoseRows.filter((r) => isDoseCompleted(r.itemId)).length
  const allMedsDone = medDoseRows.length > 0 && completedMeds === medDoseRows.length

  // Supplement completion
  const isSupCompleted = (supId: string) => dailyLogs.some((l) => l.item_type === "supplement" && l.item_id === supId && l.completed)
  const supplementEvents = events.filter((e) => e.event_type === "supplement")
  const completedSups = supplementEvents.filter((s) => isSupCompleted(s.id)).length
  const allSupsDone = supplementEvents.length > 0 && completedSups === supplementEvents.length

  const supMsgs = useMemo(() => supMessages(userName ?? null, tr), [userName, tr])
  const allSupDoneMsgs = useMemo(() => allSupsDoneMessages(userName ?? null, tr), [userName, tr])

  // ── Supplement toggle with animation ──
  const toggleSupplement = async (sup: CalendarEvent) => {
    const supName = getSupplementDisplayName(sup.title, lang)
    const existing = dailyLogs.find((l) => l.item_type === "supplement" && l.item_id === sup.id)
    const wasCompleted = existing?.completed ?? false
    setTogglingSupId(sup.id)

    // Optimistic UI update
    if (wasCompleted) {
      // Uncomplete: remove from local state (consistent with DELETE approach)
      setDailyLogs((prev) => prev.filter((l) => !(l.item_type === "supplement" && l.item_id === sup.id)))
    } else {
      // Complete: add to local state
      if (existing) {
        setDailyLogs((prev) => prev.map((l) => l.id === existing.id ? { ...l, completed: true } : l))
      } else {
        setDailyLogs((prev) => [...prev, { id: `temp-sup-${sup.id}`, user_id: userId, log_date: today, item_type: "supplement", item_id: sup.id, item_name: supName, completed: true }])
      }
    }

    if (!wasCompleted) {
      setJustCompletedSup(sup.id)
      setSupMessage(getRandom(supMsgs))
      setTimeout(() => { setJustCompletedSup(null); setSupMessage(null) }, 2500)

      // Check all supplements done
      const willBeComplete = supplementEvents.every((s) =>
        s.id === sup.id || dailyLogs.some((l) => l.item_type === "supplement" && l.item_id === s.id && l.completed)
      )
      if (willBeComplete && supplementEvents.length > 0) {
        setTimeout(() => {
          setShowConfetti(true)
          setAllSupsDoneMsg(getRandom(allSupDoneMsgs))
          setTimeout(() => setAllSupsDoneMsg(null), 3500)
        }, 600)
      }
    }

    // Session 44 Faz 5: same migration as toggleMedDose — context owns
    // the write + cross-view dispatch + error reporting.
    try {
      await setLogCompleted("supplement", sup.id, supName, !wasCompleted)
    } catch {
      void fetchData()
    } finally {
      setTogglingSupId(null)
    }
  }

  // Listen for cross-view sync events
  useEffect(() => {
    const handler = () => { fetchData() }
    window.addEventListener("daily-log-changed", handler)
    window.addEventListener("water-intake-changed", handler)
    return () => {
      window.removeEventListener("daily-log-changed", handler)
      window.removeEventListener("water-intake-changed", handler)
    }
  }, [fetchData])

  // ── Water ──
  const isAtLimit = glasses >= waterLimits.max

  // Stable water message — only changes on glass count change
  const n = userName?.split(" ")[0] || ""
  const getStableWaterMessage = useCallback(() => {
    if (glasses >= waterLimits.max) return "⚠️ " + tx("todayView.waterMaxWarning", lang)
    if (glasses > waterTarget + 5) return getRandom(tr ? [
      "🐳 Yavaşla şampiyon! Böbreklerin rica ediyor!",
      "🚰 Evin su sayacı endişeli şu an!",
      "🌊 Okyanus seninle yarışmak istemiyor!",
      n ? `${n}, su içme rekorunu kırıyorsun galiba!` : "Su içme rekorunu kırıyorsun galiba!",
    ] : [
      "🐳 Easy there champ! Your kidneys are begging!",
      "🚰 Your water bill is getting nervous!",
      "🌊 The ocean doesn't want to compete with you!",
      n ? `${n}, going for the world record?` : "Going for the world record?",
    ])
    if (glasses > waterTarget) return getRandom(tr ? WATER_OVER_TR : WATER_OVER_EN)
    if (glasses >= waterTarget) return getRandom(tr ? WATER_DONE_TR : WATER_DONE_EN)
    if (glasses > waterTarget * 0.75) return getRandom(tr ? [
      n ? `${n}, az kaldı! Son birkaç bardak! 🏁` : "Az kaldı! Son birkaç bardak! 🏁",
      "Bitiş çizgisi görünüyor! Sprint zamanı! 🏃",
      "Neredeyse tamam! Vücudun alkışlıyor! 👏",
      n ? `Hadi ${n}, son hamle! Yapabilirsin! 💪` : "Son hamle! Yapabilirsin! 💪",
    ] : [
      n ? `${n}, almost there! Just a few more! 🏁` : "Almost there! Just a few more! 🏁",
      "Finish line in sight! Sprint time! 🏃",
      "Nearly done! Your body is cheering! 👏",
      n ? `Come on ${n}, final push! You got this! 💪` : "Final push! You got this! 💪",
    ])
    if (glasses > waterTarget * 0.5) return getRandom(tr ? [
      "Yarıyı geçtin! Harika gidiyorsun! 💪",
      "Yarı yol tamam! Tempo süper! 🔥",
      n ? `${n}, güzel ilerliyorsun! Devam! 🌊` : "Güzel ilerliyorsun! Devam! 🌊",
      "İkinci yarıya başladık! Kolay gelsin! ✌️",
    ] : [
      "Past halfway! You're doing great! 💪",
      "Halfway done! Great pace! 🔥",
      n ? `${n}, nice progress! Keep going! 🌊` : "Nice progress! Keep going! 🌊",
      "Second half started! Easy does it! ✌️",
    ])
    if (glasses > waterTarget * 0.25) return getRandom(tr ? [
      "İyi başlangıç! Devam et! 🌱",
      "Güzel gidiyorsun! Bi bardak daha! 💧",
      n ? `${n}, ritmi yakaladın! 🎵` : "Ritmi yakaladın! 🎵",
      "Her yudum bir yatırım! 📈",
    ] : [
      "Good start! Keep going! 🌱",
      "Looking good! One more glass! 💧",
      n ? `${n}, you found the rhythm! 🎵` : "You found the rhythm! 🎵",
      "Every sip is an investment! 📈",
    ])
    if (glasses > 0) return getRandom(tr ? [
      `${waterTarget - glasses} bardak kaldı! Yapabilirsin! 💧`,
      n ? `${n}, harika başladın! ${waterTarget - glasses} bardak daha! 🚀` : `Harika başladın! ${waterTarget - glasses} bardak daha! 🚀`,
      `İlk adım atıldı! Kalan: ${waterTarget - glasses} 💧`,
      "Yolculuk başladı! Her damla önemli! 🌟",
    ] : [
      `${waterTarget - glasses} glasses to go! You got this! 💧`,
      n ? `${n}, great start! ${waterTarget - glasses} more! 🚀` : `Great start! ${waterTarget - glasses} more! 🚀`,
      `First step done! Remaining: ${waterTarget - glasses} 💧`,
      "Journey started! Every drop counts! 🌟",
    ])
    return getRandom(tr ? [
      "İlk bardağınla başla! 💧",
      n ? `Günaydın ${n}! İlk yudumunu al! ☀️` : "Günaydın! İlk yudumunu al! ☀️",
      "Bugün kaç bardak içeceksin? Hadi başla! 🏁",
      "Vücudun susadı! Bir bardak su hak etti! 🥛",
    ] : [
      "Start with your first glass! 💧",
      n ? `Good morning ${n}! Take your first sip! ☀️` : "Good morning! Take your first sip! ☀️",
      "How many glasses today? Let's go! 🏁",
      "Your body is thirsty! It deserves a glass! 🥛",
    ])
  }, [glasses, waterTarget, waterLimits.max, tr, n])

  // Only recalculate message when glasses changes
  useEffect(() => {
    waterMsgRef.current = getStableWaterMessage()
  }, [glasses, getStableWaterMessage])

  const updateWater = useCallback(async (newCount: number) => {
    if (newCount > waterLimits.max) return
    const clamped = Math.max(0, newCount)
    const isAdding = clamped > glasses
    setGlasses(clamped)
    setWaterBounce(true)
    setTimeout(() => setWaterBounce(false), 400)
    if (isAdding) {
      setSplashMsg(getRandom(tr ? SPLASH_TR : SPLASH_EN))
      setTimeout(() => setSplashMsg(null), 900)
    }
    // Session 44 Faz 5: water write was using check-then-write with a
    // silent catch — race-prone AND failures hidden. Switched to atomic
    // upsert against UNIQUE(user_id, intake_date) (Faz 0 SQL S2a) and
    // routed errors through reportMutationError. Long-term, this whole
    // method should delegate to WaterIntakeContext via a setGlasses(n)
    // API, but that's an additive change reserved for a follow-up.
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from("water_intake")
        .upsert(
          { user_id: userId, intake_date: today, glasses: clamped, target_glasses: waterTarget },
          { onConflict: "user_id,intake_date" },
        )
      if (error) throw error
      window.dispatchEvent(new Event("water-intake-changed"))
    } catch (err) {
      reportMutationError(err, {
        op: "todayView.updateWater",
        userId,
        lang,
        extra: { glasses: clamped, date: today },
      })
      // Reconcile optimistic glass count with DB truth on failure.
      void fetchData()
    }
  }, [userId, today, waterTarget, glasses, waterLimits.max, tr, lang, fetchData])

  const updateWaterTarget = async (newTarget: number) => {
    setWaterTarget(newTarget)
    setTargetDialogOpen(false)
    // Session 44 Faz 5: upsert (atomic) + reportMutationError on failure.
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from("water_intake")
        .upsert(
          { user_id: userId, intake_date: today, target_glasses: newTarget },
          { onConflict: "user_id,intake_date" },
        )
      if (error) throw error
    } catch (err) {
      reportMutationError(err, {
        op: "todayView.updateWaterTarget",
        userId,
        lang,
        extra: { target: newTarget, date: today },
      })
    }
  }

  const waterPercent = Math.min(Math.round((glasses / waterTarget) * 100), 100)
  const waterFillPct = Math.min(Math.round((glasses / waterTarget) * 100), 130)

  const waterBarColor = glasses > waterTarget ? "from-cyan-400 via-blue-400 to-emerald-400"
    : waterPercent >= 100 ? "from-blue-400 via-cyan-400 to-teal-400"
    : waterPercent >= 75 ? "from-blue-400 via-blue-500 to-cyan-500"
    : waterPercent >= 50 ? "from-sky-300 via-blue-400 to-blue-500"
    : waterPercent >= 25 ? "from-sky-200 via-blue-300 to-blue-400"
    : "from-blue-100 via-blue-200 to-blue-300"

  const openQuickEvent = (type: string) => { setPresetEventType(type); setAddEventOpen(true) }

  // Profile supplements that aren't in calendar yet
  const calendarSupNames = events.filter((e) => e.event_type === "supplement").map((e) => e.title.toLowerCase())
  const profileSupsNotInCalendar = (userSupplements || []).filter(
    (s) => !calendarSupNames.includes(s.toLowerCase())
  )

  // Supplement dose editing state
  const [editingSupDose, setEditingSupDose] = useState<CalendarEvent | null>(null)
  const [editDose, setEditDose] = useState("")
  const [editDoseSaving, setEditDoseSaving] = useState(false)

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  const bellMed = bellMedId ? medications.find((m) => m.id === bellMedId) : null

  const saveSupDose = async () => {
    if (!editingSupDose || !editDose.trim()) return
    setEditDoseSaving(true)
    try {
      const supabase = createBrowserClient()
      await supabase.from("calendar_events").update({
        description: editDose,
        metadata: { ...((editingSupDose.metadata as Record<string, unknown>) || {}), dose: editDose },
      }).eq("id", editingSupDose.id)
      setEditingSupDose(null)
      fetchData()
    } catch { /* ignore */ } finally { setEditDoseSaving(false) }
  }

  return (
    <div className="space-y-4">
      {/* Full-page confetti */}
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* All-done celebration */}
      {allDoneMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-2xl animate-bounce">
          {allDoneMsg}
        </div>
      )}

      {/* ═══ Overdue Medication Warning ═══ */}
      {(() => {
        const now = new Date()
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
        const overdueRows = medDoseRows.filter((r) => {
          const reminder = medReminders[r.med.id]
          if (!reminder) return false
          return reminder < currentTime && !isDoseCompleted(r.itemId)
        })
        if (overdueRows.length === 0) return null
        return (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {`${overdueRows.map((r) => r.label).join(", ")} ${tx("cal.overdueAlert", lang)}`}
              </p>
              <p className="text-xs text-amber-500/70">
                {tx("cal.dontForgetMeds", lang)}
              </p>
            </div>
          </div>
        )
      })()}

      {/* ═══ Daily Progress ═══ */}
      <div className="flex items-center gap-3 rounded-xl border bg-primary/5 px-4 py-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {allMedsDone && allSupsDone && glasses >= waterTarget
              ? tx("cal.allDoneToday", lang)
              : (tr ? `Bugünkü ilerleme: ${completedMeds}/${medDoseRows.length} ilaç · ${completedSups}/${supplementEvents.length} takviye`
                    : `Today: ${completedMeds}/${medDoseRows.length} meds · ${completedSups}/${supplementEvents.length} supps`)}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-500">{streak}</span>
          </div>
        )}
        {allMedsDone && allSupsDone && glasses >= waterTarget && <span className="text-lg">🎉</span>}
      </div>

      {/* ═══ 2-Column Layout ═══ */}
      <div className="grid gap-6 md:grid-cols-2">

      {/* ══ LEFT COLUMN: Check-in + Meds + Supplements ══ */}
      <div className="space-y-6">

      {/* ═══ Daily Check-in (Sprint 10) ═══ */}
      <Card className={checkinDone ? "border-primary/20" : "border-amber-500/20"}>
        <CardContent className="flex items-center gap-3 p-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${checkinDone ? "bg-primary/10" : "bg-amber-500/10"}`}>
            {checkinDone
              ? <Check className="h-5 w-5 text-primary" />
              : <Sparkles className="h-5 w-5 text-amber-500" />
            }
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {checkinDone ? tx("cal.checkinComplete", lang) : tx("checkin.title", lang)}
            </p>
            <p className="text-xs text-muted-foreground">
              {checkinDone ? tx("cal.checkinRecorded", lang) : tx("checkin.subtitle", lang)}
            </p>
          </div>
          {!checkinDone && (
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              onClick={() => window.dispatchEvent(new Event("open-checkin"))}
            >
              {tx("summary.doCheckin", lang)}
            </Button>
          )}
        </CardContent>
      </Card>

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
                  <Flame className="h-3 w-3" /> {streak} {tx("cal.daysStreak", lang)}
                </span>
              )}
              {medDoseRows.length > 0 && (
                <Badge variant={allMedsDone ? "default" : "secondary"} className={allMedsDone ? "bg-primary text-white" : ""}>
                  {allMedsDone ? "✓" : `${completedMeds}/${medDoseRows.length}`}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medDoseRows.length === 0 ? (
            <div className="text-center py-4">
              <Pill className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">{tx("cal.noMeds", lang)}</p>
              <Button variant="link" size="sm" className="mt-1 text-primary" onClick={() => (window.location.href = "/profile")}>
                {tx("cal.addMedsProfile", lang)}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {medDoseRows.map((row) => {
                const completed = isDoseCompleted(row.itemId)
                const isToggling = togglingId === row.itemId
                const justDone = justCompletedMed === row.itemId
                const reminderTime = medReminders[row.med.id]
                return (
                  <div key={row.itemId} className="relative">
                    <button
                      type="button"
                      onClick={() => !isToggling && toggleMedDose(row)}
                      disabled={isToggling}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                        justDone ? "scale-[1.03] border-primary bg-primary/15 shadow-lg shadow-primary/10" :
                        completed ? "bg-primary/5 border-primary/30" :
                        "hover:bg-muted/50 hover:border-primary/20 active:scale-[0.97]"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        completed ? "border-primary bg-primary scale-110" : "border-muted-foreground/30"
                      }`}>
                        {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                         : completed ? <Check className="h-4 w-4 text-white" /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-all ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {row.label}
                        </p>
                        <div className="flex items-center gap-2">
                          {(row.med.dosage || row.med.frequency) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {[row.med.dosage, row.dose.suffix ? row.dose.suffix : row.med.frequency].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {reminderTime && (
                            <span className="flex items-center gap-0.5 text-xs text-primary/70">
                              <Clock className="h-3 w-3" /> {reminderTime}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); setBellMedId(row.med.id) }}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${
                          reminderTime ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                    </button>
                    {/* Completion message — floats above */}
                    {justDone && medMessage && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-2xl bg-primary px-4 py-1.5 text-xs font-medium text-white shadow-xl z-20 whitespace-nowrap animate-bounce">
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

      {/* ═══ Bell Reminder Dialog ═══ */}
      <Dialog open={!!bellMedId} onOpenChange={(o) => !o && setBellMedId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {tx("cal.reminderTime", lang)}
            </DialogTitle>
          </DialogHeader>
          {bellMed && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{bellMed.brand_name || bellMed.generic_name}</span>
                {" — "}{tx("cal.reminderQuestion", lang)}
              </p>

              {/* Time input */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="time"
                  value={pendingBellTime}
                  onChange={(e) => setPendingBellTime(e.target.value)}
                  className="flex-1 rounded-xl border bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Quick time presets */}
              <div className="flex flex-wrap gap-2">
                {["07:00", "08:00", "09:00", "12:00", "18:00", "21:00", "22:00"].map((t) => (
                  <button key={t} onClick={() => setPendingBellTime(t)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      pendingBellTime === t ? "bg-primary text-white shadow-sm" : "border bg-card hover:border-primary hover:text-primary"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                {medReminders[bellMed.id] && (
                  <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                    onClick={() => removeReminder(bellMed.id)}>
                    {tx("cal.removeReminder", lang)}
                  </Button>
                )}
                <Button className="flex-1" onClick={() => confirmReminder(bellMed.id)}
                  disabled={!pendingBellTime}>
                  <Check className="h-4 w-4 mr-1.5" />
                  {tx("cal.confirmReminder", lang)}
                </Button>
              </div>

              {/* Current reminder info */}
              {medReminders[bellMed.id] && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{tx("cal.currentReminder", lang)}</p>
                  <p className="text-sm font-medium text-primary mt-0.5">
                    {bellMed.brand_name || bellMed.generic_name} — {medReminders[bellMed.id]}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* All supplements done celebration */}
      {allSupsDoneMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-2xl animate-bounce">
          {allSupsDoneMsg}
        </div>
      )}

      {/* ═══ Overdue Supplement Warning ═══ */}
      {(() => {
        const now = new Date()
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
        const overdueSups = supplementEvents.filter((s) => {
          const reminder = supReminders[s.id] || s.event_time
          if (!reminder) return false
          return reminder < currentTime && !isSupCompleted(s.id)
        })
        if (overdueSups.length === 0) return null
        return (
          <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 animate-pulse">
            <Leaf className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">
                {`${overdueSups.map((s) => getSupplementDisplayName(s.title, lang)).join(", ")} ${tx("cal.overdueAlert", lang)}`}
              </p>
              <p className="text-xs text-primary/70">
                {tx("cal.dontForgetSupp", lang)}
              </p>
            </div>
          </div>
        )
      })()}

      {/* ═══ Supplements ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              {tx("cal.supplements", lang)}
            </span>
            <div className="flex items-center gap-2">
              {supStreak > 0 && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Flame className="h-3 w-3" /> {supStreak} {tx("cal.daysStreak", lang)}
                </span>
              )}
              {supplementEvents.length > 0 && (
                <Badge variant={allSupsDone ? "default" : "secondary"} className={allSupsDone ? "bg-primary text-white" : ""}>
                  {allSupsDone ? "✓" : `${completedSups}/${supplementEvents.length}`}
                </Badge>
              )}
              <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setAddSupplementOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                {tx("cal.addSuppBtn", lang)}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile supplements not yet in calendar */}
          {profileSupsNotInCalendar.length > 0 && (
            <div className="mb-3 rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs text-muted-foreground mb-2">
                {tx("cal.fromProfile", lang)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profileSupsNotInCalendar.map((s) => (
                  <span key={s} className="rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {supplementEvents.length === 0 && profileSupsNotInCalendar.length === 0 ? (
            <div className="text-center py-4">
              <Leaf className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {tx("cal.addSuppHint", lang)}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {supplementEvents.map((sup) => {
                const completed = isSupCompleted(sup.id)
                const isToggling = togglingSupId === sup.id
                const justDone = justCompletedSup === sup.id
                const reminderTime = supReminders[sup.id] || sup.event_time
                const safety = (sup.metadata as Record<string, string>)?.safety
                const safetyColor = safety === "caution" ? "text-amber-500" : safety === "dangerous" ? "text-red-500" : "text-primary"
                return (
                  <div key={sup.id} className="relative">
                    <button
                      type="button"
                      onClick={() => !isToggling && toggleSupplement(sup)}
                      disabled={isToggling}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                        justDone ? "scale-[1.03] border-primary bg-primary/15 shadow-lg shadow-primary/10" :
                        completed ? "bg-primary/5 border-primary/30" :
                        "hover:bg-muted/50 hover:border-primary/20 active:scale-[0.97]"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        completed ? "border-primary bg-primary scale-110" : "border-muted-foreground/30"
                      }`}>
                        {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                         : completed ? <Check className="h-4 w-4 text-white" /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-all ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          <span className={safetyColor}>●</span> {getSupplementDisplayName(sup.title, lang)}
                        </p>
                        <div className="flex items-center gap-2">
                          {sup.description && (
                            <span
                              role="link"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); setEditingSupDose(sup); setEditDose(sup.description || "") }}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setEditingSupDose(sup); setEditDose(sup.description || "") } }}
                              className="text-xs text-muted-foreground truncate hover:text-primary hover:underline transition-colors cursor-pointer"
                            >
                              {translateSupDesc(sup.description, tr)} ✎
                            </span>
                          )}
                          {reminderTime && (
                            <span className="flex items-center gap-0.5 text-xs text-primary/70">
                              <Clock className="h-3 w-3" /> {reminderTime}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); setBellSupId(sup.id) }}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${
                          reminderTime ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                    </button>
                    {/* Completion message — floats above */}
                    {justDone && supMessage && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-2xl bg-primary px-4 py-1.5 text-xs font-medium text-white shadow-xl z-20 whitespace-nowrap animate-bounce">
                        {supMessage}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Supplement Bell Reminder Dialog ═══ */}
      <Dialog open={!!bellSupId} onOpenChange={(o) => !o && setBellSupId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {tx("cal.reminderTime", lang)}
            </DialogTitle>
          </DialogHeader>
          {bellSupId && (() => {
            const sup = events.find((e) => e.id === bellSupId)
            if (!sup) return null
            return (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{getSupplementDisplayName(sup.title, lang)}</span>
                  {" — "}{tx("cal.reminderQuestion", lang)}
                </p>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    type="time"
                    value={pendingSupBellTime}
                    onChange={(e) => setPendingSupBellTime(e.target.value)}
                    className="flex-1 rounded-xl border bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["07:00", "08:00", "09:00", "12:00", "18:00", "21:00", "22:00"].map((t) => (
                    <button key={t} onClick={() => setPendingSupBellTime(t)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        pendingSupBellTime === t ? "bg-primary text-white shadow-sm" : "border bg-card hover:border-primary hover:text-primary"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  {supReminders[bellSupId] && (
                    <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                      onClick={() => removeSupReminder(bellSupId)}>
                      {tx("cal.removeReminder", lang)}
                    </Button>
                  )}
                  <Button className="flex-1" onClick={() => confirmSupReminder(bellSupId)}
                    disabled={!pendingSupBellTime}>
                    <Check className="h-4 w-4 mr-1.5" />
                    {tx("cal.confirmReminder", lang)}
                  </Button>
                </div>
                {supReminders[bellSupId] && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{tx("cal.currentReminder", lang)}</p>
                    <p className="text-sm font-medium text-primary mt-0.5">
                      {getSupplementDisplayName(sup.title, lang)} — {supReminders[bellSupId]}
                    </p>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      </div>{/* END LEFT COLUMN */}

      {/* ══ RIGHT COLUMN: Events + Water + Quick Actions ══ */}
      <div className="space-y-6">

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
                <div key={evt.id} className="flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted/30 group cursor-pointer"
                  onClick={() => { setEditingEvent(evt); setAddEventOpen(true) }}>
                  <span className={`mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full ${eventTypeColor(evt.event_type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{evt.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {evt.event_time && <span className="text-xs text-muted-foreground">{evt.event_time}</span>}
                      <span className="text-xs text-muted-foreground/70">{tx(`cal.eventType.${evt.event_type}`, lang)}</span>
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      const supabase = createBrowserClient()
                      await supabase.from("calendar_events").delete().eq("id", evt.id).eq("user_id", userId)
                      fetchData()
                    }}
                    className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 text-muted-foreground/40"
                    title={tx("cal.deleteEvent", lang)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Water Tracker v5 ═══ */}
      <Card className={`relative ${glasses >= waterTarget ? "border-blue-400/30" : ""}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              {tx("cal.water", lang)}
            </span>
            <div className="flex items-center gap-2">
              {/* Mode toggle: bardak ↔ ml */}
              <button
                onClick={() => { setWaterMode(waterMode === "glass" ? "ml" : "glass"); setMlInput(0) }}
                className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-blue-400 hover:text-blue-500"
              >
                {waterMode === "glass" ? "mL" : tx("cal.waterUnit", lang)}
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
              </button>
              <Button variant="outline" size="sm" className="h-8 rounded-full gap-1.5" onClick={() => setTargetDialogOpen(true)}>
                <Target className="h-3.5 w-3.5" />
                {`${tx("cal.setGoalTitle", lang)}: ${waterTarget}`}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waterLoading ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-4">
              {waterMode === "glass" ? (
                <>
                  {/* Glass mode: - | droplet + number | + */}
                  <div className="flex items-center justify-center gap-6">
                    <Button variant="outline" size="icon" onClick={() => updateWater(glasses - 1)} disabled={glasses <= 0} className="h-12 w-12 rounded-full">
                      <Minus className="h-5 w-5" />
                    </Button>

                    <div className="relative flex flex-col items-center gap-2">
                      <div className={`relative h-24 w-20 transition-transform ${waterBounce ? "scale-110" : "scale-100"} dark:drop-shadow-[0_0_12px_rgba(96,165,250,0.3)]`}
                        style={{ transitionDuration: "400ms", transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
                        <svg viewBox="0 0 64 80" className="h-full w-full drop-shadow-sm">
                          <defs>
                            <clipPath id="dropClip"><path d="M32 4C32 4 8 36 8 52C8 65.25 18.75 76 32 76C45.25 76 56 65.25 56 52C56 36 32 4 32 4Z" /></clipPath>
                            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#22d3ee" />
                            </linearGradient>
                          </defs>
                          <path d="M32 4C32 4 8 36 8 52C8 65.25 18.75 76 32 76C45.25 76 56 65.25 56 52C56 36 32 4 32 4Z"
                            fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400/30 dark:text-blue-400/20" />
                          <rect x="0" y={80 - (Math.min(waterFillPct, 100) / 100) * 72}
                            width="64" height={72} clipPath="url(#dropClip)"
                            className="transition-all duration-700 ease-out"
                            fill={glasses >= waterTarget ? "url(#wg)" : glasses > waterTarget * 0.5 ? "#60a5fa" : "#93c5fd"} />
                          <ellipse cx="24" cy="46" rx="4" ry="8" fill="white" opacity="0.25" />
                        </svg>
                        {splashMsg && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 px-3.5 py-1 text-sm font-medium text-white shadow-xl whitespace-nowrap z-10 animate-bounce">
                            {splashMsg}
                          </div>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">{glasses}</span>
                        <span className="text-lg text-muted-foreground/40">/</span>
                        <span className="text-lg text-muted-foreground/60">{waterTarget}</span>
                        <span className="text-xs text-muted-foreground/40 ml-1">({glasses * 250} ml)</span>
                      </div>
                    </div>

                    <Button variant="default" size="icon" onClick={() => updateWater(glasses + 1)}
                      disabled={isAtLimit}
                      className={`h-12 w-12 rounded-full shadow-lg transition-all ${
                        isAtLimit ? "bg-muted text-muted-foreground shadow-none" : "bg-blue-400 hover:bg-blue-500 text-white shadow-blue-400/20 active:scale-90"
                      }`}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* ML mode: slider + manual input */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{glasses * 250 + mlInput}</span>
                      <span className="text-lg text-muted-foreground/60">ml</span>
                      <span className="text-xs text-muted-foreground/40 ml-1">/ {waterTarget * 250} ml</span>
                    </div>

                    {/* Slider — smooth, round handle, 50 step, 1000 max */}
                    <div className="w-full space-y-2">
                      <input
                        type="range"
                        min={0}
                        max={1000}
                        step={50}
                        value={mlInput}
                        onChange={(e) => setMlInput(parseInt(e.target.value))}
                        className="water-slider w-full h-2.5 bg-muted rounded-full cursor-pointer"
                      />
                      <style jsx>{`
                        .water-slider { -webkit-appearance: none; appearance: none; }
                        .water-slider::-webkit-slider-thumb {
                          -webkit-appearance: none; appearance: none;
                          width: 22px; height: 22px; border-radius: 50%;
                          background: linear-gradient(135deg, #60a5fa, #22d3ee);
                          border: 3px solid white; box-shadow: 0 2px 8px rgba(96,165,250,0.4);
                          cursor: pointer; transition: transform 0.15s ease;
                        }
                        .water-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
                        .water-slider::-webkit-slider-thumb:active { transform: scale(0.95); }
                        .water-slider::-moz-range-thumb {
                          width: 22px; height: 22px; border-radius: 50%;
                          background: linear-gradient(135deg, #60a5fa, #22d3ee);
                          border: 3px solid white; box-shadow: 0 2px 8px rgba(96,165,250,0.4);
                          cursor: pointer;
                        }
                        .water-slider::-webkit-slider-runnable-track { height: 10px; border-radius: 5px; }
                        .water-slider::-moz-range-track { height: 10px; border-radius: 5px; }
                      `}</style>
                      <div className="flex justify-between text-xs text-muted-foreground/70">
                        <span>0 ml</span>
                        <span className="font-semibold text-blue-400 text-sm">{mlInput} ml</span>
                        <span>1000 ml</span>
                      </div>
                    </div>

                    {/* Quick ml presets */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[100, 200, 250, 330, 500, 750, 1000].map((ml) => (
                        <button key={ml} onClick={() => setMlInput(ml)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            mlInput === ml ? "bg-blue-400 text-white shadow-sm" : "border bg-card hover:border-blue-400 hover:text-blue-500"
                          }`}>
                          {ml} ml
                        </button>
                      ))}
                    </div>

                    {/* Add button */}
                    <Button
                      onClick={() => {
                        if (mlInput > 0) {
                          const newGlasses = glasses + Math.round(mlInput / 250)
                          if (newGlasses <= waterLimits.max) {
                            updateWater(newGlasses)
                            setMlInput(0)
                          }
                        }
                      }}
                      disabled={mlInput === 0 || isAtLimit}
                      className="w-full bg-blue-400 hover:bg-blue-500 text-white rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      {tr ? `${mlInput} ml Ekle` : `Add ${mlInput} ml`}
                    </Button>
                  </div>
                </>
              )}

              {/* Water intoxication warning */}
              {isAtLimit && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {tx("cal.waterWarnTitle", lang)}
                  </p>
                </div>
              )}

              {/* Progress bar with ml label */}
              <div className="space-y-1">
                <div className="w-full rounded-full bg-muted h-3 overflow-hidden">
                  <div className={`h-3 rounded-full bg-gradient-to-r ${waterBarColor} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.min(waterFillPct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/70">
                  <span>0 ml</span>
                  <span className="font-medium">{glasses * 250} / {waterTarget * 250} ml</span>
                  <span>{waterTarget * 250} ml</span>
                </div>
              </div>

              {/* Message */}
              <p className={`text-sm text-center ${
                isAtLimit ? "font-medium text-amber-500" :
                glasses >= waterTarget ? "font-medium text-blue-400" : "text-muted-foreground"
              }`}>
                {waterMsgRef.current || getStableWaterMessage()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Water Target Dialog */}
      <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              {tx("cal.setGoalTitle", lang)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {userWeight && (
              <p className="text-xs text-muted-foreground text-center">
                {tr ? `Kişisel aralığın: ${waterLimits.min}–${waterLimits.max} bardak (${userWeight} kg)`
                     : `Your range: ${waterLimits.min}–${waterLimits.max} glasses (${userWeight} kg)`}
              </p>
            )}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: waterLimits.max - waterLimits.min + 1 }, (_, i) => waterLimits.min + i)
                .filter((t) => t <= waterLimits.max)
                .slice(0, 12) // max 12 options
                .map((t) => (
                  <button key={t} onClick={() => updateWaterTarget(t)}
                    className={`h-10 rounded-xl text-sm font-medium transition-all ${
                      waterTarget === t ? "bg-blue-400 text-white scale-105 shadow-md" : "border bg-card hover:border-blue-400 hover:text-blue-500"
                    }`}>
                    {t}
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      </div>{/* END RIGHT COLUMN */}
      </div>{/* END 2-Column Grid */}

      {/* Supplement Dose Edit Dialog */}
      <Dialog open={!!editingSupDose} onOpenChange={(o) => !o && setEditingSupDose(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              {tx("cal.adjustDose", lang)}
            </DialogTitle>
          </DialogHeader>
          {editingSupDose && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{getSupplementDisplayName(editingSupDose.title, lang)}</span>
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-medium">{tx("cal.dailyDose", lang)}</label>
                <input
                  type="text"
                  value={editDose}
                  onChange={(e) => setEditDose(e.target.value)}
                  placeholder={editingSupDose.description || tx("cal.doseExample", lang)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
              <Button className="w-full" onClick={saveSupDose} disabled={editDoseSaving || !editDose.trim()}>
                {editDoseSaving ? "..." : tx("cal.saveDose", lang)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <AddEventDialog userId={userId} lang={lang} open={addEventOpen} onOpenChange={(o) => { setAddEventOpen(o); if (!o) setEditingEvent(null) }} onSaved={fetchData} selectedDate={today} presetEventType={presetEventType} editEvent={editingEvent} />
      <AddVitalDialog userId={userId} lang={lang} open={addVitalOpen} onOpenChange={setAddVitalOpen} onSaved={fetchData} />
      <AddSupplementDialog userId={userId} lang={lang} open={addSupplementOpen} onOpenChange={setAddSupplementOpen} onSaved={fetchData} />
    </div>
  )
}
