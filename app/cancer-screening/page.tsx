"use client";

import { useState } from "react";
import {
  Shield,
  Calendar,
  Users,
  Heart,
  AlertTriangle,
  Loader2,
  LogIn,
  Sparkles,
  Plus,
  X,
  Search,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface CancerResult {
  riskLevel: string;
  screeningSchedule: Array<{ cancer: string; test: string; startAge: number; frequency: string; applicability: string; priority: string; notes: string }>;
  familyRiskAnalysis: Array<{ cancer: string; relativeRisk: string; recommendation: string }>;
  selfCheckReminders: Array<{ check: string; frequency: string; howTo: string }>;
  lifestyleReductions: Array<{ factor: string; riskReduction: string; recommendation: string }>;
  nextSteps: string[];
}

const FAMILY_CANCER_OPTIONS = [
  "Breast cancer", "Colon cancer", "Lung cancer", "Prostate cancer",
  "Ovarian cancer", "Melanoma", "Pancreatic cancer", "Stomach cancer",
  "Thyroid cancer", "Kidney cancer", "Bladder cancer", "Leukemia",
  "Lymphoma", "Liver cancer", "Cervical cancer",
];

const FAMILY_CANCER_OPTIONS_TR = [
  "Meme kanseri", "Kolon kanseri", "Akciger kanseri", "Prostat kanseri",
  "Over kanseri", "Melanom", "Pankreas kanseri", "Mide kanseri",
  "Tiroid kanseri", "Bobrek kanseri", "Mesane kanseri", "Losemi",
  "Lenfoma", "Karaciger kanseri", "Rahim agzi kanseri",
];

export default function CancerScreeningPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [age, setAge] = useState("40");
  const [gender, setGender] = useState("male");
  const [smokingHistory, setSmokingHistory] = useState("never");
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CancerResult | null>(null);

  const cancerOptions = lang === "tr" ? FAMILY_CANCER_OPTIONS_TR : FAMILY_CANCER_OPTIONS;

  const toggleFamilyCancer = (cancer: string) => {
    setFamilyHistory((prev) =>
      prev.includes(cancer) ? prev.filter((c) => c !== cancer) : [...prev, cancer]
    );
  };

  const handleGenerate = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cancer-screening", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang, age, gender, smoking_history: smokingHistory, family_history: familyHistory }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate schedule");
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
          <h1 className="text-2xl font-bold">{tx("cancer.title", lang)}</h1>
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
          <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Search className="w-4 h-4" />
            {tx("cancer.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("cancer.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("cancer.subtitle", lang)}</p>
        </div>

        {/* Input Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">{tx("common.age", lang)}</label>
              <input type="number" min="18" max="100" value={age} onChange={(e) => setAge(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-sm font-medium">{tx("common.gender", lang)}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="male">{tx("common.male", lang)}</option>
                <option value="female">{tx("common.female", lang)}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{lang === "tr" ? "Sigara Geçmişi" : "Smoking History"}</label>
              <select value={smokingHistory} onChange={(e) => setSmokingHistory(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="never">{lang === "tr" ? "Hic" : "Never"}</option>
                <option value="former">{lang === "tr" ? "Birakmis" : "Former smoker"}</option>
                <option value="current">{lang === "tr" ? "Aktif" : "Current smoker"}</option>
                <option value="heavy">{lang === "tr" ? "Agir (20+ yil)" : "Heavy (20+ years)"}</option>
              </select>
            </div>
          </div>

          {/* Family History */}
          <div>
            <label className="text-sm font-medium">{lang === "tr" ? "Ailede Kanser Geçmişi" : "Family Cancer History"}</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {cancerOptions.map((cancer, i) => (
                <button
                  key={i}
                  onClick={() => toggleFamilyCancer(FAMILY_CANCER_OPTIONS[i])}
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                    familyHistory.includes(FAMILY_CANCER_OPTIONS[i])
                      ? "bg-teal-500 text-white"
                      : "bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300"
                  }`}
                >
                  {cancer}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white" size="lg">
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{lang === "tr" ? "Takvim oluşturuluyor..." : "Generating schedule..."}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{tx("cancer.generate", lang)}</>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Risk Level */}
            <div className={`rounded-2xl p-6 text-center border-2 ${
              result.riskLevel === "high" ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700" :
              result.riskLevel === "elevated" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700" :
              "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
            }`}>
              <Shield className={`w-8 h-8 mx-auto mb-2 ${
                result.riskLevel === "high" ? "text-red-500" : result.riskLevel === "elevated" ? "text-amber-500" : "text-green-500"
              }`} />
              <p className="text-lg font-bold">
                {lang === "tr" ? "Risk Seviyesi:" : "Risk Level:"} {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
              </p>
            </div>

            {/* Screening Schedule */}
            {result.screeningSchedule?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  {lang === "tr" ? "Kişisel Tarama Takvimi" : "Personalized Screening Schedule"}
                </h2>
                <div className="grid gap-3">
                  {result.screeningSchedule.map((item, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      item.priority === "critical" ? "border-red-200 dark:border-red-800" :
                      item.priority === "important" ? "border-amber-200 dark:border-amber-800" : "border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{item.cancer}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.priority === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          item.priority === "important" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>{item.frequency}</span>
                      </div>
                      <p className="text-sm font-medium text-teal-600 dark:text-teal-400">{item.test}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lang === "tr" ? "Başlangıç yasi:" : "Start age:"} {item.startAge} | {item.applicability}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Family Risk */}
            {result.familyRiskAnalysis?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  {lang === "tr" ? "Aile Geçmişi Risk Analizi" : "Family History Risk Analysis"}
                </h2>
                <div className="grid gap-3">
                  {result.familyRiskAnalysis.map((item, i) => (
                    <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 space-y-1">
                      <div className="font-medium">{item.cancer}</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">{item.relativeRisk}</div>
                      <div className="text-sm text-muted-foreground">{item.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Self-Check Reminders */}
            {result.selfCheckReminders?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  {lang === "tr" ? "Oz Kontrol Hatirlaticlari" : "Self-Check Reminders"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.selfCheckReminders.map((item, i) => (
                    <div key={i} className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 space-y-1">
                      <div className="font-medium">{item.check}</div>
                      <div className="text-sm text-rose-600 dark:text-rose-400">{item.frequency}</div>
                      <div className="text-sm text-muted-foreground">{item.howTo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {result.lifestyleReductions?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  {lang === "tr" ? "Risk Azaltma Stratejileri" : "Risk Reduction Strategies"}
                </h2>
                <div className="grid gap-3">
                  {result.lifestyleReductions.map((item, i) => (
                    <div key={i} className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.factor}</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">{item.riskReduction}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {result.nextSteps?.length > 0 && (
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 space-y-2">
                <h3 className="font-semibold text-teal-700 dark:text-teal-400">
                  {lang === "tr" ? "Sonraki Adimlar" : "Next Steps"}
                </h3>
                {result.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-200 dark:bg-teal-800 text-xs font-bold text-teal-800 dark:text-teal-200 flex-shrink-0 mt-0.5">{i + 1}</span>
                    {step}
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
