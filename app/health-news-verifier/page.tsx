// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import { Newspaper, Loader2, LogIn, CheckCircle, XCircle, AlertTriangle, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface NewsResult {
  claim: string;
  verdict: string;
  verdictExplanation: string;
  evidenceLevel: string;
  studyType: string;
  sampleSize: string;
  mediaAccuracy: string;
  nuances: string[];
  commonMisinterpretations: string[];
  whatWeKnow: string;
  bottomLine: string;
}

const verdictConfig: Record<string, { color: string; bg: string; border: string; icon: "check" | "x" | "alert" | "help" }> = {
  TRUE: { color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", icon: "check" },
  MOSTLY_TRUE: { color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10", border: "border-green-200 dark:border-green-800", icon: "check" },
  MIXED: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", icon: "alert" },
  MOSTLY_FALSE: { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10", border: "border-red-200 dark:border-red-800", icon: "x" },
  FALSE: { color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", icon: "x" },
  UNPROVEN: { color: "text-gray-700 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-800", border: "border-gray-200 dark:border-gray-700", icon: "help" },
};

const VerdictIcon = ({ type }: { type: string }) => {
  const cfg = verdictConfig[type] || verdictConfig.UNPROVEN;
  const cls = `w-6 h-6 ${cfg.color}`;
  switch (cfg.icon) {
    case "check": return <CheckCircle className={cls} />;
    case "x": return <XCircle className={cls} />;
    case "alert": return <AlertTriangle className={cls} />;
    default: return <HelpCircle className={cls} />;
  }
};

export default function HealthNewsVerifierPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [claim, setClaim] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NewsResult | null>(null);

  const handleVerify = async () => {
    if (!claim.trim() || claim.trim().length < 10) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/health-news-verifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ claim: claim.trim(), lang }),
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tx("news.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{tx("news.subtitle", lang)}</p>
          <Button onClick={() => window.location.href = "/auth"} className="gap-2">
            <LogIn className="w-4 h-4" />
            {tx("tool.loginRequired", lang)}
          </Button>
        </div>
      </div>
    );
  }

  const vcfg = result ? (verdictConfig[result.verdict] || verdictConfig.UNPROVEN) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("news.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("news.subtitle", lang)}</p>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-100 dark:border-gray-700 p-6 mb-6">
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder={tx("news.claim", lang)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <Button
            onClick={handleVerify}
            disabled={isLoading || claim.trim().length < 10}
            className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
            {tx("news.verify", lang)}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && vcfg && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Verdict */}
            <div className={`${vcfg.bg} rounded-2xl border ${vcfg.border} p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <VerdictIcon type={result.verdict} />
                <h2 className={`text-xl font-bold ${vcfg.color}`}>{result.verdict.replace(/_/g, " ")}</h2>
              </div>
              <p className={`${vcfg.color} opacity-90`}>{result.verdictExplanation}</p>
            </div>

            {/* Evidence Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {tx("newsVerifier.evidenceBreakdown", lang)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tx("newsVerifier.evidenceLevel", lang)}</p>
                  <p className="font-bold text-amber-700 dark:text-amber-400">{result.evidenceLevel}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tx("newsVerifier.studyType", lang)}</p>
                  <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">{result.studyType}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tx("newsVerifier.sampleSize", lang)}</p>
                  <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">{result.sampleSize}</p>
                </div>
              </div>
            </div>

            {/* What We Know */}
            {result.whatWeKnow && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {tx("newsVerifier.whatScienceSays", lang)}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{result.whatWeKnow}</p>
              </div>
            )}

            {/* Nuances */}
            {result.nuances && result.nuances.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {tx("newsVerifier.nuances", lang)}
                </h3>
                <ul className="space-y-2">
                  {result.nuances.map((n, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                      <span className="text-amber-500 mt-0.5">•</span>{n}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Misinterpretations */}
            {result.commonMisinterpretations && result.commonMisinterpretations.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-3">
                  {tx("newsVerifier.misinterpretations", lang)}
                </h3>
                <ul className="space-y-2">
                  {result.commonMisinterpretations.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-700 dark:text-amber-300 text-sm">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />{m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Line */}
            {result.bottomLine && (
              <div className="bg-gray-900 dark:bg-gray-700 rounded-2xl p-6 text-center">
                <p className="text-xs text-gray-400 mb-2">{tx("newsVerifier.bottomLine", lang)}</p>
                <p className="text-white text-lg font-medium">{result.bottomLine}</p>
              </div>
            )}

            {/* Media Accuracy */}
            {result.mediaAccuracy && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{tx("newsVerifier.mediaAccuracy", lang)}</span> {result.mediaAccuracy}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{tx("newsVerifier.emptyState", lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
