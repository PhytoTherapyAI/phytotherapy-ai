// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy, TrendingDown, TrendingUp, Share2,
  Lock, Sparkles, Award, Heart, Flame,
  Star, ChevronRight, Shield,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ── Mock sparkline data ──
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data); const min = Math.min(...data)
  const h = 32; const w = 80
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ")
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Achievement Card ──
function AchievementCard({ emoji, title, unlocked, description }: {
  emoji: string; title: string; unlocked: boolean; description: string
}) {
  const [showConfetti, setShowConfetti] = useState(false)

  return (
    <motion.button
      whileTap={unlocked ? { scale: 0.95 } : undefined}
      onClick={() => { if (unlocked) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1000) } }}
      className={`relative rounded-2xl p-4 text-left transition-all overflow-hidden ${
        unlocked
          ? "bg-gradient-to-br from-emerald-50 to-primary/5 dark:from-emerald-900/20 dark:to-primary/10 border-2 border-emerald-200/50 shadow-sm hover:shadow-md"
          : "bg-stone-100 dark:bg-stone-900 border border-stone-200/50 opacity-60"
      }`}>
      <div className="flex items-start gap-3">
        <span className={`text-2xl ${unlocked ? "" : "grayscale"}`}>{emoji}</span>
        <div>
          <p className={`text-xs font-bold ${unlocked ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>{title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        </div>
        {unlocked ? (
          <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-[8px] shrink-0">Unlocked</Badge>
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground/40 ml-auto shrink-0" />
        )}
      </div>
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i}
              initial={{ x: "50%", y: "50%", scale: 1, opacity: 1 }}
              animate={{ x: `${20 + Math.random() * 60}%`, y: `${Math.random() * 80}%`, scale: 0, opacity: 0 }}
              transition={{ duration: 0.7, delay: i * 0.03 }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: ["#22c55e", "#facc15", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c", "#34d399", "#3c7a52"][i] }} />
          ))}
        </div>
      )}
    </motion.button>
  )
}

// ── AI Bubble ──
function AIBubble({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 items-start">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-card border px-4 py-3 shadow-sm">
        <p className="text-xs text-foreground leading-relaxed">{text}</p>
      </div>
    </motion.div>
  )
}

export default function HealthReportCardPage() {
  const { lang } = useLang()

  const milestones = [
    { label: "HbA1c", from: 7.2, to: 6.3, data: [7.2, 7.0, 6.8, 6.5, 6.3], unit: "%", improved: true },
    { label: "Vitamin D", from: 14, to: 42, data: [14, 22, 30, 38, 42], unit: "ng/mL", improved: true },
    { label: "CRP", from: 5.8, to: 1.4, data: [5.8, 4.2, 3.0, 2.1, 1.4], unit: "mg/L", improved: true },
    { label: "Cholesterol", from: 240, to: 195, data: [240, 228, 215, 205, 195], unit: "mg/dL", improved: true },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* ═══ CELEBRATION HERO ═══ */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-center text-white relative overflow-hidden">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
            <Trophy className="h-14 w-14 mx-auto mb-3 drop-shadow-lg" />
          </motion.div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
            className="text-5xl font-bold mb-2">92</motion.div>
          <p className="text-xs text-white/80">Health Score</p>
          <h2 className="text-xl font-bold mt-2">You Had an Amazing Year!</h2>
          <p className="text-xs text-white/70 mt-1 max-w-sm mx-auto">
            You reversed your metabolic age by 3 years. Here's what you achieved:
          </p>

          <Button size="sm" className="mt-4 rounded-xl bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
            <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share My Story
          </Button>
        </motion.div>

        {/* AI Comment */}
        <AIBubble text="Incredible progress! Your HbA1c dropped from 7.2% to 6.3% — that's pre-diabetes reversed. Your dedication to the anti-inflammatory protocol paid off beautifully." />

        {/* ═══ MILESTONE SPARKLINE CARDS ═══ */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Key Milestones
          </h3>
          {milestones.map((m, i) => (
            <motion.div key={m.label}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}>
              <Card className="rounded-2xl hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-foreground">{m.to}{m.unit}</span>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                        <Badge className="bg-emerald-100 text-emerald-700 text-[9px] animate-pulse">
                          {m.improved ? <TrendingDown className="h-3 w-3 mr-0.5 inline" /> : <TrendingUp className="h-3 w-3 mr-0.5 inline" />}
                          {Math.abs(m.to - m.from).toFixed(1)} {m.improved ? "Drop" : "Rise"}!
                        </Badge>
                      </motion.div>
                    </div>
                  </div>
                  <MiniSparkline data={m.data} color="#22c55e" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Comment */}
        <AIBubble text="Reaching your vitamin D goal is amazing. Your immunity will be much stronger this winter. Keep taking 2000 IU daily with K2." />

        {/* ═══ ACHIEVEMENTS ═══ */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" /> Unlocked Achievements
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            <AchievementCard emoji="🏆" title="Pre-Diabetes Reversed" unlocked description="HbA1c below 6.5% for 3 consecutive months" />
            <AchievementCard emoji="☀️" title="Vitamin D Champion" unlocked description="Optimal vitamin D levels maintained 6+ months" />
            <AchievementCard emoji="🔥" title="Inflammation Fighter" unlocked description="CRP reduced by 75% through lifestyle + supplements" />
            <AchievementCard emoji="💪" title="Iron Will" unlocked={false} description="Complete 365-day supplement streak" />
            <AchievementCard emoji="🧠" title="Brain Optimizer" unlocked={false} description="Achieve optimal omega-3 index (8%+)" />
          </div>
        </div>

        {/* ═══ STREAK ═══ */}
        <Card className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50">
          <CardContent className="p-5 flex items-center gap-4">
            <Flame className="h-10 w-10 text-amber-500 shrink-0" />
            <div>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">127 Day Streak</p>
              <p className="text-xs text-amber-600/70">Keep going! You're building an incredible health habit.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
