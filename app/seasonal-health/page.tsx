// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, Swords, Leaf, Check, Plus,
  Sun, CloudRain, Snowflake, Flower2,
  MapPin, Wind, AlertTriangle, Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ═══ BOSS FIGHT HERO ═══
function BossFightHero({ shieldPct, lang }: { shieldPct: number; lang: string }) {
  const r = 54; const c = 2 * Math.PI * r

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Swords className="h-5 w-5 text-amber-600" />
        <h2 className="text-base font-bold text-amber-700 dark:text-amber-400">
          {lang === "tr" ? "Bahar Sezonu Aktif: Alerji Boss'u Yaklaşıyor!" : "Spring Season Active: Allergy Boss Approaching!"}
        </h2>
      </div>

      <div className="relative inline-block mb-4">
        <svg width={128} height={128} className="transform -rotate-90">
          <circle cx={64} cy={64} r={r} strokeWidth={8} fill="none" className="stroke-stone-200/50 dark:stroke-stone-700/50" />
          <motion.circle cx={64} cy={64} r={r} strokeWidth={8} fill="none" strokeLinecap="round"
            stroke={shieldPct >= 80 ? "#22c55e" : shieldPct >= 50 ? "#f59e0b" : "#ef4444"}
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (shieldPct / 100) * c }}
            transition={{ duration: 1.5, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Shield className="h-6 w-6 text-amber-600 mb-0.5" />
          <motion.span className="text-xl font-bold" key={shieldPct}
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            {shieldPct}%
          </motion.span>
        </div>
      </div>

      <p className="text-sm text-amber-600/80 dark:text-amber-300/80">
        {lang === "tr" ? "Kalkanınızı güçlendirin — takviyeler ekleyin!" : "Strengthen your shield — add supplements!"}
      </p>
    </motion.div>
  )
}

// ═══ ARSENAL CARDS ═══
interface ArsenalItem {
  id: string; name: string; nameTr: string; emoji: string; benefit: string; benefitTr: string
}

const ARSENAL: ArsenalItem[] = [
  { id: "quercetin", name: "Quercetin", nameTr: "Kuersetin", emoji: "🧅", benefit: "Natural antihistamine", benefitTr: "Doğal antihistaminik" },
  { id: "vitc", name: "Vitamin C", nameTr: "C Vitamini", emoji: "🍊", benefit: "Immune support", benefitTr: "Bağışıklık desteği" },
  { id: "nettle", name: "Stinging Nettle", nameTr: "Isırgan Otu", emoji: "🌿", benefit: "Reduces allergy symptoms", benefitTr: "Alerji semptomlarını azaltır" },
  { id: "probiotics", name: "Probiotics", nameTr: "Probiyotik", emoji: "🦠", benefit: "Gut-immune axis", benefitTr: "Bağırsak-bağışıklık aksı" },
  { id: "omega3", name: "Omega-3", nameTr: "Omega-3", emoji: "🐟", benefit: "Anti-inflammatory", benefitTr: "Anti-inflamatuar" },
  { id: "honey", name: "Local Honey", nameTr: "Yerel Bal", emoji: "🍯", benefit: "Pollen desensitization", benefitTr: "Polen duyarsızlaştırma" },
]

function ArsenalGrid({ lang }: { lang: string }) {
  const [added, setAdded] = useState<string[]>(["quercetin", "vitc"])

  const toggle = (id: string) => {
    setAdded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {ARSENAL.map((item, i) => {
        const isAdded = added.includes(item.id)
        return (
          <motion.button key={item.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => toggle(item.id)}
            className={`rounded-2xl p-3.5 text-left transition-all backdrop-blur-sm ${
              isAdded
                ? "bg-white/80 dark:bg-card/80 border-2 border-primary/30 shadow-sm"
                : "bg-white/50 dark:bg-card/50 border border-stone-200/60 dark:border-stone-800 hover:shadow-sm"
            }`}>
            <div className="flex items-start justify-between mb-1.5">
              <span className="text-xl">{item.emoji}</span>
              {isAdded ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs font-bold">{lang === "tr" ? item.nameTr : item.name}</p>
            <p className="text-[9px] text-muted-foreground">{lang === "tr" ? item.benefitTr : item.benefit}</p>
          </motion.button>
        )
      })}
    </div>
  )
}

// ═══ DOPAMINE CHECKLIST ═══
function SeasonalChecklist({ lang }: { lang: string }) {
  const [done, setDone] = useState<string[]>([])
  const items = [
    { id: "c1", text: lang === "tr" ? "Hava filtresi temizlendi" : "Air filter cleaned", emoji: "🏠" },
    { id: "c2", text: lang === "tr" ? "Antihistaminik stok" : "Antihistamine stock", emoji: "💊" },
    { id: "c3", text: lang === "tr" ? "Pencere filtresi kontrol" : "Window filter check", emoji: "🪟" },
    { id: "c4", text: lang === "tr" ? "Güneş gözlüğü hazır" : "Sunglasses ready", emoji: "🕶️" },
    { id: "c5", text: lang === "tr" ? "Polen takvimi incelendi" : "Pollen calendar reviewed", emoji: "📅" },
  ]

  const toggle = (id: string) => {
    setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => {
        const isDone = done.includes(item.id)
        return (
          <motion.button key={item.id}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(item.id)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
              isDone ? "bg-emerald-50 dark:bg-emerald-900/10" : "hover:bg-stone-50 dark:hover:bg-stone-900"
            }`}>
            <motion.div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              isDone ? "bg-emerald-500 border-emerald-500" : "border-stone-300"
            }`} animate={isDone ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              {isDone && <Check className="h-3 w-3 text-white" />}
            </motion.div>
            <span className="text-sm">{item.emoji}</span>
            <span className={`flex-1 ${isDone ? "line-through text-muted-foreground/70" : "font-medium"}`}>{item.text}</span>
            {isDone && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✨</motion.span>}
          </motion.button>
        )
      })}
    </div>
  )
}

export default function SeasonalHealthPage() {
  const { lang } = useLang()
  const shieldPct = 40

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Boss Fight Hero */}
        <BossFightHero shieldPct={shieldPct} lang={lang} />

        {/* Arsenal */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">{lang === "tr" ? "Cephanelik" : "Arsenal"}</h2>
            <Badge variant="secondary" className="text-[9px]">
              {lang === "tr" ? "Zırhıma Ekle" : "Add to Shield"}
            </Badge>
          </div>
          <ArsenalGrid lang={lang} />
        </motion.div>

        {/* Dopamine Checklist */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold">{lang === "tr" ? "Hazırlık Listesi" : "Prep Checklist"}</h3>
              </div>
              <SeasonalChecklist lang={lang} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Outdoor Radar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <Card className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border-amber-100/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center shrink-0">
                <Wind className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    {lang === "tr" ? "İzmir" : "Izmir"}
                  </span>
                </div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {lang === "tr" ? "Polen Seviyesi: Yüksek" : "Pollen Level: High"}
                </p>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-2 w-4 rounded-full ${i <= 4 ? "bg-amber-400" : "bg-stone-200"}`} />
                  ))}
                </div>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
