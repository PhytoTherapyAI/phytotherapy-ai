// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useMemo } from "react";
import { Sun, Moon, Check, SlidersHorizontal, Coffee, Monitor, Dumbbell, Brain, Wine, Utensils, Pill } from "lucide-react";
import { tx } from "@/lib/translations";

interface MorningCardProps {
  lang: "en" | "tr";
  onSubmit: (data: { bedtime: string; wakeTime: string; duration: number; quality: number; factors: string[] }) => void;
  isLoading: boolean;
}

const FACTORS = [
  { key: "caffeine", emoji: "☕", icon: Coffee, color: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { key: "screen", emoji: "📱", icon: Monitor, color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  { key: "exercise", emoji: "💪", icon: Dumbbell, color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" },
  { key: "stress", emoji: "😰", icon: Brain, color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800" },
  { key: "alcohol", emoji: "🍷", icon: Wine, color: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  { key: "heavy_meal", emoji: "🍝", icon: Utensils, color: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
  { key: "medication_change", emoji: "💊", icon: Pill, color: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800" },
];

const FACTOR_TX: Record<string, string> = {
  caffeine: "sleep.caffeine", screen: "sleep.screenTime", exercise: "sleep.exercise",
  stress: "sleep.stress", alcohol: "sleep.alcohol", heavy_meal: "sleep.heavyMeal",
  medication_change: "sleep.medChange",
};

const MOODS = [
  { emoji: "😴", value: 1 },
  { emoji: "😐", value: 2 },
  { emoji: "🙂", value: 3 },
  { emoji: "😊", value: 4 },
  { emoji: "🤩", value: 5 },
];

function calcDuration(bed: string, wake: string): number {
  const [bH, bM] = bed.split(":").map(Number);
  const [wH, wM] = wake.split(":").map(Number);
  let mins = (wH * 60 + wM) - (bH * 60 + bM);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

export function MorningCard({ lang, onSubmit, isLoading }: MorningCardProps) {
  const [step, setStep] = useState<"guess" | "adjust" | "factors" | "mood">("guess");
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [factors, setFactors] = useState<string[]>([]);
  const [quality, setQuality] = useState(3);

  // AI "guess" based on typical patterns
  const guessBed = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "23:30" : "00:00";
  }, []);
  const guessWake = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    return `${String(Math.max(6, h - 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }, []);
  const guessDuration = calcDuration(guessBed, guessWake);

  const duration = calcDuration(bedtime, wakeTime);

  const toggleFactor = (key: string) => {
    setFactors((prev) => prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]);
  };

  const handleConfirmGuess = () => {
    setBedtime(guessBed);
    setWakeTime(guessWake);
    setStep("factors");
  };

  const handleSubmitAll = () => {
    onSubmit({
      bedtime: step === "guess" ? guessBed : bedtime,
      wakeTime: step === "guess" ? guessWake : wakeTime,
      duration: step === "guess" ? guessDuration : duration,
      quality,
      factors,
    });
  };

  const greeting = new Date().getHours() < 12
    ? tx("sleep.goodMorning", lang)
    : lang === "tr" ? "İyi günler!" : "Good afternoon!";

  return (
    <div className="space-y-4">
      {/* Greeting bubble */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
          <Moon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 rounded-2xl rounded-tl-sm bg-indigo-50 px-4 py-3 dark:bg-indigo-950/30">
          <p className="text-sm font-medium">{greeting} ✨</p>

          {step === "guess" && (
            <div className="mt-2 space-y-3">
              <p className="text-sm text-muted-foreground">
                {tx("sleep.aiGuess", lang)}{" "}
                <span className="font-bold text-foreground">{guessDuration}h</span>{" "}
                ({guessBed} → {guessWake})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmGuess}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-emerald-600 active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  {tx("sleep.correct", lang)}
                </button>
                <button
                  onClick={() => setStep("adjust")}
                  className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all hover:bg-muted active:scale-95"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {tx("sleep.adjust", lang)}
                </button>
              </div>
            </div>
          )}

          {step === "adjust" && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Moon className="h-3 w-3" /> {tx("sleep.bedtime", lang)}
                  </label>
                  <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Sun className="h-3 w-3" /> {tx("sleep.wakeTime", lang)}
                  </label>
                  <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <p className="text-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {duration}h {tx("sleep.hours", lang)}
              </p>
              <button
                onClick={() => setStep("factors")}
                className="w-full rounded-full bg-indigo-600 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-700 active:scale-95"
              >
                {tx("sleep.continue", lang) || "Continue"}
              </button>
            </div>
          )}

          {step === "factors" && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">{tx("sleep.whatAffected", lang)}</p>
              <div className="flex flex-wrap gap-2">
                {FACTORS.map(({ key, emoji, color }) => (
                  <button
                    key={key}
                    onClick={() => toggleFactor(key)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                      factors.includes(key)
                        ? `${color} border-current shadow-sm scale-105`
                        : "border-gray-200 dark:border-gray-700 hover:bg-muted"
                    }`}
                  >
                    <span>{emoji}</span>
                    {tx(FACTOR_TX[key], lang)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("mood")}
                className="w-full rounded-full bg-indigo-600 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-700 active:scale-95"
              >
                {tx("sleep.continue", lang) || "Continue"}
              </button>
            </div>
          )}

          {step === "mood" && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">{tx("sleep.howFeel", lang)}</p>
              <div className="flex justify-center gap-3">
                {MOODS.map(({ emoji, value }) => (
                  <button
                    key={value}
                    onClick={() => setQuality(value)}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all ${
                      quality === value
                        ? "scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900"
                        : "hover:scale-110 opacity-50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitAll}
                disabled={isLoading}
                className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-700 hover:to-purple-700 active:scale-95 disabled:opacity-50"
              >
                {isLoading
                  ? (lang === "tr" ? "Kaydediliyor..." : "Saving...")
                  : (lang === "tr" ? "Kaydet ve Analiz Et ✨" : "Save & Analyze ✨")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
