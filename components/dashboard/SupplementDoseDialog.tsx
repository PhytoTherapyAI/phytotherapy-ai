// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { findSupplementInfo, parseDoseToMg, getSupplementDisplayName } from "@/lib/supplement-data"
import { Pill, Clock, Sparkles, AlertTriangle, Timer, Trash2, Bell } from "lucide-react"

interface SupplementDoseDialogProps {
  lang: Lang
  supplement: {
    eventId: string
    name: string
    dose: string
    cycleDays: number
    breakDays: number
    daysUsed: number
    daysLeft: number
  }
  onClose: () => void
  onSave: () => void
  onRemove?: () => void
}

export function SupplementDoseDialog({ lang, supplement, onClose, onSave, onRemove }: SupplementDoseDialogProps) {
  const info = useMemo(() => findSupplementInfo(supplement.name), [supplement.name])

  const [dose, setDose] = useState(supplement.dose.split("·")[0]?.trim() || "")
  const [time, setTime] = useState("")
  const [enableReminder, setEnableReminder] = useState(false)
  const [cycleDays, setCycleDays] = useState(supplement.cycleDays)
  const [breakDays, setBreakDays] = useState(supplement.breakDays)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const tr = lang === "tr"

  // Load existing time from DB
  useEffect(() => {
    const loadEventData = async () => {
      try {
        const supabase = createBrowserClient()
        const { data } = await supabase
          .from("calendar_events")
          .select("event_time, metadata")
          .eq("id", supplement.eventId)
          .single()
        if (data) {
          if (data.event_time) {
            setTime(data.event_time)
            setEnableReminder(true)
          }
          const meta = data.metadata as Record<string, unknown> | null
          if (meta?.cycleDays !== undefined) {
            setCycleDays((meta.cycleDays as number) || 0)
          }
          if (meta?.breakDays !== undefined) {
            setBreakDays((meta.breakDays as number) || info.breakDays)
          }
        }
      } catch { /* ignore */ }
    }
    loadEventData()
  }, [supplement.eventId, info.breakDays])

  // Overdose check
  const overdoseWarning = useMemo(() => {
    if (!dose.trim() || info.maxDoseValue === 0) return null
    const userDose = parseDoseToMg(dose)
    if (userDose <= 0) return null
    if (userDose > info.maxDoseValue) {
      return tr
        ? `Girdiğiniz doz (${dose}) maksimum güvenli dozun (${info.maxDose}) üzerinde! Doktorunuza danışın.`
        : `Your dose (${dose}) exceeds the maximum safe dose (${info.maxDose})! Consult your doctor.`
    }
    return null
  }, [dose, info, tr])

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const description = time ? `${dose} · ${time}` : dose

      await supabase
        .from("calendar_events")
        .update({
          description,
          event_time: (enableReminder && time) ? time : null,
          metadata: {
            dose,
            frequency: "daily",
            cycleDays: cycleDays === 0 ? null : cycleDays,
            breakDays: breakDays,
            recommendedDose: info.recommendedDose,
            maxDose: info.maxDose,
            unlimited: cycleDays === 0,
          },
        })
        .eq("id", supplement.eventId)

      onSave()
    } catch (err) {
      console.error("Save exception:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      const supabase = createBrowserClient()
      await supabase.from("calendar_events").delete().eq("id", supplement.eventId)
      onRemove?.()
      onSave()
    } catch (err) {
      console.error("Delete exception:", err)
    } finally {
      setRemoving(false)
    }
  }

  const cyclePresets = [30, 42, 60, 90, 120]

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5 text-primary" />
            {getSupplementDisplayName(supplement.name, lang)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current cycle info */}
          <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>{tx("supp.used", lang)}</span>
              <span className="font-medium text-foreground">{supplement.daysUsed} {tx("supp.days", lang)}</span>
            </div>
            <div className="flex justify-between">
              <span>{tx("supp.remaining", lang)}</span>
              <span className={`font-medium ${supplement.daysLeft <= 7 && supplement.daysLeft > 0 ? "text-amber-500" : "text-foreground"}`}>
                {cycleDays === 0
                  ? tx("supp.unlimitedDisp", lang)
                  : `${Math.max(0, cycleDays - supplement.daysUsed)} ${tx("supp.days", lang)}`
                }
              </span>
            </div>
          </div>

          {/* Cycle expired warning */}
          {supplement.daysLeft === 0 && supplement.cycleDays > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {tx("supp.expired", lang)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {tr ? `${breakDays} gün mola vermeniz önerilir.` : `A ${breakDays}-day break is recommended.`}
                </p>
              </div>
            </div>
          )}

          {/* Recommended dose */}
          {info.recommendedDose !== "-" && (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-xs font-medium">{tx("supp.suggestion", lang)}</p>
                <p className="text-base font-semibold text-primary">{info.recommendedDose}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {`${tx("supp.maxSafe", lang)} ${info.maxDose}`}
                </p>
              </div>
            </div>
          )}

          {/* Dose input */}
          <div>
            <label className="mb-1.5 block text-xs font-medium">{tx("supp.doseLabel", lang)}</label>
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder={info.recommendedDose !== "-" ? info.recommendedDose : tx("supp.dosePlaceholder", lang)}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ${
                overdoseWarning
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "focus:border-primary focus:ring-primary/20"
              }`}
            />
          </div>

          {overdoseWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs text-red-600 dark:text-red-400">{overdoseWarning}</p>
            </div>
          )}

          {/* Time — merged with reminder */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
              <Clock className="h-3 w-3" />
              {tx("supp.timeLabel", lang)}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-1">
                {["08:00", "12:00", "21:00"].map((t) => (
                  <button key={t} onClick={() => setTime(t)}
                    className={`rounded-full px-2 py-1 text-[10px] font-medium transition-all ${
                      time === t ? "bg-primary text-white" : "border bg-card hover:border-primary hover:text-primary"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Reminder toggle — appears when time is set */}
            {time && (
              <button
                onClick={() => setEnableReminder(!enableReminder)}
                className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all w-full ${
                  enableReminder
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <Bell className={`h-4 w-4 ${enableReminder ? "text-primary" : ""}`} />
                {enableReminder
                  ? (tr ? `${time} saatinde bildirim gelecek` : `Notification at ${time}`)
                  : tx("supp.notifGet", lang)
                }
              </button>
            )}
          </div>

          {/* Cycle duration */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
              <Timer className="h-3 w-3" />
              {tx("supp.cycleDuration", lang)}
            </label>
            {info.cycleDays > 0 && (
              <p className="mb-2 text-[10px] text-muted-foreground">
                {tr ? `Tavsiye: ${info.cycleDays} gün kullanım, ${info.breakDays} gün mola` : `Recommended: ${info.cycleDays} days use, ${info.breakDays} days break`}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {cyclePresets.map(days => (
                <button
                  key={days}
                  onClick={() => setCycleDays(days)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    cycleDays === days
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {days} {tx("supp.days", lang)}
                </button>
              ))}
              <button
                onClick={() => setCycleDays(0)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  cycleDays === 0
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:border-primary/30"
                }`}
              >
                ∞ {tx("supp.noLimit", lang)}
              </button>
            </div>

            {/* Custom cycle input — only when NOT unlimited */}
            {cycleDays > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={cycleDays}
                  onChange={(e) => setCycleDays(parseInt(e.target.value) || 0)}
                  min={1}
                  max={365}
                  className="w-28 rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-[10px] text-muted-foreground">{tx("supp.days", lang)}</span>
              </div>
            )}
          </div>

          {/* Save */}
          <Button className="w-full" onClick={handleSave} disabled={saving || !dose.trim()}>
            {saving ? tx("supp.saving", lang) : tx("profile.save", lang)}
          </Button>

          {/* Remove */}
          {confirmRemove ? (
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" className="flex-1" onClick={handleRemove} disabled={removing}>
                <Trash2 className="mr-1.5 h-3 w-3" />
                {removing ? "..." : tx("supp.removeConfirm", lang)}
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmRemove(false)}>
                {tx("profile.cancel", lang)}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground transition-colors hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
              {tx("supp.removeLabel", lang)}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
