// © 2026 DoctoPal — All Rights Reserved
// KVKK 2026/347 Sayılı İlke Kararı uyumu — Aydınlatma metni (bilgilendirme, rıza DEĞİL)
"use client";

import { Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function AydinlatmaStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const tr = lang === "tr";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-xl border bg-primary/5 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">
            {tr ? "Aydınlatma Metni" : "Privacy Notice"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tr
              ? "KVKK Madde 10 kapsamında bilgilendirme"
              : "Information notice under KVKK Article 10"}
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="max-h-[420px] overflow-y-auto rounded-xl border bg-card p-5 text-sm leading-relaxed space-y-4">
        {tr ? (
          <>
            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Veri Sorumlusu</h4>
              <p className="text-muted-foreground">
                DoctoPal (doctopal.com)
              </p>
              <p className="text-muted-foreground mt-1.5">
                DoctoPal bir sağlık bilgilendirme aracıdır. <strong>Tıbbi cihaz değildir, teşhis koymaz, tedavi önermez.</strong>
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">İşlenen Veri Kategorileri</h4>
              <ul className="list-disc ml-5 text-muted-foreground space-y-0.5">
                <li>Kimlik bilgileri (ad, e-posta)</li>
                <li>Sağlık verileri (ilaçlar, alerjiler, kronik hastalıklar, semptomlar)</li>
                <li>Kullanım verileri (oturum bilgileri, tercihler)</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">İşleme Amaçları</h4>
              <ul className="list-disc ml-5 text-muted-foreground space-y-0.5">
                <li>Kişiselleştirilmiş sağlık bilgilendirmesi sunma</li>
                <li>İlaç-bitki etkileşim kontrolü</li>
                <li>SBAR raporu oluşturma</li>
                <li>Hizmet iyileştirme</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Yapay Zeka (AI) İşleme</h4>
              <p className="text-muted-foreground">
                Sağlık verileriniz yapay zeka (AI) sistemi tarafından işlenmektedir. AI analizi için verileriniz <strong>anonimleştirilerek</strong> (isim, e-posta, TC kimlik bilgileri çıkarılarak) yurt dışındaki sunuculara iletilmektedir.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Veri Aktarımı</h4>
              <ul className="list-disc ml-5 text-muted-foreground space-y-0.5">
                <li><strong>Supabase</strong> (İrlanda/AB) — veri depolama</li>
                <li><strong>Anthropic Claude API</strong> (ABD) — AI analiz (anonimleştirilmiş)</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">İlgili Kişi Hakları (KVKK Madde 11)</h4>
              <ul className="list-disc ml-5 text-muted-foreground space-y-0.5">
                <li>Verilerinize erişim talep etme</li>
                <li>Yanlış verilerin düzeltilmesini isteme</li>
                <li>Verilerinizin silinmesini talep etme</li>
                <li>İşlemenin kısıtlanmasını isteme</li>
                <li>Otomatik işleme dayalı kararlara itiraz etme</li>
                <li>Verilerinizi taşınabilir formatta alma</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Saklama Süresi</h4>
              <p className="text-muted-foreground">
                Hesabınız aktif olduğu sürece. Pasif hesaplar 2 yıl sonra anonimleştirilir. Silme talebi 30 gün içinde işlenir.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">İletişim</h4>
              <p className="text-muted-foreground">
                <a href="mailto:contact@doctopal.com" className="text-primary underline">contact@doctopal.com</a>
              </p>
              <p className="text-muted-foreground mt-1.5">
                <strong>Acil durumlarda 112&apos;yi arayın.</strong>
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Data Controller</h4>
              <p className="text-muted-foreground">DoctoPal (doctopal.com)</p>
              <p className="text-muted-foreground mt-1.5">
                DoctoPal is a health information tool. <strong>It is not a medical device and does not diagnose or treat conditions.</strong>
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Data Categories Processed</h4>
              <ul className="list-disc ml-5 text-muted-foreground space-y-0.5">
                <li>Identity data (name, email)</li>
                <li>Health data (medications, allergies, chronic conditions, symptoms)</li>
                <li>Usage data (session info, preferences)</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Processing Purposes</h4>
              <ul className="list-disc ml-5 text-muted-foreground space-y-0.5">
                <li>Personalized health information</li>
                <li>Drug-herb interaction checking</li>
                <li>SBAR report generation</li>
                <li>Service improvement</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Artificial Intelligence (AI) Processing</h4>
              <p className="text-muted-foreground">
                Your health data is processed by an artificial intelligence (AI) system. For AI analysis, your data is <strong>anonymized</strong> (name, email, ID removed) and transmitted to servers outside Turkey.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Data Transfers</h4>
              <ul className="list-disc ml-5 text-muted-foreground space-y-0.5">
                <li><strong>Supabase</strong> (Ireland/EU) — data storage</li>
                <li><strong>Anthropic Claude API</strong> (USA) — AI analysis (anonymized)</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Your Rights (KVKK Article 11)</h4>
              <ul className="list-disc ml-5 text-muted-foreground space-y-0.5">
                <li>Request access to your data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Request restriction of processing</li>
                <li>Object to automated decision-making</li>
                <li>Receive your data in portable format</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Retention</h4>
              <p className="text-muted-foreground">
                While your account is active. Inactive accounts anonymized after 2 years. Deletion requests processed within 30 days.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-foreground mb-1.5">Contact</h4>
              <p className="text-muted-foreground">
                <a href="mailto:contact@doctopal.com" className="text-primary underline">contact@doctopal.com</a>
              </p>
              <p className="text-muted-foreground mt-1.5">
                <strong>For emergencies, call 112.</strong>
              </p>
            </section>
          </>
        )}
      </div>

      {/* Acknowledgment button — NOT a consent, just "I have read" */}
      <div className="pt-2">
        <Button
          onClick={() => updateData({ aydinlatma_acknowledged: true })}
          disabled={data.aydinlatma_acknowledged}
          className="w-full h-11"
          variant={data.aydinlatma_acknowledged ? "outline" : "default"}
        >
          {data.aydinlatma_acknowledged ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              {tr ? "Okundu" : "Acknowledged"}
            </>
          ) : (
            tr ? "Okudum, Anladım" : "I have read and understood"
          )}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          {tr
            ? "Bu bir rıza beyanı değildir — sadece bilgilendirmeyi okuduğunuzu belirtir."
            : "This is not a consent declaration — it only indicates you have read the notice."}
        </p>
      </div>
    </div>
  );
}
