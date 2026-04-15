// © 2026 DoctoPal — All Rights Reserved
// Helper for AI endpoints to extract userId and pass consent context to ai-client.
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * Extract authenticated user ID from a request's Bearer token.
 * Returns null for anonymous requests.
 *
 * USAGE (in an AI endpoint):
 *   const userId = await getAIUserId(request);
 *   const result = await askGeminiJSON(prompt, systemPrompt, { userId });
 *   // If user lacks AI consent, result will be
 *   //   { error: "consent_required", blocked: true, message: "..." }
 *
 * USAGE (emergency bypass — always let the call through, e.g. red-code triage):
 *   const result = await askGemini(prompt, systemPrompt, { skipConsent: true });
 */
export async function getAIUserId(request: Request | NextRequest): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Parse a JSON string result from ai-client functions, detecting consent/injection blocks.
 * Returns { blocked: true, message } if the response is a safety block, otherwise null.
 *
 * USAGE:
 *   const raw = await askGeminiJSON(prompt, systemPrompt, { userId });
 *   const block = parseAIBlock(raw);
 *   if (block) {
 *     return NextResponse.json({ error: block.message, code: block.code }, { status: 403 });
 *   }
 *   const data = JSON.parse(raw); // normal JSON response
 */
export function parseAIBlock(rawResponse: string): { blocked: true; code: string; message: string } | null {
  try {
    const parsed = JSON.parse(rawResponse);
    if (parsed && typeof parsed === "object" && parsed.blocked === true) {
      const code =
        parsed.error === "consent_required" ? "consent_required" :
        parsed.error === "prompt_injection_blocked" ? "prompt_injection" :
        "blocked";
      return {
        blocked: true,
        code,
        message: typeof parsed.message === "string" ? parsed.message : "Request blocked by safety filter",
      };
    }
    return null;
  } catch {
    return null;
  }
}
