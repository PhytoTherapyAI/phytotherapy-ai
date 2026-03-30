// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import { FlaskConical, BarChart3, TrendingUp, Users, Shield, Database, FileText, AlertTriangle, CheckCircle2, PieChart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

export default function PharmaRWEPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [selectedDrug, setSelectedDrug] = useState("metformin");

  const drugs = [
    { id: "metformin", name: "Metformin", patients: 1240, adherence: 87, sideEffects: 12, avgDuration: "18 months" },
    { id: "atorvastatin", name: "Atorvastatin", patients: 980, adherence: 82, sideEffects: 8, avgDuration: "24 months" },
    { id: "amlodipine", name: "Amlodipine", patients: 756, adherence: 79, sideEffects: 15, avgDuration: "36 months" },
    { id: "levothyroxine", name: "Levothyroxine", patients: 534, adherence: 91, sideEffects: 5, avgDuration: "Lifetime" },
  ];

  const drug = drugs.find(d => d.id === selectedDrug) || drugs[0];

  const sideEffects = [
    { en: "GI disturbance", tr: "GI bozuklugu", pct: 23, severity: "mild" },
    { en: "Dizziness", tr: "Bas dönmesi", pct: 12, severity: "mild" },
    { en: "Fatigue", tr: "Yorgunluk", pct: 8, severity: "mild" },
    { en: "Muscle pain", tr: "Kas ağrısi", pct: 5, severity: "moderate" },
    { en: "Hepatic concern", tr: "Karaciger endisesi", pct: 2, severity: "serious" },
  ];

  const sevColor = (s: string) => s === "serious" ? "bg-red-100 text-red-700" : s === "moderate" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FlaskConical className="w-8 h-8 text-teal-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tx("pharmaRwe.title", lang)}</h1>
            <p className="text-sm text-gray-500">{tx("pharmaRwe.subtitle", lang)}</p>
          </div>
          <Badge className="bg-green-100 text-green-700 ml-auto"><Shield className="w-3 h-3 mr-1" />{tx("pharmaRwe.compliant", lang)}</Badge>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-6">
          {drugs.map(d => (<Button key={d.id} variant={selectedDrug === d.id ? "default" : "outline"} size="sm" onClick={() => setSelectedDrug(d.id)}>{d.name}</Button>))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 text-center"><Users className="w-5 h-5 text-teal-500 mx-auto mb-1" /><div className="text-xl font-bold">{drug.patients.toLocaleString()}</div><div className="text-xs text-gray-500">{tx("pharmaRwe.patients", lang)}</div></Card>
          <Card className="p-4 text-center"><Activity className="w-5 h-5 text-blue-500 mx-auto mb-1" /><div className="text-xl font-bold">{drug.adherence}%</div><div className="text-xs text-gray-500">{tx("pharmaRwe.adherence", lang)}</div></Card>
          <Card className="p-4 text-center"><AlertTriangle className="w-5 h-5 text-orange-500 mx-auto mb-1" /><div className="text-xl font-bold">{drug.sideEffects}%</div><div className="text-xs text-gray-500">{tx("pharmaRwe.sideEffects", lang)}</div></Card>
          <Card className="p-4 text-center"><TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" /><div className="text-xl font-bold">{drug.avgDuration}</div><div className="text-xs text-gray-500">{tx("pharmaRwe.avgDuration", lang)}</div></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-4">{tx("pharmaRwe.sideEffectProfile", lang)}</h3>
            <div className="space-y-3">
              {sideEffects.map(se => (
                <div key={se.en} className="flex items-center gap-3">
                  <span className="text-sm flex-1">{isTr ? se.tr : se.en}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2"><div className="bg-teal-500 h-2 rounded-full" style={{ width: se.pct + "%" }} /></div>
                  <span className="text-xs w-8 text-right">{se.pct}%</span>
                  <Badge className={sevColor(se.severity)}>{se.severity}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-4">{tx("pharmaRwe.adherenceTrend", lang)}</h3>
            <div className="flex items-end gap-2 h-40">
              {[82, 84, 83, 86, 85, 87, 88, 87, 89, 88, 90, 87].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-teal-200 dark:bg-teal-900/30 rounded-t" style={{ height: ((val - 75) * 4) + "px" }}><div className="w-full bg-teal-500 rounded-t h-full" /></div>
                  <span className="text-[8px] text-gray-400">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-4 border-teal-200 bg-teal-50 dark:bg-teal-900/20">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-teal-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">{tx("pharmaRwe.methodology", lang)}</h3>
              <p className="text-xs text-gray-600 mt-1">{tx("pharmaRwe.methodologyDesc", lang)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
