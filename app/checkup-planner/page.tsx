"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Syringe,
  Stethoscope,
  TestTube,
  Calendar,
  Loader2,
  LogIn,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface CheckupResult {
  annualPlan: Array<{ test: string; specialist: string; frequency: string; priority: string; reason: string; preparation: string }>;
  bloodWorkPanel: Array<{ test: string; reason: string; fasting: boolean }>;
  specialistVisits: Array<{ specialist: string; frequency: string; reason: string }>;
  vaccinations: Array<{ vaccine: string; dueDate: string; notes: string }>;
  schedulingSuggestion: string;
  costSavingTips: string[];
}

const RISK_FACTORS = {
  en: ["Family history of heart disease", "Family history of cancer", "Diabetes risk", "Obesity", "Smoker/former smoker", "High blood pressure", "Sedentary lifestyle", "High stress", "History of depression", "Chronic medication use"],
  tr: ["Ailede kalp hastaligi", "Ailede kanser gecmisi", "Diyabet riski", "Obezite", "Sigara/eski sigara kullanici", "Yuksek tansiyon", "Hareketsiz yasam", "Yuksek stres", "Depresyon gecmisi", "Kronik ilac kullanimi"],
};

export default function CheckupPlannerPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [age, setAge] = useState("35");
  const [gender, setGender] = useState("male");
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckupResult | null>(null);

  const factors = RISK_FACTORS[lang];
  const factorsEN = RISK_FACTORS.en;

  const toggleFactor = (factor: string) => {
    setRiskFactors((prev) => prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]);
  };

  const handleGenerate = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkup-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang, age, gender, risk_factors: riskFactors }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate plan");
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("checkup.title", lang)}</h1>
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
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <ClipboardCheck className="w-4 h-4" />
            {tx("checkup.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("checkup.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("checkup.subtitle", lang)}</p>
        </div>

        {/* Input Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{lang === "tr" ? "Yas" : "Age"}</label>
              <input type="number" min="18" max="100" value={age} onChange={(e) => setAge(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium">{lang === "tr" ? "Cinsiyet" : "Gender"}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="male">{lang === "tr" ? "Erkek" : "Male"}</option>
                <option value="female">{lang === "tr" ? "Kadin" : "Female"}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{lang === "tr" ? "Risk Faktorleri" : "Risk Factors"}</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {factors.map((factor, i) => (
                <button key={i} onClick={() => toggleFactor(factorsEN[i])}
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                    riskFactors.includes(factorsEN[i])
                      ? "bg-blue-500 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                  }`}>{factor}</button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{lang === "tr" ? "Plan olusturuluyor..." : "Generating plan..."}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{tx("checkup.generate", lang)}</>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Annual Plan */}
            {result.annualPlan?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  {lang === "tr" ? "Yıllık Test Plani" : "Annual Test Plan"}
                </h2>
                <div className="grid gap-3">
                  {result.annualPlan.map((item, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      item.priority === "essential" ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10" :
                      item.priority === "recommended" ? "border-border" : "border-dashed border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{item.test}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.priority === "essential" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          item.priority === "recommended" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>{item.priority}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.specialist} | {item.frequency}</p>
                      <p className="text-sm mt-1">{item.reason}</p>
                      {item.preparation && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{item.preparation}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blood Work */}
            {result.bloodWorkPanel?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-red-500" />
                  {lang === "tr" ? "Kan Tahlili Paneli" : "Blood Work Panel"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.bloodWorkPanel.map((item, i) => (
                    <div key={i} className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{item.test}</span>
                        {item.fasting && <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                          {lang === "tr" ? "Ac karinla" : "Fasting"}
                        </span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialists */}
            {result.specialistVisits?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-purple-500" />
                  {lang === "tr" ? "Uzman Ziyaretleri" : "Specialist Visits"}
                </h2>
                <div className="grid gap-3">
                  {result.specialistVisits.map((visit, i) => (
                    <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{visit.specialist}</span>
                        <span className="text-sm text-purple-600 dark:text-purple-400">{visit.frequency}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{visit.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vaccinations */}
            {result.vaccinations?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-green-500" />
                  {lang === "tr" ? "Asilar" : "Vaccinations"}
                </h2>
                <div className="grid gap-3">
                  {result.vaccinations.map((vax, i) => (
                    <div key={i} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{vax.vaccine}</span>
                        <span className="text-sm text-green-600 dark:text-green-400">{vax.dueDate}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{vax.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduling */}
            {result.schedulingSuggestion && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">{result.schedulingSuggestion}</p>
              </div>
            )}

            {/* Cost Tips */}
            {result.costSavingTips?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  {lang === "tr" ? "Maliyet Tasarrufu Ipuclari" : "Cost-Saving Tips"}
                </h2>
                {result.costSavingTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </div>
                ))}
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
