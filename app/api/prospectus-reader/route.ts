// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSONMultimodal } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = checkRateLimit(`prospectus:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${rl.resetInSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const lang = ((formData.get("lang") as string) === "tr" ? "tr" : "en") as "en" | "tr";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: tx("api.prospectus.unsupportedFile", lang) },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Get user medications for cross-check
    let userMedications: string[] = [];
    let userAllergies: string[] = [];
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: meds } = await supabase
            .from("user_medications")
            .select("generic_name, brand_name")
            .eq("user_id", user.id)
            .eq("is_active", true);

          const { data: allergies } = await supabase
            .from("user_allergies")
            .select("allergen")
            .eq("user_id", user.id);

          if (meds?.length) {
            userMedications = meds.map((m: { generic_name: string | null; brand_name: string | null }) =>
              m.generic_name || m.brand_name || ""
            ).filter(Boolean);
          }

          if (allergies?.length) {
            userAllergies = allergies.map((a: { allergen: string }) => a.allergen);
          }

          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Prospectus Reader: ${file.name}`,
            query_type: "prospectus" as const,
          });
        }
      } catch {
        // Continue without profile
      }
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const userLang = tx("api.respondLang", lang);

    const systemPrompt = `You are a medication prospectus/leaflet reader at DoctoPal.
Your job is to extract key information from medication packaging, leaflets, or prospectuses and explain them in simple, understandable language.

${userMedications.length > 0 ? `USER'S CURRENT MEDICATIONS: ${userMedications.join(", ")}` : ""}
${userAllergies.length > 0 ? `USER'S ALLERGIES: ${userAllergies.join(", ")}` : ""}

Respond entirely in ${userLang} with this exact JSON:
{
  "medicationName": "Name of the medication",
  "activeIngredient": "Active ingredient(s)",
  "category": "Drug category/class",
  "whatItDoes": "Simple explanation of what this medication does",
  "dosage": {
    "standard": "Standard dosage",
    "instructions": "How to take it (with food, timing, etc.)"
  },
  "sideEffects": {
    "common": ["Common side effect 1", "side effect 2"],
    "serious": ["Serious side effect requiring medical attention"],
    "rare": ["Rare side effect"]
  },
  "interactions": [
    { "with": "Drug/food/substance name", "effect": "What happens", "severity": "safe" | "caution" | "dangerous" }
  ],
  "warnings": ["Important warning 1", "warning 2"],
  "contraindications": ["When NOT to use this medication"],
  "storage": "How to store this medication",
  "profileAlerts": ["Any alerts based on user's current medications or allergies"],
  "simpleSummary": "2-3 sentence plain-language summary of the most important things to know about this medication"
}

RULES:
1. Extract ALL readable text from the image/PDF
2. Translate medical jargon into simple language
3. If user takes other medications, check for interactions and add to profileAlerts
4. If user has allergies matching any ingredient, flag it in profileAlerts
5. If text is partially unreadable, note what you could and couldn't read
6. Be thorough with side effects — categorize by frequency`;

    const prompt = `Read this medication prospectus/leaflet/packaging image and extract all key information. Explain everything in simple ${userLang} that anyone can understand.`;

    const result = await askGeminiJSONMultimodal(prompt, systemPrompt, [
      { mimeType: file.type, base64 },
    ]);

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.prospectus.readFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Prospectus reader API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
