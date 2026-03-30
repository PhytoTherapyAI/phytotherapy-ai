// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import { Stethoscope, Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, Activity, Pill, FileText, Brain, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Patient { id: string; name: string; age: number; compliance: number; lastVisit: string; conditions: string[]; risk: "low" | "medium" | "high"; medications: number; }

export default function DoctorDashboardPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [activeTab, setActiveTab] = useState("overview");
  // Patients will be loaded from Supabase via doctor-patient links
  const [patients] = useState<Patient[]>([]);

  const riskColor = (r: string) => r === "high" ? "bg-red-100 text-red-700" : r === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
  const compColor = (c: number) => c >= 90 ? "text-green-600" : c >= 75 ? "text-yellow-600" : "text-red-600";
  const avgCompliance = patients.length > 0 ? Math.round(patients.reduce((s, p) => s + p.compliance, 0) / patients.length) : 0;
  const highRisk = patients.filter(p => p.risk === "high").length;

  const tabs = [
    { id: "overview", label: tx("doctorDash.overview", lang) },
    { id: "patients", label: tx("doctorDash.patientsTab", lang) },
    { id: "ai", label: tx("doctorDash.aiSupport", lang) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Stethoscope className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tx("doctorDash.title", lang)}</h1>
            <p className="text-sm text-gray-500">{tx("doctorDash.subtitle", lang)}</p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">{tx("common.sampleData", lang)}</span>
          <span className="text-xs text-amber-700 dark:text-amber-300">{tx("doctorDash.sampleNote", lang)}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 text-center"><Users className="w-6 h-6 text-indigo-500 mx-auto mb-1" /><div className="text-2xl font-bold">{patients.length}</div><div className="text-xs text-gray-500">{tx("doctorDash.totalPatients", lang)}</div></Card>
          <Card className="p-4 text-center"><CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" /><div className="text-2xl font-bold text-green-600">{avgCompliance}%</div><div className="text-xs text-gray-500">{tx("doctorDash.avgCompliance", lang)}</div></Card>
          <Card className="p-4 text-center"><AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-1" /><div className="text-2xl font-bold text-red-600">{highRisk}</div><div className="text-xs text-gray-500">{tx("common.highRisk", lang)}</div></Card>
          <Card className="p-4 text-center"><Clock className="w-6 h-6 text-orange-500 mx-auto mb-1" /><div className="text-2xl font-bold text-orange-600">2</div><div className="text-xs text-gray-500">{tx("doctorDash.overdueFollowup", lang)}</div></Card>
        </div>

        <div className="flex gap-2 mb-6">{tabs.map(t => (<Button key={t.id} variant={activeTab === t.id ? "default" : "outline"} size="sm" onClick={() => setActiveTab(t.id)}>{t.label}</Button>))}</div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <h3 className="font-semibold text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {tx("doctorDash.needsAttention", lang)}</h3>
              <div className="mt-3 space-y-2">
                {patients.filter(p => p.risk === "high").map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800">
                    <div><span className="font-medium text-sm">{p.name}</span><span className="text-xs text-gray-500 ml-2">{p.conditions.join(", ")}</span></div>
                    <div className="flex items-center gap-2"><span className={compColor(p.compliance) + " text-sm font-bold"}>{p.compliance}%</span><Badge className={riskColor(p.risk)}>{p.risk}</Badge></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-3">{tx("doctorDash.populationOverview", lang)}</h3>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: tx("doctorDash.diabetes", lang), count: 2, color: "bg-blue-100 text-blue-700" }, { label: tx("doctorDash.hypertension", lang), count: 1, color: "bg-purple-100 text-purple-700" }, { label: tx("doctorDash.thyroid", lang), count: 1, color: "bg-teal-100 text-teal-700" }].map(c => (
                  <div key={c.label} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800"><Badge className={c.color}>{c.count}</Badge><div className="text-xs mt-1">{c.label}</div></div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "patients" && (
          <div className="space-y-3">
            {patients.map(p => (
              <Card key={p.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{p.name.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                      <div className="font-medium text-sm">{p.name} <span className="text-gray-400 font-normal">({p.age})</span></div>
                      <div className="flex gap-1 mt-0.5">{p.conditions.map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={compColor(p.compliance) + " text-lg font-bold"}>{p.compliance}%</div>
                    <div className="text-xs text-gray-400">{p.medications} {tx("doctorDash.meds", lang)}</div>
                  </div>
                </div>
                <div className="mt-2"><div className="w-full bg-gray-200 rounded-full h-1.5"><div className={"h-1.5 rounded-full " + (p.compliance >= 90 ? "bg-green-500" : p.compliance >= 75 ? "bg-yellow-500" : "bg-red-500")} style={{ width: p.compliance + "%" }} /></div></div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "ai" && (
          <div className="space-y-4">
            <Card className="p-4 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="font-semibold">{tx("doctorDash.aiSupport", lang)}</h3>
                  <p className="text-sm text-gray-600 mt-1">{tx("doctorDash.aiDesc", lang)}</p>
                </div>
              </div>
            </Card>
            {[
              { patient: "Mehmet K.", alert: isTr ? "Son 30 gunde ilac uyumu %67 - doz basitlestirmesi onerilebilir" : "Compliance at 67% last 30 days - consider dose simplification", type: "warning" },
              { patient: "Ali D.", alert: isTr ? "CKD Stage 3 + 8 ilac - nefrotoksik ilac taramasi onerilir" : "CKD Stage 3 + 8 meds - nephrotoxic drug review recommended", type: "critical" },
              { patient: "Ayse Y.", alert: isTr ? "HbA1c trendi olumlu - mevcut tedavi etkili" : "HbA1c trending positive - current therapy effective", type: "success" },
            ].map((a, i) => (
              <Card key={i} className={"p-4 " + (a.type === "critical" ? "border-red-200 bg-red-50 dark:bg-red-900/20" : a.type === "warning" ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" : "border-green-200 bg-green-50 dark:bg-green-900/20")}>
                <div className="flex items-start gap-3">
                  {a.type === "critical" ? <AlertTriangle className="w-5 h-5 text-red-500" /> : a.type === "warning" ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  <div><span className="font-medium text-sm">{a.patient}</span><p className="text-sm text-gray-600 mt-0.5">{a.alert}</p></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
