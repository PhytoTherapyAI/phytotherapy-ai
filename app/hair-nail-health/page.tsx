"use client";

import { useState } from "react";
import {
  Scissors,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  LogIn,
  Sparkles,
  ShieldAlert,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface HairNailAnalysis {
  overallAssessment: string;
  medicationEffects: Array<{ medication: string; effect: string; riskLevel: string; recommendation: string }>;
  nutritionalDeficiencies: Array<{ nutrient: string; likelihood: string; symptoms: string; labTest: string }>;
  recommendedLabs: Array<{ test: string; reason: string }>;
  supplements: Array<{ name: string; dosage: string; duration: string; benefit: string; safety: string; interactionNote: string }>;
  lifestyleTips: string[];
  alertLevel: string;
  whenToSeeDoctor: string[];
  sources: Array<{ title: string; url: string }>;
}

const CONCERN_OPTIONS = [
  { value: "hair_loss", en: "Hair Loss", tr: "Sac Dokulmesi" },
  { value: "thinning", en: "Thinning Hair", tr: "Sac Incelmesi" },
  { value: "brittle_nails", en: "Brittle Nails", tr: "Kirilgan Tirnaklar" },
  { value: "nail_discoloration", en: "Nail Discoloration", tr: "Tirnak Renk Degisimi" },
  { value: "slow_growth", en: "Slow Growth", tr: "Yavas Uzama" },
  { value: "dandruff", en: "Dandruff", tr: "Kepek" },
  { value: "dry_hair", en: "Dry Hair", tr: "Kuru Sac" },
  { value: "split_ends", en: "Split Ends", tr: "Kirik Uclar" },
];

const DURATION_OPTIONS = [
  { value: "less_than_1_month", en: "Less than 1 month", tr: "1 aydan az" },
  { value: "1_3_months", en: "1-3 months", tr: "1-3 ay" },
  { value: "3_6_months", en: "3-6 months", tr: "3-6 ay" },
  { value: "6_12_months", en: "6-12 months", tr: "6-12 ay" },
  { value: "over_1_year", en: "Over 1 year", tr: "1 yildan fazla" },
];

export default function HairNailHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [concerns, setConcerns] = useState<string[]>([]);
  const [duration, setDuration] = useState("less_than_1_month");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HairNailAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const toggleConcern = (value: string) => {
    setConcerns((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const handleAnalyze = async () => {
    if (concerns.length === 0 || !session?.access_token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hair-nail-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ concerns, duration, lang }),
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
          <h1 className="text-2xl font-bold">{tx("hair.title", lang)}</h1>
          <p className="text-muted-foreground">{tx("common.loginToUse", lang)}</p>
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
          <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Scissors className="w-4 h-4" />
            {tx("hair.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("hair.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("hair.subtitle", lang)}</p>
        </div>

        {/* Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">{tx("hair.concerns", lang)}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONCERN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleConcern(opt.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                  concerns.includes(opt.value)
                    ? "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-400"
                    : "bg-muted/50 border-transparent hover:bg-muted"
                }`}
              >
                {opt[lang]}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{tx("common.duration", lang)}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border rounded-lg bg-background"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt[lang]}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={concerns.length === 0 || isLoading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Scissors className="w-4 h-4 mr-2" />}
            {tx("hair.analyze", lang)}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">{error}</div>
        )}

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
                {analysis.alertLevel === "green" ? (lang === "tr" ? "Iyi" : "Good") :
                 analysis.alertLevel === "yellow" ? (lang === "tr" ? "Dikkat" : "Caution") :
                 (lang === "tr" ? "Değerlendirme Gerekli" : "Needs Evaluation")}
              </div>
              <p className="text-sm">{analysis.overallAssessment}</p>
            </div>

            {/* Medication Effects */}
            {analysis.medicationEffects?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {tx("common.medicationEffects", lang)}
                </h2>
                <div className="grid gap-3">
                  {analysis.medicationEffects.map((eff, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      eff.riskLevel === "high" ? "border-red-200 dark:border-red-800" :
                      eff.riskLevel === "moderate" ? "border-amber-200 dark:border-amber-800" : "border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{eff.medication}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          eff.riskLevel === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          eff.riskLevel === "moderate" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>{eff.riskLevel}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{eff.effect}</p>
                      <p className="text-sm mt-1">{eff.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nutritional Deficiencies */}
            {analysis.nutritionalDeficiencies?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{lang === "tr" ? "Olasi Besin Eksiklikleri" : "Possible Nutritional Deficiencies"}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {analysis.nutritionalDeficiencies.map((def, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{def.nutrient}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          def.likelihood === "likely" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          def.likelihood === "possible" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>{def.likelihood}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{def.symptoms}</p>
                      <p className="text-xs text-pink-600 dark:text-pink-400">{def.labTest}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Labs */}
            {analysis.recommendedLabs?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-blue-500" />
                  {lang === "tr" ? "Onerilen Testler" : "Recommended Lab Tests"}
                </h2>
                <div className="grid gap-2">
                  {analysis.recommendedLabs.map((lab, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-3 flex items-center justify-between">
                      <span className="font-medium text-sm">{lab.test}</span>
                      <span className="text-xs text-muted-foreground">{lab.reason}</span>
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
                      <p className="text-xs text-muted-foreground">{sup.dosage} | {sup.duration}</p>
                      <p className="text-sm">{sup.benefit}</p>
                      {sup.interactionNote && <p className="text-xs text-amber-600 dark:text-amber-400">{sup.interactionNote}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {analysis.lifestyleTips?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold">{lang === "tr" ? "Yasam Tarzı Ipuclari" : "Lifestyle Tips"}</h2>
                {analysis.lifestyleTips.map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0" /> {tip}
                  </div>
                ))}
              </div>
            )}

            {/* When to See Doctor */}
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
