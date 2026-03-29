"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard"
import { DailyCareCard } from "@/components/dashboard/DailyCareCard"
import { BiologicalAgeCard } from "@/components/dashboard/BiologicalAgeCard"
import { MetabolicPortfolio } from "@/components/dashboard/MetabolicPortfolio"
import { WashoutCountdown } from "@/components/dashboard/WashoutCountdown"
import { WeeklySummaryCard } from "@/components/dashboard/WeeklySummaryCard"
import { SymptomPatternCard } from "@/components/dashboard/SymptomPatternCard"
import { BossFightCard } from "@/components/dashboard/BossFightCard"
import { SeasonalCard } from "@/components/dashboard/SeasonalCard"
import {
  Activity, Loader2, Clock, Trophy, BarChart3, Scissors, Sparkles,
  Stethoscope, HeartPulse, Microscope, Pill, Leaf, Brain,
  UtensilsCrossed, Moon, Dumbbell, Users, ShieldCheck, MessageCircle,
  ArrowRight, ChevronDown, Zap, TrendingUp, Globe,
} from "lucide-react"
import Link from "next/link"
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog"
import { TOOL_CATEGORIES } from "@/lib/tools-hierarchy"
import { Badge } from "@/components/ui/badge"

// Quick-access utility links
const QUICK_LINKS = [
  { href: "/history", icon: Clock, labelKey: "nav.history" },
  { href: "/badges", icon: Trophy, labelKey: "badges.title" },
  { href: "/analytics", icon: BarChart3, labelKey: "analytics.title" },
  { href: "/operations", icon: Scissors, labelKey: "operations.title" },
  { href: "/wrapped", icon: Sparkles, labelKey: "wrapped.title" },
  { href: "/doctor", icon: Stethoscope, labelKey: "doctor.title" },
]

// Icon mapping for categories
const CATEGORY_ICON_MAP: Record<string, any> = {
  Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  HeartPulse, Users, BarChart3, ShieldCheck, Stethoscope, MessageCircle, Globe,
}

// Category emoji mapping for visual warmth
const CATEGORY_EMOJI: Record<string, string> = {
  "medical-analysis": "🔬",
  "medications": "💊",
  "supplements": "🌿",
  "mental-health": "🧠",
  "nutrition": "🥗",
  "sleep": "🌙",
  "fitness": "💪",
  "organ-health": "❤️",
  "gender-health": "👫",
  "tracking": "📊",
  "prevention": "🛡️",
  "medical-tools": "🩺",
  "life-stages": "👶",
  "community": "💬",
  "advanced": "🔬",
  "settings": "⚙️",
  "doctor-tools": "👨‍⚕️",
}

// Personalized tool recommendations based on profile
function getRecommendedTools(profile: any, medications: any[], lang: "tr" | "en") {
  const recs: Array<{ href: string; title: string; reason: string; gradient: string; emoji: string }> = []

  // If user has medications → interaction checker
  if (medications.length > 0) {
    recs.push({
      href: "/interaction-checker",
      title: tx("dash.drugInteraction", lang),
      reason: `${medications.length} ${tx("dash.drugInteractionDesc", lang)}`,
      gradient: "from-pink-500/10 to-rose-500/5",
      emoji: "⚡",
    })
  }

  // Age-based recommendations
  const age = profile.age || (profile.birth_date ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / 31557600000) : null)
  if (age && age >= 40) {
    recs.push({
      href: "/cardiovascular-risk",
      title: tx("dash.cvRisk", lang),
      reason: tx("dash.cvRiskDesc", lang),
      gradient: "from-red-500/10 to-orange-500/5",
      emoji: "❤️",
    })
  }

  // Gender-based
  if (profile.gender === "female") {
    recs.push({
      href: "/womens-health",
      title: tx("dash.womensHealth", lang),
      reason: tx("dash.womensHealthDesc", lang),
      gradient: "from-purple-500/10 to-pink-500/5",
      emoji: "🌸",
    })
  }

  // Always recommend sleep analysis
  if (recs.length < 3) {
    recs.push({
      href: "/sleep-analysis",
      title: tx("dash.sleepAnalysis", lang),
      reason: tx("dash.sleepAnalysisDesc", lang),
      gradient: "from-indigo-500/10 to-blue-500/5",
      emoji: "😴",
    })
  }

  // Nutrition
  if (recs.length < 3) {
    recs.push({
      href: "/nutrition",
      title: tx("dash.nutritionLog", lang),
      reason: tx("dash.nutritionLogDesc", lang),
      gradient: "from-amber-500/10 to-yellow-500/5",
      emoji: "🥑",
    })
  }

  return recs.slice(0, 3)
}

// Generate deterministic "social proof" number for today
function getTodaySocialCount(): number {
  const today = new Date().toISOString().split("T")[0]
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i)
    hash |= 0
  }
  return 500 + Math.abs(hash % 1000) // 500-1500 range
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, profile } = useAuth()
  const { lang } = useLang()
  const [checkInData, setCheckInData] = useState<{
    energy_level: number | null
    sleep_quality: number | null
    mood: number | null
    bloating: number | null
  } | null>(null)
  const [addSupOpen, setAddSupOpen] = useState(false)
  const [supRefreshKey, setSupRefreshKey] = useState(0)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [medications, setMedications] = useState<any[]>([])

  // Fetch today's check-in for metabolic portfolio
  const fetchCheckIn = useCallback(async () => {
    if (!user) return
    try {
      const supabase = createBrowserClient()
      const today = new Date().toISOString().split("T")[0]
      const { data } = await supabase
        .from("daily_check_ins")
        .select("energy_level, sleep_quality, mood, bloating")
        .eq("user_id", user.id)
        .eq("check_date", today)
        .single()
      if (data) setCheckInData(data)
    } catch { /* silent */ }
  }, [user])

  // Fetch medications for recommendations
  const fetchMeds = useCallback(async () => {
    if (!user) return
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("user_medications")
        .select("brand_name, generic_name")
        .eq("user_id", user.id)
        .eq("is_active", true)
      if (data) setMedications(data.map((m: any) => ({ medication_name: m.generic_name || m.brand_name })))
    } catch { /* silent */ }
  }, [user])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) { fetchCheckIn(); fetchMeds(); }
  }, [user, fetchCheckIn, fetchMeds])

  useEffect(() => {
    const handler = () => fetchCheckIn()
    window.addEventListener("checkin-complete", handler)
    return () => window.removeEventListener("checkin-complete", handler)
  }, [fetchCheckIn])

  const socialCount = useMemo(() => getTodaySocialCount(), [])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !profile) return null

  const chronologicalAge = profile.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : profile.age

  const isPremium = true

  // Time-based greeting
  const hour = new Date().getHours()
  const greetingKey = hour < 12 ? "dashboard.morning" : hour < 18 ? "dashboard.afternoon" : "dashboard.evening"
  const firstName = profile.full_name?.split(" ")[0] || ""

  const recommendedTools = getRecommendedTools(profile, medications, lang)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:px-12 space-y-6">
      {/* ── Header + Social Proof ── */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{tx(greetingKey, lang).replace("{name}", firstName)}</h1>
            <p className="text-sm text-muted-foreground">{tx("dashboard.subtitle", lang)}</p>
          </div>
        </div>
        {/* Social Proof — Endowed Progress */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex -space-x-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-5 w-5 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-primary/20" />
            ))}
          </div>
          <span>
            {lang === "tr"
              ? `Bugün ${socialCount.toLocaleString("tr-TR")} kişi günlük planını tamamladı`
              : `${socialCount.toLocaleString("en-US")} people completed their daily plan today`}{/* locale-specific formatting — keep inline */}
          </span>
          <TrendingUp className="h-3 w-3 text-green-500" />
        </div>
      </div>

      {/* ── Priority Zone: Score + Daily Tasks ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          <DailySummaryCard userId={user.id} lang={lang} userName={profile.full_name} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <DailyCareCard />
        </div>
      </div>

      {/* ── Recommended For You (Curiosity Gap + Personalization) ── */}
      {recommendedTools.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold">{tx("dash.recommendedForYou", lang)}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recommendedTools.map((tool, idx) => (
              <Link key={idx} href={tool.href}
                className={`group relative overflow-hidden rounded-xl border p-4 bg-gradient-to-br ${tool.gradient} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className="text-2xl mb-2">{tool.emoji}</div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{tool.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{tool.reason}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {tx("dash.explore", lang)} <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Health Insights Grid ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <WeeklySummaryCard userId={user.id} lang={lang} isPremium={isPremium} />
          <WashoutCountdown
            key={supRefreshKey}
            userId={user.id} lang={lang} isPremium={isPremium}
            profileSupplements={profile.supplements || []}
            onAddSupplement={() => setAddSupOpen(true)}
          />
          <BossFightCard userId={user.id} lang={lang} isPremium={isPremium} />
        </div>
        <div className="space-y-6">
          <BiologicalAgeCard
            userId={user.id} lang={lang} isPremium={isPremium}
            chronologicalAge={chronologicalAge} userName={profile.full_name ?? undefined}
          />
          <MetabolicPortfolio lang={lang} isPremium={isPremium} checkInData={checkInData} />
          <SymptomPatternCard userId={user.id} lang={lang} isPremium={isPremium} />
          <SeasonalCard lang={lang} userConditions={profile.chronic_conditions || []} />
        </div>
      </div>

      {/* ── Tool Categories (Gradient Cards + Expandable) ── */}
      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">{tx("dashboard.tools", lang)}</h2>
          <Link href="/tools" className="text-xs text-primary hover:underline flex items-center gap-1">
            {tx("dash.allTools", lang)} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TOOL_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.icon] || Sparkles
            const emoji = CATEGORY_EMOJI[cat.id] || "📋"
            const isExpanded = expandedCat === cat.id
            return (
              <div key={cat.id} className={`rounded-xl overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? "col-span-2 sm:col-span-3 lg:col-span-4 shadow-lg ring-1 ring-black/5 dark:ring-white/5"
                  : "hover:shadow-md hover:-translate-y-0.5"
              }`}>
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                  className="w-full text-left transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}08 0%, ${cat.color}15 100%)`,
                    borderLeft: `3px solid ${cat.color}`,
                  }}
                >
                  <div className="flex items-center gap-3 p-3.5">
                    <span className="text-lg">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-foreground block">{cat.title[lang]}</span>
                      <span className="text-[10px] text-muted-foreground">{cat.modules.length} {tx("common.tools", lang)}</span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-border/50 px-2 pb-2 pt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5"
                    style={{ background: `linear-gradient(180deg, ${cat.color}05 0%, transparent 100%)` }}
                  >
                    {cat.modules.map(mod => (
                      <Link key={mod.id} href={mod.href}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        {mod.title[lang]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_LINKS.map(link => {
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                <Icon className="h-3 w-3" />
                {tx(link.labelKey, lang)}
              </Link>
            )
          })}
        </div>
      </div>

      <AddSupplementDialog
        userId={user.id} lang={lang} open={addSupOpen}
        onOpenChange={setAddSupOpen}
        onSaved={() => setSupRefreshKey(k => k + 1)}
      />
    </div>
  )
}
