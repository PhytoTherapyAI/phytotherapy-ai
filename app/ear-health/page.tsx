"use client";

import { useState } from "react";
import {
  Ear,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  LogIn,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface EarAnalysis {
  hearingRiskScore: number;
  symptomAnalysis: string;
  ototoxicMeds: Array<{
    medication: string;
    ototoxicRisk: string;
    riskLevel: string;
    monitoringNeeded: string;
  }>;
  noiseExposureRisk: string;
  recommendations: Array<{
    category: string;
    advice: string;
    priority: string;
  }>;
  supplements: Array<{
    name: string;
    dosage: string;
    benefit: string;
    safety: string;
    interactionNote: string;
  }>;
  hearingTestSchedule: string;
  alertLevel: string;
  whenToSeeDoctor: string[];
  sources: Array<{ title: string; url: string }>;
}

const SYMPTOM_OPTIONS = [
  { value: "tinnitus", en: "Tinnitus (Ringing)", tr: "Tinitus (Cilinlama)" },
  { value: "hearing_loss", en: "Hearing Loss", tr: "Isitme Kaybi" },
  { value: "vertigo", en: "Vertigo / Dizziness", tr: "Vertigo / Bas Donmesi" },
  { value: "ear_pain", en: "Ear Pain", tr: "Kulak Agrisi" },
  { value: "ear_fullness", en: "Ear Fullness", tr: "Kulak Dolgunlugu" },
  { value: "discharge", en: "Ear Discharge", tr: "Kulak Akintisi" },
  { value: "itching", en: "Ear Itching", tr: "Kulak Kasintisi" },
];

export default function EarHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [noiseHours, setNoiseHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<EarAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const toggleSymptom = (value: string) => {
    setSymptoms((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0 || !session?.access_token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ear-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          symptoms,
          noise_exposure_hours: Number(noiseHours) || 0,
          lang,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze");
      }
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("ear.title", lang)}</h1>
          <p className="text-muted-foreground">{lang === "tr" ? "Bu araci kullanmak icin giris yapin" : "Please log in to use this tool"}</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            <LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Ear className="w-4 h-4" />
            {tx("ear.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("ear.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("ear.subtitle", lang)}</p>
        </div>

        {/* Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">{tx("ear.symptoms", lang)}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SYMPTOM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleSymptom(opt.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                  symptoms.includes(opt.value)
                    ? "bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-400"
                    : "bg-muted/50 border-transparent hover:bg-muted"
                }`}
              >
                {opt[lang]}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              {tx("ear.noiseExposure", lang)} ({lang === "tr" ? "saat/gun" : "hours/day"})
            </label>
            <input
              type="number"
              value={noiseHours}
              onChange={(e) => setNoiseHours(e.target.value)}
              placeholder="0-24"
              className="w-full max-w-xs px-3 py-2 border rounded-lg bg-background"
              min={0} max={24}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={symptoms.length === 0 || isLoading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ear className="w-4 h-4 mr-2" />}
            {tx("ear.analyze", lang)}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {analysis && (
          <>
            {/* Score */}
            <div className="bg-card border rounded-2xl p-6 text-center space-y-3">
              <div className={`text-5xl font-bold ${
                analysis.hearingRiskScore >= 70 ? "text-green-600" :
                analysis.hearingRiskScore >= 40 ? "text-amber-600" : "text-red-600"
              }`}>
                {analysis.hearingRiskScore}/100
              </div>
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                analysis.alertLevel === "green" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                analysis.alertLevel === "yellow" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {analysis.alertLevel === "green" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {analysis.alertLevel === "green" ? (lang === "tr" ? "Iyi" : "Good") :
                 analysis.alertLevel === "yellow" ? (lang === "tr" ? "Dikkat" : "Caution") :
                 (lang === "tr" ? "Risk" : "At Risk")}
              </div>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">{analysis.symptomAnalysis}</p>
            </div>

            {/* Ototoxic Meds */}
            {analysis.ototoxicMeds?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {tx("ear.ototoxic", lang)}
                </h2>
                <div className="grid gap-3">
                  {analysis.ototoxicMeds.map((med, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      med.riskLevel === "high" ? "border-red-200 dark:border-red-800" :
                      med.riskLevel === "moderate" ? "border-amber-200 dark:border-amber-800" : "border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{med.medication}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          med.riskLevel === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          med.riskLevel === "moderate" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>{med.riskLevel}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{med.ototoxicRisk}</p>
                      <p className="text-sm mt-1 text-violet-700 dark:text-violet-400">{med.monitoringNeeded}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Noise Exposure */}
            {analysis.noiseExposureRisk && (
              <div className="bg-card border rounded-2xl p-6 space-y-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-violet-500" />
                  {tx("ear.noiseExposure", lang)}
                </h2>
                <p className="text-sm text-muted-foreground">{analysis.noiseExposureRisk}</p>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{lang === "tr" ? "Öneriler" : "Recommendations"}</h2>
                <div className="grid gap-3">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{rec.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          rec.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          rec.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>{rec.priority}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplements */}
            {analysis.supplements?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{lang === "tr" ? "Takviyeler" : "Supplements"}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {analysis.supplements.map((sup, i) => (
                    <div key={i} className="border rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sup.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          sup.safety === "safe" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          sup.safety === "caution" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {sup.safety === "safe" ? "✅" : sup.safety === "caution" ? "⚠️" : "❌"} {sup.safety}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{sup.dosage}</p>
                      <p className="text-sm">{sup.benefit}</p>
                      {sup.interactionNote && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">{sup.interactionNote}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hearing Test */}
            {analysis.hearingTestSchedule && (
              <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">{lang === "tr" ? "Isitme Testi Takvimi" : "Hearing Test Schedule"}</h2>
                <p className="text-sm">{analysis.hearingTestSchedule}</p>
              </div>
            )}

            {/* When to See Doctor */}
            {analysis.whenToSeeDoctor?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  {lang === "tr" ? "Doktora Basvurun" : "See a Doctor If"}
                </h2>
                {analysis.whenToSeeDoctor.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
            )}

            {/* Sources */}
            {analysis.sources?.length > 0 && (
              <div className="bg-card border rounded-2xl p-4">
                <button onClick={() => setShowSources(!showSources)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  {lang === "tr" ? "Kaynaklar" : "Sources"} ({analysis.sources.length}) {showSources ? "▴" : "▾"}
                </button>
                {showSources && (
                  <div className="mt-3 space-y-1">
                    {analysis.sources.map((src, i) => (
                      <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 hover:underline truncate">{src.title}</a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="text-center text-xs text-muted-foreground px-4">{tx("disclaimer.tool", lang)}</div>
      </div>
    </div>
  );
}
