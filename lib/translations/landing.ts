// © 2026 DoctoPal — All Rights Reserved
// Landing page namespace — Ayşe persona marketing copy
// TR/EN paralel, ~120 keys across 10 sub-sections
// ─────────────────────────────────────────────────────────────
// LEGAL NOTE (1219 sayılı Kanun): "hekim" / "doktor" kelimelerini
// kurucu tanımında KULLANMA — tıp fakültesi öğrencileri henüz mezun
// değil. "Tıp fakültesi öğrencisi" / "iki kurucu" güvenli.
// ─────────────────────────────────────────────────────────────

import type { TranslationEntry } from "../translations"

export const landingTranslations: Record<string, TranslationEntry> = {
  // ─── meta ────────────────────────────────────────────
  "landing.meta.title": {
    en: "DoctoPal — AI-powered health assistant for your family",
    tr: "DoctoPal — Aileniz için yapay zeka destekli sağlık asistanı",
  },
  "landing.meta.description": {
    en: "Medication interaction checker, SBAR clinical reports, family health management. Try free for 7 days.",
    tr: "İlaç etkileşim kontrolü, SBAR klinik rapor, aile sağlık yönetimi. 7 gün ücretsiz deneyin.",
  },

  // ─── nav ─────────────────────────────────────────────
  "landing.nav.features": { en: "Features", tr: "Özellikler" },
  "landing.nav.pricing": { en: "Pricing", tr: "Fiyatlandırma" },
  "landing.nav.about": { en: "About", tr: "Hakkımızda" },
  "landing.nav.signIn": { en: "Sign In", tr: "Giriş Yap" },
  "landing.nav.ctaTrial": { en: "Try Free for 7 Days", tr: "7 Gün Ücretsiz Dene" },

  // ─── hero ────────────────────────────────────────────
  "landing.hero.h1": {
    en: "Your AI-powered safety shield for your loved ones' health.",
    tr: "Sevdiklerinizin sağlığı için yapay zeka destekli güvenlik kalkanınız.",
  },
  "landing.hero.h2": {
    en: "Mom's medications, dad's doctor visits, your sibling's emergency... Manage your family's entire health journey in one place, designed by two medical students from inside the clinic.",
    tr: "Annenin ilaçları, babanın doktor randevusu, kardeşinin acil durumu... Ailenizin tüm sağlık yönetimini kliniğin içinden gelen iki tıp öğrencisinin tasarladığı bu asistanla tek bir yerde güvenle yönetin.",
  },
  "landing.hero.ctaPrimary": { en: "Try Free for 7 Days →", tr: "7 Gün Ücretsiz Dene →" },
  "landing.hero.ctaSecondary": { en: "How It Works? ↓", tr: "Nasıl Çalışıyor? ↓" },
  "landing.hero.badge1": { en: "Evidence-based medicine", tr: "Kanıta dayalı tıp" },
  "landing.hero.badge2": {
    en: "End-to-end encrypted & GDPR ready",
    tr: "KVKK uyumlu & uçtan uca şifreli",
  },
  "landing.hero.badge3": {
    en: "Designed by medical students",
    tr: "Tıp fakültesi öğrencileri tarafından tasarlandı",
  },
  "landing.hero.screenshotCaption": { en: "DoctoPal panel preview", tr: "DoctoPal panel önizlemesi" },

  // ─── problem ─────────────────────────────────────────
  "landing.problem.sectionTitle": {
    en: "Managing your loved ones' health shouldn't be this hard.",
    tr: "Sevdiklerinin sağlığını yönetmek bu kadar zor olmamalı.",
  },
  "landing.problem.sectionSubtitle": {
    en: "You work full-time. They're aging, getting sick, on more medications. You're the one bridging the gap — alone.",
    tr: "Sen yoğun çalışıyorsun. Onlar yaşlanıyor, hastalanıyor, ilaçları artıyor. Aradaki bağı kurmak senin görevin oluyor — ama yapayalnız.",
  },
  "landing.problem.card1Title": {
    en: "Are all these medications compatible with each other?",
    tr: "Bu ilaçların hepsi birbiriyle uyumlu mu?",
  },
  "landing.problem.card1Body": {
    en: "Mom's blood pressure pill, dad's heart medication, mineral supplement, herbal tea... What clashes with what, which side effect comes from where — it's become impossible to know.",
    tr: "Annenin tansiyon hapı, babanın kalp ilacı, mineral takviyesi, bitki çayı... Hangisi neyle çakışıyor, hangi yan etki kimden geliyor — bilmek imkansız hale geldi.",
  },
  "landing.problem.card2Title": {
    en: "What will I forget at the doctor's appointment?",
    tr: "Doktora gittiğimde neyi unutacağım?",
  },
  "landing.problem.card2Body": {
    en: "Squeezing 6 months of history into a 15-minute visit. When did which complaint start, when did which medication change, which lab result was important...",
    tr: "15 dakikalık randevuya 6 aylık hikayeyi sığdırmak. Hangi şikayet ne zaman başladı, hangi ilaç ne zaman değişti, hangi tahlil sonucu önemliydi...",
  },
  "landing.problem.card3Title": {
    en: "What if something happens while I'm away?",
    tr: "Bir şey olursa ben şehir dışındayım.",
  },
  "landing.problem.card3Body": {
    en: "What was dad's allergy? Who's on what medication? In an emergency, who should be called, what should be said? Vital information — scattered and lost.",
    tr: "Babanın alerjisi neydi? Kim hangi ilacı kullanıyor? Acil durumda kime, ne söylenecek? Tek bir yerde hızla ulaşılması gereken bilgiler — dağınık ve kayıp.",
  },

  // ─── solution ────────────────────────────────────────
  "landing.solution.sectionTitle": {
    en: "DoctoPal has an answer for each.",
    tr: "DoctoPal her birine bir cevap.",
  },

  // Feature 1 — Drug interaction
  "landing.solution.feature1Mini": { en: "INSTANT SAFETY", tr: "ANINDA GÜVENLİK" },
  "landing.solution.feature1Title": {
    en: "Know what clashes with what in 2 seconds.",
    tr: "Hangi ilaç neyle çakışır, 2 saniyede öğren.",
  },
  "landing.solution.feature1Body": {
    en: "PubMed, OpenFDA and clinical literature scanned, results classified with GRADE evidence system. 'High risk', 'caution required', or 'safe' — every interaction comes with its evidence level.",
    tr: "PubMed, OpenFDA ve klinik literatür taranır, GRADE evidence sistemi ile sınıflandırılmış sonuçlar gösterilir. 'Yüksek riskli' mi, 'dikkat edilmeli' mi, yoksa 'güvenli' mi — her etkileşim kanıt seviyesiyle birlikte gelir.",
  },
  "landing.solution.feature1Chip1": { en: "Drug + drug", tr: "İlaç + ilaç" },
  "landing.solution.feature1Chip2": { en: "Drug + herb/supplement", tr: "İlaç + bitki/takviye" },
  "landing.solution.feature1Chip3": { en: "Drug + food", tr: "İlaç + besin" },
  "landing.solution.feature1Chip4": { en: "Turkish drug names supported", tr: "Türkçe ilaç adı destekli" },

  // Feature 2 — SBAR
  "landing.solution.feature2Mini": { en: "CLINICAL PROFESSIONALISM", tr: "KLİNİK PROFESYONELLİK" },
  "landing.solution.feature2Title": {
    en: "Your professional clinical summary, ready before you visit the doctor.",
    tr: "Doktoruna gitmeden önce, profesyonel klinik özetin hazır.",
  },
  "landing.solution.feature2Body": {
    en: "PDF report prepared in SBAR format (Situation–Background–Assessment–Recommendation) conveys your loved one's status to the doctor in 30 seconds. In hospital language, in hospital standards.",
    tr: "SBAR formatında (Situation–Background–Assessment–Recommendation) hazırlanan PDF raporu, sevdiklerinin son durumunu doktoruna 30 saniyede aktarır. Hastane jargonunda, hastane standardında.",
  },
  "landing.solution.feature2Chip1": { en: "Download or share as PDF", tr: "PDF olarak indir veya paylaş" },
  "landing.solution.feature2Chip2": { en: "Current medications + doses", tr: "Mevcut ilaçlar + dozlar" },
  "landing.solution.feature2Chip3": { en: "Recent complaints chronologically", tr: "Son şikayetler kronolojik" },
  "landing.solution.feature2Chip4": { en: "Lab results auto-summarized", tr: "Tahlil sonuçları otomatik özet" },

  // Feature 3 — Family + SOS
  "landing.solution.feature3Mini": { en: "SHARED CARE", tr: "PAYLAŞIMLI BAKIM" },
  "landing.solution.feature3Title": {
    en: "Your family of 6, in one account, always at hand.",
    tr: "6 kişilik ailen, tek hesapta, anında erişimde.",
  },
  "landing.solution.feature3Body": {
    en: "Mom, dad, spouse, child, sibling — everyone's profile beside you. In an emergency, one-tap SOS sends critical info to the whole family: blood type, allergies, medications, chronic conditions.",
    tr: "Anne, baba, eş, çocuk, kardeş — herkesin profili senin yanında. Acil durumda tek tuşla SOS tüm aileye kritik bilgilerini iletir: kan grubu, alerjiler, kullandığı ilaçlar, kronik hastalıklar.",
  },
  "landing.solution.feature3Chip1": { en: "6-person family plan", tr: "6 kişilik aile paketi" },
  "landing.solution.feature3Chip2": { en: "Permission management", tr: "Yetki yönetimi" },
  "landing.solution.feature3Chip3": { en: "Family health tree", tr: "Aile sağlık ağacı" },
  "landing.solution.feature3Chip4": { en: "SOS free for everyone", tr: "SOS herkes için ücretsiz" },

  // ─── howItWorks ──────────────────────────────────────
  "landing.howItWorks.sectionTitle": {
    en: "Your family health hub ready in 3 steps.",
    tr: "3 adımda ailenin sağlık merkezi hazır.",
  },
  "landing.howItWorks.step1Title": { en: "Create Your Profile", tr: "Profilini Oluştur" },
  "landing.howItWorks.step1Duration": { en: "1 minute", tr: "1 dakika" },
  "landing.howItWorks.step1Body": {
    en: "Your age, chronic conditions, allergies, medications. AI asks smart questions, auto-fills the gaps.",
    tr: "Yaşın, kronik hastalıkların, alerjilerin, kullandığın ilaçlar. AI sana akıllı sorular sorar, kalan boşlukları otomatik doldurur.",
  },
  "landing.howItWorks.step2Title": { en: "Invite Your Family", tr: "Aileni Davet Et" },
  "landing.howItWorks.step2Duration": { en: "2 minutes", tr: "2 dakika" },
  "landing.howItWorks.step2Body": {
    en: "Mom, dad, spouse, child — send invite code. Once accepted, their profiles join your family, and you track everyone's health from one panel as the manager.",
    tr: "Anne, baba, eş, çocuk — davet kodu gönder. Onlar kabul ettiğinde profilleri aileye eklenir, sen yönetici olarak herkesin sağlığını tek panelde takip edersin.",
  },
  "landing.howItWorks.step3Title": { en: "Your AI Assistant is Ready", tr: "AI Asistanın Hazır" },
  "landing.howItWorks.step3Duration": { en: "24/7 for you", tr: "7/24 senin için" },
  "landing.howItWorks.step3Body": {
    en: "Ask: 'Is mom's new prescription compatible with her existing meds?' Instant GRADE-classified answer, SBAR report if needed, urgent guidance if necessary.",
    tr: "Sor: 'Annemin yeni reçetesi mevcut ilaçlarıyla uyumlu mu?' Anında GRADE-sınıflandırılmış cevap, gerekirse SBAR raporu, gerekirse acil yönlendirme.",
  },

  // ─── pricing ─────────────────────────────────────────
  "landing.pricing.sectionTitle": {
    en: "Family health security for the price of a coffee.",
    tr: "Bir kahve fiyatına ailenin sağlık güvenliği.",
  },

  // Free tier
  "landing.pricing.freeName": { en: "Free", tr: "Ücretsiz" },
  "landing.pricing.freePrice": { en: "₺0", tr: "₺0" },
  "landing.pricing.freePeriod": { en: "", tr: "" },
  "landing.pricing.freeFeature1": { en: "Your own profile", tr: "Kendi profilin" },
  "landing.pricing.freeFeature2": { en: "SOS feature", tr: "SOS özelliği" },
  "landing.pricing.freeFeature3": { en: "Limited assistant", tr: "Sınırlı asistan" },
  "landing.pricing.freeCta": { en: "Start Free", tr: "Ücretsiz Başla" },

  // Individual Premium
  "landing.pricing.individualName": { en: "Individual Premium", tr: "Bireysel Premium" },
  "landing.pricing.individualPrice": { en: "₺149", tr: "₺149" },
  "landing.pricing.individualPeriod": { en: "/mo", tr: "/ay" },
  "landing.pricing.individualFeature1": { en: "Full access", tr: "Tam erişim" },
  "landing.pricing.individualFeature2": { en: "Management for yourself", tr: "Kendi adına yönetim" },
  "landing.pricing.individualFeature3": { en: "AI + SBAR + PDF analysis", tr: "AI + SBAR + PDF analiz" },
  "landing.pricing.individualCta": { en: "Try Free for 7 Days", tr: "7 Gün Ücretsiz Dene" },

  // Family Premium (emphasised — decoy)
  "landing.pricing.familyName": { en: "Family Premium", tr: "Aile Premium" },
  "landing.pricing.familyPrice": { en: "₺349", tr: "₺349" },
  "landing.pricing.familyPeriod": { en: "/mo", tr: "/ay" },
  "landing.pricing.familyBadge": { en: "FOR THE WHOLE FAMILY", tr: "TÜM AİLE İÇİN" },
  "landing.pricing.familyDecoy": { en: "₺894 if purchased separately", tr: "Tek başına alsanız ₺894" },
  "landing.pricing.familyFeature1": { en: "Premium for up to 6 people", tr: "6 kişiye kadar Premium" },
  "landing.pricing.familyFeature2": { en: "All family features", tr: "Tüm aile özellikleri" },
  "landing.pricing.familyFeature3": { en: "SOS + health tree", tr: "SOS + sağlık ağacı" },
  "landing.pricing.familyCta": { en: "Try Free for 7 Days", tr: "7 Gün Ücretsiz Dene" },

  "landing.pricing.detailLink": { en: "See All Plan Details →", tr: "Tüm Plan Detaylarını Gör →" },
  "landing.pricing.microNote": {
    en: "7-day free trial · All prices include VAT · One-tap cancellation",
    tr: "7 gün ücretsiz deneme · Tüm fiyatlara KDV dahil · Tek tıkla iptal",
  },

  // ─── trust ───────────────────────────────────────────
  "landing.trust.sectionTitle": {
    en: "Why can you trust DoctoPal?",
    tr: "Neden DoctoPal'a güvenebilirsin?",
  },
  "landing.trust.col1Title": { en: "Privacy First", tr: "Mahremiyet Önceliği" },
  "landing.trust.col1Body": {
    en: "Your data is end-to-end encrypted, stored on KVKK and GDPR compliant infrastructure. No cross-border transfers, no third-party sharing.",
    tr: "Verileriniz uçtan uca şifreli, KVKK ve GDPR uyumlu altyapıda saklanır. Yurt dışı aktarım yok, üçüncü taraf paylaşım yok.",
  },
  "landing.trust.col2Title": { en: "Medical Guidance", tr: "Tıbbi Danışmanlık" },
  "landing.trust.col2Body": {
    en: "Built by two founders who combined medical education with full-stack development to translate clinical knowledge into software. Every clinical flow is literature-supported.",
    tr: "Klinikten gelen bilgiyi yazılıma dökmek için tıp eğitimini ve full-stack geliştirmeyi birleştiren iki kurucunun ürünü. Her klinik akış literatürle desteklenir.",
  },
  "landing.trust.col3Title": {
    en: "Thoughtful Product Development",
    tr: "Titiz Ürün Geliştirme",
  },
  "landing.trust.col3Body": {
    en: "Every feature is backed by clinical literature. A solution born from real need, crafted with care.",
    tr: "Her özellik klinik literatürle desteklenir. Gerçek bir ihtiyaçtan doğan, özenle geliştirilen bir çözüm.",
  },
  "landing.trust.col4Title": { en: "Secure Infrastructure", tr: "Güvenli Altyapı" },
  "landing.trust.col4Body": {
    en: "All your data is encrypted. Health data sharing is always under your control.",
    tr: "Tüm verileriniz şifreli. Sağlık verisi paylaşımı her zaman senin onayında.",
  },

  // ─── finalCta ────────────────────────────────────────
  "landing.finalCta.title": {
    en: "Start protecting your loved ones' health today.",
    tr: "Sevdiklerinin sağlığını korumaya bugün başla.",
  },
  "landing.finalCta.subtitle": {
    en: "Try free for 7 days. Cancel with one tap if you don't love it.",
    tr: "7 gün ücretsiz dene. Beğenmezsen tek tıkla iptal et.",
  },
  "landing.finalCta.cta": { en: "Try Free Now →", tr: "Şimdi Ücretsiz Dene →" },
  "landing.finalCta.badge1": { en: "Quick setup", tr: "Hızlı kurulum" },
  "landing.finalCta.badge2": { en: "One-tap cancel", tr: "Tek tıkla iptal" },
  "landing.finalCta.badge3": { en: "VAT included pricing", tr: "KDV dahil fiyatlar" },
  "landing.finalCta.badge4": { en: "KVKK compliant", tr: "KVKK uyumlu" },

  // ─── footer ──────────────────────────────────────────
  "landing.footer.tagline": {
    en: "Your AI-powered safety shield for your loved ones' health.",
    tr: "Sevdiklerinin sağlığı için yapay zeka destekli güvenlik kalkanın.",
  },
  "landing.footer.productCol": { en: "Product", tr: "Ürün" },
  "landing.footer.productLink1": { en: "Features", tr: "Özellikler" },
  "landing.footer.productLink2": { en: "Pricing", tr: "Fiyatlandırma" },
  "landing.footer.productLink3": { en: "Health Assistant", tr: "Sağlık Asistanı" },
  "landing.footer.productLink4": { en: "Interaction Checker", tr: "Etkileşim Denetleyici" },
  "landing.footer.legalCol": { en: "Company & Legal", tr: "Şirket & Hukuki" },
  "landing.footer.legalLink1": { en: "About", tr: "Hakkımızda" },
  "landing.footer.legalLink2": { en: "Privacy Notice", tr: "Aydınlatma Metni" },
  "landing.footer.legalLink3": { en: "Distance Sales Agreement", tr: "Mesafeli Satış Sözleşmesi" },
  "landing.footer.legalLink4": { en: "Subscription Agreement", tr: "Abonelik Sözleşmesi" },
  "landing.footer.legalLink5": { en: "KVKK Rights", tr: "KVKK Hakları" },
  "landing.footer.legalLink6": { en: "Contact: info@doctopal.com", tr: "İletişim: info@doctopal.com" },
  "landing.footer.copyright": {
    en: "© 2026 DoctoPal · All rights reserved",
    tr: "© 2026 DoctoPal · Tüm hakları saklıdır",
  },
}
