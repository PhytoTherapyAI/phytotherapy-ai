// © 2026 DoctoPal — All Rights Reserved
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { tx } from "@/lib/translations";
import type {
  ConversationStep,
  PossibleCondition,
  PhytotherapySuggestion,
} from "@/lib/types/symptom-assessment";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  header: { borderBottom: "2px solid #3c7a52", paddingBottom: 12, marginBottom: 20 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#3c7a52" },
  subtitle: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  badge: { fontSize: 8, color: "#3c7a52", marginTop: 2 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#3c7a52", marginBottom: 8, marginTop: 14 },
  patientBox: { backgroundColor: "#f0fdf4", padding: 12, borderRadius: 4, marginBottom: 14 },
  row: { flexDirection: "row" as const, marginBottom: 3 },
  label: { fontFamily: "Helvetica-Bold", width: 120 },
  value: { flex: 1 },
  urgencyBox: { padding: 10, borderRadius: 4, marginBottom: 14, textAlign: "center" as const },
  urgencyText: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  qaBlock: { marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid #e5e7eb" },
  question: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  answer: { fontSize: 10, color: "#374151", marginTop: 2 },
  conditionRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 4, padding: 6, backgroundColor: "#f9fafb", borderRadius: 3 },
  conditionName: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  conditionConf: { fontSize: 9, color: "#6b7280" },
  phytoRow: { marginBottom: 6, padding: 6, backgroundColor: "#f0fdf4", borderRadius: 3 },
  phytoName: { fontFamily: "Helvetica-Bold", fontSize: 10, color: "#3c7a52" },
  phytoDesc: { fontSize: 9, color: "#374151", marginTop: 2 },
  phytoCaution: { fontSize: 9, color: "#b45309", marginTop: 2 },
  alertBox: { padding: 8, backgroundColor: "#fef3c7", borderRadius: 3, marginBottom: 4 },
  alertText: { fontSize: 9, color: "#92400e" },
  disclaimer: { marginTop: 20, padding: 10, backgroundColor: "#f3f4f6", borderRadius: 4 },
  disclaimerText: { fontSize: 8, color: "#6b7280", textAlign: "center" as const },
  footer: { position: "absolute" as const, bottom: 30, left: 40, right: 40, flexDirection: "row" as const, justifyContent: "space-between" as const, borderTop: "1px solid #e5e7eb", paddingTop: 8 },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

const URGENCY_COLORS: Record<string, { bg: string; text: string }> = {
  emergency:      { bg: "#dc2626", text: "#ffffff" },
  er_visit:       { bg: "#fee2e2", text: "#991b1b" },
  urgent_care:    { bg: "#ffedd5", text: "#9a3412" },
  gp_today:       { bg: "#fef3c7", text: "#92400e" },
  see_doctor_today: { bg: "#fef3c7", text: "#92400e" },
  gp_appointment: { bg: "#fefce8", text: "#854d0e" },
  see_doctor_soon: { bg: "#fefce8", text: "#854d0e" },
  telehealth:     { bg: "#eff6ff", text: "#1e40af" },
  monitor:        { bg: "#eff6ff", text: "#1e40af" },
  pharmacy:       { bg: "#f0fdfa", text: "#115e59" },
  self_care:      { bg: "#ecfdf5", text: "#065f46" },
};

const URGENCY_LABELS_EN: Record<string, string> = {
  emergency: "CALL 112/911 IMMEDIATELY",
  er_visit: "Go to Emergency Room",
  urgent_care: "Visit Urgent Care Today",
  gp_today: "See Your Doctor Today",
  see_doctor_today: "See Your Doctor Today",
  gp_appointment: "Schedule a Doctor Appointment",
  see_doctor_soon: "Schedule a Doctor Appointment",
  telehealth: "Telehealth Consultation Recommended",
  monitor: "Monitor Symptoms",
  pharmacy: "Pharmacy Visit Sufficient",
  self_care: "Self-Care at Home",
};

const URGENCY_LABELS_TR: Record<string, string> = {
  emergency: "HEMEN 112'Yİ ARAYIN",
  er_visit: "Acil Servise Gidin",
  urgent_care: "Bugün Acil Bakıma Gidin",
  gp_today: "Bugün Doktorunuza Gidin",
  see_doctor_today: "Bugün Doktorunuza Gidin",
  gp_appointment: "Doktor Randevusu Alın",
  see_doctor_soon: "Doktor Randevusu Alın",
  telehealth: "Online Doktor Görüşmesi Önerilir",
  monitor: "Semptomları Takip Edin",
  pharmacy: "Eczane Ziyareti Yeterli",
  self_care: "Evde Öz Bakım Yeterli",
};

interface Props {
  history: ConversationStep[];
  conditions: PossibleCondition[];
  urgency: string;
  phytoSuggestions?: PhytotherapySuggestion[];
  medicationAlerts?: string[];
  finalSummary?: string;
  assessmentFor?: string;
  subjectInfo?: string;
  userName?: string;
  userAge?: number;
  userGender?: string;
  lang?: "en" | "tr";
}

export function SymptomAssessmentPDF({
  history, conditions, urgency, phytoSuggestions, medicationAlerts,
  finalSummary, assessmentFor, subjectInfo, userName, userAge, userGender, lang = "en",
}: Props) {
  const isTr = lang === "tr";
  const date = new Date().toLocaleDateString(isTr ? "tr-TR" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const reportId = `DA-${Date.now().toString(36).toUpperCase()}`;
  const urgencyColor = URGENCY_COLORS[urgency] || URGENCY_COLORS.self_care;
  const urgencyLabel = isTr ? (URGENCY_LABELS_TR[urgency] || urgency) : (URGENCY_LABELS_EN[urgency] || urgency);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DoctoPal</Text>
          <Text style={styles.subtitle}>
            {tx("symptomPdf.subtitle", lang)}
          </Text>
          <Text style={styles.badge}>{date} | {reportId}</Text>
        </View>

        {/* Patient Info */}
        <View style={styles.patientBox}>
          <Text style={{ ...styles.sectionTitle, marginTop: 0 }}>
            {tx("symptomPdf.patientInfo", lang)}
          </Text>
          {userName && (
            <View style={styles.row}>
              <Text style={styles.label}>{tx("symptomPdf.name", lang)}</Text>
              <Text style={styles.value}>{userName}</Text>
            </View>
          )}
          {userAge && (
            <View style={styles.row}>
              <Text style={styles.label}>{tx("symptomPdf.age", lang)}</Text>
              <Text style={styles.value}>{userAge}</Text>
            </View>
          )}
          {userGender && (
            <View style={styles.row}>
              <Text style={styles.label}>{tx("symptomPdf.gender", lang)}</Text>
              <Text style={styles.value}>{userGender}</Text>
            </View>
          )}
          {assessmentFor && assessmentFor !== "self" && (
            <View style={styles.row}>
              <Text style={styles.label}>{tx("symptomPdf.assessmentFor", lang)}</Text>
              <Text style={styles.value}>{subjectInfo || (assessmentFor === "child" ? tx("symptomPdf.child", lang) : tx("symptomPdf.someoneElse", lang))}</Text>
            </View>
          )}
        </View>

        {/* Urgency */}
        <View style={{ ...styles.urgencyBox, backgroundColor: urgencyColor.bg }}>
          <Text style={{ ...styles.urgencyText, color: urgencyColor.text }}>
            {tx("symptomPdf.urgencyLevel", lang)}: {urgencyLabel}
          </Text>
        </View>

        {/* Summary */}
        {finalSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tx("symptomPdf.assessmentSummary", lang)}</Text>
            <Text>{finalSummary}</Text>
          </View>
        )}

        {/* Conversation History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tx("symptomPdf.qaHistory", lang)}</Text>
          {history.map((h, i) => (
            <View key={i} style={styles.qaBlock}>
              <Text style={styles.question}>Q{i + 1}: {h.questionText}</Text>
              <Text style={styles.answer}>A: {h.selectedOptionLabel}</Text>
            </View>
          ))}
        </View>

        {/* Conditions */}
        {conditions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tx("symptomPdf.possibleConditions", lang)}</Text>
            {conditions.slice(0, 5).map((c, i) => (
              <View key={i} style={styles.conditionRow}>
                <Text style={styles.conditionName}>{c.name}</Text>
                <Text style={styles.conditionConf}>{c.confidence}% | {c.severity}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Medication Alerts */}
        {medicationAlerts && medicationAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tx("symptomPdf.medicationAlerts", lang)}</Text>
            {medicationAlerts.map((a, i) => (
              <View key={i} style={styles.alertBox}>
                <Text style={styles.alertText}>{a}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Phytotherapy */}
        {phytoSuggestions && phytoSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tx("symptomPdf.phytoSuggestions", lang)}</Text>
            {phytoSuggestions.map((s, i) => (
              <View key={i} style={styles.phytoRow}>
                <Text style={styles.phytoName}>{s.name} ({tx("symptomPdf.evidence", lang)}: {s.evidence})</Text>
                <Text style={styles.phytoDesc}>{s.description}</Text>
                {s.caution && <Text style={styles.phytoCaution}>{tx("symptomPdf.caution", lang)}: {s.caution}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            {tx("symptomPdf.disclaimer", lang)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© 2026 DoctoPal — doctopal.com</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
