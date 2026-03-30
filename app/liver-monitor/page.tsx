// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  LogIn,
  ShieldAlert,
  Pill,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface LiverAnalysis {
  liverHealthScore: number;
  labInterpretation: Record<string, string>;
  hepatotoxicMeds: Array<{ medication: string; liverRisk: string; riskLevel: string; monitoring: string }>;
  fattyLiverIndex: { score: number | null; category: string; interpretation: string };
  recommendations: Array<{ category: string; advice: string; priority: string }>;
  supplements: Array<{ name: string; dosage: string; benefit: string; safety: string; interactionNote: string }>;
  alertLevel: string;
  alertMessage: string;
  whenToSeeDoctor: string[];
  sources: Array<{ title: string; url: string }>;
}

export default function LiverMonitorPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [alt, setAlt] = useState("");
  const [ast, setAst] = useState("");
  const [ggt, setGgt] = useState("");
  const [bilirubin, setBilirubin] = useState("");
  const [albumin, setAlbumin] = useState("");
  const [bmi, setBmi] = useState("");
  const [waist, setWaist] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LiverAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const handleAnalyze = async () => {
    if (!session?.access_token || (!alt && !ast)) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/liver-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          alt: Number(alt) || 0, ast: Number(ast) || 0, ggt: Number(ggt) || 0,
          bilirubin: Number(bilirubin) || 0, albumin: Number(albumin) || 0,
          bmi: Number(bmi) || 0, waist_circumference: Number(waist) || 0, lang,
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
          <h1 className="text-2xl font-bold">{tx("liver.title", lang)}</h1>
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
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Activity className="w-4 h-4" />
            {tx("liver.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("liver.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("liver.subtitle", lang)}</p>
        </div>

        {/* Lab Input */}
        <div className="bg-card border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">{tx("liver.liverEnzymes", lang)}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">ALT (U/L)</label>
              <input type="number" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. 35" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">AST (U/L)</label>
              <input type="number" value={ast} onChange={(e) => setAst(e.target.value)} placeholder="e.g. 30" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">GGT (U/L)</label>
              <input type="number" value={ggt} onChange={(e) => setGgt(e.target.value)} placeholder="e.g. 45" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">Bilirubin (mg/dL)</label>
              <input type="number" step="0.1" value={bilirubin} onChange={(e) => setBilirubin(e.target.value)} placeholder="e.g. 0.8" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">Albumin (g/dL)</label>
              <input type="number" step="0.1" value={albumin} onChange={(e) => setAlbumin(e.target.value)} placeholder="e.g. 4.2" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{tx("liver.fattyLiverOptional", lang)}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">BMI</label>
              <input type="number" step="0.1" value={bmi} onChange={(e) => setBmi(e.target.value)} placeholder="e.g. 26" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">{tx("liver.waist", lang)}</label>
              <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g. 88" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
          </div>
          <Button onClick={handleAnalyze} disabled={(!alt && !ast) || isLoading} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
            {tx("liver.analyze", lang)}
          </Button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">{error}</div>}

        {analysis && (
          <>
            {/* Score */}
            <div className="bg-card border rounded-2xl p-6 text-center space-y-3">
              <h2 className="text-lg font-semibold">{tx("liver.score", lang)}</h2>
              <div className={`text-5xl font-bold ${
                analysis.liverHealthScore >= 70 ? "text-green-600" : analysis.liverHealthScore >= 40 ? "text-amber-600" : "text-red-600"
              }`}>{analysis.liverHealthScore}/100</div>
              {analysis.alertMessage && (
                <div className={`p-3 rounded-xl text-sm font-medium ${
                  analysis.alertLevel === "red" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  analysis.alertLevel === "yellow" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}>{analysis.alertMessage}</div>
              )}
            </div>

            {/* Lab Interpretation */}
            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">{tx("common.labInterpretation", lang)}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(analysis.labInterpretation || {}).map(([key, val]) => (
                  <div key={key} className="bg-muted/50 rounded-xl p-3">
                    <div className="font-medium text-xs text-muted-foreground uppercase">{key}</div>
                    <div className="text-sm mt-1">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hepatotoxic Meds */}
            {analysis.hepatotoxicMeds?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Pill className="w-5 h-5 text-red-500" />
                  {tx("liver.hepatotoxic", lang)}
                </h2>
                <div className="grid gap-3">
                  {analysis.hepatotoxicMeds.map((med, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${
                      med.riskLevel === "high" ? "border-red-200 dark:border-red-800" : med.riskLevel === "moderate" ? "border-amber-200 dark:border-amber-800" : "border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{med.medication}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          med.riskLevel === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          med.riskLevel === "moderate" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>{med.riskLevel}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{med.liverRisk}</p>
                      <p className="text-sm mt-1">{med.monitoring}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FLI */}
            {analysis.fattyLiverIndex && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold">{tx("liver.fli", lang)}</h2>
                {analysis.fattyLiverIndex.score !== null && (
                  <div className={`text-3xl font-bold ${
                    analysis.fattyLiverIndex.category === "low" ? "text-green-600" :
                    analysis.fattyLiverIndex.category === "intermediate" ? "text-amber-600" : "text-red-600"
                  }`}>{analysis.fattyLiverIndex.score}</div>
                )}
                <p className="text-sm">{analysis.fattyLiverIndex.interpretation}</p>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{tx("common.recommendations", lang)}</h2>
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
