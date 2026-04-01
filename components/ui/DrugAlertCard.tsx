// © 2026 Doctopal — All Rights Reserved
// Design System v2 — Drug Interaction Alert Card
// Uses: lavender AI glow, coral warnings, sage safe zones, glassmorphism

"use client";

import { useState } from "react";
import { AlertTriangle, Shield, HelpCircle, ArrowRight, ChevronDown, ChevronUp, Leaf } from "lucide-react";

type Severity = "safe" | "caution" | "dangerous";

interface DrugAlertCardProps {
  drugName: string;
  herbName: string;
  severity: Severity;
  mechanism: string;
  action: string;
  alternative?: string;
  evidenceGrade: "A" | "B" | "C";
}

const SEVERITY_CONFIG = {
  safe: {
    border: "border-sage/30",
    bg: "bg-sage/5",
    badge: "bg-sage text-sage-foreground",
    icon: Shield,
    label: { en: "Safe", tr: "Güvenli" },
    glow: "",
  },
  caution: {
    border: "border-coral/30",
    bg: "bg-coral/5",
    badge: "bg-coral text-coral-foreground",
    icon: AlertTriangle,
    label: { en: "Caution", tr: "Dikkat" },
    glow: "",
  },
  dangerous: {
    border: "border-red-400/30",
    bg: "bg-red-50 dark:bg-red-950/10",
    badge: "bg-red-500 text-white",
    icon: AlertTriangle,
    label: { en: "Avoid", tr: "Kaçın" },
    glow: "shadow-[0_0_16px_rgba(239,68,68,0.12)]",
  },
};

export function DrugAlertCard({
  drugName,
  herbName,
  severity,
  mechanism,
  action,
  alternative,
  evidenceGrade,
}: DrugAlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  const gradeColor = evidenceGrade === "A"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    : evidenceGrade === "B"
    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div className={`glass-card rounded-2xl border ${config.border} ${config.bg} ${config.glow} overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.badge}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold">{drugName}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-sm font-bold">{herbName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${config.badge}`}>
              {config.label.en}
            </span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${gradeColor}`}>
              Grade {evidenceGrade}
            </span>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3">
          {/* Why */}
          <div className="rounded-xl bg-white/50 px-3 py-2.5 dark:bg-white/5 shadow-soft">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <HelpCircle className="h-3 w-3" />
              Why?
            </p>
            <p className="text-xs leading-relaxed">{mechanism}</p>
          </div>

          {/* Action */}
          <div className="rounded-xl bg-white/50 px-3 py-2.5 dark:bg-white/5 shadow-soft">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <ArrowRight className="h-3 w-3" />
              What to do
            </p>
            <p className="text-xs leading-relaxed">{action}</p>
          </div>

          {/* Alternative herb */}
          {alternative && (
            <div className="flex items-start gap-2 rounded-xl border border-sage/20 bg-sage/5 px-3 py-2.5 shadow-soft">
              <Leaf className="h-4 w-4 text-sage shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sage">
                  Safe Alternative
                </p>
                <p className="text-xs mt-0.5">{alternative}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
