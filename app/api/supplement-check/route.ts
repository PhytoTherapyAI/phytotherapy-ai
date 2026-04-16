// © 2026 DoctoPal — All Rights Reserved
import { NextRequest } from "next/server"
import { askClaudeJSON } from "@/lib/ai-client"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { sanitizeInput } from "@/lib/sanitize"
import { tx } from "@/lib/translations"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`supplement:${clientIP}`, 10, 60_000)
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }

    let body: Record<string, unknown>
    try { body = await request.json() } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }
    const supplementName = sanitizeInput((body.supplement as string) || "")
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr"

    if (!supplementName || supplementName.length < 2) {
      return new Response(JSON.stringify({ error: "Supplement name required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get user profile if authenticated
    let profileContext = ""
    let userId: string | undefined
    const authHeader = request.headers.get("authorization")

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "")
        const supabase = createServerClient()
        const { data: { user } } = await supabase.auth.getUser(token)

        if (user) {
          userId = user.id
          const [profileRes, medsRes, allergiesRes] = await Promise.all([
            supabase.from("user_profiles").select("*").eq("id", user.id).single(),
            supabase.from("user_medications").select("brand_name, generic_name, dosage").eq("user_id", user.id).eq("is_active", true),
            supabase.from("user_allergies").select("allergen, severity").eq("user_id", user.id),
          ])

          if (profileRes.error) console.warn("Profile fetch failed:", profileRes.error.message)
          if (medsRes.error) console.warn("Meds fetch failed:", medsRes.error.message)
          if (allergiesRes.error) console.warn("Allergies fetch failed:", allergiesRes.error.message)

          if (profileRes.data) {
            const p = profileRes.data
            profileContext += `\nUSER PROFILE:`
            if (p.age) profileContext += `\n- Age: ${p.age}`
            if (p.gender) profileContext += `\n- Gender: ${p.gender}`
            if (p.is_pregnant) profileContext += `\n- ⚠️ PREGNANT`
            if (p.is_breastfeeding) profileContext += `\n- ⚠️ BREASTFEEDING`
            if (p.kidney_disease) profileContext += `\n- ⚠️ KIDNEY DISEASE`
            if (p.liver_disease) profileContext += `\n- ⚠️ LIVER DISEASE`
          }
          if (medsRes.data && medsRes.data.length > 0) {
            profileContext += `\n- Active medications: ${medsRes.data.map((m: { generic_name: string | null; brand_name: string | null }) => m.generic_name || m.brand_name).join(", ")}`
          }
          if (allergiesRes.data && allergiesRes.data.length > 0) {
            profileContext += `\n- Allergies: ${allergiesRes.data.map((a: { allergen: string }) => a.allergen).join(", ")}`
          }
        }
      } catch {
        // Continue without profile
      }
    }

    const langInstr = tx("api.supplementCheck.langInstr", lang)

    const prompt = `Analyze the supplement "${supplementName}" for this user.
${profileContext}

CRITICAL: Return ONLY a raw JSON object. No markdown, no code fences.
${langInstr}

{
  "supplement": "${supplementName}",
  "safety": "safe" | "caution" | "dangerous",
  "recommendedDose": "specific dose in user's language (e.g., ${tx("api.supplementCheck.doseExample", lang)})",
  "frequency": "how often in user's language (e.g., ${tx("api.supplementCheck.freqExample", lang)})",
  "personalizedNote": "brief note about why this dose for THIS specific user (max 2 sentences)",
  "warningMessage": "if dangerous/caution: friendly warning like a caring friend. null if safe",
  "interactions": ["list of drug interactions in user's language"],
  "evidenceGrade": "A" | "B" | "C"
}`

    const systemPrompt = `You are DoctoPal's supplement safety checker — a knowledgeable friend, not a clinical robot.
Analyze supplements considering the user's medications, allergies, and health conditions.
- "safe" = no known interactions, evidence supports use
- "caution" = mild interaction risk or limited evidence
- "dangerous" = significant interaction with user's medications, contraindicated for their conditions, or allergic risk

WRITING STYLE for personalizedNote and warningMessage:
- Write like a caring, knowledgeable friend — warm and conversational, NOT clinical or robotic
- Use short, natural sentences. No bullet points, no headers.
- Personalize: reference the user's actual medications/conditions by name when relevant
- Example good: "Kreatin, kas performansını ve gücünü artırmaya yardımcı olabilir. İzotretinoin kullanırken yeterli su alımına özellikle dikkat etmen önemli."
- Example bad: "Kreatin bir amino asit türevidir. Kontrendikasyon bulunmamaktadır."
- Keep it to 1-2 natural sentences max
- For warningMessage: be specific about WHY there's a risk, mention the interacting drug by name

Be specific about dosing based on the user's profile. ${tx("api.supplementCheck.turkishStyle", lang)}`

    const response = await askClaudeJSON(prompt, systemPrompt, { userId: userId || undefined })

    try {
      const result = JSON.parse(response)
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      return new Response(JSON.stringify({
        supplement: supplementName,
        safety: "caution",
        recommendedDose: "Consult your healthcare provider",
        frequency: "As directed",
        personalizedNote: tx("api.supplementCheck.fallbackNote", lang),
        warningMessage: null,
        interactions: [],
        evidenceGrade: "C",
      }), { headers: { "Content-Type": "application/json" } })
    }
  } catch (error) {
    console.error("Supplement check error:", error)
    return new Response(JSON.stringify({ error: "Failed to check supplement" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
