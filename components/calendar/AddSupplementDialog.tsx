"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, Leaf, ShieldCheck, ShieldAlert, ShieldX, Clock, X, Search } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

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

const POPULAR_SUPPLEMENTS = [
  "Omega-3", "Vitamin D", "Magnesium", "Zinc", "Iron",
  "B12", "Probiotics", "Turmeric", "Ashwagandha", "Melatonin",
  "Vitamin C", "Coenzyme Q10", "Creatine", "Collagen", "Fish Oil",
]

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

export function AddSupplementDialog({ userId, lang, open, onOpenChange, onSaved }: AddSupplementDialogProps) {
  const tr = lang === "tr"
  const [query, setQuery] = useState("")
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checkResult, setCheckResult] = useState<SupplementCheck | null>(null)
  const [time, setTime] = useState("")
  const [savedSupplements, setSavedSupplements] = useState<SavedSupplement[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

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
    }
  }, [open, fetchSaved])

  // Check supplement safety
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
      }
    } catch {
      // ignore
    } finally {
      setChecking(false)
    }
  }

  // Debounced search
  const handleQueryChange = (val: string) => {
    setQuery(val)
    setCheckResult(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length >= 3) {
      debounceRef.current = setTimeout(() => checkSupplement(val), 800)
    }
  }

  // Save supplement
  const saveSupplement = async () => {
    if (!checkResult) return
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      await supabase.from("calendar_events").insert({
        user_id: userId,
        event_type: "supplement",
        title: checkResult.supplement,
        description: `${checkResult.recommendedDose} · ${checkResult.frequency}`,
        event_date: new Date().toISOString().split("T")[0],
        event_time: time || null,
        recurrence: "daily",
        metadata: {
          safety: checkResult.safety,
          dose: checkResult.recommendedDose,
          frequency: checkResult.frequency,
          evidenceGrade: checkResult.evidenceGrade,
        },
      })
      onSaved()
      // Stay in dialog, reset form for another supplement
      setCheckResult(null)
      setQuery("")
      setTime("")
      fetchSaved()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const safetyConfig = {
    safe: { icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10 border-primary/30", label: tr ? "Güvenli" : "Safe" },
    caution: { icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", label: tr ? "Dikkatli Kullanın" : "Use with Caution" },
    dangerous: { icon: ShieldX, color: "text-red-500", bg: "bg-red-500/10 border-red-500/30", label: tr ? "Önerilmez" : "Not Recommended" },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            {tr ? "Takviye Yönetimi" : "Supplement Manager"}
          </DialogTitle>
          <DialogDescription>
            {tr ? "Takviye arayın, güvenlik kontrolü yapın ve takip listesine ekleyin." : "Search supplements, check safety, and add to your tracking list."}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={tr ? "Takviye adı yazın (ör. Omega-3, D Vitamini)" : "Type supplement name (e.g., Omega-3, Vitamin D)"}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Popular supplements */}
          {!query && !checkResult && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{tr ? "Popüler takviyeler:" : "Popular supplements:"}</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SUPPLEMENTS.slice(0, 10).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); checkSupplement(s) }}
                    className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-primary hover:text-primary active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {checking && (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {tr ? "Proflinize göre analiz ediliyor..." : "Analyzing based on your profile..."}
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
                    {checkResult.supplement} — {safetyConfig[checkResult.safety].label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {tr ? "Kanıt" : "Grade"} {checkResult.evidenceGrade}
                  </span>
                </div>

                {/* Dose recommendation */}
                <div className="rounded-lg bg-card/50 p-3 mt-2">
                  <p className="text-sm font-medium text-foreground">
                    {checkResult.recommendedDose} · {checkResult.frequency}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {checkResult.personalizedNote}
                  </p>
                </div>

                {/* Warning */}
                {checkResult.warningMessage && (
                  <div className="mt-2 rounded-lg bg-card/50 p-3">
                    <p className={`text-sm ${checkResult.safety === "dangerous" ? "text-red-500" : "text-amber-500"}`}>
                      {checkResult.warningMessage}
                    </p>
                  </div>
                )}

                {/* Interactions */}
                {checkResult.interactions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {tr ? "Etkileşimler:" : "Interactions:"}
                    </p>
                    {checkResult.interactions.map((int, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {int}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Time input */}
              {checkResult.safety !== "dangerous" && (
                <div>
                  <Label className="text-sm">{tr ? "Ne zaman alacaksınız?" : "When will you take it?"}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {checkResult.safety === "dangerous" ? (
                  <Button variant="destructive" className="flex-1" onClick={() => { setCheckResult(null); setQuery("") }}>
                    {tr ? "Farklı Takviye Dene" : "Try Different Supplement"}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => { setCheckResult(null); setQuery("") }}>
                      {tx("cal.cancel", lang)}
                    </Button>
                    <Button className="flex-1" onClick={saveSupplement} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Leaf className="h-4 w-4 mr-1" />}
                      {tr ? "Listeye Ekle" : "Add to List"}
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
              {tr ? "Aktif Takviyelerim" : "My Active Supplements"}
            </h4>
            {loadingSaved ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : savedSupplements.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                {tr ? "Henüz takviye eklenmemiş." : "No supplements added yet."}
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
                        <p className="text-sm font-medium truncate">{sup.title}</p>
                        {sup.description && <p className="text-xs text-muted-foreground truncate">{translateSupDesc(sup.description, tr)}</p>}
                      </div>
                      <button
                        onClick={async () => {
                          const supabase = createBrowserClient()
                          await supabase.from("calendar_events").delete().eq("id", sup.id)
                          fetchSaved()
                          onSaved()
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
