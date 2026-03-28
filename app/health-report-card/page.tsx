"use client";

import { useState } from "react";
import { FileText, TrendingUp, TrendingDown, Award, Calendar, Download, Heart, Activity, Pill, CheckCircle2, Target, BarChart3, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

export default function HealthReportCardPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [selectedYear] = useState(2026);

  const complianceData = { medication: 92, supplements: 78, checkups: 3, bloodTests: 4, goals: 5 };
  const labTrends = [
    { name: "HbA1c", values: [7.2, 6.9, 6.5, 6.3], unit: "%", trend: "down" as const, good: true },
    { name: "LDL Cholesterol", values: [145, 138, 125, 118], unit: "mg/dL", trend: "down" as const, good: true },
    { name: "Vitamin D", values: [18, 24, 32, 38], unit: "ng/mL", trend: "up" as const, good: true },
    { name: "Ferritin", values: [12, 15, 22, 28], unit: "ng/mL", trend: "up" as const, good: true },
    { name: "TSH", values: [4.2, 3.8, 3.5, 3.2], unit: "mIU/L", trend: "down" as const, good: true },
    { name: "CRP", values: [2.1, 1.8, 1.2, 0.8], unit: "mg/L", trend: "down" as const, good: true },
  ];
  const goals = [
    { en: "Lower HbA1c below 6.5%", tr: "HbA1c 6.5 altina dusur", status: "completed" as const },
    { en: "Vitamin D above 30 ng/mL", tr: "D Vitamini 30 uzerine cikar", status: "completed" as const },
    { en: "Exercise 3x per week", tr: "Haftada 3 kez egzersiz", status: "in_progress" as const },
    { en: "Reduce processed food", tr: "Islenmiis gida azalt", status: "in_progress" as const },
    { en: "Sleep 7+ hours daily", tr: "Günlük 7+ saat uyku", status: "not_started" as const },
  ];
  const trendIcon = (t: string) => t === "up" ? <TrendingUp className="w-4 h-4" /> : t === "down" ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />;
  const statusBadge = (s: string) => s === "completed" ? <Badge className="bg-green-100 text-green-700">{isTr ? "Tamamlandı" : "Completed"}</Badge> : s === "in_progress" ? <Badge className="bg-yellow-100 text-yellow-700">{isTr ? "Devam Ediyor" : "In Progress"}</Badge> : <Badge className="bg-gray-100 text-gray-500">{isTr ? "Başlamadı" : "Not Started"}</Badge>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Yıllık Sağlık Raporu" : "Annual Health Report"}</h1>
              <p className="text-sm text-gray-500">{selectedYear} {isTr ? "ozet rapor" : "summary report"}</p>
            </div>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> PDF</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-emerald-600">{complianceData.medication}%</div><div className="text-xs text-gray-500">{isTr ? "İlaç Uyumu" : "Med Compliance"}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-blue-600">{complianceData.supplements}%</div><div className="text-xs text-gray-500">{isTr ? "Takviye Uyumu" : "Supplement"}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-purple-600">{complianceData.checkups}</div><div className="text-xs text-gray-500">{isTr ? "Doktor Ziyareti" : "Checkups"}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-orange-600">{complianceData.bloodTests}</div><div className="text-xs text-gray-500">{isTr ? "Kan Tahlili" : "Blood Tests"}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-pink-600">{complianceData.goals}/{goals.length}</div><div className="text-xs text-gray-500">{isTr ? "Hedef" : "Goals Met"}</div></Card>
        </div>

        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" /> {isTr ? "Laboratuvar Trendleri" : "Lab Trends"}</h2>
          <div className="space-y-3">
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
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-emerald-600" /> {isTr ? "Sağlık Hedefleri" : "Health Goals"}</h2>
          <div className="space-y-3">
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
              <h3 className="font-semibold">{isTr ? "Genel Değerlendirme" : "Overall Assessment"}</h3>
              <p className="text-sm text-gray-600 mt-1">{isTr ? "Sağlık gostergeleriniz genel olarak olumlu yonde ilerliyor. HbA1c ve kolesterol degerlerinizdeki dusus dikkat cekici. D vitamini hedefinize ulastiniz. Egzersiz aliskanligi ve uyku duzeni konusunda gelisme alani var." : "Your health indicators are trending positively overall. The decline in HbA1c and cholesterol is notable. You reached your Vitamin D target. There is room for improvement in exercise habits and sleep patterns."}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}