// © 2026 DoctoPal — All Rights Reserved
// Intended Purpose Statement — TİTCK / MDCG 2019-11 audit-ready documentation
"use client";

import { useLang } from "@/components/layout/language-toggle";
import { FileText, CheckCircle2, XCircle, Shield, Scale, Mail } from "lucide-react";
import Link from "next/link";

export default function IntendedPurposePage() {
  const { lang } = useLang();
  const tr = lang === "tr";

  const sections = tr ? [
    {
      icon: FileText,
      title: "1. Ürün Tanımı",
      body: (
        <p>
          DoctoPal, kullanıcılarına bilimsel literatüre (PubMed, NIH, Europe PMC) dayalı sağlık bilgilendirmesi sunan bir yapay zeka destekli web uygulamasıdır.
        </p>
      ),
    },
    {
      icon: CheckCircle2,
      title: "2. Kullanım Amacı (Intended Purpose)",
      body: (
        <>
          <p className="mb-3">DoctoPal&apos;ın kullanım amacı <strong>YALNIZCA sağlık bilgilendirmesidir</strong>:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>İlaç-bitki etkileşim bilgisi sunma (bilimsel kaynak referanslı)</li>
            <li>Genel sağlık bilgilendirmesi yapma</li>
            <li>Kullanıcının mevcut sağlık profilini düzenleme ve takip etme (ilaç listesi, alerji, kronik hastalık)</li>
            <li>Doktora götürülecek SBAR raporu oluşturma</li>
            <li>Bilimsel araştırma referanslarına dayalı bitkisel ürün bilgilendirmesi</li>
          </ul>
        </>
      ),
    },
    {
      icon: XCircle,
      title: "3. Kullanım Amacı DIŞINDA Kalan Faaliyetler",
      body: (
        <>
          <p className="mb-3">DoctoPal aşağıdaki faaliyetleri <strong>YAPMAZ</strong> ve yapması teknik olarak engellenmiştir:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hastalık teşhisi koyma</li>
            <li>Tedavi önerme veya tedavi planı oluşturma</li>
            <li>Reçete yazma veya ilaç dozajı belirleme</li>
            <li>Klinik karar desteği sağlama</li>
            <li>Uzaktan sağlık hizmeti (tele-tıp) sunma</li>
            <li>GETAT (Geleneksel ve Tamamlayıcı Tıp) uygulaması yapma</li>
            <li>Tıbbi görüntüleme yorumlama (kesin tanı amaçlı)</li>
            <li>Acil tıbbi müdahale önerme (112 yönlendirmesi hariç)</li>
          </ul>
        </>
      ),
    },
    {
      icon: Scale,
      title: "4. Tıbbi Cihaz Sınıflandırması",
      body: (
        <>
          <p className="mb-3">
            DoctoPal, Tıbbi Cihaz Yönetmeliği (02.06.2021, Resmi Gazete 31499 Mükerrer) Md.2/1 kapsamında <strong>tıbbi cihaz DEĞİLDİR</strong>. Gerekçe:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Yönetmeliğe göre tıbbi cihaz: &quot;teşhis, tedavi, önleme amacıyla tasarlanan&quot; üründür</li>
            <li>DoctoPal teşhis, tedavi veya önleme amacıyla tasarlanmamıştır</li>
            <li>MDCG 2019-11 rehberine göre: &quot;Üreticinin yazılımı kullanmadaki amacı sadece bilgilendirme ise tıbbi cihaz değildir&quot;</li>
            <li>DoctoPal&apos;ın intended purpose&apos;u bilgilendirmedir — klinik karar desteği değildir</li>
          </ul>
        </>
      ),
    },
    {
      icon: Shield,
      title: "5. Teknik Güvenlik Önlemleri",
      body: (
        <>
          <p className="mb-3">DoctoPal 9 katmanlı güvenlik mimarisi kullanır:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Acil durum tespiti ve 112 yönlendirmesi</li>
            <li>İlaç etkileşim motoru (OpenFDA + AI)</li>
            <li>Bilimsel kaynak doğrulama (PubMed RAG)</li>
            <li>Algoritmik güvenlik (kontrendikasyon, dozaj limitleri)</li>
            <li>KVKK prompt anonimleştirme (kimlik bilgisi AI&apos;a gönderilmez)</li>
            <li>Prompt injection koruması (jailbreak engeli)</li>
            <li>4 katmanlı output filtresi (teşhis → bilgilendirme, reçete → araştırma referansı)</li>
            <li>AI disclaimer + KVKK Md.11 itiraz mekanizması</li>
            <li>Aydınlatma/rıza ayrımı (KVKK 2026/347 İlke Kararı)</li>
          </ol>
        </>
      ),
    },
    {
      icon: Scale,
      title: "6. Yasal Uyum",
      body: (
        <>
          <p className="mb-3">DoctoPal aşağıdaki mevzuata uyumludur:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>KVKK (6698 s.K.) — Md.3, 5, 6, 7, 9, 10, 11, 12, 16</li>
            <li>KVKK 2026/347 İlke Kararı</li>
            <li>KVKK Üretken YZ Rehberi (Kasım 2025)</li>
            <li>TCK Md.90, 134-136</li>
            <li>1219 s.K. Md.1, 25</li>
            <li>Uzaktan Sağlık Hizmetleri Yönetmeliği (kapsam dışı — bilgilendirme aracı)</li>
            <li>Tıbbi Cihaz Yönetmeliği (kapsam dışı — intended purpose bilgilendirme)</li>
            <li>GETAT Yönetmeliği (kapsam dışı — uygulama yapmıyoruz)</li>
            <li>TKHK (hizmet tanımı: bilgilendirme, sağlık hizmeti değil)</li>
          </ul>
        </>
      ),
    },
    {
      icon: Mail,
      title: "7. İletişim",
      body: (
        <div className="space-y-1">
          <p><strong>DoctoPal</strong> — <a href="https://doctopal.com" className="text-primary underline">doctopal.com</a></p>
          <p>E-posta: <a href="mailto:contact@doctopal.com" className="text-primary underline">contact@doctopal.com</a></p>
        </div>
      ),
    },
  ] : [
    {
      icon: FileText,
      title: "1. Product Description",
      body: (
        <p>
          DoctoPal is an AI-powered web application providing health information based on scientific literature (PubMed, NIH, Europe PMC).
        </p>
      ),
    },
    {
      icon: CheckCircle2,
      title: "2. Intended Purpose",
      body: (
        <>
          <p className="mb-3">DoctoPal&apos;s intended purpose is <strong>EXCLUSIVELY health information</strong>:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Drug-herb interaction information (with scientific references)</li>
            <li>General health information</li>
            <li>User health profile management (medication list, allergies, chronic conditions)</li>
            <li>SBAR report generation for doctor visits</li>
            <li>Herbal product information based on scientific research references</li>
          </ul>
        </>
      ),
    },
    {
      icon: XCircle,
      title: "3. Activities OUTSIDE Intended Purpose",
      body: (
        <>
          <p className="mb-3">DoctoPal does <strong>NOT</strong> and is technically prevented from:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Diagnosing diseases</li>
            <li>Recommending treatments or creating treatment plans</li>
            <li>Writing prescriptions or determining medication dosages</li>
            <li>Providing clinical decision support</li>
            <li>Providing remote healthcare (telemedicine) services</li>
            <li>Practicing traditional and complementary medicine (GETAT)</li>
            <li>Interpreting medical imaging for definitive diagnosis</li>
            <li>Recommending emergency medical intervention (except 112 referral)</li>
          </ul>
        </>
      ),
    },
    {
      icon: Scale,
      title: "4. Medical Device Classification",
      body: (
        <>
          <p className="mb-3">
            DoctoPal is <strong>NOT a medical device</strong> under the Medical Device Regulation (02.06.2021, Official Gazette 31499). Rationale:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Medical device: product &quot;designed for diagnosis, treatment, or prevention&quot;</li>
            <li>DoctoPal is not designed for diagnosis, treatment, or prevention</li>
            <li>Per MDCG 2019-11: &quot;If manufacturer&apos;s intended purpose is only information, it is not a medical device&quot;</li>
            <li>DoctoPal&apos;s intended purpose is information — not clinical decision support</li>
          </ul>
        </>
      ),
    },
    {
      icon: Shield,
      title: "5. Technical Safety Measures",
      body: (
        <>
          <p className="mb-3">DoctoPal uses a 9-layer security architecture:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Emergency detection and 112 referral</li>
            <li>Drug interaction engine (OpenFDA + AI)</li>
            <li>Scientific source verification (PubMed RAG)</li>
            <li>Algorithmic safety (contraindications, dosage limits)</li>
            <li>KVKK prompt anonymization (no identity data to AI)</li>
            <li>Prompt injection protection (jailbreak prevention)</li>
            <li>4-layer output filter (diagnosis → informational, prescription → research reference)</li>
            <li>AI disclaimer + KVKK Art.11 objection mechanism</li>
            <li>Privacy notice / consent separation (KVKK 2026/347 decision)</li>
          </ol>
        </>
      ),
    },
    {
      icon: Scale,
      title: "6. Regulatory Compliance",
      body: (
        <>
          <p className="mb-3">DoctoPal complies with:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>KVKK (Law 6698) — Articles 3, 5, 6, 7, 9, 10, 11, 12, 16</li>
            <li>KVKK Decision 2026/347 on privacy notice separation</li>
            <li>KVKK Generative AI Guide (November 2025)</li>
            <li>Turkish Criminal Code Art.90, 134-136</li>
            <li>Law 1219 Art.1, 25 (medical practice licensing)</li>
            <li>Remote Healthcare Services Regulation (out of scope — information tool)</li>
            <li>Medical Device Regulation (out of scope — intended purpose: information)</li>
            <li>Traditional and Complementary Medicine Regulation (out of scope)</li>
            <li>Turkish Consumer Protection Law (service definition: information, not healthcare)</li>
          </ul>
        </>
      ),
    },
    {
      icon: Mail,
      title: "7. Contact",
      body: (
        <div className="space-y-1">
          <p><strong>DoctoPal</strong> — <a href="https://doctopal.com" className="text-primary underline">doctopal.com</a></p>
          <p>Email: <a href="mailto:contact@doctopal.com" className="text-primary underline">contact@doctopal.com</a></p>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-border/50 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold italic tracking-tight">
              {tr ? "Kullanım Amacı Beyanı" : "Intended Purpose Statement"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {tr ? "TİTCK / Tıbbi Cihaz Yönetmeliği denetim dokümanı" : "TİTCK / Medical Device Regulation audit documentation"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span><strong className="text-foreground">{tr ? "Doküman Versiyonu:" : "Document Version:"}</strong> 1.0</span>
          <span><strong className="text-foreground">{tr ? "Tarih:" : "Date:"}</strong> {tr ? "Nisan 2026" : "April 2026"}</span>
          <span><strong className="text-foreground">{tr ? "Hazırlayan:" : "Prepared by:"}</strong> DoctoPal {tr ? "Ekibi" : "Team"}</span>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <section key={i} className="scroll-mt-20">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-heading text-xl md:text-2xl font-semibold italic text-foreground">
                  {section.title}
                </h2>
              </div>
              <div className="text-[15px] leading-relaxed text-muted-foreground pl-10">
                {section.body}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-12 rounded-lg border bg-muted/30 p-5 text-center text-xs text-muted-foreground">
        <p>
          {tr
            ? "Bu doküman TİTCK ve KVKK denetimine hazırlık amacıyla hazırlanmıştır. PDF kopyası için "
            : "This document is prepared for TİTCK and KVKK audit readiness. For a PDF copy, "}
          <Link href="/terms" className="text-primary underline">
            {tr ? "Kullanım Koşulları" : "Terms of Service"}
          </Link>
          {tr ? " ve " : " and "}
          <Link href="/security" className="text-primary underline">
            {tr ? "Güvenlik" : "Security"}
          </Link>
          {tr ? " sayfalarını ziyaret edin." : " pages."}
        </p>
      </div>
    </div>
  );
}
