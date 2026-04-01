// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Cigarette,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  Banknote,
  Lightbulb,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";

interface TimelineItem {
  time: string;
  benefit: string;
  achieved: boolean;
}

interface MedNote {
  medication: string;
  note: string;
  action: string;
}

interface SmokingResult {
  daysSinceQuit: number;
  healthRecoveryTimeline: TimelineItem[];
  savingsEstimate: {
    dailySavings: number;
    monthlySavings: number;
    yearlySavings: number;
    currency: string;
    totalSaved: number;
  };
  cravingManagementTips: string[];
  medicationNotes: MedNote[];
  nrtAdvice: string;
  motivationalMessage: string;
  disclaimer: string;
}

export default function SmokingCessationPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [quitDate, setQuitDate] = useState("");
  const [dailyCigs, setDailyCigs] = useState(20);
  const [status, setStatus] = useState("planning");
  const [nrt, setNrt] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmokingResult | null>(null);

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

      const res = await fetch("/api/smoking-cessation", {
        method: "POST",
        headers,
        body: JSON.stringify({
          quit_date: quitDate,
          daily_cigarettes_before: dailyCigs,
          current_status: status,
          nicotine_therapy: nrt,
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

  const statusOptions = [
    { value: "quit", label: tx("smoking.quit", lang) },
    { value: "reducing", label: tx("smoking.reducing", lang) },
    { value: "planning", label: tx("smoking.planning", lang) },
  ];

  const nrtOptions = [
    { value: "patch", label: tx("smoking.patch", lang) },
    { value: "gum", label: tx("smoking.gum", lang) },
    { value: "spray", label: tx("smoking.spray", lang) },
    { value: "none", label: tx("smoking.none", lang) },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
          <Cigarette className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("smoking.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("smoking.subtitle", lang)}
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <LogIn className="mr-1 inline h-3.5 w-3.5" />
          {tx("smoking.loginNote", lang)}{" "}
          <Link href="/auth/login" className="font-semibold underline">
            {tx("bt.createAccount", lang)}
          </Link>
        </div>
      )}

      {!result && (
        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              {tx("smoking.status", lang)}
            </label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    status === opt.value
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quit Date */}
          {(status === "quit" || status === "reducing") && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                {tx("smoking.quitDate", lang)}
              </label>
              <input
                type="date"
                value={quitDate}
                onChange={(e) => setQuitDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          )}

          {/* Daily Cigarettes */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              {tx("smoking.dailyCigs", lang)}
            </label>
            <input
              type="number"
              value={dailyCigs}
              onChange={(e) => setDailyCigs(Math.max(1, Number(e.target.value) || 1))}
              min={1}
              max={100}
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* NRT */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              {tx("smoking.nrt", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {nrtOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNrt(opt.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    nrt === opt.value
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {tx("smoking.analyze", lang)}
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
          {/* Motivational Message */}
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/20">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              {result.motivationalMessage}
            </p>
          </div>

          {/* Days Free + Savings */}
          {result.daysSinceQuit > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-card p-4 text-center">
                <Clock className="mx-auto h-5 w-5 text-emerald-500 mb-1" />
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {result.daysSinceQuit}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx("smoking.daysFree", lang)}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <Banknote className="mx-auto h-5 w-5 text-emerald-500 mb-1" />
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {result.savingsEstimate.totalSaved.toLocaleString()}{" "}
                  {result.savingsEstimate.currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx("smoking.savings", lang)}
                </p>
              </div>
            </div>
          )}

          {/* Savings Breakdown */}
          {result.savingsEstimate && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-emerald-500" />
                {tx("smoking.savingsCalc", lang)}
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">
                    {result.savingsEstimate.dailySavings} {result.savingsEstimate.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx("smoking.perDay", lang)}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {result.savingsEstimate.monthlySavings} {result.savingsEstimate.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx("smoking.perMonth", lang)}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {result.savingsEstimate.yearlySavings.toLocaleString()} {result.savingsEstimate.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx("smoking.perYear", lang)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Health Recovery Timeline */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-emerald-500" />
              {tx("smoking.timeline", lang)}
            </h3>
            <div className="space-y-3">
              {result.healthRecoveryTimeline?.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 ${
                    item.achieved
                      ? "bg-emerald-100 dark:bg-emerald-900"
                      : "bg-muted"
                  }`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${
                      item.achieved
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${
                      item.achieved
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}>
                      {item.time}
                    </p>
                    <p className={`text-sm ${
                      item.achieved ? "" : "text-muted-foreground"
                    }`}>
                      {item.benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Craving Tips */}
          {result.cravingManagementTips?.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                {tx("smoking.cravingTips", lang)}
              </h3>
              <ul className="space-y-1.5">
                {result.cravingManagementTips.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">&#8226;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medication Notes */}
          {result.medicationNotes?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                {tx("smoking.medInteractions", lang)}
              </h3>
              {result.medicationNotes.map((note, i) => (
                <div key={i} className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/20">
                  <p className="text-sm font-semibold">{note.medication}</p>
                  <p className="text-sm mt-1">{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {note.action}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* NRT Advice */}
          {result.nrtAdvice && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm">{result.nrtAdvice}</p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setResult(null)}
          >
            {tx("smoking.updatePlan", lang)}
          </Button>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
