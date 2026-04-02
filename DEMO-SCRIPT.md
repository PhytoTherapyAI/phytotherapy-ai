# DEMO SCRIPT — Harvard Hackathon
> 3 Scenarios, ~12 minutes total

## Pre-Demo Setup (2 min before)
1. Open https://doctopal.com in Chrome
2. Clear browser cache if needed
3. Open browser console (F12) to monitor for errors
4. Have backup: If site is down, use localhost:3000 with `npm run dev`

---

## Scenario 1: Drug Interaction Check (4 min)

### Steps
1. Click "Demo Hesabi Dene" / "Try Demo Account" on login page
2. Wait for redirect to dashboard
3. Navigate to **Health Assistant** (click the chat icon or "Health Assistant" in menu)
4. Type: `I take Metformin and Lisinopril. I have trouble sleeping. What herbs can help?`
5. Press Enter

### Expected Results
- AI responds within 5 seconds with streaming text
- **St. John's Wort** flagged as DANGEROUS (red) — CYP3A4 interaction with Metformin
- **Valerian Root** recommended as SAFE (green) — 300-600mg, 30min before bed, max 4 weeks
- PubMed sources appear in collapsible "Sources" panel below the message
- Medical disclaimer naturally woven into response

### If Something Fails
- If chat takes >10 seconds: Refresh page, try again
- If no PubMed sources: This is OK for demo, mention "PubMed integration fetches real-time"
- If error message: Navigate to Interaction Checker as backup (Scenario 2)

---

## Scenario 2: Lethal Interaction Warning (3 min)

### Steps
1. Navigate to **Interaction Checker** (from menu or /interaction-checker)
2. In the first drug field, type: `Metformin`
3. In the herb/supplement field, type: `St. John's Wort`
4. Click "Check Interaction" / "Etkileşim Kontrol Et"

### Expected Results
- Red DANGEROUS badge appears prominently
- Explanation: St. John's Wort induces CYP3A4, reduces Metformin efficacy
- PubMed reference links shown
- Alternative safe herbs suggested
- Safety badge colors: Red = Dangerous, Yellow = Caution, Green = Safe

### If Something Fails
- If OpenFDA doesn't resolve: Type generic name "metformin" instead of brand
- If analysis slow: Mention "AI is analyzing real-time PubMed data"

---

## Scenario 3: Blood Test Analysis + PDF (5 min)

### Steps
1. Navigate to **Blood Test** (from menu or /blood-test)
2. Click "Fill Demo Data" button to auto-fill values OR enter manually:
   - Cholesterol (Total): `240` mg/dL
   - Vitamin D: `14` ng/mL
   - Ferritin: `8` ng/mL
   - HbA1c: `6.8` %
3. Click "Analyze" / "Analiz Et"
4. Wait for AI analysis (5-10 seconds)
5. Review all 4 result tabs: Summary, Recommendations, Lifestyle, Triage
6. Click "Download PDF" / "PDF Indir"

### Expected Results
- Cholesterol flagged as HIGH (red) with recommendation
- Vitamin D flagged as DEFICIENT (red) — supplement suggestion 2000-4000 IU/day
- Ferritin flagged as LOW (red) — iron supplementation suggested
- HbA1c flagged as PRE-DIABETIC range
- Lifestyle coaching: diet changes, exercise recommendations
- Triage: Endocrinology and Cardiology referral suggested
- PDF downloads with professional doctor-ready format

### If Something Fails
- If AI analysis slow: "Gemini is analyzing 4 biomarkers against clinical databases"
- If PDF fails: Show the on-screen analysis instead
- If demo data button missing: Enter values manually (listed above)

---

## Backup Plans

### If API is down
- Pre-record a 3-minute video of all scenarios working
- Keep screenshots of successful results

### If Supabase is down
- Demo account still works with cached data
- Health assistant works (only needs Gemini API)

### If Internet is slow
- Run locally: `npm run dev` on laptop
- All features work on localhost:3000

### If Laptop fails
- Have demo video on phone
- Have screenshots in Google Slides presentation

---

## Key Talking Points During Demo

1. "Every recommendation comes with PubMed sources — no AI hallucination"
2. "The red/yellow/green system is inspired by Noom's behavior psychology"
3. "We check interactions BEFORE the AI responds — 3-layer safety architecture"
4. "This PDF can go directly to the patient's doctor — bridging the gap"
5. "Emergency detection works in real-time — chest pain triggers 112 immediately"

## Timing Guide
- Scenario 1: 0:00 - 4:00
- Scenario 2: 4:00 - 7:00
- Scenario 3: 7:00 - 12:00
- Q&A buffer: 3 min
