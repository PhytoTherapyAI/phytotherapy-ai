// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Loader2,
  LogIn,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Plus,
  BarChart3,
  Brain,
  ArrowRight,
  Pill,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx, txp } from "@/lib/translations";

interface PainRecord {
  id: string;
  date: string;
  location: string;
  intensity: number;
  pain_type: string;
  duration: string;
  triggers: string[];
  relief_methods: string[];
  medications_taken: string[];
  notes: string;
}

interface TriggerAnalysis {
  trigger: string;
  frequency: number;
  correlation: string;
}

interface PatternItem {
  pattern: string;
  significance: string;
  suggestion: string;
}

interface ReliefItem {
  method: string;
  effectiveness: string;
}

interface PainAnalysis {
  overallPattern: string;
  averageIntensity: number;
  frequencyPerWeek: number;
  mostCommonLocation: string;
  mostCommonType: string;
  patterns: PatternItem[];
  triggerAnalysis: TriggerAnalysis[];
  medicationCorrelation: string[];
  reliefEffectiveness: ReliefItem[];
  recommendations: string[];
  alertLevel: "green" | "yellow" | "red";
  alertMessage: string;
  whenToSeeDoctor: string[];
  sources?: Array<{ title: string; url: string }>;
}

const LOCATIONS = [
  { key: "head", label: { en: "Head", tr: "Bas" } },
  { key: "neck", label: { en: "Neck", tr: "Boyun" } },
  { key: "upper_back", label: { en: "Upper Back", tr: "Ust Sirt" } },
  { key: "lower_back", label: { en: "Lower Back", tr: "Bel" } },
  { key: "chest", label: { en: "Chest", tr: "Göğüs" } },
  { key: "abdomen", label: { en: "Abdomen", tr: "Karin" } },
  { key: "shoulder", label: { en: "Shoulder", tr: "Omuz" } },
  { key: "elbow", label: { en: "Elbow", tr: "Dirsek" } },
  { key: "wrist", label: { en: "Wrist", tr: "Bilek" } },
  { key: "hand", label: { en: "Hand", tr: "El" } },
  { key: "hip", label: { en: "Hip", tr: "Kalca" } },
  { key: "knee", label: { en: "Knee", tr: "Diz" } },
  { key: "ankle", label: { en: "Ankle", tr: "Ayak Bilegi" } },
  { key: "foot", label: { en: "Foot", tr: "Ayak" } },
  { key: "jaw", label: { en: "Jaw", tr: "Cene" } },
  { key: "general", label: { en: "General", tr: "Genel" } },
];

const PAIN_TYPES = [
  { key: "sharp", txKey: "pain.sharp" },
  { key: "dull", txKey: "pain.dull" },
  { key: "burning", txKey: "pain.burning" },
  { key: "throbbing", txKey: "pain.throbbing" },
  { key: "stabbing", label: { en: "Stabbing", tr: "Saplanan" } },
  { key: "cramping", label: { en: "Cramping", tr: "Krampi" } },
  { key: "aching", label: { en: "Aching", tr: "Sizlayan" } },
];

const COMMON_TRIGGERS = [
  { en: "Stress", tr: "Stres" },
  { en: "Poor sleep", tr: "Kotu uyku" },
  { en: "Exercise", tr: "Egzersiz" },
  { en: "Weather change", tr: "Hava degisimi" },
  { en: "Sitting too long", tr: "Uzun oturma" },
  { en: "Screen time", tr: "Ekran suresi" },
  { en: "Heavy lifting", tr: "Agir kaldirma" },
  { en: "Dehydration", tr: "Susuzluk" },
];

const COMMON_RELIEF = [
  { en: "Rest", tr: "Dinlenme" },
  { en: "Ice/Cold", tr: "Buz/Soguk" },
  { en: "Heat", tr: "Sicak" },
  { en: "Stretching", tr: "Germe" },
  { en: "Massage", tr: "Masaj" },
  { en: "Medication", tr: "İlaç" },
  { en: "Deep breathing", tr: "Derin nefes" },
  { en: "Walking", tr: "Yuruyus" },
];

export default function PainDiaryPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"log" | "history" | "analysis">("log");

  // Form state
  const [location, setLocation] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [painType, setPainType] = useState<string | null>(null);
  const [duration, setDuration] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedRelief, setSelectedRelief] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Data state
  const [records, setRecords] = useState<PainRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PainAnalysis | null>(null);
  const [showSources, setShowSources] = useState(false);

  // Fetch records
  const fetchRecords = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/pain-diary?days=30", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch {
      // Ignore
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (isAuthenticated) fetchRecords();
  }, [isAuthenticated, fetchRecords]);

  const handleSave = async () => {
    if (!location) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/pain-diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: "log",
          location,
          intensity,
          pain_type: painType,
          duration,
          triggers: selectedTriggers,
          relief_methods: selectedRelief,
          notes,
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSuccess(tx("pain.saved", lang));
      // Reset form
      setLocation(null);
      setIntensity(5);
      setPainType(null);
      setDuration("");
      setSelectedTriggers([]);
      setSelectedRelief([]);
      setNotes("");
      // Refresh records
      fetchRecords();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/pain-diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action: "analyze", lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTrigger = (t: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleRelief = (r: string) => {
    setSelectedRelief((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const intensityColor = (val: number) => {
    if (val <= 3) return "text-green-600";
    if (val <= 6) return "text-amber-600";
    return "text-red-600";
  };

  const intensityBg = (val: number) => {
    if (val <= 3) return "bg-green-500";
    if (val <= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50/50 p-12 text-center dark:border-red-800 dark:bg-red-950/20">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="text-sm text-muted-foreground">{tx("pain.loginRequired", lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
          <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("pain.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("pain.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg bg-muted/50 p-1">
        {[
          { key: "log" as const, icon: Plus, label: tx("pain.logPain", lang) },
          { key: "history" as const, icon: Calendar, label: tx("pain.history", lang) },
          { key: "analysis" as const, icon: Brain, label: tx("pain.analyze", lang) },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── LOG TAB ─────────────────────── */}
      {activeTab === "log" && (
        <div className="space-y-5">
          {/* Location */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("pain.location", lang)}
            </label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLocation(l.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    location === l.key
                      ? "border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950/30 dark:text-red-300"
                      : "hover:border-red-300 dark:hover:border-red-700"
                  }`}
                >
                  {l.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>{tx("pain.intensity", lang)}</span>
              <span className={`text-lg font-bold ${intensityColor(intensity)}`}>
                {intensity}/10
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{tx("pain.mild", lang)}</span>
              <span>{tx("common.moderate", lang)}</span>
              <span>{tx("common.severe", lang)}</span>
            </div>
          </div>

          {/* Pain Type */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("pain.type", lang)}
            </label>
            <div className="flex flex-wrap gap-2">
              {PAIN_TYPES.map((p) => {
                const label = p.txKey ? tx(p.txKey, lang) : (p as { label: { en: string; tr: string } }).label[lang];
                return (
                  <button
                    key={p.key}
                    onClick={() => setPainType(p.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      painType === p.key
                        ? "border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950/30 dark:text-red-300"
                        : "hover:border-red-300 dark:hover:border-red-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("pain.duration", lang)}
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={tx("pain.durationPlaceholder", lang)}
              className="w-full rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </div>

          {/* Triggers */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("pain.triggers", lang)}
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TRIGGERS.map((t, i) => {
                const label = t[lang];
                return (
                  <button
                    key={i}
                    onClick={() => toggleTrigger(label)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedTriggers.includes(label)
                        ? "border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950/30 dark:text-red-300"
                        : "hover:border-red-300 dark:hover:border-red-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Relief Methods */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("pain.relief", lang)}
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_RELIEF.map((r, i) => {
                const label = r[lang];
                return (
                  <button
                    key={i}
                    onClick={() => toggleRelief(label)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedRelief.includes(label)
                        ? "border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/30 dark:text-green-300"
                        : "hover:border-green-300 dark:hover:border-green-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("common.notes", lang)}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tx("pain.notesPlaceholder", lang)}
              className="w-full rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
              rows={2}
            />
          </div>

          {/* Success */}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="mr-1 inline h-4 w-4" />
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!location || isSaving}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tx("common.saving", lang)}
              </>
            ) : (
              tx("pain.logPain", lang)
            )}
          </Button>
        </div>
      )}

      {/* ─── HISTORY TAB ────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50/50 p-8 text-center dark:border-red-800 dark:bg-red-950/20">
              <BarChart3 className="mx-auto mb-3 h-8 w-8 text-red-400" />
              <p className="text-sm text-muted-foreground">
                {tx("pain.noRecords", lang)}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {txp("painDiary.recordsCount", lang, { count: records.length })}
              </p>
              {records.map((r) => {
                const loc = LOCATIONS.find((l) => l.key === r.location);
                return (
                  <div key={r.id} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{loc?.label[lang] || r.location}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          r.intensity <= 3 ? "bg-green-100 text-green-700" : r.intensity <= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}>
                          {r.intensity}/10
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    {r.pain_type && (
                      <p className="text-xs text-muted-foreground capitalize">{r.pain_type}</p>
                    )}
                    {r.duration && (
                      <p className="text-xs text-muted-foreground">{r.duration}</p>
                    )}
                    {r.triggers && r.triggers.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.triggers.map((t, i) => (
                          <span key={i} className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ─── ANALYSIS TAB ───────────────── */}
      {activeTab === "analysis" && (
        <div className="space-y-4">
          {!analysis && !isLoading && (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
                <p className="text-xs text-red-700 dark:text-red-300">
                  {records.length < 7
                    ? tx("pain.needMore", lang)
                    : lang === "tr"
                    ? `${records.length} kaydiniz var. AI analiz için hazir.`
                    : `You have ${records.length} records. Ready for AI analysis.`}
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={records.length < 7}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Brain className="mr-2 h-4 w-4" />
                {tx("pain.analyze", lang)}
              </Button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-red-500" />
              <p className="text-sm text-muted-foreground">{tx("pain.analyzing", lang)}</p>
            </div>
          )}

          {/* Error */}
          {error && activeTab === "analysis" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4">
              {/* Overall Pattern */}
              <div className={`flex items-center gap-3 rounded-xl border-2 p-4 ${
                analysis.alertLevel === "green"
                  ? "border-green-400 bg-green-50 dark:bg-green-950/30"
                  : analysis.alertLevel === "yellow"
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                  : "border-red-400 bg-red-50 dark:bg-red-950/30"
              }`}>
                {analysis.alertLevel === "green" ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                ) : analysis.alertLevel === "yellow" ? (
                  <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                ) : (
                  <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{analysis.overallPattern}</p>
                  {analysis.alertMessage && (
                    <p className="mt-1 text-xs text-muted-foreground">{analysis.alertMessage}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: tx("pain.avgIntensity", lang), value: `${analysis.averageIntensity}/10`, color: intensityColor(analysis.averageIntensity) },
                  { label: tx("pain.freqWeek", lang), value: String(analysis.frequencyPerWeek), color: "text-foreground" },
                  { label: tx("pain.mostCommonArea", lang), value: analysis.mostCommonLocation, color: "text-foreground" },
                  { label: tx("pain.mostCommonType", lang), value: analysis.mostCommonType, color: "text-foreground" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-sm font-bold capitalize ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Patterns */}
              {analysis.patterns && analysis.patterns.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <BarChart3 className="h-4 w-4 text-red-500" />
                    {tx("pain.trend", lang)}
                  </h3>
                  <div className="space-y-2">
                    {analysis.patterns.map((p, i) => (
                      <div key={i} className="rounded-lg bg-muted/30 p-3">
                        <p className="text-sm font-medium">{p.pattern}</p>
                        <p className="text-xs text-muted-foreground">{p.significance}</p>
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{p.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trigger Analysis */}
              {analysis.triggerAnalysis && analysis.triggerAnalysis.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    {tx("pain.triggers", lang)}
                  </h3>
                  <div className="space-y-1.5">
                    {analysis.triggerAnalysis.map((t, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5">
                        <span className="text-sm font-medium">{t.trigger}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{t.frequency}x</span>
                          <span className="text-xs text-muted-foreground">{t.correlation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Correlation */}
              {analysis.medicationCorrelation && analysis.medicationCorrelation.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Pill className="h-4 w-4 text-red-500" />
                    {tx("pain.medCorrelation", lang)}
                  </h3>
                  <ul className="space-y-1">
                    {analysis.medicationCorrelation.map((m, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs">
                        <span className="mt-1 text-amber-500">&#9679;</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Relief Effectiveness */}
              {analysis.reliefEffectiveness && analysis.reliefEffectiveness.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {tx("pain.relief", lang)}
                  </h3>
                  <div className="space-y-1.5">
                    {analysis.reliefEffectiveness.map((r, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5">
                        <span className="text-sm font-medium">{r.method}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.effectiveness === "seems effective"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {r.effectiveness}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
                  <h3 className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">
                    {tx("common.recommendations", lang)}
                  </h3>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-300">
                        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* When to See Doctor */}
              {analysis.whenToSeeDoctor && analysis.whenToSeeDoctor.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {tx("common.whenToSeeDoctor", lang)}
                  </h3>
                  <ul className="space-y-1">
                    {analysis.whenToSeeDoctor.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-300">
                        <span className="mt-1">&#8226;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              {analysis.sources && analysis.sources.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowSources(!showSources)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {tx("common.sources", lang)} ({analysis.sources.length})
                  </button>
                  {showSources && (
                    <div className="mt-2 space-y-1">
                      {analysis.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-primary hover:underline"
                        >
                          {src.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* New Analysis */}
              <Button
                variant="outline"
                onClick={() => {
                  setAnalysis(null);
                  setError(null);
                }}
                className="w-full"
              >
                {tx("pain.analyzeAgain", lang)}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
