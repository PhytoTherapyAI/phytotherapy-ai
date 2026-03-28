"use client";

import { useState } from "react";
import { FlaskConical, Search, Loader2, MapPin, Clock, Users, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Trial {
  title: string;
  phase: string;
  status: string;
  sponsor: string;
  summary: string;
  eligibility: string;
  estimatedCompletion: string;
  clinicalTrialsGovId: string | null;
}

interface TrialResult {
  trials: Trial[];
  searchTips: string;
  relatedConditions: string[];
}

export default function ClinicalTrialsPage() {
  const { session } = useAuth();
  const { lang } = useLang();
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrialResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrial, setExpandedTrial] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!condition.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch("/api/clinical-trials", {
        method: "POST",
        headers,
        body: JSON.stringify({ condition: condition.trim(), location: location.trim(), lang }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("recruit")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (s.includes("active")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <FlaskConical className="w-10 h-10 text-teal-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("trials.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("trials.subtitle", lang)}</p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {tx("trials.condition", lang)} *
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={lang === "tr" ? "ornegin: Tip 2 Diyabet, Romatoid Artrit" : "e.g., Type 2 Diabetes, Rheumatoid Arthritis"}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {tx("trials.location", lang)}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={lang === "tr" ? "ornegin: Istanbul, Türkiye" : "e.g., Istanbul, Turkey"}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading || !condition.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            {isLoading ? tx("tool.loading", lang) : tx("trials.search", lang)}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.trials?.map((trial, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setExpandedTrial(expandedTrial === i ? null : i)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(trial.status)}`}>{trial.status}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">{trial.phase}</span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{trial.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{trial.sponsor}</p>
                  </div>
                  {expandedTrial === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>
              {expandedTrial === i && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{trial.summary}</p>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{lang === "tr" ? "Uygunluk" : "Eligibility"}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{trial.eligibility}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trial.estimatedCompletion}</span>
                    {trial.clinicalTrialsGovId && (
                      <a
                        href={`https://clinicaltrials.gov/study/${trial.clinicalTrialsGovId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-teal-600 hover:text-teal-700"
                      >
                        <ExternalLink className="w-3 h-3" /> ClinicalTrials.gov
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {result.relatedConditions?.length > 0 && (
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
              <p className="text-sm font-medium text-teal-800 dark:text-teal-300 mb-2">
                {lang === "tr" ? "Ilgili Arama Terimleri" : "Related Search Terms"}
              </p>
              <div className="flex flex-wrap gap-2">
                {result.relatedConditions.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setCondition(c); setResult(null); }}
                    className="px-3 py-1 bg-teal-100 dark:bg-teal-800/50 text-teal-700 dark:text-teal-300 rounded-full text-xs hover:bg-teal-200"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result.searchTips && (
            <p className="text-xs text-gray-500 text-center">{result.searchTips}</p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
