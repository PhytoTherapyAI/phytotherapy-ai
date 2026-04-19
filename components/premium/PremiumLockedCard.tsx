// © 2026 DoctoPal — All Rights Reserved
// Generic full-page locked state for Premium-gated features.
// Used by Prospectus Reader, Family Health Tree, and other standalone Premium
// pages. For inline button gates (like the SBAR download button), trigger
// PremiumUpgradeModal directly instead.
"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { Crown, Sparkles } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { PremiumUpgradeModal } from "@/components/premium/PremiumUpgradeModal"

interface Props {
  /** Turkish name shown in the heading, e.g. "Prospektüs Okuyucu" */
  featureName: string
  /** English name — falls back to featureName when omitted */
  featureNameEn?: string
  /** Optional custom TR description */
  description?: string
  /** Optional custom EN description */
  descriptionEn?: string
  /** Optional icon element — defaults to Sparkles */
  icon?: ReactNode
  /** Extra classes on the outer wrapper */
  className?: string
}

export function PremiumLockedCard({
  featureName,
  featureNameEn,
  description,
  descriptionEn,
  icon,
  className,
}: Props) {
  const { lang } = useLang()
  const tr = lang === "tr"
  const [showModal, setShowModal] = useState(false)

  const displayName = tr ? featureName : featureNameEn ?? featureName
  const displayDescription = tr
    ? description ??
      `${featureName} Premium üyelik ile kullanılabilir. Tüm Premium özelliklerini 7 gün ücretsiz dene, istediğin zaman iptal et.`
    : descriptionEn ??
      `${featureNameEn ?? featureName} is available with Premium. Try all Premium features free for 7 days — cancel anytime.`

  const outerClass =
    "mx-auto max-w-lg rounded-3xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/60 via-background to-background dark:from-amber-950/20 dark:via-background dark:to-background p-8 shadow-xl" +
    (className ? ` ${className}` : "")

  return (
    <div className={outerClass}>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
        {icon ?? <Sparkles className="h-8 w-8" />}
      </div>

      <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {tr ? (
          <>
            <span className="text-amber-700 dark:text-amber-400">{displayName}</span> Premium Özellik
          </>
        ) : (
          <>
            <span className="text-amber-700 dark:text-amber-400">{displayName}</span> is Premium
          </>
        )}
      </h2>

      <p className="mt-4 text-center text-sm sm:text-base leading-relaxed text-foreground/85">
        {displayDescription}
      </p>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-md hover:shadow-lg"
      >
        <Crown className="h-4 w-4" />
        {tr ? "Premium'a Geç — 7 Gün Ücretsiz" : "Go Premium — 7 Days Free"}
      </button>

      <Link
        href="/pricing"
        className="mt-3 block text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {tr ? "Fiyatlandırmayı karşılaştır →" : "Compare pricing →"}
      </Link>

      <PremiumUpgradeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        featureName={displayName}
      />
    </div>
  )
}
