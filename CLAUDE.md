# CLAUDE.md — DoctoPal Proje Anayasası v44.0

## Hızlı Bağlam

**DoctoPal** — kanıta dayalı fitoterapi + modern tıp köprüsü kuran AI sağlık asistanı.
- **Ekip:** 3 tıp öğrencisi, teknik bilgi yok — Claude tüm kodu yazıyor
- **Hackathon:** Harvard "Building High-Value Health Systems" — 11-12 Nisan 2026 — **3 gün kaldı**
- **IGNITE 26 kazanıldı** — jüri core tool'lara ve aile profiline odaklanılmasını istedi
- **Domain:** doctopal.com (Vercel) | **GitHub:** github.com/PhytoTherapyAI/phytotherapy-ai
- **Sunum dili:** İngilizce | **Arayüz:** TR/EN toggle
- **Deploy:** Vercel + Supabase (email auth + Google/Facebook OAuth)
- **AI Motor:** Anthropic Claude API (claude-haiku-4-5) + Embedding: Gemini text-embedding-004
- **Hackathon modu:** Premium gate'ler kaldırıldı, isPremium=true, tüm özellikler açık
- **Proje boyutu:** 348 sayfa, 121 API route, 155 tool (94 hidden), ~1300 çeviri key

### Routing
- `/` → Dashboard (auth) veya Landing (misafir)
- `/dashboard` → `/`'e redirect
- BottomNavbar Home + Header → `/`

---

## HARVARD HACKATHON ROADMAP (7-11 Nisan 2026)

> IGNITE 26'da jüri kararı: **Core tool'lar + Aile Profili** öncelikli. Diğer tool'lar hackathon sonrasına.

### 1. Sağlık Asistanı (Core)
- [ ] Acil durum database verisi iyileştir
- [ ] Daha gerçekçi ve kişiselleştirilmiş cevaplar
- [ ] Daha net, anlaşılır cevaplar

### 2. Etkileşim Deneyleyici (Core)
- [ ] İlaç girmeden de kullanılabilsin (uyarı mesajı ile: "İlaçlarınızı girmeden önerileri kullanmayın")
- [ ] Asistan gibi panel'e al (etkileşimi panelde göster)

### 3. Takvim & Panel
- [ ] Genel kontrol ve düzeltme

### 4. Kan Testi & Radyoloji
- [ ] Kan testi PDF çalıştır
- [ ] Radyoloji cevaplarını iyileştir

### 5. Onboarding Revizyon (BÜYÜK)

**Genel:**
- [ ] İlk sayfaya rahatlatıcı cümle: "Her şeyi sonradan düzenleyebilirsiniz"
- [ ] Her sayfaya başlık uyumlu disclaimer: neden sorulduğu + işine yarayacağı
- [ ] Logo/isim DoctoPal olacak, "Ne kadar çok bilgi = o kadar iyi cevap" mesajı
- [ ] Çıkış yapılırsa girilmiş verileri kaydetsin

**Adım 1 — Kişisel Bilgiler:**
- [ ] Ad Soyad / Rumuz / "Sana nasıl hitap edelim"
- [ ] Doğum tarihi UX iyileştirme (daha güzel, kolay)
- [ ] Cinsiyet seçtikten sonra İngilizce çeviri fix

**Adım 2 — İlaçlar:**
- [ ] İlaç seçilince doz + kullanım sıklığı prospektüse göre otomatik atasın
- [ ] Özel doz varsa hasta girsin + "Dozunuzu doğru girdiğinizden emin olun" disclaimer

**Adım 3 — Alerjiler:**
- [ ] Autocomplete + dropdown menü
- [ ] Zorunluluk kalkacak (opsiyonel)
- [ ] "Şiddet" → "Reaksiyon Tipi" olacak:
  - Anafilaksi (Nefes Darlığı/Şok) — mutlak kontrendikasyon
  - Kurdeşen / Yaygın Döküntü — yüksek riskli blokaj
  - Hafif Kaşıntı / Lokal Kızarıklık — "doktoruna danış" seviyesi
  - Mide Bulantısı / İshal (İntolerans) — yan etki, alerji değil
  - Bilmiyorum / Hatırlamıyorum — kaçış seçeneği

**Adım 5 — Bağımlılık (Sigara/Alkol):**
- [ ] 3 ana buton: Hiç İçmedim (geç) / Eski İçici / Aktif İçici
- [ ] Dinamik sorular (chip/dropdown, klavye yok):
  - Günde ne kadar? (10 dal / 1 paket / 1.5+)
  - Kaç yıl? (1-5 / 5-15 / 15+)
  - (Eski içici) Ne zaman bıraktı? (Son 1 yıl / 1-5 yıl / 5+ yıl)
- [ ] Alkol için de aynı mantık

**Adım 6 — Özgeçmiş (Kronik Hastalıklar):**
- [ ] Temiz kağıdı butonu: "Bilinen kronik hastalığım yok" (seçerse geç)
- [ ] Kritik durumlar: Kanama Bozukluğu, Hamilelik/Emzirme, Bağışıklık Baskılanması, İleri Böbrek/KC Yetmezliği
- [ ] Sistemlere göre çipler:
  - Kardiyovasküler: Hipertansiyon, Aritmi, Kalp Yetmezliği
  - Endokrin: Diyabet (Tip 1/2), Tiroid
  - Nörolojik: Depresyon/Anksiyete, Epilepsi
  - Solunum: Astım, KOAH
- [ ] Cerrahi: Mide/Bağırsak ameliyatı (bariatrik vb.)

**Yeni — Soygeçmiş Adımı:**
- [ ] Temiz kağıdı: "Akrabalarımda genetik/kronik hastalık yok"
- [ ] Majör genetik çipler: Erken kalp krizi (<55), Diyabet, Tiroid, Ailevi Kanser (Meme/Kolon/Prostat), Alzheimer, Bipolar/Şizofreni
- [ ] "Neden Soruyoruz?" bilgilendirme metni

**Adım 7 — Onay Sayfası:**
- [ ] Tıbbi Sorumluluk Reddi: "Acil durumlarda kullanılamaz — 112" cümlesi eklenmeli
- [ ] KVKK Açık Rıza: "Özel Nitelikli Kişisel Veri" + "açık rıza" ifadesi zorunlu
- [ ] Bold ile kritik kelimeler vurgulu
- [ ] Onay kutusu: "...DoctoPal'ın profesyonel doktor yerine geçmediğini anlıyor; KVKK kapsamında açık rıza gösteriyorum"

### 6. Profil Güçlendirme Sayfası (Yeni)
- [ ] Progressive Disclosure: zorunlu değil, "Profilini Güçlendir" başlığı
- [ ] Sosyodemografik: Yaşadığı şehir/bölge, Medeni hal (Yalnız/Evli/Ailesiyle), Sigorta (SGK/Özel/Tamamlayıcı/Yok)
- [ ] Beslenme: Standart / Vegan / Aralıklı Oruç / Karnivor
- [ ] Fiziksel Aktivite: Hareketsiz / Düzenli Spor / Ağır Antrenman
- [ ] Çalışma Düzeni: Gündüz-Masa Başı / Vardiyalı-Gece
- [ ] Boy/Kilo (BMI hesaplama)
- [ ] Akıllı cihaz kullanımı (switch)

### 7. Aile Profili (Netflix Tarzı)
- [ ] Netflix profil sekmesi şeklinde profil ekleme
- [ ] Premium alan kişi: kendi + 2 kişinin profilini yönetebilir
- [ ] Aile paketi: eklenen herkes premium
- [ ] Üye ekleme = direkt kullanıcı ekleme (davet ile)
- [ ] Eklenen kişiye güvenlik bildirimi: "Bir aileye kaydedildiniz, size ait değilse çıkın"
- [ ] Eklenen kişi düzenlenebilirlik tercihi seçebilsin
- [ ] Premium kullanıcıya giriştε "Hangi profili görüntülemek istiyorsunuz?" sorulsun
- [ ] Not ekleme: "sevgilim", "babam" gibi etiketler

### 8. Toolları Gizle
- [ ] Sadece core tool'lar görünsün (asistan, etkileşim, takvim, kan testi, profil, aile)
- [ ] Geri kalan tool'lar hidden: true
- [ ] Ayarlar ve Hesap da gizlenecekler listesinde

### 9. Veri Gizliliği
- [ ] Genel optimizasyon

### 10. Mobil Port
- [ ] Genel kontrol ve düzeltme

---

## Teknik Stack

```
Frontend:     Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Recharts + Framer Motion
Backend:      Next.js API Routes (serverless — Vercel)
Database:     Supabase (PostgreSQL) — tüm tablolar kurulu
AI Engine:    Anthropic Claude API (claude-haiku-4-5) + Embedding: Gemini text-embedding-004
Tıbbi Veri:   PubMed E-utilities API + Europe PMC
İlaç Veri:    OpenFDA API
Auth:         Supabase Auth (email + Google OAuth + Facebook OAuth)
Deploy:       Vercel — doctopal.com
OS:           Windows
```

---

## Güvenlik Mimarisi

### Katman 1: Kırmızı Kod (AI'dan ÖNCE)
Acil kelimeler (göğüs ağrısı, nefes darlığı, bilinç kaybı, intihar, zehirlenme vb.) → tam ekran emergency modal → "I understand" butonuna kadar kilitli.

### Katman 2: İlaç Etkileşim Motoru
OpenFDA + Claude hybrid. Renk kodlu: ✅ Yeşil / ⚠️ Sarı / ❌ Kırmızı

### Katman 3: RAG
PubMed → Claude (temperature:0) → collapsible kaynak paneli

### Katman 4: Algoritmik Güvenlik (lib/safety-guardrail.ts)
5 katman: Kırmızı Bayrak → İlaç-Bitki Etkileşim → Kontrendikasyon → Dozaj Limitleri → Şeffaflık

---

## Environment Variables (.env.local)

```env
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://huiiqbslahqkadchzyig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PUBMED_API_KEY=...
NEXT_PUBLIC_APP_URL=https://doctopal.com
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=...
TELEGRAM_BOT_TOKEN=...
CRON_SECRET=...
SENTRY_DSN=...
```

---

## Geliştirme Kuralları

1. Güvenlik katmanları her özellikten önce kontrol edilir
2. Tıbbi öneri kaynaksız gösterilmez
3. Mobile-first tasarım
4. API anahtarları sadece .env.local + server-side
5. TypeScript strict — `any` yasak
6. Her API endpoint'te error handling
7. Git commit mesajları İngilizce
8. Dark mode için CSS variable — hardcode yasak
9. Kimseyi boş gönderme — her zaman bilgi + yönlendirme
10. Onboarding atlanamaz — login sonrası otomatik
11. İlaç profili olmadan doz tavsiyesi yok
12. EN ve TR sorularına otomatik yanıt
13. Reçete OCR yapılmaz — güvenlik riski

---

## Tasarım Kuralları

- Renk paleti: sage-green (sage-500/600/900), krem (stone-50), antrasit (slate-700/900)
- MOR KULLANILMIYOR — tüm mor referanslar sage-green'e çevrildi
- Framer Motion: fade, slide, scale, stagger, pulse, tap, layoutId
- Glassmorphism: backdrop-blur-xl, bg-white/80
- Gölgeler: shadow-sm, shadow-lg, shadow-2xl
- Mobile-first varsayılan, md:/lg: breakpoint'ler

---

## Demo Senaryoları (Harvard Hackathon)

### Demo 1 — İlaç Etkileşimi
- Input: "I take Metformin and Lisinopril. I have trouble sleeping."
- Beklenen: ❌ St. John's Wort (CYP3A4) → ✅ Valerian Root 300-600mg

### Demo 2 — Serbest Soru
- Input: "Does berberine work for blood sugar control?"
- Beklenen: Grade A evidence + dozaj + collapsible PubMed linkleri

### Demo 3 — Kan Tahlili
- Input: Cholesterol 240, Vitamin D 14, Ferritin 8, HbA1c 6.8
- Beklenen: Detaylı analiz + yaşam koçluğu + PDF indir

---

*Son güncelleme: 8 Nisan 2026 v44.0*
*IGNITE 26 kazanıldı — Harvard Hackathon'a core tool + aile profili odağıyla hazırlanılıyor.*
*Session 17: Aşı profili, SBAR PDF, profil overhaul, davranış bilimi copywriting tamamlandı.*
*Hackathon: 11-12 Nisan 2026 — 3 gün kaldı.*
