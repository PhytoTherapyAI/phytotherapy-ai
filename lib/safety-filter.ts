// © 2026 Doctopal — All Rights Reserved
// Turkey 112 Emergency Triage Protocol + ESI-based Safety Filter
//
// Seviye 1 (KIRMIZI): Hayati tehlike — popup ile 112'ye yönlendir, AI cevap vermez
// Seviye 2 (SARI): Potansiyel tehlike — AI cevap verir ama güçlü disclaimer ekler
// Seviye 3 (YEŞİL): Güvenli — normal AI cevabı
//
// Safe Context: Bilinen zararsız bağlamlar (regl, diş eti kanaması vb.) → triyaj bypass

// ═══════════════════════════════════════════════
// KIRMIZI KOD — 112 Acil, popup, AI cevap vermez
// Türkiye 112 Triyaj Protokolü Seviye 1 (Kırmızı Alan)
// ═══════════════════════════════════════════════

const RED_CODE_EN = [
  // Airway (A) — Havayolu tıkanıklığı
  "choking", "can't breathe", "can't breathe at all", "airway blocked",
  "throat swelling", "tongue swelling",
  // Breathing (B) — Solunum durması / ciddi solunum yetmezliği
  "stopped breathing", "not breathing", "drowning",
  "blue lips", "cyanosis",
  // Circulation (C) — Dolaşım yetmezliği
  "heart attack", "cardiac arrest", "heart stopped", "no pulse",
  "severe bleeding", "uncontrollable bleeding", "bleeding won't stop",
  "vomiting blood", "coughing blood", "blood in stool black stool",
  // Disability (D) — Nörolojik acil
  "loss of consciousness", "unconscious", "unresponsive",
  "passed out not waking", "seizure", "convulsion",
  "stroke", "sudden weakness one side", "sudden speech difficulty",
  "sudden vision loss",
  // Exposure (E) — Travma / Çevresel
  "gunshot", "stabbing", "stab wound", "severe burn", "electrocution",
  "skull fracture", "head injury", "spinal injury",
  // Anaphylaxis
  "anaphylaxis", "severe allergic reaction",
  // Self-harm
  "suicidal", "suicide", "self harm", "want to die", "kill myself",
  // Toxicology
  "poisoning", "overdose", "took too many pills",
  // OB emergencies
  "eclampsia", "pregnancy seizure", "cord prolapse",
  // Other absolute
  "testicular torsion", "sudden severe testicle pain",
  // Meningitis
  "stiff neck fever rash", "meningitis",
];

const RED_CODE_TR = [
  // Havayolu (A)
  "boğuluyorum", "nefes alamıyorum", "nefes yolu tıkandı",
  "boğaz şişmesi", "dil şişmesi",
  // Solunum (B)
  "nefes durdu", "nefes almıyor", "suda boğulma",
  "dudaklar morardı", "morarma", "siyanoz",
  // Dolaşım (C)
  "kalp krizi", "kalp durması", "kalbim durdu", "nabız yok",
  "şiddetli kanama", "kanama durmuyor", "kontrol edilemeyen kanama",
  "kan kusma", "kan tükürme", "siyah dışkı", "kanlı ishal",
  // Nörolojik (D)
  "bilinç kaybı", "bilinci kapalı", "bayıldı uyanmıyor",
  "nöbet", "kasılma", "sara krizi",
  "felç", "inme", "bir taraf güçsüzlük",
  "konuşamıyorum birden", "ani görme kaybı",
  // Travma (E)
  "bıçaklandım", "ateşli silah", "şiddetli yanık", "elektrik çarpması",
  "kafa travması", "omurilik yaralanması",
  // Anafilaksi
  "anafilaksi", "şiddetli alerji", "alerji şoku",
  // İntihar
  "intihar", "kendime zarar", "ölmek istiyorum", "kendimi öldürmek",
  // Toksikoloji
  "zehirlenme", "zehirlendim", "doz aşımı", "ilaç fazla aldım",
  // OB acil
  "gebelik nöbeti", "hamilelik kramp şiddetli",
  // Diğer
  "testis dönmesi", "ani şiddetli testis ağrısı",
  // Menenjit
  "ense sertliği ateş", "menenjit",
];

// ═══════════════════════════════════════════════
// SARI KOD — AI cevap verir ama güçlü uyarı ekler
// 112 Triyaj Protokolü Seviye 2 (Sarı Alan)
// ═══════════════════════════════════════════════

const YELLOW_CODE_EN = [
  // Respiratory
  "shortness of breath", "difficulty breathing", "hard to breathe",
  "chest tightness", "wheezing",
  "asthma attack not responding to inhaler",
  // Cardiac
  "chest pain", "chest hurts", "pain in chest",
  "irregular heartbeat", "palpitations at rest", "heart racing at rest",
  // Neurological
  "worst headache ever", "thunderclap headache",
  "confusion", "disorientation", "difficulty speaking",
  "sudden hearing loss",
  // Abdominal
  "severe abdominal pain", "severe stomach pain",
  "rigid abdomen",
  // Bleeding (non-massive)
  "bleeding", "hemorrhage", "blood",
  // Fever
  "high fever above 39", "fever won't go down", "very high temperature",
  // Metabolic
  "diabetic emergency", "very high blood sugar", "very low blood sugar",
  "hypoglycemia", "shaking sweating",
  // Other
  "blood in urine", "severe back pain radiating",
  "eye pain vision changes",
  "panic attack can't calm down",
  "severe dehydration", "persistent vomiting",
  "sudden swelling",
  "fainting", "feeling faint", "almost passed out",
];

const YELLOW_CODE_TR = [
  // Solunum
  "nefes darlığı", "zor nefes alıyorum", "nefesim daralıyor",
  "göğüste sıkışma", "hırıltı",
  "astım krizi inhaler işe yaramıyor",
  // Kardiyak
  "göğüs ağrısı", "göğsüm ağrıyor", "göğsüm acıyor",
  "düzensiz kalp atışı", "istirahatte çarpıntı", "kalbim çok hızlı atıyor",
  // Nörolojik
  "hayatımın en kötü baş ağrısı", "şiddetli ani baş ağrısı",
  "bilinç bulanıklığı", "konuşma güçlüğü",
  "ani işitme kaybı",
  // Karın
  "şiddetli karın ağrısı", "şiddetli mide ağrısı",
  "karın sert taş gibi",
  // Kanama (masif olmayan)
  "kanama", "kanıyor", "kan geliyor", "kanamam var",
  // Ateş
  "yüksek ateş", "ateş 39 üstü", "ateş düşmüyor", "çok yüksek ateş",
  // Metabolik
  "diyabet acil", "çok yüksek şeker", "çok düşük şeker",
  "hipoglisemi", "titreme terleme",
  // Diğer
  "idrarda kan", "sırta vuran şiddetli ağrı",
  "göz ağrısı görme değişikliği",
  "panik atak sakinleşemiyorum",
  "şiddetli susuzluk", "sürekli kusma",
  "ani şişlik",
  "bayılma hissi", "bayılacak gibi", "gözüm kararıyor",
];

// ═══════════════════════════════════════════════
// SAFE CONTEXT — Bu kelimeler varsa triyaj bypass
// ═══════════════════════════════════════════════

const SAFE_CONTEXTS_EN = [
  // Menstrual
  "period", "menstrual", "menstruation", "period bleeding", "period cramps",
  "menstrual cramps", "period pain",
  // Minor bleeding / dental
  "gum bleeding", "gums bleed", "gums when brushing", "bleeding when brushing",
  "when i brush", "while brushing", "after brushing", "flossing",
  "nose bleed", "nosebleed",
  "hemorrhoid", "paper cut", "small cut", "shaving cut",
  "pimple", "acne", "hangnail", "minor cut",
  // Exercise related
  "after running", "after exercise", "climbing stairs", "out of shape",
  "muscle soreness", "sore from exercise", "after gym", "after workout",
  // Common minor
  "mild fever", "low grade fever", "slight temperature",
  "tension headache", "stress headache", "hangover",
  "after coffee", "after caffeine", "after energy drink",
  "period cramps", "gas pain", "ate too much", "food didn't agree",
  "stood up too fast", "haven't eaten", "hungry",
  "migraine as usual",
];

const SAFE_CONTEXTS_TR = [
  // Regl
  "regl", "adet", "âdet", "mensturasyon", "menstrüel",
  "regl kanaması", "adet kanaması", "adet ağrısı", "regl ağrısı",
  // Hafif kanama / diş
  "diş eti", "diş fırça", "fırçalarken", "fırçalayınca", "diş ipi",
  "dişimi fırçalarken", "fırçaladığımda", "fırçaladıktan sonra",
  "burun kanaması", "basur", "hemoroid",
  "kesik", "küçük kesik", "tıraş", "sivilce", "hafif kanama",
  // Egzersiz
  "koşu sonrası", "merdiven çıkınca", "egzersiz sonrası", "spor sonrası",
  "kas ağrısı", "spordan sonra ağrı",
  // Hafif durumlar
  "hafif ateş", "düşük ateş", "biraz ateşim var",
  "stres baş ağrısı", "gerilim baş ağrısı", "akşamdan kalma",
  "kahve sonrası", "kafein", "enerji içeceği",
  "adet krampı", "gaz sancısı", "çok yedim", "hazımsızlık", "mide ekşimesi",
  "hızlı kalktım", "yemek yemedim", "açlıktan",
  "her zamanki migren",
];

// ═══════════════════════════════════════════════
// MAIN CHECK FUNCTION
// ═══════════════════════════════════════════════

export type TriageResult =
  | { type: "red_code"; language: "en" | "tr"; matchedFlags: string[] }
  | { type: "yellow_code"; language: "en" | "tr"; matchedFlags: string[] }
  | { type: "safe" };

// Backward compat alias
export type { TriageResult as RedFlagResult };

export function checkRedFlags(input: string): TriageResult {
  const lower = input.toLowerCase().replace(/[.,!?;:]/g, " ");

  // Step 0: Check safe contexts FIRST — if present, skip all triage
  const enSafe = SAFE_CONTEXTS_EN.some((ctx) => lower.includes(ctx));
  const trSafe = SAFE_CONTEXTS_TR.some((ctx) => lower.includes(ctx));
  if (enSafe || trSafe) {
    return { type: "safe" };
  }

  // Step 1: RED CODE — absolute emergencies, popup + block
  const enRed = RED_CODE_EN.filter((flag) => lower.includes(flag));
  const trRed = RED_CODE_TR.filter((flag) => lower.includes(flag));
  if (enRed.length > 0 || trRed.length > 0) {
    return {
      type: "red_code",
      language: trRed.length > 0 ? "tr" : "en",
      matchedFlags: [...enRed, ...trRed],
    };
  }

  // Step 2: YELLOW CODE — AI responds but with strong disclaimer
  const enYellow = YELLOW_CODE_EN.filter((flag) => lower.includes(flag));
  const trYellow = YELLOW_CODE_TR.filter((flag) => lower.includes(flag));
  if (enYellow.length > 0 || trYellow.length > 0) {
    return {
      type: "yellow_code",
      language: trYellow.length > 0 ? "tr" : "en",
      matchedFlags: [...enYellow, ...trYellow],
    };
  }

  // Step 3: SAFE — no flags detected
  return { type: "safe" };
}

// ═══════════════════════════════════════════════
// EMERGENCY MESSAGE
// ═══════════════════════════════════════════════

export function getEmergencyMessage(language: "en" | "tr"): string {
  if (language === "tr") {
    return "🚨 **ACİL DURUM TESPİT EDİLDİ**\n\nBelirttiğiniz durum hayati tehlike içerebilir. **Lütfen derhal 112'yi arayın** veya en yakın acil servise başvurun.\n\n⛔ Bu durumda hiçbir bitkisel takviye veya ev tedavisi uygulanmamalıdır.\n\n📞 **112 Acil Yardım** — 7/24 ücretsiz";
  }
  return "🚨 **EMERGENCY DETECTED**\n\nYour symptoms may indicate a life-threatening condition. **Please call 911/112 immediately** or go to the nearest emergency room.\n\n⛔ Do not attempt any herbal supplements or home remedies in this situation.\n\n📞 **Call 112/911** — 24/7 free";
}

export function getYellowWarning(language: "en" | "tr"): string {
  if (language === "tr") {
    return "\n\n⚠️ **Önemli Uyarı:** Bu bilgiler genel bilgilendirme amaçlıdır ve doktor muayenesinin yerini tutmaz. Belirtileriniz devam ederse veya kötüleşirse lütfen **doktorunuza başvurun**. Acil bir durum hissederseniz 112'yi arayın.";
  }
  return "\n\n⚠️ **Important Notice:** This information is for general guidance only and does not replace a doctor's examination. If your symptoms persist or worsen, please **consult your doctor**. If you feel it's an emergency, call 112/911.";
}

// ═══════════════════════════════════════════════
// LEGACY EXPORTS (backward compatibility)
// ═══════════════════════════════════════════════

// These are no longer used but kept for any remaining imports
export interface TriageQuestion {
  id: string;
  text: { en: string; tr: string };
  options: { label: { en: string; tr: string }; severity: number }[];
}

export interface TriageKeywordGroup {
  id: string;
  keywords: { en: string[]; tr: string[] };
  safeContexts: { en: string[]; tr: string[] };
  questions: TriageQuestion[];
  emergencyThreshold: number;
}

export function evaluateTriageAnswers(
  group: TriageKeywordGroup,
  answers: Record<string, number>
): { isEmergency: boolean; totalScore: number; threshold: number } {
  const totalScore = Object.values(answers).reduce((sum, s) => sum + s, 0);
  return { isEmergency: totalScore >= group.emergencyThreshold, totalScore, threshold: group.emergencyThreshold };
}
