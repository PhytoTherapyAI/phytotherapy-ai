// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, Heart, Wind, Frown, Smile, Meh,
  Battery, BatteryLow, BatteryMedium,
  FileText, ChevronRight, Sparkles, Phone,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ═══ AFFIRMATION CARDS ═══
function AffirmationSwiper({ lang }: { lang: string }) {
  const [idx, setIdx] = useState(0)
  const cards = [
    { text: lang === "tr" ? "Her gün bir adım daha ileri." : "One step forward every day.", emoji: "🌱" },
    { text: lang === "tr" ? "Güçlüsünüz, bunu unutmayın." : "You are strong, never forget that.", emoji: "💪" },
    { text: lang === "tr" ? "Bugün kendinize nazik olun." : "Be gentle with yourself today.", emoji: "🤗" },
    { text: lang === "tr" ? "Nefes alın, bu anı yaşayın." : "Breathe, live this moment.", emoji: "🌸" },
    { text: lang === "tr" ? "Yalnız değilsiniz, biz buradayız." : "You're not alone, we're here.", emoji: "🤝" },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-100/50 p-6 min-h-[140px]">
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.3 }}
          className="text-center">
          <span className="text-4xl">{cards[idx].emoji}</span>
          <p className="text-base font-medium text-foreground mt-3 px-4">{cards[idx].text}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-1.5 mt-4">
        {cards.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-indigo-500" : "w-1.5 bg-indigo-300/50"}`} />
        ))}
      </div>

      {/* Swipe buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button onClick={() => setIdx(i => (i - 1 + cards.length) % cards.length)}
          className="p-2 text-indigo-400 hover:text-indigo-600"><ChevronRight className="h-5 w-5 rotate-180" /></button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button onClick={() => setIdx(i => (i + 1) % cards.length)}
          className="p-2 text-indigo-400 hover:text-indigo-600"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </div>
  )
}

// ═══ FATIGUE TRACKER ═══
function FatigueTracker({ lang }: { lang: string }) {
  const [level, setLevel] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  const levels = [
    { value: 1, icon: <BatteryLow className="h-8 w-8" />, emoji: "😔", label: lang === "tr" ? "Çok Düşük" : "Very Low", color: "#ef4444" },
    { value: 2, icon: <BatteryMedium className="h-8 w-8" />, emoji: "😐", label: lang === "tr" ? "Orta" : "Medium", color: "#f59e0b" },
    { value: 3, icon: <Battery className="h-8 w-8" />, emoji: "😊", label: lang === "tr" ? "İyi" : "Good", color: "#22c55e" },
  ]

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Battery className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">{lang === "tr" ? "Bugünkü Enerjiniz" : "Today's Energy"}</h3>
        </div>

        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.div key="select" className="flex justify-center gap-4">
              {levels.map(l => (
                <motion.button key={l.value} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                  onClick={() => { setLevel(l.value); setSaved(true) }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-h-[96px] min-w-[80px] transition-all ${
                    level === l.value ? "ring-2 bg-white dark:bg-card shadow-md" : "hover:bg-stone-50 dark:hover:bg-stone-900"
                  }`}
                  style={level === l.value ? { boxShadow: `0 0 0 2px ${l.color}` } : undefined}>
                  <span className="text-3xl">{l.emoji}</span>
                  <span className="text-[10px] font-medium" style={{ color: l.color }}>{l.label}</span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4">
              <span className="text-3xl">✨</span>
              <p className="text-sm font-medium mt-2">
                {lang === "tr" ? "Kaydedildi! Kendinize iyi bakın." : "Saved! Take care of yourself."}
              </p>
              <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setSaved(false)}>
                {lang === "tr" ? "Değiştir" : "Change"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// ═══ CHEMO-BRAIN FRIENDLY QUICK ACTIONS ═══
function QuickSymptomChips({ lang }: { lang: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const symptoms = [
    { id: "nausea", emoji: "🤢", label: lang === "tr" ? "Bulantım Var" : "I Feel Nauseous",
      tips: [
        lang === "tr" ? "Zencefil çayı — 1 fincan, yavaş yudum" : "Ginger tea — 1 cup, sip slowly",
        lang === "tr" ? "Küçük porsiyonlar halinde ye" : "Eat in small portions",
        lang === "tr" ? "Soğuk yiyecekler tercih et" : "Prefer cold foods",
      ]},
    { id: "fatigue", emoji: "😴", label: lang === "tr" ? "Çok Yorgunum" : "I'm Very Tired",
      tips: [
        lang === "tr" ? "20 dk güç uykusu" : "20 min power nap",
        lang === "tr" ? "Hafif yürüyüş — enerji artırır" : "Light walk — boosts energy",
        lang === "tr" ? "Yeterli su tüketimi" : "Adequate hydration",
      ]},
    { id: "mouth", emoji: "👄", label: lang === "tr" ? "Ağız Yaraları" : "Mouth Sores",
      tips: [
        lang === "tr" ? "Tuzlu su gargarası" : "Salt water gargle",
        lang === "tr" ? "Yumuşak, soğuk yiyecekler" : "Soft, cool foods",
        lang === "tr" ? "Baharatlı yiyeceklerden kaçının" : "Avoid spicy foods",
      ]},
  ]

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {symptoms.map(s => (
          <motion.button key={s.id} whileTap={{ scale: 0.93 }}
            onClick={() => setSelected(selected === s.id ? null : s.id)}
            className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl p-4 min-h-[80px] text-center transition-all ${
              selected === s.id
                ? "bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-300"
                : "bg-white dark:bg-card border hover:shadow-sm"
            }`}>
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-[10px] font-bold">{s.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="rounded-2xl border-indigo-200/50">
              <CardContent className="p-4 space-y-2">
                {symptoms.find(s => s.id === selected)?.tips.map((tip, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{tip}</span>
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

export default function CancerSupportPage() {
  const { lang } = useLang()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 to-violet-50/20 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero — Safety Shield */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-6 space-y-3">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
            <Shield className="h-12 w-12 text-indigo-500 mx-auto" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "tr" ? "Onkoloji Sığınağı" : "Oncology Sanctuary"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "tr"
              ? "Tedavi sürecinizde yanınızdayız. Güvenli, kanıta dayalı destek."
              : "We're with you through treatment. Safe, evidence-based support."}
          </p>
        </motion.div>

        {/* Daily Strength Cards (Affirmations) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold">{lang === "tr" ? "Günlük Güç Kartları" : "Daily Strength Cards"}</h2>
          </div>
          <AffirmationSwiper lang={lang} />
        </motion.div>

        {/* Chemo-Brain Friendly Chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold">{lang === "tr" ? "Hızlı Yardım" : "Quick Help"}</h2>
          </div>
          <QuickSymptomChips lang={lang} />
        </motion.div>

        {/* Fatigue Tracker */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <FatigueTracker lang={lang} />
        </motion.div>

        {/* Breathing exercise shortcut */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <Card className="rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 border-indigo-100/50">
            <CardContent className="p-5 flex items-center gap-4">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 4 }}
                className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center shrink-0">
                <Wind className="h-6 w-6 text-indigo-500" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">{lang === "tr" ? "Nefes Egzersizi" : "Breathing Exercise"}</h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "tr" ? "2 dakika — anksiyete ve bulantı için" : "2 minutes — for anxiety and nausea"}
                </p>
              </div>
              <Button size="sm" className="rounded-xl bg-indigo-500 hover:bg-indigo-600 shrink-0">
                {lang === "tr" ? "Başla" : "Start"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* FHIR Share */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex gap-3">
          <Button className="flex-1 h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg">
            <FileText className="h-5 w-5 mr-2" />
            {lang === "tr" ? "Doktorumla Paylaş (FHIR)" : "Share with My Doctor (FHIR)"}
          </Button>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center px-4 pb-6">
          {lang === "tr"
            ? "Bu uygulama kanser tedavisi yerine geçmez. Tüm öneriler için onkoloji doktorunuza danışın."
            : "This app does not replace cancer treatment. Consult your oncologist for all recommendations."}
        </p>
      </div>
    </div>
  )
}
