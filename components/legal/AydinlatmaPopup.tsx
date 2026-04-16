// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.10 Aydınlatma Metni v2.0 — pop-up formatında
// Bu bilgilendirmedir, rıza DEĞİLDİR. Checkbox YOK.
"use client";

import { X, ShieldCheck, AlertTriangle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

interface AydinlatmaPopupProps {
  open: boolean;
  /** "Okudum, Kapat" butonu → audit kaydeder */
  onAcknowledge: () => void;
  /** X butonu / Escape → sadece kapatır, audit YOK */
  onClose: () => void;
  /** true ise X butonu gizlenir, kullanıcı "Okudum" demek ZORUNDA */
  forceAcknowledge?: boolean;
}

export function AydinlatmaPopup({ open, onAcknowledge, onClose, forceAcknowledge }: AydinlatmaPopupProps) {
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
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {tr ? "Aydınlatma Metni (KVKK Md.10)" : "Privacy Notice (KVKK Art.10)"}
              </h2>
              <p className="text-xs text-muted-foreground">v2.0 — {tr ? "Nisan 2026" : "April 2026"}</p>
            </div>
          </div>
          {!forceAcknowledge && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Scrollable content — compact version of /aydinlatma */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-foreground">

          <section>
            <h3 className="font-bold mb-1">{tr ? "1. Veri Sorumlusu" : "1. Data Controller"}</h3>
            <p className="text-muted-foreground">
              {tr
                ? "DoctoPal — Kurucu Ortaklar: Taha Ahmet Sıbıç, İpek Özen. Şirket tescil süreci devam etmektedir; VERBİS kaydı tescil sonrası yapılacaktır. Web: doctopal.com · İletişim: info@doctopal.com"
                : "DoctoPal — Co-founders: Taha Ahmet Sıbıç, İpek Özen. Company registration in progress; VERBIS registration after incorporation. Web: doctopal.com · Contact: info@doctopal.com"}
            </p>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "2. İşlenen Veri Kategorileri" : "2. Data Categories"}</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{tr ? "Kimlik: ad, e-posta" : "Identity: name, email"}</li>
              <li>{tr ? "Sağlık (özel nitelikli): ilaçlar, alerjiler, kronik hastalıklar, semptomlar, yaş, cinsiyet, kan grubu, aşılar, sigara/alkol, aile sağlık geçmişi, cerrahi, gebelik/emzirme" : "Health (special): medications, allergies, chronic conditions, symptoms, age, gender, blood type, vaccines, smoking/alcohol, family history, surgical history, pregnancy/breastfeeding"}</li>
              <li>{tr ? "Tıbbi görüntü/belge: kan tahlili PDF, radyoloji, ilaç fotoğrafı, prospektüs" : "Medical images/docs: blood test PDF, radiology, medication photos, prescribing info"}</li>
              <li>{tr ? "İletişim: telefon (opsiyonel)" : "Contact: phone (optional)"}</li>
              <li>{tr ? "İşlem: AI sohbet, etkileşim sonuçları, SBAR, rıza kayıtları" : "Transaction: AI chat, interaction results, SBAR, consent records"}</li>
              <li>{tr ? "Teknik: IP, tarayıcı (güvenlik)" : "Technical: IP, browser (security)"}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "3. İşleme Amaçları" : "3. Purposes"}</h3>
            <p className="text-muted-foreground text-xs font-medium mb-1">{tr ? "Hukuki dayanak: KVKK Md.6 açık rıza" : "Legal basis: KVKK Art.6 explicit consent"}</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{tr ? "AI sağlık bilgilendirme + etkileşim kontrolü" : "AI health info + interaction checking"}</li>
              <li>{tr ? "Tıbbi görüntü/belge analizi" : "Medical image/document analysis"}</li>
              <li>{tr ? "SBAR doktor raporu" : "SBAR doctor report"}</li>
              <li>{tr ? "İlaç takibi, takvim, sağlık kaydı" : "Medication tracking, calendar, health logs"}</li>
              <li>{tr ? "Semantic arama" : "Semantic search"}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "4. Veri Toplama" : "4. Collection Method"}</h3>
            <p className="text-muted-foreground">
              {tr
                ? "Veriler kullanıcı tarafından formlar aracılığıyla doğrudan girilir ve etkileşim sırasında otomatik toplanır. Harici kaynaklardan sağlık verisi toplanmaz."
                : "Data is entered directly by the user via forms and collected automatically during interaction. No health data is collected from external sources."}
            </p>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "5. Aktarılan Taraflar" : "5. Transfer Recipients"}</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong>Supabase Inc.</strong> ({tr ? "İrlanda/AB" : "Ireland/EU"}) — {tr ? "Veri depolama. Dayanak: açık rıza (Md.9/1)" : "Data storage. Basis: explicit consent (Art.9/1)"}</li>
              <li><strong>Anthropic PBC</strong> ({tr ? "ABD" : "USA"}) — {tr ? "AI analiz (text + görsel). Anonimleştirilmiş. Dayanak: açık rıza" : "AI analysis (text + visual). Anonymized. Basis: explicit consent"}</li>
              <li><strong>Google LLC</strong> ({tr ? "ABD" : "USA"}) — {tr ? "Gemini embedding (semantic arama). Kimlik içermeyen metin. Dayanak: açık rıza" : "Gemini embedding (semantic search). No identity data. Basis: explicit consent"}</li>
            </ul>
            <div className="mt-2 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10 p-2.5 text-xs text-amber-900 dark:text-amber-200 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{tr ? "SCC imzalama süreci şirket tescili sonrası yürütülecektir. Şu an açık rıza tek hukuki dayanak." : "SCC signing will be conducted after company registration. Currently explicit consent is the sole legal basis."}</span>
            </div>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "6. Saklama Süreleri" : "6. Retention"}</h3>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>{tr ? "Kimlik/Sağlık/İletişim: Hesap aktif olduğu sürece" : "Identity/Health/Contact: While account active"}</p>
              <p>{tr ? "AI sohbet: 12 ay · Görüntü/belge: 90 gün · Audit log: 5 yıl · IP/erişim: 2 yıl" : "AI chat: 12 months · Images/docs: 90 days · Audit log: 5 years · IP/access: 2 years"}</p>
              <p>{tr ? "Hesap silme: 30 gün içinde kalıcı silme (audit log'lar anonimleştirilerek saklanır)" : "Account deletion: permanent within 30 days (audit logs retained anonymized)"}</p>
            </div>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "7. Haklarınız (KVKK Md.11 — 9 Hak)" : "7. Your Rights (KVKK Art.11 — 9 Rights)"}</h3>
            <ol className="list-decimal pl-5 space-y-0.5 text-muted-foreground text-xs">
              <li>{tr ? "Verilerinizin işlenip işlenmediğini öğrenme" : "Learn whether data is processed"}</li>
              <li>{tr ? "İşlenmişse bilgi talep etme" : "Request information if processed"}</li>
              <li>{tr ? "İşlenme amacını ve uygunluğunu öğrenme" : "Learn purpose and compliance"}</li>
              <li>{tr ? "Aktarılan üçüncü kişileri bilme" : "Know transfer recipients"}</li>
              <li>{tr ? "Düzeltme isteme" : "Request correction"}</li>
              <li>{tr ? "Silme/yok etme isteme" : "Request deletion/destruction"}</li>
              <li>{tr ? "Düzeltme/silmenin üçüncü kişilere bildirilmesi" : "Notify third parties of corrections"}</li>
              <li>{tr ? "Otomatik analiz sonuçlarına itiraz (Md.11/1-g)" : "Object to automated analysis outcomes (Art.11/1-g)"}</li>
              <li>{tr ? "Zarara uğranması halinde giderilmesini talep" : "Claim compensation for damages"}</li>
            </ol>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
              {tr ? "AI yanıtlarında \"İtiraz Et\" butonu ile otomatik değerlendirmeye itiraz edebilirsiniz." : "Use the \"Object\" button on AI responses to challenge automated assessments."}
            </p>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "8. Başvuru" : "8. Application"}</h3>
            <p className="text-muted-foreground text-xs">
              {tr
                ? "E-posta: info@doctopal.com · 30 gün içinde ücretsiz · KVKK Kurulu şikayet: kvkk.gov.tr / ALO 198"
                : "Email: info@doctopal.com · Free within 30 days · KVKK Board complaint: kvkk.gov.tr / ALO 198"}
            </p>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "9. Yaş Sınırı" : "9. Age Restriction"}</h3>
            <p className="text-muted-foreground text-xs">
              {tr ? "DoctoPal 18+ kullanıcılar içindir. 18 yaş altı tespit edilirse hesap kapatılır." : "DoctoPal is for 18+ users. Accounts of users under 18 will be closed upon detection."}
            </p>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "10. Güvenlik (KVKK Md.12)" : "10. Security (KVKK Art.12)"}</h3>
            <p className="text-muted-foreground text-xs">
              {tr
                ? "RLS veri izolasyonu · TLS/HTTPS · Encryption at rest · AI anonimleştirme · Prompt injection koruması · Rate limiting · Audit log · 72 saat ihlal bildirimi · 9 katmanlı güvenlik"
                : "RLS data isolation · TLS/HTTPS · Encryption at rest · AI anonymization · Prompt injection protection · Rate limiting · Audit logging · 72-hour breach notification · 9-layer security"}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-muted/30">
          <p className="text-[11px] text-muted-foreground text-center mb-3">
            {tr
              ? "Bu metin KVKK Md.10 kapsamında aydınlatma yükümlülüğüdür. Açık rıza ayrı olarak alınır. v2.0"
              : "This notice fulfills the KVKK Art.10 disclosure obligation. Explicit consent is collected separately. v2.0"}
          </p>
          <button
            onClick={onAcknowledge}
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {tr ? "Okudum, Kapat" : "I've Read This, Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
