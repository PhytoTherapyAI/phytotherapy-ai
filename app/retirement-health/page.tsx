// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Heart,
  Brain,
  Bone,
  Users,
  Dumbbell,
  Loader2,
  LogIn,
  Sparkles,
  Calendar,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface RetirementResult {
  checkupPlan: Array<{ test: string; frequency: string; urgency: string; notes: string }>;
  cognitiveBaseline: { activities: Array<{ name: string; frequency: string; benefit: string }>; warningSignsToWatch: string[] };
  boneDensity: { recommendation: string; frequency: string; riskFactors: string[] };
  socialActivityPlan: Array<{ activity: string; frequency: string; benefit: string }>;
  exerciseRecommendations: Array<{ type: string; frequency: string; duration: string; notes: string }>;
  medicationNotes: string;
}

const SCREENING_STATIC = {
  en: [
    { test: "Blood pressure", age: "55+", freq: "Every visit (at least annually)" },
    { test: "Cholesterol panel", age: "55+", freq: "Every 1-2 years" },
    { test: "Blood glucose / HbA1c", age: "55+", freq: "Every 3 years (annually if prediabetic)" },
    { test: "Colonoscopy", age: "45-75", freq: "Every 10 years (or FIT annually)" },
    { test: "Mammography (F)", age: "50-74", freq: "Every 2 years" },
    { test: "Bone density scan (DEXA)", age: "65+ (F), 70+ (M)", freq: "Every 2-3 years" },
    { test: "Eye exam (glaucoma, cataract)", age: "55+", freq: "Every 1-2 years" },
    { test: "Hearing test", age: "60+", freq: "Every 3 years" },
    { test: "Vitamin D level", age: "55+", freq: "Annually" },
    { test: "Thyroid function (TSH)", age: "60+", freq: "Every 5 years" },
  ],
  tr: [
    { test: "Tansiyon ölçümu", age: "55+", freq: "Her vizitte (en az yilda bir)" },
    { test: "Kolesterol paneli", age: "55+", freq: "1-2 yilda bir" },
    { test: "Kan sekeri / HbA1c", age: "55+", freq: "3 yilda bir (prediyabetse yillik)" },
    { test: "Kolonoskopi", age: "45-75", freq: "10 yilda bir (veya yillik GGK)" },
    { test: "Mamografi (K)", age: "50-74", freq: "2 yilda bir" },
    { test: "Kemik yogunlugu (DEXA)", age: "65+ (K), 70+ (E)", freq: "2-3 yilda bir" },
    { test: "Goz muayenesi (glokom, katarakt)", age: "55+", freq: "1-2 yilda bir" },
    { test: "Isitme testi", age: "60+", freq: "3 yilda bir" },
    { test: "D vitamini düzeyi", age: "55+", freq: "Yıllık" },
    { test: "Tiroid fonksiyonu (TSH)", age: "60+", freq: "5 yilda bir" },
  ],
};

export default function RetirementHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [age, setAge] = useState("60");
  const [gender, setGender] = useState("male");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RetirementResult | null>(null);

  const handleGenerate = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/retirement-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang, age, gender }),
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
          <h1 className="text-2xl font-bold">{tx("retirement.title", lang)}</h1>
          <p className="text-muted-foreground">{tx("common.loginToUse", lang)}</p>
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
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Heart className="w-4 h-4" />
            {tx("retirement.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("retirement.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("retirement.subtitle", lang)}</p>
        </div>

        {/* Input Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {tx("retirement.enterInfo", lang)}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{tx("common.age", lang)}</label>
              <input
                type="number"
                min="50"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{tx("common.gender", lang)}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="male">{tx("common.male", lang)}</option>
                <option value="female">{tx("common.female", lang)}</option>
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("common.generating", lang)}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{tx("retirement.generate", lang)}</>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Static Screening Checklist */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            {tx("retirement.screeningChecklist", lang)}
          </h2>
          <div className="grid gap-3">
            {SCREENING_STATIC[lang].map((item, i) => (
              <div key={i} className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.test}</div>
                  <div className="text-sm text-muted-foreground">{item.freq}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  {item.age}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Generated Results */}
        {result && (
          <div className="space-y-6">
            {/* Check-up Plan */}
            {result.checkupPlan?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  {tx("retirement.checkupPlan", lang)}
                </h2>
                <div className="grid gap-3">
                  {result.checkupPlan.map((item, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      item.urgency === "critical" ? "border-red-200 dark:border-red-800" :
                      item.urgency === "important" ? "border-amber-200 dark:border-amber-800" : "border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{item.test}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.urgency === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          item.urgency === "important" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>{item.frequency}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cognitive Activities */}
            {result.cognitiveBaseline && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  {tx("retirement.cognitiveActivities", lang)}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.cognitiveBaseline.activities.map((act, i) => (
                    <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 space-y-1">
                      <div className="font-medium">{act.name}</div>
                      <div className="text-sm text-muted-foreground">{act.frequency}</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">{act.benefit}</div>
                    </div>
                  ))}
                </div>
                {result.cognitiveBaseline.warningSignsToWatch?.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {tx("retirement.warningSigns", lang)}
                    </h3>
                    <ul className="space-y-1">
                      {result.cognitiveBaseline.warningSignsToWatch.map((sign, i) => (
                        <li key={i} className="text-sm text-muted-foreground">- {sign}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Exercise */}
            {result.exerciseRecommendations?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-green-500" />
                  {tx("common.exerciseRecs", lang)}
                </h2>
                <div className="grid gap-3">
                  {result.exerciseRecommendations.map((ex, i) => (
                    <div key={i} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <div className="font-medium">{ex.type}</div>
                      <div className="text-sm text-muted-foreground">{ex.frequency} — {ex.duration}</div>
                      <div className="text-sm mt-1">{ex.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Activity */}
            {result.socialActivityPlan?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  {tx("retirement.socialPlan", lang)}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.socialActivityPlan.map((act, i) => (
                    <div key={i} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-1">
                      <div className="font-medium">{act.activity}</div>
                      <div className="text-sm text-muted-foreground">{act.frequency}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">{act.benefit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medication Notes */}
            {result.medicationNotes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">{result.medicationNotes}</p>
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
