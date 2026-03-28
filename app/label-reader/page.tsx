"use client";

import { useState } from "react";
import { ScanLine, Loader2, CheckCircle2, AlertTriangle, XCircle, Wheat, Milk, Leaf, Flame, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface LabelResult {
  overallScore: number;
  scoreLabel: string;
  hiddenSugars: string[];
  sodiumWarning: string | null;
  allergens: string[];
  additives: Array<{ name: string; code: string; concern: string; note: string }>;
  dietCompatibility: Record<string, boolean>;
  positives: string[];
  concerns: string[];
  recommendations: string;
}

const dietLabels: Record<string, { en: string; tr: string; icon: React.ElementType }> = {
  glutenFree: { en: "Gluten-Free", tr: "Glutensiz", icon: Wheat },
  dairyFree: { en: "Dairy-Free", tr: "Sutsuz", icon: Milk },
  veganFriendly: { en: "Vegan", tr: "Vegan", icon: Leaf },
  ketoFriendly: { en: "Keto", tr: "Keto", icon: Flame },
  fodmapSafe: { en: "Low FODMAP", tr: "Dusuk FODMAP", icon: Apple },
};

export default function LabelReaderPage() {
  const { lang } = useLang();
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LabelResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!ingredients.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/label-reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: productName.trim(), ingredients: ingredients.trim(), lang }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const scoreColor = (s: number) => {
    if (s >= 8) return "text-green-600 border-green-500";
    if (s >= 5) return "text-amber-600 border-amber-500";
    return "text-red-600 border-red-500";
  };

  const concernColor = (c: string) => {
    if (c === "high") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (c === "moderate") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <ScanLine className="w-10 h-10 text-orange-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("label.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("label.subtitle", lang)}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tx("label.productName", lang)}</label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tx("label.ingredients", lang)} *</label>
            <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={4} placeholder={tx("label.ingredients", lang)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
          </div>
          <Button onClick={handleAnalyze} disabled={isLoading || !ingredients.trim()} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanLine className="w-4 h-4 mr-2" />}
            {isLoading ? tx("tool.loading", lang) : tx("label.analyze", lang)}
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${scoreColor(result.overallScore)} mb-2`}>
              <span className="text-2xl font-bold">{result.overallScore}/10</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{result.scoreLabel}</p>
          </div>

          {/* Diet Compatibility */}
          {result.dietCompatibility && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{lang === "tr" ? "Diyet Uyumlulugu" : "Diet Compatibility"}</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.dietCompatibility).map(([key, val]) => {
                  const d = dietLabels[key];
                  if (!d) return null;
                  const DIcon = d.icon;
                  return (
                    <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${val ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 line-through"}`}>
                      <DIcon className="w-3.5 h-3.5" /> {d[lang]}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hidden Sugars */}
          {result.hiddenSugars?.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {lang === "tr" ? "Gizli Sekerler" : "Hidden Sugars"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.hiddenSugars.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens */}
          {result.allergens?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-5">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {lang === "tr" ? "Alerjenler" : "Allergens"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.allergens.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300 rounded text-xs font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Additives */}
          {result.additives?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{lang === "tr" ? "Katki Maddeleri" : "Additives"}</h3>
              <div className="space-y-2">
                {result.additives.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{a.name} {a.code && <span className="text-gray-400">({a.code})</span>}</span>
                      <p className="text-xs text-gray-500">{a.note}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${concernColor(a.concern)}`}>{a.concern}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positives & Concerns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.positives?.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-5">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {lang === "tr" ? "Olumlu" : "Positives"}</h3>
                <ul className="space-y-1">{result.positives.map((p, i) => <li key={i} className="text-sm text-green-700 dark:text-green-400">{p}</li>)}</ul>
              </div>
            )}
            {result.concerns?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-5">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {lang === "tr" ? "Endiseler" : "Concerns"}</h3>
                <ul className="space-y-1">{result.concerns.map((c, i) => <li key={i} className="text-sm text-red-700 dark:text-red-400">{c}</li>)}</ul>
              </div>
            )}
          </div>

          {result.recommendations && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic p-4">{result.recommendations}</p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
