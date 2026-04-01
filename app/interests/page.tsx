// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart, Brain, Moon, Dumbbell, Leaf, Shield,
  Apple, Baby, Stethoscope, Activity, Eye,
  Sparkles, Check, ArrowRight, Loader2,
  Flame, Zap, Clock, Sun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"
import { useRouter } from "next/navigation"

interface InterestItem {
  id: string; label: string; labelTr: string; emoji: string; color: string; category: string
}

const INTERESTS: InterestItem[] = [
  // Wellness
  { id: "sleep", label: "Sleep Quality", labelTr: "Uyku Kalitesi", emoji: "😴", color: "#6366f1", category: "wellness" },
  { id: "stress", label: "Stress Management", labelTr: "Stres Yönetimi", emoji: "🧘", color: "#8b5cf6", category: "wellness" },
  { id: "energy", label: "Energy & Vitality", labelTr: "Enerji & Canlılık", emoji: "⚡", color: "#f59e0b", category: "wellness" },
  { id: "focus", label: "Focus & Memory", labelTr: "Odak & Hafıza", emoji: "🧠", color: "#06b6d4", category: "wellness" },
  { id: "mood", label: "Mood Balance", labelTr: "Ruh Hali Dengesi", emoji: "🌈", color: "#ec4899", category: "wellness" },
  { id: "longevity", label: "Longevity", labelTr: "Uzun Ömür", emoji: "🧬", color: "#14b8a6", category: "wellness" },

  // Physical
  { id: "weight", label: "Weight Management", labelTr: "Kilo Yönetimi", emoji: "⚖️", color: "#22c55e", category: "physical" },
  { id: "fitness", label: "Sports & Fitness", labelTr: "Spor & Fitness", emoji: "🏋️", color: "#3b82f6", category: "physical" },
  { id: "immunity", label: "Immune System", labelTr: "Bağışıklık Sistemi", emoji: "🛡️", color: "#3c7a52", category: "physical" },
  { id: "heart", label: "Heart Health", labelTr: "Kalp Sağlığı", emoji: "❤️", color: "#ef4444", category: "physical" },
  { id: "digestion", label: "Gut Health", labelTr: "Sindirim Sağlığı", emoji: "🍏", color: "#16a34a", category: "physical" },
  { id: "skin", label: "Skin & Hair", labelTr: "Cilt & Saç", emoji: "✨", color: "#d946ef", category: "physical" },

  // Life Stage
  { id: "pregnancy", label: "Pregnancy & Baby", labelTr: "Gebelik & Bebek", emoji: "🤰", color: "#f472b6", category: "life" },
  { id: "menopause", label: "Menopause", labelTr: "Menopoz", emoji: "🌸", color: "#e879f9", category: "life" },
  { id: "aging", label: "Healthy Aging", labelTr: "Sağlıklı Yaşlanma", emoji: "🌿", color: "#84cc16", category: "life" },
  { id: "student", label: "Student Life", labelTr: "Öğrenci Hayatı", emoji: "📚", color: "#0ea5e9", category: "life" },
  { id: "chronic", label: "Chronic Conditions", labelTr: "Kronik Hastalıklar", emoji: "🏥", color: "#dc2626", category: "life" },
  { id: "mental", label: "Mental Health", labelTr: "Ruh Sağlığı", emoji: "💆", color: "#7c3aed", category: "life" },

  // Supplementary
  { id: "herbs", label: "Herbal Medicine", labelTr: "Bitkisel Tıp", emoji: "🌿", color: "#059669", category: "supplement" },
  { id: "vitamins", label: "Vitamins & Minerals", labelTr: "Vitamin & Mineral", emoji: "💊", color: "#0891b2", category: "supplement" },
  { id: "antiinflam", label: "Anti-Inflammatory", labelTr: "Anti-İnflamatuar", emoji: "🔥", color: "#ea580c", category: "supplement" },
  { id: "detox", label: "Detox & Cleanse", labelTr: "Detoks & Arınma", emoji: "💧", color: "#0284c7", category: "supplement" },
  { id: "adaptogens", label: "Adaptogens", labelTr: "Adaptogenler", emoji: "🍄", color: "#92400e", category: "supplement" },
  { id: "probiotics", label: "Probiotics", labelTr: "Probiyotikler", emoji: "🦠", color: "#15803d", category: "supplement" },
]

function getProgressMessage(count: number, lang: string): string {
  if (count === 0) return lang === "tr" ? "Neye odaklanmak istersiniz?" : "What would you like to focus on?"
  if (count <= 2) return lang === "tr" ? "Harika bir başlangıç!" : "Great start!"
  return lang === "tr" ? "İşte bu!" : "That's it!"
}

// ═══ LABOR ILLUSION ═══
function AnalyzingScreen({ lang }: { lang: string }) {
  const [step, setStep] = useState(0)
  const steps = [
    lang === "tr" ? "İlgi alanlarınız analiz ediliyor..." : "Analyzing your interests...",
    lang === "tr" ? "Sağlık profiliniz oluşturuluyor..." : "Building your health profile...",
    lang === "tr" ? "Size özel rota çiziliyor..." : "Drawing your personalized route...",
  ]

  useEffect(() => {
    const interval = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1500)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50 dark:bg-background">
      <div className="text-center space-y-6 px-8">
        <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-lg font-medium text-foreground">
            {steps[step]}
          </motion.p>
        </AnimatePresence>
        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <motion.div key={i}
              animate={{ backgroundColor: i <= step ? "#3c7a52" : "#d6d3d1" }}
              className="h-1.5 w-8 rounded-full" />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function InterestsPage() {
  const { lang } = useLang()
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleContinue = () => {
    setAnalyzing(true)
    timerRef.current = setTimeout(() => router.push("/dashboard"), 4500)
  }

  if (analyzing) return <AnalyzingScreen lang={lang} />

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-6 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 space-y-2">
          <Sparkles className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "İlgi Alanlarınız" : "Your Interests"}</h1>
          <motion.p key={selected.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground">
            {getProgressMessage(selected.length, lang)}
          </motion.p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
            <motion.div className="h-full rounded-full bg-primary"
              animate={{ width: `${Math.min((selected.length / 5) * 100, 100)}%` }}
              transition={{ duration: 0.5 }} />
          </div>
          <span className="text-xs font-bold text-primary">{selected.length}</span>
        </div>

        {/* Masonry/Bento Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
          {INTERESTS.map((item, i) => {
            const isActive = selected.includes(item.id)
            return (
              <motion.button key={item.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02, type: "spring", stiffness: 200 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggle(item.id)}
                className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 min-h-[80px] transition-all ${
                  isActive
                    ? "ring-2 shadow-md bg-white dark:bg-card"
                    : "bg-white/60 dark:bg-card/60 hover:bg-white dark:hover:bg-card hover:shadow-sm"
                }`}
                style={isActive ? {
                  boxShadow: `0 0 0 2px ${item.color}, 0 4px 16px ${item.color}20`,
                  backgroundColor: `${item.color}08`,
                } : undefined}>
                <span className="text-2xl">{item.emoji}</span>
                <span className={`text-[10px] font-semibold text-center leading-tight ${isActive ? "" : "text-foreground"}`}
                  style={isActive ? { color: item.color } : undefined}>
                  {lang === "tr" ? item.labelTr : item.label}
                </span>
                {isActive && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center shadow"
                    style={{ backgroundColor: item.color }}>
                    <Check className="h-3 w-3 text-white" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* CTA */}
        <AnimatePresence>
          {selected.length >= 1 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }} className="sticky bottom-6">
              <Button onClick={handleContinue}
                className="w-full h-12 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20">
                {lang === "tr"
                  ? `${selected.length} alan seçildi — Devam Et`
                  : `${selected.length} selected — Continue`}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
