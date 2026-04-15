// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drug Information — DoctoPal",
  description: "Search any medication: usage, dosage, side effects, contraindications, and warnings. Powered by OpenFDA and TİTCK. İlaç bilgisi ve prospektüs.",
  keywords: ["drug information", "ilaç bilgisi", "medication info", "prospektüs", "side effects", "yan etki", "OpenFDA"],
  openGraph: {
    title: "Drug Information — DoctoPal",
    description: "Comprehensive drug data: dosing, side effects, interactions — sourced from OpenFDA and TİTCK.",
    url: "https://doctopal.com/drug-info",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
