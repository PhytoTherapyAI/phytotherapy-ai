// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Shield, Lock, Eye, Server, FileCheck, AlertTriangle, Key, Database, Siren, Globe, UserX, Brain } from "lucide-react"
import { DATA_BREACH_PLAN } from "@/lib/security-audit"

export default function SecurityPage() {
  const { lang } = useLang()

  const sections = [
    { icon: Lock, titleKey: "security.dataEncryption", descKey: "security.dataEncryptionDesc", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { icon: Shield, titleKey: "security.kvkkGdpr", descKey: "security.kvkkGdprDesc", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
    { icon: Brain, titleKey: "security.aiSafety", descKey: "security.aiSafetyDesc", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/20" },
    { icon: Key, titleKey: "security.authentication", descKey: "security.authenticationDesc", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { icon: Server, titleKey: "security.infrastructure", descKey: "security.infrastructureDesc", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
    { icon: Eye, titleKey: "security.accessControl", descKey: "security.accessControlDesc", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
    { icon: Database, titleKey: "security.dataMinimization", descKey: "security.dataMinimizationDesc", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/20" },
    { icon: FileCheck, titleKey: "security.inputValidation", descKey: "security.inputValidationDesc", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
    { icon: AlertTriangle, titleKey: "security.errorMonitoring", descKey: "security.errorMonitoringDesc", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-semibold">
            {tx("security.title", lang)}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            {tx("security.subtitle", lang)}
          </p>
        </div>

        <div className="grid gap-4">
          {sections.map((s, i) => {
            const Icon = s.icon
            return (
              <Card key={i} className="p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{tx(s.titleKey, lang)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tx(s.descKey, lang)}</p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Data Transfers & SCC (MADDE 11) */}
        <Card className="mt-8 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {lang === "tr" ? "Veri Aktarımı ve Standart Sözleşmeler (SCC)" : "Data Transfers and Standard Contractual Clauses (SCC)"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "tr" ? "KVKK Madde 9 uyarınca yurt dışı veri aktarımı" : "International data transfer per KVKK Article 9"}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {lang === "tr"
              ? "DoctoPal, kullanıcı verilerini aşağıdaki hizmet sağlayıcılarla işlemektedir:"
              : "DoctoPal processes user data with the following service providers:"}
          </p>

          <ul className="space-y-2 text-sm text-muted-foreground mb-4">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Supabase (İrlanda/AB)</strong>
                {lang === "tr" ? " — Veri depolama ve veritabanı yönetimi" : " — Data storage and database management"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Anthropic Claude API (ABD)</strong>
                {lang === "tr" ? " — Yapay zeka analizi (yalnızca anonimleştirilmiş veri)" : " — AI analysis (anonymized data only)"}
              </span>
            </li>
          </ul>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
            {lang === "tr"
              ? "KVKK Md.9 kapsamında her iki sağlayıcı ile Standart Sözleşme (SCC) imzalanmıştır. Sözleşmeler 5 iş günü içinde KVKK Kurulu'na bildirilmiştir. AI API'ye gönderilen verilerde isim, e-posta, TC kimlik no, telefon, adres ve kullanıcı kimliği bulunmaz. Sadece anonimleştirilmiş tıbbi parametreler (yaş aralığı, cinsiyet, ilaç listesi, alerji bilgileri) iletilir."
              : "Standard Contractual Clauses (SCC) have been signed with both providers in accordance with KVKK Art.9. The agreements were notified to the KVKK Board within 5 business days. Data sent to the AI API does not contain names, emails, national ID numbers, phone numbers, addresses, or user IDs. Only anonymized medical parameters (age range, gender, medication list, allergy information) are transmitted."}
          </div>
        </Card>

        {/* Anonymization & Re-identification Risk (MADDE 12) */}
        <Card className="mt-6 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <UserX className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {lang === "tr" ? "Anonimleştirme ve Re-identifikasyon Risk Analizi" : "Anonymization and Re-identification Risk Analysis"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "tr" ? "KVKK Üretken YZ Rehberi (Kasım 2025) uyumu" : "Compliant with KVKK Generative AI Guide (November 2025)"}
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-foreground mb-2">
            {lang === "tr" ? "Anonimleştirme süreci:" : "Anonymization process:"}
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground mb-4 ml-1">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{lang === "tr"
                ? "Kimlik bilgileri (isim, e-posta, TC no, telefon, adres, kullanıcı kimliği) tamamen çıkarılır"
                : "Identity information (name, email, national ID, phone, address, user ID) is completely removed"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{lang === "tr"
                ? 'Yaş bilgisi yaş aralığına dönüştürülür (ör: 22 → "18-24")'
                : 'Age is converted to age range (e.g., 22 → "18-24")'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{lang === "tr"
                ? "Şehir/konum bilgisi gönderilmez"
                : "City/location information is not transmitted"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{lang === "tr"
                ? "Her anonimleştirme işlemi loglanır ve denetlenebilir"
                : "Every anonymization operation is logged and auditable"}</span>
            </li>
          </ul>

          <p className="text-sm font-medium text-foreground mb-2">
            {lang === "tr" ? "Re-identifikasyon risk değerlendirmesi:" : "Re-identification risk assessment:"}
          </p>
          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
            {lang === "tr"
              ? "AI'a gönderilen veri seti (yaş aralığı + cinsiyet + ilaç listesi + alerji) ile bir bireyin doğrudan tanımlanması mümkün değildir çünkü:"
              : "The data set sent to AI (age range + gender + medication list + allergies) cannot be used to directly identify an individual because:"}
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground ml-1">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{lang === "tr"
                ? "Doğrudan tanımlayıcı bilgi (isim, e-posta, TC no) gönderilmemektedir"
                : "No direct identifiers (name, email, national ID) are transmitted"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{lang === "tr"
                ? "Yaş bilgisi aralık olarak gönderilmektedir (tam yaş değil)"
                : "Age is transmitted as a range, not exact"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{lang === "tr"
                ? "Konum/adres bilgisi gönderilmemektedir"
                : "No location/address information is transmitted"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{lang === "tr"
                ? "Türkiye'de benzer ilaç kombinasyonlarını kullanan binlerce kişi bulunmaktadır"
                : "Thousands of people in Turkey share similar medication combinations"}</span>
            </li>
          </ul>
        </Card>

        {/* Data Breach Response Plan — KVKK 72-hour notification */}
        <Card className="mt-8 p-6 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Siren className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {lang === "tr" ? "Veri İhlali Müdahale Planı" : "Data Breach Response Plan"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "tr"
                  ? "KVKK Madde 12 uyarınca olası bir veri ihlalinde izleyeceğimiz adımlar:"
                  : "Steps we follow in case of a data breach, per KVKK Article 12:"}
              </p>
            </div>
          </div>

          <ol className="space-y-1.5 text-sm text-muted-foreground ml-1">
            {(lang === "tr" ? DATA_BREACH_PLAN.stepsTr : DATA_BREACH_PLAN.stepsEn).map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>

          <div className="mt-5 pt-4 border-t border-red-200 dark:border-red-900 grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-foreground mb-1">
                {lang === "tr" ? "KVKK Kurulu İletişim" : "KVKK Board Contact"}
              </p>
              <p className="text-muted-foreground">
                <a href={DATA_BREACH_PLAN.kvkkContact.url} target="_blank" rel="noopener" className="text-primary underline">
                  {DATA_BREACH_PLAN.kvkkContact.url.replace("https://", "")}
                </a>
              </p>
              <p className="text-muted-foreground">{DATA_BREACH_PLAN.kvkkContact.phone}</p>
              <p className="text-muted-foreground">{DATA_BREACH_PLAN.kvkkContact.email}</p>
              <p className="text-red-600 dark:text-red-400 font-semibold mt-1">
                {lang === "tr" ? "Bildirim süresi: " : "Notification deadline: "}
                {DATA_BREACH_PLAN.kvkkContact.deadline}
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                {lang === "tr" ? "DoctoPal Güvenlik" : "DoctoPal Security"}
              </p>
              <p className="text-muted-foreground">{DATA_BREACH_PLAN.internalContact.email}</p>
              <p className="text-muted-foreground">{DATA_BREACH_PLAN.internalContact.contactEmail}</p>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6 text-center bg-primary/5 border-primary/20">
          <p className="text-sm font-medium">
            {tx("security.reportVulnerability", lang)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">security@doctopal.com</p>
        </Card>
      </div>
    </div>
  )
}
