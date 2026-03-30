// © 2026 Phytotherapy.ai — All Rights Reserved
// Health Roadmap — Gamified Quest Journey with Shield Gauge
"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { InnovationShell } from "@/components/innovation/InnovationShell"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import {
  calculateRiskScore, CARE_PACKAGES,
  type PatientData, type CarePackage,
} from "@/lib/care-pathways"
import {
  Shield, Target, Loader2, Lock, Check, ChevronRight,
  Sparkles, Leaf, Heart, Droplets, Moon, Activity, Pill,
} from "lucide-react"

const PKG_ICONS: Record<string, React.ElementType> = { Droplets, Moon, Heart }

// ── Shield Gauge (Apple Fitness style) ──
function ShieldGauge({ score, size = 140 }: { score: number; size?: number }) {
  const pct = Math.min(score, 100)
  const stroke = 8
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444"

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-muted, #e5e7eb)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform={`rotate(-90 ${size/2} ${size/2})`} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Shield className="h-8 w-8 mb-0.5" style={{ color }} />
          <span className="text-xl font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
    </div>
  )
}

// ── Journey Steps ──
interface JourneyStep {
  id: string
  title: { en: string; tr: string }
  desc: { en: string; tr: string }
  icon: React.ElementType
  status: "completed" | "active" | "locked"
}

const JOURNEY_STEPS: JourneyStep[] = [
  { id: "risk", title: { en: "Basic Risk Analysis", tr: "Temel Risk Analizi" }, desc: { en: "Health profile scanned and risk factors identified", tr: "Sağlık profili tarandı, risk faktörleri belirlendi" }, icon: Target, status: "completed" },
  { id: "lifestyle", title: { en: "Lifestyle Optimization", tr: "Yaşam Tarzı Optimizasyonu" }, desc: { en: "Nutrition, sleep, and exercise adjustments", tr: "Beslenme, uyku ve egzersiz ayarlamaları" }, icon: Activity, status: "active" },
  { id: "phyto", title: { en: "Advanced Phytotherapy Protocol", tr: "İleri Düzey Fitoterapi Protokolü" }, desc: { en: "Personalized herbal supplement plan", tr: "Kişiselleştirilmiş bitkisel takviye planı" }, icon: Leaf, status: "locked" },
  { id: "monitor", title: { en: "Continuous Monitoring", tr: "Sürekli İzleme" }, desc: { en: "AI-powered health tracking and alerts", tr: "AI destekli sağlık takibi ve uyarılar" }, icon: Sparkles, status: "locked" },
]

export default function HealthRoadmapPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [loading, setLoading] = useState(true)
  const [patientData, setPatientData] = useState<PatientData | null>(null)

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const [profileRes, medsRes] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_medications").select("brand_name").eq("user_id", user.id),
      ])
      const profile = profileRes.data
      const medCount = medsRes.data?.length || 0
      setPatientData({
        age: (() => { try { if (profile?.date_of_birth) { return Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000) } return 35 } catch { return 35 } })(),
        gender: profile?.gender || "unknown", conditions: (profile?.chronic_conditions || "").split(",").filter(Boolean),
        medicationCount: medCount, allergies: [], recentLabFlags: 1, symptomSeverity: 3,
        complianceRate: 85, hospitalizationsLastYear: 0, polypharmacy: medCount >= 5,
      })
    } catch { /* silent */ }
    setLoading(false)
  }

  const risk = useMemo(() => patientData ? calculateRiskScore(patientData) : null, [patientData])
  const shieldScore = risk ? Math.max(0, 100 - risk.score) : 85

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{isTr ? "Sağlık profiliniz analiz ediliyor..." : "Analyzing your health profile..."}</p>
    </div>
  )

  return (
    <InnovationShell>
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">{isTr ? "Sağlık Serüveniniz" : "Your Health Quest"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{isTr ? "Kalkanınızı güçlendirin, aşamaları tamamlayın" : "Strengthen your shield, complete the stages"}</p>
      </div>

      {/* ── Shield Gauge ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-soft text-center mb-6">
        <ShieldGauge score={shieldScore} />
        <h3 className="text-sm font-bold mt-3">{isTr ? "Koruyucu Sağlık Kalkanı" : "Protective Health Shield"}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {shieldScore >= 80
            ? (isTr ? "Kalkanınız güçlü! Böyle devam edin." : "Your shield is strong! Keep it up.")
            : (isTr ? "Kalkanınızı güçlendirmek için aşamaları tamamlayın." : "Complete stages to strengthen your shield.")}
        </p>
      </div>

      {/* ── Duolingo-style Vertical Journey ── */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          {isTr ? "Yol Haritası" : "Journey Map"}
        </h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          {JOURNEY_STEPS.map((step, i) => {
            const Icon = step.icon
            const isCompleted = step.status === "completed"
            const isActive = step.status === "active"
            const isLocked = step.status === "locked"

            return (
              <div key={step.id} className="relative pl-14 pb-6 last:pb-0">
                {/* Node */}
                <div className={`absolute left-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 z-10 transition-all ${
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isActive
                    ? "border-primary bg-primary/10 text-primary animate-[pulse_2s_ease-in-out_infinite]"
                    : "border-gray-300 bg-muted text-muted-foreground dark:border-gray-600"
                }`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : <Icon className="h-4 w-4" />}
                </div>

                {/* Card */}
                <div className={`rounded-2xl border p-4 transition-all ${
                  isActive ? "border-primary/30 bg-primary/5 shadow-soft-md dark:bg-primary/10" :
                  isCompleted ? "bg-emerald-50/30 dark:bg-emerald-950/10" :
                  "opacity-60"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-sm font-bold ${isLocked ? "text-muted-foreground" : ""}`}>
                        {step.title[lang as "en" | "tr"]}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc[lang as "en" | "tr"]}</p>
                    </div>
                    {isActive && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-600">{isTr ? "Tamamlandı" : "Done"}</span>
                    )}
                    {isLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Mystery Locked Care Packages ── */}
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        {isTr ? "Kişiselleştirilmiş Paketler" : "Personalized Packages"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Unlocked package */}
        {CARE_PACKAGES.slice(0, 1).map(pkg => {
          const PkgIcon = PKG_ICONS[pkg.icon] || Activity
          return (
            <div key={pkg.id} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${pkg.color}15` }}>
                  <PkgIcon className="h-5 w-5" style={{ color: pkg.color }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{pkg.title[lang as "en" | "tr"]}</h4>
                  <p className="text-[10px] text-muted-foreground">{pkg.components.length} {isTr ? "bileşen" : "components"}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{pkg.description[lang as "en" | "tr"]}</p>
              <button className="w-full rounded-xl bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]">
                {isTr ? "Paketi Başlat" : "Start Package"}
              </button>
            </div>
          )
        })}

        {/* Locked mystery packages */}
        {[1, 2].map(i => (
          <div key={i} className="relative rounded-2xl border bg-card p-4 overflow-hidden">
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[6px] bg-background/60 z-10 flex flex-col items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground text-center px-4 max-w-[180px]">
                {isTr
                  ? `Adım 2'yi tamamlayarak bu paketi açın`
                  : `Complete Step 2 to unlock this package`}
              </p>
            </div>
            {/* Blurred content behind */}
            <div className="flex items-center gap-3 mb-2 opacity-40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"><Pill className="h-5 w-5" /></div>
              <div>
                <div className="h-3 w-32 rounded bg-muted" />
                <div className="h-2 w-20 rounded bg-muted mt-1" />
              </div>
            </div>
            <div className="space-y-1.5 opacity-40">
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-4/5 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-muted-foreground/40">{tx("disclaimer.tool", lang)}</p>
    </div>
    </InnovationShell>
  )
}
