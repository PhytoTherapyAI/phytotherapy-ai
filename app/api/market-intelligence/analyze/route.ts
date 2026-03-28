import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";
import {
  BOTANICAL_TRENDS,
  PHYTO_COMPANIES,
  SECTOR_EVENTS,
  REGULATORY_UPDATES,
} from "@/lib/market-intelligence-data";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a phytotherapy market intelligence analyst working for an investor-focused health platform.
Analyze botanical publication trends, company performance data, and regulatory changes.
Provide investment-relevant early signals, sector outlook, and risk alerts.
Respond ONLY in valid JSON with the exact structure requested. Be specific, data-driven, and actionable.`;

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per minute
  const ip = getClientIP(request);
  const rl = checkRateLimit(`market-ai:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later.", resetInSeconds: rl.resetInSeconds },
      { status: 429 }
    );
  }

  try {
    const trendSummary = BOTANICAL_TRENDS.map((b) => ({
      name: b.name,
      growth: `${b.growthPercent}%`,
      publications: b.pubmedCountCurrent,
      market: `$${b.marketSizeBillions}B`,
    }));

    const companySummary = PHYTO_COMPANIES.slice(0, 4).map((c) => ({
      name: c.name,
      symbol: c.symbol,
      price: c.currentPrice,
      change: `${c.dailyChangePercent}%`,
      marketCap: `$${c.marketCapBillions}B`,
    }));

    const recentEvents = SECTOR_EVENTS.slice(0, 5).map((e) => ({
      type: e.type,
      company: e.company,
      detail: e.detail,
    }));

    const recentRegulatory = REGULATORY_UPDATES.slice(0, 5).map((r) => ({
      title: r.title,
      agency: r.agency,
      impact: r.impactLevel,
      status: r.status,
    }));

    const prompt = `Analyze this phytotherapy market data and provide investment intelligence:

BOTANICAL TRENDS: ${JSON.stringify(trendSummary)}
COMPANIES: ${JSON.stringify(companySummary)}
RECENT EVENTS: ${JSON.stringify(recentEvents)}
REGULATORY: ${JSON.stringify(recentRegulatory)}

Return JSON with this exact structure:
{
  "earlySignals": [
    { "signal": "string describing the signal", "signalTr": "Turkish translation", "confidence": "high|medium|low", "botanical": "related botanical or sector" }
  ],
  "sectorOutlook": {
    "summary": "2-3 sentence English outlook",
    "summaryTr": "Turkish translation of outlook",
    "bullishFactors": ["factor1", "factor2", "factor3"],
    "bullishFactorsTr": ["faktor1", "faktor2", "faktor3"],
    "bearishFactors": ["factor1", "factor2"],
    "bearishFactorsTr": ["faktor1", "faktor2"]
  },
  "riskAlerts": [
    { "risk": "English risk description", "riskTr": "Turkish translation", "severity": "high|medium|low", "sector": "affected sector" }
  ]
}

Provide 3-5 early signals, 3 bullish factors, 2 bearish factors, and 2-3 risk alerts.`;

    const raw = await askGeminiJSON(prompt, SYSTEM_PROMPT);
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Market intelligence AI error:", error);
    return NextResponse.json(
      { error: "Failed to generate market analysis. Please try again." },
      { status: 500 }
    );
  }
}
