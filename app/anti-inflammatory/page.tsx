// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Camera, Sparkles, Loader2, Shield, Leaf, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

const FIRE_STARTERS = [
  { id: "sugar", emoji: "🍬", label: "Sugar" }, { id: "fried", emoji: "🍟", label: "Fried Foods" },
  { id: "redmeat", emoji: "🥩", label: "Processed Meat" }, { id: "soda", emoji: "🥤", label: "Soda" },
  { id: "alcohol", emoji: "🍺", label: "Alcohol" }, { id: "white-bread", emoji: "🍞", label: "White Bread" },
]
const FIREFIGHTERS = [
  { id: "salmon", emoji: "🐟", label: "Salmon" }, { id: "turmeric", emoji: "🟡", label: "Turmeric" },
  { id: "berries", emoji: "🫐", label: "Berries" }, { id: "greens", emoji: "🥬", label: "Leafy Greens" },
  { id: "olive", emoji: "🫒", label: "Olive Oil" }, { id: "walnuts", emoji: "🥜", label: "Walnuts" },
]

function InflammationGauge({ score }: { score: number }) {
  const r = 50; const c = Math.PI * r
  const pct = Math.min(score / 100, 1)
  const color = score > 60 ? "#ef4444" : score > 40 ? "#f59e0b" : "#22c55e"

  return (
    <div className="relative inline-block">
      <svg width={120} height={70} className="overflow-visible">
        <path d={`M 10 65 A ${r} ${r} 0 0 1 110 65`} fill="none" strokeWidth={8}
          className="stroke-stone-200 dark:stroke-stone-700" strokeLinecap="round" />
        <motion.path d={`M 10 65 A ${r} ${r} 0 0 1 110 65`} fill="none" strokeWidth={8}
          stroke={color} strokeLinecap="round" strokeDasharray={c}
          animate={{ strokeDashoffset: c - pct * c }} transition={{ duration: 0.8 }} />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <motion.span key={score} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          className="text-2xl font-bold" style={{ color }}>{score}</motion.span>
        <p className="text-[9px] text-muted-foreground">/ 100</p>
      </div>
    </div>
  )
}

export default function AntiInflammatoryPage() {
  const { lang } = useLang()
  const [selectedFire, setSelectedFire] = useState<string[]>([])
  const [selectedGood, setSelectedGood] = useState<string[]>(["salmon", "turmeric"])
  const [crp, setCrp] = useState(3.5)
  const [analyzing, setAnalyzing] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current) } }, [])

  const inflammationScore = useMemo(() => {
    const base = 50; const fire = selectedFire.length * 10; const good = selectedGood.length * 8
    return Math.max(0, Math.min(100, base + fire - good))
  }, [selectedFire, selectedGood])

  const toggle = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-teal-50/20 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-3 space-y-1">
          <Flame className="h-10 w-10 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Inflammation Radar</h1>
          <p className="text-xs text-muted-foreground">See the fire. Put it out. Track your recovery.</p>
        </motion.div>

        {/* Real-time Gauge */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`rounded-3xl p-6 text-center border transition-colors ${
            inflammationScore > 60 ? "bg-red-50/50 border-red-200/50" : inflammationScore > 40 ? "bg-amber-50/50 border-amber-200/50" : "bg-emerald-50/50 border-emerald-200/50"
          }`}>
          <InflammationGauge score={inflammationScore} />
          <p className="text-xs text-muted-foreground mt-2">
            {inflammationScore > 60 ? "High inflammation risk — add more firefighters!" : inflammationScore > 40 ? "Moderate — room for improvement" : "Great anti-inflammatory balance!"}
          </p>
        </motion.div>

        {/* Fire Starters */}
        <div>
          <p className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1"><Flame className="h-3 w-3" /> Fire Starters</p>
          <div className="flex flex-wrap gap-2">
            {FIRE_STARTERS.map(f => {
              const sel = selectedFire.includes(f.id)
              return (
                <motion.button key={f.id} whileTap={{ scale: 0.9 }} onClick={() => toggle(f.id, selectedFire, setSelectedFire)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${sel ? "bg-red-100 text-red-700 ring-1 ring-red-300" : "bg-white dark:bg-card border hover:shadow-sm"}`}>
                  <span>{f.emoji}</span> {f.label}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Firefighters */}
        <div>
          <p className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1"><Leaf className="h-3 w-3" /> Firefighters</p>
          <div className="flex flex-wrap gap-2">
            {FIREFIGHTERS.map(f => {
              const sel = selectedGood.includes(f.id)
              return (
                <motion.button key={f.id} whileTap={{ scale: 0.9 }} onClick={() => toggle(f.id, selectedGood, setSelectedGood)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${sel ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300" : "bg-white dark:bg-card border hover:shadow-sm"}`}>
                  <span>{f.emoji}</span> {f.label}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* CRP Slider */}
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium">CRP Level</span>
              <span className="text-sm font-bold" style={{ color: crp > 3 ? "#ef4444" : crp > 1 ? "#f59e0b" : "#22c55e" }}>{crp.toFixed(1)} mg/L</span>
            </div>
            <input type="range" min={0} max={10} step={0.1} value={crp} onChange={e => setCrp(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-300" />
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
              <span>0 - Optimal</span><span>1-3 - Moderate</span><span>3+ - High</span>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Button onClick={() => { setAnalyzing(true); timerRef.current = setTimeout(() => setAnalyzing(false), 3000) }}
          className="w-full h-12 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20" disabled={analyzing}>
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
          {analyzing ? "Analyzing..." : "Build My Anti-Inflammatory Shield"}
        </Button>

        {/* Snap Your Plate */}
        <motion.button whileTap={{ scale: 0.95 }}
          className="w-full rounded-2xl bg-white dark:bg-card border p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center"><Camera className="h-6 w-6 text-primary" /></div>
          <div className="text-left"><p className="text-sm font-bold">Snap Your Plate</p><p className="text-[10px] text-muted-foreground">AI analysis of your meal's inflammation score</p></div>
        </motion.button>
      </div>
    </div>
  )
}
