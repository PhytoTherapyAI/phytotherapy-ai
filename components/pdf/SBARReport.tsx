// © 2026 DoctoPal — All Rights Reserved
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { translateCondition } from "@/lib/condition-translations";

// Sprint 17 hotfix #5 — Helvetica + fixTr() revert.
// NotoSans 4 hotfix sonrası Vercel'de hâlâ "Font family not registered" hatası.
// Geçici fix: Helvetica built-in + Turkish ASCII transliteration (Sprint 17 A öncesi pattern).
// NotoSans migration ayrı sprint'te (font dosyasını bundle'a dahil ederek).
const fixTr = (s: string): string => {
  if (!s) return "";
  return s
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ç/g, "c").replace(/Ç/g, "C");
};
Font.registerHyphenationCallback((word) => [word]);

// ── EN translation maps for TR-stored data (TR↔EN canonical mapping, KORUNUR) ──
const ALLERGEN_EN: Record<string, string> = {
  "Arı Zehiri": "Bee Venom", "Penisilin": "Penicillin", "Aspirin": "Aspirin",
  "Latex": "Latex", "Polen": "Pollen", "Süt": "Milk", "Yumurta": "Egg",
  "Fıstık": "Peanut", "Gluten": "Gluten", "Soya": "Soy", "Balık": "Fish",
  "Kabuklu Deniz Ürünleri": "Shellfish", "Buğday": "Wheat",
};

const VACCINE_EN: Record<string, string> = {
  "KKK (Kızamık-Kabakulak-Kızamıkçık)": "MMR (Measles-Mumps-Rubella)",
  "Suçiçeği (Varisella)": "Varicella (Chickenpox)",
  "Hepatit A": "Hepatitis A", "Hepatit B": "Hepatitis B",
  "Covid-19": "Covid-19", "Tetanoz (Td/Tdap)": "Tetanus (Td/Tdap)",
  "Grip": "Influenza", "Pnömokok": "Pneumococcal",
  "HPV": "HPV", "Zona": "Shingles (Zoster)",
  "Meningokok": "Meningococcal", "Kuduz": "Rabies",
  "Hepatit C": "Hepatitis C",
};

const MED_NAME_EN: Record<string, string> = {
  "Metformin Hidroklorür": "Metformin Hydrochloride",
  "Atorvastatin Kalsiyum": "Atorvastatin Calcium",
  "Varfarin": "Warfarin", "Losartan Potasyum": "Losartan Potassium",
  "Amlodipin": "Amlodipine", "Ramipril": "Ramipril",
  "Lisinopril": "Lisinopril", "Metoprolol": "Metoprolol",
};

/** Translate data value: if lang=en, look up TR→EN map; always fixTr for PDF safety (Helvetica) */
function loc(value: string, lang: string, enMap?: Record<string, string>): string {
  if (lang === "en" && enMap) return fixTr(enMap[value] || value);
  return fixTr(value);
}

// ── Types ──
export interface SBARData {
  lang: "en" | "tr";
  fullName: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  bmi: number | null;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  kidneyDisease: boolean;
  liverDisease: boolean;
  chronicConditions: string[];
  familyHistory: string[];
  smokingUse: string;
  alcoholUse: string;
  allergies: { allergen: string; severity: string }[];
  medications: { name: string; dosage: string; frequency: string }[];
  supplements: string[];
  vaccines: { name: string; status: string; lastDate?: string }[];
  generatedAt: string;
  // Sprint 17 Commit 2 — V1+V2+V3 inject genişletme (opsiyonel, eski caller'lar bozulmaz)
  familyHistoryDetailed?: Array<{
    person_relation: string;
    condition_name: string;
    age_at_diagnosis?: number;
    age_at_death?: number;
    is_deceased?: boolean;
  }>;
  checkIns?: Array<{
    check_date: string;
    sleep_quality?: number; // 1-5
    mood?: number; // 1-5
    energy_level?: number; // 1-5
  }>;
  lastLab?: {
    created_at: string;
    // Sprint 18 — radiology_reports paterni: summary + overall_urgency.
    // Sprint 25 Commit 4 — analysis_result DROPPED (deprecated kolon).
    summary?: string | null;
    overall_urgency?: string | null;
  };
  lastRadiology?: {
    created_at: string;
    image_type: string;
    overall_urgency: string;
    summary?: string | null;
  };
}

// ── Design Tokens ──
const sage = "#6B8F71";
const sageDark = "#4A6B50";
const sageLight = "#EDF2EE";
const bgCard = "#F8F9FA";
const textPrimary = "#1a1a1a";
const textSecondary = "#666666";
const textMuted = "#999999";
const borderLight = "#E5E7EB";
const redBg = "#FEF2F2";
const redBorder = "#EF4444";
const redText = "#991B1B";

// ── Styles ──
const s = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontFamily: "Helvetica", fontSize: 9.5, color: textPrimary, backgroundColor: "#FFFFFF" },
  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  logo: { fontSize: 20, fontFamily: "Helvetica-Bold", color: sage },
  logoSub: { fontSize: 8, color: textSecondary, marginTop: 1 },
  headerRight: { alignItems: "flex-end" },
  headerDate: { fontSize: 8, color: textSecondary },
  headerConfidential: { fontSize: 7, color: sage, fontFamily: "Helvetica-Bold", marginTop: 2, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  headerLine: { height: 2, backgroundColor: sage, marginBottom: 14, borderRadius: 1 },
  // Patient Info Box
  infoBox: { backgroundColor: bgCard, borderRadius: 6, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: borderLight },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoItem: { width: "33%", marginBottom: 6 },
  infoLabel: { fontSize: 7.5, color: textMuted, textTransform: "uppercase" as const, letterSpacing: 0.3, marginBottom: 1 },
  infoValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: textPrimary },
  // Critical Alert
  criticalBox: { backgroundColor: redBg, padding: 10, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: redBorder, marginBottom: 14 },
  criticalLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: redText, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 2 },
  criticalText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: redText },
  // SBAR Sections
  section: { marginBottom: 12, borderLeftWidth: 3, borderLeftColor: sage, paddingLeft: 10, paddingTop: 2, paddingBottom: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  sectionLetter: { fontSize: 14, fontFamily: "Helvetica-Bold", color: sage, marginRight: 6 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: sageDark },
  sectionDivider: { height: 1, backgroundColor: sageLight, marginBottom: 8 },
  // Sub-sections
  subTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: textPrimary, marginBottom: 4, marginTop: 6 },
  bodyText: { fontSize: 9, color: textPrimary, lineHeight: 1.5, marginBottom: 4 },
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
  bulletDot: { fontSize: 9, color: sage, marginRight: 6, width: 8 },
  bulletText: { fontSize: 9, color: textPrimary, flex: 1 },
  emptyText: { fontSize: 8.5, color: textMuted, fontStyle: "normal", marginBottom: 4 },
  // Tables
  tableHeader: { flexDirection: "row", backgroundColor: sageLight, padding: 6, borderRadius: 3, marginBottom: 1 },
  tableHeaderText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: sageDark, textTransform: "uppercase" as const, letterSpacing: 0.3 },
  tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 0.5, borderBottomColor: borderLight },
  tableRowAlt: { flexDirection: "row", padding: 6, borderBottomWidth: 0.5, borderBottomColor: borderLight, backgroundColor: "#FAFBFA" },
  tableCell: { fontSize: 9 },
  col1: { flex: 2 },
  col2: { flex: 1 },
  col3: { flex: 1 },
  // Badges
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  badge: { fontSize: 8, backgroundColor: sageLight, color: sageDark, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  // Recommendation box
  recBox: { backgroundColor: "#FFFBEB", padding: 10, borderRadius: 4, borderWidth: 1, borderColor: "#FDE68A", marginTop: 4 },
  recText: { fontSize: 8.5, color: "#92400E", lineHeight: 1.5 },
  // Disclaimer
  disclaimer: { marginTop: 12, padding: 10, backgroundColor: bgCard, borderRadius: 4, borderWidth: 1, borderColor: borderLight },
  disclaimerText: { fontSize: 7.5, color: textMuted, textAlign: "center", lineHeight: 1.5 },
  // Footer
  footer: { position: "absolute", bottom: 25, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 0.5, borderTopColor: borderLight, paddingTop: 6 },
  footerText: { fontSize: 7, color: textMuted },
  footerCenter: { fontSize: 7, color: textMuted, textAlign: "center" },
  // Sprint 17 Commit 2 — yeni veri inject styles
  vitalTrendBox: { backgroundColor: sageLight, padding: 8, borderRadius: 4, marginTop: 6, marginBottom: 4 },
  vitalTrendTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: sageDark, textTransform: "uppercase" as const, letterSpacing: 0.3, marginBottom: 3 },
  vitalTrendText: { fontSize: 9, color: textPrimary },
  familyEntry: { marginBottom: 4, paddingLeft: 4 },
  familyEntryHeader: { fontSize: 9, fontFamily: "Helvetica-Bold", color: textPrimary },
  familyEntryDetail: { fontSize: 8.5, color: textSecondary, marginTop: 1 },
  resultBlock: { marginBottom: 6, padding: 8, backgroundColor: bgCard, borderRadius: 4, borderLeftWidth: 2, borderLeftColor: sage },
  resultBlockUrgent: { borderLeftColor: redBorder, backgroundColor: redBg },
  resultLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: sageDark, textTransform: "uppercase" as const, letterSpacing: 0.3, marginBottom: 2 },
  resultMeta: { fontSize: 8.5, color: textSecondary, marginBottom: 2 },
  resultSnippet: { fontSize: 8.5, color: textPrimary, lineHeight: 1.4 },
});

// ── Locale maps for enum-like data ──
const GENDER: Record<string, Record<string, string>> = {
  male: { en: "Male", tr: "Erkek" },
  female: { en: "Female", tr: "Kadın" },
  other: { en: "Other", tr: "Diğer" },
  prefer_not_to_say: { en: "Not specified", tr: "Belirtilmemiş" },
};

const SMOKING: Record<string, Record<string, string>> = {
  none: { en: "Non-smoker", tr: "Sigara kullanmıyor" },
  former: { en: "Former smoker", tr: "Bırakmış" },
  current: { en: "Active smoker", tr: "Aktif sigara kullanıyor" },
};

const ALCOHOL: Record<string, Record<string, string>> = {
  none: { en: "No alcohol use", tr: "Alkol kullanmıyor" },
  former: { en: "Former drinker", tr: "Bırakmış" },
  active: { en: "Active drinker", tr: "Alkol kullanıyor" },
};

const REACTION: Record<string, Record<string, string>> = {
  anaphylaxis: { en: "Anaphylaxis", tr: "Anafilaksi" },
  urticaria: { en: "Urticaria / Rash", tr: "Kurdeşen / Döküntü" },
  mild_skin: { en: "Mild Skin Reaction", tr: "Hafif Cilt Reaksiyonu" },
  gi_intolerance: { en: "GI Intolerance", tr: "Sindirim İntoleransı" },
  unknown: { en: "Unknown", tr: "Bilinmiyor" },
  mild: { en: "Mild", tr: "Hafif" },
  moderate: { en: "Moderate", tr: "Orta" },
  severe: { en: "Severe", tr: "Şiddetli" },
};

const FREQ: Record<string, Record<string, string>> = {
  "daily": { en: "Daily", tr: "Günlük" },
  "1x daily": { en: "Once daily", tr: "Günde 1" },
  "2x daily": { en: "Twice daily", tr: "Günde 2" },
  "3x daily": { en: "Three times daily", tr: "Günde 3" },
  "as needed": { en: "As needed", tr: "Gerektiğinde" },
  "weekly": { en: "Weekly", tr: "Haftalık" },
  "monthly": { en: "Monthly", tr: "Aylık" },
};

function translateFreq(val: string, lang: string): string {
  const lower = val.toLowerCase().trim();
  return fixTr(FREQ[lower]?.[lang] || FREQ[val]?.[lang] || val);
}

/** Separate chronic conditions from surgery entries */
function splitConditions(conditions: string[]) {
  const chronic: string[] = [];
  const surgery: string[] = [];

  for (const c of conditions) {
    if (c.startsWith("family:")) continue; // handled separately
    if (c.startsWith("surgery:")) {
      surgery.push(c.replace("surgery:", ""));
    } else {
      chronic.push(c);
    }
  }
  return { chronic, surgery };
}

// ── Main Component ──
export function SBARReport({ data }: { data: SBARData }) {
  const { lang } = data;

  // Sprint 17 Commit 1 — single inline t bundle (50+ key TR/EN korundu).
  // HF5: TR branch'lerini fixTr() ile sar (Helvetica ASCII fallback için).
  const t = {
    subtitle: lang === "tr" ? fixTr("Kanıta Dayalı Sağlık Asistanı") : "Evidence-Based Health Assistant",
    confidential: lang === "tr" ? fixTr("Gizli Hasta Bilgisi") : "Confidential Patient Information",
    fullNameLabel: lang === "tr" ? fixTr("Ad Soyad") : "Full Name",
    age: lang === "tr" ? fixTr("Yaş") : "Age",
    gender: lang === "tr" ? fixTr("Cinsiyet") : "Gender",
    bloodGroup: lang === "tr" ? fixTr("Kan Grubu") : "Blood Group",
    smoking: lang === "tr" ? fixTr("Sigara") : "Smoking",
    criticalAlert: lang === "tr" ? fixTr("Kritik Uyarı") : "Critical Alert",
    pregnant: lang === "tr" ? fixTr("Hamile") : "Pregnant",
    breastfeeding: lang === "tr" ? fixTr("Emziriyor") : "Breastfeeding",
    kidneyDisease: lang === "tr" ? fixTr("Böbrek Yetmezliği") : "Kidney Disease",
    liverDisease: lang === "tr" ? fixTr("Karaciğer Hastalığı") : "Liver Disease",
    anaphylaxisRisk: lang === "tr" ? fixTr("Anafilaksi Riski") : "Anaphylaxis Risk",
    situation: lang === "tr" ? fixTr("Durum") : "Situation",
    patient: lang === "tr" ? fixTr("Hasta") : "Patient",
    yearsOld: lang === "tr" ? fixTr("yaşında") : "years old",
    bloodGroupLower: lang === "tr" ? fixTr("Kan grubu") : "Blood group",
    criticalShort: lang === "tr" ? fixTr("Kritik") : "Critical",
    background: lang === "tr" ? fixTr("Geçmiş") : "Background",
    chronicConditions: lang === "tr" ? fixTr("Kronik Hastalıklar") : "Chronic Conditions",
    noChronic: lang === "tr" ? fixTr("Kronik hastalık bildirilmemiş") : "No chronic conditions reported",
    surgicalHistory: lang === "tr" ? fixTr("Cerrahi Geçmiş") : "Surgical History",
    familyHistory: lang === "tr" ? fixTr("Aile Sağlık Geçmişi") : "Family Health History",
    assessment: lang === "tr" ? fixTr("Değerlendirme") : "Assessment",
    allergies: lang === "tr" ? fixTr("Alerjiler") : "Allergies",
    allergen: lang === "tr" ? fixTr("Alerjen") : "Allergen",
    reactionType: lang === "tr" ? fixTr("Reaksiyon Tipi") : "Reaction Type",
    noAllergies: lang === "tr" ? fixTr("Kayıtlı alerji yok") : "No allergies recorded",
    activeMedications: lang === "tr" ? fixTr("Aktif İlaçlar") : "Active Medications",
    medication: lang === "tr" ? fixTr("İlaç") : "Medication",
    dose: lang === "tr" ? fixTr("Doz") : "Dose",
    frequency: lang === "tr" ? fixTr("Sıklık") : "Frequency",
    noMedications: lang === "tr" ? fixTr("Kayıtlı ilaç yok") : "No active medications",
    supplements: lang === "tr" ? fixTr("Takviyeler") : "Supplements",
    vaccinationStatus: lang === "tr" ? fixTr("Aşı Durumu") : "Vaccination Status",
    vaccine: lang === "tr" ? fixTr("Aşı") : "Vaccine",
    date: lang === "tr" ? fixTr("Tarih") : "Date",
    status: lang === "tr" ? fixTr("Durum") : "Status",
    notSpecified: lang === "tr" ? fixTr("Belirtilmemiş") : "Not specified",
    recommendation: lang === "tr" ? fixTr("Öneri") : "Recommendation",
    recommendationText: lang === "tr"
      ? fixTr("Bu yapılandırılmış SBAR raporu hastanın güncel sağlık profilini özetlemektedir. Klinik kararlar öncesinde ilaçları, alerjileri ve kronik hastalıkları gözden geçiriniz. Etkileşim riskleri için DoctoPal etkileşim kontrolünü kullanınız.")
      : "This structured SBAR report summarizes the patient's current health profile. Please review medications, allergies, and chronic conditions before clinical decisions. For interaction risks, refer to the DoctoPal interaction checker.",
    disclaimerText: lang === "tr"
      ? fixTr("Bu rapor DoctoPal AI tarafından oluşturulmuştur ve tıbbi teşhis veya reçete niteliği taşımaz. Sağlık profesyonelleri için destekleyici bilgi amacıyla hazırlanmıştır. Profesyonel tıbbi değerlendirmenin yerini tutmaz. Acil durumlarda 112'yi arayınız.")
      : "This report was generated by DoctoPal AI and does not constitute a medical diagnosis or prescription. It is intended as supplementary information for healthcare professionals. Not a substitute for professional medical evaluation. In emergencies, call 112.",
    compliant: lang === "tr" ? fixTr("Uyumlu") : "Compliant",
    // Sprint 17 Commit 2 — yeni veri inject etiketleri (HF5: TR branch fixTr wrap)
    vitalTrend: lang === "tr" ? fixTr("Son 7 Gün Vital Trend") : "Last 7-Day Vital Trend",
    daysOfData: lang === "tr" ? fixTr("günlük veri") : "days of data",
    avgSleep: lang === "tr" ? fixTr("Uyku kalitesi (1-5)") : "Sleep quality (1-5)",
    avgMood: lang === "tr" ? fixTr("Ruh hali (1-5)") : "Mood (1-5)",
    avgEnergy: lang === "tr" ? fixTr("Enerji (1-5)") : "Energy (1-5)",
    diagnosedAtAge: lang === "tr" ? fixTr("tanı yaşı") : "diagnosed at age",
    deceasedAtAge: lang === "tr" ? fixTr("ölüm yaşı") : "deceased at age",
    deceased: lang === "tr" ? fixTr("vefat etti") : "deceased",
    lastLabLabel: lang === "tr" ? fixTr("Son Lab Testi") : "Last Lab Test",
    lastRadiologyLabel: lang === "tr" ? fixTr("Son Görüntüleme") : "Last Imaging",
    urgent: lang === "tr" ? fixTr("ACİL") : "URGENT",
    attention: lang === "tr" ? fixTr("Dikkat") : "Attention",
    recentResults: lang === "tr" ? fixTr("Son Tıbbi Sonuçlar") : "Recent Medical Results",
  };

  const genderLabel = fixTr(GENDER[data.gender || ""]?.[lang] || data.gender || "—");
  const smokingLabel = fixTr(SMOKING[data.smokingUse]?.[lang] || data.smokingUse);
  const alcoholLabel = fixTr(ALCOHOL[data.alcoholUse]?.[lang] || data.alcoholUse);

  const { chronic, surgery } = splitConditions(data.chronicConditions);

  const criticalFlags: string[] = [];
  if (data.isPregnant) criticalFlags.push(t.pregnant);
  if (data.isBreastfeeding) criticalFlags.push(t.breastfeeding);
  if (data.kidneyDisease) criticalFlags.push(t.kidneyDisease);
  if (data.liverDisease) criticalFlags.push(t.liverDisease);
  if (data.allergies.some((a) => a.severity === "anaphylaxis")) criticalFlags.push(t.anaphylaxisRisk);

  // Sprint 17 Commit 2 — vital trend averages (V2)
  const checkIns = data.checkIns ?? [];
  function avgOf(values: (number | undefined)[]): string {
    const valid = values.filter((v): v is number => typeof v === "number" && !isNaN(v));
    if (valid.length === 0) return "—";
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    return avg.toFixed(1);
  }
  const avgSleepStr = avgOf(checkIns.map((c) => c.sleep_quality));
  const avgMoodStr = avgOf(checkIns.map((c) => c.mood));
  const avgEnergyStr = avgOf(checkIns.map((c) => c.energy_level));

  // Format date for lab/radiology (locale-aware short date)
  function fmtShortDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch { return iso; }
  }

  // Snippet 200 char cap (PDF sayfa taşması önleme)
  function snippet(text: string | null | undefined, max = 200): string {
    if (!text) return "—";
    return text.length > max ? text.slice(0, max).trim() + "..." : text;
  }

  const familyHistoryDetailed = data.familyHistoryDetailed ?? [];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ═══ HEADER ═══ */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.logo}>DoctoPal</Text>
            <Text style={s.logoSub}>{t.subtitle}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{fixTr(data.generatedAt)}</Text>
            <Text style={s.headerConfidential}>{t.confidential}</Text>
          </View>
        </View>
        <View style={s.headerLine} />

        {/* ═══ PATIENT INFO BOX ═══ */}
        <View style={s.infoBox}>
          <View style={s.infoGrid}>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t.fullNameLabel}</Text>
              <Text style={s.infoValue}>{fixTr(data.fullName) || "—"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t.age}</Text>
              <Text style={s.infoValue}>{data.age ?? "—"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t.gender}</Text>
              <Text style={s.infoValue}>{genderLabel}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t.bloodGroup}</Text>
              <Text style={s.infoValue}>{data.bloodGroup || "—"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>BMI</Text>
              <Text style={s.infoValue}>{data.bmi != null ? data.bmi.toFixed(1) : "—"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t.smoking}</Text>
              <Text style={s.infoValue}>{smokingLabel}</Text>
            </View>
          </View>
        </View>

        {/* ═══ CRITICAL ALERTS ═══ */}
        {criticalFlags.length > 0 && (
          <View style={s.criticalBox}>
            <Text style={s.criticalLabel}>{t.criticalAlert}</Text>
            <Text style={s.criticalText}>{criticalFlags.join("  •  ")}</Text>
          </View>
        )}

        {/* ═══ S — SITUATION ═══ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLetter}>S</Text>
            <Text style={s.sectionTitle}>{t.situation}</Text>
          </View>
          <View style={s.sectionDivider} />
          <Text style={s.bodyText}>
            {fixTr(data.fullName) || t.patient}, {data.age ?? "?"} {t.yearsOld}, {genderLabel.toLowerCase()}.
            {data.bloodGroup ? ` ${t.bloodGroupLower}: ${data.bloodGroup}.` : ""}
            {data.bmi != null ? ` BMI: ${data.bmi.toFixed(1)}.` : ""}
            {` ${smokingLabel}. ${alcoholLabel}.`}
            {criticalFlags.length > 0 ? ` ${t.criticalShort}: ${criticalFlags.join(", ")}.` : ""}
          </Text>

          {/* V2 — Son 7 gün vital trend (≥3 check-in varsa render et) */}
          {checkIns.length >= 3 && (
            <View style={s.vitalTrendBox}>
              <Text style={s.vitalTrendTitle}>
                {t.vitalTrend} ({checkIns.length} {t.daysOfData})
              </Text>
              <Text style={s.vitalTrendText}>
                {t.avgSleep}: {avgSleepStr} | {t.avgMood}: {avgMoodStr} | {t.avgEnergy}: {avgEnergyStr}
              </Text>
            </View>
          )}
        </View>

        {/* ═══ B — BACKGROUND ═══ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLetter}>B</Text>
            <Text style={s.sectionTitle}>{t.background}</Text>
          </View>
          <View style={s.sectionDivider} />

          {/* Chronic Conditions */}
          <Text style={s.subTitle}>{t.chronicConditions}</Text>
          {chronic.length > 0 ? chronic.map((c, i) => (
            <View key={i} style={s.bulletRow}>
              <Text style={s.bulletDot}>•</Text>
              <Text style={s.bulletText}>{fixTr(translateCondition(c, lang))}</Text>
            </View>
          )) : <Text style={s.emptyText}>{t.noChronic}</Text>}

          {/* Surgical History */}
          {surgery.length > 0 && (
            <>
              <Text style={s.subTitle}>{t.surgicalHistory}</Text>
              {surgery.map((c, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletDot}>•</Text>
                  <Text style={s.bulletText}>{fixTr(translateCondition(c, lang))}</Text>
                </View>
              ))}
            </>
          )}

          {/* Family History — V1 detaylı (yeni tablo) ÖNCE, fallback olarak eski "family:" prefix array */}
          {familyHistoryDetailed.length > 0 ? (
            <>
              <Text style={s.subTitle}>{t.familyHistory}</Text>
              {familyHistoryDetailed.map((f, i) => {
                const detailParts: string[] = [];
                if (f.age_at_diagnosis != null) detailParts.push(`${t.diagnosedAtAge}: ${f.age_at_diagnosis}`);
                if (f.is_deceased && f.age_at_death != null) detailParts.push(`${t.deceasedAtAge}: ${f.age_at_death}`);
                else if (f.is_deceased) detailParts.push(t.deceased);
                return (
                  <View key={i} style={s.familyEntry}>
                    <Text style={s.familyEntryHeader}>
                      {fixTr(f.person_relation)}: {fixTr(translateCondition(f.condition_name, lang))}
                      {f.is_deceased ? " †" : ""}
                    </Text>
                    {detailParts.length > 0 && (
                      <Text style={s.familyEntryDetail}>{detailParts.join(" • ")}</Text>
                    )}
                  </View>
                );
              })}
            </>
          ) : data.familyHistory.length > 0 ? (
            <>
              <Text style={s.subTitle}>{t.familyHistory}</Text>
              {data.familyHistory.map((f, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletDot}>•</Text>
                  <Text style={s.bulletText}>{fixTr(translateCondition(f, lang))}</Text>
                </View>
              ))}
            </>
          ) : null}
        </View>

        {/* ═══ A — ASSESSMENT ═══ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLetter}>A</Text>
            <Text style={s.sectionTitle}>{t.assessment}</Text>
          </View>
          <View style={s.sectionDivider} />

          {/* Allergies */}
          <Text style={s.subTitle}>{t.allergies}</Text>
          {data.allergies.length > 0 ? (
            <>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderText, s.col1]}>{t.allergen}</Text>
                <Text style={[s.tableHeaderText, s.col2]}>{t.reactionType}</Text>
              </View>
              {data.allergies.map((a, i) => (
                <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, s.col1]}>{loc(a.allergen, lang, ALLERGEN_EN)}</Text>
                  <Text style={[s.tableCell, s.col2]}>{fixTr(REACTION[a.severity]?.[lang] || a.severity)}</Text>
                </View>
              ))}
            </>
          ) : <Text style={s.emptyText}>{t.noAllergies}</Text>}

          {/* Medications */}
          <Text style={s.subTitle}>{t.activeMedications}</Text>
          {data.medications.length > 0 ? (
            <>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderText, s.col1]}>{t.medication}</Text>
                <Text style={[s.tableHeaderText, s.col2]}>{t.dose}</Text>
                <Text style={[s.tableHeaderText, s.col3]}>{t.frequency}</Text>
              </View>
              {data.medications.map((m, i) => (
                <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, s.col1]}>{loc(m.name, lang, MED_NAME_EN)}</Text>
                  <Text style={[s.tableCell, s.col2]}>{fixTr(m.dosage)}</Text>
                  <Text style={[s.tableCell, s.col3]}>{translateFreq(m.frequency, lang)}</Text>
                </View>
              ))}
            </>
          ) : <Text style={s.emptyText}>{t.noMedications}</Text>}

          {/* Supplements */}
          {data.supplements.length > 0 && (
            <>
              <Text style={s.subTitle}>{t.supplements}</Text>
              <View style={s.badgeRow}>
                {data.supplements.map((sup, i) => <Text key={i} style={s.badge}>{fixTr(sup)}</Text>)}
              </View>
            </>
          )}

          {/* Vaccines */}
          {data.vaccines.length > 0 && (
            <>
              <Text style={s.subTitle}>{t.vaccinationStatus}</Text>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderText, s.col1]}>{t.vaccine}</Text>
                <Text style={[s.tableHeaderText, s.col2]}>{t.date}</Text>
                <Text style={[s.tableHeaderText, s.col3]}>{t.status}</Text>
              </View>
              {data.vaccines.map((v, i) => (
                <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, s.col1]}>{loc(v.name, lang, VACCINE_EN)}</Text>
                  <Text style={[s.tableCell, s.col2]}>{v.lastDate || t.notSpecified}</Text>
                  <Text style={[s.tableCell, s.col3]}>{v.status === "done" ? "✓" : "—"}</Text>
                </View>
              ))}
            </>
          )}

          {/* V3 — Son lab + son radyoloji snippet (varsa) */}
          {(data.lastLab || data.lastRadiology) && (
            <>
              <Text style={s.subTitle}>{t.recentResults}</Text>

              {data.lastLab && (
                <View style={s.resultBlock}>
                  <Text style={s.resultLabel}>{t.lastLabLabel}</Text>
                  <Text style={s.resultMeta}>{fixTr(fmtShortDate(data.lastLab.created_at))}</Text>
                  {/* Sprint 25 Commit 4 — analysis_result DROPPED, summary tek kaynak */}
                  {data.lastLab.summary && (
                    <Text style={s.resultSnippet}>
                      {fixTr(snippet(data.lastLab.summary, 200))}
                    </Text>
                  )}
                  {data.lastLab.overall_urgency === "urgent" && (
                    <Text style={[s.resultMeta, { color: redText, fontFamily: "Helvetica-Bold" }]}>
                      {fixTr("ACİL — doktor değerlendirmesi gerekli")}
                    </Text>
                  )}
                </View>
              )}

              {data.lastRadiology && (
                <View
                  style={
                    data.lastRadiology.overall_urgency === "urgent"
                      ? [s.resultBlock, s.resultBlockUrgent]
                      : s.resultBlock
                  }
                >
                  <Text style={s.resultLabel}>
                    {t.lastRadiologyLabel} — {data.lastRadiology.image_type.toUpperCase()}
                    {data.lastRadiology.overall_urgency === "urgent" ? ` • ${t.urgent}` : ""}
                    {data.lastRadiology.overall_urgency === "attention" ? ` • ${t.attention}` : ""}
                  </Text>
                  <Text style={s.resultMeta}>{fixTr(fmtShortDate(data.lastRadiology.created_at))}</Text>
                  {data.lastRadiology.summary && (
                    <Text style={s.resultSnippet}>{fixTr(snippet(data.lastRadiology.summary, 200))}</Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* ═══ R — RECOMMENDATION ═══ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLetter}>R</Text>
            <Text style={s.sectionTitle}>{t.recommendation}</Text>
          </View>
          <View style={s.sectionDivider} />
          <View style={s.recBox}>
            <Text style={s.recText}>{t.recommendationText}</Text>
          </View>
        </View>

        {/* ═══ DISCLAIMER ═══ */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>{t.disclaimerText}</Text>
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>doctopal.com | KVKK {t.compliant}</Text>
          <Text style={s.footerCenter} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          <Text style={s.footerText}>{fixTr(data.generatedAt)}</Text>
        </View>
      </Page>
    </Document>
  );
}
