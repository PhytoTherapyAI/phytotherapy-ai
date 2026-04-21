# Session 41 — Interaction / UX Friction Audit (Faz 1)

**Tarih:** 22 Nisan 2026
**Başlangıç commit:** `01af2d1` (Session 40 sonu)
**Faz:** 1 (SADECE audit — kod yazılmadı; Faz 2 için ayrı prompt gelecek, İpek scope onaylayacak)

---

## Metodoloji

1. Session 40'ın dashboard kapsamı (9 route + 3 destek component) → interaction ekseninde tekrar incelendi.
2. 2 paralel Explore agent — Daily flows (F-D-*) + Secondary flows (F-S-*).
3. **Manuel verify:** Session 40 dersi uygulandı — agent raporundaki her bulgu örneklem kontrolü ile doğrulandı. 2 bulgu false positive olarak elendi (gerekçeleriyle kayıtlı), 5 bulgu kod kanıtı ile teyit edildi, kalan 10 bulgu UX judgment dayalı (statik audit'in doğal sınırı — kesin tıklama testi canlıda gerekir).
4. Önceliklendirme kuralı İpek'ten: **günlük kullanım > friction azaltma > broken/dead UI > mobile-first**.

**Kısıtlamalar:**
- Kod değişikliği yok.
- Yeni feature önerisi yok — mevcut UI üzerinden gap analizi.
- Refactor önerisi yok.
- Session 40 scope (runtime bug) dışı.

---

## Özet

**Toplam: 15 gerçek finding** (17 ham ajan bulgusu − 2 false positive):

| Öncelik | Sayı | Not |
|---|---|---|
| **P0** (broken/dead UI, compliance risk, hayati friction) | 1 | F-S-002 KVKK Aydınlatma scroll gate yok — audit false compliance riski |
| **P1** (net friction, günlük kullanımda hissedilir) | 6 | Command palette 2 + chat a11y + dashboard customize + calendar empty + medication conflicts |
| **P2** (kozmetik, edge case, minor) | 8 | Banner overlap, avatar boyutu, retry UX, profile draft vb. |
| **CLEAN** (friction yok, kayıt amaçlı) | 3 | FamilyHistorySection (Session 39 fix sağlam), Settings nav links, Prospectus upload akışı |

**False positive'ler (elendi):**
- FP-A (F-D-001 daha agent bulgusu): Health Assistant chat history mobile'da "hidden" iddiası → YANLIŞ. [app/health-assistant/page.tsx:149-156](app/health-assistant/page.tsx:149) mobile drawer görünür (`lg:hidden` — mobile'da drawer var, desktop'ta sidebar).
- FP-B (F-D-002 agent bulgusu): Dashboard task state "dual-source karmaşa" iddiası → YANLIŞ. Kod kasıtlı ayrım: med/supplement Supabase (cross-device sync), statik task (su sayımı vb.) localStorage. [app/page.tsx:486-521](app/page.tsx:486) bilinçli tasarım — friction değil.

---

## P0 Findings (1)

### F-S-002 [P0] — AydinlatmaPopup: scroll gate yok, KVKK false compliance riski

- **Sayfa:** `/aydinlatma` popup (dashboard amber banner tetikleyici)
- **Entry → aksiyon:** Dashboard açılır → amber banner ("v2.2 güncellendi, okumalısın") → tıkla → popup açılır → "Okudum, Kapat" **ilk anda ENABLED** → kullanıcı scroll etmeden tıklarsa audit log v2.2 "acknowledged" yazar.
- **Friction:** KVKK Md.10 aydınlatma yükümlülüğünün temel mantığı "bilgilendirme" sunmak. Kullanıcı içeriği görmeden onay verebiliyorsa **audit kaydı yalan** hale gelir. Mobile'da içerik 3 ekran uzunluğunda — kullanıcı hiç kaydırmadan buton'a ulaşamaz ama desktop'ta popup 90vh max-height, tek ekranda tüm scroll'u atlayabilir.
- **Kanıt:** [components/legal/AydinlatmaPopup.tsx:233-238](components/legal/AydinlatmaPopup.tsx:233) button'da `disabled` yok, scroll event listener yok:
  ```tsx
  <button onClick={onAcknowledge}
    className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium ...">
    {tr ? "Okudum, Kapat" : "I've Read This, Close"}
  </button>
  ```
  Session 36 C7'de **ConsentPopup** için scroll gate eklenmişti (`components/consent/ConsentPopup.tsx` — scrollHeight check). AydinlatmaPopup'ta bu pattern uygulanmamış.
- **Öncelik:** **P0** — KVKK Md.10 audit compliance riski (kurul denetiminde "aydınlatma yapıldı" iddiası desteklenmez).
- **Kullanım sıklığı:** Nadir (sürüm bump'ında bir kez per kullanıcı), ama **her kullanıcıyı etkiler**.
- **Mobile:** Evet — buton viewport dışında, scroll zorunlu olduğu için aslında de facto gate var; ama desktop'ta yok.
- **Faz 2 tahmini fix:** Session 36 C7 pattern'ini AydinlatmaPopup'a uygula — scroll container'a `onScroll` listener + `scrollTop + clientHeight >= scrollHeight - 50` koşuluyla button `disabled` state'i yönet. Kısa içerik edge case'i için `scrollHeight <= clientHeight` → otomatik enable.

---

## P1 Findings (6)

### F-S-001 [P1] — CommandPalette: klavye nav seçim offscreen (scrollIntoView yok)

- **Sayfa:** Global ⌘K palette
- **Entry → aksiyon:** ⌘K aç → "ilaç" ara → ArrowDown 6-7 kez → seçili item listenin alt kısmında, görünmez → kullanıcı nerede olduğunu bilmeden Enter
- **Friction:** Keyboard-first UX temel pattern'i (VSCode/Spotlight benzeri) beklentisi karşılanmıyor. 30 entry'lik registry + tools (~80 item) + recent search — Arrow zinciri scroll fold'u aşınca görsel feedback kayboluyor.
- **Kanıt:** [components/layout/CommandPalette.tsx:362-373](components/layout/CommandPalette.tsx:362) handleKeyDown setSelectedIndex çağırıyor ama `scrollIntoView` yok. Sonuç container `max-h-[60vh] overflow-y-auto` ([line 452](components/layout/CommandPalette.tsx:452)) — 10+ result'ta alt kısım gizli.
- **Öncelik:** P1
- **Kullanım sıklığı:** Günlük (Session 40 cb5a914 ile palette aktif ana navigasyon)
- **Mobile:** Hayır (klavye nav desktop/laptop)
- **Faz 2 tahmini fix:** `useEffect([selectedIndex])` içinde `document.querySelector('[data-palette-item][data-selected=true]')?.scrollIntoView({ block: "nearest" })`. İtem'lara `data-selected` + `data-palette-item` attribute ekle.

### F-S-003 [P1] — CommandPalette: Tab key ile ilerleme yok

- **Sayfa:** Global ⌘K palette
- **Entry → aksiyon:** ⌘K aç → Tab bas → hiçbir şey olmuyor (ArrowDown bekliyor)
- **Friction:** Muscle memory (Spotlight/Raycast/VSCode). Power user Tab ile ilerlemeyi dener, bulamayınca Arrow'a geçer — mikro frustration.
- **Kanıt:** [components/layout/CommandPalette.tsx:362-373](components/layout/CommandPalette.tsx:362) yalnızca `ArrowDown`, `ArrowUp`, `Enter`. Tab/Shift+Tab yok.
- **Öncelik:** P1
- **Kullanım sıklığı:** Günlük (power kullanıcı)
- **Mobile:** Hayır
- **Faz 2 tahmini fix:** handleKeyDown'a `case "Tab"`: e.preventDefault + selectedIndex ilerlet (Shift+Tab → geri). Son item'da wrap-around (0'a dön) ya da durdur — UX tercihi.

### F-D-007 [P1] — ChatInterface: icon butonlarda aria-label eksik (a11y + mobile tap hedefi)

- **Sayfa:** `/health-assistant` input toolbar (attach, camera, mic)
- **Entry → aksiyon:** Ekran okuyucu kullanıcı / körlük → paperclip/camera/mic butonlara odaklanır → yalnızca `title` attribute (hover tooltip) var, screen reader "button" okur, amaç belirsiz.
- **Friction:** WCAG 2.1 A-level uyum açığı. Mobile'da tap target ≥44px sağlansa da semantik label eksik.
- **Kanıt:** [components/chat/ChatInterface.tsx](components/chat/ChatInterface.tsx) `aria-label` 0 occurrence, sadece `title=` 4 yerde.
- **Öncelik:** P1
- **Kullanım sıklığı:** Occasional (file upload / ses seyrek)
- **Mobile:** Evet (TalkBack/VoiceOver)
- **Faz 2 tahmini fix:** Her icon buton'a `aria-label={tx("chat.attachFile", lang)}` vb. ekle + tap target audit (`h-11 w-11` zaten 44px, OK).

### F-D-003 [P1] — Dashboard Customize Mode: inline mode swap, mobile deadzone

- **Sayfa:** `/` (dashboard home)
- **Entry → aksiyon:** Dashboard → "Customize" tıkla → task listesi **tamamen yerini customize paneline bırakır** → kullanıcı task'larına bakmak için önce Close → sonra açar
- **Friction:** Context-switch maliyeti. Özellikle "şu task'ımı kaldır" isteyen kullanıcı önce customize aç, listeyi göremez, task id'yi hatırlaması gerek.
- **Kanıt:** [app/page.tsx:710-738](app/page.tsx:710) `taskCustomizeMode` toggle bloğu tam swap yapıyor (if/else tek dal).
- **Öncelik:** P1
- **Kullanım sıklığı:** Haftalık (ilk kurulum + ara sıra)
- **Mobile:** Evet (5+ toggle tek panelde, scroll yoğun)
- **Faz 2 tahmini fix:** Customize'ı yan panel (desktop) veya alt drawer (mobile) olarak aç; normal task list görünür kalır. Tek iş, Session 39 FamilyHistorySection modal pattern'ine benzer yapı kullanılabilir.

### F-D-004 [P1] — Medication Hub: conflict detection sessiz + sadece 2 etkileşim

- **Sayfa:** `/medication-hub` schedule tab
- **Entry → aksiyon:** 5+ ilaç ekle → schedule üret → ekranın bir yerinde "conflict" warning yok → kullanıcı etkileşim olduğunu fark etmez
- **Friction:** `generateSchedule` hardcoded 2 pair (iron+levothyroxine, iron+calcium). Daha geniş etkileşim verisi [lib/prompts.ts](lib/prompts.ts) INTERACTION_PROMPT'ta AI tarafında var ama UI'ya bağlanmıyor.
- **Kanıt:** [app/medication-hub/page.tsx:268-278](app/medication-hub/page.tsx:268) — 2 check. `conflicts` array üretiliyor ama UI'da display satırı belirsiz.
- **Öncelik:** P1 (safety-adjacent — kullanıcı etkileşimden habersiz ilaç alıyor olabilir)
- **Kullanım sıklığı:** Haftalık (ilaç schedule revizyonu)
- **Mobile:** Hayır (UI kapsamı)
- **Faz 2 tahmini fix:** Conflict card'ı schedule üst kısmına yerleştir ("⚠️ 2 etkileşim tespit edildi — detaylar için /interaction-checker") + eski 2 pair'i genişletme SSoT olarak `/api/interactions` endpoint'ine bağlama (zaten mevcut olabilir).

### F-D-005 [P1] — Calendar: empty state eksik

- **Sayfa:** `/calendar` (boş bir gün seçimi)
- **Entry → aksiyon:** Geçmiş hafta gezin → task'siz gün → boş gündür, "+ Ekle" CTA yok, kullanıcı ne yapacağını bilmez
- **Friction:** TimeBlock'larda inline "Add to Morning" var ama tamamen boş günlerde üst seviye CTA net değil.
- **Kanıt:** [app/calendar/page.tsx](app/calendar/page.tsx) `TodayView` lazy — statik okumada boş state handler net görünmüyor.
- **Öncelik:** P1
- **Kullanım sıklığı:** Haftalık (retro gezinti)
- **Mobile:** Evet (daha sıkı viewport)
- **Faz 2 tahmini fix:** TodayView'a empty state (tüm task block'lar boşsa): Motivasyon cümle + "Bugün için bir ritüel planla" CTA + ilaç profili varsa "Bu güne ilacını planla" kısa yolu.

---

## P2 Findings (8)

### F-S-010 [P2] — Header medication reminder banner: dar ekranda buton overlap

- **Sayfa:** `/` üstündeki amber hatırlatıcı banner (<375px ekranda)
- **Kanıt:** [components/layout/Header.tsx:389-412](components/layout/Header.tsx:389) — `flex items-center gap-3`, narrow ekranda "Update" ve dismiss yan yana sıkışır.
- **Faz 2 fix:** `flex-col sm:flex-row` container + button container'a `w-full sm:w-auto`.

### F-D-006 [P2] — Profile: form draft persist yok (Session 39 pattern yaygınlaşmalı)

- **Sayfa:** `/profile` ilaç/alerji/kronik ekleme formları
- **Friction:** Tab switch veya auth re-validate → `authLoading` flip → profile unmount → useState kaybı (Session 39'da FamilyHistorySection için sessionStorage pattern vardı ama profile'a uygulanmadı).
- **Kanıt:** [app/profile/page.tsx](app/profile/page.tsx) `sessionStorage` sadece scroll pozisyonu (line 325, 327). Form state `useState` only.
- **Faz 2 fix:** Session 39 `readDraft`/`clearDraft` helper'ını `lib/ui/draft-persist.ts` gibi bir utility'ye çıkar, profile formlarında kullan. **Bu Session 42'ye uygun — Faz 2'nin minimum scope'u dışında.**

### F-D-008 [P2] — Dashboard su task'i optimistic feedback gecikmesi

- **Sayfa:** `/` water task item
- **Kanıt:** [app/page.tsx:205-212](app/page.tsx:205), [app/page.tsx:477](app/page.tsx:477) water-context async.
- **Faz 2 fix:** WaterTaskItem'da local optimistic glass count + error rollback.

### F-D-009 [P2] — Calendar MonthView Suspense fallback belirsiz

- **Sayfa:** `/calendar` month tab
- **Kanıt:** [app/calendar/page.tsx:29](app/calendar/page.tsx:29) `lazy(...)` — Suspense fallback skeleton doğrulama gerekiyor (dinamik görsel test).
- **Faz 2 fix:** Suspense boundary'e `fallback={<CalendarMonthSkeleton />}` ekle.

### F-D-010 [P2] — Dashboard copilot chip grid mobile scroll

- **Sayfa:** `/` AI Copilot section
- **Kanıt:** [app/page.tsx:820-828](app/page.tsx:820) chip liste mobilde horizontal scroll gerektirebilir.
- **Faz 2 fix:** `grid grid-cols-2 sm:flex sm:flex-wrap` veya `overflow-x-auto` snap-points.

### F-S-008 [P2] — Prospectus reader: hata state'te inline retry yok

- **Sayfa:** `/prospectus-reader`
- **Kanıt:** [app/prospectus-reader/page.tsx:110-144](app/prospectus-reader/page.tsx:110) handleAnalyze error → resetAll() zorunlu.
- **Faz 2 fix:** Error state'te "Tekrar Dene" butonu + dosyayı koru.

### F-S-005 [P2] — Settings password: navigation esnasında state karması

- **Sayfa:** `/settings` password formu
- **Kanıt:** [app/settings/page.tsx:73-75](app/settings/page.tsx:73) `setTimeout` → 5s success state, ancak unmount sırasında clear edilmiyor.
- **Faz 2 fix:** useEffect cleanup'ta setTimeout clear + input clear on unmount.

### F-S-009 [P2] — CommandPalette avatar initials mobilde boyut

- **Sayfa:** ⌘K doktor sonuçları
- **Kanıt:** [components/layout/CommandPalette.tsx:485](components/layout/CommandPalette.tsx:485) `w-9 h-9 text-xs` — mobilde harfler dar.
- **Faz 2 fix:** `text-[10px] sm:text-xs` veya avatar boyutunu `w-10 h-10` yap.

---

## CLEAN (friction yok)

1. **FamilyHistorySection** — Session 39 hotfix (sessionStorage draft persist + modal unmount safe) tam çalışıyor. [components/family/FamilyHistorySection.tsx](components/family/FamilyHistorySection.tsx)
2. **Settings navigation links** — tüm 5 destination route gerçek ([app/settings/page.tsx:83-88](app/settings/page.tsx:83) → `/notifications`, `/connected-devices`, `/privacy-controls`, `/data-export`, `/data-delete`)
3. **Prospectus Reader upload flow** — file → preview → analyze state geçişleri smooth; sadece error state'te retry friction (F-S-008).

---

## Önceliklendirme Matrisi

| ID | Sayfa | Öncelik | Kullanım | Mobile | Faz 2 Efor |
|---|---|---|---|---|---|
| F-S-002 | AydinlatmaPopup | **P0** | Nadir ama herkes | Evet | ~1h |
| F-S-001 | CommandPalette scrollIntoView | P1 | Günlük (power) | — | ~0.5h |
| F-S-003 | CommandPalette Tab key | P1 | Günlük (power) | — | ~0.5h |
| F-D-007 | ChatInterface a11y | P1 | Occasional | Evet | ~0.5h |
| F-D-003 | Dashboard customize mode | P1 | Haftalık | Evet | ~2h |
| F-D-004 | Medication Hub conflicts | P1 | Haftalık | — | ~2h |
| F-D-005 | Calendar empty state | P1 | Haftalık | Evet | ~1h |
| F-S-010 | Header banner mobile | P2 | Günlük | Evet | ~0.5h |
| F-D-006 | Profile draft persist | P2 | Nadir | — | ~2h |
| F-D-008 | Water task optimistic | P2 | Günlük | — | ~0.5h |
| F-D-009 | MonthView Suspense | P2 | Haftalık | — | ~0.3h |
| F-D-010 | Copilot chips mobile | P2 | Occasional | Evet | ~0.3h |
| F-S-008 | Prospectus retry | P2 | Nadir | — | ~0.5h |
| F-S-005 | Settings password state | P2 | Nadir | — | ~0.25h |
| F-S-009 | Palette avatar mobile | P2 | Haftalık | Evet | ~0.25h |

---

## Faz 2 Scope Önerisi (3 varyant — İpek seçecek)

### S — Küçük (P0 + en kritik 2 P1) — ~2h
- **F-S-002** KVKK AydınlatmaPopup scroll gate
- **F-S-001** CommandPalette scrollIntoView
- **F-S-003** CommandPalette Tab key
- **Gerekçe:** Compliance risk + günlük power user friction. Yarım gün içinde biter, düşük risk, hemen push.

### M — Orta (önerilen: S + 4 P1 daha) — ~6h
- S'nin tümü +
- **F-D-007** ChatInterface a11y (aria-label)
- **F-D-005** Calendar empty state
- **F-D-004** Medication Hub conflict card
- **F-D-003** Dashboard customize mode drawer

**Gerekçe:** KVKK + palette power UX + günlük sık kullanım akışlarındaki 4 P1. Accessibility de kazanım. 1 gün içinde biter. Push sonrası canlıda İpek yeni friction yakalarsa Faz 3 açılır.

### L — Büyük (M + tüm P2) — ~10-12h
- M'nin tümü +
- 8 P2 (banner, profile draft utility, water feedback, Suspense skeleton, copilot chips, prospectus retry, settings state, palette avatar)

**Gerekçe:** "Tamamlandı" seviyesi. Ama P2'lerin bazıları ertelenebilir — örn. F-D-006 (profile draft utility) Session 42'de dedicated draft-persist library olarak yapılabilir (daha kapsamlı refactor).

### Önerim: **M varyant**
- P0 compliance riski ciddi, mutlaka içerisinde olmalı.
- Palette fix'leri Session 40 cb5a914 push'u sonrası en çok kullanılan özellik — P1 iki item tek commit'te birlikte.
- F-D-003/004/005 günlük sayfa friction'ı — yarım gün fazla ama etki büyük.
- P2'ler Faz 3'e bırakılabilir (veya Session 42 içinde UX-only sprint).

---

## Dışarıda Bırakılanlar

- **Onboarding/signup akışı** — Session 42+'da ayrı interaction audit
- **Premium checkout akışı** — Iyzico entegrasyonu bekliyor (Session 40+ [IYZICO_INTEGRATION_PLAN.md](docs/IYZICO_INTEGRATION_PLAN.md))
- **60+ sağlık aracı alt sayfaları** — ayrı audit sprint'i (her tool sayfası kendi akışı)
- **Landing page (guest `/`)** — marketing konusu, Session 34'te rewrite edildi, ayrı audit gerektirir
- **Mobile native test** — ekran boyutu/gesture testi statik audit ile tam doğrulanamıyor; canlı cihaz taraması Faz 3 ya da dedicated QA sprint
- **Accessibility full audit (WCAG 2.1 AA)** — F-D-007 ilk eksik, ama tam audit ayrı sprint gerektirir (renk kontrast, focus ring, heading hierarchy vb.)

---

## Verification Notları

- Kod değişikliği yok → tsc/build çalıştırılmadı (Session 40 build temiz, regression yok).
- Statik audit sınırı: "kullanıcı şu butona tıklayınca şu oluyor" iddiaları yalnızca kod okumayla %80-85 doğrulanabilir; kalan %15-20 canlı test gerektirir (hover state, tap feedback, timing bugs). Bu yüzden P2 bulgular "potansiyel" etiketiyle kaydedildi.
- Agent false positive oranı: 2/17 = %11.8 (Session 40'ta bu %50+ idi — UX judgment'ın daha öznel olması + verify disiplininin gelişmesi).

---

## Status

- Faz 1 AUDIT: ✅ TAMAMLANDI (commit `989ba0b`)
- Faz 2 FIX: ✅ TAMAMLANDI (M varyant, 7 fix — aşağıda FIXED işaretleri)

### Faz 2 FIXED İşaretleri

**P0 (1/1 fixed):**
- **F-S-002** ✅ FIXED — commit: `6924634` — AydınlatmaPopup scroll gate. Root: D (pattern ConsentPopup'ta var, AydınlatmaPopup'a taşınmamış). Session 36 C7 aslında popup kapanma handler fix'iydi, scroll gate eklemedi.

**P1 (6/6 fixed):**
- **F-S-001** ✅ FIXED — commit: `31ffa97` — CommandPalette selected item scrollIntoView (aynı commit F-S-003 ile — keyboard nav cohesion)
- **F-S-003** ✅ FIXED — commit: `31ffa97` — CommandPalette Tab / Shift+Tab support
- **F-D-007** ✅ FIXED — commit: `e273535` — ChatInterface 5 icon button aria-label
- **F-D-005** ✅ FIXED — commit: `24914c1` — Calendar TimeBlock empty-state CTA editMode tetikliyor (önce `onAdd = () => {}` no-op)
- **F-D-004** ✅ FIXED — commit: `792d477` — Medication Hub conflict banner'a /interaction-checker CTA (Session 42: hardcoded 2 pair expansion)
- **F-D-003** ✅ FIXED — commit: `beb90b7` — Dashboard customize panel task list ile yan yana, swap kaldırıldı

**Build durumu:** Faz 2 sonrası 241 sayfa, 0 error, 0 warning (baseline ile bit-perfect).

**Ertelenenler (Session 42+):**
- ~~8 P2 finding~~ → **Session 42 tamamında 7/7 FIXED** (F-D-006 lib extract dahil). F-D-009 CLEAN.
- 3 CLEAN finding (FamilyHistorySection, Settings nav, Prospectus upload) — regression check, dokunulmadı.
- F-D-004'ün yeni drug-pair rules eklemesi — interaction engine refactor'ına taşındı (Session 43+).

### Session 42 FIXED İşaretleri (P2 + FP-D, `fea05d7..ddc4b26`)
- **F-S-010** ✅ FIXED — commit: `fea05d7` — Header medication reminder banner mobile stack (flex-col sm:flex-row + full-width buttons)
- **F-S-009** ✅ FIXED — commit: `873ffe0` — CommandPalette doktor avatar initials `text-[10px] sm:text-xs` + tracking-tight
- **F-D-010** ✅ FIXED — commit: `21397a4` — Dashboard copilot chips `grid grid-cols-2 sm:flex sm:flex-wrap` + truncate
- **F-S-005** ✅ FIXED — commit: `a309618` — Settings password success auto-reset via useEffect + cleanup (bare setTimeout kaldırıldı)
- **F-S-008** ✅ FIXED — commit: `9e98e68` — Prospectus inline retry + "Yeni dosya" escape
- **F-D-008** ✅ FIXED — commit: `9340c19` — Water task click → addGlass/removeGlass optimistic glass counter
- **FP-D** ✅ FIXED — commit: `cde0f95` — Settings password section family member view'de info card (caller-session semantiği açıklama)
- **F-D-006** ✅ FIXED — commit: `ddc4b26` — `lib/ui/draft-persist.ts` lib extract + FamilyHistorySection refactor (behavior parity) + Profile medication-add integrate
- **F-D-009** ✅ CLEAN (doğrulandı) — [app/calendar/page.tsx:997](app/calendar/page.tsx:997) Suspense fallback mevcut

**Faz 1 commit:** `docs(session-41): interaction audit phase 1` (`989ba0b`)
**Faz 2 commit zinciri:** `6924634..beb90b7` (6 fix commit, F-S-001 + F-S-003 birleşik).
