// © 2026 DoctoPal — All Rights Reserved
// Dashboard FOMO banner — shown only to Free users (effective premium
// === 'none'). Stays out of the way on Premium / Family Premium accounts
// because they already have the capability being advertised.
"use client"

import Link from "next/link"
import { Crown, ArrowRight } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { useEffectivePremium } from "@/lib/use-effective-premium"

export function PremiumFomoBanner() {
  const { lang } = useLang()
  const { isPremium, loading } = useEffectivePremium()
  const tr = lang === "tr"

  // While we're still resolving premium status, render nothing — better a
  // blank beat than a banner that blinks off for a Premium user.
  if (loading || isPremium) return null

  return (
    <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 dark:from-emerald-950/30 dark:via-amber-950/20 dark:to-emerald-950/30 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md flex-shrink-0">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">
              {tr ? "Premium ile aileni koru" : "Protect your family with Premium"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {tr
                ? "Aile üyelerinin sağlık verilerini görüntüle, AI analizi yap, SBAR doktor raporları oluştur. İlk 7 gün ücretsiz, istediğin zaman iptal et."
                : "View family members' health data, run AI analysis, generate SBAR reports. Free for 7 days, cancel anytime."}
            </p>
          </div>
        </div>
        {/* Default-yearly CTA — that's the decoy that converts best. */}
        <Link
          href="/checkout?plan=family-yearly"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-2 text-sm font-bold text-white transition-all shadow-sm hover:shadow-md flex-shrink-0"
        >
          {tr ? "7 Gün Ücretsiz Dene" : "Try Free for 7 Days"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
