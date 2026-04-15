// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Bot Daily Send — Cron Job Endpoint
// POST /api/bot-send
// Called by: Vercel Cron, external cron, or manual trigger
//
// Flow:
// 1. Get all active subscriptions for current hour
// 2. For each user: generate personalized daily plan via AI
// 3. Send via WhatsApp (Twilio) or Telegram Bot API
// 4. Log sent message + update subscription stats
//
// Performance: Uses queue-like batch processing
// - Max 50 users per invocation (prevents timeout)
// - Vercel serverless: 10s timeout → ~50 messages feasible
// ============================================

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { MESSAGE_TEMPLATES } from "@/lib/bot-channels"
import { tx } from "@/lib/translations"

const BATCH_SIZE = 50

// ── Twilio WhatsApp Send ──
async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886" // sandbox

  if (!accountSid || !authToken) {
    return true // dev mode
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: `whatsapp:${to}`,
        Body: message,
      }),
    })
    const data = await res.json()
    return data.sid ? true : false
  } catch (error) {
    console.error(`[BOT-SEND] Twilio error for ${to}:`, error)
    return false
  }
}

// ── Telegram Send ──
async function sendTelegram(chatId: string, message: string, buttons?: string[][]): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    return true // dev mode
  }

  try {
    const body: {
      chat_id: string
      text: string
      parse_mode: string
      reply_markup?: { inline_keyboard: { text: string; callback_data: string }[][] }
    } = {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }

    // Add inline keyboard buttons for Telegram
    if (buttons) {
      body.reply_markup = {
        inline_keyboard: buttons.map(row => row.map(text => ({ text, callback_data: text.toLowerCase() }))),
      }
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return data.ok === true
  } catch (error) {
    console.error(`[BOT-SEND] Telegram error for ${chatId}:`, error)
    return false
  }
}

// ── Generate Daily Tasks (simplified — no AI call for speed) ──
function generateDailyTasks(lang: string): string[] {
  const tasks = {
    en: [
      "Take your morning medications on time",
      "Drink 8 glasses of water today",
      "Take a 20-minute walk",
      "Log your mood in the app",
      "Review your supplement schedule",
    ],
    tr: [
      "Sabah ilaçlarınızı zamanında alın",
      "Bugün 8 bardak su için",
      "20 dakikalık bir yürüyüş yapın",
      "Ruh halinizi uygulamaya kaydedin",
      "Takviye programınızı gözden geçirin",
    ],
  }
  // Return 3-4 random tasks
  const all = tasks[lang as "en" | "tr"] || tasks.tr
  const shuffled = all.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3 + Math.floor(Math.random() * 2))
}

// ── Main Handler ──
export async function POST(req: Request) {
  // Verify cron secret (prevent unauthorized triggers)
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    // Also allow Vercel Cron (no auth header but from Vercel)
    const isVercelCron = req.headers.get("x-vercel-cron") === "true"
    if (!isVercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const supabase = createServerClient()
  const now = new Date()
  const currentHour = now.getUTCHours()
  const currentMinute = now.getUTCMinutes()

  // Turkey is UTC+3, so 09:00 TR = 06:00 UTC
  // We match send_time against current time (±5 min window)
  const trHour = (currentHour + 3) % 24
  const targetTime = `${String(trHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`
  const targetHour = `${String(trHour).padStart(2, "0")}:`


  // Get active subscriptions matching current hour
  const { data: subscriptions, error } = await supabase
    .from("bot_subscriptions")
    .select("*")
    .eq("status", "active")
    .eq("daily_plan_enabled", true)
    .like("send_time", `${targetHour}%`)
    .limit(BATCH_SIZE)

  if (error || !subscriptions) {
    console.error("[BOT-SEND] DB error:", error)
    return NextResponse.json({ error: "DB error", sent: 0 })
  }


  let sent = 0
  let failed = 0

  for (const sub of subscriptions) {
    const lang = sub.language || "tr"
    const tasks = generateDailyTasks(lang)
    const name = sub.display_name || "there"

    // Generate message from template
    const template = MESSAGE_TEMPLATES.dailyPlan[sub.channel as "whatsapp" | "telegram"]
    const message = template[lang as "en" | "tr"](name, tasks)

    // Send based on channel
    let success = false
    if (sub.channel === "whatsapp") {
      success = await sendWhatsApp(sub.channel_id, message)
    } else if (sub.channel === "telegram") {
      const typedLang = (lang === "tr" ? "tr" : "en") as "en" | "tr"
      const buttons = [[tx("api.bot.btnDone", typedLang), tx("api.bot.btnPause", typedLang)]]
      success = await sendTelegram(sub.channel_id, message, buttons)
    }

    if (success) {
      sent++
      // Update subscription stats
      await supabase
        .from("bot_subscriptions")
        .update({
          last_message_sent: now.toISOString(),
          total_messages_sent: (sub.total_messages_sent || 0) + 1,
        })
        .eq("id", sub.id)

      // Log outgoing message
      await supabase.from("bot_messages").insert({
        subscription_id: sub.id,
        user_id: sub.user_id,
        channel: sub.channel,
        direction: "outgoing",
        content: message,
        sent_at: now.toISOString(),
      })
    } else {
      failed++
    }
  }


  // ── Phase 2: Nudge Check ──
  let nudgesSent = 0
  try {
    const { checkNudgeTriggers } = await import("@/lib/nudge-engine")
    const { buildNudgePrompt, NUDGE_FALLBACKS } = await import("@/lib/nudge-prompts")

    const nudges = await checkNudgeTriggers(supabase)

    for (const nudge of nudges) {
      const nudgeSub = subscriptions?.find(s => s.user_id === nudge.userId)
        || (await supabase.from("bot_subscriptions").select("*").eq("user_id", nudge.userId).eq("status", "active").limit(1).single()).data || null

      if (!nudgeSub) continue

      let message: string
      try {
        const { askGemini } = await import("@/lib/ai-client")
        const { systemPrompt, userPrompt } = buildNudgePrompt(nudge.trigger, nudge.context, nudge.lang)
        message = await askGemini(userPrompt, systemPrompt)
        if (message.length > 1600) message = message.slice(0, 1597) + "..."
      } catch {
        const name = String(nudge.context.userName || "friend")
        if (nudge.trigger === "streak") {
          message = NUDGE_FALLBACKS.streak[nudge.lang](name, Number(nudge.context.streakDays || 7))
        } else if (nudge.trigger === "risk_alert") {
          message = NUDGE_FALLBACKS.risk_alert[nudge.lang](
            String(nudge.context.medication || "medication"),
            String(nudge.context.supplement || "supplement")
          )
        } else {
          message = NUDGE_FALLBACKS.drop_off[nudge.lang](name, Number(nudge.context.missedDays || 2))
        }
      }

      let success = false
      if (nudgeSub.channel === "whatsapp") {
        success = await sendWhatsApp(nudgeSub.channel_id, message)
      } else if (nudgeSub.channel === "telegram") {
        success = await sendTelegram(nudgeSub.channel_id, message)
      }

      if (success) {
        nudgesSent++
        await supabase.from("nudge_log").insert({
          user_id: nudge.userId,
          trigger_type: nudge.trigger,
          channel: nudgeSub.channel,
          message_content: message,
          context: nudge.context,
        })
      }
    }
  } catch (nudgeErr) {
    console.error("[BOT-SEND] Nudge phase error:", nudgeErr)
  }

  return NextResponse.json({
    sent,
    failed,
    total: subscriptions.length,
    nudges: nudgesSent,
    timestamp: now.toISOString(),
  })
}
