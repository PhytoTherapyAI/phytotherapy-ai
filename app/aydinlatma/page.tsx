// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.10 Aydınlatma Metni v2.1 — Açık rıza formundan AYRI sunulmalıdır (KVKK 2026/347 İlke Kararı)
// v2.1 (Nisan 2026): Finansal Veri kategorisi + Iyzico aktarıcı + VUK 10-yıl saklama + Premium abonelik amacı + Değişiklik Tarihçesi eklendi.
"use client";

import { useLang } from "@/components/layout/language-toggle";
import { ShieldCheck, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AydinlatmaPage() {
  const { lang } = useLang();
  const tr = lang === "tr";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Link href="/privacy-controls" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        {tr ? "Gizlilik Ayarlarına Dön" : "Back to Privacy Settings"}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <div className="rounded-xl bg-primary/10 p-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold md:text-2xl">
            {tr ? "Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni" : "Privacy Notice on Personal Data Processing"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tr ? "KVKK Md.10 kapsamında aydınlatma yükümlülüğü · v2.2 — Nisan 2026" : "Disclosure obligation under KVKK Art.10 · v2.2 — April 2026"}
          </p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">

        {/* §1 Veri Sorumlusu */}
        <section>
          <h2 className="text-base font-bold">{tr ? "1. Veri Sorumlusunun Kimliği" : "1. Identity of the Data Controller"}</h2>
          {tr ? (
            <div className="space-y-2 text-muted-foreground">
              <p><strong>DoctoPal</strong> — Kurucu Ortaklar: Taha Ahmet Sıbıç, İpek Özen</p>
              <p>Şu an şirket tescil süreci devam etmektedir. Tüzel kişilik kazanıldıktan sonra veri sorumlusu unvanı, adres ve KEP bilgileri güncellenecek; VERBİS (Veri Sorumluları Sicil Bilgi Sistemi) kaydı yapılacaktır.</p>
              <p>Web: doctopal.com<br />İletişim: info@doctopal.com</p>
            </div>
          ) : (
            <div className="space-y-2 text-muted-foreground">
              <p><strong>DoctoPal</strong> — Co-founders: Taha Ahmet Sıbıç, İpek Özen</p>
              <p>Company registration is currently in progress. Upon legal incorporation, data controller title, address, and official contact information will be updated; VERBIS (Data Controllers Registry) registration will be completed.</p>
              <p>Web: doctopal.com<br />Contact: info@doctopal.com</p>
            </div>
          )}
        </section>

        {/* §2 Veri Kategorileri */}
        <section>
          <h2 className="text-base font-bold">{tr ? "2. İşlenen Kişisel Veri Kategorileri" : "2. Categories of Personal Data Processed"}</h2>
          {tr ? (
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong>a) Kimlik Verisi:</strong> Ad, e-posta</li>
              <li>
                <strong>b) Sağlık Verisi (Özel Nitelikli):</strong>
                <ul className="list-[lower-roman] pl-5 mt-1 space-y-1">
                  <li><strong>b1) Kullanıcının kendi sağlık verisi:</strong> İlaçlar, alerjiler, kronik hastalıklar, semptomlar, yaş, cinsiyet, kan grubu, aşı kayıtları, sigara/alkol kullanımı, cerrahi geçmiş, gebelik/emzirme durumu, laboratuvar değerleri, takviyeler</li>
                  <li>
                    <strong>b2) Aile Sağlık Öyküsü</strong> <em>(v2.2 — yeni explicit kategori)</em>: Birinci ve ikinci derece akrabalarınızın (anne, baba, kardeş, dede, nine, hala, teyze, amca, dayı, kuzen) sağlık öyküsü — hastalık adı, tanı yaşı, vefat yaşı (varsa), serbest metin notlar. <br />
                    <em>Amaç:</em> Kalıtsal risk değerlendirmesi (meme/kolon/prostat kanseri, erken kardiyovasküler olay, diyabet, Alzheimer vb.), erken tarama önerileri, AI asistanın kişiselleştirilmiş bağlam kullanımı. <br />
                    <em>Hukuki dayanak:</em> KVKK Md.6 AÇIK RIZA (AI İşleme rızası kapsamında). Bu veri, üçüncü şahıs sağlık verisi niteliğinde olduğu için yalnızca sizin bildirdiğiniz kadarıyla ve metadata seviyesinde saklanır; detaylı ilaç/profil üçüncü şahıslar için tutulmaz.
                  </li>
                </ul>
              </li>
              <li><strong>c) Tıbbi Görüntü/Belge Verisi:</strong> Kan tahlili raporları (PDF), radyoloji görüntüleri, ilaç fotoğrafları, prospektüs görüntüleri</li>
              <li><strong>d) İletişim Verisi:</strong> Telefon numarası (opsiyonel)</li>
              <li><strong>e) İşlem Verisi:</strong> AI sohbet geçmişi, etkileşim kontrol sonuçları, SBAR raporları, rıza kayıtları</li>
              <li><strong>f) Teknik Veri:</strong> IP adresi, tarayıcı bilgisi (güvenlik amaçlı)</li>
              <li>
                <strong>g) Finansal Veri (yalnızca Premium abonelik kullanıcılarımız için):</strong><br />
                <em>Hangi veriler:</em> Ödeme tutarı, ödeme durumu, abonelik başlangıç/bitiş tarihleri, fatura/makbuz bilgileri, kart maskesi (yalnızca son 4 hane).<br />
                <em>Hangi veriler işlenmez:</em> Kartınızın tam numarası, CVV, şifreler. Bu bilgiler hiçbir zaman DoctoPal sunucularında tutulmaz; PCI-DSS sertifikalı ödeme altyapısı sağlayıcımız Iyzico tarafından güvenli şekilde saklanır.<br />
                <em>Veri öznesi kapsamı:</em> Finansal veri yalnızca abonelik ödemesini gerçekleştiren kullanıcı (Bireysel Premium abone veya Aile Premium sahibi/owner) için işlenir. Aile üyeleri (davetli kişiler) ödemeye taraf değildir; bu kişiler için finansal veri işlenmez.
              </li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong>a) Identity Data:</strong> Name, email</li>
              <li>
                <strong>b) Health Data (Special Category):</strong>
                <ul className="list-[lower-roman] pl-5 mt-1 space-y-1">
                  <li><strong>b1) User's own health data:</strong> Medications, allergies, chronic conditions, symptoms, age, gender, blood type, vaccine records, smoking/alcohol use, surgical history, pregnancy/breastfeeding status, lab values, supplements</li>
                  <li>
                    <strong>b2) Family Health History</strong> <em>(v2.2 — new explicit category)</em>: Health history of your first- and second-degree relatives (mother, father, sibling, grandparent, aunt, uncle, cousin) — condition name, age at diagnosis, age at death (if applicable), free-text notes. <br />
                    <em>Purpose:</em> Hereditary risk assessment (breast/colon/prostate cancer, early cardiovascular events, diabetes, Alzheimer's, etc.), early screening recommendations, personalized AI context. <br />
                    <em>Legal basis:</em> KVKK Art.6 EXPLICIT CONSENT (within the scope of AI Processing consent). Since this constitutes third-party health data, only what you disclose is stored, at the metadata level; detailed medications/profiles are not kept for third parties.
                  </li>
                </ul>
              </li>
              <li><strong>c) Medical Image/Document Data:</strong> Blood test reports (PDF), radiology images, medication photos, prescribing information images</li>
              <li><strong>d) Contact Data:</strong> Phone number (optional)</li>
              <li><strong>e) Transaction Data:</strong> AI chat history, interaction check results, SBAR reports, consent records</li>
              <li><strong>f) Technical Data:</strong> IP address, browser info (security purposes)</li>
              <li>
                <strong>g) Financial Data (only for Premium subscription users):</strong><br />
                <em>What data:</em> Payment amount, payment status, subscription start/end dates, invoice/receipt information, card mask (last 4 digits only).<br />
                <em>What is not processed:</em> Your full card number, CVV, passwords. This information is never stored on DoctoPal servers; it is securely held by our PCI-DSS certified payment infrastructure provider, Iyzico.<br />
                <em>Data subject scope:</em> Financial data is processed only for the user who performs the subscription payment (Individual Premium subscriber or Family Premium owner). Family members (invited users) are not parties to the payment; no financial data is processed for them.
              </li>
            </ul>
          )}
        </section>

        {/* §3 İşleme Amaçları + Hukuki Dayanak */}
        <section>
          <h2 className="text-base font-bold">{tr ? "3. İşleme Amaçları ve Hukuki Dayanak" : "3. Processing Purposes and Legal Basis"}</h2>
          <p className="text-muted-foreground font-medium">
            {tr
              ? "Özel nitelikli sağlık verisi (KVKK Md.6) yalnızca AÇIK RIZANIZA dayalı olarak işlenir. Meşru menfaat veya sözleşme gereği işleme yapılmaz."
              : "Special category health data (KVKK Art.6) is processed ONLY based on your EXPLICIT CONSENT. No processing based on legitimate interest or contractual necessity."}
          </p>
          {tr ? (
            <ol className="list-[lower-alpha] pl-5 space-y-1 mt-3 text-muted-foreground">
              <li>AI destekli kişiselleştirilmiş sağlık bilgilendirmesi</li>
              <li>İlaç-bitki ve ilaç-ilaç etkileşim kontrolü</li>
              <li>Tıbbi görüntü/belge analizi (kan tahlili, radyoloji raporu)</li>
              <li>Prospektüs ve ilaç fotoğrafı okuma/analiz</li>
              <li>SBAR formatında doktor ön raporu oluşturma</li>
              <li>İlaç takibi, aşı takvimi, günlük sağlık kaydı</li>
              <li>Hizmet iyileştirme ve güvenlik</li>
              <li>Semantic arama (ilgili içerik önerisi)</li>
              <li>Premium abonelik hizmetlerinin sunulması, ücret tahsilatı ve fatura düzenlenmesi <em>(Hukuki dayanak: Sözleşmenin kurulması ve ifası — KVKK Md.5/2-c; Vergi Usul Kanunu kapsamında yasal yükümlülük — KVKK Md.5/2-ç)</em></li>
            </ol>
          ) : (
            <ol className="list-[lower-alpha] pl-5 space-y-1 mt-3 text-muted-foreground">
              <li>AI-powered personalized health information</li>
              <li>Drug-herb and drug-drug interaction checking</li>
              <li>Medical image/document analysis (blood tests, radiology reports)</li>
              <li>Prescribing information and medication photo reading/analysis</li>
              <li>SBAR format pre-visit doctor report generation</li>
              <li>Medication tracking, vaccine calendar, daily health logging</li>
              <li>Service improvement and security</li>
              <li>Semantic search (related content suggestions)</li>
              <li>Provision of Premium subscription services, payment collection, and invoice issuance <em>(Legal basis: Establishment and performance of contract — KVKK Art.5/2-c; Legal obligation under the Tax Procedure Law — KVKK Art.5/2-ç)</em></li>
            </ol>
          )}
        </section>

        {/* §4 Veri Toplama Yöntemi */}
        <section>
          <h2 className="text-base font-bold">{tr ? "4. Veri Toplama Yöntemi" : "4. Data Collection Method"}</h2>
          <p className="text-muted-foreground">
            {tr
              ? "Veriler, kullanıcının kendisi tarafından web arayüzü üzerindeki formlar aracılığıyla doğrudan girilerek ve kullanıcının uygulama ile etkileşimi sırasında otomatik olarak toplanır. DoctoPal, kullanıcı tarafından açıkça paylaşılmayan hiçbir sağlık verisini harici kaynaklardan toplamaz."
              : "Data is collected directly through forms on the web interface by the user and automatically during user interaction with the application. DoctoPal does not collect any health data from external sources unless explicitly shared by the user."}
          </p>
        </section>

        {/* §5 Aktarılan Üçüncü Taraflar */}
        <section>
          <h2 className="text-base font-bold">{tr ? "5. Verilerin Aktarıldığı Üçüncü Taraflar" : "5. Third-Party Data Recipients"}</h2>
          <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
            <li>
              <strong>Supabase Inc.</strong> ({tr ? "İrlanda / AB" : "Ireland / EU"})<br />
              {tr ? "Amaç: Veri depolama, kullanıcı yönetimi, veritabanı" : "Purpose: Data storage, user management, database"}<br />
              {tr ? "Aktarılan veri: Tüm kullanıcı verileri" : "Data transferred: All user data"}<br />
              {tr ? "Hukuki dayanak: Açık rızanız (KVKK Md.9/1)" : "Legal basis: Your explicit consent (KVKK Art.9/1)"}
            </li>
            <li>
              <strong>Anthropic PBC</strong> ({tr ? "ABD" : "USA"})<br />
              {tr ? "Amaç: AI (Claude) text analizi + multimodal görsel analiz" : "Purpose: AI (Claude) text analysis + multimodal image analysis"}<br />
              {tr ? "Aktarılan veri: Anonimleştirilmiş sağlık verisi + görsel dosyalar (kan tahlili, radyoloji, ilaç fotoğrafı)" : "Data transferred: Anonymized health data + visual files (blood tests, radiology, medication photos)"}<br />
              {tr ? "Hukuki dayanak: Açık rızanız (KVKK Md.9/1)" : "Legal basis: Your explicit consent (KVKK Art.9/1)"}
            </li>
            <li>
              <strong>Google LLC</strong> ({tr ? "ABD" : "USA"})<br />
              {tr ? "Amaç: Gemini text-embedding-004 ile semantic arama altyapısı" : "Purpose: Gemini text-embedding-004 semantic search infrastructure"}<br />
              {tr ? "Aktarılan veri: Anonimleştirilmiş metin sorguları (kimlik bilgisi içermez, yalnızca kelime/terim bazlı arama metni)" : "Data transferred: Anonymized text queries (no identity data, only keyword/term-based search text)"}<br />
              {tr ? "Hukuki dayanak: Açık rızanız (KVKK Md.9/1)" : "Legal basis: Your explicit consent (KVKK Art.9/1)"}
            </li>
            <li>
              <strong>Iyzico Ödeme Hizmetleri A.Ş.</strong> ({tr ? "Türkiye yerleşik, PCI-DSS sertifikalı" : "Türkiye-based, PCI-DSS certified"})<br />
              {tr ? "Aktarım amacı: Premium abonelik ödemelerinin tahsili, abonelik yönetimi, iade işlemleri" : "Purpose of transfer: Collection of Premium subscription payments, subscription management, refund processing"}<br />
              {tr ? "Aktarılan veri: Ad-soyad, e-posta, kart bilgileri (DoctoPal'a dönmez), abonelik durumu, ödeme geçmişi" : "Data transferred: Full name, email, card information (not returned to DoctoPal), subscription status, payment history"}<br />
              {tr ? "Hukuki dayanak: Sözleşme ifası (KVKK Md.5/2-c)" : "Legal basis: Performance of contract (KVKK Art.5/2-c)"}<br />
              {tr ? "Yurt dışı aktarım: YOK. Iyzico Türkiye'de yerleşik bir kuruluştur; tüm ödeme verileri Türkiye sınırları içinde işlenir." : "Cross-border transfer: NONE. Iyzico is established in Türkiye; all payment data is processed within Türkiye."}
            </li>
          </ul>

          {/* SCC Note */}
          <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-200">
                <p className="font-semibold mb-1">{tr ? "Önemli Bilgilendirme (KVKK Md.9 Uyumu)" : "Important Notice (KVKK Art.9 Compliance)"}</p>
                <p>
                  {tr
                    ? "Yurt dışı veri aktarımlarının hukuki dayanağı şu an KVKK Md.9/1 kapsamındaki açık rızanızdır. Standart Sözleşme (SCC) imzalama süreci, şirket tescili tamamlandıktan sonra Anthropic, Google ve Supabase ile yürütülecek; imzalama tarihinden itibaren 5 iş günü içinde KVKK Kurulu'na bildirilecektir. Bu süreç tamamlanana kadar açık rıza tek başına hukuki dayanak oluşturmaktadır."
                    : "The legal basis for international data transfers is currently your explicit consent under KVKK Art.9/1. Standard Contractual Clauses (SCC) signing process will be conducted with Anthropic, Google, and Supabase after company registration is complete; the KVKK Board will be notified within 5 business days of signing. Until this process is complete, explicit consent serves as the sole legal basis."}
                </p>
              </div>
            </div>
          </div>

          {/* Anonymization */}
          <p className="mt-3 text-muted-foreground">
            <strong>{tr ? "Anonimleştirme:" : "Anonymization:"}</strong>{" "}
            {tr
              ? "Yurt dışına aktarılan verilerde doğrudan kimlik bilgileri (ad, e-posta, TC kimlik no, telefon, adres, kullanıcı ID) sistemimiz tarafından otomatik olarak kaldırılır. Bu işlem KVKK Üretken Yapay Zeka Rehberi (Kasım 2025) uyarınca gerçekleştirilir ve loglanır."
              : "Direct identity information (name, email, national ID, phone, address, user ID) is automatically removed by our system from data transferred abroad. This process is carried out in accordance with the KVKK Generative AI Guide (November 2025) and is logged."}
          </p>
        </section>

        {/* §6 Saklama Süreleri */}
        <section>
          <h2 className="text-base font-bold">{tr ? "6. Saklama Süreleri" : "6. Retention Periods"}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-muted-foreground border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">{tr ? "Veri Kategorisi" : "Data Category"}</th>
                  <th className="text-left py-2 font-semibold text-foreground">{tr ? "Saklama Süresi" : "Retention Period"}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 pr-4">{tr ? "Kimlik bilgileri (ad, e-posta)" : "Identity data (name, email)"}</td><td className="py-2">{tr ? "Hesap aktif olduğu sürece" : "While account is active"}</td></tr>
                <tr><td className="py-2 pr-4">{tr ? "Sağlık verisi" : "Health data"}</td><td className="py-2">{tr ? "Hesap aktif olduğu sürece" : "While account is active"}</td></tr>
                <tr><td className="py-2 pr-4">{tr ? "İletişim verisi" : "Contact data"}</td><td className="py-2">{tr ? "Hesap aktif olduğu sürece" : "While account is active"}</td></tr>
                <tr><td className="py-2 pr-4">{tr ? "AI sohbet geçmişi" : "AI chat history"}</td><td className="py-2">{tr ? "12 ay (otomatik silme)" : "12 months (auto-delete)"}</td></tr>
                <tr><td className="py-2 pr-4">{tr ? "Tıbbi görüntü/belge" : "Medical images/documents"}</td><td className="py-2">{tr ? "90 gün (ham görüntü silinir, sonuç metni saklanır)" : "90 days (raw image deleted, result text retained)"}</td></tr>
                <tr><td className="py-2 pr-4">{tr ? "Rıza ve onay audit logu" : "Consent audit log"}</td><td className="py-2">{tr ? "5 yıl (KVKK Md.12 — yasal zorunluluk)" : "5 years (KVKK Art.12 — legal obligation)"}</td></tr>
                <tr><td className="py-2 pr-4">{tr ? "IP adresi ve erişim logları" : "IP address and access logs"}</td><td className="py-2">{tr ? "2 yıl" : "2 years"}</td></tr>
                <tr><td className="py-2 pr-4">{tr ? "Ödeme verisi ve faturalar" : "Payment data and invoices"}</td><td className="py-2">{tr ? "10 yıl (Vergi Usul Kanunu Md.253 — yasal zorunluluk). Abonelik sona erdikten sonra bile bu süre boyunca muhafaza edilir." : "10 years (Tax Procedure Law Art.253 — legal obligation). Retained for this period even after subscription ends."}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-muted-foreground">
            {tr
              ? "Hesap silme talebi sonrası: Tüm kişisel veriler 30 gün içinde kalıcı olarak silinir. Audit log'ları yasal zorunluluk gereği 5 yıl süresince saklanır ancak kimlik bilgisi anonimleştirilir."
              : "After account deletion request: All personal data is permanently deleted within 30 days. Audit logs are retained for 5 years as legally required, but identity information is anonymized."}
          </p>
        </section>

        {/* §7 Haklar (KVKK Md.11) — TAM 9 HAK */}
        <section>
          <h2 className="text-base font-bold">{tr ? "7. Haklarınız (KVKK Md.11)" : "7. Your Rights (KVKK Art.11)"}</h2>
          <p className="text-muted-foreground mb-2">
            {tr ? "KVKK 6698 s.K. Md.11 uyarınca aşağıdaki haklara sahipsiniz:" : "Under KVKK Law No.6698 Art.11, you have the following rights:"}
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
            <li>{tr ? "Kişisel verilerinizin işlenip işlenmediğini öğrenme" : "Learn whether your personal data is being processed"}</li>
            <li>{tr ? "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme" : "If processed, request information about the processing"}</li>
            <li>{tr ? "Kişisel verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme" : "Learn the purpose of processing and whether data is used accordingly"}</li>
            <li>{tr ? "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme" : "Know the third parties to whom your data is transferred domestically or internationally"}</li>
            <li>{tr ? "Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme" : "Request correction if personal data is processed incompletely or inaccurately"}</li>
            <li>{tr ? "KVKK Md.7'de öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme" : "Request deletion or destruction of personal data under conditions set forth in KVKK Art.7"}</li>
            <li>{tr ? "5 ve 6 numaralı bentler uyarınca yapılan işlemlerin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme" : "Request that corrections, deletions, or destructions under items 5 and 6 be notified to third parties to whom your data was transferred"}</li>
            <li>{tr ? "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme (Md.11/1-g)" : "Object to outcomes arising from exclusively automated analysis of processed data (Art.11/1-g)"}</li>
            <li>{tr ? "Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme" : "Claim compensation for damages due to unlawful processing of personal data"}</li>
          </ol>

          {/* Md.11/1-g Special Info */}
          <div className="mt-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-4">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
              {tr ? "Otomatik Karar Alma — Md.11/1-g Özel Bilgilendirme" : "Automated Decision Making — Art.11/1-g Special Notice"}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {tr
                ? "DoctoPal'ın AI sistemi sağlık verilerinizi otomatik olarak analiz eder ve bilgilendirme üretir. Bu bir tanı veya tedavi kararı değildir. Her AI yanıtının altında \"İtiraz Et\" butonu ile söz konusu otomatik değerlendirmeye itiraz edebilirsiniz. İtirazlarınız kayıt altına alınır ve insan incelemesine tabi tutulur."
                : "DoctoPal's AI system automatically analyzes your health data and generates informational content. This is not a diagnosis or treatment decision. You can object to any automated assessment using the \"Object\" button below each AI response. Your objections are recorded and subject to human review."}
            </p>
          </div>
        </section>

        {/* §8 Başvuru Prosedürü */}
        <section>
          <h2 className="text-base font-bold">{tr ? "8. Başvuru Prosedürü" : "8. Application Procedure"}</h2>
          {tr ? (
            <div className="space-y-2 text-muted-foreground">
              <p>KVKK Md.13 uyarınca haklarınızı kullanmak için:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>E-posta:</strong> info@doctopal.com adresine başvurunuzu iletiniz</li>
                <li><strong>Kimlik doğrulama:</strong> T.C. kimlik kartı fotokopisi veya e-devlet üzerinden alınacak nüfus kaydı örneği talep edilebilir</li>
                <li><strong>Süre:</strong> Başvurunuz 30 gün içinde ÜCRETSİZ sonuçlandırılır</li>
                <li><strong>VERBİS:</strong> Şirket tescili sonrası Veri Sorumluları Sicili kaydı yapılacaktır</li>
              </ul>
              <p className="mt-2"><strong>KVKK Kurulu'na Şikayet:</strong> Başvurunuza verdiğimiz yanıt yeterli değilse veya 30 gün içinde yanıt verilmezse KVKK Kurulu'na şikayette bulunabilirsiniz:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Web: kvkk.gov.tr</li>
                <li>Telefon: ALO 198</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-2 text-muted-foreground">
              <p>To exercise your rights under KVKK Art.13:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Email:</strong> Send your request to info@doctopal.com</li>
                <li><strong>Identity verification:</strong> A copy of national ID or e-government population record may be requested</li>
                <li><strong>Timeline:</strong> Your request will be resolved FREE OF CHARGE within 30 days</li>
                <li><strong>VERBIS:</strong> Data Controllers Registry registration will be completed after company incorporation</li>
              </ul>
              <p className="mt-2"><strong>Filing a complaint with the KVKK Board:</strong> If our response is insufficient or if we fail to respond within 30 days, you can file a complaint:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Web: kvkk.gov.tr</li>
                <li>Phone: ALO 198</li>
              </ul>
            </div>
          )}
        </section>

        {/* §9 Yaş Sınırı */}
        <section>
          <h2 className="text-base font-bold">{tr ? "9. Kullanıcı Yaş Sınırı" : "9. User Age Restriction"}</h2>
          <p className="text-muted-foreground">
            {tr
              ? "DoctoPal 18 yaşından büyük kullanıcılar için tasarlanmıştır. Kullanıcı, hizmeti kullanarak 18 yaşından büyük olduğunu beyan ve taahhüt eder. 18 yaş altı kullanıcıların hesap açması durumunda, tespit edilmesi halinde hesap kapatılır ve veriler silinir."
              : "DoctoPal is designed for users aged 18 and over. By using the service, the user declares and undertakes that they are over 18 years of age. If an account is opened by a user under 18, the account will be closed and data deleted upon detection."}
          </p>
        </section>

        {/* §10 Güvenlik Önlemleri */}
        <section>
          <h2 className="text-base font-bold">{tr ? "10. Güvenlik Önlemleri (KVKK Md.12)" : "10. Security Measures (KVKK Art.12)"}</h2>
          {tr ? (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Supabase Row-Level Security (RLS) ile veri izolasyonu</li>
              <li>TLS/HTTPS şifrelemeli iletişim</li>
              <li>Encryption at rest (Supabase altyapısı)</li>
              <li>AI API'ye gönderilmeden önce otomatik kimlik anonimleştirme</li>
              <li>Prompt injection koruması</li>
              <li>Rate limiting</li>
              <li>Audit log (KVKK Md.12)</li>
              <li>72 saat ihlal bildirim planı</li>
              <li>9 katmanlı güvenlik mimarisi</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Supabase Row-Level Security (RLS) for data isolation</li>
              <li>TLS/HTTPS encrypted communication</li>
              <li>Encryption at rest (Supabase infrastructure)</li>
              <li>Automatic identity anonymization before AI API calls</li>
              <li>Prompt injection protection</li>
              <li>Rate limiting</li>
              <li>Audit logging (KVKK Art.12)</li>
              <li>72-hour breach notification plan</li>
              <li>9-layer security architecture</li>
            </ul>
          )}
        </section>

        {/* §11 Değişiklik Tarihçesi — v2.1 yeni */}
        <section>
          <h2 className="text-base font-bold">{tr ? "11. Değişiklik Tarihçesi" : "11. Change History"}</h2>
          {tr ? (
            <div className="space-y-3 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">v2.2 — Nisan 2026</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Aile Sağlık Öyküsü (§2-b2) ayrı alt-kategori olarak explicit eklendi (<code>family_history_entries</code> tablosu)</li>
                  <li>Birinci/ikinci derece akraba sağlık öyküsü için metadata seviyesi saklama ilkesi netleştirildi (detaylı ilaç/profil tutulmaz)</li>
                  <li>Kalıtsal risk değerlendirmesi ve genetik tarama önerisi işleme amacı kapsamında açıklandı</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">v2.1 — Nisan 2026</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Finansal Veri kategorisi eklendi (Premium abonelik için)</li>
                  <li>Iyzico Ödeme Hizmetleri A.Ş. aktarıcı olarak eklendi</li>
                  <li>Ödeme verisi saklama süresi (10 yıl, VUK Md.253) eklendi</li>
                  <li>Premium abonelik işleme amacı eklendi</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">v2.0 — Nisan 2026</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>İlk yayın</li>
                  <li>10 bölüm, KVKK Md.10 uyumlu</li>
                  <li>4 ana veri kategorisi, 3 aktarıcı (Supabase, Anthropic, Google)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">v2.2 — April 2026</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Family Health History (§2-b2) explicitly added as a separate sub-category (<code>family_history_entries</code> table)</li>
                  <li>Metadata-level retention principle clarified for first/second-degree relative health history (no detailed medications/profile kept for third parties)</li>
                  <li>Hereditary risk assessment and genetic screening recommendations explicitly covered under processing purposes</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">v2.1 — April 2026</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Financial Data category added (for Premium subscription)</li>
                  <li>Iyzico Ödeme Hizmetleri A.Ş. added as a transferee</li>
                  <li>Payment data retention period (10 years, Tax Procedure Law Art.253) added</li>
                  <li>Premium subscription processing purpose added</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">v2.0 — April 2026</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Initial publication</li>
                  <li>10 sections, compliant with KVKK Art.10</li>
                  <li>4 main data categories, 3 transferees (Supabase, Anthropic, Google)</li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t space-y-2">
        <p className="text-xs text-muted-foreground">
          {tr
            ? "Bu metin KVKK Md.10 ve KVKK Kurulu 2026/347 sayılı İlke Kararı uyarınca hazırlanmıştır. Açık rızanız bu metinden AYRI olarak, her işleme amacı için AYRI AYRI alınır."
            : "This notice is prepared in accordance with KVKK Art.10 and KVKK Board Decision No.2026/347. Your explicit consent is collected SEPARATELY from this notice, for each processing purpose INDIVIDUALLY."}
        </p>
        <p className="text-xs text-muted-foreground">
          {tr ? "Aydınlatma metni versiyon: v2.2 · Son güncelleme: Nisan 2026" : "Privacy notice version: v2.2 · Last updated: April 2026"}
        </p>
        <Link href="/privacy-controls" className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-primary hover:underline">
          {tr ? "Rıza ayarlarına git →" : "Go to consent settings →"}
        </Link>
      </div>
    </div>
  );
}
