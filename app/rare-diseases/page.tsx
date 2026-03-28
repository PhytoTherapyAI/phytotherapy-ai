"use client";

import { useState } from "react";
import { Dna, Search, Loader2, ExternalLink, Users, Stethoscope, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface RareResult {
  name: string;
  alternateNames: string[];
  prevalence: string;
  inheritance: string;
  summary: string;
  symptoms: string[];
  diagnosis: string[];
  treatment: string;
  prognosis: string;
  specialists: string[];
  patientAssociations: Array<{ name: string; url: string; country: string }>;
  clinicalTrials: string;
  orphanetCode: string | null;
  omimCode: string | null;
  resources: Array<{ name: string; url: string; description: string }>;
}

export default function RareDiseasesPage() {
  const { lang } = useLang();
  const [disease, setDisease] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RareResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSearch = async () => {
    if (!disease.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/rare-diseases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disease: disease.trim(), lang }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Dna className="w-10 h-10 text-teal-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("rare.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("rare.subtitle", lang)}</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={tx("rare.search", lang)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <Button onClick={handleSearch} disabled={isLoading || !disease.trim()} className="bg-teal-600 hover:bg-teal-700 text-white">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{result.name}</h2>
            {result.alternateNames?.length > 0 && (
              <p className="text-xs text-gray-400 mb-3">{result.alternateNames.join(", ")}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded text-xs">{result.prevalence}</span>
              <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">{result.inheritance}</span>
              {result.orphanetCode && <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">ORPHA: {result.orphanetCode}</span>}
              {result.omimCode && <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">OMIM: {result.omimCode}</span>}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.summary}</p>
          </div>

          {/* Symptoms */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{tx("common.symptoms", lang)}</h3>
            <div className="flex flex-wrap gap-2">
              {result.symptoms?.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs">{s}</span>
              ))}
            </div>
          </div>

          {/* Expandable Details */}
          <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-900 dark:text-white">{lang === "tr" ? "Detaylar" : "Details"}</span>
            {showDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {showDetails && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{lang === "tr" ? "Tani" : "Diagnosis"}</h3>
                <ul className="space-y-1">{result.diagnosis?.map((d, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />{d}</li>)}</ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{lang === "tr" ? "Tedavi" : "Treatment"}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{result.treatment}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{lang === "tr" ? "Prognoz" : "Prognosis"}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{result.prognosis}</p>
              </div>
            </div>
          )}

          {/* Specialists */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-teal-500" /> {lang === "tr" ? "Uzmanlar" : "Specialists"}</h3>
            <div className="flex flex-wrap gap-2">
              {result.specialists?.map((s, i) => <span key={i} className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full text-xs">{s}</span>)}
            </div>
          </div>

          {/* Patient Associations */}
          {result.patientAssociations?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-teal-500" /> {lang === "tr" ? "Hasta Dernekleri" : "Patient Associations"}</h3>
              <div className="space-y-2">
                {result.patientAssociations.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.country}</p>
                    </div>
                    {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700"><ExternalLink className="w-4 h-4" /></a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.clinicalTrials && (
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800 p-4">
              <p className="text-sm text-teal-700 dark:text-teal-400">{result.clinicalTrials}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
