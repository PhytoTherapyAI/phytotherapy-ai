// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import { Building, Package, Search, TrendingUp, AlertTriangle, CheckCircle2, BarChart3, Pill, Users, Clock, ShoppingCart, Stethoscope, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface StockItem { id: string; name: string; generic: string; stock: number; minStock: number; expiryDate: string; price: number; demand: "high" | "medium" | "low"; }

export default function PharmacyPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [activeTab, setActiveTab] = useState("counter");
  const [searchTerm, setSearchTerm] = useState("");

  const stock: StockItem[] = [
    { id: "1", name: "Glifor 1000mg", generic: "Metformin", stock: 45, minStock: 20, expiryDate: "2027-06", price: 42, demand: "high" },
    { id: "2", name: "Lipitor 20mg", generic: "Atorvastatin", stock: 12, minStock: 15, expiryDate: "2027-03", price: 65, demand: "high" },
    { id: "3", name: "Beloc 50mg", generic: "Metoprolol", stock: 30, minStock: 10, expiryDate: "2028-01", price: 38, demand: "medium" },
    { id: "4", name: "Euthyrox 100mcg", generic: "Levothyroxine", stock: 8, minStock: 10, expiryDate: "2026-12", price: 28, demand: "medium" },
    { id: "5", name: "Coumadin 5mg", generic: "Warfarin", stock: 22, minStock: 10, expiryDate: "2027-09", price: 32, demand: "low" },
    { id: "6", name: "Norvasc 5mg", generic: "Amlodipine", stock: 5, minStock: 15, expiryDate: "2026-09", price: 42, demand: "high" },
  ];

  const lowStock = stock.filter(s => s.stock < s.minStock);
  const nearExpiry = stock.filter(s => { const exp = new Date(s.expiryDate); const now = new Date(); return (exp.getTime() - now.getTime()) / (1000*60*60*24) < 180; });
  const filtered = searchTerm ? stock.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.generic.toLowerCase().includes(searchTerm.toLowerCase())) : stock;
  const demandColor = (d: string) => d === "high" ? "bg-red-100 text-red-700" : d === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";

  const tabs = [
    { id: "counter", label: tx("pharmacy.counterDisplay", lang) },
    { id: "stock", label: tx("pharmacy.stockOptimization", lang) },
    { id: "support", label: tx("pharmacy.pharmacistSupport", lang) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Building className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tx("pharmacy.title", lang)}</h1>
            <p className="text-sm text-gray-500">{tx("pharmacy.subtitle", lang)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-3 text-center"><Package className="w-5 h-5 text-green-500 mx-auto mb-1" /><div className="text-xl font-bold">{stock.length}</div><div className="text-xs text-gray-500">{tx("pharmacy.totalProducts", lang)}</div></Card>
          <Card className="p-3 text-center border-red-200"><AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" /><div className="text-xl font-bold text-red-600">{lowStock.length}</div><div className="text-xs text-gray-500">{tx("pharmacy.lowStock", lang)}</div></Card>
          <Card className="p-3 text-center border-orange-200"><Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" /><div className="text-xl font-bold text-orange-600">{nearExpiry.length}</div><div className="text-xs text-gray-500">{tx("pharmacy.nearExpiry", lang)}</div></Card>
          <Card className="p-3 text-center"><Users className="w-5 h-5 text-blue-500 mx-auto mb-1" /><div className="text-xl font-bold">48</div><div className="text-xs text-gray-500">{tx("pharmacy.dailyCustomers", lang)}</div></Card>
        </div>

        <div className="flex gap-2 mb-6">{tabs.map(t => (<Button key={t.id} variant={activeTab === t.id ? "default" : "outline"} size="sm" onClick={() => setActiveTab(t.id)}>{t.label}</Button>))}</div>

        {activeTab === "counter" && (
          <div className="space-y-4">
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="w-full rounded-lg border pl-10 pr-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder={tx("pharmacy.searchDrug", lang)} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <div className="space-y-2">
              {filtered.map(item => (
                <Card key={item.id} className={"p-4 flex items-center gap-4 " + (item.stock < item.minStock ? "border-red-200" : "")}>
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><Pill className="w-5 h-5 text-green-600" /></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.generic} | {item.price} TL | SKT: {item.expiryDate}</div>
                  </div>
                  <Badge className={demandColor(item.demand)}>{item.demand}</Badge>
                  <div className="text-right"><div className={"font-bold " + (item.stock < item.minStock ? "text-red-600" : "text-green-600")}>{item.stock}</div><div className="text-xs text-gray-400">min: {item.minStock}</div></div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stock" && (
          <div className="space-y-4">
            {lowStock.length > 0 && (
              <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
                <h3 className="font-semibold text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {tx("pharmacy.reorder", lang)}</h3>
                <div className="mt-2 space-y-2">{lowStock.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-800">
                    <span className="text-sm font-medium">{s.name}</span>
                    <div className="flex items-center gap-2"><span className="text-sm text-red-600">{s.stock}/{s.minStock}</span><Button size="sm" variant="outline"><ShoppingCart className="w-3 h-3 mr-1" />{tx("pharmacy.order", lang)}</Button></div>
                  </div>
                ))}</div>
              </Card>
            )}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> {tx("pharmacy.stockSuggestions", lang)}</h3>
              <div className="space-y-2">
                {[
                  { en: "Increase Metformin stock by 30% - seasonal demand rise expected", tr: "Metformin stogunu %30 artirin - mevsimsel talep artisi bekleniyor" },
                  { en: "Consider reducing Warfarin order - declining prescription trend", tr: "Warfarin siparisini azaltmayi dusunun - azalan recete trendi" },
                  { en: "Bundle Atorvastatin with Amlodipine - 65% co-prescription rate", tr: "Atorvastatin ve Amlodipine birlikte stoklyin - %65 birlikte receleme orani" },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/10"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /><span className="text-sm">{isTr ? s.tr : s.en}</span></div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "support" && (
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-semibold flex items-center gap-2"><Stethoscope className="w-5 h-5 text-blue-600" /> {tx("pharmacy.decisionSupport", lang)}</h3>
              <p className="text-sm text-gray-600 mt-1">{tx("pharmacy.decisionSupportDesc", lang)}</p>
            </Card>
            {[
              { title: isTr ? "Etkileşim Uyarısi" : "Interaction Alert", desc: isTr ? "Metformin + Kontrast madde: 48 saat ara verin" : "Metformin + Contrast: Hold for 48 hours", type: "warning" },
              { title: isTr ? "Jenerik Alternatif" : "Generic Alternative", desc: isTr ? "Lipitor yerine Atorvastatin - %66 tasarruf" : "Atorvastatin instead of Lipitor - 66% savings", type: "info" },
              { title: isTr ? "Doz Uyarısi" : "Dose Alert", desc: isTr ? "Bobrek yetmezliginde Metformin doz ayarlamasi gerekli" : "Metformin dose adjustment needed for renal impairment", type: "warning" },
            ].map((a, i) => (
              <Card key={i} className={"p-4 " + (a.type === "warning" ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" : "border-blue-200 bg-blue-50 dark:bg-blue-900/20")}>
                <h4 className="font-semibold text-sm">{a.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{a.desc}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
