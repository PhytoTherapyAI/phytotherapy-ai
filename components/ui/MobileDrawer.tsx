// © 2026 DoctoPal — All Rights Reserved
//
// F-MOBILE-001 — shared left-side drawer for mobile-only UIs.
//
// Currently mounted by:
//   - components/profile-v2/ProfileShellV2.tsx (the 11-tab sidebar)
//   - app/health-assistant/page.tsx (the conversation history)
//
// Both surfaces ship the same pattern: a sticky hamburger button at
// the top of the scroll container opens this drawer, the drawer
// slides in from the left, tapping the dimmed backdrop or pressing
// Escape closes it. Selecting an item INSIDE the drawer is each
// parent's job to call `onClose` from its own selection handler so
// the drawer auto-collapses after a pick.
//
// The drawer is always `md:hidden` — at md+ (≥768px) the parent
// renders the sidebar inline as a sticky column instead. Putting the
// breakpoint guard on the drawer itself means a careless parent
// can't accidentally render the panel on desktop.
//
// Custom Framer Motion (rather than shadcn Sheet) because the project
// doesn't ship Sheet and adding it just for this would mean pulling
// in `vaul` or similar. Framer Motion is already a dependency.
"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/components/layout/language-toggle"

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Aria-label for the drawer panel. Defaults to a generic
   *  language-aware fallback. */
  label?: string
}

export function MobileDrawer({ open, onClose, children, label }: MobileDrawerProps) {
  const { lang } = useLang()
  const fallbackLabel = lang === "tr" ? "Yan menü" : "Side menu"

  // Escape closes the drawer. The listener is only attached while open
  // so the rest of the page keeps its native Escape behaviour. We
  // intentionally don't lock body scroll — the panel is itself
  // scrollable, and a body lock would break virtual-keyboard / scroll-
  // restoration on iOS in subtle ways.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop. Click closes; aria-hidden because the panel is
              the dialog surface and screen readers should target it. */}
          <motion.div
            key="mobile-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden
          />
          {/* Panel. Slides in from the left. We cap width at 85vw so
              very narrow phones still leave a sliver of backdrop tap
              target on the right. */}
          <motion.aside
            key="mobile-drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-background shadow-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={label ?? fallbackLabel}
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
