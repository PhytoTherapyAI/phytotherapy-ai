// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

export default function PrivacyPolicyPage() {
  const { lang } = useLang()

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
      {/* Header */}
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="font-heading text-4xl font-bold italic tracking-tight">
          {tx("legal.privacyTitle", lang)}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {tx("legal.lastUpdated", lang)}: 18 {tx("privacy.march", lang)} 2026
        </p>
      </div>

      <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        {/* 1 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s1Title", lang)}
          </h2>
          <p>
            {tx("privacy.s1Text", lang)}
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s2Title", lang)}
          </h2>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{tx("privacy.s2DirectLabel", lang)}</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{tx("privacy.s2d1", lang)}</li>
              <li>{tx("privacy.s2d2", lang)}</li>
              <li>{tx("privacy.s2d3", lang)}</li>
              <li>{tx("privacy.s2d4", lang)}</li>
            </ul>
            <p className="mt-4 font-medium text-foreground">{tx("privacy.s2AutoLabel", lang)}</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{tx("privacy.s2a1", lang)}</li>
              <li>{tx("privacy.s2a2", lang)}</li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s3Title", lang)}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{tx("privacy.s3i1", lang)}</li>
            <li>{tx("privacy.s3i2", lang)}</li>
            <li>{tx("privacy.s3i3", lang)}</li>
            <li>{tx("privacy.s3i4", lang)}</li>
            <li>{tx("privacy.s3i5", lang)}</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s4Title", lang)}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{tx("privacy.s4i1", lang)}</li>
            <li>{tx("privacy.s4i2", lang)}</li>
            <li>{tx("privacy.s4i3", lang)}</li>
            <li>{tx("privacy.s4i4", lang)}</li>
            <li>{tx("privacy.s4i5", lang)}</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s5Title", lang)}
          </h2>
          <p className="mb-3">
            {tx("privacy.s5Intro", lang)}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><span className="font-medium text-foreground">{tx("privacy.s5Access", lang)}</span> {tx("privacy.s5AccessDesc", lang)}</li>
            <li><span className="font-medium text-foreground">{tx("privacy.s5Rectification", lang)}</span> {tx("privacy.s5RectificationDesc", lang)}</li>
            <li><span className="font-medium text-foreground">{tx("privacy.s5Erasure", lang)}</span> {tx("privacy.s5ErasureDesc", lang)}</li>
            <li><span className="font-medium text-foreground">{tx("privacy.s5Portability", lang)}</span> {tx("privacy.s5PortabilityDesc", lang)}</li>
            <li><span className="font-medium text-foreground">{tx("privacy.s5Objection", lang)}</span> {tx("privacy.s5ObjectionDesc", lang)}</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s6Title", lang)}
          </h2>
          <p className="mb-3">
            {tx("privacy.s6Intro", lang)}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{tx("privacy.s6i1", lang)}</li>
            <li>{tx("privacy.s6i2", lang)}</li>
            <li>{tx("privacy.s6i3", lang)}</li>
            <li>{tx("privacy.s6i4", lang)}</li>
            <li>{tx("privacy.s6i5", lang)}</li>
          </ul>
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="font-medium text-foreground">
              {tx("privacy.s6NoSale", lang)}
            </p>
          </div>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s7Title", lang)}
          </h2>
          <p>
            {tx("privacy.s7Text", lang)}
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s8Title", lang)}
          </h2>
          <p>
            {tx("privacy.s8Text", lang)}
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s9Title", lang)}
          </h2>
          <p>
            {tx("privacy.s9Text", lang)}
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s10Title", lang)}
          </h2>
          <p>
            {tx("privacy.s10Text", lang)}
          </p>
          <p className="mt-2 font-heading text-lg font-medium text-foreground">privacy@phytotherapy.ai</p>
        </section>
      </div>
    </div>
  )
}
