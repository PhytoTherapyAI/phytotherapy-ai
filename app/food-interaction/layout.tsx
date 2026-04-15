// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food–Drug Interaction Checker — DoctoPal",
  description: "Find out which foods can affect your medications. Grapefruit, leafy greens, dairy, and more — get evidence-based warnings. Yiyecek-ilaç etkileşimi.",
  keywords: ["food drug interaction", "yiyecek ilaç etkileşimi", "grapefruit warfarin", "diet medication", "MAOI tyramine"],
  openGraph: {
    title: "Food–Drug Interaction Checker — DoctoPal",
    description: "Evidence-based food–medication interaction analysis to keep treatments effective.",
    url: "https://doctopal.com/food-interaction",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
