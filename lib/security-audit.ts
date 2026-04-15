// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.12 — Veri Güvenliği Denetim Araçları
// TCK Md.134-136 — Kişisel verileri hukuka aykırı kaydetme/ifşa etme yaptırımları

/**
 * Environment variable audit.
 * Sensitive keys (SERVICE_ROLE, SECRET, PRIVATE, PASSWORD, TOKEN) must NEVER
 * be exposed via NEXT_PUBLIC_ prefix (which bundles them into the client).
 */
export function auditEnvVariables(): { safe: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const sensitivePatterns = ["SERVICE_ROLE", "SECRET", "PRIVATE", "PASSWORD", "TOKEN"];

  // Only runs server-side; process.env on client is limited to NEXT_PUBLIC_ anyway
  if (typeof process === "undefined" || !process.env) {
    return { safe: true, warnings: [] };
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith("NEXT_PUBLIC_") || !value) continue;
    for (const pattern of sensitivePatterns) {
      if (key.toUpperCase().includes(pattern)) {
        warnings.push(`⚠️ Sensitive key exposed to client bundle: ${key}`);
      }
    }
  }

  return { safe: warnings.length === 0, warnings };
}

export interface ApiAccessLogEntry {
  endpoint: string;
  userId?: string;
  action: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
  outcome?: "success" | "denied" | "error";
  metadata?: Record<string, unknown>;
}

/**
 * API access audit log — who accessed which endpoint, when, with what result.
 * Used for KVKK compliance ("we can show who accessed patient data and when").
 *
 * Currently emits to console in a structured format; in production this should
 * also write to a dedicated `api_access_log` table in Supabase.
 */
export function logApiAccess(params: ApiAccessLogEntry): void {
  const entry = {
    ...params,
    timestamp: params.timestamp || new Date().toISOString(),
  };
  // eslint-disable-next-line no-console
  console.log("[KVKK-ACCESS]", JSON.stringify(entry));
}

/**
 * Extract client IP from a Next.js request in a Vercel-safe way.
 * Checks x-forwarded-for (most common), then x-real-ip, falls back to "unknown".
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Data breach response plan (KVKK 72-hour notification requirement).
 * Displayed on /security page for user transparency + regulator audit.
 */
export const DATA_BREACH_PLAN = {
  stepsTr: [
    "1. İhlali tespit et ve kapsamını belirle",
    "2. İhlali durdur ve sistemi güvenceye al",
    "3. 72 saat içinde KVKK Kurulu'na bildir (kvkk.gov.tr)",
    "4. Etkilenen kullanıcıları bilgilendir",
    "5. İhlal raporunu dokümante et",
    "6. Önleyici tedbirleri güncelle",
  ],
  stepsEn: [
    "1. Detect the breach and determine its scope",
    "2. Contain the breach and secure the system",
    "3. Notify the KVKK Board within 72 hours (kvkk.gov.tr)",
    "4. Inform affected users",
    "5. Document the breach report",
    "6. Update preventive measures",
  ],
  kvkkContact: {
    url: "https://ihlalbildirim.kvkk.gov.tr",
    phone: "ALO 198",
    email: "kvkk@kvkk.gov.tr",
    deadline: "72 saat / 72 hours",
  },
  internalContact: {
    email: "security@doctopal.com",
    contactEmail: "contact@doctopal.com",
  },
} as const;
