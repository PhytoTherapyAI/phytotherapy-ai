// © 2026 Doctopal — All Rights Reserved
// Polyphasic / Split Sleep Logger — Session-based multi-block entry

"use client";

import { useState } from "react";
import { Plus, X, Moon, Sun, Coffee, Zap, Loader2 } from "lucide-react";
import { tx } from "@/lib/translations";

interface SleepSession {
  id: string;
  startTime: string;
  endTime: string;
  type: "night" | "nap";
  quality: number;
}

interface SleepSessionLoggerProps {
  lang: "en" | "tr";
  onSubmit: (data: {
    sessions: SleepSession[];
    contextTags: string[];
    grogginess: number;
    dreamNote: string;
  }) => void;
  isLoading: boolean;
}

const CONTEXT_TAGS = [
  { key: "on_call", emoji: "🏥", label: { en: "On-Call / Shift", tr: "Nöbetçi / Vardiya" } },
  { key: "traveling", emoji: "✈️", label: { en: "Traveling", tr: "Seyahat" } },
  { key: "exam_stress", emoji: "📚", label: { en: "Exam / Study", tr: "Sınav / Çalışma" } },
  { key: "illness", emoji: "🤒", label: { en: "Sick", tr: "Hasta" } },
];

const ENERGY_LABELS = {
  1: { en: "Dragging myself awake", tr: "Sürünerek uyandım", emoji: "😴" },
  2: { en: "Groggy but functional", tr: "Mahmur ama idare eder", emoji: "😪" },
  3: { en: "Normal", tr: "Normal", emoji: "😐" },
  4: { en: "Refreshed", tr: "Dinlenmiş", emoji: "😊" },
  5: { en: "Fully charged!", tr: "Bomba gibi!", emoji: "🤩" },
};

function calcSessionDuration(start: string, end: string): number {
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  let mins = (eH * 60 + eM) - (sH * 60 + sM);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

export function SleepSessionLogger({ lang, onSubmit, isLoading }: SleepSessionLoggerProps) {
  const [sessions, setSessions] = useState<SleepSession[]>([
    { id: "1", startTime: "23:00", endTime: "07:00", type: "night", quality: 3 },
  ]);
  const [contextTags, setContextTags] = useState<string[]>([]);
  const [grogginess, setGrogginess] = useState(3);
  const [dreamNote, setDreamNote] = useState("");
  const [showDream, setShowDream] = useState(false);

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      { id: String(Date.now()), startTime: "14:00", endTime: "15:30", type: "nap", quality: 3 },
    ]);
  };

  const removeSession = (id: string) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSession = (id: string, field: keyof SleepSession, value: string | number) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleTag = (key: string) => {
    setContextTags((prev) => prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]);
  };

  const totalDuration = sessions.reduce((acc, s) => acc + calcSessionDuration(s.startTime, s.endTime), 0);

  const handleSubmit = () => {
    onSubmit({ sessions, contextTags, grogginess, dreamNote: dreamNote.trim() });
  };

  return (
    <div className="space-y-4">
      {/* Sleep Sessions */}
      <div className="space-y-3">
        {sessions.map((session, idx) => (
          <div key={session.id} className="rounded-xl border p-3 space-y-2 glass-card shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {session.type === "night" ? (
                  <Moon className="h-4 w-4 text-indigo-500" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-xs font-semibold">
                  {lang === "tr" ? `Blok ${idx + 1}` : `Block ${idx + 1}`}
                </span>
                <select
                  value={session.type}
                  onChange={(e) => updateSession(session.id, "type", e.target.value)}
                  className="rounded border bg-background px-2 py-0.5 text-[10px]"
                >
                  <option value="night">{lang === "tr" ? "Gece" : "Night"}</option>
                  <option value="nap">{lang === "tr" ? "Şekerleme" : "Nap"}</option>
                </select>
                <span className="text-[10px] text-muted-foreground">
                  ({calcSessionDuration(session.startTime, session.endTime)}h)
                </span>
              </div>
              {sessions.length > 1 && (
                <button onClick={() => removeSession(session.id)} className="text-muted-foreground hover:text-red-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">{tx("sleep.bedtime", lang)}</label>
                <input type="time" value={session.startTime}
                  onChange={(e) => updateSession(session.id, "startTime", e.target.value)}
                  className="w-full rounded-lg border bg-background px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">{tx("sleep.wakeTime", lang)}</label>
                <input type="time" value={session.endTime}
                  onChange={(e) => updateSession(session.id, "endTime", e.target.value)}
                  className="w-full rounded-lg border bg-background px-2 py-1.5 text-sm" />
              </div>
            </div>
          </div>
        ))}

        <button onClick={addSession}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-300 py-2.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30">
          <Plus className="h-3.5 w-3.5" />
          {lang === "tr" ? "Uyku Oturumu Ekle" : "Add Sleep Session"}
        </button>

        {/* Total duration */}
        <div className="text-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
          {lang === "tr" ? "Toplam:" : "Total:"} {totalDuration}h
        </div>
      </div>

      {/* Context Tags */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {lang === "tr" ? "Günün Modu" : "Today's Mode"}
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTEXT_TAGS.map(({ key, emoji, label }) => (
            <button
              key={key}
              onClick={() => toggleTag(key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                contextTags.includes(key)
                  ? key === "on_call"
                    ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                    : "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300"
                  : "border-gray-200 dark:border-gray-700 hover:bg-muted"
              }`}
            >
              <span>{emoji}</span>
              {label[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Morning Energy Slider */}
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Zap className="h-3 w-3" />
          {lang === "tr" ? "Sabah Enerjisi" : "Morning Energy"}
        </p>
        <div className="flex justify-between gap-1">
          {Object.entries(ENERGY_LABELS).map(([val, config]) => {
            const v = Number(val);
            return (
              <button
                key={v}
                onClick={() => setGrogginess(v)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-xs transition-all ${
                  grogginess === v
                    ? "bg-indigo-100 ring-2 ring-indigo-500 ring-offset-1 dark:bg-indigo-900/40 dark:ring-offset-gray-900 scale-105"
                    : "opacity-50 hover:opacity-75"
                }`}
              >
                <span className="text-xl">{config.emoji}</span>
                <span className="text-[9px] text-center leading-tight">{config[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dream Note (optional) */}
      <div className="space-y-2">
        <button
          onClick={() => setShowDream(!showDream)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>💭</span>
          {lang === "tr" ? "Rüya notu ekle (opsiyonel)" : "Add dream note (optional)"}
        </button>
        {showDream && (
          <textarea
            value={dreamNote}
            onChange={(e) => setDreamNote(e.target.value)}
            placeholder={lang === "tr" ? "Rüyanı kısaca anlat..." : "Briefly describe your dream..."}
            maxLength={500}
            rows={2}
            className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-medium text-white transition-all hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {lang === "tr" ? "Kaydediliyor..." : "Saving..."}
          </span>
        ) : (
          lang === "tr" ? "Kaydet ve Analiz Et ✨" : "Save & Analyze ✨"
        )}
      </button>
    </div>
  );
}
