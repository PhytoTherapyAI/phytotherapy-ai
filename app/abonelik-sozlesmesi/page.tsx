// © 2026 DoctoPal — All Rights Reserved
// Abonelik Sözleşmesi — 6502 s.K. + KVKK + Tıbbi Cihaz Yönetmeliği beyanı
// v1.0 TASLAK — şirket tescili + hukuk danışmanı incelemesi sonrası yürürlüğe
// girecek. Footer link'i disabled; sayfa doğrudan URL ile erişilebilir.
// AI halüsinasyon sorumluluk reddi + MDR beyanı + KVKK açık rıza + aile
// rıza bağımsızlığı bölümleri (2a, 2b, 5a, 8a) yasal güvenlik zırhı için.
"use client";

import { useLang } from "@/components/layout/language-toggle";
import { ShieldCheck, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AbonelikSozlesmesiPage() {
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
            {tr ? "Abonelik Sözleşmesi" : "Subscription Agreement"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
              v1.0 — {tr ? "Taslak" : "Draft"}
            </span>
            <p className="text-xs text-muted-foreground">
              {tr ? "6502 s.K. + KVKK + MDR beyanı · Nisan 2026" : "Law No.6502 + KVKK + MDR declaration · April 2026"}
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

        {/* §1 Taraflar ve Tanımlar */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "1. Taraflar ve Tanımlar" : "1. Parties and Definitions"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Hizmet Sağlayıcı: DoctoPal (kuruluş aşamasında) — info@doctopal.com" : "Service Provider: DoctoPal (registration in progress) — info@doctopal.com"}</li>
            <li>{tr ? "Kullanıcı: DoctoPal hesabı oluşturan ve Premium aboneliğini başlatan gerçek kişi" : "User: the natural person who creates a DoctoPal account and starts a Premium subscription"}</li>
            <li>{tr ? "Premium: Ücretli abonelik kapsamındaki ileri özelliklere erişim hakkı" : "Premium: the right to access advanced features under a paid subscription"}</li>
            <li>{tr ? "Aile Premium: 6 kişiye kadar aile üyesine Premium erişim sunan paket" : "Family Premium: a package offering Premium access to up to 6 family members"}</li>
            <li>{tr ? "Owner: Aile Premium paketini satın alan ve aileyi yöneten kullanıcı" : "Owner: the user who purchases the Family Premium package and manages the family"}</li>
          </ul>
        </section>

        {/* §2 Hizmet Tanımı */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "2. Hizmet Tanımı" : "2. Service Description"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr
              ? "DoctoPal, yapay zeka destekli dijital sağlık asistanı hizmetidir. Kullanıcıya:"
              : "DoctoPal is an AI-powered digital health assistant service. It provides users with:"}
          </p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Sağlık konularında bilgi" : "Information on health topics"}</li>
            <li>{tr ? "İlaç etkileşim kontrolü" : "Drug interaction checking"}</li>
            <li>{tr ? "SBAR formatında klinik rapor" : "SBAR-format clinical reports"}</li>
            <li>{tr ? "Kan tahlili / radyoloji analizi" : "Blood test / radiology analysis"}</li>
            <li>{tr ? "Aile sağlık yönetimi" : "Family health management"}</li>
            <li>{tr ? "Acil SOS bildirimi" : "Emergency SOS notification"}</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "sunar. Tıbbi teşhis, tedavi veya reçete hizmeti değildir. Nihai sağlık kararları hekim görüşüyle alınmalıdır."
              : "It does not provide medical diagnosis, treatment, or prescription services. Final health decisions must be made with a physician."}
          </p>
        </section>

        {/* §2a MDR Beyanı */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "2a. Tıbbi Cihaz Yönetmeliği (MDR) Beyanı" : "2a. Medical Device Regulation (MDR) Declaration"}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {tr
              ? "DoctoPal, Tıbbi Cihaz Yönetmeliği (MDR) kapsamında bir \"Tıbbi Cihaz\" değildir. DoctoPal, kullanıcıya genel bilgilendirme amaçlı sağlık asistanlığı hizmeti sunan bir yazılımdır."
              : "DoctoPal is not a \"Medical Device\" under the Medical Device Regulation (MDR). DoctoPal is software providing general informational health-assistant services to users."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">{tr ? "DoctoPal:" : "DoctoPal:"}</p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Tıbbi teşhis koymaz, hastalık tanılamaz" : "Does not make medical diagnoses; does not diagnose disease"}</li>
            <li>{tr ? "Tedavi önermez, reçete yazmaz" : "Does not recommend treatment; does not issue prescriptions"}</li>
            <li>{tr ? "Vital parametre ölçümü yapmaz" : "Does not measure vital parameters"}</li>
            <li>{tr ? "Klinik karar destek sistemi olarak sınıflandırılmaz" : "Is not classified as a clinical decision support system"}</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "DoctoPal'ın sunduğu bilgiler yalnızca kullanıcıyı bilinçlendirme ve hekim randevusuna hazırlık amaçlıdır. Nihai sağlık kararları mutlaka hekim muayenesi ve profesyonel tıbbi değerlendirme sonrasında verilmelidir."
              : "The information provided by DoctoPal is solely for user awareness and preparation for a physician appointment. Final health decisions must be made only after a physician examination and professional medical evaluation."}
          </p>
        </section>

        {/* §2b AI Disclaimer */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "2b. Yapay Zeka Halüsinasyon Riski ve Sorumluluk Reddi (Limitation of Liability)" : "2b. AI Hallucination Risk and Limitation of Liability"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr
              ? "Kullanıcı, DoctoPal'ın sunduğu bilgilerin yapay zeka (AI) teknolojisi ile üretildiğini ve bu teknolojinin aşağıdaki sınırlarını açıkça kabul eder:"
              : "The User expressly acknowledges that the information provided by DoctoPal is generated using artificial intelligence (AI) and explicitly accepts the following limitations of that technology:"}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "a) Halüsinasyon Riski:" : "a) Hallucination Risk:"}</strong>{" "}
            {tr
              ? "Yapay zeka modelleri, gerçekte olmayan bilgiler üretebilir (\"halüsinasyon\"); eksik, yanlış veya güncel olmayan sonuçlar verebilir."
              : "AI models may generate information that does not reflect reality (\"hallucination\"); they may produce incomplete, inaccurate, or outdated results."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "b) Bilgi Kaynakları:" : "b) Information Sources:"}</strong>{" "}
            {tr
              ? "DoctoPal; PubMed, OpenFDA gibi açık veri kaynaklarını kullanır ancak bu kaynaklardaki bilgilerin güncelliğini veya doğruluğunu bağımsız olarak garanti edemez."
              : "DoctoPal uses open data sources such as PubMed and OpenFDA but cannot independently guarantee the timeliness or accuracy of the information from those sources."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "c) Garanti Reddi:" : "c) Disclaimer of Warranty:"}</strong>{" "}
            {tr
              ? "Hizmet Sağlayıcı, DoctoPal tarafından üretilen hiçbir bilginin (ilaç etkileşim sonucu, SBAR raporu, GRADE kanıt sınıflaması, analiz yorumu vb.) %100 doğruluğunu, eksiksizliğini veya uygulanabilirliğini garanti etmez."
              : "The Service Provider does not warrant the 100% accuracy, completeness, or applicability of any information generated by DoctoPal (drug interaction results, SBAR reports, GRADE evidence classifications, analysis commentary, etc.)."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "d) Maddi-Manevi Tazminat Reddi:" : "d) Limitation of Monetary and Non-Monetary Damages:"}</strong>{" "}
            {tr
              ? "Kullanıcı, DoctoPal'dan aldığı bilgilere dayanarak aldığı kararlar nedeniyle oluşabilecek maddi veya manevi zararlar için Hizmet Sağlayıcı'dan herhangi bir tazminat talep etmeyeceğini kabul ve beyan eder. Bu madde, Hizmet Sağlayıcı'nın kasıtlı veya ağır ihmal teşkil eden davranışlarını kapsamaz."
              : "The User acknowledges and declares that they will not claim any damages, monetary or non-monetary, from the Service Provider for decisions taken based on information received from DoctoPal. This clause does not cover willful or grossly negligent conduct by the Service Provider."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "e) Acil Durum:" : "e) Emergency:"}</strong>{" "}
            {tr
              ? "DoctoPal acil tıbbi müdahale hizmeti vermemektedir. Acil sağlık durumlarında kullanıcı derhal 112'yi aramalıdır."
              : "DoctoPal does not provide emergency medical response. In health emergencies, the user must immediately call 112."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3 font-semibold">
            {tr
              ? "KULLANICI, DoctoPal'ı KULLANMAYA BAŞLAYARAK BU SORUMLULUK REDDİ KOŞULLARINI KABUL ETMİŞ SAYILIR."
              : "BY STARTING TO USE DoctoPal, THE USER IS DEEMED TO HAVE ACCEPTED THESE LIMITATION-OF-LIABILITY TERMS."}
          </p>
        </section>

        {/* §3 Abonelik Dönemleri */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "3. Abonelik Dönemleri ve Fiyat" : "3. Subscription Periods and Pricing"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Bireysel Premium: Aylık veya yıllık plan" : "Individual Premium: monthly or annual plan"}</li>
            <li>{tr ? "Aile Premium: Aylık veya yıllık plan (max 6 kişi)" : "Family Premium: monthly or annual plan (up to 6 members)"}</li>
            <li>{tr ? "Güncel fiyatlar: doctopal.com/pricing" : "Current pricing: doctopal.com/pricing"}</li>
            <li>{tr ? "Tüm fiyatlara KDV dahildir" : "All prices include VAT"}</li>
            <li>{tr ? "Fiyat değişiklikleri en az 30 gün önceden e-posta ile bildirilir" : "Price changes are notified by email at least 30 days in advance"}</li>
          </ul>
        </section>

        {/* §4 Deneme */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "4. Ücretsiz Deneme Süresi" : "4. Free Trial Period"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "7 gün ücretsiz deneme" : "7-day free trial"}</li>
            <li>{tr ? "Geçerli bir kredi kartı tanımlanması zorunludur" : "A valid credit card must be registered"}</li>
            <li>{tr ? "Iyzico tarafından 1 TL geçici bloke (anında iade)" : "Iyzico places a temporary 1 TL hold (immediately refunded)"}</li>
            <li>{tr ? "Deneme sonunda otomatik ücretli döneme geçilir (kullanıcı iptal etmediği sürece)" : "Auto-transition to paid period at the end of the trial (unless cancelled)"}</li>
          </ul>
        </section>

        {/* §5 Fair Use */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "5. Adil Kullanım Politikası (Fair Use Policy)" : "5. Fair Use Policy"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr
              ? "Premium abonelik kapsamındaki \"sınırsız\" özellikler (AI sağlık asistanı sohbeti, ilaç etkileşim kontrolü vb.) bireysel ve iyi niyetli kullanım esasına dayanır."
              : "The \"unlimited\" features under Premium subscription (AI health assistant conversation, drug interaction checking, etc.) are based on individual and good-faith use."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            {tr
              ? "Bot, otomasyon aracı veya API scraping ile olağandışı yüksek hacimli sorgular tespit edilmesi halinde hesap geçici olarak askıya alınır."
              : "If unusually high-volume queries by bots, automation tools, or API scraping are detected, the account will be temporarily suspended."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            {tr
              ? "Aile Premium hesaplarında \"6 kişi\" sınırı aile bağı içindeki gerçek kişiler içindir; bu hakların ticari paylaşımı (örn. 6 farklı müşteriye hesap satma) yasaktır."
              : "The \"6 people\" limit in Family Premium accounts applies to natural persons within the family unit; commercial sharing of these rights (e.g., selling accounts to 6 different customers) is prohibited."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr ? "Makul kullanım sınırları (güncellenme hakkı Hizmet Sağlayıcı'da):" : "Reasonable use limits (subject to update by the Service Provider):"}
          </p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "AI asistan sorgu: 200 sorgu / gün / kullanıcı" : "AI assistant queries: 200 / day / user"}</li>
            <li>{tr ? "SBAR PDF: 20 rapor / gün" : "SBAR PDF: 20 reports / day"}</li>
            <li>{tr ? "İlaç etkileşim kontrolü: 100 sorgu / gün" : "Drug interaction checks: 100 queries / day"}</li>
            <li>{tr ? "Kan tahlili / Radyoloji analizi: 10 analiz / gün" : "Blood test / Radiology analysis: 10 analyses / day"}</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "Bu sınırları aşan normal insan kullanımı son derece nadirdir; aşıldığında Hizmet Sağlayıcı önce uyarı gönderir, gerekirse geçici kısıtlama uygular."
              : "Normal human usage exceeding these limits is extremely rare; when exceeded, the Service Provider will first issue a warning and, if necessary, apply temporary restrictions."}
          </p>
        </section>

        {/* §5a Açık Rıza */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "5a. Özel Nitelikli Kişisel Veri (Sağlık Verisi) — Açık Rıza" : "5a. Special Category Personal Data (Health Data) — Explicit Consent"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr ? "Kullanıcı, DoctoPal'ı kullanmak için sisteme girdiği:" : "The User acknowledges that the following data entered into the system to use DoctoPal:"}
          </p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "İlaç isimleri, reçeteler, dozaj bilgileri" : "Medication names, prescriptions, dosage information"}</li>
            <li>{tr ? "Kan tahlili sonuçları, laboratuvar değerleri" : "Blood test results, lab values"}</li>
            <li>{tr ? "Radyoloji raporları, görüntü dosyaları" : "Radiology reports, image files"}</li>
            <li>{tr ? "Prospektüs / ilaç kutuları fotoğrafları" : "Prescribing information / medication box photos"}</li>
            <li>{tr ? "Kronik hastalık bilgileri, alerjiler" : "Chronic condition information, allergies"}</li>
            <li>{tr ? "Aşı geçmişi, cerrahi müdahaleler" : "Vaccination history, surgical history"}</li>
            <li>{tr ? "Mental sağlık değerlendirmeleri (PHQ-9, GAD-7 vb.)" : "Mental health assessments (PHQ-9, GAD-7, etc.)"}</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "verilerinin KVKK Madde 6 uyarınca \"Özel Nitelikli Kişisel Veri\" olduğunu ve ancak açık rıza ile işlenebileceğini kabul eder."
              : "constitute \"Special Category Personal Data\" under KVKK Article 6 and may only be processed based on explicit consent."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr ? "Kullanıcı, DoctoPal'ı kullanmak için bu sözleşmeyi onaylayarak:" : "By approving this agreement to use DoctoPal, the User:"}
          </p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Sağlık verilerinin DoctoPal tarafından işlenmesine," : "Consents to the processing of health data by DoctoPal,"}</li>
            <li>{tr ? "Anonimleştirilmiş halde yapay zeka sağlayıcılarına (Anthropic PBC, Google LLC) analiz amacıyla iletilmesine," : "Consents to anonymized transmission to AI providers (Anthropic PBC, Google LLC) for analysis,"}</li>
            <li>{tr ? "Tıbbi görüntü ve belgelerinin geçici olarak AI sistemlerinde analiz edilmesine" : "Consents to temporary analysis of medical images and documents in AI systems"}</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            {tr ? "açık rıza gösterdiğini beyan eder." : "— and declares explicit consent."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "Açık rıza her zaman geri çekilebilir (Hesap Ayarları > Veri Yönetimi > Rızayı Geri Çek). Rızanın geri çekilmesi durumunda kullanıcının geçmiş verileri 30 gün içinde silinir veya anonimleştirilir. Detaylı açıklama için "
              : "Explicit consent may be withdrawn at any time (Account Settings > Data Management > Withdraw Consent). Upon withdrawal, the user's historical data is deleted or anonymized within 30 days. For a detailed explanation see the "}
            <Link href="/aydinlatma" className="text-primary hover:underline">
              {tr ? "Aydınlatma Metni" : "Privacy Notice"}
            </Link>
            {tr ? "'ne bakınız." : "."}
          </p>
        </section>

        {/* §6 Otomatik Yenileme */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "6. Otomatik Yenileme ve İptal" : "6. Automatic Renewal and Cancellation"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Abonelik dönem sonunda otomatik yenilenir" : "The subscription automatically renews at the end of each period"}</li>
            <li>{tr ? "Kullanıcı dilediği zaman tek tıkla iptal edebilir (Hesap Ayarları > Abonelik)" : "The User may cancel at any time with one click (Account Settings > Subscription)"}</li>
            <li>{tr ? "İptal sonrası mevcut dönem sonuna kadar hizmet devam eder; sonraki dönem için tahsilat yapılmaz" : "After cancellation, service continues until the end of the current period; no charge is made for the next period"}</li>
            <li>
              {tr ? "Gerçekleşmiş ödemeler için geri iade yapılmaz (cayma hakkı istisnası — " : "No refunds for completed payments (withdrawal exclusion — "}
              <Link href="/mesafeli-satis" className="text-primary hover:underline">
                {tr ? "Mesafeli Satış Sözleşmesi" : "Distance Sales Agreement"}
              </Link>
              {tr ? " Madde 7)" : " Article 7)"}
            </li>
          </ul>
        </section>

        {/* §7 Askıya Alma */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "7. Hizmetin Askıya Alınması ve Tek Taraflı Fesih" : "7. Service Suspension and Unilateral Termination"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr
              ? "Hizmet Sağlayıcı aşağıdaki hallerde aboneliği tek taraflı olarak ve ücret iadesi yapmaksızın derhal feshetme hakkına sahiptir:"
              : "The Service Provider has the right to unilaterally terminate the subscription immediately, without refund, in the following cases:"}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "a)" : "a)"}</strong>{" "}
            {tr
              ? "Kullanıcı'nın sistemi yasa dışı, genel ahlaka aykırı veya uygulamanın tıbbi bilgilendirme amacını (teşhis/tedavi/reçete zorlaması) aşacak şekilde manipüle etmeye çalışması (prompt injection, jailbreak girişimleri vb.)"
              : "Attempts by the User to manipulate the system in an illegal or immoral manner, or to exceed the application's informational medical purpose (forcing diagnosis/treatment/prescription) — e.g., prompt injection, jailbreak attempts."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "b)" : "b)"}</strong>{" "}
            {tr
              ? "Sistemi bot, otomasyon aracı veya makine öğrenmesi model eğitimi için kötüye kullanma girişimi"
              : "Attempts to abuse the system with bots, automation tools, or for training machine-learning models."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "c)" : "c)"}</strong>{" "}
            {tr
              ? "Tıbbi danışmanlık, sahte reçete, yasa dışı madde yönlendirmesi, kendine veya başkasına zarar verme içerikleri üretmeye zorlama"
              : "Coercing the production of medical advice, fake prescriptions, illegal substance guidance, or content promoting self-harm or harm to others."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "d)" : "d)"}</strong>{" "}
            {tr
              ? "Başka kullanıcıların veri mahremiyetini veya güvenliğini ihlal girişimi"
              : "Attempts to breach other users' data privacy or security."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "e)" : "e)"}</strong>{" "}
            {tr
              ? "Ödeme başarısızlığı ve kart bilgilerinin 30 gün içinde güncellenmemesi"
              : "Payment failure and non-update of card information within 30 days."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "Askıya alma durumunda Kullanıcı info@doctopal.com üzerinden itiraz edebilir; değerlendirme 15 iş günü içinde yapılır."
              : "In case of suspension, the User may object via info@doctopal.com; review is completed within 15 business days."}
          </p>
        </section>

        {/* §8 Aile Premium Özel */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "8. Aile Premium Özel Koşulları" : "8. Family Premium Special Conditions"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Ödeme yükümlülüğü ve fatura muhatabı yalnızca owner'a aittir" : "Payment obligation and invoice recipient belong solely to the owner"}</li>
            <li>{tr ? "Aile üyeleri (davetliler) ödemeye taraf değildir" : "Family members (invited persons) are not parties to the payment"}</li>
            <li>{tr ? "Owner'ın hesabını silmesi, aboneliğin bütün aile için sona ermesine yol açar" : "Deletion of the owner's account terminates the subscription for the entire family"}</li>
            <li>{tr ? "Aile üyesi aileden ayrıldığında kendi bireysel Premium aboneliğine geçebilir (yeni sözleşme gerekir)" : "A family member who leaves may switch to their own Individual Premium subscription (requires a new agreement)"}</li>
            <li>{tr ? "Owner değişikliği yeni abonelik işlemi gerektirir" : "An owner change requires a new subscription transaction"}</li>
          </ul>
        </section>

        {/* §8a Aile Üyelerinin Rıza */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "8a. Aile Üyelerinin Bağımsız Rıza Yükümlülüğü" : "8a. Independent Consent Requirement for Family Members"}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {tr ? "Aile Premium paketinde davet edilen her aile üyesi:" : "Each family member invited to a Family Premium package:"}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "a)" : "a)"}</strong>{" "}
            {tr ? "Kendi hesabına giriş yapar (Owner'ın hesabı üzerinden değil)" : "Logs into their own account (not through the owner's account)."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "b)" : "b)"}</strong>{" "}
            {tr ? "İlk girişte kendi adına:" : "On first login, personally:"}
          </p>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Kullanım Koşulları'nı onaylar" : "Accepts the Terms of Use"}</li>
            <li>{tr ? "Aydınlatma Metni'ni okur" : "Reads the Privacy Notice"}</li>
            <li>{tr ? "Sağlık verisi işlenmesine açık rıza gösterir" : "Provides explicit consent to health data processing"}</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "c)" : "c)"}</strong>{" "}
            {tr
              ? "Bu onaylar verilmeden aile üyesinin sağlık verisi sisteme kaydedilemez — Owner, aile üyesinin kendisi sisteme giriş yapana kadar sadece ad-ilişki (anne/baba/eş/çocuk) bilgilerini ekleyebilir; sağlık verilerini EKLEYEMEZ."
              : "Without these approvals, the family member's health data cannot be recorded in the system — until the family member themselves logs in, the owner may add only the name-relationship (mother/father/spouse/child) information; the owner CANNOT add health data."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "d)" : "d)"}</strong>{" "}
            {tr ? "Aile üyesi 18 yaşını doldurmuşsa kendi adına rıza gösterir." : "If the family member is over 18, they provide consent in their own name."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "e)" : "e)"}</strong>{" "}
            {tr
              ? "Aile üyesi 18 yaşını doldurmamışsa (çocuklar dahil) yasal velisi olan Owner adına rıza gösterir; ancak çocuğun 18 yaşını doldurduğu anda kendi rıza yenilemesini yapması istenir."
              : "If the family member is under 18 (including children), the owner provides consent as their legal guardian; however, when the child turns 18, they will be asked to renew consent personally."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>{tr ? "f)" : "f)"}</strong>{" "}
            {tr
              ? "Aile üyesi aileden ayrıldığında (ayrılma veya Owner tarafından çıkarma), kendi verileri aile görünümünden kaldırılır ve isterse bireysel plana geçebilir."
              : "When a family member leaves the family (either voluntarily or removed by the owner), their data is removed from the family view, and they may optionally switch to an individual plan."}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {tr
              ? "DoctoPal, Owner'ın sözü ile üçüncü şahısların sağlık verisini işlemez; her aile üyesinin kendi elektronik rızası zorunludur."
              : "DoctoPal does not process the health data of third parties based on the owner's assurance; each family member's own electronic consent is mandatory."}
          </p>
        </section>

        {/* §9 Taraf Sorumlulukları */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "9. Taraf Sorumlulukları" : "9. Responsibilities of the Parties"}</h2>
          <h3 className="text-base font-semibold mt-4 mb-2">{tr ? "Hizmet Sağlayıcı:" : "Service Provider:"}</h3>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Hizmetin kesintisiz sunulması için makul özeni gösterir (SLA taahhüdü yoktur)" : "Exercises reasonable care to provide uninterrupted service (no SLA commitment)"}</li>
            <li>{tr ? "Planlı bakım en az 24 saat öncesinden duyurulur" : "Planned maintenance is announced at least 24 hours in advance"}</li>
            <li>{tr ? "Veri güvenliği KVKK uyarınca sağlanır (Aydınlatma Metni'ne bakınız)" : "Data security is ensured under KVKK (see Privacy Notice)"}</li>
          </ul>
          <h3 className="text-base font-semibold mt-4 mb-2">{tr ? "Kullanıcı:" : "User:"}</h3>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Hesap güvenliğini (şifre, e-posta) korur" : "Protects account security (password, email)"}</li>
            <li>{tr ? "Ödeme bilgilerinin doğruluğunu sağlar" : "Ensures the accuracy of payment information"}</li>
            <li>{tr ? "Paylaşılan sağlık verilerinin gerçek ve kendisine ait olduğunu taahhüt eder" : "Warrants that the shared health data is genuine and belongs to them"}</li>
            <li>{tr ? "Aile üyelerinin rızasını almadan onları aileye eklemez" : "Does not add family members without their consent"}</li>
            <li>{tr ? "DoctoPal'ı tıbbi teşhis aracı olarak kullanmaz, hekim görüşü ile karar verir" : "Does not use DoctoPal as a medical diagnosis tool; decides based on a physician's opinion"}</li>
          </ul>
        </section>

        {/* §10 Fikri Mülkiyet */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "10. Fikri Mülkiyet" : "10. Intellectual Property"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "DoctoPal markası, logosu, yazılımı ve içeriği Hizmet Sağlayıcı'ya aittir" : "The DoctoPal trademark, logo, software, and content belong to the Service Provider"}</li>
            <li>{tr ? "Kullanıcı, hizmeti kişisel kullanım için lisanslar; kopyalama, reverse engineering, ticari yeniden satış yasaktır" : "The User is licensed for personal use only; copying, reverse engineering, or commercial resale is prohibited"}</li>
            <li>{tr ? "Kullanıcı'nın girdiği sağlık verileri kendisine aittir; Kullanıcı bu verileri istediği zaman dışa aktarabilir veya silebilir" : "Health data entered by the User belongs to them; the User may export or delete this data at any time"}</li>
          </ul>
        </section>

        {/* §11 Feshin Sonuçları */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "11. Feshin Sonuçları ve Veri Silme" : "11. Consequences of Termination and Data Deletion"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Abonelik sona erdiğinde hesap Free plana düşer; Premium özellikler devre dışı kalır" : "When the subscription ends, the account reverts to the Free plan; Premium features are disabled"}</li>
            <li>{tr ? "Kullanıcı hesap silme talep edebilir; silme 30 gün içinde kalıcıdır" : "The User may request account deletion; deletion is permanent within 30 days"}</li>
            <li>{tr ? "Ödeme/fatura kayıtları VUK Md.253 gereği 10 yıl saklanır (anonimleştirilerek)" : "Payment/invoice records are retained for 10 years as required by Tax Procedure Law Art.253 (anonymized)"}</li>
            <li>{tr ? "Sağlık verileri hesap silme ile birlikte silinir; audit log'lar 1 yıl anonim saklanır" : "Health data is deleted upon account deletion; audit logs are retained anonymized for 1 year"}</li>
          </ul>
        </section>

        {/* §12 Hukuk */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "12. Uygulanacak Hukuk ve Uyuşmazlık" : "12. Applicable Law and Disputes"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Türkiye Cumhuriyeti hukuku uygulanır" : "Governed by the laws of the Republic of Türkiye"}</li>
            <li>{tr ? "Tüketici Hakem Heyetleri (parasal sınırlar dahilinde) ve Tüketici Mahkemeleri yetkilidir" : "Consumer Arbitration Committees (within monetary limits) and Consumer Courts have jurisdiction"}</li>
            <li>{tr ? "İletişim: info@doctopal.com" : "Contact: info@doctopal.com"}</li>
          </ul>
        </section>

        {/* §13 Yürürlük */}
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">{tr ? "13. Yürürlük ve Değişiklik" : "13. Entry into Force and Amendments"}</h2>
          <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
            <li>{tr ? "Kullanıcı ödeme öncesi \"Abonelik Sözleşmesi'ni okudum, kabul ediyorum\" kutusunu işaretleyerek sözleşmeyi kabul eder" : "The User accepts the agreement by checking \"I have read and accept the Subscription Agreement\" before payment"}</li>
            <li>{tr ? "Hizmet Sağlayıcı sözleşmeyi değiştirme hakkına sahiptir; değişiklikler en az 30 gün önceden bildirilir" : "The Service Provider has the right to amend the agreement; amendments are notified at least 30 days in advance"}</li>
            <li>{tr ? "Kullanıcı değişiklikleri kabul etmediği takdirde aboneliğini iptal edebilir" : "If the User does not accept the amendments, they may cancel their subscription"}</li>
          </ul>
        </section>
      </div>

      {/* Footer disclaimer */}
      <div className="mt-12 pt-6 border-t space-y-2">
        <p className="text-xs italic text-slate-500 dark:text-slate-500 leading-relaxed">
          {tr
            ? "Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun, KVKK ve ilgili mevzuata uygun olarak hazırlanmıştır. ANCAK HUKUK DANIŞMANI İNCELEMESİNDEN GEÇMEMİŞTİR. Şirket tescil süreci sonrası güncel bilgilerle ve hukuk danışmanı onayıyla yürürlüğe girecektir."
            : "This agreement is prepared in accordance with Consumer Protection Law No.6502, KVKK, and related legislation. HOWEVER, IT HAS NOT BEEN REVIEWED BY LEGAL COUNSEL. It will enter into force with updated information and legal counsel approval following company registration."}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          {tr ? "Abonelik Sözleşmesi versiyon: v1.0 — Taslak — Son güncelleme: Nisan 2026" : "Subscription Agreement version: v1.0 — Draft — Last updated: April 2026"}
        </p>
      </div>
    </div>
  );
}
