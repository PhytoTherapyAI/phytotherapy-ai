// © 2026 DoctoPal — All Rights Reserved
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// ── Helvetica (built-in) + minimal Turkish fix ──
// Helvetica supports ç,ş,ğ,ö,ü but NOT ı/İ — fix only those two
const fixTr = (s: string) => s?.replace(/ı/g, "i").replace(/İ/g, "I") || "";
Font.registerHyphenationCallback(word => [word]);

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
  logo: { fontSize: 20, fontWeight: "bold", color: sage },
  logoSub: { fontSize: 8, color: textSecondary, marginTop: 1 },
  headerRight: { alignItems: "flex-end" },
  headerDate: { fontSize: 8, color: textSecondary },
  headerConfidential: { fontSize: 7, color: sage, fontWeight: "bold", marginTop: 2, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  headerLine: { height: 2, backgroundColor: sage, marginBottom: 14, borderRadius: 1 },
  // Patient Info Box
  infoBox: { backgroundColor: bgCard, borderRadius: 6, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: borderLight },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoItem: { width: "33%", marginBottom: 6 },
  infoLabel: { fontSize: 7.5, color: textMuted, textTransform: "uppercase" as const, letterSpacing: 0.3, marginBottom: 1 },
  infoValue: { fontSize: 9.5, fontWeight: "bold", color: textPrimary },
  // Critical Alert
  criticalBox: { backgroundColor: redBg, padding: 10, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: redBorder, marginBottom: 14 },
  criticalLabel: { fontSize: 7, fontWeight: "bold", color: redText, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 2 },
  criticalText: { fontSize: 9, fontWeight: "bold", color: redText },
  // SBAR Sections
  section: { marginBottom: 12, borderLeftWidth: 3, borderLeftColor: sage, paddingLeft: 10, paddingTop: 2, paddingBottom: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  sectionLetter: { fontSize: 14, fontWeight: "bold", color: sage, marginRight: 6 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: sageDark },
  sectionDivider: { height: 1, backgroundColor: sageLight, marginBottom: 8 },
  // Sub-sections
  subTitle: { fontSize: 9, fontWeight: "bold", color: textPrimary, marginBottom: 4, marginTop: 6 },
  bodyText: { fontSize: 9, color: textPrimary, lineHeight: 1.5, marginBottom: 4 },
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
  bulletDot: { fontSize: 9, color: sage, marginRight: 6, width: 8 },
  bulletText: { fontSize: 9, color: textPrimary, flex: 1 },
  emptyText: { fontSize: 8.5, color: textMuted, fontStyle: "italic", marginBottom: 4 },
  // Tables
  tableHeader: { flexDirection: "row", backgroundColor: sageLight, padding: 6, borderRadius: 3, marginBottom: 1 },
  tableHeaderText: { fontSize: 8, fontWeight: "bold", color: sageDark, textTransform: "uppercase" as const, letterSpacing: 0.3 },
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
});

// ── Helpers ──
const t = (en: string, tr: string, lang: string) => fixTr(lang === "tr" ? tr : en);

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

import { translateCondition } from "@/lib/condition-translations";

function translateFreq(val: string, lang: string): string {
  const lower = val.toLowerCase().trim();
  return FREQ[lower]?.[lang] || FREQ[val]?.[lang] || val;
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
  const genderLabel = GENDER[data.gender || ""]?.[lang] || data.gender || "—";
  const smokingLabel = SMOKING[data.smokingUse]?.[lang] || data.smokingUse;
  const alcoholLabel = ALCOHOL[data.alcoholUse]?.[lang] || data.alcoholUse;

  const { chronic, surgery } = splitConditions(data.chronicConditions);

  const criticalFlags: string[] = [];
  if (data.isPregnant) criticalFlags.push(t("Pregnant", "Hamile", lang));
  if (data.isBreastfeeding) criticalFlags.push(t("Breastfeeding", "Emziriyor", lang));
  if (data.kidneyDisease) criticalFlags.push(t("Kidney Disease", "Böbrek Yetmezliği", lang));
  if (data.liverDisease) criticalFlags.push(t("Liver Disease", "Karaciğer Hastalığı", lang));
  if (data.allergies.some(a => a.severity === "anaphylaxis")) criticalFlags.push(t("Anaphylaxis Risk", "Anafilaksi Riski", lang));

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ═══ HEADER ═══ */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.logo}>DoctoPal</Text>
            <Text style={s.logoSub}>{t("Evidence-Based Health Assistant", "Kanıta Dayalı Sağlık Asistanı", lang)}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{fixTr(data.generatedAt)}</Text>
            <Text style={s.headerConfidential}>{t("Confidential Patient Information", "Gizli Hasta Bilgisi", lang)}</Text>
          </View>
        </View>
        <View style={s.headerLine} />

        {/* ═══ PATIENT INFO BOX ═══ */}
        <View style={s.infoBox}>
          <View style={s.infoGrid}>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t("Full Name", "Ad Soyad", lang)}</Text>
              <Text style={s.infoValue}>{fixTr(data.fullName) || "—"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t("Age", "Yaş", lang)}</Text>
              <Text style={s.infoValue}>{data.age ?? "—"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t("Gender", "Cinsiyet", lang)}</Text>
              <Text style={s.infoValue}>{genderLabel}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t("Blood Group", "Kan Grubu", lang)}</Text>
              <Text style={s.infoValue}>{data.bloodGroup || "—"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>BMI</Text>
              <Text style={s.infoValue}>{data.bmi != null ? data.bmi.toFixed(1) : "—"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>{t("Smoking", "Sigara", lang)}</Text>
              <Text style={s.infoValue}>{smokingLabel}</Text>
            </View>
          </View>
        </View>

        {/* ═══ CRITICAL ALERTS ═══ */}
        {criticalFlags.length > 0 && (
          <View style={s.criticalBox}>
            <Text style={s.criticalLabel}>{t("Critical Alert", "Kritik Uyarı", lang)}</Text>
            <Text style={s.criticalText}>{criticalFlags.join("  •  ")}</Text>
          </View>
        )}

        {/* ═══ S — SITUATION ═══ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLetter}>S</Text>
            <Text style={s.sectionTitle}>{t("Situation", "Durum", lang)}</Text>
          </View>
          <View style={s.sectionDivider} />
          <Text style={s.bodyText}>
            {fixTr(data.fullName) || t("Patient", "Hasta", lang)}, {data.age ?? "?"} {t("years old", "yaşında", lang)}, {fixTr(genderLabel.toLowerCase())}.
            {data.bloodGroup ? ` ${t("Blood group", "Kan grubu", lang)}: ${data.bloodGroup}.` : ""}
            {data.bmi != null ? ` BMI: ${data.bmi.toFixed(1)}.` : ""}
            {` ${smokingLabel}. ${alcoholLabel}.`}
            {criticalFlags.length > 0 ? ` ${t("Critical", "Kritik", lang)}: ${criticalFlags.join(", ")}.` : ""}
          </Text>
        </View>

        {/* ═══ B — BACKGROUND ═══ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLetter}>B</Text>
            <Text style={s.sectionTitle}>{t("Background", "Geçmiş", lang)}</Text>
          </View>
          <View style={s.sectionDivider} />

          {/* Chronic Conditions */}
          <Text style={s.subTitle}>{t("Chronic Conditions", "Kronik Hastalıklar", lang)}</Text>
          {chronic.length > 0 ? chronic.map((c, i) => (
            <View key={i} style={s.bulletRow}>
              <Text style={s.bulletDot}>•</Text>
              <Text style={s.bulletText}>{fixTr(translateCondition(c, lang))}</Text>
            </View>
          )) : <Text style={s.emptyText}>{t("No chronic conditions reported", "Kronik hastalık bildirilmemiş", lang)}</Text>}

          {/* Surgical History */}
          {surgery.length > 0 && (
            <>
              <Text style={s.subTitle}>{t("Surgical History", "Cerrahi Geçmiş", lang)}</Text>
              {surgery.map((c, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletDot}>•</Text>
                  <Text style={s.bulletText}>{fixTr(translateCondition(c, lang))}</Text>
                </View>
              ))}
            </>
          )}

          {/* Family History */}
          {data.familyHistory.length > 0 && (
            <>
              <Text style={s.subTitle}>{t("Family Health History", "Aile Sağlık Geçmişi", lang)}</Text>
              {data.familyHistory.map((f, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletDot}>•</Text>
                  <Text style={s.bulletText}>{fixTr(translateCondition(f, lang))}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* ═══ A — ASSESSMENT ═══ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLetter}>A</Text>
            <Text style={s.sectionTitle}>{t("Assessment", "Değerlendirme", lang)}</Text>
          </View>
          <View style={s.sectionDivider} />

          {/* Allergies */}
          <Text style={s.subTitle}>{t("Allergies", "Alerjiler", lang)}</Text>
          {data.allergies.length > 0 ? (
            <>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderText, s.col1]}>{t("Allergen", "Alerjen", lang)}</Text>
                <Text style={[s.tableHeaderText, s.col2]}>{t("Reaction Type", "Reaksiyon Tipi", lang)}</Text>
              </View>
              {data.allergies.map((a, i) => (
                <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, s.col1]}>{fixTr(a.allergen)}</Text>
                  <Text style={[s.tableCell, s.col2]}>{REACTION[a.severity]?.[lang] || a.severity}</Text>
                </View>
              ))}
            </>
          ) : <Text style={s.emptyText}>{t("No allergies recorded", "Kayıtlı alerji yok", lang)}</Text>}

          {/* Medications */}
          <Text style={s.subTitle}>{t("Active Medications", "Aktif İlaçlar", lang)}</Text>
          {data.medications.length > 0 ? (
            <>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderText, s.col1]}>{t("Medication", "İlaç", lang)}</Text>
                <Text style={[s.tableHeaderText, s.col2]}>{t("Dose", "Doz", lang)}</Text>
                <Text style={[s.tableHeaderText, s.col3]}>{t("Frequency", "Sıklık", lang)}</Text>
              </View>
              {data.medications.map((m, i) => (
                <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, s.col1]}>{fixTr(m.name)}</Text>
                  <Text style={[s.tableCell, s.col2]}>{fixTr(m.dosage)}</Text>
                  <Text style={[s.tableCell, s.col3]}>{translateFreq(m.frequency, lang)}</Text>
                </View>
              ))}
            </>
          ) : <Text style={s.emptyText}>{t("No active medications", "Kayıtlı ilaç yok", lang)}</Text>}

          {/* Supplements */}
          {data.supplements.length > 0 && (
            <>
              <Text style={s.subTitle}>{t("Supplements", "Takviyeler", lang)}</Text>
              <View style={s.badgeRow}>
                {data.supplements.map((sup, i) => <Text key={i} style={s.badge}>{sup}</Text>)}
              </View>
            </>
          )}

          {/* Vaccines */}
          {data.vaccines.length > 0 && (
            <>
              <Text style={s.subTitle}>{t("Vaccination Status", "Aşı Durumu", lang)}</Text>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderText, s.col1]}>{t("Vaccine", "Aşı", lang)}</Text>
                <Text style={[s.tableHeaderText, s.col2]}>{t("Date", "Tarih", lang)}</Text>
                <Text style={[s.tableHeaderText, s.col3]}>{t("Status", "Durum", lang)}</Text>
              </View>
              {data.vaccines.map((v, i) => (
                <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, s.col1]}>{fixTr(v.name)}</Text>
                  <Text style={[s.tableCell, s.col2]}>{v.lastDate || t("Not specified", "Belirtilmemiş", lang)}</Text>
                  <Text style={[s.tableCell, s.col3]}>{v.status === "done" ? "✓" : "—"}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* ═══ R — RECOMMENDATION ═══ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLetter}>R</Text>
            <Text style={s.sectionTitle}>{t("Recommendation", "Öneri", lang)}</Text>
          </View>
          <View style={s.sectionDivider} />
          <View style={s.recBox}>
            <Text style={s.recText}>
              {t(
                "This structured SBAR report summarizes the patient's current health profile. Please review medications, allergies, and chronic conditions before clinical decisions. For interaction risks, refer to the DoctoPal interaction checker.",
                "Bu yapılandırılmış SBAR raporu hastanın güncel sağlık profilini özetlemektedir. Klinik kararlar öncesinde ilaçları, alerjileri ve kronik hastalıkları gözden geçiriniz. Etkileşim riskleri için DoctoPal etkileşim kontrolünü kullanınız.",
                lang
              )}
            </Text>
          </View>
        </View>

        {/* ═══ DISCLAIMER ═══ */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            {t(
              "This report was generated by DoctoPal AI and does not constitute a medical diagnosis or prescription. It is intended as supplementary information for healthcare professionals. Not a substitute for professional medical evaluation. In emergencies, call 112.",
              "Bu rapor DoctoPal AI tarafından oluşturulmuştur ve tıbbi teşhis veya reçete niteliği taşımaz. Sağlık profesyonelleri için destekleyici bilgi amacıyla hazırlanmıştır. Profesyonel tıbbi değerlendirmenin yerini tutmaz. Acil durumlarda 112'yi arayınız.",
              lang
            )}
          </Text>
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>doctopal.com | KVKK {t("Compliant", "Uyumlu", lang)}</Text>
          <Text style={s.footerCenter} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          <Text style={s.footerText}>{fixTr(data.generatedAt)}</Text>
        </View>
      </Page>
    </Document>
  );
}
