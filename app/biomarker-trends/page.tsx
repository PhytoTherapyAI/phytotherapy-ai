// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx, txObj } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Activity, Calendar, Filter, ArrowRight } from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"

interface BiomarkerEntry {
  marker: string
  value: number
  unit: string
  date: string
  status: "normal" | "high" | "low" | "critical"
}

interface BiomarkerGroup {
  category: string
  categoryTr: string
  markers: string[]
}

const BIOMARKER_GROUPS: BiomarkerGroup[] = [
  { category: "Metabolic", categoryTr: "Metabolik", markers: ["HbA1c", "Fasting Glucose", "Insulin", "HOMA-IR"] },
  { category: "Lipid Panel", categoryTr: "Lipit Paneli", markers: ["Total Cholesterol", "LDL", "HDL", "Triglycerides"] },
  { category: "Vitamins & Minerals", categoryTr: "Vitamin & Mineral", markers: ["Vitamin D", "Vitamin B12", "Ferritin", "Iron", "Folate", "Zinc", "Magnesium"] },
  { category: "Thyroid", categoryTr: "Tiroid", markers: ["TSH", "Free T3", "Free T4"] },
  { category: "Liver", categoryTr: "Karaciğer", markers: ["ALT", "AST", "GGT", "Bilirubin"] },
  { category: "Kidney", categoryTr: "Böbrek", markers: ["Creatinine", "BUN", "eGFR"] },
  { category: "Inflammation", categoryTr: "İnflamasyon", markers: ["CRP", "ESR", "Ferritin"] },
  { category: "Blood Count", categoryTr: "Kan Sayımı", markers: ["Hemoglobin", "WBC", "Platelets"] },
]

const STATUS_COLORS = {
  normal: "bg-green-500/10 text-green-600 border-green-500/30",
  high: "bg-red-500/10 text-red-600 border-red-500/30",
  low: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  critical: "bg-red-600/10 text-red-700 border-red-600/30",
}

export default function BiomarkerTrendsPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<BiomarkerEntry[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<"6m" | "1y" | "3y" | "all">("1y")

  useEffect(() => {
    loadBiomarkers()
  }, [user])

  const loadBiomarkers = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("blood_tests")
        .select("test_data, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (data) {
        const allEntries: BiomarkerEntry[] = []
        data.forEach((test: any) => {
          let results: any = null
          try {
            results = typeof test.test_data === "string" ? JSON.parse(test.test_data) : test.test_data
          } catch { /* malformed JSON — skip */ }
          if (results && Array.isArray(results)) {
            results.forEach((r: any) => {
              allEntries.push({
                marker: r.name || r.marker,
                value: parseFloat(r.value),
                unit: r.unit || "",
                date: test.created_at,
                status: r.status || "normal",
              })
            })
          }
        })
        setEntries(allEntries)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const getMarkerHistory = (markerName: string) => {
    return entries
      .filter(e => e.marker.toLowerCase().includes(markerName.toLowerCase()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getTrend = (history: BiomarkerEntry[]) => {
    if (history.length < 2) return "stable"
    const last = history[history.length - 1].value
    const prev = history[history.length - 2].value
    const change = ((last - prev) / prev) * 100
    if (change > 5) return "up"
    if (change < -5) return "down"
    return "stable"
  }

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-red-500" />
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-green-500" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const filteredGroups = selectedCategory === "all"
    ? BIOMARKER_GROUPS
    : BIOMARKER_GROUPS.filter(g => g.category === selectedCategory)

  // Local t() removed — using tx() from translations.ts

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tx("biomarkerTrends.title", lang)}</h1>
          <p className="text-muted-foreground mt-1">{tx("biomarkerTrends.subtitle", lang)}</p>
          {entries.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">{entries.length} {tx("biomarkerTrends.testResults", lang)}</p>
          )}
        </div>

        {/* Time range filter */}
        <div className="flex gap-2 mb-4 justify-center">
          {(["6m", "1y", "3y", "all"] as const).map(range => (
            <Button key={range} size="sm" variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range)}>
              {range === "all" ? tx("common.all", lang) : range}
            </Button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}>
            {tx("biomarkerTrends.allCategories", lang)}
          </Button>
          {BIOMARKER_GROUPS.map(g => (
            <Button key={g.category} size="sm" variant={selectedCategory === g.category ? "default" : "outline"}
              onClick={() => setSelectedCategory(g.category)} className="whitespace-nowrap">
              {txObj({ en: g.category, tr: g.categoryTr }, lang)}
            </Button>
          ))}
        </div>

        {entries.length === 0 ? (
          <Card className="p-8 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{tx("biomarkerTrends.noData", lang)}</p>
            <Button className="mt-4" onClick={() => window.location.href = "/blood-test"}>
              <ArrowRight className="w-4 h-4 mr-2" />
              {tx("biomarkerTrends.uploadBloodTest", lang)}
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredGroups.map(group => {
              const groupMarkers = group.markers.map(m => ({
                name: m,
                history: getMarkerHistory(m),
              })).filter(m => m.history.length > 0)

              if (groupMarkers.length === 0) return null

              return (
                <Card key={group.category} className="p-5">
                  <h3 className="font-semibold text-foreground mb-4">
                    {txObj({ en: group.category, tr: group.categoryTr }, lang)}
                  </h3>
                  <div className="space-y-3">
                    {groupMarkers.map(({ name, history }) => {
                      const latest = history[history.length - 1]
                      const prev = history.length > 1 ? history[history.length - 2] : null
                      const trend = getTrend(history)
                      const change = prev ? ((latest.value - prev.value) / prev.value * 100).toFixed(1) : null

                      return (
                        <div key={name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(latest.date).toLocaleDateString(tx("common.locale", lang))}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-semibold text-foreground">{latest.value}</span>
                              <span className="text-xs text-muted-foreground ml-1">{latest.unit}</span>
                            </div>
                            <Badge className={STATUS_COLORS[latest.status]}>
                              {latest.status === "normal" ? "✓" : latest.status === "high" ? "↑" : latest.status === "low" ? "↓" : "⚠"}
                            </Badge>
                            <div className="flex items-center gap-1 min-w-[60px] justify-end">
                              <TrendIcon trend={trend} />
                              {change && (
                                <span className={`text-xs ${parseFloat(change) > 0 ? "text-red-500" : "text-green-500"}`}>
                                  {parseFloat(change) > 0 ? "+" : ""}{change}%
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Mini sparkline */}
                          {history.length > 1 && (
                            <div className="ml-3 flex items-end gap-[2px] h-6">
                              {history.slice(-8).map((h, i) => {
                                const max = Math.max(...history.slice(-8).map(x => x.value))
                                const min = Math.min(...history.slice(-8).map(x => x.value))
                                const range = max - min || 1
                                const height = ((h.value - min) / range) * 24 + 4
                                return (
                                  <div key={i} className="w-1 rounded-full bg-primary/60" style={{ height: `${height}px` }} />
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
