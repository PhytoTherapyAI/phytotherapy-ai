// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Heart,
  Loader2,
  AlertTriangle,
  Phone,
  Shield,
  LogIn,
  Award,
  Clock,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface RecoveryResult {
  cleanDays: number;
  substance: string;
  milestone: { days: number; label: string } | null;
  nextMilestone: { days: number; label: string } | null;
  alertLevel: "green" | "yellow" | "red";
  crisisAlert: boolean;
  crisisMessage?: string;
  crisisLines: string[];
  cravingAnalysis: string;
  copingStrategies: Array<{ strategy: string; description: string; when: string }>;
  triggerManagement: Array<{ trigger: string; plan: string }>;
  milestoneMessage: string;
  healthBenefits: string[];
  medicationNotes?: string;
  supplementSuggestions?: Array<{ name: string; benefit: string; safetyNote: string }>;
  dailyAffirmation: string;
  professionalReferral: boolean;
}

const SUBSTANCES = [
  { en: "Alcohol", tr: "Alkol" },
  { en: "Tobacco", tr: "Tutun" },
  { en: "Cannabis", tr: "Esrar" },
  { en: "Opioids", tr: "Opioidler" },
  { en: "Stimulants", tr: "Uyarıcilar" },
  { en: "Gambling", tr: "Kumar" },
  { en: "Social Media", tr: "Sosyal Medya" },
  { en: "Other", tr: "Diger" },
];

const TRIGGERS = [
  { en: "Stress", tr: "Stres" },
  { en: "Social pressure", tr: "Sosyal baskı" },
  { en: "Boredom", tr: "Sıkıntı" },
  { en: "Loneliness", tr: "Yalnızlık" },
  { en: "Celebration", tr: "Kutlama" },
  { en: "Pain", tr: "Ağrı" },
  { en: "Sleep problems", tr: "Uyku sorunu" },
  { en: "Conflict", tr: "Çatışma" },
];

const SUPPORT = [
  { en: "AA/NA meeting", tr: "AA/NA toplantısı" },
  { en: "Therapist", tr: "Terapist" },
  { en: "Sponsor call", tr: "Sponsor araması" },
  { en: "Exercise", tr: "Egzersiz" },
  { en: "Meditation", tr: "Meditasyon" },
  { en: "Support group", tr: "Destek grubu" },
  { en: "Journal", tr: "Günlük" },
  { en: "Friend/family", tr: "Arkadas/aile" },
];

export default function AddictionRecoveryPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [substance, setSubstance] = useState("alcohol");
  const [cleanDays, setCleanDays] = useState(0);
  const [cravingLevel, setCravingLevel] = useState(3);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedSupport, setSelectedSupport] = useState<string[]>([]);
  const [relapseRisk, setRelapseRisk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecoveryResult | null>(null);

  const l = lang as "en" | "tr";
  const substanceValues = ["alcohol", "tobacco", "cannabis", "opioids", "stimulants", "gambling", "social_media", "other"];

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/addiction-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          substance,
          clean_days: cleanDays,
          craving_level: cravingLevel,
          triggers: selectedTriggers,
          support_used: selectedSupport,
          relapse_risk: relapseRisk,
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
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
            <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("recovery.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("recovery.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50/50 p-8 text-center dark:border-green-800 dark:bg-green-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-green-400" />
          <p className="text-lg font-medium text-green-700 dark:text-green-300">
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
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
          <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("recovery.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("recovery.subtitle", lang)}</p>
        </div>
      </div>

      {/* Emergency Support */}
      <div className="mb-6 rounded-xl border-2 border-green-300 bg-green-50 p-4 dark:bg-green-950/20">
        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
          <Phone className="mr-1.5 inline h-4 w-4" />
          {tx("recovery.emergency", lang)}{" "}
          <span className="font-bold">{tx("addictionRecovery.crisisLine", lang)}</span>
        </p>
      </div>

      {/* Crisis Alert */}
      {result?.crisisAlert && (
        <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 p-6 dark:bg-red-950/40">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-300">{result.crisisMessage}</p>
              <div className="mt-3 space-y-1">
                {result.crisisLines.map((line, i) => (
                  <p key={i} className="text-lg font-bold text-red-600">{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Substance Selector */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {tx("addictionRecovery.substanceBehavior", lang)}
        </h2>
        <div className="flex flex-wrap gap-2">
          {SUBSTANCES.map((s, i) => (
            <button
              key={s.en}
              onClick={() => setSubstance(substanceValues[i])}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                substance === substanceValues[i]
                  ? "bg-green-500 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300"
              }`}
            >
              {s[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Days Counter */}
      <div className="mb-6 rounded-xl border bg-card p-8 shadow-sm text-center">
        <h2 className="text-sm font-semibold text-muted-foreground">{tx("recovery.cleanDays", lang)}</h2>
        <div className="mt-2 flex items-center justify-center gap-4">
          <button
            onClick={() => setCleanDays(Math.max(0, cleanDays - 1))}
            className="rounded-lg bg-gray-100 px-4 py-2 text-xl font-bold dark:bg-gray-800"
          >-</button>
          <span className="text-6xl font-bold text-green-600 dark:text-green-400">{cleanDays}</span>
          <button
            onClick={() => setCleanDays(cleanDays + 1)}
            className="rounded-lg bg-gray-100 px-4 py-2 text-xl font-bold dark:bg-gray-800"
          >+</button>
        </div>
      </div>

      {/* Craving Level */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-green-700 dark:text-green-300">
          <Flame className="h-5 w-5" />
          {tx("recovery.craving", lang)}: {cravingLevel}/10
        </h2>
        <input
          type="range"
          min={1}
          max={10}
          value={cravingLevel}
          onChange={(e) => setCravingLevel(Number(e.target.value))}
          className="w-full accent-green-500"
        />
        {cravingLevel >= 8 && (
          <p className="mt-2 text-sm font-semibold text-red-600">
            {tx("addictionRecovery.cravingHigh", lang)}
          </p>
        )}
      </div>

      {/* Triggers & Support */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {tx("addictionRecovery.todaysTriggers", lang)}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {TRIGGERS.map((t) => (
              <button
                key={t.en}
                onClick={() => setSelectedTriggers((prev) =>
                  prev.includes(t.en) ? prev.filter((x) => x !== t.en) : [...prev, t.en]
                )}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  selectedTriggers.includes(t.en)
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800"
                }`}
              >
                {t[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {tx("addictionRecovery.supportUsed", lang)}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORT.map((s) => (
              <button
                key={s.en}
                onClick={() => setSelectedSupport((prev) =>
                  prev.includes(s.en) ? prev.filter((x) => x !== s.en) : [...prev, s.en]
                )}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  selectedSupport.includes(s.en)
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800"
                }`}
              >
                {s[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Relapse Risk Toggle */}
      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {tx("addictionRecovery.relapseRisk", lang)}
          </span>
          <button
            onClick={() => setRelapseRisk(!relapseRisk)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              relapseRisk ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              relapseRisk ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="mb-6 w-full bg-green-600 hover:bg-green-700 text-white"
        size="lg"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("common.analyzing", lang)}</>
        ) : (
          <><Shield className="mr-2 h-5 w-5" />{tx("addictionRecovery.getSupport", lang)}</>
        )}
      </Button>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !result.crisisAlert && (
        <div className="space-y-4">
          {/* Milestone Card */}
          {result.milestone && (
            <div className="rounded-xl border-2 border-green-400 bg-green-50 p-6 text-center dark:bg-green-950/30">
              <Award className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                {tx("recovery.milestone", lang)}: {result.milestone.label}
              </h3>
              <p className="mt-2 text-green-600 dark:text-green-400">{result.milestoneMessage}</p>
              {result.nextMilestone && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <Clock className="mr-1 inline h-4 w-4" />
                  {tx("addictionRecovery.nextMilestone", lang)}: {result.nextMilestone.label} ({result.nextMilestone.days - result.cleanDays} {tx("addictionRecovery.daysToGo", lang)})
                </p>
              )}
            </div>
          )}

          {/* Daily Affirmation */}
          {result.dailyAffirmation && (
            <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-5 text-center dark:bg-green-950/10">
              <p className="text-lg italic text-green-700 dark:text-green-300">
                &quot;{result.dailyAffirmation}&quot;
              </p>
            </div>
          )}

          {/* Craving Analysis */}
          {result.cravingAnalysis && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold text-green-700 dark:text-green-300">
                {tx("addictionRecovery.cravingAnalysis", lang)}
              </h3>
              <p className="text-sm text-muted-foreground">{result.cravingAnalysis}</p>
            </div>
          )}

          {/* Coping Strategies */}
          {result.copingStrategies?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-green-700 dark:text-green-300">
                {tx("addictionRecovery.copingStrategies", lang)}
              </h3>
              {result.copingStrategies.map((cs, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <p className="font-semibold">{cs.strategy}</p>
                  <p className="text-sm text-muted-foreground">{cs.description}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{cs.when}</p>
                </div>
              ))}
            </div>
          )}

          {/* Health Benefits */}
          {result.healthBenefits?.length > 0 && (
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 dark:bg-green-950/20">
              <h3 className="mb-3 text-lg font-bold text-green-700 dark:text-green-300">
                {tx("addictionRecovery.healthBenefits", lang)}
              </h3>
              <ul className="space-y-2">
                {result.healthBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                    <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Crisis Resources (always visible) */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              {tx("addictionRecovery.supportLines", lang)}
            </h3>
            <div className="space-y-1">
              {result.crisisLines.map((line, i) => (
                <p key={i} className="text-sm font-medium text-green-700 dark:text-green-300">
                  <Phone className="mr-1 inline h-3 w-3" /> {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
