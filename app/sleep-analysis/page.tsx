// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Moon, Loader2, ChevronDown, ChevronUp, Star, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { MorningCard } from "@/components/sleep/MorningCard";
import { MicroInsightCard } from "@/components/sleep/MicroInsightCard";
import { SleepDebtDonut } from "@/components/sleep/SleepDebtDonut";
import { ChronotypeCard } from "@/components/sleep/ChronotypeCard";
import { WindDownCard } from "@/components/sleep/WindDownCard";
import { AIDisclaimer } from "@/components/ai/AIDisclaimer";

// ── Types ──
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
  consistency: string;
  chronotype: string;
  patterns: string[];
  medicationEffects: string[];
  recommendations: string[];
  alertLevel: string;
  alertMessage: string;
  weekdayVsWeekend?: { weekdayAvg: number; weekendAvg: number; socialJetLag: boolean };
}

function SleepBar({ duration, maxHours = 12 }: { duration: number; maxHours?: number }) {
  const pct = Math.min((duration / maxHours) * 100, 100);
  const color = duration >= 7 ? "bg-green-400" : duration >= 5 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="h-5 w-full rounded bg-muted">
      <div className={`h-5 rounded ${color} flex items-center justify-end pr-1.5 text-[10px] font-medium text-white transition-all`}
        style={{ width: `${pct}%`, minWidth: duration > 0 ? "2rem" : 0 }}>
        {duration.toFixed(1)}h
      </div>
    </div>
  );
}

function HygieneGauge({ score }: { score: number }) {
  const rotation = (score / 100) * 180 - 90;
  const color = score >= 70 ? "text-green-500" : score >= 40 ? "text-amber-500" : "text-red-500";
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-20 w-40 overflow-hidden">
        <div className="absolute bottom-0 h-20 w-40 rounded-t-full border-[10px] border-gray-200 dark:border-gray-700 border-b-0" />
        <div className={`absolute bottom-0 left-1/2 h-1 w-16 origin-left ${color} rounded`}
          style={{ transform: `rotate(${rotation}deg)` }} />
        <div className="absolute bottom-0 left-1/2 -ml-1.5 h-3 w-3 rounded-full bg-indigo-500" />
      </div>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] text-muted-foreground">/100</span>
    </div>
  );
}

export default function SleepAnalysisPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [analysis, setAnalysis] = useState<SleepAnalysis | null>(null);
  const [microInsight, setMicroInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedToday, setLoggedToday] = useState(false);
  const [todayFactors, setTodayFactors] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // F-HEALTH-CLAIMS-001 6.2 (+ 6.2.1 fix): stable responseId tied to
  // whichever AI surface is showing — full analysis, micro-insight, OR
  // the morning card's AI sleep-time guess (rendered when the user
  // hasn't logged today yet). Regenerated when any of those flip so a
  // KVKK objection isn't conflated across surfaces. Declared after the
  // `loggedToday` state so the dep array doesn't hit the TDZ.
  const aiResponseId = useMemo(
    () => crypto.randomUUID(),
    [analysis, microInsight, loggedToday],
  );

  const authHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) h["Authorization"] = `Bearer ${session.access_token}`;
    return h;
  }, [session?.access_token]);

  const fetchRecords = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/sleep-analysis?days=30", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        const recs = data.records || [];
        setRecords(recs);
        // Check if today is already logged
        const today = new Date().toISOString().split("T")[0];
        const todayRec = recs.find((r: SleepRecord) => r.date === today);
        if (todayRec) setLoggedToday(true);
      }
    } catch { /* silent */ } finally { setIsLoading(false); }
  }, [isAuthenticated, session?.access_token, authHeaders]);

  // Fetch existing analysis
  const fetchAnalysis = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token || records.length < 3) return;
    try {
      const res = await fetch("/api/sleep-analysis/analyze", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ lang }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      }
    } catch { /* silent */ }
  }, [isAuthenticated, session?.access_token, records.length, authHeaders, lang]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { if (records.length >= 3) fetchAnalysis(); }, [records.length, fetchAnalysis]);

  // Save from morning card and get instant micro-insight
  const handleMorningSave = async (data: { bedtime: string; wakeTime: string; duration: number; quality: number; factors: string[] }) => {
    if (!isAuthenticated || !session?.access_token) return;
    setIsSaving(true);
    setError(null);
    setTodayFactors(data.factors);

    try {
      const res = await fetch("/api/sleep-analysis", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          bedtime: data.bedtime,
          wake_time: data.wakeTime,
          sleep_quality: data.quality,
          wake_count: 0,
          dreams: false,
          factors: data.factors,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error("Save failed");

      setLoggedToday(true);
      fetchRecords();

      // Instant micro-insight
      setIsInsightLoading(true);
      try {
        const insightRes = await fetch("/api/sleep-analysis/analyze", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ lang, micro: true, todayData: data }),
        });
        if (insightRes.ok) {
          const insightData = await insightRes.json();
          setMicroInsight(insightData.analysis?.microInsight || insightData.analysis?.recommendations?.[0] || null);
          setAnalysis(insightData.analysis);
        }
      } catch { /* silent */ } finally { setIsInsightLoading(false); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setIsSaving(false); }
  };

  // Weekly data for donut
  const last7 = records.slice(0, 7).reverse();
  const weeklyHours = last7.map((r) => r.sleep_duration || 0);
  // Pad to 7 if less
  while (weeklyHours.length < 7) weeklyHours.unshift(0);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Moon className="h-12 w-12 text-indigo-400" />
          <p className="text-lg text-muted-foreground">{tx("sleep.loginRequired", lang)}</p>
          <a href="/auth/login"><Button>{tx("nav.signInUp", lang)}</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
          <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("sleep.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("sleep.subtitle", lang)}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* ── Morning Card (conversational input) ── */}
          {!loggedToday && (
            <MorningCard lang={lang} onSubmit={handleMorningSave} isLoading={isSaving} />
          )}

          {/* Logged today indicator */}
          {loggedToday && !microInsight && !isInsightLoading && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Star className="h-4 w-4 fill-current" />
              {tx("sleep.loggedToday", lang)}
            </div>
          )}

          {/* ── Instant Micro-Insight ── */}
          <MicroInsightCard insight={microInsight} isLoading={isInsightLoading} lang={lang} />

          {/* ── Stats Grid ── */}
          {records.length >= 3 && (
            <div className="grid grid-cols-2 gap-4">
              {/* Sleep Debt Donut */}
              <div className="rounded-xl border p-4 flex items-center justify-center">
                <SleepDebtDonut weeklyHours={weeklyHours} targetHours={7.5} lang={lang} />
              </div>

              {/* Hygiene Score + Chronotype */}
              <div className="space-y-4">
                {analysis && (
                  <>
                    <div className="rounded-xl border p-3 flex items-center justify-center">
                      <HygieneGauge score={analysis.sleepHygieneScore} />
                    </div>
                    <ChronotypeCard chronotype={analysis.chronotype} lang={lang} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Weekly Overview ── */}
          {last7.length > 0 && (
            <div className="rounded-xl border p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                {tx("sleep.weeklyOverview", lang)}
              </h3>
              <div className="space-y-1.5">
                {last7.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-16 text-[10px] text-muted-foreground">
                      {new Date(r.date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <div className="flex-1">
                      <SleepBar duration={r.sleep_duration || 0} />
                    </div>
                    <div className="flex w-12 justify-end">
                      {Array.from({ length: 5 }, (_, s) => (
                        <Star key={s} className={`h-2.5 w-2.5 ${s < r.sleep_quality ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Analysis Details (collapsible) ── */}
          {analysis && (
            <div className="rounded-xl border overflow-hidden">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex w-full items-center justify-between bg-indigo-50/50 px-4 py-3 text-left dark:bg-indigo-950/20"
              >
                <span className="text-sm font-semibold">{tx("sleep.detectedPatterns", lang)}</span>
                {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showHistory && (
                <div className="p-4 space-y-3">
                  {analysis.patterns.map((p, i) => (
                    <p key={i} className="text-sm flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">-</span> {p}
                    </p>
                  ))}
                  {analysis.medicationEffects?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {lang === "tr" ? "İlaç Etkileri" : "Medication Effects"}
                      </p>
                      {analysis.medicationEffects.map((e, i) => (
                        <p key={i} className="text-xs text-muted-foreground">- {e}</p>
                      ))}
                    </div>
                  )}
                  {analysis.recommendations?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {lang === "tr" ? "Öneriler" : "Recommendations"}
                      </p>
                      {analysis.recommendations.map((r, i) => (
                        <p key={i} className="text-xs text-muted-foreground">- {r}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Wind-Down Mode (evening only) ── */}
          <WindDownCard lang={lang} factors={todayFactors.length > 0 ? todayFactors : (records[0]?.factors || [])} />
        </>
      )}

      {/* F-HEALTH-CLAIMS-001 6.2 (+ 6.2.1 fix): AI-content disclaimer
          renders whenever ANY AI surface is on screen — the morning
          card's sleep-time guess + chip prompts (rendered only when
          `!loggedToday`), the full analysis, OR the micro-insight.
          Earlier 6.2 cut omitted the morning-card path which is the
          first thing visitors see, so the disclaimer was missing on
          the most-viewed surface of the page. The legacy generic
          `disclaimer.tool` text below stays as a tool-level fallback. */}
      {(analysis || microInsight || !loggedToday) && (
        <AIDisclaimer compact={false} responseId={aiResponseId} />
      )}

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
