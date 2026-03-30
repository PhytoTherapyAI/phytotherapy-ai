"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Stethoscope,
  Info,
  Download,
  Loader2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tx, type Lang } from "@/lib/translations";

interface RadiologyFinding {
  region: string;
  observation: string;
  medicalTerm: string;
  significance: "normal" | "attention" | "urgent";
  explanation: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface RadiologyAnalysis {
  imageType: string;
  overallUrgency: "normal" | "attention" | "urgent";
  summary: string;
  findings: RadiologyFinding[];
  glossary: GlossaryTerm[];
  doctorDiscussion: string[];
  limitations: string[];
  disclaimer: string;
}

interface Props {
  analysis: RadiologyAnalysis;
  imagePreview?: string;
  lang: Lang;
}

const URGENCY_CONFIG = {
  normal: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    key: "rad.urgencyNormal" as const,
  },
  attention: {
    icon: AlertCircle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    key: "rad.urgencyAttention" as const,
  },
  urgent: {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    key: "rad.urgencyUrgent" as const,
  },
};

const SIGNIFICANCE_BADGE = {
  normal: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0",
  attention: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0",
};

const IMAGE_TYPE_LABELS: Record<string, { en: string; tr: string }> = {
  xray: { en: "X-Ray", tr: "Röntgen" },
  ct: { en: "CT Scan", tr: "BT Tarama" },
  mri: { en: "MRI", tr: "MR" },
  ultrasound: { en: "Ultrasound", tr: "Ultrason" },
  report: { en: "Report", tr: "Rapor" },
  unknown: { en: "Medical Image", tr: "Tıbbi Görüntü" },
};

type TabId = "findings" | "glossary" | "doctor";

export function RadiologyResultDashboard({ analysis, imagePreview, lang }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("findings");
  const [pdfLoading, setPdfLoading] = useState(false);

  const urgency = URGENCY_CONFIG[analysis.overallUrgency] || URGENCY_CONFIG.normal;
  const UrgencyIcon = urgency.icon;
  const imageLabel = IMAGE_TYPE_LABELS[analysis.imageType]?.[lang] || IMAGE_TYPE_LABELS.unknown[lang];

  const tabs: { id: TabId; label: string; icon: typeof Eye }[] = [
    { id: "findings", label: tx("rad.tabFindings", lang), icon: Eye },
    { id: "glossary", label: tx("rad.tabGlossary", lang), icon: BookOpen },
    { id: "doctor", label: tx("rad.tabDoctor", lang), icon: Stethoscope },
  ];

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/radiology-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PhytotherapyAI-Radiology-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Urgency Banner */}
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${urgency.bg}`}>
        <UrgencyIcon className={`h-6 w-6 shrink-0 ${urgency.color}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${urgency.color}`}>
              {tx(urgency.key, lang)}
            </span>
            <Badge className={`text-[10px] ${urgency.badge}`}>{imageLabel}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{analysis.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold">{analysis.findings.length}</div>
          <div className="text-[10px] text-muted-foreground">{tx("rad.findings", lang)}</div>
        </div>
      </div>

      {/* Image Preview (if available) */}
      {imagePreview && (
        <Card>
          <CardContent className="p-3">
            <img
              src={imagePreview}
              alt="Radiology image"
              className="mx-auto max-h-64 rounded-lg object-contain"
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "findings" && (
        <div className="space-y-3">
          {analysis.findings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {tx("rad.noFindings", lang)}
            </p>
          ) : (
            analysis.findings.map((finding, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{finding.region}</span>
                        <Badge className={`text-[9px] ${SIGNIFICANCE_BADGE[finding.significance]}`}>
                          {finding.significance === "normal"
                            ? tx("rad.urgencyNormal", lang)
                            : finding.significance === "attention"
                              ? tx("rad.urgencyAttention", lang)
                              : tx("rad.urgencyUrgent", lang)}
                        </Badge>
                      </div>
                      <p className="text-sm">{finding.observation}</p>
                      <p className="text-xs text-muted-foreground italic">
                        {tx("rad.medicalTerm", lang)}: {finding.medicalTerm}
                      </p>
                      <p className="text-xs text-muted-foreground">{finding.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Limitations */}
          {analysis.limitations.length > 0 && (
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  {tx("rad.limitations", lang)}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">{tx("rad.limitationsDesc", lang)}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {analysis.limitations.map((lim, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                      {lim}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "glossary" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.glossary.length === 0 ? (
            <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
              {tx("rad.noGlossary", lang)}
            </p>
          ) : (
            analysis.glossary.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <p className="text-sm font-semibold text-primary">{item.term}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.definition}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "doctor" && (
        <div className="space-y-4">
          {analysis.doctorDiscussion.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-2">
                {analysis.doctorDiscussion.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <p>{point}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* PDF Download */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{tx("rad.downloadPdf", lang)}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx("rad.pdfShareDesc", lang)}
                  </p>
                </div>
                <Button size="sm" onClick={handleDownloadPdf} disabled={pdfLoading}>
                  {pdfLoading ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-muted-foreground">
        {analysis.disclaimer || tx("rad.disclaimer", lang)}
      </p>
    </div>
  );
}
