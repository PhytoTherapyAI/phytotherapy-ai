// © 2026 Phytotherapy.ai — All Rights Reserved
import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans, DM_Mono, DM_Serif_Display } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LanguageProvider } from "@/components/layout/language-toggle";
import { MedicationUpdateDialog } from "@/components/layout/medication-update-dialog";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { MicroCheckInWrapper } from "@/components/dashboard/MicroCheckInWrapper";
import { TrialBannerWrapper } from "@/components/premium/TrialBannerWrapper";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { CriticalAlertModal } from "@/components/emergency/CriticalAlertModal";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { SmartBackButton } from "@/components/layout/SmartBackButton";
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

const dmSerif = DM_Serif_Display({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "Phytotherapy.ai — Evidence-Based Integrative Medicine Assistant",
  description:
    "AI-powered health assistant bridging modern medicine and evidence-based phytotherapy. Get safe, personalized herbal recommendations with scientific references.",
  keywords: [
    "phytotherapy",
    "fitoterapi",
    "herbal medicine",
    "bitkisel tedavi",
    "bitkisel ilaçlar",
    "drug interaction checker",
    "ilaç etkileşimi kontrolü",
    "evidence-based",
    "health assistant",
    "sağlık asistanı",
    "supplement safety",
    "blood test analysis",
    "integrative medicine",
    "bütünleştirici tıp",
  ],
  metadataBase: new URL("https://phytotherapy.ai"),
  openGraph: {
    title: "Phytotherapy.ai — Evidence-Based Integrative Medicine Assistant",
    description: "AI-powered health companion bridging modern medicine and evidence-based phytotherapy. Check drug-herb interactions, analyze blood tests, and get personalized health guidance.",
    url: "https://phytotherapy.ai",
    siteName: "Phytotherapy.ai",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phytotherapy.ai",
    description: "The world's first evidence-based integrative medicine assistant.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Phytotherapy.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} ${dmSerif.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Header />
              <TrialBannerWrapper />
              <main className="flex min-h-[calc(100vh-12rem)] flex-col overflow-x-hidden">
                <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
                  <SmartBackButton />
                </div>
                <Suspense fallback={
                  <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                }>
                  {children}
                </Suspense>
              </main>
              <Footer />
              <MedicationUpdateDialog />
              <MicroCheckInWrapper />
              <CookieConsent />
              <PWAInstallPrompt />
              <ServiceWorkerRegistration />
              <CriticalAlertModal />
              <FeedbackWidget />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
