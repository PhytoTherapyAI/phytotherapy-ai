"use client"

import { useState, useMemo } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  COUNTRIES, HVHS_COMPONENTS, calculateGlobalAverage, simulateImprovement,
  findCrossLearning, type CountryProfile, type HVHSComponentId,
} from "@/lib/global-benchmark"
import {
  Globe, TrendingUp, Target, ChevronDown, ChevronUp, ArrowRight,
  Sparkles, BookOpen, BarChart3, Lightbulb, Star, Flag,
} from "lucide-react"

// ── SVG Radar Chart ──
function RadarChart({ userScores, compareScores, compareLabel, size = 280, lang = "en" }: {
  userScores: Record<HVHSComponentId, number>
  compareScores: Record<HVHSComponentId, number>
  compareLabel: string
  size?: number
  lang?: string
}) {
  const center = size / 2
  const radius = size / 2 - 40
  const components = HVHS_COMPONENTS

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / components.length - Math.PI / 2
    const r = (value / 3) * radius
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  const makePolygon = (scores: Record<string, number>) =>
    components.map((_, i) => {
      const id = components[i].id
      const p = getPoint(i, scores[id] || 0)
      return `${p.x},${p.y}`
    }).join(" ")

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {/* Grid circles */}
      {[1, 2, 3].map(level => (
        <circle key={level} cx={center} cy={center} r={(level / 3) * radius}
          fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray={level < 3 ? "2,4" : "0"} />
      ))}
      {/* Grid lines */}
      {components.map((_, i) => {
        const p = getPoint(i, 3)
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.5" className="text-border" />
      })}
      {/* Compare polygon */}
      <polygon points={makePolygon(compareScores)} fill="rgba(99,102,241,0.1)" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="4,3" />
      {/* User polygon */}
      <polygon points={makePolygon(userScores)} fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="2" />
      {/* User points */}
      {components.map((comp, i) => {
        const p = getPoint(i, userScores[comp.id] || 0)
        return <circle key={comp.id} cx={p.x} cy={p.y} r="4" fill="#22C55E" stroke="white" strokeWidth="1.5" />
      })}
      {/* Labels */}
      {components.map((comp, i) => {
        const p = getPoint(i, 3.4)
        return (
          <text key={comp.id} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-muted-foreground text-[9px] font-medium">
            {comp.short[lang as "en" | "tr"]}
          </text>
        )
      })}
      {/* Level labels */}
      {[1, 2, 3].map(level => (
        <text key={level} x={center + 8} y={center - (level / 3) * radius + 3}
          className="fill-muted-foreground text-[8px]">{level}</text>
      ))}
    </svg>
  )
}

export default function GlobalBenchmarkPage() {
  const { lang } = useLang()
  const [selectedCountry, setSelectedCountry] = useState<string>("SG")
  const [showSimulation, setShowSimulation] = useState(false)
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null)

  const globalAvg = useMemo(() => calculateGlobalAverage(), [])
  const turkey = COUNTRIES.find(c => c.code === "TR")!
  const compareCountry = COUNTRIES.find(c => c.code === selectedCountry)!

  const simulation = useMemo(() =>
    simulateImprovement(turkey.scores, selectedCountry), [selectedCountry])

  const crossLearning = useMemo(() => findCrossLearning(turkey.scores), [])

  const countriesWithStudies = COUNTRIES.filter(c => c.caseStudy)

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Global Health Benchmark", tr: "Küresel Sağlık Karnesi" },
      subtitle: { en: "Compare your health system performance with G20+ nations", tr: "Sağlık sistemi performansınızı G20+ ülkeleriyle karşılaştırın" },
      your_profile: { en: "Your Profile (Turkey)", tr: "Profiliniz (Türkiye)" },
      compare_with: { en: "Compare with", tr: "Karşılaştır" },
      radar_title: { en: "HVHS Component Comparison", tr: "HVHS Bileşen Karşılaştırması" },
      you: { en: "You (Turkey)", tr: "Siz (Türkiye)" },
      vs: { en: "vs", tr: "karşı" },
      global_avg: { en: "Global Average", tr: "Küresel Ortalama" },
      case_studies: { en: "World Best Practices", tr: "Dünyadan İyi Uygulamalar" },
      simulation_title: { en: "What-If Simulation", tr: "Ne-Olursa Simülasyonu" },
      simulation_desc: { en: "If you follow this country's model...", tr: "Bu ülkenin modelini takip ederseniz..." },
      current: { en: "Current", tr: "Mevcut" },
      projected: { en: "Projected", tr: "Öngörülen" },
      improvement: { en: "improvement", tr: "iyileşme" },
      in_timeframe: { en: "in 6 months", tr: "6 ayda" },
      recommendations: { en: "Key Recommendations", tr: "Temel Öneriler" },
      cross_learn: { en: "Cross-Learning Opportunities", tr: "Çapraz Öğrenme Fırsatları" },
      best_at: { en: "Best at", tr: "En iyi" },
      your_gap: { en: "Your gap", tr: "Farkınız" },
      legend_you: { en: "Your score", tr: "Sizin skor" },
      legend_compare: { en: "Compare country", tr: "Karşılaştırma ülkesi" },
      overall: { en: "Overall Score", tr: "Genel Skor" },
      simulate: { en: "Run Simulation", tr: "Simülasyon Çalıştır" },
    }
    return map[key]?.[lang] || key
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Country selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-sm text-muted-foreground shrink-0">{t("compare_with")}:</span>
          {COUNTRIES.filter(c => c.code !== "TR").map(country => (
            <Button key={country.code} size="sm"
              variant={selectedCountry === country.code ? "default" : "outline"}
              onClick={() => setSelectedCountry(country.code)} className="shrink-0 gap-1">
              <span>{country.flag}</span>{country.name[lang as "en" | "tr"]}
            </Button>
          ))}
        </div>

        {/* ═══ Radar Chart ═══ */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-2 text-center">{t("radar_title")}</h3>
          <p className="text-xs text-muted-foreground text-center mb-4">
            {turkey.flag} {t("you")} {t("vs")} {compareCountry.flag} {compareCountry.name[lang as "en" | "tr"]}
          </p>
          <RadarChart userScores={turkey.scores} compareScores={compareCountry.scores} compareLabel={compareCountry.name.en} lang={lang} />
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500" />{t("legend_you")}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-0.5 bg-indigo-500 border-dashed border border-indigo-500" style={{ width: 12 }} />{t("legend_compare")}
            </div>
          </div>
          {/* Score comparison */}
          <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{turkey.overallScore}</p>
              <p className="text-xs text-muted-foreground">{turkey.flag} Türkiye</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{compareCountry.overallScore}</p>
              <p className="text-xs text-muted-foreground">{compareCountry.flag} {compareCountry.name[lang as "en" | "tr"]}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{(Object.values(globalAvg).reduce((s, v) => s + v, 0) / 10).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">🌍 {t("global_avg")}</p>
            </div>
          </div>
        </Card>

        {/* ═══ Simulation ═══ */}
        <Card className="p-6 mb-6 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />{t("simulation_title")}
            </h3>
            <Button size="sm" variant="outline" onClick={() => setShowSimulation(!showSimulation)} className="gap-1">
              <Target className="w-3.5 h-3.5" />{t("simulate")}
            </Button>
          </div>
          {showSimulation && simulation && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">{t("simulation_desc")}</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center flex-1 p-3 rounded-lg bg-background">
                  <p className="text-xs text-muted-foreground">{t("current")}</p>
                  <p className="text-2xl font-bold">{simulation.currentScore}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary shrink-0" />
                <div className="text-center flex-1 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <p className="text-xs text-green-600">{t("projected")}</p>
                  <p className="text-2xl font-bold text-green-600">{simulation.projectedScore}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-sm shrink-0">
                  +{simulation.improvementPercent}% {t("in_timeframe")}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("recommendations")}</p>
                {simulation.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground py-1">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    {rec[lang as "en" | "tr"]}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ═══ Case Studies ═══ */}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />{t("case_studies")}
        </h3>
        <div className="space-y-3 mb-6">
          {countriesWithStudies.map(country => {
            const study = country.caseStudy!
            const isExpanded = expandedStudy === country.code
            return (
              <Card key={country.code} className="overflow-hidden">
                <button onClick={() => setExpandedStudy(isExpanded ? null : country.code)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors">
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{study.title[lang as "en" | "tr"]}</h4>
                    <p className="text-xs text-muted-foreground">{country.name[lang as "en" | "tr"]}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{country.overallScore}/3</Badge>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-2">{study.description[lang as "en" | "tr"]}</p>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                      <TrendingUp className="w-3 h-3 mr-1" />{study.impact[lang as "en" | "tr"]}
                    </Badge>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* ═══ Cross-Learning ═══ */}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" />{t("cross_learn")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {crossLearning.slice(0, 6).map(item => {
            const comp = HVHS_COMPONENTS.find(c => c.id === item.component)!
            return (
              <Card key={item.component} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{comp.label[lang as "en" | "tr"]}</span>
                  <Badge variant="outline" className="text-[10px]">-{item.gap.toFixed(1)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>{item.bestCountry.flag}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("best_at")}: {item.bestCountry.name[lang as "en" | "tr"]} ({item.bestCountry.scores[item.component as HVHSComponentId]}/3)
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
