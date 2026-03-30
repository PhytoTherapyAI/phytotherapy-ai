"use client";

import { useState } from "react";
import {
  Baby,
  Loader2,
  AlertTriangle,
  Phone,
  Shield,
  LogIn,
  Heart,
  Apple,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface PregnancyResult {
  gestationalWeek: number;
  trimester: string;
  emergencyAlert: boolean;
  emergencyMessage?: string;
  alertLevel: "green" | "yellow" | "red";
  weekInfo: string;
  fetalDevelopment: { size: string; weight: string; developments: string[] };
  safeSupplements: Array<{ name: string; dose: string; benefit: string; trimesterSafe: string[] }>;
  unsafeMeds: Array<{ medication: string; category: string; risk: string; action: string }>;
  safeMeds?: Array<{ medication: string; category: string; note: string }>;
  nutritionPlan: Array<{ nutrient: string; amount: string; sources: string; why: string }>;
  exerciseGuidelines?: string[];
  warningSignals: Array<{ signal: string; action: string }>;
  weekSpecificTips?: string[];
}

const PREGNANCY_SYMPTOMS = [
  { en: "Nausea", tr: "Bulantı" },
  { en: "Fatigue", tr: "Yorgunluk" },
  { en: "Back pain", tr: "Bel ağrısi" },
  { en: "Swelling", tr: "Şişman" },
  { en: "Headache", tr: "Bas ağrısi" },
  { en: "Heartburn", tr: "Mide yanması" },
  { en: "Constipation", tr: "Kabızlık" },
  { en: "Insomnia", tr: "Uykusuzluk" },
  { en: "Mood changes", tr: "Ruh hali değişikliği" },
  { en: "Frequent urination", tr: "Sık idrara çıkma" },
  { en: "Cramping", tr: "Kramp" },
  { en: "Spotting", tr: "Lekelenme" },
];

export default function PregnancyTrackerPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [week, setWeek] = useState(12);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [concerns, setConcerns] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PregnancyResult | null>(null);

  const symptoms = PREGNANCY_SYMPTOMS.map((s) => s[lang]);

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pregnancy-tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          gestational_week: week,
          symptoms: selectedSymptoms,
          concerns,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-pink-50 p-3 dark:bg-pink-950">
            <Baby className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("pregnancy.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("pregnancy.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-8 text-center dark:border-pink-800 dark:bg-pink-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-pink-400" />
          <p className="text-lg font-medium text-pink-700 dark:text-pink-300">
            {tx("common.loginToUse2", lang)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-pink-50 p-3 dark:bg-pink-950">
          <Baby className="h-6 w-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("pregnancy.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("pregnancy.subtitle", lang)}</p>
        </div>
      </div>

      {/* Emergency Alert */}
      {result?.emergencyAlert && (
        <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 p-6 dark:bg-red-950/40">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-300">{result.emergencyMessage}</p>
              <p className="mt-2 text-lg font-bold text-red-600">
                {tx("pregnancy.callNow", lang)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Week Selector */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm text-center">
        <h2 className="text-sm font-semibold text-muted-foreground">{tx("pregnancy.week", lang)}</h2>
        <p className="mt-2 text-5xl font-bold text-pink-600 dark:text-pink-400">{week}</p>
        <input
          type="range"
          min={1}
          max={42}
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="mt-3 w-full accent-pink-500"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{tx("pregnancy.week1Label", lang)}</span>
          <span>{lang === "tr" ? `${week <= 12 ? "1." : week <= 27 ? "2." : "3."} trimester` : `${week <= 12 ? "1st" : week <= 27 ? "2nd" : "3rd"} trimester`}</span>
          <span>{tx("pregnancy.week42Label", lang)}</span>
        </div>
      </div>

      {/* Symptoms */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {tx("common.symptoms", lang)}
        </h2>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSymptoms((prev) =>
                prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
              )}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                selectedSymptoms.includes(s)
                  ? "bg-pink-500 text-white"
                  : "bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Concerns */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <textarea
          value={concerns}
          onChange={(e) => setConcerns(e.target.value)}
          placeholder={tx("pregnancy.concernsPlaceholder", lang)}
          className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
          rows={3}
        />
      </div>

      {/* Analyze */}
      <Button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="mb-6 w-full bg-pink-600 hover:bg-pink-700 text-white"
        size="lg"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("common.analyzing", lang)}</>
        ) : (
          <><Baby className="mr-2 h-5 w-5" />{tx("pregnancy.analyze", lang)}</>
        )}
      </Button>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !result.emergencyAlert && (
        <div className="space-y-4">
          {/* Fetal Development */}
          {result.fetalDevelopment && (
            <div className="rounded-xl border-2 border-pink-200 bg-pink-50 p-6 dark:bg-pink-950/20">
              <h3 className="mb-2 text-lg font-bold text-pink-700 dark:text-pink-300">
                {tx("pregnancy.development", lang)}
              </h3>
              <div className="mb-3 flex gap-4 text-sm">
                <span>{tx("pregnancy.size", lang)}: {result.fetalDevelopment.size}</span>
                <span>{tx("pregnancy.weight", lang)}: {result.fetalDevelopment.weight}</span>
              </div>
              <ul className="space-y-1">
                {result.fetalDevelopment.developments.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-pink-800 dark:text-pink-200">
                    <Heart className="mt-0.5 h-3 w-3 flex-shrink-0 text-pink-500" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medication Safety */}
          {result.unsafeMeds && result.unsafeMeds.length > 0 && (
            <div className="rounded-xl border-2 border-red-400 bg-red-50 p-6 dark:bg-red-950/30">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-red-700 dark:text-red-300">
                <ShieldAlert className="h-5 w-5" />
                {tx("pregnancy.safeMeds", lang)} — {tx("pregnancy.warning", lang)}
              </h3>
              {result.unsafeMeds.map((med, i) => (
                <div key={i} className="mb-3 rounded-lg border border-red-300 p-3 last:mb-0 dark:border-red-700">
                  <p className="font-semibold text-red-700 dark:text-red-300">{med.medication} — {tx("pregnancy.category", lang)} {med.category}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{med.risk}</p>
                  <p className="mt-1 text-sm font-medium text-red-800 dark:text-red-200">{med.action}</p>
                </div>
              ))}
            </div>
          )}

          {result.safeMeds && result.safeMeds.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:bg-green-950/20">
              <h3 className="mb-3 text-lg font-bold text-green-700 dark:text-green-300">
                {tx("pregnancy.safeMeds", lang)} — {tx("pregnancy.safe", lang)}
              </h3>
              {result.safeMeds.map((med, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="font-medium text-green-700 dark:text-green-300">{med.medication} — {tx("pregnancy.category", lang)} {med.category}</p>
                  <p className="text-xs text-muted-foreground">{med.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Safe Supplements */}
          {result.safeSupplements?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-pink-700 dark:text-pink-300">
                {tx("pregnancy.safeSupplements", lang)}
              </h3>
              <div className="space-y-3">
                {result.safeSupplements.map((supp, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="font-semibold">{supp.name} — {supp.dose}</p>
                    <p className="text-xs text-muted-foreground">{supp.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition */}
          {result.nutritionPlan?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-pink-700 dark:text-pink-300">
                <Apple className="h-5 w-5" />
                {tx("pregnancy.nutrition", lang)}
              </h3>
              <div className="space-y-3">
                {result.nutritionPlan.map((item, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="font-semibold">{item.nutrient} — {item.amount}</p>
                    <p className="text-xs text-muted-foreground">{item.sources}</p>
                    <p className="text-xs text-pink-600 dark:text-pink-400">{item.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Signs */}
          {result.warningSignals?.length > 0 && (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6 dark:bg-amber-950/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5" />
                {tx("pregnancy.warnings", lang)}
              </h3>
              {result.warningSignals.map((ws, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="font-medium text-amber-800 dark:text-amber-200">{ws.signal}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">{ws.action}</p>
                </div>
              ))}
            </div>
          )}

          {/* Week Info */}
          {result.weekInfo && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">{result.weekInfo}</p>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
