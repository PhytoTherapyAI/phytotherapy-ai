// © 2026 DoctoPal — All Rights Reserved
// KVKK 2026/347 — Per-consent-type explicit consent popup
// Battaniye rıza yasağı: her rıza için ayrı metin gösterilmeli
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check, AlertTriangle, Loader2 } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

type ConsentType = "consent_ai_processing" | "consent_data_transfer" | "consent_sbar_report";

interface ConsentPopupProps {
  open: boolean;
  consentType: ConsentType;
  onAccept: () => Promise<void>;
  onCancel: () => void;
}

interface ConsentText {
  title: string;
  icon: string;
  intro: string;
  details: string[];
  warning: string;
  acceptButton: string;
  cancelButton: string;
}

const CONSENT_TEXTS: Record<ConsentType, { tr: ConsentText; en: ConsentText }> = {
  consent_ai_processing: {
    tr: {
      title: "AI İşleme Açık Rızası",
      icon: "🤖",
      intro: "DoctoPal yapay zeka sistemi, sağlık verilerinizi kişiselleştirilmiş bilgilendirme sunmak amacıyla işleyecektir.",
      details: [
        "İşlenecek veri: ilaç listeniz, alerjileriniz, kronik hastalıklarınız, semptomlarınız, yaş aralığınız, cinsiyetiniz",
        "İşleme amacı: ilaç-bitki etkileşim kontrolü, kişiselleştirilmiş sağlık bilgilendirmesi, soru-cevap asistanı",
        "Hukuki dayanak: KVKK Md.6 (özel nitelikli veri için açık rıza)",
        "AI sağlayıcısı: Anthropic Claude API (ABD)",
        "Veriniz AI'a gönderilmeden önce isim, e-posta, TC kimlik gibi kimlik bilgileri çıkarılır (anonimleştirme)",
      ],
      warning: "Bu rızayı vermezseniz AI sağlık asistanı ve etkileşim kontrolü çalışmayacaktır. Diğer özellikler (ilaç takibi, takvim, aile profili) etkilenmez.",
      acceptButton: "Okudum, açık rıza veriyorum",
      cancelButton: "Vazgeç",
    },
    en: {
      title: "AI Processing Explicit Consent",
      icon: "🤖",
      intro: "DoctoPal AI system will process your health data to provide personalized health information.",
      details: [
        "Data to be processed: medication list, allergies, chronic conditions, symptoms, age range, gender",
        "Purpose: drug-herb interaction check, personalized health information, Q&A assistant",
        "Legal basis: KVKK Art.6 (explicit consent for special category data)",
        "AI provider: Anthropic Claude API (USA)",
        "Identity information (name, email, ID) is removed before sending to AI (anonymization)",
      ],
      warning: "Without this consent, AI health assistant and interaction check will not work. Other features (medication tracking, calendar, family profile) are unaffected.",
      acceptButton: "I have read and give explicit consent",
      cancelButton: "Cancel",
    },
  },
  consent_data_transfer: {
    tr: {
      title: "Yurt Dışı Aktarım Açık Rızası",
      icon: "🌍",
      intro: "Sağlık verileriniz, hizmet sağlayıcılarımız aracılığıyla AB ve ABD sunucularında işlenecektir.",
      details: [
        "Veri depolama: Supabase (İrlanda / AB) — KVKK Md.9 kapsamında SCC ile aktarım",
        "AI işleme: Anthropic Claude API (ABD) — anonimleştirilmiş veri ile",
        "Aktarılan veri kategorisi: sağlık verisi (ilaç, alerji, hastalık, semptom)",
        "Hukuki dayanak: KVKK Md.9 + Md.6 (yurt dışı aktarım için açık rıza)",
        "ABD ve AB'de KVKK ile eşdeğer veri koruma standartları (GDPR) uygulanmaktadır",
      ],
      warning: "Bu rızayı vermezseniz AI özellikleri kullanılamaz çünkü AI sağlayıcımız ABD'dedir. Verileriniz yurt dışına çıkarılmaz, ancak AI özellikleri devre dışı kalır.",
      acceptButton: "Okudum, açık rıza veriyorum",
      cancelButton: "Vazgeç",
    },
    en: {
      title: "International Data Transfer Explicit Consent",
      icon: "🌍",
      intro: "Your health data will be processed on EU and US servers via our service providers.",
      details: [
        "Data storage: Supabase (Ireland / EU) — transfer under KVKK Art.9 with SCC",
        "AI processing: Anthropic Claude API (USA) — with anonymized data",
        "Transferred data category: health data (medications, allergies, conditions, symptoms)",
        "Legal basis: KVKK Art.9 + Art.6 (explicit consent for international transfer)",
        "USA and EU apply data protection standards equivalent to KVKK (GDPR)",
      ],
      warning: "Without this consent, AI features cannot be used as our AI provider is in the USA. Your data won't be transferred abroad, but AI features will be disabled.",
      acceptButton: "I have read and give explicit consent",
      cancelButton: "Cancel",
    },
  },
  consent_sbar_report: {
    tr: {
      title: "SBAR Raporu Açık Rızası",
      icon: "📄",
      intro: "DoctoPal, doktorunuzla paylaşabilmeniz için sağlık verilerinizden SBAR formatında klinik özet raporu oluşturacaktır.",
      details: [
        "İşlenecek veri: tüm sağlık profiliniz (ilaçlar, alerjiler, hastalıklar, son tahliller, semptomlar)",
        "İşleme amacı: SBAR (Situation-Background-Assessment-Recommendation) formatında PDF rapor oluşturma",
        "Hukuki dayanak: KVKK Md.6 (özel nitelikli veri için açık rıza)",
        "Rapor lokal olarak oluşturulur, üçüncü taraflarla paylaşılmaz (sadece kullanıcı PDF olarak indirebilir)",
        "Doktorunuzla paylaşma kararı tamamen size aittir",
      ],
      warning: "Bu rızayı vermezseniz SBAR PDF raporu oluşturulamaz. AI sağlık asistanı ve diğer özellikler etkilenmez.",
      acceptButton: "Okudum, açık rıza veriyorum",
      cancelButton: "Vazgeç",
    },
    en: {
      title: "SBAR Report Explicit Consent",
      icon: "📄",
      intro: "DoctoPal will generate clinical summary reports in SBAR format from your health data so you can share them with your doctor.",
      details: [
        "Data to be processed: your full health profile (medications, allergies, conditions, recent tests, symptoms)",
        "Purpose: generating PDF report in SBAR (Situation-Background-Assessment-Recommendation) format",
        "Legal basis: KVKK Art.6 (explicit consent for special category data)",
        "Report is generated locally, not shared with third parties (user can download as PDF)",
        "Decision to share with your doctor is entirely yours",
      ],
      warning: "Without this consent, SBAR PDF report cannot be generated. AI health assistant and other features are unaffected.",
      acceptButton: "I have read and give explicit consent",
      cancelButton: "Cancel",
    },
  },
};

export function ConsentPopup({ open, consentType, onAccept, onCancel }: ConsentPopupProps) {
  const { lang } = useLang();
  const tr = lang === "tr";
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const text = CONSENT_TEXTS[consentType][tr ? "tr" : "en"];

  // Reset + check if content fits without scrolling (short text = button enabled immediately)
  useEffect(() => {
    if (!open) return;

    // Reset on each open/type change
    setHasScrolledToBottom(false);

    // After render, check if scroll is needed
    const timer = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollHeight <= el.clientHeight + 5) {
        setHasScrolledToBottom(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [open, consentType]);

  if (!open) return null;

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
      setHasScrolledToBottom(true);
    }
  }

  async function handleAccept() {
    setIsLoading(true);
    try {
      await onAccept();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-background border-2 border-primary/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{text.icon}</span>
            <h2 className="text-xl font-semibold text-foreground">{text.title}</h2>
          </div>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4" onScroll={handleScroll}>
          <p className="text-foreground leading-relaxed">{text.intro}</p>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              {tr ? "Detaylar:" : "Details:"}
            </h3>
            <ul className="space-y-2">
              {text.details.map((detail, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-200">{text.warning}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic pt-2 border-t">
            {tr
              ? "Bu açık rızayı KVKK Md.11 uyarınca istediğiniz zaman geri çekebilirsiniz. Geri çekme geleceğe yönelik etki doğurur, geçmiş işlemleri etkilemez."
              : "You can withdraw this explicit consent at any time under KVKK Art.11. Withdrawal takes effect prospectively and does not affect past processing."}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-muted/30 space-y-2">
          {!hasScrolledToBottom && (
            <p className="text-xs text-center text-muted-foreground animate-pulse">
              {tr ? "↓ Devam etmek için metni sonuna kadar okuyun" : "↓ Scroll to read the full text to continue"}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-foreground font-medium disabled:opacity-50 transition-colors"
            >
              {text.cancelButton}
            </button>
            <button
              onClick={handleAccept}
              disabled={!hasScrolledToBottom || isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isLoading ? (tr ? "Kaydediliyor..." : "Saving...") : text.acceptButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
