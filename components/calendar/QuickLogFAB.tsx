// © 2026 Phytotherapy.ai — All Rights Reserved
// Quick Log FAB — frictionless one-tap logging

"use client";

import { useState } from "react";
import { Plus, X, Droplets, Pill, Heart } from "lucide-react";

interface QuickLogFABProps {
  onLogWater: () => void;
  onLogMed: () => void;
  onLogPain: () => void;
  lang: "en" | "tr";
}

const ACTIONS = [
  { key: "water", emoji: "💧", icon: Droplets, color: "bg-blue-500", labelEn: "Drank Water", labelTr: "Su İçtim" },
  { key: "med", emoji: "💊", icon: Pill, color: "bg-primary", labelEn: "Took Med", labelTr: "İlacımı Aldım" },
  { key: "pain", emoji: "🤕", icon: Heart, color: "bg-coral", labelEn: "Log Pain", labelTr: "Ağrı Kaydet" },
];

export function QuickLogFAB({ onLogWater, onLogMed, onLogPain, lang }: QuickLogFABProps) {
  const [open, setOpen] = useState(false);

  const handlers: Record<string, () => void> = {
    water: onLogWater,
    med: onLogMed,
    pain: onLogPain,
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-2">
      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          open
            ? "bg-muted-foreground text-background rotate-45"
            : "bg-gradient-to-br from-primary to-emerald-700 text-white hover:scale-105"
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>

      {/* Quick action buttons */}
      {open && ACTIONS.map(({ key, emoji, color, labelEn, labelTr }, i) => (
        <button
          key={key}
          onClick={() => { handlers[key](); setOpen(false); }}
          className={`flex items-center gap-2 rounded-full ${color} px-4 py-2.5 text-white text-xs font-medium shadow-md transition-all hover:scale-105 active:scale-95`}
          style={{
            animation: `fabSlideIn 0.2s ease-out ${i * 60}ms both`,
          }}
        >
          <span>{emoji}</span>
          {lang === "tr" ? labelTr : labelEn}
        </button>
      ))}

      <style jsx>{`
        @keyframes fabSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
