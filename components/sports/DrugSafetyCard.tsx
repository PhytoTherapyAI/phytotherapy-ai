// © 2026 Doctopal — All Rights Reserved
"use client";

import { AlertTriangle, HelpCircle, ArrowRight } from "lucide-react";
import { tx } from "@/lib/translations";

interface SafetyWarning {
  supplement: string;
  medication: string;
  severity: "avoid" | "caution" | "monitor";
  why: string;
  whatToDo: string;
}

interface DrugSafetyCardProps {
  warnings: SafetyWarning[];
  lang: "en" | "tr";
}

function severityStyle(severity: string) {
  switch (severity) {
    case "avoid":
      return {
        border: "border-l-red-500 border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
        badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        icon: "text-red-500",
      };
    case "caution":
      return {
        border: "border-l-amber-500 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        icon: "text-amber-500",
      };
    default:
      return {
        border: "border-l-blue-500 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        icon: "text-blue-500",
      };
  }
}

export function DrugSafetyCard({ warnings, lang }: DrugSafetyCardProps) {
  if (!warnings?.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        {tx("sports.interactionWarnings", lang)}
      </h3>
      {warnings.map((w, i) => {
        const style = severityStyle(w.severity);
        return (
          <div
            key={i}
            className={`rounded-lg border border-l-4 p-3 ${style.border}`}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${style.icon}`} />
              <span className="text-sm font-semibold">{w.supplement}</span>
              {w.medication && (
                <>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{w.medication}</span>
                </>
              )}
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${style.badge}`}>
                {w.severity}
              </span>
            </div>

            {/* Why + What to do */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-white/60 px-2.5 py-2 dark:bg-white/5">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                  <HelpCircle className="h-3 w-3" />
                  {tx("sports.why", lang)}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed">{w.why}</p>
              </div>
              <div className="rounded-md bg-white/60 px-2.5 py-2 dark:bg-white/5">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  <ArrowRight className="h-3 w-3" />
                  {tx("sports.whatToDo", lang)}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed">{w.whatToDo}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
