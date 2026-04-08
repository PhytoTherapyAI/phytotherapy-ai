// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Joyride = dynamic(() => import("react-joyride").then(m => m.Joyride) as any, { ssr: false }) as any;

const TOUR_KEY = "doctopal_hasSeenTour";

interface TourStep {
  target: string;
  content: string;
  skipBeacon?: boolean;
}

const STEPS_DESKTOP: TourStep[] = [
  {
    target: "#tour-nav-dashboard",
    content: "Burası ana sayfanız — günlük sağlık skorunuz, görevleriniz ve hızlı erişim kartlarınız burada.",
    skipBeacon: true,
  },
  {
    target: "#tour-nav-health-assistant",
    content: "AI sağlık asistanınız. Bitkisel takviyeler, ilaç etkileşimleri ve sağlık sorularınızı sorun.",
  },
  {
    target: "#tour-nav-interaction-checker",
    content: "İlaç-bitki etkileşim kontrolcüsü. Kullandığınız ilaçlarla güvenli bitkileri keşfedin.",
  },
  {
    target: "#tour-nav-calendar",
    content: "Sağlık takviminiz. İlaç ve takviye hatırlatıcılarınızı buradan yönetin.",
  },
  {
    target: "#tour-language-toggle",
    content: "Dil değiştirme butonu. Türkçe ve İngilizce arasında geçiş yapın.",
  },
  {
    target: "#tour-theme-toggle",
    content: "Tema değiştirme. Açık ve koyu mod arasında geçiş yapın.",
  },
  {
    target: "#tour-user-menu",
    content: "Profil menüsü. Ayarlarınıza, aile profillerinize ve hesabınıza buradan ulaşın.",
  },
];

const STEPS_MOBILE: TourStep[] = [
  {
    target: "#tour-nav-home",
    content: "Ana sayfa — günlük sağlık skorunuz ve hızlı erişim kartlarınız burada.",
    skipBeacon: true,
  },
  {
    target: "#tour-nav-medical-tools",
    content: "Tıbbi araçlar. Asistan, etkileşim kontrolcüsü, kan testi ve daha fazlası.",
  },
  {
    target: "#tour-nav-community",
    content: "Topluluk alanı. Sağlık içeriklerini keşfedin.",
  },
  {
    target: "#tour-nav-profile",
    content: "Profiliniz. Ayarlarınıza, sağlık verilerinize ve hesabınıza ulaşın.",
  },
];

export function DashboardTour() {
  const [run, setRun] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (seen) return;

    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);

    const timer = setTimeout(() => setRun(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEvent = (data: any) => {
    if (data.status === "finished" || data.status === "skipped") {
      localStorage.setItem(TOUR_KEY, "true");
      setRun(false);
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={isMobile ? STEPS_MOBILE : STEPS_DESKTOP}
      continuous
      showProgress
      buttons={["back", "close", "primary", "skip"]}
      onEvent={handleEvent}
      locale={{
        back: "Geri",
        close: "Kapat",
        last: "Bitir",
        next: "İleri",
        skip: "Atla",
      }}
      primaryColor="#3c7a52"
      zIndex={10000}
    />
  );
}
