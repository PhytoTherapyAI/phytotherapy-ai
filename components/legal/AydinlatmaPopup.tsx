// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.10 Aydınlatma Metni — pop-up formatında
// Bu bilgilendirmedir, rıza DEĞİLDİR. Checkbox YOK.
"use client";

import { X, ShieldCheck } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

interface AydinlatmaPopupProps {
  open: boolean;
  onClose: () => void;
}

export function AydinlatmaPopup({ open, onClose }: AydinlatmaPopupProps) {
  const { lang } = useLang();
  const tr = lang === "tr";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-background border-2 border-primary/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {tr ? "Aydınlatma Metni (KVKK Md.10)" : "Privacy Notice (KVKK Art.10)"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-foreground">
          <section>
            <h3 className="font-bold mb-1">{tr ? "1. Veri Sorumlusu" : "1. Data Controller"}</h3>
            <p className="text-muted-foreground">
              {tr
                ? "DoctoPal (şirket kurulum aşamasındadır). Web: doctopal.com · İletişim: info@doctopal.com"
                : "DoctoPal (company registration in progress). Web: doctopal.com · Contact: info@doctopal.com"}
            </p>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "2. İşlenen Veri Kategorileri" : "2. Data Categories"}</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{tr ? "Kimlik: ad, e-posta" : "Identity: name, email"}</li>
              <li>{tr ? "Sağlık (özel nitelikli): ilaçlar, alerjiler, kronik hastalıklar, semptomlar, yaş, cinsiyet, kan grubu, tahlil sonuçları, aşılar, sigara/alkol" : "Health (special category): medications, allergies, chronic conditions, symptoms, age, gender, blood type, test results, vaccines, smoking/alcohol"}</li>
              <li>{tr ? "İletişim: telefon (opsiyonel)" : "Contact: phone (optional)"}</li>
              <li>{tr ? "İşlem: AI sohbet geçmişi, etkileşim sonuçları, SBAR raporu" : "Transaction: AI chat history, interaction results, SBAR report"}</li>
              <li>{tr ? "Teknik: IP adresi, tarayıcı bilgisi (güvenlik)" : "Technical: IP address, browser info (security)"}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "3. İşleme Amaçları" : "3. Purposes"}</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{tr ? "AI destekli kişiselleştirilmiş sağlık bilgilendirme" : "AI-powered personalized health information"}</li>
              <li>{tr ? "Supabase (İrlanda) sunucularında güvenli depolama" : "Secure storage on Supabase (Ireland) servers"}</li>
              <li>{tr ? "SBAR formatında doktor ön raporu oluşturma" : "SBAR format pre-visit report generation"}</li>
              <li>{tr ? "İlaç-bitki etkileşim kontrolü" : "Drug-herb interaction checking"}</li>
              <li>{tr ? "İlaç takibi, takvim, günlük sağlık kaydı" : "Medication tracking, calendar, daily health logs"}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "4. Aktarılan Taraflar" : "4. Transfer Recipients"}</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Supabase Inc.</strong> ({tr ? "İrlanda" : "Ireland"}) — {tr ? "Veri depolama. SCC imzalı." : "Data storage. SCC signed."}</li>
              <li><strong>Anthropic PBC</strong> ({tr ? "ABD" : "USA"}) — {tr ? "AI analizi. Anonimleştirilmiş veri. SCC imzalı." : "AI analysis. Anonymized data. SCC signed."}</li>
              <li><strong>Google LLC</strong> ({tr ? "ABD" : "USA"}) — {tr ? "Gemini API (text embedding). Anonimleştirilmiş." : "Gemini API (text embedding). Anonymized."}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "5. Haklarınız (KVKK Md.11)" : "5. Your Rights (KVKK Art.11)"}</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{tr ? "Verilerinizin işlenip işlenmediğini öğrenme" : "Learn whether your data is processed"}</li>
              <li>{tr ? "Eksik/yanlış verilerin düzeltilmesini isteme" : "Request correction of inaccurate data"}</li>
              <li>{tr ? "Silme veya yok etme talep etme" : "Request deletion or destruction"}</li>
              <li>{tr ? "Otomatik analiz sonuçlarına itiraz etme" : "Object to automated decision outcomes"}</li>
              <li>{tr ? "Zararın giderilmesini talep etme" : "Claim compensation for damages"}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "6. Saklama Süresi" : "6. Retention"}</h3>
            <p className="text-muted-foreground">
              {tr
                ? "Hesap aktif olduğu sürece saklanır. Silme talebinden sonra 30 gün içinde geri döndürülemez şekilde silinir."
                : "Stored while account is active. Irreversibly deleted within 30 days of deletion request."}
            </p>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "7. Hukuki Dayanak" : "7. Legal Basis"}</h3>
            <p className="text-muted-foreground">
              {tr
                ? "KVKK Md.6 — Sağlık verisi özel nitelikli kişisel veridir. İşlenmesi yalnızca açık rıza ile mümkündür."
                : "KVKK Art.6 — Health data is special category personal data. Processing requires explicit consent."}
            </p>
          </section>
        </div>

        {/* Footer — bilgilendirme, rıza DEĞİL */}
        <div className="border-t p-4 bg-muted/30">
          <p className="text-[11px] text-muted-foreground text-center mb-3">
            {tr
              ? "Bu metin KVKK Md.10 kapsamında aydınlatma yükümlülüğüdür. Açık rıza ayrı olarak alınır."
              : "This notice fulfills the KVKK Art.10 disclosure obligation. Explicit consent is collected separately."}
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {tr ? "Okudum, Kapat" : "I've Read This, Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
