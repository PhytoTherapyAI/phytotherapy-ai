// ============================================
// Push Notification Helper — Sprint 10
// ============================================
// Handles browser notification permission and scheduling
// PWA push notifications for morning summary

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false

  const result = await Notification.requestPermission()
  return result === "granted"
}

export function isNotificationSupported(): boolean {
  return "Notification" in window
}

export function isNotificationGranted(): boolean {
  if (!("Notification" in window)) return false
  return Notification.permission === "granted"
}

export function sendLocalNotification(title: string, body: string, icon?: string) {
  if (!isNotificationGranted()) return

  try {
    new Notification(title, {
      body,
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      tag: "phytotherapy-daily",
    })
  } catch {
    // Fallback for environments that don't support Notification constructor
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_NOTIFICATION",
        title,
        body,
        icon,
      })
    }
  }
}

// Schedule morning notification check
// Called on app load — checks if it's morning (6-10am) and user hasn't checked in
export function shouldShowMorningReminder(): boolean {
  const now = new Date()
  const hour = now.getHours()

  // Only show between 6am and 10am
  if (hour < 6 || hour > 10) return false

  // Check if already shown today
  const today = now.toISOString().split("T")[0]
  const lastShown = localStorage.getItem("morning-reminder-shown")
  if (lastShown === today) return false

  return true
}

export function markMorningReminderShown() {
  const today = new Date().toISOString().split("T")[0]
  localStorage.setItem("morning-reminder-shown", today)
}

// Send morning summary notification
export function sendMorningSummary(lang: "en" | "tr") {
  if (!shouldShowMorningReminder()) return
  if (!isNotificationGranted()) return

  const title = lang === "tr" ? "Günaydın! ☀️" : "Good morning! ☀️"
  const body = lang === "tr"
    ? "Günlük check-in'ini yap ve sağlık skorunu gör!"
    : "Complete your daily check-in and see your health score!"

  sendLocalNotification(title, body)
  markMorningReminderShown()
}
