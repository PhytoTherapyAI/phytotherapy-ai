// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Pill, Droplets, SmilePlus, AlertCircle, Check } from "lucide-react"
import { tx, txp, txObj, type Lang } from "@/lib/translations"

interface QuickActionsProps {
  lang: Lang
  userId?: string
}

const MOOD_OPTIONS = [
  { value: 1, emoji: "😫", labelEn: "Awful", labelTr: "Berbat" },
  { value: 2, emoji: "😕", labelEn: "Bad", labelTr: "Kotu" },
  { value: 3, emoji: "😐", labelEn: "Okay", labelTr: "Fena degil" },
  { value: 4, emoji: "😊", labelEn: "Good", labelTr: "Iyi" },
  { value: 5, emoji: "🤩", labelEn: "Great", labelTr: "Harika" },
]

export function QuickActions({ lang, userId }: QuickActionsProps) {
  const [medsDone, setMedsDone] = useState(false)
  const [waterCount, setWaterCount] = useState(() => {
    if (typeof window === "undefined") return 0
    const today = new Date().toISOString().split("T")[0]
    return parseInt(localStorage.getItem(`qa-water-${today}`) || "0", 10)
  })
  const [moodOpen, setMoodOpen] = useState(false)
  const [moodSelected, setMoodSelected] = useState<number | null>(null)
  const [symptomOpen, setSymptomOpen] = useState(false)
  const [symptomText, setSymptomText] = useState("")
  const [symptomSaved, setSymptomSaved] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  const handleMeds = () => {
    localStorage.setItem(`qa-meds-${today}`, "true")
    setMedsDone(true)
    window.dispatchEvent(new Event("meds-taken"))
  }

  const handleWater = () => {
    const next = waterCount + 1
    setWaterCount(next)
    localStorage.setItem(`qa-water-${today}`, String(next))
    window.dispatchEvent(new CustomEvent("water-logged", { detail: { count: next } }))
  }

  const handleMoodSelect = (value: number) => {
    setMoodSelected(value)
    localStorage.setItem(`qa-mood-${today}`, String(value))
    setTimeout(() => setMoodOpen(false), 400)
    window.dispatchEvent(new CustomEvent("mood-logged", { detail: { mood: value } }))
  }

  const handleSymptomSave = () => {
    if (!symptomText.trim()) return
    const existing = JSON.parse(localStorage.getItem(`qa-symptoms-${today}`) || "[]")
    existing.push({ text: symptomText.trim(), time: new Date().toISOString() })
    localStorage.setItem(`qa-symptoms-${today}`, JSON.stringify(existing))
    setSymptomSaved(true)
    setSymptomText("")
    setTimeout(() => {
      setSymptomOpen(false)
      setSymptomSaved(false)
    }, 1000)
    window.dispatchEvent(new CustomEvent("symptom-logged", { detail: { text: symptomText.trim() } }))
  }

  const actions = [
    {
      key: "meds",
      icon: medsDone ? Check : Pill,
      label: tx("quickActions.tookMeds", lang),
      color: medsDone ? "text-green-500" : "text-primary",
      bg: medsDone ? "bg-green-500/10" : "bg-primary/10",
      onClick: handleMeds,
      disabled: medsDone,
    },
    {
      key: "water",
      icon: Droplets,
      label: txp("quickActions.drankWater", lang, { count: waterCount }),
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      onClick: handleWater,
      disabled: false,
    },
    {
      key: "mood",
      icon: SmilePlus,
      label: tx("quickActions.howFeeling", lang),
      color: moodSelected ? "text-amber-500" : "text-amber-500",
      bg: moodSelected ? "bg-amber-500/15" : "bg-amber-500/10",
      onClick: () => setMoodOpen(true),
      disabled: false,
    },
    {
      key: "symptom",
      icon: AlertCircle,
      label: tx("quickActions.logSymptom", lang),
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      onClick: () => setSymptomOpen(true),
      disabled: false,
    },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.key}
              variant="outline"
              disabled={action.disabled}
              onClick={action.onClick}
              className={`flex h-auto flex-col items-center gap-2 rounded-xl border-transparent px-3 py-4 shadow-sm transition-all active:scale-95 ${action.bg} hover:shadow-md`}
            >
              <Icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-xs font-medium leading-tight text-center">
                {action.label}
              </span>
            </Button>
          )
        })}
      </div>

      {/* Mood selector dialog */}
      <Dialog open={moodOpen} onOpenChange={setMoodOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">
              {tx("quickActions.moodTitle", lang)}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-2 py-4">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleMoodSelect(opt.value)}
                className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all hover:bg-primary/10 ${
                  moodSelected === opt.value ? "bg-primary/15 ring-2 ring-primary scale-110" : ""
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-[10px] text-muted-foreground">
                  {txObj(opt, lang)}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Symptom input dialog */}
      <Dialog open={symptomOpen} onOpenChange={setSymptomOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              {tx("quickActions.symptomTitle", lang)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <textarea
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              placeholder={tx("quickActions.symptomPlaceholder", lang)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <Button
              className="w-full"
              onClick={handleSymptomSave}
              disabled={!symptomText.trim()}
            >
              {symptomSaved
                ? tx("quickActions.saved", lang)
                : tx("quickActions.save", lang)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
