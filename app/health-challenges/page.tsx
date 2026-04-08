// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import { Trophy, Droplets, Apple, Footprints, Brain, Check, RotateCcw, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx, txObj } from "@/lib/translations";

interface Challenge {
  id: string;
  icon: React.ReactNode;
  titleEn: string;
  titleTr: string;
  descEn: string;
  descTr: string;
  days: number;
  rulesEn: string[];
  rulesTr: string[];
  color: string;
  bgColor: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: "water-30",
    icon: <Droplets className="w-6 h-6" />,
    titleEn: "30-Day Water Challenge",
    titleTr: "30 Günlük Su Challenge'i",
    descEn: "Drink at least 8 glasses of water every day",
    descTr: "Her gun en az 8 bardak su icin",
    days: 30,
    rulesEn: [
      "Drink at least 8 glasses (2 liters) of water daily",
      "Start your morning with a glass of water",
      "No sugary drinks count toward the goal",
      "Herbal teas count as half a glass",
    ],
    rulesTr: [
      "Günlük en az 8 bardak (2 litre) su icin",
      "Gune bir bardak su ile başlayin",
      "Sekerli icecekler hedefe dahil degildir",
      "Bitki caylari yarim bardak sayilir",
    ],
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "sugar-21",
    icon: <Apple className="w-6 h-6" />,
    titleEn: "21-Day Sugar-Free",
    titleTr: "21 Günlük Sekersiz Yasam",
    descEn: "Eliminate added sugars from your diet",
    descTr: "Diyetinizden eklenmiş sekerleri cikarin",
    days: 21,
    rulesEn: [
      "No added sugar in food or drinks",
      "Natural sugars from whole fruits are okay",
      "Read labels for hidden sugars",
      "Replace sweets with nuts or fresh fruit",
    ],
    rulesTr: [
      "Yiyecek ve iceceklerde eklenmis şeker yok",
      "Bütün meyvelerden gelen doğal şeker serbesttir",
      "Gizli sekerler için etiketleri okuyun",
      "Tatlilari findik veya taze meyveyle degistirin",
    ],
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    id: "steps-10k",
    icon: <Footprints className="w-6 h-6" />,
    titleEn: "10,000 Steps Daily",
    titleTr: "Günlük 10.000 Adim",
    descEn: "Walk 10,000 steps every day for 30 days",
    descTr: "30 gun boyunca her gun 10.000 adim atin",
    days: 30,
    rulesEn: [
      "Track steps with phone or fitness tracker",
      "Walking, hiking, and jogging all count",
      "Break it up throughout the day if needed",
      "Start with 5,000 and build up if 10k is too much",
    ],
    rulesTr: [
      "Adimlari telefon veya fitness tracker ile takip edin",
      "Yuruyus, dogada yuruyus ve kosma hepsi sayilir",
      "Gerekirse gun icine yayin",
      "10k cok fazlaysa 5.000 ile başlayin ve artirin",
    ],
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    id: "meditation-7",
    icon: <Brain className="w-6 h-6" />,
    titleEn: "7-Day Meditation",
    titleTr: "7 Günlük Meditasyon",
    descEn: "Meditate for at least 10 minutes daily",
    descTr: "Her gun en az 10 dakika meditasyon yapin",
    days: 7,
    rulesEn: [
      "Meditate for at least 10 minutes",
      "Any style: guided, breathing, body scan, mindfulness",
      "Same time each day builds habit faster",
      "A quiet space is preferred but not required",
    ],
    rulesTr: [
      "En az 10 dakika meditasyon yapin",
      "Her tur: rehberli, nefes, vucut taramasi, farkindalik",
      "Her gun ayni saatte yapmak aliskanlik oluşturur",
      "Sessiz mekan tercih edilir ama zorunlu degildir",
    ],
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
];

interface ChallengeState {
  startDate: string;
  completedDays: boolean[];
}

function loadState(): Record<string, ChallengeState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("phyto_challenges");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveState(state: Record<string, ChallengeState>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("phyto_challenges", JSON.stringify(state));
}

export default function HealthChallengesPage() {
  const { lang } = useLang();
  const [states, setStates] = useState<Record<string, ChallengeState>>({});
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  useEffect(() => {
    setStates(loadState());
  }, []);

  const startChallenge = (id: string, days: number) => {
    const updated = {
      ...states,
      [id]: {
        startDate: new Date().toISOString(),
        completedDays: Array(days).fill(false),
      },
    };
    setStates(updated);
    saveState(updated);
  };

  const toggleDay = (id: string, dayIdx: number) => {
    const s = states[id];
    if (!s) return;
    const updated = { ...states };
    updated[id] = {
      ...s,
      completedDays: s.completedDays.map((v, i) => (i === dayIdx ? !v : v)),
    };
    setStates(updated);
    saveState(updated);
  };

  const resetChallenge = (id: string) => {
    const updated = { ...states };
    delete updated[id];
    setStates(updated);
    saveState(updated);
  };

  const getStreak = (completed: boolean[]): number => {
    let streak = 0;
    for (let i = completed.length - 1; i >= 0; i--) {
      if (completed[i]) streak++;
      else break;
    }
    return streak;
  };

  const getProgress = (completed: boolean[]): number => {
    const done = completed.filter(Boolean).length;
    return Math.round((done / completed.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("challenges.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("challenges.subtitle", lang)}</p>
        </div>

        {/* Challenge Cards */}
        <div className="space-y-4">
          {CHALLENGES.map((c) => {
            const state = states[c.id];
            const isActive = !!state;
            const isSelected = selectedChallenge === c.id;

            return (
              <div key={c.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-700 overflow-hidden`}>
                {/* Card Header */}
                <button
                  onClick={() => setSelectedChallenge(isSelected ? null : c.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${c.bgColor} p-2.5 rounded-xl ${c.color}`}>{c.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {txObj(c, lang)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {txObj({ en: c.descEn, tr: c.descTr }, lang)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className={`w-4 h-4 ${c.color}`} />
                        <span className={`font-bold ${c.color}`}>{getStreak(state.completedDays)}</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{c.days} {tx("common.days", lang)}</span>
                  </div>
                </button>

                {/* Expanded Content */}
                {isSelected && (
                  <div className="px-5 pb-5 space-y-4">
                    {/* Rules */}
                    <div className={`${c.bgColor} rounded-xl p-4`}>
                      <h4 className={`text-sm font-semibold ${c.color} mb-2`}>
                        {tx("challenges.rules", lang)}
                      </h4>
                      <ul className="space-y-1">
                        {({ en: c.rulesEn, tr: c.rulesTr }[lang] ?? c.rulesEn).map((r, i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                            <span className={c.color}>•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Start / Progress */}
                    {!isActive ? (
                      <Button
                        onClick={() => startChallenge(c.id, c.days)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                      >
                        {tx("challenges.start", lang)}
                      </Button>
                    ) : (
                      <>
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500 dark:text-gray-400">
                              {state.completedDays.filter(Boolean).length}/{c.days}
                            </span>
                            <span className={`font-bold ${c.color}`}>{getProgress(state.completedDays)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${getProgress(state.completedDays)}%` }}
                            />
                          </div>
                        </div>

                        {/* Day Grid */}
                        <div className="grid grid-cols-7 gap-2">
                          {state.completedDays.map((done, i) => (
                            <button
                              key={i}
                              onClick={() => toggleDay(c.id, i)}
                              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                                done
                                  ? "bg-orange-500 text-white shadow-sm"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                              }`}
                            >
                              {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                            </button>
                          ))}
                        </div>

                        {/* Reset */}
                        <button
                          onClick={() => resetChallenge(c.id)}
                          className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors mx-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {tx("challenges.reset", lang)}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
