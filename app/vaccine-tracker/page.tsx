// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Shield, Plus, X, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface Vaccine {
  id: string
  name: string
  emoji: string
  status: "done" | "due" | "missing"
  date?: string
}

const vaccineTemplates = [
  { id: "flu", emoji: "🦠", name: "Seasonal Flu Shield", defaultStatus: "missing" as const },
  { id: "tetanus", emoji: "🧱", name: "Tetanus Update", defaultStatus: "due" as const },
  { id: "hpv", emoji: "🧬", name: "HPV Protection", defaultStatus: "missing" as const },
  { id: "hepatitis_b", emoji: "🛡️", name: "Hepatitis B", defaultStatus: "done" as const },
  { id: "mmr", emoji: "💉", name: "MMR (Measles/Mumps/Rubella)", defaultStatus: "done" as const },
  { id: "covid", emoji: "🦠", name: "COVID-19 Booster", defaultStatus: "due" as const },
  { id: "pneumonia", emoji: "🫁", name: "Pneumococcal Shield", defaultStatus: "missing" as const },
  { id: "shingles", emoji: "⚡", name: "Shingles Prevention", defaultStatus: "missing" as const },
]

const quickAdd = [
  { emoji: "🦠", name: "Influenza" },
  { emoji: "🧱", name: "Tetanus/Diphtheria" },
  { emoji: "🧬", name: "HPV" },
  { emoji: "🛡️", name: "Hepatitis A" },
  { emoji: "🌍", name: "Typhoid" },
  { emoji: "🦟", name: "Yellow Fever" },
]

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Scanning age-group specific risks...",
    "Checking global travel disease alerts...",
    "Reviewing immunization schedule gaps...",
    "Compiling your armor recommendations...",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-slate-200 border-t-cyan-500" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-slate-600 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-cyan-500" : "bg-slate-200"}`} />)}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function VaccineTrackerPage() {
  const router = useRouter()
  const [vaccines, setVaccines] = useState<Vaccine[]>(
    vaccineTemplates.map(v => ({ ...v, status: v.defaultStatus }))
  )
  const [showSheet, setShowSheet] = useState(false)
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const toggleStatus = (id: string) => {
    setVaccines(prev => prev.map(v => {
      if (v.id !== id) return v
      const next = v.status === "missing" ? "due" : v.status === "due" ? "done" : "missing"
      return { ...v, status: next }
    }))
  }

  const doneCount = vaccines.filter(v => v.status === "done").length
  const totalCount = vaccines.length
  const shieldPercentage = Math.round((doneCount / totalCount) * 100)

  const statusColor = (s: string) => {
    switch (s) {
      case "done": return "bg-emerald-100 border-emerald-300 text-emerald-700"
      case "due": return "bg-amber-100 border-amber-300 text-amber-700"
      default: return "bg-slate-100 border-slate-200 text-slate-500"
    }
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case "done": return "Protected"
      case "due": return "Due"
      default: return "Missing"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/30 via-stone-50 to-blue-50/20">
      <AnimatePresence>
        {showLabor && <LaborIllusion onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/60">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-800">Immunological Armor</h1>
            <p className="text-xs text-slate-400">Upgrade your biological defenses</p>
          </div>
          <Shield className="w-5 h-5 text-cyan-500" />
        </motion.div>

        {/* Shield Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative w-48 h-48">
            {/* Hexagon grid */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {vaccines.map((v, i) => {
                const angle = (i / totalCount) * Math.PI * 2 - Math.PI / 2
                const r = 65
                const cx = 100 + r * Math.cos(angle)
                const cy = 100 + r * Math.sin(angle)
                const size = 18
                const hex = Array.from({ length: 6 }, (_, j) => {
                  const a = (j / 6) * Math.PI * 2 - Math.PI / 6
                  return `${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`
                }).join(" ")

                return (
                  <motion.polygon
                    key={v.id}
                    points={hex}
                    fill={v.status === "done" ? "#10b981" : v.status === "due" ? "#f59e0b" : "#e2e8f0"}
                    stroke="white"
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: v.status === "done" ? 1 : 0.5 }}
                    transition={{ delay: i * 0.1 }}
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-500" />
              <p className="text-2xl font-bold text-slate-800">{shieldPercentage}%</p>
              <p className="text-[10px] text-slate-400">Protected</p>
            </div>
          </div>
        </motion.div>

        {/* Vaccine List */}
        <div className="space-y-2 mb-6">
          {vaccines.map((v, i) => (
            <motion.button
              key={v.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleStatus(v.id)}
              className="w-full flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 text-left"
            >
              <span className="text-xl">{v.emoji}</span>
              <span className="text-sm text-slate-700 flex-1">{v.name}</span>
              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${statusColor(v.status)}`}>
                {statusLabel(v.status)}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Add More */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowSheet(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-4 h-4" /> Add Vaccine
        </motion.button>

        {/* Travel Radar */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLabor(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Lifestyle & Travel Radar
        </motion.button>

        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-cyan-100">
              <h3 className="text-sm font-semibold text-cyan-600 mb-2">Armor Recommendations</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Based on your age and profile: Consider updating your Seasonal Flu shield (annually),
                checking Tetanus/Diphtheria booster (every 10 years), and discussing HPV vaccination with your doctor.
                {doneCount < totalCount && ` ${totalCount - doneCount} shields still need activation.`}
              </p>
              <p className="text-xs text-slate-400 mt-3">Discuss with your healthcare provider for personalized immunization schedule.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {showSheet && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setShowSheet(false)}>
              <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Quick Add Vaccine</h3>
                  <button onClick={() => setShowSheet(false)} className="p-2 rounded-full hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickAdd.map(item => (
                    <motion.button key={item.name} whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setVaccines(prev => [...prev, { id: item.name.toLowerCase(), ...item, status: "missing" }])
                        setShowSheet(false)
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-700">
                      <span>{item.emoji}</span><span>{item.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
