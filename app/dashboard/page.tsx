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
import { Activity, Loader2 } from "lucide-react"
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog"

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
  const [addSupOpen, setAddSupOpen] = useState(false)
  const [supRefreshKey, setSupRefreshKey] = useState(0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">{tx("dashboard.title", lang)}</h1>
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
