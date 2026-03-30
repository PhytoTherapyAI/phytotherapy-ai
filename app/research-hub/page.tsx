// © 2026 Phytotherapy.ai — All Rights Reserved
// Research Hub — Interactive Open Innovation Ecosystem
"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"
import { InnovationShell } from "@/components/innovation/InnovationShell"
import { tx } from "@/lib/translations"
import {
  FlaskConical, Shield, Lock, Globe, Code2, Microscope,
  TrendingUp, BookOpen, Lightbulb, Beaker, Rocket, Key,
  CheckCircle2, Terminal, Play, Copy, Check,
} from "lucide-react"

// ── Partner Institutions ──
const INSTITUTIONS = [
  { name: "WHO TM", region: "global", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { name: "FDA DSHEA", region: "us", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  { name: "EMA", region: "eu", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { name: "TÜBİTAK", region: "tr", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { name: "TÜSEB", region: "tr", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { name: "TITCK", region: "tr", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { name: "YÖK", region: "tr", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { name: "ACE Singapur", region: "global", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
]

const REGION_LABELS: Record<string, { en: string; tr: string }> = {
  global: { en: "Global", tr: "Küresel" },
  us: { en: "USA", tr: "ABD" },
  eu: { en: "EU", tr: "AB" },
  tr: { en: "Turkey", tr: "Türkiye" },
}

// ── Validation Pipeline ──
const PIPELINE = [
  { icon: Lightbulb, label: { en: "Discovery", tr: "Keşif" }, color: "#f59e0b" },
  { icon: Code2, label: { en: "In-Silico", tr: "In-Silico" }, color: "#6366f1" },
  { icon: Beaker, label: { en: "Pilot (n=200)", tr: "Pilot (n=200)" }, color: "#8b5cf6" },
  { icon: Microscope, label: { en: "Validation", tr: "Doğrulama" }, color: "#3b82f6" },
  { icon: BookOpen, label: { en: "Publication", tr: "Yayın" }, color: "#22c55e" },
  { icon: TrendingUp, label: { en: "Scale", tr: "Ölçekleme" }, color: "#10b981" },
]

// ── API Demo Data ──
const API_DEMOS: Record<string, { label: { en: string; tr: string }; endpoint: string; response: string }> = {
  interactions: {
    label: { en: "Fetch Interactions", tr: "Etkileşimleri Çek" },
    endpoint: "GET /api/v1/research/interactions?drug=metformin",
    response: `{
  "status": "success",
  "drug": "Metformin",
  "interactions": [
    {
      "herb": "Berberine",
      "risk": "MODERATE",
      "mechanism": "Additive hypoglycemia",
      "evidence": "B",
      "pubmed_ids": ["32145678", "31987654"]
    },
    {
      "herb": "St. John's Wort",
      "risk": "HIGH",
      "mechanism": "CYP3A4 induction",
      "evidence": "A"
    }
  ],
  "safe_alternatives": ["Valerian", "Chamomile"]
}`,
  },
  cohort: {
    label: { en: "Create Cohort", tr: "Kohort Oluştur" },
    endpoint: "POST /api/v1/research/cohorts",
    response: `{
  "cohort_id": "coh_8f3a2b1c",
  "criteria": {
    "condition": "T2DM",
    "supplement": "Berberine",
    "min_duration_days": 90,
    "k_anonymity": 5
  },
  "matched_users": 847,
  "demographics": {
    "age_mean": 52.3,
    "female_pct": 44.2,
    "medication_mean": 3.1
  },
  "proms_available": true
}`,
  },
}

// ── Trust Governance Chips ──
const GOVERNANCE = [
  { icon: Shield, en: "k-Anonymity (k≥5)", tr: "k-Anonimlik (k≥5)" },
  { icon: Lock, en: "End-to-end Encryption", tr: "Uçtan Uca Şifreleme" },
  { icon: CheckCircle2, en: "Ethics Board Approved", tr: "Etik Kurul Onaylı" },
  { icon: Shield, en: "KVKK/GDPR Compliant", tr: "KVKK/GDPR Uyumlu" },
  { icon: Lock, en: "Opt-in Only", tr: "Yalnızca Gönüllü Katılım" },
  { icon: CheckCircle2, en: "Federated Learning", tr: "Federe Öğrenme" },
]

export default function ResearchHubPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [copied, setCopied] = useState(false)

  // Typewriter effect for API demo
  useEffect(() => {
    if (!activeDemo) { setTypedText(""); return }
    const fullText = API_DEMOS[activeDemo].response
    setIsTyping(true)
    setTypedText("")
    let i = 0
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 8)
    return () => clearInterval(interval)
  }, [activeDemo])

  const copyEndpoint = () => {
    if (activeDemo) {
      navigator.clipboard.writeText(API_DEMOS[activeDemo].endpoint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <InnovationShell>
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-10">
      {/* Hero */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-lavender/10">
          <FlaskConical className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          {isTr ? "Açık İnovasyon Ekosistemi" : "Open Innovation Ecosystem"}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {isTr
            ? "Araştırmacılar, üniversiteler ve sağlık kurumları için kanıta dayalı veri altyapısı"
            : "Evidence-based data infrastructure for researchers, universities, and health institutions"}
        </p>
        <div className="mt-3 flex justify-center gap-2 flex-wrap">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">Harvard HVHS C10</span>
          <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">KVKK/GDPR</span>
          <span className="rounded-full bg-lavender/10 px-3 py-1 text-[10px] font-bold text-lavender">Open API</span>
        </div>
      </div>

      {/* ── Data Vault (Trust Visualization) ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-soft text-center">
        <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-150" />
          {/* Vault icon */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20">
            <Shield className="h-9 w-9 text-primary/40" strokeWidth={1.2} />
            <Lock className="absolute -right-1 -bottom-1 h-5 w-5 text-emerald-500 bg-card rounded-full p-0.5" />
          </div>
        </div>
        <h3 className="text-sm font-bold mb-3">{isTr ? "Veri Yönetişim Kasası" : "Data Governance Vault"}</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {GOVERNANCE.map(({ icon: Icon, en, tr }, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-[10px] font-medium shadow-soft"
              style={{ animation: `fadeUp 0.3s ease-out ${i * 60}ms both` }}>
              <Icon className="h-3 w-3 text-primary" />
              {isTr ? tr : en}
            </div>
          ))}
        </div>
        <style jsx>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>

      {/* ── Interactive API Terminal ── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5" />
          {isTr ? "İnteraktif API Terminali" : "Interactive API Terminal"}
        </h3>
        <div className="flex gap-2 mb-3">
          {Object.entries(API_DEMOS).map(([key, demo]) => (
            <button key={key} onClick={() => setActiveDemo(key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                activeDemo === key ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/30"
              }`}>
              <Play className="h-3 w-3" />
              {demo.label[lang as "en" | "tr"]}
            </button>
          ))}
        </div>
        {/* Terminal window */}
        <div className="rounded-2xl bg-gray-950 text-gray-100 overflow-hidden shadow-soft-lg">
          {/* Title bar */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900/80">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="ml-3 text-[10px] text-gray-500 font-mono">phytotherapy.ai — API Explorer</span>
          </div>
          {/* Content */}
          <div className="p-4 font-mono text-xs min-h-[200px] max-h-[400px] overflow-y-auto">
            {!activeDemo ? (
              <span className="text-gray-500">
                {isTr ? "// Bir endpoint seçerek API'yi keşfedin..." : "// Select an endpoint to explore the API..."}
              </span>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-400">$</span>
                  <span className="text-gray-300">{API_DEMOS[activeDemo].endpoint}</span>
                  <button onClick={copyEndpoint} className="ml-auto text-gray-500 hover:text-gray-300">
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="text-amber-300/90 whitespace-pre-wrap leading-relaxed">
                  {typedText}
                  {isTyping && <span className="animate-pulse">▌</span>}
                </pre>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Validation Pipeline ── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Microscope className="h-3.5 w-3.5" />
          {isTr ? "Doğrulama Hattı" : "Validation Pipeline"}
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-2">
          {PIPELINE.map(({ icon: Icon, label, color }, i) => (
            <div key={i} className="flex shrink-0 items-center">
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border shadow-soft" style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <span className="text-[9px] font-medium text-center w-16">{label[lang as "en" | "tr"]}</span>
              </div>
              {i < PIPELINE.length - 1 && <div className="w-6 h-0.5 bg-border mx-1 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Institution Constellation (Bento Grid) ── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Globe className="h-3.5 w-3.5" />
          {isTr ? "Ekosistem Ağı" : "Ecosystem Network"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INSTITUTIONS.map((inst, i) => (
            <div key={i} className="rounded-2xl border bg-card p-3 shadow-soft text-center transition-all hover:shadow-soft-md hover:-translate-y-0.5"
              style={{ animation: `fadeUp 0.3s ease-out ${i * 50}ms both` }}>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold mb-1.5 ${inst.color}`}>
                {REGION_LABELS[inst.region][lang as "en" | "tr"]}
              </span>
              <p className="text-xs font-bold">{inst.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Golden Ticket CTA ── */}
      <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-lavender/5 to-primary/5 p-6 text-center dark:from-primary/10 dark:via-lavender/10 dark:to-primary/10">
        <h3 className="text-lg font-bold mb-2">{isTr ? "Ekosistemin Parçası Olun" : "Join the Ecosystem"}</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
          {isTr
            ? "Üniversite, araştırma kurumu veya sağlık şirketi olarak API erişimi talep edin. Birlikte kanıta dayalı fitoterapi geleceğini şekillendirelim."
            : "Request API access as a university, research institution, or health company. Let's shape the future of evidence-based phytotherapy together."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="mailto:research@phytotherapy.ai"
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all">
            <Rocket className="h-4 w-4" />
            {isTr ? "Araştırma Partneri Ol" : "Become a Research Partner"}
          </a>
          <a href="mailto:api@phytotherapy.ai"
            className="flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-medium hover:bg-muted transition-all">
            <Key className="h-4 w-4" />
            {isTr ? "API Anahtarı Talep Et" : "Request API Key"}
          </a>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground/40">{tx("disclaimer.tool", lang)}</p>
    </div>
    </InnovationShell>
  )
}
