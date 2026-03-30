// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Search, CheckCircle2, MessageCircle, Send,
  Activity, BookOpen, Shield, Sparkles, Moon, Droplets, Pill, Leaf,
} from "lucide-react";
import { BotanicalHero } from "@/components/illustrations/botanical-hero";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard";

// ── Quick Action Chips ──
const QUICK_CHIPS = [
  { emoji: "💊", labelKey: "lp.chipInteraction", href: "/interaction-checker" },
  { emoji: "🩸", labelKey: "lp.chipBloodTest", href: "/blood-test" },
  { emoji: "🌿", labelKey: "lp.chipHerbOfDay", href: "/health-assistant" },
  { emoji: "😴", labelKey: "lp.chipSleep", href: "/sleep-analysis" },
  { emoji: "💪", labelKey: "lp.chipSports", href: "/sports-performance" },
];

const TRUST_KEYS = ["lp.trust1", "lp.trust2", "lp.trust3", "lp.trust4", "lp.trust5"];

const FAQ_ITEMS = [
  { questionTr: "Fitoterapi nedir?", questionEn: "What is phytotherapy?",
    answerTr: "Fitoterapi, bilimsel olarak kanıtlanmış bitkisel tedavilerin kullanılmasıdır. Phytotherapy.ai, modern tıp ile kanıta dayalı bitkisel tıbbı birleştirerek güvenli ve kişiselleştirilmiş öneriler sunar.",
    answerEn: "Phytotherapy is the use of scientifically proven herbal treatments. Phytotherapy.ai bridges modern medicine and evidence-based herbal medicine to provide safe, personalized recommendations." },
  { questionTr: "İlaçlarla bitkisel takviye kullanmak güvenli mi?", questionEn: "Is it safe to use herbal supplements with medications?",
    answerTr: "Bazı bitkisel takviyeler ilaçlarla etkileşime girebilir. Phytotherapy.ai'ın ilaç etkileşim kontrolü, güvenli ve riskli kombinasyonları bilimsel kaynaklarla gösterir.",
    answerEn: "Some herbal supplements can interact with medications. Phytotherapy.ai's drug interaction checker shows safe and risky combinations with scientific sources." },
  { questionTr: "Kan tahlilimi nasıl yorumlarım?", questionEn: "How can I interpret my blood test results?",
    answerTr: "Kan tahlili değerlerinizi girerek yapay zeka destekli detaylı analiz alabilirsiniz. 30'dan fazla biyomarkör değerlendirilir.",
    answerEn: "Enter your blood test values for AI-powered detailed analysis. 30+ biomarkers are evaluated." },
  { questionTr: "Phytotherapy.ai ücretsiz mi?", questionEn: "Is Phytotherapy.ai free?",
    answerTr: "Evet, temel özellikleri ücretsizdir. Sağlık asistanı, ilaç etkileşim kontrolü ve kan tahlili analizi ücretsiz kullanılabilir.",
    answerEn: "Yes, core features are free. The health assistant, drug interaction checker, and blood test analysis are available at no cost." },
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
  const isTr = lang === "tr";

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // ─── AUTHENTICATED USER — Command Center ───
  if (showDashboard) {
    return (
      <div className="flex flex-col">
        <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-4">
          {/* Dynamic greeting */}
          <h1 className="font-heading text-2xl font-semibold mb-1 sm:text-3xl">
            {getTimeEmoji()} {isTr ? `Merhaba ${firstName}` : `Hi ${firstName}`}
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            {isTr ? "Bugün senin için ne yapabilirim?" : "What can I do for you today?"}
          </p>

          {/* Spotlight search bar */}
          <form onSubmit={handleSearch} className="mb-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTr ? "Tahlil ara veya Asistana sor... ⌘K" : "Search tests or ask the Assistant... ⌘K"}
                className="w-full rounded-2xl border bg-card py-3.5 pl-11 pr-14 text-sm shadow-soft-md outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-soft-lg"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90">
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Quick action chips — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
            {QUICK_CHIPS.map(({ emoji, labelKey, href }) => (
              <Link key={href} href={href}
                className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-soft active:scale-95"
              >
                <span>{emoji}</span>
                {tx(labelKey, lang) || (isTr ? "Araç" : "Tool")}
              </Link>
            ))}
          </div>

          {/* ── Bento Grid ── */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Card 1 — Wide: AI Assistant */}
            <Link href="/health-assistant"
              className="col-span-2 group relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/5 to-sage/5 p-5 transition-all hover:shadow-soft-lg hover:-translate-y-0.5 dark:from-primary/10 dark:to-sage/10"
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{isTr ? "Kanıta Dayalı Asistan" : "Evidence-Based Assistant"}</h3>
                    <p className="text-[11px] text-muted-foreground">{isTr ? "PubMed + Cochrane destekli" : "PubMed + Cochrane powered"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>
                  <span className="text-[10px] text-green-600 font-medium">Online</span>
                </div>
              </div>
              <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </Link>

            {/* Card 2 — Square Left: Interaction Engine */}
            <Link href="/interaction-checker"
              className="group rounded-2xl border bg-card p-4 transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral/10 mb-3">
                <Shield className="h-4 w-4 text-coral" />
              </div>
              <h3 className="text-sm font-bold">{isTr ? "Etkileşim Motoru" : "Interaction Engine"}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{isTr ? "İlaç-bitki güvenliği" : "Drug-herb safety"}</p>
            </Link>

            {/* Card 3 — Square Right: Blood Test */}
            <Link href="/blood-test"
              className="group rounded-2xl border bg-card p-4 transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
              style={{ animationDelay: "160ms" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 mb-3">
                <Droplets className="h-4 w-4 text-rose-500" />
              </div>
              <h3 className="text-sm font-bold">{isTr ? "Kan Tahlili" : "Blood Test"}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{isTr ? "AI analiz + PDF rapor" : "AI analysis + PDF report"}</p>
            </Link>

            {/* Card 4 — Square Left: Calendar */}
            <Link href="/calendar"
              className="group rounded-2xl border bg-card p-4 transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender/10 mb-3">
                <Moon className="h-4 w-4 text-lavender" />
              </div>
              <h3 className="text-sm font-bold">{isTr ? "Takvim Hub" : "Calendar Hub"}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{isTr ? "İlaç + takviye takibi" : "Meds + supplement tracking"}</p>
            </Link>

            {/* Card 5 — Square Right: Sports */}
            <Link href="/sports-performance"
              className="group rounded-2xl border bg-card p-4 transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 mb-3">
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold">{isTr ? "Spor Performansı" : "Sports Performance"}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{isTr ? "AI antrenman planı" : "AI training plan"}</p>
            </Link>
          </div>

          {/* Daily Summary */}
          <DailySummaryCard userId={user.id} lang={lang} userName={profile.full_name} />
        </section>

        {/* Trust strip */}
        <section className="mt-6 border-t bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4">
            {TRUST_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {tx(key, lang)}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ─── GUEST LANDING — Mobile-First Command Center ───
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 md:pt-16 md:pb-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
            <div className="flex-1 text-center md:text-left stagger-children">
              {/* Badge */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
                <Activity className="h-3.5 w-3.5" />
                {tx("lp.heroBadge", lang)}
              </div>

              {/* Dynamic heading */}
              <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {isTr ? "Bugün nasıl hissediyorsun?" : "How are you feeling today?"}
              </h1>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
                {isTr
                  ? "Hangi bitkiyi merak ediyorsun? İlaç etkileşimlerini kontrol et, kan tahlilini analiz et veya asistana sor."
                  : "Curious about an herb? Check drug interactions, analyze blood tests, or ask the assistant."}
              </p>

              {/* Spotlight search */}
              <form onSubmit={handleSearch} className="mt-5 md:mt-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isTr ? "Bir bitki veya sağlık sorusu sor..." : "Ask about any herb or health question..."}
                    className="w-full rounded-2xl border bg-card py-3.5 pl-11 pr-14 text-sm shadow-soft-md outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Quick action chips */}
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide justify-center md:justify-start">
                {QUICK_CHIPS.map(({ emoji, labelKey, href }) => (
                  <Link key={href} href={href}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-primary active:scale-95"
                  >
                    <span>{emoji}</span>
                    {tx(labelKey, lang) || (isTr ? "Araç" : "Tool")}
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-6">
                <Link href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  {tx("nav.getStarted", lang)} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/health-assistant"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium hover:bg-muted">
                  <MessageCircle className="h-4 w-4" /> {tx("lp.tryAssistant", lang)}
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden w-56 shrink-0 sm:block sm:w-72 md:w-80 animate-gentle-sway">
              <BotanicalHero className="h-auto w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-primary/5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">BETA</span>
            <span className="text-[11px] text-muted-foreground">{tx("lp.statBeta", lang)}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">PubMed</span>
            <span className="text-[11px] text-muted-foreground">{tx("lp.statSources", lang)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">30+</span>
            <span className="text-[11px] text-muted-foreground">{tx("lp.statTools", lang)}</span>
          </div>
        </div>
      </section>

      {/* ── Bento Grid for guests ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-2 gap-3 md:gap-4 stagger-children">
          {/* Wide: AI Assistant */}
          <Link href="/health-assistant"
            className="col-span-2 group relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/5 to-sage/5 p-5 transition-all card-hover dark:from-primary/10 dark:to-sage/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">{isTr ? "Kanıta Dayalı AI Asistan" : "Evidence-Based AI Assistant"}</h3>
                <p className="text-xs text-muted-foreground">{isTr ? "PubMed + Cochrane + hakemli dergiler" : "PubMed + Cochrane + peer-reviewed journals"}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" /></span>
              </div>
            </div>
          </Link>

          {/* Square: Interaction */}
          <Link href="/interaction-checker" className="group rounded-2xl border bg-card p-4 transition-all card-hover">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral/10 mb-3"><Pill className="h-4 w-4 text-coral" /></div>
            <h3 className="text-sm font-bold">{isTr ? "Etkileşim Motoru" : "Interaction Engine"}</h3>
          </Link>

          {/* Square: Blood Test */}
          <Link href="/blood-test" className="group rounded-2xl border bg-card p-4 transition-all card-hover">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 mb-3"><Droplets className="h-4 w-4 text-rose-500" /></div>
            <h3 className="text-sm font-bold">{isTr ? "Kan Tahlili" : "Blood Test"}</h3>
          </Link>

          {/* Square: Supplements */}
          <Link href="/health-assistant" className="group rounded-2xl border bg-card p-4 transition-all card-hover">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 mb-3"><Leaf className="h-4 w-4 text-emerald-500" /></div>
            <h3 className="text-sm font-bold">{isTr ? "Takviye Rehberi" : "Supplement Guide"}</h3>
          </Link>

          {/* Square: Sleep */}
          <Link href="/sleep-analysis" className="group rounded-2xl border bg-card p-4 transition-all card-hover">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender/10 mb-3"><Moon className="h-4 w-4 text-lavender" /></div>
            <h3 className="text-sm font-bold">{isTr ? "Uyku Analizi" : "Sleep Analysis"}</h3>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="font-heading text-2xl font-semibold text-center mb-6">{tx("common.faqTitle", lang)}</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group rounded-xl border bg-card p-4">
              <summary className="cursor-pointer font-medium text-sm list-none flex items-center justify-between">
                {lang === "tr" ? item.questionTr : item.questionEn}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {lang === "tr" ? item.answerTr : item.answerEn}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Disclaimer — subtle, at the very bottom */}
      <p className="text-center text-[10px] text-muted-foreground/40 px-4 pb-4">
        {tx("disclaimer.banner", lang)}
      </p>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebApplication",
        name: "Phytotherapy.ai", url: "https://phytotherapy.ai",
        description: "AI-powered evidence-based integrative medicine assistant.",
        applicationCategory: "HealthApplication", operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question", name: item.questionEn,
          acceptedAnswer: { "@type": "Answer", text: item.answerEn },
        })),
      }) }} />
    </div>
  );
}

// Time-based greeting emoji
function getTimeEmoji(): string {
  const h = new Date().getHours();
  if (h < 6) return "🌙";
  if (h < 12) return "☀️";
  if (h < 17) return "🌤️";
  if (h < 21) return "🌅";
  return "🌙";
}
