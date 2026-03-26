"use client"

import { useState, useEffect } from "react"
import { Activity, Loader2 } from "lucide-react"
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

export type VitalType = "blood_pressure" | "blood_sugar" | "weight" | "heart_rate"

interface AddVitalDialogProps {
  userId: string
  lang: Lang
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function AddVitalDialog({
  userId,
  lang,
  open,
  onOpenChange,
  onSaved,
}: AddVitalDialogProps) {
  const [vitalType, setVitalType] = useState<VitalType>("blood_pressure")
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [value, setValue] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSystolic("")
      setDiastolic("")
      setValue("")
      setNotes("")
      setError(null)
      setVitalType("blood_pressure")
    }
  }, [open])

  const vitalTypes: { value: VitalType; labelKey: string }[] = [
    { value: "blood_pressure", labelKey: "cal.vitalType.blood_pressure" },
    { value: "blood_sugar", labelKey: "cal.vitalType.blood_sugar" },
    { value: "weight", labelKey: "cal.vitalType.weight" },
    { value: "heart_rate", labelKey: "cal.vitalType.heart_rate" },
  ]

  const getUnit = (): string => {
    switch (vitalType) {
      case "blood_sugar":
        return tx("cal.unit.mgdl", lang)
      case "weight":
        return tx("cal.unit.kg", lang)
      case "heart_rate":
        return tx("cal.unit.bpm", lang)
      default:
        return ""
    }
  }

  const handleSave = async () => {
    setError(null)

    // Validate
    if (vitalType === "blood_pressure") {
      if (!systolic || !diastolic) {
        setError(
          lang === "tr"
            ? "Sistolik ve diastolik değerler gereklidir."
            : "Systolic and diastolic values are required."
        )
        return
      }
      const sys = Number(systolic)
      const dia = Number(diastolic)
      if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) {
        setError(tx("cal.validValues", lang))
        return
      }
    } else {
      if (!value) {
        setError(tx("cal.valueRequired", lang))
        return
      }
      const num = Number(value)
      if (isNaN(num) || num <= 0) {
        setError(tx("cal.validValue", lang))
        return
      }
    }

    setSaving(true)

    try {
      const supabase = createBrowserClient()
      const now = new Date().toISOString()

      const record: Record<string, unknown> = {
        user_id: userId,
        vital_type: vitalType,
        recorded_at: now,
        notes: notes.trim() || null,
      }

      if (vitalType === "blood_pressure") {
        record.systolic = Number(systolic)
        record.diastolic = Number(diastolic)
        record.value = Number(systolic) // primary value for display
      } else {
        record.value = Number(value)
      }

      const { error: insertError } = await supabase.from("vital_records").insert(record)

      if (insertError) {
        throw insertError
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to save vital:", err)
      setError(tx("cal.vitalSaveFailed", lang))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {tx("cal.addVitalTitle", lang)}
          </DialogTitle>
          <DialogDescription>{tx("cal.addVitalDesc", lang)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Vital Type */}
          <div className="space-y-1.5">
            <Label>{tx("cal.vitalType", lang)}</Label>
            <Select value={vitalType} onValueChange={(v) => setVitalType(v as VitalType)}>
              <SelectTrigger>
                <span>{tx(`cal.vitalType.${vitalType}`, lang)}</span>
              </SelectTrigger>
              <SelectContent>
                {vitalTypes.map((vt) => (
                  <SelectItem key={vt.value} value={vt.value}>
                    {tx(vt.labelKey, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic fields */}
          {vitalType === "blood_pressure" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tx("cal.systolic", lang)}</Label>
                <Input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                  min={0}
                  max={300}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{tx("cal.diastolic", lang)}</Label>
                <Input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                  min={0}
                  max={200}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>
                {tx("cal.value", lang)} ({getUnit()})
              </Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  vitalType === "blood_sugar"
                    ? "100"
                    : vitalType === "weight"
                    ? "70"
                    : "72"
                }
                min={0}
                step={vitalType === "weight" ? "0.1" : "1"}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>{tx("cal.notes", lang)}</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                lang === "tr" ? "ör. Yemekten sonra" : "e.g., After meal"
              }
              maxLength={300}
            />
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
