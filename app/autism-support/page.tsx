// © 2026 Doctopal — All Rights Reserved
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

// ═══ VISUAL ROUTINE PATH (PECS-style) ═══
function VisualRoutine({ lang }: { lang: string }) {
  const [completed, setCompleted] = useState<string[]>([])

  const routines = [
    { id: "wake", emoji: "🌅", label: lang === "tr" ? "Uyanma" : "Wake Up", time: "07:00" },
    { id: "brush", emoji: "🪥", label: lang === "tr" ? "Diş Fırçalama" : "Brush Teeth", time: "07:10" },
    { id: "breakfast", emoji: "🥣", label: lang === "tr" ? "Kahvaltı" : "Breakfast", time: "07:30" },
    { id: "dress", emoji: "👕", label: lang === "tr" ? "Giyinme" : "Get Dressed", time: "08:00" },
    { id: "school", emoji: "🎒", label: lang === "tr" ? "Okul / Etkinlik" : "School / Activity", time: "08:30" },
    { id: "lunch", emoji: "🍽️", label: lang === "tr" ? "Öğle Yemeği" : "Lunch", time: "12:00" },
    { id: "play", emoji: "🧩", label: lang === "tr" ? "Oyun Zamanı" : "Play Time", time: "15:00" },
    { id: "bath", emoji: "🛁", label: lang === "tr" ? "Banyo" : "Bath", time: "19:00" },
    { id: "sleep", emoji: "😴", label: lang === "tr" ? "Uyku" : "Sleep", time: "20:30" },
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
                  {lang === "tr" ? "Tamamlandı!" : "Done!"}
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
function SensoryShield({ lang }: { lang: string }) {
  const [active, setActive] = useState<string | null>(null)
  const triggers = [
    {
      id: "noise", emoji: "🔊", label: lang === "tr" ? "Yüksek Ses" : "Loud Noise",
      tips: [
        { emoji: "🎧", text: lang === "tr" ? "Beyaz Gürültü Aç" : "Play White Noise" },
        { emoji: "🤫", text: lang === "tr" ? "Sessiz bir alana git" : "Go to a quiet area" },
      ],
    },
    {
      id: "light", emoji: "💡", label: lang === "tr" ? "Parlak Işık" : "Bright Light",
      tips: [
        { emoji: "🕶️", text: lang === "tr" ? "Güneş gözlüğü tak" : "Wear sunglasses" },
        { emoji: "🌙", text: lang === "tr" ? "Loş ışık tercih et" : "Prefer dim lighting" },
      ],
    },
    {
      id: "touch", emoji: "✋", label: lang === "tr" ? "Dokunma Hassasiyeti" : "Touch Sensitivity",
      tips: [
        { emoji: "🧸", text: lang === "tr" ? "Derin Basınç Masajı Adımları" : "Deep Pressure Massage Steps" },
        { emoji: "🎽", text: lang === "tr" ? "Ağırlıklı battaniye kullan" : "Use weighted blanket" },
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
function StickerBoard({ completed, lang }: { completed: number; lang: string }) {
  const stickers = ["⭐", "🌟", "🏆", "🎯", "💎", "🦋", "🌈", "🎪"]
  const earned = Math.min(completed, stickers.length)

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10 border-amber-100/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold">{lang === "tr" ? "Küçük Zaferler" : "Little Victories"}</h3>
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
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Görsel Yaşam Rehberi" : "Visual Life Guide"}</h1>
          <p className="text-sm text-muted-foreground">{lang === "tr" ? "Her adım görsel, her başarı kutlanır." : "Every step visual, every achievement celebrated."}</p>
        </motion.div>

        {/* Sticker Board */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <StickerBoard completed={completedCount} lang={lang} />
        </motion.div>

        {/* Visual Routine */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-violet-500" />
            <h2 className="text-sm font-bold">{lang === "tr" ? "Günlük Rutin Yolu" : "Daily Routine Path"}</h2>
          </div>
          <VisualRoutine lang={lang} />
        </motion.div>

        {/* Sensory Shield */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-violet-500" />
            <h2 className="text-sm font-bold">{lang === "tr" ? "Duyusal Kalkan" : "Sensory Shield"}</h2>
          </div>
          <SensoryShield lang={lang} />
        </motion.div>

        <p className="text-[10px] text-muted-foreground text-center px-4">
          {lang === "tr"
            ? "Bu uygulama profesyonel terapi yerine geçmez. Uzmanınıza danışın."
            : "This app does not replace professional therapy. Consult your specialist."}
        </p>
      </div>
    </div>
  )
}
