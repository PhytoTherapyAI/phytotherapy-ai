// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Calendar,
  Loader2,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Pill,
  Clock,
  Droplets,
  Moon,
  Sun,
  Flower2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

// ============================================
// Types
// ============================================

interface CycleRecord {
  id: string;
  period_start: string;
  period_end: string | null;
  flow_intensity: string;
  symptoms: string[];
  mood: string | null;
  notes: string | null;
  created_at: string;
}

interface ContraceptiveRecord {
  id: string;
  name: string;
  type: string;
  start_date: string;
  notes: string | null;
}

interface CycleAnalysis {
  cycleRegularity: "regular" | "irregular" | "insufficient_data";
  averageCycleLength: number | null;
  currentPhase: "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown";
  currentPhaseDay: number | null;
  pmsPatterns: Array<{
    symptom: string;
    frequency: string;
    severity: string;
    recommendation: string;
  }>;
  contraceptiveStatus: {
    active: boolean;
    name: string | null;
    durationMonths: number | null;
    annualReviewDue: boolean;
    notes: string | null;
  };
  phaseRecommendations: Array<{
    phase: string;
    nutrition: string;
    exercise: string;
    supplements: string;
    selfCare: string;
  }>;
  alerts: Array<{
    type: "warning" | "info" | "success";
    message: string;
  }>;
  disclaimer: string;
}

// ============================================
// Constants
// ============================================

const SYMPTOMS_LIST = [
  { key: "cramps", txKey: "wh.cramps" },
  { key: "headache", txKey: "wh.headache" },
  { key: "bloating", txKey: "wh.bloating" },
  { key: "mood_swings", txKey: "wh.moodSwings" },
  { key: "breast_tenderness", txKey: "wh.breastTenderness" },
  { key: "fatigue", txKey: "wh.fatigue" },
  { key: "acne", txKey: "wh.acne" },
  { key: "back_pain", txKey: "wh.backPain" },
  { key: "nausea", txKey: "wh.nausea" },
];

const MOODS = [
  { key: "happy", emoji: "😊" },
  { key: "neutral", emoji: "😐" },
  { key: "sad", emoji: "😢" },
  { key: "anxious", emoji: "😰" },
  { key: "irritable", emoji: "😤" },
  { key: "energetic", emoji: "⚡" },
];

const FLOW_OPTIONS = [
  { key: "light", txKey: "wh.light" },
  { key: "moderate", txKey: "wh.moderate" },
  { key: "heavy", txKey: "wh.heavy" },
  { key: "spotting", txKey: "wh.spotting" },
];

const PHASE_CONFIG: Record<string, { icon: typeof Moon; color: string; bg: string; border: string }> = {
  menstrual: {
    icon: Droplets,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
  },
  follicular: {
    icon: Flower2,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-800",
  },
  ovulatory: {
    icon: Sun,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  luteal: {
    icon: Moon,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
  },
  unknown: {
    icon: Calendar,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
  },
};

// ============================================
// Component
// ============================================

export default function WomensHealthPage() {
  const { isAuthenticated, session, profile } = useAuth();
  const { lang } = useLang();

  // Data state
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [contraceptives, setContraceptives] = useState<ContraceptiveRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [flowIntensity, setFlowIntensity] = useState("moderate");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Analysis state
  const [analysis, setAnalysis] = useState<CycleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // Fetch data
  // ============================================

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) return;
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/womens-health", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setCycles(data.cycles || []);
      setContraceptives(data.contraceptives || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, session?.access_token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================
  // Save period
  // ============================================

  const handleSave = async () => {
    if (!periodStart || !session?.access_token) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/womens-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          period_start: periodStart,
          period_end: periodEnd || null,
          flow_intensity: flowIntensity,
          symptoms: selectedSymptoms,
          mood: selectedMood,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSaveSuccess(true);
      setPeriodStart("");
      setPeriodEnd("");
      setFlowIntensity("moderate");
      setSelectedSymptoms([]);
      setSelectedMood(null);
      setNotes("");
      setShowForm(false);
      await fetchData();

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // AI Analysis
  // ============================================

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/womens-health/analyze", {
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
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ============================================
  // Helpers
  // ============================================

  const toggleSymptom = (key: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const estimateCurrentPhase = (): { phase: string; day: number } => {
    if (cycles.length === 0) return { phase: "unknown", day: 0 };
    const lastStart = new Date(cycles[0].period_start);
    const today = new Date();
    const daysSinceStart = Math.round(
      (today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceStart <= 5) return { phase: "menstrual", day: daysSinceStart };
    if (daysSinceStart <= 13) return { phase: "follicular", day: daysSinceStart };
    if (daysSinceStart <= 16) return { phase: "ovulatory", day: daysSinceStart };
    if (daysSinceStart <= 28) return { phase: "luteal", day: daysSinceStart };
    return { phase: "unknown", day: daysSinceStart };
  };

  const getContraceptiveDuration = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    return Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // ============================================
  // Access control
  // ============================================

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-16 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-pink-400" />
        <h1 className="mb-2 text-2xl font-bold">{tx("wh.title", lang)}</h1>
        <p className="text-muted-foreground">{tx("wh.loginRequired", lang)}</p>
      </div>
    );
  }

  // Check gender — only show for female or if explicitly enabled
  const userGender = profile?.gender;
  if (userGender && userGender !== "female") {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-16 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-pink-400" />
        <h1 className="mb-2 text-2xl font-bold">{tx("wh.title", lang)}</h1>
        <p className="text-muted-foreground">
          {tx("wh.femaleOnly", lang)}
        </p>
      </div>
    );
  }

  const currentEstimate = estimateCurrentPhase();
  const phaseStyle = PHASE_CONFIG[currentEstimate.phase] || PHASE_CONFIG.unknown;
  const PhaseIcon = phaseStyle.icon;

  // ============================================
  // Render
  // ============================================

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-pink-50 p-3 dark:bg-pink-950">
          <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("wh.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("wh.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoadingData && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Success toast */}
      {saveSuccess && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {tx("wh.saved", lang)}
        </div>
      )}

      {!isLoadingData && (
        <div className="space-y-6">
          {/* ══════════════════════════════════════ */}
          {/* Current Phase Widget */}
          {/* ══════════════════════════════════════ */}
          {cycles.length > 0 && (
            <div className={`rounded-xl border-2 ${phaseStyle.border} ${phaseStyle.bg} p-5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PhaseIcon className={`h-8 w-8 ${phaseStyle.color}`} />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {tx("wh.cyclePhase", lang)}
                    </p>
                    <p className={`text-xl font-bold ${phaseStyle.color}`}>
                      {tx(`wh.${currentEstimate.phase}` as "wh.menstrual" | "wh.follicular" | "wh.ovulatory" | "wh.luteal", lang)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${phaseStyle.color}`}>
                    {currentEstimate.day}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx("wh.day", lang)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════ */}
          {/* Contraceptive Panel */}
          {/* ══════════════════════════════════════ */}
          {contraceptives.length > 0 && (
            <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4 dark:border-pink-800 dark:bg-pink-950/20">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                <h3 className="font-semibold text-pink-700 dark:text-pink-300">
                  {tx("wh.contraceptive", lang)}
                </h3>
              </div>
              {contraceptives.map((c) => {
                const daysSinceStart = getContraceptiveDuration(c.start_date);
                const monthsSinceStart = Math.floor(daysSinceStart / 30);
                const annualReviewDue = monthsSinceStart >= 11;
                return (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.start_date} ({daysSinceStart} {tx("common.days", lang)})
                      </p>
                    </div>
                    {annualReviewDue && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tx("wh.annualReview", lang)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════════════ */}
          {/* Log Period Button / Form */}
          {/* ══════════════════════════════════════ */}
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full gap-2 bg-pink-600 hover:bg-pink-700 text-white"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              {tx("wh.logPeriod", lang)}
            </Button>
          ) : (
            <div className="rounded-xl border border-pink-200 bg-white p-5 dark:border-pink-800 dark:bg-gray-900">
              <h3 className="mb-4 font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-pink-600" />
                {tx("wh.logPeriod", lang)}
              </h3>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {tx("wh.periodStart", lang)} *
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {tx("wh.periodEnd", lang)}
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    min={periodStart}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />
                </div>
              </div>

              {/* Flow Intensity */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  {tx("wh.flowIntensity", lang)}
                </label>
                <div className="flex flex-wrap gap-2">
                  {FLOW_OPTIONS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFlowIntensity(f.key)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        flowIntensity === f.key
                          ? "border-pink-500 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200"
                          : "hover:border-pink-300 hover:bg-pink-50 dark:hover:border-pink-700 dark:hover:bg-pink-950"
                      }`}
                    >
                      {tx(f.txKey, lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  {tx("wh.symptoms", lang)}
                </label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS_LIST.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => toggleSymptom(s.key)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedSymptoms.includes(s.key)
                          ? "border-pink-500 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200"
                          : "hover:border-pink-300 hover:bg-pink-50 dark:hover:border-pink-700 dark:hover:bg-pink-950"
                      }`}
                    >
                      {tx(s.txKey, lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  {tx("wh.mood", lang)}
                </label>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setSelectedMood(selectedMood === m.key ? null : m.key)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition-colors ${
                        selectedMood === m.key
                          ? "border-pink-500 bg-pink-100 dark:bg-pink-900"
                          : "hover:border-pink-300 hover:bg-pink-50 dark:hover:border-pink-700"
                      }`}
                      title={m.key}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={tx("wh.notesPlaceholder", lang)}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!periodStart || isSaving}
                  className="flex-1 gap-2 bg-pink-600 hover:bg-pink-700 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {tx("wh.logPeriod", lang)}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-pink-200 hover:bg-pink-50 dark:border-pink-800"
                >
                  {tx("common.cancel", lang)}
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════ */}
          {/* AI Analysis Button */}
          {/* ══════════════════════════════════════ */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || cycles.length < 3}
            variant="outline"
            className="w-full gap-2 border-pink-300 text-pink-700 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-300 dark:hover:bg-pink-950"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("wh.analyzing", lang)}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {tx("wh.analyze", lang)}
              </>
            )}
          </Button>

          {cycles.length > 0 && cycles.length < 3 && (
            <p className="text-center text-xs text-muted-foreground">
              {tx("wh.needMore", lang)}
            </p>
          )}

          {analysisError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {analysisError}
            </div>
          )}

          {/* ══════════════════════════════════════ */}
          {/* Analysis Results */}
          {/* ══════════════════════════════════════ */}
          {analysis && showAnalysis && (
            <div className="space-y-4">
              {/* Alerts */}
              {analysis.alerts.map((alert, i) => {
                const alertConfig = {
                  warning: {
                    border: "border-amber-200 dark:border-amber-800",
                    bg: "bg-amber-50 dark:bg-amber-950/30",
                    text: "text-amber-700 dark:text-amber-300",
                    icon: AlertTriangle,
                  },
                  info: {
                    border: "border-blue-200 dark:border-blue-800",
                    bg: "bg-blue-50 dark:bg-blue-950/30",
                    text: "text-blue-700 dark:text-blue-300",
                    icon: Info,
                  },
                  success: {
                    border: "border-green-200 dark:border-green-800",
                    bg: "bg-green-50 dark:bg-green-950/30",
                    text: "text-green-700 dark:text-green-300",
                    icon: CheckCircle2,
                  },
                };
                const cfg = alertConfig[alert.type];
                const AlertIcon = cfg.icon;
                return (
                  <div key={i} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3 text-sm ${cfg.text} flex items-start gap-2`}>
                    <AlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
                    {alert.message}
                  </div>
                );
              })}

              {/* Summary Card */}
              <div className="rounded-xl border border-pink-200 bg-white p-5 dark:border-pink-800 dark:bg-gray-900">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {tx("wh.regularity", lang)}
                    </p>
                    <p className={`font-bold text-sm ${
                      analysis.cycleRegularity === "regular"
                        ? "text-green-600"
                        : analysis.cycleRegularity === "irregular"
                        ? "text-amber-600"
                        : "text-gray-500"
                    }`}>
                      {analysis.cycleRegularity === "regular"
                        ? tx("wh.regular", lang)
                        : analysis.cycleRegularity === "irregular"
                        ? tx("wh.irregular", lang)
                        : tx("wh.insufficientData", lang)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {tx("wh.avgCycle", lang)}
                    </p>
                    <p className="font-bold text-sm text-pink-600">
                      {analysis.averageCycleLength
                        ? `${analysis.averageCycleLength} ${tx("common.days", lang)}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PMS Patterns */}
              {analysis.pmsPatterns.length > 0 && (
                <div className="rounded-xl border border-pink-200 bg-white p-5 dark:border-pink-800 dark:bg-gray-900">
                  <h3 className="font-semibold mb-3 text-sm">
                    {tx("wh.pmsPatterns", lang)}
                  </h3>
                  <div className="space-y-3">
                    {analysis.pmsPatterns.map((p, i) => (
                      <div key={i} className="rounded-lg bg-pink-50/50 p-3 dark:bg-pink-950/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{p.symptom}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.severity === "severe"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : p.severity === "moderate"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          }`}>
                            {p.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{p.frequency}</p>
                        <p className="text-xs">{p.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase Recommendations */}
              {analysis.phaseRecommendations.length > 0 && (
                <div className="rounded-xl border border-pink-200 bg-white p-5 dark:border-pink-800 dark:bg-gray-900">
                  <h3 className="font-semibold mb-3 text-sm">
                    {tx("wh.phaseRecommendations", lang)}
                  </h3>
                  <div className="space-y-3">
                    {analysis.phaseRecommendations.map((r, i) => {
                      const pConfig = PHASE_CONFIG[r.phase] || PHASE_CONFIG.unknown;
                      const PIcon = pConfig.icon;
                      return (
                        <div key={i} className={`rounded-lg border ${pConfig.border} ${pConfig.bg} p-3`}>
                          <div className="flex items-center gap-2 mb-2">
                            <PIcon className={`h-4 w-4 ${pConfig.color}`} />
                            <span className={`font-medium text-sm capitalize ${pConfig.color}`}>
                              {r.phase}
                            </span>
                          </div>
                          <div className="grid gap-1.5 text-xs">
                            <p><span className="font-medium">{tx("wh.nutrition", lang)}</span> {r.nutrition}</p>
                            <p><span className="font-medium">{tx("wh.exercise", lang)}</span> {r.exercise}</p>
                            <p><span className="font-medium">{tx("wh.supplements", lang)}</span> {r.supplements}</p>
                            <p><span className="font-medium">{tx("wh.selfCare", lang)}</span> {r.selfCare}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contraceptive Status */}
              {analysis.contraceptiveStatus.active && (
                <div className="rounded-xl border border-pink-200 bg-white p-5 dark:border-pink-800 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="h-4 w-4 text-pink-600" />
                    <h3 className="font-semibold text-sm">{tx("wh.contraceptive", lang)}</h3>
                  </div>
                  <p className="text-sm">{analysis.contraceptiveStatus.name}</p>
                  {analysis.contraceptiveStatus.durationMonths !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {analysis.contraceptiveStatus.durationMonths} {tx("wh.monthsActive", lang)}
                    </p>
                  )}
                  {analysis.contraceptiveStatus.annualReviewDue && (
                    <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700 flex items-center gap-1 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
                      <Clock className="h-3 w-3" />
                      {tx("wh.annualReview", lang)}
                    </div>
                  )}
                  {analysis.contraceptiveStatus.notes && (
                    <p className="text-xs mt-2">{analysis.contraceptiveStatus.notes}</p>
                  )}
                </div>
              )}

              {/* Disclaimer */}
              <div className="rounded-lg border border-pink-200 bg-pink-50/30 p-3 text-xs text-muted-foreground dark:border-pink-800 dark:bg-pink-950/10">
                <AlertTriangle className="mr-1 inline h-3 w-3" />
                {analysis.disclaimer}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════ */}
          {/* Cycle History */}
          {/* ══════════════════════════════════════ */}
          {cycles.length > 0 && (
            <div className="rounded-xl border border-pink-200 bg-white p-5 dark:border-pink-800 dark:bg-gray-900">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-600" />
                {tx("wh.cycleHistory", lang)}
              </h3>
              <div className="space-y-3">
                {cycles.slice(0, 6).map((c) => {
                  const start = new Date(c.period_start);
                  const end = c.period_end ? new Date(c.period_end) : null;
                  const duration = end
                    ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    <div
                      key={c.id}
                      className="rounded-lg bg-pink-50/50 p-3 dark:bg-pink-950/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {start.toLocaleDateString(tx("common.locale", lang), {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {end && (
                            <>
                              {" — "}
                              {end.toLocaleDateString(tx("common.locale", lang), {
                                month: "short",
                                day: "numeric",
                              })}
                            </>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {duration !== null
                            ? `${duration} ${tx("common.days", lang)}`
                            : tx("wh.ongoing", lang)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          c.flow_intensity === "heavy"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : c.flow_intensity === "moderate"
                            ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300"
                            : c.flow_intensity === "spotting"
                            ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            : "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400"
                        }`}>
                          {tx(`wh.${c.flow_intensity}` as "wh.light" | "wh.moderate" | "wh.heavy" | "wh.spotting", lang)}
                        </span>
                        {c.symptoms && c.symptoms.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {c.symptoms.length} {tx("wh.symptoms", lang).toLowerCase()}
                          </span>
                        )}
                        {c.mood && (
                          <span className="text-xs">
                            {MOODS.find((m) => m.key === c.mood)?.emoji}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
