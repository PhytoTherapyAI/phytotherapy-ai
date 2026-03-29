"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Heart,
  Pill,
  Leaf,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface MetricItem {
  name: string;
  currentValue: string;
  targetRange: string;
  status: "good" | "warning" | "critical";
}

interface LifestyleItem {
  area: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

interface SupplementItem {
  name: string;
  dosage: string;
  duration: string;
  safety: "safe" | "caution" | "avoid";
  reason: string;
  interactionNote: string;
}

interface ChronicResult {
  controlStatus: "well_controlled" | "borderline" | "uncontrolled";
  controlSummary: string;
  keyMetrics: MetricItem[];
  adherenceScore: number;
  adherenceNotes: string;
  lifestyle: LifestyleItem[];
  supplements: SupplementItem[];
  urgentSigns: string[];
  nextSteps: string[];
  sources?: Array<{ title: string; url: string }>;
}

const CONDITIONS = [
  { key: "Type 2 Diabetes", icon: Activity, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  { key: "Hypertension", icon: Heart, color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  { key: "Hypothyroidism", icon: TrendingUp, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
  { key: "Asthma", icon: Activity, color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400" },
  { key: "COPD", icon: Activity, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
  { key: "PCOS", icon: Activity, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" },
];

export default function ChronicCarePage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ChronicResult | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [userConditions, setUserConditions] = useState<string[]>([]);

  // Detect conditions from user profile
  useEffect(() => {
    if (!isAuthenticated || !session?.access_token) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user-data", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.chronic_conditions) {
            setUserConditions(data.profile.chronic_conditions);
          }
        }
      } catch {
        // Ignore
      }
    };
    fetchProfile();
  }, [isAuthenticated, session?.access_token]);

  const handleAnalyze = async (condition: string) => {
    setSelectedCondition(condition);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/chronic-care", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ condition, lang }),
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

  const controlStatusConfig = {
    well_controlled: {
      color: "border-green-400 bg-green-50 dark:bg-green-950/30",
      textColor: "text-green-700 dark:text-green-400",
      icon: CheckCircle2,
      label: tx("chronic.wellControlled", lang),
    },
    borderline: {
      color: "border-amber-400 bg-amber-50 dark:bg-amber-950/30",
      textColor: "text-amber-700 dark:text-amber-400",
      icon: AlertTriangle,
      label: tx("chronic.borderline", lang),
    },
    uncontrolled: {
      color: "border-red-400 bg-red-50 dark:bg-red-950/30",
      textColor: "text-red-700 dark:text-red-400",
      icon: ShieldAlert,
      label: tx("chronic.uncontrolled", lang),
    },
  };

  const safetyBadge = (safety: string) => {
    if (safety === "safe") return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Safe</span>;
    if (safety === "caution") return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Caution</span>;
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">Avoid</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/50 p-12 text-center dark:border-rose-800 dark:bg-rose-950/20">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-rose-400" />
          <p className="text-sm text-muted-foreground">{tx("chronic.loginRequired", lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950">
          <Activity className="h-6 w-6 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("chronic.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("chronic.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Condition Selector */}
      {!result && !isLoading && (
        <>
          {userConditions.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {tx("chronicCare.fromProfile", lang)}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {userConditions.map((uc) => {
                  const matched = CONDITIONS.find((c) => c.key.toLowerCase() === uc.toLowerCase());
                  const Icon = matched?.icon || Activity;
                  return (
                    <button
                      key={uc}
                      onClick={() => handleAnalyze(uc)}
                      className="flex items-center gap-3 rounded-xl border-2 border-rose-200 bg-rose-50/50 p-4 text-left transition-all hover:border-rose-400 hover:shadow-md dark:border-rose-800 dark:bg-rose-950/20 dark:hover:border-rose-600"
                    >
                      <div className={`rounded-lg p-2 ${matched?.color || "bg-rose-100 text-rose-600"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{uc}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx("chronicCare.analyze", lang)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx("chronic.selectCondition", lang)}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CONDITIONS.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.key}
                  onClick={() => handleAnalyze(c.key)}
                  className="flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:border-rose-400 hover:shadow-md dark:hover:border-rose-600"
                >
                  <div className={`rounded-lg p-2 ${c.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{c.key}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          {userConditions.length === 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {tx("chronic.noConditions", lang)}
            </p>
          )}
        </>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm text-muted-foreground">{tx("chronic.analyzing", lang)}</p>
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
          {/* Control Status Badge */}
          {(() => {
            const config = controlStatusConfig[result.controlStatus] || controlStatusConfig.borderline;
            const Icon = config.icon;
            return (
              <div className={`flex items-center gap-3 rounded-xl border-2 p-4 ${config.color}`}>
                <Icon className={`h-8 w-8 ${config.textColor}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${config.textColor}`}>{config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedCondition}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${config.textColor}`}>{result.controlSummary}</p>
                </div>
              </div>
            );
          })()}

          {/* Adherence Score */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{tx("chronicCare.adherenceScore", lang)}</span>
              <span className={`text-lg font-bold ${
                result.adherenceScore >= 80 ? "text-green-600" : result.adherenceScore >= 50 ? "text-amber-600" : "text-red-600"
              }`}>
                {result.adherenceScore}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all ${
                  result.adherenceScore >= 80 ? "bg-green-500" : result.adherenceScore >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(result.adherenceScore, 100)}%` }}
              />
            </div>
            {result.adherenceNotes && (
              <p className="mt-2 text-xs text-muted-foreground">{result.adherenceNotes}</p>
            )}
          </div>

          {/* Key Metrics */}
          {result.keyMetrics && result.keyMetrics.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-rose-500" />
                {tx("chronic.keyMetrics", lang)}
              </h3>
              <div className="space-y-2">
                {result.keyMetrics.map((m, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx("chronicCare.target", lang)}: {m.targetRange}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        m.status === "good" ? "text-green-600" : m.status === "warning" ? "text-amber-600" : "text-red-600"
                      }`}>
                        {m.currentValue}
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        m.status === "good" ? "bg-green-500" : m.status === "warning" ? "bg-amber-500" : "bg-red-500"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Recommendations */}
          {result.lifestyle && result.lifestyle.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Heart className="h-4 w-4 text-rose-500" />
                {tx("chronic.lifestyle", lang)}
              </h3>
              <div className="space-y-2">
                {result.lifestyle.map((l, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      l.priority === "high" ? "bg-red-500" : l.priority === "medium" ? "bg-amber-500" : "bg-green-500"
                    }`} />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">{l.area}</p>
                      <p className="text-sm">{l.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supplements */}
          {result.supplements && result.supplements.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Leaf className="h-4 w-4 text-rose-500" />
                {tx("chronic.supplements", lang)}
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
                    <p className="mt-1 text-xs">{s.reason}</p>
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

          {/* Urgent Warning Signs */}
          {result.urgentSigns && result.urgentSigns.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                {tx("chronic.urgentSigns", lang)}
              </h3>
              <ul className="space-y-1">
                {result.urgentSigns.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-300">
                    <span className="mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {result.nextSteps && result.nextSteps.length > 0 && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-800 dark:bg-rose-950/20">
              <h3 className="mb-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
                {tx("chronicCare.nextSteps", lang)}
              </h3>
              <ul className="space-y-1">
                {result.nextSteps.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-300">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
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
              setSelectedCondition(null);
              setError(null);
            }}
            className="w-full"
          >
            {tx("chronicCare.analyzeAnother", lang)}
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
