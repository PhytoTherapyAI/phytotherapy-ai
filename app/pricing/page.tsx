// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { useLang } from "@/components/layout/language-toggle"
import { createBrowserClient } from "@/lib/supabase"
import { Check, Crown, Users, Heart, Sparkles, Loader2, ArrowRight, Shield, Gift } from "lucide-react"
import { LocalizedTitle } from "@/components/layout/LocalizedTitle"

// ─────────────────────────────────────────────
// Pricing config — single source of truth
// ─────────────────────────────────────────────
// Monthly × 12 vs yearly:
//   Individual: 149×12=1.788 → yearly 1.490  (≈₺124/mo, 2 months free)
//   Family:     349×12=4.188 → yearly 3.490  (≈₺291/mo, 2 months free)
//
// Prices include VAT per İpek's spec — surfaced in the footer note so
// there's no "surprise surcharge at checkout" friction.

type Billing = "monthly" | "yearly"

interface PlanRates {
  monthly: { amountLabel: string; periodTr: string; periodEn: string }
  yearly: {
    amountLabel: string
    periodTr: string
    periodEn: string
    perMonthApprox: number
    savingsMonths: number
  }
}

const PRICING: Record<"individual" | "family", PlanRates> = {
  individual: {
    monthly: { amountLabel: "₺149", periodTr: "/ ay", periodEn: "/ mo" },
    yearly:  { amountLabel: "₺1.490", periodTr: "/ yıl", periodEn: "/ yr", perMonthApprox: 124, savingsMonths: 2 },
  },
  family: {
    monthly: { amountLabel: "₺349", periodTr: "/ ay", periodEn: "/ mo" },
    yearly:  { amountLabel: "₺3.490", periodTr: "/ yıl", periodEn: "/ yr", perMonthApprox: 291, savingsMonths: 2 },
  },
}

type PlanId = "free" | "premium" | "family_premium"

const TR_FEATURES: Record<PlanId, string[]> = {
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

const EN_FEATURES: Record<PlanId, string[]> = {
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
  const { familyGroup } = useFamily()
  const router = useRouter()
  const tr = lang === "tr"
  const features = tr ? TR_FEATURES : EN_FEATURES
  const [billing, setBilling] = useState<Billing>("yearly") // default yearly — decoy
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
      }
    } catch {
      setFeedback({ type: "error", msg: tr ? "Bağlantı hatası." : "Connection error." })
    } finally {
      setActivatingFamily(false)
    }
  }

  const individualRate = billing === "yearly" ? PRICING.individual.yearly : PRICING.individual.monthly
  const familyRate = billing === "yearly" ? PRICING.family.yearly : PRICING.family.monthly

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-12">
      <LocalizedTitle tr="Fiyatlandırma" en="Pricing" />

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {tr ? "Aileni koruyan plan" : "The plan that protects your family"}
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
          {tr
            ? "Ücretsiz başla. Aileni kapsamaya geçmek istediğinde tek paket al — 6 kişiye kadar herkesi Premium yap."
            : "Start free. When you want to cover your whole family, one plan upgrades everyone — up to 6 people."}
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              billing === "monthly"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tr ? "Aylık" : "Monthly"}
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors inline-flex items-center gap-2 ${
              billing === "yearly"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tr ? "Yıllık" : "Yearly"}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              billing === "yearly"
                ? "bg-emerald-500 text-white"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
            }`}>
              {tr ? "2 ay bedava" : "2 months free"}
            </span>
          </button>
        </div>
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

      {/* Three-tier grid */}
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 items-start">
        {/* FREE */}
        <PricingCard
          icon={Heart}
          iconBg="from-slate-400 to-slate-500"
          borderClass="border-border"
          title={tr ? "Ücretsiz" : "Free"}
          price="₺0"
          priceSub={tr ? "/ sonsuza kadar" : "/ forever"}
          description={tr ? "Temel sağlık takibi" : "Basic health tracking"}
          features={features.free}
          ctaLabel={
            isAuthenticated
              ? tr ? "Ana Sayfa" : "Go to Home"
              : tr ? "Ücretsiz Başla" : "Start Free"
          }
          onCta={() => router.push(isAuthenticated ? "/" : "/auth/login")}
          ctaVariant="outline"
        />

        {/* PREMIUM INDIVIDUAL */}
        <PricingCard
          icon={Crown}
          iconBg="from-amber-400 to-orange-500"
          borderClass="border-amber-200 dark:border-amber-800"
          title={tr ? "Premium Bireysel" : "Premium Individual"}
          badge={billing === "yearly" ? (tr ? "2 AY BEDAVA" : "2 MONTHS FREE") : undefined}
          badgeColor="amber"
          price={individualRate.amountLabel}
          priceSub={tr ? individualRate.periodTr : individualRate.periodEn}
          perMonthApprox={
            billing === "yearly"
              ? (tr ? `≈ ₺${PRICING.individual.yearly.perMonthApprox} / ay` : `≈ ₺${PRICING.individual.yearly.perMonthApprox} / mo`)
              : undefined
          }
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
          onCta={() => router.push(`/checkout?plan=individual-${billing}`)}
          ctaVariant="amber"
        />

        {/* FAMILY PREMIUM — emphasised */}
        <PricingCard
          icon={Users}
          iconBg="from-emerald-500 to-emerald-600"
          borderClass="border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
          title={tr ? "Premium Aile" : "Family Premium"}
          badge={tr ? "EN POPÜLER" : "MOST POPULAR"}
          badgeColor="emerald"
          price={familyRate.amountLabel}
          priceSub={tr ? familyRate.periodTr : familyRate.periodEn}
          perMonthApprox={
            billing === "yearly"
              ? (tr
                  ? `≈ ₺${PRICING.family.yearly.perMonthApprox} / ay · 6 kişiye kadar`
                  : `≈ ₺${PRICING.family.yearly.perMonthApprox} / mo · up to 6 people`)
              : (tr ? "6 kişiye kadar" : "up to 6 people")
          }
          description={
            tr
              ? "3 kişi olsanız bile ₺447 yerine ₺349 — ailene özel fiyat"
              : "3 people on Individual = ₺447; Family Premium ₺349. Savings scale with members."
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
          onCta={() => router.push(`/checkout?plan=family-${billing}`)}
          ctaVariant="emerald"
          emphasised
        />
      </div>

      {/* Footer notes */}
      <div className="mt-10 text-center space-y-1">
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
// Card sub-component
// ─────────────────────────────────────────────

interface CardProps {
  icon: React.ElementType
  iconBg: string
  borderClass: string
  title: string
  badge?: string
  badgeColor?: "emerald" | "amber"
  price: string
  priceSub: string
  perMonthApprox?: string
  description: string
  features: string[]
  ctaLabel: string
  ctaDisabled?: boolean
  ctaLoading?: boolean
  ctaSubNote?: string
  trialNote?: string
  secondaryCtaLabel?: string
  onSecondaryCta?: () => void
  ctaVariant: "outline" | "amber" | "emerald"
  emphasised?: boolean
  onCta: () => void
}

function PricingCard(p: CardProps) {
  const Icon = p.icon
  const ctaClass =
    p.ctaVariant === "outline"
      ? "border border-border bg-card hover:bg-muted/60 text-foreground"
      : p.ctaVariant === "amber"
        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"

  const badgeClass =
    p.badgeColor === "amber"
      ? "bg-gradient-to-r from-amber-500 to-orange-500"
      : "bg-gradient-to-r from-emerald-500 to-emerald-600"

  return (
    <div
      className={`relative flex flex-col rounded-2xl border ${p.borderClass} bg-card p-6 ${
        p.emphasised ? "lg:scale-105 lg:py-8 shadow-xl" : "shadow-sm"
      }`}
    >
      {p.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-md ${badgeClass}`}>
          <Sparkles className="h-2.5 w-2.5" />
          {p.badge}
        </div>
      )}

      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.iconBg} text-white shadow-md`}>
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-xl font-bold text-foreground">{p.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-foreground">{p.price}</span>
        <span className="text-sm text-muted-foreground">{p.priceSub}</span>
      </div>

      {p.perMonthApprox && (
        <p className="mt-1 text-xs text-muted-foreground">{p.perMonthApprox}</p>
      )}

      <ul className="mt-6 space-y-2.5 flex-1">
        {p.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={p.onCta}
        disabled={p.ctaDisabled}
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${ctaClass}`}
      >
        {p.ctaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {p.ctaLabel}
        {!p.ctaLoading && !p.ctaDisabled && <ArrowRight className="h-4 w-4" />}
      </button>

      {p.trialNote && !p.ctaDisabled && (
        <p className="mt-2 inline-flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
          <Gift className="h-3 w-3 text-emerald-500" />
          {p.trialNote}
        </p>
      )}

      {p.secondaryCtaLabel && p.onSecondaryCta && (
        <button
          type="button"
          onClick={p.onSecondaryCta}
          className="mt-2 text-center text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          {p.secondaryCtaLabel}
        </button>
      )}

      {p.ctaSubNote && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          <Shield className="inline h-3 w-3 mr-1 -mt-0.5" />
          {p.ctaSubNote}
        </p>
      )}
    </div>
  )
}
