// © 2026 DoctoPal — All Rights Reserved
// 3 core features, alternating zigzag layout. id="features" is the nav anchor.
// Each block: mini-label + bold title + body + 4 chips + screenshot.
"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { SOLUTION_FEATURES } from "@/components/landing/data/landing-content"
import { ScreenshotPlaceholder } from "@/components/landing/ScreenshotPlaceholder"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export function SolutionSection() {
  const { lang } = useLang()

  return (
    <section
      id="features"
      className="py-20 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tx("landing.solution.sectionTitle", lang)}
          </h2>
        </motion.div>

        <div className="space-y-16 md:space-y-20">
          {SOLUTION_FEATURES.map((f, i) => {
            const Icon = f.icon
            const isReversed = i % 2 === 1

            // Mobile: text always first (order-1). Desktop: alternate via
            // explicit md:order classes so the grid children swap sides.
            const textOrderClass = `order-1 ${isReversed ? "md:order-2" : "md:order-1"}`
            const shotOrderClass = `order-2 ${isReversed ? "md:order-1" : "md:order-2"}`

            return (
              <motion.div
                key={f.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={stagger}
                className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center"
              >
                {/* Text side */}
                <motion.div variants={fadeUp} className={textOrderClass}>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <Icon
                      className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                      {tx(f.miniKey, lang)}
                    </p>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                    {tx(f.titleKey, lang)}
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {tx(f.bodyKey, lang)}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {f.chipKeys.map((ck) => (
                      <li
                        key={ck}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-sm text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60"
                      >
                        <span aria-hidden="true">✓</span>
                        {tx(ck, lang)}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Screenshot side */}
                <motion.div variants={fadeUp} className={`${shotOrderClass} mx-auto`}>
                  <ScreenshotPlaceholder
                    aspectRatio="16:10"
                    size="md"
                    captionKey={f.titleKey}
                  />
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
