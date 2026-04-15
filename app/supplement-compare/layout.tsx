// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supplement Comparison — DoctoPal",
  description: "Compare supplements side by side: efficacy, dosage, evidence grade, safety, and drug interactions. PubMed-backed comparisons. Takviye karşılaştırma.",
  keywords: ["supplement comparison", "takviye karşılaştırma", "vitamin compare", "evidence-based supplements", "phytotherapy"],
  openGraph: {
    title: "Supplement Comparison — DoctoPal",
    description: "Side-by-side supplement analysis with evidence grades and interaction warnings.",
    url: "https://doctopal.com/supplement-compare",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
