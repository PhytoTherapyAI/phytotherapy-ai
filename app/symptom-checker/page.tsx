// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope, Loader2, ArrowLeft, ArrowRight, Check, Leaf, AlertTriangle,
  Shield, FileText, MessageSquare, RefreshCw, Sparkles, BookOpen, SendHorizontal,
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
  emergency: { en: "🚨 CALL 112/911 NOW", tr: "🚨 HEMEN 112'Yİ ARAYIN" },
  erVisit: { en: "🏥 Go to Emergency Room", tr: "🏥 Acil Servise Gidin" },
  urgentCare: { en: "⚠️ Visit Urgent Care Today", tr: "⚠️ Bugün Acil Bakıma Gidin" },
  gpToday: { en: "🩺 See Your Doctor Today", tr: "🩺 Bugün Doktorunuza Gidin" },
  gpAppointment: { en: "📋 Schedule a Doctor Appointment", tr: "📋 Doktor Randevusu Alın" },
  telehealth: { en: "💻 Telehealth Consultation Recommended", tr: "💻 Online Doktor Görüşmesi Önerilir" },
  pharmacy: { en: "💊 Pharmacy Visit Sufficient", tr: "💊 Eczane Ziyareti Yeterli" },
  selfCare: { en: "✅ Self-Care at Home", tr: "✅ Evde Öz Bakım Yeterli" },
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
  orDescribe: { en: "Or describe in your own words:", tr: "Ya da kendi cümlelerinizle anlatın:" },
  freeTextPlaceholder: { en: "e.g., I've had a headache for 3 days and feel nauseous...", tr: "örn., 3 gündür başım ağrıyor ve midem bulanıyor..." },
  aiParsing: { en: "AI is analyzing your description...", tr: "AI açıklamanızı analiz ediyor..." },
  freeTextExample1: { en: "My child has had a fever since yesterday", tr: "Çocuğumun dünden beri ateşi var" },
  freeTextExample2: { en: "Sharp pain in my lower back after exercise", tr: "Egzersiz sonrası belimde keskin ağrı" },
  freeTextExample3: { en: "Feeling anxious and can't sleep for a week", tr: "Bir haftadır kaygılıyım ve uyuyamıyorum" },
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

// ── Care Navigation Options by Urgency ──
interface CareOption { icon: string; label: string; action: string | null; primary?: boolean }
function getCareOptions(urgency: string, lang: string): CareOption[] {
  const tr = lang === "tr"
  const opts: Record<string, CareOption[]> = {
    emergency:      [{ icon: "📞", label: tr ? "Hemen 112'yi Arayın" : "Call 112 NOW", action: "tel:112", primary: true }],
    er_visit:       [
      { icon: "🏥", label: tr ? "En Yakın Acil Servis" : "Find Nearest ER", action: "https://maps.google.com/?q=emergency+room+near+me", primary: true },
      { icon: "📞", label: tr ? "112'yi Ara" : "Call 112", action: "tel:112" },
    ],
    urgent_care:    [
      { icon: "🏥", label: tr ? "Acil Bakım Bulun" : "Find Urgent Care", action: "https://maps.google.com/?q=urgent+care+near+me", primary: true },
      { icon: "💻", label: tr ? "Online Görüşme" : "Try Telehealth", action: "/health-assistant" },
    ],
    gp_today:       [
      { icon: "🩺", label: tr ? "Doktor Bulun" : "Find a Doctor", action: "https://maps.google.com/?q=doctor+near+me", primary: true },
      { icon: "💻", label: tr ? "Online Görüşme" : "Try Telehealth", action: "/health-assistant" },
    ],
    see_doctor_today: [
      { icon: "🩺", label: tr ? "Doktor Bulun" : "Find a Doctor", action: "https://maps.google.com/?q=doctor+near+me", primary: true },
    ],
    gp_appointment: [
      { icon: "🩺", label: tr ? "Yakınızdaki Doktor" : "Find a GP Near You", action: "https://maps.google.com/?q=family+doctor+near+me", primary: true },
      { icon: "💻", label: tr ? "Online Görüşme" : "Telehealth", action: "/health-assistant" },
    ],
    see_doctor_soon: [
      { icon: "🩺", label: tr ? "Doktor Bulun" : "Find a Doctor", action: "https://maps.google.com/?q=doctor+near+me", primary: true },
    ],
    telehealth:     [
      { icon: "💻", label: tr ? "Online Görüşme Başlat" : "Start Telehealth Now", action: "/health-assistant", primary: true },
      { icon: "🩺", label: tr ? "Doktor Bul" : "Or Find a Doctor", action: "https://maps.google.com/?q=doctor+near+me" },
    ],
    monitor:        [
      { icon: "💻", label: tr ? "AI Asistanla Konuş" : "Chat with AI", action: "/health-assistant", primary: true },
    ],
    pharmacy:       [
      { icon: "💊", label: tr ? "Eczane Bulun" : "Find a Pharmacy", action: "https://maps.google.com/?q=pharmacy+near+me", primary: true },
      { icon: "💻", label: tr ? "OTC Seçenekleri Sor" : "Ask AI About OTC Options", action: "/health-assistant" },
    ],
    self_care:      [
      { icon: "🌿", label: tr ? "Fitoterapi Keşfet" : "Explore Phytotherapy", action: "/supplement-guide", primary: true },
      { icon: "💻", label: tr ? "AI Asistanla Konuş" : "Chat with AI", action: "/health-assistant" },
    ],
  }
  return opts[urgency] || opts.self_care
}

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
  const searchParams = useSearchParams()

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
  const [freeText, setFreeText] = useState("")
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfDone, setPdfDone] = useState(false)
  const [copyDone, setCopyDone] = useState(false)
  const retryCountRef = useRef(0)
  const freeTextHandled = useRef(false)

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

  const callAPI = useCallback(async (stepNum: number, hist: ConversationStep[], category?: string, freeTextInput?: string) => {
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
          ...(freeTextInput ? { freeText: freeTextInput } : {}),
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

  // Handle free-text submission
  const handleFreeTextSubmit = useCallback(() => {
    if (!freeText.trim()) return
    setStep(1)
    callAPI(1, [], undefined, freeText.trim())
  }, [freeText, callAPI])

  // Auto-start from Omni-bar ?text= parameter
  useEffect(() => {
    if (freeTextHandled.current) return
    const textParam = searchParams.get("text")
    if (textParam) {
      freeTextHandled.current = true
      setFreeText(textParam)
      setStep(1)
      callAPI(1, [], undefined, textParam)
    }
  }, [searchParams, callAPI])

  // PDF download handler
  const handleDownloadPDF = useCallback(async () => {
    if (!currentResponse) return
    setPdfLoading(true)
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const { SymptomAssessmentPDF } = await import("@/components/pdf/SymptomAssessmentPDF")
      const blob = await pdf(
        SymptomAssessmentPDF({
          history,
          conditions: currentResponse.possibleConditions || [],
          urgency: currentResponse.urgency,
          phytoSuggestions: currentResponse.phytotherapySuggestions,
          medicationAlerts: currentResponse.medicationAlerts,
          finalSummary: currentResponse.finalSummary,
          assessmentFor,
          userName: profile?.full_name || undefined,
          userAge: profile?.age || undefined,
          userGender: profile?.gender || undefined,
          lang,
        })
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `DoctoPal-Assessment-${new Date().toISOString().split("T")[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setPdfDone(true)
      setTimeout(() => setPdfDone(false), 2000)
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      setPdfLoading(false)
    }
  }, [currentResponse, history, assessmentFor, profile, lang])

  // Copy summary to clipboard
  const handleCopySummary = useCallback(() => {
    if (!currentResponse) return
    const lines: string[] = []
    lines.push("=== DoctoPal Symptom Assessment ===")
    lines.push(`Date: ${new Date().toLocaleDateString()}`)
    lines.push("")
    if (currentResponse.finalSummary) lines.push(currentResponse.finalSummary)
    lines.push("")
    lines.push("Possible Conditions:")
    currentResponse.possibleConditions?.slice(0, 5).forEach(c => {
      lines.push(`  - ${c.name} (${c.confidence}%, ${c.severity})`)
    })
    if (currentResponse.medicationAlerts?.length) {
      lines.push("\nMedication Alerts:")
      currentResponse.medicationAlerts.forEach(a => lines.push(`  ⚠️ ${a}`))
    }
    if (currentResponse.phytotherapySuggestions?.length) {
      lines.push("\nPhytotherapy Suggestions:")
      currentResponse.phytotherapySuggestions.forEach(s => {
        lines.push(`  🌿 ${s.name} (Evidence: ${s.evidence}) — ${s.description}`)
      })
    }
    lines.push("\n--- Generated by DoctoPal (doctopal.com) ---")
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    })
  }, [currentResponse])

  const handleReset = () => {
    setStep(0); setHistory([]); setCurrentResponse(null); setSelectedOption(null)
    setError(null); setInitialCategory(""); setFreeText("")
    setPdfLoading(false); setPdfDone(false); setCopyDone(false)
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

          {/* ── Free Text Input ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mb-8">
            <p className="text-center text-sm font-medium text-foreground mb-3">{t("orDescribe", lang)}</p>
            <div className="relative max-w-xl mx-auto">
              <textarea
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFreeTextSubmit() } }}
                placeholder={t("freeTextPlaceholder", lang)}
                rows={2}
                className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-card pl-4 pr-14 py-3.5 text-sm shadow-lg outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <button
                onClick={handleFreeTextSubmit}
                disabled={!freeText.trim()}
                className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
            {/* Example prompts */}
            <div className="flex flex-wrap justify-center gap-2 mt-3 max-w-xl mx-auto">
              {["freeTextExample1", "freeTextExample2", "freeTextExample3"].map(k => (
                <button key={k} onClick={() => setFreeText(t(k, lang))}
                  className="rounded-full border bg-white dark:bg-card px-3 py-1 text-[10px] text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                  {t(k, lang)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-6 max-w-xl mx-auto">
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
            <span className="text-xs text-muted-foreground font-medium">{lang === "tr" ? "ya da bölge seçin" : "or select a body region"}</span>
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
          </div>

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
            {/* 8-Level Urgency Banner */}
            <motion.div variants={fadeUp} className={`rounded-2xl p-5 text-center font-bold ${
              currentResponse.urgency === "emergency" ? "bg-red-600 text-white text-lg" :
              currentResponse.urgency === "er_visit" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" :
              currentResponse.urgency === "urgent_care" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200" :
              currentResponse.urgency === "gp_today" || currentResponse.urgency === "see_doctor_today" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200" :
              currentResponse.urgency === "gp_appointment" || currentResponse.urgency === "see_doctor_soon" ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200" :
              currentResponse.urgency === "telehealth" || currentResponse.urgency === "monitor" ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200" :
              currentResponse.urgency === "pharmacy" ? "bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200" :
              "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
            }`}>
              {t(
                currentResponse.urgency === "emergency" ? "emergency" :
                currentResponse.urgency === "er_visit" ? "erVisit" :
                currentResponse.urgency === "urgent_care" ? "urgentCare" :
                currentResponse.urgency === "gp_today" || currentResponse.urgency === "see_doctor_today" ? "gpToday" :
                currentResponse.urgency === "gp_appointment" || currentResponse.urgency === "see_doctor_soon" ? "gpAppointment" :
                currentResponse.urgency === "telehealth" || currentResponse.urgency === "monitor" ? "telehealth" :
                currentResponse.urgency === "pharmacy" ? "pharmacy" : "selfCare",
              lang)}
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

            {/* ── People Like You ── */}
            {currentResponse.peopleStats && currentResponse.peopleStats.stats?.length > 0 && (
              <motion.div variants={fadeUp} className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                  📊 {lang === "tr" ? "Sizin Gibi Kişiler" : "People Like You"}
                </h3>
                <p className="text-[11px] text-muted-foreground mb-4">{currentResponse.peopleStats.sampleText}</p>
                <div className="space-y-3">
                  {currentResponse.peopleStats.stats.map((s, i) => (
                    <div key={s.condition}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{s.condition}</span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{s.percentage}%</span>
                      </div>
                      <motion.div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.percentage}%` }}
                          transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
                          className={`h-full rounded-full ${i === 0 ? "bg-emerald-500" : i === 1 ? "bg-emerald-400" : "bg-slate-400"}`}
                        />
                      </motion.div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.context}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-center">
                  {lang === "tr"
                    ? `~${currentResponse.peopleStats.totalCases} benzer vaka · Kaynak: ${currentResponse.peopleStats.source}`
                    : `Based on ~${currentResponse.peopleStats.totalCases} similar cases · Source: ${currentResponse.peopleStats.source}`}
                </p>
              </motion.div>
            )}

            {/* ── Phytotherapy Suggestions with Predictive Effectiveness ── */}
            {currentResponse.phytotherapySuggestions && currentResponse.phytotherapySuggestions.length > 0 && (
              <motion.div variants={fadeUp} className="bg-white dark:bg-card rounded-2xl border p-5 shadow-sm">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-600" /> {t("phytoTitle", lang)}
                </h3>
                <div className="space-y-3">
                  {currentResponse.phytotherapySuggestions.map((s) => (
                    <div key={s.name} className="rounded-xl border p-4 bg-emerald-50/50 dark:bg-emerald-950/10 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{s.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          s.evidence === "A" ? "bg-emerald-200 text-emerald-800" :
                          s.evidence === "B" ? "bg-amber-200 text-amber-800" :
                          "bg-stone-200 text-stone-700"
                        }`}>{t("evidence", lang)}: {s.evidence}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                      {/* Predictive Effectiveness */}
                      {s.predictedEffectiveness && (
                        <div className="mt-3 rounded-lg bg-white dark:bg-card border border-emerald-200 dark:border-emerald-800 p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-medium">
                              📈 {lang === "tr" ? "Size Özel Tahmini Etkinlik" : "Predicted Effectiveness for You"}
                            </span>
                            <span className="text-lg font-bold text-emerald-600">{s.predictedEffectiveness.percentage}%</span>
                          </div>
                          <motion.div className="h-2 w-full rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden mb-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${s.predictedEffectiveness.percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                            />
                          </motion.div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                            <span>⏱️ {s.predictedEffectiveness.timeToEffect}</span>
                            <span>📚 {s.predictedEffectiveness.studyBasis}</span>
                          </div>
                          {s.predictedEffectiveness.context && (
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">{s.predictedEffectiveness.context}</p>
                          )}
                        </div>
                      )}
                      {s.caution && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">⚠️ {s.caution}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Care Navigation ── */}
            <motion.div variants={fadeUp} className="bg-white dark:bg-card rounded-2xl border p-5 shadow-sm">
              <h3 className="text-sm font-bold mb-3">📍 {lang === "tr" ? "Sonraki Adımlar ve Bakım Seçenekleri" : "Next Steps & Care Options"}</h3>
              <div className="flex flex-wrap gap-2">
                {getCareOptions(currentResponse.urgency, lang).map((opt, i) => (
                  opt.action?.startsWith("tel:") ? (
                    <a key={i} href={opt.action}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                        opt.primary ? "bg-red-600 text-white shadow-lg hover:bg-red-700" : "border bg-white dark:bg-card hover:bg-muted"
                      }`}>
                      <span>{opt.icon}</span> {opt.label}
                    </a>
                  ) : opt.action?.startsWith("http") ? (
                    <a key={i} href={opt.action} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                        opt.primary ? "bg-primary text-white shadow-md hover:bg-primary/90" : "border bg-white dark:bg-card hover:bg-muted"
                      }`}>
                      <span>{opt.icon}</span> {opt.label}
                    </a>
                  ) : (
                    <a key={i} href={opt.action || "#"}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                        opt.primary ? "bg-primary text-white shadow-md hover:bg-primary/90" : "border bg-white dark:bg-card hover:bg-muted"
                      }`}>
                      <span>{opt.icon}</span> {opt.label}
                    </a>
                  )
                ))}
              </div>
            </motion.div>

            {/* Trust Badge */}
            <motion.div variants={fadeUp} className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                🏆 {lang === "tr"
                  ? "Diğer semptom uygulamalarından farklı olarak DoctoPal, kişiselleştirilmiş fitoterapi protokolleri, ilaç etkileşim kontrolleri ve günlük sağlık takibi sunar — hepsi tek platformda."
                  : "Unlike symptom-only apps, your assessment includes personalized phytotherapy protocols, medication interaction checks, and daily health tracking — all in one place."}
              </p>
            </motion.div>

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

            {/* Share with Doctor */}
            <motion.div variants={fadeUp} className="bg-white dark:bg-card rounded-2xl border p-5 shadow-sm">
              <h3 className="text-sm font-bold mb-3">{lang === "tr" ? "📄 Doktorunuzla Paylaşın" : "📄 Share with Your Doctor"}</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleDownloadPDF} disabled={pdfLoading}
                  className="flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  {pdfLoading ? (lang === "tr" ? "PDF Oluşturuluyor..." : "Generating PDF...") : pdfDone ? "✅" : (lang === "tr" ? "PDF İndir" : "Download PDF")}
                </button>
                <button onClick={handleCopySummary}
                  className="flex items-center gap-2 rounded-xl border bg-white dark:bg-card px-4 py-2.5 text-xs font-medium hover:bg-muted transition-colors">
                  <BookOpen className="h-3.5 w-3.5" />
                  {copyDone ? "✅" : (lang === "tr" ? "Özeti Kopyala" : "Copy Summary")}
                </button>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2 pt-2">
              <a href="/health-assistant"
                className="flex items-center justify-center gap-2 rounded-xl border bg-white dark:bg-card p-3 text-xs font-medium hover:bg-muted transition-colors">
                <MessageSquare className="h-3.5 w-3.5" /> {t("discuss", lang)}
              </a>
              <button onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white p-3 text-xs font-medium hover:bg-primary/90 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> {t("newAssessment", lang)}
              </button>
              <a href="/interaction-checker"
                className="flex items-center justify-center gap-2 rounded-xl border bg-white dark:bg-card p-3 text-xs font-medium hover:bg-muted transition-colors col-span-2">
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
                      <span className="text-sm">{step === 1 && freeText ? t("aiParsing", lang) : t("aiThinking", lang)}</span>
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

              {/* Confidence change impact */}
              {currentResponse?.confidenceChange?.questionImpact && (
                <div className="mt-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-2.5 border border-blue-200/60">
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">🧠 {currentResponse.confidenceChange.questionImpact}</p>
                </div>
              )}

              {/* AI reasoning (expandable) */}
              {currentResponse?.reasoning && (
                <details className="mt-2">
                  <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                    🧠 {lang === "tr" ? "Neden bu soru?" : "Why this question?"}
                  </summary>
                  <p className="text-[10px] text-muted-foreground mt-1 pl-4 border-l-2 border-primary/20">
                    {currentResponse.reasoning}
                  </p>
                </details>
              )}

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
