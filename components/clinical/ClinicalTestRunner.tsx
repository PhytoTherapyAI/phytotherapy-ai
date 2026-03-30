"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { type ClinicalTest, type ClinicalTestThreshold } from "@/lib/clinical-tests-data"
import { ChevronLeft, ChevronRight, Phone, AlertTriangle, ShieldAlert } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"

interface ClinicalTestRunnerProps {
  test: ClinicalTest
  lang: string
  onComplete: (score: number, threshold: ClinicalTestThreshold, answers: number[]) => void
}

export function ClinicalTestRunner({ test, lang, onComplete }: ClinicalTestRunnerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(test.questions.length).fill(null))
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCrisisOverlay, setShowCrisisOverlay] = useState(false)
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const question = test.questions[currentStep]
  const progress = ((currentStep + (answers[currentStep] !== null ? 1 : 0)) / test.questions.length) * 100
  const allAnswered = answers.every(a => a !== null)

  // Keyboard support: 1-5 keys to select option
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showCrisisOverlay || isAnimating) return
      const num = parseInt(e.key)
      if (num >= 1 && num <= question.options.length) {
        selectOption(question.options[num - 1].value)
      }
      if (e.key === "ArrowLeft" && currentStep > 0) goBack()
      if (e.key === "Enter" && answers[currentStep] !== null && currentStep < test.questions.length - 1) goForward()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [currentStep, question, isAnimating, showCrisisOverlay])

  // Cleanup auto-advance timeout
  useEffect(() => {
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current) }
  }, [])

  const selectOption = useCallback((value: number) => {
    if (isAnimating) return

    const newAnswers = [...answers]
    newAnswers[currentStep] = value
    setAnswers(newAnswers)

    // Crisis detection
    if (test.crisisQuestionIds?.includes(question.id) && value > 0) {
      setShowCrisisOverlay(true)
      return
    }

    // Auto-advance after 500ms
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current)
    autoAdvanceRef.current = setTimeout(() => {
      if (currentStep < test.questions.length - 1) {
        goForward()
      } else {
        // Last question — calculate and submit
        const totalScore = newAnswers.reduce((sum: number, a) => sum + (a || 0), 0)
        const threshold = test.thresholds.find(t => totalScore >= t.min && totalScore <= t.max) || test.thresholds[test.thresholds.length - 1]
        onComplete(totalScore, threshold, newAnswers as number[])
      }
    }, 500)
  }, [answers, currentStep, isAnimating, question, test, onComplete])

  const goForward = useCallback(() => {
    if (currentStep >= test.questions.length - 1 || isAnimating) return
    setDirection("forward")
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep(s => s + 1)
      setIsAnimating(false)
    }, 250)
  }, [currentStep, test.questions.length, isAnimating])

  const goBack = useCallback(() => {
    if (currentStep <= 0 || isAnimating) return
    setDirection("backward")
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep(s => s - 1)
      setIsAnimating(false)
    }, 250)
  }, [currentStep, isAnimating])

  const handleSubmit = () => {
    if (!allAnswered) return
    const totalScore = answers.reduce((sum, a) => sum + (a || 0), 0)
    const threshold = test.thresholds.find(t => totalScore >= t.min && totalScore <= t.max) || test.thresholds[test.thresholds.length - 1]
    onComplete(totalScore, threshold, answers as number[])
  }

  // Crisis overlay
  if (showCrisisOverlay) {
    return (
      <div className="fixed inset-0 z-[200] bg-red-600 flex items-center justify-center p-6">
        <div className="max-w-md text-center text-white">
          <ShieldAlert className="w-16 h-16 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold mb-4">
            {tx("clinicalRunner.crisisTitle", lang as Lang)}
          </h2>
          <p className="text-lg mb-6 text-white/90">
            {tx("clinicalRunner.crisisMessage", lang as Lang)}
          </p>
          <div className="space-y-3 mb-8">
            <a href="tel:182" className="flex items-center justify-center gap-3 bg-white text-red-600 font-bold py-4 px-6 rounded-xl text-lg">
              <Phone className="w-6 h-6" /> 182 — {tx("clinicalRunner.turkeyLine", lang as Lang)}
            </a>
            <a href="tel:112" className="flex items-center justify-center gap-3 bg-white/20 text-white font-bold py-3 px-6 rounded-xl">
              <Phone className="w-5 h-5" /> 112 — {tx("clinicalRunner.emergency", lang as Lang)}
            </a>
            <a href="tel:988" className="flex items-center justify-center gap-3 bg-white/20 text-white font-bold py-3 px-6 rounded-xl">
              <Phone className="w-5 h-5" /> 988 — Suicide & Crisis Lifeline (US)
            </a>
          </div>
          <button onClick={() => setShowCrisisOverlay(false)}
            className="text-white/60 underline text-sm hover:text-white/80">
            {tx("clinicalRunner.endTest", lang as Lang)}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-[70vh] flex flex-col">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">
            {currentStep + 1} / {test.questions.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: test.color,
            }}
          />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className={`w-full transition-all duration-250 ease-out ${
            isAnimating
              ? direction === "forward"
                ? "opacity-0 -translate-x-8"
                : "opacity-0 translate-x-8"
              : "opacity-100 translate-x-0"
          }`}
        >
          {/* Question number */}
          <div className="text-center mb-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${test.color}15`, color: test.color }}>
              {tx("clinicalRunner.question", lang as Lang)} {currentStep + 1}
            </span>
          </div>

          {/* Question text */}
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center mb-8 max-w-lg mx-auto leading-relaxed">
            {question.text[lang as "en" | "tr"]}
          </h2>

          {/* Option cards */}
          <div className="space-y-3 max-w-md mx-auto">
            {question.options.map((option, idx) => {
              const isSelected = answers[currentStep] === option.value
              return (
                <button
                  key={idx}
                  onClick={() => selectOption(option.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:bg-muted/30 hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Keyboard shortcut hint */}
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`text-base ${isSelected ? "font-medium text-foreground" : "text-foreground/80"}`}>
                      {option.label[lang as "en" | "tr"]}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" onClick={goBack} disabled={currentStep === 0 || isAnimating}
          className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          {tx("clinicalRunner.back", lang as Lang)}
        </Button>

        {currentStep === test.questions.length - 1 && allAnswered ? (
          <Button onClick={handleSubmit} style={{ backgroundColor: test.color }}
            className="text-white gap-1">
            {tx("clinicalRunner.seeResults", lang as Lang)}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={goForward}
            disabled={answers[currentStep] === null || currentStep >= test.questions.length - 1 || isAnimating}
            className="gap-1">
            {tx("clinicalRunner.next", lang as Lang)}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
