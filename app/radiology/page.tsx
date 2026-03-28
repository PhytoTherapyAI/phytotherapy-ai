"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Scan, Upload, FileText, Loader2, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { RadiologyResultDashboard } from "@/components/radiology/RadiologyResultDashboard";

const IMAGE_TYPES = [
  { value: "xray", key: "rad.xray" },
  { value: "ct", key: "rad.ct" },
  { value: "mri", key: "rad.mri" },
  { value: "ultrasound", key: "rad.ultrasound" },
  { value: "report", key: "rad.report" },
] as const;

export default function RadiologyPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

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

    // Create preview for images
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
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
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
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
          <Scan className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("rad.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("rad.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Guest Notice */}
      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <strong>{tx("rad.guestMode", lang)}</strong> {tx("rad.guestText", lang)}{" "}
          <Link href="/auth/login" className="font-semibold underline">
            {tx("bt.createAccount", lang)}
          </Link>.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {data ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{tx("rad.yourResults", lang)}</h2>
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
          {/* Upload Section */}
          <div className="mb-6 rounded-xl border-2 border-dashed border-blue-300/50 bg-blue-50/30 p-8 dark:border-blue-700/30 dark:bg-blue-950/10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{tx("rad.upload", lang)}</h3>
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
                  {/* File Preview */}
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
                    <button onClick={() => { setFile(null); setImagePreview(null); }}>
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

          {/* Image Type Selector */}
          {file && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                {tx("rad.imageType", lang)}
              </label>
              <div className="flex flex-wrap gap-2">
                {IMAGE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setImageType(imageType === type.value ? "" : type.value)}
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

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        {tx("rad.disclaimer", lang)}
      </p>
    </div>
  );
}
