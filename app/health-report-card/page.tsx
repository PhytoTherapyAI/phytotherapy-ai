// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, TrendingUp, TrendingDown, Download, CheckCircle2, Target, BarChart3, Minus, AlertCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";

export default function HealthReportCardPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const { user, isAuthenticated } = useAuth();
  const [selectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState({ medication: 0, supplements: 0, checkups: 0, bloodTests: 0, goals: 0 });
  const [labTrends, setLabTrends] = useState<{ name: string; values: number[]; unit: string; trend: "up" | "down"; good: boolean }[]>([]);
  const [goals, setGoals] = useState<{ en: string; tr: string; status: "completed" | "in_progress" | "not_started" }[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const supabase = createBrowserClient();
    try {
      const yearStart = `${selectedYear}-01-01`;
      const yearEnd = `${selectedYear}-12-31`;

      const [bloodRes, queryRes] = await Promise.all([
        supabase.from("blood_tests").select("test_data, created_at").eq("user_id", user.id).gte("created_at", yearStart).lte("created_at", yearEnd).order("created_at", { ascending: true }),
        supabase.from("query_history").select("query_type").eq("user_id", user.id).gte("created_at", yearStart).lte("created_at", yearEnd),
      ]);

      const bloodTests = bloodRes.data || [];
      const queries = queryRes.data || [];

      setComplianceData({
        medication: 0,
        supplements: 0,
        checkups: queries.filter(q => q.query_type === "symptom").length,
        bloodTests: bloodTests.length,
        goals: 0,
      });

      // Extract lab trends from blood tests
      if (bloodTests.length > 0) {
        const markerMap: Record<string, { values: number[]; unit: string }> = {};
        for (const bt of bloodTests) {
          const data = bt.test_data as Record<string, number> | null;
          if (!data) continue;
          for (const [key, val] of Object.entries(data)) {
            if (typeof val !== "number") continue;
            if (!markerMap[key]) markerMap[key] = { values: [], unit: "" };
            markerMap[key].values.push(val);
          }
        }
        const trends = Object.entries(markerMap)
          .filter(([, v]) => v.values.length >= 2)
          .slice(0, 6)
          .map(([name, v]) => {
            const last = v.values[v.values.length - 1];
            const prev = v.values[v.values.length - 2];
            return { name, values: v.values.slice(-4), unit: v.unit || "", trend: (last > prev ? "up" : "down") as "up" | "down", good: true };
          });
        setLabTrends(trends);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [user, selectedYear]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const trendIcon = (t: string) => t === "up" ? <TrendingUp className="w-4 h-4" /> : t === "down" ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />;
  const statusBadge = (s: string) => s === "completed" ? <Badge className="bg-green-100 text-green-700">{tx("reportCard.completed", lang)}</Badge> : s === "in_progress" ? <Badge className="bg-yellow-100 text-yellow-700">{tx("reportCard.inProgress", lang)}</Badge> : <Badge className="bg-gray-100 text-gray-500">{tx("reportCard.notStarted", lang)}</Badge>;

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center p-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isTr ? "Sağlık raporunuzu görmek için giriş yapın." : "Sign in to view your health report."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tx("reportCard.title", lang)}</h1>
              <p className="text-sm text-gray-500">{selectedYear} {tx("reportCard.summaryReport", lang)}</p>
            </div>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> PDF</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-emerald-600">{complianceData.medication}%</div><div className="text-xs text-gray-500">{tx("reportCard.medCompliance", lang)}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-blue-600">{complianceData.supplements}%</div><div className="text-xs text-gray-500">{tx("reportCard.supplement", lang)}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-purple-600">{complianceData.checkups}</div><div className="text-xs text-gray-500">{tx("reportCard.checkups", lang)}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-orange-600">{complianceData.bloodTests}</div><div className="text-xs text-gray-500">{tx("reportCard.bloodTests", lang)}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-pink-600">{complianceData.goals}/{goals.length}</div><div className="text-xs text-gray-500">{tx("reportCard.goalsMet", lang)}</div></Card>
        </div>

        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" /> {tx("reportCard.labTrends", lang)}</h2>
          <div className="space-y-3">
            {labTrends.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">{isTr ? "Henüz kan tahlili verisi yok. Kan tahlili yükleyin." : "No lab data yet. Upload a blood test."}</p>
            )}
            {labTrends.map(lab => (
              <div key={lab.name} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="w-32 font-medium text-sm">{lab.name}</div>
                <div className="flex-1 flex items-center gap-2">
                  {lab.values.map((v, i) => (<span key={i} className={"text-xs px-2 py-1 rounded " + (i === lab.values.length - 1 ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-gray-100 text-gray-600")}>{v}</span>))}
                </div>
                <span className="text-xs text-gray-400">{lab.unit}</span>
                <div className={"flex items-center gap-1 " + (lab.good ? "text-green-600" : "text-red-600")}>{trendIcon(lab.trend)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-emerald-600" /> {tx("reportCard.healthGoals", lang)}</h2>
          <div className="space-y-3">
            {goals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">{isTr ? "Henüz sağlık hedefi belirlenmemiş." : "No health goals set yet."}</p>
            )}
            {goals.map((g, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {g.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                  <span className={"text-sm " + (g.status === "completed" ? "line-through text-gray-400" : "")}>{isTr ? g.tr : g.en}</span>
                </div>
                {statusBadge(g.status)}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-semibold">{tx("reportCard.overallAssessment", lang)}</h3>
              <p className="text-sm text-gray-600 mt-1">{tx("reportCard.overallText", lang)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
