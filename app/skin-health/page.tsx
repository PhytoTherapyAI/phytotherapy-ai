"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  LogIn,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Pill,
  Sun,
  Moon,
  Leaf,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface MedEffect {
  medication: string;
  skinEffect: string;
  recommendation: string;
}

interface RoutineStep {
  step: string;
  product: string;
  note: string;
}

interface SupplementItem {
  name: string;
  dosage: string;
  duration: string;
  benefit: string;
  safety: "safe" | "caution" | "avoid";
  interactionNote: string;
}

interface SkinResult {
  skinHealthScore: number;
  concernAnalysis: string;
  medicationEffects: MedEffect[];
  skincareRoutine: {
    morning: RoutineStep[];
    evening: RoutineStep[];
    weekly: RoutineStep[];
  };
  supplements: SupplementItem[];
  lifestyleFactors: string[];
  alertLevel: "green" | "yellow" | "red";
  whenToSeeDoctor: string[];
  sources?: Array<{ title: string; url: string }>;
}

const CONCERNS = [
  { key: "acne", txKey: "skin.acne", emoji: "🔴" },
  { key: "eczema", txKey: "skin.eczema", emoji: "🟠" },
  { key: "psoriasis", txKey: "skin.psoriasis", emoji: "🟣" },
  { key: "rosacea", txKey: "skin.rosacea", emoji: "🌹" },
  { key: "dryness", txKey: "skin.dryness", emoji: "🏜" },
  { key: "aging", txKey: "skin.aging", emoji: "⏳" },
];

const AREAS = [
  { key: "face", label: { en: "Face", tr: "Yuz" } },
  { key: "forehead", label: { en: "Forehead", tr: "Alin" } },
  { key: "cheeks", label: { en: "Cheeks", tr: "Yanaklar" } },
  { key: "chin", label: { en: "Chin", tr: "Cene" } },
  { key: "neck", label: { en: "Neck", tr: "Boyun" } },
  { key: "chest", label: { en: "Chest", tr: "Göğüs" } },
  { key: "back", label: { en: "Back", tr: "Sirt" } },
  { key: "arms", label: { en: "Arms", tr: "Kollar" } },
  { key: "legs", label: { en: "Legs", tr: "Bacaklar" } },
  { key: "hands", label: { en: "Hands", tr: "Eller" } },
  { key: "scalp", label: { en: "Scalp", tr: "Sac Derisi" } },
];

export default function SkinHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [severity, setSeverity] = useState(3);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [currentSkincare, setCurrentSkincare] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SkinResult | null>(null);
  const [showSources, setShowSources] = useState(false);

  const toggleArea = (key: string) => {
    setSelectedAreas((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const handleAnalyze = async () => {
    if (!selectedConcern) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/skin-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          concern: selectedConcern,
          severity,
          affected_areas: selectedAreas,
          current_skincare: currentSkincare,
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const safetyBadge = (safety: string) => {
    if (safety === "safe") return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Safe</span>;
    if (safety === "caution") return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Caution</span>;
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">Avoid</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/50 p-12 text-center dark:border-pink-800 dark:bg-pink-950/20">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-pink-400" />
          <p className="text-sm text-muted-foreground">
            {lang === "tr" ? "Cilt analizi için giriş yapın" : "Sign in to analyze your skin health"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-pink-50 p-3 dark:bg-pink-950">
          <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("skin.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("skin.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Input Form */}
      {!result && !isLoading && (
        <div className="space-y-5">
          {/* Concern Selector */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("skin.concern", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CONCERNS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedConcern(c.key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    selectedConcern === c.key
                      ? "border-pink-400 bg-pink-50 text-pink-700 dark:border-pink-600 dark:bg-pink-950/30 dark:text-pink-300"
                      : "hover:border-pink-300 dark:hover:border-pink-700"
                  }`}
                >
                  <span className="mr-1">{c.emoji}</span>
                  <span className="text-sm font-medium">{tx(c.txKey, lang)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Slider */}
          <div>
            <label className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>{tx("skin.severity", lang)}</span>
              <span className={`text-sm font-bold ${
                severity <= 2 ? "text-green-600" : severity <= 3 ? "text-amber-600" : "text-red-600"
              }`}>
                {severity}/5
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{lang === "tr" ? "Hafif" : "Mild"}</span>
              <span>{tx("common.severe", lang)}</span>
            </div>
          </div>

          {/* Affected Areas */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("skin.areas", lang)}
            </label>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => toggleArea(a.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedAreas.includes(a.key)
                      ? "border-pink-400 bg-pink-50 text-pink-700 dark:border-pink-600 dark:bg-pink-950/30 dark:text-pink-300"
                      : "hover:border-pink-300 dark:hover:border-pink-700"
                  }`}
                >
                  {a.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Current Routine */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("skin.routine", lang)}
            </label>
            <textarea
              value={currentSkincare}
              onChange={(e) => setCurrentSkincare(e.target.value)}
              placeholder={lang === "tr" ? "Mevcut cilt bakim rutininizi yazın..." : "Describe your current skincare routine..."}
              className="w-full rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
              rows={3}
            />
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!selectedConcern}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            {tx("skin.analyze", lang)}
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-pink-500" />
          <p className="text-sm text-muted-foreground">{tx("skin.analyzing", lang)}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Skin Health Score */}
          <div className={`flex items-center gap-3 rounded-xl border-2 p-4 ${
            result.alertLevel === "green"
              ? "border-green-400 bg-green-50 dark:bg-green-950/30"
              : result.alertLevel === "yellow"
              ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
              : "border-red-400 bg-red-50 dark:bg-red-950/30"
          }`}>
            {result.alertLevel === "green" ? (
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : result.alertLevel === "yellow" ? (
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{lang === "tr" ? "Cilt Sagligi Skoru" : "Skin Health Score"}</span>
                <span className={`text-2xl font-bold ${
                  result.skinHealthScore >= 70 ? "text-green-600" : result.skinHealthScore >= 40 ? "text-amber-600" : "text-red-600"
                }`}>
                  {result.skinHealthScore}/100
                </span>
              </div>
              {result.concernAnalysis && (
                <p className="mt-1 text-sm text-muted-foreground">{result.concernAnalysis}</p>
              )}
            </div>
          </div>

          {/* Medication Effects */}
          {result.medicationEffects && result.medicationEffects.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Pill className="h-4 w-4 text-pink-500" />
                {tx("skin.medEffects", lang)}
              </h3>
              <div className="space-y-2">
                {result.medicationEffects.map((m, i) => (
                  <div key={i} className="rounded-lg bg-muted/30 p-3">
                    <p className="text-sm font-medium">{m.medication}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{m.skinEffect}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skincare Routine */}
          {result.skincareRoutine && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Droplets className="h-4 w-4 text-pink-500" />
                {tx("skin.recommendations", lang)}
              </h3>
              <div className="space-y-4">
                {/* Morning */}
                {result.skincareRoutine.morning && result.skincareRoutine.morning.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600 uppercase">
                      <Sun className="h-3.5 w-3.5" />
                      {lang === "tr" ? "Sabah" : "Morning"}
                    </p>
                    <div className="space-y-1.5">
                      {result.skincareRoutine.morning.map((s, i) => (
                        <div key={i} className="rounded-lg bg-amber-50/50 p-2.5 dark:bg-amber-950/10">
                          <p className="text-xs font-medium">{s.step}: <span className="font-normal text-muted-foreground">{s.product}</span></p>
                          <p className="text-xs text-muted-foreground">{s.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Evening */}
                {result.skincareRoutine.evening && result.skincareRoutine.evening.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase">
                      <Moon className="h-3.5 w-3.5" />
                      {lang === "tr" ? "Aksam" : "Evening"}
                    </p>
                    <div className="space-y-1.5">
                      {result.skincareRoutine.evening.map((s, i) => (
                        <div key={i} className="rounded-lg bg-indigo-50/50 p-2.5 dark:bg-indigo-950/10">
                          <p className="text-xs font-medium">{s.step}: <span className="font-normal text-muted-foreground">{s.product}</span></p>
                          <p className="text-xs text-muted-foreground">{s.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Weekly */}
                {result.skincareRoutine.weekly && result.skincareRoutine.weekly.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-pink-600 uppercase">
                      {lang === "tr" ? "Haftalık" : "Weekly"}
                    </p>
                    <div className="space-y-1.5">
                      {result.skincareRoutine.weekly.map((s, i) => (
                        <div key={i} className="rounded-lg bg-pink-50/50 p-2.5 dark:bg-pink-950/10">
                          <p className="text-xs font-medium">{s.step}: <span className="font-normal text-muted-foreground">{s.product}</span></p>
                          <p className="text-xs text-muted-foreground">{s.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supplements */}
          {result.supplements && result.supplements.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Leaf className="h-4 w-4 text-pink-500" />
                {tx("common.supplementSuggestions", lang)}
              </h3>
              <div className="space-y-2">
                {result.supplements.map((s, i) => (
                  <div key={i} className="rounded-lg bg-muted/30 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{s.name}</span>
                      {safetyBadge(s.safety)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.dosage} &middot; {s.duration}
                    </p>
                    <p className="mt-1 text-xs">{s.benefit}</p>
                    {s.interactionNote && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Pill className="h-3 w-3" />
                        {s.interactionNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Factors */}
          {result.lifestyleFactors && result.lifestyleFactors.length > 0 && (
            <div className="rounded-lg border border-pink-200 bg-pink-50/50 p-4 dark:border-pink-800 dark:bg-pink-950/20">
              <h3 className="mb-2 text-sm font-semibold text-pink-700 dark:text-pink-400">
                {lang === "tr" ? "Yasam Tarzi Önerileri" : "Lifestyle Tips"}
              </h3>
              <ul className="space-y-1">
                {result.lifestyleFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-pink-600 dark:text-pink-300">
                    <span className="mt-1">&#8226;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to See Doctor */}
          {result.whenToSeeDoctor && result.whenToSeeDoctor.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                {tx("common.whenToSeeDoctor", lang)}
              </h3>
              <ul className="space-y-1">
                {result.whenToSeeDoctor.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-300">
                    <span className="mt-1">&#8226;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {tx("common.sources", lang)} ({result.sources.length})
              </button>
              {showSources && (
                <div className="mt-2 space-y-1">
                  {result.sources.map((src, i) => (
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
              setResult(null);
              setSelectedConcern(null);
              setSelectedAreas([]);
              setSeverity(3);
              setCurrentSkincare("");
              setError(null);
            }}
            className="w-full"
          >
            {lang === "tr" ? "Yeni analiz yap" : "Start new analysis"}
          </Button>
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
