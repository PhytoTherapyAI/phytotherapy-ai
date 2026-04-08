# CLAUDE.md — DoctoPal Proje Anayasası v42.0

## ⚡ Hızlı Bağlam (Her Oturum Başında Oku)

**DoctoPal** (eski adı: Phytotherapy.ai) — kanıta dayalı fitoterapi + modern tıp köprüsü kuran AI sağlık asistanı.
- **Ekip:** 3 tıp öğrencisi, teknik bilgi yok — Claude tüm kodu yazıyor
- **Hackathon:** Harvard "Building High-Value Health Systems" — 11-12 Nisan 2026 — **8 gün kaldı**
- **Domain:** doctopal.com ✅ (Vercel'e bağlı) — eski: phytotherapy.ai
- **Sunum dili:** İngilizce | **Arayüz dili:** İngilizce (TR/EN toggle navbar'da ✅)
- **Deploy:** Vercel ✅ + Supabase ✅ (tablolar kurulu, email auth çalışıyor)
- **AI Motor:** Anthropic Claude API (claude-haiku-4-5) + Embedding: Gemini text-embedding-004
- **OS:** Windows
- **GitHub:** github.com/PhytoTherapyAI/phytotherapy-ai
- **Hackathon modu:** Premium gate'ler kaldırıldı, isPremium=true, pricing navbar'dan çıktı, tüm özellikler açık

### Routing Mimarisi (Güncel)
- `/` → Giriş yapan kullanıcıya TAM DASHBOARD gösterir (app/page.tsx)
- `/dashboard` → `/`'e redirect (app/dashboard/page.tsx — sadece router.replace("/"))
- Misafir → Landing page (aynı app/page.tsx, showDashboard=false ise)
- BottomNavbar Home butonu + Header dashboard linki → `/`

### Google OAuth Durumu
- Consent screen "DoctoPal" branding'i submit edildi (2 Nisan 2026) — incelemede
- Onay 4-6 hafta sürer, hackathon'a yetişmez → Demo için email/şifre veya Demo butonu kullan
- Google OAuth teknik olarak çalışıyor, sadece consent screen'de "Phytotherapy.ai" görünüyor

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
Frontend:     Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Recharts
Backend:      Next.js API Routes (serverless — Vercel)
Database:     Supabase (PostgreSQL) ✅ — tüm tablolar kurulu
AI Engine:    Anthropic Claude API (claude-sonnet-4-6) + Embedding: Gemini text-embedding-004
Tıbbi Veri:   PubMed E-utilities API + Europe PMC (çoklu akademik kaynak)
İlaç Veri:    OpenFDA API
PDF:          @react-pdf/renderer
Charts:       Recharts (AreaChart, BarChart, RadarChart, PieChart, ComposedChart)
Monitoring:   Sentry ✅ (error tracking + session replay + tracing)
E2E Testing:  Playwright ✅ (54 sayfa + 6 API testi)
Deploy:       Vercel ✅ — doctopal.com
Auth:         Supabase Auth ✅ (email + Google OAuth + Facebook OAuth)
Email:        Resend ✅ (verification approval/rejection emails)
Vector DB:    Supabase pgvector ✅ (semantic search embeddings)
FHIR:         HL7 FHIR R4 ✅ (hospital interoperability)
Bot:          Twilio WhatsApp + Telegram Bot API ✅
Cron:         Vercel Cron Jobs ✅ (daily health plan 09:00 TR)
OS:           Windows
```

### AI Motor Yol Haritası
- **Hackathon + Ana Motor:** Claude API (claude-sonnet-4-6) — tıbbi etik + güvenlik + kalite
- **Embedding:** Gemini text-embedding-004 (pgvector semantic search)
- **Para kazanmaya başlayınca:** Claude ana motor olarak devam, maliyet optimizasyonu değerlendirilecek
- **Multi-agent pipeline:** Claude üretir + denetler — ciddi gelir olunca çoklu model pipeline
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

### Kişiselleştirilmiş Günlük Sağlık Planı ✅ (v23.0)
- Dashboard'da en üstte — kullanıcının ilk gördüğü şey
- AI günlük 4 aksiyon kartı (beslenme, yaşam tarzı, takip, wellness)
- Profil+ilaç+vital+mood bazlı kişiselleştirme, her gün farklı
- Tıkla → tamamla ✅, ilerleme çubuğu, confetti 🎉, 30dk cache
- Yenile butonu, fallback plan (AI hata verirse)

### Proaktif SOS Uyarı Sistemi ✅ (v23.0)
- CriticalAlertModal: 10sn geri sayımlı tam ekran acil uyarı
- Wearable/platform anomali tespiti → modal tetiklenir
- "İyiyim İptal Et" veya geri sayım bitince → acil kişilere bildirim
- GPS konum, ilaç listesi, alerjiler, kan grubu otomatik mesajda
- 112 direkt arama butonu, titreşim, SVG animasyonlu countdown
- `/api/trigger-sos` — POST: bildirim gönder, PUT: wearable webhook
- Twilio SMS / Netgsm / WhatsApp Business API hazır (production'da aktif)

### Algoritmik Güvenlik Çerçevesi ✅ (v23.0)
- `lib/safety-guardrail.ts` — 5 katmanlı güvenlik korkuluğu
- Layer 1: Genişletilmiş Kırmızı Bayrak (70+ semptom EN+TR, immediate vs urgent)
- Layer 2: İlaç-Bitki Etkileşim (7 ilaç kategorisi, 40+ etkileşim, LETHAL/HIGH/MODERATE/LOW)
- Layer 3: Kontrendikasyon Taraması (gebelik, böbrek, karaciğer, yaş bazlı, 50+ bitki)
- Layer 4: Dozaj Limitleri (10 takviye max doz + süre)
- Layer 5: Şeffaflık (güven skoru 0-100, disclaimer, sınırlılıklar)
- `runSafetyGuardrail()` — tüm katmanları AI'dan ÖNCE çalıştırır
- Doktor geri bildirim sistemi (Human-in-the-Loop): `/api/doctor-feedback`

### PROMs/PREMs Sonuç Ölçüm Sistemi ✅ (v23.0 — Harvard HVHS C4)
- ICHOM standardı PROMs: Ağrı VAS, Enerji, Uyku, Mood, Aktivite, Genel Sağlık (0-100)
- Kanada modeli PREMs: Güven, Kolaylık, Bilgi Kalitesi, Tavsiye, Yan Etki
- Otomatik tetikleme: T0 Başlangıç → T1 1.Hafta → T2 4.Hafta → T3 Kür Sonu → T4 Takip
- Typeform tarzı tek soru anketi (slider + choice), PromsSurvey component
- İyileşme skoru algoritması (baseline vs current, domain bazlı)
- OutcomeComparisonCard: Önce vs Sonra karşılaştırma (bar chart + trend okları)

### Eğitimler & Kurslar ✅ (v23.0)
- `/courses` — 8 kurs kartı (fitoterapi, aromaterapi, akupunktur, bitkisel tıp, beslenme, bütünleştirici tıp, spor, fonksiyonel)
- Kategori filtresi, platform badge (Udemy/Sorbil), rating/öğrenci/süre/seviye
- Affiliate link altyapısı hazır (hackathon sonrası aktif)

### Kurumsal & Market Intelligence ✅ (v23.0)
- `/enterprise` — 3 tab: Kurumsal Planlar (Sigorta/İlaç/Klinik/Araştırma) + Pazar Trendleri (hammadde chart, AI insight) + Şirket Radarı (8 biyotek tablo)
- Bloomberg tarzı profesyonel dashboard, mock data ile

### Araştırma & İş Birliği Hub'ı ✅ (v23.0 — Harvard HVHS C10)
- `/research-hub` — 4 tab: Ortaklık Modeli (TÜSEB/TÜBİTAK/YÖK/TITCK/EMA/FDA/WHO/ACE) + Veri Ambarı (star schema, SQL örneği) + Validasyon Hattı (6 faz) + Ulusal Vizyon (NHTS uyumu)
- Açık İnovasyon API mimarisi, k-anonymity, KVKK/GDPR

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
- Google OAuth ✅ (Production, sınırsız)
- Facebook OAuth ✅ (Development modda, Business Verification hackathon sonrası)
- Session expiry fix ✅ (visibilitychange + TOKEN_REFRESHED + global signOut)
- Google Search Console ✅ (domain doğrulanmış, sitemap gönderilmiş)
- 60+ Türkçe karakter düzeltmesi ✅ (translations.ts + enterprise.tsx)
- Mahkeme referansı: Tüketici Hakem Heyetleri ✅ (terms/page.tsx)

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

### ✅ HACKATHON POLISH (Tamamlandı — 26-27 Mart 2026)

**26 Mart — Phase 1 (S14-20 Fixler):**
- ✅ Dashboard tools grid (8 kart), Leaderboard API + UI, 71 çeviri key
- ✅ Premium gate'ler kaldırıldı, Wrapped share fix, Doktor davet fix (/doctor/join)

**27 Mart — Phase 2-6 (UI Polish + Demo):**
- ✅ CSS animasyonları (fadeInUp, scaleIn, typingBounce, pulseGlow, gentleSway)
- ✅ Landing page: hero badge, stats strip, staggered animasyonlar, feature card top-border
- ✅ Chat UX: 3 bouncing typing dot, mesaj balonları sol border accent + shadow
- ✅ Dashboard: zaman bazlı karşılama, pastel tool kartları, hover efektleri
- ✅ Demo modu: /api/demo + login'de "Demo Hesabı Dene" butonu

**27 Mart — Bug Fix Sprint:**
- ✅ 15 hardcoded `lang === "tr" ? ...` → tx() (profile, calendar, chat, history, interaction)
- ✅ 18 yeni çeviri key'i eklendi
- ✅ API güvenlik: health-sync auth, doctor-summary auth, scan-medication rate limiting

### ✅ HACKATHON FİNALİZASYON — Phase 7-13 (TAMAMLANDI — 28 Mart 2026)

**Phase 7: Hardcoded Çeviriler** ✅
- 298 hardcoded ternary → 274'ü tx() ile merkezi çeviri sistemine taşındı
- 240+ yeni çeviri key eklendi (EN+TR)
- Kalan 24 ternary template literal (${variable} gerektiriyor)

**Phase 8-13: Bug Fix + Polish + Radyoloji** ✅
- Demo API yeniden yazıldı (35 gün gerçekçi veri)
- Kritik API güvenlik bugları düzeltildi (family, analytics, scan-medication, blood-test-pdf)
- Google/Facebook OAuth PKCE code exchange düzeltildi
- ChatInterface memory leak düzeltildi (AbortController)
- Supplement duplikasyonu düzeltildi (TodayView + WashoutCountdown)
- Mobile horizontal overflow düzeltildi
- Biyolojik yaş faktörleri TR çevirisi eklendi
- Error boundary eklendi (app/error.tsx)
- SEO: robots.txt, sitemap.xml, security headers
- Desktop UI: max-width artırıldı, responsive padding, font iyileştirmeleri
- Radyoloji Analizi toolu eklendi (Gemini Vision + PDF export)
- Profil ilaç onay butonu 24 saat persist düzeltildi
- Kan tahlili analizi dil desteği düzeltildi

### 🔧 YENİ ÖZELLİKLER — Phase 14-20 (Planlandı)

**Phase 14: Sayfa Birleştirmeleri**
- [ ] Kan Tahlili + Radyoloji → `/medical-analysis` (tab'lı tek sayfa: "Tıbbi Analiz")
- [ ] Kalori + BMI + Vücut Yağ + Kilo Takibi → `/body-analysis` (bölümlü tek sayfa: "Vücut & Beslenme")
- [ ] Kilo trend grafiği (vital_records'tan çekip chart)
- [ ] Eski `/blood-test`, `/radiology`, `/calorie` route'larını redirect yap

**Phase 15: Semptom Checker (Triage)**
- [ ] Semptom girişi (free text + yaygın semptom butonları)
- [ ] AI triage: Acil / Doktora Git / Evde Bekle sınıflandırması
- [ ] Kırmızı kod filtresi entegre (acil semptomlar → 112 yönlendirme)
- [ ] Profil farkındalığı (ilaçlar, kronik hastalıklar)
- [ ] Olası nedenler + ne zaman acile gitmeli listesi

**Phase 16: Besin-İlaç Etkileşim Kontrolü**
- [ ] Besin/yiyecek girişi (greyfurt, kafein, alkol, süt ürünleri vs.)
- [ ] Profildeki ilaçlarla otomatik çapraz kontrol
- [ ] Renk kodlu uyarı (yeşil/sarı/kırmızı)
- [ ] Yaygın besin-ilaç etkileşimleri veritabanı
- [ ] PubMed kaynaklı bilgi

**Phase 17: Takviye Karşılaştırma Toolu**
- [ ] İki takviyeyi yan yana karşılaştır (ör. Omega-3 vs Krill Oil)
- [ ] Kanıt düzeyi, maliyet, emilim, yan etki karşılaştırma tablosu
- [ ] Profil bazlı hangisi daha uygun önerisi
- [ ] PubMed çapraz referans

**Phase 18: İlaç Etkileşim Haritası (Görsel)**
- [ ] Profildeki tüm ilaçların ağ grafiği görselleştirmesi
- [ ] Kırmızı/sarı/yeşil çizgilerle etkileşim gösterimi
- [ ] Tıklanabilir düğümler (ilaç detayı)
- [ ] react-force-graph veya D3.js entegrasyonu

**Phase 19: Sağlık Hedefi Koçu**
- [ ] Hedef belirleme ("3 ayda kolesterol düşür", "kilo ver", "uyku kalitesi artır")
- [ ] AI kişiselleştirilmiş haftalık plan oluşturma
- [ ] Milestone takibi + takvim entegrasyonu
- [ ] Haftalık ilerleme raporu
- [ ] Boss Fight sistemiyle entegrasyon

**Phase 20: İlaç Prospektüs Okuyucu** (Gelecek)
- [ ] İlaç kutusu/prospektüs fotoğrafı → Gemini Vision ile metin çıkarma
- [ ] Yan etkiler, etkileşimler, dozaj halk dilinde özet
- [ ] Profildeki ilaçlarla çapraz kontrol

### 🚀 HACKATHON SONRASI (S14–S21)

**Para Bloğu (Nisan sonu → Ağustos 2026)**
- S14: Freemium altyapısı — İyzico ödeme entegrasyonu, özellik kilitleme sistemi
- S15: Kullanıcı paneli — favoriler, gamification rozetler, anonim karşılaştırma skoru
- S16: Yıllık Wrapped altyapısı + affiliate supplement linkleri + aile paketi fiyatlandırma

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
- Pricing navbar'dan çıkarıldı, TrialBanner devre dışı
- Demo modu: Login sayfasında "Demo Hesabı Dene" butonu → /api/demo ile hazır verili hesap
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

## Önceki Oturumda Eklenen Özellikler (28 Mart — v23.0)

**Yeni Sayfalar:**
- ✅ Market Intelligence Hub (`/enterprise` — 5 tab, 1084 satır)
- ✅ Smart Triage + Kan Tahlili branş yönlendirme (`/symptom-checker`)
- ✅ Hakkımızda sayfası (`/about`)
- ✅ Profil alanları (ülke/şehir/telefon/recovery email + Supabase migration)
- ✅ Mobil landing page fix (horizontal overflow)
- ✅ Doktor Referans Sistemi (`/doctor/referral` — affiliate kodlar, ödül kademeleri)
- ✅ Bağlı Aile Hesapları (profilde invite/accept/remove)
- ✅ Health Analytics & Benchmarking Dashboard (maliyet, sonuç, trend analizi)
- ✅ Value-Based Marketplace (`/value-marketplace` — 4 tab, eskrow, ödül)
- ✅ Research & Collaboration Hub (`/research-hub` — Harvard HVHS C10)

**Altyapı:**
- ✅ Sentry error monitoring entegrasyonu
- ✅ Playwright E2E testler (54 sayfa + 6 API)
- ✅ Health Check admin paneli
- ✅ 5 katmanlı güvenlik korkuluğu (`lib/safety-guardrail.ts`)
- ✅ PROMs/PREMs anketi (`PromsSurvey` bileşeni)
- ✅ Kişiselleştirilmiş Günlük Sağlık Planı (`DailyCareCard`)
- ✅ Proaktif SOS Uyarı Sistemi (`CriticalAlertModal`)
- ✅ 4 Supabase migration çalıştırıldı

---

## Environment Variables (.env.local)

```env
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://huiiqbslahqkadchzyig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PUBMED_API_KEY=...
NEXT_PUBLIC_APP_URL=https://doctopal.com
RESEND_API_KEY=...                    # E-posta gönderimi (Resend)
TWILIO_ACCOUNT_SID=...               # WhatsApp bot
TWILIO_AUTH_TOKEN=...                 # WhatsApp bot
TWILIO_WHATSAPP_FROM=...             # WhatsApp sandbox/business number
TELEGRAM_BOT_TOKEN=...               # Telegram bot
CRON_SECRET=...                      # Vercel Cron job auth
GOOGLE_FIT_CLIENT_ID=...             # Google Fit OAuth
GOOGLE_FIT_CLIENT_SECRET=...         # Google Fit OAuth
SENTRY_DSN=...                       # Error monitoring
```

---

---

## Bu Oturumda Eklenen Büyük Modüller (28-29 Mart 2026)

### Navigasyon Yeniden Yapılandırma
- `lib/tools-hierarchy.ts` — 14 kategori, 135+ modül JSON
- Mega Menü (desktop: 4 sütun grid + hover popover, mobile: akordeon)
- `/tools` Hub sayfası (aranabilir kategori grid)
- Command Palette (`Cmd+K` Spotlight-tarzı arama + semantik search)

### Klinik Testler (`/clinical-tests`)
- 7 uluslararası test: PHQ-9, GAD-7, ASRS, PSS-10, ISI, WHO-5, AUDIT
- Typeform-tarzı tek soru/ekran UI + kriz tespiti (Q9 → 112 overlay)
- `lib/clinical-tests-data.ts` + `components/clinical/`

### Healthcare Talent Hub (`/talent-hub`)
- 4 adımlı CV wizard + profesyonel profil kartları
- KYC doğrulama (`/talent-hub/verify`) + drag-drop belge yükleme
- Güvenli depolama: AES-256 encrypted path + 15dk signed URL + audit trail

### Premium Yayıncı Portalı (`/creator-studio`)
- Rich text editör + 4 fiyatlandırma planı (Observer→Enterprise)
- Akıllı video URL (YouTube/Vimeo regex + canlı önizleme)
- AI SEO Copilot (split-view, gerçek zamanlı skor 0-100)
- `/expert-content` okuyucu görünümü

### Omnichannel Bot (WhatsApp + Telegram)
- `/connect-assistant` — kanal seçimi + QR bağlantı
- `/api/bot-webhook` — mesaj alma + görev tamamlama tespiti
- `/api/bot-send` — Vercel Cron 09:00 günlük plan gönderimi

### FHIR R4 Birlikte Çalışabilirlik
- `lib/fhir/` — types, terminology-map (SNOMED+RxNorm+LOINC), converters
- `/api/fhir` — FHIR bundle export + e-Nabız formatı + import
- 10 bitki SNOMED kodu, 20 LOINC tahlil kodu, 12 SNOMED hastalık

### KVKK/GDPR Uyumluluk
- `lib/consent-management.ts` — 6 rıza amacı, katmanlı aydınlatma, SHA-256 dijital imza
- `/share-data` — 4 adımlı veri paylaşım akışı + Zero Trust erişim
- `/api/consent` — grant/withdraw/list API
- Güvenli belge depolama: magic bytes doğrulama, encrypted DB path

### Entegre Bakım Yolları (Harvard HVHS C6)
- `lib/care-pathways.ts` — risk stratifikasyon (0-100), 3 tier, varyans analizi
- 3 bakım paketi: Diyabet, Uyku, Kardiyovasküler
- `/health-roadmap` — kişisel yol haritası UI

### Küresel Kıyaslama (Harvard HVHS Benchmarking)
- `lib/global-benchmark.ts` — 9 G20+ ülke, 10 HVHS bileşeni
- `/global-benchmark` — SVG radar chart + simülasyon motoru
- 4 vaka çalışması: Singapur, Hollanda, İtalya, Japonya

### Diğer Yeni Özellikler
- E-posta sistemi (Resend: onay/ret şablonları, dark mode)
- Acil durum kişileri (`/emergency-contacts` + `SOSCard`)
- Cihaz entegrasyonu (`/connected-devices` — 8 sağlayıcı + OAuth)
- İlgi alanı onboarding (`/interests` — 24 baloncuk, 3 kategori)
- Aylık ROI kartı (`MonthlyROICard` — Spotify Wrapped tarzı)
- Fake Door testi (`FakeDoorTest` — premium talep ölçümü)
- 60+ yeni sayfa (Faze C/D/E/F)
- 1,170+ Türkçe karakter düzeltmesi

### Oturum 29 Mart — v25.0 (Cleanup + Davranışsal Psikoloji)

**Araç Hiyerarşisi Temizliği:**
- ✅ 5 duplicate href temizlendi, 3 tool `/medication-hub`'a birleştirildi
- ✅ 12 statik rehber → `/health-guides` hub, Doktor araçları ayrı kategoriye
- ✅ Acil durum kişileri profil sayfasına entegre
- ✅ Navbar: "Araçlar" dropdown kaldırıldı, "Hakkımızda" footer'a taşındı

**Davranışsal Psikoloji Dashboard:**
- ✅ Social Proof, Loss Aversion (streak uyarısı), Curiosity Gap (öneriler)
- ✅ Gradient kategori kartları + emoji ikonlar
- ✅ Profil tamamlama ilerleme çubuğu (Endowed Progress %20)

**Özel İkon Seti:**
- ✅ `components/icons/PhytoIcons.tsx` — 20+ botanik dual-tone SVG
- ✅ Landing + About page ikonları değiştirildi

**Kritik Fixler:**
- ✅ Profil kaydetme: user.id fix, toast bildirimi, error handling
- ✅ Takvim performans: lazy load + paralel fetch
- ✅ 65 dosyada Türkçe karakter düzeltmesi
- ✅ Europe PMC eklendi (çoklu akademik kaynak)

### Oturum 30 Mart — v27.0 (Performance + i18n + QA)

**Performance Optimizasyonu:**
- ✅ Build hataları düzeltildi (orphaned code, type error, 3 duplicate key)
- ✅ Dashboard 9 ağır kart → next/dynamic + skeleton loading
- ✅ 4 API route sequential → Promise.all parallelizasyon (chat, interaction, health-analytics, alcohol-tracker)
- ✅ PubMed API 30dk cache headers
- ✅ Skeleton UI component oluşturuldu

**i18n tx() Migration (%79):**
- ✅ 1,223 / 1,544 basit ternary → merkezi tx() sistemine taşındı
- ✅ 22 batch sayfa + 5 batch API route işlendi (150+ dosya)
- ✅ ~1,300 çeviri anahtarı translations.ts'de (6,438 satır)
- ✅ 321 kalan ternary: object/array/template patterns (fonksiyonel, bug değil)

**QA & Test Sonuçları:**
- ✅ 6 öncelikli sayfa test: symptom-checker, food-interaction, supplement-compare, interaction-map, health-goals, prospectus-reader — HEPSİ PASS
- ✅ 17/17 API endpoint test — HEPSİ PASS
- ✅ Güvenlik testleri: XSS, SQL injection, auth, rate limiting — HEPSİ PASS

**Diğer:**
- ✅ /health-goal-coach → /health-goals redirect
- ✅ /medication-reader → /prospectus-reader redirect
- ✅ 32 commit push edildi

### Toplam Proje Durumu
- **324 sayfa/route** aktif (build doğrulanmış)
- **135+ araç** 17 kategoride organize
- **~1,300 çeviri key'i** (TR+EN) — translations.ts 6,438 satır
- **20+ özel SVG ikon** (PhytoIcons)
- **i18n coverage:** %79 (basit ternary), kalan %21 fonksiyonel pattern
- **API testleri:** 17/17 PASS
- **Güvenlik testleri:** 5/5 PASS
- Build temiz, tüm commitler push edilmiş
- Vercel + Supabase + GitHub tam entegre

---

### Oturum 30 Mart — v29.0 (Beta Readiness Sprint)

**Legal & Copyright:**
- ✅ LICENSE file (All Rights Reserved)
- ✅ Copyright headers on 494 source files
- ✅ Footer copyright text TR/EN

**SEO:**
- ✅ Sitemap expanded 7→32 pages
- ✅ JSON-LD structured data (WebApplication + FAQPage)
- ✅ Turkish FAQ section (5 questions)
- ✅ Turkish SEO keywords in metadata

**Yeni Özellikler:**
- ✅ Settings page (/settings) — language, theme, notifications
- ✅ Feedback widget (floating button, Supabase + Resend)
- ✅ Contact form API (Resend email)
- ✅ Cloudflare Turnstile CAPTCHA (login + register)
- ✅ Global loading.tsx skeleton

**Güvenlik & Uyumluluk:**
- ✅ Password: 8 char + 1 uppercase + 1 number
- ✅ Data deletion: 11+ tables (KVKK/GDPR)
- ✅ Data export: 11 tables
- ✅ Privacy policy: Gemini, PubMed, OpenFDA named
- ✅ Emergency detection: 23 TR + 17 EN phrases (expanded)
- ✅ 20 Turkish drug names in Gemini resolver

**Fix'ler:**
- ✅ Landing page fake stats → BETA badge
- ✅ Dashboard fake social proof → BETA badge
- ✅ Doctor compliance score → null (not random)
- ✅ Wrapped supplements → real data query
- ✅ Courses → "Coming Soon" for unlinked
- ✅ E-Nabız → "Coming Soon" notice
- ✅ Family profiles → type badges (Child/Elderly/Adult)
- ✅ Unused imports cleaned

**Dosyalar:**
- ✅ FEATURE-AUDIT.md — full codebase analysis
- ✅ BETA-READINESS.md — readiness checklist
- ✅ DEMO-SCRIPT.md — Harvard demo instructions
- ✅ Supabase migration: feedback table

### Oturum 30-31 Mart — v31.0 (Session 5+6: Behavioral UX Overhaul + QA)

**Session 5 — QA Sprint:**
- ✅ Image optimization (5 unused SVGs removed, PNG→WebP 79% reduction)
- ✅ 28/30 page rendering tests PASS
- ✅ 13/15 API endpoint tests PASS (2 Gemini quota)
- ✅ 6/6 security tests PASS (XSS, SQL injection, auth, rate limiting)
- ✅ 8 new translation keys, all simple ternaries→tx()
- ✅ Build: zero errors

**Session 6 — Massive Behavioral UX Redesign (22 commits):**

**Yeni Bileşenler (50+ dosya):**
- ✅ Sports Performance: IntentBar, IntentCards, TodayFocusCard, SupplementTimer, DrugSafetyCard, WeeklyProgressBar
- ✅ Sleep Analysis: MorningCard, MicroInsightCard, SleepDebtDonut, ChronotypeCard, WindDownCard, SleepSessionLogger, CircadianTimeline
- ✅ Chat: SmartWelcome, AILoadingState (labor illusion), SmartSuggestions (follow-up chips)
- ✅ Calendar: WeeklyStrip, HabitRings, TimeBlockTasks, QuickLogFAB
- ✅ Dashboard: DailySynergyCard (cross-module AI)
- ✅ Analytics: ClinicalInsightsHeader (triage + sparklines + donut)
- ✅ Doctor: DoctorShell (persistent 4-tab navigation)
- ✅ Innovation: InnovationShell (scrollable 5-tab navigation)
- ✅ UI: DrugAlertCard (glassmorphism), EmptyState (behavioral)

**Sayfa Yeniden Tasarımları (15 sayfa):**
- ✅ Sports Performance: Intent bar + gamified supplement checklist + streak tracker
- ✅ Sleep Analysis: Conversational morning card + sleep debt donut + chronotype animals + wind-down mode
- ✅ Health Assistant: Smart welcome + contextual greeting + Did You Know + mic button
- ✅ Interaction Checker: Trust card + pharmacology facts + endowed progress nudge
- ✅ Landing Page: Bento Grid + Spotlight search + quick action chips
- ✅ Posture & Ergonomics: Workout player with circular countdown + gamified checklist
- ✅ Doctor Panel: Clinical Copilot + triage queue + Inbox Zero
- ✅ Doctor Communication: Action-driven empty state + quick topic chips
- ✅ Drug Info: Rx Copilot + progressive disclosure + AI shield
- ✅ Health Analytics: Clinical insights header with triage alerts
- ✅ Global Benchmark: Strategy simulator with interactive sliders + collectible cards
- ✅ Health Roadmap: Gamified quest journey + shield gauge + mystery locked cards
- ✅ Research Hub: Interactive API terminal + data vault + golden ticket CTA
- ✅ Share Data (FHIR): Data Vault + toggle switches + self-destructing links
- ✅ Creator Studio: Dopamine analytics + decoy pricing + magic pen FAB
- ✅ Prospectus Reader: AI scanner lens + labor illusion loading
- ✅ Vital Logger: Zero-typing grid + context chips + micro-reward

**Navigasyon Yenilikleri:**
- ✅ Floating glassmorphism navbar (scroll shrink, 4 core nav, pill active)
- ✅ Smart Back Button + breadcrumbs (135+ tool pages)
- ✅ Doctor Workspace Shell (4 pages, bottom tab bar mobile, sidebar desktop)
- ✅ Innovation Hub Shell (5 pages, scrollable top tab bar)
- ✅ Tools Hub: ?category= state retention + expand-in-place

**Design System v2:**
- ✅ Semantic tokens: lavender (AI), sage (clinical safe), coral (warnings)
- ✅ Glassmorphism: glass-card, glass-thinking, glow-lavender
- ✅ Soft shadows: shadow-soft, shadow-soft-md, shadow-soft-lg
- ✅ scrollbar-hide, safe-area-pb utilities

**Backend & Altyapı:**
- ✅ Master AI Orchestrator: health-context.ts + cross-module-engine.ts + /api/master-orchestrator
- ✅ Smart Nudge Engine: nudge-engine.ts + nudge-prompts.ts + /api/nudge-check + Vercel Cron
- ✅ Recovery Dashboard BFF: daily-health-log.ts + /api/recovery-dashboard
- ✅ Polyphasic sleep session support
- ✅ Telegram Bot feedback notifications (Discord blocked in Turkey)
- ✅ Discord webhook fallback
- ✅ KVKK data deletion: 11→18 tables
- ✅ Data export: 11→14 tables
- ✅ Supabase migration: nudge_log table

**Disclaimer banner üstten kaldırıldı** (footer'da kalıyor)
**FAB butonu mordan botanik yeşiline** değiştirildi
**Tüm sayfalar mobil-first** tasarıma geçirildi

### Oturum 31 Mart — v33.0 (15 Modül Davranışsal UX Yeniden Tasarım)

**Yeni Paket:**
- ✅ framer-motion kuruldu (animasyon kütüphanesi)

**Modül 1 — Dashboard (Bento Box Komuta Merkezi):**
- ✅ Asimetrik Bento Box grid (2+1 sütun)
- ✅ Circular progress ring ile günlük skor
- ✅ Strike-through animasyonlu görev listesi
- ✅ AI Copilot hero kartı (dark theme, search input, suggestion chips)
- ✅ Quick action bento chips
- ✅ Streak badge (Loss Aversion)
- ✅ Framer Motion stagger animasyonlar

**Modül 2 — Takvim (Günlük Yaşam Panosu):**
- ✅ Horizontal weekly strip (swipeable gün seçimi)
- ✅ Apple Fitness tarzı habit rings (su, ilaç, takviye, hareket)
- ✅ Sirkadiyen zaman blokları (Sabah/Öğle/Gece)
- ✅ Konfetili görev animasyonları
- ✅ Quick Log FAB (sage-green, expandable menü)

**Modül 3 — Prospektüs Okuyucu (Smart Scanner):**
- ✅ Framer Motion nefes alan glow efekti
- ✅ Geliştirilmiş AI lens ikonu
- ✅ Sage-green tema (mor kaldırıldı)

**Modül 4 — Spor & Ergonomi:**
- ✅ Indigo → sage-green tema migrasyonu
- ✅ AnimatePresence workout player modal

**Modül 5 — Doktor Paneli (Clinical Copilot):**
- ✅ Motion giriş animasyonları

**Modül 6 — Doktor Mesajları (Premium İletişim):**
- ✅ Tam yeniden yazım: premium empty state
- ✅ Steteskop + mesaj hero ikonu + glow
- ✅ Quick topic chips + trust badge
- ✅ Sage-green FAB

**Modül 7 — Reçete Asistanı (Rx Copilot):**
- ✅ Framer Motion progressive disclosure

**Modül 8 — Hasta Analitiği:**
- ✅ Framer Motion chart animasyonları

**Modül 9 — Doctor Workspace Shell:**
- ✅ layoutId ile kayan tab indikatörü
- ✅ Crossfade sayfa geçişleri
- ✅ Glassmorphism backdrop-blur navigasyon

**Modül 10-14 — Benchmark, Roadmap, Research, FHIR, Studio:**
- ✅ Tüm sayfalara Framer Motion eklendi

**Modül 15 — Innovation Hub Shell:**
- ✅ layoutId pill tab animasyonu
- ✅ Crossfade sayfa geçişleri

**Tasarım Kuralları (Genel):**
- Renk paleti: sage-green (sage-500/600/900), krem (stone-50), antrasit (slate-700/900)
- MOR KULLANILMIYOR — tüm mor referanslar sage-green'e çevrildi
- Tüm FAB butonları sage-green
- Framer Motion: fade, slide, scale, stagger, pulse, tap, layoutId
- Mobile-first: varsayılan mobil, md:/lg: breakpoint'leri
- Glassmorphism: backdrop-blur-xl, bg-white/80
- Gölgeler: shadow-sm, shadow-lg, shadow-2xl

### Session 7b — Eksik Modüller Tamamlandı (31 Mart 2026)

**Modül 4 — Sports IntentBar Yeniden Yazım:**
- ✅ Zero-Typing bento chip selectors (Focus → Need → CTA)
- ✅ Mode toggle (Quick Select / Free Text)
- ✅ Tüm indigo referanslar → sage-green/primary
- ✅ AnimatePresence step reveal + CTA slide-up

**Modül 5 — Doctor Panel Swipe-to-Dismiss:**
- ✅ Triage kartları drag="x" ile sağa kaydırarak silme
- ✅ AnimatePresence smooth card exit
- ✅ Inbox Zero kutlama spring animasyonu
- ✅ Swipe hint text

**Modül 7 — Rx Copilot Tam Yeniden Yazım:**
- ✅ Labor illusion loading (cycling steps + progress dots)
- ✅ Stagger animation result cards
- ✅ Animated expand/collapse sections
- ✅ Brand names whileHover
- ✅ Stone-50 background

**Modül 8 — Health Analytics:**
- ✅ Motion wrapper header + content
- ✅ Emerald → primary renk migrasyonu
- ✅ Glassmorphism sticky header

**Modül 10 — Global Benchmark:**
- ✅ Country chips stagger + whileHover/whileTap
- ✅ AI insight AnimatePresence (ülke değişince animasyon)
- ✅ Score spring counter animation
- ✅ Growth opportunity cards stagger + whileHover
- ✅ Strategy cards horizontal slide-in

**Modül 11 — Health Roadmap:**
- ✅ Shield gauge spring scale-in
- ✅ Journey steps stagger + active pulse animation
- ✅ Locked packages glassmorphism blur overlay
- ✅ Unlocked package whileHover

**Modül 12 — Research Hub:**
- ✅ Governance chips stagger
- ✅ API terminal buttons whileHover/whileTap
- ✅ AnimatePresence terminal content switching
- ✅ Validation pipeline stagger scale-in
- ✅ Institution grid stagger + whileHover lift

**Modül 13 — FHIR Share Data:**
- ✅ Toggle cards stagger fadeUp
- ✅ iOS-style toggle whileTap + layout spring animation
- ✅ AnimatePresence recipient/expiry slide-up
- ✅ CTA button whileHover/whileTap

**Modül 14 — Creator Studio:**
- ✅ KPI cards stagger
- ✅ Pricing cards whileHover scale (popular card bigger)
- ✅ Feature list stagger slide-in
- ✅ Magic Pen FAB spring + whileHover rotate

**Takvim Fix:**
- ✅ WeeklyStrip lang prop düzeltmesi

### Session 7c — Bug Fix & Mobile Responsive (31 Mart 2026)

**Mobil Responsive Düzeltmeleri:**
- ✅ Landing page: text-3xl → text-2xl responsive, gap-x-8/10 → gap-x-3/4 responsive
- ✅ Interaction checker: stepper 3 adım `flex items-center` → `flex-col items-center text-center` (kayık yazı düzeltildi)
- ✅ Interaction checker: başlık text-3xl → text-xl responsive
- ✅ Dashboard, Calendar, Interaction Checker 375px'te doğrulandı

**Hydration & Session Düzeltmeleri:**
- ✅ getTimeEmoji() render-time → useEffect + useState (hydration mismatch çözüldü)
- ✅ Layout'a Suspense boundary eklendi (children etrafında spinner fallback)
- ✅ Auth visibility change handler: user state de session ile birlikte güncelleniyor

**Onboarding Stuck Düzeltmesi:**
- ✅ Tüm alert() çağrıları → saveError state + inline banner + retry butonu
- ✅ Hata durumunda kullanıcı tekrar deneyebiliyor (stuck olmaz)

**Error Boundary İyileştirmesi:**
- ✅ error.tsx: 3 kurtarma seçeneği (Tekrar Dene / Sayfayı Yenile / Ana Sayfa)
- ✅ Hata mesajı excerpt'i gösteriliyor

*Son güncelleme: 3 Nisan 2026 v42.0*
*Sprint 1-13 + Phase 1-20 + 28 Mart - 3 Nisan oturumları tamamlandı.*
*225 sayfa + 121 API route, build SIFIR hata, 50+ yeni bileşen.*
*V2.0 Master Revision: 14 özellik, 4 grup, TAMAMEN tamamlandı.*
*Hackathon: 11-12 Nisan 2026 — 8 gün kaldı*
*Premium gate'ler kaldırıldı — hackathon modunda tüm özellikler açık.*
*Demo modu aktif — jüri tek tıkla dolu hesap görebilir.*

### Son Oturumlar (Session 11-12e) — Özet

**Session 11 — Bug Fix & Polish:**
- Navbar: glass-card kaldırıldı → CSS var(--card) solid background
- Settings: 9 araç tam liste, uniform link kartları
- Şifre değiştirme: email onay akışı (Supabase native)
- İlaçlarımı Yükle: /api/user/medications → Bearer token auth, hata mesajları

**Session 12 — Adaptive Symptom + Calendar + Dashboard:**
- Adaptive Symptom Assessment (Ada Health style) — Claude AI adaptive questioning
- Dashboard task list persistence + customization (8 task, dismiss, ⚙️)
- DailyCareCard customization + 8 kategori
- Calendar 6 bug fix (weekly strip, su kayıt, habit rings, heatmap, ritual, med sync)
- Chat: collapsible sources, suggestion chips overlap fix

**Session 12b — Calendar & Supplement Deep Fix:**
- Bidirectional panel↔calendar sync, dynamic med/sup counts
- Supplement ring separate tracking, streak UTC fix
- Ritual persistence race condition fix
- Profile save user_id→id fix, Supabase column additions

**Session 12c — Lighthouse + Profile + Sentry:**
- Lighthouse CLS fixes (navbar boyutu, animasyon y-offset, img width/height)
- A11y: aria-labels, renk kontrastı, touch targets
- Profile: medical history card layout, null check fix
- Sentry errors: 3 round fix (keyMarkers, nutritionTiming, supplementPlan, CommandPalette, AbortError)

**Session 12d — Ada + KHealth + Buoy Feature Parity:**
- Ada: Natural language input, assess for others, 8-level triage, PDF report, competitive advantage
- KHealth: People Like You, AI Pre-Visit Doctor Report, predictive phyto
- Buoy: Uncertainty reduction, care navigation, competitive positioning

**Session 12e — Bearable + Oura + Function Health + InsideTracker:**
- Bearable: AI Correlation Engine, Year in Pixels, Experiments, Recovery Score, Biological Budget
- Oura: Wearable-free positioning, competitive update
- Function Health: Longevity Optimal Ranges, organ system grouping, biological age calculation
- InsideTracker: Personalized Action Plan (top 5 foods + supplements)
