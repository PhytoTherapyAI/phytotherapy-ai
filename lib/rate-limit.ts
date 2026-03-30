// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Rate Limiter — In-memory sliding window
// ============================================
// 10 requests per minute per IP (configurable)
// Vercel serverless: each instance has its own map,
// so this is best-effort — good enough for abuse prevention.

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Clean old entries every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  const cutoff = now - 120_000 // 2 minutes ago
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInSeconds: number
}

export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60_000
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const windowStart = now - windowMs

  let entry = store.get(identifier)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(identifier, entry)
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    const resetIn = Math.ceil((oldestInWindow + windowMs - now) / 1000)
    return { allowed: false, remaining: 0, resetInSeconds: Math.max(resetIn, 1) }
  }

  entry.timestamps.push(now)
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetInSeconds: Math.ceil(windowMs / 1000),
  }
}

/**
 * Extract client IP from request headers (Vercel forwards x-forwarded-for)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}
