// © 2026 Doctopal — All Rights Reserved
// Clinical Insights Header — Action-first triage + sparkline KPIs + donut distribution

"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ArrowRight, X, Sparkles } from "lucide-react";

// ── Sparkline (SVG micro-chart) ──
function Sparkline({ data, color = "#3c7a52", width = 60, height = 20 }: {
  data: number[]; color?: string; width?: number; height?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} opacity={0.6} />
    </svg>
  );
}

// ── Donut Chart (SVG) ──
function DonutChart({ segments, size = 100 }: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-muted, #e5e7eb)" strokeWidth={8} />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashArray = `${circ * pct} ${circ * (1 - pct)}`;
        const dashOffset = -offset * circ;
        offset += pct;
        return (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={seg.color} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={dashArray} strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            className="transition-all duration-700" />
        );
      })}
    </svg>
  );
}

// ── Triage Alert Pills ──
interface TriageAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  text: string;
  count?: number;
}

interface KPIData {
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "flat";
  trendGood: boolean;
  sparkline: number[];
}

interface DiseaseSegment {
  label: string;
  value: number;
  color: string;
}

interface ClinicalInsightsHeaderProps {
  alerts?: TriageAlert[];
  kpis?: KPIData[];
  diseases?: DiseaseSegment[];
  lang: "en" | "tr";
}

export function ClinicalInsightsHeader({ alerts = [], kpis = [], diseases = [], lang }: ClinicalInsightsHeaderProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const isTr = lang === "tr";
  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

  const severityColor = {
    critical: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300",
    warning: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300",
    info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300",
  };

  return (
    <div className="space-y-4 mb-6">
      {/* ── Triage Alerts (scrollable pills) ── */}
      {visibleAlerts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {visibleAlerts.map((alert) => (
            <div key={alert.id} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${severityColor[alert.severity]}`}>
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{alert.text}</span>
              {alert.count && (
                <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[9px] font-bold">
                  {alert.count}
                </span>
              )}
              <ArrowRight className="h-3 w-3 shrink-0 opacity-60" />
              <button onClick={() => setDismissedAlerts(p => new Set([...p, alert.id]))}
                className="shrink-0 opacity-40 hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── KPI Cards with Sparklines ── */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {kpis.map((kpi, i) => {
            const trendColor = kpi.trendGood ? "text-emerald-500" : "text-red-500";
            const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
            const sparkColor = kpi.trendGood ? "#22c55e" : "#ef4444";

            return (
              <div key={i} className="rounded-2xl border bg-card p-3 shadow-soft"
                style={{ animation: `fadeUp 0.4s ease-out ${i * 80}ms both` }}>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <div className="flex items-end justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-bold ${kpi.trendGood ? "text-foreground" : "text-red-500"}`}>{kpi.value}</span>
                    <span className="text-[10px] text-muted-foreground">{kpi.unit}</span>
                  </div>
                  <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
                </div>
                {/* Sparkline */}
                {kpi.sparkline.length > 0 && (
                  <div className="mt-1.5">
                    <Sparkline data={kpi.sparkline} color={sparkColor} width={80} height={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Disease Distribution Donut ── */}
      {diseases.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-soft">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            {isTr ? "Hastalık Dağılımı" : "Disease Distribution"}
          </h3>
          <div className="flex items-center gap-4">
            <DonutChart segments={diseases} size={90} />
            <div className="flex-1 space-y-1.5">
              {diseases.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs flex-1">{d.label}</span>
                  <span className="text-xs font-bold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
