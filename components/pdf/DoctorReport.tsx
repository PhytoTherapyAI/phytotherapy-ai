// © 2026 DoctoPal — All Rights Reserved
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Sprint 20 HF revert — Helvetica built-in.
// NotoSans Vercel serverless'da fail oldu. Sprint 21+'da CDN font veya
// @react-pdf/renderer upgrade stratejisi.
Font.registerHyphenationCallback((word) => [word]);

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    borderBottom: "2px solid #059669",
    paddingBottom: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
  urgencyBanner: { padding: 12, borderRadius: 4, marginBottom: 16 },
  urgencyRoutine: { backgroundColor: "#f0fdf4", color: "#166534" },
  urgencySoon: { backgroundColor: "#fefce8", color: "#854d0e" },
  urgencyUrgent: { backgroundColor: "#fef2f2", color: "#991b1b" },
  patientInfo: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  patientRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  patientLabel: {
    fontFamily: "Helvetica-Bold",
    width: 100,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginTop: 16,
    marginBottom: 8,
    borderBottom: "1px solid #d1d5db",
    paddingBottom: 4,
  },
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "0.5px solid #e5e7eb",
  },
  col1: { width: "30%" },
  col2: { width: "20%" },
  col3: { width: "25%" },
  col4: { width: "25%" },
  statusNormal: { color: "#059669" },
  statusAbnormal: { color: "#dc2626", fontFamily: "Helvetica-Bold" },
  statusBorderline: { color: "#d97706" },
  recommendation: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#fefce8",
    borderRadius: 4,
  },
  recName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 3,
  },
  recDetail: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 2,
  },
  interactionCheck: {
    fontSize: 9,
    color: "#6b7280",
    fontFamily: "Helvetica",
    marginTop: 3,
    marginBottom: 2,
  },
  evidenceBadge: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  abnormalItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#fef9f2",
    borderRadius: 4,
  },
  abnormalMarker: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 2,
  },
  abnormalText: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 2,
  },
  lifestyleItem: {
    marginBottom: 6,
    paddingLeft: 10,
  },
  bulletPoint: {
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  disclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    fontSize: 8,
    color: "#991b1b",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "0.5px solid #e5e7eb",
    paddingTop: 8,
  },
  source: {
    fontSize: 8,
    color: "#6b7280",
    marginLeft: 10,
  },
});

// ============================================
// Types
// ============================================

interface ResultItem {
  marker: { name: string; unit: string };
  value: number;
  status: string;
  statusLabel: string;
}

interface AbnormalFinding {
  marker: string;
  value: string;
  status: string;
  explanation: string;
  concern?: string;
  referenceRange?: string;
}

interface SupplementRec {
  supplement: string;
  reason: string;
  dosage: string;
  duration: string;
  evidenceGrade: string;
  interactionCheck?: string;
  sources: Array<{ title: string; url: string; year: string }>;
}

interface Analysis {
  summary: string;
  abnormalFindings: AbnormalFinding[];
  supplementRecommendations: SupplementRec[];
  lifestyleAdvice: Array<{
    category: string;
    advice: string;
    reason: string;
  }>;
  doctorDiscussion: string[];
  disclaimer: string;
  overallUrgency?: "routine" | "soon" | "urgent";
  trendComparison?: string;
}

interface PatientInfo {
  name?: string;
  age?: number;
  gender?: string;
  date?: string;
}

interface DoctorReportProps {
  results: Record<string, ResultItem[]>;
  analysis: Analysis;
  patientInfo?: PatientInfo;
  lang?: "tr" | "en";
}

// ============================================
// Component
// ============================================

export function DoctorReport({ results, analysis, patientInfo, lang = "en" }: DoctorReportProps) {
  // Sprint 16 Commit 2 — locale-aware string bundle. Sprint 20 HF — Helvetica fallback.
  const t = {
    title: lang === "tr" ? "DoctoPal — Kan Tahlili Raporu" : "DoctoPal — Blood Test Report",
    subtitle: lang === "tr"
      ? "Eğitim Amaçlı Laboratuvar Sonuç Yorumu | Sağlık Profesyoneli İncelemesi İçin"
      : "Evidence-Based Integrative Medicine Analysis | For Healthcare Provider Review",
    summary: lang === "tr" ? "Özet" : "Summary",
    results: lang === "tr" ? "Test Sonuçları" : "Test Results",
    abnormalFindings: lang === "tr" ? "Anormal Bulgular" : "Abnormal Findings",
    supplementRecs: lang === "tr" ? "Takviye Önerileri (Kanıt Temelli)" : "Supplement Recommendations (Evidence-Based)",
    lifestyleAdvice: lang === "tr" ? "Yaşam Tarzı Önerileri" : "Lifestyle Recommendations",
    doctor: lang === "tr" ? "Doktorunuzla Konuşma Noktaları" : "Recommended Discussion Points for Healthcare Provider",
    disclaimer: lang === "tr" ? "ÖNEMLİ UYARI" : "IMPORTANT DISCLAIMER",
    urgency: lang === "tr" ? "Aciliyet" : "Urgency",
    parameter: lang === "tr" ? "Parametre" : "Marker",
    value: lang === "tr" ? "Değer" : "Result",
    referenceRange: lang === "tr" ? "Referans Aralık" : "Reference Range",
    status: lang === "tr" ? "Durum" : "Status",
    dosage: lang === "tr" ? "Dozaj" : "Dosage",
    duration: lang === "tr" ? "Süre" : "Duration",
    reason: lang === "tr" ? "Sebep" : "Reason",
    interactionCheck: lang === "tr" ? "İlaç Etkileşim Kontrolü" : "Drug Interaction Check",
    evidenceGrade: lang === "tr" ? "Kanıt Seviyesi" : "Evidence Grade",
    sources: lang === "tr" ? "Kaynaklar" : "Sources",
    patient: lang === "tr" ? "Hasta" : "Patient",
    notProvided: lang === "tr" ? "Belirtilmedi" : "Not provided",
    ageGender: lang === "tr" ? "Yaş / Cinsiyet" : "Age / Gender",
    years: lang === "tr" ? "yaş" : "years",
    reportDate: lang === "tr" ? "Rapor Tarihi" : "Report Date",
    naAbbr: lang === "tr" ? "Bilinmiyor" : "N/A",
    trendComparison: lang === "tr" ? "Trend Karşılaştırması" : "Trend Comparison",
    urgencyRoutine: lang === "tr" ? "Rutin takip" : "Routine follow-up",
    urgencySoon: lang === "tr" ? "Yakın zamanda doktor değerlendirmesi" : "Soon — clinical review advised",
    urgencyUrgent: lang === "tr" ? "Acil — bugün doktor değerlendirmesi" : "Urgent — same-day clinical evaluation",
    defaultDisclaimer: lang === "tr"
      ? "Bu rapor DoctoPal tarafından eğitim ve bilgilendirme amaçlı oluşturulmuştur. Tıbbi tavsiye, tanı veya tedavi yerine geçmez. Tüm takviye önerileri uygulamadan önce nitelikli bir sağlık profesyoneli tarafından gözden geçirilip onaylanmalıdır. AI analizi yayımlanmış araştırmalara dayanır ancak tüm bireysel faktörleri kapsamayabilir."
      : "This report is generated by DoctoPal for educational and informational purposes only. It does not constitute medical advice, diagnosis, or treatment. All supplement recommendations should be reviewed and approved by a qualified healthcare provider before implementation. The AI analysis is based on published research but may not account for all individual factors.",
    footer: lang === "tr" ? "DoctoPal tarafından oluşturuldu | doctopal.com" : "Generated by DoctoPal | doctopal.com",
  };

  const allResults = Object.values(results).flat();
  const date = patientInfo?.date || new Date().toLocaleDateString(
    lang === "tr" ? "tr-TR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  // Build referenceRange map from abnormalFindings (best-effort enrichment)
  const referenceRangeByMarker: Record<string, string> = {};
  for (const f of analysis.abnormalFindings ?? []) {
    if (f.referenceRange) referenceRangeByMarker[f.marker] = f.referenceRange;
  }

  const urgencyStyle =
    analysis.overallUrgency === "urgent"
      ? styles.urgencyUrgent
      : analysis.overallUrgency === "soon"
        ? styles.urgencySoon
        : styles.urgencyRoutine;

  const urgencyLabel =
    analysis.overallUrgency === "urgent"
      ? t.urgencyUrgent
      : analysis.overallUrgency === "soon"
        ? t.urgencySoon
        : t.urgencyRoutine;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {/* Urgency Banner — conditional on overallUrgency */}
        {analysis.overallUrgency && (
          <View style={[styles.urgencyBanner, urgencyStyle]}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
              {t.urgency}: {analysis.overallUrgency.toUpperCase()}
            </Text>
            <Text>{urgencyLabel}</Text>
          </View>
        )}

        {/* Patient Info */}
        <View style={styles.patientInfo}>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>{t.patient}:</Text>
            <Text>{patientInfo?.name || t.notProvided}</Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>{t.ageGender}:</Text>
            <Text>
              {patientInfo?.age ? `${patientInfo.age} ${t.years}` : t.naAbbr} /{" "}
              {patientInfo?.gender || t.naAbbr}
            </Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>{t.reportDate}:</Text>
            <Text>{date}</Text>
          </View>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>{t.summary}</Text>
        <Text style={{ marginBottom: 12, lineHeight: 1.4 }}>{analysis.summary}</Text>

        {/* Trend Comparison (optional) */}
        {analysis.trendComparison && analysis.trendComparison.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t.trendComparison}</Text>
            <Text style={{ marginBottom: 12, lineHeight: 1.4 }}>{analysis.trendComparison}</Text>
          </>
        )}

        {/* Test Results Table */}
        <Text style={styles.sectionTitle}>{t.results}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>{t.parameter}</Text>
            <Text style={styles.col2}>{t.value}</Text>
            <Text style={styles.col3}>{t.referenceRange}</Text>
            <Text style={styles.col4}>{t.status}</Text>
          </View>
          {allResults.map((r, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{r.marker.name}</Text>
              <Text style={styles.col2}>
                {r.value} {r.marker.unit}
              </Text>
              <Text style={styles.col3}>{referenceRangeByMarker[r.marker.name] || "—"}</Text>
              <Text
                style={[
                  styles.col4,
                  r.status === "optimal"
                    ? styles.statusNormal
                    : r.status === "high" || r.status === "low"
                      ? styles.statusAbnormal
                      : styles.statusBorderline,
                ]}
              >
                {r.statusLabel}
              </Text>
            </View>
          ))}
        </View>

        {/* Abnormal Findings (detailed) */}
        {analysis.abnormalFindings && analysis.abnormalFindings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t.abnormalFindings}</Text>
            {analysis.abnormalFindings.map((f, i) => (
              <View key={i} style={styles.abnormalItem}>
                <Text style={styles.abnormalMarker}>
                  {f.marker} — {f.value} ({f.status.toUpperCase()})
                </Text>
                {f.referenceRange && (
                  <Text style={styles.abnormalText}>
                    {t.referenceRange}: {f.referenceRange}
                  </Text>
                )}
                <Text style={styles.abnormalText}>{f.explanation}</Text>
                {f.concern && <Text style={styles.abnormalText}>{f.concern}</Text>}
              </View>
            ))}
          </>
        )}

        {/* Supplement Recommendations */}
        {analysis.supplementRecommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t.supplementRecs}</Text>
            {analysis.supplementRecommendations.map((rec, i) => (
              <View key={i} style={styles.recommendation}>
                <Text style={styles.recName}>
                  {rec.supplement} — {t.evidenceGrade}: {rec.evidenceGrade}
                </Text>
                <Text style={styles.recDetail}>
                  {t.reason}: {rec.reason}
                </Text>
                <Text style={styles.recDetail}>
                  {t.dosage}: {rec.dosage}
                </Text>
                <Text style={styles.recDetail}>
                  {t.duration}: {rec.duration}
                </Text>
                {rec.interactionCheck && (
                  <Text style={styles.interactionCheck}>
                    {t.interactionCheck}: {rec.interactionCheck}
                  </Text>
                )}
                {rec.sources.length > 0 && (
                  <Text style={styles.evidenceBadge}>
                    {t.sources}: {rec.sources.map((s) => `${s.title} (${s.year})`).join("; ")}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Lifestyle Advice */}
        {analysis.lifestyleAdvice.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t.lifestyleAdvice}</Text>
            {analysis.lifestyleAdvice.map((item, i) => (
              <View key={i} style={styles.lifestyleItem}>
                <Text>
                  <Text style={styles.bulletPoint}>{item.category}: </Text>
                  {item.advice}
                </Text>
                <Text style={styles.source}>({item.reason})</Text>
              </View>
            ))}
          </>
        )}

        {/* Points to Discuss with Doctor */}
        {analysis.doctorDiscussion.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t.doctor}</Text>
            {analysis.doctorDiscussion.map((point, i) => (
              <View key={i} style={styles.lifestyleItem}>
                <Text>
                  <Text style={styles.bulletPoint}>{i + 1}. </Text>
                  {point}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
            {t.disclaimer}
          </Text>
          <Text>{analysis.disclaimer || t.defaultDisclaimer}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{t.footer}</Text>
          <Text>{date}</Text>
        </View>
      </Page>
    </Document>
  );
}
