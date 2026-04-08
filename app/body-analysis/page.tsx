// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload, Sparkles, Flame, Activity, Heart,
  Dumbbell, Laptop, PersonStanding, Loader2,
  ChevronRight, Shield, TrendingUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ═══ MAGIC DROPZONE ═══
function MagicDropzone({ lang }: { lang: string }) {
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)

  const handleUpload = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); setDone(true) }, 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-emerald-50/50 dark:from-primary/10 dark:to-emerald-900/10 p-8 text-center backdrop-blur-md relative overflow-hidden">
      {/* Breathing glow */}
      <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {!scanning && !done ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Drop Your Lab Report PDF Here</h3>
            <p className="text-xs text-muted-foreground mb-5 max-w-sm mx-auto">
              AI will read all your values in seconds and transform them into a clear health map.
            </p>
            <Button onClick={handleUpload} className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4 mr-2" /> Upload & Analyze
            </Button>
            <button className="block mx-auto mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Or enter values manually →
            </button>
          </motion.div>
        ) : scanning ? (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6">
            <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin mb-4" />
            <motion.p key="scan1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium">
              Reading biomarkers...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <span className="text-4xl">🎉</span>
            <p className="text-sm font-bold text-primary mt-2">12 biomarkers detected!</p>
            <p className="text-xs text-muted-foreground">Scroll down to see your health map.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══ VITALITY GAUGE ═══
function VitalityGauge({ label, value, max, unit, status }: {
  label: string; value: number; max: number; unit: string; status: "optimal" | "warning" | "critical"
}) {
  const pct = Math.min((value / max) * 100, 100)
  const colors = { optimal: "#22c55e", warning: "#f59e0b", critical: "#ef4444" }
  const color = colors[status]
  const r = 40; const c = Math.PI * r // half circle

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-white dark:bg-card border p-4 text-center">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="relative inline-block">
        <svg width={100} height={60} className="overflow-visible">
          <path d={`M 10 55 A ${r} ${r} 0 0 1 90 55`} fill="none" strokeWidth={7}
            className="stroke-stone-200 dark:stroke-stone-700" strokeLinecap="round" />
          <motion.path d={`M 10 55 A ${r} ${r} 0 0 1 90 55`} fill="none" strokeWidth={7}
            stroke={color} strokeLinecap="round"
            strokeDasharray={c} initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (pct / 100) * c }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className="text-lg font-bold" style={{ color }}>{value}</span>
          <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
        </div>
      </div>
      <Badge className="mt-1 text-[8px]" style={{ backgroundColor: `${color}15`, color }}>{status}</Badge>
    </motion.div>
  )
}

// ═══ SMOOTH SLIDER ═══
function SmoothSlider({ label, value, min, max, unit, emoji, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; emoji: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{emoji} {label}</span>
        <span className="text-sm font-bold text-foreground">{value} {unit}</span>
      </div>
      <div className="relative h-8 flex items-center">
        <input type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-stone-200 dark:bg-stone-700
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-primary/25 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white" />
        <div className="absolute h-2 rounded-full bg-primary/30 pointer-events-none left-0"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ═══ ENERGY BUDGET RING ═══
function EnergyBudgetRing({ kcal, activity }: { kcal: number; activity: string }) {
  const r = 54; const c = 2 * Math.PI * r
  const pct = Math.min((kcal / 3500) * 100, 100)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 p-6 text-center">
      <div className="relative inline-block mb-3">
        <svg width={128} height={128} className="transform -rotate-90">
          <circle cx={64} cy={64} r={r} strokeWidth={8} fill="none" className="stroke-stone-200/50" />
          <motion.circle cx={64} cy={64} r={r} strokeWidth={8} fill="none" strokeLinecap="round"
            className="stroke-amber-500" strokeDasharray={c}
            animate={{ strokeDashoffset: c - (pct / 100) * c }}
            transition={{ duration: 1 }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Flame className="h-5 w-5 text-amber-500 mb-0.5" />
          <motion.span className="text-2xl font-bold text-amber-600" key={kcal}
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            {kcal}
          </motion.span>
          <span className="text-[10px] text-muted-foreground">kcal/day</span>
        </div>
      </div>
      <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Daily Energy Budget</p>
      <p className="text-xs text-muted-foreground">{activity}</p>
    </motion.div>
  )
}

// ═══ ACTIVITY CHIPS ═══
const ACTIVITIES = [
  { id: "sedentary", emoji: "🛋️", label: "Desk Warrior", factor: 1.2 },
  { id: "light", emoji: "🚶", label: "Daily Walker", factor: 1.375 },
  { id: "moderate", emoji: "🏃", label: "Active Mover", factor: 1.55 },
  { id: "heavy", emoji: "🏋️", label: "Iron Bender", factor: 1.725 },
]

export default function BodyAnalysisPage() {
  const { lang } = useLang()
  const [weight, setWeight] = useState(72)
  const [height, setHeight] = useState(175)
  const [age, setAge] = useState(30)
  const [activity, setActivity] = useState("light")

  const bmi = useMemo(() => (weight / ((height / 100) ** 2)).toFixed(1), [weight, height])
  const bmr = useMemo(() => Math.round(10 * weight + 6.25 * height - 5 * age + 5), [weight, height, age])
  const actFactor = ACTIVITIES.find(a => a.id === activity)?.factor || 1.375
  const tdee = Math.round(bmr * actFactor)
  const bmiStatus: "optimal" | "warning" | "critical" = Number(bmi) < 18.5 ? "warning" : Number(bmi) < 25 ? "optimal" : Number(bmi) < 30 ? "warning" : "critical"

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-3 space-y-1">
          <Activity className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Biohacking Center</h1>
          <p className="text-xs text-muted-foreground">Your body, decoded. Your biology, optimized.</p>
        </motion.div>

        {/* Magic Dropzone */}
        <MagicDropzone lang={lang} />

        {/* Vitality Dials */}
        <div className="grid grid-cols-3 gap-3">
          <VitalityGauge label="Thyroid" value={2.4} max={5} unit="mIU/L" status="optimal" />
          <VitalityGauge label="Kidney" value={1.1} max={1.5} unit="mg/dL" status="optimal" />
          <VitalityGauge label="Liver" value={42} max={56} unit="U/L" status="warning" />
        </div>

        {/* Body Sliders */}
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-5">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <PersonStanding className="h-4 w-4 text-primary" /> Body Metrics
            </h3>
            <SmoothSlider label="Weight" value={weight} min={40} max={150} unit="kg" emoji="⚖️" onChange={setWeight} />
            <SmoothSlider label="Height" value={height} min={140} max={210} unit="cm" emoji="📏" onChange={setHeight} />
            <SmoothSlider label="Age" value={age} min={16} max={90} unit="yrs" emoji="🎂" onChange={setAge} />
          </CardContent>
        </Card>

        {/* Activity Chips */}
        <div className="grid grid-cols-2 gap-2.5">
          {ACTIVITIES.map((a, i) => (
            <motion.button key={a.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setActivity(a.id)}
              className={`flex items-center gap-2.5 rounded-2xl p-3.5 text-left transition-all ${
                activity === a.id
                  ? "bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-400 shadow-sm"
                  : "bg-white dark:bg-card border hover:shadow-sm"
              }`}>
              <span className="text-xl">{a.emoji}</span>
              <span className={`text-xs font-bold ${activity === a.id ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>{a.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Results — Real-time */}
        <div className="grid grid-cols-2 gap-3">
          <EnergyBudgetRing kcal={tdee} activity={ACTIVITIES.find(a => a.id === activity)?.label || ""} />
          <div className="space-y-3">
            <VitalityGauge label="BMI" value={Number(bmi)} max={40} unit="" status={bmiStatus} />
            <Card className="rounded-2xl">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Base Metabolic Rate</p>
                <p className="text-lg font-bold text-foreground">{bmr} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
