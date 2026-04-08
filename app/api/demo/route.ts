// © 2026 DoctoPal — All Rights Reserved
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@doctopal.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo123456";

function dateStr(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().split("T")[0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceKey) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if demo user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const demoUser = existingUsers?.users?.find(
      (u) => u.email === DEMO_EMAIL
    );

    let userId: string;

    if (demoUser) {
      userId = demoUser.id;
    } else {
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          email_confirm: true,
        });

      if (createError || !newUser.user) {
        return NextResponse.json(
          { error: "Failed to create demo user" },
          { status: 500 }
        );
      }
      userId = newUser.user.id;
    }

    // =========================================
    // 1. Upsert demo profile (matches schema)
    // =========================================
    await supabase.from("user_profiles").upsert({
      id: userId,
      full_name: "Alex Demo",
      age: 35,
      birth_date: "1991-03-15",
      gender: "male",
      onboarding_complete: true,
      onboarding_layer2_complete: true,
      is_pregnant: false,
      is_breastfeeding: false,
      alcohol_use: "occasional",
      smoking_use: "none",
      kidney_disease: false,
      liver_disease: false,
      recent_surgery: false,
      chronic_conditions: ["Type 2 Diabetes", "Hypertension"],
      height_cm: 178,
      weight_kg: 82,
      blood_group: "A+",
      diet_type: "balanced",
      exercise_frequency: "3-4 times/week",
      sleep_quality: "moderate",
      supplements: ["Omega-3", "Vitamin D3", "Magnesium"],
      consent_timestamp: new Date().toISOString(),
      last_medication_update: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // =========================================
    // 2. Seed medications (user_medications table)
    // =========================================
    await supabase.from("user_medications").delete().eq("user_id", userId);
    await supabase.from("user_medications").insert([
      {
        user_id: userId,
        brand_name: "Glucophage",
        generic_name: "Metformin",
        dosage: "500mg",
        frequency: "twice daily",
        is_active: true,
      },
      {
        user_id: userId,
        brand_name: "Zestril",
        generic_name: "Lisinopril",
        dosage: "10mg",
        frequency: "once daily",
        is_active: true,
      },
      {
        user_id: userId,
        brand_name: "Lipitor",
        generic_name: "Atorvastatin",
        dosage: "20mg",
        frequency: "once daily",
        is_active: true,
      },
    ]);

    // =========================================
    // 3. Seed allergies (user_allergies table)
    // =========================================
    await supabase.from("user_allergies").delete().eq("user_id", userId);
    await supabase.from("user_allergies").insert([
      { user_id: userId, allergen: "Penicillin", severity: "severe" },
      { user_id: userId, allergen: "Sulfonamides", severity: "moderate" },
    ]);

    // =========================================
    // 4. Seed consent records
    // =========================================
    const { data: existingConsent } = await supabase
      .from("consent_records")
      .select("id")
      .eq("user_id", userId)
      .limit(1);
    if (!existingConsent?.length) {
      await supabase.from("consent_records").insert([
        {
          user_id: userId,
          consent_type: "medical_disclaimer",
          consent_text:
            "User agreed to medical disclaimer and terms of service during onboarding.",
        },
        {
          user_id: userId,
          consent_type: "terms_of_service",
          consent_text: "User accepted terms of service.",
        },
        {
          user_id: userId,
          consent_type: "privacy_policy",
          consent_text: "User accepted privacy policy.",
        },
      ]);
    }

    // =========================================
    // 5. Seed 35 days of daily check-ins (values 1-5)
    // =========================================
    const checkIns = [];
    for (let i = 0; i < 35; i++) {
      const date = dateStr(i);
      // Simulate a realistic trend: slight improvement over time
      const baseEnergy = i > 20 ? 3 : i > 10 ? 3 : 4;
      const baseSleep = i > 20 ? 3 : i > 10 ? 3 : 4;
      const baseMood = i > 20 ? 3 : i > 10 ? 4 : 4;
      checkIns.push({
        user_id: userId,
        check_date: date,
        energy_level: Math.min(5, Math.max(1, baseEnergy + randomInt(-1, 1))),
        sleep_quality: Math.min(5, Math.max(1, baseSleep + randomInt(-1, 1))),
        mood: Math.min(5, Math.max(1, baseMood + randomInt(-1, 1))),
        bloating: Math.min(5, Math.max(1, randomInt(1, 3))),
        health_score: randomInt(55, 85),
      });
    }
    await supabase
      .from("daily_check_ins")
      .upsert(checkIns, { onConflict: "user_id,check_date" });

    // =========================================
    // 6. Seed query history (more entries)
    // =========================================
    await supabase.from("query_history").delete().eq("user_id", userId);
    await supabase.from("query_history").insert([
      {
        user_id: userId,
        query_text: "Does omega-3 help with inflammation?",
        response_text:
          "Yes, omega-3 fatty acids have strong anti-inflammatory properties. EPA and DHA reduce inflammatory markers like CRP and IL-6. Recommended dose: 1-2g EPA+DHA daily with food for at least 3 months.",
        query_type: "general",
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        user_id: userId,
        query_text:
          "I take Metformin and Lisinopril. Can I use St. John's Wort for sleep?",
        response_text:
          "⚠️ St. John's Wort (Hypericum perforatum) interacts with Metformin — it can affect blood sugar control via CYP3A4 enzyme induction. ✅ Safe alternative: Valerian Root (300-600mg, 1 hour before bed, max 4 weeks). No known interactions with your medications.",
        query_type: "interaction",
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        user_id: userId,
        query_text: "What is the evidence for turmeric?",
        response_text:
          "Turmeric (curcumin) has Grade B evidence for: anti-inflammatory effects, joint pain relief, and digestive support. Dose: 500-1000mg curcumin with piperine (black pepper extract) for absorption. Duration: 8-12 weeks minimum.",
        query_type: "general",
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        user_id: userId,
        query_text: "Is magnesium safe with my blood pressure medication?",
        response_text:
          "Magnesium is generally safe with Lisinopril. In fact, magnesium may complement blood pressure management. Recommended: Magnesium glycinate 200-400mg at bedtime. Monitor for low blood pressure symptoms. Grade B evidence for BP support.",
        query_type: "interaction",
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        user_id: userId,
        query_text: "Best supplements for blood sugar control?",
        response_text:
          "For blood sugar management alongside Metformin: ✅ Berberine 500mg 2x/day (Grade A - comparable to metformin in studies), ✅ Chromium picolinate 200-1000mcg/day (Grade B), ✅ Alpha-lipoic acid 300-600mg/day (Grade B). Always monitor glucose levels closely.",
        query_type: "general",
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        user_id: userId,
        query_text: "Does berberine interact with atorvastatin?",
        response_text:
          "⚠️ Caution: Berberine may increase atorvastatin levels by inhibiting CYP3A4 and P-glycoprotein. This could increase the risk of statin side effects (muscle pain, liver issues). If using both, start berberine at a lower dose (250mg) and monitor for muscle pain. Discuss with your doctor.",
        query_type: "interaction",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        user_id: userId,
        query_text: "How much vitamin D should I take daily?",
        response_text:
          "Based on your blood test showing Vitamin D at 14 ng/mL (deficient), recommended: Vitamin D3 4000 IU/day for 8-12 weeks, then retest. Take with a fat-containing meal for absorption. Add Vitamin K2 (100mcg MK-7) to support calcium metabolism. Grade A evidence.",
        query_type: "general",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ]);

    // =========================================
    // 7. Seed blood test (correct column: test_data)
    // =========================================
    await supabase.from("blood_tests").delete().eq("user_id", userId);
    await supabase.from("blood_tests").insert([
      {
        user_id: userId,
        test_data: {
          cholesterol_total: { value: 240, unit: "mg/dL" },
          hdl: { value: 42, unit: "mg/dL" },
          ldl: { value: 165, unit: "mg/dL" },
          triglycerides: { value: 180, unit: "mg/dL" },
          vitamin_d: { value: 14, unit: "ng/mL" },
          ferritin: { value: 8, unit: "ng/mL" },
          hba1c: { value: 6.8, unit: "%" },
          fasting_glucose: { value: 128, unit: "mg/dL" },
          crp: { value: 3.2, unit: "mg/L" },
          tsh: { value: 2.1, unit: "mIU/L" },
          vitamin_b12: { value: 380, unit: "pg/mL" },
          hemoglobin: { value: 14.2, unit: "g/dL" },
          iron: { value: 55, unit: "mcg/dL" },
          alt: { value: 28, unit: "U/L" },
          ast: { value: 24, unit: "U/L" },
        },
        analysis_result:
          "Key findings: 1) Vitamin D severely deficient (14 ng/mL) — supplement D3 4000 IU/day. 2) Ferritin very low (8 ng/mL) — iron supplementation needed. 3) Total cholesterol elevated (240 mg/dL) with low HDL (42) — lifestyle changes + omega-3. 4) HbA1c 6.8% indicates pre-diabetic range — continue Metformin, add berberine consideration. 5) CRP mildly elevated (3.2) — anti-inflammatory support recommended.",
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        user_id: userId,
        test_data: {
          cholesterol_total: { value: 255, unit: "mg/dL" },
          vitamin_d: { value: 11, unit: "ng/mL" },
          ferritin: { value: 12, unit: "ng/mL" },
          hba1c: { value: 7.1, unit: "%" },
          crp: { value: 4.1, unit: "mg/L" },
          tsh: { value: 2.3, unit: "mIU/L" },
          vitamin_b12: { value: 350, unit: "pg/mL" },
        },
        analysis_result: "Previous test showing higher values before treatment adjustments.",
        created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      },
    ]);

    // =========================================
    // 8. Seed water intake (last 30 days)
    // =========================================
    const waterData = [];
    for (let i = 0; i < 30; i++) {
      waterData.push({
        user_id: userId,
        intake_date: dateStr(i),
        glasses: randomInt(4, 10),
        target_glasses: 8,
      });
    }
    await supabase
      .from("water_intake")
      .upsert(waterData, { onConflict: "user_id,intake_date" });

    // =========================================
    // 9. Seed vital records (weight, BP, blood sugar)
    // =========================================
    await supabase.from("vital_records").delete().eq("user_id", userId);
    const vitals = [];
    for (let i = 0; i < 30; i += 3) {
      // Weight every 3 days (slight downward trend)
      vitals.push({
        user_id: userId,
        vital_type: "weight",
        value: 82 - i * 0.1 + Math.random() * 0.5,
        recorded_at: new Date(Date.now() - i * 86400000).toISOString(),
      });
      // Blood pressure every 3 days
      vitals.push({
        user_id: userId,
        vital_type: "blood_pressure",
        systolic: randomInt(125, 140),
        diastolic: randomInt(78, 88),
        recorded_at: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }
    // Blood sugar weekly
    for (let i = 0; i < 30; i += 7) {
      vitals.push({
        user_id: userId,
        vital_type: "blood_sugar",
        value: randomInt(110, 145),
        recorded_at: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }
    await supabase.from("vital_records").insert(vitals);

    // =========================================
    // 10. Seed calendar events (medications + appointments)
    // =========================================
    await supabase.from("calendar_events").delete().eq("user_id", userId);
    const calEvents = [];
    // Medication events — one entry per med (recurrence: daily)
    calEvents.push({
      user_id: userId,
      event_type: "medication",
      title: "Metformin 500mg",
      event_date: dateStr(0),
      event_time: "08:00",
      recurrence: "daily",
      is_completed: false,
    });
    calEvents.push({
      user_id: userId,
      event_type: "medication",
      title: "Lisinopril 10mg",
      event_date: dateStr(0),
      event_time: "08:00",
      recurrence: "daily",
      is_completed: false,
    });
    calEvents.push({
      user_id: userId,
      event_type: "medication",
      title: "Atorvastatin 20mg",
      event_date: dateStr(0),
      event_time: "21:00",
      recurrence: "daily",
      is_completed: false,
    });
    // Supplement events — one entry per supplement (WashoutCountdown reads these)
    calEvents.push({
      user_id: userId,
      event_type: "supplement",
      title: "Omega-3",
      description: "1000mg",
      event_date: dateStr(30),
      event_time: "12:00",
      recurrence: "daily",
      metadata: { dose: "1000mg", frequency: "daily", cycleDays: 90, breakDays: 14 },
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    });
    calEvents.push({
      user_id: userId,
      event_type: "supplement",
      title: "Vitamin D3",
      description: "2000 IU",
      event_date: dateStr(45),
      event_time: "08:00",
      recurrence: "daily",
      metadata: { dose: "2000 IU", frequency: "daily", cycleDays: 90, breakDays: 14 },
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    });
    calEvents.push({
      user_id: userId,
      event_type: "supplement",
      title: "Magnesium",
      description: "400mg",
      event_date: dateStr(20),
      event_time: "21:00",
      recurrence: "daily",
      metadata: { dose: "400mg", frequency: "daily", cycleDays: 60, breakDays: 10 },
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    });
    // Appointments
    calEvents.push({
      user_id: userId,
      event_type: "appointment",
      title: "Endocrinologist Check-up",
      description: "Quarterly diabetes review",
      event_date: dateStr(-7),
      event_time: "10:30",
      is_completed: false,
    });
    calEvents.push({
      user_id: userId,
      event_type: "sport",
      title: "Morning Jog",
      event_date: dateStr(0),
      event_time: "07:00",
      recurrence: "daily",
      is_completed: false,
    });
    await supabase.from("calendar_events").insert(calEvents);

    // =========================================
    // 11. Seed daily logs (medication completion tracking)
    // =========================================
    await supabase.from("daily_logs").delete().eq("user_id", userId);
    const dailyLogs = [];
    for (let i = 1; i < 14; i++) {
      const d = dateStr(i);
      dailyLogs.push({
        user_id: userId,
        log_date: d,
        item_type: "medication",
        item_id: "metformin-morning",
        item_name: "Metformin 500mg (Morning)",
        completed: true,
        completed_at: new Date(Date.now() - i * 86400000 + 8 * 3600000).toISOString(),
      });
      dailyLogs.push({
        user_id: userId,
        log_date: d,
        item_type: "medication",
        item_id: "lisinopril-morning",
        item_name: "Lisinopril 10mg",
        completed: true,
        completed_at: new Date(Date.now() - i * 86400000 + 8 * 3600000).toISOString(),
      });
      dailyLogs.push({
        user_id: userId,
        log_date: d,
        item_type: "supplement",
        item_id: "omega3",
        item_name: "Omega-3 1000mg",
        completed: randomInt(0, 1) === 1,
      });
    }
    await supabase.from("daily_logs").insert(dailyLogs);

    return NextResponse.json({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      message: "Demo account ready with 35 days of health data",
    });
  } catch (error) {
    console.error("Demo API error:", error);
    return NextResponse.json(
      { error: "Failed to setup demo account" },
      { status: 500 }
    );
  }
}
