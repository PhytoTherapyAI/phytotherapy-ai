// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import { Droplets, Calculator, AlertTriangle, Pill, Activity, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const URINE_COLORS = [
  { color: "#f5f5dc", label: { en: "Clear / Very Pale", tr: "Berrak / Çok Acik" }, status: { en: "Well hydrated", tr: "Iyi hidrate" }, level: "good" },
  { color: "#fffacd", label: { en: "Light Yellow", tr: "Acik Sari" }, status: { en: "Optimal", tr: "Optimal" }, level: "good" },
  { color: "#ffeb3b", label: { en: "Yellow", tr: "Sari" }, status: { en: "Normal", tr: "Normal" }, level: "ok" },
  { color: "#ffc107", label: { en: "Dark Yellow", tr: "Koyu Sari" }, status: { en: "Mildly dehydrated", tr: "Hafif dehidrate" }, level: "warn" },
  { color: "#ff9800", label: { en: "Amber", tr: "Kehribar" }, status: { en: "Dehydrated", tr: "Dehidrate" }, level: "bad" },
  { color: "#e65100", label: { en: "Dark Amber / Brown", tr: "Koyu Kehribar / Kahve" }, status: { en: "Severely dehydrated", tr: "Ciddi dehidrate" }, level: "bad" },
];

const MEDICATION_EFFECTS = [
  { meds: { en: "Diuretics (Furosemide, Hydrochlorothiazide)", tr: "Diuretikler (Furosemid, Hidroklorotiyazid)" }, effect: { en: "+500-1000ml extra needed", tr: "+500-1000ml ekstra gerekli" }, icon: "increase" },
  { meds: { en: "Lithium", tr: "Lityum" }, effect: { en: "Critical: dehydration increases toxicity risk", tr: "Kritik: dehidrasyon toksisite riskini artirir" }, icon: "danger" },
  { meds: { en: "Metformin", tr: "Metformin" }, effect: { en: "+250-500ml recommended", tr: "+250-500ml onerili" }, icon: "increase" },
  { meds: { en: "ACE inhibitors", tr: "ACE inhibitorleri" }, effect: { en: "Monitor electrolytes with high intake", tr: "Yüksek alimda elektrolitleri izleyiniz" }, icon: "monitor" },
  { meds: { en: "NSAIDs (Ibuprofen)", tr: "NSAID'ler (Ibuprofen)" }, effect: { en: "Adequate water protects kidneys", tr: "Yeterli su böbrekleri korur" }, icon: "increase" },
];

export default function HydrationPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [caffeine, setCaffeine] = useState("1-2");
  const [calculated, setCalculated] = useState(false);

  const weightKg = parseFloat(weight) || 0;
  const baseWater = weightKg * 30; // ml
  const activityMultiplier = activity === "sedentary" ? 1 : activity === "moderate" ? 1.15 : 1.35;
  const caffeineOffset = caffeine === "0" ? 0 : caffeine === "1-2" ? 150 : caffeine === "3-4" ? 300 : 500;
  const totalWater = Math.round(baseWater * activityMultiplier + caffeineOffset);
  const glasses = Math.round(totalWater / 250);

  const hasKidney = profile?.kidney_disease === true;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Droplets className="w-10 h-10 text-blue-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("hydration.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("hydration.subtitle", lang)}</p>
      </div>

      {/* Calculator */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tx("hydration.weight", lang)} *</label>
            <input type="number" value={weight} onChange={(e) => { setWeight(e.target.value); setCalculated(false); }} placeholder="70" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Activity className="w-4 h-4 inline mr-1" /> {tx("hydration.activityLevel", lang)}
            </label>
            <select value={activity} onChange={(e) => { setActivity(e.target.value); setCalculated(false); }} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="sedentary">{tx("hydration.sedentary", lang)}</option>
              <option value="moderate">{tx("hydration.moderatelyActive", lang)}</option>
              <option value="active">{tx("hydration.veryActive", lang)}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Coffee className="w-4 h-4 inline mr-1" /> {tx("hydration.dailyCaffeine", lang)}
            </label>
            <select value={caffeine} onChange={(e) => { setCaffeine(e.target.value); setCalculated(false); }} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="0">0</option>
              <option value="1-2">1-2</option>
              <option value="3-4">3-4</option>
              <option value="5+">5+</option>
            </select>
          </div>
          <Button onClick={() => setCalculated(true)} disabled={!weight} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Calculator className="w-4 h-4 mr-2" /> {tx("hydration.calculate", lang)}
          </Button>
        </div>
      </div>

      {/* Result */}
      {calculated && weightKg > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 mb-6 text-center">
          <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">{(totalWater / 1000).toFixed(1)}L</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">{totalWater}ml / ~{glasses} {tx("hydration.glasses", lang)}</p>
          <div className="mt-3 text-xs text-blue-500 space-y-1">
            <p>{tx("hydration.base", lang)}: {weightKg}kg x 30ml = {baseWater}ml</p>
            <p>{tx("hydration.activityMultiplier", lang)}: x{activityMultiplier}</p>
            {caffeineOffset > 0 && <p>{tx("hydration.caffeineOffset", lang)}: +{caffeineOffset}ml</p>}
          </div>
        </div>
      )}

      {/* Kidney Warning */}
      {hasKidney && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                {tx("hydration.kidneyWarningTitle", lang)}
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                {tx("hydration.kidneyWarningDesc", lang)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Urine Color Scale */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          {tx("hydration.urineColorScale", lang)}
        </h3>
        <div className="space-y-2">
          {URINE_COLORS.map((uc, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-gray-300 flex-shrink-0" style={{ backgroundColor: uc.color }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{uc.label[lang]}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${uc.level === "good" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : uc.level === "ok" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : uc.level === "warn" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                {uc.status[lang]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Medication Effects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-blue-500" /> {tx("hydration.medicationEffects", lang)}
        </h3>
        <div className="space-y-3">
          {MEDICATION_EFFECTS.map((me, i) => (
            <div key={i} className={`p-3 rounded-lg ${me.icon === "danger" ? "bg-red-50 dark:bg-red-900/10" : "bg-gray-50 dark:bg-gray-700/50"}`}>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{me.meds[lang]}</p>
              <p className={`text-xs mt-0.5 ${me.icon === "danger" ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-600 dark:text-gray-400"}`}>{me.effect[lang]}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
