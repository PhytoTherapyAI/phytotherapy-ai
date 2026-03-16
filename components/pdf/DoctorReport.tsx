import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
  evidenceBadge: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
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

interface Analysis {
  summary: string;
  abnormalFindings: Array<{
    marker: string;
    value: string;
    status: string;
    explanation: string;
  }>;
  supplementRecommendations: Array<{
    supplement: string;
    reason: string;
    dosage: string;
    duration: string;
    evidenceGrade: string;
    sources: Array<{ title: string; url: string; year: string }>;
  }>;
  lifestyleAdvice: Array<{
    category: string;
    advice: string;
    reason: string;
  }>;
  doctorDiscussion: string[];
  disclaimer: string;
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
}

// ============================================
// Component
// ============================================

export function DoctorReport({ results, analysis, patientInfo }: DoctorReportProps) {
  const allResults = Object.values(results).flat();
  const date = patientInfo?.date || new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Phytotherapy.ai — Blood Test Report</Text>
          <Text style={styles.subtitle}>
            Evidence-Based Integrative Medicine Analysis | For Healthcare Provider Review
          </Text>
        </View>

        {/* Patient Info */}
        <View style={styles.patientInfo}>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Patient:</Text>
            <Text>{patientInfo?.name || "Not provided"}</Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Age / Gender:</Text>
            <Text>
              {patientInfo?.age ? `${patientInfo.age} years` : "N/A"} /{" "}
              {patientInfo?.gender || "N/A"}
            </Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Report Date:</Text>
            <Text>{date}</Text>
          </View>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={{ marginBottom: 12, lineHeight: 1.4 }}>{analysis.summary}</Text>

        {/* Test Results Table */}
        <Text style={styles.sectionTitle}>Test Results</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Marker</Text>
            <Text style={styles.col2}>Result</Text>
            <Text style={styles.col3}>Reference Range</Text>
            <Text style={styles.col4}>Status</Text>
          </View>
          {allResults.map((r, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{r.marker.name}</Text>
              <Text style={styles.col2}>
                {r.value} {r.marker.unit}
              </Text>
              <Text style={styles.col3}>
                {/* This would need range info passed through */}
                —
              </Text>
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

        {/* Supplement Recommendations */}
        {analysis.supplementRecommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Supplement Recommendations (Evidence-Based)
            </Text>
            {analysis.supplementRecommendations.map((rec, i) => (
              <View key={i} style={styles.recommendation}>
                <Text style={styles.recName}>
                  {rec.supplement} — Evidence Grade: {rec.evidenceGrade}
                </Text>
                <Text style={styles.recDetail}>Reason: {rec.reason}</Text>
                <Text style={styles.recDetail}>Dosage: {rec.dosage}</Text>
                <Text style={styles.recDetail}>Duration: {rec.duration}</Text>
                {rec.sources.length > 0 && (
                  <Text style={styles.evidenceBadge}>
                    Sources: {rec.sources.map((s) => `${s.title} (${s.year})`).join("; ")}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Lifestyle Advice */}
        {analysis.lifestyleAdvice.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Lifestyle Recommendations</Text>
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
            <Text style={styles.sectionTitle}>
              Recommended Discussion Points for Healthcare Provider
            </Text>
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
            IMPORTANT DISCLAIMER
          </Text>
          <Text>
            {analysis.disclaimer ||
              "This report is generated by Phytotherapy.ai for educational and informational purposes only. It does not constitute medical advice, diagnosis, or treatment. All supplement recommendations should be reviewed and approved by a qualified healthcare provider before implementation. The AI analysis is based on published research but may not account for all individual factors."}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Phytotherapy.ai | phytotherapy.ai</Text>
          <Text>{date}</Text>
        </View>
      </Page>
    </Document>
  );
}
