// © 2026 DoctoPal — All Rights Reserved
// Checkout placeholder — shown until the Iyzico integration lands.
//
// Copy strategy (İpek): frame this as "early access, manual activation"
// rather than "under construction". A polite, confident pause > a "broken
// checkout" feeling. Anyone who lands here already has intent.
//
// Analytics: we capture the `plan` query param so we can see which CTA is
// pulling traffic before we even have a real checkout. Right now it's just
// console.log + Sentry breadcrumb; once the real flow ships this upgrades
// to a proper event.
"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Rocket, Mail, ArrowLeft, Check } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { LocalizedTitle } from "@/components/layout/LocalizedTitle"

type PlanKey =
  | "individual-monthly" | "individual-yearly"
  | "family-monthly" | "family-yearly"

const PLAN_LABELS: Record<PlanKey, { tr: { name: string; price: string }; en: { name: string; price: string } }> = {
  "individual-monthly": {
    tr: { name: "Premium Bireysel — Aylık", price: "₺149 / ay" },
    en: { name: "Premium Individual — Monthly", price: "₺149 / mo" },
  },
  "individual-yearly": {
    tr: { name: "Premium Bireysel — Yıllık (2 ay bedava)", price: "₺1.490 / yıl" },
    en: { name: "Premium Individual — Yearly (2 months free)", price: "₺1.490 / yr" },
  },
  "family-monthly": {
    tr: { name: "Premium Aile — Aylık", price: "₺349 / ay · 6 kişiye kadar" },
    en: { name: "Family Premium — Monthly", price: "₺349 / mo · up to 6 people" },
  },
  "family-yearly": {
    tr: { name: "Premium Aile — Yıllık (2 ay bedava)", price: "₺3.490 / yıl · 6 kişiye kadar" },
    en: { name: "Family Premium — Yearly (2 months free)", price: "₺3.490 / yr · up to 6 people" },
  },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLang()
  const tr = lang === "tr"

  const planParam = searchParams.get("plan")
  const planKey = (planParam && planParam in PLAN_LABELS ? planParam : null) as PlanKey | null

  // Analytics — which plan is pulling clicks? Today it's console + a soft
  // Sentry breadcrumb (best-effort via window), tomorrow it becomes a real
  // `track("checkout_intent", { plan })`.
  useEffect(() => {
    if (typeof window === "undefined") return
    // Console for dev debugging
    console.log("[Checkout] plan param:", planParam)
    // Sentry breadcrumb if present — safely wrapped so missing Sentry
    // doesn't break the placeholder flow.
    try {
      const w = window as unknown as { Sentry?: { addBreadcrumb?: (b: unknown) => void } }
      w.Sentry?.addBreadcrumb?.({
        category: "checkout",
        message: "checkout_intent",
        level: "info",
        data: { plan: planParam },
      })
    } catch {
      /* no-op */
    }
  }, [planParam])

  const planLabel = useMemo(() => {
    if (!planKey) return null
    return tr ? PLAN_LABELS[planKey].tr : PLAN_LABELS[planKey].en
  }, [planKey, tr])

  return (
    <div className="mx-auto max-w-xl px-4 md:px-8 py-12">
      <LocalizedTitle tr="Ödeme" en="Checkout" />

      <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/60 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background p-8 shadow-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
          <Rocket className="h-8 w-8" />
        </div>

        <h1 className="text-center font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {tr ? "Premium Üyeliğin Hazırlanıyor 🚀" : "Your Premium Is On The Way 🚀"}
        </h1>

        {/* Plan summary row — only when plan param valid */}
        {planLabel && (
          <div className="mt-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white/70 dark:bg-card/70 backdrop-blur p-4">
            <p className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              {tr ? "Seçtiğin Paket" : "Selected plan"}
            </p>
            <p className="mt-1.5 text-base font-bold text-foreground">{planLabel.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{planLabel.price}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <Check className="h-3 w-3" />
              {tr ? "İlk 7 gün ücretsiz" : "Free for the first 7 days"}
            </p>
          </div>
        )}

        <p className="mt-6 text-sm leading-relaxed text-foreground/80 text-center">
          {tr
            ? "Ödeme sistemimiz Iyzico ile entegrasyon aşamasındadır. Erken erişim almak için bizimle iletişime geçin — manuel aktivasyon ile hemen Premium'a geçirelim."
            : "Our payment system is in final integration with Iyzico. Reach out to secure early access — we'll manually activate your Premium right away."}
        </p>

        {/* Primary CTA — mailto keeps friction low */}
        <a
          href="mailto:info@doctopal.com?subject=Premium%20Erken%20Eri%C5%9Fim%20Talebi"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-md hover:shadow-lg"
        >
          <Mail className="h-4 w-4" />
          info@doctopal.com
        </a>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          {tr
            ? "Mesaj gönderince genellikle aynı gün içinde dönüş yapıyoruz."
            : "We usually reply the same day after you message us."}
        </p>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {tr ? "Fiyatlara geri dön" : "Back to pricing"}
          </Link>
        </div>
      </div>

      {/* Why-trust copy underneath the main card */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        {tr
          ? "DoctoPal, KVKK uyumlu kanıta dayalı sağlık asistanıdır. Tüm fiyatlara KDV dahildir."
          : "DoctoPal is a KVKK-compliant evidence-based health assistant. All prices include VAT."}
      </div>

      {/* Route-guard: bad plan param silently redirects — no "invalid plan" error UI. */}
      {!planKey && typeof window !== "undefined" && (
        <BadPlanRedirect router={router} />
      )}
    </div>
  )
}

/** Redirect users who land on /checkout with no (or a bad) plan param.
 *  Keeps this file's main render clean and preserves the useSearchParams
 *  suspense boundary. */
function BadPlanRedirect({ router }: { router: ReturnType<typeof useRouter> }) {
  useEffect(() => {
    const t = setTimeout(() => router.replace("/pricing"), 2500)
    return () => clearTimeout(t)
  }, [router])
  return null
}
