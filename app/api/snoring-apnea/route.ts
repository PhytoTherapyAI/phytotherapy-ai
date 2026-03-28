import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`snoring:${clientIP}`, 20, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const answers = body.answers as boolean[];
    const lang = body.lang || "en";

    if (!answers || answers.length !== 8) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    const score = answers.filter(Boolean).length;

    let risk: string;
    let riskLabel: string;
    let recommendation: string;

    if (score <= 2) {
      risk = "low";
      riskLabel = lang === "tr" ? "Dusuk Risk" : "Low Risk";
      recommendation = lang === "tr"
        ? "STOP-BANG skorunuz dusuk riskli. Semptomlariniz devam ederse doktorunuza danisiniz."
        : "Your STOP-BANG score indicates low risk. Consult your doctor if symptoms persist.";
    } else if (score <= 4) {
      risk = "moderate";
      riskLabel = lang === "tr" ? "Orta Risk" : "Moderate Risk";
      recommendation = lang === "tr"
        ? "STOP-BANG skorunuz orta dereceeli risk gosteriyor. Uyku laboratuvari degerlendirmesi icin doktorunuza danisiniz."
        : "Your STOP-BANG score indicates moderate risk. Consider consulting your doctor for sleep lab evaluation.";
    } else {
      risk = "high";
      riskLabel = lang === "tr" ? "Yuksek Risk" : "High Risk";
      recommendation = lang === "tr"
        ? "STOP-BANG skorunuz yuksek risk gosteriyor. Uyku laboratuvari degerlendirmesi icin doktorunuza basvurmaniz onerilir."
        : "Your STOP-BANG score indicates high risk. A sleep lab evaluation is strongly recommended. Please consult your doctor.";
    }

    return NextResponse.json({
      score,
      risk,
      riskLabel,
      recommendation,
    });
  } catch (error) {
    console.error("Snoring-apnea error:", error);
    return NextResponse.json({ error: "Failed to calculate" }, { status: 500 });
  }
}
