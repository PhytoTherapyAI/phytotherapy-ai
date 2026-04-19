// © 2026 DoctoPal — All Rights Reserved
'use client'

import Link from "next/link";
import { usePathname } from "next/navigation"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { DoctoPalLogo } from "@/components/brand/DoctoPalLogo"
import { useAuth } from "@/lib/auth-context"

// Marketing shell pages own their own <LandingFooter />. Suppress the app
// footer there so we don't render two footers stacked.
const MARKETING_SHELL_PATHS = new Set(["/about"])

export function Footer() {
  const { lang } = useLang()
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const tr = lang === "tr";

  // Guest `/` renders LandingFooter inside <LandingPage />. Authenticated
  // `/` = dashboard which uses this app footer. All other marketing shell
  // pages (listed above) suppress unconditionally.
  if (MARKETING_SHELL_PATHS.has(pathname)) return null
  if (pathname === "/" && !isAuthenticated) return null

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
        {/* Disclaimer */}
        <div className="mb-6 rounded-lg border border-gold/20 bg-gold/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">{tx('footer.disclaimer.label', lang)}</strong> {tx('footer.disclaimer.text', lang)}
        </div>

        {/* Medical device disclaimer — Tıbbi Cihaz Yönetmeliği compliance */}
        <div className="mb-6 text-center text-xs text-muted-foreground">
          <p className="font-medium">
            {tr
              ? "DoctoPal — Sağlık Bilgilendirme Aracı"
              : "DoctoPal — Health Information Tool"}
          </p>
          <p className="mt-0.5">
            {tr
              ? "Tıbbi cihaz değildir. Teşhis koymaz, tedavi önermez."
              : "Not a medical device. Does not diagnose or treat."}
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <DoctoPalLogo variant="full" size="sm" theme="light" />
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
              © {new Date().getFullYear()} DoctoPal. {tx("footer.allRightsReserved", lang)}
            </span>
            <p className="text-[10px] text-muted-foreground/60 italic">
              Evidence Meets Nature. AI Meets You.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            <Link href="/aydinlatma" className="transition-colors hover:text-foreground">
              {tr ? "Aydınlatma Metni" : "Privacy Notice"}
            </Link>
            <span className="text-border">|</span>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              {tx('footer.terms', lang)}
            </Link>
            <span className="text-border">|</span>
            <Link href="/security" className="transition-colors hover:text-foreground">
              {tr ? "Güvenlik" : "Security"}
            </Link>
            <span className="text-border">|</span>
            <Link href="/intended-purpose" className="transition-colors hover:text-foreground">
              {tr ? "Kullanım Amacı" : "Intended Purpose"}
            </Link>
            <span className="text-border">|</span>
            <Link href="/mesafeli-satis" className="transition-colors hover:text-foreground">
              {tr ? "Mesafeli Satış Sözleşmesi" : "Distance Sales Agreement"}
            </Link>
            <span className="text-border">|</span>
            <Link href="/abonelik-sozlesmesi" className="transition-colors hover:text-foreground">
              {tr ? "Abonelik Sözleşmesi" : "Subscription Agreement"}
            </Link>
            <span className="text-border">|</span>
            <Link href="/about" className="transition-colors hover:text-foreground">
              {tx("footer.about", lang)}
            </Link>
            <span className="text-border">|</span>
            <a href="mailto:info@doctopal.com" className="transition-colors hover:text-foreground">
              info@doctopal.com
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
