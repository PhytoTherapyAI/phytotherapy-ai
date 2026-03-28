"use client";

import { useState } from "react";
import {
  Moon,
  Sun,
  Coffee,
  Pill,
  Utensils,
  Dumbbell,
  AlertTriangle,
  Loader2,
  LogIn,
  Sparkles,
  Lightbulb,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ShiftResult {
  circadianPlan: { sleepWindow: string; darkPeriod: string; lightExposure: string; notes: string };
  sleepSchedule: { mainSleep: string; napWindow: string; tips: string[] };
  mealTiming: Array<{ meal: string; timing: string; recommendation: string }>;
  caffeinePlan: { lastCaffeine: string; maxDaily: string; strategy: string };
  supplementSuggestions: Array<{ name: string; timing: string; dose: string; reason: string; safety: string }>;
  medicationTiming: Array<{ medication: string; adjustedTiming: string; notes: string }>;
  exerciseRecommendations: { bestTime: string; avoid: string; types: string[] };
  warningSignsOfBurnout: string[];
  generalTips: string[];
}

const SHIFT_PATTERNS = [
  { value: "night", en: "Night Shift (e.g. 22:00-06:00)", tr: "Gece Vardiyasi (orn. 22:00-06:00)" },
  { value: "rotating", en: "Rotating Shifts", tr: "Rotasyonlu Vardiya" },
  { value: "early", en: "Early Morning (e.g. 05:00-13:00)", tr: "Erken Sabah (orn. 05:00-13:00)" },
  { value: "evening", en: "Evening Shift (e.g. 14:00-22:00)", tr: "Aksam Vardiyasi (orn. 14:00-22:00)" },
  { value: "12h_day", en: "12-Hour Day (07:00-19:00)", tr: "12 Saat Gunduz (07:00-19:00)" },
  { value: "12h_night", en: "12-Hour Night (19:00-07:00)", tr: "12 Saat Gece (19:00-07:00)" },
];

export default function ShiftWorkerPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [shiftPattern, setShiftPattern] = useState("night");
  const [shiftHours, setShiftHours] = useState("22:00-06:00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShiftResult | null>(null);

  const handleGenerate = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shift-worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang, shift_pattern: shiftPattern, shift_hours: shiftHours }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate plan");
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("shift.title", lang)}</h1>
          <p className="text-muted-foreground">{lang === "tr" ? "Bu araci kullanmak için giris yapin" : "Please log in to use this tool"}</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            <LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Moon className="w-4 h-4" />
            {tx("shift.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("shift.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("shift.subtitle", lang)}</p>
        </div>

        {/* Input Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{tx("shift.pattern", lang)}</label>
              <select
                value={shiftPattern}
                onChange={(e) => setShiftPattern(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SHIFT_PATTERNS.map((p) => (
                  <option key={p.value} value={p.value}>{p[lang]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{lang === "tr" ? "Vardiya Saatleri" : "Shift Hours"}</label>
              <input
                type="text"
                value={shiftHours}
                onChange={(e) => setShiftHours(e.target.value)}
                placeholder="22:00-06:00"
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{lang === "tr" ? "Plan oluşturuluyor..." : "Generating plan..."}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{tx("shift.generate", lang)}</>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Circadian Plan */}
            {result.circadianPlan && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  {lang === "tr" ? "Sirkadyen Ritim Plani" : "Circadian Rhythm Plan"}
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Uyku Penceresi" : "Sleep Window"}</div>
                    <div className="font-medium">{result.circadianPlan.sleepWindow}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Karanlik Dönemi" : "Dark Period"}</div>
                    <div className="font-medium">{result.circadianPlan.darkPeriod}</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Isik Maruziyeti" : "Light Exposure"}</div>
                    <div className="font-medium">{result.circadianPlan.lightExposure}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{result.circadianPlan.notes}</p>
              </div>
            )}

            {/* Sleep Schedule */}
            {result.sleepSchedule && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  {lang === "tr" ? "Uyku Programı" : "Sleep Schedule"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Ana Uyku" : "Main Sleep"}</div>
                    <div className="font-medium">{result.sleepSchedule.mainSleep}</div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Sekerleme" : "Nap Window"}</div>
                    <div className="font-medium">{result.sleepSchedule.napWindow}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {result.sleepSchedule.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal Timing */}
            {result.mealTiming?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  {lang === "tr" ? "Yemek Zamanlama" : "Meal Timing"}
                </h2>
                <div className="grid gap-3">
                  {result.mealTiming.map((meal, i) => (
                    <div key={i} className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{meal.meal}</span>
                        <span className="text-sm text-orange-600 dark:text-orange-400">{meal.timing}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{meal.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caffeine Plan */}
            {result.caffeinePlan && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-700" />
                  {lang === "tr" ? "Kafein Stratejisi" : "Caffeine Strategy"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Son Kafein" : "Last Caffeine"}</div>
                    <div className="font-medium">{result.caffeinePlan.lastCaffeine}</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Günlük Max" : "Daily Max"}</div>
                    <div className="font-medium">{result.caffeinePlan.maxDaily}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{result.caffeinePlan.strategy}</p>
              </div>
            )}

            {/* Supplements */}
            {result.supplementSuggestions?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Pill className="w-5 h-5 text-green-500" />
                  {lang === "tr" ? "Takviye Önerileri" : "Supplement Suggestions"}
                </h2>
                <div className="grid gap-3">
                  {result.supplementSuggestions.map((supp, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      supp.safety === "green" ? "border-green-200 dark:border-green-800" : "border-yellow-200 dark:border-yellow-800"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{supp.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          supp.safety === "green" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>{supp.dose}</span>
                      </div>
                      <p className="text-sm"><span className="text-muted-foreground">{lang === "tr" ? "Zamanlama:" : "Timing:"}</span> {supp.timing}</p>
                      <p className="text-sm text-muted-foreground">{supp.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise */}
            {result.exerciseRecommendations && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-green-500" />
                  {lang === "tr" ? "Egzersiz Önerileri" : "Exercise Recommendations"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "En Iyi Zaman" : "Best Time"}</div>
                    <div className="font-medium">{result.exerciseRecommendations.bestTime}</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Kacinilmasi Gereken" : "Avoid"}</div>
                    <div className="font-medium">{result.exerciseRecommendations.avoid}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.exerciseRecommendations.types.map((type, i) => (
                    <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Burnout Warning Signs */}
            {result.warningSignsOfBurnout?.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  {lang === "tr" ? "Tukenmislik Uyarı Isaretleri" : "Burnout Warning Signs"}
                </h2>
                {result.warningSignsOfBurnout.map((sign, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {sign}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
