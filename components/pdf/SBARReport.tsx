// © 2026 Doctopal — All Rights Reserved
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register Roboto for Turkish character support (ş, ğ, ü, ö, ç, ı, İ)
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2", fontWeight: "bold" },
  ],
});

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

const green = "#16a34a";
const greenBg = "#f0fdf4";
const grayBg = "#f9fafb";
const grayBorder = "#e5e7eb";
const redBg = "#fef2f2";

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Roboto", fontSize: 10, color: "#1a1a1a", backgroundColor: "#FFFFFF" },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: green },
  logo: { fontSize: 22, fontWeight: "bold", color: green, fontFamily: "Roboto" },
  headerSub: { fontSize: 10, color: "#6b7280", marginTop: 2, fontFamily: "Roboto" },
  headerDate: { fontSize: 9, color: "#9ca3af", fontFamily: "Roboto" },
  // Patient info grid
  infoGrid: { backgroundColor: greenBg, padding: 12, borderRadius: 6, marginBottom: 16 },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  label: { width: 80, fontWeight: "bold", fontSize: 10, color: "#374151", fontFamily: "Roboto" },
  value: { width: 140, fontSize: 10, color: "#111827", fontFamily: "Roboto" },
  // Sections
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: green, marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: green, fontFamily: "Roboto" },
  // Critical
  criticalBox: { backgroundColor: redBg, padding: 10, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: "#ef4444", marginBottom: 10 },
  criticalText: { fontSize: 10, fontWeight: "bold", color: "#991b1b", fontFamily: "Roboto" },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: 8, borderRadius: 4 },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: grayBorder },
  tableRowAlt: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: grayBorder, backgroundColor: grayBg },
  col1: { flex: 2, fontSize: 9, fontFamily: "Roboto" },
  col2: { flex: 1, fontSize: 9, fontFamily: "Roboto" },
  col3: { flex: 1, fontSize: 9, fontFamily: "Roboto" },
  colBold: { fontWeight: "bold" },
  // Misc
  empty: { fontSize: 9, color: "#9ca3af", fontStyle: "italic", fontFamily: "Roboto", marginBottom: 4 },
  badge: { fontSize: 8, backgroundColor: "#dbeafe", color: "#1e40af", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginRight: 4, marginBottom: 3 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  alertBox: { backgroundColor: "#fefce8", padding: 10, borderRadius: 4, marginTop: 12 },
  alertText: { fontSize: 9, color: "#854d0e", fontFamily: "Roboto" },
  disclaimer: { marginTop: 16, padding: 10, backgroundColor: "#f3f4f6", borderRadius: 4 },
  disclaimerText: { fontSize: 8, color: "#6b7280", textAlign: "center", fontFamily: "Roboto" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: grayBorder, paddingTop: 8 },
  footerText: { fontSize: 7, color: "#9ca3af", fontFamily: "Roboto" },
  subLabel: { fontSize: 9, fontWeight: "bold", fontFamily: "Roboto", marginBottom: 3, marginTop: 8 },
  bodyText: { fontSize: 9, fontFamily: "Roboto", marginBottom: 4 },
  bulletText: { fontSize: 9, fontFamily: "Roboto", color: "#4b5563", marginBottom: 2 },
});

const t = (en: string, tr: string, lang: string) => (lang === "tr" ? tr : en);

const GENDER_LABELS: Record<string, Record<string, string>> = {
  male: { en: "Male", tr: "Erkek" },
  female: { en: "Female", tr: "Kadın" },
  other: { en: "Other", tr: "Diğer" },
  prefer_not_to_say: { en: "Not specified", tr: "Belirtilmemiş" },
};

const FREQ_TR: Record<string, string> = {
  "daily": "Günlük", "1x daily": "Günlük", "once daily": "Günlük", "qd": "Günlük",
  "2x daily": "Günde 2 kez", "twice daily": "Günde 2 kez", "bid": "Günde 2 kez",
  "3x daily": "Günde 3 kez", "tid": "Günde 3 kez",
  "as needed": "Gerektiğinde", "prn": "Gerektiğinde",
  "weekly": "Haftalık", "monthly": "Aylık",
};

const REACTION_LABELS: Record<string, Record<string, string>> = {
  anaphylaxis: { en: "Anaphylaxis", tr: "Anafilaksi" },
  urticaria: { en: "Urticaria", tr: "Kurdeşen" },
  mild_skin: { en: "Mild Skin", tr: "Hafif Döküntü" },
  gi_intolerance: { en: "GI Intolerance", tr: "Sindirim İntoleransı" },
  unknown: { en: "Unknown", tr: "Bilinmiyor" },
  mild: { en: "Mild", tr: "Hafif" },
  moderate: { en: "Moderate", tr: "Orta" },
  severe: { en: "Severe", tr: "Şiddetli" },
};

const SMOKING_LABELS: Record<string, Record<string, string>> = {
  none: { en: "Never", tr: "Hiç kullanmadım" },
  former: { en: "Former", tr: "Bıraktım" },
  current: { en: "Active", tr: "Aktif kullanıyorum" },
};

const ALCOHOL_LABELS: Record<string, Record<string, string>> = {
  none: { en: "Never", tr: "Kullanmıyorum" },
  former: { en: "Former", tr: "Bıraktım" },
  active: { en: "Active", tr: "Kullanıyorum" },
};

function trFreq(val: string, lang: string): string {
  if (lang !== "tr") return val;
  const lower = val.toLowerCase().trim();
  return FREQ_TR[lower] ?? FREQ_TR[val] ?? val;
}

export function SBARReport({ data }: { data: SBARData }) {
  const { lang } = data;
  const isTr = lang === "tr";

  const genderLabel = GENDER_LABELS[data.gender || ""]?.[lang] || data.gender || "\u2014";
  const conditions = data.chronicConditions.filter(c => !c.startsWith("family:"));

  const criticalFlags: string[] = [];
  if (data.isPregnant) criticalFlags.push(t("PREGNANT", "HAMİLE", lang));
  if (data.isBreastfeeding) criticalFlags.push(t("BREASTFEEDING", "EMZİRİYOR", lang));
  if (data.kidneyDisease) criticalFlags.push(t("KIDNEY DISEASE", "BÖBREK YETMEZLİĞİ", lang));
  if (data.liverDisease) criticalFlags.push(t("BLEEDING DISORDER", "KANAMA BOZUKLUĞU", lang));
  if (data.allergies.some(a => a.severity === "anaphylaxis")) criticalFlags.push(t("ANAPHYLAXIS RISK", "ANAFİLAKSİ RİSKİ", lang));

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>DoctoPal</Text>
            <Text style={s.headerSub}>{t("Patient Health Summary (SBAR)", "Hasta Sağlık Özet Raporu (SBAR)", lang)}</Text>
          </View>
          <Text style={s.headerDate}>{data.generatedAt}</Text>
        </View>

        {/* ── Patient Info ── */}
        <View style={s.infoGrid}>
          <View style={s.infoRow}>
            <Text style={s.label}>{t("Name:", "Ad:", lang)}</Text>
            <Text style={s.value}>{data.fullName || "\u2014"}</Text>
            <Text style={s.label}>{t("Age:", "Yaş:", lang)}</Text>
            <Text style={s.value}>{data.age ?? "\u2014"}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.label}>{t("Gender:", "Cinsiyet:", lang)}</Text>
            <Text style={s.value}>{genderLabel}</Text>
            <Text style={s.label}>{t("Blood:", "Kan:", lang)}</Text>
            <Text style={s.value}>{data.bloodGroup || "\u2014"}</Text>
          </View>
          {data.bmi != null && (
            <View style={s.infoRow}>
              <Text style={s.label}>BMI:</Text>
              <Text style={s.value}>{data.bmi.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* ── Critical Alerts ── */}
        {criticalFlags.length > 0 && (
          <View style={s.criticalBox}>
            <Text style={s.criticalText}>{t("CRITICAL:", "KRİTİK:", lang)} {criticalFlags.join(" | ")}</Text>
          </View>
        )}

        {/* ── S — Situation ── */}
        <Text style={s.sectionTitle}>{t("S — Situation", "S — Durum (Situation)", lang)}</Text>
        <Text style={s.bodyText}>
          {data.fullName || t("Patient", "Hasta", lang)}, {data.age ?? "?"} {t("years old", "yaşında", lang)}.
          {data.bloodGroup ? ` ${t("Blood group", "Kan grubu", lang)}: ${data.bloodGroup}.` : ""}
          {data.bmi != null ? ` BMI: ${data.bmi.toFixed(1)}.` : ""}
          {criticalFlags.length > 0 ? ` ${t("Critical flags", "Kritik durumlar", lang)}: ${criticalFlags.join(", ")}.` : ""}
        </Text>

        {/* ── B — Background ── */}
        <Text style={s.sectionTitle}>{t("B — Background", "B — Geçmiş (Background)", lang)}</Text>

        <Text style={s.subLabel}>{t("Chronic Conditions:", "Kronik Hastalıklar:", lang)}</Text>
        {conditions.length > 0
          ? conditions.map((c, i) => <Text key={i} style={s.bulletText}>{"\u2022"} {c}</Text>)
          : <Text style={s.empty}>{t("No chronic conditions", "Kronik hastalık yok", lang)}</Text>}

        {data.familyHistory.length > 0 && (
          <>
            <Text style={s.subLabel}>{t("Family History:", "Soygeçmiş:", lang)}</Text>
            {data.familyHistory.map((f, i) => <Text key={i} style={s.bulletText}>{"\u2022"} {f}</Text>)}
          </>
        )}

        <Text style={s.subLabel}>{t("Substance Use:", "Madde Kullanımı:", lang)}</Text>
        <Text style={s.bodyText}>
          {t("Smoking:", "Sigara:", lang)} {SMOKING_LABELS[data.smokingUse]?.[lang] || data.smokingUse} | {t("Alcohol:", "Alkol:", lang)} {ALCOHOL_LABELS[data.alcoholUse]?.[lang] || data.alcoholUse}
        </Text>

        {/* ── A — Assessment ── */}
        <Text style={s.sectionTitle}>{t("A — Assessment", "A — Değerlendirme (Assessment)", lang)}</Text>

        {/* Allergies table */}
        <Text style={s.subLabel}>{t("Allergies:", "Alerjiler:", lang)}</Text>
        {data.allergies.length > 0 ? (
          <>
            <View style={s.tableHeader}>
              <Text style={[s.col1, s.colBold]}>{t("Allergen", "Alerjen", lang)}</Text>
              <Text style={[s.col2, s.colBold]}>{t("Reaction", "Reaksiyon", lang)}</Text>
            </View>
            {data.allergies.map((a, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={s.col1}>{a.allergen}</Text>
                <Text style={s.col2}>{REACTION_LABELS[a.severity]?.[lang] || a.severity}</Text>
              </View>
            ))}
          </>
        ) : <Text style={s.empty}>{t("No allergies recorded", "Kayıtlı alerji yok", lang)}</Text>}

        {/* Medications table */}
        <Text style={s.subLabel}>{t("Active Medications:", "Aktif İlaçlar:", lang)}</Text>
        {data.medications.length > 0 ? (
          <>
            <View style={s.tableHeader}>
              <Text style={[s.col1, s.colBold]}>{t("Medication", "İlaç", lang)}</Text>
              <Text style={[s.col2, s.colBold]}>{t("Dose", "Doz", lang)}</Text>
              <Text style={[s.col3, s.colBold]}>{t("Frequency", "Sıklık", lang)}</Text>
            </View>
            {data.medications.map((m, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={s.col1}>{m.name}</Text>
                <Text style={s.col2}>{m.dosage}</Text>
                <Text style={s.col3}>{trFreq(m.frequency, lang)}</Text>
              </View>
            ))}
          </>
        ) : <Text style={s.empty}>{t("No active medications", "Kayıtlı ilaç yok", lang)}</Text>}

        {/* Supplements */}
        {data.supplements.length > 0 && (
          <>
            <Text style={s.subLabel}>{t("Supplements:", "Takviyeler:", lang)}</Text>
            <View style={s.badgeRow}>
              {data.supplements.map((sup, i) => <Text key={i} style={s.badge}>{sup}</Text>)}
            </View>
          </>
        )}

        {/* Vaccines */}
        {data.vaccines.length > 0 && (
          <>
            <Text style={s.subLabel}>{t("Vaccinations:", "Aşılar:", lang)}</Text>
            <View style={s.tableHeader}>
              <Text style={[s.col1, s.colBold]}>{t("Vaccine", "Aşı", lang)}</Text>
              <Text style={[s.col2, s.colBold]}>{t("Date", "Tarih", lang)}</Text>
            </View>
            {data.vaccines.map((v, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={s.col1}>{v.name}</Text>
                <Text style={s.col2}>{v.lastDate || "\u2014"}</Text>
              </View>
            ))}
          </>
        )}

        {/* ── R — Recommendation ── */}
        <Text style={s.sectionTitle}>{t("R — Recommendation", "R — Öneri (Recommendation)", lang)}</Text>
        <View style={s.alertBox}>
          <Text style={s.alertText}>
            {t(
              "This report was generated by DoctoPal AI. It does not constitute a medical diagnosis. Share with your healthcare provider for professional evaluation.",
              "Bu rapor DoctoPal AI tarafından oluşturulmuştur. Tıbbi teşhis niteliği taşımaz. Profesyonel değerlendirme için doktorunuzla paylaşın.",
              lang
            )}
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            {t(
              "DoctoPal — Evidence-based phytotherapy assistant. Not a substitute for professional medical advice. Emergency: Call 112.",
              "DoctoPal — Kanıta dayalı fitoterapi asistanı. Profesyonel tıbbi tavsiyenin yerini tutmaz. Acil durum: 112'yi arayın.",
              lang
            )}
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>doctopal.com | KVKK {t("Compliant", "Uyumlu", lang)}</Text>
          <Text style={s.footerText}>{t("Generated:", "Oluşturulma:", lang)} {data.generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}
