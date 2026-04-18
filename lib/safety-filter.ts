// © 2026 DoctoPal — All Rights Reserved
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
  // Anaphylaxis (simple triggers)
  "anaphylaxis", "severe allergic reaction",
  // Self-harm (simple triggers)
  "suicidal", "suicide", "self harm", "want to die", "kill myself",
  // Toxicology
  "poisoning", "overdose", "took too many pills",
  // OB emergencies
  "eclampsia", "pregnancy seizure", "cord prolapse",
  // Other absolute
  "testicular torsion", "sudden severe testicle pain",
  // Meningitis
  "stiff neck fever rash", "meningitis",
  // ── Pediatric acil (FAZ 3.1) ──
  "baby not breathing", "infant blue", "newborn seizure",
  "baby high fever under 3 months", "infant unresponsive",
  "child severe lethargy", "baby limp", "infant not waking",
  // ── Mental health eşik yükseltme (FAZ 3.2) ──
  "plan to kill myself", "wrote goodbye note", "have the pills",
  "tonight is the night", "saying goodbye", "final message",
  "ready to end it",
  // ── Anaphylaxis pattern — bileşik (FAZ 3.3) ──
  "bee sting shortness of breath", "peanut throat closing",
  "face swelling after eating", "hives throat closing",
  "lip swelling allergic", "swollen tongue allergic",
  // ── Stroke FAST + cardiac atypical (FAZ 3.4) ──
  "face drooping", "arm numb sudden", "slurred speech sudden",
  "jaw pain with chest", "left arm numbness",
  "chest pain radiating to jaw", "cold sweat chest pressure",
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
  // Anafilaksi (basit tetikleyiciler)
  "anafilaksi", "şiddetli alerji", "alerji şoku",
  // İntihar (basit tetikleyiciler)
  "intihar", "kendime zarar", "ölmek istiyorum", "kendimi öldürmek",
  // Toksikoloji
  "zehirlenme", "zehirlendim", "doz aşımı", "ilaç fazla aldım",
  // OB acil
  "gebelik nöbeti", "hamilelik kramp şiddetli",
  // Diğer
  "testis dönmesi", "ani şiddetli testis ağrısı",
  // Menenjit
  "ense sertliği ateş", "menenjit",
  // ── Pediatric acil (FAZ 3.1) ──
  "bebek nefes almıyor", "bebek morarıyor", "bebek moraniyor",
  "yenidoğan nöbet", "3 aylıktan küçük ateş", "bebek ateşi yüksek",
  "çocuk tepki vermiyor", "bebek uyanmıyor", "bebek sarkık",
  "çocuk halsiz uyanmıyor",
  // ── Mental health eşik yükseltme (FAZ 3.2) ──
  "intihar planım var", "veda notu yazdım", "ilaçları topladım",
  "bu gece yapacağım", "vedalaşıyorum", "son mesajım",
  "bitirmeye hazırım", "plan yaptım kendime zarar",
  // ── Anaphylaxis pattern — bileşik (FAZ 3.3) ──
  "arı soktu nefes daralıyor", "fıstık yedim boğazım kapanıyor",
  "yemek sonrası yüz şişiyor", "kurdeşen boğaz kapanıyor",
  "dudak şişmesi alerji", "dil şişmesi alerji",
  // ── Stroke FAST + cardiac atypical (FAZ 3.4) ──
  "yüzde sarkma", "ani kol uyuşması", "birden peltek konuşma",
  "çene ağrısı göğüs", "sol kol uyuşması",
  "göğüs ağrısı çeneye vuruyor", "soğuk ter göğüs sıkışması",
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
  // Menstrual / Gynecological
  "period", "menstrual", "menstruation", "period bleeding", "period cramps",
  "menstrual cramps", "period pain", "spotting", "light period",
  // Dental / Oral
  "gum bleeding", "gums bleed", "gums when brushing", "bleeding when brushing",
  "when i brush", "while brushing", "after brushing", "flossing",
  "wisdom tooth", "dental", "dentist", "toothache", "mouthwash",
  "braces", "gum disease", "gingivitis",
  // Nasal
  "nose bleed", "nosebleed", "dry nose", "picking nose",
  // Minor skin / wound
  "hemorrhoid", "paper cut", "small cut", "shaving cut",
  "pimple", "acne", "hangnail", "minor cut", "scratch", "scrape",
  "razor burn", "ingrown hair", "blister", "mosquito bite", "insect bite",
  // Exercise / Exertion
  "after running", "after exercise", "climbing stairs", "out of shape",
  "muscle soreness", "sore from exercise", "after gym", "after workout",
  "post workout", "leg day", "cramp after exercise", "side stitch",
  // Digestive (minor)
  "gas pain", "ate too much", "food didn't agree", "bloated", "bloating",
  "indigestion", "heartburn", "acid reflux", "constipation",
  // Common minor
  "mild fever", "low grade fever", "slight temperature",
  "tension headache", "stress headache", "hangover",
  "after coffee", "after caffeine", "after energy drink",
  "period cramps", "stood up too fast", "haven't eaten", "hungry",
  "migraine as usual", "seasonal allergy", "hay fever", "runny nose",
  "common cold", "mild cold", "sore throat", "dry throat",
  "eye strain", "screen fatigue", "tired eyes",
  "sunburn", "mild sunburn", "chapped lips", "dry skin",
];

const SAFE_CONTEXTS_TR = [
  // Regl / Jinekolojik
  "regl", "adet", "âdet", "mensturasyon", "menstrüel",
  "regl kanaması", "adet kanaması", "adet ağrısı", "regl ağrısı",
  "lekelenme", "hafif adet", "adet düzensizliği",
  // Diş / Ağız
  "diş eti", "diş fırça", "fırçalarken", "fırçalayınca", "diş ipi",
  "dişimi fırçalarken", "fırçaladığımda", "fırçaladıktan sonra",
  "diş ağrısı", "dişçi", "diş hekimi", "ağız gargarası",
  "diş teli", "gingivit", "yirmilik diş", "diş çürüğü",
  // Burun
  "burun kanaması", "kuru burun", "burun karıştır",
  // Hafif cilt / yara
  "basur", "hemoroid", "kesik", "küçük kesik", "tıraş", "sivilce",
  "hafif kanama", "sıyrık", "çizik", "jilet", "batık kıl",
  "mantar", "uçuk", "böcek ısırığı", "sivrisinek",
  // Egzersiz / Efor
  "koşu sonrası", "merdiven çıkınca", "egzersiz sonrası", "spor sonrası",
  "kas ağrısı", "spordan sonra ağrı", "antrenmandan sonra",
  "bacak günü", "kramp egzersiz", "yan sancı koşu",
  // Sindirim (hafif)
  "gaz sancısı", "çok yedim", "hazımsızlık", "mide ekşimesi",
  "şişkinlik", "kabızlık", "mide yanması", "reflü",
  // Hafif durumlar
  "hafif ateş", "düşük ateş", "biraz ateşim var",
  "stres baş ağrısı", "gerilim baş ağrısı", "akşamdan kalma",
  "kahve sonrası", "kafein", "enerji içeceği",
  "adet krampı", "hızlı kalktım", "yemek yemedim", "açlıktan",
  "her zamanki migren", "mevsimsel alerji", "saman nezlesi",
  "soğuk algınlığı", "hafif grip", "boğaz ağrısı", "kuru boğaz",
  "göz yorgunluğu", "ekran yorgunluğu",
  "güneş yanığı", "hafif yanık", "dudak çatlağı", "kuru cilt",
];

// ═══════════════════════════════════════════════
// VACCINE QUERY DETECTION
// ═══════════════════════════════════════════════

export interface VaccineQueryResult {
  triggered: boolean
  vaccine: string
  questionEn: string
  questionTr: string
  urgency: "critical" | "high" | "medium"
}

export function checkVaccineKeywords(input: string, chronicConditions?: string[]): VaccineQueryResult | null {
  // Dynamic import avoided — use inline data to keep safety-filter dependency-free
  const lower = input.toLowerCase().replace(/[.,!?;:]/g, " ")

  const TRIGGERS = [
    {
      keywords_en: ["rusty", "nail", "puncture", "wound", "cut", "soil", "garden", "dirt"],
      keywords_tr: ["paslı", "çivi", "battı", "yara", "kesik", "toprak", "bahçe", "kir"],
      vaccine: "tetanus",
      questionEn: "Get well soon. For risk assessment: Have you had a tetanus shot in the last 5 years?",
      questionTr: "Geçmiş olsun. Risk değerlendirmesi yapabilmem için: Son 5 yıl içinde tetanoz aşısı oldun mu?",
      urgency: "high" as const,
    },
    {
      keywords_en: ["dog", "cat", "animal", "bit", "bite", "bitten", "scratched", "scratch", "rabies"],
      keywords_tr: ["köpek", "kedi", "hayvan", "ısırdı", "çizdi", "tırmaldı", "kuduz", "sokak hayvanı"],
      vaccine: "rabies",
      questionEn: "Get well soon. Important question: Was the animal vaccinated for rabies? Do you have a rabies vaccine?",
      questionTr: "Geçmiş olsun. Önemli bir soru: Hayvan kuduz aşılı mıydı? Kuduz aşın var mı?",
      urgency: "critical" as const,
    },
    {
      keywords_en: ["flu", "cough", "shortness of breath", "pneumonia", "fever", "fatigue"],
      keywords_tr: ["grip", "öksürük", "nefes darlığı", "zatürre", "ateş", "halsizlik"],
      vaccine: "influenza",
      conditionRequired: ["COPD", "Asthma", "Diabetes", "Heart Failure"],
      questionEn: "Have you had this year's flu shot? Based on your profile, it's important for you.",
      questionTr: "Bu yılki grip aşını oldun mu? Profiline göre bu senin için önemli.",
      urgency: "medium" as const,
    },
  ]

  for (const trigger of TRIGGERS) {
    const matchEn = trigger.keywords_en.some(kw => lower.includes(kw))
    const matchTr = trigger.keywords_tr.some(kw => lower.includes(kw))
    if (!matchEn && !matchTr) continue

    // Condition-gated trigger: only fire if user has matching chronic condition
    if ("conditionRequired" in trigger && trigger.conditionRequired && trigger.conditionRequired.length > 0) {
      const hasCondition = chronicConditions?.some(c => trigger.conditionRequired!.includes(c)) ?? false
      if (!hasCondition) continue
    }

    return {
      triggered: true,
      vaccine: trigger.vaccine,
      questionEn: trigger.questionEn,
      questionTr: trigger.questionTr,
      urgency: trigger.urgency,
    }
  }
  return null
}

// ═══════════════════════════════════════════════
// SEVERITY ESCALATION KEYWORDS (FAZ 3.5)
// Safe context bypass'ı iptal etmek için. Örn: "diş eti kanaması" safe ama
// "şiddetli diş eti kanaması" → safe bypass iptal, red/yellow check devam.
// ═══════════════════════════════════════════════

const SEVERITY_ESCALATORS_EN = [
  "severe", "very severe", "won't stop", "wont stop", "can't stop", "cant stop",
  "uncontrollable", "uncontrolled", "getting worse", "much worse",
  "massive", "heavy bleeding", "gushing", "pouring",
  "for hours", "all day", "non stop", "non-stop",
];

const SEVERITY_ESCALATORS_TR = [
  "şiddetli", "çok şiddetli", "durmuyor", "durduramıyorum",
  "kontrolsüz", "kontrol edemiyorum", "kötüleşiyor", "çok kötü",
  "fena", "korkunç", "büyüdü", "artıyor",
  "saatlerdir", "gün boyu", "durmadan", "bir türlü durmuyor",
];

function hasSeverityEscalator(lower: string): boolean {
  return SEVERITY_ESCALATORS_EN.some(s => lower.includes(s))
    || SEVERITY_ESCALATORS_TR.some(s => lower.includes(s));
}

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

  // Step 0: Check safe contexts FIRST — if present AND no severity escalator, skip all triage.
  // FAZ 3.5: "şiddetli diş eti kanaması" gibi ifadelerde safe bypass iptal edilir.
  const enSafe = SAFE_CONTEXTS_EN.some((ctx) => lower.includes(ctx));
  const trSafe = SAFE_CONTEXTS_TR.some((ctx) => lower.includes(ctx));
  const escalated = hasSeverityEscalator(lower);
  if ((enSafe || trSafe) && !escalated) {
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

  // Step 3: SAFE — no flags detected (or only safe context with severity but no match)
  // FAZ 3.5 edge case: if escalated + safe context but no red/yellow match, treat as yellow
  // (severe symptom on safe topic still warrants caution)
  if ((enSafe || trSafe) && escalated) {
    return {
      type: "yellow_code",
      language: trSafe ? "tr" : "en",
      matchedFlags: ["severity_escalated_safe_context"],
    };
  }

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
    return "\n\n⚠️ Bu bir acil durum olabilir. Lütfen **112'yi arayın** veya **doktorunuza danışın**.";
  }
  return "\n\n⚠️ This could be an emergency. Please **call 112/911** or **consult your doctor**.";
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
