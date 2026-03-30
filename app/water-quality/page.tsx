"use client";

import { useState } from "react";
import {
  Droplets,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Info,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface CityWater {
  name: { en: string; tr: string };
  source: { en: string; tr: string };
  calcium: number;
  magnesium: number;
  sodium: number;
  potassium: number;
  chloride: number;
  hardness: number;
  ph: number;
  tds: number;
}

const CITIES: CityWater[] = [
  {
    name: { en: "Istanbul", tr: "İstanbul" },
    source: { en: "Terkos & Omerli Reservoirs", tr: "Terkos & Ömerli Barajları" },
    calcium: 45, magnesium: 12, sodium: 18, potassium: 2.1, chloride: 25, hardness: 165, ph: 7.4, tds: 180,
  },
  {
    name: { en: "Ankara", tr: "Ankara" },
    source: { en: "Catalan & Kurtbogazi Dams", tr: "Çatalan & Kurtboğazı Barajları" },
    calcium: 68, magnesium: 18, sodium: 12, potassium: 1.8, chloride: 15, hardness: 245, ph: 7.6, tds: 260,
  },
  {
    name: { en: "Izmir", tr: "İzmir" },
    source: { en: "Tahtalı & Gordes Dams", tr: "Tahtalı & Gördes Barajları" },
    calcium: 55, magnesium: 15, sodium: 22, potassium: 2.5, chloride: 30, hardness: 200, ph: 7.3, tds: 220,
  },
  {
    name: { en: "Bursa", tr: "Bursa" },
    source: { en: "Doğancı & Nilüfer Dams", tr: "Doğancı & Nilüfer Barajları" },
    calcium: 72, magnesium: 20, sodium: 10, potassium: 1.5, chloride: 12, hardness: 260, ph: 7.5, tds: 275,
  },
  {
    name: { en: "Antalya", tr: "Antalya" },
    source: { en: "Underground Springs", tr: "Yeraltı Kaynakları" },
    calcium: 85, magnesium: 25, sodium: 8, potassium: 1.2, chloride: 10, hardness: 310, ph: 7.7, tds: 320,
  },
  {
    name: { en: "Adana", tr: "Adana" },
    source: { en: "Catalan Dam", tr: "Çatalan Barajı" },
    calcium: 50, magnesium: 14, sodium: 15, potassium: 2.0, chloride: 20, hardness: 185, ph: 7.4, tds: 200,
  },
  {
    name: { en: "Konya", tr: "Konya" },
    source: { en: "Altınapa Dam & Wells", tr: "Altınapa Barajı & Kuyular" },
    calcium: 95, magnesium: 30, sodium: 25, potassium: 3.0, chloride: 35, hardness: 355, ph: 7.8, tds: 380,
  },
  {
    name: { en: "Gaziantep", tr: "Gaziantep" },
    source: { en: "Birecik Dam", tr: "Birecik Barajı" },
    calcium: 60, magnesium: 16, sodium: 20, potassium: 2.3, chloride: 28, hardness: 215, ph: 7.5, tds: 230,
  },
  {
    name: { en: "Trabzon", tr: "Trabzon" },
    source: { en: "Atasu & Mountain Springs", tr: "Atasu & Dağ Kaynakları" },
    calcium: 30, magnesium: 8, sodium: 6, potassium: 1.0, chloride: 8, hardness: 110, ph: 7.2, tds: 120,
  },
  {
    name: { en: "Eskisehir", tr: "Eskişehir" },
    source: { en: "Porsuk Dam", tr: "Porsuk Barajı" },
    calcium: 62, magnesium: 17, sodium: 14, potassium: 1.9, chloride: 18, hardness: 225, ph: 7.5, tds: 240,
  },
];

function getHardnessLabel(hardness: number, lang: string): string {
  if (hardness < 120) return tx("water.soft", lang as "en" | "tr");
  if (hardness < 180) return tx("water.moderatelyHard", lang as "en" | "tr");
  if (hardness < 300) return tx("water.hard", lang as "en" | "tr");
  return tx("water.veryHard", lang as "en" | "tr");
}

function getHardnessColor(hardness: number): string {
  if (hardness < 120) return "text-green-600 dark:text-green-400";
  if (hardness < 180) return "text-blue-600 dark:text-blue-400";
  if (hardness < 300) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export default function WaterQualityPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [showTips, setShowTips] = useState(false);

  const city = CITIES.find(
    (c) => c.name.en === selectedCity || c.name.tr === selectedCity
  );

  const hasKidneyDisease = profile?.kidney_disease === true;

  const kidneyWarnings: string[] = [];
  if (city && hasKidneyDisease) {
    if (city.sodium > 20)
      kidneyWarnings.push(tx("water.kidneyHighSodium", lang));
    if (city.calcium > 80)
      kidneyWarnings.push(tx("water.kidneyHighCalcium", lang));
    if (city.potassium > 2.5)
      kidneyWarnings.push(tx("water.kidneyHighPotassium", lang));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-950">
          <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("water.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("water.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Kidney disease banner */}
      {hasKidneyDisease && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50/50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
          <Shield className="mr-1 inline h-3.5 w-3.5" />
          {tx("water.kidneyNote", lang)}
        </div>
      )}

      {/* City Selector */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          {tx("water.selectCity", lang)}
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        >
          <option value="">{tx("water.selectCity", lang)}</option>
          {CITIES.map((c) => (
            <option key={c.name.en} value={c.name.en}>
              {c.name[lang as "en" | "tr"]}
            </option>
          ))}
        </select>
      </div>

      {/* City Water Info */}
      {city && (
        <div className="space-y-4">
          {/* Source */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {tx("water.source", lang)}
            </p>
            <p className="text-sm font-medium">
              {city.source[lang as "en" | "tr"]}
            </p>
          </div>

          {/* Mineral Table */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">
              {tx("water.minerals", lang)}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "water.calcium", value: city.calcium, warn: city.calcium > 80 },
                { key: "water.magnesium", value: city.magnesium, warn: false },
                { key: "water.sodium", value: city.sodium, warn: city.sodium > 20 },
                { key: "water.potassium", value: city.potassium, warn: city.potassium > 2.5 },
                { key: "water.chloride", value: city.chloride, warn: false },
                { key: "water.tds", value: city.tds, warn: false },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`rounded-lg border p-3 ${
                    hasKidneyDisease && item.warn
                      ? "border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-950/20"
                      : "bg-muted/30"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">
                    {tx(item.key, lang)}
                  </p>
                  <p className="text-lg font-bold">
                    {item.value}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {tx("water.unit", lang)}
                    </span>
                  </p>
                  {hasKidneyDisease && item.warn && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="mr-0.5 inline h-3 w-3" />
                      {tx("common.caution", lang)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* pH & Hardness */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  {tx("water.ph", lang)}
                </p>
                <p className="text-lg font-bold">{city.ph}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  {tx("water.hardness", lang)}
                </p>
                <p className={`text-lg font-bold ${getHardnessColor(city.hardness)}`}>
                  {city.hardness} {tx("water.unit", lang)}
                </p>
                <p className={`text-xs ${getHardnessColor(city.hardness)}`}>
                  {getHardnessLabel(city.hardness, lang)}
                </p>
              </div>
            </div>
          </div>

          {/* Kidney Warnings */}
          {kidneyWarnings.length > 0 && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950/20">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                {tx("water.kidneyWarning", lang)}
              </h3>
              <ul className="space-y-1.5">
                {kidneyWarnings.map((w, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-300">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* General Tip */}
      <div className="mt-6">
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            {tx("water.generalTip", lang)}
          </span>
          {showTips ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {showTips && (
          <div className="mt-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            {tx("water.generalTipText", lang)}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
