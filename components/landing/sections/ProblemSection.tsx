// © 2026 DoctoPal — All Rights Reserved
// 3 empathy cards — Ayşe's inner monologue.
// Per İpek UX rule: Lucide icon ABOVE (small, slate-400), italic quoted title
// beneath, body below. NO emoji in the card UI (badges keep their emoji).
"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { PROBLEM_CARDS } from "@/components/landing/data/landing-content"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export function ProblemSection() {
  const { lang } = useLang()

  return (
    <section className="py-20 md:py-24 lg:py-32 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {tx("landing.problem.sectionTitle", lang)}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg md:text-xl text-slate-600 dark:text-slate-400"
          >
            {tx("landing.problem.sectionSubtitle", lang)}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {PROBLEM_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <motion.article
                key={card.id}
                variants={fadeUp}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8"
              >
                <Icon
                  className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <h3 className="italic text-lg font-semibold text-slate-900 dark:text-white mb-3 leading-snug">
                  &ldquo;{tx(card.titleKey, lang)}&rdquo;
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {tx(card.bodyKey, lang)}
                </p>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
