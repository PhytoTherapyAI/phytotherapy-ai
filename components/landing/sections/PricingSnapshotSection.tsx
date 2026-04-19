// © 2026 DoctoPal — All Rights Reserved
// 3-plan decoy pricing snapshot. Family plan is the featured (decoy) card.
// Mobile: Family first (order-first) so the highest-converting option is seen
// before any scrolling. Desktop: Free | Family (center, scale-105) | Individual.
"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import {
  PRICING_PLANS,
  type PricingPlan,
} from "@/components/landing/data/landing-content"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

function getCardOrder(plan: PricingPlan, index: number): string {
  // Mobile: featured plan moves to the top. Desktop: centered at position 2.
  if (plan.featured) return "order-first md:order-2"
  // Free (data index 0) stays left; Individual (index 1) moves to right.
  return index === 0 ? "md:order-1" : "md:order-3"
}

export function PricingSnapshotSection() {
  const { lang } = useLang()

  return (
    <section className="py-20 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tx("landing.pricing.sectionTitle", lang)}
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch"
        >
          {PRICING_PLANS.map((plan, i) => {
            const Icon = plan.icon
            const featured = plan.featured

            const cardClass = featured
              ? "relative rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-xl lg:scale-105 p-6 md:p-8 flex flex-col"
              : "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 flex flex-col"

            // Inverted contrast CTA for the featured plan (white bg on emerald card).
            const ctaClass = featured
              ? "inline-flex items-center justify-center rounded-xl bg-white text-emerald-700 font-bold border-2 border-emerald-600 px-5 py-2.5 text-sm transition-colors hover:bg-emerald-700 hover:text-white"
              : "inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold px-5 py-2.5 text-sm transition-colors hover:bg-emerald-700"

            return (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                className={`${cardClass} ${getCardOrder(plan, i)}`}
              >
                {featured && plan.badgeKey && (
                  <span className="absolute -top-3 right-6 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {tx(plan.badgeKey, lang)}
                  </span>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <Icon
                    className={
                      featured
                        ? "h-7 w-7 text-emerald-700 dark:text-emerald-400"
                        : "h-6 w-6 text-slate-700 dark:text-slate-300"
                    }
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white">
                    {tx(plan.nameKey, lang)}
                  </h3>
                </div>

                <div className="mb-4">
                  <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    {tx(plan.priceKey, lang)}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                    {tx(plan.periodKey, lang)}
                  </span>
                  {featured && plan.decoyKey && (
                    <p className="mt-1 text-sm">
                      <s className="text-red-500">{tx(plan.decoyKey, lang)}</s>
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.featureKeys.map((fk) => (
                    <li
                      key={fk}
                      className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <Check
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{tx(fk, lang)}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className={ctaClass}>
                  {tx(plan.ctaKey, lang)}
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/pricing"
            className="inline-block text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {tx("landing.pricing.detailLink", lang)}
          </Link>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {tx("landing.pricing.microNote", lang)}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
