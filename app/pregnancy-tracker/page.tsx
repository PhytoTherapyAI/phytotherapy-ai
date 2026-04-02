// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Check, ShieldCheck, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"

const weekData: Record<number, { trimester: string; size: string; message: string }> = {
  8: { trimester: "First Trimester", size: "Raspberry", message: "Tiny fingers are forming. Your baby is about the size of a raspberry!" },
  12: { trimester: "First Trimester", size: "Lime", message: "All major organs are developing. Baby is moving, though you can't feel it yet." },
  14: { trimester: "Second Trimester Glow", size: "Lemon", message: "Welcome to the second trimester! Energy is returning and nausea may ease." },
  20: { trimester: "Second Trimester", size: "Banana", message: "Halfway there! Baby can hear your voice now. Talk and sing to them." },
  28: { trimester: "Third Trimester", size: "Eggplant", message: "Baby is practicing breathing movements. You might feel rhythmic hiccups!" },
  36: { trimester: "Third Trimester", size: "Honeydew", message: "Almost there! Baby is gaining weight and getting ready for the big day." },
}

const safeSupplements = [
  { name: "Ginger", use: "Morning sickness relief", dose: "1g/day, divided" },
  { name: "Folate (5-MTHF)", use: "Neural tube development", dose: "400-800mcg/day" },
  { name: "Iron Bisglycinate", use: "Prevent anemia", dose: "As prescribed" },
  { name: "Vitamin D3", use: "Bone development", dose: "1000-2000 IU/day" },
  { name: "Omega-3 DHA", use: "Brain development", dose: "200-300mg DHA/day" },
]

const avoidSupplements = [
  { name: "Sage", reason: "May stimulate uterine contractions" },
  { name: "Senna", reason: "Strong laxative, not safe in pregnancy" },
  { name: "Black Cohosh", reason: "Risk of premature labor" },
  { name: "High-dose Vitamin A", reason: "Teratogenic risk" },
  { name: "St. John's Wort", reason: "Interacts with many prenatal medications" },
]

const symptomChips = [
  { emoji: "🤢", label: "Morning Sickness", tip: "B6 vitamin (25mg) and fresh ginger slices could be your best friends this morning. Try small, frequent meals." },
  { emoji: "🔥", label: "Heartburn", tip: "Eat smaller portions, avoid lying down after meals. Slippery Elm tea may help soothe." },
  { emoji: "🎈", label: "Edema", tip: "Elevate your feet, stay hydrated. Dandelion leaf tea (safe in moderation) may help with water retention." },
  { emoji: "😴", label: "Fatigue", tip: "Listen to your body. Short walks and iron-rich foods can boost energy naturally." },
  { emoji: "😰", label: "Anxiety", tip: "Deep breathing and Chamomile tea (safe in pregnancy) can help calm your mind." },
  { emoji: "🦵", label: "Leg Cramps", tip: "Magnesium Bisglycinate before bed. Stay hydrated and stretch gently." },
]

const weeks = [8, 12, 14, 20, 28, 36]

export default function PregnancyTrackerPage() {
  const router = useRouter()
  const [currentWeek, setCurrentWeek] = useState(14)
  const [activeTab, setActiveTab] = useState<"safe" | "avoid">("safe")
  const [expandedSymptom, setExpandedSymptom] = useState<string | null>(null)

  const data = weekData[currentWeek] || weekData[14]
  const sphereScale = 0.6 + (currentWeek / 40) * 0.6

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-stone-50 to-green-50/30">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/60">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-800">Bloom Dashboard</h1>
            <p className="text-xs text-slate-400">Your pregnancy journey</p>
          </div>
          <div className="w-9" />
        </motion.div>

        {/* Development Sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex flex-col items-center mb-6"
        >
          <motion.div
            key={currentWeek}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: sphereScale, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-200 via-rose-100 to-green-100 shadow-lg shadow-orange-200/50 flex items-center justify-center mb-4"
          >
            <div className="text-center">
              <p className="text-2xl">🌱</p>
              <p className="text-xs text-slate-600 font-medium mt-1">{data.size}</p>
            </div>
          </motion.div>
          <motion.div key={`text-${currentWeek}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-xl font-bold text-slate-800">Week {currentWeek}</p>
            <p className="text-sm text-emerald-600 font-medium">{data.trimester}</p>
          </motion.div>
        </motion.div>

        {/* Week Navigation */}
        <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {weeks.map(w => (
            <motion.button
              key={w}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentWeek(w)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentWeek === w ? "bg-emerald-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              W{w}
            </motion.button>
          ))}
        </div>

        {/* Weekly Insight */}
        <motion.div
          key={`insight-${currentWeek}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">{data.message}</p>
          </div>
        </motion.div>

        {/* Phytotherapy Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-6"
        >
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("safe")}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === "safe" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500" : "text-slate-500"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Safe Supports
            </button>
            <button
              onClick={() => setActiveTab("avoid")}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === "avoid" ? "bg-red-50 text-red-700 border-b-2 border-red-500" : "text-slate-500"
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> Absolutely Avoid
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "safe" ? (
              <motion.div key="safe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                {safeSupplements.map((s) => (
                  <div key={s.name} className="flex items-start gap-3 bg-emerald-50/50 rounded-xl p-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.use} — {s.dose}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="avoid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                {avoidSupplements.map((s) => (
                  <div key={s.name} className="flex items-start gap-3 bg-red-50/50 rounded-xl p-3">
                    <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.name}</p>
                      <p className="text-xs text-red-500">{s.reason}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Symptom Chips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-semibold text-slate-600 mb-3 px-1">How is Your Body Today?</h3>
          <div className="space-y-2">
            {symptomChips.map((s) => (
              <div key={s.label}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpandedSymptom(expandedSymptom === s.label ? null : s.label)}
                  className="w-full flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 text-left"
                >
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-sm text-slate-700 flex-1">{s.label}</span>
                  <motion.span
                    animate={{ rotate: expandedSymptom === s.label ? 180 : 0 }}
                    className="text-slate-400 text-sm"
                  >
                    ▾
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {expandedSymptom === s.label && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-emerald-50 rounded-xl p-3.5 ml-10 mt-1 border border-emerald-100">
                        <p className="text-sm text-emerald-700">🌿 {s.tip}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
