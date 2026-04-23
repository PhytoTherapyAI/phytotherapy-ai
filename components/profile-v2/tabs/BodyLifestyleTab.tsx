// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 2.1: Body & Lifestyle tab. Wraps the existing
// LifestyleSection (BMI + blood group + exercise + sleep + diet) and
// adds smoking / alcohol radio groups above it. Smoking + alcohol
// live ONLY HERE now — the Kişisel Bilgiler summary block and the
// legacy "Sağlık Profilim" health form duplicates get cleaned up in
// Commit 6 (legacy removal). For now the duplicates stay reachable
// via `?legacy=true` but ShellV2 renders this as the sole source.
//
// Save strategy: auto-save on change via Supabase update. Debounced
// 800 ms so rapid radio flipping doesn't hammer the DB. Lets the user
// click through fields without worrying about a sticky "Kaydet"
// button — matches the rest of ShellV2's "always-live" edit model.
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import { LifestyleSection } from "@/components/profile/LifestyleSection"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface BodyLifestyleTabProps {
  lang: "tr" | "en"
  userId: string
  profile: {
    height_cm?: number | null
    weight_kg?: number | null
    blood_group?: string | null
    diet_type?: string | null
    exercise_frequency?: string | null
    sleep_quality?: string | null
    smoking_use?: string | null
    alcohol_use?: string | null
  } | null
  onSaved?: () => void
}

interface FormState {
  height_cm: number | null
  weight_kg: number | null
  blood_group: string
  diet_type: string
  exercise_frequency: string
  sleep_quality: string
  smoking_use: string
  alcohol_use: string
}

const SMOKING_OPTIONS: Array<{ value: string; tr: string; en: string }> = [
  { value: "none",   tr: "Hiç içmedim",     en: "Never smoked" },
  { value: "former", tr: "Eski içici",      en: "Former smoker" },
  { value: "active", tr: "Aktif içici",     en: "Active smoker" },
]

const ALCOHOL_OPTIONS: Array<{ value: string; tr: string; en: string }> = [
  { value: "none",       tr: "Hiç içmiyorum",         en: "None" },
  { value: "occasional", tr: "Ara sıra",              en: "Occasional" },
  { value: "regular",    tr: "Düzenli",               en: "Regular" },
]

export function BodyLifestyleTab({ lang, userId, profile, onSaved }: BodyLifestyleTabProps) {
  const tr = lang === "tr"

  // Hydrate form from profile; empty string defaults so radio groups
  // have a stable "nothing chosen" vs selected distinction.
  const [form, setForm] = useState<FormState>(() => ({
    height_cm: profile?.height_cm ?? null,
    weight_kg: profile?.weight_kg ?? null,
    blood_group: profile?.blood_group ?? "",
    diet_type: profile?.diet_type ?? "",
    exercise_frequency: profile?.exercise_frequency ?? "",
    sleep_quality: profile?.sleep_quality ?? "",
    smoking_use: profile?.smoking_use ?? "none",
    alcohol_use: profile?.alcohol_use ?? "none",
  }))

  // Re-hydrate when the underlying profile id changes (family profile
  // switch etc.). Using a ref so we only rehydrate on actual id swap,
  // not every profile tick.
  const lastHydratedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!profile) return
    const key = userId || ""
    if (lastHydratedRef.current === key) return
    lastHydratedRef.current = key
    setForm({
      height_cm: profile.height_cm ?? null,
      weight_kg: profile.weight_kg ?? null,
      blood_group: profile.blood_group ?? "",
      diet_type: profile.diet_type ?? "",
      exercise_frequency: profile.exercise_frequency ?? "",
      sleep_quality: profile.sleep_quality ?? "",
      smoking_use: profile.smoking_use ?? "none",
      alcohol_use: profile.alcohol_use ?? "none",
    })
  }, [userId, profile])

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(
    (next: FormState) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus("saving")
        try {
          const supabase = createBrowserClient()
          const { error } = await supabase
            .from("user_profiles")
            .update({
              height_cm: next.height_cm,
              weight_kg: next.weight_kg,
              blood_group: next.blood_group || null,
              diet_type: next.diet_type || null,
              exercise_frequency: next.exercise_frequency || null,
              sleep_quality: next.sleep_quality || null,
              smoking_use: next.smoking_use || null,
              alcohol_use: next.alcohol_use || null,
            })
            .eq("id", userId)
          if (error) throw error
          setSaveStatus("saved")
          onSaved?.()
          setTimeout(() => setSaveStatus("idle"), 1500)
        } catch {
          setSaveStatus("error")
          setTimeout(() => setSaveStatus("idle"), 3000)
        }
      }, 800)
    },
    [userId, onSaved],
  )

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  }, [])

  const updateForm = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch }
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  return (
    <section className="space-y-6">
      {/* Save status chip — bottom-right of the tab header area. */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{tr ? "Vücut & Yaşam" : "Body & Lifestyle"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {tr
              ? "Boy, kilo, kan grubu, sigara, alkol, egzersiz, uyku, beslenme — değişiklikler otomatik kaydedilir."
              : "Height, weight, blood type, smoking, alcohol, exercise, sleep, diet — changes auto-save."}
          </p>
        </div>
        <SaveStatusChip status={saveStatus} lang={lang} />
      </div>

      {/* Smoking + alcohol — ONLY here in ShellV2 (F-PROFILE-001 dedup).
          Legacy page still has these under Kişisel Bilgiler summary. */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{tr ? "Sigara & Alkol" : "Smoking & Alcohol"}</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              {tr ? "Sigara kullanımı" : "Smoking"}
            </Label>
            <RadioGroup
              value={form.smoking_use}
              onValueChange={(v) => updateForm({ smoking_use: v })}
              className="flex flex-col gap-2"
            >
              {SMOKING_OPTIONS.map((o) => (
                <div key={o.value} className="flex items-center gap-2">
                  <RadioGroupItem value={o.value} id={`smoking-${o.value}`} />
                  <Label htmlFor={`smoking-${o.value}`} className="text-sm cursor-pointer">
                    {tr ? o.tr : o.en}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              {tr ? "Alkol kullanımı" : "Alcohol"}
            </Label>
            <RadioGroup
              value={form.alcohol_use}
              onValueChange={(v) => updateForm({ alcohol_use: v })}
              className="flex flex-col gap-2"
            >
              {ALCOHOL_OPTIONS.map((o) => (
                <div key={o.value} className="flex items-center gap-2">
                  <RadioGroupItem value={o.value} id={`alcohol-${o.value}`} />
                  <Label htmlFor={`alcohol-${o.value}`} className="text-sm cursor-pointer">
                    {tr ? o.tr : o.en}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Existing LifestyleSection — BMI + blood group + exercise + sleep + diet.
          Same component the legacy page uses; zero behaviour change. */}
      <LifestyleSection
        data={{
          height_cm: form.height_cm,
          weight_kg: form.weight_kg,
          blood_group: form.blood_group,
          diet_type: form.diet_type,
          exercise_frequency: form.exercise_frequency,
          sleep_quality: form.sleep_quality,
        }}
        onChange={(patch) => updateForm(patch)}
        lang={lang}
      />
    </section>
  )
}

function SaveStatusChip({ status, lang }: { status: "idle" | "saving" | "saved" | "error"; lang: "tr" | "en" }) {
  const tr = lang === "tr"
  if (status === "idle") return null
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {tr ? "Kaydediliyor…" : "Saving…"}
      </span>
    )
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="h-3 w-3" />
        {tr ? "Kaydedildi" : "Saved"}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
      <AlertCircle className="h-3 w-3" />
      {tr ? "Hata" : "Error"}
    </span>
  )
}
