// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Loader2,
  Plus,
  CheckCircle2,
  LogIn,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface RehabProgram {
  id: string;
  surgery_type: string | null;
  surgery_date: string | null;
  condition: string | null;
  start_date: string;
  target_end_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface DailyLog {
  id: string;
  program_id: string;
  date: string;
  pain_level: number;
  mobility_score: number;
  exercises_completed: string | null;
  swelling: string;
  notes: string | null;
}

function getRecoveryPhase(startDate: string, targetEndDate: string | null): { phase: string; progressPercent: number } {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  const elapsed = now - start;
  const totalDays = elapsed / (1000 * 60 * 60 * 24);

  if (targetEndDate) {
    const end = new Date(targetEndDate).getTime();
    const total = end - start;
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));

    if (pct < 15) return { phase: "acute", progressPercent: pct };
    if (pct < 40) return { phase: "subacute", progressPercent: pct };
    if (pct < 75) return { phase: "recovery", progressPercent: pct };
    return { phase: "maintenance", progressPercent: pct };
  }

  // No target date — estimate by days
  if (totalDays < 14) return { phase: "acute", progressPercent: Math.min(100, (totalDays / 90) * 100) };
  if (totalDays < 42) return { phase: "subacute", progressPercent: Math.min(100, (totalDays / 90) * 100) };
  if (totalDays < 90) return { phase: "recovery", progressPercent: Math.min(100, (totalDays / 90) * 100) };
  return { phase: "maintenance", progressPercent: 100 };
}

const phaseColors: Record<string, string> = {
  acute: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  subacute: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  recovery: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  maintenance: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400",
};

export default function RehabilitationPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [programs, setPrograms] = useState<RehabProgram[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create program form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [surgeryType, setSurgeryType] = useState("");
  const [surgeryDate, setSurgeryDate] = useState("");
  const [condition, setCondition] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetEndDate, setTargetEndDate] = useState("");
  const [programNotes, setProgramNotes] = useState("");

  // Daily log form
  const [showLogForm, setShowLogForm] = useState<string | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);
  const [painLevel, setPainLevel] = useState(3);
  const [mobilityScore, setMobilityScore] = useState(5);
  const [exercisesCompleted, setExercisesCompleted] = useState("");
  const [swelling, setSwelling] = useState("none");
  const [logNotes, setLogNotes] = useState("");

  // Expanded programs
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/rehabilitation", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs || []);
        setLogs(data.logs || []);
        // Auto-expand first program
        if (data.programs?.length > 0) {
          setExpandedPrograms({ [data.programs[0].id]: true });
        }
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, session?.access_token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateProgram = async () => {
    if (!surgeryType && !condition) {
      setError(tx("rehab.surgeryOrConditionRequired", lang));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/rehabilitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: "create_program",
          surgery_type: surgeryType.trim(),
          surgery_date: surgeryDate || null,
          condition: condition.trim(),
          start_date: startDate,
          target_end_date: targetEndDate || null,
          notes: programNotes.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      setSuccessMsg(tx("rehab.programSaved", lang));
      setTimeout(() => setSuccessMsg(null), 3000);
      setSurgeryType("");
      setSurgeryDate("");
      setCondition("");
      setTargetEndDate("");
      setProgramNotes("");
      setShowCreateForm(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLog = async (programId: string) => {
    setIsSavingLog(true);
    setError(null);

    try {
      const res = await fetch("/api/rehabilitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: "daily_log",
          program_id: programId,
          pain_level: painLevel,
          mobility_score: mobilityScore,
          exercises_completed: exercisesCompleted.trim(),
          swelling,
          notes: logNotes.trim() || null,
          log_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      setSuccessMsg(tx("rehab.saved", lang));
      setTimeout(() => setSuccessMsg(null), 3000);
      setPainLevel(3);
      setMobilityScore(5);
      setExercisesCompleted("");
      setSwelling("none");
      setLogNotes("");
      setShowLogForm(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSavingLog(false);
    }
  };

  const getProgramLogs = (programId: string) =>
    logs.filter((l) => l.program_id === programId);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
            <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("rehab.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("rehab.subtitle", lang)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
          <LogIn className="h-4 w-4" />
          {tx("rehab.loginRequired", lang)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
          <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("rehab.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("rehab.subtitle", lang)}</p>
        </div>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Create Program Button */}
      <div className="mb-4">
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4" />
          {tx("rehab.createProgram", lang)}
        </Button>
      </div>

      {/* Create Program Form */}
      {showCreateForm && (
        <div className="mb-6 rounded-lg border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("rehab.surgeryType", lang)}</label>
              <input
                type="text"
                value={surgeryType}
                onChange={(e) => setSurgeryType(e.target.value)}
                placeholder={tx("rehab.surgeryPlaceholder", lang)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("rehab.condition", lang)}</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder={tx("rehab.conditionPlaceholder", lang)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("rehab.surgeryDate", lang)}</label>
              <input
                type="date"
                value={surgeryDate}
                onChange={(e) => setSurgeryDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("rehab.startDate", lang)}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("rehab.targetDate", lang)}</label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">{tx("vacc.notes", lang)}</label>
            <textarea
              value={programNotes}
              onChange={(e) => setProgramNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCreateProgram}
              disabled={isSaving}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {tx("rehab.createProgram", lang)}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
              {tx("common.close", lang)}
            </Button>
          </div>
        </div>
      )}

      {/* Programs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Activity className="mx-auto mb-2 h-8 w-8 opacity-30" />
          {tx("rehab.noPrograms", lang)}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">{tx("rehab.myPrograms", lang)}</h2>
          {programs.map((program) => {
            const { phase, progressPercent } = getRecoveryPhase(program.start_date, program.target_end_date);
            const programLogs = getProgramLogs(program.id);
            const isExpanded = expandedPrograms[program.id] || false;

            return (
              <div key={program.id} className="overflow-hidden rounded-lg border">
                {/* Program Header */}
                <button
                  onClick={() => setExpandedPrograms((prev) => ({ ...prev, [program.id]: !prev[program.id] }))}
                  className="flex w-full items-center justify-between bg-emerald-50/50 px-4 py-3 text-left dark:bg-emerald-950/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {program.surgery_type || program.condition}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${phaseColors[phase]}`}>
                        {tx(`rehab.${phase}`, lang)}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <span><Calendar className="mr-1 inline h-3 w-3" />{program.start_date}</span>
                      {program.target_end_date && (
                        <span>→ {program.target_end_date}</span>
                      )}
                      <span>{programLogs.length} {tx("rehab.logs", lang)}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium">{tx("rehab.progress", lang)}</span>
                        <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                        <span>{tx("rehab.acute", lang)}</span>
                        <span>{tx("rehab.subacute", lang)}</span>
                        <span>{tx("rehab.recovery", lang)}</span>
                        <span>{tx("rehab.maintenance", lang)}</span>
                      </div>
                    </div>

                    {/* Progress Chart (CSS bars) */}
                    {programLogs.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold">
                          <TrendingUp className="h-3 w-3" />
                          {tx("rehab.progress", lang)}
                        </h4>
                        <div className="flex items-end gap-1 h-24">
                          {programLogs.slice(-14).map((log, i) => (
                            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                              {/* Pain bar (inverted: lower pain = taller green) */}
                              <div
                                className="w-full rounded-t bg-red-400 dark:bg-red-600 transition-all"
                                style={{ height: `${(log.pain_level / 10) * 40}px` }}
                                title={`Pain: ${log.pain_level}/10`}
                              />
                              {/* Mobility bar */}
                              <div
                                className="w-full rounded-b bg-emerald-400 dark:bg-emerald-600 transition-all"
                                style={{ height: `${(log.mobility_score / 10) * 40}px` }}
                                title={`Mobility: ${log.mobility_score}/10`}
                              />
                              <span className="text-[8px] text-muted-foreground">
                                {tx("rehab.day", lang)} {i + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 flex gap-4 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded bg-red-400" /> {tx("rehab.painLevel", lang)}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded bg-emerald-400" /> {tx("rehab.mobility", lang)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Daily Log Button / Form */}
                    {showLogForm === program.id ? (
                      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                        <h4 className="text-sm font-semibold">{tx("rehab.dailyLog", lang)}</h4>

                        {/* Pain Level */}
                        <div>
                          <label className="mb-1 flex items-center justify-between text-xs font-medium">
                            <span>{tx("rehab.painLevel", lang)}</span>
                            <span className={`font-bold ${painLevel <= 3 ? "text-green-600" : painLevel <= 6 ? "text-amber-600" : "text-red-600"}`}>
                              {painLevel}/10
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={painLevel}
                            onChange={(e) => setPainLevel(parseInt(e.target.value))}
                            className="w-full accent-emerald-600"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>0</span><span>5</span><span>10</span>
                          </div>
                        </div>

                        {/* Mobility */}
                        <div>
                          <label className="mb-1 flex items-center justify-between text-xs font-medium">
                            <span>{tx("rehab.mobility", lang)}</span>
                            <span className={`font-bold ${mobilityScore >= 7 ? "text-green-600" : mobilityScore >= 4 ? "text-amber-600" : "text-red-600"}`}>
                              {mobilityScore}/10
                            </span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={mobilityScore}
                            onChange={(e) => setMobilityScore(parseInt(e.target.value))}
                            className="w-full accent-emerald-600"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>1</span><span>5</span><span>10</span>
                          </div>
                        </div>

                        {/* Swelling */}
                        <div>
                          <label className="mb-1 block text-xs font-medium">{tx("rehab.swelling", lang)}</label>
                          <div className="flex gap-2">
                            {(["none", "mild", "moderate", "severe"] as const).map((s) => {
                              const labelKey = s === "none" ? "rehab.none" : s === "mild" ? "rehab.mildSwelling" : s === "moderate" ? "rehab.moderateSwelling" : "rehab.severeSwelling";
                              return (
                                <button
                                  key={s}
                                  onClick={() => setSwelling(s)}
                                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                                    swelling === s
                                      ? s === "severe"
                                        ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                        : s === "moderate"
                                        ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                        : "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                      : "hover:bg-muted/50"
                                  }`}
                                >
                                  {tx(labelKey, lang)}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Exercises */}
                        <div>
                          <label className="mb-1 block text-xs font-medium">{tx("rehab.exercisesCompleted", lang)}</label>
                          <input
                            type="text"
                            value={exercisesCompleted}
                            onChange={(e) => setExercisesCompleted(e.target.value)}
                            placeholder={tx("rehab.exercisesCompletedPlaceholder", lang)}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="mb-1 block text-xs font-medium">{tx("vacc.notes", lang)}</label>
                          <textarea
                            value={logNotes}
                            onChange={(e) => setLogNotes(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveLog(program.id)}
                            disabled={isSavingLog}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {isSavingLog ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {tx("rehab.logEntry", lang)}
                          </Button>
                          <Button variant="ghost" onClick={() => setShowLogForm(null)}>
                            {tx("common.close", lang)}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowLogForm(program.id)}
                        className="w-full gap-2 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <Plus className="h-4 w-4" />
                        {tx("rehab.logEntry", lang)}
                      </Button>
                    )}

                    {/* Recent Logs */}
                    {programLogs.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-muted-foreground">
                          {tx("rehab.recentLogs", lang)}
                        </h4>
                        {programLogs.slice(-5).reverse().map((log) => (
                          <div key={log.id} className="flex items-center gap-3 rounded border p-2 text-xs">
                            <span className="shrink-0 text-muted-foreground">{log.date}</span>
                            <span className={`font-medium ${log.pain_level <= 3 ? "text-green-600" : log.pain_level <= 6 ? "text-amber-600" : "text-red-600"}`}>
                              P:{log.pain_level}
                            </span>
                            <span className={`font-medium ${log.mobility_score >= 7 ? "text-green-600" : log.mobility_score >= 4 ? "text-amber-600" : "text-red-600"}`}>
                              M:{log.mobility_score}
                            </span>
                            {log.swelling !== "none" && (
                              <span className="text-amber-600">{log.swelling}</span>
                            )}
                            {log.exercises_completed && (
                              <span className="truncate text-muted-foreground">{log.exercises_completed}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
