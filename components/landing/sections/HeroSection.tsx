// © 2026 DoctoPal — All Rights Reserved
// Landing hero — H1/H2 + 2 CTA + 3 micro-badges + screenshot placeholder.
// 2-column on desktop (text | screenshot), stacked on mobile (text, then shot).
// Background: subtle emerald-50 wash fading to white.
"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { ScreenshotPlaceholder } from "@/components/landing/ScreenshotPlaceholder"
import {
  HERO_BADGES,
  HERO_SECONDARY_CTA_ICON,
} from "@/components/landing/data/landing-content"

// Strip a leading emoji (incl. ZWJ sequences) + trailing whitespace so the
// Lucide icon isn't redundant with the emoji in the translation string.
// Kept for backward safety — current hero badge translations are plain text.
function stripLeadingEmoji(s: string): string {
  return s
    .replace(/^\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200D\uFE0F]*\s+/u, "")
    .trim()
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export function HeroSection() {
  const { lang } = useLang()
  const SecondaryCtaIcon = HERO_SECONDARY_CTA_ICON

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-32">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center"
        >
          {/* Left: copy */}
          <div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-6">
              {HERO_BADGES.map((b) => {
                const Icon = b.icon
                return (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {stripLeadingEmoji(tx(b.textKey, lang))}
                  </span>
                )
              })}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              {tx("landing.hero.h1", lang)}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-xl text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              {tx("landing.hero.h2", lang)}
            </motion.p>

            {/* Session 43 F-OB-016: concrete feature line. The emotional H2
                wins on narrative; new visitors still asked "what does this
                app DO?". The feature triad answers in a glance without
                competing with the H2's framing. Bullet separators keep
                scannability across both languages. */}
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-sm text-slate-500 dark:text-slate-500"
            >
              {lang === "tr"
                ? "İlaç-bitki etkileşimi · Kan tahlili yorumu · Aile profili yönetimi"
                : "Drug-herb interactions · Blood test insights · Family profile management"}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
              >
                {tx("landing.hero.ctaPrimary", lang)}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-6 py-3.5 text-base font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                {tx("landing.hero.ctaSecondary", lang)}
                <SecondaryCtaIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.div>
          </div>

          {/* Right: screenshot */}
          <motion.div variants={fadeUp} className="mx-auto w-full md:pl-4 lg:pl-8">
            <div className="transform rotate-1 drop-shadow-2xl">
              <ScreenshotPlaceholder aspectRatio="16:10" size="lg" mode="hero" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
