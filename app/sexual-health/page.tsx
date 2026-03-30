"use client";

import { useState } from "react";
import {
  Heart,
  Loader2,
  Shield,
  LogIn,
  Pill,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SexualHealthResult {
  age: number;
  gender: string;
  preMatchedEffects: Array<{ medication: string; effect: string; prevalence: string }>;
  medicationSexualEffects: Array<{ medication: string; effects: string; prevalence: string; alternatives: string; action: string }>;
  screeningSchedule: Array<{ test: string; frequency: string; ageGroup: string; note: string }>;
  concernAddressed: Array<{ concern: string; information: string; recommendation: string }>;
  safetyInfo: string[];
  recommendations: string[];
  supplementSuggestions?: Array<{ name: string; evidence: string; safetyNote: string }>;
  professionalReferral: boolean;
}

const CONCERNS_EN = [
  "Low libido", "Erectile dysfunction", "Pain during intercourse",
  "Delayed orgasm", "Premature ejaculation", "Vaginal dryness",
  "Medication side effects", "STI screening", "Contraception info",
  "Menstrual irregularity", "Fertility concerns",
];
const CONCERNS_TR = [
  "Düşük cinsel istek", "Ereksiyon bozuklugu", "Cinsel iliski sirasinda ağrı",
  "Gecikmiş orgazm", "Erken bosalma", "Vajinal kuruluk",
  "İlaç yan etkileri", "Cinsel yolla bulasan hastalık taramasi", "Kontrasepsiyon bilgisi",
  "Adet duzensizligi", "Dogurganlik endisesi",
];

export default function SexualHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("not_specified");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SexualHealthResult | null>(null);
  const [showScreening, setShowScreening] = useState(false);

  const concerns = lang === "tr" ? CONCERNS_TR : CONCERNS_EN;
  const concernValues = CONCERNS_EN;

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/sexual-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          concerns: selectedConcerns,
          age,
          gender,
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
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
            <Heart className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">{tx("sexual.title", lang)}</h1>
            <p className="text-sm text-muted-foreground">{tx("sexual.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            {tx("common.loginToUse2", lang)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
          <Heart className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">{tx("sexual.title", lang)}</h1>
          <p className="text-sm text-muted-foreground">{tx("sexual.subtitle", lang)}</p>
        </div>
      </div>

      {/* Age + Gender */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <label className="mb-1 block text-sm font-semibold text-muted-foreground">{tx("common.age", lang)}</label>
          <input type="number" min={18} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-24 rounded-lg border bg-background px-3 py-2 text-center text-lg font-bold" />
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <label className="mb-1 block text-sm font-semibold text-muted-foreground">{tx("common.gender", lang)}</label>
          <div className="flex gap-2">
            {[
              { value: "male", label: tx("common.male", lang) },
              { value: "female", label: tx("common.female", lang) },
              { value: "not_specified", label: tx("sexual.preferNotToSay", lang) },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  gender === g.value ? "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900" : "bg-gray-100 dark:bg-gray-800"
                }`}
              >{g.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Concerns */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {tx("sexual.selectConcerns", lang)}
        </h2>
        <div className="flex flex-wrap gap-2">
          {concerns.map((c, i) => (
            <button
              key={c}
              onClick={() => setSelectedConcerns((prev) =>
                prev.includes(concernValues[i]) ? prev.filter((x) => x !== concernValues[i]) : [...prev, concernValues[i]]
              )}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                selectedConcerns.includes(concernValues[i])
                  ? "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>

      <Button onClick={handleAnalyze} disabled={isLoading} className="mb-6 w-full bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-600 dark:hover:bg-slate-500" size="lg">
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("common.analyzing", lang)}</>
        ) : (
          <><Pill className="mr-2 h-5 w-5" />{tx("sexual.analyze", lang)}</>
        )}
      </Button>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* Medication Sexual Effects */}
          {result.medicationSexualEffects?.length > 0 && (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6 dark:bg-amber-950/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-300">
                <Pill className="h-5 w-5" />
                {tx("sexual.medEffects", lang)}
              </h3>
              {result.medicationSexualEffects.map((me, i) => (
                <div key={i} className="mb-3 rounded-lg border border-amber-300 p-3 last:mb-0 dark:border-amber-700">
                  <p className="font-semibold">{me.medication}</p>
                  <p className="text-sm text-muted-foreground">{me.effects}</p>
                  <p className="text-xs text-amber-600">{tx("sexual.prevalence", lang)}: {me.prevalence}</p>
                  {me.alternatives && <p className="text-xs text-green-600 dark:text-green-400">{me.alternatives}</p>}
                  <p className="mt-1 text-xs font-medium">{me.action}</p>
                </div>
              ))}
            </div>
          )}

          {/* Concerns Addressed */}
          {result.concernAddressed?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-slate-700 dark:text-slate-300">
                {tx("sexual.yourConcerns", lang)}
              </h3>
              {result.concernAddressed.map((ca, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <p className="font-semibold">{ca.concern}</p>
                  <p className="text-sm text-muted-foreground">{ca.information}</p>
                  <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{ca.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* STI Screening Schedule */}
          {result.screeningSchedule?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <button onClick={() => setShowScreening(!showScreening)} className="flex w-full items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="h-5 w-5" />
                  {tx("sexual.screening", lang)}
                </h3>
                {showScreening ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {showScreening && (
                <div className="mt-4 space-y-3">
                  {result.screeningSchedule.map((s, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="font-semibold">{s.test}</p>
                      <p className="text-xs text-muted-foreground">{s.frequency} - {s.ageGroup}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{s.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Safety Info */}
          {result.safetyInfo?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-slate-700 dark:text-slate-300">
                {tx("sexual.safetyInfo", lang)}
              </h3>
              <ul className="space-y-2">
                {result.safetyInfo.map((info, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" /> {info}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-slate-700 dark:text-slate-300">
                {tx("common.recommendations", lang)}
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" /> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Professional Referral */}
          {result.professionalReferral && (
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 dark:bg-slate-950/20">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {tx("sexual.professionalReferral", lang)}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
