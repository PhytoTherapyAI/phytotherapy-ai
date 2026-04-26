<p align="center">
  <img src="public/logo.svg" alt="DoctoPal" width="64" height="64" />
</p>

<h1 align="center">DoctoPal</h1>

<p align="center">
  <strong>Evidence Meets Nature. AI Meets You.</strong><br/>
  AI-powered health companion bridging modern medicine and evidence-based phytotherapy.
</p>

<p align="center">
  <a href="https://doctopal.com">doctopal.com</a> · 
  <a href="#features">Features</a> · 
  <a href="#architecture">Architecture</a> · 
  <a href="#getting-started">Getting Started</a> · 
  <a href="#safety">Safety</a>
</p>

---

## What is DoctoPal?

DoctoPal is an AI health assistant that helps users understand drug–herb interactions, analyze lab results, track medications, and access 155+ evidence-based health tools — all with multi-layer safety guardrails and full Turkish regulatory compliance (KVKK, TCK, 1219 s.K., GETAT).

Built by two medical students with no prior software development experience, using Claude as the sole developer.

**Awards:** IGNITE'26 Winner (April 2026)

---

## Features

DoctoPal organizes 155+ tools across 17 categories:

| Category | Highlights |
|---|---|
| **Medical Analysis** | Blood test interpretation, radiology report analysis, symptom checker, body analysis, smart lens scanner |
| **Medications** | Drug info with OpenFDA, interaction map, food–drug interactions, polypharmacy risk scoring, prospectus reader |
| **Supplements & Phytotherapy** | Herb–drug interaction checker, supplement comparison, botanical hub, evidence-based dosing |
| **Mental Health** | Depression screening (PHQ-9), anxiety toolkit, grief support, PTSD support, ADHD management |
| **Nutrition** | Calorie tracking, anti-inflammatory diet, circadian eating, gut health, seasonal food guide |
| **Sleep & Fitness** | Sleep analysis, circadian rhythm, yoga/meditation, stretching, sports performance |
| **Organ Health** | Cardiovascular risk, thyroid/kidney/liver dashboards, lung monitor, eye & ear health, dental health |
| **Gender & Life Stages** | Women's/men's health, pregnancy tracker, menopause panel, child health, elder care |
| **Tracking** | Health diary, pain diary, hydration, caffeine tracker, walking tracker, alcohol tracker |
| **Prevention** | Cancer screening, vaccination tracker, checkup planner, genetic risk, health challenges |
| **Medical Tools** | Clinical tests reference, medical dictionary, drug recall alerts, clinical trials finder |
| **Doctor Tools** | Doctor dashboard, patient analytics, prescription assistant, communication portal |
| **Enterprise** | B2B health solutions, talent hub, value marketplace |

Additional platform capabilities: family profiles (up to 6 members), AI health assistant chat, medication schedule calendar, offline mode (PWA), health score gamification, Turkish/English bilingual interface.

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.1.6 (App Router) · React 19 · TypeScript 5 |
| **Styling** | Tailwind CSS 4 · shadcn/ui · Framer Motion · Lucide Icons |
| **AI** | Anthropic Claude API (Haiku 4.5 free / Sonnet 4.6 premium) · Google Gemini (text-embedding-004) |
| **Database** | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| **Auth** | Supabase Auth (Email + Google OAuth + Facebook OAuth) |
| **Monitoring** | Sentry (error tracking + performance) |
| **Email** | Resend |
| **External APIs** | OpenFDA · PubMed · TÜFAM |
| **Deploy** | Vercel (Edge + Serverless) + Vercel Cron |
| **PWA** | Service Worker + Web App Manifest |
| **Testing** | Playwright (E2E) |

### Project Stats

```
Pages:            228
API Routes:       120 (75 AI-powered)
Components:       183
Library Files:     85
Total Lines:  ~145,000
Tool Categories:   17
Health Tools:     155+
Translation Keys: ~1,300
DB Migrations:     27
```

### Directory Structure

```
app/
├── page.tsx                 # Dashboard (auth) / Landing (guest)
├── api/                     # 120 API routes
│   ├── chat/                # AI health assistant
│   ├── interaction/         # Drug–herb interaction engine
│   ├── blood-analysis/      # Lab result parser
│   └── ...
├── health-assistant/        # AI chat interface
├── interaction-checker/     # Core interaction tool
├── blood-test/              # Blood test analysis
├── calendar/                # Medication schedule
├── family/                  # Family profiles
├── onboarding/              # 7-step onboarding flow
└── [150+ tool pages]/

components/
├── layout/                  # Header, Footer, BottomNavbar, AuthGatedOverlays
├── ui/                      # shadcn/ui primitives (Button, Card, Dialog, etc.)
├── dashboard/               # Dashboard cards & widgets
├── onboarding/              # Onboarding step components
├── chat/                    # AI chat components
├── interaction/             # Interaction checker UI
├── emergency/               # CriticalAlertModal, emergency UI
├── premium/                 # Trial banner, premium gates
└── [30+ feature-specific folders]/

lib/
├── ai-client.ts             # Centralized AI client (Claude + Gemini)
├── safety-guardrail.ts      # 5-layer safety system (1,087 lines)
├── output-safety-filter.ts  # Post-AI output filtering (345 lines)
├── safety-filter.ts         # Red flag emergency detection (376 lines)
├── interaction-engine.ts    # Drug–herb interaction logic
├── translations.ts          # i18n engine (TR/EN)
├── translations/            # Translation files (~491K)
├── auth-context.tsx         # Auth state provider
├── family-context.tsx       # Family profile provider
├── tools-hierarchy.ts       # Single source of truth for all tools
└── [70+ utility modules]/

supabase/
├── schema.sql               # Base database schema
└── migrations/              # 27 incremental migrations
```

---

## Safety

DoctoPal employs a **5-layer algorithmic safety system** that runs before any AI recommendation is generated:

| Layer | Name | Function |
|---|---|---|
| 1 | **Red Flag Filter** | Detects emergency symptoms (chest pain, suicidal ideation, stroke signs) → immediate 112 redirect |
| 2 | **Drug–Herb Interaction Check** | Screens for lethal/dangerous interactions against user's medication profile |
| 3 | **Contraindication Screen** | Profile-based risk evaluation (pregnancy, kidney/liver disease, allergies) |
| 4 | **Dosage Limit Validation** | Ensures recommended amounts stay within evidence-based safe ranges |
| 5 | **Transparency & Source Verification** | Requires PubMed/clinical sources; flags low-confidence recommendations |

Additional safety mechanisms:

- **Output Safety Filter** (1219 s.K. compliance): Transforms diagnosis statements into informational language, converts prescription formats to research references
- **PII Stripping**: Personal data is anonymized before AI prompts (KVKK compliance)
- **Prompt Injection Protection**: Detects and blocks injection attempts in user input
- **Security Preamble**: Injected into every AI call — enforces role boundaries, prevents data leaks

### Regulatory Compliance

Fully compliant with Turkish healthcare regulations: KVKK (6698), TCK Md. 90/134-136, 1219 s.K. (Medical Practice Law), GETAT Yönetmeliği, Tıbbi Cihaz Yönetmeliği, and the 2025 KVKK Generative AI Guidelines.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase project (for database + auth)
- Anthropic API key (for AI features)

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key

# Email (optional)
RESEND_API_KEY=your_resend_api_key

# Sentry (optional)
SENTRY_AUTH_TOKEN=your_sentry_token
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Installation

```bash
# Clone
git clone https://github.com/PhytoTherapyAI/phytotherapy-ai.git
cd phytotherapy-ai

# Install dependencies
npm install

# Run database migrations
# (Apply supabase/schema.sql first, then migrations in order)

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run convert-drugs` | Convert TİTCK drug database |

---

## Key Design Decisions

**AI Model Strategy**: Free users get Claude Haiku 4.5 ($0.008/request) for fast responses; premium users get Claude Sonnet 4.6 ($0.03/request) for higher medical accuracy. Every AI call goes through the centralized `lib/ai-client.ts` with the security preamble.

**Auth-Gated Loading**: Layout uses `AuthGatedOverlays` to defer loading of auth-only components (MedicationUpdateDialog, MicroCheckIn, TrialBanner, CriticalAlertModal) — guest users never download this code.

**Output Filtering**: AI responses are post-processed before display. Diagnosis language ("you have X") is converted to informational ("symptoms may be consistent with X"). Prescription formats are converted to research references. This happens in `lib/output-safety-filter.ts`.

**Bilingual Architecture**: All UI strings go through `lib/translations.ts` with `tx(key, lang)`. Turkish and English are first-class citizens. The `LanguageProvider` wraps the entire app.

**Family Profiles**: Up to 6 family members per account, each with their own medications, allergies, and health data. The active profile affects all AI interactions.

---

## Contributing

DoctoPal is proprietary software (All Rights Reserved). Contributions are currently limited to the core team.

For bug reports, use the in-app feedback widget or email info@doctopal.com.

---

## Team

Built by two medical students from Turkey:

- **Taha Ahmet Sıbıç** — Co-founder
- **İpek Özen** — Co-founder

All code authored by Claude (Anthropic) under the team's direction via Claude Code.

---

## License

© 2026 DoctoPal Team — All Rights Reserved.

See [LICENSE](LICENSE) for details.
