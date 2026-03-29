"use client";

import { useState } from "react";
import {
  Baby,
  Loader2,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Home,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  LogIn,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface PossibleExplanation {
  cause: string;
  likelihood: "common" | "less_common" | "rare";
  description: string;
}

interface HomeCareItem {
  tip: string;
  detail: string;
}

interface SourceItem {
  title: string;
  url: string;
}

interface ChildResult {
  triage: "urgent" | "doctor" | "home";
  title: string;
  summary: string;
  ageGroup: string;
  possibleExplanations: PossibleExplanation[];
  homeCare: HomeCareItem[];
  whenToWorry: string[];
  whenToSeeDoctor: string[];
  developmentalInfo: string;
  preventionTips: string[];
  safeOTCNote: string;
  sources: SourceItem[];
}

const CONCERNS = [
  { key: "fever", icon: Thermometer },
  { key: "cough", icon: Stethoscope },
  { key: "rash", icon: ShieldAlert },
  { key: "feeding", icon: Baby },
  { key: "sleepIssue", icon: Home },
  { key: "growth", icon: Info },
  { key: "vaccination", icon: CheckCircle2 },
];

export default function ChildHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [childAge, setChildAge] = useState("");
  const [ageUnit, setAgeUnit] = useState<"months" | "years">("years");
  const [selectedConcern, setSelectedConcern] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ChildResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    explanations: true,
    homeCare: true,
    whenToWorry: true,
    doctor: true,
    prevention: false,
    sources: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAnalyze = async () => {
    if (!childAge || Number(childAge) <= 0) {
      setError(tx("child.age", lang) + " required");
      return;
    }
    if (!selectedConcern) {
      setError(tx("child.concern", lang) + " required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/child-health", {
        method: "POST",
        headers,
        body: JSON.stringify({
          child_age: Number(childAge),
          age_unit: ageUnit,
          concern: selectedConcern,
          notes: notes.trim(),
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get guidance");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const triageBanner = (triage: string) => {
    switch (triage) {
      case "urgent":
        return {
          bg: "bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-800",
          text: "text-red-800 dark:text-red-300",
          icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />,
          label: lang === "tr" ? "Acil - Hemen Doktora Başvurun" : "Urgent - Seek Immediate Medical Attention",
        };
      case "doctor":
        return {
          bg: "bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800",
          text: "text-amber-800 dark:text-amber-300",
          icon: <Stethoscope className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
          label: lang === "tr" ? "Doktora Danışmanizi Oneririz" : "We Recommend Seeing a Doctor",
        };
      default:
        return {
          bg: "bg-green-100 border-green-300 dark:bg-green-950/40 dark:border-green-800",
          text: "text-green-800 dark:text-green-300",
          icon: <Home className="h-5 w-5 text-green-600 dark:text-green-400" />,
          label: lang === "tr" ? "Evde Bakim Yeterli Olabilir" : "Home Care May Be Sufficient",
        };
    }
  };

  const likelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "common":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300";
      case "less_common":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const SectionHeader = ({ title, icon: Icon, sectionKey, count }: { title: string; icon: React.ElementType; sectionKey: string; count?: number }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex w-full items-center justify-between rounded-t-lg border-b bg-sky-50/50 px-4 py-3 text-left dark:bg-sky-950/20"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        <span className="text-sm font-semibold">{title}</span>
        {count !== undefined && (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900 dark:text-sky-300">
            {count}
          </span>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-950">
          <Baby className="h-6 w-6 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("child.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("child.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50/50 p-3 text-xs text-sky-800 dark:border-sky-800 dark:bg-sky-950/20 dark:text-sky-300">
        <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
        {tx("child.disclaimer", lang)}
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/30 p-3 text-xs text-sky-800 dark:border-sky-800 dark:bg-sky-950/10 dark:text-sky-300">
          <LogIn className="h-3.5 w-3.5 shrink-0" />
          {lang === "tr" ? "Kaydı tutmak için giriş yapın" : "Sign in to save your query history"}
        </div>
      )}

      {!result && (
        <>
          {/* Age Input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("child.age", lang)}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max={ageUnit === "months" ? 240 : 18}
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                placeholder="0"
                className="w-24 rounded-lg border bg-background px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <div className="flex overflow-hidden rounded-lg border">
                <button
                  onClick={() => setAgeUnit("months")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    ageUnit === "months"
                      ? "bg-sky-600 text-white"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {tx("child.months", lang)}
                </button>
                <button
                  onClick={() => setAgeUnit("years")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    ageUnit === "years"
                      ? "bg-sky-600 text-white"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {tx("child.years", lang)}
                </button>
              </div>
            </div>
          </div>

          {/* Concern Selection */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("child.concern", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CONCERNS.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedConcern(key)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                    selectedConcern === key
                      ? "border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950 dark:text-sky-300"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tx(`child.${key}`, lang)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {lang === "tr" ? "Ek Notlar (isteğe bağlı)" : "Additional Notes (optional)"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === "tr" ? "Belirtiler, sure, diger detaylar..." : "Symptoms, duration, other details..."}
              maxLength={2000}
              rows={3}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !selectedConcern || !childAge}
            className="w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("child.analyzing", lang)}
              </>
            ) : (
              <>
                <Baby className="h-4 w-4" />
                {tx("child.analyze", lang)}
              </>
            )}
          </Button>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Triage Banner */}
          {(() => {
            const t = triageBanner(result.triage);
            return (
              <div className={`flex items-center gap-3 rounded-lg border p-4 ${t.bg}`}>
                {t.icon}
                <div>
                  <p className={`text-sm font-bold ${t.text}`}>{t.label}</p>
                  <p className="text-sm">{result.title}</p>
                </div>
              </div>
            );
          })()}

          {/* Summary */}
          <div className="rounded-lg border bg-sky-50/30 p-4 dark:bg-sky-950/10">
            <p className="text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Possible Explanations */}
          {result.possibleExplanations?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={lang === "tr" ? "Olasi Nedenler" : "Possible Explanations"}
                icon={Info}
                sectionKey="explanations"
                count={result.possibleExplanations.length}
              />
              {expandedSections.explanations && (
                <div className="p-4 space-y-2">
                  {result.possibleExplanations.map((e, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{e.cause}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${likelihoodColor(e.likelihood)}`}>
                          {e.likelihood === "common" ? (lang === "tr" ? "Yaygin" : "Common") :
                           e.likelihood === "less_common" ? (lang === "tr" ? "Daha Az Yaygin" : "Less Common") :
                           (lang === "tr" ? "Nadir" : "Rare")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Home Care */}
          {result.homeCare?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={lang === "tr" ? "Evde Bakim" : "Home Care"}
                icon={Home}
                sectionKey="homeCare"
                count={result.homeCare.length}
              />
              {expandedSections.homeCare && (
                <div className="p-4 space-y-2">
                  {result.homeCare.map((h, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{h.tip}</p>
                      <p className="text-xs text-muted-foreground">{h.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* When to Worry */}
          {result.whenToWorry?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={lang === "tr" ? "Ne Zaman Endiselenin" : "When to Worry"}
                icon={AlertTriangle}
                sectionKey="whenToWorry"
                count={result.whenToWorry.length}
              />
              {expandedSections.whenToWorry && (
                <div className="p-4 space-y-1">
                  {result.whenToWorry.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 rounded p-2 text-sm">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      <p>{w}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* When to See Doctor */}
          {result.whenToSeeDoctor?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("common.whenToSeeDoctor", lang)}
                icon={Stethoscope}
                sectionKey="doctor"
                count={result.whenToSeeDoctor.length}
              />
              {expandedSections.doctor && (
                <div className="p-4 space-y-1">
                  {result.whenToSeeDoctor.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 rounded p-2 text-sm">
                      <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <p>{d}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Developmental Info */}
          {result.developmentalInfo && (
            <div className="rounded-lg border border-sky-200 bg-sky-50/30 p-4 dark:border-sky-800 dark:bg-sky-950/10">
              <p className="mb-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
                {lang === "tr" ? "Gelisim Bilgisi" : "Developmental Context"}
              </p>
              <p className="text-sm">{result.developmentalInfo}</p>
            </div>
          )}

          {/* OTC Note */}
          {result.safeOTCNote && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/30 p-3 dark:border-amber-800 dark:bg-amber-950/20">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mr-1 inline h-3 w-3" />
                {result.safeOTCNote}
              </p>
            </div>
          )}

          {/* Prevention */}
          {result.preventionTips?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={lang === "tr" ? "Onleme" : "Prevention"}
                icon={CheckCircle2}
                sectionKey="prevention"
                count={result.preventionTips.length}
              />
              {expandedSections.prevention && (
                <div className="p-4 space-y-1">
                  {result.preventionTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 text-sky-500">-</span>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sources */}
          {result.sources?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("common.sources", lang)}
                icon={Info}
                sectionKey="sources"
                count={result.sources.length}
              />
              {expandedSections.sources && (
                <div className="p-4 space-y-1">
                  {result.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-sky-600 hover:underline dark:text-sky-400"
                    >
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Search */}
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setSelectedConcern("");
              setChildAge("");
              setNotes("");
            }}
            className="w-full"
          >
            {lang === "tr" ? "Yeni Arama" : "New Search"}
          </Button>
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("child.disclaimer", lang)}
      </p>
    </div>
  );
}
