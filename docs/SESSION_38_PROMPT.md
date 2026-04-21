# Session 38 — Sabah Başlangıç Prompt'u

> **Kullanım:** Yarın sabah bu dosyayı aç, içeriği Claude Code'a paste et. Talimat net, karar verme adımları belirgin.

---

## Durum (Session 37 Sonu)

**Son push:** `aafc81e..2b34b78` (Session 37 AI Kalite G3 + G1 + docs)

**Son 4 session özet:**

| Session | Push Hash | Ana İş |
|---|---|---|
| 34 | 14 commit | Premium gate'ler + marketing landing + KVKK Aydınlatma v2.1 + Mesafeli/Abonelik draft |
| 35 | `ef5f1a0..b1eb8a2` | 92 hidden tool silme + AI Safety G4 (yellow code) + G2 (critical factors) |
| 36 | `b1eb8a2..8b0f254` | Güvenlik (3 fallback) + bug fix (water/daily-log/popup) + AI Kalite (greeting/dozaj/format/TR) + v1.2 yapı (family_history migration + Clinical chip) |
| 37 | `aafc81e..2b34b78` | AI Kalite G3 (medication hub prompt enrich + rename) + G1 (4 yeni few-shot) |

**AI Kalite dizisi TAMAM** (Master Plan v1.1 Bölüm 10). Sıradaki Master Plan işleri: Hub konsolidasyonu, Chat UX rewrite, Premium gate matrisi, Wow özellikler, Iyzico, family_history UI entegrasyonu.

**Canlı test durumu:**
- Session 36 + 37 push edildi, Vercel deploy tamam
- `docs/SESSION_36_SUMMARY.md` ve `docs/SESSION_37_SUMMARY.md`'de test matrisleri var
- İpek sabah testleri yapacak (veya yapmışsa sonuçları paylaşacak)

---

## Aşama 1: Test Durumu (5 dk)

**İpek, sabahleyin şunu söyle:**
- ✅ Session 36 + 37 test matrisi tamamen çalıştı → Session 38 ana iş'e geç
- ❌ Şu test(ler) fail oldu: [liste] → önce hotfix sonra Session 38
- 🟡 Test edemedim / kısmi test → sabah test + Session 38 ana iş paralel

Test dosyaları:
- `docs/SESSION_36_SUMMARY.md` (Test 1-8, 12 item)
- `docs/SESSION_37_SUMMARY.md` (Test S37-G3-* + S37-G1-*, 7 item)

---

## Aşama 2: Session 38 Scope Seçimi

Master Plan v1.1 Faz 1 bitirme için 5 opsiyon. İpek bir tanesini seçer:

### Opsiyon A — Hub Konsolidasyonu (ÖNERİLEN, ~5-6 saat, ORTA risk)

**Ne:** 61 visible tool'u 12 core tool'a düşürmek. Master Plan Faz 1'in en büyük eksiği.

**Kapsam:**
- **Hub 1 — İlaç Merkezi:** `/medication-hub` ana sayfa + 5 sekme (Bilgi, Yan Etkiler, Etkileşim, Prospektüs, Hatırlatıcı). drug-info, side-effects, food-interaction, interaction-map, polypharmacy, prospectus-reader, scan-medication, cross-allergy → SEKMELERE absorb
- **Hub 2 — Sağlık Günlüğü:** `/health-diary` ana + sekmeler. pain-diary, caffeine-tracker, biomarker-trends + benzerleri absorb
- **Hub 3 — Ayarlar:** `/settings` ana + sekmeler. notifications, connected-devices, privacy-controls, data-export/delete birleştir
- **Visible duplicate silme:** body-analysis (Sağlık Asistanı cevap veriyor), mental-wellness (clinical-tests var), hydration (Apple Health sync yeterli), nutrition (V2'ye), calorie (V2'ye), checkup-planner (Wow özellik olacak), sleep-analysis (V2'ye), sports-performance (V2'ye), posture-ergonomics (V2'ye), intermittent-fasting (V2'ye), circadian-rhythm (V2'ye), emergency-id + qr-profile → birleştir
- **next.config.ts 301 redirect'ler** (~30 eski URL → yeni hub)
- **Navigation cleanup:** MegaMenu + BottomNavbar + Tools Hub → 12 tool listesi
- **Registry update:** `lib/tools-hierarchy.ts` → 12 core tool

**Efor tahmini:** ~20 commit, 5-6 saat

**Risk:** Deep link bozulmasın diye redirect'ler kritik. Hub layout'ları gerçek UI değişikliği.

### Opsiyon B — Chat UX Rewrite (~6-7 saat, YÜKSEK risk)

**Ne:** ChatGPT tarzı sidebar + threads.

**Kapsam:**
- Sol sidebar: sohbet listesi (Bugün/Dün/Bu Hafta gruplu, tarih header'ları)
- Yeni sohbet butonu + thread yönetimi (rename, archive, delete)
- Otomatik başlık (AI ilk mesajdan üretir, short prompt)
- Mobile drawer pattern
- **DB:** yeni `chats` + `chat_messages` tabloları + RLS
- **Migration:** mevcut `query_history` → yeni `chats` script
- **API:** `POST/GET/PATCH/DELETE /api/chats` endpoint'leri
- **Component refactor:** ChatSidebar, ChatThreadList, ChatMessages, ChatInput

**Risk:** Mevcut chat sistemi tamamen yeniden yazılır. Regression yüksek.

### Opsiyon C — Free/Premium Gate Matrisi (~3-4 saat, DÜŞÜK risk)

**Ne:** Master Plan v1.1 Bölüm 6 gate matrisi. Trial lifecycle.

**Kapsam:**
- `lib/premium.ts` genişletme (tüm gate kuralları)
- PremiumGate component (reusable, paywall UI)
- In-context tetikleyiciler (kan tahlili yüklerken, SBAR PDF'te, 4. ilaçta, 6. asistan sorgusunda)
- Trial lifecycle: 7 gün otomatik Premium + nudge email/in-app (3. gün, 5. gün, 6. gün)

**Risk:** Iyzico olmadan trial sonrası kart ekleme yönlendirmesi boşa düşer — placeholder mailto'yla çözülebilir.

### Opsiyon D — family_history_entries UI (~2-3 saat, DÜŞÜK risk)

**Ne:** Session 36 C12 migration dosyasını Supabase'de çalıştırıp UI bağla.

**Kapsam:**
- Supabase'de migration çalıştır (sadece SQL)
- `/family` veya `/profile` sayfasına "Aile Öyküsü" bölümü ekle
- CRUD form (person_relation dropdown + condition input + ages + notes)
- Aile ağacı görselinde "aile öyküsü" kişileri farklı simge ile (hastalık + yaş + ilişki, detaylı profil YOK)
- Aile Risk Haritası (Wow özelliği) için veri kaynağı hazır olur

**Risk:** Düşük, izole bir yeni feature.

### Opsiyon E — Karma (C + D, ~5-6 saat, DÜŞÜK risk)

Premium gate matrisi + family history UI. İki küçük iş bir arada. Hub konsolidasyonu ve Chat UX rewrite Session 39+'a bırakılır.

---

## Aşama 3: Önerilen Yol

**Kararsızsan: Opsiyon A (Hub Konsolidasyonu).**

**Neden:**
- Master Plan Faz 1'in en büyük eksiği — 61 tool kalabalık UI
- Test feedback sonrası temiz zeminle hub UX'ini düzeltmek kolay
- Diğer işler (Chat UX, Premium gate) daha temiz bir tool tabanı üzerinde daha hızlı olur
- Opsiyon B (Chat UX) önemli ama Session 39'da daha olgun plan ile yapılabilir

**Alternatif:** Eğer test bulguları ağırsa → Opsiyon E (C + D, küçük işler). Opsiyon A'yı Session 39'a bırak.

---

## Aşama 4: Plan Çıkarma

İpek opsiyon seçince (A/B/C/D/E), detay plan çıkarılır:

1. **Baseline keşif** (hangi dosyalar etkilenir, mevcut durum)
2. **Commit sırası + bağımlılık matrisi**
3. **Risk analizi** (yüksek/orta/düşük risk commit'ler)
4. **Efor tahmini** (toplam süre)
5. **İpek karar noktaları** (UX detayı, naming, vb.)
6. **Test matrisi** (her commit sonrası doğrulama)
7. **Rollback stratejisi** (sorun çıkarsa nereden geri dönülür)

Plan İpek'e sunulur, onaylarsa Commit 1'den başlar.

---

## Önemli Notlar

### Session 35-37 Pattern Saygısı

- `fetchProfile in-flight Map guard` (Session 32) — KALDIRMA
- 92 silinmiş hidden tool'a referans EKLEME (Session 35)
- SYSTEM_PROMPT yapısını bozma — C8-C11 (greeting, dozaj, format, TR) ve G1 (10 few-shot) korunmalı
- G3 INTERACTION CONTROL kuralları korunmalı
- G4 yellow code keyword'leri bozulmamalı
- G2 CRITICAL PATIENT FACTORS blok korunmalı

### Build Sağlığı

- Her commit sonrası `npx tsc --noEmit` pass
- İş sonunda `npm run build` 0 error/0 warning
- Silinmiş route'a referans regression olmamalı

### Push Politikası

- Normal: Her önemli chunk sonrası push OK
- Hotfix senaryosu: Test fail → hotfix commit + hızlı push
- Risk yüksekse (Chat UX rewrite gibi) → birkaç commit sonra push, Vercel preview doğrula

### İletişim

- Türkçe, direkt, kısa
- Editorial yorum yok
- "Pass-through" commit'lerde rapor bekleme, devam
- "Rapor-edip-devam" commit'lerde kısa özet ver ama durma
- "Zorunlu dur" noktalarında tsc fail, beklenmedik regression, opsiyon çatallanması

---

## Başlangıç Komutu

**Claude Code, şu sırayla ilerle:**

1. Bu doküman'ı oku
2. **Aşama 1:** "Session 36 + 37 test sonuçları?" diye sor, İpek durumu söyle
3. **Aşama 2:** Opsiyon A-E'yi özetle (detay yukarıda), İpek bir tanesini seçsin
4. **Aşama 3:** Eğer test ❌ → önce hotfix, sonra ana iş
5. **Aşama 4:** Seçilen opsiyon için detay plan çıkar, İpek'e sun
6. **Aşama 5:** Onay → Commit 1'den başla

**Kod YAZMA aşama 5'e kadar.** Plan moduna dönme. İpek cevap beklerken bekle, cevap verince sıradaki aşamaya geç.

---

**🌱 İyi günler Session 38 ekibi. AI Kalite dizisi bitti, sıra Hub Konsolidasyonuna veya senin seçtiğin işe.**
