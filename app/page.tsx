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
} from "lucide-react";
import { BotanicalHero } from "@/components/illustrations/botanical-hero";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const QUICK_TAGS = [
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
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/health-assistant?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="flex flex-col">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-8 px-4 py-12 md:flex-row md:gap-12 md:py-20">
          {/* Left — text + search */}
          <div className="flex-1 text-center md:text-left">
            {/* Main heading */}
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

            {/* Search bar */}
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

            {/* Quick tags */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {QUICK_TAGS.map((tag) => (
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

          {/* Right — botanical illustration */}
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
              {/* Number watermark */}
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
