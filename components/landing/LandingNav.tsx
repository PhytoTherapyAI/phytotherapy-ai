// © 2026 DoctoPal — All Rights Reserved
// Sticky top navigation for the marketing landing page.
// Desktop: logo + 3 links + Sign In + "7 Gün Ücretsiz Dene" CTA.
// Mobile: logo + hamburger that drops down the same links.
// Reuses <DoctoPalLogo /> from components/brand.
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { DoctoPalLogo } from "@/components/brand/DoctoPalLogo"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

interface NavLinkSpec {
  href: string
  labelKey: string
  /** `true` renders a disabled span (e.g. /about doesn't exist yet). */
  disabled?: boolean
}

const NAV_LINKS: NavLinkSpec[] = [
  { href: "#features", labelKey: "landing.nav.features" },
  { href: "/pricing", labelKey: "landing.nav.pricing" },
  { href: "#", labelKey: "landing.nav.about", disabled: true },
]

export function LandingNav() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Add shadow/backdrop when page has scrolled past the nav height.
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    handler()
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const navBg = scrolled
    ? "bg-white/85 dark:bg-slate-950/85 backdrop-blur-md shadow-sm"
    : "bg-white/70 dark:bg-slate-950/70 backdrop-blur"

  const comingSoonTitle = lang === "tr" ? "Yakında" : "Coming soon"

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors ${navBg}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" aria-label="DoctoPal" className="shrink-0">
          <DoctoPalLogo size="md" variant="full" />
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) =>
            l.disabled ? (
              <span
                key={l.labelKey}
                aria-disabled="true"
                title={comingSoonTitle}
                className="text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed"
              >
                {tx(l.labelKey, lang)}
              </span>
            ) : (
              <Link
                key={l.labelKey}
                href={l.href}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {tx(l.labelKey, lang)}
              </Link>
            ),
          )}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {tx("landing.nav.signIn", lang)}
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            {tx("landing.nav.ctaTrial", lang)}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            {NAV_LINKS.map((l) =>
              l.disabled ? (
                <span
                  key={l.labelKey}
                  aria-disabled="true"
                  className="block px-3 py-2 text-sm font-medium text-slate-400 dark:text-slate-600"
                >
                  {tx(l.labelKey, lang)}
                </span>
              ) : (
                <Link
                  key={l.labelKey}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {tx(l.labelKey, lang)}
                </Link>
              ),
            )}

            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {tx("landing.nav.signIn", lang)}
              </Link>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="block rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {tx("landing.nav.ctaTrial", lang)}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
