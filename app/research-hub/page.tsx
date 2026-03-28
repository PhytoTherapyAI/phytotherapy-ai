"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import {
  Building2, FlaskConical, Database, Globe, Users, BarChart3,
  Shield, Lock, FileText, Code2, GitBranch, Microscope,
  TrendingUp, CheckCircle2, ArrowRight, Mail, BookOpen,
  Beaker, Network, Lightbulb, Award, Handshake, Scale,
  ChevronDown, ChevronUp, ExternalLink, Layers,
} from "lucide-react"

// ═══ Data Warehouse Schema (Visual) ═══
const DW_SCHEMA = {
  factTables: [
    { name: "fact_interactions", desc: "Drug-herb interaction queries & results", rows: "500K+" },
    { name: "fact_supplement_usage", desc: "Supplement start/stop/dosage/duration", rows: "200K+" },
    { name: "fact_proms_outcomes", desc: "PROMs/PREMs survey responses (T0-T4)", rows: "100K+" },
    { name: "fact_vital_records", desc: "BP, glucose, weight, HR measurements", rows: "1M+" },
    { name: "fact_symptom_logs", desc: "Symptom reports with severity & duration", rows: "300K+" },
  ],
  dimensionTables: [
    { name: "dim_user_demographics", desc: "Age, gender, region (de-identified)", fields: "age_band, gender, region_code" },
    { name: "dim_medications", desc: "Drug catalog with ATC codes", fields: "atc_code, generic_name, drug_class" },
    { name: "dim_supplements", desc: "Herb/supplement catalog", fields: "name, category, evidence_grade" },
    { name: "dim_conditions", desc: "ICD-10 coded conditions", fields: "icd10_code, condition_name, severity" },
    { name: "dim_time", desc: "Calendar dimension", fields: "date, week, month, quarter, year, season" },
  ],
}

const PARTNERS = [
  { name: "TÜSEB / TÜSPE", country: "Türkiye", type: "Kamu", focus: "Sağlık Araştırma" },
  { name: "TÜBİTAK", country: "Türkiye", type: "Kamu", focus: "Bilimsel Araştırma Fonu" },
  { name: "YÖK / Tıp Fakülteleri", country: "Türkiye", type: "Akademi", focus: "Klinik Araştırma" },
  { name: "TITCK", country: "Türkiye", type: "Regülatör", focus: "İlaç/Takviye Düzenleme" },
  { name: "EMA", country: "AB", type: "Regülatör", focus: "Bitkisel Tıbbi Ürün" },
  { name: "FDA DSHEA", country: "ABD", type: "Regülatör", focus: "Dietary Supplement" },
  { name: "WHO TM", country: "Global", type: "Uluslararası", focus: "Geleneksel Tıp Stratejisi" },
  { name: "ACE", country: "Singapur", type: "İnovasyon", focus: "HealthTech Ekosistemi" },
]

const VALIDATION_PIPELINE = [
  { phase: "Discovery", icon: Lightbulb, desc: { en: "New herbal formulation or protocol identified from literature or traditional use", tr: "Literatür veya geleneksel kullanımdan yeni bitkisel formülasyon veya protokol tespiti" } },
  { phase: "In-Silico", icon: Code2, desc: { en: "AI-powered interaction screening, safety prediction, mechanism analysis", tr: "AI destekli etkileşim taraması, güvenlik tahmini, mekanizma analizi" } },
  { phase: "Pilot", icon: Beaker, desc: { en: "Small cohort (n=50-200) on platform with PROMs tracking, opt-in", tr: "Platformda küçük kohort (n=50-200), PROMs takipli, gönüllü katılım" } },
  { phase: "Validation", icon: Microscope, desc: { en: "Statistical analysis of outcomes, safety review, peer comparison", tr: "Sonuçların istatistiksel analizi, güvenlik incelemesi, akran karşılaştırması" } },
  { phase: "Publication", icon: BookOpen, desc: { en: "Results published in peer-reviewed journal, protocol added to platform", tr: "Sonuçlar hakemli dergide yayımlanır, protokol platforma eklenir" } },
  { phase: "Scale", icon: TrendingUp, desc: { en: "Validated protocol available to all users with evidence grading", tr: "Doğrulanmış protokol tüm kullanıcılara kanıt düzeyi ile sunulur" } },
]

export default function ResearchHubPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [activeTab, setActiveTab] = useState<"overview" | "data" | "pipeline" | "vision">("overview")
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <FlaskConical className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          {isTr ? "Araştırma & İş Birliği Hub'ı" : "Research & Collaboration Hub"}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {isTr
            ? "Üniversiteler, kamu kurumları ve araştırmacılar için açık inovasyon platformu. Anonimleştirilmiş veriler, klinik validasyon hattı ve ulusal sağlık vizyonu entegrasyonu."
            : "Open innovation platform for universities, public institutions and researchers. De-identified data, clinical validation pipeline and national health vision integration."}
        </p>
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Harvard HVHS C10</span>
          <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">KVKK/GDPR</span>
          <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">Open Innovation API</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-xl bg-muted p-1 flex-wrap">
          {[
            { id: "overview" as const, label: isTr ? "Ortaklık Modeli" : "Partnership Model", icon: Handshake },
            { id: "data" as const, label: isTr ? "Veri Ambarı" : "Data Warehouse", icon: Database },
            { id: "pipeline" as const, label: isTr ? "Validasyon Hattı" : "Validation Pipeline", icon: GitBranch },
            { id: "vision" as const, label: isTr ? "Ulusal Vizyon" : "National Vision", icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB 1: Partnership Model ═══ */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* sPPP Model Cards */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold">{isTr ? "Veri Yönetişimi (Governance)" : "Data Governance"}</h3>
                  <p className="text-xs text-muted-foreground">{isTr ? "KVKK / GDPR Uyumlu" : "KVKK / GDPR Compliant"}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  isTr ? "Tüm veriler k-anonymity (k≥5) ile anonimleştirilir" : "All data de-identified with k-anonymity (k≥5)",
                  isTr ? "Kullanıcı opt-in onayı zorunlu (KVKK Madde 5)" : "User opt-in consent required (KVKK Article 5)",
                  isTr ? "Veri erişimi Etik Kurul onayına bağlı" : "Data access requires Ethics Board approval",
                  isTr ? "Minimum veri ilkesi: sadece araştırma için gerekli alanlar" : "Data minimization: only fields needed for research",
                  isTr ? "Audit log: her erişim kayıt altında" : "Audit log: every access is recorded",
                  isTr ? "Veri Türkiye'de barındırılır (Supabase EU region)" : "Data hosted in Turkey (Supabase EU region)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/50">
                  <Code2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold">{isTr ? "Açık İnovasyon API" : "Open Innovation API"}</h3>
                  <p className="text-xs text-muted-foreground">REST + GraphQL</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <code className="text-xs">
                    <span className="text-green-600">GET</span> /api/research/interactions<br/>
                    <span className="text-blue-600">GET</span> /api/research/outcomes<br/>
                    <span className="text-amber-600">GET</span> /api/research/demographics<br/>
                    <span className="text-purple-600">POST</span> /api/research/cohort-builder<br/>
                    <span className="text-red-600">GET</span> /api/research/export?format=csv
                  </code>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isTr
                    ? "Tüm endpoint'ler OAuth2 + API key ile korunur. Rate limit: 1000 req/gün akademik, 10000 req/gün kurumsal."
                    : "All endpoints protected with OAuth2 + API key. Rate limit: 1000 req/day academic, 10000 req/day enterprise."}
                </p>
              </div>
            </div>
          </div>

          {/* Partner Institutions */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Handshake className="h-5 w-5 text-primary" />
              {isTr ? "Hedef Ortaklık Kurumları" : "Target Partnership Institutions"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PARTNERS.map((p, i) => (
                <div key={i} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{p.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold">{p.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                      p.type === "Kamu" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                      : p.type === "Akademi" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      : p.type === "Regülatör" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                      : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                    }`}>{p.type}</span>
                    <span className="text-[10px] text-muted-foreground">{p.focus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: Data Warehouse ═══ */}
      {activeTab === "data" && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Database className="h-5 w-5 text-primary" />
              {isTr ? "Araştırma Veri Ambarı Şeması" : "Research Data Warehouse Schema"}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {isTr
                ? "Star schema mimarisi — fact tabloları (ölçümler) + dimension tabloları (bağlam). SQL ve Python (Pandas) ile sorgulanabilir."
                : "Star schema architecture — fact tables (measurements) + dimension tables (context). Queryable with SQL and Python (Pandas)."}
            </p>

            {/* Star Schema Visual */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Fact Tables */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                  <Layers className="h-4 w-4" />
                  Fact Tables
                </h4>
                <div className="space-y-2">
                  {DW_SCHEMA.factTables.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setExpandedSchema(expandedSchema === t.name ? null : t.name)}
                      className="w-full rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 p-3 text-left transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">{t.name}</span>
                        <span className="text-[9px] text-muted-foreground">{t.rows}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension Tables */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                  <Network className="h-4 w-4" />
                  Dimension Tables
                </h4>
                <div className="space-y-2">
                  {DW_SCHEMA.dimensionTables.map((t) => (
                    <div key={t.name} className="rounded-lg border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20 p-3">
                      <span className="text-xs font-mono font-bold text-green-700 dark:text-green-300">{t.name}</span>
                      <p className="mt-1 text-[10px] text-muted-foreground">{t.desc}</p>
                      <p className="mt-1 text-[9px] font-mono text-muted-foreground/70">{t.fields}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Example Query */}
            <div className="mt-6 rounded-lg bg-gray-900 p-4 overflow-x-auto">
              <p className="mb-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {isTr ? "Örnek Sorgu: Ashwagandha kullanıcılarının uyku kalitesi değişimi" : "Example Query: Sleep quality change in Ashwagandha users"}
              </p>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{`SELECT
  d.age_band, d.gender,
  AVG(baseline.sleep_quality) as avg_baseline_sleep,
  AVG(week4.sleep_quality) as avg_week4_sleep,
  AVG(week4.sleep_quality - baseline.sleep_quality) as avg_improvement,
  COUNT(DISTINCT f.user_id) as cohort_size
FROM fact_proms_outcomes f
JOIN dim_user_demographics d ON f.user_id = d.user_id
JOIN fact_proms_outcomes baseline
  ON f.user_id = baseline.user_id AND baseline.timepoint = 'T0'
JOIN fact_proms_outcomes week4
  ON f.user_id = week4.user_id AND week4.timepoint = 'T2'
WHERE f.supplement_name ILIKE '%ashwagandha%'
GROUP BY d.age_band, d.gender
HAVING COUNT(DISTINCT f.user_id) >= 5  -- k-anonymity
ORDER BY avg_improvement DESC;`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 3: Validation Pipeline ═══ */}
      {activeTab === "pipeline" && (
        <div className="space-y-8">
          {/* Clinical Validation Pipeline */}
          <div>
            <h3 className="mb-6 text-lg font-bold text-center">
              {isTr ? "Klinik Validasyon Hattı" : "Clinical Validation Pipeline"}
            </h3>
            <div className="relative">
              {/* Connection line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20 hidden md:block" style={{ transform: "translateX(-50%)" }} />

              <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-6">
                {VALIDATION_PIPELINE.map((step, i) => {
                  const Icon = step.icon
                  const isLeft = i % 2 === 0
                  return (
                    <div
                      key={step.phase}
                      className={`relative rounded-xl border bg-card p-5 ${isLeft ? "md:text-right" : "md:col-start-2"}`}
                    >
                      {/* Dot on timeline */}
                      <div className="hidden md:flex absolute top-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background"
                        style={{
                          [isLeft ? "right" : "left"]: "-2rem",
                          transform: "translateY(-50%)",
                        }}
                      />

                      <div className={`flex items-center gap-3 mb-2 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                            {isTr ? `Faz ${i + 1}` : `Phase ${i + 1}`}
                          </span>
                          <h4 className="text-sm font-bold">{step.phase}</h4>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isTr ? step.desc.tr : step.desc.en}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Entrepreneur Support Program */}
          <div className="rounded-xl border bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-950/20 dark:to-yellow-950/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h3 className="text-lg font-bold">
                {isTr ? "Girişimci Destek Programı" : "Entrepreneur Support Program"}
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: isTr ? "Veri Erişimi" : "Data Access",
                  desc: isTr ? "Onaylı girişimcilere anonim araştırma verisi, kohort oluşturma araçları ve API erişimi" : "Approved startups get anonymous research data, cohort building tools and API access",
                },
                {
                  title: isTr ? "Platform Entegrasyonu" : "Platform Integration",
                  desc: isTr ? "Başarılı ürünler Phytotherapy.ai marketplace'ine eklenir, milyonlarca kullanıcıya erişim" : "Successful products added to Phytotherapy.ai marketplace, reaching millions of users",
                },
                {
                  title: isTr ? "Klinik Validasyon" : "Clinical Validation",
                  desc: isTr ? "Platform üzerinde PROMs bazlı pilot çalışma yapma imkanı, akademik yayın desteği" : "PROMs-based pilot study capability on platform, academic publication support",
                },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-background/80 p-4">
                  <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 4: National Vision ═══ */}
      {activeTab === "vision" && (
        <div className="space-y-6">
          {/* System-Level Impact */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
            <h3 className="mb-4 text-lg font-bold text-center">
              {isTr ? "Sistem Düzeyinde Etki — Yatırımcı Vizyonu" : "System-Level Impact — Investor Vision"}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Users, value: "84M", label: isTr ? "Türkiye Nüfusu" : "Turkey Population", sub: isTr ? "İlk hedef pazar" : "Primary target market" },
                { icon: Building2, value: "$42.6B", label: isTr ? "Global Fitoterapi Pazarı" : "Global Phytotherapy Market", sub: "2026, CAGR 8.7%" },
                { icon: Microscope, value: "3,200+", label: isTr ? "Aktif Klinik Çalışma" : "Active Clinical Trials", sub: "ClinicalTrials.gov" },
                { icon: Scale, value: "0", label: isTr ? "Rakip (Bu Segmentte)" : "Competitors (This Segment)", sub: isTr ? "İlaç+bitki+AI+sonuç ölçümü" : "Drug+herb+AI+outcome measurement" },
              ].map((stat, i) => (
                <div key={i} className="rounded-lg bg-background/80 p-4 text-center">
                  <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <div className="text-2xl font-black text-primary">{stat.value}</div>
                  <div className="text-xs font-bold">{stat.label}</div>
                  <div className="text-[9px] text-muted-foreground">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* NHTS Alignment */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 font-bold">
              {isTr ? "Ulusal HVHS Geçiş Stratejisi Uyumu" : "National HVHS Transition Strategy Alignment"}
            </h3>
            <div className="space-y-3">
              {[
                {
                  strategy: isTr ? "Türkiye 2023-2028 Sağlık Dönüşüm Programı" : "Turkey 2023-2028 Health Transformation Program",
                  alignment: isTr ? "Dijital sağlık altyapısı, vatandaş odaklı sağlık hizmeti, koruyucu sağlık vurgusu" : "Digital health infrastructure, citizen-centered care, preventive health emphasis",
                },
                {
                  strategy: isTr ? "G20 Dijital Sağlık Çerçevesi" : "G20 Digital Health Framework",
                  alignment: isTr ? "Interoperabilite (FHIR), veri paylaşımı, yapay zeka güvenliği" : "Interoperability (FHIR), data sharing, AI safety",
                },
                {
                  strategy: isTr ? "WHO Geleneksel Tıp Stratejisi 2024-2034" : "WHO Traditional Medicine Strategy 2024-2034",
                  alignment: isTr ? "Kanıta dayalı entegrasyon, güvenlik izleme, regülasyon uyumu" : "Evidence-based integration, safety monitoring, regulatory alignment",
                },
                {
                  strategy: isTr ? "AB Dijital Sağlık Alanı (EHDS)" : "EU European Health Data Space (EHDS)",
                  alignment: isTr ? "Sınır ötesi veri paylaşımı, hasta veri taşınabilirliği, ikincil kullanım çerçevesi" : "Cross-border data sharing, patient data portability, secondary use framework",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">{item.strategy}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.alignment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
            <h3 className="mb-2 text-xl font-bold">
              {isTr ? "Araştırma Ortaklığı Başvurusu" : "Research Partnership Application"}
            </h3>
            <p className="mb-5 text-sm text-muted-foreground">
              {isTr
                ? "Üniversite, kamu kurumu veya araştırma merkezi olarak veri erişimi ve iş birliği için başvurun."
                : "Apply for data access and collaboration as a university, public institution or research center."}
            </p>
            <a
              href="mailto:research@phytotherapy.ai"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90"
            >
              <Mail className="h-4 w-4" />
              research@phytotherapy.ai
            </a>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl border bg-muted/30 p-5 text-center text-xs text-muted-foreground">
        {isTr
          ? "Bu sayfa araştırma ve iş birliği çerçevesini tanıtmaktadır. Tüm veri paylaşımları KVKK, GDPR ve ilgili yasal düzenlemelere uygun olarak, etik kurul onayı ve kullanıcı rızası ile gerçekleştirilir."
          : "This page describes the research and collaboration framework. All data sharing is conducted in compliance with KVKK, GDPR and relevant regulations, with ethics board approval and user consent."}
      </div>
    </div>
  )
}
