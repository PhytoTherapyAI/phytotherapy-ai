// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Smart Nudge — LLM Prompt Templates
// Generates personalized coaching messages
// ============================================

import { NudgeTrigger } from "@/lib/nudge-engine";

interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

export function buildNudgePrompt(
  trigger: NudgeTrigger,
  context: Record<string, string | number>,
  lang: "en" | "tr"
): PromptPair {
  const langName = lang === "tr" ? "Turkish" : "English";

  switch (trigger) {
    case "drop_off":
      return {
        systemPrompt: `You are Phytotherapy.ai's motivational health coach.
Generate a SHORT (2-3 sentences max, under 160 characters) WhatsApp message to gently motivate a user who hasn't been active.
Be warm and caring, NOT guilt-tripping. Sound like a supportive friend.
If you know their name, use it naturally.
Respond in ${langName}.
NEVER use clinical or robotic language.`,
        userPrompt: `Name: ${context.userName || "friend"}. They haven't logged in for ${context.missedDays} days. Last active: ${context.lastActiveDate}. Write a warm, short motivational nudge.`,
      };

    case "streak":
      return {
        systemPrompt: `You are Phytotherapy.ai's celebration coach.
Generate a SHORT (2-3 sentences, under 160 characters) congratulatory WhatsApp message.
Include a fun emoji. Be genuinely excited. Sound like a proud friend.
Respond in ${langName}.`,
        userPrompt: `Name: ${context.userName || "champion"}. They completed a ${context.streakDays}-day streak! Celebrate this achievement enthusiastically but briefly.`,
      };

    case "risk_alert":
      return {
        systemPrompt: `You are Phytotherapy.ai's safety advisor.
Generate a CLEAR, URGENT but calm WhatsApp message about a drug-supplement interaction.
Format: ⚠️ [Brief risk description] → ✅ [Clear action step]
MUST be under 200 characters. No medical jargon. Be direct but not alarming.
Respond in ${langName}.
Always end with "Consult your doctor" / "Doktorunuza danışın".`,
        userPrompt: `${context.medication} may interact with ${context.supplement}. Risk: ${context.riskLevel}. Mechanism: ${context.mechanism}. Write a clear, calm safety alert.`,
      };

    default:
      return {
        systemPrompt: `You are Phytotherapy.ai's health coach. Write a short, friendly health tip. Respond in ${langName}.`,
        userPrompt: `Write a brief motivational health message for ${context.userName || "the user"}.`,
      };
  }
}

// ── Fallback templates (used when AI is unavailable) ──
export const NUDGE_FALLBACKS = {
  drop_off: {
    en: (name: string, days: number) =>
      `Hey ${name}! We noticed you've been away for ${days} days. Your health goals miss you! 💚 Open the app and check today's plan.`,
    tr: (name: string, days: number) =>
      `Selam ${name}! ${days} gündür seni göremedik. Sağlık hedeflerin seni bekliyor! 💚 Uygulamayı aç ve bugünün planına bak.`,
  },
  streak: {
    en: (name: string, days: number) =>
      `🔥 ${name}, you're on FIRE! ${days}-day streak! Your consistency is inspiring. Keep crushing it!`,
    tr: (name: string, days: number) =>
      `🔥 ${name}, harikasın! ${days} günlük seri! Tutarlılığın ilham verici. Böyle devam!`,
  },
  risk_alert: {
    en: (med: string, supp: string) =>
      `⚠️ Important: ${med} may interact with ${supp}. Please check your schedule or consult your doctor. Your safety comes first.`,
    tr: (med: string, supp: string) =>
      `⚠️ Önemli: ${med} ile ${supp} etkileşebilir. Programınızı kontrol edin veya doktorunuza danışın. Güvenliğiniz önce gelir.`,
  },
};
