// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 2.1: Medical History tab.
//
// Three blocks top-to-bottom:
//   1. "Kritik Durumlar" — is_pregnant + is_breastfeeding (gender-
//      gated to non-male) + kidney_disease + liver_disease. Each is
//      a plain Supabase boolean on user_profiles. Small copy under
//      the header explains these drive the F-SAFETY-002 interaction
//      matrix so the user understands WHY we care about the boxes.
//   2. "Kronik Hastalıklar" — the reusable ChronicConditionsEditor
//      (autocomplete + medication → condition hint). Persists to
//      user_profiles.chronic_conditions ARRAY.
//   3. "Cerrahi Geçmiş" — entries stored in the same array with a
//      `surgery:` prefix. New chip-list UI here; legacy profile had
//      inline JSX mixed with motivation cards. We strip `surgery:`
//      for display and re-add it on write. `family:` prefix entries
//      stay hidden (Commit 3's FamilyTab handles those).
//
// Save strategy matches BodyLifestyleTab: 800 ms debounce, auto-save,
// status chip in the header.
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Check, AlertCircle, Shield, X, Plus } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChronicConditionsEditor } from "@/components/profile/ChronicConditionsEditor"
import type { UserMedication } from "@/lib/database.types"

interface MedicalHistoryTabProps {
  lang: "tr" | "en"
  userId: string
  /** gender from user_profiles — gates pregnancy + breastfeeding rows. */
  gender?: string | null
  profile: {
    is_pregnant?: boolean | null
    is_breastfeeding?: boolean | null
    kidney_disease?: boolean | null
    liver_disease?: boolean | null
    chronic_conditions?: string[] | null
  } | null
  /** Medications drive the ChronicConditionsEditor's "med → condition"
   *  hint. Passed in from useProfileData so the hint is cross-tab
   *  consistent. */
  medications: UserMedication[]
  onSaved?: () => void
}

type Flags = {
  is_pregnant: boolean
  is_breastfeeding: boolean
  kidney_disease: boolean
  liver_disease: boolean
}

export function MedicalHistoryTab({
  lang, userId, gender, profile, medications, onSaved,
}: MedicalHistoryTabProps) {
  const tr = lang === "tr"
  const isFemale = gender !== "male"

  // ── Critical flags ─────────────────────────────────────────────
  const [flags, setFlags] = useState<Flags>(() => ({
    is_pregnant: !!profile?.is_pregnant,
    is_breastfeeding: !!profile?.is_breastfeeding,
    kidney_disease: !!profile?.kidney_disease,
    liver_disease: !!profile?.liver_disease,
  }))

  // Re-hydrate when the active profile switches (family member etc.)
  const lastIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!profile) return
    if (lastIdRef.current === userId) return
    lastIdRef.current = userId
    setFlags({
      is_pregnant: !!profile.is_pregnant,
      is_breastfeeding: !!profile.is_breastfeeding,
      kidney_disease: !!profile.kidney_disease,
      liver_disease: !!profile.liver_disease,
    })
  }, [userId, profile])

  // ── Chronic + surgery (same array, prefix split) ───────────────
  // `chronic_conditions` hosts three kinds of entries separated by
  // prefix: bare string → chronic, `surgery:…` → surgery, `family:…`
  // → family history. FamilyTab (Commit 3) owns the family: slice;
  // here we only touch the first two.
  const rawConditions = profile?.chronic_conditions ?? []
  const [conditions, setConditions] = useState<string[]>(() => rawConditions)
  useEffect(() => {
    if (!profile) return
    setConditions(profile.chronic_conditions ?? [])
  }, [profile, userId])

  const chronicEntries = conditions.filter(
    (c) => typeof c === "string" && !c.startsWith("surgery:") && !c.startsWith("family:"),
  )
  const surgeryEntries = conditions
    .filter((c) => typeof c === "string" && c.startsWith("surgery:"))
    .map((c) => c.slice("surgery:".length))

  // ── Save status ────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(
    (nextFlags: Flags, nextConditions: string[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus("saving")
        try {
          const supabase = createBrowserClient()
          const { error } = await supabase
            .from("user_profiles")
            .update({
              is_pregnant: nextFlags.is_pregnant,
              is_breastfeeding: nextFlags.is_breastfeeding,
              kidney_disease: nextFlags.kidney_disease,
              liver_disease: nextFlags.liver_disease,
              chronic_conditions: nextConditions,
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

  const toggleFlag = (key: keyof Flags, value: boolean) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: value }
      scheduleSave(next, conditions)
      return next
    })
  }

  const updateConditions = useCallback((next: string[]) => {
    setConditions(next)
    scheduleSave(flags, next)
  }, [flags, scheduleSave])

  // ── Surgery helpers ────────────────────────────────────────────
  const [newSurgery, setNewSurgery] = useState("")
  const addSurgery = () => {
    const v = newSurgery.trim()
    if (!v) return
    const prefixed = `surgery:${v}`
    if (conditions.includes(prefixed)) {
      setNewSurgery("")
      return
    }
    updateConditions([...conditions, prefixed])
    setNewSurgery("")
  }
  const removeSurgery = (entry: string) => {
    updateConditions(conditions.filter((c) => c !== `surgery:${entry}`))
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{tr ? "Tıbbi Geçmiş" : "Medical History"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {tr
              ? "Kritik durumlar, kronik hastalıklar, cerrahi geçmiş. Değişiklikler otomatik kaydedilir."
              : "Critical flags, chronic conditions, surgical history. Changes auto-save."}
          </p>
        </div>
        <SaveStatusChip status={saveStatus} lang={lang} />
      </div>

      {/* ── Critical flags block ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{tr ? "Kritik Durumlar" : "Critical Flags"}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {tr
                ? "Bu bilgiler ilaç ekleme sırasında otomatik güvenlik kontrolü için kullanılır (kontrendikasyon taraması)."
                : "These fields drive the automatic safety matrix on every new medication (contraindication screen)."}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Pregnancy — female only. Same gate as the sidebar's Üreme
              Sağlığı tab visibility. Male profiles don't see this row at
              all; the checkbox has no meaning for them. */}
          {isFemale && (
            <FlagRow
              id="flag-pregnant"
              checked={flags.is_pregnant}
              label={tr ? "Hamilelik" : "Pregnancy"}
              onChange={(v) => toggleFlag("is_pregnant", v)}
            />
          )}
          {isFemale && (
            <FlagRow
              id="flag-breastfeeding"
              checked={flags.is_breastfeeding}
              label={tr ? "Emzirme" : "Breastfeeding"}
              onChange={(v) => toggleFlag("is_breastfeeding", v)}
            />
          )}
          {/* Kidney + liver — always visible. Both are plain yes/no
              booleans on user_profiles; the safety matrix reads them
              as cross-check signals (NSAID + kidney, statin + liver). */}
          <FlagRow
            id="flag-kidney"
            checked={flags.kidney_disease}
            label={tr ? "Böbrek yetmezliği" : "Kidney disease"}
            onChange={(v) => toggleFlag("kidney_disease", v)}
          />
          <FlagRow
            id="flag-liver"
            checked={flags.liver_disease}
            label={tr ? "Karaciğer yetmezliği" : "Liver disease"}
            onChange={(v) => toggleFlag("liver_disease", v)}
          />
        </div>
      </div>

      {/* ── Chronic conditions ───────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">
          {tr ? "Kronik Hastalıklar" : "Chronic Conditions"}
        </h3>
        <ChronicConditionsEditor
          conditions={chronicEntries}
          medications={medications.map((m) => ({
            brand_name: m.brand_name ?? null,
            generic_name: m.generic_name ?? null,
          }))}
          onToggle={(id) => {
            // Toggle means add-if-absent / remove-if-present. Editor
            // hands us the bare condition string (no prefix); we only
            // touch chronic entries here so surgery + family rows are
            // preserved untouched.
            const bare = conditions.filter(
              (c) => !c.startsWith("surgery:") && !c.startsWith("family:"),
            )
            const family = conditions.filter((c) => c.startsWith("family:"))
            const surgery = conditions.filter((c) => c.startsWith("surgery:"))
            const present = bare.includes(id)
            const nextBare = present ? bare.filter((c) => c !== id) : [...bare, id]
            updateConditions([...nextBare, ...surgery, ...family])
          }}
          onAdd={(id) => {
            if (conditions.includes(id)) return
            updateConditions([...conditions, id])
          }}
          lang={lang}
        />
      </div>

      {/* ── Surgery chips ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">
          {tr ? "Cerrahi Geçmiş" : "Surgical History"}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {tr
            ? "Geçirdiğin ameliyatları ekle (ör. safra kesesi, bariatrik, apandisit)."
            : "Add any surgeries you've had (e.g. gallbladder, bariatric, appendectomy)."}
        </p>
        <div className="flex gap-2 mb-3">
          <Input
            value={newSurgery}
            onChange={(e) => setNewSurgery(e.target.value)}
            placeholder={tr ? "Örn. Safra kesesi" : "e.g. Gallbladder"}
            className="h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addSurgery()
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={addSurgery}
            disabled={!newSurgery.trim()}
            className="shrink-0 gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {tr ? "Ekle" : "Add"}
          </Button>
        </div>
        {surgeryEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {tr ? "Henüz cerrahi kaydı yok." : "No surgeries recorded yet."}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {surgeryEntries.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium"
              >
                🔪 {s}
                <button
                  type="button"
                  onClick={() => removeSurgery(s)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  aria-label={tr ? "Kaldır" : "Remove"}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function FlagRow({
  id, checked, label, onChange,
}: {
  id: string
  checked: boolean
  label: string
  onChange: (v: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
}

function SaveStatusChip({ status, lang }: { status: "idle" | "saving" | "saved" | "error"; lang: "tr" | "en" }) {
  const tr = lang === "tr"
  if (status === "idle") return null
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
        <Loader2 className="h-3 w-3 animate-spin" />
        {tr ? "Kaydediliyor…" : "Saving…"}
      </span>
    )
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        <Check className="h-3 w-3" />
        {tr ? "Kaydedildi" : "Saved"}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
      <AlertCircle className="h-3 w-3" />
      {tr ? "Hata" : "Error"}
    </span>
  )
}
