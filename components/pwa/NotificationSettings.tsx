"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, Pill, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
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

export function NotificationSettings({ medications = [] }: Props) {
  const { lang } = useLang()
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<string>("default")
  const [settings, setSettings] = useState<Settings>(getNotificationSettings())

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

  if (!supported) return null

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {settings.enabled ? (
            <Bell className="h-4 w-4 text-primary" />
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
          {settings.enabled ? tx("notif.on", lang) : tx("notif.off", lang)}
        </Button>
      </div>

      {permission === "denied" && (
        <p className="text-xs text-red-500">
          {tx("notif.blocked", lang)}
        </p>
      )}

      {settings.enabled && permission === "granted" && (
        <div className="space-y-3 border-t pt-3">
          {/* Medication Reminders */}
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs">
                {tx("notif.medReminders", lang)}
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.medicationReminders}
              onChange={(e) => updateSetting("medicationReminders", e.target.checked)}
              className="h-4 w-4 rounded border-muted-foreground accent-primary"
            />
          </label>

          {/* Daily Check-in */}
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs">
                {tx("notif.dailyCheckIn", lang)}
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.dailyCheckIn}
              onChange={(e) => updateSetting("dailyCheckIn", e.target.checked)}
              className="h-4 w-4 rounded border-muted-foreground accent-primary"
            />
          </label>

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
  )
}
