// ============================================
// Push Notifications — Sprint 20
// ============================================

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

// Send a local notification (for reminders)
export function sendLocalNotification(title: string, body: string, options?: {
  tag?: string
  url?: string
}) {
  if (!isPushSupported() || Notification.permission !== "granted") return

  const notification = new Notification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: options?.tag || "phytotherapy",
    data: { url: options?.url || "/" },
  })

  notification.onclick = () => {
    window.focus()
    if (options?.url) {
      window.location.href = options.url
    }
    notification.close()
  }
}

// Schedule medication reminder (using setTimeout for PWA)
export function scheduleMedicationReminder(
  medicationName: string,
  timeMs: number,
  lang: "en" | "tr" = "en"
) {
  setTimeout(() => {
    const title = lang === "tr" ? "İlaç Hatırlatıcısı" : "Medication Reminder"
    const body = lang === "tr"
      ? `${medicationName} almanın zamanı geldi!`
      : `Time to take ${medicationName}!`

    sendLocalNotification(title, body, {
      tag: `med-${medicationName}`,
      url: "/calendar",
    })
  }, timeMs)
}

// Morning summary notification
export function scheduleMorningSummary(lang: "en" | "tr" = "en") {
  const title = lang === "tr" ? "Günaydın!" : "Good Morning!"
  const body = lang === "tr"
    ? "İlaçların güncel mi? Günlük özetine göz at."
    : "Are your meds up to date? Check your daily summary."

  sendLocalNotification(title, body, {
    tag: "morning-summary",
    url: "/dashboard",
  })
}
