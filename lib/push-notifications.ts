// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Push Notifications — Enhanced for Phase 11
// ============================================

import { tx } from "@/lib/translations"

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushSupported()) return false
  const result = await Notification.requestPermission()
  return result === "granted"
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported"
  return Notification.permission
}

// Send a local notification via service worker (more reliable than new Notification)
export async function sendLocalNotification(title: string, body: string, options?: {
  tag?: string
  url?: string
}) {
  if (!isPushSupported() || Notification.permission !== "granted") return

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: options?.tag || "phytotherapy",
      data: { url: options?.url || "/" },
    })
  } catch {
    // Fallback to Notification constructor
    try {
      const notification = new Notification(title, {
        body,
        icon: "/icon-192.png",
        tag: options?.tag || "phytotherapy",
      })
      notification.onclick = () => {
        window.focus()
        if (options?.url) window.location.href = options.url
        notification.close()
      }
    } catch {
      // Silently fail
    }
  }
}

// ── Notification Storage ──

const STORAGE_KEY = "phyto_notification_settings"

export interface NotificationSettings {
  enabled: boolean
  medicationReminders: boolean
  dailyCheckIn: boolean
  morningTime: string  // HH:MM format
  eveningTime: string
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  medicationReminders: true,
  dailyCheckIn: true,
  morningTime: "08:00",
  eveningTime: "21:00",
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch {}
  return DEFAULT_SETTINGS
}

export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// ── Scheduling ──

const scheduledTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

export function clearAllScheduled() {
  scheduledTimers.forEach((timer) => clearTimeout(timer))
  scheduledTimers.clear()
}

function scheduleAtTime(id: string, timeStr: string, callback: () => void) {
  // Clear existing timer for this id
  const existing = scheduledTimers.get(id)
  if (existing) clearTimeout(existing)

  const [hours, minutes] = timeStr.split(":").map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)

  // If time already passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }

  const ms = target.getTime() - now.getTime()
  const timer = setTimeout(() => {
    callback()
    // Reschedule for next day
    scheduleAtTime(id, timeStr, callback)
  }, ms)

  scheduledTimers.set(id, timer)
}

// Schedule medication reminder
export function scheduleMedicationReminders(
  medications: { name: string; times?: string[] }[],
  lang: "en" | "tr" = "en"
) {
  // Clear old medication timers
  scheduledTimers.forEach((_, key) => {
    if (key.startsWith("med-")) {
      clearTimeout(scheduledTimers.get(key)!)
      scheduledTimers.delete(key)
    }
  })

  const settings = getNotificationSettings()
  if (!settings.enabled || !settings.medicationReminders) return

  medications.forEach((med) => {
    const times = med.times?.length ? med.times : [settings.morningTime]
    times.forEach((time, i) => {
      scheduleAtTime(`med-${med.name}-${i}`, time, () => {
        const title = tx("notification.medReminder", lang)
        const body = lang === "tr"
          ? `${med.name} almanın zamanı geldi!`
          : `Time to take ${med.name}!`
        sendLocalNotification(title, body, { tag: `med-${med.name}`, url: "/calendar" })
      })
    })
  })
}

// Schedule daily check-in reminder
export function scheduleDailyCheckIn(lang: "en" | "tr" = "en") {
  const settings = getNotificationSettings()
  if (!settings.enabled || !settings.dailyCheckIn) return

  scheduleAtTime("daily-checkin", settings.eveningTime, () => {
    const title = tx("notification.dailyCheckin", lang)
    const body = tx("notification.dailyCheckinBody", lang)
    sendLocalNotification(title, body, { tag: "daily-checkin", url: "/dashboard" })
  })
}

// Schedule morning summary
export function scheduleMorningSummary(lang: "en" | "tr" = "en") {
  const settings = getNotificationSettings()
  if (!settings.enabled) return

  scheduleAtTime("morning-summary", settings.morningTime, () => {
    const title = tx("notification.morningTitle", lang)
    const body = tx("notification.morningMedsBody", lang)
    sendLocalNotification(title, body, { tag: "morning-summary", url: "/dashboard" })
  })
}

// Initialize all scheduled notifications
export function initializeNotifications(
  medications: { name: string; times?: string[] }[],
  lang: "en" | "tr" = "en"
) {
  const settings = getNotificationSettings()
  if (!settings.enabled || Notification.permission !== "granted") return

  scheduleMedicationReminders(medications, lang)
  scheduleDailyCheckIn(lang)
  scheduleMorningSummary(lang)
}
