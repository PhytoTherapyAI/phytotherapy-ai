// © 2026 Doctopal — All Rights Reserved
"use client";

import { useReducer } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell, Loader2, Pill, Utensils, Heart, ShieldAlert,
  AlertTriangle, ChevronDown, ChevronUp, LogIn, Info, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { IntentBar } from "@/components/sports/IntentBar";
import { IntentCards } from "@/components/sports/IntentCards";
import { TodayFocusCard } from "@/components/sports/TodayFocusCard";
import { SupplementTimer } from "@/components/sports/SupplementTimer";
import { DrugSafetyCard } from "@/components/sports/DrugSafetyCard";
import { WeeklyProgressBar } from "@/components/sports/WeeklyProgressBar";

// ── Types ──
interface SportsResult {
  extractedIntent?: Record<string, string | number>;
  todayFocus?: { title: string; description: string; keyAction: string; evidenceGrade: string };
  supplementPlan: Array<{
    name: string; dose: string; timing: string; evidenceGrade: "A" | "B" | "C";
    benefit: string; safety: "safe" | "caution" | "avoid"; safetyNote: string; duration: string;
  }>;
  safetyWarnings?: Array<{
    supplement: string; medication: string; severity: "avoid" | "caution" | "monitor";
    why: string; whatToDo: string;
  }>;
  nutritionTiming: {
    preWorkout: { timing: string; foods: string[]; macros: string };
    duringWorkout: { timing: string; foods: string[]; notes: string };
    postWorkout: { timing: string; foods: string[]; macros: string };
    generalTips: string[];
  };
  recoveryProtocol: Array<{ method: string; frequency: string; duration: string; benefit: string }>;
  injuryPrevention: Array<{ area: string; exercise: string; frequency: string }>;
  overtrainingWarnings: string[];
  weeklyStructure: string;
  interactionWarnings: string[];
  sources: Array<{ title: string; url: string }>;
}

type Phase = "input" | "extracting" | "confirming" | "loading" | "result" | "error";

interface State {
  phase: Phase;
  rawInput: string;
  result: SportsResult | null;
  error: string | null;
  sections: Record<string, boolean>;
}

type Action =
  | { type: "SUBMIT_INTENT"; input: string }
  | { type: "INTENT_EXTRACTED"; result: SportsResult }
  | { type: "CONFIRM" }
  | { type: "LOADED"; result: SportsResult }
  | { type: "ERROR"; error: string }
  | { type: "RESET" }
  | { type: "EDIT" }
  | { type: "TOGGLE_SECTION"; key: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SUBMIT_INTENT":
      return { ...state, phase: "extracting", rawInput: action.input, error: null };
    case "INTENT_EXTRACTED":
      return { ...state, phase: "result", result: action.result };
    case "ERROR":
      return { ...state, phase: "error", error: action.error };
    case "RESET":
      return { phase: "input", rawInput: "", result: null, error: null, sections: { nutrition: true, recovery: false, injury: false, warnings: false, sources: false } };
    case "EDIT":
      return { ...state, phase: "input", result: null };
    case "TOGGLE_SECTION":
      return { ...state, sections: { ...state.sections, [action.key]: !state.sections[action.key] } };
    default:
      return state;
  }
}

const initialState: State = {
  phase: "input",
  rawInput: "",
  result: null,
  error: null,
  sections: { nutrition: true, recovery: false, injury: false, warnings: false, sources: false },
};

// ── Section Header ──
function SectionHeader({ title, icon: Icon, sectionKey, count, expanded, onToggle }: {
  title: string; icon: React.ElementType; sectionKey: string; count?: number;
  expanded: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-t-lg border-b bg-primary/5 px-4 py-3 text-left dark:bg-indigo-950/20"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{title}</span>
        {count !== undefined && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary">
            {count}
          </span>
        )}
      </div>
      {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

export default function SportsPerformancePage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSubmitIntent = async (input: string) => {
    dispatch({ type: "SUBMIT_INTENT", input });

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/sports-performance", {
        method: "POST",
        headers,
        body: JSON.stringify({ raw_input: input, lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get plan");
      }

      const data: SportsResult = await res.json();
      dispatch({ type: "INTENT_EXTRACTED", result: data });
    } catch (err) {
      dispatch({ type: "ERROR", error: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  const r = state.result;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3">
          <Dumbbell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {tx("sports.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("sports.subtitle", lang)}</p>
        </div>
      </motion.div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary dark:border-primary/30 dark:bg-primary/10 dark:text-primary">
          <LogIn className="h-3.5 w-3.5 shrink-0" />
          {tx("sports.guestNote", lang)}
        </div>
      )}

      {/* ── Phase: Input ── */}
      {state.phase === "input" && (
        <IntentBar lang={lang} isLoading={false} onSubmit={handleSubmitIntent} />
      )}

      {/* ── Phase: Extracting ── */}
      {state.phase === "extracting" && (
        <div className="space-y-4">
          <IntentBar lang={lang} isLoading={true} onSubmit={() => {}} />
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {tx("sports.generatingPlan", lang)}
          </div>
          {/* Skeleton cards */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="h-4 w-2/3 rounded bg-muted animate-pulse mb-2" />
                <div className="h-3 w-full rounded bg-muted animate-pulse mb-1" />
                <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Phase: Error ── */}
      {state.phase === "error" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {state.error}
          </div>
          <Button variant="outline" onClick={() => dispatch({ type: "RESET" })} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            {tx("sports.newPlan", lang)}
          </Button>
        </div>
      )}

      {/* ── Phase: Result ── */}
      {state.phase === "result" && r && (
        <div className="space-y-4">
          {/* Intent cards */}
          {r.extractedIntent && <IntentCards intent={r.extractedIntent} lang={lang} />}

          {/* Today's Focus */}
          {r.todayFocus && <TodayFocusCard focus={r.todayFocus} lang={lang} />}

          {/* Drug Safety Warnings */}
          {r.safetyWarnings && r.safetyWarnings.length > 0 && (
            <DrugSafetyCard warnings={r.safetyWarnings} lang={lang} />
          )}

          {/* Legacy interaction warnings (backward compat) */}
          {!r.safetyWarnings?.length && r.interactionWarnings?.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <p className="mb-2 flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {tx("sports.interactionWarnings", lang)}
              </p>
              {r.interactionWarnings.map((w, i) => (
                <p key={i} className="text-sm text-red-700 dark:text-red-400">- {w}</p>
              ))}
            </div>
          )}

          {/* Weekly Structure */}
          {r.weeklyStructure && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-4 dark:border-indigo-800 dark:bg-indigo-950/10">
              <p className="mb-1 text-xs font-semibold text-primary">
                {tx("sports.weeklyStructure", lang)}
              </p>
              <p className="text-sm">{r.weeklyStructure}</p>
            </div>
          )}

          {/* Supplement Timer (interactive checklist) */}
          {r.supplementPlan?.length > 0 && (
            <SupplementTimer supplements={r.supplementPlan.filter(Boolean)} lang={lang} />
          )}

          {/* Nutrition Timing */}
          {r.nutritionTiming && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("sports.nutritionTiming", lang)} icon={Utensils}
                sectionKey="nutrition" expanded={state.sections.nutrition}
                onToggle={() => dispatch({ type: "TOGGLE_SECTION", key: "nutrition" })}
              />
              {state.sections.nutrition && (
                <div className="p-4 space-y-3">
                  {/* Pre */}
                  {r.nutritionTiming?.preWorkout && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">
                      {tx("sports.preWorkout", lang)} ({r.nutritionTiming?.preWorkout?.timing})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.nutritionTiming?.preWorkout?.foods?.map((f: string, i: number) => (
                        <span key={i} className="rounded bg-green-50 px-2 py-0.5 text-xs dark:bg-green-950">{f}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{r.nutritionTiming?.preWorkout?.macros}</p>
                  </div>
                  )}
                  {/* During */}
                  {r.nutritionTiming?.duringWorkout && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {tx("sports.duringWorkout", lang)} ({r.nutritionTiming?.duringWorkout?.timing})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.nutritionTiming?.duringWorkout?.foods?.map((f: string, i: number) => (
                        <span key={i} className="rounded bg-amber-50 px-2 py-0.5 text-xs dark:bg-amber-950">{f}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{r.nutritionTiming?.duringWorkout?.notes}</p>
                  </div>
                  )}
                  {/* Post */}
                  {r.nutritionTiming?.postWorkout && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-bold text-primary">
                      {tx("sports.postWorkout", lang)} ({r.nutritionTiming?.postWorkout?.timing})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.nutritionTiming?.postWorkout?.foods?.map((f: string, i: number) => (
                        <span key={i} className="rounded bg-indigo-50 px-2 py-0.5 text-xs dark:bg-indigo-950">{f}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{r.nutritionTiming?.postWorkout?.macros}</p>
                  </div>
                  )}
                  {/* Tips */}
                  {r.nutritionTiming.generalTips?.length > 0 && (
                    <div className="space-y-1">
                      {r.nutritionTiming.generalTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 text-primary">-</span>
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
          {r.recoveryProtocol?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("sports.recoveryTips", lang)} icon={Heart}
                sectionKey="recovery" count={r.recoveryProtocol.length}
                expanded={state.sections.recovery}
                onToggle={() => dispatch({ type: "TOGGLE_SECTION", key: "recovery" })}
              />
              {state.sections.recovery && (
                <div className="p-4 space-y-2">
                  {r.recoveryProtocol.map((rec, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{rec.method}</p>
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        <span>{rec.frequency}</span>
                        <span>{rec.duration}</span>
                      </div>
                      <p className="mt-1 text-xs text-primary">{rec.benefit}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Injury Prevention */}
          {r.injuryPrevention?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("sports.injuryPrevention", lang)} icon={ShieldAlert}
                sectionKey="injury" count={r.injuryPrevention.length}
                expanded={state.sections.injury}
                onToggle={() => dispatch({ type: "TOGGLE_SECTION", key: "injury" })}
              />
              {state.sections.injury && (
                <div className="p-4 space-y-2">
                  {r.injuryPrevention.map((ip, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{ip.area}</p>
                      <p className="text-xs text-muted-foreground">{ip.exercise}</p>
                      <p className="text-xs text-primary">{ip.frequency}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overtraining Warnings */}
          {r.overtrainingWarnings?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("sports.warnings", lang)} icon={AlertTriangle}
                sectionKey="warnings" count={r.overtrainingWarnings.length}
                expanded={state.sections.warnings}
                onToggle={() => dispatch({ type: "TOGGLE_SECTION", key: "warnings" })}
              />
              {state.sections.warnings && (
                <div className="p-4 space-y-1">
                  {r.overtrainingWarnings.map((w, i) => (
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
          {r.sources?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("common.sources", lang)} icon={Info}
                sectionKey="sources" count={r.sources.length}
                expanded={state.sections.sources}
                onToggle={() => dispatch({ type: "TOGGLE_SECTION", key: "sources" })}
              />
              {state.sections.sources && (
                <div className="p-4 space-y-1">
                  {r.sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="block text-xs text-indigo-600 hover:underline dark:text-indigo-400">
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Weekly Progress */}
          <WeeklyProgressBar lang={lang} />

          {/* New Plan */}
          <Button variant="outline" onClick={() => dispatch({ type: "RESET" })} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            {tx("sports.newPlan", lang)}
          </Button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
    </div>
  );
}
