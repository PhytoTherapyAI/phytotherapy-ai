// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Globe,
  Moon,
  Sun,
  Bell,
  Shield,
  Download,
  Trash2,
  LogOut,
  Check,
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const { lang, setLang } = useLang()
  const isTr = lang === "tr"

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [notifications, setNotifications] = useState({
    dailyPlan: true,
    medicationReminder: true,
    weeklyReport: false,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const savedTheme = localStorage.getItem("phyto-theme") as "light" | "dark" | "system" | null
    if (savedTheme) setTheme(savedTheme)

    const savedNotifs = localStorage.getItem("phyto-notifications")
    if (savedNotifs) {
      try { setNotifications(JSON.parse(savedNotifs)) } catch {}
    }
  }, [])

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("phyto-theme", newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", prefersDark)
    }
    flashSaved()
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem("phyto-notifications", JSON.stringify(updated))
    flashSaved()
  }

  const flashSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-semibold">
              {isTr ? "Ayarlar" : "Settings"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isTr ? "Tercihlerinizi yönetin" : "Manage your preferences"}
            </p>
          </div>
          {saved && (
            <div className="ml-auto flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              {isTr ? "Kaydedildi" : "Saved"}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Language */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{isTr ? "Dil" : "Language"}</h2>
            </div>
            <div className="flex gap-3">
              <Button
                variant={lang === "tr" ? "default" : "outline"}
                size="sm"
                onClick={() => { setLang("tr"); flashSaved() }}
              >
                Turkce
              </Button>
              <Button
                variant={lang === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => { setLang("en"); flashSaved() }}
              >
                English
              </Button>
            </div>
          </Card>

          {/* Theme */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Sun className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{isTr ? "Tema" : "Theme"}</h2>
            </div>
            <div className="flex gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("light")}
                className="gap-1.5"
              >
                <Sun className="h-4 w-4" />
                {isTr ? "Acik" : "Light"}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
                className="gap-1.5"
              >
                <Moon className="h-4 w-4" />
                {isTr ? "Koyu" : "Dark"}
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("system")}
              >
                {isTr ? "Sistem" : "System"}
              </Button>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{isTr ? "Bildirimler" : "Notifications"}</h2>
            </div>
            <div className="space-y-3">
              {[
                { key: "dailyPlan" as const, labelTr: "Gunluk saglik plani", labelEn: "Daily health plan" },
                { key: "medicationReminder" as const, labelTr: "Ilac hatirlatici", labelEn: "Medication reminder" },
                { key: "weeklyReport" as const, labelTr: "Haftalik rapor", labelEn: "Weekly report" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm">{isTr ? item.labelTr : item.labelEn}</span>
                  <button
                    onClick={() => handleNotificationChange(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications[item.key] ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        notifications[item.key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </Card>

          {/* Privacy & Data */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{isTr ? "Gizlilik ve Veri" : "Privacy & Data"}</h2>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => router.push("/profile")}
              >
                <Download className="h-4 w-4" />
                {isTr ? "Verilerimi indir" : "Download my data"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => router.push("/profile")}
              >
                <Trash2 className="h-4 w-4" />
                {isTr ? "Hesabimi sil" : "Delete my account"}
              </Button>
            </div>
          </Card>

          {/* Sign Out */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={async () => {
              await signOut()
              router.push("/")
            }}
          >
            <LogOut className="h-4 w-4" />
            {isTr ? "Cikis Yap" : "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  )
}
