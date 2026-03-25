"use client"

import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { CalorieCalculator } from "@/components/dashboard/CalorieCalculator"
import { Calculator } from "lucide-react"

export default function CaloriePage() {
  const { profile } = useAuth()
  const { lang } = useLang()

  const chronologicalAge = profile?.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : profile?.age

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">
          {lang === "tr" ? "Kalori Hesaplayıcı" : "Calorie Calculator"}
        </h1>
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
