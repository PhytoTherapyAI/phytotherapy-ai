// © 2026 Doctopal — All Rights Reserved
"use client";

import { Dumbbell, Target, Focus, Award, Calendar } from "lucide-react";
import { tx } from "@/lib/translations";

interface ExtractedIntent {
  sportType?: string;
  goal?: string;
  specificFocus?: string;
  experienceLevel?: string;
  frequency?: number;
  currentSupplements?: string;
}

interface IntentCardsProps {
  intent: ExtractedIntent;
  lang: "en" | "tr";
}

const PILL_STYLES: Record<string, { bg: string; icon: React.ElementType }> = {
  sportType: { bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", icon: Dumbbell },
  goal: { bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300", icon: Target },
  specificFocus: { bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", icon: Focus },
  experienceLevel: { bg: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300", icon: Award },
  frequency: { bg: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300", icon: Calendar },
};

const LABELS: Record<string, Record<string, string>> = {
  sportType: { en: "Sport", tr: "Spor" },
  goal: { en: "Goal", tr: "Hedef" },
  specificFocus: { en: "Focus", tr: "Odak" },
  experienceLevel: { en: "Level", tr: "Seviye" },
  frequency: { en: "Frequency", tr: "Sıklık" },
};

export function IntentCards({ intent, lang }: IntentCardsProps) {
  const fields = [
    { key: "sportType", value: intent.sportType },
    { key: "goal", value: intent.goal },
    { key: "specificFocus", value: intent.specificFocus },
    { key: "experienceLevel", value: intent.experienceLevel },
    { key: "frequency", value: intent.frequency ? `${intent.frequency} ${tx("sports.daysPerWeek", lang)}` : null },
  ].filter((f) => f.value);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        {tx("sports.intentConfirm", lang)}
      </p>
      <div className="flex flex-wrap gap-2">
        {fields.map(({ key, value }, i) => {
          const style = PILL_STYLES[key] || PILL_STYLES.sportType;
          const Icon = style.icon;
          return (
            <div
              key={key}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${style.bg}`}
              style={{
                animation: `fadeSlideIn 0.3s ease-out ${i * 120}ms both`,
              }}
            >
              <Icon className="h-3 w-3" />
              <span className="opacity-70">{LABELS[key]?.[lang] || key}:</span>
              <span className="font-semibold capitalize">{String(value)}</span>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
