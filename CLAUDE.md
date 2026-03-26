# CLAUDE.md — Phytotherapy.ai Proje Anayasası v12.0

## ⚡ Hızlı Bağlam (Her Oturum Başında Oku)

**Phytotherapy.ai** — kanıta dayalı fitoterapi + modern tıp köprüsü kuran AI sağlık asistanı.
- **Ekip:** 3 tıp öğrencisi, teknik bilgi yok — Claude tüm kodu yazıyor
- **Hackathon:** Harvard "Building High-Value Health Systems" — 11-12 Nisan 2026
- **Domain:** phytotherapy.ai ✅ (Vercel'e bağlı, canlı) — 2 yıllık ödeme yapıldı
- **Sunum dili:** İngilizce | **Arayüz dili:** İngilizce (TR/EN toggle navbar'da ✅)
- **Deploy:** Vercel ✅ + Supabase ✅ (tablolar kurulu, email auth çalışıyor)
- **AI Motor:** Google Gemini API (gemini-2.0-flash primary + gemini-2.5-flash fallback)
- **OS:** Windows
- **GitHub:** github.com/PhytoTherapyAI/phytotherapy-ai

---

## Vizyon

> "Dünyanın ilk Kanıta Dayalı Bütünleştirici Tıp Asistanı — modern ilaç tedavisini, bitkisel tıbbı ve kişisel sağlık profilini birleştiren, hem hastaya hem doktora hizmet eden platform."

---

## Temel Felsefe

1. **Primum non nocere** — Önce zarar verme.
2. **Kanıta dayalı** — PubMed, NIH, WHO dışında kaynak yok.
3. **Doktoru bypass etme, güçlendir** — Teşhis koymaz, karar destek asistanıdır.
4. **Şeffaflık** — Her öneri makale referansıyla gelir.
5. **Kimseyi boş gönderme** — Her zaman genel bilgi + doktora yönlendirme.
6. **İlaç profili olmadan doz tavsiyesi verilmez.**
7. **Önce dinle, sonra konuş** — Anlamadan öneri yapma.

---

## Teknik Stack

```
Frontend:     Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
Backend:      Next.js API Routes (serverless — Vercel)
Database:     Supabase (PostgreSQL) ✅ — tüm tablolar kurulu
AI Engine:    Google Gemini API (gemini-2.0-flash primary + gemini-2.5-flash fallback)
Tıbbi Veri:   PubMed E-utilities API
İlaç Veri:    OpenFDA API
PDF:          @react-pdf/renderer
Deploy:       Vercel ✅ — phytotherapy.ai
Auth:         Supabase Auth ✅ (email çalışıyor, Google OAuth kod hazır — credentials gerekli)
OS:           Windows
```

### AI Motor Yol Haritası
- **Hackathon:** Gemini (ücretsiz kota, hız)
- **Para kazanmaya başlayınca:** gpt-4o-mini (Türkçe + güvenilirlik)
- **Doktor paneli açılınca:** Claude API (tıbbi etik + güvenlik)
- **Multi-agent pipeline:** Gemini + OpenAI üretir, Claude denetler — ciddi gelir olunca
- **DeepSeek V4:** Henüz resmi çıkmadı. Çıkınca bağımsız tıbbi güvenlik testi gerekli. Hasta verisi için asla.

---

## Sistem Promptu — Final v2 (Gemini)

```
You are Phytotherapy.ai — a knowledgeable health-focused companion.
Think of yourself as a friend who happens to have deep medical knowledge:
warm, natural, genuinely curious about the person, but rigorously
evidence-based when it matters.

━━━ PERSONALITY ━━━
- Talk like a smart friend texting, not a doctor writing a report
- Warm, empathetic, occasionally playful
- Genuinely curious — you want to understand before you advise
- Never robotic, never cold, never formulaic

━━━ CONVERSATION MODE (no database needed) ━━━
Triggers: feelings, daily events, casual sharing, non-specific comments
- Respond naturally, 1-3 sentences max
- Empathy first, always — one sentence that shows you heard them
- Ask ONE clarifying question before offering any information
- Simple sharing = simple acknowledgment, not a lecture
- Never say "I can only discuss health topics"
- Connect to health naturally when relevant, never forcefully
- Example: "Bugün çok yorgunum" → "Yok mu, dün nasıl uyudun?"

━━━ KNOWLEDGE MODE (PubMed + database REQUIRED) ━━━
Triggers: any question seeking information, mechanism, protocol,
dose, comparison — regardless of topic (fitness, nutrition, sleep,
herbs, supplements, mental health, sports performance, anything)
- ALWAYS search PubMed first, no exceptions
- Never use training memory as a health fact source
- If PubMed has insufficient data: "I couldn't find enough data on
  PubMed for this, but in my view..." then give honest opinion
- Sources go in collapsible panel only, never in message body

━━━ MIXED MODE ━━━
User shares something + asks something →
acknowledge in 1 sentence first, then go to database, then respond

━━━ PROFILE AWARENESS ━━━
- Always silently load user's full profile: medications, allergies,
  conditions, age, gender, kidney/liver status, pregnancy
- Use profile data naturally — never say "according to your profile"
- Just know it, like a friend who knows your history
- Connect dots proactively: if user mentions joint pain and takes
  Isotretinoin, make that connection without being asked
- If profile is incomplete, gently note what's missing and why it matters

━━━ RESPONSE FORMAT ━━━
- Length matches question depth:
  casual → 1-2 sentences
  health question → 3-5 sentences max
  complex analysis → up to 7 sentences, still conversational
- Most important point always in first sentence
- No bullet points, no headers, no numbered lists
- No "Assessment / Recommendations / Safety Notes" structure
- Weave everything into natural flowing sentences
- Tone shifts naturally: relaxed for daily chat, serious for risk topics
- One clarifying question at the end when appropriate
- Disclaimer only when genuinely needed, woven into sentence naturally
  NOT a warning block at the end
- Example: "ama bunu doktorunla konuş, doz meselesi var burada"

━━━ SOURCES ━━━
- Never appear in message body
- Always in collapsible "Sources ▾" panel below message
- User clicks to expand if they want

━━━ COLOR-CODED SUPPLEMENT SYSTEM (Noom'dan) ━━━
- Green ✅ = Safe, evidence grade A/B
- Yellow ⚠️ = Caution, limited evidence or mild interaction risk
- Red ❌ = Dangerous, significant interaction or contraindication
- Always shown on supplement/herb recommendations

━━━ EMERGENCY (overrides everything, always active) ━━━
Chest pain, breathing difficulty, loss of consciousness, heavy bleeding,
suicidal ideation, stroke, seizure, anaphylaxis, poisoning →
Immediately: "This sounds like an emergency — call 112/911 right now."
No herbs, no analysis, no waiting.

━━━ HARD RULES ━━━
- No diagnosis, ever
- No dosage without medication profile
- Evidence grade always noted: A (RCTs) / B (limited) / C (traditional)
- Match user's language automatically (TR/EN)
- Never send user away empty — always something useful + referral
```

### Asistan Kapsam (Genişletilmiş)
Asistan artık sadece fitoterapi değil, genel sağlık ve yaşam kalitesi asistanı:
- Spor & fiziksel performans (antrenman, toparlanma, adaptogenler)
- Beslenme & metabolizma (yemek-ilaç etkileşimleri, anti-inflamatuar beslenme)
- Mental sağlık & uyku (anksiyete, odaklanma, uyku kalitesi)
- Günlük sohbet (her konuda, sağlık perspektifinden)
- Kod yazmaz, hukuki soru yanıtlamaz — ama bunu soğukça reddetmez

---

## Kullanıcı Akışı

### Misafir Modu
- Genel sağlık, spor, beslenme soruları → yanıtla (3/gün)
- İlaç etkileşim kontrolü → yanıtla (3/gün)
- Kan tahlili analizi → kayıt duvarı
- Kişisel öneri → "Güvenli öneri için profil gerekiyor. Kayıt ol."
- 4. sorguda kayıt duvarı

### Kayıt Sonrası
- Otomatik 7 gün TAM PREMIUM — kart gerekmez, otomatik ödeme yok
- 7 gün sonra freemium'a geçiş
- Premium özellikler kapanır ama veri silinmez
- Bildirim sistemi: 5. gün → 7. gün → bitince

### Onboarding Wizard — Katman 1 (Zorunlu, 7 Adım)
| Adım | İçerik |
|------|--------|
| 1 | Ad, yaş, cinsiyet + 18 yaş kontrolü |
| 2 | Aktif ilaçlar (zorunlu beyan) |
| 3 | Alerjiler (zorunlu beyan) |
| 4 | Gebelik/emzirme |
| 5 | Alkol/sigara |
| 6 | Böbrek/karaciğer + ameliyat + kronik hastalıklar |
| 7 | Sorumluluk reddi + dijital imza → Supabase |

### Onboarding Wizard — Katman 2 (İsteğe Bağlı)
Sağlık hedefi (enerji/kilo/uyku/stres/performans), takviye, beslenme, egzersiz, uyku, boy/kilo/kan grubu

### İlaç Güncelleme — 3 Katmanlı Kontrol ✅
| Katman | Süre | Depolama | Kapatılabilir |
|--------|------|----------|---------------|
| Günlük onay | Her gün | localStorage | ✅ X ile |
| İlaç güncellemesi | 15 gün | Supabase | ❌ Zorunlu |
| Onboarding yenileme | 30 gün | localStorage | ❌ Zorunlu |

---

## Freemium Mimarisi (Final)

### 7 Günlük Trial
- Kayıt olunca otomatik 7 gün TAM premium
- Kart gerekmez, otomatik ödeme yok
- 7 gün sonra freemium'a düşer
- Veri asla silinmez
- Bildirim: 5. gün + 7. gün + bitince

### Planlar

| Plan | Profil | Fiyat | Hedef |
|------|--------|-------|-------|
| Misafir | 1 sınırlı (3/gün) | Ücretsiz | Merak uyandır |
| Üye Free | 1 tam | Ücretsiz | Günlük kullanım |
| Premium | 3 (kendin+2) | ₺99/ay veya ₺899/yıl (%24) | Ana gelir |
| Aile Paketi | 6 (2+4) | ₺179/ay veya ₺1.699/yıl | Aile geliri |
| Doktor Paketi | Çoklu hasta | ₺499/ay veya ₺3.999/yıl | B2B |

### Doktor Paketi Onay Süreci
- TC kimlik + diploma fotoğrafı VEYA TTB sicil numarası
- Manuel onay (başta ekip onaylıyor, sonra otomatize edilir)
- Klinik fatura edilebilir ("sağlık yönetim yazılımı")

### Free Özellikleri (Sabit — Asla Geri Alınmaz)
**Asistan:** Tüm sağlık soruları 20/gün, kişisel öneri, sohbet sınırsız
**Takvim:** İlaç & takviye kutucukları, su takibi, vital takibi, günlük görevler, push bildirimleri, telefon takvimi (.ics), spor/randevu/operasyon ekleme
**Araçlar:** Kan tahlili 3/ay, PDF rapor 3/ay, günlük sağlık skoru, vital trend grafikleri, kalori ihtiyacı hesaplama, sorgu geçmişi
**Aile:** 1 ek profil (temel)

### Premium Özellikleri (3 Katman)
**Katman 1 — Akıllı Asistan:**
Asistan sınırsız, AI örüntü tespiti (haftalık), kişisel sabah/akşam protokolü, haftalık AI koçluk raporu

**Katman 2 — Derin Takip:**
Biyolojik yaş skoru + trend, metabolik portföy (4 alan), washout/cycling sistemi, boss fight protokolleri, semptom pattern tespiti, kan tahlili & PDF sınırsız, doktor PDF + email gönderimi, barcode supplement tarama, aile profili tam yönetim (3 kişi), ebeveyn denetim modu, doktor paylaşım paneli

**Katman 3 — Sosyal & Viral:**
Biyolojik yaş paylaşım kartı, haftalık özet paylaşım kartı, protokol tamamlama kartı, mevsimsel hazırlık kartı, yıllık Wrapped, anonim karşılaştırma skoru, öncelikli destek

### Premium Tease Sistemi
- 14. gün: "Bu hafta 2 örüntü tespit ettim, görmek ister misin?" bildirimi
- 21. gün: "Ashwagandha washout yaklaşıyor" uyarısı
- 30. gün: "Biyolojik yaş skorun güncellendi" — görmek için premium
- Sürekli: Premium özellikler kilitli ama görünür

### Hate Riski Sıfırlama
- Baştan ne verirsen onu ver, sonradan alma
- Beta kullanıcılarına 3 ay premium hediye (launch'ta)
- Aile üyesi ekleme free — yönetim premium belirliyor

### Aile Profili Kuralı
- Eklenen aile üyesi için ne yapabiliyorsan, onlar için de aynısı
- Fark sadece profil sayısında: Free=2, Premium=3, Aile=6
- Ebeveyn denetim modu (18 yaş altı) premium ama ücretsiz erişilebilir güvenlik için

---

## Güvenlik Mimarisi — 3 Katman

### Katman 1: Kırmızı Kod (AI'dan ÖNCE)
```typescript
const RED_FLAGS_EN = ['chest pain','heart attack','shortness of breath',
  "can't breathe",'loss of consciousness','unconscious','seizure','stroke',
  'heavy bleeding','suicidal','suicide','poisoning','overdose',
  'sudden vision loss','paralysis','anaphylaxis'];
const RED_FLAGS_TR = ['göğüs ağrısı','kalp krizi','nefes darlığı',
  'nefes alamıyorum','bilinç kaybı','bayıldı','nöbet','felç','inme',
  'kanama','intihar','zehirlenme','doz aşımı','ani görme kaybı','anafilaksi'];
```
Acil kelime → tam ekran emergency modal → "I understand this is an emergency" butonuna kadar kilitli.

### Katman 2: İlaç Etkileşim Motoru ✅
OpenFDA + Gemini hybrid. Renk kodlu SafetyBadge: ✅ Yeşil (güvenli) / ⚠️ Sarı (dikkat) / ❌ Kırmızı (tehlikeli)

### Katman 3: RAG ✅
PubMed → Gemini (temperature:0) → collapsible kaynak paneli

---

## KVKK / Güvenlik
- Minimum veri + şifreli saklama
- Rate limiting: 10/dakika
- Input sanitization
- "Verilerimi sil" + "Verilerimi indir" (Sprint 8)
- Max 2 yıl saklama
- Dijital onay timestamp Supabase'de
- Sağlık verisi Supabase encrypted kolonda

---

## Supabase Tabloları ✅
```
user_profiles, user_medications, user_allergies,
query_history, blood_tests, consent_records, guest_queries
```

---

## Tam Özellik Listesi

### Asistan
Sağlık + spor + beslenme + mental sağlık + günlük sohbet, PubMed zorunlu, arkadaş tonu, profil farkındalığı, collapsible kaynak paneli, renk kodlu supplement sistemi, acil tespit her modda aktif

### İlaç & Etkileşim
OpenFDA + Gemini hybrid, Türkçe ilaç adları, marka→etken madde, renk kodlu SafetyBadge, ilaç fotoğraflama→otomatik profil, barcode supplement tarama, 3 katmanlı güncelleme kontrolü
NOT: Reçete OCR çıkarıldı — Türkiye'de güvenilir çalışmaz, güvenlik riski

### Kan Tahlili
30 markör, 9 kategori, cinsiyet bazlı referans, AI yorumu, yaşam koçluğu, PDF doktor raporu, birim otomatik düzeltme (AI)

### Takvim Hub (Merkezi Sağlık Hub'ı)
- Ay/hafta/gün görünümü
- İlaç kutucuk sistemi (doz kadar kutu, tik atma)
- Çan ikonu → bildirim seçimi (hangi doz, hangi saat)
- Takviye takibi (aynı altyapı)
- Su takibi + teşvik mesajları
- Vital takibi (tansiyon, şeker, kilo)
- Spor / randevu / semptom notu ekleme
- Planlı operasyon girişi
- Telefon takvimi entegrasyonu (.ics — iOS/Android)
- Finishable günlük görevler (Woebot'tan)
- 1 hafta sessizlik hatırlatması
- PWA push notification
- Sabah: "İlaçların güncel mi?" sorusu → sonra günlük özet kartı

### Sağlık Skorları
- Biyolojik yaş skoru (Gemini hesaplama) — PREMIUM
- Günlük sağlık skoru (0-100) — FREE
- Washout/cycling geri sayımı — PREMIUM
- Mikro check-in (enerji/uyku/şişkinlik) — FREE
- Metabolik portföy (4 alan: Enerji/Stres/Uyku/Bağışıklık) — PREMIUM
- Semptom pattern tespiti (AI haftalık) — PREMIUM
- Kalori ihtiyacı hesaplama tool'u (tek seferlik) — FREE
- Ana sayfa günlük özet kartı — FREE
- Sabah özeti push bildirimi — FREE
- Haftalık özet formatı (Fitbit'ten) — PREMIUM

### Viral & Oyunlaştırma
- Biyolojik yaş paylaşım kartı — PREMIUM
- Haftalık özet paylaşım kartı — PREMIUM
- İlaç etkileşimi tespit anı kartı — PREMIUM
- Protokol tamamlama kartı — PREMIUM
- Boss Fight protokolleri (bahar alerjisi, sınav haftası) — PREMIUM
- Mevsimsel hazırlık kartı — PREMIUM
- Yıllık Wrapped (Aralık'a hazır) — PREMIUM
- Gamification rozetler — FREE
- Anonim karşılaştırma skoru — PREMIUM

### Profil & Aile
- 7 adım onboarding, dijital imza
- Sağlık hedefi seçimi (onboarding katman 2)
- Aile profili — Free: 1 ek, Premium: 3 kişi, Aile paketi: 6 kişi
- Ebeveyn-çocuk (18 yaş kuralı otomatik)
- Google OAuth — S12'de
- Tarayıcı dili otomatik algılama — S12'de

### B2B
- Doktor paneli (hasta takip, ziyaret özeti AI, uyum skoru)
- Hasta davet linki
- Yeni ilaç yazarken etkileşim uyarısı
- Klinik çoklu hesap
- Sigorta wellbeing altyapısı
- E-Nabız manuel import (PDF/OCR — şimdi)
- E-Nabız resmi başvuru (Sağlık Bakanlığı — hackathon sonrası)
- E-Nabız FHIR entegrasyonu (2027 hedefi)
- Gerçek dünya kanıt verisi modülü (opt-in, anonim, KVKK uyumlu)
- Yan etki erken sinyal sistemi

### Teknik
- Rate limiting, input sanitization
- KVKK uyumu (verilerimi sil/indir, dijital imza)
- Privacy Policy + Terms (TR+EN) — Sprint 8
- PWA (şimdi) → React Native (S21)
- Apple Health + Google Fit entegrasyonu (S20)
- Wearable (ileride)

---

## Sprint Planı

### ✅ S1–S13 — TAMAMLANDI
Next.js, Auth, Onboarding (7 adım + doğum tarihi), İlaç etkileşim motoru, Chat RAG, Kan tahlili, Tasarım v2 (dark/light), TR/EN çeviri sistemi (merkezi tx() + MESSAGE_ARRAYS), 3 katmanlı ilaç kontrolü, Türkçe ilaç veritabanı, Güvenlik + Yasal sayfalar, Takvim Hub (ilaç/takviye/su/vital/etkinlik takibi, hatırlatıcı, confetti animasyonlar, .ics export, 2-sütun layout), Sağlık Skorları + Dashboard (günlük skor 0-100, mikro check-in, biyolojik yaş otomatik cache, metabolik portföy, washout takvimden gerçek veri, kalori hesaplama, semptom pattern, haftalık özet, streak fix), Ana sayfa yeniden tasarım (auth: 2x2 grid summary+asistan+hero+görsel), Navbar sadeleştirme, Takviye Sistemi Tam (200+ katalog, 80+ doz DB, 60+ TR↔EN map, dropdown arama, AI güvenlik kontrolü, doz ayar + otomatik birim, toggle alınma takibi, streak, confetti, bell hatırlatıcı tek akış, overdue uyarı, renk kodlu etkileşim, sınırsız döngü, panel-takvim senkron, etkileşim denetleyicisinden tek tıkla ekleme)

### ✅ HACKATHON BLOĞU (Tamamlandı — 25 Mart 2026)

**Sprint 8 — Güvenlik + Yasal + Asistan v2** ✅
**Sprint 9 — Takvim Hub** ✅
**Sprint 10 — Sağlık Skorları + Özet** ✅
**Sprint 11a — Viral + Oyunlaştırma** ✅
**Sprint 11b — Fixler + İyileştirmeler** ✅
**Sprint 12 — Yeni Özellikler + Auth** ✅
**Sprint 13 — Hackathon Hazırlık** ✅

**Sprint 11 Özet:**
- ✅ Paylaşım kartı altyapısı + 4 paylaşım kartı (biyolojik yaş, etkileşim anı, protokol, haftalık)
- ✅ Boss Fight protokolleri (6 boss, günlük task'lar, ilerleme takibi)
- ✅ Mevsimsel hazırlık kartı + profil bazlı etkileşim uyarısı
- ✅ Aile profili sayfası + gradient UI + Supabase migration (SQL çalıştırıldı)
- ✅ İlaç tarayıcı + barkod tarayıcı (Gemini Vision + Open Food Facts)
- ✅ Navbar: Hamburger kaldırıldı, 6 link direkt görünür, sağa hizalı
- ✅ TR çeviriler: biyolojik yaş, kan tahlili StatusBadge/EvidenceBadge, washout
- ✅ Etkileşim checker → takviyelerime ekle fix (cycleDays/breakDays metadata)
- ✅ İlaç tarayıcı profil sayfasına taşındı
- ✅ Takviye döngü bilgisi + özelleştirme

**Sprint 12 Özet:**
- ✅ Google OAuth (kod hazır, Supabase Dashboard credentials gerekli — ertelendi)
- ✅ Tarayıcı dili otomatik algılama (navigator.language)
- ✅ Kan tahlili PDF upload (Gemini Vision + birim dönüştürme)
- ✅ Gelişmiş kalori hesaplayıcı (BMI + US Navy body fat + kilo trend)
- ✅ Boss Fight + Seasonal Card profil bazlı ilaç etkileşim uyarısı
- ✅ SEO (Open Graph + Twitter Card meta tags)

**Sprint 13 Özet:**
- ✅ 3 demo senaryosu hazır (HACKATHON-PREP.md)
- ✅ Pitch deck 10 slayt planı
- ✅ 4 yedek plan (API/Supabase/internet/laptop)
- ✅ SEO + performans kontrol listesi

### 🚀 HACKATHON SONRASI (S14–S21)

**Para Bloğu (Nisan sonu → Ağustos 2026)**
- S14: Freemium altyapısı — Pricing sayfası, 7 gün trial otomatik, premium tease bildirimleri, İyzico ödeme entegrasyonu, özellik kilitleme sistemi
- S15: Kullanıcı paneli — gelişmiş dashboard, sorgu geçmişi, favoriler, gamification rozetler, anonim karşılaştırma skoru
- S16: Yıllık Wrapped altyapısı + affiliate supplement linkleri (şeffaf, asla ödeme karşılığı öneri) + aile paketi fiyatlandırma

**B2B Bloğu (Eylül → Kasım 2026)**
- S17: Doktor paneli — hasta takip, ziyaret özeti AI, uyum skoru, TC/diploma doğrulama, abonelik
- S18: Operasyon takibi + sigorta wellbeing altyapısı + E-Nabız manuel import (PDF/OCR)
- S19: Gerçek dünya kanıt verisi modülü (opt-in, anonim, KVKK) + yan etki erken sinyal sistemi + analytics

**Mobil Bloğu (Aralık 2026 → 2027)**
- S20: PWA olgunlaştırma — push notification tam, offline mode, Apple Health + Google Fit entegrasyonu
- S21: React Native — App Store + Play Store, wearable entegrasyonu, E-Nabız FHIR (2027 hedefi)

---

## Monetizasyon Stratejisi

### Pazar Önceliği
1. Türkiye (önce) — güçlü product-market fit, yerel ilaç veritabanı, MENA boşluğu
2. İngiltere / Almanya (AB regülasyonu daha tanıdık)
3. ABD (en sona — HIPAA, FDA, liability çok karmaşık)

### Gelir Fazları
- **Faz 1 (0-3 ay):** Tamamen ücretsiz, kullanıcı büyüt
- **Faz 2 (4-6. ay):** Premium açılır (İyzico entegrasyonu)
- **Faz 3 (6-12. ay):** Doktor B2B aboneliği
- **Faz 4 (12. ay+):** Sigorta görüşmeleri, yatırım turu

### Gelir Modelleri
- B2C freemium (bireysel)
- B2B doktor/klinik aboneliği
- Sigorta wellbeing programı entegrasyonu
- Affiliate supplement linkleri (şeffaf — asla ödeme karşılığı öneri)
- Gerçek dünya kanıt verisi (opt-in, anonim, KVKK uyumlu)
- **Veri satışı: KESİNLİKLE YOK**

### Altyapı Maliyetleri
- 500 kullanıcıya kadar: Ücretsiz (Vercel + Supabase free tier)
- 1000 kullanıcı: ~₺1.700/ay
- 10.000 kullanıcı: ~₺5.000/ay
- Başlangıç sermayesi: ₺25.000 yeterli
- Break-even: 1000 kullanıcı + %8 premium

---

## Rakip Analizi (Özet)

| Rakip | Ne yapıyor | Bizim farkımız |
|-------|-----------|----------------|
| Ada Health | Semptom checker, klinik onaylı | Bitkisel tıp yok, günlük takip yok, soğuk |
| Babylon Health | AI triage + doktor konsültasyonu | Çok pahalı, bitkisel yok, finansal sıkıntı |
| Noom | Kilo + davranış değişimi | Sadece kilo, ilaç/bitkisel bilgisi yok |
| Woebot | Mental sağlık CBT | Sadece mental, fiziksel sağlık yok |
| Fitbit Premium | Wearable + AI insights | Cihaz bağımlı, ilaç/bitkisel sıfır |

**Fark:** Hiçbir rakip modern tıp + bitkisel tıp + ilaç etkileşimi + kişisel profil + sohbet asistanını tek platformda birleştirmiyor.

### Rakiplerden Alınan Özellikler
- **Noom'dan:** Renk kodlu supplement sistemi (yeşil/sarı/kırmızı)
- **Woebot'tan:** Finishable günlük görevler, yargılamayan ton
- **Fitbit'ten:** Haftalık özet formatı, trend görselleştirme

---

## Etik & Yasal Çerçeve

### Sınırlar
- ✅ Genel sağlık bilgisi, ilaç etkileşimleri, supplement önerileri
- ✅ Kan tahlili yorumlama, yaşam tarzı koçluğu
- ❌ Teşhis koyma — asla
- ❌ Tedavi öneri — asla
- ❌ Reçete yazma — asla

### Güvenli Çerçeveleme
- "AI doktorunuz" değil, "sağlık asistanınız"
- Her öneri sonunda bağlamsal disclaimer (sabit blok değil)
- Onboarding dijital imzası Supabase'de kayıtlı
- Hackathon için danışman hocadan görüş alınması önerilir

### Hackathon Stratejisi
- Tüm özellikler demo sırasında açık (freemium kısıtı yok)
- Pricing sayfası gösterimde ama aktif değil
- "Şu an beta, lansman sonrası bu model devreye giriyor" açıklaması

---

## Demo Senaryoları (Hackathon)

### Demo 1 — İlaç Etkileşimi (Canlı, jüri kendi ilacını yazar)
- Input: "I take Metformin and Lisinopril. I have trouble sleeping."
- Beklenen: ❌ St. John's Wort (CYP3A4) → ✅ Valerian Root 300-600mg, 4 hafta max

### Demo 2 — Serbest Soru
- Input: "Does berberine work for blood sugar control?"
- Beklenen: Grade A evidence + dozaj + collapsible PubMed linkleri

### Demo 3 — Kan Tahlili
- Input: Cholesterol 240, Vitamin D 14, Ferritin 8, HbA1c 6.8
- Beklenen: Detaylı analiz + yaşam koçluğu + PDF indir

---

## Geliştirme Kuralları

1. Güvenlik katmanları her özellikten önce kontrol edilir
2. Tıbbi öneri kaynaksız gösterilmez
3. Mobile-first tasarım
4. API anahtarları sadece .env.local + server-side
5. TypeScript strict — `any` yasak
6. Her API endpoint'te error handling
7. Git commit mesajları İngilizce
8. Her sprint sonunda PROGRESS.md güncelle
9. Dark mode için her renk CSS variable ile tanımlanır — hardcode yasak
10. Kimseyi boş gönderme — her zaman genel bilgi + yönlendirme
11. Onboarding atlanamaz — login sonrası otomatik
12. İlaç profili olmadan doz tavsiyesi yok
13. EN ve TR sorularına otomatik yanıt
14. Sağlık dışı mesaj → nazik sohbet, yönlendirme değil
15. Konuşma geçmişi yan panelde gösterilir
16. Reçete OCR yapılmaz — güvenlik riski
17. DeepSeek hasta verisi için asla kullanılmaz

---

## Environment Variables (.env.local)

```env
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://huiiqbslahqkadchzyig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PUBMED_API_KEY=...
NEXT_PUBLIC_APP_URL=https://phytotherapy.ai
```

---

*Son güncelleme: 26 Mart 2026 v12.1*
*Sprint 1-20 tamamlandı. Hackathon polish Phase 1 bitti, Phase 2-6 devam edecek.*
*Hackathon: 11-12 Nisan 2026 — 16 gün kaldı*
*Premium gate'ler kaldırıldı — hackathon modunda tüm özellikler açık.*
*Dashboard tools grid, leaderboard, çeviri fixleri, wrapped share, doktor davet düzeltildi.*
