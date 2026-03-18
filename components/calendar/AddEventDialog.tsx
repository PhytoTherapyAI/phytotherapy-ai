"use client"

import { useState, useEffect } from "react"
import { CalendarPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

export type CalendarEventType =
  | "medication"
  | "supplement"
  | "appointment"
  | "sport"
  | "symptom"
  | "operation"
  | "custom"

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly"

interface AddEventDialogProps {
  userId: string
  lang: Lang
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  selectedDate?: string // YYYY-MM-DD
  presetEventType?: string
}

export function AddEventDialog({
  userId,
  lang,
  open,
  onOpenChange,
  onSaved,
  selectedDate,
  presetEventType,
}: AddEventDialogProps) {
  const [eventType, setEventType] = useState<CalendarEventType>("appointment")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDate(selectedDate || new Date().toISOString().split("T")[0])
      setTitle("")
      setDescription("")
      setTime("")
      setRecurrence("none")
      setEventType((presetEventType as CalendarEventType) || "appointment")
      setError(null)
    }
  }, [open, selectedDate, presetEventType])

  const eventTypes: { value: CalendarEventType; labelKey: string }[] = [
    { value: "medication", labelKey: "cal.eventType.medication" },
    { value: "supplement", labelKey: "cal.eventType.supplement" },
    { value: "appointment", labelKey: "cal.eventType.appointment" },
    { value: "sport", labelKey: "cal.eventType.sport" },
    { value: "symptom", labelKey: "cal.eventType.symptom" },
    { value: "operation", labelKey: "cal.eventType.operation" },
    { value: "custom", labelKey: "cal.eventType.custom" },
  ]

  const recurrenceTypes: { value: RecurrenceType; labelKey: string }[] = [
    { value: "none", labelKey: "cal.recurrence.none" },
    { value: "daily", labelKey: "cal.recurrence.daily" },
    { value: "weekly", labelKey: "cal.recurrence.weekly" },
    { value: "monthly", labelKey: "cal.recurrence.monthly" },
  ]

  const handleSave = async () => {
    if (!title.trim()) {
      setError(lang === "tr" ? "Başlık gereklidir." : "Title is required.")
      return
    }
    if (!date) {
      setError(lang === "tr" ? "Tarih gereklidir." : "Date is required.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const supabase = createBrowserClient()
      const { error: insertError } = await supabase.from("calendar_events").insert({
        user_id: userId,
        event_type: eventType,
        title: title.trim(),
        description: description.trim() || null,
        event_date: date,
        event_time: time || null,
        recurrence,
      })

      if (insertError) {
        throw insertError
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to save event:", err)
      setError(lang === "tr" ? "Etkinlik kaydedilemedi." : "Failed to save event.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            {tx("cal.addEventTitle", lang)}
          </DialogTitle>
          <DialogDescription>{tx("cal.addEventDesc", lang)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Event Type */}
          <div className="space-y-1.5">
            <Label>{tx("cal.eventType", lang)}</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as CalendarEventType)}>
              <SelectTrigger>
                <span className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${eventTypeColor(eventType)}`} />
                  {tx(`cal.eventType.${eventType}`, lang)}
                </span>
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${eventTypeColor(et.value)}`}
                      />
                      {tx(et.labelKey, lang)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>{tx("cal.eventTitle", lang)}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tx("cal.eventTitlePlaceholder", lang)}
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>{tx("cal.eventDesc", lang)}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{tx("cal.eventDate", lang)}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{tx("cal.eventTime", lang)}</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-1.5">
            <Label>{tx("cal.recurrence", lang)}</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
              <SelectTrigger>
                <span>{tx(`cal.recurrence.${recurrence}`, lang)}</span>
              </SelectTrigger>
              <SelectContent>
                {recurrenceTypes.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {tx(r.labelKey, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {tx("cal.cancel", lang)}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tx("cal.saving", lang)}
              </>
            ) : (
              tx("cal.save", lang)
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function eventTypeColor(type: string): string {
  switch (type) {
    case "medication":
      return "bg-green-500"
    case "supplement":
      return "bg-blue-500"
    case "appointment":
      return "bg-purple-500"
    case "sport":
      return "bg-orange-500"
    case "symptom":
      return "bg-red-400"
    case "operation":
      return "bg-rose-600"
    case "custom":
    default:
      return "bg-muted-foreground"
  }
}
