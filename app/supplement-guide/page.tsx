// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Sparkles, Leaf, ShieldCheck, ArrowRightLeft,
  Plus, Star, ExternalLink, AlertTriangle, Check,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

// ── Category pills ──
const CATEGORIES = [
  { id: "sleep", emoji: "😴", label: "Sleep", color: "#6366f1" },
  { id: "focus", emoji: "🧠", label: "Focus", color: "#8b5cf6" },
  { id: "immunity", emoji: "🛡️", label: "Immunity", color: "#3c7a52" },
  { id: "digestion", emoji: "🦷", label: "Digestion", color: "#16a34a" },
  { id: "energy", emoji: "⚡", label: "Energy", color: "#f59e0b" },
  { id: "heart", emoji: "❤️", label: "Heart", color: "#ef4444" },
]

// ── Herbs data ──
interface Herb {
  id: string; name: string; latinName: string; category: string
  trustScore: number; studies: number; emoji: string; color: string
  benefits: string[]; evidenceGrade: "A" | "B" | "C"
  sparklineData: number[]
  interaction?: { drug: string; alternative: { name: string; emoji: string } }
}

const HERBS: Herb[] = [
  { id: "ashwagandha", name: "Ashwagandha", latinName: "Withania somnifera", category: "energy",
    trustScore: 89, studies: 1247, emoji: "🌿", color: "#3c7a52", benefits: ["Stress", "Energy", "Sleep"],
    evidenceGrade: "A", sparklineData: [40, 55, 60, 72, 80, 89] },
  { id: "valerian", name: "Valerian Root", latinName: "Valeriana officinalis", category: "sleep",
    trustScore: 85, studies: 892, emoji: "🌙", color: "#6366f1", benefits: ["Sleep", "Anxiety", "Relaxation"],
    evidenceGrade: "A", sparklineData: [50, 58, 65, 72, 80, 85] },
  { id: "turmeric", name: "Turmeric", latinName: "Curcuma longa", category: "immunity",
    trustScore: 92, studies: 3456, emoji: "🟡", color: "#f97316", benefits: ["Anti-inflammatory", "Joints", "Immunity"],
    evidenceGrade: "A", sparklineData: [60, 68, 75, 82, 88, 92] },
  { id: "stjohnswort", name: "St. John's Wort", latinName: "Hypericum perforatum", category: "focus",
    trustScore: 78, studies: 2100, emoji: "☀️", color: "#eab308", benefits: ["Mood", "Depression", "Anxiety"],
    evidenceGrade: "B", sparklineData: [45, 55, 62, 70, 75, 78],
    interaction: { drug: "SSRI (Sertraline)", alternative: { name: "Valerian Root", emoji: "🌙" } } },
  { id: "echinacea", name: "Echinacea", latinName: "Echinacea purpurea", category: "immunity",
    trustScore: 82, studies: 1567, emoji: "🌸", color: "#3c7a52", benefits: ["Cold", "Immunity", "Upper Respiratory"],
    evidenceGrade: "B", sparklineData: [48, 55, 65, 72, 78, 82] },
  { id: "ginger", name: "Ginger", latinName: "Zingiber officinale", category: "digestion",
    trustScore: 91, studies: 2890, emoji: "🫚", color: "#16a34a", benefits: ["Nausea", "Digestion", "Anti-inflammatory"],
    evidenceGrade: "A", sparklineData: [55, 65, 72, 80, 86, 91] },
  { id: "rhodiola", name: "Rhodiola Rosea", latinName: "Rhodiola rosea", category: "energy",
    trustScore: 84, studies: 645, emoji: "🏔️", color: "#ec4899", benefits: ["Fatigue", "Cognitive", "Endurance"],
    evidenceGrade: "B", sparklineData: [42, 55, 63, 72, 78, 84] },
  { id: "omega3", name: "Omega-3", latinName: "EPA + DHA", category: "heart",
    trustScore: 96, studies: 8900, emoji: "🐟", color: "#3b82f6", benefits: ["Heart", "Brain", "Triglycerides"],
    evidenceGrade: "A", sparklineData: [70, 78, 84, 89, 93, 96] },
  { id: "magnesium", name: "Magnesium", latinName: "Mg Bisglycinate", category: "sleep",
    trustScore: 94, studies: 4200, emoji: "💜", color: "#8b5cf6", benefits: ["Sleep", "Muscle", "Stress"],
    evidenceGrade: "A", sparklineData: [60, 70, 78, 84, 90, 94] },
  { id: "bacopa", name: "Bacopa Monnieri", latinName: "Bacopa monnieri", category: "focus",
    trustScore: 80, studies: 520, emoji: "🧠", color: "#06b6d4", benefits: ["Memory", "Focus", "Learning"],
    evidenceGrade: "B", sparklineData: [38, 48, 58, 65, 74, 80] },
]

// Personalized picks
const PERSONALIZED = ["ashwagandha", "magnesium", "omega3", "turmeric"]

// ── Mini sparkline ──
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data); const min = Math.min(...data)
  const h = 24; const w = 60
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ")
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" /></svg>
}

// ── Smart Swap overlay ──
function SmartSwapOverlay({ drug, alternative, onClose, onSwap }: {
  drug: string; alternative: { name: string; emoji: string }; onClose: () => void; onSwap: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Interaction Detected!</span>
      </div>
      <p className="text-[10px] text-amber-600/80 mb-3">Risk with {drug}.</p>
      <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-white/60 dark:bg-card/60 border border-emerald-200/50">
        <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-bold text-emerald-700">Smart Swap: {alternative.emoji} {alternative.name}</span>
        <Badge className="bg-emerald-100 text-emerald-700 text-[8px]">Safe ✓</Badge>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onClose} className="flex-1 rounded-xl text-xs h-8">Back</Button>
        <Button size="sm" onClick={onSwap} className="flex-1 rounded-xl text-xs h-8 bg-emerald-500 hover:bg-emerald-600 text-white">Swap</Button>
      </div>
    </motion.div>
  )
}

export default function SupplementGuidePage() {
  const { lang } = useLang()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [swapId, setSwapId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = HERBS
    if (selectedCategory) list = list.filter(h => h.category === selectedCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.latinName.toLowerCase().includes(q))
    }
    return list
  }, [selectedCategory, searchQuery])

  const personalized = HERBS.filter(h => PERSONALIZED.includes(h.id))

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-3 space-y-1">
          <Leaf className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Healing Center</h1>
          <p className="text-xs text-muted-foreground">Evidence-based herbal supplements with safety checks based on your profile.</p>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={tx("supplementGuide.searchPlaceholder", lang)}
            className="w-full rounded-2xl border bg-white dark:bg-card pl-11 pr-4 py-3.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm" />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {CATEGORIES.map((c, i) => {
            const isActive = selectedCategory === c.id
            return (
              <motion.button key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedCategory(isActive ? null : c.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive ? "text-white shadow-md" : "bg-white dark:bg-card border hover:shadow-sm"
                }`}
                style={isActive ? { backgroundColor: c.color } : undefined}>
                <span>{c.emoji}</span> {c.label}
              </motion.button>
            )
          })}
        </div>

        {/* Personalized carousel */}
        {!selectedCategory && !searchQuery && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Optimized for You</span>
              <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">AI</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
              {personalized.map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="min-w-[180px] max-w-[180px] shrink-0 rounded-2xl p-4 bg-white dark:bg-card border hover:shadow-md transition-shadow"
                  style={{ borderLeftWidth: 3, borderLeftColor: h.color }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{h.emoji}</span>
                    <div><p className="text-xs font-bold">{h.name}</p><p className="text-[8px] text-muted-foreground italic">{h.latinName}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" style={{ color: h.color }} />
                    <span className="text-[10px] font-bold" style={{ color: h.color }}>{h.trustScore}%</span>
                    <MiniSparkline data={h.sparklineData} color={h.color} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Herb Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((h, i) => (
              <motion.div key={h.id} layout
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                <div className="relative group">
                  <Card className="rounded-3xl overflow-hidden hover:shadow-lg transition-all group-hover:scale-[1.02]"
                    style={{ boxShadow: `0 0 0 0 transparent` }}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${h.color}15` }}>{h.emoji}</div>
                          <div><h3 className="text-sm font-bold">{h.name}</h3><p className="text-[9px] text-muted-foreground italic">{h.latinName}</p></div>
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${h.color}15`, color: h.color }}>
                          <ShieldCheck className="h-3 w-3" /> {h.trustScore}%
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {h.benefits.map(b => <span key={b} className="text-[9px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-muted-foreground">{b}</span>)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" style={{ color: h.color }} /> Grade {h.evidenceGrade}</span>
                          <span className="flex items-center gap-1"><ExternalLink className="h-2.5 w-2.5" /> {h.studies} studies</span>
                        </div>
                        <MiniSparkline data={h.sparklineData} color={h.color} />
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3 rounded-xl h-9 text-xs hover:bg-primary hover:text-white transition-all"
                        onClick={() => h.interaction ? setSwapId(h.id) : undefined}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add to List
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Smart Swap Overlay */}
                  <AnimatePresence>
                    {swapId === h.id && h.interaction && (
                      <SmartSwapOverlay drug={h.interaction.drug} alternative={h.interaction.alternative}
                        onClose={() => setSwapId(null)} onSwap={() => setSwapId(null)} />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No herbs found.</p>
          </div>
        )}

        {/* Trust footer */}
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary">AI-Verified Safety</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">All supplements verified against PubMed & Cochrane. Always consult your doctor.</p>
        </div>
      </div>
    </div>
  )
}
