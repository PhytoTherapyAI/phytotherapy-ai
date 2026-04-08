// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type ClinicalTest, type ClinicalTestThreshold } from "@/lib/clinical-tests-data"
import { RotateCcw, ChevronDown, ChevronUp, FileText, AlertTriangle, Heart, ExternalLink, Share2 } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"

interface ClinicalTestResultProps {
  test: ClinicalTest
  score: number
  threshold: ClinicalTestThreshold
  answers: number[]
  lang: string
  onRetake: () => void
}

export function ClinicalTestResult({ test, score, threshold, answers, lang, onRetake }: ClinicalTestResultProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)

  // Animate score counting up
  useEffect(() => {
    const duration = 1200
    const steps = 30
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [score])

  const percentage = (score / test.maxScore) * 100
  const circumference = 2 * Math.PI * 54 // radius 54
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const isHighRisk = threshold.severity === "severe" || threshold.severity === "dependence" || threshold.severity === "moderately_severe"

  // Save to localStorage
  useEffect(() => {
    try {
      const key = `clinical_test_history`
      const history = JSON.parse(localStorage.getItem(key) || "[]")
      history.unshift({
        testId: test.id,
        score,
        severity: threshold.severity,
        date: new Date().toISOString(),
      })
      localStorage.setItem(key, JSON.stringify(history.slice(0, 50)))
    } catch (e) { /* ignore */ }
  }, [test.id, score, threshold])

  // Get past results for this test
  const pastResults = (() => {
    try {
      const history = JSON.parse(localStorage.getItem("clinical_test_history") || "[]")
      return history.filter((h: any) => h.testId === test.id).slice(1, 4) // skip current, show last 3
    } catch { return [] }
  })()

  return (
    <div className="max-w-lg mx-auto">
      {/* Score Circle */}
      <div className="text-center mb-8">
        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" strokeLinecap="round"
              stroke={threshold.color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: threshold.color }}>{animatedScore}</span>
            <span className="text-xs text-muted-foreground">/ {test.maxScore}</span>
          </div>
        </div>

        {/* Severity Badge */}
        <Badge className="text-sm px-4 py-1.5 font-medium" style={{ backgroundColor: `${threshold.color}15`, color: threshold.color, borderColor: `${threshold.color}30` }}>
          {threshold.label[lang as "en" | "tr"]}
        </Badge>
      </div>

      {/* Message */}
      <Card className={`p-6 mb-6 ${isHighRisk ? "border-red-500/30 bg-red-500/5" : ""}`}>
        {isHighRisk && (
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-600 dark:text-red-400 text-sm">
              {tx("clinicalResult.professionalSupport", lang as Lang)}
            </span>
          </div>
        )}
        <p className="text-foreground leading-relaxed">
          {threshold.message[lang as "en" | "tr"]}
        </p>
      </Card>

      {/* Compassionate note */}
      <Card className="p-5 mb-6 border-primary/20 bg-primary/5">
        <div className="flex gap-3">
          <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            {tx("clinicalResult.compassionateNote", lang as Lang)}
          </p>
        </div>
      </Card>

      {/* Score Details Expandable */}
      <button onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors mb-4">
        <span className="text-sm font-medium">
          {tx("clinicalResult.whatDoesThisMean", lang as Lang)}
        </span>
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showDetails && (
        <Card className="p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-3">
            {tx("clinicalResult.scoreRanges", lang as Lang)} — {test.source}
          </p>
          <div className="space-y-2">
            {test.thresholds.map((t, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                t.severity === threshold.severity ? "bg-muted/50 font-medium" : ""
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span>{t.label[lang as "en" | "tr"]}</span>
                </div>
                <span className="text-muted-foreground text-xs">{t.min}–{t.max}</span>
              </div>
            ))}
          </div>

          {/* Answer breakdown */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">{tx("clinicalResult.yourAnswers", lang as Lang)}</p>
            <div className="flex gap-1 flex-wrap">
              {answers.map((a, i) => (
                <span key={i} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center font-medium"
                  style={{
                    backgroundColor: a === 0 ? "#22C55E20" : a === 1 ? "#EAB30820" : a === 2 ? "#F9731620" : "#DC262620",
                    color: a === 0 ? "#22C55E" : a === 1 ? "#EAB308" : a === 2 ? "#F97316" : "#DC2626",
                  }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Past results comparison */}
      {pastResults.length > 0 && (
        <Card className="p-4 mb-4">
          <h4 className="text-sm font-medium mb-2">
            {tx("clinicalResult.pastResults", lang as Lang)}
          </h4>
          <div className="space-y-1">
            {pastResults.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <span className="text-muted-foreground text-xs">
                  {new Date(r.date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}
                </span>
                <span className="font-medium">{r.score}/{test.maxScore}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={onRetake} variant="outline" className="w-full gap-2">
          <RotateCcw className="w-4 h-4" />
          {tx("clinicalResult.retake", lang as Lang)}
        </Button>

        {isHighRisk && (
          <a href={tx("clinicalResult.findProfessionalUrl", lang as Lang)}
            target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white">
              <ExternalLink className="w-4 h-4" />
              {tx("clinicalResult.findProfessional", lang as Lang)}
            </Button>
          </a>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground text-center mt-6">
        {test.disclaimer[lang as "en" | "tr"]}
      </p>
    </div>
  )
}
