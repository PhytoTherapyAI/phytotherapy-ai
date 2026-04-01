// © 2026 Doctopal — All Rights Reserved
// Posture & Ergonomics — Interactive Stretch Player + Gamified Checklist
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, Armchair, Keyboard, Sun, Timer, Hand,
  Check, Play, Pause, SkipForward, X, Activity,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

// ── Checklist ──
interface ChecklistItem { key: string; icon: React.ElementType }
const CHECKLIST: ChecklistItem[] = [
  { key: "posture.monitor", icon: Monitor },
  { key: "posture.chair", icon: Armchair },
  { key: "posture.keyboard", icon: Keyboard },
  { key: "posture.screen", icon: Sun },
  { key: "posture.breaks", icon: Timer },
  { key: "posture.wrists", icon: Hand },
];

// ── Stretch Routine ──
interface Stretch {
  name: { en: string; tr: string };
  seconds: number;
  instructions: { en: string; tr: string };
  emoji: string;
}

const STRETCHES: Stretch[] = [
  { name: { en: "Neck Rolls", tr: "Boyun Döndürme" }, seconds: 30, emoji: "🔄",
    instructions: { en: "Slowly roll your head in a circle. 5 times each direction.", tr: "Başınızı yavaşça daire çizerek döndürün. Her yöne 5 kez." } },
  { name: { en: "Shoulder Shrugs", tr: "Omuz Silkme" }, seconds: 20, emoji: "🤷",
    instructions: { en: "Raise shoulders to ears, hold 3s, release. Repeat 10x.", tr: "Omuzları kulaklara kaldırın, 3sn tutun, bırakın. 10 kez." } },
  { name: { en: "Chest Opener", tr: "Göğüs Açma" }, seconds: 30, emoji: "🫁",
    instructions: { en: "Clasp hands behind back, squeeze shoulder blades, lift arms. Hold 15s.", tr: "Elleri arkada birleştirin, kürek kemiklerini sıkın. 15sn tutun." } },
  { name: { en: "Spinal Twist", tr: "Bel Döndürme" }, seconds: 30, emoji: "🔁",
    instructions: { en: "Sit tall, twist torso right, left hand on right knee. 15s each side.", tr: "Dik oturun, gövdeyi sağa döndürün. Her taraf 15sn." } },
  { name: { en: "Wrist Stretch", tr: "Bilek Esneme" }, seconds: 20, emoji: "✋",
    instructions: { en: "Extend arm palm up, pull fingers back gently. 10s each hand.", tr: "Kolu uzatın, parmakları geriye çekin. Her el 10sn." } },
  { name: { en: "Hip Flexor", tr: "Kalça Esneme" }, seconds: 30, emoji: "🦵",
    instructions: { en: "Lunge position, keep back straight. 15s each leg.", tr: "Lunge pozisyonu, sırt düz. Her bacak 15sn." } },
];

const TOTAL_ROUTINE_SECONDS = STRETCHES.reduce((a, s) => a + s.seconds, 0);

// ── Circular Progress Ring ──
function CountdownRing({ seconds, total, size = 120 }: { seconds: number; total: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? seconds / total : 0;
  const offset = circ * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-muted, #e5e7eb)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-primary, #3c7a52)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{seconds}</span>
        <span className="text-[10px] text-muted-foreground">sec</span>
      </div>
    </div>
  );
}

export default function PostureErgonomicsPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showIssues, setShowIssues] = useState(false);

  // Workout Player state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentStretch, setCurrentStretch] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [routineComplete, setRoutineComplete] = useState(false);

  const toggleCheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const checklistPct = (checkedCount / CHECKLIST.length) * 100;

  // Timer logic
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isPlaying, timeLeft]);

  // Auto-advance when time runs out
  useEffect(() => {
    if (timeLeft === 0 && isPlaying) {
      if (currentStretch < STRETCHES.length - 1) {
        setTimeout(() => {
          setCurrentStretch((p) => p + 1);
          setTimeLeft(STRETCHES[currentStretch + 1].seconds);
        }, 800);
      } else {
        setIsPlaying(false);
        setRoutineComplete(true);
      }
    }
  }, [timeLeft, isPlaying, currentStretch]);

  const startRoutine = () => {
    setPlayerOpen(true);
    setCurrentStretch(0);
    setTimeLeft(STRETCHES[0].seconds);
    setIsPlaying(true);
    setRoutineComplete(false);
  };

  const skipStretch = () => {
    if (currentStretch < STRETCHES.length - 1) {
      setCurrentStretch((p) => p + 1);
      setTimeLeft(STRETCHES[currentStretch + 1].seconds);
    } else {
      setIsPlaying(false);
      setRoutineComplete(true);
    }
  };

  const stretch = STRETCHES[currentStretch];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3">
          <Monitor className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {tx("posture.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("posture.subtitle", lang)}</p>
        </div>
      </motion.div>

      {/* ── Desk Rescue Routine Card ── */}
      <div className="mb-6 rounded-2xl border bg-gradient-to-r from-primary/5 to-sage/5 p-5 dark:from-primary/10 dark:to-sage/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">
              {isTr ? "Masa Başı Kurtarma Rutini" : "Desk Rescue Routine"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {STRETCHES.length} {isTr ? "hareket" : "exercises"} • {Math.ceil(TOTAL_ROUTINE_SECONDS / 60)} min
            </p>
          </div>
          <button onClick={startRoutine}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 animate-[softPulse_3s_ease-in-out_infinite]">
            <Play className="h-4 w-4" />
            {isTr ? "Rutini Başlat" : "Start Routine"}
          </button>
        </div>
        {/* Mini preview */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {STRETCHES.map((s, i) => (
            <span key={i} className="shrink-0 rounded-full bg-background border px-2.5 py-1 text-[10px] text-muted-foreground">
              {s.emoji} {s.name[lang as "en" | "tr"]}
            </span>
          ))}
        </div>
        <style jsx>{`
          @keyframes softPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(60, 122, 82, 0.3); }
            50% { box-shadow: 0 0 0 8px rgba(60, 122, 82, 0); }
          }
        `}</style>
      </div>

      {/* ── Workout Player Modal ── */}
      <AnimatePresence>
      {playerOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm px-6 text-center">
            {/* Close */}
            <button onClick={() => { setPlayerOpen(false); setIsPlaying(false); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </button>

            {routineComplete ? (
              /* Completion screen */
              <div className="space-y-4 py-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
                  style={{ animation: "scaleIn 0.5s ease-out" }}>
                  <Check className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold">{isTr ? "Tebrikler!" : "Well Done!"}</h2>
                <p className="text-sm text-muted-foreground">
                  {isTr ? "3 dakikalık rutini tamamladın. Vücudun teşekkür ediyor!" : "You completed the 3-minute routine. Your body thanks you!"}
                </p>
                <button onClick={() => setPlayerOpen(false)}
                  className="rounded-xl border px-6 py-2 text-sm font-medium hover:bg-muted">
                  {isTr ? "Kapat" : "Close"}
                </button>
                <style jsx>{`@keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
              </div>
            ) : (
              /* Active exercise */
              <div className="space-y-6">
                {/* Progress indicator */}
                <p className="text-xs text-muted-foreground">
                  {currentStretch + 1} / {STRETCHES.length}
                </p>

                {/* Emoji + name */}
                <div>
                  <span className="text-5xl">{stretch.emoji}</span>
                  <h2 className="mt-2 text-xl font-bold">{stretch.name[lang as "en" | "tr"]}</h2>
                </div>

                {/* Countdown ring */}
                <div className="flex justify-center">
                  <CountdownRing seconds={timeLeft} total={stretch.seconds} size={140} />
                </div>

                {/* Instructions */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stretch.instructions[lang as "en" | "tr"]}
                </p>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                  <button onClick={skipStretch}
                    className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-muted">
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Gamified Ergonomics Checklist ── */}
      <div className="mb-6 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">{tx("posture.checklist", lang)}</h3>
          <span className={`text-xs font-bold ${checkedCount === CHECKLIST.length ? "text-emerald-500" : "text-muted-foreground"}`}>
            {checkedCount}/{CHECKLIST.length}
          </span>
        </div>

        {/* Animated progress bar */}
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${checklistPct}%`,
              background: checklistPct === 100
                ? "linear-gradient(90deg, #22c55e, #10b981)"
                : "linear-gradient(90deg, var(--color-primary, #3c7a52), #5aac74)",
            }} />
        </div>

        <div className="space-y-1.5">
          {CHECKLIST.map((item) => {
            const Icon = item.icon;
            const isChecked = checked[item.key] || false;
            return (
              <button key={item.key} onClick={() => toggleCheck(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isChecked
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "hover:bg-muted/50"
                }`}>
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isChecked ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 dark:border-gray-600"
                }`}>
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${isChecked ? "text-emerald-500" : "text-muted-foreground"}`} />
                <span className={`text-sm ${isChecked ? "line-through text-muted-foreground" : "font-medium"}`}>
                  {tx(item.key, lang)}
                </span>
              </button>
            );
          })}
        </div>

        {checkedCount === CHECKLIST.length && (
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            🎉 {tx("posture.checklistComplete", lang)}
          </div>
        )}
      </div>

      {/* Posture Issues (collapsible) */}
      <div className="mb-6">
        <button onClick={() => setShowIssues(!showIssues)}
          className="flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left text-sm font-semibold hover:bg-muted/50">
          {tx("posture.commonIssues", lang)}
          {showIssues ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showIssues && (
          <div className="mt-2 space-y-2">
            {[
              { nameKey: "posture.textNeck", descKey: "posture.textNeckDesc" },
              { nameKey: "posture.roundedShoulders", descKey: "posture.roundedShouldersDesc" },
              { nameKey: "posture.lowerBackPain", descKey: "posture.lowerBackPainDesc" },
            ].map((issue) => (
              <div key={issue.nameKey} className="rounded-xl border bg-card p-3">
                <h4 className="text-sm font-semibold text-primary mb-0.5">{tx(issue.nameKey, lang)}</h4>
                <p className="text-xs text-muted-foreground">{tx(issue.descKey, lang)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-muted-foreground/50">{tx("disclaimer.tool", lang)}</p>
    </div>
    </div>
  );
}
