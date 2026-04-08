// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, X } from "lucide-react"
import { useRouter } from "next/navigation"

const symptomBubbles = [
  { id: "hotflash", emoji: "🔥", label: "Hot Flash", relief: "Black Cohosh + cool breathing technique may help reduce intensity." },
  { id: "sweating", emoji: "💦", label: "Sweating", relief: "Sage leaf tea (2 cups/day) has been shown to reduce night sweats." },
  { id: "brainfog", emoji: "🧠", label: "Brain Fog", relief: "Ginkgo Biloba 120mg/day may support cognitive clarity." },
  { id: "joint", emoji: "🦴", label: "Joint Pain", relief: "Turmeric + Boswellia combo supports joint comfort naturally." },
  { id: "sleep", emoji: "😴", label: "Sleep Issues", relief: "Tough night? Passionflower + Valerian Root could be your allies." },
  { id: "mood", emoji: "🌊", label: "Mood Swings", relief: "St. John's Wort (after medication check) supports emotional balance." },
  { id: "weight", emoji: "⚖️", label: "Weight Change", relief: "Green tea extract + mindful eating support metabolic transition." },
  { id: "libido", emoji: "💫", label: "Low Libido", relief: "Maca root 1500mg/day may support hormonal vitality." },
]

function BalanceAura({ score, symptoms }: { score: number; symptoms: Record<string, number> }) {
  const activeCount = Object.values(symptoms).filter(v => v > 0).length
  const hue = score > 70 ? 260 : score > 40 ? 35 : 0
  const saturation = 30 + (100 - score) * 0.4

  return (
    <div className="relative w-64 h-64 mx-auto">
      <motion.div
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, hsla(${hue}, ${saturation}%, 85%, 0.8) 0%, hsla(${hue}, ${saturation}%, 92%, 0.3) 60%, transparent 80%)`,
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
        className="absolute inset-6 rounded-full"
        style={{
          background: `radial-gradient(circle, hsla(${hue}, ${saturation + 10}%, 80%, 0.6) 0%, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Daily Vitality</p>
        <motion.p
          key={score}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-slate-800"
        >
          {score}%
        </motion.p>
        <p className="text-xs text-slate-500 mt-1">
          {activeCount === 0 ? "Tap symptoms around me" : `${activeCount} area${activeCount > 1 ? "s" : ""} tracked`}
        </p>
      </div>
    </div>
  )
}

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Analyzing hormonal fluctuations...",
    "Scanning body temperature regulators (phytoestrogens)...",
    "Preparing bone health & mental focus shield...",
    "Finalizing your balancing protocol...",
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= steps.length - 1) { clearInterval(interval); setTimeout(onComplete, 800); return s }
        return s + 1
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/60 backdrop-blur-sm"
    >
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-lavender-200 border-t-purple-400"
          style={{ borderTopColor: "#a78bfa" }}
        />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-slate-600 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-purple-400" : "bg-slate-200"}`} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MenopausePanelPage() {
  const router = useRouter()
  const [symptoms, setSymptoms] = useState<Record<string, number>>({})
  const [activeSymptom, setActiveSymptom] = useState<string | null>(null)
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const score = Math.max(20, 82 - Object.values(symptoms).reduce((a, b) => a + b * 5, 0))

  const handleSymptomIntensity = (id: string, value: number) => {
    setSymptoms(prev => ({ ...prev, [id]: value }))
  }

  const activeData = symptomBubbles.find(s => s.id === activeSymptom)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-stone-50">
      <AnimatePresence>
        {showLabor && <LaborIllusion onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/60">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-800">Biological Balance Center</h1>
            <p className="text-xs text-slate-400">Hormonal Balance & Second Spring</p>
          </div>
          <div className="w-9" />
        </motion.div>

        {/* Balance Aura */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <BalanceAura score={score} symptoms={symptoms} />
        </motion.div>

        {/* Symptom Bubbles */}
        <div className="flex flex-wrap justify-center gap-3 mt-4 mb-6">
          {symptomBubbles.map((s, i) => {
            const intensity = symptoms[s.id] || 0
            const isActive = intensity > 0
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveSymptom(s.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl border-2 transition-all ${
                  isActive ? "border-purple-300 bg-purple-50 shadow-sm" : "border-slate-100 bg-white"
                }`}
              >
                <span className="text-xl">{s.emoji}</span>
                <span className="text-[10px] text-slate-600 whitespace-nowrap">{s.label}</span>
                {isActive && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(d => (
                      <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= intensity ? "bg-purple-400" : "bg-slate-200"}`} />
                    ))}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Symptom Detail Sheet */}
        <AnimatePresence>
          {activeSymptom && activeData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setActiveSymptom(null)}
            >
              <motion.div
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                exit={{ y: 200 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl p-6 w-full max-w-lg shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeData.emoji}</span>
                    <h3 className="text-lg font-semibold text-slate-800">{activeData.label}</h3>
                  </div>
                  <button onClick={() => setActiveSymptom(null)} className="p-2 rounded-full hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-4">How intense is it today?</p>
                <div className="flex gap-3 mb-5">
                  {[
                    { val: 1, label: "Mild", color: "bg-amber-100 border-amber-300 text-amber-700" },
                    { val: 2, label: "Moderate", color: "bg-orange-100 border-orange-300 text-orange-700" },
                    { val: 3, label: "Severe", color: "bg-red-100 border-red-300 text-red-700" },
                  ].map(opt => (
                    <motion.button
                      key={opt.val}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSymptomIntensity(activeData.id, opt.val)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        symptoms[activeData.id] === opt.val ? opt.color : "border-slate-100 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>

                {(symptoms[activeData.id] || 0) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-50 rounded-xl p-4 border border-purple-100"
                  >
                    <p className="text-sm text-purple-700">🌿 {activeData.relief}</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Update Protocol Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLabor(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Update My Balancing Protocol
        </motion.button>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-purple-100"
            >
              <h3 className="text-sm font-semibold text-purple-700 mb-2">Your Balancing Protocol</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Based on your symptom profile, we recommend a phytoestrogen-rich protocol with Black Cohosh,
                Sage Leaf, and Magnesium Bisglycinate. Combined with mindful movement and sleep hygiene optimization.
              </p>
              <p className="text-xs text-slate-400 mt-3">Always consult your healthcare provider before starting any supplement.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
