"use client";

import { useState } from "react";
import { Droplets, Calendar, AlertTriangle, Clock, Plus, Check, Pill, Apple, TrendingUp, Beaker, GlassWater, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface DialysisSession { id: string; date: string; type: "HD" | "PD"; duration: number; weightPre: number; weightPost: number; bpPre: string; bpPost: string; notes: string; }

const FOOD_GUIDE = [
  { en: "Bananas", tr: "Muz", potassium: "high", phosphorus: "low", safe: false },
  { en: "Apples", tr: "Elma", potassium: "low", phosphorus: "low", safe: true },
  { en: "Oranges", tr: "Portakal", potassium: "high", phosphorus: "low", safe: false },
  { en: "Rice", tr: "Pirinc", potassium: "low", phosphorus: "medium", safe: true },
  { en: "Cheese", tr: "Peynir", potassium: "low", phosphorus: "high", safe: false },
  { en: "Eggs", tr: "Yumurta", potassium: "low", phosphorus: "medium", safe: true },
  { en: "Tomatoes", tr: "Domates", potassium: "high", phosphorus: "low", safe: false },
  { en: "Chicken breast", tr: "Tavuk gogsu", potassium: "medium", phosphorus: "medium", safe: true },
  { en: "Milk", tr: "Sut", potassium: "medium", phosphorus: "high", safe: false },
  { en: "White bread", tr: "Beyaz ekmek", potassium: "low", phosphorus: "low", safe: true },
  { en: "Potatoes", tr: "Patates", potassium: "high", phosphorus: "low", safe: false },
  { en: "Strawberries", tr: "Cilek", potassium: "low", phosphorus: "low", safe: true },
];

const MEDICATIONS = [
  { name: "Phosphate Binders", tr: "Fosfat Baglayicilar", timing: "With meals", timingTr: "Yemekle birlikte", icon: <Pill className="w-4 h-4" /> },
  { name: "EPO Injection", tr: "EPO Enjeksiyonu", timing: "During dialysis", timingTr: "Diyaliz sirasinda", icon: <Beaker className="w-4 h-4" /> },
  { name: "Iron Supplement", tr: "Demir Takviyesi", timing: "Empty stomach", timingTr: "Bos karina", icon: <Pill className="w-4 h-4" /> },
  { name: "Calcium Supplement", tr: "Kalsiyum Takviyesi", timing: "Between meals", timingTr: "Ogununler arasi", icon: <Pill className="w-4 h-4" /> },
  { name: "Blood Pressure Med", tr: "Tansiyon İlacı", timing: "Morning, skip dialysis day", timingTr: "Sabah, diyaliz gunu atla", icon: <Pill className="w-4 h-4" /> },
];

export default function DialysisTrackerPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [activeTab, setActiveTab] = useState("sessions");
  const [fluidIntake, setFluidIntake] = useState(400);
  const fluidLimit = 1000;
  const [sessions] = useState<DialysisSession[]>([
    { id: "1", date: "2026-03-28", type: "HD", duration: 240, weightPre: 72.5, weightPost: 70.1, bpPre: "150/90", bpPost: "130/80", notes: "Session went well" },
    { id: "2", date: "2026-03-26", type: "HD", duration: 240, weightPre: 73.0, weightPost: 70.3, bpPre: "145/88", bpPost: "128/78", notes: "Slight cramping at end" },
    { id: "3", date: "2026-03-24", type: "HD", duration: 240, weightPre: 72.8, weightPost: 70.0, bpPre: "148/92", bpPost: "132/82", notes: "Normal" },
  ]);

  const tabs = [
    { id: "sessions", icon: <Calendar className="w-4 h-4" />, label: isTr ? "Seanslar" : "Sessions" },
    { id: "fluid", icon: <GlassWater className="w-4 h-4" />, label: isTr ? "Sivi Takibi" : "Fluid Tracking" },
    { id: "food", icon: <Apple className="w-4 h-4" />, label: isTr ? "Besin Rehberi" : "Food Guide" },
    { id: "meds", icon: <Pill className="w-4 h-4" />, label: isTr ? "İlaç Zamanlama" : "Medication Timing" },
  ];

  const levelColor = (l: string) => l === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30" : l === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30" : "bg-green-100 text-green-700 dark:bg-green-900/30";
  const fluidPct = Math.round((fluidIntake / fluidLimit) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Droplets className="w-8 h-8 text-cyan-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Diyaliz Takipci" : "Dialysis Tracker"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "Seans, sivi ve beslenme takibi" : "Session, fluid, and nutrition tracking"}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map(tab => (<Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} size="sm" onClick={() => setActiveTab(tab.id)} className="flex items-center gap-1.5 whitespace-nowrap">{tab.icon} {tab.label}</Button>))}
        </div>

        {activeTab === "sessions" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Card className="p-4 text-center"><div className="text-2xl font-bold text-cyan-600">{sessions.length}</div><div className="text-xs text-gray-500">{isTr ? "Bu ay seanslar" : "Sessions this month"}</div></Card>
              <Card className="p-4 text-center"><div className="text-2xl font-bold text-green-600">2.4 kg</div><div className="text-xs text-gray-500">{isTr ? "Ort. sivi cekimi" : "Avg. fluid removal"}</div></Card>
              <Card className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">4h</div><div className="text-xs text-gray-500">{isTr ? "Seans suresi" : "Session duration"}</div></Card>
            </div>
            {sessions.map(s => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="font-medium text-sm">{s.date}</span></div>
                  <Badge className="bg-cyan-100 text-cyan-700">{s.type} - {s.duration} min</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div><span className="text-xs text-gray-500">{isTr ? "On Kilo" : "Pre Weight"}</span><div className="font-semibold text-sm">{s.weightPre} kg</div></div>
                  <div><span className="text-xs text-gray-500">{isTr ? "Son Kilo" : "Post Weight"}</span><div className="font-semibold text-sm">{s.weightPost} kg</div></div>
                  <div><span className="text-xs text-gray-500">{isTr ? "On TA" : "Pre BP"}</span><div className="font-semibold text-sm">{s.bpPre}</div></div>
                  <div><span className="text-xs text-gray-500">{isTr ? "Son TA" : "Post BP"}</span><div className="font-semibold text-sm">{s.bpPost}</div></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{s.notes}</p>
              </Card>
            ))}
            <Card className="p-4 border-dashed border-2 flex items-center justify-center gap-2 text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"><Plus className="w-4 h-4" /> {isTr ? "Yeni seans ekle" : "Add new session"}</Card>
          </div>
        )}

        {activeTab === "fluid" && (
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <h2 className="text-lg font-semibold mb-4">{isTr ? "Günlük Sivi Alimi" : "Daily Fluid Intake"}</h2>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" /><circle cx="50" cy="50" r="45" fill="none" stroke={fluidPct > 90 ? "#ef4444" : "#06b6d4"} strokeWidth="8" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={2 * Math.PI * 45 * (1 - fluidPct / 100)} strokeLinecap="round" /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold">{fluidIntake}</span><span className="text-xs text-gray-500">/ {fluidLimit} ml</span></div>
              </div>
              {fluidPct > 80 && <Card className="p-3 border-red-200 bg-red-50 dark:bg-red-900/20 mb-4"><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-600">{isTr ? "Sivi limitinize yaklasiyorsunuz!" : "Approaching your fluid limit!"}</span></div></Card>}
              <div className="flex gap-2 justify-center flex-wrap">
                {[100, 150, 200, 250].map(ml => (<Button key={ml} variant="outline" size="sm" onClick={() => setFluidIntake(prev => Math.min(prev + ml, fluidLimit + 200))}> +{ml}ml</Button>))}
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFluidIntake(0)}>{isTr ? "Sifirla" : "Reset"}</Button>
            </Card>
          </div>
        )}

        {activeTab === "food" && (
          <div className="space-y-4">
            <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <h2 className="text-lg font-semibold mb-1">{isTr ? "Potasyum & Fosfor Rehberi" : "Potassium & Phosphorus Guide"}</h2>
              <p className="text-sm text-gray-600">{isTr ? "Diyaliz hastalari için besin rehberi" : "Nutrition guide for dialysis patients"}</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FOOD_GUIDE.map((food, i) => (
                <Card key={i} className={"p-3 flex items-center gap-3 " + (food.safe ? "border-green-200" : "border-red-200")}>
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-lg " + (food.safe ? "bg-green-100" : "bg-red-100")}>{food.safe ? <Check className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}</div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{isTr ? food.tr : food.en}</span>
                    <div className="flex gap-1 mt-1"><Badge className={levelColor(food.potassium)}>K: {food.potassium}</Badge><Badge className={levelColor(food.phosphorus)}>P: {food.phosphorus}</Badge></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "meds" && (
          <div className="space-y-4">
            <Card className="p-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
              <h2 className="text-lg font-semibold mb-1">{isTr ? "Diyaliz İlaç Zamanlama" : "Dialysis Medication Timing"}</h2>
              <p className="text-sm text-gray-600">{isTr ? "İlaçlarinizi doğru zamanda alin" : "Take your medications at the right time"}</p>
            </Card>
            {MEDICATIONS.map((med, i) => (
              <Card key={i} className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">{med.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{isTr ? med.tr : med.name}</div>
                  <div className="flex items-center gap-1 mt-1"><Clock className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500">{isTr ? med.timingTr : med.timing}</span></div>
                </div>
                <Badge variant="outline">{isTr ? "Aktif" : "Active"}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}