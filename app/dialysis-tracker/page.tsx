// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Droplets, Pill, Apple, TrendingUp, Check,
  Plus, Clock, Award, ChevronRight, Sparkles,
  GlassWater, ArrowRight, Shield,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ═══ WATER RING ═══
function WaterRing({ current, max, lang }: { current: number; max: number; lang: string }) {
  const pct = Math.min((current / max) * 100, 100)
  const r = 54; const c = 2 * Math.PI * r
  const remaining = Math.max(max - current, 0)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 border border-sky-100/50 p-6 text-center">
      <div className="relative inline-block mb-4">
        <svg width={128} height={128} className="transform -rotate-90">
          <circle cx={64} cy={64} r={r} strokeWidth={8} fill="none" className="stroke-sky-200/50 dark:stroke-sky-800/50" />
          <motion.circle cx={64} cy={64} r={r} strokeWidth={8} fill="none" strokeLinecap="round"
            className="stroke-sky-500" strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (pct / 100) * c }}
            transition={{ duration: 1.5, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-2xl font-bold text-sky-600 dark:text-sky-400"
            key={current} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            {current}ml
          </motion.span>
          <span className="text-[10px] text-muted-foreground">/ {max}ml</span>
        </div>
        {pct >= 100 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shadow">
            <Check className="h-3.5 w-3.5 text-white" />
          </motion.div>
        )}
      </div>

      <p className="text-sm font-medium text-foreground">
        {remaining > 0
          ? (lang === "tr" ? `Kalan izin verilen sıvı: ${remaining}ml` : `Remaining allowed fluid: ${remaining}ml`)
          : (lang === "tr" ? "Günlük limit tamamlandı!" : "Daily limit reached!")}
      </p>
    </motion.div>
  )
}

// ═══ FLUID QUICK LOG ═══
function FluidQuickLog({ onAdd, lang }: { onAdd: (ml: number) => void; lang: string }) {
  const items = [
    { emoji: "🍵", label: lang === "tr" ? "Çay Bardağı" : "Tea Cup", ml: 100 },
    { emoji: "☕", label: lang === "tr" ? "Kahve" : "Coffee", ml: 150 },
    { emoji: "🥤", label: lang === "tr" ? "Kupa" : "Mug", ml: 200 },
    { emoji: "🍶", label: lang === "tr" ? "Büyük Bardak" : "Large Glass", ml: 300 },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item, i) => (
        <motion.button key={item.ml}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => onAdd(item.ml)}
          className="flex items-center gap-3 rounded-2xl bg-white dark:bg-card border p-3.5 hover:shadow-sm transition-shadow">
          <span className="text-xl">{item.emoji}</span>
          <div className="text-left">
            <p className="text-xs font-bold">{item.label}</p>
            <p className="text-[10px] text-sky-500 font-medium">{item.ml}ml</p>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

// ═══ NUTRITION SMART SWAPS ═══
function NutritionSwaps({ lang }: { lang: string }) {
  const swaps = [
    {
      bad: { name: lang === "tr" ? "Muz" : "Banana", emoji: "🍌", reason: lang === "tr" ? "Yüksek Potasyum" : "High Potassium" },
      good: { name: lang === "tr" ? "Elma" : "Apple", emoji: "🍎", reason: lang === "tr" ? "Güvenli" : "Safe" },
    },
    {
      bad: { name: lang === "tr" ? "Portakal" : "Orange", emoji: "🍊", reason: lang === "tr" ? "Yüksek Potasyum" : "High Potassium" },
      good: { name: lang === "tr" ? "Üzüm" : "Grapes", emoji: "🍇", reason: lang === "tr" ? "Güvenli" : "Safe" },
    },
    {
      bad: { name: lang === "tr" ? "Domates" : "Tomato", emoji: "🍅", reason: lang === "tr" ? "Yüksek Potasyum" : "High Potassium" },
      good: { name: lang === "tr" ? "Salatalık" : "Cucumber", emoji: "🥒", reason: lang === "tr" ? "Düşük Potasyum" : "Low Potassium" },
    },
  ]

  return (
    <div className="space-y-2.5">
      {swaps.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 rounded-2xl border bg-white dark:bg-card p-3">
          <div className="flex-1 text-center rounded-xl bg-red-50 dark:bg-red-900/20 p-2">
            <span className="text-lg">{s.bad.emoji}</span>
            <p className="text-[10px] font-bold text-red-600 dark:text-red-400">{s.bad.name}</p>
            <p className="text-[8px] text-red-500/70">{s.bad.reason}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 text-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-2">
            <span className="text-lg">{s.good.emoji}</span>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{s.good.name}</p>
            <p className="text-[8px] text-emerald-500/70">{s.good.reason}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ═══ MEDICATION TIMELINE ═══
function MedTimeline({ lang }: { lang: string }) {
  const [completed, setCompleted] = useState<string[]>([])
  const meds = [
    { id: "m1", time: "07:00", label: lang === "tr" ? "Fosfor Bağlayıcı" : "Phosphate Binder", note: lang === "tr" ? "Kahvaltıda ilk lokmayla" : "With first bite of breakfast" },
    { id: "m2", time: "12:00", label: lang === "tr" ? "Fosfor Bağlayıcı" : "Phosphate Binder", note: lang === "tr" ? "Öğle yemeğiyle" : "With lunch" },
    { id: "m3", time: "19:00", label: lang === "tr" ? "Fosfor Bağlayıcı" : "Phosphate Binder", note: lang === "tr" ? "Akşam yemeğiyle" : "With dinner" },
    { id: "m4", time: "21:00", label: lang === "tr" ? "EPO Enjeksiyonu" : "EPO Injection", note: lang === "tr" ? "Haftada 3x" : "3x/week" },
  ]

  const toggle = (id: string) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="space-y-2">
      {meds.map((m, i) => {
        const done = completed.includes(m.id)
        return (
          <motion.button key={m.id}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(m.id)}
            className={`relative w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
              done ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50" : "bg-white dark:bg-card hover:shadow-sm"
            }`}>
            <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 shrink-0 transition-all ${
              done ? "bg-emerald-500 border-emerald-500" : "border-stone-300"
            }`}>
              {done && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="h-3.5 w-3.5 text-white" /></motion.div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[9px] font-mono">{m.time}</Badge>
                <span className={`text-sm font-medium ${done ? "line-through text-muted-foreground/70" : ""}`}>{m.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{m.note}</p>
            </div>
            {done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs">✨</motion.span>}
          </motion.button>
        )
      })}
    </div>
  )
}

export default function DialysisTrackerPage() {
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState<"fluid" | "nutrition" | "medication">("fluid")
  const [fluidTotal, setFluidTotal] = useState(450)
  const fluidLimit = 1500

  const tabs = [
    { id: "fluid" as const, label: lang === "tr" ? "Sıvı" : "Fluid", emoji: "💧" },
    { id: "nutrition" as const, label: lang === "tr" ? "Besin" : "Nutrition", emoji: "🍏" },
    { id: "medication" as const, label: lang === "tr" ? "İlaç" : "Medication", emoji: "💊" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/30 to-cyan-50/20 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 space-y-2">
          <Droplets className="h-10 w-10 text-sky-500 mx-auto" />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Yaşam Dengesi Merkezi" : "Life Balance Center"}</h1>
          <p className="text-sm text-muted-foreground">{lang === "tr" ? "Diyaliz sürecinizi kolayca yönetin." : "Easily manage your dialysis journey."}</p>
        </motion.div>

        {/* Achievement Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-gradient-to-r from-sky-100 to-cyan-100 dark:from-sky-900/20 dark:to-cyan-900/20 border border-sky-200/50 p-4 flex items-center gap-4">
          <Award className="h-10 w-10 text-sky-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-sky-700 dark:text-sky-400">-2.4L {lang === "tr" ? "Arınma" : "Clearance"}</p>
            <p className="text-xs text-sky-600/70">{lang === "tr" ? "Son seans başarılı!" : "Last session successful!"}</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 text-[10px] ml-auto shrink-0">
            {lang === "tr" ? "Başarılı" : "Success"} ✓
          </Badge>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-white dark:bg-card rounded-xl border p-1">
          {tabs.map(tab => (
            <motion.button key={tab.id} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id ? "text-white" : "text-muted-foreground"
              }`}>
              {activeTab === tab.id && (
                <motion.div layoutId="dialysisTab" className="absolute inset-0 bg-sky-500 rounded-lg shadow"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className="relative z-10">{tab.emoji} {tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "fluid" && (
            <motion.div key="fluid" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <WaterRing current={fluidTotal} max={fluidLimit} lang={lang} />
              <FluidQuickLog onAdd={(ml) => setFluidTotal(prev => Math.min(prev + ml, fluidLimit + 200))} lang={lang} />
            </motion.div>
          )}

          {activeTab === "nutrition" && (
            <motion.div key="nutrition" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-sky-500" />
                <h2 className="text-sm font-bold">{lang === "tr" ? "Akıllı Besin Takası" : "Smart Food Swaps"}</h2>
              </div>
              <NutritionSwaps lang={lang} />
            </motion.div>
          )}

          {activeTab === "medication" && (
            <motion.div key="medication" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-sky-500" />
                <h2 className="text-sm font-bold">{lang === "tr" ? "İlaç Zamanlama" : "Medication Schedule"}</h2>
              </div>
              <MedTimeline lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
          onClick={() => setActiveTab("fluid")}
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-xl shadow-sky-500/25 animate-pulse">
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  )
}
