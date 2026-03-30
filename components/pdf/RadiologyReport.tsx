// © 2026 Phytotherapy.ai — All Rights Reserved
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  header: { borderBottom: "2px solid #2563eb", paddingBottom: 12, marginBottom: 20 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#2563eb" },
  subtitle: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  urgencyBanner: { padding: 12, borderRadius: 4, marginBottom: 16 },
  urgencyNormal: { backgroundColor: "#f0fdf4", color: "#166534" },
  urgencyAttention: { backgroundColor: "#fefce8", color: "#854d0e" },
  urgencyUrgent: { backgroundColor: "#fef2f2", color: "#991b1b" },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#2563eb", marginTop: 16, marginBottom: 8, borderBottom: "1px solid #d1d5db", paddingBottom: 4 },
  finding: { marginBottom: 10, padding: 8, backgroundColor: "#f8fafc", borderRadius: 4 },
  findingRegion: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 3 },
  findingText: { fontSize: 9, color: "#374151", marginBottom: 2 },
  glossaryItem: { marginBottom: 6 },
  glossaryTerm: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  glossaryDef: { fontSize: 9, color: "#374151" },
  disclaimer: { marginTop: 20, padding: 12, backgroundColor: "#fef2f2", borderRadius: 4, fontSize: 8, color: "#991b1b", lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#9ca3af", borderTop: "0.5px solid #e5e7eb", paddingTop: 8 },
  listItem: { marginBottom: 4, paddingLeft: 10, fontSize: 9, color: "#374151" },
  bullet: { fontFamily: "Helvetica-Bold", color: "#2563eb" },
});

interface Finding {
  region: string;
  observation: string;
  medicalTerm: string;
  significance: string;
  explanation: string;
}

interface GlossaryItem {
  term: string;
  definition: string;
}

interface Analysis {
  imageType: string;
  overallUrgency: string;
  summary: string;
  findings: Finding[];
  glossary: GlossaryItem[];
  doctorDiscussion: string[];
  limitations: string[];
  disclaimer: string;
}

export function RadiologyReport({ analysis }: { analysis: Analysis }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const urgencyStyle = analysis.overallUrgency === "urgent" ? styles.urgencyUrgent
    : analysis.overallUrgency === "attention" ? styles.urgencyAttention
    : styles.urgencyNormal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Phytotherapy.ai — Radiology Analysis Report</Text>
          <Text style={styles.subtitle}>Educational Radiology Image Interpretation | For Healthcare Provider Review</Text>
        </View>

        <View style={[styles.urgencyBanner, urgencyStyle]}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
            Urgency: {analysis.overallUrgency.toUpperCase()} | Modality: {analysis.imageType.toUpperCase()}
          </Text>
          <Text>{analysis.summary}</Text>
        </View>

        <Text style={styles.sectionTitle}>Findings</Text>
        {analysis.findings.map((f, i) => (
          <View key={i} style={styles.finding}>
            <Text style={styles.findingRegion}>{f.region} — {f.significance.toUpperCase()}</Text>
            <Text style={styles.findingText}>{f.observation}</Text>
            <Text style={styles.findingText}>Medical term: {f.medicalTerm}</Text>
            <Text style={styles.findingText}>{f.explanation}</Text>
          </View>
        ))}

        {analysis.glossary.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Medical Glossary</Text>
            {analysis.glossary.map((g, i) => (
              <View key={i} style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>{g.term}</Text>
                <Text style={styles.glossaryDef}>{g.definition}</Text>
              </View>
            ))}
          </>
        )}

        {analysis.doctorDiscussion.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Discussion Points for Your Doctor</Text>
            {analysis.doctorDiscussion.map((point, i) => (
              <View key={i} style={styles.listItem}>
                <Text><Text style={styles.bullet}>{i + 1}. </Text>{point}</Text>
              </View>
            ))}
          </>
        )}

        {analysis.limitations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Analysis Limitations</Text>
            {analysis.limitations.map((lim, i) => (
              <View key={i} style={styles.listItem}>
                <Text><Text style={styles.bullet}>• </Text>{lim}</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.disclaimer}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>IMPORTANT DISCLAIMER</Text>
          <Text>{analysis.disclaimer || "This report is generated by Phytotherapy.ai for educational purposes only. It is NOT a radiological diagnosis. A qualified radiologist must interpret all medical images. Always consult your healthcare provider."}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Generated by Phytotherapy.ai | phytotherapy.ai</Text>
          <Text>{date}</Text>
        </View>
      </Page>
    </Document>
  );
}
