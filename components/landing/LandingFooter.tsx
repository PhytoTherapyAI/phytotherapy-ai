// © 2026 DoctoPal — All Rights Reserved
// Landing page footer. Three columns (brand / product / legal) + bottom copyright.
// Disabled legal links are placeholders for pages that will arrive with
// Iyzico rollout (Mesafeli Satış, Abonelik Sözleşmesi, Hakkımızda).
"use client"

import Link from "next/link"
import { Instagram, Twitter, Linkedin } from "lucide-react"
import { DoctoPalLogo } from "@/components/brand/DoctoPalLogo"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

interface FooterLink {
  href: string
  labelKey: string
  /** Disabled = page not yet shipped. Rendered as a greyed-out span. */
  disabled?: boolean
  /** Mail anchor uses <a> with mailto: instead of Next Link. */
  isMail?: boolean
}

const PRODUCT_LINKS: FooterLink[] = [
  { href: "#features", labelKey: "landing.footer.productLink1" },
  { href: "/pricing", labelKey: "landing.footer.productLink2" },
  { href: "/health-assistant", labelKey: "landing.footer.productLink3" },
  { href: "/interaction-checker", labelKey: "landing.footer.productLink4" },
]

const LEGAL_LINKS: FooterLink[] = [
  { href: "#", labelKey: "landing.footer.legalLink1", disabled: true }, // /about placeholder
  { href: "/aydinlatma", labelKey: "landing.footer.legalLink2" },
  { href: "#", labelKey: "landing.footer.legalLink3", disabled: true }, // Mesafeli Satış — Iyzico ile
  { href: "#", labelKey: "landing.footer.legalLink4", disabled: true }, // Abonelik Sözleşmesi — Iyzico ile
  { href: "/kvkk-haklarim", labelKey: "landing.footer.legalLink5" },
  { href: "mailto:info@doctopal.com", labelKey: "landing.footer.legalLink6", isMail: true },
]

const SOCIAL_LINKS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

function renderLink(link: FooterLink, lang: "tr" | "en", comingSoon: string) {
  if (link.disabled) {
    return (
      <span
        aria-disabled="true"
        title={comingSoon}
        className="text-sm text-slate-400 dark:text-slate-600 cursor-not-allowed"
      >
        {tx(link.labelKey, lang)}
      </span>
    )
  }
  if (link.isMail) {
    return (
      <a
        href={link.href}
        className="text-sm text-slate-700 dark:text-slate-300 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
      >
        {tx(link.labelKey, lang)}
      </a>
    )
  }
  return (
    <Link
      href={link.href}
      className="text-sm text-slate-700 dark:text-slate-300 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
    >
      {tx(link.labelKey, lang)}
    </Link>
  )
}

export function LandingFooter() {
  const { lang } = useLang()
  const comingSoon = lang === "tr" ? "Yakında" : "Coming soon"

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand + tagline + socials */}
          <div>
            <DoctoPalLogo size="md" variant="full" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {tx("landing.footer.tagline", lang)}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tx("landing.footer.productCol", lang)}
            </h3>
            <ul className="mt-4 space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.labelKey}>{renderLink(l, lang, comingSoon)}</li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tx("landing.footer.legalCol", lang)}
            </h3>
            <ul className="mt-4 space-y-3">
              {LEGAL_LINKS.map((l) => (
                <li key={l.labelKey}>{renderLink(l, lang, comingSoon)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tx("landing.footer.copyright", lang)}
          </p>
        </div>
      </div>
    </footer>
  )
}
