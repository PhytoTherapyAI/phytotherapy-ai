// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope, FileText, Loader2, ArrowRight, ArrowLeft,
  Copy, Printer, Check, ClipboardList, Pill, AlertTriangle,
  Calendar, MessageSquare, Upload,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { InfoTooltip } from "@/components/ui/InfoTooltip"
import { tx } from "@/lib/translations"

const T: Record<string, { en: string; tr: string }> = {
  title: { en: "Prepare for Your Doctor Visit", tr: "Doktor Ziyaretinize Hazırlanın" },
  subtitle: { en: "Let AI organize your health data into a professional report your doctor will love. Save 15 minutes at your next appointment.", tr: "AI sağlık verilerinizi doktorunuzun seveceği profesyonel bir rapora dönüştürsün. Bir sonraki randevunuzda 15 dakika kazanın." },
  whatVisit: { en: "What's this visit about?", tr: "Bu ziyaret ne hakkında?" },
  newSymptoms: { en: "New Symptoms", tr: "Yeni Belirtiler" },
  followUp: { en: "Follow-up Visit", tr: "Kontrol Muayenesi" },
  labReview: { en: "Lab Results Review", tr: "Tahlil Sonuçları" },
  medReview: { en: "Medication Review", tr: "İlaç Değerlendirmesi" },
  chronicCheck: { en: "Chronic Condition Check-up", tr: "Kronik Hastalık Kontrolü" },
  pregnancyVisit: { en: "Pregnancy Visit", tr: "Gebelik Kontrolü" },
  describe: { en: "Briefly describe your main concern:", tr: "Ana şikayetinizi kısaca açıklayın:" },
  howLong: { en: "How long has this been going on?", tr: "Bu ne zamandır devam ediyor?" },
  severity: { en: "Severity (1-10):", tr: "Şiddet (1-10):" },
  lastDiagnosis: { en: "What was your last diagnosis?", tr: "Son tanınız neydi?" },
  improved: { en: "Has it improved?", tr: "İyileşme oldu mu?" },
  better: { en: "Better", tr: "Daha İyi" },
  same: { en: "Same", tr: "Aynı" },
  worse: { en: "Worse", tr: "Daha Kötü" },
  sideEffects: { en: "Any side effects from your medications?", tr: "İlaçlarınızdan yan etki var mı?" },
  generating: { en: "Generating your report...", tr: "Raporunuz oluşturuluyor..." },
  report: { en: "Pre-Visit Report", tr: "Randevu Öncesi Rapor" },
  chiefComplaint: { en: "Chief Complaint", tr: "Ana Şikayet" },
  currentMeds: { en: "Current Medications", tr: "Mevcut İlaçlar" },
  knownAllergies: { en: "Known Allergies", tr: "Bilinen Alerjiler" },
  questionsForDoc: { en: "Questions for Your Doctor", tr: "Doktorunuza Sorabileceğiniz Sorular" },
  downloadPdf: { en: "Download PDF", tr: "PDF İndir" },
  copyReport: { en: "Copy Report", tr: "Raporu Kopyala" },
  printReport: { en: "Print", tr: "Yazdır" },
  startNew: { en: "Start New Report", tr: "Yeni Rapor" },
  next: { en: "Next", tr: "İleri" },
  back: { en: "Back", tr: "Geri" },
  generate: { en: "Generate Report", tr: "Rapor Oluştur" },
}

function t(key: string, lang: string) {
  return T[key] ? (lang === "tr" ? T[key].tr : T[key].en) : key
}

const VISIT_TYPES = [
  { id: "new_symptoms", emoji: "🤒", key: "newSymptoms" },
  { id: "follow_up", emoji: "📋", key: "followUp" },
  { id: "lab_review", emoji: "🩸", key: "labReview" },
  { id: "med_review", emoji: "💊", key: "medReview" },
  { id: "chronic", emoji: "🔄", key: "chronicCheck" },
  { id: "pregnancy", emoji: "🤰", key: "pregnancyVisit" },
]

const DURATION_OPTIONS = [
  { id: "hours", en: "A few hours", tr: "Birkaç saat" },
  { id: "days", en: "1-3 days", tr: "1-3 gün" },
  { id: "week", en: "About a week", tr: "Yaklaşık 1 hafta" },
  { id: "weeks", en: "2-4 weeks", tr: "2-4 hafta" },
  { id: "months", en: "Over a month", tr: "1 aydan fazla" },
]

interface Report {
  chiefComplaint: string
  medications: string[]
  allergies: string[]
  relevantHistory: string[]
  assessmentSummary: string
  questionsForDoctor: string[]
  visitType: string
  date: string
}

export default function DoctorPrepPage() {
  const { lang } = useLang()
  const { profile } = useAuth()
  const isTr = lang === "tr"

  const [step, setStep] = useState(0) // 0=visit type, 1=details, 2=report
  const [visitType, setVisitType] = useState("")
  const [concern, setConcern] = useState("")
  const [duration, setDuration] = useState("")
  const [severity, setSeverity] = useState(5)
  const [lastDiagnosis, setLastDiagnosis] = useState("")
  const [improved, setImproved] = useState("")
  const [sideEffects, setSideEffects] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const p = profile as (typeof profile & { medications?: string[]; allergies?: (string | { allergen: string })[]; chronic_conditions?: string[] }) | null

  const generateReport = useCallback(async () => {
    setLoading(true)
    try {
      const meds = p?.medications || []
      const allergies = p?.allergies || []
      const conditions = p?.chronic_conditions || []

      // Build report locally from profile + inputs (no API call needed for mock)
      const chiefText = visitType === "new_symptoms"
        ? `${concern}${duration ? ` (${DURATION_OPTIONS.find(d => d.id === duration)?.[isTr ? "tr" : "en"] || duration})` : ""}, severity ${severity}/10`
        : visitType === "follow_up"
        ? `Follow-up for: ${lastDiagnosis}. Status: ${improved || "unknown"}`
        : visitType === "med_review"
        ? `Medication review. Side effects reported: ${sideEffects || "None"}`
        : concern || `${VISIT_TYPES.find(v => v.id === visitType)?.key || visitType} visit`

      const questions = [
        meds.length > 0 ? (isTr ? `${meds[0]} ilacım bu belirtilere katkıda bulunuyor olabilir mi?` : `Could my ${meds[0]} be contributing to these symptoms?`) : null,
        tx("doctorPrep.qImaging", lang),
        tx("doctorPrep.qPhyto", lang),
        conditions.length > 0 ? (isTr ? `${conditions[0]} durumum bu belirtilerle ilişkili olabilir mi?` : `Could my ${conditions[0]} be related to these symptoms?`) : null,
        tx("doctorPrep.qFollowUp", lang),
      ].filter(Boolean) as string[]

      const reportData: Report = {
        chiefComplaint: chiefText,
        medications: meds.length > 0 ? meds : [tx("doctorPrep.noMedsOnProfile", lang)],
        allergies: allergies.length > 0 ? allergies.map((a: string | { allergen: string }) => typeof a === "string" ? a : a.allergen) : [tx("doctorPrep.noKnownAllergies", lang)],
        relevantHistory: conditions.length > 0 ? conditions : [tx("doctorPrep.noKnownConditions", lang)],
        assessmentSummary: tx("doctorPrep.noAssessment", lang),
        questionsForDoctor: questions,
        visitType: VISIT_TYPES.find(v => v.id === visitType)?.key || visitType,
        date: new Date().toLocaleDateString(isTr ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" }),
      }

      // Simulate brief loading for UX
      await new Promise(r => setTimeout(r, 1500))
      setReport(reportData)
      setStep(2)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }, [visitType, concern, duration, severity, lastDiagnosis, improved, sideEffects, p, isTr])

  const handleCopyReport = () => {
    if (!report) return
    const text = [
      `PRE-VISIT REPORT — ${report.date}`,
      `Visit Type: ${t(report.visitType, lang)}`,
      "",
      `CHIEF COMPLAINT: ${report.chiefComplaint}`,
      "",
      `CURRENT MEDICATIONS: ${report.medications.join(", ")}`,
      `KNOWN ALLERGIES: ${report.allergies.join(", ")}`,
      `RELEVANT HISTORY: ${report.relevantHistory.join(", ")}`,
      "",
      `QUESTIONS FOR YOUR DOCTOR:`,
      ...report.questionsForDoctor.map((q, i) => `${i + 1}. ${q}`),
      "",
      "— Prepared by DoctoPal AI (doctopal.com)",
    ].join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPDF = async () => {
    if (!report) return
    setPdfLoading(true)
    try {
      const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer")
      const React = (await import("react")).default
      const s = StyleSheet.create({
        page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
        title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#3c7a52", marginBottom: 4 },
        subtitle: { fontSize: 10, color: "#6b7280", marginBottom: 16 },
        section: { marginBottom: 12 },
        sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#3c7a52", marginBottom: 6 },
        text: { marginBottom: 3 },
        footer: { position: "absolute" as const, bottom: 30, left: 40, right: 40, textAlign: "center" as const, fontSize: 8, color: "#9ca3af" },
      })
      const doc = React.createElement(Document, null,
        React.createElement(Page, { size: "A4", style: s.page },
          React.createElement(Text, { style: s.title }, "DoctoPal — Pre-Visit Report"),
          React.createElement(Text, { style: s.subtitle }, `${report.date} | ${t(report.visitType, lang)}`),
          React.createElement(View, { style: s.section },
            React.createElement(Text, { style: s.sectionTitle }, t("chiefComplaint", lang)),
            React.createElement(Text, { style: s.text }, report.chiefComplaint),
          ),
          React.createElement(View, { style: s.section },
            React.createElement(Text, { style: s.sectionTitle }, t("currentMeds", lang)),
            ...report.medications.map((m, i) => React.createElement(Text, { key: i, style: s.text }, `• ${m}`)),
          ),
          React.createElement(View, { style: s.section },
            React.createElement(Text, { style: s.sectionTitle }, t("knownAllergies", lang)),
            ...report.allergies.map((a, i) => React.createElement(Text, { key: i, style: s.text }, `• ${a}`)),
          ),
          React.createElement(View, { style: s.section },
            React.createElement(Text, { style: s.sectionTitle }, t("questionsForDoc", lang)),
            ...report.questionsForDoctor.map((q, i) => React.createElement(Text, { key: i, style: s.text }, `${i + 1}. ${q}`)),
          ),
          React.createElement(Text, { style: s.footer }, "Prepared by DoctoPal AI — doctopal.com — Not a medical diagnosis"),
        )
      )
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = `DoctoPal-PreVisit-${new Date().toISOString().split("T")[0]}.pdf`
      a.click(); URL.revokeObjectURL(url)
    } catch (err) { console.error("PDF error:", err) }
    finally { setPdfLoading(false) }
  }

  const handleReset = () => {
    setStep(0); setVisitType(""); setConcern(""); setDuration(""); setSeverity(5)
    setLastDiagnosis(""); setImproved(""); setSideEffects(""); setReport(null)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">AI-Powered</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("title", lang)}</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">{t("subtitle", lang)}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0 — Visit Type */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-semibold text-center mb-6">{t("whatVisit", lang)}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VISIT_TYPES.map(vt => (
                  <motion.button key={vt.id} whileTap={{ scale: 0.95 }}
                    onClick={() => { setVisitType(vt.id); setStep(1) }}
                    className={`rounded-2xl border p-5 text-left transition-all hover:border-primary/40 hover:shadow-md ${
                      visitType === vt.id ? "border-primary bg-primary/5 shadow-md" : "bg-white dark:bg-card"
                    }`}>
                    <span className="text-2xl block mb-2">{vt.emoji}</span>
                    <p className="text-sm font-semibold">{t(vt.key, lang)}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 1 — Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-card rounded-2xl border p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-semibold">{t(VISIT_TYPES.find(v => v.id === visitType)?.key || "", lang)}</h2>

              {(visitType === "new_symptoms" || visitType === "chronic" || visitType === "pregnancy") && (
                <>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">{t("describe", lang)}</label>
                    <textarea value={concern} onChange={e => setConcern(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      rows={3} placeholder={tx("doctorPrep.concernPlaceholder", lang)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">{t("howLong", lang)}</label>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map(d => (
                        <button key={d.id} onClick={() => setDuration(d.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            duration === d.id ? "bg-primary text-white" : "border bg-white dark:bg-card hover:border-primary/40"
                          }`}>{isTr ? d.tr : d.en}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">{t("severity", lang)} {severity}/10</label>
                    <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(Number(e.target.value))}
                      className="w-full accent-primary" />
                  </div>
                </>
              )}

              {visitType === "follow_up" && (
                <>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">{t("lastDiagnosis", lang)}</label>
                    <input value={lastDiagnosis} onChange={e => setLastDiagnosis(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder={tx("doctorPrep.lastDiagnosisPlaceholder", lang)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">{t("improved", lang)}</label>
                    <div className="flex gap-2">
                      {["better", "same", "worse"].map(s => (
                        <button key={s} onClick={() => setImproved(s)}
                          className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                            improved === s ? "bg-primary text-white" : "border bg-white dark:bg-card"
                          }`}>{t(s, lang)}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(visitType === "med_review" || visitType === "lab_review") && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">{t("sideEffects", lang)}</label>
                  <textarea value={sideEffects} onChange={e => setSideEffects(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    rows={3} placeholder={tx("doctorPrep.sideEffectsPlaceholder", lang)} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)}
                  className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted">
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("back", lang)}
                </button>
                <button onClick={generateReport} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 text-xs font-medium hover:bg-primary/90 disabled:opacity-60">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardList className="h-3.5 w-3.5" />}
                  {loading ? t("generating", lang) : t("generate", lang)}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Report */}
          {step === 2 && report && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Report Card */}
              <div className="bg-white dark:bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="bg-primary/5 border-b px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h2 className="text-base font-bold">{t("report", lang)}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p?.full_name || "Patient"} · {report.date} · {t(report.visitType, lang)}
                  </p>
                </div>
                <div className="p-6 space-y-5">
                  {/* Chief Complaint */}
                  <div>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t("chiefComplaint", lang)}</h3>
                    <p className="text-sm">{report.chiefComplaint}</p>
                  </div>
                  {/* Medications */}
                  <div>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t("currentMeds", lang)}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {report.medications.map((m, i) => (
                        <span key={i} className="rounded-full bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          💊 {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Allergies */}
                  <div>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t("knownAllergies", lang)}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {report.allergies.map((a, i) => (
                        <span key={i} className="rounded-full bg-red-50 dark:bg-red-950/20 px-2.5 py-1 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Questions */}
                  <div>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{t("questionsForDoc", lang)}</h3>
                    <div className="space-y-2">
                      {report.questionsForDoctor.map((q, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                          <p className="text-sm">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900 border-t px-6 py-3">
                  <p className="text-[10px] text-muted-foreground text-center">
                    {tx("doctorPrep.footerDisclaimer", lang)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={handleDownloadPDF} disabled={pdfLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white p-3 text-xs font-medium hover:bg-primary/90 disabled:opacity-60">
                  {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  {t("downloadPdf", lang)}
                </button>
                <button onClick={handleCopyReport}
                  className="flex items-center justify-center gap-2 rounded-xl border bg-white dark:bg-card p-3 text-xs font-medium hover:bg-muted">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "✅" : t("copyReport", lang)}
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 rounded-xl border bg-white dark:bg-card p-3 text-xs font-medium hover:bg-muted">
                  <Printer className="h-3.5 w-3.5" /> {t("printReport", lang)}
                </button>
                <button onClick={handleReset}
                  className="flex items-center justify-center gap-2 rounded-xl border bg-white dark:bg-card p-3 text-xs font-medium hover:bg-muted">
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("startNew", lang)}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
