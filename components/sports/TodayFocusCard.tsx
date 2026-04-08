// © 2026 DoctoPal — All Rights Reserved
"use client";

import { Zap } from "lucide-react";
import { tx } from "@/lib/translations";

interface TodayFocus {
  title: string;
  description: string;
  keyAction: string;
  evidenceGrade: string;
}

interface TodayFocusCardProps {
  focus: TodayFocus;
  lang: "en" | "tr";
}

export function TodayFocusCard({ focus, lang }: TodayFocusCardProps) {
  const gradeColor = focus.evidenceGrade === "A"
    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    : focus.evidenceGrade === "B"
    ? "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300"
    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div className="relative overflow-hidden rounded-xl border-l-4 border-l-indigo-500 border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-white p-5 dark:border-indigo-800 dark:from-indigo-950/30 dark:to-background">
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl" />

      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
              <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
              {tx("sports.todayFocus", lang)}
            </h3>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${gradeColor}`}>
            {focus.evidenceGrade}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold leading-tight">{focus.title}</h4>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">{focus.description}</p>

        {/* Key Action */}
        <div className="flex items-start gap-2 rounded-lg bg-indigo-100/60 px-3 py-2 dark:bg-indigo-900/20">
          <span className="mt-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
            {tx("sports.keyAction", lang)}:
          </span>
          <span className="text-sm font-medium">{focus.keyAction}</span>
        </div>
      </div>
    </div>
  );
}
