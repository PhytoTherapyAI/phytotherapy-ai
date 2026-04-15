// © 2026 DoctoPal — All Rights Reserved
// KVKK 2026/347 Sayılı İlke Kararı uyumu — SADECE açık rıza beyanları
// Aydınlatma metni için bkz. AydinlatmaStep.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Globe, FileText, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/components/layout/language-toggle";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

interface ConsentCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}

function ConsentCard({ icon, title, description, checked, onChange, id }: ConsentCardProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
        checked
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(c === true)}
        className="mt-0.5 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`${checked ? "text-primary" : "text-muted-foreground"}`}>{icon}</span>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </label>
  );
}

export function ConsentStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const tr = lang === "tr";

  return (
    <div className="space-y-4">
      {/* Intro — NOT privacy notice, just context for consent */}
      <div className="rounded-lg border bg-muted/30 p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tr
            ? "Aşağıdaki her bir rıza beyanı bağımsızdır. İstemediğiniz rızaları vermek zorunda değilsiniz; temel hizmetler (ilaç takibi, takvim) rıza olmadan da çalışır."
            : "Each consent below is independent. You are not required to give consents you do not want; basic features (medication tracking, calendar) work without consent."}
        </p>
      </div>

      {/* Consent 1 — AI Processing */}
      <ConsentCard
        id="consent_ai"
        icon={<Sparkles className="h-4 w-4" />}
        title={tr ? "AI İşleme Açık Rızası" : "AI Processing Explicit Consent"}
        description={
          tr
            ? "Sağlık verilerimin yapay zeka sistemi tarafından kişiselleştirilmiş bilgilendirme amacıyla işlenmesine açık rıza veriyorum."
            : "I give explicit consent for my health data to be processed by the AI system for personalized health information."
        }
        checked={data.consent_ai_processing}
        onChange={(v) => updateData({ consent_ai_processing: v })}
      />

      {/* Consent 2 — International Data Transfer */}
      <ConsentCard
        id="consent_transfer"
        icon={<Globe className="h-4 w-4" />}
        title={tr ? "Yurt Dışı Aktarım Açık Rızası" : "International Transfer Explicit Consent"}
        description={
          tr
            ? "Sağlık verilerimin anonimleştirilerek AB (İrlanda) ve ABD sunucularında işlenmesine açık rıza veriyorum."
            : "I give explicit consent for my anonymized health data to be processed on EU (Ireland) and US servers."
        }
        checked={data.consent_data_transfer}
        onChange={(v) => updateData({ consent_data_transfer: v })}
      />

      {/* Consent 3 — SBAR Report */}
      <ConsentCard
        id="consent_sbar"
        icon={<FileText className="h-4 w-4" />}
        title={tr ? "SBAR Raporu Açık Rızası" : "SBAR Report Explicit Consent"}
        description={
          tr
            ? "Sağlık verilerimin SBAR raporu oluşturulması amacıyla işlenmesine açık rıza veriyorum."
            : "I give explicit consent for my health data to be processed for SBAR report generation."
        }
        checked={data.consent_sbar_report}
        onChange={(v) => updateData({ consent_sbar_report: v })}
      />

      {/* Withdrawal note */}
      <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
        {tr
          ? "Rızanızı istediğiniz zaman Profil > Gizlilik Ayarları'ndan geri çekebilirsiniz. Rıza vermeden de temel hizmetleri (ilaç takibi, takvim) kullanabilirsiniz."
          : "You can withdraw your consent anytime from Profile > Privacy Settings. Basic features (medication tracking, calendar) are available without consent."}
      </p>

      {/* Medical disclaimer — REQUIRED */}
      <div className="border-t pt-4 mt-4">
        <div className="rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              {tr ? "Tıbbi Sorumluluk Reddi (Zorunlu)" : "Medical Disclaimer (Required)"}
            </p>
          </div>

          <label htmlFor="consent_medical" className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="consent_medical"
              checked={data.consent_agreed}
              onCheckedChange={(c) => updateData({ consent_agreed: c === true })}
              className="mt-0.5 shrink-0"
            />
            <span className="text-sm leading-relaxed">
              {tr ? (
                <>
                  <Link href="/terms" target="_blank" className="text-primary underline underline-offset-2">Kullanım Koşulları</Link>
                  {" "}ve{" "}
                  <Link href="/privacy" target="_blank" className="text-primary underline underline-offset-2">Gizlilik Politikası</Link>
                  &apos;nı okudum. DoctoPal&apos;ın <strong>profesyonel bir doktor tavsiyesi yerine geçmediğini</strong> anlıyorum. Acil durumlarda <strong>112</strong>&apos;yi arayacağımı kabul ediyorum.
                </>
              ) : (
                <>
                  I have read the{" "}
                  <Link href="/terms" target="_blank" className="text-primary underline underline-offset-2">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" target="_blank" className="text-primary underline underline-offset-2">Privacy Policy</Link>
                  . I understand DoctoPal <strong>does not replace professional medical advice</strong>. I agree to call <strong>112</strong> in emergencies.
                </>
              )}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
