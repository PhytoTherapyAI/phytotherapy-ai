// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Pill,
  Heart,
  Calendar,
  LogIn,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ChecklistItem {
  id: string;
  label: { en: string; tr: string };
  done: boolean;
}

const DAILY_CHECKLIST: Omit<ChecklistItem, "done">[] = [
  { id: "brush_morning", label: { en: "Brush teeth (morning, 2 min)", tr: "Dis fircalama (sabah, 2 dk)" } },
  { id: "brush_evening", label: { en: "Brush teeth (evening, 2 min)", tr: "Dis fircalama (aksam, 2 dk)" } },
  { id: "floss", label: { en: "Floss once daily", tr: "Günlük dis ipi kullanimi" } },
  { id: "mouthwash", label: { en: "Mouthwash (alcohol-free preferred)", tr: "Gargara (alkolsuz tercih edin)" } },
  { id: "tongue", label: { en: "Tongue cleaning", tr: "Dil temizligi" } },
  { id: "water", label: { en: "Drink water after meals", tr: "Yemeklerden sonra su icin" } },
];

interface MedEffect {
  category: string;
  medications: string[];
  effect: { en: string; tr: string };
  risk: { en: string; tr: string };
  prevention: { en: string; tr: string };
  severity: "high" | "moderate" | "low";
}

const MED_ORAL_EFFECTS: MedEffect[] = [
  {
    category: "Anticholinergics",
    medications: ["Oxybutynin", "Tolterodine", "Amitriptyline", "Diphenhydramine", "Atropine"],
    effect: { en: "Severe dry mouth (xerostomia)", tr: "Siddetli agiz kurulugu (kserostomi)" },
    risk: { en: "3x increased cavity risk, oral candidiasis", tr: "3 kat artan curuk riski, oral kandidiyaz" },
    prevention: { en: "Sugar-free gum, saliva substitutes, frequent water sips, fluoride rinse", tr: "Sekersiz sakiz, yapay tukuruk, sik su yudumlamak, florurlu gargara" },
    severity: "high",
  },
  {
    category: "Phenytoin / Cyclosporine",
    medications: ["Phenytoin", "Cyclosporine", "Nifedipine", "Diltiazem", "Verapamil"],
    effect: { en: "Gingival overgrowth (hyperplasia)", tr: "Dis eti buyumesi (hiperplazi)" },
    risk: { en: "Overgrown gums covering teeth, plaque retention", tr: "Disleri kapatan dis eti buyumesi, plak birikimi" },
    prevention: { en: "Meticulous oral hygiene, regular dental cleanings every 3 months", tr: "Titiz agiz bakimi, 3 ayda bir dis temizligi" },
    severity: "high",
  },
  {
    category: "Bisphosphonates",
    medications: ["Alendronate", "Risedronate", "Zoledronic acid", "Denosumab"],
    effect: { en: "Osteonecrosis of the jaw (ONJ)", tr: "Cene osteonekrozu (ONJ)" },
    risk: { en: "Jaw bone death after dental procedures, especially extractions", tr: "Dis işlemlerinden sonra cene kemigi olumu, ozellikle cekim sonrasi" },
    prevention: { en: "INFORM DENTIST before any procedure, complete dental work before starting bisphosphonates", tr: "Herhangi bir işlem öncesi DIS HEKIMINE BİLDİRİN, bifosfonat başlamadan dis işlemlerini tamamlayın" },
    severity: "high",
  },
  {
    category: "Anticoagulants",
    medications: ["Warfarin", "Rivaroxaban", "Apixaban", "Dabigatran", "Heparin", "Aspirin"],
    effect: { en: "Prolonged bleeding after dental procedures", tr: "Dis işlemleri sonrasi uzun sureli kanama" },
    risk: { en: "Excessive bleeding during extraction, gum surgery", tr: "Cekim ve dis eti ameliyati sirasinda asiri kanama" },
    prevention: { en: "Inform dentist of ALL blood thinners, may need INR check before procedures", tr: "Tum kan sulandiricilarinizi dis hekimine bildirin, işlem öncesi INR kontrolü gerekebilir" },
    severity: "moderate",
  },
  {
    category: "SSRIs / Antidepressants",
    medications: ["Fluoxetine", "Sertraline", "Paroxetine", "Venlafaxine", "Duloxetine"],
    effect: { en: "Dry mouth, bruxism (teeth grinding)", tr: "Agiz kurulugu, bruksizm (dis gicirdatma)" },
    risk: { en: "Increased cavity risk, tooth wear, TMJ pain", tr: "Artan curuk riski, dis asinmasi, TME ağrısi" },
    prevention: { en: "Night guard for bruxism, hydration, sugar-free lozenges", tr: "Bruksizm için gece plagi, hidrasyon, sekersiz pastiller" },
    severity: "moderate",
  },
  {
    category: "Chemotherapy",
    medications: ["Methotrexate", "5-FU", "Doxorubicin", "Cyclophosphamide"],
    effect: { en: "Oral mucositis, ulcers, infection risk", tr: "Oral mukozit, ulserler, enfeksiyon riski" },
    risk: { en: "Painful mouth sores, difficulty eating, secondary infections", tr: "Agirili agiz yaralari, yeme güçlüğü, sekonder enfeksiyonlar" },
    prevention: { en: "Soft toothbrush, salt-water rinse, avoid spicy/acidic foods, cryotherapy during infusion", tr: "Yumusak dis fircasi, tuzlu su gargarasi, baharatli/asitli gidalardan kacinin" },
    severity: "high",
  },
];

const VISIT_SCHEDULE = [
  { en: "Routine cleaning & checkup", tr: "Rutin temizlik ve kontrol", frequency: { en: "Every 6 months", tr: "6 ayda bir" } },
  { en: "Full mouth X-ray", tr: "Tam agiz rontgeni", frequency: { en: "Every 1-2 years", tr: "1-2 yilda bir" } },
  { en: "Periodontal assessment", tr: "Periodontal değerlendirme", frequency: { en: "Annually (40+)", tr: "Yıllık (40 yas+)" } },
  { en: "Oral cancer screening", tr: "Agiz kanseri taramasi", frequency: { en: "Annually (especially smokers)", tr: "Yıllık (ozellikle sigara icenler)" } },
];

export default function DentalHealthPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem("dental-checklist");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setChecklist(parsed.items);
        return;
      }
    }
    setChecklist(DAILY_CHECKLIST.map((item) => ({ ...item, done: false })));
  }, []);

  const toggleItem = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    localStorage.setItem("dental-checklist", JSON.stringify({
      date: new Date().toDateString(),
      items: updated,
    }));
  };

  const completedCount = checklist.filter((i) => i.done).length;
  const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("dental.title", lang)}</h1>
          <p className="text-muted-foreground">{tx("common.loginToUse", lang)}</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            <LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {tx("dental.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("dental.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("dental.subtitle", lang)}</p>
        </div>

        {/* Daily Checklist */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-500" />
              {tx("dental.checklist", lang)}
            </h2>
            <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-cyan-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid gap-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  item.done
                    ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={item.done ? "line-through opacity-70" : ""}>
                  {item.label[lang]}
                </span>
              </button>
            ))}
          </div>
          {progress === 100 && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 font-medium">
              {tx("dental.completedToday", lang)}
            </div>
          )}
        </div>

        {/* Medication Oral Side Effects */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Pill className="w-5 h-5 text-amber-500" />
            {tx("dental.medEffects", lang)}
          </h2>
          <div className="grid gap-4">
            {MED_ORAL_EFFECTS.map((effect) => (
              <div
                key={effect.category}
                className={`border rounded-xl p-4 space-y-3 ${
                  effect.severity === "high"
                    ? "border-red-200 dark:border-red-800"
                    : effect.severity === "moderate"
                    ? "border-amber-200 dark:border-amber-800"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{effect.category}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      effect.severity === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : effect.severity === "moderate"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {effect.severity === "high"
                      ? tx("common.highRisk", lang)
                      : effect.severity === "moderate"
                      ? tx("common.moderateRisk", lang)
                      : tx("common.lowRisk", lang)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>{tx("dental.medications", lang)}</strong>{" "}
                  {effect.medications.join(", ")}
                </p>
                <div className="grid sm:grid-cols-3 gap-2 text-sm">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="font-medium text-xs text-muted-foreground mb-1">
                      {tx("dental.effect", lang)}
                    </div>
                    {effect.effect[lang]}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="font-medium text-xs text-muted-foreground mb-1">
                      {tx("dental.risk", lang)}
                    </div>
                    {effect.risk[lang]}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="font-medium text-xs text-muted-foreground mb-1">
                      {tx("dental.prevention", lang)}
                    </div>
                    {effect.prevention[lang]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Periodontal-Cardiovascular Link */}
        <div className="bg-card border rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            {tx("dental.cardioLink", lang)}
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 space-y-2">
            <p className="text-sm">
              {tx("dental.cardioDesc", lang)}
            </p>
            <p className="text-sm font-medium">
              {tx("dental.cardioAdvice", lang)}
            </p>
          </div>
        </div>

        {/* Dental Visit Schedule */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            {tx("dental.visitSchedule", lang)}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {VISIT_SCHEDULE.map((visit, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-4 space-y-1">
                <div className="font-medium">{visit[lang]}</div>
                <div className="text-sm text-muted-foreground">{visit.frequency[lang]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
