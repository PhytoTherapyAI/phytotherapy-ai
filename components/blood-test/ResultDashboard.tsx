"use client";

import { useState } from "react";
import {
  FileDown,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Stethoscope,
  Pill,
  Heart,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORY_INFO,
  type BloodTestResult,
  type BloodTestCategory,
} from "@/lib/blood-reference";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { BloodTestShareCard } from "@/components/share/BloodTestShareCard";

// ============================================
// Types
// ============================================

interface Analysis {
  summary: string;
  abnormalFindings: Array<{
    marker: string;
    value: string;
    status: string;
    explanation: string;
    concern: string;
  }>;
  supplementRecommendations: Array<{
    supplement: string;
    reason: string;
    dosage: string;
    duration: string;
    evidenceGrade: string;
    sources: Array<{ title: string; url: string; year: string }>;
  }>;
  lifestyleAdvice: Array<{
    category: string;
    advice: string;
    reason: string;
  }>;
  doctorDiscussion: string[];
  disclaimer: string;
}

interface ResultDashboardProps {
  results: Record<string, BloodTestResult[]>;
  analysis: Analysis;
  totalMarkers: number;
  abnormalCount: number;
  optimalCount: number;
}

// ============================================
// Component
// ============================================

export function ResultDashboard({
  results,
  analysis,
  totalMarkers,
  abnormalCount,
  optimalCount,
}: ResultDashboardProps) {
  const { lang } = useLang()
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "supplements" | "lifestyle" | "doctor">(
    "results"
  );

  const handleDownloadPdf = async () => {
    setIsPdfLoading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results, analysis }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PhytotherapyAI-Report-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreCard
          icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
          label={tx('rd.optimal', lang)}
          value={optimalCount}
          total={totalMarkers}
          color="emerald"
        />
        <ScoreCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          label={tx('rd.needsAttention', lang)}
          value={abnormalCount}
          total={totalMarkers}
          color="amber"
        />
        <ScoreCard
          icon={<Stethoscope className="h-5 w-5 text-blue-600" />}
          label={tx('rd.recommendations', lang)}
          value={analysis.supplementRecommendations.length}
          total={null}
          color="blue"
        />
      </div>

      {/* Summary */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">{tx('rd.summary', lang)}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
        {[
          { id: "results" as const, label: tx('rd.tabResults', lang), icon: <Heart className="h-3.5 w-3.5" /> },
          { id: "supplements" as const, label: tx('rd.tabSupplements', lang), icon: <Pill className="h-3.5 w-3.5" /> },
          { id: "lifestyle" as const, label: tx('rd.tabLifestyle', lang), icon: <TrendingUp className="h-3.5 w-3.5" /> },
          { id: "doctor" as const, label: tx('rd.tabDoctor', lang), icon: <Stethoscope className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {Object.entries(results).map(([category, items]) => {
            const catInfo = CATEGORY_INFO[category as BloodTestCategory];
            if (!catInfo || !items || items.length === 0) return null;

            return (
              <div key={category} className="rounded-lg border bg-card">
                <div className="border-b px-4 py-3">
                  <h4 className="text-sm font-semibold">{catInfo.label}</h4>
                </div>
                <div className="divide-y">
                  {items.map((result) => (
                    <div key={result.marker.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{result.marker.name}</p>
                        <p className="text-xs text-muted-foreground">{result.marker.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono">
                          {result.value} <span className="text-xs text-muted-foreground">{result.marker.unit}</span>
                        </span>
                        <StatusBadge status={result.status} label={result.statusLabel} lang={lang} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "supplements" && (
        <div className="space-y-4">
          {analysis.supplementRecommendations.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              {tx('rd.noSupplements', lang)}
            </div>
          ) : (
            analysis.supplementRecommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-semibold">{rec.supplement}</h4>
                  <EvidenceBadge grade={rec.evidenceGrade} lang={lang} />
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{rec.reason}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{tx('rd.dosage', lang)}</span>
                    <p className="text-sm font-medium">{rec.dosage}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{tx('rd.duration', lang)}</span>
                    <p className="text-sm font-medium">{rec.duration}</p>
                  </div>
                </div>
                {rec.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rec.sources.map((src, j) => (
                      <a
                        key={j}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <BookOpen className="h-3 w-3" />
                        {src.title ? `${src.title.substring(0, 50)}...` : `PubMed (${src.year})`}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "lifestyle" && (
        <div className="space-y-3">
          {analysis.lifestyleAdvice.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              {tx('rd.noLifestyle', lang)}
            </div>
          ) : (
            analysis.lifestyleAdvice.map((item, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{item.advice}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "doctor" && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h4 className="mb-3 font-semibold">{tx('rd.doctorTitle', lang)}</h4>
            {analysis.doctorDiscussion.length === 0 ? (
              <p className="text-sm text-muted-foreground">{tx('rd.noDoctor', lang)}</p>
            ) : (
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                {analysis.doctorDiscussion.map((point, i) => (
                  <li key={i} className="text-muted-foreground">{point}</li>
                ))}
              </ol>
            )}
          </div>

          {/* Download PDF */}
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
            <h4 className="mb-2 font-semibold text-primary">
              {tx('rd.pdfTitle', lang)}
            </h4>
            <p className="mb-3 text-sm text-primary">
              {tx('rd.pdfDesc', lang)}
            </p>
            <Button
              onClick={handleDownloadPdf}
              disabled={isPdfLoading}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isPdfLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tx('rd.pdfLoading', lang)}
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  {tx('rd.pdfBtn', lang)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Share Card */}
      <BloodTestShareCard
        lang={lang}
        totalMarkers={totalMarkers}
        abnormalCount={abnormalCount}
        optimalCount={optimalCount}
        topFindings={analysis.abnormalFindings.slice(0, 3).map((f) => ({
          marker: f.marker,
          status: f.status,
        }))}
      />

      {/* Disclaimer */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        <p className="font-semibold">⚠️ {tx('rd.disclaimerTitle', lang)}</p>
        <p className="mt-1">{analysis.disclaimer}</p>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function ScoreCard({
  icon,
  label,
  value,
  total,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number | null;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value}</span>
        {total !== null && (
          <span className="text-sm text-muted-foreground"> / {total}</span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, label, lang }: { status: string; label: string; lang: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    optimal: {
      bg: "bg-primary/10",
      text: "text-primary",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    borderline_low: {
      bg: "bg-amber-100 dark:bg-amber-900",
      text: "text-amber-700 dark:text-amber-300",
      icon: <TrendingDown className="h-3 w-3" />,
    },
    borderline_high: {
      bg: "bg-amber-100 dark:bg-amber-900",
      text: "text-amber-700 dark:text-amber-300",
      icon: <TrendingUp className="h-3 w-3" />,
    },
    low: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-700 dark:text-red-300",
      icon: <TrendingDown className="h-3 w-3" />,
    },
    high: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-700 dark:text-red-300",
      icon: <TrendingUp className="h-3 w-3" />,
    },
  };

  // TR status label map
  const statusLabels: Record<string, Record<string, string>> = {
    optimal: { en: "Optimal", tr: "Optimal" },
    low: { en: "Low", tr: "Düşük" },
    high: { en: "High", tr: "Yüksek" },
    borderline_low: { en: "Borderline Low", tr: "Sınırda Düşük" },
    borderline_high: { en: "Borderline High", tr: "Sınırda Yüksek" },
  };

  const c = config[status] || config["optimal"];
  const translatedLabel = statusLabels[status]?.[lang] ?? label;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      {c.icon}
      {translatedLabel}
    </span>
  );
}

function EvidenceBadge({ grade, lang }: { grade: string; lang: "en" | "tr" }) {
  const colors: Record<string, string> = {
    A: "bg-primary/10 text-primary",
    B: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    C: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[grade] || colors.C}`}>
      {tx('evidence.grade', lang)} {grade}
    </span>
  );
}
