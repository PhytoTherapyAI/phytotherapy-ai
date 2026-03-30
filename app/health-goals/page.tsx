"use client";

import { useState } from "react";
import {
  Target,
  Loader2,
  Utensils,
  Dumbbell,
  Pill,
  Moon,
  ClipboardCheck,
  AlertTriangle,
  Flag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Milestone {
  week: number;
  target: string;
  metric: string;
}

interface SupplementRec {
  name: string;
  dosage: string;
  reason: string;
  safetyNote: string;
}

interface GoalResult {
  goalTitle: string;
  timeframe: string;
  milestones: Milestone[];
  weeklyPlan: {
    nutrition: string[];
    exercise: string[];
    supplements: SupplementRec[];
    lifestyle: string[];
    tracking: string[];
  };
  warnings: string[];
  motivationalNote: string;
}

const GOAL_PRESETS = [
  { en: "Lower cholesterol in 3 months", tr: "3 ayda kolesterolü düşür" },
  { en: "Improve sleep quality", tr: "Uyku kalitesini artır" },
  { en: "Lose 5kg in 2 months", tr: "2 ayda 5 kilo ver" },
  { en: "Reduce stress and anxiety", tr: "Stres ve kaygıyı azalt" },
  { en: "Boost energy levels", tr: "Enerji seviyesini artır" },
  { en: "Strengthen immune system", tr: "Bağışıklık sistemini güçlendir" },
];

const TIMEFRAMES = [
  { value: "1 month", labelEn: "1 Month", labelTr: "1 Ay" },
  { value: "2 months", labelEn: "2 Months", labelTr: "2 Ay" },
  { value: "3 months", labelEn: "3 Months", labelTr: "3 Ay" },
  { value: "6 months", labelEn: "6 Months", labelTr: "6 Ay" },
];

const SECTION_CONFIG = {
  nutrition: { icon: Utensils, color: "text-green-600 dark:text-green-400" },
  exercise: { icon: Dumbbell, color: "text-blue-600 dark:text-blue-400" },
  supplements: { icon: Pill, color: "text-purple-600 dark:text-purple-400" },
  lifestyle: { icon: Moon, color: "text-indigo-600 dark:text-indigo-400" },
  tracking: { icon: ClipboardCheck, color: "text-teal-600 dark:text-teal-400" },
};

export default function HealthGoalsPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("3 months");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GoalResult | null>(null);

  const l = lang as "en" | "tr";

  const handleGenerate = async () => {
    if (!goal.trim()) return;
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

      const res = await fetch("/api/health-goals", {
        method: "POST",
        headers,
        body: JSON.stringify({ goal: goal.trim(), timeframe, lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
          <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("goals.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("goals.subtitle", lang)}
          </p>
        </div>
      </div>

      {!result && (
        <>
          {/* Goal Presets */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {tx("goals.popularGoals", lang)}
            </p>
            <div className="flex flex-wrap gap-2">
              {GOAL_PRESETS.map((preset) => (
                <button
                  key={preset.en}
                  onClick={() => setGoal(preset[l])}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    goal === preset[l]
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950"
                      : "hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  }`}
                >
                  {preset[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("goals.describeGoal", lang)}
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={tx("goals.placeholder", lang)}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* Timeframe */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              {tx("goals.timeframe", lang)}
            </label>
            <div className="flex gap-2">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    timeframe === tf.value
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950"
                      : "hover:border-emerald-300"
                  }`}
                >
                  {lang === "tr" ? tf.labelTr : tf.labelEn}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || goal.trim().length < 5}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("goals.generating", lang)}
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                {tx("goals.generateBtn", lang)}
              </>
            )}
          </Button>
        </>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Goal Header */}
          <div className="rounded-xl border bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold">{result.goalTitle}</h2>
            </div>
            <p className="text-xs text-muted-foreground">{tx("goals.timeframe", lang)}: {result.timeframe}</p>
          </div>

          {/* Milestones */}
          {result.milestones && result.milestones.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Flag className="h-4 w-4 text-emerald-600" />
                {tx("goals.milestones", lang)}
              </h3>
              <div className="relative space-y-3 pl-4 before:absolute before:left-[7px] before:top-1 before:h-[calc(100%-8px)] before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-800">
                {result.milestones.map((ms, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-emerald-400 bg-background" />
                    <div className="ml-2">
                      <p className="text-xs font-bold text-emerald-600">
                        {tx("goals.week", lang)} {ms.week}
                      </p>
                      <p className="text-sm">{ms.target}</p>
                      <p className="text-[10px] text-muted-foreground">{ms.metric}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Plan Sections */}
          {(["nutrition", "exercise", "lifestyle", "tracking"] as const).map((section) => {
            const items = result.weeklyPlan[section];
            if (!items || items.length === 0) return null;
            const config = SECTION_CONFIG[section];
            const Icon = config.icon;
            return (
              <div key={section} className="rounded-lg border p-4">
                <h3 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${config.color}`}>
                  <Icon className="h-4 w-4" />
                  {tx(`goals.${section}`, lang)}
                </h3>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Supplements Section */}
          {result.weeklyPlan.supplements && result.weeklyPlan.supplements.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
                <Pill className="h-4 w-4" />
                {tx("goals.supplements", lang)}
              </h3>
              <div className="space-y-2">
                {result.weeklyPlan.supplements.map((sup, i) => (
                  <div key={i} className="rounded-lg bg-purple-50/50 p-2 dark:bg-purple-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{sup.name}</span>
                      <span className="text-[10px] text-muted-foreground">{sup.dosage}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{sup.reason}</p>
                    {sup.safetyNote && (
                      <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                        ⚠️ {sup.safetyNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {tx("goals.warnings", lang)}
              </h3>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-amber-600 dark:text-amber-300">
                    • {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Motivational Note */}
          {result.motivationalNote && (
            <div className="rounded-xl border bg-primary/5 p-4 text-center">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-sm italic">{result.motivationalNote}</p>
            </div>
          )}

          {/* New Goal */}
          <Button
            variant="outline"
            onClick={() => { setResult(null); setGoal(""); }}
            className="w-full"
          >
            {tx("goals.newGoal", lang)}
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
