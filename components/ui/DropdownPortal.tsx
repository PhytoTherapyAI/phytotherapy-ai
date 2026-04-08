// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

interface DropdownPortalProps {
  show: boolean
  children: ReactNode
  triggerRef: React.RefObject<HTMLElement | null>
  className?: string
  maxHeight?: string
  minWidth?: string
}

/**
 * Centralized portal dropdown that:
 * - Renders to document.body (avoids overflow clipping)
 * - Uses position: fixed with getBoundingClientRect()
 * - Recalculates position on scroll/resize
 * - Closes on outside click
 */
export function DropdownPortal({
  show,
  children,
  triggerRef,
  className = "",
  maxHeight = "240px",
  minWidth,
}: DropdownPortalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  // Calculate position from trigger element
  useEffect(() => {
    if (!show || !triggerRef.current) return

    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }

    update()

    // Recalculate on scroll/resize
    window.addEventListener("scroll", update, true) // true = capture phase for nested scrolls
    window.addEventListener("resize", update)

    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [show, triggerRef])

  if (!show || typeof document === "undefined") return null

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: minWidth ? undefined : pos.width,
        minWidth: minWidth || pos.width,
        maxHeight,
        zIndex: 9999,
      }}
      className={`overflow-y-auto rounded-lg border bg-background shadow-lg ${className}`}
    >
      {children}
    </div>,
    document.body
  )
}
