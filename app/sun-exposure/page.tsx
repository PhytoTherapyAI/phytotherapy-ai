"use client";

import { useState } from "react";
import {
  Sun,
  Shield,
  AlertTriangle,
  Clock,
  Droplets,
  ChevronDown,
  ChevronUp,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";

const SKIN_TYPES = [
  { type: 1, key: "sun.fitzpatrick1", baseMED: 200, burnTime: 67 },
  { type: 2, key: "sun.fitzpatrick2", baseMED: 250, burnTime: 100 },
  { type: 3, key: "sun.fitzpatrick3", baseMED: 300, burnTime: 200 },
  { type: 4, key: "sun.fitzpatrick4", baseMED: 450, burnTime: 300 },
  { type: 5, key: "sun.fitzpatrick5", baseMED: 600, burnTime: 400 },
  { type: 6, key: "sun.fitzpatrick6", baseMED: 1000, burnTime: 500 },
];

interface PhotoMed {
  name: string;
  generic: string;
  category: { en: string; tr: string };
}

const PHOTOSENSITIZING_MEDS: PhotoMed[] = [
  { name: "Doxycycline", generic: "doxycycline", category: { en: "Antibiotic", tr: "Antibiyotik" } },
  { name: "Ciprofloxacin", generic: "ciprofloxacin", category: { en: "Antibiotic", tr: "Antibiyotik" } },
  { name: "Amiodarone", generic: "amiodarone", category: { en: "Antiarrhythmic", tr: "Antiaritmik" } },
  { name: "Hydrochlorothiazide", generic: "hydrochlorothiazide", category: { en: "Diuretic", tr: "Diüretik" } },
  { name: "Naproxen", generic: "naproxen", category: { en: "NSAID", tr: "NSAİİ" } },
  { name: "Piroxicam", generic: "piroxicam", category: { en: "NSAID", tr: "NSAİİ" } },
  { name: "Isotretinoin", generic: "isotretinoin", category: { en: "Retinoid", tr: "Retinoid" } },
  { name: "Tretinoin", generic: "tretinoin", category: { en: "Retinoid", tr: "Retinoid" } },
  { name: "Methotrexate", generic: "methotrexate", category: { en: "Immunosuppressant", tr: "İmmünosüpresan" } },
  { name: "Furosemide", generic: "furosemide", category: { en: "Diuretic", tr: "Diüretik" } },
  { name: "Voriconazole", generic: "voriconazole", category: { en: "Antifungal", tr: "Antifungal" } },
  { name: "Sulfonamides", generic: "sulfamethoxazole", category: { en: "Antibiotic", tr: "Antibiyotik" } },
];

function calculateSafeTime(skinType: number, uvIndex: number): number {
  const st = SKIN_TYPES.find((s) => s.type === skinType);
  if (!st || uvIndex <= 0) return 0;
  // Safe exposure = burnTime / uvIndex * 0.67 (safety margin)
  return Math.max(5, Math.round((st.burnTime / uvIndex) * 0.67));
}

function getUVCategory(uv: number, lang: string): { label: string; color: string } {
  if (uv <= 2) return { label: lang === "tr" ? "Düşük" : "Low", color: "text-green-600 dark:text-green-400" };
  if (uv <= 5) return { label: lang === "tr" ? "Orta" : "Moderate", color: "text-amber-600 dark:text-amber-400" };
  if (uv <= 7) return { label: lang === "tr" ? "Yüksek" : "High", color: "text-orange-600 dark:text-orange-400" };
  if (uv <= 10) return { label: lang === "tr" ? "Çok Yüksek" : "Very High", color: "text-red-600 dark:text-red-400" };
  return { label: lang === "tr" ? "Aşırı" : "Extreme", color: "text-purple-600 dark:text-purple-400" };
}

export default function SunExposurePage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();
  const [skinType, setSkinType] = useState(3);
  const [uvIndex, setUvIndex] = useState(6);
  const [showSunscreen, setShowSunscreen] = useState(false);
  const [showVitD, setShowVitD] = useState(false);

  const safeMinutes = calculateSafeTime(skinType, uvIndex);
  const uvCat = getUVCategory(uvIndex, lang);

  // Note: photosensitizing medication matching done via static list display
  // Profile-level medication data is fetched separately in API routes
  const matchedPhotoMeds: PhotoMed[] = [];

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
          <Sun className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("sun.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("sun.subtitle", lang)}
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <LogIn className="mr-1 inline h-3.5 w-3.5" />
          {tx("sun.loginNote", lang)}{" "}
          <Link href="/auth/login" className="font-semibold underline">
            {tx("bt.createAccount", lang)}
          </Link>
        </div>
      )}

      {/* Photosensitizing Medication Warning */}
      {matchedPhotoMeds.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950/20">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-4 w-4" />
            {tx("sun.photosensitive", lang)}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            {tx("sun.photoMeds", lang)}
          </p>
          <div className="space-y-1">
            {matchedPhotoMeds.map((med) => (
              <div
                key={med.name}
                className="flex items-center justify-between rounded bg-red-100 px-2 py-1 dark:bg-red-900/30"
              >
                <span className="text-sm font-medium text-red-800 dark:text-red-300">
                  {med.name}
                </span>
                <span className="text-xs text-red-600 dark:text-red-400">
                  {lang === "tr" ? med.category.tr : med.category.en}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            {lang === "tr"
              ? "Bu ilaçlar güneş hassasiyetinizi artırır. Güneş korumanızı artırın ve maruziyet süresini azaltın."
              : "These medications increase your sun sensitivity. Increase sun protection and reduce exposure time."}
          </p>
        </div>
      )}

      {/* Skin Type Selector */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">
          {tx("sun.skinType", lang)}
        </label>
        <div className="space-y-1.5">
          {SKIN_TYPES.map((st) => (
            <button
              key={st.type}
              onClick={() => setSkinType(st.type)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                skinType === st.type
                  ? "border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950/20"
                  : "hover:bg-muted/50"
              }`}
            >
              <div
                className="h-6 w-6 rounded-full border"
                style={{
                  backgroundColor: [
                    "#fce4d6",
                    "#f5d5c0",
                    "#d4a574",
                    "#a67c52",
                    "#704214",
                    "#3b2006",
                  ][st.type - 1],
                }}
              />
              <span>{tx(st.key, lang)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* UV Index Slider */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          {tx("sun.uvIndex", lang)}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={12}
            value={uvIndex}
            onChange={(e) => setUvIndex(Number(e.target.value))}
            className="flex-1 accent-yellow-500"
          />
          <div className="text-center min-w-[60px]">
            <p className={`text-2xl font-bold ${uvCat.color}`}>{uvIndex}</p>
            <p className={`text-xs ${uvCat.color}`}>{uvCat.label}</p>
          </div>
        </div>
      </div>

      {/* Safe Exposure Time Result */}
      <div className="mb-6 rounded-lg border bg-card p-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          {tx("sun.safeTime", lang)}
        </h3>
        <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
          {matchedPhotoMeds.length > 0
            ? Math.round(safeMinutes * 0.5)
            : safeMinutes}
        </p>
        <p className="text-sm text-muted-foreground">
          {tx("sun.minutes", lang)}
        </p>
        {matchedPhotoMeds.length > 0 && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {lang === "tr"
              ? "Işığa duyarlı ilaç nedeniyle süre yarıya indirildi"
              : "Time halved due to photosensitizing medication"}
          </p>
        )}
      </div>

      {/* Vitamin D Info */}
      <div className="mb-4">
        <button
          onClick={() => setShowVitD(!showVitD)}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Sun className="h-4 w-4 text-yellow-500" />
            {tx("sun.vitaminD", lang)}
          </span>
          {showVitD ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showVitD && (
          <div className="mt-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            {tx("sun.vitaminDInfo", lang)}
          </div>
        )}
      </div>

      {/* Sunscreen Guide */}
      <div className="mb-4">
        <button
          onClick={() => setShowSunscreen(!showSunscreen)}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Droplets className="h-4 w-4 text-blue-500" />
            {tx("sun.sunscreenGuide", lang)}
          </span>
          {showSunscreen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showSunscreen && (
          <div className="mt-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            {tx("sun.sunscreenTip", lang)}
          </div>
        )}
      </div>

      {/* Known Photosensitizing Medications List */}
      <div className="mb-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-yellow-500" />
          {tx("sun.photosensitive", lang)}
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {PHOTOSENSITIZING_MEDS.map((med) => (
            <div
              key={med.name}
              className={`rounded px-2 py-1 text-xs ${
                matchedPhotoMeds.some((m) => m.name === med.name)
                  ? "bg-red-100 text-red-800 font-semibold dark:bg-red-900/30 dark:text-red-300"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {med.name}
              <span className="ml-1 opacity-70">
                ({lang === "tr" ? med.category.tr : med.category.en})
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
