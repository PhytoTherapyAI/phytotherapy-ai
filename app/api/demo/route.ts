import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = "demo@phytotherapy.ai";
const DEMO_PASSWORD = "demo123456";
const DEMO_PROFILE = {
  full_name: "Demo User",
  age: 35,
  birth_date: "1991-03-15",
  gender: "male",
  onboarding_complete: true,
  medications: ["Metformin 500mg", "Lisinopril 10mg"],
  allergies: ["Penicillin"],
  smoking: "none",
  alcohol: "occasional",
  chronic_conditions: ["Type 2 Diabetes", "Hypertension"],
  kidney_disease: false,
  liver_disease: false,
  pregnant: false,
  breastfeeding: false,
  plan: "premium",
  supplements: [
    {
      name: "Omega-3",
      nameEn: "Omega-3",
      dose: "1000mg",
      frequency: "daily",
      cycleDays: 90,
      breakDays: 14,
      startDate: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
    },
    {
      name: "D3 Vitamini",
      nameEn: "Vitamin D3",
      dose: "2000 IU",
      frequency: "daily",
      cycleDays: 90,
      breakDays: 14,
      startDate: new Date(Date.now() - 45 * 86400000).toISOString().split("T")[0],
    },
  ],
};

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
      // Create demo user
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

    // Upsert demo profile
    await supabase.from("user_profiles").upsert({
      id: userId,
      ...DEMO_PROFILE,
      updated_at: new Date().toISOString(),
    });

    // Seed demo check-ins (last 7 days)
    const checkIns = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - i * 86400000)
        .toISOString()
        .split("T")[0];
      checkIns.push({
        user_id: userId,
        check_date: date,
        energy_level: Math.floor(Math.random() * 3) + 6, // 6-8
        sleep_quality: Math.floor(Math.random() * 3) + 6,
        mood: Math.floor(Math.random() * 3) + 6,
        bloating: Math.floor(Math.random() * 3) + 1, // 1-3
      });
    }
    await supabase
      .from("daily_check_ins")
      .upsert(checkIns, { onConflict: "user_id,check_date" });

    // Seed demo query history
    const queries = [
      {
        user_id: userId,
        query_text: "Does omega-3 help with inflammation?",
        response_text:
          "Yes, omega-3 fatty acids have strong anti-inflammatory properties. EPA and DHA reduce inflammatory markers like CRP and IL-6. Recommended dose: 1-2g EPA+DHA daily with food for at least 3 months.",
        query_type: "general",
      },
      {
        user_id: userId,
        query_text:
          "I take Metformin and Lisinopril. Can I use St. John's Wort for sleep?",
        response_text:
          "⚠️ St. John's Wort (Hypericum perforatum) interacts with Metformin — it can affect blood sugar control via CYP3A4 enzyme induction. ✅ Safe alternative: Valerian Root (300-600mg, 1 hour before bed, max 4 weeks). No known interactions with your medications.",
        query_type: "interaction",
      },
      {
        user_id: userId,
        query_text: "What is the evidence for turmeric?",
        response_text:
          "Turmeric (curcumin) has Grade B evidence for: anti-inflammatory effects, joint pain relief, and digestive support. Dose: 500-1000mg curcumin with piperine (black pepper extract) for absorption. Duration: 8-12 weeks minimum.",
        query_type: "general",
      },
    ];
    // Just insert, ignore conflicts
    await supabase.from("query_history").insert(queries).select();

    // Seed demo blood test
    await supabase.from("blood_tests").upsert(
      {
        user_id: userId,
        test_date: new Date(Date.now() - 14 * 86400000)
          .toISOString()
          .split("T")[0],
        markers: {
          cholesterol_total: { value: 240, unit: "mg/dL" },
          vitamin_d: { value: 14, unit: "ng/mL" },
          ferritin: { value: 8, unit: "ng/mL" },
          hba1c: { value: 6.8, unit: "%" },
          crp: { value: 3.2, unit: "mg/L" },
          tsh: { value: 2.1, unit: "mIU/L" },
          vitamin_b12: { value: 380, unit: "pg/mL" },
        },
      },
      { onConflict: "user_id,test_date" }
    );

    return NextResponse.json({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      message: "Demo account ready",
    });
  } catch (error) {
    console.error("Demo API error:", error);
    return NextResponse.json(
      { error: "Failed to setup demo account" },
      { status: 500 }
    );
  }
}
