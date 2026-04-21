// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.10 Aydınlatma Metni — pop-up formatında.
// Bu bilgilendirmedir, rıza DEĞİLDİR. Checkbox YOK.
// Versiyon CONSENT_VERSIONS.aydinlatma'dan okunur; sürüm bump'ı tek yerden
// yapılır ve tüm popup metnine (header + footer + consent audit) yansır.
"use client";

import { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";

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

  // Session 41 F-S-002: scroll gate — button only enabled after user scrolls to
  // the end of the content. Mirrors the pattern already in ConsentPopup
  // (commit 7167423, 0d9c7a4 short-text fix). Before this, the "Okudum, Kapat"
  // button was always enabled, which let users acknowledge the KVKK Md.10
  // notice without reading it → false compliance in consent_log audit trail.
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset on open + short-text auto-enable (ConsentPopup parity): if the entire
  // notice fits without scrolling, mark "scrolled to bottom" immediately so we
  // don't trap the user on content that has no overflow to consume.
  useEffect(() => {
    if (!open) return;
    setHasScrolledToBottom(false);
    const timer = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollHeight <= el.clientHeight + 5) {
        setHasScrolledToBottom(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [open]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
      setHasScrolledToBottom(true);
    }
  }

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
              <p className="text-xs text-muted-foreground">{CONSENT_VERSIONS.aydinlatma} — {tr ? "Nisan 2026" : "April 2026"}</p>
            </div>
          </div>
          {!forceAcknowledge && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Scrollable content — compact version of /aydinlatma.
            Session 41 F-S-002: ref + onScroll feed the hasScrolledToBottom
            gate on the acknowledge button below. */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-foreground"
        >

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
              <li>{tr ? "Sağlık — kendi verin (özel nitelikli): ilaçlar, alerjiler, kronik hastalıklar, semptomlar, yaş, cinsiyet, kan grubu, aşılar, sigara/alkol, cerrahi, gebelik/emzirme, lab değerleri, takviyeler" : "Health — your own data (special): medications, allergies, chronic conditions, symptoms, age, gender, blood type, vaccines, smoking/alcohol, surgical history, pregnancy/breastfeeding, lab values, supplements"}</li>
              <li>{tr ? "Aile Sağlık Öyküsü (v2.2 yeni explicit kategori): birinci/ikinci derece akraba hastalık geçmişi — yakınlık, hastalık adı, tanı yaşı, vefat bilgisi, serbest not. Kalıtsal risk değerlendirmesi amacıyla. Üçüncü şahıs için detaylı ilaç/profil saklanmaz, yalnızca metadata." : "Family Health History (v2.2 new explicit category): first/second-degree relative condition history — relation, condition name, age at diagnosis, deceased info, free-text notes. For hereditary risk assessment. No detailed medications/profile stored for third parties — metadata only."}</li>
              <li>{tr ? "Tıbbi görüntü/belge: kan tahlili PDF, radyoloji, ilaç fotoğrafı, prospektüs" : "Medical images/docs: blood test PDF, radiology, medication photos, prescribing info"}</li>
              <li>{tr ? "İletişim: telefon (opsiyonel)" : "Contact: phone (optional)"}</li>
              <li>{tr ? "İşlem: AI sohbet, etkileşim sonuçları, SBAR, rıza kayıtları" : "Transaction: AI chat, interaction results, SBAR, consent records"}</li>
              <li>{tr ? "Teknik: IP, tarayıcı (güvenlik)" : "Technical: IP, browser (security)"}</li>
              <li>{tr ? "Finansal (yalnızca Premium abonelik): ödeme tutarı, abonelik dönemi, fatura, kart maskesi (son 4 hane). Tam kart / CVV DoctoPal'da tutulmaz, PCI-DSS sertifikalı Iyzico'da saklanır. Aile üyeleri için finansal veri işlenmez." : "Financial (Premium subscription only): payment amount, subscription period, invoice, card mask (last 4). Full card / CVV never stored on DoctoPal; kept by PCI-DSS certified Iyzico. No financial data processed for family members."}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold mb-1">{tr ? "3. İşleme Amaçları" : "3. Purposes"}</h3>
            <p className="text-muted-foreground text-xs font-medium mb-1">{tr ? "Hukuki dayanak: sağlık verisi için KVKK Md.6 açık rıza; Premium abonelik için KVKK Md.5/2-c sözleşme ve Md.5/2-ç yasal yükümlülük (VUK)." : "Legal basis: explicit consent (KVKK Art.6) for health data; contract (Art.5/2-c) and legal obligation (Art.5/2-ç, Tax Procedure Law) for Premium subscription."}</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{tr ? "AI sağlık bilgilendirme + etkileşim kontrolü" : "AI health info + interaction checking"}</li>
              <li>{tr ? "Tıbbi görüntü/belge analizi" : "Medical image/document analysis"}</li>
              <li>{tr ? "SBAR doktor raporu" : "SBAR doctor report"}</li>
              <li>{tr ? "İlaç takibi, takvim, sağlık kaydı" : "Medication tracking, calendar, health logs"}</li>
              <li>{tr ? "Semantic arama" : "Semantic search"}</li>
              <li>{tr ? "Premium abonelik: ücret tahsilatı ve fatura düzenlenmesi" : "Premium subscription: payment collection and invoicing"}</li>
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
              <li><strong>Iyzico Ödeme Hizmetleri A.Ş.</strong> ({tr ? "Türkiye yerleşik, PCI-DSS" : "Türkiye-based, PCI-DSS"}) — {tr ? "Premium abonelik ödemeleri. Aktarım: ad-soyad, e-posta, kart bilgileri (DoctoPal'a dönmez), ödeme geçmişi. Dayanak: sözleşme ifası (Md.5/2-c). Yurt dışı aktarım YOK." : "Premium subscription payments. Transferred: name, email, card data (not returned to DoctoPal), payment history. Basis: contract performance (Art.5/2-c). No cross-border transfer."}</li>
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
              <p>{tr ? "Ödeme verisi ve faturalar: 10 yıl (VUK Md.253 yasal zorunluluk)" : "Payment data and invoices: 10 years (Tax Procedure Law Art.253, legal obligation)"}</p>
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

          <section>
            <h3 className="font-bold mb-1">{tr ? "11. Değişiklik Tarihçesi" : "11. Change History"}</h3>
            {tr ? (
              <div className="space-y-2 text-muted-foreground text-xs">
                <div>
                  <p className="font-semibold text-foreground">v2.2 — Nisan 2026</p>
                  <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
                    <li>Aile Sağlık Öyküsü ayrı explicit kategori olarak eklendi (§2-b2)</li>
                    <li>Üçüncü şahıs akraba verisi için metadata seviyesi saklama ilkesi netleştirildi</li>
                    <li>Kalıtsal risk değerlendirmesi işleme amacı kapsamında açıklandı</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground">v2.1 — Nisan 2026</p>
                  <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
                    <li>Finansal Veri kategorisi eklendi (Premium abonelik için)</li>
                    <li>Iyzico Ödeme Hizmetleri A.Ş. aktarıcı olarak eklendi</li>
                    <li>Ödeme verisi saklama süresi (10 yıl, VUK Md.253) eklendi</li>
                    <li>Premium abonelik işleme amacı eklendi</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground">v2.0 — Nisan 2026</p>
                  <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
                    <li>İlk yayın</li>
                    <li>10 bölüm, KVKK Md.10 uyumlu</li>
                    <li>4 ana veri kategorisi, 3 aktarıcı (Supabase, Anthropic, Google)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-muted-foreground text-xs">
                <div>
                  <p className="font-semibold text-foreground">v2.2 — April 2026</p>
                  <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
                    <li>Family Health History added as a separate explicit category (§2-b2)</li>
                    <li>Metadata-level retention principle clarified for third-party relative data</li>
                    <li>Hereditary risk assessment explicitly covered under processing purposes</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground">v2.1 — April 2026</p>
                  <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
                    <li>Financial Data category added (for Premium subscription)</li>
                    <li>Iyzico Ödeme Hizmetleri A.Ş. added as a transferee</li>
                    <li>Payment data retention period (10 years, Tax Procedure Law Art.253) added</li>
                    <li>Premium subscription processing purpose added</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground">v2.0 — April 2026</p>
                  <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
                    <li>Initial publication</li>
                    <li>10 sections, compliant with KVKK Art.10</li>
                    <li>4 main data categories, 3 transferees</li>
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-muted/30">
          <p className="text-[11px] text-muted-foreground text-center mb-3">
            {tr
              ? `Bu metin KVKK Md.10 kapsamında aydınlatma yükümlülüğüdür. Açık rıza ayrı olarak alınır. ${CONSENT_VERSIONS.aydinlatma}`
              : `This notice fulfills the KVKK Art.10 disclosure obligation. Explicit consent is collected separately. ${CONSENT_VERSIONS.aydinlatma}`}
          </p>
          {!hasScrolledToBottom && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 text-center mb-2">
              {tr
                ? "Metnin sonuna kadar kaydırın, ardından onaylayabilirsiniz."
                : "Scroll to the end of the notice, then you can acknowledge."}
            </p>
          )}
          <button
            onClick={onAcknowledge}
            disabled={!hasScrolledToBottom}
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            {tr ? "Okudum, Kapat" : "I've Read This, Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
