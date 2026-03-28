"use client";

import { useState } from "react";
import { Pill, Calculator, AlertTriangle, CheckCircle2, Search, Scale, ArrowRightLeft, Shield, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

const DRUG_DB = [
  { brand: "Glifor", generic: "Metformin", brandPrice: 45, genericPrice: 18, category: "Antidiabetic" },
  { brand: "Coumadin", generic: "Warfarin", brandPrice: 32, genericPrice: 12, category: "Anticoagulant" },
  { brand: "Lipitor", generic: "Atorvastatin", brandPrice: 65, genericPrice: 22, category: "Statin" },
  { brand: "Euthyrox", generic: "Levothyroxine", brandPrice: 28, genericPrice: 15, category: "Thyroid" },
  { brand: "Beloc", generic: "Metoprolol", brandPrice: 38, genericPrice: 14, category: "Beta Blocker" },
  { brand: "Norvasc", generic: "Amlodipine", brandPrice: 42, genericPrice: 16, category: "CCB" },
  { brand: "Glucophage", generic: "Metformin", brandPrice: 52, genericPrice: 18, category: "Antidiabetic" },
  { brand: "Plavix", generic: "Clopidogrel", brandPrice: 78, genericPrice: 25, category: "Antiplatelet" },
];

export default function DoctorPrescribePage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<typeof DRUG_DB[0] | null>(null);
  const [weight, setWeight] = useState("70");
  const [age, setAge] = useState("45");
  const [renal, setRenal] = useState("normal");

  const filtered = searchTerm ? DRUG_DB.filter(d => d.brand.toLowerCase().includes(searchTerm.toLowerCase()) || d.generic.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  const interactions = [
    { drug1: "Metformin", drug2: "Contrast Dye", severity: "high" as const, desc: "Risk of lactic acidosis. Hold 48h before/after contrast." },
    { drug1: "Warfarin", drug2: "Aspirin", severity: "high" as const, desc: "Increased bleeding risk. Monitor INR closely." },
    { drug1: "Atorvastatin", drug2: "Grapefruit", severity: "medium" as const, desc: "CYP3A4 inhibition. Avoid grapefruit consumption." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Pill className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Recete Asistani" : "Prescription Assistant"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "Doz hesaplama, etkilesim kontrolu, jenerik alternatifleri" : "Dose calculator, interaction check, generic alternatives"}</p>
          </div>
        </div>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2"><Search className="w-4 h-4" /> {isTr ? "Ilac Ara" : "Search Drug"}</h2>
          <input className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder={isTr ? "Marka veya etken madde adi..." : "Brand or generic name..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {filtered.length > 0 && <div className="mt-2 space-y-1">{filtered.map((d, i) => (<div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { setSelectedDrug(d); setSearchTerm(""); }}><div><span className="font-medium text-sm">{d.brand}</span><span className="text-xs text-gray-500 ml-2">({d.generic})</span></div><Badge variant="outline">{d.category}</Badge></div>))}</div>}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Calculator className="w-4 h-4" /> {isTr ? "Doz Hesaplayici" : "Dose Calculator"}</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500">{isTr ? "Kilo (kg)" : "Weight (kg)"}</label><input className="w-full rounded-lg border px-3 py-2 text-sm mt-1 dark:bg-gray-800 dark:border-gray-700" value={weight} onChange={e => setWeight(e.target.value)} type="number" /></div>
              <div><label className="text-xs text-gray-500">{isTr ? "Yas" : "Age"}</label><input className="w-full rounded-lg border px-3 py-2 text-sm mt-1 dark:bg-gray-800 dark:border-gray-700" value={age} onChange={e => setAge(e.target.value)} type="number" /></div>
              <div><label className="text-xs text-gray-500">{isTr ? "Bobrek Fonksiyonu" : "Renal Function"}</label>
                <select className="w-full rounded-lg border px-3 py-2 text-sm mt-1 dark:bg-gray-800 dark:border-gray-700" value={renal} onChange={e => setRenal(e.target.value)}>
                  <option value="normal">Normal (GFR &gt;60)</option><option value="mild">Mild (GFR 30-60)</option><option value="severe">Severe (GFR &lt;30)</option>
                </select>
              </div>
              <Button className="w-full"><Calculator className="w-4 h-4 mr-2" /> {isTr ? "Doz Hesapla" : "Calculate Dose"}</Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> {isTr ? "Jenerik Alternatifler" : "Generic Alternatives"}</h3>
            {selectedDrug ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"><div><div className="font-medium text-sm">{selectedDrug.brand}</div><div className="text-xs text-gray-500">{isTr ? "Marka" : "Brand"}</div></div><span className="font-bold text-lg">{selectedDrug.brandPrice} TL</span></div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200"><div><div className="font-medium text-sm text-green-700">{selectedDrug.generic}</div><div className="text-xs text-green-600">{isTr ? "Jenerik" : "Generic"}</div></div><span className="font-bold text-lg text-green-600">{selectedDrug.genericPrice} TL</span></div>
                <div className="text-center p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><span className="text-sm font-bold text-emerald-700">{Math.round((1 - selectedDrug.genericPrice / selectedDrug.brandPrice) * 100)}% {isTr ? "tasarruf" : "savings"}</span></div>
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-8">{isTr ? "Bir ilac secin" : "Select a drug first"}</p>}
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> {isTr ? "Etkilesim Kontrolleri" : "Interaction Checks"}</h3>
          <div className="space-y-2">
            {interactions.map((int, i) => (
              <div key={i} className={"p-3 rounded-lg " + (int.severity === "high" ? "bg-red-50 border border-red-200 dark:bg-red-900/20" : "bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20")}>
                <div className="flex items-center gap-2 mb-1"><Badge className={int.severity === "high" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>{int.severity}</Badge><span className="text-sm font-medium">{int.drug1} + {int.drug2}</span></div>
                <p className="text-xs text-gray-600">{int.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}