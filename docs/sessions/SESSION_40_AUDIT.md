# Session 40 — Dashboard Audit

**Tarih:** 22 Nisan 2026
**Başlangıç commit:** `cb5a914` (Session 39 bilingual search hotfix sonu)

---

## Metodoloji

1. `app/dashboard/` → sadece `/` redirect → İpek'in "dashboard altı" listesi gerçekte top-level auth-gated route'lar.
2. Route envanteri (9): `app/page.tsx`, `app/profile/page.tsx`, `app/calendar/page.tsx`, `app/family-health-tree/page.tsx`, `app/medication-hub/page.tsx`, `app/prospectus-reader/page.tsx`, `app/health-assistant/page.tsx` + `components/chat/ChatInterface.tsx`, `app/settings/page.tsx`, `app/aydinlatma/page.tsx` + ilgili `components/legal/AydinlatmaPopup.tsx`, ayrıca dashboard-wide `components/layout/Header.tsx` + `components/layout/CommandPalette.tsx`.
3. Statik audit: 2 paralel Explore agent + manuel verify (false positive filtresi) + tsc/lint baseline.
4. Baseline'da tsc 0 error, eslint 127 error (çoğu kütüphane — `lib/embeddings.ts`, `lib/translations.ts`, `lib/health-integrations.ts`, `lib/use-effective-premium.ts`, `scripts/*.js` — **Session 40 kapsamı dışında**, ayrı bir cleanup sprint gerekir).
5. Agent bulguları manuel doğrulandı — 15 ham bulgudan **8 gerçek bug** kaldı (7 false positive elendi).

---

## Özet

**Toplam gerçek bug: 7**
- **P0: 0** (kritik runtime crash / veri kaybı / güvenlik yok)
- **P1: 4** (görünür hata — SSR mismatch, UX flash, non-deterministic ID)
- **P2: 3** (kozmetik — console.log hijyeni, edge-case defansif guard)

**Fix planı:**
- P1'lerin tamamı bu session'da düzeltilecek (4 commit).
- P2'lerin 2'si düzeltilecek (console log hijyeni + fileToBase64 guard — düşük risk, aynı session'da götürülebilir).
- P2-3 (parseInt radix, line 470) aşağıda zaten açıklandığı gibi modern JS'de pratik zararsız; ayrı commit'e gerek yok → P1-4 fix ile birlikte tek parçada alınacak.

**Kapsam dışı (sonraki iterasyon):**
- ESLint 127 error (baseline). Library dosyaları ayrı bir temizlik gerektirir; Session 40 hedef "dashboard bug audit" olduğu için bunlar `docs/sessions/SESSION_40_AUDIT.md` içinde ayrı bir notla kayıt edildi.

---

## Bug Listesi

### BUG-001 [P1] — Calendar: `useState(new Date())` SSR hydration mismatch

- **Sayfa:** `/calendar`
- **Dosya:** [app/calendar/page.tsx:478](app/calendar/page.tsx:478)
- **Tetikleyici:** Sayfa ilk yüklemede (SSR → hydrate)
- **Beklenen:** Server render ve client hydrate aynı tarih string'ini üretmeli
- **Gözlenen:** `useState(new Date())` server render zamanı ve client hydrate zamanı arasında en az milisaniye farkı → React hydration warning + görsel tutarsızlık (tam gün sınırında gün kayması)
- **Kanıt:**
  ```ts
  const [selectedDate, setSelectedDate] = useState(new Date())
  ```
- **Tahmini fix:** `useState<Date | null>(null)` + `useEffect(() => setSelectedDate(new Date()), [])` ile client-only initialize. Consumer'lar zaten `selectedDate ?? new Date()` fallback alabilir ya da loading skeleton.

### BUG-002 [P1] — Calendar: `Math.random()` ICS UID non-deterministic

- **Sayfa:** `/calendar` (ICS export butonu)
- **Dosya:** [app/calendar/page.tsx:46](app/calendar/page.tsx:46)
- **Tetikleyici:** Kullanıcı "Takvime Aktar" (ICS indirme) yapınca
- **Beklenen:** Aynı event için her export'ta aynı UID → calendar sync duplicate önlenmeli
- **Gözlenen:** `UID:${evt.event_date}-${Math.random()...}` — her export farklı UID → Google/Apple Calendar import ederken aynı event için iki kayıt oluşur
- **Kanıt:**
  ```ts
  `UID:${evt.event_date}-${Math.random().toString(36).slice(2)}@doctopal.com`
  ```
- **Tahmini fix:** Stabil hash kullan — `${evt.event_date}-${evt.event_type}-${(evt.event_time || "").replace(":", "")}-${evt.title.length}` (deterministic).

### BUG-003 [P1] — Dashboard: `getTimeEmoji` effect flash

- **Sayfa:** `/` (authenticated home)
- **Dosya:** [app/page.tsx:583](app/page.tsx:583)
- **Tetikleyici:** Sayfa ilk yüklemede
- **Beklenen:** Saat emoji doğrudan render'da hesaplanmalı, flash olmadan
- **Gözlenen:** `useState("")` → `useEffect(() => setTimeEmoji(getTimeEmoji()), [])` — server render'da boş string, client hydration'dan sonra effect tetiklenip saat-bazlı emoji atanıyor → kısa flash (boş → 👋 → 🌅/☀️/🌙)
- **Kanıt:**
  ```ts
  useEffect(() => { setTimeEmoji(getTimeEmoji()); }, []);
  ```
- **Tahmini fix:** `useState(() => typeof window === "undefined" ? "" : getTimeEmoji())` ya da SSR-safe: `const timeEmoji = useMemo(() => mounted ? getTimeEmoji() : "👋", [mounted])`. `mounted` state ile client-only.

### BUG-004 [P1] — medication-hub: `new Date()` at render body causes SSR mismatch

- **Sayfa:** `/medication-hub`
- **Dosya:** [app/medication-hub/page.tsx:327](app/medication-hub/page.tsx:327)
- **Tetikleyici:** Sayfa load — render body'de `const now = new Date()` + `currentHour = now.getHours()`
- **Beklenen:** `nextSlot` hesabı SSR/client aynı saat döndürmeli
- **Gözlenen:** Render body'de her mount'ta yeniden çalışır → SSR anındaki server saati vs client hydrate saati farklı → "Sıradaki Doz" vurgusu yanlış slot'a düşebilir + React hydration warning. Ayrıca [line 470](app/medication-hub/page.tsx:470) `parseInt(slot.time.split(":")[0])` radix'siz (P2'ye bakınız).
- **Kanıt:**
  ```ts
  const now = new Date();
  const currentHour = now.getHours();
  const nextSlot = slots.find(s => {
    const slotHour = parseInt(s.time.split(":")[0] || "0", 10);
    return slotHour >= currentHour;
  });
  ```
- **Tahmini fix:** `currentHour` state olarak tut, `useEffect(() => setCurrentHour(new Date().getHours()), [])` ile client-only init. Başlangıç değeri `null` + render'da `nextSlot = currentHour === null ? null : slots.find(...)`. Ayrıca line 470 `parseInt(..., 10)` radix ekle (P2-3 absorbed).

### BUG-005 [P2] — Console.log hijyeni: 7 adet non-KVKK debug logs

- **Sayfalar:** `/` (dashboard home) + chat interface
- **Dosyalar ve satırlar:**
  - [app/page.tsx:409](app/page.tsx:409) `console.error("[Dashboard] Streak fetch error:", err)`
  - [app/page.tsx:498](app/page.tsx:498) `console.warn("[dashboard] toggle blocked — no edit permission...")`
  - [app/page.tsx:982](app/page.tsx:982) `console.warn("[aydinlatma] no session, skip persist")`
  - [app/page.tsx:991](app/page.tsx:991) `console.error("[aydinlatma] persist failed", res.status, ...)`
  - [app/page.tsx:994](app/page.tsx:994) `console.error("[aydinlatma] acknowledge error", err)`
  - [components/chat/ChatInterface.tsx:442](components/chat/ChatInterface.tsx:442) `console.error("Chat error:", error)`
  - [components/chat/ChatInterface.tsx:752](components/chat/ChatInterface.tsx:752) `console.error("[Chat] consent save error:", err)`
- **Tetikleyici:** Hata durumlarında her biri üretim console'una log düşer
- **Beklenen:** CLAUDE.md rule 5 — sadece `[KVKK-*]` prefix'li audit logs kalabilir; debug logs silinmeli veya koşullu (`NODE_ENV === 'development'`) olmalı
- **Gözlenen:** Üretimde user-agnostic console kirliliği; ayrıca KVKK Üretken YZ Rehberi kapsamında "gereksiz log = veri sızıntısı riski"
- **Tahmini fix:** 7 çağrıyı koşullu wrap: `if (process.env.NODE_ENV === 'development') console.error(...)` — ya da tamamen kaldır, Sentry zaten hata yakalıyor ([lib/api-helpers.ts](lib/api-helpers.ts) + existing Sentry setup).

### BUG-006 [P2] — ChatInterface fileToBase64 unguarded split[1]

- **Sayfa:** `/health-assistant`
- **Dosya:** [components/chat/ChatInterface.tsx:46](components/chat/ChatInterface.tsx:46)
- **Tetikleyici:** Kullanıcı chat'e dosya upload eder ve FileReader sonucu beklenen data URL formatında değilse
- **Beklenen:** Format hatalı ise Promise reject ile temiz hata mesajı
- **Gözlenen:** `result.split(",")[1]` undefined dönebilir → `resolve(undefined)` → sonraki fetch call'u `base64: undefined` ile API'ye gider → 400 veya boş payload. Crash değil ama sessiz hata.
- **Kanıt:**
  ```ts
  const result = reader.result as string;
  const base64 = result.split(",")[1];
  resolve(base64);
  ```
- **Tahmini fix:** `if (!base64) { reject(new Error("Invalid data URL")); return; }` guard.

### BUG-007 [P2] — medication-hub parseInt missing radix

- **Sayfa:** `/medication-hub`
- **Dosya:** [app/medication-hub/page.tsx:470](app/medication-hub/page.tsx:470)
- **Tetikleyici:** Slot render'ında `isPast` hesaplaması
- **Beklenen:** `parseInt(str, 10)` ile base-10 string → integer
- **Gözlenen:** `parseInt(slot.time.split(":")[0])` — radix eksik. Modern JS motorlarında ES5+ davranışı `"08"` → `8` (doğru) ama tarayıcı/runtime varyasyonu risk. Line 330'da doğru yapılmış (radix 10), 470'te unutulmuş.
- **Kanıt:**
  ```ts
  const isPast = parseInt(slot.time.split(":")[0]) < currentHour;
  ```
- **Tahmini fix:** `parseInt(slot.time.split(":")[0], 10)`. BUG-004 fix'i ile aynı commit'te gitsin (tek dosya, tek konu).

---

## False Positive'ler (agent raporundan filtrelenen)

Raporlama tutarlılığı için kayıt:

- **FP-A** ChatInterface.tsx:231 `invite_email.split` null deref → Optional chain `?.split("@")` short-circuits, takip eden `[0]` access için `undefined[0]` okuma değil expression sonucu (`undefined?.split` → `undefined`, sonra `.[0]` değil `[0]` — optional chain semantikleri zinciri atlatır). Test: `null?.split("@")[0]` → `undefined`, crash yok.
- **FP-B** Header.tsx:80 localStorage SSR → Çağrı `useEffect` içinde (client-only). SSR'da çalışmaz.
- **FP-C** AydinlatmaPopup.tsx:39 CONSENT_VERSIONS fallback → `lib/consent-versions.ts` `as const` — TypeScript `aydinlatma` key garanti. Runtime'da undefined olamaz.
- **FP-D** Settings password change family member bypass → `supabase.auth.updateUser` caller'ın kendi session token'ıyla çalışır; family member'ın şifresini değiştiremez. UI karışıklığı olabilir (UX bug) ama permission bypass yok — P0 değil, opsiyonel P2 UX iyileştirmesi (gizle/disable).
- **FP-E** Calendar stale closure fetchProfileMeds → `fetchProfileMeds` `useCallback([targetId])` → identity `targetId` değişince yenilenir → useEffect tetiklenir. Stale kapanış yok.
- **FP-F** Calendar JSON.parse line 602/615 → `try/catch` zaten sarılı ([app/calendar/page.tsx:600](app/calendar/page.tsx:600), 613).
- **FP-G** Dashboard vaccine banner dismissed Number() → `Number("") || 0` = 0, `NaN && ...` short-circuits → logic doğru çalışır.
- **FP-H** Dashboard hour state null guard → Line 584: `useEffect(() => setHour(new Date().getHours()), [])` + consume site'da `hour === null ? "morning" : ...` guard var.

---

## Session 32/39 Regression Kontrol

| Kontrol | Durum |
|---|---|
| Session 32 AuthContext fetchProfile in-flight Map guard | ✅ CLEAN (dokunulmamış) |
| Session 32 profile cache TTL 30dk + visibility handler | ✅ CLEAN |
| Session 36 water_intake `.maybeSingle()` | ✅ CLEAN |
| Session 36 daily-log Bearer header | ✅ CLEAN |
| Session 38 AI kalite (prompts.ts) | ✅ CLEAN (kapsam dışı + dokunulmamış) |
| Session 39 C1 safety template + chat route | ✅ CLEAN |
| Session 39 C2 FamilyHistorySection + sessionStorage draft | ✅ CLEAN |
| Session 39 C3 AydinlatmaPopup v2.2 dynamic version | ✅ CLEAN |
| Session 40 CommandPalette bilingual search | ✅ CLEAN |

Regression yok.

---

## Fix Planı

7 bug → 5 commit (bazı aynı-dosya bug'ları aynı commit'te):

1. **`fix(calendar): BUG-001 — SSR-safe selectedDate state`** (BUG-001)
2. **`fix(calendar): BUG-002 — deterministic ICS UID`** (BUG-002)
3. **`fix(dashboard): BUG-003 — compute greeting emoji without effect flash`** (BUG-003)
4. **`fix(medication-hub): BUG-004 + BUG-007 — SSR-safe currentHour + parseInt radix`** (BUG-004 + BUG-007 aynı dosya aynı alan)
5. **`chore(logs): BUG-005 + BUG-006 — dashboard console.log hygiene + fileToBase64 guard`** (BUG-005 + BUG-006 düşük risk, defansif)

Her fix sonrası `tsc --noEmit`, son fix sonrası `npm run build` temiz olmalı.

Status işaretleri:

- BUG-001 ✅ FIXED — commit: `a198d3f` (calendar selectedDate lazy-init + effect)
- BUG-002 ✅ FIXED — commit: `84bc5af` (ICS UID deterministic hash)
- BUG-003 ✅ FIXED — commit: `01d15e0` (timeEmoji derived from hour state, dead getTimeEmoji fn removed)
- BUG-004 ✅ FIXED — commit: `ac64867` (currentHour state + setInterval 60s refresh)
- BUG-005 ✅ FIXED — commit: `44aefdc` (5 dashboard + 2 chat console calls wrapped with `process.env.NODE_ENV === "development"`)
- BUG-006 ✅ FIXED — commit: `44aefdc` (fileToBase64 Promise reject on missing base64)
- BUG-007 ✅ FIXED — commit: `ac64867` (parseInt radix 10 + null-safe isPast)

**Final durum:** 7/7 gerçek bug FIXED. Push sonrası canlıda regression testi önerilir:
- `/calendar` — gece yarısı civarında hydration warning kontrolü (BUG-001), ICS export → aynı event tekrar export → Google Calendar duplicate olmamalı (BUG-002).
- `/` (dashboard) — ilk yüklemede emoji flash gözlemle (BUG-003), console production bundle sessiz olmalı (BUG-005).
- `/medication-hub` — saat değişimi (örn. 17:59 → 18:00) → nextSlot otomatik değişmeli, her 60sn refresh (BUG-004).
- `/health-assistant` — malformed file upload (örn. empty file) → "Invalid data URL" hatası UI'da (BUG-006).

**Ertelenenler:**
- ESLint 127 error (library dosyaları) → Session 41+ ayrı bir temizlik sprint'i. `lib/embeddings.ts`, `lib/translations.ts`, `lib/health-integrations.ts`, `lib/use-effective-premium.ts`, `scripts/*.js`. Dashboard ile bağlantılı değil.
- FP-D (Settings password change UX karışıklığı) → P2 UX iyileştirmesi olarak kayıtlı; teknik bug değil, aile üyesi görüntülemesinde "password değiştir" bölümünü disable etmek veya gizlemek düşünülebilir. Session 41'e.
