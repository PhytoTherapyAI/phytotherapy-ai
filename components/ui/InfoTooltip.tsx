// © 2026 Doctopal — All Rights Reserved
"use client"
import { useState } from "react"
import { HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface InfoTooltipProps {
  title: string
  description: string
}

export function InfoTooltip({ title, description }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="More info"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-7 z-50 w-64 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-md p-4 shadow-lg dark:bg-slate-900/90 dark:border-slate-700"
            >
              <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
