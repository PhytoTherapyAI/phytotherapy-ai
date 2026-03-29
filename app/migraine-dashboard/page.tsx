"use client";

import { useState } from "react";
import { Brain, Zap, Clock, Calendar, Plus, TrendingUp, Sun, Cloud, Coffee, Wine, Smartphone, Eye, Volume2, Frown, Thermometer, Droplets, Moon, Utensils, Dumbbell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface MigraineAttack { id: string; date: string; severity: number; duration: number; aura: boolean; location: string; triggers: string[]; medication: string; effective: boolean; }

const TRIGGERS_DB = [
  { id: "1", en: "Stress", tr: "Stres", icon: <Zap className="w-4 h-4" />, frequency: 8 },
  { id: "2", en: "Poor sleep", tr: "Yetersiz uyku", icon: <Moon className="w-4 h-4" />, frequency: 6 },
  { id: "3", en: "Weather changes", tr: "Hava degisimi", icon: <Cloud className="w-4 h-4" />, frequency: 5 },
  { id: "4", en: "Caffeine withdrawal", tr: "Kafein eksikligi", icon: <Coffee className="w-4 h-4" />, frequency: 4 },
  { id: "5", en: "Bright lights", tr: "Parlak isik", icon: <Sun className="w-4 h-4" />, frequency: 4 },
  { id: "6", en: "Screen time", tr: "Ekran suresi", icon: <Smartphone className="w-4 h-4" />, frequency: 3 },
  { id: "7", en: "Alcohol", tr: "Alkol", icon: <Wine className="w-4 h-4" />, frequency: 3 },
  { id: "8", en: "Dehydration", tr: "Susuzluk", icon: <Droplets className="w-4 h-4" />, frequency: 3 },
  { id: "9", en: "Skipping meals", tr: "Ogun atlama", icon: <Utensils className="w-4 h-4" />, frequency: 2 },
  { id: "10", en: "Hormonal changes", tr: "Hormonal degisim", icon: <Thermometer className="w-4 h-4" />, frequency: 2 },
  { id: "11", en: "Loud noise", tr: "Yüksek ses", icon: <Volume2 className="w-4 h-4" />, frequency: 2 },
  { id: "12", en: "Eye strain", tr: "Goz yorgunlugu", icon: <Eye className="w-4 h-4" />, frequency: 1 },
  { id: "13", en: "Strong smells", tr: "Keskin koku", icon: <Frown className="w-4 h-4" />, frequency: 1 },
  { id: "14", en: "Intense exercise", tr: "Agir egzersiz", icon: <Dumbbell className="w-4 h-4" />, frequency: 1 },
  { id: "15", en: "MSG / Aged cheese", tr: "MSG / Eski peynir", icon: <Utensils className="w-4 h-4" />, frequency: 1 },
];

export default function MigraineDashboardPage() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("log");
  const [attacks] = useState<MigraineAttack[]>([
    { id: "1", date: "2026-03-27", severity: 7, duration: 6, aura: true, location: "Right temple", triggers: ["Stress", "Poor sleep"], medication: "Sumatriptan 50mg", effective: true },
    { id: "2", date: "2026-03-22", severity: 5, duration: 3, aura: false, location: "Both sides", triggers: ["Weather changes"], medication: "Ibuprofen 400mg", effective: true },
    { id: "3", date: "2026-03-15", severity: 8, duration: 12, aura: true, location: "Left side", triggers: ["Stress", "Screen time", "Caffeine withdrawal"], medication: "Sumatriptan 100mg", effective: false },
    { id: "4", date: "2026-03-08", severity: 4, duration: 2, aura: false, location: "Forehead", triggers: ["Dehydration"], medication: "Acetaminophen", effective: true },
  ]);

  const avgSeverity = (attacks.reduce((s, a) => s + a.severity, 0) / attacks.length).toFixed(1);
  const avgDuration = (attacks.reduce((s, a) => s + a.duration, 0) / attacks.length).toFixed(1);
  const auraRate = Math.round((attacks.filter(a => a.aura).length / attacks.length) * 100);
  const medEffRate = Math.round((attacks.filter(a => a.effective).length / attacks.length) * 100);

  const tabs = [
    { id: "log", label: tx("migraine.attackLog", lang) },
    { id: "triggers", label: tx("migraine.triggers", lang) },
    { id: "meds", label: tx("migraine.medEffectiveness", lang) },
  ];

  const severityColor = (s: number) => s >= 7 ? "bg-red-500" : s >= 4 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-violet-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tx("migraine.title", lang)}</h1>
            <p className="text-sm text-gray-500">{tx("migraine.subtitle", lang)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-violet-600">{attacks.length}</div><div className="text-xs text-gray-500">{tx("migraine.thisMonth", lang)}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-orange-600">{avgSeverity}/10</div><div className="text-xs text-gray-500">{tx("migraine.avgSeverity", lang)}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-blue-600">{avgDuration}h</div><div className="text-xs text-gray-500">{tx("migraine.avgDuration", lang)}</div></Card>
          <Card className="p-3 text-center"><div className="text-2xl font-bold text-green-600">{medEffRate}%</div><div className="text-xs text-gray-500">{tx("migraine.medEffect", lang)}</div></Card>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(t => (<Button key={t.id} variant={activeTab === t.id ? "default" : "outline"} size="sm" onClick={() => setActiveTab(t.id)}>{t.label}</Button>))}
        </div>

        {activeTab === "log" && (
          <div className="space-y-3">
            {attacks.map(a => (
              <Card key={a.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="font-medium text-sm">{a.date}</span>{a.aura && <Badge className="bg-purple-100 text-purple-700">Aura</Badge>}</div>
                  <div className="flex items-center gap-2"><div className={"w-3 h-3 rounded-full " + severityColor(a.severity)} /><span className="text-sm font-bold">{a.severity}/10</span></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="text-gray-400">{tx("migraine.duration", lang)}</span>{a.duration}h</div>
                  <div><span className="text-gray-400">{tx("migraine.location", lang)}</span>{a.location}</div>
                  <div><span className="text-gray-400">{tx("migraine.med", lang)}</span>{a.medication}</div>
                  <div><span className="text-gray-400">{tx("migraine.effective", lang)}</span>{a.effective ? "Yes" : "No"}</div>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">{a.triggers.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
              </Card>
            ))}
            <Card className="p-4 border-dashed border-2 flex items-center justify-center gap-2 text-gray-400 cursor-pointer"><Plus className="w-4 h-4" /> {tx("migraine.logNew", lang)}</Card>
          </div>
        )}

        {activeTab === "triggers" && (
          <div className="space-y-3">
            {TRIGGERS_DB.sort((a, b) => b.frequency - a.frequency).map(tr => (
              <Card key={tr.id} className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600">{tr.icon}</div>
                <div className="flex-1"><span className="text-sm font-medium">{lang === "tr" ? tr.tr : tr.en}</span></div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="bg-violet-500 h-2 rounded-full" style={{ width: (tr.frequency / 8 * 100) + "%" }} /></div>
                  <span className="text-xs text-gray-500 w-6">{tr.frequency}x</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "meds" && (
          <div className="space-y-4">
            {[
              { name: "Sumatriptan 50mg", uses: 5, effective: 4, pct: 80 },
              { name: "Sumatriptan 100mg", uses: 3, effective: 1, pct: 33 },
              { name: "Ibuprofen 400mg", uses: 8, effective: 6, pct: 75 },
              { name: "Acetaminophen", uses: 4, effective: 3, pct: 75 },
            ].map(med => (
              <Card key={med.name} className="p-4">
                <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{med.name}</span><Badge className={med.pct >= 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{med.pct}%</Badge></div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className={"h-2 rounded-full " + (med.pct >= 70 ? "bg-green-500" : "bg-red-500")} style={{ width: med.pct + "%" }} /></div>
                <div className="text-xs text-gray-500 mt-1">{med.effective}/{med.uses} {tx("migraine.effectiveCount", lang)}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}