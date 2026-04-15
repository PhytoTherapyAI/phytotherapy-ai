// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Puzzle, Star, Shield, Volume2, Hand,
  Check, ChevronRight, Sparkles, Heart,
  Sun, Moon, Utensils, BookOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

type Lang = "en" | "tr"

// ═══ VISUAL ROUTINE PATH (PECS-style) ═══
function VisualRoutine({ lang }: { lang: Lang }) {
  const [completed, setCompleted] = useState<string[]>([])

  const routines = [
    { id: "wake", emoji: "🌅", label: tx("autismSupport.routine.wake", lang), time: "07:00" },
    { id: "brush", emoji: "🪥", label: tx("autismSupport.routine.brush", lang), time: "07:10" },
    { id: "breakfast", emoji: "🥣", label: tx("autismSupport.routine.breakfast", lang), time: "07:30" },
    { id: "dress", emoji: "👕", label: tx("autismSupport.routine.dress", lang), time: "08:00" },
    { id: "school", emoji: "🎒", label: tx("autismSupport.routine.school", lang), time: "08:30" },
    { id: "lunch", emoji: "🍽️", label: tx("autismSupport.routine.lunch", lang), time: "12:00" },
    { id: "play", emoji: "🧩", label: tx("autismSupport.routine.play", lang), time: "15:00" },
    { id: "bath", emoji: "🛁", label: tx("autismSupport.routine.bath", lang), time: "19:00" },
    { id: "sleep", emoji: "😴", label: tx("autismSupport.routine.sleep", lang), time: "20:30" },
  ]

  const toggle = (id: string) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="space-y-2">
      {routines.map((r, i) => {
        const done = completed.includes(r.id)
        return (
          <motion.button key={r.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(r.id)}
            className={`w-full flex items-center gap-4 rounded-3xl p-4 min-h-[64px] transition-all ${
              done
                ? "bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-300/50"
                : "bg-white dark:bg-card border-2 border-transparent hover:border-violet-200/50 hover:shadow-sm"
            }`}>
            <span className="text-3xl">{r.emoji}</span>
            <div className="flex-1 text-left">
              <p className={`text-sm font-bold ${done ? "text-violet-500" : "text-foreground"}`}>{r.label}</p>
              <p className="text-[10px] text-muted-foreground">{r.time}</p>
            </div>
            {done ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="flex items-center gap-1">
                <span className="text-lg">🎉</span>
                <Badge className="bg-violet-100 text-violet-700 text-[10px]">
                  {tx("autismSupport.done", lang)}
                </Badge>
              </motion.div>
            ) : (
              <div className="h-8 w-8 rounded-full border-2 border-stone-300 dark:border-stone-600" />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// ═══ SENSORY SHIELD ═══
function SensoryShield({ lang }: { lang: Lang }) {
  const [active, setActive] = useState<string | null>(null)
  const triggers = [
    {
      id: "noise", emoji: "🔊", label: tx("autismSupport.trigger.noise", lang),
      tips: [
        { emoji: "🎧", text: tx("autismSupport.trigger.noise.tip1", lang) },
        { emoji: "🤫", text: tx("autismSupport.trigger.noise.tip2", lang) },
      ],
    },
    {
      id: "light", emoji: "💡", label: tx("autismSupport.trigger.light", lang),
      tips: [
        { emoji: "🕶️", text: tx("autismSupport.trigger.light.tip1", lang) },
        { emoji: "🌙", text: tx("autismSupport.trigger.light.tip2", lang) },
      ],
    },
    {
      id: "touch", emoji: "✋", label: tx("autismSupport.trigger.touch", lang),
      tips: [
        { emoji: "🧸", text: tx("autismSupport.trigger.touch.tip1", lang) },
        { emoji: "🎽", text: tx("autismSupport.trigger.touch.tip2", lang) },
      ],
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {triggers.map(t => (
          <motion.button key={t.id} whileTap={{ scale: 0.93 }}
            onClick={() => setActive(active === t.id ? null : t.id)}
            className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl p-4 min-h-[72px] transition-all ${
              active === t.id
                ? "bg-violet-50 dark:bg-violet-900/20 ring-2 ring-violet-300"
                : "bg-white dark:bg-card border hover:shadow-sm"
            }`}>
            <span className="text-2xl">{t.emoji}</span>
            <span className="text-[10px] font-bold">{t.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="rounded-2xl border-violet-200/50">
              <CardContent className="p-4 space-y-2">
                {triggers.find(t => t.id === active)?.tips.map((tip, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm p-2 rounded-xl hover:bg-violet-50/50 dark:hover:bg-violet-900/10">
                    <span className="text-lg">{tip.emoji}</span>
                    <span>{tip.text}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══ STICKER BOARD ═══
function StickerBoard({ completed, lang }: { completed: number; lang: Lang }) {
  const stickers = ["⭐", "🌟", "🏆", "🎯", "💎", "🦋", "🌈", "🎪"]
  const earned = Math.min(completed, stickers.length)

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10 border-amber-100/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold">{tx("autismSupport.littleVictories", lang)}</h3>
          <Badge variant="secondary" className="text-[9px]">{earned}/{stickers.length}</Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          {stickers.map((s, i) => (
            <motion.div key={i}
              initial={{ scale: 0 }}
              animate={{ scale: i < earned ? 1 : 0.6, opacity: i < earned ? 1 : 0.2 }}
              transition={{ delay: i * 0.05, type: "spring" }}
              className="h-12 w-12 rounded-xl bg-white dark:bg-card border flex items-center justify-center text-xl shadow-sm">
              {s}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AutismSupportPage() {
  const { lang } = useLang()
  const [completedCount] = useState(4) // mock

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/30 to-purple-50/20 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 space-y-2">
          <Puzzle className="h-10 w-10 text-violet-500 mx-auto" />
          <h1 className="text-2xl font-bold">{tx("autismSupport.title", lang)}</h1>
          <p className="text-sm text-muted-foreground">{tx("autismSupport.subtitle", lang)}</p>
        </motion.div>

        {/* Sticker Board */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <StickerBoard completed={completedCount} lang={lang} />
        </motion.div>

        {/* Visual Routine */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-violet-500" />
            <h2 className="text-sm font-bold">{tx("autismSupport.dailyRoutine", lang)}</h2>
          </div>
          <VisualRoutine lang={lang} />
        </motion.div>

        {/* Sensory Shield */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-violet-500" />
            <h2 className="text-sm font-bold">{tx("autismSupport.sensoryShield", lang)}</h2>
          </div>
          <SensoryShield lang={lang} />
        </motion.div>

        <p className="text-[10px] text-muted-foreground text-center px-4">
          {tx("autismSupport.disclaimer", lang)}
        </p>
      </div>
    </div>
  )
}
