"use client";

import { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  LogIn,
  Sparkles,
  ShieldAlert,
  Droplets,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface KidneyAnalysis {
  kidneyStage: string;
  stageNumber: number;
  eGFR: number;
  stageColor: string;
  labInterpretation: Record<string, string>;
  medicationAlerts: Array<{ medication: string; alert: string; action: string; urgency: string }>;
  dietaryRestrictions: Array<{ nutrient: string; limit: string; foods_to_limit: string[]; foods_to_prefer: string[] }>;
  fluidRecommendation: string;
  supplements: Array<{ name: string; dosage: string; note: string; safety: string }>;
  alertLevel: string;
  alertMessage: string;
  whenToSeeDoctor: string[];
  sources: Array<{ title: string; url: string }>;
}

const STAGE_COLORS: Record<string, string> = {
  green: "from-green-500 to-green-600",
  yellow: "from-yellow-500 to-yellow-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
  darkred: "from-red-700 to-red-800",
};

export default function KidneyDashboardPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [creatinine, setCreatinine] = useState("");
  const [bun, setBun] = useState("");
  const [egfr, setEgfr] = useState("");
  const [potassium, setPotassium] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [sodium, setSodium] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<KidneyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    if (!creatinine && !egfr) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kidney-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          creatinine: Number(creatinine) || 0,
          bun: Number(bun) || 0,
          egfr: Number(egfr) || 0,
          potassium: Number(potassium) || 0,
          phosphorus: Number(phosphorus) || 0,
          sodium: Number(sodium) || 0,
          lang,
        }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
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
          <h1 className="text-2xl font-bold">{tx("kidney.title", lang)}</h1>
          <p className="text-muted-foreground">{lang === "tr" ? "Bu araci kullanmak icin giris yapin" : "Please log in to use this tool"}</p>
          <Button onClick={() => window.location.href = "/auth/login"}><LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Droplets className="w-4 h-4" />
            {tx("kidney.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("kidney.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("kidney.subtitle", lang)}</p>
        </div>

        {/* Lab Input */}
        <div className="bg-card border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">{lang === "tr" ? "Laboratuvar Degerleri" : "Lab Values"}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Creatinine (mg/dL)</label>
              <input type="number" step="0.01" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} placeholder="e.g. 1.2" className="w-full px-3 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">BUN (mg/dL)</label>
              <input type="number" value={bun} onChange={(e) => setBun(e.target.value)} placeholder="e.g. 18" className="w-full px-3 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">eGFR (mL/min)</label>
              <input type="number" value={egfr} onChange={(e) => setEgfr(e.target.value)} placeholder="e.g. 85" className="w-full px-3 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{lang === "tr" ? "Potasyum" : "Potassium"} (mEq/L)</label>
              <input type="number" step="0.1" value={potassium} onChange={(e) => setPotassium(e.target.value)} placeholder="e.g. 4.5" className="w-full px-3 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{lang === "tr" ? "Fosfor" : "Phosphorus"} (mg/dL)</label>
              <input type="number" step="0.1" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} placeholder="e.g. 3.5" className="w-full px-3 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{lang === "tr" ? "Sodyum" : "Sodium"} (mEq/L)</label>
              <input type="number" value={sodium} onChange={(e) => setSodium(e.target.value)} placeholder="e.g. 140" className="w-full px-3 py-2 border rounded-lg bg-background" />
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={(!creatinine && !egfr) || isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Droplets className="w-4 h-4 mr-2" />}
            {tx("kidney.analyze", lang)}
          </Button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">{error}</div>}

        {analysis && (
          <>
            {/* Stage Display */}
            <div className="bg-card border rounded-2xl p-6 text-center space-y-4">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-2xl bg-gradient-to-r ${STAGE_COLORS[analysis.stageColor] || STAGE_COLORS.green}`}>
                {lang === "tr" ? "Evre" : "Stage"} {analysis.stageNumber}
              </div>
              <div className="text-lg font-semibold">{analysis.kidneyStage}</div>
              <div className="text-sm text-muted-foreground">eGFR: {analysis.eGFR} mL/min/1.73m²</div>

              {/* Stage Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>5</span><span>4</span><span>3b</span><span>3a</span><span>2</span><span>1</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gradient-to-r from-red-600 via-orange-400 via-yellow-400 to-green-500 relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow"
                    style={{ left: `${Math.min(95, Math.max(5, (analysis.eGFR / 120) * 100))}%` }}
                  />
                </div>
              </div>

              {analysis.alertMessage && (
                <div className={`p-3 rounded-xl text-sm font-medium ${
                  analysis.alertLevel === "red" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  analysis.alertLevel === "yellow" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}>
                  {analysis.alertMessage}
                </div>
              )}
            </div>

            {/* Lab Interpretation */}
            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">{lang === "tr" ? "Laboratuvar Yorumlama" : "Lab Interpretation"}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(analysis.labInterpretation || {}).map(([key, val]) => (
                  <div key={key} className="bg-muted/50 rounded-xl p-3">
                    <div className="font-medium text-xs text-muted-foreground uppercase">{key}</div>
                    <div className="text-sm mt-1">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medication Alerts */}
            {analysis.medicationAlerts?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Pill className="w-5 h-5 text-red-500" />
                  {tx("kidney.medAlerts", lang)}
                </h2>
                <div className="grid gap-3">
                  {analysis.medicationAlerts.map((alert, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      alert.urgency === "urgent" ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10" :
                      alert.urgency === "important" ? "border-amber-300 dark:border-amber-700" : "border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{alert.medication}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          alert.urgency === "urgent" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          alert.urgency === "important" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>{alert.urgency}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.alert}</p>
                      <p className="text-sm mt-1 font-medium">{alert.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Restrictions */}
            {analysis.dietaryRestrictions?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{tx("kidney.diet", lang)}</h2>
                <div className="grid gap-4">
                  {analysis.dietaryRestrictions.map((diet, i) => (
                    <div key={i} className="border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{diet.nutrient}</span>
                        <span className="text-sm text-muted-foreground">{diet.limit}</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                          <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">{lang === "tr" ? "Sinirlayin" : "Limit"}</div>
                          <div className="text-xs text-muted-foreground">{diet.foods_to_limit?.join(", ")}</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                          <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">{lang === "tr" ? "Tercih Edin" : "Prefer"}</div>
                          <div className="text-xs text-muted-foreground">{diet.foods_to_prefer?.join(", ")}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fluid */}
            {analysis.fluidRecommendation && (
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <Droplets className="w-5 h-5 text-teal-500" />
                  {lang === "tr" ? "Sivi Onerisi" : "Fluid Recommendation"}
                </h2>
                <p className="text-sm">{analysis.fluidRecommendation}</p>
              </div>
            )}

            {/* When to See Doctor */}
            {analysis.whenToSeeDoctor?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> {lang === "tr" ? "Doktora Basvurun" : "See a Doctor If"}
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
                  {lang === "tr" ? "Kaynaklar" : "Sources"} ({analysis.sources.length}) {showSources ? "▴" : "▾"}
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
