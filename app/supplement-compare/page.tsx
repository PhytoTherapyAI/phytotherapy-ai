// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Swords, Sparkles, Loader2, Shield, Star,
  ChevronRight, TrendingUp, Check, Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

interface Supplement { id: string; name: string; emoji: string; color: string; category: string }

const ROSTER: Supplement[] = [
  { id: "curcumin", name: "Curcumin", emoji: "🟡", color: "#f59e0b", category: "anti-inflammatory" },
  { id: "ashwagandha", name: "Ashwagandha", emoji: "🌿", color: "#3c7a52", category: "adaptogen" },
  { id: "ltheanine", name: "L-Theanine", emoji: "🍵", color: "#06b6d4", category: "focus" },
  { id: "magnesium", name: "Magnesium", emoji: "💜", color: "#8b5cf6", category: "sleep" },
  { id: "omega3", name: "Omega-3", emoji: "🐟", color: "#3b82f6", category: "heart" },
  { id: "rhodiola", name: "Rhodiola", emoji: "🏔️", color: "#ec4899", category: "energy" },
  { id: "whey", name: "Whey Protein", emoji: "💪", color: "#f97316", category: "muscle" },
  { id: "casein", name: "Casein Protein", emoji: "🥛", color: "#a3a3a3", category: "muscle" },
]

const BATTLES = [
  { title: "Focus War", emoji: "🧠", left: "ltheanine", right: "ashwagandha" },
  { title: "Muscle Recovery", emoji: "💪", left: "whey", right: "casein" },
  { title: "Inflammation Shield", emoji: "🔥", left: "curcumin", right: "omega3" },
]

interface CompareResult { category: string; left: number; right: number }

function CompareBar({ label, left, right, leftColor, rightColor }: {
  label: string; left: number; right: number; leftColor: string; rightColor: string
}) {
  const total = left + right || 1
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground"><span>{left}%</span><span className="font-medium text-foreground">{label}</span><span>{right}%</span></div>
      <div className="flex h-3 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(left / total) * 100}%` }}
          transition={{ duration: 0.8 }} className="rounded-l-full" style={{ backgroundColor: leftColor }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${(right / total) * 100}%` }}
          transition={{ duration: 0.8 }} className="rounded-r-full" style={{ backgroundColor: rightColor }} />
      </div>
    </div>
  )
}

function VSOrb({ analyzing }: { analyzing: boolean }) {
  return (
    <motion.div
      animate={analyzing ? { scale: [1, 1.3, 1], rotate: 360 } : { scale: 1 }}
      transition={analyzing ? { repeat: Infinity, duration: 2 } : {}}
      className="relative h-16 w-16 mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
        <span className="text-xl font-black text-white">VS</span>
      </div>
      {analyzing && (
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-400/50" />
      )}
    </motion.div>
  )
}

export default function SupplementComparePage() {
  const { lang } = useLang()
  const [leftId, setLeftId] = useState<string | null>(null)
  const [rightId, setRightId] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current) } }, [])

  const leftSup = ROSTER.find(s => s.id === leftId)
  const rightSup = ROSTER.find(s => s.id === rightId)

  const handleSelect = (id: string) => {
    if (!leftId) setLeftId(id)
    else if (!rightId && id !== leftId) setRightId(id)
  }

  const startCompare = () => {
    setAnalyzing(true); setShowResults(false)
    timerRef.current = setTimeout(() => { setAnalyzing(false); setShowResults(true) }, 3000)
  }

  const results: CompareResult[] = [
    { category: "Bioavailability", left: 72, right: 88 },
    { category: "Evidence Grade", left: 85, right: 90 },
    { category: "Side Effects", left: 65, right: 80 },
    { category: "Cost Efficiency", left: 78, right: 60 },
    { category: "Speed of Action", left: 50, right: 75 },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-3 space-y-1">
          <Swords className="h-10 w-10 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold">Supplement Showdown Arena</h1>
          <p className="text-xs text-muted-foreground">Pick two. Let science decide the winner.</p>
        </motion.div>

        {/* Arena */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className={`rounded-2xl p-4 min-h-[100px] text-center transition-all ${leftSup ? "bg-gradient-to-br from-primary/5 to-emerald-50/50 border-2 border-primary/20" : "bg-white dark:bg-card border-2 border-dashed border-stone-300"}`}>
            {leftSup ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <span className="text-3xl">{leftSup.emoji}</span>
                <p className="text-xs font-bold mt-1">{leftSup.name}</p>
              </motion.div>
            ) : <p className="text-xs text-muted-foreground">Tap a card below</p>}
          </div>
          <VSOrb analyzing={analyzing} />
          <div className={`rounded-2xl p-4 min-h-[100px] text-center transition-all ${rightSup ? "bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-2 border-amber-200/50" : "bg-white dark:bg-card border-2 border-dashed border-stone-300"}`}>
            {rightSup ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <span className="text-3xl">{rightSup.emoji}</span>
                <p className="text-xs font-bold mt-1">{rightSup.name}</p>
              </motion.div>
            ) : <p className="text-xs text-muted-foreground">Tap a card below</p>}
          </div>
        </div>

        {leftId && rightId && !showResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Button onClick={startCompare} disabled={analyzing}
              className="w-full h-12 rounded-2xl text-sm font-semibold shadow-lg shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {analyzing ? "Analyzing..." : "Start Showdown"}
            </Button>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {showResults && leftSup && rightSup && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {results.map((r, i) => (
                <motion.div key={r.category} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <CompareBar label={r.category} left={r.left} right={r.right} leftColor={leftSup.color} rightColor={rightSup.color} />
                </motion.div>
              ))}
              <Button variant="outline" className="w-full rounded-2xl h-11 mt-4"
                onClick={() => { setLeftId(null); setRightId(null); setShowResults(false) }}>
                ← New Showdown
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Epic Battles */}
        {!leftId && (
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Epic Battles</p>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {BATTLES.map(b => (
                <button key={b.title} onClick={() => { setLeftId(b.left); setRightId(b.right) }}
                  className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-card border hover:shadow-md transition-shadow">
                  <span>{b.emoji}</span>
                  <span className="text-xs font-bold whitespace-nowrap">{b.title}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Roster */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Supplement Roster</p>
          <div className="grid grid-cols-4 gap-2">
            {ROSTER.map((s, i) => {
              const selected = s.id === leftId || s.id === rightId
              return (
                <motion.button key={s.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleSelect(s.id)}
                  disabled={selected}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition-all ${
                    selected ? "ring-2 ring-primary bg-primary/5 opacity-50" : "bg-white dark:bg-card border hover:shadow-sm"
                  }`}>
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-[9px] font-bold">{s.name}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
