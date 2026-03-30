// © 2026 Phytotherapy.ai — All Rights Reserved
// Circadian Time-Blocked Task List — Morning / Afternoon / Night

"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, Plus } from "lucide-react";

interface Task {
  id: string;
  text: string;
  emoji: string;
  done: boolean;
  block: "morning" | "afternoon" | "night";
}

interface TimeBlockTasksProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddTask?: (block: string) => void;
  lang: "en" | "tr";
}

const BLOCKS = [
  { key: "morning", emoji: "🌅", label: { en: "Morning Routine", tr: "Sabah Rutini" }, hours: "06:00 - 12:00" },
  { key: "afternoon", emoji: "☀️", label: { en: "Afternoon", tr: "Öğle" }, hours: "12:00 - 18:00" },
  { key: "night", emoji: "🌙", label: { en: "Evening Wind-Down", tr: "Akşam Ritüeli" }, hours: "18:00 - 00:00" },
];

export function TimeBlockTasks({ tasks, onToggle, onAddTask, lang }: TimeBlockTasksProps) {
  const [showConfetti, setShowConfetti] = useState<string | null>(null);

  // Group tasks by block
  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = { morning: [], afternoon: [], night: [] };
    for (const t of tasks) map[t.block]?.push(t);
    return map;
  }, [tasks]);

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.done) {
      setShowConfetti(id);
      setTimeout(() => setShowConfetti(null), 800);
    }
    onToggle(id);
  };

  // Determine current time block
  const currentBlock = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    return "night";
  }, []);

  return (
    <div className="space-y-4">
      {BLOCKS.map(({ key, emoji, label, hours }) => {
        const blockTasks = grouped[key] || [];
        const isCurrent = key === currentBlock;

        return (
          <div key={key} className={`rounded-2xl border p-3 transition-all ${
            isCurrent ? "border-primary/30 bg-primary/5 dark:bg-primary/10" : "bg-card"
          }`}>
            {/* Block header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{emoji}</span>
                <span className="text-xs font-bold">{label[lang]}</span>
                {isCurrent && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                    {lang === "tr" ? "Şimdi" : "Now"}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">{hours}</span>
            </div>

            {/* Tasks */}
            {blockTasks.length > 0 ? (
              <div className="space-y-1.5">
                {blockTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleToggle(task.id)}
                    className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                      task.done
                        ? "bg-muted/50 opacity-60"
                        : "bg-background hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-soft"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      task.done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {task.done && <Check className="h-3 w-3" />}
                    </div>

                    {/* Content */}
                    <span className="text-sm">{task.emoji}</span>
                    <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : "font-medium"}`}>
                      {task.text}
                    </span>

                    {/* Micro confetti burst */}
                    {showConfetti === task.id && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div key={i} style={{
                            position: "absolute",
                            left: `${20 + ((i * 7919) % 60)}%`,
                            top: "50%",
                            width: "4px", height: "4px",
                            borderRadius: "50%",
                            backgroundColor: ["#22c55e", "#facc15", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c", "#34d399", "#5aac74"][i],
                            animation: `micro-burst 0.6s ease-out forwards`,
                            animationDelay: `${i * 30}ms`,
                          }} />
                        ))}
                        <style jsx>{`
                          @keyframes micro-burst {
                            0% { transform: translate(0, 0) scale(1); opacity: 1; }
                            100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 30}px, -${20 + Math.random() * 20}px) scale(0); opacity: 0; }
                          }
                        `}</style>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              /* Empty state — invite to add */
              onAddTask && (
                <button
                  onClick={() => onAddTask(key)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/20 py-3 text-xs text-muted-foreground/60 transition-colors hover:border-primary/40 hover:text-muted-foreground"
                >
                  <Plus className="h-3 w-3" />
                  {lang === "tr"
                    ? `${label.tr.split(" ")[0]} takviyesi ekle`
                    : `Add ${label.en.split(" ")[0].toLowerCase()} supplement`}
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
