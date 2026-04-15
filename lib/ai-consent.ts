// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.6 — Reusable AI processing consent gate for any endpoint that touches AI
import { createServerClient } from "@/lib/supabase";
import { logApiAccess } from "@/lib/security-audit";

export interface ConsentCheckResult {
  allowed: boolean;
  /** Localized message to return to the user if blocked (TR + EN). */
  message: { tr: string; en: string };
  /** Which consent is missing (ai_processing | data_transfer | sbar_report) */
  missingConsent?: string;
}

const REQUIRED_MSG = {
  tr: "Bu özelliği kullanabilmeniz için önce **Yapay Zeka İşleme Açık Rızası** vermeniz gerekmektedir.\n\nProfil → Gizlilik Ayarları sayfasından rıza verebilirsiniz. Temel hizmetler (ilaç takibi, takvim) rıza olmadan çalışmaya devam eder.\n\nKVKK Md.6 uyarınca sağlık verileriniz ancak açık rızanızla yapay zeka sistemi tarafından işlenebilir.",
  en: "To use this feature, you must first provide **AI Processing Explicit Consent**.\n\nYou can grant consent via Profile → Privacy Settings. Basic services (medication tracking, calendar) continue to work without consent.\n\nUnder KVKK Art.6, your health data can only be processed by the AI system with your explicit consent.",
};

/**
 * Check whether a user has consented to AI processing.
 * Returns { allowed: false } with a localized message if consent is missing.
 *
 * USAGE (in an API route):
 *   const gate = await checkAIConsent(user.id);
 *   if (!gate.allowed) {
 *     return NextResponse.json({ error: gate.message[lang] }, { status: 403 });
 *   }
 */
export async function checkAIConsent(userId: string | null | undefined): Promise<ConsentCheckResult> {
  if (!userId) {
    // Anonymous/guest users — allow AI calls (no health data to protect beyond what they type)
    return { allowed: true, message: REQUIRED_MSG };
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("consent_ai_processing, consent_data_transfer")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[AI-Consent] check error:", error.message);
      // Fail open for now — don't lock users out on DB errors
      return { allowed: true, message: REQUIRED_MSG };
    }

    if (!data?.consent_ai_processing) {
      return { allowed: false, message: REQUIRED_MSG, missingConsent: "ai_processing" };
    }

    return { allowed: true, message: REQUIRED_MSG };
  } catch (err) {
    console.error("[AI-Consent] unexpected error:", err);
    return { allowed: true, message: REQUIRED_MSG };
  }
}

/**
 * Require AI consent — returns a Response if blocked, null if allowed.
 * Logs the denial via logApiAccess for KVKK audit.
 *
 * USAGE:
 *   const blocked = await requireAIConsent(user.id, "/api/symptom-checker", lang, clientIP);
 *   if (blocked) return blocked;
 */
export async function requireAIConsent(
  userId: string | null | undefined,
  endpoint: string,
  lang: "tr" | "en" = "tr",
  clientIP?: string
): Promise<Response | null> {
  const gate = await checkAIConsent(userId);
  if (gate.allowed) return null;

  logApiAccess({
    endpoint,
    userId: userId || undefined,
    action: "ai_blocked_no_consent",
    ip: clientIP,
    outcome: "denied",
    metadata: { missingConsent: gate.missingConsent },
  });

  const message = lang === "tr" ? gate.message.tr : gate.message.en;
  return new Response(
    JSON.stringify({ error: message, code: "CONSENT_REQUIRED", missingConsent: gate.missingConsent }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}
