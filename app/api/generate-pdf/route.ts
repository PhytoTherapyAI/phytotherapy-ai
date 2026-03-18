import { NextRequest } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { DoctorReport } from "@/components/pdf/DoctorReport";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — 5 PDFs per minute per IP
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`pdf:${clientIP}`, 5, 60_000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const { results, analysis, patientInfo } = body;

    if (!results || !analysis) {
      return new Response(
        JSON.stringify({ error: "Results and analysis are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate PDF buffer
    const pdfStream = await ReactPDF.renderToStream(
      DoctorReport({ results, analysis, patientInfo })
    );

    // Convert Node stream to Web ReadableStream
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="PhytotherapyAI-BloodTest-Report-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF report" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
