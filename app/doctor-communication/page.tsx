// © 2026 Phytotherapy.ai — All Rights Reserved
// Doctor Communication — Visit Preparation Coach (Behavioral Redesign)
"use client";

import { useState, useRef } from "react";
import { Stethoscope, Loader2, LogIn, Printer, ClipboardList, MessageCircle, HelpCircle, Shield, Search, Sparkles } from "lucide-react";
import { DoctorShell } from "@/components/doctor/DoctorShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface StructuredDescription {
  mainComplaint: string; onset: string; location: string; duration: string;
  character: string; aggravating: string; relieving: string; severity: string;
  associated: string; timeline: string;
}

interface DoctorCommResult {
  structuredDescription: StructuredDescription;
  questionsToAsk: string[];
  tipsForVisit: string[];
  whatToBring: string[];
  redFlags: string | null;
}

const QUICK_TOPICS = [
  { emoji: "🩸", en: "Interpret my blood test results", tr: "Tahlil sonuçlarımı yorumla" },
  { emoji: "💊", en: "I'm having medication side effects", tr: "İlaç yan etkileri yaşıyorum" },
  { emoji: "🌿", en: "I want to discuss herbal supplements", tr: "Bitkisel takviye danışmak istiyorum" },
  { emoji: "😴", en: "I have sleep problems", tr: "Uyku sorunlarım var" },
];

export default function DoctorCommunicationPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const isTr = lang === "tr";
  const printRef = useRef<HTMLDivElement>(null);
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DoctorCommResult | null>(null);

  const handleSubmit = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 5) return;
    setIsLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch("/api/doctor-communication", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ symptoms_description: symptoms.trim(), lang }),
      });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Request failed"); }
      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setIsLoading(false); }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>Doctor Visit Preparation</title><style>body{font-family:system-ui;padding:2rem;max-width:700px;margin:0 auto}h2{border-bottom:1px solid #ddd;padding-bottom:.3rem}ul{padding-left:1.5rem}.red{color:#dc2626;font-weight:600}</style></head><body>${printRef.current.innerHTML}</body></html>`);
      w.document.close(); w.print();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl scale-150" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Stethoscope className="h-9 w-9 text-primary/60" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">{tx("doctorcomm.title", lang)}</h1>
          <p className="text-sm text-muted-foreground mb-6">{tx("doctorcomm.subtitle", lang)}</p>
          <Button onClick={() => window.location.href = "/auth/login"} className="gap-2 rounded-xl">
            <LogIn className="w-4 h-4" /> {tx("tool.loginRequired", lang)}
          </Button>
        </div>
      </div>
    );
  }

  const descLabels: Record<string, { en: string; tr: string }> = {
    mainComplaint: { en: "Main Complaint", tr: "Ana Şikayet" },
    onset: { en: "When It Started", tr: "Ne Zaman Başladı" },
    location: { en: "Location", tr: "Konum" },
    duration: { en: "Duration", tr: "Süre" },
    character: { en: "Character", tr: "Nitelik" },
    aggravating: { en: "What Makes It Worse", tr: "Artıran Faktörler" },
    relieving: { en: "What Helps", tr: "Azaltan Faktörler" },
    severity: { en: "Severity", tr: "Şiddet" },
    associated: { en: "Associated Symptoms", tr: "Eşlik Eden Belirtiler" },
    timeline: { en: "Pattern/Timeline", tr: "Seyir" },
  };

  return (
    <DoctorShell>
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Trust indicator */}
      <div className="mb-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-emerald-500" />
        {isTr ? "Tüm görüşmeleriniz uçtan uca şifrelenir ve tıbbi sır olarak saklanır" : "All conversations are end-to-end encrypted and stored as medical confidential"}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-150 mx-auto w-16 h-16" />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Stethoscope className="h-7 w-7 text-primary" />
          </div>
        </div>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          {isTr ? "Sağlık Ekibinizle İletişime Geçin" : "Connect With Your Health Team"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          {isTr
            ? "Tahlil sonuçlarınızı danışın, ilaç etkileşimlerini sorun veya yeni bir tedavi planı oluşturun."
            : "Discuss test results, ask about drug interactions, or create a new treatment plan."}
        </p>
      </div>

      {/* Input card */}
      <div className="rounded-2xl border bg-card p-5 shadow-soft mb-6">
        {/* Quick topic chips */}
        {!result && !isLoading && symptoms.length < 5 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {isTr ? "Hızlı Konu Seç" : "Quick Topic Select"}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPICS.map((topic, i) => (
                <button key={i} onClick={() => setSymptoms(isTr ? topic.tr : topic.en)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-95"
                  style={{ animation: `chipFadeIn 0.3s ease-out ${i * 80}ms both` }}>
                  <span>{topic.emoji}</span>
                  {isTr ? topic.tr : topic.en}
                </button>
              ))}
            </div>
            <style jsx>{`
              @keyframes chipFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
          </div>
        )}

        <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
          placeholder={tx("doctorcomm.describe", lang)}
          rows={4}
          className="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
        <Button onClick={handleSubmit} disabled={isLoading || symptoms.trim().length < 5}
          className="mt-3 w-full gap-2 rounded-xl bg-primary hover:bg-primary/90">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {tx("doctorcomm.coach", lang)}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {result.redFlags && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 dark:border-red-700 dark:bg-red-950/20">
              <h3 className="font-bold text-red-800 dark:text-red-400 mb-1 flex items-center gap-2">
                🚨 {tx("doctorComm.redFlags", lang)}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">{result.redFlags}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handlePrint} variant="outline" className="gap-2 text-xs rounded-xl">
              <Printer className="w-3.5 h-3.5" /> {tx("common.print", lang)}
            </Button>
          </div>

          <div ref={printRef}>
            {/* Structured Description */}
            <div className="rounded-2xl border bg-card p-5 shadow-soft mb-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">{tx("doctorComm.structuredDesc", lang)}</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(result.structuredDescription).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div key={key}>
                      <span className="text-xs font-medium text-muted-foreground">{descLabels[key]?.[lang] || key}: </span>
                      <span className="text-sm">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Questions */}
            {result.questionsToAsk?.length > 0 && (
              <div className="rounded-2xl border bg-card p-5 shadow-soft mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-sm">{tx("doctorComm.questionsToAsk", lang)}</h2>
                </div>
                <ul className="space-y-1.5">
                  {result.questionsToAsk.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold mt-0.5">{i + 1}.</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips + What to Bring */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.tipsForVisit?.length > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <h3 className="font-semibold text-primary text-xs mb-2">{tx("doctorComm.visitTips", lang)}</h3>
                  <ul className="space-y-1">
                    {result.tipsForVisit.map((t, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span>•</span>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.whatToBring?.length > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <h3 className="font-semibold text-primary text-xs mb-2">{tx("doctorComm.whatToBring", lang)}</h3>
                  <ul className="space-y-1">
                    {result.whatToBring.map((w, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span>•</span>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Behavioral Empty State */}
      {!result && !isLoading && !error && symptoms.length < 5 && (
        <div className="text-center py-8">
          <div className="relative mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-150 mx-auto w-20 h-20" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5">
              <MessageCircle className="h-8 w-8 text-primary/20" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 max-w-xs mx-auto">
            {isTr
              ? "Şikayetinizi yazın, AI doktor ziyaretiniz için yapılandırılmış bir hazırlık raporu oluştursun."
              : "Describe your symptoms, and AI will create a structured preparation report for your doctor visit."}
          </p>
        </div>
      )}

      <p className="mt-8 text-center text-[10px] text-muted-foreground/40">{tx("disclaimer.tool", lang)}</p>
    </div>
    </DoctorShell>
  );
}
