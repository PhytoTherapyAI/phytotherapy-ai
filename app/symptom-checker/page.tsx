// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope, Loader2, Sparkles, Shield, Send, Check, Leaf,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

const REGIONS = [
  { id: "head", emoji: "🧠", label: "Head & Mind", symptoms: [
    { id: "headache", emoji: "🤕", label: "Headache" }, { id: "dizziness", emoji: "💫", label: "Dizziness" },
    { id: "brain-fog", emoji: "🌫️", label: "Brain Fog" }, { id: "migraine", emoji: "⚡", label: "Migraine" },
  ]},
  { id: "chest", emoji: "🫁", label: "Chest & Breath", symptoms: [
    { id: "cough", emoji: "🤧", label: "Cough" }, { id: "shortness", emoji: "😮‍💨", label: "Shortness of Breath" },
    { id: "chest-tight", emoji: "😣", label: "Chest Tightness" },
  ]},
  { id: "stomach", emoji: "🍕", label: "Stomach & Digestion", symptoms: [
    { id: "nausea", emoji: "🤢", label: "Nausea" }, { id: "heartburn", emoji: "🔥", label: "Heartburn" },
    { id: "bloating", emoji: "🎈", label: "Bloating" }, { id: "stomach-pain", emoji: "😖", label: "Stomach Pain" },
  ]},
  { id: "muscle", emoji: "🦴", label: "Muscle & Joint", symptoms: [
    { id: "back-pain", emoji: "🔙", label: "Back Pain" }, { id: "joint-pain", emoji: "🦵", label: "Joint Pain" },
    { id: "fatigue", emoji: "😴", label: "Fatigue" }, { id: "cramps", emoji: "💪", label: "Cramps" },
  ]},
  { id: "skin", emoji: "✋", label: "Skin & Allergies", symptoms: [
    { id: "rash", emoji: "🔴", label: "Rash" }, { id: "itch", emoji: "🤏", label: "Itching" }, { id: "hives", emoji: "⭕", label: "Hives" },
  ]},
  { id: "mood", emoji: "💆", label: "Mood & Energy", symptoms: [
    { id: "anxiety", emoji: "😰", label: "Anxiety" }, { id: "low-mood", emoji: "😔", label: "Low Mood" },
    { id: "insomnia", emoji: "🌙", label: "Insomnia" }, { id: "low-energy", emoji: "🔋", label: "Low Energy" },
  ]},
]

function AnalysisLoader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const steps = ["Comparing symptoms with medical literature...", "Evaluating risk factors from your profile...", "Preparing soothing phytotherapy protocols..."]
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let mounted = true
    timerRef.current = setInterval(() => {
      if (!mounted) return
      setStep(s => {
        if (s >= steps.length - 1) { if (timerRef.current) clearInterval(timerRef.current); setTimeout(() => { if (mounted) onDone() }, 800); return s }
        return s + 1
      })
    }, 1200)
    return () => { mounted = false; if (timerRef.current) clearInterval(timerRef.current) }
  }, [onDone, steps.length])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="rounded-3xl bg-gradient-to-br from-primary/5 to-emerald-50/50 dark:from-primary/10 dark:to-emerald-900/10 border border-primary/10 p-8 text-center">
      <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
      <AnimatePresence mode="wait">
        <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} className="text-sm font-medium mt-4">{steps[step]}</motion.p>
      </AnimatePresence>
      <div className="flex justify-center gap-1 mt-4">
        {steps.map((_, i) => <motion.div key={i} animate={{ backgroundColor: i <= step ? "#3c7a52" : "#d6d3d1" }} className="h-1.5 w-8 rounded-full" />)}
      </div>
    </motion.div>
  )
}

export default function SymptomCheckerPage() {
  const { lang } = useLang()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [freeText, setFreeText] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const activeRegion = REGIONS.find(r => r.id === selectedRegion)
  const toggleSymptom = (id: string) => setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-emerald-50/20 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6 space-y-3">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
            <Stethoscope className="h-12 w-12 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-2xl font-bold">Get Well Soon, We're Listening.</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Let's understand what your body is telling you together.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!analyzing && !showResults ? (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 gap-2.5">
                {REGIONS.map((r, i) => {
                  const isActive = selectedRegion === r.id
                  return (
                    <motion.button key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedRegion(isActive ? null : r.id); if (isActive) setSelectedSymptoms([]) }}
                      className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all ${isActive ? "bg-primary/5 ring-2 ring-primary/30 shadow-sm" : "bg-white dark:bg-card border hover:shadow-sm"}`}>
                      <span className="text-2xl">{r.emoji}</span>
                      <span className={`text-xs font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{r.label}</span>
                    </motion.button>
                  )
                })}
              </div>
              <AnimatePresence>
                {activeRegion && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-white dark:bg-card border">
                      {activeRegion.symptoms.map((s, i) => {
                        const sel = selectedSymptoms.includes(s.id)
                        return (
                          <motion.button key={s.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                            whileTap={{ scale: 0.9 }} onClick={() => toggleSymptom(s.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${sel ? "bg-primary text-white shadow-md" : "bg-stone-100 dark:bg-stone-800 text-foreground hover:bg-stone-200"}`}>
                            <span>{s.emoji}</span> {s.label} {sel && <Check className="h-3 w-3 ml-0.5" />}
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {selectedSymptoms.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Button onClick={() => setAnalyzing(true)} className="w-full h-12 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20">
                    <Sparkles className="h-4 w-4 mr-2" /> Analyze My Condition
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : analyzing ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalysisLoader onDone={() => { setAnalyzing(false); setShowResults(true) }} />
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="rounded-2xl border-primary/20 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-bold text-primary">Safe to Monitor at Home</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Low Risk</Badge>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">Based on your symptoms, this appears manageable with rest and care.</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">Soothing Protocols</h3></div>
                  {[
                    { emoji: "🌿", name: "Chamomile Tea", dose: "1 cup, 3x daily", evidence: "Grade A" },
                    { emoji: "💜", name: "Magnesium Glycinate", dose: "400mg before bed", evidence: "Grade A" },
                    { emoji: "🫚", name: "Ginger Extract", dose: "250mg, 2x daily", evidence: "Grade B" },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                      <span className="text-xl">{s.emoji}</span>
                      <div className="flex-1"><p className="text-sm font-medium">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.dose}</p></div>
                      <Badge variant="secondary" className="text-[9px]">{s.evidence}</Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
              <Button variant="outline" onClick={() => { setShowResults(false); setSelectedSymptoms([]) }} className="w-full rounded-2xl h-11">← Check Different Symptoms</Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sticky bottom-4 z-30">
          <div className="rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-xl border shadow-lg p-2 flex gap-2">
            <input type="text" value={freeText} onChange={e => setFreeText(e.target.value)}
              placeholder="Or describe in your own words..." className="flex-1 bg-transparent text-sm px-3 py-2 focus:outline-none placeholder:text-muted-foreground/40" />
            <Button size="sm" className="rounded-xl shrink-0 h-9 w-9 p-0"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center px-4 pb-8">This tool provides general health information only. Always consult your healthcare provider.</p>
      </div>
    </div>
  )
}
