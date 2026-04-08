// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { PRICING } from "@/lib/premium"
import {
  Check,
  Crown,
  Users,
  Stethoscope,
  Sparkles,
  Zap,
  Shield,
  Heart,
  ArrowRight,
} from "lucide-react"

const PLANS = [
  {
    id: "free" as const,
    icon: Heart,
    gradient: "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
    border: "border-slate-200 dark:border-slate-700",
    popular: false,
  },
  {
    id: "premium" as const,
    icon: Crown,
    gradient: "from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40",
    border: "border-amber-300 dark:border-amber-700",
    popular: true,
  },
  {
    id: "family" as const,
    icon: Users,
    gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
    border: "border-blue-200 dark:border-blue-800",
    popular: false,
  },
  {
    id: "doctor" as const,
    icon: Stethoscope,
    gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    popular: false,
  },
]

export default function PricingPage() {
  const { lang } = useLang()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly")

  const handleSelect = (planId: string) => {
    if (planId === "free") {
      if (isAuthenticated) router.push("/dashboard")
      else router.push("/auth/login")
      return
    }
    // Payment not active yet — show coming soon
    // Will be replaced with Iyzico integration later
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {tx("pricing.title", lang)}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {tx("pricing.subtitle", lang)}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            billing === "monthly"
              ? "bg-foreground text-background shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tx("pricing.monthly", lang)}
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            billing === "yearly"
              ? "bg-foreground text-background shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tx("pricing.yearly", lang)}
          <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {tx("pricing.saveTag", lang)}
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = plan.id === "free" ? 0 : (
            billing === "monthly"
              ? PRICING[plan.id as keyof typeof PRICING]?.monthly
              : PRICING[plan.id as keyof typeof PRICING]?.yearly
          )
          const perMonth = plan.id === "free" ? 0 : (
            billing === "yearly"
              ? Math.round(((PRICING[plan.id as keyof typeof PRICING]?.yearly || 0) / 12) * 100) / 100
              : PRICING[plan.id as keyof typeof PRICING]?.monthly
          )

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 bg-gradient-to-b ${plan.gradient} ${plan.border} p-6 transition-all hover:shadow-lg ${
                plan.popular ? "ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-background" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-xs font-bold text-white shadow">
                  {tx("pricing.mostPopular", lang)}
                </div>
              )}

              <div className="mb-4 flex items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  plan.id === "premium" ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
                  plan.id === "family" ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white" :
                  plan.id === "doctor" ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white" :
                  "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  <plan.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{tx(`pricing.${plan.id}.name`, lang)}</h3>
                  <p className="text-xs text-muted-foreground">{tx(`pricing.${plan.id}.tagline`, lang)}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                {plan.id === "free" ? (
                  <div className="text-3xl font-bold">{tx("pricing.free", lang)}</div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">₺{Number(perMonth).toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">/{tx("pricing.mo", lang)}</span>
                    </div>
                    {billing === "yearly" && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        ₺{Number(price).toFixed(2)}/{tx("pricing.yr", lang)} · {tx("pricing.savePercent", lang).replace("{pct}", String(PRICING[plan.id as keyof typeof PRICING]?.yearlySavings))}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-2">
                {(tx(`pricing.${plan.id}.features`, lang) || "").split("|").map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{feat.trim()}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelect(plan.id)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  plan.id === "premium"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow hover:brightness-110"
                    : plan.id === "free"
                    ? "bg-foreground/10 text-foreground hover:bg-foreground/20"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {plan.id === "free"
                  ? tx("pricing.getStartedFree", lang)
                  : tx("pricing.comingSoon", lang)}
                {plan.id !== "free" && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )
        })}
      </div>

      {/* Trial info */}
      <div className="mt-10 rounded-2xl border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
          <Zap className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{tx("pricing.trialTitle", lang)}</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{tx("pricing.trialDesc", lang)}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-green-500" />
            {tx("pricing.trialPoint1", lang)}
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-green-500" />
            {tx("pricing.trialPoint2", lang)}
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-green-500" />
            {tx("pricing.trialPoint3", lang)}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="mb-6 text-center font-heading text-2xl font-semibold">{tx("pricing.faqTitle", lang)}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <h4 className="mb-1 text-sm font-semibold">{tx(`pricing.faq${i}q`, lang)}</h4>
              <p className="text-sm text-muted-foreground">{tx(`pricing.faq${i}a`, lang)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
