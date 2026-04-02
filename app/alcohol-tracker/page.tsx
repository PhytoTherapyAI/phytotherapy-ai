// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Shield, Droplets } from "lucide-react"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useLang } from "@/components/layout/language-toggle"

const METABOLISM_RATE = 0.015 // BAC drop per hour

interface DrinkEntry { id: string; name: string; units: number; hour: number; emoji: string }

const DRINKS = [
  { emoji: "🍺", name: "Beer", units: 1 },
  { emoji: "🍷", name: "Wine", units: 1.5 },
  { emoji: "🥃", name: "Spirit", units: 2 },
  { emoji: "🍸", name: "Cocktail", units: 1.5 },
]

function calcBAC(entries: DrinkEntry[], weight: number, gender: "m" | "f"): number {
  const r = gender === "m" ? 0.68 : 0.55
  const totalAlcohol = entries.reduce((s, e) => s + e.units * 10, 0) // grams
  return (totalAlcohol / (weight * r * 10)) * 100
}

function generateClearanceData(entries: DrinkEntry[], weight: number) {
  const data = []
  const now = new Date()
  const startHour = entries.length > 0 ? Math.min(...entries.map(e => e.hour)) : now.getHours()
  const peakBAC = calcBAC(entries, weight, "m")

  for (let h = 0; h <= 16; h += 0.5) {
    const currentHour = startHour + h
    const displayH = currentHour > 24 ? currentHour - 24 : currentHour
    const label = `${String(Math.floor(displayH)).padStart(2, "0")}:${h % 1 === 0 ? "00" : "30"}`
    const bac = Math.max(0, peakBAC - METABOLISM_RATE * h)
    data.push({ hour: h, label, bac: Math.round(bac * 1000) / 1000 })
  }
  return data
}

function getClearanceTime(entries: DrinkEntry[], weight: number): string {
  const peakBAC = calcBAC(entries, weight, "m")
  const hoursToZero = peakBAC / METABOLISM_RATE
  const now = new Date()
  const clearTime = new Date(now.getTime() + hoursToZero * 60 * 60 * 1000)
  return `${String(clearTime.getHours()).padStart(2, "0")}:${String(clearTime.getMinutes()).padStart(2, "0")}`
}

function LaborIllusion({ onComplete, lang }: { onComplete: () => void; lang: string }) {
  const isTr = lang === "tr"
  const steps = isTr
    ? ["Karaciğer enzim (CYP) yükü hesaplanıyor...", "Uyku mimarisi bozulması simüle ediliyor...", "Sabah anti-inflamatuar fitoterapi reçeteniz yazılıyor..."]
    : ["Calculating liver enzyme (CYP) load...", "Simulating sleep architecture disruption...", "Writing your morning anti-inflammatory phytotherapy prescription..."]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => { if (s >= steps.length - 1) { clearInterval(interval); setTimeout(onComplete, 800); return s } return s + 1 })
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-slate-900 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-purple-800/30">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-slate-700 border-t-fuchsia-400" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-purple-200 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function AlcoholTrackerPage() {
  const router = useRouter()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [entries, setEntries] = useState<DrinkEntry[]>([])
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const weight = 75

  const totalUnits = entries.reduce((s, e) => s + e.units, 0)
  const curveData = useMemo(() => generateClearanceData(entries, weight), [entries])
  const clearTime = entries.length > 0 ? getClearanceTime(entries, weight) : "--:--"

  const addDrink = (drink: typeof DRINKS[0]) => {
    const now = new Date()
    setEntries(prev => [...prev, { id: String(Date.now()), name: drink.name, units: drink.units, hour: now.getHours() + now.getMinutes() / 60, emoji: drink.emoji }])
  }

  const drinkCounts = DRINKS.map(d => ({ ...d, count: entries.filter(e => e.name === d.name).length }))

  const damageChips = useMemo(() => {
    if (totalUnits === 0) return []
    const chips = []
    chips.push({ emoji: "💧", label: isTr ? `Hidrasyon İhtiyacı: +${Math.round(totalUnits * 250)}ml Su` : `Hydration Need: +${Math.round(totalUnits * 250)}ml Water` })
    if (totalUnits >= 2) chips.push({ emoji: "🧠", label: isTr ? "REM Uykusu Riski: Yüksek" : "REM Sleep Risk: High" })
    if (totalUnits >= 3) chips.push({ emoji: "💪", label: isTr ? "Kas Toparlanma Etkisi: -%40 MPS" : "Muscle Recovery Impact: -40% MPS" })
    chips.push({ emoji: "🌿", label: isTr ? "Öneri: Deve Dikeni + C Vitamini" : "Phyto Suggestion: Milk Thistle + Vitamin C" })
    return chips
  }, [totalUnits, isTr])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AnimatePresence>
        {showLabor && <LaborIllusion lang={lang} onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/10">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{isTr ? "Metabolik Temizlenme & Karaciğer Kalkanı" : "Metabolic Clearance & Liver Shield"}</h1>
              <p className="text-xs text-slate-400">{isTr ? "Alkol metabolizmanı takip et" : "Track your alcohol metabolism"}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
          {/* LEFT (55%) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Clearance Timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/80 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300">{isTr ? "Temizlenme Zaman Çizelgesi" : "Clearance Timeline"}</h3>
                {entries.length > 0 && (
                  <span className="text-xs text-purple-300 bg-purple-900/30 px-2.5 py-1 rounded-full">
                    {isTr ? `Tam temizlenme: ${clearTime}` : `Full clearance: ${clearTime}`}
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={curveData}>
                  <defs>
                    <linearGradient id="alcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, "auto"]} />
                  <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid #4c1d95", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="bac" stroke="#c084fc" strokeWidth={2} fill="url(#alcGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              {entries.length > 0 && (
                <p className="text-xs text-slate-400 mt-2 text-center">
                  {isTr ? `Karaciğeriniz çalışıyor... Tahmini tam temizlenme: ${clearTime}` : `Your liver is working... Estimated full clearance: ${clearTime}`}
                </p>
              )}
            </motion.div>

            {/* Drink Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-sm font-semibold text-slate-300 mb-3 px-1">{isTr ? "İçecek Ekle" : "Add Drink"}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {drinkCounts.map((drink, i) => (
                  <motion.button key={drink.name}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addDrink(drink)}
                    className="relative bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4 text-center hover:border-purple-700/50 transition-all">
                    <motion.span className="text-2xl block mb-1" whileTap={{ scale: 1.3 }}>{drink.emoji}</motion.span>
                    <p className="text-xs font-medium text-slate-200">{drink.name}</p>
                    <p className="text-[10px] text-slate-500">{drink.units} {isTr ? "birim" : "unit"}</p>
                    {drink.count > 0 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-fuchsia-500 text-[10px] font-bold flex items-center justify-center">
                        ×{drink.count}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT (45%) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start space-y-5">
            {/* Damage Control Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-purple-950/50 to-slate-800/50 rounded-2xl p-5 border border-purple-800/20">
              <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> {isTr ? "Hasar Kontrol & Koruma Paneli" : "Damage Control & Protection Panel"}
              </h3>
              {damageChips.length === 0 ? (
                <p className="text-xs text-slate-500">{isTr ? "İçecek ekleyin" : "Add a drink to see damage control tips"}</p>
              ) : (
                <div className="space-y-2">
                  {damageChips.map((chip, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2.5 bg-slate-800/60 rounded-xl px-3.5 py-2.5 border border-slate-700/30">
                      <span className="text-lg">{chip.emoji}</span>
                      <span className="text-xs text-slate-200">{chip.label}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recovery CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowLabor(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isTr ? "Ertesi Gün Toparlanma Protokolümü Hazırla" : "Prepare My Next-Day Recovery Protocol"}
            </motion.button>

            {/* Result */}
            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-950/50 to-slate-800/50 rounded-2xl p-5 border border-fuchsia-800/20">
                  <h3 className="text-sm font-bold text-fuchsia-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> {isTr ? "Toparlanma Protokolü" : "Recovery Protocol"}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isTr
                      ? "Yarın sabah: 500ml su + Deve Dikeni 250mg + Vitamin B kompleks ile başlayın. 24 saat ağır egzersizden kaçının — MPS'niz düşük."
                      : "Tomorrow morning: Start with 500ml water + Milk Thistle 250mg + Vitamin B complex. Avoid heavy exercise for 24h — your MPS is compromised."}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">{isTr ? "Her zaman doktorunuza danışın." : "Always consult your healthcare provider."}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
