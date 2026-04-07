// © 2026 Doctopal — All Rights Reserved
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function ConsentStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const tr = lang === "tr";

  return (
    <div className="space-y-5">
      {/* Medical Disclaimer */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{tx("onb.disclaimerTitle", lang)}</h3>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          {tr ? (
            <>
              <p>
                DoctoPal bir <strong>sağlık ve karar destek aracıdır</strong>, <strong>tıbbi cihaz değildir</strong>.
                Herhangi bir hastalığı teşhis etmez, tedavi etmez veya önlemez.
              </p>
              {/* 112 Emergency Warning */}
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-400 font-medium">
                  <strong>Acil durumlarda kullanılamaz.</strong> Beklenmedik, şiddetli veya hayati tehlike taşıyan
                  bir sağlık sorununuz varsa lütfen hemen <strong>112</strong>&apos;yi arayın veya en yakın acil servise başvurun.
                </p>
              </div>
              <p>
                Önerilerimiz <strong>bilimsel literatüre</strong> (PubMed, NIH) dayanır ve yalnızca <strong>bilgilendirme amaçlıdır</strong>.
                Özellikle şu durumlarda herhangi bir öneriyi uygulamadan önce mutlaka <strong>doktorunuza danışmalısınız</strong>:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Reçeteli ilaç</strong> kullanıyorsanız</li>
                <li><strong>Hamilelik veya emzirme</strong> dönemindeyseniz</li>
                <li>Kronik bir rahatsızlığınız veya planlanan <strong>ameliyatınız</strong> varsa</li>
              </ul>
              <p className="text-xs">
                DoctoPal ve geliştiricileri, bu hizmet tarafından sağlanan bilgilerin kullanımından
                kaynaklanan herhangi bir sağlık sonucundan sorumlu değildir.
              </p>
            </>
          ) : (
            <>
              <p>
                DoctoPal is a <strong>health and decision-support tool</strong>, <strong>not a medical device</strong>.
                It does not diagnose, treat, or prevent any disease.
              </p>
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-400 font-medium">
                  <strong>Not for emergencies.</strong> If you experience unexpected, severe, or life-threatening
                  symptoms, call <strong>112</strong> (or your local emergency number) immediately.
                </p>
              </div>
              <p>
                Our recommendations are based on <strong>scientific literature</strong> (PubMed, NIH) and are for
                <strong> informational purposes only</strong>. You <strong>must consult your doctor</strong> before
                acting on any recommendation, especially if you:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Take <strong>prescription medications</strong></li>
                <li>Are <strong>pregnant or breastfeeding</strong></li>
                <li>Have chronic conditions or a <strong>planned surgery</strong></li>
              </ul>
              <p className="text-xs">
                DoctoPal and its developers are not liable for any health outcomes resulting from information provided.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Data Privacy & KVKK */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">
            {tr ? "Veri Gizliliği ve KVKK" : "Data Privacy & KVKK"}
          </h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {tr
              ? <>Sağlık verileriniz <strong>&quot;Özel Nitelikli Kişisel Veri&quot;</strong> kapsamında en üst düzeyde korunur:</>
              : <>Your health data is protected at the highest level as <strong>&quot;Special Category Personal Data&quot;</strong>:</>
            }
          </p>
          <ul className="ml-4 list-disc space-y-1">
            {tr ? (
              <>
                <li><strong>Uçtan Uca Şifreleme:</strong> Verileriniz Supabase sunucularında şifrelenerek saklanır</li>
                <li><strong>Tam Gizlilik:</strong> Kimliğinizle eşleştirilmiş hiçbir veriniz 3. şahıslarla paylaşılmaz</li>
                <li><strong>Kontrol Sizde:</strong> İstediğiniz an verilerinizi silebilirsiniz (Maks. 2 yıl saklanır)</li>
              </>
            ) : (
              <>
                <li><strong>End-to-end encryption:</strong> Your data is encrypted on Supabase servers</li>
                <li><strong>Full privacy:</strong> Your identity-linked data is never shared with third parties</li>
                <li><strong>You&apos;re in control:</strong> Delete your data anytime (max retention: 2 years)</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Legal Links */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <Link href="/terms" target="_blank" className="underline transition-colors hover:text-foreground">
          {tx("onb.termsLink", lang)}
        </Link>
        <span>·</span>
        <Link href="/privacy" target="_blank" className="underline transition-colors hover:text-foreground">
          {tx("onb.privacyLink", lang)}
        </Link>
      </div>

      {/* Consent Checkbox — KVKK Açık Rıza */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/10 p-4">
        <label htmlFor="consent" className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            id="consent"
            checked={data.consent_agreed}
            onCheckedChange={(checked) => updateData({ consent_agreed: checked === true })}
            className="mt-0.5 shrink-0"
          />
          <span className="text-sm leading-relaxed">
            {tr ? (
              <>
                <Link href="/terms" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">Kullanım Koşulları</Link> ve{" "}
                <Link href="/privacy" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">Gizlilik Politikası</Link>&apos;nı okudum.
                {" "}DoctoPal&apos;ın <strong>profesyonel bir doktor tavsiyesi yerine geçmediğini</strong> anlıyorum;
                {" "}sağlık verilerimin <strong>KVKK kapsamında işlenmesine açık rıza</strong> gösteriyorum.
              </>
            ) : (
              <>
                I have read the{" "}
                <Link href="/terms" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">Terms of Service</Link> and{" "}
                <Link href="/privacy" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">Privacy Policy</Link>.
                {" "}I understand DoctoPal <strong>does not replace professional medical advice</strong>;
                {" "}I give <strong>explicit consent</strong> for my health data to be processed under KVKK regulations.
              </>
            )}
          </span>
        </label>
      </div>
    </div>
  );
}
