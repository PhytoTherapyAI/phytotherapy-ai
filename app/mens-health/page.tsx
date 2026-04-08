// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const optimizationGoals = [
  { id: "muscle", emoji: "💪", label: "Muscle & Recovery", desc: "Strength & post-workout repair" },
  { id: "energy", emoji: "⚡", label: "Pure Energy & Focus", desc: "Sustained daily power" },
  { id: "testosterone", emoji: "🔥", label: "Testosterone Support", desc: "Natural hormonal optimization" },
  { id: "hair", emoji: "🛡️", label: "Hair Root Shield", desc: "DHT-blocking phytoactives" },
  { id: "stress", emoji: "🧘‍♂️", label: "Cortisol Management", desc: "Stress & adaptation" },
  { id: "sleep", emoji: "🌙", label: "Deep Sleep Protocol", desc: "Recovery & HGH optimization" },
]

const radarMetrics = [
  { label: "Strength", angle: 0 },
  { label: "Energy", angle: 60 },
  { label: "Focus", angle: 120 },
  { label: "Recovery", angle: 180 },
  { label: "Hormones", angle: 240 },
  { label: "Sleep", angle: 300 },
]

function VitalityRadar({ values }: { values: number[] }) {
  const center = 150
  const maxR = 100

  const getPoint = (angle: number, value: number) => {
    const rad = ((angle - 90) * Math.PI) / 180
    const r = (value / 100) * maxR
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) }
  }

  const gridLevels = [25, 50, 75, 100]
  const points = radarMetrics.map((m, i) => getPoint(m.angle, values[i] || 50))
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Grid */}
        {gridLevels.map(level => {
          const pts = radarMetrics.map(m => getPoint(m.angle, level))
          return (
            <polygon key={level} points={pts.map(p => `${p.x},${p.y}`).join(" ")}
              fill="none" stroke="rgba(100,116,139,0.1)" strokeWidth={1} />
          )
        })}
        {/* Axes */}
        {radarMetrics.map(m => {
          const end = getPoint(m.angle, 100)
          return <line key={m.angle} x1={center} y1={center} x2={end.x} y2={end.y} stroke="rgba(100,116,139,0.08)" strokeWidth={1} />
        })}
        {/* Data */}
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          points={points.map(p => `${p.x},${p.y}`).join(" ")}
          fill="rgba(6,182,212,0.15)" stroke="rgb(6,182,212)" strokeWidth={2}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ r: 0 }}
            animate={{ r: 4 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            cx={p.x} cy={p.y} fill="rgb(6,182,212)" stroke="white" strokeWidth={2}
          />
        ))}
        {/* Labels */}
        {radarMetrics.map((m) => {
          const pos = getPoint(m.angle, 120)
          return (
            <text key={m.label} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              className="text-[10px] fill-slate-400 font-medium">{m.label}</text>
          )
        })}
      </svg>
      {/* Center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-16 h-16 rounded-full bg-cyan-400/20 blur-xl"
        />
      </div>
    </div>
  )
}

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Calculating muscle recovery rate...",
    "Simulating free testosterone / cortisol balance...",
    "Scanning DHT blockers and prostate-protective phytoactives...",
    "Compiling your biological engine report...",
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
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-800 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-slate-700">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-slate-600 border-t-cyan-400" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-cyan-100 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-cyan-400" : "bg-slate-600"}`} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MensHealthPage() {
  const router = useRouter()
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["energy", "testosterone"])
  const [age, setAge] = useState(40)
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  const radarValues = radarMetrics.map((_, i) => {
    const base = 40 + Math.random() * 30
    return Math.min(100, base + selectedGoals.length * 5)
  })

  const biologicalAge = Math.max(age - 8, age - selectedGoals.length * 2)

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
            <h1 className="text-lg font-bold text-white">Performance HQ</h1>
            <p className="text-xs text-slate-400">Optimize Your Biological Engine</p>
          </div>
          <Zap className="w-5 h-5 text-cyan-400" />
        </motion.div>

        {/* Vitality Radar */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <VitalityRadar values={radarValues} />
        </motion.div>

        {/* Biological Age */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-2xl p-5 mb-6 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Chronological Age</span>
            <span className="text-xl font-bold text-white">{age}</span>
          </div>
          <input type="range" min={25} max={65} value={age} onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-cyan-400 mb-3" />
          <div className="bg-gradient-to-r from-cyan-900/30 to-emerald-900/30 rounded-xl p-3 border border-cyan-800/30">
            <p className="text-xs text-cyan-300">
              Our goal: bring your Biological Age to <span className="font-bold text-emerald-400">{biologicalAge}</span>
            </p>
          </div>
        </motion.div>

        {/* Optimization Goals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 px-1">Performance Optimization Goals</h3>
          <div className="grid grid-cols-2 gap-3">
            {optimizationGoals.map((goal, i) => {
              const isActive = selectedGoals.includes(goal.id)
              return (
                <motion.button
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleGoal(goal.id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
                    isActive ? "border-cyan-500/50 bg-cyan-950/40 shadow-lg shadow-cyan-900/20" : "border-slate-700 bg-slate-800"
                  }`}
                >
                  <span className="text-xl mb-1">{goal.emoji}</span>
                  <span className="text-sm font-medium text-white">{goal.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{goal.desc}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Analyze Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLabor(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Analyze My Biological Engine
        </motion.button>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-slate-800 rounded-2xl p-5 border border-cyan-800/30">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">Your Optimization Protocol</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Based on your goals: Tongkat Ali (400mg/day) for testosterone support,
                Ashwagandha KSM-66 (600mg/day) for cortisol management,
                and Saw Palmetto (320mg/day) for DHT balance.
                Combined with HIIT training 3x/week and 7+ hours of quality sleep.
              </p>
              <p className="text-xs text-slate-500 mt-3">Consult your healthcare provider before starting any supplement regimen.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
