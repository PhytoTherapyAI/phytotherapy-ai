"use client";

import { useState } from "react";
import {
  Shield,
  Loader2,
  AlertTriangle,
  Phone,
  Heart,
  LogIn,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface PTSDResult {
  pcl5Score: number | null;
  severityLevel: string;
  alertLevel: "green" | "yellow" | "red";
  professionalReferral: boolean;
  crisisAlert: boolean;
  crisisMessage?: string;
  crisisLines: string[];
  copingStrategies: Array<{ strategy: string; description: string; when: string }>;
  groundingExercises: Array<{ name: string; steps: string[]; duration: string }>;
  safetyPlan?: string[];
  medicationNotes?: string;
  recommendations?: string[];
  professionalResources?: string[];
}

const PCL5_EN = [
  "Repeated, disturbing, and unwanted memories of the stressful experience",
  "Feeling very upset when something reminded you of the stressful experience",
  "Avoiding memories, thoughts, or feelings related to the stressful experience",
  "Having strong negative beliefs about yourself, other people, or the world",
  "Being 'super alert' or watchful or on guard",
];
const PCL5_TR = [
  "Stresli deneyimin tekrarlayan, rahatsiz edici ve istenmeyen anilari",
  "Stresli deneyimi hatirlatan bir sey oldugunda cok uzgun hissetme",
  "Stresli deneyimle ilgili anilari, dusunceleri veya duygulari kacinma",
  "Kendiniz, diger insanlar veya dünya hakkinda guclu olumsuz inanclar",
  "Asiri tetikte, dikkatli veya tedbirli olma",
];

const OPTIONS_EN = ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"];
const OPTIONS_TR = ["Hic", "Biraz", "Orta derecede", "Oldukca fazla", "Son derece"];

export default function PTSDSupportPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [pcl5Answers, setPcl5Answers] = useState<number[]>(Array(5).fill(-1));
  const [triggerCount, setTriggerCount] = useState(0);
  const [flashbackCount, setFlashbackCount] = useState(0);
  const [nightmareCount, setNightmareCount] = useState(0);
  const [groundingUsed, setGroundingUsed] = useState(false);
  const [avoidanceLevel, setAvoidanceLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PTSDResult | null>(null);
  const [showGrounding, setShowGrounding] = useState(false);

  const questions = lang === "tr" ? PCL5_TR : PCL5_EN;
  const options = lang === "tr" ? OPTIONS_TR : OPTIONS_EN;

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const pcl5Valid = pcl5Answers.every((a) => a >= 0);
      const res = await fetch("/api/ptsd-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          pcl5_answers: pcl5Valid ? pcl5Answers : [],
          trigger_count: triggerCount,
          flashback_count: flashbackCount,
          nightmare_count: nightmareCount,
          grounding_used: groundingUsed,
          avoidance_level: avoidanceLevel,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Assessment failed");
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
          <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-950">
            <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("ptsd.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("ptsd.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-8 text-center dark:border-teal-800 dark:bg-teal-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-teal-400" />
          <p className="text-lg font-medium text-teal-700 dark:text-teal-300">
            {lang === "tr" ? "Bu araci kullanmak için giris yapin." : "Please sign in to use this tool."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-950">
          <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("ptsd.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("ptsd.subtitle", lang)}</p>
        </div>
      </div>

      {/* Always-visible professional referral */}
      <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-950/20">
        <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
          <Heart className="mr-1.5 inline h-4 w-4" />
          {lang === "tr"
            ? "TSSB profesyonel destek gerektirir. Bu arac yardımcı bir kaynaktir, terapi yerine gecmez."
            : "PTSD requires professional support. This tool is a supportive resource, not a replacement for therapy."}
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

      {/* Alert Banners */}
      {result && !result.crisisAlert && result.alertLevel === "red" && (
        <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 p-5 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <p className="font-semibold text-red-700 dark:text-red-300">
              {lang === "tr"
                ? "Semptomlariniz şiddetli gorunuyor. Lütfen bir travma terapistiyle gorusmek için randevu alin."
                : "Your symptoms appear severe. Please consider scheduling an appointment with a trauma therapist."}
            </p>
          </div>
        </div>
      )}

      {/* PCL-5 Mini Screener */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-teal-700 dark:text-teal-300">
          {tx("ptsd.screening", lang)}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {lang === "tr"
            ? "Son 1 ay icinde asagidaki sorunlardan ne kadar rahatsiz oldunuz?"
            : "In the past month, how much were you bothered by the following?"}
        </p>
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">{qi + 1}. {q}</p>
              <div className="flex flex-wrap gap-1.5">
                {options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => {
                      const newAnswers = [...pcl5Answers];
                      newAnswers[qi] = oi;
                      setPcl5Answers(newAnswers);
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      pcl5Answers[qi] === oi
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                    }`}
                  >
                    {opt} ({oi})
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Log */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-teal-700 dark:text-teal-300">
          {tx("ptsd.triggerLog", lang)} ({lang === "tr" ? "bu hafta" : "this week"})
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {lang === "tr" ? "Tetikleyiciler" : "Triggers"}
            </label>
            <div className="flex items-center gap-2">
              <button onClick={() => setTriggerCount(Math.max(0, triggerCount - 1))} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">-</button>
              <span className="text-xl font-bold">{triggerCount}</span>
              <button onClick={() => setTriggerCount(triggerCount + 1)} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">+</button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {lang === "tr" ? "Flashback" : "Flashbacks"}
            </label>
            <div className="flex items-center gap-2">
              <button onClick={() => setFlashbackCount(Math.max(0, flashbackCount - 1))} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">-</button>
              <span className="text-xl font-bold">{flashbackCount}</span>
              <button onClick={() => setFlashbackCount(flashbackCount + 1)} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">+</button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {lang === "tr" ? "Kabuslar" : "Nightmares"}
            </label>
            <div className="flex items-center gap-2">
              <button onClick={() => setNightmareCount(Math.max(0, nightmareCount - 1))} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">-</button>
              <span className="text-xl font-bold">{nightmareCount}</span>
              <button onClick={() => setNightmareCount(nightmareCount + 1)} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">+</button>
            </div>
          </div>
        </div>

        {/* Avoidance + Grounding */}
        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold text-muted-foreground">
            {lang === "tr" ? "Kacinma Duzeyi" : "Avoidance Level"}: {avoidanceLevel}/10
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={avoidanceLevel}
            onChange={(e) => setAvoidanceLevel(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setGroundingUsed(!groundingUsed)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              groundingUsed ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            {lang === "tr" ? "Topraklama kullandim" : "Used grounding techniques"}
          </button>
        </div>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="mb-6 w-full bg-teal-600 hover:bg-teal-700 text-white"
        size="lg"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{lang === "tr" ? "Değerlendiriliyor..." : "Assessing..."}</>
        ) : (
          <><Shield className="mr-2 h-5 w-5" />{tx("ptsd.analyze", lang)}</>
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
          {/* PCL-5 Score */}
          {result.pcl5Score !== null && (
            <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
              <p className="text-sm text-muted-foreground">PCL-5 Mini</p>
              <p className="text-4xl font-bold">{result.pcl5Score}<span className="text-lg text-muted-foreground">/20</span></p>
              <p className="mt-1 text-sm capitalize">{result.severityLevel}</p>
            </div>
          )}

          {/* Grounding Exercises */}
          {result.groundingExercises?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <button
                onClick={() => setShowGrounding(!showGrounding)}
                className="flex w-full items-center justify-between"
              >
                <h3 className="text-lg font-bold text-teal-700 dark:text-teal-300">
                  {tx("ptsd.grounding", lang)}
                </h3>
                {showGrounding ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {showGrounding && (
                <div className="mt-4 space-y-4">
                  {result.groundingExercises.map((ex, idx) => (
                    <div key={idx} className="rounded-lg border-2 border-teal-200 p-4 dark:border-teal-800">
                      <h4 className="font-semibold text-teal-700 dark:text-teal-300">{ex.name}</h4>
                      <p className="text-xs text-muted-foreground">{ex.duration}</p>
                      <ol className="mt-2 space-y-1">
                        {ex.steps.map((step, si) => (
                          <li key={si} className="text-sm">{si + 1}. {step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Coping Strategies */}
          {result.copingStrategies?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-teal-700 dark:text-teal-300">
                {lang === "tr" ? "Basa Cikma Stratejileri" : "Coping Strategies"}
              </h3>
              {result.copingStrategies.map((cs, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <p className="font-semibold">{cs.strategy}</p>
                  <p className="text-sm text-muted-foreground">{cs.description}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">{cs.when}</p>
                </div>
              ))}
            </div>
          )}

          {/* Professional Resources */}
          {result.professionalResources && result.professionalResources.length > 0 && (
            <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-6 dark:bg-teal-950/20">
              <h3 className="mb-3 text-lg font-bold text-teal-700 dark:text-teal-300">
                {lang === "tr" ? "Profesyonel Kaynaklar" : "Professional Resources"}
              </h3>
              <ul className="space-y-2">
                {result.professionalResources.map((res, i) => (
                  <li key={i} className="text-sm text-teal-800 dark:text-teal-200">{res}</li>
                ))}
              </ul>
              <div className="mt-3 space-y-1">
                {result.crisisLines.map((line, i) => (
                  <p key={i} className="text-sm font-semibold text-teal-700 dark:text-teal-300">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-teal-700 dark:text-teal-300">
                {lang === "tr" ? "Öneriler" : "Recommendations"}
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-500" />
                    {rec}
                  </li>
                ))}
              </ul>
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
