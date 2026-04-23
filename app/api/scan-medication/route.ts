// © 2026 DoctoPal — All Rights Reserved
//
// F-SCANNER-001: observability + error categorization rewrite.
//
// Before this pass: every failure path (auth / rate-limit / Claude error
// / parse error / consent block / prompt-injection block) collapsed into
// a single "Failed to analyze image" 500 on the client and "Analiz
// başarısız" in the UI. We couldn't diagnose anything from production
// logs because the catch block was a silent swallow (no Sentry, no
// console, no breadcrumb).
//
// After this pass:
//   - Every stage emits a Sentry breadcrumb (category: "scanner") so
//     canlıdaki timeline ayrışabilir. Image base64 LOG'LANMAZ — PII guard.
//   - Every catch captures the exception via Sentry.captureException
//     with stage + status tags.
//   - The error response has a stable shape `{ error, code, stage, detail }`
//     so the client can map a specific i18n key per failure mode.
//   - `askClaudeJSONMultimodal` can return a blocked JSON envelope
//     (`{ blocked: true, error: "consent_required" | "prompt_injection_blocked" }`)
//     which previously leaked to the UI as a 200 success. We now detect
//     it and turn it into a 422 with a proper code.
//   - `maxDuration = 50` matches the client AbortController (55 s) with a
//     5 s safety margin — before this, 3 × 15 s retry backoff could push
//     past Vercel's 60 s default and fail opaquely.

import { NextRequest, NextResponse } from "next/server"
import { askClaudeJSONMultimodal } from "@/lib/ai-client"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { tx } from "@/lib/translations"

export const maxDuration = 50

type ErrorCode =
  | "auth_required"
  | "rate_limited"
  | "image_invalid"
  | "consent_blocked"
  | "ocr_failed"
  | "parse_failed"

type Stage =
  | "auth"
  | "rate-check"
  | "body-parse"
  | "image-validate"
  | "claude-call"
  | "response-parse"
  | "success-envelope"

interface ErrorResponseBody {
  error: string
  code: ErrorCode
  stage: Stage
  /** Human-readable debug context. Dev-only — UI should not display it. */
  detail?: string
}

/**
 * Fire-and-forget Sentry capture with a scanner-scoped breadcrumb.
 * Dynamic import mirrors lib/mutation-errors.ts — Sentry-less deploys
 * silently swallow, never break the request.
 */
function captureScannerFailure(
  stage: Stage,
  code: ErrorCode,
  status: number,
  errorOrDetail: unknown,
  extras?: Record<string, unknown>,
): void {
  const detail =
    errorOrDetail instanceof Error
      ? `${errorOrDetail.name}: ${errorOrDetail.message}`
      : typeof errorOrDetail === "string"
        ? errorOrDetail
        : undefined

  // Always write a minimal server log line — Vercel log drain picks it
  // up even if Sentry isn't reachable. Image base64 is never in scope
  // here; the extras bag is caller-controlled and must not include it.
  console.error(
    `[scanner] ${stage} failed (code=${code}, status=${status})`,
    detail ?? "",
    extras ?? {},
  )

  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.addBreadcrumb({
        category: "scanner",
        message: `scan-medication:${stage}`,
        level: "error",
        data: { code, status, ...extras },
      })
      if (errorOrDetail instanceof Error) {
        Sentry.captureException(errorOrDetail, {
          tags: { endpoint: "scan-medication", stage, code },
          extra: { status, ...extras },
        })
      } else {
        Sentry.captureMessage(`scan-medication ${stage} ${code}`, {
          level: "error",
          tags: { endpoint: "scan-medication", stage, code },
          extra: { status, detail, ...extras },
        })
      }
    })
    .catch(() => {
      // Sentry unavailable — server log already captured above.
    })
}

function errorResponse(
  stage: Stage,
  code: ErrorCode,
  status: number,
  message: string,
  detail?: string,
): NextResponse<ErrorResponseBody> {
  return NextResponse.json<ErrorResponseBody>(
    { error: message, code, stage, detail },
    { status },
  )
}

export async function POST(req: NextRequest) {
  // STAGE 1: Auth
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    captureScannerFailure("auth", "auth_required", 401, "missing-bearer")
    return errorResponse("auth", "auth_required", 401, "Unauthorized")
  }

  // STAGE 2: Rate limit
  const clientIP = getClientIP(req)
  const rateCheck = checkRateLimit(`scan:${clientIP}`, 5, 60_000)
  if (!rateCheck.allowed) {
    captureScannerFailure("rate-check", "rate_limited", 429, "quota-exceeded", {
      resetInSeconds: rateCheck.resetInSeconds,
    })
    return errorResponse(
      "rate-check",
      "rate_limited",
      429,
      `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.`,
      `resetInSeconds=${rateCheck.resetInSeconds}`,
    )
  }

  // STAGE 3: Body parse
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch (err) {
    captureScannerFailure("body-parse", "image_invalid", 400, err)
    return errorResponse(
      "body-parse",
      "image_invalid",
      400,
      "Invalid JSON body",
    )
  }

  const image = typeof body.image === "string" ? body.image : ""
  const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr"

  if (!image) {
    captureScannerFailure("image-validate", "image_invalid", 400, "no-image")
    return errorResponse("image-validate", "image_invalid", 400, "No image provided")
  }

  // Strip data URL prefix. Base64 payload itself is NEVER logged from
  // this point on.
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
  const base64Size = base64Data.length

  // STAGE 4: Claude vision call (wrapped in its own catch so Claude 529s
  // and network errors surface with the right stage).
  let rawResult: string
  try {
    const prompt = tx("api.scanMedication.promptTr", lang)
    const systemPrompt =
      "You are a medication identification assistant. Analyze the image and extract medication information. Respond in JSON format."

    rawResult = await askClaudeJSONMultimodal(
      prompt,
      systemPrompt,
      [{ mimeType: "image/jpeg", base64: base64Data }],
    )
  } catch (err) {
    const status = 502
    captureScannerFailure("claude-call", "ocr_failed", status, err, { base64Size })
    return errorResponse(
      "claude-call",
      "ocr_failed",
      status,
      "Image analysis service unavailable",
      err instanceof Error ? err.message : undefined,
    )
  }

  // STAGE 5: Response parse
  let parsed: unknown
  try {
    parsed = JSON.parse(rawResult)
  } catch (err) {
    captureScannerFailure("response-parse", "parse_failed", 502, err, {
      rawLength: rawResult.length,
    })
    return errorResponse(
      "response-parse",
      "parse_failed",
      502,
      "Failed to parse AI response",
      err instanceof Error ? err.message : undefined,
    )
  }

  // STAGE 6: Success envelope detection.
  // askClaudeJSONMultimodal returns VALID JSON even when guardInput /
  // enforceConsent rejected the call — the body carries `{ blocked: true,
  // error: "..." }`. Previously this leaked to the client as a 200
  // success; now we translate it into a 422 with the right code.
  if (parsed && typeof parsed === "object") {
    const envelope = parsed as { error?: unknown; blocked?: unknown }
    if (envelope.blocked === true && typeof envelope.error === "string") {
      const isConsent = envelope.error === "consent_required"
      const code: ErrorCode = isConsent ? "consent_blocked" : "ocr_failed"
      captureScannerFailure("success-envelope", code, 422, envelope.error, {
        envelopeError: envelope.error,
      })
      return errorResponse(
        "success-envelope",
        code,
        422,
        envelope.error,
        `blocked=${envelope.error}`,
      )
    }
  }

  return NextResponse.json(parsed)
}
