"use client";

import { useState } from "react";
import { FileCheck, Loader2, UserCheck, ClipboardList, HelpCircle, AlertTriangle, Stethoscope, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SecondOpinionResult {
  recommendedSpecialist: string;
  urgency: string;
  whatToBring: string[];
  keyQuestions: string[];
  medicalSummary: string;
  relevantTests: string[];
  redFlags: string[];
  tips: string;
}

export default function SecondOpinionPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [concern, setConcern] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SecondOpinionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!concern.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/second-opinion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ concern: concern.trim(), lang }),
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

  const urgencyColor = (u: string) => {
    if (u === "urgent") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (u === "soon") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-16 text-center">
        <LogIn className="w-12 h-12 text-sky-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tx("secondopinion.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("tool.loginRequired", lang)}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Stethoscope className="w-10 h-10 text-sky-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("secondopinion.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("secondopinion.subtitle", lang)}</p>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {tx("secondopinion.concern", lang)}
        </label>
        <textarea
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          rows={4}
          placeholder={tx("secondOpinion.placeholder", lang)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none resize-none"
        />
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !concern.trim()}
          className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileCheck className="w-4 h-4 mr-2" />}
          {isLoading ? tx("tool.loading", lang) : tx("secondopinion.generate", lang)}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">{error}</div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Specialist + Urgency */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="w-5 h-5 text-sky-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{tx("secondOpinion.recommendedSpecialist", lang)}</h3>
              <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColor(result.urgency)}`}>{result.urgency}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{result.recommendedSpecialist}</p>
          </div>

          {/* Red Flags */}
          {result.redFlags?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-800 dark:text-red-300">{tx("secondOpinion.warningSigns", lang)}</h3>
              </div>
              <ul className="space-y-1">
                {result.redFlags.map((f, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tx("secondOpinion.medicalSummary", lang)}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.medicalSummary}</p>
          </div>

          {/* What to Bring */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-sky-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{tx("secondOpinion.whatToBring", lang)}</h3>
            </div>
            <ul className="space-y-1.5">
              {result.whatToBring?.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-sky-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{tx("secondOpinion.keyQuestions", lang)}</h3>
            </div>
            <ol className="space-y-2">
              {result.keyQuestions?.map((q, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-sky-500 font-semibold text-xs mt-0.5">{i + 1}.</span>{q}
                </li>
              ))}
            </ol>
          </div>

          {/* Relevant Tests */}
          {result.relevantTests?.length > 0 && (
            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800 p-5">
              <h3 className="font-semibold text-sky-800 dark:text-sky-300 mb-2">
                {tx("secondOpinion.suggestedTests", lang)}
              </h3>
              <ul className="space-y-1">
                {result.relevantTests.map((t, i) => (
                  <li key={i} className="text-sm text-sky-700 dark:text-sky-400 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {result.tips && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic text-center p-4">{result.tips}</p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
