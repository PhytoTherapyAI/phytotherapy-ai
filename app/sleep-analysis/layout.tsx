// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sleep Analysis — DoctoPal",
  description: "Track sleep quality, identify patterns, and get personalized AI recommendations to improve your rest. Uyku analizi ve kişiselleştirilmiş öneriler.",
  keywords: ["sleep analysis", "uyku analizi", "sleep tracker", "uyku takibi", "sleep quality", "circadian rhythm"],
  openGraph: {
    title: "Sleep Analysis — DoctoPal",
    description: "Evidence-based sleep tracking with AI-driven improvement recommendations.",
    url: "https://doctopal.com/sleep-analysis",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
