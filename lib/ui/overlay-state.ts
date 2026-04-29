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

import { useSyncExternalStore } from "react"

const EVENT_NAME = "doctopal:overlay-state"

// Module-level state. Next.js client components share module
// instances within a tab, so two FABs subscribing get the same
// counters. SSR-safe because all access is guarded by typeof window.
let modalRefCount = 0
let toastCount = 0

// F-CHECKIN-MOBILE-001 (round 2 — Bug B): development-gated logs so
// the push/pop/emit chain is auditable when smoke testing locally.
// `process.env.NODE_ENV === "production"` strips them at build time
// (Next.js/Webpack DCE), so production bundles ship zero log calls.
const DEBUG =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production"

function isActive(): boolean {
  return modalRefCount > 0 || toastCount > 0
}

function emit() {
  if (typeof window === "undefined") return
  const active = isActive()
  if (DEBUG) {
     
    console.log("[overlay] emit", { active, modalRefCount, toastCount })
  }
  window.dispatchEvent(
    new CustomEvent<{ active: boolean }>(EVENT_NAME, {
      detail: { active },
    }),
  )
}

/**
 * Increment the modal counter and notify listeners. Call on mount
 * (inside a useEffect) when a fixed/blocking overlay opens.
 */
export function pushOverlay() {
  modalRefCount += 1
  if (DEBUG) {
     
    console.log("[overlay] push", { modalRefCount, toastCount })
  }
  emit()
}

/**
 * Decrement the modal counter and notify listeners. Call from the
 * useEffect cleanup that paired with `pushOverlay()`.
 */
export function popOverlay() {
  modalRefCount = Math.max(0, modalRefCount - 1)
  if (DEBUG) {
     
    console.log("[overlay] pop", { modalRefCount, toastCount })
  }
  emit()
}

/**
 * Safety reset — clears the modal counter without touching the
 * toast count (which is authoritative via the DOM observer). Use
 * sparingly; only as a backup in places where a stuck refcount
 * would otherwise leave the FAB invisible forever.
 */
export function resetModalOverlay() {
  if (modalRefCount === 0) return
  if (DEBUG) {
     
    console.log("[overlay] reset modal", {
      from: modalRefCount,
      toastCount,
    })
  }
  modalRefCount = 0
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
    if (DEBUG) {
       
      console.log("[overlay] toast recount", { from: toastCount, to: next })
    }
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

// useSyncExternalStore subscribe handler — bind React's renderer
// directly to our event bus so the snapshot consistency guarantees
// kick in. Plain useState + manual addEventListener ALSO works in
// theory, but during F-CHECKIN-MOBILE-001 round-2 testing the FAB
// stayed hidden after modal dismiss in some real-device runs;
// useSyncExternalStore eliminates the class of race where
// setState's bail-out path or React 18+ batching could swallow the
// active=false transition.
function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(EVENT_NAME, callback)
  return () => window.removeEventListener(EVENT_NAME, callback)
}

function getSnapshot(): boolean {
  return isActive()
}

function getServerSnapshot(): boolean {
  // SSR pass: nothing is on screen yet, no overlays possible.
  return false
}

/**
 * React hook — returns true while any modal is pushed OR any sonner
 * toast is mounted. Backed by useSyncExternalStore so React's
 * concurrent renderer always sees the same snapshot the rest of the
 * tree does (no tearing, no missed transitions).
 */
export function useOverlayActive(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
