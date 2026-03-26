# Sprint 14-20 Düzeltme ve Tamamlama Rehberi

> Bu dosya Sprint 14-20'de eklenen özelliklerin bilinen sorunlarını ve yapılması gereken düzeltmeleri listeler.

---

## ZORUNLU: Supabase Migration

**Çalıştırılması gereken SQL:** `supabase/migrations/sprint14_premium.sql`

Bu migration olmadan şu özellikler çalışmaz:
- History favorileri (is_favorite kolonu)
- History silme (RLS policy gerekebilir)
- Badges DB kaydı (user_badges tablosu)
- Doctor panel (doctor_patients tablosu)
- Side effects (side_effect_reports tablosu)
- Analytics (analytics_events tablosu)
- Premium/Trial alanları (plan, trial_started_at)

**Nasıl çalıştırılır:**
1. https://supabase.com/dashboard → projeye git
2. SQL Editor → New Query
3. `supabase/migrations/sprint14_premium.sql` içeriğini yapıştır
4. Run

---

## Sayfa Erişilebilirlik Sorunları

### Problem: Yeni sayfalar navbar'da yok
Operations, E-Nabız, Analytics, Wrapped, Side Effects, Doctor sayfaları navbar'da link olarak eklenmedi. Kullanıcılar URL'yi bilmeden erişemiyor.

### Çözüm: Dashboard'a link kartları ekle
Dashboard sayfasına (`app/dashboard/page.tsx`) yeni sayfalar için kart/link grid'i ekle:

```
/operations → "Operasyon Takibi"
/enabiz → "E-Nabız İçe Aktarma"
/analytics → "Sağlık Analitiği"
/side-effects → "Yan Etki Monitörü"
/wrapped → "Yıllık Wrapped"
/doctor → "Doktor Paneli"
```

Alternatif: Profil sayfasına veya hamburger menüye ekle.

---

## Sayfa Bazlı Sorunlar

### 1. `/history` — Sorgu Geçmişi ✅ DÜZELTILDI
- [x] Favori toggle çalışmıyor → stopPropagation + optimistic update + fallback eklendi
- [x] Silme çalışmıyor → stopPropagation + error handling + revert eklendi
- [x] Dropdown/expand çalışmıyor → div yerine button element + proper click handler
- [x] is_favorite kolonu yoksa crash → fallback query eklendi
- [ ] **Migration gerekli:** `is_favorite` kolonu query_history tablosuna eklenmeli
- [ ] **RLS gerekli:** query_history tablosunda DELETE policy olmalı

### 2. `/badges` — Rozetler
- [x] Temel rozet sistemi çalışıyor
- [ ] **Global Leaderboard eksik** — Aşağıdaki çözümü uygula:

#### Leaderboard Çözümü:
1. Supabase'de yeni view veya function oluştur:
```sql
-- Anonim leaderboard view (sadece skor, isim yok)
CREATE OR REPLACE VIEW public.leaderboard_scores AS
SELECT
  user_id,
  -- Basit skor hesaplama
  LEAST(100, (
    COALESCE((SELECT COUNT(*) FROM query_history WHERE query_history.user_id = up.id), 0) * 0.2 +
    COALESCE((SELECT COUNT(*) FROM daily_check_ins WHERE daily_check_ins.user_id = up.id), 0) * 0.5 +
    COALESCE((SELECT COUNT(*) FROM blood_tests WHERE blood_tests.user_id = up.id), 0) * 2
  )::integer) as score
FROM user_profiles up
WHERE up.onboarding_complete = true;
```

2. API endpoint oluştur: `/api/leaderboard`
```typescript
// GET: Anonim sıralama döndür
// Response: { rank: 42, total: 1500, percentile: 97, topScores: [100, 98, 95, ...] }
```

3. Badges sayfasında leaderboard bölümü ekle:
- Kullanıcının sırası (anonim — isim gösterilmez)
- Top 10 skorlar (anonim)
- Yüzdelik dilim ("Kullanıcıların %97'sinden iyisin!")
- Haftalık/aylık en çok gelişen

### 3. `/operations` — Operasyon Takibi
- [x] Sayfa kodu hazır ve çalışıyor
- [ ] **Navbar/Dashboard'dan link yok** → Erişilemiyor
- [ ] localStorage kullanıyor — Supabase'e taşınmalı (kalıcılık için)

### 4. `/enabiz` — E-Nabız İçe Aktarma
- [x] Sayfa kodu hazır
- [ ] **Navbar/Dashboard'dan link yok** → Erişilemiyor
- [ ] Mock veri kullanıyor — Gerçek Gemini Vision PDF parsing entegre edilmeli

### 5. `/analytics` — Sağlık Analitiği
- [x] Sayfa kodu hazır
- [ ] **Navbar/Dashboard'dan link yok** → Erişilemiyor
- [ ] analytics_events tablosu gerekli (migration)

### 6. `/wrapped` — Yıllık Wrapped
- [x] Sayfa kodu hazır, premium gate çalışıyor
- [ ] **Navbar/Dashboard'dan link yok** → Erişilemiyor

### 7. `/doctor` — Doktor Paneli
- [x] Sayfa kodu hazır
- [ ] **Navbar/Dashboard'dan link yok** → Erişilemiyor
- [ ] doctor_patients tablosu gerekli (migration)
- [ ] Gerçek doktor doğrulama akışı (dosya upload → admin onay)

### 8. `/side-effects` — Yan Etki Monitörü
- [x] Sayfa kodu hazır
- [ ] **Navbar/Dashboard'dan link yok** → Erişilemiyor
- [ ] side_effect_reports tablosu gerekli (migration)

### 9. `/pricing` — Fiyatlandırma
- [x] Çalışıyor, fiyatlar doğru
- [x] Navbar'da link var
- [ ] "Yakında" butonları → Iyzico entegrasyonu (S14 planı)

### 10. `/offline` — PWA Offline
- [x] Çalışıyor

---

## Dashboard'a Eklenecek Link Grid

Dashboard sayfasına şu kartları ekle (giriş yapmış kullanıcılar için):

```tsx
const TOOL_LINKS = [
  { href: "/history", icon: Clock, labelKey: "nav.history" },
  { href: "/badges", icon: Trophy, labelKey: "badges.title" },
  { href: "/analytics", icon: BarChart3, labelKey: "analytics.title" },
  { href: "/operations", icon: Scissors, labelKey: "operations.title" },
  { href: "/enabiz", icon: FileText, labelKey: "enabiz.title" },
  { href: "/side-effects", icon: AlertTriangle, labelKey: "sideeffect.title" },
  { href: "/wrapped", icon: Sparkles, labelKey: "wrapped.title" },
  { href: "/doctor", icon: Stethoscope, labelKey: "doctor.title" },
]
```

---

## Çeviri Eksikleri

Kontrol edilecek sayfalar:
- [ ] `/operations` — bazı metinler hardcoded İngilizce
- [ ] `/enabiz` — bazı metinler hardcoded
- [ ] `/analytics` — bazı metinler hardcoded
- [ ] `/side-effects` — severity etiketleri hardcoded
- [ ] `/doctor` — bazı metinler hardcoded
- [ ] `/badges` — skor başlığı hardcoded

**Yaklaşım:** Her sayfadaki hardcoded string'leri `tx()` çağrısına çevir ve `lib/translations.ts`'e ekle.

---

## Site Çökme (SW Sorunu) ✅ DÜZELTILDI

- Service worker eski Next.js chunk'ları cache'liyordu → Yeni deploy'da uyumsuzluk → crash
- `public/sw.js` v2 → `/_next/` path'leri artık dokunulmuyor
- `ServiceWorkerRegistration.tsx` → eski cache'leri temizliyor

**Kullanıcılara not:** İlk ziyarette Ctrl+Shift+R (hard refresh) gerekebilir.

---

## Öncelik Sırası

1. ~~**Supabase migration çalıştır**~~ → ✅ SQL hazır, kullanıcı çalıştıracak
2. ~~**Dashboard'a tool linkleri ekle**~~ → ✅ 8 kartlık grid eklendi (26 Mart)
3. ~~**Leaderboard API + UI**~~ → ✅ /api/leaderboard + badges UI (26 Mart)
4. ~~**Çeviri eksiklerini tamamla**~~ → ✅ 71 yeni key, 6 sayfa (26 Mart)
5. ~~**Premium gate kaldır**~~ → ✅ Wrapped + Doctor açık, isPremium=true (26 Mart)
6. ~~**Wrapped share fix**~~ → ✅ ShareCardBase entegre (26 Mart)
7. ~~**Doktor davet fix**~~ → ✅ /doctor/join sayfası eklendi (26 Mart)
8. ~~**Pricing kaldır**~~ → ✅ Navbar'dan çıkarıldı, TrialBanner devre dışı (26 Mart)

---

## Hackathon Polish — Kalan İşler (Phase 2-6)

### Phase 2: CSS Animasyon Altyapısı ✅ (27 Mart)
- [x] `globals.css`'e fadeInUp, scaleIn, typingBounce, pulseGlow, gentleSway, slideInRight
- [x] Utility class'lar: `.animate-fade-in-up`, `.animate-scale-in`, `.card-hover`, `.stagger-children`, `.typing-dot`, `.tool-card-*`

### Phase 3: Landing Page Yeniden Tasarım ✅ (27 Mart)
- [x] Hero badge ("Evidence-Based AI Health Assistant" pill)
- [x] Animasyonlu başlık (staggered fadeInUp)
- [x] BotanicalHero sallanma animasyonu (gentleSway)
- [x] Stats section (1,200+ kullanıcı, 8,500+ etkileşim, 15,000+ PubMed kaynağı)
- [x] Feature kartlarına hover shadow + top-border accent (card-hover class)

### Phase 4: Chat UX İyileştirmesi ✅ (27 Mart)
- [x] Typing indicator: 3 bouncing dot (typing-dot class)
- [x] Mesaj balonları: shadow + sol border accent (border-l-2 border-l-primary/30)
- [x] Mesaj balonlarına scaleIn animasyonu

### Phase 5: Dashboard + Tüm Panel Sayfaları Polish ✅ (27 Mart)
- [x] Dashboard tools grid hover efektleri + pastel renkler (tool-card-1..8)
- [x] Zaman bazlı karşılama ("Günaydın/İyi akşamlar, {isim}")
- [x] Dashboard'a subtitle eklendi

### Phase 6: Demo Modu ✅ (27 Mart)
- [x] Login sayfasına "Demo ile Dene" butonu (Play icon)
- [x] `/api/demo` endpoint — hazır verili demo hesap (Metformin, Lisinopril, 7 gün check-in, 3 sorgu, kan tahlili, takviyeler)
- [x] Jüri tek tıkla dolu hesap görür
