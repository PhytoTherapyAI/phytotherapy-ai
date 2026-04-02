// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Calendar, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

const phases = [
  { name: "Menstrual", days: [1, 5], color: "#e88a9a", bg: "bg-rose-50" },
  { name: "Follicular", days: [6, 13], color: "#f5b27a", bg: "bg-orange-50" },
  { name: "Ovulation", days: [14, 16], color: "#7ecba1", bg: "bg-emerald-50" },
  { name: "Luteal", days: [17, 28], color: "#c4a8d4", bg: "bg-purple-50" },
]

const symptoms = [
  { emoji: "🩸", label: "Bleeding" },
  { emoji: "🌪️", label: "Bloating" },
  { emoji: "⚡", label: "High Energy" },
  { emoji: "🍫", label: "Cravings" },
  { emoji: "🥺", label: "Sensitive" },
  { emoji: "😴", label: "Fatigue" },
  { emoji: "🔥", label: "Cramps" },
  { emoji: "💆", label: "Headache" },
]

const insights: Record<string, { title: string; message: string; tip: string }> = {
  Menstrual: {
    title: "Menstrual Phase",
    message: "Your body is renewing. Iron-rich foods and gentle rest are your allies right now.",
    tip: "Consider Ginger tea for cramps and Iron-rich leafy greens.",
  },
  Follicular: {
    title: "Follicular Phase",
    message: "Estrogen is rising — energy and creativity are building. Great time for new routines!",
    tip: "Vitamin B6 and Omega-3 support rising estrogen naturally.",
  },
  Ovulation: {
    title: "Ovulation Window",
    message: "Peak energy and confidence. Your body is at its strongest point in the cycle.",
    tip: "Zinc and Vitamin E support reproductive health during ovulation.",
  },
  Luteal: {
    title: "Luteal Phase",
    message: "Progesterone is peaking. Sugar cravings and mild fatigue are totally normal.",
    tip: "Don't skip your Magnesium Bisglycinate — it helps with PMS symptoms.",
  },
}

function CycleRing({ currentDay }: { currentDay: number }) {
  const segments = 28
  const radius = 120
  const strokeWidth = 18
  const center = 150

  const getPhase = (day: number) => {
    for (const p of phases) {
      if (day >= p.days[0] && day <= p.days[1]) return p
    }
    return phases[3]
  }

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {Array.from({ length: segments }, (_, i) => {
          const day = i + 1
          const phase = getPhase(day)
          const angle = (i / segments) * 360 - 90
          const nextAngle = ((i + 1) / segments) * 360 - 90
          const rad1 = (angle * Math.PI) / 180
          const rad2 = (nextAngle * Math.PI) / 180
          const x1 = center + radius * Math.cos(rad1)
          const y1 = center + radius * Math.sin(rad1)
          const x2 = center + radius * Math.cos(rad2)
          const y2 = center + radius * Math.sin(rad2)
          const isCurrent = day === currentDay

          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={phase.color}
                strokeWidth={isCurrent ? strokeWidth + 6 : strokeWidth}
                strokeLinecap="round"
                opacity={isCurrent ? 1 : 0.4}
              />
              {isCurrent && (
                <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={5} fill="white" stroke={phase.color} strokeWidth={2}>
                  <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="text-center"
        >
          <p className="text-3xl font-bold text-slate-800">Day {currentDay}</p>
          <p className="text-sm text-slate-500 mt-1">{getPhase(currentDay).name} Phase</p>
        </motion.div>
      </div>
    </div>
  )
}

export default function WomensHealthPage() {
  const router = useRouter()
  const [currentDay, setCurrentDay] = useState(22)
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>([])

  const currentPhase = (() => {
    for (const p of phases) {
      if (currentDay >= p.days[0] && currentDay <= p.days[1]) return p
    }
    return phases[3]
  })()

  const insight = insights[currentPhase.name]

  const toggleSymptom = (label: string) => {
    setLoggedSymptoms(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-orange-50/30 to-stone-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/60">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Hormonal Compass</h1>
          <button className="p-2 rounded-xl hover:bg-white/60">
            <Calendar className="w-5 h-5 text-slate-500" />
          </button>
        </motion.div>

        {/* Cycle Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
        >
          <CycleRing currentDay={currentDay} />
        </motion.div>

        {/* Phase Legend */}
        <div className="flex justify-center gap-3 mt-2 mb-6 flex-wrap">
          {phases.map((p) => (
            <div key={p.name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[11px] text-slate-500">{p.name}</span>
            </div>
          ))}
        </div>

        {/* Daily Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-5 mb-6 border ${currentPhase.bg} border-white/50 shadow-sm`}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-700">{insight.title}</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{insight.message}</p>
              <p className="text-xs text-slate-500 mt-2 bg-white/60 rounded-lg px-3 py-2">
                🌿 {insight.tip}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Symptom Logging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-slate-600 mb-3 px-1">How Are You Today?</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {symptoms.map((s) => {
              const isActive = loggedSymptoms.includes(s.label)
              return (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleSymptom(s.label)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition-all ${
                    isActive
                      ? "border-rose-300 bg-rose-50 shadow-sm"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <motion.span
                    className="text-xl"
                    animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {s.emoji}
                  </motion.span>
                  <span className="text-[11px] text-slate-600 whitespace-nowrap">{s.label}</span>
                </motion.button>
              )
            })}
          </div>
          {loggedSymptoms.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-600 mt-2 px-1"
            >
              {loggedSymptoms.length} symptom{loggedSymptoms.length > 1 ? "s" : ""} logged today
            </motion.p>
          )}
        </motion.div>

        {/* Day Navigator (Demo) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <p className="text-xs text-slate-400 mb-3 text-center">Adjust cycle day (demo)</p>
          <input
            type="range"
            min={1}
            max={28}
            value={currentDay}
            onChange={(e) => setCurrentDay(Number(e.target.value))}
            className="w-full accent-rose-400"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Day 1</span>
            <span>Day 28</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
