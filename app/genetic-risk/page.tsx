// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Dna } from "lucide-react"
import { useRouter } from "next/navigation"

const improvementAreas = [
  { id: "body", emoji: "⚖️", label: "Body Composition", desc: "Weight & metabolic health" },
  { id: "diet", emoji: "🥗", label: "Anti-Inflammatory Diet", desc: "Nutrition optimization" },
  { id: "active", emoji: "🏃‍♂️", label: "Active Living", desc: "Movement & exercise" },
  { id: "sleep", emoji: "😴", label: "Sleep Architecture", desc: "Restorative rest" },
  { id: "stress", emoji: "🧘", label: "Stress Resilience", desc: "Mental fortitude" },
  { id: "detox", emoji: "🌿", label: "Cellular Detox", desc: "Antioxidant support" },
]

const familySystems = [
  { id: "cardio", emoji: "🫀", label: "Cardiovascular", color: "text-red-500" },
  { id: "neuro", emoji: "🧠", label: "Neurological", color: "text-purple-500" },
  { id: "metabolic", emoji: "🧬", label: "Metabolic", color: "text-amber-500" },
  { id: "autoimmune", emoji: "🛡️", label: "Autoimmune", color: "text-cyan-500" },
]

function DNAHelix() {
  return (
    <div className="relative w-40 h-40 mx-auto mb-4">
      <motion.div
        animate={{ rotateY: [0, 360] }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="absolute inset-0"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2
          const x1 = 70 + Math.cos(angle) * 35
          const x2 = 70 - Math.cos(angle) * 35
          const y = 10 + i * 15
          return (
            <g key={i}>
              <svg className="absolute inset-0" viewBox="0 0 140 140">
                <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(167,139,250,0.3)" strokeWidth={2} />
                <circle cx={x1} cy={y} r={4} fill="#a78bfa" opacity={0.8} />
                <circle cx={x2} cy={y} r={4} fill="#06b6d4" opacity={0.8} />
              </svg>
            </g>
          )
        })}
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 blur-2xl"
      />
    </div>
  )
}

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Mapping genetic predispositions...",
    "Simulating lifestyle cellular effects (Epigenetics)...",
    "Calculating protective factor scores...",
    "Weaving your personalized phytotherapy armor...",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-slate-800 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-fuchsia-800/30">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-slate-700 border-t-fuchsia-400" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-fuchsia-200 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-fuchsia-400" : "bg-slate-700"}`} />)}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function GeneticRiskPage() {
  const router = useRouter()
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["diet", "active"])
  const [familyHistory, setFamilyHistory] = useState<string[]>([])
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const toggleArea = (id: string) => {
    setSelectedAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  const toggleFamily = (id: string) => {
    setFamilyHistory(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AnimatePresence>
        {showLabor && <LaborIllusion onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/10">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">Epigenetic Control Center</h1>
            <p className="text-xs text-slate-400">Your genes load the gun, lifestyle pulls the trigger</p>
          </div>
          <Dna className="w-5 h-5 text-fuchsia-400" />
        </motion.div>

        {/* DNA Helix */}
        <DNAHelix />

        {/* Family History Systems */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 px-1">Family Health History (Systems)</h3>
          <div className="grid grid-cols-2 gap-3">
            {familySystems.map((sys, i) => {
              const isActive = familyHistory.includes(sys.id)
              return (
                <motion.button
                  key={sys.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFamily(sys.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    isActive ? "border-fuchsia-500/50 bg-fuchsia-950/40" : "border-slate-700 bg-slate-800"
                  }`}
                >
                  <span className="text-xl">{sys.emoji}</span>
                  <span className="text-sm text-slate-200">{sys.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Improvement Areas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 px-1">Cellular Improvement Opportunities</h3>
          <div className="grid grid-cols-2 gap-3">
            {improvementAreas.map((area, i) => {
              const isActive = selectedAreas.includes(area.id)
              return (
                <motion.button
                  key={area.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleArea(area.id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
                    isActive ? "border-cyan-500/50 bg-cyan-950/30" : "border-slate-700 bg-slate-800"
                  }`}
                >
                  <span className="text-xl mb-1">{area.emoji}</span>
                  <span className="text-sm font-medium text-white">{area.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{area.desc}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Action */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLabor(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-medium shadow-lg shadow-fuchsia-900/30 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Decode My Epigenetic Potential
        </motion.button>

        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-slate-800 rounded-2xl p-5 border border-fuchsia-800/30">
              <h3 className="text-sm font-semibold text-fuchsia-400 mb-2">Your Epigenetic Shield</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Based on your family history and lifestyle goals: Curcumin (500mg/day) for cellular protection,
                Resveratrol (250mg/day) for epigenetic modulation, and Sulforaphane (from broccoli sprouts)
                for DNA repair enzyme activation. Combined with Mediterranean diet pattern.
              </p>
              <p className="text-xs text-slate-500 mt-3">Epigenetic changes take 3-6 months. Consistency is key.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
