"use client";

import { useState } from "react";
import {
  Dumbbell,
  Loader2,
  Pill,
  Utensils,
  Heart,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LogIn,
  CheckCircle2,
  Target,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SupplementItem {
  name: string;
  dose: string;
  timing: string;
  evidenceGrade: "A" | "B" | "C";
  benefit: string;
  safety: "safe" | "caution" | "avoid";
  safetyNote: string;
  duration: string;
}

interface RecoveryItem {
  method: string;
  frequency: string;
  duration: string;
  benefit: string;
}

interface InjuryItem {
  area: string;
  exercise: string;
  frequency: string;
}

interface SourceItem {
  title: string;
  url: string;
}

interface SportsResult {
  supplementPlan: SupplementItem[];
  nutritionTiming: {
    preWorkout: { timing: string; foods: string[]; macros: string };
    duringWorkout: { timing: string; foods: string[]; notes: string };
    postWorkout: { timing: string; foods: string[]; macros: string };
    generalTips: string[];
  };
  recoveryProtocol: RecoveryItem[];
  injuryPrevention: InjuryItem[];
  overtrainingWarnings: string[];
  weeklyStructure: string;
  interactionWarnings: string[];
  sources: SourceItem[];
}

const SPORT_TYPES = [
  { key: "running", emoji: "running" },
  { key: "swimming", emoji: "swimming" },
  { key: "cycling", emoji: "cycling" },
  { key: "gym", emoji: "gym" },
  { key: "teamSport", emoji: "teamSport" },
  { key: "martialArts", emoji: "martialArts" },
];

const GOALS = [
  { key: "endurance" },
  { key: "strength" },
  { key: "recovery" },
  { key: "flexibility" },
  { key: "weightLoss" },
];

export default function SportsPerformancePage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [sportType, setSportType] = useState("");
  const [goal, setGoal] = useState("");
  const [frequency, setFrequency] = useState(3);
  const [supplements, setSupplements] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SportsResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    supplements: true,
    nutrition: true,
    recovery: true,
    injury: false,
    warnings: true,
    sources: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAnalyze = async () => {
    if (!sportType) {
      setError(lang === "tr" ? "Lutfen bir spor turu secin" : "Please select a sport type");
      return;
    }
    if (!goal) {
      setError(lang === "tr" ? "Lutfen bir hedef secin" : "Please select a goal");
      return;
    }

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

      const res = await fetch("/api/sports-performance", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sport_type: sportType,
          goal,
          training_frequency: frequency,
          current_supplements: supplements.trim(),
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get plan");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const safetyColor = (safety: string) => {
    switch (safety) {
      case "avoid":
        return "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20";
      case "caution":
        return "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20";
      default:
        return "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20";
    }
  };

  const safetyBadge = (safety: string) => {
    switch (safety) {
      case "avoid":
        return "bg-red-500 text-white";
      case "caution":
        return "bg-amber-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const gradeBadge = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "B":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const SectionHeader = ({ title, icon: Icon, sectionKey, count }: { title: string; icon: React.ElementType; sectionKey: string; count?: number }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex w-full items-center justify-between rounded-t-lg border-b bg-indigo-50/50 px-4 py-3 text-left dark:bg-indigo-950/20"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold">{title}</span>
        {count !== undefined && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {count}
          </span>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
          <Dumbbell className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("sports.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("sports.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 text-xs text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-300">
          <LogIn className="h-3.5 w-3.5 shrink-0" />
          {lang === "tr" ? "Ilac etkilesim kontrolu icin giris yapin" : "Sign in for medication interaction checking"}
        </div>
      )}

      {!result && (
        <>
          {/* Sport Type */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("sports.sportType", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SPORT_TYPES.map(({ key }) => (
                <button
                  key={key}
                  onClick={() => setSportType(key)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                    sportType === key
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Dumbbell className="h-4 w-4" />
                  <span className="text-sm font-medium">{tx(`sports.${key}`, lang)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("sports.goal", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {GOALS.map(({ key }) => (
                <button
                  key={key}
                  onClick={() => setGoal(key)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                    goal === key
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">{tx(`sports.${key}`, lang)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("sports.frequency", lang)}: <span className="text-indigo-600 dark:text-indigo-400">{frequency} {lang === "tr" ? "gun/hafta" : "days/week"}</span>
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
            </div>
          </div>

          {/* Current Supplements */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {lang === "tr" ? "Mevcut Takviyeler (istege bagli)" : "Current Supplements (optional)"}
            </label>
            <input
              type="text"
              value={supplements}
              onChange={(e) => setSupplements(e.target.value)}
              placeholder={lang === "tr" ? "orn: kreatin, protein tozu, omega-3" : "e.g., creatine, protein powder, omega-3"}
              maxLength={500}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !sportType || !goal}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("sports.analyzing", lang)}
              </>
            ) : (
              <>
                <Dumbbell className="h-4 w-4" />
                {tx("sports.analyze", lang)}
              </>
            )}
          </Button>
        </>
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
          {/* Interaction Warnings */}
          {result.interactionWarnings?.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <p className="mb-2 flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {lang === "tr" ? "Ilac Etkilesim Uyarilari" : "Medication Interaction Warnings"}
              </p>
              {result.interactionWarnings.map((w, i) => (
                <p key={i} className="text-sm text-red-700 dark:text-red-400">- {w}</p>
              ))}
            </div>
          )}

          {/* Weekly Structure */}
          {result.weeklyStructure && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-4 dark:border-indigo-800 dark:bg-indigo-950/10">
              <p className="mb-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {lang === "tr" ? "Haftalik Yapi" : "Weekly Structure"}
              </p>
              <p className="text-sm">{result.weeklyStructure}</p>
            </div>
          )}

          {/* Supplement Plan */}
          {result.supplementPlan?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("sports.supplements", lang)}
                icon={Pill}
                sectionKey="supplements"
                count={result.supplementPlan.length}
              />
              {expandedSections.supplements && (
                <div className="p-4 space-y-2">
                  {result.supplementPlan.map((s, i) => (
                    <div key={i} className={`rounded-lg border p-3 ${safetyColor(s.safety)}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{s.name}</p>
                        <div className="flex gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${gradeBadge(s.evidenceGrade)}`}>
                            {s.evidenceGrade}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${safetyBadge(s.safety)}`}>
                            {s.safety === "safe" ? (lang === "tr" ? "Guvenli" : "Safe") :
                             s.safety === "caution" ? (lang === "tr" ? "Dikkat" : "Caution") :
                             (lang === "tr" ? "Kacinilmali" : "Avoid")}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs">{s.benefit}</p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <p className="font-medium">{lang === "tr" ? "Doz" : "Dose"}</p>
                          <p>{s.dose}</p>
                        </div>
                        <div>
                          <p className="font-medium">{lang === "tr" ? "Zamanlama" : "Timing"}</p>
                          <p>{s.timing}</p>
                        </div>
                        <div>
                          <p className="font-medium">{lang === "tr" ? "Sure" : "Duration"}</p>
                          <p>{s.duration}</p>
                        </div>
                      </div>
                      {s.safetyNote && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="mr-1 inline h-3 w-3" />{s.safetyNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nutrition Timing */}
          {result.nutritionTiming && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("sports.nutritionTiming", lang)}
                icon={Utensils}
                sectionKey="nutrition"
              />
              {expandedSections.nutrition && (
                <div className="p-4 space-y-3">
                  {/* Pre-Workout */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">
                      {lang === "tr" ? "Antrenman Oncesi" : "Pre-Workout"} ({result.nutritionTiming.preWorkout.timing})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {result.nutritionTiming.preWorkout.foods.map((f, i) => (
                        <span key={i} className="rounded bg-green-50 px-2 py-0.5 text-xs dark:bg-green-950">{f}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{result.nutritionTiming.preWorkout.macros}</p>
                  </div>

                  {/* During Workout */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {lang === "tr" ? "Antrenman Sirasinda" : "During Workout"} ({result.nutritionTiming.duringWorkout.timing})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {result.nutritionTiming.duringWorkout.foods.map((f, i) => (
                        <span key={i} className="rounded bg-amber-50 px-2 py-0.5 text-xs dark:bg-amber-950">{f}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{result.nutritionTiming.duringWorkout.notes}</p>
                  </div>

                  {/* Post-Workout */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {lang === "tr" ? "Antrenman Sonrasi" : "Post-Workout"} ({result.nutritionTiming.postWorkout.timing})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {result.nutritionTiming.postWorkout.foods.map((f, i) => (
                        <span key={i} className="rounded bg-indigo-50 px-2 py-0.5 text-xs dark:bg-indigo-950">{f}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{result.nutritionTiming.postWorkout.macros}</p>
                  </div>

                  {/* General Tips */}
                  {result.nutritionTiming.generalTips?.length > 0 && (
                    <div className="space-y-1">
                      {result.nutritionTiming.generalTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 text-indigo-500">-</span>
                          <p>{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recovery */}
          {result.recoveryProtocol?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("sports.recoveryTips", lang)}
                icon={Heart}
                sectionKey="recovery"
                count={result.recoveryProtocol.length}
              />
              {expandedSections.recovery && (
                <div className="p-4 space-y-2">
                  {result.recoveryProtocol.map((r, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{r.method}</p>
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        <span>{r.frequency}</span>
                        <span>{r.duration}</span>
                      </div>
                      <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">{r.benefit}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Injury Prevention */}
          {result.injuryPrevention?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={lang === "tr" ? "Sakatligi Onleme" : "Injury Prevention"}
                icon={ShieldAlert}
                sectionKey="injury"
                count={result.injuryPrevention.length}
              />
              {expandedSections.injury && (
                <div className="p-4 space-y-2">
                  {result.injuryPrevention.map((ip, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{ip.area}</p>
                      <p className="text-xs text-muted-foreground">{ip.exercise}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">{ip.frequency}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overtraining Warnings */}
          {result.overtrainingWarnings?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("sports.warnings", lang)}
                icon={AlertTriangle}
                sectionKey="warnings"
                count={result.overtrainingWarnings.length}
              />
              {expandedSections.warnings && (
                <div className="p-4 space-y-1">
                  {result.overtrainingWarnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <p>{w}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sources */}
          {result.sources?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={lang === "tr" ? "Kaynaklar" : "Sources"}
                icon={Info}
                sectionKey="sources"
                count={result.sources.length}
              />
              {expandedSections.sources && (
                <div className="p-4 space-y-1">
                  {result.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Plan */}
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setSportType("");
              setGoal("");
              setFrequency(3);
              setSupplements("");
            }}
            className="w-full"
          >
            {lang === "tr" ? "Yeni Plan" : "New Plan"}
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
