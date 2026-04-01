// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import { Moon, Plus, Trash2, Sparkles, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface DreamEntry {
  id: string;
  date: string;
  content: string;
  analysis?: string;
}

const MED_DREAM_EFFECTS = [
  { meds: "SSRIs (Fluoxetine, Sertraline, Paroxetine)", effect: { en: "Vivid, bizarre dreams, increased REM", tr: "Canli, tuhaf ruyalar, artmis REM" } },
  { meds: "Beta-blockers (Propranolol, Metoprolol)", effect: { en: "Nightmares, disturbed sleep", tr: "Kabulusler, bozuk uyku" } },
  { meds: "Melatonin", effect: { en: "Vivid, colorful dreams", tr: "Canli, renkli ruyalar" } },
  { meds: "Statins (Atorvastatin)", effect: { en: "Unusual dreams, nightmares in some", tr: "Olagandisi ruyalar, bazilarisnda kabuslar" } },
  { meds: "Nicotine patches", effect: { en: "Extremely vivid dreams if worn at night", tr: "Gece takilirsa son derece canli ruyalar" } },
  { meds: "Antipsychotics (Quetiapine)", effect: { en: "May reduce dream recall", tr: "Ruya hatiramini azaltabilir" } },
];

export default function DreamDiaryPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [newDream, setNewDream] = useState("");
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dream-diary");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveEntries = (updated: DreamEntry[]) => {
    setEntries(updated);
    localStorage.setItem("dream-diary", JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!newDream.trim()) return;
    const entry: DreamEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      content: newDream.trim(),
    };
    saveEntries([entry, ...entries]);
    setNewDream("");
  };

  const deleteEntry = (id: string) => {
    saveEntries(entries.filter((e) => e.id !== id));
  };

  const analyzeEntry = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    setAnalyzing(id);

    try {
      // Use chat API for dream analysis
      const meds = "none reported";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze this dream entry for potential medication-related effects. The user takes: ${meds}. Dream: "${entry.content}". Provide a brief 2-3 sentence analysis focusing on whether any medications might influence dream patterns. Respond in ${lang === "tr" ? "Turkish" : "English"}.`,
          lang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = entries.map((e) =>
          e.id === id ? { ...e, analysis: data.reply || data.message || "Analysis complete" } : e
        );
        saveEntries(updated);
      }
    } catch {
      // Silent fail
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Moon className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("dream.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("dream.subtitle", lang)}</p>
      </div>

      {/* New Entry */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <textarea
          value={newDream}
          onChange={(e) => setNewDream(e.target.value)}
          rows={4}
          placeholder={tx("dream.placeholder", lang)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-3"
        />
        <Button onClick={addEntry} disabled={!newDream.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> {tx("dream.save", lang)}
        </Button>
      </div>

      {/* Medication-Dream Correlations */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5 mb-6">
        <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
          {tx("dream.medEffects", lang)}
        </h3>
        <div className="space-y-2">
          {MED_DREAM_EFFECTS.map((m, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="font-medium text-indigo-700 dark:text-indigo-400 min-w-[200px]">{m.meds}</span>
              <span className="text-gray-600 dark:text-gray-400">{m.effect[lang]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{tx("dream.entries", lang)} ({entries.length})</h3>
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {entry.date}</span>
                <button onClick={() => deleteEntry(entry.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{entry.content}</p>
              {entry.analysis ? (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">AI {tx("dream.aiAnalysis", lang)}</p>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">{entry.analysis}</p>
                </div>
              ) : (
                <Button onClick={() => analyzeEntry(entry.id)} disabled={analyzing === entry.id} variant="outline" size="sm" className="text-xs">
                  {analyzing === entry.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  {tx("dream.analyze", lang)}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">{tx("dream.noEntries", lang)}</p>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
