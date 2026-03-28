// ============================================
// KVKK/GDPR Consent Management System
// Dynamic consent with layered disclosure, digital signatures,
// immutable audit trail, and Zero Trust data sharing
// ============================================

import crypto from "crypto"

// ══════════════════════════════════════════
// Consent Types & Interfaces
// ══════════════════════════════════════════

export type ConsentPurpose =
  | "herbal_interaction_analysis"    // sharing meds for herb-drug check
  | "lab_result_sharing"            // sharing blood tests with doctor
  | "health_profile_sharing"        // sharing full profile with hospital
  | "ai_analysis"                   // allowing AI to process data
  | "research_anonymous"            // anonymized data for research
  | "doctor_communication"          // sharing data with specific doctor

export type ConsentStatus = "active" | "withdrawn" | "expired"

export interface ConsentRecord {
  id: string
  userId: string
  // What was consented
  purpose: ConsentPurpose
  dataCategories: string[]           // specific data types shared
  recipientId: string                // doctor/hospital ID
  recipientName: string
  recipientType: "doctor" | "hospital" | "research" | "platform"
  // Legal basis
  legalBasis: "explicit_consent"     // KVKK madde 6/1
  kvkkArticle: string                // e.g., "6/1 - Açık Rıza"
  // Scope
  retentionPeriod: string            // e.g., "12_months", "until_withdrawn"
  purposeDescription: { en: string; tr: string }
  // Status
  status: ConsentStatus
  // Timestamps
  grantedAt: string                  // ISO 8601
  expiresAt?: string
  withdrawnAt?: string
  // Digital signature
  digitalSignature: string           // SHA-256 hash of consent details
  ipAddress: string
  userAgent: string
  // Layered disclosure acknowledged
  layeredDisclosureVersion: string
  fullTextAcknowledged: boolean
}

// ══════════════════════════════════════════
// Layered Disclosure Texts (KVKK Aydınlatma Metni)
// ══════════════════════════════════════════

export const CONSENT_DISCLOSURES: Record<ConsentPurpose, {
  title: { en: string; tr: string }
  summary: { en: string; tr: string }      // Layer 1: Short notice
  details: { en: string; tr: string }      // Layer 2: Full disclosure
  dataCategories: { id: string; label: { en: string; tr: string } }[]
  retentionOptions: { value: string; label: { en: string; tr: string } }[]
}> = {
  herbal_interaction_analysis: {
    title: { en: "Herbal-Drug Interaction Analysis", tr: "Bitkisel-İlaç Etkileşim Analizi" },
    summary: {
      en: "We will access your medication list to check for potential interactions with herbal supplements. No data leaves our encrypted servers.",
      tr: "Bitkisel takviyelerle olası etkileşimleri kontrol etmek için ilaç listenize erişeceğiz. Hiçbir veri şifreli sunucularımızdan çıkmaz.",
    },
    details: {
      en: "Purpose: To analyze your current medications against our herbal interaction database for safety.\n\nData Controller: Phytotherapy.ai (Veri Sorumlusu)\nProcessing: Automated AI analysis with human oversight for critical findings\nStorage: AES-256 encrypted, servers in Turkey/EU\nRetention: Until you withdraw consent or the selected retention period expires\nYour Rights (KVKK Art. 11): Access, correction, deletion, restriction, portability, objection\n\nLegal Basis: KVKK Article 6/1 - Your explicit consent\nData Transfer: No international transfer. No sharing with third parties.\nAutomated Decision: AI provides recommendations, not medical decisions.",
      tr: "Amaç: Güvenlik için mevcut ilaçlarınızı bitkisel etkileşim veritabanımızla analiz etmek.\n\nVeri Sorumlusu: Phytotherapy.ai\nİşleme: Kritik bulgular için insan denetimi ile otomatik AI analizi\nSaklama: AES-256 şifreli, Türkiye/AB sunucuları\nSaklama Süresi: Rızanızı geri çekene veya seçilen saklama süresi dolana kadar\nHaklarınız (KVKK m.11): Erişim, düzeltme, silme, kısıtlama, taşınabilirlik, itiraz\n\nHukuki Dayanak: KVKK Madde 6/1 - Açık rızanız\nVeri Aktarımı: Uluslararası aktarım yok. Üçüncü taraflarla paylaşım yok.\nOtomatik Karar: AI öneri sunar, tıbbi karar vermez.",
    },
    dataCategories: [
      { id: "medications", label: { en: "Current medications", tr: "Mevcut ilaçlar" } },
      { id: "allergies", label: { en: "Known allergies", tr: "Bilinen alerjiler" } },
      { id: "conditions", label: { en: "Health conditions", tr: "Sağlık durumları" } },
    ],
    retentionOptions: [
      { value: "session", label: { en: "This session only", tr: "Yalnızca bu oturum" } },
      { value: "12_months", label: { en: "12 months", tr: "12 ay" } },
      { value: "until_withdrawn", label: { en: "Until I withdraw", tr: "Geri çekene kadar" } },
    ],
  },
  lab_result_sharing: {
    title: { en: "Lab Result Sharing with Doctor", tr: "Tahlil Sonucu Doktorla Paylaşım" },
    summary: {
      en: "Your blood test results will be shared with your selected doctor in FHIR format for clinical review.",
      tr: "Kan tahlili sonuçlarınız klinik değerlendirme için FHIR formatında seçtiğiniz doktorla paylaşılacak.",
    },
    details: {
      en: "Purpose: To enable your doctor to review your lab results alongside your supplement usage for integrated care.\n\nData shared: Blood test values, reference ranges, AI interpretation summary\nFormat: HL7 FHIR R4 standard (hospital-compatible)\nEncryption: TLS 1.3 in transit, AES-256 at rest\nRecipient: Your selected doctor (verified on our platform)\nRetention by recipient: Subject to their own data retention policies\n\nYou can withdraw this consent at any time. Previously shared data must be deleted by the recipient upon your request.",
      tr: "Amaç: Doktorunuzun bütünleşik bakım için tahlil sonuçlarınızı takviye kullanımınızla birlikte incelemesini sağlamak.\n\nPaylaşılan veri: Kan tahlili değerleri, referans aralıkları, AI yorum özeti\nFormat: HL7 FHIR R4 standardı (hastane uyumlu)\nŞifreleme: Aktarımda TLS 1.3, saklamada AES-256\nAlıcı: Seçtiğiniz doktor (platformumuzda doğrulanmış)\nAlıcıda saklama: Kendi veri saklama politikalarına tabidir\n\nBu rızayı istediğiniz zaman geri çekebilirsiniz. Daha önce paylaşılan veriler talebiniz üzerine alıcı tarafından silinmelidir.",
    },
    dataCategories: [
      { id: "blood_tests", label: { en: "Blood test results", tr: "Kan tahlili sonuçları" } },
      { id: "supplements", label: { en: "Supplement usage", tr: "Takviye kullanımı" } },
      { id: "ai_analysis", label: { en: "AI health analysis", tr: "AI sağlık analizi" } },
    ],
    retentionOptions: [
      { value: "30_days", label: { en: "30 days", tr: "30 gün" } },
      { value: "12_months", label: { en: "12 months", tr: "12 ay" } },
      { value: "until_withdrawn", label: { en: "Until I withdraw", tr: "Geri çekene kadar" } },
    ],
  },
  health_profile_sharing: {
    title: { en: "Full Health Profile Sharing", tr: "Tam Sağlık Profili Paylaşımı" },
    summary: {
      en: "Your complete health profile including medications, lab results, vitals, and AI insights will be shared with the selected institution.",
      tr: "İlaçlar, tahlil sonuçları, yaşamsal değerler ve AI önerileri dahil tam sağlık profiliniz seçilen kurumla paylaşılacak.",
    },
    details: {
      en: "This is the most comprehensive data sharing option. All health data categories will be included in the FHIR bundle.\n\nData Processing Agreement (DPA) applies between Phytotherapy.ai and the receiving institution.\nBoth parties share responsibility for data security under KVKK.\nBreach notification: Within 72 hours to you and authorities (KVKK Art. 12).",
      tr: "Bu en kapsamlı veri paylaşım seçeneğidir. FHIR paketine tüm sağlık verisi kategorileri dahil edilecektir.\n\nPhytotherapy.ai ile alıcı kurum arasında Veri İşleme Sözleşmesi (DPA) geçerlidir.\nHer iki taraf da KVKK kapsamında veri güvenliği sorumluluğunu paylaşır.\nİhlal bildirimi: Size ve yetkililere 72 saat içinde (KVKK m.12).",
    },
    dataCategories: [
      { id: "profile", label: { en: "Personal information", tr: "Kişisel bilgiler" } },
      { id: "medications", label: { en: "Medications", tr: "İlaçlar" } },
      { id: "blood_tests", label: { en: "Lab results", tr: "Tahlil sonuçları" } },
      { id: "vitals", label: { en: "Vital signs", tr: "Yaşamsal değerler" } },
      { id: "supplements", label: { en: "Supplements", tr: "Takviyeler" } },
      { id: "ai_analysis", label: { en: "AI insights", tr: "AI önerileri" } },
    ],
    retentionOptions: [
      { value: "6_months", label: { en: "6 months", tr: "6 ay" } },
      { value: "12_months", label: { en: "12 months", tr: "12 ay" } },
      { value: "24_months", label: { en: "24 months", tr: "24 ay" } },
    ],
  },
  ai_analysis: {
    title: { en: "AI Health Analysis", tr: "AI Sağlık Analizi" },
    summary: { en: "Allow our AI to analyze your health data for personalized recommendations.", tr: "Kişiselleştirilmiş öneriler için AI'ın sağlık verilerinizi analiz etmesine izin verin." },
    details: { en: "AI processing is done on our servers. No data is sent to external AI providers for training.", tr: "AI işleme sunucularımızda yapılır. Eğitim için harici AI sağlayıcılarına veri gönderilmez." },
    dataCategories: [
      { id: "all_health", label: { en: "All health data", tr: "Tüm sağlık verileri" } },
    ],
    retentionOptions: [
      { value: "until_withdrawn", label: { en: "Until I withdraw", tr: "Geri çekene kadar" } },
    ],
  },
  research_anonymous: {
    title: { en: "Anonymous Research Contribution", tr: "Anonim Araştırma Katkısı" },
    summary: { en: "Contribute anonymized data to advance integrative medicine research.", tr: "Bütünleştirici tıp araştırmalarını ilerletmek için anonim veri katkısında bulunun." },
    details: { en: "All identifying information is removed before research use. Published findings never identify individuals.", tr: "Araştırma kullanımından önce tüm tanımlayıcı bilgiler kaldırılır. Yayınlanan bulgular asla bireyleri tanımlamaz." },
    dataCategories: [
      { id: "anonymized", label: { en: "Anonymized health patterns", tr: "Anonimleştirilmiş sağlık örüntüleri" } },
    ],
    retentionOptions: [
      { value: "until_withdrawn", label: { en: "Until I withdraw", tr: "Geri çekene kadar" } },
    ],
  },
  doctor_communication: {
    title: { en: "Doctor Communication", tr: "Doktor İletişimi" },
    summary: { en: "Share selected data with your doctor for consultation purposes.", tr: "Konsültasyon amacıyla seçilen verileri doktorunuzla paylaşın." },
    details: { en: "Only the data categories you select will be shared. Your doctor must be verified on our platform.", tr: "Yalnızca seçtiğiniz veri kategorileri paylaşılacaktır. Doktorunuz platformumuzda doğrulanmış olmalıdır." },
    dataCategories: [
      { id: "medications", label: { en: "Medications", tr: "İlaçlar" } },
      { id: "supplements", label: { en: "Supplements", tr: "Takviyeler" } },
      { id: "blood_tests", label: { en: "Lab results", tr: "Tahlil sonuçları" } },
    ],
    retentionOptions: [
      { value: "30_days", label: { en: "30 days", tr: "30 gün" } },
      { value: "until_withdrawn", label: { en: "Until I withdraw", tr: "Geri çekene kadar" } },
    ],
  },
}

// ══════════════════════════════════════════
// Digital Signature & Audit Trail
// ══════════════════════════════════════════

/**
 * Generate a digital signature for consent record
 * SHA-256 hash of all consent details — tamper-evident
 */
export function generateConsentSignature(params: {
  userId: string
  purpose: ConsentPurpose
  dataCategories: string[]
  recipientId: string
  retentionPeriod: string
  grantedAt: string
}): string {
  const payload = JSON.stringify({
    userId: params.userId,
    purpose: params.purpose,
    dataCategories: params.dataCategories.sort(),
    recipientId: params.recipientId,
    retentionPeriod: params.retentionPeriod,
    grantedAt: params.grantedAt,
    salt: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 16) || "consent-salt",
  })
  return crypto.createHash("sha256").update(payload).digest("hex")
}

/**
 * Verify consent signature integrity
 */
export function verifyConsentSignature(record: ConsentRecord): boolean {
  const expected = generateConsentSignature({
    userId: record.userId,
    purpose: record.purpose,
    dataCategories: record.dataCategories,
    recipientId: record.recipientId,
    retentionPeriod: record.retentionPeriod,
    grantedAt: record.grantedAt,
  })
  return expected === record.digitalSignature
}

// ══════════════════════════════════════════
// Zero Trust Access Control
// ══════════════════════════════════════════

export interface AccessRequest {
  requesterId: string
  requesterType: "doctor" | "hospital" | "system" | "user"
  resourceOwnerId: string
  dataCategories: string[]
  purpose: ConsentPurpose
  ipAddress: string
  userAgent: string
}

export interface AccessDecision {
  allowed: boolean
  reason: string
  consentId?: string
  auditLogId: string
}

/**
 * Zero Trust access check: verify every data access request
 * against active consent records
 */
export function checkAccess(request: AccessRequest, activeConsents: ConsentRecord[]): AccessDecision {
  const auditLogId = `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`

  // 1. Find matching consent
  const consent = activeConsents.find(c =>
    c.status === "active" &&
    c.recipientId === request.requesterId &&
    c.purpose === request.purpose &&
    request.dataCategories.every(dc => c.dataCategories.includes(dc))
  )

  if (!consent) {
    return { allowed: false, reason: "No active consent for this data access", auditLogId }
  }

  // 2. Check expiry
  if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) {
    return { allowed: false, reason: "Consent has expired", auditLogId }
  }

  // 3. Verify signature integrity
  if (!verifyConsentSignature(consent)) {
    return { allowed: false, reason: "Consent record integrity check failed", auditLogId }
  }

  return { allowed: true, reason: "Active verified consent found", consentId: consent.id, auditLogId }
}

// ══════════════════════════════════════════
// DPA (Data Processing Agreement) Template
// ══════════════════════════════════════════

export const DPA_CLAUSES = {
  en: [
    "1. DATA CONTROLLER: The healthcare institution sharing patient data",
    "2. DATA PROCESSOR: Phytotherapy.ai — processing data solely for the stated purpose",
    "3. PURPOSE LIMITATION: Data processed only for herbal interaction analysis and health recommendations",
    "4. DATA MINIMIZATION: Only necessary data categories are collected and processed",
    "5. STORAGE LIMITATION: Data retained for the agreed period, then securely deleted",
    "6. SECURITY MEASURES: AES-256 encryption at rest, TLS 1.3 in transit, SOC2 compliance target",
    "7. BREACH NOTIFICATION: Both parties notify each other and authorities within 72 hours (KVKK Art. 12)",
    "8. SUB-PROCESSING: No sub-processors without written consent of the Data Controller",
    "9. AUDIT RIGHTS: Data Controller may audit Processor's compliance annually",
    "10. LIABILITY: Processor liable for damages caused by non-compliance with this agreement",
    "11. DATA RETURN/DELETION: Upon termination, all data returned or securely destroyed within 30 days",
    "12. GOVERNING LAW: Turkish law, KVKK, and relevant Sağlık Bakanlığı regulations",
  ],
  tr: [
    "1. VERİ SORUMLUSU: Hasta verisini paylaşan sağlık kurumu",
    "2. VERİ İŞLEYEN: Phytotherapy.ai — veriyi yalnızca belirtilen amaç için işler",
    "3. AMAÇ SINIRLAMASI: Veri yalnızca bitkisel etkileşim analizi ve sağlık önerileri için işlenir",
    "4. VERİ MİNİMİZASYONU: Yalnızca gerekli veri kategorileri toplanır ve işlenir",
    "5. SAKLAMA SINIRLAMASI: Veri kararlaştırılan süre boyunca saklanır, ardından güvenle silinir",
    "6. GÜVENLİK ÖNLEMLERİ: Saklamada AES-256 şifreleme, aktarımda TLS 1.3, SOC2 uyumluluk hedefi",
    "7. İHLAL BİLDİRİMİ: Her iki taraf 72 saat içinde birbirini ve yetkilileri bilgilendirir (KVKK m.12)",
    "8. ALT İŞLEME: Veri Sorumlusunun yazılı onayı olmadan alt işlemci kullanılmaz",
    "9. DENETİM HAKKI: Veri Sorumlusu, İşleyenin uyumluluğunu yıllık denetleyebilir",
    "10. SORUMLULUK: İşleyen, bu sözleşmeye uyumsuzluktan kaynaklanan zararlardan sorumludur",
    "11. VERİ İADESİ/İMHASI: Sözleşme sonlandırıldığında tüm veri 30 gün içinde iade veya güvenle imha edilir",
    "12. UYGULANACAK HUKUK: Türk hukuku, KVKK ve ilgili Sağlık Bakanlığı düzenlemeleri",
  ],
}
