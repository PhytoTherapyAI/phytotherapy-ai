// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { createBrowserClient } from "@/lib/supabase"
import { Search, Mic, Send, Flame, ArrowRight, Pill, Bell, Sparkles, Zap, Moon, ShieldCheck, Droplets } from "lucide-react"
import Link from "next/link"

// ── Greeting utils ──
function getGreeting(hour: number, isTr: boolean): string {
  if (hour < 12) return isTr ? "Günaydın" : "Good morning"
  if (hour < 18) return isTr ? "İyi öğleden sonralar" : "Good afternoon"
  return isTr ? "İyi akşamlar" : "Good evening"
}

// ── Circular Vitality Ring ──
function VitalityRing({ value }: { value: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={72} height={72} className="-rotate-90">
      <circle cx={36} cy={36} r={r} stroke="#e7ede9" strokeWidth={6} fill="none" />
      <motion.circle cx={36} cy={36} r={r} stroke="#3c7a52" strokeWidth={6} fill="none"
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }} />
    </svg>
  )
}

const CHIPS = [
  { emoji: "💊", en: "Check my drug interactions", tr: "İlaç etkileşimlerimi kontrol et" },
  { emoji: "🩸", en: "Analyze my blood test", tr: "Kan tahlilimi yorumla" },
  { emoji: "🌿", en: "Best supplement for sleep", tr: "Uyku için en iyi takviye" },
  { emoji: "⚡", en: "Boost my morning energy", tr: "Sabah enerjimi artır" },
  { emoji: "🧘", en: "Reduce stress naturally", tr: "Stresi doğal olarak azalt" },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35 } },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, profile } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [hour, setHour] = useState<number | null>(null)
  const [streak] = useState(12)
  const [vitality] = useState(73)
  const [nextReminder, setNextReminder] = useState<string | null>(null)
  const [insightText, setInsightText] = useState<string | null>(null)

  useEffect(() => { setHour(new Date().getHours()) }, [])
  useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/auth/login") }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (!user) return
    const supabase = createBrowserClient()
    supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id).eq("is_active", true).limit(1).single()
      .then(({ data }) => {
        if (data) setNextReminder(data.brand_name || data.generic_name)
      })
  }, [user])

  useEffect(() => {
    const insights = isTr
      ? ["Magnezyum uyku kalitesini artırabilir.", "D vitamini eksikliği enerji düşüklüğüne yol açabilir.", "Omega-3, beyin sağlığı için A kanıtı düzeyindedir."]
      : ["Magnesium may improve your sleep quality.", "Low vitamin D is linked to fatigue.", "Omega-3 has Grade-A evidence for brain health."]
    setInsightText(insights[new Date().getHours() % insights.length])
  }, [isTr])

  const handleSubmit = () => {
    const q = query.trim()
    if (q) router.push(`/chat?q=${encodeURIComponent(q)}`)
  }

  const handleChip = (chip: typeof CHIPS[0]) => {
    const text = isTr ? chip.tr : chip.en
    setQuery(text)
    inputRef.current?.focus()
  }

  if (isLoading) return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )

  if (!user || !profile) return null

  const firstName = profile.full_name?.split(" ")[0] || (isTr ? "Kullanıcı" : "there")
  const greeting = hour !== null ? getGreeting(hour, isTr) : (isTr ? "Merhaba" : "Hello")

  return (
    <div className="relative min-h-screen bg-stone-50 dark:bg-background overflow-x-hidden">

      {/* ── Subtle background texture ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(60,122,82,0.06),transparent)]" />

      {/* ── Focus overlay ── */}
      <AnimatePresence>
        {focused && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 bg-black/10 backdrop-blur-[2px]"
            onClick={() => { setFocused(false); inputRef.current?.blur() }} />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          HERO — Greeting + Omni-bar + Chips
      ══════════════════════════════════════════════ */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-[70vh] px-4 pt-12 pb-4">
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="w-full max-w-2xl flex flex-col items-center gap-6">

          {/* Greeting */}
          <motion.div variants={fadeUp} className="text-center">
            <p className="text-base text-stone-400 font-medium mb-1">
              {greeting}, <span className="text-foreground font-semibold">{firstName}</span> 👋
            </p>
            <div className="flex items-center justify-center gap-2">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: "spring" }}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-700/50 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Flame className="h-3 w-3" />
                {streak} {isTr ? "günlük seri" : "day streak"}
              </motion.span>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.h1 variants={fadeUp}
            className="text-2xl sm:text-3xl font-bold text-center text-foreground leading-tight max-w-lg">
            {isTr
              ? "Bugün sağlığın için ne yapalım?"
              : "What can we do for your health today?"}
          </motion.h1>

          {/* Omni-bar */}
          <motion.div variants={fadeUp}
            animate={focused ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-30 w-full">
            <div className={`flex items-center gap-3 rounded-2xl bg-white dark:bg-card border transition-all px-4 py-0
              ${focused
                ? "border-primary shadow-[0_0_0_4px_rgba(60,122,82,0.12)] shadow-xl"
                : "border-stone-200/80 dark:border-stone-700 shadow-md hover:shadow-lg hover:border-stone-300 dark:hover:border-stone-600"
              }`}>
              <Search className={`h-5 w-5 flex-shrink-0 transition-colors ${focused ? "text-primary" : "text-stone-400"}`} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={isTr ? "Bir soru sor veya takviye ara..." : "Ask a question or search supplements..."}
                className="flex-1 h-14 sm:h-16 bg-transparent text-sm sm:text-base text-foreground placeholder:text-stone-400 focus:outline-none"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button whileTap={{ scale: 0.92 }}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="Voice input">
                  <Mic className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSubmit}
                  className={`flex items-center justify-center h-9 w-9 rounded-xl transition-all ${
                    query.trim()
                      ? "bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-default"
                  }`}>
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Suggestion chips */}
          <motion.div variants={stagger} className="flex flex-wrap justify-center gap-2 w-full">
            {CHIPS.map((chip, i) => (
              <motion.button
                key={i}
                variants={fadeUp}
                whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChip(chip)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-card border border-stone-200/80 dark:border-stone-700 px-3.5 py-2 text-xs text-stone-600 dark:text-stone-300 hover:border-primary/40 hover:text-primary dark:hover:text-primary transition-all shadow-sm">
                <span>{chip.emoji}</span>
                {isTr ? chip.tr : chip.en}
              </motion.button>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════
          GLANCEABLE SNAPSHOT — 3 cards
      ══════════════════════════════════════════════ */}
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        className="relative z-20 mx-auto max-w-2xl px-4 pb-8">

        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Card 1 — Vitality Score */}
          <motion.div variants={fadeUp} whileHover={{ y: -2 }}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-card border border-stone-200/80 dark:border-stone-800 p-4 shadow-sm">
            <div className="relative flex-shrink-0">
              <VitalityRing value={vitality} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground">{vitality}</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                {isTr ? "Vitalite" : "Vitality"}
              </p>
              <p className="text-xs text-foreground font-medium mt-0.5">
                {isTr ? "Harika gidiyorsun 🌱" : "You're doing great 🌱"}
              </p>
            </div>
          </motion.div>

          {/* Card 2 — Reminder */}
          <motion.div variants={fadeUp} whileHover={{ y: -2 }}>
            <Link href="/calendar"
              className="flex items-center gap-3 rounded-2xl bg-white dark:bg-card border border-stone-200/80 dark:border-stone-800 p-4 shadow-sm h-full">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                  {isTr ? "Hatırlatıcı" : "Reminder"}
                </p>
                <p className="text-xs text-foreground font-medium mt-0.5 truncate">
                  {nextReminder
                    ? (isTr ? `${nextReminder} zamanı` : `Time for ${nextReminder}`)
                    : (isTr ? "Takvime git →" : "Open calendar →")}
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Card 3 — AI Insight */}
          <motion.div variants={fadeUp} whileHover={{ y: -2 }}>
            <Link href="/chat"
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-50 dark:from-primary/10 dark:to-transparent border border-primary/20 dark:border-primary/30 p-4 shadow-sm h-full">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-primary/70 uppercase tracking-wide">
                  {isTr ? "AI Bilgisi" : "AI Insight"}
                </p>
                <p className="text-xs text-foreground font-medium mt-0.5 line-clamp-2">
                  {insightText}
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* View all tools link */}
        <motion.div variants={fadeIn} className="mt-5 text-center">
          <Link href="/tools"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-primary transition-colors">
            {isTr ? "Tüm araçları görüntüle" : "View all tools"}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </motion.div>

    </div>
  )
}
