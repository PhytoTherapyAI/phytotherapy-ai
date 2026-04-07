// © 2026 Doctopal — All Rights Reserved
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface SBARData {
  lang: "en" | "tr";
  // Situation
  fullName: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  bmi: number | null;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  kidneyDisease: boolean;
  liverDisease: boolean;
  // Background
  chronicConditions: string[];
  familyHistory: string[];
  smokingUse: string;
  alcoholUse: string;
  // Assessment
  allergies: { allergen: string; severity: string }[];
  medications: { name: string; dosage: string; frequency: string }[];
  supplements: string[];
  vaccines: { name: string; status: string; lastDate?: string }[];
  // Meta
  generatedAt: string;
}

const green = "#3c7a52";
const greenLight = "#f0fdf4";
const grayLight = "#f9fafb";
const grayBorder = "#e5e7eb";

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  header: { borderBottom: `2px solid ${green}`, paddingBottom: 12, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  logo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: green },
  headerSub: { fontSize: 10, color: "#6b7280", marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerDate: { fontSize: 9, color: "#9ca3af" },
  patientBox: { backgroundColor: greenLight, padding: 12, borderRadius: 4, marginBottom: 16, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  patientItem: { width: "48%", flexDirection: "row", marginBottom: 3 },
  label: { fontFamily: "Helvetica-Bold", width: 80, fontSize: 9 },
  value: { flex: 1, fontSize: 9 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: green, marginBottom: 8, marginTop: 14, paddingBottom: 4, borderBottom: `1px solid ${green}` },
  sectionLetter: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#ffffff", backgroundColor: green, borderRadius: 10, width: 20, height: 20, textAlign: "center", lineHeight: 20, marginRight: 6 },
  sectionRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, marginTop: 14 },
  row: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 8, borderBottom: `1px solid ${grayBorder}` },
  rowAlt: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 8, borderBottom: `1px solid ${grayBorder}`, backgroundColor: grayLight },
  cellName: { width: "40%", fontSize: 9 },
  cellDetail: { width: "35%", fontSize: 9, color: "#4b5563" },
  cellStatus: { width: "25%", fontSize: 9, color: "#6b7280" },
  criticalBox: { backgroundColor: "#fef2f2", padding: 8, borderRadius: 4, borderLeft: `3px solid #ef4444`, marginBottom: 8 },
  criticalText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#991b1b" },
  alertBox: { backgroundColor: "#fefce8", padding: 8, borderRadius: 4, marginTop: 8 },
  alertText: { fontSize: 9, color: "#854d0e" },
  badge: { fontSize: 8, backgroundColor: "#dbeafe", color: "#1e40af", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginRight: 4, marginBottom: 3 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  emptyText: { fontSize: 9, color: "#9ca3af", fontStyle: "italic" },
  disclaimer: { marginTop: 20, padding: 10, backgroundColor: "#f3f4f6", borderRadius: 4 },
  disclaimerText: { fontSize: 8, color: "#6b7280", textAlign: "center" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${grayBorder}`, paddingTop: 8 },
  footerText: { fontSize: 7, color: "#9ca3af" },
});

const t = (en: string, tr: string, lang: string) => lang === "tr" ? tr : en;

const reactionLabel = (sev: string, lang: string): string => {
  const map: Record<string, { en: string; tr: string }> = {
    anaphylaxis: { en: "Anaphylaxis", tr: "Anafilaksi" },
    urticaria: { en: "Urticaria", tr: "Kurdeşen" },
    mild_skin: { en: "Mild Skin", tr: "Hafif Kaşıntı" },
    gi_intolerance: { en: "Intolerance", tr: "İntolerans" },
    unknown: { en: "Unknown", tr: "Bilinmiyor" },
    mild: { en: "Mild", tr: "Hafif" },
    moderate: { en: "Moderate", tr: "Orta" },
    severe: { en: "Severe", tr: "Şiddetli" },
  };
  return map[sev]?.[lang === "tr" ? "tr" : "en"] || sev;
};

export function SBARReport({ data }: { data: SBARData }) {
  const { lang } = data;
  const criticalFlags: string[] = [];
  if (data.isPregnant) criticalFlags.push(t("PREGNANT", "HAMİLE", lang));
  if (data.isBreastfeeding) criticalFlags.push(t("BREASTFEEDING", "EMZİRİYOR", lang));
  if (data.kidneyDisease) criticalFlags.push(t("KIDNEY DISEASE", "BÖBREK HASTALIĞI", lang));
  if (data.liverDisease) criticalFlags.push(t("LIVER DISEASE", "KARACİĞER HASTALIĞI", lang));
  const hasAnaphylaxis = data.allergies.some(a => a.severity === "anaphylaxis");
  if (hasAnaphylaxis) criticalFlags.push(t("ANAPHYLAXIS RISK", "ANAFİLAKSİ RİSKİ", lang));

  const conditions = data.chronicConditions.filter(c => !c.startsWith("family:"));

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>DoctoPal</Text>
            <Text style={s.headerSub}>{t("Patient Health Summary (SBAR)", "Hasta Sağlık Özet Raporu (SBAR)", lang)}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{data.generatedAt}</Text>
          </View>
        </View>

        {/* Patient Info Box */}
        <View style={s.patientBox}>
          <View style={s.patientItem}><Text style={s.label}>{t("Name:", "Ad:", lang)}</Text><Text style={s.value}>{data.fullName || "—"}</Text></View>
          <View style={s.patientItem}><Text style={s.label}>{t("Age:", "Yaş:", lang)}</Text><Text style={s.value}>{data.age || "—"}</Text></View>
          <View style={s.patientItem}><Text style={s.label}>{t("Gender:", "Cinsiyet:", lang)}</Text><Text style={s.value}>{data.gender || "—"}</Text></View>
          <View style={s.patientItem}><Text style={s.label}>{t("Blood:", "Kan:", lang)}</Text><Text style={s.value}>{data.bloodGroup || "—"}</Text></View>
          {data.bmi && <View style={s.patientItem}><Text style={s.label}>BMI:</Text><Text style={s.value}>{data.bmi.toFixed(1)}</Text></View>}
        </View>

        {/* Critical Alerts */}
        {criticalFlags.length > 0 && (
          <View style={s.criticalBox}>
            <Text style={s.criticalText}>⚠ {t("CRITICAL ALERTS:", "KRİTİK UYARILAR:", lang)} {criticalFlags.join(" | ")}</Text>
          </View>
        )}

        {/* S — Situation */}
        <View style={s.sectionRow}>
          <View style={s.sectionLetter}><Text>S</Text></View>
          <Text style={[s.sectionTitle, { marginTop: 0, borderBottom: "none", paddingBottom: 0 }]}>{t("Situation", "Durum", lang)}</Text>
        </View>
        <Text style={{ fontSize: 9, marginBottom: 8 }}>
          {data.fullName || t("Patient", "Hasta", lang)}, {data.age || "?"} {t("years old", "yaşında", lang)}.
          {data.bloodGroup ? ` ${t("Blood group", "Kan grubu", lang)}: ${data.bloodGroup}.` : ""}
          {data.bmi ? ` BMI: ${data.bmi.toFixed(1)}.` : ""}
          {criticalFlags.length > 0 ? ` ${t("Critical flags", "Kritik durumlar", lang)}: ${criticalFlags.join(", ")}.` : ""}
        </Text>

        {/* B — Background */}
        <View style={s.sectionRow}>
          <View style={s.sectionLetter}><Text>B</Text></View>
          <Text style={[s.sectionTitle, { marginTop: 0, borderBottom: "none", paddingBottom: 0 }]}>{t("Background", "Geçmiş", lang)}</Text>
        </View>
        {conditions.length > 0 ? conditions.map((c, i) => (
          <View key={c} style={i % 2 === 0 ? s.row : s.rowAlt}><Text style={s.cellName}>{c}</Text></View>
        )) : <Text style={s.emptyText}>{t("No chronic conditions", "Kronik hastalık yok", lang)}</Text>}
        {data.familyHistory.length > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{t("Family History:", "Soygeçmiş:", lang)}</Text>
            {data.familyHistory.map((f, i) => <Text key={i} style={{ fontSize: 9, color: "#4b5563" }}>• {f}</Text>)}
          </View>
        )}
        {(data.smokingUse !== "none" || data.alcoholUse !== "none") && (
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 9 }}>{t("Smoking:", "Sigara:", lang)} {data.smokingUse} | {t("Alcohol:", "Alkol:", lang)} {data.alcoholUse}</Text>
          </View>
        )}

        {/* A — Assessment */}
        <View style={s.sectionRow}>
          <View style={s.sectionLetter}><Text>A</Text></View>
          <Text style={[s.sectionTitle, { marginTop: 0, borderBottom: "none", paddingBottom: 0 }]}>{t("Assessment", "Değerlendirme", lang)}</Text>
        </View>

        {/* Allergies */}
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{t("Allergies:", "Alerjiler:", lang)}</Text>
        {data.allergies.length > 0 ? data.allergies.map((a, i) => (
          <View key={i} style={i % 2 === 0 ? s.row : s.rowAlt}>
            <Text style={s.cellName}>{a.allergen}</Text>
            <Text style={s.cellDetail}>{reactionLabel(a.severity, lang)}</Text>
          </View>
        )) : <Text style={s.emptyText}>{t("None", "Yok", lang)}</Text>}

        {/* Medications */}
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3, marginTop: 8 }}>{t("Active Medications:", "Aktif İlaçlar:", lang)}</Text>
        {data.medications.length > 0 ? data.medications.map((m, i) => (
          <View key={i} style={i % 2 === 0 ? s.row : s.rowAlt}>
            <Text style={s.cellName}>{m.name}</Text>
            <Text style={s.cellDetail}>{m.dosage}</Text>
            <Text style={s.cellStatus}>{m.frequency}</Text>
          </View>
        )) : <Text style={s.emptyText}>{t("None", "Yok", lang)}</Text>}

        {/* Supplements */}
        {data.supplements.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{t("Supplements:", "Takviyeler:", lang)}</Text>
            <View style={s.badgeRow}>
              {data.supplements.map((sup, i) => <Text key={i} style={s.badge}>{sup}</Text>)}
            </View>
          </View>
        )}

        {/* Vaccines */}
        {data.vaccines.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{t("Vaccination Status:", "Aşı Durumu:", lang)}</Text>
            {data.vaccines.map((v, i) => (
              <View key={i} style={i % 2 === 0 ? s.row : s.rowAlt}>
                <Text style={s.cellName}>{v.name}</Text>
                <Text style={s.cellDetail}>{v.status}</Text>
                <Text style={s.cellStatus}>{v.lastDate || "—"}</Text>
              </View>
            ))}
          </View>
        )}

        {/* R — Recommendation */}
        <View style={s.sectionRow}>
          <View style={s.sectionLetter}><Text>R</Text></View>
          <Text style={[s.sectionTitle, { marginTop: 0, borderBottom: "none", paddingBottom: 0 }]}>{t("Recommendation", "Öneri", lang)}</Text>
        </View>
        <View style={s.alertBox}>
          <Text style={s.alertText}>
            {t(
              "This report was generated by DoctoPal AI. It does not constitute a medical diagnosis. Please share with your healthcare provider for professional evaluation.",
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
