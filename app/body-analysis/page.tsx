"use client"

import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { CalorieCalculator } from "@/components/dashboard/CalorieCalculator"
import { Activity } from "lucide-react"

export default function BodyAnalysisPage() {
  const { profile } = useAuth()
  const { lang } = useLang()

  const chronologicalAge = profile?.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : profile?.age

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
          <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("bodyAnalysis.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("bodyAnalysis.subtitle", lang)}
          </p>
        </div>
      </div>

      <CalorieCalculator
        lang={lang}
        defaultAge={chronologicalAge}
        defaultGender={profile?.gender}
        defaultHeight={profile?.height_cm}
        defaultWeight={profile?.weight_kg}
      />
    </div>
  )
}
