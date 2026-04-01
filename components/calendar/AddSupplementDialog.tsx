// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Loader2, Leaf, ShieldCheck, ShieldAlert, ShieldX, Clock, X, Search, Bell } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { getSupplementDisplayName, findSupplementInfo, parseDoseToMg, formatDoseWithUnit, SUPPLEMENT_NAME_MAP, SUPPLEMENT_NAME_TR, type SupplementInfo } from "@/lib/supplement-data"

interface AddSupplementDialogProps {
  userId: string
  lang: Lang
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

interface SupplementCheck {
  supplement: string
  safety: "safe" | "caution" | "dangerous"
  recommendedDose: string
  frequency: string
  personalizedNote: string
  warningMessage: string | null
  interactions: string[]
  evidenceGrade: "A" | "B" | "C"
}

interface SavedSupplement {
  id: string
  event_type: string
  title: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
}

const FREQ_MAP: Record<string, string> = {
  "once daily": "günde bir kez", "twice daily": "günde iki kez", "three times daily": "günde üç kez",
  "daily": "günlük", "weekly": "haftalık", "as needed": "gerektiğinde",
  "with meals": "yemeklerle birlikte", "before meals": "yemeklerden önce", "after meals": "yemeklerden sonra",
  "with food": "yemekle birlikte", "on empty stomach": "aç karnına", "before bed": "yatmadan önce",
}
function translateSupDesc(desc: string, tr: boolean): string {
  if (!tr || !desc) return desc
  let result = desc
  for (const [en, trVal] of Object.entries(FREQ_MAP)) {
    result = result.replace(new RegExp(en, "gi"), trVal)
  }
  return result
}

// Catalog loaded from JSON at runtime
let _catalogCache: string[] | null = null
async function loadCatalog(): Promise<string[]> {
  if (_catalogCache) return _catalogCache
  try {
    const res = await fetch("/supplements-catalog.json")
    if (!res.ok) return []
    const data = await res.json()
    const items: string[] = []
    for (const cat of Object.values(data.categories) as Array<{ items: string[] }>) {
      items.push(...cat.items)
    }
    _catalogCache = items
    return items
  } catch {
    return []
  }
}

export function AddSupplementDialog({ userId, lang, open, onOpenChange, onSaved }: AddSupplementDialogProps) {
  const tr = lang === "tr"
  const [query, setQuery] = useState("")
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checkResult, setCheckResult] = useState<SupplementCheck | null>(null)
  const [time, setTime] = useState("")
  const [enableReminder, setEnableReminder] = useState(false)
  const [customDose, setCustomDose] = useState("")
  const [customCycleDays, setCustomCycleDays] = useState<number | null>(null)
  const [suppInfo, setSuppInfo] = useState<SupplementInfo | null>(null)
  const [savedSupplements, setSavedSupplements] = useState<SavedSupplement[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [catalog, setCatalog] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load catalog once
  useEffect(() => {
    loadCatalog().then(setCatalog)
  }, [])

  // Dropdown suggestions — filter catalog by query, show translated names
  const dropdownItems = useMemo(() => {
    if (!query || query.length < 1) return []
    const q = query.toLowerCase()
    const savedNames = savedSupplements.map(s => s.title.toLowerCase())

    const matches: Array<{ en: string; display: string }> = []
    const seen = new Set<string>()

    // Search in catalog
    for (const name of catalog) {
      const lower = name.toLowerCase()
      if (seen.has(lower)) continue
      if (savedNames.some(s => lower.includes(s) || s.includes(lower))) continue

      // Extract clean name (remove parenthetical)
      const cleanName = name.split("(")[0].trim()
      const displayName = getSupplementDisplayName(cleanName, lang)

      if (lower.includes(q) || displayName.toLowerCase().includes(q)) {
        seen.add(lower)
        matches.push({ en: name, display: displayName !== cleanName ? displayName : name })
      }
    }

    // Also check TR→EN map for Turkish queries
    for (const [trName, enName] of Object.entries(SUPPLEMENT_NAME_MAP)) {
      if (trName.includes(q) && !seen.has(enName.toLowerCase())) {
        if (!savedNames.some(s => s.includes(enName.toLowerCase()))) {
          seen.add(enName.toLowerCase())
          matches.push({ en: enName, display: tr ? trName.charAt(0).toUpperCase() + trName.slice(1) : enName })
        }
      }
    }
    return matches.slice(0, 10)
  }, [query, savedSupplements, catalog, lang, tr])

  // Load saved supplements
  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true)
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .eq("event_type", "supplement")
        .order("created_at", { ascending: false })
        .limit(20)
      if (data) setSavedSupplements(data as SavedSupplement[])
    } catch {
      // ignore
    } finally {
      setLoadingSaved(false)
    }
  }, [userId])

  useEffect(() => {
    if (open) {
      fetchSaved()
      setCheckResult(null)
      setQuery("")
      setTime("")
      setCustomDose("")
      setEnableReminder(false)
    }
  }, [open, fetchSaved])

  // Check supplement safety via AI
  const checkSupplement = async (name: string) => {
    if (name.length < 2) return
    setChecking(true)
    setCheckResult(null)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/supplement-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ supplement: name, lang }),
      })
      if (res.ok) {
        const result = await res.json()
        setCheckResult(result as SupplementCheck)
        setCustomDose(result.recommendedDose || "")
        const info = findSupplementInfo(result.supplement || name)
        setSuppInfo(info)
        setCustomCycleDays(info.cycleDays)
      }
    } catch {
      // ignore
    } finally {
      setChecking(false)
    }
  }

  // Show dropdown while typing — AI only on selection or Enter
  const handleQueryChange = (val: string) => {
    setQuery(val)
    setCheckResult(null)
    setShowDropdown(val.length >= 1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.length >= 2 && !checking) {
      setShowDropdown(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      checkSupplement(query)
    }
  }

  const selectFromDropdown = (name: string) => {
    setQuery(name)
    setShowDropdown(false)
    checkSupplement(name)
  }

  // Overdose check for custom dose
  const overdoseWarning = useMemo(() => {
    if (!customDose.trim() || !checkResult) return null
    const info = findSupplementInfo(checkResult.supplement)
    if (info.maxDoseValue === 0) return null
    const userDose = parseDoseToMg(customDose)
    if (userDose <= 0) return null
    if (userDose > info.maxDoseValue) {
      return tr
        ? `Girdiğiniz doz (${customDose}) maksimum güvenli dozun (${info.maxDose}) üzerinde!`
        : `Your dose (${customDose}) exceeds the maximum safe dose (${info.maxDose})!`
    }
    return null
  }, [customDose, checkResult, tr])

  // Save supplement
  const saveSupplement = async () => {
    if (!checkResult) return
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const rawDose = customDose.trim() || checkResult.recommendedDose
      const doseToSave = formatDoseWithUnit(rawDose, checkResult.supplement)
      const info = suppInfo || findSupplementInfo(checkResult.supplement)
      const cycleDays = customCycleDays ?? info.cycleDays
      await supabase.from("calendar_events").insert({
        user_id: userId,
        event_type: "supplement",
        title: checkResult.supplement,
        description: `${doseToSave} · ${checkResult.frequency}`,
        event_date: new Date().toISOString().split("T")[0],
        event_time: (enableReminder && time) ? time : null,
        recurrence: "daily",
        metadata: {
          safety: checkResult.safety,
          dose: doseToSave,
          frequency: checkResult.frequency,
          evidenceGrade: checkResult.evidenceGrade,
          cycleDays: cycleDays,
          breakDays: info.breakDays,
          unlimited: cycleDays === 0,
        },
      })
      onSaved()
      setCheckResult(null)
      setQuery("")
      setTime("")
      setCustomDose("")
      setCustomCycleDays(null)
      setSuppInfo(null)
      setEnableReminder(false)
      fetchSaved()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const safetyConfig = {
    safe: { icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10 border-primary/30", label: tx("supp.safe", lang) },
    caution: { icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", label: tx("supp.caution", lang) },
    dangerous: { icon: ShieldX, color: "text-red-500", bg: "bg-red-500/10 border-red-500/30", label: tx("supp.dangerous", lang) },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            {tx("supp.title", lang)}
          </DialogTitle>
          <DialogDescription>
            {tx("supp.desc", lang)}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={tx("supp.placeholder", lang)}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              autoFocus
            />

            {/* Dropdown suggestions */}
            {showDropdown && !checking && !checkResult && dropdownItems.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border bg-card shadow-xl max-h-56 overflow-y-auto">
                {dropdownItems.map((item) => (
                  <button
                    key={item.en}
                    onClick={() => selectFromDropdown(item.en)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary/5 active:bg-primary/10"
                  >
                    <Leaf className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                    <span className="font-medium">{item.display}</span>
                    {item.display !== item.en && (
                      <span className="ml-auto text-[10px] text-muted-foreground/50">{item.en}</span>
                    )}
                  </button>
                ))}
                {/* Always show "analyze custom" option at bottom */}
                {query.length >= 2 && (
                  <button
                    onClick={() => { setShowDropdown(false); checkSupplement(query) }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm border-t transition-colors hover:bg-muted/50"
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{tx("supp.analyzeCustom", lang)} &quot;{query}&quot;</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Hint */}
          {!query && !checkResult && !checking && (
            <p className="text-xs text-muted-foreground text-center py-2">
              {tx("supp.hint", lang)}
            </p>
          )}

          {/* Loading */}
          {checking && (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {tx("supp.checking", lang)}
              </span>
            </div>
          )}

          {/* Result */}
          {checkResult && !checking && (
            <div className="space-y-3">
              {/* Safety badge */}
              <div className={`rounded-xl border p-4 ${safetyConfig[checkResult.safety].bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  {(() => { const Icon = safetyConfig[checkResult.safety].icon; return <Icon className={`h-5 w-5 ${safetyConfig[checkResult.safety].color}`} /> })()}
                  <span className={`font-semibold ${safetyConfig[checkResult.safety].color}`}>
                    {getSupplementDisplayName(checkResult.supplement, lang)} — {safetyConfig[checkResult.safety].label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {tx("evidence.grade", lang)} {checkResult.evidenceGrade}
                  </span>
                </div>

                {/* Personalized note */}
                <p className="text-sm text-foreground/80 mt-2">
                  {checkResult.personalizedNote}
                </p>

                {/* Warning */}
                {checkResult.warningMessage && (
                  <div className="mt-2 rounded-lg bg-card/50 p-3">
                    <p className={`text-sm ${checkResult.safety === "dangerous" ? "text-red-500" : "text-amber-600 dark:text-amber-400"}`}>
                      {checkResult.warningMessage}
                    </p>
                  </div>
                )}

                {/* Interactions */}
                {checkResult.interactions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {tx("supp.interactions", lang)}
                    </p>
                    {checkResult.interactions.map((int, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {int}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Dose adjustment + time — only for non-dangerous */}
              {checkResult.safety !== "dangerous" && (
                <div className="space-y-3 rounded-xl border p-4">
                  {/* Dose input */}
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">
                      {tx("supp.doseLabel", lang)}
                    </Label>
                    <input
                      type="text"
                      value={customDose}
                      onChange={(e) => setCustomDose(e.target.value)}
                      onBlur={() => {
                        // Auto-format: if user typed just a number, add unit
                        if (customDose && checkResult) {
                          setCustomDose(formatDoseWithUnit(customDose, checkResult.supplement))
                        }
                      }}
                      placeholder={checkResult.recommendedDose}
                      className={`w-full rounded-lg border bg-background px-3 py-2.5 text-base font-medium outline-none focus:ring-2 ${
                        overdoseWarning
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "focus:border-primary focus:ring-primary/20"
                      }`}
                    />
                    <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                      <p className="text-sm text-primary font-medium">
                        🤖 {tx("supp.suggestion", lang)}
                      </p>
                      <p className="text-sm text-foreground/80 mt-0.5">
                        {checkResult.recommendedDose} · {checkResult.frequency}
                      </p>
                    </div>
                  </div>

                  {/* Overdose warning */}
                  {overdoseWarning && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5">
                      <ShieldX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      <p className="text-xs text-red-600 dark:text-red-400">{overdoseWarning}</p>
                    </div>
                  )}

                  {/* Time input — merged with reminder */}
                  <div>
                    <Label className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {tx("supp.timing", lang)}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
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
                    {/* Reminder toggle — only shows when time is set */}
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
                </div>
              )}

              {/* Cycle/Break info + customization */}
              {checkResult.safety !== "dangerous" && suppInfo && (
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold">
                      {tx("supp.cycleLabel", lang)}
                    </span>
                  </div>

                  {/* Cycle recommendation */}
                  <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 px-3 py-2">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      🤖 {tx("supp.suggestion", lang)}: {" "}
                      {suppInfo.cycleDays > 0
                        ? (tr
                            ? `${suppInfo.cycleDays} gün kullanın, ${suppInfo.breakDays} gün mola verin`
                            : `Use for ${suppInfo.cycleDays} days, take ${suppInfo.breakDays}-day break`)
                        : tx("supp.unlimited", lang)
                      }
                    </p>
                  </div>

                  {/* Custom cycle days */}
                  <div className="flex items-center gap-3">
                    <Label className="text-xs font-medium whitespace-nowrap">
                      {tx("supp.cycleDuration", lang)}
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={customCycleDays ?? suppInfo.cycleDays}
                        onChange={(e) => {
                          const v = parseInt(e.target.value)
                          setCustomCycleDays(isNaN(v) ? 0 : v)
                        }}
                        className="w-16 rounded-lg border bg-background px-2 py-1.5 text-sm text-center outline-none focus:border-primary"
                      />
                      <span className="text-xs text-muted-foreground">{tx("supp.days", lang)}</span>
                    </div>
                    {suppInfo.breakDays > 0 && (
                      <span className="text-xs text-muted-foreground">
                        + {suppInfo.breakDays} {tx("supp.dayBreak", lang)}
                      </span>
                    )}
                  </div>

                  {customCycleDays === 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      {tx("supp.cycleZero", lang)}
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {checkResult.safety === "dangerous" ? (
                  <Button variant="destructive" className="flex-1" onClick={() => { setCheckResult(null); setQuery("") }}>
                    {tx("supp.tryDiff", lang)}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => { setCheckResult(null); setQuery(""); setCustomDose("") }}>
                      {tx("cal.cancel", lang)}
                    </Button>
                    <Button className="flex-1" onClick={saveSupplement} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Leaf className="h-4 w-4 mr-1" />}
                      {tx("supp.addToList", lang)}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Saved supplements list */}
        {!checkResult && !checking && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-foreground mb-2">
              {tx("supp.active", lang)}
            </h4>
            {loadingSaved ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : savedSupplements.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                {tx("supp.empty", lang)}
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {savedSupplements.map((sup) => {
                  const safety = (sup.metadata as Record<string, string>)?.safety || "safe"
                  const cfg = safetyConfig[safety as keyof typeof safetyConfig] || safetyConfig.safe
                  return (
                    <div key={sup.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                      {(() => { const Icon = cfg.icon; return <Icon className={`h-4 w-4 ${cfg.color}`} /> })()}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getSupplementDisplayName(sup.title, lang)}</p>
                        {sup.description && <p className="text-xs text-muted-foreground truncate">{translateSupDesc(sup.description, tr)}</p>}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const supabase = createBrowserClient()
                            await supabase.from("calendar_events").delete().eq("id", sup.id)
                            fetchSaved()
                            onSaved()
                          } catch (e) {
                            console.error("Failed to remove supplement:", e)
                          }
                        }}
                        className="text-muted-foreground/40 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
