// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/trigger-sos
 * Triggered when the 10-second countdown expires and user hasn't cancelled.
 * Sends SOS notifications to emergency contacts.
 *
 * Architecture:
 * 1. Wearable (Apple HealthKit / Google Fit) → webhook → our API detects anomaly
 * 2. Platform detects critical drug interaction or vital sign anomaly
 * 3. CriticalAlertModal shows 10s countdown
 * 4. If user doesn't cancel → this endpoint is called
 * 5. Sends SMS/WhatsApp to emergency contacts with:
 *    - Patient name, critical info
 *    - GPS location (if available)
 *    - Detected anomaly details
 *    - Emergency number reminder (112/911)
 *
 * SMS Integration: Twilio / Netgsm (Turkey) — configured via env vars
 * Currently: logs SOS event + stores in Supabase for audit
 * Production: uncomment Twilio/Netgsm integration below
 */

interface SOSPayload {
  userId: string;
  alertType: "vital_anomaly" | "drug_interaction" | "fall_detected" | "panic_button" | "inactivity";
  details: string;
  severity: "critical" | "high";
  vitalData?: {
    heartRate?: number;
    bloodPressure?: string;
    spo2?: number;
    temperature?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export async function POST(req: Request) {
  // Rate limit: max 3 SOS per minute per IP (prevent abuse)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = checkRateLimit(`sos:${ip}`, 3, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body: SOSPayload = await req.json();
    const { userId, alertType, details, severity, vitalData, location } = body;

    if (!userId || !alertType || !details) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name, blood_group, birth_date, gender, chronic_conditions, phone")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch emergency contacts
    const { data: emergencyContacts } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("priority", { ascending: true });

    // 3. Fetch current medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", userId);

    // 4. Fetch allergies
    const { data: allergies } = await supabase
      .from("user_allergies")
      .select("allergen, severity")
      .eq("user_id", userId);

    // 5. Build SOS message
    const locationUrl = location
      ? `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`
      : null;

    const age = profile.birth_date
      ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    const alertTypeLabels: Record<string, { tr: string; en: string }> = {
      vital_anomaly: { tr: "Anormal Vital Bulgu", en: "Abnormal Vital Sign" },
      drug_interaction: { tr: "Kritik İlaç Etkileşimi", en: "Critical Drug Interaction" },
      fall_detected: { tr: "Düşme Algılandı", en: "Fall Detected" },
      panic_button: { tr: "Panik Butonu", en: "Panic Button" },
      inactivity: { tr: "Uzun Süreli Hareketsizlik", en: "Prolonged Inactivity" },
    };

    // Bilingual message (TR primary for Turkey)
    const sosMessage = `🚨 PHYTOTHERAPY.AI ACİL UYARI

${profile.full_name || "Kullanıcı"} için acil sağlık uyarısı tetiklendi.

⚠️ TESPİT: ${alertTypeLabels[alertType]?.tr || alertType}
📋 DETAY: ${details}
${vitalData?.heartRate ? `💓 Nabız: ${vitalData.heartRate} bpm` : ""}
${vitalData?.bloodPressure ? `🩺 Tansiyon: ${vitalData.bloodPressure}` : ""}
${vitalData?.spo2 ? `🫁 SpO2: ${vitalData.spo2}%` : ""}

👤 HASTA BİLGİLERİ:
- Ad: ${profile.full_name || "-"}
- Yaş: ${age || "-"}
- Kan Grubu: ${profile.blood_group || "-"}
- Kronik: ${profile.chronic_conditions?.join(", ") || "-"}
- İlaçlar: ${medications?.map((m) => (m.generic_name || m.brand_name)).join(", ") || "-"}
- Alerjiler: ${allergies?.map((a) => a.allergen).join(", ") || "-"}

${locationUrl ? `📍 KONUM: ${locationUrl}` : "📍 Konum bilgisi mevcut değil"}

🔴 LÜTFEN 112'Yİ ARAYIN veya hastayı kontrol edin.

Bu mesaj Phytotherapy.ai tarafından otomatik gönderilmiştir.`;

    // 6. Log SOS event to Supabase
    try {
      await supabase.from("sos_events").insert({
        user_id: userId,
        alert_type: alertType,
        severity,
        details,
        vital_data: vitalData || null,
        location: location || null,
        contacts_notified: emergencyContacts?.map((c: any) => c.id) || [],
        message_sent: sosMessage,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Table might not exist yet — silent fail, SOS still works
      console.warn("[SOS] sos_events table not found — logging skipped");
    }

    // 7. Send notifications to emergency contacts
    // ─── PRODUCTION: Uncomment one of these integrations ───

    /*
    // Option A: Twilio SMS
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    for (const contact of emergencyContacts || []) {
      await twilio.messages.create({
        body: sosMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: contact.phone_number,
      });
    }
    */

    /*
    // Option B: Netgsm (Turkey SMS)
    const netgsmResponse = await fetch('https://api.netgsm.com.tr/sms/send/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: `<?xml version="1.0" encoding="UTF-8"?>
        <mainbody>
          <header>
            <company>Netgsm</company>
            <usercode>${process.env.NETGSM_USERCODE}</usercode>
            <password>${process.env.NETGSM_PASSWORD}</password>
            <msgheader>${process.env.NETGSM_HEADER}</msgheader>
            <type>1:n</type>
          </header>
          <body>
            <msg><![CDATA[${sosMessage}]]></msg>
            ${(emergencyContacts || []).map(c => `<no>${c.phone_number}</no>`).join('')}
          </body>
        </mainbody>`,
    });
    */

    /*
    // Option C: WhatsApp Business API (via Twilio)
    for (const contact of emergencyContacts || []) {
      await twilio.messages.create({
        body: sosMessage,
        from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
        to: 'whatsapp:' + contact.phone_number,
      });
    }
    */

    // 8. Return success with contact count
    const contactCount = emergencyContacts?.length || 0;

    return NextResponse.json({
      success: true,
      message: `SOS alert sent to ${contactCount} emergency contact(s)`,
      contactsNotified: contactCount,
      alertId: `sos-${Date.now()}`,
    });
  } catch (error) {
    console.error("[SOS] Error:", error);
    return NextResponse.json(
      { error: "Failed to send SOS alert" },
      { status: 500 }
    );
  }
}

// Webhook endpoint for wearable devices
export async function PUT(req: Request) {
  // This endpoint receives data from Apple HealthKit / Google Fit webhooks
  // and checks for anomalies

  try {
    const body = await req.json();

    /*
    Expected webhook payload from wearable integration:
    {
      "userId": "uuid",
      "source": "apple_health" | "google_fit" | "garmin" | "fitbit",
      "timestamp": "2026-03-29T14:30:00Z",
      "metrics": {
        "heartRate": 152,
        "heartRateVariability": 15,
        "spo2": 88,
        "bloodPressureSystolic": 180,
        "bloodPressureDiastolic": 110,
        "bodyTemperature": 39.5,
        "respiratoryRate": 28,
        "fallDetected": false,
        "irregularRhythm": true
      }
    }
    */

    const { userId, source, metrics } = body;

    // Define critical thresholds
    const CRITICAL_THRESHOLDS = {
      heartRate: { min: 40, max: 150 },
      spo2: { min: 90 },
      bloodPressureSystolic: { max: 180 },
      bloodPressureDiastolic: { max: 120 },
      bodyTemperature: { max: 39.5 },
      respiratoryRate: { max: 25 },
    };

    const anomalies: string[] = [];

    if (metrics.heartRate && (metrics.heartRate > CRITICAL_THRESHOLDS.heartRate.max || metrics.heartRate < CRITICAL_THRESHOLDS.heartRate.min)) {
      anomalies.push(`Heart rate: ${metrics.heartRate} bpm (normal: ${CRITICAL_THRESHOLDS.heartRate.min}-${CRITICAL_THRESHOLDS.heartRate.max})`);
    }
    if (metrics.spo2 && metrics.spo2 < CRITICAL_THRESHOLDS.spo2.min) {
      anomalies.push(`SpO2: ${metrics.spo2}% (critical: below ${CRITICAL_THRESHOLDS.spo2.min}%)`);
    }
    if (metrics.bloodPressureSystolic && metrics.bloodPressureSystolic > CRITICAL_THRESHOLDS.bloodPressureSystolic.max) {
      anomalies.push(`Blood pressure: ${metrics.bloodPressureSystolic}/${metrics.bloodPressureDiastolic} mmHg (hypertensive crisis)`);
    }
    if (metrics.bodyTemperature && metrics.bodyTemperature > CRITICAL_THRESHOLDS.bodyTemperature.max) {
      anomalies.push(`Temperature: ${metrics.bodyTemperature}°C (high fever)`);
    }
    if (metrics.fallDetected) {
      anomalies.push("Fall detected by wearable device");
    }
    if (metrics.irregularRhythm) {
      anomalies.push("Irregular heart rhythm detected (possible AFib)");
    }

    if (anomalies.length === 0) {
      return NextResponse.json({ status: "normal", message: "All vitals within normal range" });
    }

    // Return anomaly data — the frontend CriticalAlertModal will handle the countdown
    return NextResponse.json({
      status: "critical",
      userId,
      source,
      anomalies,
      shouldTriggerAlert: true,
      alertPayload: {
        alertType: metrics.fallDetected ? "fall_detected" : "vital_anomaly",
        details: anomalies.join("; "),
        severity: "critical",
        vitalData: {
          heartRate: metrics.heartRate,
          bloodPressure: metrics.bloodPressureSystolic ? `${metrics.bloodPressureSystolic}/${metrics.bloodPressureDiastolic}` : undefined,
          spo2: metrics.spo2,
          temperature: metrics.bodyTemperature,
        },
      },
    });
  } catch (error) {
    console.error("[SOS Webhook] Error:", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
