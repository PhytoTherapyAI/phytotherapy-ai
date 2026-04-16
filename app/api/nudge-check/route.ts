// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Nudge Check — Cron + Manual Trigger
// POST /api/nudge-check
// Called by: Vercel Cron (18:00 TR), manual
// ============================================

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkNudgeTriggers } from "@/lib/nudge-engine";
import { buildNudgePrompt, NUDGE_FALLBACKS } from "@/lib/nudge-prompts";
import { askClaude } from "@/lib/ai-client";

export const maxDuration = 30;

// ── Twilio WhatsApp Send ──
async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  if (!accountSid || !authToken) return true; // dev mode

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: fromNumber, To: `whatsapp:${to}`, Body: message }),
    });
    const data = await res.json();
    return !!data.sid;
  } catch {
    return false;
  }
}

// ── Telegram Send ──
async function sendTelegram(chatId: string, message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return true; // dev mode

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Auth: verify cron secret or Vercel cron header
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "true";

  if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const targetUserId = body.userId as string | undefined;
  const dryRun = body.dryRun === true;

  const supabase = createServerClient();

  // Run trigger detection
  const nudges = await checkNudgeTriggers(supabase, targetUserId);

  if (dryRun) {
    return NextResponse.json({ nudges, dryRun: true, count: nudges.length });
  }

  let sent = 0;
  let failed = 0;

  for (const nudge of nudges) {
    // Find user's bot subscription
    const { data: sub } = await supabase
      .from("bot_subscriptions")
      .select("*")
      .eq("user_id", nudge.userId)
      .eq("status", "active")
      .limit(1)
      .single();

    if (!sub) continue;

    // Generate personalized message via LLM
    let message: string;
    try {
      const { systemPrompt, userPrompt } = buildNudgePrompt(nudge.trigger, nudge.context, nudge.lang);
      message = await askClaude(userPrompt, systemPrompt);
      // Truncate for WhatsApp
      if (message.length > 1600) message = message.slice(0, 1597) + "...";
    } catch {
      // Fallback to static template
      const name = String(nudge.context.userName || "friend");
      if (nudge.trigger === "drop_off") {
        message = NUDGE_FALLBACKS.drop_off[nudge.lang](name, Number(nudge.context.missedDays || 2));
      } else if (nudge.trigger === "streak") {
        message = NUDGE_FALLBACKS.streak[nudge.lang](name, Number(nudge.context.streakDays || 7));
      } else {
        message = NUDGE_FALLBACKS.risk_alert[nudge.lang](
          String(nudge.context.medication || "medication"),
          String(nudge.context.supplement || "supplement")
        );
      }
    }

    // Send via channel
    let success = false;
    if (sub.channel === "whatsapp") {
      success = await sendWhatsApp(sub.channel_id, message);
    } else if (sub.channel === "telegram") {
      success = await sendTelegram(sub.channel_id, message);
    }

    if (success) {
      sent++;
      // Log the nudge
      await supabase.from("nudge_log").insert({
        user_id: nudge.userId,
        trigger_type: nudge.trigger,
        channel: sub.channel,
        message_content: message,
        context: nudge.context,
      });
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    triggers: nudges.length,
    sent,
    failed,
    timestamp: new Date().toISOString(),
  });
}
