// © 2026 DoctoPal — All Rights Reserved
//
// Segmented control for Monthly / Yearly billing. Used by both the
// /pricing page and the in-app PremiumUpgradeModal. Default selected
// value MUST be "monthly" per the Session 45 redesign brief —
// commitment friction is what kept Free users from converting.
"use client"

import type { Billing } from "@/lib/pricing"
import { PRICING } from "@/lib/pricing"

interface PricingToggleProps {
  value: Billing
  onChange: (next: Billing) => void
  /** Optional savings percent shown next to the Yearly label. Pass the
   *  larger of the two plan savings (Individual is currently the
   *  emphasised plan, so its 22% wins) so the badge stays consistent
   *  no matter which card the user is looking at. */
  yearlySavingsPercent?: number
  lang: "tr" | "en"
  /** When true, occupies full container width on mobile; defaults to inline. */
  full?: boolean
}

export function PricingToggle({
  value,
  onChange,
  yearlySavingsPercent = PRICING.individual.savingsPercent,
  lang,
  full,
}: PricingToggleProps) {
  const tr = lang === "tr"
  const segmentBase =
    "flex-1 sm:flex-none px-4 sm:px-5 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 inline-flex items-center justify-center gap-2"
  const selected = "bg-foreground text-background shadow-sm"
  const idle = "text-muted-foreground hover:text-foreground"

  return (
    <div
      role="tablist"
      aria-label={tr ? "Faturalama dönemi" : "Billing period"}
      className={`inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm ${
        full ? "w-full" : ""
      }`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={`${segmentBase} ${value === "monthly" ? selected : idle}`}
      >
        {tr ? "Aylık" : "Monthly"}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "yearly"}
        onClick={() => onChange("yearly")}
        className={`${segmentBase} ${value === "yearly" ? selected : idle}`}
      >
        {tr ? "Yıllık" : "Yearly"}
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
            value === "yearly"
              ? "bg-emerald-500 text-white"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          }`}
        >
          {tr ? `%${yearlySavingsPercent} tasarruf` : `Save ${yearlySavingsPercent}%`}
        </span>
      </button>
    </div>
  )
}
