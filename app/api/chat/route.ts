import { NextRequest } from "next/server";
import { askGeminiStream, askGeminiStreamMultimodal } from "@/lib/gemini";
import type { GeminiFilePart } from "@/lib/gemini";
import { searchPubMed } from "@/lib/pubmed";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import { checkRedFlags, getEmergencyMessage } from "@/lib/safety-filter";
import { createServerClient } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, files } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
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
            `🚨 **${redFlagCheck.language === "tr" ? "ACİL UYARI" : "EMERGENCY WARNING"}**\n\n${emergencyMsg}`
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
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          const { data: meds } = await supabase
            .from("user_medications")
            .select("brand_name, generic_name, dosage")
            .eq("user_id", user.id)
            .eq("is_active", true);

          const { data: allergies } = await supabase
            .from("user_allergies")
            .select("allergen, severity")
            .eq("user_id", user.id);

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

    // Add PubMed sources
    if (articles.length > 0) {
      fullPrompt += "RELEVANT PUBMED RESEARCH (cite these in your response):\n";
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
    const stream = geminiFiles.length > 0
      ? await askGeminiStreamMultimodal(fullPrompt, systemPromptFull, geminiFiles)
      : await askGeminiStream(fullPrompt, systemPromptFull);

    // Convert Gemini stream to web ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();

          // Save query to history (fire and forget)
          if (userId) {
            try {
              const supabase = createServerClient();
              await supabase.from("query_history").insert({
                user_id: userId,
                query_text: message,
                query_type: "general" as const,
              });
            } catch {
              // Non-critical — don't fail the response
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          const errMsg = error instanceof Error ? error.message : "";
          // If Gemini safety filter or content policy blocked the request, show friendly message
          if (errMsg.includes("SAFETY") || errMsg.includes("blocked") || errMsg.includes("RECITATION") || errMsg.includes("content policy")) {
            controller.enqueue(encoder.encode(
              "I'm specialized in evidence-based health and phytotherapy questions. I can't help with other topics, but feel free to ask me anything health-related! For example: supplement recommendations, drug-herb interactions, blood test interpretation, or lifestyle advice."
            ));
          } else {
            controller.enqueue(encoder.encode("\n\n⚠️ An error occurred while generating the response. Please try again."));
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
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your question. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

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
  ]);

  const words = message.toLowerCase()
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const keywords = words.slice(0, 6).join(" ");

  // Add phytotherapy/supplement context
  return `(${keywords}) AND (phytotherapy OR herbal OR supplement OR evidence-based)`;
}
