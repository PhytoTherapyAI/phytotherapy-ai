"use client";

import { useState } from "react";
import {
  FileText,
  Loader2,
  Download,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Pill,
  Heart,
  MessageSquare,
  LogIn,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface LabHighlight {
  test: string;
  value: string;
  status: "normal" | "borderline" | "abnormal";
  note: string;
}

interface VitalTrend {
  vital: string;
  trend: "stable" | "improving" | "worsening";
  latestValue: string;
  note: string;
}

interface MedicationEntry {
  name: string;
  dosage: string;
  purpose: string;
}

interface AppointmentResult {
  patientOverview: string;
  currentMedications: MedicationEntry[];
  recentChanges: string[];
  labHighlights: LabHighlight[];
  vitalTrends: VitalTrend[];
  symptomSummary: string;
  supplementsInUse: string[];
  suggestedQuestions: string[];
  concerns: string;
  clinicalNotes: string;
}

export default function AppointmentPrepPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [concerns, setConcerns] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AppointmentResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    medications: true,
    labs: true,
    vitals: true,
    questions: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/appointment-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ concerns: concerns.trim(), lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const trendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="h-3.5 w-3.5 text-green-600" />;
    if (trend === "worsening") return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const statusBadge = (status: string) => {
    if (status === "normal") return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Normal</span>;
    if (status === "borderline") return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Borderline</span>;
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">Abnormal</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-12 text-center dark:border-sky-800 dark:bg-sky-950/20">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-sky-400" />
          <p className="text-sm text-muted-foreground">{tx("appt.loginRequired", lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-950">
          <ClipboardList className="h-6 w-6 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("appt.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("appt.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Concerns Input */}
      {!result && (
        <>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("appt.concerns", lang)}
            </label>
            <textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder={tx("appt.concernsPlaceholder", lang)}
              rows={4}
              maxLength={2000}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {concerns.length}/2000
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("appt.generating", lang)}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                {tx("appt.generate", lang)}
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
        <div className="space-y-4 print:space-y-2" id="appointment-summary">
          {/* Print Header (hidden on screen) */}
          <div className="hidden print:block print:mb-4">
            <h2 className="text-xl font-bold">Phytotherapy.ai - Patient Summary</h2>
            <p className="text-sm text-gray-500" suppressHydrationWarning>Generated: {new Date().toLocaleDateString()}</p>
            <hr className="mt-2" />
          </div>

          {/* Patient Overview */}
          <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-950/20">
            <button
              onClick={() => toggleSection("overview")}
              className="flex w-full items-center justify-between"
            >
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-sky-700 dark:text-sky-400">
                <Heart className="h-3.5 w-3.5" />
                {tx("appt.overview", lang)}
              </h3>
              {expandedSections.overview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.overview && (
              <p className="mt-2 text-sm leading-relaxed">{result.patientOverview}</p>
            )}
          </div>

          {/* Current Medications */}
          {result.currentMedications && result.currentMedications.length > 0 && (
            <div className="rounded-lg border p-4">
              <button
                onClick={() => toggleSection("medications")}
                className="flex w-full items-center justify-between"
              >
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Pill className="h-3.5 w-3.5 text-sky-500" />
                  {tx("appt.currentMedications", lang)}
                </h3>
                {expandedSections.medications ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.medications && (
                <div className="mt-3 space-y-2">
                  {result.currentMedications.map((m, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.purpose}</p>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{m.dosage}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Changes */}
          {result.recentChanges && result.recentChanges.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                {tx("appt.recentChanges", lang)}
              </h3>
              <ul className="space-y-1">
                {result.recentChanges.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lab Highlights */}
          {result.labHighlights && result.labHighlights.length > 0 && (
            <div className="rounded-lg border p-4">
              <button
                onClick={() => toggleSection("labs")}
                className="flex w-full items-center justify-between"
              >
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <FileText className="h-3.5 w-3.5 text-sky-500" />
                  {tx("appt.labHighlights", lang)}
                </h3>
                {expandedSections.labs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.labs && (
                <div className="mt-3 space-y-2">
                  {result.labHighlights.map((l, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{l.test}</p>
                          {statusBadge(l.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">{l.note}</p>
                      </div>
                      <span className={`text-sm font-bold ${
                        l.status === "normal" ? "text-green-600" : l.status === "borderline" ? "text-amber-600" : "text-red-600"
                      }`}>
                        {l.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vital Trends */}
          {result.vitalTrends && result.vitalTrends.length > 0 && (
            <div className="rounded-lg border p-4">
              <button
                onClick={() => toggleSection("vitals")}
                className="flex w-full items-center justify-between"
              >
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
                  {tx("appt.vitalTrends", lang)}
                </h3>
                {expandedSections.vitals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.vitals && (
                <div className="mt-3 space-y-2">
                  {result.vitalTrends.map((v, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5">
                      <div className="flex items-center gap-2">
                        {trendIcon(v.trend)}
                        <div>
                          <p className="text-sm font-medium">{v.vital}</p>
                          <p className="text-xs text-muted-foreground">{v.note}</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono">{v.latestValue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Symptom Summary */}
          {result.symptomSummary && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
                {tx("appt.symptomSummary", lang)}
              </h3>
              <p className="text-sm leading-relaxed">{result.symptomSummary}</p>
            </div>
          )}

          {/* Patient Concerns */}
          {result.concerns && (
            <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-950/20">
              <h3 className="mb-2 text-sm font-semibold text-sky-700 dark:text-sky-400">
                {tx("appt.concerns", lang)}
              </h3>
              <p className="text-sm leading-relaxed">{result.concerns}</p>
            </div>
          )}

          {/* Suggested Questions */}
          {result.suggestedQuestions && result.suggestedQuestions.length > 0 && (
            <div className="rounded-lg border border-sky-200 bg-sky-50/30 p-4 dark:border-sky-800 dark:bg-sky-950/10">
              <button
                onClick={() => toggleSection("questions")}
                className="flex w-full items-center justify-between"
              >
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-sky-700 dark:text-sky-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {tx("appt.suggestedQuestions", lang)}
                </h3>
                {expandedSections.questions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.questions && (
                <ul className="mt-2 space-y-1.5">
                  {result.suggestedQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 text-sky-500 font-bold">{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Clinical Notes */}
          {result.clinicalNotes && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {tx("appt.clinicalNotes", lang)}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-300 leading-relaxed">
                {result.clinicalNotes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 print:hidden">
            <Button
              onClick={handlePrint}
              className="flex-1 gap-2 bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Download className="h-4 w-4" />
              {tx("appt.downloadPdf", lang)}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setConcerns("");
                setError(null);
              }}
              className="flex-1"
            >
              {tx("appt.newSummary", lang)}
            </Button>
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground print:hidden">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
