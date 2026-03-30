// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { tx } from "@/lib/translations";

interface SleepDebtDonutProps {
  weeklyHours: number[];  // last 7 days of sleep hours
  targetHours: number;    // recommended (default 7.5)
  lang: "en" | "tr";
}

export function SleepDebtDonut({ weeklyHours, targetHours = 7.5, lang }: SleepDebtDonutProps) {
  const totalSlept = weeklyHours.reduce((a, b) => a + b, 0);
  const totalTarget = targetHours * 7;
  const debt = Math.max(0, totalTarget - totalSlept);
  const surplus = Math.max(0, totalSlept - totalTarget);
  const ratio = Math.min(totalSlept / totalTarget, 1);

  // SVG donut
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  const color = debt === 0 ? "#22c55e" : debt <= 5 ? "#f59e0b" : "#ef4444";
  const bgColor = "var(--color-muted, #e5e7eb)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={bgColor} strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {debt > 0 ? (
            <>
              <span className="text-2xl font-bold" style={{ color }}>{debt.toFixed(1)}h</span>
              <span className="text-[10px] text-muted-foreground">{tx("sleep.sleepDebtHours", lang)}</span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold text-green-500">✓</span>
              <span className="text-[10px] text-muted-foreground">{tx("sleep.onTrack", lang)}</span>
              {surplus > 0 && (
                <span className="text-[10px] text-green-500">+{surplus.toFixed(1)}h</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-sm font-semibold">{tx("sleep.sleepDebt", lang)}</h3>
        <p className="text-xs text-muted-foreground">
          {totalSlept.toFixed(1)}h / {totalTarget}h {tx("sleep.weeklyOverview", lang).toLowerCase()}
        </p>
      </div>
    </div>
  );
}
