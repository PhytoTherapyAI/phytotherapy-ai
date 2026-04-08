// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Wind,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  LogIn,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface LungAnalysis {
  lungHealthAssessment: string;
  actScore: { total: number; interpretation: string; controlLevel: string } | null;
  catScore: { total: number; interpretation: string; impactLevel: string } | null;
  peakFlowAssessment: string;
  medicationAlerts: Array<{ medication: string; concern: string; riskLevel: string; recommendation: string }>;
  triggerAnalysis: Array<{ trigger: string; avoidanceStrategy: string }>;
  inhalerTips: string[];
  breathingExercises: Array<{ name: string; description: string; benefit: string }>;
  supplements: Array<{ name: string; dosage: string; benefit: string; safety: string; interactionNote: string }>;
  alertLevel: string;
  whenToSeeDoctor: string[];
  sources: Array<{ title: string; url: string }>;
}

const SYMPTOM_OPTIONS = [
  { value: "wheezing", en: "Wheezing", tr: "Hırıltılı Solunum" },
  { value: "shortness_of_breath", en: "Shortness of Breath", tr: "Nefes Darligi" },
  { value: "cough", en: "Chronic Cough", tr: "Kronik Oksuruk" },
  { value: "phlegm", en: "Phlegm/Mucus", tr: "Balgam" },
  { value: "chest_tightness", en: "Chest Tightness", tr: "Göğüs Sikismasi" },
  { value: "night_cough", en: "Night Cough", tr: "Gece Oksurugu" },
];

const TRIGGER_OPTIONS = [
  { value: "dust", en: "Dust", tr: "Toz" },
  { value: "pollen", en: "Pollen", tr: "Polen" },
  { value: "cold_air", en: "Cold Air", tr: "Soguk Hava" },
  { value: "exercise", en: "Exercise", tr: "Egzersiz" },
  { value: "smoke", en: "Smoke", tr: "Sigara/Duman" },
  { value: "pets", en: "Pets", tr: "Evcil Hayvanlar" },
  { value: "mold", en: "Mold", tr: "Kuf" },
  { value: "perfume", en: "Perfume/Chemicals", tr: "Parfum/Kimyasal" },
  { value: "stress", en: "Stress", tr: "Stres" },
];

const ACT_QUESTIONS = [
  { en: "How much did asthma keep you from getting done at work/school/home?", tr: "Astim is/okul/evde ne kadar engel oldu?" },
  { en: "How often have you had shortness of breath?", tr: "Ne siklikla nefes darlığı yasadiniz?" },
  { en: "How often did asthma symptoms wake you up at night?", tr: "Astim belirtileri sizi gece ne siklikla uyandirdi?" },
  { en: "How often have you used your rescue inhaler?", tr: "Kurtarici inhalerinizi ne siklikla kullandiniz?" },
  { en: "How would you rate your asthma control?", tr: "Astim kontrolünuzu nasil derecelendirirsiniz?" },
];

export default function LungMonitorPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [conditionType, setConditionType] = useState("general");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [peakFlow, setPeakFlow] = useState("");
  const [actScores, setActScores] = useState<number[]>([3, 3, 3, 3, 3]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LungAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const toggleSymptom = (v: string) => setSymptoms((p) => p.includes(v) ? p.filter((s) => s !== v) : [...p, v]);
  const toggleTrigger = (v: string) => setTriggers((p) => p.includes(v) ? p.filter((s) => s !== v) : [...p, v]);

  const handleAnalyze = async () => {
    if (!session?.access_token || symptoms.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lung-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          symptoms, triggers, peak_flow: Number(peakFlow) || 0,
          condition_type: conditionType,
          act_scores: conditionType === "asthma" ? actScores : [],
          cat_scores: [], lang,
        }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally { setIsLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("lung.title", lang)}</h1>
          <p className="text-muted-foreground">{tx("common.loginToUse", lang)}</p>
          <Button onClick={() => window.location.href = "/auth/login"}><LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Wind className="w-4 h-4" />
            {tx("lung.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("lung.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("lung.subtitle", lang)}</p>
        </div>

        {/* Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-6">
          {/* Condition Type */}
          <div>
            <label className="block text-sm font-medium mb-2">{tx("lung.condition", lang)}</label>
            <div className="flex gap-2">
              {[{ v: "general", en: "General", tr: "Genel" }, { v: "asthma", en: "Asthma", tr: "Astim" }, { v: "copd", en: "COPD", tr: "KOAH" }].map((opt) => (
                <button key={opt.v} onClick={() => setConditionType(opt.v)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    conditionType === opt.v ? "bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400" : "bg-muted/50 border-transparent hover:bg-muted"
                  }`}>{opt[lang]}</button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium mb-2">{tx("common.symptoms", lang)}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => toggleSymptom(opt.value)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                    symptoms.includes(opt.value) ? "bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400" : "bg-muted/50 border-transparent hover:bg-muted"
                  }`}>{opt[lang]}</button>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-sm font-medium mb-2">{tx("lung.triggers", lang)}</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TRIGGER_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => toggleTrigger(opt.value)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all border ${
                    triggers.includes(opt.value) ? "bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400" : "bg-muted/50 border-transparent hover:bg-muted"
                  }`}>{opt[lang]}</button>
              ))}
            </div>
          </div>

          {/* Peak Flow */}
          <div>
            <label className="block text-sm font-medium mb-1">{tx("lung.peakFlow", lang)} (L/min)</label>
            <input type="number" value={peakFlow} onChange={(e) => setPeakFlow(e.target.value)} placeholder="e.g. 450" className="w-full max-w-xs px-3 py-2 border rounded-lg bg-background" />
          </div>

          {/* ACT Score for Asthma */}
          {conditionType === "asthma" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">{tx("lung.actScore", lang)}</label>
              <p className="text-xs text-muted-foreground">{tx("lung.actScoreHelp", lang)}</p>
              {ACT_QUESTIONS.map((q, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-3">
                  <p className="text-sm mb-2">{q[lang]}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button key={score} onClick={() => {
                        const updated = [...actScores];
                        updated[i] = score;
                        setActScores(updated);
                      }} className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                        actScores[i] === score ? "bg-sky-500 text-white" : "bg-background border hover:bg-muted"
                      }`}>{score}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleAnalyze} disabled={symptoms.length === 0 || isLoading} className="w-full bg-sky-600 hover:bg-sky-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wind className="w-4 h-4 mr-2" />}
            {tx("lung.analyze", lang)}
          </Button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">{error}</div>}

        {analysis && (
          <>
            {/* Assessment */}
            <div className="bg-card border rounded-2xl p-6 space-y-3">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                analysis.alertLevel === "green" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                analysis.alertLevel === "yellow" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {analysis.alertLevel === "green" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {analysis.alertLevel === "green" ? tx("common.good", lang) :
                 analysis.alertLevel === "yellow" ? tx("common.caution", lang) :
                 tx("common.atRisk", lang)}
              </div>
              <p className="text-sm">{analysis.lungHealthAssessment}</p>
            </div>

            {/* ACT Score */}
            {analysis.actScore && (
              <div className="bg-card border rounded-2xl p-6 text-center space-y-3">
                <h2 className="text-lg font-semibold">{tx("lung.actScore", lang)}</h2>
                <div className={`text-5xl font-bold ${
                  analysis.actScore.total >= 20 ? "text-green-600" : analysis.actScore.total >= 15 ? "text-amber-600" : "text-red-600"
                }`}>{analysis.actScore.total}/25</div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.actScore.controlLevel === "well_controlled" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  analysis.actScore.controlLevel === "not_well_controlled" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>{analysis.actScore.interpretation}</div>
              </div>
            )}

            {/* CAT Score */}
            {analysis.catScore && (
              <div className="bg-card border rounded-2xl p-6 text-center space-y-3">
                <h2 className="text-lg font-semibold">{tx("lung.catScore", lang)}</h2>
                <div className={`text-5xl font-bold ${
                  analysis.catScore.total < 10 ? "text-green-600" : analysis.catScore.total < 20 ? "text-amber-600" : "text-red-600"
                }`}>{analysis.catScore.total}/40</div>
                <p className="text-sm text-muted-foreground">{analysis.catScore.interpretation}</p>
              </div>
            )}

            {/* Peak Flow */}
            {analysis.peakFlowAssessment && (
              <div className="bg-card border rounded-2xl p-6 space-y-2">
                <h2 className="text-lg font-semibold">{tx("lung.peakFlow", lang)}</h2>
                <p className="text-sm text-muted-foreground">{analysis.peakFlowAssessment}</p>
              </div>
            )}

            {/* Medication Alerts */}
            {analysis.medicationAlerts?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {tx("lung.medicationAlerts", lang)}
                </h2>
                <div className="grid gap-3">
                  {analysis.medicationAlerts.map((alert, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      alert.riskLevel === "high" ? "border-red-200 dark:border-red-800" : "border-amber-200 dark:border-amber-800"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{alert.medication}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.riskLevel === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>{alert.riskLevel}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.concern}</p>
                      <p className="text-sm mt-1">{alert.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Triggers */}
            {analysis.triggerAnalysis?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{tx("lung.triggers", lang)}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {analysis.triggerAnalysis.map((t, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-3">
                      <div className="font-medium text-sm">{t.trigger}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.avoidanceStrategy}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inhaler Tips */}
            {analysis.inhalerTips?.length > 0 && (
              <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold">{tx("lung.inhaler", lang)}</h2>
                {analysis.inhalerTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-bold text-sky-600">{i + 1}.</span> {tip}
                  </div>
                ))}
              </div>
            )}

            {/* Breathing Exercises */}
            {analysis.breathingExercises?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{tx("lung.breathingExercises", lang)}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {analysis.breathingExercises.map((ex, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-4 space-y-1">
                      <div className="font-medium">{ex.name}</div>
                      <p className="text-sm text-muted-foreground">{ex.description}</p>
                      <p className="text-xs text-sky-600 dark:text-sky-400">{ex.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplements */}
            {analysis.supplements?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{tx("common.supplements", lang)}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {analysis.supplements.map((sup, i) => (
                    <div key={i} className="border rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sup.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          sup.safety === "safe" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          sup.safety === "caution" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>{sup.safety === "safe" ? "✅" : sup.safety === "caution" ? "⚠️" : "❌"} {sup.safety}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{sup.dosage}</p>
                      <p className="text-sm">{sup.benefit}</p>
                      {sup.interactionNote && <p className="text-xs text-amber-600 dark:text-amber-400">{sup.interactionNote}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.whenToSeeDoctor?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> {tx("common.seeDoctor", lang)}
                </h2>
                {analysis.whenToSeeDoctor.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
            )}

            {analysis.sources?.length > 0 && (
              <div className="bg-card border rounded-2xl p-4">
                <button onClick={() => setShowSources(!showSources)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  {tx("common.sources", lang)} ({analysis.sources.length}) {showSources ? "▴" : "▾"}
                </button>
                {showSources && <div className="mt-3 space-y-1">{analysis.sources.map((src, i) => (
                  <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 hover:underline truncate">{src.title}</a>
                ))}</div>}
              </div>
            )}
          </>
        )}

        <div className="text-center text-xs text-muted-foreground px-4">{tx("disclaimer.tool", lang)}</div>
      </div>
    </div>
  );
}
