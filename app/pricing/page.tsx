// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { useLang } from "@/components/layout/language-toggle"
import { createBrowserClient } from "@/lib/supabase"
import { Crown, Users, Heart, Sparkles, ArrowRight, Shield, Gift, ChevronDown, RotateCcw, CreditCard, Loader2, Check } from "lucide-react"
import { LocalizedTitle } from "@/components/layout/LocalizedTitle"
import { PRICING, type Billing, planParam } from "@/lib/pricing"
import { PricingToggle } from "@/components/premium/PricingToggle"
import { PricingCard } from "@/components/premium/PricingCard"

// ─────────────────────────────────────────────
// Pricing display rules (also documented in lib/pricing.ts):
//   - Default toggle = MONTHLY (Session 45 redesign — commitment friction
//     was driving Free users away).
//   - Headline figure is per-month in BOTH modes. Yearly tab adds the
//     annual lump sum in small grey text + a "%X tasarruf" pill — never
//     as the headline.
//   - Individual is the EMPHASISED plan ("EN POPÜLER"), Family stays
//     present but visually secondary.
//   - All prices read from lib/pricing.ts; no hardcoded TRY amounts here.
// ─────────────────────────────────────────────

type PlanCardId = "free" | "premium" | "family_premium"

const TR_FEATURES: Record<PlanCardId, string[]> = {
  free: [
    "Sağlık asistanı (günde 20 soru)",
    "Kendi profili yönetimi",
    "Aile ağacında görünür",
    "SOS acil durum bildirimi",
    "Su, ilaç, check-in takibi",
  ],
  premium: [
    "Sınırsız AI sağlık asistanı",
    "SBAR PDF doktor raporu",
    "Kan tahlili & radyoloji analizi",
    "Prospektüs okuma (foto)",
    "İlaç etkileşim kontrolü",
    "Aile yöneticisi olabilme",
  ],
  family_premium: [
    "6 kişiye kadar tüm aile Premium",
    "Tüm Premium özellikler herkese",
    "Aile sağlık ağacı + AI genetik analiz",
    "Üyeler arası paylaşım kontrolü",
    "Owner üye yönetimi + admin atama",
  ],
}

const EN_FEATURES: Record<PlanCardId, string[]> = {
  free: [
    "Health assistant (20 queries/day)",
    "Own profile management",
    "Visible in family tree",
    "SOS emergency broadcast",
    "Water, meds, check-in tracking",
  ],
  premium: [
    "Unlimited AI health assistant",
    "SBAR doctor PDF reports",
    "Blood test & radiology analysis",
    "Prospectus scanning (photo)",
    "Drug interaction checker",
    "Family admin eligibility",
  ],
  family_premium: [
    "Up to 6 family members, all Premium",
    "Every premium feature for everyone",
    "Family health tree + AI genetic insight",
    "Per-member sharing controls",
    "Owner-managed members + admin roles",
  ],
}

export default function PricingPage() {
  const { lang } = useLang()
  const { user, isAuthenticated, premiumStatus } = useAuth()
  const { familyGroup, refetch: refetchFamily } = useFamily()
  const router = useRouter()
  const tr = lang === "tr"
  const features = tr ? TR_FEATURES : EN_FEATURES
  // Session 45: default MONTHLY (was yearly).
  const [billing, setBilling] = useState<Billing>("monthly")
  const [activatingFamily, setActivatingFamily] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const isOwner = !!familyGroup && familyGroup.owner_id === user?.id
  const familyPlanActive =
    familyGroup?.plan_type === "family_premium"
    && !!familyGroup.plan_expires_at
    && new Date(familyGroup.plan_expires_at) > new Date()

  async function handleFamilyActivate() {
    if (!isAuthenticated) { router.push("/auth/login"); return }
    if (!isOwner) {
      setFeedback({
        type: "error",
        msg: tr
          ? "Aile Premium'u yalnızca aile kurucusu aktif edebilir."
          : "Only the family owner can activate Family Premium.",
      })
      return
    }
    setActivatingFamily(true)
    setFeedback(null)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("no session")
      const res = await fetch("/api/family/upgrade-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ durationMonths: billing === "yearly" ? 12 : 1 }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFeedback({ type: "error", msg: data.error || (tr ? "Aktivasyon başarısız." : "Activation failed.") })
      } else {
        setFeedback({
          type: "success",
          msg: tr
            ? "Aile Premium aktif edildi. Tüm üyelere bildirim gönderildi."
            : "Family Premium activated. All members notified.",
        })
        try { await refetchFamily() } catch { /* non-fatal */ }
      }
    } catch {
      setFeedback({ type: "error", msg: tr ? "Bağlantı hatası." : "Connection error." })
    } finally {
      setActivatingFamily(false)
    }
  }

  // Auth-aware checkout navigator. Keeps the plan choice intact through login.
  function goToCheckout(plan: "individual" | "family") {
    const next = `/checkout?plan=${planParam(plan, billing)}`
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(next)}`)
      return
    }
    router.push(next)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-12">
      <LocalizedTitle tr="Fiyatlandırma" en="Pricing" />

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {tr ? "Sana en uygun planı seç" : "Pick the plan that fits you"}
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
          {tr
            ? "Ücretsiz başla. Aylık ya da yıllık, istediğin zaman değiştir veya iptal et."
            : "Start free. Monthly or yearly — switch or cancel anytime."}
        </p>
      </div>

      {/* 7-day free trial — sits above the toggle so it reads first. */}
      <div className="mx-auto mb-6 flex items-center justify-center gap-2 max-w-md rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
        <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {tr
            ? "İlk 7 gün ücretsiz — istediğin zaman iptal et."
            : "Free for 7 days — cancel anytime."}
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mb-10 flex justify-center">
        <PricingToggle
          value={billing}
          onChange={setBilling}
          yearlySavingsPercent={PRICING.individual.savingsPercent}
          lang={lang as "tr" | "en"}
        />
      </div>

      {feedback && (
        <div
          className={`mx-auto mb-6 max-w-2xl rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Three-tier grid — Individual is now the emphasised middle card. */}
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 items-start">
        {/* FREE */}
        <FreePlanCard
          tr={tr}
          features={features.free}
          isAuthenticated={isAuthenticated}
          onCta={() => router.push(isAuthenticated ? "/" : "/auth/login")}
        />

        {/* INDIVIDUAL — emphasised */}
        <PricingCard
          planId="individual"
          billing={billing}
          lang={lang as "tr" | "en"}
          emphasised
          icon={Crown}
          iconBg="from-amber-400 to-orange-500"
          title={tr ? "Bireysel Premium" : "Individual Premium"}
          description={tr ? "Senin için tam erişim" : "Full access — just for you"}
          features={features.premium}
          ctaLabel={
            premiumStatus?.isPremium
              ? tr ? "Zaten Premium'sun" : "Already Premium"
              : tr ? "7 Gün Ücretsiz Dene" : "Try Free for 7 Days"
          }
          ctaDisabled={premiumStatus?.isPremium}
          trialNote={
            !premiumStatus?.isPremium
              ? tr ? "İlk 7 gün ücretsiz — istediğin zaman iptal et." : "Free for 7 days — cancel anytime."
              : undefined
          }
          onCta={() => goToCheckout("individual")}
        />

        {/* FAMILY — secondary */}
        <PricingCard
          planId="family"
          billing={billing}
          lang={lang as "tr" | "en"}
          icon={Users}
          iconBg="from-emerald-500 to-emerald-600"
          title={tr ? "Aile Premium" : "Family Premium"}
          description={
            tr
              ? `Tüm aile üyeleri Premium (${PRICING.family.maxMembers} kişiye kadar). İstediğin zaman yıllık plana geçebilirsin.`
              : `All family members get Premium (up to ${PRICING.family.maxMembers}). Switch to yearly any time.`
          }
          features={features.family_premium}
          ctaLabel={
            familyPlanActive
              ? tr ? "Aile Premium Aktif" : "Family Premium Active"
              : activatingFamily
                ? tr ? "Aktif ediliyor…" : "Activating…"
                : tr ? "7 Gün Ücretsiz Dene" : "Try Free for 7 Days"
          }
          ctaDisabled={familyPlanActive || activatingFamily}
          ctaLoading={activatingFamily}
          trialNote={
            !familyPlanActive
              ? tr ? "İlk 7 gün ücretsiz — istediğin zaman iptal et." : "Free for 7 days — cancel anytime."
              : undefined
          }
          ctaSubNote={
            isAuthenticated && !isOwner && !familyPlanActive
              ? tr ? "Sadece aile kurucusu aktive edebilir." : "Only the family owner can activate."
              : undefined
          }
          secondaryCtaLabel={
            isOwner && !familyPlanActive
              ? (tr ? "Sahibim: Manuel aktive et →" : "Owner: activate now →")
              : undefined
          }
          onSecondaryCta={isOwner && !familyPlanActive ? handleFamilyActivate : undefined}
          onCta={() => goToCheckout("family")}
        />
      </div>

      {/* Trust strip */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
        <TrustPillar
          icon={Shield}
          title={tr ? "KVKK uyumlu" : "KVKK compliant"}
          body={tr ? "Verin Türkiye'de saklanır. Aydınlatma metni v2.2." : "Data stored in Türkiye. Consent v2.2."}
        />
        <TrustPillar
          icon={CreditCard}
          title={tr ? "Iyzico altyapısı" : "Iyzico-backed payments"}
          body={tr ? "PCI-DSS sertifikalı 3D Secure ödeme." : "PCI-DSS certified 3D Secure checkout."}
        />
        <TrustPillar
          icon={RotateCcw}
          title={tr ? "İptal et, yenilenmesin" : "Cancel anytime"}
          body={tr ? "Deneme süresinde ücret yok. İstediğin an iptal." : "No charge during trial. Cancel anytime."}
        />
      </div>

      {/* FAQ */}
      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="font-heading text-xl font-bold text-center mb-6">
          {tr ? "Sıkça Sorulanlar" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-3">
          <FaqItem
            q={tr ? "Deneme süresinde iptal edersem ücret kesilir mi?" : "If I cancel during the trial, am I charged?"}
            a={tr
              ? "Hayır. İlk 7 gün boyunca herhangi bir zaman iptal edersen, hiçbir ücret kesilmez. Premium özellikler iptal anına kadar açık kalır."
              : "No. If you cancel any time within the first 7 days, you're not charged. Premium features stay on until you cancel."}
          />
          <FaqItem
            q={tr ? "Aylık'tan yıllığa veya tersine geçebilir miyim?" : "Can I switch between monthly and yearly?"}
            a={tr
              ? "Evet, istediğin zaman geçebilirsin. Yıllığa geçersen yaklaşık iki ay kazanırsın; aylığa dönersen kalan dönem için orantılı kredi."
              : "Yes, any time. Moving to yearly saves about two months; switching back to monthly leaves a pro-rated credit for the remaining period."}
          />
          <FaqItem
            q={tr ? "6 kişiden fazla aile üyem var, ne yaparım?" : "I have more than 6 family members — what now?"}
            a={tr
              ? "Aile Premium 6 kişiyle sınırlı. Ek üye için Bireysel Premium veya Aile + Bireysel kombinasyonu kullanabilirsin. Daha geniş paket için info@doctopal.com ile iletişime geç."
              : "Family Premium covers up to 6 people. Beyond that, mix Individual Premium or contact info@doctopal.com for a custom plan."}
          />
          <FaqItem
            q={tr ? "Verilerim nereye gidiyor? AI'ya kim erişiyor?" : "Where does my data go? Who can access it?"}
            a={tr
              ? "Veriler Supabase'de (AB sunucu) saklanır; AI istekleri öncesi isim, e-posta, TC ve adres bilgisi kaldırılır. Detay: /aydinlatma."
              : "Data is stored in Supabase (EU servers); identifying fields are stripped before any AI request. Full detail: /aydinlatma."}
          />
        </div>
      </div>

      {/* Footer notes */}
      <div className="mt-12 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {tr ? "Tüm fiyatlara KDV dahildir." : "All prices include VAT."}
        </p>
        <p className="text-xs text-muted-foreground">
          {tr
            ? "Ödeme güvenliği için Iyzico altyapısı kullanılacaktır. Lansman yakında."
            : "Payments secured by Iyzico. Launch coming soon."}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Free plan card (kept inline since it has no per-month / per-year
// duality and would clutter the reusable PricingCard with edge cases).
// ─────────────────────────────────────────────

function FreePlanCard({
  tr,
  features,
  isAuthenticated,
  onCta,
}: {
  tr: boolean
  features: string[]
  isAuthenticated: boolean
  onCta: () => void
}) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-md">
        <Heart className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-foreground">{tr ? "Ücretsiz" : "Free"}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tr ? "Temel sağlık takibi" : "Basic health tracking"}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-foreground">₺0</span>
        <span className="text-sm text-muted-foreground">{tr ? "/ sonsuza kadar" : "/ forever"}</span>
      </div>
      <ul className="mt-5 space-y-2.5 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onCta}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground py-3 px-4 text-sm font-bold transition-all"
      >
        {isAuthenticated ? (tr ? "Ana Sayfa" : "Go to Home") : (tr ? "Ücretsiz Başla" : "Start Free")}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Trust strip + FAQ helpers (kept in this file — only used here).
// ─────────────────────────────────────────────

function TrustPillar({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-border bg-card px-4 py-3 transition-colors open:bg-muted/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
        <span>{q}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </details>
  )
}
