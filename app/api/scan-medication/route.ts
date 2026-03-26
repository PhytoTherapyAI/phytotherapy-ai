import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const clientIP = getClientIP(req)
    const rateCheck = checkRateLimit(`scan:${clientIP}`, 5, 60_000)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` }, { status: 429 })
    }

    const { image, lang } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Remove data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "")

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = lang === "tr"
      ? `Bu bir ilaç kutusu veya takviye fotoğrafı. Lütfen şunları çıkar:
1. Marka adı (kutu üzerindeki)
2. Etken madde (jenerik ad)
3. Doz (mg/ml/IU)
4. Form (tablet/kapsül/likit)

JSON formatında yanıt ver:
{"brand_name": "...", "generic_name": "...", "dosage": "...", "form": "...", "confidence": "high/medium/low"}

Eğer okunamıyorsa: {"error": "Okunamadı", "confidence": "low"}`
      : `This is a photo of a medication box or supplement bottle. Please extract:
1. Brand name (on the box)
2. Active ingredient (generic name)
3. Dosage (mg/ml/IU)
4. Form (tablet/capsule/liquid)

Respond in JSON format:
{"brand_name": "...", "generic_name": "...", "dosage": "...", "form": "...", "confidence": "high/medium/low"}

If unreadable: {"error": "Cannot read", "confidence": "low"}`

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

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    )
  }
}
