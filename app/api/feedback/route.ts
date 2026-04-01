// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const RATE_LIMIT = new Map<string, number[]>()

function checkRateLimit(ip: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now()
  const timestamps = RATE_LIMIT.get(ip)?.filter((t) => now - t < windowMs) || []
  if (timestamps.length >= max) return false
  timestamps.push(now)
  RATE_LIMIT.set(ip, timestamps)
  return true
}

const CATEGORY_EMOJI: Record<string, string> = {
  idea: "💡",
  love: "❤️",
  bug: "🐛",
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await req.json()
    // Support both old format (page_works/broken_description) and new format (category/message)
    const page = body.page || "unknown"
    const category = body.category || (body.page_works === false ? "bug" : body.page_works === true ? "love" : "idea")
    const message = body.message || body.feature_request || body.broken_description || ""
    const userId = body.user_id || null
    const lang = body.lang || "en"

    if (!page) {
      return NextResponse.json({ error: "Page is required" }, { status: 400 })
    }

    // Save to Supabase
    try {
      await supabase.from("feedback").insert({
        page,
        page_works: category !== "bug",
        broken_description: category === "bug" ? message : null,
        feature_request: category !== "bug" ? message : null,
        lang,
        created_at: new Date().toISOString(),
      })
    } catch (dbErr) {
      console.log("[FEEDBACK] DB save failed:", dbErr)
    }

    // Send Resend email
    if (resend) {
      try {
        const emoji = CATEGORY_EMOJI[category] || "📝"
        await resend.emails.send({
          from: "Phytotherapy.ai <noreply@phytotherapy.ai>",
          to: ["hello@phytotherapy.ai"],
          subject: `${emoji} [Feedback] ${category.toUpperCase()} — ${page}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 500px;">
              <h3 style="color: #7C3AED;">${emoji} New Feedback</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #666;">Category</td><td style="padding: 6px 0; font-weight: bold;">${category}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Page</td><td style="padding: 6px 0;">${page}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">User</td><td style="padding: 6px 0;">${userId || "anonymous"}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Lang</td><td style="padding: 6px 0;">${lang}</td></tr>
              </table>
              ${message ? `<div style="margin-top: 12px; padding: 12px; background: #f5f3ff; border-radius: 8px; font-size: 14px;">${message}</div>` : ""}
              <p style="color: #999; font-size: 11px; margin-top: 16px;">${new Date().toISOString()}</p>
            </div>
          `,
          tags: [{ name: "category", value: category }],
        })
      } catch (emailErr) {
        console.log("[FEEDBACK] Email failed:", emailErr)
      }
    }

    // Send to Telegram Bot — instant mobile notification
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN
    const telegramChatId = process.env.TELEGRAM_FEEDBACK_CHAT_ID
    if (telegramToken && telegramChatId) {
      try {
        const emoji = CATEGORY_EMOJI[category] || "📝"
        const text = [
          `${emoji} *Yeni Geri Bildirim!*`,
          ``,
          `*Kategori:* ${emoji} ${category}`,
          `*Sayfa:* \`${page}\``,
          `*Kullanıcı:* ${userId || "anonim"}`,
          `*Dil:* ${lang}`,
          ...(message ? [``, `*Mesaj:*`, message.slice(0, 500)] : []),
          ``,
          `_${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}_`,
        ].join("\n")

        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          signal: AbortSignal.timeout(8000),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text,
            parse_mode: "Markdown",
          }),
        })
      } catch {
        console.log("[FEEDBACK] Telegram notification failed")
      }
    }

    // Fallback: Discord webhook (if configured)
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_FEEDBACK_WEBHOOK
    if (discordWebhook) {
      try {
        const emoji = CATEGORY_EMOJI[category] || "📝"
        await fetch(discordWebhook, {
          method: "POST",
          signal: AbortSignal.timeout(8000),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [{
              title: `${emoji} Yeni Geri Bildirim Geldi!`,
              color: category === "idea" ? 0x22c55e : category === "love" ? 0xf43f5e : 0xf59e0b,
              fields: [
                { name: "Kategori", value: `${emoji} ${category}`, inline: true },
                { name: "Sayfa", value: `\`${page}\``, inline: true },
                { name: "Kullanıcı", value: userId || "anonim", inline: true },
                ...(message ? [{ name: "Mesaj", value: message.slice(0, 1024) }] : []),
              ],
              timestamp: new Date().toISOString(),
              footer: { text: "phytotherapy.ai feedback" },
            }],
          }),
        })
      } catch {
        console.log("[FEEDBACK] Discord webhook failed")
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[FEEDBACK-ERROR]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
