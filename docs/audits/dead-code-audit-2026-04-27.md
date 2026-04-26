# Dead Code Audit — 27 Nisan 2026

> **Status update — 27 Nisan 2026 sprint sonu:** Bu audit'in (A) kategorisi olan **41 dosya silindi** (commit `8b03a99`, 5,887 satır deletion). (B) korundu (false positive / manual CLI). (C) ve (D) ayrı sprint'ler için bekliyor — Taha onayı + iş kararı gerekiyor. Audit sırasında raporun subtotal aritmetiğinde küçük bir hata yakalandı (6,772 LOC tahmini → gerçek 5,887 LOC sildim) — commit mesajına gerçek sayı yazıldı.

**Tarama tarihi:** 27 Nisan 2026
**Araç:** `npx knip` (geçici, kalıcı kurulum yok)
**Manuel cross-check:** 10+ kritik dosya için actual import grep ile doğrulandı

## Özet Tablo

| Metrik | Değer |
|---|---|
| Knip flagged unused files | **50** |
| False positive (string-runtime / manual CLI) | **4** |
| Gerçek dead file | **46** |
| Gerçek dead LOC (tahmini) | **6,772** (subtotal aritmetiği yanılgılı; gerçek silimde 5,887) |
| Knip flagged unused npm deps | **2** (`pg`, `@nicolo-ribaudo/chokidar-2`) |
| Unlisted dep (package.json hygiene) | **1** (`postcss`) |
| Knip flagged unused exports | **57** |
| Knip flagged unused exported types | **53** |
| Knip flagged duplicate exports | **2** |
| Bundle impact tahmini | **~50-100 KB gzip** (mostly already tree-shaken; main saving = repo cleanliness + 948 KB node_modules) |

---

## (A) Kesinlikle Dead — 41 dosya silindi (commit `8b03a99`)

39 component + 7 lib dosyası audit'lendi, 1 (`lib/affiliate.ts`) defer edildi (chain bağımlılığı). **41 dosya canlıda silindi, build temiz, 241 sayfa parite.**

### Components — Dashboard cards (legacy, dashboard simplification sırasında orphan)

| Dosya | LOC | Son Commit | Tahmini Amaç | Risk |
|---|---|---|---|---|
| `components/dashboard/CalorieCalculator.tsx` | 367 | 2026-04-09 | Kalori hesaplayıcı dashboard kartı | Düşük |
| `components/dashboard/DailySummaryCard.tsx` | 261 | 2026-04-09 | Günlük özet kartı | Düşük |
| `components/dashboard/DarkKnowledgeCard.tsx` | 267 | 2026-04-20 | "Karanlık bilgi" rotation card | Düşük |
| `components/dashboard/MonthlyROICard.tsx` | 264 | 2026-04-09 | Aylık ROI gösterim kartı | Düşük |
| `components/dashboard/QuickActions.tsx` | 188 | 2026-04-09 | Hızlı aksiyon paneli | Düşük |
| `components/dashboard/SOSCard.tsx` | 187 | 2026-04-09 | Acil durum SOS kartı | Düşük |
| `components/dashboard/SymptomPatternCard.tsx` | 185 | 2026-04-09 | Semptom pattern detect | Düşük |

**Subtotal:** 1,719 LOC.

### Components — Calendar / Sleep (eski takvim + sleep iterasyonları)

| Dosya | LOC | Son Commit | Tahmini Amaç | Risk |
|---|---|---|---|---|
| `components/calendar/QuickLogFAB.tsx` | 69 | 2026-04-09 | Floating action button (calendar log) | Düşük |
| `components/calendar/TimeBlockTasks.tsx` | 154 | 2026-04-09 | Zaman bloğu görev listesi (eski) | Düşük |
| `components/calendar/WeeklyStrip.tsx` | 72 | 2026-04-09 | Haftalık şerit görüntü | Düşük |
| `components/sleep/CircadianTimeline.tsx` | 129 | 2026-04-09 | Sirkadiyen ritim timeline | Düşük |
| `components/sleep/SleepSessionLogger.tsx` | 241 | 2026-04-09 | Uyku oturumu kaydedici | Düşük |

**Subtotal:** 665 LOC. Calendar Session 44'te DailyLogsContext'e refactor edildi.

### Components — UI primitives (shadcn fragments)

| Dosya | LOC | Son Commit | Tahmini Amaç | Risk |
|---|---|---|---|---|
| `components/ui/avatar.tsx` | 110 | 2026-04-09 | shadcn Avatar (replaced by AvatarPicker DiceBear) — false positive resolved | Düşük |
| `components/ui/separator.tsx` | 26 | 2026-04-09 | shadcn Separator | Düşük |
| `components/ui/skeleton-card.tsx` | 51 | 2026-04-09 | Loading skeleton card | Düşük |
| `components/ui/EmptyState.tsx` | 84 | 2026-04-09 | Empty state component | Düşük |
| `components/ui/DropdownPortal.tsx` | 76 | 2026-04-09 | Dropdown portal (replaced by base-ui DropdownMenu) | Düşük |
| `components/ui/DrugAlertCard.tsx` | 139 | 2026-04-09 | İlaç alert card (replaced by MedicationInteractionBanner) | Düşük |

**Subtotal:** 486 LOC.

### Components — Diğer feature kalıntıları (17 — PromsSurvey (C)'ye kaydı)

| Dosya | LOC | Son Commit | Tahmini Amaç | Risk |
|---|---|---|---|---|
| `components/FeedbackButton.tsx` | 91 | 2026-04-09 | Floating feedback button | Düşük |
| `components/auth/AuthGuard.tsx` | 47 | 2026-04-16 | Reusable auth/loading gate (Session 32 yazıldı, kullanılmadı) | Düşük |
| `components/chat/SourceCard.tsx` | 63 | 2026-04-09 | PubMed kaynak kartı (chat'te kaldırıldı) | Düşük |
| `components/child-health/PediatricAgePicker.tsx` | 137 | 2026-04-09 | Pediatrik yaş seçici | Düşük |
| `components/common/GuestWall.tsx` | 46 | 2026-04-09 | Guest paywall | Düşük |
| `components/content/SeoAssistant.tsx` | 397 | 2026-04-16 | SEO içerik asistanı (publisher tool) | Düşük |
| `components/family/SOSButton.tsx` | 166 | 2026-04-19 | Family SOS button | Düşük |
| `components/icons/PhytoIcons.tsx` | 319 | 2026-04-09 | PhytoTherapy SVG ikonlar (eski branding) | Düşük |
| `components/illustrations/botanical-hero.tsx` | 108 | 2026-04-09 | Hero botanical illustration | Düşük |
| `components/layout/disclaimer-banner.tsx` | 15 | 2026-04-09 | Eski disclaimer banner | Düşük |
| `components/layout/mega-menu/MegaMenu.tsx` | 190 | 2026-04-09 | Mega menu navigasyon | Düşük |
| `components/life-stages/LifeStagesShell.tsx` | 98 | 2026-04-20 | Life stages shell | Düşük |
| `components/nudge/NudgeBanner.tsx` | 141 | 2026-04-16 | Nudge engine banner | Düşük |
| `components/profile/FamilyManagementSettings.tsx` | 112 | 2026-04-09 | Eski aile yönetim ayarları (replaced) | Düşük |
| `components/share/HealthScoreShareCard.tsx` | 198 | 2026-04-09 | Sağlık skoru paylaşım kartı | Düşük |
| `components/supplements/CategoryBento.tsx` | 81 | 2026-04-09 | Bento layout supplement category | Düşük |
| `components/supplements/SupplementCard.tsx` | 161 | 2026-04-09 | Eski supplement card | Düşük |

**Subtotal:** 2,370 LOC.

### Lib — Helpers / data files (6 — `affiliate.ts` defer)

| Dosya | LOC | Son Commit | Tahmini Amaç | Risk |
|---|---|---|---|---|
| `lib/ai-endpoint-helper.ts` | 62 | 2026-04-16 | AI endpoint helper wrapper | Düşük |
| `lib/analytics.ts` | 42 | 2026-04-09 | Analytics tracker | Düşük |
| `lib/frequency.ts` | 48 | 2026-04-08 | Frequency parsing (replaced by lib/frequency-utils) | Düşük |
| `lib/gemini.ts` | 219 | 2026-04-16 | **Explicitly DEPRECATED** (Session 32, askGemini→askClaude rename) | Düşük |
| `lib/health-connect.ts` | 66 | 2026-04-09 | Apple Health/Google Fit placeholder (replaced by browser-side parsers Session 27) | Düşük |
| `lib/talent-hub-data.ts` | 210 | 2026-04-09 | Talent hub schema | Düşük |

**Subtotal:** 647 LOC.

### Defer (1 dosya — chain dependency)

| Dosya | LOC | Sebep |
|---|---|---|
| `lib/affiliate.ts` | 51 | `components/premium/AffiliateLinks.tsx` (C) tarafından import ediliyor — birlikte silinecek |

**(A) silindi: 41 dosya, 5,887 satır (git diff actual). Risk: tümü düşük, sıfır consumer doğrulandı.**

---

## (B) Muhtemelen Dead — knip flag, ama runtime / manual usage olabilir — DOKUNULMADI

| Dosya | LOC | Son Commit | Neden Şüpheli |
|---|---|---|---|
| `public/sw.js` | 97 | 2026-04-09 | **FALSE POSITIVE** — `components/pwa/ServiceWorkerRegistration.tsx` `navigator.serviceWorker.register("/sw.js")` ile string olarak çağırıyor + `instrumentation-client.ts`'te de var. Knip string literal'i takip edemiyor. **DOKUNMA.** |
| `scripts/run-family-migration.js` | 65 | 2026-04-21 | Manual CLI migration runner. Recent — Session 36'da Supabase migration apply için kullanıldı. **DOKUNMA.** |
| `scripts/run-migration.js` | 56 | 2026-03-25 | Older migration runner. CLI utility. Manual usage muhtemel. |
| `scripts/scan-pages.mjs` | 110 | 2026-03-29 | Page scanner devtool. Ad-hoc CLI. |

**(B) Toplam: 328 LOC across 4 files. Risk: silinirse runtime kırılır (sw.js) veya manual workflow kaybolur.**

---

## (C) Conditional Dead — feature flag / deprecated tier — Taha onayı bekliyor

| Dosya | Bağlam | Geri çağrı senaryosu |
|---|---|---|
| `components/premium/AffiliateLinks.tsx` | Affiliate sistemi suppressed (Session 34 brand minimization) | Premium kategorisi reaktive olursa |
| `components/premium/FakeDoorTest.tsx` | A/B fake door test tool | Yeni feature validation için tekrar kullanılabilir |
| `components/premium/PremiumGate.tsx` | Eski premium gating, replaced by useEffectivePremium | Geri çağrı 0 |
| `components/proms/PromsSurvey.tsx` | PROMs/PREMs (HVHS-derived) | HVHS framework reaktive olursa (avukat sonrası unlikely) |
| `lib/affiliate.ts` | AffiliateLinks ile chain dependency | AffiliateLinks ile birlikte silinecek |

**Karar:** (C) içindekileri silmeden önce iş tarafından "feature road-map'te yok" onayı al.

---

## (D) Generic Unused Exports — dosya kullanılıyor, spesifik export'lar değil — DOKUNULMADI

Knip 57 unused exports + 53 unused types + 2 duplicate exports tespit etti. Dosya silinmez, spesifik export cleanup yapılır.

### Yüksek-değer export cleanups

| Dosya | Unused exports |
|---|---|
| `lib/safety-guardrail.ts` | 10 fonksiyon + 8 type — eski safety lib, replaced by `lib/safety/check-med-interactions.ts` |
| `lib/database.types.ts` | **41 unused type** — büyük çoğunluğu legacy DB schema types (Sprint 1-12), runtime impact 0 |
| `lib/consent-management.ts` | CONSENT_DISCLOSURES, verifyConsentSignature, checkAccess, DPA_CLAUSES + 4 type — eski v1 KVKK consent |
| `lib/notifications.ts` | 6 fonksiyon — replaced by `lib/push-notifications.ts` |
| `lib/push-notifications.ts` | 4 fonksiyon — wired ama notification UI henüz aktif değil |
| `lib/secure-storage.ts` | ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, createAuditEntry — file upload feature scoped down |
| `lib/care-pathways.ts` | detectVariances, TIER_CONFIG + 9 type — HVHS C6 kalıntı |
| `lib/embeddings.ts` | generateEmbeddings, prepareEmbeddingText, SearchableContent — RAG/embedding feature kullanılmıyor |
| `lib/family-tree.ts` | splitConditions, aggregateGrandparentConditions + 2 type |

### shadcn UI primitive exports (kütüphane standardı — DOKUNMA)

| Dosya | Unused exports |
|---|---|
| `components/ui/dialog.tsx` | DialogClose, DialogOverlay, DialogPortal, DialogTrigger |
| `components/ui/dropdown-menu.tsx` | 10 export (DropdownMenuPortal, Group, Label, CheckboxItem, vb.) |
| `components/ui/select.tsx` | SelectGroup, SelectLabel, ScrollDownButton, ScrollUpButton, SelectSeparator |
| `components/ui/tabs.tsx` | tabsListVariants |
| `components/ui/card.tsx` | CardFooter, CardAction |
| `components/ui/alert.tsx` | AlertTitle, AlertAction |
| `components/ui/progress.tsx` | ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue |
| `components/ui/badge.tsx` | badgeVariants |
| `components/ui/button.tsx` | buttonVariants |

**Karar:** shadcn primitive export'ları kütüphane vendor'lanmış. Kullanılmasa da gelecekte ihtiyaç olabilir. **Silme önerilmez.**

### Duplicate exports (2)

| Dosya | Detay |
|---|---|
| `lib/prompts.ts` | `buildMedicationHubSystemPrompt` (alias for `buildProspectusSystemPrompt`) — Session 37 C1 backwards-compat alias |
| `lib/safety/check-med-interactions.ts` | `checkInteractionsAfterChange` ve `checkInteractionsAfterAdd` aynı fonksiyon farklı isimle — Session 45 F-SAFETY-002 Commit 1 rename + alias |

---

## NPM Dependencies — ayrı sprint

```
Unused dependencies:
  - pg (143 KB) — PostgreSQL client, hiç kullanılmıyor (Supabase var)
  - @nicolo-ribaudo/chokidar-2 (805 KB) — file watcher fork, leftover

Unlisted (package.json hygiene):
  - postcss — postcss.config.mjs kullanıyor ama deps'te yok (transitive). devDependencies'e eklenmeli.

Toplam: 948 KB node_modules kazancı (server-only bundle, runtime impact 0)
```

---

## Bundle Impact

```
File deletion: minimal (~0-50 KB) — Next.js zaten tree-shake ediyor
Dependency removal: 948 KB node_modules disk; runtime bundle değişmez (server-only)
Repo cleanliness: -5,887 LOC (actual silim) source code, -41 dosya
Build time: marjinal iyileşme (~0.5s)
```

**Net:** Bundle savings küçük (Next.js zaten tree-shake ediyor). Esas faydalar:
1. Repo hijyen — 5,887 LOC source code clarity
2. node_modules disk — 948 KB (npm deps cleanup ayrı sprint)
3. Onboarding cognitive load — yeni Claude session'ında "bu component ne" diye sormaya gerek yok
4. Refactor güvenliği — gelecekte rename/refactor sırasında dead code'a takılma yok

---

## Cleanup Sprint Sıralaması — Status

| Sprint | Status | Detay |
|---|---|---|
| **Sprint 1 — (A) düşük risk batch sil** | ✅ **DONE** (commit `8b03a99`) | 41 file, 5,887 LOC, build 0 error / 0 warning, 241 sayfa parite |
| **Sprint 2 — (C) iş kararı sonrası** | ⏳ Beklemede | Taha onayı + feature road-map değerlendirmesi |
| **Sprint 3 — Unused npm deps** | ⏳ Beklemede | `pg` + `@nicolo-ribaudo/chokidar-2` uninstall + `postcss` devDep |
| **Sprint 4 — Unused exports cleanup** | ⏳ Opsiyonel | `lib/safety-guardrail.ts` legacy, `lib/database.types.ts` 41 unused type |
| **(B) DOKUNMA** | 🔒 Kalıcı | sw.js + scripts korunur |

---

**Audit sonu.** Cleanup sprint'i 1 tamamlandı (`8b03a99`). Sprint 2-4 backlog'da.
