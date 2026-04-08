// © 2026 DoctoPal — All Rights Reserved
// Live Circadian Rhythm Timeline — dynamic status based on current time

"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Coffee, Zap, Brain, BedDouble } from "lucide-react";
import { tx } from "@/lib/translations";

interface CircadianTimelineProps {
  lang: "en" | "tr";
  isShiftWorker?: boolean;
}

interface CircadianPhase {
  start: number;
  end: number;
  icon: React.ElementType;
  color: string;
  label: { en: string; tr: string };
  tip: { en: string; tr: string };
}

const NORMAL_PHASES: CircadianPhase[] = [
  { start: 6, end: 9, icon: Sun, color: "bg-amber-400", label: { en: "Morning Rise", tr: "Sabah Uyanışı" },
    tip: { en: "Cortisol peaks now — best time for exercise. Get sunlight!", tr: "Kortizol zirvede — egzersiz için en iyi zaman. Güneşe çık!" } },
  { start: 9, end: 12, icon: Brain, color: "bg-emerald-400", label: { en: "Peak Focus", tr: "Zirve Odaklanma" },
    tip: { en: "Peak cognitive performance. Do your hardest work now.", tr: "Bilişsel performans zirvede. En zor işlerini şimdi yap." } },
  { start: 12, end: 14, icon: Coffee, color: "bg-orange-400", label: { en: "Midday Dip", tr: "Öğle Düşüşü" },
    tip: { en: "Energy dips naturally. Light meal, avoid heavy caffeine.", tr: "Enerji doğal olarak düşer. Hafif yemek ye, ağır kafein alma." } },
  { start: 14, end: 17, icon: Zap, color: "bg-blue-400", label: { en: "Afternoon Peak", tr: "Öğleden Sonra Zirvesi" },
    tip: { en: "Second wind — great for physical training & meetings.", tr: "İkinci dalga — fiziksel antrenman ve toplantılar için harika." } },
  { start: 17, end: 20, icon: Sun, color: "bg-amber-300", label: { en: "Wind-Down Starts", tr: "Sakinleşme Başlıyor" },
    tip: { en: "Cut caffeine NOW. Start preparing for sleep.", tr: "Kafeini ŞİMDİ kes. Uyku hazırlığına başla." } },
  { start: 20, end: 23, icon: Moon, color: "bg-indigo-400", label: { en: "Melatonin Rising", tr: "Melatonin Yükseliyor" },
    tip: { en: "Dim lights, limit screens. Herbal tea time.", tr: "Işıkları kıs, ekranları sınırla. Bitki çayı zamanı." } },
  { start: 23, end: 6, icon: BedDouble, color: "bg-purple-400", label: { en: "Deep Sleep Window", tr: "Derin Uyku Penceresi" },
    tip: { en: "Your body repairs and consolidates memory. Sleep is medicine.", tr: "Vücudun onarılıyor ve hafıza pekişiyor. Uyku ilaçtır." } },
];

function getCurrentPhase(hour: number, isShift: boolean): CircadianPhase {
  if (isShift) {
    // Shift worker: offset by 12 hours
    const shiftHour = (hour + 12) % 24;
    return NORMAL_PHASES.find(p => {
      if (p.start < p.end) return shiftHour >= p.start && shiftHour < p.end;
      return shiftHour >= p.start || shiftHour < p.end;
    }) || NORMAL_PHASES[0];
  }

  return NORMAL_PHASES.find(p => {
    if (p.start < p.end) return hour >= p.start && hour < p.end;
    return hour >= p.start || hour < p.end;
  }) || NORMAL_PHASES[0];
}

function getProgressPercent(hour: number, minute: number): number {
  return ((hour * 60 + minute) / (24 * 60)) * 100;
}

export function CircadianTimeline({ lang, isShiftWorker = false }: CircadianTimelineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hour = now.getHours();
  const minute = now.getMinutes();
  const progress = getProgressPercent(hour, minute);
  const phase = getCurrentPhase(hour, isShiftWorker);
  const Icon = phase.icon;

  return (
    <div className="rounded-xl border bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-4 dark:from-indigo-950/20 dark:to-purple-950/20">
      {/* Current status */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${phase.color} text-white shadow-soft-md`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">{phase.label[lang]}</h3>
            <span className="text-[10px] text-muted-foreground">
              {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
            </span>
            {isShiftWorker && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                🏥 {lang === "tr" ? "Vardiya" : "Shift"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{phase.tip[lang]}</p>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        {/* Phase segments */}
        {NORMAL_PHASES.map((p, i) => {
          const startPct = (p.start / 24) * 100;
          const endPct = p.start < p.end ? ((p.end - p.start) / 24) * 100 : ((24 - p.start + p.end) / 24) * 100;
          return (
            <div
              key={i}
              className={`absolute top-0 h-full ${p.color} opacity-30`}
              style={{ left: `${startPct}%`, width: `${endPct}%` }}
            />
          );
        })}
        {/* Current position marker */}
        <div
          className="absolute top-0 h-full w-1 rounded-full bg-foreground shadow-lg transition-all duration-1000"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Time labels */}
      <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}
