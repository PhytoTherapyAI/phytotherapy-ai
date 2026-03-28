// ============================================
// Verification Approved Email Template
// Compatible with all email clients + dark mode
// Inline styles only (no external CSS in emails)
// ============================================

interface ApprovedEmailProps {
  recipientName: string
  profession: string // e.g., "Physician", "Pharmacist"
  lang?: "en" | "tr"
}

export function renderApprovedEmail({ recipientName, profession, lang = "en" }: ApprovedEmailProps): string {
  const t = {
    subject: lang === "tr" ? "Tebrikler, Profiliniz Onaylandı!" : "Congratulations, Your Profile is Verified!",
    preheader: lang === "tr" ? "Artık Onaylı Sağlık Profesyonelisiniz" : "You are now a Verified Health Professional",
    greeting: lang === "tr" ? `Sayın ${recipientName},` : `Dear ${recipientName},`,
    body1: lang === "tr"
      ? "Profesyonel belgeleriniz ekibimiz tarafından başarıyla doğrulandı. Artık Phytotherapy.ai platformunda <strong>Onaylı Sağlık Profesyoneli</strong> rozetine sahipsiniz."
      : "Your professional credentials have been successfully verified by our team. You now have the <strong>Verified Health Professional</strong> badge on Phytotherapy.ai.",
    badgeText: lang === "tr" ? "Onaylı Sağlık Profesyoneli" : "Verified Health Professional",
    professionLabel: lang === "tr" ? "Doğrulanan Ünvan" : "Verified Title",
    body2: lang === "tr"
      ? "Bu rozet profilinizde görünür olacak ve arama sonuçlarında öncelikli sıralama, hasta güveni artışı ve kurumsal ortaklık fırsatları gibi ayrıcalıklar sunacaktır."
      : "This badge will be visible on your profile, offering benefits like priority search ranking, increased patient trust, and eligibility for institutional partnerships.",
    cta: lang === "tr" ? "Profilime Git" : "Go to My Profile",
    footer: lang === "tr"
      ? "Bu e-posta Phytotherapy.ai doğrulama sistemi tarafından otomatik gönderilmiştir."
      : "This email was sent automatically by the Phytotherapy.ai verification system.",
    address: "Phytotherapy.ai · Istanbul, Turkey",
  }

  return `<!DOCTYPE html>
<html lang="${lang}" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${t.subject}</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    :root { color-scheme: light dark; }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a2e !important; }
      .card-bg { background-color: #16213e !important; }
      .text-primary { color: #e2e8f0 !important; }
      .text-secondary { color: #94a3b8 !important; }
      .badge-bg { background-color: #064e3b !important; }
    }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .inner { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;" class="email-bg">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;">${t.preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;" class="email-bg">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:24px;font-weight:700;color:#2d5016;letter-spacing:-0.5px;">
            🌿 Phytotherapy.ai
          </span>
        </td></tr>

        <!-- Main Card -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);" class="card-bg">

            <!-- Green Header Bar -->
            <tr><td style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 40px;text-align:center;" class="inner">
              <!-- Check Circle -->
              <div style="width:64px;height:64px;border-radius:50%;background-color:rgba(255,255,255,0.2);margin:0 auto 16px;line-height:64px;text-align:center;">
                <span style="font-size:32px;color:#ffffff;">✓</span>
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                ${t.subject}
              </h1>
            </td></tr>

            <!-- Body -->
            <tr><td style="padding:32px 40px;" class="inner">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;" class="text-primary">
                ${t.greeting}
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;" class="text-secondary">
                ${t.body1}
              </p>

              <!-- Verified Badge Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:20px;text-align:center;" class="badge-bg">
                  <div style="font-size:40px;margin-bottom:8px;">🛡️</div>
                  <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#059669;">
                    ${t.badgeText}
                  </p>
                  <p style="margin:0;font-size:13px;color:#6b7280;" class="text-secondary">
                    ${t.professionLabel}: <strong style="color:#1e293b;" class="text-primary">${profession}</strong>
                  </p>
                </td></tr>
              </table>

              <p style="margin:0 0 32px;font-size:14px;color:#64748b;line-height:1.7;" class="text-secondary">
                ${t.body2}
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center">
                  <a href="https://phytotherapy.ai/talent-hub" target="_blank"
                    style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
                    ${t.cta} →
                  </a>
                </td></tr>
              </table>
            </td></tr>

          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">${t.footer}</p>
          <p style="margin:0;font-size:12px;color:#94a3b8;">${t.address}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
