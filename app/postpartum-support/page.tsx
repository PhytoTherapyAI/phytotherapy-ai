"use client";

import { useState } from "react";
import {
  Heart,
  Loader2,
  AlertTriangle,
  Phone,
  Shield,
  LogIn,
  Baby,
  Moon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface PostpartumResult {
  alertLevel: "green" | "yellow" | "red";
  crisisAlert: boolean;
  crisisMessage?: string;
  crisisLines: string[];
  epdsScore: number | null;
  epdsRisk: string | null;
  weeksPostpartum: number;
  breastfeeding: boolean;
  professionalReferral: boolean;
  mentalHealthCheck: { status: string; recommendations: string[] };
  breastfeedingSafeMeds: Array<{ medication: string; lactmedCategory: string; safe: boolean; note: string }>;
  recoveryTips: Array<{ area: string; tip: string; when: string }>;
  nutritionNeeds?: Array<{ nutrient: string; amount: string; why: string }>;
  sleepStrategies?: string[];
  selfCarePlan?: string[];
  warningSignsToWatch?: string[];
}

const EPDS_EN = [
  "I have been able to laugh and see the funny side of things",
  "I have looked forward with enjoyment to things",
  "I have blamed myself unnecessarily when things went wrong",
  "I have been anxious or worried for no good reason",
  "I have felt scared or panicky for no very good reason",
  "Things have been getting on top of me",
  "I have been so unhappy that I have had difficulty sleeping",
  "I have felt sad or miserable",
  "I have been so unhappy that I have been crying",
  "The thought of harming myself has occurred to me",
];
const EPDS_TR = [
  "Gulebiliyorum ve olaylarin komik tarafini gorebiliyorum",
  "Bir seyleri zevkle bekliyorum",
  "Isler ters gittiginde kendimi gereksiz yere sucluyorum",
  "Sebepsiz yere endise ediyorum veya kaygilaniyorum",
  "Sebepsiz yere korkuyorum veya panik oluyorum",
  "Isler basima yigiliyor",
  "O kadar mutsuzum ki uyumakta zorluk cekiyorum",
  "Kendimi uzgun veya mutsuz hissediyorum",
  "O kadar mutsuzum ki agliyorum",
  "Kendime zarar verme dusuncesi aklima geldi",
];

const EPDS_OPTIONS_EN = [
  ["As much as I always could", "Not quite so much now", "Definitely not so much now", "Not at all"],
  ["As much as I ever did", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"],
  ["Yes, most of the time", "Yes, some of the time", "Not very often", "No, never"],
  ["Yes, quite a lot", "Yes, sometimes", "No, not much", "No, not at all"],
  ["Yes, quite a lot", "Yes, sometimes", "No, not much", "No, not at all"],
  ["Yes, most of the time", "Yes, sometimes", "No, not often", "No, never"],
  ["Yes, most of the time", "Yes, sometimes", "Not very often", "No, not at all"],
  ["Yes, most of the time", "Yes, quite often", "Not very often", "No, not at all"],
  ["Yes, most of the time", "Yes, quite often", "Only occasionally", "No, never"],
  ["Yes, quite often", "Sometimes", "Hardly ever", "Never"],
];

export default function PostpartumSupportPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [weeksPostpartum, setWeeksPostpartum] = useState(4);
  const [breastfeeding, setBreastfeeding] = useState(false);
  const [moodScore, setMoodScore] = useState(3);
  const [sleepHours, setSleepHours] = useState(4);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [epdsAnswers, setEpdsAnswers] = useState<number[]>(Array(10).fill(-1));
  const [showEPDS, setShowEPDS] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PostpartumResult | null>(null);

  const epdsQuestions = lang === "tr" ? EPDS_TR : EPDS_EN;

  const CONCERNS_EN = ["Mood swings", "Anxiety", "Bonding difficulty", "Body image", "Relationship", "Breastfeeding issues", "Pain", "Fatigue"];
  const CONCERNS_TR = ["Ruh hali degisikligi", "Kaygi", "Baglanma guclugu", "Beden imaji", "Iliski", "Emzirme sorunlari", "Agri", "Yorgunluk"];
  const concernOptions = lang === "tr" ? CONCERNS_TR : CONCERNS_EN;

  const handleAnalyze = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const epdsValid = epdsAnswers.every((a) => a >= 0);
      const res = await fetch("/api/postpartum-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          weeks_postpartum: weeksPostpartum,
          breastfeeding,
          mood_score: moodScore,
          sleep_hours: sleepHours,
          concerns,
          epds_answers: epdsValid ? epdsAnswers : [],
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
          <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
            <Baby className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("postpartum.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("postpartum.subtitle", lang)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-8 text-center dark:border-purple-800 dark:bg-purple-950/30">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-purple-400" />
          <p className="text-lg font-medium text-purple-700 dark:text-purple-300">
            {lang === "tr" ? "Bu araci kullanmak icin giris yapin." : "Please sign in to use this tool."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
          <Baby className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("postpartum.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("postpartum.subtitle", lang)}</p>
        </div>
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

      {/* Professional Referral */}
      {result && !result.crisisAlert && result.alertLevel !== "green" && (
        <div className={`mb-6 rounded-xl border-2 p-5 ${
          result.alertLevel === "red" ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              {lang === "tr"
                ? "EPDS skorunuz profesyonel degerlendirme onermektedir. Doktorunuzla gorusun."
                : "Your EPDS score suggests professional evaluation is recommended. Please talk to your doctor."}
            </p>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="mb-6 space-y-4">
        {/* Weeks + Breastfeeding + Sleep */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {tx("postpartum.weeksSince", lang)}
            </label>
            <input
              type="number"
              min={0}
              max={52}
              value={weeksPostpartum}
              onChange={(e) => setWeeksPostpartum(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-center text-lg font-bold"
            />
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col items-center">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {tx("postpartum.breastfeeding", lang)}
            </label>
            <button
              onClick={() => setBreastfeeding(!breastfeeding)}
              className={`mt-1 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                breastfeeding ? "bg-purple-500 text-white" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {breastfeeding ? (lang === "tr" ? "Evet" : "Yes") : (lang === "tr" ? "Hayir" : "No")}
            </button>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              <Moon className="mr-1 inline h-3 w-3" />
              {lang === "tr" ? "Uyku (saat)" : "Sleep (hrs)"}
            </label>
            <input
              type="number"
              min={0}
              max={24}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-center text-lg font-bold"
            />
          </div>
        </div>

        {/* Mood Score */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-muted-foreground">
            {lang === "tr" ? "Ruh Hali" : "Mood"}: {moodScore}/5
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={moodScore}
            onChange={(e) => setMoodScore(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Concerns */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-muted-foreground">
            {lang === "tr" ? "Endiseler" : "Concerns"}
          </label>
          <div className="flex flex-wrap gap-2">
            {concernOptions.map((c) => (
              <button
                key={c}
                onClick={() => setConcerns((prev) =>
                  prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                )}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  concerns.includes(c)
                    ? "bg-purple-500 text-white"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* EPDS */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <button onClick={() => setShowEPDS(!showEPDS)} className="flex w-full items-center justify-between">
            <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {tx("postpartum.epds", lang)} ({lang === "tr" ? "Istege Bagli" : "Optional"})
            </h2>
            {showEPDS ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showEPDS && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {lang === "tr" ? "Son 7 gun icinde kendinizi nasil hissettiniz?" : "In the past 7 days, how have you felt?"}
              </p>
              {epdsQuestions.map((q, qi) => (
                <div key={qi} className={`rounded-lg border p-3 ${qi === 9 ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10" : ""}`}>
                  <p className="mb-2 text-sm font-medium">
                    {qi + 1}. {q}
                    {qi === 9 && <span className="ml-2 text-xs text-red-500">({lang === "tr" ? "kritik" : "critical"})</span>}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EPDS_OPTIONS_EN[qi].map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => {
                          const newAnswers = [...epdsAnswers];
                          newAnswers[qi] = oi;
                          setEpdsAnswers(newAnswers);
                        }}
                        className={`rounded-lg px-2 py-1.5 text-xs transition-colors ${
                          epdsAnswers[qi] === oi
                            ? qi === 9 && oi < 3 ? "bg-red-500 text-white" : "bg-purple-500 text-white"
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
          )}
        </div>
      </div>

      <Button onClick={handleAnalyze} disabled={isLoading} className="mb-6 w-full bg-purple-600 hover:bg-purple-700 text-white" size="lg">
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{lang === "tr" ? "Degerlendiriliyor..." : "Assessing..."}</>
        ) : (
          <><Shield className="mr-2 h-5 w-5" />{tx("postpartum.analyze", lang)}</>
        )}
      </Button>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      {result && !result.crisisAlert && (
        <div className="space-y-4">
          {/* EPDS Score */}
          {result.epdsScore !== null && (
            <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
              <p className="text-sm text-muted-foreground">{tx("postpartum.epds", lang)}</p>
              <p className="text-4xl font-bold">{result.epdsScore}<span className="text-lg text-muted-foreground">/30</span></p>
              <p className="mt-1 text-sm capitalize">{result.epdsRisk}</p>
            </div>
          )}

          {/* Mental Health Check */}
          {result.mentalHealthCheck && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold text-purple-700 dark:text-purple-300">
                {lang === "tr" ? "Ruh Sagligi Durumu" : "Mental Health Check"}
              </h3>
              <p className="text-sm text-muted-foreground">{result.mentalHealthCheck.status}</p>
              {result.mentalHealthCheck.recommendations.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.mentalHealthCheck.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Heart className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Breastfeeding Medication Safety */}
          {breastfeeding && result.breastfeedingSafeMeds?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-purple-700 dark:text-purple-300">
                {tx("postpartum.medSafety", lang)}
              </h3>
              {result.breastfeedingSafeMeds.map((med, i) => (
                <div key={i} className={`mb-2 rounded-lg border p-3 last:mb-0 ${
                  med.safe ? "border-green-200 bg-green-50/50 dark:bg-green-950/10" : "border-red-200 bg-red-50/50 dark:bg-red-950/10"
                }`}>
                  <p className="font-medium">{med.medication} — {med.lactmedCategory}</p>
                  <p className="text-xs text-muted-foreground">{med.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recovery Tips */}
          {result.recoveryTips?.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-purple-700 dark:text-purple-300">
                {lang === "tr" ? "Toparlanma Önerileri" : "Recovery Tips"}
              </h3>
              {result.recoveryTips.map((tip, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="font-semibold">{tip.area}</p>
                  <p className="text-sm text-muted-foreground">{tip.tip}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">{tip.when}</p>
                </div>
              ))}
            </div>
          )}

          {/* Self Care */}
          {result.selfCarePlan && result.selfCarePlan.length > 0 && (
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6 dark:bg-purple-950/20">
              <h3 className="mb-3 text-lg font-bold text-purple-700 dark:text-purple-300">
                {lang === "tr" ? "Oz Bakim Plani" : "Self-Care Plan"}
              </h3>
              <ul className="space-y-2">
                {result.selfCarePlan.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-200">
                    <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
