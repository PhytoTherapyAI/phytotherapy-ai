"use client";

import { useState } from "react";
import {
  Dna,
  Shield,
  AlertTriangle,
  Loader2,
  LogIn,
  Sparkles,
  TrendingDown,
  Lightbulb,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface RiskScore {
  disease: string;
  riskScore: number;
  populationRisk: string;
  yourEstimatedRisk: string;
  confidence: string;
  keyFactors: string[];
  reductionStrategies: Array<{ strategy: string; potentialReduction: string }>;
}

interface GeneticResult {
  riskScores: RiskScore[];
  overallProfile: string;
  highPriorityActions: string[];
  geneticTestsRecommended: Array<{ test: string; reason: string; urgency: string }>;
  disclaimer: string;
}

const FAMILY_CONDITIONS = {
  en: ["Type 2 diabetes", "Heart disease", "Stroke", "Breast cancer", "Colon cancer", "Lung cancer", "Alzheimer's", "High blood pressure", "High cholesterol", "Osteoporosis", "Autoimmune disease", "Parkinson's", "Depression", "Kidney disease", "Thyroid disorder"],
  tr: ["Tip 2 diyabet", "Kalp hastaligi", "Inme", "Meme kanseri", "Kolon kanseri", "Akciger kanseri", "Alzheimer", "Yüksek tansiyon", "Yüksek kolesterol", "Osteoporoz", "Otoimmun hastalık", "Parkinson", "Depresyon", "Bobrek hastaligi", "Tiroid bozuklugu"],
};

const PERSONAL_FACTORS = {
  en: ["Smoker", "Overweight (BMI 25-30)", "Obese (BMI 30+)", "Sedentary lifestyle", "High stress", "Poor diet", "Excessive alcohol", "Sleep disorder", "Chronic inflammation", "Insulin resistance"],
  tr: ["Sigara kullanici", "Fazla kilolu (BMI 25-30)", "Obez (BMI 30+)", "Hareketsiz yasam", "Yüksek stres", "Kotu beslenme", "Asiri alkol", "Uyku bozuklugu", "Kronik inflamasyon", "Insulin direnci"],
};

export default function GeneticRiskPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [age, setAge] = useState("35");
  const [gender, setGender] = useState("male");
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [personalFactors, setPersonalFactors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneticResult | null>(null);

  const famConditions = FAMILY_CONDITIONS[lang];
  const famConditionsEN = FAMILY_CONDITIONS.en;
  const persFactors = PERSONAL_FACTORS[lang];
  const persFactorsEN = PERSONAL_FACTORS.en;

  const toggleFamily = (cond: string) => {
    setFamilyHistory((prev) => prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]);
  };

  const togglePersonal = (factor: string) => {
    setPersonalFactors((prev) => prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]);
  };

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/genetic-risk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang, age, gender, family_history: familyHistory, personal_factors: personalFactors }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 1.0) return "text-green-600 dark:text-green-400";
    if (score <= 1.5) return "text-yellow-600 dark:text-yellow-400";
    if (score <= 2.5) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getRiskBg = (score: number) => {
    if (score <= 1.0) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (score <= 1.5) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    if (score <= 2.5) return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  };

  const getRiskBarWidth = (score: number) => Math.min(score / 4 * 100, 100);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("genetic.title", lang)}</h1>
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
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Dna className="w-4 h-4" />
            {tx("genetic.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("genetic.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("genetic.subtitle", lang)}</p>
        </div>

        {/* Input Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{tx("common.age", lang)}</label>
              <input type="number" min="18" max="100" value={age} onChange={(e) => setAge(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="text-sm font-medium">{tx("common.gender", lang)}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="male">{tx("common.male", lang)}</option>
                <option value="female">{tx("common.female", lang)}</option>
              </select>
            </div>
          </div>

          {/* Family History */}
          <div>
            <label className="text-sm font-medium">{tx("geneticRisk.familyHistory", lang)}</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {famConditions.map((cond, i) => (
                <button key={i} onClick={() => toggleFamily(famConditionsEN[i])}
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                    familyHistory.includes(famConditionsEN[i])
                      ? "bg-violet-500 text-white"
                      : "bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300"
                  }`}>{cond}</button>
              ))}
            </div>
          </div>

          {/* Personal Factors */}
          <div>
            <label className="text-sm font-medium">{tx("geneticRisk.personalFactors", lang)}</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {persFactors.map((factor, i) => (
                <button key={i} onClick={() => togglePersonal(persFactorsEN[i])}
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                    personalFactors.includes(persFactorsEN[i])
                      ? "bg-indigo-500 text-white"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                  }`}>{factor}</button>
              ))}
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-700 text-white" size="lg">
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("common.analyzing", lang)}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{tx("genetic.analyze", lang)}</>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Profile */}
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-6">
              <h3 className="font-semibold text-violet-700 dark:text-violet-400 mb-2">
                {tx("geneticRisk.overallProfile", lang)}
              </h3>
              <p className="text-sm">{result.overallProfile}</p>
            </div>

            {/* Risk Score Cards */}
            {result.riskScores?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-violet-500" />
                  {tx("geneticRisk.diseaseScores", lang)}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {tx("geneticRisk.scoreExplanation", lang)}
                </p>
                <div className="grid gap-4">
                  {result.riskScores.map((risk, i) => (
                    <div key={i} className={`border rounded-xl p-4 space-y-3 ${getRiskBg(risk.riskScore)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{risk.disease}</span>
                        <span className={`text-2xl font-bold ${getRiskColor(risk.riskScore)}`}>
                          {risk.riskScore}x
                        </span>
                      </div>
                      {/* Risk Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            risk.riskScore <= 1.0 ? "bg-green-500" :
                            risk.riskScore <= 1.5 ? "bg-yellow-500" :
                            risk.riskScore <= 2.5 ? "bg-orange-500" : "bg-red-500"
                          }`}
                          style={{ width: `${getRiskBarWidth(risk.riskScore)}%` }}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">{tx("geneticRisk.populationRisk", lang)}</span> {risk.populationRisk}</div>
                        <div><span className="text-muted-foreground">{tx("geneticRisk.yourRisk", lang)}</span> {risk.yourEstimatedRisk}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx("geneticRisk.confidence", lang)} {risk.confidence} | {tx("geneticRisk.factors", lang)} {risk.keyFactors.join(", ")}
                      </div>
                      {/* Reduction Strategies */}
                      {risk.reductionStrategies?.length > 0 && (
                        <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg p-3 space-y-1">
                          <div className="text-xs font-medium flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            {tx("geneticRisk.riskReduction", lang)}
                          </div>
                          {risk.reductionStrategies.map((strat, si) => (
                            <div key={si} className="flex items-center justify-between text-xs">
                              <span>{strat.strategy}</span>
                              <span className="text-green-600 dark:text-green-400 font-medium">{strat.potentialReduction}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High Priority Actions */}
            {result.highPriorityActions?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {tx("geneticRisk.priorityActions", lang)}
                </h2>
                {result.highPriorityActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800 text-xs font-bold text-amber-800 dark:text-amber-200 flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Genetic Tests */}
            {result.geneticTestsRecommended?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-purple-500" />
                  {tx("geneticRisk.recommendedTests", lang)}
                </h2>
                <div className="grid gap-3">
                  {result.geneticTestsRecommended.map((test, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      test.urgency === "important" ? "border-amber-200 dark:border-amber-800" : "border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{test.test}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          test.urgency === "important" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          test.urgency === "recommended" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>{test.urgency}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{test.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            {result.disclaimer && (
              <div className="bg-gray-50 dark:bg-gray-900/30 border rounded-xl p-4">
                <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
