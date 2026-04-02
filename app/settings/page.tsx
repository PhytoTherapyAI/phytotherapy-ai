// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Bell,
  Shield,
  Download,
  Trash2,
  Watch,
  Award,
  Bug,
  Lock,
  ChevronRight,
  User,
  Check,
  Sparkles,
} from "lucide-react"

const personalityOptions = [
  { id: "compassionate", label: "Compassionate", emoji: "💚", desc: "Warm, empathetic, and gentle" },
  { id: "clinical", label: "Clinical", emoji: "🔬", desc: "Precise, evidence-focused" },
  { id: "witty", label: "Witty", emoji: "✨", desc: "Playful, encouraging, light" },
]

interface SettingsCard {
  id: string
  icon: typeof Bot
  label: string
  desc: string
  color: string
  hasPersonality?: boolean
  isVault?: boolean
  isDanger?: boolean
}

const settingsGroups: { title: string; cards: SettingsCard[] }[] = [
  {
    title: "Personal AI",
    cards: [
      { id: "assistant", icon: Bot, label: "Daily Assistant Bot", desc: "Customize your AI companion", color: "bg-emerald-50 text-emerald-600", hasPersonality: true },
      { id: "notifications", icon: Bell, label: "Notification Preferences", desc: "Manage alerts & reminders", color: "bg-blue-50 text-blue-600" },
    ],
  },
  {
    title: "Digital Vault",
    cards: [
      { id: "privacy", icon: Shield, label: "Privacy Controls", desc: "Manage data permissions", color: "bg-slate-100 text-slate-600" },
      { id: "download", icon: Download, label: "Download Data (GDPR)", desc: "Export your health data", color: "bg-slate-200 text-slate-700", isVault: true },
      { id: "delete", icon: Trash2, label: "Delete Data", desc: "Permanently erase all data", color: "bg-red-50 text-red-600", isVault: true, isDanger: true },
    ],
  },
  {
    title: "Ecosystem",
    cards: [
      { id: "devices", icon: Watch, label: "Connected Devices", desc: "Apple Health, Google Fit", color: "bg-cyan-50 text-cyan-600" },
      { id: "certificates", icon: Award, label: "Certificates", desc: "Your health achievements", color: "bg-amber-50 text-amber-600" },
      { id: "bug", icon: Bug, label: "Report Bug", desc: "Help us improve Doctopal", color: "bg-orange-50 text-orange-600" },
    ],
  },
]

function SecurityShield({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444"

  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Shield className="w-6 h-6 text-emerald-500" />
        <span className="text-lg font-bold text-slate-800">{score}%</span>
      </div>
    </div>
  )
}

function LaborIllusion({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Encrypting your data end-to-end...",
    "Compiling health records...",
    "Packaging your digital vault...",
    "Finalizing secure export...",
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= steps.length - 1) {
          clearInterval(interval)
          setTimeout(onComplete, 800)
          return s
        }
        return s + 1
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-slate-200 border-t-emerald-500"
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-slate-600 text-sm"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center mt-4">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${i <= step ? "bg-emerald-500" : "bg-slate-200"}`}
              animate={i === step ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"

  const [personality, setPersonality] = useState("compassionate")
  const [showLabor, setShowLabor] = useState(false)
  const [laborAction, setLaborAction] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const hasDevices = false
  const securityScore = hasDevices ? 100 : 82

  const handleVaultAction = (action: string) => {
    setLaborAction(action)
    setShowLabor(true)
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"

  return (
    <div className="min-h-screen bg-slate-50">
      <AnimatePresence>
        {showLabor && (
          <LaborIllusion onComplete={() => { setShowLabor(false); setLaborAction(null) }} />
        )}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-slate-800">{displayName}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Personal Command Center</p>
        </motion.div>

        {/* Security Shield */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 flex items-center gap-5"
        >
          <SecurityShield score={securityScore} />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              Security & Privacy Shield
              {securityScore >= 90 && <Check className="w-4 h-4 text-emerald-500" />}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {securityScore >= 90
                ? "Your ecosystem is fully protected."
                : "Connect Apple Health to complete your ecosystem."}
            </p>
            {securityScore < 90 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full"
                onClick={() => router.push("/connected-devices")}
              >
                + Complete Shield
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Settings Groups */}
        {settingsGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + gi * 0.08 }}
            className="mb-6"
          >
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h3>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-100">
              {group.cards.map((card) => (
                <div key={card.id}>
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      if (card.isVault) {
                        handleVaultAction(card.id)
                      } else if (card.hasPersonality) {
                        setExpandedCard(expandedCard === card.id ? null : card.id)
                      } else if (card.id === "devices") {
                        router.push("/connected-devices")
                      } else if (card.id === "notifications") {
                        setExpandedCard(expandedCard === card.id ? null : card.id)
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${card.isDanger ? "text-red-600" : "text-slate-700"}`}>
                        {card.isVault && <Lock className="w-3.5 h-3.5 inline mr-1.5 opacity-50" />}
                        {card.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </motion.button>

                  {/* Personality Selector */}
                  <AnimatePresence>
                    {card.hasPersonality && expandedCard === card.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Choose your assistant personality
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {personalityOptions.map((opt) => (
                              <motion.button
                                key={opt.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setPersonality(opt.id)}
                                className={`p-3 rounded-xl text-center border-2 transition-all ${
                                  personality === opt.id
                                    ? "border-emerald-400 bg-emerald-50"
                                    : "border-slate-100 bg-slate-50"
                                }`}
                              >
                                <span className="text-xl block mb-1">{opt.emoji}</span>
                                <span className="text-xs font-medium text-slate-700 block">{opt.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notification Preferences */}
                  <AnimatePresence>
                    {card.id === "notifications" && expandedCard === card.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {["Medication Reminders", "Daily Health Plan", "Supplement Cycles", "Weekly Summary"].map((item) => (
                            <label key={item} className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">{item}</span>
                              <div className="relative w-10 h-6 bg-emerald-500 rounded-full cursor-pointer">
                                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                              </div>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Version */}
        <p className="text-center text-xs text-slate-300 mt-8">Doctopal v3.0 Beta</p>
      </div>
    </div>
  )
}
