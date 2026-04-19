// © 2026 DoctoPal — All Rights Reserved
// /about page namespace — founder story + mission + team + values + contact.
// Legal note (1219 sK): do NOT use "hekim" / "doktor" to describe the
// founders. "Tıp Fakültesi Öğrencisi" / "medical student" only.

import type { TranslationEntry } from "../translations"

export const aboutTranslations: Record<string, TranslationEntry> = {
  // ─── meta ────────────────────────────────────────────
  "about.meta.title": {
    en: "About — DoctoPal",
    tr: "Hakkımızda — DoctoPal",
  },
  "about.meta.description": {
    en: "An assistant born in the middle of clinical chaos. The DoctoPal story, told by two medical students.",
    tr: "Klinik kaosun ortasında doğan bir asistan. İki tıp öğrencisinin DoctoPal hikayesi.",
  },

  // ─── hero ────────────────────────────────────────────
  "about.hero.h1": { en: "The DoctoPal Story", tr: "DoctoPal'ın Hikayesi" },
  "about.hero.subtitle": {
    en: "An assistant born in the middle of clinical chaos.",
    tr: "Klinik kaosun ortasında doğan bir asistan.",
  },

  // ─── mission ─────────────────────────────────────────
  "about.mission.label": { en: "OUR MISSION", tr: "MİSYONUMUZ" },
  "about.mission.body": {
    en: "To fit clinical knowledge into every Türkiye family's phone so no one feels alone while managing their loved ones' health.",
    tr: "Türkiye'deki her ailenin, sevdiklerinin sağlığını yönetirken yalnız hissetmemesi için, klinik bilgiyi cep telefonuna sığdırmak.",
  },

  // ─── founder story ───────────────────────────────────
  "about.story.heading": {
    en: "Founder Story: From Clinic Chaos to Confidence in Your Pocket",
    tr: "Kurucu Hikayesi: Poliklinik Kaosundan Cebinizdeki Güvene",
  },
  "about.story.p1": {
    en: "Our years in the corridors of medical school taught us how tangled healthcare really is. The picture in the clinic was always the same: an anxious adult child, a prescription full of terms they didn't understand, unknown interactions, forgotten questions...",
    tr: "Tıp fakültesinin koridorlarında geçen yıllarımız, bize sağlık hizmetinin ne kadar karmaşık olduğunu öğretti. Polikliniklerde gözlemlediğimiz tablo hep aynıydı: kaygılı bir evlat, anlamadığı tıbbi terimlerle dolu reçete, bilmediği etkileşimler, unutulan sorular...",
  },
  "about.story.p2": {
    en: "The hardest part wasn't the patients themselves — it was the families who wanted to be there for their loved ones but couldn't close the medical knowledge gap. The kids searching for the answer to \"Is dad's new pill compatible with his current meds?\", afraid they'd forget what to ask at the appointment, unable to sleep when out of town in case something happened.",
    tr: "En zor olan ise hastaların kendisi değil, sevdiklerinin yanında olmak isteyen ama tıbbi bilgi açığını kapatamayan ailelerdi. 'Babamın yeni ilacı eski ilaçlarıyla uyumlu mu?' sorusuna cevap arayan, doktor randevusunda neyi sormayı unutacağından korkan, şehir dışındayken bir şey olur diye uyuyamayan o evlatlar.",
  },
  "about.story.p3": {
    en: "DoctoPal was born to put an end to exactly that helplessness and medical knowledge asymmetry. As two young people studying medicine and also believing in the transformative power of AI and technology, we rolled up our sleeves to solve that chaos in the clinic.",
    tr: "DoctoPal, işte tam olarak bu çaresizliğe ve tıbbi bilgi asimetrisine bir son vermek için doğdu. Tıp fakültesinde eğitim gören, aynı zamanda teknolojinin ve yapay zekanın dönüştürücü gücüne inanan iki genç olarak, klinikteki o karmaşayı çözmek için kolları sıvadık.",
  },
  "about.story.p4": {
    en: "We are not just students memorizing diseases or developers writing code. We are children who carry the same concerns as you. DoctoPal was born from the desire to turn that concern into a solution.",
    tr: "Bizler sadece hastalıkları ezberleyen öğrenciler veya kod yazan geliştiriciler değiliz. Bizler, sizinle aynı kaygıları taşıyan evlatlarız. DoctoPal, bu kaygıyı bir çözüme dönüştürme isteğinden doğdu.",
  },

  // ─── vision ──────────────────────────────────────────
  "about.vision.label": { en: "OUR VISION", tr: "VİZYONUMUZ" },
  "about.vision.body": {
    en: "By the end of 2027, to bring confidence to the health management of 100,000 families in Türkiye; after that, to become a reference in family health on the global market with Turkish, Arabic, and English support.",
    tr: "2027 yılı sonuna kadar Türkiye'de 100.000 ailenin sağlık yönetimine güven katmak; sonrasında küresel pazarda Türkçe, Arapça ve İngilizce desteğiyle aile sağlığında bir referans olmak.",
  },

  // ─── values ──────────────────────────────────────────
  "about.values.sectionTitle": { en: "Our Values", tr: "Değerlerimiz" },
  "about.values.value1Title": { en: "Clinical Accuracy", tr: "Klinik Doğruluk" },
  "about.values.value1Body": {
    en: "Every feature is supported by evidence-based medicine principles and current literature. PubMed and OpenFDA are the backbone of our data.",
    tr: "Her özellik, kanıta dayalı tıp prensipleri ve güncel literatürle desteklenir. PubMed ve OpenFDA verilerimizin omurgasıdır.",
  },
  "about.values.value2Title": { en: "Empathic Design", tr: "Empatik Tasarım" },
  "about.values.value2Body": {
    en: "We are adult children carrying the same worries you do. Every screen we design is crafted as carefully as if it were for our own families.",
    tr: "Bizler de aynı endişeleri taşıyan evlatlarız. Tasarladığımız her ekran, kendi ailelerimiz için yapılmış gibi titizlikle hazırlanır.",
  },
  "about.values.value3Title": { en: "Data Privacy", tr: "Veri Mahremiyeti" },
  "about.values.value3Body": {
    en: "Your health data stays within Türkiye on a KVKK-compliant infrastructure. No international transfers, no third-party sharing.",
    tr: "Sağlık verileriniz Türkiye sınırlarında, KVKK uyumlu altyapıda saklanır. Yurt dışına aktarım yok, üçüncü taraf paylaşım yok.",
  },

  // ─── team ────────────────────────────────────────────
  "about.team.sectionTitle": { en: "Meet Our Team", tr: "Ekibimizle Tanışın" },
  "about.team.founder1Name": { en: "Taha Ahmet Sıbıç", tr: "Taha Ahmet Sıbıç" },
  "about.team.founder1Role": { en: "Co-founder", tr: "Co-founder" },
  "about.team.founder2Name": { en: "İpek Özen", tr: "İpek Özen" },
  "about.team.founder2Role": { en: "Co-founder", tr: "Co-founder" },

  // ─── contact CTA ─────────────────────────────────────
  "about.contact.heading": { en: "Contact", tr: "İletişim" },
  "about.contact.body": {
    en: "For questions, feedback, or partnership requests:",
    tr: "Sorularınız, geri bildirimleriniz, iş birliği teklifleriniz için:",
  },
  "about.contact.email": { en: "info@doctopal.com", tr: "info@doctopal.com" },
  "about.contact.responseTime": {
    en: "We reply to every email within 48 hours. Because every piece of feedback makes DoctoPal one step better.",
    tr: "Her e-postaya 48 saat içinde yanıt veriyoruz. Çünkü her geri bildirim, DoctoPal'ı bir adım daha iyi hale getiriyor.",
  },
  "about.contact.ctaButton": {
    en: "Start Your Family's Health Journey Today →",
    tr: "Ailenizin Sağlık Yolculuğuna Bugün Başlayın →",
  },
}
