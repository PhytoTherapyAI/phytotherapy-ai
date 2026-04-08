// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { searchPubMed } from "@/lib/pubmed";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting — 20 requests per minute
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`pubmed:${clientIP}`, 20, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = sanitizeInput(searchParams.get("q") || "");
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (!query || query.length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: "Query too long (max 500 characters)" },
        { status: 400 }
      );
    }

    const articles = await searchPubMed(query.trim(), Math.min(limit, 10));

    return NextResponse.json(
      { articles, count: articles.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("PubMed API error:", error);
    return NextResponse.json(
      { error: "Failed to search PubMed" },
      { status: 500 }
    );
  }
}
