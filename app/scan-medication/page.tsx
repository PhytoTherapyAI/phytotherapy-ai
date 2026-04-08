// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ScanLine, Camera, Sparkles, Loader2, Shield,
  Pill, Leaf, FileText, Check, ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

function ScannerLaser() {
  return (
    <motion.div
      animate={{ y: [0, 200, 0] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_4px_rgba(52,211,153,0.4)]" />
  )
}

function ScanSteps({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const steps = ["Decoding barcode...", "Analyzing ingredients and active compounds...", "Scanning interactions with your profile..."]
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let mounted = true
    timerRef.current = setInterval(() => {
      if (!mounted) return
      setStep(s => {
        if (s >= steps.length - 1) { if (timerRef.current) clearInterval(timerRef.current); setTimeout(() => { if (mounted) onDone() }, 600); return s }
        return s + 1
      })
    }, 1200)
    return () => { mounted = false; if (timerRef.current) clearInterval(timerRef.current) }
  }, [onDone, steps.length])

  return (
    <div className="text-center mt-6">
      <AnimatePresence mode="wait">
        <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} className="text-xs font-medium text-emerald-300">{steps[step]}</motion.p>
      </AnimatePresence>
      <div className="flex justify-center gap-1 mt-3">
        {steps.map((_, i) => <motion.div key={i} animate={{ backgroundColor: i <= step ? "#34d399" : "#475569" }} className="h-1 w-6 rounded-full" />)}
      </div>
    </div>
  )
}

export default function ScanMedicationPage() {
  const { lang } = useLang()
  const [scanning, setScanning] = useState(false)
  const [showResults, setShowResults] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4 space-y-2">
          <ScanLine className="h-10 w-10 text-emerald-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Smart Health Lens</h1>
          <p className="text-xs text-slate-400">Point. Scan. Know everything about what you take.</p>
        </motion.div>

        {/* Viewfinder */}
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="viewfinder" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="relative">
              <div className="rounded-3xl bg-slate-800/80 backdrop-blur-md border border-slate-700/50 overflow-hidden aspect-[3/4] max-h-[400px] relative">
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-emerald-400/60 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-emerald-400/60 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-emerald-400/60 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-emerald-400/60 rounded-br-lg" />

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  {!scanning ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Camera className="h-16 w-16 text-emerald-400/60 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-sm font-medium text-slate-300">Show the Box or Barcode</p>
                      <p className="text-[10px] text-slate-500 mt-1">AI will detect what it is automatically</p>
                    </motion.div>
                  ) : (
                    <>
                      <ScannerLaser />
                      <ScanSteps onDone={() => { setScanning(false); setShowResults(true) }} />
                    </>
                  )}
                </div>
              </div>

              {/* Capture Button */}
              {!scanning && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-5">
                  <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                    onClick={() => setScanning(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/25">
                    <Sparkles className="h-4 w-4" /> Scan Now
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Product Card */}
              <Card className="rounded-2xl bg-slate-800/80 border-slate-700/50 text-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Pill className="h-6 w-6 text-emerald-400" /></div>
                    <div>
                      <h3 className="text-base font-bold">Magnesium Bisglycinate</h3>
                      <p className="text-xs text-slate-400">NOW Foods — 200mg, 120 capsules</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">✅ Compatible with Profile</Badge>
                    <Badge className="bg-slate-700 text-slate-300 text-[10px]">Grade A Evidence</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <Card className="rounded-2xl bg-slate-800/80 border-slate-700/50 text-white">
                <CardContent className="p-5 space-y-2">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-400" /> Active Compounds</h3>
                  {["Magnesium (as Bisglycinate) — 200mg", "Glycine — natural chelation", "Vegetable cellulose capsule"].map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 text-xs text-slate-300"><Check className="h-3 w-3 text-emerald-400" /> {c}</motion.div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={() => { setShowResults(false) }}
                className="w-full rounded-2xl h-11 bg-emerald-500 hover:bg-emerald-600 text-white">
                <ScanLine className="h-4 w-4 mr-2" /> Scan Another
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Try This chips */}
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Try This</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {[
              { emoji: "💊", label: "Scan Your Vitamin Box" },
              { emoji: "📄", label: "Upload Blood Test PDF" },
              { emoji: "🌿", label: "Check Supplement Ingredients" },
            ].map(c => (
              <button key={c.label} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:border-emerald-500/50 transition-colors">
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
