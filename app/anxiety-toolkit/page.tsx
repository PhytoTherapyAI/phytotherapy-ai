"use client";

import { useState } from "react";
import {
  Brain,
  Wind,
  Loader2,
  AlertTriangle,
  Phone,
  Shield,
  Heart,
  ChevronDown,
  ChevronUp,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface AnxietyResult {
  anxietyLevel: number;
  panicProtocol: boolean;
  gad7Score: number | null;
  gad7Severity: string | null;
  techniques: Array<{ name: string; steps: string[] }>;
  cognitiveDistortions: Array<{ distortion: string; description: string; reframe: string }>;
  recommendations: string[];
  alertLevel: "green" | "yellow" | "red";
  professionalReferral: boolean;
  crisisLine: string;
  breathingExercise?: { name: string; pattern: string; duration: string };
  medicationNotes?: string;
}

const GAD7_QUESTIONS_EN = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const GAD7_QUESTIONS_TR = [
  "Gergin, endiseli veya sinirli hissetme",
  "Endiselenmeyi durduramama veya kontrol edememe",
  "Farkli konularda cok fazla endiselenme",
  "Rahatlamakta zorluk cekme",
  "Yerinizde duramayacak kadar huzursuz olma",
  "Kolay sinirlenme veya kizma",
  "Kotu bir sey olacakmis gibi korkma",
];

const GAD7_OPTIONS_EN = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
const GAD7_OPTIONS_TR = ["Hic", "Birkac gun", "Gunlerin yarisından fazlasi", "Neredeyse her gun"];

const SYMPTOMS_EN = [
  "Racing heart", "Sweating", "Trembling", "Shortness of breath",
  "Chest tightness", "Nausea", "Dizziness", "Muscle tension",
  "Difficulty concentrating", "Sleep problems", "Fatigue", "Irritability",
];
const SYMPTOMS_TR = [
  "Hizli kalp atisi", "Terleme", "Titreme", "Nefes darlığı",
  "Göğüs sıkışması", "Bulantı", "Bas dönmesi", "Kas gerginliği",
  "Odaklanma güçlüğü", "Uyku sorunları", "Yorgunluk", "Sinirlilik",
];

export default function AnxietyToolkitPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [panicAttack, setPanicAttack] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [gad7Answers, setGad7Answers] = useState<number[]>(Array(7).fill(-1));
  const [showGAD7, setShowGAD7] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnxietyResult | null>(null);

  const symptoms = lang === "tr" ? SYMPTOMS_TR : SYMPTOMS_EN;
  const gad7Questions = lang === "tr" ? GAD7_QUESTIONS_TR : GAD7_QUESTIONS_EN;
  const gad7Options = lang === "tr" ? GAD7_OPTIONS_TR : GAD7_OPTIONS_EN;

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const gad7Valid = gad7Answers.every((a) => a >= 0);
      const res = await fetch("/api/anxiety-toolkit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          anxiety_level: anxietyLevel,
          panic_attack: panicAttack,
          symptoms: selectedSymptoms,
          gad7_answers: gad7Valid ? gad7Answers : [],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <Wind className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("anxiety.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("anxiety.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-8 text-center dark:border-blue-800 dark:bg-blue-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
            {tx("common.loginToUse2", lang)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
          <Wind className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("anxiety.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("anxiety.subtitle", lang)}</p>
        </div>
      </div>

      {/* Crisis Alert */}
      {result?.alertLevel === "red" && (
        <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 p-6 dark:bg-red-950/40">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-300">
                {tx("anxiety.highLevel", lang)}
              </p>
              <p className="mt-2 text-lg font-bold text-red-600">{result.crisisLine}</p>
            </div>
          </div>
        </div>
      )}

      {/* Professional Referral */}
      {result?.alertLevel === "yellow" && result.professionalReferral && (
        <div className="mb-6 rounded-xl border-2 border-amber-400 bg-amber-50 p-5 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              {tx("anxiety.moderateLevel", lang)}
            </p>
          </div>
        </div>
      )}

      {/* Panic Attack Toggle */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-semibold">{tx("anxiety.panicAttack", lang)}</span>
          </div>
          <button
            onClick={() => { setPanicAttack(!panicAttack); setResult(null); }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              panicAttack ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              panicAttack ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>
        {panicAttack && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {tx("anxiety.panicModeNote", lang)}
          </p>
        )}
      </div>

      {/* Panic Attack Immediate Grounding */}
      {panicAttack && result?.panicProtocol && (
        <div className="mb-6 space-y-4">
          {result.techniques.map((tech, idx) => (
            <div key={idx} className="rounded-xl border-2 border-blue-400 bg-blue-50 p-6 dark:bg-blue-950/30">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">{tech.name}</h3>
              <ol className="space-y-2">
                {tech.steps.map((step, si) => (
                  <li key={si} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-sm font-bold text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                      {si + 1}
                    </span>
                    <span className="text-blue-800 dark:text-blue-200">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          {result.recommendations.map((rec, i) => (
            <p key={i} className="text-sm text-muted-foreground">{rec}</p>
          ))}
        </div>
      )}

      {!panicAttack && (
        <>
          {/* Anxiety Level Slider */}
          <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
              {tx("anxiety.level", lang)}: {anxietyLevel}/10
            </h2>
            <input
              type="range"
              min={1}
              max={10}
              value={anxietyLevel}
              onChange={(e) => setAnxietyLevel(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{tx("anxiety.minimal", lang)}</span>
              <span>{tx("anxiety.severe", lang)}</span>
            </div>
          </div>

          {/* Symptom Checklist */}
          <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
              {tx("common.symptoms", lang)}
            </h2>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    selectedSymptoms.includes(s)
                      ? "bg-blue-500 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* GAD-7 */}
          <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
            <button
              onClick={() => setShowGAD7(!showGAD7)}
              className="flex w-full items-center justify-between"
            >
              <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {tx("anxiety.gad7", lang)} {tx("anxiety.gad7Optional", lang)}
              </h2>
              {showGAD7 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {showGAD7 && (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {tx("anxiety.gad7Intro", lang)}
                </p>
                {gad7Questions.map((q, qi) => (
                  <div key={qi} className="rounded-lg border p-3">
                    <p className="mb-2 text-sm font-medium">{qi + 1}. {q}</p>
                    <div className="flex flex-wrap gap-2">
                      {gad7Options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => {
                            const newAnswers = [...gad7Answers];
                            newAnswers[qi] = oi;
                            setGad7Answers(newAnswers);
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                            gad7Answers[qi] === oi
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                          }`}
                        >
                          {opt} ({oi})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="mb-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("common.analyzing", lang)}</>
            ) : (
              <><Brain className="mr-2 h-5 w-5" />{tx("anxiety.analyze", lang)}</>
            )}
          </Button>
        </>
      )}

      {panicAttack && !result && (
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="mb-6 w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("anxiety.loading", lang)}</>
          ) : (
            <><Shield className="mr-2 h-5 w-5" />{tx("anxiety.grounding", lang)}</>
          )}
        </Button>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results (non-panic) */}
      {result && !result.panicProtocol && (
        <div className="space-y-4">
          {/* GAD-7 Score */}
          {result.gad7Score !== null && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold text-blue-700 dark:text-blue-300">
                {tx("anxiety.gad7", lang)}: {result.gad7Score}/21
              </h3>
              <div className="mb-3 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-3 rounded-full transition-all ${
                    result.gad7Score <= 4 ? "bg-green-500" :
                    result.gad7Score <= 9 ? "bg-yellow-500" :
                    result.gad7Score <= 14 ? "bg-orange-500" : "bg-red-500"
                  }`}
                  style={{ width: `${(result.gad7Score / 21) * 100}%` }}
                />
              </div>
              <p className="text-sm capitalize text-muted-foreground">
                {tx("anxiety.severity", lang)}: {result.gad7Severity}
              </p>
            </div>
          )}

          {/* Techniques */}
          {result.techniques?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
                {tx("anxiety.copingTechniques", lang)}
              </h3>
              {result.techniques.map((tech, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <h4 className="mb-2 font-semibold">{tech.name}</h4>
                  <ol className="space-y-1 pl-4">
                    {tech.steps.map((step, si) => (
                      <li key={si} className="text-sm text-muted-foreground">
                        {si + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {/* Cognitive Distortions */}
          {result.cognitiveDistortions?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
                {tx("anxiety.cognitiveDistortions", lang)}
              </h3>
              {result.cognitiveDistortions.map((cd, idx) => (
                <div key={idx} className="mb-4 rounded-lg border p-4 last:mb-0">
                  <h4 className="font-semibold text-orange-600 dark:text-orange-400">{cd.distortion}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{cd.description}</p>
                  <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
                    <Heart className="mr-1 inline h-4 w-4" />
                    {cd.reframe}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Breathing Exercise */}
          {result.breathingExercise && (
            <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-6 dark:bg-blue-950/30">
              <h3 className="mb-2 text-lg font-bold text-blue-700 dark:text-blue-300">
                {result.breathingExercise.name}
              </h3>
              <p className="text-blue-600 dark:text-blue-400">{result.breathingExercise.pattern}</p>
              <p className="mt-1 text-sm text-muted-foreground">{result.breathingExercise.duration}</p>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
                {tx("common.recommendations", lang)}
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medication Notes */}
          {result.medicationNotes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-sm text-amber-700 dark:text-amber-300">{result.medicationNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
