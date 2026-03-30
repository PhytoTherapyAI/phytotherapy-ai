// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { getTestById, type ClinicalTestThreshold } from "@/lib/clinical-tests-data"
import { ClinicalTestRunner } from "@/components/clinical/ClinicalTestRunner"
import { ClinicalTestResult } from "@/components/clinical/ClinicalTestResult"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Clock, HelpCircle, Shield, ChevronLeft } from "lucide-react"

type Phase = "intro" | "testing" | "result"

export default function ClinicalTestPage() {
  const params = useParams()
  const { lang } = useLang()
  const testId = params.testId as string
  const test = getTestById(testId)

  const [phase, setPhase] = useState<Phase>("intro")
  const [score, setScore] = useState(0)
  const [threshold, setThreshold] = useState<ClinicalTestThreshold | null>(null)
  const [answers, setAnswers] = useState<number[]>([])

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">{tx("clinicalTests.notFound", lang)}</h2>
          <p className="text-sm text-muted-foreground mb-4">{tx("clinicalTests.notFoundDesc", lang)}</p>
          <Link href="/clinical-tests">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />{tx("clinicalTests.backToTests", lang)}
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleComplete = (finalScore: number, finalThreshold: ClinicalTestThreshold, finalAnswers: number[]) => {
    setScore(finalScore)
    setThreshold(finalThreshold)
    setAnswers(finalAnswers)
    setPhase("result")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleRetake = () => {
    setPhase("intro")
    setScore(0)
    setThreshold(null)
    setAnswers([])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        {/* Back link */}
        <Link href="/clinical-tests" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {tx("clinicalTests.allTests", lang)}
        </Link>

        {/* ── INTRO PHASE ── */}
        {phase === "intro" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ backgroundColor: `${test.color}15` }}>
              <span className="text-3xl" style={{ color: test.color }}>
                {test.icon === "CloudRain" ? "🌧" : test.icon === "Wind" ? "💨" : test.icon === "Zap" ? "⚡" : test.icon === "Gauge" ? "🎯" : test.icon === "Moon" ? "🌙" : test.icon === "Smile" ? "😊" : test.icon === "Wine" ? "🍷" : "📋"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {test.title[lang as "en" | "tr"]}
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {test.description[lang as "en" | "tr"]}
            </p>

            {/* Test info cards */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{test.estimatedMinutes} {tx("clinicalTests.minutes", lang)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HelpCircle className="w-4 h-4" />
                <span>{test.questionCount} {tx("clinicalTests.questions", lang)}</span>
              </div>
            </div>

            {/* How it works */}
            <Card className="p-5 mb-6 text-left max-w-md mx-auto">
              <h3 className="font-medium text-sm mb-3">{tx("clinicalTests.howItWorks", lang)}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0">1</span>
                  {tx("clinicalTests.step1", lang)}
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0">2</span>
                  {tx("clinicalTests.step2", lang)}
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0">3</span>
                  {tx("clinicalTests.step3", lang)}
                </li>
              </ul>
            </Card>

            {/* Disclaimer */}
            <Card className="p-4 mb-8 border-amber-500/20 bg-amber-500/5 max-w-md mx-auto">
              <div className="flex gap-2">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{test.disclaimer[lang as "en" | "tr"]}</p>
              </div>
            </Card>

            <Button size="lg" onClick={() => setPhase("testing")}
              className="px-8 text-white" style={{ backgroundColor: test.color }}>
              {tx("clinicalTests.startTest", lang)}
            </Button>

            <p className="text-[11px] text-muted-foreground mt-3">{test.source}</p>
          </div>
        )}

        {/* ── TESTING PHASE ── */}
        {phase === "testing" && (
          <ClinicalTestRunner test={test} lang={lang} onComplete={handleComplete} />
        )}

        {/* ── RESULT PHASE ── */}
        {phase === "result" && threshold && (
          <ClinicalTestResult
            test={test}
            score={score}
            threshold={threshold}
            answers={answers}
            lang={lang}
            onRetake={handleRetake}
          />
        )}
      </div>
    </div>
  )
}
