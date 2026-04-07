// © 2026 Doctopal — All Rights Reserved
// ============================================
// Centralized Translation System — v2.0
// ============================================
//
// 🌍 YENİ DİL EKLEMEK İÇİN:
//
// 1. SUPPORTED_LANGUAGES dizisine yeni dil ekle (aşağıda)
// 2. Lang type'a yeni dili ekle
// 3. Her çeviri key'ine yeni dil alanını ekle
// 4. Bitti! Navbar toggle ve tüm sayfalar otomatik çalışır.
//
// Örnek: Arapça eklemek için:
//   - SUPPORTED_LANGUAGES'a { code: "ar", label: "العربية", short: "AR", flag: "sa" } ekle
//   - Lang type'a "ar" ekle
//   - Her key'e ar: "..." ekle
//
// ============================================

// ── Desteklenen Diller ──────────────────────
// Yeni dil eklerken SADECE buraya satır ekle + aşağıdaki t objesine çevirileri ekle
export const SUPPORTED_LANGUAGES = [
  { code: "en" as const, label: "English", short: "EN", flag: null, dir: "ltr" },
  { code: "tr" as const, label: "Türkçe", short: "TR", flag: "tr", dir: "ltr" },
  // { code: "ar", label: "العربية", short: "AR", flag: "sa", dir: "rtl" },
  // { code: "de", label: "Deutsch", short: "DE", flag: "de", dir: "ltr" },
] as const

export type Lang = (typeof SUPPORTED_LANGUAGES)[number]["code"]
export const DEFAULT_LANG: Lang = "en"

// ── Çeviri Tipi ─────────────────────────────
// Her key'in tüm desteklenen dillerde çevirisi olmalı
type TranslationEntry = Record<Lang, string>

// ── Çeviriler ───────────────────────────────
// Yeni dil eklerken her key'e yeni alan ekle (örn: ar: "...")
const t: Record<string, TranslationEntry> = {

  // ══════════════════════════════════════════
  // Global / Shared
  // ══════════════════════════════════════════
  "emergency.banner": {
    en: "If you are experiencing a life-threatening emergency, call 112 / 911 immediately.",
    tr: "Hayati tehlike yaşıyorsanız hemen 112 / 911'i arayın.",
  },
  "disclaimer.banner": {
    en: "This application does not replace medical advice. Always consult your healthcare provider.",
    tr: "Bu uygulama tıbbi tavsiye niteliği taşımaz. Her zaman sağlık profesyonelinize danışın.",
  },
  "disclaimer.tool": {
    en: "This tool provides general health information based on published research. It is not a substitute for professional medical advice. Always consult your healthcare provider.",
    tr: "Bu araç yayımlanmış araştırmalara dayalı genel sağlık bilgisi sunar. Profesyonel tıbbi tavsiyenin yerini tutmaz. Her zaman sağlık profesyonelinize danışın.",
  },
  "footer.disclaimer.label": {
    en: "Medical Disclaimer:",
    tr: "Tıbbi Sorumluluk Reddi:",
  },
  "footer.disclaimer.text": {
    en: "Doctopal is an educational wellness tool and does not provide medical diagnosis or treatment. All recommendations are based on published scientific research. Always consult your healthcare provider before starting any supplement or making changes to your medication.",
    tr: "Doctopal bir eğitim amaçlı sağlık aracıdır; tıbbi teşhis veya tedavi sunmaz. Tüm öneriler yayımlanmış bilimsel araştırmalara dayanır. Herhangi bir takviye başlamadan veya ilaç değişikliği yapmadan önce sağlık profesyonelinize danışın.",
  },
  "footer.tagline": {
    en: "Evidence-based integrative medicine · Backed by peer-reviewed research",
    tr: "Kanıta dayalı bütünleştirici tıp · Hakemli araştırmalarla desteklenir",
  },

  // ══════════════════════════════════════════
  // Header / Nav
  // ══════════════════════════════════════════
  "nav.interaction": { en: "Interaction Checker", tr: "Etkileşim Denetleyici" },
  "nav.assistant": { en: "Health Assistant", tr: "Sağlık Asistanı" },
  "nav.bloodtest": { en: "Blood Test Analysis", tr: "Kan Tahlili Analizi" },
  "nav.getStarted": { en: "Get Started", tr: "Başla" },
  "nav.signInUp": { en: "Sign In / Sign Up", tr: "Giriş / Kayıt" },
  "nav.login": { en: "Sign In", tr: "Giriş Yap" },
  "nav.loginRequired": { en: "Please sign in to use this tool.", tr: "Bu aracı kullanmak için giriş yapın." },
  "nav.loginToAccess": { en: "Sign in to access this feature", tr: "Bu özelliğe erişmek için giriş yapın" },
  "nav.profileSettings": { en: "Profile Settings", tr: "Profil Ayarları" },
  "nav.signOut": { en: "Sign Out", tr: "Çıkış Yap" },

  // ══════════════════════════════════════════
  // Interaction Checker
  // ══════════════════════════════════════════
  "ic.title": { en: "Drug-Herb Interaction Checker", tr: "İlaç-Bitki Etkileşim Denetleyicisi" },
  "ic.subtitle": {
    en: "Enter your medications and describe your concern — we'll find safe herbal alternatives backed by science.",
    tr: "İlaçlarınızı girin ve endişenizi açıklayın — bilimle desteklenmiş güvenli bitkisel alternatifler bulalım.",
  },
  "ic.step1": { en: "Add your medications", tr: "İlaçlarınızı ekleyin" },
  "ic.step2": { en: "Describe your concern", tr: "Endişenizi açıklayın" },
  "ic.step3": { en: "Get safe alternatives", tr: "Güvenli alternatifler alın" },
  "ic.concernLabel": { en: "What's your health concern?", tr: "Sağlık endişeniz nedir?" },
  "ic.concernPlaceholder": {
    en: "Describe your symptom or health goal (e.g., 'I have trouble sleeping', 'I want to reduce my cholesterol naturally', 'I feel anxious and stressed')",
    tr: "Semptomunuzu veya sağlık hedefinizi açıklayın (örn. 'Uyumakta güçlük çekiyorum', 'Kolesterolümü doğal yollarla düşürmek istiyorum')",
  },
  "ic.runSafetyAnalysis": { en: "Run Safety Analysis", tr: "Güvenlik Analizini Başlat" },
  "ic.analyzing": { en: "Analyzing interactions...", tr: "Etkileşimler analiz ediliyor..." },
  "ic.checkBtn": { en: "Check Interactions", tr: "Etkileşimleri Kontrol Et" },
  "ic.emergencyDisabled": { en: "Emergency detected — Analysis disabled", tr: "Acil durum — Analiz devre dışı" },
  "ic.loadingTitle": { en: "Analyzing Interactions...", tr: "Etkileşimler Analiz Ediliyor..." },
  "ic.loadingFda": { en: "Looking up your medications in FDA database", tr: "İlaçlarınız FDA veritabanında aranıyor" },
  "ic.loadingPubmed": { en: "Searching PubMed for relevant research", tr: "PubMed'de ilgili araştırmalar taranıyor" },
  "ic.loadingAi": { en: "Running AI safety analysis", tr: "AI güvenlik analizi çalıştırılıyor" },
  "ic.errorTitle": { en: "Analysis Failed", tr: "Analiz Başarısız" },
  "ic.tryAgain": { en: "Try Again", tr: "Tekrar Dene" },
  "ic.signIn": { en: "Sign in", tr: "Giriş yapın" },
  "ic.signInNote": {
    en: "to get personalized safety checks based on your health profile (pregnancy, allergies, kidney/liver conditions).",
    tr: "sağlık profilinize dayalı kişiselleştirilmiş güvenlik kontrolleri alın (gebelik, alerjiler, böbrek/karaciğer durumları).",
  },
  "ic.tryExample": { en: "Try an example", tr: "Örnek deneyin" },

  // ══════════════════════════════════════════
  // Health Assistant
  // ══════════════════════════════════════════
  "ha.title": { en: "Health Assistant", tr: "Sağlık Asistanı" },
  "ha.subtitle": {
    en: "Ask evidence-based health questions — powered by PubMed research",
    tr: "Kanıta dayalı sağlık soruları sorun — PubMed araştırmalarıyla desteklenir",
  },
  "ha.tryAsking": { en: "Try asking:", tr: "Şunu sormayı deneyin:" },

  // ══════════════════════════════════════════
  // Blood Test
  // ══════════════════════════════════════════
  "bt.title": { en: "Blood Test Analysis", tr: "Kan Tahlili Analizi" },
  "bt.subtitle": {
    en: "Enter your blood test values for evidence-based supplement & lifestyle recommendations",
    tr: "Kanıta dayalı takviye ve yaşam tarzı önerileri için kan tahlili değerlerinizi girin",
  },
  "bt.guestMode": { en: "Guest mode:", tr: "Misafir modu:" },
  "bt.guestText": {
    en: "You can analyze your blood test, but for personalized recommendations based on your medications and health profile,",
    tr: "Kan tahlilinizi analiz edebilirsiniz, ancak ilaçlarınıza ve sağlık profilinize dayalı kişiselleştirilmiş öneriler için",
  },
  "bt.createAccount": { en: "create a free account", tr: "ücretsiz hesap oluşturun" },
  "bt.analysisError": { en: "Analysis Error", tr: "Analiz Hatası" },
  "bt.yourResults": { en: "Your Results", tr: "Sonuçlarınız" },
  "bt.runNew": { en: "Run New Analysis", tr: "Yeni Analiz Yap" },

  // ══════════════════════════════════════════
  // BloodTestForm
  // ══════════════════════════════════════════
  "btf.genderLabel": {
    en: "Biological Sex (for gender-specific reference ranges)",
    tr: "Biyolojik Cinsiyet (cinsiyete özgü referans aralıkları için)",
  },
  "btf.male": { en: "Male", tr: "Erkek" },
  "btf.female": { en: "Female", tr: "Kadın" },
  "btf.info": {
    en: "Enter the values from your blood test report. You only need to fill in the markers you have — leave the rest blank. At least 1 value is required.",
    tr: "Kan tahlili raporunuzdaki değerleri girin. Sadece sahip olduğunuz belirteçleri doldurun — geri kalanını boş bırakın. En az 1 değer gereklidir.",
  },
  "btf.markers": { en: "markers", tr: "belirteç" },
  "btf.filled": { en: "filled", tr: "dolu" },
  "btf.analyzing": { en: "Analyzing...", tr: "Analiz ediliyor..." },
  "btf.analyze": { en: "Analyze Blood Test", tr: "Kan Tahlilini Analiz Et" },
  "btf.fillDemo": { en: "Fill Demo Data", tr: "Demo Veri Doldur" },
  "btf.clearAll": { en: "Clear all", tr: "Temizle" },

  // ══════════════════════════════════════════
  // BloodTestForm Category Labels
  // ══════════════════════════════════════════
  "cat.lipid": { en: "Lipid Panel", tr: "Lipid Paneli" },
  "cat.vitamin": { en: "Vitamins", tr: "Vitaminler" },
  "cat.mineral": { en: "Minerals", tr: "Mineraller" },
  "cat.metabolic": { en: "Metabolic", tr: "Metabolik" },
  "cat.thyroid": { en: "Thyroid", tr: "Tiroid" },
  "cat.inflammation": { en: "Inflammation", tr: "İltihap" },
  "cat.liver": { en: "Liver", tr: "Karaciğer" },
  "cat.kidney": { en: "Kidney", tr: "Böbrek" },
  "cat.blood_count": { en: "Blood Count", tr: "Kan Sayımı" },

  // ══════════════════════════════════════════
  // Marker Names (blood test markers)
  // ══════════════════════════════════════════
  "marker.total_cholesterol": { en: "Total Cholesterol", tr: "Toplam Kolesterol" },
  "marker.ldl": { en: "LDL Cholesterol", tr: "LDL Kolesterol" },
  "marker.hdl": { en: "HDL Cholesterol", tr: "HDL Kolesterol" },
  "marker.triglycerides": { en: "Triglycerides", tr: "Trigliseritler" },
  "marker.vitamin_d": { en: "Vitamin D (25-OH)", tr: "D Vitamini (25-OH)" },
  "marker.vitamin_b12": { en: "Vitamin B12", tr: "B12 Vitamini" },
  "marker.folate": { en: "Folate (Folic Acid)", tr: "Folat (Folik Asit)" },
  "marker.ferritin": { en: "Ferritin", tr: "Ferritin" },
  "marker.iron_serum": { en: "Iron (Serum)", tr: "Demir (Serum)" },
  "marker.magnesium": { en: "Magnesium", tr: "Magnezyum" },
  "marker.calcium": { en: "Calcium", tr: "Kalsiyum" },
  "marker.zinc": { en: "Zinc", tr: "Çinko" },
  "marker.fasting_glucose": { en: "Fasting Glucose", tr: "Açlık Şekeri" },
  "marker.hba1c": { en: "HbA1c", tr: "HbA1c" },
  "marker.insulin": { en: "Insulin", tr: "İnsülin" },
  "marker.tsh": { en: "TSH", tr: "TSH" },
  "marker.free_t4": { en: "Free T4", tr: "Serbest T4" },
  "marker.free_t3": { en: "Free T3", tr: "Serbest T3" },
  "marker.crp": { en: "C-Reactive Protein (CRP)", tr: "C-Reaktif Protein (CRP)" },
  "marker.homocysteine": { en: "Homocysteine", tr: "Homosistein" },
  "marker.alt": { en: "ALT", tr: "ALT" },
  "marker.ast": { en: "AST", tr: "AST" },
  "marker.ggt": { en: "GGT", tr: "GGT" },
  "marker.creatinine": { en: "Creatinine", tr: "Kreatinin" },
  "marker.bun": { en: "BUN", tr: "BUN" },
  "marker.uric_acid": { en: "Uric Acid", tr: "Ürik Asit" },
  "marker.hemoglobin": { en: "Hemoglobin", tr: "Hemoglobin" },
  "marker.hematocrit": { en: "Hematocrit", tr: "Hematokrit" },
  "marker.wbc": { en: "White Blood Cells", tr: "Beyaz Kan Hücreleri" },
  "marker.platelets": { en: "Platelets", tr: "Trombositler" },

  // ══════════════════════════════════════════
  // ResultDashboard
  // ══════════════════════════════════════════
  "rd.optimal": { en: "Optimal", tr: "Optimal" },
  "rd.needsAttention": { en: "Needs Attention", tr: "Dikkat Gerekli" },
  "rd.recommendations": { en: "Recommendations", tr: "Öneriler" },
  "rd.summary": { en: "Summary", tr: "Özet" },
  "rd.tabResults": { en: "Test Results", tr: "Test Sonuçları" },
  "rd.tabSupplements": { en: "Supplements", tr: "Takviyeler" },
  "rd.tabLifestyle": { en: "Lifestyle", tr: "Yaşam Tarzı" },
  "rd.tabDoctor": { en: "For Your Doctor", tr: "Doktorunuz İçin" },
  "rd.noSupplements": {
    en: "No supplement recommendations — your values look good!",
    tr: "Takviye önerisi yok — değerleriniz iyi görünüyor!",
  },
  "rd.noLifestyle": {
    en: "No specific lifestyle changes recommended.",
    tr: "Belirli bir yaşam tarzı değişikliği önerilmedi.",
  },
  "rd.dosage": { en: "Dosage", tr: "Doz" },
  "rd.duration": { en: "Duration", tr: "Süre" },
  "rd.doctorTitle": { en: "Points to Discuss with Your Doctor", tr: "Doktorunuzla Tartışılacak Konular" },
  "rd.noDoctor": {
    en: "No specific discussion points identified.",
    tr: "Belirli bir tartışma noktası belirlenmedi.",
  },
  "rd.pdfTitle": { en: "Doctor Bridge — PDF Report", tr: "Doktor Köprüsü — PDF Rapor" },
  "rd.pdfDesc": {
    en: "Download a professional PDF report to share with your healthcare provider. It includes all test results, recommendations, and PubMed sources in a medical-friendly format.",
    tr: "Sağlık profesyonelinizle paylaşmak için profesyonel bir PDF rapor indirin. Tüm test sonuçları, öneriler ve PubMed kaynakları tıbbi uyumlu formatta yer alır.",
  },
  "rd.pdfLoading": { en: "Generating PDF...", tr: "PDF oluşturuluyor..." },
  "rd.pdfBtn": { en: "Download PDF for Doctor", tr: "Doktor İçin PDF İndir" },
  "rd.disclaimerTitle": { en: "Important Disclaimer", tr: "Önemli Sorumluluk Reddi" },

  // ══════════════════════════════════════════
  // DrugInput
  // ══════════════════════════════════════════
  "di.label": { en: "Your Medications", tr: "İlaçlarınız" },
  "di.add": { en: "Add", tr: "Ekle" },
  "di.placeholderEmpty": {
    en: "Enter medication name (e.g., Metformin, Lisinopril)",
    tr: "İlaç adı girin (örn. Metformin, Lisinopril)",
  },
  "di.placeholderMore": { en: "Add another medication...", tr: "Başka bir ilaç ekleyin..." },
  "di.hint": {
    en: "Enter brand names (Advil, Glifor) or generic names (Ibuprofen, Metformin). We'll identify the active ingredients automatically.",
    tr: "Marka adı (Advil, Glifor) veya etken madde adı (Ibuprofen, Metformin) girin. Etken maddeleri otomatik olarak belirleyeceğiz.",
  },

  // ══════════════════════════════════════════
  // ChatInterface
  // ══════════════════════════════════════════
  "chat.emptyTitle": { en: "Ask me anything about health & herbs", tr: "Sağlık ve bitkiler hakkında her şeyi sorun" },
  "chat.emptyDesc": {
    en: "I use PubMed research to give you evidence-based answers about supplements, herbs, and nutrition.",
    tr: "Takviyeler, bitkiler ve beslenme hakkında kanıta dayalı yanıtlar vermek için PubMed araştırmalarını kullanıyorum.",
  },
  "chat.freeRemaining": { en: "free queries remaining", tr: "ücretsiz sorgu hakkınız kaldı" },
  "chat.freeUsedUp": { en: "Free queries used up", tr: "Ücretsiz sorgu hakkınız bitti" },
  "chat.signUpUnlimited": { en: "Sign up for unlimited", tr: "Sınırsız erişim için kayıt olun" },
  "chat.placeholderFile": { en: "Add a message or just send the file...", tr: "Bir mesaj ekleyin veya dosyayı gönderin..." },
  "chat.placeholderDefault": {
    en: "Ask a health question (e.g., 'Does omega-3 reduce inflammation?')",
    tr: "Bir sağlık sorusu sorun (örn. 'Omega-3 iltihabı azaltır mı?')",
  },

  // ══════════════════════════════════════════
  // ConversationHistory
  // ══════════════════════════════════════════
  "ch.history": { en: "History", tr: "Geçmiş" },
  "ch.title": { en: "Conversation History", tr: "Konuşma Geçmişi" },
  "ch.empty": { en: "No conversations yet", tr: "Henüz konuşma yok" },
  "ch.emptyDesc": { en: "Your health questions will appear here", tr: "Sağlık sorularınız burada görünecek" },
  "ch.showingLast": { en: "Showing last", tr: "Son" },
  "ch.conversations": { en: "conversations", tr: "konuşma gösteriliyor" },

  // ══════════════════════════════════════════
  // InteractionResult
  // ══════════════════════════════════════════
  "ir.medsAnalyzed": { en: "Medications Analyzed", tr: "Analiz Edilen İlaçlar" },
  "ir.medsNotFound": {
    en: "Some medications were not found in FDA database. Analysis based on AI knowledge — verify with your pharmacist.",
    tr: "Bazı ilaçlar FDA veritabanında bulunamadı. Analiz AI bilgisine dayanmaktadır — eczacınızla doğrulayın.",
  },
  "ir.profileAlerts": { en: "Profile-Based Safety Alerts", tr: "Profil Tabanlı Güvenlik Uyarıları" },
  "ir.avoidThese": { en: "Avoid These", tr: "Bunlardan Kaçının" },
  "ir.useWithCaution": { en: "Use with Caution", tr: "Dikkatli Kullanın" },
  "ir.safeAlternatives": { en: "Safe Alternatives", tr: "Güvenli Alternatifler" },
  "ir.generalAdvice": { en: "General Advice", tr: "Genel Tavsiye" },
  "ir.mechanism": { en: "Mechanism", tr: "Mekanizma" },
  "ir.interactions": { en: "Interactions", tr: "Etkileşimler" },
  "ir.dosage": { en: "Dosage", tr: "Doz" },
  "ir.maxDuration": { en: "Max Duration", tr: "Maksimum Süre" },
  "ir.sources": { en: "Sources", tr: "Kaynaklar" },

  // ══════════════════════════════════════════
  // Emergency
  // ══════════════════════════════════════════
  "emergency.callPre": { en: "If you are experiencing a life-threatening emergency, call", tr: "Hayati tehlike yaşıyorsanız hemen" },
  "emergency.callPost": { en: "immediately.", tr: "numaralı hattı arayın." },
  "ic.emergencyCall": { en: "Call 112 Now", tr: "Hemen 112'yi Ara" },
  "ic.emergencyHerbal": { en: "Herbal analysis disabled", tr: "Bitkisel analiz devre dışı" },

  // ══════════════════════════════════════════
  // Landing Page
  // ══════════════════════════════════════════
  "lp.heroHeading1": { en: "Science meets", tr: "Bilim ile" },
  "lp.heroHeadingItalic": { en: "nature\u2019s", tr: "doğanın şifası" },
  "lp.heroHeadingEnd": { en: "healing", tr: "buluşuyor" },
  "lp.heroDescription": {
    en: "The world\u2019s first evidence-based integrative health assistant. Cross-check medications, interpret blood tests, and discover safe phytotherapy \u2014 backed by peer-reviewed research.",
    tr: "Dünyanın ilk kanıta dayalı bütünleştirici sağlık asistanı \u2014 ilaç etkileşimlerini kontrol edin, kan tahlillerinizi yorumlayın ve bilimsel kaynaklara dayalı güvenli fitoterapi önerileri alın.",
  },
  "lp.searchPlaceholder": { en: "Enter a drug or health question...", tr: "İlaç adı veya sağlık sorunuzu yazın..." },
  "lp.chatPlaceholder": { en: "Ask me anything about health...", tr: "Sağlık hakkında bir şey sor..." },
  "lp.assistantTitle": { en: "Health Assistant", tr: "Sağlık Asistanı" },
  "lp.assistantSubtitle": { en: "Evidence-based, personalized for you", tr: "Kanıta dayalı, sana özel" },
  "lp.assistantGreeting": { en: "Hi {name}! How can I help you today? Ask me about supplements, medications, nutrition, sleep — anything health related.", tr: "Merhaba {name}! Bugün nasıl yardımcı olabilirim? Takviye, ilaç, beslenme, uyku — sağlıkla ilgili her şeyi sorabilirsin." },
  "lp.assistantGreetingGeneric": { en: "Hi! How can I help you today? Ask me about supplements, medications, nutrition, sleep — anything health related.", tr: "Merhaba! Bugün nasıl yardımcı olabilirim? Takviye, ilaç, beslenme, uyku — sağlıkla ilgili her şeyi sorabilirsin." },
  "lp.searchButton": { en: "Check Now", tr: "Sorgula" },
  "lp.featureTitle1": { en: "Four pillars of", tr: "Bütünleştirici sağlığın" },
  "lp.featureTitle2": { en: "integrative health", tr: "dört temel direği" },
  "lp.explore": { en: "Explore", tr: "Keşfet" },
  "lp.heroBadge": { en: "Evidence-Based AI Health Assistant", tr: "Kanıta Dayalı AI Sağlık Asistanı" },
  "lp.tryAssistant": { en: "Try Health Assistant", tr: "Sağlık Asistanını Dene" },
  "lp.statBeta": { en: "Early Access", tr: "Erken Erişim" },
  "lp.statSources": { en: "Evidence-based sources", tr: "Kanıta dayalı kaynaklar" },
  "lp.statTools": { en: "Health tools", tr: "Sağlık aracı" },
  "lp.tag1": { en: "Medication interactions", tr: "İlaç etkileşimleri" },
  "lp.tag2": { en: "Omega-3 & inflammation", tr: "Omega-3 ve iltihap" },
  "lp.tag3": { en: "Valerian & sleep", tr: "Kediotu ve uyku" },
  "lp.tag4": { en: "Herbal & sedatives", tr: "Bitkisel ve sakinleştiriciler" },
  "lp.trust1": { en: "Evidence-backed research", tr: "Hakemli araştırmalara dayalı" },
  "lp.trust2": { en: "No diagnosis — decision support", tr: "Teşhis değil — karar desteği" },
  "lp.trust3": { en: "Instant safety PDF export", tr: "Doktora hazır PDF çıktısı" },
  "lp.trust4": { en: "KVKK & GDPR compliant", tr: "KVKK & GDPR uyumlu" },
  "lp.trust5": { en: "Harvard health system (CSI)", tr: "Harvard Sağlık Sistemi (CSI)" },
  "lp.feat1.title": { en: "Drug-Herb Interaction Engine", tr: "İlaç–Bitki Etkileşim Motoru" },
  "lp.feat1.desc": {
    en: "Resolves your meds via OpenFDA and lets you know which herbs are safe, risky, or dangerous — all citing PubMed.",
    tr: "İlaçlarınız OpenFDA aracılığıyla çözümlenir; hangi bitkilerin güvenli, riskli ya da tehlikeli olduğu PubMed kaynaklarıyla gösterilir.",
  },
  "lp.feat2.title": { en: "Evidence-Based Assistant", tr: "Kanıta Dayalı Sağlık Asistanı" },
  "lp.feat2.desc": {
    en: "Answers grounded answers (LMG) with database citations, dosing protocols, — no guessing, no hallucinations. Everyday.",
    tr: "Her yanıt PubMed veritabanına ve doz protokollerine dayanır — tahmin yok, uydurma yok. Günlük kullanıma uygun.",
  },
  "lp.feat3.title": { en: "Blood Test Analysis", tr: "Kan Tahlili Analizi" },
  "lp.feat3.desc": {
    en: "Upload your test results and get personalized lifestyle + supplement plans — with your doctor-ready PDF. Exportable.",
    tr: "Tahlil sonuçlarınızı yükleyin; kişiselleştirilmiş yaşam tarzı ve takviye önerileri ile doktorunuza hazır PDF alın.",
  },
  "lp.feat4.title": { en: "Three-Layer Safety", tr: "Üç Katmanlı Güvenlik" },
  "lp.feat4.desc": {
    en: "Emergency detection — drug screening — AI guardrails. Three layers, real-time, trust-first.",
    tr: "Acil durum tespiti, ilaç taraması ve yapay zeka güvenlik katmanları — üç aşama, gerçek zamanlı, güven öncelikli.",
  },

  // ══════════════════════════════════════════
  // Example Queries (health-assistant)
  // ══════════════════════════════════════════
  "ha.ex1": { en: "Does omega-3 actually reduce inflammation?", tr: "Omega-3 gerçekten iltihabı azaltır mı?" },
  "ha.ex2": { en: "What is the evidence for turmeric (curcumin)?", tr: "Zerdeçal (kurkumin) için kanıtlar nelerdir?" },
  "ha.ex3": { en: "How does valerian root work for sleep?", tr: "Kediotu kökü uyku için nasıl çalışır?" },
  "ha.ex4": { en: "Is magnesium effective for anxiety?", tr: "Magnezyum anksiyete için etkili mi?" },
  "ha.ex5": { en: "What are the benefits of ashwagandha?", tr: "Ashwagandha'nın faydaları nelerdir?" },
  "ha.ex6": { en: "Does ginger help with nausea?", tr: "Zencefil mide bulantısına yardımcı olur mu?" },

  // ══════════════════════════════════════════
  // Example Queries (interaction-checker)
  // ══════════════════════════════════════════
  "ic.ex1.concern": { en: "I have trouble sleeping at night", tr: "Geceleri uyumakta güçlük çekiyorum" },
  "ic.ex1.label": { en: "Metformin + Sleep Issues", tr: "Metformin + Uyku Sorunları" },
  "ic.ex2.concern": { en: "I want to try herbal supplements for joint pain", tr: "Eklem ağrısı için bitkisel takviye denemek istiyorum" },
  "ic.ex2.label": { en: "Warfarin + Joint Pain", tr: "Warfarin + Eklem Ağrısı" },
  "ic.ex3.concern": { en: "I feel anxious and stressed lately", tr: "Son zamanlarda endişeli ve stresli hissediyorum" },
  "ic.ex3.label": { en: "Lisinopril + Metformin", tr: "Lisinopril + Metformin" },
  "ic.ex4.concern": { en: "I want something natural to boost my energy", tr: "Enerjimi artırmak için doğal bir şey istiyorum" },
  "ic.ex4.label": { en: "Sertraline + Low Energy", tr: "Sertralin + Düşük Enerji" },

  // ══════════════════════════════════════════
  // Chat loading / emergency
  // ══════════════════════════════════════════
  "chat.analyzing": { en: "Analyzing...", tr: "Analiz ediliyor..." },
  "chat.analyzeFile": { en: "Please analyze the uploaded file(s):", tr: "Yüklenen dosyayı analiz et:" },
  "chat.analyzingFile": { en: "Analyzing your file...", tr: "Dosyanız analiz ediliyor..." },
  "chat.emergencyTitle": { en: "EMERGENCY WARNING", tr: "ACİL UYARI" },

  // ══════════════════════════════════════════
  // Onboarding — Medications Step
  // ══════════════════════════════════════════
  "onb.noMeds": { en: "I don't take any medications", tr: "Herhangi bir ilaç kullanmıyorum" },
  "onb.yourMeds": { en: "Your medications:", tr: "İlaçların:" },
  "onb.addMed": { en: "Add a medication", tr: "İlaç ekle" },
  "onb.brandName": { en: "Brand Name", tr: "İlaç Adı (Marka)" },
  "onb.brandPlaceholder": { en: "e.g., Glifor, Coumadin", tr: "ör. Glifor, Coumadin" },
  "onb.genericName": { en: "Generic / Active Ingredient", tr: "Etken Madde" },
  "onb.genericPlaceholder": { en: "e.g., Metformin, Warfarin", tr: "ör. Metformin, Warfarin" },
  "onb.dosageLabel": { en: "Dosage (optional)", tr: "Doz (isteğe bağlı)" },
  "onb.dosagePlaceholder": { en: "e.g., 500mg, 10mg", tr: "ör. 500mg, 10mg" },
  "onb.freqLabel": { en: "Frequency (optional)", tr: "Kullanım sıklığı (isteğe bağlı)" },
  "onb.freqPlaceholder": { en: "e.g., twice daily, once at night", tr: "ör. günde 2 kez, gece 1 kez" },
  "onb.addMedBtn": { en: "Add Medication", tr: "İlaç Ekle" },
  "onb.medPrivacy": {
    en: "We check every herbal recommendation against your medications for safety. This information is encrypted and only visible to you.",
    tr: "Her bitkisel öneriyi ilaçlarınızla güvenlik açısından kontrol ederiz. Bu bilgi şifrelenmiş olup yalnızca size görünürdür.",
  },

  // ══════════════════════════════════════════
  // Medication Update Dialogs
  // ══════════════════════════════════════════
  "medReminder.text": {
    en: "It's been over 30 days since you last updated your medications. Are they still the same?",
    tr: "İlaçlarınızı en son 30 günden fazla önce güncellediniz. Hâlâ aynı mı?",
  },
  "medReminder.yesCurrent": { en: "Yes, still current", tr: "Evet, aynı" },
  "medReminder.update": { en: "Update medications", tr: "İlaçları güncelle" },

  // Daily
  "dailyMed.title": { en: "Daily Medication Confirmation", tr: "Günlük İlaç Onayı" },
  "dailyMed.description": {
    en: "Before continuing, please confirm your medications haven't changed since yesterday.",
    tr: "Devam etmeden önce, ilaçlarınızın dünden bu yana değişmediğini onaylayın.",
  },
  "dailyMed.confirmSame": { en: "Yes, same medications", tr: "Evet, ilaçlarım aynı" },
  "dailyMed.update": { en: "Update My Medications", tr: "İlaçlarımı Güncelle" },
  "dailyMed.blockerTitle": { en: "Confirm Your Medications", tr: "İlaçlarınızı Onaylayın" },
  "dailyMed.blockerDesc": {
    en: "For your safety, please confirm your medication list is still current before using the Health Assistant.",
    tr: "Güvenliğiniz için, Sağlık Asistanını kullanmadan önce ilaç listenizin güncel olduğunu onaylayın.",
  },

  // 15-day
  "refresh15.title": { en: "Medication List Review", tr: "İlaç Listesi Kontrolü" },
  "refresh15.desc": {
    en: "It's been over 15 days since you last reviewed your medication list. Please confirm or update your medications to continue.",
    tr: "İlaç listenizi en son 15 günden fazla önce kontrol ettiniz. Devam etmek için ilaçlarınızı onaylayın veya güncelleyin.",
  },
  "refresh15.warning": {
    en: "This step cannot be skipped. An accurate medication list is essential for safe recommendations.",
    tr: "Bu adım atlanamaz. Güvenli öneriler için doğru bir ilaç listesi zorunludur.",
  },
  "refresh15.confirmSame": { en: "No changes — same medications", tr: "İlaçlarım aynı, değişiklik yok" },
  "refresh15.update": { en: "Update My Medications", tr: "İlaçlarımı Güncelle" },

  // 30-day
  "refresh30.title": { en: "Monthly Health Profile Review", tr: "Aylık Sağlık Profili Kontrolü" },
  "refresh30.desc": {
    en: "It's been 30 days since your last profile review. Please confirm your medications and health status are still accurate.",
    tr: "Son profil kontrolünüzün üzerinden 30 gün geçti. İlaçlarınızın ve sağlık durumunuzun hâlâ doğru olduğunu onaylayın.",
  },
  "refresh30.warning": {
    en: "This step cannot be skipped. Your safety depends on an up-to-date health profile.",
    tr: "Bu adım atlanamaz. Güvenliğiniz güncel bir sağlık profiline bağlıdır.",
  },
  "refresh30.medsTitle": { en: "Review Your Medications", tr: "İlaçlarınızı Gözden Geçirin" },
  "refresh30.medsDesc": {
    en: "Please review your current medication list. If anything has changed, update your profile.",
    tr: "Lütfen mevcut ilaç listenizi gözden geçirin. Değişiklik varsa profilinizi güncelleyin.",
  },
  "refresh30.medsCheck": {
    en: "I confirm my medication list is still accurate",
    tr: "İlaç listemin hâlâ doğru olduğunu onaylıyorum",
  },
  "refresh30.next": { en: "Next", tr: "İleri" },
  "refresh30.updateMeds": { en: "Update Medications", tr: "İlaçları Güncelle" },
  "refresh30.healthTitle": { en: "Review Your Health Status", tr: "Sağlık Durumunuzu Gözden Geçirin" },
  "refresh30.healthDesc": {
    en: "Please confirm your health conditions, pregnancy status, and allergies are still accurate.",
    tr: "Sağlık durumunuzun, gebelik durumunuzun ve alerjilerinizin hâlâ doğru olduğunu onaylayın.",
  },
  "refresh30.healthCheck": {
    en: "I confirm my health information is still accurate",
    tr: "Sağlık bilgilerimin hâlâ doğru olduğunu onaylıyorum",
  },
  "refresh30.complete": { en: "Complete Review", tr: "Kontrolü Tamamla" },
  "refresh30.updateHealth": { en: "Update Health Info", tr: "Sağlık Bilgilerini Güncelle" },

  // ══════════════════════════════════════════
  // Interaction Checker: Load from Profile
  // ══════════════════════════════════════════
  "ic.loadFromProfile": { en: "Load My Medications", tr: "İlaçlarımı Yükle" },
  "ic.profileMedsLoaded": { en: "✓ Profile meds loaded", tr: "✓ Profil ilaçları yüklendi" },
  "ic.loadFromProfileDesc": { en: "Auto-fill from your profile", tr: "Profilden otomatik doldur" },
  "ic.loadFromProfileGuest": {
    en: "Sign in to load your medications automatically",
    tr: "İlaçlarınızı otomatik yüklemek için oturum açın",
  },
  "ic.medWarning": {
    en: "\u26a0\ufe0f If you're seeking advice for a symptom, make sure all your medications are entered completely. Incomplete lists may lead to unsafe recommendations.",
    tr: "\u26a0\ufe0f Bir semptom için tavsiye alıyorsanız, tüm ilaçlarınızı eksiksiz girdiğinizden emin olun. Eksik listeler güvensiz önerilere yol açabilir.",
  },

  // ══════════════════════════════════════════
  // Profile Page
  // ══════════════════════════════════════════
  "profile.title": { en: "Profile Settings", tr: "Profil Ayarları" },
  "profile.personalInfo": { en: "Personal Information", tr: "Kişisel Bilgiler" },
  "profile.name": { en: "Name", tr: "Ad Soyad" },
  "profile.email": { en: "Email", tr: "E-posta" },
  "profile.age": { en: "Age", tr: "Yaş" },
  "profile.gender": { en: "Gender", tr: "Cinsiyet" },
  "profile.activeMeds": { en: "Active Medications", tr: "Aktif İlaçlar" },
  "profile.lastUpdated": { en: "Last updated:", tr: "Son güncelleme:" },
  "profile.addMed": { en: "Add Medication", tr: "İlaç Ekle" },
  "profile.noMeds": { en: "No medications recorded", tr: "Kayıtlı ilaç yok" },
  "profile.confirmCurrent": { en: "Confirm medications are current", tr: "İlaçların güncel olduğunu onayla" },
  "profile.healthFlags": { en: "Health Flags", tr: "Sağlık Durumu" },
  "profile.never": { en: "Never", tr: "Hiçbir zaman" },
  "profile.confirmed": { en: "Confirmed!", tr: "Doğrulandı!" },
  "profile.noFlags": { en: "No health flags", tr: "Sağlık durumu kaydı yok" },
  "profile.dataPrivacy": { en: "Data & Privacy", tr: "Veri ve Gizlilik" },
  "profile.dataDesc": { en: "Manage your data according to GDPR/KVKK", tr: "KVKK/GDPR kapsamında verilerinizi yönetin" },
  "profile.downloadData": { en: "Download My Data", tr: "Verilerimi İndir" },
  "profile.deleteAccount": { en: "Delete My Account", tr: "Hesabımı Sil" },
  "profile.dataNote": {
    en: "Your data is encrypted and stored securely. It will be automatically deleted after 2 years of inactivity.",
    tr: "Verileriniz şifrelenmiş olarak güvenli bir şekilde saklanır. 2 yıl hareketsizlik sonrası otomatik silinir.",
  },

  // ══════════════════════════════════════════
  // Legal Pages
  // ══════════════════════════════════════════
  "legal.privacyTitle": { en: "Privacy Policy", tr: "Gizlilik Politikası" },
  "legal.termsTitle": { en: "Terms of Service", tr: "Kullanım Koşulları" },
  "legal.lastUpdated": { en: "Last updated", tr: "Son güncelleme" },
  "footer.privacy": { en: "Privacy Policy", tr: "Gizlilik Politikası" },
  "footer.terms": { en: "Terms of Service", tr: "Kullanım Koşulları" },
  "cookie.text": {
    en: "We use only essential cookies for session management and your preferences. No tracking or advertising cookies.",
    tr: "Yalnızca oturum yönetimi ve tercihleriniz için zorunlu çerezler kullanıyoruz. Takip veya reklam çerezi kullanılmamaktadır.",
  },
  "cookie.accept": { en: "Got it", tr: "Anladım" },

  // ══════════════════════════════════════════
  // Data Export / Delete
  // ══════════════════════════════════════════
  "data.exportTitle": { en: "Export My Data", tr: "Verilerimi Dışa Aktar" },
  "data.exportDesc": {
    en: "Download all your personal data in JSON format, including your profile, medications, allergies, and query history.",
    tr: "Profiliniz, ilaçlarınız, alerjileriniz ve sorgu geçmişiniz dahil tüm kişisel verilerinizi JSON formatında indirin.",
  },
  "data.exporting": { en: "Preparing download...", tr: "İndirme hazırlanıyor..." },
  "data.exportBtn": { en: "Download My Data", tr: "Verilerimi İndir" },
  "data.deleteTitle": { en: "Delete My Account", tr: "Hesabımı Sil" },
  "data.deleteDesc": {
    en: "Permanently delete your account and all associated data. This action cannot be undone.",
    tr: "Hesabınızı ve tüm ilişkili verilerinizi kalıcı olarak silin. Bu işlem geri alınamaz.",
  },
  "data.deleteConfirm": {
    en: "Are you sure? Type DELETE to confirm.",
    tr: "Emin misiniz? Onaylamak için SİL yazın.",
  },
  "data.deleteBtn": { en: "Delete Account", tr: "Hesabı Sil" },
  "data.deleting": { en: "Deleting account...", tr: "Hesap siliniyor..." },

  // ══════════════════════════════════════════
  // Calendar Hub
  // ══════════════════════════════════════════
  "cal.title": { en: "Calendar Hub", tr: "Takvim Merkezi" },
  "cal.subtitle": {
    en: "Track your medications, supplements, vitals, and health events in one place.",
    tr: "İlaçlarınızı, takviyelerinizi, vital bulgularınızı ve sağlık etkinliklerinizi tek yerden takip edin.",
  },
  "cal.today": { en: "Today", tr: "Bugün" },
  "cal.calendar": { en: "Calendar", tr: "Takvim" },
  "cal.vitals": { en: "Health Metrics", tr: "Sağlık Ölçümleri" },
  "cal.signInPrompt": {
    en: "Sign in to access your health calendar and track medications, vitals, and events.",
    tr: "Sağlık takviminize erişmek, ilaçlarınızı, vital bulgularınızı ve etkinliklerinizi takip etmek için oturum açın.",
  },
  "cal.signIn": { en: "Sign In", tr: "Giriş Yap" },
  "cal.medications": { en: "Medications", tr: "İlaçlar" },
  "cal.supplements": { en: "Supplements", tr: "Takviyeler" },
  "cal.water": { en: "Water Intake", tr: "Su Tüketimi" },
  "cal.events": { en: "Events", tr: "Etkinlikler" },
  "cal.noMeds": { en: "No active medications in your profile.", tr: "Profilinizde aktif ilaç bulunmuyor." },
  "cal.addMedsProfile": { en: "Add medications in Profile", tr: "Profil'den ilaç ekleyin" },
  "cal.noEvents": { en: "No events for this day.", tr: "Bu gün için etkinlik yok." },
  "cal.addEvent": { en: "Add Event", tr: "Etkinlik Ekle" },
  "cal.addVital": { en: "Add Measurement", tr: "Ölçüm Ekle" },
  "cal.glasses": { en: "glasses", tr: "bardak" },
  "cal.target": { en: "target", tr: "hedef" },
  "cal.completed": { en: "completed", tr: "tamamlandı" },
  "cal.pending": { en: "pending", tr: "bekliyor" },
  "cal.mon": { en: "Mon", tr: "Pzt" },
  "cal.tue": { en: "Tue", tr: "Sal" },
  "cal.wed": { en: "Wed", tr: "Çar" },
  "cal.thu": { en: "Thu", tr: "Per" },
  "cal.fri": { en: "Fri", tr: "Cum" },
  "cal.sat": { en: "Sat", tr: "Cmt" },
  "cal.sun": { en: "Sun", tr: "Paz" },
  "cal.prevMonth": { en: "Previous month", tr: "Önceki ay" },
  "cal.nextMonth": { en: "Next month", tr: "Sonraki ay" },
  "cal.eventsOn": { en: "Events on", tr: "Etkinlikler:" },

  // Add Event Dialog
  "cal.addEventTitle": { en: "Add Event", tr: "Etkinlik Ekle" },
  "cal.editEventTitle": { en: "Edit Event", tr: "Etkinliği Düzenle" },
  "cal.titleRequired": { en: "Title is required.", tr: "Başlık gereklidir." },
  "cal.dateRequired": { en: "Date is required.", tr: "Tarih gereklidir." },
  "cal.eventSaveFailed": { en: "Failed to save event.", tr: "Etkinlik kaydedilemedi." },
  "cal.validValues": { en: "Enter valid values.", tr: "Geçerli değerler girin." },
  "cal.valueRequired": { en: "Value is required.", tr: "Değer gereklidir." },
  "cal.validValue": { en: "Enter a valid value.", tr: "Geçerli bir değer girin." },
  "cal.vitalSaveFailed": { en: "Failed to save vital record.", tr: "Vital kaydedilemedi." },
  "cal.addEventDesc": {
    en: "Create a new health event or reminder.",
    tr: "Yeni bir sağlık etkinliği veya hatırlatıcı oluşturun.",
  },
  "cal.eventType": { en: "Event Type", tr: "Etkinlik Türü" },
  "cal.eventType.medication": { en: "Medication", tr: "İlaç" },
  "cal.eventType.supplement": { en: "Supplement", tr: "Takviye" },
  "cal.eventType.appointment": { en: "Appointment", tr: "Randevu" },
  "cal.eventType.sport": { en: "Sport / Exercise", tr: "Spor / Egzersiz" },
  "cal.eventType.symptom": { en: "Symptom", tr: "Semptom" },
  "cal.eventType.operation": { en: "Operation", tr: "Ameliyat" },
  "cal.eventType.custom": { en: "Custom", tr: "Özel" },
  "cal.eventTitle": { en: "Title", tr: "Başlık" },
  "cal.eventTitlePlaceholder": { en: "e.g., Cardiology checkup", tr: "ör. Kardiyoloji kontrolü" },
  "cal.eventDesc": { en: "Description (optional)", tr: "Açıklama (isteğe bağlı)" },
  "cal.eventDate": { en: "Date", tr: "Tarih" },
  "cal.eventTime": { en: "Time (optional)", tr: "Saat (isteğe bağlı)" },
  "cal.recurrence": { en: "Recurrence", tr: "Tekrar" },
  "cal.recurrence.none": { en: "None", tr: "Yok" },
  "cal.recurrence.daily": { en: "Daily", tr: "Günlük" },
  "cal.recurrence.weekly": { en: "Weekly", tr: "Haftalık" },
  "cal.recurrence.monthly": { en: "Monthly", tr: "Aylık" },
  "cal.save": { en: "Save", tr: "Kaydet" },
  "cal.saving": { en: "Saving...", tr: "Kaydediliyor..." },
  "cal.cancel": { en: "Cancel", tr: "İptal" },

  // Add Vital Dialog
  "cal.addVitalTitle": { en: "Record Vital Signs", tr: "Vital Bulgu Kaydet" },
  "cal.addVitalDesc": {
    en: "Record your latest vital measurement.",
    tr: "Son vital ölçümünüzü kaydedin.",
  },
  "cal.vitalType": { en: "Vital Type", tr: "Vital Türü" },
  "cal.vitalType.blood_pressure": { en: "Blood Pressure", tr: "Tansiyon" },
  "cal.vitalType.blood_sugar": { en: "Blood Sugar", tr: "Kan Şekeri" },
  "cal.vitalType.weight": { en: "Weight", tr: "Kilo" },
  "cal.vitalType.heart_rate": { en: "Heart Rate", tr: "Nabız" },
  "cal.systolic": { en: "Systolic (mmHg)", tr: "Sistolik (mmHg)" },
  "cal.diastolic": { en: "Diastolic (mmHg)", tr: "Diastolik (mmHg)" },
  "cal.value": { en: "Value", tr: "Değer" },
  "cal.unit.mgdl": { en: "mg/dL", tr: "mg/dL" },
  "cal.unit.kg": { en: "kg", tr: "kg" },
  "cal.unit.bpm": { en: "bpm", tr: "bpm" },
  "cal.notes": { en: "Notes (optional)", tr: "Notlar (isteğe bağlı)" },
  "cal.recentVitals": { en: "Recent Vitals", tr: "Son Vital Kayıtları" },
  "cal.noVitals": { en: "No vital recordings yet. Start tracking your health metrics.", tr: "Henüz vital kaydı yok. Sağlık metriklerinizi takip etmeye başlayın." },
  "cal.allDone": { en: "All done for today!", tr: "Bugünkü görevler tamamlandı!" },

  // Nav
  "nav.calendar": { en: "Calendar", tr: "Takvim" },
  "nav.dashboard": { en: "Dashboard", tr: "Panel" },
  "nav.tools": { en: "Tools", tr: "Araçlar" },
  "nav.calorie": { en: "Calorie Calculator", tr: "Kalori Hesaplayıcı" },

  // Calendar extras
  "cal.rememberMe": { en: "Remember me", tr: "Oturumu açık tut" },
  "cal.waterExplain": { en: "8 glasses (~2L) is the recommended daily intake", tr: "8 bardak (~2L) günlük önerilen su tüketimi" },
  "cal.waterGreat": { en: "Great job! Keep going!", tr: "Harika gidiyorsun! Devam et!" },
  "cal.waterDone": { en: "Daily goal reached!", tr: "Günlük hedefe ulaştın!" },
  "cal.quickAdd": { en: "Quick add:", tr: "Hızlı ekle:" },
  "cal.recordHealth": { en: "Record Health Metrics", tr: "Sağlık Ölçümü Kaydet" },
  "cal.noEventsDesc": { en: "Your day is clear! Add an event to get started.", tr: "Gününüz boş! Başlamak için bir etkinlik ekleyin." },
  "cal.notifSoon": { en: "Notifications coming soon", tr: "Bildirimler yakında" },
  "cal.medsTaken": { en: "taken", tr: "alındı" },

  // Sprint 9b — New keys
  "cal.reminderTime": { en: "Reminder Time", tr: "Hatırlatma Saati" },
  "cal.remove": { en: "Remove", tr: "Kaldır" },
  "cal.delete": { en: "Delete", tr: "Sil" },
  "cal.thisWeek": { en: "This Week", tr: "Bu Hafta" },
  "cal.daysComplete": { en: "days complete", tr: "gün tamam" },
  "cal.waterLimit": { en: "Daily upper limit reached! Too much water can be dangerous.", tr: "Günlük üst limite ulaştın! Fazla su tehlikeli olabilir." },
  "cal.personalRange": { en: "Personal range", tr: "Kişisel aralık" },
  "cal.exportIcs": { en: "Export to Calendar (.ics)", tr: "Takvime Aktar (.ics)" },
  "cal.confirm": { en: "Confirm", tr: "Onayla" },
  "cal.currentReminder": { en: "Current reminder:", tr: "Mevcut hatırlatma:" },
  "cal.whenRemind": { en: "when should I remind you?", tr: "ne zaman hatırlatayım?" },
  "cal.setGoal": { en: "Set Goal", tr: "Hedef Belirle" },
  "cal.yourRange": { en: "Your range", tr: "Kişisel aralığın" },
  "cal.mlMode": { en: "mL", tr: "mL" },
  "cal.glassMode": { en: "Glass", tr: "Bardak" },
  "cal.addMl": { en: "Add", tr: "Ekle" },
  "cal.waterWarnTitle": { en: "Please don't drink more! You risk water intoxication.", tr: "Lütfen daha fazla içmeyin! Su zehirlenmesi geçirebilirsiniz." },
  "cal.profileSups": { en: "From your profile:", tr: "Profilindeki takviyeler:" },

  // ══════════════════════════════════════════
  // Login & Auth
  // ══════════════════════════════════════════
  "auth.welcome": { en: "Welcome", tr: "Hoş Geldiniz" },
  "auth.subtitle": { en: "Sign in to get personalized, evidence-based recommendations", tr: "Kişiselleştirilmiş, kanıta dayalı öneriler almak için giriş yapın" },
  "auth.googleContinue": { en: "Continue with Google", tr: "Google ile Devam Et" },
  "auth.facebookContinue": { en: "Continue with Facebook", tr: "Facebook ile Devam Et" },
  "auth.errFacebook": { en: "Facebook login failed. Please try again.", tr: "Facebook girişi başarısız. Tekrar deneyin." },
  "auth.or": { en: "Or", tr: "Veya" },
  "auth.signIn": { en: "Sign In", tr: "Giriş Yap" },
  "auth.signUp": { en: "Sign Up", tr: "Kayıt Ol" },
  "auth.email": { en: "Email", tr: "E-posta" },
  "auth.password": { en: "Password", tr: "Şifre" },
  "auth.signingIn": { en: "Signing in...", tr: "Giriş yapılıyor..." },
  "auth.fullName": { en: "Full Name", tr: "Ad Soyad" },
  "auth.namePlaceholder": { en: "John Doe", tr: "Adınız Soyadınız" },
  "auth.emailPlaceholder": { en: "name@email.com", tr: "ornek@email.com" },
  "auth.passwordPlaceholder": { en: "Min. 6 characters", tr: "En az 6 karakter" },
  "auth.confirmPassword": { en: "Confirm Password", tr: "Şifre Tekrar" },
  "auth.createAccount": { en: "Create Account", tr: "Hesap Oluştur" },
  "auth.tryDemo": { en: "Try Demo Account", tr: "Demo Hesabı Dene" },
  "auth.demoDesc": { en: "Pre-filled account with sample medications, blood tests & history", tr: "Örnek ilaçlar, kan tahlili ve geçmişle dolu hazır hesap" },
  "auth.creatingAccount": { en: "Creating account...", tr: "Hesap oluşturuluyor..." },
  "auth.termsText": { en: "By signing up, you agree to our", tr: "Kayıt olarak" },
  "auth.termsLink": { en: "Terms of Service", tr: "Kullanım Koşulları" },
  "auth.and": { en: "and", tr: "ve" },
  "auth.privacyLink": { en: "Privacy Policy", tr: "Gizlilik Politikası" },
  "auth.termsAccept": { en: "", tr: "'nı kabul etmiş olursunuz." },
  "auth.errAuthFailed": { en: "Authentication failed. Please try again.", tr: "Kimlik doğrulama başarısız. Lütfen tekrar deneyin." },
  "auth.errSessionFailed": { en: "Sign in succeeded but session was not established. Please try again.", tr: "Giriş başarılı ancak oturum oluşturulamadı. Tekrar deneyin." },
  "auth.errUnexpected": { en: "An unexpected error occurred. Please try again.", tr: "Beklenmeyen bir hata oluştu. Tekrar deneyin." },
  "auth.errPasswordMismatch": { en: "Passwords do not match", tr: "Şifreler eşleşmiyor" },
  "auth.errPasswordShort": { en: "Password must be at least 8 characters", tr: "Şifre en az 8 karakter olmalıdır" },
  "auth.errPasswordUppercase": { en: "Password must contain at least 1 uppercase letter", tr: "Şifre en az 1 büyük harf içermelidir" },
  "auth.errPasswordNumber": { en: "Password must contain at least 1 number", tr: "Şifre en az 1 rakam içermelidir" },
  "auth.errEmailExists": { en: "An account with this email already exists. Please sign in instead.", tr: "Bu e-posta ile bir hesap zaten mevcut. Lütfen giriş yapın." },
  "auth.successCreated": { en: "Account created! Please check your email to confirm your account, then sign in.", tr: "Hesap oluşturuldu! E-postanızı kontrol edip hesabınızı onaylayın, ardından giriş yapın." },
  "auth.errGoogle": { en: "Failed to connect to Google. Please try again.", tr: "Google'a bağlanılamadı. Tekrar deneyin." },
  "auth.callbackFailed": { en: "Authentication Failed", tr: "Kimlik Doğrulama Başarısız" },
  "auth.callbackError": { en: "Something went wrong during sign in. Please try again.", tr: "Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin." },
  "auth.backToSignIn": { en: "Back to Sign In", tr: "Giriş Sayfasına Dön" },
  "auth.completingSignIn": { en: "Completing sign in...", tr: "Giriş tamamlanıyor..." },

  // ══════════════════════════════════════════
  // Guest Wall
  // ══════════════════════════════════════════
  "guest.personalTitle": { en: "Account Required for Personal Recommendations", tr: "Kişisel Öneriler İçin Hesap Gerekli" },
  "guest.limitTitle": { en: "Free Queries Used Up", tr: "Ücretsiz Sorgular Tükendi" },
  "guest.personalDesc": { en: "To give you safe, personalized recommendations, we need your medication profile. Sign up — it takes less than 2 minutes.", tr: "Güvenli, kişiselleştirilmiş öneriler sunabilmemiz için ilaç profilinize ihtiyacımız var. Kayıt olun — 2 dakikadan kısa sürer." },
  "guest.limitDesc": { en: "You've used your 2 free queries. Sign up for unlimited access to evidence-based recommendations.", tr: "2 ücretsiz sorgu hakkınızı kullandınız. Kanıta dayalı önerilere sınırsız erişim için kayıt olun." },
  "guest.signUpFree": { en: "Sign Up Free", tr: "Ücretsiz Kayıt Ol" },
  "guest.alreadyHave": { en: "Already have an account?", tr: "Zaten hesabınız var mı?" },
  "guest.signInLink": { en: "Sign in", tr: "Giriş yap" },

  // ══════════════════════════════════════════
  // Safety Badge
  // ══════════════════════════════════════════
  "safety.safe": { en: "Safe", tr: "Güvenli" },
  "safety.caution": { en: "Caution", tr: "Dikkatli Kullanın" },
  "safety.dangerous": { en: "Dangerous", tr: "Tehlikeli" },
  "safety.gradeA": { en: "Grade A", tr: "Kanıt A" },
  "safety.gradeB": { en: "Grade B", tr: "Kanıt B" },
  "safety.gradeC": { en: "Grade C", tr: "Kanıt C" },
  "safety.emergencyWarning": { en: "🚨 Emergency Warning", tr: "🚨 Acil Durum Uyarısı" },

  // ══════════════════════════════════════════
  // Chat
  // ══════════════════════════════════════════
  "chat.sources": { en: "Sources", tr: "Kaynaklar" },
  "chat.historyTitle": { en: "Conversation history", tr: "Konuşma geçmişi" },
  "time.justNow": { en: "Just now", tr: "Az önce" },
  "time.minsAgo": { en: "m ago", tr: "dk önce" },
  "time.hoursAgo": { en: "h ago", tr: "sa önce" },
  "time.daysAgo": { en: "d ago", tr: "gün önce" },

  // ══════════════════════════════════════════
  // Interaction
  // ══════════════════════════════════════════
  "di.slotsRemaining": { en: "slots remaining", tr: "ilaç daha eklenebilir" },

  // ══════════════════════════════════════════
  // Sprint 10 — Health Scores & Check-in
  // ══════════════════════════════════════════

  // Micro Check-in
  "checkin.title": { en: "Daily Check-in", tr: "Günlük Check-in" },
  "checkin.subtitle": { en: "How are you feeling today?", tr: "Bugün kendini nasıl hissediyorsun?" },
  "checkin.energy": { en: "How's your energy?", tr: "Enerjin nasıl?" },
  "checkin.sleep": { en: "How did you sleep?", tr: "Nasıl uyudun?" },
  "checkin.mood": { en: "How's your mood?", tr: "Ruh halin nasıl?" },
  "checkin.body": { en: "How does your body feel?", tr: "Vücudun nasıl hissediyor?" },
  "checkin.veryBad": { en: "Awful", tr: "Kötü" },
  "checkin.bad": { en: "Meh", tr: "Eh" },
  "checkin.okay": { en: "Okay", tr: "İdare" },
  "checkin.good": { en: "Good", tr: "İyi" },
  "checkin.great": { en: "Great!", tr: "Harika!" },
  "checkin.back": { en: "Back", tr: "Geri" },
  "checkin.next": { en: "Next", tr: "İleri" },
  "checkin.later": { en: "Later", tr: "Sonra" },
  "checkin.save": { en: "Save", tr: "Kaydet" },
  "checkin.saving": { en: "Saving...", tr: "Kaydediliyor..." },

  // Daily Summary Card
  "summary.hi": { en: "Hi", tr: "Merhaba" },
  "summary.todayOverview": { en: "Your daily health overview", tr: "Günlük sağlık özeti" },
  "summary.seeAll": { en: "See all", tr: "Tümünü gör" },
  "summary.meds": { en: "Medications", tr: "İlaçlar" },
  "summary.water": { en: "Water", tr: "Su" },
  "summary.checkin": { en: "Check-in", tr: "Check-in" },
  "summary.done": { en: "Done", tr: "Tamam" },
  "summary.pending": { en: "Pending", tr: "Bekliyor" },
  "summary.vsYesterday": { en: "vs yesterday", tr: "düne göre" },
  "summary.dayStreak": { en: "day streak", tr: "gün seri" },
  "summary.completeCheckin": { en: "Complete check-in to boost score", tr: "Skoru artırmak için check-in yap" },
  "summary.doCheckin": { en: "Check-in now", tr: "Check-in yap" },
  "summary.label.excellent": { en: "Excellent! You're on fire!", tr: "Mükemmel! Bugün formundasın!" },
  "summary.label.great": { en: "Great job today!", tr: "Harika gidiyorsun!" },
  "summary.label.good": { en: "Good day so far!", tr: "İyi gidiyorsun!" },
  "summary.label.fair": { en: "Room to improve — keep going!", tr: "Daha iyisini yapabilirsin — devam!" },
  "summary.label.needsWork": { en: "Let's get started!", tr: "Haydi başlayalım!" },
  "summary.healthScore": { en: "Health Score", tr: "Sağlık Skoru" },
  "summary.noData": { en: "Complete your first check-in to see your health score", tr: "Sağlık skorunu görmek için ilk check-in'ini tamamla" },

  // Dashboard
  "dashboard.title": { en: "Health Dashboard", tr: "Sağlık Paneli" },
  "dashboard.tools": { en: "Tools & Features", tr: "Araçlar ve Özellikler" },
  "dashboard.morning": { en: "Good morning, {name}", tr: "Günaydın, {name}" },
  "dashboard.afternoon": { en: "Good afternoon, {name}", tr: "İyi günler, {name}" },
  "dashboard.evening": { en: "Good evening, {name}", tr: "İyi akşamlar, {name}" },
  "dashboard.subtitle": { en: "Here's your health overview", tr: "Sağlık özetiniz" },
  "dashboard.betaTagline": { en: "Your evidence-based health assistant", tr: "Kanıta dayalı sağlık asistanınız" },
  "common.faqTitle": { en: "Frequently Asked Questions", tr: "Sık Sorulan Sorular" },
  "footer.allRightsReserved": { en: "All rights reserved", tr: "Tüm hakları saklıdır" },
  "auth.errDemoFailed": { en: "Demo login failed. Please try again.", tr: "Demo girişi başarısız. Tekrar deneyin." },
  "profile.errInviteFailed": { en: "Failed to send invite", tr: "Davetiye gönderilemedi" },
  "dashboard.weeklyTrend": { en: "Weekly Trend", tr: "Haftalık Trend" },
  "dashboard.breakdown": { en: "Score Breakdown", tr: "Skor Dağılımı" },
  "dashboard.checkinSection": { en: "Check-in", tr: "Check-in" },
  "dashboard.adherenceSection": { en: "Med Adherence", tr: "İlaç Uyumu" },
  "dashboard.waterSection": { en: "Hydration", tr: "Hidrasyon" },
  "dashboard.vitalsSection": { en: "Vitals", tr: "Vital Kayıt" },

  // Calorie Calculator
  "calorie.title": { en: "Calorie Calculator", tr: "Kalori Hesaplayıcı" },
  "calorie.subtitle": { en: "Estimate your daily calorie needs", tr: "Günlük kalori ihtiyacını hesapla" },
  "calorie.age": { en: "Age", tr: "Yaş" },
  "calorie.gender": { en: "Gender", tr: "Cinsiyet" },
  "calorie.male": { en: "Male", tr: "Erkek" },
  "calorie.female": { en: "Female", tr: "Kadın" },
  "calorie.height": { en: "Height (cm)", tr: "Boy (cm)" },
  "calorie.weight": { en: "Weight (kg)", tr: "Kilo (kg)" },
  "calorie.activity": { en: "Activity Level", tr: "Aktivite Seviyesi" },
  "calorie.sedentary": { en: "Sedentary", tr: "Hareketsiz" },
  "calorie.light": { en: "Lightly active", tr: "Hafif aktif" },
  "calorie.moderate": { en: "Moderately active", tr: "Orta aktif" },
  "calorie.active": { en: "Very active", tr: "Çok aktif" },
  "calorie.extra": { en: "Extra active", tr: "Ekstra aktif" },
  "calorie.calculate": { en: "Calculate", tr: "Hesapla" },
  "calorie.result": { en: "Your daily calorie need", tr: "Günlük kalori ihtiyacın" },
  "calorie.maintain": { en: "Maintain weight", tr: "Kilo koruma" },
  "calorie.lose": { en: "Lose weight", tr: "Kilo verme" },
  "calorie.gain": { en: "Gain weight", tr: "Kilo alma" },
  "calorie.kcal": { en: "kcal/day", tr: "kcal/gün" },
  "calorie.disclaimer": { en: "Based on Mifflin-St Jeor equation. Consult your doctor for personalized advice.", tr: "Mifflin-St Jeor formülüne göre. Kişisel tavsiye için doktorunuza danışın." },

  // Biological Age
  "bioage.title": { en: "Biological Age", tr: "Biyolojik Yaş" },
  "bioage.locked": { en: "Unlock with Premium", tr: "Premium ile aç" },
  "bioage.description": { en: "Calculate your biological age based on your health data", tr: "Sağlık verilerine göre biyolojik yaşını hesapla" },
  "bioage.calculate": { en: "Calculate My Age", tr: "Yaşımı Hesapla" },
  "bioage.calculating": { en: "Analyzing...", tr: "Analiz ediliyor..." },
  "bioage.actual": { en: "Actual Age", tr: "Gerçek Yaş" },
  "bioage.biological": { en: "Bio Age", tr: "Biyo Yaş" },
  "bioage.younger": { en: "You're {n} years younger than your age!", tr: "Yaşından {n} yıl gençsin!" },
  "bioage.older": { en: "You're {n} years older — let's improve!", tr: "Yaşından {n} yıl büyüksün — iyileştirelim!" },

  // Metabolic Portfolio
  "metabolic.title": { en: "Metabolic Portfolio", tr: "Metabolik Portföy" },
  "metabolic.subtitle": { en: "Your 4-domain health overview", tr: "4 alan sağlık özeti" },
  "metabolic.energy": { en: "Energy", tr: "Enerji" },
  "metabolic.stress": { en: "Stress", tr: "Stres" },
  "metabolic.sleep": { en: "Sleep", tr: "Uyku" },
  "metabolic.immunity": { en: "Immunity", tr: "Bağışıklık" },

  // Washout Countdown
  "washout.title": { en: "Supplement Cycling", tr: "Takviye Döngüsü" },
  "washout.subtitle": { en: "Track your supplement cycling periods", tr: "Takviye döngü sürelerin" },
  "washout.none": { en: "No supplements with cycling rules detected", tr: "Döngü kuralı olan takviye bulunamadı" },
  "washout.days": { en: "days", tr: "gün" },
  "washout.daysLeft": { en: "days left", tr: "gün kaldı" },
  "washout.breakTime": { en: "Time for a break!", tr: "Mola zamanı!" },

  // Weekly Summary
  "weekly.title": { en: "Weekly Summary", tr: "Haftalık Özet" },
  "weekly.avgScore": { en: "Avg. Score", tr: "Ort. Skor" },
  "weekly.bestDay": { en: "Best Day", tr: "En İyi Gün" },
  "weekly.medAdherence": { en: "Med Adherence", tr: "İlaç Uyumu" },
  "weekly.waterAvg": { en: "Water Avg", tr: "Su Ort." },
  "weekly.share": { en: "Share", tr: "Paylaş" },
  "weekly.noData": { en: "Complete check-ins this week to see your summary", tr: "Bu haftanın özetini görmek için check-in yap" },

  // ══════════════════════════════════════════
  // Share Cards — Sprint 11
  // ══════════════════════════════════════════
  "share.share": { en: "Share", tr: "Paylaş" },
  "share.download": { en: "Download", tr: "İndir" },
  "share.copy": { en: "Copy", tr: "Kopyala" },
  "share.copied": { en: "Copied!", tr: "Kopyalandı!" },
  "share.bioage.title": { en: "My Biological Age", tr: "Biyolojik Yaşım" },
  "share.bioage.yearsYounger": { en: "years younger!", tr: "yıl daha genç!" },
  "share.bioage.yearsOlder": { en: "years older", tr: "yıl daha büyük" },
  "share.bioage.btn": { en: "Share Your Age", tr: "Yaşını Paylaş" },
  "share.interaction.title": { en: "Safety Alert Detected!", tr: "Güvenlik Uyarısı Tespit Edildi!" },
  "share.interaction.subtitle": { en: "This app may have saved my health", tr: "Bu uygulama sağlığımı korumuş olabilir" },
  "share.interaction.detected": { en: "interactions detected", tr: "etkileşim tespit edildi" },
  "share.interaction.btn": { en: "Share This Moment", tr: "Bu Anı Paylaş" },
  "share.protocol.title": { en: "Protocol Complete!", tr: "Protokol Tamamlandı!" },
  "share.protocol.subtitle": { en: "supplement cycle completed", tr: "takviye döngüsü tamamlandı" },
  "share.protocol.streak": { en: "day streak", tr: "günlük seri" },
  "share.protocol.btn": { en: "Share Achievement", tr: "Başarıyı Paylaş" },

  // ══════════════════════════════════════════
  // Family Profiles — Sprint 11
  // ══════════════════════════════════════════
  "family.title": { en: "Family Profiles", tr: "Aile Profilleri" },
  "family.subtitle": { en: "Manage health profiles for your family", tr: "Aileniz için sağlık profillerini yönetin" },
  "family.add": { en: "Add Family Member", tr: "Aile Üyesi Ekle" },
  "family.empty": { en: "No family members added yet", tr: "Henüz aile üyesi eklenmedi" },
  "family.limitReached": { en: "Upgrade to Premium for more profiles", tr: "Daha fazla profil için Premium'a geçin" },
  "family.minorWarning": { en: "Parental oversight mode active", tr: "Ebeveyn denetim modu aktif" },

  // Biological Challenge (formerly Boss Fight) — Sprint 11
  "boss.title": { en: "Biological Challenge", tr: "Biyolojik Meydan Okuma" },
  "boss.choose": { en: "Choose Your Challenge", tr: "Meydan Okuma Seç" },
  "boss.todayTasks": { en: "Today's Tasks", tr: "Bugünün Görevleri" },
  "boss.progress": { en: "Overall Progress", tr: "Genel İlerleme" },
  "boss.abandon": { en: "Abandon protocol", tr: "Protokolü bırak" },
  "boss.complete": { en: "COMPLETE", tr: "TAMAMLANDI" },
  "boss.start": { en: "Start!", tr: "Başla!" },

  // Seasonal — Sprint 11
  "seasonal.title": { en: "Seasonal Health Guide", tr: "Mevsimsel Sağlık Rehberi" },
  "seasonal.subtitle": { en: "Season-specific health tips and supplement recommendations", tr: "Mevsime özel sağlık ipuçları ve takviye önerileri" },

  // Scanner — Sprint 11
  "scanner.title": { en: "Medication Scanner", tr: "İlaç Tarayıcı" },
  "scanner.subtitle": { en: "Take a photo of your medication box", tr: "İlaç kutunuzun fotoğrafını çekin" },
  "scanner.takePhoto": { en: "Take Photo", tr: "Fotoğraf Çek" },
  "scanner.uploadPhoto": { en: "Upload Photo", tr: "Fotoğraf Yükle" },
  "scanner.analyzing": { en: "Analyzing medication...", tr: "İlaç analiz ediliyor..." },
  "scanner.barcodeTitle": { en: "Barcode Scanner", tr: "Barkod Tarayıcı" },
  "scanner.barcodeSubtitle": { en: "Scan supplement barcode to add", tr: "Takviye barkodunu tarayarak ekleyin" },
  "scanner.startScan": { en: "Start Scanning", tr: "Taramayı Başlat" },

  // Symptom Pattern
  "pattern.title": { en: "AI Pattern Detection", tr: "AI Örüntü Tespiti" },
  "pattern.subtitle": { en: "Trends detected from your check-in data", tr: "Check-in verilerinden tespit edilen trendler" },
  "pattern.noData": { en: "Need at least 3 days of check-ins to detect patterns", tr: "Örüntü tespiti için en az 3 gün check-in gerekli" },

  // Sprint 11b — BiologicalAge card TR
  "bioage.recalculate": { en: "Recalculate", tr: "Yeniden Hesapla" },

  // Sprint 11b — Blood test result dashboard TR additions
  "rd.evidenceGrade": { en: "Grade", tr: "Kanıt Düzeyi" },
  "rd.statusOptimal": { en: "Optimal", tr: "Optimal" },
  "rd.statusLow": { en: "Low", tr: "Düşük" },
  "rd.statusHigh": { en: "High", tr: "Yüksek" },
  "rd.statusBorderlineLow": { en: "Borderline Low", tr: "Sınırda Düşük" },
  "rd.statusBorderlineHigh": { en: "Borderline High", tr: "Sınırda Yüksek" },

  // Sprint 11b — Interaction checker add supplement
  "ir.addToSupplements": { en: "Add to my supplements", tr: "Takviyelerime ekle" },
  "ir.addedToSupplements": { en: "Added to your supplements!", tr: "Takviyelerine eklendi!" },

  // Sprint 11b — Washout cycle complete
  "washout.cycleComplete": { en: "Cycle Complete!", tr: "Döngü Tamamlandı!" },
  "washout.takeBreak": { en: "Take a {n}-day break", tr: "{n} gün mola verin" },
  "washout.readyNewCycle": { en: "Ready for a new cycle", tr: "Yeni döngü başlatabilirsiniz" },
  "washout.unlimited": { en: "∞ Unlimited", tr: "∞ Sınırsız" },

  // Sprint 11b — Family profile enhanced
  "family.healthScore": { en: "Health Score", tr: "Sağlık Skoru" },
  "family.medications": { en: "Medications", tr: "İlaçlar" },
  "family.noMedications": { en: "No medications recorded", tr: "Kayıtlı ilaç yok" },
  "family.switchProfile": { en: "Switch to this profile", tr: "Bu profile geç" },
  "family.mainAccount": { en: "Main Account", tr: "Ana Hesap" },
  "family.deleteConfirm": { en: "Remove this member?", tr: "Bu üyeyi kaldır?" },

  // Sprint 11b — Scanner moved to medication flow
  "scanner.photoOrUpload": { en: "Photo or Upload", tr: "Fotoğraf / Yükle" },
  "scanner.scanMedication": { en: "Scan Medication", tr: "İlaç Tara" },

  // ══════════════════════════════════════════
  // Premium / Freemium — Sprint 14
  // ══════════════════════════════════════════
  "premium.featureLocked": { en: "Premium Feature", tr: "Premium Özellik" },
  "premium.upgradeCta": { en: "Upgrade to Premium", tr: "Premium'a Geç" },
  "premium.badge": { en: "Premium", tr: "Premium" },

  "trial.activeBanner": { en: "You have {days} days left in your free trial — enjoy all Premium features!", tr: "Ücretsiz denemenizin {days} günü kaldı — tüm Premium özelliklerden yararlanın!" },
  "trial.expiringBanner": { en: "Your trial expires in {days} days! Upgrade now to keep Premium features.", tr: "Denemeniz {days} gün içinde sona eriyor! Premium özellikleri korumak için şimdi yükseltin." },
  "trial.upgradeNow": { en: "Upgrade Now", tr: "Şimdi Yükselt" },
  "trial.expired": { en: "Your trial has expired", tr: "Deneme süreniz sona erdi" },

  "priçing.title": { en: "Choose Your Plan", tr: "Planınızı Seçin" },
  "priçing.subtitle": { en: "Start with 7 days free — no credit card required", tr: "7 gün ücretsiz başlayın — kredi kartı gerekmez" },
  "priçing.monthly": { en: "Monthly", tr: "Aylık" },
  "priçing.yearly": { en: "Yearly", tr: "Yıllık" },
  "priçing.saveTag": { en: "Save up to 33%", tr: "%33'e kadar tasarruf" },
  "priçing.mo": { en: "mo", tr: "ay" },
  "priçing.yr": { en: "yr", tr: "yıl" },
  "priçing.free": { en: "Free", tr: "Ücretsiz" },
  "priçing.savePercent": { en: "Save {pct}%", tr: "%{pct} tasarruf" },
  "priçing.mostPopular": { en: "Most Popular", tr: "En Popüler" },
  "priçing.getStartedFree": { en: "Get Started Free", tr: "Ücretsiz Başla" },
  "priçing.comingSoon": { en: "Coming Soon", tr: "Yakında" },
  "priçing.trialTitle": { en: "7-Day Free Trial on Every Paid Plan", tr: "Her Ücretli Planda 7 Gün Ücretsiz Deneme" },
  "priçing.trialDesc": { en: "Sign up and get instant access to all Premium features for 7 days. No credit card needed. If you love it, upgrade anytime.", tr: "Kayıt olun ve 7 gün boyunca tüm Premium özelliklere anında erişin. Kredi kartı gerekmez. Beğenirseniz istediğiniz zaman yükseltin." },
  "priçing.trialPoint1": { en: "No credit card required", tr: "Kredi kartı gerekmez" },
  "priçing.trialPoint2": { en: "Cancel anytime", tr: "İstediğiniz zaman iptal" },
  "priçing.trialPoint3": { en: "Your data is never deleted", tr: "Verileriniz asla silinmez" },
  "priçing.faqTitle": { en: "Frequently Asked Questions", tr: "Sıkça Sorulan Sorular" },
  "priçing.faq1q": { en: "What happens after the trial?", tr: "Deneme süresinden sonra ne olur?" },
  "priçing.faq1a": { en: "You'll automatically switch to the Free plan. No charges, no data loss. All your data stays safe.", tr: "Otomatik olarak Ücretsiz plana geçersiniz. Ücret yok, veri kaybı yok. Tüm verileriniz güvende kalır." },
  "priçing.faq2q": { en: "Can I change plans later?", tr: "Planımı daha sonra değiştirebilir miyim?" },
  "priçing.faq2a": { en: "Yes! You can upgrade, downgrade, or cancel anytime from your profile settings.", tr: "Evet! Profil ayarlarınızdan istediğiniz zaman yükseltebilir, düşürebilir veya iptal edebilirsiniz." },
  "priçing.faq3q": { en: "Is my health data safe?", tr: "Sağlık verilerim güvende mi?" },
  "priçing.faq3a": { en: "Absolutely. All data is encrypted and stored in compliance with KVKK/GDPR. We never sell your data.", tr: "Kesinlikle. Tüm veriler şifrelenmiş olarak KVKK/GDPR uyumlu şekilde saklanır. Verilerinizi asla satmayız." },
  "priçing.faq4q": { en: "What payment methods do you accept?", tr: "Hangi ödeme yöntemlerini kabul ediyorsunuz?" },
  "priçing.faq4a": { en: "We'll support credit/debit cards via Iyzico when payments go live. Currently in beta — all features are free!", tr: "Ödemeler aktifleştiğinde Iyzico üzerinden kredi/banka kartı destekleyeceğiz. Şu an beta — tüm özellikler ücretsiz!" },

  "priçing.free.name": { en: "Free", tr: "Ücretsiz" },
  "priçing.free.tagline": { en: "Essential health tools", tr: "Temel sağlık araçları" },
  "priçing.free.features": {
    en: "20 health queries/day|Medication & supplement calendar|Water & vital tracking|3 blood tests/month|3 PDF reports/month|Daily health score|Calorie calculator|1 family profile",
    tr: "20 sağlık sorgusu/gün|İlaç & takviye takvimi|Su & vital takibi|3 kan tahlili/ay|3 PDF rapor/ay|Günlük sağlık skoru|Kalori hesaplama|1 aile profili",
  },
  "priçing.premium.name": { en: "Premium", tr: "Premium" },
  "priçing.premium.tagline": { en: "Full health intelligence", tr: "Tam sağlık zekası" },
  "priçing.premium.features": {
    en: "Everything in Free|Unlimited queries & blood tests|AI pattern detection|Biological age score & trend|Metabolic portfolio|Washout/cycling system|Boss fight protocols|Symptom pattern AI|Doctor PDF & email|Barcode supplement scan|3 family profiles|Share cards & Wrapped",
    tr: "Ücretsiz'deki her şey|Sınırsız sorgu & kan tahlili|AI örüntü tespiti|Biyolojik yaş skoru & trend|Metabolik portföy|Washout/döngü sistemi|Boss fight protokolleri|Semptom örüntü AI|Doktor PDF & e-posta|Barkod takviye tarama|3 aile profili|Paylaşım kartları & Wrapped",
  },
  "priçing.family.name": { en: "Family", tr: "Aile" },
  "priçing.family.tagline": { en: "Health for the whole family", tr: "Tüm aile için sağlık" },
  "priçing.family.features": {
    en: "Everything in Premium|6 family profiles (2+4)|Parental supervision mode|Shared family dashboard|Cross-family interaction check|Family health timeline",
    tr: "Premium'daki her şey|6 aile profili (2+4)|Ebeveyn denetim modu|Paylaşımlı aile paneli|Çapraz aile etkileşim kontrolü|Aile sağlık zaman çizelgesi",
  },
  "priçing.doctor.name": { en: "Doctor", tr: "Doktor" },
  "priçing.doctor.tagline": { en: "Professional clinical tools", tr: "Profesyonel klinik araçları" },
  "priçing.doctor.features": {
    en: "Everything in Family|Multi-patient management|AI visit summary|Compliance scoring|Patient invite links|New Rx interaction alerts|Clinic multi-account|Insurance integration ready",
    tr: "Aile'deki her şey|Çoklu hasta yönetimi|AI ziyaret özeti|Uyum puanlaması|Hasta davet linkleri|Yeni Rx etkileşim uyarıları|Klinik çoklu hesap|Sigorta entegrasyonu hazır",
  },

  "nav.pricing": { en: "Pricing", tr: "Fiyatlar" },
  "nav.history": { en: "History", tr: "Geçmiş" },
  "notifications.title": { en: "Notifications", tr: "Bildirimler" },
  "auth.loginToUse": { en: "Sign in to use this feature", tr: "Bu özelliği kullanmak için giriş yapın" },
  "pricing.title": { en: "Pricing Plans", tr: "Fiyat Planları" },
  "pricing.subtitle": { en: "Choose the plan that fits your needs", tr: "İhtiyacınıza uygun planı seçin" },
  "pricing.free": { en: "Free", tr: "Ücretsiz" },
  "pricing.mo": { en: "/mo", tr: "/ay" },
  "pricing.yr": { en: "/yr", tr: "/yıl" },
  "pricing.monthly": { en: "Monthly", tr: "Aylık" },
  "pricing.yearly": { en: "Yearly", tr: "Yıllık" },
  "pricing.mostPopular": { en: "Most Popular", tr: "En Popüler" },
  "pricing.getStartedFree": { en: "Get Started Free", tr: "Ücretsiz Başla" },
  "pricing.savePercent": { en: "Save 24%", tr: "%24 Tasarruf" },
  "pricing.saveTag": { en: "SAVE", tr: "TASARRUF" },
  "pricing.trialTitle": { en: "7-Day Free Trial", tr: "7 Günlük Ücretsiz Deneme" },
  "pricing.trialDesc": { en: "Full premium access, no credit card required", tr: "Tam premium erişim, kredi kartı gerekmez" },
  "pricing.trialPoint1": { en: "All premium features unlocked", tr: "Tüm premium özellikler açık" },
  "pricing.trialPoint2": { en: "No automatic charges", tr: "Otomatik ödeme yok" },
  "pricing.trialPoint3": { en: "Your data is never deleted", tr: "Verileriniz asla silinmez" },
  "pricing.comingSoon": { en: "Payment integration coming soon", tr: "Ödeme entegrasyonu yakında" },
  "pricing.faqTitle": { en: "Frequently Asked Questions", tr: "Sık Sorulan Sorular" },
  "pricing.free.name": { en: "Free", tr: "Ücretsiz" },
  "pricing.free.tagline": { en: "Basic health assistant", tr: "Temel sağlık asistanı" },
  "pricing.free.features": { en: "20 AI queries/day|Drug interaction check|Blood test analysis 3/mo|Daily health score|Medication & supplement calendar|Water & vital tracking|1 family profile", tr: "Günde 20 AI sorgu|İlaç etkileşim kontrolü|Kan tahlili analizi 3/ay|Günlük sağlık skoru|İlaç & takviye takvimi|Su & vital takibi|1 aile profili" },
  "pricing.premium.name": { en: "Premium", tr: "Premium" },
  "pricing.premium.tagline": { en: "Full health intelligence", tr: "Tam sağlık zekası" },
  "pricing.premium.features": { en: "Unlimited AI queries|AI pattern detection (weekly)|Personal morning/evening protocol|Weekly AI coaching report|Biological age score & trend|Metabolic portfolio (4 areas)|Washout/cycling system|Unlimited blood test & PDF|Doctor PDF & email|Barcode supplement scan|3 family profiles|Priority support", tr: "Sınırsız AI sorgu|AI örüntü tespiti (haftalık)|Kişisel sabah/akşam protokolü|Haftalık AI koçluk raporu|Biyolojik yaş skoru & trend|Metabolik portföy (4 alan)|Washout/döngü sistemi|Sınırsız kan tahlili & PDF|Doktor PDF & email gönderimi|Barkod takviye tarama|3 aile profili|Öncelikli destek" },
  "pricing.family.name": { en: "Family", tr: "Aile Paketi" },
  "pricing.family.tagline": { en: "Health for the whole family", tr: "Tüm aile için sağlık" },
  "pricing.family.features": { en: "Everything in Premium|6 family profiles (2 adults + 4)|Parental monitoring mode (under 18)|Shared family health dashboard|Cross-profile interaction alerts|Priority support", tr: "Premium'daki her şey|6 aile profili (2 yetişkin + 4)|Ebeveyn denetim modu (18 yaş altı)|Paylaşımlı aile sağlık panosu|Profiller arası etkileşim uyarıları|Öncelikli destek" },
  "pricing.doctor.name": { en: "Doctor", tr: "Doktor Paketi" },
  "pricing.doctor.tagline": { en: "Clinical decision support", tr: "Klinik karar destek" },
  "pricing.doctor.features": { en: "Patient tracking panel|AI visit summary|Compliance score|Prescription interaction alerts|Multi-patient management|Invite patients via link|Clinic billing available|FHIR data export", tr: "Hasta takip paneli|AI ziyaret özeti|Uyum skoru|Reçete etkileşim uyarıları|Çoklu hasta yönetimi|Hastaları linkle davet|Klinik faturalandırma|FHIR veri dışa aktarım" },
  "pricing.faq1q": { en: "Is there really a free plan?", tr: "Gerçekten ücretsiz plan var mı?" },
  "pricing.faq1a": { en: "Yes! The free plan includes 20 AI queries/day, drug interaction checks, and basic health tracking. No credit card required.", tr: "Evet! Ücretsiz plan günde 20 AI sorgu, ilaç etkileşim kontrolü ve temel sağlık takibini içerir. Kredi kartı gerekmez." },
  "pricing.faq2q": { en: "How does the 7-day trial work?", tr: "7 günlük deneme nasıl çalışır?" },
  "pricing.faq2a": { en: "When you sign up, you get full Premium access for 7 days. No credit card needed, no automatic charges. After 7 days, you switch to the free plan — your data is never deleted.", tr: "Kayıt olduğunuzda 7 gün tam Premium erişim alırsınız. Kredi kartı gerekmez, otomatik ödeme yoktur. 7 gün sonra ücretsiz plana geçersiniz — verileriniz asla silinmez." },
  "pricing.faq3q": { en: "Can I cancel anytime?", tr: "İstediğim zaman iptal edebilir miyim?" },
  "pricing.faq3a": { en: "Absolutely. No contracts, no cancellation fees. Cancel anytime and keep using the free plan with all your saved data.", tr: "Kesinlikle. Sözleşme yok, iptal ücreti yok. İstediğiniz zaman iptal edin ve tüm kayıtlı verilerinizle ücretsiz planı kullanmaya devam edin." },
  "pricing.faq4q": { en: "Is my health data safe?", tr: "Sağlık verilerim güvende mi?" },
  "pricing.faq4a": { en: "Your data is encrypted and stored securely. We comply with KVKK/GDPR regulations. You can download or delete all your data anytime. We never sell user data.", tr: "Verileriniz şifrelenerek güvenli şekilde saklanır. KVKK/GDPR düzenlemelerine uyuyoruz. Verilerinizi istediğiniz zaman indirebilir veya silebilirsiniz. Kullanıcı verisi asla satılmaz." },
  "history.noResponse": { en: "No response saved", tr: "Yanıt kaydedilmemiş" },

  // ══════════════════════════════════════════
  // Dashboard
  // ══════════════════════════════════════════
  "dash.drugInteraction": { en: "Drug Interaction Check", tr: "İlaç Etkileşim Kontrolü" },
  "dash.drugInteractionDesc": { en: "meds — check interactions", tr: "ilacın var — etkileşimleri kontrol et" },
  "dash.cvRisk": { en: "Cardiovascular Risk Analysis", tr: "Kardiyovasküler Risk Analizi" },
  "dash.cvRiskDesc": { en: "40+ age — monitor heart health", tr: "40+ yaş — kalp sağlığını takip et" },
  "dash.womensHealth": { en: "Women's Health Tracker", tr: "Kadın Sağlığı Takibi" },
  "dash.womensHealthDesc": { en: "Cycle and hormone tracking", tr: "Döngü ve hormon takibi" },
  "dash.sleepAnalysis": { en: "Sleep Quality Analysis", tr: "Uyku Kalitesi Analizi" },
  "dash.sleepAnalysisDesc": { en: "Optimize your sleep quality", tr: "Uyku kaliteni optimize et" },
  "dash.nutritionLog": { en: "Nutrition Log", tr: "Beslenme Günlüğü" },
  "dash.nutritionLogDesc": { en: "Track what you eat, find deficiencies", tr: "Ne yediğini takip et, eksiklerini bul" },
  "dash.recommendedForYou": { en: "Recommended For You", tr: "Senin İçin Önerilen" },
  "dash.explore": { en: "Explore", tr: "Keşfet" },
  "dash.allTools": { en: "All Tools", tr: "Tüm Araçlar" },
  "common.tools": { en: "tools", tr: "araç" },
  "common.saved": { en: "Saved!", tr: "Kaydedildi!" },
  "common.close": { en: "Close", tr: "Kapat" },
  "common.view": { en: "View", tr: "Veri" },
  "common.pay": { en: "Pay", tr: "Ödeme" },
  "common.meds": { en: "Meds", tr: "İlaç" },

  // ══════════════════════════════════════════
  // Profile Completion
  // ══════════════════════════════════════════
  "profile.completion": { en: "Profile Completion", tr: "Profil Tamamlama" },
  "profile.complete100": { en: "Your profile is 100% complete!", tr: "Profilin %100 tamamlandı!" },
  "profile.accountCreated": { en: "Account created", tr: "Hesap oluşturuldu" },
  "profile.nameEntered": { en: "Name entered", tr: "Ad soyad girildi" },
  "profile.medsAdded": { en: "Medications added", tr: "İlaçlar eklendi" },
  "profile.allergiesEntered": { en: "Allergies entered", tr: "Alerjiler girildi" },
  "profile.lifestyleInfo": { en: "Lifestyle info", tr: "Yaşam tarzı bilgisi" },
  "profile.medicalHistory": { en: "Medical history", tr: "Tıbbi geçmiş" },
  "profile.heightWeight": { en: "Height & weight", tr: "Boy & kilo" },
  "profile.bloodGroup": { en: "Blood group", tr: "Kan grubu" },
  "profile.moreInfoBetter": { en: "More info = more accurate and personalized recommendations", tr: "Daha fazla bilgi = daha doğru ve kişisel öneriler" },
  "profile.completeMsg": { en: "You'll now receive the most accurate and personalized health recommendations", tr: "Artık en doğru ve kişisel sağlık önerilerini alabilirsin" },
  "profile.addAllergiesTip": { en: "Adding allergies improves your medication safety by 40%", tr: "Alerjilerini eklersen ilaç önerilerinde güvenliğin %40 artar" },

  // ══════════════════════════════════════════
  // User Panel — Sprint 15
  // ══════════════════════════════════════════
  "history.title": { en: "Query History", tr: "Sorgu Geçmişi" },
  "history.subtitle": { en: "Your past health queries and AI responses", tr: "Geçmiş sağlık sorgularınız ve AI yanıtları" },
  "history.noResults": { en: "No queries yet. Start by asking a health question!", tr: "Henüz sorgu yok. Bir sağlık sorusu sorarak başlayın!" },
  "history.interaction": { en: "Interaction Check", tr: "Etkileşim Kontrolü" },
  "history.general": { en: "Health Query", tr: "Sağlık Sorgusu" },
  "history.blood_test": { en: "Blood Test", tr: "Kan Tahlili" },
  "history.favorite": { en: "Favorite", tr: "Favori" },
  "history.unfavorite": { en: "Unfavorite", tr: "Favoriden Çıkar" },
  "history.delete": { en: "Delete", tr: "Sil" },
  "history.all": { en: "All", tr: "Tümü" },
  "history.favorites": { en: "Favorites", tr: "Favoriler" },
  "history.search": { en: "Search queries...", tr: "Sorguları ara..." },

  // ══════════════════════════════════════════
  // Badges / Gamification — Sprint 15
  // ══════════════════════════════════════════
  "badges.title": { en: "Achievement Badges", tr: "Başarı Rozetleri" },
  "badges.subtitle": { en: "Track your health journey milestones", tr: "Sağlık yolculuğu kilometre taşlarınızı takip edin" },
  "badges.earned": { en: "Earned", tr: "Kazanıldı" },
  "badges.locked": { en: "Locked", tr: "Kilitli" },
  "badges.progress": { en: "Progress", tr: "İlerleme" },
  "badges.engagementScore": { en: "Health Engagement Score", tr: "Sağlık Etkileşim Puanı" },
  "badges.engagementDesc": { en: "Calculated anonymously — compare with community average", tr: "Anonim olarak hesaplanır — topluluk ortalamasıyla karşılaştırın" },
  "badges.communityAvg": { en: "Community average: 42", tr: "Topluluk ortalaması: 42" },
  "badges.leaderboard": { en: "Global Leaderboard", tr: "Global Sıralama" },
  "badges.yourRank": { en: "Your Rank", tr: "Sıranız" },
  "badges.percentile": { en: "Percentile", tr: "Yüzdelik" },
  "badges.totalUsers": { en: "Total Users", tr: "Toplam Kullanıcı" },
  "badges.topScores": { en: "Top 10 Scores", tr: "En İyi 10 Puan" },

  // ══════════════════════════════════════════
  // Doctor Panel — Sprint 17
  // ══════════════════════════════════════════
  "doctor.title": { en: "Doctor Panel", tr: "Doktor Paneli" },
  "doctor.subtitle": { en: "Manage your patients and track compliance", tr: "Hastalarınızı yönetin ve uyumu takip edin" },
  "doctor.patients": { en: "Patients", tr: "Hastalar" },
  "doctor.addPatient": { en: "Invite Patient", tr: "Hasta Davet Et" },
  "doctor.visitSummary": { en: "AI Visit Summary", tr: "AI Ziyaret Özeti" },
  "doctor.compliance": { en: "Compliance Score", tr: "Uyum Puanı" },
  "doctor.noPatients": { en: "No patients yet. Send an invite link to get started.", tr: "Henüz hasta yok. Başlamak için bir davet linki gönderin." },
  "doctor.verification": { en: "Doctor Verification", tr: "Doktor Doğrulama" },
  "doctor.verificationDesc": { en: "Upload your medical license or TTB registration to verify your account.", tr: "Hesabınızı doğrulamak için diplomanızı veya TTB kaydınızı yükleyin." },
  "doctor.verified": { en: "Verified", tr: "Doğrulanmış" },
  "doctor.uploadDoc": { en: "Upload Document", tr: "Belge Yükle" },
  "doctor.verificationInstructions": { en: "Send your ID + diploma photo or TTB registration number. Manual verification within 24 hours.", tr: "TC kimlik + diploma fotoğrafı veya TTB sicil numarası gönderin. Manuel onay 24 saat içinde yapılır." },
  "doctor.supportedFormats": { en: "Supported: JPG, PNG, PDF (max 10MB)", tr: "Desteklenen: JPG, PNG, PDF (maks 10MB)" },
  "doctor.activePatients": { en: "Active Patients", tr: "Aktif Hasta" },
  "doctor.total": { en: "Total", tr: "Toplam" },
  "doctor.avgCompliance": { en: "Avg. Compliance", tr: "Ort. Uyum" },
  "doctor.visitsThisWeek": { en: "Visits This Week", tr: "Bu Hafta Ziyaret" },
  "doctor.joinTitle": { en: "Join Your Doctor", tr: "Doktorunuza Katılın" },
  "doctor.joinDesc": { en: "Enter the invite code from your doctor to connect your health profile.", tr: "Sağlık profilinizi bağlamak için doktorunuzdan aldığınız davet kodunu girin." },
  "doctor.joinSuccess": { en: "Successfully connected to your doctor!", tr: "Doktorunuza başarıyla bağlandınız!" },
  "doctor.invalidCode": { en: "Invalid or expired invite code.", tr: "Geçersiz veya süresi dolmuş davet kodu." },
  "doctor.cantJoinSelf": { en: "You cannot accept your own invite.", tr: "Kendi davetinizi kabul edemezsiniz." },
  "doctor.joinError": { en: "Something went wrong. Please try again.", tr: "Bir hata oluştu. Lütfen tekrar deneyin." },
  "doctor.tryAgain": { en: "Try again", tr: "Tekrar dene" },
  "doctor.inviteCode": { en: "Invite Code", tr: "Davet Kodu" },
  "doctor.acceptInvite": { en: "Accept Invite", tr: "Daveti Kabul Et" },
  "doctor.enterCode": { en: "Enter invite code (e.g. DR-ABC123)", tr: "Davet kodunu girin (ör. DR-ABC123)" },

  // ══════════════════════════════════════════
  // Operations & E-Nabız — Sprint 18
  // ══════════════════════════════════════════
  "operations.title": { en: "Upcoming Operations", tr: "Yaklaşan Operasyonlar" },
  "operations.subtitle": { en: "Pre & post-operative supplement management", tr: "Ameliyat öncesi & sonrası takviye yönetimi" },
  "operations.add": { en: "Add Operation", tr: "Operasyon Ekle" },
  "operations.new": { en: "New Operation", tr: "Yeni Operasyon" },
  "operations.namePlaceholder": { en: "Operation name", tr: "Operasyon adı" },
  "operations.notesPlaceholder": { en: "Notes (optional)", tr: "Notlar (isteğe bağlı)" },
  "operations.save": { en: "Save", tr: "Kaydet" },
  "operations.cancel": { en: "Cancel", tr: "İptal" },
  "operations.noOps": { en: "No upcoming operations", tr: "Planlanmış operasyon yok" },
  "operations.daysLeft": { en: "days left", tr: "gün kaldı" },
  "operations.past": { en: "Past", tr: "Geçmiş" },
  "operations.stopBefore": { en: "Supplements to Stop Before Surgery", tr: "Ameliyat Öncesi Kesilmesi Gereken Takviyeler" },
  "operations.stopNow": { en: "STOP NOW", tr: "ŞİMDİ KES" },
  "operations.insurance": { en: "Insurance Wellbeing Program", tr: "Sigorta Wellbeing Programı" },
  "operations.insuranceDesc": { en: "Insurance wellbeing integration coming soon. Your health tracking data (anonymous) can be used for insurance discounts.", tr: "Sigorta şirketleri ile wellbeing entegrasyonu yakında. Sağlık takip verileriniz (anonim) sigorta indirimi için kullanılabilecek." },
  "operations.insuranceOptIn": { en: "This feature is opt-in only. Your data is shared only with your consent.", tr: "Bu özellik opt-in bazlıdır. Verileriniz yalnızca izninizle paylaşılır." },
  "enabiz.title": { en: "E-Nabız Import", tr: "E-Nabız İçe Aktarma" },
  "enabiz.subtitle": { en: "Import your health records from E-Nabız", tr: "Sağlık kayıtlarınızı E-Nabız'dan içe aktarın" },
  "enabiz.uploadPdf": { en: "Upload E-Nabız PDF", tr: "E-Nabız PDF Yükle" },
  "enabiz.howItWorks": { en: "How it works", tr: "Nasıl çalışır?" },
  "enabiz.step1": { en: "Log into E-Nabız", tr: "E-Nabız'a giriş yapın" },
  "enabiz.step2": { en: "Download your results as PDF", tr: "Tahlillerinizi PDF olarak indirin" },
  "enabiz.step2Desc": { en: "From Lab Results section", tr: "Laboratuvar Sonuçları bölümünden" },
  "enabiz.step3": { en: "Upload here", tr: "Buraya yükleyin" },
  "enabiz.step3Desc": { en: "AI extracts automatically", tr: "AI otomatik çıkarır" },
  "enabiz.error": { en: "Could not read PDF. Please upload a valid E-Nabız PDF.", tr: "PDF okunamadı. Lütfen geçerli bir E-Nabız PDF'i yükleyin." },
  "enabiz.import": { en: "Import", tr: "İçe Aktar" },
  "enabiz.recordsImported": { en: "records imported", tr: "kayıt içe aktarıldı" },
  "enabiz.goToBloodTest": { en: "Go to Blood Test Analysis", tr: "Kan Tahlili Analizine Git" },
  "enabiz.dataSecurity": { en: "Data Security", tr: "Veri Güvenliği" },
  "enabiz.dataSecurityDesc": { en: "Your PDF is processed only for data extraction and is not stored. Extracted data is stored encrypted in your account.", tr: "PDF'iniz sadece veri çıkarma için işlenir ve saklanmaz. Çıkarılan veriler şifreli olarak hesabınızda depolanır." },

  // ══════════════════════════════════════════
  // Analytics & Data — Sprint 19
  // ══════════════════════════════════════════
  "analytics.title": { en: "Health Analytics", tr: "Sağlık Analitiği" },
  "analytics.subtitle": { en: "Insights from your health data", tr: "Sağlık verilerinizden içgörüler" },
  "analytics.queries": { en: "Queries", tr: "Sorgu" },
  "analytics.checkIns": { en: "Check-ins", tr: "Check-in" },
  "analytics.avgEnergy": { en: "Avg Energy", tr: "Ort. Enerji" },
  "analytics.avgSleep": { en: "Avg Sleep", tr: "Ort. Uyku" },
  "analytics.avgMood": { en: "Avg Mood", tr: "Ort. Ruh Hali" },
  "analytics.weeklyActivity": { en: "Weekly Query Activity", tr: "Haftalık Sorgu Aktivitesi" },
  "analytics.noData": { en: "No data for this period", tr: "Bu dönemde veri yok" },
  "analytics.checkInTrends": { en: "Check-in Trends", tr: "Check-in Trendleri" },
  "analytics.energy": { en: "Energy", tr: "Enerji" },
  "analytics.sleep": { en: "Sleep", tr: "Uyku" },
  "analytics.mood": { en: "Mood", tr: "Ruh Hali" },
  "analytics.noCheckInData": { en: "No check-in data", tr: "Check-in verisi yok" },
  "sideeffect.title": { en: "Side Effect Monitor", tr: "Yan Etki Monitörü" },
  "sideeffect.subtitle": { en: "Early signal detection from community data", tr: "Topluluk verisinden erken sinyal tespiti" },
  "sideeffect.report": { en: "Report", tr: "Bildir" },
  "sideeffect.submitted": { en: "Report submitted. Thank you!", tr: "Rapor gönderildi. Teşekkürler!" },
  "sideeffect.reportTitle": { en: "Side Effect Report", tr: "Yan Etki Bildirimi" },
  "sideeffect.supplementName": { en: "Supplement name *", tr: "Takviye adı *" },
  "sideeffect.medicationName": { en: "Medication name (if any)", tr: "İlaç adı (varsa)" },
  "sideeffect.descPlaceholder": { en: "Describe the side effect you experienced *", tr: "Yaşadığınız yan etkiyi açıklayın *" },
  "sideeffect.severity": { en: "Severity:", tr: "Şiddet:" },
  "sideeffect.mild": { en: "Mild", tr: "Hafif" },
  "sideeffect.moderate": { en: "Moderate", tr: "Orta" },
  "sideeffect.severe": { en: "Severe", tr: "Şiddetli" },
  "sideeffect.anonymousNote": { en: "Your report is added anonymously to community data", tr: "Raporunuz anonim olarak topluluk verisine eklenir" },
  "sideeffect.submit": { en: "Submit", tr: "Gönder" },
  "sideeffect.communitySignals": { en: "Community Signals", tr: "Topluluk Sinyalleri" },
  "sideeffect.signalDisclaimer": { en: "* These signals are automatically detected from anonymous community data. Not medical advice.", tr: "* Bu sinyaller anonim topluluk verisinden otomatik tespit edilir. Tıbbi tavsiye değildir." },
  "sideeffect.myReports": { en: "My Reports", tr: "Raporlarım" },
  "sideeffect.noReports": { en: "No reports yet", tr: "Henüz rapor yok" },

  // ══════════════════════════════════════════
  // PWA — Sprint 20
  // ══════════════════════════════════════════
  "pwa.installPrompt": { en: "Install Doctopal", tr: "Doctopal'yi Yükle" },
  "pwa.installDesc": { en: "Add to your home screen for quick access", tr: "Hızlı erişim için ana ekranınıza ekleyin" },
  "pwa.install": { en: "Install", tr: "Yükle" },
  "pwa.dismiss": { en: "Not now", tr: "Şimdi değil" },
  "pwa.offline": { en: "You're offline — some features may be limited", tr: "Çevrimdışısınız — bazı özellikler sınırlı olabilir" },

  // ══════════════════════════════════════════
  // Wrapped — Sprint 16
  // ══════════════════════════════════════════
  "wrapped.title": { en: "Your Health Year in Review", tr: "Sağlık Yılınız Özet" },
  "wrapped.subtitle": { en: "A look back at your health journey", tr: "Sağlık yolculuğunuza bir bakış" },
  "wrapped.shareTitle": { en: "My Health Year — Doctopal", tr: "Sağlık Yılım — Doctopal" },
  "wrapped.queries": { en: "Queries", tr: "Sorgu" },
  "wrapped.interactionChecks": { en: "Interaction Checks", tr: "Etkileşim Kontrolü" },
  "wrapped.checkIns": { en: "Check-ins", tr: "Check-in" },
  "wrapped.bloodTests": { en: "Blood Tests", tr: "Kan Tahlili" },
  "wrapped.yearSummary": { en: "Your Year in Numbers", tr: "Yıl Özetiniz" },
  "wrapped.daysActive": { en: "days active", tr: "gün aktif" },
  "wrapped.longestStreak": { en: "longest streak", tr: "en uzun seri" },
  "wrapped.mostUsed": { en: "Most Used Features", tr: "En Çok Kullanılan" },

  // ══════════════════════════════════════════
  // Onboarding Wizard
  // ══════════════════════════════════════════
  "onb.setupTitle": { en: "Set Up Your Health Profile", tr: "Sağlık Profilini Oluştur" },
  "onb.setupDesc": { en: "This helps us give you safe, personalized recommendations", tr: "Güvenli ve kişiselleştirilmiş öneriler sunmamı sağlar" },
  "onb.stepOf": { en: "Step", tr: "Adım" },
  "onb.of": { en: "of", tr: "/" },
  "onb.back": { en: "Back", tr: "Geri" },
  "onb.next": { en: "Next", tr: "İleri" },
  "onb.skipForNow": { en: "Skip for now", tr: "Şimdilik atla" },
  "onb.saving": { en: "Saving...", tr: "Kaydediliyor..." },
  "onb.complete": { en: "Complete", tr: "Tamamla" },
  "onb.sessionExpired": { en: "Your session has expired. Please sign in again.", tr: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın." },
  "onb.medSaveError": { en: "Failed to save medications. Please try again.", tr: "İlaçlar kaydedilemedi. Tekrar deneyin." },
  "onb.allergySaveError": { en: "Failed to save allergies. Please try again.", tr: "Alerjiler kaydedilemedi. Tekrar deneyin." },
  "onb.saveError": { en: "Failed to save your information. Please try again.", tr: "Bilgilerin kaydedilemedi. Tekrar dene." },

  // ══════════════════════════════════════════
  // Blood Test — PDF Upload
  // ══════════════════════════════════════════
  "bt.uploadPdf": { en: "Upload PDF", tr: "PDF Yükle" },
  "bt.uploadPdfDesc": { en: "Upload your blood test PDF — AI will automatically extract values", tr: "Kan tahlili PDF'inizi yükleyin — AI otomatik olarak değerleri çıkaracak" },
  "bt.analyzing": { en: "Analyzing...", tr: "Analiz..." },
  "bt.analyze": { en: "Analyze", tr: "Analiz Et" },
  "bt.choosePdf": { en: "Choose PDF or Photo", tr: "PDF veya Fotoğraf Seç" },

  // ══════════════════════════════════════════
  // Onboarding Steps — BasicInfo
  // ══════════════════════════════════════════
  // ══════════════════════════════════════════
  // Chat Interface — Extra
  // ══════════════════════════════════════════
  // ══════════════════════════════════════════
  // Doctor Panel — Extra
  // ══════════════════════════════════════════
  "doctor.summaryFailed": { en: "Could not generate summary.", tr: "Özet oluşturulamadı." },
  "doctor.connectionError": { en: "Connection error.", tr: "Bağlantı hatası." },
  "doctor.copied": { en: "Copied!", tr: "Kopyalandı!" },
  "doctor.copyLink": { en: "Copy link", tr: "Link kopyala" },
  "doctor.aiSummary": { en: "AI Summary", tr: "AI Özet" },
  "doctor.qrDesc": { en: "Patient can scan this QR to join", tr: "Hasta bu QR kodu tarayarak katılabilir" },
  "doctor.close": { en: "Close", tr: "Kapat" },
  "doctor.aiPatientSummary": { en: "AI Patient Summary", tr: "AI Hasta Özeti" },

  // ══════════════════════════════════════════
  // Notification Settings
  // ══════════════════════════════════════════
  "notif.title": { en: "Notifications", tr: "Bildirimler" },
  "notif.on": { en: "On", tr: "Açık" },
  "notif.off": { en: "Off", tr: "Kapalı" },
  "notif.blocked": { en: "Notifications blocked by browser. Enable in browser settings.", tr: "Bildirimler tarayıcı tarafından engellendi. Tarayıcı ayarlarından izin verin." },
  "notif.medReminders": { en: "Medication reminders", tr: "İlaç hatırlatıcısı" },
  "notif.dailyCheckIn": { en: "Daily check-in reminder", tr: "Günlük check-in hatırlatıcısı" },
  "notif.morningTime": { en: "Morning time", tr: "Sabah saati" },
  "notif.eveningTime": { en: "Evening time", tr: "Akşam saati" },

  "chat.attachFile": { en: "Attach file (PDF, JPG, PNG)", tr: "Dosya ekle (PDF, JPG, PNG)" },
  "chat.takePhoto": { en: "Take photo", tr: "Fotoğraf çek" },
  "chat.clearChat": { en: "Clear chat", tr: "Sohbeti temizle" },

  // ══════════════════════════════════════════
  // Onboarding Steps — BasicInfo
  // ══════════════════════════════════════════
  "onb.fullName": { en: "Full Name *", tr: "Ad Soyad *" },
  "onb.fullNamePlaceholder": { en: "Enter your full name", tr: "Adını ve soyadını gir" },
  "onb.birthDate": { en: "Date of Birth *", tr: "Doğum Tarihi *" },
  "onb.yourAge": { en: "Your age:", tr: "Yaşın:" },
  "onb.ageWarning": { en: "You must be 18 or older to use this service. Our recommendations are designed for adults only.", tr: "Bu hizmeti kullanmak için 18 yaşında veya daha büyük olmalısın. Önerilerimiz yalnızca yetişkinler için tasarlanmıştır." },
  "onb.gender": { en: "Biological Sex *", tr: "Biyolojik Cinsiyet *" },
  "onb.genderNote": { en: "Used for medication dosage and health calculations.", tr: "İlaç dozu ve sağlık hesaplamaları için kullanılır." },
  "onb.genderPlaceholder": { en: "Select your biological sex", tr: "Biyolojik cinsiyetini seç" },
  "onb.male": { en: "Male", tr: "Erkek" },
  "onb.female": { en: "Female", tr: "Kadın" },
  "onb.other": { en: "Other", tr: "Diğer" },
  "onb.preferNotToSay": { en: "Prefer not to say", tr: "Belirtmek istemiyorum" },
  "onb.requiredFields": { en: "* Required fields. This basic information helps us account for age and sex-specific physiological differences to make accurate decisions.", tr: "* Zorunlu alanlar. Bu temel bilgiler, yaşa ve cinsiyete özgü fizyolojik farklılıkları hesaba katarak doğru kararlar almamız için gereklidir." },

  // Allergies Step
  "onb.noAllergies": { en: "I have no known allergies", tr: "Bilinen alerjim yok" },
  "onb.addAllergy": { en: "Add an allergy", tr: "Alerji ekle" },
  "onb.allergen": { en: "Allergen", tr: "Alerjen" },
  "onb.allergenPlaceholder": { en: "e.g., Penicillin, Chamomile, Nuts", tr: "ör. Penisilin, Papatya, Fındık" },
  "onb.severity": { en: "Severity", tr: "Şiddet" },
  "onb.mild": { en: "Mild", tr: "Hafif" },
  "onb.moderate": { en: "Moderate", tr: "Orta" },
  "onb.severe": { en: "Severe", tr: "Şiddetli" },
  "onb.anaphylaxis": { en: "Anaphylaxis", tr: "Anafilaksi" },
  "onb.addAllergyBtn": { en: "Add Allergy", tr: "Alerji Ekle" },
  "onb.allergyNote": { en: "Herbal products may cross-react with known allergies. We filter recommendations accordingly.", tr: "Bitkisel ürünler bilinen alerjilerle çapraz reaksiyon verebilir. Önerilerimizi buna göre filtreliyoruz." },

  // Evidence Grade
  "evidence.grade": { en: "Grade", tr: "Kanıt" },

  // ══════════════════════════════════════════
  // Profile — Health Edit Form
  // ══════════════════════════════════════════
  "profile.editHealthProfile": { en: "Edit Health Profile", tr: "Sağlık Profilini Düzenle" },
  "profile.edit": { en: "Edit", tr: "Düzenle" },
  "profile.allergies": { en: "Allergies", tr: "Alerjiler" },
  "profile.noAllergies": { en: "No allergies", tr: "Alerji yok" },
  "profile.allergenPlaceholder": { en: "Allergen name...", tr: "Alerjen adı..." },
  "profile.severityMild": { en: "Mild", tr: "Hafif" },
  "profile.severityModerate": { en: "Moderate", tr: "Orta" },
  "profile.severitySevere": { en: "Severe", tr: "Şiddetli" },
  "profile.severityAnaphylaxis": { en: "Anaphylaxis", tr: "Anafilaksi" },
  "profile.pregnancyBreastfeeding": { en: "Pregnancy / Breastfeeding", tr: "Gebelik / Emzirme" },
  "profile.pregnant": { en: "Pregnant", tr: "Hamile" },
  "profile.breastfeeding": { en: "Breastfeeding", tr: "Emziriyor" },
  "profile.alcohol": { en: "Alcohol", tr: "Alkol" },
  "profile.smoking": { en: "Smoking", tr: "Sigara" },
  "profile.kidneyDisease": { en: "Kidney disease", tr: "Böbrek hastalığı" },
  "profile.liverDisease": { en: "Liver disease", tr: "Karaciğer hastalığı" },
  "profile.recentSurgery": { en: "Recent surgery (last 3 months)", tr: "Son 3 ayda ameliyat" },
  "profile.chronicConditions": { en: "Chronic Conditions", tr: "Kronik Hastalıklar" },
  "profile.otherConditionPlaceholder": { en: "Other condition...", tr: "Diğer hastalık..." },
  "profile.lifestyle": { en: "Lifestyle", tr: "Yaşam Tarzı" },
  "profile.height": { en: "Height (cm)", tr: "Boy (cm)" },
  "profile.heightPlaceholder": { en: "e.g., 175", tr: "ör. 175" },
  "profile.weight": { en: "Weight (kg)", tr: "Kilo (kg)" },
  "profile.weightPlaceholder": { en: "e.g., 70", tr: "ör. 70" },
  "profile.select": { en: "Select", tr: "Seçin" },
  "profile.dietType": { en: "Diet Type", tr: "Diyet Türü" },
  "profile.dietRegular": { en: "Regular", tr: "Normal" },
  "profile.dietVegetarian": { en: "Vegetarian", tr: "Vejetaryen" },
  "profile.dietGlutenFree": { en: "Gluten-free", tr: "Glutensiz" },
  "profile.dietHalal": { en: "Halal", tr: "Helal" },
  "profile.dietOther": { en: "Other", tr: "Diğer" },
  "profile.exercise": { en: "Exercise", tr: "Egzersiz" },
  "profile.exerciseSedentary": { en: "Sedentary", tr: "Hareketsiz" },
  "profile.exerciseLight": { en: "Light (1-2x/week)", tr: "Hafif (1-2/hafta)" },
  "profile.exerciseModerate": { en: "Moderate (3-4x/week)", tr: "Orta (3-4/hafta)" },
  "profile.exerciseActive": { en: "Active (5+x/week)", tr: "Aktif (5+/hafta)" },
  "profile.exerciseAthlete": { en: "Athlete", tr: "Sporcu" },
  "profile.sleep": { en: "Sleep", tr: "Uyku" },
  "profile.sleepGood": { en: "Good (7-9 hours)", tr: "İyi (7-9 saat)" },
  "profile.sleepFair": { en: "Fair", tr: "Orta" },
  "profile.sleepPoor": { en: "Poor", tr: "Kötü" },
  "profile.sleepInsomnia": { en: "Insomnia", tr: "Uykusuzluk" },
  "profile.supplements": { en: "Supplements", tr: "Takviyeler" },
  "profile.deleteConfirmText": { en: "DELETE", tr: "SİL" },
  "profile.editHealthDesc": { en: "Update your allergies, pregnancy status, substance use, chronic conditions, and lifestyle info here.", tr: "Alerjiler, gebelik, madde kullanımı, kronik hastalıklar ve yaşam tarzı bilgilerinizi buradan güncelleyebilirsiniz." },
  "profile.editHealthHint": { en: "Click \"Edit\" to update your health profile.", tr: "Sağlık profilinizi güncellemek için \"Düzenle\" butonuna tıklayın." },
  "profile.alcoholNone": { en: "None", tr: "Kullanmıyorum" },
  "profile.alcoholOccasional": { en: "Occasional", tr: "Ara sıra" },
  "profile.alcoholRegular": { en: "Regular", tr: "Düzenli" },
  "profile.alcoholHeavy": { en: "Heavy", tr: "Ağır" },
  "profile.smokingNever": { en: "Never", tr: "Hiç içmedim" },
  "profile.smokingFormer": { en: "Former", tr: "Eski içici" },
  "profile.smokingCurrent": { en: "Current", tr: "Aktif içici" },
  "profile.dietVegan": { en: "Vegan", tr: "Vegan" },
  "profile.dietKeto": { en: "Keto", tr: "Keto" },
  "profile.conditionDiabetes": { en: "Diabetes", tr: "Diyabet" },
  "profile.conditionHypertension": { en: "Hypertension", tr: "Hipertansiyon" },
  "profile.conditionAsthma": { en: "Asthma", tr: "Astım" },
  "profile.conditionHeartDisease": { en: "Heart Disease", tr: "Kalp Hastalığı" },
  "profile.conditionThyroid": { en: "Thyroid Disorder", tr: "Tiroid Bozukluğu" },
  "profile.conditionArthritis": { en: "Arthritis", tr: "Artrit" },
  "profile.conditionDepression": { en: "Depression", tr: "Depresyon" },
  "profile.conditionAnxiety": { en: "Anxiety", tr: "Anksiyete" },
  "profile.conditionCOPD": { en: "COPD", tr: "KOAH" },
  "profile.conditionEpilepsy": { en: "Epilepsy", tr: "Epilepsi" },
  "profile.suppVitaminD": { en: "Vitamin D", tr: "D Vitamini" },
  "profile.suppVitaminB12": { en: "Vitamin B12", tr: "B12 Vitamini" },
  "profile.suppIron": { en: "Iron", tr: "Demir" },
  "profile.suppOmega3": { en: "Omega-3", tr: "Omega-3" },
  "profile.suppMagnesium": { en: "Magnesium", tr: "Magnezyum" },
  "profile.suppZinc": { en: "Zinc", tr: "Çinko" },
  "profile.suppProbiotics": { en: "Probiotics", tr: "Probiyotikler" },
  "profile.suppMultivitamin": { en: "Multivitamin", tr: "Multivitamin" },

  // ══════════════════════════════════════════
  // Medication Update Dialog
  // ══════════════════════════════════════════
  "med.pregnantFlag": { en: "Pregnant", tr: "Hamile" },
  "med.breastfeedingFlag": { en: "Breastfeeding", tr: "Emziriyor" },
  "med.kidneyFlag": { en: "Kidney Disease", tr: "Böbrek Hastalığı" },
  "med.liverFlag": { en: "Liver Disease", tr: "Karaciğer Hastalığı" },
  "med.noFlags": { en: "No health flags recorded", tr: "Kayıtlı sağlık durumu yok" },
  "med.back": { en: "← Back", tr: "← Geri" },
  "med.title15": { en: "Medication List Update", tr: "İlaç Listesi Güncellemesi" },
  "med.desc15": { en: "Review your medication list. You can add new medications or remove ones you no longer take. Confirm when done.", tr: "İlaç listenizi gözden geçirin. Yeni ilaç ekleyebilir veya kullanmadıklarınızı kaldırabilirsiniz. Tamamlandığında onaylayın." },
  "med.currentMeds": { en: "Your current medications:", tr: "Mevcut ilaçlarınız:" },
  "med.empty": { en: "No medications recorded", tr: "Kayıtlı ilaç bulunamadı" },
  "med.addNew": { en: "Add new medication", tr: "Yeni ilaç ekle" },
  "med.brandLabel": { en: "Brand Name", tr: "Marka Adı" },
  "med.brandPlaceholder": { en: "e.g., Metformin, Aspirin", tr: "ör. Glifor, Coraspin" },
  "med.genericLabel": { en: "Generic Name", tr: "Etken Madde" },
  "med.genericPlaceholder": { en: "e.g., Metformin", tr: "ör. Metformin" },
  "med.dosageLabel": { en: "Dosage", tr: "Doz" },
  "med.dosagePlaceholder": { en: "e.g., 500mg", tr: "ör. 500mg" },
  "med.freqLabel": { en: "Frequency", tr: "Kullanım Sıklığı" },
  "med.freqPlaceholder": { en: "e.g., Twice daily", tr: "ör. Günde 2 kez" },
  "med.addBtn": { en: "Add Medication", tr: "İlaç Ekle" },
  "med.confirmBtn": { en: "Confirm My Medications", tr: "İlaçlarımı Onaylıyorum" },
  "med.confirming": { en: "Confirming...", tr: "Onaylanıyor..." },

  // ══════════════════════════════════════════
  // Supplement Dialogs
  // ══════════════════════════════════════════
  "supp.safe": { en: "Safe", tr: "Güvenli" },
  "supp.caution": { en: "Use with Caution", tr: "Dikkatli Kullanın" },
  "supp.dangerous": { en: "Not Recommended", tr: "Önerilmez" },
  "supp.title": { en: "Supplement Manager", tr: "Takviye Yönetimi" },
  "supp.desc": { en: "Type a supplement name — assistant will analyze it for your profile.", tr: "Takviye adı yazın — asistan profilinize göre analiz edecek." },
  "supp.placeholder": { en: "Type supplement name (e.g. creatine, omega-3...)", tr: "Takviye adı yazın (ör. kreatin, omega-3...)" },
  "supp.hint": { en: "Start typing, pick from list or press Enter", tr: "Yazmaya başlayın, listeden seçin veya Enter'a basın" },
  "supp.checking": { en: "Analyzing based on your profile...", tr: "Profiline göre analiz ediliyor..." },
  "supp.interactions": { en: "Interactions:", tr: "Etkileşimler:" },
  "supp.doseLabel": { en: "Daily dose", tr: "Günlük doz" },
  "supp.suggestion": { en: "Assistant suggestion", tr: "Asistan önerisi" },
  "supp.timing": { en: "When will you take it?", tr: "Ne zaman alacaksınız?" },
  "supp.notifGet": { en: "Get notified", tr: "Bildirim al" },
  "supp.cycleLabel": { en: "Cycle Info", tr: "Döngü Bilgisi" },
  "supp.cycleRec": { en: "Recommendation", tr: "Asistan önerisi" },
  "supp.unlimited": { en: "Can be used indefinitely (no cycling needed)", tr: "Süresiz kullanılabilir (döngü gerektirmez)" },
  "supp.cycleDuration": { en: "Cycle duration:", tr: "Döngü süresi:" },
  "supp.days": { en: "days", tr: "gün" },
  "supp.dayBreak": { en: "day break", tr: "gün mola" },
  "supp.cycleZero": { en: "0 = No cycling, unlimited use", tr: "0 = Döngü yok, süresiz kullanım" },
  "supp.tryDiff": { en: "Try Different Supplement", tr: "Farklı Takviye Dene" },
  "supp.addToList": { en: "Add to List", tr: "Listeye Ekle" },
  "supp.active": { en: "My Active Supplements", tr: "Aktif Takviyelerim" },
  "supp.empty": { en: "No supplements added yet.", tr: "Henüz takviye eklenmemiş." },
  "supp.used": { en: "Used", tr: "Kullanıldı" },
  "supp.remaining": { en: "Remaining", tr: "Kalan" },
  "supp.unlimitedDisp": { en: "Unlimited", tr: "Sınırsız" },
  "supp.expired": { en: "Cycle period expired!", tr: "Döngü süresi doldu!" },
  "supp.maxSafe": { en: "Max safe:", tr: "Maks güvenli:" },
  "supp.dosePlaceholder": { en: "e.g. 500mg", tr: "ör: 500mg" },
  "supp.timeLabel": { en: "Time of use", tr: "Kullanım saati" },
  "supp.noLimit": { en: "No limit", tr: "Sınırsız" },
  "supp.saving": { en: "Saving...", tr: "Kaydediliyor..." },
  "supp.removeConfirm": { en: "Yes, Remove", tr: "Evet, Kaldır" },
  "supp.removeLabel": { en: "Remove supplement", tr: "Takviyeyi kaldır" },

  // ══════════════════════════════════════════
  // Boss Fight
  // ══════════════════════════════════════════
  "boss.overallProgress": { en: "Overall Progress", tr: "Genel İlerleme" },
  "boss.newBoss": { en: "New Boss", tr: "Yeni Boss" },
  "boss.tasksLabel": { en: "Tasks:", tr: "Görevler:" },
  "boss.intro": { en: "Pick a protocol and start your health adventure", tr: "Bir protokol seç ve sağlık macerana başla" },
  "boss.easy": { en: "Easy", tr: "Kolay" },
  "boss.medium": { en: "Medium", tr: "Orta" },
  "boss.hard": { en: "Hard", tr: "Zor" },

  // ══════════════════════════════════════════
  // Family Manager
  // ══════════════════════════════════════════
  "family.minor": { en: "Minor", tr: "Reşit değil" },
  "family.ageUnit": { en: "yrs", tr: "yaş" },
  "family.pregnantFlag": { en: "Pregnant", tr: "Hamile" },
  "family.breastfeedingFlag": { en: "Breastfeeding", tr: "Emziriyor" },
  "family.kidneyFlag": { en: "Kidney", tr: "Böbrek" },
  "family.liverFlag": { en: "Liver", tr: "Karaciğer" },
  "family.healthy": { en: "Healthy profile", tr: "Sağlıklı profil" },
  "family.removeProfile": { en: "Remove Profile", tr: "Profili Sil" },
  "family.newMember": { en: "New Family Member", tr: "Yeni Aile Üyesi" },
  "family.namePlaceholder": { en: "Full Name", tr: "Ad Soyad" },
  "family.birthDate": { en: "Birth Date", tr: "Doğum Tarihi" },
  "family.genderLabel": { en: "Gender", tr: "Cinsiyet" },
  "family.selectGender": { en: "Select", tr: "Seçiniz" },
  "family.relationship": { en: "Relationship", tr: "Yakınlık" },
  "family.chronicPlaceholder": { en: "Chronic conditions (comma-separated)", tr: "Kronik hastalıklar (virgülle ayır)" },

  // ══════════════════════════════════════════
  // Calendar TodayView extras
  // ══════════════════════════════════════════
  "cal.overdueAlert": { en: "overdue!", tr: "saati geçti!" },
  "cal.dontForgetMeds": { en: "Don't forget to take your medication!", tr: "İlacını almayı unutma!" },
  "cal.dontForgetSupp": { en: "Don't forget to take your supplement!", tr: "Takviyeni almayı unutma!" },
  "cal.checkinComplete": { en: "Check-in complete", tr: "Check-in tamamlandı" },
  "cal.checkinRecorded": { en: "Today's status recorded!", tr: "Bugünkü durumun kaydedildi!" },
  "cal.reminderQuestion": { en: "when should I remind you?", tr: "ne zaman hatırlatayım?" },
  "cal.removeReminder": { en: "Remove", tr: "Kaldır" },
  "cal.confirmReminder": { en: "Confirm", tr: "Onayla" },
  "cal.addSuppBtn": { en: "Add", tr: "Ekle" },
  "cal.fromProfile": { en: "From your profile:", tr: "Profilindeki takviyeler:" },
  "cal.addSuppHint": { en: "Add supplements — safety checked against your profile.", tr: "Takviye ekleyin — profilinize göre güvenlik kontrolü yapılır." },
  "cal.deleteEvent": { en: "Delete", tr: "Sil" },
  "cal.waterUnit": { en: "Glass", tr: "Bardak" },
  "cal.adjustDose": { en: "Adjust Dose", tr: "Doz Ayarla" },
  "cal.dailyDose": { en: "Daily dose", tr: "Günlük doz" },
  "cal.saveDose": { en: "Save", tr: "Kaydet" },
  "cal.setGoalTitle": { en: "Set Goal", tr: "Hedef Belirle" },

  // ══════════════════════════════════════════
  // Chat History
  // ══════════════════════════════════════════
  "ch.today": { en: "Today", tr: "Bugün" },
  "ch.yesterday": { en: "Yesterday", tr: "Dün" },
  "ch.thisWeek": { en: "This Week", tr: "Bu Hafta" },
  "ch.older": { en: "Older", tr: "Daha Eski" },
  "ch.newChat": { en: "New chat", tr: "Yeni sohbet" },

  // ══════════════════════════════════════════
  // Share Cards
  // ══════════════════════════════════════════
  "share.bioAgeTitle": { en: "My Biological Age", tr: "Biyolojik Yaşım" },
  "share.weeklyTitle": { en: "Weekly Health Summary", tr: "Haftalık Sağlık Özeti" },
  "share.protocolTitle": { en: "Protocol Completed!", tr: "Protokol Tamamlandı!" },
  "share.interactionTitle": { en: "Interaction Alert", tr: "Etkileşim Uyarısı" },
  "share.bloodTestTitle": { en: "Blood Test Results", tr: "Kan Tahlili Sonuçları" },

  // ══════════════════════════════════════════
  // Remaining Hardcoded — Phase 7 Cleanup
  // ══════════════════════════════════════════
  "history.noFavorites": { en: "No favorites yet", tr: "Henüz favori eklemediniz" },
  "history.noQueries": { en: "Your queries will appear here", tr: "Sorularınız burada görünecek" },
  "profile.cancel": { en: "Cancel", tr: "İptal" },
  "profile.save": { en: "Save", tr: "Kaydet" },
  "profile.healthDesc": { en: "Update your allergies, pregnancy status, substance use, chronic conditions, and lifestyle info here.", tr: "Alerjiler, gebelik, madde kullanımı, kronik hastalıklar ve yaşam tarzı bilgilerinizi buradan güncelleyin." },
  "profile.exportFailed": { en: "Data export failed", tr: "Veri indirme başarısız" },
  "profile.deleteFailed": { en: "Account deletion failed", tr: "Hesap silme başarısız" },
  "vital.notesPlaceholder": { en: "e.g., After meal", tr: "ör. Yemekten sonra" },
  "family.confirmRemove": { en: "Are you sure you want to remove this member?", tr: "Bu üyeyi kaldırmak istediğinize emin misiniz?" },
  "family.addError": { en: "Failed to add family member", tr: "Aile üyesi eklenemedi" },
  "chat.fileTooLarge": { en: "is too large. Maximum size is 10MB.", tr: "dosyası çok büyük. Maksimum boyut 10MB." },
  "chat.fileUnsupported": { en: "is not supported. Please use PDF, JPG, or PNG.", tr: "desteklenmiyor. Lütfen PDF, JPG veya PNG kullanın." },
  "washout.add": { en: "Add", tr: "Takviye Ekle" },
  "washout.suppPlaceholder": { en: "Supplement name...", tr: "Takviye adı..." },
  "washout.addBtn": { en: "Add", tr: "Ekle" },

  // ══════════════════════════════════════════
  // Onboarding — OptionalProfileStep
  // ══════════════════════════════════════════
  "onb.optionalHint": { en: "These details help us personalize your recommendations. You can skip this and fill it later.", tr: "Bu bilgiler önerilerimizi kişiselleştirmemize yardımcı olur. Atlayıp daha sonra doldurabilirsin." },
  "onb.heightLabel": { en: "Height (cm)", tr: "Boy (cm)" },
  "onb.heightPlaceholder": { en: "e.g., 175", tr: "ör. 175" },
  "onb.weightLabel": { en: "Weight (kg)", tr: "Kilo (kg)" },
  "onb.weightPlaceholder": { en: "e.g., 70", tr: "ör. 70" },
  "onb.bloodGroup": { en: "Blood Group", tr: "Kan Grubu" },
  "onb.bloodGroupPlaceholder": { en: "Select blood group", tr: "Kan grubunuzu seçin" },
  "onb.dietType": { en: "Diet Type", tr: "Diyet Türü" },
  "onb.dietPlaceholder": { en: "Select your diet", tr: "Diyetini seç" },
  "onb.exerciseFreq": { en: "Exercise Frequency", tr: "Egzersiz Sıklığı" },
  "onb.exercisePlaceholder": { en: "How often do you exercise?", tr: "Ne sıklıkta egzersiz yapıyorsun?" },
  "onb.sleepQuality": { en: "Sleep Quality", tr: "Uyku Kalitesi" },
  "onb.sleepPlaceholder": { en: "How well do you sleep?", tr: "Uyku kaliten nasıl?" },
  "onb.supplements": { en: "Current Supplements / Vitamins", tr: "Mevcut Takviyeler / Vitaminler" },
  "onb.otherSupplement": { en: "Other supplement...", tr: "Diğer takviye..." },

  // ══════════════════════════════════════════
  // Onboarding — SubstanceStep
  // ══════════════════════════════════════════
  "onb.alcoholUse": { en: "Alcohol Use", tr: "Alkol Kullanımı" },
  "onb.alcNone": { en: "None", tr: "Kullanmıyorum" },
  "onb.alcOccasional": { en: "Occasional (social drinking)", tr: "Ara sıra (sosyal içici)" },
  "onb.alcRegular": { en: "Regular (several times a week)", tr: "Düzenli (haftada birkaç kez)" },
  "onb.alcHeavy": { en: "Heavy (daily)", tr: "Ağır (günlük)" },
  "onb.smokingUse": { en: "Smoking", tr: "Sigara Kullanımı" },
  "onb.smkNone": { en: "Never smoked", tr: "Hiç içmedim" },
  "onb.smkFormer": { en: "Former smoker (quit)", tr: "Eski içici (bıraktım)" },
  "onb.smkCurrent": { en: "Current smoker", tr: "Aktif içici" },
  "onb.substanceNote": { en: "Alcohol and smoking can interact with both medications and herbal supplements. This information helps us provide safer recommendations.", tr: "Alkol ve sigara hem ilaçlarla hem de bitkisel takviyelerle etkileşebilir. Bu bilgi daha güvenli öneriler sunmamızı sağlar." },

  // ══════════════════════════════════════════
  // Onboarding — MedicalHistoryStep
  // ══════════════════════════════════════════
  "onb.criticalConditions": { en: "Critical Conditions", tr: "Kritik Durumlar" },
  "onb.kidneyDisease": { en: "Kidney disease", tr: "Böbrek hastalığı" },
  "onb.liverDisease": { en: "Liver disease", tr: "Karaciğer hastalığı" },
  "onb.recentSurgery": { en: "Surgery or hospitalization in the last 3 months", tr: "Son 3 ayda ameliyat veya hastaneye yatış" },
  "onb.chronicConditions": { en: "Chronic Conditions", tr: "Kronik Hastalıklar" },
  "onb.otherCondition": { en: "Other condition...", tr: "Diğer hastalık..." },
  "onb.medHistoryNote": { en: "Kidney and liver conditions significantly affect how herbs are metabolized. This ensures we never recommend anything that could worsen your condition.", tr: "Böbrek ve karaciğer hastalıkları bitkilerin metabolizmasını önemli ölçüde etkiler. Bu bilgi durumunuzu kötüleştirebilecek hiçbir şey önermememizi sağlar." },

  // ══════════════════════════════════════════
  // Onboarding — PregnancyStep
  // ══════════════════════════════════════════
  "onb.pregnantQ": { en: "Are you currently pregnant?", tr: "Şu anda hamile misin?" },
  "onb.breastfeedingQ": { en: "Are you currently breastfeeding?", tr: "Şu anda emziriyor musunuz?" },
  "onb.yes": { en: "Yes", tr: "Evet" },
  "onb.no": { en: "No", tr: "Hayır" },
  "onb.pregnancyWarning": { en: "Many herbal products are unsafe during pregnancy and breastfeeding. Our system will apply extra safety filters to all recommendations for your protection.", tr: "Birçok bitkisel ürün gebelik ve emzirme döneminde güvenli değildir. Sistemimiz tüm önerilere ekstra güvenlik filtreleri uygulayacaktır." },
  "onb.pregnancyNote": { en: "This information activates additional safety filters. Many commonly used herbs are contraindicated during pregnancy and lactation.", tr: "Bu bilgi ek güvenlik filtrelerini etkinleştirir. Yaygın kullanılan birçok bitki gebelik ve emzirme döneminde kontrendikedir." },

  // ══════════════════════════════════════════
  // Onboarding — ConsentStep
  // ══════════════════════════════════════════
  "onb.disclaimerTitle": { en: "Medical Disclaimer", tr: "Tıbbi Sorumluluk Reddi" },
  "onb.dataPrivacy": { en: "Data Privacy", tr: "Veri Gizliliği" },
  "onb.dataIntro": { en: "Your health data is:", tr: "Sağlık verilerin:" },
  "onb.termsLink": { en: "Terms of Service", tr: "Kullanım Koşulları" },
  "onb.privacyLink": { en: "Privacy Policy", tr: "Gizlilik Politikası" },

  // Onboarding — Phase labels & why-we-ask
  "onb.reassurance": { en: "(~2 min · You can edit all your info later in settings)", tr: "(~2 dk · Tüm bilgilerini daha sonra ayarlardan düzenleyebilirsin)" },
  "onb.moreInfoBetter": { en: "The more you share, the more precise and safe recommendations DoctoPal can offer.", tr: "Ne kadar çok bilgi verirsen, DoctoPal sana o kadar nokta atışı ve güvenli öneriler sunar." },
  "onb.displayName": { en: "What should we call you? *", tr: "Sana nasıl hitap edelim? *" },
  "onb.displayNamePlaceholder": { en: "e.g. Night Owl, Alex or just your name...", tr: "Örn: Gece Kuşu, Alex veya sadece Taha..." },
  "onb.tooltipBirthDate": { en: "Needed for age-specific reference ranges and risk factors.", tr: "Yaşa özgü referans aralıkları ve risk faktörleri için gereklidir." },
  "onb.tooltipGender": { en: "Used to calculate medication dosages based on your hormonal profile.", tr: "Hormon profiline uygun ilaç dozu hesaplamak için kullanıyoruz." },
  "onb.tooltipHeightWeight": { en: "Used for medication dosing and BMI-based recommendations.", tr: "İlaç dozu ve BMI bazlı öneriler için kullanılır." },
  "onb.doseDisclaimer": { en: "Please make sure the dosage is correct. Edit if your doctor prescribed a different dose.", tr: "Lütfen dozunu doğru girdiğinden emin ol. Doktorun farklı bir doz verdiyse düzenle." },
  "onb.reactionType": { en: "Reaction Type", tr: "Reaksiyon Tipi" },
  "onb.reactionAnaphylaxis": { en: "Anaphylaxis (Breathing difficulty / Shock)", tr: "Anafilaksi (Nefes Darlığı / Şok)" },
  "onb.reactionUrticaria": { en: "Urticaria / Widespread Rash", tr: "Kurdeşen / Yaygın Döküntü" },
  "onb.reactionMildSkin": { en: "Mild Itching / Local Redness", tr: "Hafif Kaşıntı / Lokal Kızarıklık" },
  "onb.reactionGI": { en: "Nausea / Diarrhea (Intolerance)", tr: "Mide Bulantısı / İshal (İntolerans)" },
  "onb.reactionUnknown": { en: "Don't know / Don't remember", tr: "Bilmiyorum / Hatırlamıyorum" },
  "onb.smokingNever": { en: "Never smoked", tr: "Hiç İçmedim" },
  "onb.smokingFormer": { en: "Former smoker (quit)", tr: "Eski İçici (Bıraktım)" },
  "onb.smokingActive": { en: "Active smoker", tr: "Aktif İçici" },
  "onb.smokingAmount": { en: "How much per day?", tr: "Günde ne kadar?" },
  "onb.smokingHalfPack": { en: "Half pack or less", tr: "10 dal (Yarım paket) veya altı" },
  "onb.smokingOnePack": { en: "1 pack (20 cigs)", tr: "1 Paket (20 dal)" },
  "onb.smokingMorePack": { en: "1.5+ packs", tr: "1.5 Paket ve üzeri" },
  "onb.smokingYears": { en: "How many years?", tr: "Kaç yıl?" },
  "onb.smoking1to5": { en: "1–5 years", tr: "1 - 5 Yıl" },
  "onb.smoking5to15": { en: "5–15 years", tr: "5 - 15 Yıl" },
  "onb.smoking15plus": { en: "15+ years", tr: "15 Yıl ve üzeri" },
  "onb.smokingQuitWhen": { en: "When did you quit?", tr: "Ne zaman bıraktın?" },
  "onb.smokingQuit1yr": { en: "Within last year", tr: "Son 1 yıl içinde" },
  "onb.smokingQuit1to5": { en: "1–5 years ago", tr: "1 - 5 Yıl arası" },
  "onb.smokingQuit5plus": { en: "More than 5 years ago", tr: "5 Yıldan uzun" },
  "onb.alcNever": { en: "Never drank", tr: "Hiç İçmedim" },
  "onb.alcFormer": { en: "Former drinker (quit)", tr: "Eski İçici (Bıraktım)" },
  "onb.alcActive": { en: "Active drinker", tr: "Aktif İçici" },
  "onb.alcFrequency": { en: "How often?", tr: "Ne sıklıkta?" },
  "onb.alcSocial": { en: "Social (1-2 times/month)", tr: "Sosyal (Ayda 1-2 kez)" },
  "onb.alcWeekly": { en: "Weekly (1-3 times/week)", tr: "Haftalık (Haftada 1-3 kez)" },
  "onb.alcDaily": { en: "Daily", tr: "Günlük" },
  "onb.noChronic": { en: "I have no known chronic conditions", tr: "Bilinen kronik hastalığım yok" },
  "onb.bleedingDisorder": { en: "Bleeding disorder / Active stomach ulcer", tr: "Kanama Bozukluğu / Aktif Mide Ülseri" },
  "onb.immuneSuppressed": { en: "Immune suppression (Cancer tx, Transplant, HIV)", tr: "Bağışıklık Baskılanması (Kanser tedavisi, Nakil, HIV)" },
  "onb.advancedOrganFailure": { en: "Advanced Kidney/Liver Failure or Dialysis", tr: "İleri Böbrek/KC Yetmezliği veya Diyaliz" },
  "onb.hypertension": { en: "Hypertension", tr: "Hipertansiyon" },
  "onb.categoryCardio": { en: "Cardiovascular", tr: "Kardiyovasküler" },
  "onb.arrhythmia": { en: "Arrhythmia (Heart rhythm disorder)", tr: "Aritmi (Kalp Ritmi Bozukluğu)" },
  "onb.heartFailure": { en: "Heart Failure / Past MI", tr: "Kalp Yetmezliği / Geçirilmiş Kalp Krizi" },
  "onb.categoryEndocrine": { en: "Endocrine", tr: "Endokrin" },
  "onb.diabetesType": { en: "Diabetes (Type 1/2)", tr: "Diyabet (Tip 1/2)" },
  "onb.thyroid": { en: "Thyroid disorder (Hypo/Hyper)", tr: "Tiroid Bozukluğu (Hipo/Hiper)" },
  "onb.categoryNeuro": { en: "Neurological", tr: "Nörolojik" },
  "onb.epilepsy": { en: "Epilepsy", tr: "Epilepsi" },
  "onb.depressionAnxiety": { en: "Depression / Anxiety", tr: "Depresyon / Anksiyete" },
  "onb.categoryRespiratory": { en: "Respiratory", tr: "Solunum" },
  "onb.asthma": { en: "Asthma", tr: "Astım" },
  "onb.copd": { en: "COPD", tr: "KOAH" },
  "onb.categorySurgical": { en: "Surgical History", tr: "Cerrahi Geçmiş" },
  "onb.bariatricSurgery": { en: "Stomach/Intestinal surgery (Bariatric etc.)", tr: "Mide/Bağırsak ameliyatı (Bariatrik vb.)" },
  "onb.familyHistoryTitle": { en: "Family Health History", tr: "Soygeçmiş (Aile Sağlık Öyküsü)" },
  "onb.familyHistoryDesc": { en: "Known genetic or chronic conditions in first-degree relatives", tr: "Birinci derece akrabalarda bilinen genetik/kronik hastalıklar" },
  "onb.noFamilyHistory": { en: "No known chronic or genetic conditions in my close family", tr: "Birinci derece akrabalarımda bilinen kronik veya genetik hastalık yok" },
  "onb.familyCardio": { en: "Early heart attack (<55 yrs)", tr: "Erken kalp krizi (<55 yaş)" },
  "onb.familyDiabetes": { en: "Diabetes", tr: "Diyabet" },
  "onb.familyThyroid": { en: "Thyroid disease", tr: "Tiroid Hastalıkları" },
  "onb.familyCancer": { en: "Familial cancer (Breast/Colon/Prostate)", tr: "Ailevi Kanser (Meme/Kolon/Prostat)" },
  "onb.familyAlzheimer": { en: "Alzheimer / Early dementia", tr: "Alzheimer / Erken Demans" },
  "onb.familyPsychiatric": { en: "Major psychiatric (Bipolar/Schizophrenia)", tr: "Majör Psikiyatrik (Bipolar/Şizofreni)" },
  "onb.familyWhyNote": { en: "Your family history helps our AI calculate cardiovascular risk scores and warn you proactively about future health risks.", tr: "Aile geçmişin, yapay zekamızın kardiyovasküler risk skorlarını hesaplaması ve gelecekteki sağlık risklerine karşı seni erken uyarabilmesi için kullanılır." },
  "onb.whyFamilyHistory": { en: "Family history enables proactive risk screening for hereditary conditions.", tr: "Soygeçmiş bilgisi kalıtsal hastalıklar için proaktif risk taraması sağlar." },
  "onb.phaseBasics": { en: "Basics", tr: "Temel Bilgiler" },
  "onb.phaseHealth": { en: "Health Profile", tr: "Sağlık Profili" },
  "onb.phaseConsent": { en: "Confirmation", tr: "Onay" },
  "onb.whyBasic": { en: "Your age and biological sex help us tailor recommendations safely.", tr: "Yaşın ve biyolojik cinsiyetin güvenli öneriler sunmamı sağlar." },
  "onb.whyMeds": { en: "Knowing your medications helps us detect herb-drug interactions.", tr: "İlaçlarını bilmemiz bitki-ilaç etkileşimlerini tespit etmemizi sağlar." },
  "onb.whyAllergies": { en: "Herbal products may cross-react with known allergens — we filter accordingly.", tr: "Bitkisel ürünler bilinen alerjenlerle çapraz reaksiyon verebilir — önerilerimizi buna göre filtreliyoruz." },
  "onb.whyPregnancy": { en: "Many herbs are unsafe during pregnancy and breastfeeding — this activates extra safety filters.", tr: "Birçok bitki gebelik ve emzirmede güvenli değildir — bu bilgi ek güvenlik filtreleri etkinleştirir." },
  "onb.whySubstances": { en: "Alcohol and smoking affect how herbs and medications are metabolized.", tr: "Alkol ve sigara bitkilerin ve ilaçların metabolizmasını etkiler." },
  "onb.whyMedHistory": { en: "Conditions like kidney or liver disease change how herbs are processed in your body.", tr: "Böbrek veya karaciğer hastalığı bitkilerin vücuttaki işlenişini değiştirir." },
  "onb.whyConsent": { en: "We need your informed consent before providing personalized health guidance.", tr: "Kişiselleştirilmiş sağlık rehberliği sunmadan önce bilgilendirilmiş onayın gereklidir." },
  "onb.whyPermissions": { en: "We'll only ask for permissions when you need them — no surprises.", tr: "İzinleri sadece ihtiyaç duyduğunuzda isteyeceğiz — sürpriz yok." },
  "onb.permSubtitle": { en: "Some features will need your permission. We'll ask at the right moment, not now.", tr: "Bazı özellikler için iznine ihtiyaç duyacağız. Şimdi değil, doğru zamanda soracağız." },
  "onb.permNotifTitle": { en: "Medication Reminders", tr: "İlaç Hatırlatıcıları" },
  "onb.permNotifDesc": { en: "Never miss your medication times and appointments.", tr: "İlaç saatlerini ve randevularını kaçırma." },
  "onb.permNotifWhen": { en: "Asked when first medication is saved", tr: "İlk ilaç kaydedildiğinde sorulur" },
  "onb.permLocationTitle": { en: "Nearby Health", tr: "Yakınımdaki Sağlık" },
  "onb.permLocationDesc": { en: "Find the nearest pharmacies and clinics.", tr: "Sana en yakın eczane ve klinikleri bulalım." },
  "onb.permLocationWhen": { en: "Asked when 'Nearby' feature is opened", tr: "'Yakınımda' özelliği açıldığında sorulur" },
  "onb.permCameraTitle": { en: "Image Analysis", tr: "Görüntü Analizi" },
  "onb.permCameraDesc": { en: "Upload radiology and lab results.", tr: "Radyoloji ve lab sonuçlarını yükle." },
  "onb.permCameraWhen": { en: "Asked on first upload attempt", tr: "İlk yükleme denemesinde sorulur" },
  "onb.permNote": { en: "No permissions are requested during setup. You're always in control.", tr: "Kurulum sırasında izin istenmez. Kontrol her zaman sende." },

  // Badge Celebration
  "badge.earned": { en: "Badge Earned!", tr: "Rozet Kazandın!" },
  "badge.points": { en: "points", tr: "puan" },
  "badge.total": { en: "Total", tr: "Toplam" },
  "badge.awesome": { en: "Awesome!", tr: "Harika!" },
  "badge.finaleTitle": { en: "You're Ready!", tr: "Hazırsın!" },
  "badge.finaleSubtitle": { en: "Welcome to the DoctoPal family", tr: "DoctoPal ailesine katıldın" },
  "badge.finalePoints": { en: "Points earned during setup", tr: "Kurulum sırasında kazanılan puan" },
  "badge.finaleBadges": { en: "Badges earned", tr: "Kazanılan rozetler" },
  "badge.exploreCta": { en: "Explore DoctoPal", tr: "DoctoPal'ı Keşfet" },

  // Permission Bottom Sheet
  "perm.notifTitle": { en: "Never miss a dose?", tr: "İlaç saatinizi hatırlatalım mı?" },
  "perm.notifDesc": { en: "We need notification permission so you never miss a medication time.", tr: "Hiçbir dozu kaçırmamak için bildirim iznine ihtiyacımız var." },
  "perm.notifAllow": { en: "Allow Notifications", tr: "Bildirimlere İzin Ver" },
  "perm.notifDismiss": { en: "Not now", tr: "Şimdi Değil" },
  "perm.locationTitle": { en: "Can we use your location?", tr: "Konumunuzu kullanabilir miyiz?" },
  "perm.locationDesc": { en: "We need location access to find the nearest pharmacies and clinics for you.", tr: "Size en yakın eczane ve klinikleri listeleyebilmek için konum iznine ihtiyacımız var." },
  "perm.locationAllow": { en: "Share Location", tr: "Konumu Paylaş" },
  "perm.locationManual": { en: "Search manually", tr: "Manuel Ara" },
  "perm.cameraTitle": { en: "Want to take a photo?", tr: "Fotoğraf çekmek ister misiniz?" },
  "perm.cameraDesc": { en: "You can use your camera or upload from gallery for image analysis.", tr: "Görüntü analizi için kamera veya galerinizden yükleme yapabilirsiniz." },
  "perm.cameraAllow": { en: "Allow Camera", tr: "Kameraya İzin Ver" },
  "perm.cameraGallery": { en: "Choose from gallery", tr: "Galeriden Seç" },
  "perm.iosPwaTitle": { en: "Add to Home Screen", tr: "Ana Ekrana Ekleyin" },
  "perm.iosPwaDesc": { en: "To receive notifications, add DoctoPal to your home screen first.", tr: "Bildirim almak için DoctoPal'ı önce ana ekranınıza ekleyin." },
  "perm.iosPwaGotIt": { en: "Got it", tr: "Anladım" },

  // ══════════════════════════════════════════
  // Calorie Calculator — extra keys
  // ══════════════════════════════════════════
  "calorie.bmiUnderweight": { en: "Underweight", tr: "Zayıf" },
  "calorie.bmiNormal": { en: "Normal", tr: "Normal" },
  "calorie.bmiOverweight": { en: "Overweight", tr: "Fazla Kilolu" },
  "calorie.bmiObese": { en: "Obese", tr: "Obez" },
  "calorie.hideAdvanced": { en: "Hide advanced measurements", tr: "Gelişmiş ölçümleri gizle" },
  "calorie.calcBodyFat": { en: "Calculate body fat %", tr: "Vücut yağ oranı hesapla" },
  "calorie.usNavy": { en: "US Navy Method — Body Fat %", tr: "US Navy Metodu — Vücut Yağ Oranı" },
  "calorie.waist": { en: "Waist (cm)", tr: "Bel (cm)" },
  "calorie.neck": { en: "Neck (cm)", tr: "Boyun (cm)" },
  "calorie.hip": { en: "Hip (cm)", tr: "Kalça (cm)" },
  "calorie.estBodyFat": { en: "Estimated Body Fat", tr: "Tahmini Vücut Yağ Oranı" },
  "calorie.weightTrend": { en: "Weight Trend", tr: "Kilo Trendi" },

  // ══════════════════════════════════════════
  // Scanner — extra keys
  // ══════════════════════════════════════════
  "scan.capture": { en: "Capture", tr: "Çek" },
  "scan.analysisFailed": { en: "Analysis failed", tr: "Analiz başarısız" },
  "scan.connectionError": { en: "Connection error", tr: "Bağlantı hatası" },
  "scan.brand": { en: "Brand", tr: "Marka" },
  "scan.active": { en: "Active", tr: "Etken Madde" },
  "scan.dosage": { en: "Dosage", tr: "Doz" },
  "scan.form": { en: "Form", tr: "Form" },
  "scan.addedToProfile": { en: "Added to profile!", tr: "Profiline eklendi!" },
  "scan.addToMeds": { en: "Add to my medications", tr: "İlaç profilime ekle" },
  "scan.tryAgain": { en: "Try again", tr: "Tekrar dene" },
  "scan.alignBarcode": { en: "Align barcode within frame", tr: "Barkodu çerçeveye hizalayın" },
  "scan.cancel": { en: "Cancel", tr: "İptal" },
  "scan.lookingUp": { en: "Looking up product...", tr: "Ürün aranıyor..." },
  "scan.found": { en: "Found", tr: "Bulundu" },
  "scan.addedSupplement": { en: "Added!", tr: "Eklendi!" },
  "scan.addToSupplements": { en: "Add to supplements", tr: "Takviyelerime ekle" },
  "scan.notFound": { en: "Product not found", tr: "Ürün bulunamadı" },
  "scan.scanAgain": { en: "Scan again", tr: "Tekrar tara" },

  // ══════════════════════════════════════════
  // Share Cards — extra keys
  // ══════════════════════════════════════════
  "share.bloodTest.title": { en: "My Blood Test Results", tr: "Kan Tahlili Sonuçlarım" },
  "share.bloodTest.summary": { en: "Blood Test Summary", tr: "Kan Tahlili Özeti" },
  "share.bloodTest.total": { en: "Total", tr: "Toplam" },
  "share.bloodTest.optimal": { en: "Optimal", tr: "Optimal" },
  "share.bloodTest.abnormal": { en: "Abnormal", tr: "Anormal" },
  "share.bloodTest.keyFindings": { en: "Key Findings", tr: "Öne Çıkanlar" },
  "share.interaction.medsChecked": { en: "Medications Checked", tr: "Kontrol Edilen İlaçlar" },
  "share.interaction.dangerous": { en: "Dangerous", tr: "Tehlikeli" },
  "share.interaction.caution": { en: "Caution", tr: "Dikkatli" },
  "share.interaction.safe": { en: "Safe", tr: "Güvenli" },
  "share.interaction.criticalFinding": { en: "Critical Finding", tr: "Kritik Tespit" },
  "share.weekly.great": { en: "Great week!", tr: "Harika hafta!" },
  "share.weekly.keepGoing": { en: "Keep going!", tr: "İyi gidiyorsun!" },
  "share.weekly.roomToGrow": { en: "Room to grow!", tr: "Gelişmeye devam!" },
  "share.protocol.complete": { en: "Complete!", tr: "Tamamlandı!" },
  "share.protocol.days": { en: "days", tr: "gün" },
  "share.protocol.motivational": { en: "Discipline and consistency — the foundation of your health journey.", tr: "Disiplin ve tutarlılık — sağlık yolculuğunun temeli." },
  "share.bioage.younger": { en: "Younger", tr: "Gençleştiriyor" },
  "share.bioage.older": { en: "Older", tr: "Yaşlandırıyor" },

  // ══════════════════════════════════════════
  // Seasonal — extra keys
  // ══════════════════════════════════════════
  "seasonal.prep": { en: "Prep", tr: "Hazırlık" },
  "seasonal.tips": { en: "Season-specific health tips", tr: "Mevsime özel sağlık önerileri" },
  "seasonal.interactionWarn": { en: "May interact with your medications — consult your doctor", tr: "İlaçlarınızla etkileşebilir — doktorunuza danışın" },
  "seasonal.prepGuide": { en: "Prep Guide", tr: "Hazırlık" },
  "seasonal.recommendations": { en: "Season-specific health recommendations", tr: "Mevsime özel sağlık önerileri" },

  // ══════════════════════════════════════════
  // MonthView — extra keys
  // ══════════════════════════════════════════
  "cal.thisWeekLabel": { en: "This Week", tr: "Bu Hafta" },
  "cal.medsComplete": { en: "days meds complete", tr: "gün ilaç tamam" },
  "cal.waterComplete": { en: "days water complete", tr: "gün su tamam" },

  // ══════════════════════════════════════════
  // Operations — extra
  // ══════════════════════════════════════════
  "operations.dBefore": { en: "d before", tr: "gün önce" },

  // ══════════════════════════════════════════
  // Affiliate
  // ══════════════════════════════════════════
  "affiliate.whereToBuy": { en: "Where to buy?", tr: "Nereden alınır?" },

  // ══════════════════════════════════════════
  // TodayView — extra keys
  // ══════════════════════════════════════════
  "cal.allDoneToday": { en: "Amazing day! All tasks done.", tr: "Bugün harikasın! Tüm görevler tamam." },
  "cal.daysStreak": { en: "days", tr: "gün" },
  "cal.doseExample": { en: "e.g. 500mg", tr: "ör: 500mg" },

  // ══════════════════════════════════════════
  // BossFight — extra keys
  // ══════════════════════════════════════════
  "boss.days": { en: "days", tr: "gün" },
  "boss.tasks": { en: "tasks", tr: "görev" },

  // ══════════════════════════════════════════
  // Medical Analysis (combined page)
  // ══════════════════════════════════════════
  "nav.medicalAnalysis": { en: "Medical Analysis", tr: "Tıbbi Analiz" },
  "nav.bodyAnalysis": { en: "Body & Nutrition", tr: "Vücut & Beslenme" },
  "medAnalysis.title": { en: "Medical Analysis", tr: "Tıbbi Analiz" },
  "medAnalysis.subtitle": { en: "Blood test analysis and radiology image interpretation", tr: "Kan tahlili analizi ve radyoloji görüntü yorumlama" },
  "bodyAnalysis.title": { en: "Body & Nutrition", tr: "Vücut & Beslenme" },
  "bodyAnalysis.subtitle": { en: "BMI, body fat, calorie needs and weight tracking", tr: "BMI, vücut yağı, kalori ihtiyacı ve kilo takibi" },

  // Symptom Checker
  // ══════════════════════════════════════════
  "nav.symptomChecker": { en: "Symptom Checker", tr: "Semptom Kontrolü" },
  "symptom.title": { en: "Smart Symptom Assessment", tr: "Akıllı Semptom Değerlendirmesi" },
  "symptom.subtitle": { en: "Answer a few quick questions. Our AI adapts to your answers — like talking to a real doctor.", tr: "Birkaç hızlı soruyu yanıtlayın. AI cevaplarınıza göre uyarlanır — gerçek bir doktorla konuşmak gibi." },
  "symptom.disclaimer": { en: "This tool does not diagnose. It helps you understand symptoms and decide on urgency. Always consult a doctor for medical concerns.", tr: "Bu araç teşhis koymaz. Semptomlarınızı anlamanıza ve aciliyeti değerlendirmenize yardımcı olur. Tıbbi endişeleriniz için her zaman doktorunuza danışın." },
  "symptom.commonSymptoms": { en: "Common symptoms:", tr: "Yaygın semptomlar:" },
  "symptom.describeLabel": { en: "Describe your symptoms", tr: "Semptomlarınızı açıklayın" },
  "symptom.placeholder": { en: "E.g., I've had a headache for 3 days, mostly in the morning, with mild nausea...", tr: "Örn: 3 gündür baş ağrım var, genellikle sabahları, hafif bulantı ile birlikte..." },
  "symptom.analyzing": { en: "Analyzing symptoms...", tr: "Semptomlar analiz ediliyor..." },
  "symptom.analyzeBtn": { en: "Check Symptoms", tr: "Semptomları Kontrol Et" },
  "symptom.triageDoctor": { en: "See a Doctor", tr: "Doktora Gidin" },
  "symptom.triageHome": { en: "Monitor at Home", tr: "Evde Takip Edin" },
  "symptom.urgency": { en: "Urgency", tr: "Aciliyet" },
  "symptom.possibleCauses": { en: "Possible Causes", tr: "Olası Nedenler" },
  "symptom.recommendations": { en: "Recommendations", tr: "Öneriler" },
  "symptom.whenToSeeDoctor": { en: "When to see a doctor", tr: "Doktora ne zaman gitmeli" },
  "symptom.selfCare": { en: "Self-care tips", tr: "Evde bakım önerileri" },
  "symptom.medicationNote": { en: "Medication Note", tr: "İlaç Notu" },
  "symptom.sources": { en: "Sources", tr: "Kaynaklar" },
  "symptom.newCheck": { en: "New Symptom Check", tr: "Yeni Semptom Kontrolü" },

  // Food-Drug Interaction
  // ══════════════════════════════════════════
  "nav.foodInteraction": { en: "Food Interactions", tr: "Besin Etkileşimleri" },
  "foodInt.title": { en: "Food-Drug Interactions", tr: "Besin-İlaç Etkileşimleri" },
  "foodInt.subtitle": { en: "Check if your foods interact with your medications", tr: "Besinlerinizin ilaçlarınızla etkileşimini kontrol edin" },
  "foodInt.commonFoods": { en: "Common foods to check:", tr: "Kontrol edilecek yaygın besinler:" },
  "foodInt.addPlaceholder": { en: "Add a food or beverage...", tr: "Besin veya içecek ekleyin..." },
  "foodInt.add": { en: "Add", tr: "Ekle" },
  "foodInt.loginNote": { en: "Sign in to automatically check against your medication profile.", tr: "İlaç profilinizle otomatik kontrol için giriş yapın." },
  "foodInt.analyzing": { en: "Checking interactions...", tr: "Etkileşimler kontrol ediliyor..." },
  "foodInt.checkBtn": { en: "Check Interactions", tr: "Etkileşimleri Kontrol Et" },
  "foodInt.results": { en: "Results", tr: "Sonuçlar" },
  "foodInt.mechanism": { en: "Mechanism", tr: "Mekanizma" },
  "foodInt.recommendation": { en: "Recommendation", tr: "Öneri" },
  "foodInt.timing": { en: "Timing", tr: "Zamanlama" },

  // Supplement Comparison
  // ══════════════════════════════════════════
  "nav.supCompare": { en: "Compare Supplements", tr: "Takviye Karşılaştır" },
  "supCompare.title": { en: "Supplement Comparison", tr: "Takviye Karşılaştırma" },
  "supCompare.subtitle": { en: "Compare two supplements side by side with evidence-based analysis", tr: "İki takviyeyi kanıta dayalı analiz ile yan yana karşılaştırın" },
  "supCompare.placeholder1": { en: "First supplement...", tr: "İlk takviye..." },
  "supCompare.placeholder2": { en: "Second supplement...", tr: "İkinci takviye..." },
  "supCompare.popularPairs": { en: "Popular comparisons:", tr: "Popüler karşılaştırmalar:" },
  "supCompare.comparing": { en: "Comparing...", tr: "Karşılaştırılıyor..." },
  "supCompare.compareBtn": { en: "Compare", tr: "Karşılaştır" },
  "supCompare.results": { en: "Comparison Results", tr: "Karşılaştırma Sonuçları" },
  "supCompare.grade": { en: "Grade", tr: "Kanıt" },
  "supCompare.benefits": { en: "Benefits", tr: "Faydaları" },
  "supCompare.dosage": { en: "Dosage", tr: "Dozaj" },
  "supCompare.absorption": { en: "Absorption", tr: "Emilim" },
  "supCompare.sideEffects": { en: "Side Effects", tr: "Yan Etkiler" },
  "supCompare.cost": { en: "Cost", tr: "Maliyet" },
  "supCompare.bestFor": { en: "Best for", tr: "En uygun" },
  "supCompare.verdict": { en: "Verdict", tr: "Sonuç" },
  "supCompare.keyDiff": { en: "Key differences:", tr: "Temel farklar:" },
  "supCompare.canCombine": { en: "Can combine", tr: "Birlikte kullanılabilir" },
  "supCompare.personalRec": { en: "Personalized Recommendation", tr: "Kişisel Öneri" },

  // Interaction Map
  // ══════════════════════════════════════════
  "nav.intMap": { en: "Interaction Map", tr: "Etkileşim Haritası" },
  "intMap.title": { en: "Drug Interaction Map", tr: "İlaç Etkileşim Haritası" },
  "intMap.subtitle": { en: "Visual network graph of your medication interactions", tr: "İlaçlarınızın etkileşim ağ grafiği" },
  "intMap.loginRequired": { en: "Sign in to generate your personalized interaction map from your medication profile.", tr: "İlaç profilinizden kişisel etkileşim haritası oluşturmak için giriş yapın." },
  "intMap.description": { en: "Generate a visual map showing how all your medications interact with each other.", tr: "Tüm ilaçlarınızın birbiriyle nasıl etkileştiğini gösteren görsel bir harita oluşturun." },
  "intMap.generating": { en: "Generating map...", tr: "Harita oluşturuluyor..." },
  "intMap.generateBtn": { en: "Generate Interaction Map", tr: "Etkileşim Haritası Oluştur" },
  "intMap.safe": { en: "Safe", tr: "Güvenli" },
  "intMap.caution": { en: "Caution", tr: "Dikkat" },
  "intMap.dangerous": { en: "Dangerous", tr: "Tehlikeli" },
  "intMap.allInteractions": { en: "All Interactions", tr: "Tüm Etkileşimler" },
  "intMap.regenerate": { en: "Regenerate Map", tr: "Haritayı Yeniden Oluştur" },

  // Health Goals
  // ══════════════════════════════════════════
  "nav.healthGoals": { en: "Health Coach", tr: "Sağlık Koçu" },
  "goals.title": { en: "Health Goal Coach", tr: "Sağlık Hedefi Koçu" },
  "goals.subtitle": { en: "Set a goal, get a personalized weekly action plan", tr: "Hedef belirleyin, kişisel haftalık aksiyon planı alın" },
  "goals.popularGoals": { en: "Popular goals:", tr: "Popüler hedefler:" },
  "goals.describeGoal": { en: "Describe your health goal", tr: "Sağlık hedefinizi açıklayın" },
  "goals.placeholder": { en: "E.g., I want to lower my cholesterol without medication...", tr: "Örn: İlaç kullanmadan kolesterolümü düşürmek istiyorum..." },
  "goals.timeframe": { en: "Timeframe", tr: "Süre" },
  "goals.generating": { en: "Creating your plan...", tr: "Planınız oluşturuluyor..." },
  "goals.generateBtn": { en: "Create My Plan", tr: "Planımı Oluştur" },
  "goals.milestones": { en: "Milestones", tr: "Hedef Noktaları" },
  "goals.week": { en: "Week", tr: "Hafta" },
  "goals.nutrition": { en: "Nutrition", tr: "Beslenme" },
  "goals.exercise": { en: "Exercise", tr: "Egzersiz" },
  "goals.supplements": { en: "Supplements", tr: "Takviyeler" },
  "goals.lifestyle": { en: "Lifestyle", tr: "Yaşam Tarzı" },
  "goals.tracking": { en: "Track Daily", tr: "Günlük Takip" },
  "goals.warnings": { en: "Warnings", tr: "Uyarılar" },
  "goals.newGoal": { en: "Set a New Goal", tr: "Yeni Hedef Belirle" },

  // Prospectus Reader
  // ══════════════════════════════════════════
  "nav.prospectus": { en: "Prospectus Reader", tr: "Prospektüs Okuyucu" },
  "prospectus.title": { en: "Prospectus Reader", tr: "Prospektüs Okuyucu" },
  "prospectus.subtitle": { en: "Photograph a medication leaflet and get a plain-language summary", tr: "İlaç prospektüsünü fotoğraflayın, halk dilinde özet alın" },
  "prospectus.upload": { en: "Upload Prospectus Photo", tr: "Prospektüs Fotoğrafı Yükle" },
  "prospectus.uploadDesc": { en: "Take a photo of the medication box, leaflet, or prospectus (JPEG, PNG, PDF)", tr: "İlaç kutusu, kullanma kılavuzu veya prospektüs fotoğrafı çekin (JPEG, PNG, PDF)" },
  "prospectus.chooseFile": { en: "Choose Photo or PDF", tr: "Fotoğraf veya PDF Seç" },
  "prospectus.reading": { en: "Reading prospectus...", tr: "Prospektüs okunuyor..." },
  "prospectus.readBtn": { en: "Read Prospectus", tr: "Prospektüsü Oku" },
  "prospectus.scanNew": { en: "Scan Another", tr: "Başka Bir Tane Tara" },
  "prospectus.profileAlerts": { en: "Profile Alerts", tr: "Profil Uyarıları" },
  "prospectus.summary": { en: "Quick Summary", tr: "Kısa Özet" },
  "prospectus.activeIngredient": { en: "Active Ingredient", tr: "Etken Madde" },
  "prospectus.category": { en: "Category", tr: "Kategori" },
  "prospectus.whatItDoes": { en: "What It Does", tr: "Ne İşe Yarar" },
  "prospectus.dosage": { en: "Dosage", tr: "Dozaj" },
  "prospectus.sideEffects": { en: "Side Effects", tr: "Yan Etkiler" },
  "prospectus.commonSE": { en: "COMMON", tr: "YAYGIN" },
  "prospectus.seriousSE": { en: "SERIOUS — See a doctor", tr: "CİDDİ — Doktora gidin" },
  "prospectus.rareSE": { en: "RARE", tr: "NADİR" },
  "prospectus.interactions": { en: "Drug Interactions", tr: "İlaç Etkileşimleri" },
  "prospectus.warnings": { en: "Warnings", tr: "Uyarılar" },
  "prospectus.contraindications": { en: "Do NOT Use If", tr: "Kullanmayın Eğer" },
  "prospectus.storage": { en: "Storage", tr: "Saklama Koşulları" },

  // Sleep Analysis
  // ══════════════════════════════════════════
  "nav.sleepAnalysis": { en: "Sleep Analysis", tr: "Uyku Analizi" },
  "sleep.title": { en: "Sleep Analysis", tr: "Uyku Analizi" },
  "sleep.subtitle": { en: "Track your sleep and get AI-powered insights", tr: "Uykunuzu takip edin, AI destekli analizler alın" },
  "sleep.logSleep": { en: "Log Sleep", tr: "Uyku Kaydet" },
  "sleep.bedtime": { en: "Bedtime", tr: "Yatış Saati" },
  "sleep.wakeTime": { en: "Wake Time", tr: "Kalkış Saati" },
  "sleep.quality": { en: "Sleep Quality", tr: "Uyku Kalitesi" },
  "sleep.wakeCount": { en: "Night Wakings", tr: "Gece Uyanma" },
  "sleep.dreams": { en: "Dreams", tr: "Rüya" },
  "sleep.factors": { en: "Factors", tr: "Etkenler" },
  "sleep.caffeine": { en: "Caffeine", tr: "Kafein" },
  "sleep.screenTime": { en: "Screen Time", tr: "Ekran" },
  "sleep.exercise": { en: "Exercise", tr: "Egzersiz" },
  "sleep.stress": { en: "Stress", tr: "Stres" },
  "sleep.alcohol": { en: "Alcohol", tr: "Alkol" },
  "sleep.heavyMeal": { en: "Heavy Meal", tr: "Ağır Yemek" },
  "sleep.medChange": { en: "Med Change", tr: "İlaç Değişikliği" },
  "sleep.hygieneScore": { en: "Sleep Hygiene Score", tr: "Uyku Hijyen Skoru" },
  "sleep.chronotype": { en: "Chronotype", tr: "Kronotip" },
  "sleep.earlyBird": { en: "Early Bird", tr: "Erken Kuş" },
  "sleep.nightOwl": { en: "Night Owl", tr: "Gece Kuşu" },
  "sleep.intermediate": { en: "Intermediate", tr: "Orta" },
  "sleep.weeklyChart": { en: "Weekly Overview", tr: "Haftalık Özet" },
  "sleep.analyze": { en: "AI Analysis", tr: "AI Analiz" },
  "sleep.analyzing": { en: "Analyzing...", tr: "Analiz ediliyor..." },
  "sleep.needMore": { en: "Need at least 7 days of data for AI analysis", tr: "AI analiz için en az 7 günlük veri gerekli" },
  "sleep.saved": { en: "Sleep record saved!", tr: "Uyku kaydı kaydedildi!" },
  "sleep.recentLogs": { en: "Recent Logs", tr: "Son Kayıtlar" },
  "sleep.hours": { en: "hours", tr: "saat" },
  "sleep.loginRequired": { en: "Sign in to track your sleep", tr: "Uyku takibi için giriş yapın" },

  // Radiology Analysis
  // ══════════════════════════════════════════
  "nav.radiology": { en: "Radiology", tr: "Radyoloji" },
  "rad.title": { en: "Radiology Analysis", tr: "Radyoloji Analizi" },
  "rad.subtitle": { en: "Upload your radiology image or report for a plain-language explanation of findings", tr: "Radyoloji görüntünüzü veya raporunuzu yükleyin — bulgular halk dilinde açıklansın" },
  "rad.guestMode": { en: "Guest mode:", tr: "Misafir modu:" },
  "rad.guestText": { en: "Sign in to save your analyses and get personalized interpretations.", tr: "Analizlerinizi kaydetmek ve kişisel yorumlar almak için giriş yapın." },
  "rad.upload": { en: "Upload Image or Report", tr: "Görüntü veya Rapor Yükle" },
  "rad.uploadDesc": { en: "Supports X-ray, CT, MRI, ultrasound images and radiology reports (PDF)", tr: "Röntgen, BT, MR, ultrason görüntüleri ve radyoloji raporları (PDF) desteklenir" },
  "rad.chooseFile": { en: "Choose Image or PDF", tr: "Görüntü veya PDF Seç" },
  "rad.analyzing": { en: "Analyzing image...", tr: "Görüntü analiz ediliyor..." },
  "rad.analyze": { en: "Analyze", tr: "Analiz Et" },
  "rad.yourResults": { en: "Your Analysis Results", tr: "Analiz Sonuçlarınız" },
  "rad.runNew": { en: "New Analysis", tr: "Yeni Analiz" },
  "rad.imageType": { en: "Image Type", tr: "Görüntü Tipi" },
  "rad.xray": { en: "X-Ray", tr: "Röntgen" },
  "rad.ct": { en: "CT Scan", tr: "BT Tarama" },
  "rad.mri": { en: "MRI", tr: "MR" },
  "rad.ultrasound": { en: "Ultrasound", tr: "Ultrason" },
  "rad.report": { en: "Report (PDF)", tr: "Rapor (PDF)" },
  "rad.urgencyNormal": { en: "No Urgent Findings", tr: "Acil Bulgu Yok" },
  "rad.urgencyAttention": { en: "Needs Attention", tr: "Dikkat Gerekli" },
  "rad.urgencyUrgent": { en: "Urgent — See Your Doctor", tr: "Acil — Doktora Başvurun" },
  "rad.tabFindings": { en: "Findings", tr: "Bulgular" },
  "rad.tabGlossary": { en: "Medical Glossary", tr: "Tıbbi Sözlük" },
  "rad.tabDoctor": { en: "For Your Doctor", tr: "Doktorunuz İçin" },
  "rad.summary": { en: "Summary", tr: "Özet" },
  "rad.region": { en: "Region", tr: "Bölge" },
  "rad.observation": { en: "Observation", tr: "Gözlem" },
  "rad.medicalTerm": { en: "Medical Term", tr: "Tıbbi Terim" },
  "rad.limitations": { en: "Limitations", tr: "Kısıtlamalar" },
  "rad.limitationsDesc": { en: "What cannot be determined from this image alone", tr: "Bu görüntüden tek başına belirlenemeyen şeyler" },
  "rad.downloadPdf": { en: "Download Doctor Report", tr: "Doktor Raporu İndir" },
  "rad.findings": { en: "findings", tr: "bulgu" },
  "rad.noFindings": { en: "No significant findings detected.", tr: "Önemli bir bulgu tespit edilmedi." },
  "rad.disclaimer": { en: "This analysis is for educational purposes only. It is NOT a radiological diagnosis. A qualified radiologist must interpret all medical images. Always consult your healthcare provider.", tr: "Bu analiz yalnızca eğitim amaçlıdır. Radyolojik tanı DEĞİLDİR. Tüm tıbbi görüntüler nitelikli bir radyolog tarafından yorumlanmalıdır. Her zaman sağlık profesyonelinize danışın." },
  "rad.error": { en: "Analysis failed. Please try again.", tr: "Analiz başarısız. Lütfen tekrar deneyin." },

  // ── Mental Wellness ──
  "nav.mentalWellness": { en: "Mental Wellness", tr: "Mental Sağlık" },
  "mw.title": { en: "Mental Wellness", tr: "Mental Sağlık" },
  "mw.subtitle": { en: "Track your mood, stress & mental health patterns", tr: "Ruh hali, stres ve mental sağlık örüntülerinizi takip edin" },
  "mw.dailyCheckIn": { en: "Daily Check-in", tr: "Günlük Kayıt" },
  "mw.mood": { en: "Mood", tr: "Ruh Hali" },
  "mw.energy": { en: "Energy", tr: "Enerji" },
  "mw.stress": { en: "Stress", tr: "Stres" },
  "mw.anxiety": { en: "Anxiety", tr: "Kaygı" },
  "mw.focus": { en: "Focus", tr: "Odaklanma" },
  "mw.triggers": { en: "Triggers", tr: "Tetikleyiciler" },
  "mw.work": { en: "Work", tr: "İş" },
  "mw.relationship": { en: "Relationships", tr: "İlişkiler" },
  "mw.health": { en: "Health", tr: "Sağlık" },
  "mw.financial": { en: "Financial", tr: "Finansal" },
  "mw.family": { en: "Family", tr: "Aile" },
  "mw.sleepTrigger": { en: "Sleep", tr: "Uyku" },
  "mw.social": { en: "Social", tr: "Sosyal" },
  "mw.weather": { en: "Weather", tr: "Hava" },
  "mw.coping": { en: "Coping Methods", tr: "Baş Etme Yöntemleri" },
  "mw.exerciseCoping": { en: "Exercise", tr: "Egzersiz" },
  "mw.meditation": { en: "Meditation", tr: "Meditasyon" },
  "mw.socializing": { en: "Socializing", tr: "Sosyalleşme" },
  "mw.nature": { en: "Nature", tr: "Doğa" },
  "mw.music": { en: "Music", tr: "Müzik" },
  "mw.journaling": { en: "Journaling", tr: "Günlük" },
  "mw.breathing": { en: "Breathing", tr: "Nefes" },
  "mw.therapy": { en: "Therapy", tr: "Terapi" },
  "mw.weekOverview": { en: "This Week", tr: "Bu Hafta" },
  "mw.analyze": { en: "AI Wellness Analysis", tr: "AI Wellness Analizi" },
  "mw.analyzing": { en: "Analyzing patterns...", tr: "Örüntüler analiz ediliyor..." },
  "mw.saved": { en: "Check-in saved!", tr: "Kayıt kaydedildi!" },
  "mw.needMore": { en: "Need at least 7 days of data for AI analysis", tr: "AI analiz için en az 7 günlük veri gerekli" },
  "mw.professionalHelp": { en: "We recommend speaking with a mental health professional", tr: "Bir ruh sağlığı uzmanıyla görüşmenizi öneriyoruz" },
  "mw.crisisLine": { en: "Crisis line: 182 (TR) / 988 (US)", tr: "Kriz hattı: 182" },
  "mw.loginRequired": { en: "Sign in to track your mental wellness", tr: "Mental sağlık takibi için giriş yapın" },

  // ══════════════════════════════════════════
  // Travel Health
  // ══════════════════════════════════════════
  "nav.travelHealth": { en: "Travel Health", tr: "Seyahat Sağlığı" },
  "travel.title": { en: "Travel Health Advisor", tr: "Seyahat Sağlık Danışmanı" },
  "travel.subtitle": { en: "Health prep for your destination", tr: "Gideceğiniz yer için sağlık hazırlığı" },
  "travel.destination": { en: "Destination Country", tr: "Hedef Ülke" },
  "travel.destinationPlaceholder": { en: "e.g., Thailand, Brazil, Kenya...", tr: "ör. Tayland, Brezilya, Kenya..." },
  "travel.dates": { en: "Travel Dates", tr: "Seyahat Tarihleri" },
  "travel.startDate": { en: "Departure", tr: "Gidiş" },
  "travel.endDate": { en: "Return", tr: "Dönüş" },
  "travel.generate": { en: "Get Health Advice", tr: "Sağlık Önerisi Al" },
  "travel.generating": { en: "Preparing advice...", tr: "Öneriler hazırlanıyor..." },
  "travel.vaccinations": { en: "Vaccinations", tr: "Aşılar" },
  "travel.required": { en: "Required", tr: "Zorunlu" },
  "travel.recommended": { en: "Recommended", tr: "Önerilen" },
  "travel.medicationPlan": { en: "Medication Plan", tr: "İlaç Planı" },
  "travel.risks": { en: "Regional Risks", tr: "Bölgesel Riskler" },
  "travel.pharmacy": { en: "Travel Pharmacy", tr: "Seyahat Eczanesi" },
  "travel.jetLag": { en: "Jet Lag Plan", tr: "Jet Lag Planı" },
  "travel.emergency": { en: "Emergency Numbers", tr: "Acil Numaralar" },
  "travel.loginRequired": { en: "Sign in for personalized advice", tr: "Kişisel öneri için giriş yapın" },
  "travel.noDestination": { en: "Please enter a destination", tr: "Lütfen bir hedef ülke girin" },
  "travel.noDates": { en: "Please select travel dates", tr: "Lütfen seyahat tarihlerini seçin" },
  "travel.severity.high": { en: "High Risk", tr: "Yüksek Risk" },
  "travel.severity.moderate": { en: "Moderate Risk", tr: "Orta Risk" },
  "travel.severity.low": { en: "Low Risk", tr: "Düşük Risk" },
  "travel.newSearch": { en: "New Search", tr: "Yeni Arama" },

  // ══════════════════════════════════════════
  // Vaccination Tracker
  // ══════════════════════════════════════════
  "nav.vaccination": { en: "Vaccinations", tr: "Aşılar" },
  "vacc.title": { en: "Vaccination Tracker", tr: "Aşı Takipçisi" },
  "vacc.subtitle": { en: "Track your vaccinations and upcoming doses", tr: "Aşılarınızı ve yaklaşan dozlarınızı takip edin" },
  "vacc.addVaccine": { en: "Add Vaccination", tr: "Aşı Ekle" },
  "vacc.vaccineName": { en: "Vaccine Name", tr: "Aşı Adı" },
  "vacc.vaccineType": { en: "Type", tr: "Tür" },
  "vacc.doseNumber": { en: "Dose #", tr: "Doz No" },
  "vacc.dateAdmin": { en: "Date Given", tr: "Yapıldığı Tarih" },
  "vacc.nextDue": { en: "Next Due", tr: "Sonraki Tarih" },
  "vacc.provider": { en: "Provider", tr: "Kurum" },
  "vacc.notes": { en: "Notes", tr: "Notlar" },
  "vacc.myVaccines": { en: "My Vaccinations", tr: "Aşılarım" },
  "vacc.overdue": { en: "Overdue", tr: "Gecikmiş" },
  "vacc.dueSoon": { en: "Due Soon", tr: "Yaklaşan" },
  "vacc.current": { en: "Up to Date", tr: "Güncel" },
  "vacc.saved": { en: "Vaccination saved!", tr: "Aşı kaydedildi!" },
  "vacc.loginRequired": { en: "Sign in to track vaccinations", tr: "Aşı takibi için giriş yapın" },
  "vacc.noVaccines": { en: "No vaccinations recorded yet", tr: "Henüz aşı kaydı yok" },
  "vacc.recommendations": { en: "AI Recommendations", tr: "AI Önerileri" },
  "vacc.getRecommendations": { en: "Get Recommendations", tr: "Öneri Al" },
  "vacc.gettingRecommendations": { en: "Getting recommendations...", tr: "Öneriler alınıyor..." },
  "vacc.dose": { en: "Dose", tr: "Doz" },
  "vacc.delete": { en: "Delete", tr: "Sil" },
  "vacc.flu": { en: "Influenza (Flu)", tr: "İnfluenza (Grip)" },
  "vacc.covid": { en: "COVID-19", tr: "COVID-19" },
  "vacc.hepatitis_b": { en: "Hepatitis B", tr: "Hepatit B" },
  "vacc.tetanus": { en: "Tetanus", tr: "Tetanoz" },
  "vacc.hpv": { en: "HPV", tr: "HPV" },
  "vacc.pneumococcal": { en: "Pneumococcal", tr: "Pnömokok" },
  "vacc.zona": { en: "Shingles (Zona)", tr: "Zona" },
  "vacc.other": { en: "Other", tr: "Diğer" },

  // ══════════════════════════════════════════
  // Rehabilitation Tracker
  // ══════════════════════════════════════════
  "nav.rehabilitation": { en: "Rehabilitation", tr: "Rehabilitasyon" },
  "rehab.title": { en: "Rehabilitation Tracker", tr: "Rehabilitasyon Takipçisi" },
  "rehab.subtitle": { en: "Track your recovery progress", tr: "İyileşme sürecinizi takip edin" },
  "rehab.createProgram": { en: "Create Program", tr: "Program Oluştur" },
  "rehab.surgeryType": { en: "Surgery/Condition", tr: "Ameliyat/Durum" },
  "rehab.surgeryDate": { en: "Surgery Date", tr: "Ameliyat Tarihi" },
  "rehab.startDate": { en: "Start Date", tr: "Başlangıç Tarihi" },
  "rehab.targetDate": { en: "Target End Date", tr: "Hedef Bitiş" },
  "rehab.dailyLog": { en: "Daily Log", tr: "Günlük Kayıt" },
  "rehab.painLevel": { en: "Pain Level", tr: "Ağrı Seviyesi" },
  "rehab.mobility": { en: "Mobility", tr: "Hareket Kabiliyeti" },
  "rehab.swelling": { en: "Swelling", tr: "Şişlik" },
  "rehab.none": { en: "None", tr: "Yok" },
  "rehab.mildSwelling": { en: "Mild", tr: "Hafif" },
  "rehab.moderateSwelling": { en: "Moderate", tr: "Orta" },
  "rehab.severeSwelling": { en: "Severe", tr: "Şiddetli" },
  "rehab.phase": { en: "Recovery Phase", tr: "İyileşme Fazı" },
  "rehab.acute": { en: "Acute", tr: "Akut" },
  "rehab.subacute": { en: "Subacute", tr: "Subakut" },
  "rehab.recovery": { en: "Recovery", tr: "İyileşme" },
  "rehab.maintenance": { en: "Maintenance", tr: "Bakım" },
  "rehab.progress": { en: "Progress", tr: "İlerleme" },
  "rehab.saved": { en: "Log saved!", tr: "Kayıt kaydedildi!" },
  "rehab.programSaved": { en: "Program created!", tr: "Program oluşturuldu!" },
  "rehab.loginRequired": { en: "Sign in to track rehabilitation", tr: "Rehabilitasyon takibi için giriş yapın" },
  "rehab.noPrograms": { en: "No rehabilitation programs yet", tr: "Henüz rehabilitasyon programı yok" },
  "rehab.exercisesCompleted": { en: "Exercises Completed", tr: "Tamamlanan Egzersizler" },
  "rehab.exercisesCompletedPlaceholder": { en: "e.g., 10 squats, 5 min stretching", tr: "ör. 10 squat, 5 dk esneme" },
  "rehab.condition": { en: "Condition", tr: "Durum" },
  "rehab.myPrograms": { en: "My Programs", tr: "Programlarım" },
  "rehab.logEntry": { en: "Add Daily Log", tr: "Günlük Kayıt Ekle" },
  "rehab.day": { en: "Day", tr: "Gün" },

  // ══════════════════════════════════════════
  // Seasonal Health
  // ══════════════════════════════════════════
  "nav.seasonalHealth": { en: "Seasonal Health", tr: "Mevsimsel Sağlık" },
  "seasonal.currentSeason": { en: "Current Season", tr: "Mevcut Mevsim" },
  "seasonal.winter": { en: "Winter", tr: "Kış" },
  "seasonal.spring": { en: "Spring", tr: "Bahar" },
  "seasonal.summer": { en: "Summer", tr: "Yaz" },
  "seasonal.autumn": { en: "Autumn", tr: "Sonbahar" },
  "seasonal.supplements": { en: "Recommended Supplements", tr: "Önerilen Takviyeler" },
  "seasonal.lifestyle": { en: "Lifestyle Tips", tr: "Yaşam Tarzı İpuçları" },
  "seasonal.checklist": { en: "Seasonal Checklist", tr: "Mevsimsel Kontrol Listesi" },
  "seasonal.evidenceGrade": { en: "Evidence Grade", tr: "Kanıt Düzeyi" },
  "seasonal.gradeA": { en: "Strong (RCTs)", tr: "Güçlü (RKÇ)" },
  "seasonal.gradeB": { en: "Moderate", tr: "Orta" },
  "seasonal.gradeC": { en: "Traditional Use", tr: "Geleneksel Kullanım" },
  "seasonal.profileWarning": { en: "Check interactions with your medications before starting any supplement.", tr: "Herhangi bir takviyeye başlamadan önce ilaçlarınızla etkileşimleri kontrol edin." },
  "seasonal.bossFight": { en: "Try Boss Fight Protocols", tr: "Boss Fight Protokollerini Dene" },
  "seasonal.dose": { en: "Dose", tr: "Doz" },
  "seasonal.duration": { en: "Duration", tr: "Süre" },

  // ── Nutrition Log (Tool 5) ──
  "nav.nutrition": { en: "Nutrition Log", tr: "Beslenme Günlüğü" },
  "nut.title": { en: "Nutrition Log", tr: "Beslenme Günlüğü" },
  "nut.subtitle": { en: "Log meals, track macros & detect food-drug interactions", tr: "Öğün kaydı, makro takibi ve besin-ilaç etkileşim tespiti" },
  "nut.breakfast": { en: "Breakfast", tr: "Kahvaltı" },
  "nut.lunch": { en: "Lunch", tr: "Öğle" },
  "nut.dinner": { en: "Dinner", tr: "Akşam" },
  "nut.snack": { en: "Snack", tr: "Atıştırmalık" },
  "nut.describeMeal": { en: "Describe your meal", tr: "Öğününüzü açıklayın" },
  "nut.placeholder": { en: "E.g., grilled chicken, rice, salad with olive oil...", tr: "Örn: ızgara tavuk, pilav, zeytinyağlı salata..." },
  "nut.analyzing": { en: "Analyzing meal...", tr: "Öğün analiz ediliyor..." },
  "nut.logMeal": { en: "Log Meal", tr: "Öğün Kaydet" },
  "nut.todaysSummary": { en: "Today's Summary", tr: "Günlük Özet" },
  "nut.calories": { en: "Calories", tr: "Kalori" },
  "nut.protein": { en: "Protein", tr: "Protein" },
  "nut.carbs": { en: "Carbs", tr: "Karbonhidrat" },
  "nut.fat": { en: "Fat", tr: "Yağ" },
  "nut.fiber": { en: "Fiber", tr: "Lif" },
  "nut.foodDrugAlert": { en: "Food-Drug Alert", tr: "Besin-İlaç Uyarısı" },
  "nut.todaysMeals": { en: "Today's Meals", tr: "Bugünkü Öğünler" },
  "nut.saved": { en: "Meal logged!", tr: "Öğün kaydedildi!" },
  "nut.loginRequired": { en: "Sign in to log your meals", tr: "Öğün kaydı için giriş yapın" },

  // Women's Health
  // ══════════════════════════════════════════
  "nav.womensHealth": { en: "Women's Health", tr: "Kadın Sağlığı" },
  "wh.title": { en: "Women's Health", tr: "Kadın Sağlığı" },
  "wh.subtitle": { en: "Cycle tracking, PMS management & contraceptive monitoring", tr: "Döngü takibi, PMS yönetimi ve kontraseptif izleme" },
  "wh.logPeriod": { en: "Log Period", tr: "Adet Kaydet" },
  "wh.periodStart": { en: "Period Start", tr: "Başlangıç" },
  "wh.periodEnd": { en: "Period End", tr: "Bitiş" },
  "wh.flowIntensity": { en: "Flow", tr: "Akış" },
  "wh.light": { en: "Light", tr: "Hafif" },
  "wh.moderate": { en: "Moderate", tr: "Orta" },
  "wh.heavy": { en: "Heavy", tr: "Yoğun" },
  "wh.spotting": { en: "Spotting", tr: "Lekelenme" },
  "wh.symptoms": { en: "Symptoms", tr: "Semptomlar" },
  "wh.cramps": { en: "Cramps", tr: "Kramplar" },
  "wh.headache": { en: "Headache", tr: "Baş ağrısı" },
  "wh.bloating": { en: "Bloating", tr: "Şişkinlik" },
  "wh.moodSwings": { en: "Mood swings", tr: "Ruh hali değişimleri" },
  "wh.breastTenderness": { en: "Breast tenderness", tr: "Göğüs hassasiyeti" },
  "wh.fatigue": { en: "Fatigue", tr: "Yorgunluk" },
  "wh.acne": { en: "Acne", tr: "Akne" },
  "wh.backPain": { en: "Back pain", tr: "Bel ağrısı" },
  "wh.nausea": { en: "Nausea", tr: "Bulantı" },
  "wh.mood": { en: "Mood", tr: "Ruh hali" },
  "wh.cyclePhase": { en: "Current Phase", tr: "Güncel Faz" },
  "wh.menstrual": { en: "Menstrual", tr: "Menstrüel" },
  "wh.follicular": { en: "Follicular", tr: "Foliküler" },
  "wh.ovulatory": { en: "Ovulatory", tr: "Ovulatuar" },
  "wh.luteal": { en: "Luteal", tr: "Luteal" },
  "wh.contraceptive": { en: "Contraceptive", tr: "Kontraseptif" },
  "wh.annualReview": { en: "Annual review due!", tr: "Yıllık kontrol zamanı!" },
  "wh.cycleHistory": { en: "Cycle History", tr: "Döngü Geçmişi" },
  "wh.analyze": { en: "AI Cycle Analysis", tr: "AI Döngü Analizi" },
  "wh.analyzing": { en: "Analyzing cycles...", tr: "Döngüler analiz ediliyor..." },
  "wh.saved": { en: "Period logged!", tr: "Adet kaydedildi!" },
  "wh.loginRequired": { en: "Sign in to track your cycle", tr: "Döngü takibi için giriş yapın" },
  "wh.needMore": { en: "Need at least 3 cycles for AI analysis", tr: "AI analiz için en az 3 döngü gerekli" },

  // ── Chronic Disease Management ──
  "nav.chronicCare": { en: "Chronic Care", tr: "Kronik Hastalık" },
  "chronic.title": { en: "Chronic Disease Management", tr: "Kronik Hastalık Yönetimi" },
  "chronic.subtitle": { en: "Monitor and manage your chronic conditions", tr: "Kronik hastalıklarınızı izleyin ve yönetin" },
  "chronic.selectCondition": { en: "Select a condition", tr: "Hastalık seçin" },
  "chronic.controlStatus": { en: "Control Status", tr: "Kontrol Durumu" },
  "chronic.wellControlled": { en: "Well Controlled", tr: "İyi Kontrollü" },
  "chronic.borderline": { en: "Borderline", tr: "Sınırda" },
  "chronic.uncontrolled": { en: "Uncontrolled", tr: "Kontrolsüz" },
  "chronic.keyMetrics": { en: "Key Metrics", tr: "Ana Göstergeler" },
  "chronic.lifestyle": { en: "Lifestyle", tr: "Yaşam Tarzı" },
  "chronic.supplements": { en: "Safe Supplements", tr: "Güvenli Takviyeler" },
  "chronic.urgentSigns": { en: "Urgent Warning Signs", tr: "Acil Uyarı İşaretleri" },
  "chronic.analyzing": { en: "Analyzing condition...", tr: "Hastalık analiz ediliyor..." },
  "chronic.loginRequired": { en: "Sign in to manage conditions", tr: "Kronik hastalık yönetimi için giriş yapın" },
  "chronic.noConditions": { en: "No chronic conditions in your profile", tr: "Profilinizde kronik hastalık yok" },

  // ── Allergy Map ──
  "nav.allergyMap": { en: "Allergy Map", tr: "Alerji Haritası" },
  "allergy.title": { en: "Allergy & Intolerance Map", tr: "Alerji & İntölerans Haritası" },
  "allergy.subtitle": { en: "Track allergies, intolerances and cross-check with medications", tr: "Alerjileri, intöleransları takip edin ve ilaçlarla çapraz kontrol yapın" },
  "allergy.addNew": { en: "Add Allergy/Intolerance", tr: "Alerji/İntölerans Ekle" },
  "allergy.type": { en: "Type", tr: "Tür" },
  "allergy.allergyType": { en: "Allergy", tr: "Alerji" },
  "allergy.intoleranceType": { en: "Intolerance", tr: "İntölerans" },
  "allergy.sensitivityType": { en: "Sensitivity", tr: "Hassasiyet" },
  "allergy.triggerName": { en: "Trigger", tr: "Tetikleyici" },
  "allergy.category": { en: "Category", tr: "Kategori" },
  "allergy.food": { en: "Food", tr: "Besin" },
  "allergy.medication": { en: "Medication", tr: "İlaç" },
  "allergy.environmental": { en: "Environmental", tr: "Çevresel" },
  "allergy.severity": { en: "Severity", tr: "Şiddet" },
  "allergy.mild": { en: "Mild", tr: "Hafif" },
  "allergy.moderateSev": { en: "Moderate", tr: "Orta" },
  "allergy.severe": { en: "Severe", tr: "Şiddetli" },
  "allergy.anaphylaxis": { en: "Anaphylaxis", tr: "Anafilaksi" },
  "allergy.doctorDiagnosed": { en: "Doctor diagnosed", tr: "Doktor tanısı" },
  "allergy.myAllergies": { en: "My Allergies", tr: "Alerjilerim" },
  "allergy.crossCheck": { en: "Cross-check with medications", tr: "İlaçlarla çapraz kontrol" },
  "allergy.saved": { en: "Allergy saved!", tr: "Alerji kaydedildi!" },
  "allergy.loginRequired": { en: "Sign in to track allergies", tr: "Alerji takibi için giriş yapın" },

  // ── Appointment Prep ──
  "nav.appointmentPrep": { en: "Appointment Prep", tr: "Randevu Hazırlığı" },
  "appt.title": { en: "Doctor Appointment Prep", tr: "Doktor Randevusu Hazırlığı" },
  "appt.subtitle": { en: "AI-generated clinical summary for your doctor visit", tr: "Doktor ziyaretiniz için AI destekli klinik özet" },
  "appt.concerns": { en: "My concerns for the doctor", tr: "Doktora söylemek istediklerim" },
  "appt.concernsPlaceholder": { en: "Any symptoms, questions, or concerns you want to discuss...", tr: "Görüşmek istediğiniz semptomlar, sorular veya endişeler..." },
  "appt.generate": { en: "Generate Summary", tr: "Özet Oluştur" },
  "appt.generating": { en: "Preparing summary...", tr: "Özet hazırlanıyor..." },
  "appt.overview": { en: "Patient Overview", tr: "Hasta Özeti" },
  "appt.recentChanges": { en: "Recent Changes", tr: "Son Değişiklikler" },
  "appt.labHighlights": { en: "Lab Highlights", tr: "Tahlil Özeti" },
  "appt.vitalTrends": { en: "Vital Trends", tr: "Vital Trendler" },
  "appt.suggestedQuestions": { en: "Questions for Your Doctor", tr: "Doktorunuza Sorular" },
  "appt.downloadPdf": { en: "Download PDF", tr: "PDF İndir" },
  "appt.loginRequired": { en: "Sign in to prepare for your appointment", tr: "Randevu hazırlığı için giriş yapın" },

  // ══════════════════════════════════════════
  // Water Quality
  // ══════════════════════════════════════════
  "nav.waterQuality": { en: "Water Quality", tr: "Su Kalitesi" },
  "water.title": { en: "Water Quality Guide", tr: "Su Kalitesi Rehberi" },
  "water.subtitle": { en: "City water mineral content and health advice", tr: "Şehir suyu mineral içeriği ve sağlık önerileri" },
  "water.selectCity": { en: "Select City", tr: "Şehir Seçin" },
  "water.minerals": { en: "Mineral Content", tr: "Mineral İçeriği" },
  "water.kidneyWarning": { en: "Kidney Health Note", tr: "Böbrek Sağlığı Notu" },
  "water.calcium": { en: "Calcium (Ca)", tr: "Kalsiyum (Ca)" },
  "water.magnesium": { en: "Magnesium (Mg)", tr: "Magnezyum (Mg)" },
  "water.sodium": { en: "Sodium (Na)", tr: "Sodyum (Na)" },
  "water.potassium": { en: "Potassium (K)", tr: "Potasyum (K)" },
  "water.chloride": { en: "Chloride (Cl)", tr: "Klorür (Cl)" },
  "water.hardness": { en: "Water Hardness", tr: "Su Sertliği" },
  "water.ph": { en: "pH Level", tr: "pH Seviyesi" },
  "water.tds": { en: "TDS (mg/L)", tr: "TDS (mg/L)" },
  "water.kidneyNote": { en: "If you have kidney disease, consult your nephrologist about your water intake. High mineral content (especially potassium, sodium, and calcium) may require monitoring.", tr: "Böbrek hastalığınız varsa, su tüketiminiz hakkında nefrologunuza danışın. Yüksek mineral içeriği (özellikle potasyum, sodyum ve kalsiyum) izlem gerektirebilir." },
  "water.kidneyHighSodium": { en: "High sodium content — kidney patients should be cautious", tr: "Yüksek sodyum içeriği — böbrek hastaları dikkatli olmalı" },
  "water.kidneyHighCalcium": { en: "High calcium — may contribute to kidney stone risk", tr: "Yüksek kalsiyum — böbrek taşı riskini artırabilir" },
  "water.kidneyHighPotassium": { en: "Elevated potassium — hyperkalemia risk for CKD patients", tr: "Yüksek potasyum — KBH hastalarında hiperkalemi riski" },
  "water.generalTip": { en: "General Tip", tr: "Genel Bilgi" },
  "water.generalTipText": { en: "Turkish tap water is generally safe for drinking in most cities. For optimal health, consider using a filtered pitcher. Always check local municipality reports for the latest data.", tr: "Türkiye'de çoğu şehirde musluk suyu genellikle içilebilir kalitededir. Optimum sağlık için filtrelenmiş su kullanmayı düşünün. Güncel veriler için yerel belediye raporlarını kontrol edin." },
  "water.source": { en: "Source", tr: "Kaynak" },
  "water.unit": { en: "mg/L", tr: "mg/L" },

  // ══════════════════════════════════════════
  // Caffeine Tracker
  // ══════════════════════════════════════════
  "nav.caffeineTracker": { en: "Caffeine Tracker", tr: "Kafein Takibi" },
  "caffeine.title": { en: "Caffeine Tracker", tr: "Kafein Takipçisi" },
  "caffeine.subtitle": { en: "Track daily caffeine and check medication interactions", tr: "Günlük kafeini takip edin, ilaç etkileşimlerini kontrol edin" },
  "caffeine.daily": { en: "Daily Caffeine", tr: "Günlük Kafein" },
  "caffeine.safeZone": { en: "Safe Zone: <400mg", tr: "Güvenli Bölge: <400mg" },
  "caffeine.sleepImpact": { en: "Sleep Impact", tr: "Uyku Etkisi" },
  "caffeine.medAlerts": { en: "Medication Alerts", tr: "İlaç Uyarıları" },
  "caffeine.analyze": { en: "Check Caffeine", tr: "Kafein Kontrol" },
  "caffeine.coffee": { en: "Coffee", tr: "Kahve" },
  "caffeine.tea": { en: "Tea", tr: "Çay" },
  "caffeine.cola": { en: "Cola", tr: "Kola" },
  "caffeine.energyDrink": { en: "Energy Drink", tr: "Enerji İçeceği" },
  "caffeine.preWorkout": { en: "Pre-Workout", tr: "Pre-Workout" },
  "caffeine.chocolate": { en: "Dark Chocolate", tr: "Bitter Çikolata" },
  "caffeine.totalMg": { en: "Total Caffeine", tr: "Toplam Kafein" },
  "caffeine.halfLife": { en: "Half-Life Estimate", tr: "Yarılanma Ömrü Tahmini" },
  "caffeine.recommendations": { en: "Recommendations", tr: "Öneriler" },
  "caffeine.loginNote": { en: "Sign in to check caffeine-medication interactions from your profile.", tr: "Profildeki ilaçlarla kafein etkileşimini kontrol etmek için giriş yapın." },

  // ══════════════════════════════════════════
  // Alcohol Tracker
  // ══════════════════════════════════════════
  "nav.alcoholTracker": { en: "Alcohol Tracker", tr: "Alkol Takibi" },
  "alcohol.title": { en: "Alcohol Tracker", tr: "Alkol Takipçisi" },
  "alcohol.subtitle": { en: "Weekly intake tracking with medication safety check", tr: "Haftalık tüketim takibi ve ilaç güvenlik kontrolü" },
  "alcohol.weeklyUnits": { en: "Weekly Units", tr: "Haftalık Birim" },
  "alcohol.whoLimit": { en: "WHO Recommended Limit", tr: "WHO Önerilen Sınır" },
  "alcohol.riskLevel": { en: "Risk Level", tr: "Risk Seviyesi" },
  "alcohol.medAlerts": { en: "Medication Alerts", tr: "İlaç Uyarıları" },
  "alcohol.analyze": { en: "Check Risk", tr: "Risk Kontrol" },
  "alcohol.beer": { en: "Beer (330ml)", tr: "Bira (330ml)" },
  "alcohol.wine": { en: "Wine (150ml)", tr: "Şarap (150ml)" },
  "alcohol.spirits": { en: "Spirits (40ml)", tr: "Sert İçki (40ml)" },
  "alcohol.cocktail": { en: "Cocktail", tr: "Kokteyl" },
  "alcohol.liverTips": { en: "Liver Health Tips", tr: "Karaciğer Sağlığı İpuçları" },
  "alcohol.loginNote": { en: "Sign in to check alcohol-medication interactions from your profile.", tr: "Profildeki ilaçlarla alkol etkileşimini kontrol etmek için giriş yapın." },

  // ══════════════════════════════════════════
  // Smoking Cessation
  // ══════════════════════════════════════════
  "nav.smokingCessation": { en: "Quit Smoking", tr: "Sigara Bırakma" },
  "smoking.title": { en: "Smoking Cessation Coach", tr: "Sigara Bırakma Koçu" },
  "smoking.subtitle": { en: "Track your quit journey and health recovery", tr: "Bırakma yolculuğunuzu ve sağlık toparlanmanızı takip edin" },
  "smoking.quitDate": { en: "Quit Date", tr: "Bırakma Tarihi" },
  "smoking.daysFree": { en: "Smoke-Free Days", tr: "Dumansız Günler" },
  "smoking.savings": { en: "Money Saved", tr: "Tasarruf" },
  "smoking.timeline": { en: "Health Recovery Timeline", tr: "Sağlık Toparlanma Zaman Çizelgesi" },
  "smoking.cravingLog": { en: "Log Craving", tr: "İstek Kaydet" },
  "smoking.dailyCigs": { en: "Cigarettes/day (before quitting)", tr: "Günlük sigara (bırakmadan önce)" },
  "smoking.status": { en: "Current Status", tr: "Mevcut Durum" },
  "smoking.quit": { en: "Quit", tr: "Bıraktım" },
  "smoking.reducing": { en: "Reducing", tr: "Azaltıyorum" },
  "smoking.planning": { en: "Planning", tr: "Planlıyorum" },
  "smoking.nrt": { en: "Nicotine Replacement", tr: "Nikotin Replasman" },
  "smoking.patch": { en: "Patch", tr: "Bant" },
  "smoking.gum": { en: "Gum", tr: "Sakız" },
  "smoking.spray": { en: "Spray", tr: "Sprey" },
  "smoking.none": { en: "None", tr: "Yok" },
  "smoking.analyze": { en: "Get My Plan", tr: "Planımı Oluştur" },
  "smoking.recoveryTitle": { en: "Health Recovery", tr: "Sağlık Toparlanması" },
  "smoking.cravingTips": { en: "Craving Management", tr: "İstek Yönetimi" },
  "smoking.medInteractions": { en: "Medication Notes", tr: "İlaç Notları" },
  "smoking.savingsCalc": { en: "Savings Calculator", tr: "Tasarruf Hesaplayıcı" },
  "smoking.loginNote": { en: "Sign in for personalized medication interaction checks.", tr: "Kişiselleştirilmiş ilaç etkileşim kontrolü için giriş yapın." },

  // ══════════════════════════════════════════
  // Breathing Exercises
  // ══════════════════════════════════════════
  "nav.breathingExercises": { en: "Breathing", tr: "Nefes Egzersizi" },
  "breathing.title": { en: "Breathing Exercises", tr: "Nefes Egzersizleri" },
  "breathing.subtitle": { en: "Guided breathing techniques for calm and focus", tr: "Sakinlik ve odaklanma için rehberli nefes teknikleri" },
  "breathing.fourSevenEight": { en: "4-7-8 Relaxation", tr: "4-7-8 Rahatlama" },
  "breathing.boxBreathing": { en: "Box Breathing", tr: "Kutu Nefesi" },
  "breathing.wimHof": { en: "Wim Hof Method", tr: "Wim Hof Metodu" },
  "breathing.diaphragmatic": { en: "Diaphragmatic", tr: "Diyafram Nefesi" },
  "breathing.start": { en: "Start", tr: "Başla" },
  "breathing.stop": { en: "Stop", tr: "Durdur" },
  "breathing.inhale": { en: "Inhale", tr: "Nefes Al" },
  "breathing.hold": { en: "Hold", tr: "Tut" },
  "breathing.exhale": { en: "Exhale", tr: "Nefes Ver" },
  "breathing.rest": { en: "Rest", tr: "Dinlen" },
  "breathing.rounds": { en: "Rounds", tr: "Tur" },
  "breathing.panicProtocol": { en: "Panic Attack Protocol", tr: "Panik Atak Protokolü" },
  "breathing.panicDesc": { en: "If you're having a panic attack, try this slow breathing pattern. Focus only on counting.", tr: "Panik atak yaşıyorsanız, bu yavaş nefes kalıbını deneyin. Sadece saymaya odaklanın." },
  "breathing.desc478": { en: "A calming technique for anxiety and sleep. Inhale 4s, hold 7s, exhale 8s.", tr: "Anksiyete ve uyku için sakinleştirici teknik. 4sn nefes al, 7sn tut, 8sn nefes ver." },
  "breathing.descBox": { en: "Used by Navy SEALs for focus under stress. Equal 4s phases.", tr: "Stres altında odaklanma için Navy SEAL'lerin kullandığı teknik. Eşit 4sn fazlar." },
  "breathing.descWim": { en: "30 deep breaths, then hold. Boosts energy and cold tolerance.", tr: "30 derin nefes, sonra tut. Enerji ve soğuk toleransını artırır." },
  "breathing.descDiaphragm": { en: "Deep belly breathing activates the parasympathetic nervous system.", tr: "Derin karın nefesi parasempatik sinir sistemini aktive eder." },

  // ══════════════════════════════════════════
  // Posture & Ergonomics
  // ══════════════════════════════════════════
  "nav.postureErgonomics": { en: "Posture", tr: "Duruş" },
  "posture.title": { en: "Posture & Ergonomics", tr: "Duruş & Ergonomi" },
  "posture.subtitle": { en: "Desk ergonomics checklist and posture tips", tr: "Masa başı ergonomi kontrol listesi ve duruş ipuçları" },
  "posture.checklist": { en: "Ergonomics Checklist", tr: "Ergonomi Kontrol Listesi" },
  "posture.stretches": { en: "Desk Stretches", tr: "Masa Başı Esneme" },
  "posture.monitor": { en: "Monitor at arm's length, top of screen at eye level", tr: "Monitör kol mesafesinde, ekranın üstü göz hizasında" },
  "posture.chair": { en: "Chair supports lower back, feet flat on floor", tr: "Sandalye beli desteklesin, ayaklar yere basmalı" },
  "posture.keyboard": { en: "Keyboard and mouse at elbow height", tr: "Klavye ve fare dirsek hizasında" },
  "posture.screen": { en: "No glare on screen, proper lighting", tr: "Ekranda parlama yok, uygun aydınlatma" },
  "posture.breaks": { en: "Take a break every 30-60 minutes", tr: "Her 30-60 dakikada mola verin" },
  "posture.wrists": { en: "Wrists straight, not bent up or down", tr: "Bilekler düz, yukarı veya aşağı bükülmemiş" },
  "posture.commonIssues": { en: "Common Posture Issues", tr: "Yaygın Duruş Sorunları" },
  "posture.textNeck": { en: "Text Neck", tr: "Telefon Boynu" },
  "posture.textNeckDesc": { en: "Forward head posture from looking at screens. Causes neck and upper back pain.", tr: "Ekranlara bakmaktan kaynaklanan ileri baş duruşu. Boyun ve üst sırt ağrısına neden olur." },
  "posture.roundedShoulders": { en: "Rounded Shoulders", tr: "Yuvarlak Omuzlar" },
  "posture.roundedShouldersDesc": { en: "Shoulders rolled forward from prolonged sitting. Stretching pectorals helps.", tr: "Uzun süreli oturmadan omuzların öne dönmesi. Pektoral germe yardımcı olur." },
  "posture.lowerBackPain": { en: "Lower Back Pain", tr: "Bel Ağrısı" },
  "posture.lowerBackPainDesc": { en: "Often caused by poor lumbar support. Use a small cushion or lumbar roll.", tr: "Genellikle yetersiz bel desteğinden kaynaklanır. Küçük bir yastık veya bel rulosu kullanın." },

  // ══════════════════════════════════════════
  // Screen Time
  // ══════════════════════════════════════════
  "nav.screenTime": { en: "Screen Time", tr: "Ekran Süresi" },
  "screen.title": { en: "Screen Time & Eye Health", tr: "Ekran Süresi & Göz Sağlığı" },
  "screen.subtitle": { en: "Protect your eyes from digital strain", tr: "Gözlerinizi dijital yorgunluktan koruyun" },
  "screen.rule202020": { en: "20-20-20 Rule", tr: "20-20-20 Kuralı" },
  "screen.rule202020Desc": { en: "Every 20 minutes, look at something 20 feet (6 meters) away for 20 seconds. This relaxes the ciliary muscle and reduces eye strain.", tr: "Her 20 dakikada, 20 saniye boyunca 6 metre uzağa bakın. Bu siliyer kası gevşetir ve göz yorgunluğunu azaltır." },
  "screen.blueLight": { en: "Blue Light", tr: "Mavi Işık" },
  "screen.blueLightDesc": { en: "Blue light (380-500nm) from screens can suppress melatonin production, disrupting sleep cycles. Use night mode or blue light filters 2-3 hours before bed.", tr: "Ekranlardan gelen mavi ışık (380-500nm) melatonin üretimini baskılayarak uyku döngüsünü bozabilir. Yatmadan 2-3 saat önce gece modunu veya mavi ışık filtrelerini kullanın." },
  "screen.tips": { en: "Reduction Tips", tr: "Azaltma İpuçları" },
  "screen.symptoms": { en: "Eye Strain Symptoms", tr: "Göz Yorgunluğu Belirtileri" },
  "screen.dryEyes": { en: "Dry, irritated eyes", tr: "Kuru, tahriş olmuş gözler" },
  "screen.headache": { en: "Headaches after screen use", tr: "Ekran kullanımından sonra baş ağrısı" },
  "screen.blurry": { en: "Blurry vision at distance", tr: "Uzağı bulanık görme" },
  "screen.neckPain": { en: "Neck and shoulder tension", tr: "Boyun ve omuz gerginliği" },
  "screen.sleepImpact": { en: "Sleep Impact", tr: "Uyku Etkisi" },
  "screen.sleepImpactDesc": { en: "Screen use before bed delays sleep onset by 30-60 minutes. The brain interprets blue light as daylight, suppressing melatonin by up to 50%.", tr: "Yatmadan önce ekran kullanımı uykuya dalışı 30-60 dakika geciktirir. Beyin mavi ışığı gün ışığı olarak yorumlar ve melatonini %50'ye kadar baskılar." },
  "screen.tip1": { en: "Enable night mode on all devices after sunset", tr: "Gün batımından sonra tüm cihazlarda gece modunu etkinleştirin" },
  "screen.tip2": { en: "Use the 20-20-20 rule consistently", tr: "20-20-20 kuralını tutarlı uygulayın" },
  "screen.tip3": { en: "Position screen at arm's length, slightly below eye level", tr: "Ekranı kol mesafesinde, göz seviyesinin biraz altına yerleştirin" },
  "screen.tip4": { en: "Blink consciously — we blink 66% less when using screens", tr: "Bilinçli göz kırpın — ekran kullanırken %66 daha az göz kırpıyoruz" },
  "screen.tip5": { en: "Use artificial tears if eyes feel dry", tr: "Gözler kuruyor hissediliyorsa suni gözyaşı kullanın" },
  "screen.assessment": { en: "Self-Assessment", tr: "Öz Değerlendirme" },

  // ══════════════════════════════════════════
  // Intermittent Fasting
  // ══════════════════════════════════════════
  "nav.intermittentFasting": { en: "Fasting", tr: "Aralıklı Oruç" },
  "fasting.title": { en: "Intermittent Fasting", tr: "Aralıklı Oruç" },
  "fasting.subtitle": { en: "Fasting protocols with medication timing safety", tr: "İlaç zamanlama güvenliğiyle oruç protokolleri" },
  "fasting.protocol": { en: "Protocol", tr: "Protokol" },
  "fasting.eatingWindow": { en: "Eating Window", tr: "Yeme Penceresi" },
  "fasting.timer": { en: "Fasting Timer", tr: "Oruç Sayacı" },
  "fasting.medTiming": { en: "Medication Timing", tr: "İlaç Zamanlaması" },
  "fasting.ramadanMode": { en: "Ramadan Mode", tr: "Ramazan Modu" },
  "fasting.analyze": { en: "Check Safety", tr: "Güvenlik Kontrol" },
  "fasting.16_8": { en: "16:8 (16h fast, 8h eat)", tr: "16:8 (16 saat oruç, 8 saat yeme)" },
  "fasting.20_4": { en: "20:4 (20h fast, 4h eat)", tr: "20:4 (20 saat oruç, 4 saat yeme)" },
  "fasting.5_2": { en: "5:2 (5 normal, 2 low-cal)", tr: "5:2 (5 gün normal, 2 gün düşük kalori)" },
  "fasting.eat_stop_eat": { en: "Eat-Stop-Eat (24h)", tr: "Ye-Dur-Ye (24 saat)" },
  "fasting.windowStart": { en: "Eating window start", tr: "Yeme penceresi başlangıcı" },
  "fasting.windowEnd": { en: "Eating window end", tr: "Yeme penceresi bitişi" },
  "fasting.safetyWarnings": { en: "Safety Warnings", tr: "Güvenlik Uyarıları" },
  "fasting.fastingNow": { en: "Currently Fasting", tr: "Şu An Oruçta" },
  "fasting.eatingNow": { en: "Currently in Eating Window", tr: "Şu An Yeme Penceresinde" },
  "fasting.loginNote": { en: "Sign in to check fasting-medication timing interactions.", tr: "İlaç zamanlama etkileşimlerini kontrol etmek için giriş yapın." },

  // ══════════════════════════════════════════
  // Sun Exposure
  // ══════════════════════════════════════════
  "nav.sunExposure": { en: "Sun Exposure", tr: "Güneş Maruziyeti" },
  "sun.title": { en: "Sun Exposure Guide", tr: "Güneş Maruziyeti Rehberi" },
  "sun.subtitle": { en: "Safe sun time, vitamin D optimization & medication warnings", tr: "Güvenli güneşlenme süresi, D vitamini optimizasyonu ve ilaç uyarıları" },
  "sun.skinType": { en: "Skin Type", tr: "Cilt Tipi" },
  "sun.uvIndex": { en: "UV Index", tr: "UV İndeksi" },
  "sun.safeTime": { en: "Safe Exposure Time", tr: "Güvenli Maruziyet Süresi" },
  "sun.vitaminD": { en: "Vitamin D Synthesis", tr: "D Vitamini Sentezi" },
  "sun.photosensitive": { en: "Photosensitizing Medications", tr: "Işığa Duyarlı İlaçlar" },
  "sun.fitzpatrick1": { en: "Type I — Very fair, always burns", tr: "Tip I — Çok açık ten, her zaman yanar" },
  "sun.fitzpatrick2": { en: "Type II — Fair, burns easily", tr: "Tip II — Açık ten, kolay yanar" },
  "sun.fitzpatrick3": { en: "Type III — Medium, sometimes burns", tr: "Tip III — Orta ten, bazen yanar" },
  "sun.fitzpatrick4": { en: "Type IV — Olive, rarely burns", tr: "Tip IV — Buğday ten, nadiren yanar" },
  "sun.fitzpatrick5": { en: "Type V — Brown, very rarely burns", tr: "Tip V — Koyu ten, çok nadiren yanar" },
  "sun.fitzpatrick6": { en: "Type VI — Dark brown/black, never burns", tr: "Tip VI — Çok koyu ten, asla yanmaz" },
  "sun.minutes": { en: "minutes", tr: "dakika" },
  "sun.sunscreenGuide": { en: "Sunscreen Guide", tr: "Güneş Kremi Rehberi" },
  "sun.sunscreenTip": { en: "Use SPF 30+ broad-spectrum. Apply 15 minutes before exposure. Reapply every 2 hours.", tr: "SPF 30+ geniş spektrumlu kullanın. Güneşe çıkmadan 15 dakika önce sürün. Her 2 saatte yenileyin." },
  "sun.vitaminDInfo": { en: "10-30 minutes of midday sun on arms and legs, 2-3 times per week, can provide adequate vitamin D for most people.", tr: "Haftada 2-3 kez, öğlen saatlerinde 10-30 dakika kol ve bacaklara güneş ışığı, çoğu kişi için yeterli D vitamini sağlayabilir." },
  "sun.photoMeds": { en: "These medications increase sun sensitivity:", tr: "Bu ilaçlar güneş hassasiyetini artırır:" },
  "sun.loginNote": { en: "Sign in to check if your medications cause photosensitivity.", tr: "İlaçlarınızın ışığa duyarlılık yapıp yapmadığını kontrol etmek için giriş yapın." },

  // ══════════════════════════════════════════
  // Elder Care
  // ══════════════════════════════════════════
  "nav.elderCare": { en: "Elder Care", tr: "Yaşlı Sağlığı" },
  "elder.title": { en: "Elder Care Dashboard", tr: "Yaşlı Sağlığı Paneli" },
  "elder.subtitle": { en: "Health guidance for adults 65+", tr: "65 yaş üstü sağlık rehberi" },
  "elder.polypharmacy": { en: "Medication Review", tr: "İlaç İncelemesi" },
  "elder.fallRisk": { en: "Fall Prevention", tr: "Düşme Önleme" },
  "elder.cognitive": { en: "Cognitive Health", tr: "Bilişsel Sağlık" },
  "elder.nutrition": { en: "Senior Nutrition", tr: "Yaşlı Beslenmesi" },
  "elder.socialRisk": { en: "Social Wellbeing", tr: "Sosyal İyi Oluş" },
  "elder.analyzing": { en: "Analyzing health profile...", tr: "Sağlık profili analiz ediliyor..." },
  "elder.analyze": { en: "Generate Health Review", tr: "Sağlık İncelemesi Oluştur" },
  "elder.ageNote": { en: "This tool is designed for adults 65+", tr: "Bu araç 65 yaş üstü yetişkinler için tasarlanmıştır" },
  "elder.loginRequired": { en: "Sign in for personalized elder care", tr: "Kişisel yaşlı bakımı için giriş yapın" },

  // ══════════════════════════════════════════
  // Child Health
  // ══════════════════════════════════════════
  "nav.childHealth": { en: "Child Health", tr: "Çocuk Sağlığı" },
  "child.title": { en: "Child Health Guide", tr: "Çocuk Sağlığı Rehberi" },
  "child.subtitle": { en: "Pediatric health guidance for parents", tr: "Ebeveynler için pediatrik sağlık rehberi" },
  "child.age": { en: "Child's Age", tr: "Çocuğun Yaşı" },
  "child.months": { en: "months", tr: "ay" },
  "child.years": { en: "years", tr: "yıl" },
  "child.concern": { en: "Concern", tr: "Sorun" },
  "child.fever": { en: "Fever", tr: "Ateş" },
  "child.cough": { en: "Cough", tr: "Öksürük" },
  "child.rash": { en: "Rash", tr: "Döküntü" },
  "child.feeding": { en: "Feeding", tr: "Beslenme" },
  "child.sleepIssue": { en: "Sleep Issues", tr: "Uyku Sorunları" },
  "child.growth": { en: "Growth", tr: "Büyüme" },
  "child.vaccination": { en: "Vaccination", tr: "Aşılama" },
  "child.analyze": { en: "Get Guidance", tr: "Rehber Al" },
  "child.analyzing": { en: "Preparing guidance...", tr: "Rehber hazırlanıyor..." },
  "child.disclaimer": { en: "Always consult your pediatrician. This is not medical advice.", tr: "Her zaman çocuk doktorunuza danışın. Bu tıbbi tavsiye değildir." },

  // ══════════════════════════════════════════
  // Sports Performance
  // ══════════════════════════════════════════
  "nav.sportsPerf": { en: "Sports Performance", tr: "Spor Performansı" },
  "sports.title": { en: "Sports Performance", tr: "Spor Performansı" },
  "sports.subtitle": { en: "Sport-specific supplements, nutrition & recovery", tr: "Spora özel takviye, beslenme ve toparlanma" },
  "sports.sportType": { en: "Sport Type", tr: "Spor Türü" },
  "sports.running": { en: "Running", tr: "Koşu" },
  "sports.swimming": { en: "Swimming", tr: "Yüzme" },
  "sports.cycling": { en: "Cycling", tr: "Bisiklet" },
  "sports.gym": { en: "Gym/Weights", tr: "Spor Salonu" },
  "sports.teamSport": { en: "Team Sport", tr: "Takım Sporu" },
  "sports.martialArts": { en: "Martial Arts", tr: "Dövüş Sanatları" },
  "sports.goal": { en: "Goal", tr: "Hedef" },
  "sports.endurance": { en: "Endurance", tr: "Dayanıklılık" },
  "sports.strength": { en: "Strength", tr: "Güç" },
  "sports.recovery": { en: "Recovery", tr: "Toparlanma" },
  "sports.flexibility": { en: "Flexibility", tr: "Esneklik" },
  "sports.weightLoss": { en: "Weight Loss", tr: "Kilo Verme" },
  "sports.frequency": { en: "Training Frequency", tr: "Antrenman Sıklığı" },
  "sports.analyze": { en: "Get Plan", tr: "Plan Al" },
  "sports.analyzing": { en: "Creating plan...", tr: "Plan oluşturuluyor..." },
  "sports.supplements": { en: "Supplement Plan", tr: "Takviye Planı" },
  "sports.nutritionTiming": { en: "Nutrition Timing", tr: "Beslenme Zamanlaması" },
  "sports.recoveryTips": { en: "Recovery Tips", tr: "Toparlanma İpuçları" },
  "sports.warnings": { en: "Warning Signs", tr: "Uyarı İşaretleri" },

  // ══════════════════════════════════════════
  // Voice Diary
  // ══════════════════════════════════════════
  "nav.voiceDiary": { en: "Voice Diary", tr: "Sesli Günlük" },
  "voice.title": { en: "Voice Health Diary", tr: "Sesli Sağlık Günlüğü" },
  "voice.subtitle": { en: "Record your health notes by voice", tr: "Sağlık notlarınızı sesle kaydedin" },
  "voice.record": { en: "Hold to Record", tr: "Kayıt İçin Basılı Tut" },
  "voice.recording": { en: "Recording...", tr: "Kaydediliyor..." },
  "voice.save": { en: "Save Entry", tr: "Kaydet" },
  "voice.entries": { en: "My Entries", tr: "Kayıtlarım" },
  "voice.sendToAssistant": { en: "Send to Assistant", tr: "Asistana Gönder" },
  "voice.noEntries": { en: "No entries yet. Start recording!", tr: "Henüz kayıt yok. Kayda başlayın!" },
  "voice.mood": { en: "How do you feel?", tr: "Nasıl hissediyorsunuz?" },

  // ══════════════════════════════════════════
  // Gut Health
  // ══════════════════════════════════════════
  "nav.gutHealth": { en: "Gut Health", tr: "Bağırsak Sağlığı" },
  "gut.title": { en: "Gut Health", tr: "Bağırsak Sağlığı" },
  "gut.subtitle": { en: "Track digestive symptoms and get personalized gut health advice", tr: "Sindirim semptomlarını takip edin, kişisel bağırsak sağlığı önerileri alın" },
  "gut.symptoms": { en: "Symptoms", tr: "Semptomlar" },
  "gut.bloating": { en: "Bloating", tr: "Şişkinlik" },
  "gut.gas": { en: "Gas", tr: "Gaz" },
  "gut.constipation": { en: "Constipation", tr: "Kabızlık" },
  "gut.diarrhea": { en: "Diarrhea", tr: "İshal" },
  "gut.acidReflux": { en: "Acid Reflux", tr: "Reflü" },
  "gut.foodSensitivity": { en: "Food Sensitivity", tr: "Besin Hassasiyeti" },
  "gut.dietType": { en: "Diet Type", tr: "Diyet Türü" },
  "gut.antibiotics": { en: "Recent Antibiotics?", tr: "Son zamanlarda antibiyotik?" },
  "gut.analyze": { en: "Analyze Gut Health", tr: "Bağırsak Sağlığı Analiz Et" },
  "gut.analyzing": { en: "Analyzing...", tr: "Analiz ediliyor..." },
  "gut.score": { en: "Gut Health Score", tr: "Bağırsak Sağlık Skoru" },
  "gut.probiotics": { en: "Probiotic Recommendations", tr: "Probiyotik Önerileri" },
  "gut.dietary": { en: "Dietary Suggestions", tr: "Diyet Önerileri" },

  // ══════════════════════════════════════════
  // Skin Health
  // ══════════════════════════════════════════
  "nav.skinHealth": { en: "Skin Health", tr: "Cilt Sağlığı" },
  "skin.title": { en: "Skin Health", tr: "Cilt Sağlığı" },
  "skin.subtitle": { en: "AI-powered skincare analysis and medication effect check", tr: "AI destekli cilt bakım analizi ve ilaç etkisi kontrolü" },
  "skin.concern": { en: "Skin Concern", tr: "Cilt Sorunu" },
  "skin.acne": { en: "Acne", tr: "Akne" },
  "skin.eczema": { en: "Eczema", tr: "Egzama" },
  "skin.psoriasis": { en: "Psoriasis", tr: "Sedef" },
  "skin.rosacea": { en: "Rosacea", tr: "Rozasea" },
  "skin.dryness": { en: "Dryness", tr: "Kuruluk" },
  "skin.aging": { en: "Aging", tr: "Yaşlanma" },
  "skin.severity": { en: "Severity", tr: "Şiddet" },
  "skin.areas": { en: "Affected Areas", tr: "Etkilenen Bölgeler" },
  "skin.routine": { en: "Current Routine", tr: "Mevcut Rutin" },
  "skin.analyze": { en: "Analyze Skin", tr: "Cilt Analizi" },
  "skin.analyzing": { en: "Analyzing...", tr: "Analiz ediliyor..." },
  "skin.recommendations": { en: "Skincare Routine", tr: "Cilt Bakım Rutini" },
  "skin.medEffects": { en: "Medication Effects on Skin", tr: "İlaçların Cilt Etkileri" },

  // ══════════════════════════════════════════
  // Pharmacogenetics
  // ══════════════════════════════════════════
  "nav.pharmacogenetics": { en: "Pharmacogenetics", tr: "Farmakogenetik" },
  "pharma.title": { en: "Pharmacogenetics Guide", tr: "Farmakogenetik Rehberi" },
  "pharma.subtitle": { en: "How your genetics may affect your medications", tr: "Genetiğiniz ilaçlarınızı nasıl etkileyebilir" },
  "pharma.analyze": { en: "Analyze My Medications", tr: "İlaçlarımı Analiz Et" },
  "pharma.analyzing": { en: "Analyzing genetics...", tr: "Genetik analiz ediliyor..." },
  "pharma.affected": { en: "Genetically Affected Medications", tr: "Genetik Etkilenen İlaçlar" },
  "pharma.enzymes": { en: "Key Enzymes", tr: "Anahtar Enzimler" },
  "pharma.testing": { en: "Genetic Testing", tr: "Genetik Test" },
  "pharma.loginRequired": { en: "Sign in to analyze your medications", tr: "İlaç analizi için giriş yapın" },

  // ══════════════════════════════════════════
  // Pain Diary
  // ══════════════════════════════════════════
  "nav.painDiary": { en: "Pain Diary", tr: "Ağrı Günlüğü" },
  "pain.title": { en: "Pain Diary", tr: "Ağrı Günlüğü" },
  "pain.subtitle": { en: "Track pain patterns and find triggers", tr: "Ağrı örüntülerini takip edin, tetikleyicileri bulun" },
  "pain.logPain": { en: "Log Pain", tr: "Ağrı Kaydet" },
  "pain.location": { en: "Location", tr: "Bölge" },
  "pain.intensity": { en: "Intensity", tr: "Şiddet" },
  "pain.type": { en: "Pain Type", tr: "Ağrı Tipi" },
  "pain.sharp": { en: "Sharp", tr: "Keskin" },
  "pain.dull": { en: "Dull", tr: "Künt" },
  "pain.burning": { en: "Burning", tr: "Yanıcı" },
  "pain.throbbing": { en: "Throbbing", tr: "Zonklayan" },
  "pain.duration": { en: "Duration", tr: "Süre" },
  "pain.triggers": { en: "Triggers", tr: "Tetikleyiciler" },
  "pain.relief": { en: "Relief Methods", tr: "Rahatlama Yöntemleri" },
  "pain.trend": { en: "Pain Trend", tr: "Ağrı Trendi" },
  "pain.analyze": { en: "AI Pain Analysis", tr: "AI Ağrı Analizi" },
  "pain.analyzing": { en: "Analyzing patterns...", tr: "Örüntüler analiz ediliyor..." },
  "pain.saved": { en: "Pain logged!", tr: "Ağrı kaydedildi!" },
  "pain.needMore": { en: "Need at least 7 entries for AI analysis", tr: "AI analiz için en az 7 kayıt gerekli" },
  "pain.loginRequired": { en: "Sign in to track pain", tr: "Ağrı takibi için giriş yapın" },

  // ══════════════════════════════════════════
  // Eye Health
  // ══════════════════════════════════════════
  "nav.eyeHealth": { en: "Eye Health", tr: "Göz Sağlığı" },
  "eye.title": { en: "Eye Health", tr: "Göz Sağlığı" },
  "eye.subtitle": { en: "Track eye health and check medication risks", tr: "Göz sağlığını takip edin, ilaç risklerini kontrol edin" },
  "eye.symptoms": { en: "Symptoms", tr: "Semptomlar" },
  "eye.screenHours": { en: "Daily Screen Hours", tr: "Günlük Ekran Saati" },
  "eye.medRisks": { en: "Medication Eye Risks", tr: "İlaç Göz Riskleri" },
  "eye.screening": { en: "Screening Schedule", tr: "Kontrol Takvimi" },
  "eye.analyze": { en: "Check Eye Health", tr: "Göz Sağlığı Kontrol" },

  // ══════════════════════════════════════════
  // Ear Health
  // ══════════════════════════════════════════
  "nav.earHealth": { en: "Ear Health", tr: "Kulak Sağlığı" },
  "ear.title": { en: "Ear & Hearing", tr: "Kulak & İşitme" },
  "ear.subtitle": { en: "Hearing protection and ototoxic medication alerts", tr: "İşitme koruması ve ototoksik ilaç uyarıları" },
  "ear.symptoms": { en: "Symptoms", tr: "Semptomlar" },
  "ear.noiseExposure": { en: "Noise Exposure", tr: "Gürültü Maruziyeti" },
  "ear.ototoxic": { en: "Ototoxic Medications", tr: "Ototoksik İlaçlar" },
  "ear.analyze": { en: "Check Hearing Health", tr: "İşitme Sağlığı Kontrol" },

  // ══════════════════════════════════════════
  // Dental Health
  // ══════════════════════════════════════════
  "nav.dentalHealth": { en: "Dental Health", tr: "Diş Sağlığı" },
  "dental.title": { en: "Dental & Oral Health", tr: "Diş & Ağız Sağlığı" },
  "dental.subtitle": { en: "Oral care and medication side effects", tr: "Ağız bakımı ve ilaç yan etkileri" },
  "dental.checklist": { en: "Daily Checklist", tr: "Günlük Kontrol" },
  "dental.medEffects": { en: "Medication Oral Effects", tr: "İlaç Ağız Etkileri" },

  // ══════════════════════════════════════════
  // Hair & Nail Health
  // ══════════════════════════════════════════
  "nav.hairNail": { en: "Hair & Nail", tr: "Saç & Tırnak" },
  "hair.title": { en: "Hair & Nail Health", tr: "Saç & Tırnak Sağlığı" },
  "hair.subtitle": { en: "Hair loss and nail changes — medication and nutrition check", tr: "Saç dökülmesi ve tırnak değişiklikleri — ilaç ve beslenme kontrolü" },
  "hair.concerns": { en: "Concerns", tr: "Sorunlar" },
  "hair.analyze": { en: "Analyze", tr: "Analiz Et" },

  // ══════════════════════════════════════════
  // Diabetic Foot
  // ══════════════════════════════════════════
  "nav.diabeticFoot": { en: "Diabetic Foot", tr: "Diyabetik Ayak" },
  "dfoot.title": { en: "Diabetic Foot Care", tr: "Diyabetik Ayak Bakımı" },
  "dfoot.subtitle": { en: "Daily foot check to prevent complications", tr: "Komplikasyonları önlemek için günlük ayak kontrolü" },
  "dfoot.checklist": { en: "Daily Foot Check", tr: "Günlük Ayak Kontrolü" },
  "dfoot.warning": { en: "See Doctor Immediately If", tr: "Derhal Doktora Gidin Eğer" },

  // ══════════════════════════════════════════
  // Kidney Dashboard
  // ══════════════════════════════════════════
  "nav.kidneyDashboard": { en: "Kidney", tr: "Böbrek" },
  "kidney.title": { en: "Kidney Dashboard", tr: "Böbrek Paneli" },
  "kidney.subtitle": { en: "eGFR tracking, diet restrictions & medication safety", tr: "eGFR takibi, diyet kısıtlamaları ve ilaç güvenliği" },
  "kidney.stage": { en: "Kidney Stage", tr: "Böbrek Evresi" },
  "kidney.diet": { en: "Dietary Restrictions", tr: "Diyet Kısıtlamaları" },
  "kidney.medAlerts": { en: "Medication Alerts", tr: "İlaç Uyarıları" },
  "kidney.analyze": { en: "Analyze", tr: "Analiz Et" },

  // ══════════════════════════════════════════
  // Liver Monitor
  // ══════════════════════════════════════════
  "nav.liverMonitor": { en: "Liver", tr: "Karaciğer" },
  "liver.title": { en: "Liver Monitor", tr: "Karaciğer Monitörü" },
  "liver.subtitle": { en: "Liver enzyme tracking and hepatotoxic drug alerts", tr: "Karaciğer enzim takibi ve hepatotoksik ilaç uyarıları" },
  "liver.score": { en: "Liver Health Score", tr: "Karaciğer Sağlık Skoru" },
  "liver.hepatotoxic": { en: "Hepatotoxic Medications", tr: "Hepatotoksik İlaçlar" },
  "liver.fli": { en: "Fatty Liver Index", tr: "Yağlı Karaciğer İndeksi" },
  "liver.analyze": { en: "Analyze", tr: "Analiz Et" },

  // ══════════════════════════════════════════
  // Thyroid Dashboard
  // ══════════════════════════════════════════
  "nav.thyroidDashboard": { en: "Thyroid", tr: "Tiroid" },
  "thyroid.title": { en: "Thyroid Dashboard", tr: "Tiroid Paneli" },
  "thyroid.subtitle": { en: "TSH tracking and levothyroxine timing optimization", tr: "TSH takibi ve levotiroksin zamanlama optimizasyonu" },
  "thyroid.status": { en: "Thyroid Status", tr: "Tiroid Durumu" },
  "thyroid.timing": { en: "Medication Timing", tr: "İlaç Zamanlaması" },
  "thyroid.analyze": { en: "Analyze", tr: "Analiz Et" },

  // ══════════════════════════════════════════
  // Cardiovascular Risk
  // ══════════════════════════════════════════
  "nav.cardiovascularRisk": { en: "Heart Risk", tr: "Kalp Riski" },
  "cardio.title": { en: "Cardiovascular Risk Calculator", tr: "Kardiyovasküler Risk Hesaplayıcı" },
  "cardio.subtitle": { en: "10-year heart disease risk assessment", tr: "10 yıllık kalp hastalığı risk değerlendirmesi" },
  "cardio.calculate": { en: "Calculate Risk", tr: "Risk Hesapla" },
  "cardio.riskScore": { en: "10-Year Risk", tr: "10 Yıllık Risk" },
  "cardio.essentials": { en: "Life's Essential 8", tr: "Hayatın Temel 8'i" },

  // ══════════════════════════════════════════
  // Lung Monitor
  // ══════════════════════════════════════════
  "nav.lungMonitor": { en: "Lung Monitor", tr: "Akciğer" },
  "lung.title": { en: "Lung Monitor", tr: "Akciğer Monitörü" },
  "lung.subtitle": { en: "Asthma ACT score, COPD CAT score & inhaler guide", tr: "Astım ACT skoru, KOAH CAT skoru ve inhaler rehberi" },
  "lung.peakFlow": { en: "Peak Flow", tr: "Peak Flow" },
  "lung.actScore": { en: "ACT Score (Asthma)", tr: "ACT Skoru (Astım)" },
  "lung.catScore": { en: "CAT Score (COPD)", tr: "CAT Skoru (KOAH)" },
  "lung.inhaler": { en: "Inhaler Technique", tr: "İnhaler Tekniği" },
  "lung.triggers": { en: "Triggers", tr: "Tetikleyiciler" },
  "lung.analyze": { en: "Analyze", tr: "Analiz Et" },

  // ══════════════════════════════════════════
  // Anxiety Toolkit
  // ══════════════════════════════════════════
  "nav.anxietyToolkit": { en: "Anxiety Toolkit", tr: "Kaygi Arac Seti" },
  "anxiety.title": { en: "Anxiety Toolkit", tr: "Kaygi Arac Seti" },
  "anxiety.subtitle": { en: "GAD-7 assessment, grounding & coping techniques", tr: "GAD-7 değerlendirme, topraklama ve basa cikma teknikleri" },
  "anxiety.level": { en: "Anxiety Level", tr: "Kaygi Seviyesi" },
  "anxiety.panicAttack": { en: "Having a panic attack?", tr: "Panik atak mi yasiyorsunuz?" },
  "anxiety.grounding": { en: "Grounding Exercise", tr: "Topraklama Egzersizi" },
  "anxiety.gad7": { en: "GAD-7 Score", tr: "GAD-7 Skoru" },
  "anxiety.analyze": { en: "Get Assessment", tr: "Değerlendirme Al" },

  // ══════════════════════════════════════════
  // Depression Screening
  // ══════════════════════════════════════════
  "nav.depressionScreening": { en: "Depression Screening", tr: "Depresyon Tarama" },
  "depression.title": { en: "Depression Screening", tr: "Depresyon Taramasi" },
  "depression.subtitle": { en: "PHQ-9 validated screening questionnaire", tr: "PHQ-9 onaylanmis tarama anketi" },
  "depression.phq9": { en: "PHQ-9 Score", tr: "PHQ-9 Skoru" },
  "depression.severity": { en: "Severity", tr: "Siddet" },
  "depression.crisisAlert": { en: "If you're in crisis, call 182 (TR) or 988 (US)", tr: "Kriz durumunda 182'yi arayin" },
  "depression.analyze": { en: "Calculate Score", tr: "Skor Hesapla" },

  // ══════════════════════════════════════════
  // ADHD Management
  // ══════════════════════════════════════════
  "nav.adhdManagement": { en: "ADHD", tr: "DEHB" },
  "adhd.title": { en: "ADHD Management", tr: "DEHB Yonetimi" },
  "adhd.subtitle": { en: "Focus tracking and medication effectiveness", tr: "Odaklanma takibi ve ilac etkinligi" },
  "adhd.focusScore": { en: "Focus Score", tr: "Odaklanma Skoru" },
  "adhd.pomodoro": { en: "Pomodoro Count", tr: "Pomodoro Sayisi" },
  "adhd.analyze": { en: "Analyze Focus", tr: "Odaklanma Analiz" },

  // ══════════════════════════════════════════
  // PTSD Support
  // ══════════════════════════════════════════
  "nav.ptsdSupport": { en: "PTSD Support", tr: "TSSB Destek" },
  "ptsd.title": { en: "PTSD Support", tr: "TSSB Destek" },
  "ptsd.subtitle": { en: "Trauma support with grounding and screening", tr: "Topraklama ve tarama ile travma destegi" },
  "ptsd.triggerLog": { en: "Trigger Log", tr: "Tetikleyici Gunlugu" },
  "ptsd.grounding": { en: "Grounding Exercises", tr: "Topraklama Egzersizleri" },
  "ptsd.screening": { en: "PCL-5 Screening", tr: "PCL-5 Tarama" },
  "ptsd.analyze": { en: "Get Assessment", tr: "Değerlendirme Al" },

  // ══════════════════════════════════════════
  // Addiction Recovery
  // ══════════════════════════════════════════
  "nav.addictionRecovery": { en: "Recovery", tr: "Iyilesme" },
  "recovery.title": { en: "Addiction Recovery", tr: "Bagimlilik Iyilesme" },
  "recovery.subtitle": { en: "Track your recovery journey without judgment", tr: "Iyilesme yolculugunuzu yargilamadan takip edin" },
  "recovery.cleanDays": { en: "Clean Days", tr: "Temiz Gunler" },
  "recovery.craving": { en: "Craving Level", tr: "Istek Seviyesi" },
  "recovery.milestone": { en: "Milestone", tr: "Donum Noktasi" },
  "recovery.emergency": { en: "Need Help Now?", tr: "Simdi Yardim Gerekiyor mu?" },

  // ══════════════════════════════════════════
  // Pregnancy Tracker
  // ══════════════════════════════════════════
  "nav.pregnancyTracker": { en: "Pregnancy", tr: "Gebelik" },
  "pregnancy.title": { en: "Pregnancy Tracker", tr: "Gebelik Takipcisi" },
  "pregnancy.subtitle": { en: "Week-by-week guide with medication safety", tr: "İlaç güvenliği ile hafta hafta rehber" },
  "pregnancy.week": { en: "Gestational Week", tr: "Gebelik Haftasi" },
  "pregnancy.development": { en: "Fetal Development", tr: "Fetal Gelisim" },
  "pregnancy.safeMeds": { en: "Medication Safety", tr: "İlaç Güvenliği" },
  "pregnancy.nutrition": { en: "Nutrition", tr: "Beslenme" },
  "pregnancy.warnings": { en: "Warning Signs", tr: "Uyari Isaretleri" },
  "pregnancy.analyze": { en: "Get Week Guide", tr: "Hafta Rehberi Al" },

  // ══════════════════════════════════════════
  // Postpartum Support
  // ══════════════════════════════════════════
  "nav.postpartum": { en: "Postpartum", tr: "Doğum Sonrası" },
  "postpartum.title": { en: "Postpartum Support", tr: "Doğum Sonrası Destek" },
  "postpartum.subtitle": { en: "Recovery, mood screening & breastfeeding safety", tr: "Toparlanma, ruh hali taramasi ve emzirme güvenliği" },
  "postpartum.weeksSince": { en: "Weeks Postpartum", tr: "Dogumdan Sonra Hafta" },
  "postpartum.epds": { en: "EPDS Score", tr: "EPDS Skoru" },
  "postpartum.breastfeeding": { en: "Breastfeeding", tr: "Emzirme" },
  "postpartum.medSafety": { en: "Medication Safety", tr: "İlaç Güvenliği" },
  "postpartum.analyze": { en: "Get Assessment", tr: "Değerlendirme Al" },

  // ══════════════════════════════════════════
  // Menopause Panel
  // ══════════════════════════════════════════
  "nav.menopause": { en: "Menopause", tr: "Menopoz" },
  "menopause.title": { en: "Menopause Panel", tr: "Menopoz Paneli" },
  "menopause.subtitle": { en: "Symptom tracking, supplements & bone health", tr: "Semptom takibi, takviyeler ve kemik sagligi" },
  "menopause.symptoms": { en: "Symptoms", tr: "Semptomlar" },
  "menopause.mrsScore": { en: "MRS Score", tr: "MRS Skoru" },
  "menopause.boneHealth": { en: "Bone Health", tr: "Kemik Sağlığı" },
  "menopause.analyze": { en: "Analyze Symptoms", tr: "Semptom Analizi" },

  // ══════════════════════════════════════════
  // Men's Health
  // ══════════════════════════════════════════
  "nav.mensHealth": { en: "Men's Health", tr: "Erkek Sağlığı" },
  "mens.title": { en: "Men's Health", tr: "Erkek Sağlığı" },
  "mens.subtitle": { en: "Testosterone, prostate & medication effects", tr: "Testosteron, prostat ve ilac etkileri" },
  "mens.adam": { en: "ADAM Score", tr: "ADAM Skoru" },
  "mens.prostate": { en: "Prostate Health", tr: "Prostat Sağlığı" },
  "mens.medEffects": { en: "Medication Effects", tr: "İlaç Etkileri" },
  "mens.analyze": { en: "Get Assessment", tr: "Değerlendirme Al" },

  // ══════════════════════════════════════════
  // Sexual Health
  // ══════════════════════════════════════════
  "nav.sexualHealth": { en: "Sexual Health", tr: "Cinsel Sağlık" },
  "sexual.title": { en: "Sexual Health", tr: "Cinsel Sağlık" },
  "sexual.subtitle": { en: "Medication effects, screening & safety", tr: "İlaç etkileri, tarama ve güvenlik" },
  "sexual.medEffects": { en: "Medication Sexual Effects", tr: "İlaçların Cinsel Etkileri" },
  "sexual.screening": { en: "STI Screening", tr: "Cinsel Yolla Bulasan Hastalik Taramasi" },
  "sexual.analyze": { en: "Check Medications", tr: "İlaçları Kontrol Et" },

  // ── Student Health ──
  "nav.studentHealth": { en: "Student Health", tr: "Öğrenci Sağlığı" },
  "student.title": { en: "Student Health Pack", tr: "Öğrenci Sağlık Paketi" },
  "student.subtitle": { en: "Exam stress, nutrition & wellness for students", tr: "Sinav stresi, beslenme ve ogrenci sagligi" },

  // ── Military Health ──
  "nav.militaryHealth": { en: "Military Health", tr: "Askerlik Sağlığı" },
  "military.title": { en: "Military Health Guide", tr: "Askerlik Sağlık Rehberi" },
  "military.subtitle": { en: "Health preparation for military service", tr: "Askerlik için sağlık hazirligi" },

  // ── Retirement Health ──
  "nav.retirementHealth": { en: "Retirement Health", tr: "Emeklilik Sağlığı" },
  "retirement.title": { en: "Retirement Health Plan", tr: "Emeklilik Sağlık Planı" },
  "retirement.subtitle": { en: "Screening and wellness plan for 55+", tr: "55+ yas tarama ve sağlık planı" },
  "retirement.generate": { en: "Generate Plan", tr: "Plan Olustur" },

  // ── New Parent Health ──
  "nav.newParentHealth": { en: "New Parent", tr: "Yeni Ebeveyn" },
  "newparent.title": { en: "New Parent Health", tr: "Yeni Ebeveyn Sağlığı" },
  "newparent.subtitle": { en: "Taking care of yourself while caring for baby", tr: "Bebege bakarken kendinize bakin" },

  // ── Air Quality ──
  "nav.airQuality": { en: "Air Quality", tr: "Hava Kalitesi" },
  "air.title": { en: "Air Quality Guide", tr: "Hava Kalitesi Rehberi" },
  "air.subtitle": { en: "AQI levels, health advice & exercise safety", tr: "AQI seviyeleri, sağlık onerileri ve egzersiz güvenliği" },

  // ── Noise Exposure ──
  "nav.noiseExposure": { en: "Noise", tr: "Gürültü" },
  "noise.title": { en: "Noise Exposure Tracker", tr: "Gürültü Maruziyeti" },
  "noise.subtitle": { en: "Protect your hearing from noise damage", tr: "İşitmenizi gürültü hasarından koruyun" },

  // ── Jet Lag ──
  "nav.jetLag": { en: "Jet Lag", tr: "Jet Lag" },
  "jetlag.title": { en: "Jet Lag Optimizer", tr: "Jet Lag Optimizasyonu" },
  "jetlag.subtitle": { en: "Timezone adjustment plan with medication timing", tr: "İlaç zamanlama ile saat dilimi uyum planı" },
  "jetlag.origin": { en: "Origin Timezone", tr: "Cikis Saat Dilimi" },
  "jetlag.destination": { en: "Destination Timezone", tr: "Varis Saat Dilimi" },
  "jetlag.generate": { en: "Generate Plan", tr: "Plan Olustur" },

  // ── Shift Worker ──
  "nav.shiftWorker": { en: "Shift Work", tr: "Vardiyali Calisma" },
  "shift.title": { en: "Shift Worker Coach", tr: "Vardiyali Calisan Kocu" },
  "shift.subtitle": { en: "Circadian rhythm management for shift workers", tr: "Vardiyali calisanlar için sirkadyen ritim yonetimi" },
  "shift.pattern": { en: "Shift Pattern", tr: "Vardiya Duzeni" },
  "shift.generate": { en: "Get Plan", tr: "Plan Al" },

  // ── Cancer Screening ──
  "nav.cancerScreening": { en: "Cancer Screening", tr: "Kanser Tarama" },
  "cancer.title": { en: "Cancer Screening Planner", tr: "Kanser Tarama Planlayici" },
  "cancer.subtitle": { en: "Age & risk-based screening schedule", tr: "Yas ve risk bazli tarama takvimi" },
  "cancer.generate": { en: "Generate Schedule", tr: "Takvim Olustur" },

  // ── Family Health Tree ──
  "nav.familyTree": { en: "Family Tree", tr: "Aile Ağacı" },
  "familytree.title": { en: "Family Health Tree", tr: "Aile Sağlık Ağacı" },
  "familytree.subtitle": { en: "Hereditary risk analysis from family history", tr: "Aile geçmişinden kalitsal risk analizi" },
  "familytree.addMember": { en: "Add Family Member", tr: "Aile Uyesi Ekle" },
  "familytree.analyze": { en: "Analyze Risks", tr: "Riskleri Analiz Et" },

  // ── Check-up Planner ──
  "nav.checkupPlanner": { en: "Check-up", tr: "Check-up" },
  "checkup.title": { en: "Check-up Planner", tr: "Check-up Planlayici" },
  "checkup.subtitle": { en: "Personalized annual test plan", tr: "Kisisel yillik test planı" },
  "checkup.generate": { en: "Generate Plan", tr: "Plan Olustur" },

  // ── Genetic Risk ──
  "nav.geneticRisk": { en: "Genetic Risk", tr: "Genetik Risk" },
  "genetic.title": { en: "Genetic Risk Profile", tr: "Genetik Risk Profili" },
  "genetic.subtitle": { en: "Disease risk scores from family history", tr: "Aile geçmişinden hastalik risk skorlari" },
  "genetic.analyze": { en: "Analyze Risk", tr: "Risk Analiz Et" },

  // ── K1: Wearable Hub ──
  "nav.wearableHub": { en: "Wearables", tr: "Giyilebilir" },
  "wearable.title": { en: "Wearable Hub", tr: "Giyilebilir Cihaz Merkezi" },
  "wearable.comingSoon": { en: "Wearable integration coming soon!", tr: "Giyilebilir cihaz entegrasyonu yakinda!" },
  "wearable.subtitle": { en: "Connect your health devices for continuous monitoring", tr: "Surekli izleme için sağlık cihazlarinizi baglayiniz" },

  // ── K2: Proactive AI ──
  "nav.proactiveAi": { en: "Proactive AI", tr: "Proaktif AI" },
  "proactive.title": { en: "Proactive AI Assistant", tr: "Proaktif AI Asistan" },
  "proactive.comingSoon": { en: "AI that notices before you ask — coming soon!", tr: "Siz sormadan fark eden AI — yakinda!" },
  "proactive.subtitle": { en: "AI-powered pattern detection and early warnings", tr: "AI destekli oruntusu tespiti ve erken uyarilar" },

  // ── K3: AR Scanner ──
  "nav.arScanner": { en: "AR Scanner", tr: "AR Tarayıcı" },
  "ar.title": { en: "AR Drug Scanner", tr: "AR İlaç Tarayıcı" },
  "ar.comingSoon": { en: "Augmented reality drug scanner coming soon!", tr: "Artirilmis gerceklik ilac tarayici yakinda!" },
  "ar.subtitle": { en: "Point your camera at any medication for instant info", tr: "Kameranizi herhangi bir ilaca tutun, aninda bilgi alin" },

  // ── K4: Clinical Trials ──
  "nav.clinicalTrials": { en: "Clinical Trials", tr: "Klinik Arastirma" },
  "trials.title": { en: "Clinical Trial Finder", tr: "Klinik Arastirma Bulucu" },
  "trials.subtitle": { en: "Find relevant clinical trials for your condition", tr: "Durumunuza uygun klinik arastirmalari bulun" },
  "trials.search": { en: "Search Trials", tr: "Arastirma Ara" },
  "trials.condition": { en: "Condition or disease", tr: "Durum veya hastalik" },
  "trials.location": { en: "Location (optional)", tr: "Konum (istege bagli)" },

  // ── K5: Second Opinion ──
  "nav.secondOpinion": { en: "Second Opinion", tr: "Ikinci Görüş" },
  "secondopinion.title": { en: "Second Opinion Prep", tr: "Ikinci Görüş Hazirligi" },
  "secondopinion.subtitle": { en: "Prepare a structured package for specialist consultation", tr: "Uzman konsultasyonu için yapilandirilmis paket hazirlayin" },
  "secondopinion.generate": { en: "Prepare Package", tr: "Paket Hazirla" },
  "secondopinion.concern": { en: "What concern do you want a second opinion on?", tr: "Hangi konuda ikinci görüş almak istiyorsunuz?" },

  // ── L1: Cross Allergy ──
  "nav.crossAllergy": { en: "Cross Allergy", tr: "Capraz Alerji" },
  "crossallergy.title": { en: "Cross-Allergy Guide", tr: "Capraz Alerji Rehberi" },
  "crossallergy.subtitle": { en: "Hidden allergen connections you should know", tr: "Bilmeniz gereken gizli alerjen baglantilari" },

  // ── L2: Detox Facts ──
  "nav.detoxFacts": { en: "Detox Facts", tr: "Detoks Gercekleri" },
  "detox.title": { en: "Detox: Facts vs Fiction", tr: "Detoks: Gercekler vs Kurgu" },
  "detox.subtitle": { en: "Evidence-based guide to detox claims", tr: "Detoks iddialarina kanita dayali rehber" },

  // ── L3: Label Reader ──
  "nav.labelReader": { en: "Label Reader", tr: "Etiket Okuyucu" },
  "label.title": { en: "Food Label Reader", tr: "Besin Etiketi Okuyucu" },
  "label.subtitle": { en: "Decode ingredients and find hidden risks", tr: "Icerikleri cozun, gizli riskleri bulun" },
  "label.analyze": { en: "Analyze Label", tr: "Etiketi Analiz Et" },
  "label.productName": { en: "Product name (optional)", tr: "Urun adi (istege bagli)" },
  "label.ingredients": { en: "Paste ingredients list here...", tr: "Icerik listesini buraya yapıştırıniz..." },

  // ── L4: Anti-Inflammatory ──
  "nav.antiInflammatory": { en: "Anti-Inflammatory", tr: "Anti-Inflamatuar" },
  "antiinflam.title": { en: "Anti-Inflammatory Coach", tr: "Anti-Inflamatuar Koc" },
  "antiinflam.subtitle": { en: "Reduce inflammation through diet and lifestyle", tr: "Diyet ve yasam tarziyla iltihablanmayi azaltin" },
  "antiinflam.analyze": { en: "Analyze Diet", tr: "Diyeti Analiz Et" },
  "antiinflam.diet": { en: "Describe your typical daily diet...", tr: "Tipik gunluk diyetinizi anlatiniz..." },
  "antiinflam.crp": { en: "CRP level (mg/L, optional)", tr: "CRP degeri (mg/L, istege bagli)" },

  // ── L5: Hydration ──
  "nav.hydration": { en: "Hydration", tr: "Hidrasyon" },
  "hydration.title": { en: "Hydration Optimizer", tr: "Hidrasyon Optimizasyonu" },
  "hydration.subtitle": { en: "Weight-based water needs with medication adjustments", tr: "Kilo bazli su ihtiyaci ve ilac ayarlamalari" },
  "hydration.weight": { en: "Your weight (kg)", tr: "Kilonuz (kg)" },
  "hydration.calculate": { en: "Calculate", tr: "Hesapla" },

  // ── M1: Dream Diary ──
  "nav.dreamDiary": { en: "Dream Diary", tr: "Ruya Gunlugu" },
  "dream.title": { en: "Dream Diary", tr: "Ruya Gunlugu" },
  "dream.subtitle": { en: "Record and analyze your dreams", tr: "Ruyalarinizi kaydedin ve analiz edin" },
  "dream.save": { en: "Save Entry", tr: "Kaydi Kaydet" },
  "dream.analyze": { en: "Analyze with AI", tr: "AI ile Analiz Et" },
  "dream.placeholder": { en: "Describe your dream...", tr: "Ruyanizi anlatiniz..." },

  // ── M2: Snoring/Apnea ──
  "nav.snoringApnea": { en: "Snoring/Apnea", tr: "Horlama/Apne" },
  "snoring.title": { en: "Snoring & Sleep Apnea", tr: "Horlama & Uyku Apnesi" },
  "snoring.subtitle": { en: "STOP-BANG screening questionnaire", tr: "STOP-BANG tarama anketi" },
  "snoring.calculate": { en: "Calculate Risk", tr: "Risk Hesapla" },

  // ── M3: Circadian Rhythm ──
  "nav.circadianRhythm": { en: "Circadian", tr: "Sirkadyen" },
  "circadian.title": { en: "Circadian Rhythm Guide", tr: "Sirkadyen Ritim Rehberi" },
  "circadian.subtitle": { en: "Optimize your daily schedule by chronotype", tr: "Kronotipinize gore gunluk programinizi optimize edin" },

  // ── N1: Stretching ──
  "nav.stretching": { en: "Stretching", tr: "Esneme" },
  "stretch.title": { en: "Stretching Builder", tr: "Esneme Rutini Olusturucu" },
  "stretch.subtitle": { en: "Custom stretch routines for your pain points", tr: "Agri noktalarina ozel esneme rutinleri" },
  "stretch.start": { en: "Start Timer", tr: "Zamanlayiciyi Baslat" },

  // ── N2: Walking Tracker ──
  "nav.walkingTracker": { en: "Walking", tr: "Yuruyus" },
  "walking.title": { en: "Walking Tracker", tr: "Yuruyus Takipcisi" },
  "walking.subtitle": { en: "Track steps and meet WHO activity targets", tr: "Adimlari takip edin, WHO aktivite hedeflerini karsilayin" },
  "walking.addEntry": { en: "Add Entry", tr: "Kayit Ekle" },

  // ── N3: Yoga ──
  "nav.yogaMeditation": { en: "Yoga", tr: "Yoga" },
  "yoga.title": { en: "Yoga & Meditation", tr: "Yoga & Meditasyon" },
  "yoga.subtitle": { en: "Evidence-based yoga and guided meditation", tr: "Kanita dayali yoga ve rehberli meditasyon" },

  // ── O1: Rare Diseases ──
  "nav.rareDiseases": { en: "Rare Diseases", tr: "Nadir Hastaliklar" },
  "rare.title": { en: "Rare Disease Info", tr: "Nadir Hastalik Bilgisi" },
  "rare.subtitle": { en: "Information and resources for rare diseases", tr: "Nadir hastaliklar için bilgi ve kaynaklar" },
  "rare.search": { en: "Search disease...", tr: "Hastalik arayiniz..." },
  "rare.searchBtn": { en: "Search", tr: "Ara" },

  // ── O2: Donation ──
  "nav.donation": { en: "Donation", tr: "Bagis" },
  "donation.title": { en: "Blood & Organ Donation", tr: "Kan & Organ Bagisi" },
  "donation.subtitle": { en: "Donation guide and compatibility info", tr: "Bagis rehberi ve uyumluluk bilgisi" },

  // ── O3: Accessibility ──
  "nav.accessibility": { en: "Accessibility", tr: "Erisilebilirlik" },
  "access.title": { en: "Accessibility Assistant", tr: "Erisilebilirlik Asistani" },
  "access.subtitle": { en: "Adaptive health tools and disability resources", tr: "Uyarlanabilir sağlık araclari ve engelli kaynaklari" },

  // ── O4: Immigrant Health ──
  "nav.immigrantHealth": { en: "Immigrant Health", tr: "Göçmen Sağlığı" },
  "immigrant.title": { en: "Immigrant Health Guide", tr: "Göçmen Sağlık Rehberi" },
  "immigrant.subtitle": { en: "Navigate the Turkish healthcare system", tr: "Turk sağlık sisteminde yol bulun" },

  // ── P1: Pet Health ──
  "nav.petHealth": { en: "Pet Health", tr: "Evcil Hayvan" },
  "pet.title": { en: "Pet & Human Health", tr: "Evcil Hayvan & İnsan Sağlığı" },
  "pet.subtitle": { en: "Zoonotic risks and pet owner health guide", tr: "Zoonotik riskler ve evcil hayvan sahibi sağlık rehberi" },

  // ── Shared tool keys ──
  "tool.comingSoon": { en: "Coming Soon", tr: "Yakinda" },
  "tool.learnMore": { en: "Learn More", tr: "Daha Fazla Bilgi" },
  "tool.loginRequired": { en: "Please log in to use this feature", tr: "Bu ozelligi kullanmak için giriş yapiniz" },
  "tool.noResults": { en: "No results found", tr: "Sonuc bulunamadi" },
  "tool.loading": { en: "Analyzing...", tr: "Analiz ediliyor..." },

  // ── H1: Medical Dictionary ──
  "nav.medicalDictionary": { en: "Medical Dictionary", tr: "Tibbi Sozluk" },
  "meddict.title": { en: "Medical Dictionary", tr: "Tibbi Terim Sozlugu" },
  "meddict.subtitle": { en: "Medical terms explained in simple language", tr: "Tibbi terimler basit dilde aciklanir" },
  "meddict.search": { en: "Search a medical term...", tr: "Tibbi terim arayin..." },
  "meddict.explain": { en: "Explain", tr: "Acikla" },

  // ── H2: Drug Info Center ──
  "nav.drugInfo": { en: "Drug Info", tr: "İlaç Bilgi" },
  "druginfo.title": { en: "Drug Information Center", tr: "İlaç Bilgi Merkezi" },
  "druginfo.subtitle": { en: "Everything about your medication in plain language", tr: "Ilaciniz hakkinda her sey sade dilde" },
  "druginfo.search": { en: "Enter drug name...", tr: "İlaç adi girin..." },
  "druginfo.lookup": { en: "Look Up", tr: "Ara" },

  // ── H3: Doctor Communication ──
  "nav.doctorComm": { en: "Doctor Prep", tr: "Doktor Hazirlik" },
  "doctorcomm.title": { en: "Doctor Communication Coach", tr: "Doktora Anlatma Kocu" },
  "doctorcomm.subtitle": { en: "Learn to describe symptoms effectively", tr: "Semptomlari etkili anlatmayi ogrenin" },
  "doctorcomm.describe": { en: "Describe your symptoms...", tr: "Semptomlarinizi anlatin..." },
  "doctorcomm.coach": { en: "Coach Me", tr: "Kocluk Yap" },

  // ── H4: Health News Verifier ──
  "nav.newsVerifier": { en: "News Check", tr: "Haber Kontrol" },
  "news.title": { en: "Health News Verifier", tr: "Sağlık Haberi Doğrulayici" },
  "news.subtitle": { en: "Is this health claim backed by evidence?", tr: "Bu sağlık iddiasi kanita dayali mi?" },
  "news.claim": { en: "Paste the health claim...", tr: "Sağlık iddiasını yapıştırın..." },
  "news.verify": { en: "Verify", tr: "Doğrula" },

  // ── H5: First Aid ──
  "nav.firstAid": { en: "First Aid", tr: "Ilk Yardim" },
  "firstaid.title": { en: "First Aid Guide", tr: "Ilk Yardim Rehberi" },
  "firstaid.subtitle": { en: "Step-by-step emergency procedures", tr: "Adim adim acil durum prosedurleri" },
  "firstaid.call112": { en: "Call 112", tr: "112'yi Ara" },

  // ── I1: Health Forum ──
  "nav.forum": { en: "Forum", tr: "Forum" },
  "forum.title": { en: "Health Forum", tr: "Sağlık Forumu" },
  "forum.comingSoon": { en: "Community forum coming soon!", tr: "Topluluk forumu yakinda!" },

  // ── I2: Health Challenges ──
  "nav.challenges": { en: "Challenges", tr: "Challenge" },
  "challenges.title": { en: "Health Challenges", tr: "Sağlık Challenge'lari" },
  "challenges.subtitle": { en: "Fun health challenges with streaks", tr: "Streak'li eglenceli sağlık gorevleri" },

  // ── I3: Support Groups ──
  "nav.supportGroups": { en: "Support Groups", tr: "Destek Gruplari" },
  "support.title": { en: "Support Groups", tr: "Destek Gruplari" },
  "support.comingSoon": { en: "Support groups coming soon!", tr: "Destek gruplari yakinda!" },

  // ── I4: Grief Support ──
  "nav.griefSupport": { en: "Grief Support", tr: "Yas Destegi" },
  "grief.title": { en: "Grief Support", tr: "Yas Destegi" },
  "grief.subtitle": { en: "Guidance through the stages of grief", tr: "Yas sürecinde rehberlik" },

  // ── J1: Pharmacy Finder ──
  "nav.pharmacyFinder": { en: "Pharmacy", tr: "Eczane" },
  "nav.courses": { en: "Courses", tr: "Eğitimler" },
  "nav.enterprise": { en: "Enterprise", tr: "Kurumsal" },
  "pharmacy.title": { en: "Pharmacy Finder", tr: "Eczane Bulucu" },
  "pharmacy.subtitle": { en: "Find pharmacies and medication equivalents", tr: "Eczane ve ilaç eşdeğeri bulun" },

  // ── J2: Insurance Guide ──
  "nav.insuranceGuide": { en: "Insurance", tr: "Sigorta" },
  "insurance.title": { en: "Insurance Guide", tr: "Sigorta Rehberi" },
  "insurance.subtitle": { en: "SGK coverage and private insurance info", tr: "SGK kapsami ve ozel sigorta bilgisi" },

  // ── J3: Medical Records ──
  "nav.medicalRecords": { en: "Records", tr: "Kayitlar" },
  "records.title": { en: "Medical Records", tr: "Tibbi Kayitlar" },
  "records.comingSoon": { en: "Document organizer coming soon!", tr: "Belge organizatoru yakinda!" },

  // ── J4: Emergency ID ──
  "nav.emergencyId": { en: "Emergency ID", tr: "Acil Kimlik" },
  "emergencyid.title": { en: "Emergency ID Card", tr: "Acil Kimlik Karti" },
  "emergencyid.subtitle": { en: "Shareable card with vital info for emergencies", tr: "Acil durumlar için paylasilabilir hayati bilgi karti" },
  "emergencyid.generate": { en: "Generate Card", tr: "Kart Olustur" },
  "emergencyid.print": { en: "Print Card", tr: "Karti Yazdir" },

  // ── Smart Triage ──
  "triage.title": { en: "Smart Triage", tr: "Ak\u0131ll\u0131 Y\u00F6nlendirme" },
  "triage.subtitle": { en: "AI-recommended specialist consultations", tr: "AI \u00F6nerili uzman kons\u00FCltasyonlar\u0131" },
  "triage.testDate": { en: "Test Date", tr: "Tahlil Tarihi" },
  "triage.dontRemember": { en: "I don't remember the exact date", tr: "Tam tarihi hat\u0131rlam\u0131yorum" },
  "triage.last3months": { en: "Last 3 months", tr: "Son 3 ay" },
  "triage.last6months": { en: "Last 6 months", tr: "Son 6 ay" },
  "triage.lastYear": { en: "Last year", tr: "Son 1 y\u0131l" },
  "triage.olderThanYear": { en: "More than a year", tr: "1 y\u0131ldan eski" },
  "triage.routine": { en: "Routine", tr: "Rutin" },
  "triage.soon": { en: "See Soon", tr: "Yak\u0131nda Gidin" },
  "triage.urgent": { en: "Urgent", tr: "Acil" },
  "triage.probability": { en: "Probability", tr: "Olas\u0131l\u0131k" },
  "triage.keyMarkers": { en: "Key Markers", tr: "Ana G\u00F6stergeler" },
  "triage.overallUrgency": { en: "Overall Urgency", tr: "Genel Aciliyet" },

  // ── About Page ──
  "nav.about": { en: "About", tr: "Hakk\u0131m\u0131zda" },

  // ── J5: Health Spending ──
  "nav.healthSpending": { en: "Spending", tr: "Harcama" },
  "spending.title": { en: "Health Spending Tracker", tr: "Sağlık Harcama Takibi" },
  "spending.subtitle": { en: "Track medication, supplement & doctor expenses", tr: "Ilac, takviye ve doktor masraflarini takip edin" },
  "spending.addExpense": { en: "Add Expense", tr: "Harcama Ekle" },
  "spending.monthly": { en: "Monthly Total", tr: "Aylik Toplam" },
  "spending.yearly": { en: "Yearly Total", tr: "Yillik Toplam" },

  // ── N9: Emergency Mode ──
  "emergencyMode.call112": { en: "CALL 112 NOW", tr: "HEMEN 112'YI ARA" },
  "emergencyMode.criticalInfo": { en: "Critical Health Info", tr: "Kritik Sağlık Bilgileri" },
  "emergencyMode.name": { en: "Full Name", tr: "Ad Soyad" },
  "emergencyMode.bloodType": { en: "Blood Type", tr: "Kan Grubu" },
  "emergencyMode.allergies": { en: "Allergies", tr: "Alerjiler" },
  "emergencyMode.medications": { en: "Current Medications", tr: "Kullanilan Ilaclar" },
  "emergencyMode.conditions": { en: "Chronic Conditions", tr: "Kronik Hastaliklar" },
  "emergencyMode.emergencyContact": { en: "Emergency Contact", tr: "Acil Durum Iletisimi" },
  "emergencyMode.contactName": { en: "Contact name", tr: "Iletisim adi" },
  "emergencyMode.contactPhone": { en: "Phone number", tr: "Telefon numarasi" },
  "emergencyMode.notSet": { en: "Not set", tr: "Belirtilmemis" },
  "emergencyMode.noneRecorded": { en: "None recorded", tr: "Kayit yok" },
  "emergencyMode.panicMode": { en: "Breathing Exercises", tr: "Nefes Egzersizleri" },
  "emergencyMode.share": { en: "Share Info", tr: "Bilgi Paylas" },
  "emergencyMode.copied": { en: "Copied!", tr: "Kopyalandi!" },
  "emergencyMode.showQR": { en: "Show QR Code", tr: "QR Kod Goster" },
  "emergencyMode.qrHint": { en: "Scan to view emergency info", tr: "Acil bilgileri görmek için tarayın" },
  "emergencyMode.footer": { en: "Data cached locally for offline access. Update your profile to keep info current.", tr: "Veriler cevirim disi erisim için yerel olarak saklanir. Bilgileri guncel tutmak için profilinizi güncelleyin." },

  // ── N19: QR Profile Sharing ──
  "qrProfile.title": { en: "Health QR Code", tr: "Sağlık QR Kodu" },
  "qrProfile.subtitle": { en: "Generate a QR code with your health profile summary", tr: "Sağlık profil özetinizi içeren bir QR kod oluşturun" },
  "qrProfile.loginRequired": { en: "Sign in to generate your health QR code", tr: "Sağlık QR kodunuzu oluşturmak için giriş yapin" },
  "qrProfile.selectData": { en: "Select data to include", tr: "Dahil edilecek verileri secin" },
  "qrProfile.basicInfo": { en: "Basic Info", tr: "Temel Bilgiler" },
  "qrProfile.basicInfoDesc": { en: "Name, age, gender, blood type", tr: "Ad, yas, cinsiyet, kan grubu" },
  "qrProfile.medications": { en: "Medications", tr: "Ilaclar" },
  "qrProfile.active": { en: "active", tr: "aktif" },
  "qrProfile.allergies": { en: "Allergies", tr: "Alerjiler" },
  "qrProfile.recorded": { en: "recorded", tr: "kayitli" },
  "qrProfile.emergencyContact": { en: "Emergency Contact", tr: "Acil Iletisim" },
  "qrProfile.notSet": { en: "Not set", tr: "Belirtilmemis" },
  "qrProfile.labResults": { en: "Recent Lab Results", tr: "Son Tahlil Sonuclari" },
  "qrProfile.noLabs": { en: "No labs uploaded", tr: "Tahlil yuklenmemis" },
  "qrProfile.expiry": { en: "QR Expiry", tr: "QR Gecerlilik Suresi" },
  "qrProfile.expiry.24h": { en: "24 Hours", tr: "24 Saat" },
  "qrProfile.expiry.7d": { en: "7 Days", tr: "7 Gun" },
  "qrProfile.expiry.30d": { en: "30 Days", tr: "30 Gun" },
  "qrProfile.expiry.never": { en: "No Expiry", tr: "Suresiz" },
  "qrProfile.generate": { en: "Generate QR Code", tr: "QR Kod Olustur" },
  "qrProfile.scanHint": { en: "Scan this code with any phone camera to view health info", tr: "Sağlık bilgilerini görmek için herhangi bir telefonla tarayın" },
  "qrProfile.download": { en: "Download", tr: "Indir" },
  "qrProfile.print": { en: "Print", tr: "Yazdir" },
  "qrProfile.preview": { en: "Preview", tr: "Onizleme" },
  "qrProfile.previewTitle": { en: "QR Content Preview", tr: "QR Icerik Onizlemesi" },

  // ── data-export ──
  "dataExport.title": { en: "Export My Data", tr: "Verilerimi Indir" },
  "dataExport.subtitle": { en: "GDPR/KVKK right to data portability", tr: "KVKK kapsaminda veri tasima hakki" },
  "dataExport.sampleNote": { en: "Record counts and sizes will reflect your actual data", tr: "Kayit sayilari ve boyutlar hesabiniza gore degisecektir" },
  "dataExport.formatJson": { en: "Data Format: JSON", tr: "Veri Formati: JSON" },
  "dataExport.formatJsonDesc": { en: "Your data will be exported in JSON format.", tr: "Verileriniz JSON formatinda indirilecektir." },
  "dataExport.categories": { en: "Data Categories", tr: "Veri Kategorileri" },
  "dataExport.selected": { en: "Selected:", tr: "Secili:" },
  "dataExport.estimatedTime": { en: "~5 seconds", tr: "~5 saniye" },
  "dataExport.complete": { en: "Export Complete", tr: "Tamamlandi" },
  "dataExport.completeDesc": { en: "Your data has been downloaded.", tr: "Verileriniz indirildi." },
  "dataExport.downloadAgain": { en: "Download Again", tr: "Tekrar Indir" },
  "dataExport.preparing": { en: "Preparing...", tr: "Hazirlaniyor..." },
  "dataExport.downloadJson": { en: "Download as JSON", tr: "JSON Olarak Indir" },

  // ── dental-health ──
  "dental.completedToday": { en: "You completed today's oral care routine!", tr: "Bugunku agiz bakiminizi tamamladiniz!" },
  "dental.medications": { en: "Medications:", tr: "Ilaclar:" },
  "dental.effect": { en: "Effect", tr: "Etki" },
  "dental.risk": { en: "Risk", tr: "Risk" },
  "dental.prevention": { en: "Prevention", tr: "Onlem" },
  "dental.cardioLink": { en: "Oral-Cardiovascular Link", tr: "Agiz Sagligi & Kalp Baglantisi" },
  "dental.cardioDesc": { en: "Periodontal (gum) disease is strongly linked to cardiovascular disease risk. Gum bacteria can enter the bloodstream and increase risk of atherosclerosis, endocarditis, and heart attacks.", tr: "Periodontal (dis eti) hastalik, kardiyovaskuler hastalik riski ile guclu bir sekilde iliskilidir. Dis eti bakterileri kan dolasimina girerek ateroskleroz, endokardit ve kalp krizi riskini artirabilir." },
  "dental.cardioAdvice": { en: "Regular dental care is important not just for oral health, but for your heart health too.", tr: "Duzenli dis bakimi sadece agiz sagligi icin degil, kalp sagliginiz icin de onemlidir." },
  "dental.visitSchedule": { en: "Dental Visit Schedule", tr: "Dis Hekimi Ziyaret Takvimi" },

  // ── depression-screening ──
  "depression.instructions": { en: "Over the last 2 weeks, how often have you been bothered by the following?", tr: "Son 2 hafta icinde asagidaki sorunlardan ne siklikla rahatsiz oldunuz?" },
  "depression.criticalQuestion": { en: "critical question", tr: "kritik soru" },
  "depression.calculating": { en: "Calculating...", tr: "Hesaplaniyor..." },
  "depression.referralMessage": { en: "Your PHQ-9 score suggests professional evaluation is recommended.", tr: "PHQ-9 skorunuz profesyonel degerlendirme onermektedir." },
  "depression.questionDetails": { en: "Question Details", tr: "Soru Detaylari" },
  "depression.positiveActions": { en: "Things You Can Do Today", tr: "Bugun Yapabilecekleriniz" },
  "depression.takeAgain": { en: "Take Again", tr: "Yeniden Yapin" },

  // ── detox-facts ──
  "detox.keyMessage": { en: "Your body already has a perfect detox system: liver, kidneys, lungs, skin, and intestines. Most 'detox' products don't improve this system.", tr: "Vucudunuz zaten mukemmel bir detoks sistemine sahiptir: karaciger, bobrekler, akciger, deri ve bagirsak. Cogu 'detoks' urunu bu sistemi iyilestirmez." },
  "detox.claim": { en: "Claim", tr: "Iddia" },
  "detox.reality": { en: "Reality", tr: "Gercek" },

  // ── diabetic-foot ──
  "dfoot.completedToday": { en: "You completed today's foot check!", tr: "Bugunku ayak kontrolunuzu tamamladiniz!" },
  "dfoot.neuropathy": { en: "Neuropathy Symptoms", tr: "Noropati Belirtileri" },
  "dfoot.neuropathyDesc": { en: "These symptoms may indicate diabetic neuropathy. Report any of them to your doctor.", tr: "Bu belirtiler diyabetik noropati isareti olabilir. Herhangi birini yasiyorsaniz doktorunuza bildirin." },
  "dfoot.shoeGuide": { en: "Shoe Guide", tr: "Ayakkabi Rehberi" },

  // ── dialysis-tracker ──
  "dialysis.title": { en: "Dialysis Tracker", tr: "Diyaliz Takipci" },
  "dialysis.subtitle": { en: "Session, fluid, and nutrition tracking", tr: "Seans, sivi ve beslenme takibi" },
  "dialysis.sessions": { en: "Sessions", tr: "Seanslar" },
  "dialysis.fluidTracking": { en: "Fluid Tracking", tr: "Sivi Takibi" },
  "dialysis.foodGuide": { en: "Food Guide", tr: "Besin Rehberi" },
  "dialysis.medTiming": { en: "Medication Timing", tr: "İlaç Zamanlama" },
  "dialysis.sessionsThisMonth": { en: "Sessions this month", tr: "Bu ay seanslar" },
  "dialysis.avgFluidRemoval": { en: "Avg. fluid removal", tr: "Ort. sivi cekimi" },
  "dialysis.sessionDuration": { en: "Session duration", tr: "Seans suresi" },
  "dialysis.preWeight": { en: "Pre Weight", tr: "On Kilo" },
  "dialysis.postWeight": { en: "Post Weight", tr: "Son Kilo" },
  "dialysis.preBP": { en: "Pre BP", tr: "On TA" },
  "dialysis.postBP": { en: "Post BP", tr: "Son TA" },
  "dialysis.addSession": { en: "Add new session", tr: "Yeni seans ekle" },
  "dialysis.dailyFluid": { en: "Daily Fluid Intake", tr: "Gunluk Sivi Alimi" },
  "dialysis.fluidWarning": { en: "Approaching your fluid limit!", tr: "Sivi limitinize yaklasiyorsunuz!" },
  "dialysis.potassiumGuide": { en: "Potassium & Phosphorus Guide", tr: "Potasyum & Fosfor Rehberi" },
  "dialysis.potassiumGuideDesc": { en: "Nutrition guide for dialysis patients", tr: "Diyaliz hastalari icin besin rehberi" },
  "dialysis.medTimingTitle": { en: "Dialysis Medication Timing", tr: "Diyaliz İlaç Zamanlama" },
  "dialysis.medTimingDesc": { en: "Take your medications at the right time", tr: "İlaçlarınizi dogru zamanda alin" },

  // ── disaster-mode ──
  "disaster.title": { en: "DISASTER HEALTH MODE", tr: "AFET SAGLIK MODU" },
  "disaster.subtitle": { en: "Emergency health guide - designed for crisis situations", tr: "Acil saglik rehberi - kriz durumlari icin tasarlandi" },
  "disaster.emergencyCard": { en: "Emergency ID Card", tr: "Acil Durum Kimlik Karti" },
  "disaster.myMeds": { en: "My Medications", tr: "İlaçlarım" },
  "disaster.noMeds": { en: "No medications on file", tr: "Kayitli ilac yok" },
  "disaster.loginForMeds": { en: "Log in to see your medications", tr: "İlaçlarınizi gormek icin giris yapin" },
  "disaster.bloodType": { en: "Blood Type", tr: "Kan Grubu" },
  "disaster.allergies": { en: "Allergies", tr: "Alerjiler" },
  "disaster.none": { en: "None recorded", tr: "Kayit yok" },
  "disaster.emergencyNumbers": { en: "Emergency Numbers", tr: "Acil Numaralar" },
  "disaster.waterSafety": { en: "Water Safety", tr: "Su Güvenliği" },
  "disaster.firstAid": { en: "First Aid Basics", tr: "Ilk Yardim Temelleri" },
  "disaster.crushSyndrome": { en: "Crush Syndrome Awareness", tr: "Ezilme Sendromu Farkindaligi" },
  "disaster.ptsd": { en: "PTSD Early Intervention", tr: "TSSB Erken Mudahale" },
  "disaster.hospital": { en: "Nearest Hospital", tr: "En Yakin Hastane" },
  "disaster.earthquake": { en: "Earthquake Guide", tr: "Deprem Rehberi" },
  "disaster.flood": { en: "Flood Guide", tr: "Sel Rehberi" },
  "disaster.offlineReady": { en: "This page works offline", tr: "Bu sayfa cevrimdisi calisir" },
  "disaster.call": { en: "CALL", tr: "ARA" },
  "disaster.downloadCard": { en: "Save Emergency Card", tr: "Acil Karti Kaydet" },
  "disaster.expandAll": { en: "Expand All", tr: "Tumunu Ac" },
  "disaster.hospitalDesc": { en: "Nearest hospital info will appear here once location permission is granted.", tr: "Konum izni verildikten sonra en yakin hastane bilgisi burada gorunecektir." },
  "disaster.findHospital": { en: "Find Hospital on Google Maps", tr: "Google Maps'te Hastane Bul" },

  // ── doctor-analytics ──
  "doctorAnalytics.title": { en: "Patient Analytics", tr: "Hasta Analitigi" },
  "doctorAnalytics.subtitle": { en: "Population health indicators", tr: "Populasyon saglik gostergeleri" },
  "doctorAnalytics.sampleNote": { en: "Updates when connected to real patient data", tr: "Gercek hasta verisi baglandiginda guncellenir" },
  "doctorAnalytics.conditionDist": { en: "Condition Distribution", tr: "Hastalik Dagilimi" },
  "doctorAnalytics.topMeds": { en: "Top Medications", tr: "En Cok Kullanilan Ilaclar" },
  "doctorAnalytics.patients": { en: "pts", tr: "hasta" },
  "doctorAnalytics.alerts": { en: "Alerts & Notifications", tr: "Uyarilar ve Bildirimler" },

  // ── doctor-communication ──
  "doctorComm.redFlags": { en: "Red Flags", tr: "Dikkat Edilmesi Gerekenler" },
  "doctorComm.structuredDesc": { en: "Structured Description", tr: "Yapilandirilmis Anlatim" },
  "doctorComm.questionsToAsk": { en: "Questions to Ask", tr: "Doktorunuza Sorun" },
  "doctorComm.visitTips": { en: "Visit Tips", tr: "Ziyaret Ipuclari" },
  "doctorComm.whatToBring": { en: "What to Bring", tr: "Yaniniza Alin" },
  "doctorComm.emptyState": { en: "Describe your symptoms above", tr: "Semptomlarinizi anlatin" },
  "doctorComm.printTitle": { en: "Doctor Visit Notes", tr: "Doktor Ziyareti Notlari" },

  // ── doctor-dashboard ──
  "doctorDash.title": { en: "Doctor Dashboard", tr: "Doktor Paneli" },
  "doctorDash.subtitle": { en: "Patient monitoring and decision support", tr: "Hasta takibi ve karar destek sistemi" },
  "doctorDash.sampleNote": { en: "This data will change when connected to real patient records", tr: "Gercek hasta verisi baglandiginda bu veriler degisecektir" },
  "doctorDash.totalPatients": { en: "Total Patients", tr: "Toplam Hasta" },
  "doctorDash.avgCompliance": { en: "Avg Compliance", tr: "Ort. Uyum" },
  "doctorDash.overdueFollowup": { en: "Overdue Follow-up", tr: "Takip Geciken" },
  "doctorDash.overview": { en: "Overview", tr: "Genel Bakis" },
  "doctorDash.patientsTab": { en: "Patients", tr: "Hastalar" },
  "doctorDash.aiSupport": { en: "AI Decision Support", tr: "AI Karar Destek" },
  "doctorDash.needsAttention": { en: "Patients Needing Attention", tr: "Dikkat Gerektiren Hastalar" },
  "doctorDash.populationOverview": { en: "Population Overview", tr: "Populasyon Ozeti" },
  "doctorDash.meds": { en: "meds", tr: "ilac" },
  "doctorDash.aiDesc": { en: "AI-powered alerts and suggestions based on patient profiles", tr: "Hasta profillerine dayali AI uyarilari ve onerileri" },
  "doctorDash.diabetes": { en: "Diabetes", tr: "Diyabet" },
  "doctorDash.hypertension": { en: "Hypertension", tr: "Hipertansiyon" },
  "doctorDash.thyroid": { en: "Thyroid", tr: "Tiroid" },

  // ── common (new) ──
  "common.sampleData": { en: "SAMPLE DATA", tr: "ORNEK VERI" },
  "common.active": { en: "Active", tr: "Aktif" },
  "common.print": { en: "Print", tr: "Yazdir" },

  // ── health-guides ──
  "healthGuides.title": { en: "Health Guides", tr: "Sağlık Rehberleri" },
  "healthGuides.subtitle": { en: "Comprehensive health guides for special situations", tr: "Özel durumlar için kapsamlı sağlık rehberleri" },
  "healthGuides.allGuides": { en: "All Guides", tr: "Tüm Rehberler" },

  // ── health-news-verifier ──
  "newsVerifier.evidenceBreakdown": { en: "Evidence Breakdown", tr: "Kanıt Analizi" },
  "newsVerifier.evidenceLevel": { en: "Evidence Level", tr: "Kanıt Düzeyi" },
  "newsVerifier.studyType": { en: "Study Type", tr: "Çalışma Tipi" },
  "newsVerifier.sampleSize": { en: "Sample Size", tr: "Örneklem" },
  "newsVerifier.whatScienceSays": { en: "What Science Says", tr: "Bilim Ne Diyor?" },
  "newsVerifier.nuances": { en: "Important Nuances", tr: "Nüanslar" },
  "newsVerifier.misinterpretations": { en: "Common Misinterpretations", tr: "Yaygın Yanlış Anlamalar" },
  "newsVerifier.bottomLine": { en: "Bottom Line", tr: "Sonuç" },
  "newsVerifier.mediaAccuracy": { en: "Media Accuracy:", tr: "Medya Doğruluğu:" },
  "newsVerifier.emptyState": { en: "Paste a health claim to verify", tr: "Bir sağlık iddiası yapıştırın" },

  // ── health-podcasts ──
  "podcasts.title": { en: "Health Podcast Recommendations", tr: "Sağlık Podcast Önerileri" },
  "podcasts.subtitle": { en: "Learn while you listen, the best podcasts for your health", tr: "Dinlerken ogren, sağlığın için en iyi podcast'ler" },
  "podcasts.featured": { en: "Featured", tr: "One Cikanlar" },
  "podcasts.searchPlaceholder": { en: "Search podcasts or hosts...", tr: "Podcast veya sunucu ara..." },
  "podcasts.episodes": { en: "episodes", tr: "bolum" },
  "podcasts.listen": { en: "Listen", tr: "Dinle" },
  "podcasts.notFound": { en: "No podcasts found", tr: "Podcast bulunamadı" },
  "podcasts.suggestion": { en: "Have a podcast recommendation? Let us know and we'll add it to our list!", tr: "Bir podcast oneriniz mi var? Bize bildirin ve listemize ekleyelim!" },

  // ── health-quiz ──
  "quiz.title": { en: "Daily Health Quiz", tr: "Günlük Sağlık Bilmecesi" },
  "quiz.subtitle": { en: "One question a day, learn something new!", tr: "Her gun bir soru, her gun yeni bir bilgi!" },
  "quiz.correct": { en: "Correct", tr: "Doğru" },
  "quiz.accuracy": { en: "Accuracy", tr: "Başarı" },
  "quiz.streak": { en: "Streak", tr: "Seri" },
  "quiz.submitAnswer": { en: "Submit Answer", tr: "Cevabimi Gonder" },
  "quiz.explanation": { en: "Explanation", tr: "Açıklama" },
  "quiz.completedToday": { en: "You completed today's quiz!", tr: "Bugunun quizini tamamladin!" },
  "quiz.comeBackTomorrow": { en: "Come back tomorrow for a new question.", tr: "Yarin yeni bir soru olacak." },
  "quiz.categoryBreakdown": { en: "Category Breakdown", tr: "Kategori Dağılımi" },

  // ── health-report-card ──
  "reportCard.title": { en: "Annual Health Report", tr: "Yıllık Sağlık Raporu" },
  "reportCard.summaryReport": { en: "summary report", tr: "özet rapor" },
  "reportCard.medCompliance": { en: "Med Compliance", tr: "İlaç Uyumu" },
  "reportCard.supplement": { en: "Supplement", tr: "Takviye Uyumu" },
  "reportCard.checkups": { en: "Checkups", tr: "Doktor Ziyareti" },
  "reportCard.bloodTests": { en: "Blood Tests", tr: "Kan Tahlili" },
  "reportCard.goalsMet": { en: "Goals Met", tr: "Hedef" },
  "reportCard.labTrends": { en: "Lab Trends", tr: "Laboratuvar Trendleri" },
  "reportCard.healthGoals": { en: "Health Goals", tr: "Sağlık Hedefleri" },
  "reportCard.completed": { en: "Completed", tr: "Tamamlandı" },
  "reportCard.inProgress": { en: "In Progress", tr: "Devam Ediyor" },
  "reportCard.notStarted": { en: "Not Started", tr: "Başlamadı" },
  "reportCard.overallAssessment": { en: "Overall Assessment", tr: "Genel Değerlendirme" },
  "reportCard.overallText": { en: "Your health indicators are trending positively overall. The decline in HbA1c and cholesterol is notable. You reached your Vitamin D target. There is room for improvement in exercise habits and sleep patterns.", tr: "Sağlık gostergeleriniz genel olarak olumlu yonde ilerliyor. HbA1c ve kolesterol degerlerinizdeki dusus dikkat cekici. D vitamini hedefinize ulastiniz. Egzersiz aliskanligi ve uyku duzeni konusunda gelisme alani var." },

  // ── health-roadmap (extra) ──
  "roadmap.components": { en: "components", tr: "bileşen" },
  "roadmap.milestones": { en: "milestones", tr: "hedef" },

  // ── health-spending ──
  "spending.categoryBreakdown": { en: "Category Breakdown", tr: "Kategori Dagılımı" },
  "spending.amountPlaceholder": { en: "Amount (TL)", tr: "Tutar (TL)" },
  "spending.descriptionPlaceholder": { en: "Description (optional)", tr: "Açıklama (isteğe bağlı)" },
  "spending.add": { en: "Add", tr: "Ekle" },
  "spending.noExpenses": { en: "No expenses recorded yet", tr: "Henuz harcama kaydi yok" },
  "spending.taxTitle": { en: "Tax Deduction Info", tr: "Vergi İndirimi Bilgisi" },
  "spending.taxInfo": { en: "In Turkey, health expenses can be deducted in annual income tax returns. Keep receipts for SGK copays, medications, private hospital visits, dental and eye care. Health expenses up to 10% of annual income may be deductible.", tr: "Türkiye'de sağlık harcamalari yillik gelir vergisi beyannamesinde indirim olarak gosterilebilir. SGK katilim paylari, ilac, ozel hastane, dis ve goz masraflari için fatura ve makbuzlarinizi saklayin. Yillik toplam gelirin %10'unu gecmeyen sağlık harcamalari indirilebilir." },

  // ── health-timeline ──
  "timeline.title": { en: "Health Timeline", tr: "Sağlık Zaman Çizelgesi" },
  "timeline.subtitle": { en: "Your complete health history in one chronological view", tr: "Tüm sağlık geçmişin tek kronolojik çizelgede" },
  "timeline.events": { en: "events", tr: "olay" },
  "timeline.addEvent": { en: "Add Event", tr: "Olay Ekle" },
  "timeline.titlePlaceholder": { en: "Title", tr: "Başlık" },
  "timeline.detailsPlaceholder": { en: "Details (optional)", tr: "Detay (opsiyonel)" },
  "timeline.bloodTest": { en: "Blood Test", tr: "Kan Tahlili" },
  "timeline.emptyState": { en: "Timeline is empty. Will auto-populate from profile data.", tr: "Henüz zaman çizelgesi boş. Profil verilerinden otomatik doldurulacak." },

  // ── healthy-recipes ──
  "recipes.title": { en: "Healthy Recipes", tr: "Sağlıkli Tarifler" },
  "recipes.subtitle": { en: "Delicious recipes for special dietary needs", tr: "Özel diyetlere uygun, sağlıkli ve lezzetli tarifler" },
  "recipes.searchPlaceholder": { en: "Search recipes...", tr: "Tarif ara..." },
  "recipes.all": { en: "All", tr: "Tumunu" },
  "recipes.ingredients": { en: "Ingredients", tr: "Malzemeler" },
  "recipes.nutritionalHighlights": { en: "Nutritional Highlights", tr: "Besin Vurgulari" },
  "recipes.goodFor": { en: "Good For", tr: "Bunlara Iyi Gelir" },
  "recipes.notFound": { en: "No recipes found", tr: "Tarif bulunamadı" },

}

// ══════════════════════════════════════════
// API
// ══════════════════════════════════════════

/**
 * Translation helper — returns the string for the given key and language.
 * Falls back to English, then to the key itself.
 */
export function tx(key: string, lang: Lang): string {
  const entry = t[key]
  if (!entry) return key
  return entry[lang] ?? entry[DEFAULT_LANG] ?? key
}

/**
 * Extract a localized value from a bilingual object like { en: "...", tr: "..." }.
 * Works with any object that has lang-keyed properties.
 * Also handles variants like { nameEn, nameTr } or { titleEN, titleTR }.
 */
export function txObj(obj: Record<string, any>, lang: Lang, fallback = ""): string {
  if (!obj) return fallback
  // Direct: { en: "...", tr: "..." }
  if (obj[lang] !== undefined) return obj[lang]
  // camelCase: { nameEn, nameTr }
  const camel = lang === "tr" ? "Tr" : "En"
  for (const key of Object.keys(obj)) {
    if (key.endsWith(camel) && typeof obj[key] === "string") return obj[key]
  }
  // UPPER: { titleEN, titleTR }
  const upper = lang.toUpperCase()
  for (const key of Object.keys(obj)) {
    if (key.endsWith(upper) && typeof obj[key] === "string") return obj[key]
  }
  // Fallback to other language
  const otherLang = lang === "tr" ? "en" : "tr"
  if (obj[otherLang] !== undefined) return obj[otherLang]
  return fallback
}

/**
 * Parameterized translation: replaces {key} placeholders with values.
 * Example: txp("items.count", lang, { count: 5 }) → "5 items saved"
 */
export function txp(key: string, lang: Lang, params: Record<string, string | number>): string {
  let result = tx(key, lang)
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
  }
  return result
}

/**
 * Get a random message from a language-keyed message array.
 * Used for fun/motivational messages (water, meds, etc.)
 *
 * To add a new language: add the language key to each array in MESSAGE_ARRAYS below.
 */
export function txRandom(key: string, lang: Lang): string {
  const arr = MESSAGE_ARRAYS[key]
  if (!arr) return key
  const langArr = arr[lang] ?? arr[DEFAULT_LANG]
  if (!langArr || langArr.length === 0) return key
  return langArr[Math.floor(Math.random() * langArr.length)]
}

export function txMessages(key: string, lang: Lang): string[] {
  const arr = MESSAGE_ARRAYS[key]
  if (!arr) return []
  return arr[lang] ?? arr[DEFAULT_LANG] ?? []
}

// ══════════════════════════════════════════
// Message Arrays — fun/motivational messages
// ══════════════════════════════════════════
// 🌍 YENİ DİL EKLERKEN: Her diziye yeni dil key'i ekle

const MESSAGE_ARRAYS: Record<string, Record<string, string[]>> = {
  "msg.waterDone": {
    en: [
      "🎉 Daily goal reached! Your cells are partying!",
      "🏆 Water champion! Hydration level: BOSS!",
      "💪 Hydration master! Glow mode activated!",
      "🌊 Goal crushed! Your kidneys are doing a happy dance!",
      "💧 Perfectly hydrated! Skin is glowing!",
      "🐬 Dolphin level hydration! Smooth sailing!",
    ],
    tr: [
      "🎉 Günlük hedefe ulaştın! Hücrelerin parti yapıyor!",
      "🏆 Su şampiyonu! Hidrasyon seviyesi: BOSS!",
      "💪 Hidrasyon ustası! Parlama modu aktif!",
      "🌊 Hedef ezildi! Böbreklerin mutluluk dansı yapıyor!",
      "💧 Mükemmel hidrasyon! Cilt parlıyor!",
      "🐬 Yunus seviye hidrasyon! Harika gidiyorsun!",
    ],
  },
  "msg.waterOver": {
    en: [
      "😄 Overachiever! Water lover!",
      "🐟 Growing gills? Just kidding — amazing!",
      "🌊 Your kidneys are sending thank you cards!",
      "💧 Above and beyond! Hydration hero!",
      "🏊 Olympic swimmer level hydration!",
      "🧊 Ice cold dedication! You're unstoppable!",
      "🫧 Bubble level unlocked! Keep flowing!",
      "🌈 Your cells are throwing a pool party!",
      "🚿 At this rate you'll need a snorkel!",
      "💎 Diamond tier hydration achieved!",
      "🐠 The fish are jealous of your water intake!",
      "🌊 Tsunami of health incoming!",
      "🧜 Mermaid/Merman transformation: 87% complete!",
      "💦 Even camels are impressed right now!",
      "🌴 Your body is basically an oasis at this point!",
      "🎮 Achievement unlocked: Hydration Overlord!",
      "🛁 Your blood is so clean it sparkles!",
      "🔱 Poseidon just followed you on Instagram!",
      "🎪 Your bladder is planning a protest march!",
      "🏆 Hall of Fame: Water Drinking Division!",
    ],
    tr: [
      "😄 Hedefin üstündesin! Su aşığı!",
      "🐟 Solungaç mı çıkarıyorsun? Şaka — harikasın!",
      "🌊 Böbreklerin teşekkür kartı gönderiyor!",
      "💧 Hedefin ötesinde! Hidrasyon kahramanısın!",
      "🏊 Olimpik yüzücü seviye hidrasyon!",
      "🧊 Buz gibi kararlılık! Durdurulamıyorsun!",
      "🫧 Kabarcık seviyesi açıldı! Akmaya devam!",
      "🌈 Hücrelerin havuz partisi veriyor!",
      "🚿 Bu gidişle şnorkele ihtiyacın olacak!",
      "💎 Elmas seviye hidrasyon kazanıldı!",
      "🐠 Balıklar su içme kapasiteni kıskanıyor!",
      "🌊 Sağlık tsunamisi yaklaşıyor!",
      "🧜 Deniz kızı/erkeği dönüşümü: %87 tamamlandı!",
      "💦 Develer bile etkilendi şu an!",
      "🌴 Vücudun artık bir vaha resmen!",
      "🎮 Başarım açıldı: Hidrasyon Lordu!",
      "🛁 Kanın o kadar temiz ki pırıl pırıl!",
      "🔱 Poseidon seni Instagram'da takip etti!",
      "🎪 Mesanen protesto yürüyüşü planlıyor!",
      "🏆 Şöhretler Salonu: Su İçme Dalı!",
    ],
  },
  "msg.waterSplash": {
    en: ["Nice sip! 💧", "Splash! 🌊", "Glug glug! 💦", "+1 glass! 💧", "Refreshing! 🥤", "H₂O power! 💙", "Keep it up! 💧", "Hydrated! 💦", "Your body loves this! 🫧", "Flow state! 🌊"],
    tr: ["Güzel yudum! 💧", "Şıp! 🌊", "Glu glu! 💦", "+1 bardak! 💧", "Ferahlatıcı! 🥤", "H₂O gücü! 💙", "Devam! 💧", "Hidratasyon! 💦", "Vücudun bunu seviyor! 🫧", "Akış modunda! 🌊"],
  },
  "msg.medDone": {
    en: [
      "Another one down! 💊", "Legend! Your body is cheering! 👏", "Took your meds? You're a hero! 🦸",
      "Discipline on point today! 🎯", "Pop pop pop! Steady steps to health! 🚀",
      "Your meds love you back! 💚", "One more down! Consistency = superpower! 💪",
      "Check! Your health routine is fire! 💣", "You're on a roll today! ✨",
      "Meds taken, soul fed! Your body thanks you 🙏", "Your doctor would be proud! 👨‍⚕️",
      "Got it! Easy peasy! 😎", "Meds? Done. You? Incredible! 🌟", "Health bar filled! +10 HP! 🎮",
    ],
    tr: [
      "Bi ilacı daha hallettin! 💊", "Efsane! Vücudun alkışlıyor! 👏", "İlaç mı aldın? Sen bir kahramansın! 🦸",
      "Bugün de disiplini bozmadın! 🎯", "Hap hap hap! Sağlık yolunda emin adımlar! 🚀",
      "İlaçların seni seviyor! 💚", "Bi' hap daha gitti! Düzenli kullanım = süper güç! 💪",
      "Check! Sağlık rutinin bomba! 💣", "Bugün formundasın! ✨",
      "İlaç aldın, gönül aldın! Vücudun teşekkür ediyor 🙏", "Doktorun görse gurur duyardı! 👨‍⚕️",
      "Tamam, bi tane daha gitti! Kolay gelsin! 😎", "İlaç? Alındı. Sen? Muhteşemsin! 🌟", "Sağlık bar'ın doldu! +10 HP! 🎮",
    ],
  },
  "msg.allMedsDone": {
    en: [
      "🎉 All meds taken! You're a legend!",
      "🏆 Perfect score! Nothing missed! Bravo!",
      "💯 100% complete! Boss fight won!",
      "🌟 All done! Health level up!",
    ],
    tr: [
      "🎉 Bugünkü tüm ilaçlarını aldın! Sen bir efsanesin!",
      "🏆 Tam puan! Bugün eksiksiz! Bravo!",
      "💯 %100 tamamlama! Boss fight kazanıldı!",
      "🌟 Hepsini hallettin! Sağlık level atladın!",
    ],
  },
}

// ══════════════════════════════════════════
// New Feature Navigation Keys (Phase C-F)
// ══════════════════════════════════════════
const newNavKeys: Record<string, TranslationEntry> = {
  "nav.notifications": { en: "Notifications", tr: "Bildirimler" },
  "nav.timeCapsule": { en: "Time Capsule", tr: "Zaman Kapsülü" },
  "nav.healthDiary": { en: "Health Diary", tr: "Sağlık Günlüğü" },
  "nav.biomarkerTrends": { en: "Biomarker Trends", tr: "Biyobelirteç Trendleri" },
  "nav.drugTiming": { en: "Drug Timing Matrix", tr: "İlaç Zamanlama Matrisi" },
  "nav.medSchedule": { en: "Medication Schedule", tr: "İlaç Saat Planı" },
  "nav.medicationHub": { en: "Medication Hub", tr: "İlaç Merkezi" },
  "nav.healthGuides": { en: "Health Guides", tr: "Sağlık Rehberleri" },
  "nav.polypharmacy": { en: "Polypharmacy Risk", tr: "Polifarmasi Riski" },
  "nav.medLog": { en: "Medication Log", tr: "İlaç Değişiklik Günlüğü" },
  "nav.healthRadar": { en: "Health Radar", tr: "Sağlık Radarı" },
  "nav.healthTimeline": { en: "Health Timeline", tr: "Sağlık Zaman Çizelgesi" },
  "nav.microHabits": { en: "Micro Habits", tr: "Mikro Alışkanlıklar" },
  "nav.migraineDashboard": { en: "Migraine Dashboard", tr: "Migren Paneli" },
  "nav.seasonalFood": { en: "Seasonal Food Map", tr: "Mevsimsel Besin Haritası" },
  "nav.foodPrep": { en: "Food Prep Guide", tr: "Besin Hazırlama Rehberi" },
  "nav.fastingMonitor": { en: "Fasting Monitor", tr: "Oruç Monitörü" },
  "nav.hajjHealth": { en: "Hajj & Umrah Health", tr: "Hac & Umre Sağlığı" },
  "nav.circadianEating": { en: "Circadian Eating", tr: "Sirkadyen Beslenme" },
  "nav.socialRx": { en: "Social Prescription", tr: "Sosyal Reçete" },
  "nav.peerMentoring": { en: "Peer Mentoring", tr: "Akran Mentorluğu" },
  "nav.drugEquivalent": { en: "Drug Equivalent", tr: "İlaç Muadili" },
  "nav.drugRecall": { en: "Drug Recalls", tr: "İlaç Geri Çağırma" },
  "nav.disasterMode": { en: "Disaster Mode", tr: "Afet Modu" },
  "nav.healthQuiz": { en: "Health Quiz", tr: "Sağlık Bilmecesi" },
  "nav.healthyRecipes": { en: "Healthy Recipes", tr: "Sağlıklı Tarifler" },
  "nav.dataExport": { en: "Export Data (KVKK)", tr: "Veri İndir (KVKK)" },
  "nav.privacyControls": { en: "Privacy Controls", tr: "Gizlilik Kontrolleri" },
  "nav.friendGoals": { en: "Friend Goals", tr: "Arkadaş Hedefleri" },
  "nav.supplementMarketplace": { en: "Supplement Guide", tr: "Takviye Rehberi" },
  "nav.emergencyMode": { en: "Emergency Mode", tr: "Acil Durum Modu" },
  "nav.smartReminders": { en: "Smart Reminders", tr: "Akıllı Hatırlatıcılar" },
  "nav.familySummary": { en: "Family Summary", tr: "Aile Özeti" },
  "nav.weeklyNewsletter": { en: "Weekly Summary", tr: "Haftalık Bülten" },
  "nav.qrProfile": { en: "QR Health Card", tr: "QR Sağlık Kartı" },
  "nav.favSupplements": { en: "Favorite Supplements", tr: "Favori Takviyeler" },
  "nav.certificates": { en: "Certificates", tr: "Sertifikalar" },
  "nav.postIcu": { en: "Post-ICU Recovery", tr: "Yoğun Bakım Sonrası" },
  "nav.organTransplant": { en: "Organ Transplant", tr: "Organ Nakli" },
  "nav.cancerSupport": { en: "Cancer Support", tr: "Kanser Destek" },
  "nav.dialysis": { en: "Dialysis Tracker", tr: "Diyaliz Takibi" },
  "nav.autismSupport": { en: "Autism Support", tr: "Otizm Desteği" },
  "nav.podcasts": { en: "Health Podcasts", tr: "Sağlık Podcastleri" },
  "nav.recipes": { en: "Recipes", tr: "Tarifler" },
  "nav.dataDelete": { en: "Delete Data (KVKK)", tr: "Veri Sil (KVKK)" },
  "nav.bugReport": { en: "Report Bug", tr: "Hata Bildir" },
  "nav.medBuddy": { en: "Med Buddy", tr: "İlaç Arkadaşı" },
  "nav.healthReport": { en: "Health Report Card", tr: "Sağlık Karnesi" },
}
Object.assign(t, newNavKeys)

// ══════════════════════════════════════════
// Referral System
// ══════════════════════════════════════════
const referralKeys: Record<string, TranslationEntry> = {
  "nav.referral": { en: "Referral Program", tr: "Referans Programı" },
  "referral.title": { en: "Doctor Referral Program", tr: "Doktor Referans Programı" },
  "referral.subtitle": { en: "Earn premium credits by referring patients", tr: "Hastaları yönlendirerek premium kredi kazanın" },
  "referral.yourCode": { en: "Your Referral Code", tr: "Referans Kodunuz" },
  "referral.copyCode": { en: "Copy Code", tr: "Kodu Kopyala" },
  "referral.copyLink": { en: "Copy Link", tr: "Linki Kopyala" },
  "referral.copied": { en: "Copied!", tr: "Kopyalandı!" },
  "referral.totalReferred": { en: "Total Referred", tr: "Toplam Yönlendirilen" },
  "referral.activePatients": { en: "Active Patients", tr: "Aktif Hastalar" },
  "referral.creditsEarned": { en: "Credits Earned", tr: "Kazanılan Kredi" },
  "referral.thisMonth": { en: "This Month", tr: "Bu Ay" },
  "referral.howItWorks": { en: "How It Works", tr: "Nasıl Çalışır" },
  "referral.step1": { en: "Share your unique code with patients", tr: "Benzersiz kodunuzu hastalarınızla paylaşın" },
  "referral.step2": { en: "Patient signs up using your code", tr: "Hasta kodunuzla kayıt olur" },
  "referral.step3": { en: "Both of you earn premium credits", tr: "İkiniz de premium kredi kazanırsınız" },
  "referral.generateCode": { en: "Generate My Code", tr: "Kodumu Oluştur" },
  "referral.notVerified": { en: "Get verified as a doctor to access the referral program", tr: "Referans programına erişmek için doktor olarak doğrulanın" },
  "referral.rewards": { en: "Reward Tiers", tr: "Ödül Kademeleri" },
  "referral.tier1": { en: "1 referral = 7 days premium", tr: "1 yönlendirme = 7 gün premium" },
  "referral.tier2": { en: "5 referrals = 14 days premium each", tr: "5 yönlendirme = her biri 14 gün premium" },
  "referral.tier3": { en: "10+ referrals = 30 days premium each", tr: "10+ yönlendirme = her biri 30 gün premium" },
  "referral.shareCode": { en: "Share Code", tr: "Kodu Paylaş" },
  "referral.monthlyBreakdown": { en: "Monthly Breakdown", tr: "Aylık Dağılım" },
  "referral.noReferrals": { en: "No referrals yet. Share your code to get started!", tr: "Henüz yönlendirme yok. Başlamak için kodunuzu paylaşın!" },
  "referral.days": { en: "days", tr: "gün" },

  // Linked Accounts
  "linked.title": { en: "Linked Accounts", tr: "Bağlı Hesaplar" },
  "linked.subtitle": { en: "Manage family members and caregivers", tr: "Aile üyelerini ve bakıcıları yönetin" },
  "linked.addAccount": { en: "Add Linked Account", tr: "Bağlı Hesap Ekle" },
  "linked.email": { en: "Their email address", tr: "E-posta adresi" },
  "linked.relationship": { en: "Relationship", tr: "İlişki" },
  "linked.mother": { en: "Mother", tr: "Anne" },
  "linked.father": { en: "Father", tr: "Baba" },
  "linked.child": { en: "Child", tr: "Çocuk" },
  "linked.spouse": { en: "Spouse", tr: "Eş" },
  "linked.grandparent": { en: "Grandparent", tr: "Büyükebeveyn" },
  "linked.sibling": { en: "Sibling", tr: "Kardeş" },
  "linked.other": { en: "Other", tr: "Diğer" },
  "linked.permissions": { en: "Permissions", tr: "İzinler" },
  "linked.viewData": { en: "View their health data", tr: "Sağlık verilerini görüntüle" },
  "linked.paySubscription": { en: "Pay for their subscription", tr: "Aboneliğini ben ödeyeceğim" },
  "linked.manageMeds": { en: "Manage their medications", tr: "İlaçlarını yönet" },
  "linked.sendInvite": { en: "Send Invite", tr: "Davet Gönder" },
  "linked.pending": { en: "Pending", tr: "Bekliyor" },
  "linked.accepted": { en: "Accepted", tr: "Kabul Edildi" },
  "linked.remove": { en: "Remove", tr: "Kaldır" },
  "linked.inviteSent": { en: "Invite sent!", tr: "Davet gönderildi!" },
  "linked.noAccounts": { en: "No linked accounts yet", tr: "Henüz bağlı hesap yok" },
  "linked.iManage": { en: "People I manage", tr: "Yönettiğim kişiler" },
  "linked.managedBy": { en: "Managed by", tr: "Yöneten" },
  "linked.removeConfirm": { en: "Remove this linked account?", tr: "Bu bağlı hesabı kaldırmak istediğinize emin misiniz?" },

  // Redeem code
  "redeem.title": { en: "Have a referral code?", tr: "Referans kodunuz var mı?" },
  "redeem.placeholder": { en: "Enter code (e.g., DR-AHMET-26)", tr: "Kod girin (örn: DR-AHMET-26)" },
  "redeem.apply": { en: "Apply Code", tr: "Kodu Uygula" },
  "redeem.applied": { en: "Code applied! You'll get bonus credits after signing up.", tr: "Kod uygulandı! Kayıt sonrası bonus kredi alacaksınız." },
  "redeem.invalid": { en: "Invalid referral code", tr: "Geçersiz referans kodu" },
}
Object.assign(t, referralKeys)

// ── Health Analytics & Benchmarking ───────────
const healthAnalyticsKeys: Record<string, TranslationEntry> = {
  "nav.healthAnalytics": { en: "Health Analytics", tr: "Sağlık Analitiği" },
  "analytics2.title": { en: "Health Analytics & Benchmarking", tr: "Sağlık Analitiği & Kıyaslama" },
  "analytics2.subtitle": { en: "Track supplement effects, detect anomalies, compare with peers", tr: "Takviye etkilerini takip edin, anomalileri tespit edin, benzer profillerle kıyaslayın" },
  "analytics2.impactResponse": { en: "Impact-Response", tr: "Etki-Tepki" },
  "analytics2.anomalies": { en: "Anomaly Detection", tr: "Anomali Tespiti" },
  "analytics2.benchmarking": { en: "Benchmarking", tr: "Kıyaslama" },
  "analytics2.predictions": { en: "Predictions", tr: "Tahminler" },
  "analytics2.supplementTimeline": { en: "Supplement Timeline", tr: "Takviye Zaman Çizelgesi" },
  "analytics2.correlations": { en: "Detected Correlations", tr: "Tespit Edilen Korelasyonlar" },
  "analytics2.started": { en: "Started", tr: "Başlangıç" },
  "analytics2.anomalyDetected": { en: "Anomaly Detected", tr: "Anomali Tespit Edildi" },
  "analytics2.expected": { en: "Expected", tr: "Beklenen" },
  "analytics2.actual": { en: "Actual", tr: "Gerçekleşen" },
  "analytics2.possibleCause": { en: "Possible Cause", tr: "Olası Neden" },
  "analytics2.yourPosition": { en: "Your Position", tr: "Konumunuz" },
  "analytics2.peerAverage": { en: "Peer Average", tr: "Benzer Ortalama" },
  "analytics2.topPercent": { en: "Top", tr: "En İyi" },
  "analytics2.comparedWith": { en: "Compared with", tr: "Kıyaslanan" },
  "analytics2.similarProfiles": { en: "similar profiles", tr: "benzer profil" },
  "analytics2.profileMatch": { en: "Profile Match", tr: "Profil Eşleşmesi" },
  "analytics2.projection": { en: "3-Month Projection", tr: "3 Aylık Projeksiyon" },
  "analytics2.confidence": { en: "Confidence", tr: "Güven" },
  "analytics2.whatIf": { en: "What If Simulator", tr: "Ya Eğer Simülatörü" },
  "analytics2.addOmega3": { en: "If you add Omega-3", tr: "Omega-3 eklerseniz" },
  "analytics2.aiInsights": { en: "AI Insights", tr: "AI Görüşleri" },
  "analytics2.generateInsights": { en: "Generate AI Insights", tr: "AI Görüşleri Oluştur" },
  "analytics2.loginRequired": { en: "Sign in to access health analytics", tr: "Sağlık analitiğine erişmek için giriş yapın" },
}
Object.assign(t, healthAnalyticsKeys)

// ══════════════════════════════════════════
// Value-Based Marketplace
// ══════════════════════════════════════════
const valueMarketplaceKeys: Record<string, TranslationEntry> = {
  "nav.valueMarketplace": { en: "Value Marketplace", tr: "Deger Pazaryeri" },
  "value.title": { en: "Value-Based Marketplace", tr: "Deger Odakli Pazaryeri" },
  "value.subtitle": { en: "Pay for outcomes, not just products", tr: "Sadece urune degil, sonuca odeme yapin" },
  "value.marketplace": { en: "Marketplace", tr: "Pazaryeri" },
  "value.productDetail": { en: "Product Detail", tr: "Urun Detayi" },
  "value.escrow": { en: "My Escrow Accounts", tr: "Guvence Hesaplarim" },
  "value.riskReward": { en: "Risk & Reward", tr: "Risk & Odul" },
  "value.valueScore": { en: "Value Score", tr: "Deger Puani" },
  "value.sortBy": { en: "Sort by", tr: "Sirala" },
  "value.successRate": { en: "Success Rate", tr: "Basari Orani" },
  "value.evidenceGrade": { en: "Evidence", tr: "Kanit" },
  "value.standardPrice": { en: "Standard Price", tr: "Standart Fiyat" },
  "value.valuePrice": { en: "Value Price", tr: "Deger Fiyati" },
  "value.outcomePrice": { en: "Outcome-Based", tr: "Sonuc Odakli" },
  "value.guarantee": { en: "Outcome Guarantee", tr: "Sonuc Garantisi" },
  "value.escrowPeriod": { en: "Evaluation Period", tr: "Değerlendirme Suresi" },
  "value.refundPercent": { en: "Refund if no improvement", tr: "Iyilesme olmazsa iade" },
  "value.smartContract": { en: "Smart Contract", tr: "Akilli Sozlesme" },
  "value.kpiTargets": { en: "KPI Targets", tr: "KPI Hedefleri" },
  "value.baseline": { en: "Baseline", tr: "Baslangic" },
  "value.target": { en: "Target", tr: "Hedef" },
  "value.actual": { en: "Actual", tr: "Gerceklesen" },
  "value.held": { en: "Held", tr: "Tutulan" },
  "value.released": { en: "Released", tr: "Serbest" },
  "value.refunded": { en: "Refunded", tr: "Iade" },
  "value.providerBonus": { en: "Provider Bonus", tr: "Saglayici Bonusu" },
  "value.goldProvider": { en: "Gold Provider", tr: "Altin Saglayici" },
  "value.howItWorks": { en: "How Escrow Works", tr: "Guvence Nasil Calisir" },
  "value.step1": { en: "Purchase with escrow protection", tr: "Guvence korumasiyla satin alin" },
  "value.step2": { en: "System monitors your health metrics", tr: "Sistem sağlık metriklerinizi izler" },
  "value.step3": { en: "AI evaluates improvement at evaluation date", tr: "AI değerlendirme tarihinde iyilesmeyi değerlendirir" },
  "value.step4": { en: "Payment released or refund initiated", tr: "Odeme serbest birakilir veya iade baslatilir" },
  "value.viewDetails": { en: "View Details", tr: "Detaylari Gor" },
  "value.buyStandard": { en: "Buy Standard", tr: "Standart Satin Al" },
  "value.buyValue": { en: "Buy Value", tr: "Deger Fiyatiyla Al" },
  "value.buyOutcome": { en: "Buy with Guarantee", tr: "Garantili Satin Al" },
  "value.formula": { en: "Value Score Formula", tr: "Deger Puani Formulu" },
  "value.loginRequired": { en: "Sign in to access the marketplace", tr: "Pazaryerine erismek için giris yapin" },
}
Object.assign(t, valueMarketplaceKeys)

// ══════════════════════════════════════════
// Common / Shared Tool Keys
// ══════════════════════════════════════════
const commonToolKeys: Record<string, TranslationEntry> = {
  // Auth
  "common.loginToUse": { en: "Please log in to use this tool", tr: "Bu aracı kullanmak için giriş yapın" },
  "common.loginToUse2": { en: "Please sign in to use this tool.", tr: "Bu aracı kullanmak için giriş yapın." },
  "common.signIn": { en: "Sign In", tr: "Giriş Yap" },
  // Actions
  "common.save": { en: "Save", tr: "Kaydet" },
  "common.saving": { en: "Saving...", tr: "Kaydediliyor..." },
  "common.cancel": { en: "Cancel", tr: "İptal" },
  "common.delete": { en: "Delete", tr: "Sil" },
  "common.edit": { en: "Edit", tr: "Düzenle" },
  "common.add": { en: "Add", tr: "Ekle" },
  "common.analyze": { en: "Analyze", tr: "Analiz Et" },
  "common.analyzing": { en: "Analyzing...", tr: "Analiz ediliyor..." },
  "common.generate": { en: "Generate", tr: "Oluştur" },
  "common.generating": { en: "Generating plan...", tr: "Plan oluşturuluyor..." },
  "common.search": { en: "Search", tr: "Ara" },
  "common.reset": { en: "Reset", tr: "Sıfırla" },
  "common.refresh": { en: "Refresh", tr: "Yenile" },
  "common.download": { en: "Download", tr: "İndir" },
  "common.share": { en: "Share", tr: "Paylaş" },
  "common.back": { en: "Back", tr: "Geri" },
  "common.next": { en: "Next", tr: "İleri" },
  "common.submit": { en: "Submit", tr: "Gönder" },
  "common.loading": { en: "Loading...", tr: "Yükleniyor..." },
  "common.showMore": { en: "Show More", tr: "Daha Fazla" },
  "common.showLess": { en: "Show Less", tr: "Daha Az" },
  // Common labels
  "common.date": { en: "Date", tr: "Tarih" },
  "common.time": { en: "Time", tr: "Saat" },
  "common.duration": { en: "Duration", tr: "Süre" },
  "common.notes": { en: "Notes", tr: "Notlar" },
  "common.notesOptional": { en: "Notes (optional)...", tr: "Notlar (opsiyonel)..." },
  "common.type": { en: "Type", tr: "Tür" },
  "common.status": { en: "Status", tr: "Durum" },
  "common.name": { en: "Name", tr: "Ad" },
  "common.description": { en: "Description", tr: "Açıklama" },
  "common.category": { en: "Category", tr: "Kategori" },
  "common.all": { en: "All", tr: "Tümü" },
  "common.yes": { en: "Yes", tr: "Evet" },
  "common.no": { en: "No", tr: "Hayır" },
  "common.age": { en: "Age", tr: "Yaş" },
  "common.gender": { en: "Gender", tr: "Cinsiyet" },
  "common.male": { en: "Male", tr: "Erkek" },
  "common.female": { en: "Female", tr: "Kadın" },
  "common.days": { en: "days", tr: "gün" },
  "common.minutes": { en: "minutes", tr: "dakika" },
  "common.min": { en: "min", tr: "dk" },
  "common.hours": { en: "hours", tr: "saat" },
  // Medical common
  "common.sources": { en: "Sources", tr: "Kaynaklar" },
  "common.recommendations": { en: "Recommendations", tr: "Öneriler" },
  "common.symptoms": { en: "Symptoms", tr: "Semptomlar" },
  "common.supplements": { en: "Supplements", tr: "Takviyeler" },
  "common.supplementSuggestions": { en: "Supplement Suggestions", tr: "Takviye Önerileri" },
  "common.evidence": { en: "Evidence", tr: "Kanıt" },
  "common.seeDoctor": { en: "See a Doctor If", tr: "Doktora Başvurun" },
  "common.whenToSeeDoctor": { en: "When to See a Doctor", tr: "Doktora Ne Zaman Gidin" },
  "common.medicationEffects": { en: "Medication Effects", tr: "İlaç Etkileri" },
  "common.labInterpretation": { en: "Lab Interpretation", tr: "Laboratuvar Yorumlama" },
  "common.exerciseRecs": { en: "Exercise Recommendations", tr: "Egzersiz Önerileri" },
  "common.caution": { en: "Caution", tr: "Dikkat" },
  "common.showAnalysis": { en: "Show Analysis", tr: "Analizi Göster" },
  "common.hideAnalysis": { en: "Hide Analysis", tr: "Analizi Gizle" },
  // Risk levels
  "common.high": { en: "High", tr: "Yüksek" },
  "common.moderate": { en: "Moderate", tr: "Orta" },
  "common.low": { en: "Low", tr: "Düşük" },
  "common.good": { en: "Good", tr: "İyi" },
  "common.severe": { en: "Severe", tr: "Şiddetli" },
  "common.highRisk": { en: "High Risk", tr: "Yüksek Risk" },
  "common.moderateRisk": { en: "Moderate Risk", tr: "Orta Risk" },
  "common.lowRisk": { en: "Low Risk", tr: "Düşük Risk" },
  "common.atRisk": { en: "At Risk", tr: "Risk" },
  "common.normal": { en: "Normal", tr: "Normal" },
  // Locale
  "common.locale": { en: "en-US", tr: "tr-TR" },
  // Common page-level keys used across many pages
  "common.profile": { en: "Profile", tr: "Profil" },
  "common.connecting": { en: "Connecting...", tr: "Bağlanıyor..." },
  "common.comingSoon": { en: "Coming Soon", tr: "Yakında" },
  "common.selectAll": { en: "Select All", tr: "Tümünü Seç" },
  "common.clear": { en: "Clear", tr: "Temizle" },
  "common.continue": { en: "Continue", tr: "Devam Et" },
  "common.confirm": { en: "Confirm", tr: "Onayla" },
  "common.records": { en: "records", tr: "kayıt" },
  "common.online": { en: "Online", tr: "Çevrimiçi" },

  // ── addiction-recovery page ──
  "addictionRecovery.crisisLine": { en: "SAMHSA: 1-800-662-4357", tr: "Kriz Hattı: 182" },
  "addictionRecovery.substanceBehavior": { en: "Substance/Behavior", tr: "Madde/Davranis" },
  "addictionRecovery.cravingHigh": { en: "Craving is very high. Call your sponsor or attend a meeting.", tr: "Istek cok yüksek. Destekcinizi arayın veya bir toplantiya gidin." },
  "addictionRecovery.todaysTriggers": { en: "Today's Triggers", tr: "Bugunun Tetikleyicileri" },
  "addictionRecovery.supportUsed": { en: "Support Used", tr: "Kullanilan Destek" },
  "addictionRecovery.relapseRisk": { en: "I feel at risk of relapse", tr: "Nobet riski hissediyorum" },
  "addictionRecovery.getSupport": { en: "Get Support", tr: "Destek Al" },
  "addictionRecovery.nextMilestone": { en: "Next milestone", tr: "Sonraki hedef" },
  "addictionRecovery.daysToGo": { en: "days to go", tr: "gun kaldi" },
  "addictionRecovery.cravingAnalysis": { en: "Craving Analysis", tr: "Istek Analizi" },
  "addictionRecovery.copingStrategies": { en: "Coping Strategies", tr: "Basa Cikma Stratejileri" },
  "addictionRecovery.healthBenefits": { en: "Health Benefits", tr: "Sağlık Kazanimlari" },
  "addictionRecovery.supportLines": { en: "Support Lines", tr: "Destek Hatlari" },

  // ── adhd-management page ──
  "adhd.caffeineStimulant": { en: "Caffeine - Stimulant Interaction", tr: "Kafein - Stimulan Etkileşimi" },
  "adhd.cantFocus": { en: "Can't focus", tr: "Odaklanamiyorum" },
  "adhd.laserFocused": { en: "Laser focused", tr: "Lazer odak" },
  "adhd.distractionEvents": { en: "Distraction Events", tr: "Dikkat Dagitma Sayisi" },
  "adhd.medEffectiveness": { en: "Medication Effectiveness", tr: "İlaç Etkinliği" },
  "adhd.sleepHrs": { en: "Sleep (hrs)", tr: "Uyku (saat)" },
  "adhd.caffeineCups": { en: "Caffeine (cups)", tr: "Kafein (bardak)" },
  "adhd.exercise": { en: "Exercise?", tr: "Egzersiz?" },
  "adhd.focusAnalysis": { en: "Focus Analysis", tr: "Odaklanma Analizi" },
  "adhd.productivityTips": { en: "Productivity Tips", tr: "Verimlilik Ipuclari" },
  "adhd.environmentTips": { en: "Environment Tips", tr: "Çevre Önerileri" },
  "adhd.sleepImpact": { en: "Sleep Impact", tr: "Uyku Etkisi" },
  "adhd.exerciseImpact": { en: "Exercise Impact", tr: "Egzersiz Etkisi" },

  // ── air-quality page ──
  "air.enterAqi": { en: "Enter Your AQI Value", tr: "AQI Değerinizi Girin" },
  "air.findAqi": { en: "Find your local AQI from airnow.gov, aqicn.org, or local sources.", tr: "Yerel hava kalitesi endeksini airnow.gov, aqicn.org veya yerel kaynaklardan ogreneblirsiniz." },
  "air.check": { en: "Check", tr: "Kontrol Et" },
  "air.generalAdvice": { en: "General Advice", tr: "Genel Tavsiye" },
  "air.asthmaCopd": { en: "Asthma / COPD", tr: "Astim / KOAH" },
  "air.exercise": { en: "Exercise", tr: "Egzersiz" },
  "air.maskGuidance": { en: "Mask Guidance", tr: "Maske Rehberi" },
  "air.referenceTable": { en: "AQI Reference Table", tr: "AQI Referans Tablosu" },

  // ── alcohol-tracker page ──
  "alcohol.units": { en: "units", tr: "birim" },
  "alcohol.unitsPerWeek": { en: "units/week", tr: "birim/hafta" },
  "alcohol.newCheck": { en: "New Check", tr: "Yeni Kontrol" },

  // ── allergy-map page ──
  "allergy.emergencyCardCopied": { en: "Emergency card copied to clipboard!", tr: "Alerji karti panoya kopyalandi!" },
  "allergy.emergencyCard": { en: "Emergency Card", tr: "Acil Kart" },
  "allergy.supplement": { en: "Supplement", tr: "Takviye" },
  "allergy.save": { en: "Save", tr: "Kaydet" },
  "allergy.conflictsFound": { en: "Conflicts Found", tr: "Çatışmalar Bulundu" },
  "allergy.warnings": { en: "Warnings", tr: "Uyarılar" },
  "allergy.noRecords": { en: "No allergies recorded yet", tr: "Henuz alerji kaydedilmedi" },
  "allergy.doctor": { en: "Dr.", tr: "Doktor" },
  "allergy.triggerPlaceholder": { en: "e.g. Penicillin, Peanuts, Dust...", tr: "orn. Penisilin, Findik, Toz..." },

  // ── anti-inflammatory page ──
  "antiinflam.inflammationScore": { en: "Inflammation Score", tr: "Iltihap Skoru" },
  "antiinflam.ratio": { en: "Ratio", tr: "Orani" },
  "antiinflam.crpAnalysis": { en: "Analysis", tr: "Analizi" },
  "antiinflam.inflammatoryFoods": { en: "Inflammatory Foods", tr: "Iltihap Yapici Gidalar" },
  "antiinflam.alreadyDoingWell": { en: "Already Doing Well", tr: "Zaten Iyi Yaptiginiz" },
  "antiinflam.spicesHerbs": { en: "Anti-Inflammatory Spices & Herbs", tr: "Anti-Inflamatuar Baharat & Bitkiler" },
  "antiinflam.sampleMealPlan": { en: "Sample Meal Plan", tr: "Ornek Menu" },
  "antiinflam.dietPlaceholder": { en: "e.g., Breakfast: toast, cheese, tea. Lunch: pasta, salad. Dinner: fried food, rice...", tr: "ornegin: Sabah ekmek, peynir, cay. Ogle makarna, salata. Aksam kizartma, pilav..." },
  "antiinflam.optimal": { en: "Optimal", tr: "Optimal" },

  // ── anxiety-toolkit page ──
  "anxiety.highLevel": { en: "Your anxiety level is very high. Please seek professional support.", tr: "Kaygi seviyeniz cok yüksek. Lütfen profesyonel destek alin." },
  "anxiety.moderateLevel": { en: "Your anxiety level is moderate-high. We recommend speaking with a mental health professional.", tr: "Kaygi seviyeniz orta-yüksek. Bir ruh sağlığı uzmaniyla görüşmenizi oneririz." },
  "anxiety.panicModeNote": { en: "Panic mode will show immediate grounding protocol.", tr: "Panik atak modunda hemen topraklama protokolu gosterilecektir." },
  "anxiety.minimal": { en: "Minimal", tr: "Minimum" },
  "anxiety.severe": { en: "Severe", tr: "Siddetli" },
  "anxiety.gad7Optional": { en: "(Optional)", tr: "(Istege Bagli)" },
  "anxiety.gad7Intro": { en: "Over the last 2 weeks, how often have you been bothered by the following?", tr: "Son 2 hafta icinde asagidaki sorunlardan ne siklukla rahatsiz oldunuz?" },
  "anxiety.loading": { en: "Loading...", tr: "Yükleniyor..." },
  "anxiety.severity": { en: "Severity", tr: "Siddet" },
  "anxiety.copingTechniques": { en: "Coping Techniques", tr: "Basa Cikma Teknikleri" },
  "anxiety.cognitiveDistortions": { en: "Cognitive Distortions", tr: "Bilissel Carpitmalar" },

  // ── appointment-prep page ──
  "appt.currentMedications": { en: "Current Medications", tr: "Mevcut Ilaclar" },
  "appt.symptomSummary": { en: "Symptom Summary", tr: "Semptom Özeti" },
  "appt.clinicalNotes": { en: "Clinical Notes", tr: "Klinik Notlar" },
  "appt.newSummary": { en: "New Summary", tr: "Yeni Ozet" },

  // ── ar-scanner page ──
  "ar.webxrScanner": { en: "WebXR-Based Drug Scanner", tr: "WebXR Tabanli İlaç Tarayıcı" },
  "ar.webxrDesc": { en: "Augmented reality experience running directly from your browser — no app required", tr: "Ek uygulama gerektirmeden tarayicinizdan calisan artirilmis gerçeklik deneyimi" },
  "ar.howItWorks": { en: "How It Will Work", tr: "Nasil Calisacak?" },
  "ar.capabilities": { en: "Capabilities", tr: "Yetenekler" },
  "ar.browserNote": { en: "AR Scanner will work on modern browsers supporting WebXR API. iOS Safari support may be limited.", tr: "AR Tarayıcı WebXR API destekleyen modern tarayicilarda calisacaktir. iOS Safari desteği sinirli olabilir." },

  // ── autism-support page ──
  "autism.title": { en: "Autism Support Center", tr: "Otizm Destek Merkezi" },
  "autism.subtitle": { en: "Daily tracking and support tools for parents", tr: "Ebeveynler için gunluk takip ve destek araclari" },
  "autism.routineTracker": { en: "Routine Tracker", tr: "Rutin Takip" },
  "autism.sensoryTriggers": { en: "Sensory Triggers", tr: "Duyusal Tetikler" },
  "autism.therapyCalendar": { en: "Therapy Calendar", tr: "Terapi Takvimi" },
  "autism.behavioralNotes": { en: "Behavioral Notes", tr: "Davranis Notlari" },
  "autism.resources": { en: "Resources", tr: "Kaynaklar" },
  "autism.dailyProgress": { en: "Daily Progress", tr: "Günlük İlerleme" },
  "autism.completed": { en: "completed", tr: "tamamlandi" },
  "autism.sensoryTriggerProfile": { en: "Sensory Trigger Profile", tr: "Duyusal Tetikleyiciler" },
  "autism.sensoryTriggerDesc": { en: "Track known triggers and prepare for new environments.", tr: "Bilinen tetikleyicileri takip edin." },
  "autism.addTrigger": { en: "Add new trigger", tr: "Yeni tetikleyici ekle" },
  "autism.weeklyTherapy": { en: "Weekly Therapy Schedule", tr: "Haftalık Terapi Programı" },
  "autism.occupationalTherapy": { en: "Occupational Therapy", tr: "Mesleki Terapi" },
  "autism.speechTherapy": { en: "Speech Therapy", tr: "Konusma Terapisi" },
  "autism.abaTherapy": { en: "ABA Therapy", tr: "ABA Terapi" },
  "autism.perWeek": { en: "week", tr: "hafta" },
  "autism.addNote": { en: "Add New Note", tr: "Yeni Not Ekle" },
  "autism.writeObservations": { en: "Write observations...", tr: "Bugünün notlarını yazın..." },
  "autism.visualSchedule": { en: "Visual Schedule Builder", tr: "Gorsel Program Oluşturucu" },
  "autism.visualScheduleDesc": { en: "Create daily schedules with visual cards", tr: "Gorsel kartlarla gunluk program" },
  "autism.socialStories": { en: "Social Story Templates", tr: "Sosyal Hikaye Sablonlari" },
  "autism.socialStoriesDesc": { en: "Preparation stories for new situations", tr: "Yeni durumlara hazirlama" },
  "autism.calmingStrategies": { en: "Calming Strategies", tr: "Sakinlesme Stratejileri" },
  "autism.calmingStrategiesDesc": { en: "Techniques for sensory overload", tr: "Duyusal yuklenme için teknikler" },
  "autism.parentCommunity": { en: "Parent Community", tr: "Ebeveyn Toplulugu" },
  "autism.parentCommunityDesc": { en: "Share experiences with families", tr: "Ailelerle deneyim paylasin" },
  "autism.iepTracker": { en: "IEP Goal Tracker", tr: "IEP / BEP Takipci" },
  "autism.iepTrackerDesc": { en: "Track education plan goals", tr: "Bireysel egitimplanı hedefleri" },
  "autism.therapyProgress": { en: "Therapy Progress Report", tr: "Terapi İlerleme Raporu" },
  "autism.therapyProgressDesc": { en: "Progress summary for therapists", tr: "Terapistler için ilerleme ozeti" },

  // ── Biomarker Trends ──
  "biomarkerTrends.title": { en: "Biomarker Trends", tr: "Biyobelirteç Trendleri" },
  "biomarkerTrends.subtitle": { en: "Track all your lab results over time", tr: "Tüm tahlil sonuçlarını zaman içinde takip et" },
  "biomarkerTrends.allCategories": { en: "All Categories", tr: "Tüm Kategoriler" },
  "biomarkerTrends.noData": { en: "No lab results yet. Upload a blood test to get started.", tr: "Henüz tahlil sonucu yok. Başlamak için kan tahlili yükleyin." },
  "biomarkerTrends.latest": { en: "Latest", tr: "Son" },
  "biomarkerTrends.previous": { en: "Previous", tr: "Önceki" },
  "biomarkerTrends.change": { en: "Change", tr: "Değişim" },
  "biomarkerTrends.testResults": { en: "test results", tr: "test sonucu" },
  "biomarkerTrends.history": { en: "History", tr: "Geçmiş" },
  "biomarkerTrends.loading": { en: "Loading biomarkers...", tr: "Biyobelirteçler yükleniyor..." },
  "biomarkerTrends.uploadBloodTest": { en: "Upload Blood Test", tr: "Kan Tahlili Yükle" },

  // ── Caffeine Tracker ──
  "caffeineTracker.newCheck": { en: "New Check", tr: "Yeni Kontrol" },

  // ── Cancer Screening ──
  "cancerScreening.smokingHistory": { en: "Smoking History", tr: "Sigara Geçmişi" },
  "cancerScreening.never": { en: "Never", tr: "Hic" },
  "cancerScreening.former": { en: "Former smoker", tr: "Birakmis" },
  "cancerScreening.current": { en: "Current smoker", tr: "Aktif" },
  "cancerScreening.heavy": { en: "Heavy (20+ years)", tr: "Agir (20+ yil)" },
  "cancerScreening.familyHistory": { en: "Family Cancer History", tr: "Ailede Kanser Geçmişi" },
  "cancerScreening.generating": { en: "Generating schedule...", tr: "Takvim oluşturuluyor..." },
  "cancerScreening.riskLevel": { en: "Risk Level:", tr: "Risk Seviyesi:" },
  "cancerScreening.screeningSchedule": { en: "Personalized Screening Schedule", tr: "Kişisel Tarama Takvimi" },
  "cancerScreening.startAge": { en: "Start age:", tr: "Başlangıç yasi:" },
  "cancerScreening.familyRisk": { en: "Family History Risk Analysis", tr: "Aile Geçmişi Risk Analizi" },
  "cancerScreening.selfCheck": { en: "Self-Check Reminders", tr: "Oz Kontrol Hatirlaticlari" },
  "cancerScreening.riskReduction": { en: "Risk Reduction Strategies", tr: "Risk Azaltma Stratejileri" },
  "cancerScreening.nextSteps": { en: "Next Steps", tr: "Sonraki Adimlar" },

  // ── Cancer Support ──
  "cancerSupport.badge": { en: "Cancer Treatment Support", tr: "Kanser Tedavi Destegi" },
  "cancerSupport.title": { en: "Cancer Treatment Side Effect Management", tr: "Kanser Tedavisi Yan Etki Yönetimi" },
  "cancerSupport.subtitle": { en: "Guide for managing chemotherapy and radiotherapy side effects, nutrition, supplement safety, and emotional support.", tr: "Kemoterapi ve radyoterapi yan etkilerini yonetmek, beslenme, takviye güvenliği ve duygusal destek için rehber." },
  "cancerSupport.warning": { en: "IMPORTANT: ALWAYS consult your oncology team before starting ANY supplement, herbal product, or diet change during cancer treatment. Many supplements interact with chemotherapy.", tr: "ONEMLI: Kanser tedavisi sirasinda herhangi bir takviye, bitkisel urun veya diyet değişikliği yapmadan ÖNCE mutlaka onkoloji ekibinize danışın. Bircok takviye kemoterapiyle etkilesir." },
  "cancerSupport.footer": { en: "This information is for general guidance. Treatment decisions should always be made together with your oncology team.", tr: "Bu bilgiler genel rehberlik amaclıdır. Tedavi kararlari her zaman onkoloji ekibinizle birlikte alinmalidir." },

  // ── Cardiovascular Risk ──
  "cardioRisk.framingham": { en: "Framingham Risk Calculator", tr: "Framingham Risk Hesaplayici" },
  "cardioRisk.totalCholesterol": { en: "Total Cholesterol (mg/dL)", tr: "Toplam Kolesterol (mg/dL)" },
  "cardioRisk.systolicBP": { en: "Systolic BP (mmHg)", tr: "Sistolik Tansiyon (mmHg)" },
  "cardioRisk.smoker": { en: "Current smoker", tr: "Sigara iciyorum" },
  "cardioRisk.diabetes": { en: "Diabetes", tr: "Diyabet var" },
  "cardioRisk.bpMed": { en: "BP medication", tr: "Tansiyon ilaci" },
  "cardioRisk.lowRisk": { en: "Low Risk", tr: "Düşük Risk" },
  "cardioRisk.moderateRisk": { en: "Moderate Risk", tr: "Orta Risk" },
  "cardioRisk.highRisk": { en: "High Risk", tr: "Yüksek Risk" },
  "cardioRisk.riskEstimate": { en: "Estimated 10-year risk of cardiovascular event (heart attack or stroke):", tr: "Onumuzdeki 10 yil icinde kardiyovasküler olay (kalp krizi veya inme) tahmini risk orani:" },
  "cardioRisk.statinTitle": { en: "Statin Consideration", tr: "Statin Değerlendirmesi" },
  "cardioRisk.statinNote": { en: "statin therapy should be discussed per ACC/AHA guidelines. Talk to your doctor.", tr: "risk skoru ile, ACC/AHA kilavuzlarina gore statin tedavisi tartismalidir. Doktorunuzla görüşün." },
  "cardioRisk.essentialsDesc": { en: "AHA's 8 key measures for heart health. Check the ones you're doing.", tr: "AHA'nin kalp sağlığı için temel 8 adimi. Hangilerini uyguluyor olduğunuzu isaretleyin." },
  "cardioRisk.completed": { en: "completed", tr: "tamamlandi" },

  // ── Certificates ──
  "certificates.title": { en: "Achievement Certificates", tr: "Başarı Sertifikalari" },
  "certificates.subtitle": { en: "Turn your achievements into certificates and share!", tr: "Başarılarini sertifikaya donustur ve paylas!" },
  "certificates.download": { en: "Download", tr: "İndir" },
  "certificates.share": { en: "Share", tr: "Paylas" },
  "certificates.close": { en: "Close", tr: "Kapat" },
  "certificates.generating": { en: "Generating...", tr: "Oluşturuluyor..." },
  "certificates.generate": { en: "Generate Certificate", tr: "Sertifika Oluştur" },
  "certificates.keepTracking": { en: "Keep tracking your health goals to unlock more certificates!", tr: "Daha fazla sertifika kazanmak için sağlık hedeflerini takip etmeye devam et!" },
  "certificates.achievementCert": { en: "CERTIFICATE OF ACHIEVEMENT", tr: "BASARI SERTIFIKASI" },
  "certificates.presentedTo": { en: "This certificate is presented to", tr: "Bu sertifika sunulmustur" },
  "certificates.inRecognition": { en: "in recognition of achieving", tr: "başarısini onurlandirilarak" },
  "certificates.evidenceBased": { en: "Evidence-Based Health", tr: "Kanita Dayali Sağlık" },
  "certificates.defaultUser": { en: "User", tr: "Kullanıcı" },

  // ── Checkup Planner ──
  "checkupPlanner.riskFactors": { en: "Risk Factors", tr: "Risk Faktorleri" },
  "checkupPlanner.annualPlan": { en: "Annual Test Plan", tr: "Yıllık Test Plani" },
  "checkupPlanner.bloodWork": { en: "Blood Work Panel", tr: "Kan Tahlili Paneli" },
  "checkupPlanner.fasting": { en: "Fasting", tr: "Aç karnına" },
  "checkupPlanner.specialists": { en: "Specialist Visits", tr: "Uzman Ziyaretleri" },
  "checkupPlanner.vaccinations": { en: "Vaccinations", tr: "Asilar" },
  "checkupPlanner.costTips": { en: "Cost-Saving Tips", tr: "Maliyet Tasarrufu Ipuclari" },

  // ── Child Health ──
  "childHealth.urgent": { en: "Urgent - Seek Immediate Medical Attention", tr: "Acil - Hemen Doktora Başvurun" },
  "childHealth.seeDoctor": { en: "We Recommend Seeing a Doctor", tr: "Doktora Danışmanizi Oneririz" },
  "childHealth.homeCare": { en: "Home Care May Be Sufficient", tr: "Evde Bakim Yeterli Olabilir" },
  "childHealth.loginNote": { en: "Sign in to save your query history", tr: "Kaydı tutmak için giriş yapın" },
  "childHealth.additionalNotes": { en: "Additional Notes (optional)", tr: "Ek Notlar (isteğe bağlı)" },
  "childHealth.notesPlaceholder": { en: "Symptoms, duration, other details...", tr: "Belirtiler, sure, diger detaylar..." },
  "childHealth.possibleExplanations": { en: "Possible Explanations", tr: "Olasi Nedenler" },
  "childHealth.common": { en: "Common", tr: "Yaygin" },
  "childHealth.lessCommon": { en: "Less Common", tr: "Daha Az Yaygin" },
  "childHealth.rare": { en: "Rare", tr: "Nadir" },
  "childHealth.homeCareSection": { en: "Home Care", tr: "Evde Bakim" },
  "childHealth.whenToWorry": { en: "When to Worry", tr: "Ne Zaman Endiselenin" },
  "childHealth.developmental": { en: "Developmental Context", tr: "Gelisim Bilgisi" },
  "childHealth.prevention": { en: "Prevention", tr: "Onleme" },
  "childHealth.newSearch": { en: "New Search", tr: "Yeni Arama" },

  // ── Chronic Care ──
  "chronicCare.fromProfile": { en: "From your profile", tr: "Profilinizdeki hastalıklar" },
  "chronicCare.analyze": { en: "Analyze", tr: "Analiz et" },
  "chronicCare.adherenceScore": { en: "Adherence Score", tr: "Tedavi Uyumu" },
  "chronicCare.target": { en: "Target", tr: "Hedef" },
  "chronicCare.nextSteps": { en: "Next Steps", tr: "Sonraki Adimlar" },
  "chronicCare.analyzeAnother": { en: "Analyze another condition", tr: "Baska bir hastalık analiz et" },

  // ── Circadian Eating ──
  "circadianEating.title": { en: "Circadian Meal Timing", tr: "Sirkadyen Yemek Zamanlama" },
  "circadianEating.subtitle": { en: "WHEN you eat matters as much as WHAT you eat", tr: "Ne yediğin kadar NE ZAMAN yediğin önemli" },
  "circadianEating.caffeineCutoff": { en: "Caffeine Cutoff", tr: "Kafein Kesim Saati" },
  "circadianEating.noCaffeineAfter": { en: "no caffeine after this time", tr: "bu saatten sonra kafein yok" },
  "circadianEating.lastMeal": { en: "Last Meal", tr: "Son Yemek" },
  "circadianEating.beforeBed": { en: "at least 3 hours before bed", tr: "yatmadan en az 3 saat önce" },
  "circadianEating.medicationTiming": { en: "Medication Timing", tr: "İlaç Zamanlaması" },
  "circadianEating.reviewMedTiming": { en: "If you change meal times, review medication timing too", tr: "Yemek zamanlarını değiştirirsen ilaç saatlerini de gözden geçir" },
  "circadianEating.evidence": { en: "📚 Evidence: Circadian nutrition research shows late-night eating increases metabolic syndrome risk by 40% (Cell Metabolism 2022). Chronotype-aligned eating improves weight management and sleep quality.", tr: "📚 Kanıt: Sirkadyen beslenme araştırmaları, geç saatlerde yemenin metabolik sendrom riskini %40 artırdığını gösteriyor (Cell Metabolism 2022). Kronotipin göre beslenme kilo yönetimi ve uyku kalitesini iyileştirir." },

  // ── Circadian Rhythm ──
  "circadian.morningType": { en: "Morning Type", tr: "Sabah Tipi" },
  "circadian.earlyRiser": { en: "Early riser", tr: "Erken kalkan" },
  "circadian.eveningType": { en: "Evening Type", tr: "Aksam Tipi" },
  "circadian.nightOwl": { en: "Night owl", tr: "Gec yatan" },
  "circadian.optimalSchedule": { en: "Optimal Daily Schedule", tr: "Optimal Günlük Program" },
  "circadian.shiftWorkers": { en: "For Shift Workers", tr: "Vardiyali Calisanlar Icin" },
  "circadian.lightTherapy": { en: "Light Therapy & SAD", tr: "Isik Terapisi & SAD" },

  // ── Clinical Tests ──
  "clinicalTests.title": { en: "Clinical Assessment Tests", tr: "Klinik Değerlendirme Testleri" },
  "clinicalTests.subtitle": { en: "Internationally validated standard clinical screening tests. Every result is backed by scientific references.", tr: "Uluslararası geçerliliği olan standart klinik tarama testleri. Her sonuç bilimsel referanslarla desteklenir." },
  "clinicalTests.screeningDisclaimer": { en: "These tests are screening tools and do not replace medical diagnosis. We recommend sharing your results with a healthcare professional.", tr: "Bu testler birer tarama aracıdır ve tıbbi teşhis yerine geçmez. Sonuçlarınızı bir sağlık profesyoneliyle paylaşmanızı öneriyoruz." },
  "clinicalTests.searchPlaceholder": { en: "Search tests...", tr: "Test ara..." },
  "clinicalTests.last": { en: "Last", tr: "Son" },
  "clinicalTests.min": { en: "min", tr: "dk" },
  "clinicalTests.questionShort": { en: "Q", tr: "soru" },
  "clinicalTests.noTestsFound": { en: "No tests found", tr: "Test bulunamadı" },
  "clinicalTests.tests": { en: "tests", tr: "test" },
  "clinicalTests.intlStandards": { en: "International standards", tr: "Uluslararası standartlar" },
  "clinicalTests.free": { en: "Free", tr: "Ücretsiz" },
  "clinicalTests.notFound": { en: "Test not found", tr: "Test bulunamadı" },
  "clinicalTests.notFoundDesc": { en: "This test does not exist.", tr: "Bu test mevcut değil." },
  "clinicalTests.backToTests": { en: "Back to Tests", tr: "Testlere Dön" },
  "clinicalTests.allTests": { en: "All Tests", tr: "Tüm Testler" },
  "clinicalTests.minutes": { en: "minutes", tr: "dakika" },
  "clinicalTests.questions": { en: "questions", tr: "soru" },
  "clinicalTests.howItWorks": { en: "How it works?", tr: "Nasıl çalışır?" },
  "clinicalTests.step1": { en: "You'll see one question per screen", tr: "Her ekranda bir soru göreceksiniz" },
  "clinicalTests.step2": { en: "Select the answer that best fits you", tr: "Size en uygun cevabı seçin" },
  "clinicalTests.step3": { en: "You'll receive a scientific score and guidance at the end", tr: "Sonunda bilimsel puanlama ve yönlendirme alacaksınız" },
  "clinicalTests.startTest": { en: "Start Test", tr: "Teste Başla" },

  // ── Clinical Trials ──
  "trials.conditionPlaceholder": { en: "e.g., Type 2 Diabetes, Rheumatoid Arthritis", tr: "ornegin: Tip 2 Diyabet, Romatoid Artrit" },
  "trials.locationPlaceholder": { en: "e.g., Istanbul, Turkey", tr: "ornegin: Istanbul, Türkiye" },
  "trials.eligibility": { en: "Eligibility", tr: "Uygunluk" },
  "trials.relatedTerms": { en: "Related Search Terms", tr: "Ilgili Arama Terimleri" },

  // ── Contact ──
  "contact.title": { en: "Contact Us", tr: "Bize Ulasin" },
  "contact.subtitle": { en: "Questions, suggestions, or feedback? We'd love to hear from you.", tr: "Sorulariniz, onerileriniz veya geri bildirimleriniz icin bize yazin." },
  "contact.email": { en: "Email", tr: "E-posta" },
  "contact.support": { en: "Support", tr: "Destek" },
  "contact.responseTime": { en: "Response within 24 hours", tr: "24 saat icinde yanit" },
  "contact.location": { en: "Location", tr: "Konum" },
  "contact.messageReceived": { en: "Message received!", tr: "Mesajiniz alindi!" },
  "contact.willGetBack": { en: "We'll get back to you as soon as possible.", tr: "En kisa surede size geri donecegiz." },
  "contact.sendAnother": { en: "Send another message", tr: "Yeni mesaj gonder" },
  "contact.yourName": { en: "Your Name", tr: "Adiniz" },
  "contact.fullName": { en: "Full Name", tr: "Ad Soyad" },
  "contact.subject": { en: "Subject", tr: "Konu" },
  "contact.subjectPlaceholder": { en: "What is this about?", tr: "Konu basliginiz" },
  "contact.yourMessage": { en: "Your Message", tr: "Mesajiniz" },
  "contact.messagePlaceholder": { en: "Write your message here...", tr: "Mesajinizi buraya yazin..." },
  "contact.send": { en: "Send Message", tr: "Gonder" },

  // ── Courses ──
  "courses.title": { en: "Courses & Education", tr: "Eğitimler & Kurslar" },
  "courses.subtitle": { en: "Develop yourself with evidence-based health courses. Phytotherapy, aromatherapy, acupuncture and more.", tr: "Kanıta dayalı sağlık eğitimleriyle kendinizi geliştirin. Fitoterapi, aromaterapi, akupunktur ve daha fazlası." },
  "courses.goToCourse": { en: "Go to Course", tr: "Kursa Git" },
  "courses.comingSoon": { en: "Coming Soon", tr: "Yakında" },
  "courses.disclaimer": { en: "Courses listed on this page are hosted on independent education platforms. Doctopal is not responsible for course content. We may earn a commission from sales through affiliate links.", tr: "Bu sayfadaki kurslar bağımsız eğitim platformlarında yer almaktadır. Doctopal bu kursların içeriklerinden sorumlu değildir. Affiliate bağlantıları üzerinden yapılan satışlardan komisyon alınabilir." },

  // ── Creator Studio ──
  "creatorStudio.addTag": { en: "Add tag...", tr: "Etiket ekle..." },
  "creatorStudio.langLabel": { en: "English", tr: "Türkçe" },
  "creatorStudio.sampleData": { en: "SAMPLE DATA", tr: "ÖRNEK VERİ" },

  // ── Cross Allergy ──
  "crossAllergy.profileHighlight": { en: "Relevant groups highlighted based on your profile allergies.", tr: "Profilinizdeki alerjiler baz alinarak ilgili gruplar vurgulanmistir." },
  "crossAllergy.crossReactiveItems": { en: "cross-reactive items", tr: "capraz reaktif" },
  "crossAllergy.mechanism": { en: "Mechanism", tr: "Mekanizma" },
  "crossAllergy.prevalence": { en: "Prevalence", tr: "Prevalans" },

  // ── Data Delete ──
  "dataDelete.title": { en: "Delete Account", tr: "Hesabi Sil" },
  "dataDelete.subtitle": { en: "GDPR/KVKK right to data deletion", tr: "KVKK kapsaminda veri silme hakki" },
  "dataDelete.accountDeleted": { en: "Account Deleted", tr: "Hesabiniz Silindi" },
  "dataDelete.deletedInfo": { en: "All your data will be permanently deleted within 30 days.", tr: "Tum verileriniz 30 gun icinde kalici olarak silinecektir." },
  "dataDelete.gracePeriod": { en: "day grace period", tr: "gun bekleme suresi" },
  "dataDelete.warning": { en: "Warning: This action is irreversible", tr: "Dikkat: Bu işlem geri alinamaz" },
  "dataDelete.warningDesc": { en: "When you delete your account, all data will be permanently removed.", tr: "Hesabinizi sildiginizde tum veriler kalici olarak silinecektir." },
  "dataDelete.dataToDelete": { en: "Data to be Deleted", tr: "Silinecek Veriler" },
  "dataDelete.exportAlt": { en: "Alternative: Export Data", tr: "Alternatif: Veri İndirme" },
  "dataDelete.exportDesc": { en: "You can download your data before deleting.", tr: "Silmeden once verilerinizi indirebilirsiniz." },
  "dataDelete.exportButton": { en: "Export My Data", tr: "Verilerimi İndir" },
  "dataDelete.continue": { en: "Continue", tr: "Devam Et" },
  "dataDelete.confirmRequired": { en: "Confirmation Required", tr: "Onay Gerekli" },
  "dataDelete.typeDelete": { en: "Type DELETE below to confirm.", tr: "Devam etmek için asagiya DELETE yazın." },
  "dataDelete.codeCorrect": { en: "Confirmation code correct", tr: "Onay kodu doğru" },
  "dataDelete.finalStep": { en: "Final Step", tr: "Son Adim" },
  "dataDelete.finalConfirmation": { en: "Final Confirmation", tr: "Son Onay" },
  "dataDelete.finalDesc": { en: "Clicking this button will mark your account for deletion.", tr: "Bu butona bastiginizda hesabiniz silinmek uzere isaretlenecektir." },
  "dataDelete.understandDelete": { en: "I understand all my data will be permanently deleted.", tr: "Tum verilerimin kalici olarak silinecegini anliyorum." },
  "dataDelete.deleteAccount": { en: "Delete My Account", tr: "Hesabimi Sil" },

  // Doctor Messages
  "doctorMessages.title": { en: "Doctor Messages", tr: "Doktor Mesajlari" },
  "doctorMessages.encrypted": { en: "End-to-end encrypted", tr: "Uctan uca sifrelenmis" },
  "doctorMessages.searchDoctors": { en: "Search doctors...", tr: "Doktor ara..." },
  "doctorMessages.typeMessage": { en: "Type a message...", tr: "Mesaj yazın..." },
  "doctorMessages.selectConversation": { en: "Select a conversation", tr: "Bir konusma secin" },

  // Doctor Prescribe
  "doctorPrescribe.title": { en: "Prescription Assistant", tr: "Recete Asistani" },
  "doctorPrescribe.subtitle": { en: "Dose calculator, interaction check, generic alternatives", tr: "Doz hesaplama, etkilesim kontrolü, jenerik alternatifleri" },
  "doctorPrescribe.searchDrug": { en: "Search Drug", tr: "İlaç Ara" },
  "doctorPrescribe.searchPlaceholder": { en: "Brand or generic name...", tr: "Marka veya etken madde adi..." },
  "doctorPrescribe.doseCalculator": { en: "Dose Calculator", tr: "Doz Hesaplayici" },
  "doctorPrescribe.weight": { en: "Weight (kg)", tr: "Kilo (kg)" },
  "doctorPrescribe.age": { en: "Age", tr: "Yas" },
  "doctorPrescribe.renalFunction": { en: "Renal Function", tr: "Bobrek Fonksiyonu" },
  "doctorPrescribe.calculateDose": { en: "Calculate Dose", tr: "Doz Hesapla" },
  "doctorPrescribe.genericAlternatives": { en: "Generic Alternatives", tr: "Jenerik Alternatifler" },
  "doctorPrescribe.brand": { en: "Brand", tr: "Marka" },
  "doctorPrescribe.generic": { en: "Generic", tr: "Jenerik" },
  "doctorPrescribe.savings": { en: "savings", tr: "tasarruf" },
  "doctorPrescribe.selectDrug": { en: "Select a drug first", tr: "Bir ilac secin" },
  "doctorPrescribe.interactionChecks": { en: "Interaction Checks", tr: "Etkileşim Kontrolleri" },

  // Doctor Referral (additional)
  "referral.verificationDesc": { en: "Once your doctor identity is verified, you can access the referral program.", tr: "Doktor kimliğinizi doğruladıktan sonra referans programına erişebilirsiniz." },
  "referral.goToVerification": { en: "Go to Verification", tr: "Doğrulama Sayfasına Git" },
  "referral.generateTitle": { en: "Generate your referral code", tr: "Referans kodunuzu oluşturun" },
  "referral.generateDesc": { en: "Create a unique referral code to share with your patients and start earning premium credits.", tr: "Hastalarınızla paylaşacağınız benzersiz bir referans kodu oluşturun ve premium kredi kazanmaya başlayın." },
  "referral.rewardsDesc": { en: "The more patients you refer, the more premium credits you earn", tr: "Ne kadar çok yönlendirme yaparsanız, o kadar çok premium kredi kazanırsınız" },

  // Donation
  "donation.bloodCompatibility": { en: "Blood Type Compatibility", tr: "Kan Grubu Uyumlulugu" },
  "donation.canDonateTo": { en: "Can Donate To", tr: "Bagis Yapabilir" },
  "donation.canReceiveFrom": { en: "Can Receive From", tr: "Alabilir" },
  "donation.contraindications": { en: "Medication Contraindications", tr: "İlaç Kontrendikasyonlari" },
  "donation.defer": { en: "DEFER", tr: "ERTELEME" },
  "donation.history": { en: "Donation History", tr: "Bagis Geçmişi" },
  "donation.blood": { en: "Blood", tr: "Kan" },
  "donation.platelet": { en: "Platelet", tr: "Trombosit" },
  "donation.plasma": { en: "Plasma", tr: "Plazma" },
  "donation.noRecords": { en: "No records", tr: "Kayıt yok" },
  "donation.centers": { en: "Donation Centers", tr: "Bagis Merkezleri" },
  "donation.organDonation": { en: "Organ Donation", tr: "Organ Bagisi" },
  "donation.organDesc": { en: "In Turkey, you can register for organ donation through E-Nabiz or at any healthcare facility. One donor can save up to 8 lives.", tr: "Türkiye'de organ bagisi için E-Nabiz uzerinden veya herhangi bir sağlık kurulusunda kayıt yaptirabilirsiniz. Bir donor 8 kisiinin hayatini kurtarabilir." },
  "donation.registerENabiz": { en: "Register on E-Nabiz", tr: "E-Nabiz'da Kayıt Ol" },

  // Dream Diary (additional)
  "dream.medEffects": { en: "Medication-Dream Effects", tr: "İlaç-Ruya Etkileri" },
  "dream.entries": { en: "Entries", tr: "Kayıtlar" },
  "dream.aiAnalysis": { en: "Analysis", tr: "Analizi" },
  "dream.noEntries": { en: "No entries yet. Add your first dream!", tr: "Henuz kayıt yok. Ilk ruyanizi ekleyiniz!" },

  // Drug Equivalent
  "drugEquivalent.title": { en: "Generic Drug Finder", tr: "Jenerik İlaç Bulucu" },
  "drugEquivalent.subtitle": { en: "Find affordable generic alternatives for brand-name drugs", tr: "Marka ilaclar için uygun fiyatli jenerik alternatifleri bulun" },
  "drugEquivalent.search": { en: "Search brand or generic name...", tr: "Marka veya jenerik adi arayın..." },
  "drugEquivalent.brandName": { en: "Brand", tr: "Marka" },
  "drugEquivalent.genericName": { en: "Generic", tr: "Jenerik" },
  "drugEquivalent.alternatives": { en: "Generic Alternatives", tr: "Jenerik Alternatifler" },
  "drugEquivalent.sgkYes": { en: "SGK Covered", tr: "SGK Kapsaminda" },
  "drugEquivalent.sgkNo": { en: "Not SGK Covered", tr: "SGK Kapsaminda Degil" },
  "drugEquivalent.savings": { en: "Monthly Savings", tr: "Aylık Tasarruf" },
  "drugEquivalent.brandPrice": { en: "Brand Price", tr: "Marka Fiyat" },
  "drugEquivalent.genericPrice": { en: "Generic Price", tr: "Jenerik Fiyat" },
  "drugEquivalent.savingsCalc": { en: "Savings Calculator", tr: "Tasarruf Hesaplayici" },
  "drugEquivalent.monthsLabel": { en: "Duration (months)", tr: "Sure (ay)" },
  "drugEquivalent.totalSavings": { en: "Total Savings", tr: "Toplam Tasarruf" },
  "drugEquivalent.yearly": { en: "Yearly Savings", tr: "Yıllık Tasarruf" },
  "drugEquivalent.disclaimer": { en: "Always consult your doctor before switching medications. Generic equivalents contain the same active ingredient but may differ in inactive ingredients.", tr: "İlaç degistirmeden once mutlaka doktorunuza danışın. Jenerik esdegerler ayni etken maddeyi icerir ancak yardımcı maddeler farklılik gosterebilir." },
  "drugEquivalent.noResults": { en: "No drugs found. Try a different search term.", tr: "İlaç bulunamadı. Farkli bir arama terimi deneyin." },
  "drugEquivalent.back": { en: "Back", tr: "Geri" },
  "drugEquivalent.allDrugs": { en: "All Medications", tr: "Tum Ilaclar" },
  "drugEquivalent.results": { en: "results", tr: "sonuc" },
  "drugEquivalent.months": { en: "mo", tr: "ay" },

  // Drug Info (additional)
  "drugInfo.whatItDoes": { en: "What Does It Do?", tr: "Ne Yapar?" },
  "drugInfo.howToTake": { en: "How to Take", tr: "Nasıl Kullanılır?" },
  "drugInfo.sideEffects": { en: "Side Effects", tr: "Yan Etkiler" },
  "drugInfo.common": { en: "Common", tr: "Yaygın" },
  "drugInfo.serious": { en: "Serious", tr: "Ciddi" },
  "drugInfo.rare": { en: "Rare", tr: "Nadir" },
  "drugInfo.interactions": { en: "Interactions", tr: "Etkileşimler" },
  "drugInfo.whenToStop": { en: "When to Stop", tr: "Ne Zaman Kullanmayı Bırakmalı?" },
  "drugInfo.genericVsBrand": { en: "Generic vs Brand", tr: "Jenerik vs Orijinal" },
  "drugInfo.storage": { en: "Storage", tr: "Saklama" },
  "drugInfo.pregnancy": { en: "Pregnancy", tr: "Gebelik" },
  "drugInfo.defaultDisclaimer": { en: "This information does not replace medical advice. Consult your doctor.", tr: "Bu bilgi doktor tavsiyesinin yerine geçmez. Doktorunuza danışın." },
  "drugInfo.enterName": { en: "Enter a drug name", tr: "İlaç adı girin" },

  // Drug Timing
  "drugTiming.title": { en: "Drug Interaction Timing Matrix", tr: "İlaç Etkileşim Zaman Matrisi" },
  "drugTiming.subtitle": { en: "Know exactly when to take each medication for maximum safety and effectiveness", tr: "Her ilacı maksimum güvenlik ve etkinlik için ne zaman alacağını bil" },
  "drugTiming.yourMeds": { en: "Your Medications", tr: "Senin İlaçların" },
  "drugTiming.timingGuide": { en: "Full Timing Guide", tr: "Tam Zamanlama Rehberi" },
  "drugTiming.conflicts": { en: "Timing Conflicts", tr: "Zamanlama Çakışmaları" },
  "drugTiming.hoursApart": { en: "hours apart", tr: "saat arayla" },
  "drugTiming.noMeds": { en: "Add medications to your profile to see personalized timing.", tr: "Kişisel zamanlama görmek için profiline ilaç ekle." },
  "drugTiming.noConflicts": { en: "No timing conflicts detected.", tr: "Zamanlama çakışması tespit edilmedi." },
  "drugTiming.noTimingInfo": { en: "Timing info not available", tr: "Zamanlama bilgisi mevcut değil" },
  "drugTiming.goToProfile": { en: "Go to Profile", tr: "Profil'e Git" },

  // Ear Health (additional)
  "ear.hoursPerDay": { en: "hours/day", tr: "saat/gun" },
  "ear.hearingTestSchedule": { en: "Hearing Test Schedule", tr: "Isitme Testi Takvimi" },

  // Elder Care
  "elderCare.meds": { en: "meds", tr: "ilac" },
  "elderCare.riskLevel": { en: "Risk Level", tr: "Risk Seviyesi" },
  "elderCare.concerns": { en: "Concerns", tr: "Dikkat Edilmesi Gerekenler" },
  "elderCare.timingOptimization": { en: "Timing Optimization", tr: "İlaç Zamanlama" },
  "elderCare.warningSigns": { en: "Warning Signs to Watch", tr: "Izlenmesi Gereken Isaretler" },
  "elderCare.dailyHydration": { en: "Daily Hydration", tr: "Günlük Su Hedefi" },
  "elderCare.riskFactors": { en: "Risk Factors", tr: "Risk Faktorleri" },
  "elderCare.newReview": { en: "New Review", tr: "Yeni İnceleme" },

  // Emergency Contacts
  "emergencyContacts.title": { en: "Emergency Contacts", tr: "Acil Durum Kişileri" },
  "emergencyContacts.subtitle": { en: "People to contact in a health emergency", tr: "Sağlık acilinde ulaşılacak kişiler" },
  "emergencyContacts.add": { en: "Add Contact", tr: "Kişi Ekle" },
  "emergencyContacts.save": { en: "Save", tr: "Kaydet" },
  "emergencyContacts.cancel": { en: "Cancel", tr: "İptal" },
  "emergencyContacts.name": { en: "Full Name", tr: "Ad Soyad" },
  "emergencyContacts.relationship": { en: "Relationship", tr: "Yakınlık Derecesi" },
  "emergencyContacts.phone": { en: "Phone Number", tr: "Telefon Numarası" },
  "emergencyContacts.primary": { en: "Primary Contact", tr: "Birincil Kişi" },
  "emergencyContacts.setPrimary": { en: "Set as primary", tr: "Birincil yap" },
  "emergencyContacts.empty": { en: "No emergency contacts yet. Add someone you trust.", tr: "Henüz acil durum kişisi yok. Güvendiğiniz birini ekleyin." },
  "emergencyContacts.saved": { en: "Saved!", tr: "Kaydedildi!" },
  "emergencyContacts.tip": { en: "Your emergency contacts are shown on your Emergency ID card and can be accessed even without login.", tr: "Acil durum kişileriniz Acil Kimlik kartınızda gösterilir ve giriş yapmadan da erişilebilir." },
  "emergencyContacts.max": { en: "Maximum 5 contacts", tr: "Maksimum 5 kişi" },
  "emergencyContacts.backToProfile": { en: "Profile", tr: "Profil" },
  "emergencyContacts.namePlaceholder": { en: "e.g. John Doe", tr: "Örn: Ahmet Yılmaz" },

  // Emergency ID
  "emergencyId.contactInfo": { en: "Emergency Contact Info", tr: "Acil Durum İletişim Bilgileri" },
  "emergencyId.contactName": { en: "Contact name", tr: "İletişim adi" },
  "emergencyId.phoneNumber": { en: "Phone number", tr: "Telefon numarasi" },
  "emergencyId.cardTitle": { en: "EMERGENCY ID CARD", tr: "ACIL DURUM KIMLIK KARTI" },
  "emergencyId.fullName": { en: "Full Name", tr: "Ad Soyad" },
  "emergencyId.notSpecified": { en: "Not specified", tr: "Belirtilmemis" },
  "emergencyId.dateOfBirth": { en: "Date of Birth", tr: "Dogum Tarihi" },
  "emergencyId.bloodType": { en: "Blood Type", tr: "Kan Grubu" },
  "emergencyId.allergies": { en: "ALLERGIES", tr: "ALERJILER" },
  "emergencyId.medications": { en: "MEDICATIONS", tr: "ILACLAR" },
  "emergencyId.chronicConditions": { en: "CHRONIC CONDITIONS", tr: "KRONIK HASTALIKLAR" },
  "emergencyId.emergencyContact": { en: "Emergency Contact", tr: "Acil Durum İletişimi" },
  "emergencyId.cardTip": { en: "We recommend printing this card and carrying it in your wallet. Data is pulled from your profile.", tr: "Bu karti yazdirup cuzdaninizda tasimanizi oneririz. Veriler profilinizden cekilmistir." },

  // Enterprise - Market Intelligence Hub
  "enterprise.title": { en: "Market Intelligence Hub", tr: "Pazar İstihbarat Merkezi" },
  "enterprise.subtitle": { en: "Investment-focused market data, trend analysis and AI-powered insights for the phytotherapy & biotech sector.", tr: "Fitoterapi ve biyoteknoloji sektorunde yatirim odakli pazar verileri, trend analizi ve AI destekli içerikler." },
  "enterprise.sectorPerformance": { en: "Sector Performance", tr: "Sektor Performansi" },
  "enterprise.growthPct": { en: "Growth (%)", tr: "Büyüme (%)" },
  "enterprise.revenueBn": { en: "Revenue ($B)", tr: "Gelir ($B)" },
  "enterprise.sectorEvents": { en: "Sector Events", tr: "Sektör Olayları" },
  "enterprise.pubmedTrends": { en: "PubMed Publication Trends (12 Months)", tr: "PubMed Yayın Trendi (12 Ay)" },
  "enterprise.earlySignal": { en: "Early Signal", tr: "Erken Sinyal" },
  "enterprise.pubs": { en: "Pubs:", tr: "Yayın:" },
  "enterprise.market": { en: "Market:", tr: "Pazar:" },
  "enterprise.company": { en: "Company", tr: "Şirket" },
  "enterprise.price": { en: "Price", tr: "Fiyat" },
  "enterprise.change": { en: "Change", tr: "Değişim" },
  "enterprise.mktCap": { en: "Mkt Cap", tr: "Pazar Deg." },
  "enterprise.weekRange": { en: "52W Range", tr: "52H Aralık" },
  "enterprise.status": { en: "Status", tr: "Durum" },
  "enterprise.marketCapDist": { en: "Market Cap Distribution", tr: "Pazar Değeri Dağılımı" },
  "enterprise.marketCapLabel": { en: "Market Cap", tr: "Pazar Değeri" },
  "enterprise.searchVsStock": { en: "Search Volume vs Stock Price", tr: "Arama Hacmi vs Hisse Fiyati" },
  "enterprise.searchLabel": { en: "Search", tr: "Arama" },
  "enterprise.priceLabel": { en: "Price ($)", tr: "Fiyat ($)" },
  "enterprise.stockPrice": { en: "Stock Price", tr: "Hisse Fiyati" },
  "enterprise.totalPatents": { en: "Total Patents", tr: "Toplam Patent" },
  "enterprise.granted": { en: "Granted", tr: "Onaylanan" },
  "enterprise.underReview": { en: "Under Review", tr: "İnceleme Altinda" },
  "enterprise.regulatoryUpdates": { en: "Regulatory Updates", tr: "Regülasyon Güncelleme" },
  "enterprise.recentPatents": { en: "Recent Patent Filings", tr: "Son Patent Başvurulari" },
  "enterprise.regulatoryUpdatesList": { en: "Regulatory Updates", tr: "Regülasyon Güncellemeleri" },
  "enterprise.highImpact": { en: "High Impact", tr: "Yüksek Etki" },
  "enterprise.mediumImpact": { en: "Medium Impact", tr: "Orta Etki" },
  "enterprise.lowImpact": { en: "Low Impact", tr: "Düşük Etki" },
  "enterprise.aiAnalysis": { en: "AI Market Analysis", tr: "AI Pazar Analizi" },
  "enterprise.aiDesc": { en: "Claude AI analyzes the latest botanical publication trends, company data and regulatory changes to generate investment-relevant signals.", tr: "Claude AI, en son botanik yayin trendlerini, sirket verilerini ve regulasyon degisikliklerini analiz ederek yatirim sinyalleri uretir." },
  "enterprise.generateAnalysis": { en: "Generate Analysis", tr: "Analiz Oluştur" },
  "enterprise.aiAnalyzing": { en: "AI analyzing market data...", tr: "AI analiz ediliyor..." },
  "enterprise.earlySignals": { en: "Early Signals", tr: "Erken Sinyaller" },
  "enterprise.highConfidence": { en: "High Confidence", tr: "Yüksek Guven" },
  "enterprise.mediumConfidence": { en: "Medium Confidence", tr: "Orta Guven" },
  "enterprise.lowConfidence": { en: "Low Confidence", tr: "Düşük Guven" },
  "enterprise.sectorOutlook": { en: "Sector Outlook", tr: "Sektor Gorunumu" },
  "enterprise.bullishFactors": { en: "Bullish Factors", tr: "Yukselis Faktorleri" },
  "enterprise.bearishFactors": { en: "Bearish Factors", tr: "Dusus Faktorleri" },
  "enterprise.riskAlerts": { en: "Risk Alerts", tr: "Risk Uyarılari" },
  "enterprise.rerunAnalysis": { en: "Re-run Analysis", tr: "Yeniden Analiz Et" },
  "enterprise.disclaimer": { en: "Market data and company information on this page are estimates compiled from public sources. This does not constitute investment advice. Seek professional guidance for investment decisions.", tr: "Bu sayfadaki pazar verileri ve sirket bilgileri kamuya acik kaynaklardan derlenmis tahmini degerlerdir. Yatirim tavsiyesi niteliginde degildir. Yatirim kararlarinizda profesyonel danışmanlık aliniz." },
  "enterprise.supplements": { en: "Supplements", tr: "Takviyeler" },
  "enterprise.herbalPharma": { en: "Herbal Pharma", tr: "Bitkisel İlaç" },
  "enterprise.functionalFood": { en: "Functional Food", tr: "Fonksiyonel Gida" },
  "enterprise.cosmeceuticals": { en: "Cosmeceuticals", tr: "Kozmetik" },

  // Enterprise - API Marketplace
  "apiMarketplace.title": { en: "API Marketplace", tr: "API Pazaryeri" },
  "apiMarketplace.subtitle": { en: "Health AI API integrations", tr: "Sağlık AI API entegrasyonlari" },
  "apiMarketplace.endpoints": { en: "Available Endpoints", tr: "Mevcut API Endpointleri" },
  "apiMarketplace.pricing": { en: "API Pricing", tr: "API Fiyatlandirma" },
  "apiMarketplace.requests": { en: "requests", tr: "istek" },
  "apiMarketplace.getApiKey": { en: "Get API Key", tr: "API Anahtari Al" },

  // Enterprise - Employee Wellness
  "employeeWellness.title": { en: "Corporate Wellness", tr: "Kurumsal Sağlık Programı" },
  "employeeWellness.subtitle": { en: "Challenges, leaderboard, department competitions", tr: "Meydan okumalar, liderlik tablosu, departman yarislari" },
  "employeeWellness.participants": { en: "Participants", tr: "Katilimci" },
  "employeeWellness.participation": { en: "Participation", tr: "Katilim Orani" },
  "employeeWellness.healthScore": { en: "Health Score", tr: "Sağlık Skoru" },
  "employeeWellness.activeChallenges": { en: "Active Challenges", tr: "Aktif Yarisma" },
  "employeeWellness.challenges": { en: "Challenges", tr: "Yarismar" },
  "employeeWellness.leaderboard": { en: "Leaderboard", tr: "Liderlik" },
  "employeeWellness.departments": { en: "Departments", tr: "Departmanlar" },
  "employeeWellness.joined": { en: "joined", tr: "katilimci" },
  "employeeWellness.join": { en: "Join", tr: "Katil" },
  "employeeWellness.participationRate": { en: "participation", tr: "katilim" },

  // Enterprise - Pharma RWE
  "pharmaRwe.title": { en: "Real World Evidence", tr: "Gerçek Dünya Kaniti" },
  "pharmaRwe.subtitle": { en: "Drug usage analytics from anonymized patient data", tr: "Anonim hasta verisinden ilac kullanim analizleri" },
  "pharmaRwe.compliant": { en: "Anonymous & KVKK Compliant", tr: "Anonim & KVKK Uyumlu" },
  "pharmaRwe.patients": { en: "Patients", tr: "Hasta" },
  "pharmaRwe.adherence": { en: "Adherence", tr: "Uyum" },
  "pharmaRwe.sideEffects": { en: "Side Effects", tr: "Yan Etki" },
  "pharmaRwe.avgDuration": { en: "Avg Duration", tr: "Ort. Kullanim" },
  "pharmaRwe.sideEffectProfile": { en: "Side Effect Profile", tr: "Yan Etki Profili" },
  "pharmaRwe.adherenceTrend": { en: "Adherence Trend (Monthly)", tr: "Uyum Trendi (Aylik)" },
  "pharmaRwe.methodology": { en: "Data Methodology", tr: "Veri Metodolojisi" },
  "pharmaRwe.methodologyDesc": { en: "All data is anonymously collected from opt-in users. Individual patient data can never be identified. KVKK and GDPR compliant.", tr: "Tum veriler opt-in kullanicilardan anonim olarak toplanmistir. Bireysel hasta verisi asla tanimlanamaz. KVKK ve GDPR uyumlu." },

  // Enterprise - Pharmacy
  "pharmacy.title": { en: "Pharmacy Integration", tr: "Eczane Entegrasyonu" },
  "pharmacy.subtitle": { en: "Counter display, stock management, pharmacist support", tr: "Tezgah gorunumu, stok yönetimi, eczaci destek" },
  "pharmacy.totalProducts": { en: "Total Products", tr: "Toplam Urun" },
  "pharmacy.lowStock": { en: "Low Stock", tr: "Düşük Stok" },
  "pharmacy.nearExpiry": { en: "Near Expiry", tr: "Yaklasan SKT" },
  "pharmacy.dailyCustomers": { en: "Daily Customers", tr: "Günlük Musteri" },
  "pharmacy.counterDisplay": { en: "Counter Display", tr: "Tezgah Gorunumu" },
  "pharmacy.stockOptimization": { en: "Stock Optimization", tr: "Stok Optimizasyonu" },
  "pharmacy.pharmacistSupport": { en: "Pharmacist Support", tr: "Eczaci Destegi" },
  "pharmacy.searchDrug": { en: "Search drug (brand or generic)...", tr: "İlaç ara (marka veya etken madde)..." },
  "pharmacy.reorder": { en: "Products to Reorder", tr: "Siparis Gereken Urunler" },
  "pharmacy.order": { en: "Order", tr: "Siparis" },
  "pharmacy.stockSuggestions": { en: "Stock Suggestions (AI)", tr: "Stok Onerisi (AI)" },
  "pharmacy.decisionSupport": { en: "Pharmacist Decision Support", tr: "Eczaci Karar Destek" },
  "pharmacy.decisionSupportDesc": { en: "Automatic interaction checks and suggestions based on patient medication profile", tr: "Hasta ilac profiline gore otomatik etkilesim kontrolü ve oneriler" },

  // Enterprise - ROI Calculator
  "roiCalc.title": { en: "ROI Calculator", tr: "ROI Hesaplayici" },
  "roiCalc.subtitle": { en: "Insurance & corporate health investment returns", tr: "Sigorta ve kurumsal sağlık yatirimi getirisi" },
  "roiCalc.companyDetails": { en: "Company Details", tr: "Sirket Bilgileri" },
  "roiCalc.employees": { en: "Number of Employees", tr: "Calisan Sayisi" },
  "roiCalc.avgCost": { en: "Avg Annual Health Cost / Employee (TL)", tr: "Yıllık Ort. Sağlık Maliyeti / Calisan (TL)" },
  "roiCalc.calculate": { en: "Calculate ROI", tr: "ROI Hesapla" },
  "roiCalc.annualCost": { en: "Annual Health Cost", tr: "Yıllık Sağlık Maliyeti" },
  "roiCalc.estSavings": { en: "Est. Savings", tr: "Tahmini Tasarruf" },
  "roiCalc.platformCost": { en: "Platform Cost", tr: "Platform Maliyeti" },
  "roiCalc.savingsSources": { en: "Savings Sources", tr: "Tasarruf Kaynaklari" },
  "roiCalc.requestDemo": { en: "Request a Demo", tr: "Demo Talep Edin" },
  "roiCalc.requestDemoDesc": { en: "Talk to our team for a detailed ROI analysis tailored to your organization.", tr: "Kurumunuza ozel detayli ROI analizi için ekibimizle görüşün." },
  "roiCalc.contactUs": { en: "Contact Us", tr: "Bize Ulasin" },

  // Enterprise - White Label
  "whiteLabel.title": { en: "White-Label Solution", tr: "White-Label Çözüm" },
  "whiteLabel.subtitle": { en: "Offer the Doctopal platform under your own brand", tr: "Doctopal platformunu kendi markanizla sunun" },
  "whiteLabel.pricing": { en: "Pricing", tr: "Fiyatlandirma" },
  "whiteLabel.popular": { en: "Popular", tr: "Populer" },
  "whiteLabel.select": { en: "Select", tr: "Sec" },
  "whiteLabel.requestDemo": { en: "Request Demo", tr: "Demo Talep Formu" },
  "whiteLabel.yourName": { en: "Your Name", tr: "Adınız" },
  "whiteLabel.company": { en: "Company", tr: "Sirket" },
  "whiteLabel.requestDemoBtn": { en: "Request Demo", tr: "Demo Talep Et" },

  // Expert Content
  "expertContent.sampleData": { en: "SAMPLE DATA", tr: "ÖRNEK VERİ" },
  "expertContent.sponsored": { en: "Sponsored", tr: "Sponsorlu" },

  // Eye Health
  "eyeHealth.screenTimeImpact": { en: "Screen Time Impact", tr: "Ekran Süresi Etkisi" },

  // Family Health Tree
  "familyTree.healthConditions": { en: "Health Conditions", tr: "Sağlık Durumlari" },
  "familyTree.overallAssessment": { en: "Overall Assessment", tr: "Genel Değerlendirme" },
  "familyTree.hereditaryPatterns": { en: "Hereditary Risk Patterns", tr: "Kalitsal Risk Oruntuleri" },
  "familyTree.affectedRelatives": { en: "Affected relatives:", tr: "Etkilenen yakinlar:" },
  "familyTree.recommendedTest": { en: "Recommended genetic test:", tr: "Onerilen genetik test:" },
  "familyTree.screeningRecs": { en: "Screening Recommendations", tr: "Tarama Önerileri" },
  "familyTree.protectiveFactors": { en: "Protective Factors", tr: "Koruyucu Faktorler" },
  "familyTree.geneticCounseling": { en: "Genetic Counseling", tr: "Genetik Danışmanlik" },
  "familyTree.keyInsights": { en: "Key Insights", tr: "Önemli Bilgiler" },

  // Family Summary
  "familySummary.title": { en: "Family Weekly Summary", tr: "Aile Haftalık Ozet" },
  "familySummary.noMembers": { en: "No family members yet", tr: "Henuz aile uyesi eklenmedi" },
  "familySummary.noMembersDesc": { en: "Add family members from your profile to see their weekly health summaries.", tr: "Profil sayfanizdan aile uyelerini ekleyerek haftalik ozetlerini gorebilirsiniz." },
  "familySummary.healthAvg": { en: "Family Health Average", tr: "Aile Sağlık Ortalaması" },
  "familySummary.remind": { en: "Remind", tr: "Hatırlat" },
  "familySummary.medCompliance": { en: "Med Compliance", tr: "İlaç Uyumu" },
  "familySummary.missed": { en: "Missed", tr: "Kacirilan" },
  "familySummary.days": { en: "days", tr: "gun" },
  "familySummary.nextAppt": { en: "Next appointment:", tr: "Sonraki randevu:" },
  "familySummary.sendReminder": { en: "Send Reminder", tr: "Hatirlatma Gonder" },
  "familySummary.details": { en: "Details", tr: "Detay" },

  // Family Page
  "family.subtitle": { en: "Manage your family's health profiles and get personalized recommendations for everyone", tr: "Ailenizin sağlık profillerini yönetin, herkes için kişiselleştirilmiş öneriler alın" },

  // Fasting Monitor
  "fasting.title": { en: "Fasting Health Monitor", tr: "Oruç Sağlık Monitörü" },
  "fasting.subtitle": { en: "Safe health guide for Ramadan & periodic fasting", tr: "Ramazan & periyodik oruç için güvenli sağlık rehberi" },
  "fasting.tabGuide": { en: "Guide", tr: "Rehber" },
  "fasting.tabTiming": { en: "Med Timing", tr: "İlaç Zamanlaması" },
  "fasting.tabTracker": { en: "Daily Tracker", tr: "Günlük Takip" },
  "fasting.breakCriteria": { en: "When to Break Fast", tr: "Orucu Bozma Kriterleri" },
  "fasting.hydrationGuide": { en: "Hydration Guide", tr: "Hidrasyon Rehberi" },
  "fasting.hydration1": { en: "• Drink at least 2-3 liters between iftar and suhoor", tr: "• İftar-sahur arası en az 2-3 litre su iç" },
  "fasting.hydration2": { en: "• Reduce caffeine (diuretic effect)", tr: "• Kafein miktarını azalt (diüretik etki)" },
  "fasting.hydration3": { en: "• Avoid salty foods (increases thirst)", tr: "• Tuzlu yiyeceklerden kaçın (susuzluk artırır)" },
  "fasting.hydration4": { en: "• Eat high-water-content foods like watermelon, cucumber", tr: "• Karpuz, salatalık gibi su oranı yüksek besinler tüket" },
  "fasting.nutritionTitle": { en: "Suhoor & Iftar Nutrition", tr: "Sahur & İftar Beslenme" },
  "fasting.suhoor": { en: "Suhoor", tr: "Sahur" },
  "fasting.suhoor1": { en: "Complex carbs (oats, whole grain)", tr: "Kompleks karbonhidrat (yulaf, tam tahıl)" },
  "fasting.suhoor2": { en: "Protein (eggs, cheese)", tr: "Protein (yumurta, peynir)" },
  "fasting.suhoor3": { en: "Healthy fats (avocado, olive oil)", tr: "Sağlıklı yağ (avokado, zeytinyağı)" },
  "fasting.suhoor4": { en: "Plenty of water", tr: "Bol su" },
  "fasting.iftar": { en: "Iftar", tr: "İftar" },
  "fasting.iftar1": { en: "Start with dates (quick energy)", tr: "Hurma ile başla (hızlı enerji)" },
  "fasting.iftar2": { en: "Soup (hydration)", tr: "Çorba (hidrasyon)" },
  "fasting.iftar3": { en: "Balanced main meal", tr: "Dengeli ana yemek" },
  "fasting.iftar4": { en: "Avoid overeating", tr: "Aşırı yemekten kaçın" },
  "fasting.noMeds": { en: "No medications in profile. Add to see timing.", tr: "Profilinde ilaç yok. İlaç zamanlaması görmek için profil ekle." },
  "fasting.consultDoctor": { en: "Consult your doctor BEFORE changing medication timing", tr: "İlaç zamanlamasını değiştirmeden ÖNCE doktorunuza danışın" },
  "fasting.generalRule": { en: "General rule: Can be taken at iftar. Consult doctor.", tr: "Genel kural: İftarda alınabilir. Doktora danışın." },
  "fasting.dailyTracker": { en: "Daily Fasting Tracker", tr: "Günlük Oruç Takibi" },
  "fasting.dailyTrackerDesc": { en: "Record your fasting status, water intake, and symptoms daily", tr: "Her gün oruç durumunuzu, su alımınızı ve semptomlarınızı kaydedin" },
  "fasting.fastedToday": { en: "Fasted Today", tr: "Bugün Oruç Tuttum" },
  "fasting.waterTracking": { en: "Water Tracking", tr: "Su Takibi" },

  // Favorite Supplements
  "favSupp.shoppingListHeader": { en: "My Supplement Shopping List:", tr: "Takviye Alisveris Listem:" },
  "favSupp.noFavorites": { en: "No Favorites Yet", tr: "Henuz Favori Yok" },
  "favSupp.noFavoritesDesc": { en: "Browse the Supplement Guide and add your favorites!", tr: "Takviye Rehberi'ne goz atin ve favorilerinizi ekleyin!" },
  "favSupp.browseGuide": { en: "Browse Supplement Guide", tr: "Takviye Rehberine Git" },
  "favSupp.guide": { en: "Guide", tr: "Rehber" },
  "favSupp.title": { en: "My Favorite Supplements", tr: "Favori Takviyelerim" },
  "favSupp.interactionReminder": { en: "Always check interactions and consult your doctor before starting any supplement.", tr: "Herhangi bir takviyeye başlamadan once etkilesim kontrolü yapin ve doktorunuza danışın." },
  "favSupp.copied": { en: "Copied!", tr: "Kopyalandi!" },
  "favSupp.copyList": { en: "Copy Shopping List", tr: "Alisveris Listesi Kopyala" },
  "favSupp.selectToCompare": { en: "Select 2 supplements to compare", tr: "Karşılastirmak için 2 takviye secin" },
  "favSupp.checkInteractions": { en: "Check Interactions", tr: "Etkileşim Kontrol" },
  "favSupp.addToCalendar": { en: "Add to Calendar", tr: "Takvime Ekle" },
  "favSupp.remove": { en: "Remove", tr: "Kaldir" },
  "favSupp.quickCompare": { en: "Quick Compare", tr: "Karşılastirma" },
  "favSupp.evidence": { en: "Evidence:", tr: "Kanit:" },
  "favSupp.noInfo": { en: "No info available", tr: "Bilgi yok" },
  "favSupp.detailedCompare": { en: "Detailed AI Compare", tr: "Detayli AI Karşılastirma" },

  // First Aid
  "firstAid.disclaimer": { en: "This guide does not replace professional first aid training. We recommend taking a certified first aid course.", tr: "Bu rehber profesyonel ilk yardim egitiminin yerine gecmez. Bir ilk yardim kursuna katilmanizi oneririz." },

  // Food Prep
  "foodPrep.title": { en: "Food Prep Guide", tr: "Besin Hazırlama Rehberi" },
  "foodPrep.subtitle": { en: "How cooking method affects nutrient value", tr: "Pişirme yöntemi besin değerini nasıl etkiler" },
  "foodPrep.searchPlaceholder": { en: "Search food...", tr: "Besin ara..." },

  // Genetic Risk
  "geneticRisk.familyHistory": { en: "Family Health History", tr: "Ailede Gorulen Hastalıklar" },
  "geneticRisk.personalFactors": { en: "Personal Factors", tr: "Kişisel Faktorler" },
  "geneticRisk.overallProfile": { en: "Overall Risk Profile", tr: "Genel Risk Profili" },
  "geneticRisk.diseaseScores": { en: "Disease Risk Scores", tr: "Hastalık Risk Skorlari" },
  "geneticRisk.scoreExplanation": { en: "1.0 = average population risk. 2.0 = 2x average risk.", tr: "1.0 = ortalama nufus riski. 2.0 = 2 kat ortalama risk." },
  "geneticRisk.populationRisk": { en: "Population risk:", tr: "Nufus riski:" },
  "geneticRisk.yourRisk": { en: "Your risk:", tr: "Sizin riskiniz:" },
  "geneticRisk.confidence": { en: "Confidence:", tr: "Guvenilirlik:" },
  "geneticRisk.factors": { en: "Factors:", tr: "Faktorler:" },
  "geneticRisk.riskReduction": { en: "Risk Reduction", tr: "Risk Azaltma" },
  "geneticRisk.priorityActions": { en: "High Priority Actions", tr: "Oncelikli Aksiyonlar" },
  "geneticRisk.recommendedTests": { en: "Recommended Genetic Tests", tr: "Onerilen Genetik Testler" },

  // Grief Support
  "griefSupport.crisisLine": { en: "Crisis Line: 988 (US) | 182 (TR)", tr: "Kriz Hattı: 182 | Intihar Onleme: 182" },
  "griefSupport.stageQuestion": { en: "Which stage do you feel you're in?", tr: "Kendinizi hangi asamada hissediyorsunuz?" },
  "griefSupport.moodVeryLow": { en: "Very low", tr: "Çok kotu" },
  "griefSupport.moodVeryGood": { en: "Very good", tr: "Çok iyi" },
  "griefSupport.getSupport": { en: "Get Support", tr: "Destek Al" },
  "griefSupport.copingStrategies": { en: "Coping Strategies", tr: "Basa Cikma Stratejileri" },
  "griefSupport.selfCare": { en: "Self-Care Actions", tr: "Oz Bakim" },
  "griefSupport.journalPrompts": { en: "Journal Prompts", tr: "Günlük Yazma Önerileri" },
  "griefSupport.seekHelp": { en: "When to Seek Professional Help", tr: "Profesyonel Yardim Ne Zaman?" },

  // Gut Health
  "gutHealth.loginMessage": { en: "Sign in to analyze your gut health", tr: "Bağırsak sağlığı analizi için giriş yapın" },
  "gutHealth.detectedPatterns": { en: "Detected Patterns", tr: "Tespit Edilen Örüntüler" },
  "gutHealth.gutBrain": { en: "Gut-Brain Connection", tr: "Bağırsak-Beyin Bağlantısı" },
  "gutHealth.newAnalysis": { en: "Start new analysis", tr: "Yeni analiz yap" },

  // Hair & Nail Health
  "hairNail.statusGood": { en: "Good", tr: "Iyi" },
  "hairNail.statusCaution": { en: "Caution", tr: "Dikkat" },
  "hairNail.statusNeedsEval": { en: "Needs Evaluation", tr: "Değerlendirme Gerekli" },
  "hairNail.nutritionalDef": { en: "Possible Nutritional Deficiencies", tr: "Olasi Besin Eksiklikleri" },
  "hairNail.recommendedLabs": { en: "Recommended Lab Tests", tr: "Onerilen Testler" },
  "hairNail.lifestyleTips": { en: "Lifestyle Tips", tr: "Yasam Tarzı Ipuclari" },

  // Hajj Health
  "hajjHealth.title": { en: "Hajj & Umrah Health Guide", tr: "Hac & Umre Sağlık Rehberi" },
  "hajjHealth.subtitle": { en: "Comprehensive health preparation for safe worship", tr: "Güvenli ibadet için kapsamlı sağlık hazırlığı" },
  "hajjHealth.chronicWarning": { en: "If you have chronic conditions, consult your doctor before travel", tr: "Kronik hastalığınız varsa seyahat öncesi mutlaka doktorunuza danışın" },
  "hajjHealth.packingList": { en: "Essential Packing List", tr: "Yanınızda Bulunması Gerekenler" },

  // Health Analytics
  "analytics2.recommendations": { en: "Recommendations", tr: "Oneriler" },
  "analytics2.aiClickPrompt": { en: "Click the button to generate AI-powered insights from your health data.", tr: "Verileriniz uzerinde yapay zeka destekli icgoruler olusturmak için butona tiklayin." },
  "analytics2.metricTimeline": { en: "Metric Timeline", tr: "Metrik Zaman Cizelgesi" },
  "analytics2.anomalyTimeline": { en: "Anomaly Timeline", tr: "Anomali Zaman Cizelgesi" },
  "analytics2.deviation": { en: "Deviation", tr: "Sapma" },
  "analytics2.profileComparison": { en: "Profile Comparison", tr: "Profil Karsilastirmasi" },
  "analytics2.deepSleepH": { en: "Deep Sleep (h)", tr: "Derin Uyku (h)" },
  "analytics2.energy": { en: "Energy", tr: "Enerji" },
  "analytics2.sleepEnergy": { en: "Sleep / Energy", tr: "Uyku / Enerji" },
  "analytics2.heartRateBpm": { en: "Heart Rate (bpm)", tr: "Kalp Hizi (bpm)" },
  "analytics2.anomalyLabel": { en: "Anomaly", tr: "Anomali" },
  "analytics2.actual": { en: "Actual", tr: "Gercek" },
  "analytics2.projected": { en: "Projected", tr: "Tahmin" },
  "analytics2.actualData": { en: "Actual data", tr: "Gercek veri" },
  "analytics2.projectionLabel": { en: "Projection", tr: "Projeksiyon" },
  "analytics2.withOmega3": { en: "With Omega-3", tr: "Omega-3 ile" },
  "analytics2.you": { en: "You", tr: "Siz" },
  "analytics2.evidenceLabel": { en: "Evidence", tr: "Kanit" },
  "analytics2.improving": { en: "Improving", tr: "Iyilesiyor" },
  "analytics2.declining": { en: "Declining", tr: "Kotu" },
  "analytics2.stable": { en: "Stable", tr: "Stabil" },
  "analytics2.now": { en: "Now", tr: "Simdi" },
  "analytics2.3months": { en: "3 Mo", tr: "3 Ay" },
  "analytics2.6months": { en: "6 Mo", tr: "6 Ay" },
  "analytics2.whatIfDesc": { en: "See how adding Omega-3 (2g/day EPA+DHA) to your current protocol could affect your CRP and energy levels.", tr: "Mevcut protokolunuze Omega-3 (2g/gun EPA+DHA) eklerseniz CRP ve enerji seviyelerinizin nasil degisecegini gorun." },

  // Health Challenges
  "challenges.rules": { en: "Rules", tr: "Kurallar" },
  "challenges.start": { en: "Start Challenge", tr: "Challenge'i Başlat" },
  "challenges.reset": { en: "Reset", tr: "Sifirla" },

  // Health Diary
  "diary.title": { en: "Health Diary", tr: "Sağlık Günlüğü" },
  "diary.subtitle": { en: "Track your daily health journey", tr: "Günlük sağlık yolculugunuzu takip edin" },
  "diary.loginPrompt": { en: "Sign in to start your health diary.", tr: "Sağlık günlüğünuze başlamak için giriş yapın." },
  "diary.signIn": { en: "Sign In", tr: "Giriş Yap" },
  "diary.cancel": { en: "Cancel", tr: "Iptal" },
  "diary.newEntry": { en: "New Entry", tr: "Yeni Girdi" },
  "diary.howFeeling": { en: "How are you feeling?", tr: "Nasil hissediyorsunuz?" },
  "diary.placeholder": { en: "Write about your day... How did you feel? Any symptoms? What did you eat? How was your sleep?", tr: "Gununuz hakkinda yazın... Nasil hissettiniz? Belirti var mi? Ne yediniz? Uykunuz nasil?" },
  "diary.saveEntry": { en: "Save Entry", tr: "Girdiyi Kaydet" },
  "diary.searchEntries": { en: "Search entries...", tr: "Girdilerde ara..." },
  "diary.aiInsights": { en: "AI Insights", tr: "AI Analiz" },
  "diary.patternInsights": { en: "Pattern Insights", tr: "Oruntu Analizi" },
  "diary.analyzingEntries": { en: "Analyzing your entries...", tr: "Girdileriniz analiz ediliyor..." },
  "diary.topTopics": { en: "Top Topics", tr: "One Cikan Konular" },
  "diary.clearFilter": { en: "Clear filter", tr: "Filtreyi temizle" },
  "diary.noMatch": { en: "No entries match your search.", tr: "Aramanizla eslesen girdi yok." },
  "diary.noEntries": { en: "No entries yet. Start writing!", tr: "Henuz girdi yok. Yazmaya başlayin!" },
  "diary.showLess": { en: "Show less", tr: "Daha az" },
  "diary.showMore": { en: "Show more", tr: "Daha fazla" },
  "diary.keepWriting": { en: "Keep writing! At least 5 entries are needed for meaningful patterns.", tr: "Yazmaya devam et! Anlamli oruntular için en az 5 girdi gerekli." },
  "diary.sleepCorrelation": { en: "Sleep mentions correlate with symptom entries - consider tracking sleep quality more closely.", tr: "Uyku ile belirtiler arasinda korelasyon var - uyku kalitesini daha yakindan takip etmeyi deneyin." },
  "diary.lowMoodWarning": { en: "Over 30% of your entries have low mood scores. Consider discussing this with your doctor.", tr: "Girdilerinizin %30'undan fazlasi düşük ruh hali skoru iceriyor. Bunu doktorunuzla görüşmeyi dusunun." },

  // Health Forum
  "forum.description": { en: "You're not alone in your health journey. Our moderated, evidence-based community forum is coming soon.", tr: "Sağlık yolculugunuzda yalniz degilsiniz. Moderatorlu, kanita dayali topluluk forumumuz yakinda hizmetinizde." },
  "forum.launchNotify": { en: "Keep using the app to be notified when we launch!", tr: "Lansman bildirimini almak için uygulamayi kullanmaya devam edin!" },

  // Hydration page
  "hydration.activityLevel": { en: "Activity Level", tr: "Aktivite Düzeyi" },
  "hydration.sedentary": { en: "Sedentary", tr: "Hareketsiz" },
  "hydration.moderatelyActive": { en: "Moderately active", tr: "Orta aktif" },
  "hydration.veryActive": { en: "Very active / exercise", tr: "Çok aktif / spor" },
  "hydration.dailyCaffeine": { en: "Daily Caffeine (cups)", tr: "Günlük Kafein (fincan)" },
  "hydration.glasses": { en: "glasses", tr: "bardak" },
  "hydration.base": { en: "Base", tr: "Baz" },
  "hydration.activityMultiplier": { en: "Activity multiplier", tr: "Aktivite carpani" },
  "hydration.caffeineOffset": { en: "Caffeine offset", tr: "Kafein telafisi" },
  "hydration.kidneyWarningTitle": { en: "Kidney Disease Warning", tr: "Bobrek Hastasi Uyarısi" },
  "hydration.kidneyWarningDesc": { en: "Fluid intake may need to be restricted in kidney disease. This calculation may not apply to you. Follow the fluid limit set by your nephrologist.", tr: "Bobrek hastaligi olan kisilerde sivi alimi kisitlanmalidir. Bu hesaplama sizin için uygun olmayabilir. Nefrologunuzun belirledigi sivi limitine uyunuz." },
  "hydration.urineColorScale": { en: "Urine Color Scale", tr: "Idrar Renk Skalasi" },
  "hydration.medicationEffects": { en: "Medication Effects on Hydration", tr: "İlaç Etkileri" },

  // Immigrant Health page
  "immigrant.languageNote": { en: "This guide is available in Turkish and English. Use the language toggle in the top right to switch.", tr: "Bu rehber Turkce ve Ingilizce mevcuttur. Dil degistirmek için sag ust kosedeki dil dugmesini kullaniniz." },
  "immigrant.emergencyCall": { en: "Call 112 for emergencies. No registration or ID required.", tr: "Acil durumlarda 112'yi arayın. Kayıt veya kimlik gerekmez." },

  // Insurance Guide page
  "insurance.disclaimerNote": { en: "Information is for general guidance. Contact SGK or your insurance provider for current coverage and rates.", tr: "Bilgiler genel rehberlik amaclidir. Guncel kapsam ve ucretler için SGK veya sigorta sirketinizle iletisime gecin." },

  // Intermittent Fasting page
  "fasting.fastingLabel": { en: "Fasting", tr: "Oruc" },
  "fasting.eatingLabel": { en: "Eating", tr: "Yeme" },
  "fasting.hydrationPlan": { en: "Hydration Plan", tr: "Hidrasyon Plani" },
  "fasting.breakFastSuggestions": { en: "Breaking Fast Suggestions", tr: "Oruc Acma Önerileri" },
  "fasting.updatePlan": { en: "Update Plan", tr: "Plani Güncelle" },
  "fasting.criticalBadge": { en: "CRITICAL", tr: "KRİTİK" },

  // Jet Lag page
  "jetlag.travelDate": { en: "Travel Date", tr: "Seyahat Tarihi" },
  "jetlag.melatoninTitle": { en: "Melatonin Timing Plan", tr: "Melatonin Zamanlama Plani" },
  "jetlag.preTravel": { en: "Pre-Travel", tr: "Seyahat Oncesi" },
  "jetlag.timing": { en: "Timing", tr: "Zamanlama" },
  "jetlag.dose": { en: "Dose", tr: "Doz" },
  "jetlag.lightExposure": { en: "Light Exposure Schedule", tr: "Isik Maruziyeti Programı" },
  "jetlag.mealTiming": { en: "Meal Timing Plan", tr: "Yemek Zamanlama Plani" },
  "jetlag.breakfast": { en: "Breakfast:", tr: "Kahvalti:" },
  "jetlag.lunch": { en: "Lunch:", tr: "Ogle:" },
  "jetlag.dinner": { en: "Dinner:", tr: "Aksam:" },
  "jetlag.medTimingAdj": { en: "Medication Timing Adjustments", tr: "İlaç Zamanlama Ayarlamalari" },
  "jetlag.current": { en: "Current:", tr: "Mevcut:" },
  "jetlag.new": { en: "New:", tr: "Yeni:" },
  "jetlag.hourByHour": { en: "Hour-by-Hour Plan", tr: "Saat Saat Plan" },
  "jetlag.generalTips": { en: "General Tips", tr: "Genel Ipuclari" },
  "jetlag.east": { en: "East", tr: "Doguya" },
  "jetlag.west": { en: "West", tr: "Batiya" },
  "jetlag.daysBefore": { en: "days before", tr: "gun once başla" },

  // Kidney Dashboard page
  "kidney.labValues": { en: "Lab Values", tr: "Laboratuvar Degerleri" },
  "kidney.potassium": { en: "Potassium", tr: "Potasyum" },
  "kidney.phosphorus": { en: "Phosphorus", tr: "Fosfor" },
  "kidney.sodium": { en: "Sodium", tr: "Sodyum" },
  "kidney.stage": { en: "Stage", tr: "Evre" },
  "kidney.dietLimit": { en: "Limit", tr: "Sinirlayin" },
  "kidney.dietPrefer": { en: "Prefer", tr: "Tercih Edin" },
  "kidney.fluidRecommendation": { en: "Fluid Recommendation", tr: "Sivi Onerisi" },

  // Label Reader page
  "label.dietCompatibility": { en: "Diet Compatibility", tr: "Diyet Uyumlulugu" },
  "label.hiddenSugars": { en: "Hidden Sugars", tr: "Gizli Sekerler" },
  "label.allergens": { en: "Allergens", tr: "Alerjenler" },
  "label.additives": { en: "Additives", tr: "Katki Maddeleri" },
  "label.positives": { en: "Positives", tr: "Olumlu" },
  "label.concerns": { en: "Concerns", tr: "Endiseler" },

  // Liver Monitor page
  "liver.liverEnzymes": { en: "Liver Enzymes", tr: "Karaciger Enzimleri" },
  "liver.fattyLiverOptional": { en: "For Fatty Liver Index (optional)", tr: "Yagli Karaciger Indeksi için (opsiyonel)" },
  "liver.waist": { en: "Waist (cm)", tr: "Bel Cevresi (cm)" },

  // Lung Monitor page
  "lung.condition": { en: "Condition", tr: "Durum" },
  "lung.actScoreHelp": { en: "Rate each question 1 (worst) to 5 (best)", tr: "Her soru için 1 (en kotu) - 5 (en iyi) puan verin" },
  "lung.medicationAlerts": { en: "Medication Alerts", tr: "İlaç Uyarılari" },
  "lung.breathingExercises": { en: "Breathing Exercises", tr: "Nefes Egzersizleri" },

  // Medical Analysis page
  "medAnalysis.testDate": { en: "Test Date", tr: "Tahlil Tarihi" },
  "medAnalysis.optional": { en: "optional", tr: "istege bagli" },
  "medAnalysis.dontRememberDate": { en: "I don't remember the exact date", tr: "Tam tarihi hatirlamiyorum" },
  "medAnalysis.overallUrgency": { en: "Overall Urgency", tr: "Genel Aciliyet" },
  "medAnalysis.urgencyShareResults": { en: "We recommend sharing your results with a specialist as soon as possible.", tr: "Sonuçlarinizi mumkun olan en kisa surede bir uzmanla paylasmanizi oneriyoruz." },
  "medAnalysis.smartTriage": { en: "Smart Triage", tr: "Akilli Yonlendirme" },
  "medAnalysis.smartTriageDesc": { en: "AI-recommended specialist consultations", tr: "AI onerili uzman konsultasyonlari" },
  "medAnalysis.probability": { en: "Probability", tr: "Olasilik" },
  "medAnalysis.keyMarkers": { en: "Key Markers:", tr: "Ana Gostergeler:" },
  "medAnalysis.triageDisclaimer": { en: "These recommendations are AI-generated estimates and do not replace a doctor's evaluation.", tr: "Bu yonlendirmeler AI tahminidir ve bir doktorun degerlendirmesinin yerini tutmaz." },
  "medAnalysis.routine": { en: "Routine", tr: "Rutin" },
  "medAnalysis.seeSoon": { en: "See Soon", tr: "Yakinda Gidin" },
  "medAnalysis.urgent": { en: "Urgent", tr: "Acil" },
  "medAnalysis.emergency": { en: "Emergency", tr: "Acil Durum" },

  // Medical Dictionary page
  "meddict.simpleTerms": { en: "In Simple Terms", tr: "Basit Anlatım" },
  "meddict.medicalDef": { en: "Medical Definition", tr: "Tıbbi Tanım" },
  "meddict.howDoctorsUse": { en: "How Doctors Use This Term", tr: "Doktorlar Nasıl Kullanır?" },
  "meddict.whenConcerned": { en: "When to Be Concerned", tr: "Ne Zaman Endişelenmeli?" },
  "meddict.relatedTerms": { en: "Related Terms", tr: "İlgili Terimler" },
  "meddict.searchPrompt": { en: "Search for a medical term", tr: "Bir tıbbi terim arayın" },

  // Medical Records page
  "records.description": { en: "All your medical documents in one place, secure and organized. Share instantly with your doctor via QR code.", tr: "Tum tibbi belgeleriniz tek bir yerde, güvenli ve düzenli. QR kodla doktorunuzla aninda paylasin." },
  "records.ctaMessage": { en: "Document organizer coming soon. You can currently upload blood tests and radiology reports from our Medical Analysis page.", tr: "Belge organizatoru yakinda geliyor. Su an kan tahlillerinizi ve radyoloji raporlarinizi Tibbi Analiz sayfamizdan yukleyebilirsiniz." },

  // Medication Buddy page
  "medBuddy.title": { en: "Medication Buddy", tr: "İlaç Arkadasi" },
  "medBuddy.subtitle": { en: "Track together, motivate each other", tr: "Birlikte takip edin, birbirinizi motive edin" },
  "medBuddy.inviteCode": { en: "Your Invite Code", tr: "Davet Kodunuz" },
  "medBuddy.shareCode": { en: "Share this code with your buddy", tr: "Bu kodu arkadasinizla paylasin" },
  "medBuddy.enterCode": { en: "Enter Buddy Code", tr: "Arkadas Kodu Gir" },
  "medBuddy.yourBuddies": { en: "Your Buddies", tr: "Arkadaslariniz" },
  "medBuddy.missedDose": { en: "Missed dose!", tr: "İlaç kacirdi!" },
  "medBuddy.compliance": { en: "compliance", tr: "uyum" },
  "medBuddy.sendReminder": { en: "Send Reminder", tr: "Hatirlatma Gonder" },
  "medBuddy.privacyNote": { en: "Privacy Note", tr: "Gizlilik Notu" },
  "medBuddy.privacyNote1": { en: "Buddies can only see compliance percentages", tr: "Arkadaslariniz sadece uyum yuzdelerini gorur" },
  "medBuddy.privacyNote2": { en: "Medication names and dosages are not shared", tr: "İlaç isimleri ve dozlari paylasiliamaz" },
  "medBuddy.privacyNote3": { en: "You can remove a buddy at any time", tr: "Istediginiz zaman arkadasi cikarabilirsiniz" },
  "medBuddy.betterTogether": { en: "Better Together", tr: "Birlikte Daha Iyi" },
  "medBuddy.betterTogetherDesc": { en: "Buddy users show 34% better compliance", tr: "Buddy kullananlar %34 daha iyi uyum gosteriyor" },
  "medBuddy.gentleReminders": { en: "Gentle Reminders", tr: "Nazik Hatirlatma" },
  "medBuddy.gentleRemindersDesc": { en: "Automatic notification for missed doses", tr: "Kacirilan dozlarda otomatik bildirim" },
  "medBuddy.fullPrivacy": { en: "Full Privacy", tr: "Tam Gizlilik" },
  "medBuddy.fullPrivacyDesc": { en: "Your health data is never shared", tr: "Sağlık verileriniz asla paylasiliamaz" },

  // Medication Hub page
  "medHub.title": { en: "Medication Hub", tr: "İlaç Yönetim Merkezi" },
  "medHub.description": { en: "Manage your medication timing, interactions and reminders in one place.", tr: "İlaçlarınızın zamanlama, etkileşim ve hatırlatıcılarını tek yerden yönetin." },
  "medHub.subtitle": { en: "Scheduling, interaction matrix and reminders", tr: "Zamanlama, etkileşim matrisi ve hatırlatıcılar" },
  "medHub.noMeds": { en: "No medications added yet", tr: "Henüz ilaç eklenmemiş" },
  "medHub.noMedsDesc": { en: "Add your medications to your profile to get started.", tr: "İlaçlarınızı profilinize ekleyerek başlayın." },
  "medHub.addInProfile": { en: "Add Medications in Profile", tr: "Profilde İlaç Ekle" },
  "medHub.nextUp": { en: "Next Up", tr: "Sıradaki" },
  "medHub.dailySchedule": { en: "Your Daily Schedule", tr: "Günlük Programınız" },
  "medHub.vitCAbsorption": { en: "Vitamin C enhances absorption", tr: "C vitamini emilimi artırır" },
  "medHub.colorLegend": { en: "Color Legend", tr: "Renk Kodları" },
  "medHub.timingGuide": { en: "Medication Timing Guide", tr: "İlaç Zamanlama Kılavuzu" },
  "medHub.noTimingRule": { en: "No specific timing rule found. Follow your doctor's instructions.", tr: "Bu ilaç için özel zamanlama kuralı bulunamadı. Doktorunuzun önerilerine uyun." },
  "medHub.timingDatabase": { en: "Full Timing Database", tr: "Tam Zamanlama Veritabanı" },
  "medHub.notifSettings": { en: "Notification Settings", tr: "Bildirim Ayarları" },
  "medHub.notifSettingsDesc": { en: "Set reminder times for each medication", tr: "Her ilaç için hatırlatma saati belirleyin" },
  "medHub.pushNotifNote": { en: "PWA push notifications will be enabled in an upcoming release.", tr: "PWA push bildirimleri yakın bir sürümde etkinleştirilecektir." },
  "medHub.reminderSchedule": { en: "Reminder Schedule", tr: "Hatırlatma Programı" },
  "medHub.disclaimer": { en: "This schedule is for informational purposes. Always follow your doctor's instructions for medication timing.", tr: "Bu program genel bilgi amaçlıdır. İlaç zamanlaması için her zaman doktorunuzun talimatlarını takip edin." },

  // Medication Schedule page
  "medSchedule.goToProfile": { en: "Go to Profile", tr: "Profil'e Git" },
  "medSchedule.yourMeds": { en: "Your medications", tr: "Profildeki ilaçların" },

  // Menopause Panel page
  "menopause.frequency": { en: "Frequency (0-10)", tr: "Siklik (0-10)" },
  "menopause.severity": { en: "Severity (0-3)", tr: "Siddet (0-3)" },
  "menopause.onHRT": { en: "On HRT", tr: "HRT Kullaniliyor" },
  "menopause.symptomAnalysis": { en: "Symptom Analysis", tr: "Semptom Analizi" },
  "menopause.supplementPlan": { en: "Supplement Plan", tr: "Takviye Plani" },
  "menopause.duration": { en: "Duration", tr: "Sure" },
  "menopause.calcium": { en: "Calcium", tr: "Kalsiyum" },
  "menopause.vitaminD": { en: "Vitamin D", tr: "D Vitamini" },
  "menopause.exercise": { en: "Exercise", tr: "Egzersiz" },
  "menopause.lifestyle": { en: "Lifestyle Recommendations", tr: "Yasam Tarzi Önerileri" },

  // Men's Health page
  "mens.adamPositive": { en: "Positive — Evaluation Recommended", tr: "Pozitif — Değerlendirme Onerilir" },
  "mens.adamNegative": { en: "Negative", tr: "Negatif" },
  "mens.assessment": { en: "Assessment", tr: "Değerlendirme" },
  "mens.prevalence": { en: "Prevalence", tr: "Gorulen oran" },
  "mens.recommendedTests": { en: "Recommended Lab Tests", tr: "Onerilen Testler" },
  "mens.lifestyle": { en: "Lifestyle Recommendations", tr: "Yasam Tarzi Önerileri" },

  // Mental Wellness page
  "mw.notesPlaceholder": { en: "How are you feeling today? (optional)", tr: "Bugun nasil hissediyorsun? (isteğe bağlı)" },
  "mw.saveCheckin": { en: "Save Check-in", tr: "Kaydet" },
  "mw.detectedPatterns": { en: "Detected Patterns", tr: "Tespit Edilen Oruntler" },

  // Micro Habits page
  "microHabits.title": { en: "Micro-Habit Builder", tr: "Mikro-Alışkanlık Oluşturucu" },
  "microHabits.subtitle": { en: "Small steps, big changes — the Atomic Habits method", tr: "Küçük adımlar, büyük değişimler — Atomic Habits yöntemi" },
  "microHabits.twoMinRule": { en: "🎯 2-Minute Rule: Keep each habit under 2 minutes. Master in 7 days, then level up.", tr: "🎯 2 Dakika Kuralı: Her alışkanlığı 2 dakikadan kısa tut. 7 günde ustalaş, sonra seviye atla." },
  "microHabits.level": { en: "Level", tr: "Seviye" },
  "microHabits.daysToLevelUp": { en: "days to level up", tr: "gün sonra seviye atlama" },
  "microHabits.addHabit": { en: "Add Habit", tr: "Alışkanlık Ekle" },
  "microHabits.noHabits": { en: "No habits yet. Start small!", tr: "Henüz alışkanlık eklemedin. Küçük başla!" },

  // Migraine Dashboard page
  "migraine.title": { en: "Migraine Dashboard", tr: "Migren Takipci" },
  "migraine.subtitle": { en: "Log attacks, analyze triggers, track effectiveness", tr: "Ataklarinizi kaydedin, tetikleyicileri analiz edin" },
  "migraine.attackLog": { en: "Attack Log", tr: "Atak Kaydi" },
  "migraine.triggers": { en: "Triggers", tr: "Tetikleyiciler" },
  "migraine.medEffectiveness": { en: "Medication Effectiveness", tr: "İlaç Etkisi" },
  "migraine.thisMonth": { en: "This month", tr: "Bu ay" },
  "migraine.avgSeverity": { en: "Avg severity", tr: "Ort. siddet" },
  "migraine.avgDuration": { en: "Avg duration", tr: "Ort. sure" },
  "migraine.medEffect": { en: "Med effectiveness", tr: "İlaç etkisi" },
  "migraine.duration": { en: "Duration: ", tr: "Sure: " },
  "migraine.location": { en: "Location: ", tr: "Konum: " },
  "migraine.med": { en: "Med: ", tr: "İlaç: " },
  "migraine.effective": { en: "Effective: ", tr: "Etkili: " },
  "migraine.logNew": { en: "Log new attack", tr: "Yeni atak kaydet" },
  "migraine.effectiveCount": { en: "effective", tr: "etkili" },

  // Military Health page
  "military.healthChecklist": { en: "Health Preparation Checklist", tr: "Sağlık Hazirlik Kontrol Listesi" },
  "military.allComplete": { en: "All health preparations complete!", tr: "Tum sağlık hazirliklari tamamlandi!" },
  "military.vaccinations": { en: "Required & Recommended Vaccinations", tr: "Gerekli ve Onerilen Asilar" },
  "military.required": { en: "Required", tr: "Zorunlu" },
  "military.recommended": { en: "Recommended", tr: "Onerilen" },

  // New Parent Health page
  "newparent.focusNote": { en: "This page focuses on PARENT health. For baby health, visit the Child Health module.", tr: "Bu sayfa EBEVEYN sağlığına odaklanir. Bebek sağlığı için Cocuk Sagligi modulune gidin." },
  "newparent.childHealth": { en: "Child Health", tr: "Cocuk Sagligi" },
  "newparent.burnoutTitle": { en: "Burnout Self-Assessment", tr: "Tukenmislik Oz Değerlendirmesi" },
  "newparent.burnoutInstruction": { en: "Think about the last 2 weeks. Which of the following apply?", tr: "Son 2 haftayi dusunun. Asagidakilerden hangileri gecerli?" },
  "newparent.seeAssessment": { en: "See Assessment", tr: "Değerlendirmeyi Gor" },
  "newparent.burnoutHigh": { en: "High burnout indicators. We recommend speaking to a healthcare provider.", tr: "Yüksek tukenmislik belirtileri. Bir sağlık uzmanina danışmaniz onerilir." },
  "newparent.burnoutModerate": { en: "Moderate stress indicators. Prioritize self-care and personal time.", tr: "Orta düzeyde stres belirtileri. Kendinize zaman ayirmaya oncelik verin." },
  "newparent.burnoutLow": { en: "Low burnout indicators. Keep taking care of yourself!", tr: "Düşük tukenmislik belirtileri. Kendinize bakmaya devam edin!" },

  // Noise Exposure page
  "noise.damageThreshold": { en: "85 dB = Damage Threshold", tr: "85 dB = Hasar Başlangıç Esigi" },
  "noise.damageDesc": { en: "Prolonged exposure above 85 dB causes permanent hearing loss. Every 3 dB increase HALVES the safe exposure time.", tr: "85 dB uzerinde uzun sureli maruziyet kalici isitme kaybina yol acar. Her 3 dB artis maruz kalinabilecek sureyi YARILIYA indirir." },
  "noise.decibelChart": { en: "Decibel Reference Chart", tr: "Desibel Referans Tablosu" },
  "noise.earplugGuide": { en: "Earplug Guide", tr: "Kulak Tikaci Rehberi" },
  "noise.bestFor": { en: "Best for:", tr: "En iyi:" },
  "noise.tinnitusTitle": { en: "Tinnitus & Hearing Test Reminder", tr: "Tinitus ve Isitme Testi Hatirlatmasi" },
  "noise.hearingTestReminder": { en: "If you regularly work in 85+ dB environments, get a hearing test once a year.", tr: "85+ dB ortamlarda düzenli calisiyorsaniz yilda 1 kez isitme testi yaptirin." },

  // Notification Preferences page
  "notifPref.title": { en: "Notification Preferences", tr: "Bildirim Tercihleri" },
  "notifPref.active": { en: "active", tr: "aktif" },
  "notifPref.enableAll": { en: "Enable All", tr: "Tumunu Ac" },
  "notifPref.disableAll": { en: "Disable All", tr: "Tumunu Kapat" },
  "notifPref.pushTitle": { en: "Push Notifications", tr: "Push Bildirimleri" },
  "notifPref.pushDesc": { en: "Browser permission required for push notifications. Install as PWA for a better experience.", tr: "Push bildirimleri için tarayici izni gereklidir. PWA olarak yukleyerek daha iyi deneyim elde edin." },
  "notifPref.grantPermission": { en: "Grant Permission", tr: "Izin Ver" },

  // Notifications page
  "notif.today": { en: "Today", tr: "Bugun" },
  "notif.yesterday": { en: "Yesterday", tr: "Dun" },
  "notif.thisWeek": { en: "This Week", tr: "Bu Hafta" },
  "notif.older": { en: "Older", tr: "Daha Eski" },
  "notif.justNow": { en: "Just now", tr: "Simdi" },
  "notif.unread": { en: "unread", tr: "okunmamis" },
  "notif.markAllRead": { en: "Mark all read", tr: "Tumunu oku" },
  "notif.goodMorning": { en: "Good morning! Today's summary:", tr: "Gunaydin! Bugunun ozeti:" },
  "notif.all": { en: "All", tr: "Tumu" },
  "notif.medications": { en: "Medications", tr: "İlaçlar" },
  "notif.health": { en: "Health", tr: "Sağlık" },
  "notif.system": { en: "System", tr: "Sistem" },
  "notif.noNotifications": { en: "No notifications", tr: "Bildirim yok" },
  "notif.allWillAppear": { en: "All your notifications will appear here", tr: "Tum bildirimleriniz burada gorunecek" },

  // Nutrition page
  "nut.noMealsYet": { en: "No meals logged yet", tr: "Henüz kayıtlı öğün yok" },

  // Organ Transplant page
  "organ.badge": { en: "Organ Transplant Guide", tr: "Organ Nakli Rehberi" },
  "organ.title": { en: "Life After Organ Transplant", tr: "Organ Nakli Sonrasi Yasam" },
  "organ.subtitle": { en: "Comprehensive guide on medication compliance, infection prevention, nutrition, and follow-up care.", tr: "İlaç uyumu, enfeksiyon onleme, beslenme ve takip programı hakkinda kapsamli rehber." },
  "organ.criticalTitle": { en: "Critical Drug Interactions", tr: "Önemli İlaç Etkilesileri" },
  "organ.criticalDesc": { en: "ALWAYS consult your transplant team before starting ANY supplement, herbal product, or new medication. St. John's Wort, grapefruit, and many herbal products can dangerously alter immunosuppressant drug levels.", tr: "Herhangi bir takviye, bitkisel urun veya yeni ilac başlamadan ÖNCE mutlaka nakil ekibinize danışın. Sari Kantaron, greyfurt ve bircok bitkisel urun immunsupresif ilac düzeylerini tehlikeli sekilde degistirebilir." },
  "organ.disclaimer": { en: "This information is provided for general guidance. Your transplant team's instructions always take priority.", tr: "Bu bilgiler genel rehberlik için sunulmustur. Nakil ekibinizin talimatlari her zaman onceliklidir." },

  // Pain Diary page
  "pain.history": { en: "History", tr: "Geçmiş" },
  "pain.mild": { en: "Mild", tr: "Hafif" },
  "pain.durationPlaceholder": { en: "e.g. 2 hours, 30 minutes", tr: "orn. 2 saat, 30 dakika" },
  "pain.notesPlaceholder": { en: "Additional notes...", tr: "Ek notlar..." },
  "pain.noRecords": { en: "No pain records yet", tr: "Henuz ağrı kaydi yok" },
  "pain.medCorrelation": { en: "Medication Correlation", tr: "İlaç Korelasyonu" },
  "pain.analyzeAgain": { en: "Analyze again", tr: "Tekrar analiz et" },
  "pain.avgIntensity": { en: "Avg. Intensity", tr: "Ort. Siddet" },
  "pain.freqWeek": { en: "Freq/Week", tr: "Haftalık Sik." },
  "pain.mostCommonArea": { en: "Most Common", tr: "En Sik Bolge" },
  "pain.mostCommonType": { en: "Most Common Type", tr: "En Sik Tip" },

  // Peer Mentoring page
  "peer.title": { en: "Peer Health Mentoring", tr: "Akran Sağlık Mentorluğu" },
  "peer.subtitle": { en: "1-on-1 volunteer support from someone who's been there", tr: "Aynı yoldan geçmiş birinden 1-1 gönüllü destek" },
  "peer.sampleData": { en: "SAMPLE DATA", tr: "ÖRNEK VERİ" },
  "peer.verifiedNote": { en: "All mentors are verified and moderated. They share experience, not medical advice.", tr: "Tüm mentorlar doğrulanmış ve moderasyonlu. Tıbbi tavsiye vermezler, deneyim paylaşırlar." },
  "peer.searchPlaceholder": { en: "Search mentors...", tr: "Mentor ara..." },
  "peer.yearsExp": { en: "years experience", tr: "yıl deneyim" },
  "peer.sessions": { en: "sessions", tr: "seans" },
  "peer.connect": { en: "Connect", tr: "Bağlan" },
  "peer.noResults": { en: "No mentors found for this criteria.", tr: "Bu kriterlere uygun mentor bulunamadı." },
  "peer.becomeTitle": { en: "Want to Become a Mentor?", tr: "Mentor Olmak İster Misin?" },
  "peer.becomeDesc": { en: "Apply if you have 2+ years of chronic condition experience", tr: "En az 2 yıl kronik hastalık deneyimin varsa başvur" },
  "peer.apply": { en: "Apply", tr: "Başvur" },

  // Pet Health page
  "pet.pregnancyCatGuide": { en: "Pregnancy + Cat Guide", tr: "Hamilelik + Kedi Rehberi" },
  "pet.immunosuppressedWarning": { en: "Immunosuppressed patients are more vulnerable to zoonotic infections. Pay extra attention to pet hygiene and consult your vet regularly.", tr: "Immunsuprese hastalar zoonotik enfeksiyonlara karsi daha savunmasizdir. Evcil hayvan hijyenine ekstra dikkat ediniz ve veterinerinizle düzenlii iletisime geciniz." },
  "pet.zoonoticDiseases": { en: "Zoonotic Diseases", tr: "Zoonotik Hastalıklar" },
  "pet.transmission": { en: "Transmission", tr: "Bulasma" },
  "pet.prevention": { en: "Prevention", tr: "Korunma" },
  "pet.riskGroups": { en: "Risk Groups", tr: "Risk Gruplari" },
  "pet.biteProtocol": { en: "Bite / Scratch Protocol", tr: "Isirma / Tirmalama Protokolu" },

  // Pharmacogenetics page
  "pharma.noMeds": { en: "No medications found in your profile. Add medications from your profile page first.", tr: "Profilinizde ilac bulunamadı. Once profil sayfasindan ilaçlarınizi ekleyin." },
  "pharma.infoBox": { en: "Pharmacogenetics studies how genetic differences affect drug metabolism. This analysis shows which of your medications may be affected by genetic variations.", tr: "Farmakogenetik, genetik farklıliklarin ilac metabolizmasini nasil etkiledigini inceler. Bu analiz, ilaçlarınizin genetik varyasyonlardan nasil etkilenebilecegini gosterir." },
  "pharma.yourMeds": { en: "Your medications", tr: "Profilinizdeki ilaclar" },
  "pharma.enzyme": { en: "Enzyme", tr: "Enzim" },
  "pharma.signsToWatch": { en: "Signs to watch", tr: "Dikkat edilecek isaret" },
  "pharma.personalNotes": { en: "Personalized Notes", tr: "Kişisel Notlar" },
  "pharma.analyzeAgain": { en: "Analyze again", tr: "Tekrar analiz et" },

  // Pharmacy Finder page
  "pharmacy.callOnDuty": { en: "Call 112 for On-Duty Pharmacy", tr: "Nobetci Eczane için 112'yi Arayin" },
  "pharmacy.equivSearch": { en: "Medication Equivalent Search", tr: "İlaç Esdeqeri Arama" },
  "pharmacy.searchPlaceholder": { en: "Enter drug name (e.g., Paracetamol, Parol)...", tr: "İlaç adi girin (ornegin: Paracetamol, Parol)..." },
  "pharmacy.generic": { en: "Generic", tr: "Etken Madde" },
  "pharmacy.noResults": { en: "No results found. Please check the drug name.", tr: "Sonuc bulunamadı. Lütfen ilac adini kontrol edin." },
  "pharmacy.enterToFind": { en: "Enter a drug name to find equivalents", tr: "Bir ilac adi girerek esdegerlerini bulun" },
  "pharmacy.disclaimer": { en: "Always consult your doctor or pharmacist before switching medications.", tr: "İlaç degisimi yapmadan once mutlaka doktorunuza veya eczaciniza danışın." },

  // Polypharmacy page
  "polypharmacy.title": { en: "Polypharmacy Risk Score", tr: "Polifarmasi Risk Skoru" },
  "polypharmacy.subtitle": { en: "Comprehensive risk assessment for patients taking 5+ medications", tr: "5+ ilaç kullanan hastalar için kapsamlı risk değerlendirmesi" },
  "polypharmacy.medications": { en: "medications", tr: "ilaç" },
  "polypharmacy.overall": { en: "Overall Polypharmacy Risk", tr: "Genel Polifarmasi Riski" },
  "polypharmacy.noMeds": { en: "Add medications to see risk assessment.", tr: "Risk değerlendirmesi için ilaç ekle." },
  "polypharmacy.disclaimer": { en: "Discuss this assessment with your doctor. Never stop medications without medical advice.", tr: "Bu değerlendirmeyi doktorunuzla tartışın. Tıbbi tavsiye olmadan ilaçları bırakmayın." },
  "polypharmacy.shareDoctor": { en: "Share with Doctor", tr: "Doktorla Paylaş" },

  // Post-ICU page
  "postIcu.badge": { en: "Post-ICU Recovery Guide", tr: "YBU Sonrasi Rehber" },
  "postIcu.title": { en: "Post-ICU Recovery Syndrome", tr: "Yogun Bakim Sonrasi Iyilesme" },
  "postIcu.subtitle": { en: "Everything you need to know after ICU discharge. A step-by-step guide for physical, mental, and nutritional recovery.", tr: "Yogun bakim unitesinden cikarken bilmeniz gerekenler. Fiziksel, zihinsel ve beslenme iyileşmesi için adim adim rehber." },
  "postIcu.warning": { en: "This guide is for informational purposes and does not replace medical advice. Follow your doctor's instructions during recovery.", tr: "Bu rehber bilgilendirme amaclıdır ve tıbbi tavsiye yerine gecmez. Iyilesme surecinde doktorunuzun talimatlarini takip edin." },
  "postIcu.footer": { en: "Scientific reference on PICS (Post-Intensive Care Syndrome): Society of Critical Care Medicine", tr: "PICS (Yogun Bakim Sonrasi Sendromu) hakkinda bilimsel kaynak: Society of Critical Care Medicine" },

  // Postpartum Support page
  "postpartum.epdsReferral": { en: "Your EPDS score suggests professional evaluation is recommended. Please talk to your doctor.", tr: "EPDS skorunuz profesyonel değerlendirme onermektedir. Doktorunuzla görüşün." },
  "postpartum.sleepLabel": { en: "Sleep (hrs)", tr: "Uyku (saat)" },
  "postpartum.mood": { en: "Mood", tr: "Ruh Hali" },
  "postpartum.concerns": { en: "Concerns", tr: "Endiseler" },
  "postpartum.epdsOptional": { en: "Optional", tr: "Istege Bagli" },
  "postpartum.epds7days": { en: "In the past 7 days, how have you felt?", tr: "Son 7 gun icinde kendinizi nasil hissettiniz?" },
  "postpartum.critical": { en: "critical", tr: "kritik" },
  "postpartum.assessing": { en: "Assessing...", tr: "Değerlendiriliyor..." },
  "postpartum.mentalHealth": { en: "Mental Health Check", tr: "Ruh Sagligi Durumu" },
  "postpartum.recoveryTips": { en: "Recovery Tips", tr: "Toparlanma Önerileri" },
  "postpartum.selfCare": { en: "Self-Care Plan", tr: "Oz Bakim Plani" },

  // Posture Ergonomics page
  "posture.checklistComplete": { en: "Great! Ergonomics checklist complete!", tr: "Harika! Ergonomi kontrol listesi tamamlandı!" },

  // Pregnancy Tracker page
  "pregnancy.callNow": { en: "Call 911/112 IMMEDIATELY!", tr: "112'yi HEMEN arayın!" },
  "pregnancy.size": { en: "Size", tr: "Boy" },
  "pregnancy.weight": { en: "Weight", tr: "Ağırlık" },
  "pregnancy.warning": { en: "Warning", tr: "Dikkat" },
  "pregnancy.category": { en: "Category", tr: "Kategori" },
  "pregnancy.safe": { en: "Safe", tr: "Güvenli" },
  "pregnancy.safeSupplements": { en: "Safe Supplements", tr: "Güvenli Takviyeler" },
  "pregnancy.concernsPlaceholder": { en: "Write your concerns (optional)...", tr: "Endişelerinizi yazın (isteğe bağlı)..." },

  // Privacy Controls page
  "privacyCtrl.title": { en: "Privacy Controls", tr: "Gizlilik Kontrolleri" },
  "privacyCtrl.subtitle": { en: "Control how your data is used", tr: "Verilerinizin nasil kullanildigini kontrol edin" },
  "privacyCtrl.kvkkTitle": { en: "GDPR/KVKK Compliant", tr: "KVKK Uyumlu" },
  "privacyCtrl.kvkkDesc": { en: "Your data is stored encrypted. Hosted on servers compliant with regulations.", tr: "Verileriniz sifrelenerek saklanir. Türkiye sunucularinda barindiriliyor." },
  "privacyCtrl.retention": { en: "Data Retention Period", tr: "Veri Saklama Süresi" },
  "privacyCtrl.retentionNote": { en: "Your data will be automatically deleted after this period.", tr: "Bu sure sonunda verileriniz otomatik silinir." },
  "privacyCtrl.exportData": { en: "Export Data", tr: "Verilerimi İndir" },
  "privacyCtrl.deleteAccount": { en: "Delete Account", tr: "Hesabimi Sil" },

  // Privacy Policy page
  "privacy.march": { en: "March", tr: "Mart" },
  "privacy.s1Title": { en: "1. Introduction", tr: "1. Giriş" },
  "privacy.s1Text": { en: "Doctopal (\"Platform\") respects your privacy. This Privacy Policy explains how your personal data is collected, processed, stored, and protected. By using the Platform, you acknowledge and accept this policy.", tr: "Doctopal (\"Platform\") gizliliğinize saygı duyar. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, işlendiğini, saklandığını ve korunduğunu açıklar. Platformu kullanarak bu politikayı kabul etmiş sayılırsınız." },
  "privacy.s2Title": { en: "2. Data We Collect", tr: "2. Topladığımız Veriler" },
  "privacy.s2DirectLabel": { en: "Data you directly provide:", tr: "Doğrudan sağladığınız veriler:" },
  "privacy.s2d1": { en: "Account information (name, email, age, gender)", tr: "Hesap bilgileri (ad, e-posta, yaş, cinsiyet)" },
  "privacy.s2d2": { en: "Health profile (medications, allergies, chronic conditions, pregnancy status)", tr: "Sağlık profili (ilaçlar, alerjiler, kronik hastalıklar, gebelik durumu)" },
  "privacy.s2d3": { en: "Health queries and system responses", tr: "Sağlık sorguları ve sistem yanıtları" },
  "privacy.s2d4": { en: "Blood test values", tr: "Kan tahlili değerleri" },
  "privacy.s2AutoLabel": { en: "Automatically collected data:", tr: "Otomatik toplanan veriler:" },
  "privacy.s2a1": { en: "Technical usage data (page visits, anonymized)", tr: "Teknik kullanım verileri (sayfa ziyaretleri, anonimleştirilmiş)" },
  "privacy.s2a2": { en: "Device type and browser info (troubleshooting purposes only)", tr: "Cihaz türü ve tarayıcı bilgisi (yalnızca sorun giderme amaçlı)" },
  "privacy.s3Title": { en: "3. Purpose of Data Processing", tr: "3. Verilerin Kullanım Amacı" },
  "privacy.s3i1": { en: "Provide personalized health information", tr: "Kişiselleştirilmiş sağlık bilgisi sunmak" },
  "privacy.s3i2": { en: "Perform drug-herb interaction safety checks", tr: "İlaç-bitki etkileşim güvenlik kontrolleri gerçekleştirmek" },
  "privacy.s3i3": { en: "Deliver blood test analysis and lifestyle coaching", tr: "Kan tahlili analizi ve yaşam koçluğu sağlamak" },
  "privacy.s3i4": { en: "Profile-based safety checks (allergies, pregnancy, kidney/liver conditions)", tr: "Profil bazlı güvenlik kontrolleri (alerji, gebelik, böbrek/karaciğer)" },
  "privacy.s3i5": { en: "Improve service quality (anonymized data only)", tr: "Hizmet kalitesini iyileştirmek (yalnızca anonimleştirilmiş verilerle)" },
  "privacy.s4Title": { en: "4. Data Storage & Security", tr: "4. Veri Saklama ve Güvenlik" },
  "privacy.s4i1": { en: "Data is protected with industry-standard encryption", tr: "Veriler endüstri standardı şifreleme ile korunur" },
  "privacy.s4i2": { en: "TLS/SSL encryption applied during transmission", tr: "İletim sırasında TLS/SSL şifreleme uygulanır" },
  "privacy.s4i3": { en: "Row-Level Security (RLS) access control policies are in place", tr: "Satır düzeyinde erişim kontrolü (RLS) politikaları mevcuttur" },
  "privacy.s4i4": { en: "Server-side API key management — never in client code", tr: "Sunucu tarafı API anahtar yönetimi — istemci kodunda asla" },
  "privacy.s4i5": { en: "Data is automatically deleted after 2 years of inactivity", tr: "2 yıl hareketsizlik sonrası veriler otomatik olarak silinir" },
  "privacy.s5Title": { en: "5. Your Rights (KVKK / GDPR)", tr: "5. Haklarınız (KVKK / GDPR)" },
  "privacy.s5Intro": { en: "Under the Turkish Personal Data Protection Law (KVKK) and the General Data Protection Regulation (GDPR):", tr: "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Genel Veri Koruma Yönetmeliği (GDPR) kapsamında:" },
  "privacy.s5Access": { en: "Access:", tr: "Erişim:" },
  "privacy.s5AccessDesc": { en: "Download all your data from your profile page", tr: "Profil sayfanızdan tüm verilerinizi indirebilirsiniz" },
  "privacy.s5Rectification": { en: "Rectification:", tr: "Düzeltme:" },
  "privacy.s5RectificationDesc": { en: "Update your information at any time", tr: "Bilgilerinizi istediğiniz zaman güncelleyebilirsiniz" },
  "privacy.s5Erasure": { en: "Erasure:", tr: "Silme:" },
  "privacy.s5ErasureDesc": { en: "Permanently delete your account and all associated data", tr: "Hesabınızı ve tüm ilişkili verileri kalıcı olarak silebilirsiniz" },
  "privacy.s5Portability": { en: "Portability:", tr: "Taşınabilirlik:" },
  "privacy.s5PortabilityDesc": { en: "Download your data in machine-readable format (JSON)", tr: "Verilerinizi makine tarafından okunabilir formatta (JSON) indirebilirsiniz" },
  "privacy.s5Objection": { en: "Objection:", tr: "İtiraz:" },
  "privacy.s5ObjectionDesc": { en: "You reserve the right to object to data processing", tr: "Veri işlemeye itiraz hakkınız saklıdır" },
  "privacy.s6Title": { en: "6. Third-Party Data Processors", tr: "6. Veri İşleyen Üçüncü Taraflar" },
  "privacy.s6Intro": { en: "To deliver our services, we use third-party infrastructure providers in the following categories:", tr: "Hizmetlerimizi sunabilmek için aşağıdaki kategorilerde üçüncü taraf altyapı sağlayıcıları kullanmaktayız:" },
  "privacy.s6i1": { en: "Database and authentication infrastructure (Supabase — PostgreSQL)", tr: "Veritabanı ve kimlik doğrulama altyapısı (Supabase — PostgreSQL)" },
  "privacy.s6i2": { en: "Anthropic Claude API — AI analysis engine. Your health queries, medication list, and allergy information may be sent to generate personalized recommendations. No data is stored by Anthropic beyond the request.", tr: "Anthropic Claude API — Yapay zeka analiz motoru. Kisisellestirilmis oneriler uretmek icin saglik sorulariniz, ilac listeniz ve alerji bilgileriniz gonderilebilir. Anthropic tarafindan istek disinda veri saklanmaz." },
  "privacy.s6i3": { en: "PubMed E-utilities API and Europe PMC — Scientific research databases (publicly available medical literature)", tr: "PubMed E-utilities API ve Europe PMC — Bilimsel araştırma veritabanları (halka açık tıbbi literatür)" },
  "privacy.s6i4": { en: "OpenFDA API — Drug safety and interaction database (publicly available, no personal data transmitted)", tr: "OpenFDA API — İlaç güvenlik ve etkileşim veritabanı (halka açık, kişisel veri iletilmez)" },
  "privacy.s6i5": { en: "Vercel — Web hosting and serverless infrastructure", tr: "Vercel — Web barındırma ve sunucusuz altyapı" },
  "privacy.s6NoSale": { en: "Your personal data is never sold, rented, or shared with third parties for commercial purposes under any circumstances.", tr: "Kişisel verileriniz hiçbir koşulda üçüncü taraflara satılmaz, kiralanmaz veya ticari amaçla paylaşılmaz." },
  "privacy.s7Title": { en: "7. Cookies", tr: "7. Çerezler" },
  "privacy.s7Text": { en: "Only essential cookies are used for session management and user preferences (theme, language). No advertising, marketing, or tracking cookies are used.", tr: "Yalnızca oturum yönetimi ve kullanıcı tercihleri (tema, dil) için zorunlu çerezler kullanılmaktadır. Reklam, pazarlama veya takip amaçlı çerez kullanılmamaktadır." },
  "privacy.s8Title": { en: "8. Data Breach Notification", tr: "8. Veri İhlali Bildirimi" },
  "privacy.s8Text": { en: "In the event of a data breach, affected users and relevant authorities will be notified within 72 hours in accordance with KVKK and GDPR requirements.", tr: "Olası bir veri ihlali durumunda, KVKK ve GDPR gerekliliklerine uygun olarak etkilenen kullanıcılar ve ilgili otoriteler en geç 72 saat içinde bilgilendirilecektir." },
  "privacy.s9Title": { en: "9. Changes to This Policy", tr: "9. Değişiklikler" },
  "privacy.s9Text": { en: "This policy may be updated. Significant changes will be communicated to your registered email address. Continued use of the Platform constitutes acceptance of the updated policy.", tr: "Bu politika güncellenebilir. Önemli değişiklikler kayıtlı e-posta adresinize bildirilecektir. Platformu kullanmaya devam etmeniz güncellenmiş politikayı kabul ettiğiniz anlamına gelir." },
  "privacy.s10Title": { en: "10. Contact", tr: "10. İletişim" },
  "privacy.s10Text": { en: "For privacy-related inquiries:", tr: "Gizlilik ile ilgili talepleriniz için:" },

  // ── Proactive AI ──
  "proactive.exampleAlerts": { en: "Example Alerts (Preview)", tr: "Ornek Uyarılar (Onizleme)" },
  "proactive.features": { en: "Features", tr: "Özellikler" },

  // ── Profile ──
  "profile.contactLocation": { en: "Contact & Location", tr: "İletişim & Konum" },
  "profile.country": { en: "Country", tr: "Ülke" },
  "profile.countryPlaceholder": { en: "Turkey", tr: "Türkiye" },
  "profile.city": { en: "City", tr: "Şehir" },
  "profile.cityPlaceholder": { en: "Istanbul", tr: "İstanbul" },
  "profile.phone": { en: "Phone", tr: "Telefon" },
  "profile.phonePlaceholder": { en: "+1 (555) 000-0000", tr: "+90 5XX XXX XX XX" },
  "profile.recoveryEmail": { en: "Recovery Email", tr: "Kurtarma E-postası" },
  "profile.recoveryPlaceholder": { en: "backup@email.com", tr: "yedek@email.com" },
  "profile.recoveryDesc": { en: "Secondary email for account recovery", tr: "Hesap kurtarma için ikincil e-posta" },
  "profile.emergencyContacts": { en: "Emergency Contacts", tr: "Acil Durum Kişileri" },
  "profile.emergencyDesc": { en: "People to contact in a health emergency", tr: "Sağlık acilinde ulaşılacak kişiler" },
  "profile.add": { en: "Add", tr: "Ekle" },
  "profile.saved": { en: "Saved!", tr: "Kaydedildi!" },
  "profile.fullName": { en: "Full Name", tr: "Ad Soyad" },
  "profile.fullNamePlaceholder": { en: "e.g. John Doe", tr: "Örn: Ahmet Yılmaz" },
  "profile.relationship": { en: "Relationship", tr: "Yakınlık" },
  "profile.save": { en: "Save", tr: "Kaydet" },
  "profile.cancel": { en: "Cancel", tr: "İptal" },
  "profile.noEmergency": { en: "No emergency contacts yet", tr: "Henüz acil durum kişisi yok" },
  "profile.primary": { en: "Primary", tr: "Birincil" },
  "profile.setPrimary": { en: "Set primary", tr: "Birincil yap" },
  "profile.emergencyNote": { en: "Emergency contacts appear on your Emergency ID card", tr: "Acil durum kişileriniz Acil Kimlik kartınızda gösterilir" },

  // ── PTSD Support ──
  "ptsd.professionalNotice": { en: "PTSD requires professional support. This tool is a supportive resource, not a replacement for therapy.", tr: "TSSB profesyonel destek gerektirir. Bu arac yardımcı bir kaynaktir, terapi yerine gecmez." },
  "ptsd.severeWarning": { en: "Your symptoms appear severe. Please consider scheduling an appointment with a trauma therapist.", tr: "Semptomlariniz şiddetli gorunuyor. Lütfen bir travma terapistiyle görüşmek için randevu alin." },
  "ptsd.pastMonthQuestion": { en: "In the past month, how much were you bothered by the following?", tr: "Son 1 ay icinde asagidaki sorunlardan ne kadar rahatsiz oldunuz?" },
  "ptsd.thisWeek": { en: "this week", tr: "bu hafta" },
  "ptsd.triggers": { en: "Triggers", tr: "Tetikleyiciler" },
  "ptsd.flashbacks": { en: "Flashbacks", tr: "Flashback" },
  "ptsd.nightmares": { en: "Nightmares", tr: "Kabuslar" },
  "ptsd.avoidanceLevel": { en: "Avoidance Level", tr: "Kacinma Düzeyi" },
  "ptsd.groundingUsed": { en: "Used grounding techniques", tr: "Topraklama kullandim" },
  "ptsd.assessing": { en: "Assessing...", tr: "Değerlendiriliyor..." },
  "ptsd.copingStrategies": { en: "Coping Strategies", tr: "Basa Cikma Stratejileri" },
  "ptsd.professionalResources": { en: "Professional Resources", tr: "Profesyonel Kaynaklar" },

  // ── Rare Diseases ──
  "rare.details": { en: "Details", tr: "Detaylar" },
  "rare.diagnosis": { en: "Diagnosis", tr: "Tani" },
  "rare.treatment": { en: "Treatment", tr: "Tedavi" },
  "rare.prognosis": { en: "Prognosis", tr: "Prognoz" },
  "rare.specialists": { en: "Specialists", tr: "Uzmanlar" },
  "rare.patientAssociations": { en: "Patient Associations", tr: "Hasta Dernekleri" },

  // ── Rehabilitation ──
  "rehab.surgeryOrConditionRequired": { en: "Surgery or condition is required", tr: "Ameliyat veya durum bilgisi gerekli" },
  "rehab.surgeryPlaceholder": { en: "e.g., Knee replacement", tr: "ör. Diz protezi" },
  "rehab.conditionPlaceholder": { en: "e.g., Herniated disc", tr: "ör. Bel fıtığı" },
  "rehab.logs": { en: "logs", tr: "kayıt" },
  "rehab.recentLogs": { en: "Recent Logs", tr: "Son Kayıtlar" },

  // ── Research Hub ──
  "research.title": { en: "Research & Collaboration Hub", tr: "Araştırma & İş Birliği Hub'ı" },
  "research.subtitle": { en: "Open innovation platform for universities, public institutions and researchers. De-identified data, clinical validation pipeline and national health vision integration.", tr: "Üniversiteler, kamu kurumları ve araştırmacılar için açık inovasyon platformu. Anonimleştirilmiş veriler, klinik validasyon hattı ve ulusal sağlık vizyonu entegrasyonu." },
  "research.tabPartnership": { en: "Partnership Model", tr: "Ortaklık Modeli" },
  "research.tabData": { en: "Data Warehouse", tr: "Veri Ambarı" },
  "research.tabPipeline": { en: "Validation Pipeline", tr: "Validasyon Hattı" },
  "research.tabVision": { en: "National Vision", tr: "Ulusal Vizyon" },
  "research.dataGovernance": { en: "Data Governance", tr: "Veri Yönetişimi (Governance)" },
  "research.kvkkCompliant": { en: "KVKK / GDPR Compliant", tr: "KVKK / GDPR Uyumlu" },
  "research.gov1": { en: "All data de-identified with k-anonymity (k≥5)", tr: "Tüm veriler k-anonymity (k≥5) ile anonimleştirilir" },
  "research.gov2": { en: "User opt-in consent required (KVKK Article 5)", tr: "Kullanıcı opt-in onayı zorunlu (KVKK Madde 5)" },
  "research.gov3": { en: "Data access requires Ethics Board approval", tr: "Veri erişimi Etik Kurul onayına bağlı" },
  "research.gov4": { en: "Data minimization: only fields needed for research", tr: "Minimum veri ilkesi: sadece araştırma için gerekli alanlar" },
  "research.gov5": { en: "Audit log: every access is recorded", tr: "Audit log: her erişim kayıt altında" },
  "research.gov6": { en: "Data hosted in Turkey (Supabase EU region)", tr: "Veri Türkiye'de barındırılır (Supabase EU region)" },
  "research.openApi": { en: "Open Innovation API", tr: "Açık İnovasyon API" },
  "research.apiRateLimit": { en: "All endpoints protected with OAuth2 + API key. Rate limit: 1000 req/day academic, 10000 req/day enterprise.", tr: "Tüm endpoint'ler OAuth2 + API key ile korunur. Rate limit: 1000 req/gün akademik, 10000 req/gün kurumsal." },
  "research.targetPartners": { en: "Target Partnership Institutions", tr: "Hedef Ortaklık Kurumları" },
  "research.dataWarehouseSchema": { en: "Research Data Warehouse Schema", tr: "Araştırma Veri Ambarı Şeması" },
  "research.dataWarehouseDesc": { en: "Star schema architecture — fact tables (measurements) + dimension tables (context). Queryable with SQL and Python (Pandas).", tr: "Star schema mimarisi — fact tabloları (ölçümler) + dimension tabloları (bağlam). SQL ve Python (Pandas) ile sorgulanabilir." },
  "research.exampleQuery": { en: "Example Query: Sleep quality change in Ashwagandha users", tr: "Örnek Sorgu: Ashwagandha kullanıcılarının uyku kalitesi değişimi" },
  "research.clinicalPipeline": { en: "Clinical Validation Pipeline", tr: "Klinik Validasyon Hattı" },
  "research.entrepreneurProgram": { en: "Entrepreneur Support Program", tr: "Girişimci Destek Programı" },
  "research.dataAccess": { en: "Data Access", tr: "Veri Erişimi" },
  "research.dataAccessDesc": { en: "Approved startups get anonymous research data, cohort building tools and API access", tr: "Onaylı girişimcilere anonim araştırma verisi, kohort oluşturma araçları ve API erişimi" },
  "research.platformIntegration": { en: "Platform Integration", tr: "Platform Entegrasyonu" },
  "research.platformIntegrationDesc": { en: "Successful products added to Doctopal marketplace, reaching millions of users", tr: "Başarılı ürünler Doctopal marketplace'ine eklenir, milyonlarca kullanıcıya erişim" },
  "research.clinicalValidation": { en: "Clinical Validation", tr: "Klinik Validasyon" },
  "research.clinicalValidationDesc": { en: "PROMs-based pilot study capability on platform, academic publication support", tr: "Platform üzerinde PROMs bazlı pilot çalışma yapma imkanı, akademik yayın desteği" },
  "research.systemImpact": { en: "System-Level Impact — Investor Vision", tr: "Sistem Düzeyinde Etki — Yatırımcı Vizyonu" },
  "research.turkeyPop": { en: "Turkey Population", tr: "Türkiye Nüfusu" },
  "research.turkeyPopSub": { en: "Primary target market", tr: "İlk hedef pazar" },
  "research.globalMarket": { en: "Global Phytotherapy Market", tr: "Global Fitoterapi Pazarı" },
  "research.clinicalTrials": { en: "Active Clinical Trials", tr: "Aktif Klinik Çalışma" },
  "research.competitors": { en: "Competitors (This Segment)", tr: "Rakip (Bu Segmentte)" },
  "research.competitorsSub": { en: "Drug+herb+AI+outcome measurement", tr: "İlaç+bitki+AI+sonuç ölçümü" },
  "research.nhtsAlignment": { en: "National HVHS Transition Strategy Alignment", tr: "Ulusal HVHS Geçiş Stratejisi Uyumu" },
  "research.nhts1Strategy": { en: "Turkey 2023-2028 Health Transformation Program", tr: "Türkiye 2023-2028 Sağlık Dönüşüm Programı" },
  "research.nhts1Align": { en: "Digital health infrastructure, citizen-centered care, preventive health emphasis", tr: "Dijital sağlık altyapısı, vatandaş odaklı sağlık hizmeti, koruyucu sağlık vurgusu" },
  "research.nhts2Strategy": { en: "G20 Digital Health Framework", tr: "G20 Dijital Sağlık Çerçevesi" },
  "research.nhts2Align": { en: "Interoperability (FHIR), data sharing, AI safety", tr: "Interoperabilite (FHIR), veri paylaşımı, yapay zeka güvenliği" },
  "research.nhts3Strategy": { en: "WHO Traditional Medicine Strategy 2024-2034", tr: "WHO Geleneksel Tıp Stratejisi 2024-2034" },
  "research.nhts3Align": { en: "Evidence-based integration, safety monitoring, regulatory alignment", tr: "Kanıta dayalı entegrasyon, güvenlik izleme, regülasyon uyumu" },
  "research.nhts4Strategy": { en: "EU European Health Data Space (EHDS)", tr: "AB Dijital Sağlık Alanı (EHDS)" },
  "research.nhts4Align": { en: "Cross-border data sharing, patient data portability, secondary use framework", tr: "Sınır ötesi veri paylaşımı, hasta veri taşınabilirliği, ikincil kullanım çerçevesi" },
  "research.partnershipCta": { en: "Research Partnership Application", tr: "Araştırma Ortaklığı Başvurusu" },
  "research.partnershipCtaDesc": { en: "Apply for data access and collaboration as a university, public institution or research center.", tr: "Üniversite, kamu kurumu veya araştırma merkezi olarak veri erişimi ve iş birliği için başvurun." },
  "research.disclaimer": { en: "This page describes the research and collaboration framework. All data sharing is conducted in compliance with KVKK, GDPR and relevant regulations, with ethics board approval and user consent.", tr: "Bu sayfa araştırma ve iş birliği çerçevesini tanıtmaktadır. Tüm veri paylaşımları KVKK, GDPR ve ilgili yasal düzenlemelere uygun olarak, etik kurul onayı ve kullanıcı rızası ile gerçekleştirilir." },

  // ── Retirement Health ──
  "retirement.enterInfo": { en: "Enter Your Information", tr: "Bilgilerinizi Girin" },
  "retirement.screeningChecklist": { en: "Age-Based Screening Checklist", tr: "Yas Bazli Tarama Kontrol Listesi" },
  "retirement.checkupPlan": { en: "Personalized Check-up Plan", tr: "Kişisel Check-up Plani" },
  "retirement.cognitiveActivities": { en: "Cognitive Health Activities", tr: "Bilissel Sağlık Aktiviteleri" },
  "retirement.warningSigns": { en: "Warning Signs to Watch", tr: "Dikkat Edilecek Belirtiler" },
  "retirement.socialPlan": { en: "Social Activity Plan", tr: "Sosyal Aktivite Plani" },

  // ── Screen Time ──
  "screen.seconds": { en: "seconds", tr: "saniye" },
  "screen.feet": { en: "feet (6m)", tr: "fit (6m)" },
  "screen.adviceLow": { en: "Your screen habits look healthy. Keep up the good practices!", tr: "Ekran kullaniminiz sağlıkli gorunuyor. Iyi aliskanliklarinizi sürdürun!" },
  "screen.adviceModerate": { en: "Consider taking some steps to reduce your screen exposure.", tr: "Ekran kullaniminizi azaltmak için bazi adimlar atmaniz oneriliyor." },
  "screen.adviceHigh": { en: "Your screen usage may be negatively affecting your eye health. Follow the tips below.", tr: "Ekran kullaniminiz goz sağlığınizi olumsuz etkiliyor olabilir. Asagidaki ipuclarini uygulayın." },

  // ── Seasonal Food ──
  "seasonalFood.title": { en: "Seasonal Food Map", tr: "Mevsimsel Besin Haritası" },
  "seasonalFood.subtitle": { en: "Which foods are fresh and nutrient-rich this season", tr: "Bu mevsim hangi besinler taze ve besin değeri yüksek" },
  "seasonalFood.searchPlaceholder": { en: "Search food...", tr: "Besin ara..." },
  "seasonalFood.pairsWith": { en: "Pairs with:", tr: "Birlikte:" },
  "seasonalFood.noResults": { en: "No foods found for this criteria.", tr: "Bu kriterlere uygun besin bulunamadı." },

  // ── Seasonal Health ──
  "seasonal.activeMeds": { en: "Your active medications:", tr: "Aktif ilaçlarıniz:" },
  "seasonal.bossFightDesc": { en: "Check out Boss Fight protocols for seasonal health challenges!", tr: "Mevsimsel sağlık gorevleri için Boss Fight protokollerine goz atin!" },
  "seasonal.go": { en: "Go", tr: "Git" },

  // ── Second Opinion ──
  "secondOpinion.recommendedSpecialist": { en: "Recommended Specialist", tr: "Onerilen Uzman" },
  "secondOpinion.warningSigns": { en: "Warning Signs", tr: "Dikkat Gerektiren Isaretler" },
  "secondOpinion.medicalSummary": { en: "Medical Summary", tr: "Tibbi Ozet" },
  "secondOpinion.whatToBring": { en: "What to Bring", tr: "Yaninda Getirilecekler" },
  "secondOpinion.keyQuestions": { en: "Key Questions", tr: "Sorulacak Sorular" },
  "secondOpinion.suggestedTests": { en: "Suggested Additional Tests", tr: "Onerilen Ek Testler" },
  "secondOpinion.placeholder": { en: "e.g., My doctor recommended knee surgery, I want a second opinion...", tr: "ornegin: Doktorum diz ameliyati onerdi, ikinci bir gorus almak istiyorum..." },

  // ── Security ──
  "security.title": { en: "Security", tr: "Güvenlik" },
  "security.subtitle": { en: "The security of your health data is our top priority. Here are the security layers that keep you safe.", tr: "Sağlık verilerinizin guvenligi en buyuk onceligi\u0300mizdir. Istte bizi guclu kilan guvenlik katmanlari." },
  "security.dataEncryption": { en: "Data Encryption", tr: "Veri Sifreleme" },
  "security.dataEncryptionDesc": { en: "All health data is encrypted in transit with TLS 1.3 and at rest with AES-256 encryption.", tr: "Tum saglik verileriniz aktarim sirasinda TLS 1.3 ve beklemede AES-256 ile sifrelenir." },
  "security.kvkkGdpr": { en: "KVKK & GDPR Compliance", tr: "KVKK & GDPR Uyumu" },
  "security.kvkkGdprDesc": { en: "Full compliance with Turkish KVKK and EU GDPR regulations. You have the right to download and delete your data.", tr: "Turkiye KVKK ve AB GDPR duzenlemelerine tam uyum. Verilerinizi indirme ve silme hakkiniz vardir." },
  "security.authentication": { en: "Authentication", tr: "Kimlik Dogrulama" },
  "security.authenticationDesc": { en: "Secure session management with Supabase Auth. Google and Facebook OAuth, email verification supported.", tr: "Supabase Auth ile guvenli oturum yonetimi. Google ve Facebook OAuth, e-posta dogrulamasi desteklenir." },
  "security.infrastructure": { en: "Infrastructure Security", tr: "Altyapi Güvenliği" },
  "security.infrastructureDesc": { en: "Hosted on Vercel, Supabase PostgreSQL database. DDoS protection, automatic backups.", tr: "Vercel uzerinde barindirma, Supabase PostgreSQL veritabani. DDoS koruması, otomatik yedekleme." },
  "security.accessControl": { en: "Access Control", tr: "Erisim Kontrolu" },
  "security.accessControlDesc": { en: "Every API endpoint requires authentication. Rate limiting (10 requests/minute) enforced.", tr: "Her API endpoint kimlik dogrulama gerektirir. Hiz sinirlamasi (10 istek/dakika) uygulanir." },
  "security.dataMinimization": { en: "Data Minimization", tr: "Veri Minimizasyonu" },
  "security.dataMinimizationDesc": { en: "Only necessary data is collected. Health data stored in encrypted columns. Maximum 2-year retention.", tr: "Yalnizca gerekli veriler toplanir. Sağlık verileri sifreli kolonlarda saklanir. Maksimum 2 yil saklama." },
  "security.inputValidation": { en: "Input Validation", tr: "Giris Dogrulamasi" },
  "security.inputValidationDesc": { en: "All user inputs are sanitized. Protection against XSS, SQL injection, and other OWASP threats.", tr: "Tum kullanici girislerine sanitizasyon uygulanir. XSS, SQL injection ve diger OWASP tehditlerine karsi koruma." },
  "security.errorMonitoring": { en: "Error Monitoring", tr: "Hata Izleme" },
  "security.errorMonitoringDesc": { en: "Real-time error monitoring and performance tracking with Sentry. Security events reported instantly.", tr: "Sentry ile gercek zamanli hata izleme ve performans takibi. Güvenlik olaylari aninda bildirilir." },
  "security.reportVulnerability": { en: "Found a security vulnerability? Please report it to us.", tr: "Bir guvenlik acigi buldunuz mu? Lutfen bize bildirin." },

  // ── Sexual Health ──
  "sexual.preferNotToSay": { en: "Prefer not to say", tr: "Belirtmiyorum" },
  "sexual.selectConcerns": { en: "Select your concerns", tr: "Endiselerinizi secin" },
  "sexual.prevalence": { en: "Prevalence", tr: "Gorulen oran" },
  "sexual.yourConcerns": { en: "Your Concerns", tr: "Endiseleriniz" },
  "sexual.safetyInfo": { en: "Safety Information", tr: "Güvenlik Bilgileri" },
  "sexual.professionalReferral": { en: "We recommend discussing your concerns with a healthcare professional.", tr: "Endiseleriniz icin bir saglik profesyoneliyle gorusmenizi oneririz." },

  // ── Share Data ──
  "shareData.signedConsent": { en: "signed consent record", tr: "imzali riza kaydi" },

  // ── Shift Worker ──
  "shift.shiftHours": { en: "Shift Hours", tr: "Vardiya Saatleri" },
  "shift.circadianPlan": { en: "Circadian Rhythm Plan", tr: "Sirkadyen Ritim Plani" },
  "shift.sleepWindow": { en: "Sleep Window", tr: "Uyku Penceresi" },
  "shift.darkPeriod": { en: "Dark Period", tr: "Karanlik Donemi" },
  "shift.lightExposure": { en: "Light Exposure", tr: "Isik Maruziyeti" },
  "shift.sleepSchedule": { en: "Sleep Schedule", tr: "Uyku Programi" },
  "shift.mainSleep": { en: "Main Sleep", tr: "Ana Uyku" },
  "shift.napWindow": { en: "Nap Window", tr: "Sekerleme" },
  "shift.mealTiming": { en: "Meal Timing", tr: "Yemek Zamanlama" },
  "shift.caffeineStrategy": { en: "Caffeine Strategy", tr: "Kafein Stratejisi" },
  "shift.lastCaffeine": { en: "Last Caffeine", tr: "Son Kafein" },
  "shift.dailyMax": { en: "Daily Max", tr: "Gunluk Max" },
  "shift.timing": { en: "Timing:", tr: "Zamanlama:" },
  "shift.bestTime": { en: "Best Time", tr: "En Iyi Zaman" },
  "shift.avoid": { en: "Avoid", tr: "Kacinilmasi Gereken" },
  "shift.burnoutWarnings": { en: "Burnout Warning Signs", tr: "Tukenmislik Uyari Isaretleri" },

  // ── Skin Health ──
  "skin.loginRequired": { en: "Sign in to analyze your skin health", tr: "Cilt analizi icin giris yapin" },
  "skin.mild": { en: "Mild", tr: "Hafif" },
  "skin.skinHealthScore": { en: "Skin Health Score", tr: "Cilt Sagligi Skoru" },
  "skin.morning": { en: "Morning", tr: "Sabah" },
  "skin.evening": { en: "Evening", tr: "Aksam" },
  "skin.weekly": { en: "Weekly", tr: "Haftalık" },
  "skin.lifestyleTips": { en: "Lifestyle Tips", tr: "Yasam Tarzi Onerileri" },
  "skin.newAnalysis": { en: "Start new analysis", tr: "Yeni analiz yap" },
  "skin.routinePlaceholder": { en: "Describe your current skincare routine...", tr: "Mevcut cilt bakim rutininizi yazin..." },

  // ── Sleep Analysis ──
  "sleep.detectedPatterns": { en: "Detected Patterns", tr: "Tespit Edilen Oruntuler" },
  "sleep.average": { en: "Average", tr: "Ortalama" },
  "sleep.qualityLabel": { en: "Quality", tr: "Kalite" },
  "sleep.woke": { en: "woke", tr: "uyanma" },
  "sleep.dreamsLabel": { en: "Dreams", tr: "Ruyali" },

  // ── Smart Reminders ──
  "reminders.title": { en: "Smart Medication Reminder", tr: "Akilli İlaç Hatirlatici" },
  "reminders.subtitle": { en: "Personalized schedule ensuring your medications are taken at optimal times.", tr: "İlaçlarınizin en uygun zamanlarda alinmasini saglayan kisisellestirilmis program." },
  "reminders.subtitleShort": { en: "Your personalized schedule optimized by drug properties", tr: "İlaç ozelliklerine gore optimize edilmis kisisel programiniz" },
  "reminders.noMeds": { en: "No medications added yet", tr: "Henuz ilac eklenmemis" },
  "reminders.noMedsDesc": { en: "Add your medications to your profile to generate smart scheduling.", tr: "İlaçlarınizi profilinize ekleyerek akilli zamanlama olusturun." },
  "reminders.addMeds": { en: "Add Medications in Profile", tr: "Profilde İlaç Ekle" },
  "reminders.nextUp": { en: "Next Up", tr: "Siradaki" },
  "reminders.dailySchedule": { en: "Your Daily Schedule", tr: "Gunluk Programiniz" },
  "reminders.colorLegend": { en: "Color Legend", tr: "Renk Kodlari" },
  "reminders.notifSettings": { en: "Notification Settings", tr: "Bildirim Ayarlari" },
  "reminders.notifDesc": { en: "Set reminder times for each medication", tr: "Her ilac icin hatirlatma saati belirleyin" },
  "reminders.notifComingSoon": { en: "PWA push notifications will be enabled in an upcoming release.", tr: "PWA push bildirimleri yakin bir surumde etkinlestirilecektir." },
  "reminders.timingGuide": { en: "Medication Timing Guide", tr: "İlaç Zamanlama Kilavuzu" },
  "reminders.noTimingRule": { en: "No specific timing rule found for this medication. Follow your doctor's instructions.", tr: "Bu ilac icin ozel zamanlama kurali bulunamadi. Doktorunuzun onerilerine uyun." },
  "reminders.disclaimer": { en: "This schedule is for informational purposes. Always follow your doctor's instructions for medication timing.", tr: "Bu program genel bilgi amaclidir. İlaç zamanlamasi icin her zaman doktorunuzun talimatlarini takip edin." },
  "reminders.vitCEnhances": { en: "Vitamin C enhances absorption", tr: "C vitamini emilimi artirir" },

  // ── Smoking Cessation ──
  "smoking.perDay": { en: "/day", tr: "/gun" },
  "smoking.perMonth": { en: "/month", tr: "/ay" },
  "smoking.perYear": { en: "/year", tr: "/yil" },
  "smoking.updatePlan": { en: "Update Plan", tr: "Plani Guncelle" },

  // ── Snoring Apnea ──
  "snoring.stopBangInfo": { en: "STOP-BANG is a clinically validated screening tool for assessing obstructive sleep apnea risk.", tr: "STOP-BANG, obstruktif uyku apnesi riskini degerlendirmek icin klinik olarak dogrulanmis bir tarama aracidir." },
  "snoring.sleepLabRecommended": { en: "Sleep lab evaluation recommended", tr: "Uyku laboratuvari degerlendirmesi onerilir" },

  // ── Social Prescription ──
  "socialRx.title": { en: "Social Prescription", tr: "Sosyal Recete" },
  "socialRx.subtitle": { en: "Social activities alongside medication — NHS endorsed", tr: "İlaç yaninda sosyal aktivite recetesi — NHS onayli" },
  "socialRx.nhsNote": { en: "UK NHS officially implements social prescribing. Evidence-based impact on depression, isolation, and chronic pain.", tr: "Ingiltere NHS, sosyal recelemeyi resmi olarak uygulamaktadir. Depresyon, izolasyon ve kronik agride kanitlanmis etki." },
  "socialRx.yourPrescription": { en: "Your Social Prescription", tr: "Senin Sosyal Receten" },
  "socialRx.suggestedActivities": { en: "Suggested Activities:", tr: "Onerilen Aktiviteler:" },
  "socialRx.added": { en: "Added", tr: "Eklendi" },
  "socialRx.addToPrescription": { en: "Add to Prescription", tr: "Receteme Ekle" },

  // ── Sports Performance (extra) ──
  "sports.guestNote": { en: "Sign in for medication interaction checking", tr: "İlaç etkileşim kontrolü için giriş yapın" },
  "sports.daysPerWeek": { en: "days/week", tr: "gün/hafta" },
  "sports.currentSupplements": { en: "Current Supplements (optional)", tr: "Mevcut Takviyeler (isteğe bağlı)" },
  "sports.supplementsPlaceholder": { en: "e.g., creatine, protein powder, omega-3", tr: "örn: kreatin, protein tozu, omega-3" },
  "sports.interactionWarnings": { en: "Medication Interaction Warnings", tr: "İlaç Etkileşim Uyarıları" },
  "sports.weeklyStructure": { en: "Weekly Structure", tr: "Haftalık Yapı" },
  "sports.preWorkout": { en: "Pre-Workout", tr: "Antrenman Öncesi" },
  "sports.duringWorkout": { en: "During Workout", tr: "Antrenman Sırasında" },
  "sports.postWorkout": { en: "Post-Workout", tr: "Antrenman Sonrası" },
  "sports.injuryPrevention": { en: "Injury Prevention", tr: "Sakatlığı Önleme" },
  "sports.safe": { en: "Safe", tr: "Güvenli" },
  "sports.avoid": { en: "Avoid", tr: "Kaçınılmalı" },
  "sports.dose": { en: "Dose", tr: "Doz" },
  "sports.timing": { en: "Timing", tr: "Zamanlama" },
  "sports.newPlan": { en: "New Plan", tr: "Yeni Plan" },
  "sports.selectSport": { en: "Please select a sport type", tr: "Lütfen bir spor türü seçin" },
  "sports.selectGoal": { en: "Please select a goal", tr: "Lütfen bir hedef seçin" },
  "sports.intentPlaceholder": { en: "What can we achieve for you today? (e.g., I do CrossFit and want to improve shoulder mobility)", tr: "Bugün senin için ne başarabiliriz? (örn: CrossFit yapıyorum ve omuz hareketliliğimi artırmak istiyorum)" },
  "sports.intentExtracting": { en: "Understanding your goals...", tr: "Hedefleriniz anlaşılıyor..." },
  "sports.intentConfirm": { en: "Here's what I understood:", tr: "Anladığım şu:" },
  "sports.editIntent": { en: "Edit", tr: "Düzenle" },
  "sports.continue": { en: "Continue", tr: "Devam" },
  "sports.todayFocus": { en: "Today's Focus", tr: "Bugünün Odağı" },
  "sports.keyAction": { en: "Key Action", tr: "Ana Aksiyon" },
  "sports.taken": { en: "Taken", tr: "Alındı" },
  "sports.supplementProgress": { en: "Supplement Progress", tr: "Takviye İlerlemesi" },
  "sports.allTaken": { en: "All supplements taken!", tr: "Tüm takviyeler alındı!" },
  "sports.streak": { en: "Day Streak", tr: "Günlük Seri" },
  "sports.why": { en: "Why?", tr: "Neden?" },
  "sports.whatToDo": { en: "What to do?", tr: "Ne yapmalı?" },
  "sports.weeklyProgress": { en: "Weekly Progress", tr: "Haftalık İlerleme" },
  "sports.completed": { en: "completed", tr: "tamamlandı" },
  "sports.sport": { en: "Sport", tr: "Spor" },
  "sports.focus": { en: "Focus", tr: "Odak" },
  "sports.experience": { en: "Experience", tr: "Deneyim" },
  "sports.generatingPlan": { en: "Creating your personalized plan...", tr: "Kişisel planınız oluşturuluyor..." },
  "sports.riskLevel": { en: "Risk Level", tr: "Risk Seviyesi" },

  // ── Landing Quick Chips ──
  "lp.chipInteraction": { en: "Drug Interaction Check", tr: "İlaç Etkileşim Kontrolü" },
  "lp.chipBloodTest": { en: "Upload Blood Test", tr: "Tahlil Yükle" },
  "lp.chipHerbOfDay": { en: "Herb of the Day", tr: "Günün Bitkisi" },
  "lp.chipSleep": { en: "Sleep Optimization", tr: "Uyku Optimizasyonu" },
  "lp.chipSports": { en: "Sports Performance", tr: "Spor Performansı" },

  // ── Master Orchestrator ──
  "synergy.title": { en: "Daily Synergy Report", tr: "Günün Sinerji Raporu" },
  "synergy.priority": { en: "Today's Priority", tr: "Bugünün Önceliği" },
  "synergy.connections": { en: "Cross-module connections:", tr: "Modüller arası bağlantı:" },
  "synergy.score": { en: "Synergy Score", tr: "Sinerji Skoru" },

  // ── Sleep Redesign ──
  "sleep.goodMorning": { en: "Good morning!", tr: "Günaydın!" },
  "sleep.aiGuess": { en: "I'm guessing you slept around", tr: "Tahminen şu kadar uyudun:" },
  "sleep.correct": { en: "That's right!", tr: "Doğru!" },
  "sleep.adjust": { en: "Let me adjust", tr: "Düzelteyim" },
  "sleep.whatAffected": { en: "What affected your sleep?", tr: "Uykunu ne etkiledi?" },
  "sleep.howFeel": { en: "How do you feel this morning?", tr: "Bu sabah nasıl hissediyorsun?" },
  "sleep.microInsight": { en: "Today's Insight", tr: "Bugünün İçgörüsü" },
  "sleep.sleepDebt": { en: "Sleep Debt", tr: "Uyku Borcu" },
  "sleep.sleepDebtHours": { en: "hours behind", tr: "saat geride" },
  "sleep.onTrack": { en: "On track!", tr: "Yolundasın!" },
  "sleep.chronotypeAnimal": { en: "Your Sleep Animal", tr: "Uyku Hayvanın" },
  "sleep.bear": { en: "Bear", tr: "Ayı" },
  "sleep.bearDesc": { en: "You follow the sun — early to bed, early to rise. Steady and strong!", tr: "Güneşi takip ediyorsun — erken yat, erken kalk. Kararlı ve güçlü!" },
  "sleep.wolf": { en: "Wolf", tr: "Kurt" },
  "sleep.wolfDesc": { en: "Night owl energy! You peak in the evening. Creative and sharp after dark.", tr: "Gece kuşu enerjisi! Akşam zirvedesin. Karanlıktan sonra yaratıcı ve keskin." },
  "sleep.dolphin": { en: "Dolphin", tr: "Yunus" },
  "sleep.dolphinDesc": { en: "Light sleeper with a brilliant mind. You need extra wind-down time.", tr: "Hafif uyuyan, parlak zekâ. Ekstra rahatlamaya ihtiyacın var." },
  "sleep.lion": { en: "Lion", tr: "Aslan" },
  "sleep.lionDesc": { en: "Morning powerhouse! You conquer the day before others wake up.", tr: "Sabah güç merkezi! Diğerleri kalkmadan günü fethediyorsun." },
  "sleep.windDown": { en: "Wind-Down Mode", tr: "Uykuya Hazırlık Modu" },
  "sleep.windDownMsg": { en: "Time to prepare for sleep. Here's your evening ritual:", tr: "Uyku hazırlığı zamanı. İşte akşam ritüelin:" },
  "sleep.weeklyOverview": { en: "This Week", tr: "Bu Hafta" },
  "sleep.loggedToday": { en: "Logged today!", tr: "Bugün kaydedildi!" },
  "sleep.tapToLog": { en: "Tap to log last night's sleep", tr: "Dün geceki uykuyu kaydetmek için dokun" },

  // ── Nudge ──
  "nudge.dropOff": { en: "We miss you!", tr: "Seni özledik!" },
  "nudge.streak": { en: "Amazing streak!", tr: "Harika seri!" },
  "nudge.riskAlert": { en: "Safety Alert", tr: "Güvenlik Uyarısı" },
  "nudge.acknowledged": { en: "Got it!", tr: "Anladım!" },
  "nudge.sent": { en: "Nudge sent", tr: "Bildirim gönderildi" },
  "api.nudge.noTriggers": { en: "No triggers found", tr: "Tetikleyici bulunamadı" },

  // ── Stretching ──
  "stretch.selectPainPoints": { en: "Select your pain points:", tr: "Agri noktalarinizi seciniz:" },
  "stretch.seconds": { en: "seconds", tr: "saniye" },
  "stretch.pause": { en: "Pause", tr: "Duraklat" },
  "stretch.nextStretch": { en: "Next Stretch", tr: "Sonraki Hareket" },
  "stretch.routineComplete": { en: "Routine complete!", tr: "Rutin tamamlandi!" },
  "stretch.selectToStart": { en: "Select pain points to start", tr: "Baslamak icin agri noktalarinizi seciniz" },

  // ── Student Health ──
  "student.substanceRisk": { en: "Substance Use Risk Information", tr: "Madde Kullanimi Risk Bilgisi" },
  "student.needHelp": { en: "Need help?", tr: "Yardima mi ihtiyacin var?" },
  "student.campusCounseling": { en: "Campus counseling is free. Crisis line: 988 (US) / 182 (TR)", tr: "Kampus psikolojik danismanlik ucretsizdir. Kriz hatti: 182" },

  // ── Sun Exposure (extra) ──
  "sun.veryHigh": { en: "Very High", tr: "Cok Yuksek" },
  "sun.extreme": { en: "Extreme", tr: "Asiri" },
  "sun.photoMedsNote": { en: "These medications increase your sun sensitivity. Increase sun protection and reduce exposure time.", tr: "Bu ilaclar gunes hassasiyetinizi artirir. Gunes korumanizi artirin ve maruziyet suresini azaltin." },
  "sun.timeHalved": { en: "Time halved due to photosensitizing medication", tr: "Isiga duyarli ilac nedeniyle sure yariya indirildi" },

  // ── Supplement Marketplace ──
  "marketplace.badge": { en: "Supplement Guide", tr: "Takviye Rehberi" },
  "marketplace.title": { en: "Supplement Marketplace", tr: "Takviye Pazari" },
  "marketplace.desc": { en: "Evidence-based supplements, trusted brands, and pharmacy-quality recommendations. Always check interactions before starting.", tr: "Kanita dayali takviyeler, guvenilir markalar ve eczane kalitesi oneriler. Baslamadan once etkilesim kontrolu yapin." },
  "marketplace.warning": { en: "Always choose standardized extracts from pharmacies, not herbalists. Consult your doctor before starting any supplement.", tr: "Her zaman acik aktardan degil, eczanede satilan standardize edilmis formlari tercih edin. Herhangi bir takviyeye baslamadan once doktorunuza danisin." },
  "marketplace.searchPlaceholder": { en: "Search supplements...", tr: "Takviye ara..." },
  "marketplace.favorites": { en: "Favorites", tr: "Favoriler" },
  "marketplace.pharmacyQuality": { en: "Pharmacy Quality", tr: "Eczane Kalitesi" },
  "marketplace.recommendedBrands": { en: "Recommended Brands", tr: "Onerilen Markalar" },
  "marketplace.checkInteractions": { en: "Check Interactions", tr: "Etkilesim Kontrol" },
  "marketplace.buy": { en: "Buy", tr: "Satin Al" },
  "marketplace.noResults": { en: "No results found. Try a different search.", tr: "Sonuc bulunamadi. Farkli bir arama deneyin." },
  "marketplace.affiliateDisclaimer": { en: "These links are provided for convenience only. Product suggestions never influence our health recommendations.", tr: "Bu linkler kolaylik amaciyla sunulmaktadir. Urun onerileri saglik tavsiyelerimizi asla etkilemez." },
  "marketplace.addToFavorites": { en: "Add to favorites", tr: "Favorilere ekle" },

  // ── Support Groups ──
  "support.waiting": { en: "waiting", tr: "bekliyor" },
  "support.whatToExpect": { en: "What to Expect", tr: "Neler Gelecek" },

  // ── Symptom Checker (extra) ──
  "symptom.emergency": { en: "EMERGENCY", tr: "ACIL DURUM" },
  "symptom.call911": { en: "Call 911/112", tr: "112'yi Ara" },

  // ── Talent Hub ──
  "talent.sampleData": { en: "SAMPLE DATA", tr: "ORNEK VERI" },
  "talent.noProfessionals": { en: "No registered professionals yet", tr: "Henuz kayitli profesyonel yok" },
  "talent.beFirst": { en: "Be the first to register!", tr: "Ilk profesyonel siz olun!" },
  "talent.languages": { en: "languages", tr: "dil" },
  "talent.personalInfo": { en: "Personal & Contact Information", tr: "Kisisel & Iletisim Bilgileri" },
  "talent.fullName": { en: "Full Name", tr: "Ad Soyad" },
  "talent.titleLabel": { en: "Title", tr: "Unvan" },
  "talent.email": { en: "Email", tr: "E-posta" },
  "talent.phone": { en: "Phone", tr: "Telefon" },
  "talent.city": { en: "City", tr: "Sehir" },
  "talent.shortBio": { en: "Short Bio", tr: "Kisa Biyografi" },
  "talent.bioPlaceholder": { en: "Briefly describe your expertise and experience...", tr: "Uzmanliginizi ve deneyiminizi kisaca anlatin..." },
  "talent.specialtyTitle": { en: "Specialty & Academic Title", tr: "Brans & Akademik Unvan" },
  "talent.profession": { en: "Profession", tr: "Meslek" },
  "talent.specialty": { en: "Specialty", tr: "Uzmanlik Alani" },
  "talent.academicTitle": { en: "Academic Title", tr: "Akademik Unvan" },
  "talent.licenseNumber": { en: "License Number", tr: "Diploma/Sicil No" },
  "talent.institution": { en: "Current Institution", tr: "Mevcut Kurum" },
  "talent.experienceTitle": { en: "Clinical Experience & Education", tr: "Klinik Deneyim & Egitim Gecmisi" },
  "talent.totalExperience": { en: "Total Experience (Years)", tr: "Toplam Deneyim (Yil)" },
  "talent.education": { en: "Education", tr: "Egitim" },
  "talent.institutionPlaceholder": { en: "Institution", tr: "Kurum" },
  "talent.degree": { en: "Degree", tr: "Derece" },
  "talent.year": { en: "Year", tr: "Yil" },
  "talent.addEducation": { en: "Add Education", tr: "Egitim Ekle" },
  "talent.languagesLabel": { en: "Languages", tr: "Diller" },
  "talent.skillsTitle": { en: "Specialized Skills & Certifications", tr: "Ozellestirilmis Yetenekler & Sertifikalar" },
  "talent.certifications": { en: "Certifications", tr: "Sertifikalar" },
  "talent.certName": { en: "Certificate Name", tr: "Sertifika Adi" },
  "talent.certIssuer": { en: "Issuer", tr: "Veren Kurum" },
  "talent.addCertificate": { en: "Add Certificate", tr: "Sertifika Ekle" },

  // ── Talent Hub Verify ──
  "verify.yourName": { en: "Your Name", tr: "Adiniz Soyadiniz" },
  "verify.yourSpecialty": { en: "Your Specialty", tr: "Uzmanlik Alaniniz" },
  "verify.verified": { en: "Verified", tr: "Onayli" },

  // ── Terms Page ──
  "terms.month": { en: "March", tr: "Mart" },
  "terms.acceptance": { en: "1. Acceptance of Terms", tr: "1. Kabul" },
  "terms.acceptanceText": { en: "By using the Doctopal Platform (\"Platform\"), you acknowledge that you have read, understood, and agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the Platform.", tr: "Doctopal Platformunu (\"Platform\") kullanarak bu Kullanim Kosullarini ve Gizlilik Politikamizi okudugunuzu, anladiginizi ve kabul ettiginizi beyan edersiniz. Kabul etmiyorsaniz Platformu kullanmayiniz." },
  "terms.serviceDesc": { en: "2. Service Description", tr: "2. Hizmet Tanimi" },
  "terms.serviceDescText": { en: "Doctopal is an educational decision-support tool that provides general health information based on published scientific research. Our services include:", tr: "Doctopal, yayimlanmis bilimsel arastirmalara dayali genel saglik bilgisi sunan bir egitim ve karar destek aracidir. Hizmetlerimiz:" },
  "terms.serviceItem1": { en: "Drug-herb interaction information system", tr: "Ilac-bitki etkilesim bilgi sistemi" },
  "terms.serviceItem2": { en: "Evidence-based general health information assistant", tr: "Kanita dayali genel saglik bilgi asistani" },
  "terms.serviceItem3": { en: "Informational interpretation of blood test values", tr: "Kan tahlili degerlerinin bilgilendirici yorumu" },
  "terms.serviceItem4": { en: "Informational lifestyle suggestions", tr: "Bilgilendirici yasam tarzi onerileri" },
  "terms.medicalDisclaimer": { en: "3. Medical Disclaimer", tr: "3. Tibbi Sorumluluk Reddi" },
  "terms.readCarefully": { en: "Please read carefully", tr: "Lutfen dikkatle okuyunuz" },
  "terms.disclaimerP1": { en: "Doctopal is a health information platform. It is not a medical device, diagnostic tool, or treatment system. The Platform does not diagnose conditions, suggest treatment plans, or prescribe medications under any circumstances.", tr: "Doctopal bir saglik bilgi platformudur. Tibbi bir cihaz, teshis araci veya tedavi sistemi degildir. Platform hicbir kosulda hastalik teshisi koymaz, tedaviplanı onermez veya ilac recetesi yazmaz." },
  "terms.disclaimerP2": { en: "All content is general informational material based on published scientific sources and does not replace the advice of a doctor, pharmacist, dietitian, or any healthcare professional. Always consult your healthcare provider before starting any supplement, making medication changes, or making decisions about your health.", tr: "Sunulan tum icerik, yayimlanmis bilimsel kaynaklara dayali genel bilgilendirme niteligindedir ve doktor, eczaci, diyetisyen veya herhangi bir saglik profesyonelinin yerini almaz. Herhangi bir takviye kullanmaya baslamadan, ilac degisikligi yapmadan veya sagliginizla ilgili bir karar vermeden once mutlaka saglik profesyonelinize danisiniz." },
  "terms.disclaimerP3": { en: "In a medical emergency, immediately call your local emergency services number.", tr: "Acil bir saglik durumunda derhal bulundugunuz ulkenin acil yardim hattini arayiniz." },
  "terms.disclaimerP4": { en: "You are solely responsible for any decisions you make based on information provided by the Platform. The Platform does not intend to create or replace the relationship between any healthcare professional and a patient.", tr: "Platformun sundugu bilgilere dayanarak verdiginiz kararlarin sorumlulugu yalnizca size aittir. Platform, herhangi bir saglik profesyoneli ile hasta arasindaki iliskiyi kurmayi ya da bu iliskinin yerine gecmeyi amaclamamaktadir." },
  "terms.userResponsibilities": { en: "4. User Responsibilities", tr: "4. Kullanici Sorumluluklari" },
  "terms.userResp1": { en: "You must provide accurate and up-to-date health information; consequences of inaccurate information are your responsibility", tr: "Dogru ve guncel saglik bilgileri saglamalisiniz; yanlis bilgiden dogan sonuclar sizin sorumlulugunuzdadir" },
  "terms.userResp2": { en: "You must regularly update your medication list", tr: "İlaç listenizi duzenli olarak guncellemelisiniz" },
  "terms.userResp3": { en: "You must consult your healthcare provider before acting on information obtained from the Platform", tr: "Platformdan edinilen bilgileri uygulama karari almadan once saglik profesyonelinize danismalisiniz" },
  "terms.userResp4": { en: "You must be 18 or older, or use under parental/legal guardian supervision", tr: "18 yasindan buyuk olmalisiniz veya ebeveyn/yasal vasi gozetiminde kullanmalisiniz" },
  "terms.userResp5": { en: "You must not misuse the service or perform automated queries", tr: "Hizmeti kotuye kullanmamali, otomatik sorgulama yapmamalisiniz" },
  "terms.infoAccuracy": { en: "5. Information Accuracy & Limitations", tr: "5. Bilgi Dogrulugu ve Sinirlamalari" },
  "terms.infoItem1": { en: "Information provided is sourced from publicly available scientific research databases (PubMed, NIH, WHO)", tr: "Sunulan bilgiler halka acik bilimsel arastirma veritabanlarindan (PubMed, NIH, WHO) elde edilmektedir" },
  "terms.infoItem2": { en: "AI models may produce errors; all information requires independent verification", tr: "Yapay zeka modelleri hata yapabilir; her bilgi bagimsiz dogrulama gerektirir" },
  "terms.infoItem3": { en: "Scientific knowledge is continuously evolving; the Platform may not always reflect the most current data", tr: "Bilimsel bilgi surekli guncellenmektedir; Platform her zaman en guncel veriyi yansitmayabilir" },
  "terms.infoItem4": { en: "Drug-herb interaction results are informational and do NOT substitute for clinical judgment", tr: "Ilac-bitki etkilesim sonuclari bilgilendirme amaclidir, klinik karar yerine GECMEZ" },
  "terms.liability": { en: "6. Limitation of Liability", tr: "6. Sorumluluk Sinirlamasi" },
  "terms.liabilityText": { en: "Doctopal and its team shall not be liable for any direct, indirect, incidental, special, or consequential damages (including but not limited to health outcomes, financial losses, data loss) arising from the use of information provided by the Platform. All information is provided \"as is\" and \"as available\" without any express or implied warranties.", tr: "Doctopal ve ekibi, Platformun sundugu bilgilerin kullanimindan kaynaklanan dogrudan, dolayli, arizi, ozel veya sonuc olarak ortaya cikan hicbir zarardan (saglik sonuclari, mali kayiplar, veri kaybi dahil ancak bunlarla sinirli olmaksizin) sorumlu tutulamaz. Tum bilgiler \"oldugu gibi\" ve \"mevcut haliyle\" sunulur; acik veya zimni hicbir garanti verilmemektedir." },
  "terms.ip": { en: "7. Intellectual Property", tr: "7. Fikri Mulkiyet" },
  "terms.ipText": { en: "All content, design, logos, software, and database structures of the Platform are protected by intellectual property rights. Unauthorized copying, distribution, reverse engineering, or commercial use is prohibited.", tr: "Platformun tum icerigi, tasarimi, logolari, yazilimi ve veritabani yapilari fikri mulkiyet haklariyla korunmaktadir. Izinsiz kopyalama, dagitma, tersine muhendislik veya ticari kullanim yasaktir." },
  "terms.interruption": { en: "8. Service Interruption", tr: "8. Hizmet Kesintisi" },
  "terms.interruptionText": { en: "The Platform may become temporarily or permanently unavailable at any time without prior notice due to maintenance, updates, or technical reasons. No liability is accepted for such interruptions.", tr: "Platform herhangi bir zamanda, onceden bildirimsiz olarak bakim, guncelleme veya teknik nedenlerle gecici ya da kalici olarak hizmet disi kalabilir. Bu tur kesintilerden dolayi sorumluluk kabul edilmemektedir." },
  "terms.termination": { en: "9. Account Termination", tr: "9. Hesap Feshi" },
  "terms.terminationText": { en: "In case of violation of these terms, your account may be suspended or terminated without prior notice. You may delete your account at any time from your profile page.", tr: "Kullanim kosullarinin ihlali durumunda hesabiniz onceden bildirim yapilmaksizin askiya alinabilir veya kapatilabilir. Hesabinizi istediginiz zaman profil sayfanizdan silebilirsiniz." },
  "terms.modifications": { en: "10. Modifications", tr: "10. Degisiklikler" },
  "terms.modificationsText": { en: "These terms may be updated. Significant changes will be communicated to your registered email address. Continued use of the Platform constitutes acceptance of the updated terms.", tr: "Bu kosullar guncellenebilir. Onemli degisiklikler kayitli e-posta adresinize bildirilecektir. Platformu kullanmaya devam etmeniz guncellenmis kosullari kabul ettiginiz anlamina gelir." },
  "terms.governingLaw": { en: "11. Governing Law", tr: "11. Uygulanacak Hukuk" },
  "terms.governingLawText": { en: "These terms are governed by the laws of the Republic of Turkey. In case of disputes, the Consumer Arbitration Boards and Consumer Courts at the user's place of residence shall have jurisdiction.", tr: "Bu kosullar Turkiye Cumhuriyeti kanunlarina tabidir. Uyusmazlik halinde kullanicinin yerlesim yerindeki Tuketici Hakem Heyetleri ve Tuketici Mahkemeleri yetkilidir." },
  "terms.contact": { en: "12. Contact", tr: "12. Iletisim" },
  "terms.contactText": { en: "For questions and inquiries:", tr: "Sorulariniz ve talepleriniz icin:" },

  // ── Thyroid Dashboard ──
  "thyroid.medTiming": { en: "Medication Timing Optimization", tr: "İlaç Zamanlama Optimizasyonu" },
  "thyroid.pregnancyNote": { en: "Pregnancy & Thyroid", tr: "Gebelik ve Tiroid" },

  // ── Time Capsule ──
  "timeCapsule.back": { en: "Back", tr: "Geri" },
  "timeCapsule.opened": { en: "Your Time Capsule is Open!", tr: "Zaman Kapsulun Acildi!" },
  "timeCapsule.created": { en: "Created", tr: "Olusturulma" },
  "timeCapsule.pastMessage": { en: "Your message from the past:", tr: "Gecmisten mesajin:" },
  "timeCapsule.thenVsNow": { en: "Then vs Now", tr: "O Zaman vs Simdi" },
  "timeCapsule.healthScore": { en: "Health Score", tr: "Sağlık Skoru" },
  "timeCapsule.weight": { en: "Weight", tr: "Kilo" },
  "timeCapsule.today": { en: "Today", tr: "Bugun" },
  "timeCapsule.goals": { en: "Goals", tr: "Hedefler" },
  "timeCapsule.deleteCapsule": { en: "Delete Capsule", tr: "Kapsulu Sil" },
  "timeCapsule.writeTitle": { en: "Write to Your Future Self", tr: "Gelecege Mektup Yaz" },
  "timeCapsule.writeSubtitle": { en: "Leave a message from your present self to your future self.", tr: "Bugunku halinden gelecekteki haline bir mesaj birak." },
  "timeCapsule.yourMessage": { en: "Your Message", tr: "Mesajin" },
  "timeCapsule.placeholder": { en: "Dear future me, I hope you are healthier and happier...", tr: "Gelecekteki ben, umarim seni daha saglikli ve mutlu buluyorum..." },
  "timeCapsule.healthGoals": { en: "Health Goals", tr: "Sağlık Hedeflerin" },
  "timeCapsule.whenOpen": { en: "When Should It Open?", tr: "Ne Zaman Acilsin?" },
  "timeCapsule.snapshot": { en: "Health Snapshot", tr: "Sağlık Anlik Goruntusu" },
  "timeCapsule.snapshotDesc": { en: "Your current health data will be saved automatically.", tr: "Mevcut saglik verilerin otomatik olarak kaydedilecek." },
  "timeCapsule.score": { en: "Score:", tr: "Skor:" },
  "timeCapsule.weightLabel": { en: "Weight:", tr: "Kilo:" },
  "timeCapsule.lockSend": { en: "Lock & Send Capsule", tr: "Kapsulu Kilitle ve Gonder" },
  "timeCapsule.title": { en: "Health Time Capsule", tr: "Sağlık Zaman Kapsulu" },
  "timeCapsule.subtitle": { en: "Write a letter to your future self, save your health goals. Compare with real data when the time comes.", tr: "Gelecege bir mektup yaz, saglik hedeflerini kaydet. Zaman geldiginde gercek verilerle karsilastir." },
  "timeCapsule.createNew": { en: "Create New Capsule", tr: "Yeni Kapsul Olustur" },
  "timeCapsule.readyToOpen": { en: "Ready to Open!", tr: "Acilmaya Hazir!" },
  "timeCapsule.open": { en: "Open!", tr: "Ac!" },
  "timeCapsule.locked": { en: "Locked Capsules", tr: "Kilitli Kapsuller" },
  "timeCapsule.daysLeft": { en: "days left", tr: "gun kaldi" },
  "timeCapsule.openedCapsules": { en: "Opened Capsules", tr: "Acilmis Kapsuller" },
  "timeCapsule.openedLabel": { en: "Opened", tr: "Acildi" },
  "timeCapsule.goalsCount": { en: "goals", tr: "hedef" },
  "timeCapsule.empty": { en: "No capsules yet. Write a letter to your future self!", tr: "Henuz kapsulun yok. Gelecege bir mektup yaz!" },

  // ── Tools Hub ──
  "tools.title": { en: "Health Tools", tr: "Sağlık Araclari" },
  "tools.searchPlaceholder": { en: "Search tools... (e.g. migraine, sleep, drug)", tr: "Arac ara... (orn: migren, uyku, ilac)" },
  "tools.more": { en: "more", tr: "daha" },
  "tools.noResults": { en: "No results found", tr: "Sonuc bulunamadi" },
  "tools.toolsLabel": { en: "tools", tr: "arac" },
  "tools.categories": { en: "categories", tr: "kategori" },
  "tools.updated": { en: "Continuously updated", tr: "Surekli guncelleniyor" },

  // ── Travel Health ──
  "travel.generalTips": { en: "General Tips", tr: "Genel Tavsiyeler" },

  // ── Vaccination ──
  "vacc.nameRequired": { en: "Name and date are required", tr: "Ad ve tarih zorunludur" },
  "vacc.vaccineNamePlaceholder": { en: "Vaccine name", tr: "Asi adi" },
  "vacc.providerPlaceholder": { en: "Hospital/clinic", tr: "Hastane/klinik" },

  // ── Value Marketplace ──
  "value.success": { en: "Success!", tr: "Basarili!" },
  "value.sortValueScore": { en: "Value Score", tr: "Deger Puani" },
  "value.sortPrice": { en: "Price", tr: "Fiyat" },
  "value.sortSuccessRate": { en: "Success Rate", tr: "Basari Orani" },
  "value.sortEvidence": { en: "Evidence", tr: "Kanit" },
  "value.formulaDesc": { en: "Clinical efficacy is derived from RCT data, safety profile from adverse event rates, patient outcomes from PROMs data, and cost efficiency from cost-per-QALY calculations.", tr: "Klinik etkinlik RCT verilerinden, guvenlik profili yan etki oranlarindan, hasta sonuclari PROMs verilerinden ve maliyet etkinligi QALY basina maliyetten hesaplanir." },
  "value.backToMarketplace": { en: "Back to Marketplace", tr: "Pazaryerine Don" },
  "value.scoreBreakdown": { en: "Value Score Breakdown", tr: "Deger Puani Dagilimi" },
  "value.efficacy": { en: "Efficacy", tr: "Etkinlik" },
  "value.safety": { en: "Safety", tr: "Güvenlik" },
  "value.outcomes": { en: "Outcomes", tr: "Sonuclar" },
  "value.costEff": { en: "Cost Eff.", tr: "Maliyet" },
  "value.evidence": { en: "Evidence", tr: "Kanit" },
  "value.clinicalEvidence": { en: "Clinical Evidence", tr: "Klinik Kanit" },
  "value.rctCount": { en: "RCT Count", tr: "RCT Sayisi" },
  "value.studies": { en: "studies", tr: "calisma" },
  "value.targetOutcome": { en: "target outcome", tr: "hedef sonuc" },
  "value.avgImprovement": { en: "Avg. Improvement", tr: "Ort. Iyilesme" },
  "value.improvement": { en: "improvement", tr: "iyilesme" },
  "value.timeToEffect": { en: "Time to Effect", tr: "Etki Suresi" },
  "value.evidenceGradeA": { en: "Supported by high-quality RCTs", tr: "Yuksek kaliteli RCT'lerle desteklenmektedir" },
  "value.evidenceGradeB": { en: "Limited but promising evidence", tr: "Sinirli ancak umut verici kanitlar" },
  "value.evidenceGradeC": { en: "Traditional use, limited clinical data", tr: "Geleneksel kullanim, sinirli klinik veri" },
  "value.paymentOptions": { en: "Payment Options", tr: "Odeme Secenekleri" },
  "value.noGuarantee": { en: "No guarantee, standard pricing", tr: "Garanti yok, standart fiyat" },
  "value.aceDiscount": { en: "ACE negotiated discount", tr: "ACE muzakere indirimi" },
  "value.outcomeGuarantee": { en: "Outcome guarantee + escrow protection", tr: "Sonuc garantisi + guvence hesabi" },
  "value.noEscrow": { en: "No escrow accounts yet", tr: "Henuz guvence hesabiniz yok" },
  "value.targetMet": { en: "Target met", tr: "Hedefe ulasildi" },
  "value.targetNotMet": { en: "Target not met", tr: "Hedefe ulasilamadi" },
  "value.riskRewardTiers": { en: "Risk & Reward Tiers", tr: "Risk & Odul Kademeleri" },
  "value.success2": { en: "success", tr: "basari" },
  "value.smartContractFlow": { en: "Smart Contract Flow", tr: "Akilli Sozlesme Akisi" },
  "value.scStep1": { en: "Patient purchases with escrow", tr: "Hasta guvence ile satin alir" },
  "value.scStep2": { en: "System monitors health metrics (PROMs)", tr: "Sistem saglik metriklerini izler (PROMs)" },
  "value.scStep3": { en: "AI evaluates KPI achievement at evaluation date", tr: "AI degerlendirme tarihinde KPI basarisini degerlendirir" },
  "value.scStep4": { en: "Smart contract releases payment or initiates refund", tr: "Akilli sozlesme odemeyi serbest birakir veya iade baslatir" },
  "value.providerLeaderboard": { en: "Provider Leaderboard", tr: "Saglayici Liderlik Tablosu" },
  "value.provider": { en: "Provider", tr: "Saglayici" },
  "value.specialty": { en: "Specialty", tr: "Uzmanlik" },
  "value.patients": { en: "Patients", tr: "Hastalar" },
  "value.tier": { en: "Tier", tr: "Kademe" },
  "value.performanceComparison": { en: "Provider Performance Comparison", tr: "Saglayici Performans Karsilastirmasi" },
  "value.successRatePercent": { en: "Success Rate %", tr: "Basari Orani %" },
  "value.doctorReferral": { en: "Doctor Referral Rewards", tr: "Doktor Yonlendirme Odulleri" },
  "value.doctorReferralDesc": { en: "Referring doctors earn credits from their patients' successful outcomes. Higher patient success rates mean bigger bonuses.", tr: "Yonlendiren doktorlar, hastalarinin basarili sonuclarindan kredi kazanir. Basari orani arttikca bonus da artar." },
  "value.outcomeReward": { en: "Outcome Reward", tr: "Sonuc Odulu" },
  "value.outcomeRewardDesc": { en: "Credits for each successful patient outcome", tr: "Her basarili hasta sonucu icin kredi" },
  "value.volumeBonus": { en: "Volume Bonus", tr: "Hacim Bonusu" },
  "value.volumeBonusDesc": { en: "More patients = higher bonus tier", tr: "Daha fazla hasta = daha yuksek bonus kademesi" },
  "value.goldProvider": { en: "Gold Provider", tr: "Altin Saglayici" },
  "value.goldProviderDesc": { en: "90%+ success = 15% bonus + badge", tr: "%90+ basari = %15 bonus + rozet" },
  "value.guaranteeNotAvailable": { en: "Guarantee not yet available for this product", tr: "Bu urun icin garanti henuz mevcut degil" },
  "value.standardLabel": { en: "Standard", tr: "Standart" },
  "value.valuePriceLabel": { en: "Value Price", tr: "Deger Fiyati" },
  "value.outcomeBased": { en: "Outcome-Based", tr: "Garantili" },
  "value.daysUnit": { en: "days", tr: "gun" },

  // ── Voice Diary ──
  "voice.speechNotSupported": { en: "Your browser does not support speech recognition. You can type your entries instead.", tr: "Tarayıcıniz ses tanima desteklemiyor. Metin olarak yazabilirsiniz." },
  "voice.speakOrType": { en: "Speak or type...", tr: "Konusun veya yazin..." },

  // ── Walking Tracker ──
  "walking.weeklyTarget": { en: "Weekly Target", tr: "Haftalık Hedef" },
  "walking.steps": { en: "steps", tr: "adim" },
  "walking.stepsLabel": { en: "Steps", tr: "Adim" },
  "walking.distance": { en: "Distance (km)", tr: "Mesafe (km)" },
  "walking.duration": { en: "Duration (min)", tr: "Sure (dk)" },
  "walking.speedScreening": { en: "Walking Speed Screening (65+)", tr: "Yuruyus Hizi Taramasi (65+)" },
  "walking.speedPlaceholder": { en: "Speed (m/s)", tr: "Hiz (m/s)" },
  "walking.sarcopeniaWarning": { en: "Walking speed below 0.8 m/s may indicate sarcopenia (muscle loss) risk. Consult your doctor.", tr: "0.8 m/s'nin altindaki yuruyus hizi sarkopeni (kas kaybi) riski isareti olabilir. Doktorunuza danisiniz." },
  "walking.recentEntries": { en: "Recent Entries", tr: "Son Kayitlar" },

  // ── Water Quality ──
  "water.soft": { en: "Soft", tr: "Yumusak" },
  "water.moderatelyHard": { en: "Moderately Hard", tr: "Orta Sert" },
  "water.hard": { en: "Hard", tr: "Sert" },
  "water.veryHard": { en: "Very Hard", tr: "Cok Sert" },

  // ── Wearable Hub ──
  "wearable.supportedDevices": { en: "Supported Devices", tr: "Desteklenen Cihazlar" },
  "wearable.integrationPending": { en: "Integration pending", tr: "Entegrasyon bekleniyor" },
  "wearable.metricsTitle": { en: "Metrics We'll Track", tr: "Takip Edilecek Metrikler" },
  "wearable.howItWorks": { en: "How It Will Work", tr: "Nasil Calisacak?" },
  "wearable.step1": { en: "Connect your device (Apple Health / Google Fit)", tr: "Cihazinizi baglayiniz (Apple Health / Google Fit)" },
  "wearable.step2": { en: "Data syncs automatically", tr: "Veriler otomatik senkronize olur" },
  "wearable.step3": { en: "AI detects anomalies and alerts you", tr: "AI anomalileri tespit eder ve uyarir" },
  "wearable.step4": { en: "Your health score enriched with wearable data", tr: "Sağlık skorunuz giyilebilir verilerle zenginlesir" },

  // ── Weekly Newsletter ──
  "newsletter.signInPrompt": { en: "Sign in to view your weekly health newsletter.", tr: "Haftalık bulteninizi gormek icin giris yapin." },
  "newsletter.title": { en: "Weekly Health Newsletter", tr: "Haftalık Sağlık Bülteni" },
  "newsletter.subtitle": { en: "Your personalized health summary every Monday", tr: "Her Pazartesi kisisellestirilmis saglik ozetiniz" },
  "newsletter.thisWeek": { en: "This Week", tr: "Bu Hafta" },
  "newsletter.archive": { en: "Archive", tr: "Arsiv" },
  "newsletter.settings": { en: "Settings", tr: "Ayarlar" },
  "newsletter.weekGlance": { en: "Your Week at a Glance", tr: "Haftaniza Bakis" },
  "newsletter.compliance": { en: "Compliance", tr: "Uyum" },
  "newsletter.healthScore": { en: "Health Score:", tr: "Sağlık Skoru:" },
  "newsletter.medAdherence": { en: "Medication adherence this week", tr: "İlaç uyumu bu hafta" },
  "newsletter.upcomingEvents": { en: "Upcoming Events", tr: "Yaklasan Etkinlikler" },
  "newsletter.noEvents": { en: "No events scheduled this week.", tr: "Bu hafta planlanmis etkinlik yok." },
  "newsletter.washoutReminders": { en: "Washout Reminders", tr: "Washout Hatirlatmalari" },
  "newsletter.daysLeft": { en: "days left", tr: "gun kaldi" },
  "newsletter.weatherTip": { en: "Weather Health Tip", tr: "Hava Durumu Ipucu" },
  "newsletter.aiInsight": { en: "AI Personalized Insight", tr: "AI Kisisel Degerlendirme" },
  "newsletter.shareWeek": { en: "Share My Week", tr: "Haftami Paylas" },
  "newsletter.pastNewsletters": { en: "Past Newsletters", tr: "Gecmis Bultenler" },
  "newsletter.weekOf": { en: "Week of", tr: "Hafta:" },
  "newsletter.noPast": { en: "No past newsletters yet.", tr: "Henuz gecmis bulten yok." },
  "newsletter.preferences": { en: "Newsletter Preferences", tr: "Bulten Tercihleri" },
  "newsletter.mondayPush": { en: "Monday Push Notification", tr: "Pazartesi Push Bildirimi" },
  "newsletter.mondayPushDesc": { en: "Get notified every Monday morning", tr: "Her Pazartesi sabahi bildirim al" },
  "newsletter.inAppNotify": { en: "In-App Notification", tr: "Uygulama Ici Bildirim" },
  "newsletter.inAppNotifyDesc": { en: "Show newsletter card on dashboard", tr: "Dashboard'da bulten karti goster" },
  "newsletter.deliveryTime": { en: "Delivery Time", tr: "Teslimat Saati" },
  "newsletter.deliveryTimeDesc": { en: "What time should your newsletter arrive?", tr: "Bulten kac'ta gelsin?" },

  // ── Women's Health (additional) ──
  "wh.femaleOnly": { en: "This feature is designed for female health tracking.", tr: "Bu ozellik kadin saglik takibi icin tasarlanmistir." },
  "wh.day": { en: "day", tr: "gun" },
  "wh.notesPlaceholder": { en: "Notes (optional)...", tr: "Notlar (istege bagli)..." },
  "wh.regularity": { en: "Regularity", tr: "Duzenlilik" },
  "wh.regular": { en: "Regular", tr: "Duzenli" },
  "wh.irregular": { en: "Irregular", tr: "Duzensiz" },
  "wh.insufficientData": { en: "Insufficient data", tr: "Yetersiz veri" },
  "wh.avgCycle": { en: "Avg. cycle", tr: "Ort. dongu" },
  "wh.pmsPatterns": { en: "PMS Patterns", tr: "PMS Oruntuleri" },
  "wh.phaseRecommendations": { en: "Phase Recommendations", tr: "Faz Onerileri" },
  "wh.nutrition": { en: "Nutrition:", tr: "Beslenme:" },
  "wh.exercise": { en: "Exercise:", tr: "Egzersiz:" },
  "wh.supplements": { en: "Supplements:", tr: "Takviye:" },
  "wh.selfCare": { en: "Self-care:", tr: "Oz bakim:" },
  "wh.monthsActive": { en: "months active", tr: "aydir kullaniliyor" },
  "wh.ongoing": { en: "ongoing", tr: "devam ediyor" },

  // ── Yoga & Meditation ──
  "yoga.osteoWarning": { en: "Osteoporosis Warning", tr: "Osteoporoz Uyarisi" },
  "yoga.avoidPoses": { en: "Avoid these poses:", tr: "Asagidaki pozlardan kacininiz:" },
  "yoga.evidenceBased": { en: "Evidence-Based Yoga", tr: "Kanita Dayali Yoga" },
  "yoga.poses": { en: "poses", tr: "poz" },
  "yoga.meditationTimer": { en: "Meditation Timer", tr: "Meditasyon Zamanlayicisi" },
  "yoga.start": { en: "Start", tr: "Baslat" },
  "yoga.pause": { en: "Pause", tr: "Duraklat" },

  // ── About Page ──
  "about.doNoHarm": { en: "First, do no harm", tr: "Her zaman once zarar verme" },
  "about.evidenceBased": { en: "Evidence-based", tr: "Kanita Dayali" },
  "about.evidenceBasedDesc": { en: "Only PubMed, NIH, WHO sourced", tr: "Yalnizca PubMed, NIH, WHO kaynakli" },
  "about.transparency": { en: "Transparency", tr: "Seffaflik" },
  "about.transparencyDesc": { en: "Every recommendation with sources", tr: "Her oneri makale referansiyla gelir" },
  "about.accessibility": { en: "Accessibility", tr: "Erisilebilirlik" },
  "about.accessibilityDesc": { en: "Health guidance for everyone", tr: "Herkes icin saglik rehberligi" },
  "about.privacy": { en: "Privacy", tr: "Gizlilik" },
  "about.privacyDesc": { en: "Your data is yours, always", tr: "Verileriniz her zaman sizindir" },
  "about.healthTools": { en: "Health Tools", tr: "Sağlık Araci" },
  "about.translationKeys": { en: "Translation Keys (TR/EN)", tr: "Ceviri Anahtari (TR/EN)" },
  "about.apiEndpoints": { en: "API Endpoints", tr: "API Endpoint" },
  "about.multi": { en: "Multi", tr: "Coklu" },
  "about.researchSources": { en: "Research Sources", tr: "Akademik Kaynak" },
  "about.heroDesc": { en: "Evidence-based integrative medicine assistant \u2014 safely bridging modern medicine and herbal therapy.", tr: "Kanita dayali butunlestirici tip asistani \u2014 modern tip ile bitkisel terapiyi guvenle birlestiren platform." },
  "about.coreValues": { en: "Core Values", tr: "Temel Degerlerimiz" },
  "about.ourTeam": { en: "Our Team", tr: "Ekibimiz" },
  "about.teamDesc": { en: "Founded by 3 medical students at Harvard's 'Building High-Value Health Systems' hackathon, powered by AI.", tr: "Harvard 'Building High-Value Health Systems' hackathon'unda 3 tip ogrencisi tarafindan kurulan, yapay zeka ile guclendirilmis bir platform." },
  "about.ourVision": { en: "Our Vision", tr: "Vizyonumuz" },
  "about.visionDesc": { en: "To be the world's first Evidence-Based Integrative Medicine Assistant \u2014 bridging modern medicine, herbal therapy, and personal health profiles into a single trusted platform that serves both patients and doctors.", tr: "Dunyanin ilk Kanita Dayali Butunlestirici Tip Asistani olmak \u2014 modern tip, bitkisel terapi ve kisisel saglik profillerini hem hastalara hem doktorlara hizmet eden tek bir guvenilir platformda birlestirmek." },
  "about.ourMission": { en: "Our Mission", tr: "Misyonumuz" },
  "about.missionDesc": { en: "To democratize health knowledge by combining AI-powered analysis with peer-reviewed scientific evidence, making personalized health guidance accessible, safe, and transparent for everyone \u2014 regardless of medical literacy or economic status.", tr: "Yapay zeka destekli analizi hakemli bilimsel kanitlarla birlestirerek saglik bilgisini demokratiklestirmek, kisisellestirilmis saglik rehberligini tibbi okuryazarlik veya ekonomik durumdan bagimsiz olarak herkes icin erisilebilir, guvenli ve seffaf kilmak." },
  "about.disclaimer": { en: "Doctopal is an educational wellness tool and does not provide medical diagnosis or treatment. All recommendations are based on published scientific research. Always consult your healthcare provider.", tr: "Doctopal bir egitim amacli saglik aracidir; tibbi teshis veya tedavi sunmaz. Tum oneriler yayimlanmis bilimsel arastirmalara dayanir. Her zaman saglik profesyonelinize danisin." },

  // ── Chat Interface ──
  "chat.personalProfileRequired": { en: "\uD83D\uDD12 **Personalized recommendations require a health profile.**\n\nTo ensure your safety, I need to know your medications, allergies, and health conditions before giving personal advice.\n\n\uD83D\uDC49 **[Sign up](/auth/login)** \u2014 it takes less than 2 minutes!\n\nIn the meantime, I can answer general health questions like:\n- \"Does omega-3 reduce inflammation?\"\n- \"What is the evidence for turmeric?\"\n- \"How does valerian root work for sleep?\"", tr: "\uD83D\uDD12 **Kisisellestirilmis oneriler icin saglik profili gereklidir.**\n\nGüvenliğiniz icin kisisel tavsiye vermeden once ilaclarinizi, alerjilerinizi ve saglik durumunuzu bilmem gerekiyor.\n\n\uD83D\uDC49 **[Kayit olun](/auth/login)** \u2014 2 dakikadan kisa surer!\n\nBu surede genel saglik sorularini yanitlayabilirim:\n- \"Omega-3 iltihabi azaltir mi?\"\n- \"Zerdecal icin kanitlar nelerdir?\"\n- \"Kediotu koku uyku icin nasil calisir?\"" },
  "chat.queryLimitReached": { en: "\uD83D\uDD12 **You've reached your free query limit.**\n\nGuest users can ask up to 5 questions. To continue with unlimited access and personalized recommendations:\n\n\uD83D\uDC49 **[Create a free account](/auth/login)**\n\nYour data is encrypted and you can delete it anytime.", tr: "\uD83D\uDD12 **Ucretsiz sorgu limitinize ulastiniz.**\n\nMisafir kullanicilar en fazla 5 soru sorabilir. Sinirsiz erisim ve kisisellestirilmis oneriler icin:\n\n\uD83D\uDC49 **[Ucretsiz hesap olusturun](/auth/login)**\n\nVerileriniz sifrelenir ve istediginiz zaman silebilirsiniz." },
  "chat.connectionError": { en: "\u26A0\uFE0F Could not connect to the server. Please check your internet connection and try again.", tr: "\u26A0\uFE0F Sunucuya baglanilamadi. Internet baglantinizi kontrol edip tekrar deneyin." },

  // ── Calendar Vital Dialog ──
  "cal.bpRequired": { en: "Systolic and diastolic values are required.", tr: "Sistolik ve diastolik degerler gereklidir." },

  // ── Supplement Dialog ──
  "supp.analyzeCustom": { en: "Analyze", tr: "Asistan analizi:" },

  // ── Clinical Test Result ──
  "clinicalResult.professionalSupport": { en: "Professional support recommended", tr: "Profesyonel destek onerilir" },
  "clinicalResult.compassionateNote": { en: "This is a screening tool and does not replace a medical diagnosis. Whatever your results, your mental health matters and seeking help is a sign of strength.", tr: "Bu test bir tarama aracidir ve tibbi teshis yerine gecmez. Sonuclariniz ne olursa olsun, ruh sagliginiz onemlidir ve yardim aramak guclu bir adimdir." },
  "clinicalResult.whatDoesThisMean": { en: "What does this mean?", tr: "Bu ne anlama geliyor?" },
  "clinicalResult.scoreRanges": { en: "Score ranges", tr: "Puan araliklari" },
  "clinicalResult.yourAnswers": { en: "Your answers", tr: "Cevaplariniz" },
  "clinicalResult.pastResults": { en: "Your Past Results", tr: "Gecmis Sonuclariniz" },
  "clinicalResult.retake": { en: "Retake Test", tr: "Testi Tekrarla" },
  "clinicalResult.findProfessional": { en: "Find a Professional", tr: "Uzman Bul" },

  // ── Clinical Test Runner ──
  "clinicalRunner.crisisTitle": { en: "Reaching out for help is an important and brave step", tr: "Yardim almak onemli ve cesurca bir adimdir" },
  "clinicalRunner.crisisMessage": { en: "If you are having thoughts of harming yourself, please reach out for professional support right away.", tr: "Kendinize zarar verme dusunceleriniz varsa, lutfen hemen profesyonel destek alin." },
  "clinicalRunner.turkeyLine": { en: "Turkey Crisis Line", tr: "Turkiye Intihar Onleme" },
  "clinicalRunner.emergency": { en: "Emergency", tr: "Acil Yardim" },
  "clinicalRunner.endTest": { en: "End the test", tr: "Testi sonlandir" },
  "clinicalRunner.question": { en: "Question", tr: "Soru" },
  "clinicalRunner.back": { en: "Back", tr: "Geri" },
  "clinicalRunner.seeResults": { en: "See Results", tr: "Sonuclari Gor" },
  "clinicalRunner.next": { en: "Next", tr: "Ileri" },

  // ── SEO Assistant ──
  "seo.title": { en: "AI SEO Copilot", tr: "AI SEO Yardimcisi" },
  "seo.score": { en: "SEO Score", tr: "SEO Skoru" },
  "seo.keywords": { en: "Keywords", tr: "Anahtar Kelimeler" },
  "seo.readability": { en: "Readability", tr: "Okunabilirlik" },
  "seo.issues": { en: "Issues & Suggestions", tr: "Sorunlar & Oneriler" },
  "seo.titles": { en: "Title Suggestions", tr: "Baslik Onerileri" },
  "seo.generate": { en: "Generate Titles", tr: "Baslik Oner" },
  "seo.generating": { en: "Generating...", tr: "Olusturuluyor..." },
  "seo.use_this": { en: "Use this", tr: "Bunu kullan" },
  "seo.words": { en: "words", tr: "kelime" },
  "seo.sentences": { en: "sentences", tr: "cumle" },
  "seo.min_read": { en: "min read", tr: "dk okuma" },
  "seo.headings": { en: "headings", tr: "baslik" },
  "seo.found": { en: "Found", tr: "Bulunan" },
  "seo.missing": { en: "Missing", tr: "Eksik" },
  "seo.easy": { en: "Easy to read", tr: "Kolay okunur" },
  "seo.moderate": { en: "Moderate", tr: "Orta duzey" },
  "seo.hard": { en: "Hard to read", tr: "Zor okunur" },
  "seo.complex_terms": { en: "Complex Terms", tr: "Karmasik Terimler" },
  "seo.simplify_hint": { en: "Consider using simpler language for patients", tr: "Hastalar icin daha basit dil kullanmayi dusunun" },
  "seo.avg_sentence_length": { en: "Avg. sentence length", tr: "Ort. cumle uzunlugu" },

  // ── Video URL Input ──
  "video.label": { en: "Video URL", tr: "Video Baglantisi" },
  "video.placeholder": { en: "Paste YouTube or Vimeo link...", tr: "YouTube veya Vimeo linkini yapistir..." },
  "video.supported": { en: "Supported: YouTube, Vimeo", tr: "Desteklenen: YouTube, Vimeo" },
  "video.valid": { en: "Video detected", tr: "Video algilandi" },
  "video.invalid": { en: "Invalid video URL", tr: "Gecersiz video linki" },
  "video.preview": { en: "Preview", tr: "Onizleme" },
  "video.openOriginal": { en: "Open original", tr: "Orijinali ac" },

  // ── Today View ──
  "todayView.waterMaxWarning": { en: "Please stop! Risk of water intoxication.", tr: "Lütfen daha fazla içme! Su zehirlenmesi riski var." },

  // ── Daily Care Card ──
  "dailyCare.title": { en: "Today's Care Plan", tr: "Bugünün Sağlık Planı" },
  "dailyCare.refresh": { en: "Refresh", tr: "Yenile" },
  "dailyCare.allCompleted": { en: "You completed today's plan, amazing!", tr: "Bugünkü planını tamamladın, harikasın!" },
  "dailyCare.customize": { en: "Customize", tr: "Kişiselleştir" },
  "dailyCare.customizeDesc": { en: "Choose your daily actions", tr: "Günlük aksiyonlarını seç" },
  "dailyCare.done": { en: "Done", tr: "Tamam" },
  "dailyCare.dismiss": { en: "Dismiss for today", tr: "Bugün gösterme" },
  "dailyCare.dismissed": { en: "card hidden", tr: "kart gizlendi" },
  "dailyCare.showAll": { en: "Show All", tr: "Tümünü Göster" },
  "dailyCare.selectCards": { en: "Select at least 2 cards", tr: "En az 2 kart seç" },
  "dailyCare.cat.nutrition": { en: "Nutrition", tr: "Beslenme" },
  "dailyCare.cat.lifestyle": { en: "Lifestyle", tr: "Yaşam Tarzı" },
  "dailyCare.cat.tracking": { en: "Tracking", tr: "Takip" },
  "dailyCare.cat.wellness": { en: "Wellness", tr: "Kendine İyi Bak" },
  "dailyCare.cat.fitness": { en: "Fitness", tr: "Fitness" },
  "dailyCare.cat.hydration": { en: "Hydration", tr: "Hidrasyon" },
  "dailyCare.cat.social": { en: "Social", tr: "Sosyal" },
  "dailyCare.cat.mindfulness": { en: "Mindfulness", tr: "Farkındalık" },

  // ── Adaptive Symptom Assessment (new keys only — no duplicates) ──
  "symptom.whatsWrong": { en: "What's bothering you most right now?", tr: "Şu an sizi en çok ne rahatsız ediyor?" },
  "symptom.forMyself": { en: "For Myself", tr: "Kendim İçin" },
  "symptom.forChild": { en: "For My Child", tr: "Çocuğum İçin" },
  "symptom.forOther": { en: "For Someone Else", tr: "Başkası İçin" },
  "symptom.continue": { en: "Continue", tr: "Devam" },
  "symptom.back": { en: "Back", tr: "Geri" },
  "symptom.aiThinking": { en: "AI is thinking...", tr: "AI düşünüyor..." },
  "symptom.aiNarrowing": { en: "AI is narrowing down...", tr: "AI olasılıkları daraltıyor..." },
  "symptom.seeToday": { en: "See a doctor today", tr: "Bugün doktora gidin" },
  "symptom.seeSoon": { en: "Schedule a doctor visit", tr: "Doktor randevusu alın" },
  "symptom.monitorSelf": { en: "Monitor symptoms, self-care may be enough", tr: "Semptomları takip edin, öz bakım yeterli olabilir" },
  "symptom.selfCareOk": { en: "Self-care is appropriate", tr: "Öz bakım yeterli" },
  "symptom.phytoTitle": { en: "Phytotherapy Suggestions", tr: "Fitoterapi Önerileri" },
  "symptom.download": { en: "Download Report", tr: "Raporu İndir" },
  "symptom.discuss": { en: "Discuss with AI Assistant", tr: "AI Asistanla Tartış" },
  "symptom.newAssessment": { en: "Start New Assessment", tr: "Yeni Değerlendirme Başlat" },
  "symptom.checkInteractions": { en: "Check Drug Interactions", tr: "İlaç Etkileşimlerini Kontrol Et" },

  // ── DailySummaryCard ──
  "dailySummary.onFire": { en: "You're on fire!", tr: "Harika gidiyorsun!" },

  // ── DarkKnowledgeCard ──
  "darkKnowledge.didYouKnow": { en: "Did you know?", tr: "Biliyor muydunuz?" },
  "darkKnowledge.learnMore": { en: "Learn more", tr: "Daha fazla" },

  // ── MonthlyROICard ──
  "roi.title": { en: "Your Monthly Impact", tr: "Aylik Etki Raporunuz" },
  "roi.savings": { en: "Savings & Time", tr: "Tasarruf & Zaman" },
  "roi.clinical": { en: "Clinical Progress", tr: "Klinik Ilerleme" },
  "roi.usage": { en: "Platform Usage", tr: "Platform Kullanimi" },
  "roi.avoided": { en: "unnecessary visits avoided", tr: "gereksiz hastane ziyaretinden kacinildi" },
  "roi.hoursSaved": { en: "hours saved", tr: "saat tasarruf edildi" },
  "roi.estimatedSavings": { en: "estimated savings", tr: "tahmini finansal tasarruf" },
  "roi.sleep": { en: "Sleep Efficiency", tr: "Uyku Verimliligi" },
  "roi.pain": { en: "Pain Reduction", tr: "Agri Azalmasi" },
  "roi.meds": { en: "Medication Adherence", tr: "İlaç Uyumu" },
  "roi.mood": { en: "Mood Score", tr: "Ruh Hali Skoru" },
  "roi.interactions": { en: "AI interactions", tr: "AI etkilesimi" },
  "roi.tools": { en: "tools used", tr: "arac kullanildi" },
  "roi.goals": { en: "goals achieved", tr: "hedefe ulasildi" },
  "roi.streak": { en: "day streak", tr: "gunluk seri" },
  "roi.healthScore": { en: "Health Score", tr: "Sağlık Skoru" },
  "roi.vsLast": { en: "vs last month", tr: "gecen aya gore" },
  "roi.share": { en: "Share", tr: "Paylas" },
  "roi.details": { en: "See Details", tr: "Detaylari Gor" },
  "roi.hide": { en: "Hide", tr: "Gizle" },
  "roi.congrats": { en: "Great month!", tr: "Harika bir ay!" },

  // ── QuickActions ──
  "quickActions.tookMeds": { en: "Took my meds", tr: "Ilacimi aldim" },
  "quickActions.howFeeling": { en: "How am I feeling", tr: "Nasil hissediyorum" },
  "quickActions.logSymptom": { en: "Log symptom", tr: "Semptom kaydet" },
  "quickActions.moodTitle": { en: "How are you feeling today?", tr: "Bugun nasil hissediyorsun?" },
  "quickActions.symptomTitle": { en: "Log a Symptom", tr: "Semptom Kaydet" },
  "quickActions.symptomPlaceholder": { en: "Describe your symptom...", tr: "Semptomu yazin..." },
  "quickActions.saved": { en: "Saved!", tr: "Kaydedildi!" },
  "quickActions.save": { en: "Save", tr: "Kaydet" },

  // ── SOSCard ──
  "sos.addContact": { en: "Add Emergency Contact", tr: "Acil Durum Kisisi Ekle" },
  "sos.quickAccess": { en: "Quick access in crisis", tr: "Kriz aninda hizli erisim" },
  "sos.emergency": { en: "Emergency", tr: "Acil Durum" },
  "sos.contactsSaved": { en: "contacts saved", tr: "kisi kayitli" },
  "sos.primary": { en: "Primary", tr: "Birincil" },
  "sos.moreContacts": { en: "more contacts", tr: "diger kisi" },
  "sos.manageContacts": { en: "Manage Contacts", tr: "Kisileri Duzenle" },

  // ── SupplementDoseDialog ──
  "suppDose.breakRecommended": { en: "day break is recommended.", tr: "gun mola vermeniz onerilir." },
  "suppDose.recommendedCycle": { en: "Recommended:", tr: "Tavsiye:" },
  "suppDose.daysUse": { en: "days use,", tr: "gun kullanim," },
  "suppDose.daysBreak": { en: "days break", tr: "gun mola" },

  // ── SymptomPatternCard ──
  "symptomPattern.energy": { en: "Energy", tr: "Enerji" },
  "symptomPattern.sleep": { en: "Sleep", tr: "Uyku" },
  "symptomPattern.mood": { en: "Mood", tr: "Ruh hali" },
  "symptomPattern.digestion": { en: "Digestion", tr: "Sindirim" },
  "symptomPattern.sleepEnergy": { en: "Sleep-Energy", tr: "Uyku-Enerji" },

  // ── CriticalAlertModal ──
  "criticalAlert.detected": { en: "Critical Alert Detected", tr: "Kritik Durum Algilandi" },
  "criticalAlert.sending": { en: "Sending notifications to emergency contacts...", tr: "Acil durum kisilerine bildirim gonderiliyor..." },
  "criticalAlert.cancelled": { en: "Alert cancelled. Glad you're okay!", tr: "Uyari iptal edildi. Iyi olduguna sevindik!" },
  "criticalAlert.notified": { en: "Emergency contacts have been notified!", tr: "Acil durum kisilerinize bildirim gonderildi!" },
  "criticalAlert.consider112": { en: "Please also consider calling 112/911.", tr: "Lutfen 112'yi aramayi da dusunun." },
  "criticalAlert.imFine": { en: "I'm Fine, Cancel", tr: "Iyiyim, Iptal Et" },
  "criticalAlert.sendNow": { en: "Send SOS Now", tr: "Hemen Bildir" },
  "criticalAlert.close": { en: "Close", tr: "Kapat" },
  "criticalAlert.call112": { en: "Call 112 / 911 Now", tr: "Hemen 112'yi Ara" },

  // ── FamilyManager ──
  "family.profiles": { en: "profiles", tr: "profil" },
  "family.parentalMode": { en: "Under 18 — parental oversight mode active. All recommendations pass pediatric safety checks.", tr: "18 yas alti — ebeveyn denetim modu aktif. Tum oneriler pediatrik guvenlik kontrolunden gecer." },
  "family.emptyTitle": { en: "Add Your Family Here", tr: "Ailenizi Buraya Ekleyin" },
  "family.emptyDesc": { en: "Add family members to get personalized health recommendations, drug interaction checks, and customized tracking for them.", tr: "Aile uyelerinizi ekleyerek onlara ozel saglik onerileri, ilac etkilesim kontrolu ve kisisellestirilmis takip alin." },
  "family.fullNameLabel": { en: "Full Name", tr: "Ad Soyad" },
  "family.chronicLabel": { en: "Chronic Conditions", tr: "Kronik Hastaliklar" },

  // ── CommandPalette ──
  "cmdPalette.placeholder": { en: "Search doctors, articles, supplements, tools...", tr: "Doktor, makale, takviye veya arac ara..." },
  "cmdPalette.or": { en: "or", tr: "veya" },
  "cmdPalette.noResults": { en: "No results found", tr: "Sonuc bulunamadi" },
  "cmdPalette.tryDifferent": { en: "Try different keywords", tr: "Farkli anahtar kelimeler deneyin" },
  "cmdPalette.quickAccess": { en: "Quick Access", tr: "Hizli Erisim" },
  "cmdPalette.navigate": { en: "Navigate", tr: "Gezin" },
  "cmdPalette.select": { en: "Select", tr: "Sec" },
  "cmdPalette.close": { en: "Close", tr: "Kapat" },
  "cmdPalette.healthAssistant": { en: "Health Assistant", tr: "Sağlık Asistani" },
  "cmdPalette.interactionChecker": { en: "Interaction Checker", tr: "Etkilesim Kontrol" },
  "cmdPalette.bloodTest": { en: "Blood Test", tr: "Kan Tahlili" },
  "cmdPalette.clinicalTests": { en: "Clinical Tests", tr: "Klinik Testler" },
  "cmdPalette.allTools": { en: "All Tools", tr: "Tum Araclar" },
  "cmdPalette.search": { en: "Search...", tr: "Ara..." },

  // ── Footer ──
  "footer.about": { en: "About", tr: "Hakkimizda" },

  // ── MegaMenu ──
  "megaMenu.searchTools": { en: "Search tools...", tr: "Arac ara..." },
  "megaMenu.noResults": { en: "No results found", tr: "Sonuc bulunamadi" },
  "megaMenu.tools": { en: "tools", tr: "arac" },
  "megaMenu.categories": { en: "categories", tr: "kategori" },
  "megaMenu.allTools": { en: "All Tools", tr: "Tum Araclar" },

  // ── MobileMegaMenu ──
  "mobileMega.searchPlaceholder": { en: "Search tools...", tr: "Arac ara..." },
  "mobileMega.noResults": { en: "No results found", tr: "Sonuc bulunamadi" },
  "mobileMega.viewAll": { en: "View All Tools →", tr: "Tum Araclari Gor →" },

  // ── AffiliateLinks ──
  "affiliate.disclaimer": { en: "Affiliate disclaimer", tr: "Affiliate disclaimer" },

  // ── FakeDoorTest ──
  "fakeDoor.earlyBird": { en: "Early-bird discount reserved for you", tr: "Erken kus indirimi sizin icin ayrildi" },
  "fakeDoor.noSpam": { en: "No spam", tr: "Spam yok" },
  "fakeDoor.comingSoon": { en: "Coming soon", tr: "Yakinda" },
  "fakeDoor.vipPriority": { en: "VIP priority", tr: "VIP oncelik" },

  // ── PromsSurvey ──
  "proms.healthStatus": { en: "Health Status", tr: "Sağlık Durumu" },
  "proms.experience": { en: "Experience", tr: "Deneyim" },
  "proms.complete": { en: "Complete", tr: "Tamamla" },
  "proms.continue": { en: "Continue", tr: "Devam" },
  "proms.back": { en: "Back", tr: "Geri" },
  "proms.submit": { en: "Submit", tr: "Gonder" },
  "proms.improvementReport": { en: "Improvement Report", tr: "Iyilesme Raporu" },
  "proms.days": { en: "days", tr: "gun" },
  "proms.improvementScore": { en: "Improvement Score", tr: "Iyilesme Skoru" },
  "proms.baseline": { en: "Baseline", tr: "Baslangic" },
  "proms.current": { en: "Current", tr: "Simdi" },

  // ── RadiologyResultDashboard ──
  "rad.noGlossary": { en: "No glossary terms found.", tr: "Sozluk maddesi bulunamadi." },
  "rad.pdfShareDesc": { en: "Professional report to share with your doctor", tr: "Doktorunuzla paylasmak icin profesyonel rapor" },

  // ── ConsentStep ──
  "consent.agreementText": { en: "I have read and understood the Medical Disclaimer and Data Privacy notice above. I accept the Terms of Service and Privacy Policy. I understand that Doctopal is not a substitute for professional medical advice, and I will consult my healthcare provider before acting on any recommendations.", tr: "Yukaridaki Tibbi Sorumluluk Reddi ve Veri Gizliligi bildirimini okudum, Kullanim Kosullari ile Gizlilik Politikasini kabul ediyorum. Doctopal'nin profesyonel tibbi tavsiyenin yerini almadigini anliyorum ve herhangi bir oneriyi uygulamadan once saglik uzmanima danisacagim." },

  // ── HealthScoreShareCard ──
  "healthScore.title": { en: "My Health Score", tr: "Sağlık Skorum" },
  "healthScore.excellent": { en: "Excellent!", tr: "Harika!" },
  "healthScore.keepGoing": { en: "Keep going!", tr: "Iyi gidiyorsun!" },
  "healthScore.timeToImprove": { en: "Time to improve!", tr: "Gelisme zamani!" },
  "healthScore.dayStreak": { en: "day streak", tr: "gun seri" },
  "healthScore.compliance": { en: "compliance", tr: "uyum" },
  "healthScore.bioAge": { en: "bio age", tr: "biyo yas" },
  "healthScore.goal": { en: "goal", tr: "hedef" },
  "healthScore.daysActive": { en: "days active", tr: "gun aktif" },

  // ── BloodTestShareCard ──
  "bloodTest.optimalLabel": { en: "optimal", tr: "optimal" },

  // ── InteractionEngine ──
  "interactionEngine.disclaimer": { en: "This information is for educational purposes only and does not replace professional medical advice. Always consult your healthcare provider before using any herbal supplements, especially alongside prescription medications.", tr: "Bu bilgi yalnizca egitim amaclidir ve profesyonel tibbi tavsiyenin yerini tutmaz. Herhangi bir bitkisel takviye kullanmadan once, ozellikle receteli ilaclarla birlikte, saglik uzmaniniza danisin." },
  "interactionEngine.noProfile": { en: "Your health profile is not available. Complete your profile for personalized safety checks.", tr: "Sağlık profiliniz mevcut degil. Kisisellestirilmis guvenlik kontrolleri icin profilinizi tamamlayin." },
  "interactionEngine.pregnant": { en: "You are pregnant. Many herbs are contraindicated during pregnancy. Extra caution applied.", tr: "Hamilesiniz. Bircok bitki hamilelikte kontrendikedir. Ekstra dikkat uygulandi." },
  "interactionEngine.breastfeeding": { en: "You are breastfeeding. Herbs can pass into breast milk. Extra caution applied.", tr: "Emziriyorsunuz. Bitkiler anne sutune gecebilir. Ekstra dikkat uygulandi." },
  "interactionEngine.kidneyDisease": { en: "Kidney disease detected. Some herbs are nephrotoxic or alter drug clearance.", tr: "Bobrek hastaligi tespit edildi. Bazi bitkiler nefrotoksik veya ilac atilimini etkiler." },
  "interactionEngine.liverDisease": { en: "Liver disease detected. Many herbs are hepatotoxic or affect drug metabolism.", tr: "Karaciger hastaligi tespit edildi. Bircok bitki hepatotoksik veya ilac metabolizmasini etkiler." },
  "interactionEngine.elderly": { en: "Age 65+. Drug metabolism slows with age — lower doses may be appropriate.", tr: "65 yas uzeri. Yasla birlikte ilac metabolizmasi yavaslar — daha dusuk dozlar uygun olabilir." },
  "interactionEngine.pediatric": { en: "Under 18. Pediatric dosing is different — consult a pediatrician before any herbal use.", tr: "18 yas alti. Pediatrik dozlama farklidir — herhangi bir bitkisel kullanimdan once pediatristinize danisin." },

  // ── Notifications ──
  "notification.goodMorning": { en: "Good morning!", tr: "Gunaydin!" },
  "notification.morningBody": { en: "Complete your daily check-in and see your health score!", tr: "Gunluk check-in'ini yap ve saglik skorunu gor!" },
  "notification.medReminder": { en: "Medication Reminder", tr: "İlaç Hatirlaticisi" },
  "notification.dailyCheckin": { en: "Daily Check-in", tr: "Gunluk Check-in" },
  "notification.dailyCheckinBody": { en: "How did you feel today? Do a quick check-in.", tr: "Bugun nasil hissettin? Hizli bir check-in yap." },
  "notification.morningTitle": { en: "Good Morning!", tr: "Gunaydin!" },
  "notification.morningMedsBody": { en: "Are your meds up to date? Check your daily summary.", tr: "İlaçların guncel mi? Gunluk ozetine goz at." },

  // ── SafetyGuardrail ──
  "safety.immediateEmergency": { en: "WARNING: The symptoms you described may indicate a life-threatening emergency. Please call 112/911 IMMEDIATELY or go to the nearest emergency room. No herbal supplement or medication advice can be given in this situation.", tr: "DIKKAT: Belirttiginiz sikayetler acil tibbi mudahale gerektiren bir duruma isaret edebilir. Lutfen DERHAL 112'yi arayin veya en yakin acil servise basvurun. Bu durumda hicbir bitkisel takviye veya ilac onerisi yapilamaz." },
  "safety.urgentCaution": { en: "CAUTION: The symptoms you described require medical evaluation. Please see your doctor as soon as possible. Herbal supplement recommendations are limited.", tr: "DIKKAT: Belirttiginiz sikayetler tibbi degerlendirme gerektiriyor. Lutfen en kisa surede doktorunuza basvurun. Bitkisel takviye onerileri sinirlandirilmistir." },
  "safety.disclaimer": { en: "This information is for educational purposes based on published scientific research. It does not replace medical diagnosis or treatment. Consult your healthcare professional before making any changes.", tr: "Bu bilgiler yayimlanmis bilimsel arastirmalara dayali genel bilgilendirme niteligindedir. Tibbi teshis veya tedavi yerine gecmez. Herhangi bir degisiklik yapmadan once saglik profesyonelinize danisin." },
  "safety.aiCanError": { en: "AI models can make errors — independently verify all information", tr: "Yapay zeka modeli hata yapabilir — her bilgiyi bagimsiz dogrulayin" },
  "safety.individualVary": { en: "Individual responses may vary from person to person", tr: "Bireysel yanitlar kisiden kisiye farklilik gosterebilir" },
  "safety.latestResearch": { en: "The latest research may not yet be in our database", tr: "En guncel arastirmalar henuz veritabanina eklenmemis olabilir" },
  "safety.profileIncomplete": { en: "Profile data incomplete — personalization limited", tr: "Profil bilgisi eksik — kisisellestirme sinirli" },

  // ── Medication Timing (medtime) ──
  "medtime.morningEmpty": { en: "Morning (empty stomach)", tr: "Sabah (aç karın)" },
  "medtime.beforeBreakfast": { en: "Before breakfast", tr: "Kahvaltıdan önce" },
  "medtime.withBreakfast": { en: "With breakfast", tr: "Kahvaltı ile" },
  "medtime.withLunch": { en: "With lunch", tr: "Öğle yemeği ile" },
  "medtime.afternoon": { en: "Afternoon", tr: "Öğleden sonra" },
  "medtime.withDinner": { en: "With dinner", tr: "Akşam yemeği ile" },
  "medtime.evening": { en: "Evening", tr: "Akşam" },
  "medtime.bedtime": { en: "Bedtime", tr: "Yatmadan önce" },
  "medtime.ironLevoConflict": { en: "Keep at least 4 hours between Iron and Levothyroxine", tr: "Demir ve Levotiroksin arasında en az 4 saat bırakın" },
  "medtime.ironCalciumConflict": { en: "Keep at least 2 hours between Iron and Calcium", tr: "Demir ve Kalsiyum arasında en az 2 saat bırakın" },
  "medtime.hoursApart": { en: "h apart", tr: " saat ara" },
  "medtime.caution": { en: "caution", tr: "dikkat" },

  // ── Notification page strings ──
  "notif.eventFallback": { en: "Event", tr: "Etkinlik" },
  "notif.updateMedList": { en: "Update your medication list", tr: "İlaç listenizi güncelleyin" },
  "notif.stayHydrated": { en: "Stay hydrated!", tr: "Su içmeyi unutma!" },
  "notif.waterDesc": { en: "Have you hit your daily water goal? Track it in your calendar.", tr: "Günlük su hedefine ulaştın mı? Takvimden takip edebilirsin." },

  // ── Relative time units ──
  "time.minutesAgo": { en: "m ago", tr: " dk önce" },
  "time.hoursAgo": { en: "h ago", tr: " sa önce" },
  "time.daysAgo": { en: "d ago", tr: " gün önce" },

  // ── Pregnancy tracker ──
  "pregnancy.week1Label": { en: "Week 1", tr: "1. hafta" },
  "pregnancy.week42Label": { en: "Week 42", tr: "42. hafta" },

  // ══════════════════════════════════════════
  // API Route Translations (batch 1)
  // ══════════════════════════════════════════

  // Shared across many API routes
  "api.respondLang": { en: "English", tr: "Turkish" },

  // addiction-recovery
  "api.recovery.crisisMessage": {
    en: "We understand you're going through an incredibly difficult time. Please reach out to a professional right now. You are not alone.",
    tr: "Cok zor bir donemden gectiginizi anliyoruz. Lutfen hemen bir uzmana ulasin. Yalniz degilsiniz.",
  },
  "api.recovery.crisisLine1": { en: "Suicide & Crisis Lifeline: 988", tr: "Kriz Hattı: 182" },
  "api.recovery.crisisLine2": { en: "SAMHSA Helpline: 1-800-662-4357", tr: "ALO Sosyal Destek: 183" },
  "api.recovery.responseCrisisLine1": { en: "SAMHSA Helpline: 1-800-662-4357", tr: "Kriz Hattı: 182" },
  "api.recovery.responseCrisisLine2": { en: "Crisis Line: 988", tr: "ALO Sosyal Destek: 183" },
  "api.recovery.responseCrisisLine3": { en: "AA Hotline: check local listings", tr: "Yesil Ay: 0800 888 0 888" },

  // alcohol-tracker
  "api.alcohol.addDrink": { en: "Add at least one drink", tr: "En az bir içecek ekleyin" },
  "api.alcohol.analysisFailed": { en: "Analysis failed", tr: "Analiz başarısız oldu" },

  // allergy-map
  "api.allergy.triggerRequired": { en: "Trigger name is required", tr: "Tetikleyici adi gerekli" },
  "api.allergy.saveFailed": { en: "Failed to save", tr: "Kayıt başarısiz" },
  "api.allergy.noAllergies": { en: "No allergies on record.", tr: "Kayıtli alerji bulunamadi." },
  "api.allergy.analysisFailed": { en: "Analysis failed", tr: "Analiz başarısiz" },

  // anti-inflammatory
  "api.antiInflam.describeDiet": { en: "Please describe your diet", tr: "Lutfen diyetinizi anlatiniz" },

  // anxiety-toolkit
  "api.anxiety.grounding541": { en: "5-4-3-2-1 Grounding", tr: "5-4-3-2-1 Topraklama" },
  "api.anxiety.groundingSee": { en: "Name 5 things you can SEE", tr: "5 gorebildiginiz sey sayın" },
  "api.anxiety.groundingTouch": { en: "Name 4 things you can TOUCH", tr: "4 dokunabildiginiz sey sayın" },
  "api.anxiety.groundingHear": { en: "Name 3 things you can HEAR", tr: "3 duyabildiginiz sey sayın" },
  "api.anxiety.groundingSmell": { en: "Name 2 things you can SMELL", tr: "2 koklayabildiginiz sey sayın" },
  "api.anxiety.groundingTaste": { en: "Name 1 thing you can TASTE", tr: "1 tadabildiginiz sey sayın" },
  "api.anxiety.boxBreathing": { en: "Box Breathing (4-4-4-4)", tr: "Kare Nefes (4-4-4-4)" },
  "api.anxiety.breatheIn": { en: "Breathe in for 4 seconds", tr: "4 saniye nefes alın" },
  "api.anxiety.hold1": { en: "Hold for 4 seconds", tr: "4 saniye tutun" },
  "api.anxiety.breatheOut": { en: "Breathe out for 4 seconds", tr: "4 saniye verin" },
  "api.anxiety.hold2": { en: "Hold for 4 seconds", tr: "4 saniye bekleyin" },
  "api.anxiety.repeat5": { en: "Repeat 5 times", tr: "5 kez tekrarlayın" },
  "api.anxiety.panicSafe": {
    en: "A panic attack is not dangerous and will pass. You are safe right now.",
    tr: "Panik atak tehlikeli degildir ve gecicidir. Simdi guvendesiniz.",
  },
  "api.anxiety.panicGrounding": {
    en: "Focus on the grounding exercise and controlled breathing.",
    tr: "Topraklama egzersizini yapin ve nefes almaya odaklanin.",
  },
  "api.anxiety.panicRecur": {
    en: "If panic attacks recur, it is important to see a mental health professional.",
    tr: "Panik ataklar tekrarliyorsa bir ruh sağlığı uzmaniyla görüşmek önemlidir.",
  },
  "api.anxiety.crisisLine": { en: "Crisis line: 988", tr: "Kriz hattı: 182" },

  // appointment-prep
  "api.apptPrep.generateFailed": { en: "Failed to generate summary", tr: "Ozet olusturulamadi" },

  // blood-test-pdf
  "api.bloodPdf.analysisComplete": { en: "Analysis complete.", tr: "Analiz tamamlandı." },
  "api.bloodPdf.disclaimer": {
    en: "These results are for informational purposes. Please consult your doctor.",
    tr: "Bu sonuçlar bilgilendirme amaçlıdır. Lütfen doktorunuza danışın.",
  },

  // caffeine-tracker
  "api.caffeine.addDrink": { en: "Add at least one drink", tr: "En az bir içecek ekleyin" },
  "api.caffeine.analysisFailed": { en: "Analysis failed", tr: "Analiz başarısız oldu" },

  // child-health
  "api.child.selectConcern": { en: "Please select a concern", tr: "Lutfen bir sorun secin" },
  "api.child.enterAge": { en: "Please enter the child's age", tr: "Lutfen cocugun yasini girin" },
  "api.child.analysisFailed": { en: "Analysis failed, please try again", tr: "Analiz başarısiz oldu, tekrar deneyin" },

  // admin/verify-user
  "api.admin.approvedSubject": { en: "Congratulations, Your Profile is Verified! ✅", tr: "Tebrikler, Profiliniz Onaylandı! ✅" },
  "api.admin.rejectedSubject": { en: "Regarding Your Profile Verification", tr: "Profil Onay Süreciniz Hakkında" },

  // chat
  "api.chat.emergencyLabel": { en: "EMERGENCY WARNING", tr: "ACİL UYARI" },
  "api.chat.quotaExhaustedTr": {
    en: "⚠️ **Daily AI quota reached.** Our free-tier API limit has been exceeded for today.\n\nThe quota resets at midnight Pacific Time. In the meantime:\n- Browse [PubMed](https://pubmed.ncbi.nlm.nih.gov/) directly for research\n- Try again in a few hours\n\nWe're working on upgrading our capacity!",
    tr: "⚠️ Günlük AI kullanım limitine ulaşıldı. Birkaç saat içinde tekrar deneyin. Bu sürede PubMed'de doğrudan araştırma yapabilirsiniz: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov)",
  },
  "api.chat.rateLimited": {
    en: "⚠️ Our AI service is temporarily busy. Please wait 30 seconds and try again.\n\nIn the meantime, you can browse [PubMed](https://pubmed.ncbi.nlm.nih.gov/) directly for research.",
    tr: "⚠️ AI servisimiz geçici olarak yoğun. Lütfen 30 saniye bekleyip tekrar deneyin.\n\nBu sürede [PubMed](https://pubmed.ncbi.nlm.nih.gov/) üzerinden doğrudan araştırma yapabilirsiniz.",
  },
  "api.chat.safetyBlocked": {
    en: "I'm specialized in evidence-based health and phytotherapy questions. I can't help with other topics, but feel free to ask me anything health-related! For example: supplement recommendations, drug-herb interactions, blood test interpretation, or lifestyle advice.",
    tr: "Kanıta dayalı sağlık ve fitoterapi soruları konusunda uzmanım. Diğer konularda yardımcı olamam, ancak sağlıkla ilgili her şeyi sorabilirsiniz! Örneğin: takviye önerileri, ilaç-bitki etkileşimleri, kan tahlili yorumlama veya yaşam tarzı tavsiyeleri.",
  },
  "api.chat.connectionError": {
    en: "⚠️ An error occurred while connecting to our AI service. Please try again in a few moments.",
    tr: "⚠️ AI servisimize bağlanırken bir hata oluştu. Lütfen birkaç dakika sonra tekrar deneyin.",
  },
  "api.chat.quotaShort": {
    en: "⚠️ Daily AI quota reached. Please try again in a few hours.",
    tr: "⚠️ Günlük AI kullanım limitine ulaşıldı. Birkaç saat içinde tekrar deneyin.",
  },
  "api.chat.streamError": {
    en: "\n\n⚠️ An error occurred while generating the response. Please try again.",
    tr: "\n\n⚠️ Yanıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
  },

  // ══════════════════════════════════════════
  // API Routes — Batch 2
  // ══════════════════════════════════════════
  "api.chronicCare.selectCondition": {
    en: "Select a condition",
    tr: "Hastalik secin",
  },
  "api.chronicCare.unsupported": {
    en: "Unsupported condition",
    tr: "Desteklenmeyen hastalik",
  },
  "api.chronicCare.analysisFailed": {
    en: "Analysis failed, please try again",
    tr: "Analiz başarısiz oldu",
  },
  "api.clinicalTrials.enterCondition": {
    en: "Please enter a condition or disease",
    tr: "Lutfen bir durum veya hastalik giriniz",
  },
  "api.selectSymptom": {
    en: "Select at least one symptom",
    tr: "En az bir semptom seçin",
  },
  "api.elderCare.analysisFailed": {
    en: "Analysis failed, please try again",
    tr: "Analiz başarısiz oldu, tekrar deneyin",
  },
  "api.foodInteraction.selectFood": {
    en: "Select at least one food",
    tr: "En az bir besin seçin",
  },
  "api.foodInteraction.noMeds": {
    en: "No medications found. Add your medications in profile settings.",
    tr: "İlaç profiliniz boş. Profil ayarlarından ilaçlarınızı ekleyin.",
  },
  "api.foodInteraction.analysisFailed": {
    en: "Analysis failed",
    tr: "Analiz başarısız oldu",
  },
  "api.hairNail.selectConcern": {
    en: "Select at least one concern",
    tr: "En az bir sorun seçin",
  },
  "api.depression.crisisMessage": {
    en: "Your PHQ-9 results indicate you may be having thoughts of self-harm. Please reach out for professional support immediately. You are not alone and help is available.",
    tr: "PHQ-9 sonuclariniz, kendinize zarar verme dusunceleri olabilecegini gosteriyor. Lutfen hemen profesyonel destek alin. Yalniz degilsiniz ve yardim mevcuttur.",
  },
  "api.depression.crisisLine1": {
    en: "Suicide & Crisis Lifeline: 988",
    tr: "Intihar Onleme Hattı: 182",
  },
  "api.depression.crisisLine2": {
    en: "Crisis Text Line: Text HOME to 741741",
    tr: "Sağlık Bakanlığı ALO: 184",
  },
  "api.depression.seeSpecialist": {
    en: "Please speak with a mental health professional today.",
    tr: "Lutfen bugun bir ruh sağlığı uzmaniyla görüşün.",
  },
  "api.depression.tellSomeone": {
    en: "Tell someone you trust how you are feeling.",
    tr: "Guvendiginiz birine nasil hissettiginizi anlatin.",
  },

  // ── API Route Batch 3 ────────────────────────
  "api.authRequired": {
    en: "Authentication required",
    tr: "Giriş yapmanız gerekiyor",
  },
  "api.analysisFailed": {
    en: "Analysis failed",
    tr: "Analiz başarısız",
  },
  "api.healthGoals.describeGoal": {
    en: "Describe your goal",
    tr: "Hedefinizi açıklayın",
  },
  "api.healthGoals.planFailed": {
    en: "Failed to create plan",
    tr: "Plan oluşturulamadı",
  },
  "api.interactionMap.min2Meds": {
    en: "At least 2 medications required",
    tr: "En az 2 ilaç gerekli",
  },
  "api.intermittentFasting.analysisFailed": {
    en: "Analysis failed",
    tr: "Analiz başarısız oldu",
  },
  "api.kidneyDashboard.creatinineOrEgfr": {
    en: "Creatinine or eGFR value required",
    tr: "Kreatinin veya eGFR değeri gerekli",
  },
  "api.labelReader.enterIngredients": {
    en: "Please enter the ingredients list",
    tr: "Lütfen içerik listesini giriniz",
  },
  "api.liverMonitor.altOrAst": {
    en: "ALT or AST value required",
    tr: "ALT veya AST değeri gerekli",
  },
  "api.mentalWellness.minDays": {
    en: "Need at least 7 days of data for AI analysis",
    tr: "AI analiz için en az 7 günlük veri gerekli",
  },
  "api.mentalWellness.crisisMessage": {
    en: "We detected concerning language in your entries. Please reach out to a mental health professional or crisis line (988) immediately. You are not alone.",
    tr: "Kayıtlarınızda endişe verici ifadeler tespit edildi. Lütfen hemen bir ruh sağlığı uzmanıyla veya kriz hattı (182) ile iletişime geçin. Yalnız değilsiniz.",
  },

  // ── pain-diary ──
  "api.painDiary.validLocation": {
    en: "Select a valid pain location",
    tr: "Geçerli bir bölge seçin",
  },
  "api.painDiary.minEntries": {
    en: "Need at least 7 entries for AI analysis",
    tr: "AI analiz için en az 7 kayıt gerekli",
  },

  // ── pharmacogenetics ──
  "api.pharmacogenetics.noMeds": {
    en: "No medications found in your profile",
    tr: "Profilinizde ilaç bulunamadı",
  },

  // ── postpartum-support ──
  "api.postpartum.crisisMessage": {
    en: "Your EPDS results indicate you may be having thoughts of self-harm. The postpartum period can be incredibly challenging and seeking help is a sign of strength. Please reach out to a professional immediately.",
    tr: "EPDS sonuclariniz kendinize zarar verme dusunceleri olabilecegini gosteriyor. Dogum sonrasi donem cok zor olabilir ve yardim almak guc gosterisidir. Lutfen hemen bir uzmana ulasin.",
  },
  "api.postpartum.crisisLine1": {
    en: "Postpartum Support International: 1-800-944-4773",
    tr: "Kriz Hattı: 182",
  },
  "api.postpartum.crisisLine2": {
    en: "Crisis Line: 988",
    tr: "Doğum Sonrası Destek: Doktorunuzu arayın",
  },

  // ── pregnancy-tracker ──
  "api.pregnancy.emergencyMessage": {
    en: "The symptoms you described may indicate preeclampsia or another serious complication. Call your doctor or go to the emergency room IMMEDIATELY. Do not delay.",
    tr: "Belirttiginiz semptomlar preeklampsi veya diger ciddi bir komplikasyonun habercisi olabilir. DERHAL doktorunuzu arayın veya acil servise gidin. Gecikmeyin.",
  },

  // ── prospectus-reader ──
  "api.prospectus.unsupportedFile": {
    en: "Unsupported file type. Upload JPEG, PNG, or PDF.",
    tr: "Desteklenmeyen dosya formatı. JPEG, PNG veya PDF yükleyin.",
  },
  "api.prospectus.readFailed": {
    en: "Could not read prospectus, try again",
    tr: "Prospektüs okunamadı, tekrar deneyin",
  },

  // ── ptsd-support ──
  "api.ptsd.crisisMessage": {
    en: "We noticed concerning thoughts. Please reach out to a mental health professional or crisis line (988) immediately. You are not alone.",
    tr: "Endise verici dusunceler fark ettik. Lutfen hemen bir ruh sağlığı uzmaniyla veya kriz hattı (182) ile iletisime gecin. Yalniz degilsiniz.",
  },
  "api.ptsd.crisisLine1": {
    en: "Suicide & Crisis Lifeline: 988",
    tr: "Kriz Hattı: 182",
  },
  "api.ptsd.crisisLine2": {
    en: "Crisis Text Line: Text HOME to 741741",
    tr: "Sağlık Bakanlığı ALO: 184",
  },
  "api.ptsd.responseLine1": {
    en: "Suicide & Crisis Lifeline: 988",
    tr: "Kriz Hattı: 182",
  },
  "api.ptsd.responseLine2": {
    en: "Crisis Text Line: Text HOME to 741741",
    tr: "Sağlık Bakanlığı ALO: 184",
  },
  "api.ptsd.responseLine3": {
    en: "Veterans Crisis Line: 1-800-273-8255 Press 1",
    tr: "Sağlık Bakanlığı ALO: 184",
  },

  // ── radiology-analysis ──
  "api.radiology.disclaimer": {
    en: "This analysis is for educational purposes only. Not a radiological diagnosis.",
    tr: "Bu analiz yalnızca eğitim amaçlıdır. Radyolojik tanı değildir.",
  },

  // ── rare-diseases ──
  "api.rareDiseases.enterName": {
    en: "Please enter a disease name",
    tr: "Lutfen bir hastalik adi giriniz",
  },

  // ── scan-medication ──
  "api.scanMedication.promptTr": {
    en: "This is a photo of a medication box or supplement bottle. Please extract:\n1. Brand name (on the box)\n2. Active ingredient (generic name)\n3. Dosage (mg/ml/IU)\n4. Form (tablet/capsule/liquid)\n\nRespond in JSON format:\n{\"brand_name\": \"...\", \"generic_name\": \"...\", \"dosage\": \"...\", \"form\": \"...\", \"confidence\": \"high/medium/low\"}\n\nIf unreadable: {\"error\": \"Cannot read\", \"confidence\": \"low\"}",
    tr: "Bu bir ilaç kutusu veya takviye fotoğrafı. Lütfen şunları çıkar:\n1. Marka adı (kutu üzerindeki)\n2. Etken madde (jenerik ad)\n3. Doz (mg/ml/IU)\n4. Form (tablet/kapsül/likit)\n\nJSON formatında yanıt ver:\n{\"brand_name\": \"...\", \"generic_name\": \"...\", \"dosage\": \"...\", \"form\": \"...\", \"confidence\": \"high/medium/low\"}\n\nEğer okunamıyorsa: {\"error\": \"Okunamadı\", \"confidence\": \"low\"}",
  },

  // ── second-opinion ──
  "api.secondOpinion.describeConcern": {
    en: "Please describe your concern",
    tr: "Lutfen endiselerinizi yaziiniz",
  },

  // ── skin-health ──
  "api.skinHealth.validConcern": {
    en: "Select a valid skin concern",
    tr: "Geçerli bir cilt sorunu seçin",
  },

  // ── smoking-cessation ──
  "api.smoking.currency": {
    en: "USD",
    tr: "TL",
  },
  "api.smoking.avgPackPrice": {
    en: "$8",
    tr: "50 TL",
  },
  "api.smoking.analysisFailed": {
    en: "Analysis failed",
    tr: "Analiz başarısız oldu",
  },

  // ── snoring-apnea ──
  "api.snoring.lowRisk": {
    en: "Low Risk",
    tr: "Dusuk Risk",
  },
  "api.snoring.lowRiskRec": {
    en: "Your STOP-BANG score indicates low risk. Consult your doctor if symptoms persist.",
    tr: "STOP-BANG skorunuz dusuk riskli. Semptomlariniz devam ederse doktorunuza danışıniz.",
  },
  "api.snoring.moderateRisk": {
    en: "Moderate Risk",
    tr: "Orta Risk",
  },
  "api.snoring.moderateRiskRec": {
    en: "Your STOP-BANG score indicates moderate risk. Consider consulting your doctor for sleep lab evaluation.",
    tr: "STOP-BANG skorunuz orta dereceeli risk gosteriyor. Uyku laboratuvari değerlendirmesi için doktorunuza danışıniz.",
  },
  "api.snoring.highRisk": {
    en: "High Risk",
    tr: "Yuksek Risk",
  },
  "api.snoring.highRiskRec": {
    en: "Your STOP-BANG score indicates high risk. A sleep lab evaluation is strongly recommended. Please consult your doctor.",
    tr: "STOP-BANG skorunuz yuksek risk gosteriyor. Uyku laboratuvari değerlendirmesi için doktorunuza basvurmaniz onerilir.",
  },

  // ── sports-performance ──
  "api.sports.selectSport": {
    en: "Please select a sport type",
    tr: "Lutfen bir spor turu secin",
  },
  "api.sports.selectGoal": {
    en: "Please select a goal",
    tr: "Lutfen bir hedef secin",
  },
  "api.sports.analysisFailed": {
    en: "Analysis failed, please try again",
    tr: "Analiz başarısiz oldu, tekrar deneyin",
  },

  // ── supplement-check ──
  "api.supplementCheck.langInstr": {
    en: "All text fields in English.",
    tr: "ALL text fields (recommendedDose, frequency, personalizedNote, warningMessage, interactions) MUST be IN TURKISH.",
  },
  "api.supplementCheck.doseExample": {
    en: "500mg daily",
    tr: "günde 500mg",
  },
  "api.supplementCheck.freqExample": {
    en: "once daily",
    tr: "günde bir kez",
  },
  "api.supplementCheck.turkishStyle": {
    en: "",
    tr: "ALL text fields MUST be in Turkish. Write naturally in Turkish, like a friend texting.",
  },
  "api.supplementCheck.fallbackNote": {
    en: "Personalized dosing info unavailable. Please consult your healthcare provider.",
    tr: "Bu takviye için kişiselleştirilmiş doz bilgisi şu an alınamadı. Sağlık profesyonelinize danışın.",
  },

  // ── supplement-compare ──
  "api.supplementCompare.selectTwo": {
    en: "Select two supplements",
    tr: "İki takviye seçin",
  },
  "api.supplementCompare.failed": {
    en: "Comparison failed",
    tr: "Karşılaştırma başarısız",
  },

  // ── symptom-checker ──
  "api.symptomChecker.describeSymptoms": {
    en: "Please describe your symptoms",
    tr: "Lütfen semptomlarınızı yazın",
  },
  "api.symptomChecker.analysisFailed": {
    en: "Analysis failed, please try again",
    tr: "Analiz başarısız oldu, tekrar deneyin",
  },

  // ── thyroid-dashboard ──
  "api.thyroid.tshRequired": {
    en: "TSH value required",
    tr: "TSH değeri gerekli",
  },

  // ── travel-health ──
  "api.travel.enterDestination": {
    en: "Please enter a destination country",
    tr: "Lütfen bir hedef ülke girin",
  },
  "api.travel.selectDates": {
    en: "Please select travel dates",
    tr: "Lütfen seyahat tarihlerini seçin",
  },
  "api.travel.analysisFailed": {
    en: "Analysis failed, please try again",
    tr: "Analiz başarısız oldu, tekrar deneyin",
  },

  // ── vaccination ──
  "api.vaccination.analysisFailed": {
    en: "Analysis failed",
    tr: "Analiz başarısız",
  },

  // ── bot-send ──
  "api.bot.btnDone": {
    en: "✅ Done",
    tr: "✅ Tamamladım",
  },
  "api.bot.btnPause": {
    en: "⏸ Pause",
    tr: "⏸ Duraklat",
  },

  // ── bot-webhook ──
  "api.bot.unknownReply": {
    en: "Message received. Reply '1' or 'done' to mark tasks complete.",
    tr: "Mesajınız alındı. Görevleri tamamlamak için '1' veya 'tamam' yazın.",
  },

  // ── template literal keys ──
  "cardio.riskEstimateValue": {
    en: "Your estimated 10-year cardiovascular risk is {score}%",
    tr: "Tahmini 10 yıllık kardiyovasküler riskiniz %{score}",
  },
  "cardio.statinNoteWithScore": {
    en: "With a {score}% ",
    tr: "%{score} ",
  },
  "referral.stepLabel": {
    en: "Step {step}",
    tr: "Adım {step}",
  },
  "favSupp.savedCount": {
    en: "{count} supplements saved",
    tr: "{count} takviye kaydedildi",
  },
  "fasting.daysRecorded": {
    en: "{count} days recorded",
    tr: "{count} gün kaydedildi",
  },
  "grief.moodScore": {
    en: "Your mood: {score}/10",
    tr: "Ruh haliniz: {score}/10",
  },
  "healthDiary.entriesCount": {
    en: "Entries ({count})",
    tr: "Girdiler ({count})",
  },
  "jetLag.adjustmentDays": {
    en: "Estimated adjustment: {days} days",
    tr: "Tahmini uyum süresi: {days} gün",
  },
  "newParent.burnoutScore": {
    en: "Score: {score}/8",
    tr: "Skor: {score}/8",
  },
  "notifications.medReminder": {
    en: "{name} reminder",
    tr: "{name} hatırlatması",
  },
  "painDiary.recordsCount": {
    en: "{count} records in last 30 days",
    tr: "Son 30 günde {count} kayıt",
  },
  "quickActions.drankWater": {
    en: "Drank water ({count})",
    tr: "Su içtim ({count})",
  },
  "email.greeting": {
    en: "Dear {name},",
    tr: "Sayın {name},",
  },
  "email.rejected.subject": {
    en: "Regarding Your Profile Verification",
    tr: "Profil Onay Süreciniz Hakkında",
  },
  "email.rejected.preheader": {
    en: "We kindly ask you to update your documents",
    tr: "Belgelerinizi güncellemenizi rica ediyoruz",
  },
  "email.rejected.body1": {
    en: "We have carefully reviewed your profile verification application. Unfortunately, the documents you submitted did not meet our verification criteria at this time.",
    tr: "Profil doğrulama başvurunuzu titizlikle inceledik. Ne yazık ki, gönderdiğiniz belgeler doğrulama kriterlerimizi şu anda karşılayamadı.",
  },
  "email.rejected.reasonLabel": {
    en: "Feedback",
    tr: "Geri Bildirim",
  },
  "email.rejected.body2": {
    en: "Don't worry — you can resubmit with updated documents. Our team will prioritize your new application.",
    tr: "Endişelenmeyin — belgelerinizi güncelleyerek tekrar başvurabilirsiniz. Ekibimiz yeni başvurunuzu öncelikli olarak değerlendirecektir.",
  },
  "email.rejected.tips": {
    en: "Tips for Resubmission",
    tr: "İpuçları",
  },
  "email.rejected.tip1": {
    en: "Ensure the entire document is visible and legible",
    tr: "Belgenin tamamı görünür ve okunaklı olmalı",
  },
  "email.rejected.tip2": {
    en: "Photos should be clear and well-lit",
    tr: "Fotoğraflar net, iyi aydınlatılmış olmalı",
  },
  "email.rejected.tip3": {
    en: "PDF documents should be from official sources (e-Government)",
    tr: "PDF belgeler resmi kaynaklardan (e-Devlet) olmalı",
  },
  "email.rejected.tip4": {
    en: "Name on document must match your profile information",
    tr: "Belgedeki isim ile profil bilgileriniz eşleşmeli",
  },
  "email.rejected.cta": {
    en: "Resubmit Documents",
    tr: "Belgeleri Tekrar Yükle",
  },
  "email.rejected.support": {
    en: "Have questions? Reach us at support@doctopal.com.",
    tr: "Sorularınız mı var? Bize destek@doctopal.com adresinden ulaşabilirsiniz.",
  },
  "email.footer": {
    en: "This email was sent automatically by the Doctopal verification system.",
    tr: "Bu e-posta Doctopal doğrulama sistemi tarafından otomatik gönderilmiştir.",
  },
  "email.approved.subject": {
    en: "Congratulations, Your Profile is Verified!",
    tr: "Tebrikler, Profiliniz Onaylandı!",
  },
  "email.approved.preheader": {
    en: "You are now a Verified Health Professional",
    tr: "Artık Onaylı Sağlık Profesyonelisiniz",
  },
  "email.approved.body1": {
    en: "Your professional credentials have been successfully verified by our team. You now have the <strong>Verified Health Professional</strong> badge on Doctopal.",
    tr: "Profesyonel belgeleriniz ekibimiz tarafından başarıyla doğrulandı. Artık Doctopal platformunda <strong>Onaylı Sağlık Profesyoneli</strong> rozetine sahipsiniz.",
  },
  "email.approved.badgeText": {
    en: "Verified Health Professional",
    tr: "Onaylı Sağlık Profesyoneli",
  },
  "email.approved.professionLabel": {
    en: "Verified Title",
    tr: "Doğrulanan Ünvan",
  },
  "email.approved.body2": {
    en: "This badge will be visible on your profile, offering benefits like priority search ranking, increased patient trust, and eligibility for institutional partnerships.",
    tr: "Bu rozet profilinizde görünür olacak ve arama sonuçlarında öncelikli sıralama, hasta güveni artışı ve kurumsal ortaklık fırsatları gibi ayrıcalıklar sunacaktır.",
  },
  "email.approved.cta": {
    en: "Go to My Profile",
    tr: "Profilime Git",
  },

  // ── remaining page keys ──
  "clinicalResult.findProfessionalUrl": {
    en: "https://www.google.com/search?q=psychiatrist+near+me",
    tr: "https://www.google.com/search?q=psikiyatrist+yakınımda",
  },
  "familySummary.missedMedsAlert": {
    en: "{name} hasn't taken meds for {days} days",
    tr: "{name} {days} gündür ilaç almadı",
  },
  "boss.dayCounter": {
    en: "Day {daysPassed}/{duration}",
    tr: "Gün {daysPassed}/{duration}",
  },

  // ── notifications page ──
  "notif.pendingMed": {
    en: "med",
    tr: "ilaç",
  },
  "notif.pendingMeds": {
    en: "meds",
    tr: "ilaç",
  },
  "notif.pendingSupplement": {
    en: "supplement",
    tr: "takviye",
  },
  "notif.pendingSupplements": {
    en: "supplements",
    tr: "takviye",
  },
  "notif.pendingEvent": {
    en: "event",
    tr: "etkinlik",
  },
  "notif.pendingEvents": {
    en: "events",
    tr: "etkinlik",
  },

  // ── pregnancy-tracker page ──
  "pregnancy.trimester1": {
    en: "1st trimester",
    tr: "1. trimester",
  },
  "pregnancy.trimester2": {
    en: "2nd trimester",
    tr: "2. trimester",
  },
  "pregnancy.trimester3": {
    en: "3rd trimester",
    tr: "3. trimester",
  },

  // ── settings page ──
  "settings.title": {
    en: "Settings",
    tr: "Ayarlar",
  },
  "settings.subtitle": {
    en: "Manage your preferences",
    tr: "Tercihlerinizi yönetin",
  },
}
Object.assign(t, commonToolKeys)

/**
 * Export the raw translations object for iteration.
 */
export { t, MESSAGE_ARRAYS }
