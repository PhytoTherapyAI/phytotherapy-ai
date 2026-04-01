// © 2026 Doctopal — All Rights Reserved
// Labor Illusion Loading State — makes AI feel like it's doing real scientific work

"use client";

import { useState, useEffect } from "react";
import { Shield, Search, Leaf, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

interface LoadingStep {
  icon: React.ElementType;
  text: { en: string; tr: string };
}

const LOADING_STEPS: LoadingStep[] = [
  { icon: Shield, text: { en: "Establishing secure connection...", tr: "Güvenli bağlantı kuruluyor..." } },
  { icon: Search, text: { en: "Scanning PubMed & Cochrane databases...", tr: "PubMed ve Cochrane veri tabanları taranıyor..." } },
  { icon: Leaf, text: { en: "Analyzing herbal active compounds...", tr: "Bitkisel etken maddeler analiz ediliyor..." } },
  { icon: AlertTriangle, text: { en: "Checking possible drug interactions...", tr: "Olası ilaç etkileşimleri kontrol ediliyor..." } },
  { icon: FileText, text: { en: "Compiling your evidence-based answer...", tr: "Kanıta dayalı yanıtınız derleniyor..." } },
];

const FILE_STEPS: LoadingStep[] = [
  { icon: Shield, text: { en: "Establishing secure connection...", tr: "Güvenli bağlantı kuruluyor..." } },
  { icon: Search, text: { en: "Extracting data from your document...", tr: "Belgenizden veriler çıkarılıyor..." } },
  { icon: Sparkles, text: { en: "AI vision analyzing the content...", tr: "AI görüşü içeriği analiz ediyor..." } },
  { icon: Leaf, text: { en: "Cross-referencing with medical databases...", tr: "Tıbbi veri tabanlarıyla karşılaştırılıyor..." } },
  { icon: FileText, text: { en: "Preparing your personalized analysis...", tr: "Kişisel analiziniz hazırlanıyor..." } },
];

interface AILoadingStateProps {
  hasFile?: boolean;
}

export function AILoadingState({ hasFile = false }: AILoadingStateProps) {
  const { lang } = useLang();
  const [stepIndex, setStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const steps = hasFile ? FILE_STEPS : LOADING_STEPS;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % steps.length);
        setIsVisible(true);
      }, 300);
    }, 1800);

    return () => clearInterval(interval);
  }, [steps.length]);

  const currentStep = steps[stepIndex];
  const Icon = currentStep.icon;

  return (
    <div className="space-y-3 py-2">
      {/* Dynamic micro-text with icon */}
      <div
        className={`flex items-center gap-2.5 transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lavender/10 dark:bg-lavender/20">
          <Icon className="h-3.5 w-3.5 text-lavender animate-pulse" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {currentStep.text[lang]}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1 pl-9">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= stepIndex
                ? "w-4 bg-lavender/60"
                : "w-1.5 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Skeleton shimmer — sage-tinted */}
      <div className="space-y-2 pl-9">
        <div className="h-3 w-full rounded-md bg-gradient-to-r from-sage/8 via-sage/15 to-sage/8 animate-pulse" />
        <div className="h-3 w-5/6 rounded-md bg-gradient-to-r from-sage/6 via-sage/12 to-sage/6 animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="h-3 w-3/4 rounded-md bg-gradient-to-r from-sage/4 via-sage/10 to-sage/4 animate-pulse" style={{ animationDelay: "300ms" }} />
        <div className="h-3 w-1/2 rounded-md bg-gradient-to-r from-sage/3 via-sage/8 to-sage/3 animate-pulse" style={{ animationDelay: "450ms" }} />
      </div>
    </div>
  );
}
