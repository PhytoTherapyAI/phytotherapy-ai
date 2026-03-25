# Hackathon Preparation — April 11-12, 2026

## Demo Scenarios (3 Prepared)

### Demo 1 — Drug Interaction Check (LIVE — jury types their own)
**Setup:** Navigate to /interaction-checker
**Script:**
1. Type: "Metformin" + "Lisinopril"
2. Enter concern: "I have trouble sleeping"
3. Show results:
   - RED: St. John's Wort — CYP3A4 interaction with Metformin
   - GREEN: Valerian Root — safe, 300-600mg, 4 weeks max
4. Click "Add to my supplements" on Valerian
5. Show calendar — supplement added with cycle tracking
6. Share the interaction moment card

**Fallback if API slow:** Have a pre-loaded result screenshot ready

### Demo 2 — Free-form Health Question (Berberine)
**Setup:** Navigate to /health-assistant
**Script:**
1. Ask: "Does berberine work for blood sugar control?"
2. Show streaming response with PubMed references
3. Expand Sources panel — show real PubMed links
4. Show evidence grades (A/B/C)

**Fallback:** Pre-record a video of the streaming response

### Demo 3 — Blood Test Analysis
**Setup:** Navigate to /blood-test
**Script:**
1. Upload a sample blood test PDF OR enter manually:
   - Total Cholesterol: 240 mg/dL (HIGH)
   - Vitamin D: 14 ng/mL (LOW)
   - Ferritin: 8 ng/mL (LOW)
   - HbA1c: 6.8% (BORDERLINE HIGH)
2. Show 4-tab results:
   - Results tab: color-coded markers
   - Supplements tab: Omega-3, D3, Iron with evidence grades
   - Lifestyle tab: dietary + exercise advice
   - Doctor tab: discussion points + PDF download
3. Download doctor PDF report

**Fallback:** Pre-generate a PDF report to show

---

## Pitch Deck — 10 Slides

### Slide 1: Problem
"Every year, thousands of people experience dangerous herb-drug interactions because there's no bridge between modern medicine and traditional plant remedies."
- 8 in 10 people use some form of herbal supplement
- Most don't tell their doctor
- Drug-herb interactions can be life-threatening

### Slide 2: Solution
"Phytotherapy.ai — the world's first Evidence-Based Integrative Medicine Assistant"
- AI-powered health companion
- Combines drug data + herbal medicine + personal health profile
- Every recommendation backed by PubMed research

### Slide 3: Live Demo
(Run Demo 1 — Metformin + sleep)

### Slide 4: Architecture — 3-Layer Safety
1. RED CODE FILTER — Emergency detection BEFORE AI
2. DRUG INTERACTION ENGINE — OpenFDA + Gemini hybrid
3. RAG ENGINE — PubMed live search + AI analysis
"Safety is not a feature — it's the foundation"

### Slide 5: Features
- Health Assistant (RAG + streaming)
- Drug Interaction Checker (real-time)
- Blood Test Analysis (30 markers + PDF report)
- Health Calendar (medication tracking, supplements, reminders)
- Dashboard (daily score, bio age, metabolic portfolio)
- Family Profiles (manage family health)

### Slide 6: Market
- $84B global herbal medicine market (growing 8% YoY)
- Turkey: 84M population, 70%+ use herbal remedies
- Gap: NO product bridges modern + herbal medicine safely
- MENA region: zero competition

### Slide 7: Business Model
- Freemium B2C: Free (20 queries/day) → Premium ($10/mo)
- B2B: Doctor panel ($50/mo) — patient tracking, AI summaries
- Insurance: Wellbeing program integration
- Revenue: Break-even at 1,000 users + 8% premium conversion

### Slide 8: Traction
- Live at phytotherapy.ai
- Full-stack app: Next.js + Supabase + Gemini AI
- 200+ supplement database with dosing
- TR + EN bilingual
- 3 medical students building the future of integrative medicine

### Slide 9: Team
- 3 medical students from Turkey
- Deep domain knowledge in both modern + traditional medicine
- Technical development with Claude AI
- Harvard hackathon → global health vision

### Slide 10: Ask / Vision
"We're building the bridge between what nature offers and what science proves."
- Next: Google OAuth, mobile app, doctor partnerships
- Vision: Standard-of-care tool for integrative medicine globally
- Ask: Mentorship, pilot partnerships with clinics

---

## Backup Plans

### If Gemini API is down:
1. Chat: Show cached demo conversation (pre-recorded)
2. Interaction checker: Static fallback response for Metformin scenario
3. Blood test: Pre-computed analysis JSON

### If Supabase is down:
1. All features work in guest mode (localStorage)
2. Calendar works with localStorage
3. Show screenshots of authenticated experience

### If demo laptop fails:
1. Have phone ready with phytotherapy.ai open
2. Pre-record 3-minute demo video as backup
3. Team member laptop as secondary

### If internet is slow:
1. Use mobile hotspot
2. Pre-load all pages before demo
3. Have pre-recorded video ready

---

## Performance Checklist

- [ ] Test Gemini API response times (target < 5s)
- [ ] Test all 3 demo scenarios end-to-end
- [ ] Verify dark/light mode works
- [ ] Verify TR/EN toggle works
- [ ] Check mobile responsiveness
- [ ] Clear browser cache before demo
- [ ] Pre-login to test account
- [ ] Have demo values ready to paste

---

## SEO & Meta Tags Checklist

- [x] Title: "Phytotherapy.ai — Evidence-Based Integrative Medicine Assistant"
- [x] Meta description set
- [x] Open Graph tags
- [ ] Verify phytotherapy.ai loads correctly
- [ ] robots.txt allows indexing
- [ ] sitemap.xml exists

---

## Final Pre-Demo Checklist (Day Of)

1. [ ] Open phytotherapy.ai in Chrome (incognito for demo)
2. [ ] Login with demo account
3. [ ] Complete onboarding with demo profile
4. [ ] Test Interaction Checker with Metformin
5. [ ] Test Health Assistant with berberine question
6. [ ] Test Blood Test with sample values
7. [ ] Verify PDF download works
8. [ ] Check calendar has sample data
9. [ ] Check dashboard scores display
10. [ ] Prepare pitch deck (Google Slides or PDF)
11. [ ] Charge laptop + have charger ready
12. [ ] Phone on hotspot standby
13. [ ] Team aligned on who presents what
