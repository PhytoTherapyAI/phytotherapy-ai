// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Wine,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Minus,
  Plus,
  Heart,
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
  mechanism: string;
  recommendation: string;
}

interface AlcoholResult {
  weeklyUnits: number;
  WHOLimit: { male: number; female: number };
  riskLevel: "low" | "moderate" | "high" | "very_high";
  medicationAlerts: MedAlert[];
  liverEnzymeCorrelation: string;
  liverHealthTips: string[];
  recommendations: string[];
  disclaimer: string;
}

const DRINKS = [
  { key: "beer", icon: "🍺", unitsLabel: "1.5 units" },
  { key: "wine", icon: "🍷", unitsLabel: "2.1 units" },
  { key: "spirits", icon: "🥃", unitsLabel: "1.0 unit" },
  { key: "cocktail", icon: "🍹", unitsLabel: "2.0 units" },
];

const DRINK_LABELS: Record<string, { en: string; tr: string }> = {
  beer: { en: "Beer (330ml)", tr: "Bira (330ml)" },
  wine: { en: "Wine (150ml)", tr: "Şarap (150ml)" },
  spirits: { en: "Spirits (40ml)", tr: "Sert İçki (40ml)" },
  cocktail: { en: "Cocktail", tr: "Kokteyl" },
};

const UNITS_PER: Record<string, number> = {
  beer: 1.5,
  wine: 2.1,
  spirits: 1.0,
  cocktail: 2.0,
};

const SEVERITY_COLORS = {
  safe: "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20",
  caution: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20",
  dangerous: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20",
};

const RISK_COLORS = {
  low: { bg: "bg-green-500", text: "text-green-700 dark:text-green-400" },
  moderate: { bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  high: { bg: "bg-red-500", text: "text-red-700 dark:text-red-400" },
  very_high: { bg: "bg-red-700", text: "text-red-800 dark:text-red-300" },
};

export default function AlcoholTrackerPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [drinks, setDrinks] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AlcoholResult | null>(null);

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

  const totalUnits = Object.entries(drinks).reduce(
    (sum, [key, qty]) => sum + (UNITS_PER[key] || 0) * qty,
    0
  );

  const whoLimit = 14;
  const meterPercent = Math.min((totalUnits / whoLimit) * 100, 100);
  const meterColor =
    totalUnits < 7 ? "bg-green-500" : totalUnits < 14 ? "bg-amber-500" : "bg-red-500";

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

      const res = await fetch("/api/alcohol-tracker", {
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
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
          <Wine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("alcohol.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("alcohol.subtitle", lang)}
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <LogIn className="mr-1 inline h-3.5 w-3.5" />
          {tx("alcohol.loginNote", lang)}{" "}
          <Link href="/auth/login" className="font-semibold underline">
            {tx("bt.createAccount", lang)}
          </Link>
        </div>
      )}

      {!result && (
        <>
          {/* Drink Selector */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {DRINKS.map((d) => {
              const qty = drinks[d.key] || 0;
              const label = DRINK_LABELS[d.key];
              return (
                <div
                  key={d.key}
                  className={`rounded-lg border p-4 transition-colors ${
                    qty > 0
                      ? "border-purple-400 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="text-center mb-2">
                    <span className="text-3xl">{d.icon}</span>
                    <p className="text-sm font-medium mt-1">
                      {label[lang]}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ~{d.unitsLabel}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => updateDrink(d.key, -1)}
                      className="rounded-full border p-1.5 hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-lg font-bold">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateDrink(d.key, 1)}
                      className="rounded-full border p-1.5 hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Units Meter */}
          {totalUnits > 0 && (
            <div className="mb-6 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  {tx("alcohol.weeklyUnits", lang)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tx("alcohol.whoLimit", lang)}: {whoLimit}
                </p>
              </div>
              <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${meterColor}`}
                  style={{ width: `${meterPercent}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xl font-bold">
                {totalUnits.toFixed(1)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {tx("alcohol.units", lang)}
                </span>
              </p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={totalUnits === 0 || isLoading}
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wine className="h-4 w-4" />
            )}
            {tx("alcohol.analyze", lang)}
          </Button>
        </>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/20 dark:text-red-300">
          <AlertTriangle className="mr-1 inline h-4 w-4" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Risk Level */}
          <div className={`rounded-lg border p-4 ${
            result.riskLevel === "low" ? SEVERITY_COLORS.safe
            : result.riskLevel === "moderate" ? SEVERITY_COLORS.caution
            : SEVERITY_COLORS.dangerous
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {result.riskLevel === "low" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <ShieldAlert className={`h-5 w-5 ${RISK_COLORS[result.riskLevel].text}`} />
              )}
              <span className="text-lg font-bold">
                {result.weeklyUnits} {tx("alcohol.unitsPerWeek", lang)}
              </span>
            </div>
            <p className={`text-sm font-medium ${RISK_COLORS[result.riskLevel].text}`}>
              {tx("alcohol.riskLevel", lang)}: {result.riskLevel.replace("_", " ").toUpperCase()}
            </p>
          </div>

          {/* Medication Alerts */}
          {result.medicationAlerts?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                {tx("alcohol.medAlerts", lang)}
              </h3>
              {result.medicationAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-3 ${SEVERITY_COLORS[alert.severity]}`}
                >
                  <p className="text-sm font-semibold">{alert.medication}</p>
                  <p className="text-sm mt-1">{alert.interaction}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {alert.mechanism}
                  </p>
                  <p className="text-xs mt-1 font-medium">{alert.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Liver */}
          {result.liverEnzymeCorrelation && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {tx("alcohol.liverTips", lang)}
              </p>
              <p className="text-sm mb-2">{result.liverEnzymeCorrelation}</p>
              {result.liverHealthTips?.length > 0 && (
                <ul className="space-y-1">
                  {result.liverHealthTips.map((tip, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">&#8226;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <ul className="space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#8226;</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => { setResult(null); setDrinks({}); }}
          >
            {tx("alcohol.newCheck", lang)}
          </Button>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
