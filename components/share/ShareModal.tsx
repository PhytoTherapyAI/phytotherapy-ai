// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

interface ShareModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * Portal-based modal that renders at document.body level.
 * Fixes z-index/stacking context issues when modals are inside Card components.
 * Supports: backdrop click, X button, Escape key.
 */
export function ShareModal({ open, onClose, children }: ShareModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, handleEscape])

  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className="relative z-10 max-h-[90vh] overflow-auto rounded-2xl bg-background p-5 shadow-2xl"
        style={{ animation: "scaleIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground hover:scale-110 active:scale-95"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  )
}
