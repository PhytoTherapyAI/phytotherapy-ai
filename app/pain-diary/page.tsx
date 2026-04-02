// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

// ── Region definitions ──
interface BodyRegion {
  id: string
  label: string
  path?: string // SVG path for front view
  backPath?: string // SVG path for back view
}

const BODY_REGIONS: BodyRegion[] = [
  { id: "head", label: "Head", path: "M145,30 C145,15 155,8 165,8 C175,8 185,15 185,30 C185,45 175,55 165,55 C155,55 145,45 145,30Z", backPath: "M145,30 C145,15 155,8 165,8 C175,8 185,15 185,30 C185,45 175,55 165,55 C155,55 145,45 145,30Z" },
  { id: "neck", label: "Neck", path: "M158,55 L172,55 L170,72 L160,72Z", backPath: "M158,55 L172,55 L170,72 L160,72Z" },
  { id: "shoulders", label: "Shoulders", path: "M120,72 L210,72 L215,90 L115,90Z", backPath: "M120,72 L210,72 L215,90 L115,90Z" },
  { id: "chest", label: "Chest", path: "M130,90 L200,90 L198,140 L132,140Z" },
  { id: "upper-back", label: "Upper Back", backPath: "M130,90 L200,90 L198,140 L132,140Z" },
  { id: "abdomen", label: "Abdomen", path: "M135,140 L195,140 L190,195 L140,195Z" },
  { id: "lower-back", label: "Lower Back", backPath: "M135,140 L195,140 L190,195 L140,195Z" },
  { id: "left-arm", label: "Left Arm", path: "M115,90 L130,90 L125,170 L108,170Z", backPath: "M115,90 L130,90 L125,170 L108,170Z" },
  { id: "right-arm", label: "Right Arm", path: "M200,90 L215,90 L222,170 L205,170Z", backPath: "M200,90 L215,90 L222,170 L205,170Z" },
  { id: "left-hand", label: "Left Hand", path: "M105,170 L125,170 L122,195 L103,195Z", backPath: "M105,170 L125,170 L122,195 L103,195Z" },
  { id: "right-hand", label: "Right Hand", path: "M205,170 L225,170 L227,195 L207,195Z", backPath: "M205,170 L225,170 L227,195 L207,195Z" },
  { id: "hips", label: "Hips", path: "M138,195 L192,195 L195,220 L135,220Z", backPath: "M138,195 L192,195 L195,220 L135,220Z" },
  { id: "upper-legs", label: "Upper Legs", path: "M135,220 L195,220 L190,300 L140,300Z", backPath: "M135,220 L195,220 L190,300 L140,300Z" },
  { id: "knees", label: "Knees", path: "M142,300 L188,300 L186,325 L144,325Z", backPath: "M142,300 L188,300 L186,325 L144,325Z" },
  { id: "lower-legs", label: "Lower Legs", path: "M144,325 L186,325 L184,400 L146,400Z", backPath: "M144,325 L186,325 L184,400 L146,400Z" },
  { id: "feet", label: "Feet", path: "M142,400 L188,400 L192,425 L138,425Z", backPath: "M142,400 L188,400 L192,425 L138,425Z" },
]

const PAIN_TYPES = [
  { id: "sharp", emoji: "🔪", label: "Sharp" },
  { id: "dull", emoji: "🌊", label: "Dull/Aching" },
  { id: "burning", emoji: "⚡", label: "Burning" },
  { id: "pressure", emoji: "🫸", label: "Pressure" },
  { id: "throbbing", emoji: "📌", label: "Throbbing" },
]

const DURATIONS = [
  { id: "now", emoji: "⚡", label: "Just Now" },
  { id: "hours", emoji: "⏳", label: "Few Hours" },
  { id: "days", emoji: "🕰️", label: "Days" },
  { id: "weeks", emoji: "📅", label: "Weeks+" },
]

const TRIGGERS = [
  { id: "exercise", emoji: "🏋️", label: "Exercise" },
  { id: "desk", emoji: "💻", label: "Desk Work" },
  { id: "stress", emoji: "😰", label: "Stress" },
  { id: "sleep", emoji: "🌙", label: "Sleep Position" },
  { id: "food", emoji: "🍔", label: "Food" },
]

const RELIEFS = [
  { id: "painkiller", emoji: "💊", label: "Painkiller" },
  { id: "ice", emoji: "🧊", label: "Ice/Heat" },
  { id: "stretch", emoji: "🧘", label: "Stretching" },
  { id: "rest", emoji: "😴", label: "Rest" },
  { id: "nothing", emoji: "❌", label: "Nothing Helps" },
]

// ── Intensity color mapping ──
function getIntensityColor(intensity: number): string {
  if (intensity <= 3) return "rgba(245,158,11,0.5)"    // amber
  if (intensity <= 6) return "rgba(234,88,12,0.6)"     // orange
  return "rgba(185,28,28,0.7)"                          // deep red/terracotta
}

function getIntensityGlow(intensity: number): string {
  if (intensity <= 3) return "0 0 15px rgba(245,158,11,0.4)"
  if (intensity <= 6) return "0 0 25px rgba(234,88,12,0.5)"
  return "0 0 35px rgba(185,28,28,0.6)"
}

// ── Labor Illusion ──
function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Analyzing fascial tension patterns...",
    "Scanning natural anti-inflammatory matches...",
    "Mapping your personalized relief protocol...",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 mx-auto mb-4 rounded-full border-4 border-slate-200 border-t-emerald-500" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-slate-600 dark:text-slate-300 text-sm">{steps[step]}</motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-emerald-500" : "bg-slate-200"}`} />)}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Chip ──
function Chip({ emoji, label, isActive, onClick }: { emoji: string; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm transition-all ${
        isActive ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:border-amber-600 dark:text-amber-300"
          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
      }`}>
      <motion.span animate={isActive ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.2 }}>{emoji}</motion.span>
      {label}
    </motion.button>
  )
}

// ── Mock relief result ──
function getReliefResult(regions: string[], intensity: number, painType: string | null) {
  const regionNames = regions.map(r => BODY_REGIONS.find(b => b.id === r)?.label).filter(Boolean).join(", ")
  if (intensity >= 7) {
    return { supplement: "Curcumin 500mg + Piperine 5mg", topical: "Topical Arnica Gel", exercise: "Gentle mobilization + deep breathing", note: "High intensity pain — consult your doctor if persistent beyond 3 days." }
  }
  if (painType === "burning" || painType === "sharp") {
    return { supplement: "Magnesium Glycinate 400mg", topical: "Capsaicin Cream (0.025%)", exercise: "Nerve gliding exercises", note: "Sharp/burning pain may indicate nerve involvement." }
  }
  return { supplement: "Boswellia 300mg + Omega-3 2g", topical: "Peppermint Oil (diluted)", exercise: "Gentle stretching 10 min", note: "Consistent daily movement helps reduce chronic tension." }
}

// ═══ MAIN PAGE ═══
export default function PainDiaryPage() {
  const router = useRouter()
  const [view, setView] = useState<"front" | "back">("front")
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [intensity, setIntensity] = useState(5)
  const [painType, setPainType] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [triggers, setTriggers] = useState<string[]>([])
  const [relief, setRelief] = useState<string | null>(null)
  const [showLabor, setShowLabor] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Progressive disclosure steps
  const step = selectedRegions.length === 0 ? 0 : !painType ? 1 : !duration ? 2 : triggers.length === 0 ? 3 : !relief ? 4 : 5

  const toggleRegion = (id: string) => {
    setSelectedRegions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }
  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const result = getReliefResult(selectedRegions, intensity, painType)

  const getRegionsForView = () => {
    return BODY_REGIONS.filter(r => {
      if (view === "front") return !!r.path
      return !!r.backPath
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <AnimatePresence>
        {showLabor && <LaborIllusion onComplete={() => { setShowLabor(false); setShowResult(true) }} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white dark:hover:bg-slate-800">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Somatic Body Map</h1>
              <p className="text-xs text-slate-400">Touch where it hurts — we will help you heal</p>
            </div>
          </div>
          <button onClick={() => { setSelectedRegions([]); setPainType(null); setDuration(null); setTriggers([]); setRelief(null); setShowResult(false) }}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-400">
            <RotateCcw className="w-4 h-4" />
          </button>
        </motion.div>

        {/* ── DESKTOP 2-COLUMN / MOBILE 1-COLUMN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ═══ LEFT: Body Map (55%) ═══ */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7">
            <div className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              {/* View Toggle */}
              <div className="flex justify-center gap-2 mb-4">
                {(["front", "back"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      view === v ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                    {v === "front" ? "Front View" : "Back View"}
                  </button>
                ))}
              </div>

              {/* SVG Body */}
              <div className="flex justify-center">
                <svg viewBox="90 0 150 440" className="w-full max-w-[280px] h-auto">
                  {/* Background glow */}
                  <ellipse cx="165" cy="220" rx="80" ry="200" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="40" />

                  {/* Body outline */}
                  <path d="M165,8 C155,8 145,15 145,30 C145,45 155,55 165,55 C175,55 185,45 185,30 C185,15 175,8 165,8 M160,55 L160,72 L170,72 L170,55 M120,72 L210,72 C215,72 218,78 215,90 L200,90 L215,170 L225,195 L207,195 L205,170 L200,90 L130,90 L125,170 L122,195 L103,195 L108,170 L115,90 L130,90 C132,90 130,78 120,72 M135,90 L195,90 L195,195 L192,220 L195,300 L188,325 L186,400 L192,425 L138,425 L146,400 L144,325 L140,300 L135,220 L140,195 L135,90"
                    fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Clickable regions */}
                  {getRegionsForView().map(region => {
                    const isSelected = selectedRegions.includes(region.id)
                    const regionPath = view === "front" ? region.path : (region.backPath || region.path)
                    if (!regionPath) return null

                    return (
                      <g key={region.id} onClick={() => toggleRegion(region.id)} style={{ cursor: "pointer" }}>
                        <motion.path
                          d={regionPath}
                          fill={isSelected ? getIntensityColor(intensity) : "rgba(148,163,184,0.08)"}
                          stroke={isSelected ? "rgba(245,158,11,0.6)" : "rgba(148,163,184,0.15)"}
                          strokeWidth={isSelected ? 1.5 : 0.5}
                          whileHover={{ fillOpacity: 0.3 }}
                          animate={isSelected ? {
                            fillOpacity: [0.4, 0.7, 0.4],
                          } : {}}
                          transition={isSelected ? { repeat: Infinity, duration: 2 } : {}}
                          style={isSelected ? { filter: `drop-shadow(${getIntensityGlow(intensity)})` } : {}}
                        />
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Selected regions tags */}
              {selectedRegions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                  {selectedRegions.map(id => {
                    const region = BODY_REGIONS.find(r => r.id === id)
                    return (
                      <motion.span key={id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="text-[11px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        {region?.label}
                      </motion.span>
                    )
                  })}
                </div>
              )}

              {selectedRegions.length === 0 && (
                <p className="text-center text-xs text-slate-400 mt-4">Tap on body regions where you feel pain</p>
              )}
            </div>
          </motion.div>

          {/* ═══ RIGHT: Smart Diagnosis Panel (45%) ═══ */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start space-y-4">

            {/* Intensity Slider */}
            {selectedRegions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pain Intensity</p>
                  <span className="text-2xl font-bold" style={{ color: getIntensityColor(intensity).replace(/[^#\w,]/g, "").includes("245") ? "#f59e0b" : intensity <= 6 ? "#ea580c" : "#b91c1c" }}>
                    {intensity}/10
                  </span>
                </div>
                <input type="range" min={1} max={10} value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500"
                  style={{
                    background: `linear-gradient(to right, #fbbf24 0%, #ea580c 50%, #991b1b 100%)`,
                    borderRadius: "8px", height: "6px",
                  }}
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>Mild</span><span>Moderate</span><span>Severe</span>
                </div>
              </motion.div>
            )}

            {/* Step 1: Pain Type */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">What does it feel like?</p>
                  <div className="flex flex-wrap gap-2">
                    {PAIN_TYPES.map(p => (
                      <Chip key={p.id} emoji={p.emoji} label={p.label} isActive={painType === p.id}
                        onClick={() => setPainType(painType === p.id ? null : p.id)} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Duration */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">How long?</p>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map(d => (
                      <Chip key={d.id} emoji={d.emoji} label={d.label} isActive={duration === d.id}
                        onClick={() => setDuration(duration === d.id ? null : d.id)} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Triggers */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">What triggers it?</p>
                  <div className="flex flex-wrap gap-2">
                    {TRIGGERS.map(t => (
                      <Chip key={t.id} emoji={t.emoji} label={t.label} isActive={triggers.includes(t.id)}
                        onClick={() => toggleTrigger(t.id)} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 4: Relief */}
            <AnimatePresence>
              {step >= 4 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">What helps?</p>
                  <div className="flex flex-wrap gap-2">
                    {RELIEFS.map(r => (
                      <Chip key={r.id} emoji={r.emoji} label={r.label} isActive={relief === r.id}
                        onClick={() => setRelief(relief === r.id ? null : r.id)} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            {step >= 5 && !showResult && (
              <motion.button
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowLabor(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate My Relief Analysis
              </motion.button>
            )}

            {/* Result */}
            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-5 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
                  <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Your Relief Protocol
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <span className="text-sm">🌿</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Supplement</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{result.supplement}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm">💧</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Topical</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{result.topical}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm">🧘</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Movement</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{result.exercise}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-emerald-200/30 dark:border-emerald-800/20">
                    {result.note} Always consult your healthcare provider.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
