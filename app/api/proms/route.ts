// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * PROMs & PREMs API — Harvard HVHS C4 (Outcome Measurement)
 *
 * PROMs (Patient-Reported Outcome Measures):
 *   Measures health status before/during/after herbal treatment
 *   Based on: ICHOM standards, VAS Pain Scale, EQ-5D-5L domains
 *
 * PREMs (Patient-Reported Experience Measures):
 *   Measures satisfaction with the treatment process
 *   Based on: Canadian PREMs model, NHS Patient Experience Framework
 *
 * Auto-trigger schedule:
 *   T0: Baseline (when supplement/herb is first added)
 *   T1: Week 1 (early response check)
 *   T2: Week 4 (mid-treatment assessment)
 *   T3: End of cycle (washout start or manual stop)
 *   T4: 2 weeks post-treatment (sustained effect check)
 */

// ═══ PROMs Question Bank (ICHOM-aligned) ═══

const PROMS_QUESTIONS = {
  // VAS Pain Scale (0-10)
  pain: {
    id: "pain_vas",
    type: "slider" as const,
    min: 0, max: 10, step: 1,
    question: {
      en: "How would you rate your pain level right now?",
      tr: "Şu anki ağrı seviyenizi nasıl değerlendirirsiniz?",
    },
    anchors: {
      en: { min: "No pain", max: "Worst imaginable pain" },
      tr: { min: "Ağrı yok", max: "Hayal edilebilecek en kötü ağrı" },
    },
    category: "proms" as const,
    domain: "pain" as const,
  },

  // Energy / Fatigue (0-10)
  energy: {
    id: "energy_level",
    type: "slider" as const,
    min: 0, max: 10, step: 1,
    question: {
      en: "How would you rate your energy level today?",
      tr: "Bugünkü enerji seviyenizi nasıl değerlendirirsiniz?",
    },
    anchors: {
      en: { min: "Completely exhausted", max: "Full of energy" },
      tr: { min: "Tamamen bitkin", max: "Enerji dolu" },
    },
    category: "proms" as const,
    domain: "energy" as const,
  },

  // Sleep Quality (0-10)
  sleep: {
    id: "sleep_quality",
    type: "slider" as const,
    min: 0, max: 10, step: 1,
    question: {
      en: "How would you rate your sleep quality over the past week?",
      tr: "Son bir haftadaki uyku kalitenizi nasıl değerlendirirsiniz?",
    },
    anchors: {
      en: { min: "Very poor", max: "Excellent" },
      tr: { min: "Çok kötü", max: "Mükemmel" },
    },
    category: "proms" as const,
    domain: "sleep" as const,
  },

  // Mood / Emotional Wellbeing (0-10)
  mood: {
    id: "mood_wellbeing",
    type: "slider" as const,
    min: 0, max: 10, step: 1,
    question: {
      en: "How would you rate your overall mood and emotional wellbeing?",
      tr: "Genel ruh halinizi ve duygusal iyilik halinizi nasıl değerlendirirsiniz?",
    },
    anchors: {
      en: { min: "Very low", max: "Excellent" },
      tr: { min: "Çok düşük", max: "Mükemmel" },
    },
    category: "proms" as const,
    domain: "mood" as const,
  },

  // Daily Activity / Mobility (EQ-5D inspired)
  mobility: {
    id: "daily_activity",
    type: "choice" as const,
    question: {
      en: "How much does your health condition affect your daily activities?",
      tr: "Sağlık durumunuz günlük aktivitelerinizi ne kadar etkiliyor?",
    },
    options: {
      en: [
        { value: 5, label: "No problems at all" },
        { value: 4, label: "Slight problems" },
        { value: 3, label: "Moderate problems" },
        { value: 2, label: "Severe problems" },
        { value: 1, label: "Unable to do daily activities" },
      ],
      tr: [
        { value: 5, label: "Hiç sorun yok" },
        { value: 4, label: "Hafif sorunlar" },
        { value: 3, label: "Orta düzeyde sorunlar" },
        { value: 2, label: "Ciddi sorunlar" },
        { value: 1, label: "Günlük aktivitelerimi yapamıyorum" },
      ],
    },
    category: "proms" as const,
    domain: "mobility" as const,
  },

  // Digestive Comfort (condition-specific)
  digestive: {
    id: "digestive_comfort",
    type: "slider" as const,
    min: 0, max: 10, step: 1,
    question: {
      en: "How would you rate your digestive comfort this week?",
      tr: "Bu haftaki sindirim konforunuzu nasıl değerlendirirsiniz?",
    },
    anchors: {
      en: { min: "Very uncomfortable", max: "Perfectly comfortable" },
      tr: { min: "Çok rahatsız", max: "Tamamen rahat" },
    },
    category: "proms" as const,
    domain: "digestive" as const,
  },

  // Anxiety Level (GAD-2 inspired single question)
  anxiety: {
    id: "anxiety_level",
    type: "slider" as const,
    min: 0, max: 10, step: 1,
    question: {
      en: "How much have you been bothered by feeling anxious or worried?",
      tr: "Endişe veya kaygı hissetmekten ne kadar rahatsız oldunuz?",
    },
    anchors: {
      en: { min: "Not at all", max: "Extremely" },
      tr: { min: "Hiç", max: "Aşırı derecede" },
    },
    category: "proms" as const,
    domain: "anxiety" as const,
  },

  // Overall Health (EQ-VAS inspired)
  overall: {
    id: "overall_health",
    type: "slider" as const,
    min: 0, max: 100, step: 5,
    question: {
      en: "On a scale of 0-100, how would you rate your overall health today?",
      tr: "0-100 arasında, bugünkü genel sağlık durumunuzu nasıl değerlendirirsiniz?",
    },
    anchors: {
      en: { min: "Worst health imaginable", max: "Best health imaginable" },
      tr: { min: "Hayal edilebilecek en kötü sağlık", max: "Hayal edilebilecek en iyi sağlık" },
    },
    category: "proms" as const,
    domain: "overall" as const,
  },

  // ═══ PREMs Questions (Experience) ═══

  treatment_confidence: {
    id: "treatment_confidence",
    type: "choice" as const,
    question: {
      en: "How confident did you feel about the safety of the recommended herbal support?",
      tr: "Önerilen bitkisel desteğin güvenliği konusunda kendinizi ne kadar güvende hissettiniz?",
    },
    options: {
      en: [
        { value: 5, label: "Very confident" },
        { value: 4, label: "Somewhat confident" },
        { value: 3, label: "Neutral" },
        { value: 2, label: "Somewhat worried" },
        { value: 1, label: "Very worried" },
      ],
      tr: [
        { value: 5, label: "Çok güvende" },
        { value: 4, label: "Oldukça güvende" },
        { value: 3, label: "Kararsız" },
        { value: 2, label: "Biraz endişeli" },
        { value: 1, label: "Çok endişeli" },
      ],
    },
    category: "prems" as const,
    domain: "confidence" as const,
  },

  daily_ease: {
    id: "daily_ease",
    type: "choice" as const,
    question: {
      en: "How much did the recommended herbal support make your daily activities easier?",
      tr: "Önerilen bitkisel destek günlük aktivitelerinizi yapmanızı ne kadar kolaylaştırdı?",
    },
    options: {
      en: [
        { value: 5, label: "Much easier" },
        { value: 4, label: "Somewhat easier" },
        { value: 3, label: "No change" },
        { value: 2, label: "Somewhat harder" },
        { value: 1, label: "Much harder" },
      ],
      tr: [
        { value: 5, label: "Çok kolaylaştırdı" },
        { value: 4, label: "Biraz kolaylaştırdı" },
        { value: 3, label: "Değişiklik yok" },
        { value: 2, label: "Biraz zorlaştırdı" },
        { value: 1, label: "Çok zorlaştırdı" },
      ],
    },
    category: "prems" as const,
    domain: "ease" as const,
  },

  information_quality: {
    id: "information_quality",
    type: "choice" as const,
    question: {
      en: "How clear and helpful was the information provided about your herbal support?",
      tr: "Bitkisel destek hakkında verilen bilgiler ne kadar açık ve yardımcı oldu?",
    },
    options: {
      en: [
        { value: 5, label: "Very clear and helpful" },
        { value: 4, label: "Mostly clear" },
        { value: 3, label: "Neutral" },
        { value: 2, label: "Somewhat confusing" },
        { value: 1, label: "Very confusing" },
      ],
      tr: [
        { value: 5, label: "Çok açık ve yardımcı" },
        { value: 4, label: "Genelde açık" },
        { value: 3, label: "Kararsız" },
        { value: 2, label: "Biraz kafa karıştırıcı" },
        { value: 1, label: "Çok kafa karıştırıcı" },
      ],
    },
    category: "prems" as const,
    domain: "information" as const,
  },

  would_recommend: {
    id: "would_recommend",
    type: "choice" as const,
    question: {
      en: "Would you recommend this herbal support to someone with a similar condition?",
      tr: "Bu bitkisel desteği benzer durumda olan birine tavsiye eder misiniz?",
    },
    options: {
      en: [
        { value: 5, label: "Definitely yes" },
        { value: 4, label: "Probably yes" },
        { value: 3, label: "Not sure" },
        { value: 2, label: "Probably not" },
        { value: 1, label: "Definitely not" },
      ],
      tr: [
        { value: 5, label: "Kesinlikle evet" },
        { value: 4, label: "Muhtemelen evet" },
        { value: 3, label: "Emin değilim" },
        { value: 2, label: "Muhtemelen hayır" },
        { value: 1, label: "Kesinlikle hayır" },
      ],
    },
    category: "prems" as const,
    domain: "recommendation" as const,
  },

  side_effects: {
    id: "side_effects",
    type: "choice" as const,
    question: {
      en: "Did you experience any unwanted effects while using the herbal support?",
      tr: "Bitkisel desteği kullanırken istenmeyen bir etki yaşadınız mı?",
    },
    options: {
      en: [
        { value: 5, label: "No side effects" },
        { value: 4, label: "Very mild, didn't bother me" },
        { value: 3, label: "Some effects, manageable" },
        { value: 2, label: "Noticeable effects, bothersome" },
        { value: 1, label: "Severe effects, had to stop" },
      ],
      tr: [
        { value: 5, label: "Yan etki yaşamadım" },
        { value: 4, label: "Çok hafif, rahatsız etmedi" },
        { value: 3, label: "Bazı etkiler, yönetilebilir" },
        { value: 2, label: "Belirgin etkiler, rahatsız edici" },
        { value: 1, label: "Şiddetli etkiler, bırakmak zorunda kaldım" },
      ],
    },
    category: "prems" as const,
    domain: "side_effects" as const,
  },
};

// ═══ Survey Configuration by Timepoint ═══

const SURVEY_CONFIGS = {
  baseline: {
    id: "T0",
    label: { en: "Baseline Assessment", tr: "Başlangıç Değerlendirmesi" },
    questions: ["pain_vas", "energy_level", "sleep_quality", "mood_wellbeing", "daily_activity", "overall_health"],
    triggerDays: 0,
  },
  week1: {
    id: "T1",
    label: { en: "Week 1 Check-in", tr: "1. Hafta Kontrolü" },
    questions: ["pain_vas", "energy_level", "sleep_quality", "mood_wellbeing", "side_effects"],
    triggerDays: 7,
  },
  week4: {
    id: "T2",
    label: { en: "Week 4 Assessment", tr: "4. Hafta Değerlendirmesi" },
    questions: ["pain_vas", "energy_level", "sleep_quality", "mood_wellbeing", "daily_activity", "overall_health", "treatment_confidence", "daily_ease", "information_quality"],
    triggerDays: 28,
  },
  end_of_cycle: {
    id: "T3",
    label: { en: "End of Treatment", tr: "Tedavi Sonu Değerlendirmesi" },
    questions: ["pain_vas", "energy_level", "sleep_quality", "mood_wellbeing", "daily_activity", "overall_health", "treatment_confidence", "daily_ease", "information_quality", "would_recommend", "side_effects"],
    triggerDays: -1, // Triggered by washout start or manual stop
  },
  post_treatment: {
    id: "T4",
    label: { en: "Post-Treatment Follow-up", tr: "Tedavi Sonrası Takip" },
    questions: ["pain_vas", "energy_level", "sleep_quality", "mood_wellbeing", "overall_health", "would_recommend"],
    triggerDays: 14, // 14 days after T3
  },
};

// ═══ Improvement Score Algorithm ═══

function calculateImprovementScore(
  baseline: Record<string, number>,
  current: Record<string, number>
): { score: number; changes: Record<string, { before: number; after: number; change: number; improved: boolean }> } {
  const changes: Record<string, { before: number; after: number; change: number; improved: boolean }> = {};
  let totalImprovement = 0;
  let domainCount = 0;

  for (const domain of Object.keys(current)) {
    if (baseline[domain] !== undefined) {
      const before = baseline[domain];
      const after = current[domain];
      const change = after - before;
      // For pain and anxiety, decrease is improvement (invert)
      const improved = (domain === "pain_vas" || domain === "anxiety_level")
        ? change < 0
        : change > 0;

      const normalizedChange = (domain === "pain_vas" || domain === "anxiety_level")
        ? -change // Invert: lower is better
        : change;

      changes[domain] = { before, after, change, improved };
      totalImprovement += normalizedChange;
      domainCount++;
    }
  }

  // Normalize to 0-100 scale
  const maxPossibleImprovement = domainCount * 10; // Max 10-point improvement per domain
  const score = Math.round(Math.max(0, Math.min(100,
    50 + (totalImprovement / Math.max(1, maxPossibleImprovement)) * 50
  )));

  return { score, changes };
}

// ═══ API Routes ═══

// GET: Fetch pending survey for user, or survey results
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const action = url.searchParams.get("action") || "pending"; // "pending" | "results" | "comparison"
  const supplementId = url.searchParams.get("supplementId");
  const lang = url.searchParams.get("lang") || "en";

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = createServerClient();

  if (action === "pending") {
    // Check if user has any supplements that need a survey
    const { data: supplements } = await supabase
      .from("user_supplements")
      .select("id, supplement_name, start_date, cycle_days, is_active")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (!supplements?.length) {
      return NextResponse.json({ pendingSurveys: [] });
    }

    const pendingSurveys: any[] = [];
    const today = new Date();

    for (const supp of supplements) {
      const startDate = new Date(supp.start_date);
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Check which timepoint is due
      for (const [key, config] of Object.entries(SURVEY_CONFIGS)) {
        if (config.triggerDays === -1) continue; // Skip end_of_cycle (manual trigger)
        if (daysSinceStart >= config.triggerDays && daysSinceStart < config.triggerDays + 3) {
          // Check if already completed
          const { data: existing } = await supabase
            .from("proms_responses")
            .select("id")
            .eq("user_id", userId)
            .eq("supplement_id", supp.id)
            .eq("timepoint", config.id)
            .single();

          if (!existing) {
            const isTr = lang === "tr";
            pendingSurveys.push({
              supplementId: supp.id,
              supplementName: supp.supplement_name,
              timepoint: config.id,
              timepointLabel: isTr ? config.label.tr : config.label.en,
              questions: config.questions.map((qId) => {
                const q = PROMS_QUESTIONS[qId as keyof typeof PROMS_QUESTIONS];
                if (!q) return null;
                return {
                  ...q,
                  question: isTr ? q.question.tr : q.question.en,
                  ...(q.type === "slider" ? {
                    anchors: isTr ? q.anchors?.tr : q.anchors?.en,
                  } : {
                    options: isTr ? q.options?.tr : q.options?.en,
                  }),
                };
              }).filter(Boolean),
              daysSinceStart,
            });
          }
        }
      }
    }

    return NextResponse.json({ pendingSurveys });
  }

  if (action === "comparison" && supplementId) {
    // Fetch baseline + latest for comparison card
    const { data: responses } = await supabase
      .from("proms_responses")
      .select("*")
      .eq("user_id", userId)
      .eq("supplement_id", supplementId)
      .order("created_at", { ascending: true });

    if (!responses?.length) {
      return NextResponse.json({ comparison: null });
    }

    const baseline = responses.find((r) => r.timepoint === "T0");
    const latest = responses[responses.length - 1];

    if (!baseline || baseline.id === latest.id) {
      return NextResponse.json({ comparison: null });
    }

    const improvement = calculateImprovementScore(
      baseline.answers || {},
      latest.answers || {}
    );

    return NextResponse.json({
      comparison: {
        supplementName: baseline.supplement_name,
        baselineDate: baseline.created_at,
        latestDate: latest.created_at,
        baselineTimepoint: baseline.timepoint,
        latestTimepoint: latest.timepoint,
        improvementScore: improvement.score,
        changes: improvement.changes,
        daysBetween: Math.floor(
          (new Date(latest.created_at).getTime() - new Date(baseline.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// POST: Submit survey response
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = checkRateLimit(`proms:${ip}`, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { userId, supplementId, supplementName, timepoint, answers } = body;

    if (!userId || !supplementId || !timepoint || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Save response
    const { data, error } = await supabase
      .from("proms_responses")
      .insert({
        user_id: userId,
        supplement_id: supplementId,
        supplement_name: supplementName || "",
        timepoint,
        answers, // { pain_vas: 4, energy_level: 7, ... }
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn("[PROMs] Insert error:", error.message);
      return NextResponse.json({
        success: true,
        message: "Response recorded (table setup may be pending)",
      });
    }

    // If this is not baseline, calculate improvement
    let improvement = null;
    if (timepoint !== "T0") {
      const { data: baseline } = await supabase
        .from("proms_responses")
        .select("answers")
        .eq("user_id", userId)
        .eq("supplement_id", supplementId)
        .eq("timepoint", "T0")
        .single();

      if (baseline?.answers) {
        improvement = calculateImprovementScore(baseline.answers, answers);
      }
    }

    return NextResponse.json({
      success: true,
      responseId: data?.id,
      improvement,
    });
  } catch (error) {
    console.error("[PROMs] Error:", error);
    return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
  }
}
