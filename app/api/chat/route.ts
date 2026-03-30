// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest } from "next/server";
import { askGeminiStream, askGeminiStreamMultimodal } from "@/lib/gemini";
import type { GeminiFilePart } from "@/lib/gemini";
import { searchPubMed } from "@/lib/pubmed";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import { checkRedFlags, getEmergencyMessage } from "@/lib/safety-filter";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — 10 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`chat:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({
        error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.`,
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateCheck.resetInSeconds),
        },
      });
    }

    const body = await request.json();
    const { history, files, lang } = body;
    const message = sanitizeInput(body.message);

    if (!message || message.length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message too long (max 2000 characters)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 1: Red flag check
    const redFlagCheck = checkRedFlags(message);
    if (redFlagCheck.isEmergency) {
      const emergencyMsg = getEmergencyMessage(redFlagCheck.language);
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(
            `🚨 **${tx("api.chat.emergencyLabel", redFlagCheck.language === "tr" ? "tr" : "en")}**\n\n${emergencyMsg}`
          ));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    // Step 2: Get user profile if authenticated
    let profileContext = "";
    let hasMedications = false;
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);

        if (user) {
          userId = user.id;
          const [{ data: profile }, { data: meds }, { data: allergies }] = await Promise.all([
            supabase.from("user_profiles").select("*").eq("id", user.id).single(),
            supabase.from("user_medications").select("brand_name, generic_name, dosage").eq("user_id", user.id).eq("is_active", true),
            supabase.from("user_allergies").select("allergen, severity").eq("user_id", user.id),
          ]);

          hasMedications = !!(meds && meds.length > 0);

          if (profile) {
            profileContext = `\n\nUSER PROFILE (cross-check all recommendations against this):`;
            if (profile.age) profileContext += `\n- Age: ${profile.age}`;
            if (profile.gender) profileContext += `\n- Gender: ${profile.gender}`;
            if (profile.is_pregnant) profileContext += `\n- ⚠️ PREGNANT`;
            if (profile.is_breastfeeding) profileContext += `\n- ⚠️ BREASTFEEDING`;
            if (profile.kidney_disease) profileContext += `\n- ⚠️ KIDNEY DISEASE`;
            if (profile.liver_disease) profileContext += `\n- ⚠️ LIVER DISEASE`;
            if (hasMedications) {
              profileContext += `\n- Medications: ${meds!.map((m: { generic_name: string | null; brand_name: string | null }) => m.generic_name || m.brand_name).join(", ")}`;
            }
            if (allergies && allergies.length > 0) {
              profileContext += `\n- Allergies: ${allergies.map((a: { allergen: string }) => a.allergen).join(", ")}`;
            }
            if (!profile.onboarding_complete) {
              profileContext += `\n- ⚠️ Profile INCOMPLETE — add warning to response`;
            }
          }
        }
      } catch (authError) {
        console.error("Auth error (continuing without profile):", authError);
      }
    }

    // Step 3: Search PubMed for relevant research
    const pubmedQuery = buildPubMedSearchQuery(message);
    const articles = await searchPubMed(pubmedQuery, 5);

    // Step 4: Build the full prompt with context
    let fullPrompt = "";

    // Add conversation history (last 6 messages for context)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      fullPrompt += "CONVERSATION HISTORY:\n";
      for (const msg of recentHistory) {
        const role = msg.role === "user" ? "User" : "Assistant";
        fullPrompt += `${role}: ${String(msg.content).substring(0, 500)}\n`;
      }
      fullPrompt += "\n";
    }

    // Add peer-reviewed research sources (PubMed + Europe PMC)
    if (articles.length > 0) {
      fullPrompt += "RELEVANT PEER-REVIEWED RESEARCH (cite these in your response):\n";
      for (const article of articles) {
        fullPrompt += `- "${article.title}" (${article.year}) — ${article.url}\n`;
        if (article.abstract && article.abstract !== "No abstract available") {
          fullPrompt += `  Abstract: ${article.abstract.substring(0, 300)}...\n`;
        }
      }
      fullPrompt += "\n";
    }

    // Add profile context
    fullPrompt += profileContext;

    // Add the actual user message
    fullPrompt += `\n\nUSER'S QUESTION:\n${message}`;

    // Step 5: Stream Gemini response
    let systemPromptFull = SYSTEM_PROMPT;

    // Language instruction — MUST come first so Gemini responds in the correct language
    if (lang === "tr") {
      systemPromptFull += "\n\nKRİTİK DİL KURALI: Tüm yanıtlarını TÜRKÇE ver. Başlıklar, açıklamalar, öneriler, uyarılar dahil her şey Türkçe olmalı. Latince/İngilizce terimler parantez içinde kalabilir. Kullanıcı Türkçe yazdığında her zaman Türkçe yanıt ver.";
    }

    if (profileContext && hasMedications) {
      systemPromptFull += "\n\nIMPORTANT: A user profile is provided. Cross-check ALL recommendations against their medications, allergies, and health conditions.";
    } else {
      // Guest user OR authenticated user without medications saved
      systemPromptFull += `\n\nCRITICAL SAFETY RULE — NO DOSAGE ADVICE:
This user has NOT added any medications to their profile (or is a guest user).
When they ask about herbal supplements, herbs, or natural remedies:
- DO explain what the research says about effectiveness (cite PubMed)
- DO explain the mechanism of action
- DO NOT give specific dosage recommendations (no mg, no "X times per day", no duration)
- Instead of dosage, ALWAYS say: "Studies show [herb name] may be effective at certain doses, however [herb name] can interact with many medications. Please add your medications to your profile for a safe, personalized dosage recommendation."
- If the user is a guest, add: "Sign up at /auth/login to create your health profile — it takes less than 2 minutes."
- You may still mention general evidence grades (A, B, C) and cite sources.
This rule exists because giving dosage advice without knowing the user's medications is unsafe.`;
    }

    // Step 5b: Process uploaded files for multimodal Gemini call
    const geminiFiles: GeminiFilePart[] = [];
    if (Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        if (file.base64 && file.mimeType) {
          geminiFiles.push({
            mimeType: file.mimeType,
            base64: file.base64,
          });
        }
      }
      // Add file context to prompt
      fullPrompt += `\n\nThe user has uploaded ${files.length} file(s). Please analyze the content of these files and incorporate the findings into your response. If the file is a blood test report, lab result, or medical document, extract the relevant values and provide evidence-based recommendations.`;
    }

    // Use multimodal streaming if files are present, otherwise standard text streaming
    let stream;
    try {
      stream = geminiFiles.length > 0
        ? await askGeminiStreamMultimodal(fullPrompt, systemPromptFull, geminiFiles)
        : await askGeminiStream(fullPrompt, systemPromptFull);
    } catch (geminiError) {
      // Gemini call failed (rate limit, API key, network, etc.)
      // Return a streaming response with the error message instead of a 500
      console.error("Gemini API call failed:", geminiError);
      const errMsg = geminiError instanceof Error ? geminiError.message : "Unknown error";

      const chatLang = lang === "tr" ? "tr" as const : "en" as const;
      let userMessage: string;
      if (errMsg.includes("QUOTA_EXHAUSTED")) {
        userMessage = tx("api.chat.quotaExhaustedTr", chatLang);
      } else if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate")) {
        userMessage = tx("api.chat.rateLimited", chatLang);
      } else if (errMsg.includes("SAFETY") || errMsg.includes("blocked")) {
        userMessage = tx("api.chat.safetyBlocked", chatLang);
      } else {
        userMessage = tx("api.chat.connectionError", chatLang);
      }

      const fallbackStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(userMessage));
          controller.close();
        },
      });
      return new Response(fallbackStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Convert Gemini stream to web ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";
          for await (const chunk of stream) {
            try {
              const text = chunk.text();
              if (text) {
                fullResponse += text;
                controller.enqueue(encoder.encode(text));
              }
            } catch {
              // chunk.text() can throw if no text content — skip
            }
          }
          controller.close();

          // Save query + response to history (fire and forget)
          if (userId && fullResponse.length > 0) {
            try {
              const supabase = createServerClient();
              await supabase.from("query_history").insert({
                user_id: userId,
                query_text: message,
                query_type: "general" as const,
                response_text: fullResponse.substring(0, 10000),
              });
            } catch {
              // Non-critical — don't fail the response
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          const errMsg = error instanceof Error ? error.message : "";
          const streamLang = lang === "tr" ? "tr" as const : "en" as const;
          if (errMsg.includes("SAFETY") || errMsg.includes("blocked") || errMsg.includes("RECITATION") || errMsg.includes("content policy")) {
            controller.enqueue(encoder.encode(tx("api.chat.safetyBlocked", streamLang)));
          } else if (errMsg.includes("429") || errMsg.includes("quota")) {
            controller.enqueue(encoder.encode(tx("api.chat.quotaShort", streamLang)));
          } else {
            controller.enqueue(encoder.encode(tx("api.chat.streamError", streamLang)));
          }
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    // This should rarely be reached now — only for truly unexpected errors
    console.error("Chat API unexpected error:", error);
    // Return a streaming text response instead of JSON 500 to avoid "Something went wrong"
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(
          "⚠️ Beklenmeyen bir hata oluştu. / An unexpected error occurred. Please refresh the page."
        ));
        controller.close();
      },
    });
    return new Response(errorStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  }
}

// Common Turkish health terms → English for PubMed
const TR_TO_EN: Record<string, string> = {
  "spor": "exercise", "egzersiz": "exercise",
  "uyku": "sleep", "uykusuzluk": "insomnia",
  "stres": "stress", "anksiyete": "anxiety",
  "kilo": "weight", "zayıflama": "weight loss", "diyet": "diet",
  "vitamin": "vitamin", "takviye": "supplement",
  "protein": "protein", "kas": "muscle",
  "enerji": "energy", "yorgunluk": "fatigue",
  "ağrı": "pain", "baş ağrısı": "headache", "mide": "stomach",
  "sindirim": "digestion", "bağırsak": "gut", "kabızlık": "constipation",
  "tansiyon": "blood pressure", "kolesterol": "cholesterol",
  "şeker": "blood sugar", "diyabet": "diabetes",
  "bağışıklık": "immunity", "soğuk algınlığı": "common cold",
  "cilt": "skin", "saç": "hair", "tırnak": "nail",
  "eklem": "joint", "kemik": "bone", "osteoporoz": "osteoporosis",
  "kalp": "heart", "damar": "cardiovascular",
  "karaciğer": "liver", "böbrek": "kidney",
  "demir": "iron", "ferritin": "ferritin",
  "omega": "omega-3", "balık yağı": "fish oil",
  "probiyotik": "probiotic", "prebiyotik": "prebiotic",
  "zerdeçal": "turmeric", "kurkumin": "curcumin",
  "zencefil": "ginger", "sarımsak": "garlic",
  "kediotu": "valerian", "papatya": "chamomile",
  "ekinezya": "echinacea", "ginseng": "ginseng",
  "ashwagandha": "ashwagandha", "melatonin": "melatonin",
  "kreatin": "creatine", "kafein": "caffeine",
  "workout": "pre-workout", "antrenman": "exercise training",
  "performans": "performance", "dayanıklılık": "endurance",
  "toparlanma": "recovery", "almak": "supplementation",
  "kullanmak": "use", "içmek": "intake",
  "istiyorum": "", "yapıyorum": "", "alıyorum": "",
};

function buildPubMedSearchQuery(message: string): string {
  // Extract health-related keywords, strip filler words
  const stopWords = new Set([
    "i", "me", "my", "the", "a", "an", "is", "are", "was", "were", "be",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "can", "may", "might", "shall", "for", "of", "to", "in",
    "on", "at", "by", "with", "from", "about", "what", "how", "why",
    "when", "where", "which", "that", "this", "it", "not", "no", "yes",
    "and", "or", "but", "if", "then", "so", "very", "really", "actually",
    "just", "also", "too", "much", "many", "some", "any", "all", "most",
    "want", "need", "like", "know", "think", "help", "take", "use",
    "ben", "benim", "bir", "ve", "ile", "için", "ne", "nasıl", "mi",
    "mı", "mu", "mü", "da", "de", "bu", "şu", "çok", "daha",
    "istiyorum", "yapıyorum", "alıyorum", "kullanıyorum", "var", "yok",
  ]);

  let lowerMsg = message.toLowerCase();

  // Translate Turkish health terms to English for PubMed
  const translatedTerms: string[] = [];
  for (const [tr, en] of Object.entries(TR_TO_EN)) {
    if (lowerMsg.includes(tr) && en) {
      translatedTerms.push(en);
    }
  }

  const words = lowerMsg
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Merge: translated English terms + any remaining English keywords from the message
  const englishWords = words.filter((w) => /^[a-z-]+$/i.test(w));
  const allKeywords = [...new Set([...translatedTerms, ...englishWords])];

  const keywords = allKeywords.slice(0, 6).join(" ");

  if (!keywords.trim()) {
    // Fallback: use the first meaningful words
    return "(herbal supplement) AND (evidence-based)";
  }

  // Add phytotherapy/supplement context
  return `(${keywords}) AND (phytotherapy OR herbal OR supplement OR evidence-based)`;
}
