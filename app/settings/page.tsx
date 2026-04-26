// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useActiveProfile } from "@/lib/use-active-profile"
import { useLang } from "@/components/layout/language-toggle"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Bot, Bell, Shield, Download, Trash2, Watch,
  ChevronRight, Check, Globe,
  Loader2, Eye, EyeOff, KeyRound, AlertTriangle,
} from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"
import { tx } from "@/lib/translations"

const PERSONALITY_KEY = "doctopal-ai-personality"

const personalityOptions = [
  { id: "compassionate", label: "Compassionate", labelTr: "Empatik",  emoji: "💚", desc: "Warm, empathetic, and gentle",        descTr: "Sıcak, empatik ve nazik" },
  { id: "clinical",      label: "Clinical",      labelTr: "Klinik",   emoji: "🔬", desc: "Precise, evidence-focused",           descTr: "Kesin, kanıta dayalı" },
  { id: "witty",         label: "Witty",         labelTr: "Esprili",  emoji: "✨", desc: "Playful, encouraging, light",         descTr: "Oyuncu, motive edici" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, session, isAuthenticated, isLoading } = useAuth()
  const { isOwnProfile } = useActiveProfile()
  const { lang, setLang } = useLang()
  const isTr = lang === "tr"

  const [personality, setPersonality]       = useState("compassionate")
  const [notifications, setNotifications]   = useState({ email: true, push: true, dailyPlan: true, weeklySummary: false })

  // Password change state — F-SETTINGS-001 added currentPassword
  // and a separate Eye/EyeOff toggle for it (so the user can re-read
  // their current password without exposing the new one).
  const [currentPassword, setCurrentPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw]   = useState(false)
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

  // Session 42 F-S-005: auto-reset the password success banner after 5s
  // via an effect with cleanup. Before, handlePasswordChange fired a bare
  // setTimeout that kept running if the user navigated away — leaking
  // timers and leaving pwError hanging if another interaction flipped
  // state in the meantime. Effect restarts on every pwState transition,
  // and cleanup runs on unmount so no setState-after-unmount warnings.
  useEffect(() => {
    if (pwState !== "success") return
    const t = setTimeout(() => {
      setPwState("idle")
      setPwError("")
    }, 5000)
    return () => clearTimeout(t)
  }, [pwState])

  if (isLoading) return <PageSkeleton />

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"

  const handlePersonality = (id: string) => {
    setPersonality(id)
    localStorage.setItem(PERSONALITY_KEY, id)
  }

  // F-SETTINGS-001: full pipeline rewrite.
  //  - Client-side validation mirrors the backend (same 9 rules) so we
  //    can surface i18n feedback without a round-trip on obvious cases.
  //    `pwMismatch` is client-only — backend doesn't take confirmPassword.
  //  - Submit goes through /api/auth/change-password (with the user's
  //    bearer) so the server-side rate limit (5/min/IP), re-auth via
  //    signInWithPassword, and the 9-rule backend validator all fire as
  //    a defense-in-depth layer.
  //  - Backend returns a structured `error: <CODE>` body which we map
  //    to a localized message via switch/case. INTERNAL / unmapped codes
  //    fall back to `pwUnexpected`.
  const handlePasswordChange = async () => {
    setPwError("")

    if (!currentPassword) { setPwError(tx("settings.currentPwRequired", lang)); return }
    if (newPassword.length < 8) { setPwError(tx("settings.pwMin8", lang)); return }
    if (newPassword.length > 72) { setPwError(tx("settings.pwTooLong", lang)); return }
    if (!/[A-Z]/.test(newPassword)) { setPwError(tx("settings.pwUpper", lang)); return }
    if (!/[a-z]/.test(newPassword)) { setPwError(tx("settings.pwLower", lang)); return }
    if (!/[0-9]/.test(newPassword)) { setPwError(tx("settings.pwNumber", lang)); return }
    if (newPassword === currentPassword) { setPwError(tx("settings.pwSameAsCurrent", lang)); return }
    if (
      user?.email &&
      newPassword.toLowerCase() === user.email.toLowerCase()
    ) {
      setPwError(tx("settings.pwSameAsEmail", lang))
      return
    }
    if (newPassword !== confirmPassword) { setPwError(tx("settings.pwMismatch", lang)); return }

    if (!session?.access_token) {
      setPwState("error")
      setPwError(tx("settings.pwUnexpected", lang))
      return
    }

    setPwState("loading")
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        const code = data.error ?? ""
        let msg = tx("settings.pwUnexpected", lang)
        switch (code) {
          case "CURRENT_PASSWORD_WRONG":
            msg = tx("settings.currentPwWrong", lang); break
          case "MISSING_CURRENT_PASSWORD":
            msg = tx("settings.currentPwRequired", lang); break
          case "MISSING_NEW_PASSWORD":
          case "TOO_SHORT":
            msg = tx("settings.pwMin8", lang); break
          case "TOO_LONG":
            msg = tx("settings.pwTooLong", lang); break
          case "MISSING_UPPER":
            msg = tx("settings.pwUpper", lang); break
          case "MISSING_LOWER":
            msg = tx("settings.pwLower", lang); break
          case "MISSING_NUMBER":
            msg = tx("settings.pwNumber", lang); break
          case "SAME_AS_CURRENT":
            msg = tx("settings.pwSameAsCurrent", lang); break
          case "SAME_AS_EMAIL":
            msg = tx("settings.pwSameAsEmail", lang); break
          // INTERNAL / RATE_LIMITED / UNAUTHORIZED → fall through to generic
        }
        setPwState("error")
        setPwError(msg)
        return
      }

      setPwState("success")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      // Auto-reset to "idle" is handled by the effect above (F-S-005).
    } catch {
      setPwState("error")
      setPwError(tx("settings.pwUnexpected", lang))
    }
  }

  const SYSTEM_ITEMS = [
    { icon: Bell,          label: tx("settings.notifications", lang),     desc: tx("settings.notificationsDesc", lang),     color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600",  href: "/notifications" },
    { icon: Watch,         label: tx("settings.connectedDevices", lang),  desc: tx("settings.connectedDevicesDesc", lang),  color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600",        href: "/connected-devices" },
    { icon: Shield,        label: tx("settings.privacyControls", lang),   desc: tx("settings.privacyControlsDesc", lang),   color: "bg-slate-100 dark:bg-slate-800 text-slate-600",       href: "/privacy-controls" },
    { icon: Download,      label: tx("settings.exportData", lang),        desc: tx("settings.exportDataDesc", lang),        color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600",  href: "/data-export" },
    { icon: Trash2,        label: tx("settings.deleteData", lang),        desc: tx("settings.deleteDataDesc", lang),        color: "bg-red-50 dark:bg-red-950/30 text-red-500",           href: "/data-delete" },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-lg px-4 py-6 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-heading text-2xl font-bold italic">
            ⚙️ {tx("settings.commandCenter", lang)}
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
                🤖 {tx("settings.aiPersonality", lang)}
              </h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {tx("settings.active", lang)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {tx("settings.personalityDesc", lang)}
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
              🔔 {tx("settings.notifications", lang)}
            </h3>
            <div className="space-y-3">
              {([
                ["email",         tx("settings.emailNotif", lang)],
                ["push",          tx("settings.pushNotif", lang)],
                ["dailyPlan",     tx("settings.dailyPlan", lang)],
                ["weeklySummary", tx("settings.weeklySummary", lang)],
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

          {/* ── Security: Password Change ──
              Session 42 FP-D: when the user is viewing another family
              member's profile (isOwnProfile === false), the Supabase
              updateUser call would still change the CALLER'S password,
              not the viewed member's — causing confusing UX and potential
              self-lockout if the caregiver thought they were resetting
              the family member. In that context we render an info card
              explaining the boundary instead of the form. */}
          {isOwnProfile ? (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <KeyRound className="h-4 w-4 text-emerald-600" />
                🔐 {tx("settings.securityChangePw", lang)}
              </h3>
              <div className="space-y-3">
                {/* F-SETTINGS-001: current password field, first in the
                    visual order so the user re-authenticates before
                    composing a new password. Eye toggle is independent
                    of the new-password toggle below. */}
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder={tx("settings.currentPwPlaceholder", lang)}
                    autoComplete="current-password"
                    className="w-full rounded-xl border bg-muted/40 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showCurrentPw ? "Hide password" : "Show password"}>
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder={tx("settings.newPwPlaceholder", lang)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border bg-muted/40 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={tx("settings.confirmPwPlaceholder", lang)}
                  autoComplete="new-password"
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
                  disabled={
                    pwState === "loading" ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    pwState === "success"
                      ? "bg-emerald-500 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                  }`}
                >
                  {pwState === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {pwState === "success" && <Check className="h-4 w-4" />}
                  {pwState === "success"
                    ? tx("settings.pwUpdated", lang)
                    : tx("settings.updatePw", lang)}
                </motion.button>
                {/* F-SETTINGS-001: removed the "📧 confirmation email
                    sent" paragraph — Supabase password-only updates are
                    synchronous and don't trigger a confirmation email,
                    so the previous copy was misleading. The button's
                    success state ("Şifren güncellendi") now carries the
                    full feedback. */}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                🔐 {tx("settings.securityChangePw", lang)}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isTr
                  ? "Aile üyesinin parolasını buradan değiştiremezsin. Her kullanıcı kendi parolasını kendi hesabında yönetir. Kendi parolanı değiştirmek için kendi profiline dön."
                  : "You can't change a family member's password from here. Each user manages their own password in their own account. Switch back to your own profile to change your password."}
              </p>
            </div>
          )}

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
              🌐 {tx("settings.language", lang)}
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


        </motion.div>

        <p className="text-center text-xs text-muted-foreground/40 mt-10">DoctoPal v3.7.0 Beta</p>
      </div>

    </div>
  )
}
