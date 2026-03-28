"use client";

import { useState } from "react";
import {
  Flame,
  Loader2,
  Shield,
  LogIn,
  Bone,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface MenopauseResult {
  mrsScore: number;
  hasHRT: boolean;
  age: number;
  symptomAnalysis: Array<{ symptom: string; severity: string; management: string }>;
  mrsInterpretation: string;
  supplementPlan: Array<{ name: string; dose: string; evidence: string; duration: string; caution: string }>;
  boneHealthPlan: { calciumNeeded: string; vitaminD: string; exercise: string[]; dexaRecommendation: string };
  hrtNotes: string;
  lifestyleRecommendations: string[];
  medicationNotes?: string;
  alertLevel: "green" | "yellow";
}

const SYMPTOM_LIST = [
  { key: "hot_flashes", en: "Hot flashes", tr: "Sicak basmalari" },
  { key: "night_sweats", en: "Night sweats", tr: "Gece terlemeleri" },
  { key: "mood_changes", en: "Mood changes", tr: "Ruh hali değişiklikleri" },
  { key: "insomnia", en: "Insomnia", tr: "Uykusuzluk" },
  { key: "vaginal_dryness", en: "Vaginal dryness", tr: "Vajinal kuruluk" },
  { key: "joint_pain", en: "Joint pain", tr: "Eklem ağrısi" },
  { key: "fatigue", en: "Fatigue", tr: "Yorgunluk" },
  { key: "brain_fog", en: "Brain fog", tr: "Zihin bulanıkligi" },
];

export default function MenopausePanelPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [symptoms, setSymptoms] = useState<Record<string, { frequency: number; severity: number }>>({});
  const [age, setAge] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MenopauseResult | null>(null);

  const updateSymptom = (key: string, field: "frequency" | "severity", value: number) => {
    setSymptoms((prev) => ({
      ...prev,
      [key]: { ...prev[key], frequency: prev[key]?.frequency || 0, severity: prev[key]?.severity || 0, [field]: value },
    }));
  };

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/menopause-panel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang, symptoms, age }),
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
          <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
            <Flame className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">{tx("menopause.title", lang)}</h1>
            <p className="text-sm text-muted-foreground">{tx("menopause.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-8 text-center dark:border-purple-800 dark:bg-purple-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-purple-400" />
          <p className="text-lg font-medium text-purple-700 dark:text-purple-300">
            {tx("common.loginToUse2", lang)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
          <Flame className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">{tx("menopause.title", lang)}</h1>
          <p className="text-sm text-muted-foreground">{tx("menopause.subtitle", lang)}</p>
        </div>
      </div>

      {/* Age */}
      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
        <label className="mb-1 block text-sm font-semibold text-muted-foreground">{tx("common.age", lang)}</label>
        <input
          type="number"
          min={35}
          max={80}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="w-24 rounded-lg border bg-background px-3 py-2 text-center text-lg font-bold"
        />
      </div>

      {/* Symptoms */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-purple-700 dark:text-purple-300">{tx("menopause.symptoms", lang)}</h2>
        <div className="space-y-4">
          {SYMPTOM_LIST.map((symptom) => (
            <div key={symptom.key} className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">{lang === "tr" ? symptom.tr : symptom.en}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">{lang === "tr" ? "Siklik (0-10)" : "Frequency (0-10)"}</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={symptoms[symptom.key]?.frequency || 0}
                    onChange={(e) => updateSymptom(symptom.key, "frequency", Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <span className="text-xs font-bold">{symptoms[symptom.key]?.frequency || 0}</span>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{lang === "tr" ? "Siddet (0-3)" : "Severity (0-3)"}</label>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    value={symptoms[symptom.key]?.severity || 0}
                    onChange={(e) => updateSymptom(symptom.key, "severity", Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <span className="text-xs font-bold">{symptoms[symptom.key]?.severity || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleAnalyze} disabled={isLoading} className="mb-6 w-full bg-purple-600 hover:bg-purple-700 text-white" size="lg">
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("common.analyzing", lang)}</>
        ) : (
          <><Leaf className="mr-2 h-5 w-5" />{tx("menopause.analyze", lang)}</>
        )}
      </Button>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* MRS Score */}
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
            <p className="text-sm text-muted-foreground">{tx("menopause.mrsScore", lang)}</p>
            <p className="text-4xl font-bold text-purple-600">{result.mrsScore}</p>
            <p className="mt-2 text-sm text-muted-foreground">{result.mrsInterpretation}</p>
            {result.hasHRT && (
              <span className="mt-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                {lang === "tr" ? "HRT Kullaniliyor" : "On HRT"}
              </span>
            )}
          </div>

          {/* Symptom Analysis */}
          {result.symptomAnalysis?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-purple-700 dark:text-purple-300">
                {lang === "tr" ? "Semptom Analizi" : "Symptom Analysis"}
              </h3>
              {result.symptomAnalysis.map((sa, i) => (
                <div key={i} className="mb-3 rounded-lg border p-3 last:mb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{sa.symptom}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      sa.severity === "mild" ? "bg-green-100 text-green-700" :
                      sa.severity === "moderate" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>{sa.severity}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{sa.management}</p>
                </div>
              ))}
            </div>
          )}

          {/* Supplement Plan */}
          {result.supplementPlan?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-purple-700 dark:text-purple-300">
                {lang === "tr" ? "Takviye Plani" : "Supplement Plan"}
              </h3>
              {result.supplementPlan.map((supp, i) => (
                <div key={i} className="mb-3 rounded-lg border p-3 last:mb-0">
                  <p className="font-semibold">{supp.name} — {supp.dose}</p>
                  <p className="text-xs text-muted-foreground">{supp.evidence}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">{lang === "tr" ? "Sure" : "Duration"}: {supp.duration}</p>
                  {supp.caution && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{supp.caution}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Bone Health */}
          {result.boneHealthPlan && (
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6 dark:bg-purple-950/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-purple-700 dark:text-purple-300">
                <Bone className="h-5 w-5" />
                {tx("menopause.boneHealth", lang)}
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>{lang === "tr" ? "Kalsiyum" : "Calcium"}:</strong> {result.boneHealthPlan.calciumNeeded}</p>
                <p><strong>{lang === "tr" ? "D Vitamini" : "Vitamin D"}:</strong> {result.boneHealthPlan.vitaminD}</p>
                <p><strong>DEXA:</strong> {result.boneHealthPlan.dexaRecommendation}</p>
                {result.boneHealthPlan.exercise?.length > 0 && (
                  <div>
                    <strong>{lang === "tr" ? "Egzersiz" : "Exercise"}:</strong>
                    <ul className="mt-1 space-y-1 pl-4">
                      {result.boneHealthPlan.exercise.map((ex, i) => (
                        <li key={i} className="text-purple-800 dark:text-purple-200">{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HRT Notes */}
          {result.hrtNotes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/30">
              <p className="text-sm text-amber-700 dark:text-amber-300">{result.hrtNotes}</p>
            </div>
          )}

          {/* Lifestyle */}
          {result.lifestyleRecommendations?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-purple-700 dark:text-purple-300">
                {lang === "tr" ? "Yasam Tarzi Önerileri" : "Lifestyle Recommendations"}
              </h3>
              <ul className="space-y-2">
                {result.lifestyleRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                    {rec}
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
