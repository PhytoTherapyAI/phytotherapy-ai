// © 2026 Doctopal — All Rights Reserved
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx, txp, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Pill,
  Heart,
  Settings,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sun,
  Droplets,
  Leaf,
  Activity,
  BellOff,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { PageSkeleton } from "@/components/ui/page-skeleton"

// ---- Types ----

type NotificationType = "medication" | "supplement" | "appointment" | "health" | "system"
type FilterTab = "all" | "medications" | "health" | "system"

interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  time: Date
  read: boolean
  icon: typeof Bell
  color: string
}

// ---- Helpers ----

const TYPE_META: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  medication: { icon: Pill, color: "text-blue-500" },
  supplement: { icon: Leaf, color: "text-green-500" },
  appointment: { icon: Calendar, color: "text-purple-500" },
  health: { icon: Heart, color: "text-red-500" },
  system: { icon: Settings, color: "text-muted-foreground" },
}

function groupLabel(date: Date, now: Date, lang: Lang): string {
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diff === 0) return tx("notif.today", lang)
  if (diff === 1) return tx("notif.yesterday", lang)
  if (diff < 7) return tx("notif.thisWeek", lang)
  return tx("notif.older", lang)
}

function relativeTime(date: Date, lang: Lang): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return tx("notif.justNow", lang)
  if (mins < 60) return `${mins}${tx("time.minutesAgo", lang)}`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}${tx("time.hoursAgo", lang)}`
  const days = Math.floor(hrs / 24)
  return `${days}${tx("time.daysAgo", lang)}`
}

const PREFS_KEY = "phyto_notification_prefs"
const READ_KEY = "phyto_notification_read"

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]))
}

// ---- Component ----

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  // Load read state from localStorage
  useEffect(() => {
    setReadIds(getReadIds())
  }, [])

  // Build notifications from Supabase data
  const buildNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const supabase = createBrowserClient()
    const now = new Date()
    const items: Notification[] = []
    const storedRead = getReadIds()

    try {
      // 1. Medication reminders
      const { data: meds } = await supabase
        .from("user_medications")
        .select("id, brand_name, generic_name, dosage, frequency, created_at")
        .eq("user_id", user.id)

      if (meds?.length) {
        for (const med of meds) {
          const name = med.brand_name || med.generic_name || "Medication"
          const nid = `med-reminder-${med.id}`
          items.push({
            id: nid,
            type: "medication",
            title: txp("notifications.medReminder", lang, { name }),
            description: lang === "tr"
              ? `${med.dosage || ""} ${med.frequency || "gunluk"} — ilac saatinizi kacirmayin`
              : `${med.dosage || ""} ${med.frequency || "daily"} — don't miss your dose`,
            time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
            read: storedRead.has(nid),
            ...TYPE_META.medication,
          })
        }
      }

      // 2. Supplement tracking
      const { data: supps } = await supabase
        .from("supplement_tracking")
        .select("id, supplement_name, cycle_days, break_days, start_date")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (supps?.length) {
        for (const s of supps) {
          // Washout approaching check
          if (s.cycle_days && s.start_date) {
            const start = new Date(s.start_date)
            const daysSince = Math.floor((now.getTime() - start.getTime()) / 86400000)
            const remaining = s.cycle_days - (daysSince % (s.cycle_days + (s.break_days || 0)))
            if (remaining <= 3 && remaining > 0) {
              const nid = `washout-${s.id}`
              items.push({
                id: nid,
                type: "supplement",
                title: lang === "tr"
                  ? `${s.supplement_name} washout yaklasti`
                  : `${s.supplement_name} washout approaching`,
                description: lang === "tr"
                  ? `${remaining} gun sonra mola donemi başlayacak`
                  : `Break period starts in ${remaining} day${remaining > 1 ? "s" : ""}`,
                time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30),
                read: storedRead.has(nid),
                ...TYPE_META.supplement,
              })
            }
          }

          // Daily supplement reminder
          const nid = `supp-${s.id}`
          items.push({
            id: nid,
            type: "supplement",
            title: lang === "tr"
              ? `${s.supplement_name} alinacak`
              : `Take ${s.supplement_name}`,
            description: lang === "tr"
              ? "Günlük takviyenizi almayi unutmayin"
              : "Don't forget your daily supplement",
            time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30),
            read: storedRead.has(nid),
            ...TYPE_META.supplement,
          })
        }
      }

      // 3. Calendar events (appointments)
      const todayStr = now.toISOString().split("T")[0]
      const { data: events } = await supabase
        .from("calendar_events")
        .select("id, title, event_type, event_date, event_time")
        .eq("user_id", user.id)
        .gte("event_date", todayStr)
        .order("event_date", { ascending: true })
        .limit(10)

      if (events?.length) {
        for (const ev of events) {
          const nid = `event-${ev.id}`
          items.push({
            id: nid,
            type: "appointment",
            title: ev.title || tx("notif.eventFallback", lang),
            description: `${ev.event_date}${ev.event_time ? ` ${ev.event_time}` : ""}`,
            time: new Date(ev.event_date + "T" + (ev.event_time || "10:00")),
            read: storedRead.has(nid),
            ...TYPE_META.appointment,
          })
        }
      }

      // 4. Health alerts (medication update reminder)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("last_medication_update")
        .eq("id", user.id)
        .single()

      if (profile?.last_medication_update) {
        const lastUpdate = new Date(profile.last_medication_update)
        const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / 86400000)
        if (daysSinceUpdate >= 15) {
          const nid = "med-update-reminder"
          items.push({
            id: nid,
            type: "health",
            title: tx("notif.updateMedList", lang),
            description: lang === "tr"
              ? `Son güncelleme ${daysSinceUpdate} gun once yapildi`
              : `Last updated ${daysSinceUpdate} days ago`,
            time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0),
            read: storedRead.has(nid),
            ...TYPE_META.health,
          })
        }
      }

      // 5. System: welcome / water reminder
      const nidWater = "system-water"
      items.push({
        id: nidWater,
        type: "system",
        title: tx("notif.stayHydrated", lang),
        description: tx("notif.waterDesc", lang),
        time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
        read: storedRead.has(nidWater),
        icon: Droplets,
        color: "text-cyan-500",
      })

      // Sort by time descending
      items.sort((a, b) => b.time.getTime() - a.time.getTime())
      setNotifications(items)
    } catch {
      setNotifications([])
    }
    setLoading(false)
  }, [user, lang])

  useEffect(() => {
    if (user) buildNotifications()
  }, [user, buildNotifications])

  // ---- Actions ----

  const markAsRead = (id: string) => {
    const updated = new Set(readIds)
    updated.add(id)
    setReadIds(updated)
    saveReadIds(updated)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllRead = () => {
    const updated = new Set(readIds)
    notifications.forEach((n) => updated.add(n.id))
    setReadIds(updated)
    saveReadIds(updated)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // ---- Filter ----

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true
    if (activeTab === "medications") return n.type === "medication" || n.type === "supplement"
    if (activeTab === "health") return n.type === "health" || n.type === "appointment"
    return n.type === "system"
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  // ---- Group by date ----

  const now = new Date()
  const grouped: Record<string, Notification[]> = {}
  for (const n of filtered) {
    const label = groupLabel(n.time, now, lang)
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(n)
  }

  // ---- Morning summary ----

  const pendingMeds = notifications.filter((n) => n.type === "medication" && !n.read).length
  const pendingSupps = notifications.filter((n) => n.type === "supplement" && !n.read).length
  const pendingEvents = notifications.filter((n) => n.type === "appointment" && !n.read).length

  // ---- Tabs ----

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: tx("notif.all", lang) },
    { key: "medications", label: tx("notif.medications", lang) },
    { key: "health", label: tx("notif.health", lang) },
    { key: "system", label: tx("notif.system", lang) },
  ]

  // ---- Loading / Auth states ----

  if (isLoading || loading) {
    return <PageSkeleton variant="list" />
  }

  if (!isAuthenticated) return null

  // ---- Render ----

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {tx("notifications.title", lang)}
            </h1>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} {tx("notif.unread", lang)}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {tx("notif.markAllRead", lang)}
          </Button>
        )}
      </div>

      {/* Morning Summary Card */}
      {(pendingMeds > 0 || pendingSupps > 0 || pendingEvents > 0) && (
        <Card className="mb-5 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="flex items-start gap-3 py-4 px-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {tx("notif.goodMorning", lang)}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {pendingMeds > 0 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    <Pill className="mr-1 h-3 w-3" />
                    {pendingMeds} {tx(pendingMeds > 1 ? "notif.pendingMeds" : "notif.pendingMed", lang)}
                  </Badge>
                )}
                {pendingSupps > 0 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    <Leaf className="mr-1 h-3 w-3" />
                    {pendingSupps} {tx(pendingSupps > 1 ? "notif.pendingSupplements" : "notif.pendingSupplement", lang)}
                  </Badge>
                )}
                {pendingEvents > 0 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    <Calendar className="mr-1 h-3 w-3" />
                    {pendingEvents} {tx(pendingEvents > 1 ? "notif.pendingEvents" : "notif.pendingEvent", lang)}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto rounded-lg bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.key === "all" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={tx("notif.noNotifications", lang)}
          description={tx("notif.allWillAppear", lang)}
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([label, items]) => (
            <div key={label}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {label}
              </p>
              <div className="space-y-2">
                {items.map((n) => {
                  const Icon = n.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        n.read
                          ? "border-border/50 bg-background opacity-70"
                          : "border-border bg-card shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          n.read ? "bg-muted/50" : "bg-muted"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${n.read ? "text-muted-foreground/70" : n.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              n.read ? "font-normal text-muted-foreground" : "font-semibold text-foreground"
                            }`}
                          >
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {n.description}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground/60">
                          {relativeTime(n.time, lang)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
