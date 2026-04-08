// © 2026 DoctoPal — All Rights Reserved
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans, DM_Mono, DM_Serif_Display } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { AuthProvider } from "@/lib/auth-context";
import { FamilyProvider } from "@/lib/family-context";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LanguageProvider } from "@/components/layout/language-toggle";
import dynamic from "next/dynamic";
import { SmartBackButton } from "@/components/layout/SmartBackButton";

// Lazy load non-critical global components — reduces initial bundle
const MedicationUpdateDialog = dynamic(() => import("@/components/layout/medication-update-dialog").then(m => m.MedicationUpdateDialog));
const CookieConsent = dynamic(() => import("@/components/layout/cookie-consent").then(m => m.CookieConsent));
const MicroCheckInWrapper = dynamic(() => import("@/components/dashboard/MicroCheckInWrapper").then(m => m.MicroCheckInWrapper));
const TrialBannerWrapper = dynamic(() => import("@/components/premium/TrialBannerWrapper").then(m => m.TrialBannerWrapper));
const PWAInstallPrompt = dynamic(() => import("@/components/pwa/PWAInstallPrompt").then(m => m.PWAInstallPrompt));
const ServiceWorkerRegistration = dynamic(() => import("@/components/pwa/ServiceWorkerRegistration").then(m => m.ServiceWorkerRegistration));
const CriticalAlertModal = dynamic(() => import("@/components/emergency/CriticalAlertModal").then(m => m.CriticalAlertModal));
const FeedbackWidget = dynamic(() => import("@/components/feedback/FeedbackWidget").then(m => m.FeedbackWidget));
const BottomNavbar = dynamic(() => import("@/components/layout/BottomNavbar").then(m => m.BottomNavbar));
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3c7a52",
};

export const metadata: Metadata = {
  title: "DoctoPal — Evidence Meets Nature. AI Meets You.",
  description:
    "DoctoPal bridges modern medicine and natural healing — drug interactions, phytotherapy protocols, lab analysis, and 166+ AI-powered health tools, all verified by science.",
  keywords: [
    "AI health assistant",
    "drug interactions",
    "phytotherapy",
    "evidence-based medicine",
    "herbal medicine",
    "lab analysis",
    "health tools",
    "fitoterapi",
    "ilaç etkileşimi",
    "sağlık asistanı",
    "integrative medicine",
    "bütünleştirici tıp",
    "supplement safety",
    "blood test analysis",
  ],
  metadataBase: new URL("https://doctopal.com"),
  openGraph: {
    title: "DoctoPal — Evidence Meets Nature. AI Meets You.",
    description: "DoctoPal bridges modern medicine and natural healing — drug interactions, phytotherapy protocols, lab analysis, and 166+ AI-powered health tools, all verified by science.",
    url: "https://doctopal.com",
    siteName: "DoctoPal",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "DoctoPal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoctoPal — Evidence Meets Nature. AI Meets You.",
    description: "DoctoPal bridges modern medicine and natural healing. 166+ AI-powered health tools verified by science.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DoctoPal",
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
        suppressHydrationWarning
        className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} ${dmSerif.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
            <FamilyProvider>
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
              <BottomNavbar />
            </FamilyProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
