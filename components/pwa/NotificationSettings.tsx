// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, BellOff, Pill, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
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

interface Props {
  medications?: { name: string; times?: string[] }[]
}

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  lang: string
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
              {lang === "tr" ? "Vazgeç" : "Cancel"}
            </Button>
            <Button size="sm" onClick={onConfirm} className="rounded-lg bg-red-500 hover:bg-red-600 text-white">
              {lang === "tr" ? "Kapat" : "Turn Off"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export function NotificationSettings({ medications = [] }: Props) {
  const { lang } = useLang()
  const isTr = lang === "tr"
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

  if (!supported) return null

  const FEATURES = [
    {
      key: "medicationReminders" as const,
      icon: <Pill className="h-4 w-4" />,
      label: isTr ? "İlaç Kalkanı" : "Medication Shield",
      desc: isTr
        ? "Açık olduğunda ilaç saatlerinizi ve olası etkileşimleri size bildirir."
        : "When active, notifies you about medication times and potential interactions.",
      confirmTitle: isTr
        ? "İlaç Kalkanı'nı kapatmak istediğinize emin misiniz?"
        : "Are you sure you want to turn off Medication Shield?",
      confirmDesc: isTr
        ? "Bu özellik kapatıldığında ilaç saati hatırlatmaları ve etkileşim uyarıları duraklatılır."
        : "When turned off, medication time reminders and interaction alerts will be paused.",
    },
    {
      key: "dailyCheckIn" as const,
      icon: <Calendar className="h-4 w-4" />,
      label: isTr ? "Günlük Sağlık Takibi" : "Daily Health Tracking",
      desc: isTr
        ? "Günlük verilerinizi girerek biyolojik yaşınızı güncel tutun."
        : "Keep your biological age up to date by entering your daily data.",
      confirmTitle: isTr
        ? "Günlük Sağlık Takibi'ni kapatmak istediğinize emin misiniz?"
        : "Are you sure you want to turn off Daily Health Tracking?",
      confirmDesc: isTr
        ? "Bu özellik kapatıldığında günlük check-in hatırlatmaları duraklatılır."
        : "When turned off, daily check-in reminders will be paused.",
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
              {isTr ? "Sağlık Kalkanı" : "Health Shield"}
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
                  {isTr ? "Aktif" : "Active"}
                </Badge>
              </>
            ) : (
              isTr ? "Kapalı" : "Off"
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
