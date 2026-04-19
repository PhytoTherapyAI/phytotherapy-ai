// © 2026 DoctoPal — All Rights Reserved
// /about page content — hero, mission, founder story, vision, values (3),
// team (2 founders), contact CTA.
// Avatars: TODO(assets) replace initials placeholders with real photos in
// /team/ once the images are ready.
"use client"

import Link from "next/link"
import {
  ShieldCheck,
  Heart,
  Lock,
  ArrowRight,
  Mail,
  type LucideIcon,
} from "lucide-react"
import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

interface ValueItem {
  icon: LucideIcon
  titleKey: string
  bodyKey: string
}
const VALUES: readonly ValueItem[] = [
  { icon: ShieldCheck, titleKey: "about.values.value1Title", bodyKey: "about.values.value1Body" },
  { icon: Heart, titleKey: "about.values.value2Title", bodyKey: "about.values.value2Body" },
  { icon: Lock, titleKey: "about.values.value3Title", bodyKey: "about.values.value3Body" },
]

interface FounderItem {
  /** Two-letter initials used for the circular avatar placeholder. */
  initials: string
  nameKey: string
  roleKey: string
}
// founder1 = Taha (listed first), founder2 = İpek.
const FOUNDERS: readonly FounderItem[] = [
  {
    initials: "TS",
    nameKey: "about.team.founder1Name",
    roleKey: "about.team.founder1Role",
  },
  {
    initials: "İÖ",
    nameKey: "about.team.founder2Name",
    roleKey: "about.team.founder2Role",
  },
]

export function AboutSection() {
  const { lang } = useLang()

  return (
    <>
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.h1
              variants={fadeUp}
              className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              {tx("about.hero.h1", lang)}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-xl md:text-2xl italic text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              {tx("about.hero.subtitle", lang)}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══ Mission ═══ */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4"
            >
              {tx("about.mission.label", lang)}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed"
            >
              {tx("about.mission.body", lang)}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══ Founder Story ═══ */}
      <section className="py-20 md:py-24 lg:py-28 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-8"
            >
              {tx("about.story.heading", lang)}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6"
            >
              {tx("about.story.p1", lang)}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6"
            >
              {tx("about.story.p2", lang)}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6"
            >
              {tx("about.story.p3", lang)}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-lg leading-relaxed text-slate-700 dark:text-slate-300"
            >
              {tx("about.story.p4", lang)}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══ Vision ═══ */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4"
            >
              {tx("about.vision.label", lang)}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed"
            >
              {tx("about.vision.body", lang)}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══ Values ═══ */}
      <section className="py-20 md:py-24 lg:py-28 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {tx("about.values.sectionTitle", lang)}
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
          >
            {VALUES.map((v) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.titleKey}
                  variants={fadeUp}
                  className="text-center"
                >
                  <Icon
                    className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-4"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {tx(v.titleKey, lang)}
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tx(v.bodyKey, lang)}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══ Team ═══ */}
      <section className="py-20 md:py-24 lg:py-28 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {tx("about.team.sectionTitle", lang)}
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {FOUNDERS.map((f) => (
              <motion.article
                key={f.nameKey}
                variants={fadeUp}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center"
              >
                {/* TODO(assets): replace initials placeholder with <Image src="/team/..." /> */}
                <div
                  className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-3xl font-bold text-emerald-700 dark:text-emerald-300"
                  aria-hidden="true"
                >
                  {f.initials}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {tx(f.nameKey, lang)}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {tx(f.roleKey, lang)}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Contact CTA ═══ */}
      <section className="py-20 md:py-24 lg:py-28 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-emerald-950/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4"
            >
              {tx("about.contact.heading", lang)}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-slate-600 dark:text-slate-400 mb-6"
            >
              {tx("about.contact.body", lang)}
            </motion.p>
            <motion.div variants={fadeUp} className="mb-4">
              <a
                href="mailto:info@doctopal.com?subject=DoctoPal%20Hakk%C4%B1nda"
                className="inline-flex items-center gap-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
                {tx("about.contact.email", lang)}
              </a>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-sm italic text-slate-500 dark:text-slate-500 mb-8"
            >
              {tx("about.contact.responseTime", lang)}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base md:text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
              >
                {tx("about.contact.ctaButton", lang)}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
