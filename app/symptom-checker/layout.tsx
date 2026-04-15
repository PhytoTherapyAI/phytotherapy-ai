// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Symptom Checker — DoctoPal",
  description: "Describe your symptoms and get an AI-powered triage with urgency assessment and next-step guidance. Semptom kontrolü ve aciliyet değerlendirmesi.",
  keywords: ["symptom checker", "semptom kontrolü", "AI triage", "online symptom assessment", "tıbbi triyaj"],
  openGraph: {
    title: "AI Symptom Checker — DoctoPal",
    description: "Evidence-based symptom triage with clear urgency levels and actionable next steps.",
    url: "https://doctopal.com/symptom-checker",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
