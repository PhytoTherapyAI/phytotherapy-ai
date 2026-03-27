"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { FlaskConical, Upload, FileText, Loader2, X } from "lucide-react";
import { BloodTestForm } from "@/components/blood-test/BloodTestForm";
import { ResultDashboard } from "@/components/blood-test/ResultDashboard";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import type { BloodTestResult, BloodTestCategory } from "@/lib/blood-reference";

interface AnalysisResponse {
  success: boolean;
  results: Record<BloodTestCategory, BloodTestResult[]>;
  analysis: {
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
  };
  totalMarkers: number;
  abnormalCount: number;
  optimalCount: number;
}

export default function BloodTestPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang()
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (
    values: Record<string, number>,
    gender: "male" | "female" | null
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/blood-analysis", {
        method: "POST",
        headers,
        body: JSON.stringify({ values, gender, lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const result: AnalysisResponse = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
          <FlaskConical className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx('bt.title', lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx('bt.subtitle', lang)}
          </p>
        </div>
      </div>

      {/* Auth notice for guests */}
      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p>
            <strong>{tx('bt.guestMode', lang)}</strong> {tx('bt.guestText', lang)}{" "}
            <Link href="/auth/login" className="font-semibold underline">
              {tx('bt.createAccount', lang)}
            </Link>.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">{tx('bt.analysisError', lang)}</p>
          <p>{error}</p>
        </div>
      )}

      {/* PDF Upload Section */}
      {!data && (
        <div className="mb-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{tx('bt.uploadPdf', lang)}</h3>
              <p className="text-xs text-muted-foreground">
                {tx('bt.uploadPdfDesc', lang)}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setPdfFile(file)
              }}
            />
            {pdfFile ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="max-w-[200px] truncate">{pdfFile.name}</span>
                  <button onClick={() => setPdfFile(null)}>
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!pdfFile) return
                    setPdfUploading(true)
                    setError(null)
                    try {
                      const formData = new FormData()
                      formData.append("file", pdfFile)
                      formData.append("lang", lang)
                      const headers: Record<string, string> = {}
                      if (isAuthenticated && session?.access_token) {
                        headers["Authorization"] = `Bearer ${session.access_token}`
                      }
                      const res = await fetch("/api/blood-test-pdf", {
                        method: "POST",
                        headers,
                        body: formData,
                      })
                      if (!res.ok) {
                        const err = await res.json()
                        throw new Error(err.error || "PDF extraction failed")
                      }
                      const result = await res.json()
                      setData(result)
                      setPdfFile(null)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "PDF upload failed")
                    } finally {
                      setPdfUploading(false)
                    }
                  }}
                  disabled={pdfUploading}
                  className="gap-1.5"
                >
                  {pdfUploading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {tx('bt.analyzing', lang)}</>
                  ) : (
                    tx('bt.analyze', lang)
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                {tx('bt.choosePdf', lang)}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Show Results or Form */}
      {data ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{tx('bt.yourResults', lang)}</h2>
            <button
              onClick={() => setData(null)}
              className="text-sm text-primary hover:underline"
            >
              ← {tx('bt.runNew', lang)}
            </button>
          </div>

          <ResultDashboard
            results={data.results}
            analysis={data.analysis}
            totalMarkers={data.totalMarkers}
            abnormalCount={data.abnormalCount}
            optimalCount={data.optimalCount}
          />
        </div>
      ) : (
        <BloodTestForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ {tx('disclaimer.tool', lang)}
      </p>
    </div>
  );
}
