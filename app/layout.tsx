// © 2026 DoctoPal — All Rights Reserved
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans, DM_Mono, DM_Serif_Display } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/lib/auth-context";
import { FamilyProvider } from "@/lib/family-context";
import { DailyLogsProvider } from "@/lib/daily-logs-context";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LanguageProvider } from "@/components/layout/language-toggle";
import { AppToaster } from "@/components/layout/AppToaster";
import dynamic from "next/dynamic";
import { SmartBackButton } from "@/components/layout/SmartBackButton";

// Lazy load non-critical global components — reduces initial bundle
const CookieConsent = dynamic(() => import("@/components/layout/cookie-consent").then(m => m.CookieConsent));
const PWAInstallPrompt = dynamic(() => import("@/components/pwa/PWAInstallPrompt").then(m => m.PWAInstallPrompt));
const ServiceWorkerRegistration = dynamic(() => import("@/components/pwa/ServiceWorkerRegistration").then(m => m.ServiceWorkerRegistration));
const FeedbackWidget = dynamic(() => import("@/components/feedback/FeedbackWidget").then(m => m.FeedbackWidget));
const BottomNavbar = dynamic(() => import("@/components/layout/BottomNavbar").then(m => m.BottomNavbar));

// Auth-gated overlays — only loads for authenticated users (internal conditional)
const AuthGatedOverlays = dynamic(() => import("@/components/layout/AuthGatedOverlays").then(m => m.AuthGatedOverlays));
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
  // viewport-fit=cover lets the page extend under iOS notches / home
  // indicators. Components that need to dodge the cutouts use the
  // .safe-area-pt / .safe-area-pb / .safe-area-px helpers from globals.css.
  viewportFit: "cover",
  // Brand emerald-600. Mirrors manifest.json theme_color and the
  // placeholder icon background.
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "DoctoPal — Aileniz için yapay zeka destekli sağlık asistanı",
  description:
    "İlaç etkileşim kontrolü, SBAR klinik rapor, aile sağlık yönetimi. 7 gün ücretsiz deneyin.",
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
  // Browser tab + PWA install icons. The placeholder D-letter set
  // (icon.svg + generated PNGs) replaces the legacy phytotherapy
  // favicon.svg HERE for brand consistency, but the legacy file
  // stays in /public because Header / login / error / loading /
  // not-found / select-profile still consume it directly. iOS
  // requires a PNG for apple-touch-icon — SVGs are silently
  // ignored on home-screen install.
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
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
            <DailyLogsProvider>
              <Header />
              <AuthGatedOverlays />
              {/* F-MOBILE-001 fix-1: `overflow-x: hidden` would silently
                  promote the Y axis to `auto` per CSS Overflow Module
                  Level 3, which made <main> a scroll container and broke
                  every `position: sticky` element nested inside (mobile
                  hamburger + desktop ProfileSidebar both pinned to <main>
                  instead of viewport, then drifted off-screen during
                  document scroll). `overflow-x: clip` blocks horizontal
                  overflow without creating a scroll container, so sticky
                  pins to the document like the rest of the page. */}
              <main className="flex min-h-[calc(100vh-12rem)] flex-col overflow-x-clip">
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
              <AppToaster />
              <CookieConsent />
              <PWAInstallPrompt />
              <ServiceWorkerRegistration />
              <FeedbackWidget />
              <BottomNavbar />
            </DailyLogsProvider>
            </FamilyProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
