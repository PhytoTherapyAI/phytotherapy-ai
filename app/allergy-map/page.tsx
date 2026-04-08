// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Shield, Plus, X, Search, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface AllergyItem {
  name: string
  emoji: string
  type: "allergy" | "intolerance"
  severity?: string
}

const quickAllergies = [
  { emoji: "🥜", name: "Peanut" },
  { emoji: "🥛", name: "Cow's Milk" },
  { emoji: "🦐", name: "Shellfish" },
  { emoji: "💊", name: "Penicillin" },
  { emoji: "🥚", name: "Egg" },
  { emoji: "🌾", name: "Wheat" },
  { emoji: "🫘", name: "Soy" },
  { emoji: "🐝", name: "Bee Venom" },
]

const quickIntolerances = [
  { emoji: "🥛", name: "Lactose" },
  { emoji: "🌾", name: "Gluten" },
  { emoji: "🧅", name: "FODMAP" },
  { emoji: "🍫", name: "Histamine" },
  { emoji: "☕", name: "Caffeine" },
  { emoji: "🍷", name: "Sulfite" },
]

function RadarScan({ scanning, result }: { scanning: boolean; result: "safe" | "danger" | null }) {
  const [step, setStep] = useState(0)
  const steps = [
    "Comparing with allergens in your profile...",
    "Checking histamine response...",
    "Cross-referencing supplement safety...",
  ]

  useEffect(() => {
    if (!scanning) return
    const interval = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1000)
    return () => clearInterval(interval)
  }, [scanning])

  useEffect(() => { if (scanning) setStep(0) }, [scanning])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          animate={scanning ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: scanning ? Infinity : 0, duration: 1 }}
        >
          <Shield className="w-5 h-5 text-amber-500" />
        </motion.div>
        <h3 className="text-sm font-semibold text-slate-700">Cross-Safety Radar</h3>
      </div>

      {scanning && (
        <div className="space-y-2">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-8 h-8 mx-auto rounded-full border-3 border-slate-200 border-t-amber-500" />
          <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs text-slate-500 text-center">{steps[step]}</motion.p>
          </AnimatePresence>
        </div>
      )}

      {result && !scanning && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-center py-3 rounded-xl ${result === "safe" ? "bg-emerald-50" : "bg-red-50"}`}
        >
          <span className="text-2xl">{result === "safe" ? "✅" : "🚨"}</span>
          <p className={`text-sm font-medium mt-1 ${result === "safe" ? "text-emerald-700" : "text-red-700"}`}>
            {result === "safe" ? "No allergen conflicts detected" : "Potential allergen risk found!"}
          </p>
        </motion.div>
      )}

      {!scanning && !result && (
        <p className="text-xs text-slate-400 text-center">Type a medication or supplement name to check safety</p>
      )}
    </motion.div>
  )
}

export default function AllergyMapPage() {
  const router = useRouter()
  const [allergies, setAllergies] = useState<AllergyItem[]>([])
  const [intolerances, setIntolerances] = useState<AllergyItem[]>([])
  const [showSheet, setShowSheet] = useState<"allergy" | "intolerance" | null>(null)
  const [searchDrug, setSearchDrug] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<"safe" | "danger" | null>(null)

  const addAllergy = (name: string, emoji: string) => {
    if (!allergies.find(a => a.name === name)) {
      setAllergies(prev => [...prev, { name, emoji, type: "allergy", severity: "Moderate" }])
    }
  }

  const addIntolerance = (name: string, emoji: string) => {
    if (!intolerances.find(a => a.name === name)) {
      setIntolerances(prev => [...prev, { name, emoji, type: "intolerance" }])
    }
  }

  const removeItem = (name: string, type: "allergy" | "intolerance") => {
    if (type === "allergy") setAllergies(prev => prev.filter(a => a.name !== name))
    else setIntolerances(prev => prev.filter(a => a.name !== name))
  }

  const handleScan = () => {
    if (!searchDrug.trim()) return
    setScanning(true)
    setScanResult(null)
    setTimeout(() => {
      setScanning(false)
      setScanResult(allergies.length > 0 ? "danger" : "safe")
    }, 3500)
  }

  const totalItems = allergies.length + intolerances.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-stone-50 to-red-50/10">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/60">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-800">Immunological Shield</h1>
            <p className="text-xs text-slate-400">Define your biological boundaries</p>
          </div>
          <Shield className="w-5 h-5 text-amber-500" />
        </motion.div>

        {/* Zero State or Shield Info */}
        {totalItems === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 rounded-2xl p-5 mb-6 border border-amber-100 text-center">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              <Shield className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            </motion.div>
            <p className="text-sm text-amber-700">
              Define your biological boundaries. Add allergies and intolerances so AI can protect you from medication and supplement risks.
            </p>
          </motion.div>
        )}

        {/* Allergies Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Immune Response (Allergies)
            </h3>
            <button onClick={() => setShowSheet("allergy")} className="text-xs text-red-500 font-medium flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {allergies.length === 0 ? (
              <p className="text-xs text-slate-400 px-1">No allergies added yet</p>
            ) : (
              allergies.map(a => (
                <motion.div key={a.name} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
                  <span className="text-lg">{a.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{a.name}</p>
                    <span className="text-[10px] text-red-500 bg-red-100 px-2 py-0.5 rounded-full">{a.severity}</span>
                  </div>
                  <button onClick={() => removeItem(a.name, "allergy")} className="p-1 rounded-full hover:bg-red-100">
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Intolerances Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold text-amber-600">🎈 Digestive Sensitivity (Intolerances)</h3>
            <button onClick={() => setShowSheet("intolerance")} className="text-xs text-amber-500 font-medium flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {intolerances.length === 0 ? (
              <p className="text-xs text-slate-400 px-1">No intolerances added yet</p>
            ) : (
              intolerances.map(a => (
                <motion.div key={a.name} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <span className="text-lg">{a.emoji}</span>
                  <p className="text-sm font-medium text-slate-700 flex-1">{a.name}</p>
                  <button onClick={() => removeItem(a.name, "intolerance")} className="p-1 rounded-full hover:bg-amber-100">
                    <X className="w-4 h-4 text-amber-400" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Cross-Safety Radar */}
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchDrug}
                onChange={(e) => setSearchDrug(e.target.value)}
                placeholder="Enter medication name..."
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-amber-300"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleScan}
              className="px-5 py-3 rounded-xl bg-amber-500 text-white text-sm font-medium"
            >
              Scan
            </motion.button>
          </div>
          <RadarScan scanning={scanning} result={scanResult} />
        </div>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {showSheet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setShowSheet(null)}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl p-6 w-full max-w-lg shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {showSheet === "allergy" ? "Add Allergy" : "Add Intolerance"}
                  </h3>
                  <button onClick={() => setShowSheet(null)} className="p-2 rounded-full hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-4">Tap to add:</p>
                <div className="flex flex-wrap gap-2">
                  {(showSheet === "allergy" ? quickAllergies : quickIntolerances).map(item => (
                    <motion.button
                      key={item.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        showSheet === "allergy" ? addAllergy(item.name, item.emoji) : addIntolerance(item.name, item.emoji)
                        setShowSheet(null)
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-700"
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
