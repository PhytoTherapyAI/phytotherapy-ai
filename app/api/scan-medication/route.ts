import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { createClient } from "@supabase/supabase-js"
import { tx } from "@/lib/translations"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = tx("api.scanMedication.promptTr", lang)

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
    ])

    const text = result.response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({
        error: "Could not parse medication info",
        raw: text,
      })
    }

    let parsed
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: "Could not parse medication info", raw: text }, { status: 422 })
    }
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    )
  }
}
