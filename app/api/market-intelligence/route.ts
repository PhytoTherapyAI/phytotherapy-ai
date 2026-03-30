// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import {
  PHYTO_COMPANIES,
  BOTANICAL_TRENDS,
  PATENT_FILINGS,
  REGULATORY_UPDATES,
  SECTOR_EVENTS,
  MARKET_KPIS,
  CORRELATION_DATA,
} from "@/lib/market-intelligence-data";

export async function GET(request: NextRequest) {
  // Rate limit: 15 requests per minute per IP
  const ip = getClientIP(request);
  const rl = checkRateLimit(`market:${ip}`, 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later.", resetInSeconds: rl.resetInSeconds },
      { status: 429 }
    );
  }

  const section = request.nextUrl.searchParams.get("section") || "overview";

  switch (section) {
    case "overview":
      return NextResponse.json({
        kpis: MARKET_KPIS,
        events: SECTOR_EVENTS,
      });

    case "trends":
      return NextResponse.json({
        botanicals: BOTANICAL_TRENDS,
      });

    case "companies":
      return NextResponse.json({
        companies: PHYTO_COMPANIES,
        correlation: CORRELATION_DATA,
      });

    case "patents":
      return NextResponse.json({
        patents: PATENT_FILINGS,
        regulatory: REGULATORY_UPDATES,
      });

    case "correlation":
      return NextResponse.json({
        correlation: CORRELATION_DATA,
      });

    default:
      return NextResponse.json(
        { error: `Unknown section: ${section}. Valid: overview, trends, companies, patents, correlation` },
        { status: 400 }
      );
  }
}
