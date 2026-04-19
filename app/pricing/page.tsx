// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Check, Crown, Users, Heart, Sparkles, Loader2, ArrowRight, Shield } from "lucide-react"
import { LocalizedTitle } from "@/components/layout/LocalizedTitle"

// Three-tier pricing with decoy effect: Family Premium is visually largest
// and flagged "Most Popular" to pull buyers there even when Individual is
// enough — the per-person cost on Family is what sells it.
//
// Owner-only flow for "Activate Family Premium": POSTs to
// /api/family/upgrade-plan which flips family_groups.plan_type, sets a
// 1-month expiry, and fans out a notification to all accepted members.
// Members who aren't owners see "Ailenin Premium'u" note on the family
// card since only an owner can activate it.

type PlanId = "free" | "premium" | "family_premium"

const TR_FEATURES: Record<PlanId, { positive: string[]; limit?: string }> = {
  free: {
    positive: [
      "Sağlık asistanı (günde 20 soru)",
      "Kendi profili yönetimi",
      "Aile ağacında görünür",
      "SOS acil durum bildirimi",
      "Su, ilaç, check-in takibi",
      "Temel kan tahlili giriş",
    ],
    limit: "Premium özellikleri için yükseltmeniz gerekir.",
  },
  premium: {
    positive: [
      "Sınırsız AI sağlık asistanı",
      "SBAR PDF doktor raporu",
      "Kan tahlili & radyoloji analizi",
      "Prospektüs okuma (foto)",
      "İlaç etkileşim kontrolü",
      "Aile yöneticisi olabilme",
      "Trend grafikleri & biyolojik yaş",
      "Haftalık sağlık özeti",
    ],
  },
  family_premium: {
    positive: [
      "6 kişiye kadar tüm aile Premium",
      "Tüm Premium özellikler herkese",
      "Aile sağlık ağacı + AI genetik analiz",
      "Üyeler arası paylaşım kontrolü",
      "Owner üye yönetimi + admin atama",
      "Bir paket, tüm aile korunmuş",
    ],
  },
}

const EN_FEATURES: Record<PlanId, { positive: string[]; limit?: string }> = {
  free: {
    positive: [
      "Health assistant (20 queries/day)",
      "Own profile management",
      "Visible in family tree",
      "SOS emergency broadcast",
      "Water, meds, check-in tracking",
      "Basic blood test entry",
    ],
    limit: "Upgrade to unlock premium features.",
  },
  premium: {
    positive: [
      "Unlimited AI health assistant",
      "SBAR doctor PDF reports",
      "Blood test & radiology analysis",
      "Prospectus scanning (photo)",
      "Drug interaction checker",
      "Family admin eligibility",
      "Trend charts & biological age",
      "Weekly health summary",
    ],
  },
  family_premium: {
    positive: [
      "Up to 6 family members, all Premium",
      "Every premium feature for everyone",
      "Family health tree + AI genetic insight",
      "Per-member sharing controls",
      "Owner-managed members + admin roles",
      "One plan, the whole household covered",
    ],
  },
}

export default function PricingPage() {
  const { lang } = useLang()
  const { user, isAuthenticated, premiumStatus } = useAuth()
  const { familyGroup } = useFamily()
  const router = useRouter()
  const tr = lang === "tr"
  const features = tr ? TR_FEATURES : EN_FEATURES
  const [activatingFamily, setActivatingFamily] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const isOwner = !!familyGroup && familyGroup.owner_id === user?.id
  const familyPlanActive =
    familyGroup?.plan_type === "family_premium"
    && !!familyGroup.plan_expires_at
    && new Date(familyGroup.plan_expires_at) > new Date()

  async function handleFamilyActivate() {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }
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
        body: JSON.stringify({ durationMonths: 1 }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFeedback({
          type: "error",
          msg: data.error || (tr ? "Aktivasyon başarısız." : "Activation failed."),
        })
      } else {
        setFeedback({
          type: "success",
          msg: tr
            ? "Aile Premium aktif edildi. Tüm üyelere bildirim gönderildi."
            : "Family Premium activated. All members notified.",
        })
      }
    } catch {
      setFeedback({
        type: "error",
        msg: tr ? "Bağlantı hatası." : "Connection error.",
      })
    } finally {
      setActivatingFamily(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-12">
      <LocalizedTitle tr="Fiyatlandırma" en="Pricing" />

      {/* Header */}
      <div className="mb-10 text-center">
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

      {/* Three-tier grid — middle card scaled up for decoy */}
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
          features={features.free.positive}
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
          price="₺149"
          priceSub={tr ? "/ ay, KDV dahil" : "/ mo, VAT incl."}
          description={tr ? "Senin için tam erişim" : "Full access — just for you"}
          features={features.premium.positive}
          ctaLabel={
            premiumStatus?.isPremium
              ? tr ? "Zaten Premium'sun" : "Already Premium"
              : tr ? "Premium'a Geç" : "Go Premium"
          }
          ctaDisabled={premiumStatus?.isPremium}
          onCta={() => {
            // TODO: Stripe checkout route
            setFeedback({
              type: "success",
              msg: tr
                ? "Bireysel Premium ödeme akışı yakında. İletişim: contact@doctopal.com"
                : "Individual checkout coming soon. Contact: contact@doctopal.com",
            })
          }}
          ctaVariant="amber"
        />

        {/* FAMILY PREMIUM — emphasised */}
        <PricingCard
          icon={Users}
          iconBg="from-emerald-500 to-emerald-600"
          borderClass="border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
          title={tr ? "Premium Aile" : "Family Premium"}
          badge={tr ? "EN POPÜLER" : "MOST POPULAR"}
          price="₺349"
          priceSub={tr ? "/ ay, 6 kişiye kadar" : "/ mo, up to 6 people"}
          description={
            tr
              ? "3 kişi olsanız bile ₺447 yerine ₺349 — ailene özel fiyat"
              : "3 people = ₺447 on individual; Family ₺349. Savings scale with members."
          }
          features={features.family_premium.positive}
          ctaLabel={
            familyPlanActive
              ? tr ? "Aile Premium Aktif" : "Family Premium Active"
              : activatingFamily
                ? tr ? "Aktif ediliyor…" : "Activating…"
                : tr ? "Aileni Premium Yap" : "Upgrade My Family"
          }
          ctaDisabled={familyPlanActive || activatingFamily || (isAuthenticated && !isOwner)}
          ctaLoading={activatingFamily}
          ctaSubNote={
            isAuthenticated && !isOwner && !familyPlanActive
              ? tr
                ? "Yalnızca aile kurucusu aktif edebilir"
                : "Only the family owner can activate"
              : undefined
          }
          onCta={handleFamilyActivate}
          ctaVariant="emerald"
          emphasised
        />
      </div>

      {/* Footer note */}
      <div className="mt-10 text-center text-xs text-muted-foreground">
        {tr
          ? "Tüm fiyatlara KDV dahildir. İstediğin zaman iptal edebilirsin. Ödeme güvenliği için iyzico altyapısı kullanılacaktır."
          : "All prices include VAT. Cancel anytime. Payments are secured by iyzico (integration in progress)."}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Card sub-component (kept local — not reused elsewhere)
// ─────────────────────────────────────────────

interface CardProps {
  icon: React.ElementType
  iconBg: string
  borderClass: string
  title: string
  badge?: string
  price: string
  priceSub: string
  description: string
  features: string[]
  ctaLabel: string
  ctaDisabled?: boolean
  ctaLoading?: boolean
  ctaSubNote?: string
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

  return (
    <div
      className={`relative flex flex-col rounded-2xl border ${p.borderClass} bg-card p-6 ${
        p.emphasised ? "lg:scale-105 lg:py-8 shadow-xl" : "shadow-sm"
      }`}
    >
      {p.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-[10px] font-bold text-white shadow-md">
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

      {p.ctaSubNote && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          <Shield className="inline h-3 w-3 mr-1 -mt-0.5" />
          {p.ctaSubNote}
        </p>
      )}
    </div>
  )
}
