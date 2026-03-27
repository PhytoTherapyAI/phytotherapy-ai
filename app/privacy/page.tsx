"use client"

import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

export default function PrivacyPolicyPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
      {/* Header */}
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="font-heading text-4xl font-bold italic tracking-tight">
          {tx("legal.privacyTitle", lang)}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {tx("legal.lastUpdated", lang)}: 18 {isTr ? "Mart" : "March"} 2026
        </p>
      </div>

      <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        {/* 1 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "1. Giriş" : "1. Introduction"}
          </h2>
          <p>
            {isTr
              ? "Phytotherapy.ai (\"Platform\") gizliliğinize saygı duyar. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, işlendiğini, saklandığını ve korunduğunu açıklar. Platformu kullanarak bu politikayı kabul etmiş sayılırsınız."
              : "Phytotherapy.ai (\"Platform\") respects your privacy. This Privacy Policy explains how your personal data is collected, processed, stored, and protected. By using the Platform, you acknowledge and accept this policy."}
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "2. Topladığımız Veriler" : "2. Data We Collect"}
          </h2>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{isTr ? "Doğrudan sağladığınız veriler:" : "Data you directly provide:"}</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{isTr ? "Hesap bilgileri (ad, e-posta, yaş, cinsiyet)" : "Account information (name, email, age, gender)"}</li>
              <li>{isTr ? "Sağlık profili (ilaçlar, alerjiler, kronik hastalıklar, gebelik durumu)" : "Health profile (medications, allergies, chronic conditions, pregnancy status)"}</li>
              <li>{isTr ? "Sağlık sorguları ve sistem yanıtları" : "Health queries and system responses"}</li>
              <li>{isTr ? "Kan tahlili değerleri" : "Blood test values"}</li>
            </ul>
            <p className="mt-4 font-medium text-foreground">{isTr ? "Otomatik toplanan veriler:" : "Automatically collected data:"}</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{isTr ? "Teknik kullanım verileri (sayfa ziyaretleri, anonimleştirilmiş)" : "Technical usage data (page visits, anonymized)"}</li>
              <li>{isTr ? "Cihaz türü ve tarayıcı bilgisi (yalnızca sorun giderme amaçlı)" : "Device type and browser info (troubleshooting purposes only)"}</li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "3. Verilerin Kullanım Amacı" : "3. Purpose of Data Processing"}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{isTr ? "Kişiselleştirilmiş sağlık bilgisi sunmak" : "Provide personalized health information"}</li>
            <li>{isTr ? "İlaç-bitki etkileşim güvenlik kontrolleri gerçekleştirmek" : "Perform drug-herb interaction safety checks"}</li>
            <li>{isTr ? "Kan tahlili analizi ve yaşam koçluğu sağlamak" : "Deliver blood test analysis and lifestyle coaching"}</li>
            <li>{isTr ? "Profil bazlı güvenlik kontrolleri (alerji, gebelik, böbrek/karaciğer)" : "Profile-based safety checks (allergies, pregnancy, kidney/liver conditions)"}</li>
            <li>{isTr ? "Hizmet kalitesini iyileştirmek (yalnızca anonimleştirilmiş verilerle)" : "Improve service quality (anonymized data only)"}</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "4. Veri Saklama ve Güvenlik" : "4. Data Storage & Security"}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{isTr ? "Veriler endüstri standardı şifreleme ile korunur" : "Data is protected with industry-standard encryption"}</li>
            <li>{isTr ? "İletim sırasında TLS/SSL şifreleme uygulanır" : "TLS/SSL encryption applied during transmission"}</li>
            <li>{isTr ? "Satır düzeyinde erişim kontrolü (RLS) politikaları mevcuttur" : "Row-Level Security (RLS) access control policies are in place"}</li>
            <li>{isTr ? "Sunucu tarafı API anahtar yönetimi — istemci kodunda asla" : "Server-side API key management — never in client code"}</li>
            <li>{isTr ? "2 yıl hareketsizlik sonrası veriler otomatik olarak silinir" : "Data is automatically deleted after 2 years of inactivity"}</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "5. Haklarınız (KVKK / GDPR)" : "5. Your Rights (KVKK / GDPR)"}
          </h2>
          <p className="mb-3">
            {isTr
              ? "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Genel Veri Koruma Yönetmeliği (GDPR) kapsamında:"
              : "Under the Turkish Personal Data Protection Law (KVKK) and the General Data Protection Regulation (GDPR):"}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><span className="font-medium text-foreground">{isTr ? "Erişim:" : "Access:"}</span> {isTr ? "Profil sayfanızdan tüm verilerinizi indirebilirsiniz" : "Download all your data from your profile page"}</li>
            <li><span className="font-medium text-foreground">{isTr ? "Düzeltme:" : "Rectification:"}</span> {isTr ? "Bilgilerinizi istediğiniz zaman güncelleyebilirsiniz" : "Update your information at any time"}</li>
            <li><span className="font-medium text-foreground">{isTr ? "Silme:" : "Erasure:"}</span> {isTr ? "Hesabınızı ve tüm ilişkili verileri kalıcı olarak silebilirsiniz" : "Permanently delete your account and all associated data"}</li>
            <li><span className="font-medium text-foreground">{isTr ? "Taşınabilirlik:" : "Portability:"}</span> {isTr ? "Verilerinizi makine tarafından okunabilir formatta (JSON) indirebilirsiniz" : "Download your data in machine-readable format (JSON)"}</li>
            <li><span className="font-medium text-foreground">{isTr ? "İtiraz:" : "Objection:"}</span> {isTr ? "Veri işlemeye itiraz hakkınız saklıdır" : "You reserve the right to object to data processing"}</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "6. Veri İşleyen Üçüncü Taraflar" : "6. Third-Party Data Processors"}
          </h2>
          <p className="mb-3">
            {isTr
              ? "Hizmetlerimizi sunabilmek için aşağıdaki kategorilerde üçüncü taraf altyapı sağlayıcıları kullanmaktayız:"
              : "To deliver our services, we use third-party infrastructure providers in the following categories:"}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{isTr ? "Veritabanı ve kimlik doğrulama altyapısı" : "Database and authentication infrastructure"}</li>
            <li>{isTr ? "Yapay zeka analiz motoru (sorgular anonim olarak işlenir, kişisel veri iletilmez)" : "AI analysis engine (queries processed anonymously, no personal data transmitted)"}</li>
            <li>{isTr ? "Bilimsel araştırma veritabanları (halka açık kaynaklar)" : "Scientific research databases (publicly available sources)"}</li>
            <li>{isTr ? "İlaç güvenlik veritabanları (halka açık kaynaklar)" : "Drug safety databases (publicly available sources)"}</li>
            <li>{isTr ? "Web barındırma hizmeti" : "Web hosting service"}</li>
          </ul>
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="font-medium text-foreground">
              {isTr
                ? "Kişisel verileriniz hiçbir koşulda üçüncü taraflara satılmaz, kiralanmaz veya ticari amaçla paylaşılmaz."
                : "Your personal data is never sold, rented, or shared with third parties for commercial purposes under any circumstances."}
            </p>
          </div>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "7. Çerezler" : "7. Cookies"}
          </h2>
          <p>
            {isTr
              ? "Yalnızca oturum yönetimi ve kullanıcı tercihleri (tema, dil) için zorunlu çerezler kullanılmaktadır. Reklam, pazarlama veya takip amaçlı çerez kullanılmamaktadır."
              : "Only essential cookies are used for session management and user preferences (theme, language). No advertising, marketing, or tracking cookies are used."}
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "8. Veri İhlali Bildirimi" : "8. Data Breach Notification"}
          </h2>
          <p>
            {isTr
              ? "Olası bir veri ihlali durumunda, KVKK ve GDPR gerekliliklerine uygun olarak etkilenen kullanıcılar ve ilgili otoriteler en geç 72 saat içinde bilgilendirilecektir."
              : "In the event of a data breach, affected users and relevant authorities will be notified within 72 hours in accordance with KVKK and GDPR requirements."}
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "9. Değişiklikler" : "9. Changes to This Policy"}
          </h2>
          <p>
            {isTr
              ? "Bu politika güncellenebilir. Önemli değişiklikler kayıtlı e-posta adresinize bildirilecektir. Platformu kullanmaya devam etmeniz güncellenmiş politikayı kabul ettiğiniz anlamına gelir."
              : "This policy may be updated. Significant changes will be communicated to your registered email address. Continued use of the Platform constitutes acceptance of the updated policy."}
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "10. İletişim" : "10. Contact"}
          </h2>
          <p>
            {isTr
              ? "Gizlilik ile ilgili talepleriniz için:"
              : "For privacy-related inquiries:"}
          </p>
          <p className="mt-2 font-heading text-lg font-medium text-foreground">privacy@phytotherapy.ai</p>
        </section>
      </div>
    </div>
  )
}
