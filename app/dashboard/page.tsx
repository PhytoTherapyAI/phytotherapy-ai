// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Flame, Sparkles, ShieldCheck, Search, Send, ArrowRight,
  ChevronDown, Pill, Moon, Microscope, Leaf, Brain, Dumbbell,
  BarChart3, Stethoscope, Clock, Trophy, Scissors, Lock,
  Zap, Bell, CheckCircle2, HeartPulse, TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog"
import { TOOL_CATEGORIES } from "@/lib/tools-hierarchy"

const DailyCareCard   = dynamic(() => import("@/components/dashboard/DailyCareCard").then(m => ({ default: m.DailyCareCard })),   { loading: () => <Skeleton className="h-64 w-full rounded-xl" /> })
const BiologicalAgeCard  = dynamic(() => import("@/components/dashboard/BiologicalAgeCard").then(m => ({ default: m.BiologicalAgeCard })),  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const MetabolicPortfolio = dynamic(() => import("@/components/dashboard/MetabolicPortfolio").then(m => ({ default: m.MetabolicPortfolio })), { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const WashoutCountdown   = dynamic(() => import("@/components/dashboard/WashoutCountdown").then(m => ({ default: m.WashoutCountdown })),   { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const WeeklySummaryCard  = dynamic(() => import("@/components/dashboard/WeeklySummaryCard").then(m => ({ default: m.WeeklySummaryCard })),  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const BossFightCard      = dynamic(() => import("@/components/dashboard/BossFightCard").then(m => ({ default: m.BossFightCard })),      { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const SeasonalCard       = dynamic(() => import("@/components/dashboard/SeasonalCard").then(m => ({ default: m.SeasonalCard })),       { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const DailySynergyCard   = dynamic(() => import("@/components/dashboard/DailySynergyCard").then(m => ({ default: m.DailySynergyCard })),   { loading: () => <Skeleton className="h-56 w-full rounded-xl" /> })

// ─────────────────────────────────────────────
// BEHAVIORAL SCIENCE ATOMS
// ─────────────────────────────────────────────

// Habit Ring — Apple Fitness tarzı
function HabitRing({ label, emoji, pct, color }: { label: string; emoji: string; pct: number; color: string }) {
  const r = 22; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-14 h-14">
        <svg width={56} height={56} className="-rotate-90">
          <circle cx={28} cy={28} r={r} stroke="currentColor" strokeWidth={5} fill="none" className="text-stone-100 dark:text-stone-800" />
          <motion.circle cx={28} cy={28} r={r} stroke={color} strokeWidth={5} fill="none"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
            transition={{ duration: 1, ease: "easeOut" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg">{emoji}</span>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  )
}

// Streak Badge — Loss Aversion
function StreakBadge({ count, isTr }: { count: number; isTr: boolean }) {
  const atRisk = new Date().getHours() >= 20
  return (
    <motion.div
      animate={atRisk ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: atRisk ? Infinity : 0, duration: 2 }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 border ${atRisk
        ? "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-600"
        : "bg-amber-50/60 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/40"
      }`}>
      <Flame className={`h-4 w-4 ${atRisk ? "text-orange-500" : "text-amber-500"}`} />
      <span className={`text-sm font-bold ${atRisk ? "text-orange-600" : "text-amber-600"}`}>
        {count} {isTr ? "günlük seri" : "day streak"}
      </span>
      {atRisk && (
        <span className="text-[10px] text-orange-500 font-medium">
          {isTr ? "⚠️ Risk altında!" : "⚠️ At risk!"}
        </span>
      )}
    </motion.div>
  )
}

// Task Item — Zeigarnik + Instant Reward
function TaskItem({ emoji, label, done, onClick }: { emoji: string; label: string; done: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} className="flex items-center gap-3 py-2 w-full text-left group"
      whileTap={{ scale: 0.98 }}>
      <motion.div
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          done ? "bg-primary border-primary" : "border-stone-300 dark:border-stone-600 group-hover:border-primary/60"
        }`}
        animate={done ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.25 }}>
        {done && (
          <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.2 }}
            className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <motion.path d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </motion.div>
      <span className="text-base">{emoji}</span>
      <span className={`text-sm flex-1 transition-all ${done ? "line-through text-muted-foreground/40" : "text-foreground"}`}>
        {label}
      </span>
      <AnimatePresence>
        {done && (
          <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-sm">✨</motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// Curiosity Gap Card — Variable Reward
function CuriosityCard({ isTr, isPremium }: { isTr: boolean; isPremium: boolean }) {
  const [revealed, setRevealed] = useState(false)
  const insights = isTr
    ? ["Magnezyum alımın uyku kalitene doğrudan etki ediyor olabilir.", "Bu haftaki serin havalar D vitamini sentezini düşürüyor.", "Sabah kortizol piki için adaptogen penceren 06:00–09:00 arası."]
    : ["Your magnesium intake may be directly affecting your sleep quality.", "This week's cool weather is reducing your vitamin D synthesis.", "Your adaptogen window for morning cortisol is 06:00–09:00."]
  const insight = insights[new Date().getDate() % insights.length]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="rounded-2xl border bg-gradient-to-br from-primary/5 to-emerald-50/50 dark:from-primary/10 dark:to-transparent p-5 relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary mb-1">
            {isTr ? "AI Bu Hafta 2 Örüntü Tespit Etti" : "AI Detected 2 Patterns This Week"}
          </p>
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.p key="revealed" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="text-sm text-foreground leading-relaxed">{insight}</motion.p>
            ) : (
              <motion.div key="hidden" className="space-y-1.5">
                <div className="h-3 rounded bg-stone-200 dark:bg-stone-700 w-full blur-[3px]" />
                <div className="h-3 rounded bg-stone-200 dark:bg-stone-700 w-4/5 blur-[3px]" />
              </motion.div>
            )}
          </AnimatePresence>
          {!revealed && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRevealed(true)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <Lock className="h-3 w-3" />
              {isTr ? "Görüntülemek için tıkla →" : "Tap to reveal →"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Social Proof Strip — Herd Behavior
function SocialProofStrip({ isTr }: { isTr: boolean }) {
  const items = isTr
    ? ["🌿 847 kişi bu sabah Magnezyum takip etti", "💊 2.3K kullanıcı ilaç etkileşimini kontrol etti", "😴 523 kişi uyku protokolünü tamamladı"]
    : ["🌿 847 users tracked Magnesium this morning", "💊 2.3K users checked drug interactions", "😴 523 users completed their sleep protocol"]
  const [idx, setIdx] = useState(0)
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % items.length), 3500); return () => clearInterval(t) }, [])

  return (
    <div className="flex items-center gap-2 overflow-hidden rounded-xl bg-muted/40 px-4 py-2.5">
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500 animate-pulse" />
      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }} className="text-xs text-muted-foreground truncate">
          {items[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// CONSTS
// ─────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  "medical-analysis": "🔬", "medications": "💊", "supplements": "🌿", "mental-health": "🧠",
  "nutrition": "🥗", "sleep": "🌙", "fitness": "💪", "organ-health": "❤️",
  "gender-health": "👫", "tracking": "📊", "prevention": "🛡️", "medical-tools": "🩺",
  "life-stages": "👶", "community": "💬", "advanced": "🔬", "settings": "⚙️", "doctor-tools": "👨‍⚕️",
}
const QUICK_LINKS = [
  { href: "/history",   icon: Clock,       labelKey: "nav.history" },
  { href: "/badges",    icon: Trophy,      labelKey: "badges.title" },
  { href: "/analytics", icon: BarChart3,   labelKey: "analytics.title" },
  { href: "/operations",icon: Scissors,    labelKey: "operations.title" },
  { href: "/wrapped",   icon: Sparkles,    labelKey: "wrapped.title" },
  { href: "/doctor",    icon: Stethoscope, labelKey: "doctor.title" },
]
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } }

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function DashboardPage() {
  const router   = useRouter()
  const { user, isAuthenticated, isLoading, profile } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [checkInData, setCheckInData] = useState<any>(null)
  const [addSupOpen,  setAddSupOpen]  = useState(false)
  const [supRefreshKey, setSupRefreshKey] = useState(0)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [hour, setHour] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const streak = 3

  // Tasks — Zeigarnik Effect (endowed progress: start at 1/4 done)
  const [tasks, setTasks] = useState([
    { id: "med",   emoji: "💊", labelEn: "Take morning medications", labelTr: "Sabah ilaçlarını al",      done: true  },
    { id: "water", emoji: "💧", labelEn: "Drink 8 glasses of water",  labelTr: "8 bardak su iç",          done: false },
    { id: "sup",   emoji: "🌿", labelEn: "Take your supplements",     labelTr: "Takviyelerini al",         done: false },
    { id: "walk",  emoji: "🚶", labelEn: "10-minute walk",            labelTr: "10 dakika yürüyüş",        done: false },
  ])
  const doneCt = tasks.filter(t => t.done).length
  const scorePct = Math.round((doneCt / tasks.length) * 100)

  const fetchCheckIn = useCallback(async () => {
    if (!user) return
    try {
      const supabase = createBrowserClient()
      const today = new Date().toISOString().split("T")[0]
      const { data } = await supabase.from("daily_check_ins")
        .select("energy_level,sleep_quality,mood,bloating")
        .eq("user_id", user.id).eq("check_date", today).single()
      if (data) setCheckInData(data)
    } catch { /* silent */ }
  }, [user])

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/auth/login") }, [isLoading, isAuthenticated, router])
  useEffect(() => { setHour(new Date().getHours()) }, [])
  useEffect(() => { if (user) fetchCheckIn() }, [user, fetchCheckIn])
  useEffect(() => {
    const handler = () => fetchCheckIn()
    window.addEventListener("checkin-complete", handler)
    return () => window.removeEventListener("checkin-complete", handler)
  }, [fetchCheckIn])

  if (isLoading) return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  )
  if (!user || !profile) return null

  const firstName = profile.full_name?.split(" ")[0] || ""
  const isPremium = true
  const chronologicalAge = profile.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : profile.age
  const greeting = hour === null ? (isTr ? "Merhaba" : "Hello")
    : hour < 12 ? (isTr ? "Günaydın" : "Good morning")
    : hour < 18 ? (isTr ? "İyi günler" : "Good afternoon")
    : (isTr ? "İyi akşamlar" : "Good evening")

  const handleAskAI = () => { if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query.trim())}`) }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:px-12 space-y-5">

        {/* ══════════════════════════════════════════
            ZONE 1 — THE HOOK
            Streak (Loss Aversion) + Habit Rings + Greeting
        ══════════════════════════════════════════ */}
        <motion.div variants={fadeUp}
          className="rounded-2xl bg-white dark:bg-card border border-stone-200/60 dark:border-stone-800 shadow-sm overflow-hidden">

          {/* Top bar — Streak */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h1 className="text-lg font-bold">{greeting}, {firstName} 👋</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doneCt === tasks.length
                  ? (isTr ? "🎉 Harika! Bugün her şeyi tamamladın." : "🎉 Amazing! You've completed everything today.")
                  : (isTr ? `${tasks.length - doneCt} görev kaldı — bitirmek için geri döndün!` : `${tasks.length - doneCt} tasks left — you came back to finish!`)}
              </p>
            </div>
            <StreakBadge count={streak} isTr={isTr} />
          </div>

          {/* Habit Rings Row */}
          <div className="px-5 py-4 flex items-center gap-6 overflow-x-auto scrollbar-hide">
            <HabitRing label={isTr ? "İlaç" : "Meds"} emoji="💊" pct={tasks.find(t=>t.id==="med")?.done ? 100 : 0} color="#3c7a52" />
            <HabitRing label={isTr ? "Su" : "Water"} emoji="💧" pct={35} color="#3b82f6" />
            <HabitRing label={isTr ? "Takviye" : "Supps"} emoji="🌿" pct={tasks.find(t=>t.id==="sup")?.done ? 100 : 0} color="#8b5cf6" />
            <HabitRing label={isTr ? "Hareket" : "Move"} emoji="🚶" pct={tasks.find(t=>t.id==="walk")?.done ? 100 : 20} color="#f59e0b" />

            {/* Score ring */}
            <div className="ml-auto flex flex-col items-center gap-1 flex-shrink-0">
              <div className="relative">
                <svg width={52} height={52} className="-rotate-90">
                  <circle cx={26} cy={26} r={20} stroke="#e5e7eb" strokeWidth={5} fill="none" />
                  <motion.circle cx={26} cy={26} r={20} stroke="#3c7a52" strokeWidth={5} fill="none"
                    strokeLinecap="round" strokeDasharray={2*Math.PI*20}
                    initial={{ strokeDashoffset: 2*Math.PI*20 }}
                    animate={{ strokeDashoffset: 2*Math.PI*20 - (scorePct/100)*2*Math.PI*20 }}
                    transition={{ duration: 1, ease: "easeOut" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{scorePct}</span>
                </div>
              </div>
              <span className="text-[9px] text-muted-foreground">{isTr ? "Skor" : "Score"}</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="px-5 pb-4">
            <SocialProofStrip isTr={isTr} />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            ZONE 2 — DAILY PROTOCOL (2-col on desktop)
            Zeigarnik Effect + Endowed Progress + AI Copilot
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Tasks — Zeigarnik + Endowed Progress */}
          <motion.div variants={fadeUp}
            className="rounded-2xl bg-white dark:bg-card border border-stone-200/60 dark:border-stone-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">{isTr ? "Günlük Protokol" : "Daily Protocol"}</h3>
              <span className="text-[11px] text-muted-foreground bg-stone-100 dark:bg-stone-800 rounded-full px-2.5 py-1">
                {doneCt}/{tasks.length} {isTr ? "tamamlandı" : "done"}
              </span>
            </div>

            {/* Endowed Progress Bar */}
            <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 mb-4 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                initial={{ width: "25%" }}
                animate={{ width: `${Math.max(25, scorePct)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }} />
            </div>
            <p className="text-[10px] text-muted-foreground mb-4 -mt-2">
              {isTr ? "✅ İyi başlangıç — zaten %25 oradasın!" : "✅ Great start — you're already 25% there!"}
            </p>

            <div className="divide-y divide-stone-50 dark:divide-stone-800/50">
              {tasks.map(t => (
                <TaskItem key={t.id} emoji={t.emoji}
                  label={isTr ? t.labelTr : t.labelEn}
                  done={t.done}
                  onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} />
              ))}
            </div>
          </motion.div>

          {/* AI Copilot + Curiosity Gap */}
          <motion.div variants={fadeUp} className="space-y-4">
            {/* AI Ask */}
            <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 text-white p-5 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{isTr ? "Sağlık Asistanı" : "Health Assistant"}</span>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Online
                  </span>
                </div>
                <div className="relative">
                  <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAskAI()}
                    placeholder={isTr ? "Bugün ne araştıralım?" : "What should we explore today?"}
                    className="w-full rounded-xl bg-white/10 border border-white/10 pl-4 pr-10 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  <button onClick={handleAskAI}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/80 transition-colors">
                    <Send className="h-3 w-3 text-white" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {[
                    { e: "💊", t: isTr ? "İlaç etkileşimi" : "Drug interaction" },
                    { e: "🩸", t: isTr ? "Tahlil yorumla" : "Analyze test" },
                  ].map((c, i) => (
                    <button key={i} onClick={() => { setQuery(c.t); inputRef.current?.focus() }}
                      className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] text-stone-400 hover:bg-white/10 hover:text-white transition-colors">
                      {c.e} {c.t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Curiosity Gap */}
            <CuriosityCard isTr={isTr} isPremium={isPremium} />
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════
            ZONE 3 — QUICK ACTIONS
            Commitment + Completion Hooks
        ══════════════════════════════════════════ */}
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/interaction-checker", emoji: "🛡️", labelEn: "Interaction Check",  labelTr: "Etkileşim Kontrolü",  color: "from-emerald-500/10 to-green-500/5",   border: "hover:border-emerald-400/40" },
              { href: "/blood-test",          emoji: "🩸", labelEn: "Upload Blood Test",  labelTr: "Tahlil Yükle",          color: "from-rose-500/10 to-pink-500/5",      border: "hover:border-rose-400/40" },
              { href: "/calendar",            emoji: "📅", labelEn: "Calendar",           labelTr: "Takvim",                color: "from-blue-500/10 to-indigo-500/5",    border: "hover:border-blue-400/40" },
              { href: "/sleep-analysis",      emoji: "😴", labelEn: "Sleep Analysis",     labelTr: "Uyku Analizi",          color: "from-violet-500/10 to-purple-500/5",  border: "hover:border-violet-400/40" },
            ].map((a, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link href={a.href}
                  className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${a.color} border border-stone-200/60 dark:border-stone-800 ${a.border} p-4 transition-all`}>
                  <span className="text-lg">{a.emoji}</span>
                  <span className="text-xs font-semibold text-foreground">{isTr ? a.labelTr : a.labelEn}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            ZONE 4 — DEEP INSIGHT CARDS
            Investment + Sunk Cost + Momentum
        ══════════════════════════════════════════ */}
        <motion.div variants={fadeUp} className="grid gap-5 md:grid-cols-2">
          <DailyCareCard />
          <DailySynergyCard />
        </motion.div>

        <motion.div variants={fadeUp} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-5">
            <WeeklySummaryCard userId={user.id} lang={lang} isPremium={isPremium} />
            <WashoutCountdown key={supRefreshKey} userId={user.id} lang={lang} isPremium={isPremium}
              profileSupplements={profile.supplements || []} onAddSupplement={() => setAddSupOpen(true)} />
            <BossFightCard userId={user.id} lang={lang} isPremium={isPremium} />
          </div>
          <div className="space-y-5">
            <BiologicalAgeCard userId={user.id} lang={lang} isPremium={isPremium}
              chronologicalAge={chronologicalAge} userName={profile.full_name ?? undefined} />
            <MetabolicPortfolio lang={lang} isPremium={isPremium} checkInData={checkInData} />
            <SeasonalCard lang={lang} userConditions={profile.chronic_conditions || []} />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            ZONE 5 — TOOL DISCOVERY
            Curiosity + Completion Seeking
        ══════════════════════════════════════════ */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">{tx("dashboard.tools", lang)}</h2>
            <Link href="/tools" className="text-xs text-primary hover:underline flex items-center gap-1">
              {tx("dash.allTools", lang)} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {TOOL_CATEGORIES.map(cat => {
              const emoji = CATEGORY_EMOJI[cat.id] || "📋"
              const isExp = expandedCat === cat.id
              return (
                <div key={cat.id} className={`rounded-xl overflow-hidden transition-all duration-300 ${
                  isExp ? "col-span-2 sm:col-span-3 lg:col-span-4 shadow-md ring-1 ring-black/5 dark:ring-white/5" : "hover:shadow-sm hover:-translate-y-0.5"
                }`}>
                  <button onClick={() => setExpandedCat(isExp ? null : cat.id)} className="w-full text-left"
                    style={{ background: `linear-gradient(135deg,${cat.color}08 0%,${cat.color}15 100%)`, borderLeft: `3px solid ${cat.color}` }}>
                    <div className="flex items-center gap-3 p-3.5">
                      <span className="text-lg">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground block">{cat.title[lang]}</span>
                        <span className="text-[10px] text-muted-foreground">{cat.modules.length} {tx("common.tools", lang)}</span>
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExp ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="border-t border-border/50 px-2 pb-2 pt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 overflow-hidden"
                        style={{ background: `linear-gradient(180deg,${cat.color}05 0%,transparent 100%)` }}>
                        {cat.modules.map(mod => (
                          <Link key={mod.id} href={mod.href}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                            {mod.title[lang]}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                  <Icon className="h-3 w-3" />{tx(link.labelKey, lang)}
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            ZONE 6 — PEAK-END RULE
            Positive close + Tomorrow teaser
        ══════════════════════════════════════════ */}
        <motion.div variants={fadeUp}
          className="rounded-2xl bg-gradient-to-r from-primary/8 to-emerald-500/8 border border-primary/20 p-5 text-center">
          <p className="text-2xl mb-2">{doneCt === tasks.length ? "🏆" : "💪"}</p>
          <p className="text-sm font-semibold text-foreground">
            {doneCt === tasks.length
              ? (isTr ? "Bugün her şeyi tamamladın! Serinle gurur duyuyorum." : "You completed everything today! You should be proud.")
              : (isTr ? `${tasks.length - doneCt} görev kaldı. Her tıklama sağlığına yatırım.` : `${tasks.length - doneCt} tasks left. Every click is an investment in your health.`)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isTr ? "Yarın seni burada görmek istiyorum 🌱" : "I want to see you here tomorrow too 🌱"}
          </p>
        </motion.div>

        <AddSupplementDialog userId={user.id} lang={lang} open={addSupOpen}
          onOpenChange={setAddSupOpen} onSaved={() => setSupRefreshKey(k => k + 1)} />
      </motion.div>
    </div>
  )
}
