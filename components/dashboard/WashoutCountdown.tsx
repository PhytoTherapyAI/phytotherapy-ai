// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Timer, AlertCircle, Settings2, Plus, Bell, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { findSupplementInfo, getSupplementDisplayName } from "@/lib/supplement-data"
import { SupplementDoseDialog } from "./SupplementDoseDialog"
import { ProtocolShareCard } from "@/components/share/ProtocolShareCard"
import { ShareModal } from "@/components/share/ShareModal"

interface WashoutCountdownProps {
  userId: string
  lang: Lang
  isPremium?: boolean
  profileSupplements?: string[]
  onAddSupplement?: () => void
}

interface SupplementCycle {
  id: string
  name: string
  dose: string
  cycleDays: number
  breakDays: number
  daysUsed: number
  daysLeft: number
  percentage: number
  startDate: string
  eventId: string
  reminderTime: string | null
}

function mapToCycles(events: Array<{ id: string; title: string; description: string | null; metadata: unknown; created_at: string; event_time?: string | null }>): SupplementCycle[] {
  const now = new Date()
  return events.map(event => {
    const info = findSupplementInfo(event.title)
    const meta = event.metadata as Record<string, unknown> | null
    const isUnlimited = meta?.unlimited === true || meta?.cycleDays === null
    const customCycleDays = isUnlimited ? 0 : ((meta?.cycleDays as number) || info.cycleDays)
    const customBreakDays = (meta?.breakDays as number) || info.breakDays

    const startDate = new Date(event.created_at)
    // Count days since start (inclusive — today counts as day 1)
    const rawDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysUsed = Math.max(1, rawDays + 1) // Day 1 = creation day
    const daysLeft = customCycleDays === 0 ? -1 : Math.max(0, customCycleDays - daysUsed)
    const percentage = customCycleDays === 0 ? 0 : Math.min((daysUsed / customCycleDays) * 100, 100)
    const dose = (meta?.dose as string) || event.description || ""

    return {
      id: event.id,
      name: event.title,
      dose,
      cycleDays: customCycleDays,
      breakDays: customBreakDays,
      daysUsed,
      daysLeft,
      percentage,
      startDate: event.created_at,
      eventId: event.id,
      reminderTime: event.event_time || null,
    }
  })
}

export function WashoutCountdown({ userId, lang, isPremium = false, profileSupplements = [], onAddSupplement }: WashoutCountdownProps) {
  const [supplements, setSupplements] = useState<SupplementCycle[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSupplement, setEditingSupplement] = useState<SupplementCycle | null>(null)
  const [shareProtocol, setShareProtocol] = useState<SupplementCycle | null>(null)
  const [showAddInput, setShowAddInput] = useState(false)
  const [newSuppName, setNewSuppName] = useState("")
  const [adding, setAdding] = useState(false)

  const fetchSupplements = useCallback(async () => {
    try {
      const supabase = createBrowserClient()

      // Fetch existing calendar supplement events
      const { data } = await supabase
        .from("calendar_events")
        .select("id, title, description, metadata, created_at, event_time")
        .eq("user_id", userId)
        .eq("event_type", "supplement")
        .order("created_at", { ascending: true })

      const calendarSupps = data || []
      const normalize = (s: string) => s.toLowerCase().replace(/[-_\s\d]/g, "").replace(/mg|iu|mcg|ml/gi, "")
      const calendarNamesNorm = calendarSupps.map(e => normalize(e.title))

      // Auto-add profile supplements that aren't in calendar yet
      const missingFromProfile = profileSupplements.filter(ps => {
        const pn = normalize(ps)
        return !calendarNamesNorm.some(cn => cn.includes(pn) || pn.includes(cn))
      })

      if (missingFromProfile.length > 0) {
        const today = new Date().toISOString().split("T")[0]
        const inserts = missingFromProfile.map(name => {
          const info = findSupplementInfo(name)
          return {
            user_id: userId,
            event_type: "supplement" as const,
            title: name,
            description: info.recommendedDose,
            event_date: today,
            recurrence: "daily",
            metadata: {
              dose: info.recommendedDose,
              frequency: "daily",
              cycleDays: info.cycleDays,
              breakDays: info.breakDays,
              autoAdded: true,
            },
          }
        })

        await supabase.from("calendar_events").insert(inserts)

        // Re-fetch after insert
        const { data: refreshed } = await supabase
          .from("calendar_events")
          .select("id, title, description, metadata, created_at, event_time")
          .eq("user_id", userId)
          .eq("event_type", "supplement")
          .order("created_at", { ascending: true })

        if (refreshed) {
          setSupplements(mapToCycles(refreshed))
          setLoading(false)
          return
        }
      }

      // Deduplicate by normalized name (keep first occurrence)
      const seen = new Set<string>()
      const deduped = calendarSupps.filter(e => {
        const key = normalize(e.title)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setSupplements(mapToCycles(deduped))
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [userId, profileSupplements])

  const addSupplement = useCallback(async (name: string) => {
    if (!name.trim()) return
    setAdding(true)
    try {
      const supabase = createBrowserClient()
      const info = findSupplementInfo(name)
      const today = new Date().toISOString().split("T")[0]

      await supabase.from("calendar_events").insert({
        user_id: userId,
        event_type: "supplement",
        title: name.trim(),
        description: info.recommendedDose,
        event_date: today,
        recurrence: "daily",
        metadata: {
          dose: info.recommendedDose,
          frequency: "daily",
          cycleDays: info.cycleDays,
          breakDays: info.breakDays,
        },
      })

      setNewSuppName("")
      setShowAddInput(false)
      await fetchSupplements()
    } catch {
      // silently fail
    } finally {
      setAdding(false)
    }
  }, [userId, fetchSupplements])

  useEffect(() => {
    if (userId && isPremium) fetchSupplements()
    else setLoading(false)
  }, [userId, isPremium, fetchSupplements])

  if (!isPremium) {
    return (
      <Card className="relative overflow-hidden opacity-75">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">PREMIUM</Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4 text-primary" />
            {tx("washout.title", lang)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 rounded-lg bg-muted/30" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer className="h-4 w-4 text-primary" />
          {tx("washout.title", lang)}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => onAddSupplement ? onAddSupplement() : setShowAddInput(!showAddInput)}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              {tx("washout.add", lang)}
            </button>
            <Badge variant="secondary" className="text-[10px]">PREMIUM</Badge>
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{tx("washout.subtitle", lang)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="h-16 animate-pulse rounded-lg bg-muted/30" />
        ) : supplements.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            {tx("washout.none", lang)}
          </p>
        ) : (
          supplements.map((supp) => (
            <button
              key={supp.id}
              onClick={() => setEditingSupplement(supp)}
              className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{getSupplementDisplayName(supp.name, lang)}</span>
                <div className="flex items-center gap-1.5">
                  {supp.reminderTime && (
                    <span className="flex items-center gap-0.5 text-[10px] text-primary/70">
                      <Bell className="h-3 w-3" /> {supp.reminderTime}
                    </span>
                  )}
                  {supp.daysLeft === 0 && supp.cycleDays > 0 && (
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); setShareProtocol(supp) }}
                      className="flex items-center gap-0.5 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 hover:bg-purple-500/20 transition-colors"
                    >
                      <Share2 className="h-3 w-3" /> {tx("share.share", lang)}
                    </span>
                  )}
                  {supp.daysLeft <= 7 && supp.daysLeft > 0 && supp.cycleDays > 0 && (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <Settings2 className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              {supp.dose && (
                <p className="mt-1 text-sm font-semibold text-primary/80">{supp.dose}</p>
              )}
              {/* Progress bar or completion banner */}
              {supp.cycleDays > 0 && supp.daysLeft === 0 ? (
                <div className="mt-2 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-center">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    🏆 {tx("washout.cycleComplete", lang)}
                  </p>
                  <p className="text-[10px] text-green-600/70 dark:text-green-400/70">
                    {supp.breakDays > 0
                      ? tx("washout.takeBreak", lang).replace("{n}", String(supp.breakDays))
                      : tx("washout.readyNewCycle", lang)
                    }
                  </p>
                </div>
              ) : supp.cycleDays > 0 ? (
                <div className="mt-2 h-1.5 rounded-full bg-muted/50">
                  <div
                    className={`h-full rounded-full transition-all ${
                      supp.percentage >= 90 ? "bg-red-500" :
                      supp.percentage >= 70 ? "bg-amber-500" : "bg-primary"
                    }`}
                    style={{ width: `${supp.percentage}%` }}
                  />
                </div>
              ) : null}
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>
                  {supp.cycleDays === 0
                    ? (supp.daysUsed > 0 ? `${supp.daysUsed} ${tx("washout.days", lang)}` : "")
                    : `${supp.daysUsed}/${supp.cycleDays} ${tx("washout.days", lang)}`
                  }
                </span>
                <span>
                  {supp.cycleDays === 0
                    ? tx("washout.unlimited", lang)
                    : supp.daysLeft > 0
                      ? `${supp.daysLeft} ${tx("washout.daysLeft", lang)}`
                      : tx("washout.breakTime", lang)
                  }
                </span>
              </div>
            </button>
          ))
        )}

        {/* Add supplement input */}
        {showAddInput && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSuppName}
              onChange={(e) => setNewSuppName(e.target.value)}
              placeholder={tx("washout.suppPlaceholder", lang)}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && addSupplement(newSuppName)}
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => addSupplement(newSuppName)}
              disabled={adding || !newSuppName.trim()}
            >
              {adding ? "..." : tx("washout.addBtn", lang)}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowAddInput(false); setNewSuppName("") }}>
              ✕
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

    {editingSupplement && (
      <SupplementDoseDialog
        lang={lang}
        supplement={editingSupplement}
        onClose={() => setEditingSupplement(null)}
        onSave={() => {
          setEditingSupplement(null)
          fetchSupplements()
        }}
        onRemove={() => {
          setEditingSupplement(null)
          fetchSupplements()
        }}
      />
    )}

    <ShareModal open={!!shareProtocol} onClose={() => setShareProtocol(null)}>
      {shareProtocol && (
        <ProtocolShareCard
          lang={lang}
          supplementName={getSupplementDisplayName(shareProtocol.name, lang)}
          cycleDays={shareProtocol.cycleDays}
          streakDays={shareProtocol.daysUsed}
        />
      )}
    </ShareModal>
    </>
  )
}
