// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

export default function PrivacyPolicyPage() {
  const { lang } = useLang() as { lang: "en" | "tr" }

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
      {/* Header */}
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="font-heading text-4xl font-bold italic tracking-tight">
          {tx("legal.privacyTitle", lang)}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {tx("legal.lastUpdated", lang)}: 18 {tx("privacy.march", lang)} 2026
        </p>
      </div>

      <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        {/* 1 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s1Title", lang)}
          </h2>
          <p>
            {tx("privacy.s1Text", lang)}
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s2Title", lang)}
          </h2>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{tx("privacy.s2DirectLabel", lang)}</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{tx("privacy.s2d1", lang)}</li>
              <li>{tx("privacy.s2d2", lang)}</li>
              <li>{tx("privacy.s2d3", lang)}</li>
              <li>{tx("privacy.s2d4", lang)}</li>
            </ul>
            <p className="mt-4 font-medium text-foreground">{tx("privacy.s2AutoLabel", lang)}</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{tx("privacy.s2a1", lang)}</li>
              <li>{tx("privacy.s2a2", lang)}</li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s3Title", lang)}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{tx("privacy.s3i1", lang)}</li>
            <li>{tx("privacy.s3i2", lang)}</li>
            <li>{tx("privacy.s3i3", lang)}</li>
            <li>{tx("privacy.s3i4", lang)}</li>
            <li>{tx("privacy.s3i5", lang)}</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s4Title", lang)}
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{tx("privacy.s4i1", lang)}</li>
            <li>{tx("privacy.s4i2", lang)}</li>
            <li>{tx("privacy.s4i3", lang)}</li>
            <li>{tx("privacy.s4i4", lang)}</li>
            <li>{tx("privacy.s4i5", lang)}</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s5Title", lang)}
          </h2>
          <p className="mb-3">
            {tx("privacy.s5Intro", lang)}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><span className="font-medium text-foreground">{tx("privacy.s5Access", lang)}</span> {tx("privacy.s5AccessDesc", lang)}</li>
            <li><span className="font-medium text-foreground">{tx("privacy.s5Rectification", lang)}</span> {tx("privacy.s5RectificationDesc", lang)}</li>
            <li><span className="font-medium text-foreground">{tx("privacy.s5Erasure", lang)}</span> {tx("privacy.s5ErasureDesc", lang)}</li>
            <li><span className="font-medium text-foreground">{tx("privacy.s5Portability", lang)}</span> {tx("privacy.s5PortabilityDesc", lang)}</li>
            <li><span className="font-medium text-foreground">{tx("privacy.s5Objection", lang)}</span> {tx("privacy.s5ObjectionDesc", lang)}</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s6Title", lang)}
          </h2>
          <p className="mb-3">
            {tx("privacy.s6Intro", lang)}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{tx("privacy.s6i1", lang)}</li>
            <li>{tx("privacy.s6i2", lang)}</li>
            <li>{tx("privacy.s6i3", lang)}</li>
            <li>{tx("privacy.s6i4", lang)}</li>
            <li>{tx("privacy.s6i5", lang)}</li>
          </ul>
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="font-medium text-foreground">
              {tx("privacy.s6NoSale", lang)}
            </p>
          </div>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s7Title", lang)}
          </h2>
          <p>
            {tx("privacy.s7Text", lang)}
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s8Title", lang)}
          </h2>
          <p>
            {tx("privacy.s8Text", lang)}
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s9Title", lang)}
          </h2>
          <p>
            {tx("privacy.s9Text", lang)}
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacy.s10Title", lang)}
          </h2>
          <p>
            {tx("privacy.s10Text", lang)}
          </p>
          <p className="mt-2 font-heading text-lg font-medium text-foreground">privacy@doctopal.com</p>
        </section>

        {/* KVKK Rights (MADDE 11) */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacyPage.kvkkRightsTitle", lang)}
          </h2>
          <p className="mb-3">
            {tx("privacyPage.kvkkRightsIntro", lang)}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            {lang === "tr" ? (
              <>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                <li>KVKK Md.7 kapsamında silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme veya silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </>
            ) : (
              <>
                <li>Learn whether your personal data is being processed</li>
                <li>Request information about processing if it has been processed</li>
                <li>Learn the purpose of processing and whether it is used accordingly</li>
                <li>Know third parties to whom data is transferred domestically or abroad</li>
                <li>Request correction if data is incomplete or inaccurately processed</li>
                <li>Request deletion or destruction under KVKK Art.7</li>
                <li>Request notification of corrections or deletions to third parties</li>
                <li>Object to outcomes arising from exclusively automated analysis of your data</li>
                <li>Claim compensation for damages caused by unlawful processing</li>
              </>
            )}
          </ul>
          <p className="mt-4 text-sm">
            <strong className="text-foreground">{tx("privacyPage.contactLabel", lang)}</strong>
            contact@doctopal.com
          </p>
          <p className="text-sm">
            <strong className="text-foreground">{tx("privacyPage.kvkkBoardLabel", lang)}</strong>
            kvkk.gov.tr | ALO 198
          </p>
        </section>

        {/* AI Data Processing */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacyPage.aiProcessingTitle", lang)}
          </h2>
          <p className="mb-3">
            {tx("privacyPage.aiProcessingIntro", lang)}
          </p>
          <p>
            {lang === "tr" ? (
              <>
                AI analizi için verileriniz anonimleştirilerek (kimlik bilgileri çıkarılarak) işlenmektedir. Anonimleştirme detayları için{" "}
                <a href="/security" className="text-primary underline">Güvenlik sayfamızı</a> ziyaret edin.
              </>
            ) : (
              <>
                For AI analysis, your data is anonymized (identity information removed). See our{" "}
                <a href="/security" className="text-primary underline">Security page</a> for anonymization details.
              </>
            )}
          </p>
        </section>

        {/* Data Retention Table */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacyPage.retentionTitle", lang)}
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {tx("privacyPage.retentionCategory", lang)}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {tx("privacyPage.retentionPeriod", lang)}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {tx("privacyPage.retentionAfter", lang)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(lang === "tr" ? [
                  ["Hesap bilgileri (ad, e-posta)", "Hesap aktif olduğu sürece", "Hesap silinince kalıcı silme"],
                  ["Sağlık verileri (ilaçlar, alerjiler, kronik hastalıklar)", "Hesap aktif olduğu sürece", "Hesap silinince kalıcı silme"],
                  ["AI chat geçmişi", "12 ay", "Otomatik silme"],
                  ["Rıza kayıtları", "5 yıl (yasal zorunluluk)", "Otomatik anonimleştirme"],
                  ["Erişim logları", "2 yıl", "Otomatik silme"],
                  ["Pasif hesaplar", "Son giriş + 2 yıl", "Otomatik anonimleştirme"],
                  ["AI API'ye gönderilen anonimleştirilmiş veri", "Geri alınamaz", "Kimlik bilgisi içermez"],
                ] : [
                  ["Account info (name, email)", "While account is active", "Permanent deletion on account closure"],
                  ["Health data (medications, allergies, chronic conditions)", "While account is active", "Permanent deletion on account closure"],
                  ["AI chat history", "12 months", "Automatic deletion"],
                  ["Consent records", "5 years (legal requirement)", "Automatic anonymization"],
                  ["Access logs", "2 years", "Automatic deletion"],
                  ["Inactive accounts", "Last login + 2 years", "Automatic anonymization"],
                  ["Anonymized data sent to AI API", "Non-retrievable", "Contains no identity information"],
                ]).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-3 font-medium text-foreground">{row[0]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {tx("privacyPage.retentionNote", lang)}
          </p>
        </section>

        {/* Consent Withdrawal */}
        <section>
          <h2 className="mb-3 font-heading text-2xl font-semibold italic text-foreground">
            {tx("privacyPage.consentWithdrawalTitle", lang)}
          </h2>
          <p className="mb-3">
            {tx("privacyPage.consentWithdrawalIntro", lang)}
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            {lang === "tr" ? (
              <>
                <li>Profil &gt; Gizlilik Ayarları&apos;ndan rıza checkbox&apos;larını kaldırabilirsiniz</li>
                <li>Rızanızı geri çektiğinizde ilgili veri işleme faaliyeti derhal durdurulur</li>
                <li>Temel hizmetler (ilaç takibi, takvim) rızadan bağımsız çalışmaya devam eder</li>
              </>
            ) : (
              <>
                <li>Remove consent checkboxes from Profile &gt; Privacy Settings</li>
                <li>Related data processing stops immediately upon withdrawal</li>
                <li>Basic services (medication tracking, calendar) continue to work regardless of consent</li>
              </>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}
