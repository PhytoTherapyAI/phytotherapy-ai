// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Health Assistant — DoctoPal",
  description: "Ask any health question. DoctoPal's AI assistant gives evidence-based answers about medications, supplements, symptoms, and herbal interactions — backed by PubMed research. Yapay zeka destekli sağlık asistanı.",
  keywords: ["AI health assistant", "sağlık asistanı", "health chatbot", "medical AI", "fitoterapi danışmanı", "evidence-based medicine"],
  openGraph: {
    title: "AI Health Assistant — DoctoPal",
    description: "Evidence-based AI health assistant with 155+ tools and PubMed-cited answers.",
    url: "https://doctopal.com/health-assistant",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
