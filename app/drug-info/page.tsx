"use client";

import { useState } from "react";
import { Pill, Search, Loader2, LogIn, AlertTriangle, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SideEffects {
  common: string[];
  serious: string[];
  rare: string[];
}

interface DrugResult {
  drugName: string;
  brandNames: string[];
  activeIngredient: string;
  drugClass: string;
  whatItDoes: string;
  howToTake: string;
  commonDoses: string;
  sideEffects: SideEffects;
  interactions: string[];
  whenToStop: string;
  genericVsOriginal: string;
  storageInfo: string;
  pregnancyCategory: string;
  disclaimer: string;
}

export default function DrugInfoPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [drugName, setDrugName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrugResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSearch = async () => {
    if (!drugName.trim() || drugName.trim().length < 2) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/drug-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ drug_name: drugName.trim(), lang }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tx("druginfo.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{tx("druginfo.subtitle", lang)}</p>
          <Button onClick={() => window.location.href = "/auth"} className="gap-2">
            <LogIn className="w-4 h-4" />
            {tx("tool.loginRequired", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("druginfo.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("druginfo.subtitle", lang)}</p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={tx("druginfo.search", lang)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || drugName.trim().length < 2}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : tx("druginfo.lookup", lang)}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Drug Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{result.drugName}</h2>
              {result.activeIngredient && (
                <p className="text-purple-600 dark:text-purple-400 font-medium mt-1">{result.activeIngredient}</p>
              )}
              {result.brandNames && result.brandNames.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.brandNames.map((b) => (
                    <span key={b} className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                      {b}
                    </span>
                  ))}
                </div>
              )}
              {result.drugClass && (
                <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {result.drugClass}
                </span>
              )}
            </div>

            {/* What It Does */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {tx("drugInfo.whatItDoes", lang)}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{result.whatItDoes}</p>
            </div>

            {/* How To Take */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {tx("drugInfo.howToTake", lang)}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{result.howToTake}</p>
              {result.commonDoses && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{result.commonDoses}</p>
              )}
            </div>

            {/* Side Effects — Collapsible */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 overflow-hidden">
              <button onClick={() => toggleSection("sideEffects")} className="w-full flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {tx("drugInfo.sideEffects", lang)}
                  </h3>
                </div>
                {expandedSections.sideEffects ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedSections.sideEffects && result.sideEffects && (
                <div className="px-6 pb-6 space-y-3">
                  {result.sideEffects.common?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">{tx("drugInfo.common", lang)}</p>
                      <div className="flex flex-wrap gap-2">
                        {result.sideEffects.common.map((s) => (
                          <span key={s} className="text-xs px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.sideEffects.serious?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">{tx("drugInfo.serious", lang)}</p>
                      <div className="flex flex-wrap gap-2">
                        {result.sideEffects.serious.map((s) => (
                          <span key={s} className="text-xs px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.sideEffects.rare?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{tx("drugInfo.rare", lang)}</p>
                      <div className="flex flex-wrap gap-2">
                        {result.sideEffects.rare.map((s) => (
                          <span key={s} className="text-xs px-2 py-1 rounded-full bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactions */}
            {result.interactions && result.interactions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 overflow-hidden">
                <button onClick={() => toggleSection("interactions")} className="w-full flex items-center justify-between p-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {tx("drugInfo.interactions", lang)}
                    </h3>
                  </div>
                  {expandedSections.interactions ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {expandedSections.interactions && (
                  <div className="px-6 pb-6">
                    <ul className="space-y-2">
                      {result.interactions.map((i, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <span className="text-purple-500 mt-1">•</span>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* When to Stop */}
            {result.whenToStop && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800 p-6">
                <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                  {tx("drugInfo.whenToStop", lang)}
                </h3>
                <p className="text-red-700 dark:text-red-300">{result.whenToStop}</p>
              </div>
            )}

            {/* Generic vs Original */}
            {result.genericVsOriginal && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {tx("drugInfo.genericVsBrand", lang)}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{result.genericVsOriginal}</p>
              </div>
            )}

            {/* Storage & Pregnancy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.storageInfo && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {tx("drugInfo.storage", lang)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{result.storageInfo}</p>
                </div>
              )}
              {result.pregnancyCategory && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {tx("drugInfo.pregnancy", lang)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{result.pregnancyCategory}</p>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {result.disclaimer || tx("drugInfo.defaultDisclaimer", lang)}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{tx("drugInfo.enterName", lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
