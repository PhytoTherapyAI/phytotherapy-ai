// © 2026 DoctoPal — All Rights Reserved
// Closing big CTA — title + subtitle + primary CTA + 4 reassurance badges.
// Gradient background frames the final conversion moment.
"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { FINAL_CTA_BADGES } from "@/components/landing/data/landing-content"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export function FinalCTASection() {
  const { lang } = useLang()

  return (
    <section className="py-20 md:py-24 lg:py-32 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-emerald-950/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {tx("landing.finalCta.title", lang)}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {tx("landing.finalCta.subtitle", lang)}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base md:text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
            >
              {tx("landing.finalCta.cta", lang)}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </motion.div>

          <motion.ul
            variants={stagger}
            className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3"
          >
            {FINAL_CTA_BADGES.map((b) => {
              const Icon = b.icon
              return (
                <motion.li
                  key={b.id}
                  variants={fadeUp}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400"
                >
                  <Icon
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  {tx(b.textKey, lang)}
                </motion.li>
              )
            })}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}
