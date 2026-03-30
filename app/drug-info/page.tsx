// © 2026 Phytotherapy.ai — All Rights Reserved
// Drug Info / Rx Copilot — Progressive Disclosure + Zero-Error Shield
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, Search, Loader2, LogIn, AlertTriangle, Shield, ChevronDown, ChevronUp,
  ShieldCheck, Sparkles, ArrowRight,
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
        <div className="text-center max-w-md">
          <div className="relative mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl scale-150" />
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Pill className="h-7 w-7 text-primary/60" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">{tx("druginfo.title", lang)}</h1>
          <p className="text-sm text-muted-foreground mb-6">{tx("druginfo.subtitle", lang)}</p>
          <Button onClick={() => window.location.href = "/auth/login"} className="gap-2 rounded-xl">
            <LogIn className="w-4 h-4" /> {tx("tool.loginRequired", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DoctorShell>
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3"><ShieldCheck className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">{tx("druginfo.title", lang)}</h1>
          <p className="text-sm text-muted-foreground">{tx("druginfo.subtitle", lang)}</p>
        </div>
      </div>

      {/* Spotlight Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={isTr ? "💊 İlaç veya etken madde ara..." : "💊 Search drug or active ingredient..."}
            className="w-full rounded-2xl border bg-card py-3.5 pl-11 pr-28 text-sm shadow-soft-md outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20" />
          <button onClick={handleSearch} disabled={isLoading || drugName.trim().length < 2}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {isTr ? "Ara" : "Search"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty State — AI Shield */}
      {!result && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl scale-150" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/5">
              <ShieldCheck className="h-10 w-10 text-primary/20" strokeWidth={1.2} />
            </div>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            {isTr
              ? "Güvenli reçete için ilacınızı arayın. Dozaj, renal klirens ve etkileşimleri sizin için saniyeler içinde analiz edelim."
              : "Search your medication for safe prescribing. We'll analyze dosage, renal clearance, and interactions in seconds."}
          </p>
        </div>
      )}

      {/* Loading — Labor Illusion */}
      {isLoading && (
        <div className="flex flex-col items-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="space-y-1 text-center text-xs text-muted-foreground">
            <p>🔍 {isTr ? "İlaç veritabanı taranıyor..." : "Scanning drug database..."}</p>
            <p>📚 {isTr ? "Etkileşimler kontrol ediliyor..." : "Checking interactions..."}</p>
            <p>🛡️ {isTr ? "Güvenlik profili analiz ediliyor..." : "Analyzing safety profile..."}</p>
          </div>
        </div>
      )}

      {/* Result — Progressive Disclosure */}
      {result && (
        <div className="space-y-3">
          {/* Drug Header */}
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="text-xl font-bold">{result.drugName}</h2>
            {result.activeIngredient && <p className="text-sm font-medium text-primary mt-0.5">{result.activeIngredient}</p>}
            {result.drugClass && <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{result.drugClass}</span>}
            {/* Brand names — horizontal scroll */}
            {result.brandNames?.length > 0 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
                {result.brandNames.map((b) => (
                  <span key={b} className="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium">{b}</span>
                ))}
              </div>
            )}
          </div>

          {/* What + How */}
          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <h3 className="text-xs font-bold text-primary mb-1">{tx("drugInfo.whatItDoes", lang)}</h3>
            <p className="text-sm">{result.whatItDoes}</p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-1.5 mb-1">
              <Pill className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-bold text-primary">{tx("drugInfo.howToTake", lang)}</h3>
            </div>
            <p className="text-sm">{result.howToTake}</p>
            {result.commonDoses && <p className="text-xs text-muted-foreground mt-1">{result.commonDoses}</p>}
          </div>

          {/* Side Effects */}
          <div className="rounded-2xl border overflow-hidden shadow-soft">
            <button onClick={() => toggle("se")} className="flex w-full items-center justify-between bg-card p-4">
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-bold">{tx("drugInfo.sideEffects", lang)}</h3></div>
              {expanded.se ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expanded.se && result.sideEffects && (
              <div className="px-4 pb-4 space-y-3">
                {result.sideEffects.common?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-600">{tx("drugInfo.common", lang)}</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">{result.sideEffects.common.map((s) => (
                      <span key={s} className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{s}</span>
                    ))}</div>
                  </div>
                )}
                {result.sideEffects.serious?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-red-600">{tx("drugInfo.serious", lang)}</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">{result.sideEffects.serious.map((s) => (
                      <span key={s} className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-700 dark:bg-red-900/20 dark:text-red-300">{s}</span>
                    ))}</div>
                  </div>
                )}
                {result.sideEffects.rare?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground">{tx("drugInfo.rare", lang)}</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">{result.sideEffects.rare.map((s) => (
                      <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                    ))}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactions — Actionable */}
          {result.interactions?.length > 0 && (
            <div className="rounded-2xl border overflow-hidden shadow-soft">
              <button onClick={() => toggle("int")} className="flex w-full items-center justify-between bg-card p-4">
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-red-500" /><h3 className="text-sm font-bold">{tx("drugInfo.interactions", lang)}</h3>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">{result.interactions.length}</span></div>
                {expanded.int ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expanded.int && (
                <div className="px-4 pb-4 space-y-2">
                  {result.interactions.map((int, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/30 p-2.5 dark:border-red-900/40 dark:bg-red-950/10">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">!</span>
                      <p className="text-xs flex-1">{int}</p>
                      <button className="shrink-0 flex items-center gap-0.5 text-[9px] text-primary font-medium hover:underline">
                        <ArrowRight className="h-2.5 w-2.5" /> {isTr ? "Alternatif" : "Alternative"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generic vs Original — Carousel */}
          {result.genericVsOriginal && (
            <div className="rounded-2xl border bg-card p-4 shadow-soft">
              <h3 className="text-xs font-bold text-primary mb-1">{isTr ? "Jenerik vs Orijinal" : "Generic vs Original"}</h3>
              <p className="text-xs text-muted-foreground">{result.genericVsOriginal}</p>
            </div>
          )}

          {/* When to Stop */}
          {result.whenToStop && (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/10">
              <h3 className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">
                {isTr ? "Ne Zaman Bırakmalı" : "When to Stop"}
              </h3>
              <p className="text-xs text-red-600 dark:text-red-300">{result.whenToStop}</p>
            </div>
          )}

          {/* Pregnancy + Storage */}
          <div className="grid grid-cols-2 gap-2">
            {result.pregnancyCategory && (
              <div className="rounded-2xl border bg-card p-3">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{isTr ? "Gebelik" : "Pregnancy"}</span>
                <p className="text-xs font-medium mt-0.5">{result.pregnancyCategory}</p>
              </div>
            )}
            {result.storageInfo && (
              <div className="rounded-2xl border bg-card p-3">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{isTr ? "Saklama" : "Storage"}</span>
                <p className="text-xs font-medium mt-0.5">{result.storageInfo}</p>
              </div>
            )}
          </div>

          {/* New search */}
          <button onClick={() => { setResult(null); setDrugName(""); }}
            className="w-full rounded-xl border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            {isTr ? "Yeni İlaç Ara" : "Search Another Drug"}
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-[10px] text-muted-foreground/40">{tx("disclaimer.tool", lang)}</p>
    </div>
    </DoctorShell>
  );
}
