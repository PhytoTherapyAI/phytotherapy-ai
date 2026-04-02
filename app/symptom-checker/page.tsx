// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope, Loader2, ArrowLeft, ArrowRight, Check, Leaf, AlertTriangle,
  Shield, FileText, MessageSquare, RefreshCw, Sparkles, BookOpen,
} from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { useAuth } from "@/lib/auth-context"
import type {
  ConversationStep, AssessmentResponse, PossibleCondition, PhytotherapySuggestion,
} from "@/lib/types/symptom-assessment"

// ── Translation helper ──
const T: Record<string, { en: string; tr: string }> = {
  title: { en: "Smart Symptom Assessment", tr: "Akıllı Semptom Değerlendirmesi" },
  subtitle: { en: "Answer a few quick questions. Our AI adapts to your answers — like talking to a real doctor.", tr: "Birkaç hızlı soruyu yanıtlayın. AI cevaplarınıza göre uyarlanır — gerçek bir doktorla konuşmak gibi." },
  badge1: { en: "🔬 Clinical AI", tr: "🔬 Klinik AI" },
  badge2: { en: "🔒 Private", tr: "🔒 Gizli" },
  badge3: { en: "⚡ 4-8 questions", tr: "⚡ 4-8 soru" },
  whatsWrong: { en: "What's bothering you most right now?", tr: "Şu an sizi en çok ne rahatsız ediyor?" },
  head: { en: "Head & Mind", tr: "Baş & Zihin" },
  headSub: { en: "Headache, dizziness, brain fog", tr: "Baş ağrısı, baş dönmesi, zihin bulanıklığı" },
  chest: { en: "Chest & Breathing", tr: "Göğüs & Nefes" },
  chestSub: { en: "Chest pain, cough, shortness of breath", tr: "Göğüs ağrısı, öksürük, nefes darlığı" },
  stomach: { en: "Stomach & Digestion", tr: "Mide & Sindirim" },
  stomachSub: { en: "Nausea, bloating, pain", tr: "Mide bulantısı, şişkinlik, ağrı" },
  muscle: { en: "Muscles & Joints", tr: "Kaslar & Eklemler" },
  muscleSub: { en: "Back pain, joint stiffness, cramps", tr: "Sırt ağrısı, eklem sertliği, kramplar" },
  general: { en: "General / Whole Body", tr: "Genel / Tüm Vücut" },
  generalSub: { en: "Fever, fatigue, weakness", tr: "Ateş, yorgunluk, halsizlik" },
  mental: { en: "Mental & Emotional", tr: "Zihinsel & Duygusal" },
  mentalSub: { en: "Anxiety, insomnia, mood changes", tr: "Anksiyete, uykusuzluk, ruh hali değişimleri" },
  continue: { en: "Continue", tr: "Devam" },
  back: { en: "Back", tr: "Geri" },
  questionOf: { en: "Question {n} of ~8", tr: "Soru {n} / ~8" },
  aiThinking: { en: "AI is thinking...", tr: "AI düşünüyor..." },
  aiNarrowing: { en: "AI is narrowing down...", tr: "AI olasılıkları daraltıyor..." },
  forMyself: { en: "For Myself", tr: "Kendim İçin" },
  forChild: { en: "For My Child", tr: "Çocuğum İçin" },
  forOther: { en: "For Someone Else", tr: "Başkası İçin" },
  emergency: { en: "🚨 CALL 112/911 IMMEDIATELY", tr: "🚨 HEMEN 112'Yİ ARAYIN" },
  seeToday: { en: "⚠️ See a doctor today", tr: "⚠️ Bugün doktora gidin" },
  seeSoon: { en: "📋 Schedule a doctor visit", tr: "📋 Doktor randevusu alın" },
  monitor: { en: "👀 Monitor symptoms, self-care may be enough", tr: "👀 Semptomları takip edin, öz bakım yeterli olabilir" },
  selfCare: { en: "✅ Self-care is appropriate", tr: "✅ Öz bakım yeterli" },
  phytoTitle: { en: "🌿 Phytotherapy Suggestions", tr: "🌿 Fitoterapi Önerileri" },
  evidence: { en: "Evidence", tr: "Kanıt" },
  download: { en: "Download Report", tr: "Raporu İndir" },
  discuss: { en: "Discuss with AI Assistant", tr: "AI Asistanla Tartış" },
  newAssessment: { en: "Start New Assessment", tr: "Yeni Değerlendirme Başlat" },
  checkInteractions: { en: "Check Drug Interactions", tr: "İlaç Etkileşimlerini Kontrol Et" },
  medAlert: { en: "Medication Note", tr: "İlaç Notu" },
  retryMsg: { en: "Our AI is temporarily busy. Let's try again.", tr: "AI geçici olarak meşgul. Tekrar deneyelim." },
  retry: { en: "Retry", tr: "Tekrar Dene" },
  topConditions: { en: "Possible Conditions", tr: "Olası Durumlar" },
  confidence: { en: "Confidence", tr: "Güven" },
}

function t(key: string, lang: string): string {
  const entry = T[key]
  return entry ? (lang === "tr" ? entry.tr : entry.en) : key
}

const CATEGORIES = [
  { id: "head", emoji: "🧠", labelKey: "head", subKey: "headSub" },
  { id: "chest", emoji: "🫁", labelKey: "chest", subKey: "chestSub" },
  { id: "stomach", emoji: "🍕", labelKey: "stomach", subKey: "stomachSub" },
  { id: "muscle", emoji: "🦴", labelKey: "muscle", subKey: "muscleSub" },
  { id: "general", emoji: "🌡️", labelKey: "general", subKey: "generalSub" },
  { id: "mental", emoji: "🧘", labelKey: "mental", subKey: "mentalSub" },
]

const fadeSlide = {
  initial: { x: 80, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
  transition: { type: "spring" as const, stiffness: 300, damping: 30 },
}

const stagger = { show: { transition: { staggerChildren: 0.12 } }, hidden: {} }
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function SymptomCheckerPage() {
  const { lang } = useLang()
  const { user, profile } = useAuth()

  const [step, setStep] = useState(0) // 0 = intro
  const [history, setHistory] = useState<ConversationStep[]>([])
  const [currentResponse, setCurrentResponse] = useState<AssessmentResponse | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assessmentFor, setAssessmentFor] = useState<"self" | "child" | "other">("self")
  const [childAge, setChildAge] = useState<string>("")
  const [otherAge, setOtherAge] = useState(30)
  const [otherGender, setOtherGender] = useState("unknown")
  const [initialCategory, setInitialCategory] = useState("")
  const retryCountRef = useRef(0)

  // Build user profile from auth
  const p = profile as any
  const userProfile = p ? {
    age: p.age || undefined,
    gender: p.gender || undefined,
    medications: [],
    allergies: [],
    conditions: p.chronic_conditions ? [p.chronic_conditions] : [],
    kidneyStatus: p.kidney_status || undefined,
    liverStatus: p.liver_status || undefined,
    pregnancyStatus: p.pregnancy_status || undefined,
  } : undefined

  const callAPI = useCallback(async (stepNum: number, hist: ConversationStep[], category?: string) => {
    setLoading(true)
    setError(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch("/api/symptom-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          step: stepNum,
          history: hist,
          userProfile,
          assessmentFor,
          childAge: assessmentFor === "child" ? childAge : undefined,
          otherAge: assessmentFor === "other" ? otherAge : undefined,
          otherGender: assessmentFor === "other" ? otherGender : undefined,
          lang,
          initialCategory: category || initialCategory,
        }),
      })
      clearTimeout(timeout)

      if (!res.ok) throw new Error(`API ${res.status}`)
      const data: AssessmentResponse = await res.json()
      setCurrentResponse(data)
      retryCountRef.current = 0
    } catch (err: any) {
      if (retryCountRef.current < 2) {
        retryCountRef.current++
        return callAPI(stepNum, hist, category)
      }
      setError(t("retryMsg", lang))
    } finally {
      setLoading(false)
    }
  }, [userProfile, assessmentFor, childAge, otherAge, otherGender, lang, initialCategory])

  const handleCategorySelect = (catId: string) => {
    setInitialCategory(catId)
    setStep(1)
    callAPI(1, [], catId)
  }

  const handleContinue = () => {
    if (!selectedOption || !currentResponse) return
    const opt = currentResponse.nextQuestion.options.find(o => o.id === selectedOption)
    if (!opt) return

    const newStep: ConversationStep = {
      questionId: `q${step}`,
      questionText: currentResponse.nextQuestion.text,
      selectedOptionId: opt.id,
      selectedOptionLabel: opt.label,
      timestamp: Date.now(),
    }
    const newHistory = [...history, newStep]
    setHistory(newHistory)
    setSelectedOption(null)
    setStep(s => s + 1)
    callAPI(step + 1, newHistory)
  }

  const handleBack = () => {
    if (step <= 1) { setStep(0); setCurrentResponse(null); return }
    const prevHistory = history.slice(0, -1)
    setHistory(prevHistory)
    setStep(s => s - 1)
    setSelectedOption(null)
    // Restore previous response — re-call API
    callAPI(step - 1, prevHistory)
  }

  const handleReset = () => {
    setStep(0); setHistory([]); setCurrentResponse(null); setSelectedOption(null)
    setError(null); setInitialCategory("")
    retryCountRef.current = 0
  }

  const isComplete = currentResponse?.isComplete ?? false

  // ─── INTRO SCREEN (step === 0) ───
  if (step === 0) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">AI-Powered</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t("title", lang)}</h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-4">{t("subtitle", lang)}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["badge1", "badge2", "badge3"].map(k => (
                <span key={k} className="rounded-full bg-white dark:bg-card border px-3 py-1 text-[10px] font-medium text-muted-foreground shadow-sm">
                  {t(k, lang)}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Assess For Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="flex justify-center gap-2 mb-8">
            {(["self", "child", "other"] as const).map(mode => (
              <button key={mode} onClick={() => setAssessmentFor(mode)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  assessmentFor === mode
                    ? "bg-primary text-white shadow-md"
                    : "bg-white dark:bg-card border text-muted-foreground hover:border-primary/40"
                }`}>
                {t(mode === "self" ? "forMyself" : mode === "child" ? "forChild" : "forOther", lang)}
              </button>
            ))}
          </motion.div>

          {/* Child age picker */}
          {assessmentFor === "child" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex justify-center gap-2 mb-6">
              {["🍼 0-2", "🧒 3-7", "🎒 8-12", "🧑 13-17"].map(opt => {
                const val = opt.split(" ")[1]
                return (
                  <button key={opt} onClick={() => setChildAge(val)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${childAge === val ? "bg-primary text-white" : "bg-white dark:bg-card border hover:border-primary/40"}`}>
                    {opt}
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* Other age/gender */}
          {assessmentFor === "other" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex justify-center gap-4 mb-6 items-center">
              <label className="text-xs text-muted-foreground">
                {lang === "tr" ? "Yaş:" : "Age:"}
                <input type="number" value={otherAge} onChange={e => setOtherAge(Number(e.target.value))}
                  className="ml-2 w-16 rounded-lg border px-2 py-1 text-sm" min={0} max={120} />
              </label>
              <div className="flex gap-1">
                {["male", "female"].map(g => (
                  <button key={g} onClick={() => setOtherGender(g)}
                    className={`rounded-lg px-3 py-1 text-xs ${otherGender === g ? "bg-primary text-white" : "bg-white dark:bg-card border"}`}>
                    {g === "male" ? "♂️" : "♀️"} {g === "male" ? (lang === "tr" ? "Erkek" : "Male") : (lang === "tr" ? "Kadın" : "Female")}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Bento Grid */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="text-center mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t("whatsWrong", lang)}</h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => (
              <motion.button key={cat.id} variants={fadeUp}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCategorySelect(cat.id)}
                className="bg-white dark:bg-card rounded-2xl border border-stone-200/60 dark:border-stone-800 p-5 text-left shadow-sm transition-all hover:border-primary/40">
                <span className="text-3xl mb-2 block">{cat.emoji}</span>
                <p className="text-sm font-semibold text-foreground">{t(cat.labelKey, lang)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t(cat.subKey, lang)}</p>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  // ─── RESULT SCREEN (isComplete) ───
  if (isComplete && currentResponse) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">

            {/* Urgency Banner */}
            <motion.div variants={fadeUp} className={`rounded-2xl p-5 text-center font-bold ${
              currentResponse.urgency === "emergency" ? "bg-red-600 text-white text-lg" :
              currentResponse.urgency === "see_doctor_today" ? "bg-amber-500 text-white" :
              currentResponse.urgency === "see_doctor_soon" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200" :
              currentResponse.urgency === "monitor" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" :
              "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200"
            }`}>
              {t(currentResponse.urgency === "emergency" ? "emergency" :
                currentResponse.urgency === "see_doctor_today" ? "seeToday" :
                currentResponse.urgency === "see_doctor_soon" ? "seeSoon" :
                currentResponse.urgency === "monitor" ? "monitor" : "selfCare", lang)}
              {currentResponse.urgency === "emergency" && (
                <a href="tel:112" className="block mt-2 underline text-white/90">📞 112</a>
              )}
            </motion.div>

            {/* Top Conditions */}
            {currentResponse.possibleConditions.length > 0 && (
              <motion.div variants={fadeUp} className="bg-white dark:bg-card rounded-2xl border p-5 shadow-sm">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> {t("topConditions", lang)}
                </h3>
                <div className="space-y-3">
                  {currentResponse.possibleConditions.slice(0, 5).map((c, i) => (
                    <div key={c.name} className={`rounded-xl p-3 ${i === 0 ? "border-2 border-primary/30 bg-primary/5" : "border"}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold">{c.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.severity === "low" ? "bg-emerald-100 text-emerald-700" :
                          c.severity === "medium" ? "bg-amber-100 text-amber-700" :
                          c.severity === "high" ? "bg-red-100 text-red-700" :
                          "bg-red-600 text-white"
                        }`}>{c.severity}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.confidence}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full bg-primary" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{c.confidence}% {t("confidence", lang)}</span>
                      {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Medication Alerts */}
            {currentResponse.medicationAlerts && currentResponse.medicationAlerts.length > 0 && (
              <motion.div variants={fadeUp} className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 p-4">
                <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> {t("medAlert", lang)}
                </h3>
                {currentResponse.medicationAlerts.map((a, i) => (
                  <p key={i} className="text-xs text-amber-800 dark:text-amber-200">{a}</p>
                ))}
              </motion.div>
            )}

            {/* Phytotherapy Suggestions */}
            {currentResponse.phytotherapySuggestions && currentResponse.phytotherapySuggestions.length > 0 && (
              <motion.div variants={fadeUp} className="bg-white dark:bg-card rounded-2xl border p-5 shadow-sm">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-600" /> {t("phytoTitle", lang)}
                </h3>
                <div className="space-y-2.5">
                  {currentResponse.phytotherapySuggestions.map((s) => (
                    <div key={s.name} className="rounded-xl border p-3 bg-emerald-50/50 dark:bg-emerald-950/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{s.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          s.evidence === "A" ? "bg-emerald-200 text-emerald-800" :
                          s.evidence === "B" ? "bg-amber-200 text-amber-800" :
                          "bg-stone-200 text-stone-700"
                        }`}>{t("evidence", lang)}: {s.evidence}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                      {s.caution && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">⚠️ {s.caution}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Final Summary */}
            {currentResponse.finalSummary && (
              <motion.div variants={fadeUp} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl border-l-2 border-l-primary/30 border bg-card p-4 shadow-sm flex-1">
                  <p className="text-sm">{currentResponse.finalSummary}</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-xl border bg-white dark:bg-card p-3 text-xs font-medium hover:bg-muted transition-colors">
                <FileText className="h-3.5 w-3.5" /> {t("download", lang)}
              </button>
              <a href="/health-assistant"
                className="flex items-center justify-center gap-2 rounded-xl border bg-white dark:bg-card p-3 text-xs font-medium hover:bg-muted transition-colors">
                <MessageSquare className="h-3.5 w-3.5" /> {t("discuss", lang)}
              </a>
              <button onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white p-3 text-xs font-medium hover:bg-primary/90 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> {t("newAssessment", lang)}
              </button>
              <a href="/interaction-checker"
                className="flex items-center justify-center gap-2 rounded-xl border bg-white dark:bg-card p-3 text-xs font-medium hover:bg-muted transition-colors">
                <Shield className="h-3.5 w-3.5" /> {t("checkInteractions", lang)}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ─── QUESTION FLOW (step >= 1) ───
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">

        {/* Progress bar + step counter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={handleBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> {t("back", lang)}
            </button>
            <span className="text-xs text-muted-foreground">
              {t("questionOf", lang).replace("{n}", String(step))}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full rounded-full bg-primary"
              animate={{ width: `${currentResponse?.progress ?? step * 12}%` }}
              transition={{ type: "spring", stiffness: 100 }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main question area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white dark:bg-card rounded-3xl shadow-lg p-8 max-w-xl mx-auto">
                  <div className="space-y-4">
                    <div className="h-6 w-3/4 rounded-lg bg-muted animate-pulse" />
                    <div className="h-4 w-1/2 rounded-lg bg-muted animate-pulse" />
                    <div className="flex items-center gap-2 mt-6 justify-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t("aiThinking", lang)}</span>
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white dark:bg-card rounded-3xl shadow-lg p-8 max-w-xl mx-auto text-center">
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <button onClick={() => callAPI(step, history)}
                    className="rounded-xl bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary/90">
                    {t("retry", lang)}
                  </button>
                </motion.div>
              ) : currentResponse ? (
                <motion.div key={`q-${step}`} {...fadeSlide}
                  className="bg-white dark:bg-card rounded-3xl shadow-lg p-6 md:p-8 max-w-xl mx-auto">
                  <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                    {currentResponse.nextQuestion.text}
                  </h2>
                  {currentResponse.nextQuestion.subtext && (
                    <p className="text-sm text-muted-foreground mb-5">{currentResponse.nextQuestion.subtext}</p>
                  )}

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentResponse.nextQuestion.options.map(opt => (
                      <motion.button key={opt.id}
                        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedOption(opt.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          selectedOption === opt.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-stone-200 dark:border-stone-700 hover:border-primary/40 hover:bg-stone-50 dark:hover:bg-stone-800"
                        }`}>
                        {opt.emoji && <span className="text-xl flex-shrink-0">{opt.emoji}</span>}
                        <span className="text-sm font-medium flex-1">{opt.label}</span>
                        {selectedOption === opt.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Continue button */}
                  <motion.button onClick={handleContinue}
                    disabled={!selectedOption}
                    className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                      selectedOption
                        ? "bg-primary text-white hover:bg-primary/90 shadow-md"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                    whileTap={selectedOption ? { scale: 0.97 } : {}}>
                    {t("continue", lang)} <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Side panel — conditions (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white dark:bg-card rounded-2xl border p-4 shadow-sm">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" /> {t("aiNarrowing", lang)}
              </h3>
              <AnimatePresence>
                {currentResponse?.possibleConditions?.map(c => (
                  <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} layout className="mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">{c.confidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div animate={{ width: `${c.confidence}%` }}
                        className={`h-full rounded-full ${
                          c.severity === "low" ? "bg-emerald-500" :
                          c.severity === "medium" ? "bg-amber-500" : "bg-red-500"
                        }`} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Medication alerts */}
              {currentResponse?.medicationAlerts?.map((a, i) => (
                <div key={i} className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-2.5 border border-amber-200/60">
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">💊 {a}</p>
                </div>
              ))}

              {(!currentResponse?.possibleConditions || currentResponse.possibleConditions.length === 0) && (
                <p className="text-xs text-muted-foreground/70 text-center py-4">
                  {lang === "tr" ? "Cevaplarınızı analiz ediyoruz..." : "Analyzing your answers..."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
