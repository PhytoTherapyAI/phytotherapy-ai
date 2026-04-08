// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart, Pill, Brain, Bone, Shield, Phone,
  ChevronRight, Sparkles, AlertTriangle, Check,
  FileText, Activity, Eye,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

interface ElderModule {
  id: string; label: string; labelTr: string; emoji: string; color: string; description: string; descriptionTr: string
}

const MODULES: ElderModule[] = [
  { id: "polypharmacy", label: "Polypharmacy Shield", labelTr: "Polifarmasi Kalkanı",
    emoji: "💊", color: "#ef4444",
    description: "Check drug interactions for multiple medications",
    descriptionTr: "Çoklu ilaç etkileşimlerini kontrol edin" },
  { id: "cognitive", label: "Cognitive Support", labelTr: "Bilişsel Destek",
    emoji: "🧠", color: "#8b5cf6",
    description: "Memory exercises, brain-boosting supplements",
    descriptionTr: "Hafıza egzersizleri, beyin destekleyici takviyeler" },
  { id: "bone", label: "Bone & Fall Prevention", labelTr: "Kemik Sağlığı & Düşme Önleme",
    emoji: "🦴", color: "#f59e0b",
    description: "Calcium, Vitamin D, balance exercises",
    descriptionTr: "Kalsiyum, D vitamini, denge egzersizleri" },
  { id: "heart", label: "Heart Health", labelTr: "Kalp Sağlığı",
    emoji: "❤️", color: "#dc2626",
    description: "Blood pressure, cholesterol, omega-3",
    descriptionTr: "Tansiyon, kolesterol, omega-3" },
  { id: "vision", label: "Vision & Hearing", labelTr: "Görme & İşitme",
    emoji: "👁️", color: "#06b6d4",
    description: "Eye health, lutein, hearing protection",
    descriptionTr: "Göz sağlığı, lutein, işitme koruması" },
  { id: "nutrition", label: "Senior Nutrition", labelTr: "Yaşlı Beslenmesi",
    emoji: "🍲", color: "#16a34a",
    description: "Protein needs, hydration, meal planning",
    descriptionTr: "Protein ihtiyacı, su tüketimi, beslenme planı" },
]

function ModuleDetail({ module, lang }: { module: ElderModule; lang: string }) {
  const tips: Record<string, Array<{ emoji: string; text: string; textTr: string }>> = {
    polypharmacy: [
      { emoji: "📋", text: "Bring all medications to doctor visits", textTr: "Tüm ilaçlarınızı doktor ziyaretine götürün" },
      { emoji: "⏰", text: "Use a pill organizer with alarms", textTr: "Alarmlı ilaç kutusu kullanın" },
      { emoji: "🔍", text: "Check interactions regularly", textTr: "Etkileşimleri düzenli kontrol edin" },
    ],
    cognitive: [
      { emoji: "🧩", text: "Daily puzzles and reading", textTr: "Günlük bulmaca ve okuma" },
      { emoji: "🐟", text: "Omega-3 (EPA+DHA) 1-2g daily", textTr: "Omega-3 (EPA+DHA) günde 1-2g" },
      { emoji: "🚶", text: "30 min walk = brain exercise", textTr: "30 dk yürüyüş = beyin egzersizi" },
    ],
    bone: [
      { emoji: "☀️", text: "Vitamin D3 1000-2000 IU daily", textTr: "D3 vitamini günde 1000-2000 IU" },
      { emoji: "🥛", text: "Calcium from food + supplement if needed", textTr: "Kalsiyum yemeklerden + gerekirse takviye" },
      { emoji: "🧘", text: "Balance exercises 3x/week", textTr: "Denge egzersizleri haftada 3x" },
    ],
    heart: [
      { emoji: "🫀", text: "Monitor blood pressure daily", textTr: "Tansiyonu günlük ölçün" },
      { emoji: "🐟", text: "Omega-3 for triglycerides", textTr: "Trigliserid için omega-3" },
      { emoji: "🧄", text: "Garlic extract 600mg daily", textTr: "Sarımsak ekstresi günde 600mg" },
    ],
    vision: [
      { emoji: "🥕", text: "Lutein + Zeaxanthin for macular health", textTr: "Makula sağlığı için Lutein + Zeaksantin" },
      { emoji: "🫐", text: "Bilberry extract for night vision", textTr: "Gece görüşü için yaban mersini ekstresi" },
      { emoji: "🕶️", text: "UV protection sunglasses", textTr: "UV korumalı güneş gözlüğü" },
    ],
    nutrition: [
      { emoji: "🥩", text: "1.2g protein/kg body weight", textTr: "Vücut ağırlığı kg başına 1.2g protein" },
      { emoji: "💧", text: "8+ glasses water (thirst decreases with age)", textTr: "8+ bardak su (yaşla susuzluk hissi azalır)" },
      { emoji: "🥗", text: "Mediterranean diet for longevity", textTr: "Uzun ömür için Akdeniz diyeti" },
    ],
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-3">
      <div className="rounded-2xl p-4 border-2 flex items-center gap-4"
        style={{ borderColor: module.color, backgroundColor: `${module.color}08` }}>
        <span className="text-3xl">{module.emoji}</span>
        <div>
          <h3 className="text-lg font-bold" style={{ color: module.color }}>
            {lang === "tr" ? module.labelTr : module.label}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lang === "tr" ? module.descriptionTr : module.description}
          </p>
        </div>
      </div>

      {(tips[module.id] || []).map((tip, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 rounded-xl bg-white dark:bg-card border p-3 min-h-[48px]">
          <span className="text-lg">{tip.emoji}</span>
          <span className="text-sm">{lang === "tr" ? tip.textTr : tip.text}</span>
        </motion.div>
      ))}

      <Button className="w-full h-14 rounded-2xl text-sm font-semibold shadow-lg" size="lg">
        <Sparkles className="h-4 w-4 mr-2" />
        {lang === "tr" ? "Kişisel Değerlendirme Başlat — Sadece 3 dakika" : "Start Personal Assessment — Only 3 minutes"}
      </Button>
    </motion.div>
  )
}

export default function ElderCarePage() {
  const { lang } = useLang()
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const active = MODULES.find(m => m.id === selectedModule)

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-6 space-y-3">
          <Shield className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Güvenli Yaş Alma Merkezi" : "Safe Aging Center"}</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "tr"
              ? "Sağlığınızı koruyun, yaşam kalitenizi artırın."
              : "Protect your health, enhance your quality of life."}
          </p>
        </motion.div>

        {/* Geriatric Bento Box */}
        <AnimatePresence mode="wait">
          {!selectedModule ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3">
              {MODULES.map((m, i) => (
                <motion.button key={m.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedModule(m.id)}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white dark:bg-card border p-5 min-h-[112px] hover:shadow-md transition-shadow text-center">
                  <span className="text-3xl">{m.emoji}</span>
                  <p className="text-xs font-bold text-foreground">{lang === "tr" ? m.labelTr : m.label}</p>
                  <p className="text-[9px] text-muted-foreground line-clamp-2">{lang === "tr" ? m.descriptionTr : m.description}</p>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedModule(null)}
                className="rounded-xl text-xs mb-4 min-h-[48px]">
                {lang === "tr" ? "← Tüm Modüller" : "← All Modules"}
              </Button>
              {active && <ModuleDetail module={active} lang={lang} />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS + FHIR */}
        <div className="flex gap-3">
          <motion.a href="tel:112" whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-500 text-white p-4 min-h-[64px] font-bold shadow-lg">
            <Phone className="h-5 w-5" /> SOS 112
          </motion.a>
          <motion.button whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary text-white p-4 min-h-[64px] font-bold shadow-lg">
            <FileText className="h-5 w-5" /> {lang === "tr" ? "FHIR Paylaş" : "Share FHIR"}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
