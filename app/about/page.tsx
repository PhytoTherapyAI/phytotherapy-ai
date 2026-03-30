// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { Leaf, Users } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
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

  const values = [
    {
      icon: IconHeartPulse,
      title: "Primum non nocere",
      desc: tx("about.doNoHarm", lang),
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
    },
    {
      icon: IconResearchLeaf,
      title: tx("about.evidenceBased", lang),
      desc: tx("about.evidenceBasedDesc", lang),
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: IconVisionSparkle,
      title: tx("about.transparency", lang),
      desc: tx("about.transparencyDesc", lang),
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      icon: IconCommunityNet,
      title: tx("about.accessibility", lang),
      desc: tx("about.accessibilityDesc", lang),
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: IconPrivacyLeaf,
      title: tx("about.privacy", lang),
      desc: tx("about.privacyDesc", lang),
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    },
  ];

  const stats = [
    { value: "85+", label: tx("about.healthTools", lang), icon: IconResearchLeaf },
    { value: "1000+", label: tx("about.translationKeys", lang), icon: IconGrowthChart },
    { value: "60+", label: tx("about.apiEndpoints", lang), icon: IconMissionTarget },
    { value: tx("about.multi", lang), label: tx("about.researchSources", lang), icon: IconMedicalBotanical },
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
            {tx("about.heroDesc", lang)}
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
          {tx("about.coreValues", lang)}
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
          {tx("about.ourTeam", lang)}
        </h2>
        <p className="mx-auto max-w-lg text-muted-foreground">
          {tx("about.teamDesc", lang)}
        </p>
      </div>

      {/* Vision & Mission — corporate, lower priority */}
      <div className="mb-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-gradient-to-br from-purple-50/50 to-background p-6 md:p-8 dark:from-purple-950/10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5 dark:bg-purple-900/30">
              <IconVisionSparkle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">{tx("about.ourVision", lang)}</h2>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            {tx("about.visionDesc", lang)}
          </p>
        </div>
        <div className="rounded-2xl border bg-gradient-to-br from-amber-50/50 to-background p-6 md:p-8 dark:from-amber-950/10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-900/30">
              <IconMissionTarget className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">{tx("about.ourMission", lang)}</h2>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            {tx("about.missionDesc", lang)}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border bg-muted/10 p-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <IconPreventionShield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-sm text-muted-foreground">
          {tx("about.disclaimer", lang)}
        </p>
      </div>
    </div>
  );
}
