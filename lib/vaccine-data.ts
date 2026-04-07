// © 2026 Doctopal — All Rights Reserved
// ============================================
// Vaccine Reference Data + Chronic Disease Triggers
// ============================================

export interface VaccineEntry {
  id: string
  name: string        // stored display name
  last_date?: string  // YYYY-MM or YYYY
  status: "done" | "not_done" | "unknown"
  reminder?: boolean
}

export type VaccineGroup = "essential" | "seasonal" | "special"

export interface VaccineDef {
  id: string
  nameEn: string
  nameTr: string
  group: VaccineGroup
  intervalYears?: number  // how often (e.g., 10 for tetanus, 1 for flu)
}

// ── 13 Vaccines in 3 Groups ──

export const VACCINE_LIST: VaccineDef[] = [
  // ── Temel Aşılar (Essential) ──
  { id: "tetanus",   nameEn: "Tetanus (Td/Tdap)",              nameTr: "Tetanoz (Td/Tdap)",                group: "essential", intervalYears: 10 },
  { id: "hep_b",     nameEn: "Hepatitis B",                    nameTr: "Hepatit B",                        group: "essential" },
  { id: "hep_a",     nameEn: "Hepatitis A",                    nameTr: "Hepatit A",                        group: "essential" },
  { id: "mmr",       nameEn: "MMR (Measles-Mumps-Rubella)",    nameTr: "KKK (Kızamık-Kabakulak-Kızamıkçık)", group: "essential" },
  { id: "varicella", nameEn: "Varicella (Chickenpox)",          nameTr: "Suçiçeği (Varisella)",             group: "essential" },

  // ── Yıllık / Mevsimsel (Seasonal) ──
  { id: "influenza",  nameEn: "Influenza (Flu)",     nameTr: "İnfluenza (Grip)",  group: "seasonal", intervalYears: 1 },
  { id: "covid19",    nameEn: "COVID-19",            nameTr: "Covid-19",          group: "seasonal" },
  { id: "pneumococcal", nameEn: "Pneumococcal",      nameTr: "Pnömokok (Zatürre)", group: "seasonal" },

  // ── Özel Durumlar (Special) ──
  { id: "hpv",         nameEn: "HPV",                      nameTr: "HPV",                       group: "special" },
  { id: "rabies",      nameEn: "Rabies (Pre-exposure)",     nameTr: "Kuduz (Ön-maruziyet)",      group: "special" },
  { id: "meningococcal", nameEn: "Meningococcal",           nameTr: "Meningokok",                group: "special" },
  { id: "typhoid",     nameEn: "Typhoid",                   nameTr: "Tifo",                      group: "special" },
  { id: "yellow_fever", nameEn: "Yellow Fever",             nameTr: "Sarı Humma",                group: "special" },
]

export const ESSENTIAL_VACCINE_IDS = VACCINE_LIST.filter(v => v.group === "essential").map(v => v.id)

// ── Chronic Disease → Vaccine Recommendations ──

export interface VaccineReminder {
  vaccine: string  // vaccine id
  messageEn: string
  messageTr: string
}

export const VACCINE_TRIGGERS: Record<string, VaccineReminder[]> = {
  "COPD": [
    { vaccine: "influenza",    messageEn: "Annual flu vaccine reduces hospitalization risk by 50% in COPD patients.",    messageTr: "Yıllık grip aşısı KOAH hastalarında hastanelik riski %50 azaltır." },
    { vaccine: "pneumococcal", messageEn: "Pneumococcal vaccine provides critical protection against pneumonia complications.", messageTr: "Pnömokok aşısı zatürre komplikasyonlarına karşı kritik koruma sağlar." },
  ],
  "Asthma": [
    { vaccine: "influenza",    messageEn: "Flu is the most common trigger for asthma attacks.",                          messageTr: "Grip, astım krizlerinin en sık tetikleyicisidir." },
  ],
  "Diabetes": [
    { vaccine: "influenza",    messageEn: "Flu infection can seriously destabilize blood sugar in diabetics.",            messageTr: "Diyabetlilerde grip enfeksiyonu kan şekerini ciddi dengesizleştirebilir." },
    { vaccine: "hep_b",        messageEn: "Hepatitis B transmission risk is higher in diabetes patients.",               messageTr: "Diyabet hastalarında Hepatit B bulaş riski daha yüksektir." },
    { vaccine: "pneumococcal", messageEn: "Pneumococcal vaccine is recommended by CDC for diabetic patients.",           messageTr: "Pnömokok aşısı diyabetli hastalara CDC tarafından önerilir." },
  ],
  "Heart Failure": [
    { vaccine: "influenza",    messageEn: "Flu is a leading cause of heart failure decompensation.",                     messageTr: "Grip kalp yetmezliği dekompansasyonunun önde gelen nedenidir." },
  ],
  "Chronic Kidney Disease": [
    { vaccine: "hep_b",        messageEn: "Hepatitis B vaccine is mandatory for dialysis patients.",                     messageTr: "Diyaliz hastalarında Hepatit B aşısı zorunludur." },
    { vaccine: "pneumococcal", messageEn: "The immune system is suppressed in kidney failure.",                          messageTr: "Böbrek yetmezliğinde bağışıklık sistemi baskılıdır." },
  ],
}

// ── AI Chat Vaccine Query Triggers ──

export interface VaccineQueryTrigger {
  keywords_en: string[]
  keywords_tr: string[]
  vaccine: string
  questionEn: string
  questionTr: string
  urgency: "critical" | "high" | "medium"
  conditionRequired?: string[]  // only trigger if user has these chronic conditions
}

export const VACCINE_QUERY_TRIGGERS: VaccineQueryTrigger[] = [
  {
    keywords_en: ["rusty", "nail", "puncture", "wound", "cut", "soil", "garden", "dirt"],
    keywords_tr: ["paslı", "çivi", "battı", "yara", "kesik", "toprak", "bahçe", "kir"],
    vaccine: "tetanus",
    questionEn: "Get well soon. For risk assessment: Have you had a tetanus shot in the last 5 years?",
    questionTr: "Geçmiş olsun. Risk değerlendirmesi yapabilmem için: Son 5 yıl içinde tetanoz aşısı oldun mu?",
    urgency: "high",
  },
  {
    keywords_en: ["dog", "cat", "animal", "bit", "bite", "bitten", "scratched", "scratch", "rabies"],
    keywords_tr: ["köpek", "kedi", "hayvan", "ısırdı", "çizdi", "tırmaldı", "kuduz", "sokak hayvanı"],
    vaccine: "rabies",
    questionEn: "Get well soon. Important question: Was the animal vaccinated for rabies? Do you have a rabies vaccine?",
    questionTr: "Geçmiş olsun. Önemli bir soru: Hayvan kuduz aşılı mıydı? Kuduz aşın var mı?",
    urgency: "critical",
  },
  {
    keywords_en: ["flu", "cough", "shortness of breath", "pneumonia", "fever", "fatigue"],
    keywords_tr: ["grip", "öksürük", "nefes darlığı", "zatürre", "ateş", "halsizlik"],
    vaccine: "influenza",
    conditionRequired: ["COPD", "Asthma", "Diabetes", "Heart Failure"],
    questionEn: "Have you had this year's flu shot? Based on your profile, it's important for you.",
    questionTr: "Bu yılki grip aşını oldun mu? Profiline göre bu senin için önemli.",
    urgency: "medium",
  },
]

/** Check if current month is flu season (October-March) */
export function isFluSeason(): boolean {
  const month = new Date().getMonth() // 0-indexed
  return month >= 9 || month <= 2 // Oct(9) - Mar(2)
}

/** Get vaccine recommendations for a user based on their chronic conditions */
export function getVaccineRecommendations(
  chronicConditions: string[],
  vaccines: VaccineEntry[]
): { vaccine: VaccineDef; reminder: VaccineReminder }[] {
  const results: { vaccine: VaccineDef; reminder: VaccineReminder }[] = []
  const vaccineStatusMap = new Map(vaccines.map(v => [v.id, v.status]))

  for (const condition of chronicConditions) {
    const triggers = VACCINE_TRIGGERS[condition]
    if (!triggers) continue

    for (const trigger of triggers) {
      const status = vaccineStatusMap.get(trigger.vaccine)
      // Recommend if not done or unknown
      if (!status || status === "not_done" || status === "unknown") {
        const vaccineDef = VACCINE_LIST.find(v => v.id === trigger.vaccine)
        if (vaccineDef && !results.some(r => r.vaccine.id === vaccineDef.id)) {
          results.push({ vaccine: vaccineDef, reminder: trigger })
        }
      }
    }
  }
  return results
}
