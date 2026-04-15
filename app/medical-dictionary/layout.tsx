// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Dictionary — DoctoPal",
  description: "Search 10,000+ medical terms with plain-language definitions, pronunciations, and related conditions. Tıbbi sözlük: anlaşılır tıp terimleri.",
  keywords: ["medical dictionary", "tıbbi sözlük", "medical terms", "tıp terimleri", "health glossary"],
  openGraph: {
    title: "Medical Dictionary — DoctoPal",
    description: "10,000+ medical terms explained in plain language with context.",
    url: "https://doctopal.com/medical-dictionary",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
