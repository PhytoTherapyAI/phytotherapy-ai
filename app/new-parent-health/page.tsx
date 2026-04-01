// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Baby, Heart, Moon, Smile, Frown, Meh,
  Clock, Leaf, Play, Pause, RotateCcw,
  ChevronRight, Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ═══ CONTEXT SWITCHER ═══
function ContextSwitcher({ mode, onChange, lang }: { mode: "child" | "self"; onChange: (m: "child" | "self") => void; lang: string }) {
  return (
    <div className="flex bg-white dark:bg-card rounded-xl border p-1 gap-1">
      {(["child", "self"] as const).map(m => (
        <motion.button key={m} whileTap={{ scale: 0.95 }}
          onClick={() => onChange(m)}
          className={`relative flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
            mode === m ? "text-white" : "text-muted-foreground"
          }`}>
          {mode === m && (
            <motion.div layoutId="parentSwitcher" className="absolute inset-0 bg-primary rounded-lg shadow"
              transition={{ type: "spring", stiffness: 300, damping: 30 }} />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            {m === "child" ? <Baby className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
            {m === "child" ? (lang === "tr" ? "Çocuğum" : "My Child") : (lang === "tr" ? "Kendim" : "Myself")}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

// ═══ POWER NAP TIMER ═══
function PowerNapTimer({ lang }: { lang: string }) {
  const [seconds, setSeconds] = useState(20 * 60)
  const [running, setRunning] = useState(false)
  const ref = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { setRunning(false); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running])

  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  const pct = ((20 * 60 - seconds) / (20 * 60)) * 100

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-900/10 dark:to-violet-900/10">
      <CardContent className="p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Moon className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-bold">{lang === "tr" ? "20 Dk Güç Uykusu" : "20 Min Power Nap"}</h3>
        </div>

        <div className="relative inline-block mb-4">
          <svg width={100} height={100} className="transform -rotate-90">
            <circle cx={50} cy={50} r={40} strokeWidth={5} fill="none" className="stroke-stone-200 dark:stroke-stone-700" />
            <motion.circle cx={50} cy={50} r={40} strokeWidth={5} fill="none" strokeLinecap="round"
              className="stroke-indigo-500" strokeDasharray={2 * Math.PI * 40}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 - (pct / 100) * 2 * Math.PI * 40 }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button size="sm" className="rounded-xl bg-indigo-500 hover:bg-indigo-600" onClick={() => setRunning(!running)}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setRunning(false); setSeconds(20 * 60) }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ═══ STRETCH ANIMATION ═══
function StretchCard({ lang }: { lang: string }) {
  const [step, setStep] = useState(0)
  const stretches = [
    { emoji: "🙆", label: lang === "tr" ? "Omuz çevirme (10x)" : "Shoulder rolls (10x)" },
    { emoji: "🧘", label: lang === "tr" ? "Kedi-İnek duruşu (5x)" : "Cat-Cow stretch (5x)" },
    { emoji: "💆", label: lang === "tr" ? "Boyun esneme (her yöne 15sn)" : "Neck stretch (15s each side)" },
    { emoji: "🤸", label: lang === "tr" ? "Bel esneme (30sn)" : "Lower back stretch (30s)" },
  ]

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-sage-50/50 to-emerald-50/50 dark:from-emerald-900/10 dark:to-primary/5">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">{lang === "tr" ? "Sırtı Esneme" : "Back Stretch"}</h3>
        </div>
        <div className="space-y-2">
          {stretches.map((s, i) => (
            <motion.button key={i} whileTap={{ scale: 0.97 }}
              onClick={() => setStep(i === step ? -1 : i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                i === step ? "bg-primary/10 text-primary font-medium" : i < step ? "opacity-50 line-through" : "hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}>
              <span className="text-lg">{s.emoji}</span>
              <span className="flex-1">{s.label}</span>
              {i < step && <span className="text-xs text-emerald-500">✓</span>}
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ═══ MOOD SURVEY (Typeform-style) ═══
function MoodSurvey({ lang }: { lang: string }) {
  const [mood, setMood] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const moods = [
    { value: 1, emoji: "😢", label: lang === "tr" ? "Çok Kötü" : "Very Bad" },
    { value: 2, emoji: "😟", label: lang === "tr" ? "Kötü" : "Bad" },
    { value: 3, emoji: "😐", label: lang === "tr" ? "Normal" : "Okay" },
    { value: 4, emoji: "😊", label: lang === "tr" ? "İyi" : "Good" },
    { value: 5, emoji: "🤩", label: lang === "tr" ? "Harika" : "Great" },
  ]

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
      <CardContent className="p-5 text-center">
        <h3 className="text-sm font-bold mb-1">
          {lang === "tr" ? "Bugün nasıl hissediyorsunuz?" : "How are you feeling today?"}
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">
          {lang === "tr" ? "Duygularınız önemli" : "Your feelings matter"}
        </p>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="survey" className="space-y-4">
              <div className="flex justify-center gap-3">
                {moods.map(m => (
                  <motion.button key={m.value} whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      mood === m.value ? "bg-primary/10 ring-2 ring-primary scale-110" : "hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[9px] text-muted-foreground">{m.label}</span>
                  </motion.button>
                ))}
              </div>
              {mood !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Button size="sm" className="rounded-xl" onClick={() => setSubmitted(true)}>
                    {lang === "tr" ? "Kaydet" : "Save"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="py-4">
              <span className="text-3xl">💛</span>
              <p className="text-sm font-medium text-foreground mt-2">
                {lang === "tr" ? "Teşekkürler! Kendinize iyi bakın." : "Thank you! Take care of yourself."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export default function NewParentHealthPage() {
  const { lang } = useLang()
  const [mode, setMode] = useState<"child" | "self">("self")

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-violet-50/20 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 space-y-2">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
            <Heart className="h-10 w-10 text-rose-400 mx-auto" />
          </motion.div>
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Ebeveyn Sığınağı" : "Parent Sanctuary"}</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "tr" ? "Hem bebeğiniz hem kendiniz için bakım rehberi." : "Care guide for both your baby and yourself."}
          </p>
        </motion.div>

        {/* Context switcher */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <ContextSwitcher mode={mode} onChange={setMode} lang={lang} />
        </motion.div>

        {/* Content by mode */}
        <AnimatePresence mode="wait">
          {mode === "self" ? (
            <motion.div key="self" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <MoodSurvey lang={lang} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PowerNapTimer lang={lang} />
                <StretchCard lang={lang} />
              </div>
              {/* Self-care tips */}
              <Card className="rounded-2xl">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold">{lang === "tr" ? "Ebeveyn Bakım İpuçları" : "Parent Self-Care Tips"}</h3>
                  </div>
                  {[
                    { e: "🍵", t: lang === "tr" ? "Papatya çayı — anksiyete ve uyku için güvenli" : "Chamomile tea — safe for anxiety and sleep" },
                    { e: "🧘", t: lang === "tr" ? "Günde 10 dk meditasyon — cortisol düşürür" : "10 min daily meditation — lowers cortisol" },
                    { e: "💧", t: lang === "tr" ? "Emziriyorsanız günde 10+ bardak su" : "10+ glasses water if breastfeeding" },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{tip.e}</span> {tip.t}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="child" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Baby milestones */}
              {[
                { age: "0-3m", emoji: "👶", items: [
                  lang === "tr" ? "Tummy time günde 3-5 dk" : "Tummy time 3-5 min daily",
                  lang === "tr" ? "Göz teması ve konuşma" : "Eye contact and talking",
                ]},
                { age: "3-6m", emoji: "🍼", items: [
                  lang === "tr" ? "İlk katı gıdaya hazırlık" : "Preparing for first solids",
                  lang === "tr" ? "Uyku rutini oluşturma" : "Establishing sleep routine",
                ]},
                { age: "6-12m", emoji: "🧸", items: [
                  lang === "tr" ? "Demir takviyesi kontrolü" : "Iron supplement check",
                  lang === "tr" ? "Motor gelişim takibi" : "Motor development tracking",
                ]},
              ].map((m, i) => (
                <motion.div key={m.age} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}>
                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{m.emoji}</span>
                        <Badge variant="secondary" className="text-[10px]">{m.age}</Badge>
                      </div>
                      <ul className="space-y-1.5">
                        {m.items.map((item, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
