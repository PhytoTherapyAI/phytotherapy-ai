// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Heart,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx, txp } from "@/lib/translations";

interface RiskResult {
  score: number;
  category: string;
  categoryColor: string;
  details: string;
}

const ESSENTIALS_8 = [
  { id: "diet", icon: "🥗", en: "Eat Better — Mediterranean/DASH diet", tr: "Daha Iyi Beslenin — Akdeniz/DASH diyeti" },
  { id: "active", icon: "🏃", en: "Be More Active — 150 min/week moderate", tr: "Daha Aktif Olun — Haftada 150 dk orta tempo" },
  { id: "quit", icon: "🚭", en: "Quit Tobacco", tr: "Tutun Birakin" },
  { id: "sleep", icon: "😴", en: "Get Healthy Sleep — 7-9 hours", tr: "Sağlıkli Uyku — 7-9 saat" },
  { id: "weight", icon: "⚖️", en: "Manage Weight — BMI < 25", tr: "Kilo Yönetimi — VKI < 25" },
  { id: "cholesterol", icon: "🩸", en: "Control Cholesterol — LDL < 100", tr: "Kolesterol Kontrolu — LDL < 100" },
  { id: "sugar", icon: "📊", en: "Manage Blood Sugar — HbA1c < 5.7%", tr: "Kan Sekeri Yönetimi — HbA1c < %5.7" },
  { id: "bp", icon: "💓", en: "Manage Blood Pressure — < 120/80", tr: "Tansiyon Yönetimi — < 120/80" },
];

function calculateFraminghamRisk(
  age: number,
  gender: string,
  totalCholesterol: number,
  hdl: number,
  systolicBP: number,
  isSmoker: boolean,
  hasDiabetes: boolean,
  isTreatedBP: boolean
): RiskResult {
  // Simplified Framingham Risk Score calculation
  let points = 0;

  if (gender === "male") {
    // Age points
    if (age >= 20 && age <= 34) points -= 9;
    else if (age <= 39) points -= 4;
    else if (age <= 44) points += 0;
    else if (age <= 49) points += 3;
    else if (age <= 54) points += 6;
    else if (age <= 59) points += 8;
    else if (age <= 64) points += 10;
    else if (age <= 69) points += 11;
    else if (age <= 74) points += 12;
    else points += 13;

    // Total cholesterol
    if (totalCholesterol < 160) points += 0;
    else if (totalCholesterol <= 199) points += 4;
    else if (totalCholesterol <= 239) points += 7;
    else if (totalCholesterol <= 279) points += 9;
    else points += 11;

    // HDL
    if (hdl >= 60) points -= 1;
    else if (hdl >= 50) points += 0;
    else if (hdl >= 40) points += 1;
    else points += 2;

    // Systolic BP
    if (!isTreatedBP) {
      if (systolicBP < 120) points += 0;
      else if (systolicBP <= 129) points += 0;
      else if (systolicBP <= 139) points += 1;
      else if (systolicBP <= 159) points += 1;
      else points += 2;
    } else {
      if (systolicBP < 120) points += 0;
      else if (systolicBP <= 129) points += 1;
      else if (systolicBP <= 139) points += 2;
      else if (systolicBP <= 159) points += 2;
      else points += 3;
    }

    // Smoking
    if (isSmoker) points += 8;

    // Convert points to risk %
    const riskMap: Record<number, number> = {
      0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 4, 9: 5,
      10: 6, 11: 8, 12: 10, 13: 12, 14: 16, 15: 20, 16: 25, 17: 30,
    };
    let riskPercent = riskMap[Math.min(17, Math.max(0, points))] || (points < 0 ? 1 : 30);
    if (hasDiabetes) riskPercent = Math.min(30, riskPercent * 1.5);

    return formatRisk(riskPercent);
  } else {
    // Female
    if (age >= 20 && age <= 34) points -= 7;
    else if (age <= 39) points -= 3;
    else if (age <= 44) points += 0;
    else if (age <= 49) points += 3;
    else if (age <= 54) points += 6;
    else if (age <= 59) points += 8;
    else if (age <= 64) points += 10;
    else if (age <= 69) points += 12;
    else if (age <= 74) points += 14;
    else points += 16;

    if (totalCholesterol < 160) points += 0;
    else if (totalCholesterol <= 199) points += 4;
    else if (totalCholesterol <= 239) points += 8;
    else if (totalCholesterol <= 279) points += 11;
    else points += 13;

    if (hdl >= 60) points -= 1;
    else if (hdl >= 50) points += 0;
    else if (hdl >= 40) points += 1;
    else points += 2;

    if (!isTreatedBP) {
      if (systolicBP < 120) points += 0;
      else if (systolicBP <= 129) points += 1;
      else if (systolicBP <= 139) points += 2;
      else if (systolicBP <= 159) points += 3;
      else points += 4;
    } else {
      if (systolicBP < 120) points += 0;
      else if (systolicBP <= 129) points += 3;
      else if (systolicBP <= 139) points += 4;
      else if (systolicBP <= 159) points += 5;
      else points += 6;
    }

    if (isSmoker) points += 9;

    const riskMap: Record<number, number> = {
      9: 1, 10: 1, 11: 1, 12: 1, 13: 2, 14: 2, 15: 3, 16: 4, 17: 5,
      18: 6, 19: 8, 20: 11, 21: 14, 22: 17, 23: 22, 24: 27, 25: 30,
    };
    let riskPercent = riskMap[Math.min(25, Math.max(9, points))] || (points < 9 ? 1 : 30);
    if (hasDiabetes) riskPercent = Math.min(30, riskPercent * 1.5);

    return formatRisk(riskPercent);
  }
}

function formatRisk(riskPercent: number): RiskResult {
  const score = Math.round(riskPercent * 10) / 10;
  if (score < 10) {
    return { score, category: "Low Risk", categoryColor: "text-green-600", details: "low" };
  } else if (score < 20) {
    return { score, category: "Moderate Risk", categoryColor: "text-amber-600", details: "moderate" };
  } else {
    return { score, category: "High Risk", categoryColor: "text-red-600", details: "high" };
  }
}

export default function CardiovascularRiskPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [totalCholesterol, setTotalCholesterol] = useState("");
  const [hdl, setHdl] = useState("");
  const [systolicBP, setSystolicBP] = useState("");
  const [isSmoker, setIsSmoker] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [isTreatedBP, setIsTreatedBP] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [essentialChecks, setEssentialChecks] = useState<string[]>([]);

  const handleCalculate = () => {
    const ageNum = Number(age);
    const cholNum = Number(totalCholesterol);
    const hdlNum = Number(hdl);
    const bpNum = Number(systolicBP);

    if (ageNum < 20 || ageNum > 80 || cholNum <= 0 || hdlNum <= 0 || bpNum <= 0) return;

    const riskResult = calculateFraminghamRisk(
      ageNum, gender, cholNum, hdlNum, bpNum, isSmoker, hasDiabetes, isTreatedBP
    );
    setResult(riskResult);
  };

  const toggleEssential = (id: string) => {
    setEssentialChecks((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("cardio.title", lang)}</h1>
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
          <div className="inline-flex items-center gap-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Heart className="w-4 h-4" />
            {tx("cardio.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("cardio.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("cardio.subtitle", lang)}</p>
        </div>

        {/* Calculator */}
        <div className="bg-card border rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-rose-500" />
            {tx("cardioRisk.framingham", lang)}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{tx("common.age", lang)}</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="20-80"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                min={20} max={80}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{tx("common.gender", lang)}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="male">{tx("common.male", lang)}</option>
                <option value="female">{tx("common.female", lang)}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {tx("cardioRisk.totalCholesterol", lang)}
              </label>
              <input
                type="number"
                value={totalCholesterol}
                onChange={(e) => setTotalCholesterol(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">HDL (mg/dL)</label>
              <input
                type="number"
                value={hdl}
                onChange={(e) => setHdl(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {tx("cardioRisk.systolicBP", lang)}
              </label>
              <input
                type="number"
                value={systolicBP}
                onChange={(e) => setSystolicBP(e.target.value)}
                placeholder="e.g. 130"
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isSmoker}
                onChange={(e) => setIsSmoker(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{tx("cardioRisk.smoker", lang)}</span>
            </label>
            <label className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDiabetes}
                onChange={(e) => setHasDiabetes(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{tx("cardioRisk.diabetes", lang)}</span>
            </label>
            <label className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTreatedBP}
                onChange={(e) => setIsTreatedBP(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{tx("cardioRisk.bpMed", lang)}</span>
            </label>
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white"
            disabled={!age || !totalCholesterol || !hdl || !systolicBP}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {tx("cardio.calculate", lang)}
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">{tx("cardio.riskScore", lang)}</h2>
            <div className="text-center space-y-3">
              <div className={`text-6xl font-bold ${result.categoryColor}`}>
                {result.score}%
              </div>
              <div className={`text-xl font-semibold ${result.categoryColor}`}>
                {result.details === "low" ? tx("cardioRisk.lowRisk", lang) : result.details === "moderate" ? tx("cardioRisk.moderateRisk", lang) : tx("cardioRisk.highRisk", lang)}
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {txp("cardio.riskEstimateValue", lang, { score: result.score })}
              </p>

              {/* Risk Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{tx("common.low", lang)}</span>
                  <span>{tx("common.moderate", lang)}</span>
                  <span>{tx("common.high", lang)}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500 relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow"
                    style={{ left: `${Math.min(95, Math.max(5, (result.score / 30) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Statin Note */}
              {result.score >= 7.5 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-left mt-4">
                  <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    {tx("cardioRisk.statinTitle", lang)}
                  </div>
                  <p className="text-muted-foreground">
                    {txp("cardio.statinNoteWithScore", lang, { score: result.score })}{tx("cardioRisk.statinNote", lang)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Life's Essential 8 */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            {tx("cardio.essentials", lang)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tx("cardioRisk.essentialsDesc", lang)}
          </p>
          <div className="grid gap-2">
            {ESSENTIALS_8.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleEssential(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  essentialChecks.includes(item.id)
                    ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {essentialChecks.includes(item.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0" />
                ) : (
                  <span className="text-lg flex-shrink-0 w-5 text-center">{item.icon}</span>
                )}
                <span className={essentialChecks.includes(item.id) ? "line-through opacity-70" : ""}>
                  {item[lang]}
                </span>
              </button>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {essentialChecks.length}/8 {tx("cardioRisk.completed", lang)}
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
