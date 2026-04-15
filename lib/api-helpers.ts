// © 2026 DoctoPal — All Rights Reserved
// Centralized API route helpers — auth, rate-limit, error handling DRY layer.
// New routes should prefer apiHandler() over inline boilerplate.
//
// Usage:
//   export const GET = apiHandler(async (request, auth) => {
//     // auth.user.id, auth.supabase guaranteed when requireAuth: true (default)
//     return NextResponse.json({ ok: true });
//   }, { rateLimit: { max: 30, windowMs: 60_000 } });

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

// ── Types ──
export interface AuthResult {
  user: { id: string; email?: string };
  supabase: ReturnType<typeof createServerClient>;
}

export interface ApiHandlerOptions {
  /** Rate limit: max requests in window (omit for no rate limiting) */
  rateLimit?: { max: number; windowMs: number };
  /** Route identifier for rate limiting (default: derived from URL path) */
  rateLimitKey?: string;
  /** Require authentication? (default: true) */
  requireAuth?: boolean;
}

type HandlerFn = (
  request: NextRequest,
  auth: AuthResult | null,
) => Promise<NextResponse>;

// ── Auth Helper ──
export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthResult | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return { user: { id: user.id, email: user.email ?? undefined }, supabase };
}

// ── Wrapped API Handler ──
export function apiHandler(handler: HandlerFn, options: ApiHandlerOptions = {}) {
  const { rateLimit, requireAuth = true } = options;

  return async (request: NextRequest) => {
    try {
      // Rate limiting
      if (rateLimit) {
        const clientIP = getClientIP(request);
        const key = options.rateLimitKey || request.nextUrl.pathname.replace("/api/", "");
        const check = checkRateLimit(`${key}:${clientIP}`, rateLimit.max, rateLimit.windowMs);
        if (!check.allowed) {
          return NextResponse.json(
            { error: `Too many requests. Please wait ${check.resetInSeconds}s.` },
            { status: 429, headers: { "Retry-After": String(check.resetInSeconds) } },
          );
        }
      }

      // Authentication
      const auth = await authenticateRequest(request);
      if (requireAuth && !auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Execute handler
      return await handler(request, auth);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal server error";
      console.error(`[API ${request.nextUrl.pathname}]`, message);

      // Best-effort Sentry reporting
      try {
        const Sentry = await import("@sentry/nextjs");
        Sentry.captureException(error);
      } catch {
        // Sentry unavailable — swallow
      }

      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}

// ── JSON Body Parser ──
export async function parseBody<T>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}
