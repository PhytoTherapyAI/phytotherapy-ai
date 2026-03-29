"use client";

import { useState } from "react";
import {
  Ear,
  Volume2,
  VolumeX,
  AlertTriangle,
  Clock,
  Shield,
  LogIn,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface NoiseLevel {
  db: number;
  source: { en: string; tr: string };
  duration: { en: string; tr: string };
  risk: "safe" | "caution" | "danger" | "extreme";
}

const NOISE_LEVELS: NoiseLevel[] = [
  { db: 30, source: { en: "Whisper, quiet library", tr: "Fisildama, sessiz kutuphane" }, duration: { en: "Unlimited — no risk", tr: "Sinirsiz — risk yok" }, risk: "safe" },
  { db: 50, source: { en: "Moderate rainfall, quiet office", tr: "Orta yagmur, sessiz ofis" }, duration: { en: "Unlimited — no risk", tr: "Sinirsiz — risk yok" }, risk: "safe" },
  { db: 60, source: { en: "Normal conversation, air conditioner", tr: "Normal konusma, klima" }, duration: { en: "Unlimited — no risk", tr: "Sinirsiz — risk yok" }, risk: "safe" },
  { db: 70, source: { en: "Vacuum cleaner, busy restaurant", tr: "Elektrik supurgesi, kalabalik restoran" }, duration: { en: "Unlimited but may cause fatigue", tr: "Sinirsiz ama yorgunluga neden olabilir" }, risk: "safe" },
  { db: 80, source: { en: "Heavy traffic, alarm clock, blender", tr: "Yogun trafik, alarm saati, blender" }, duration: { en: "Safe up to 8 hours/day", tr: "Gunde 8 saate kadar güvenli" }, risk: "caution" },
  { db: 85, source: { en: "Power tools, noisy restaurant", tr: "Elektrikli el aletleri, gurultulu restoran" }, duration: { en: "8 hours max — hearing damage starts", tr: "Max 8 saat — isitme hasari başlar" }, risk: "caution" },
  { db: 90, source: { en: "Lawn mower, motorcycle, shouting", tr: "Cim bicme makinesi, motosiklet, bagirma" }, duration: { en: "2.5 hours max", tr: "Max 2.5 saat" }, risk: "danger" },
  { db: 95, source: { en: "Subway train, electric drill", tr: "Metro treni, elektrikli matkap" }, duration: { en: "50 minutes max", tr: "Max 50 dakika" }, risk: "danger" },
  { db: 100, source: { en: "Factory, car horn at 1m", tr: "Fabrika, 1m'de araba kornasi" }, duration: { en: "15 minutes max", tr: "Max 15 dakika" }, risk: "danger" },
  { db: 105, source: { en: "Max volume earbuds, power saw", tr: "Maksimum ses kulaklik, motorlu testere" }, duration: { en: "5 minutes max", tr: "Max 5 dakika" }, risk: "extreme" },
  { db: 110, source: { en: "Rock concert, car stereo at max", tr: "Rock konseri, max araba stereo" }, duration: { en: "2 minutes — immediate risk", tr: "2 dakika — ani risk" }, risk: "extreme" },
  { db: 120, source: { en: "Ambulance siren, thunder", tr: "Ambulans sireni, gok gurultusu" }, duration: { en: "Pain threshold — seconds only", tr: "Ağrı esigi — sadece saniyeler" }, risk: "extreme" },
  { db: 140, source: { en: "Jet engine at 30m, gunshot", tr: "30m'de jet motoru, silah sesi" }, duration: { en: "Instant permanent damage", tr: "Aninda kalici hasar" }, risk: "extreme" },
];

interface EarplugType {
  type: { en: string; tr: string };
  nrr: string;
  best: { en: string; tr: string };
  pros: { en: string; tr: string };
  cons: { en: string; tr: string };
}

const EARPLUG_GUIDE: EarplugType[] = [
  {
    type: { en: "Foam earplugs", tr: "Kopuk kulak tıkaclari" },
    nrr: "25-33 dB",
    best: { en: "Sleeping, loud work environments, concerts", tr: "Uyku, gurultulu çalışma ortamlari, konserler" },
    pros: { en: "Cheapest, highest NRR, disposable", tr: "En ucuz, en yüksek NRR, tek kullanimlik" },
    cons: { en: "Muffles all frequencies equally, uncomfortable long-term", tr: "Tum frekanslari esit olarak bastırır, uzun sureli rahatsiz" },
  },
  {
    type: { en: "Silicone earplugs", tr: "Silikon kulak tıkaclari" },
    nrr: "22-28 dB",
    best: { en: "Swimming, sleeping, general noise", tr: "Yuzme, uyku, genel gurultu" },
    pros: { en: "Reusable, waterproof, comfortable", tr: "Tekrar kullanilabilir, su gecirmez, rahat" },
    cons: { en: "Lower NRR than foam", tr: "Kopuktan düşük NRR" },
  },
  {
    type: { en: "Musician's earplugs (flat-response)", tr: "Muzisyen kulak tıkaclari (duz-yanit)" },
    nrr: "12-20 dB",
    best: { en: "Concerts, music practice, DJing", tr: "Konserler, muzik provasi, DJlik" },
    pros: { en: "Reduces volume evenly, preserves sound quality", tr: "Sesi esit olarak azaltir, ses kalitesini korur" },
    cons: { en: "More expensive ($15-30), lower NRR", tr: "Daha pahali, düşük NRR" },
  },
  {
    type: { en: "Custom-molded earplugs", tr: "Özel kaliplanmis kulak tıkaclari" },
    nrr: "25-30 dB",
    best: { en: "Professional musicians, industrial workers, chronic noise exposure", tr: "Profesyonel muzisyenler, endustri calisanlari, kronik gurultu maruziyeti" },
    pros: { en: "Perfect fit, most comfortable, durable years", tr: "Mukemmel uyum, en rahat, yillarca dayanikli" },
    cons: { en: "Expensive ($100-200), requires audiologist fitting", tr: "Pahali ($100-200), odyolog tarafindan takma gerektirir" },
  },
];

const TINNITUS_INFO = {
  en: [
    "Tinnitus (ringing/buzzing in ears) affects 15-20% of people and is strongly correlated with noise exposure history.",
    "Even a single exposure to 100+ dB can trigger permanent tinnitus. The damage is cumulative and irreversible.",
    "If you experience ringing after loud events: it is a warning sign that hair cells were damaged.",
    "No cure exists for noise-induced tinnitus — only management strategies (white noise, CBT, hearing aids).",
    "The 60/60 rule for earbuds: max 60% volume for max 60 minutes, then take a break.",
  ],
  tr: [
    "Tinitus (kulaklarda cilinlama/vizildama) insanlarin %15-20'sini etkiler ve gurultu maruziyeti geçmişiyle guclu bir iliskisi vardir.",
    "100+ dB'ye tek bir maruziyet bile kalici tinitusa yol acabilir. Hasar kumulatif ve geri donusuzdur.",
    "Gurultulu etkinliklerden sonra cinlama yasiyorsaniz: tuy hucrelerin hasar gordugune dair bir uyarı isaretiidr.",
    "Gurultunun neden olduğu tinitus için tedavi yoktur — sadece yonetim stratejileri (beyaz gurultu, BDT, isitme cihazlari).",
    "Kulakliklar için 60/60 kurali: max %60 ses, max 60 dakika, sonra mola verin.",
  ],
};

export default function NoiseExposurePage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("noise.title", lang)}</h1>
          <p className="text-muted-foreground">{tx("common.loginToUse", lang)}</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            <LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}
          </Button>
        </div>
      </div>
    );
  }

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case "safe": return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
      case "caution": return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20";
      case "danger": return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20";
      case "extreme": return "border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20";
      default: return "";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "safe": return { en: "Safe", tr: "Güvenli", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      case "caution": return { en: "Caution", tr: "Dikkat", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "danger": return { en: "Danger", tr: "Tehlike", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
      case "extreme": return { en: "Extreme", tr: "Asiri Tehlike", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" };
      default: return { en: "", tr: "", cls: "" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Ear className="w-4 h-4" />
            {tx("noise.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("noise.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("noise.subtitle", lang)}</p>
        </div>

        {/* 85dB Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-6 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-amber-700 dark:text-amber-400">
            {tx("noise.damageThreshold", lang)}
          </h3>
          <p className="text-sm text-amber-600 dark:text-amber-300">
            {tx("noise.damageDesc", lang)}
          </p>
        </div>

        {/* dB Reference Chart */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-500" />
            {tx("noise.decibelChart", lang)}
          </h2>
          <div className="grid gap-3">
            {NOISE_LEVELS.map((level) => {
              const riskInfo = getRiskLabel(level.risk);
              return (
                <div key={level.db} className={`border rounded-xl p-4 ${getRiskStyle(level.risk)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-foreground">{level.db}</span>
                      <span className="text-xs text-muted-foreground">dB</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskInfo.cls}`}>
                      {riskInfo[lang]}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{level.source[lang]}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {level.duration[lang]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Earplug Guide */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            {tx("noise.earplugGuide", lang)}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {EARPLUG_GUIDE.map((plug, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-2">
                <h3 className="font-semibold">{plug.type[lang]}</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">NRR: {plug.nrr}</p>
                <p className="text-sm"><span className="font-medium">{tx("noise.bestFor", lang)}</span> {plug.best[lang]}</p>
                <p className="text-xs text-green-600 dark:text-green-400">+ {plug.pros[lang]}</p>
                <p className="text-xs text-red-600 dark:text-red-400">- {plug.cons[lang]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tinnitus Info */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <VolumeX className="w-5 h-5 text-rose-500" />
            {tx("noise.tinnitusTitle", lang)}
          </h2>
          <div className="space-y-3">
            {TINNITUS_INFO[lang].map((info, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Info className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{info}</p>
              </div>
            ))}
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {tx("noise.hearingTestReminder", lang)}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
