// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`sbar-email:${clientIP}`, 5, 86_400_000); // 5 per day
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Daily email limit reached (5/day)" }, { status: 429 });
    }

    if (!resend) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const recipientEmail = sanitizeInput((body.email as string) || user.email || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";
    const pdfBase64 = body.pdfBase64 as string;

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!pdfBase64) {
      return NextResponse.json({ error: "PDF data required" }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    const subject = lang === "tr" ? "DoctoPal Sağlık Özet Raporun" : "Your DoctoPal Health Summary Report";

    await resend.emails.send({
      from: "DoctoPal <noreply@doctopal.com>",
      to: [recipientEmail],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3c7a52;">DoctoPal</h2>
          <p>${lang === "tr"
            ? "Sağlık özet raporun ekte. Doktor görüşmende kullanabilirsin."
            : "Your health summary report is attached. You can use it during your doctor visit."}</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
            ${lang === "tr"
              ? "Bu rapor tıbbi teşhis niteliği taşımaz. doctopal.com"
              : "This report does not constitute a medical diagnosis. doctopal.com"}
          </p>
        </div>
      `,
      attachments: [{
        filename: `DoctoPal-SBAR-${new Date().toISOString().split("T")[0]}.pdf`,
        content: pdfBuffer,
      }],
      tags: [{ name: "category", value: "sbar-report" }],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SBAR email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
