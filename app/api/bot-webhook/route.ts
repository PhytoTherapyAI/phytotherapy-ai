// ============================================
// Bot Webhook — Receives incoming messages
// from WhatsApp (Twilio) and Telegram Bot API
// POST /api/bot-webhook
// ============================================
//
// Twilio WhatsApp sends: { From: "whatsapp:+905551234567", Body: "1" }
// Telegram sends: { message: { chat: { id }, text: "tamam" } }
//

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { COMPLETION_KEYWORDS, PAUSE_KEYWORDS, RESUME_KEYWORDS, MESSAGE_TEMPLATES } from "@/lib/bot-channels"

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || ""
    const supabase = createServerClient()

    // ── Detect source: Twilio (form-encoded) or Telegram (JSON) ──
    let channel: "whatsapp" | "telegram"
    let channelId: string
    let messageText: string

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // ── TWILIO WHATSAPP ──
      const formData = await req.formData()
      const from = formData.get("From") as string || ""        // "whatsapp:+905551234567"
      const body = formData.get("Body") as string || ""
      channel = "whatsapp"
      channelId = from.replace("whatsapp:", "")
      messageText = body.trim().toLowerCase()

      console.log(`[BOT-WEBHOOK] WhatsApp from ${channelId}: "${body}"`)
    } else {
      // ── TELEGRAM BOT API ──
      const data = await req.json()
      const message = data.message || data.edited_message
      if (!message?.text) {
        return NextResponse.json({ ok: true }) // ignore non-text (photos, stickers)
      }
      channel = "telegram"
      channelId = String(message.chat.id)
      messageText = message.text.trim().toLowerCase()

      console.log(`[BOT-WEBHOOK] Telegram from ${channelId}: "${message.text}"`)
    }

    // ── Find subscription ──
    const { data: subscription } = await supabase
      .from("bot_subscriptions")
      .select("*")
      .eq("channel", channel)
      .eq("channel_id", channelId)
      .single()

    if (!subscription) {
      console.log(`[BOT-WEBHOOK] No subscription for ${channel}:${channelId}`)
      return NextResponse.json({ ok: true, status: "no_subscription" })
    }

    const lang = subscription.language || "tr"

    // ── Log incoming message ──
    await supabase.from("bot_messages").insert({
      subscription_id: subscription.id,
      user_id: subscription.user_id,
      channel,
      direction: "incoming",
      content: messageText,
    })

    // ── Parse user intent ──
    const allCompletionWords = [...COMPLETION_KEYWORDS.en, ...COMPLETION_KEYWORDS.tr]
    const allPauseWords = [...PAUSE_KEYWORDS.en, ...PAUSE_KEYWORDS.tr]
    const allResumeWords = [...RESUME_KEYWORDS.en, ...RESUME_KEYWORDS.tr]

    let replyText = ""

    if (allCompletionWords.includes(messageText)) {
      // ── TASK COMPLETED ──
      await supabase
        .from("bot_subscriptions")
        .update({
          total_tasks_completed: (subscription.total_tasks_completed || 0) + 1,
          last_user_reply: new Date().toISOString(),
        })
        .eq("id", subscription.id)

      // Mark today's daily check-in as completed
      const today = new Date().toISOString().split("T")[0]
      await supabase.from("daily_check_ins").upsert({
        user_id: subscription.user_id,
        check_date: today,
        completed_via: channel,
      }, { onConflict: "user_id,check_date" })

      replyText = MESSAGE_TEMPLATES.taskCompleted[lang as "en" | "tr"]
    } else if (allPauseWords.includes(messageText)) {
      // ── PAUSE ──
      await supabase
        .from("bot_subscriptions")
        .update({ status: "paused", updated_at: new Date().toISOString() })
        .eq("id", subscription.id)

      replyText = MESSAGE_TEMPLATES.paused[lang as "en" | "tr"]
    } else if (allResumeWords.includes(messageText)) {
      // ── RESUME ──
      await supabase
        .from("bot_subscriptions")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("id", subscription.id)

      replyText = MESSAGE_TEMPLATES.resumed[lang as "en" | "tr"]
    } else {
      // ── UNKNOWN — acknowledge ──
      replyText = lang === "tr"
        ? "Mesajınız alındı. Görevleri tamamlamak için '1' veya 'tamam' yazın."
        : "Message received. Reply '1' or 'done' to mark tasks complete."
    }

    // ── Send reply ──
    if (channel === "whatsapp") {
      // Twilio expects TwiML response
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyText}</Message></Response>`
      return new Response(twiml, {
        headers: { "Content-Type": "text/xml" },
      })
    } else {
      // Telegram — send reply via Bot API
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: channelId,
            text: replyText,
            parse_mode: "Markdown",
          }),
        })
      }
      return NextResponse.json({ ok: true })
    }

  } catch (error) {
    console.error("[BOT-WEBHOOK] Error:", error)
    return NextResponse.json({ ok: true }) // always 200 for webhooks
  }
}

// Telegram webhook verification
export async function GET(req: Request) {
  return NextResponse.json({ status: "ok", service: "phytotherapy-bot-webhook" })
}
