import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, DM_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { MedicationUpdateDialog } from "@/components/layout/medication-update-dialog";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <DisclaimerBanner />
            <Header />
            <main className="min-h-[calc(100vh-12rem)]">{children}</main>
            <Footer />
            <MedicationUpdateDialog />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
