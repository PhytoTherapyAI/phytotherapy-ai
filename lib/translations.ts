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
    en: "Phytotherapy.ai is an educational wellness tool and does not provide medical diagnosis or treatment. All recommendations are based on published scientific research. Always consult your healthcare provider before starting any supplement or making changes to your medication.",
    tr: "Phytotherapy.ai bir eğitim amaçlı sağlık aracıdır; tıbbi teşhis veya tedavi sunmaz. Tüm öneriler yayımlanmış bilimsel araştırmalara dayanır. Herhangi bir takviye başlamadan veya ilaç değişikliği yapmadan önce sağlık profesyonelinize danışın.",
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
  "lp.searchButton": { en: "Check Now", tr: "Sorgula" },
  "lp.featureTitle1": { en: "Four pillars of", tr: "Bütünleştirici sağlığın" },
  "lp.featureTitle2": { en: "integrative health", tr: "dört temel direği" },
  "lp.explore": { en: "Explore", tr: "Keşfet" },
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
  "chat.analyzingFile": { en: "Analyzing your file...", tr: "Dosyanız analiz ediliyor..." },
  "chat.emergencyTitle": { en: "EMERGENCY WARNING", tr: "ACİL UYARI" },

  // ══════════════════════════════════════════
  // Onboarding — Medications Step
  // ══════════════════════════════════════════
  "onb.noMeds": { en: "I don't take any medications", tr: "Herhangi bir ilaç kullanmıyorum" },
  "onb.yourMeds": { en: "Your medications:", tr: "İlaçlarınız:" },
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
  "profile.allergies": { en: "Allergies", tr: "Alerjiler" },
  "profile.noAllergies": { en: "No allergies recorded", tr: "Kayıtlı alerji yok" },
  "profile.healthFlags": { en: "Health Flags", tr: "Sağlık Durumu" },
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
  "cal.addVital": { en: "Record Vital", tr: "Vital Kaydet" },
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
 * Export the raw translations object for iteration.
 */
export { t }
