# CLAUDE.md — Phytotherapy.ai Proje Anayasası v7.0

## ⚡ Hızlı Bağlam (Her Oturum Başında Oku)

**Phytotherapy.ai** — kanıta dayalı fitoterapi + modern tıp köprüsü kuran AI sağlık asistanı.
- **Ekip:** 3 tıp öğrencisi, teknik bilgi yok — Claude tüm kodu yazıyor
- **Hackathon:** Harvard "Building High-Value Health Systems" — 11-12 Nisan 2026
- **Domain:** phytotherapy.ai ✅ (Vercel'e bağlı, canlı)
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
6. **İlaç profili olmadan doz tavsiyesi verilmez** — "Bu madde birçok ilaçla etkileşebilir, ilaçlarınızı ekleyin."

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
Auth:         Supabase Auth ✅ (email çalışıyor, Google OAuth Sprint 10'da)
OS:           Windows
```

---

## Mimari — Tek AI Asistan + Özel Modlar

### Intent Detection (Gemini Router)
Kullanıcı mesajı → Gemini intent belirler:
- **İlaç etkileşimi** → OpenFDA + PubMed motoru
- **Kan tahlili değerleri** → blood-reference.ts + analiz
- **Genel sağlık sorusu** → PubMed RAG
- **Dosya/görsel yüklendi** → OCR + ilgili analiz
- **Acil semptom** → Kırmızı kod (AI'dan ÖNCE çalışır)
- **Sağlık dışı mesaj** → "I'm specialized in health topics. Feel free to ask anything health-related!"

### Dil Desteği
- Sistem EN ve TR sorularına otomatik yanıt verir
- Kullanıcı Türkçe yazarsa Türkçe, İngilizce yazarsa İngilizce cevap
- TR/EN dil toggle navbar'da ✅ (🇺🇸 EN / 🇹🇷 TR, localStorage persist, mounted guard ile hydration-safe)

### Dosya ve Görsel Yükleme
Chat kutusuna entegre (sol alt köşe):
- 📎 PDF yükleme (kan tahlili, reçete)
- 📷 Fotoğraf çekme / galeri seçimi (ilaç kutusu, tahlil kağıdı)
- OCR ile metin çıkarma → Gemini analizi
- Desteklenen: PDF, JPG, PNG, HEIC

### Konuşma Geçmişi (Yan Panel)
- Health assistant'da sol/sağ kenar paneli
- Son 10 konuşma Supabase query_history'den yüklenir
- Konuşmaya tıklayınca yüklenir
- Misafir modunda gösterilmez

---

## Tasarım Sistemi (Kesinleşmiş — v2)

### Renkler (Kesinleşmiş — Sprint 7 sonrası)
```
Açık mod arka plan:    #faf9f6  (warm cream)
Koyu mod arka plan:    #141a16  ("karanlık orman" — boğucu değil)
Koyu mod kartlar:      #1c2420  (forest card)
Ana yeşil (light):     #3c7a52
Ana yeşil (dark):      #5aac74  (parlak yeşil — botanik SVG dahil)
Açık yeşil metin:      #8aab8e  (dark mod açıklamalar / muted-foreground)
Altın vurgu (light):   #b8965a  (logo "therapy" + hero "nature's")
Altın vurgu (dark):    #c9a86c
Koyu metin (light):    #141a15
Açık metin (dark):     #dde8de  (foreground)
İkincil (light):       #5a6b5c
İkincil (dark):        #8aab8e
Kenar çizgileri (dark): rgba(90,172,116,0.15)
```

### Fontlar
```
Başlıklar:  Cormorant Garamond (serif, italic kullanımı önemli)
Metin:      DM Sans
Mono:       DM Mono (kbd kısayolları için)
```

### Dark/Light Mode
- Navbar sağında toggle butonu — ay ☽ / güneş ○ ikonu
- localStorage'da hatırlanır
- Her renk CSS variable ile tanımlanır — hardcode yasak
- Koyu mod: #141a16 arka plan, yeşil tonları daha parlak (#5aac74)
- Açık mod: #faf9f6 arka plan, derin yeşil (#3c7a52)

### Tasarım Prensipleri
- Premium + sakin + yatıştırıcı his
- **Projeye özgü motifler:**
  - Botanik illüstrasyon (zarif tek bitki, altın çiçek)
  - EKG çizgisi botanik bitkinin üzerinden geçer
  - Molekül bağ noktaları köşelerde dekoratif
  - Tıbbi artı (+) işareti ince vurgu olarak
- **Hero bölümü:**
  - Sol: H1 başlık + açıklama + arama kutusu (⌘K) + quick tags
  - Sağ: Botanik SVG illüstrasyon (EKG + molekül + botanik birleşimi)
  - Eyebrow badges kaldırıldı (Science/Species/Wiki)
- **Trust strip:** 5 madde, her biri yeşil checkmark ile
- **Feature kartları:** 01/02/03/04 numaralı, Cormorant başlık
- Light/Dark mode toggle navbar sağında
- Mobile-first responsive
- Referans: public/phytotherapy_v2.png

### Navigasyon
```
Logo (sol) | Interaction Checker | Health Assistant | Blood Test Analysis | [Auth] | [Lang Toggle] | [Theme Toggle]
```
- Giriş yapılmamışsa: Sign In + Sign Up butonları
- Giriş yapılmışsa: Avatar dropdown (isim, email, Profile Settings, Sign Out)
- Sign out sonrası landing page'e yönlendir, session temizle

---

## Kullanıcı Akışı

### Misafir Modu (5 sorgu hakkı)
- Genel bilgi soruları → yanıtla (EN ve TR)
- Kişisel öneri → "Güvenli öneri için ilaç profilin gerekiyor. Kayıt ol."
- Doz tavsiyesi → "Bu madde birçok ilaçla etkileşebilir, ilaçlarınızı ekleyin"
- Konuşma geçmişi gösterilmez
- 6. sorguda kayıt duvarı

### Login Sonrası Akış
1. Login → onboarding_complete kontrolü
2. False ise → /onboarding sayfasına otomatik yönlendir
3. Onboarding tamamlanınca → ana sayfaya dön

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
Takviye, beslenme, egzersiz, uyku, boy/kilo/kan grubu

### İlaç Güncelleme
- Her girişte: "Hâlâ aynı mı?" tek tıkla
- 30 günde bir: Zorunlu güncelleme
- Sorguda yeni ilaç: "Ekleyelim mi?"

---

## Güvenlik Mimarisi — 3 Katman

### Katman 1: Kırmızı Kod (AI'dan ÖNCE)
- Her sayfada sabit kırmızı banner
- Acil kelime → tam ekran emergency modal
- "I understand this is an emergency" butonuna kadar sistem kilitli
- İlaç yazılmış olsa bile override — analiz yapılmaz

```typescript
const RED_FLAGS_EN = ['chest pain','heart attack','shortness of breath',
  "can't breathe",'loss of consciousness','unconscious','seizure','stroke',
  'heavy bleeding','suicidal','suicide','poisoning','overdose',
  'sudden vision loss','paralysis','anaphylaxis'];
const RED_FLAGS_TR = ['göğüs ağrısı','kalp krizi','nefes darlığı',
  'nefes alamıyorum','bilinç kaybı','bayıldı','nöbet','felç','inme',
  'kanama','intihar','zehirlenme','doz aşımı','ani görme kaybı','anafilaksi'];
```

### Katman 2: İlaç Etkileşim Motoru ✅
- OpenFDA: marka adı → etken madde (Türkçe çalışıyor)
- Hybrid: OpenFDA + Gemini
- SafetyBadge: ✅ Safe / ⚠️ Caution / ❌ Dangerous

### Katman 3: RAG ✅
- PubMed → Gemini (temperature:0) → kaynak kartları

---

## Sistem Promptu (Gemini)

```
You are Phytotherapy.ai — evidence-based integrative health assistant.

RULES:
1. Only PubMed/NIH/WHO. Never fabricate.
2. Every recommendation: Dosage + Frequency + Max Duration + PubMed link.
3. NO DOSAGE without medication profile → "This herb interacts with many drugs. Add medications first."
4. Not a doctor. Always: "Consult your healthcare provider."
5. Drug-herb: Safe ✅ / Risky ❌ + alternative.
6. Never send empty — general info + referral always.
7. Non-health message → "I'm specialized in health and phytotherapy. Feel free to ask anything health-related!"
8. Always respond in user's language (EN or TR automatically).

INTENT DETECTION:
- Drug interaction → OpenFDA + PubMed
- Blood test values → reference ranges + lifestyle + PDF offer
- General health → PubMed RAG
- File uploaded → OCR + analyze
- Non-health → friendly redirect

PROFILE: Cross-check medications, allergies, kidney/liver, pregnancy, alcohol/smoking.
EMERGENCY: → 112/911. No herbs. No analysis.
EVIDENCE: A (RCTs) | B (limited) | C (traditional)
FORMAT: Match EN/TR | empathetic | ⚠️ disclaimer | PubMed links
```

---

## KVKK / Güvenlik
- Minimum veri + şifreli saklama
- Rate limiting: 10/dakika
- Input sanitization
- "Verilerimi sil" + "Verilerimi indir" (Sprint 8)
- Max 2 yıl saklama
- Dijital onay timestamp Supabase'de

---

## Supabase Tabloları ✅
```
user_profiles, user_medications, user_allergies,
query_history, blood_tests, consent_records, guest_queries
```

---

## Sprint Planı

### ✅ Sprint 1 — Altyapı (TAMAMLANDI)
- [x] Next.js 14 + Vercel + domain + tüm lib/ dosyaları

### ✅ Sprint 2 — Auth + Onboarding (TAMAMLANDI)
- [x] Supabase tablolar + email auth + onboarding wizard (7 adım)
- [x] Misafir modu (5 sorgu) + dijital imza

### ✅ Sprint 3 — İlaç Etkileşim Motoru (TAMAMLANDI)
- [x] OpenFDA + Gemini hybrid + SafetyBadge
- [x] Acil banner + emergency modal

### ✅ Sprint 4 — Sağlık Asistanı RAG (TAMAMLANDI)
- [x] Gemini streaming + PubMed + kaynak kartları
- [x] Kırmızı kod filtresi + doz tavsiyesi kısıtı

### ✅ Sprint 5 — Kan Tahlili + Dosya Yükleme (TAMAMLANDI)
- [x] blood-reference.ts + /api/blood-analysis + PDF
- [x] Chat kutusuna 📎 dosya + 📷 fotoğraf yükleme + OCR

### ✅ Sprint 6 — Mimari Birleştirme + Auth Fix (TAMAMLANDI)
- [x] Login → onboarding_complete false ise /onboarding'e yönlendir ✅
- [x] Sign in / Sign out düzeltildi ✅
- [x] Sağlık dışı mesajlara nazik yönlendirme ✅
- [x] Konuşma geçmişi yan panel (son 20 konuşma, Supabase'den) ✅
- [x] Gemini retry + model fallback (2.0-flash → 2.5-flash) ✅
- [x] TR→EN PubMed sözlük (70+ terim) ✅
- [x] PubMed timeout + error handling ✅
- [x] Onboarding medication/allergy kayıt hatası düzeltildi ✅
- [x] fetchProfile RLS fix — getUser() ile token doğrulama ✅
- [ ] API quota test (Gemini billing aktif mi?)
- [ ] Tek chat router — intent detection
- [ ] İlaç profili → chat context otomatik
- [ ] Her girişte "İlaç listeniz hâlâ aynı mı?" dialog
- [ ] Profil sayfası tam çalışır

### ✅ Sprint 7 — Tasarım v2 Implementasyonu (TAMAMLANDI)
- [x] public/phytotherapy_v2.png referans alınarak tüm sayfalara uygulandı ✅
- [x] Cormorant Garamond + DM Sans + DM Mono font sistemi ✅
- [x] Dark/Light mode toggle navbar sağında (Moon/Sun ikonu, localStorage) ✅
- [x] ThemeProvider bileşeni (prefers-color-scheme fallback, smooth transition) ✅
- [x] Hero: Sol metin + arama kutusu (⌘K) + quick tags / Sağ botanik SVG ✅
- [x] BotanicalHero SVG: bitki + EKG çizgisi + molekül noktaları + tıbbi artı ✅
- [x] Trust strip + feature kartları (01/02/03/04) ✅
- [x] Navbar: logo sol, linkler orta, auth + lang toggle + theme toggle sağ ✅
- [x] Dil toggle (🇺🇸 EN / 🇹🇷 TR, localStorage persist, mounted guard) ✅
- [x] Dark mode: #141a16 background, #1c2420 cards, #dde8de text, rgba(90,172,116,0.15) borders ✅
- [x] Logo renkleri: Phyto=foreground, therapy=#b8965a gold, .ai=#3c7a52/#5aac74 ✅
- [x] Botanik SVG rengi #5aac74 parlak yeşile güncellendi ✅
- [x] Eyebrow badges (Science/Species/Wiki) kaldırıldı ✅
- [x] Emerald→Primary renk göçü (25+ dosya) ✅
- [x] Responsive mobile-first ✅
- [x] Loading skeleton + error states ✅
- [x] Animasyonlar (subtle hover, fade-in) ✅

### 🔄 Sprint 8 — Güvenlik + Yasal
- [ ] Rate limiting + input sanitization
- [ ] Privacy Policy + Terms (TR+EN)
- [ ] "Verilerimi sil/indir"
- [ ] İlaç hatırlatıcısı + 30 günlük zorunlu güncelleme

### 🔄 Sprint 9 — Hackathon Hazırlık
- [ ] 3 demo prova (Metformin+uyku / Berberine / Kan tahlili)
- [ ] Pitch deck (10 slayt)
- [ ] Yedek planlar + performans testi + SEO

---

### 🚀 SONRASI BLOĞU

#### Sprint 10 — Çok Dil + Google Auth
- [x] TR/EN dil toggle navbar'da (bayrak ikonu) ✅ — Sprint 7'de tamamlandı
- [ ] UI çeviri sistemi (lang context → tüm sayfalar)
- [ ] Google OAuth
- [ ] AR desteği (ileride)

#### Sprint 11 — Gebelik + Özel Modlar
- [ ] Gebelik + emzirme modu
- [ ] 18 yaş altı farklı akış

#### Sprint 12 — Kullanıcı Paneli
- [ ] Profil dashboard + sorgu geçmişi + favoriler
- [ ] Doktora gönder (PDF + email)

#### Sprint 13 — Takip Sistemi
- [ ] Semptom günlüğü + kan tahlili takibi
- [ ] Trend grafikleri (recharts)
- [ ] OCR reçete okuma (gelişmiş)

#### Sprint 14 — Büyüme
- [ ] PWA + analytics + abonelik altyapısı

---

## Demo Senaryoları (Hackathon)

### Demo 1 — İlaç Etkileşimi (Canlı)
- "I take Metformin and Lisinopril. I have trouble sleeping."
- Beklenen: ❌ St. John's Wort → ✅ Valerian Root 300-600mg

### Demo 2 — Serbest Soru
- "Does berberine work for blood sugar control?"
- Beklenen: Grade A + PubMed linkleri

### Demo 3 — Kan Tahlili
- Cholesterol 240, Vitamin D 14, Ferritin 8, HbA1c 6.8
- Beklenen: Analiz + koçluk + PDF

---

## Geliştirme Kuralları

1. Güvenlik katmanları her özellikten önce
2. Tıbbi öneri kaynaksız yok
3. Mobile-first — v2 PNG referans
4. API anahtarları sadece server-side
5. TypeScript strict — `any` yasak
6. Her endpoint'te error handling
7. Git commit İngilizce
8. Her sprint sonunda PROGRESS.md güncelle
9. Dark mode CSS variable zorunlu — hardcode yasak
10. Kimseyi boş gönderme
11. Onboarding atlanamaz — login sonrası otomatik
12. İlaç profili olmadan doz tavsiyesi yok
13. EN ve TR sorularına otomatik yanıt (dil algılama)
14. Sağlık dışı mesaj → nazik yönlendirme, hata değil
15. Konuşma geçmişi yan panelde gösterilir

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

*Son güncelleme: 16 Mart 2026 v7.0*
*Sprint 1-7 tamamlandı. Sıradaki: Sprint 8 — Güvenlik + Yasal*
