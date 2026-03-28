"use client";

import { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  LogIn,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ThyroidAnalysis {
  thyroidStatus: string;
  statusColor: string;
  labInterpretation: Record<string, string>;
  medicationTimingOptimization: Array<{ medication: string; currentIssue: string; optimalTiming: string; separateFrom: string }>;
  timingTimeline: Array<{ time: string; action: string; note: string }>;
  supplements: Array<{ name: string; dosage: string; benefit: string; safety: string; timingNote: string }>;
  pregnancyNote: string;
  alertLevel: string;
  whenToSeeDoctor: string[];
  sources: Array<{ title: string; url: string }>;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
  yellow: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
};

export default function ThyroidDashboardPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [tsh, setTsh] = useState("");
  const [t3, setT3] = useState("");
  const [t4, setT4] = useState("");
  const [antiTPO, setAntiTPO] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ThyroidAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const handleAnalyze = async () => {
    if (!session?.access_token || !tsh) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/thyroid-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          tsh: Number(tsh) || 0, t3: Number(t3) || 0, t4: Number(t4) || 0,
          anti_tpo: Number(antiTPO) || 0, lang,
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
          <h1 className="text-2xl font-bold">{tx("thyroid.title", lang)}</h1>
          <p className="text-muted-foreground">{lang === "tr" ? "Bu aracı kullanmak için giriş yapın" : "Please log in to use this tool"}</p>
          <Button onClick={() => window.location.href = "/auth/login"}><LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {tx("thyroid.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("thyroid.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("thyroid.subtitle", lang)}</p>
        </div>

        {/* Lab Input */}
        <div className="bg-card border rounded-2xl p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">TSH (mIU/L) *</label>
              <input type="number" step="0.01" value={tsh} onChange={(e) => setTsh(e.target.value)} placeholder="e.g. 2.5" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">Free T3 (pg/mL)</label>
              <input type="number" step="0.01" value={t3} onChange={(e) => setT3(e.target.value)} placeholder="e.g. 3.0" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">Free T4 (ng/dL)</label>
              <input type="number" step="0.01" value={t4} onChange={(e) => setT4(e.target.value)} placeholder="e.g. 1.2" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">Anti-TPO (IU/mL)</label>
              <input type="number" step="0.1" value={antiTPO} onChange={(e) => setAntiTPO(e.target.value)} placeholder="e.g. 15" className="w-full px-3 py-2 border rounded-lg bg-background" /></div>
          </div>
          <Button onClick={handleAnalyze} disabled={!tsh || isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {tx("thyroid.analyze", lang)}
          </Button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">{error}</div>}

        {analysis && (
          <>
            {/* Status Badge */}
            <div className="bg-card border rounded-2xl p-6 text-center space-y-4">
              <h2 className="text-lg font-semibold">{tx("thyroid.status", lang)}</h2>
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xl font-bold ${
                STATUS_COLORS[analysis.statusColor]?.bg || STATUS_COLORS.green.bg
              } ${STATUS_COLORS[analysis.statusColor]?.text || STATUS_COLORS.green.text}`}>
                {analysis.thyroidStatus}
              </div>
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

            {/* Timing Timeline */}
            {analysis.timingTimeline?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  {tx("thyroid.timing", lang)}
                </h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-800" />
                  <div className="space-y-4 pl-10">
                    {analysis.timingTimeline.map((item, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900" />
                        <div className="bg-muted/50 rounded-xl p-3">
                          <div className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">{item.time}</div>
                          <div className="text-sm font-medium">{item.action}</div>
                          <div className="text-xs text-muted-foreground">{item.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medication Timing */}
            {analysis.medicationTimingOptimization?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">{lang === "tr" ? "İlaç Zamanlama Optimizasyonu" : "Medication Timing Optimization"}</h2>
                <div className="grid gap-3">
                  {analysis.medicationTimingOptimization.map((med, i) => (
                    <div key={i} className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                      <div className="font-semibold mb-1">{med.medication}</div>
                      {med.currentIssue && <p className="text-sm text-amber-600 dark:text-amber-400">{med.currentIssue}</p>}
                      <p className="text-sm mt-1">{med.optimalTiming}</p>
                      <p className="text-xs text-muted-foreground mt-1">{med.separateFrom}</p>
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
                        }`}>{sup.safety === "safe" ? "✅" : sup.safety === "caution" ? "⚠️" : "❌"} {sup.safety}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{sup.dosage}</p>
                      <p className="text-sm">{sup.benefit}</p>
                      {sup.timingNote && <p className="text-xs text-indigo-600 dark:text-indigo-400">{sup.timingNote}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pregnancy Note */}
            {analysis.pregnancyNote && (
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">{lang === "tr" ? "Gebelik ve Tiroid" : "Pregnancy & Thyroid"}</h2>
                <p className="text-sm">{analysis.pregnancyNote}</p>
              </div>
            )}

            {analysis.whenToSeeDoctor?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> {lang === "tr" ? "Doktora Başvurun" : "See a Doctor If"}
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
