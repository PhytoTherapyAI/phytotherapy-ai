"use client";

import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface SafetyBadgeProps {
  safety: "safe" | "caution" | "dangerous";
  size?: "sm" | "md" | "lg";
  evidenceGrade?: "A" | "B" | "C" | null;
}

const config = {
  safe: {
    icon: ShieldCheck,
    label: "Safe",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    ring: "ring-primary/20",
  },
  caution: {
    icon: ShieldAlert,
    label: "Caution",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    ring: "ring-amber-500/20",
  },
  dangerous: {
    icon: ShieldX,
    label: "Dangerous",
    bg: "bg-red-50 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    ring: "ring-red-500/20",
  },
};

const sizeConfig = {
  sm: { icon: "h-3.5 w-3.5", text: "text-xs", padding: "px-2 py-0.5", gap: "gap-1" },
  md: { icon: "h-4 w-4", text: "text-sm", padding: "px-2.5 py-1", gap: "gap-1.5" },
  lg: { icon: "h-5 w-5", text: "text-base", padding: "px-3 py-1.5", gap: "gap-2" },
};

const gradeLabels: Record<string, string> = {
  A: "Grade A",
  B: "Grade B",
  C: "Grade C",
};

export function SafetyBadge({ safety, size = "md", evidenceGrade }: SafetyBadgeProps) {
  const c = config[safety];
  const s = sizeConfig[size];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.padding} rounded-full border font-medium ring-1 ${c.bg} ${c.text} ${c.border} ${c.ring} ${s.text}`}
    >
      <Icon className={s.icon} />
      {c.label}
      {evidenceGrade && (
        <span className="ml-0.5 opacity-70">
          · {gradeLabels[evidenceGrade] || evidenceGrade}
        </span>
      )}
    </span>
  );
}
