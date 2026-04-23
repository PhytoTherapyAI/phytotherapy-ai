// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 2.2: Medications tab. Carries every medication
// flow the legacy profile surface had, wired to the persistent
// F-SAFETY-002.2 banner.
//
//   - medication list (read from useProfileData)
//   - inline add form with brand autocomplete (+ DEFAULT_DOSES hint)
//   - "İlaç Tara" scanner toggle (MedicationScanner — refetch on found,
//      no pre-fill form to avoid the legacy duplicate-insert risk)
//   - remove (soft delete via is_active=false) with auto-resolve
//   - 24-h "ilaçlarım güncel" confirm button (3-state: alert-locked /
//     confirmed-green / primary-outline)
//   - F-SAFETY-002.2 banner above Aktif İlaçlar card
//      + mount-time fetchActiveInteractionAlert (alertRestoredRef guard)
//      + checkInteractionsAfterChange after every successful insert
//      + autoResolveAlertsForMedication on remove
//      + global safety:med-added listener (scanner + 15-day dialog)
//      + dismiss / resolve DB writes via banner callbacks
//
// ShellV2 ↔ Legacy is a page-level fork (`?legacy=true`) so these two
// flows NEVER mount at the same time; the duplicate-insert / double-
// banner concern İpek raised is structurally impossible.
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Pill, Plus, Trash2, X, Loader2, Check, CheckCircle2, AlertTriangle,
  ScanBarcode, Search,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MedicationScanner } from "@/components/scanner/MedicationScanner"
import { MedicationInteractionBanner } from "@/components/safety/MedicationInteractionBanner"
import { AskDoctorModal } from "@/components/safety/AskDoctorModal"
import {
  checkInteractionsAfterChange,
  fetchActiveInteractionAlert,
  dismissInteractionAlert,
  resolveInteractionAlert,
  autoResolveAlertsForMedication,
  type InteractionCheckResult,
} from "@/lib/safety/check-med-interactions"
import { normalizeMedFields } from "@/lib/safety/normalize-med-name"
import { tx } from "@/lib/translations"
import { readDraft, persistDraft, clearDraft, DRAFT_KEYS } from "@/lib/ui/draft-persist"
import type { UserMedication } from "@/lib/database.types"

// F-SAFETY-001 post-launch feature flag mirrored here — the legacy
// profile page owns the canonical declaration, but the tab needs its
// own read so the banner + loading / rate-limit toasts can be gated
// without importing from app/profile/page.tsx.
const SAFETY_BANNER_ENABLED = process.env.NEXT_PUBLIC_SAFETY_BANNER !== "false"

interface DrugSuggestion {
  brandName: string
  genericName: string
}

// Default dosage hints for the handful of meds where autocomplete can
// autofill a plausible starting point. Kept identical to the legacy
// page so a med added there and here presents the same pre-fill.
const DEFAULT_DOSES: Record<string, { dosage: string; frequency: string }> = {
  metformin:        { dosage: "500mg", frequency: "Günde 2 kez" },
  atorvastatin:     { dosage: "20mg",  frequency: "Günde 1 kez" },
  lisinopril:       { dosage: "10mg",  frequency: "Günde 1 kez" },
  amlodipine:       { dosage: "5mg",   frequency: "Günde 1 kez" },
  levothyroxine:    { dosage: "50mcg", frequency: "Sabah aç karna" },
  warfarin:         { dosage: "5mg",   frequency: "Günde 1 kez" },
  isotretinoin:     { dosage: "10mg",  frequency: "Günlük" },
  roaccutane:       { dosage: "10mg",  frequency: "Günlük" },
  zoretanin:        { dosage: "10mg",  frequency: "Günlük" },
}

const MED_CONFIRM_KEY = "phyto_med_profile_confirmed"
function isMedRecentlyConfirmed(): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = localStorage.getItem(MED_CONFIRM_KEY)
    if (!stored) return false
    const confirmedAt = new Date(stored).getTime()
    return Date.now() - confirmedAt < 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

interface MedicationsTabProps {
  lang: "tr" | "en"
  userId: string
  canEdit: boolean
  patientName?: string | null
  medications: UserMedication[]
  setMedications: React.Dispatch<React.SetStateAction<UserMedication[]>>
  refetch: () => Promise<void>
}

export function MedicationsTab({
  lang, userId, canEdit, patientName,
  medications, setMedications, refetch,
}: MedicationsTabProps) {
  const tr = lang === "tr"

  // ── Add-form state ─────────────────────────────────────────────
  // F-DRAFT-001: medication-add draft restored from sessionStorage on
  // mount via lazy useState initializers. Four `useState` calls read
  // the same JSON blob once each — negligible (< 1 KB) and guarantees
  // the inputs render full on the first frame (no empty → filled
  // flash). Key is user-scoped so multi-user browsers can't leak
  // drafts across logout/login.
  const medDraftKey = userId ? `${DRAFT_KEYS.profileMedicationAdd}:${userId}` : null
  type MedDraft = {
    brand: string
    generic: string
    dosage: string
    frequency: string
  }
  const readMedDraft = (): MedDraft | null =>
    medDraftKey ? readDraft<MedDraft>(medDraftKey) : null
  const [isAddingMed, setIsAddingMed] = useState(false)
  const [savingMed, setSavingMed] = useState(false)
  const [newBrandName, setNewBrandName] = useState<string>(() => readMedDraft()?.brand ?? "")
  const [newGenericName, setNewGenericName] = useState<string>(() => readMedDraft()?.generic ?? "")
  const [newDosage, setNewDosage] = useState<string>(() => readMedDraft()?.dosage ?? "")
  const [newFrequency, setNewFrequency] = useState<string>(() => readMedDraft()?.frequency ?? "")
  const [autoDoseBadge, setAutoDoseBadge] = useState(false)

  // F-DRAFT-001: persist every keystroke while the form is open.
  // Gating by `isAddingMed` avoids writing an empty baseline on mount
  // if the user never opens the form — keeps sessionStorage tidy.
  // Gating by draftKey guards the auth-loading edge case (userId "")
  // where the suffix would collapse to a shared key.
  useEffect(() => {
    if (!isAddingMed || !medDraftKey) return
    persistDraft<MedDraft>(medDraftKey, {
      brand: newBrandName,
      generic: newGenericName,
      dosage: newDosage,
      frequency: newFrequency,
    })
  }, [isAddingMed, medDraftKey, newBrandName, newGenericName, newDosage, newFrequency])

  // ── Autocomplete (brand search) ─────────────────────────────────
  const [suggestions, setSuggestions] = useState<DrugSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const brandInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/drug-search?q=${encodeURIComponent(query)}`)
      const data: DrugSuggestion[] = await res.json()
      setSuggestions(data)
      setShowSuggestions(data.length > 0)
      setHighlightIndex(-1)
    } catch {
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newBrandName.trim())
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [newBrandName, fetchSuggestions])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
        && brandInputRef.current && !brandInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectSuggestion = (s: DrugSuggestion) => {
    setNewBrandName(s.brandName)
    if (s.genericName && s.genericName.toLowerCase() !== s.brandName.toLowerCase()) {
      setNewGenericName(s.genericName)
    }
    const generic = (s.genericName || s.brandName).toLowerCase()
    const brand = s.brandName.toLowerCase()
    const match = Object.entries(DEFAULT_DOSES).find(([key]) =>
      generic.includes(key) || brand.includes(key),
    )
    if (match) {
      setNewDosage(match[1].dosage)
      setNewFrequency(match[1].frequency)
      setAutoDoseBadge(true)
      setTimeout(() => setAutoDoseBadge(false), 2500)
    }
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleBrandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1))
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[highlightIndex])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  // ── Scanner ────────────────────────────────────────────────────
  const [showScanner, setShowScanner] = useState(false)

  // ── 24-h "ilaçlarım güncel" confirm ─────────────────────────────
  const [medConfirmed, setMedConfirmed] = useState<boolean>(() => isMedRecentlyConfirmed())
  const [confirming, setConfirming] = useState(false)
  const confirmMedicationsCurrent = async () => {
    if (!canEdit) return
    setConfirming(true)
    try {
      const supabase = createBrowserClient()
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", userId)
      localStorage.setItem(MED_CONFIRM_KEY, new Date().toISOString())
      setMedConfirmed(true)
    } catch { /* soft fail */ }
    finally { setConfirming(false) }
  }

  // ── F-SAFETY-002.2 state + effects ─────────────────────────────
  const [medInteractionAlert, setMedInteractionAlert] = useState<InteractionCheckResult | null>(null)
  const [medInteractionLoading, setMedInteractionLoading] = useState(false)
  const [medInteractionRateLimited, setMedInteractionRateLimited] = useState(false)
  // F-SAFETY-002.3: mailto fallback modal state. Opens when the banner's
  // "Doktoruma Sor" CTA fires — deterministic replacement for the old
  // silent `window.location.href = mailto:` path that failed on Opera GX
  // and on any browser without a default mail handler.
  const [askDoctorOpen, setAskDoctorOpen] = useState(false)

  const triggerSafetyCheck = useCallback(() => {
    setMedInteractionAlert(null)
    setMedInteractionRateLimited(false)
    if (!userId) return
    void checkInteractionsAfterChange({
      userId,
      lang,
      onLoadingStart: () => setMedInteractionLoading(true),
      onResult: (result) => {
        setMedInteractionLoading(false)
        if (result.dangerous.length > 0 || result.caution.length > 0) {
          setMedInteractionAlert(result)
        }
      },
      onRateLimited: () => setMedInteractionRateLimited(true),
      onError: () => setMedInteractionLoading(false),
    })
  }, [userId, lang])

  // Restore an unresolved, undismissed alert across refresh.
  const alertRestoredRef = useRef<string | null>(null)
  useEffect(() => {
    if (!userId) return
    if (alertRestoredRef.current === userId) return
    alertRestoredRef.current = userId
    void fetchActiveInteractionAlert(userId).then((alert) => {
      if (alert) setMedInteractionAlert(alert)
    })
  }, [userId])

  // Global event from scanner + 15-day dialog inserts.
  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => triggerSafetyCheck()
    window.addEventListener("safety:med-added", handler)
    return () => window.removeEventListener("safety:med-added", handler)
  }, [triggerSafetyCheck])

  // ── Add medication ─────────────────────────────────────────────
  const addMedication = async () => {
    if (!newBrandName.trim() || !canEdit) return
    setSavingMed(true)
    try {
      const cleaned = normalizeMedFields({
        brand_name: newBrandName,
        generic_name: newGenericName,
      })
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("user_medications")
        .insert({
          user_id: userId,
          brand_name: cleaned.brand_name,
          generic_name: cleaned.generic_name,
          dosage: newDosage.trim() || null,
          frequency: newFrequency.trim() || null,
          is_active: true,
        })
        .select()
        .single()
      if (error) {
        setSavingMed(false)
        return
      }
      if (data) setMedications((prev) => [...prev, data as UserMedication])
      // F-DRAFT-001: wipe the draft now that the row landed in the DB.
      // Cancel (X button) intentionally leaves the draft intact —
      // matches the Session 39 FamilyHistorySection "restore on reopen"
      // behaviour and keeps a mis-clicked close recoverable.
      if (medDraftKey) clearDraft(medDraftKey)
      setNewBrandName("")
      setNewGenericName("")
      setNewDosage("")
      setNewFrequency("")
      setIsAddingMed(false)
      // Reset the 24-h confirm — user just changed the regimen, the
      // previous "güncel" click no longer applies.
      setMedConfirmed(false)
      triggerSafetyCheck()
    } finally {
      setSavingMed(false)
    }
  }

  // ── Remove medication (soft delete + auto-resolve) ─────────────
  const removeMedication = async (id: string) => {
    if (!canEdit) return
    try {
      const removed = medications.find((m) => m.id === id)
      const medName = (removed?.generic_name || removed?.brand_name || "").trim()

      const supabase = createBrowserClient()
      const { error } = await supabase
        .from("user_medications")
        .update({ is_active: false })
        .eq("id", id)
      if (error) return
      setMedications((prev) => prev.filter((m) => m.id !== id))

      // Sweep any open alert that referenced this med.
      if (userId && medName) {
        void autoResolveAlertsForMedication(userId, medName)
        if (medInteractionAlert) {
          const needle = medName.toLowerCase()
          const touched = [
            ...medInteractionAlert.dangerous,
            ...medInteractionAlert.caution,
          ].some((e) =>
            (e.source?.toLowerCase() ?? "").includes(needle)
            || (e.target?.toLowerCase() ?? "").includes(needle),
          )
          if (touched) setMedInteractionAlert(null)
        }
      }
    } catch { /* soft fail */ }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{tr ? "İlaçlarım" : "My Medications"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tr
            ? "Aktif ilaçlarını yönet. Her ekleme sonrası otomatik güvenlik taraması çalışır."
            : "Manage your active medications. An automatic safety screen runs after every add."}
        </p>
      </div>

      {/* F-SAFETY-002.2 fixed-position toasts */}
      {medInteractionRateLimited && (
        <div className="fixed bottom-24 right-4 z-40 bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 px-4 py-2 rounded-lg shadow-lg text-xs max-w-sm border border-blue-200 dark:border-blue-800">
          {tr
            ? "Etkileşim kontrolü şu an yoğun, birkaç dakika sonra otomatik tekrar denenecek."
            : "Interaction check is busy right now — we'll retry automatically in a few minutes."}
        </div>
      )}
      {medInteractionLoading && (
        <div className="fixed bottom-20 right-4 z-40 bg-card border border-border text-foreground px-4 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {tr ? "Etkileşimler kontrol ediliyor…" : "Checking interactions…"}
        </div>
      )}

      {/* F-SAFETY-002.2 banner — mounts directly above the medications
          card. Banner's own useEffect smooth-scrolls + flashes a ring
          when mounted or when the first edge changes, so even a user
          already scrolled elsewhere in the tab sees it. */}
      {SAFETY_BANNER_ENABLED && medInteractionAlert && (
        <MedicationInteractionBanner
          dangerous={medInteractionAlert.dangerous}
          caution={medInteractionAlert.caution}
          summary={medInteractionAlert.summary}
          lang={lang}
          alertId={medInteractionAlert.alertId}
          patientName={patientName ?? null}
          onDismiss={() => {
            if (medInteractionAlert.alertId) {
              void dismissInteractionAlert(medInteractionAlert.alertId)
            }
            setMedInteractionAlert(null)
          }}
          onResolve={medInteractionAlert.alertId ? async () => {
            await resolveInteractionAlert(medInteractionAlert.alertId!)
            setMedInteractionAlert(null)
            setMedConfirmed(false)
          } : undefined}
          // F-SAFETY-002.3: replace the banner's native mailto fallback
          // with a deterministic modal. Banner default still ships for
          // other mounts that don't pass this prop (none today, but the
          // prop contract stays open for future callers).
          onAskDoctor={() => setAskDoctorOpen(true)}
        />
      )}

      {/* F-SAFETY-002.3: ask-doctor fallback modal. Mounts near the
          banner so the edges array reuses the same alert state. */}
      {medInteractionAlert && (
        <AskDoctorModal
          open={askDoctorOpen}
          onOpenChange={setAskDoctorOpen}
          edges={[...medInteractionAlert.dangerous, ...medInteractionAlert.caution]}
          summary={medInteractionAlert.summary}
          patientName={patientName ?? null}
          lang={lang}
        />
      )}

      {/* Aktif İlaçlar card */}
      <Card className={`rounded-xl shadow-sm scroll-mt-20 ${
        medications.length > 0 ? "border-l-4 border-l-green-500" : ""
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-5 w-5 text-primary" />
              {tr ? "Aktif İlaçlar" : "Active Medications"}
              <span className="text-xs font-normal text-muted-foreground">
                ({medications.length})
              </span>
            </CardTitle>
            {canEdit && (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8"
                  onClick={() => setShowScanner((v) => !v)}
                >
                  <ScanBarcode className="h-3.5 w-3.5" />
                  {tr ? "İlaç Tara" : "Scan"}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 h-8"
                  onClick={() => setIsAddingMed((v) => !v)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {tr ? "Ekle" : "Add"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Scanner — safety:med-added dispatch lives inside the
              component; the callback here just forces a refetch so the
              list reflects the freshly-scanned row. No pre-fill of the
              add form = no duplicate-insert risk. */}
          {showScanner && (
            <MedicationScanner
              userId={userId}
              lang={lang}
              onMedicationFound={() => {
                void refetch()
                setShowScanner(false)
              }}
            />
          )}

          {/* Medication list */}
          {medications.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">
              {tr
                ? "Henüz ilaç kaydı yok. \"Ekle\" veya \"İlaç Tara\" ile başlayabilirsin."
                : "No medications recorded yet. Start with \"Add\" or \"Scan\"."}
            </p>
          ) : (
            <ul className="space-y-2">
              {medications.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/60 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      {m.brand_name || m.generic_name || "—"}
                    </p>
                    {m.generic_name && m.brand_name
                      && m.generic_name.toLowerCase() !== m.brand_name.toLowerCase() && (
                      <p className="text-xs text-muted-foreground">{m.generic_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[m.dosage, m.frequency].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => removeMedication(m.id)}
                      aria-label={tr ? "Sil" : "Remove"}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Inline add form */}
          {isAddingMed && canEdit && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-primary">
                  {tr ? "Yeni ilaç" : "New medication"}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddingMed(false)}
                  className="p-1 rounded-md text-muted-foreground hover:bg-muted"
                  aria-label={tr ? "Kapat" : "Close"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Label htmlFor="new-brand" className="text-xs">
                    {tr ? "Marka adı" : "Brand name"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-brand"
                      ref={brandInputRef}
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      onKeyDown={handleBrandKeyDown}
                      placeholder={tr ? "Örn. Parol" : "e.g. Parol"}
                      className="h-9 pr-8"
                      autoComplete="off"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    )}
                    {!isSearching && newBrandName.length >= 2 && (
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    )}
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-10 w-full mt-1 rounded-lg border border-border bg-popover shadow-md max-h-48 overflow-y-auto"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={`${s.brandName}-${i}`}
                          type="button"
                          onClick={() => selectSuggestion(s)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                            i === highlightIndex ? "bg-muted" : ""
                          }`}
                        >
                          <span className="font-medium">{s.brandName}</span>
                          {s.genericName && s.genericName !== s.brandName && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({s.genericName})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="new-generic" className="text-xs">
                    {tr ? "Jenerik adı (opsiyonel)" : "Generic name (optional)"}
                  </Label>
                  <Input
                    id="new-generic"
                    value={newGenericName}
                    onChange={(e) => setNewGenericName(e.target.value)}
                    className="h-9"
                    autoComplete="off"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="new-dosage" className="text-xs">
                      {tr ? "Doz" : "Dosage"}
                      {autoDoseBadge && (
                        <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                          {tr ? "• otomatik" : "• auto"}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="new-dosage"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      placeholder="500mg"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-frequency" className="text-xs">
                      {tr ? "Sıklık" : "Frequency"}
                    </Label>
                    <Input
                      id="new-frequency"
                      value={newFrequency}
                      onChange={(e) => setNewFrequency(e.target.value)}
                      placeholder={tr ? "Günde 2 kez" : "Twice a day"}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full gap-1.5"
                onClick={addMedication}
                disabled={savingMed || !newBrandName.trim()}
              >
                {savingMed ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                {tr ? "Kaydet" : "Save"}
              </Button>
            </div>
          )}

          {/* 24-h confirm — 3-state: alert-lock (amber) / confirmed
              (green) / primary-outline. Matches the LegacyProfilePage
              F-SAFETY-002.2 behaviour one-to-one. */}
          <div className="pt-1">
            <Button
              variant={medInteractionAlert
                ? "outline"
                : medConfirmed ? "default" : "outline"}
              size="sm"
              className={`gap-2 ${
                medInteractionAlert
                  ? "border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 cursor-not-allowed"
                  : medConfirmed
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "border-primary/30 text-primary hover:bg-primary/10"
              }`}
              onClick={medInteractionAlert ? undefined : confirmMedicationsCurrent}
              disabled={confirming || medConfirmed || !!medInteractionAlert}
            >
              {medInteractionAlert
                ? <AlertTriangle className="h-4 w-4" />
                : confirming
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : medConfirmed
                    ? <Check className="h-4 w-4" />
                    : <CheckCircle2 className="h-4 w-4" />}
              {medInteractionAlert
                ? (tr ? "İncelemeyi bekliyor" : "Review pending")
                : medConfirmed
                  ? tx("profile.confirmed", lang)
                  : tx("profile.confirmCurrent", lang)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
