// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Shield, Rocket } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLang } from "@/components/layout/language-toggle"

const PRICE_PER_PACK = 8
const CIGS_PER_PACK = 20
const MINUTES_PER_CIG = 11 // WHO data

const MILESTONES = [
  { time: "20min", emoji: "⏱️", en: "Heart rate returns to normal", tr: "Kalp atışınız normale dönüyor" },
  { time: "8h", emoji: "🫁", en: "Carbon monoxide levels drop to normal", tr: "Karbon monoksit seviyeleri normale düşüyor" },
  { time: "72h", emoji: "🌬️", en: "Bronchial tubes relax, breathing improves", tr: "Bronş tüpleri gevşiyor, nefes almak kolaylaşıyor" },
  { time: "1mo", emoji: "🧠", en: "Dopamine receptors begin rebalancing", tr: "Dopamin reseptörleri yeniden dengelenmeye başlıyor" },
  { time: "3mo", emoji: "💪", en: "Circulation improves, exercise capacity increases", tr: "Dolaşım düzelerek egzersiz kapasitesi artıyor" },
  { time: "1yr", emoji: "🎉", en: "Heart disease risk drops by 50%", tr: "Kalp hastalığı riski %50 düşüyor" },
]

const MEDICAL_ARMOR = [
  { emoji: "🩹", en: "Nicotine Patch", tr: "Nikotin Bandı", type: "medical" },
  { emoji: "💊", en: "Nicotine Gum", tr: "Nikotin Sakızı", type: "medical" },
  { emoji: "💨", en: "Inhaler", tr: "İnhaler", type: "medical" },
]

const PHYTO_ARMOR = [
  { emoji: "🌿", en: "St. John's Wort (Mood)", tr: "Sarı Kantaron (Ruh Hali)", type: "phyto" },
  { emoji: "🧘", en: "Ashwagandha (Anxiety)", tr: "Ashwagandha (Anksiyete)", type: "phyto" },
  { emoji: "🍵", en: "Lobelia (Craving Reducer)", tr: "Lobelya (İstek Azaltıcı)", type: "phyto" },
]

function LungHologram({ dailyCigs, hasArmor }: { dailyCigs: number; hasArmor: boolean }) {
  const health = Math.max(0, 100 - dailyCigs * 3)
  const mainColor = health > 60 ? "#14b8a6" : health > 30 ? "#f59e0b" : "#94a3b8"

  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      <motion.div
        animate={{ scale: [1, 1.02, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ repeat: Infinity, duration: hasArmor ? 1.5 : 3, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${mainColor}20 0%, transparent 70%)` }}
      />
      <svg viewBox="0 0 200 240" className="w-full h-auto">
        {/* Lung outline (simplified) */}
        <g opacity="0.9">
          {/* Left lung */}
          <path d="M50,60 C30,70 20,100 25,140 C30,170 45,190 65,190 C80,190 90,170 90,150 L90,80 C90,65 75,55 50,60Z"
            fill="none" stroke={mainColor} strokeWidth="1.5" />
          {/* Right lung */}
          <path d="M150,60 C170,70 180,100 175,140 C170,170 155,190 135,190 C120,190 110,170 110,150 L110,80 C110,65 125,55 150,60Z"
            fill="none" stroke={mainColor} strokeWidth="1.5" />
          {/* Trachea */}
          <path d="M95,30 L95,80 M105,30 L105,80 M95,80 Q90,85 90,80 M105,80 Q110,85 110,80"
            fill="none" stroke={mainColor} strokeWidth="1.5" strokeLinecap="round" />
          {/* Heart */}
          <path d="M88,110 C88,100 100,95 100,105 C100,95 112,100 112,110 C112,125 100,135 100,135 C100,135 88,125 88,110Z"
            fill={mainColor} opacity="0.3" stroke={mainColor} strokeWidth="1" />
        </g>

        {/* Lung fill (health indicator) */}
        <path d="M50,60 C30,70 20,100 25,140 C30,170 45,190 65,190 C80,190 90,170 90,150 L90,80 C90,65 75,55 50,60Z"
          fill={mainColor} opacity={health / 400} />
        <path d="M150,60 C170,70 180,100 175,140 C170,170 155,190 135,190 C120,190 110,170 110,150 L110,80 C110,65 125,55 150,60Z"
          fill={mainColor} opacity={health / 400} />

        {/* Shield glow if armor equipped */}
        {hasArmor && (
          <motion.ellipse
            cx="100" cy="120" rx="85" ry="90"
            fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 4"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </svg>
    </div>
  )
}

function CountUpNumber({ value, prefix, suffix }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 800
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setDisplay(Math.round(value * progress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    animate()
  }, [value])
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>
}

function LaborIllusion({ onComplete, lang }: { onComplete: () => void; lang: string }) {
  const isTr = lang === "tr"
  const steps = isTr
    ? ["Dopamin reseptörlerinin onarım süreci hesaplanıyor...", "Akciğer silyalarının temizlenme takvimi hazırlanıyor...", "Fitoterapi destek zırhınız donatılıyor..."]
    : ["Calculating dopamine receptor repair timeline...", "Mapping lung cilia cleansing schedule...", "Equipping your phyto-support armor..."]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => { if (s >= steps.length - 1) { clearInterval(interval); setTimeout(onComplete, 800); return s } return s + 1 })
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-slate-900 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-teal-800/30">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-slate-700 border-t-teal-400" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-teal-200 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function SmokingCessationPage() {
  const router = useRouter()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [dailyCigs, setDailyCigs] = useState(15)
  const [selectedArmor, setSelectedArmor] = useState<string[]>([])
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [celebrateIndex, setCelebrateIndex] = useState<number | null>(null)

  const packsPerDay = dailyCigs / CIGS_PER_PACK
  const annualSavings = Math.round(packsPerDay * PRICE_PER_PACK * 365)
  const annualCigs = dailyCigs * 365
  const lifeDaysGained = Math.round((dailyCigs * MINUTES_PER_CIG * 365) / (60 * 24))

  const toggleArmor = (name: string) => {
    setSelectedArmor(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name])
  }

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
              <h1 className="text-xl font-bold">{isTr ? "Biyolojik Yenilenme & Özgürlük Panosu" : "Biological Regeneration & Freedom Dashboard"}</h1>
              <p className="text-xs text-slate-400">{isTr ? "Vücudunuzun iyileşme yolculuğu" : "Your body's healing journey"}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Hologram + Milestones */}
          <div className="space-y-6">
            {/* Lung Hologram */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
              <LungHologram dailyCigs={dailyCigs} hasArmor={selectedArmor.length > 0} />
            </motion.div>

            {/* Milestones (show after result) */}
            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-2">
                  <h3 className="text-sm font-semibold text-teal-300 px-1">{isTr ? "İyileşme Takvimi" : "Healing Timeline"}</h3>
                  {MILESTONES.map((m, i) => (
                    <motion.button
                      key={m.time}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setCelebrateIndex(i); setTimeout(() => setCelebrateIndex(null), 1000) }}
                      className="w-full flex items-center gap-3 bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/30 text-left hover:border-teal-700/50 transition-all"
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <div className="flex-1">
                        <span className="text-[10px] text-teal-400 font-mono">{m.time}</span>
                        <p className="text-xs text-slate-200">{isTr ? m.tr : m.en}</p>
                      </div>
                      {celebrateIndex === i && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 0] }} transition={{ duration: 0.6 }}
                          className="text-lg">🎉</motion.span>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Slider + Gains + Armor + CTA */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
            {/* Cigarette Slider */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/80 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isTr ? "Günlük Sigara" : "Daily Cigarettes"}</p>
                <span className="text-2xl font-bold text-white">{dailyCigs}</span>
              </div>
              <input type="range" min={1} max={40} value={dailyCigs}
                onChange={(e) => setDailyCigs(Number(e.target.value))}
                className="w-full accent-teal-400" />

              {/* Gain Counters */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-teal-400"><CountUpNumber value={annualSavings} prefix="$" /></p>
                  <p className="text-[9px] text-slate-400">{isTr ? "Yıllık Tasarruf" : "Annual Savings"}</p>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-cyan-400"><CountUpNumber value={lifeDaysGained} /></p>
                  <p className="text-[9px] text-slate-400">{isTr ? "Kazanılan Gün" : "Days Gained"}</p>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-amber-400"><CountUpNumber value={annualCigs} /></p>
                  <p className="text-[9px] text-slate-400">{isTr ? "İçilmeyen/yıl" : "Not Smoked/yr"}</p>
                </div>
              </div>
            </motion.div>

            {/* Regeneration Armor */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-teal-950/40 to-slate-800/50 rounded-2xl p-5 border border-teal-800/20">
              <h3 className="text-sm font-bold text-teal-300 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> {isTr ? "Yenilenme Zırhınız" : "Your Regeneration Armor"}
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">{isTr ? "Tıbbi" : "Medical"}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {MEDICAL_ARMOR.map(a => (
                  <motion.button key={a.en} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleArmor(a.en)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs transition-all ${
                      selectedArmor.includes(a.en) ? "border-teal-400 bg-teal-950/40 text-teal-300" : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}>
                    <span>{a.emoji}</span> {isTr ? a.tr : a.en}
                  </motion.button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mb-3">{isTr ? "Fitoterapi Desteği" : "Phyto-Support"}</p>
              <div className="flex flex-wrap gap-2">
                {PHYTO_ARMOR.map(a => (
                  <motion.button key={a.en} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleArmor(a.en)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs transition-all ${
                      selectedArmor.includes(a.en) ? "border-emerald-400 bg-emerald-950/40 text-emerald-300" : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}>
                    <span>{a.emoji}</span> {isTr ? a.tr : a.en}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowLabor(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              {isTr ? "Yenilenme Protokolümü Başlat" : "Launch My Regeneration Protocol"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
