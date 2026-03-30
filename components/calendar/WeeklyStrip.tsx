// © 2026 Phytotherapy.ai — All Rights Reserved
// Horizontal Weekly Strip — replaces 30-day grid with focused 7-day swipeable strip

"use client";

import { useMemo } from "react";

interface WeeklyStripProps {
  selectedDate: string; // ISO date
  onSelectDate: (date: string) => void;
  lang: "en" | "tr";
  completedDates?: Set<string>;
}

const DAY_NAMES = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  tr: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
};

function getWeekDates(centerDate: string): string[] {
  const center = new Date(centerDate);
  const day = center.getDay();
  const monday = new Date(center);
  monday.setDate(center.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export function WeeklyStrip({ selectedDate, onSelectDate, lang, completedDates }: WeeklyStripProps) {
  const today = new Date().toISOString().split("T")[0];
  const weekDates = useMemo(() => getWeekDates(selectedDate || today), [selectedDate, today]);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2">
      {weekDates.map((date, i) => {
        const isToday = date === today;
        const isSelected = date === selectedDate;
        const d = new Date(date);
        const dayNum = d.getDate();
        const dayName = DAY_NAMES[lang][i];
        const isCompleted = completedDates?.has(date);

        return (
          <button
            key={date}
            onClick={() => onSelectDate(date)}
            className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 min-w-[52px] transition-all duration-200 ${
              isSelected
                ? "bg-primary text-primary-foreground shadow-soft-md scale-105"
                : isToday
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="text-[10px] font-medium uppercase">{dayName}</span>
            <span className={`text-lg font-bold leading-none ${isSelected ? "" : ""}`}>{dayNum}</span>
            {/* Completion dot */}
            {isCompleted && !isSelected && (
              <span className="h-1 w-1 rounded-full bg-primary" />
            )}
            {isSelected && isCompleted && (
              <span className="h-1 w-1 rounded-full bg-primary-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}
