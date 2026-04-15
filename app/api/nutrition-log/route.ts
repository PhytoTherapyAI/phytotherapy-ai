// © 2026 DoctoPal — All Rights Reserved
import { NextRequest } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

// ============================================
// Types
// ============================================

interface NutritionInput {
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  lang?: string;
}

interface GeminiNutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  key_nutrients: Array<{ name: string; amount: string }>;
  food_drug_alerts: Array<{
    food: string;
    medication: string;
    severity: "red" | "yellow";
    explanation: string;
  }>;
  summary: string;
}

// ============================================
// System Prompt
// ============================================

const NUTRITION_SYSTEM_PROMPT = `You are a nutrition analysis expert for DoctoPal.
Your task is to estimate the nutritional content of meals described by users and detect food-drug interactions.

RULES:
1. Estimate calories realistically — don't underestimate or overestimate.
2. Know Turkish foods well:
   - Döner (portion): 400-600 kcal
   - Lahmacun (1 piece): ~280 kcal
   - Simit: ~280 kcal
   - Menemen (portion): ~250 kcal
   - Çorba (lentil soup): ~150-200 kcal
   - Pilav (rice, portion): ~200-250 kcal
   - Ayran (1 glass): ~60 kcal
   - Pide (1 portion): ~400-500 kcal
   - Börek (1 portion): ~300-400 kcal
   - Karnıyarık (1 portion): ~350-450 kcal
   - Mantı (1 portion): ~400-500 kcal
   - Mercimek köftesi (3-4 pieces): ~200 kcal
   - Baklava (2 pieces): ~350 kcal
   - Sucuk (3-4 slices): ~200 kcal
   - Kaşarlı tost: ~300-350 kcal
3. Know international foods: pizza slice ~280 kcal, burger ~500-700 kcal, pasta portion ~400-500 kcal, salad ~150-300 kcal depending on dressing.
4. Provide protein, carbs, fat, fiber in grams.
5. List key micronutrients present (iron, vitamin C, calcium, etc.).
6. CRITICAL: Check the user's medications list for food-drug interactions:
   - Grapefruit / greyfurt + statins (atorvastatin, simvastatin) → CYP3A4 inhibition, increased drug levels → RED
   - Grapefruit / greyfurt + calcium channel blockers (amlodipine, felodipine) → increased drug levels → RED
   - Dairy / süt ürünleri + tetracycline/ciprofloxacin antibiotics → reduced absorption → YELLOW
   - Leafy greens / yeşil yapraklı sebzeler (spinach, kale) + warfarin → vitamin K antagonism → RED
   - Caffeine / kafein + lithium → reduced lithium levels → YELLOW
   - Caffeine / kafein + theophylline → increased side effects → YELLOW
   - Alcohol / alkol + metformin → lactic acidosis risk → RED
   - Alcohol / alkol + paracetamol/acetaminophen → liver damage risk → RED
   - Tyramine foods (aged cheese, cured meats) + MAOIs (phenelzine, tranylcypromine) → hypertensive crisis → RED
   - Potassium-rich foods (banana, avocado) + ACE inhibitors/ARBs + spironolactone → hyperkalemia → YELLOW
   - High-fiber foods + levothyroxine → reduced absorption → YELLOW
   - Cranberry juice + warfarin → increased bleeding risk → YELLOW
7. If no medications are provided, skip food-drug alerts (return empty array).
8. Respond in the user's language (EN or TR based on the lang parameter).

OUTPUT FORMAT (JSON):
{
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>,
  "fiber": <number in grams>,
  "key_nutrients": [{"name": "Iron", "amount": "3.2mg"}, ...],
  "food_drug_alerts": [
    {
      "food": "grapefruit",
      "medication": "Atorvastatin",
      "severity": "red",
      "explanation": "Grapefruit inhibits CYP3A4 enzyme..."
    }
  ],
  "summary": "Brief 1-2 sentence summary of the meal's nutritional profile."
}`;

// ============================================
// GET Handler — Fetch nutrition records
// ============================================

export async function GET(request: NextRequest) {
  try {
    let userId: string | undefined;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch today + last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateFrom = sevenDaysAgo.toISOString().split("T")[0];

    const { data: records, error: fetchError } = await supabase
      .from("nutrition_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", dateFrom)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("[nutrition-log] Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch records" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, records: records || [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[nutrition-log] GET error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ============================================
// POST Handler — Analyze & save nutrition record
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`nutrition:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    // Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse body
    const body = await request.json();
    const { date, meal_type, description } = body as NutritionInput;
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!description || !description.trim()) {
      return new Response(
        JSON.stringify({ error: "Meal description is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!meal_type || !["breakfast", "lunch", "dinner", "snack"].includes(meal_type)) {
      return new Response(
        JSON.stringify({ error: "Valid meal_type is required (breakfast, lunch, dinner, snack)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const recordDate = date || new Date().toISOString().split("T")[0];

    // Fetch user medications for food-drug interaction check
    let medicationsList: string[] = [];
    try {
      const { data: meds } = await supabase
        .from("user_medications")
        .select("brand_name, generic_name")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (meds && meds.length > 0) {
        medicationsList = meds.map((m: any) =>
          m.generic_name && m.brand_name
            ? `${m.brand_name} (${m.generic_name})`
            : (m.generic_name || m.brand_name)
        );
      }
    } catch {
      // Continue without medications — non-critical
    }

    // Build Gemini prompt
    const medicationsContext = medicationsList.length > 0
      ? `\n\nUser's current medications: ${medicationsList.join(", ")}\nCheck ALL foods in the meal against these medications for interactions.`
      : "\n\nUser has no medications on record. Skip food-drug alerts.";

    const userPrompt = `Analyze this meal and respond in ${tx("api.respondLang", lang)}:

Meal type: ${meal_type}
Description: ${description}
${medicationsContext}

Return JSON with: calories, protein, carbs, fat, fiber, key_nutrients, food_drug_alerts, summary.`;

    // Call Gemini
    const rawResult = await askGeminiJSON(userPrompt, NUTRITION_SYSTEM_PROMPT, { userId: user.id });
    let analysis: GeminiNutritionResult;

    try {
      analysis = JSON.parse(rawResult);
    } catch {
      console.error("[nutrition-log] Failed to parse Gemini response:", rawResult);
      return new Response(
        JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save to DB
    const alertTexts = (analysis.food_drug_alerts || []).map(
      (a) => `[${a.severity.toUpperCase()}] ${a.food} + ${a.medication}: ${a.explanation}`
    );

    const { data: record, error: insertError } = await supabase
      .from("nutrition_records")
      .insert({
        user_id: user.id,
        date: recordDate,
        meal_type,
        description: description.trim(),
        calories: Math.round(analysis.calories || 0),
        protein: Math.round((analysis.protein || 0) * 10) / 10,
        carbs: Math.round((analysis.carbs || 0) * 10) / 10,
        fat: Math.round((analysis.fat || 0) * 10) / 10,
        fiber: Math.round((analysis.fiber || 0) * 10) / 10,
        key_nutrients: analysis.key_nutrients || [],
        food_drug_alerts: alertTexts,
        image_used: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[nutrition-log] Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save record" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        record,
        analysis: {
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
          fiber: analysis.fiber,
          key_nutrients: analysis.key_nutrients,
          food_drug_alerts: analysis.food_drug_alerts,
          summary: analysis.summary,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[nutrition-log] POST error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
