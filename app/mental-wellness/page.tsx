// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Smile,
  Zap,
  Wind,
  Target,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Phone,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface MoodRecord {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  anxiety: number;
  focus: number;
  triggers: string[];
  coping_methods: string[];
  notes: string | null;
}

interface AnalysisResult {
  overallTrend: "improving" | "stable" | "declining" | "fluctuating";
  averageScores: {
    mood: number;
    energy: number;
    stress: number;
    anxiety: number;
    focus: number;
  };
  topTriggers: Array<{ trigger: string; frequency: number; avgMoodImpact: number }>;
  effectiveCoping: Array<{ method: string; effectiveness: string }>;
  medicationNotes: string;
  patterns: string[];
  recommendations: string[];
  alertLevel: "green" | "yellow" | "red";
  professionalReferral: boolean;
  crisisMessage?: string;
}

const MOOD_EMOJIS = ["", "\uD83D\uDE2D", "\uD83D\uDE1E", "\uD83D\uDE10", "\uD83D\uDE42", "\uD83D\uDE01"];
const ENERGY_EMOJIS = ["", "\uD83E\uDEAB", "\uD83D\uDCA4", "\u26A1", "\uD83D\uDD25", "\uD83D\uDE80"];

const TRIGGERS = ["work", "relationship", "health", "financial", "family", "sleepTrigger", "social", "weather"];
const COPING = ["exerciseCoping", "meditation", "socializing", "nature", "music", "journaling", "breathing", "therapy"];

export default function MentalWellnessPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [anxiety, setAnxiety] = useState(3);
  const [focus, setFocus] = useState(3);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedCoping, setSelectedCoping] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/mental-wellness", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);

        // Pre-fill today's record if exists
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = (data.records || []).find((r: MoodRecord) => r.date === today);
        if (todayRecord) {
          setMood(todayRecord.mood || 3);
          setEnergy(todayRecord.energy || 3);
          setStress(todayRecord.stress || 3);
          setAnxiety(todayRecord.anxiety || 3);
          setFocus(todayRecord.focus || 3);
          setSelectedTriggers(todayRecord.triggers || []);
          setSelectedCoping(todayRecord.coping_methods || []);
          setNotes(todayRecord.notes || "");
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session?.access_token]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/mental-wellness", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          mood,
          energy,
          stress,
          anxiety,
          focus,
          triggers: selectedTriggers,
          coping_methods: selectedCoping,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSaved(true);
      fetchRecords();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/mental-wellness/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleTrigger = (t: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleCoping = (c: string) => {
    setSelectedCoping((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const last7Days = records.slice(0, 7);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-950">
            <Brain className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("mw.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tx("mw.subtitle", lang)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-8 text-center dark:border-teal-800 dark:bg-teal-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-teal-400" />
          <p className="text-lg font-medium text-teal-700 dark:text-teal-300">
            {tx("mw.loginRequired", lang)}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-950">
          <Brain className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("mw.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("mw.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Crisis Alert */}
      {analysis?.alertLevel === "red" && analysis.crisisMessage && (
        <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 p-6 dark:bg-red-950/40">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-300">{analysis.crisisMessage}</p>
              <p className="mt-2 text-lg font-bold text-red-600">
                {tx("mw.crisisLine", lang)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Professional Referral (Yellow) */}
      {analysis?.alertLevel === "yellow" && analysis.professionalReferral && (
        <div className="mb-6 rounded-xl border-2 border-amber-400 bg-amber-50 p-5 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-300">
                {tx("mw.professionalHelp", lang)}
              </p>
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                {tx("mw.crisisLine", lang)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Check-in */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-teal-700 dark:text-teal-300">
          {tx("mw.dailyCheckIn", lang)}
        </h2>

        {/* Metric Sliders */}
        <div className="space-y-5">
          <MetricSlider
            label={tx("mw.mood", lang)}
            value={mood}
            onChange={setMood}
            icon={<Smile className="h-5 w-5 text-teal-500" />}
            emoji={MOOD_EMOJIS[mood]}
            color="teal"
          />
          <MetricSlider
            label={tx("mw.energy", lang)}
            value={energy}
            onChange={setEnergy}
            icon={<Zap className="h-5 w-5 text-yellow-500" />}
            emoji={ENERGY_EMOJIS[energy]}
            color="yellow"
          />
          <MetricSlider
            label={tx("mw.stress", lang)}
            value={stress}
            onChange={setStress}
            icon={<Wind className="h-5 w-5 text-orange-500" />}
            emoji={stress <= 2 ? "\uD83C\uDF3F" : stress <= 3 ? "\uD83C\uDF2A\uFE0F" : "\uD83E\uDD2F"}
            color="orange"
            inverted
          />
          <MetricSlider
            label={tx("mw.anxiety", lang)}
            value={anxiety}
            onChange={setAnxiety}
            icon={<Brain className="h-5 w-5 text-purple-500" />}
            emoji={anxiety <= 2 ? "\uD83E\uDDD8" : anxiety <= 3 ? "\uD83D\uDE1F" : "\uD83D\uDE30"}
            color="purple"
            inverted
          />
          <MetricSlider
            label={tx("mw.focus", lang)}
            value={focus}
            onChange={setFocus}
            icon={<Target className="h-5 w-5 text-blue-500" />}
            emoji={focus <= 2 ? "\uD83C\uDF2B\uFE0F" : focus <= 3 ? "\uD83D\uDCA1" : "\uD83C\uDFAF"}
            color="blue"
          />
        </div>

        {/* Triggers */}
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {tx("mw.triggers", lang)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {TRIGGERS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTrigger(t)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedTriggers.includes(t)
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:hover:bg-teal-900"
                }`}
              >
                {tx(`mw.${t}`, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Coping Methods */}
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {tx("mw.coping", lang)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {COPING.map((c) => (
              <button
                key={c}
                onClick={() => toggleCoping(c)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedCoping.includes(c)
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:hover:bg-teal-900"
                }`}
              >
                {tx(`mw.${c}`, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-5">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={tx("mw.notesPlaceholder", lang)}
            maxLength={1000}
            rows={3}
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 dark:border-gray-700"
          />
        </div>

        {/* Save Button */}
        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {saving
              ? tx("common.saving", lang)
              : tx("mw.saveCheckin", lang)}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {tx("mw.saved", lang)}
            </span>
          )}
        </div>
      </div>

      {/* Week Overview */}
      {last7Days.length > 0 && (
        <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-teal-700 dark:text-teal-300">
            {tx("mw.weekOverview", lang)}
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {last7Days.map((r) => {
              const d = new Date(r.date + "T00:00:00");
              const dayLabel = d.toLocaleDateString(tx("common.locale", lang), { weekday: "short" });
              return (
                <div
                  key={r.date}
                  className="flex flex-col items-center gap-1 rounded-lg bg-teal-50/50 p-2 dark:bg-teal-950/30"
                >
                  <span className="text-xs text-muted-foreground">{dayLabel}</span>
                  <span className="text-2xl">{MOOD_EMOJIS[r.mood] || "\uD83D\uDE10"}</span>
                  <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                    {r.mood}/5
                  </span>
                </div>
              );
            })}
          </div>

          {/* Average Scores Bar */}
          {last7Days.length >= 3 && (
            <div className="mt-4 space-y-2">
              {(["mood", "energy", "stress", "anxiety", "focus"] as const).map((metric) => {
                const avg =
                  last7Days.reduce((s, r) => s + (r[metric] || 0), 0) / last7Days.length;
                const pct = (avg / 5) * 100;
                const isNegative = metric === "stress" || metric === "anxiety";
                const barColor = isNegative
                  ? avg > 3 ? "bg-red-400" : avg > 2 ? "bg-amber-400" : "bg-green-400"
                  : avg >= 4 ? "bg-green-400" : avg >= 3 ? "bg-amber-400" : "bg-red-400";

                return (
                  <div key={metric} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium text-muted-foreground capitalize">
                      {tx(`mw.${metric}`, lang)}
                    </span>
                    <div className="flex-1 rounded-full bg-gray-200 dark:bg-gray-700 h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs font-bold text-right">
                      {avg.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Analysis */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-teal-700 dark:text-teal-300">
            {tx("mw.analyze", lang)}
          </h2>
          {analysis && (
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              {showAnalysis ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          )}
        </div>

        {records.length < 7 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {tx("mw.needMore", lang)} ({records.length}/7)
          </p>
        )}

        {records.length >= 7 && (
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="mt-3 bg-teal-600 text-white hover:bg-teal-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tx("mw.analyzing", lang)}
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                {tx("mw.analyze", lang)}
              </>
            )}
          </Button>
        )}

        {/* Analysis Results */}
        {analysis && showAnalysis && (
          <div className="mt-4 space-y-4">
            {/* Overall Trend */}
            <div className="flex items-center gap-2">
              {analysis.overallTrend === "improving" && (
                <TrendingUp className="h-5 w-5 text-green-500" />
              )}
              {analysis.overallTrend === "declining" && (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              {(analysis.overallTrend === "stable" || analysis.overallTrend === "fluctuating") && (
                <Minus className="h-5 w-5 text-amber-500" />
              )}
              <span className="text-sm font-semibold capitalize">
                {analysis.overallTrend}
              </span>
            </div>

            {/* Patterns */}
            {analysis.patterns.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {tx("mw.detectedPatterns", lang)}
                </h3>
                <ul className="space-y-1">
                  {analysis.patterns.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top Triggers */}
            {analysis.topTriggers.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {tx("mw.triggers", lang)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.topTriggers.map((t, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                    >
                      {t.trigger} ({t.frequency}x)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Effective Coping */}
            {analysis.effectiveCoping.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {tx("mw.coping", lang)}
                </h3>
                <ul className="space-y-1">
                  {analysis.effectiveCoping.map((c, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{c.method}</span>
                      <span className="text-muted-foreground"> — {c.effectiveness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medication Notes */}
            {analysis.medicationNotes && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                {analysis.medicationNotes}
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {tx("common.recommendations", lang)}
                </h3>
                <ul className="space-y-1">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}

/* ─── Metric Slider Component ─── */

function MetricSlider({
  label,
  value,
  onChange,
  icon,
  emoji,
  color,
  inverted,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  inverted?: boolean;
}) {
  const colorMap: Record<string, string> = {
    teal: "accent-teal-500",
    yellow: "accent-yellow-500",
    orange: "accent-orange-500",
    purple: "accent-purple-500",
    blue: "accent-blue-500",
  };

  const labelColor = inverted
    ? value >= 4 ? "text-red-500" : value >= 3 ? "text-amber-500" : "text-green-500"
    : value >= 4 ? "text-green-500" : value >= 3 ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-24 items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-1 h-2 rounded-lg cursor-pointer ${colorMap[color] || "accent-teal-500"}`}
      />
      <span className="text-2xl w-8 text-center">{emoji}</span>
      <span className={`w-6 text-center text-sm font-bold ${labelColor}`}>
        {value}
      </span>
    </div>
  );
}
