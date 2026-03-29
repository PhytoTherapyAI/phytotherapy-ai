"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Loader2,
  LogIn,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
  Users,
  Zap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx, type Lang } from "@/lib/translations";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import type { HealthTimeline, PeerBenchmark, Anomaly, Prediction, SupplementPeriod } from "@/lib/analytics-engine";
import Link from "next/link";

// ── Types ─────────────────────────────────────
interface TimelineResponse {
  timeline: HealthTimeline[];
  supplementPeriods: SupplementPeriod[];
  omega3Simulation: HealthTimeline[];
}

interface BenchmarkResponse {
  benchmarks: PeerBenchmark[];
  profileSummary: {
    age: number | null;
    gender: string | null;
    conditions: string[];
    medicationCount: number;
  };
}

interface AiInsight {
  title: string;
  body: string;
  type: "positive" | "caution" | "neutral";
}

interface AiCorrelation {
  supplement: string;
  metric: string;
  effect: string;
  strength: "strong" | "moderate" | "weak";
}

interface AiRecommendation {
  action: string;
  priority: "high" | "medium" | "low";
  reason: string;
}

interface AiResponse {
  insights: AiInsight[];
  correlations: AiCorrelation[];
  recommendations: AiRecommendation[];
}

// ── Tab type ──────────────────────────────────
type TabKey = "impact" | "anomalies" | "benchmarking" | "predictions";

// ── Helpers ───────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Custom Tooltip ────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-mono" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Page Component ───────────────────────
export default function HealthAnalyticsPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const { lang } = useLang();
  const isTr = lang === "tr";

  const [activeTab, setActiveTab] = useState<TabKey>("impact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResponse | null>(null);
  const [anomalyData, setAnomalyData] = useState<Anomaly[] | null>(null);
  const [predictionData, setPredictionData] = useState<Prediction[] | null>(null);
  const [omega3Enabled, setOmega3Enabled] = useState(false);

  // AI insights
  const [aiData, setAiData] = useState<AiResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const token = session?.access_token;

  // ── Fetch section data ──────────────────────
  const fetchSection = useCallback(async (section: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/health-analytics?section=${section}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (section === "timeline") setTimelineData(data);
      if (section === "benchmarks") setBenchmarkData(data);
      if (section === "anomalies") setAnomalyData(data.anomalies);
      if (section === "predictions") setPredictionData(data.predictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Fetch on mount and tab change ───────────
  useEffect(() => {
    if (!token) return;
    if (activeTab === "impact" && !timelineData) fetchSection("timeline");
    if (activeTab === "anomalies" && !anomalyData) fetchSection("anomalies");
    if (activeTab === "benchmarking" && !benchmarkData) fetchSection("benchmarks");
    if (activeTab === "predictions" && !predictionData) fetchSection("predictions");
  }, [activeTab, token, timelineData, anomalyData, benchmarkData, predictionData, fetchSection]);

  // ── Generate AI Insights ────────────────────
  const generateAiInsights = async () => {
    if (!token) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/health-analytics", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAiData(data);
    } catch {
      // silent fail for AI insights
    } finally {
      setAiLoading(false);
    }
  };

  // ── Auth wall ───────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <Activity className="h-16 w-16 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold">{tx("analytics2.title", lang)}</h1>
          <p className="text-muted-foreground">{tx("analytics2.loginRequired", lang)}</p>
          <Link href="/auth/login">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 mt-2">
              <LogIn className="h-4 w-4" />
              {tx("nav.login", lang)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Tabs ────────────────────────────────────
  const tabs: Array<{ key: TabKey; label: string; icon: typeof Activity }> = [
    { key: "impact", label: tx("analytics2.impactResponse", lang), icon: FlaskConical },
    { key: "anomalies", label: tx("analytics2.anomalies", lang), icon: AlertTriangle },
    { key: "benchmarking", label: tx("analytics2.benchmarking", lang), icon: Users },
    { key: "predictions", label: tx("analytics2.predictions", lang), icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-950/5 pb-20">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{tx("analytics2.title", lang)}</h1>
              <p className="text-sm text-muted-foreground">{tx("analytics2.subtitle", lang)}</p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-emerald-500 text-emerald-500"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === "impact" && <ImpactResponseTab data={timelineData} isTr={isTr} lang={lang} omega3Enabled={omega3Enabled} setOmega3Enabled={setOmega3Enabled} />}
            {activeTab === "anomalies" && <AnomalyTab anomalies={anomalyData} isTr={isTr} lang={lang} timelineData={timelineData} />}
            {activeTab === "benchmarking" && <BenchmarkTab data={benchmarkData} isTr={isTr} lang={lang} />}
            {activeTab === "predictions" && <PredictionTab predictions={predictionData} isTr={isTr} lang={lang} timelineData={timelineData} omega3Enabled={omega3Enabled} setOmega3Enabled={setOmega3Enabled} />}
          </>
        )}

        {/* AI Insights Section */}
        {!loading && !error && user && (
          <div className="mt-8 rounded-2xl border border-border/40 bg-gradient-to-br from-purple-500/5 via-background to-indigo-500/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold">{tx("analytics2.aiInsights", lang)}</h3>
              </div>
              <Button
                onClick={generateAiInsights}
                disabled={aiLoading}
                className="bg-purple-600 hover:bg-purple-700 gap-2"
                size="sm"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {tx("analytics2.generateInsights", lang)}
              </Button>
            </div>

            {aiData ? (
              <div className="space-y-4">
                {/* Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiData.insights?.map((insight, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-4 ${
                        insight.type === "positive"
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : insight.type === "caution"
                          ? "border-amber-500/20 bg-amber-500/5"
                          : "border-border/40 bg-muted/30"
                      }`}
                    >
                      <p className="font-medium text-sm mb-1">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.body}</p>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {aiData.recommendations && aiData.recommendations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      {tx("analytics2.recommendations", lang)}
                    </p>
                    <div className="space-y-2">
                      {aiData.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border border-border/30 bg-muted/20 p-3">
                          <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                            rec.priority === "high" ? "bg-red-400" : rec.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{rec.action}</p>
                            <p className="text-xs text-muted-foreground">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {tx("analytics2.aiClickPrompt", lang)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Tab 1: Impact-Response
// ══════════════════════════════════════════════
function ImpactResponseTab({
  data,
  isTr,
  lang,
  omega3Enabled,
  setOmega3Enabled,
}: {
  data: TimelineResponse | null;
  isTr: boolean;
  lang: Lang;
  omega3Enabled: boolean;
  setOmega3Enabled: (v: boolean) => void;
}) {
  if (!data) return null;

  const { timeline, supplementPeriods } = data;

  // Sample every 3rd data point for cleaner chart
  const chartData = timeline.filter((_, i) => i % 3 === 0).map((d) => ({
    ...d,
    dateLabel: formatDate(d.date),
  }));

  // Calculate correlation metrics
  const baseline = timeline.slice(0, 14);
  const recent = timeline.slice(-14);
  const avgVal = (arr: HealthTimeline[], key: keyof HealthTimeline) => {
    const vals = arr.map((d) => d[key] as number).filter((v) => v != null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const correlations = [
    {
      supplement: "Curcumin",
      supplementTr: "Kurkumin",
      metric: "CRP",
      metricTr: "CRP",
      baselineVal: avgVal(baseline, "crp"),
      currentVal: avgVal(recent, "crp"),
      unit: "mg/L",
      color: "#10b981",
      grade: "A",
    },
    {
      supplement: "Valerian Root",
      supplementTr: "Kediotu",
      metric: "Deep Sleep",
      metricTr: "Derin Uyku",
      baselineVal: avgVal(baseline, "deepSleep"),
      currentVal: avgVal(recent, "deepSleep"),
      unit: "h",
      color: "#6366f1",
      grade: "B",
    },
    {
      supplement: "Berberine",
      supplementTr: "Berberin",
      metric: "Fasting Glucose",
      metricTr: "Aclik Sekeri",
      baselineVal: avgVal(baseline, "fastingGlucose"),
      currentVal: avgVal(recent, "fastingGlucose"),
      unit: "mg/dL",
      color: "#a855f7",
      grade: "A",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Supplement Timeline Pills */}
      <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          {tx("analytics2.supplementTimeline", lang)}
        </h3>
        <div className="flex flex-wrap gap-3">
          {supplementPeriods.map((sp) => (
            <div
              key={sp.name}
              className="flex items-center gap-2 rounded-full px-4 py-1.5 border text-sm"
              style={{ borderColor: sp.color + "40", backgroundColor: sp.colorBg }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
              <span className="font-medium" style={{ color: sp.color }}>
                {isTr ? sp.nameTr : sp.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {tx("analytics2.started", lang)}: {isTr ? `Gun ${sp.startDay}` : `Day ${sp.startDay}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Composed Chart */}
      <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
          {tx("analytics2.metricTimeline", lang)}
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="crpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[0, 8]} label={{ value: "CRP / HbA1c", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "var(--muted-foreground)" } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[0, 10]} label={{ value: tx("analytics2.sleepEnergy", lang), angle: 90, position: "insideRight", style: { fontSize: 10, fill: "var(--muted-foreground)" } }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />

              {/* Supplement start reference lines */}
              {supplementPeriods.map((sp) => {
                const idx = chartData.findIndex((d) => d.day >= sp.startDay);
                if (idx < 0) return null;
                return (
                  <ReferenceLine
                    key={sp.name}
                    x={chartData[idx]?.dateLabel}
                    yAxisId="left"
                    stroke={sp.color}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: isTr ? sp.nameTr : sp.name, position: "top", style: { fontSize: 9, fill: sp.color } }}
                  />
                );
              })}

              <Area yAxisId="left" type="monotone" dataKey="crp" name="CRP (mg/L)" stroke="#10b981" fill="url(#crpGrad)" strokeWidth={2} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="hba1c" name="HbA1c (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Area yAxisId="right" type="monotone" dataKey="deepSleep" name={tx("analytics2.deepSleepH", lang)} stroke="#6366f1" fill="url(#sleepGrad)" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="energyScore" name={tx("analytics2.energy", lang)} stroke="#ec4899" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlation Cards */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          {tx("analytics2.correlations", lang)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {correlations.map((c) => {
            const change = ((c.currentVal - c.baselineVal) / c.baselineVal) * 100;
            const isImproved = (c.metric === "Deep Sleep" ? change > 0 : change < 0);
            return (
              <div key={c.metric} className="rounded-2xl border border-border/40 bg-card/50 p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: c.color }} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isTr ? c.supplementTr : c.supplement}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.grade === "A" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {tx("analytics2.evidenceLabel", lang)} {c.grade}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">{isTr ? c.metricTr : c.metric}:</span>
                  <span className={`text-xl font-bold font-mono ${isImproved ? "text-emerald-400" : "text-red-400"}`}>
                    {change > 0 ? "+" : ""}{change.toFixed(1)}%
                  </span>
                  {isImproved ? (
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span>{c.baselineVal.toFixed(1)} {c.unit}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-semibold text-foreground">{c.currentVal.toFixed(1)} {c.unit}</span>
                </div>

                {/* Mini sparkline */}
                <div className="h-10 mt-3 -mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline.filter((_, i) => i % 5 === 0).map((d) => ({
                      val: d[c.metric === "Deep Sleep" ? "deepSleep" : c.metric === "CRP" ? "crp" : "fastingGlucose"] as number,
                    }))}>
                      <defs>
                        <linearGradient id={`spark-${c.metric}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={c.color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={c.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke={c.color} fill={`url(#spark-${c.metric})`} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Tab 2: Anomaly Detection
// ══════════════════════════════════════════════
function AnomalyTab({
  anomalies,
  isTr,
  lang,
  timelineData,
}: {
  anomalies: Anomaly[] | null;
  isTr: boolean;
  lang: Lang;
  timelineData: TimelineResponse | null;
}) {
  if (!anomalies) return null;

  const alertCount = anomalies.filter((a) => a.severity === "alert").length;

  // Chart data: heart rate with anomaly markers
  const chartData = timelineData?.timeline.filter((_, i) => i % 2 === 0).map((d) => {
    const anomaly = anomalies.find((a) => a.date === d.date && a.metric === "Heart Rate");
    return {
      dateLabel: formatDate(d.date),
      heartRate: d.heartRate,
      crp: d.crp,
      deepSleep: d.deepSleep,
      anomalyHR: anomaly ? d.heartRate : undefined,
    };
  }) || [];

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertCount > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-400">
              {isTr
                ? `${alertCount} ciddi anomali tespit edildi`
                : `${alertCount} serious anomal${alertCount === 1 ? "y" : "ies"} detected`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isTr
                ? "Asagidaki metrikler beklenen araliktan onemli olcude sapma gostermektedir."
                : "The following metrics show significant deviation from expected ranges."}
            </p>
          </div>
        </div>
      )}

      {/* Anomaly Timeline Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            {tx("analytics2.anomalyTimeline", lang)}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="heartRate" name={tx("analytics2.heartRateBpm", lang)} stroke="#6366f1" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="crp" name="CRP (mg/L)" stroke="#10b981" strokeWidth={1.5} dot={false} />
                <Line
                  type="monotone"
                  dataKey="anomalyHR"
                  name={tx("analytics2.anomalyLabel", lang)}
                  stroke="transparent"
                  dot={{ r: 6, fill: "#ef4444", stroke: "#ef4444", strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: "#ef4444" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Anomaly Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {tx("analytics2.anomalyDetected", lang)} ({anomalies.length})
        </h3>
        {anomalies.map((a, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              a.severity === "alert"
                ? "border-red-500/30 bg-red-500/5"
                : a.severity === "warning"
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-border/40 bg-muted/20"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  a.severity === "alert"
                    ? "bg-red-500/20 text-red-400"
                    : a.severity === "warning"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}>
                  {a.severity}
                </span>
                <span className="font-medium text-sm">{isTr ? a.metricTr : a.metric}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs mb-2">
              <div>
                <span className="text-muted-foreground">{tx("analytics2.expected", lang)}:</span>
                <span className="font-mono font-semibold ml-1">{a.expected}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{tx("analytics2.actual", lang)}:</span>
                <span className="font-mono font-semibold ml-1 text-foreground">{a.value}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{tx("analytics2.deviation", lang)}:</span>
                <span className="font-mono font-semibold ml-1">{a.deviation.toFixed(1)} SD</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{tx("analytics2.possibleCause", lang)}:</span>{" "}
              {isTr ? a.possibleCauseTr : a.possibleCause}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Tab 3: Benchmarking
// ══════════════════════════════════════════════
function BenchmarkTab({
  data,
  isTr,
  lang,
}: {
  data: BenchmarkResponse | null;
  isTr: boolean;
  lang: Lang;
}) {
  if (!data) return null;
  const { benchmarks, profileSummary } = data;

  // Radar chart data
  const radarData = benchmarks.map((b) => ({
    metric: isTr ? b.metricTr : b.metric,
    user: b.percentile,
    peerAvg: 50,
  }));

  // Cosine similarity mock
  const userVector = benchmarks.map((b) => b.userValue);
  const peerVector = benchmarks.map((b) => b.peerAverage);
  const dot = userVector.reduce((sum, v, i) => sum + v * peerVector[i], 0);
  const normU = Math.sqrt(userVector.reduce((s, v) => s + v * v, 0));
  const normP = Math.sqrt(peerVector.reduce((s, v) => s + v * v, 0));
  const cosineSim = normU && normP ? ((dot / (normU * normP)) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Peer Info Card */}
      <div className="rounded-2xl border border-border/40 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-sm font-medium">
              {tx("analytics2.comparedWith", lang)} <span className="font-bold text-emerald-400">{benchmarks[0]?.peerCount.toLocaleString()}</span> {tx("analytics2.similarProfiles", lang)}
            </p>
            <p className="text-xs text-muted-foreground">
              {profileSummary.age ? `${isTr ? "Yas" : "Age"}: ${profileSummary.age} (+-5)` : ""}{" "}
              {profileSummary.gender ? `| ${profileSummary.gender}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">
            {tx("analytics2.profileMatch", lang)}: {cosineSim}%
          </span>
        </div>
      </div>

      {/* Radar Chart + Percentile Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            {tx("analytics2.profileComparison", lang)}
          </h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--border)" opacity={0.4} />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                <Radar name={tx("analytics2.you", lang)} dataKey="user" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Radar name={tx("analytics2.peerAverage", lang)} dataKey="peerAvg" stroke="#6b7280" fill="#6b7280" fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Percentile Bars */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            {tx("analytics2.yourPosition", lang)}
          </h3>
          <div className="space-y-5">
            {benchmarks.map((b) => {
              const zone = b.percentile >= 75 ? "top" : b.percentile >= 25 ? "mid" : "bottom";
              return (
                <div key={b.metric}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{isTr ? b.metricTr : b.metric}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {b.userValue} {b.unit}
                    </span>
                  </div>
                  <div className="relative h-5 rounded-full bg-muted/40 overflow-hidden">
                    {/* Zone backgrounds */}
                    <div className="absolute inset-0 flex">
                      <div className="w-1/4 bg-red-500/10" />
                      <div className="w-1/2 bg-amber-500/5" />
                      <div className="w-1/4 bg-emerald-500/10" />
                    </div>
                    {/* Position marker */}
                    <div
                      className="absolute top-0 h-full w-1 rounded-full shadow-lg transition-all"
                      style={{
                        left: `${b.percentile}%`,
                        backgroundColor: zone === "top" ? "#10b981" : zone === "mid" ? "#f59e0b" : "#ef4444",
                        boxShadow: `0 0 8px ${zone === "top" ? "#10b98180" : zone === "mid" ? "#f59e0b80" : "#ef444480"}`,
                      }}
                    />
                    {/* Percentile text */}
                    <div
                      className="absolute top-0 h-full flex items-center text-[10px] font-bold"
                      style={{
                        left: `${Math.min(Math.max(b.percentile, 8), 88)}%`,
                        transform: "translateX(-50%)",
                        color: zone === "top" ? "#10b981" : zone === "mid" ? "#f59e0b" : "#ef4444",
                      }}
                    >
                      P{b.percentile}
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5 px-0.5">
                    <span>{isTr ? "Alt %10" : "Bottom 10%"}: {b.peerBottom10}</span>
                    <span>{tx("analytics2.peerAverage", lang)}: {b.peerAverage}</span>
                    <span>{tx("analytics2.topPercent", lang)} 10%: {b.peerTop10}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benchmark Message */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-3">
        <Zap className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm">
          {isTr
            ? `Benzer profillere sahip (ayni yas grubu, ayni kosullar) kullanicilar arasinda, bitkisel destek ile kan sekeri regulasyonunda en iyi %${
                benchmarks.find((b) => b.metric === "HbA1c")?.percentile || 20
              } icinde yer aliyorsunuz.`
            : `Among users your age with similar conditions, you are in the top ${
                benchmarks.find((b) => b.metric === "HbA1c")?.percentile || 20
              }% for blood sugar regulation with herbal support.`}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Tab 4: Predictions
// ══════════════════════════════════════════════
function PredictionTab({
  predictions,
  isTr,
  lang,
  timelineData,
  omega3Enabled,
  setOmega3Enabled,
}: {
  predictions: Prediction[] | null;
  isTr: boolean;
  lang: Lang;
  timelineData: TimelineResponse | null;
  omega3Enabled: boolean;
  setOmega3Enabled: (v: boolean) => void;
}) {
  if (!predictions) return null;

  // Build projection chart data for CRP
  const crpPrediction = predictions.find((p) => p.metric === "CRP");
  const last90 = timelineData?.timeline.slice(-90) || [];
  const omega3Data = timelineData?.omega3Simulation || [];

  const projectionChartData: Array<{
    dateLabel: string;
    actual?: number;
    projected?: number;
    omega3?: number;
    upperBound?: number;
    lowerBound?: number;
  }> = [];

  // Actual data (every 3rd day)
  last90.filter((_, i) => i % 3 === 0).forEach((d) => {
    projectionChartData.push({
      dateLabel: formatDate(d.date),
      actual: d.crp,
    });
  });

  // Projected data
  if (crpPrediction) {
    const lastActual = last90[last90.length - 1]?.crp || crpPrediction.currentValue;
    const target3m = crpPrediction.predictedValue3m;
    const confidence = crpPrediction.confidence;
    for (let i = 1; i <= 30; i++) {
      const progress = i / 30;
      const projected = lastActual + (target3m - lastActual) * progress;
      const band = (1 - confidence) * 1.5;
      const date = new Date();
      date.setDate(date.getDate() + i * 3);
      projectionChartData.push({
        dateLabel: formatDate(date.toISOString()),
        projected: Math.round(projected * 100) / 100,
        upperBound: Math.round((projected + band) * 100) / 100,
        lowerBound: Math.round(Math.max(0.3, projected - band) * 100) / 100,
        omega3: omega3Enabled ? Math.round(Math.max(0.4, projected - 0.35 * progress) * 100) / 100 : undefined,
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Projection Chart */}
      <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {tx("analytics2.projection", lang)} — CRP
          </h3>
          {/* What-If Toggle */}
          <button
            onClick={() => setOmega3Enabled(!omega3Enabled)}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              omega3Enabled
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                : "border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className={`h-2 w-2 rounded-full transition-colors ${omega3Enabled ? "bg-cyan-400" : "bg-muted-foreground"}`} />
            {tx("analytics2.addOmega3", lang)}
          </button>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[0, "auto"]} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />

              {/* Confidence band */}
              <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="transparent" />
              <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="#6366f1" fillOpacity={0.08} />

              {/* Actual line */}
              <Area type="monotone" dataKey="actual" name={tx("analytics2.actual", lang)} stroke="#10b981" fill="url(#actualGrad)" strokeWidth={2} dot={false} />

              {/* Projected line */}
              <Line type="monotone" dataKey="projected" name={tx("analytics2.projected", lang)} stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" dot={false} />

              {/* Omega-3 what-if */}
              {omega3Enabled && (
                <Line type="monotone" dataKey="omega3" name="+ Omega-3" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-4 bg-emerald-500 rounded" /> {tx("analytics2.actualData", lang)}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-4 bg-indigo-500 rounded" style={{ backgroundImage: "repeating-linear-gradient(90deg, #6366f1 0, #6366f1 4px, transparent 4px, transparent 7px)" }} /> {tx("analytics2.projectionLabel", lang)}
          </span>
          {omega3Enabled && (
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-4 bg-cyan-500 rounded" /> {tx("analytics2.withOmega3", lang)}
            </span>
          )}
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((p) => {
          const TrendIcon = p.trend === "improving" ? TrendingDown : p.trend === "declining" ? TrendingUp : Minus;
          const trendColor = p.trend === "improving" ? "text-emerald-400" : p.trend === "declining" ? "text-red-400" : "text-amber-400";
          const trendBg = p.trend === "improving" ? "bg-emerald-500/5 border-emerald-500/20" : p.trend === "declining" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20";

          return (
            <div key={p.metric} className={`rounded-2xl border p-5 ${trendBg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">{isTr ? p.metricTr : p.metric}</span>
                <div className="flex items-center gap-1.5">
                  <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                  <span className={`text-xs font-bold ${trendColor}`}>
                    {p.trend === "improving" ? tx("analytics2.improving", lang) : p.trend === "declining" ? tx("analytics2.declining", lang) : tx("analytics2.stable", lang)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{tx("analytics2.now", lang)}</p>
                  <p className="text-lg font-bold font-mono">{p.currentValue}</p>
                  <p className="text-[9px] text-muted-foreground">{p.unit}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{tx("analytics2.3months", lang)}</p>
                  <p className="text-lg font-bold font-mono text-indigo-400">{p.predictedValue3m}</p>
                  <p className="text-[9px] text-muted-foreground">{p.unit}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{tx("analytics2.6months", lang)}</p>
                  <p className="text-lg font-bold font-mono text-purple-400">{p.predictedValue6m}</p>
                  <p className="text-[9px] text-muted-foreground">{p.unit}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <p className="text-muted-foreground max-w-[70%]">{isTr ? p.messageTr : p.message}</p>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {tx("analytics2.confidence", lang)}: {Math.round(p.confidence * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* What-If Simulator Card */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold">{tx("analytics2.whatIf", lang)}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {tx("analytics2.whatIfDesc", lang)}
        </p>
        <button
          onClick={() => setOmega3Enabled(!omega3Enabled)}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${
            omega3Enabled
              ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-400"
              : "border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <span className={`h-3 w-3 rounded-sm border transition-colors ${
            omega3Enabled ? "bg-cyan-500 border-cyan-500" : "border-muted-foreground"
          }`}>
            {omega3Enabled && <span className="block h-full w-full text-white text-[8px] text-center leading-3">&#10003;</span>}
          </span>
          {tx("analytics2.addOmega3", lang)}
        </button>
      </div>
    </div>
  );
}
