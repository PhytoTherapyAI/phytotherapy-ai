// © 2026 Doctopal — All Rights Reserved
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, FileText } from "lucide-react";
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
    <div className="space-y-6">
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
                Doctopal bir <strong>sağlık ve karar destek aracıdır</strong>, tıbbi cihaz değildir.
                Herhangi bir hastalığı teşhis etmez, tedavi etmez, iyileştirmez veya önlemez.
              </p>
              <p>
                Tüm öneriler yayınlanmış bilimsel literatüre (PubMed, NIH, WHO) dayanır ve
                yalnızca <strong>bilgilendirme amaçlıdır</strong>.
              </p>
              <p>
                Herhangi bir ilaç, takviye veya bitkisel ürünü başlatmadan, durdurmadan veya değiştirmeden
                önce <strong>sağlık uzmanınıza danışmalısınız</strong>. Bu özellikle şu durumlarda önemlidir:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Reçeteli ilaç kullanıyorsanız</li>
                <li>Kronik sağlık sorunlarınız varsa</li>
                <li>Hamile, emziren veya hamilelik planlıyorsanız</li>
                <li>Ameliyat planlanıyorsa</li>
              </ul>
              <p>
                Doctopal ve geliştiricileri, bu hizmet tarafından sağlanan bilgilerin kullanımından
                kaynaklanan herhangi bir sağlık sonucundan <strong>sorumlu değildir</strong>.
              </p>
            </>
          ) : (
            <>
              <p>
                Doctopal is a <strong>wellness and decision-support tool</strong>, not a medical device.
                It does not diagnose, treat, cure, or prevent any disease.
              </p>
              <p>
                All recommendations are based on published scientific literature (PubMed, NIH, WHO) and
                are provided for <strong>informational purposes only</strong>.
              </p>
              <p>
                <strong>You must consult your healthcare provider</strong> before starting, stopping, or
                changing any medication, supplement, or herbal product. This is especially important if you:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Take prescription medications</li>
                <li>Have chronic health conditions</li>
                <li>Are pregnant, breastfeeding, or planning pregnancy</li>
                <li>Are scheduled for surgery</li>
              </ul>
              <p>
                Doctopal and its developers are <strong>not liable</strong> for any health outcomes
                resulting from the use of information provided by this service.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Data Privacy Summary */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{tx("onb.dataPrivacy", lang)}</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{tx("onb.dataIntro", lang)}</p>
          <ul className="ml-4 list-disc space-y-1">
            {tr ? (
              <>
                <li>Supabase sunucularında şifrelenmiş ve güvenli olarak saklanır</li>
                <li>Yalnızca sizin erişebileceğiniz — üçüncü taraflarla paylaşılmaz</li>
                <li>Profil ayarlarınızdan istediğiniz zaman silinebilir</li>
                <li>En fazla 2 yıl saklanır</li>
              </>
            ) : (
              <>
                <li>Encrypted and stored securely on Supabase servers</li>
                <li>Only accessible by you — never shared with third parties</li>
                <li>Deletable at any time via your profile settings</li>
                <li>Retained for a maximum of 2 years</li>
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

      {/* Consent Checkbox */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/10 p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="consent"
            checked={data.consent_agreed}
            onCheckedChange={(checked) => updateData({ consent_agreed: checked === true })}
            className="mt-1"
          />
          <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
            {tx("consent.agreementText", lang)}
          </Label>
        </div>
      </div>
    </div>
  );
}
