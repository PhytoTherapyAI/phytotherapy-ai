// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Moon, Dumbbell, Leaf, Utensils, Pill, Brain,
  AlertTriangle, ChevronDown, ChevronUp, Loader2, ArrowRight, Zap, Info,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useActiveProfile } from "@/lib/use-active-profile";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SynergyAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  modules: string[];
  action?: string;
  herb?: string;
}

interface AIInsight {
  dailySynergy: string;
  topPriority: string;
  actions: Array<{ icon: string; text: string; module: string }>;
  phytotherapyPick?: {
    herb: string;
    dose: string;
    reason: string;
    evidence: string;
  };
  synergyScore: number;
}

interface SynergyData {
  alerts: SynergyAlert[];
  aiInsight: AIInsight | null;
  context: {
    sleep: { weekAvg: number; sleepDebt: number; lastNight: { duration: number } | null };
    fitness: { sportType: string | null };
    supplements: { total: number; takenToday: number };
    streaks: { checkInStreak: number };
  };
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  sleep: Moon, fitness: Dumbbell, nutrition: Utensils,
  supplements: Pill, "mental-health": Brain, default: Sparkles,
};

const SEVERITY_STYLES = {
  critical: "border-red-300 bg-red-50/80 dark:border-red-800 dark:bg-red-950/30",
  warning: "border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30",
  info: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
};

const SEVERITY_DOT = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-400",
};

function ScoreRing({ score }: { score: number }) {
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-muted, #e5e7eb)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export function DailySynergyCard() {
  const { session } = useAuth();
  const { activeUserId, isOwnProfile } = useActiveProfile();
  const { lang } = useLang();
  const [data, setData] = useState<SynergyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const fetchSynergy = useCallback(async () => {
    if (!session?.access_token) return;

    // Cache key includes activeUserId so switching profiles doesn't reuse the previous
    // profile's synergy report.
    const cacheKey = `synergy-${activeUserId || "self"}-${new Date().toISOString().split("T")[0]}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached));
        setIsLoading(false);
        return;
      }
    } catch { /* ignore */ }

    setIsLoading(true);
    try {
      const res = await fetch("/api/master-orchestrator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        // Send targetUserId so the endpoint aggregates the active profile's data
        // (own profile when isOwnProfile; family member otherwise).
        body: JSON.stringify({ lang, targetUserId: isOwnProfile ? undefined : activeUserId }),
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch { /* ignore */ }
      }
    } catch { /* silent */ } finally { setIsLoading(false); }
  }, [session?.access_token, lang, activeUserId, isOwnProfile]);

  useEffect(() => { fetchSynergy(); }, [fetchSynergy]);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-4 dark:from-indigo-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          <div className="h-3 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const ai = data.aiInsight;

  return (
    <div className="space-y-3">
      {/* Main Synergy Card */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white p-4 dark:border-indigo-800 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-background">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-400/5 blur-2xl" />

        <div className="relative">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold">
                {lang === "tr" ? "Günün Sinerji Raporu" : "Daily Synergy Report"}
              </h3>
            </div>
            {ai?.synergyScore !== undefined && <ScoreRing score={ai.synergyScore} />}
          </div>

          {/* AI Synergy insight */}
          {ai?.dailySynergy && (
            <p className="text-sm leading-relaxed text-foreground/90 mb-3">{ai.dailySynergy}</p>
          )}

          {/* Top Priority */}
          {ai?.topPriority && (
            <div className="flex items-start gap-2 rounded-lg bg-indigo-100/60 px-3 py-2 mb-3 dark:bg-indigo-900/20">
              <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {lang === "tr" ? "Bugünün Önceliği" : "Today's Priority"}
                </p>
                <p className="text-xs font-medium mt-0.5">{ai.topPriority}</p>
              </div>
            </div>
          )}

          {/* Action items */}
          {ai?.actions && ai.actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {ai.actions.slice(0, 4).map((action, i) => {
                const Icon = MODULE_ICONS[action.module] || MODULE_ICONS.default;
                return (
                  <div key={i} className="flex items-center gap-1.5 rounded-full border bg-white/60 px-2.5 py-1 text-[11px] dark:bg-white/5">
                    <Icon className="h-3 w-3 text-indigo-500" />
                    <span>{action.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phytotherapy pick */}
          {ai?.phytotherapyPick && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/20">
              <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {ai.phytotherapyPick.herb} — {ai.phytotherapyPick.dose}
                  <span className="ml-1 rounded bg-emerald-100 px-1 py-0.5 text-[10px] font-bold dark:bg-emerald-900">
                    {ai.phytotherapyPick.evidence}
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{ai.phytotherapyPick.reason}</p>
              </div>
            </div>
          )}

          {/* Module connection visual */}
          {data.alerts.length > 0 && (
            <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Info className="h-3 w-3" />
              {lang === "tr" ? "Modüller arası bağlantı:" : "Cross-module connections:"}
              {[...new Set(data.alerts.flatMap(a => a.modules))].map((m, i) => {
                const Icon = MODULE_ICONS[m] || MODULE_ICONS.default;
                return (
                  <span key={m} className="flex items-center gap-0.5">
                    {i > 0 && <ArrowRight className="h-2.5 w-2.5" />}
                    <Icon className="h-3 w-3" />
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cross-Module Alerts */}
      {data.alerts.map((alert) => (
        <div key={alert.id} className={`rounded-xl border p-3 ${SEVERITY_STYLES[alert.severity]}`}>
          <button
            onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
            className="flex w-full items-start gap-2 text-left"
          >
            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${SEVERITY_DOT[alert.severity]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {alert.modules.map((m) => {
                  const Icon = MODULE_ICONS[m] || MODULE_ICONS.default;
                  return <Icon key={m} className="h-3 w-3 text-muted-foreground" />;
                })}
                <span className="text-xs font-semibold truncate">{alert.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
            </div>
            {(alert.action || alert.herb) && (
              expandedAlert === alert.id
                ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>

          {expandedAlert === alert.id && (
            <div className="mt-2 space-y-2 pl-4 border-l-2 border-current/10">
              {alert.action && (
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />
                  <p className="text-xs">{alert.action}</p>
                </div>
              )}
              {alert.herb && (
                <div className="flex items-start gap-1.5">
                  <Leaf className="h-3 w-3 mt-0.5 text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">{alert.herb}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
