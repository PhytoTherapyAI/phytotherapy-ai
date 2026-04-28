// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, BellOff, Pill, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useLang } from "@/components/layout/language-toggle"
import { tx, type Lang } from "@/lib/translations"
import { motion, AnimatePresence } from "framer-motion"
import {
  isPushSupported,
  requestNotificationPermission,
  getNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  initializeNotifications,
  clearAllScheduled,
  type NotificationSettings as Settings,
} from "@/lib/push-notifications"
import {
  isStandalone,
  isIOSSafari,
  type PWAInstallState,
} from "@/lib/pwa/detect"

// `beforeinstallprompt` is non-standard so TypeScript ships no
// built-in type. Defining the shape locally is a tiny price for
// keeping `any` out of the codebase (CLAUDE.md rule).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

interface Props {
  medications?: { name: string; times?: string[] }[]
}

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  // F-NOTIF-I18N-FULL-001: Lang literal union (was `string`).
  // The buttons inside this modal now run through tx(), which
  // requires the literal "en" | "tr" union — passing a generic
  // string would re-trigger the F-PWA-NOTIF-FALLBACK-001 round-1
  // type error (7 mismatches at the call-site).
  lang: Lang
}

function ConfirmModal({ open, title, description, onConfirm, onCancel, lang }: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-5">{description}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onCancel} className="rounded-lg">
              {tx("notif.confirmCancel", lang)}
            </Button>
            <Button size="sm" onClick={onConfirm} className="rounded-lg bg-red-500 hover:bg-red-600 text-white">
              {tx("notif.confirmTurnOff", lang)}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// F-PWA-NOTIF-FALLBACK-001: rendered when push isn't supported on
// the current browser — the previous behaviour was an early
// `return null` which left mobile users (especially iOS Safari
// before "Add to Home Screen") staring at an empty card slot.
// Three branches:
//
//   1. promptable  — beforeinstallprompt was captured (Android
//                    Chrome / desktop Chrome / Edge). Native
//                    install prompt fires from the button.
//   2. ios-manual  — iOS Safari, not yet standalone. The browser
//                    refuses beforeinstallprompt forever, so we
//                    show the manual "Share → Add to Home Screen"
//                    visual hint.
//   3. unsupported — generic fallback for everything else (PWA-
//                    incapable browsers, in-app webviews, etc).
//
// All three reuse pre-existing translation keys (pwa.installPrompt,
// pwa.installDesc, pwa.install, perm.iosPwaTitle, perm.iosPwaDesc)
// so this commit is purely an implementation patch — no new strings.
function UnsupportedFallback({ lang }: { lang: Lang }) {
  const [state, setState] = useState<PWAInstallState>("unsupported")
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Already installed as PWA — push API still missing means we
    // genuinely can't notify here, so fall through to the generic
    // "unsupported" copy. This is a rare edge case (some Linux
    // Chrome flatpaks lose web-push between updates) but worth
    // handling rather than rendering nothing.
    if (isStandalone()) {
      setState("unsupported")
      return
    }

    // iOS Safari has no beforeinstallprompt event — we know up
    // front the only path is manual.
    if (isIOSSafari()) {
      setState("ios-manual")
      return
    }

    // Everyone else: wait for beforeinstallprompt. If it never
    // fires (e.g. user already dismissed install, or the browser
    // doesn't ship the API at all), state stays "unsupported".
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState("promptable")
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    // Per spec the prompt event is single-use, regardless of outcome.
    setDeferredPrompt(null)
  }

  // STATE 1 — Promptable
  if (state === "promptable") {
    return (
      <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <BellOff className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">{tx("pwa.installPrompt", lang)}</p>
            <p className="text-xs text-muted-foreground mt-1">{tx("pwa.installDesc", lang)}</p>
          </div>
        </div>
        <Button onClick={handleInstall} className="w-full" size="sm">
          {tx("pwa.install", lang)}
        </Button>
      </div>
    )
  }

  // STATE 2 — iOS Safari manual
  if (state === "ios-manual") {
    return (
      <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <BellOff className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">{tx("perm.iosPwaTitle", lang)}</p>
            <p className="text-xs text-muted-foreground mt-1">{tx("perm.iosPwaDesc", lang)}</p>
          </div>
        </div>
        {/* Visual breadcrumb of the iOS gesture. lucide's Share2
            doesn't match the actual iOS share glyph, so we use a
            neutral unicode arrow + the share-symbol-shaped ⎙ char
            as a hint rather than pretending to be pixel-perfect. */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-background/60 rounded-lg p-2">
          <span>Safari</span>
          <span aria-hidden>→</span>
          <span aria-label="Share">⎙</span>
          <span aria-hidden>→</span>
          <span>{tx("perm.iosPwaTitle", lang)}</span>
        </div>
      </div>
    )
  }

  // STATE 3 — Generic unsupported fallback
  return (
    <div className="rounded-2xl border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <BellOff className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {tx("pwa.installDesc", lang)}
        </p>
      </div>
    </div>
  )
}

export function NotificationSettings({ medications = [] }: Props) {
  const { lang } = useLang()
  // F-NOTIF-I18N-FULL-001: `const isTr = lang === "tr"` declaration
  // silindi — Sprint 2 sonrası kalan 11 kullanım (FEATURES array +
  // Active/Off badge + ConfirmModal sub-component) tx() çağrılarına
  // taşındı. Dead code cleanup tetiklendi.
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<string>("default")
  const [settings, setSettings] = useState<Settings>(getNotificationSettings())
  const [confirmModal, setConfirmModal] = useState<{ key: "medicationReminders" | "dailyCheckIn" } | null>(null)

  useEffect(() => {
    setSupported(isPushSupported())
    setPermission(getNotificationPermission())
  }, [])

  const handleToggle = async () => {
    if (!settings.enabled) {
      const granted = await requestNotificationPermission()
      setPermission(granted ? "granted" : "denied")
      if (granted) {
        const updated = { ...settings, enabled: true }
        setSettings(updated)
        saveNotificationSettings(updated)
        initializeNotifications(medications, lang)
      }
    } else {
      clearAllScheduled()
      const updated = { ...settings, enabled: false }
      setSettings(updated)
      saveNotificationSettings(updated)
    }
  }

  const updateSetting = (key: keyof Settings, value: boolean | string) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveNotificationSettings(updated)
    if (updated.enabled) {
      clearAllScheduled()
      initializeNotifications(medications, lang)
    }
  }

  const handleFeatureToggle = (key: "medicationReminders" | "dailyCheckIn") => {
    if (settings[key]) {
      // Turning OFF → show confirmation
      setConfirmModal({ key })
    } else {
      // Turning ON → no confirmation needed
      updateSetting(key, true)
    }
  }

  const confirmTurnOff = () => {
    if (confirmModal) {
      updateSetting(confirmModal.key, false)
      setConfirmModal(null)
    }
  }

  // F-PWA-NOTIF-FALLBACK-001: was `return null`, which left every
  // mobile install-flow surface (including the /calendar mobile
  // bottom slot at calendar/page.tsx:1230) rendering nothing.
  // The fallback below answers "why don't I see the notification
  // settings here?" with one of three actionable copies depending
  // on the browser.
  if (!supported) {
    return <UnsupportedFallback lang={lang} />
  }

  const FEATURES = [
    {
      key: "medicationReminders" as const,
      icon: <Pill className="h-4 w-4" />,
      label: tx("notif.medReminders", lang),
      desc: tx("notif.medRemindersDesc", lang),
      confirmTitle: tx("notif.medRemindersConfirmTitle", lang),
      confirmDesc: tx("notif.medRemindersConfirmDesc", lang),
    },
    {
      key: "dailyCheckIn" as const,
      icon: <Calendar className="h-4 w-4" />,
      label: tx("notif.dailyCheckIn", lang),
      desc: tx("notif.dailyCheckInDesc", lang),
      confirmTitle: tx("notif.dailyCheckInConfirmTitle", lang),
      confirmDesc: tx("notif.dailyCheckInConfirmDesc", lang),
    },
  ]

  return (
    <>
      <div className="rounded-xl border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.enabled ? (
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
            <h3 className="text-sm font-semibold">
              {tx("notif.title", lang)}
            </h3>
          </div>
          <Button
            variant={settings.enabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggle}
            className="gap-1.5"
          >
            {settings.enabled ? (
              <>
                <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 border-0">
                  {tx("notif.on", lang)}
                </Badge>
              </>
            ) : (
              tx("notif.off", lang)
            )}
          </Button>
        </div>

        {permission === "denied" && (
          <p className="text-xs text-red-500">
            {tx("notif.blocked", lang)}
          </p>
        )}

        {settings.enabled && permission === "granted" && (
          <div className="space-y-4 border-t pt-3">
            {/* Feature Toggles */}
            {FEATURES.map((feature) => (
              <div key={feature.key} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="mt-0.5 text-muted-foreground">{feature.icon}</div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{feature.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleFeatureToggle(feature.key)}
                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200 ${
                    settings[feature.key] ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Toggle ${feature.label}`}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ left: settings[feature.key] ? "calc(100% - 22px)" : "2px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                </button>
              </div>
            ))}

            {/* Time Settings */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {tx("notif.morningTime", lang)}
                </Label>
                <Input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => updateSetting("morningTime", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {tx("notif.eveningTime", lang)}
                </Label>
                <Input
                  type="time"
                  value={settings.eveningTime}
                  onChange={(e) => updateSetting("eveningTime", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          open={!!confirmModal}
          title={FEATURES.find(f => f.key === confirmModal.key)!.confirmTitle}
          description={FEATURES.find(f => f.key === confirmModal.key)!.confirmDesc}
          onConfirm={confirmTurnOff}
          onCancel={() => setConfirmModal(null)}
          lang={lang}
        />
      )}
    </>
  )
}
