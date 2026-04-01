// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Check, Pill, AlertTriangle } from "lucide-react";
import { tx } from "@/lib/translations";

interface SupplementItem {
  name: string;
  dose: string;
  timing: string;
  evidenceGrade: "A" | "B" | "C";
  benefit: string;
  safety: "safe" | "caution" | "avoid";
  safetyNote: string;
  duration: string;
}

interface SupplementTimerProps {
  supplements: SupplementItem[];
  lang: "en" | "tr";
}

function safetyBorderColor(safety: string) {
  switch (safety) {
    case "avoid": return "border-l-red-500";
    case "caution": return "border-l-amber-500";
    default: return "border-l-green-500";
  }
}

function safetyBadge(safety: string) {
  switch (safety) {
    case "avoid": return "bg-red-500 text-white";
    case "caution": return "bg-amber-500 text-white";
    default: return "bg-green-500 text-white";
  }
}

function gradeBadge(grade: string) {
  switch (grade) {
    case "A": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "B": return "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300";
    default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
}

export function SupplementTimer({ supplements, lang }: SupplementTimerProps) {
  const storageKey = `sports-supps-taken-${new Date().toISOString().split("T")[0]}`;
  const [taken, setTaken] = useState<Record<number, boolean>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setTaken(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [storageKey]);

  const takenCount = Object.values(taken).filter(Boolean).length;
  const total = supplements.length;
  const progress = total > 0 ? (takenCount / total) * 100 : 0;
  const allDone = takenCount === total && total > 0;

  const toggleTaken = useCallback((index: number) => {
    setTaken((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      localStorage.setItem(storageKey, JSON.stringify(next));

      // Check if all done
      const newCount = Object.values(next).filter(Boolean).length;
      if (newCount === total) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("confetti-burst"));
          setShowConfetti(true);
        }, 300);
      }
      return next;
    });
  }, [storageKey, total]);

  // Confetti overlay
  const confettiPieces = useMemo(() => Array.from({ length: 50 }, (_, i) => {
    const s1 = ((i * 7919) % 1000) / 1000;
    const s2 = ((i * 6271) % 1000) / 1000;
    const s3 = ((i * 4817) % 1000) / 1000;
    const s4 = ((i * 3541) % 1000) / 1000;
    const s5 = ((i * 2311) % 1000) / 1000;
    return { left: s1 * 100, width: 6 + s2 * 10, height: 6 + s3 * 10, isCircle: s4 > 0.5, duration: 1.8 + s5 * 1.5, delay: ((i * 1327) % 1000) / 1000 * 0.6 };
  }), []);

  useEffect(() => {
    if (showConfetti) { const t = setTimeout(() => setShowConfetti(false), 3000); return () => clearTimeout(t); }
  }, [showConfetti]);

  const colors = ["#5aac74", "#b8965a", "#60a5fa", "#f472b6", "#facc15", "#34d399", "#a78bfa", "#fb923c"];

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium">
            <Pill className="h-3 w-3 text-indigo-500" />
            {tx("sports.supplementProgress", lang)}
          </span>
          <span className="text-muted-foreground">
            {takenCount}/{total} {tx("sports.completed", lang)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* All done message */}
      {allDone && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Check className="h-4 w-4" />
          {tx("sports.allTaken", lang)}
        </div>
      )}

      {/* Supplement cards */}
      <div className="space-y-2">
        {supplements.map((s, i) => (
          <button
            key={i}
            onClick={() => toggleTaken(i)}
            className={`relative w-full text-left rounded-lg border border-l-4 p-3 transition-all duration-300 ${safetyBorderColor(s.safety)} ${
              taken[i]
                ? "bg-muted/40 opacity-70"
                : "hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            {/* Check circle */}
            <div className={`absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
              taken[i]
                ? "border-emerald-500 bg-emerald-500 text-white scale-110"
                : "border-gray-300 dark:border-gray-600"
            }`}>
              {taken[i] && <Check className="h-3.5 w-3.5" />}
            </div>

            {/* Content */}
            <div className="pr-10 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${taken[i] ? "line-through" : ""}`}>{s.name}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${gradeBadge(s.evidenceGrade)}`}>
                  {s.evidenceGrade}
                </span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${safetyBadge(s.safety)}`}>
                  {s.safety === "safe" ? tx("sports.safe", lang) : s.safety === "caution" ? "⚠️" : "❌"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{s.benefit}</p>
              <div className="flex gap-4 text-[11px] text-muted-foreground">
                <span><strong>{tx("sports.dose", lang)}:</strong> {s.dose}</span>
                <span><strong>{tx("sports.timing", lang)}:</strong> {s.timing}</span>
              </div>
              {s.safetyNote && (
                <p className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3 shrink-0" />{s.safetyNote}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {confettiPieces.map((p, i) => (
            <div key={i} style={{
              position: "absolute", left: `${p.left}%`, top: "-12px",
              width: `${p.width}px`, height: `${p.height}px`,
              backgroundColor: colors[i % colors.length],
              borderRadius: p.isCircle ? "50%" : "2px",
              animation: `sports-confetti ${p.duration}s ${p.delay}s cubic-bezier(0.37,0,0.63,1) forwards`,
            }} />
          ))}
          <style jsx>{`
            @keyframes sports-confetti {
              0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
              60% { opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg) scale(0.2); opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
