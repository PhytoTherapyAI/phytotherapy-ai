"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  CalendarPlus,
  Copy,
  Check,
  Trash2,
  ArrowLeft,
  Leaf,
  Scale,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface FavoriteSupplement {
  id: string;
  name: string;
  addedAt: string;
}

// Minimal data lookup for display (matches marketplace IDs)
const SUPPLEMENT_INFO: Record<string, { uses: { en: string; tr: string }; evidenceGrade: string }> = {
  "omega-3": { uses: { en: "Heart health, triglycerides", tr: "Kalp sagligi, trigliserit" }, evidenceGrade: "A" },
  "vitamin-d3": { uses: { en: "Bone health, immune support", tr: "Kemik sagligi, bagisiklik" }, evidenceGrade: "A" },
  "magnesium": { uses: { en: "Sleep, muscle cramps, stress", tr: "Uyku, kas kramplari, stres" }, evidenceGrade: "A" },
  "ashwagandha": { uses: { en: "Stress, anxiety, cortisol", tr: "Stres, anksiyete, kortizol" }, evidenceGrade: "A" },
  "probiotics": { uses: { en: "Gut health, digestion", tr: "Bagirsak sagligi, sindirim" }, evidenceGrade: "A" },
  "vitamin-b12": { uses: { en: "Energy, nerve function", tr: "Enerji, sinir fonksiyonu" }, evidenceGrade: "A" },
  "iron-bisglycinate": { uses: { en: "Anemia, fatigue", tr: "Anemi, yorgunluk" }, evidenceGrade: "A" },
  "zinc": { uses: { en: "Immune support, skin", tr: "Bagisiklik, cilt" }, evidenceGrade: "A" },
  "curcumin": { uses: { en: "Inflammation, joint pain", tr: "Enflamasyon, eklem agrisi" }, evidenceGrade: "B" },
  "coq10": { uses: { en: "Heart health, energy", tr: "Kalp sagligi, enerji" }, evidenceGrade: "B" },
  "melatonin": { uses: { en: "Sleep onset, jet lag", tr: "Uyku baslangici, jet lag" }, evidenceGrade: "A" },
  "valerian": { uses: { en: "Sleep quality, relaxation", tr: "Uyku kalitesi, rahatlama" }, evidenceGrade: "B" },
  "berberine": { uses: { en: "Blood sugar, cholesterol", tr: "Kan sekeri, kolesterol" }, evidenceGrade: "A" },
  "quercetin": { uses: { en: "Allergies, antioxidant", tr: "Alerjiler, antioksidan" }, evidenceGrade: "B" },
  "vitamin-c": { uses: { en: "Immune support, collagen", tr: "Bagisiklik, kolajen" }, evidenceGrade: "A" },
};

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  B: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  C: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
};

function formatName(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FavoriteSupplementsPage() {
  const { lang } = useLang();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("supplement-favorites") || "[]");
      setFavorites(stored);
    } catch {
      setFavorites([]);
    }
  }, []);

  const removeFavorite = (id: string) => {
    const next = favorites.filter((f) => f !== id);
    setFavorites(next);
    localStorage.setItem("supplement-favorites", JSON.stringify(next));
    setCompareSelection((prev) => prev.filter((c) => c !== id));
  };

  const toggleCompare = (id: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const copyShoppingList = () => {
    const list = favorites.map((id) => `- ${formatName(id)}`).join("\n");
    const header = lang === "tr" ? "Takviye Alisveris Listem:" : "My Supplement Shopping List:";
    navigator.clipboard.writeText(`${header}\n${list}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const compareItems = useMemo(() => {
    if (compareSelection.length !== 2) return null;
    return compareSelection.map((id) => ({
      id,
      name: formatName(id),
      info: SUPPLEMENT_INFO[id],
    }));
  }, [compareSelection]);

  // Empty state
  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === "tr" ? "Henuz Favori Yok" : "No Favorites Yet"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {lang === "tr"
              ? "Takviye Rehberi'ne goz atin ve favorilerinizi ekleyin!"
              : "Browse the Supplement Guide and add your favorites!"}
          </p>
          <Link href="/supplement-marketplace">
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">
              <Leaf className="w-4 h-4" />
              {lang === "tr" ? "Takviye Rehberine Git" : "Browse Supplement Guide"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/supplement-marketplace">
            <Button variant="ghost" size="sm" className="gap-1 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
              {lang === "tr" ? "Rehber" : "Guide"}
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {lang === "tr" ? "Favori Takviyelerim" : "My Favorite Supplements"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lang === "tr" ? `${favorites.length} takviye kaydedildi` : `${favorites.length} supplement${favorites.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
        </div>

        {/* Interaction Reminder */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-6 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {lang === "tr"
              ? "Herhangi bir takviyeye baslamadan once etkilesim kontrolu yapin ve doktorunuza danisin."
              : "Always check interactions and consult your doctor before starting any supplement."}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={copyShoppingList}
            className="gap-1.5 rounded-lg text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied
              ? (lang === "tr" ? "Kopyalandi!" : "Copied!")
              : (lang === "tr" ? "Alisveris Listesi Kopyala" : "Copy Shopping List")}
          </Button>
          <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
            {lang === "tr"
              ? "Karşılastirmak icin 2 takviye secin"
              : "Select 2 supplements to compare"}
          </span>
        </div>

        {/* Favorites List */}
        <div className="space-y-3 mb-8">
          {favorites.map((id) => {
            const info = SUPPLEMENT_INFO[id];
            const isCompareSelected = compareSelection.includes(id);

            return (
              <div
                key={id}
                className={`bg-white dark:bg-gray-800 rounded-xl border p-4 transition-all ${
                  isCompareSelected
                    ? "border-green-400 dark:border-green-600 ring-1 ring-green-400/30"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Compare Checkbox */}
                  <button
                    onClick={() => toggleCompare(id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isCompareSelected
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isCompareSelected && <Check className="w-3 h-3" />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {formatName(id)}
                      </h3>
                      {info && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${GRADE_COLORS[info.evidenceGrade]}`}>
                          {info.evidenceGrade}
                        </span>
                      )}
                    </div>
                    {info && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {lang === "tr" ? info.uses.tr : info.uses.en}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link href={`/interaction-checker?supplement=${encodeURIComponent(formatName(id))}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" title={lang === "tr" ? "Etkileşim Kontrol" : "Check Interactions"}>
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                      </Button>
                    </Link>
                    <Link href="/calendar">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" title={lang === "tr" ? "Takvime Ekle" : "Add to Calendar"}>
                        <CalendarPlus className="w-4 h-4 text-green-500" />
                      </Button>
                    </Link>
                    <button
                      onClick={() => removeFavorite(id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title={lang === "tr" ? "Kaldir" : "Remove"}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare Panel */}
        {compareItems && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {lang === "tr" ? "Karşılastirma" : "Quick Compare"}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {compareItems.map((item) => (
                <div key={item.id} className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</h3>
                  {item.info ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {lang === "tr" ? "Kanit:" : "Evidence:"}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${GRADE_COLORS[item.info.evidenceGrade]}`}>
                          {item.info.evidenceGrade}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {lang === "tr" ? item.info.uses.tr : item.info.uses.en}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">{lang === "tr" ? "Bilgi yok" : "No info available"}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Link href={`/supplement-compare?s1=${encodeURIComponent(compareItems[0].name)}&s2=${encodeURIComponent(compareItems[1].name)}`}>
                <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs">
                  <Scale className="w-3.5 h-3.5" />
                  {lang === "tr" ? "Detayli AI Karşılastirma" : "Detailed AI Compare"}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
