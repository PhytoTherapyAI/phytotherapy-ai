// © 2026 DoctoPal — All Rights Reserved
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "First Aid Guide — DoctoPal",
  description: "Quick step-by-step first aid for choking, burns, bleeding, fractures, CPR, and more. Always call 112 in life-threatening emergencies. İlk yardım rehberi.",
  keywords: ["first aid", "ilk yardım", "CPR", "kalp masajı", "emergency response", "burn treatment", "choking heimlich"],
  openGraph: {
    title: "First Aid Guide — DoctoPal",
    description: "Step-by-step first aid procedures for common emergencies. Reference, not a replacement for 112.",
    url: "https://doctopal.com/first-aid",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
