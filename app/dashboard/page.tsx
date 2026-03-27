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
} from "lucide-react"
import Link from "next/link"
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog"

const TOOL_LINKS = [
  { href: "/history", icon: Clock, labelKey: "nav.history" },
  { href: "/badges", icon: Trophy, labelKey: "badges.title" },
  { href: "/analytics", icon: BarChart3, labelKey: "analytics.title" },
  { href: "/operations", icon: Scissors, labelKey: "operations.title" },
  { href: "/enabiz", icon: FileText, labelKey: "enabiz.title" },
  { href: "/side-effects", icon: AlertTriangle, labelKey: "sideeffect.title" },
  { href: "/wrapped", icon: Sparkles, labelKey: "wrapped.title" },
  { href: "/doctor", icon: Stethoscope, labelKey: "doctor.title" },
]

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
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <Activity className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">{tx(greetingKey, lang).replace("{name}", firstName)}</h1>
          <p className="text-sm text-muted-foreground">{tx("dashboard.subtitle", lang)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

      {/* Tools Grid */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="mb-3 text-lg font-semibold">{tx("dashboard.tools", lang)}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 stagger-children">
          {TOOL_LINKS.map((tool, idx) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`card-hover flex flex-col items-center gap-2 rounded-xl border p-4 text-center tool-card-${idx + 1}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/60 dark:bg-white/10 shadow-sm">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">{tx(tool.labelKey, lang)}</span>
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
