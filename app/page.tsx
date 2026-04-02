// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Search, CheckCircle2, MessageCircle, Send,
  Activity, BookOpen, Shield, Sparkles, Moon, Droplets, Pill, Leaf, Flame,
} from "lucide-react";
import dynamic from "next/dynamic";
const BotanicalHero = dynamic(() => import("@/components/illustrations/botanical-hero").then(m => m.BotanicalHero), { ssr: false, loading: () => <div className="h-64 w-full rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" /> });
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard";

// ── Progress Ring ──
function ProgressRing({ value, size = 80 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={6} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="#3c7a52" strokeWidth={6} fill="none"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

// ── Daily Tasks Widget ──
const INIT_TASKS = (isTr: boolean) => [
  { id: "med",   emoji: "💊", labelTr: "İlaçlar 0/1",       labelEn: "Medications 0/1" },
  { id: "water", emoji: "💧", labelTr: "Su 0/8 bardak",     labelEn: "Water 0/8 glasses" },
  { id: "sup",   emoji: "🌿", labelTr: "Takviyeler",        labelEn: "Supplements" },
  { id: "walk",  emoji: "🚶", labelTr: "10 dk yürüyüş",     labelEn: "10 min walk" },
];

function DailyTasksWidget({ isTr, firstName, timeEmoji, streak = 3 }: {
  isTr: boolean; firstName: string; timeEmoji: string; streak?: number;
}) {
  const [tasks, setTasks] = useState(INIT_TASKS(isTr).map(t => ({ ...t, done: false })));
  const done = tasks.filter(t => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const toggle = (id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <div className="rounded-2xl border bg-card shadow-soft p-5">
      <div className="flex gap-5 items-start">
        {/* Ring */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="relative">
            <ProgressRing value={pct} size={88} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground leading-none">{pct}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
            <Flame className="h-3 w-3" /> {streak} {isTr ? "gün seri" : "day streak"}
          </div>
        </div>

        {/* Tasks */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-0.5">
            {isTr ? `İyi günler, ${firstName}` : `Good day, ${firstName}`} {timeEmoji}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {isTr ? "Günlük görevlerini tamamla, skorunu yükselt!" : "Complete your daily tasks, boost your score!"}
          </p>
          <div className="space-y-1.5">
            {tasks.map(t => (
              <button key={t.id} onClick={() => toggle(t.id)}
                className="flex items-center gap-2.5 w-full text-left group">
                <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                  ${t.done ? "border-primary bg-primary" : "border-stone-300 group-hover:border-primary/50"}`}>
                  {t.done && <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span className="text-[11px]">{t.emoji}</span>
                <span className={`text-sm transition-all ${t.done ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                  {isTr ? t.labelTr : t.labelEn}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{done}/{tasks.length} {isTr ? "tamamlandı" : "completed"}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">BETA</span>
        <Link href="/dashboard" className="flex items-center gap-1 text-xs text-primary hover:underline">
          {isTr ? "Panele git" : "Open dashboard"} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ── AuthHome ──
function AuthHome({ isTr, lang, firstName, timeEmoji, searchQuery, setSearchQuery, handleSearch, userId }: {
  isTr: boolean; lang: string; firstName: string; timeEmoji: string;
  searchQuery: string; setSearchQuery: (v: string) => void;
  handleSearch: (e: React.FormEvent) => void; userId: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16">
      {/* Omni-bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={isTr ? "Bir soru sor veya takviye ara..." : "Ask a question or search supplements..."}
            className="w-full rounded-2xl border bg-card py-4 pl-11 pr-14 text-sm shadow-soft-md outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-soft-lg"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90">
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Quick chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
        {QUICK_CHIPS.map(({ emoji, labelKey, href }) => (
          <Link key={href} href={href}
            className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-soft active:scale-95">
            <span>{emoji}</span>{tx(labelKey, lang as "tr" | "en") || (isTr ? "Araç" : "Tool")}
          </Link>
        ))}
      </div>

      {/* Daily tasks widget */}
      <DailyTasksWidget isTr={isTr} firstName={firstName} timeEmoji={timeEmoji} streak={3} />
    </div>
  );
}

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
    answerTr: "Fitoterapi, bilimsel olarak kanıtlanmış bitkisel tedavilerin kullanılmasıdır. Doctopal, modern tıp ile kanıta dayalı bitkisel tıbbı birleştirerek güvenli ve kişiselleştirilmiş öneriler sunar.",
    answerEn: "Phytotherapy is the use of scientifically proven herbal treatments. Doctopal bridges modern medicine and evidence-based herbal medicine to provide safe, personalized recommendations." },
  { questionTr: "İlaçlarla bitkisel takviye kullanmak güvenli mi?", questionEn: "Is it safe to use herbal supplements with medications?",
    answerTr: "Bazı bitkisel takviyeler ilaçlarla etkileşime girebilir. Doctopal'ın ilaç etkileşim kontrolü, güvenli ve riskli kombinasyonları bilimsel kaynaklarla gösterir.",
    answerEn: "Some herbal supplements can interact with medications. Doctopal's drug interaction checker shows safe and risky combinations with scientific sources." },
  { questionTr: "Kan tahlilimi nasıl yorumlarım?", questionEn: "How can I interpret my blood test results?",
    answerTr: "Kan tahlili değerlerinizi girerek yapay zeka destekli detaylı analiz alabilirsiniz. 30'dan fazla biyomarkör değerlendirilir.",
    answerEn: "Enter your blood test values for AI-powered detailed analysis. 30+ biomarkers are evaluated." },
  { questionTr: "Doctopal ücretsiz mi?", questionEn: "Is Doctopal free?",
    answerTr: "Evet, temel özellikleri ücretsizdir. Sağlık asistanı, ilaç etkileşim kontrolü ve kan tahlili analizi ücretsiz kullanılabilir.",
    answerEn: "Yes, core features are free. The health assistant, drug interaction checker, and blood test analysis are available at no cost." },
];

export default function Home() {
  const router = useRouter();
  const { lang } = useLang();
  const { user, isAuthenticated, isLoading, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeEmoji, setTimeEmoji] = useState("👋");

  useEffect(() => { setTimeEmoji(getTimeEmoji()); }, []);

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

  // ─── AUTHENTICATED USER — Minimal Command Center ───
  if (showDashboard) {
    return (
      <AuthHome
        isTr={isTr} lang={lang} firstName={firstName} timeEmoji={timeEmoji}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch}
        userId={user.id}
      />
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
              <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-5xl">
                {isTr ? (
                  <>Kanıt Doğayla Buluşur.<br /><span style={{ color: "var(--brand)" }}>Yapay Zeka Seninle.</span></>
                ) : (
                  <>Evidence Meets Nature.<br /><span style={{ color: "var(--brand)" }}>AI Meets You.</span></>
                )}
              </h1>
              <p className="mt-3 max-w-lg text-xs text-muted-foreground sm:text-sm md:text-base">
                {isTr
                  ? "DoctoPal, modern tıp ile doğal iyileşmeyi birleştirir — ilaç etkileşimleri, fitoterapi protokolleri ve kişiselleştirilmiş sağlık bilgileri, bilim tarafından doğrulanmış."
                  : "DoctoPal bridges modern medicine and natural healing — drug interactions, phytotherapy protocols, and personalized health insights, all verified by science."}
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
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

      {/* Trust Indicators */}
      <section className="border-y bg-primary/5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 py-5 sm:gap-x-8">
          {[
            { icon: "🔬", label: "PubMed Verified" },
            { icon: "🏥", label: "FHIR Compatible" },
            { icon: "🔒", label: "HIPAA & KVKK Compliant" },
            { icon: "🤖", label: "Powered by Claude AI" },
            { icon: "📱", label: "166+ Health Tools" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span>{t.icon}</span> {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Showcase ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <h2 className="font-heading text-xl font-semibold text-center mb-2 sm:text-2xl">
          {isTr ? "Neler Yapabilirsin?" : "What Can You Do?"}
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
          {isTr ? "Sağlığını bilimle yönet" : "Manage your health with science"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { emoji: "💊", title: isTr ? "İlaç Etkileşim Kalkanı" : "Drug Interaction Shield", desc: isTr ? "50.000+ ilaç-bitki etkileşimini saniyeler içinde kontrol et" : "Check 50,000+ drug-herb interactions in seconds", href: "/interaction-checker", gradient: "from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20", border: "border-red-100 dark:border-red-900/30" },
            { emoji: "🩸", title: isTr ? "AI Laboratuvar Analizi" : "AI Lab Analysis", desc: isTr ? "Kan tahlili PDF'ini yükle, anında görsel sağlık haritası al" : "Upload your blood test PDF, get instant visual health map", href: "/blood-test", gradient: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20", border: "border-rose-100 dark:border-rose-900/30" },
            { emoji: "🌿", title: isTr ? "Fitoterapi Protokolleri" : "Phytotherapy Protocols", desc: isTr ? "PubMed alıntılı kanıta dayalı bitkisel tıp" : "Evidence-based herbal medicine with PubMed citations", href: "/health-assistant", gradient: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20", border: "border-emerald-100 dark:border-emerald-900/30" },
            { emoji: "👨‍⚕️", title: isTr ? "Doktor Klinik Yardımcısı" : "Doctor's Clinical Copilot", desc: isTr ? "AI destekli triyaj, reçete asistanı ve hasta analitiği" : "AI-powered triage, prescribing assistant, and patient analytics", href: "/doctor-panel", gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20", border: "border-blue-100 dark:border-blue-900/30" },
          ].map((f) => (
            <Link key={f.href} href={f.href}
              className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-6 transition-all hover:shadow-soft-lg hover:-translate-y-0.5`}>
              <span className="text-3xl block mb-3">{f.emoji}</span>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="mt-10 flex justify-center gap-8 sm:gap-12 flex-wrap">
          {[
            { num: "166+", label: isTr ? "Sağlık Aracı" : "Health Tools" },
            { num: "330+", label: isTr ? "Sayfa" : "Pages" },
            { num: "75+", label: isTr ? "AI Destekli Rota" : "AI-Powered Routes" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{s.num}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-4 mb-10 rounded-2xl bg-gradient-to-r from-primary/10 to-teal-500/10 p-8 text-center border border-primary/10 md:mx-auto md:max-w-4xl">
        <h2 className="font-heading text-xl font-semibold sm:text-2xl">
          {isTr ? "Sağlık Yolculuğuna Bugün Başla" : "Start Your Health Journey Today"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 mb-5 max-w-md mx-auto">
          {isTr ? "Ücretsiz kaydol, kredi kartı gerekmez." : "Sign up free — no credit card required."}
        </p>
        <Link href="/auth/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          {isTr ? "Ücretsiz Başla" : "Get Started Free"} <ArrowRight className="h-4 w-4" />
        </Link>
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
        name: "DoctoPal", url: "https://doctopal.com",
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
