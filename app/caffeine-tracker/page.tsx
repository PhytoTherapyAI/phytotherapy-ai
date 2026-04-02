// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Moon, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { useLang } from "@/components/layout/language-toggle"

const HALF_LIFE_HOURS = 5.5
const FDA_LIMIT = 400
const BEDTIME_HOUR = 23.5

interface CaffeineEntry { id: string; name: string; mg: number; hour: number; emoji: string }

const DRINKS = [
  { emoji: "☕", name: "Coffee", mg: 95 },
  { emoji: "🍵", name: "Tea", mg: 45 },
  { emoji: "⚡", name: "Pre-Workout", mg: 200 },
  { emoji: "🥤", name: "Energy Drink", mg: 160 },
  { emoji: "🍫", name: "Dark Chocolate", mg: 25 },
  { emoji: "🧉", name: "Matcha", mg: 70 },
]

function calcCaffeineAtTime(entries: CaffeineEntry[], targetHour: number): number {
  return entries.reduce((total, e) => {
    const elapsed = targetHour - e.hour
    if (elapsed < 0) return total
    return total + e.mg * Math.pow(0.5, elapsed / HALF_LIFE_HOURS)
  }, 0)
}

function generateCurveData(entries: CaffeineEntry[]) {
  const data = []
  for (let h = 6; h <= 26; h += 0.5) {
    const displayHour = h > 24 ? h - 24 : h
    const label = `${String(Math.floor(displayHour)).padStart(2, "0")}:${h % 1 === 0 ? "00" : "30"}`
    data.push({ hour: h, label, mg: Math.round(calcCaffeineAtTime(entries, h)) })
  }
  return data
}

// CNS Battery
function CNSBattery({ current, max }: { current: number; max: number }) {
  const pct = Math.min((current / max) * 100, 120)
  const color = pct <= 50 ? "#14b8a6" : pct <= 100 ? "#f59e0b" : "#dc2626"
  const label = pct <= 50 ? "Optimal Zone" : pct <= 100 ? "Elevated" : "Over Limit"

  return (
    <div className="relative w-full max-w-[200px] mx-auto">
      <div className="relative h-64 w-24 mx-auto rounded-2xl border-2 border-slate-600 bg-slate-800 overflow-hidden">
        {/* Battery cap */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-slate-600 rounded-t-md" />
        {/* Fill */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 rounded-b-xl"
          style={{ backgroundColor: color, opacity: 0.8 }}
        >
          {/* Wave effect */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute top-0 left-0 right-0 h-3 rounded-full"
            style={{ backgroundColor: color, filter: "brightness(1.3)" }}
          />
        </motion.div>
        {/* Level text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className="text-xl font-bold text-white">{Math.round(current)}</span>
          <span className="text-[9px] text-slate-300">/ {max} mg</span>
        </div>
      </div>
      <p className="text-center text-xs font-medium mt-3" style={{ color }}>{label}</p>
      <p className="text-center text-[10px] text-slate-500 mt-0.5">CNS Battery</p>
    </div>
  )
}

function LaborIllusion({ onComplete, lang }: { onComplete: () => void; lang: string }) {
  const isTr = lang === "tr"
  const steps = isTr
    ? ["Kafein klerens hızınız hesaplanıyor...", "Gece uykusu için kalan kafein yükü analiz ediliyor...", "Akşam sakinleşme protokolünüz hazırlanıyor..."]
    : ["Calculating your caffeine clearance rate...", "Analyzing remaining caffeine load for tonight's sleep...", "Preparing your evening wind-down protocol..."]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => { if (s >= steps.length - 1) { clearInterval(interval); setTimeout(onComplete, 800); return s } return s + 1 })
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-stone-900 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-amber-800/30">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-stone-700 border-t-amber-400" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-amber-100 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function CaffeineTrackerPage() {
  const router = useRouter()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [entries, setEntries] = useState<CaffeineEntry[]>([
    { id: "1", name: "Coffee", mg: 95, hour: 8, emoji: "☕" },
    { id: "2", name: "Coffee", mg: 95, hour: 12, emoji: "☕" },
  ])
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const totalMg = entries.reduce((s, e) => s + e.mg, 0)
  const curveData = useMemo(() => generateCurveData(entries), [entries])
  const bedtimeCaffeine = Math.round(calcCaffeineAtTime(entries, BEDTIME_HOUR))

  const addDrink = (drink: typeof DRINKS[0]) => {
    const now = new Date()
    const hour = now.getHours() + now.getMinutes() / 60
    setEntries(prev => [...prev, { id: String(Date.now()), name: drink.name, mg: drink.mg, hour, emoji: drink.emoji }])
  }

  const drinkCounts = DRINKS.map(d => ({
    ...d,
    count: entries.filter(e => e.name === d.name).length,
  }))

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <AnimatePresence>
        {showLabor && <LaborIllusion lang={lang} onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/10">
              <ChevronLeft className="w-5 h-5 text-stone-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{isTr ? "Metabolik Enerji & Yarı Ömür Radarı" : "Metabolic Energy & Half-Life Radar"}</h1>
              <p className="text-xs text-stone-400">{isTr ? "Kafein metabolizmanı takip et" : "Track your caffeine metabolism"}</p>
            </div>
          </div>
        </motion.div>

        {/* Desktop 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Chart + Drink Cards (60%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Energy Curve */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-stone-800/80 backdrop-blur rounded-2xl p-5 border border-stone-700/50">
              <h3 className="text-sm font-semibold text-stone-300 mb-3">{isTr ? "Günlük Enerji Eğrisi" : "Daily Energy Curve"}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={curveData}>
                  <defs>
                    <linearGradient id="caffeineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#78716c" }} interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: "#78716c" }} domain={[0, "auto"]} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid #44403c", borderRadius: 12, fontSize: 12 }} />
                  <ReferenceLine x={curveData.find(d => d.hour === BEDTIME_HOUR)?.label} stroke="#7c3aed" strokeDasharray="5 3" label={{ value: "Bedtime", fill: "#a78bfa", fontSize: 10, position: "top" }} />
                  <Area type="monotone" dataKey="mg" stroke="#f59e0b" strokeWidth={2} fill="url(#caffeineGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              {bedtimeCaffeine > 30 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-3 bg-amber-950/40 border border-amber-800/30 rounded-xl px-4 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-200">
                    {isTr
                      ? `⚠️ Yatma saatinde kanınızda ~${bedtimeCaffeine}mg kafein olacak. Bu derin uykuyu bozabilir.`
                      : `⚠️ ~${bedtimeCaffeine}mg caffeine will still be in your blood at bedtime. This may disrupt deep sleep.`}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Drink Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-sm font-semibold text-stone-300 mb-3 px-1">{isTr ? "İçecek Ekle" : "Add Beverage"}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {drinkCounts.map((drink, i) => (
                  <motion.button
                    key={drink.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addDrink(drink)}
                    className="relative bg-stone-800/60 backdrop-blur border border-stone-700/50 rounded-2xl p-4 text-center hover:border-amber-700/50 transition-all group"
                  >
                    <motion.span className="text-2xl block mb-1" whileTap={{ scale: 1.3 }}>{drink.emoji}</motion.span>
                    <p className="text-xs font-medium text-stone-200">{drink.name}</p>
                    <p className="text-[10px] text-stone-500">{drink.mg}mg</p>
                    {drink.count > 0 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-bold flex items-center justify-center text-stone-900">
                        ×{drink.count}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Battery + Analysis (40%) */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* CNS Battery */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-stone-800/80 backdrop-blur rounded-2xl p-6 border border-stone-700/50">
              <h3 className="text-sm font-semibold text-stone-300 mb-4 text-center">
                {isTr ? "Merkezi Sinir Sistemi Pili" : "Central Nervous System Battery"}
              </h3>
              <CNSBattery current={totalMg} max={FDA_LIMIT} />
            </motion.div>

            {/* Sleep Analysis CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowLabor(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2"
            >
              <Moon className="w-4 h-4" />
              {isTr ? "Uyku & Toparlanma Etkimi Analiz Et" : "Analyze My Sleep & Recovery Impact"}
            </motion.button>

            {/* Result */}
            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-amber-950/50 to-stone-800/50 rounded-2xl p-5 border border-amber-800/20">
                  <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> {isTr ? "Uyku Analizi" : "Sleep Analysis"}
                  </h3>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    {isTr
                      ? `Son kafein alımınız, yatma saatinde ~${bedtimeCaffeine}mg kafein bırakacak. Derin uykuyu korumak için saat 14:00'ten sonra Melisa çayına geçmeyi düşünün.`
                      : `Your caffeine intake leaves ~${bedtimeCaffeine}mg at bedtime. Consider switching to Lemon Balm tea after 14:00 to protect deep sleep and muscle recovery.`}
                  </p>
                  <p className="text-[10px] text-stone-500 mt-2">{isTr ? "Her zaman doktorunuza danışın." : "Always consult your healthcare provider."}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
