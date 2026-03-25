"use client"

import { useAuth } from "@/lib/auth-context"
import { TrialBanner } from "./TrialBanner"

export function TrialBannerWrapper() {
  const { premiumStatus, isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return <TrialBanner status={premiumStatus} />
}
