// © 2026 DoctoPal — All Rights Reserved
//
// Single source of truth for Premium pricing. Every paywall surface
// (PremiumUpgradeModal, /pricing page, /checkout page, landing page,
// any future SBAR/Prospectus/Family-Tree gate) reads from THIS file.
// Hardcoding a price in any consumer is a bug — grep '149|349|1399|3299'
// before adding a new one.
//
// Display rules (also documented per-consumer):
//   - Default billing toggle is MONTHLY (lowers commitment friction).
//   - Yearly mode shows the monthly-equivalent figure prominently
//     and the annual lump sum in small grey text underneath.
//   - The annual lump sum is NEVER the headline number.
//   - Individual is the emphasised plan ("EN POPÜLER"); Family is
//     present but visually secondary.

export type Billing = "monthly" | "yearly"
export type PlanId = "individual" | "family"

export interface PlanRates {
  /** Monthly subscription price in TRY (no VAT modifier — VAT included). */
  monthly: number
  /** Annual lump sum in TRY (paid once per year). */
  yearly: number
  /** Yearly ÷ 12, rounded to integer TRY. The headline figure when the
   *  user picks the yearly tab. */
  yearlyMonthlyEquivalent: number
  /** Approximate savings vs paying monthly × 12, integer percent. */
  savingsPercent: number
}

export interface PlanMeta extends PlanRates {
  /** Stable plan id used in URLs (`?plan=individual-monthly`), telemetry,
   *  and i18n key namespacing. */
  id: PlanId
  /** Cap on member coverage; null for individual. Surfaced in copy as
   *  "6 kişiye kadar". */
  maxMembers: number | null
}

export const PRICING: Record<PlanId, PlanMeta> = {
  individual: {
    id: "individual",
    monthly: 149,
    yearly: 1399,
    yearlyMonthlyEquivalent: 117, // 1399 / 12 ≈ 116.58 → 117
    savingsPercent: 22, // (149*12 - 1399) / (149*12) = 0.218 → 22
    maxMembers: null,
  },
  family: {
    id: "family",
    monthly: 349,
    yearly: 3299,
    yearlyMonthlyEquivalent: 275, // 3299 / 12 ≈ 274.92 → 275
    savingsPercent: 21, // (349*12 - 3299) / (349*12) = 0.212 → 21
    maxMembers: 6,
  },
}

/**
 * Format a price as a TRY label with thin-space thousands separator
 * (Turkish locale convention). The currency glyph is prepended verbatim
 * (₺) since `Intl.NumberFormat("tr-TR", { style: "currency" })` adds
 * trailing "₺" which doesn't match our headline style.
 */
export function formatTry(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR")}`
}

/**
 * Headline figure shown on the Card price slot.
 *  - monthly tab → "₺149", "/ ay" suffix
 *  - yearly tab  → "₺117", "/ ay" suffix (the monthly equivalent;
 *                  annual lump sum lives in the secondary line)
 */
export function headlineAmount(plan: PlanMeta, billing: Billing): { amount: string; perTr: string; perEn: string } {
  if (billing === "monthly") {
    return { amount: formatTry(plan.monthly), perTr: "/ ay", perEn: "/ mo" }
  }
  return { amount: formatTry(plan.yearlyMonthlyEquivalent), perTr: "/ ay", perEn: "/ mo" }
}

/**
 * Secondary line shown under the headline only on the yearly tab —
 * "Yıllık ₺1.399 tek seferde" / "Annual ₺1,399 billed once".
 * Returns null on the monthly tab (no secondary line needed).
 */
export function annualSecondaryLine(plan: PlanMeta, billing: Billing, lang: "tr" | "en"): string | null {
  if (billing !== "yearly") return null
  const sum = formatTry(plan.yearly)
  return lang === "tr" ? `Yıllık ${sum} tek seferde` : `Annual ${sum} billed once`
}

/**
 * Savings badge shown on the yearly tab only ("%22 tasarruf" / "Save 22%").
 * Returns null on the monthly tab.
 */
export function savingsBadge(plan: PlanMeta, billing: Billing, lang: "tr" | "en"): string | null {
  if (billing !== "yearly") return null
  return lang === "tr" ? `%${plan.savingsPercent} tasarruf` : `Save ${plan.savingsPercent}%`
}

/**
 * Plan key used by the checkout placeholder (`?plan=individual-monthly`)
 * and by the manual family activation route. Centralised so the URL
 * format never drifts from what /api/family/upgrade-plan expects.
 */
export function planParam(plan: PlanId, billing: Billing): string {
  return `${plan}-${billing}`
}
