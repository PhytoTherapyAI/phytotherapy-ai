// © 2026 DoctoPal — All Rights Reserved
// Blood test trend visualisation — fetches /api/blood-test-trends and renders
// one mini LineChart per parameter with status-coloured dots.
"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from "recharts";
import { useAuth } from "@/lib/auth-context";
import { useActiveProfile } from "@/lib/use-active-profile";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Loader2, Activity, ShieldAlert } from "lucide-react";

type Range = "3m" | "1y" | "all";

interface TrendValue { date: string; value: number; unit: string; status: string }
interface TrendSeries { parameter: string; values: TrendValue[] }
interface TrendResponse { success: boolean; testCount: number; range: string; series: TrendSeries[] }

const STATUS_COLOR: Record<string, string> = {
  normal: "#16a34a",
  high: "#dc2626",
  low: "#d97706",
  critical: "#991b1b",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function computeTrend(values: TrendValue[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";
  const last = values[values.length - 1].value;
  const prev = values[values.length - 2].value;
  if (prev === 0) return "stable";
  const delta = ((last - prev) / prev) * 100;
  if (delta > 5) return "up";
  if (delta < -5) return "down";
  return "stable";
}

interface StatusDotProps { cx?: number; cy?: number; payload?: { status?: string } }

function StatusDot({ cx, cy, payload }: StatusDotProps) {
  if (cx == null || cy == null) return null;
  const fill = STATUS_COLOR[payload?.status || "normal"] || STATUS_COLOR.normal;
  return <Dot cx={cx} cy={cy} r={4} fill={fill} stroke="#fff" strokeWidth={1.5} />;
}

export function BloodTestTrendChart() {
  const { isAuthenticated, session } = useAuth();
  const { isOwnProfile } = useActiveProfile();
  const { lang } = useLang();
  const [range, setRange] = useState<Range>("1y");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !session?.access_token) return;
    setLoading(true);
    setError(null);
    fetch(`/api/blood-test-trends?range=${range}&limit=10`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`status ${r.status}`);
        return r.json();
      })
      .then((json: TrendResponse) => setData(json))
      .catch((e) => setError(e instanceof Error ? e.message : "fetch failed"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, session?.access_token, range]);

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{tx("trends.authRequired", lang)}</p>
      </Card>
    );
  }

  // KVKK: trend geçmişi login user'ın kan tahlili arşivini çeker; aile üyesi
  // profilindeyken aile üyesi adına trend göstermiyoruz (ve İpek'in kendi
  // trendlerini Taha'nın ekranında da göstermemeliyiz).
  if (!isOwnProfile) {
    const tr = lang === "tr";
    return (
      <Card className="p-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {tr ? "Trend geçmişi görüntülenemez" : "Trend history unavailable"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {tr
                ? "Kan tahlili trend geçmişi kişisel veri içerir. Kendi profilinizi aktif ettiğinizde geçmiş testleriniz burada listelenir."
                : "Blood test trends contain personal history. Switch back to your own profile to see your tests."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Range filter */}
      <div className="flex flex-wrap gap-2">
        {(["3m", "1y", "all"] as const).map((r) => (
          <Button
            key={r}
            size="sm"
            variant={range === r ? "default" : "outline"}
            onClick={() => setRange(r)}
          >
            {r === "3m" ? tx("trends.last3Months", lang) : r === "1y" ? tx("trends.lastYear", lang) : tx("common.all", lang)}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <Card className="p-4 text-sm text-red-600">
          {tx("trends.loadError", lang)}: {error}
        </Card>
      )}

      {!loading && !error && data && data.series.length === 0 && (
        <Card className="p-8 text-center">
          <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{tx("trends.noData", lang)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {tx("trends.noDataHint", lang)} ({data.testCount} {tx("trends.testsFound", lang)})
          </p>
        </Card>
      )}

      {!loading && !error && data && data.series.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.series.map((s) => {
            const chartData = s.values.map((v) => ({
              ...v,
              dateLabel: formatDate(v.date),
            }));
            const latest = s.values[s.values.length - 1];
            const trend = computeTrend(s.values);
            const unit = s.values.find((v) => v.unit)?.unit || "";
            return (
              <Card key={s.parameter} className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.parameter}</p>
                    <p className="text-xs text-muted-foreground">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLOR[latest.status] }}
                      />{" "}
                      {latest.value}
                      {unit ? ` ${unit}` : ""} · {s.values.length} {tx("trends.points", lang)}
                    </p>
                  </div>
                  {trend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
                  {trend === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
                  {trend === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 6, padding: 4 }}
                        formatter={(value) => [`${value}${unit ? ` ${unit}` : ""}`, s.parameter]}
                        labelFormatter={(label) => String(label)}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={<StatusDot />}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
