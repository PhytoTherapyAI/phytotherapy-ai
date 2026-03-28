"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Moon,
  Sun,
  Star,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Dumbbell,
  Monitor,
  Wine,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Utensils,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SleepRecord {
  id: string;
  date: string;
  bedtime: string | null;
  wake_time: string | null;
  sleep_duration: number | null;
  sleep_quality: number;
  wake_count: number;
  dreams: boolean;
  factors: string[];
  notes: string | null;
}

interface SleepAnalysis {
  sleepHygieneScore: number;
  averageDuration: number;
  averageQuality: number;
  consistency: "excellent" | "good" | "fair" | "poor";
  chronotype: "early_bird" | "intermediate" | "night_owl";
  patterns: string[];
  medicationEffects: string[];
  recommendations: string[];
  alertLevel: "green" | "yellow" | "red";
  alertMessage: string;
  weekdayVsWeekend?: {
    weekdayAvg: number;
    weekendAvg: number;
    socialJetLag: boolean;
  };
}

const FACTOR_CONFIG = [
  { key: "caffeine", icon: Coffee, color: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
  { key: "screen", icon: Monitor, color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  { key: "exercise", icon: Dumbbell, color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
  { key: "stress", icon: Brain, color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
  { key: "alcohol", icon: Wine, color: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  { key: "heavy_meal", icon: Utensils, color: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" },
  { key: "medication_change", icon: Pill, color: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300" },
];

const FACTOR_TX_MAP: Record<string, string> = {
  caffeine: "sleep.caffeine",
  screen: "sleep.screenTime",
  exercise: "sleep.exercise",
  stress: "sleep.stress",
  alcohol: "sleep.alcohol",
  heavy_meal: "sleep.heavyMeal",
  medication_change: "sleep.medChange",
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 ${
              star <= value
                ? "fill-indigo-400 text-indigo-400"
                : "fill-none text-gray-300 dark:text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function SleepBar({ duration, maxHours = 12 }: { duration: number; maxHours?: number }) {
  const pct = Math.min((duration / maxHours) * 100, 100);
  const color =
    duration >= 7
      ? "bg-green-400 dark:bg-green-500"
      : duration >= 5
        ? "bg-amber-400 dark:bg-amber-500"
        : "bg-red-400 dark:bg-red-500";
  return (
    <div className="h-6 w-full rounded bg-gray-100 dark:bg-gray-800">
      <div
        className={`h-6 rounded ${color} flex items-center justify-end pr-1.5 text-xs font-medium text-white transition-all`}
        style={{ width: `${pct}%`, minWidth: duration > 0 ? "2.5rem" : 0 }}
      >
        {duration.toFixed(1)}h
      </div>
    </div>
  );
}

function HygieneGauge({ score }: { score: number }) {
  const rotation = (score / 100) * 180 - 90;
  const color =
    score >= 70
      ? "text-green-500"
      : score >= 40
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-48 overflow-hidden">
        {/* Background arc */}
        <div className="absolute bottom-0 h-24 w-48 rounded-t-full border-[12px] border-gray-200 dark:border-gray-700 border-b-0" />
        {/* Colored arc */}
        <div
          className={`absolute bottom-0 left-1/2 h-1 w-20 origin-left ${color} rounded`}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -ml-2 h-4 w-4 rounded-full bg-indigo-500" />
      </div>
      <span className={`mt-1 text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-muted-foreground">/100</span>
    </div>
  );
}

export default function SleepAnalysisPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  // Form state
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [quality, setQuality] = useState(3);
  const [wakeCount, setWakeCount] = useState(0);
  const [dreams, setDreams] = useState(false);
  const [factors, setFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Data state
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [analysis, setAnalysis] = useState<SleepAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const authHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      h["Authorization"] = `Bearer ${session.access_token}`;
    }
    return h;
  }, [session?.access_token]);

  const fetchRecords = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/sleep-analysis?days=30", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, session?.access_token, authHeaders]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const toggleFactor = (key: string) => {
    setFactors((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const calculateDuration = (): number => {
    const [bH, bM] = bedtime.split(":").map(Number);
    const [wH, wM] = wakeTime.split(":").map(Number);
    let bedMin = bH * 60 + bM;
    let wakeMin = wH * 60 + wM;
    if (wakeMin <= bedMin) wakeMin += 24 * 60;
    return parseFloat(((wakeMin - bedMin) / 60).toFixed(1));
  };

  const handleSave = async () => {
    if (!isAuthenticated || !session?.access_token) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/sleep-analysis", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          bedtime,
          wake_time: wakeTime,
          sleep_quality: quality,
          wake_count: wakeCount,
          dreams,
          factors,
          notes: notes.trim() || null,
          date: recordDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSuccess(tx("sleep.saved", lang));
      setNotes("");
      setFactors([]);
      setDreams(false);
      setWakeCount(0);
      setQuality(3);
      fetchRecords();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated || !session?.access_token) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/sleep-analysis/analyze", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setAnalysis(data.analysis);
      setShowAnalysis(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get last 7 records for chart
  const last7 = records.slice(0, 7).reverse();
  const recentLogs = records.slice(0, 7);
  const duration = calculateDuration();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Moon className="h-12 w-12 text-indigo-400" />
          <p className="text-lg text-muted-foreground">{tx("sleep.loginRequired", lang)}</p>
          <a href="/auth/login">
            <Button>{tx("nav.signInUp", lang)}</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
          <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("sleep.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("sleep.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Sleep Log Form */}
      <div className="mb-6 rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-900 dark:bg-gray-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-indigo-500" />
          {tx("sleep.logSleep", lang)}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              {lang === "tr" ? "Tarih" : "Date"}
            </label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          {/* Duration preview */}
          <div className="flex items-end">
            <div className="rounded-lg bg-indigo-50 px-4 py-2 dark:bg-indigo-950/50">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {duration}
              </span>
              <span className="ml-1 text-sm text-muted-foreground">
                {tx("sleep.hours", lang)}
              </span>
            </div>
          </div>

          {/* Bedtime */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              <Moon className="mr-1 inline h-4 w-4" />
              {tx("sleep.bedtime", lang)}
            </label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          {/* Wake time */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              <Sun className="mr-1 inline h-4 w-4" />
              {tx("sleep.wakeTime", lang)}
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Quality */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            {tx("sleep.quality", lang)}
          </label>
          <StarRating value={quality} onChange={setQuality} />
        </div>

        {/* Wake count */}
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            {tx("sleep.wakeCount", lang)}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWakeCount(Math.max(0, wakeCount - 1))}
              className="rounded-lg border px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              -
            </button>
            <span className="w-8 text-center text-lg font-semibold">{wakeCount}</span>
            <button
              type="button"
              onClick={() => setWakeCount(Math.min(20, wakeCount + 1))}
              className="rounded-lg border px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              +
            </button>
          </div>
        </div>

        {/* Dreams toggle */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDreams(!dreams)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              dreams ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                dreams ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {tx("sleep.dreams", lang)}
          </span>
        </div>

        {/* Factors */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            {tx("sleep.factors", lang)}
          </label>
          <div className="flex flex-wrap gap-2">
            {FACTOR_CONFIG.map(({ key, icon: Icon, color }) => {
              const active = factors.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFactor(key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? color + " ring-2 ring-indigo-300 dark:ring-indigo-600"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tx(FACTOR_TX_MAP[key], lang)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={lang === "tr" ? "Notlar (opsiyonel)..." : "Notes (optional)..."}
            rows={2}
            maxLength={500}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {lang === "tr" ? "Kaydediliyor..." : "Saving..."}
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              {tx("sleep.logSleep", lang)}
            </>
          )}
        </Button>
      </div>

      {/* Weekly Chart */}
      {last7.length > 0 && (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-900 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Zap className="h-5 w-5 text-indigo-500" />
            {tx("sleep.weeklyChart", lang)}
          </h2>
          <div className="space-y-2">
            {last7.map((r) => {
              const dayLabel = new Date(r.date + "T00:00:00").toLocaleDateString(
                lang === "tr" ? "tr-TR" : "en-US",
                { weekday: "short", day: "numeric", month: "short" }
              );
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-muted-foreground">{dayLabel}</span>
                  <div className="flex-1">
                    <SleepBar duration={r.sleep_duration || 0} />
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${
                          s <= r.sleep_quality
                            ? "fill-indigo-400 text-indigo-400"
                            : "fill-none text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Analysis Section */}
      <div className="mb-6 rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-900 dark:bg-gray-900">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Brain className="h-5 w-5 text-indigo-500" />
          {tx("sleep.analyze", lang)}
        </h2>

        {records.length < 7 ? (
          <p className="text-sm text-muted-foreground">{tx("sleep.needMore", lang)}</p>
        ) : (
          <>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant="outline"
              className="mb-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tx("sleep.analyzing", lang)}
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  {tx("sleep.analyze", lang)}
                </>
              )}
            </Button>

            {analysis && (
              <div>
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="mb-3 flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                >
                  {showAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showAnalysis
                    ? lang === "tr" ? "Analizi Gizle" : "Hide Analysis"
                    : lang === "tr" ? "Analizi Göster" : "Show Analysis"
                  }
                </button>

                {showAnalysis && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                    {/* Score + Chronotype row */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Hygiene Score */}
                      <div className="flex flex-col items-center rounded-lg border p-4 dark:border-gray-700">
                        <span className="mb-2 text-sm font-medium text-muted-foreground">
                          {tx("sleep.hygieneScore", lang)}
                        </span>
                        <HygieneGauge score={analysis.sleepHygieneScore} />
                      </div>

                      {/* Chronotype */}
                      <div className="flex flex-col items-center justify-center rounded-lg border p-4 dark:border-gray-700">
                        <span className="mb-2 text-sm font-medium text-muted-foreground">
                          {tx("sleep.chronotype", lang)}
                        </span>
                        <div className="flex items-center gap-2">
                          {analysis.chronotype === "early_bird" && (
                            <>
                              <Sun className="h-8 w-8 text-amber-500" />
                              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {tx("sleep.earlyBird", lang)}
                              </span>
                            </>
                          )}
                          {analysis.chronotype === "night_owl" && (
                            <>
                              <Moon className="h-8 w-8 text-indigo-500" />
                              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {tx("sleep.nightOwl", lang)}
                              </span>
                            </>
                          )}
                          {analysis.chronotype === "intermediate" && (
                            <>
                              <Clock className="h-8 w-8 text-teal-500" />
                              <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                                {tx("sleep.intermediate", lang)}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {lang === "tr" ? "Ortalama" : "Average"}: {analysis.averageDuration.toFixed(1)}h &middot;{" "}
                          {lang === "tr" ? "Kalite" : "Quality"}: {analysis.averageQuality.toFixed(1)}/5
                        </div>
                      </div>
                    </div>

                    {/* Alert */}
                    {analysis.alertMessage && (
                      <div
                        className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                          analysis.alertLevel === "red"
                            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                            : analysis.alertLevel === "yellow"
                              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                              : "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                        }`}
                      >
                        {analysis.alertLevel === "red" ? (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        {analysis.alertMessage}
                      </div>
                    )}

                    {/* Patterns */}
                    {analysis.patterns.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold">
                          {lang === "tr" ? "Tespit Edilen Oruntular" : "Detected Patterns"}
                        </h3>
                        <ul className="space-y-1">
                          {analysis.patterns.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Medication Effects */}
                    {analysis.medicationEffects.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold">
                          {lang === "tr" ? "İlaç Etkileri" : "Medication Effects"}
                        </h3>
                        <ul className="space-y-1">
                          {analysis.medicationEffects.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Pill className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-500" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold">
                          {lang === "tr" ? "Öneriler" : "Recommendations"}
                        </h3>
                        <ul className="space-y-1">
                          {analysis.recommendations.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-xs text-muted-foreground italic">
                      {tx("disclaimer.tool", lang)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-900 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5 text-indigo-500" />
            {tx("sleep.recentLogs", lang)}
          </h2>
          <div className="space-y-3">
            {recentLogs.map((r) => {
              const dayLabel = new Date(r.date + "T00:00:00").toLocaleDateString(
                lang === "tr" ? "tr-TR" : "en-US",
                { weekday: "long", day: "numeric", month: "short" }
              );
              return (
                <div
                  key={r.id}
                  className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dayLabel}</span>
                    <div className="flex items-center gap-1">
                      {r.sleep_duration !== null && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {r.sleep_duration.toFixed(1)}h
                        </span>
                      )}
                      <div className="flex gap-0.5 ml-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${
                              s <= r.sleep_quality
                                ? "fill-indigo-400 text-indigo-400"
                                : "fill-none text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {r.bedtime && (
                      <span className="flex items-center gap-1">
                        <Moon className="h-3 w-3" /> {r.bedtime.slice(0, 5)}
                      </span>
                    )}
                    {r.wake_time && (
                      <span className="flex items-center gap-1">
                        <Sun className="h-3 w-3" /> {r.wake_time.slice(0, 5)}
                      </span>
                    )}
                    {r.wake_count > 0 && (
                      <span>
                        {r.wake_count}x {lang === "tr" ? "uyanma" : "woke"}
                      </span>
                    )}
                    {r.dreams && <span>{lang === "tr" ? "Ruyali" : "Dreams"}</span>}
                    {r.factors && r.factors.length > 0 && (
                      <span className="text-xs">
                        {r.factors.map((f) => tx(FACTOR_TX_MAP[f] || f, lang)).join(", ")}
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <p className="mt-1 text-xs text-muted-foreground italic">{r.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && records.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      )}
    </div>
  );
}
