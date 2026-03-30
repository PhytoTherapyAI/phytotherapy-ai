// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import { BookOpen, Search, Loader2, LogIn, Tag, Brain, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface DictionaryResult {
  plainLanguage: string;
  medicalDefinition: string;
  etymology: string;
  category: string;
  relatedTerms: string[];
  commonUsage: string;
  whenToWorry: string;
}

export default function MedicalDictionaryPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [term, setTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!term.trim() || term.trim().length < 2) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/medical-dictionary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ term: term.trim(), lang }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }

      const data = await response.json();
      setResult(data.result);
      setSearchHistory((prev) => {
        const updated = [term.trim(), ...prev.filter((t) => t !== term.trim())].slice(0, 10);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tx("meddict.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{tx("meddict.subtitle", lang)}</p>
          <Button onClick={() => window.location.href = "/auth"} className="gap-2">
            <LogIn className="w-4 h-4" />
            {tx("tool.loginRequired", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("meddict.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("meddict.subtitle", lang)}</p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={tx("meddict.search", lang)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || term.trim().length < 2}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : tx("meddict.explain", lang)}
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchHistory.map((h) => (
                <button
                  key={h}
                  onClick={() => { setTerm(h); }}
                  className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
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
            {/* Plain Language */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {tx("meddict.simpleTerms", lang)}
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{result.plainLanguage}</p>
            </div>

            {/* Medical Definition */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {tx("meddict.medicalDef", lang)}
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{result.medicalDefinition}</p>
              {result.etymology && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">{result.etymology}</p>
              )}
              {result.category && (
                <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  {result.category}
                </span>
              )}
            </div>

            {/* Common Usage */}
            {result.commonUsage && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {tx("meddict.howDoctorsUse", lang)}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{result.commonUsage}</p>
              </div>
            )}

            {/* When to Worry */}
            {result.whenToWorry && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
                <h2 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                  {tx("meddict.whenConcerned", lang)}
                </h2>
                <p className="text-amber-700 dark:text-amber-300">{result.whenToWorry}</p>
              </div>
            )}

            {/* Related Terms */}
            {result.relatedTerms && result.relatedTerms.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {tx("meddict.relatedTerms", lang)}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.relatedTerms.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => { setTerm(rt); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {rt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{tx("meddict.searchPrompt", lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
