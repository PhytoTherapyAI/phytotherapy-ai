// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Baby, Thermometer, Shield, Heart,
  Phone, Leaf, Apple, Moon, Activity,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLang } from "@/components/layout/language-toggle"
import { PediatricAgePicker } from "@/components/child-health/PediatricAgePicker"

// ── Age group chips ──
interface AgeGroup {
  id: string; label: string; labelTr: string; range: string; rangeTr: string; emoji: string; color: string
}

const AGE_GROUPS: AgeGroup[] = [
  { id: "newborn", label: "Newborn", labelTr: "Yenidoğan", range: "0-3 mo", rangeTr: "0-3 Ay", emoji: "👶", color: "#f472b6" },
  { id: "infant", label: "Infant", labelTr: "Bebek", range: "3-12 mo", rangeTr: "3-12 Ay", emoji: "🍼", color: "#a78bfa" },
  { id: "toddler", label: "Toddler", labelTr: "Oyun Çocuğu", range: "1-3 yr", rangeTr: "1-3 Yaş", emoji: "🧸", color: "#60a5fa" },
  { id: "school", label: "School Age", labelTr: "Okul Çağı", range: "4+ yr", rangeTr: "4+ Yaş", emoji: "🎒", color: "#34d399" },
]

// ── Issues with progressive disclosure ──
interface ChildIssue {
  id: string; label: string; labelTr: string; emoji: string; color: string
  subOptions: Array<{ id: string; label: string; labelTr: string }>
}

const ISSUES: ChildIssue[] = [
  {
    id: "fever", label: "Fever", labelTr: "Ateş", emoji: "🌡️", color: "#ef4444",
    subOptions: [
      { id: "fever-38", label: "Above 38°C", labelTr: "38°C Üzeri" },
      { id: "fever-days", label: "Lasting 2+ days", labelTr: "2 Gündür Devam" },
      { id: "fever-med", label: "Gave fever reducer", labelTr: "Ateş Düşürücü Verdim" },
    ],
  },
  {
    id: "cough", label: "Cough & Cold", labelTr: "Öksürük & Soğuk Algınlığı", emoji: "🤧", color: "#f59e0b",
    subOptions: [
      { id: "cough-dry", label: "Dry cough", labelTr: "Kuru öksürük" },
      { id: "cough-runny", label: "Runny nose", labelTr: "Burun akıntısı" },
      { id: "cough-wheeze", label: "Wheezing", labelTr: "Hırıltılı solunum" },
    ],
  },
  {
    id: "stomach", label: "Stomach Issues", labelTr: "Mide Sorunları", emoji: "🤢", color: "#22c55e",
    subOptions: [
      { id: "stomach-vomit", label: "Vomiting", labelTr: "Kusma" },
      { id: "stomach-diarrhea", label: "Diarrhea", labelTr: "İshal" },
      { id: "stomach-pain", label: "Stomach pain", labelTr: "Karın ağrısı" },
    ],
  },
  {
    id: "skin", label: "Skin & Rash", labelTr: "Cilt & Döküntü", emoji: "🔴", color: "#ec4899",
    subOptions: [
      { id: "skin-rash", label: "Red rash", labelTr: "Kızıl döküntü" },
      { id: "skin-itch", label: "Itching", labelTr: "Kaşıntı" },
      { id: "skin-eczema", label: "Eczema flare", labelTr: "Egzama alevlenmesi" },
    ],
  },
  {
    id: "sleep", label: "Sleep Problems", labelTr: "Uyku Sorunları", emoji: "😴", color: "#6366f1",
    subOptions: [
      { id: "sleep-cant", label: "Can't fall asleep", labelTr: "Uyuyamıyor" },
      { id: "sleep-wake", label: "Wakes at night", labelTr: "Gece uyanıyor" },
      { id: "sleep-nightmare", label: "Nightmares", labelTr: "Kâbuslar" },
    ],
  },
  {
    id: "nutrition", label: "Nutrition", labelTr: "Beslenme", emoji: "🍎", color: "#16a34a",
    subOptions: [
      { id: "nutr-appetite", label: "Low appetite", labelTr: "İştahsızlık" },
      { id: "nutr-picky", label: "Picky eater", labelTr: "Seçici yeme" },
      { id: "nutr-allergy", label: "Food allergy", labelTr: "Gıda alerjisi" },
    ],
  },
]

export default function ChildHealthPage() {
  const { lang } = useLang()
  const [selectedAge, setSelectedAge] = useState<string | null>(null)
  const [showAgePicker, setShowAgePicker] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [selectedSubs, setSelectedSubs] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleAgeSelect = useCallback((_y: number, _m: number) => {}, [])

  const toggleSub = (id: string) => {
    setSelectedSubs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const activeIssue = ISSUES.find(i => i.id === selectedIssue)

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-emerald-50/30 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* ═══ EMPATHETIC HERO ═══ */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-6 space-y-3">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
            <Baby className="h-12 w-12 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "tr" ? "Derin Bir Nefes Alın, Biz Buradayız" : "Take a Deep Breath, We're Here"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "tr"
              ? "Çocuğunuzun sağlığı konusunda güvenilir, kanıta dayalı rehberlik."
              : "Trusted, evidence-based guidance for your child's health."}
          </p>
        </motion.div>

        {/* ═══ AGE GROUP CHIPS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            {lang === "tr" ? "Yaş Grubu Seçin" : "Select Age Group"}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {AGE_GROUPS.map((g, i) => {
              const isActive = selectedAge === g.id
              return (
                <motion.button key={g.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedAge(isActive ? null : g.id); setShowAgePicker(false) }}
                  className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all ${
                    isActive ? "ring-2 shadow-md bg-white dark:bg-card" : "bg-white/60 dark:bg-card/60 hover:bg-white dark:hover:bg-card hover:shadow-sm"
                  }`}
                  style={isActive ? { boxShadow: `0 0 0 2px ${g.color}, 0 4px 16px ${g.color}20` } : undefined}>
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${isActive ? "" : "text-foreground"}`}
                      style={isActive ? { color: g.color } : undefined}>
                      {lang === "tr" ? g.labelTr : g.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{lang === "tr" ? g.rangeTr : g.range}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>

          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowAgePicker(!showAgePicker)}
            className="w-full mt-3 text-xs text-primary font-medium py-2 hover:underline">
            {lang === "tr" ? "Tam yaş seçmek isterim →" : "I want to select exact age →"}
          </motion.button>

          <AnimatePresence>
            {showAgePicker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-3 rounded-2xl border bg-white/80 dark:bg-card/80 backdrop-blur-md p-4">
                  <PediatricAgePicker onSelect={handleAgeSelect} lang={lang} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══ SMART TRIAGE ═══ */}
        <AnimatePresence>
          {(selectedAge || showAgePicker) && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === "tr" ? "Sorun Nedir?" : "What's the Issue?"}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {ISSUES.map((issue, i) => {
                  const isActive = selectedIssue === issue.id
                  return (
                    <motion.button key={issue.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedIssue(isActive ? null : issue.id); setSelectedSubs([]); setShowResults(false) }}
                      className={`flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all ${
                        isActive ? "ring-2 bg-white dark:bg-card shadow-sm" : "bg-white/60 dark:bg-card/60 hover:bg-white dark:hover:bg-card"
                      }`}
                      style={isActive ? { boxShadow: `0 0 0 2px ${issue.color}` } : undefined}>
                      <span className="text-xl">{issue.emoji}</span>
                      <span className={`text-xs font-semibold ${isActive ? "" : "text-foreground"}`}
                        style={isActive ? { color: issue.color } : undefined}>
                        {lang === "tr" ? issue.labelTr : issue.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Sub-options */}
              <AnimatePresence>
                {activeIssue && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="rounded-2xl border bg-white dark:bg-card p-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {lang === "tr" ? "Detay seçin:" : "Select details:"}
                      </p>
                      {activeIssue.subOptions.map(sub => {
                        const isChecked = selectedSubs.includes(sub.id)
                        return (
                          <motion.button key={sub.id} whileTap={{ scale: 0.97 }}
                            onClick={() => toggleSub(sub.id)}
                            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                              isChecked ? "bg-primary/10 text-primary font-medium" : "hover:bg-stone-50 dark:hover:bg-stone-900 text-foreground"
                            }`}>
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isChecked ? "bg-primary border-primary" : "border-stone-300"
                            }`}>
                              {isChecked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-1.5 w-1.5 bg-white rounded-full" />}
                            </div>
                            {lang === "tr" ? sub.labelTr : sub.label}
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              {selectedIssue && selectedSubs.length > 0 && !showResults && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Button onClick={() => setShowResults(true)}
                    className="w-full h-12 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20 animate-pulse">
                    <Shield className="h-4 w-4 mr-2" />
                    {lang === "tr" ? "Güvenli Adımları Gör" : "View Safe Steps"}
                  </Button>
                </motion.div>
              )}

              {/* Results */}
              <AnimatePresence>
                {showResults && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="space-y-4">
                    <Card className="rounded-2xl border-primary/20">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-primary" />
                          <h3 className="text-base font-bold text-primary">
                            {lang === "tr" ? "Güvenli Adımlar" : "Safe Steps"}
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {[
                            lang === "tr" ? "Bol sıvı tüketimi sağlayın (su, komposto)" : "Ensure plenty of fluids (water, compote)",
                            lang === "tr" ? "Odayı serin ve havadar tutun" : "Keep the room cool and ventilated",
                            lang === "tr" ? "Semptomları not edin — doktora götürürken işe yarar" : "Note symptoms — useful when visiting the doctor",
                          ].map((step, i) => (
                            <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-2 text-sm text-foreground">
                              <span className="text-primary mt-0.5">✓</span> {step}
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <motion.a href="tel:112" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200/50 p-4 hover:bg-red-100 transition-colors">
                      <Phone className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-bold text-red-700 dark:text-red-400">
                          {lang === "tr" ? "Durum kötüleşirse hemen arayın" : "Call immediately if condition worsens"}
                        </p>
                        <p className="text-xs text-red-500/80">112</p>
                      </div>
                    </motion.a>

                    <p className="text-[10px] text-muted-foreground text-center px-4">
                      {lang === "tr"
                        ? "Bu bilgiler tıbbi tavsiye yerine geçmez. Her zaman çocuk doktorunuza danışın."
                        : "This information does not replace medical advice. Always consult your pediatrician."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
