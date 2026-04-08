// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, AlertTriangle, ArrowRightLeft, Plus, Star, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SupplementCardProps {
  name: string
  latinName: string
  trustScore: number
  category: string
  benefits: string[]
  evidenceGrade: "A" | "B" | "C"
  pubmedCount: number
  color: string
  emoji: string
  interaction?: {
    drug: string
    severity: "high" | "moderate"
    alternative: { name: string; emoji: string }
  }
  lang: string
  onAdd: () => void
}

export function SupplementCard({
  name, latinName, trustScore, category, benefits, evidenceGrade,
  pubmedCount, color, emoji, interaction, lang, onAdd,
}: SupplementCardProps) {
  const [showSwap, setShowSwap] = useState(false)

  const handleAdd = () => {
    if (interaction) {
      setShowSwap(true)
    } else {
      onAdd()
    }
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative rounded-3xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
      style={{ "--card-glow": color } as React.CSSProperties}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}15, transparent 70%)` }} />

      <AnimatePresence mode="wait">
        {!showSwap ? (
          <motion.div key="front" initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${color}15` }}>
                  {emoji}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{name}</h3>
                  <p className="text-[10px] text-muted-foreground italic">{latinName}</p>
                </div>
              </div>

              {/* Trust Score Badge */}
              <motion.div whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ backgroundColor: `${color}15`, color }}>
                <ShieldCheck className="h-3 w-3" />
                {trustScore}%
              </motion.div>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {benefits.map(b => (
                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-muted-foreground">
                  {b}
                </span>
              ))}
            </div>

            {/* Evidence */}
            <div className="flex items-center gap-3 mb-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" style={{ color }} />
                {lang === "tr" ? "Kanıt" : "Evidence"}: {evidenceGrade}
              </span>
              <span className="flex items-center gap-1">
                <ExternalLink className="h-2.5 w-2.5" />
                {pubmedCount} PubMed
              </span>
            </div>

            {/* Add button */}
            <Button onClick={handleAdd} size="sm" variant="outline"
              className="w-full rounded-xl h-9 text-xs font-medium hover:bg-primary hover:text-white transition-all">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {lang === "tr" ? "Listeye Ekle" : "Add to List"}
            </Button>
          </motion.div>
        ) : (
          /* Smart Swap — Interaction detected */
          <motion.div key="swap"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="p-5 relative z-10 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {lang === "tr" ? "Etkileşim Tespit Edildi!" : "Interaction Detected!"}
              </span>
            </div>
            <p className="text-xs text-amber-600/80 dark:text-amber-300/80 mb-3">
              {lang === "tr"
                ? `${interaction?.drug} ile etkileşim riski var.`
                : `Risk of interaction with ${interaction?.drug}.`}
            </p>

            {/* Smart Swap suggestion */}
            <div className="rounded-2xl bg-white/80 dark:bg-card/80 border border-emerald-200/50 p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {lang === "tr" ? "Akıllı Takas Önerisi" : "Smart Swap Suggestion"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xl">{interaction?.alternative.emoji}</span>
                <span className="text-sm font-semibold">{interaction?.alternative.name}</span>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                  {lang === "tr" ? "Güvenli" : "Safe"} ✓
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowSwap(false)}
                className="flex-1 rounded-xl text-xs h-9">
                {lang === "tr" ? "Geri" : "Back"}
              </Button>
              <Button size="sm" onClick={() => { setShowSwap(false); onAdd() }}
                className="flex-1 rounded-xl text-xs h-9 bg-emerald-500 hover:bg-emerald-600 text-white">
                {lang === "tr" ? "Takas Et" : "Swap"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
