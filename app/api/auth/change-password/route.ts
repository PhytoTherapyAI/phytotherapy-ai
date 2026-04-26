// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { isPwnedPassword } from "@/lib/security/check-pwned-password"

/**
 * Change the authenticated user's password (F-SETTINGS-001).
 *
 * SECURITY:
 * - Identity comes from the Bearer access token (Authorization header).
 *   Any `userId` in the body is intentionally ignored — the previous
 *   implementation accepted body.userId + service-role admin
 *   updateUserById, which let any caller change any account's password
 *   (auth bypass closed in Session 25).
 * - Re-authentication: caller MUST supply `currentPassword`. We verify
 *   it via a FRESH Supabase client (anon key, no Authorization header)
 *   so the verification doesn't pollute the main session-scoped client.
 *   Without re-auth a stolen session could rotate the password.
 * - Validation is NIST 800-63B aligned: 8-72 chars, upper + lower +
 *   number. No mandatory special-char rule (NIST recommends against
 *   complexity rules at the cost of UX). Two semantic checks: new !==
 *   current, and new !== email (case-insensitive — common dictionary
 *   attack vector).
 * - Rate limited to 5/min/IP. Supabase's own auth rate limit on
 *   `signInWithPassword` is the second defensive layer for current-
 *   password brute force.
 * - Service-role key is never used. RLS regression on the auth API
 *   (theoretically; updateUser already enforces session ownership)
 *   would fail closed rather than open.
 *
 * Error contract: response body is `{ error: "<CODE>" }` where CODE
 * matches a key the client can switch on for i18n. Codes intentionally
 * don't leak Supabase internals beyond the explicit catch-all
 * "INTERNAL".
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

type ErrorCode =
  | "MISSING_CURRENT_PASSWORD"
  | "MISSING_NEW_PASSWORD"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "MISSING_UPPER"
  | "MISSING_LOWER"
  | "MISSING_NUMBER"
  | "SAME_AS_CURRENT"
  | "SAME_AS_EMAIL"
  | "PASSWORD_PWNED" // F-SETTINGS-002 — HIBP breach blocklist hit
  | "CURRENT_PASSWORD_WRONG"
  | "INTERNAL"

/**
 * Stage-level breadcrumb for the HIBP path. Mirrors the dynamic-import
 * pattern used by F-SCANNER-001 / F-CHAT-SIDEBAR-003 so a Sentry-less
 * deploy still gets a useful console line.
 *
 * The password and its hash are NEVER written here. Only meta data
 * (passwordLength, pwned bool, count, error detail) is breadcrumbed.
 */
function hibpBreadcrumb(
  stage: "start" | "success" | "error",
  level: "info" | "warning" | "error",
  data?: Record<string, unknown>,
): void {
  console.log(`[hibp-check] ${stage}`, data ?? {})
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.addBreadcrumb({
        category: "hibp-check",
        message: `hibp:${stage}`,
        level,
        data,
      })
    })
    .catch(() => {
      // Sentry unavailable — server log already captured.
    })
}

const MIN_PW_LEN = 8
const MAX_PW_LEN = 72 // bcrypt input limit; Supabase silently truncates beyond.

function err(code: ErrorCode, status: number) {
  return NextResponse.json({ error: code }, { status })
}

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return err("INTERNAL", 500)
  }

  try {
    // Rate limit: 5/min per IP — sensitive endpoint
    const clientIP = getClientIP(req)
    const rateCheck = checkRateLimit(`change-password:${clientIP}`, 5, 60_000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.resetInSeconds) },
        },
      )
    }

    // Bearer auth (project convention)
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }
    const token = authHeader.slice("Bearer ".length).trim()
    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    // Session-scoped client — used for getUser + updateUser. The
    // Authorization header here is from the live session and won't be
    // rotated by signInWithPassword (which we route through a separate
    // verification client below).
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)
    if (userError || !user || !user.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    // NOTE: any body.userId is intentionally ignored — identity is the
    // verified session above.
    const currentPassword: unknown = body?.currentPassword
    const newPassword: unknown = body?.newPassword

    if (typeof currentPassword !== "string" || !currentPassword) {
      return err("MISSING_CURRENT_PASSWORD", 400)
    }
    if (typeof newPassword !== "string" || !newPassword) {
      return err("MISSING_NEW_PASSWORD", 400)
    }

    // Length window. We bound BOTH ends — 72 is the bcrypt input cap;
    // values beyond it are silently truncated by Supabase, so the user
    // would think their password is one thing while bcrypt sees only
    // the first 72 bytes. Reject explicitly so behaviour is honest.
    if (newPassword.length < MIN_PW_LEN) return err("TOO_SHORT", 400)
    if (newPassword.length > MAX_PW_LEN) return err("TOO_LONG", 400)

    // Character class — NIST 800-63B aligned (length + 3 classes; no
    // mandatory special char). Order matches the form: upper -> lower
    // -> number so failure messages mirror typing order.
    if (!/[A-Z]/.test(newPassword)) return err("MISSING_UPPER", 400)
    if (!/[a-z]/.test(newPassword)) return err("MISSING_LOWER", 400)
    if (!/[0-9]/.test(newPassword)) return err("MISSING_NUMBER", 400)

    // Semantic checks — same-as-current is exact (case-sensitive on
    // purpose: "Password1" and "password1" really are different
    // passwords in the bcrypt hash). Same-as-email is case-insensitive
    // since email comparison is canonically lowercase.
    if (newPassword === currentPassword) return err("SAME_AS_CURRENT", 400)
    if (newPassword.toLowerCase() === user.email.toLowerCase()) {
      return err("SAME_AS_EMAIL", 400)
    }

    // F-SETTINGS-002 — Pwned Passwords blocklist. Runs AFTER all
    // semantic validation (so we don't burn HIBP requests on obviously
    // bad passwords) and BEFORE re-authentication (so we don't burn
    // Supabase auth calls on passwords we'll reject anyway). The check
    // is fail-OPEN: if HIBP is unreachable / times out / parse fails,
    // we log the error but still let the user through. Defense-in-
    // depth, not the primary security boundary.
    hibpBreadcrumb("start", "info", { passwordLength: newPassword.length })
    const hibp = await isPwnedPassword(newPassword)
    if (hibp.error) {
      hibpBreadcrumb("error", "warning", { detail: hibp.error })
      // Capture as Sentry exception so we see persistent HIBP outages
      // in the dashboard without spamming on transient blips.
      void import("@sentry/nextjs")
        .then((Sentry) => {
          Sentry.captureMessage("hibp-check failed (fail-open)", {
            level: "warning",
            tags: { endpoint: "change-password", stage: "hibp-error" },
            extra: { detail: hibp.error },
          })
        })
        .catch(() => {})
      // Fall through — fail-open.
    } else if (hibp.pwned && typeof hibp.count === "number" && hibp.count > 0) {
      hibpBreadcrumb("success", "warning", {
        pwned: true,
        count: hibp.count,
      })
      return NextResponse.json(
        { error: "PASSWORD_PWNED", count: hibp.count },
        { status: 400 },
      )
    } else {
      hibpBreadcrumb("success", "info", { pwned: false })
    }

    // Re-authentication via a FRESH client. Reasoning: signInWithPassword
    // mutates the calling client's internal auth state — if we run it
    // on `supabase` above, the constructor's manually-set Authorization
    // header gets overlaid by a freshly-issued session token. The
    // subsequent updateUser call then runs against the new session,
    // which is fine in the happy path but creates an awkward fallback
    // surface if a future change introduces conditional retries. A
    // throwaway client keeps the verification surface stateless.
    const verifyClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: signInData, error: signInError } =
      await verifyClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
    if (signInError || !signInData?.user) {
      return err("CURRENT_PASSWORD_WRONG", 401)
    }

    // Update via the original session-scoped client. Supabase enforces
    // that this only changes the authenticated user's own password.
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (updateError) {
      // Surface a generic INTERNAL — Supabase error.message can carry
      // pgcode-level detail we don't want exposed and rarely maps to a
      // user-actionable cue at this stage (validation already passed).
      console.error("[change-password] updateUser failed:", updateError.message)
      return err("INTERNAL", 502)
    }

    // Revoke the throwaway verification session so the access token we
    // briefly minted doesn't linger. Best-effort — failures are silent
    // (the token is short-lived anyway).
    void verifyClient.auth.signOut().catch(() => {})

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[change-password] unexpected:", e)
    return err("INTERNAL", 500)
  }
}
