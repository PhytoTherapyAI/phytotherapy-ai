"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp, TrendingDown, Clock, Banknote, Hospital, Brain,
  Moon, Target, MessageCircle, Pill, Heart, Shield, ChevronDown,
  ChevronUp, Share2, Sparkles, ArrowUpRight, ArrowDownRight, Minus,
  Flame, Star, Award,
} from "lucide-react"

// ── Mock Data Generator (would come from API in production) ──
interface MonthlyROI {
  month: string
  year: number
  // Financial & Time Savings
  avoidedVisits: number
  savedHours: number
  savedMoney: number
  currency: string
  // Clinical Progress
  sleepEfficiency: { current: number; previous: number; change: number }
  painReduction: { current: number; previous: number; change: number }
  medicationAdherence: { current: number; previous: number; change: number }
  moodScore: { current: number; previous: number; change: number }
  // Platform Usage
  aiInteractions: number
  toolsUsed: number
  goalsAchieved: number
  totalGoals: number
  streakDays: number
  // Comparison
  healthScoreCurrent: number
  healthScorePrevious: number
}

function generateMockData(lang: string): MonthlyROI {
  const months = lang === "tr"
    ? ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const now = new Date()
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1

  return {
    month: months[prevMonth],
    year: now.getFullYear(),
    avoidedVisits: 3,
    savedHours: 12,
    savedMoney: 2400,
    currency: "₺",
    sleepEfficiency: { current: 82, previous: 67, change: 22 },
    painReduction: { current: 3, previous: 5, change: -40 },
    medicationAdherence: { current: 94, previous: 78, change: 21 },
    moodScore: { current: 4.2, previous: 3.5, change: 20 },
    aiInteractions: 14,
    toolsUsed: 8,
    goalsAchieved: 6,
    totalGoals: 7,
    streakDays: 18,
    healthScoreCurrent: 82,
    healthScorePrevious: 71,
  }
}

// ── Component ──
interface MonthlyROICardProps {
  userId?: string
  lang?: string
}

export function MonthlyROICard({ userId, lang = "en" }: MonthlyROICardProps) {
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(false)
  const data = useMemo(() => generateMockData(lang), [lang])

  // Show only near month end (or always in dev)
  useEffect(() => {
    const day = new Date().getDate()
    setVisible(day >= 25 || process.env.NODE_ENV === "development")
  }, [])

  if (!visible) return null

  const healthScoreChange = data.healthScoreCurrent - data.healthScorePrevious
  const goalPercent = Math.round((data.goalsAchieved / data.totalGoals) * 100)

  const TrendArrow = ({ value }: { value: number }) => {
    if (value > 0) return <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
    if (value < 0) return <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />
  }

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Your Monthly Impact", tr: "Aylık Etki Raporunuz" },
      subtitle: { en: `${data.month} ${data.year} Summary`, tr: `${data.month} ${data.year} Özeti` },
      savings: { en: "Savings & Time", tr: "Tasarruf & Zaman" },
      clinical: { en: "Clinical Progress", tr: "Klinik İlerleme" },
      usage: { en: "Platform Usage", tr: "Platform Kullanımı" },
      avoided: { en: "unnecessary visits avoided", tr: "gereksiz hastane ziyaretinden kaçınıldı" },
      hours_saved: { en: "hours saved", tr: "saat tasarruf edildi" },
      estimated_savings: { en: "estimated savings", tr: "tahmini finansal tasarruf" },
      sleep: { en: "Sleep Efficiency", tr: "Uyku Verimliliği" },
      pain: { en: "Pain Reduction", tr: "Ağrı Azalması" },
      meds: { en: "Medication Adherence", tr: "İlaç Uyumu" },
      mood: { en: "Mood Score", tr: "Ruh Hali Skoru" },
      interactions: { en: "AI interactions", tr: "AI etkileşimi" },
      tools: { en: "tools used", tr: "araç kullanıldı" },
      goals: { en: "goals achieved", tr: "hedefe ulaşıldı" },
      streak: { en: "day streak", tr: "günlük seri" },
      health_score: { en: "Health Score", tr: "Sağlık Skoru" },
      vs_last: { en: "vs last month", tr: "geçen aya göre" },
      share: { en: "Share", tr: "Paylaş" },
      details: { en: "See Details", tr: "Detayları Gör" },
      hide: { en: "Hide", tr: "Gizle" },
      congrats: { en: "Great month!", tr: "Harika bir ay!" },
    }
    return map[key]?.[lang] || key
  }

  // Mini sparkline bars (last 4 weeks simulated)
  const SparkBars = ({ values, color }: { values: number[]; color: string }) => (
    <div className="flex items-end gap-[3px] h-6">
      {values.map((v, i) => (
        <div key={i} className="w-1.5 rounded-full transition-all" style={{ height: `${(v / Math.max(...values)) * 24}px`, backgroundColor: i === values.length - 1 ? color : `${color}40` }} />
      ))}
    </div>
  )

  return (
    <Card className="overflow-hidden border-primary/20">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-emerald-500/10 p-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">{t("title")}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
            <Sparkles className="w-3 h-3" />{t("congrats")}
          </Badge>
        </div>

        {/* Health Score Ring */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4" strokeLinecap="round"
                stroke={data.healthScoreCurrent >= 80 ? "#22C55E" : data.healthScoreCurrent >= 60 ? "#F59E0B" : "#EF4444"}
                strokeDasharray={`${(data.healthScoreCurrent / 100) * 176} 176`} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{data.healthScoreCurrent}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{t("health_score")}</p>
            <div className="flex items-center gap-1 text-xs">
              <TrendArrow value={healthScoreChange} />
              <span className={healthScoreChange >= 0 ? "text-green-600" : "text-red-500"}>
                {healthScoreChange > 0 ? "+" : ""}{healthScoreChange}
              </span>
              <span className="text-muted-foreground">{t("vs_last")}</span>
            </div>
          </div>
          <div className="ml-auto">
            <SparkBars values={[65, 71, 76, data.healthScoreCurrent]} color="#22C55E" />
          </div>
        </div>
      </div>

      {/* ═══ Savings Row ═══ */}
      <div className="p-5 border-b border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("savings")}</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
            <Hospital className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-emerald-600">{data.avoidedVisits}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t("avoided")}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-600">{data.savedHours}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t("hours_saved")}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
            <Banknote className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-amber-600">{data.currency}{data.savedMoney.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t("estimated_savings")}</p>
          </div>
        </div>
      </div>

      {/* ═══ Expandable Clinical + Usage ═══ */}
      {expanded && (
        <>
          {/* Clinical Progress */}
          <div className="p-5 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("clinical")}</p>
            <div className="space-y-3">
              {[
                { label: t("sleep"), icon: Moon, current: `${data.sleepEfficiency.current}%`, change: data.sleepEfficiency.change, color: "#818CF8", bars: [55, 62, 67, data.sleepEfficiency.current] },
                { label: t("pain"), icon: Flame, current: `${data.painReduction.current}/10`, change: data.painReduction.change, color: "#EF4444", bars: [7, 6, 5, data.painReduction.current], invertTrend: true },
                { label: t("meds"), icon: Pill, current: `${data.medicationAdherence.current}%`, change: data.medicationAdherence.change, color: "#22C55E", bars: [70, 78, 85, data.medicationAdherence.current] },
                { label: t("mood"), icon: Heart, current: `${data.moodScore.current}/5`, change: data.moodScore.change, color: "#EC4899", bars: [3.0, 3.2, 3.5, data.moodScore.current] },
              ].map(metric => (
                <div key={metric.label} className="flex items-center gap-3">
                  <metric.icon className="w-4 h-4 shrink-0" style={{ color: metric.color }} />
                  <span className="text-sm flex-1">{metric.label}</span>
                  <SparkBars values={metric.bars} color={metric.color} />
                  <span className="text-sm font-bold w-12 text-right">{metric.current}</span>
                  <div className="flex items-center gap-0.5 w-14 justify-end">
                    <TrendArrow value={metric.invertTrend ? -metric.change : metric.change} />
                    <span className={`text-xs ${(metric.invertTrend ? -metric.change : metric.change) >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Usage */}
          <div className="p-5 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("usage")}</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: data.aiInteractions, label: t("interactions"), icon: MessageCircle, color: "#6366F1" },
                { value: data.toolsUsed, label: t("tools"), icon: Shield, color: "#0EA5E9" },
                { value: `${data.goalsAchieved}/${data.totalGoals}`, label: t("goals"), icon: Target, color: "#22C55E" },
                { value: data.streakDays, label: t("streak"), icon: Flame, color: "#F97316" },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Goal progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{t("goals")}</span>
                <span>{goalPercent}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${goalPercent}%` }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between p-3">
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? t("hide") : t("details")}
        </button>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
          <Share2 className="w-3 h-3" />{t("share")}
        </Button>
      </div>
    </Card>
  )
}
