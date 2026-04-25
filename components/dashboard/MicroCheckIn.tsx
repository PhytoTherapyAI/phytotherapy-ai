// © 2026 DoctoPal — All Rights Reserved
//
// F-CHECKIN-UI-001: redesign — Apple Health-leaning premium feel.
//
// Changes vs the original Dialog-primitive version:
//   - Dropped shadcn `Dialog` in favour of the AddVitalDialog custom
//     div pattern (backdrop + bottom-sheet on mobile, centered on
//     desktop). The Radix Dialog override path required `!important`
//     class chains and was brittle on iOS Safari + PWA.
//   - Header simplified: { back / step icon, X } row, then a
//     full-width thin progress bar, then the question title in a
//     larger weight. Step badge removed (the bar already conveys
//     "1/4" implicitly).
//   - Emoji buttons gain a framer-motion `whileTap` pop (spring back
//     to 1) and a stronger selected state (ring + bg + scale).
//   - Auto-advance is hybrid: clicking an emoji parks the user on
//     the selected state for 400 ms (so the pop + ring animation can
//     play visibly), then advances. Impatient users can hit "İleri"
//     immediately to skip the wait — both paths produce the same
//     setStep(s+1). Step 4 (last) does NOT auto-advance — saving
//     someone's check-in without an explicit confirmation tap is the
//     wrong default.
//   - "İleri" is a filled emerald primary CTA; disabled until the
//     current step has an answer. Last step swaps the label to
//     "Tamamla" (checkin.complete) and triggers handleSave.
//   - "Geri" is a small ghost link in the header (only visible when
//     step > 0). "Sonra" stays in the footer left as the dismiss
//     escape hatch.
//   - The current step's icon emoji gets the pre-existing
//     `.animate-pulse-glow` class (defined in app/globals.css) so
//     each step feels alive without adding a new keyframe.
"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

interface MicroCheckInProps {
  userId: string
  lang: Lang
  onComplete?: () => void
}

const EMOJI_OPTIONS = [
  { value: 1, emoji: "😫", labelKey: "checkin.veryBad" },
  { value: 2, emoji: "😕", labelKey: "checkin.bad" },
  { value: 3, emoji: "😐", labelKey: "checkin.okay" },
  { value: 4, emoji: "😊", labelKey: "checkin.good" },
  { value: 5, emoji: "🤩", labelKey: "checkin.great" },
]

const QUESTIONS = [
  { key: "energy_level" as const, titleKey: "checkin.energy", icon: "⚡" },
  { key: "sleep_quality" as const, titleKey: "checkin.sleep", icon: "😴" },
  { key: "mood" as const, titleKey: "checkin.mood", icon: "🧠" },
  { key: "bloating" as const, titleKey: "checkin.body", icon: "🫁" },
]

type CheckInField = "energy_level" | "sleep_quality" | "mood" | "bloating"

// Hybrid auto-advance delay. Long enough to see the selected ring +
// pop play; short enough that confident users don't feel held up.
const AUTO_ADVANCE_MS = 400

export function MicroCheckIn({ userId, lang, onComplete }: MicroCheckInProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<CheckInField, number | null>>({
    energy_level: null,
    sleep_quality: null,
    mood: null,
    bloating: null,
  })
  const [saving, setSaving] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  const [shouldOpen, setShouldOpen] = useState(false)

  const checkIfDone = useCallback(async () => {
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const today = new Date().toISOString().split("T")[0]
      const res = await fetch(`/api/check-in?date=${today}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.checkIn) {
        setAlreadyDone(true)
      } else {
        const dismissed = sessionStorage.getItem("checkin-dismissed-" + today)
        if (!dismissed) {
          setShouldOpen(true)
        }
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    if (userId) checkIfDone()
  }, [userId, checkIfDone])

  // Wait for med dialog to close before opening
  useEffect(() => {
    if (!shouldOpen) return

    let medDialogActive = false
    const markActive = () => { medDialogActive = true }
    window.addEventListener("med-dialog-will-open", markActive)

    const onMedClosed = () => {
      setTimeout(() => setOpen(true), 500)
    }
    window.addEventListener("med-dialog-closed", onMedClosed)

    const fallback = setTimeout(() => {
      if (!medDialogActive) {
        setOpen(true)
      }
    }, 1500)

    return () => {
      window.removeEventListener("med-dialog-will-open", markActive)
      window.removeEventListener("med-dialog-closed", onMedClosed)
      clearTimeout(fallback)
    }
  }, [shouldOpen])

  // Listen for external "open-checkin" event (Dashboard button, Calendar, etc.)
  useEffect(() => {
    const handler = () => {
      if (!alreadyDone) {
        setStep(0)
        setValues({ energy_level: null, sleep_quality: null, mood: null, bloating: null })
        setOpen(true)
      }
    }
    window.addEventListener("open-checkin", handler)
    return () => window.removeEventListener("open-checkin", handler)
  }, [alreadyDone])

  const handleDismiss = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]
    sessionStorage.setItem("checkin-dismissed-" + today, "true")
    setOpen(false)
  }, [])

  // Escape key handler — Dialog primitive used to give us this for
  // free; the custom div pattern owns it now.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, handleDismiss])

  const handleSelect = (value: number) => {
    const field = QUESTIONS[step].key
    setValues((prev) => ({ ...prev, [field]: value }))

    // Hybrid auto-advance: don't auto-advance from the last step —
    // saving someone's full check-in needs an explicit "Tamamla" tap.
    if (step < QUESTIONS.length - 1) {
      window.setTimeout(() => {
        setStep((s) => Math.min(s + 1, QUESTIONS.length - 1))
      }, AUTO_ADVANCE_MS)
    }
  }

  const handleAdvance = () => {
    // Manual "İleri" path — same effect as auto-advance but immediate.
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        setAlreadyDone(true)
        setOpen(false)
        onComplete?.()
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  if (alreadyDone) return null
  if (!open) return null

  const currentQ = QUESTIONS[Math.min(step, QUESTIONS.length - 1)]
  const allAnswered = Object.values(values).every((v) => v !== null)
  const isLastStep = step === QUESTIONS.length - 1
  const currentValue = values[currentQ.key]
  const hasSelection = currentValue !== null
  const progressPct = ((step + 1) / QUESTIONS.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden
      />

      {/* Modal — bottom sheet on mobile, centered card on sm+ */}
      <div
        className="relative w-full max-w-md bg-card shadow-2xl border mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 fade-in-0 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-title"
      >
        {/* Mobile drag-handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="p-6 sm:p-8">
          {/* ── Header row 1: Geri (left) + X (right) ── */}
          <div className="flex items-center justify-between min-h-[24px]">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                aria-label={tx("checkin.back", lang)}
              >
                <ChevronLeft className="h-4 w-4" />
                {tx("checkin.back", lang)}
              </button>
            ) : (
              <span aria-hidden />
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={tx("checkin.later", lang)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Header row 2: progress bar ── */}
          <div className="mt-4 h-1 w-full rounded-full bg-emerald-100 dark:bg-emerald-950/40 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={QUESTIONS.length}
            />
          </div>

          {/* ── Header row 3: pulse icon + big title ── */}
          <div className="mt-8 text-center">
            <span
              className="inline-block text-4xl animate-gentle-pulse motion-reduce:animate-none"
              aria-hidden
            >
              {currentQ.icon}
            </span>
            <h2
              id="checkin-title"
              className="mt-3 text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100"
            >
              {tx(currentQ.titleKey, lang)}
            </h2>
          </div>

          {/* ── Emoji row ── */}
          <div className="mt-8 flex justify-center gap-3 sm:gap-4">
            {EMOJI_OPTIONS.map((opt) => {
              const selected = currentValue === opt.value
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  whileTap={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-3 transition-all duration-150 hover:scale-110 motion-reduce:hover:scale-100 ${
                    selected
                      ? "bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500"
                      : "hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20"
                  }`}
                  aria-pressed={selected}
                  aria-label={tx(opt.labelKey, lang)}
                >
                  <span className="text-3xl leading-none">{opt.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {tx(opt.labelKey, lang)}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* ── Footer: Sonra (left) + İleri/Tamamla (right) ── */}
          <div className="mt-10 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground"
            >
              {tx("checkin.later", lang)}
            </Button>

            {isLastStep ? (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !allAnswered}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {saving
                  ? tx("checkin.saving", lang)
                  : tx("checkin.complete", lang)}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleAdvance}
                disabled={!hasSelection}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {tx("checkin.next", lang)}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
