# CLAUDE.md — Phytotherapy.ai Proje Anayasası v5.0

## ⚡ Hızlı Bağlam (Her Oturum Başında Oku)

**Phytotherapy.ai** — kanıta dayalı fitoterapi + modern tıp köprüsü kuran AI sağlık asistanı.
- **Ekip:** 3 tıp öğrencisi, teknik bilgi yok — Claude tüm kodu yazıyor
- **Hackathon:** Harvard "Building High-Value Health Systems" — 11-12 Nisan 2026
- **Domain:** phytotherapy.ai ✅ (Vercel'e bağlı, canlı)
- **Sunum dili:** İngilizce | **Arayüz dili:** İngilizce (TR/EN toggle Sprint 10'da)
- **Deploy:** Vercel ✅ (canlı) + Supabase ✅ (tablolar kurulu, email auth çalışıyor)
- **AI Motor:** Google Gemini API (gemini-2.5-flash)
- **İşletim Sistemi:** Windows
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
5. **Kimseyi boş gönderme** — Her zaman genel bilgi + doktora yönlendirme kombinasyonu.
6. **İlaç profili olmadan doz tavsiyesi verilmez** — Profil eksikse: "Bu madde birçok ilaçla etkileşebilir, lütfen ilaçlarınızı ekleyin."

---

## Teknik Stack

```
Frontend:     Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
Backend:      Next.js API Routes (serverless — Vercel)
Database:     Supabase (PostgreSQL) ✅ — tüm tablolar kurulu
AI Engine:    Google Gemini API (gemini-2.5-flash)
Tıbbi Veri:   PubMed E-utilities API
İlaç Veri:    OpenFDA API
PDF:          @react-pdf/renderer
Deploy:       Vercel ✅ — phytotherapy.ai
Auth:         Supabase Auth ✅ (email çalışıyor, Google OAuth Sprint 10'da)
OS:           Windows
```

---

## Mimari — Tek AI Asistan + Özel Modlar

### Ana Felsefe
Tek akıllı chat arayüzü tüm özellikleri karşılar. Alt menüde özel modlara hızlı erişim var ama hepsi aynı altyapıyı kullanır.

### Intent Detection (Gemini Router)
Kullanıcı mesajı → Gemini intent belirler:
- **İlaç etkileşimi** → OpenFDA + PubMed motoru
- **Kan tahlili değerleri** → blood-reference.ts + analiz
- **Genel sağlık sorusu** → PubMed RAG
- **Dosya/görsel yüklendi** → OCR + ilgili analiz
- **Acil semptom** → Kırmızı kod (AI'dan ÖNCE çalışır)

### Dosya ve Görsel Yükleme
Chat kutusuna entegre:
- 📎 PDF yükleme (kan tahlili, reçete)
- 📷 Fotoğraf çekme / galeri seçimi (ilaç kutusu, tahlil kağıdı)
- OCR ile metin çıkarma → Gemini analizi
- Desteklenen: PDF, JPG, PNG, HEIC

---

## Tasarım Sistemi (Kesinleşmiş — v2)

### Renkler
```
Açık mod arka plan:    #faf9f6
Koyu mod arka plan:    #141a16  ("karanlık orman" — boğucu değil)
Ana yeşil (light):     #3c7a52
Ana yeşil (dark):      #5aac74
Açık yeşil metin:      #8aab8e  (dark mod açıklamalar)
Tag/link (dark):       #7aab82
Altın vurgu (light):   #b8965a
Altın vurgu (dark):    #c9a86c
Koyu metin (light):    #141a15
Açık metin (dark):     #e8f0e9
İkincil (light):       #5a6b5c
İkincil (dark):        #8aab8e
```

### Fontlar
```
Başlıklar:  Cormorant Garamond (serif, italic kullanımı önemli)
Metin:      DM Sans
Mono:       DM Mono (kbd kısayolları için)
```

### Tasarım Prensipleri
- Premium + sakin + yatıştırıcı his
- **Projeye özgü motifler:** Botanik illüstrasyon + EKG çizgisi + molekül bağ noktaları
- Hero bölümünde: Sol taraf canlı arama kutusu, sağ taraf botanik SVG illüstrasyon
- EKG çizgisi botanik bitkinin üzerinden geçer — "doğa + tıp" mesajı
- Light/Dark mode toggle navbar'da — her renk CSS variable ile tanımlanır
- Mobile-first
- Referans: phytotherapy_v2.png (proje klasöründe)

---

## Kullanıcı Akışı (Kesinleşmiş)

### Misafir Modu (Kayıtsız)
- **5 sorgu hakkı** (test için 5 olarak güncellendi)
- Sadece genel bilgi soruları yanıtlanır
- Kişisel öneri → "Güvenli öneri için ilaç profilin gerekiyor. Kayıt ol."
- Doz tavsiyesi verilmez → "Bu madde birçok ilaçla etkileşebilir, ilaçlarınızı ekleyin"
- 6. sorguda kayıt duvarı

### Kayıt Sonrası — Onboarding Wizard
**Login sonrası otomatik tetiklenir — atlanamaz.**

#### KATMAN 1 — Zorunlu (7 Adım)
| Adım | İçerik |
|------|--------|
| 1 | Ad, yaş, cinsiyet + **18 yaş kontrolü** (altındaysa farklı akış) |
| 2 | Aktif ilaçlar ("kullanmıyorum" da zorunlu beyan) |
| 3 | Alerjiler ("alerjim yok" da zorunlu beyan) |
| 4 | Gebelik/emzirme durumu (zorunlu) |
| 5 | Alkol/sigara kullanımı (zorunlu) |
| 6 | Böbrek/karaciğer hastalığı + son 3 ayda ameliyat + kronik hastalıklar |
| 7 | Sorumluluk reddi metni + dijital imza (checkbox + timestamp → Supabase) |

#### KATMAN 2 — İsteğe Bağlı ("Önerilerini kişiselleştir")
- Takviye/vitamin kullanımı
- Beslenme şekli (vegan, glutensiz vs.)
- Egzersiz sıklığı
- Uyku düzeni
- Boy, kilo, kan grubu

### İlaç Profili Güncelleme Sistemi
- **Her girişte:** "İlaç listeniz hâlâ aynı mı?" — tek tıkla "Evet" veya "Güncelle"
- **30 günde bir:** Zorunlu güncelleme onayı — atlanamaz
- **Otomatik tespit:** Sorguda profilde olmayan ilaç → "Bu ilacı profilinize ekleyelim mi?"

### Tam Erişim Sonrası
- Her sorguda profil otomatik çekilir, çapraz kontrol yapılır
- Konuşma geçmişi Supabase'e kaydedilir (query_history)
- Favorilere ekleme
- Doktora gönder (PDF + email)
- İlaç hatırlatıcısı

---

## Güvenlik Mimarisi — 3 Katman

### Katman 1: Kırmızı Kod Filtresi (AI'dan ÖNCE)

**Her sayfada sabit banner:**
> "If you are experiencing a life-threatening emergency, call 112 / 911 immediately."

**Acil kelime tespit edilince:**
- Tam ekran kırmızı emergency modal açılır
- "I understand this is an emergency" butonuna basılana kadar sistem kilitlenir
- Check Interactions butonu disable edilir
- İlaç yazılmış olsa bile override eder — analiz yapılmaz

```typescript
const RED_FLAGS_EN = [
  'chest pain', 'heart attack', 'shortness of breath', "can't breathe",
  'loss of consciousness', 'unconscious', 'seizure', 'stroke',
  'heavy bleeding', 'suicidal', 'suicide', 'poisoning', 'overdose',
  'sudden vision loss', 'paralysis', 'anaphylaxis'
];
const RED_FLAGS_TR = [
  'göğüs ağrısı', 'kalp krizi', 'nefes darlığı', 'nefes alamıyorum',
  'bilinç kaybı', 'bayıldı', 'nöbet', 'felç', 'inme',
  'kanama', 'intihar', 'zehirlenme', 'doz aşımı',
  'ani görme kaybı', 'anafilaksi'
];
```

### Katman 2: İlaç Etkileşim Motoru ✅
- OpenFDA: marka adı → etken madde (Glifor → Metformin) — Türkçe çalışıyor
- Hybrid: OpenFDA + Gemini bilgi boşluklarını doldurur
- Profildeki TÜM ilaçlarla çapraz kontrol
- SafetyBadge: ✅ Safe / ⚠️ Caution / ❌ Dangerous

### Katman 3: RAG Motoru ✅
- PubMed API → makaleler → Gemini (temperature: 0)
- Kaynaksız = "Insufficient scientific evidence"
- Tıklanabilir PubMed referans kartları

---

## KVKK / Güvenlik

### Veri
- Minimum veri + şifreli saklama (Supabase encrypted)
- Her veri için "neden topluyoruz?" prensibi
- Max 2 yıl saklama, otomatik silme

### Teknik
- API anahtarları sadece server-side (.env.local)
- HTTPS zorunlu (Vercel)
- Rate limiting: dakikada max 10 sorgu
- Input sanitization: SQL injection koruması
- Vercel DDoS koruması

### Kullanıcı Hakları
- "Verilerimi sil" butonu — tek tıkla tam silme
- "Verilerimi indir" butonu
- Dijital onay timestamp Supabase'de

### Yasal Belgeler (Sprint 8)
- Gizlilik Politikası (TR + EN)
- Kullanım Koşulları
- Çerez Politikası
- Tıbbi Sorumluluk Reddi

### Disclaimer
- **Her öneri sonunda:** "⚠️ This information is not medical advice. Consult your healthcare provider."
- **Onboarding'de:** Uzun sorumluluk reddi + dijital imza
- **Eksik profil:** "Recommendation limited — complete your profile."

---

## Sistem Promptu (Gemini)

```
You are Phytotherapy.ai — an evidence-based health assistant bridging modern medicine and phytotherapy.

CORE RULES:
1. ONLY PubMed, NIH, WHO sources. No others.
2. Every recommendation: Dosage + Frequency + Max Duration + PubMed link.
3. No evidence = "Insufficient scientific evidence." NEVER fabricate.
4. NOT a doctor. Cannot diagnose. Always: "Consult your healthcare provider."
5. NO DOSAGE without medication profile → say: "This herb can interact with many medications. Please add your medications to your profile first."
6. Drug-herb: Safe ✅ reason | Risky ❌ reason + alternative.
7. Symptom = drug side effect → "Consult doctor for dose adjustment." No herbs.
8. NEVER send empty — always general info + referral.

INTENT DETECTION:
- Drug interaction query → OpenFDA + PubMed interaction data
- Blood test values present → reference ranges + lifestyle advice + PDF offer
- General health question → PubMed RAG
- File/image uploaded → OCR extract → analyze accordingly

PROFILE AWARENESS:
- Cross-check: medications, allergies, kidney/liver, pregnancy, alcohol/smoking.
- Incomplete → "Recommendation limited due to incomplete profile."

EMERGENCY: chest pain, breathing difficulty, consciousness loss, bleeding, suicidal → 112/911. No herbs. No analysis.

EVIDENCE GRADING: A (strong RCTs) | B (limited RCTs) | C (case reports/traditional)

RESPONSE FORMAT:
- Match user language (EN/TR)
- Empathetic, clear, never cold
- End: "⚠️ Do not apply without consulting your healthcare provider"
- Cite PubMed with clickable links
- Structure: Assessment → Recommendations → Safety Notes → Sources
```

---

## Supabase Tablo Yapısı ✅ (Kurulu)

```sql
user_profiles      -- profil, onboarding, consent
user_medications   -- aktif ilaçlar
user_allergies     -- alerjiler
query_history      -- konuşma geçmişi + favoriler
blood_tests        -- kan tahlili geçmişi + PDF URL
consent_records    -- dijital imza kayıtları
guest_queries      -- misafir sorgu takibi
```

---

## Sprint Planı

### ✅ Sprint 1 — Altyapı (TAMAMLANDI)
- [x] Next.js 14 + Tailwind + shadcn/ui
- [x] GitHub + Vercel deploy + phytotherapy.ai domain
- [x] lib/gemini.ts, safety-filter.ts, pubmed.ts, openfda.ts
- [x] Landing page iskeleti + header + footer + disclaimer

### ✅ Sprint 2 — Auth + Onboarding (TAMAMLANDI)
- [x] Supabase tabloları kuruldu
- [x] Email auth çalışıyor (Supabase redirect URL düzeltildi)
- [x] Onboarding wizard (7 adım) yazıldı
- [x] Misafir modu (5 sorgu limiti)
- [x] Dijital imza + consent kaydı

### ✅ Sprint 3 — İlaç Etkileşim Motoru (TAMAMLANDI)
- [x] OpenFDA entegrasyonu — Türkçe marka adı çevirisi çalışıyor
- [x] Gemini hybrid analiz
- [x] SafetyBadge: Safe / Caution / Dangerous
- [x] Acil banner eklendi
- [x] Emergency modal (tam ekran, kırmızı)

### ✅ Sprint 4 — Sağlık Asistanı RAG (TAMAMLANDI)
- [x] Gemini streaming chat
- [x] PubMed canlı sorgu
- [x] Kaynak kartları (SourceCard)
- [x] Kırmızı kod filtresi chat'te çalışıyor
- [x] İlaç profili olmadan doz tavsiyesi verilmiyor

### ✅ Sprint 5 — Kan Tahlili + Dosya Yükleme (TAMAMLANDI)
- [x] blood-reference.ts (referans aralıkları)
- [x] /api/blood-analysis
- [x] /api/generate-pdf
- [x] BloodTestForm + ResultDashboard + LifestyleAdvice
- [x] DoctorReport PDF (@react-pdf/renderer)
- [x] Chat kutusuna dosya/fotoğraf yükleme (PDF, JPG, PNG)
- [x] OCR entegrasyonu

### 🔄 Sprint 6 — Mimari Birleştirme + Auth Fix
- [ ] Onboarding wizard → login sonrası otomatik tetikleme (şu an bağlı değil)
- [ ] Tek chat router — intent detection tüm modları kapsar
- [ ] Konuşma geçmişi Supabase'e kayıt + yükleme
- [ ] İlaç profili → chat context'ine otomatik ekleme
- [ ] Profil sayfası tam çalışır hale getir
- [ ] Her girişte "İlaç listeniz aynı mı?" dialog'u

### 🔄 Sprint 7 — Tasarım v2 Implementasyonu
- [ ] phytotherapy_v2.png referans alınarak tüm sayfalara uygula
- [ ] Cormorant Garamond + DM Sans + DM Mono font sistemi
- [ ] Dark/Light mode toggle (localStorage) — CSS variables
- [ ] Hero: Sol canlı arama kutusu + sağ botanik SVG illüstrasyon
- [ ] EKG çizgisi botanik üzerinden geçer
- [ ] Trust strip, feature kartları v2 tasarım
- [ ] Responsive (mobile-first)
- [ ] Loading states + skeleton + error handling
- [ ] Animasyonlar (subtle, premium)

### 🔄 Sprint 8 — Güvenlik + Yasal
- [ ] Rate limiting (dakikada 10 sorgu)
- [ ] Input sanitization
- [ ] Gizlilik Politikası sayfası (TR + EN)
- [ ] Kullanım Koşulları sayfası
- [ ] Tıbbi Sorumluluk Reddi sayfası
- [ ] "Verilerimi sil" + "Verilerimi indir" butonları
- [ ] İlaç hatırlatıcısı (notification)
- [ ] 30 günlük zorunlu ilaç güncelleme sistemi

### 🔄 Sprint 9 — Hackathon Hazırlık
- [ ] 3 demo senaryosu provası
- [ ] Pitch deck (10 slayt)
- [ ] Yedek planlar (API çökerse ne olur?)
- [ ] Final performans testi
- [ ] SEO meta tags

---

### 🚀 SONRASI BLOĞU

#### Sprint 10 — Çok Dil + Google Auth
- [ ] TR/EN dil toggle navbar'da
- [ ] Google OAuth entegrasyonu
- [ ] AR dil desteği (ileride)

#### Sprint 11 — Gebelik + Özel Modlar
- [ ] Gebelik modu: özel güvenlik filtresi
- [ ] Emzirme modu: özel güvenlik filtresi
- [ ] 18 yaş altı farklı akış

#### Sprint 12 — Kullanıcı Paneli
- [ ] Profil dashboard
- [ ] Sorgu geçmişi görünümü
- [ ] Favoriler
- [ ] Doktora gönder (PDF + email)

#### Sprint 13 — Takip Sistemi
- [ ] Semptom günlüğü
- [ ] Periyodik kan tahlili takibi
- [ ] Trend grafikleri (recharts)
- [ ] OCR reçete okuma (gelişmiş)

#### Sprint 14 — Büyüme
- [ ] PWA / mobil hazırlık
- [ ] Analytics dashboard
- [ ] Abonelik modeli altyapısı

---

## Demo Senaryoları (Hackathon)

### Demo 1 — İlaç Etkileşimi (Canlı — Jüri kendi ilacını yazar)
- Input: "I take Metformin and Lisinopril. I have trouble sleeping."
- Beklenen: ❌ St. John's Wort (CYP3A4) → ✅ Valerian Root (300-600mg, 4 hafta max)

### Demo 2 — Serbest Soru
- Input: "Does berberine work for blood sugar control?"
- Beklenen: Grade A evidence + dozaj + PubMed linkleri

### Demo 3 — Kan Tahlili
- Input: Cholesterol 240, Vitamin D 14, Ferritin 8, HbA1c 6.8
- Beklenen: Detaylı analiz + yaşam koçluğu + PDF indir

---

## Pitch Deck (Sprint 9)

1. **Problem** — Yıllık X kişi herb-drug etkileşiminden acile gidiyor
2. **Solution** — Phytotherapy.ai: 3 katmanlı güvenlik + kanıta dayalı öneri
3. **Demo** — Canlı (jüri kendi ilacını yazar)
4. **Technology** — Gemini + PubMed RAG + OpenFDA
5. **Safety** — 3 katman güvenlik mimarisi
6. **Market** — Global bitkisel tıp pazarı büyüklüğü
7. **Traction** — phytotherapy.ai canlı, X kullanıcı
8. **Team** — 3 tıp öğrencisi + AI
9. **Roadmap** — 14 sprint planı
10. **Ask** — Ne istiyoruz?

---

## Geliştirme Kuralları

1. Güvenlik katmanları her özellikten önce kontrol edilir
2. Tıbbi öneri kaynaksız gösterilmez
3. Mobile-first — v2 PNG referans alınır
4. API anahtarları sadece server-side (.env.local)
5. TypeScript strict — `any` yasak
6. Her API endpoint'te error handling
7. Windows path separator dikkat
8. Git commit mesajları İngilizce
9. Her sprint sonunda PROGRESS.md güncelle
10. Dark mode için her renk CSS variable ile tanımlanır
11. Kimseyi boş gönderme — her zaman genel bilgi + yönlendirme
12. Onboarding atlanamaz — login sonrası otomatik tetiklenir
13. **İlaç profili olmadan doz tavsiyesi verilmez**
14. **Chat'e dosya/fotoğraf yükleme mevcut**
15. **Tek chat router — intent detection tüm modları kapsar**
16. **Misafir modunda 5 sorgu hakkı**

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

*Son güncelleme: Mart 2026 v5.0 — Tüm konuşma kararları dahil.*
*Sprint 1-5 tamamlandı. Sıradaki: Sprint 6 — Mimari Birleştirme + Auth Fix*
