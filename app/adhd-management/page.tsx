// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Target,
  Zap,
  Coffee,
  Loader2,
  Brain,
  Timer,
  AlertTriangle,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ADHDResult {
  focusScore: number;
  pomodoroCompleted: number;
  hasStimulant: boolean;
  focusTrend: string;
  focusAnalysis: string;
  medicationEffectivenessAnalysis: string;
  caffeineInteraction: string | null;
  productivityTips: string[];
  environmentTips: string[];
  supplementSuggestions: Array<{ name: string; dose: string; evidence: string; safetyNote: string }>;
  pomodoroFeedback: string;
  sleepImpact: string;
  exerciseImpact: string;
}

export default function ADHDManagementPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [focusScore, setFocusScore] = useState(5);
  const [distractibility, setDistractibility] = useState(0);
  const [medEffectiveness, setMedEffectiveness] = useState(3);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sleepHours, setSleepHours] = useState(7);
  const [caffeineIntake, setCaffeineIntake] = useState(0);
  const [exerciseToday, setExerciseToday] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ADHDResult | null>(null);

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/adhd-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          focus_score: focusScore,
          distractibility_events: distractibility,
          medication_effectiveness: medEffectiveness,
          pomodoro_completed: pomodoroCount,
          sleep_hours: sleepHours,
          caffeine_intake: caffeineIntake,
          exercise_today: exerciseToday,
        }),
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

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
            <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("adhd.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("adhd.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-8 text-center dark:border-orange-800 dark:bg-orange-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-orange-400" />
          <p className="text-lg font-medium text-orange-700 dark:text-orange-300">
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
        <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
          <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("adhd.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("adhd.subtitle", lang)}</p>
        </div>
      </div>

      {/* Caffeine + Stimulant Warning */}
      {result?.hasStimulant && result.caffeineInteraction && (
        <div className="mb-6 rounded-xl border-2 border-amber-400 bg-amber-50 p-5 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-300">
                {tx("adhd.caffeineStimulant", lang)}
              </p>
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                {result.caffeineInteraction}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Log */}
      <div className="mb-6 space-y-5">
        {/* Focus Score */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-orange-700 dark:text-orange-300">
            <Brain className="h-5 w-5" />
            {tx("adhd.focusScore", lang)}: {focusScore}/10
          </h2>
          <input
            type="range"
            min={1}
            max={10}
            value={focusScore}
            onChange={(e) => setFocusScore(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{tx("adhd.cantFocus", lang)}</span>
            <span>{tx("adhd.laserFocused", lang)}</span>
          </div>
        </div>

        {/* Distractibility + Pomodoro */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-muted-foreground">
              {tx("adhd.distractionEvents", lang)}
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setDistractibility(Math.max(0, distractibility - 1))} className="rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-800">-</button>
              <span className="text-2xl font-bold text-orange-600">{distractibility}</span>
              <button onClick={() => setDistractibility(distractibility + 1)} className="rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-800">+</button>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-muted-foreground">
              <Timer className="mr-1 inline h-4 w-4" />
              {tx("adhd.pomodoro", lang)}
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setPomodoroCount(Math.max(0, pomodoroCount - 1))} className="rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-800">-</button>
              <span className="text-2xl font-bold text-orange-600">{pomodoroCount}</span>
              <button onClick={() => setPomodoroCount(pomodoroCount + 1)} className="rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-800">+</button>
            </div>
          </div>
        </div>

        {/* Medication Effectiveness */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            {tx("adhd.medEffectiveness", lang)}: {medEffectiveness}/5
          </h2>
          <input
            type="range"
            min={1}
            max={5}
            value={medEffectiveness}
            onChange={(e) => setMedEffectiveness(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Sleep, Caffeine, Exercise */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {tx("adhd.sleepHrs", lang)}
            </label>
            <input
              type="number"
              min={0}
              max={24}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-center text-lg font-bold"
            />
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              <Coffee className="mr-1 inline h-3 w-3" />
              {tx("adhd.caffeineCups", lang)}
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={caffeineIntake}
              onChange={(e) => setCaffeineIntake(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-center text-lg font-bold"
            />
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col items-center justify-center">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {tx("adhd.exercise", lang)}
            </label>
            <button
              onClick={() => setExerciseToday(!exerciseToday)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                exerciseToday ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {exerciseToday ? tx("common.yes", lang) : tx("common.no", lang)}
            </button>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="mb-6 w-full bg-orange-600 hover:bg-orange-700 text-white"
        size="lg"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("common.analyzing", lang)}</>
        ) : (
          <><Zap className="mr-2 h-5 w-5" />{tx("adhd.analyze", lang)}</>
        )}
      </Button>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Focus Analysis */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-orange-700 dark:text-orange-300">
              {tx("adhd.focusAnalysis", lang)}
            </h3>
            <p className="text-sm text-muted-foreground">{result.focusAnalysis}</p>
            {result.medicationEffectivenessAnalysis && (
              <p className="mt-2 text-sm text-muted-foreground">{result.medicationEffectivenessAnalysis}</p>
            )}
          </div>

          {/* Productivity Tips */}
          {result.productivityTips?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-orange-700 dark:text-orange-300">
                {tx("adhd.productivityTips", lang)}
              </h3>
              <ul className="space-y-2">
                {result.productivityTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Environment Tips */}
          {result.environmentTips?.length > 0 && (
            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-6 dark:bg-orange-950/20">
              <h3 className="mb-3 text-lg font-bold text-orange-700 dark:text-orange-300">
                {tx("adhd.environmentTips", lang)}
              </h3>
              <ul className="space-y-2">
                {result.environmentTips.map((tip, i) => (
                  <li key={i} className="text-sm text-orange-800 dark:text-orange-200">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Supplement Suggestions */}
          {result.supplementSuggestions?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-orange-700 dark:text-orange-300">
                {tx("common.supplementSuggestions", lang)}
              </h3>
              <div className="space-y-3">
                {result.supplementSuggestions.map((supp, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="font-semibold">{supp.name} — {supp.dose}</p>
                    <p className="text-xs text-muted-foreground">{supp.evidence}</p>
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{supp.safetyNote}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sleep & Exercise Impact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {result.sleepImpact && (
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h4 className="mb-1 text-sm font-semibold text-orange-700 dark:text-orange-300">
                  {tx("adhd.sleepImpact", lang)}
                </h4>
                <p className="text-xs text-muted-foreground">{result.sleepImpact}</p>
              </div>
            )}
            {result.exerciseImpact && (
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h4 className="mb-1 text-sm font-semibold text-orange-700 dark:text-orange-300">
                  {tx("adhd.exerciseImpact", lang)}
                </h4>
                <p className="text-xs text-muted-foreground">{result.exerciseImpact}</p>
              </div>
            )}
          </div>

          {/* Pomodoro Feedback */}
          {result.pomodoroFeedback && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:bg-orange-950/20">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <Timer className="mr-1 inline h-4 w-4" />
                {result.pomodoroFeedback}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
