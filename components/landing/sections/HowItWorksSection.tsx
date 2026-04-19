// © 2026 DoctoPal — All Rights Reserved
// 3-step onboarding timeline. id="how-it-works" target for hero secondary CTA.
// Horizontal on desktop with dashed connector line, vertical stack on mobile.
"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { HOW_IT_WORKS_STEPS } from "@/components/landing/data/landing-content"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export function HowItWorksSection() {
  const { lang } = useLang()

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-24 lg:py-32 bg-white dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tx("landing.howItWorks.sectionTitle", lang)}
          </h2>
        </motion.div>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8"
        >
          {/* Desktop-only dashed connector line across the step badges */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-6 left-[16.666%] right-[16.666%] border-t-2 border-dashed border-slate-200 dark:border-slate-700"
          />

          {HOW_IT_WORKS_STEPS.map((step) => {
            const Icon = step.icon
            return (
              <motion.li
                key={step.id}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xl font-bold border-4 border-white dark:border-slate-950">
                  {step.stepNumber}
                </div>
                <Icon
                  className="h-6 w-6 text-slate-700 dark:text-slate-300 mb-3"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {tx(step.titleKey, lang)}
                </h3>
                <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {tx(step.durationKey, lang)}
                </p>
                <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
                  {tx(step.bodyKey, lang)}
                </p>
              </motion.li>
            )
          })}
        </motion.ol>
      </div>
    </section>
  )
}
