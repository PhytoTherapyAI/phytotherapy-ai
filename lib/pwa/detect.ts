// © 2026 DoctoPal — All Rights Reserved
//
// PWA detection utility.
//
// Three states drive the fallback UI in components/pwa/
// NotificationSettings.tsx (and any future surface that wants the
// same logic — PWAInstallPrompt.tsx is the obvious next caller):
//
//   "promptable"   → beforeinstallprompt event fired, the browser
//                    has agreed it can prompt the user later.
//                    Native install button works (Android Chrome,
//                    desktop Chrome, Edge).
//
//   "ios-manual"   → iOS Safari + not standalone. iOS does not
//                    support beforeinstallprompt at all, so the
//                    only path is the manual "Share → Add to Home
//                    Screen" gesture.
//
//   "unsupported"  → the browser doesn't support PWA install or
//                    we can't tell. Fallback to a generic
//                    informational card; no install button.
//
// SSR safety: every function guards on `typeof window === "undefined"`
// (or navigator) so the module can be imported by client components
// without breaking Next.js prerender. The functions are pure
// readouts of browser state — no side effects, no listeners — so
// the caller owns event subscription.

export type PWAInstallState = "promptable" | "ios-manual" | "unsupported"

// iOS Safari exposes a non-standard `navigator.standalone` boolean
// when launched from the Home Screen. Typing it via a structural
// extension keeps the call-site free of `as any` casts (CLAUDE.md
// rule: no `any` in app code).
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

/**
 * True when the page is running in a standalone (installed-as-app)
 * window — either iOS Safari Home Screen or any browser whose
 * display-mode is reported as standalone via the media query.
 */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  const nav = window.navigator as NavigatorWithStandalone
  if (nav.standalone === true) return true
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true
  return false
}

/**
 * True for any iOS device. Catches the iPad-on-iOS-13+ case where
 * the UA reports as MacIntel; the touch-points heuristic is the
 * standard workaround Apple themselves recommend for that scenario.
 */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true
  }
  return false
}

/**
 * True for Safari on iOS specifically — i.e. the only path that
 * needs the manual "Share → Add to Home Screen" instructions.
 * Chrome / Firefox / Edge on iOS still use WebKit under the hood
 * but report their own UA tokens (CriOS / FxiOS / EdgiOS), and
 * those browsers don't accept the manual install gesture either,
 * so they fall through to the generic "unsupported" fallback.
 */
export function isIOSSafari(): boolean {
  if (!isIOS()) return false
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}
