// © 2026 Doctopal — All Rights Reserved
"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { MicroCheckIn } from "./MicroCheckIn"
import { sendMorningSummary } from "@/lib/notifications"

export function MicroCheckInWrapper() {
  const { user, isAuthenticated, profile } = useAuth()
  const { lang } = useLang()

  // Trigger morning notification if applicable
  useEffect(() => {
    if (isAuthenticated && profile?.onboarding_complete) {
      sendMorningSummary(lang)
    }
  }, [isAuthenticated, profile?.onboarding_complete, lang])

  if (!isAuthenticated || !user || !profile?.onboarding_complete) return null

  return (
    <MicroCheckIn
      userId={user.id}
      lang={lang}
      onComplete={() => {
        window.dispatchEvent(new Event("checkin-complete"))
      }}
    />
  )
}
