// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Heart, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

const moodWeather = [
  { emoji: "☀️", label: "Sunny & Peaceful", value: 5 },
  { emoji: "🌤️", label: "Mostly Good", value: 4 },
  { emoji: "🌥️", label: "Partly Cloudy", value: 3 },
  { emoji: "🌧️", label: "Stormy", value: 2 },
  { emoji: "⛈️", label: "Overwhelmed", value: 1 },
]

const healingNeeds = [
  { emoji: "🧘‍♀️", label: "Calm the Mind", desc: "Relaxation & anxiety relief" },
  { emoji: "🤱", label: "Breastfeeding Support", desc: "Safe supplements for nursing" },
  { emoji: "🔋", label: "Energy Recharge", desc: "Fight fatigue naturally" },
  { emoji: "🌸", label: "Body Acceptance", desc: "Postpartum body love" },
  { emoji: "😴", label: "Sleep Recovery", desc: "Better rest when you can" },
  { emoji: "💪", label: "Physical Recovery", desc: "Healing & strength" },
]

const sleepMessages: Record<string, string> = {
  "2": "Only 2 hours? You're a superhero for even standing right now. Let's find you some gentle support.",
  "3": "3 hours of broken sleep is incredibly hard. Your body is doing amazing things despite this.",
  "4": "Only 4 hours? Just standing up right now is a miracle. Even superheroes get tired.",
  "5": "5 hours — better than yesterday maybe? Every bit of rest counts for your recovery.",
  "6": "6 hours! That's a small victory worth celebrating. You're doing great, mama.",
  "7": "7 hours? That's wonderful! Your body is healing beautifully.",
  "8": "8 hours! You must be feeling like a new person. Enjoy this energy!",
}

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Checking breastfeeding safety...",
    "Scanning mood-lifting adaptogens...",
    "Filtering postpartum-safe herbs...",
    "Preparing your compassion protocol...",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        <motion.div className="text-4xl mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>💖</motion.div>
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-slate-600 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-rose-400" : "bg-slate-200"}`} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function PostpartumPage() {
  const router = useRouter()
  const [mood, setMood] = useState<number | null>(null)
  const [sleepHours, setSleepHours] = useState(4)
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([])
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showScreening, setShowScreening] = useState(false)

  const toggleNeed = (label: string) => {
    setSelectedNeeds(prev => prev.includes(label) ? prev.filter(n => n !== label) : [...prev, label])
  }

  const sleepKey = String(Math.min(8, Math.max(2, sleepHours)))
  const sleepMessage = sleepMessages[sleepKey] || sleepMessages["4"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-rose-50/20 to-stone-50">
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
            <h1 className="text-lg font-bold text-slate-800">Safe Harbor</h1>
            <p className="text-xs text-slate-400">Your postpartum sanctuary</p>
          </div>
          <Heart className="w-5 h-5 text-rose-300" />
        </motion.div>

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-5 mb-6 border border-orange-100/50"
        >
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome back, mama. 💛 This is your safe space — no judgment, only support.
            Tell us how you are, and we will find gentle, breastfeeding-safe ways to help.
          </p>
        </motion.div>

        {/* Sleep Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-3">How much sleep did you get?</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">😴</span>
            <input
              type="range" min={2} max={8} value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="flex-1 accent-rose-400"
            />
            <span className="text-lg font-bold text-slate-700 w-12 text-right">{sleepHours}h</span>
          </div>
          <motion.p
            key={sleepHours}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2.5 leading-relaxed"
          >
            {sleepMessage}
          </motion.p>
        </motion.div>

        {/* Mood Weather */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">How is your emotional weather?</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {moodWeather.map((m) => (
              <motion.button
                key={m.value}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMood(m.value)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 transition-all ${
                  mood === m.value ? "border-amber-300 bg-amber-50 shadow-sm" : "border-slate-100 bg-white"
                }`}
              >
                <motion.span
                  className="text-2xl"
                  animate={mood === m.value ? { scale: [1, 1.2, 1] } : {}}
                >
                  {m.emoji}
                </motion.span>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">{m.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Healing Needs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">How Can We Help You Today?</h3>
          <div className="grid grid-cols-2 gap-3">
            {healingNeeds.map((need, i) => {
              const isActive = selectedNeeds.includes(need.label)
              return (
                <motion.button
                  key={need.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleNeed(need.label)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
                    isActive ? "border-rose-300 bg-rose-50" : "border-slate-100 bg-white"
                  }`}
                >
                  <span className="text-xl mb-1">{need.emoji}</span>
                  <span className="text-sm font-medium text-slate-700">{need.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{need.desc}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Inner Balance Scan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-purple-100/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-semibold text-purple-700">Take Your Inner Balance Scan</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            This 2-minute check helps us suggest the right phyto-support for your emotional wellbeing.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowScreening(!showScreening)}
            className="text-xs font-medium text-purple-600 bg-white/70 px-4 py-2 rounded-full"
          >
            {showScreening ? "Close Scan" : "Start Quick Scan"}
          </motion.button>
          <AnimatePresence>
            {showScreening && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <p className="text-sm text-slate-600 mb-3">Over the past 2 weeks, how often have you felt down or hopeless?</p>
                {["Not at all", "Several days", "More than half the days", "Nearly every day"].map((opt, i) => (
                  <button key={opt} className="w-full text-left text-sm text-slate-600 px-4 py-2.5 rounded-xl bg-white/60 mb-2 hover:bg-white transition-colors">
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLabor(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-medium shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Draw My Personal Healing Route
        </motion.button>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
              <h3 className="text-sm font-semibold text-rose-600 mb-2">Your Healing Protocol</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We have prepared a breastfeeding-safe support plan: Chamomile & Lemon Balm for calm,
                Ashwagandha (low dose, nursing-compatible) for energy, and a gentle sleep hygiene routine.
                All herbs are cross-checked with your medication profile.
              </p>
              <p className="text-xs text-slate-400 mt-3">Always discuss with your healthcare provider before starting supplements while nursing.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
