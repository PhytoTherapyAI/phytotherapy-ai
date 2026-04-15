// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

/**
 * Change the authenticated user's password.
 *
 * SECURITY:
 * - The user is identified via the Bearer access token (Authorization header),
 *   never from the request body. Any `userId` in the body is intentionally
 *   ignored — the previous implementation accepted body.userId + service-role
 *   admin updateUserById, which let any caller change any account's password
 *   if they knew the target's user id (auth bypass).
 * - Uses a per-request supabase client scoped to the caller's session and calls
 *   `auth.updateUser({ password })`. Supabase enforces that this can only
 *   change the authenticated user's own password, so no service-role key is
 *   needed.
 * - Rate limited to 5 requests/min per IP.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 password changes per minute per IP (sensitive endpoint)
    const clientIP = getClientIP(req)
    const rateCheck = checkRateLimit(`change-password:${clientIP}`, 5, 60_000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      )
    }

    // Authenticate via Bearer token (project convention — see lib/ai-endpoint-helper.ts)
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.slice("Bearer ".length).trim()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Per-request client scoped to the caller's session — anon key + caller's
    // access token. updateUser() will only ever change the authenticated user.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    // Verify the token actually resolves to a real user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const password: unknown = body?.password
    // NOTE: any `userId` in the body is intentionally ignored. Identity comes
    // from the verified session above.

    if (typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Missing password" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least 1 uppercase letter" }, { status: 400 })
    }

    // Update via the caller's own session — Supabase enforces this only
    // changes the authenticated user's password.
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
