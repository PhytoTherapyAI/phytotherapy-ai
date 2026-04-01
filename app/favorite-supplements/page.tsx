// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Plus, Sparkles, Bookmark, Check, ChevronRight, Folder } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

const FOLDERS = [
  { id: "supps", label: "My Supplements", emoji: "💊", count: 0 },
  { id: "protocols", label: "Natural Protocols", emoji: "🌿", count: 0 },
  { id: "reports", label: "Symptom Reports", emoji: "📋", count: 0 },
]

const STACKS = [
  { id: "workout", emoji: "🏋️", label: "Pre-Workout Essential Pack", items: ["Creatine", "Beta-Alanine", "Caffeine + L-Theanine"], color: "#f59e0b" },
  { id: "exam", emoji: "📚", label: "Exam Week Focus Stack", items: ["Bacopa Monnieri", "Lion's Mane", "Omega-3"], color: "#6366f1" },
  { id: "sleep", emoji: "😴", label: "Deep Sleep Protocol", items: ["Magnesium", "Valerian Root", "L-Theanine"], color: "#8b5cf6" },
]

const TRENDING = ["Magnesium Bisglycinate", "Ashwagandha", "D3+K2 Vitamin", "Omega-3 EPA/DHA", "Curcumin", "Probiotics"]

export default function FavoriteSupplementsPage() {
  const { lang } = useLang()
  const [addedStacks, setAddedStacks] = useState<string[]>([])
  const [showConfetti, setShowConfetti] = useState<string | null>(null)

  const addStack = (id: string) => {
    setAddedStacks(prev => [...prev, id])
    setShowConfetti(id)
    setTimeout(() => setShowConfetti(null), 1000)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Vault Hero */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-br from-primary/5 to-emerald-50/50 dark:from-primary/10 dark:to-emerald-900/10 border border-primary/10 p-8 text-center relative overflow-hidden">
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent pointer-events-none" />
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
            <Shield className="h-14 w-14 text-primary mx-auto relative z-10" />
          </motion.div>
          <h1 className="text-2xl font-bold mt-4 relative z-10">Your Personal Healing Vault Awaits</h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto relative z-10">
            Add evidence-based supplements, healing protocols and articles to build your biological arsenal.
          </p>
        </motion.div>

        {/* Categorical Folders */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {FOLDERS.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-card border min-w-[160px]">
              <span className="text-xl">{f.emoji}</span>
              <div>
                <p className="text-xs font-bold">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.count} items</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Starter Stacks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Starter Stacks</h2>
          </div>
          <div className="space-y-3">
            {STACKS.map((stack, i) => {
              const isAdded = addedStacks.includes(stack.id)
              return (
                <motion.div key={stack.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="relative overflow-hidden">
                  <Card className={`rounded-2xl transition-all ${isAdded ? "ring-2 ring-emerald-400" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${stack.color}15` }}>{stack.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold">{stack.label}</h3>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {stack.items.map(item => (
                              <span key={item} className="text-[9px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-muted-foreground">{item}</span>
                            ))}
                          </div>
                        </div>
                        <Button size="sm" variant={isAdded ? "ghost" : "default"} className="rounded-xl text-[10px] h-8 shrink-0"
                          onClick={() => !isAdded && addStack(stack.id)} disabled={isAdded}>
                          {isAdded ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <><Plus className="h-3 w-3 mr-1" /> Add All</>}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Confetti */}
                  {showConfetti === stack.id && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <motion.div key={j} initial={{ x: "50%", y: "50%", scale: 1, opacity: 1 }}
                          animate={{ x: `${10 + Math.random() * 80}%`, y: `${Math.random() * 80}%`, scale: 0, opacity: 0 }}
                          transition={{ duration: 0.7, delay: j * 0.03 }}
                          className="absolute w-2 h-2 rounded-full"
                          style={{ backgroundColor: ["#22c55e", "#facc15", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c", "#34d399", "#3c7a52", "#ef4444", "#06b6d4"][j] }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Trending Marquee */}
        <div className="rounded-2xl bg-white dark:bg-card border p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Community's Top Favorites Today</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {TRENDING.map(t => (
              <span key={t} className="shrink-0 px-3 py-1.5 rounded-full bg-primary/5 text-xs font-medium text-primary border border-primary/10">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
