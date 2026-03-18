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
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { AddEventDialog, eventTypeColor } from "./AddEventDialog"
import { AddVitalDialog } from "./AddVitalDialog"
import { AddSupplementDialog } from "./AddSupplementDialog"
import type { UserMedication } from "@/lib/database.types"

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

const TODAY = new Date().toISOString().split("T")[0]

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
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: "-12px",
          width: `${6 + Math.random() * 10}px`,
          height: `${6 + Math.random() * 10}px`,
          backgroundColor: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation: `confetti-drop ${1.8 + Math.random() * 1.5}s ${Math.random() * 0.6}s cubic-bezier(0.37,0,0.63,1) forwards`,
        }} />
      ))}
      <style jsx>{`
        @keyframes confetti-drop {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg) scale(0.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export function TodayView({ userId, lang, userName, userWeight, userHeight, userSupplements }: TodayViewProps) {
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

  // Animations
  const [justCompletedMed, setJustCompletedMed] = useState<string | null>(null)
  const [medMessage, setMedMessage] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [allDoneMsg, setAllDoneMsg] = useState<string | null>(null)

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

  // When bell dialog opens, initialize pending time
  useEffect(() => {
    if (bellMedId) {
      setPendingBellTime(medReminders[bellMedId] || "")
    }
  }, [bellMedId, medReminders])

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
        if (waterRes.data.target_glasses) {
          // Use DB target only if within personal range, otherwise use personal min
          const dbTarget = waterRes.data.target_glasses
          const limits = calcWaterLimits(userWeight)
          setWaterTarget(dbTarget >= limits.min && dbTarget <= limits.max ? dbTarget : limits.min)
        }
      }

      // Streak
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
    } catch (err) {
      console.error("Failed to fetch today data:", err)
    } finally {
      setLoading(false)
      setWaterLoading(false)
    }
  }, [userId, today])

  useEffect(() => { fetchData() }, [fetchData])

  const medMsgs = useMemo(() => medMessages(userName ?? null, tr), [userName, tr])
  const allDoneMsgs = useMemo(() => allMedsDoneMessages(userName ?? null, tr), [userName, tr])

  // ── Med toggle with full-page animation ──
  const toggleMedication = async (med: UserMedication) => {
    const medName = med.brand_name || med.generic_name || "Unknown"
    const existing = dailyLogs.find((l) => l.item_type === "medication" && l.item_id === med.id)
    const wasCompleted = existing?.completed ?? false
    setTogglingId(med.id)

    // Optimistic
    if (existing) {
      setDailyLogs((prev) => prev.map((l) => l.id === existing.id ? { ...l, completed: !l.completed } : l))
    } else {
      setDailyLogs((prev) => [...prev, { id: `temp-${med.id}`, user_id: userId, log_date: today, item_type: "medication", item_id: med.id, item_name: medName, completed: true }])
    }

    if (!wasCompleted) {
      setJustCompletedMed(med.id)
      setMedMessage(getRandom(medMsgs))
      setTimeout(() => { setJustCompletedMed(null); setMedMessage(null) }, 2500)

      // Check all done
      const willBeComplete = medications.every((m) =>
        m.id === med.id || dailyLogs.some((l) => l.item_type === "medication" && l.item_id === m.id && l.completed)
      )
      if (willBeComplete && medications.length > 0) {
        setTimeout(() => {
          setShowConfetti(true)
          setAllDoneMsg(getRandom(allDoneMsgs))
          setTimeout(() => setAllDoneMsg(null), 3500)
        }, 600)
      }
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
    } catch { fetchData() } finally { setTogglingId(null) }
  }

  const isMedCompleted = (medId: string) => dailyLogs.some((l) => l.item_type === "medication" && l.item_id === medId && l.completed)
  const completedMeds = medications.filter((m) => isMedCompleted(m.id)).length
  const allMedsDone = medications.length > 0 && completedMeds === medications.length

  // ── Water ──
  const isAtLimit = glasses >= waterLimits.max

  // Stable water message — only changes on glass count change
  const n = userName?.split(" ")[0] || ""
  const getStableWaterMessage = useCallback(() => {
    if (glasses >= waterLimits.max) return tr ? "⚠️ Lütfen daha fazla içme! Su zehirlenmesi riski var." : "⚠️ Please stop! Risk of water intoxication."
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
    try {
      const supabase = createBrowserClient()
      const { data: existing } = await supabase.from("water_intake").select("id").eq("user_id", userId).eq("intake_date", today).single()
      if (existing) {
        await supabase.from("water_intake").update({ glasses: clamped, updated_at: new Date().toISOString() }).eq("id", existing.id)
      } else {
        await supabase.from("water_intake").insert({ user_id: userId, intake_date: today, glasses: clamped, target_glasses: waterTarget })
      }
    } catch { /* ignore */ }
  }, [userId, today, waterTarget, glasses, waterLimits.max, tr])

  const updateWaterTarget = async (newTarget: number) => {
    setWaterTarget(newTarget)
    setTargetDialogOpen(false)
    try {
      const supabase = createBrowserClient()
      const { data: existing } = await supabase.from("water_intake").select("id").eq("user_id", userId).eq("intake_date", today).single()
      if (existing) {
        await supabase.from("water_intake").update({ target_glasses: newTarget }).eq("id", existing.id)
      }
    } catch { /* ignore */ }
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

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  const bellMed = bellMedId ? medications.find((m) => m.id === bellMedId) : null

  return (
    <div className="space-y-5">
      {/* Full-page confetti */}
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* All-done celebration */}
      {allDoneMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-2xl animate-bounce">
          {allDoneMsg}
        </div>
      )}

      {/* ═══ Daily Progress ═══ */}
      <div className="flex items-center gap-3 rounded-xl border bg-primary/5 px-4 py-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {allMedsDone && glasses >= waterTarget
              ? (tr ? "Bugün harikasın! Tüm görevler tamam." : "Amazing day! All tasks done.")
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
                  <Flame className="h-3 w-3" /> {streak} {tr ? "gün" : "days"}
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
                const reminderTime = medReminders[med.id]
                const medName = med.brand_name || med.generic_name || ""
                return (
                  <div key={med.id} className="relative">
                    <button
                      type="button"
                      onClick={() => !isToggling && toggleMedication(med)}
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
                          {medName}
                        </p>
                        <div className="flex items-center gap-2">
                          {(med.dosage || med.frequency) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {[med.dosage, med.frequency].filter(Boolean).join(" · ")}
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
                        onClick={(e) => { e.stopPropagation(); setBellMedId(med.id) }}
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
              {tr ? "Hatırlatma Saati" : "Reminder Time"}
            </DialogTitle>
          </DialogHeader>
          {bellMed && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{bellMed.brand_name || bellMed.generic_name}</span>
                {" — "}{tr ? "ne zaman hatırlatayım?" : "when should I remind you?"}
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
                    {tr ? "Kaldır" : "Remove"}
                  </Button>
                )}
                <Button className="flex-1" onClick={() => confirmReminder(bellMed.id)}
                  disabled={!pendingBellTime}>
                  <Check className="h-4 w-4 mr-1.5" />
                  {tr ? "Onayla" : "Confirm"}
                </Button>
              </div>

              {/* Current reminder info */}
              {medReminders[bellMed.id] && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{tr ? "Mevcut hatırlatma:" : "Current reminder:"}</p>
                  <p className="text-sm font-medium text-primary mt-0.5">
                    {bellMed.brand_name || bellMed.generic_name} — {medReminders[bellMed.id]}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              {tr ? "Ekle" : "Add"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile supplements not yet in calendar */}
          {profileSupsNotInCalendar.length > 0 && (
            <div className="mb-3 rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs text-muted-foreground mb-2">
                {tr ? "Profilindeki takviyeler:" : "From your profile:"}
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
          {events.filter((e) => e.event_type === "supplement").length === 0 && profileSupsNotInCalendar.length === 0 ? (
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
                    {sup.description && <p className="text-xs text-muted-foreground truncate">{translateSupDesc(sup.description, tr)}</p>}
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
                <div key={evt.id} className="flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted/30 group">
                  <span className={`mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full ${eventTypeColor(evt.event_type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{evt.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {evt.event_time && <span className="text-xs text-muted-foreground">{evt.event_time}</span>}
                      <span className="text-xs text-muted-foreground/50">{tx(`cal.eventType.${evt.event_type}`, lang)}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const supabase = createBrowserClient()
                      await supabase.from("calendar_events").delete().eq("id", evt.id).eq("user_id", userId)
                      fetchData()
                    }}
                    className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 text-muted-foreground/40"
                    title={tr ? "Sil" : "Delete"}
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
                {waterMode === "glass" ? "mL" : (tr ? "Bardak" : "Glass")}
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
              </button>
              <Button variant="outline" size="sm" className="h-8 rounded-full gap-1.5" onClick={() => setTargetDialogOpen(true)}>
                <Target className="h-3.5 w-3.5" />
                {tr ? `Hedef Belirle: ${waterTarget}` : `Set Goal: ${waterTarget}`}
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
                      <div className={`relative h-24 w-20 transition-transform ${waterBounce ? "scale-110" : "scale-100"}`}
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
                      <div className="flex justify-between text-xs text-muted-foreground/50">
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
                    {tr ? "Lütfen daha fazla içmeyin! Su zehirlenmesi geçirebilirsiniz." : "Please don't drink more! You risk water intoxication."}
                  </p>
                </div>
              )}

              {/* Progress bar with ml label */}
              <div className="space-y-1">
                <div className="w-full rounded-full bg-muted h-3 overflow-hidden">
                  <div className={`h-3 rounded-full bg-gradient-to-r ${waterBarColor} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.min(waterFillPct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/50">
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
              {tr ? "Hedef Belirle" : "Set Goal"}
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

      {/* Dialogs */}
      <AddEventDialog userId={userId} lang={lang} open={addEventOpen} onOpenChange={setAddEventOpen} onSaved={fetchData} selectedDate={today} presetEventType={presetEventType} />
      <AddVitalDialog userId={userId} lang={lang} open={addVitalOpen} onOpenChange={setAddVitalOpen} onSaved={fetchData} />
      <AddSupplementDialog userId={userId} lang={lang} open={addSupplementOpen} onOpenChange={setAddSupplementOpen} onSaved={fetchData} />
    </div>
  )
}
