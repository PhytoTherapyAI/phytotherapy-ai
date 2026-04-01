// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Brain, TrendingDown, TrendingUp, Minus, Lightbulb } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

interface SymptomPatternCardProps {
  userId: string
  lang: Lang
  isPremium?: boolean
}

interface PatternInsight {
  type: "improvement" | "decline" | "stable"
  area: string
  message: string
}

export function SymptomPatternCard({ userId, lang, isPremium = false }: SymptomPatternCardProps) {
  const [insights, setInsights] = useState<PatternInsight[]>([])
  const [loading, setLoading] = useState(true)

  const analyze = useCallback(async () => {
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      // Get last 14 days of check-ins
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const { data: checkIns } = await supabase
        .from("daily_check_ins")
        .select("check_date, energy_level, sleep_quality, mood, bloating")
        .eq("user_id", userId)
        .gte("check_date", twoWeeksAgo.toISOString().split("T")[0])
        .order("check_date", { ascending: true })

      if (!checkIns || checkIns.length < 3) {
        setInsights([])
        setLoading(false)
        return
      }

      // Split into first half and second half
      const mid = Math.floor(checkIns.length / 2)
      const firstHalf = checkIns.slice(0, mid)
      const secondHalf = checkIns.slice(mid)

      const patterns: PatternInsight[] = []
      const fields = [
        { key: "energy_level", area: tx("symptomPattern.energy", lang) },
        { key: "sleep_quality", area: tx("symptomPattern.sleep", lang) },
        { key: "mood", area: tx("symptomPattern.mood", lang) },
        { key: "bloating", area: tx("symptomPattern.digestion", lang) },
      ] as const

      for (const field of fields) {
        const firstAvg = avg(firstHalf.map(c => c[field.key]).filter((v): v is number => v !== null))
        const secondAvg = avg(secondHalf.map(c => c[field.key]).filter((v): v is number => v !== null))

        if (firstAvg === 0 || secondAvg === 0) continue

        const diff = secondAvg - firstAvg

        if (diff >= 0.5) {
          patterns.push({
            type: "improvement",
            area: field.area,
            message: lang === "tr"
              ? `${field.area} seviyeniz son günlerde iyileşiyor`
              : `Your ${field.area.toLowerCase()} has been improving recently`,
          })
        } else if (diff <= -0.5) {
          patterns.push({
            type: "decline",
            area: field.area,
            message: lang === "tr"
              ? `${field.area} seviyenizde düşüş gözlemlendi`
              : `Your ${field.area.toLowerCase()} has been declining`,
          })
        }
      }

      // Check for correlation between sleep and energy
      const sleepData = checkIns.map(c => c.sleep_quality).filter((v): v is number => v !== null)
      const energyData = checkIns.map(c => c.energy_level).filter((v): v is number => v !== null)
      if (sleepData.length >= 3 && energyData.length >= 3) {
        const sleepAvg = avg(sleepData)
        const energyAvg = avg(energyData)
        if (sleepAvg <= 2.5 && energyAvg <= 2.5) {
          patterns.push({
            type: "decline",
            area: tx("symptomPattern.sleepEnergy", lang),
            message: lang === "tr"
              ? "Düşük uyku kalitesi enerji seviyenizi etkiliyor olabilir"
              : "Poor sleep quality may be affecting your energy levels",
          })
        }
      }

      setInsights(patterns)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [userId, lang])

  useEffect(() => {
    if (userId && isPremium) analyze()
    else setLoading(false)
  }, [userId, isPremium, analyze])

  if (!isPremium) {
    return (
      <Card className="relative overflow-hidden opacity-75">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">PREMIUM</Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-purple-500" />
            {tx("pattern.title", lang)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 rounded-lg bg-muted/30" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4 text-purple-500" />
          {tx("pattern.title", lang)}
          <Badge variant="secondary" className="ml-auto text-[10px]">PREMIUM</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{tx("pattern.subtitle", lang)}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="h-16 animate-pulse rounded-lg bg-muted/30" />
        ) : insights.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-muted-foreground">{tx("pattern.noData", lang)}</p>
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
              {insight.type === "improvement" ? (
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              ) : insight.type === "decline" ? (
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              ) : (
                <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div>
                <span className="text-xs font-medium">{insight.area}</span>
                <p className="text-xs text-muted-foreground">{insight.message}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}
