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

function useTranslations() {
  const { lang } = useLang();
  const en = lang === "en";

  return {
    heroHeading1: en ? "Science meets" : "Bilim ile",
    heroHeadingItalic: en ? "nature\u2019s" : "doğanın şifası",
    heroHeadingEnd: en ? "healing" : "buluşuyor",
    heroDescription: en
      ? "The world\u2019s first evidence-based integrative health assistant. Cross-check medications, interpret blood tests, and discover safe phytotherapy \u2014 backed by peer-reviewed research."
      : "Dünyanın ilk kanıta dayalı bütünleştirici sağlık asistanı \u2014 ilaç etkileşimlerini kontrol edin, kan tahlillerinizi yorumlayın ve bilimsel kaynaklara dayalı güvenli fitoterapi önerileri alın.",
    searchPlaceholder: en
      ? "Enter a drug or health question..."
      : "İlaç adı veya sağlık sorunuzu yazın...",
    searchButton: en ? "Check Now" : "Sorgula",
    quickTags: en
      ? [
          { label: "Medication interactions", href: "/interaction-checker" },
          { label: "Omega-3 & inflammation", href: "/health-assistant" },
          { label: "Valerian & sleep", href: "/health-assistant" },
          { label: "Herbal & sedatives", href: "/interaction-checker" },
        ]
      : [
          { label: "İlaç etkileşimleri", href: "/interaction-checker" },
          { label: "Omega-3 ve iltihap", href: "/health-assistant" },
          { label: "Kediotu ve uyku", href: "/health-assistant" },
          { label: "Bitkisel ve sakinleştiriciler", href: "/interaction-checker" },
        ],
    trustItems: en
      ? [
          "Evidence-backed research",
          "No diagnosis — decision support",
          "Instant safety PDF export",
          "KVKK & GDPR compliant",
          "Harvard health system (CSI)",
        ]
      : [
          "Hakemli araştırmalara dayalı",
          "Teşhis değil — karar desteği",
          "Doktora hazır PDF çıktısı",
          "KVKK & GDPR uyumlu",
          "Harvard Sağlık Sistemi (CSI)",
        ],
    featureSectionTitle1: en ? "Four pillars of" : "Bütünleştirici sağlığın",
    featureSectionTitle2: en ? "integrative health" : "dört temel direği",
    features: en
      ? [
          {
            num: "01",
            href: "/interaction-checker",
            icon: Shield,
            title: "Drug-Herb Interaction Engine",
            description:
              "Resolves your meds via OpenFDA and lets you know which herbs are safe, risky, or dangerous — all citing PubMed.",
          },
          {
            num: "02",
            href: "/health-assistant",
            icon: FlaskConical,
            title: "Evidence-Based Assistant",
            description:
              "Answers grounded answers (LMG) with database citations, dosing protocols, — no guessing, no hallucinations. Everyday.",
          },
          {
            num: "03",
            href: "/blood-test",
            icon: FileText,
            title: "Blood Test Analysis",
            description:
              "Upload your test results and get personalized lifestyle + supplement plans — with your doctor-ready PDF. Exportable.",
          },
          {
            num: "04",
            href: "/interaction-checker",
            icon: ShieldCheck,
            title: "Three-Layer Safety",
            description:
              "Emergency detection — drug screening — AI guardrails. Three layers, real-time, trust-first.",
          },
        ]
      : [
          {
            num: "01",
            href: "/interaction-checker",
            icon: Shield,
            title: "İlaç–Bitki Etkileşim Motoru",
            description:
              "İlaçlarınız OpenFDA aracılığıyla çözümlenir; hangi bitkilerin güvenli, riskli ya da tehlikeli olduğu PubMed kaynaklarıyla gösterilir.",
          },
          {
            num: "02",
            href: "/health-assistant",
            icon: FlaskConical,
            title: "Kanıta Dayalı Sağlık Asistanı",
            description:
              "Her yanıt PubMed veritabanına ve doz protokollerine dayanır — tahmin yok, uydurma yok. Günlük kullanıma uygun.",
          },
          {
            num: "03",
            href: "/blood-test",
            icon: FileText,
            title: "Kan Tahlili Analizi",
            description:
              "Tahlil sonuçlarınızı yükleyin; kişiselleştirilmiş yaşam tarzı ve takviye önerileri ile doktorunuza hazır PDF alın.",
          },
          {
            num: "04",
            href: "/interaction-checker",
            icon: ShieldCheck,
            title: "Üç Katmanlı Güvenlik",
            description:
              "Acil durum tespiti, ilaç taraması ve yapay zeka güvenlik katmanları — üç aşama, gerçek zamanlı, güven öncelikli.",
          },
        ],
    explore: en ? "Explore" : "Keşfet",
  };
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations();

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
              {t.heroHeading1}{" "}
              <br className="hidden sm:block" />
              <em className="font-heading" style={{ fontStyle: "italic", color: "var(--gold)" }}>
                {t.heroHeadingItalic}
              </em>{" "}
              <span className="text-primary">{t.heroHeadingEnd}</span>
            </h1>

            <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
              {t.heroDescription}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t.searchButton}
              </button>
            </form>

            {/* Quick tags */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {t.quickTags.map((tag) => (
                <Link
                  key={tag.label}
                  href={tag.href}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {tag.label}
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
          {t.trustItems.map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.featureSectionTitle1}{" "}
            <em className="font-heading" style={{ fontStyle: "italic" }}>
              {t.featureSectionTitle2}
            </em>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.features.map((feature) => (
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
                  {feature.title}
                </span>
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {t.explore} <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
