// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anxiety Toolkit — DoctoPal",
  description: "Evidence-based exercises for anxiety: breathing, grounding, CBT prompts, and journaling. Track triggers and progress over time. Anksiyete araç kutusu.",
  keywords: ["anxiety toolkit", "anksiyete", "breathing exercises", "nefes egzersizi", "CBT", "panic attack", "panik atak"],
  openGraph: {
    title: "Anxiety Toolkit — DoctoPal",
    description: "Evidence-based anxiety management: breathing, grounding, CBT exercises, and tracking.",
    url: "https://doctopal.com/anxiety-toolkit",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
