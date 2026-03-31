// © 2026 Phytotherapy.ai — All Rights Reserved
// Drug Info / Rx Copilot — Progressive Disclosure + Zero-Error Shield + Framer Motion
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, Search, Loader2, LogIn, AlertTriangle, Shield, ChevronDown, ChevronUp,
  ShieldCheck, Sparkles, ArrowRight, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { DoctorShell } from "@/components/doctor/DoctorShell";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface DrugResult {
  drugName: string; brandNames: string[]; activeIngredient: string; drugClass: string;
  whatItDoes: string; howToTake: string; commonDoses: string;
  sideEffects: { common: string[]; serious: string[]; rare: string[] };
  interactions: string[]; whenToStop: string; genericVsOriginal: string;
  storageInfo: string; pregnancyCategory: string; disclaimer: string;
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

// Labor illusion loading steps
function LoadingSteps({ lang }: { lang: string }) {
  const isTr = lang === "tr";
  const [step, setStep] = useState(0);
  const steps = isTr
    ? ["İlaç veritabanı taranıyor...", "Etkileşimler kontrol ediliyor...", "Güvenlik profili analiz ediliyor...", "Dozaj bilgisi derleniyor..."]
    : ["Scanning drug database...", "Checking interactions...", "Analyzing safety profile...", "Compiling dosage info..."];
  const icons = ["🔍", "⚠️", "🛡️", "💊"];

  useState(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 2000);
    return () => clearInterval(t);
  });

  return (
    <div className="flex flex-col items-center py-16 gap-6">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Loader2 className="h-10 w-10 text-primary" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-lg">{icons[step]}</span> {steps[step]}
        </motion.div>
      </AnimatePresence>
      {/* Progress dots */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <motion.div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-primary w-6" : "bg-muted w-1.5"}`}
            animate={{ width: i <= step ? 24 : 6 }} transition={{ duration: 0.3 }} />
        ))}
      </div>
    </div>
  );
}

export default function DrugInfoPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [drugName, setDrugName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrugResult | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const handleSearch = async () => {
    if (!drugName.trim() || drugName.trim().length < 2) return;
    setIsLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/drug-info", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ drug_name: drugName.trim(), lang }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setIsLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="relative mx-auto mb-4">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-primary/5 blur-3xl scale-150" />
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Pill className="h-7 w-7 text-primary/60" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">{tx("druginfo.title", lang)}</h1>
          <p className="text-sm text-muted-foreground mb-6">{tx("druginfo.subtitle", lang)}</p>
          <Button onClick={() => window.location.href = "/auth/login"} className="gap-2 rounded-xl">
            <LogIn className="w-4 h-4" /> {tx("tool.loginRequired", lang)}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <DoctorShell>
    <div className="min-h-screen bg-stone-50 dark:bg-background">
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3"><ShieldCheck className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-semibold">{tx("druginfo.title", lang)}</h1>
          <p className="text-sm text-muted-foreground">{tx("druginfo.subtitle", lang)}</p>
        </div>
      </motion.div>

      {/* Spotlight Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={drugName} onChange={(e) => setDrugName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={isTr ? "💊 İlaç veya etken madde ara..." : "💊 Search drug or active ingredient..."}
            className="w-full rounded-2xl border bg-white dark:bg-card py-4 pl-11 pr-28 text-sm shadow-lg shadow-black/5 outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSearch}
            disabled={isLoading || drugName.trim().length < 2}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {isTr ? "Analiz Et" : "Analyze"}
          </motion.button>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State — AI Shield */}
      <AnimatePresence>
        {!result && !isLoading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-5">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/5 blur-3xl scale-150" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10">
                <ShieldCheck className="h-12 w-12 text-primary/20" strokeWidth={1.2} />
              </div>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              {isTr
                ? "Güvenli reçete için ilacınızı arayın. Dozaj, renal klirens ve etkileşimleri sizin için saniyeler içinde analiz edelim."
                : "Search your medication for safe prescribing. We'll analyze dosage, renal clearance, and interactions in seconds."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading — Labor Illusion */}
      <AnimatePresence>
        {isLoading && <LoadingSteps lang={lang} />}
      </AnimatePresence>

      {/* Result — Progressive Disclosure with Framer Motion */}
      <AnimatePresence>
        {result && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {/* Drug Header */}
            <motion.div variants={fadeUp} className="rounded-2xl border bg-white dark:bg-card p-5 shadow-lg shadow-black/5">
              <h2 className="text-xl font-bold">{result.drugName}</h2>
              {result.activeIngredient && <p className="text-sm font-medium text-primary mt-0.5">{result.activeIngredient}</p>}
              {result.drugClass && <span className="inline-block mt-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{result.drugClass}</span>}
              {result.brandNames?.length > 0 && (
                <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {result.brandNames.map((b) => (
                    <motion.span key={b} whileHover={{ scale: 1.05 }}
                      className="shrink-0 rounded-full border px-3 py-1 text-[10px] font-medium hover:border-primary hover:text-primary transition-colors">{b}</motion.span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* What + How */}
            <motion.div variants={fadeUp} className="rounded-2xl border bg-white dark:bg-card p-4 shadow-sm">
              <h3 className="text-xs font-bold text-primary mb-1">{tx("drugInfo.whatItDoes", lang)}</h3>
              <p className="text-sm leading-relaxed">{result.whatItDoes}</p>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-2xl border bg-white dark:bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <Pill className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-xs font-bold text-primary">{tx("drugInfo.howToTake", lang)}</h3>
              </div>
              <p className="text-sm leading-relaxed">{result.howToTake}</p>
              {result.commonDoses && <p className="text-xs text-muted-foreground mt-1.5 bg-muted/50 rounded-lg px-3 py-1.5">{result.commonDoses}</p>}
            </motion.div>

            {/* Side Effects — Expandable */}
            <motion.div variants={fadeUp} className="rounded-2xl border overflow-hidden shadow-sm">
              <motion.button whileTap={{ scale: 0.99 }} onClick={() => toggle("se")}
                className="flex w-full items-center justify-between bg-white dark:bg-card p-4">
                <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-bold">{tx("drugInfo.sideEffects", lang)}</h3></div>
                <motion.div animate={{ rotate: expanded.se ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {expanded.se && result.sideEffects && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3">
                      {result.sideEffects.common?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-amber-600">{tx("drugInfo.common", lang)}</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">{result.sideEffects.common.map((s) => (
                            <span key={s} className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{s}</span>
                          ))}</div>
                        </div>
                      )}
                      {result.sideEffects.serious?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-red-600">{tx("drugInfo.serious", lang)}</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">{result.sideEffects.serious.map((s) => (
                            <span key={s} className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] text-red-700 dark:bg-red-900/20 dark:text-red-300">{s}</span>
                          ))}</div>
                        </div>
                      )}
                      {result.sideEffects.rare?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground">{tx("drugInfo.rare", lang)}</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">{result.sideEffects.rare.map((s) => (
                            <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground">{s}</span>
                          ))}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Interactions — Actionable */}
            {result.interactions?.length > 0 && (
              <motion.div variants={fadeUp} className="rounded-2xl border overflow-hidden shadow-sm">
                <motion.button whileTap={{ scale: 0.99 }} onClick={() => toggle("int")}
                  className="flex w-full items-center justify-between bg-white dark:bg-card p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-bold">{tx("drugInfo.interactions", lang)}</h3>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">{result.interactions.length}</span>
                  </div>
                  <motion.div animate={{ rotate: expanded.int ? 180 : 0 }}><ChevronDown className="h-4 w-4" /></motion.div>
                </motion.button>
                <AnimatePresence>
                  {expanded.int && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        {result.interactions.map((int, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/30 p-3 dark:border-red-900/40 dark:bg-red-950/10">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">!</span>
                            <p className="text-xs flex-1 leading-relaxed">{int}</p>
                            <button className="shrink-0 flex items-center gap-0.5 text-[9px] text-primary font-medium hover:underline">
                              <ArrowRight className="h-2.5 w-2.5" /> {isTr ? "Alternatif" : "Alternative"}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Generic vs Original */}
            {result.genericVsOriginal && (
              <motion.div variants={fadeUp} className="rounded-2xl border bg-white dark:bg-card p-4 shadow-sm">
                <h3 className="text-xs font-bold text-primary mb-1">{isTr ? "Jenerik vs Orijinal" : "Generic vs Original"}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.genericVsOriginal}</p>
              </motion.div>
            )}

            {/* When to Stop */}
            {result.whenToStop && (
              <motion.div variants={fadeUp} className="rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/10">
                <h3 className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">
                  {isTr ? "Ne Zaman Bırakmalı" : "When to Stop"}
                </h3>
                <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">{result.whenToStop}</p>
              </motion.div>
            )}

            {/* Pregnancy + Storage */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
              {result.pregnancyCategory && (
                <div className="rounded-2xl border bg-white dark:bg-card p-3">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">{isTr ? "Gebelik" : "Pregnancy"}</span>
                  <p className="text-xs font-medium mt-0.5">{result.pregnancyCategory}</p>
                </div>
              )}
              {result.storageInfo && (
                <div className="rounded-2xl border bg-white dark:bg-card p-3">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">{isTr ? "Saklama" : "Storage"}</span>
                  <p className="text-xs font-medium mt-0.5">{result.storageInfo}</p>
                </div>
              )}
            </motion.div>

            {/* New search */}
            <motion.button variants={fadeUp} whileTap={{ scale: 0.98 }}
              onClick={() => { setResult(null); setDrugName(""); }}
              className="w-full rounded-xl border py-3 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              {isTr ? "Yeni İlaç Ara" : "Search Another Drug"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-8 text-center text-[10px] text-muted-foreground/40">{tx("disclaimer.tool", lang)}</p>
    </div>
    </div>
    </DoctorShell>
  );
}
