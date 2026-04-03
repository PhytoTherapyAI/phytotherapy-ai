// © 2026 Doctopal — All Rights Reserved
// Unified lab insights: Longevity ranges, organ systems, biological age, healthspan scores, action plan
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Sparkles, MessageSquare } from "lucide-react"
import { LONGEVITY_RANGES, ORGAN_SYSTEMS, type BiomarkerRange } from "@/lib/data/longevity-ranges"

// ── Mock user values ──
const MOCK_VALUES: Record<string, number> = {
  hba1c: 5.3, glucose: 92, insulin: 6.2,
  ldl: 118, apob: 95, triglycerides: 88,
  hscrp: 1.2, tsh: 1.8, alt: 25,
  creatinine: 0.85, vitd: 38, ferritin: 65,
}

// ── Longevity Range Bar ──
function LongevityRangeBar({ marker, value, lang }: { marker: BiomarkerRange; value: number; lang: string }) {
  const isTr = lang === "tr"
  const [showTips, setShowTips] = useState(false)

  const maxVal = marker.standardRange[1] * 1.3
  const pctPos = Math.min((value / maxVal) * 100, 98)
  const isInLongevity = value >= marker.longevityRange[0] && value <= marker.longevityRange[1]
  const isInOptimal = value >= marker.optimalRange[0] && value <= marker.optimalRange[1]
  const dotColor = isInLongevity ? "bg-amber-400" : isInOptimal ? "bg-emerald-500" : "bg-red-500"

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold">{marker.emoji} {isTr ? marker.nametr : marker.name}</span>
        <span className={`text-xs font-bold ${isInLongevity ? "text-amber-600" : isInOptimal ? "text-emerald-600" : "text-red-600"}`}>
          {value} {marker.unit}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {/* Standard */}
        <div className="absolute inset-0 rounded-full bg-slate-200 dark:bg-slate-700" />
        {/* Optimal overlay */}
        <div className="absolute h-full rounded-full bg-emerald-200 dark:bg-emerald-800" style={{
          left: `${(marker.optimalRange[0] / maxVal) * 100}%`,
          width: `${((marker.optimalRange[1] - marker.optimalRange[0]) / maxVal) * 100}%`,
        }} />
        {/* Longevity overlay */}
        <div className="absolute h-full rounded-full bg-amber-300 dark:bg-amber-700" style={{
          left: `${(marker.longevityRange[0] / maxVal) * 100}%`,
          width: `${((marker.longevityRange[1] - marker.longevityRange[0]) / maxVal) * 100}%`,
        }} />
        {/* User value dot */}
        <motion.div initial={{ left: 0 }} animate={{ left: `${pctPos}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`absolute top-0 h-3 w-3 rounded-full ${dotColor} border-2 border-white shadow-md`}
          style={{ transform: "translateX(-50%)" }} />
      </div>
      <div className="flex justify-between mt-0.5 text-[8px] text-muted-foreground">
        <span>{isTr ? "Standart" : "Standard"}</span>
        <span className="text-emerald-600">{isTr ? "Optimal" : "Optimal"}</span>
        <span className="text-amber-600">{isTr ? "Uzun Ömür" : "Longevity"}</span>
      </div>
      {marker.improvementTips.length > 0 && !isInLongevity && (
        <button onClick={() => setShowTips(!showTips)} className="text-[10px] text-primary mt-1 hover:underline">
          💡 {isTr ? "Nasıl iyileştirebilirim?" : "How can I improve?"} {showTips ? "▲" : "▼"}
        </button>
      )}
      <AnimatePresence>
        {showTips && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {marker.improvementTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 mt-1 rounded-lg bg-primary/5 px-2.5 py-1.5 text-[10px]">
                <span className={`shrink-0 rounded px-1 py-0.5 text-[8px] font-bold ${tip.evidence === "A" ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"}`}>{tip.evidence}</span>
                <span>{isTr ? tip.tipTr : tip.tip}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Organ System Cards ──
function OrganSystemCards({ lang }: { lang: string }) {
  const isTr = lang === "tr"
  const [expanded, setExpanded] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "system">("system")

  return (
    <div className="rounded-2xl border bg-white dark:bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">🫀 {isTr ? "Organ Sistem Görünümü" : "Organ System View"}</h3>
        <div className="flex gap-1">
          {(["list", "system"] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${viewMode === m ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground"}`}>
              {m === "list" ? "📋" : "🫀"} {m === "list" ? (isTr ? "Liste" : "List") : (isTr ? "Sistem" : "System")}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ORGAN_SYSTEMS.map(sys => {
          const markers = LONGEVITY_RANGES.filter(m => sys.markers.includes(m.id))
          const scores = markers.map(m => {
            const v = MOCK_VALUES[m.id] || 0
            const inLong = v >= m.longevityRange[0] && v <= m.longevityRange[1]
            const inOpt = v >= m.optimalRange[0] && v <= m.optimalRange[1]
            return inLong ? 95 : inOpt ? 75 : 45
          })
          const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          const isExpanded = expanded === sys.id

          return (
            <div key={sys.id} className={`rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md ${isExpanded ? "col-span-2 sm:col-span-3 bg-white dark:bg-card shadow-md" : ""}`}
              onClick={() => setExpanded(isExpanded ? null : sys.id)}
              style={{ borderLeftColor: sys.color, borderLeftWidth: 3 }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg">{sys.emoji}</span>
                  <span className="text-xs font-semibold ml-1">{isTr ? sys.tr : sys.en}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${avgScore >= 80 ? "text-emerald-600" : avgScore >= 60 ? "text-amber-600" : "text-red-600"}`}>{avgScore}</span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="mt-3 overflow-hidden" onClick={e => e.stopPropagation()}>
                    {markers.map(m => <LongevityRangeBar key={m.id} marker={m} value={MOCK_VALUES[m.id] || 0} lang={lang} />)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Biological Age ──
function BiologicalAgeCard({ lang, chronologicalAge = 35 }: { lang: string; chronologicalAge?: number }) {
  const isTr = lang === "tr"
  const [showPlan, setShowPlan] = useState(false)

  // Mock calculation — each marker in longevity range → -0.5yr, in optimal → 0, outside → +0.5yr
  const ageDelta = useMemo(() => {
    let delta = 0
    LONGEVITY_RANGES.forEach(m => {
      const v = MOCK_VALUES[m.id] || 0
      if (v >= m.longevityRange[0] && v <= m.longevityRange[1]) delta -= 0.5
      else if (v >= m.optimalRange[0] && v <= m.optimalRange[1]) delta += 0
      else delta += 0.5
    })
    return Math.round(delta)
  }, [])

  const bioAge = chronologicalAge + ageDelta
  const isYounger = ageDelta < 0
  const diff = Math.abs(ageDelta)

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 shadow-sm">
      <h3 className="text-sm font-bold mb-4 text-center">🧬 {isTr ? "Biyolojik Yaşınız" : "Your Biological Age"}</h3>
      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase">{isTr ? "Kronolojik" : "Chronological"}</p>
          <p className="text-3xl font-bold text-muted-foreground">{chronologicalAge}</p>
        </div>
        <span className="text-2xl">→</span>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase">{isTr ? "Biyolojik" : "Biological"}</p>
          <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-bold ${isYounger ? "text-emerald-600" : "text-red-600"}`}>{bioAge}</motion.p>
        </div>
      </div>
      <p className={`text-center text-sm font-bold ${isYounger ? "text-emerald-600" : "text-red-600"}`}>
        {isYounger ? "🎉" : "⚠️"} {diff} {isTr ? (isYounger ? "yıl GENÇ!" : "yıl YAŞLI") : (isYounger ? "years YOUNGER!" : "years OLDER")}
      </p>
      <button onClick={() => setShowPlan(!showPlan)} className="w-full mt-3 text-xs text-primary font-medium hover:underline text-center">
        {isTr ? "Biyolojik yaşımı nasıl düşürürüm?" : "How to reduce my biological age?"} {showPlan ? "▲" : "▼"}
      </button>
      <AnimatePresence>
        {showPlan && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2 space-y-1.5">
            {[
              { tip: "Turmeric 500mg 2x/day", tipTr: "Zerdeçal 500mg 2x/gün", impact: "-1 yr", evidence: "A" },
              { tip: "D3+K2 5000IU/day", tipTr: "D3+K2 5000IU/gün", impact: "-0.5 yr", evidence: "A" },
              { tip: "Omega-3 2000mg/day", tipTr: "Omega-3 2000mg/gün", impact: "-0.5 yr", evidence: "A" },
              { tip: "Time-restricted eating (16:8)", tipTr: "Zaman kısıtlı beslenme (16:8)", impact: "-1 yr", evidence: "B" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white/80 dark:bg-card/80 px-3 py-2 text-xs border">
                <span>🌿 {isTr ? r.tipTr : r.tip}</span>
                <span className="text-emerald-600 font-bold">{r.impact}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Action Plan ──
function ActionPlan({ lang }: { lang: string }) {
  const isTr = lang === "tr"
  const foods_add = ["🐟 Salmon (Omega-3)", "🥬 Leafy Greens (Folate)", "🫐 Blueberries", "🥚 Eggs (Vit D)", "🥑 Avocado"]
  const foods_reduce = ["🍟 Fried foods", "🍬 Sugar", "🍞 Refined carbs", "🍺 Alcohol", "🥤 Sugary drinks"]
  const supplements = [
    { name: "Turmeric 500mg", evidence: "A" }, { name: "Omega-3 2000mg", evidence: "A" },
    { name: "D3+K2 5000IU", evidence: "A" }, { name: "Ashwagandha 300mg", evidence: "B" },
    { name: "Milk Thistle 250mg", evidence: "A" },
  ]

  return (
    <div className="rounded-2xl border bg-white dark:bg-card p-5 shadow-sm">
      <h3 className="text-sm font-bold mb-4">📋 {isTr ? "Kişisel Aksiyon Planınız" : "Your Personalized Action Plan"}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2">{isTr ? "Eklenmesi Gereken Besinler" : "Top 5 Foods to Add"}</p>
          {foods_add.map(f => <p key={f} className="text-xs mb-1">{f}</p>)}
        </div>
        <div>
          <p className="text-[10px] font-bold text-red-600 uppercase mb-2">{isTr ? "Azaltılması Gereken" : "Top 5 Foods to Reduce"}</p>
          {foods_reduce.map(f => <p key={f} className="text-xs mb-1">{f}</p>)}
        </div>
        <div>
          <p className="text-[10px] font-bold text-primary uppercase mb-2">{isTr ? "Takviyeler" : "Top 5 Supplements"}</p>
          {supplements.map(s => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs mb-1">
              <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${s.evidence === "A" ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"}`}>{s.evidence}</span>
              🌿 {s.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Export ──
interface Props { lang: "en" | "tr"; chronologicalAge?: number }

export function LabInsightsPanel({ lang, chronologicalAge }: Props) {
  const isTr = lang === "tr"

  return (
    <div className="space-y-6 mt-8">
      {/* Longevity Ranges Header */}
      <div>
        <h2 className="text-base font-bold mb-1 flex items-center gap-2">
          🧬 {isTr ? "Standart vs Optimal vs Uzun Ömür Aralıkları" : "Standard vs Optimal vs Longevity Ranges"}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          {isTr ? "Doktorunuz 'normal' diyor. Biz 100 sağlıklı yıl için neyin optimal olduğunu gösteriyoruz." : "Your doctor says 'normal'. We show you what's optimal for 100 healthy years."}
        </p>
      </div>

      {/* Biological Age */}
      <BiologicalAgeCard lang={lang} chronologicalAge={chronologicalAge || 35} />

      {/* Organ System Cards */}
      <OrganSystemCards lang={lang} />

      {/* Upload from ANY Lab */}
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center">
        <h3 className="text-sm font-bold mb-1">📤 {isTr ? "HERHANGİ bir Laboratuvardan Yükleyin" : "Upload from ANY Lab"}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {isTr
            ? "Kendi laboratuvarını gerektiren platformlardan ($499+/yıl) farklı olarak, DoctoPal dünya genelindeki tüm laboratuvar sonuçlarını analiz eder."
            : "Unlike platforms requiring their own labs ($499+/year), DoctoPal analyzes results from any laboratory worldwide."}
        </p>
        <p className="text-[10px] text-muted-foreground">{isTr ? "Özel Anlaşma Gerekmez" : "No Exclusive Partnership Needed"}</p>
      </div>

      {/* Action Plan */}
      <ActionPlan lang={lang} />

      {/* AI Chat FAB hint */}
      <div className="rounded-xl bg-slate-900 text-white p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold">{isTr ? "Sonuçlarınız Hakkında AI'a Sorun" : "Ask AI About Your Results"}</p>
          <p className="text-[10px] text-white/60">{isTr ? '"D vitaminim neden düşük?", "CRP\'yi nasıl düşürürüm?"' : '"Why is my Vitamin D low?", "What should I eat to lower hs-CRP?"'}</p>
        </div>
        <a href="/health-assistant" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium">
          {isTr ? "Sor" : "Ask"} →
        </a>
      </div>
    </div>
  )
}
