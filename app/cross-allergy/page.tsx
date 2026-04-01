// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertTriangle, Check, ChevronRight, Search, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

interface AllergyNode {
  id: string; label: string; emoji: string; color: string
  connections: Array<{ id: string; label: string; emoji: string; risk: "high" | "moderate"; reason: string; safe?: { name: string; emoji: string } }>
}

const ALLERGY_MAP: AllergyNode[] = [
  { id: "peanut", label: "Peanut Allergy", emoji: "🥜", color: "#ef4444",
    connections: [
      { id: "lupin", label: "Lupin", emoji: "🌾", risk: "high", reason: "Your body confuses the protein shape of peanut and lupin like twins.", safe: { name: "Sunflower Seeds", emoji: "🌻" } },
      { id: "soy", label: "Soy", emoji: "🫘", risk: "moderate", reason: "Shared legume family — similar protein structures.", safe: { name: "Coconut Aminos", emoji: "🥥" } },
      { id: "tree-nuts", label: "Tree Nuts", emoji: "🌰", risk: "moderate", reason: "Cross-reactive proteins (Ara h 8).", safe: { name: "Pumpkin Seeds", emoji: "🎃" } },
    ]},
  { id: "penicillin", label: "Penicillin", emoji: "💊", color: "#3b82f6",
    connections: [
      { id: "cephalosporin", label: "Cephalosporin", emoji: "💉", risk: "moderate", reason: "Your body confuses the chemical shape of Penicillin and Cephalosporin like twins." },
      { id: "carbapenem", label: "Carbapenem", emoji: "🔬", risk: "high", reason: "Beta-lactam ring structure similarity." },
    ]},
  { id: "latex", label: "Latex", emoji: "🧤", color: "#8b5cf6",
    connections: [
      { id: "banana", label: "Banana", emoji: "🍌", risk: "high", reason: "Latex-fruit syndrome — shared proteins (hevein-like).", safe: { name: "Apple", emoji: "🍎" } },
      { id: "avocado", label: "Avocado", emoji: "🥑", risk: "high", reason: "Class I chitinase proteins cross-react with latex.", safe: { name: "Cucumber", emoji: "🥒" } },
      { id: "kiwi", label: "Kiwi", emoji: "🥝", risk: "moderate", reason: "Actinidin enzyme similarity." },
    ]},
  { id: "dust", label: "Dust Mite", emoji: "🦠", color: "#f59e0b",
    connections: [
      { id: "shrimp", label: "Shrimp", emoji: "🦐", risk: "high", reason: "Tropomyosin protein cross-reactivity.", safe: { name: "White Fish", emoji: "🐟" } },
      { id: "cockroach", label: "Cockroach", emoji: "🪳", risk: "moderate", reason: "Shared tropomyosin allergens." },
    ]},
]

function ConnectionWeb({ node, lang }: { node: AllergyNode; lang: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Center node */}
      <div className="flex justify-center mb-4">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          className="h-16 w-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
          style={{ backgroundColor: `${node.color}15`, boxShadow: `0 0 20px ${node.color}30` }}>
          {node.emoji}
        </motion.div>
      </div>

      {/* Connection cards */}
      {node.connections.map((conn, i) => (
        <motion.div key={conn.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}>
          <Card className={`rounded-2xl overflow-hidden ${conn.risk === "high" ? "border-red-200/50" : "border-amber-200/50"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{conn.emoji}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">{conn.label}</h4>
                  <Badge className={`text-[8px] ${conn.risk === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {conn.risk === "high" ? "High Risk" : "Moderate Risk"}
                  </Badge>
                </div>
              </div>

              {/* Trivia card */}
              <div className="rounded-xl bg-stone-50 dark:bg-stone-900/50 p-3 mb-2">
                <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                  <Search className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                  <span><strong>Why Connected?</strong> {conn.reason}</span>
                </p>
              </div>

              {conn.safe && (
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Safe Alternative: {conn.safe.emoji} {conn.safe.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function CrossAllergyPage() {
  const { lang } = useLang()
  const [selectedAllergy, setSelectedAllergy] = useState<string | null>(null)
  const [myShield, setMyShield] = useState<string | null>(null)
  const active = ALLERGY_MAP.find(a => a.id === selectedAllergy)

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-3 space-y-1">
          <Shield className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Biological Detective Radar</h1>
          <p className="text-xs text-muted-foreground">Discover hidden connections between your allergies.</p>
        </motion.div>

        {/* Allergy chips */}
        <div className="grid grid-cols-2 gap-2.5">
          {ALLERGY_MAP.map((a, i) => {
            const isActive = selectedAllergy === a.id
            return (
              <motion.button key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAllergy(isActive ? null : a.id)}
                className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all ${
                  isActive ? "ring-2 shadow-md bg-white dark:bg-card" : "bg-white dark:bg-card border hover:shadow-sm"
                }`}
                style={isActive ? { boxShadow: `0 0 0 2px ${a.color}, 0 4px 16px ${a.color}20` } : undefined}>
                <span className="text-2xl">{a.emoji}</span>
                <div>
                  <p className={`text-xs font-bold ${isActive ? "" : "text-foreground"}`} style={isActive ? { color: a.color } : undefined}>{a.label}</p>
                  <p className="text-[9px] text-muted-foreground">{a.connections.length} connections</p>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Connection Web */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ConnectionWeb node={active} lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Shield */}
        {selectedAllergy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="rounded-2xl bg-primary/5 border-primary/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-primary">Pin as My Shield</p>
                  <p className="text-[10px] text-muted-foreground">Get personalized cross-allergy alerts based on this allergy.</p>
                </div>
                <Button size="sm" className="rounded-xl text-xs h-8 shrink-0">
                  {myShield === selectedAllergy ? <Check className="h-3.5 w-3.5" /> : "Pin"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
