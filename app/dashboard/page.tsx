"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard"
// CalorieCalculator moved to tools menu
import { BiologicalAgeCard } from "@/components/dashboard/BiologicalAgeCard"
import { MetabolicPortfolio } from "@/components/dashboard/MetabolicPortfolio"
import { WashoutCountdown } from "@/components/dashboard/WashoutCountdown"
import { WeeklySummaryCard } from "@/components/dashboard/WeeklySummaryCard"
import { SymptomPatternCard } from "@/components/dashboard/SymptomPatternCard"
import { BossFightCard } from "@/components/dashboard/BossFightCard"
import { SeasonalCard } from "@/components/dashboard/SeasonalCard"
import {
  Activity,
  Loader2,
  Clock,
  Trophy,
  BarChart3,
  Scissors,
  FileText,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Scan,
  HeartPulse,
  Apple,
  Beaker,
  Network,
  Target,
  BookOpen,
  Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  Users, ShieldCheck, MessageCircle, ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog"
import { TOOL_CATEGORIES } from "@/lib/tools-hierarchy"
import { Badge } from "@/components/ui/badge"

// Quick-access utility links (non-category items)
const QUICK_LINKS = [
  { href: "/history", icon: Clock, labelKey: "nav.history" },
  { href: "/badges", icon: Trophy, labelKey: "badges.title" },
  { href: "/analytics", icon: BarChart3, labelKey: "analytics.title" },
  { href: "/operations", icon: Scissors, labelKey: "operations.title" },
  { href: "/wrapped", icon: Sparkles, labelKey: "wrapped.title" },
  { href: "/doctor", icon: Stethoscope, labelKey: "doctor.title" },
]

// Icon mapping for categories on dashboard
const CATEGORY_ICON_MAP: Record<string, any> = {
  Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  HeartPulse, Users, BarChart3, ShieldCheck, Stethoscope, MessageCircle,
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
    } catch {
      // silently fail
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) fetchCheckIn()
  }, [user, fetchCheckIn])

  // Refresh check-in when completed
  useEffect(() => {
    const handler = () => fetchCheckIn()
    window.addEventListener("checkin-complete", handler)
    return () => window.removeEventListener("checkin-complete", handler)
  }, [fetchCheckIn])

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:px-12 space-y-8">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <Activity className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{tx(greetingKey, lang).replace("{name}", firstName)}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{tx("dashboard.subtitle", lang)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <DailySummaryCard
            userId={user.id}
            lang={lang}
            userName={profile.full_name}
          />

          <WeeklySummaryCard
            userId={user.id}
            lang={lang}
            isPremium={isPremium}
          />

          <WashoutCountdown
            key={supRefreshKey}
            userId={user.id}
            lang={lang}
            isPremium={isPremium}
            profileSupplements={profile.supplements || []}
            onAddSupplement={() => setAddSupOpen(true)}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <BiologicalAgeCard
            userId={user.id}
            lang={lang}
            isPremium={isPremium}
            chronologicalAge={chronologicalAge}
            userName={profile.full_name ?? undefined}
          />

          <MetabolicPortfolio
            lang={lang}
            isPremium={isPremium}
            checkInData={checkInData}
          />

          <SymptomPatternCard
            userId={user.id}
            lang={lang}
            isPremium={isPremium}
          />

          <BossFightCard
            userId={user.id}
            lang={lang}
            isPremium={isPremium}
          />

          <SeasonalCard
            lang={lang}
            userConditions={profile.chronic_conditions || []}
          />
        </div>
      </div>

      {/* Health Tool Categories */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">{tx("dashboard.tools", lang)}</h2>
          <Link href="/tools" className="text-xs text-primary hover:underline flex items-center gap-1">
            {lang === "tr" ? "Tüm Araçlar" : "All Tools"} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 stagger-children">
          {TOOL_CATEGORIES.slice(0, 8).map((cat, idx) => {
            const Icon = CATEGORY_ICON_MAP[cat.icon] || Sparkles
            return (
              <Link key={cat.id} href={cat.modules[0]?.href || `/${cat.slug}`}
                className={`card-hover flex flex-col gap-2 rounded-xl border p-4 tool-card-${idx + 1}`}
                style={{ borderTopColor: cat.color, borderTopWidth: "2px" }}>
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cat.bgLight} ${cat.bgDark}`}>
                    <Icon className="h-4.5 w-4.5" style={{ color: cat.color }} />
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5">{cat.modules.length}</Badge>
                </div>
                <span className="text-xs font-medium text-foreground">{cat.title[lang]}</span>
              </Link>
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

      {/* Supplement Add Dialog (shared with calendar) */}
      <AddSupplementDialog
        userId={user.id}
        lang={lang}
        open={addSupOpen}
        onOpenChange={setAddSupOpen}
        onSaved={() => setSupRefreshKey(k => k + 1)}
      />
    </div>
  )
}
