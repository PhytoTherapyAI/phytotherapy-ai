// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

const protectionAreas = [
  { id: "metabolic", emoji: "⚖️", label: "Metabolic Balance", old: "Obesity" },
  { id: "cardio", emoji: "🫀", label: "Cardiovascular Shield", old: "High BP" },
  { id: "mental", emoji: "🧠", label: "Mental Resilience", old: "Depression" },
  { id: "genetic", emoji: "🧬", label: "Genetic Cell Protection", old: "Family Cancer" },
  { id: "bone", emoji: "🦴", label: "Bone Density Guard", old: "Osteoporosis" },
  { id: "digestive", emoji: "🍃", label: "Digestive Wellness", old: "GI Issues" },
]

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Reviewing international screening guidelines...",
    "Scanning age-specific biomarkers...",
    "Cross-referencing family history patterns...",
    "Creating your personalized annual check-up calendar...",
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
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-slate-200 border-t-blue-500" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-slate-600 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-blue-500" : "bg-slate-200"}`} />)}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CheckupPlannerPage() {
  const router = useRouter()
  const [gender, setGender] = useState<"male" | "female" | null>(null)
  const [age, setAge] = useState(35)
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["cardio", "metabolic"])
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const toggleArea = (id: string) => {
    setSelectedAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-stone-50 to-emerald-50/20">
      <AnimatePresence>
        {showLabor && <LaborIllusion onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/60">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-800">Longevity Shield</h1>
            <p className="text-xs text-slate-400">Plan your next 10 years of health</p>
          </div>
          <Shield className="w-5 h-5 text-blue-400" />
        </motion.div>

        {/* Gender Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 mb-6">
          {[
            { val: "female" as const, emoji: "👩", label: "Female" },
            { val: "male" as const, emoji: "👨", label: "Male" },
          ].map(g => (
            <motion.button
              key={g.val}
              whileTap={{ scale: 0.96 }}
              onClick={() => setGender(g.val)}
              className={`p-5 rounded-2xl border-2 text-center transition-all ${
                gender === g.val
                  ? g.val === "female" ? "border-pink-300 bg-pink-50" : "border-blue-300 bg-blue-50"
                  : "border-slate-100 bg-white"
              }`}
            >
              <span className="text-3xl block mb-1">{g.emoji}</span>
              <span className="text-sm font-medium text-slate-700">{g.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Age Tunnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Your Age</span>
            <span className="text-xl font-bold text-slate-800">{age}</span>
          </div>
          <input type="range" min={18} max={80} value={age} onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-blue-500" />
          <p className="text-xs text-blue-500 mt-2 text-center">Planning your golden years ahead.</p>
        </motion.div>

        {/* Protection Areas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-3 px-1">Priority Protection Areas</h3>
          <div className="grid grid-cols-2 gap-3">
            {protectionAreas.map((area, i) => {
              const isActive = selectedAreas.includes(area.id)
              return (
                <motion.button
                  key={area.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleArea(area.id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
                    isActive ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-100 bg-white"
                  }`}
                >
                  <span className="text-xl mb-1">{area.emoji}</span>
                  <span className="text-sm font-medium text-slate-700">{area.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Action */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLabor(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Map My Longevity Shield
        </motion.button>

        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-600 mb-2">Your Check-up Calendar</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Based on your age ({age}) and selected areas:</p>
                <div className="bg-blue-50 rounded-xl p-3 space-y-1.5">
                  <p>- Annual blood panel (lipids, glucose, HbA1c)</p>
                  <p>- Blood pressure monitoring every 6 months</p>
                  <p>- Cardiac stress test (recommended at {age > 40 ? "your age" : "age 40+"})</p>
                  {gender === "female" && <p>- Mammography screening</p>}
                  {gender === "male" && <p>- PSA screening discussion with doctor</p>}
                  <p>- Bone density scan (if risk factors present)</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">Guidelines based on WHO, USPSTF, and ACS recommendations.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
