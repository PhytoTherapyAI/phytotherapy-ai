// © 2026 Doctopal — All Rights Reserved
"use client"

import { motion } from "framer-motion"
import { Moon, Brain, Shield, Apple, Zap, Heart } from "lucide-react"

interface Category {
  id: string
  label: string
  emoji: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface CategoryBentoProps {
  selected: string | null
  onSelect: (id: string) => void
  lang: string
}

const CATEGORIES_EN: Category[] = [
  { id: "sleep", label: "Sleep", emoji: "🌙", icon: <Moon className="h-5 w-5" />, color: "#6366f1", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
  { id: "focus", label: "Focus", emoji: "🧠", icon: <Brain className="h-5 w-5" />, color: "#8b5cf6", bgColor: "bg-violet-50 dark:bg-violet-900/20" },
  { id: "immunity", label: "Immunity", emoji: "🛡️", icon: <Shield className="h-5 w-5" />, color: "#3c7a52", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
  { id: "digestion", label: "Digestion", emoji: "🍏", icon: <Apple className="h-5 w-5" />, color: "#16a34a", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { id: "energy", label: "Energy", emoji: "⚡", icon: <Zap className="h-5 w-5" />, color: "#f59e0b", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "heart", label: "Heart", emoji: "❤️", icon: <Heart className="h-5 w-5" />, color: "#ef4444", bgColor: "bg-red-50 dark:bg-red-900/20" },
]

const CATEGORIES_TR: Category[] = [
  { id: "sleep", label: "Uyku", emoji: "🌙", icon: <Moon className="h-5 w-5" />, color: "#6366f1", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
  { id: "focus", label: "Odak", emoji: "🧠", icon: <Brain className="h-5 w-5" />, color: "#8b5cf6", bgColor: "bg-violet-50 dark:bg-violet-900/20" },
  { id: "immunity", label: "Bağışıklık", emoji: "🛡️", icon: <Shield className="h-5 w-5" />, color: "#3c7a52", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
  { id: "digestion", label: "Sindirim", emoji: "🍏", icon: <Apple className="h-5 w-5" />, color: "#16a34a", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { id: "energy", label: "Enerji", emoji: "⚡", icon: <Zap className="h-5 w-5" />, color: "#f59e0b", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "heart", label: "Kalp", emoji: "❤️", icon: <Heart className="h-5 w-5" />, color: "#ef4444", bgColor: "bg-red-50 dark:bg-red-900/20" },
]

export function CategoryBento({ selected, onSelect, lang }: CategoryBentoProps) {
  const cats = lang === "tr" ? CATEGORIES_TR : CATEGORIES_EN

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cats.map((cat, i) => {
        const isActive = selected === cat.id
        return (
          <motion.button key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
            whileTap={{ scale: 0.93 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(isActive ? "" : cat.id)}
            className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-4 transition-all duration-200 ${
              isActive
                ? "ring-2 shadow-md"
                : `${cat.bgColor} hover:shadow-sm`
            }`}
            style={isActive ? {
              ringColor: cat.color,
              borderColor: cat.color,
              backgroundColor: `${cat.color}15`,
              boxShadow: `0 4px 16px ${cat.color}20`,
            } : undefined}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className={`text-[11px] font-semibold ${isActive ? "" : "text-muted-foreground"}`}
              style={isActive ? { color: cat.color } : undefined}>
              {cat.label}
            </span>
            {isActive && (
              <motion.div layoutId="catIndicator"
                className="absolute inset-0 rounded-2xl border-2"
                style={{ borderColor: cat.color }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
