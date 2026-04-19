// © 2026 DoctoPal — All Rights Reserved
// Mesafeli Satış Sözleşmesi — 6502 s.K. + Mesafeli Sözleşmeler Yönetmeliği
// v1.0 TASLAK — şirket tescili tamamlanıp hukuk danışmanı incelemesinden
// geçince aktive edilecek. Footer link'i disabled kalıyor (LandingFooter'da
// href="#"). Sayfa doğrudan URL ile erişilebilir.
"use client";

import { useLang } from "@/components/layout/language-toggle";
import { ShieldCheck, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function MesafeliSatisPage() {
  const { lang } = useLang();
  const tr = lang === "tr";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        {tr ? "Ana sayfaya dön" : "Back to home"}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="rounded-xl bg-primary/10 p-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {tr ? "Mesafeli Satış Sözleşmesi" : "Distance Sales Agreement"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
              v1.0 — {tr ? "Taslak" : "Draft"}
            </span>
            <p className="text-xs text-muted-foreground">
              {tr ? "6502 s.K. + Mesafeli Sözleşmeler Yönetmeliği · Nisan 2026" : "Consumer Protection Law No.6502 + Distance Contracts Regulation · April 2026"}
            </p>
          </div>
        </div>
      </div>

      {/* Draft warning banner */}
      <div className="mb-8 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
        <div className="flex gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            {tr
              ? "Bu sözleşme metni taslak niteliğindedir. DoctoPal şu anda şirket tescil sürecindedir. Şirket tescili tamamlandığında bu metin hukuk danışmanı incelemesinden geçirilip güncellenerek yürürlüğe girecek ve kullanıcılara e-posta ile bildirilecektir. Bu aşamada ücretli hizmet satışı yapılmamaktadır."
              : "This agreement is a draft. DoctoPal is currently in the company registration process. Once registration is complete, this text will be reviewed by a legal advisor, updated, and enter into force — users will be notified by email. Paid services are not being sold at this stage."}
          </p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">

        {/* §1 Taraflar */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "1. Taraflar" : "1. Parties"}</h2>
          <h3 className="text-base font-semibold mt-4 mb-2">{tr ? "SATICI:" : "SELLER:"}</h3>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Ticari Unvan: DoctoPal (kuruluş aşamasında)" : "Trade name: DoctoPal (registration in progress)"}</li>
            <li>{tr ? "İletişim: info@doctopal.com" : "Contact: info@doctopal.com"}</li>
            <li>Web: https://doctopal.com</li>
            <li>{tr ? "Adres: Şirket tescil sonrası güncellenecektir" : "Address: to be updated after company registration"}</li>
            <li>{tr ? "MERSIS No: Tescil sonrası eklenecektir" : "MERSIS No: to be added after registration"}</li>
            <li>{tr ? "Vergi Dairesi / Vergi No: Tescil sonrası eklenecektir" : "Tax office / Tax ID: to be added after registration"}</li>
          </ul>
          <h3 className="text-base font-semibold mt-4 mb-2">{tr ? "ALICI:" : "BUYER:"}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {tr
              ? "İşbu sözleşmeyi elektronik ortamda kabul eden, DoctoPal Premium hizmetine abone olmak isteyen tüketici."
              : "The consumer who electronically accepts this agreement and wishes to subscribe to DoctoPal Premium."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            {tr
              ? "Alıcı, işbu sözleşmeyi onaylayarak 18 yaşını doldurduğunu ve Türk Medeni Kanunu Madde 10 uyarınca sözleşme akdetme ehliyetine sahip olduğunu kabul ve beyan eder. 18 yaşını doldurmamış kişilerin abonelik işlemi başlatması yasaktır; tespit edilmesi halinde hesap derhal kapatılır ve varsa tahsilatlar yasal çerçevede iade edilir."
              : "By approving this agreement, the Buyer acknowledges and declares that they are over 18 and have the legal capacity to enter into contracts under Article 10 of the Turkish Civil Code. It is prohibited for persons under 18 to initiate a subscription; if detected, the account will be closed immediately and any collected payments refunded within the legal framework."}
          </p>
        </section>

        {/* §2 Konu */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "2. Sözleşmenin Konusu" : "2. Subject of the Agreement"}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {tr
              ? "İşbu sözleşme, Satıcı'nın dijital platformu üzerinden sunduğu DoctoPal Premium aboneliğinin (Bireysel Premium veya Aile Premium) elektronik ortamda Alıcı'ya satışı ile ilgili hak ve yükümlülüklerin 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca düzenlenmesini amaçlar."
              : "This agreement aims to regulate the rights and obligations concerning the electronic sale of DoctoPal Premium subscription (Individual Premium or Family Premium) offered by the Seller through its digital platform, in accordance with Consumer Protection Law No.6502 and the Distance Contracts Regulation."}
          </p>
        </section>

        {/* §3 Hizmetin Nitelikleri */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "3. Sözleşmenin Konusu Hizmetin Temel Nitelikleri" : "3. Essential Characteristics of the Service"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr
              ? "DoctoPal, yapay zeka destekli bir dijital sağlık asistanı hizmetidir. Premium abonelik kapsamında şu özelliklere erişim sağlanır:"
              : "DoctoPal is an AI-powered digital health assistant service. Premium subscription grants access to:"}
          </p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Sınırsız AI sağlık asistanı sohbeti (Fair Use Policy kapsamında)" : "Unlimited AI health assistant conversation (subject to Fair Use Policy)"}</li>
            <li>{tr ? "İlaç-ilaç ve ilaç-takviye etkileşim kontrolü (GRADE kanıt seviyesi ile)" : "Drug-drug and drug-supplement interaction checking (with GRADE evidence levels)"}</li>
            <li>{tr ? "SBAR klinik rapor oluşturma ve PDF indirme" : "SBAR clinical report generation and PDF download"}</li>
            <li>{tr ? "Kan tahlili ve radyoloji analizi" : "Blood test and radiology analysis"}</li>
            <li>{tr ? "Prospektüs okuma" : "Prescribing information reader"}</li>
            <li>{tr ? "Aile üyeleri için sağlık yönetimi (Aile Premium)" : "Family member health management (Family Premium)"}</li>
            <li>{tr ? "Sağlık ağacı ve genetik analiz" : "Family health tree and genetic analysis"}</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "DoctoPal tıbbi teşhis koyan, tedavi öneren veya reçete yazan bir hizmet değildir; bilgilendirme amaçlı bir dijital asistandır."
              : "DoctoPal does not provide medical diagnosis, treatment recommendations, or prescriptions; it is an informational digital assistant."}
          </p>
        </section>

        {/* §4 Bedel ve Ödeme */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "4. Hizmet Bedeli ve Ödeme" : "4. Service Fee and Payment"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr
              ? "Hizmet bedelleri DoctoPal'ın Fiyatlandırma sayfasında (doctopal.com/pricing) güncel olarak yayımlanır."
              : "Service fees are published up-to-date on the DoctoPal Pricing page (doctopal.com/pricing)."}
          </p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Tüm fiyatlara KDV dahildir (Türk Lirası)" : "All prices include VAT (Turkish Lira)"}</li>
            <li>{tr ? "Ödeme, PCI-DSS sertifikalı ödeme altyapısı sağlayıcısı Iyzico Ödeme Hizmetleri A.Ş. üzerinden tahsil edilir" : "Payments are collected through Iyzico Ödeme Hizmetleri A.Ş., a PCI-DSS certified payment infrastructure provider"}</li>
            <li>{tr ? "Kabul edilen ödeme yöntemleri: Kredi kartı (VISA, MasterCard, Troy)" : "Accepted payment methods: Credit card (VISA, MasterCard, Troy)"}</li>
            <li>{tr ? "Banka kartı, havale ve elektronik cüzdanlar kabul edilmez" : "Debit cards, bank transfers, and e-wallets are not accepted"}</li>
            <li>{tr ? "Alıcı'nın kart bilgileri DoctoPal sunucularında saklanmaz; Iyzico tarafından PCI-DSS standardında güvenli şekilde tutulur" : "The Buyer's card information is not stored on DoctoPal servers; it is securely held by Iyzico under PCI-DSS standards"}</li>
          </ul>
        </section>

        {/* §5 Ücretsiz Deneme */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "5. Ücretsiz Deneme Süresi" : "5. Free Trial Period"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Premium abonelik, 7 gün ücretsiz deneme süresi ile başlar" : "Premium subscription begins with a 7-day free trial"}</li>
            <li>{tr ? "Deneme süresinin başlaması için geçerli bir kredi kartının tanımlanması zorunludur" : "A valid credit card is required to start the trial"}</li>
            <li>{tr ? "Iyzico, kart geçerliliğini doğrulamak için ilk tanımlamada 1 TL tutarında geçici bloke işlemi uygular; bu tutar anında iade edilir" : "Iyzico places a temporary 1 TL hold to validate the card; this amount is immediately refunded"}</li>
            <li>{tr ? "7 günlük deneme süresi sonunda Alıcı aboneliğini iptal etmediği takdirde, seçilen plana göre ücretlendirme başlar" : "If the Buyer does not cancel within the 7-day trial, billing starts according to the selected plan"}</li>
            <li>{tr ? "Deneme süresi içerisinde Alıcı tek tıkla iptal edebilir; bu durumda kartından tahsilat yapılmaz" : "Within the trial, the Buyer may cancel with one click; no charges will be made"}</li>
          </ul>
        </section>

        {/* §6 İfa */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "6. Hizmetin İfası" : "6. Performance of the Service"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Hizmet, Alıcı'nın ödemesinin Iyzico tarafından onaylanmasını takiben anında Alıcı'nın hesabına tanımlanır" : "The service is activated on the Buyer's account immediately upon payment confirmation by Iyzico"}</li>
            <li>{tr ? "Hizmet dijital ortamda elektronik olarak ifa edilir; fiziksel bir ürün teslimi söz konusu değildir" : "The service is performed electronically in digital form; no physical product delivery occurs"}</li>
            <li>{tr ? "Alıcı, hizmetten yararlanmaya başladığı andan itibaren sözleşme koşullarını kabul etmiş sayılır" : "The Buyer is deemed to have accepted the terms of the agreement from the moment they begin using the service"}</li>
          </ul>
        </section>

        {/* §7 Cayma Hakkı İstisnası */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "7. Cayma Hakkı (İSTİSNA)" : "7. Right of Withdrawal (EXCLUSION)"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr
              ? "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Madde 15/1-(ğ) hükmü uyarınca:"
              : "Pursuant to Article 15/1-(ğ) of the Distance Contracts Regulation and Consumer Protection Law No.6502:"}
          </p>
          <blockquote className="border-l-4 border-amber-400 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10 pl-4 py-2 italic text-muted-foreground">
            {tr
              ? "\"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde tüketici cayma hakkını kullanamaz.\""
              : "\"In contracts concerning services performed instantly electronically or intangible goods delivered instantly to the consumer, the consumer cannot exercise the right of withdrawal.\""}
          </blockquote>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "DoctoPal Premium aboneliği dijital ortamda anında ifa edilen bir hizmet niteliğinde olduğundan, Alıcı sözleşmenin kurulmasından itibaren 14 günlük cayma hakkına sahip değildir."
              : "Since DoctoPal Premium is a service performed instantly in a digital environment, the Buyer does not have the 14-day right of withdrawal from the conclusion of the agreement."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "Alıcı, ödeme öncesinde aşağıdaki üç onay kutusunu işaretleyerek bu istisnayı açıkça kabul etmiş sayılır:"
              : "Before payment, the Buyer is deemed to have expressly accepted this exclusion by checking the following three confirmation boxes:"}
          </p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground mt-2">
            <li>{tr ? "Mesafeli Satış Sözleşmesi'ni okuduğumu ve kabul ettiğimi beyan ederim" : "I declare that I have read and accept the Distance Sales Agreement"}</li>
            <li>{tr ? "14 günlük cayma hakkımdan feragat ettiğimi beyan ederim" : "I declare that I waive my 14-day right of withdrawal"}</li>
            <li>{tr ? "Aboneliğimin dönem sonunda otomatik olarak yenilenmesine onay veriyorum" : "I consent to the automatic renewal of my subscription at the end of each period"}</li>
          </ul>
        </section>

        {/* §8 İptal ve Fesih */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "8. Abonelik İptali ve Fesih" : "8. Subscription Cancellation and Termination"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Alıcı aboneliğini dilediği zaman, tek tıkla iptal edebilir" : "The Buyer may cancel the subscription at any time, with one click"}</li>
            <li>{tr ? "İptal işlemi: Hesap Ayarları > Abonelik Yönetimi > \"Aboneliği İptal Et\"" : "Cancellation path: Account Settings > Subscription Management > \"Cancel Subscription\""}</li>
            <li>{tr ? "İptal sonrasında Alıcı, mevcut ödeme dönemi sonuna kadar hizmetten yararlanmaya devam eder" : "After cancellation, the Buyer continues to benefit until the end of the current billing period"}</li>
            <li>{tr ? "Dönem sonunda otomatik yenileme gerçekleşmez, abonelik sona erer" : "No automatic renewal occurs at the end of the period; the subscription ends"}</li>
            <li>{tr ? "Gerçekleşmiş ödemeler için geri iade yapılmaz (cayma hakkı istisnası — Madde 7)" : "No refunds are issued for completed payments (withdrawal exclusion — Article 7)"}</li>
          </ul>
        </section>

        {/* §9 Otomatik Yenileme */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "9. Otomatik Yenileme" : "9. Automatic Renewal"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Abonelik, her dönem sonunda otomatik olarak yenilenir" : "The subscription automatically renews at the end of each period"}</li>
            <li>{tr ? "Yenileme, Alıcı'nın kayıtlı kartından otomatik tahsilat ile gerçekleşir" : "Renewal is performed via automatic charge on the Buyer's stored card"}</li>
            <li>{tr ? "Alıcı yenileme tarihinden önce dilediği zaman aboneliğini iptal edebilir" : "The Buyer may cancel at any time before the renewal date"}</li>
            <li>{tr ? "Aylık planlar her ay, yıllık planlar her yıl aynı tarihte yenilenir" : "Monthly plans renew monthly, yearly plans renew annually on the same date"}</li>
            <li>{tr ? "Fiyat değişikliği halinde Alıcı en az 30 gün öncesinden e-posta ile bilgilendirilir; kabul etmediği takdirde yenileme öncesi iptal hakkına sahiptir" : "In case of a price change, the Buyer is notified by email at least 30 days in advance; if not accepted, the Buyer may cancel before renewal"}</li>
          </ul>
        </section>

        {/* §10 Aile Premium */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "10. Aile Premium Özel Şartı" : "10. Family Premium Special Clause"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Aile Premium aboneliklerinde ödeme yükümlüsü ve fatura muhatabı yalnızca aile sahibi (owner) sıfatındaki Alıcı'dır" : "In Family Premium subscriptions, the payment obligor and invoice recipient is solely the family owner (the Buyer)"}</li>
            <li>{tr ? "Aile üyeleri (davetliler) ödeme sürecine taraf değildir; abonelikten doğan hak ve yükümlülükler yalnızca owner'a aittir" : "Family members (invited persons) are not parties to the payment process; all rights and obligations arising from the subscription belong to the owner"}</li>
            <li>{tr ? "Aile üyesinin hesabını silmesi, aileden ayrılması veya owner'ın aile yönetimini devretmek istemesi, ödeme akışını değiştirmez" : "A family member deleting their account, leaving the family, or the owner wishing to transfer family management does not change the payment flow"}</li>
            <li>{tr ? "Owner değişikliği durumunda yeni abonelik işlemi gerekir" : "An owner change requires a new subscription transaction"}</li>
          </ul>
        </section>

        {/* §11 Taraf Sorumlulukları */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "11. Taraf Sorumlulukları" : "11. Responsibilities of the Parties"}</h2>
          <h3 className="text-base font-semibold mt-4 mb-2">{tr ? "Satıcı'nın sorumlulukları:" : "Seller's responsibilities:"}</h3>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Hizmeti sözleşmede belirtilen şekilde ve kesintisiz sunmak için makul çabayı göstermek" : "Make reasonable efforts to provide the service as stipulated and without interruption"}</li>
            <li>{tr ? "Teknik arıza, bakım veya mücbir sebep hallerinde kullanıcıları bilgilendirmek" : "Inform users in cases of technical failure, maintenance, or force majeure"}</li>
            <li>{tr ? "Alıcı'nın kişisel verilerini KVKK uyarınca korumak (bkz. Aydınlatma Metni)" : "Protect the Buyer's personal data in accordance with KVKK (see the Privacy Notice)"}</li>
          </ul>
          <h3 className="text-base font-semibold mt-4 mb-2">{tr ? "Alıcı'nın sorumlulukları:" : "Buyer's responsibilities:"}</h3>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Hesap güvenliğini (şifre, e-posta) korumak" : "Protect account security (password, email)"}</li>
            <li>{tr ? "Ödeme bilgilerinin doğruluğunu sağlamak" : "Ensure the accuracy of payment information"}</li>
            <li>{tr ? "DoctoPal'ı yasalara ve iyi niyete uygun şekilde kullanmak" : "Use DoctoPal in compliance with the law and in good faith"}</li>
            <li>{tr ? "DoctoPal'ın tıbbi teşhis/tedavi hizmeti olmadığını, nihai sağlık kararlarının hekim görüşüyle verilmesi gerektiğini kabul etmek" : "Accept that DoctoPal is not a medical diagnosis/treatment service and that final health decisions must be made with a physician"}</li>
          </ul>
        </section>

        {/* §12 Uyuşmazlık */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "12. Uyuşmazlık Çözümü ve Uygulanacak Hukuk" : "12. Dispute Resolution and Applicable Law"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "İşbu sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır" : "Disputes arising from this agreement are governed by the laws of the Republic of Türkiye"}</li>
            <li>{tr ? "Gümrük ve Ticaret Bakanlığı'nca her yıl belirlenen parasal sınırlar dahilinde İl ve İlçe Tüketici Hakem Heyetleri, bu sınırları aşan uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir" : "Provincial and district Consumer Arbitration Committees (within the monetary limits set annually by the Ministry of Customs and Trade) or Consumer Courts (for disputes exceeding those limits) have jurisdiction"}</li>
            <li>{tr ? "Şikayet ve bilgi için: info@doctopal.com" : "Complaints and inquiries: info@doctopal.com"}</li>
          </ul>
        </section>

        {/* §13 Yürürlük */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "13. Yürürlük" : "13. Entry into Force"}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {tr
              ? "İşbu sözleşme, Alıcı'nın ödeme öncesi sunulan onay kutularını işaretleyip \"Güvenli Ödeme\" butonuna tıkladığı anda elektronik olarak yürürlüğe girer."
              : "This agreement enters into force electronically the moment the Buyer checks the confirmation boxes presented before payment and clicks the \"Secure Payment\" button."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            {tr
              ? "Sözleşmenin bir kopyası Alıcı'nın e-posta adresine ve hesap panelindeki \"Hesap Ayarları > Belgelerim\" bölümüne otomatik olarak kaydedilir."
              : "A copy of the agreement is automatically saved to the Buyer's email address and to the \"Account Settings > My Documents\" section of the account panel."}
          </p>
        </section>
      </div>

      {/* Footer disclaimer */}
      <div className="mt-12 pt-6 border-t space-y-2">
        <p className="text-xs italic text-slate-500 dark:text-slate-500 leading-relaxed">
          {tr
            ? "Bu metin, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'ne uygun olarak hazırlanmıştır. ANCAK HUKUK DANIŞMANI İNCELEMESİNDEN GEÇMEMİŞTİR. Şirket tescil süreci sonrası güncel bilgilerle ve hukuk danışmanı onayıyla yürürlüğe girecektir."
            : "This text is prepared in accordance with Consumer Protection Law No.6502 and the Distance Contracts Regulation. HOWEVER, IT HAS NOT BEEN REVIEWED BY LEGAL COUNSEL. It will enter into force with updated information and legal counsel approval following company registration."}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          {tr ? "Mesafeli Satış Sözleşmesi versiyon: v1.0 — Taslak — Son güncelleme: Nisan 2026" : "Distance Sales Agreement version: v1.0 — Draft — Last updated: April 2026"}
        </p>
      </div>
    </div>
  );
}
