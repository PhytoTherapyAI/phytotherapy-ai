import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { AuthProvider } from "@/lib/auth-context";
import { MedicationUpdateDialog } from "@/components/layout/medication-update-dialog";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Phytotherapy.ai — Evidence-Based Integrative Medicine Assistant",
  description:
    "AI-powered health assistant bridging modern medicine and evidence-based phytotherapy. Get safe, personalized herbal recommendations with scientific references.",
  keywords: [
    "phytotherapy",
    "herbal medicine",
    "drug interaction",
    "evidence-based",
    "health assistant",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <DisclaimerBanner />
          <Header />
          <main className="min-h-[calc(100vh-12rem)]">{children}</main>
          <Footer />
          <MedicationUpdateDialog />
        </AuthProvider>
      </body>
    </html>
  );
}
