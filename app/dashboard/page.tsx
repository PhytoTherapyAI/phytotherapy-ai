// © 2026 Doctopal — All Rights Reserved
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

const DailyCareCard = dynamic(() => import("@/components/dashboard/DailyCareCard").then(m => ({ default: m.DailyCareCard })), { loading: () => <Skeleton className="h-64 w-full rounded-xl" /> })
const BiologicalAgeCard = dynamic(() => import("@/components/dashboard/BiologicalAgeCard").then(m => ({ default: m.BiologicalAgeCard })), { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const MetabolicPortfolio = dynamic(() => import("@/components/dashboard/MetabolicPortfolio").then(m => ({ default: m.MetabolicPortfolio })), { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const WashoutCountdown = dynamic(() => import("@/components/dashboard/WashoutCountdown").then(m => ({ default: m.WashoutCountdown })), { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const WeeklySummaryCard = dynamic(() => import("@/components/dashboard/WeeklySummaryCard").then(m => ({ default: m.WeeklySummaryCard })), { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const BossFightCard = dynamic(() => import("@/components/dashboard/BossFightCard").then(m => ({ default: m.BossFightCard })), { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const SeasonalCard = dynamic(() => import("@/components/dashboard/SeasonalCard").then(m => ({ default: m.SeasonalCard })), { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> })
const DailySynergyCard = dynamic(() => import("@/components/dashboard/DailySynergyCard").then(m => ({ default: m.DailySynergyCard })), { loading: () => <Skeleton className="h-56 w-full rounded-xl" /> })
import {
  Sparkles, ShieldCheck, Droplets, Pill, Flame, Search,
  ArrowRight, ChevronDown, Zap, Send, Microscope, Leaf, Brain,
  UtensilsCrossed, Moon, Dumbbell, HeartPulse, Users, BarChart3,
  Stethoscope, MessageCircle, Globe, Clock, Trophy, Scissors,
} from "lucide-react"
import Link from "next/link"
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog"
import { TOOL_CATEGORIES } from "@/lib/tools-hierarchy"

// ── Circular Progress Ring ──
function CircularProgress({ value, size = 100, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth}
        fill="none" className="text-stone-200 dark:text-stone-700" />
      <motion.circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#scoreGradient)" strokeWidth={strokeWidth}
        fill="none" strokeLinecap="round" strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }} />
      <defs>
        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3c7a52" />
          <stop offset="100%" stopColor="#6B8F71" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Task Item with strike-through animation ──
function TaskItem({ emoji, label, done, onClick }: { emoji: string; label: string; done: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} className="flex items-center gap-2 py-1.5 group w-full text-left"
      whileTap={{ scale: 0.97 }}>
      <motion.div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${done ? "bg-primary border-primary" : "border-stone-300 dark:border-stone-600"}`}
        animate={done ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
        {done && <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }}
          className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <motion.path d="M5 13l4 4L19 7" /></motion.svg>}
      </motion.div>
      <span className="text-xs">{emoji}</span>
      <span className={`text-sm transition-all ${done ? "line-through text-muted-foreground/50" : "text-foreground"}`}>{label}</span>
      {done && <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        className="ml-auto text-xs">✨</motion.span>}
    </motion.button>
  )
}

const CATEGORY_EMOJI: Record<string, string> = {
  "medical-analysis": "🔬", "medications": "💊", "supplements": "🌿", "mental-health": "🧠",
  "nutrition": "🥗", "sleep": "🌙", "fitness": "💪", "organ-health": "❤️",
  "gender-health": "👫", "tracking": "📊", "prevention": "🛡️", "medical-tools": "🩺",
  "life-stages": "👶", "community": "💬", "advanced": "🔬", "settings": "⚙️", "doctor-tools": "👨‍⚕️",
}
const CATEGORY_ICON_MAP: Record<string, any> = {
  Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  HeartPulse, Users, BarChart3, ShieldCheck, Stethoscope, MessageCircle, Globe,
}
const QUICK_LINKS = [
  { href: "/history", icon: Clock, labelKey: "nav.history" },
  { href: "/badges", icon: Trophy, labelKey: "badges.title" },
  { href: "/analytics", icon: BarChart3, labelKey: "analytics.title" },
  { href: "/operations", icon: Scissors, labelKey: "operations.title" },
  { href: "/wrapped", icon: Sparkles, labelKey: "wrapped.title" },
  { href: "/doctor", icon: Stethoscope, labelKey: "doctor.title" },
]

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } }

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, profile } = useAuth()
  const { lang } = useLang()
  const [checkInData, setCheckInData] = useState<any>(null)
  const [addSupOpen, setAddSupOpen] = useState(false)
  const [supRefreshKey, setSupRefreshKey] = useState(0)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [medications, setMedications] = useState<any[]>([])
  const [hour, setHour] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock daily tasks
  const [tasks, setTasks] = useState([
    { id: "med", emoji: "💊", labelEn: "Medications 0/1", labelTr: "İlaçlar 0/1", done: false },
    { id: "water", emoji: "💧", labelEn: "Water 0/8 glasses", labelTr: "Su 0/8 bardak", done: false },
    { id: "sup", emoji: "🌿", labelEn: "Supplements", labelTr: "Takviyeler", done: false },
    { id: "walk", emoji: "🚶", labelEn: "10 min walk", labelTr: "10 dk yürüyüş", done: false },
  ])
  const [streak] = useState(3)

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const completedCount = tasks.filter(t => t.done).length
  const scorePercent = Math.round((completedCount / tasks.length) * 100)

  const fetchCheckIn = useCallback(async () => {
    if (!user) return
    try {
      const supabase = createBrowserClient()
      const today = new Date().toISOString().split("T")[0]
      const { data } = await supabase.from("daily_check_ins")
        .select("energy_level, sleep_quality, mood, bloating")
        .eq("user_id", user.id).eq("check_date", today).single()
      if (data) setCheckInData(data)
    } catch { /* silent */ }
  }, [user])

  const fetchMeds = useCallback(async () => {
    if (!user) return
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.from("user_medications")
        .select("brand_name, generic_name").eq("user_id", user.id).eq("is_active", true)
      if (data) setMedications(data.map((m: any) => ({ medication_name: m.generic_name || m.brand_name })))
    } catch { /* silent */ }
  }, [user])

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/auth/login") }, [isLoading, isAuthenticated, router])
  useEffect(() => { setHour(new Date().getHours()) }, [])
  useEffect(() => { if (user) { fetchCheckIn(); fetchMeds() } }, [user, fetchCheckIn, fetchMeds])
  useEffect(() => {
    const handler = () => fetchCheckIn()
    window.addEventListener("checkin-complete", handler)
    return () => window.removeEventListener("checkin-complete", handler)
  }, [fetchCheckIn])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-72 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!user || !profile) return null

  const chronologicalAge = profile.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : profile.age
  const isPremium = true
  const greetingKey = hour === null ? "dashboard.morning" : hour < 12 ? "dashboard.morning" : hour < 18 ? "dashboard.afternoon" : "dashboard.evening"
  const firstName = profile.full_name?.split(" ")[0] || ""

  const handleAskAI = () => {
    if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:px-12 space-y-6">

        {/* ═══ BENTO HERO: Command Card + AI Copilot ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── LEFT: Daily Command Card (2 cols) ── */}
          <motion.div variants={fadeUp}
            className="md:col-span-2 relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-stone-200/60 dark:border-stone-800 shadow-lg p-6">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

            <div className="relative flex flex-col sm:flex-row gap-6">
              {/* Score Ring */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <CircularProgress value={scorePercent} size={120} strokeWidth={10} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span key={scorePercent} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-bold text-foreground">{scorePercent}</motion.span>
                    <span className="text-[10px] text-muted-foreground font-medium">/100</span>
                  </div>
                </div>
                {/* Streak badge */}
                <motion.div whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1 border border-amber-200 dark:border-amber-800">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{streak} {lang === "tr" ? "gün seri" : "day streak"}</span>
                </motion.div>
              </div>

              {/* Greeting + Tasks */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-1">
                  {tx(greetingKey, lang).replace("{name}", firstName)} 👋
                </h1>
                <p className="text-xs text-muted-foreground mb-4">
                  {lang === "tr" ? "Günlük görevlerini tamamla, skorunu yükselt!" : "Complete your daily tasks, boost your score!"}
                </p>

                {/* Task List */}
                <div className="space-y-0.5">
                  {tasks.map(t => (
                    <TaskItem key={t.id} emoji={t.emoji} label={lang === "tr" ? t.labelTr : t.labelEn}
                      done={t.done} onClick={() => toggleTask(t.id)} />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                    initial={{ width: 0 }} animate={{ width: `${scorePercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {completedCount}/{tasks.length} {lang === "tr" ? "tamamlandı" : "completed"}
                </p>
              </div>
            </div>

            {/* Beta badge */}
            <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">BETA</span>
              <span>{tx("dashboard.betaTagline", lang)}</span>
            </div>
          </motion.div>

          {/* ── RIGHT: AI Copilot ── */}
          <motion.div variants={fadeUp}
            className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-2xl p-6 flex flex-col">
            {/* Glow effect */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-sage/20 rounded-full blur-2xl" />

            <div className="relative flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold">{lang === "tr" ? "Sağlık Asistanı" : "Health Assistant"}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-300">Online</span>
                </div>
              </div>

              <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                {lang === "tr"
                  ? "İlaç etkileşimleri, takviye önerileri, kan tahlili yorumlama... Her konuda yanınızdayım."
                  : "Drug interactions, supplement advice, blood test analysis... I'm here for everything."}
              </p>

              {/* Chat input */}
              <div className="mt-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                  <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAskAI()}
                    placeholder={lang === "tr" ? "Bugün sağlığınız için ne araştıralım?" : "What should we research for your health today?"}
                    className="w-full rounded-xl bg-white/10 backdrop-blur border border-white/10 pl-10 pr-10 py-3 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  <button onClick={handleAskAI}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/80 transition-colors">
                    <Send className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>

                {/* Quick suggestion chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[
                    { emoji: "💊", text: lang === "tr" ? "İlaç etkileşimi" : "Drug interaction" },
                    { emoji: "🩸", text: lang === "tr" ? "Tahlil yorumla" : "Analyze blood test" },
                  ].map((chip, i) => (
                    <button key={i} onClick={() => { setQuery(chip.text); inputRef.current?.focus() }}
                      className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] text-stone-400 hover:bg-white/10 hover:text-white transition-colors">
                      <span>{chip.emoji}</span> {chip.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ QUICK ACTIONS (Bento Chips) ═══ */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/interaction-checker", icon: ShieldCheck, emoji: "🛡️", labelEn: "Interaction Check", labelTr: "Etkileşim Kontrolü", gradient: "from-emerald-500/10 to-green-500/5" },
            { href: "/blood-test", icon: Microscope, emoji: "🩸", labelEn: "Upload Test", labelTr: "Tahlil Yükle", gradient: "from-rose-500/10 to-pink-500/5" },
            { href: "/calendar", icon: Pill, emoji: "📅", labelEn: "Calendar", labelTr: "Takvim", gradient: "from-blue-500/10 to-indigo-500/5" },
            { href: "/sleep-analysis", icon: Moon, emoji: "😴", labelEn: "Sleep Analysis", labelTr: "Uyku Analizi", gradient: "from-indigo-500/10 to-violet-500/5" },
          ].map((action, i) => (
            <motion.div key={i} whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.97 }}>
              <Link href={action.href}
                className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${action.gradient} border border-stone-200/60 dark:border-stone-800 p-4 transition-all`}>
                <span className="text-lg">{action.emoji}</span>
                <span className="text-xs font-semibold text-foreground">{lang === "tr" ? action.labelTr : action.labelEn}</span>
                <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ DAILY CARE + SYNERGY ═══ */}
        <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
          <DailyCareCard />
          <DailySynergyCard />
        </motion.div>

        {/* ═══ HEALTH INSIGHTS GRID ═══ */}
        <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <WeeklySummaryCard userId={user.id} lang={lang} isPremium={isPremium} />
            <WashoutCountdown key={supRefreshKey} userId={user.id} lang={lang} isPremium={isPremium}
              profileSupplements={profile.supplements || []} onAddSupplement={() => setAddSupOpen(true)} />
            <BossFightCard userId={user.id} lang={lang} isPremium={isPremium} />
          </div>
          <div className="space-y-6">
            <BiologicalAgeCard userId={user.id} lang={lang} isPremium={isPremium}
              chronologicalAge={chronologicalAge} userName={profile.full_name ?? undefined} />
            <MetabolicPortfolio lang={lang} isPremium={isPremium} checkInData={checkInData} />
            <SeasonalCard lang={lang} userConditions={profile.chronic_conditions || []} />
          </div>
        </motion.div>

        {/* ═══ TOOL CATEGORIES ═══ */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">{tx("dashboard.tools", lang)}</h2>
            <Link href="/tools" className="text-xs text-primary hover:underline flex items-center gap-1">
              {tx("dash.allTools", lang)} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {TOOL_CATEGORIES.map((cat) => {
              const emoji = CATEGORY_EMOJI[cat.id] || "📋"
              const isExpanded = expandedCat === cat.id
              return (
                <div key={cat.id} className={`rounded-xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? "col-span-2 sm:col-span-3 lg:col-span-4 shadow-lg ring-1 ring-black/5 dark:ring-white/5" : "hover:shadow-md hover:-translate-y-0.5"
                }`}>
                  <button onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                    className="w-full text-left transition-all"
                    style={{ background: `linear-gradient(135deg, ${cat.color}08 0%, ${cat.color}15 100%)`, borderLeft: `3px solid ${cat.color}` }}>
                    <div className="flex items-center gap-3 p-3.5">
                      <span className="text-lg">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground block">{cat.title[lang]}</span>
                        <span className="text-[10px] text-muted-foreground">{cat.modules.length} {tx("common.tools", lang)}</span>
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                        className="border-t border-border/50 px-2 pb-2 pt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 overflow-hidden"
                        style={{ background: `linear-gradient(180deg, ${cat.color}05 0%, transparent 100%)` }}>
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

          {/* Quick Links */}
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                  <Icon className="h-3 w-3" />
                  {tx(link.labelKey, lang)}
                </Link>
              )
            })}
          </div>
        </motion.div>

        <AddSupplementDialog userId={user.id} lang={lang} open={addSupOpen}
          onOpenChange={setAddSupOpen} onSaved={() => setSupRefreshKey(k => k + 1)} />
      </motion.div>
    </div>
  )
}
