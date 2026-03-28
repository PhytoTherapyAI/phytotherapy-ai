"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Users, Activity, Pill, Heart, AlertTriangle, CheckCircle2, PieChart, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

export default function DoctorAnalyticsPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [period, setPeriod] = useState("30d");

  const metrics = [
    { en: "Avg HbA1c", tr: "Ort. HbA1c", value: "6.8%", change: -0.3, good: true },
    { en: "Avg LDL", tr: "Ort. LDL", value: "128 mg/dL", change: -8, good: true },
    { en: "Compliance Rate", tr: "Uyum Orani", value: "82%", change: 5, good: true },
    { en: "Missed Doses", tr: "Kacirilan Doz", value: "14", change: -3, good: true },
  ];

  const conditions = [
    { name: "Type 2 Diabetes", tr: "Tip 2 Diyabet", count: 12, pct: 35, color: "bg-blue-500" },
    { name: "Hypertension", tr: "Hipertansiyon", count: 10, pct: 29, color: "bg-purple-500" },
    { name: "Hyperlipidemia", tr: "Hiperlipidemi", count: 8, pct: 24, color: "bg-orange-500" },
    { name: "Hypothyroidism", tr: "Hipotiroidi", count: 4, pct: 12, color: "bg-teal-500" },
  ];

  const topMeds = [
    { name: "Metformin", patients: 10, compliance: 88 },
    { name: "Atorvastatin", patients: 8, compliance: 82 },
    { name: "Amlodipine", patients: 7, compliance: 79 },
    { name: "Levothyroxine", patients: 4, compliance: 92 },
    { name: "Metoprolol", patients: 6, compliance: 75 },
  ];

  const alerts = [
    { en: "3 patients with HbA1c > 8%", tr: "3 hasta HbA1c > 8%", type: "warning" },
    { en: "2 patients missed follow-up", tr: "2 hasta kontrol kacirdi", type: "warning" },
    { en: "1 critical drug interaction detected", tr: "1 kritik ilac etkilesimi tespit edildi", type: "critical" },
    { en: "5 patients improved this month", tr: "5 hasta bu ay iyilesti", type: "success" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-violet-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Hasta Analitigi" : "Patient Analytics"}</h1>
              <p className="text-sm text-gray-500">{isTr ? "Populasyon saglik gostergeleri" : "Population health indicators"}</p>
            </div>
          </div>
          <div className="flex gap-1">{["7d", "30d", "90d"].map(p => (<Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>{p}</Button>))}</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {metrics.map(m => (
            <Card key={m.en} className="p-4">
              <div className="text-xs text-gray-500">{isTr ? m.tr : m.en}</div>
              <div className="text-2xl font-bold mt-1">{m.value}</div>
              <div className={"flex items-center gap-1 text-xs mt-1 " + (m.good ? "text-green-600" : "text-red-600")}>{m.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{m.change > 0 ? "+" : ""}{m.change}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><PieChart className="w-4 h-4" /> {isTr ? "Hastalik Dagilimi" : "Condition Distribution"}</h3>
            <div className="space-y-3">
              {conditions.map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className={"w-3 h-3 rounded-full " + c.color} />
                  <span className="text-sm flex-1">{isTr ? c.tr : c.name}</span>
                  <Badge variant="outline">{c.count}</Badge>
                  <span className="text-xs text-gray-400 w-8">{c.pct}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Pill className="w-4 h-4" /> {isTr ? "En Çok Kullanilan Ilaclar" : "Top Medications"}</h3>
            <div className="space-y-3">
              {topMeds.map(m => (
                <div key={m.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium flex-1">{m.name}</span>
                  <span className="text-xs text-gray-500">{m.patients} {isTr ? "hasta" : "pts"}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5"><div className={"h-1.5 rounded-full " + (m.compliance >= 85 ? "bg-green-500" : "bg-yellow-500")} style={{ width: m.compliance + "%" }} /></div>
                  <span className="text-xs font-medium w-8">{m.compliance}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {isTr ? "Uyarilar ve Bildirimler" : "Alerts & Notifications"}</h3>
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={"flex items-center gap-3 p-3 rounded-lg " + (a.type === "critical" ? "bg-red-50 dark:bg-red-900/20" : a.type === "warning" ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-green-50 dark:bg-green-900/20")}>
                {a.type === "critical" ? <AlertTriangle className="w-4 h-4 text-red-500" /> : a.type === "warning" ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                <span className="text-sm">{isTr ? a.tr : a.en}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}