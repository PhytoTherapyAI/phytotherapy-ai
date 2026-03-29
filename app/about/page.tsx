"use client";

import { Leaf, Users } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import {
  IconHeartPulse,
  IconResearchLeaf,
  IconVisionSparkle,
  IconCommunityNet,
  IconPrivacyLeaf,
  IconMissionTarget,
  IconGrowthChart,
  IconMedicalBotanical,
  IconPreventionShield,
} from "@/components/icons/PhytoIcons";

export default function AboutPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";

  const values = [
    {
      icon: IconHeartPulse,
      title: isTr ? "Primum non nocere" : "Primum non nocere",
      desc: isTr ? "Her zaman \u00F6nce zarar verme" : "First, do no harm",
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
    },
    {
      icon: IconResearchLeaf,
      title: isTr ? "Kan\u0131ta Dayal\u0131" : "Evidence-based",
      desc: isTr
        ? "Yaln\u0131zca PubMed, NIH, WHO kaynakl\u0131"
        : "Only PubMed, NIH, WHO sourced",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: IconVisionSparkle,
      title: isTr ? "\u015Eeffafl\u0131k" : "Transparency",
      desc: isTr
        ? "Her \u00F6neri makale referans\u0131yla gelir"
        : "Every recommendation with sources",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      icon: IconCommunityNet,
      title: isTr ? "Eri\u015Filebilirlik" : "Accessibility",
      desc: isTr
        ? "Herkes i\u00E7in sa\u011Fl\u0131k rehberli\u011Fi"
        : "Health guidance for everyone",
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: IconPrivacyLeaf,
      title: isTr ? "Gizlilik" : "Privacy",
      desc: isTr
        ? "Verileriniz her zaman sizindir"
        : "Your data is yours, always",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    },
  ];

  const stats = [
    { value: "85+", label: isTr ? "Sağlık Aracı" : "Health Tools", icon: IconResearchLeaf },
    { value: "1000+", label: isTr ? "Çeviri Anahtarı (TR/EN)" : "Translation Keys (TR/EN)", icon: IconGrowthChart },
    { value: "60+", label: isTr ? "API Endpoint" : "API Endpoints", icon: IconMissionTarget },
    { value: isTr ? "Çoklu" : "Multi", label: isTr ? "Akademik Kaynak" : "Research Sources", icon: IconMedicalBotanical },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
      {/* Hero Section */}
      <div className="relative mb-16 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-amber-50/50 to-green-50/50 p-8 md:p-12 dark:from-primary/5 dark:via-amber-950/20 dark:to-green-950/20">
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl md:text-5xl">
            Phyto<span style={{ color: "var(--logo-accent, #c4a86c)" }}>therapy</span>
            <span className="text-primary">.ai</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            {isTr
              ? "Kan\u0131ta dayal\u0131 b\u00FCt\u00FCnle\u015Ftirici t\u0131p asistan\u0131 \u2014 modern t\u0131p ile bitkisel terapiyi g\u00FCvenle birle\u015Ftiren platform."
              : "Evidence-based integrative medicine assistant \u2014 safely bridging modern medicine and herbal therapy."}
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-amber-200/20 dark:bg-amber-800/10" />
      </div>

      {/* Stats Strip — what we offer (user cares about this first) */}
      <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border bg-muted/20 p-5 text-center transition-shadow hover:shadow-md"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Core Values */}
      <div className="mb-16">
        <h2 className="mb-6 text-center text-2xl font-bold">
          {isTr ? "Temel De\u011Ferlerimiz" : "Core Values"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((v, i) => (
            <div
              key={i}
              className={`rounded-xl border p-5 text-center transition-shadow hover:shadow-md ${v.bg}`}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
                <v.icon className={`h-5 w-5 ${v.color}`} />
              </div>
              <h3 className="mb-1 text-sm font-bold">{v.title}</h3>
              <p className="text-xs text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16 rounded-2xl border bg-gradient-to-br from-green-50/50 to-background p-8 text-center dark:from-green-950/10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="mb-3 text-xl font-bold">
          {isTr ? "Ekibimiz" : "Our Team"}
        </h2>
        <p className="mx-auto max-w-lg text-muted-foreground">
          {isTr
            ? "Harvard '\u0130Building High-Value Health Systems\u2019 hackathon'unda 3 t\u0131p \u00F6\u011Frencisi taraf\u0131ndan kurulan, yapay zeka ile g\u00FC\u00E7lendirilmi\u015F bir platform."
            : "Founded by 3 medical students at Harvard's 'Building High-Value Health Systems' hackathon, powered by AI."}
        </p>
      </div>

      {/* Vision & Mission — corporate, lower priority */}
      <div className="mb-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-gradient-to-br from-purple-50/50 to-background p-6 md:p-8 dark:from-purple-950/10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5 dark:bg-purple-900/30">
              <IconVisionSparkle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">{isTr ? "Vizyonumuz" : "Our Vision"}</h2>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            {isTr
              ? "Dünyanın ilk Kanıta Dayalı Bütünleştirici Tıp Asistanı olmak — modern tıp, bitkisel terapi ve kişisel sağlık profillerini hem hastalara hem doktorlara hizmet eden tek bir güvenilir platformda birleştirmek."
              : "To be the world's first Evidence-Based Integrative Medicine Assistant — bridging modern medicine, herbal therapy, and personal health profiles into a single trusted platform that serves both patients and doctors."}
          </p>
        </div>
        <div className="rounded-2xl border bg-gradient-to-br from-amber-50/50 to-background p-6 md:p-8 dark:from-amber-950/10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-900/30">
              <IconMissionTarget className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">{isTr ? "Misyonumuz" : "Our Mission"}</h2>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            {isTr
              ? "Yapay zeka destekli analizi hakemli bilimsel kanıtlarla birleştirerek sağlık bilgisini demokratikleştirmek, kişiselleştirilmiş sağlık rehberliğini tıbbi okuryazarlık veya ekonomik durumdan bağımsız olarak herkes için erişilebilir, güvenli ve şeffaf kılmak."
              : "To democratize health knowledge by combining AI-powered analysis with peer-reviewed scientific evidence, making personalized health guidance accessible, safe, and transparent for everyone — regardless of medical literacy or economic status."}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border bg-muted/10 p-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <IconPreventionShield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-sm text-muted-foreground">
          {isTr
            ? "Phytotherapy.ai bir e\u011Fitim ama\u00E7l\u0131 sa\u011Fl\u0131k arac\u0131d\u0131r; t\u0131bbi te\u015Fhis veya tedavi sunmaz. T\u00FCm \u00F6neriler yay\u0131mlanm\u0131\u015F bilimsel ara\u015Ft\u0131rmalara dayan\u0131r. Her zaman sa\u011Fl\u0131k profesyonelinize dan\u0131\u015F\u0131n."
            : "Phytotherapy.ai is an educational wellness tool and does not provide medical diagnosis or treatment. All recommendations are based on published scientific research. Always consult your healthcare provider."}
        </p>
      </div>
    </div>
  );
}
