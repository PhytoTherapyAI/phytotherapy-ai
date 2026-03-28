"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import {
  AlertTriangle,
  Phone,
  X,
  Heart,
  Activity,
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react"

interface CriticalAlert {
  alertType: "vital_anomaly" | "drug_interaction" | "fall_detected" | "panic_button" | "inactivity"
  details: string
  severity: "critical" | "high"
  vitalData?: {
    heartRate?: number
    bloodPressure?: string
    spo2?: number
    temperature?: number
  }
}

const COUNTDOWN_SECONDS = 10

const ALERT_TYPE_INFO: Record<string, { icon: any; tr: string; en: string; color: string }> = {
  vital_anomaly: { icon: Activity, tr: "Anormal Vital Bulgu Algılandı", en: "Abnormal Vital Sign Detected", color: "text-red-500" },
  drug_interaction: { icon: ShieldAlert, tr: "Kritik İlaç Etkileşimi", en: "Critical Drug Interaction", color: "text-orange-500" },
  fall_detected: { icon: AlertTriangle, tr: "Düşme Algılandı", en: "Fall Detected", color: "text-red-600" },
  panic_button: { icon: Heart, tr: "Acil Yardım Talebi", en: "Emergency Help Request", color: "text-red-500" },
  inactivity: { icon: Clock, tr: "Uzun Süreli Hareketsizlik", en: "Prolonged Inactivity", color: "text-amber-500" },
}

export function CriticalAlertModal() {
  const { user } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"

  const [alert, setAlert] = useState<CriticalAlert | null>(null)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Listen for critical alert events (dispatched from other components)
  useEffect(() => {
    const handleCriticalAlert = (e: CustomEvent<CriticalAlert>) => {
      setAlert(e.detail)
      setCountdown(COUNTDOWN_SECONDS)
      setIsSending(false)
      setIsSent(false)
      setIsCancelled(false)
    }

    window.addEventListener("critical-alert" as any, handleCriticalAlert)
    return () => window.removeEventListener("critical-alert" as any, handleCriticalAlert)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!alert || isCancelled || isSent || isSending) return

    if (countdown <= 0) {
      triggerSOS()
      return
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [alert, countdown, isCancelled, isSent, isSending])

  // Vibration + sound on alert
  useEffect(() => {
    if (alert && !isCancelled && !isSent) {
      // Vibrate pattern: 500ms on, 200ms off, 500ms on
      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500])
      }
    }
  }, [alert, isCancelled, isSent])

  const triggerSOS = useCallback(async () => {
    if (!user || !alert || isSending) return
    setIsSending(true)

    try {
      // Get location if available
      let location: { latitude: number; longitude: number; accuracy: number } | undefined
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
        })
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
      } catch {
        // Location not available — continue without it
      }

      const res = await fetch("/api/trigger-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          alertType: alert.alertType,
          details: alert.details,
          severity: alert.severity,
          vitalData: alert.vitalData,
          location,
        }),
      })

      if (res.ok) {
        setIsSent(true)
        // Stop vibration
        if (navigator.vibrate) navigator.vibrate(0)
      }
    } catch (err) {
      console.error("[SOS] Trigger failed:", err)
    } finally {
      setIsSending(false)
    }
  }, [user, alert, isSending])

  const handleCancel = () => {
    setIsCancelled(true)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (navigator.vibrate) navigator.vibrate(0)
    // Auto-close after 2 seconds
    setTimeout(() => setAlert(null), 2000)
  }

  const handleClose = () => {
    setAlert(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (navigator.vibrate) navigator.vibrate(0)
  }

  if (!alert) return null

  const alertInfo = ALERT_TYPE_INFO[alert.alertType] || ALERT_TYPE_INFO.vital_anomaly
  const AlertIcon = alertInfo.icon
  const progressPercent = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border-2 border-red-500/50 bg-background shadow-2xl shadow-red-500/20">

        {/* Top danger strip */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            {isTr ? "Kritik Durum Algılandı" : "Critical Alert Detected"}
          </span>
        </div>

        <div className="p-5 space-y-4">

          {/* Alert type & details */}
          <div className="flex items-start gap-3">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50 ${alertInfo.color}`}>
              <AlertIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isTr ? alertInfo.tr : alertInfo.en}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                {alert.details}
              </p>
            </div>
          </div>

          {/* Vital data badges */}
          {alert.vitalData && (
            <div className="flex flex-wrap gap-2">
              {alert.vitalData.heartRate && (
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                  alert.vitalData.heartRate > 150 || alert.vitalData.heartRate < 40
                    ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                }`}>
                  <Heart className="h-3 w-3" />
                  {alert.vitalData.heartRate} bpm
                </span>
              )}
              {alert.vitalData.bloodPressure && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 px-2.5 py-1 text-xs font-bold">
                  <Activity className="h-3 w-3" />
                  {alert.vitalData.bloodPressure} mmHg
                </span>
              )}
              {alert.vitalData.spo2 && (
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                  alert.vitalData.spo2 < 90
                    ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                }`}>
                  SpO2: {alert.vitalData.spo2}%
                </span>
              )}
            </div>
          )}

          {/* Countdown or status */}
          {!isCancelled && !isSent && (
            <div className="space-y-3">
              {/* Countdown circle */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  {/* Background circle */}
                  <svg className="absolute inset-0 h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                    <circle
                      cx="40" cy="40" r="36" fill="none"
                      stroke="currentColor" strokeWidth="4"
                      strokeLinecap="round"
                      className="text-red-500 transition-all duration-1000 ease-linear"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPercent / 100)}`}
                    />
                  </svg>
                  <span className="text-2xl font-black text-red-500 tabular-nums">
                    {isSending ? <Loader2 className="h-6 w-6 animate-spin" /> : countdown}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {isSending
                    ? (isTr ? "Acil durum kişilerine bildirim gönderiliyor..." : "Sending notifications to emergency contacts...")
                    : (isTr
                      ? `${countdown} saniye içinde acil durum kişilerinize otomatik bildirim gönderilecek`
                      : `Emergency contacts will be automatically notified in ${countdown} seconds`)}
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cancelled state */}
          {isCancelled && (
            <div className="flex flex-col items-center gap-2 py-3">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {isTr ? "Uyarı iptal edildi. İyi olduğuna sevindik!" : "Alert cancelled. Glad you're okay!"}
              </p>
            </div>
          )}

          {/* Sent state */}
          {isSent && (
            <div className="flex flex-col items-center gap-2 py-3">
              <Phone className="h-10 w-10 text-primary animate-pulse" />
              <p className="text-sm font-bold text-primary">
                {isTr
                  ? "Acil durum kişilerinize bildirim gönderildi!"
                  : "Emergency contacts have been notified!"}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {isTr ? "Lütfen 112'yi aramayı da düşünün." : "Please also consider calling 112/911."}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {!isCancelled && !isSent && (
              <button
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition-all hover:bg-green-700 active:scale-95"
              >
                {isTr ? "İyiyim, İptal Et" : "I'm Fine, Cancel"}
              </button>
            )}

            {!isCancelled && !isSent && (
              <button
                onClick={triggerSOS}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-95"
              >
                {isTr ? "Hemen Bildir" : "Send SOS Now"}
              </button>
            )}

            {(isCancelled || isSent) && (
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl bg-muted py-3 text-sm font-bold transition-all hover:bg-muted/80"
              >
                {isTr ? "Kapat" : "Close"}
              </button>
            )}

            {isSent && (
              <a
                href="tel:112"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-all hover:bg-red-700"
              >
                <Phone className="h-4 w-4" />
                112
              </a>
            )}
          </div>

          {/* Emergency number reminder */}
          {!isCancelled && !isSent && (
            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition-all hover:bg-red-100"
            >
              <Phone className="h-3.5 w-3.5" />
              {isTr ? "Hemen 112'yi Ara" : "Call 112 / 911 Now"}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
