// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drug & Herb Interaction Checker — DoctoPal",
  description: "Instantly check 50,000+ drug–herb–supplement interactions. Avoid risky combinations with evidence-based safety analysis. İlaç ve bitkisel takviye etkileşim kontrolü.",
  keywords: ["drug interaction checker", "ilaç etkileşimi", "herb drug interaction", "bitki ilaç etkileşimi", "supplement interaction", "OpenFDA"],
  openGraph: {
    title: "Drug & Herb Interaction Checker — DoctoPal",
    description: "Check 50,000+ interactions across prescriptions, herbs, and supplements.",
    url: "https://doctopal.com/interaction-checker",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
