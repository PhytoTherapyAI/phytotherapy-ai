// © 2026 DoctoPal — All Rights Reserved
//
// F-SETTINGS-002 — Pwned Passwords k-anonymity check via the
// Have I Been Pwned (HIBP) Pwned Passwords API.
//
// Privacy model (KVKK-friendly):
//   - The plaintext password NEVER leaves this process.
//   - SHA-1 of the password stays in memory and is never logged.
//   - Only the FIRST 5 hex characters of the SHA-1 (the "prefix") are
//     sent to api.pwnedpasswords.com. The response covers ~300+
//     candidate suffixes for that prefix, so HIBP cannot narrow down
//     which exact password was checked.
//   - The `Add-Padding` header instructs HIBP to inject dummy entries
//     (count=0) so a network observer can't fingerprint the user from
//     response size alone.
//   - HIBP itself does not log requests (per their published policy);
//     the User-Agent header just identifies us for "polite use".
//
// Failure mode: fail-OPEN. If HIBP is unreachable / times out / parses
// strangely, we return `{ pwned: false, error }` and let the caller
// decide how to surface the failure. The caller logs to Sentry but
// MUST NOT block the password change just because a third-party API
// is down — UX > paranoia. The breach-blocklist is a defense-in-depth
// layer, not the primary security boundary.

import { createHash } from "node:crypto"

const HIBP_BASE = "https://api.pwnedpasswords.com/range"
const TIMEOUT_MS = 3000 // HIBP P95 latency is ~150-300ms; 3s is generous

export interface HibpResult {
  /** True only when the suffix appeared with a non-zero breach count. */
  pwned: boolean
  /** Breach occurrence count when pwned. Absent when clean or on error. */
  count?: number
  /** Set on transport / parse failure. Caller treats as fail-open. */
  error?: string
}

/**
 * Check whether the given password appears in the HIBP breach corpus.
 *
 * The function is intentionally *pure* with respect to logging — it
 * never writes to console, never touches Sentry. The caller is
 * responsible for breadcrumbs / capture so the helper stays
 * runtime-agnostic and easy to unit test.
 */
export async function isPwnedPassword(password: string): Promise<HibpResult> {
  if (!password) return { pwned: false }

  // SHA-1 hex, uppercase to match HIBP's response format. Note that
  // SHA-1 is cryptographically broken for collision resistance but is
  // perfectly fine here — HIBP uses SHA-1 because they need to expose
  // a 5-char prefix to support k-anonymity, and the security property
  // we depend on (preimage resistance) holds.
  const hash = createHash("sha1").update(password).digest("hex").toUpperCase()
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5) // 35 hex chars

  try {
    const res = await fetch(`${HIBP_BASE}/${prefix}`, {
      method: "GET",
      headers: {
        // HIBP "polite use" policy — without User-Agent the API returns
        // 403 Forbidden. Identifies the calling app for abuse logs.
        "User-Agent": "DoctoPal-PasswordCheck",
        // Privacy: pad the response so an observer can't infer which
        // password we're checking from response size alone.
        "Add-Padding": "true",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!res.ok) {
      return { pwned: false, error: `HIBP HTTP ${res.status}` }
    }

    const text = await res.text()

    // Each line: "<35-hex-SUFFIX>:<COUNT>" with CRLF separators. The
    // padding entries injected by Add-Padding carry count=0, so a
    // suffix match with count=0 means our hash collided with a padding
    // row (statistically near-impossible at 35-hex resolution; the
    // count guard handles it cleanly anyway).
    for (const rawLine of text.split("\n")) {
      const line = rawLine.trim()
      if (!line) continue
      const colon = line.indexOf(":")
      if (colon < 0) continue
      const responseSuffix = line.slice(0, colon)
      if (responseSuffix !== suffix) continue
      const count = parseInt(line.slice(colon + 1), 10)
      if (Number.isFinite(count) && count > 0) {
        return { pwned: true, count }
      }
      // count was 0 / NaN — almost certainly a padding row that
      // happened to share our suffix prefix. Treat as not pwned.
      break
    }

    return { pwned: false }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    return { pwned: false, error: detail }
  }
}
