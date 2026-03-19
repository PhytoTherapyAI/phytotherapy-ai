"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  FlaskConical,
  FileText,
  ShieldCheck,
  ArrowRight,
  Search,
  CheckCircle2,
  MessageCircle,
  Send,
} from "lucide-react";
import { BotanicalHero } from "@/components/illustrations/botanical-hero";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard";

const QUICK_TAGS_AUTH = [
  { key: "lp.tag1", href: "/interaction-checker" },
  { key: "lp.tag2", href: "/health-assistant" },
  { key: "lp.tag3", href: "/health-assistant" },
];

const QUICK_TAGS_GUEST = [
  { key: "lp.tag1", href: "/interaction-checker" },
  { key: "lp.tag2", href: "/health-assistant" },
  { key: "lp.tag3", href: "/health-assistant" },
  { key: "lp.tag4", href: "/interaction-checker" },
];

const TRUST_KEYS = ["lp.trust1", "lp.trust2", "lp.trust3", "lp.trust4", "lp.trust5"];

const FEATURES = [
  { num: "01", href: "/interaction-checker", icon: Shield, titleKey: "lp.feat1.title", descKey: "lp.feat1.desc" },
  { num: "02", href: "/health-assistant", icon: FlaskConical, titleKey: "lp.feat2.title", descKey: "lp.feat2.desc" },
  { num: "03", href: "/blood-test", icon: FileText, titleKey: "lp.feat3.title", descKey: "lp.feat3.desc" },
  { num: "04", href: "/interaction-checker", icon: ShieldCheck, titleKey: "lp.feat4.title", descKey: "lp.feat4.desc" },
];

export default function Home() {
  const router = useRouter();
  const { lang } = useLang();
  const { user, isAuthenticated, isLoading, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/health-assistant?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const showDashboard = isAuthenticated && user && profile?.onboarding_complete;
  const firstName = profile?.full_name?.split(" ")[0] || "";

  // Show nothing briefly while auth resolves (prevents guest→auth flash)
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // ─── AUTHENTICATED USER LAYOUT ───
  if (showDashboard) {
    return (
      <div className="flex flex-col">
        {/* ===== FIRST SCREEN: grid + trust bar fills viewport ===== */}
        <div className="flex min-h-[calc(100vh-5.5rem)] flex-col">
        <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-2">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Top Left — Daily Summary */}
            <DailySummaryCard
              userId={user.id}
              lang={lang}
              userName={profile.full_name}
            />

            {/* Top Right — Assistant Chat Box */}
            <div className="flex flex-col justify-between rounded-xl border bg-card p-5">
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{tx("lp.assistantTitle", lang)}</h3>
                    <p className="text-[11px] text-muted-foreground">{tx("lp.assistantSubtitle", lang)}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Online
                  </span>
                </div>
              </div>

              <div className="mb-3 flex-1 space-y-2">
                <div className="rounded-lg rounded-tl-none bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                  {firstName
                    ? tx("lp.assistantGreeting", lang).replace("{name}", firstName)
                    : tx("lp.assistantGreetingGeneric", lang)
                  }
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tx('lp.chatPlaceholder', lang)}
                    className="w-full rounded-lg border bg-background py-2.5 pl-3 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  type="submit"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {QUICK_TAGS_AUTH.map((tag) => (
                  <Link
                    key={tag.key}
                    href={tag.href}
                    className="rounded-full border px-2.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {tx(tag.key, lang)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Left — Hero Text */}
            <div className="flex flex-col justify-start pt-4 pb-6 md:pt-6 md:pb-8">
              <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.5rem]">
                {tx('lp.heroHeading1', lang)}{" "}
                <br className="hidden sm:block" />
                <em className="font-heading" style={{ fontStyle: "italic", color: "var(--gold)" }}>
                  {tx('lp.heroHeadingItalic', lang)}
                </em>{" "}
                <span className="text-primary">{tx('lp.heroHeadingEnd', lang)}</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg" style={{ width: "125%", maxWidth: "125%" }}>
                {tx('lp.heroDescription', lang)}
              </p>
            </div>

            {/* Bottom Right — Botanical Illustration */}
            <div className="flex items-start justify-center pb-6 md:-mt-8 md:pb-8">
              <BotanicalHero className="h-auto w-full max-w-[280px]" />
            </div>
          </div>
        </section>

        {/* ===== TRUST STRIP (bottom of viewport) ===== */}
        <section className="mt-auto border-y bg-muted/30">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5">
            {TRUST_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {tx(key, lang)}
              </div>
            ))}
          </div>
        </section>

        </div>

        {/* ===== FEATURES ===== */}
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {tx('lp.featureTitle1', lang)}{" "}
              <em className="font-heading" style={{ fontStyle: "italic" }}>
                {tx('lp.featureTitle2', lang)}
              </em>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Link
                key={feature.num}
                href={feature.href}
                className="group relative rounded-xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <span className="font-heading absolute right-4 top-4 text-4xl font-bold text-muted/60">
                  {feature.num}
                </span>
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight">
                  <span style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600, fontSize: '1rem', display: 'block' }}>
                    {tx(feature.titleKey, lang)}
                  </span>
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tx(feature.descKey, lang)}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {tx('lp.explore', lang)} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ─── GUEST LAYOUT (original) ───
  return (
    <div className="flex flex-col">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-8 px-4 py-12 md:flex-row md:gap-12 md:py-20">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {tx('lp.heroHeading1', lang)}{" "}
              <br className="hidden sm:block" />
              <em className="font-heading" style={{ fontStyle: "italic", color: "var(--gold)" }}>
                {tx('lp.heroHeadingItalic', lang)}
              </em>{" "}
              <span className="text-primary">{tx('lp.heroHeadingEnd', lang)}</span>
            </h1>

            <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
              {tx('lp.heroDescription', lang)}
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tx('lp.searchPlaceholder', lang)}
                  className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {tx('lp.searchButton', lang)}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {QUICK_TAGS_GUEST.map((tag) => (
                <Link
                  key={tag.key}
                  href={tag.href}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {tx(tag.key, lang)}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-56 shrink-0 sm:w-72 md:w-80 lg:w-96">
            <BotanicalHero className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4">
          {TRUST_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {tx(key, lang)}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {tx('lp.featureTitle1', lang)}{" "}
            <em className="font-heading" style={{ fontStyle: "italic" }}>
              {tx('lp.featureTitle2', lang)}
            </em>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.num}
              href={feature.href}
              className="group relative rounded-xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <span className="font-heading absolute right-4 top-4 text-4xl font-bold text-muted/60">
                {feature.num}
              </span>
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight">
                <span style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600, fontSize: '1rem', display: 'block' }}>
                  {tx(feature.titleKey, lang)}
                </span>
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tx(feature.descKey, lang)}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {tx('lp.explore', lang)} <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
