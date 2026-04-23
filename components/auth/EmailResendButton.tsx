// © 2026 DoctoPal — All Rights Reserved
//
// F-AUTH-003: Email verification resend button.
//
// Wraps auth-context.resendVerificationEmail() with a 60-second client
// cooldown (localStorage-persisted so tab close / refresh survive) and
// a state machine tuned to the Supabase SMTP flow:
//
//   idle           → "Resend verification email"
//   sending        → spinner "Sending..."
//   sent-cooldown  → "Sent ✓ — try again in {n}s"   (60s after success)
//   rate-limited   → "Too many attempts — {n}s wait" (60s from 429)
//   error          → "Could not send — try again"   (auto-recovers in 3s)
//
// Already-confirmed emails trigger the parent's onAlreadyConfirmed
// callback (signals "switch to login tab + pre-fill email") and the
// button goes quiet — no cooldown, no error.
//
// Gradual-rollout kill switch: NEXT_PUBLIC_AUTH_RESEND=false makes the
// whole component render null.
//
// The cooldown key is `auth_resend_${btoa(email)}` so a user with two
// browser tabs (same email) doesn't race — tab A's successful send
// locks tab B's button too. Cross-email attacks are impossible: the
// server cooldown is per-email anyway, so the client lock is defense-
// in-depth, not the only guardrail.
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Mail, MailCheck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { tx } from "@/lib/translations"
import { reportMutationError } from "@/lib/mutation-errors"
import { toast } from "sonner"

const COOLDOWN_SECONDS = 60
const ERROR_DURATION_MS = 3_000
const LOCALSTORAGE_PREFIX = "auth_resend_"

// Feature flag — explicitly "false" disables the whole component.
// Default is ENABLED so Vercel env toggle is a safe kill switch.
const RESEND_ENABLED = process.env.NEXT_PUBLIC_AUTH_RESEND !== "false"

type ButtonState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent-cooldown"; secondsLeft: number }
  | { kind: "rate-limited"; secondsLeft: number }
  | { kind: "error"; message: string }

interface Props {
  email: string
  lang: "tr" | "en"
  /**
   * Fired when the server reports the email is already verified.
   * Parent should switch to the sign-in tab and pre-fill the email field.
   */
  onAlreadyConfirmed?: (email: string) => void
  className?: string
}

function keyFor(email: string): string {
  // btoa gracefully handles ASCII but throws on non-Latin1. Emails may
  // contain Turkish domain segments with non-ASCII characters — encodeURI
  // first to stay safe.
  const normalised = email.toLowerCase().trim()
  try {
    return LOCALSTORAGE_PREFIX + btoa(encodeURIComponent(normalised))
  } catch {
    // Last-resort fallback: non-cryptographic hash. Collisions don't
    // cause security issues here — the server enforces the real cooldown.
    let hash = 0
    for (let i = 0; i < normalised.length; i++) {
      hash = (hash * 31 + normalised.charCodeAt(i)) | 0
    }
    return LOCALSTORAGE_PREFIX + hash.toString(36)
  }
}

function readStoredTimestamp(email: string): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = window.localStorage.getItem(keyFor(email))
    if (!raw) return 0
    const ms = parseInt(raw, 10)
    return Number.isFinite(ms) ? ms : 0
  } catch {
    return 0
  }
}

function writeStoredTimestamp(email: string, timestamp: number): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(keyFor(email), String(timestamp))
  } catch {
    // localStorage quota / disabled — the countdown still runs in memory,
    // just won't survive refresh. Not worth surfacing to the user.
  }
}

export function EmailResendButton({ email, lang, onAlreadyConfirmed, className }: Props) {
  const { resendVerificationEmail } = useAuth()
  const [state, setState] = useState<ButtonState>({ kind: "idle" })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const clearErrorTimer = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = null
    }
  }, [])

  const startCountdown = useCallback(
    (kind: "sent-cooldown" | "rate-limited", startingSeconds: number) => {
      clearCountdown()
      setState({ kind, secondsLeft: startingSeconds })
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.kind !== "sent-cooldown" && prev.kind !== "rate-limited") {
            return prev
          }
          const next = prev.secondsLeft - 1
          if (next <= 0) {
            clearCountdown()
            return { kind: "idle" }
          }
          return { ...prev, secondsLeft: next }
        })
      }, 1_000)
    },
    [clearCountdown],
  )

  // Mount-effect: if this email has a fresh cooldown in localStorage,
  // restore the UI to sent-cooldown with the remaining seconds.
  useEffect(() => {
    if (!email) return
    const stored = readStoredTimestamp(email)
    if (!stored) return
    const elapsedMs = Date.now() - stored
    const remainingMs = COOLDOWN_SECONDS * 1_000 - elapsedMs
    if (remainingMs > 0) {
      startCountdown("sent-cooldown", Math.ceil(remainingMs / 1_000))
    }
    return () => {
      clearCountdown()
      clearErrorTimer()
    }
    // Intentionally depend on email only — on change, re-evaluate cooldown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  const handleClick = useCallback(async () => {
    if (state.kind !== "idle" && state.kind !== "error") return
    if (!email || !email.includes("@")) return

    clearErrorTimer()
    setState({ kind: "sending" })

    const { error } = await resendVerificationEmail(email)

    if (!error) {
      writeStoredTimestamp(email, Date.now())
      toast.success(tx("auth.resend.sent", lang))
      startCountdown("sent-cooldown", COOLDOWN_SECONDS)
      return
    }

    if (error.code === "already-confirmed") {
      toast.info(tx("auth.resend.alreadyConfirmed", lang))
      onAlreadyConfirmed?.(email)
      setState({ kind: "idle" })
      return
    }

    if (error.code === "rate-limited") {
      const wait = error.retryAfterSeconds ?? COOLDOWN_SECONDS
      // Align the client lock with the server's reported wait so the user
      // doesn't re-click into another 429.
      writeStoredTimestamp(email, Date.now() - (COOLDOWN_SECONDS - wait) * 1_000)
      startCountdown("rate-limited", wait)
      return
    }

    // Unknown error — toast via shared helper so Sentry captures it too.
    reportMutationError(new Error(error.message), {
      op: "authResend",
      lang,
      extra: { email: email.replace(/(.{2}).*(@.*)/, "$1***$2") },
    })
    setState({ kind: "error", message: error.message })
    errorTimeoutRef.current = setTimeout(() => {
      setState({ kind: "idle" })
      errorTimeoutRef.current = null
    }, ERROR_DURATION_MS)
  }, [clearErrorTimer, email, lang, onAlreadyConfirmed, resendVerificationEmail, startCountdown, state.kind])

  if (!RESEND_ENABLED) return null

  const isDisabled =
    state.kind === "sending" ||
    state.kind === "sent-cooldown" ||
    state.kind === "rate-limited"

  const labelByState = (): React.ReactNode => {
    switch (state.kind) {
      case "idle":
        return (
          <>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            {tx("auth.resend.button", lang)}
          </>
        )
      case "sending":
        return (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            {tx("auth.resend.sending", lang)}
          </>
        )
      case "sent-cooldown":
        return (
          <>
            <MailCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-700 dark:text-emerald-400">
              {tx("auth.resend.sent", lang)} — {tx("auth.resend.cooldown", lang).replace("{n}", String(state.secondsLeft))}
            </span>
          </>
        )
      case "rate-limited":
        return (
          <>
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
            <span className="text-amber-700 dark:text-amber-400">
              {tx("auth.resend.rateLimited", lang).replace("{n}", String(state.secondsLeft))}
            </span>
          </>
        )
      case "error":
        return (
          <>
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-destructive" />
            {tx("auth.resend.error", lang)}
          </>
        )
    }
  }

  return (
    <div className={className ?? ""}>
      <p className="text-[11px] leading-relaxed text-muted-foreground mb-2">
        {tx("auth.resend.hint", lang)}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleClick}
        disabled={isDisabled}
        aria-live="polite"
      >
        {labelByState()}
      </Button>
    </div>
  )
}
