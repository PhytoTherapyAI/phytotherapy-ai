// © 2026 DoctoPal — All Rights Reserved
// Behavioral Vital Logger — Zero-typing, visual grid, context chips, micro-reward
"use client"

import { useState, useEffect } from "react"
import { Heart, Thermometer, Droplets, Scale, Activity, Gauge, Check, Loader2, X } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

export type VitalType = "blood_pressure" | "blood_sugar" | "weight" | "heart_rate" | "temperature" | "spo2"

interface VitalConfig {
  type: VitalType
  icon: React.ElementType
  emoji: string
  labelEn: string
  labelTr: string
  unit: string
  group: "vital" | "metabolic"
  placeholder: string
  contextChips?: Array<{ en: string; tr: string }>
}

const VITAL_CONFIGS: VitalConfig[] = [
  { type: "blood_pressure", icon: Heart, emoji: "🫀", labelEn: "Blood Pressure", labelTr: "Tansiyon", unit: "mmHg", group: "vital", placeholder: "120/80" },
  { type: "heart_rate", icon: Activity, emoji: "💓", labelEn: "Heart Rate", labelTr: "Nabız", unit: "bpm", group: "vital", placeholder: "72" },
  { type: "temperature", icon: Thermometer, emoji: "🌡️", labelEn: "Temperature", labelTr: "Ateş", unit: "°C", group: "vital", placeholder: "36.6" },
  { type: "spo2", icon: Gauge, emoji: "🫁", labelEn: "SpO2", labelTr: "SpO2", unit: "%", group: "vital", placeholder: "98" },
  { type: "blood_sugar", icon: Droplets, emoji: "🩸", labelEn: "Blood Sugar", labelTr: "Kan Şekeri", unit: "mg/dL", group: "metabolic", placeholder: "100",
    contextChips: [
      { en: "Fasting", tr: "Aç Karnına" },
      { en: "After Meal", tr: "Tok Karnına" },
      { en: "Post-Exercise", tr: "Egzersiz Sonrası" },
      { en: "Pre-Medication", tr: "İlaç Öncesi" },
    ] },
  { type: "weight", icon: Scale, emoji: "⚖️", labelEn: "Weight", labelTr: "Kilo", unit: "kg", group: "metabolic", placeholder: "70.0",
    contextChips: [
      { en: "Morning", tr: "Sabah" },
      { en: "After Meal", tr: "Yemek Sonrası" },
      { en: "Before Bed", tr: "Yatmadan Önce" },
    ] },
]

interface AddVitalDialogProps {
  userId: string
  lang: Lang
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function AddVitalDialog({ userId, lang, open, onOpenChange, onSaved }: AddVitalDialogProps) {
  const [selected, setSelected] = useState<VitalConfig | null>(null)
  const [value, setValue] = useState("")
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [contextTag, setContextTag] = useState("")
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<"select" | "input" | "success">("select")
  const [error, setError] = useState<string | null>(null)
  const isTr = lang === "tr"

  useEffect(() => {
    if (open) {
      setSelected(null)
      setValue("")
      setSystolic("")
      setDiastolic("")
      setContextTag("")
      setError(null)
      setStep("select")
    }
  }, [open])

  const handleSelectType = (config: VitalConfig) => {
    setSelected(config)
    setStep("input")
  }

  const handleSave = async () => {
    if (!selected) return
    setError(null)

    // Validate
    if (selected.type === "blood_pressure") {
      if (!systolic || !diastolic) { setError(tx("cal.bpRequired", lang)); return }
      if (isNaN(Number(systolic)) || isNaN(Number(diastolic))) { setError(tx("cal.validValues", lang)); return }
    } else {
      if (!value) { setError(tx("cal.valueRequired", lang)); return }
      if (isNaN(Number(value)) || Number(value) <= 0) { setError(tx("cal.validValue", lang)); return }
    }

    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const record: Record<string, unknown> = {
        user_id: userId,
        vital_type: selected.type,
        recorded_at: new Date().toISOString(),
        notes: contextTag || null,
      }

      if (selected.type === "blood_pressure") {
        record.systolic = Number(systolic)
        record.diastolic = Number(diastolic)
        record.value = Number(systolic)
      } else {
        record.value = Number(value)
      }

      const { error: insertError } = await supabase.from("vital_records").insert(record)
      if (insertError) throw insertError

      setStep("success")
      setTimeout(() => { onSaved(); onOpenChange(false) }, 1200)
    } catch (err) {
      console.error("Failed to save vital:", err)
      setError(tx("cal.vitalSaveFailed", lang))
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const vitals = VITAL_CONFIGS.filter(c => c.group === "vital")
  const metabolic = VITAL_CONFIGS.filter(c => c.group === "metabolic")

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card shadow-2xl border mx-0 sm:mx-4 max-h-[85vh] overflow-y-auto">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Close */}
        <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10">
          <X className="h-5 w-5" />
        </button>

        <div className="p-5">
          {/* ── Step 1: Type Selection Grid ── */}
          {step === "select" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">
                {isTr ? "Sağlık Verisi Ekle" : "Log Health Data"}
              </h2>

              {/* Vitals group */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  🫀 {isTr ? "Vitaller" : "Vitals"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {vitals.map((config) => (
                    <button key={config.type} onClick={() => handleSelectType(config)}
                      className="flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.02] active:scale-95">
                      <span className="text-xl">{config.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{isTr ? config.labelTr : config.labelEn}</p>
                        <p className="text-[10px] text-muted-foreground">{config.unit}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metabolic group */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  ⚖️ {isTr ? "Metabolik & Fiziksel" : "Metabolic & Physical"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {metabolic.map((config) => (
                    <button key={config.type} onClick={() => handleSelectType(config)}
                      className="flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.02] active:scale-95">
                      <span className="text-xl">{config.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{isTr ? config.labelTr : config.labelEn}</p>
                        <p className="text-[10px] text-muted-foreground">{config.unit}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Value Input ── */}
          {step === "input" && selected && (
            <div className="space-y-5">
              {/* Back + title */}
              <div className="flex items-center gap-3">
                <button onClick={() => setStep("select")} className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-muted">
                  <span className="text-sm">←</span>
                </button>
                <span className="text-xl">{selected.emoji}</span>
                <h2 className="text-lg font-bold">{isTr ? selected.labelTr : selected.labelEn}</h2>
              </div>

              {/* Large value input */}
              {selected.type === "blood_pressure" ? (
                <div className="flex items-center justify-center gap-2">
                  <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)}
                    placeholder="120" className="w-24 text-center text-4xl font-bold bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none py-2" />
                  <span className="text-3xl font-light text-muted-foreground">/</span>
                  <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="80" className="w-24 text-center text-4xl font-bold bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none py-2" />
                  <span className="text-sm text-muted-foreground ml-1">mmHg</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
                    placeholder={selected.placeholder} step={selected.type === "weight" || selected.type === "temperature" ? "0.1" : "1"}
                    className="w-32 text-center text-4xl font-bold bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none py-2"
                    autoFocus />
                  <span className="text-sm text-muted-foreground">{selected.unit}</span>
                </div>
              )}

              {/* Context chips */}
              {selected.contextChips && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                    {isTr ? "Bağlam" : "Context"}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selected.contextChips.map((chip) => (
                      <button key={chip.en}
                        onClick={() => setContextTag(contextTag === chip.en ? "" : chip.en)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                          contextTag === chip.en
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/30"
                        }`}>
                        {isTr ? chip.tr : chip.en}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-center text-sm text-red-500">{error}</p>}

              {/* Save button */}
              <button onClick={handleSave} disabled={saving}
                className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isTr ? "Kaydediliyor..." : "Saving..."}
                  </span>
                ) : (
                  isTr ? "Kaydet" : "Save"
                )}
              </button>
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
                style={{ animation: "scaleIn 0.4s ease-out" }}>
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold">{isTr ? "Başarıyla Kaydedildi!" : "Successfully Saved!"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selected?.emoji} {isTr ? selected?.labelTr : selected?.labelEn}
              </p>
              <style jsx>{`
                @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
