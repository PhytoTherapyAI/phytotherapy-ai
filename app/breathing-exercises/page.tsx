// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Wind, Play, Square, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface BreathingExercise {
  id: string;
  nameKey: string;
  descKey: string;
  color: string;
  bgColor: string;
  phases: Array<{
    labelKey: string;
    duration: number;
  }>;
  rounds: number;
}

const EXERCISES: BreathingExercise[] = [
  {
    id: "478",
    nameKey: "breathing.fourSevenEight",
    descKey: "breathing.desc478",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500",
    phases: [
      { labelKey: "breathing.inhale", duration: 4 },
      { labelKey: "breathing.hold", duration: 7 },
      { labelKey: "breathing.exhale", duration: 8 },
    ],
    rounds: 4,
  },
  {
    id: "box",
    nameKey: "breathing.boxBreathing",
    descKey: "breathing.descBox",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500",
    phases: [
      { labelKey: "breathing.inhale", duration: 4 },
      { labelKey: "breathing.hold", duration: 4 },
      { labelKey: "breathing.exhale", duration: 4 },
      { labelKey: "breathing.hold", duration: 4 },
    ],
    rounds: 4,
  },
  {
    id: "wimhof",
    nameKey: "breathing.wimHof",
    descKey: "breathing.descWim",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-500",
    phases: [
      { labelKey: "breathing.inhale", duration: 2 },
      { labelKey: "breathing.exhale", duration: 2 },
    ],
    rounds: 30,
  },
  {
    id: "diaphragm",
    nameKey: "breathing.diaphragmatic",
    descKey: "breathing.descDiaphragm",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500",
    phases: [
      { labelKey: "breathing.inhale", duration: 4 },
      { labelKey: "breathing.rest", duration: 1 },
      { labelKey: "breathing.exhale", duration: 6 },
      { labelKey: "breathing.rest", duration: 1 },
    ],
    rounds: 5,
  },
];

export default function BreathingExercisesPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [phaseTotalTime, setPhaseTotalTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasAnxiety = profile?.chronic_conditions?.some?.(
    (c: string) => c.toLowerCase().includes("anxiety") || c.toLowerCase().includes("anksiyete")
  ) ?? false;

  const stopExercise = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startExercise = useCallback((ex: BreathingExercise) => {
    setSelectedExercise(ex);
    setCurrentRound(1);
    setCurrentPhaseIdx(0);
    setPhaseTimeLeft(ex.phases[0].duration);
    setPhaseTotalTime(ex.phases[0].duration);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning || !selectedExercise) return;

    intervalRef.current = setInterval(() => {
      setPhaseTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhaseIdx = currentPhaseIdx + 1;
          if (nextPhaseIdx >= selectedExercise.phases.length) {
            // End of round
            const nextRound = currentRound + 1;
            if (nextRound > selectedExercise.rounds) {
              stopExercise();
              return 0;
            }
            setCurrentRound(nextRound);
            setCurrentPhaseIdx(0);
            const dur = selectedExercise.phases[0].duration;
            setPhaseTotalTime(dur);
            return dur;
          }
          setCurrentPhaseIdx(nextPhaseIdx);
          const dur = selectedExercise.phases[nextPhaseIdx].duration;
          setPhaseTotalTime(dur);
          return dur;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, selectedExercise, currentPhaseIdx, currentRound, stopExercise]);

  const circleProgress = phaseTotalTime > 0 ? ((phaseTotalTime - phaseTimeLeft) / phaseTotalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (circleProgress / 100) * circumference;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
          <Wind className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("breathing.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("breathing.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Panic Protocol Banner */}
      {hasAnxiety && (
        <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-800 dark:bg-indigo-950/20">
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            {tx("breathing.panicProtocol", lang)}
          </p>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
            {tx("breathing.panicDesc", lang)}
          </p>
          {!isRunning && (
            <Button
              size="sm"
              className="mt-2 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => startExercise(EXERCISES[0])}
            >
              <Play className="h-3 w-3" />
              {tx("breathing.fourSevenEight", lang)}
            </Button>
          )}
        </div>
      )}

      {/* Active Exercise Timer */}
      {isRunning && selectedExercise && (
        <div className="mb-6 rounded-lg border bg-card p-6 text-center">
          <h3 className={`text-lg font-semibold mb-1 ${selectedExercise.color}`}>
            {tx(selectedExercise.nameKey, lang)}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {tx("breathing.rounds", lang)}: {currentRound}/{selectedExercise.rounds}
          </p>

          {/* Animated Timer Circle */}
          <div className="relative mx-auto w-44 h-44 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth="6"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                className={selectedExercise.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.3s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold">{phaseTimeLeft}</p>
              <p className={`text-sm font-medium ${selectedExercise.color}`}>
                {tx(selectedExercise.phases[currentPhaseIdx].labelKey, lang)}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={stopExercise}
            className="gap-1"
          >
            <Square className="h-3.5 w-3.5" />
            {tx("breathing.stop", lang)}
          </Button>
        </div>
      )}

      {/* Exercise Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {EXERCISES.map((ex) => (
          <div
            key={ex.id}
            className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <h3 className={`font-semibold mb-1 ${ex.color}`}>
              {tx(ex.nameKey, lang)}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {tx(ex.descKey, lang)}
            </p>

            {/* Phase visualization */}
            <div className="flex gap-1 mb-3">
              {ex.phases.map((phase, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded px-1.5 py-1 text-center ${ex.bgColor} bg-opacity-10 dark:bg-opacity-20`}
                >
                  <p className="text-[10px] font-medium text-muted-foreground">
                    {tx(phase.labelKey, lang)}
                  </p>
                  <p className="text-xs font-bold">{phase.duration}s</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {ex.rounds} {tx("breathing.rounds", lang).toLowerCase()}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={isRunning}
                onClick={() => startExercise(ex)}
              >
                {isRunning && selectedExercise?.id === ex.id ? (
                  <RotateCcw className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                {tx("breathing.start", lang)}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
