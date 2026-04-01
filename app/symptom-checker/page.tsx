// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Heart,
  ThermometerSun,
  Brain,
  Bone,
  Eye,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SymptomResult {
  triage: "emergency" | "doctor" | "home";
  urgencyScore?: number;
  title?: string;
  summary?: string;
  message?: string;
  matchedFlags?: string[];
  possibleCauses?: Array<{
    cause: string;
    likelihood: "high" | "moderate" | "low";
    explanation: string;
  }>;
  recommendations?: Array<{
    action: string;
    priority: "high" | "medium" | "low";
  }>;
  whenToSeeDoctor?: string[];
  selfCare?: string[];
  medicationNotes?: string;
  sources?: Array<{ title: string; url: string }>;
}

const COMMON_SYMPTOMS = [
  { en: "Headache", tr: "Baş ağrısı", icon: Brain },
  { en: "Fatigue", tr: "Yorgunluk", icon: ThermometerSun },
  { en: "Nausea", tr: "Bulantı", icon: Wind },
  { en: "Joint pain", tr: "Eklem ağrısı", icon: Bone },
  { en: "Insomnia", tr: "Uykusuzluk", icon: Eye },
  { en: "Stomach pain", tr: "Karın ağrısı", icon: Heart },
  { en: "Dizziness", tr: "Baş dönmesi", icon: Brain },
  { en: "Back pain", tr: "Bel ağrısı", icon: Bone },
];

export default function SymptomCheckerPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [showSources, setShowSources] = useState(false);

  const commonSymptoms = COMMON_SYMPTOMS.map((s) => ({ label: s[lang], icon: s.icon }));

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/symptom-checker", {
        method: "POST",
        headers,
        body: JSON.stringify({ symptoms: symptoms.trim(), lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const addSymptom = (label: string) => {
    if (symptoms) {
      setSymptoms((prev) => prev + ", " + label.toLowerCase());
    } else {
      setSymptoms(label);
    }
  };

  const triageConfig = {
    emergency: {
      color: "border-red-500 bg-red-50 dark:bg-red-950/30",
      textColor: "text-red-700 dark:text-red-400",
      icon: ShieldAlert,
      label: tx("symptom.emergency", lang),
    },
    doctor: {
      color: "border-amber-400 bg-amber-50 dark:bg-amber-950/30",
      textColor: "text-amber-700 dark:text-amber-400",
      icon: AlertTriangle,
      label: tx("symptom.triageDoctor", lang),
    },
    home: {
      color: "border-green-400 bg-green-50 dark:bg-green-950/30",
      textColor: "text-green-700 dark:text-green-400",
      icon: CheckCircle2,
      label: tx("symptom.triageHome", lang),
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-950">
          <Stethoscope className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("symptom.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("symptom.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
        <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
        {tx("symptom.disclaimer", lang)}
      </div>

      {!result && (
        <>
          {/* Common Symptoms */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {tx("symptom.commonSymptoms", lang)}
            </p>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => addSymptom(s.label)}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 dark:hover:border-teal-600 dark:hover:bg-teal-950 dark:hover:text-teal-400"
                  >
                    <Icon className="h-3 w-3" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptom Input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("symptom.describeLabel", lang)}
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={tx("symptom.placeholder", lang)}
              rows={4}
              maxLength={2000}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {symptoms.length}/2000
            </p>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || symptoms.trim().length < 3}
            className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("symptom.analyzing", lang)}
              </>
            ) : (
              <>
                <Stethoscope className="h-4 w-4" />
                {tx("symptom.analyzeBtn", lang)}
              </>
            )}
          </Button>
        </>
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
          {/* Emergency */}
          {result.triage === "emergency" && (
            <div className="rounded-xl border-2 border-red-500 bg-red-50 p-6 text-center dark:bg-red-950/40">
              <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-red-600" />
              <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">
                {tx("symptom.emergency", lang)}
              </h2>
              <p className="mb-4 text-sm text-red-600 dark:text-red-300">
                {result.message}
              </p>
              <a href="tel:112">
                <Button
                  size="lg"
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Phone className="h-5 w-5" />
                  {tx("symptom.call911", lang)}
                </Button>
              </a>
            </div>
          )}

          {/* Non-emergency results */}
          {result.triage !== "emergency" && (
            <>
              {/* Triage Badge */}
              {(() => {
                const config = triageConfig[result.triage];
                const Icon = config.icon;
                return (
                  <div className={`flex items-center gap-3 rounded-xl border-2 p-4 ${config.color}`}>
                    <Icon className={`h-8 w-8 ${config.textColor}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${config.textColor}`}>
                          {config.label}
                        </span>
                        {result.urgencyScore && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color} ${config.textColor}`}>
                            {tx("symptom.urgency", lang)}: {result.urgencyScore}/10
                          </span>
                        )}
                      </div>
                      {result.title && (
                        <p className={`mt-1 text-sm font-medium ${config.textColor}`}>
                          {result.title}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Summary */}
              {result.summary && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </div>
              )}

              {/* Possible Causes */}
              {result.possibleCauses && result.possibleCauses.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 text-sm font-semibold">
                    {tx("symptom.possibleCauses", lang)}
                  </h3>
                  <div className="space-y-2">
                    {result.possibleCauses.map((cause, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                        <span
                          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                            cause.likelihood === "high"
                              ? "bg-red-500"
                              : cause.likelihood === "moderate"
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">{cause.cause}</p>
                          <p className="text-xs text-muted-foreground">
                            {cause.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Notes */}
              {result.medicationNotes && (
                <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
                  <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-purple-700 dark:text-purple-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {tx("symptom.medicationNote", lang)}
                  </h3>
                  <p className="text-xs text-purple-600 dark:text-purple-300">
                    {result.medicationNotes}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 text-sm font-semibold">
                    {tx("symptom.recommendations", lang)}
                  </h3>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className={`mt-1 text-xs font-bold ${
                            rec.priority === "high"
                              ? "text-red-500"
                              : rec.priority === "medium"
                              ? "text-amber-500"
                              : "text-green-500"
                          }`}
                        >
                          {rec.priority === "high" ? "!" : rec.priority === "medium" ? "~" : "·"}
                        </span>
                        <p className="text-sm">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* When to See Doctor */}
              {result.whenToSeeDoctor && result.whenToSeeDoctor.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    {tx("symptom.whenToSeeDoctor", lang)}
                  </h3>
                  <ul className="space-y-1">
                    {result.whenToSeeDoctor.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-300">
                        <span className="mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Self Care */}
              {result.selfCare && result.selfCare.length > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-950/20">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {tx("symptom.selfCare", lang)}
                  </h3>
                  <ul className="space-y-1">
                    {result.selfCare.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-green-600 dark:text-green-300">
                        <span className="mt-1">•</span>
                        {item}
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
                    {showSources ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    {tx("symptom.sources", lang)} ({result.sources.length})
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

              {/* New Check */}
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setSymptoms("");
                }}
                className="w-full"
              >
                {tx("symptom.newCheck", lang)}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
