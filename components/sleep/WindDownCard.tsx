// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import { Moon, Clock, Leaf, Check } from "lucide-react";
import { tx } from "@/lib/translations";

interface WindDownCardProps {
  lang: "en" | "tr";
  factors: string[];  // today's factors to personalize
  medications?: string[];  // user's meds for herb suggestions
}

interface RitualStep {
  emoji: string;
  text: { en: string; tr: string };
  time: string;
}

function getPersonalizedRituals(factors: string[], lang: "en" | "tr"): RitualStep[] {
  const rituals: RitualStep[] = [];

  if (factors.includes("stress")) {
    rituals.push({
      emoji: "🍵",
      text: { en: "Brew chamomile or lemon balm tea", tr: "Papatya veya melisa çayı demle" },
      time: "-90min",
    });
  } else {
    rituals.push({
      emoji: "🍵",
      text: { en: "Enjoy a calming herbal tea", tr: "Sakinleştirici bitki çayı iç" },
      time: "-90min",
    });
  }

  if (factors.includes("screen") || factors.includes("caffeine")) {
    rituals.push({
      emoji: "📵",
      text: { en: "Put away all screens — read a book instead", tr: "Tüm ekranları kapat — kitap oku" },
      time: "-60min",
    });
  }

  rituals.push({
    emoji: "🌡️",
    text: { en: "Take a warm shower — drop body temp for sleep", tr: "Ilık duş al — uyku için vücut ısısını düşür" },
    time: "-45min",
  });

  rituals.push({
    emoji: "🌬️",
    text: { en: "4-7-8 breathing: inhale 4s, hold 7s, exhale 8s", tr: "4-7-8 nefes: 4sn nefes al, 7sn tut, 8sn ver" },
    time: "-15min",
  });

  rituals.push({
    emoji: "😴",
    text: { en: "Lights out — sweet dreams!", tr: "Işıklar kapansın — tatlı rüyalar!" },
    time: "0",
  });

  return rituals;
}

export function WindDownCard({ lang, factors }: WindDownCardProps) {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const rituals = getPersonalizedRituals(factors, lang);

  const hour = new Date().getHours();
  // Only show after 19:00 (7 PM)
  if (hour < 19) return null;

  const toggleStep = (i: number) => {
    setCompleted((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const doneCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-950/90 to-slate-950/90 p-4 text-white dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Moon className="h-5 w-5 text-indigo-300" />
        <h3 className="text-sm font-bold">{tx("sleep.windDown", lang)}</h3>
        <span className="ml-auto text-[10px] text-indigo-300">
          {doneCount}/{rituals.length}
        </span>
      </div>

      <p className="text-xs text-indigo-200/80 mb-3">
        {tx("sleep.windDownMsg", lang)}
      </p>

      {/* Ritual steps */}
      <div className="space-y-2">
        {rituals.map((step, i) => (
          <button
            key={i}
            onClick={() => toggleStep(i)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
              completed[i]
                ? "bg-white/10 opacity-60"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
              completed[i]
                ? "border-emerald-400 bg-emerald-400 text-white"
                : "border-indigo-400/50"
            }`}>
              {completed[i] ? <Check className="h-3.5 w-3.5" /> : <span className="text-sm">{step.emoji}</span>}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium ${completed[i] ? "line-through" : ""}`}>
                {step.text[lang]}
              </p>
            </div>
            <span className="text-[10px] text-indigo-300/60 flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {step.time}
            </span>
          </button>
        ))}
      </div>

      {/* Phytotherapy tip */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
        <Leaf className="h-4 w-4 text-emerald-400 shrink-0" />
        <p className="text-[11px] text-emerald-200">
          {lang === "tr"
            ? "Papatya çayı (Matricaria chamomilla) uyku kalitesini %30 artırabilir — Grade B kanıt"
            : "Chamomile tea (Matricaria chamomilla) can improve sleep quality by 30% — Grade B evidence"}
        </p>
      </div>
    </div>
  );
}
