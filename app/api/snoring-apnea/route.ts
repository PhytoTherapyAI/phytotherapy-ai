import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

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
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!answers || answers.length !== 8) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    const score = answers.filter(Boolean).length;

    let risk: string;
    let riskLabel: string;
    let recommendation: string;

    if (score <= 2) {
      risk = "low";
      riskLabel = tx("api.snoring.lowRisk", lang);
      recommendation = tx("api.snoring.lowRiskRec", lang);
    } else if (score <= 4) {
      risk = "moderate";
      riskLabel = tx("api.snoring.moderateRisk", lang);
      recommendation = tx("api.snoring.moderateRiskRec", lang);
    } else {
      risk = "high";
      riskLabel = tx("api.snoring.highRisk", lang);
      recommendation = tx("api.snoring.highRiskRec", lang);
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
