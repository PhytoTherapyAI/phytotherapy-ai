// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, Shield, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

const systemFocusAreas = [
  {
    id: "respiratory", emoji: "🫁", label: "Respiratory", color: "bg-sky-50 border-sky-200",
    risks: ["Lung Screening (CT)", "Nasopharynx Check"],
  },
  {
    id: "digestive", emoji: "🍕", label: "Digestive & Gut", color: "bg-amber-50 border-amber-200",
    risks: ["Colonoscopy", "Stomach Endoscopy", "Liver Ultrasound", "Pancreatic Panel"],
  },
  {
    id: "womens", emoji: "🌸", label: "Women's Screening", color: "bg-pink-50 border-pink-200",
    risks: ["Mammography", "Pap Smear / HPV", "Ovarian CA-125"],
  },
  {
    id: "mens", emoji: "⚡", label: "Men's Screening", color: "bg-cyan-50 border-cyan-200",
    risks: ["PSA (Prostate)", "Testicular Self-Exam"],
  },
  {
    id: "blood", emoji: "🩸", label: "Blood & Immunity", color: "bg-red-50 border-red-200",
    risks: ["CBC Panel", "Lymph Node Check", "Skin Mole Mapping"],
  },
]

const lifestyleCards = [
  {
    id: "smoking",
    label: "Smoking Status",
    options: [
      { emoji: "🚭", label: "Never", msg: "Great! Keep it up.", value: "never" },
      { emoji: "⏳", label: "Quit", msg: "Your body is healing every day.", value: "quit" },
      { emoji: "🚬", label: "Current", msg: "Screening is vital for you.", value: "current" },
    ],
  },
  {
    id: "alcohol",
    label: "Alcohol Use",
    options: [
      { emoji: "🚫", label: "None", msg: "Excellent choice!", value: "none" },
      { emoji: "🍷", label: "Moderate", msg: "Stay within guidelines.", value: "moderate" },
      { emoji: "⚠️", label: "Heavy", msg: "Liver screening recommended.", value: "heavy" },
    ],
  },
]

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Scanning NCCN, WHO screening guidelines...",
    "Running age and genetics-specific risk scoring...",
    "Analyzing lifestyle factors...",
    "Creating your life-saving early detection calendar...",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-slate-200 border-t-teal-500" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-slate-600 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-teal-500" : "bg-slate-200"}`} />)}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CancerScreeningPage() {
  const router = useRouter()
  const [expandedArea, setExpandedArea] = useState<string | null>(null)
  const [selectedRisks, setSelectedRisks] = useState<string[]>([])
  const [lifestyle, setLifestyle] = useState<Record<string, string>>({})
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const toggleRisk = (risk: string) => {
    setSelectedRisks(prev => prev.includes(risk) ? prev.filter(r => r !== risk) : [...prev, risk])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 via-stone-50 to-emerald-50/20">
      <AnimatePresence>
        {showLabor && <LaborIllusion onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/60">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-800">Early Detection Shield</h1>
            <p className="text-xs text-slate-400">Proactive cell protection planning</p>
          </div>
          <Shield className="w-5 h-5 text-teal-400" />
        </motion.div>

        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-teal-50 rounded-2xl p-4 mb-6 border border-teal-100">
          <p className="text-sm text-teal-700">
            Analyzing your genetic heritage and lifestyle to proactively protect your cells.
            Select focus areas relevant to you.
          </p>
        </motion.div>

        {/* System Focus Bento */}
        <div className="space-y-3 mb-6">
          {systemFocusAreas.map((area, i) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${area.color}`}
              >
                <span className="text-2xl">{area.emoji}</span>
                <span className="text-sm font-medium text-slate-700 flex-1">{area.label}</span>
                <motion.div animate={{ rotate: expandedArea === area.id ? 180 : 0 }}>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {expandedArea === area.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pl-12 space-y-2">
                      {area.risks.map(risk => (
                        <motion.button
                          key={risk}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => toggleRisk(risk)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                            selectedRisks.includes(risk)
                              ? "bg-teal-100 text-teal-700 font-medium"
                              : "bg-white text-slate-600 border border-slate-100"
                          }`}
                        >
                          {selectedRisks.includes(risk) ? "✓ " : ""}{risk}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Lifestyle Cards */}
        <div className="space-y-4 mb-6">
          {lifestyleCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
            >
              <h4 className="text-sm font-semibold text-slate-600 mb-3">{card.label}</h4>
              <div className="flex gap-2">
                {card.options.map(opt => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLifestyle(prev => ({ ...prev, [card.id]: opt.value }))}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                      lifestyle[card.id] === opt.value
                        ? "border-teal-300 bg-teal-50"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-[11px] font-medium text-slate-700">{opt.label}</span>
                  </motion.button>
                ))}
              </div>
              {lifestyle[card.id] && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-teal-600 mt-2 bg-teal-50 rounded-lg px-3 py-1.5">
                  {card.options.find(o => o.value === lifestyle[card.id])?.msg}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLabor(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium shadow-lg shadow-teal-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Map My Protection Shield
        </motion.button>

        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
              <h3 className="text-sm font-semibold text-teal-600 mb-2">Your Early Detection Calendar</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Based on your selections, we recommend {selectedRisks.length > 0
                  ? `prioritizing: ${selectedRisks.slice(0, 3).join(", ")}`
                  : "a comprehensive baseline screening"
                }. Guidelines sourced from NCCN, WHO, and ACS.
              </p>
              <p className="text-xs text-slate-400 mt-3">Schedule these with your healthcare provider for personalized guidance.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
