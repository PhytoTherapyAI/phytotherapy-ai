// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Pill, CheckCircle2, Droplet, Siren, MessageSquare, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { createBrowserClient } from "@/lib/supabase"
import { useLang } from "@/components/layout/language-toggle"
import type { FamilyNotification, FamilyNotificationType } from "@/types/family"

const POLL_MS = 60_000

const TYPE_META: Record<FamilyNotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  reminder_meds:    { icon: Pill,           color: "text-blue-600",    bg: "bg-blue-100 dark:bg-blue-900/30" },
  reminder_checkin: { icon: CheckCircle2,   color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  reminder_water:   { icon: Droplet,        color: "text-cyan-600",    bg: "bg-cyan-100 dark:bg-cyan-900/30" },
  emergency:        { icon: Siren,          color: "text-red-600",     bg: "bg-red-100 dark:bg-red-900/30 animate-pulse" },
  custom:           { icon: MessageSquare,  color: "text-amber-600",   bg: "bg-amber-100 dark:bg-amber-900/30" },
}

function relTime(iso: string, tr: boolean) {
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff) || diff < 0) return ""
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (m < 1) return tr ? "az önce" : "just now"
  if (m < 60) return tr ? `${m} dk` : `${m}m`
  if (h < 24) return tr ? `${h} sa` : `${h}h`
  return tr ? `${d} g` : `${d}d`
}

export function NotificationBell() {
  const { isAuthenticated, user } = useAuth()
  const { setActiveProfile } = useFamily()
  const { lang } = useLang()
  const router = useRouter()
  const tr = lang === "tr"
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<FamilyNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const unreadCount = items.filter(n => !n.read).length
  const hasUnreadEmergency = items.some(n => !n.read && n.type === "emergency")

  const fetchItems = useCallback(async () => {
    if (!isAuthenticated || !user) return
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch("/api/family/notifications?limit=20", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setItems(Array.isArray(data.notifications) ? data.notifications : [])
    } catch {
      /* silent — bell is best-effort */
    }
  }, [isAuthenticated, user])

  // Initial fetch + 60s polling
  useEffect(() => {
    if (!isAuthenticated) return
    fetchItems()
    const id = setInterval(fetchItems, POLL_MS)
    return () => clearInterval(id)
  }, [isAuthenticated, fetchItems])

  // Refresh when dropdown opens
  useEffect(() => {
    if (open) {
      setLoading(true)
      fetchItems().finally(() => setLoading(false))
    }
  }, [open, fetchItems])

  // Click outside → close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  async function markAllRead() {
    if (unreadCount === 0) return
    setMarking(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      await fetch("/api/family/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ markAllRead: true }),
      })
      setItems(prev => prev.map(n => ({ ...n, read: true })))
    } finally {
      setMarking(false)
    }
  }

  async function markOneRead(id: string) {
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      await fetch("/api/family/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id }),
      })
      setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { /* silent */ }
  }

  // Route a notification to the page that lets the user act on it.
  // - emergency: switch active profile to the sender + open their profile so
  //   the caller can review meds/allergies and call back.
  // - custom (currently always a management-permission request): send the
  //   user to /family where the Sharing Preferences toggle lives.
  // - reminder_*: dashboard has the med / check-in / water widgets.
  async function handleNotificationClick(n: FamilyNotification) {
    if (!n.read) {
      // Don't await — UI should feel instant; PATCH is fire-and-forget.
      void markOneRead(n.id)
    }
    setOpen(false)
    switch (n.type) {
      case "emergency":
        if (n.from_user_id) {
          try { await setActiveProfile(n.from_user_id) } catch { /* non-fatal */ }
        }
        router.push("/profile")
        break
      case "custom":
        router.push("/family")
        break
      case "reminder_meds":
      case "reminder_checkin":
      case "reminder_water":
        router.push("/")
        break
      default:
        router.push("/")
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`relative inline-flex items-center justify-center h-9 w-9 rounded-lg transition-colors ${
          hasUnreadEmergency ? "bg-red-100 dark:bg-red-950/40 animate-pulse hover:bg-red-200 dark:hover:bg-red-900/60" : "hover:bg-muted/60"
        }`}
        aria-label={tr ? "Bildirimler" : "Notifications"}
        title={hasUnreadEmergency ? (tr ? "Acil durum bildirimi!" : "Emergency alert!") : (tr ? "Bildirimler" : "Notifications")}
      >
        <Bell className={`h-4 w-4 ${hasUnreadEmergency ? "text-red-600 dark:text-red-400" : "text-foreground/80"}`} />
        {unreadCount > 0 && (
          <span className={`absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-sm ${
            hasUnreadEmergency ? "bg-red-600" : "bg-red-500"
          }`}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-y-auto bg-card border rounded-xl shadow-2xl z-50">
          <div className="sticky top-0 bg-card border-b border-border p-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {tr ? "Bildirimler" : "Notifications"}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={marking}
                className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium disabled:opacity-50"
              >
                {marking && <Loader2 className="h-3 w-3 animate-spin inline mr-1" />}
                {tr ? "Tümünü okundu işaretle" : "Mark all read"}
              </button>
            )}
          </div>

          {loading && items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              {tr ? "Yükleniyor…" : "Loading…"}
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {tr ? "Henüz bildirimin yok." : "No notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map(n => {
                const meta = TYPE_META[n.type] || TYPE_META.custom
                const Icon = meta.icon
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left p-3 flex gap-3 cursor-pointer hover:bg-muted/60 active:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      n.read ? "" : "bg-emerald-50/40 dark:bg-emerald-950/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {relTime(n.created_at, tr)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" aria-label="unread" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
