// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Verification Rejected Email Template
// Compassionate tone — encourages resubmission
// ============================================

import { tx, txp } from "@/lib/translations"
import type { Lang } from "@/lib/translations"

interface RejectedEmailProps {
  recipientName: string
  rejectionReason: string
  lang?: Lang
}

export function renderRejectedEmail({ recipientName, rejectionReason, lang = "en" }: RejectedEmailProps): string {
  const subject   = tx("email.rejected.subject", lang)
  const preheader = tx("email.rejected.preheader", lang)
  const greeting  = txp("email.greeting", lang, { name: recipientName })
  const body1     = tx("email.rejected.body1", lang)
  const reasonLabel = tx("email.rejected.reasonLabel", lang)
  const body2     = tx("email.rejected.body2", lang)
  const tips      = tx("email.rejected.tips", lang)
  const tip1      = tx("email.rejected.tip1", lang)
  const tip2      = tx("email.rejected.tip2", lang)
  const tip3      = tx("email.rejected.tip3", lang)
  const tip4      = tx("email.rejected.tip4", lang)
  const cta       = tx("email.rejected.cta", lang)
  const support   = tx("email.rejected.support", lang)
  const footer    = tx("email.footer", lang)
  const address   = "DoctoPal · Istanbul, Turkey"

  return `<!DOCTYPE html>
<html lang="${lang}" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${subject}</title>
  <style>
    :root { color-scheme: light dark; }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a2e !important; }
      .card-bg { background-color: #16213e !important; }
      .text-primary { color: #e2e8f0 !important; }
      .text-secondary { color: #94a3b8 !important; }
      .reason-bg { background-color: #1e1b4b !important; border-color: #4338ca !important; }
      .tip-bg { background-color: #1a2332 !important; }
    }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .inner { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;" class="email-bg">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;" class="email-bg">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:24px;font-weight:700;color:#2d5016;letter-spacing:-0.5px;">
            🌿 DoctoPal
          </span>
        </td></tr>

        <!-- Main Card -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);" class="card-bg">

            <!-- Header Bar (softer amber/orange) -->
            <tr><td style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:28px 40px;text-align:center;" class="inner">
              <div style="width:56px;height:56px;border-radius:50%;background-color:rgba(255,255,255,0.2);margin:0 auto 12px;line-height:56px;text-align:center;">
                <span style="font-size:28px;color:#ffffff;">📋</span>
              </div>
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">
                ${subject}
              </h1>
            </td></tr>

            <!-- Body -->
            <tr><td style="padding:32px 40px;" class="inner">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;" class="text-primary">
                ${greeting}
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;" class="text-secondary">
                ${body1}
              </p>

              <!-- Rejection Reason Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="background-color:#eef2ff;border:1px solid #c7d2fe;border-left:4px solid #6366f1;border-radius:8px;padding:16px 20px;" class="reason-bg">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px;">
                    ${reasonLabel}
                  </p>
                  <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;" class="text-primary">
                    ${rejectionReason}
                  </p>
                </td></tr>
              </table>

              <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;" class="text-secondary">
                ${body2}
              </p>

              <!-- Tips Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr><td style="background-color:#f1f5f9;border-radius:10px;padding:16px 20px;" class="tip-bg">
                  <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#334155;" class="text-primary">
                    💡 ${tips}:
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    ${[tip1, tip2, tip3, tip4].map(tip => `
                    <tr><td style="padding:3px 0;font-size:13px;color:#64748b;line-height:1.5;" class="text-secondary">
                      <span style="color:#059669;margin-right:6px;">✓</span>${tip}
                    </td></tr>`).join("")}
                  </table>
                </td></tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center">
                  <a href="https://doctopal.com/talent-hub/verify" target="_blank"
                    style="display:inline-block;background-color:#6366f1;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
                    ${cta} →
                  </a>
                </td></tr>
              </table>

              <!-- Support -->
              <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;text-align:center;" class="text-secondary">
                ${support}
              </p>
            </td></tr>

          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">${footer}</p>
          <p style="margin:0;font-size:12px;color:#94a3b8;">${address}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
