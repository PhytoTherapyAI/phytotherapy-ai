// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSONMultimodal } from "@/lib/ai-client";
import { RADIOLOGY_ANALYSIS_PROMPT } from "@/lib/prompts";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const IMAGE_TYPES = ["xray", "ct", "mri", "ultrasound", "report"] as const;

export async function POST(req: NextRequest) {
  // Rate limit — 3 per minute
  const ip = getClientIP(req);
  const rl = checkRateLimit(`radiology:${ip}`, 3, 60_000);
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
    const imageType = (formData.get("imageType") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload an image (JPEG, PNG) or PDF." },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Build prompt with language and image type context
    const userLang = tx("api.respondLang", lang);
    const typeHint = IMAGE_TYPES.includes(imageType as typeof IMAGE_TYPES[number])
      ? `\n\nThe user indicated this is a ${imageType.toUpperCase()} image/report. Use this context to guide your analysis.`
      : "";

    const prompt = `Analyze this radiology image or report. Respond entirely in ${userLang}.${typeHint}

If this is a text-based report (PDF), extract the key findings and translate them into plain language.
If this is a medical image, describe what you observe and explain each finding simply.`;

    // Call Gemini Vision
    const result = await askGeminiJSONMultimodal(
      prompt,
      RADIOLOGY_ANALYSIS_PROMPT,
      [{ mimeType: file.type, base64 }]
    );

    let analysis;
    try {
      analysis = JSON.parse(result);
    } catch {
      return NextResponse.json(
        { error: "Could not analyze the image. Please try a clearer image or report." },
        { status: 422 }
      );
    }

    // Validate response structure
    if (!analysis.findings && !analysis.summary) {
      return NextResponse.json(
        { error: "Analysis returned incomplete results. Please try again." },
        { status: 422 }
      );
    }

    // Ensure required fields exist with defaults
    const response = {
      success: true,
      imageType: analysis.imageType || "unknown",
      overallUrgency: analysis.overallUrgency || "normal",
      summary: analysis.summary || "",
      findings: Array.isArray(analysis.findings) ? analysis.findings : [],
      glossary: Array.isArray(analysis.glossary) ? analysis.glossary : [],
      doctorDiscussion: Array.isArray(analysis.doctorDiscussion) ? analysis.doctorDiscussion : [],
      limitations: Array.isArray(analysis.limitations) ? analysis.limitations : [],
      disclaimer: analysis.disclaimer || tx("api.radiology.disclaimer", lang),
    };

    // Save to Supabase if authenticated
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Radiology analysis: ${response.imageType} — ${response.findings.length} findings`,
            response_text: response.summary,
            query_type: "general",
          });
        }
      } catch {
        // Non-critical — saving is optional
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Radiology analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze radiology image" },
      { status: 500 }
    );
  }
}
