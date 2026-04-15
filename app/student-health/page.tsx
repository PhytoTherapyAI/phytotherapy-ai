// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, Clock, Coffee, Leaf, Shield, Phone,
  Play, Pause, RotateCcw, Wind, Zap, Moon,
  ArrowRight, AlertTriangle, Check, BookOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

type Lang = "en" | "tr"

// ═══ POMODORO TIMER ═══
function PomodoroTimer({ lang }: { lang: Lang }) {
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setRunning(false)
          setIsBreak(b => {
            setSeconds(b ? 25 * 60 : 5 * 60)
            return !b
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  const pct = isBreak ? ((5 * 60 - seconds) / (5 * 60)) * 100 : ((25 * 60 - seconds) / (25 * 60)) * 100
  const r = 50; const c = 2 * Math.PI * r

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">Pomodoro</h3>
          <Badge variant="secondary" className="text-[9px]">
            {isBreak ? tx("studentHealth.break", lang) : tx("studentHealth.focus", lang)}
          </Badge>
        </div>

        <div className="relative inline-block mb-4">
          <svg width={120} height={120} className="transform -rotate-90">
            <circle cx={60} cy={60} r={r} strokeWidth={6} fill="none" className="stroke-stone-200 dark:stroke-stone-700" />
            <motion.circle cx={60} cy={60} r={r} strokeWidth={6} fill="none" strokeLinecap="round"
              className="stroke-primary" strokeDasharray={c}
              animate={{ strokeDashoffset: c - (pct / 100) * c }}
              transition={{ duration: 0.5 }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold font-mono">{String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button size="sm" variant={running ? "outline" : "default"} className="rounded-xl"
            onClick={() => setRunning(!running)}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl"
            onClick={() => { setRunning(false); setSeconds(isBreak ? 5 * 60 : 25 * 60) }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ═══ BREATHING EXERCISE ═══
function BreathingExercise({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [count, setCount] = useState(4)

  useEffect(() => {
    if (!active) return
    let mounted = true
    const phases: Array<{ p: "inhale" | "hold" | "exhale"; d: number }> = [
      { p: "inhale", d: 4 }, { p: "hold", d: 7 }, { p: "exhale", d: 8 },
    ]
    let idx = 0; let c = phases[0].d
    const interval = setInterval(() => {
      if (!mounted) return
      c--
      if (c <= 0) {
        idx = (idx + 1) % 3
        c = phases[idx].d
        setPhase(phases[idx].p)
      }
      setCount(c)
    }, 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [active])

  const scale = phase === "inhale" ? 1.4 : phase === "hold" ? 1.4 : 0.8

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wind className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">4-7-8 {tx("studentHealth.breathing", lang)}</h3>
        </div>

        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ scale: active ? scale : 1 }}
            transition={{ duration: phase === "inhale" ? 4 : phase === "hold" ? 0.5 : 8, ease: "easeInOut" }}
            className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
            {active ? (
              <div className="text-center">
                <p className="text-xs font-medium text-primary capitalize">
                  {phase === "inhale" ? tx("studentHealth.inhale", lang)
                    : phase === "hold" ? tx("studentHealth.hold", lang)
                    : tx("studentHealth.exhale", lang)}
                </p>
                <p className="text-lg font-bold text-primary">{count}</p>
              </div>
            ) : (
              <Wind className="h-8 w-8 text-primary/40" />
            )}
          </motion.div>
        </div>

        <Button size="sm" className="rounded-xl" onClick={() => { setActive(!active); setPhase("inhale"); setCount(4) }}>
          {active ? tx("studentHealth.stop", lang) : tx("studentHealth.start", lang)}
        </Button>
      </CardContent>
    </Card>
  )
}

// ═══ SMART SWAP CARD ═══
function SmartSwapCard({ from, to }: {
  from: { label: string; emoji: string; risk: string }
  to: { label: string; emoji: string; benefit: string }
}) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-center">
          <span className="text-xl">{from.emoji}</span>
          <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">{from.label}</p>
          <p className="text-[9px] text-red-500/70">{from.risk}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
          <span className="text-xl">{to.emoji}</span>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">{to.label}</p>
          <p className="text-[9px] text-emerald-500/70">{to.benefit}</p>
        </div>
      </div>
    </div>
  )
}

export default function StudentHealthPage() {
  const { lang: rawLang } = useLang()
  const lang: Lang = rawLang === "tr" ? "tr" : "en"

  const swaps = [
    {
      from: { label: tx("studentHealth.swap.caffeine.label", lang), emoji: "☕", risk: tx("studentHealth.swap.caffeine.risk", lang) },
      to: { label: "L-Theanine + Matcha", emoji: "🍵", benefit: tx("studentHealth.swap.caffeine.benefit", lang) },
    },
    {
      from: { label: tx("studentHealth.swap.energy.label", lang), emoji: "⚡", risk: tx("studentHealth.swap.energy.risk", lang) },
      to: { label: "Rhodiola + B12", emoji: "🏔️", benefit: tx("studentHealth.swap.energy.benefit", lang) },
    },
    {
      from: { label: tx("studentHealth.swap.adderall.label", lang), emoji: "💊", risk: tx("studentHealth.swap.adderall.risk", lang) },
      to: { label: "Bacopa + Lion's Mane", emoji: "🧠", benefit: tx("studentHealth.swap.adderall.benefit", lang) },
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 space-y-2">
          <BookOpen className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">{tx("studentHealth.title", lang)}</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {tx("studentHealth.subtitle", lang)}
          </p>
        </motion.div>

        {/* Pomodoro + Breathing side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <PomodoroTimer lang={lang} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <BreathingExercise lang={lang} />
          </motion.div>
        </div>

        {/* Smart Swaps */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">
              {tx("studentHealth.swapsHeading", lang)}
            </h2>
          </div>
          <div className="space-y-3">
            {swaps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}>
                <SmartSwapCard from={s.from} to={s.to} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick tips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border bg-white dark:bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold">{tx("studentHealth.quickTips", lang)}</h3>
          </div>
          {[
            { emoji: "💧", text: tx("studentHealth.tip.water", lang) },
            { emoji: "🚶", text: tx("studentHealth.tip.walk", lang) },
            { emoji: "🌙", text: tx("studentHealth.tip.sleep", lang) },
            { emoji: "🍌", text: tx("studentHealth.tip.omega", lang) },
          ].map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.06 }}
              className="flex items-center gap-3 text-sm">
              <span>{tip.emoji}</span>
              <span className="text-muted-foreground">{tip.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* SOS FAB */}
        <motion.a href="tel:182" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/25">
          <Phone className="h-5 w-5" />
        </motion.a>
      </div>
    </div>
  )
}
