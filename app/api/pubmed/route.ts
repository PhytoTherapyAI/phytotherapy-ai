import { NextRequest, NextResponse } from "next/server";
import { searchPubMed } from "@/lib/pubmed";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (!query || query.trim().length === 0) {
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

    return NextResponse.json({ articles, count: articles.length });
  } catch (error) {
    console.error("PubMed API error:", error);
    return NextResponse.json(
      { error: "Failed to search PubMed" },
      { status: 500 }
    );
  }
}
