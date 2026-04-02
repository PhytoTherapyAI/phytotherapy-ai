// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Bot, Bell, Shield, Download, Trash2, Watch, Award,
  Bug, ChevronRight, User, Check, Sparkles, Globe,
  Lock, AlertTriangle, Loader2,
} from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"

const personalityOptions = [
  { id: "compassionate", label: "Compassionate", emoji: "💚", desc: "Warm, empathetic, and gentle" },
  { id: "clinical",      label: "Clinical",      emoji: "🔬", desc: "Precise, evidence-focused" },
  { id: "witty",         label: "Witty",         emoji: "✨", desc: "Playful, encouraging, light" },
]

type Tab = "profile" | "system"

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, isLoading } = useAuth()
  const { lang, setLang } = useLang()
  const isTr = lang === "tr"

  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [personality, setPersonality] = useState("compassionate")
  const [downloadState, setDownloadState] = useState<"idle" | "packaging" | "ready">("idle")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    dailyPlan: true,
    weeklySummary: false,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  if (isLoading) return <PageSkeleton />

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  const handleDownload = () => {
    setDownloadState("packaging")
    setTimeout(() => setDownloadState("ready"), 3000)
  }

  const SYSTEM_ITEMS = [
    { icon: Shield, label: isTr ? "Gizlilik Kontrolleri" : "Privacy Controls", desc: isTr ? "Veri izinlerini yönet" : "Manage data permissions", color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300", href: "/privacy-controls" },
    { icon: Watch,  label: isTr ? "Bağlı Cihazlar" : "Connected Devices", desc: isTr ? "Apple Health, Google Fit" : "Apple Health, Google Fit", color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600", href: "/connected-devices" },
    { icon: Award,  label: isTr ? "Sertifikalar" : "Certificates", desc: isTr ? "Sağlık başarılarınız" : "Your health achievements", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600", href: "/certificates" },
    { icon: Bug,    label: isTr ? "Hata Bildir" : "Bug Report", desc: isTr ? "Bizi geliştirmemize yardım et" : "Help us improve DoctoPal", color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600", href: "/bug-report" },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-lg px-4 py-6 pb-24">

        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-heading text-2xl font-bold italic">
            ⚙️ {isTr ? "Kişisel Komuta Merkezi" : "Personal Command Center"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{displayName}</p>
        </motion.div>

        {/* iOS Segmented Control */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-5 flex rounded-xl bg-muted/60 p-1 gap-1"
        >
          {(["profile", "system"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="settings-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-background shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className={`relative z-10 ${activeTab === tab ? "text-foreground" : "text-muted-foreground"}`}>
                {tab === "profile"
                  ? (isTr ? "👤 Profil Ayarları" : "👤 Profile Settings")
                  : (isTr ? "🔧 Sistem Ayarları" : "🔧 System Settings")}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" ? (
            <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-4">

              {/* Personal Info Card */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    {isTr ? "Kişisel Bilgiler" : "Personal Information"}
                  </h3>
                  <Link href="/profile" className="text-xs font-medium text-primary flex items-center gap-1 hover:opacity-80">
                    ✏️ {isTr ? "Düzenle" : "Edit"}
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Health Profile Card */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    {isTr ? "Sağlık Profili" : "Health Profile"}
                  </h3>
                  <Link href="/profile?tab=medications" className="text-xs font-medium text-primary flex items-center gap-1 hover:opacity-80">
                    ✏️ {isTr ? "Düzenle" : "Edit"}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    💊 {isTr ? "İlaçlar" : "Medications"}
                  </span>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                    ⚠️ {isTr ? "Alerjiler" : "Allergies"}
                  </span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    🌿 {isTr ? "Takviyeler" : "Supplements"}
                  </span>
                </div>
                <Link href="/profile" className="mt-3 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                  {isTr ? "Sağlık Profilimi Güncelle" : "Update My Health Profile"}
                </Link>
              </div>

            </motion.div>
          ) : (
            <motion.div key="system" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4">

              {/* AI Personality */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Bot className="h-4 w-4 text-primary" />
                  🤖 {isTr ? "AI Kişiliği" : "AI Personality"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {personalityOptions.map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPersonality(opt.id)}
                      className={`p-3 rounded-xl text-center border-2 transition-all ${
                        personality === opt.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xl block mb-1">{opt.emoji}</span>
                      <span className="text-xs font-medium block">{opt.label}</span>
                      {personality === opt.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 flex justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                  <Bell className="h-4 w-4 text-blue-500" />
                  🔔 {isTr ? "Bildirimler" : "Notifications"}
                </h3>
                <div className="space-y-3">
                  {([
                    ["email",         isTr ? "E-posta Bildirimleri" : "Email Notifications"],
                    ["push",          isTr ? "Push Bildirimleri" : "Push Notifications"],
                    ["dailyPlan",     isTr ? "Günlük Sağlık Planı" : "Daily Health Plan"],
                    ["weeklySummary", isTr ? "Haftalık Özet" : "Weekly Summary"],
                  ] as [keyof typeof notifications, string][]).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">{label}</span>
                      <motion.button
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? "bg-primary" : "bg-muted"}`}
                        whileTap={{ scale: 0.9 }}
                        layout
                      >
                        <motion.div
                          layout
                          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                          animate={{ left: notifications[key] ? "calc(100% - 22px)" : "2px" }}
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      </motion.button>
                    </label>
                  ))}
                </div>
              </div>

              {/* System Items */}
              <div className="rounded-2xl border bg-card overflow-hidden shadow-sm divide-y divide-border">
                {SYSTEM_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>

              {/* Language */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-slate-500" />
                  🌐 {isTr ? "Dil" : "Language"}
                </h3>
                <div className="flex gap-2">
                  {(["en", "tr"] as const).map((l) => (
                    <button key={l} onClick={() => setLang(l)}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium border-2 transition-all ${lang === l ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted/30"}`}>
                      {l === "en" ? "🇬🇧 English" : "🇹🇷 Türkçe"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Actions */}
              <div className="rounded-2xl border bg-card overflow-hidden shadow-sm divide-y divide-border">
                {/* Download */}
                <button onClick={handleDownload} className="flex w-full items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      💾 {isTr ? "Verilerimi İndir" : "Download My Data"}
                    </p>
                    <AnimatePresence mode="wait">
                      {downloadState === "idle" && (
                        <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-xs text-muted-foreground">GDPR / KVKK</motion.p>
                      )}
                      {downloadState === "packaging" && (
                        <motion.p key="pkg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-xs text-primary flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {isTr ? "Veriler hazırlanıyor..." : "Packaging your data..."}
                        </motion.p>
                      )}
                      {downloadState === "ready" && (
                        <motion.p key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-xs text-emerald-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {isTr ? "Hazır!" : "Ready!"}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Delete */}
                <button onClick={() => setShowDeleteModal(true)} className="flex w-full items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-600 flex-shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-600">
                      🗑️ {isTr ? "Verilerimi Sil" : "Delete My Data"}
                    </p>
                    <p className="text-xs text-muted-foreground">{isTr ? "Kalıcı silme" : "Permanently erase all data"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground/40 mt-10">DoctoPal v3.7.0 Beta</p>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-card border shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold">{isTr ? "Verilerini Sil" : "Delete Your Data"}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                {isTr
                  ? "Bu işlem geri alınamaz. Tüm sağlık geçmişin, profil bilgilerin ve sorgu kayıtların silinecek."
                  : "This action cannot be undone. All your health history, profile data, and query records will be erased."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                  {isTr ? "İptal" : "Cancel"}
                </button>
                <Link href="/data-delete"
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                  onClick={() => setShowDeleteModal(false)}>
                  {isTr ? "Devam Et" : "Continue"}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
