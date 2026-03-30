// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Monitor,
  CheckSquare,
  Square,
  Armchair,
  Keyboard,
  Sun,
  Timer,
  Hand,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ChecklistItem {
  key: string;
  icon: React.ElementType;
}

const CHECKLIST: ChecklistItem[] = [
  { key: "posture.monitor", icon: Monitor },
  { key: "posture.chair", icon: Armchair },
  { key: "posture.keyboard", icon: Keyboard },
  { key: "posture.screen", icon: Sun },
  { key: "posture.breaks", icon: Timer },
  { key: "posture.wrists", icon: Hand },
];

interface PostureIssue {
  nameKey: string;
  descKey: string;
}

const POSTURE_ISSUES: PostureIssue[] = [
  { nameKey: "posture.textNeck", descKey: "posture.textNeckDesc" },
  { nameKey: "posture.roundedShoulders", descKey: "posture.roundedShouldersDesc" },
  { nameKey: "posture.lowerBackPain", descKey: "posture.lowerBackPainDesc" },
];

interface StretchExercise {
  name: { en: string; tr: string };
  duration: string;
  instructions: { en: string; tr: string };
}

const STRETCHES: StretchExercise[] = [
  {
    name: { en: "Neck Rolls", tr: "Boyun Döndürme" },
    duration: "30s",
    instructions: {
      en: "Slowly roll your head in a circle. 5 times each direction.",
      tr: "Başınızı yavaşça bir daire çizecek şekilde döndürün. Her yöne 5 kez.",
    },
  },
  {
    name: { en: "Shoulder Shrugs", tr: "Omuz Silkme" },
    duration: "20s",
    instructions: {
      en: "Raise shoulders to ears, hold 3 seconds, release. Repeat 10 times.",
      tr: "Omuzları kulaklara doğru kaldırın, 3 saniye tutun, bırakın. 10 kez tekrarlayın.",
    },
  },
  {
    name: { en: "Chest Opener", tr: "Göğüs Açma" },
    duration: "30s",
    instructions: {
      en: "Clasp hands behind back, squeeze shoulder blades together, lift arms slightly. Hold 15s.",
      tr: "Elleri arkada birleştirin, kürek kemiklerini sıkın, kolları hafifçe kaldırın. 15sn tutun.",
    },
  },
  {
    name: { en: "Seated Spinal Twist", tr: "Oturarak Bel Döndürme" },
    duration: "30s",
    instructions: {
      en: "Sit tall, twist torso right placing left hand on right knee. Hold 15s each side.",
      tr: "Dik oturun, gövdenizi sağa döndürün sol elinizi sağ dizinize koyun. Her taraf 15sn.",
    },
  },
  {
    name: { en: "Wrist Flexor Stretch", tr: "Bilek Esneme" },
    duration: "20s",
    instructions: {
      en: "Extend arm, palm up. With other hand, gently pull fingers back. Hold 10s each hand.",
      tr: "Kolunuzu uzatın, avuç yukarı. Diğer elinizle parmakları yavaşça geriye çekin. Her el 10sn.",
    },
  },
  {
    name: { en: "Hip Flexor Stretch", tr: "Kalça Fleksör Esneme" },
    duration: "30s",
    instructions: {
      en: "Stand up, step one foot forward into a lunge. Keep back straight. Hold 15s each leg.",
      tr: "Ayağa kalkın, bir adım öne atarak lunge pozisyonuna gelin. Sırt düz. Her bacak 15sn.",
    },
  },
];

export default function PostureErgonomicsPage() {
  const { lang } = useLang();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showIssues, setShowIssues] = useState(false);
  const [showStretches, setShowStretches] = useState(true);

  const toggleCheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-950">
          <Monitor className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("posture.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("posture.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Ergonomics Checklist */}
      <div className="mb-6 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            {tx("posture.checklist", lang)}
          </h3>
          <span className="text-xs text-muted-foreground">
            {checkedCount}/{CHECKLIST.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-300"
            style={{
              width: `${(checkedCount / CHECKLIST.length) * 100}%`,
            }}
          />
        </div>

        <div className="space-y-2">
          {CHECKLIST.map((item) => {
            const Icon = item.icon;
            const isChecked = checked[item.key] || false;
            return (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  isChecked
                    ? "border-teal-300 bg-teal-50/50 dark:border-teal-700 dark:bg-teal-950/20"
                    : "hover:bg-muted/50"
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className={`text-sm ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                  {tx(item.key, lang)}
                </span>
              </button>
            );
          })}
        </div>

        {checkedCount === CHECKLIST.length && (
          <div className="mt-3 rounded-lg bg-teal-50 p-3 text-center text-sm font-medium text-teal-700 dark:bg-teal-950/20 dark:text-teal-400">
            {tx("posture.checklistComplete", lang)}
          </div>
        )}
      </div>

      {/* Common Posture Issues */}
      <div className="mb-6">
        <button
          onClick={() => setShowIssues(!showIssues)}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left text-sm font-semibold hover:bg-muted/50 transition-colors"
        >
          {tx("posture.commonIssues", lang)}
          {showIssues ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showIssues && (
          <div className="mt-2 space-y-3">
            {POSTURE_ISSUES.map((issue) => (
              <div
                key={issue.nameKey}
                className="rounded-lg border bg-card p-4"
              >
                <h4 className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-1">
                  {tx(issue.nameKey, lang)}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {tx(issue.descKey, lang)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desk Stretches */}
      <div className="mb-6">
        <button
          onClick={() => setShowStretches(!showStretches)}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left text-sm font-semibold hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-500" />
            {tx("posture.stretches", lang)}
          </span>
          {showStretches ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showStretches && (
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {STRETCHES.map((stretch, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">
                    {stretch.name[lang as "en" | "tr"]}
                  </h4>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    {stretch.duration}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stretch.instructions[lang as "en" | "tr"]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
