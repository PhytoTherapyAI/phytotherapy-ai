// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import {
  SUPPLEMENT_PRODUCTS,
  VALUE_SCORE_RANKINGS,
  SAMPLE_ESCROW,
  RISK_REWARD_TIERS,
  PROVIDER_LEADERBOARD,
  computeValueScore,
} from "@/lib/value-marketplace-data";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = checkRateLimit(ip + ":value-marketplace", 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const section = req.nextUrl.searchParams.get("section") || "products";

  switch (section) {
    case "products":
      return NextResponse.json({
        products: [...SUPPLEMENT_PRODUCTS].sort((a, b) => b.valueScore - a.valueScore),
      });

    case "rankings":
      return NextResponse.json({
        rankings: VALUE_SCORE_RANKINGS,
      });

    case "escrow":
      return NextResponse.json({
        escrowAccounts: SAMPLE_ESCROW,
      });

    case "risk-reward":
      return NextResponse.json({
        tiers: RISK_REWARD_TIERS,
        leaderboard: PROVIDER_LEADERBOARD,
      });

    default:
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = checkRateLimit(ip + ":value-calc", 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { efficacy, safety, outcomes, costPerQALY } = body;

    if (
      typeof efficacy !== "number" ||
      typeof safety !== "number" ||
      typeof outcomes !== "number" ||
      typeof costPerQALY !== "number"
    ) {
      return NextResponse.json({ error: "Invalid input — all fields must be numbers" }, { status: 400 });
    }

    const valueScore = computeValueScore(efficacy, safety, outcomes, costPerQALY);

    return NextResponse.json({
      valueScore,
      breakdown: {
        efficacyWeighted: Math.round(efficacy * 0.4),
        safetyWeighted: Math.round(safety * 0.3),
        outcomesWeighted: Math.round(outcomes * 0.2),
        costWeighted: Math.round(Math.max(0, 100 - costPerQALY / 50) * 0.1),
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
