// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Dna, Heart, Globe, Sparkles,
  ExternalLink, Users, Pill, Leaf,
  ChevronRight, Shield, BookOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ═══ DNA ANIMATION ═══
function DnaSpinner() {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      className="relative h-16 w-16 mx-auto">
      <Dna className="h-16 w-16 text-teal-500" />
    </motion.div>
  )
}

// ═══ TYPEWRITER SEARCH ═══
function TypewriterSearch({ onSearch, lang }: { onSearch: (q: string) => void; lang: string }) {
  const [query, setQuery] = useState("")
  const [placeholder, setPlaceholder] = useState("")

  const placeholders = lang === "tr"
    ? ["Ehlers-Danlos Sendromu", "Wilson Hastalığı", "Gaucher Hastalığı", "Fenilketonüri"]
    : ["Ehlers-Danlos Syndrome", "Wilson's Disease", "Gaucher Disease", "Phenylketonuria"]

  useEffect(() => {
    let mounted = true
    let idx = 0; let charIdx = 0; let deleting = false; let pauseCount = 0
    const interval = setInterval(() => {
      if (!mounted) return
      const current = placeholders[idx]
      if (pauseCount > 0) { pauseCount--; return }
      if (!deleting) {
        charIdx++
        setPlaceholder(current.slice(0, charIdx))
        if (charIdx >= current.length) { deleting = true; pauseCount = 18 } // 18*80ms ≈ 1.5s pause
      } else {
        charIdx--
        setPlaceholder(current.slice(0, charIdx))
        if (charIdx <= 0) { deleting = false; idx = (idx + 1) % placeholders.length }
      }
    }, 80)
    return () => { mounted = false; clearInterval(interval) }
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input type="text" value={query} onChange={e => { setQuery(e.target.value); onSearch(e.target.value) }}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-teal-200/50 bg-white dark:bg-card pl-12 pr-4 py-4 text-sm shadow-lg shadow-teal-500/5 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/20 transition-all placeholder:text-muted-foreground/40" />
    </div>
  )
}

// ═══ MOCK RARE DISEASES ═══
interface RareDisease {
  id: string; name: string; nameTr: string; prevalence: string; category: string
  treatments: string[]; treatmentsTr: string[]; communities: number; phyto: string[]
}

const DISEASES: RareDisease[] = [
  {
    id: "eds", name: "Ehlers-Danlos Syndrome", nameTr: "Ehlers-Danlos Sendromu",
    prevalence: "1:5,000", category: "Connective Tissue",
    treatments: ["Physical therapy", "Pain management", "Joint protection"],
    treatmentsTr: ["Fizik tedavi", "Ağrı yönetimi", "Eklem koruması"],
    communities: 45000, phyto: ["Turmeric", "Collagen", "Vitamin C"],
  },
  {
    id: "wilson", name: "Wilson's Disease", nameTr: "Wilson Hastalığı",
    prevalence: "1:30,000", category: "Metabolic",
    treatments: ["Chelation therapy", "Zinc therapy", "Low-copper diet"],
    treatmentsTr: ["Şelasyon tedavisi", "Çinko tedavisi", "Düşük bakır diyeti"],
    communities: 12000, phyto: ["Zinc supplements", "Milk Thistle"],
  },
  {
    id: "gaucher", name: "Gaucher Disease", nameTr: "Gaucher Hastalığı",
    prevalence: "1:40,000", category: "Lysosomal Storage",
    treatments: ["Enzyme replacement", "Substrate reduction"],
    treatmentsTr: ["Enzim replasmanı", "Substrat azaltma"],
    communities: 8500, phyto: ["Curcumin", "Green Tea Extract"],
  },
]

export default function RareDiseasesPage() {
  const { lang } = useLang()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null)

  const filtered = searchQuery.trim()
    ? DISEASES.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.nameTr.toLowerCase().includes(searchQuery.toLowerCase()))
    : DISEASES

  const active = DISEASES.find(d => d.id === selectedDisease)

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-cyan-50/20 dark:from-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-6 space-y-3">
          <DnaSpinner />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Nadir Ama Yalnız Değilsiniz" : "Rare But Not Alone"}</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "tr" ? "Küresel araştırma ağına bağlanın, umut burada." : "Connect to the global research network. Hope lives here."}
          </p>
        </motion.div>

        {/* AI Detective Search */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <TypewriterSearch onSearch={setSearchQuery} lang={lang} />
        </motion.div>

        {/* Hope Widgets */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-2.5">
          {[
            { emoji: "💊", label: lang === "tr" ? "Yeni Tedaviler" : "New Treatments", count: "23" },
            { emoji: "🌍", label: lang === "tr" ? "Hasta Toplulukları" : "Patient Communities", count: "140+" },
            { emoji: "🌿", label: lang === "tr" ? "Fitoterapi Desteği" : "Phytotherapy Support", count: "45" },
          ].map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="rounded-2xl bg-white dark:bg-card border p-3 text-center hover:shadow-sm transition-shadow cursor-pointer">
              <span className="text-2xl">{w.emoji}</span>
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-1">{w.count}</p>
              <p className="text-[9px] text-muted-foreground">{w.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Disease Cards */}
        <div className="space-y-3">
          {filtered.map((d, i) => (
            <motion.button key={d.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDisease(selectedDisease === d.id ? null : d.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                selectedDisease === d.id
                  ? "bg-teal-50/50 dark:bg-teal-900/10 border-teal-300/50 shadow-sm"
                  : "bg-white dark:bg-card hover:shadow-sm"
              }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">{lang === "tr" ? d.nameTr : d.name}</h3>
                <Badge variant="secondary" className="text-[9px]">{d.prevalence}</Badge>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {d.communities.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Leaf className="h-3 w-3" /> {d.phyto.length} {lang === "tr" ? "fitoterapi" : "phyto"}</span>
              </div>

              <AnimatePresence>
                {selectedDisease === d.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 pt-3 border-t border-stone-200/50">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-teal-600">{lang === "tr" ? "Tedavi Yaklaşımları" : "Treatment Approaches"}</p>
                      {(lang === "tr" ? d.treatmentsTr : d.treatments).map((t, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-foreground">
                          <span className="text-teal-500">•</span> {t}
                        </div>
                      ))}
                      <p className="text-xs font-semibold text-teal-600 mt-2">{lang === "tr" ? "Destekleyici Fitoterapi" : "Supportive Phytotherapy"}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {d.phyto.map(p => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 border border-teal-200/50">{p}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{lang === "tr" ? "Sonuç bulunamadı." : "No results found."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
