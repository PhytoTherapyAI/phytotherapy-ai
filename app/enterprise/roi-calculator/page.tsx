"use client";

import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Users, Heart, BarChart3, ArrowRight, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

export default function ROICalculatorPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [employees, setEmployees] = useState(500);
  const [avgClaim, setAvgClaim] = useState(2500);
  const [showResults, setShowResults] = useState(false);

  const annualCost = employees * avgClaim;
  const savings15 = Math.round(annualCost * 0.15);
  const savings25 = Math.round(annualCost * 0.25);
  const platformCost = employees * 8 * 12;
  const netROI15 = savings15 - platformCost;
  const netROI25 = savings25 - platformCost;
  const roiPct = Math.round((netROI15 / platformCost) * 100);

  const benefits = [
    { en: "Medication compliance monitoring", tr: "İlaç uyum takibi", pct: "23%" },
    { en: "Early intervention alerts", tr: "Erken mudahale uyarıları", pct: "18%" },
    { en: "Preventive health screening", tr: "Onleyici saglik taramasi", pct: "15%" },
    { en: "Drug interaction prevention", tr: "İlaç etkilesimi onleme", pct: "12%" },
    { en: "Employee engagement boost", tr: "Calisan katilimi artisi", pct: "31%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "ROI Hesaplayici" : "ROI Calculator"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "Sigorta ve kurumsal saglik yatirimi getirisi" : "Insurance & corporate health investment returns"}</p>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{isTr ? "Sirket Bilgileri" : "Company Details"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">{isTr ? "Calisan Sayisi" : "Number of Employees"}</label>
              <input className="w-full rounded-lg border px-4 py-3 text-lg font-bold mt-1 dark:bg-gray-800 dark:border-gray-700" type="number" value={employees} onChange={e => setEmployees(Number(e.target.value))} />
              <input type="range" min="50" max="10000" step="50" value={employees} onChange={e => setEmployees(Number(e.target.value))} className="w-full mt-2" />
            </div>
            <div>
              <label className="text-sm text-gray-500">{isTr ? "Yıllık Ort. Sağlık Maliyeti / Calisan (TL)" : "Avg Annual Health Cost / Employee (TL)"}</label>
              <input className="w-full rounded-lg border px-4 py-3 text-lg font-bold mt-1 dark:bg-gray-800 dark:border-gray-700" type="number" value={avgClaim} onChange={e => setAvgClaim(Number(e.target.value))} />
              <input type="range" min="500" max="10000" step="100" value={avgClaim} onChange={e => setAvgClaim(Number(e.target.value))} className="w-full mt-2" />
            </div>
          </div>
          <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600" onClick={() => setShowResults(true)}>{isTr ? "ROI Hesapla" : "Calculate ROI"} <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </Card>

        {showResults && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-4 text-center"><DollarSign className="w-6 h-6 text-gray-400 mx-auto mb-1" /><div className="text-xs text-gray-500">{isTr ? "Yıllık Sağlık Maliyeti" : "Annual Health Cost"}</div><div className="text-lg font-bold">{(annualCost/1000).toFixed(0)}K TL</div></Card>
              <Card className="p-4 text-center border-green-200 bg-green-50 dark:bg-green-900/20"><TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" /><div className="text-xs text-gray-500">{isTr ? "Tahmini Tasarruf" : "Est. Savings"}</div><div className="text-lg font-bold text-green-600">{(savings15/1000).toFixed(0)}K-{(savings25/1000).toFixed(0)}K TL</div></Card>
              <Card className="p-4 text-center"><Building2 className="w-6 h-6 text-indigo-400 mx-auto mb-1" /><div className="text-xs text-gray-500">{isTr ? "Platform Maliyeti" : "Platform Cost"}</div><div className="text-lg font-bold">{(platformCost/1000).toFixed(0)}K TL/{isTr ? "yil" : "yr"}</div></Card>
              <Card className="p-4 text-center border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20"><BarChart3 className="w-6 h-6 text-emerald-500 mx-auto mb-1" /><div className="text-xs text-gray-500">{isTr ? "Net ROI" : "Net ROI"}</div><div className="text-lg font-bold text-emerald-600">{roiPct}%</div></Card>
            </div>

            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-sm mb-4">{isTr ? "Tasarruf Kaynaklari" : "Savings Sources"}</h3>
              <div className="space-y-3">
                {benefits.map(b => (
                  <div key={b.en} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm flex-1">{isTr ? b.tr : b.en}</span>
                    <Badge className="bg-emerald-100 text-emerald-700">{b.pct}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <h3 className="font-bold text-lg mb-2">{isTr ? "Demo Talep Edin" : "Request a Demo"}</h3>
              <p className="text-sm text-gray-600 mb-4">{isTr ? "Kurumunuza ozel detayli ROI analizi icin ekibimizle gorusun." : "Talk to our team for a detailed ROI analysis tailored to your organization."}</p>
              <Button className="bg-emerald-600 hover:bg-emerald-700">{isTr ? "Bize Ulasin" : "Contact Us"}</Button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}