// © 2026 Doctopal — All Rights Reserved
"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { Lock, Crown, Sparkles } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import type { PremiumFeature, PremiumStatus } from "@/lib/premium"
import { canAccessFeature } from "@/lib/premium"

interface PremiumGateProps {
  feature: PremiumFeature
  status: PremiumStatus
  children: ReactNode
  fallback?: "blur" | "lock" | "hidden" | "teaser"
  teaserText?: string
}

export function PremiumGate({
  feature,
  status,
  children,
  fallback = "lock",
  teaserText,
}: PremiumGateProps) {
  const { lang } = useLang()

  if (canAccessFeature(feature, status)) {
    return <>{children}</>
  }

  if (fallback === "hidden") return null

  if (fallback === "blur") {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <PremiumBadge lang={lang} teaserText={teaserText} />
        </div>
      </div>
    )
  }

  if (fallback === "teaser") {
    return (
      <div className="relative rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <Crown className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {teaserText || tx("premium.featureLocked", lang)}
            </p>
            <Link
              href="/pricing"
              className="text-xs font-medium text-amber-600 underline hover:text-amber-700 dark:text-amber-400"
            >
              {tx("premium.upgradeCta", lang)}
            </Link>
          </div>
          <Sparkles className="h-5 w-5 text-amber-400" />
        </div>
      </div>
    )
  }

  // Default: lock overlay
  return (
    <div className="relative rounded-xl border bg-muted/30 p-6">
      <PremiumBadge lang={lang} teaserText={teaserText} />
    </div>
  )
}

function PremiumBadge({ lang, teaserText }: { lang: string; teaserText?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
        <Lock className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium">{teaserText || tx("premium.featureLocked", lang as "en" | "tr")}</p>
      <Link
        href="/pricing"
        className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow transition-all hover:shadow-lg hover:brightness-110"
      >
        {tx("premium.upgradeCta", lang as "en" | "tr")}
      </Link>
    </div>
  )
}
