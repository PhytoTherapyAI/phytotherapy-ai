// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import { Flame, Loader2, Leaf, ArrowRightLeft, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface AIResult {
  inflammationScore: number;
  scoreLabel: string;
  omega6to3Ratio: string;
  optimalRatio: string;
  inflammatoryFoods: Array<{ food: string; reason: string; alternative: string }>;
  antiInflammatoryFoods: string[];
  recommendations: Array<{ action: string; impact: string; explanation: string }>;
  spicesAndHerbs: Array<{ name: string; benefit: string; dose: string }>;
  crpAnalysis: string | null;
  weeklyPlan: string;
}

export default function AntiInflammatoryPage() {
  const { lang } = useLang();
  const [diet, setDiet] = useState("");
  const [crp, setCrp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!diet.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/anti-inflammatory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diet: diet.trim(), crp: crp ? parseFloat(crp) : null, lang }),
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
    if (s <= 3) return "text-green-600 border-green-500 bg-green-50";
    if (s <= 6) return "text-amber-600 border-amber-500 bg-amber-50";
    return "text-red-600 border-red-500 bg-red-50";
  };

  const impactBadge = (i: string) => {
    if (i === "high") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (i === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Flame className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("antiinflam.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("antiinflam.subtitle", lang)}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tx("antiinflam.diet", lang)} *</label>
            <textarea value={diet} onChange={(e) => setDiet(e.target.value)} rows={4} placeholder={tx("antiinflam.dietPlaceholder", lang)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tx("antiinflam.crp", lang)}</label>
            <input type="number" step="0.1" value={crp} onChange={(e) => setCrp(e.target.value)} placeholder="e.g., 3.5" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <Button onClick={handleAnalyze} disabled={isLoading || !diet.trim()} className="w-full bg-green-600 hover:bg-green-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Flame className="w-4 h-4 mr-2" />}
            {isLoading ? tx("tool.loading", lang) : tx("antiinflam.analyze", lang)}
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* Score + Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`rounded-xl border-2 p-5 text-center ${scoreColor(result.inflammationScore)}`}>
              <p className="text-3xl font-bold">{result.inflammationScore}/10</p>
              <p className="text-sm mt-1">{result.scoreLabel}</p>
              <p className="text-xs mt-1 opacity-70">{tx("antiinflam.inflammationScore", lang)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.omega6to3Ratio}</p>
              <p className="text-sm text-gray-500">Omega-6:3 {tx("antiinflam.ratio", lang)}</p>
              <p className="text-xs text-green-600 mt-1">{tx("antiinflam.optimal", lang)}: {result.optimalRatio}</p>
            </div>
          </div>

          {/* CRP Analysis */}
          {result.crpAnalysis && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">CRP {tx("antiinflam.crpAnalysis", lang)}</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">{result.crpAnalysis}</p>
            </div>
          )}

          {/* Inflammatory Foods with Swaps */}
          {result.inflammatoryFoods?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> {tx("antiinflam.inflammatoryFoods", lang)}
              </h3>
              <div className="space-y-3">
                {result.inflammatoryFoods.map((f, i) => (
                  <div key={i} className="p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-red-700 dark:text-red-400">{f.food}</span>
                      <ArrowRightLeft className="w-3 h-3 text-gray-400" />
                      <span className="font-medium text-sm text-green-700 dark:text-green-400">{f.alternative}</span>
                    </div>
                    <p className="text-xs text-gray-500">{f.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anti-Inflammatory Foods Already In Diet */}
          {result.antiInflammatoryFoods?.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-5">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                <Leaf className="w-4 h-4" /> {tx("antiinflam.alreadyDoingWell", lang)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.antiInflammatoryFoods.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300 rounded-full text-xs">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{tx("common.recommendations", lang)}</h3>
              <div className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${impactBadge(r.impact)}`}>{r.impact}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{r.action}</p>
                      <p className="text-xs text-gray-500">{r.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spices & Herbs */}
          {result.spicesAndHerbs?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> {tx("antiinflam.spicesHerbs", lang)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.spicesAndHerbs.map((s, i) => (
                  <div key={i} className="p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.benefit}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{s.dose}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.weeklyPlan && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tx("antiinflam.sampleMealPlan", lang)}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{result.weeklyPlan}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
