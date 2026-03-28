"use client";

import { useState } from "react";
import {
  MonitorSmartphone,
  Eye,
  Moon,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface QuizQuestion {
  question: { en: string; tr: string };
  options: Array<{ label: { en: string; tr: string }; score: number }>;
}

const QUIZ: QuizQuestion[] = [
  {
    question: {
      en: "How many hours per day do you use screens?",
      tr: "Günlük kac saat ekran kullaniyorsunuz?",
    },
    options: [
      { label: { en: "< 4 hours", tr: "< 4 saat" }, score: 0 },
      { label: { en: "4-8 hours", tr: "4-8 saat" }, score: 1 },
      { label: { en: "8-12 hours", tr: "8-12 saat" }, score: 2 },
      { label: { en: "> 12 hours", tr: "> 12 saat" }, score: 3 },
    ],
  },
  {
    question: {
      en: "Do you use screens before bed?",
      tr: "Yatmadan once ekran kullaniyor musunuz?",
    },
    options: [
      { label: { en: "No, I stop 2+ hours before", tr: "Hayir, 2+ saat once birakiyorum" }, score: 0 },
      { label: { en: "Yes, until 1 hour before", tr: "Evet, 1 saat oncesine kadar" }, score: 1 },
      { label: { en: "Yes, right until I sleep", tr: "Evet, uyuyana kadar" }, score: 3 },
    ],
  },
  {
    question: {
      en: "Do you experience eye strain symptoms?",
      tr: "Goz yorgunlugu belirtileri yasiyor musunuz?",
    },
    options: [
      { label: { en: "Rarely or never", tr: "Nadiren veya hic" }, score: 0 },
      { label: { en: "Sometimes", tr: "Bazen" }, score: 1 },
      { label: { en: "Often", tr: "Sik sik" }, score: 2 },
      { label: { en: "Every day", tr: "Her gun" }, score: 3 },
    ],
  },
  {
    question: {
      en: "Do you use blue light filters?",
      tr: "Mavi isik filtresi kullaniyor musunuz?",
    },
    options: [
      { label: { en: "Yes, always after sunset", tr: "Evet, gun batiminden sonra her zaman" }, score: 0 },
      { label: { en: "Sometimes", tr: "Bazen" }, score: 1 },
      { label: { en: "No", tr: "Hayir" }, score: 2 },
    ],
  },
  {
    question: {
      en: "Do you follow the 20-20-20 rule?",
      tr: "20-20-20 kuralini uyguluyor musunuz?",
    },
    options: [
      { label: { en: "Yes, regularly", tr: "Evet, duzenli olarak" }, score: 0 },
      { label: { en: "Sometimes", tr: "Bazen" }, score: 1 },
      { label: { en: "What's that?", tr: "O ne?" }, score: 2 },
    ],
  },
];

function getAssessmentResult(score: number, lang: string): { label: string; color: string; advice: string } {
  if (score <= 3) {
    return {
      label: lang === "tr" ? "Dusuk Risk" : "Low Risk",
      color: "text-green-600 dark:text-green-400",
      advice: lang === "tr"
        ? "Ekran kullaniminiz saglikli gorunuyor. Iyi aliskanliklarinizi surdurun!"
        : "Your screen habits look healthy. Keep up the good practices!",
    };
  }
  if (score <= 7) {
    return {
      label: lang === "tr" ? "Orta Risk" : "Moderate Risk",
      color: "text-amber-600 dark:text-amber-400",
      advice: lang === "tr"
        ? "Ekran kullaniminizi azaltmak icin bazi adimlar atmaniz oneriliyor."
        : "Consider taking some steps to reduce your screen exposure.",
    };
  }
  return {
    label: lang === "tr" ? "Yuksek Risk" : "High Risk",
    color: "text-red-600 dark:text-red-400",
    advice: lang === "tr"
      ? "Ekran kullaniminiz goz sagliginizi olumsuz etkiliyor olabilir. Asagidaki ipuclarini uygulayın."
      : "Your screen usage may be negatively affecting your eye health. Follow the tips below.",
  };
}

export default function ScreenTimePage() {
  const { lang } = useLang();
  const [showRule, setShowRule] = useState(true);
  const [showBlueLight, setShowBlueLight] = useState(false);
  const [showSleep, setShowSleep] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizDone, setQuizDone] = useState(false);

  const quizScore = Object.values(quizAnswers).reduce((a, b) => a + b, 0);
  const assessmentResult = getAssessmentResult(quizScore, lang);

  const SYMPTOMS = [
    "screen.dryEyes",
    "screen.headache",
    "screen.blurry",
    "screen.neckPain",
  ];

  const TIPS = [
    "screen.tip1",
    "screen.tip2",
    "screen.tip3",
    "screen.tip4",
    "screen.tip5",
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-950">
          <MonitorSmartphone className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("screen.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("screen.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* 20-20-20 Rule */}
      <div className="mb-4">
        <button
          onClick={() => setShowRule(!showRule)}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="h-4 w-4 text-violet-500" />
            {tx("screen.rule202020", lang)}
          </span>
          {showRule ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showRule && (
          <div className="mt-2 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">20</p>
                <p className="text-xs text-muted-foreground">{lang === "tr" ? "dakika" : "minutes"}</p>
              </div>
              <span className="text-xl text-muted-foreground">-</span>
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">20</p>
                <p className="text-xs text-muted-foreground">{lang === "tr" ? "saniye" : "seconds"}</p>
              </div>
              <span className="text-xl text-muted-foreground">-</span>
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">20</p>
                <p className="text-xs text-muted-foreground">{lang === "tr" ? "fit (6m)" : "feet (6m)"}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {tx("screen.rule202020Desc", lang)}
            </p>
          </div>
        )}
      </div>

      {/* Eye Strain Symptoms */}
      <div className="mb-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-violet-500" />
          {tx("screen.symptoms", lang)}
        </h3>
        <ul className="space-y-1.5">
          {SYMPTOMS.map((key) => (
            <li key={key} className="text-sm flex items-start gap-2">
              <span className="text-violet-500 mt-0.5">&#8226;</span>
              {tx(key, lang)}
            </li>
          ))}
        </ul>
      </div>

      {/* Blue Light */}
      <div className="mb-4">
        <button
          onClick={() => setShowBlueLight(!showBlueLight)}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            {tx("screen.blueLight", lang)}
          </span>
          {showBlueLight ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showBlueLight && (
          <div className="mt-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            {tx("screen.blueLightDesc", lang)}
          </div>
        )}
      </div>

      {/* Sleep Impact */}
      <div className="mb-4">
        <button
          onClick={() => setShowSleep(!showSleep)}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Moon className="h-4 w-4 text-indigo-500" />
            {tx("screen.sleepImpact", lang)}
          </span>
          {showSleep ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showSleep && (
          <div className="mt-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            {tx("screen.sleepImpactDesc", lang)}
          </div>
        )}
      </div>

      {/* Reduction Tips */}
      <div className="mb-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-violet-500" />
          {tx("screen.tips", lang)}
        </h3>
        <ul className="space-y-1.5">
          {TIPS.map((key) => (
            <li key={key} className="text-sm flex items-start gap-2">
              <span className="text-violet-500 mt-0.5">&#8226;</span>
              {tx(key, lang)}
            </li>
          ))}
        </ul>
      </div>

      {/* Self-Assessment Quiz */}
      <div className="mb-4">
        <button
          onClick={() => { setShowQuiz(!showQuiz); setQuizDone(false); setQuizAnswers({}); }}
          className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-violet-500" />
            {tx("screen.assessment", lang)}
          </span>
          {showQuiz ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showQuiz && (
          <div className="mt-2 space-y-4">
            {QUIZ.map((q, qi) => (
              <div key={qi} className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium mb-2">
                  {qi + 1}. {lang === "tr" ? q.question.tr : q.question.en}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => {
                        setQuizAnswers((prev) => ({ ...prev, [qi]: opt.score }));
                        if (Object.keys({ ...quizAnswers, [qi]: opt.score }).length === QUIZ.length) {
                          setQuizDone(true);
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        quizAnswers[qi] === opt.score
                          ? "border-violet-400 bg-violet-50 dark:border-violet-600 dark:bg-violet-950/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {lang === "tr" ? opt.label.tr : opt.label.en}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {quizDone && (
              <div className={`rounded-lg border p-4 ${
                quizScore <= 3 ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20"
                : quizScore <= 7 ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20"
                : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20"
              }`}>
                <p className={`text-lg font-bold ${assessmentResult.color}`}>
                  {assessmentResult.label}
                </p>
                <p className="text-sm mt-1">{assessmentResult.advice}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
