// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UtensilsCrossed,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Leaf,
  Plus,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";

// ── Types ──────────────────────────────────────

interface NutritionRecord {
  id: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  key_nutrients: Array<{ name: string; amount: string }>;
  food_drug_alerts: string[];
  created_at: string;
}

interface FoodDrugAlert {
  food: string;
  medication: string;
  severity: "red" | "yellow";
  explanation: string;
}

interface AnalysisResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  key_nutrients: Array<{ name: string; amount: string }>;
  food_drug_alerts: FoodDrugAlert[];
  summary: string;
}

// ── Constants ──────────────────────────────────

const MEAL_TABS = [
  { key: "breakfast" as const, icon: Coffee, colorClass: "text-amber-600 dark:text-amber-400" },
  { key: "lunch" as const, icon: Sun, colorClass: "text-orange-600 dark:text-orange-400" },
  { key: "dinner" as const, icon: Moon, colorClass: "text-indigo-600 dark:text-indigo-400" },
  { key: "snack" as const, icon: Cookie, colorClass: "text-pink-600 dark:text-pink-400" },
];

const MEAL_TYPE_LABELS: Record<string, { en: string; tr: string }> = {
  breakfast: { en: "Breakfast", tr: "Kahvaltı" },
  lunch: { en: "Lunch", tr: "Öğle" },
  dinner: { en: "Dinner", tr: "Akşam" },
  snack: { en: "Snack", tr: "Atıştırmalık" },
};

// ── Macro progress bar config ──

const DAILY_TARGETS = {
  calories: 2000,
  protein: 60,
  carbs: 250,
  fat: 65,
  fiber: 30,
};

// ── Page Component ─────────────────────────────

export default function NutritionLogPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [records, setRecords] = useState<NutritionRecord[]>([]);

  // ── Fetch existing records ──

  const fetchRecords = useCallback(async () => {
    if (!session?.access_token) return;
    setIsFetching(true);
    try {
      const res = await fetch("/api/nutrition-log", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch {
      // silent fail
    } finally {
      setIsFetching(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (isAuthenticated && session?.access_token) {
      fetchRecords();
    }
  }, [isAuthenticated, session?.access_token, fetchRecords]);

  // ── Submit meal ──

  const handleSubmit = async () => {
    if (!description.trim() || !session?.access_token) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLastAnalysis(null);

    try {
      const res = await fetch("/api/nutrition-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          meal_type: mealType,
          description: description.trim(),
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to log meal");
      }

      const data = await res.json();
      setLastAnalysis(data.analysis);
      setSuccess(tx("nut.saved", lang));
      setDescription("");
      // Refresh records
      fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Today's records ──

  const today = new Date().toISOString().split("T")[0];
  const todaysRecords = records.filter((r) => r.date === today);

  const todayTotals = todaysRecords.reduce(
    (acc, r) => ({
      calories: acc.calories + (r.calories || 0),
      protein: acc.protein + (r.protein || 0),
      carbs: acc.carbs + (r.carbs || 0),
      fat: acc.fat + (r.fat || 0),
      fiber: acc.fiber + (r.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // ── Unauthenticated state ──

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lime-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <UtensilsCrossed className="w-16 h-16 mx-auto text-lime-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {tx("nut.title", lang)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {tx("nut.loginRequired", lang)}
          </p>
          <Link href="/auth/login">
            <Button className="bg-lime-600 hover:bg-lime-700 text-white">
              {tx("nav.login", lang)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-100 dark:bg-lime-900/30 mb-3">
            <UtensilsCrossed className="w-7 h-7 text-lime-600 dark:text-lime-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tx("nut.title", lang)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {tx("nut.subtitle", lang)}
          </p>
        </div>

        {/* ── Meal Type Tabs ── */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {MEAL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = mealType === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setMealType(tab.key)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium
                  ${isActive
                    ? "border-lime-500 bg-lime-50 dark:bg-lime-900/20 dark:border-lime-500 text-lime-700 dark:text-lime-300"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-lime-300 dark:hover:border-lime-700"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-lime-600 dark:text-lime-400" : tab.colorClass}`} />
                <span>{tx(`nut.${tab.key}`, lang)}</span>
              </button>
            );
          })}
        </div>

        {/* ── Meal Input ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {tx("nut.describeMeal", lang)}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={tx("nut.placeholder", lang)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none text-sm"
          />

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !description.trim()}
            className="w-full mt-3 bg-lime-600 hover:bg-lime-700 text-white disabled:opacity-50 rounded-xl h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tx("nut.analyzing", lang)}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {tx("nut.logMeal", lang)}
              </>
            )}
          </Button>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-3 p-3 rounded-xl bg-lime-50 dark:bg-lime-950/30 border border-lime-200 dark:border-lime-800 text-lime-700 dark:text-lime-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}
        </div>

        {/* ── Last Analysis Result ── */}
        {lastAnalysis && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm animate-in fade-in-50 duration-300">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{lastAnalysis.summary}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx("nut.calories", lang)}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{Math.round(lastAnalysis.calories)} kcal</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
                <Beef className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx("nut.protein", lang)}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{Math.round(lastAnalysis.protein)}g</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                <Wheat className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx("nut.carbs", lang)}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{Math.round(lastAnalysis.carbs)}g</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/20">
                <Droplets className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx("nut.fat", lang)}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{Math.round(lastAnalysis.fat)}g</p>
                </div>
              </div>
            </div>

            {/* Food-Drug Alerts from analysis */}
            {lastAnalysis.food_drug_alerts && lastAnalysis.food_drug_alerts.length > 0 && (
              <div className="space-y-2">
                {lastAnalysis.food_drug_alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-start gap-2 text-sm ${
                      alert.severity === "red"
                        ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300"
                        : "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {tx("nut.foodDrugAlert", lang)}: {alert.food} + {alert.medication}
                      </p>
                      <p className="mt-0.5 opacity-90">{alert.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Today's Summary ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {tx("nut.todaysSummary", lang)}
            </h2>
          </div>

          {/* Calorie big number */}
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-lime-600 dark:text-lime-400">
              {todayTotals.calories}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              / {DAILY_TARGETS.calories} kcal
            </p>
          </div>

          {/* Macro bars */}
          <div className="space-y-3">
            <MacroBar
              label={tx("nut.protein", lang)}
              value={todayTotals.protein}
              target={DAILY_TARGETS.protein}
              unit="g"
              color="bg-red-500"
              bgColor="bg-red-100 dark:bg-red-950/30"
            />
            <MacroBar
              label={tx("nut.carbs", lang)}
              value={todayTotals.carbs}
              target={DAILY_TARGETS.carbs}
              unit="g"
              color="bg-amber-500"
              bgColor="bg-amber-100 dark:bg-amber-950/30"
            />
            <MacroBar
              label={tx("nut.fat", lang)}
              value={todayTotals.fat}
              target={DAILY_TARGETS.fat}
              unit="g"
              color="bg-yellow-500"
              bgColor="bg-yellow-100 dark:bg-yellow-950/30"
            />
            <MacroBar
              label={tx("nut.fiber", lang)}
              value={todayTotals.fiber}
              target={DAILY_TARGETS.fiber}
              unit="g"
              color="bg-green-500"
              bgColor="bg-green-100 dark:bg-green-950/30"
            />
          </div>
        </div>

        {/* ── Today's Meals List ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {tx("nut.todaysMeals", lang)}
            </h2>
          </div>

          {isFetching ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-lime-500 mx-auto" />
            </div>
          ) : todaysRecords.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              {tx("nut.noMealsYet", lang)}
            </p>
          ) : (
            <div className="space-y-3">
              {todaysRecords.map((record) => {
                const mealLabel = MEAL_TYPE_LABELS[record.meal_type]?.[lang] || record.meal_type;
                const tab = MEAL_TABS.find((t) => t.key === record.meal_type);
                const Icon = tab?.icon || UtensilsCrossed;

                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-lime-600 dark:text-lime-400 uppercase">
                          {mealLabel}
                        </span>
                        <span className="text-xs text-gray-400">
                          {record.calories} kcal
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-2">
                        {record.description}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                        <span>P: {Math.round(record.protein)}g</span>
                        <span>C: {Math.round(record.carbs)}g</span>
                        <span>F: {Math.round(record.fat)}g</span>
                      </div>

                      {/* Food-drug alerts from saved record */}
                      {record.food_drug_alerts && record.food_drug_alerts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {record.food_drug_alerts.map((alertText, i) => {
                            const isRed = alertText.startsWith("[RED]");
                            return (
                              <div
                                key={i}
                                className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${
                                  isRed
                                    ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                                    : "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                                }`}
                              >
                                <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                                <span className="line-clamp-2">{alertText}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6 px-4">
          {tx("disclaimer.tool", lang)}
        </p>
      </div>
    </div>
  );
}

// ── MacroBar Component ─────────────────────────

function MacroBar({
  label,
  value,
  target,
  unit,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  bgColor: string;
}) {
  const pct = Math.min((value / target) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {Math.round(value)}{unit} / {target}{unit}
        </span>
      </div>
      <div className={`h-2.5 rounded-full overflow-hidden ${bgColor}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
