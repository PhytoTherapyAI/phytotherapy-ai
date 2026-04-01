// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  Utensils,
  Timer,
  Droplets,
  LogIn,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";

interface MedTiming {
  medication: string;
  requirement: string;
  currentTiming: string;
  adjustment: string;
  severity: "safe" | "caution" | "critical";
  warning: string;
}

interface FastingResult {
  fastingPlan: {
    protocol: string;
    eatingWindow: string;
    fastingHours: number;
    eatingHours: number;
    description: string;
  };
  medicationTimingAdjustments: MedTiming[];
  safetyWarnings: string[];
  ramadanNotes: string | null;
  hydrationPlan: string;
  breakfastSuggestions: string[];
  disclaimer: string;
}

const PROTOCOLS = [
  { value: "16_8", label: "fasting.16_8" },
  { value: "20_4", label: "fasting.20_4" },
  { value: "5_2", label: "fasting.5_2" },
  { value: "eat_stop_eat", label: "fasting.eat_stop_eat" },
];

const SEVERITY_COLORS = {
  safe: "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20",
  caution: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20",
  critical: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20",
};

export default function IntermittentFastingPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [protocol, setProtocol] = useState("16_8");
  const [windowStart, setWindowStart] = useState("12:00");
  const [windowEnd, setWindowEnd] = useState("20:00");
  const [ramadanMode, setRamadanMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FastingResult | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Determine if currently in eating window
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes =
    parseInt(windowStart.split(":")[0]) * 60 + parseInt(windowStart.split(":")[1]);
  const endMinutes =
    parseInt(windowEnd.split(":")[0]) * 60 + parseInt(windowEnd.split(":")[1]);
  const isEating =
    startMinutes < endMinutes
      ? nowMinutes >= startMinutes && nowMinutes < endMinutes
      : nowMinutes >= startMinutes || nowMinutes < endMinutes;

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

      const res = await fetch("/api/intermittent-fasting", {
        method: "POST",
        headers,
        body: JSON.stringify({
          protocol,
          eating_window_start: windowStart,
          eating_window_end: windowEnd,
          ramadan_mode: ramadanMode,
          lang,
        }),
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
          <Timer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("fasting.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("fasting.subtitle", lang)}
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <LogIn className="mr-1 inline h-3.5 w-3.5" />
          {tx("fasting.loginNote", lang)}{" "}
          <Link href="/auth/login" className="font-semibold underline">
            {tx("bt.createAccount", lang)}
          </Link>
        </div>
      )}

      {!result && (
        <div className="space-y-4">
          {/* Protocol Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              {tx("fasting.protocol", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROTOCOLS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProtocol(p.value)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    protocol === p.value
                      ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-400"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {tx(p.label, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Eating Window */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              {tx("fasting.eatingWindow", lang)}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  {tx("fasting.windowStart", lang)}
                </p>
                <input
                  type="time"
                  value={windowStart}
                  onChange={(e) => setWindowStart(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  {tx("fasting.windowEnd", lang)}
                </p>
                <input
                  type="time"
                  value={windowEnd}
                  onChange={(e) => setWindowEnd(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Fasting Timer */}
          <div className={`rounded-lg border p-4 text-center ${
            isEating
              ? "border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20"
              : "border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20"
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {isEating ? (
                <Utensils className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
              <span className={`text-lg font-bold ${
                isEating ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"
              }`}>
                {isEating
                  ? tx("fasting.eatingNow", lang)
                  : tx("fasting.fastingNow", lang)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {tx("fasting.eatingWindow", lang)}: {windowStart} - {windowEnd}
            </p>
          </div>

          {/* Ramadan Mode */}
          <button
            onClick={() => setRamadanMode(!ramadanMode)}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-colors ${
              ramadanMode
                ? "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/20"
                : "hover:bg-muted/50"
            }`}
          >
            <Moon className={`h-5 w-5 ${ramadanMode ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium">
              {tx("fasting.ramadanMode", lang)}
            </span>
            <div className={`ml-auto h-5 w-9 rounded-full transition-colors ${
              ramadanMode ? "bg-amber-500" : "bg-muted"
            }`}>
              <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                ramadanMode ? "translate-x-4" : "translate-x-0"
              }`} />
            </div>
          </button>

          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Timer className="h-4 w-4" />
            )}
            {tx("fasting.analyze", lang)}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/20 dark:text-red-300">
          <AlertTriangle className="mr-1 inline h-4 w-4" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Fasting Plan */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Timer className="h-4 w-4 text-amber-500" />
              {tx("fasting.protocol", lang)}
            </h3>
            <p className="text-sm">{result.fastingPlan.description}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded bg-muted/30 p-2 text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {result.fastingPlan.fastingHours}h
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx("fasting.fastingLabel", lang)}
                </p>
              </div>
              <div className="rounded bg-muted/30 p-2 text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {result.fastingPlan.eatingHours}h
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx("fasting.eatingLabel", lang)}
                </p>
              </div>
            </div>
          </div>

          {/* Medication Timing — CRITICAL */}
          {result.medicationTimingAdjustments?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                {tx("fasting.medTiming", lang)}
              </h3>
              {result.medicationTimingAdjustments.map((med, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-3 ${SEVERITY_COLORS[med.severity]}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{med.medication}</span>
                    {med.severity === "critical" && (
                      <span className="rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-900 dark:text-red-300">
                        {tx("fasting.criticalBadge", lang)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {med.requirement}
                  </p>
                  <p className="text-sm">{med.adjustment}</p>
                  {med.warning && (
                    <p className="text-xs mt-1 font-medium text-red-700 dark:text-red-400">
                      {med.warning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Safety Warnings */}
          {result.safetyWarnings?.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/20">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                {tx("fasting.safetyWarnings", lang)}
              </h3>
              <ul className="space-y-1.5">
                {result.safetyWarnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <span className="mt-0.5">&#8226;</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ramadan Notes */}
          {result.ramadanNotes && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-amber-500" />
                {tx("fasting.ramadanMode", lang)}
              </h3>
              <p className="text-sm">{result.ramadanNotes}</p>
            </div>
          )}

          {/* Hydration */}
          {result.hydrationPlan && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-cyan-500" />
                {tx("fasting.hydrationPlan", lang)}
              </h3>
              <p className="text-sm">{result.hydrationPlan}</p>
            </div>
          )}

          {/* Breaking Fast Suggestions */}
          {result.breakfastSuggestions?.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Utensils className="h-4 w-4 text-green-500" />
                {tx("fasting.breakFastSuggestions", lang)}
              </h3>
              <ul className="space-y-1.5">
                {result.breakfastSuggestions.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">&#8226;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setResult(null)}
          >
            {tx("fasting.updatePlan", lang)}
          </Button>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
