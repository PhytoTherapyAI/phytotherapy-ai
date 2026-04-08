// © 2026 DoctoPal — All Rights Reserved
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
              className="absolute left-1/2 top-8 z-50 w-[280px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-4 shadow-xl dark:bg-slate-900/95 dark:border-slate-700"
              style={{ maxWidth: "calc(100vw - 32px)", wordWrap: "break-word" }}
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
