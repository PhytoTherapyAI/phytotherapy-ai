"use client";

import { useState, useRef } from "react";
import {
  BookOpen,
  Upload,
  FileText,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Pill,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ProspectusResult {
  medicationName: string;
  activeIngredient: string;
  category: string;
  whatItDoes: string;
  dosage: {
    standard: string;
    instructions: string;
  };
  sideEffects: {
    common: string[];
    serious: string[];
    rare: string[];
  };
  interactions: Array<{
    with: string;
    effect: string;
    severity: "safe" | "caution" | "dangerous";
  }>;
  warnings: string[];
  contraindications: string[];
  storage: string;
  profileAlerts: string[];
  simpleSummary: string;
}

const SEVERITY_BADGE = {
  safe: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
  caution: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400",
  dangerous: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400",
};

export default function ProspectusReaderPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProspectusResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    if (selectedFile.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lang", lang);

      const headers: Record<string, string> = {};
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/prospectus-reader", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setResult(null);
    setFile(null);
    setPreview(null);
    setError(null);
    setExpandedSections({});
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-950">
          <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("prospectus.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("prospectus.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{result.medicationName}</h2>
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {tx("prospectus.scanNew", lang)}
            </Button>
          </div>

          {/* Profile Alerts */}
          {result.profileAlerts && result.profileAlerts.length > 0 && (
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950/30">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-red-700 dark:text-red-400">
                <ShieldAlert className="h-4 w-4" />
                {tx("prospectus.profileAlerts", lang)}
              </h3>
              <ul className="space-y-1">
                {result.profileAlerts.map((alert, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-300">
                    • {alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Simple Summary */}
          <div className="rounded-xl border bg-primary/5 p-4">
            <h3 className="mb-1 text-sm font-semibold">{tx("prospectus.summary", lang)}</h3>
            <p className="text-sm">{result.simpleSummary}</p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <span className="text-[10px] font-medium text-muted-foreground">
                {tx("prospectus.activeIngredient", lang)}
              </span>
              <p className="text-sm font-semibold">{result.activeIngredient}</p>
            </div>
            <div className="rounded-lg border p-3">
              <span className="text-[10px] font-medium text-muted-foreground">
                {tx("prospectus.category", lang)}
              </span>
              <p className="text-sm font-semibold">{result.category}</p>
            </div>
          </div>

          {/* What it does */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-1 text-sm font-semibold">{tx("prospectus.whatItDoes", lang)}</h3>
            <p className="text-xs">{result.whatItDoes}</p>
          </div>

          {/* Dosage */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Pill className="h-3.5 w-3.5 text-primary" />
              {tx("prospectus.dosage", lang)}
            </h3>
            <p className="text-xs font-medium">{result.dosage.standard}</p>
            <p className="mt-1 text-xs text-muted-foreground">{result.dosage.instructions}</p>
          </div>

          {/* Side Effects */}
          <div className="rounded-lg border p-4">
            <button
              onClick={() => toggleSection("sideEffects")}
              className="flex w-full items-center justify-between"
            >
              <h3 className="text-sm font-semibold">{tx("prospectus.sideEffects", lang)}</h3>
              {expandedSections.sideEffects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.sideEffects && (
              <div className="mt-3 space-y-3">
                {result.sideEffects.common.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-600">{tx("prospectus.commonSE", lang)}</span>
                    <ul className="mt-1 space-y-0.5">
                      {result.sideEffects.common.map((se, i) => (
                        <li key={i} className="text-xs">• {se}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.sideEffects.serious.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-red-600">{tx("prospectus.seriousSE", lang)}</span>
                    <ul className="mt-1 space-y-0.5">
                      {result.sideEffects.serious.map((se, i) => (
                        <li key={i} className="text-xs text-red-600 dark:text-red-400">• {se}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.sideEffects.rare.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground">{tx("prospectus.rareSE", lang)}</span>
                    <ul className="mt-1 space-y-0.5">
                      {result.sideEffects.rare.map((se, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {se}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactions */}
          {result.interactions && result.interactions.length > 0 && (
            <div className="rounded-lg border p-4">
              <button
                onClick={() => toggleSection("interactions")}
                className="flex w-full items-center justify-between"
              >
                <h3 className="text-sm font-semibold">{tx("prospectus.interactions", lang)}</h3>
                {expandedSections.interactions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.interactions && (
                <div className="mt-3 space-y-2">
                  {result.interactions.map((int, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-2">
                      <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${SEVERITY_BADGE[int.severity]}`}>
                        {int.severity === "safe" ? "✓" : int.severity === "caution" ? "!" : "✕"}
                      </span>
                      <div>
                        <p className="text-xs font-medium">{int.with}</p>
                        <p className="text-[10px] text-muted-foreground">{int.effect}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {tx("prospectus.warnings", lang)}
              </h3>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-amber-600 dark:text-amber-300">• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications */}
          {result.contraindications && result.contraindications.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <h3 className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">
                {tx("prospectus.contraindications", lang)}
              </h3>
              <ul className="space-y-1">
                {result.contraindications.map((c, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-300">• {c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Storage */}
          {result.storage && (
            <div className="rounded-lg border p-3">
              <span className="text-[10px] font-medium text-muted-foreground">{tx("prospectus.storage", lang)}</span>
              <p className="text-xs">{result.storage}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Upload Section */}
          <div className="mb-6 rounded-xl border-2 border-dashed border-cyan-300/50 bg-cyan-50/30 p-8 dark:border-cyan-700/30 dark:bg-cyan-950/10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-cyan-100 p-4 dark:bg-cyan-900/30">
                <Upload className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{tx("prospectus.upload", lang)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tx("prospectus.uploadDesc", lang)}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  {preview && (
                    <img
                      src={preview}
                      alt="Prospectus preview"
                      className="max-h-48 rounded-lg border object-contain shadow-sm"
                    />
                  )}
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm shadow-sm">
                    <FileText className="h-4 w-4 text-cyan-500" />
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button onClick={() => { setFile(null); setPreview(null); }}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {tx("prospectus.chooseFile", lang)}
                </Button>
              )}
            </div>
          </div>

          {/* Analyze Button */}
          {file && (
            <Button
              className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
              size="lg"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tx("prospectus.reading", lang)}
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  {tx("prospectus.readBtn", lang)}
                </>
              )}
            </Button>
          )}
        </>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
