// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FlaskConical, Plus, ArrowRight, Check, BarChart3, RefreshCw, FileText } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { InfoTooltip } from "@/components/ui/InfoTooltip"

const T: Record<string, { en: string; tr: string }> = {
  title: { en: "Personal Health Experiments", tr: "Kişisel Sağlık Deneyleri" },
  subtitle: { en: "Be your own scientist. Test what works for YOUR body with controlled before/after comparisons.", tr: "Kendi bilim insanınız olun. Kontrollü önce/sonra karşılaştırmalarıyla vücudunuz için ne işe yarıyor test edin." },
  startNew: { en: "Start New Experiment", tr: "Yeni Deney Başlat" },
  whatTest: { en: "What do you want to test?", tr: "Ne test etmek istiyorsunuz?" },
  describe: { en: "Describe your experiment", tr: "Deneyinizi tanımlayın" },
  measure: { en: "What will you measure?", tr: "Ne ölçeceksiniz?" },
  howLong: { en: "How long?", tr: "Ne kadar süre?" },
  recommended: { en: "Recommended", tr: "Önerilen" },
  startExp: { en: "Start Experiment", tr: "Deney Başlat" },
  active: { en: "ACTIVE EXPERIMENT", tr: "AKTİF DENEY" },
  complete: { en: "Complete", tr: "Tamamlandı" },
  inProgress: { en: "In Progress", tr: "Devam Ediyor" },
  results: { en: "EXPERIMENT RESULTS", tr: "DENEY SONUÇLARI" },
  phase1: { en: "WITHOUT", tr: "OLMADAN" },
  phase2: { en: "WITH", tr: "İLE" },
  aiVerdict: { en: "AI Verdict", tr: "AI Değerlendirmesi" },
  prelim: { en: "Preliminary Results", tr: "Ön Sonuçlar" },
  improvement: { en: "improvement so far", tr: "şu ana kadarki iyileşme" },
  runAgain: { en: "Run Again", tr: "Tekrar Çalıştır" },
  share: { en: "Share with Doctor", tr: "Doktorla Paylaş" },
  past: { en: "Past Experiments", tr: "Geçmiş Deneyler" },
}
function t(k: string, l: string) { return T[k] ? (l === "tr" ? T[k].tr : T[k].en) : k }

const CATEGORIES = [
  { id: "supplement", emoji: "🌿", en: "Supplement", tr: "Takviye" },
  { id: "exercise", emoji: "🏃", en: "Exercise", tr: "Egzersiz" },
  { id: "diet", emoji: "🍎", en: "Diet Change", tr: "Diyet Değişikliği" },
  { id: "sleep", emoji: "😴", en: "Sleep Habit", tr: "Uyku Alışkanlığı" },
  { id: "stress", emoji: "🧘", en: "Stress Management", tr: "Stres Yönetimi" },
]

const METRICS = [
  { id: "sleep", en: "Sleep Quality", tr: "Uyku Kalitesi" },
  { id: "energy", en: "Energy", tr: "Enerji" },
  { id: "mood", en: "Mood", tr: "Ruh Hali" },
  { id: "pain", en: "Pain Level", tr: "Ağrı Seviyesi" },
  { id: "focus", en: "Focus", tr: "Odaklanma" },
  { id: "anxiety", en: "Anxiety", tr: "Kaygı" },
]

const DURATIONS = [
  { id: "1w", en: "1 Week", tr: "1 Hafta" },
  { id: "2w", en: "2 Weeks", tr: "2 Hafta", recommended: true },
  { id: "4w", en: "4 Weeks", tr: "4 Hafta" },
]

// Mock active experiment
const MOCK_ACTIVE = {
  question: "Does Ashwagandha improve my sleep?",
  protocol: "300mg KSM-66 Ashwagandha before bed",
  phase1Done: true,
  phase2Day: 8,
  totalDays: 28,
  phaseDays: 14,
  preliminary: { sleep: { before: 3.2, after: 4.1, change: 28 }, energy: { before: 2.8, after: 3.5, change: 25 }, mood: { before: 3.4, after: 3.9, change: 15 } },
}

const MOCK_PAST = {
  question: "Does cold shower improve my energy?",
  verdict: "Cold showers showed a meaningful 22% improvement in morning energy levels. The effect was consistent across 12 of 14 days in Phase 2.",
  results: { energy: { before: 2.9, after: 3.5, change: 22 }, mood: { before: 3.1, after: 3.6, change: 16 } },
}

export default function ExperimentsPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [showWizard, setShowWizard] = useState(false)
  const [wizStep, setWizStep] = useState(0)
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [metrics, setMetrics] = useState<string[]>([])
  const [duration, setDuration] = useState("2w")

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
            <FlaskConical className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">N=1</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">🧪 {t("title", lang)}</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">{t("subtitle", lang)}</p>
        </div>

        {/* Active Experiment */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl border-2 border-primary/30 bg-white dark:bg-card p-5 shadow-md mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">{t("active", lang)}</span>
            <span className="text-[10px] text-muted-foreground">🔄 {t("inProgress", lang)}</span>
          </div>
          <h3 className="text-base font-bold mb-3">&ldquo;{MOCK_ACTIVE.question}&rdquo;</h3>
          <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
            <p>Phase 1 (✅ {t("complete", lang)}): {MOCK_ACTIVE.phaseDays} days {t(isTr ? "phase1" : "phase1", lang)}</p>
            <p>Phase 2 (🔄 Day {MOCK_ACTIVE.phase2Day}/{MOCK_ACTIVE.phaseDays}): {MOCK_ACTIVE.phaseDays} days WITH {MOCK_ACTIVE.protocol}</p>
          </div>
          {/* Progress */}
          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${((MOCK_ACTIVE.phaseDays + MOCK_ACTIVE.phase2Day) / MOCK_ACTIVE.totalDays) * 100}%` }}
              transition={{ duration: 1 }} className="h-full rounded-full bg-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground mb-4">Day {MOCK_ACTIVE.phaseDays + MOCK_ACTIVE.phase2Day}/{MOCK_ACTIVE.totalDays}</p>
          {/* Preliminary Results */}
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3">
            <p className="text-xs font-bold mb-2">📊 {t("prelim", lang)}:</p>
            {Object.entries(MOCK_ACTIVE.preliminary).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-xs mb-1">
                <span className="capitalize">{key}</span>
                <span>Phase 1: {val.before} → Phase 2: {val.after} <span className="text-emerald-600 font-bold">↑{val.change}%</span></span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Start New */}
        <button onClick={() => { setShowWizard(true); setWizStep(0) }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-sm font-medium text-primary hover:bg-primary/10 transition-colors mb-6">
          <Plus className="h-4 w-4" /> {t("startNew", lang)}
        </button>

        {/* Wizard Modal */}
        <AnimatePresence>
          {showWizard && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowWizard(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white dark:bg-card border shadow-2xl p-6 space-y-4">
                {/* Step indicators */}
                <div className="flex gap-1 justify-center">
                  {[0, 1, 2, 3].map(s => (
                    <div key={s} className={`h-1.5 w-8 rounded-full ${wizStep >= s ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>

                {wizStep === 0 && (
                  <>
                    <h3 className="text-base font-bold text-center">{t("whatTest", lang)}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(c => (
                        <button key={c.id} onClick={() => { setCategory(c.id); setWizStep(1) }}
                          className={`rounded-xl border p-3 text-left hover:border-primary/40 transition-all ${category === c.id ? "border-primary bg-primary/5" : ""}`}>
                          <span className="text-xl block mb-1">{c.emoji}</span>
                          <span className="text-xs font-semibold">{isTr ? c.tr : c.en}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {wizStep === 1 && (
                  <>
                    <h3 className="text-base font-bold text-center">{t("describe", lang)}</h3>
                    <input value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder={isTr ? "örn. Yatmadan önce Ashwagandha 300mg" : "e.g., Taking Ashwagandha 300mg before bed"} />
                    <button onClick={() => setWizStep(2)} disabled={!description.trim()}
                      className="w-full rounded-xl bg-primary text-white py-2.5 text-sm font-medium disabled:opacity-40">
                      {t("measure", lang)} <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
                    </button>
                  </>
                )}

                {wizStep === 2 && (
                  <>
                    <h3 className="text-base font-bold text-center">{t("measure", lang)}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {METRICS.map(m => (
                        <button key={m.id} onClick={() => setMetrics(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                          className={`rounded-xl border p-2.5 text-xs font-medium transition-all ${metrics.includes(m.id) ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"}`}>
                          {metrics.includes(m.id) && <Check className="h-3 w-3 inline mr-1" />}
                          {isTr ? m.tr : m.en}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setWizStep(3)} disabled={metrics.length === 0}
                      className="w-full rounded-xl bg-primary text-white py-2.5 text-sm font-medium disabled:opacity-40">
                      {t("howLong", lang)} <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
                    </button>
                  </>
                )}

                {wizStep === 3 && (
                  <>
                    <h3 className="text-base font-bold text-center">{t("howLong", lang)}</h3>
                    <div className="flex gap-2 justify-center">
                      {DURATIONS.map(d => (
                        <button key={d.id} onClick={() => setDuration(d.id)}
                          className={`rounded-xl border px-4 py-3 text-xs font-medium transition-all ${duration === d.id ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                          {isTr ? d.tr : d.en}
                          {d.recommended && <span className="block text-[9px] text-primary mt-0.5">({t("recommended", lang)})</span>}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowWizard(false)}
                      className="w-full rounded-xl bg-primary text-white py-3 text-sm font-semibold">
                      🚀 {t("startExp", lang)}
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past Experiment Result */}
        <div className="rounded-2xl border bg-white dark:bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">🏆 {t("results", lang)}</span>
          </div>
          <h3 className="text-base font-bold mb-3">&ldquo;{MOCK_PAST.question}&rdquo;</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(MOCK_PAST.results).map(([key, val]) => (
              <div key={key} className="rounded-xl border p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 capitalize">{key}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">{val.before}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-bold text-emerald-600">{val.after}</span>
                  <span className="text-[10px] font-bold text-emerald-500">↑{val.change}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
            <p className="text-[11px] font-medium text-primary">🧠 {t("aiVerdict", lang)}: {MOCK_PAST.verdict}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium hover:bg-muted">
              <FileText className="h-3.5 w-3.5" /> {t("share", lang)}
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" /> {t("runAgain", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
