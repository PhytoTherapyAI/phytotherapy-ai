// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

export default function TermsPage() {
  const { lang } = useLang()

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
      {/* Header */}
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="font-heading text-4xl font-bold italic tracking-tight">
          {tx("legal.termsTitle", lang)}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {tx("legal.lastUpdated", lang)}: 18 {tx("terms.month", lang)} 2026
        </p>
      </div>

      <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        {/* 1 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.acceptance", lang)}
          </h2>
          <p>
            {tx("terms.acceptanceText", lang)}
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.serviceDesc", lang)}
          </h2>
          <p>
            {tx("terms.serviceDescText", lang)}
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>{tx("terms.serviceItem1", lang)}</li>
            <li>{tx("terms.serviceItem2", lang)}</li>
            <li>{tx("terms.serviceItem3", lang)}</li>
            <li>{tx("terms.serviceItem4", lang)}</li>
          </ul>
        </section>

        {/* 3 — CRITICAL */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.medicalDisclaimer", lang)}
          </h2>
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-6">
            <p className="mb-4 font-heading text-lg font-semibold text-amber-400">
              {tx("terms.readCarefully", lang)}
            </p>
            <p className="mb-4 leading-relaxed">
              {tx("terms.disclaimerP1", lang)}
            </p>
            <p className="mb-4 leading-relaxed">
              {tx("terms.disclaimerP2", lang)}
            </p>
            <p className="leading-relaxed">
              {tx("terms.disclaimerP3", lang)}
            </p>
          </div>
          <p className="mt-5 leading-relaxed">
            {tx("terms.disclaimerP4", lang)}
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.userResponsibilities", lang)}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{tx("terms.userResp1", lang)}</li>
            <li>{tx("terms.userResp2", lang)}</li>
            <li>{tx("terms.userResp3", lang)}</li>
            <li>{tx("terms.userResp4", lang)}</li>
            <li>{tx("terms.userResp5", lang)}</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.infoAccuracy", lang)}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{tx("terms.infoItem1", lang)}</li>
            <li>{tx("terms.infoItem2", lang)}</li>
            <li>{tx("terms.infoItem3", lang)}</li>
            <li>{tx("terms.infoItem4", lang)}</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.liability", lang)}
          </h2>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
            <p>
              {tx("terms.liabilityText", lang)}
            </p>
          </div>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.ip", lang)}
          </h2>
          <p>
            {tx("terms.ipText", lang)}
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.interruption", lang)}
          </h2>
          <p>
            {tx("terms.interruptionText", lang)}
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.termination", lang)}
          </h2>
          <p>
            {tx("terms.terminationText", lang)}
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.modifications", lang)}
          </h2>
          <p>
            {tx("terms.modificationsText", lang)}
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.governingLaw", lang)}
          </h2>
          <p>
            {tx("terms.governingLawText", lang)}
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("terms.contact", lang)}
          </h2>
          <p>
            {tx("terms.contactText", lang)}
          </p>
          <p className="mt-2 font-heading text-lg font-medium text-foreground">legal@doctopal.com</p>
        </section>

        {/* Service Definition (MADDE 13 — what DoctoPal is NOT) */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {lang === "tr" ? "Hizmet Tanımı" : "Service Definition"}
          </h2>
          <p className="mb-3">
            <strong className="text-foreground">
              {lang === "tr" ? "DoctoPal bir sağlık bilgilendirme aracıdır." : "DoctoPal is a health information tool."}
            </strong>
          </p>
          <p className="mb-3">{lang === "tr" ? "DoctoPal:" : "DoctoPal:"}</p>
          <ul className="list-disc space-y-1.5 pl-5 mb-4">
            {lang === "tr" ? (
              <>
                <li><strong className="text-foreground">Tıbbi cihaz DEĞİLDİR</strong> (TİTCK/MDR kapsamı dışındadır)</li>
                <li>Teşhis koymaz, tedavi önermez, klinik karar desteği sağlamaz</li>
                <li>Uzaktan sağlık hizmeti sunmaz, tele-tıp hizmeti vermez</li>
                <li>GETAT (Geleneksel ve Tamamlayıcı Tıp) uygulaması yapmaz</li>
                <li>Reçete yazmaz, ilaç dozajı belirlemez</li>
                <li>Profesyonel bir doktor tavsiyesinin yerini ALMAZ</li>
              </>
            ) : (
              <>
                <li><strong className="text-foreground">Is NOT a medical device</strong> (outside TİTCK/MDR scope)</li>
                <li>Does not diagnose, treat, or provide clinical decision support</li>
                <li>Does not provide remote healthcare or telemedicine services</li>
                <li>Does not practice GETAT (Traditional and Complementary Medicine)</li>
                <li>Does not write prescriptions or determine medication dosages</li>
                <li>Does NOT replace professional medical advice</li>
              </>
            )}
          </ul>
          <p className="mb-3">
            {lang === "tr"
              ? "DoctoPal'ın sunduğu bilgiler yalnızca bilimsel literatüre (PubMed, NIH) dayalı genel bilgilendirme amaçlıdır. Bitkisel ürünlerle ilgili bilgiler, GETAT uygulaması değil, bilimsel araştırma referanslarına dayalı bilgilendirmedir."
              : "Information provided by DoctoPal is for general informational purposes only, based on scientific literature (PubMed, NIH). Herbal information is based on scientific research references, not GETAT practice."}
          </p>
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4">
            <p className="text-sm font-medium text-foreground">
              {lang === "tr"
                ? "Herhangi bir sağlık kararı almadan önce mutlaka doktorunuza danışın. Acil durumlarda 112'yi arayın."
                : "Always consult your doctor before making any health decisions. For emergencies, call 112."}
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {lang === "tr" ? "Sorumluluk Sınırları" : "Limitation of Liability"}
          </h2>
          <p className="mb-3">
            {lang === "tr" ? "DoctoPal ve geliştiricileri:" : "DoctoPal and its developers:"}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            {lang === "tr" ? (
              <>
                <li>AI tarafından üretilen bilgilerin kullanımından kaynaklanan sağlık sonuçlarından sorumlu değildir</li>
                <li>Kullanıcının doktora danışmadan aldığı kararlardan sorumlu değildir</li>
                <li>AI yanıtlarının doğruluğunu garanti etmez — tüm bilgiler &quot;olduğu gibi&quot; sunulur</li>
                <li>Kullanıcının AI önerilerini tıbbi tavsiye olarak yorumlamasından sorumlu değildir</li>
              </>
            ) : (
              <>
                <li>Are not responsible for health outcomes resulting from use of AI-generated information</li>
                <li>Are not responsible for decisions made without consulting a doctor</li>
                <li>Do not guarantee accuracy of AI responses — all information is provided &quot;as is&quot;</li>
                <li>Are not responsible for users interpreting AI suggestions as medical advice</li>
              </>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}
