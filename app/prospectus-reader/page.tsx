// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Camera,
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
  Sparkles,
  Search,
  Shield,
  Eye,
  Scan,
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
    <div className="min-h-screen bg-stone-50 dark:bg-background">
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3">
          <Scan className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {tx("prospectus.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("prospectus.subtitle", lang)}
          </p>
        </div>
      </motion.div>

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
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />

          {/* ── Smart Scanner UI ── */}
          {!file && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-6 flex flex-col items-center text-center">
              {/* AI Lens icon with glow */}
              <div className="relative mb-6">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-primary/10 blur-3xl scale-150" />
                <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ type: "spring" }}
                  className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
                  <Camera className="h-12 w-12 text-primary/60" strokeWidth={1.5} />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md">
                    <Sparkles className="h-3.5 w-3.5" />
                  </motion.div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mb-5 flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-95 animate-[softPulse_3s_ease-in-out_infinite]"
              >
                <Camera className="h-5 w-5" />
                {lang === "tr" ? "📸 Kamerayı Aç ve Tara" : "📸 Open Scanner"}
              </button>

              {/* Value preview pills */}
              <div className="mb-5 space-y-2 max-w-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {lang === "tr" ? "Yapay Zeka Neleri Çözer?" : "What Does AI Solve?"}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { emoji: "🧐", en: "Translates complex medical terms to plain language", tr: "Karışık tıbbi terimleri halk diline çevirir" },
                    { emoji: "⚠️", en: "Summarizes hidden side effects and risks", tr: "Gizli yan etkileri ve riskleri özetler" },
                    { emoji: "💊", en: "Clarifies how to take your medication", tr: "Nasıl kullanılacağını netleştirir" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 text-xs text-muted-foreground shadow-soft"
                      style={{ animation: `fadeSlideIn 0.4s ease-out ${i * 100}ms both` }}>
                      <span className="text-base shrink-0">{item.emoji}</span>
                      <span>{lang === "tr" ? item.tr : item.en}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Also accept PDF link */}
              <button
                onClick={() => {
                  // Remove capture to allow gallery/PDF selection
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute("capture");
                    fileInputRef.current.click();
                    // Restore capture for next camera use
                    setTimeout(() => fileInputRef.current?.setAttribute("capture", "environment"), 1000);
                  }
                }}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {lang === "tr" ? "veya galeriden/PDF seç" : "or pick from gallery/PDF"}
              </button>

              <style jsx>{`
                @keyframes fadeSlideIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes softPulse {
                  0%, 100% { box-shadow: 0 0 0 0 rgba(60, 122, 82, 0.3); }
                  50% { box-shadow: 0 0 0 8px rgba(60, 122, 82, 0); }
                }
              `}</style>
            </motion.div>
          )}

          {/* ── File selected — preview + analyze ── */}
          {file && !isLoading && (
            <div className="mb-6 flex flex-col items-center gap-4">
              {preview && (
                <div className="relative rounded-2xl border overflow-hidden shadow-soft-md">
                  <img src={preview} alt="Prospectus" className="max-h-56 object-contain" />
                  <button onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {!preview && (
                <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 shadow-soft">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                  <button onClick={() => { setFile(null); setPreview(null); }}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              )}
              <button onClick={handleAnalyze}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]">
                <Sparkles className="h-4 w-4" />
                {lang === "tr" ? "AI ile Analiz Et" : "Analyze with AI"}
              </button>
            </div>
          )}

          {/* ── Labor Illusion Loading ── */}
          {isLoading && (
            <div className="mb-6 flex flex-col items-center gap-5 py-8">
              {/* Scanner animation over preview */}
              {preview && (
                <div className="relative rounded-2xl border overflow-hidden shadow-soft-md">
                  <img src={preview} alt="Scanning" className="max-h-48 object-contain opacity-60" />
                  {/* Laser scan line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                    style={{ animation: "scanLine 2s ease-in-out infinite" }} />
                </div>
              )}
              {/* Cycling text */}
              <ScannerLoadingText lang={lang} />
              <style jsx>{`
                @keyframes scanLine {
                  0%, 100% { top: 10%; }
                  50% { top: 90%; }
                }
              `}</style>
            </div>
          )}
        </>
      )}

      <p className="mt-6 text-center text-[10px] text-muted-foreground/40 max-w-md mx-auto leading-relaxed">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
    </div>
  );
}

// ── Scanner Loading Text (Labor Illusion) ──
function ScannerLoadingText({ lang }: { lang: string }) {
  const isTr = lang === "tr";
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const steps = isTr
    ? ["Görseldeki metinler okunuyor...", "Tıbbi terimler tespit ediliyor...", "Sizin için sadeleştiriliyor..."]
    : ["Reading text from the image...", "Detecting medical terms...", "Simplifying for you..."];

  const icons = [Eye, Search, Shield];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setStep((p) => (p + 1) % steps.length); setVisible(true); }, 250);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const Icon = icons[step];

  return (
    <div className={`flex items-center gap-2.5 transition-all duration-250 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary animate-pulse" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{steps[step]}</span>
    </div>
  );
}
