// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import {
  Dna,
  Loader2,
  LogIn,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Pill,
  FlaskConical,
  Info,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface AffectedMedication {
  medication: string;
  enzyme: string;
  impact: "high" | "moderate" | "low";
  explanation: string;
  signs: string[];
}

interface GeneticFactor {
  enzyme: string;
  simpleExplanation: string;
  commonVariations: string;
  drugsAffected: string[];
  prevalence: string;
}

interface TestingRecommendation {
  recommended: boolean;
  urgency: "recommended" | "optional" | "not_needed";
  reason: string;
  testName: string;
  whatToExpect: string;
}

interface PharmaResult {
  summary: string;
  affectedMedications: AffectedMedication[];
  geneticFactors: GeneticFactor[];
  testingRecommendation: TestingRecommendation;
  personalizedNotes: string[];
  sources?: Array<{ title: string; url: string }>;
}

export default function PharmacogeneticsPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PharmaResult | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [medications, setMedications] = useState<string[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);

  // Load medications from profile
  useEffect(() => {
    if (!isAuthenticated || !session?.access_token) {
      setLoadingMeds(false);
      return;
    }
    const fetchMeds = async () => {
      try {
        const res = await fetch("/api/user-data", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.medications && data.medications.length > 0) {
            setMedications(data.medications.map((m: any) => (m.generic_name || m.brand_name)));
          }
        }
      } catch {
        // Ignore
      } finally {
        setLoadingMeds(false);
      }
    };
    fetchMeds();
  }, [isAuthenticated, session?.access_token]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/pharmacogenetics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ lang }),
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

  const impactBadge = (impact: string) => {
    if (impact === "high") return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">High</span>;
    if (impact === "moderate") return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Moderate</span>;
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Low</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-12 text-center dark:border-violet-800 dark:bg-violet-950/20">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-violet-400" />
          <p className="text-sm text-muted-foreground">{tx("pharma.loginRequired", lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-950">
          <Dna className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("pharma.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("pharma.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Pre-analysis view */}
      {!result && !isLoading && (
        <div className="space-y-5">
          {/* Medication list */}
          {loadingMeds ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
            </div>
          ) : medications.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-8 text-center dark:border-violet-800 dark:bg-violet-950/20">
              <Pill className="mx-auto mb-3 h-8 w-8 text-violet-400" />
              <p className="text-sm text-muted-foreground">
                {tx("pharma.noMeds", lang)}
              </p>
            </div>
          ) : (
            <>
              {/* Info box */}
              <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-950/20">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  <p className="text-xs text-violet-700 dark:text-violet-300">
                    {tx("pharma.infoBox", lang)}
                  </p>
                </div>
              </div>

              {/* Current medications */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tx("pharma.yourMeds", lang)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {medications.map((m, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300"
                    >
                      <Pill className="mr-1 inline h-3 w-3" />
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                <Dna className="mr-2 h-4 w-4" />
                {tx("pharma.analyze", lang)}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">{tx("pharma.analyzing", lang)}</p>
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
          {/* Summary */}
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-950/20">
            <p className="text-sm text-violet-700 dark:text-violet-300">{result.summary}</p>
          </div>

          {/* Affected Medications */}
          {result.affectedMedications && result.affectedMedications.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Pill className="h-4 w-4 text-violet-500" />
                {tx("pharma.affected", lang)}
              </h3>
              <div className="space-y-2">
                {result.affectedMedications.map((m, i) => (
                  <div key={i} className="rounded-lg bg-muted/30 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{m.medication}</span>
                      {impactBadge(m.impact)}
                    </div>
                    <p className="mb-1 text-xs text-violet-600 dark:text-violet-400">
                      {tx("pharma.enzyme", lang)}: {m.enzyme}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.explanation}</p>
                    {m.signs && m.signs.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {tx("pharma.signsToWatch", lang)}:
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {m.signs.map((s, j) => (
                            <li key={j} className="flex items-start gap-1 text-xs text-muted-foreground">
                              <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-violet-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genetic Factors (CYP Enzymes) */}
          {result.geneticFactors && result.geneticFactors.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Dna className="h-4 w-4 text-violet-500" />
                {tx("pharma.enzymes", lang)}
              </h3>
              <div className="space-y-3">
                {result.geneticFactors.map((f, i) => (
                  <div key={i} className="rounded-lg bg-muted/30 p-3">
                    <p className="mb-1 text-sm font-bold text-violet-600 dark:text-violet-400">{f.enzyme}</p>
                    <p className="mb-2 text-xs">{f.simpleExplanation}</p>
                    <p className="mb-1 text-xs text-muted-foreground">{f.commonVariations}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {f.drugsAffected.map((d, j) => (
                        <span key={j} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                          {d}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground italic">{f.prevalence}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testing Recommendation */}
          {result.testingRecommendation && (
            <div className={`rounded-xl border-2 p-4 ${
              result.testingRecommendation.urgency === "recommended"
                ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                : result.testingRecommendation.urgency === "optional"
                ? "border-violet-200 bg-violet-50/50 dark:bg-violet-950/20"
                : "border-green-200 bg-green-50/50 dark:bg-green-950/20"
            }`}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <FlaskConical className="h-4 w-4" />
                {tx("pharma.testing", lang)}
                {result.testingRecommendation.urgency === "recommended" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : result.testingRecommendation.urgency === "not_needed" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : null}
              </h3>
              <p className="mb-1 text-xs font-medium">{result.testingRecommendation.testName}</p>
              <p className="text-xs text-muted-foreground">{result.testingRecommendation.reason}</p>
              {result.testingRecommendation.whatToExpect && (
                <p className="mt-2 text-xs text-muted-foreground italic">{result.testingRecommendation.whatToExpect}</p>
              )}
            </div>
          )}

          {/* Personalized Notes */}
          {result.personalizedNotes && result.personalizedNotes.length > 0 && (
            <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-950/20">
              <h3 className="mb-2 text-sm font-semibold text-violet-700 dark:text-violet-400">
                {tx("pharma.personalNotes", lang)}
              </h3>
              <ul className="space-y-1">
                {result.personalizedNotes.map((n, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-violet-600 dark:text-violet-300">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                    {n}
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
              setError(null);
            }}
            className="w-full"
          >
            {tx("pharma.analyzeAgain", lang)}
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
