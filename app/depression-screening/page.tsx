// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Heart,
  Loader2,
  AlertTriangle,
  Phone,
  Shield,
  LogIn,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface DepressionResult {
  phq9Score: number;
  severity: string;
  alertLevel: "green" | "yellow" | "red";
  professionalReferral: boolean;
  crisisAlert: boolean;
  crisisMessage?: string;
  crisisLines: string[];
  recommendations?: string[];
  lifestyleChanges?: string[];
  medicationNotes?: string;
  positiveActions?: string[];
  followUpSuggestion?: string;
  questionBreakdown: Array<{ question: string; score: number }>;
}

const PHQ9 = [
  { en: "Little interest or pleasure in doing things", tr: "Bir seylere karsi cok az ilgi veya zevk duyma" },
  { en: "Feeling down, depressed, or hopeless", tr: "Kendini cokmus, depresif veya umutsuz hissetme" },
  { en: "Trouble falling or staying asleep, or sleeping too much", tr: "Uykuya dalmakta veya uyumakta zorluk cekme, ya da cok fazla uyuma" },
  { en: "Feeling tired or having little energy", tr: "Yorgun hissetme veya az enerjiye sahip olma" },
  { en: "Poor appetite or overeating", tr: "Istahsizlik veya asiri yeme" },
  { en: "Feeling bad about yourself — or that you are a failure", tr: "Kendini kotu hissetme veya başarısiz olduğunu dusunme" },
  { en: "Trouble concentrating on things", tr: "Bir seylere odaklanmakta zorluk cekme" },
  { en: "Moving or speaking slowly, or being fidgety/restless", tr: "Yavas hareket etme/konusma veya huzursuz/yerinde duramama" },
  { en: "Thoughts that you would be better off dead, or of hurting yourself", tr: "Olseniz daha iyi olacagini dusunme veya kendinize zarar verme dusunceleri" },
];

const OPTIONS = [
  { en: "Not at all (0)", tr: "Hic (0)" },
  { en: "Several days (1)", tr: "Birkac gun (1)" },
  { en: "More than half (2)", tr: "Yaridan fazla (2)" },
  { en: "Nearly every day (3)", tr: "Neredeyse her gun (3)" },
];

export default function DepressionScreeningPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [answers, setAnswers] = useState<number[]>(Array(9).fill(-1));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DepressionResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const l = lang as "en" | "tr";

  const allAnswered = answers.every((a) => a >= 0);

  const handleAnalyze = async () => {
    if (!session?.access_token || !allAnswered) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/depression-screening", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang, phq9_answers: answers }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minimal": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "mild": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "moderate": return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
      case "moderately_severe": return "text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      case "severe": return "text-red-700 bg-red-200 dark:bg-red-900/50 dark:text-red-300";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, Record<string, string>> = {
      minimal: { en: "Minimal", tr: "Minimum" },
      mild: { en: "Mild", tr: "Hafif" },
      moderate: { en: "Moderate", tr: "Orta" },
      moderately_severe: { en: "Moderately Severe", tr: "Orta-Siddetli" },
      severe: { en: "Severe", tr: "Siddetli" },
    };
    return labels[severity]?.[lang] || severity;
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("depression.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("depression.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-8 text-center dark:border-blue-800 dark:bg-blue-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
            {tx("common.loginToUse2", lang)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
          <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("depression.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("depression.subtitle", lang)}</p>
        </div>
      </div>

      {/* Crisis Alert Banner (always visible) */}
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          <Phone className="mr-1.5 inline h-4 w-4" />
          {tx("depression.crisisAlert", lang)}
        </p>
      </div>

      {/* RED ALERT from result */}
      {result?.crisisAlert && (
        <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 p-6 dark:bg-red-950/40">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-300">{result.crisisMessage}</p>
              <div className="mt-3 space-y-1">
                {result.crisisLines.map((line, i) => (
                  <p key={i} className="text-lg font-bold text-red-600">{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHQ-9 Questionnaire */}
      {!result && (
        <div className="mb-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {tx("depression.instructions", lang)}
          </p>
          {PHQ9.map((q, qi) => (
            <div key={qi} className={`rounded-xl border p-4 shadow-sm ${
              qi === 8 ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10" : "bg-card"
            }`}>
              <p className="mb-3 text-sm font-medium">
                {qi + 1}. {q[l]}
                {qi === 8 && (
                  <span className="ml-2 text-xs text-red-500">
                    ({tx("depression.criticalQuestion", lang)})
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {OPTIONS.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => {
                      const newAnswers = [...answers];
                      newAnswers[qi] = oi;
                      setAnswers(newAnswers);
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      answers[qi] === oi
                        ? qi === 8 && oi > 0
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                    }`}
                  >
                    {opt[l]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calculate Button */}
      {!result && (
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || !allAnswered}
          className="mb-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("depression.calculating", lang)}</>
          ) : (
            <><Shield className="mr-2 h-5 w-5" />{tx("depression.analyze", lang)}</>
          )}
        </Button>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !result.crisisAlert && (
        <div className="space-y-4">
          {/* Score Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {tx("depression.phq9", lang)}
            </h3>
            <p className="mt-2 text-5xl font-bold">{result.phq9Score}<span className="text-lg text-muted-foreground">/27</span></p>
            <div className="mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
              <span className={`rounded-full px-4 py-1.5 ${getSeverityColor(result.severity)}`}>
                {tx("depression.severity", lang)}: {getSeverityLabel(result.severity)}
              </span>
            </div>
            <div className="mt-4 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-3 rounded-full transition-all ${
                  result.phq9Score <= 4 ? "bg-green-500" :
                  result.phq9Score <= 9 ? "bg-yellow-500" :
                  result.phq9Score <= 14 ? "bg-orange-500" :
                  result.phq9Score <= 19 ? "bg-red-400" : "bg-red-600"
                }`}
                style={{ width: `${(result.phq9Score / 27) * 100}%` }}
              />
            </div>
          </div>

          {/* Professional Referral */}
          {result.professionalReferral && (
            <div className={`rounded-xl border-2 p-5 ${
              result.alertLevel === "red"
                ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                : "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`mt-0.5 h-6 w-6 flex-shrink-0 ${
                  result.alertLevel === "red" ? "text-red-600" : "text-amber-600"
                }`} />
                <div>
                  <p className={`font-semibold ${
                    result.alertLevel === "red" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"
                  }`}>
                    {tx("depression.referralMessage", lang)}
                  </p>
                  <div className="mt-2 space-y-1">
                    {result.crisisLines.map((line, i) => (
                      <p key={i} className="text-sm font-medium">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Breakdown */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between"
            >
              <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {tx("depression.questionDetails", lang)}
              </h3>
              {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {showDetails && (
              <div className="mt-4 space-y-2">
                {result.questionBreakdown.map((q, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">{i + 1}. {PHQ9[i]?.[l] ?? q.question}</span>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                      q.score === 0 ? "bg-green-100 text-green-700" :
                      q.score === 1 ? "bg-yellow-100 text-yellow-700" :
                      q.score === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {q.score}/3
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
                {tx("common.recommendations", lang)}
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Positive Actions */}
          {result.positiveActions && result.positiveActions.length > 0 && (
            <div className="rounded-xl border-2 border-green-300 bg-green-50 p-6 dark:bg-green-950/20">
              <h3 className="mb-3 text-lg font-bold text-green-700 dark:text-green-300">
                {tx("depression.positiveActions", lang)}
              </h3>
              <ul className="space-y-2">
                {result.positiveActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                    <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medication Notes */}
          {result.medicationNotes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-sm text-amber-700 dark:text-amber-300">{result.medicationNotes}</p>
            </div>
          )}

          {/* Retake */}
          <Button
            onClick={() => { setResult(null); setAnswers(Array(9).fill(-1)); }}
            variant="outline"
            className="w-full"
          >
            {tx("depression.takeAgain", lang)}
          </Button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
