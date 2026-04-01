// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plane, Globe, Shield, Syringe, Leaf,
  MapPin, Sun, Mountain, Building, Tent,
  ChevronRight, Loader2, Check, AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ═══ ROUTE CHIPS ═══
interface Route {
  id: string; label: string; labelTr: string; emoji: string; color: string
  vaccines: string[]; flora: string[]; tips: string[]; tipsTr: string[]
}

const ROUTES: Route[] = [
  {
    id: "sea", label: "Southeast Asia (Malaria)", labelTr: "Güneydoğu Asya (Sıtma)",
    emoji: "🌴", color: "#16a34a",
    vaccines: ["Hepatitis A/B", "Typhoid", "Japanese Encephalitis"],
    flora: ["Artemisinin (Artemisia)", "Citronella", "Neem Oil"],
    tips: ["Use DEET insect repellent", "Sleep under mosquito nets", "Prophylactic antimalarials"],
    tipsTr: ["DEET böcek kovucu kullanın", "Cibinlik altında uyuyun", "Profilaktik sıtma ilacı"],
  },
  {
    id: "africa", label: "Africa Safari (Yellow Fever)", labelTr: "Afrika Safari (Sarı Humma)",
    emoji: "🦁", color: "#f59e0b",
    vaccines: ["Yellow Fever (required)", "Meningococcal", "Rabies"],
    flora: ["Moringa", "Baobab Extract", "African Wormwood"],
    tips: ["Yellow fever certificate mandatory", "Avoid bush meat", "Purify all water"],
    tipsTr: ["Sarı humma sertifikası zorunlu", "Çalı etinden kaçının", "Tüm suyu arıtın"],
  },
  {
    id: "altitude", label: "High Altitude", labelTr: "Yüksek İrtifa",
    emoji: "🏔️", color: "#6366f1",
    vaccines: [],
    flora: ["Rhodiola Rosea", "Ginkgo Biloba", "Coca Leaf Tea"],
    tips: ["Ascend slowly (300m/day above 3000m)", "Hydrate 3-4L/day", "Acetazolamide if prescribed"],
    tipsTr: ["Yavaş yükselin (3000m üstü günde 300m)", "Günde 3-4L su için", "Reçeteli Asetazolamid"],
  },
  {
    id: "tropical", label: "Tropical Beach", labelTr: "Tropikal Plaj",
    emoji: "🏖️", color: "#ef4444",
    vaccines: ["Hepatitis A", "Typhoid"],
    flora: ["Aloe Vera", "Turmeric (anti-inflammatory)", "Ginger (nausea)"],
    tips: ["SPF 50+ sunscreen", "Rehydration salts", "Avoid raw seafood"],
    tipsTr: ["SPF 50+ güneş kremi", "Rehidrasyon tuzları", "Çiğ deniz ürünlerinden kaçının"],
  },
]

// ═══ LABOR ILLUSION LOADING ═══
function ScanningLoader({ lang }: { lang: string }) {
  const [step, setStep] = useState(0)
  const steps = [
    lang === "tr" ? "Aşı gereksinimleri taranıyor..." : "Scanning vaccine requirements...",
    lang === "tr" ? "Yerel flora analiz ediliyor..." : "Analyzing local flora...",
    lang === "tr" ? "Sağlık riskleri değerlendiriliyor..." : "Evaluating health risks...",
    lang === "tr" ? "Sonuçlar hazırlanıyor..." : "Preparing results...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % steps.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="rounded-2xl bg-gradient-to-r from-sky-50 to-orange-50 dark:from-sky-900/10 dark:to-orange-900/10 border p-6 text-center">
      <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin mb-3" />
      <AnimatePresence mode="wait">
        <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm font-medium text-foreground">
          {steps[step]}
        </motion.p>
      </AnimatePresence>
      <div className="flex justify-center gap-1 mt-3">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 w-6 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-stone-200"}`} />
        ))}
      </div>
    </motion.div>
  )
}

export default function TravelHealthPage() {
  const { lang } = useLang()
  const [travelType, setTravelType] = useState<"resort" | "backpack">("resort")
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const active = ROUTES.find(r => r.id === selectedRoute)

  const startScan = (routeId: string) => {
    setSelectedRoute(routeId)
    setScanning(true)
    setShowResults(false)
    setTimeout(() => { setScanning(false); setShowResults(true) }, 4000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/30 to-orange-50/20 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 space-y-2">
          <Globe className="h-10 w-10 text-sky-500 mx-auto" />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Global Sağlık Radarı" : "Global Health Radar"}</h1>
          <p className="text-sm text-muted-foreground">{lang === "tr" ? "Güvenli seyahatin sağlık rehberi." : "Your health guide for safe travel."}</p>
        </motion.div>

        {/* Context Switcher */}
        <div className="flex bg-white dark:bg-card rounded-xl border p-1 gap-1">
          {(["resort", "backpack"] as const).map(t => (
            <motion.button key={t} whileTap={{ scale: 0.95 }}
              onClick={() => setTravelType(t)}
              className={`relative flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                travelType === t ? "text-white" : "text-muted-foreground"
              }`}>
              {travelType === t && (
                <motion.div layoutId="travelType" className="absolute inset-0 bg-sky-500 rounded-lg shadow"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {t === "resort" ? <Building className="h-3.5 w-3.5" /> : <Tent className="h-3.5 w-3.5" />}
                {t === "resort" ? (lang === "tr" ? "Resort / Şehir" : "Resort / City") : (lang === "tr" ? "Doğa / Sırt Çantası" : "Nature / Backpack")}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Route Chips */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {lang === "tr" ? "Rota Seçin" : "Select Route"}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {ROUTES.map((r, i) => (
              <motion.button key={r.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startScan(r.id)}
                className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all ${
                  selectedRoute === r.id
                    ? "ring-2 bg-white dark:bg-card shadow-md"
                    : "bg-white dark:bg-card border hover:shadow-sm"
                }`}
                style={selectedRoute === r.id ? { boxShadow: `0 0 0 2px ${r.color}` } : undefined}>
                <span className="text-2xl">{r.emoji}</span>
                <div>
                  <p className="text-xs font-bold">{lang === "tr" ? r.labelTr : r.label}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Scanning / Results */}
        <AnimatePresence mode="wait">
          {scanning && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanningLoader lang={lang} />
            </motion.div>
          )}

          {showResults && active && (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4">
              {/* Vaccines */}
              {active.vaccines.length > 0 && (
                <Card className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Syringe className="h-4 w-4 text-sky-500" />
                      <h3 className="text-sm font-bold">{lang === "tr" ? "Gerekli Aşılar" : "Required Vaccines"}</h3>
                    </div>
                    {active.vaccines.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm py-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" /> {v}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Flora */}
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold">{lang === "tr" ? "Destekleyici Flora" : "Supportive Flora"}</h3>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {active.flora.map(f => (
                      <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">{f}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-sky-500" />
                    <h3 className="text-sm font-bold">{lang === "tr" ? "Güvenlik İpuçları" : "Safety Tips"}</h3>
                  </div>
                  {(lang === "tr" ? active.tipsTr : active.tips).map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm py-1">
                      <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> {t}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
