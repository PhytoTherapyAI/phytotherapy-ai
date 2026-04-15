// © 2026 DoctoPal — All Rights Reserved
"use client"

import { Crown, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import type { PremiumStatus } from "@/lib/premium"

export function TrialBanner({ status }: { status: PremiumStatus }) {
  const { lang } = useLang()

  // Don't show if not on trial or already premium
  if (!status.isTrialActive || status.plan !== "free") return null

  const urgent = status.trialDaysLeft <= 2

  return (
    <div
      className={`border-b ${
        urgent
          ? "bg-red-50 dark:bg-red-950/30"
          : "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        {urgent ? (
          <Clock className="h-4 w-4 shrink-0 text-red-500" />
        ) : (
          <Crown className="h-4 w-4 shrink-0 text-amber-500" />
        )}
        <p className={`flex-1 text-sm ${urgent ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`}>
          {urgent
            ? tx("trial.expiringBanner", lang).replace("{days}", String(status.trialDaysLeft))
            : tx("trial.activeBanner", lang).replace("{days}", String(status.trialDaysLeft))}
        </p>
        <Link
          href="/pricing"
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white transition-all hover:brightness-110 ${
            urgent
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gradient-to-r from-amber-500 to-orange-500"
          }`}
        >
          {tx("trial.upgradeNow", lang)}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
