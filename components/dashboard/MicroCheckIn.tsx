// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
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
        // Show check-in dialog after a short delay
        const dismissed = sessionStorage.getItem("checkin-dismissed-" + today)
        if (!dismissed) {
          setTimeout(() => setOpen(true), 2000)
        }
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    if (userId) checkIfDone()
  }, [userId, checkIfDone])

  // Listen for external "open-checkin" event (from Dashboard button, Calendar, etc.)
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

  const handleSelect = (value: number) => {
    const field = QUESTIONS[step].key
    setValues(prev => ({ ...prev, [field]: value }))

    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300)
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

  const handleDismiss = () => {
    const today = new Date().toISOString().split("T")[0]
    sessionStorage.setItem("checkin-dismissed-" + today, "true")
    setOpen(false)
  }

  if (alreadyDone) return null

  const currentQ = QUESTIONS[step]
  const allAnswered = Object.values(values).every(v => v !== null)
  const isLastStep = step === QUESTIONS.length - 1

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {tx("checkin.title", lang)}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            {tx("checkin.subtitle", lang)}
          </p>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-2">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === step ? "bg-primary" : i < step && values[QUESTIONS[i].key] !== null ? "bg-primary/50" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Current question */}
        <div className="py-4 text-center">
          <span className="text-3xl">{currentQ.icon}</span>
          <h3 className="mt-2 text-base font-medium">
            {tx(currentQ.titleKey, lang)}
          </h3>
        </div>

        {/* Emoji options */}
        <div className="flex justify-center gap-3 pb-2">
          {EMOJI_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all hover:bg-primary/10 ${
                values[currentQ.key] === opt.value
                  ? "bg-primary/15 ring-2 ring-primary scale-110"
                  : ""
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-[10px] text-muted-foreground">
                {tx(opt.labelKey, lang)}
              </span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 0 ? setStep(s => s - 1) : handleDismiss()}
          >
            {step > 0 ? tx("checkin.back", lang) : tx("checkin.later", lang)}
          </Button>

          {isLastStep && allAnswered ? (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="min-w-[100px]"
            >
              {saving ? tx("checkin.saving", lang) : tx("checkin.save", lang)}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step < QUESTIONS.length - 1 && setStep(s => s + 1)}
              disabled={values[currentQ.key] === null}
            >
              {tx("checkin.next", lang)}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
