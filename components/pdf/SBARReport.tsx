// © 2026 DoctoPal — All Rights Reserved
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Disable hyphenation to prevent word-break crashes
Font.registerHyphenationCallback(word => [word]);

// Turkish → ASCII transliteration for Helvetica (Latin-1 only)
const TR_MAP: Record<string, string> = {
  "ç": "c", "Ç": "C", "ğ": "g", "Ğ": "G", "ı": "i", "İ": "I",
  "ö": "o", "Ö": "O", "ş": "s", "Ş": "S", "ü": "u", "Ü": "U",
};
function ascii(str: string): string {
  return str.replace(/[çÇğĞıİöÖşŞüÜ]/g, ch => TR_MAP[ch] || ch);
}

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
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a", backgroundColor: "#FFFFFF" },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: green },
  logo: { fontSize: 22, fontWeight: "bold", color: green },
  headerSub: { fontSize: 10, color: "#6b7280", marginTop: 2 },
  headerDate: { fontSize: 9, color: "#9ca3af" },
  // Patient info grid
  infoGrid: { backgroundColor: greenBg, padding: 12, borderRadius: 6, marginBottom: 16 },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  label: { width: 80, fontWeight: "bold", fontSize: 10, color: "#374151" },
  value: { width: 140, fontSize: 10, color: "#111827" },
  // Sections
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: green, marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: green },
  // Critical
  criticalBox: { backgroundColor: redBg, padding: 10, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: "#ef4444", marginBottom: 10 },
  criticalText: { fontSize: 10, fontWeight: "bold", color: "#991b1b" },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: 8, borderRadius: 4 },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: grayBorder },
  tableRowAlt: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: grayBorder, backgroundColor: grayBg },
  col1: { flex: 2, fontSize: 9 },
  col2: { flex: 1, fontSize: 9 },
  col3: { flex: 1, fontSize: 9 },
  colBold: { fontWeight: "bold" },
  // Misc
  empty: { fontSize: 9, color: "#9ca3af", fontStyle: "italic", marginBottom: 4 },
  badge: { fontSize: 8, backgroundColor: "#dbeafe", color: "#1e40af", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginRight: 4, marginBottom: 3 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  alertBox: { backgroundColor: "#fefce8", padding: 10, borderRadius: 4, marginTop: 12 },
  alertText: { fontSize: 9, color: "#854d0e" },
  disclaimer: { marginTop: 16, padding: 10, backgroundColor: "#f3f4f6", borderRadius: 4 },
  disclaimerText: { fontSize: 8, color: "#6b7280", textAlign: "center" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: grayBorder, paddingTop: 8 },
  footerText: { fontSize: 7, color: "#9ca3af" },
  subLabel: { fontSize: 9, fontWeight: "bold", marginBottom: 3, marginTop: 8 },
  bodyText: { fontSize: 9, marginBottom: 4 },
  bulletText: { fontSize: 9, color: "#4b5563", marginBottom: 2 },
});

const t = (en: string, tr: string, lang: string) => ascii(lang === "tr" ? tr : en);

const GENDER_LABELS: Record<string, Record<string, string>> = {
  male: { en: "Male", tr: "Erkek" },
  female: { en: "Female", tr: "Kadin" },
  other: { en: "Other", tr: "Diger" },
  prefer_not_to_say: { en: "Not specified", tr: "Belirtilmemis" },
};

const FREQ_TR: Record<string, string> = {
  "daily": "Gunluk", "1x daily": "Gunluk", "once daily": "Gunluk", "qd": "Gunluk",
  "2x daily": "Gunde 2 kez", "twice daily": "Gunde 2 kez", "bid": "Gunde 2 kez",
  "3x daily": "Gunde 3 kez", "tid": "Gunde 3 kez",
  "as needed": "Gerektiginde", "prn": "Gerektiginde",
  "weekly": "Haftalik", "monthly": "Aylik",
};

const REACTION_LABELS: Record<string, Record<string, string>> = {
  anaphylaxis: { en: "Anaphylaxis", tr: "Anafilaksi" },
  urticaria: { en: "Urticaria", tr: "Kurdesen" },
  mild_skin: { en: "Mild Skin", tr: "Hafif Dokuntu" },
  gi_intolerance: { en: "GI Intolerance", tr: "Sindirim Intoleransi" },
  unknown: { en: "Unknown", tr: "Bilinmiyor" },
  mild: { en: "Mild", tr: "Hafif" },
  moderate: { en: "Moderate", tr: "Orta" },
  severe: { en: "Severe", tr: "Siddetli" },
};

const SMOKING_LABELS: Record<string, Record<string, string>> = {
  none: { en: "Never", tr: "Hic kullanmadim" },
  former: { en: "Former", tr: "Biraktim" },
  current: { en: "Active", tr: "Aktif kullaniyorum" },
};

const ALCOHOL_LABELS: Record<string, Record<string, string>> = {
  none: { en: "Never", tr: "Kullanmiyorum" },
  former: { en: "Former", tr: "Biraktim" },
  active: { en: "Active", tr: "Kullaniyorum" },
};

function trFreq(val: string, lang: string): string {
  if (lang !== "tr") return val;
  const lower = val.toLowerCase().trim();
  return FREQ_TR[lower] ?? FREQ_TR[val] ?? ascii(val);
}

export function SBARReport({ data }: { data: SBARData }) {
  const { lang } = data;

  const genderLabel = GENDER_LABELS[data.gender || ""]?.[lang] || ascii(data.gender || "") || "\u2014";
  const conditions = data.chronicConditions.filter(c => !c.startsWith("family:"));

  const criticalFlags: string[] = [];
  if (data.isPregnant) criticalFlags.push(t("PREGNANT", "HAMILE", lang));
  if (data.isBreastfeeding) criticalFlags.push(t("BREASTFEEDING", "EMZIRIYOR", lang));
  if (data.kidneyDisease) criticalFlags.push(t("KIDNEY DISEASE", "BOBREK YETMEZLIGI", lang));
  if (data.liverDisease) criticalFlags.push(t("BLEEDING DISORDER", "KANAMA BOZUKLUGU", lang));
  if (data.allergies.some(a => a.severity === "anaphylaxis")) criticalFlags.push(t("ANAPHYLAXIS RISK", "ANAFILAKSI RISKI", lang));

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>DoctoPal</Text>
            <Text style={s.headerSub}>{t("Patient Health Summary (SBAR)", "Hasta Saglik Ozet Raporu (SBAR)", lang)}</Text>
          </View>
          <Text style={s.headerDate}>{ascii(data.generatedAt)}</Text>
        </View>

        {/* Patient Info */}
        <View style={s.infoGrid}>
          <View style={s.infoRow}>
            <Text style={s.label}>{t("Name:", "Ad:", lang)}</Text>
            <Text style={s.value}>{ascii(data.fullName) || "\u2014"}</Text>
            <Text style={s.label}>{t("Age:", "Yas:", lang)}</Text>
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

        {/* Critical Alerts */}
        {criticalFlags.length > 0 && (
          <View style={s.criticalBox}>
            <Text style={s.criticalText}>{t("CRITICAL:", "KRITIK:", lang)} {criticalFlags.join(" | ")}</Text>
          </View>
        )}

        {/* S — Situation */}
        <Text style={s.sectionTitle}>{t("S \u2014 Situation", "S \u2014 Durum (Situation)", lang)}</Text>
        <Text style={s.bodyText}>
          {ascii(data.fullName) || t("Patient", "Hasta", lang)}, {data.age ?? "?"} {t("years old", "yasinda", lang)}.
          {data.bloodGroup ? ` ${t("Blood group", "Kan grubu", lang)}: ${data.bloodGroup}.` : ""}
          {data.bmi != null ? ` BMI: ${data.bmi.toFixed(1)}.` : ""}
          {criticalFlags.length > 0 ? ` ${t("Critical flags", "Kritik durumlar", lang)}: ${criticalFlags.join(", ")}.` : ""}
        </Text>

        {/* B — Background */}
        <Text style={s.sectionTitle}>{t("B \u2014 Background", "B \u2014 Gecmis (Background)", lang)}</Text>

        <Text style={s.subLabel}>{t("Chronic Conditions:", "Kronik Hastaliklar:", lang)}</Text>
        {conditions.length > 0
          ? conditions.map((c, i) => <Text key={i} style={s.bulletText}>{"\u2022"} {ascii(c)}</Text>)
          : <Text style={s.empty}>{t("No chronic conditions", "Kronik hastalik yok", lang)}</Text>}

        {data.familyHistory.length > 0 && (
          <>
            <Text style={s.subLabel}>{t("Family History:", "Soygecmis:", lang)}</Text>
            {data.familyHistory.map((f, i) => <Text key={i} style={s.bulletText}>{"\u2022"} {ascii(f)}</Text>)}
          </>
        )}

        <Text style={s.subLabel}>{t("Substance Use:", "Madde Kullanimi:", lang)}</Text>
        <Text style={s.bodyText}>
          {t("Smoking:", "Sigara:", lang)} {SMOKING_LABELS[data.smokingUse]?.[lang] || ascii(data.smokingUse)} | {t("Alcohol:", "Alkol:", lang)} {ALCOHOL_LABELS[data.alcoholUse]?.[lang] || ascii(data.alcoholUse)}
        </Text>

        {/* A — Assessment */}
        <Text style={s.sectionTitle}>{t("A \u2014 Assessment", "A \u2014 Degerlendirme (Assessment)", lang)}</Text>

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
                <Text style={s.col1}>{ascii(a.allergen)}</Text>
                <Text style={s.col2}>{REACTION_LABELS[a.severity]?.[lang] || ascii(a.severity)}</Text>
              </View>
            ))}
          </>
        ) : <Text style={s.empty}>{t("No allergies recorded", "Kayitli alerji yok", lang)}</Text>}

        {/* Medications table */}
        <Text style={s.subLabel}>{t("Active Medications:", "Aktif Ilaclar:", lang)}</Text>
        {data.medications.length > 0 ? (
          <>
            <View style={s.tableHeader}>
              <Text style={[s.col1, s.colBold]}>{t("Medication", "Ilac", lang)}</Text>
              <Text style={[s.col2, s.colBold]}>{t("Dose", "Doz", lang)}</Text>
              <Text style={[s.col3, s.colBold]}>{t("Frequency", "Siklik", lang)}</Text>
            </View>
            {data.medications.map((m, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={s.col1}>{ascii(m.name)}</Text>
                <Text style={s.col2}>{ascii(m.dosage)}</Text>
                <Text style={s.col3}>{trFreq(m.frequency, lang)}</Text>
              </View>
            ))}
          </>
        ) : <Text style={s.empty}>{t("No active medications", "Kayitli ilac yok", lang)}</Text>}

        {/* Supplements */}
        {data.supplements.length > 0 && (
          <>
            <Text style={s.subLabel}>{t("Supplements:", "Takviyeler:", lang)}</Text>
            <View style={s.badgeRow}>
              {data.supplements.map((sup, i) => <Text key={i} style={s.badge}>{ascii(sup)}</Text>)}
            </View>
          </>
        )}

        {/* Vaccines */}
        {data.vaccines.length > 0 && (
          <>
            <Text style={s.subLabel}>{t("Vaccinations:", "Asilar:", lang)}</Text>
            <View style={s.tableHeader}>
              <Text style={[s.col1, s.colBold]}>{t("Vaccine", "Asi", lang)}</Text>
              <Text style={[s.col2, s.colBold]}>{t("Date", "Tarih", lang)}</Text>
            </View>
            {data.vaccines.map((v, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={s.col1}>{ascii(v.name)}</Text>
                <Text style={s.col2}>{v.lastDate || "\u2014"}</Text>
              </View>
            ))}
          </>
        )}

        {/* R — Recommendation */}
        <Text style={s.sectionTitle}>{t("R \u2014 Recommendation", "R \u2014 Oneri (Recommendation)", lang)}</Text>
        <View style={s.alertBox}>
          <Text style={s.alertText}>
            {t(
              "This report was generated by DoctoPal AI. It does not constitute a medical diagnosis. Share with your healthcare provider for professional evaluation.",
              "Bu rapor DoctoPal AI tarafindan olusturulmustur. Tibbi teshis niteligi tasimaz. Profesyonel degerlendirme icin doktorunuzla paylasin.",
              lang
            )}
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            {t(
              "DoctoPal \u2014 Evidence-based phytotherapy assistant. Not a substitute for professional medical advice. Emergency: Call 112.",
              "DoctoPal \u2014 Kanita dayali fitoterapi asistani. Profesyonel tibbi tavsiyenin yerini tutmaz. Acil durum: 112'yi arayin.",
              lang
            )}
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>doctopal.com | KVKK {t("Compliant", "Uyumlu", lang)}</Text>
          <Text style={s.footerText}>{t("Generated:", "Olusturulma:", lang)} {ascii(data.generatedAt)}</Text>
        </View>
      </Page>
    </Document>
  );
}
