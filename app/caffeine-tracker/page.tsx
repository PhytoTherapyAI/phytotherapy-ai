// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Coffee,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Moon,
  Minus,
  Plus,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";

interface MedAlert {
  medication: string;
  severity: "safe" | "caution" | "dangerous";
  interaction: string;
  recommendation: string;
}

interface CaffeineResult {
  dailyTotal: number;
  safeLimit: number;
  riskLevel: "safe" | "moderate" | "high";
  halfLifeEstimate: string;
  sleepImpact: string;
  medicationAlerts: MedAlert[];
  recommendations: string[];
  breakdown: Array<{ drink: string; quantity: number; mg: number }>;
}

const DRINKS = [
  { key: "coffee", icon: "☕", mgPer: 95 },
  { key: "tea", icon: "🍵", mgPer: 47 },
  { key: "cola", icon: "🥤", mgPer: 34 },
  { key: "energy_drink", icon: "⚡", mgPer: 160 },
  { key: "pre_workout", icon: "💪", mgPer: 200 },
  { key: "chocolate", icon: "🍫", mgPer: 23 },
];

const DRINK_LABELS: Record<string, { en: string; tr: string }> = {
  coffee: { en: "Coffee", tr: "Kahve" },
  tea: { en: "Tea", tr: "Çay" },
  cola: { en: "Cola", tr: "Kola" },
  energy_drink: { en: "Energy Drink", tr: "Enerji İçeceği" },
  pre_workout: { en: "Pre-Workout", tr: "Pre-Workout" },
  chocolate: { en: "Dark Chocolate", tr: "Bitter Çikolata" },
};

const SEVERITY_COLORS = {
  safe: "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20",
  caution: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20",
  dangerous: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20",
};

export default function CaffeineTrackerPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [drinks, setDrinks] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaffeineResult | null>(null);

  const updateDrink = (key: string, delta: number) => {
    setDrinks((prev) => {
      const val = Math.max(0, (prev[key] || 0) + delta);
      if (val === 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: val };
    });
  };

  const totalMg = Object.entries(drinks).reduce((sum, [key, qty]) => {
    const d = DRINKS.find((dr) => dr.key === key);
    return sum + (d ? d.mgPer * qty : 0);
  }, 0);

  const meterPercent = Math.min((totalMg / 400) * 100, 100);
  const meterColor =
    totalMg < 200 ? "bg-green-500" : totalMg < 400 ? "bg-amber-500" : "bg-red-500";

  const handleAnalyze = async () => {
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

      const res = await fetch("/api/caffeine-tracker", {
        method: "POST",
        headers,
        body: JSON.stringify({ drinks, lang }),
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

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
          <Coffee className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("caffeine.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("caffeine.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <LogIn className="mr-1 inline h-3.5 w-3.5" />
          {tx("caffeine.loginNote", lang)}{" "}
          <Link href="/auth/login" className="font-semibold underline">
            {tx("bt.createAccount", lang)}
          </Link>
        </div>
      )}

      {!result && (
        <>
          {/* Drink Selector */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DRINKS.map((d) => {
              const qty = drinks[d.key] || 0;
              const label = DRINK_LABELS[d.key];
              return (
                <div
                  key={d.key}
                  className={`rounded-lg border p-3 transition-colors ${
                    qty > 0
                      ? "border-amber-400 bg-amber-50/50 dark:border-amber-600 dark:bg-amber-950/20"
                      : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="text-center mb-2">
                    <span className="text-2xl">{d.icon}</span>
                    <p className="text-xs font-medium mt-1">
                      {label[lang]}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ~{d.mgPer}mg
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateDrink(d.key, -1)}
                      className="rounded-full border p-1 hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateDrink(d.key, 1)}
                      className="rounded-full border p-1 hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Caffeine Meter */}
          {totalMg > 0 && (
            <div className="mb-6 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{tx("caffeine.daily", lang)}</p>
                <p className="text-sm text-muted-foreground">
                  {tx("caffeine.safeZone", lang)}
                </p>
              </div>
              <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${meterColor}`}
                  style={{ width: `${meterPercent}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xl font-bold">
                {totalMg}mg
              </p>
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={totalMg === 0 || isLoading}
            className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Coffee className="h-4 w-4" />
            )}
            {tx("caffeine.analyze", lang)}
          </Button>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/20 dark:text-red-300">
          <AlertTriangle className="mr-1 inline h-4 w-4" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Risk Level */}
          <div
            className={`rounded-lg border p-4 ${
              result.riskLevel === "safe"
                ? SEVERITY_COLORS.safe
                : result.riskLevel === "moderate"
                ? SEVERITY_COLORS.caution
                : SEVERITY_COLORS.dangerous
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.riskLevel === "safe" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : result.riskLevel === "moderate" ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <span className="text-lg font-bold">{result.dailyTotal}mg</span>
              <span className="text-sm text-muted-foreground">
                / {result.safeLimit}mg
              </span>
            </div>
          </div>

          {/* Half Life */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {tx("caffeine.halfLife", lang)}
            </p>
            <p className="text-sm">{result.halfLifeEstimate}</p>
          </div>

          {/* Sleep Impact */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Moon className="h-3.5 w-3.5" />
              {tx("caffeine.sleepImpact", lang)}
            </p>
            <p className="text-sm">{result.sleepImpact}</p>
          </div>

          {/* Medication Alerts */}
          {result.medicationAlerts?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                {tx("caffeine.medAlerts", lang)}
              </h3>
              {result.medicationAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-3 ${SEVERITY_COLORS[alert.severity]}`}
                >
                  <p className="text-sm font-semibold">{alert.medication}</p>
                  <p className="text-sm mt-1">{alert.interaction}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {tx("caffeine.recommendations", lang)}
              </p>
              <ul className="space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">&#8226;</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New Check */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setResult(null);
              setDrinks({});
            }}
          >
            {tx("caffeineTracker.newCheck", lang)}
          </Button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
