import type { Metadata } from "next";
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
    "herbal medicine",
    "drug interaction",
    "evidence-based",
    "health assistant",
    "supplement safety",
    "blood test analysis",
    "integrative medicine",
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
              <DisclaimerBanner />
              <Header />
              <TrialBannerWrapper />
              <main className="flex min-h-[calc(100vh-12rem)] flex-col">{children}</main>
              <Footer />
              <MedicationUpdateDialog />
              <MicroCheckInWrapper />
              <CookieConsent />
              <PWAInstallPrompt />
              <ServiceWorkerRegistration />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
