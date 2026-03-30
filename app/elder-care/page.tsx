// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Heart,
  Loader2,
  Pill,
  ShieldAlert,
  Brain,
  Apple,
  Users,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  LogIn,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface PolypharmacyData {
  riskLevel: "low" | "moderate" | "high";
  medicationCount: number;
  concerns: string[];
  recommendations: string[];
  timingOptimization: string[];
}

interface FallChecklistItem {
  item: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface CognitiveActivity {
  activity: string;
  frequency: string;
  benefit: string;
}

interface NutrientItem {
  nutrient: string;
  dailyGoal: string;
  sources: string;
  note: string;
}

interface ExerciseItem {
  type: string;
  frequency: string;
  duration: string;
  safetyNote: string;
}

interface ElderResult {
  polypharmacy: PolypharmacyData;
  fallPrevention: {
    riskLevel: "low" | "moderate" | "high";
    checklist: FallChecklistItem[];
  };
  cognitiveHealth: {
    activities: CognitiveActivity[];
    warningSignsToWatch: string[];
  };
  nutrition: {
    keyNutrients: NutrientItem[];
    mealTips: string[];
    hydrationGoal: string;
  };
  socialWellbeing: {
    riskFactors: string[];
    suggestions: string[];
    resources: string[];
  };
  exercise: {
    recommendations: ExerciseItem[];
  };
  summary: string;
}

export default function ElderCarePage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ElderResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    polypharmacy: true,
    fallPrevention: true,
    cognitive: true,
    nutrition: true,
    social: false,
    exercise: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

      const res = await fetch("/api/elder-care", {
        method: "POST",
        headers,
        body: JSON.stringify({ lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate review");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const riskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
      case "moderate":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
      default:
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800";
    }
  };

  const riskBadge = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500 text-white";
      case "moderate":
        return "bg-amber-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const priorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      case "medium":
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    }
  };

  const SectionHeader = ({ title, icon: Icon, sectionKey, badge, count }: { title: string; icon: React.ElementType; sectionKey: string; badge?: React.ReactNode; count?: number }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex w-full items-center justify-between rounded-t-lg border-b bg-amber-50/50 px-4 py-3 text-left dark:bg-amber-950/20"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-amber-700 dark:text-amber-400" />
        <span className="text-sm font-semibold">{title}</span>
        {badge}
        {count !== undefined && !badge && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
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
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
          <Heart className="h-6 w-6 text-amber-700 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("elder.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("elder.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Age note */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
        <Heart className="h-3.5 w-3.5 shrink-0" />
        {tx("elder.ageNote", lang)}
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <LogIn className="h-3.5 w-3.5 shrink-0" />
          {tx("elder.loginRequired", lang)}
        </div>
      )}

      {!result && (
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full gap-2 bg-amber-700 hover:bg-amber-800 text-white"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {tx("elder.analyzing", lang)}
            </>
          ) : (
            <>
              <Heart className="h-4 w-4" />
              {tx("elder.analyze", lang)}
            </>
          )}
        </Button>
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
          {/* Summary */}
          {result.summary && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* Polypharmacy Review */}
          {result.polypharmacy && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("elder.polypharmacy", lang)}
                icon={Pill}
                sectionKey="polypharmacy"
                badge={
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${riskBadge(result.polypharmacy.riskLevel)}`}>
                    {result.polypharmacy.medicationCount} {tx("elderCare.meds", lang)}
                  </span>
                }
              />
              {expandedSections.polypharmacy && (
                <div className="p-4 space-y-3">
                  <div className={`rounded-lg border p-3 ${riskColor(result.polypharmacy.riskLevel)}`}>
                    <p className="text-xs font-medium">
                      {tx("elderCare.riskLevel", lang)}: {result.polypharmacy.riskLevel.toUpperCase()}
                    </p>
                  </div>
                  {result.polypharmacy.concerns?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-400">{tx("elderCare.concerns", lang)}</p>
                      {result.polypharmacy.concerns.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm mb-1">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                          <p>{c}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.polypharmacy.recommendations?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-green-600 dark:text-green-400">{tx("common.recommendations", lang)}</p>
                      {result.polypharmacy.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm mb-1">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                          <p>{r}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.polypharmacy.timingOptimization?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">{tx("elderCare.timingOptimization", lang)}</p>
                      {result.polypharmacy.timingOptimization.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm mb-1">
                          <Clock className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                          <p>{t}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fall Prevention */}
          {result.fallPrevention?.checklist?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("elder.fallRisk", lang)}
                icon={ShieldAlert}
                sectionKey="fallPrevention"
                badge={
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${riskBadge(result.fallPrevention.riskLevel)}`}>
                    {result.fallPrevention.riskLevel}
                  </span>
                }
              />
              {expandedSections.fallPrevention && (
                <div className="p-4 space-y-2">
                  {result.fallPrevention.checklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                      {priorityIcon(item.priority)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.item}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cognitive Health */}
          {result.cognitiveHealth && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("elder.cognitive", lang)}
                icon={Brain}
                sectionKey="cognitive"
                count={result.cognitiveHealth.activities?.length}
              />
              {expandedSections.cognitive && (
                <div className="p-4 space-y-3">
                  {result.cognitiveHealth.activities?.map((a, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{a.activity}</p>
                      <p className="text-xs text-muted-foreground">{a.frequency}</p>
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{a.benefit}</p>
                    </div>
                  ))}
                  {result.cognitiveHealth.warningSignsToWatch?.length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50/30 p-3 dark:border-red-900 dark:bg-red-950/20">
                      <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        {tx("elderCare.warningSigns", lang)}
                      </p>
                      {result.cognitiveHealth.warningSignsToWatch.map((s, i) => (
                        <p key={i} className="text-xs text-red-700 dark:text-red-400">- {s}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nutrition */}
          {result.nutrition && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("elder.nutrition", lang)}
                icon={Apple}
                sectionKey="nutrition"
                count={result.nutrition.keyNutrients?.length}
              />
              {expandedSections.nutrition && (
                <div className="p-4 space-y-3">
                  {result.nutrition.keyNutrients?.map((n, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{n.nutrient}</p>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          {n.dailyGoal}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.sources}</p>
                      {n.note && <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{n.note}</p>}
                    </div>
                  ))}
                  {result.nutrition.hydrationGoal && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        {tx("elderCare.dailyHydration", lang)}: {result.nutrition.hydrationGoal}
                      </p>
                    </div>
                  )}
                  {result.nutrition.mealTips?.length > 0 && (
                    <div className="space-y-1">
                      {result.nutrition.mealTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 text-amber-500">-</span>
                          <p>{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Social Wellbeing */}
          {result.socialWellbeing && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("elder.socialRisk", lang)}
                icon={Users}
                sectionKey="social"
              />
              {expandedSections.social && (
                <div className="p-4 space-y-3">
                  {result.socialWellbeing.suggestions?.length > 0 && (
                    <div className="space-y-1">
                      {result.socialWellbeing.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                          <p>{s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.socialWellbeing.riskFactors?.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/30 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                      <p className="mb-1 text-xs font-semibold">{tx("elderCare.riskFactors", lang)}</p>
                      {result.socialWellbeing.riskFactors.map((f, i) => (
                        <p key={i} className="text-xs text-muted-foreground">- {f}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Exercise */}
          {result.exercise?.recommendations?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("common.exerciseRecs", lang)}
                icon={Dumbbell}
                sectionKey="exercise"
                count={result.exercise.recommendations.length}
              />
              {expandedSections.exercise && (
                <div className="p-4 space-y-2">
                  {result.exercise.recommendations.map((e, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{e.type}</p>
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        <span>{e.frequency}</span>
                        <span>{e.duration}</span>
                      </div>
                      {e.safetyNote && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{e.safetyNote}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Review */}
          <Button
            variant="outline"
            onClick={() => setResult(null)}
            className="w-full"
          >
            {tx("elderCare.newReview", lang)}
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
