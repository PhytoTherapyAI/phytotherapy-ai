// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Bot, Bell, Shield, Download, Trash2, Watch, Award,
  Bug, ChevronRight, Check, Globe, Lock, AlertTriangle,
  Loader2, Eye, EyeOff, MessageSquare, KeyRound,
} from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"

const PERSONALITY_KEY = "doctopal-ai-personality"

const personalityOptions = [
  { id: "compassionate", label: "Compassionate", labelTr: "Empatik",  emoji: "💚", desc: "Warm, empathetic, and gentle",        descTr: "Sıcak, empatik ve nazik" },
  { id: "clinical",      label: "Clinical",      labelTr: "Klinik",   emoji: "🔬", desc: "Precise, evidence-focused",           descTr: "Kesin, kanıta dayalı" },
  { id: "witty",         label: "Witty",         labelTr: "Esprili",  emoji: "✨", desc: "Playful, encouraging, light",         descTr: "Oyuncu, motive edici" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, isLoading } = useAuth()
  const { lang, setLang } = useLang()
  const isTr = lang === "tr"

  const [personality, setPersonality]       = useState("compassionate")
  const [downloadState, setDownloadState]   = useState<"idle" | "packaging" | "ready">("idle")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notifications, setNotifications]   = useState({ email: true, push: true, dailyPlan: true, weeklySummary: false })

  // Password change state
  const [newPassword, setNewPassword]       = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw]                 = useState(false)
  const [pwState, setPwState]               = useState<"idle" | "loading" | "success" | "error">("idle")
  const [pwError, setPwError]               = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  // Load saved personality
  useEffect(() => {
    const saved = localStorage.getItem(PERSONALITY_KEY)
    if (saved) setPersonality(saved)
  }, [])

  if (isLoading) return <PageSkeleton />

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"

  const handlePersonality = (id: string) => {
    setPersonality(id)
    localStorage.setItem(PERSONALITY_KEY, id)
  }

  const handleDownload = () => {
    setDownloadState("packaging")
    setTimeout(() => setDownloadState("ready"), 3000)
  }

  const handlePasswordChange = async () => {
    setPwError("")
    if (newPassword.length < 8) { setPwError(isTr ? "Şifre en az 8 karakter olmalı" : "Password must be at least 8 characters"); return }
    if (!/[A-Z]/.test(newPassword)) { setPwError(isTr ? "En az 1 büyük harf gerekli" : "Need at least 1 uppercase letter"); return }
    if (newPassword !== confirmPassword) { setPwError(isTr ? "Şifreler eşleşmiyor" : "Passwords don't match"); return }
    if (!user?.id) { setPwError(isTr ? "Kullanıcı bulunamadı" : "User not found"); return }
    setPwState("loading")
    try {
      // Use server-side API with service role key — no email confirmation required
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) { setPwState("error"); setPwError(data.error || (isTr ? "Bir hata oluştu" : "An error occurred")); return }
      setPwState("success")
      setNewPassword(""); setConfirmPassword("")
      setTimeout(() => setPwState("idle"), 3000)
    } catch {
      setPwState("error")
      setPwError(isTr ? "Beklenmeyen bir hata oluştu" : "An unexpected error occurred")
    }
  }

  const SYSTEM_ITEMS = [
    { icon: Bell,          label: isTr ? "Bildirimler" : "Notifications",                     desc: isTr ? "Genel bildirim ayarları" : "General notification settings",        color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600", href: "/notifications" },
    { icon: Bell,          label: isTr ? "Bildirim Tercihleri" : "Notification Preferences", desc: isTr ? "Hangi bildirimleri alacağınızı seçin" : "Choose which notifications", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600",     href: "/notification-preferences" },
    { icon: Watch,         label: isTr ? "Bağlı Cihazlar" : "Connected Devices",              desc: isTr ? "Apple Health, Google Fit" : "Apple Health, Google Fit",           color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600",       href: "/connected-devices" },
    { icon: MessageSquare, label: isTr ? "Günlük Asistan Botu" : "Daily Assistant Bot",       desc: isTr ? "WhatsApp & Telegram bağla" : "Connect WhatsApp & Telegram",       color: "bg-green-50 dark:bg-green-950/30 text-green-600",    href: "/connect-assistant" },
    { icon: Shield,        label: isTr ? "Gizlilik Kontrolleri" : "Privacy Controls",         desc: isTr ? "Veri izinlerini yönet" : "Manage data permissions",              color: "bg-slate-100 dark:bg-slate-800 text-slate-600",      href: "/privacy-controls" },
    { icon: Award,         label: isTr ? "Sertifikalar" : "Certificates",                     desc: isTr ? "Sağlık başarılarınız" : "Your health achievements",               color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600",    href: "/certificates" },
    { icon: Bug,           label: isTr ? "Hata Bildir" : "Bug Report",                        desc: isTr ? "Bizi geliştirmemize yardım et" : "Help us improve DoctoPal",      color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600", href: "/bug-report" },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-lg px-4 py-6 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-heading text-2xl font-bold italic">
            ⚙️ {isTr ? "Kişisel Komuta Merkezi" : "Personal Command Center"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{displayName}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >

          {/* ── AI Personality ── */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                🤖 {isTr ? "AI Kişiliği" : "AI Personality"}
              </h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {isTr ? "Aktif" : "Active"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {isTr ? "Asistanın konuşma tarzını seç — seçim anında uygulanır" : "Choose how your assistant communicates — applied instantly"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {personalityOptions.map((opt) => (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePersonality(opt.id)}
                  className={`p-3 rounded-xl text-center border-2 transition-all ${
                    personality === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-xl block mb-1">{opt.emoji}</span>
                  <span className="text-xs font-medium block">{isTr ? opt.labelTr : opt.label}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">{isTr ? opt.descTr : opt.desc}</span>
                  {personality === opt.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 flex justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Notifications ── */}
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
                    whileTap={{ scale: 0.9 }} layout
                  >
                    <motion.div layout
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ left: notifications[key] ? "calc(100% - 22px)" : "2px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  </motion.button>
                </label>
              ))}
            </div>
          </div>

          {/* ── Security: Password Change ── */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <KeyRound className="h-4 w-4 text-emerald-600" />
              🔐 {isTr ? "Güvenlik — Şifre Değiştir" : "Security — Change Password"}
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={isTr ? "Yeni şifre (min. 8 karakter, 1 büyük harf)" : "New password (min. 8 chars, 1 uppercase)"}
                  className="w-full rounded-xl border bg-muted/40 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={isTr ? "Yeni şifreyi tekrarla" : "Confirm new password"}
                className="w-full rounded-xl border bg-muted/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <AnimatePresence>
                {pwError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {pwError}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePasswordChange}
                disabled={pwState === "loading" || !newPassword || !confirmPassword}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  pwState === "success"
                    ? "bg-emerald-500 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                }`}
              >
                {pwState === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                {pwState === "success" && <Check className="h-4 w-4" />}
                {pwState === "success"
                  ? (isTr ? "Şifre güncellendi!" : "Password updated!")
                  : (isTr ? "Şifreyi Güncelle" : "Update Password")}
              </motion.button>
            </div>
          </div>

          {/* ── System Tools ── */}
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
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* ── Language ── */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-slate-500" />
              🌐 {isTr ? "Dil" : "Language"}
            </h3>
            <div className="flex gap-2">
              {(["en", "tr"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`flex-1 rounded-xl py-2 text-sm font-medium border-2 transition-all ${
                    lang === l ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted/30"
                  }`}>
                  {l === "en" ? "🇬🇧 English" : "🇹🇷 Türkçe"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Data Actions ── */}
          <div className="rounded-2xl border bg-card overflow-hidden shadow-sm divide-y divide-border">
            <button onClick={handleDownload} className="flex w-full items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">💾 {isTr ? "Verilerimi İndir" : "Download My Data"}</p>
                <AnimatePresence mode="wait">
                  {downloadState === "idle"      && <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-muted-foreground">GDPR / KVKK</motion.p>}
                  {downloadState === "packaging" && <motion.p key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-primary flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />{isTr ? "Veriler hazırlanıyor..." : "Packaging..."}</motion.p>}
                  {downloadState === "ready"     && <motion.p key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" />{isTr ? "Hazır!" : "Ready!"}</motion.p>}
                </AnimatePresence>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>

            <button onClick={() => setShowDeleteModal(true)} className="flex w-full items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-600 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-600">🗑️ {isTr ? "Verilerimi Sil" : "Delete My Data"}</p>
                <p className="text-xs text-muted-foreground">{isTr ? "Kalıcı silme (KVKK)" : "Permanently erase all data (GDPR)"}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </div>

        </motion.div>

        <p className="text-center text-xs text-muted-foreground/40 mt-10">DoctoPal v3.7.0 Beta</p>
      </div>

      {/* Delete Modal */}
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
