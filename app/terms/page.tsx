"use client"

import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

export default function TermsPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
      {/* Header */}
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="font-heading text-4xl font-bold italic tracking-tight">
          {tx("legal.termsTitle", lang)}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {tx("legal.lastUpdated", lang)}: 18 {isTr ? "Mart" : "March"} 2026
        </p>
      </div>

      <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        {/* 1 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "1. Kabul" : "1. Acceptance of Terms"}
          </h2>
          <p>
            {isTr
              ? "Phytotherapy.ai Platformunu (\"Platform\") kullanarak bu Kullanım Koşullarını ve Gizlilik Politikamızı okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Kabul etmiyorsanız Platformu kullanmayınız."
              : "By using the Phytotherapy.ai Platform (\"Platform\"), you acknowledge that you have read, understood, and agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the Platform."}
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "2. Hizmet Tanımı" : "2. Service Description"}
          </h2>
          <p>
            {isTr
              ? "Phytotherapy.ai, yayımlanmış bilimsel araştırmalara dayalı genel sağlık bilgisi sunan bir eğitim ve karar destek aracıdır. Hizmetlerimiz:"
              : "Phytotherapy.ai is an educational decision-support tool that provides general health information based on published scientific research. Our services include:"}
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>{isTr ? "İlaç-bitki etkileşim bilgi sistemi" : "Drug-herb interaction information system"}</li>
            <li>{isTr ? "Kanıta dayalı genel sağlık bilgi asistanı" : "Evidence-based general health information assistant"}</li>
            <li>{isTr ? "Kan tahlili değerlerinin bilgilendirici yorumu" : "Informational interpretation of blood test values"}</li>
            <li>{isTr ? "Bilgilendirici yaşam tarzı önerileri" : "Informational lifestyle suggestions"}</li>
          </ul>
        </section>

        {/* 3 — CRITICAL */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "3. Tıbbi Sorumluluk Reddi" : "3. Medical Disclaimer"}
          </h2>
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-6">
            <p className="mb-4 font-heading text-lg font-semibold text-amber-400">
              {isTr
                ? "Lütfen dikkatle okuyunuz"
                : "Please read carefully"}
            </p>
            <p className="mb-4 leading-relaxed">
              {isTr
                ? "Phytotherapy.ai bir sağlık bilgi platformudur. Tıbbi bir cihaz, teşhis aracı veya tedavi sistemi değildir. Platform hiçbir koşulda hastalık teşhisi koymaz, tedavi planı önermez veya ilaç reçetesi yazmaz."
                : "Phytotherapy.ai is a health information platform. It is not a medical device, diagnostic tool, or treatment system. The Platform does not diagnose conditions, suggest treatment plans, or prescribe medications under any circumstances."}
            </p>
            <p className="mb-4 leading-relaxed">
              {isTr
                ? "Sunulan tüm içerik, yayımlanmış bilimsel kaynaklara dayalı genel bilgilendirme niteliğindedir ve doktor, eczacı, diyetisyen veya herhangi bir sağlık profesyonelinin yerini almaz. Herhangi bir takviye kullanmaya başlamadan, ilaç değişikliği yapmadan veya sağlığınızla ilgili bir karar vermeden önce mutlaka sağlık profesyonelinize danışınız."
                : "All content is general informational material based on published scientific sources and does not replace the advice of a doctor, pharmacist, dietitian, or any healthcare professional. Always consult your healthcare provider before starting any supplement, making medication changes, or making decisions about your health."}
            </p>
            <p className="leading-relaxed">
              {isTr
                ? "Acil bir sağlık durumunda derhal bulunduğunuz ülkenin acil yardım hattını arayınız."
                : "In a medical emergency, immediately call your local emergency services number."}
            </p>
          </div>
          <p className="mt-5 leading-relaxed">
            {isTr
              ? "Platformun sunduğu bilgilere dayanarak verdiğiniz kararların sorumluluğu yalnızca size aittir. Platform, herhangi bir sağlık profesyoneli ile hasta arasındaki ilişkiyi kurmayı ya da bu ilişkinin yerine geçmeyi amaçlamamaktadır."
              : "You are solely responsible for any decisions you make based on information provided by the Platform. The Platform does not intend to create or replace the relationship between any healthcare professional and a patient."}
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "4. Kullanıcı Sorumlulukları" : "4. User Responsibilities"}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{isTr ? "Doğru ve güncel sağlık bilgileri sağlamalısınız; yanlış bilgiden doğan sonuçlar sizin sorumluluğunuzdadır" : "You must provide accurate and up-to-date health information; consequences of inaccurate information are your responsibility"}</li>
            <li>{isTr ? "İlaç listenizi düzenli olarak güncellemelisiniz" : "You must regularly update your medication list"}</li>
            <li>{isTr ? "Platformdan edinilen bilgileri uygulama kararı almadan önce sağlık profesyonelinize danışmalısınız" : "You must consult your healthcare provider before acting on information obtained from the Platform"}</li>
            <li>{isTr ? "18 yaşından büyük olmalısınız veya ebeveyn/yasal vasi gözetiminde kullanmalısınız" : "You must be 18 or older, or use under parental/legal guardian supervision"}</li>
            <li>{isTr ? "Hizmeti kötüye kullanmamalı, otomatik sorgulama yapmamalısınız" : "You must not misuse the service or perform automated queries"}</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "5. Bilgi Doğruluğu ve Sınırlamaları" : "5. Information Accuracy & Limitations"}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{isTr ? "Sunulan bilgiler halka açık bilimsel araştırma veritabanlarından (PubMed, NIH, WHO) elde edilmektedir" : "Information provided is sourced from publicly available scientific research databases (PubMed, NIH, WHO)"}</li>
            <li>{isTr ? "Yapay zeka modelleri hata yapabilir; her bilgi bağımsız doğrulama gerektirir" : "AI models may produce errors; all information requires independent verification"}</li>
            <li>{isTr ? "Bilimsel bilgi sürekli güncellenmektedir; Platform her zaman en güncel veriyi yansıtmayabilir" : "Scientific knowledge is continuously evolving; the Platform may not always reflect the most current data"}</li>
            <li>{isTr ? "İlaç-bitki etkileşim sonuçları bilgilendirme amaçlıdır, klinik karar yerine GEÇMEZ" : "Drug-herb interaction results are informational and do NOT substitute for clinical judgment"}</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "6. Sorumluluk Sınırlaması" : "6. Limitation of Liability"}
          </h2>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
            <p>
              {isTr
                ? "Phytotherapy.ai ve ekibi, Platformun sunduğu bilgilerin kullanımından kaynaklanan doğrudan, dolaylı, arızi, özel veya sonuç olarak ortaya çıkan hiçbir zarardan (sağlık sonuçları, mali kayıplar, veri kaybı dahil ancak bunlarla sınırlı olmaksızın) sorumlu tutulamaz. Tüm bilgiler \"olduğu gibi\" ve \"mevcut haliyle\" sunulur; açık veya zımni hiçbir garanti verilmemektedir."
                : "Phytotherapy.ai and its team shall not be liable for any direct, indirect, incidental, special, or consequential damages (including but not limited to health outcomes, financial losses, data loss) arising from the use of information provided by the Platform. All information is provided \"as is\" and \"as available\" without any express or implied warranties."}
            </p>
          </div>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "7. Fikri Mülkiyet" : "7. Intellectual Property"}
          </h2>
          <p>
            {isTr
              ? "Platformun tüm içeriği, tasarımı, logoları, yazılımı ve veritabanı yapıları fikri mülkiyet haklarıyla korunmaktadır. İzinsiz kopyalama, dağıtma, tersine mühendislik veya ticari kullanım yasaktır."
              : "All content, design, logos, software, and database structures of the Platform are protected by intellectual property rights. Unauthorized copying, distribution, reverse engineering, or commercial use is prohibited."}
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "8. Hizmet Kesintisi" : "8. Service Interruption"}
          </h2>
          <p>
            {isTr
              ? "Platform herhangi bir zamanda, önceden bildirimsiz olarak bakım, güncelleme veya teknik nedenlerle geçici ya da kalıcı olarak hizmet dışı kalabilir. Bu tür kesintilerden dolayı sorumluluk kabul edilmemektedir."
              : "The Platform may become temporarily or permanently unavailable at any time without prior notice due to maintenance, updates, or technical reasons. No liability is accepted for such interruptions."}
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "9. Hesap Feshi" : "9. Account Termination"}
          </h2>
          <p>
            {isTr
              ? "Kullanım koşullarının ihlali durumunda hesabınız önceden bildirim yapılmaksızın askıya alınabilir veya kapatılabilir. Hesabınızı istediğiniz zaman profil sayfanızdan silebilirsiniz."
              : "In case of violation of these terms, your account may be suspended or terminated without prior notice. You may delete your account at any time from your profile page."}
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "10. Değişiklikler" : "10. Modifications"}
          </h2>
          <p>
            {isTr
              ? "Bu koşullar güncellenebilir. Önemli değişiklikler kayıtlı e-posta adresinize bildirilecektir. Platformu kullanmaya devam etmeniz güncellenmiş koşulları kabul ettiğiniz anlamına gelir."
              : "These terms may be updated. Significant changes will be communicated to your registered email address. Continued use of the Platform constitutes acceptance of the updated terms."}
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "11. Uygulanacak Hukuk" : "11. Governing Law"}
          </h2>
          <p>
            {isTr
              ? "Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlık halinde İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir."
              : "These terms are governed by the laws of the Republic of Turkey. In case of disputes, Istanbul (Çağlayan) Courts and Enforcement Offices shall have jurisdiction."}
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {isTr ? "12. İletişim" : "12. Contact"}
          </h2>
          <p>
            {isTr
              ? "Sorularınız ve talepleriniz için:"
              : "For questions and inquiries:"}
          </p>
          <p className="mt-2 font-heading text-lg font-medium text-foreground">legal@phytotherapy.ai</p>
        </section>
      </div>
    </div>
  )
}
