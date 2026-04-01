// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Star, Check, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

const BENEFITS = [
  { id: "energy", emoji: "⚡", label: "Energy Boost" }, { id: "immunity", emoji: "🛡️", label: "Steel Immunity" },
  { id: "sleep", emoji: "🧘", label: "Deep Sleep" }, { id: "focus", emoji: "🧠", label: "Mind Opener" },
  { id: "heart", emoji: "❤️", label: "Heart Shield" }, { id: "beauty", emoji: "✨", label: "Glow Up" },
]

interface Product { id: string; name: string; brand: string; emoji: string; price: string; evidenceGrade: string; compatible: boolean; interaction?: string; benefit: string; rating: number; reviews: number }

const PRODUCTS: Product[] = [
  { id: "1", name: "Magnesium Bisglycinate 400mg", brand: "NOW Foods", emoji: "💜", price: "$18.99", evidenceGrade: "A", compatible: true, benefit: "sleep", rating: 4.8, reviews: 2340 },
  { id: "2", name: "Omega-3 Fish Oil 2000mg", brand: "Nordic Naturals", emoji: "🐟", price: "$29.99", evidenceGrade: "A", compatible: true, benefit: "heart", rating: 4.9, reviews: 5120 },
  { id: "3", name: "Ashwagandha KSM-66 600mg", brand: "Jarrow Formulas", emoji: "🌿", price: "$22.99", evidenceGrade: "A", compatible: true, benefit: "energy", rating: 4.7, reviews: 1890 },
  { id: "4", name: "Curcumin C3 Complex", brand: "Doctor's Best", emoji: "🟡", price: "$15.99", evidenceGrade: "A", compatible: true, benefit: "immunity", rating: 4.6, reviews: 3200 },
  { id: "5", name: "St. John's Wort 300mg", brand: "Nature's Way", emoji: "☀️", price: "$12.99", evidenceGrade: "B", compatible: false, interaction: "SSRI interaction risk", benefit: "focus", rating: 4.3, reviews: 980 },
  { id: "6", name: "Collagen Peptides Type I&III", brand: "Vital Proteins", emoji: "✨", price: "$24.99", evidenceGrade: "B", compatible: true, benefit: "beauty", rating: 4.7, reviews: 4500 },
]

export default function SupplementMarketplacePage() {
  const { lang } = useLang()
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null)
  const filtered = selectedBenefit ? PRODUCTS.filter(p => p.benefit === selectedBenefit) : PRODUCTS

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-primary">Curated Healing Boutique</h2>
          </div>
          <p className="text-[10px] text-muted-foreground">Only third-party tested, A-grade evidence formulas trusted by doctors.</p>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {BENEFITS.map((b, i) => {
            const isActive = selectedBenefit === b.id
            return (
              <motion.button key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedBenefit(isActive ? null : b.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${isActive ? "bg-primary text-white shadow-md" : "bg-white dark:bg-card border hover:shadow-sm"}`}>
                <span>{b.emoji}</span> {b.label}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((p, i) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                <Card className="rounded-2xl hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-2xl shrink-0">{p.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold">{p.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{p.brand}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center gap-0.5 text-[10px] text-amber-500"><Star className="h-3 w-3 fill-current" /> {p.rating}</div>
                          <span className="text-[9px] text-muted-foreground">({p.reviews.toLocaleString()})</span>
                          <Badge variant="secondary" className="text-[8px] px-1.5">Grade {p.evidenceGrade}</Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{p.price}</p>
                        <Button size="sm" variant="outline" className="rounded-full text-[10px] h-7 mt-1 px-3">Buy</Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
                      {p.compatible ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium"><Check className="h-3.5 w-3.5" /> 100% Compatible with Your Profile</div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-medium"><AlertTriangle className="h-3.5 w-3.5" /> {p.interaction}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}
