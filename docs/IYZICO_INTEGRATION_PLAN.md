# Iyzico Entegrasyon Planı — DoctoPal Premium Abonelik

> Sürüm: v1.0 — 21 Nisan 2026 (Session 39 C4)
> Durum: **Taslak / Tescil Öncesi**
> Kapsam: Bireysel Premium (₺149/ay, ₺1,490/yıl) + Aile Premium (₺349/ay, ₺3,490/yıl) için Iyzico hosted checkout + recurring subscription.

Bu belge **tescil sonrası** uygulanacak. Şu anda bir check-list + teknik tasarım dokümanıdır; Iyzico başvurusu, sandbox entegrasyon, ve üretime alma sıraları burada.

---

## 0. Ön Koşullar (Harici İş — Claude Code değil)

- [ ] **Şirket tescili tamam** — Vergi numarası + ticari sicil + imza sirküleri hazır
- [ ] **Banka hesabı** — Şirket adına TL hesap (Iyzico hesap doğrulama için)
- [ ] **KEP adresi** — Şirket için resmi elektronik tebligat adresi
- [ ] **VERBİS kaydı** başvurusu yapılmış (Iyzico aktarıcı olduğu için VERBİS'te "finansal veri aktarımı" ilan edilecek)

---

## 1. Iyzico Merchant Başvurusu

**Yer:** https://merchant.iyzipay.com/register

**Gerekli belgeler:**
- Vergi levhası (pdf)
- Ticari sicil gazetesi
- İmza sirküleri
- Banka hesap bilgileri (IBAN)
- Şirket telefonu + KEP
- Kurucu/yetkili kimlik (TC kimlik + fotoğraflı)

**Onay süresi:** 2-7 iş günü. Onay sonrası API Key + Secret Key + Webhook URL tanımlama paneli aktif olur.

**Çıktılar:**
- `IYZICO_API_KEY` — public (sandbox/prod ayrı)
- `IYZICO_SECRET_KEY` — backend-only, env'e eklenecek
- `IYZICO_BASE_URL` — sandbox: `https://sandbox-api.iyzipay.com`, prod: `https://api.iyzipay.com`
- Merchant ID

---

## 2. Sandbox Entegrasyon

### 2.1 SDK Kurulumu

```bash
npm install iyzipay
```

### 2.2 Test kartları (Iyzico dokümanı)

| Kart Numarası | Sonuç | Açıklama |
|---|---|---|
| 5528790000000008 | Başarılı | MasterCard |
| 4766620000000001 | Başarılı | Visa |
| 4111111111111129 | Hata: `invalid card` | Geçersiz kart |
| 5406670000000009 | Hata: `insufficient funds` | Yetersiz bakiye |

**CVV:** Herhangi 3 haneli / **Son Kullanma:** Gelecek herhangi ay/yıl

### 2.3 Minimum integration test akışı

1. `/checkout` sayfasında plan seç (Bireysel/Aile, aylık/yıllık)
2. POST `/api/checkout/create` → Iyzico `checkoutFormInitialize` çağrısı → token döner
3. Hosted form `window.location.href = iyzicoPaymentPageUrl`
4. Kullanıcı Iyzico sayfasında kart bilgisi girer
5. Iyzico callback → `/api/webhook/iyzico` HMAC doğrulama
6. Başarılı → `subscriptions` tablo insert, kullanıcı `premium` rolüne geçer
7. `/checkout/success` sayfası göster

---

## 3. Premium Plan Tarifeleri

| Plan | Aylık | Yıllık (2 ay bedava) |
|---|---|---|
| **Bireysel Premium** | ₺149 | ₺1,490 |
| **Aile Premium (3 profil)** | ₺349 | ₺3,490 |

**Trial:** 7 gün, kart bilgisi ALINIR (auto-renew için) — trial sonunda otomatik ücretlendirme başlar. Kullanıcı trial içinde iptal ederse ücret çekilmez.

**İndirim/Kampanya:** İlk sürümde yok. Sonra: öğrenci indirimi, yıllık upfront bonus ay, referral.

**Kur politikası:** Tüm ücretlendirme TL. Iyzico kur dönüşümü yapmaz (yurt içi).

---

## 4. Abonelik Lifecycle

```
[Trial] ─(kart alındı, 7 gün başladı)─►
  │
  ├─(iptal) ──► [Cancelled] — ücret çekilmez, premium özellikler trial sonuna kadar açık
  │
  └─(trial bitti) ──► [Active] — ilk ücretlendirme yapılır
                        │
                        ├─(iptal) ──► [Cancel-scheduled] — dönem sonuna kadar premium, sonra düşer
                        │
                        ├─(ödeme başarılı) ──► [Active] — dönem yenilendi
                        │
                        └─(ödeme başarısız) ──► [Past Due] — 3 gün retry, sonra [Suspended]
```

**State machine:**
- `trial` — 7 gün, bitişte auto → `active`
- `active` — ödeme güncel, premium açık
- `cancel_scheduled` — kullanıcı iptal etti, current_period_end'e kadar aktif
- `past_due` — ödeme başarısız, 3 gün retry window
- `cancelled` — abonelik tamamen kapalı, premium kapalı

---

## 5. Ödeme Sayfası UI

**Mevcut:** `app/checkout/page.tsx` — Session 34'te placeholder oluşturuldu (mailto info@doctopal.com + console.log analytics).

**Hedef:**
1. Plan kartları — seçili plan highlight, aylık/yıllık toggle
2. "7 Gün Ücretsiz Dene" CTA → Iyzico hosted form'a yönlendir
3. Aile plan için "3 profil üyelik" açıklayıcı
4. KVKK aydınlatma linki (Finansal Veri §2-g)
5. "Mesafeli Satış Sözleşmesi" checkbox (taslak mevcut, şirket tescili sonrası aktif)
6. Güvenlik rozeti (Iyzico + PCI-DSS + 3D Secure)

---

## 6. API Endpoint'leri

### 6.1 `POST /api/checkout/create`

**Input:**
```json
{ "plan": "individual_monthly" | "individual_yearly" | "family_monthly" | "family_yearly", "trial": true }
```

**Flow:**
1. Bearer auth (user authenticated)
2. Plan price lookup (constants)
3. Iyzico `checkoutFormInitialize` çağrısı:
   ```js
   {
     locale: "tr",
     conversationId: `sub_${user.id}_${Date.now()}`,
     price: "149.00",
     paidPrice: "149.00",
     currency: "TRY",
     basketId: `${plan}_${user.id}`,
     paymentGroup: "SUBSCRIPTION",
     callbackUrl: "https://doctopal.com/api/webhook/iyzico",
     // user + billing info
   }
   ```
4. Response: `{ paymentPageUrl, token }`
5. Client redirect → Iyzico hosted page

### 6.2 `POST /api/webhook/iyzico`

**Flow:**
1. Iyzico'dan IPN (Instant Payment Notification) gelir — body + header signature
2. HMAC SHA1 doğrulama: `iyzipay-authentication` header vs `base64(hmac(secret, request_body))`
3. Başarılı ödeme → `subscriptions` insert / update:
   - `status = 'active'` (trial yoksa) veya `'trial'`
   - `trial_started_at`, `current_period_end`
   - `iyzico_subscription_id`
4. `transactions` insert (tutar, status, iyzico_txn_id)
5. Başarısızlık → log + Sentry + kullanıcıya mail (Resend)
6. Response 200 OK (Iyzico'dan retry önlemek için)

### 6.3 `POST /api/subscription/cancel`

**Input:** `{ subscription_id }`

**Flow:**
1. Bearer auth + sahiplik kontrolü
2. Iyzico `subscriptionCancel` çağrısı
3. DB `subscriptions.status = 'cancel_scheduled'`, `cancel_at_period_end = true`
4. Bildirim mail (Resend): "İptal alındı, dönem sonuna kadar Premium açık kalır"

### 6.4 `GET /api/subscription/status`

**Response:**
```json
{
  "status": "active" | "trial" | "cancel_scheduled" | "past_due" | "cancelled",
  "plan": "individual_monthly" | ...,
  "trial_ends_at": "...",
  "current_period_end": "...",
  "cancel_at_period_end": false
}
```

---

## 7. Veritabanı Şema Taslakları

### 7.1 `subscriptions` (YENİ)

```sql
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN (
    'individual_monthly', 'individual_yearly',
    'family_monthly', 'family_yearly'
  )),
  status TEXT NOT NULL CHECK (status IN (
    'trial', 'active', 'cancel_scheduled', 'past_due', 'cancelled'
  )),
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  iyzico_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: sadece service-role (webhook)
-- Client direkt mutate edemez; cancel endpoint üzerinden yapılır
```

### 7.2 `transactions` (YENİ)

```sql
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'refunded', 'pending')),
  iyzico_transaction_id TEXT UNIQUE,
  card_mask TEXT, -- son 4 hane, "**** **** **** 1234"
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
```

### 7.3 `invoices` (YENİ — opsiyonel ilk faz)

```sql
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  pdf_url TEXT, -- Supabase Storage URL (ilk faz: bu alan boş, PDF mail ile gönderilir)
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);
```

**Saklama süresi:** VUK Md.253 — 10 yıl. Cron job her 10 yılın sonunda silebilir. Pratikte şirket yaşı boyunca tutulur.

### 7.4 Mevcut `family_groups.plan_type` ile bağlantı

`family_groups.plan_type` (Session 33): Aile Premium aktif mi? Ödeme başarılı + `plan_type='family_monthly'/'family_yearly'` → `family_groups` güncellenir (aile sahibinin owner_id'sine bağlı):
```sql
UPDATE family_groups SET plan_type = 'family_premium', plan_expires_at = NEW.current_period_end WHERE owner_id = NEW.user_id;
```

Bireysel Premium için `user_profiles`'a yeni kolon eklenebilir:
```sql
ALTER TABLE user_profiles ADD COLUMN individual_premium_active BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN individual_premium_expires_at TIMESTAMPTZ;
```

`getUserEffectivePremium()` helper (Session 33) güncellenir: individual OR family_premium → Premium.

---

## 8. KVKK Uyumlu Ödeme Verisi İşleme

**Mevcut Aydınlatma:**
- §2-g Finansal Veri kategorisi (v2.1)
- §5 Iyzico aktarıcısı (v2.1, SCC yurtiçi)
- §6 Saklama süresi: ödeme verisi 10 yıl (VUK Md.253)

**Yeni rıza akışı (Iyzico aktif olunca):**
1. `/checkout` sayfasında plan seçildikten sonra **"Mesafeli Satış Sözleşmesi"** (mevcut taslak — Session 34) + **"Ön Bilgilendirme Formu"** checkbox
2. Onaylandıktan sonra Iyzico hosted form açılır
3. Iyzico'da kart bilgisi girildikten sonra `3D Secure` doğrulama (Iyzico otomatik)
4. Ödeme başarılı → `transactions` satırı + user'a mail makbuz

**Veri minimumu:**
- DoctoPal sadece: ödeme tutarı, durum, abonelik dönemi, son 4 hane kart mask, Iyzico txn ID, fatura
- DoctoPal'da ASLA: tam kart numarası, CVV, kart sahibinin TC kimliği
- Kart bilgisi Iyzico'da (PCI-DSS seviyeleri ile) saklanır

---

## 9. Fatura Otomasyonu

### 9.1 İlk faz (MVP): PDF + E-mail

1. Ödeme başarılı → `transactions` insert
2. Backend PDF üretimi (`@react-pdf/renderer`, DoctoPal logosu + şirket bilgileri):
   - Fatura numarası (seri: A-000001)
   - Tarih
   - Ürün: "DoctoPal Bireysel/Aile Premium — Aylık/Yıllık"
   - Tutar (KDV dahil %20)
   - Kart son 4 hane
   - Iyzico txn referansı
3. Supabase Storage'a kaydet (`invoices/{user_id}/{invoice_id}.pdf`)
4. `invoices` tablo satırı + `pdf_url`
5. Resend mail: "Premium aboneliğiniz için faturanız ekte"

### 9.2 İkinci faz: E-Fatura (GİB)

- GİB Mükellef statüsü kazanılınca
- E-fatura entegrasyonu (Foriba, BulutSerisi, vb. aracılığıyla)
- Otomatik e-fatura kesimi + GİB'e aktarım
- Kullanıcı isterse PDF kopyası yine mail ile

---

## 10. Go-Live Check-list

### Tescil sonrası 1. hafta
- [ ] Iyzico merchant hesabı onaylandı
- [ ] `IYZICO_API_KEY` + `IYZICO_SECRET_KEY` env'e eklendi (Vercel + local)
- [ ] Sandbox endpoint'ler test edildi (create checkout + webhook + cancel)
- [ ] `subscriptions`, `transactions`, `invoices` migrations Supabase'de apply
- [ ] RLS policy doğrulama + defense-in-depth webhook'ta

### Tescil sonrası 2. hafta
- [ ] Production Iyzico key'lerine geçiş
- [ ] İlk canlı ödeme testi (kurucu kart ile, sonra iade)
- [ ] Fatura PDF template + Resend mail akışı
- [ ] Rıza UI: Mesafeli Satış + Ön Bilgilendirme checkbox aktif
- [ ] KVKK Aydınlatma v2.2+ — ödeme akışı ek detay eklenmişse
- [ ] Sentry alert: webhook failure, transaction timeout

### Tescil sonrası 3. hafta — Beta lansman
- [ ] Dashboard banner: "Premium'a geçin, 7 gün ücretsiz"
- [ ] Mevcut Aile Premium ve Bireysel Premium aktivasyon UI'ı
- [ ] Monitoring: Iyzico dashboard + DoctoPal Sentry daily rapor
- [ ] Müşteri desteği e-mail template (iptal, iade talebi, ödeme sorunu)

---

## 11. Risk + Rollback

**Risk:** Webhook downtime → kullanıcı ödeme yaptı ama Premium açılmadı.
**Önlem:** Iyzico dashboard'dan manuel tetikleme + webhook retry (Iyzico 3 gün boyunca tekrar dener) + cron job her 6 saatte `transactions` ile `subscriptions` senkronizasyonu.

**Risk:** İade talebi (14 gün cayma hakkı — Mesafeli Satış).
**Önlem:** Iyzico admin panel refund + `transactions.status='refunded'` + `subscriptions.status='cancelled'` + Premium özelliklerini geri çek.

**Rollback (acil durumda):**
- Iyzico sandbox'a anında geri dön (env var swap)
- Mevcut abonelere "Sistem bakımda, ödeme servisi geçici kapalı" banner
- `subscriptions.status='active'` olanlar Premium açık kalır, yeni ödeme alınmaz

---

## 12. Bu Doküman Ne Zaman Aktif Olur

1. **Şirket tescili tamam** → 1. başvuru açılır
2. **Iyzico onay** → 2. sandbox entegrasyon başlar
3. **Sandbox başarılı** → 3. production key + migrations → beta lansman

Claude Code bu aşamada **uygulama kodunu** yazacak. Bu doküman **rehber** olarak referans alınır; tescil sırasına göre güncellenir (v1.1, v1.2 vb.).

---

**Hazırlayan:** Claude Code (Session 39 C4, 21 Nisan 2026)
**Son güncelleme:** Session 39 C4 — Taslak v1.0
**Review:** İpek (tescil sonrası avukat/muhasebeci onayı ile v1.1'e bump)
