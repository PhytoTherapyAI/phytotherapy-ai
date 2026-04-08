// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import { Footprints, Plus, TrendingUp, Target, AlertTriangle, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface WalkEntry {
  id: string;
  date: string;
  steps: number;
  distance: number; // km
  duration: number; // minutes
}

const WHO_TARGET_MINUTES = 150; // per week

export default function WalkingTrackerPage() {
  const { lang } = useLang();
  const [entries, setEntries] = useState<WalkEntry[]>([]);
  const [steps, setSteps] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [walkingSpeed, setWalkingSpeed] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("walking-tracker");
      if (saved) setEntries(JSON.parse(saved));
    } catch { /* corrupted localStorage */ }
  }, []);

  const saveEntries = (updated: WalkEntry[]) => {
    setEntries(updated);
    localStorage.setItem("walking-tracker", JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!steps && !distance && !duration) return;
    const entry: WalkEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      steps: parseInt(steps) || 0,
      distance: parseFloat(distance) || 0,
      duration: parseInt(duration) || 0,
    };
    saveEntries([entry, ...entries]);
    setSteps(""); setDistance(""); setDuration("");
  };

  const deleteEntry = (id: string) => saveEntries(entries.filter((e) => e.id !== id));

  // Weekly calculations
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEntries = entries.filter((e) => new Date(e.date) >= weekStart);
  const weekMinutes = weekEntries.reduce((sum, e) => sum + e.duration, 0);
  const weekSteps = weekEntries.reduce((sum, e) => sum + e.steps, 0);
  const weekDistance = weekEntries.reduce((sum, e) => sum + e.distance, 0);
  const weekProgress = Math.min(100, Math.round((weekMinutes / WHO_TARGET_MINUTES) * 100));

  // Sarcopenia screening
  const speed = parseFloat(walkingSpeed);
  const sarcopeniaRisk = speed > 0 && speed < 0.8;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Footprints className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("walking.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("walking.subtitle", lang)}</p>
      </div>

      {/* Weekly Progress */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
            <Target className="w-4 h-4" /> {tx("walking.weeklyTarget", lang)}
          </h3>
          <span className="text-sm text-green-600 dark:text-green-400">{weekMinutes} / {WHO_TARGET_MINUTES} {tx("common.min", lang)}</span>
        </div>
        <div className="w-full h-4 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${weekProgress}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{weekSteps.toLocaleString()}</p>
            <p className="text-xs text-green-600">{tx("walking.steps", lang)}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{weekDistance.toFixed(1)}</p>
            <p className="text-xs text-green-600">km</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{weekMinutes}</p>
            <p className="text-xs text-green-600">{tx("common.minutes", lang)}</p>
          </div>
        </div>
      </div>

      {/* Add Entry */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{tx("walking.addEntry", lang)}</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{tx("walking.stepsLabel", lang)}</label>
            <input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="5000" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{tx("walking.distance", lang)}</label>
            <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="3.5" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{tx("walking.duration", lang)}</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="45" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>
        <Button onClick={addEntry} disabled={!steps && !distance && !duration} className="w-full bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> {tx("walking.addEntry", lang)}
        </Button>
      </div>

      {/* Sarcopenia Screening */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" /> {tx("walking.speedScreening", lang)}
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            step="0.1"
            value={walkingSpeed}
            onChange={(e) => setWalkingSpeed(e.target.value)}
            placeholder={tx("walking.speedPlaceholder", lang)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          <span className="text-xs text-gray-400">Normal: &gt; 0.8 m/s</span>
        </div>
        {sarcopeniaRisk && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {tx("walking.sarcopeniaWarning", lang)}
            </p>
          </div>
        )}
      </div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{tx("walking.recentEntries", lang)}</h3>
          {entries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">{entry.date}</span>
                {entry.steps > 0 && <span className="text-sm text-gray-700 dark:text-gray-300">{entry.steps.toLocaleString()} {tx("walking.steps", lang)}</span>}
                {entry.distance > 0 && <span className="text-sm text-gray-500">{entry.distance} km</span>}
                {entry.duration > 0 && <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{entry.duration}{tx("common.min", lang)}</span>}
              </div>
              <button onClick={() => deleteEntry(entry.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
