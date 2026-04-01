// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Leaf,
  Loader2,
  LogIn,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Apple,
  Pill,
  Brain,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ProbioticRec {
  strain: string;
  dosage: string;
  duration: string;
  benefit: string;
  safety: "safe" | "caution" | "avoid";
  interactionNote: string;
}

interface DietarySuggestion {
  category: string;
  recommendation: string;
  foods_to_add: string[];
  foods_to_avoid: string[];
}

interface GutResult {
  gutHealthScore: number;
  patterns: string[];
  probioticRecs: ProbioticRec[];
  dietarySuggestions: DietarySuggestion[];
  medicationEffects: string[];
  gutBrainConnection: string;
  alertLevel: "green" | "yellow" | "red";
  alertMessage: string;
  whenToSeeDoctor: string[];
  sources?: Array<{ title: string; url: string }>;
}

const SYMPTOMS = [
  { key: "bloating", txKey: "gut.bloating" },
  { key: "gas", txKey: "gut.gas" },
  { key: "constipation", txKey: "gut.constipation" },
  { key: "diarrhea", txKey: "gut.diarrhea" },
  { key: "acid_reflux", txKey: "gut.acidReflux" },
  { key: "food_sensitivity", txKey: "gut.foodSensitivity" },
];

const DIET_TYPES = [
  { key: "standard", label: { en: "Standard", tr: "Standart" } },
  { key: "vegetarian", label: { en: "Vegetarian", tr: "Vejetaryen" } },
  { key: "vegan", label: { en: "Vegan", tr: "Vegan" } },
  { key: "keto", label: { en: "Keto", tr: "Keto" } },
  { key: "mediterranean", label: { en: "Mediterranean", tr: "Akdeniz" } },
  { key: "gluten_free", label: { en: "Gluten-Free", tr: "Glutensiz" } },
  { key: "lactose_free", label: { en: "Lactose-Free", tr: "Laktozsuz" } },
];

export default function GutHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [dietType, setDietType] = useState("standard");
  const [recentAntibiotics, setRecentAntibiotics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GutResult | null>(null);
  const [showSources, setShowSources] = useState(false);

  const toggleSymptom = (key: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/gut-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          diet_type: dietType,
          recent_antibiotics: recentAntibiotics,
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const safetyBadge = (safety: string) => {
    if (safety === "safe") return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Safe</span>;
    if (safety === "caution") return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Caution</span>;
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">Avoid</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-12 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
          <p className="text-sm text-muted-foreground">
            {tx("gutHealth.loginMessage", lang)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
          <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("gut.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("gut.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Input Form */}
      {!result && !isLoading && (
        <div className="space-y-5">
          {/* Symptoms */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("gut.symptoms", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SYMPTOMS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => toggleSymptom(s.key)}
                  className={`rounded-xl border p-3 text-left text-sm font-medium transition-all ${
                    selectedSymptoms.includes(s.key)
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}
                >
                  {tx(s.txKey, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Type */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("gut.dietType", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DIET_TYPES.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDietType(d.key)}
                  className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                    dietType === d.key
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}
                >
                  {d.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Antibiotics Toggle */}
          <div className="flex items-center justify-between rounded-xl border p-4">
            <span className="text-sm font-medium">{tx("gut.antibiotics", lang)}</span>
            <button
              onClick={() => setRecentAntibiotics(!recentAntibiotics)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                recentAntibiotics ? "bg-emerald-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  recentAntibiotics ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={selectedSymptoms.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {tx("gut.analyze", lang)}
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-muted-foreground">{tx("gut.analyzing", lang)}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Gut Health Score */}
          <div className={`flex items-center gap-3 rounded-xl border-2 p-4 ${
            result.alertLevel === "green"
              ? "border-green-400 bg-green-50 dark:bg-green-950/30"
              : result.alertLevel === "yellow"
              ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
              : "border-red-400 bg-red-50 dark:bg-red-950/30"
          }`}>
            {result.alertLevel === "green" ? (
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : result.alertLevel === "yellow" ? (
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{tx("gut.score", lang)}</span>
                <span className={`text-2xl font-bold ${
                  result.gutHealthScore >= 70 ? "text-green-600" : result.gutHealthScore >= 40 ? "text-amber-600" : "text-red-600"
                }`}>
                  {result.gutHealthScore}/100
                </span>
              </div>
              {result.alertMessage && (
                <p className="mt-1 text-sm text-muted-foreground">{result.alertMessage}</p>
              )}
            </div>
          </div>

          {/* Patterns */}
          {result.patterns && result.patterns.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Stethoscope className="h-4 w-4 text-emerald-500" />
                {tx("gutHealth.detectedPatterns", lang)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.patterns.map((p, i) => (
                  <span key={i} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Probiotic Recommendations */}
          {result.probioticRecs && result.probioticRecs.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Leaf className="h-4 w-4 text-emerald-500" />
                {tx("gut.probiotics", lang)}
              </h3>
              <div className="space-y-2">
                {result.probioticRecs.map((p, i) => (
                  <div key={i} className="rounded-lg bg-muted/30 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{p.strain}</span>
                      {safetyBadge(p.safety)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.dosage} &middot; {p.duration}
                    </p>
                    <p className="mt-1 text-xs">{p.benefit}</p>
                    {p.interactionNote && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Pill className="h-3 w-3" />
                        {p.interactionNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Suggestions */}
          {result.dietarySuggestions && result.dietarySuggestions.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Apple className="h-4 w-4 text-emerald-500" />
                {tx("gut.dietary", lang)}
              </h3>
              <div className="space-y-3">
                {result.dietarySuggestions.map((d, i) => (
                  <div key={i} className="rounded-lg bg-muted/30 p-3">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">{d.category}</p>
                    <p className="mb-2 text-sm">{d.recommendation}</p>
                    {d.foods_to_add && d.foods_to_add.length > 0 && (
                      <div className="mb-1 flex flex-wrap gap-1">
                        {d.foods_to_add.map((f, j) => (
                          <span key={j} className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            + {f}
                          </span>
                        ))}
                      </div>
                    )}
                    {d.foods_to_avoid && d.foods_to_avoid.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {d.foods_to_avoid.map((f, j) => (
                          <span key={j} className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            - {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medication Effects */}
          {result.medicationEffects && result.medicationEffects.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Pill className="h-4 w-4 text-emerald-500" />
                {tx("common.medicationEffects", lang)}
              </h3>
              <ul className="space-y-1">
                {result.medicationEffects.map((m, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <span className="mt-1 text-amber-500">&#9679;</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gut-Brain Connection */}
          {result.gutBrainConnection && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <Brain className="h-3.5 w-3.5" />
                {tx("gutHealth.gutBrain", lang)}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-300">{result.gutBrainConnection}</p>
            </div>
          )}

          {/* When to See Doctor */}
          {result.whenToSeeDoctor && result.whenToSeeDoctor.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                {tx("common.whenToSeeDoctor", lang)}
              </h3>
              <ul className="space-y-1">
                {result.whenToSeeDoctor.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-300">
                    <span className="mt-1">&#8226;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {tx("common.sources", lang)} ({result.sources.length})
              </button>
              {showSources && (
                <div className="mt-2 space-y-1">
                  {result.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-primary hover:underline"
                    >
                      {src.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Analysis */}
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setSelectedSymptoms([]);
              setError(null);
            }}
            className="w-full"
          >
            {tx("gutHealth.newAnalysis", lang)}
          </Button>
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
