// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.10 Aydınlatma Metni — Açık rıza formundan AYRI sunulmalıdır (KVKK 2026/347 İlke Kararı)
"use client";

import { useLang } from "@/components/layout/language-toggle";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AydinlatmaPage() {
  const { lang } = useLang();
  const tr = lang === "tr";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      {/* Back link */}
      <Link
        href="/privacy-controls"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
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
            {tr ? "KVKK Md.10 kapsamında aydınlatma yükümlülüğü" : "Disclosure obligation under KVKK Art. 10"}
          </p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">

        {/* 1. Veri Sorumlusunun Kimliği */}
        <section>
          <h2 className="text-base font-bold">
            {tr ? "1. Veri Sorumlusunun Kimliği" : "1. Identity of the Data Controller"}
          </h2>
          {tr ? (
            <p>
              <strong>Unvan:</strong> DoctoPal (şirket kurulum aşamasındadır; ticaret unvanı, MERSİS numarası ve KEP adresi şirket tescili tamamlandığında güncellenecektir.)<br />
              <strong>Web sitesi:</strong> doctopal.com<br />
              <strong>İletişim:</strong> info@doctopal.com
            </p>
          ) : (
            <p>
              <strong>Title:</strong> DoctoPal (company registration is in progress; trade name, MERSIS number, and KEP address will be updated upon incorporation.)<br />
              <strong>Website:</strong> doctopal.com<br />
              <strong>Contact:</strong> info@doctopal.com
            </p>
          )}
        </section>

        {/* 2. İşlenen Kişisel Veri Kategorileri */}
        <section>
          <h2 className="text-base font-bold">
            {tr ? "2. İşlenen Kişisel Veri Kategorileri" : "2. Categories of Personal Data Processed"}
          </h2>
          {tr ? (
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Kimlik verisi:</strong> Ad, soyad, e-posta adresi</li>
              <li><strong>Sağlık verisi (özel nitelikli):</strong> İlaçlar, alerjiler, kronik hastalıklar, semptomlar, yaş, cinsiyet, boy, kilo, kan grubu, kan tahlili sonuçları, aşı durumu, sigara/alkol kullanımı</li>
              <li><strong>İletişim verisi:</strong> Telefon numarası (opsiyonel)</li>
              <li><strong>İşlem verisi:</strong> AI sohbet geçmişi, etkileşim kontrol sonuçları, SBAR raporu içeriği</li>
              <li><strong>Teknik veri:</strong> IP adresi, tarayıcı bilgisi (yalnızca güvenlik amaçlı)</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Identity data:</strong> Name, surname, email address</li>
              <li><strong>Health data (special category):</strong> Medications, allergies, chronic conditions, symptoms, age, gender, height, weight, blood type, blood test results, vaccination status, smoking/alcohol use</li>
              <li><strong>Contact data:</strong> Phone number (optional)</li>
              <li><strong>Transaction data:</strong> AI chat history, interaction check results, SBAR report content</li>
              <li><strong>Technical data:</strong> IP address, browser info (security purposes only)</li>
            </ul>
          )}
        </section>

        {/* 3. İşleme Amaçları */}
        <section>
          <h2 className="text-base font-bold">
            {tr ? "3. Kişisel Verilerin İşlenme Amaçları" : "3. Purposes of Data Processing"}
          </h2>
          {tr ? (
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>AI destekli sağlık bilgilendirme:</strong> Yapay zeka sistemi (Anthropic Claude) aracılığıyla kişiselleştirilmiş, kanıta dayalı sağlık bilgilendirmesi sunulması</li>
              <li><strong>Veri depolama:</strong> Sağlık verilerinizin Supabase (İrlanda, AB) sunucularında güvenli şekilde saklanması</li>
              <li><strong>SBAR raporu oluşturma:</strong> Doktor ziyaretinize hazırlık için yapılandırılmış sağlık ön raporu oluşturulması</li>
              <li><strong>İlaç etkileşim kontrolü:</strong> İlaç-bitki etkileşimlerinin analiz edilmesi ve güvenlik uyarılarının sağlanması</li>
              <li><strong>Sağlık takibi:</strong> İlaç takibi, takvim, günlük sağlık kaydı gibi temel hizmetlerin sunulması</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>AI-powered health information:</strong> Providing personalized, evidence-based health information through the AI system (Anthropic Claude)</li>
              <li><strong>Data storage:</strong> Secure storage of your health data on Supabase servers (Ireland, EU)</li>
              <li><strong>SBAR report generation:</strong> Creating structured health pre-visit reports for doctor appointments</li>
              <li><strong>Drug interaction checking:</strong> Analyzing drug–herb interactions and providing safety warnings</li>
              <li><strong>Health tracking:</strong> Providing basic services such as medication tracking, calendar, and daily health logs</li>
            </ul>
          )}
        </section>

        {/* 4. Aktarılan Taraflar */}
        <section>
          <h2 className="text-base font-bold">
            {tr ? "4. Verilerin Aktarıldığı Taraflar" : "4. Parties to Whom Data Is Transferred"}
          </h2>
          {tr ? (
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase Inc.</strong> (İrlanda, AB) — Veri depolama ve veritabanı yönetimi. SCC imzalanmıştır.</li>
              <li><strong>Anthropic PBC</strong> (ABD) — Yapay zeka analizi. Yalnızca anonimleştirilmiş veriler gönderilir (isim, e-posta, TC no, telefon, adres, kullanıcı kimliği GÖNDERİLMEZ). SCC imzalanmıştır.</li>
              <li><strong>Google LLC</strong> (ABD) — Metin gömme (embedding) için Gemini API. Anonimleştirilmiş veri.</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase Inc.</strong> (Ireland, EU) — Data storage and database management. SCC signed.</li>
              <li><strong>Anthropic PBC</strong> (USA) — AI analysis. Only anonymized data is sent (name, email, national ID, phone, address, user ID are NEVER sent). SCC signed.</li>
              <li><strong>Google LLC</strong> (USA) — Gemini API for text embedding. Anonymized data only.</li>
            </ul>
          )}
        </section>

        {/* 5. İlgili Kişinin Hakları */}
        <section>
          <h2 className="text-base font-bold">
            {tr ? "5. İlgili Kişinin Hakları (KVKK Md.11)" : "5. Data Subject Rights (KVKK Art. 11)"}
          </h2>
          {tr ? (
            <ul className="list-disc pl-5 space-y-1">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
              <li>KVKK Md.7 kapsamında silinmesini veya yok edilmesini isteme</li>
              <li>Düzeltme, silme veya yok etme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı işlenmesi sebebiyle zarara uğranması halinde zararın giderilmesini talep etme</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              <li>Learn whether your personal data is processed</li>
              <li>Request information if data has been processed</li>
              <li>Learn the purpose of processing and whether data is used accordingly</li>
              <li>Know the third parties to whom data is transferred domestically or internationally</li>
              <li>Request correction of incomplete or inaccurately processed data</li>
              <li>Request deletion or destruction under KVKK Art. 7</li>
              <li>Request notification of correction, deletion, or destruction to third parties</li>
              <li>Object to outcomes arising from exclusively automated analysis of processed data</li>
              <li>Claim compensation for damages due to unlawful processing</li>
            </ul>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {tr
              ? "Haklarınızı kullanmak için: info@doctopal.com adresine başvurabilir veya uygulama içi 'Veri Talebi' formunu kullanabilirsiniz."
              : "To exercise your rights: contact info@doctopal.com or use the in-app 'Data Request' form."}
          </p>
        </section>

        {/* 6. Saklama Süresi */}
        <section>
          <h2 className="text-base font-bold">
            {tr ? "6. Saklama Süresi" : "6. Retention Period"}
          </h2>
          <p>
            {tr
              ? "Kişisel verileriniz hesabınız aktif olduğu sürece saklanır. Hesap silme talebiniz üzerine tüm verileriniz 30 gün içinde geri döndürülemez şekilde silinir. AI API'ye gönderilen anonimleştirilmiş veriler Anthropic tarafından saklanmaz (sıfır veri tutma politikası)."
              : "Your personal data is stored as long as your account is active. Upon account deletion request, all your data is irreversibly deleted within 30 days. Anonymized data sent to the AI API is not retained by Anthropic (zero data retention policy)."}
          </p>
        </section>

        {/* 7. Hukuki Dayanak */}
        <section>
          <h2 className="text-base font-bold">
            {tr ? "7. Hukuki Dayanak" : "7. Legal Basis"}
          </h2>
          <p>
            {tr
              ? "Sağlık verileriniz 'özel nitelikli kişisel veri' kapsamındadır (KVKK Md.6). Bu verilerin işlenmesi yalnızca açık rızanız ile mümkündür. Açık rızanızı istediğiniz zaman geri çekebilirsiniz; bu durumda ilgili AI özellikleri devre dışı kalır ancak temel hizmetler (ilaç takibi, takvim, aile profili) çalışmaya devam eder."
              : "Your health data falls under 'special category personal data' (KVKK Art. 6). Processing of this data is only possible with your explicit consent. You can withdraw your consent at any time; in that case, related AI features will be disabled but basic services (medication tracking, calendar, family profiles) will continue to work."}
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t">
        <p className="text-xs text-muted-foreground">
          {tr
            ? "Bu aydınlatma metni KVKK Md.10 ve KVKK Kurulu 2026/347 sayılı İlke Kararı uyarınca hazırlanmıştır. Son güncelleme: Nisan 2026."
            : "This privacy notice is prepared in accordance with KVKK Art. 10 and KVKK Board Decision No. 2026/347. Last updated: April 2026."}
        </p>
        <Link
          href="/privacy-controls"
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
        >
          {tr ? "Rıza ayarlarına git →" : "Go to consent settings →"}
        </Link>
      </div>
    </div>
  );
}
