# F-HEALTH-CLAIMS-001 Master Plan

> Plan dosyası bu task için overwrite edildi. Final çıktı:
> [docs/plans/F-HEALTH-CLAIMS-001-master-plan.md](docs/plans/F-HEALTH-CLAIMS-001-master-plan.md)
> ExitPlanMode + onay sonrası user'ın istediği path'e kopyalanacak.

## Context

Health claims audit (Session 46 F-HEALTH-CLAIMS-001) tamamlandı. Bulgular:
- 0 direkt "tedavi/şifa/kür" iddiası ✅
- 2 direkt functional claim vulnerable audience'lara (cortisol/energy)
- 11 i18n string (örnek soru formatı, çoğu yumuşak risk)
- 4 endpoint prompt EFSA gating eksik (supplement-check 🔴 CRITICAL, anti-inflammatory 🔴 HIGH, daily-care-plan ⚠️ MEDIUM, blood-analysis ⚠️ MEDIUM)
- 5+ sayfada AIDisclaimer mount eksik (anti-inflammatory, mental wellness, supplement compare, sleep analysis, sports performance)
- Output safety filter Layer 3 "destekler + mekanizma" pattern'i yakalamıyor
- DB cache: localStorage AI output cache YOK; query_history fresh-render → backfill gerekmez

Audit raporu kaydı: `docs/audits/F-HEALTH-CLAIMS-001-audit-report.md` (henüz repo'ya commit edilmemiş — implement aşamasında oluşturulacak veya kullanıcı tarafından eklenecek).

Bu master plan, audit F bölümündeki 6 fix kategorisini **3 alt-sprint** + 1 opsiyonel takip sprint'ine böler. Avukat dependency'sine göre execution order yeniden düzenlenir.

---

## Sprint splitting

### 🚀 6.2 — Disclaimer mount (`~1.5h, AVUKAT GEREKTİRMEZ`) **HEMEN BAŞLA**

**Ne yapılacak:** 5 sayfaya `<AIDisclaimer />` mount eklenir. Mevcut component prop minimal (sadece `compact` ve `responseId`); page-level mount = `compact=false`. Ekstra prop (vulnerability/context key) gerek YOK — AIDisclaimer şu an tek bir generic disclaimer text basıyor (TR/EN), legal advisor "vulnerable audience qualifier" gerektirirse 6.2.5 takip sprint olarak component'e prop eklenir.

**Bu sprint avukat öncesi başlatılabilir** çünkü:
- Mevcut disclaimer text TİTCK baseline'ında zaten geçerli
- Ekstra koruma her zaman + her sayfada — fazlalık değil
- Soru 7 (disclaimer pozisyon) sadece pozisyonu etkiler (top vs bottom); avukat değiştirir derse 1-line move

**Risk:** Avukat "her sayfada specific qualifier şart" derse 6.2.5'te tekrar mount edilen component'e geri dönülür. Olası rework: 30 dk.

---

### ⚖️ Avukat görüşmesi — 7 soruya cevap

**Pre-condition:** Audit raporu + 7 soru paketi avukata gönderilmiş.

**Cevap matrisi (her soru hangi alt-sprint'i unlock eder):**

| # | Soru | Açar | Implementation impact |
|---|---|---|---|
| 1 | Türkiye TİTCK zorunlu disclaimer tam metni? | 6.2 + 6.3 | AIDisclaimer text revize gerekirse 6.2.5 follow-up; i18n key'leri 6.3'te güncellenir |
| 2 | Question-format example'lar safer mı? | 6.3 | "Omega-3 iltihabı azaltır mı?" gibi 8 soru kalsın mı yoksa rephrase mı |
| 3 | Vulnerable audience qualifier? | 6.3 | "Cortisol düşürür" + "Enerji artırır" → ekstra qualifier mı, full removal mı |
| 4 | Eski query_history rows ne yapılmalı? | 6.4 (yeni) | Backfill / retention / selective cleanup — yeni alt-sprint'in scope'u |
| 5 | Cache risk (localStorage yok, DB rows var)? | 6.4 | UI mount güncel disclaimer gösteriyor — bu yeterli mi yoksa ek backfill gerek mi |
| 6 | EFSA scope coverage (Türkiye binding)? | 6.1 | EFSA whitelist içeriği: pure EFSA mı, Tarım Bakanlığı approved combo mu |
| 7 | Disclaimer pozisyonu (üst+alt repeat?) | 6.2 (revize) | Mevcut bottom-only pattern OK mi yoksa top+bottom mu |

---

### 🔧 6.1 — Prompt centralize + EFSA whitelist (`~3-4h, AVUKAT SONRASI`)

**Ne yapılacak:**
1. **Endpoint prompt rewrite** (3 endpoint, hepsi inline → centralized):
   - `app/api/supplement-check/route.ts` — `recommendedDose` field REMOVE; `personalizedNote` EFSA whitelist gating; `lib/prompts.ts`'e taşı
   - `app/api/anti-inflammatory/route.ts` — `dose` field REMOVE; `benefit` EFSA gating
   - `app/api/daily-care-plan/route.ts` — DAILY_CARE_PROMPT centralize + nutrition card mechanism language guard
   - (Opsiyonel: `app/api/blood-analysis/route.ts` — `reason` field EFSA cross-check)
2. **EFSA approved claims whitelist** YENİ: `lib/efsa-approved-claims.ts`
   - TR/EN approved claims registry (~30-50 entry)
   - Format: `{ ingredient: string, claim: string, evidenceGrade: "A"|"B"|"C", scope: string[] }`
   - SYSTEM_PROMPT'a referans olarak inject edilir
   - Output filter Layer 3.5'te cross-check
3. **Output filter Layer 3 extend** ([lib/output-safety-filter.ts](lib/output-safety-filter.ts)):
   - "destekler + mekanizma" regex pattern
   - EFSA whitelist cross-check: ingredient adı EFSA listede mi → varsa allow, yoksa "araştırmalarda incelenmiştir" rewrite
4. **SECURITY_PREAMBLE'a** EFSA constraint paragrafı

**Pre-conditions:**
- ✅ Avukat soru 1 cevabı (TİTCK disclaimer text — output filter rewrite text'i için)
- ✅ Avukat soru 6 cevabı (EFSA scope — Türkiye binding mi, hibrit mi)

**Risk:** EFSA whitelist scope avukat netleştirmeden başlanırsa hem fazla hem eksik approved claim listelenir → revize döngüsü.

---

### 🛡️ 6.3 — Hardcoded string fix (`~1h, KISMEN AVUKAT SONRASI`)

**Ne yapılacak:**
1. **2 direct claim revize** ([lib/translations/health.ts](lib/translations/health.ts)):
   - Line 235 "Cortisol düşürür" → avukat soru 3 cevabına göre rephrase veya remove
   - Line 199 "Enerji artırır" → aynı
2. **C vitamini emilim claim** ([lib/translations/commonToolKeys.ts](lib/translations/commonToolKeys.ts) line 1046, 1600):
   - "C vitamini emilimi artırır" → EFSA approved class ✓ (ascorbic acid → iron absorption EFSA approved). Yine de qualifier ekle: "Araştırmalarda demir emilimine katkısı belgelenmiştir."
3. **8 soru-formatı example carousel** ([lib/translations/tools.ts](lib/translations/tools.ts) lines 182, 258-263, 231):
   - Avukat soru 2 cevabına göre kalsın / rephrase / remove
   - Eğer kalır: "Soru" framing güçlendir (örn. "Omega-3 iltihabı azaltır mı?" → "Omega-3 ve iltihap üzerine araştırmalar ne diyor?")

**Pre-conditions:**
- ✅ Avukat soru 2 cevabı (question-format kabul edilebilir mi)
- ✅ Avukat soru 3 cevabı (vulnerable audience qualifier)

**Risk:** Soru 2'ye "rephrase yeterli" cevap gelirse 8 string × 2 dil = 16 satır revize, 10 dk. "Tümü kaldırılsın" cevabı gelirse landing carousel'da boşluk → alternatif content gerekli.

---

### 📦 6.4 — Eski response_text + cache stratejisi (`~30dk-2h, AVUKAT SONRASI, opsiyonel sprint`)

**Pre-condition:**
- ✅ Avukat soru 4 cevabı (eski rows ne yapılmalı)
- ✅ Avukat soru 5 cevabı (cache risk seviyesi)

**Olası senaryolar:**
- (a) **"UI mount güncel disclaimer gösteriyor — yeterli"** (önerim, en pratik) → 6.4 SKIP, no-op
- (b) **"Selective cleanup gerekli"** → manuel review + SQL DELETE for treatment-language rows (~1-2h)
- (c) **"Retention policy ekle"** → N gün TTL + nightly cron (~2h, KVKK uyum check)

---

## Dependency graph (execution order)

```
┌──────────────────────────────────────────────────────────┐
│ HEMEN (avukat öncesi, paralel)                           │
│ ┌──────────────────────────────────┐                     │
│ │ 6.2 — Disclaimer mount (5 sayfa) │                     │
│ │ ~1.5h, generic AIDisclaimer      │                     │
│ └──────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ AVUKAT GÖRÜŞMESİ — 7 soru                                 │
│ Pre: audit raporu + soru paketi                           │
│ Süre: 1-3 iş günü (avukat tarafı)                        │
└──────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ 6.1 — Prompt +   │  │ 6.3 — Hardcoded   │
│ EFSA whitelist + │  │ string fix         │
│ Layer 3 extend   │  │ ~1h                │
│ ~3-4h            │  │ Soru 2, 3 cevabı   │
│ Soru 1, 6 cevabı │  │ gerekli            │
└──────────────────┘  └──────────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 6.4 — query_history + cache (opsiyonel)                  │
│ ~30dk-2h, avukat soru 4 + 5 cevabına göre scope          │
└──────────────────────────────────────────────────────────┘
```

**Kritik patika:** 6.2 (paralel) + Avukat (blocker) + 6.1 (paralel 6.3) + 6.4 (opsiyonel) = **~6-9h actual coding** + avukat süresi.

---

## 6.2 — Detaylı implementation plan (HEMEN — research sonrası revize)

### Research bulguları

5 hedef sayfayı kontrol ettim — **gerçek AI fetch yapan 3 sayfa kaldı**, 2 sayfa scope dışı çıktı:

| Sayfa | AI fetch? | Karar |
|---|---|---|
| Anti-inflammatory | ❌ Local `useMemo` only (no API call) | **SKIP** (audit raporu yanlış işaretlemiş) — generic footer disclaimer yeterli |
| Supplement compare | ❌ Local `setTimeout` 3s simulation + `showResults` flag, no API | **SKIP** — AI çıktısı yok |
| Mental Wellness | ✅ `/api/mental-wellness/analyze` | **MOUNT** |
| Sleep Analysis | ✅ `/api/sleep-analysis/analyze` | **MOUNT** |
| Sports Performance | ✅ `/api/sports-performance` (fetch line 132) | **MOUNT** |

**Recovery Dashboard:** `app/recovery-dashboard/page.tsx` repo'da YOK. Sadece `app/api/recovery-dashboard/route.ts` endpoint + `components/recovery/RecoveryScore.tsx` + `BiologicalBudget.tsx` var. Bu component'ler başka sayfada (dashboard?) mount edilmiş olabilir — bu sprint scope dışı, ayrı audit gerekir.

### 3 hedef mount tablosu

| # | Sayfa | Dosya | AI state | Conditional render | responseId |
|---|---|---|---|---|---|
| 1 | **Mental Wellness** | `app/mental-wellness/page.tsx` | `analysis: AnalysisResult \| null` (line 82), `showAnalysis: boolean` | `{analysis && showAnalysis && <AIDisclaimer compact={false} responseId={responseId} />}` | `useMemo(() => crypto.randomUUID(), [analysis])` (analiz değişince yeni id) |
| 2 | **Sleep Analysis** | `app/sleep-analysis/page.tsx` | `analysis: SleepAnalysis \| null` (line 79), `microInsight: string \| null` (line 80) | `{(analysis || microInsight) && <AIDisclaimer compact={false} responseId={responseId} />}` | `useMemo(() => crypto.randomUUID(), [analysis, microInsight])` |
| 3 | **Sports Performance** | `app/sports-performance/page.tsx` | TBD — fetch line 132'de `/api/sports-performance` çağrılıyor, response state field adı implement öncesi tespit edilecek (analyzeResults / aiInsight / data) | `{<state> && <AIDisclaimer compact={false} responseId={responseId} />}` | `useMemo(() => crypto.randomUUID(), [<state>])` |

### Mount pattern (her sayfa için aynı)

```tsx
// Top of file — import
import { AIDisclaimer } from "@/components/ai/AIDisclaimer"
import { useMemo } from "react"  // (eğer yoksa)

// Component içinde — state değişince yeni id
const responseId = useMemo(
  () => crypto.randomUUID(),
  [<aiStateField>], // analysis veya microInsight gibi
)

// Render içinde — page bottom (footer'dan ÖNCE, AI content'in altında)
{<aiStateField> && (
  <AIDisclaimer compact={false} responseId={responseId} />
)}
```

### Mount lokasyonu kuralı

- **Bottom** — content render edildikten sonra okunur ("bu içeriğin niteliği" beyanı)
- Footer disclaimer'dan ÖNCE (eğer page-level footer disclaimer varsa)
- Section wrapper içinde (rounded card / divider) — main content layout'a tutarlı
- Generic disclaimer text, **vulnerability/context prop YOK** (AIDisclaimer şu an sadece `compact` + `responseId` kabul ediyor)

### AIDisclaimer prop seti (mevcut, dokunulmuyor)

```ts
interface AIDisclaimerProps {
  responseId?: string;  // KVKK objection tracking
  compact?: boolean;    // chat bubble vs page-level
}
```

Avukat soru 1 + 3 cevabı specific vulnerable-audience text gerektirirse 6.2.5 takip sprint'inde `vulnerability?: "general" | "mentalHealth" | ...` prop eklenir + i18n `ai.disclaimer.${vulnerability}` key'leri.

### responseId stratejisi (final)

`crypto.randomUUID()` ile **sahte ID** üret per-render. Gerçek AI endpoint response id'sini yakalama YOK (scope creep). Objection form sayfa bazlı telemetry alır: kullanıcı X sayfasında itiraz etti.

**Dependency array:** AI state field'ı (analysis / microInsight gibi) → analiz değişince yeni id üretilir. Aynı analiz için aynı id objection takibinde tutarlılık sağlar.

### Build + tsc

Her edit sonrası zorunlu. Final tsc + npm run build (3 sayfa toplu) → 0 error.

### Commit message

```
feat(disclaimer): mount AIDisclaimer on 3 AI-driven health tool pages with conditional render (F-HEALTH-CLAIMS-001 6.2)
```

Anti-inflammatory ve supplement-compare scope dışı çıktığı için commit message "5 pages" yerine "3 AI-driven pages".

---

## Avukat görüşme paketi referansı

**Dosya:** `docs/legal-advisor-questions.md` (henüz repo'da yok; implement aşamasında oluşturulacak veya user tarafından eklenecek)

**7 soru özeti** (audit raporundan):

| # | Soru | Bağlı sub-sprint | Block status |
|---|---|---|---|
| 1 | TİTCK zorunlu disclaimer tam metni? | 6.2 (revize) + 6.3 | 6.2 generic ile geçici start, soru 1 sonrası refine |
| 2 | Question-format example'lar safer mı? | 6.3 | 6.3 BLOCKER |
| 3 | Vulnerable audience ekstra qualifier? | 6.3 | 6.3 BLOCKER (cortisol/energy claims) |
| 4 | Eski query_history rows ne yapılmalı? | 6.4 (yeni) | 6.4 BLOCKER |
| 5 | Cache risk (localStorage yok, DB rows var)? | 6.4 | 6.4 BLOCKER (scope kararı) |
| 6 | EFSA scope coverage (Türkiye binding)? | 6.1 | 6.1 BLOCKER (whitelist içeriği) |
| 7 | Disclaimer pozisyonu (üst+alt repeat)? | 6.2 (revize) | 6.2 generic mount sonrası refine |

**Implementation için her sorudan ne öğrenmem lazım:**

- **Soru 1:** Mevcut "Bu bilgi yapay zeka tarafından üretilmiştir ve tıbbi tavsiye niteliği taşımaz. Sağlık kararı almadan önce doktorunuza danışın." metni TİTCK için yeterli mi? Spesifik bir Yönetmelik §3 cümlesi gerekli mi?
- **Soru 2:** "Omega-3 iltihabı azaltır mı?" tarzı 8 soru-format string'i kalmalı mı, rephrase ("Omega-3 ile iltihap üzerine araştırmalar") yeterli mi, yoksa tamamen farklı bir example seti mi?
- **Soru 3:** "Cortisol düşürür" / "Enerji artırır" gibi vulnerable audience'a (kanser, yeni ebeveyn) gösterilen direct functional claim'ler için ekstra "araştırmalar gösteriyor ki..." qualifier yeterli mi? Yoksa tamamen kaldırılmalı mı?
- **Soru 4:** ~50K-100K query_history.response_text rows için (a) hiçbir şey yapma — UI güncel disclaimer'ı mount ediyor, (b) selective cleanup (treatment language tarayıp sil), (c) retention policy (N gün TTL) seçeneklerinden hangisi TİTCK + KVKK uyumlu?
- **Soru 5:** localStorage AI cache YOK ama DB rows mevcut. UI'da modern disclaimer mount altında eski response render edilince — bu kombinasyon legal risk taşır mı?
- **Soru 6:** EFSA approved health claims listesi Türkiye'de binding mi yoksa Tarım Bakanlığı'nın kendi listesi mi öncelikli? Hibrit standart kullanmak güvenli mi?
- **Soru 7:** AI çıktısı disclaimer'ı sadece bottom'da yeterli mi yoksa UX trade-off'a değse de top+bottom repeat mi (legal sertlik için)?

---

## Risk register

| # | Risk | Sprint | İhtimal | Mitigation |
|---|---|---|---|---|
| 1 | 6.2 generic disclaimer avukat'a göre yetersiz çıkar → 6.2.5 rework | 6.2 | Orta | AIDisclaimer'a `vulnerability` + `contextKey` prop ekleme planı zaten var. Rework ~30dk. |
| 2 | EFSA whitelist scope avukat netleştirmeden başlanırsa fazla/eksik approved listelenir | 6.1 | Yüksek | 6.1'i avukat sonrasına strict bağla — pre-condition zorunlu. |
| 3 | Question-format example'ların 8'i de kaldırılırsa landing carousel boşluk | 6.3 | Düşük | Yedek soru havuzu hazırlanabilir (KVKK-safe formülasyonlar) |
| 4 | query_history backfill gerekli çıkarsa 6.4 ~2h değil 1+ gün olabilir | 6.4 | Düşük | UI mount yeterli olarak savunma — Soru 4 cevabı bu yaklaşımı validate ederse SKIP |
| 5 | Recovery dashboard sayfası audit'te yanlış işaretlenmiş — implement'te bulunamaz | 6.2 | Düşük | 5 sayfada zaten yeterli kapsam; recovery yoksa atla |
| 6 | Output filter Layer 3 extend regex false positive (legitimate "destekler" dönüştürür) | 6.1 | Orta | Test corpus hazırla — 20 legitimate cümle + 20 risk cümle, ikisinde de doğru davranış kontrol |
| 7 | Avukat süresi uzun (>1 hafta) → 6.1, 6.3, 6.4 hepsi blocked, sadece 6.2 deploy | Cross | Düşük-orta | 6.2 zaten standalone değer ekler; avukat süresi sprint planlamasına engel değil |

---

## Smoke test stratejisi (alt-sprint başına)

### 6.2 (Disclaimer mount)
- Her hedef sayfayı aç → AI sonuç render edildikten sonra disclaimer block görünmeli
- Disclaimer içindeki "Bu değerlendirmeye itiraz et" link → expand → AIObjectionForm açılır
- TR/EN dil toggle → disclaimer text dilini değiştirir
- Mobile responsive — disclaimer kayma/overflow yok
- Lighthouse a11y — `<AlertCircle>` aria-hidden, link focusable

### 6.1 (Prompt + EFSA + filter)
- 3 endpoint için golden path:
  - `/api/supplement-check` — "Bromelain" sorgusu → response'da `recommendedDose` field YOK + claim "araştırmalarda incelenmiştir" rewrite
  - `/api/anti-inflammatory` — turmeric request → `dose` field YOK; "benefit" EFSA approved ise as-is, değilse rewrite
  - `/api/daily-care-plan` — diyabet user → "Cinnamon kan şekerini düşürür" output filter Layer 3 yakalar → rewrite
- Output filter regex test corpus (40 cümle: 20 legitimate + 20 risk) → her ikisinde doğru davranış
- EFSA whitelist coverage: 30 ingredient × tipik claim → approved/non-approved matrisi doğru

### 6.3 (Hardcoded strings)
- Landing page carousel → 8 soru-format kaldı/rephrase'lendi/silindi (avukat kararına göre)
- Cancer support page → "Hafif yürüyüş" claim revised text görünür
- New parent sanctuary → "Meditasyon cortisol" claim revised text
- Med hub → "C vitamini emilimi" + qualifier
- TR + EN dil toggle her revize'de doğru

### 6.4 (eğer scope alır)
- (a) "no-op" cevabı → smoke test SKIP
- (b) "selective cleanup" → SQL count before/after; sample rows manuel verify
- (c) "retention policy" → cron schedule test + timezone awareness

---

## Verification (her sprint sonrası)

```bash
npx tsc --noEmit
npm run build
```

**Manual smoke test matrix:** her sub-sprint'in kendi smoke testi (yukarıda).

**Avukat onay smoke (6.1, 6.3, 6.4 sonrası):**
- 5 örnek senaryoyu avukatla repro et (chat + supplement check + anti-inflammatory + landing + cancer page)
- Her birinde disclaimer + claim language compliance ✓

---

## Commit message stratejisi

| Sprint | Commit message |
|---|---|
| 6.2 | `feat(disclaimer): mount AIDisclaimer on 5 standalone health tool pages (F-HEALTH-CLAIMS-001 6.2)` |
| 6.1 | `feat(safety): EFSA whitelist + prompt centralize + output filter extend (F-HEALTH-CLAIMS-001 6.1)` |
| 6.3 | `fix(claims): revise hardcoded health claims per legal review (F-HEALTH-CLAIMS-001 6.3)` |
| 6.4 | `chore(claims): query_history retention strategy (F-HEALTH-CLAIMS-001 6.4)` (eğer scope alır) |
| Master plan docs commit | `docs: F-HEALTH-CLAIMS-001 master plan + sprint splitting roadmap` |

---

## Rollback

Her sub-sprint atomic commit. `git revert <sha>` ile bağımsız geri alınabilir.

**6.1 rollback** EFSA whitelist + filter regex değişikliklerini geri alır → output filter Layer 3 mevcut "destekler + mekanizma" gap'i tekrar açılır. Risk: bilinen.

**6.2 rollback** mount'ları kaldırır → sayfalar disclaimer'sız kalır. Yüksek hassasiyet, sadece teknik bug için revert.

---

## Plan file → repo path

ExitPlanMode sonrası user onaylayınca, bu plan içeriği `docs/plans/F-HEALTH-CLAIMS-001-master-plan.md` path'ine kopyalanır. Plan dosyası (`.claude/plans/`) ile repo dosyası eşit içerikte tutulur — repo dosyası tracked, history'li, team review için.

**Commit:** `docs: F-HEALTH-CLAIMS-001 master plan + sprint splitting roadmap`
