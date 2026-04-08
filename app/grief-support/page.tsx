// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import { Heart, Loader2, LogIn, Phone, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx, txp } from "@/lib/translations";

interface GriefResult {
  stageName: string;
  stageDescription: string;
  validation: string;
  copingStrategies: string[];
  selfCareActions: string[];
  journalPrompts: string[];
  whenToSeekHelp: string[];
  helplineInfo: string;
  bookRecommendation: string;
  affirmation: string;
}

const STAGES = [
  { value: "denial", en: "Denial", tr: "Inkar", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  { value: "anger", en: "Anger", tr: "Ofke", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
  { value: "bargaining", en: "Bargaining", tr: "Pazarlik", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  { value: "depression", en: "Depression", tr: "Depresyon", color: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
  { value: "acceptance", en: "Acceptance", tr: "Kabul", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" },
];

export default function GriefSupportPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [stage, setStage] = useState<string>("");
  const [moodScore, setMoodScore] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GriefResult | null>(null);

  const handleSubmit = async () => {
    if (!stage) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/grief-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ stage, mood_score: moodScore, lang }),
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
            <Heart className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tx("grief.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{tx("grief.subtitle", lang)}</p>
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
            <Heart className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("grief.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("grief.subtitle", lang)}</p>
        </div>

        {/* Crisis Line */}
        <a
          href="tel:182"
          className="flex items-center justify-center gap-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl p-3 mb-6 text-sm hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
        >
          <Phone className="w-4 h-4" />
          {tx("griefSupport.crisisLine", lang)}
        </a>

        {/* Stage Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            {tx("griefSupport.stageQuestion", lang)}
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {STAGES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStage(s.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  stage === s.value
                    ? `${s.color} ring-2 ring-offset-2 ring-purple-300 dark:ring-purple-700`
                    : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {s[lang as "tr" | "en"]}
              </button>
            ))}
          </div>

          {/* Mood Score */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {txp("grief.moodScore", lang, { score: moodScore })}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{tx("griefSupport.moodVeryLow", lang)}</span>
              <span>{tx("griefSupport.moodVeryGood", lang)}</span>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !stage}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Heart className="w-5 h-5 mr-2" />}
            {tx("griefSupport.getSupport", lang)}
          </Button>
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
            {/* Validation */}
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-200 dark:border-purple-800 p-6">
              <p className="text-purple-800 dark:text-purple-300 text-lg leading-relaxed italic">
                &quot;{result.validation}&quot;
              </p>
            </div>

            {/* Stage Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{result.stageName}</h3>
              <p className="text-gray-700 dark:text-gray-300">{result.stageDescription}</p>
            </div>

            {/* Coping Strategies */}
            {result.copingStrategies?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {tx("griefSupport.copingStrategies", lang)}
                </h3>
                <ul className="space-y-2">
                  {result.copingStrategies.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-purple-500">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Self Care */}
            {result.selfCareActions?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {tx("griefSupport.selfCare", lang)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.selfCareActions.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-sm">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Journal Prompts */}
            {result.journalPrompts?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {tx("griefSupport.journalPrompts", lang)}
                  </h3>
                </div>
                {result.journalPrompts.map((p, i) => (
                  <p key={i} className="text-gray-600 dark:text-gray-400 italic mb-2">&quot;{p}&quot;</p>
                ))}
              </div>
            )}

            {/* When to Seek Help */}
            {result.whenToSeekHelp?.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-3">
                  {tx("griefSupport.seekHelp", lang)}
                </h3>
                <ul className="space-y-2">
                  {result.whenToSeekHelp.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-700 dark:text-amber-300 text-sm">
                      <span>•</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Affirmation */}
            {result.affirmation && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 text-center">
                <p className="text-purple-800 dark:text-purple-300 font-medium text-lg">
                  {result.affirmation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
