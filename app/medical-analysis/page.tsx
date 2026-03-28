"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Scan,
  Upload,
  FileText,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react";
import { BloodTestForm } from "@/components/blood-test/BloodTestForm";
import { ResultDashboard } from "@/components/blood-test/ResultDashboard";
import { RadiologyResultDashboard } from "@/components/radiology/RadiologyResultDashboard";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import type { BloodTestResult, BloodTestCategory } from "@/lib/blood-reference";
import type { Lang } from "@/lib/translations";

// ── Blood Test Types ──
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

// ── Radiology Image Types ──
const IMAGE_TYPES = [
  { value: "xray", key: "rad.xray" },
  { value: "ct", key: "rad.ct" },
  { value: "mri", key: "rad.mri" },
  { value: "ultrasound", key: "rad.ultrasound" },
  { value: "report", key: "rad.report" },
] as const;

type TabType = "blood-test" | "radiology";

export default function MedicalAnalysisPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<TabType>("blood-test");

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
          <FlaskConical className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("medAnalysis.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("medAnalysis.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="mb-6 flex rounded-lg border bg-muted/30 p-1">
        <button
          onClick={() => setActiveTab("blood-test")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "blood-test"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          {tx("bt.title", lang)}
        </button>
        <button
          onClick={() => setActiveTab("radiology")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "radiology"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scan className="h-4 w-4" />
          {tx("rad.title", lang)}
        </button>
      </div>

      {/* Guest Notice */}
      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p>
            <strong>
              {activeTab === "blood-test"
                ? tx("bt.guestMode", lang)
                : tx("rad.guestMode", lang)}
            </strong>{" "}
            {activeTab === "blood-test"
              ? tx("bt.guestText", lang)
              : tx("rad.guestText", lang)}{" "}
            <Link href="/auth/login" className="font-semibold underline">
              {tx("bt.createAccount", lang)}
            </Link>
            .
          </p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "blood-test" ? (
        <BloodTestTab
          isAuthenticated={isAuthenticated}
          accessToken={session?.access_token}
          lang={lang}
        />
      ) : (
        <RadiologyTab
          isAuthenticated={isAuthenticated}
          accessToken={session?.access_token}
          lang={lang}
        />
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Blood Test Tab
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BloodTestTab({
  isAuthenticated,
  accessToken,
  lang,
}: {
  isAuthenticated: boolean;
  accessToken?: string;
  lang: Lang;
}) {
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
      if (isAuthenticated && accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
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
    <>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">{tx("bt.analysisError", lang)}</p>
          <p>{error}</p>
        </div>
      )}

      {/* PDF Upload */}
      {!data && (
        <div className="mb-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{tx("bt.uploadPdf", lang)}</h3>
              <p className="text-xs text-muted-foreground">
                {tx("bt.uploadPdfDesc", lang)}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPdfFile(file);
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
                    if (!pdfFile) return;
                    setPdfUploading(true);
                    setError(null);
                    try {
                      const formData = new FormData();
                      formData.append("file", pdfFile);
                      formData.append("lang", lang);
                      const headers: Record<string, string> = {};
                      if (isAuthenticated && accessToken) {
                        headers["Authorization"] = `Bearer ${accessToken}`;
                      }
                      const res = await fetch("/api/blood-test-pdf", {
                        method: "POST",
                        headers,
                        body: formData,
                      });
                      if (!res.ok) {
                        const err = await res.json();
                        throw new Error(
                          err.error || "PDF extraction failed"
                        );
                      }
                      const result = await res.json();
                      setData(result);
                      setPdfFile(null);
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "PDF upload failed"
                      );
                    } finally {
                      setPdfUploading(false);
                    }
                  }}
                  disabled={pdfUploading}
                  className="gap-1.5"
                >
                  {pdfUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                      {tx("bt.analyzing", lang)}
                    </>
                  ) : (
                    tx("bt.analyze", lang)
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
                {tx("bt.choosePdf", lang)}
              </Button>
            )}
          </div>
        </div>
      )}

      {data ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {tx("bt.yourResults", lang)}
            </h2>
            <button
              onClick={() => setData(null)}
              className="text-sm text-primary hover:underline"
            >
              ← {tx("bt.runNew", lang)}
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

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ {tx("disclaimer.tool", lang)}
      </p>
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Radiology Tab
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RadiologyTab({
  isAuthenticated,
  accessToken,
  lang,
}: {
  isAuthenticated: boolean;
  accessToken?: string;
  lang: Lang;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageType, setImageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lang", lang);
      if (imageType) formData.append("imageType", imageType);
      const headers: Record<string, string> = {};
      if (isAuthenticated && accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      const res = await fetch("/api/radiology-analysis", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("rad.error", lang));
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setData(null);
    setFile(null);
    setImagePreview(null);
    setImageType("");
    setError(null);
  };

  return (
    <>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {data ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {tx("rad.yourResults", lang)}
            </h2>
            <Button variant="outline" size="sm" onClick={resetAnalysis}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {tx("rad.runNew", lang)}
            </Button>
          </div>
          <RadiologyResultDashboard
            analysis={data}
            imagePreview={imagePreview || undefined}
            lang={lang}
          />
        </div>
      ) : (
        <>
          {/* Upload */}
          <div className="mb-6 rounded-xl border-2 border-dashed border-blue-300/50 bg-blue-50/30 p-8 dark:border-blue-700/30 dark:bg-blue-950/10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {tx("rad.upload", lang)}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tx("rad.uploadDesc", lang)}
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
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Selected radiology image"
                      className="max-h-48 rounded-lg border object-contain shadow-sm"
                    />
                  )}
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm shadow-sm">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button
                      onClick={() => {
                        setFile(null);
                        setImagePreview(null);
                      }}
                    >
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
                  {tx("rad.chooseFile", lang)}
                </Button>
              )}
            </div>
          </div>

          {/* Image Type */}
          {file && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                {tx("rad.imageType", lang)}
              </label>
              <div className="flex flex-wrap gap-2">
                {IMAGE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setImageType(
                        imageType === type.value ? "" : type.value
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      imageType === type.value
                        ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-400"
                        : "border-border hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {tx(type.key, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {file && (
            <Button
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tx("rad.analyzing", lang)}
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4" />
                  {tx("rad.analyze", lang)}
                </>
              )}
            </Button>
          )}
        </>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {tx("rad.disclaimer", lang)}
      </p>
    </>
  );
}
