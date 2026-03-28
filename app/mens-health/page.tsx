"use client";

import { useState } from "react";
import {
  Shield,
  Loader2,
  LogIn,
  AlertTriangle,
  Activity,
  Pill,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface MensHealthResult {
  adamScore: number | null;
  adamPositive: boolean;
  age: number;
  hasSexualEffectMed: boolean;
  testosteroneSymptomAssessment: string;
  medicationEffects: Array<{ medication: string; effect: string; prevalence: string; action: string }>;
  supplementSuggestions: Array<{ name: string; dose: string; evidence: string; safetyNote: string }>;
  prostateHealth: { screeningRecommendation: string; tips: string[] };
  lifestyleRecommendations: string[];
  labTestsRecommended: string[];
  alertLevel: "green" | "yellow";
}

const ADAM_EN = [
  "Decrease in libido (sex drive)?",
  "Lack of energy?",
  "Decrease in strength and/or endurance?",
  "Lost height?",
  "Decreased enjoyment of life?",
  "Sad and/or grumpy?",
  "Erections less strong?",
  "Deterioration in sports ability?",
  "Falling asleep after dinner?",
  "Deterioration in work performance?",
];
const ADAM_TR = [
  "Cinsel istekte azalma?",
  "Enerji eksikligi?",
  "Guc ve/veya dayaniklilikta azalma?",
  "Boy kisalmasi?",
  "Yasam zevkinde azalma?",
  "Uzgun ve/veya huysuz?",
  "Ereksiyon gucunde azalma?",
  "Spor performansinda dusus?",
  "Aksam yemeginden sonra uyuya kalma?",
  "Is performansinda dusus?",
];

const SYMPTOMS_EN = ["Fatigue", "Low libido", "Mood changes", "Muscle loss", "Weight gain", "Sleep problems", "Hair loss", "Concentration issues"];
const SYMPTOMS_TR = ["Yorgunluk", "Dusuk cinsel istek", "Ruh hali degisikligi", "Kas kaybi", "Kilo artisi", "Uyku sorunlari", "Sac dokulmesi", "Odaklanma sorunu"];

export default function MensHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [adamAnswers, setAdamAnswers] = useState<boolean[]>(Array(10).fill(false));
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState(40);
  const [showADAM, setShowADAM] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MensHealthResult | null>(null);

  const adamQuestions = lang === "tr" ? ADAM_TR : ADAM_EN;
  const symptoms = lang === "tr" ? SYMPTOMS_TR : SYMPTOMS_EN;

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mens-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          adam_answers: adamAnswers,
          symptoms: selectedSymptoms,
          age,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Assessment failed");
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
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">{tx("mens.title", lang)}</h1>
            <p className="text-sm text-muted-foreground">{tx("mens.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-8 text-center dark:border-blue-800 dark:bg-blue-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-blue-400" />
          <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
            {lang === "tr" ? "Bu araci kullanmak icin giris yapin." : "Please sign in to use this tool."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
          <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">{tx("mens.title", lang)}</h1>
          <p className="text-sm text-muted-foreground">{tx("mens.subtitle", lang)}</p>
        </div>
      </div>

      {/* Age */}
      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
        <label className="mb-1 block text-sm font-semibold text-muted-foreground">{lang === "tr" ? "Yas" : "Age"}</label>
        <input type="number" min={18} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-24 rounded-lg border bg-background px-3 py-2 text-center text-lg font-bold" />
      </div>

      {/* Symptoms */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{lang === "tr" ? "Semptomlar" : "Symptoms"}</h2>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${selectedSymptoms.includes(s) ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* ADAM Questionnaire */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <button onClick={() => setShowADAM(!showADAM)} className="flex w-full items-center justify-between">
          <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300">{tx("mens.adam", lang)}</h2>
          {showADAM ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        {showADAM && (
          <div className="mt-4 space-y-3">
            {adamQuestions.map((q, qi) => (
              <div key={qi} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{qi + 1}. {q}</span>
                <button
                  onClick={() => {
                    const newAnswers = [...adamAnswers];
                    newAnswers[qi] = !newAnswers[qi];
                    setAdamAnswers(newAnswers);
                  }}
                  className={`rounded-full px-4 py-1 text-sm font-semibold transition-colors ${adamAnswers[qi] ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {adamAnswers[qi] ? (lang === "tr" ? "Evet" : "Yes") : (lang === "tr" ? "Hayir" : "No")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleAnalyze} disabled={isLoading} className="mb-6 w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{lang === "tr" ? "Analiz ediliyor..." : "Analyzing..."}</>
        ) : (
          <><Shield className="mr-2 h-5 w-5" />{tx("mens.analyze", lang)}</>
        )}
      </Button>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* ADAM Score */}
          {result.adamScore !== null && (
            <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
              <p className="text-sm text-muted-foreground">{tx("mens.adam", lang)}</p>
              <p className="text-4xl font-bold">{result.adamScore}<span className="text-lg text-muted-foreground">/10</span></p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${result.adamPositive ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"}`}>
                {result.adamPositive ? (lang === "tr" ? "Pozitif — Degerlendirme Onerilir" : "Positive — Evaluation Recommended") : (lang === "tr" ? "Negatif" : "Negative")}
              </span>
            </div>
          )}

          {/* Assessment */}
          {result.testosteroneSymptomAssessment && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold text-blue-700 dark:text-blue-300">
                {lang === "tr" ? "Degerlendirme" : "Assessment"}
              </h3>
              <p className="text-sm text-muted-foreground">{result.testosteroneSymptomAssessment}</p>
            </div>
          )}

          {/* Medication Effects */}
          {result.medicationEffects?.length > 0 && (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6 dark:bg-amber-950/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-300">
                <Pill className="h-5 w-5" />
                {tx("mens.medEffects", lang)}
              </h3>
              {result.medicationEffects.map((me, i) => (
                <div key={i} className="mb-3 rounded-lg border border-amber-300 p-3 last:mb-0 dark:border-amber-700">
                  <p className="font-semibold">{me.medication}</p>
                  <p className="text-sm text-muted-foreground">{me.effect}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">{lang === "tr" ? "Gorulen oran" : "Prevalence"}: {me.prevalence}</p>
                  <p className="text-xs font-medium">{me.action}</p>
                </div>
              ))}
            </div>
          )}

          {/* Prostate Health */}
          {result.prostateHealth && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">{tx("mens.prostate", lang)}</h3>
              <p className="text-sm text-muted-foreground">{result.prostateHealth.screeningRecommendation}</p>
              {result.prostateHealth.tips?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.prostateHealth.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground">- {tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Supplements */}
          {result.supplementSuggestions?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
                {lang === "tr" ? "Takviye Onerileri" : "Supplement Suggestions"}
              </h3>
              {result.supplementSuggestions.map((supp, i) => (
                <div key={i} className="mb-3 rounded-lg border p-3 last:mb-0">
                  <p className="font-semibold">{supp.name} — {supp.dose}</p>
                  <p className="text-xs text-muted-foreground">{supp.evidence}</p>
                  <p className="mt-1 text-xs text-amber-600">{supp.safetyNote}</p>
                </div>
              ))}
            </div>
          )}

          {/* Lab Tests */}
          {result.labTestsRecommended?.length > 0 && (
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 dark:bg-blue-950/20">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
                {lang === "tr" ? "Onerilen Testler" : "Recommended Lab Tests"}
              </h3>
              <ul className="space-y-1">
                {result.labTestsRecommended.map((test, i) => (
                  <li key={i} className="text-sm text-blue-800 dark:text-blue-200">
                    <AlertTriangle className="mr-1 inline h-3 w-3" /> {test}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lifestyle */}
          {result.lifestyleRecommendations?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-blue-700 dark:text-blue-300">
                {lang === "tr" ? "Yasam Tarzi Onerileri" : "Lifestyle Recommendations"}
              </h3>
              <ul className="space-y-2">
                {result.lifestyleRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" /> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
