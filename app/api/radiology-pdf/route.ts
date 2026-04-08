// © 2026 DoctoPal — All Rights Reserved
import { NextRequest } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { RadiologyReport } from "@/components/pdf/RadiologyReport";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`rad-pdf:${clientIP}`, 5, 60_000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const { analysis } = body;

    if (!analysis) {
      return new Response(
        JSON.stringify({ error: "Analysis data required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const pdfStream = await ReactPDF.renderToStream(
      RadiologyReport({ analysis })
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="DoctoPal-Radiology-Report-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Radiology PDF error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
