// © 2026 DoctoPal — All Rights Reserved
//
// Reusable plan card used by /pricing and PremiumUpgradeModal.
// Display rules (per Session 45 redesign):
//   - Headline figure is the per-month amount in BOTH modes:
//       monthly tab: ₺149/ay
//       yearly tab : ₺117/ay  (yearlyMonthlyEquivalent)
//   - Yearly tab adds a small grey "Yıllık ₺1.399 tek seferde" line
//     under the headline + a "%22 tasarruf" pill near the price.
//   - The annual lump sum is NEVER the headline number.
//   - Individual plan is the emphasised one (`emphasised={true}`),
//     Family stays present but visually secondary.
"use client"

import Link from "next/link"
import type { ComponentType } from "react"
import { Check, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import {
  PRICING,
  type Billing,
  type PlanId,
  headlineAmount,
  annualSecondaryLine,
  savingsBadge,
  planParam,
} from "@/lib/pricing"

interface PricingCardProps {
  planId: PlanId
  billing: Billing
  lang: "tr" | "en"
  /** Visual emphasis — emerald ring + "EN POPÜLER" badge + scale on lg. */
  emphasised?: boolean
  /** Lucide icon component shown in the corner. */
  icon: ComponentType<{ className?: string }>
  /** Tailwind gradient classes for the icon background tile. */
  iconBg: string
  /** Plan title — "Bireysel Premium" / "Aile Premium". */
  title: string
  /** One-sentence value prop under the title. */
  description: string
  /** Bullet list of plan features. */
  features: string[]
  /** Full label for the primary CTA button. */
  ctaLabel: string
  /** Disabled when the plan is already active or activation is in flight. */
  ctaDisabled?: boolean
  /** Spinner inside the CTA. */
  ctaLoading?: boolean
  /** Optional small footnote under the trial-note (e.g. "Sadece aile sahibi"). */
  ctaSubNote?: string
  /** Trial copy under the CTA. Pass undefined to suppress. */
  trialNote?: string
  /** Optional secondary action (owner manual activation link, etc). */
  secondaryCtaLabel?: string
  onSecondaryCta?: () => void
  /** Tap handler for the primary CTA. Card builds a `?plan=…` URL via
   *  the shared `planParam()` helper so callers stay agnostic of the
   *  URL format — if checkout ever moves, it changes in one place. */
  onCta?: () => void
  /** When set, the primary CTA is rendered as a `<Link>` to this href
   *  instead of a button. Used by the in-modal cards which navigate
   *  to /checkout directly. */
  href?: string
}

export function PricingCard(p: PricingCardProps) {
  const plan = PRICING[p.planId]
  const Icon = p.icon
  const headline = headlineAmount(plan, p.billing)
  const annualLine = annualSecondaryLine(plan, p.billing, p.lang)
  const savings = savingsBadge(plan, p.billing, p.lang)
  const tr = p.lang === "tr"

  const wrapperClasses = `relative flex flex-col rounded-2xl border bg-card p-5 sm:p-6 transition-all ${
    p.emphasised
      ? "border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20 shadow-xl lg:scale-[1.02]"
      : "border-border shadow-sm"
  }`

  const ctaClasses = p.emphasised
    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
    : "bg-foreground text-background hover:bg-foreground/90"

  const primaryCta = (
    <span
      className={`inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold transition-all w-full ${ctaClasses} ${
        p.ctaDisabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {p.ctaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {p.ctaLabel}
      {!p.ctaLoading && !p.ctaDisabled ? <ArrowRight className="h-4 w-4" /> : null}
    </span>
  )

  const ctaHref = p.href ?? `/checkout?plan=${planParam(p.planId, p.billing)}`

  return (
    <div className={wrapperClasses}>
      {p.emphasised && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-[10px] font-bold text-white shadow-md">
          <Sparkles className="h-2.5 w-2.5" />
          {tr ? "EN POPÜLER" : "MOST POPULAR"}
        </div>
      )}

      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.iconBg} text-white shadow-md`}>
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-xl font-bold text-foreground">{p.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.description}</p>

      {/* Headline price — per-month in both billing modes. */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-foreground">{headline.amount}</span>
        <span className="text-sm text-muted-foreground">{tr ? headline.perTr : headline.perEn}</span>
      </div>

      {/* Yearly tab only: small grey annual line + savings pill. */}
      {annualLine && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-xs text-muted-foreground">{annualLine}</p>
          {savings && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-2.5 w-2.5" />
              {savings}
            </span>
          )}
        </div>
      )}

      <ul className="mt-5 space-y-2.5 flex-1">
        {p.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      {/* Primary CTA — Link by default, button when onCta is provided. */}
      <div className="mt-6">
        {p.onCta ? (
          <button type="button" onClick={p.onCta} disabled={p.ctaDisabled} className="w-full">
            {primaryCta}
          </button>
        ) : (
          <Link href={ctaHref} aria-disabled={p.ctaDisabled || undefined} className="block">
            {primaryCta}
          </Link>
        )}
      </div>

      {p.trialNote && !p.ctaDisabled && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">{p.trialNote}</p>
      )}

      {p.secondaryCtaLabel && p.onSecondaryCta && (
        <button
          type="button"
          onClick={p.onSecondaryCta}
          className="mt-2 text-center text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          {p.secondaryCtaLabel}
        </button>
      )}

      {p.ctaSubNote && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">{p.ctaSubNote}</p>
      )}
    </div>
  )
}
