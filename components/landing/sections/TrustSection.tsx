// © 2026 DoctoPal — All Rights Reserved
// 4 trust pillars — Türkiye / medical guidance / competition / security.
// Grid: 2-col on small, 4-col on large. Every column center-aligned.
"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { TRUST_PILLARS } from "@/components/landing/data/landing-content"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export function TrustSection() {
  const { lang } = useLang()

  return (
    <section className="py-20 md:py-24 lg:py-32 bg-slate-50/70 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tx("landing.trust.sectionTitle", lang)}
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
        >
          {TRUST_PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.id}
                variants={fadeUp}
                className="text-center"
              >
                <Icon
                  className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {tx(p.titleKey, lang)}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {tx(p.bodyKey, lang)}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
