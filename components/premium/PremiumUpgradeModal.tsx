// © 2026 DoctoPal — All Rights Reserved
// Premium upgrade modal — shown when a Free user taps into a Premium-gated
// feature. Two CTAs (individual / family) + link to /pricing for the full
// comparison page.
"use client"

import Link from "next/link"
import { Crown, Users, Sparkles, X } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"

interface Props {
  open: boolean
  onClose: () => void
  /** Optional short reason shown above the CTAs, e.g. "AI Sağlık Asistanı".
   *  Keep it to one clause — full explainer lives on /pricing. */
  featureName?: string
}

export function PremiumUpgradeModal({ open, onClose, featureName }: Props) {
  const { lang } = useLang()
  const tr = lang === "tr"

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label={tr ? "Kapat" : "Close"}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-center text-xl font-bold text-foreground">
            {tr ? "Premium Özellik" : "Premium Feature"}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
            {featureName
              ? tr
                ? <><strong>{featureName}</strong> Premium üyelik gerektirir.</>
                : <><strong>{featureName}</strong> requires a Premium subscription.</>
              : tr
                ? "Bu özellik Premium üyelik gerektirir."
                : "This feature requires a Premium subscription."}
          </p>
        </div>

        {/* CTA cards */}
        <div className="px-6 pb-4 space-y-3">
          {/* Family Premium — emphasised */}
          <Link
            href="/pricing"
            className="relative block rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 hover:shadow-lg transition-all"
          >
            <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
              {tr ? "EN POPÜLER" : "MOST POPULAR"}
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white flex-shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">
                  {tr ? "Aile Premium" : "Family Premium"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tr
                    ? "6 kişiye kadar tüm aile Premium. 3 kişi olsanız bile tasarruf."
                    : "All premium features for up to 6 family members. Even at 3 people you save."}
                </p>
                <p className="mt-1.5 text-sm">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">₺349</span>
                  <span className="text-xs text-muted-foreground"> / {tr ? "ay" : "mo"}</span>
                </p>
              </div>
            </div>
          </Link>

          {/* Individual Premium */}
          <Link
            href="/pricing"
            className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex-shrink-0">
                <Crown className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">
                  {tr ? "Bireysel Premium" : "Individual Premium"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tr
                    ? "Senin için tüm Premium özellikleri."
                    : "All premium features — just for you."}
                </p>
                <p className="mt-1.5 text-sm">
                  <span className="font-bold text-amber-700 dark:text-amber-400">₺149</span>
                  <span className="text-xs text-muted-foreground"> / {tr ? "ay" : "mo"}</span>
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer link */}
        <div className="px-6 py-3 border-t border-border">
          <Link
            href="/pricing"
            className="block text-center text-xs font-medium text-primary hover:underline"
          >
            {tr ? "Detaylı Karşılaştırma →" : "Detailed Comparison →"}
          </Link>
        </div>
      </div>
    </div>
  )
}
