// © 2026 Phytotherapy.ai — All Rights Reserved
// Global Benchmark — Strategy Simulator with interactive sliders + AI insight
"use client"

import { useState, useMemo } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { InnovationShell } from "@/components/innovation/InnovationShell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  COUNTRIES, HVHS_COMPONENTS, calculateGlobalAverage, simulateImprovement,
  findCrossLearning, type CountryProfile, type HVHSComponentId,
} from "@/lib/global-benchmark"
import {
  Globe, TrendingUp, ArrowRight, Sparkles, BookOpen, Lightbulb, Star, Plus,
} from "lucide-react"

// ── SVG Radar Chart (animated via CSS transitions) ──
function RadarChart({ userScores, compareScores, size = 280, lang = "en" }: {
  userScores: Record<HVHSComponentId, number>; compareScores: Record<HVHSComponentId, number>; size?: number; lang?: string
}) {
  const center = size / 2; const radius = size / 2 - 40; const components = HVHS_COMPONENTS
  const getPoint = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / components.length - Math.PI / 2
    const r = (v / 3) * radius
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }
  const makePoly = (scores: Record<string, number>) =>
    components.map((_, i) => { const p = getPoint(i, scores[components[i].id] || 0); return `${p.x},${p.y}` }).join(" ")

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px] mx-auto">
      {[1, 2, 3].map(l => <circle key={l} cx={center} cy={center} r={(l / 3) * radius} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray={l < 3 ? "2,4" : "0"} />)}
      {components.map((_, i) => { const p = getPoint(i, 3); return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.5" className="text-border" /> })}
      <polygon points={makePoly(compareScores)} fill="rgba(99,102,241,0.1)" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="4,3" className="transition-all duration-700" />
      <polygon points={makePoly(userScores)} fill="rgba(60,122,82,0.15)" stroke="#3c7a52" strokeWidth="2" className="transition-all duration-700" />
      {components.map((comp, i) => { const p = getPoint(i, userScores[comp.id] || 0); return <circle key={comp.id} cx={p.x} cy={p.y} r="4" fill="#3c7a52" stroke="white" strokeWidth="1.5" className="transition-all duration-500" /> })}
      {components.map((comp, i) => { const p = getPoint(i, 3.4); return <text key={comp.id} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[8px] font-medium">{comp.short[lang as "en" | "tr"]}</text> })}
    </svg>
  )
}

export default function GlobalBenchmarkPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [selectedCountry, setSelectedCountry] = useState("SG")
  const [savedStrategies, setSavedStrategies] = useState<Set<string>>(new Set())

  // Interactive sliders for simulation
  const turkey = COUNTRIES.find(c => c.code === "TR")!
  const [sliderScores, setSliderScores] = useState<Record<string, number>>({ ...turkey.scores })

  const compareCountry = COUNTRIES.find(c => c.code === selectedCountry)!
  const globalAvg = useMemo(() => calculateGlobalAverage(), [])
  const crossLearning = useMemo(() => findCrossLearning(turkey.scores), [])
  const countriesWithStudies = COUNTRIES.filter(c => c.caseStudy)

  // Dynamic overall score from sliders
  const dynamicScore = useMemo(() => {
    const vals = Object.values(sliderScores)
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
  }, [sliderScores])

  const originalScore = turkey.overallScore

  // AI Insight based on comparison
  const aiInsight = useMemo(() => {
    const gaps = HVHS_COMPONENTS.map(c => ({
      label: c.label[lang as "en" | "tr"],
      gap: (compareCountry.scores[c.id] || 0) - (turkey.scores[c.id] || 0),
    })).filter(g => g.gap > 0).sort((a, b) => b.gap - a.gap)

    if (gaps.length === 0) return null
    const top2 = gaps.slice(0, 2)
    const totalGapPct = Math.round(top2.reduce((a, g) => a + g.gap, 0) / 3 * 100)

    return isTr
      ? `💡 ${compareCountry.name.tr}, ${top2.map(g => g.label).join(" ve ")} konularında Türkiye'nin %${totalGapPct} önünde. Bu alanları optimize etmek genel skorunuzu ${dynamicScore}'a taşıyabilir.`
      : `💡 ${compareCountry.name.en} leads Turkey by ${totalGapPct}% in ${top2.map(g => g.label).join(" and ")}. Optimizing these could bring your score to ${dynamicScore}.`
  }, [selectedCountry, dynamicScore, compareCountry, turkey, lang, isTr])

  const updateSlider = (id: string, value: number) => {
    setSliderScores(prev => ({ ...prev, [id]: value }))
  }

  const toggleStrategy = (code: string) => {
    setSavedStrategies(prev => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }

  return (
    <InnovationShell>
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
          <Globe className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{isTr ? "Küresel Sağlık Karnesi" : "Global Health Benchmark"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{isTr ? "G20+ ülkeleriyle performans karşılaştırması" : "Compare performance with G20+ nations"}</p>
      </div>

      {/* Country chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {COUNTRIES.filter(c => c.code !== "TR").map(c => (
          <button key={c.code} onClick={() => setSelectedCountry(c.code)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              selectedCountry === c.code ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/30"
            }`}>
            <span>{c.flag}</span>{c.name[lang as "en" | "tr"]}
          </button>
        ))}
      </div>

      {/* AI Insight text */}
      {aiInsight && (
        <div className="glass-card rounded-2xl p-4 mb-5 glow-lavender">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-lavender shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{aiInsight}</p>
          </div>
        </div>
      )}

      {/* Radar + Scores */}
      <div className="rounded-2xl border bg-card p-5 shadow-soft mb-5">
        <RadarChart userScores={sliderScores as Record<HVHSComponentId, number>} compareScores={compareCountry.scores} lang={lang} />
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5 text-[10px]"><div className="h-2.5 w-2.5 rounded-full bg-primary" />{isTr ? "Siz" : "You"}</div>
          <div className="flex items-center gap-1.5 text-[10px]"><div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />{compareCountry.name[lang as "en" | "tr"]}</div>
        </div>
        {/* Score comparison */}
        <div className="flex justify-center gap-6 mt-4 pt-3 border-t">
          <div className="text-center">
            <p className={`text-2xl font-bold transition-all duration-500 ${Number(dynamicScore) > Number(originalScore) ? "text-emerald-500" : "text-foreground"}`}>{dynamicScore}</p>
            <p className="text-[10px] text-muted-foreground">🇹🇷 {isTr ? "Türkiye" : "Turkey"}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{compareCountry.overallScore}</p>
            <p className="text-[10px] text-muted-foreground">{compareCountry.flag} {compareCountry.name[lang as "en" | "tr"]}</p>
          </div>
        </div>
      </div>

      {/* ── Interactive Simulation Sliders ── */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mb-5 dark:bg-primary/10">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          {isTr ? "Strateji Simülatörü" : "Strategy Simulator"}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {isTr ? "Sürgüleri kaydırarak yatırım senaryolarını simüle edin. Skor anlık güncellenir." : "Drag sliders to simulate investment scenarios. Score updates in real-time."}
        </p>
        <div className="space-y-3">
          {HVHS_COMPONENTS.map(comp => (
            <div key={comp.id} className="flex items-center gap-3">
              <span className="text-xs font-medium w-24 shrink-0 truncate">{comp.short[lang as "en" | "tr"]}</span>
              <input type="range" min="0" max="3" step="0.1"
                value={sliderScores[comp.id] || 0}
                onChange={(e) => updateSlider(comp.id, parseFloat(e.target.value))}
                className="flex-1 accent-primary h-1.5" />
              <span className="text-xs font-bold w-8 text-right">{(sliderScores[comp.id] || 0).toFixed(1)}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setSliderScores({ ...turkey.scores })}
          className="mt-3 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          ↻ {isTr ? "Sıfırla" : "Reset"}
        </button>
      </div>

      {/* ── Growth Opportunities (positive framing) ── */}
      <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          {isTr ? "Potansiyel Büyüme Alanları" : "Potential Growth Areas"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {crossLearning.slice(0, 6).map(item => {
            const comp = HVHS_COMPONENTS.find(c => c.id === item.component)!
            const potential = Math.round((item.gap / 3) * 100)
            const fillPct = Math.round(((3 - item.gap) / 3) * 100)
            return (
              <div key={item.component} className="rounded-2xl border bg-card p-3 shadow-soft">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">{comp.label[lang as "en" | "tr"]}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px]">
                    +{potential}% {isTr ? "Fırsat" : "Opportunity"}
                  </Badge>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                    style={{ width: `${fillPct}%` }} />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span>{item.bestCountry.flag}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.bestCountry.name[lang as "en" | "tr"]} ({item.bestCountry.scores[item.component as HVHSComponentId]}/3)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Strategy Cards (horizontal scroll, collectible) ── */}
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
        <BookOpen className="h-3.5 w-3.5" />
        {isTr ? "Dünyadan Strateji Kartları" : "World Strategy Cards"}
      </h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {countriesWithStudies.map(country => {
          const study = country.caseStudy!
          const isSaved = savedStrategies.has(country.code)
          return (
            <div key={country.code}
              className="shrink-0 w-64 rounded-2xl border bg-card p-4 shadow-soft hover:shadow-soft-lg transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{country.flag}</span>
                <div>
                  <h4 className="text-sm font-bold">{study.title[lang as "en" | "tr"]}</h4>
                  <p className="text-[10px] text-muted-foreground">{country.name[lang as "en" | "tr"]}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                {study.description[lang as "en" | "tr"]}
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px]">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />{study.impact[lang as "en" | "tr"]}
                </Badge>
                <button onClick={() => toggleStrategy(country.code)}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                    isSaved
                      ? "bg-primary text-primary-foreground"
                      : "border hover:border-primary hover:text-primary"
                  }`}>
                  {isSaved ? "✓" : <Plus className="h-3 w-3" />}
                  {isSaved ? (isTr ? "Eklendi" : "Saved") : (isTr ? "Vizyonuma Ekle" : "Add to Vision")}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[10px] text-muted-foreground/40">{isTr ? "Bu analiz simülasyon amaçlıdır, tıbbi tavsiye değildir." : "This analysis is for simulation purposes, not medical advice."}</p>
    </div>
    </InnovationShell>
  )
}
