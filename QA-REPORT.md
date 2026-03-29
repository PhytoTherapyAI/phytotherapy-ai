# QA Report — Phytotherapy.ai

## Session Start: 2026-03-29

---

## Cycle 1 Started: 2026-03-29

### Step 0 — Fake Data Cleanup ✅

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 1 | 🟡 | components/layout/CommandPalette.tsx | Fake doctor names in search DB | ✅ Replaced with empty array |
| 2 | 🟡 | app/health-podcasts/page.tsx | 5 fake Turkish podcast hosts | ✅ Replaced with "Phytotherapy.ai" coming soon |
| 3 | 🟡 | app/expert-content/page.tsx | Fake author names | ✅ Replaced with "Phytotherapy.ai" editorial |
| 4 | 🟡 | lib/talent-hub-data.ts | 3 fake professional profiles | ✅ Replaced with empty array |
| 5 | 🟡 | lib/value-marketplace-data.ts | 6 fake provider leaderboard doctors | ✅ Replaced with empty array |
| 6 | 🟡 | app/talent-hub/verify/page.tsx | Fake name in verification preview | ✅ Replaced with generic placeholder |
| 7 | 🟡 | app/family-summary/page.tsx | Random mock health metrics | ✅ Replaced with null values |
| 8 | 🟡 | lib/publisher-data.ts | Fake view/like counts on sample content | ✅ Reset to 0 |
| 9 | 🟡 | app/doctor-dashboard/page.tsx | 5 fake patient names + division by zero | ✅ Empty array + safe division |
| 10 | 🟡 | app/doctor-messages/page.tsx | 3 fake doctor conversations | ✅ Replaced with empty arrays |
| 11 | 🟡 | app/talent-hub/page.tsx | No empty state when no profiles | ✅ Added empty state UI |

**Commit:** `b53ae70`

---

### Translation & Typo Fixes ✅

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 12 | 🟡 | lib/translations.ts:63 | "mediçine" (Turkish ç in EN text) | ✅ Fixed to "medicine" |
| 13 | 🟢 | lib/translations.ts:1049 | "Priçing" key and value had Turkish ç | ✅ Fixed to "pricing" / "Pricing" |

---

### Security Fixes ✅

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 14 | 🔴 | app/api/demo/route.ts | Hardcoded demo password in source | ✅ Uses env var with fallback |
| 15 | 🔴 | app/api/bot-send/route.ts | Hardcoded "dev-cron-secret" fallback | ✅ Fails in production if CRON_SECRET missing |
| 16 | 🔴 | app/api/health-check/route.ts | Exposed individual API key names publicly | ✅ Shows only summary count |
| 17 | 🔴 | app/api/scan-medication/route.ts | No auth check — 500 on unauthenticated | ✅ Added Bearer token auth check |

---

### API Endpoint Tests ✅

| Endpoint | Method | Auth? | Result |
|----------|--------|-------|--------|
| /api/demo | POST | No | ✅ 200 — returns demo credentials |
| /api/pubmed?q=omega3 | GET | No | ✅ 200 — returns PubMed articles |
| /api/family | GET | Yes | ✅ 401 without auth |
| /api/health-sync | POST | Yes | ✅ 401 without auth |
| /api/analytics | GET | Yes | ✅ 401 without auth |
| /api/leaderboard | GET | Yes | ✅ 401 without auth |
| /api/scan-medication | POST | Yes | ✅ 401 without auth (after fix) |
| /api/doctor-summary | GET | - | 405 (POST only) |
| /api/blood-analysis | POST | No | ✅ 400 validates input |
| /api/trigger-sos | POST | No | ✅ 400 validates required fields |
| /api/interaction | POST | No | ✅ 200 returns interaction data |
| /api/chat | POST | No | ✅ 200 streams response |
| /api/fhir | GET | Yes | ✅ 401 without auth |
| /api/health-check | GET | No | ✅ 200 — no longer leaks env var names |

---

### Visual Page Tests ✅

| Page | EN | TR | Dark | Light | Mobile | Status |
|------|----|----|------|-------|--------|--------|
| / (landing) | ✅ | ✅ | ✅ | ✅ | ✅ | Pass |
| /auth/login | ✅ | - | ✅ | ✅ | - | Pass |
| /about | ✅ | - | ✅ | ✅ | - | Pass |
| /privacy | ✅ | - | ✅ | - | - | Pass |
| /terms | ✅ | - | ✅ | - | - | Pass |
| /health-assistant | ✅ | - | - | ✅ | - | Pass |
| /interaction-checker | ✅ | - | - | ✅ | - | Pass |
| /blood-test | ✅ | - | - | ✅ | - | Pass (date format is system locale) |
| /calendar | ✅ | - | - | ✅ | - | Pass |
| /profile | ✅ | - | - | ✅ | - | Pass |
| /dashboard | ✅ | - | - | ✅ | - | Pass |

---

### Known Issues (Not Fixed — Low Priority)

| # | Severity | Description |
|---|----------|-------------|
| 1 | 🟢 | ~1010 hardcoded `lang === "tr" ?` ternaries across 150+ pages (should migrate to tx()) |
| 2 | 🟢 | ~35 console.log/error statements in production code |
| 3 | 🟢 | Date input shows Turkish locale format (gg.aa.yyyy) — browser-level, not code issue |
| 4 | 🟢 | Sentry /monitoring endpoint returns 500 in dev (expected without DSN) |

---

## Cycle 1 Summary

- **Bugs found:** 17
- **Bugs fixed:** 17
- **Security fixes:** 4 (critical)
- **Translation fixes:** 2

---

## Cycle 2 Started: 2026-03-29

### Broken Internal Links ✅

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 18 | 🟡 | app/health-analytics/page.tsx | href="/login" → 404 | ✅ Fixed to /auth/login |
| 19 | 🟡 | app/medication-hub/page.tsx | href="/login" → 404 | ✅ Fixed to /auth/login |
| 20 | 🟡 | app/nutrition/page.tsx | href="/login" → 404 | ✅ Fixed to /auth/login |
| 21 | 🟡 | app/smart-reminders/page.tsx | href="/login" → 404 | ✅ Fixed to /auth/login |
| 22 | 🟡 | app/weekly-newsletter/page.tsx | href="/login" → 404 | ✅ Fixed to /auth/login |
| 23 | 🟡 | app/value-marketplace/page.tsx | href="/login" → 404 | ✅ Fixed to /auth/login |

**Commit:** `131b8e8`

### Page HTTP Status Check ✅

All 40+ tested routes return 200 (or expected 307 redirects).
Missing routes /contact and /security are not linked anywhere — future work.

### TR/EN Visual Tests ✅

| Page | TR Mode | EN Mode |
|------|---------|---------|
| /health-assistant | ✅ 100% Turkish | ✅ 100% English |
| /interaction-checker | ✅ 100% Turkish | ✅ 100% English |
| /blood-test | ✅ | ✅ |
| /courses | ✅ | ✅ |
| /clinical-tests | ✅ | ✅ |
| /enterprise | ✅ | ✅ |
| /value-marketplace | ✅ | ✅ |
| /tools | ✅ | ✅ |
| /profile | ✅ | ✅ |

### Cycle 2 Summary

- **Bugs found:** 6 (all broken /login links)
- **Bugs fixed:** 6
- **Pages tested (HTTP):** 40+
- **Pages tested (visual):** 9 additional pages in both TR/EN
- **Fake data removed:** 11 files
- **All API endpoints tested:** 14 endpoints verified
- **Visual pages tested:** 11 pages across EN/TR/dark/light/mobile
