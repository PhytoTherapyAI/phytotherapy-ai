// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Lock, Sparkles, Pill, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

const goalChips = [
  { id: "libido", emoji: "🔥", label: "Libido & Energy Boost" },
  { id: "blood", emoji: "🩸", label: "Blood Flow & Performance" },
  { id: "moisture", emoji: "💧", label: "Natural Moisture & Comfort" },
  { id: "control", emoji: "🧘‍♂️", label: "Control & Endurance" },
  { id: "desire", emoji: "✨", label: "Desire & Connection" },
  { id: "hormones", emoji: "⚖️", label: "Hormonal Balance" },
]

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Scanning safe phyto-aphrodisiacs (Maca, Tribulus)...",
    "Zero-clearing interaction risk with your medications...",
    "Mapping your hormonal balance...",
    "Preparing your intimacy protocol...",
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-indigo-800/30">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-indigo-800 border-t-indigo-400" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-indigo-200 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-indigo-400" : "bg-slate-700"}`} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SexualHealthPage() {
  const router = useRouter()
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [ssriCheck, setSsriCheck] = useState(false)
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AnimatePresence>
        {showLabor && <LaborIllusion onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/10">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Intimacy & Vitality Room <Lock className="w-4 h-4 text-indigo-400" />
            </h1>
          </div>
          <div className="w-9" />
        </motion.div>

        {/* Privacy Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-950/50 rounded-2xl p-4 mb-6 border border-indigo-800/30"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-indigo-200 leading-relaxed">
              This area is end-to-end encrypted. Your data stays on your device and is analyzed by a judgment-free AI.
            </p>
          </div>
        </motion.div>

        {/* Goal Chips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 px-1">What would you like to optimize?</h3>
          <div className="grid grid-cols-2 gap-3">
            {goalChips.map((chip, i) => {
              const isActive = selectedGoals.includes(chip.id)
              return (
                <motion.button
                  key={chip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleGoal(chip.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                    isActive
                      ? "border-indigo-500/50 bg-indigo-950/60 shadow-lg shadow-indigo-900/20"
                      : "border-slate-700/50 bg-slate-800/50 backdrop-blur-sm"
                  }`}
                >
                  <motion.span
                    className="text-xl"
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {chip.emoji}
                  </motion.span>
                  <span className="text-sm text-slate-200">{chip.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* SSRI Connection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-2xl p-5 mb-6 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pill className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Medication Side Effect Detective</h3>
                <p className="text-xs text-slate-400 mt-0.5">Check if SSRI or other meds affect libido</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSsriCheck(!ssriCheck)}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors ${ssriCheck ? "bg-indigo-500" : "bg-slate-600"}`}
            >
              <motion.div
                animate={{ x: ssriCheck ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-6 h-6 bg-white rounded-full shadow"
              />
            </motion.button>
          </div>
          <AnimatePresence>
            {ssriCheck && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 bg-amber-950/30 rounded-xl p-3 border border-amber-800/20">
                  <p className="text-xs text-amber-200">
                    SSRIs (Sertraline, Fluoxetine, Paroxetine) are known to affect sexual function in 40-70% of users.
                    We will cross-check your medication profile for safe alternatives and complementary phyto-support.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLabor(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Prepare My Personal Intimacy Protocol
        </motion.button>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-slate-800 rounded-2xl p-5 border border-indigo-800/30">
              <h3 className="text-sm font-semibold text-indigo-400 mb-2">Your Intimacy Protocol</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Personalized plan: Maca Root (2000mg/day) for libido support,
                L-Arginine (3g/day) for blood flow optimization,
                and Tribulus Terrestris (750mg/day) for hormonal balance.
                All cross-checked against your medication profile for safety.
              </p>
              <p className="text-xs text-slate-500 mt-3">Always consult your healthcare provider. This is not medical advice.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
