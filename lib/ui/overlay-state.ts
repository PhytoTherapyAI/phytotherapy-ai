// © 2026 DoctoPal — All Rights Reserved
//
// F-CHECKIN-MOBILE-001 — global "is any blocking overlay on screen?"
// signal so the FloatingActionButton (FeedbackWidget on /) can hide
// itself when a modal / bottom-sheet / toast is taking the user's
// attention. On mobile the FAB sits at bottom-right z-50 — same
// physical neighbourhood as sonner's toast and the same z-plane as
// fixed-position modals — so left alone it overlaps both.
//
// Two sources feed the signal:
//
//   1. Refcounted modal pushes/pops — components opt in by calling
//      `pushOverlay()` on mount and `popOverlay()` on unmount inside
//      a useEffect cleanup. Counted (not boolean) so two modals open
//      at once don't fight each other for the same flag.
//
//   2. Sonner toast tracking — sonner doesn't expose toast lifecycle
//      to React, so we watch its DOM container instead. A
//      MutationObserver on `[data-sonner-toaster]` recounts
//      `[data-sonner-toast]` children whenever the subtree mutates.
//      The container itself is created lazily by AppToaster, so a
//      bootstrap observer on document.body waits for it to appear and
//      then hands off.
//
// Hook contract: `useOverlayActive()` returns true while EITHER
// counter is > 0. Components observe; emit is fire-and-forget. The
// hook hydrates with the current snapshot on mount so a slow-mount
// FAB doesn't flash visible while a modal is already open.
"use client"

import { useEffect, useState } from "react"

const EVENT_NAME = "doctopal:overlay-state"

// Module-level state. Next.js client components share module
// instances within a tab, so two FABs subscribing get the same
// counters. SSR-safe because all access is guarded by typeof window.
let modalRefCount = 0
let toastCount = 0

function isActive(): boolean {
  return modalRefCount > 0 || toastCount > 0
}

function emit() {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<{ active: boolean }>(EVENT_NAME, {
      detail: { active: isActive() },
    }),
  )
}

/**
 * Increment the modal counter and notify listeners. Call on mount
 * (inside a useEffect) when a fixed/blocking overlay opens.
 */
export function pushOverlay() {
  modalRefCount += 1
  emit()
}

/**
 * Decrement the modal counter and notify listeners. Call from the
 * useEffect cleanup that paired with `pushOverlay()`.
 */
export function popOverlay() {
  modalRefCount = Math.max(0, modalRefCount - 1)
  emit()
}

// ── Sonner toast tracking ──────────────────────────────────────────
//
// Side-effect block runs once per module load on the client. Server
// renders are short-circuited by the typeof window guard. Hot-reload
// in dev re-runs the module, which is harmless — the observers only
// fire on real DOM mutations and we always recount from scratch
// rather than incrementing.
if (typeof window !== "undefined") {
  let toastObserver: MutationObserver | null = null

  const recountToasts = (root: Element) => {
    const next = root.querySelectorAll("[data-sonner-toast]").length
    if (next === toastCount) return
    toastCount = next
    emit()
  }

  const attachToastObserver = (root: HTMLElement) => {
    if (toastObserver) return
    recountToasts(root)
    toastObserver = new MutationObserver(() => recountToasts(root))
    toastObserver.observe(root, { childList: true, subtree: true })
  }

  const tryFindContainer = (): HTMLElement | null => {
    return document.querySelector(
      "[data-sonner-toaster]",
    ) as HTMLElement | null
  }

  // The sonner container is rendered by <AppToaster /> inside our root
  // layout, but module evaluation can race ahead of React mount. If
  // it's already there, attach immediately. Otherwise watch document
  // body until it shows up, then hand off.
  const initial = tryFindContainer()
  if (initial) {
    attachToastObserver(initial)
  } else {
    const bootstrap = new MutationObserver(() => {
      const found = tryFindContainer()
      if (found) {
        attachToastObserver(found)
        bootstrap.disconnect()
      }
    })
    bootstrap.observe(document.body, { childList: true, subtree: true })
  }
}

/**
 * React hook — returns true while any modal is pushed OR any sonner
 * toast is mounted. Re-renders only when the boolean flips.
 */
export function useOverlayActive(): boolean {
  const [active, setActive] = useState<boolean>(() => isActive())

  useEffect(() => {
    // Sync once on mount in case state changed between module load and
    // hook subscription (e.g. a toast fired before this effect ran).
    setActive(isActive())

    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ active: boolean }>
      setActive(ce.detail?.active ?? false)
    }
    window.addEventListener(EVENT_NAME, handler)
    return () => {
      window.removeEventListener(EVENT_NAME, handler)
    }
  }, [])

  return active
}
