// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Loader2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
} from "lucide-react"

interface SurveyQuestion {
  id: string
  type: "slider" | "choice"
  question: string
  min?: number
  max?: number
  step?: number
  anchors?: { min: string; max: string }
  options?: Array<{ value: number; label: string }>
  category: "proms" | "prems"
  domain: string
}

interface PendingSurvey {
  supplementId: string
  supplementName: string
  timepoint: string
  timepointLabel: string
  questions: SurveyQuestion[]
  daysSinceStart: number
}

interface Props {
  survey: PendingSurvey
  onComplete: (improvement: { percentImproved?: number; direction?: string; [key: string]: unknown } | null) => void
  onDismiss: () => void
}

export function PromsSurvey({ survey, onComplete, onDismiss }: Props) {
  const { user } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [sliderValue, setSliderValue] = useState<number | null>(null)

  const totalQuestions = survey.questions.length
  const currentQuestion = survey.questions[currentIndex]
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentIndex === totalQuestions - 1

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    if (!isLastQuestion) {
      // Auto-advance for choice questions
      if (currentQuestion.type === "choice") {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1)
          setSliderValue(null)
        }, 400)
      }
    }
  }

  const handleSliderConfirm = () => {
    if (sliderValue !== null) {
      handleAnswer(sliderValue)
      if (!isLastQuestion) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1)
          setSliderValue(null)
        }, 200)
      }
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!user) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/proms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          supplementId: survey.supplementId,
          supplementName: survey.supplementName,
          timepoint: survey.timepoint,
          answers,
        }),
      })

      const data = await res.json()
      onComplete(data.improvement)
    } catch (err) {
      console.error("[PROMs] Submit error:", err)
      onComplete(null)
    } finally {
      setSubmitting(false)
    }
  }, [user, survey, answers, onComplete])

  if (!currentQuestion) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">
              {survey.supplementName}
            </p>
            <h2 className="text-sm text-muted-foreground">
              {survey.timepointLabel}
            </h2>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        {/* Question Card — Typeform style (one question at a time) */}
        <div className="min-h-[280px] flex flex-col justify-center animate-in slide-in-from-right-4 duration-300" key={currentQuestion.id}>

          {/* Category badge */}
          <span className={`mb-4 inline-flex self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
            currentQuestion.category === "proms"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
          }`}>
            {currentQuestion.category === "proms"
              ? tx("proms.healthStatus", lang)
              : tx("proms.experience", lang)}
          </span>

          {/* Question text */}
          <h3 className="text-xl md:text-2xl font-bold leading-snug mb-8">
            {currentQuestion.question}
          </h3>

          {/* Answer input */}
          {currentQuestion.type === "slider" && (
            <div className="space-y-4">
              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min={currentQuestion.min || 0}
                  max={currentQuestion.max || 10}
                  step={currentQuestion.step || 1}
                  value={sliderValue ?? answers[currentQuestion.id] ?? Math.round(((currentQuestion.max || 10) - (currentQuestion.min || 0)) / 2)}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-red-300 via-amber-300 to-green-300 dark:from-red-800 dark:via-amber-800 dark:to-green-800
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab
                    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab"
                />
              </div>
              {/* Anchors + value */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{currentQuestion.anchors?.min}</span>
                <span className="text-2xl font-black text-primary">
                  {sliderValue ?? answers[currentQuestion.id] ?? "-"}
                </span>
                <span>{currentQuestion.anchors?.max}</span>
              </div>
              {/* Confirm button for slider */}
              <button
                onClick={handleSliderConfirm}
                disabled={sliderValue === null && answers[currentQuestion.id] === undefined}
                className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLastQuestion
                  ? tx("proms.complete", lang)
                  : tx("proms.continue", lang)}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {currentQuestion.type === "choice" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                      {option.label}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentIndex((prev) => Math.max(0, prev - 1))
              setSliderValue(null)
            }}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {tx("proms.back", lang)}
          </button>

          {isLastQuestion && answers[currentQuestion.id] !== undefined && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {tx("proms.submit", lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══ Outcome Comparison Card ═══

interface ComparisonData {
  supplementName: string
  baselineDate: string
  latestDate: string
  improvementScore: number
  daysBetween: number
  changes: Record<string, { before: number; after: number; change: number; improved: boolean }>
}

export function OutcomeComparisonCard({ data }: { data: ComparisonData }) {
  const { lang } = useLang()
  const isTr = lang === "tr"

  const domainLabels: Record<string, { tr: string; en: string }> = {
    pain_vas: { tr: "Ağrı Seviyesi", en: "Pain Level" },
    energy_level: { tr: "Enerji", en: "Energy" },
    sleep_quality: { tr: "Uyku Kalitesi", en: "Sleep Quality" },
    mood_wellbeing: { tr: "Ruh Hali", en: "Mood" },
    daily_activity: { tr: "Günlük Aktivite", en: "Daily Activity" },
    overall_health: { tr: "Genel Sağlık", en: "Overall Health" },
    anxiety_level: { tr: "Anksiyete", en: "Anxiety" },
    digestive_comfort: { tr: "Sindirim", en: "Digestion" },
  }

  const scoreColor = data.improvementScore >= 70
    ? "text-green-600 dark:text-green-400"
    : data.improvementScore >= 50
    ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400"

  const scoreBg = data.improvementScore >= 70
    ? "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10"
    : data.improvementScore >= 50
    ? "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/10"
    : "from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/10"

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${scoreBg} p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold">
            {tx("proms.improvementReport", lang)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {data.supplementName} — {data.daysBetween} {tx("proms.days", lang)}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-black ${scoreColor}`}>
            {data.improvementScore}
          </div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase">
            {tx("proms.improvementScore", lang)}
          </div>
        </div>
      </div>

      {/* Domain changes */}
      <div className="space-y-2">
        {Object.entries(data.changes).map(([domain, change]) => {
          const label = domainLabels[domain];
          if (!label) return null;
          const isInverted = domain === "pain_vas" || domain === "anxiety_level";

          return (
            <div key={domain} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-24 truncate">
                {isTr ? label.tr : label.en}
              </span>
              {/* Before bar */}
              <div className="flex-1 flex items-center gap-1">
                <div className="h-2 rounded-full bg-muted/50 flex-1 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-muted-foreground/30"
                    style={{ width: `${(change.before / 10) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-4 text-right">{change.before}</span>
              </div>
              {/* Arrow */}
              {change.improved ? (
                <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
              ) : change.change === 0 ? (
                <Minus className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 flex-shrink-0" />
              )}
              {/* After bar */}
              <div className="flex-1 flex items-center gap-1">
                <div className="h-2 rounded-full bg-muted/50 flex-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${change.improved ? "bg-green-500" : change.change === 0 ? "bg-muted-foreground/30" : "bg-red-400"}`}
                    style={{ width: `${(change.after / 10) * 100}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold w-4 text-right ${change.improved ? "text-green-600" : ""}`}>
                  {change.after}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-4 rounded bg-muted-foreground/30" />
          {tx("proms.baseline", lang)}
        </span>
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-4 rounded bg-green-500" />
          {tx("proms.current", lang)}
        </span>
      </div>
    </div>
  )
}
