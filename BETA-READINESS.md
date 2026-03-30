# BETA READINESS CHECKLIST — Phytotherapy.ai
> Last Updated: 2026-03-31 (Session 6)

## Known Limitations

- **Facebook OAuth**: Works only for registered test users until Business Verification is complete. Expected, will be resolved post-hackathon.
- **SOS Notifications**: SMS/WhatsApp notifications are coded but disabled in production. Emergency UI (112 call, countdown modal) works fully.
- **E-Nabiz Integration**: Currently shows instructional UI only. Real integration requires Ministry of Health approval (post-hackathon).
- **Operations Page**: Uses localStorage for surgical tracking data. Supabase migration planned post-hackathon.
- **Courses**: Affiliate links not yet active. Instructor names use generic "Expert Instructor" labels.

## Feature Status

### READY
- [x] Email login & registration
- [x] Google OAuth (production)
- [x] 7-step onboarding with Supabase persistence
- [x] Health Assistant (Gemini + PubMed streaming)
- [x] Interaction Checker (OpenFDA + Gemini + PubMed)
- [x] Blood Test Analysis (30+ markers, AI analysis, PDF export)
- [x] Radiology Analysis (Gemini Vision)
- [x] Symptom Checker (AI triage)
- [x] Food-Drug Interaction Checker
- [x] Supplement Comparison
- [x] Interaction Map (SVG network graph)
- [x] Health Goals (AI weekly plans)
- [x] Prospectus Reader (Gemini Vision)
- [x] Calendar Hub (full CRUD, vitals, water, medications, ICS export)
- [x] Dashboard (daily plan, health score, bio age, metabolic portfolio)
- [x] Profile (CRUD, download data, delete data)
- [x] Family Members (basic CRUD)
- [x] Supplements (200+ catalog, tracking, badges)
- [x] Scanner (medication photo + barcode)
- [x] Analytics (real Supabase data, charts)
- [x] Badges & Leaderboard (real ranking)
- [x] Wrapped (real user data aggregation)
- [x] Share Cards (6 types, html2canvas)
- [x] Boss Fights (6 bosses, client-side)
- [x] PROMs/PREMs Survey (ICHOM standard)
- [x] FHIR R4 Export/Import
- [x] Doctor Panel (patient management, invite codes)
- [x] Emergency detection (20+ keywords EN+TR)
- [x] Contact form (Resend email)
- [x] Settings page (language, theme, notifications)
- [x] Feedback widget (every page)
- [x] PWA (manifest, service worker, offline page)
- [x] Error boundaries (error.tsx, not-found.tsx)
- [x] Cookie consent
- [x] Copyright headers & LICENSE
- [x] SEO (sitemap 32 pages, JSON-LD, FAQ, meta tags)

### DEMO VERIFIED
- [x] Demo account with 35 days of realistic data
- [x] Demo Scenario 1: Drug interaction (Metformin + sleep herbs)
- [x] Demo Scenario 2: Lethal interaction warning (St. John's Wort)
- [x] Demo Scenario 3: Blood test analysis + PDF download

### SESSION 5 VERIFICATION (2026-03-30)
- [x] Page rendering: 28/30 pages return HTTP 200
- [x] API endpoints: 13/15 PASS (2 failures are Gemini quota, not code bugs)
- [x] Security: 6/6 PASS (XSS, SQL injection, auth, rate limiting)
- [x] Build: zero errors, zero warnings
- [x] Image optimization: unused files removed, WebP conversion done
- [x] i18n: all simple string ternaries converted to tx()
- [x] Loading states: 16 route-specific + global skeleton
- [x] Overflow handling: overflow-x-hidden on main layout
- [x] Demo API: returns valid credentials + seeds 35 days data
