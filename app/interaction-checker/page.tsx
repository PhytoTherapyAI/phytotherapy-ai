// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import Link from "next/link";
import {
  Shield,
  Search,
  Loader2,
  Sparkles,
  ArrowRight,
  Pill,
  Leaf,
  Heart,
  Phone,
  ShieldAlert,
  Download,
  LogIn,
  BookmarkPlus,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrugInput } from "@/components/interaction/DrugInput";
import { InteractionResult } from "@/components/interaction/InteractionResult";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { checkRedFlags, getEmergencyMessage } from "@/lib/safety-filter";
import type { InteractionResult as InteractionResultType } from "@/lib/interaction-engine";
import type { UserMedication } from "@/lib/database.types";
import { createBrowserClient } from "@/lib/supabase";

const SAVED_MEDS_KEY = "doctopal-saved-medications";
const SAVED_CHECKS_KEY = "doctopal-saved-checks";

const EXAMPLE_QUERIES = [
  { medications: ["Metformin"], concernKey: "ic.ex1.concern", labelKey: "ic.ex1.label" },
  { medications: ["Warfarin"], concernKey: "ic.ex2.concern", labelKey: "ic.ex2.label" },
  { medications: ["Lisinopril", "Metformin"], concernKey: "ic.ex3.concern", labelKey: "ic.ex3.label" },
  { medications: ["Sertraline"], concernKey: "ic.ex4.concern", labelKey: "ic.ex4.label" },
];

const PHARMA_FACTS = [
  { en: "Grapefruit juice blocks the CYP3A4 enzyme, causing serious interactions with 85+ medications.", tr: "Greyfurt suyu CYP3A4 enzimini bloke ederek 85'ten fazla ilaçla ciddi etkileşime girer." },
  { en: "St. John's Wort interacts with more medications than any other herb — including SSRIs, blood thinners, and immunosuppressants.", tr: "Sarı Kantaron tüm bitkiler arasında en fazla ilaçla etkileşir — SSRI'lar, kan sulandırıcılar ve bağışıklık baskılayıcılar dahil." },
  { en: "Taking iron supplements with vitamin C increases absorption by 67%, but taking them with calcium reduces it by 50%.", tr: "Demir takviyesini C vitamini ile almak emilimi %67 artırır, kalsiyum ile almak ise %50 azaltır." },
  { en: "Turmeric combined with piperine (black pepper) increases curcumin bioavailability by 2,000%.", tr: "Zerdeçal, piperin (karabiber) ile birleştiğinde kurkumin biyoyararlanımı %2.000 artar." },
  { en: "Green tea in large amounts can reduce the effectiveness of blood thinners by providing vitamin K.", tr: "Büyük miktarda yeşil çay, K vitamini sağlayarak kan sulandırıcıların etkinliğini azaltabilir." },
];

export default function InteractionCheckerPage() {
  const { isAuthenticated, isLoading: authLoading, session, profile } = useAuth();
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [medications, setMedications] = useState<string[]>([]);
  const [concern, setConcern] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InteractionResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMedsLoaded, setProfileMedsLoaded] = useState(false);
  const [savedMeds, setSavedMeds] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

  // Load saved medications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_MEDS_KEY);
      if (saved) setSavedMeds(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const loadMedicationsFromProfile = async () => {
    if (!profile) return;
    setLoadingProfile(true);
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("user_medications")
        .select("*")
        .eq("user_id", profile.id)
        .eq("is_active", true);
      if (data && data.length > 0) {
        const medNames = (data as UserMedication[]).map(
          (m) => m.brand_name || m.generic_name || ""
        ).filter(Boolean);
        setMedications((prev) => {
          const existing = new Set(prev.map((s) => s.toLowerCase()));
          const merged = [...prev];
          for (const name of medNames) {
            if (!existing.has(name.toLowerCase())) {
              merged.push(name);
              existing.add(name.toLowerCase());
            }
          }
          return merged;
        });
        setProfileMedsLoaded(true);
      }
    } catch (err) {
      console.error("Failed to load profile medications:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveMeds = () => {
    if (medications.length === 0) return;
    try {
      localStorage.setItem(SAVED_MEDS_KEY, JSON.stringify(medications));
      setSavedMeds(medications);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch { /* ignore */ }
  };

  const handleLoadSaved = (med: string) => {
    if (!medications.includes(med)) {
      setMedications(prev => [...prev, med]);
    }
  };

  const redFlagCheck = useMemo(() => checkRedFlags(concern), [concern]);

  const handleAnalyze = async () => {
    if (medications.length === 0 || !concern.trim() || redFlagCheck.isEmergency) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/interaction", {
        method: "POST",
        headers,
        body: JSON.stringify({ medications, concern: concern.trim(), lang }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze interactions");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = (example: (typeof EXAMPLE_QUERIES)[0]) => {
    setMedications(example.medications);
    setConcern(tx(example.concernKey, lang));
    setResult(null);
    setError(null);
  };

  const pharmaFact = PHARMA_FACTS[Math.floor(Date.now() / 86400000) % PHARMA_FACTS.length];

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">

      {/* ── HEADER ── */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-xl font-bold italic tracking-tight sm:text-3xl md:text-4xl">
                {tx('ic.title', lang)}
              </h1>
              <InfoTooltip title="Safety Radar" description="Check drug-herb-supplement interactions. Add your medications to scan for risks instantly." />
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border">
                <Zap className="h-3 w-3 text-primary" />
                {isTr ? "PubMed & FDA destekli" : "Powered by PubMed & FDA"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground md:text-base">
              {tx('ic.subtitle', lang)}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2 COLUMN LAYOUT ── */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* LEFT: Main Form (3/5) */}
        <div className="space-y-5 lg:col-span-3">

          {/* SAVED MEDICATIONS QUICK SELECT */}
          {savedMeds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                {isTr ? "Kaydedilmiş İlaçlarım" : "Your Medications"}
              </p>
              <div className="flex flex-wrap gap-2">
                {savedMeds.map((med, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.95 }}
                    onClick={() => handleLoadSaved(med)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                      medications.includes(med)
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-foreground hover:border-primary/30 hover:bg-primary/5"
                    }`}>
                    <Pill className="h-3 w-3" />
                    {med}
                    {medications.includes(med) && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* MAIN CARD */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">

            {/* STEP 1: Add Medications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">1</div>
                <p className="text-sm font-semibold">{isTr ? "İlaçlarınızı Ekleyin" : "Add Your Medications"}</p>
              </div>

              <DrugInput
                medications={medications}
                onMedicationsChange={setMedications}
                disabled={isLoading}
              />

              {/* Load from Profile / Saved */}
              {!authLoading && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMedicationsFromProfile}
                      disabled={loadingProfile || profileMedsLoaded}
                      className="gap-2 text-xs rounded-full"
                    >
                      {loadingProfile ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : profileMedsLoaded ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      {profileMedsLoaded
                        ? tx("ic.profileMedsLoaded", lang)
                        : tx("ic.loadFromProfile", lang)}
                    </Button>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      {tx("ic.loadFromProfileGuest", lang)}
                    </Link>
                  )}

                  {/* Save current medications */}
                  {medications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveMeds}
                      className="gap-1.5 text-xs rounded-full text-muted-foreground hover:text-primary"
                    >
                      {savedSuccess ? (
                        <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {isTr ? "Kaydedildi!" : "Saved!"}</>
                      ) : (
                        <><BookmarkPlus className="h-3.5 w-3.5" /> {isTr ? "Kaydet & Tekrar Kullan" : "Save & Reuse"}</>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Endowed Progress nudge */}
            {medications.length > 0 && !concern.trim() && !result && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {isTr
                    ? `Harika! ${medications.join(", ")} eklendi. Şimdi ne tür bir bitkisel destek arıyorsun?`
                    : `Great! ${medications.join(", ")} added. Now what herbal support are you looking for?`}
                </p>
              </motion.div>
            )}

            {/* DIVIDER */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* STEP 2: Describe Concern */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">2</div>
                <label className="text-sm font-semibold">{tx('ic.concernLabel', lang)}</label>
              </div>

              <textarea
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                disabled={isLoading}
                placeholder={isTr
                  ? "örn. Uyku için Sarı Kantaron almak istiyorum"
                  : "e.g., I want to take St. John's Wort for sleep"}
                rows={3}
                maxLength={1000}
                className={`w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 ${
                  redFlagCheck.isEmergency
                    ? "border-red-500 ring-2 ring-red-500/30 focus:border-red-500"
                    : "focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-muted-foreground">
                  {isTr ? "Ne tür bitkisel destek veya takviye istediğinizi yazın" : "Describe the herbal support or supplement you're considering"}
                </span>
                <span className="text-[10px] text-muted-foreground">{concern.length}/1000</span>
              </div>
            </div>

            {/* 🚨 Emergency Banner */}
            {redFlagCheck.isEmergency && (
              <div className="rounded-xl border-2 border-red-500 bg-red-50 p-5 dark:bg-red-950/40">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-red-600 p-2.5">
                    <ShieldAlert className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                      🚨 Emergency Warning
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-red-700 dark:text-red-300">
                      {getEmergencyMessage(redFlagCheck.language)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="tel:112"
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                      >
                        <Phone className="h-4 w-4" />
                        {tx('ic.emergencyCall', lang)}
                      </a>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-xs font-medium text-red-800 dark:border-red-700 dark:bg-red-900/50 dark:text-red-300">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {tx('ic.emergencyHerbal', lang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Safety warning */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300">
              {tx("ic.medWarning", lang)}
            </div>

            {/* STEP 3: Analyze Button */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">3</div>
                <p className="text-sm font-semibold">{isTr ? "Güvenlik Analizini Başlat" : "Run Safety Analysis"}</p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isLoading || medications.length === 0 || !concern.trim() || redFlagCheck.isEmergency}
                className={`w-full gap-2 py-6 text-base font-medium rounded-xl ${
                  redFlagCheck.isEmergency
                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                    : "bg-primary hover:bg-primary/90"
                }`}
                size="lg"
              >
                {isLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" />{tx('ic.analyzing', lang)}</>
                ) : redFlagCheck.isEmergency ? (
                  <><ShieldAlert className="h-5 w-5" />{tx('ic.emergencyDisabled', lang)}</>
                ) : (
                  <><Search className="h-5 w-5" />{tx('ic.checkBtn', lang)}<ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>

            {/* Sign in note */}
            {!authLoading && !isAuthenticated && !redFlagCheck.isEmergency && (
              <p className="text-center text-xs text-muted-foreground">
                💡 <Link href="/auth/login" className="text-primary underline hover:text-primary/80">{tx('ic.signIn', lang)}</Link>{" "}
                {tx('ic.signInNote', lang)}
              </p>
            )}
          </div>

          {/* EXAMPLE QUERIES */}
          {!result && !isLoading && !redFlagCheck.isEmergency && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                {isTr ? "Günün En Çok Merak Edilen Etkileşimleri" : "Today's Most Popular Interactions"}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {EXAMPLE_QUERIES.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => loadExample(example)}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-3 text-left text-sm transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="rounded-md bg-primary/10 p-1.5">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium group-hover:text-primary text-xs">
                        {tx(example.labelKey, lang)}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {tx(example.concernKey, lang)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <h3 className="mb-2 text-lg font-semibold">{tx('ic.loadingTitle', lang)}</h3>
              <div className="space-y-1 text-center text-sm text-muted-foreground">
                <p>🔍 {tx('ic.loadingFda', lang)}</p>
                <p>📚 {tx('ic.loadingPubmed', lang)}</p>
                <p>🧬 {tx('ic.loadingAi', lang)}</p>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
              <h3 className="mb-2 font-semibold text-red-800 dark:text-red-300">{tx('ic.errorTitle', lang)}</h3>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <Button onClick={handleAnalyze} variant="outline" size="sm" className="mt-3">
                {tx('ic.tryAgain', lang)}
              </Button>
            </div>
          )}

          {/* RESULTS */}
          {result && !isLoading && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{isTr ? "Analiz Sonuçları" : "Analysis Results"}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const checks = JSON.parse(localStorage.getItem(SAVED_CHECKS_KEY) || "[]");
                      checks.unshift({ medications, concern, date: new Date().toISOString() });
                      localStorage.setItem(SAVED_CHECKS_KEY, JSON.stringify(checks.slice(0, 5)));
                    } catch { /* ignore */ }
                  }}
                  className="gap-1.5 text-xs rounded-full"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" />
                  {isTr ? "Bu Kontrolü Kaydet" : "Save This Check"}
                </Button>
              </div>
              <InteractionResult result={result} />
            </div>
          )}
        </div>

        {/* RIGHT: Safety Radar + Did You Know (2/5) */}
        <div className="hidden lg:flex flex-col gap-4 lg:col-span-2">

          {/* Safety Radar Animation */}
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-6 shadow-sm min-h-[220px]">
            {medications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <Shield className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground max-w-[160px] leading-relaxed">
                  {isTr
                    ? "Güvenlik radarını aktif etmek için ilaç veya takviye ekle"
                    : "Add medications and supplements to activate your safety radar"}
                </p>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <Shield className="h-20 w-20 text-primary/20" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute w-32 h-32 rounded-full border-2 border-dashed border-primary/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                  className="absolute w-48 h-48 rounded-full border border-primary/15"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-5 h-5 rounded-full bg-primary/40 top-4 left-1/2 -translate-x-1/2"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
                  className="absolute w-3 h-3 rounded-full bg-amber-400/60 bottom-6 right-8"
                />
              </div>
            )}
            {medications.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-xs font-semibold text-primary">
                  {medications.length} {isTr ? "öğe taranıyor" : "items scanning"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {isTr ? "Aktif tarama" : "Active scan"}
                </p>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {isTr ? "Nasıl çalışır?" : "How it works"}
            </p>
            <div className="space-y-2.5">
              {[
                { num: 1, icon: Pill, key: "ic.step1" },
                { num: 2, icon: Heart, key: "ic.step2" },
                { num: 3, icon: Leaf, key: "ic.step3" },
              ].map(({ num, icon: Icon, key }) => (
                <div key={num} className="flex items-start gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary mt-0.5">
                    {num}
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">{tx(key, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust glassmorphism card */}
          <div className="glass-card rounded-2xl p-4 glow-lavender">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {isTr
                  ? "PubMed, Cochrane Library ve dünyaca kabul görmüş hakemli tıp dergilerindeki güncel makaleler taranır."
                  : "We scan current articles from PubMed, Cochrane Library, and the world's top peer-reviewed medical journals."}
              </p>
            </div>
          </div>

          {/* Did You Know */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {isTr ? "Biliyor muydunuz?" : "Did You Know?"}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {pharmaFact[lang]}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
