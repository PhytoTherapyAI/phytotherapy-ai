// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useMemo, useCallback } from "react";
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

const EXAMPLE_QUERIES = [
  { medications: ["Metformin"], concernKey: "ic.ex1.concern", labelKey: "ic.ex1.label" },
  { medications: ["Warfarin"], concernKey: "ic.ex2.concern", labelKey: "ic.ex2.label" },
  { medications: ["Lisinopril", "Metformin"], concernKey: "ic.ex3.concern", labelKey: "ic.ex3.label" },
  { medications: ["Sertraline"], concernKey: "ic.ex4.concern", labelKey: "ic.ex4.label" },
];

// Pharmacology "Did You Know?" facts — rotate each page load
const PHARMA_FACTS = [
  { en: "Grapefruit juice blocks the CYP3A4 enzyme, causing serious interactions with 85+ medications.", tr: "Greyfurt suyu CYP3A4 enzimini bloke ederek 85'ten fazla ilaçla ciddi etkileşime girer." },
  { en: "St. John's Wort interacts with more medications than any other herb — including SSRIs, blood thinners, and immunosuppressants.", tr: "Sarı Kantaron tüm bitkiler arasında en fazla ilaçla etkileşir — SSRI'lar, kan sulandırıcılar ve bağışıklık baskılayıcılar dahil." },
  { en: "Taking iron supplements with vitamin C increases absorption by 67%, but taking them with calcium reduces it by 50%.", tr: "Demir takviyesini C vitamini ile almak emilimi %67 artırır, kalsiyum ile almak ise %50 azaltır." },
  { en: "Turmeric combined with piperine (black pepper) increases curcumin bioavailability by 2,000%.", tr: "Zerdeçal, piperin (karabiber) ile birleştiğinde kurkumin biyoyararlanımı %2.000 artar." },
  { en: "Green tea in large amounts can reduce the effectiveness of blood thinners by providing vitamin K.", tr: "Büyük miktarda yeşil çay, K vitamini sağlayarak kan sulandırıcıların etkinliğini azaltabilir." },
];

export default function InteractionCheckerPage() {
  const { isAuthenticated, isLoading: authLoading, session, profile } = useAuth();
  const { lang } = useLang()
  const [medications, setMedications] = useState<string[]>([]);
  const [concern, setConcern] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InteractionResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMedsLoaded, setProfileMedsLoaded] = useState(false);

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
        // Merge with existing, avoiding duplicates
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

  // Real-time red flag detection on concern text — runs on every keystroke
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

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold italic tracking-tight sm:text-3xl md:text-4xl">
              {tx('ic.title', lang)}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {tx('ic.subtitle', lang)}
            </p>
          </div>
        </div>

        {/* Trust glassmorphism card */}
        <div className="glass-card rounded-2xl p-4 glow-lavender">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage/10 dark:bg-sage/20">
              <Shield className="h-4 w-4 text-sage" />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {lang === "tr"
                ? "Sistemimiz; PubMed, Cochrane Library ve dünyanın en saygın hakemli tıp dergilerindeki güncel makaleleri tarayarak size kanıta dayalı, güvenli alternatifler sunar."
                : "Our system scans current articles from PubMed, Cochrane Library, and the world\u2019s most respected peer-reviewed medical journals to provide you with evidence-based, safe alternatives."}
            </p>
          </div>
        </div>

        {/* How it works — compact */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[
            { num: 1, icon: Pill, key: "ic.step1" },
            { num: 2, icon: Heart, key: "ic.step2" },
            { num: 3, icon: Leaf, key: "ic.step3" },
          ].map(({ num, icon: Icon, key }) => (
            <div key={num} className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-2.5 text-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {num}
              </div>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs leading-tight font-medium text-muted-foreground">
                {tx(key, lang)}
              </span>
            </div>
          ))}
        </div>

        {/* Pharmacology "Did You Know?" */}
        <div className="glass-card rounded-2xl p-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-coral/10 dark:bg-coral/20">
              <Sparkles className="h-3.5 w-3.5 text-coral" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-coral">
                {lang === "tr" ? "Biliyor muydunuz?" : "Did You Know?"}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {PHARMA_FACTS[Math.floor(Date.now() / 86400000) % PHARMA_FACTS.length][lang]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-8 space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        {/* Drug Input */}
        <DrugInput
          medications={medications}
          onMedicationsChange={setMedications}
          disabled={isLoading}
        />

        {/* Load from Profile / Guest CTA */}
        {!authLoading && (
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={loadMedicationsFromProfile}
                disabled={loadingProfile || profileMedsLoaded}
                className="gap-2 text-xs"
              >
                {loadingProfile ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : profileMedsLoaded ? (
                  <Pill className="h-3.5 w-3.5 text-primary" />
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
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <LogIn className="h-3.5 w-3.5" />
                {tx("ic.loadFromProfileGuest", lang)}
              </Link>
            )}
          </div>
        )}

        {/* Endowed Progress nudge — appears after first medication */}
        {medications.length > 0 && !concern.trim() && !result && (
          <div className="flex items-center gap-2 rounded-xl border border-lavender/20 bg-lavender/5 p-3 dark:border-lavender/30 dark:bg-lavender/10">
            <Sparkles className="h-4 w-4 text-lavender shrink-0" />
            <p className="text-xs text-muted-foreground">
              {lang === "tr"
                ? `Harika! ${medications.join(", ")} eklendi. Şimdi ne tür bir bitkisel destek arıyorsun? (Örn: Uyku, Enerji, Stres)`
                : `Great! ${medications.join(", ")} added. Now what kind of herbal support are you looking for? (e.g., Sleep, Energy, Stress)`}
            </p>
          </div>
        )}

        {/* Safety Warning */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300">
          {tx("ic.medWarning", lang)}
        </div>

        {/* Concern Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Heart className="h-4 w-4 text-primary" />
            {tx('ic.concernLabel', lang)}
          </label>
          <textarea
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            disabled={isLoading}
            placeholder={tx('ic.concernPlaceholder', lang)}
            rows={3}
            maxLength={1000}
            className={`w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 ${
              redFlagCheck.isEmergency
                ? "border-red-500 ring-2 ring-red-500/30 focus:border-red-500 focus:ring-red-500/30"
                : "focus:border-primary focus:ring-2 focus:ring-primary/20"
            }`}
          />
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {concern.length}/1000
            </span>
          </div>
        </div>

        {/* 🚨 Red Flag Emergency Banner — instant, no button press needed */}
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

        {/* Analyze Button — disabled when emergency detected */}
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || medications.length === 0 || !concern.trim() || redFlagCheck.isEmergency}
          className={`w-full gap-2 py-6 text-base font-medium ${
            redFlagCheck.isEmergency
              ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
              : "bg-primary hover:bg-primary/90"
          }`}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {tx('ic.analyzing', lang)}
            </>
          ) : redFlagCheck.isEmergency ? (
            <>
              <ShieldAlert className="h-5 w-5" />
              {tx('ic.emergencyDisabled', lang)}
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              {tx('ic.checkBtn', lang)}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {/* Profile note — hidden while auth is loading */}
        {!authLoading && !isAuthenticated && !redFlagCheck.isEmergency && (
          <p className="text-center text-xs text-muted-foreground">
            💡 <Link href="/auth/login" className="text-primary underline hover:text-primary/80">{tx('ic.signIn', lang)}</Link>{" "}
            {tx('ic.signInNote', lang)}
          </p>
        )}
      </div>

      {/* Example Queries — hidden during emergency */}
      {!result && !isLoading && !redFlagCheck.isEmergency && (
        <div className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 text-coral" />
            {lang === "tr" ? "Günün En Çok Merak Edilen Etkileşimleri" : "Today\u2019s Most Popular Interactions"}
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EXAMPLE_QUERIES.map((example, i) => (
              <button
                key={i}
                onClick={() => loadExample(example)}
                className="group flex items-center gap-3 rounded-lg border bg-card p-3 text-left text-sm transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="rounded-md bg-primary/10 p-1.5">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="font-medium group-hover:text-primary">
                    {tx(example.labelKey, lang)}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {tx(example.concernKey, lang)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <h3 className="mb-2 text-lg font-semibold">
            {tx('ic.loadingTitle', lang)}
          </h3>
          <div className="space-y-1 text-center text-sm text-muted-foreground">
            <p>🔍 {tx('ic.loadingFda', lang)}</p>
            <p>📚 {tx('ic.loadingPubmed', lang)}</p>
            <p>🧬 {tx('ic.loadingAi', lang)}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
          <h3 className="mb-2 font-semibold text-red-800 dark:text-red-300">
            {tx('ic.errorTitle', lang)}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <Button
            onClick={handleAnalyze}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            {tx('ic.tryAgain', lang)}
          </Button>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && <InteractionResult result={result} />}
    </div>
  );
}
