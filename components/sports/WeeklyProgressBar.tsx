// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import { Flame, Calendar } from "lucide-react";
import { tx } from "@/lib/translations";

interface WeeklyProgressBarProps {
  lang: "en" | "tr";
}

const DAY_LABELS = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  tr: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
};

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function calculateStreak(completedDates: Set<string>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (completedDates.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function WeeklyProgressBar({ lang }: WeeklyProgressBarProps) {
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const weekDates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sports-weekly-completed");
      if (saved) setCompletedDays(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }

    // Listen for confetti-burst (all supplements taken = day complete)
    const handler = () => {
      setCompletedDays((prev) => {
        const next = new Set(prev);
        next.add(today);
        localStorage.setItem("sports-weekly-completed", JSON.stringify([...next]));
        return next;
      });
    };
    window.addEventListener("confetti-burst", handler);
    return () => window.removeEventListener("confetti-burst", handler);
  }, [today]);

  const streak = calculateStreak(completedDays);
  const weekCompleted = weekDates.filter((d) => completedDays.has(d)).length;

  return (
    <div className="rounded-xl border bg-gradient-to-r from-indigo-50/30 to-purple-50/30 p-4 dark:from-indigo-950/10 dark:to-purple-950/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold">{tx("sports.weeklyProgress", lang)}</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
            <Flame className="h-3.5 w-3.5" />
            {streak} {tx("sports.streak", lang)}
          </div>
        )}
      </div>

      {/* Day circles */}
      <div className="flex items-center justify-between gap-1">
        {weekDates.map((date, i) => {
          const isDone = completedDays.has(date);
          const isToday = date === today;

          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                {DAY_LABELS[lang][i]}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                isDone
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-110"
                  : isToday
                  ? "border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border border-gray-200 text-muted-foreground dark:border-gray-700"
              }`}>
                {isDone ? "✓" : new Date(date).getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {weekCompleted}/7 {tx("sports.completed", lang)}
      </p>
    </div>
  );
}
