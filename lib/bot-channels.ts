// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Omnichannel Bot — Data Schema & Config
// WhatsApp (Twilio) + Telegram Bot API
// ============================================

export type BotChannel = "whatsapp" | "telegram"
export type SubscriptionStatus = "active" | "paused" | "disconnected"

export interface BotSubscription {
  id: string
  userId: string
  channel: BotChannel
  // WhatsApp: phone number in E.164 format (+905551234567)
  // Telegram: chat_id from Telegram Bot API
  channelId: string
  displayName?: string       // user's name on channel
  status: SubscriptionStatus
  // Preferences
  dailyPlanEnabled: boolean
  sendTime: string           // HH:MM format, default "09:00"
  language: "en" | "tr"
  // Tracking
  lastMessageSent?: string   // ISO timestamp
  lastUserReply?: string     // ISO timestamp
  totalMessagesSent: number
  totalTasksCompleted: number
  // Timestamps
  connectedAt: string
  updatedAt: string
}

export interface BotMessage {
  id: string
  subscriptionId: string
  userId: string
  channel: BotChannel
  direction: "outgoing" | "incoming"
  content: string
  // For task completion tracking
  taskId?: string
  taskCompleted?: boolean
  // Timestamps
  sentAt: string
  deliveredAt?: string
  readAt?: string
}

// ── Channel Config ──
export const CHANNEL_CONFIG = {
  whatsapp: {
    name: "WhatsApp",
    icon: "MessageCircle",
    color: "#25D366",
    bgLight: "bg-green-50",
    bgDark: "dark:bg-green-950/20",
    description: {
      en: "Receive your daily health plan via WhatsApp. Reply '1' or 'Done' to mark tasks complete.",
      tr: "Günlük sağlık planınızı WhatsApp ile alın. Görevleri tamamlamak için '1' veya 'Tamam' yanıtlayın.",
    },
    setupSteps: {
      en: [
        "Enter your WhatsApp phone number below",
        "You'll receive a verification code via WhatsApp",
        "Enter the code to confirm your number",
        "Start receiving your daily health plan at 09:00!",
      ],
      tr: [
        "WhatsApp telefon numaranızı aşağıya girin",
        "WhatsApp üzerinden bir doğrulama kodu alacaksınız",
        "Numaranızı onaylamak için kodu girin",
        "Her sabah 09:00'da günlük sağlık planınızı almaya başlayın!",
      ],
    },
    // Twilio WhatsApp Sandbox for dev, Business API for prod
    provider: "twilio",
  },
  telegram: {
    name: "Telegram",
    icon: "Send",
    color: "#0088CC",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/20",
    description: {
      en: "Get your daily health plan on Telegram. Tap buttons to track your progress.",
      tr: "Günlük sağlık planınızı Telegram'dan alın. İlerlemenizi takip etmek için butonlara dokunun.",
    },
    setupSteps: {
      en: [
        "Open Telegram and search for @DoctopalBot",
        "Press 'Start' to activate the bot",
        "The bot will ask you to link your account",
        "Done! Your daily plan arrives at 09:00 every morning.",
      ],
      tr: [
        "Telegram'ı açın ve @DoctopalBot'u arayın",
        "'Başlat' butonuna basarak botu aktifleştirin",
        "Bot hesabınızı bağlamanızı isteyecek",
        "Tamam! Günlük planınız her sabah 09:00'da gelecek.",
      ],
    },
    botUsername: "@DoctopalBot",
    provider: "telegram-bot-api",
  },
}

// ── Message Templates ──
export const MESSAGE_TEMPLATES = {
  dailyPlan: {
    whatsapp: {
      en: (name: string, tasks: string[]) =>
        `🌿 Good morning ${name}!\n\nHere's your daily health plan:\n\n${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n✅ Reply *1* when you've completed your tasks\n⏸ Reply *pause* to pause daily messages`,
      tr: (name: string, tasks: string[]) =>
        `🌿 Günaydın ${name}!\n\nİşte günlük sağlık planınız:\n\n${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n✅ Görevleri tamamlayınca *1* yanıtlayın\n⏸ Günlük mesajları durdurmak için *durdur* yazın`,
    },
    telegram: {
      en: (name: string, tasks: string[]) =>
        `🌿 Good morning ${name}!\n\nYour daily health plan:\n\n${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
      tr: (name: string, tasks: string[]) =>
        `🌿 Günaydın ${name}!\n\nGünlük sağlık planınız:\n\n${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
    },
  },
  taskCompleted: {
    en: "🎉 Great job! Your tasks for today are marked as complete. Keep up the amazing work!",
    tr: "🎉 Harika! Bugünkü görevleriniz tamamlandı olarak işaretlendi. Böyle devam!",
  },
  paused: {
    en: "⏸ Daily messages paused. Send 'resume' anytime to restart.",
    tr: "⏸ Günlük mesajlar duraklatıldı. Yeniden başlatmak için 'devam' yazın.",
  },
  resumed: {
    en: "▶️ Daily messages resumed! You'll get your plan tomorrow at 09:00.",
    tr: "▶️ Günlük mesajlar yeniden başlatıldı! Planınız yarın 09:00'da gelecek.",
  },
  welcome: {
    en: "👋 Welcome to DoctoPal Daily Assistant! You'll receive personalized health tips every morning at 09:00.",
    tr: "👋 DoctoPal Günlük Asistan'a hoş geldiniz! Her sabah 09:00'da kişiselleştirilmiş sağlık önerileri alacaksınız.",
  },
}

// ── Reply Detection ──
export const COMPLETION_KEYWORDS = {
  en: ["1", "done", "completed", "yes", "ok", "finished", "tamam"],
  tr: ["1", "tamam", "tamamladım", "bitti", "evet", "ok", "yaptım"],
}
export const PAUSE_KEYWORDS = {
  en: ["pause", "stop", "mute", "quiet"],
  tr: ["durdur", "duraklat", "kapat", "sus"],
}
export const RESUME_KEYWORDS = {
  en: ["resume", "start", "continue", "unmute"],
  tr: ["devam", "başlat", "devam et", "aç"],
}
