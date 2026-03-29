import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";

const DAILY_CARE_PROMPT = `You are generating a personalized daily care plan for a Phytotherapy.ai user.

INPUT: User profile (age, gender, conditions, medications, allergies, supplements, recent vitals, recent mood/sleep data).

GENERATE exactly 4 action cards for TODAY — each must be:
- Specific to the user's profile (not generic)
- Evidence-based and safe
- Different from yesterday (use the day-of-week and date to vary)
- Warm, encouraging tone — like a caring friend, not a doctor's order

CATEGORIES (1 card each minimum, 4 total):
1. "nutrition" — Food/drink/phytotherapy tip tied to their condition
2. "lifestyle" — Exercise/movement/breathing/habit tied to their condition
3. "tracking" — Prompt to log a symptom, vital, or mood relevant to them
4. "wellness" — Mental health, social, sleep, or motivational micro-action

RESPONSE FORMAT (JSON):
{
  "greeting": "Warm, personalized morning/afternoon/evening message referencing their name and a relevant health focus (max 2 sentences)",
  "cards": [
    {
      "id": "unique-id",
      "category": "nutrition" | "lifestyle" | "tracking" | "wellness",
      "icon": "leaf" | "footprints" | "clipboard" | "heart" | "droplets" | "sun" | "moon" | "dumbbell" | "brain" | "eye",
      "title": "Short action title (max 8 words)",
      "description": "Specific, actionable instruction (2-3 sentences max). Include WHY it matters for their condition.",
      "duration": "5 min" | "10 min" | "15 min" | "30 min" | "1 min" | null,
      "evidence": "One-line evidence note or null",
      "priority": "high" | "medium" | "low"
    }
  ],
  "dailyTip": "One surprising health fact personalized to their profile (1 sentence)"
}

SAFETY RULES:
- NEVER suggest stopping or changing medication doses
- NEVER contradict their medication profile (e.g., don't suggest grapefruit to statin users)
- If user has kidney disease, be careful with potassium/protein recommendations
- If user is pregnant, only pregnancy-safe suggestions
- Always check supplements against their medication list for interactions
- Match user's language (TR/EN based on lang parameter)
- Use their first name in the greeting`;

export async function GET(req: Request) {
  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = checkRateLimit(`daily-care:${ip}`, 5, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "en";
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Fetch user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage, frequency")
      .eq("user_id", userId);

    // Fetch allergies
    const { data: allergies } = await supabase
      .from("user_allergies")
      .select("allergy_name, severity")
      .eq("user_id", userId);

    // Fetch recent vitals (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { data: vitals } = await supabase
      .from("vital_records")
      .select("vital_type, value, unit, recorded_at")
      .eq("user_id", userId)
      .gte("recorded_at", sevenDaysAgo)
      .order("recorded_at", { ascending: false })
      .limit(10);

    // Fetch recent check-ins (last 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { data: checkIns } = await supabase
      .from("daily_check_ins")
      .select("energy_level, sleep_quality, mood, bloating, date")
      .eq("user_id", userId)
      .gte("date", threeDaysAgo)
      .order("date", { ascending: false })
      .limit(3);

    // Build context for AI
    const today = new Date();
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
    const dateStr = today.toISOString().split("T")[0];
    const hour = today.getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

    const contextPrompt = `
USER PROFILE:
- Name: ${profile.full_name || "User"}
- Age: ${profile.age || "unknown"}
- Gender: ${profile.gender || "unknown"}
- Conditions: ${profile.chronic_conditions || "none reported"}
- Kidney status: ${profile.kidney_status || "normal"}
- Liver status: ${profile.liver_status || "normal"}
- Pregnancy: ${profile.pregnancy_status || "no"}
- Smoking: ${profile.smoking || "no"}
- Alcohol: ${profile.alcohol || "no"}

MEDICATIONS: ${medications?.map(m => `${(m.generic_name || m.brand_name)} (${m.dosage}, ${m.frequency})`).join(", ") || "none"}

ALLERGIES: ${allergies?.map(a => `${a.allergy_name} (${a.severity})`).join(", ") || "none"}

RECENT VITALS: ${vitals?.map(v => `${v.vital_type}: ${v.value}${v.unit} (${v.recorded_at})`).join(", ") || "none recorded recently"}

RECENT MOOD/ENERGY: ${checkIns?.map(c => `${c.date}: energy=${c.energy_level}, sleep=${c.sleep_quality}, mood=${c.mood}`).join("; ") || "no recent check-ins"}

TODAY: ${dayOfWeek}, ${dateStr} (${timeOfDay})
LANGUAGE: ${lang === "tr" ? "Turkish" : "English"}

Generate today's personalized care plan. Make it different from what you'd generate for a different day of the week.`;

    const result = await askGeminiJSON(contextPrompt, DAILY_CARE_PROMPT);

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      // Fallback if AI response isn't valid JSON
      parsed = getFallbackPlan(profile, lang, timeOfDay);
    }

    return NextResponse.json(parsed, {
      headers: { "Cache-Control": "private, max-age=1800" }, // Cache 30 min
    });
  } catch (error) {
    console.error("[Daily Care Plan] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate care plan" },
      { status: 500 }
    );
  }
}

// Fallback plan if AI fails
function getFallbackPlan(profile: any, lang: string, timeOfDay: string) {
  const name = profile?.full_name?.split(" ")[0] || "";
  const isTr = lang === "tr";

  const greetings: Record<string, { tr: string; en: string }> = {
    morning: {
      tr: `Günaydın ${name}! Bugün sağlığın için küçük ama etkili adımlar atalım.`,
      en: `Good morning ${name}! Let's take small but effective steps for your health today.`,
    },
    afternoon: {
      tr: `Merhaba ${name}! Günün geri kalanında kendine iyi bak.`,
      en: `Hey ${name}! Take care of yourself for the rest of the day.`,
    },
    evening: {
      tr: `İyi akşamlar ${name}! Gece dinlenmeden önce birkaç küçük adım.`,
      en: `Good evening ${name}! A few small steps before winding down.`,
    },
  };

  return {
    greeting: isTr ? greetings[timeOfDay].tr : greetings[timeOfDay].en,
    cards: [
      {
        id: "fallback-nutrition",
        category: "nutrition",
        icon: "leaf",
        title: isTr ? "Bir fincan bitki çayı iç" : "Have a cup of herbal tea",
        description: isTr
          ? "Papatya veya ıhlamur çayı stresi azaltır ve sindirimi destekler. Şekersiz olmasına dikkat et."
          : "Chamomile or linden tea reduces stress and supports digestion. Keep it unsweetened.",
        duration: "5 min",
        evidence: null,
        priority: "medium",
      },
      {
        id: "fallback-lifestyle",
        category: "lifestyle",
        icon: "footprints",
        title: isTr ? "15 dakika yürüyüş yap" : "Take a 15-minute walk",
        description: isTr
          ? "Hafif yürüyüş kan şekerini dengeler, ruh halini iyileştirir ve enerji verir."
          : "A light walk balances blood sugar, improves mood, and boosts energy.",
        duration: "15 min",
        evidence: null,
        priority: "medium",
      },
      {
        id: "fallback-tracking",
        category: "tracking",
        icon: "clipboard",
        title: isTr ? "Bugün kendini nasıl hissediyorsun?" : "How are you feeling today?",
        description: isTr
          ? "Enerji ve ruh halini kaydet. Düzenli takip, sağlığındaki örüntüleri fark etmeni sağlar."
          : "Log your energy and mood. Regular tracking helps you notice patterns in your health.",
        duration: "1 min",
        evidence: null,
        priority: "high",
      },
      {
        id: "fallback-wellness",
        category: "wellness",
        icon: "heart",
        title: isTr ? "3 dakika nefes egzersizi yap" : "Do a 3-minute breathing exercise",
        description: isTr
          ? "4 saniye nefes al, 7 saniye tut, 8 saniye ver. Sinir sistemini sakinleştirir ve stresi azaltır."
          : "Breathe in 4 sec, hold 7 sec, exhale 8 sec. Calms your nervous system and reduces stress.",
        duration: "3 min",
        evidence: null,
        priority: "low",
      },
    ],
    dailyTip: isTr
      ? "Biliyor muydun? Düzenli uyku saati, herhangi bir takviyeden daha güçlü bir bağışıklık destekçisidir."
      : "Did you know? A consistent sleep schedule supports your immune system more than any supplement.",
  };
}
