// © 2026 Doctopal — All Rights Reserved
'use client'

import { Leaf } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

export function Footer() {
  const { lang } = useLang()

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
        {/* Disclaimer */}
        <div className="mb-6 rounded-lg border border-gold/20 bg-gold/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">{tx('footer.disclaimer.label', lang)}</strong> {tx('footer.disclaimer.text', lang)}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="" className="h-5 w-5 rounded" />
            <span className="font-heading" suppressHydrationWarning>© {new Date().getFullYear()} Doctopal — {tx("footer.allRightsReserved", lang)}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              {tx('footer.privacy', lang)}
            </Link>
            <span className="text-border">|</span>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              {tx('footer.terms', lang)}
            </Link>
            <span className="text-border">|</span>
            <Link href="/about" className="transition-colors hover:text-foreground">
              {tx("footer.about", lang)}
            </Link>
            <span className="text-border">|</span>
            <a href="mailto:hello@doctopal.com" className="transition-colors hover:text-foreground">
              hello@doctopal.com
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            {tx('footer.tagline', lang)}
          </p>
        </div>
      </div>
    </footer>
  );
}
