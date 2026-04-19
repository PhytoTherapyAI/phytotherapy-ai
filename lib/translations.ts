// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Centralized Translation System — v2.0
// ============================================
//
// 🌍 YENİ DİL EKLEMEK İÇİN:
//
// 1. SUPPORTED_LANGUAGES dizisine yeni dil ekle (aşağıda)
// 2. Lang type'a yeni dili ekle
// 3. Her çeviri key'ine yeni dil alanını ekle
// 4. Bitti! Navbar toggle ve tüm sayfalar otomatik çalışır.
//
// Örnek: Arapça eklemek için:
//   - SUPPORTED_LANGUAGES'a { code: "ar", label: "العربية", short: "AR", flag: "sa" } ekle
//   - Lang type'a "ar" ekle
//   - Her key'e ar: "..." ekle
//
// ============================================

// ── Desteklenen Diller ──────────────────────
// Yeni dil eklerken SADECE buraya satır ekle + aşağıdaki t objesine çevirileri ekle
export const SUPPORTED_LANGUAGES = [
  { code: "en" as const, label: "English", short: "EN", flag: null, dir: "ltr" },
  { code: "tr" as const, label: "Türkçe", short: "TR", flag: "tr", dir: "ltr" },
  // { code: "ar", label: "العربية", short: "AR", flag: "sa", dir: "rtl" },
  // { code: "de", label: "Deutsch", short: "DE", flag: "de", dir: "ltr" },
] as const

export type Lang = (typeof SUPPORTED_LANGUAGES)[number]["code"]
export const DEFAULT_LANG: Lang = "en"

// ── Çeviri Tipi ─────────────────────────────
// Her key'in tüm desteklenen dillerde çevirisi olmalı
export type TranslationEntry = Record<Lang, string>

// ── Çeviriler ───────────────────────────────
// Yeni dil eklerken her key'e yeni alan ekle (örn: ar: "...")

// ── Modular namespace imports ──
import { newNavKeys } from "./translations/newNavKeys"
import { referralKeys } from "./translations/referralKeys"
import { healthAnalyticsKeys } from "./translations/healthAnalyticsKeys"
import { valueMarketplaceKeys } from "./translations/valueMarketplaceKeys"
import { commonToolKeys } from "./translations/commonToolKeys"

// ── Modular namespace imports (split for maintainability) ──
import { authTranslations } from "./translations/auth"
import { commonTranslations } from "./translations/common"
import { healthTranslations } from "./translations/health"
import { legalTranslations } from "./translations/legal"
import { onboardingTranslations } from "./translations/onboarding"
import { toolsTranslations } from "./translations/tools"
import { familyTranslations } from "./translations/family"
import { landingTranslations } from "./translations/landing"

const t: Record<string, TranslationEntry> = {}

// Merge all namespace modules
Object.assign(t, authTranslations)
Object.assign(t, commonTranslations)
Object.assign(t, healthTranslations)
Object.assign(t, legalTranslations)
Object.assign(t, onboardingTranslations)
Object.assign(t, toolsTranslations)
Object.assign(t, familyTranslations)
Object.assign(t, landingTranslations)


// ══════════════════════════════════════════
// API
// ══════════════════════════════════════════

/**
 * Translation helper — returns the string for the given key and language.
 * Falls back to English, then to the key itself.
 */
export function tx(key: string, lang: Lang): string {
  const entry = t[key]
  if (!entry) return key
  return entry[lang] ?? entry[DEFAULT_LANG] ?? key
}

/**
 * Extract a localized value from a bilingual object like { en: "...", tr: "..." }.
 * Works with any object that has lang-keyed properties.
 * Also handles variants like { nameEn, nameTr } or { titleEN, titleTR }.
 */
export function txObj(obj: Record<string, any>, lang: Lang, fallback = ""): string {
  if (!obj) return fallback
  // Direct: { en: "...", tr: "..." }
  if (obj[lang] !== undefined) return obj[lang]
  // camelCase: { nameEn, nameTr }
  const camel = lang === "tr" ? "Tr" : "En"
  for (const key of Object.keys(obj)) {
    if (key.endsWith(camel) && typeof obj[key] === "string") return obj[key]
  }
  // UPPER: { titleEN, titleTR }
  const upper = lang.toUpperCase()
  for (const key of Object.keys(obj)) {
    if (key.endsWith(upper) && typeof obj[key] === "string") return obj[key]
  }
  // Fallback to other language
  const otherLang = lang === "tr" ? "en" : "tr"
  if (obj[otherLang] !== undefined) return obj[otherLang]
  return fallback
}

/**
 * Parameterized translation: replaces {key} placeholders with values.
 * Example: txp("items.count", lang, { count: 5 }) → "5 items saved"
 */
export function txp(key: string, lang: Lang, params: Record<string, string | number>): string {
  let result = tx(key, lang)
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
  }
  return result
}

/**
 * Get a random message from a language-keyed message array.
 * Used for fun/motivational messages (water, meds, etc.)
 *
 * To add a new language: add the language key to each array in MESSAGE_ARRAYS below.
 */
export function txRandom(key: string, lang: Lang): string {
  const arr = MESSAGE_ARRAYS[key]
  if (!arr) return key
  const langArr = arr[lang] ?? arr[DEFAULT_LANG]
  if (!langArr || langArr.length === 0) return key
  return langArr[Math.floor(Math.random() * langArr.length)]
}

export function txMessages(key: string, lang: Lang): string[] {
  const arr = MESSAGE_ARRAYS[key]
  if (!arr) return []
  return arr[lang] ?? arr[DEFAULT_LANG] ?? []
}

// ══════════════════════════════════════════
// Message Arrays — fun/motivational messages
// ══════════════════════════════════════════
// 🌍 YENİ DİL EKLERKEN: Her diziye yeni dil key'i ekle

const MESSAGE_ARRAYS: Record<string, Record<string, string[]>> = {
  "msg.waterDone": {
    en: [
      "🎉 Daily goal reached! Your cells are partying!",
      "🏆 Water champion! Hydration level: BOSS!",
      "💪 Hydration master! Glow mode activated!",
      "🌊 Goal crushed! Your kidneys are doing a happy dance!",
      "💧 Perfectly hydrated! Skin is glowing!",
      "🐬 Dolphin level hydration! Smooth sailing!",
    ],
    tr: [
      "🎉 Günlük hedefe ulaştın! Hücrelerin parti yapıyor!",
      "🏆 Su şampiyonu! Hidrasyon seviyesi: BOSS!",
      "💪 Hidrasyon ustası! Parlama modu aktif!",
      "🌊 Hedef ezildi! Böbreklerin mutluluk dansı yapıyor!",
      "💧 Mükemmel hidrasyon! Cilt parlıyor!",
      "🐬 Yunus seviye hidrasyon! Harika gidiyorsun!",
    ],
  },
  "msg.waterOver": {
    en: [
      "😄 Overachiever! Water lover!",
      "🐟 Growing gills? Just kidding — amazing!",
      "🌊 Your kidneys are sending thank you cards!",
      "💧 Above and beyond! Hydration hero!",
      "🏊 Olympic swimmer level hydration!",
      "🧊 Ice cold dedication! You're unstoppable!",
      "🫧 Bubble level unlocked! Keep flowing!",
      "🌈 Your cells are throwing a pool party!",
      "🚿 At this rate you'll need a snorkel!",
      "💎 Diamond tier hydration achieved!",
      "🐠 The fish are jealous of your water intake!",
      "🌊 Tsunami of health incoming!",
      "🧜 Mermaid/Merman transformation: 87% complete!",
      "💦 Even camels are impressed right now!",
      "🌴 Your body is basically an oasis at this point!",
      "🎮 Achievement unlocked: Hydration Overlord!",
      "🛁 Your blood is so clean it sparkles!",
      "🔱 Poseidon just followed you on Instagram!",
      "🎪 Your bladder is planning a protest march!",
      "🏆 Hall of Fame: Water Drinking Division!",
    ],
    tr: [
      "😄 Hedefin üstündesin! Su aşığı!",
      "🐟 Solungaç mı çıkarıyorsun? Şaka — harikasın!",
      "🌊 Böbreklerin teşekkür kartı gönderiyor!",
      "💧 Hedefin ötesinde! Hidrasyon kahramanısın!",
      "🏊 Olimpik yüzücü seviye hidrasyon!",
      "🧊 Buz gibi kararlılık! Durdurulamıyorsun!",
      "🫧 Kabarcık seviyesi açıldı! Akmaya devam!",
      "🌈 Hücrelerin havuz partisi veriyor!",
      "🚿 Bu gidişle şnorkele ihtiyacın olacak!",
      "💎 Elmas seviye hidrasyon kazanıldı!",
      "🐠 Balıklar su içme kapasiteni kıskanıyor!",
      "🌊 Sağlık tsunamisi yaklaşıyor!",
      "🧜 Deniz kızı/erkeği dönüşümü: %87 tamamlandı!",
      "💦 Develer bile etkilendi şu an!",
      "🌴 Vücudun artık bir vaha resmen!",
      "🎮 Başarım açıldı: Hidrasyon Lordu!",
      "🛁 Kanın o kadar temiz ki pırıl pırıl!",
      "🔱 Poseidon seni Instagram'da takip etti!",
      "🎪 Mesanen protesto yürüyüşü planlıyor!",
      "🏆 Şöhretler Salonu: Su İçme Dalı!",
    ],
  },
  "msg.waterSplash": {
    en: ["Nice sip! 💧", "Splash! 🌊", "Glug glug! 💦", "+1 glass! 💧", "Refreshing! 🥤", "H₂O power! 💙", "Keep it up! 💧", "Hydrated! 💦", "Your body loves this! 🫧", "Flow state! 🌊"],
    tr: ["Güzel yudum! 💧", "Şıp! 🌊", "Glu glu! 💦", "+1 bardak! 💧", "Ferahlatıcı! 🥤", "H₂O gücü! 💙", "Devam! 💧", "Hidratasyon! 💦", "Vücudun bunu seviyor! 🫧", "Akış modunda! 🌊"],
  },
  "msg.medDone": {
    en: [
      "Another one down! 💊", "Legend! Your body is cheering! 👏", "Took your meds? You're a hero! 🦸",
      "Discipline on point today! 🎯", "Pop pop pop! Steady steps to health! 🚀",
      "Your meds love you back! 💚", "One more down! Consistency = superpower! 💪",
      "Check! Your health routine is fire! 💣", "You're on a roll today! ✨",
      "Meds taken, soul fed! Your body thanks you 🙏", "Your doctor would be proud! 👨‍⚕️",
      "Got it! Easy peasy! 😎", "Meds? Done. You? Incredible! 🌟", "Health bar filled! +10 HP! 🎮",
    ],
    tr: [
      "Bi ilacı daha hallettin! 💊", "Efsane! Vücudun alkışlıyor! 👏", "İlaç mı aldın? Sen bir kahramansın! 🦸",
      "Bugün de disiplini bozmadın! 🎯", "Hap hap hap! Sağlık yolunda emin adımlar! 🚀",
      "İlaçların seni seviyor! 💚", "Bi' hap daha gitti! Düzenli kullanım = süper güç! 💪",
      "Check! Sağlık rutinin bomba! 💣", "Bugün formundasın! ✨",
      "İlaç aldın, gönül aldın! Vücudun teşekkür ediyor 🙏", "Doktorun görse gurur duyardı! 👨‍⚕️",
      "Tamam, bi tane daha gitti! Kolay gelsin! 😎", "İlaç? Alındı. Sen? Muhteşemsin! 🌟", "Sağlık bar'ın doldu! +10 HP! 🎮",
    ],
  },
  "msg.allMedsDone": {
    en: [
      "🎉 All meds taken! You're a legend!",
      "🏆 Perfect score! Nothing missed! Bravo!",
      "💯 100% complete! Boss fight won!",
      "🌟 All done! Health level up!",
    ],
    tr: [
      "🎉 Bugünkü tüm ilaçlarını aldın! Sen bir efsanesin!",
      "🏆 Tam puan! Bugün eksiksiz! Bravo!",
      "💯 %100 tamamlama! Boss fight kazanıldı!",
      "🌟 Hepsini hallettin! Sağlık level atladın!",
    ],
  },
}

// ══════════════════════════════════════════
// New Feature Navigation Keys (Phase C-F)
// [newNavKeys] extracted to ./translations/newNavKeys.ts

// ══════════════════════════════════════════
// Referral System
// [referralKeys] extracted to ./translations/referralKeys.ts

// [healthAnalyticsKeys] extracted to ./translations/healthAnalyticsKeys.ts

// ══════════════════════════════════════════
// Value-Based Marketplace
// [valueMarketplaceKeys] extracted to ./translations/valueMarketplaceKeys.ts

// ══════════════════════════════════════════
// Common / Shared Tool Keys
// [commonToolKeys] extracted to ./translations/commonToolKeys.ts

// ── Merge namespace modules into main t object ──
Object.assign(t, newNavKeys)
Object.assign(t, referralKeys)
Object.assign(t, healthAnalyticsKeys)
Object.assign(t, valueMarketplaceKeys)
Object.assign(t, commonToolKeys)

/**
 * Export the raw translations object for iteration.
 */
export { t, MESSAGE_ARRAYS }
