// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { askClaudeJSONMultimodal } from "@/lib/ai-client"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { tx } from "@/lib/translations"

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limit
    const clientIP = getClientIP(req)
    const rateCheck = checkRateLimit(`scan:${clientIP}`, 5, 60_000)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` }, { status: 429 })
    }

    const body = await req.json()
    const { image } = body
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr"

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Remove data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "")

    const prompt = tx("api.scanMedication.promptTr", lang)

    const systemPrompt = "You are a medication identification assistant. Analyze the image and extract medication information. Respond in JSON format."

    const result = await askClaudeJSONMultimodal(
      prompt,
      systemPrompt,
      [{ mimeType: "image/jpeg", base64: base64Data }]
    )

    let parsed;
    try { parsed = JSON.parse(result); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    )
  }
}
