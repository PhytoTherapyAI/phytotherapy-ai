// © 2026 DoctoPal — All Rights Reserved
//
// Premium upgrade modal — shown when a Free user hits a Premium gate.
//
// Session 45 redesign:
//   - Default billing toggle is MONTHLY (lower commitment, conversion lift).
//   - Headline price is the per-month figure in BOTH modes.
//     Yearly mode adds a small grey "Yıllık ₺X tek seferde" line + savings pill.
//   - Individual plan is the emphasised one ("EN POPÜLER"); Family stays
//     present below it but visually secondary.
//   - All prices read from lib/pricing.ts — no hardcoded amounts.
"use client"

import Link from "next/link"
import { useState } from "react"
import { Crown, Users, Sparkles, X, Gift } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { PRICING, type Billing, planParam, formatTry, headlineAmount, annualSecondaryLine, savingsBadge } from "@/lib/pricing"
import { PricingToggle } from "@/components/premium/PricingToggle"

interface Props {
  open: boolean
  onClose: () => void
  /** Optional short reason shown above the toggle, e.g. "AI Sağlık Asistanı".
   *  Keep it to one clause — the long-form value prop lives on /pricing. */
  featureName?: string
}

export function PremiumUpgradeModal({ open, onClose, featureName }: Props) {
  const { lang } = useLang()
  const tr = lang === "tr"
  const [billing, setBilling] = useState<Billing>("monthly")

  if (!open) return null

  const ind = PRICING.individual
  const fam = PRICING.family
  const indHeadline = headlineAmount(ind, billing)
  const famHeadline = headlineAmount(fam, billing)
  const indAnnual = annualSecondaryLine(ind, billing, lang as "tr" | "en")
  const famAnnual = annualSecondaryLine(fam, billing, lang as "tr" | "en")
  const indSavings = savingsBadge(ind, billing, lang as "tr" | "en")
  const famSavings = savingsBadge(fam, billing, lang as "tr" | "en")

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-3">
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

        {/* 7-day free trial emphasis — sits above the CTAs so it reads first. */}
        <div className="mx-6 mb-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
          <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
            {tr
              ? "İlk 7 gün ücretsiz — istediğin zaman iptal et."
              : "Free for 7 days — cancel anytime."}
          </p>
        </div>

        {/* Billing toggle — default MONTHLY per Session 45 redesign. */}
        <div className="px-6 mb-3 flex justify-center">
          <PricingToggle
            value={billing}
            onChange={setBilling}
            yearlySavingsPercent={ind.savingsPercent}
            lang={lang as "tr" | "en"}
          />
        </div>

        {/* CTA cards — INDIVIDUAL emphasised first, FAMILY secondary below. */}
        <div className="px-6 pb-4 space-y-3">
          {/* Individual Premium — emphasised */}
          <Link
            href={`/checkout?plan=${planParam("individual", billing)}`}
            className="relative block rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 hover:shadow-lg transition-all"
          >
            <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
              {tr ? "EN POPÜLER" : "MOST POPULAR"}
            </div>
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
                    ? "Senin için tüm Premium özellikler."
                    : "All premium features — just for you."}
                </p>
                <p className="mt-1.5 flex items-baseline gap-1">
                  <span className="font-bold text-lg text-foreground">{indHeadline.amount}</span>
                  <span className="text-xs text-muted-foreground">{tr ? indHeadline.perTr : indHeadline.perEn}</span>
                  {indSavings && (
                    <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      {indSavings}
                    </span>
                  )}
                </p>
                {indAnnual && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{indAnnual}</p>
                )}
              </div>
            </div>
          </Link>

          {/* Family Premium — secondary */}
          <Link
            href={`/checkout?plan=${planParam("family", billing)}`}
            className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/40 transition-colors"
          >
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
                    ? `Tüm aile üyeleri Premium (${fam.maxMembers} kişiye kadar).`
                    : `All family members get Premium (up to ${fam.maxMembers}).`}
                </p>
                <p className="mt-1.5 flex items-baseline gap-1">
                  <span className="font-bold text-lg text-foreground">{famHeadline.amount}</span>
                  <span className="text-xs text-muted-foreground">{tr ? famHeadline.perTr : famHeadline.perEn}</span>
                  {famSavings && (
                    <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      {famSavings}
                    </span>
                  )}
                </p>
                {famAnnual && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{famAnnual}</p>
                )}
              </div>
            </div>
          </Link>

          {/* Family flexibility note */}
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center pt-1">
            {tr
              ? `Tüm aile üyeleri premium özelliklerden yararlanır (${fam.maxMembers} kişiye kadar). İstediğin zaman yıllık plana geçebilirsin.`
              : `All family members get premium features (up to ${fam.maxMembers}). You can switch to yearly any time.`}
          </p>
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

// Re-export of formatTry for ad-hoc consumers; pricing logic lives in
// lib/pricing.ts. Keeps this file's surface minimal but discoverable.
export { formatTry }
