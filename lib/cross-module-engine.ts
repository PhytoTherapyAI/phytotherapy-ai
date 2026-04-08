// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Cross-Module Inference Engine
// Rule-based clinical logic that detects inter-module patterns
// Runs BEFORE AI to provide deterministic safety rules
// ============================================

import { HealthContext } from "@/lib/health-context";

export type AlertSeverity = "info" | "warning" | "critical";

export interface CrossModuleAlert {
  id: string;
  severity: AlertSeverity;
  title: { en: string; tr: string };
  message: { en: string; tr: string };
  modules: string[];  // which modules contributed
  action?: { en: string; tr: string };  // recommended action
  herb?: { en: string; tr: string };     // phytotherapy suggestion
}

// ── Rule Engine ──
export function runCrossModuleRules(ctx: HealthContext): CrossModuleAlert[] {
  const alerts: CrossModuleAlert[] = [];

  // Rule 1: Sleep deprivation + Heavy training = Injury risk
  const sleepDuration = ctx.sleep.lastNight?.duration || ctx.sleep.weekAvg;
  const hasHeavyTraining = ctx.fitness.sportType && ctx.fitness.frequency >= 3;

  if (sleepDuration > 0 && sleepDuration < 6 && hasHeavyTraining) {
    alerts.push({
      id: "sleep-training-risk",
      severity: "warning",
      title: {
        en: "Training Risk: Sleep Debt Detected",
        tr: "Antrenman Riski: Uyku Borcu Tespit Edildi",
      },
      message: {
        en: `You slept ${sleepDuration}h last night. With your ${ctx.fitness.sportType} training planned, injury risk increases by ~30%. Consider reducing intensity by 20% today.`,
        tr: `Dün gece ${sleepDuration} saat uyudun. Planlı ${ctx.fitness.sportType} antrenmanınla sakatlık riskin ~%30 artıyor. Bugün yoğunluğu %20 azaltmayı düşün.`,
      },
      modules: ["sleep", "fitness"],
      action: {
        en: "Reduce training intensity by 20% and add extra warm-up",
        tr: "Antrenman yoğunluğunu %20 azalt ve ekstra ısınma ekle",
      },
      herb: {
        en: "Rhodiola rosea (300-600mg) or Ashwagandha (300mg) — adaptogenic support for recovery under sleep debt",
        tr: "Rhodiola rosea (300-600mg) veya Ashwagandha (300mg) — uyku borcu altında toparlanma için adaptojenik destek",
      },
    });
  }

  // Rule 2: High stress + Low sleep quality = Cortisol warning
  const hasStress = ctx.sleep.lastNight?.factors.includes("stress");
  const lowQuality = (ctx.sleep.lastNight?.quality || 0) <= 2;

  if (hasStress && lowQuality) {
    alerts.push({
      id: "stress-sleep-cortisol",
      severity: "warning",
      title: {
        en: "Cortisol Alert: Stress + Poor Sleep",
        tr: "Kortizol Uyarısı: Stres + Kötü Uyku",
      },
      message: {
        en: "High stress combined with poor sleep quality can elevate cortisol levels, affecting recovery, immunity, and mood.",
        tr: "Yüksek stres ve düşük uyku kalitesi kortizol seviyelerini yükselterek toparlanma, bağışıklık ve ruh halini etkiler.",
      },
      modules: ["sleep", "mental-health"],
      action: {
        en: "Try a 10-minute breathing exercise before bed tonight",
        tr: "Bu gece yatmadan önce 10 dakikalık nefes egzersizi dene",
      },
      herb: {
        en: "Lemon balm tea (Melissa officinalis) — reduces cortisol and promotes relaxation (Grade B)",
        tr: "Melisa çayı (Melissa officinalis) — kortizolü düşürür ve rahatlamayı destekler (Derece B)",
      },
    });
  }

  // Rule 3: Caffeine factor + Sleep < 6h = Caffeine cycle warning
  const hasCaffeine = ctx.sleep.lastNight?.factors.includes("caffeine");
  if (hasCaffeine && sleepDuration > 0 && sleepDuration < 6) {
    alerts.push({
      id: "caffeine-sleep-cycle",
      severity: "info",
      title: {
        en: "Caffeine-Sleep Cycle Detected",
        tr: "Kafein-Uyku Döngüsü Tespit Edildi",
      },
      message: {
        en: "Late caffeine intake reduced your sleep. Less sleep leads to more caffeine dependency tomorrow — a vicious cycle.",
        tr: "Geç kafein alımı uykunu azalttı. Az uyku yarın daha fazla kafein bağımlılığına yol açar — kısır döngü.",
      },
      modules: ["sleep", "nutrition"],
      action: {
        en: "No caffeine after 2 PM today. Try green tea before noon instead.",
        tr: "Bugün saat 14:00'ten sonra kafein alma. Öğleden önce yeşil çay dene.",
      },
    });
  }

  // Rule 4: Sleep debt > 10h = Recovery priority
  if (ctx.sleep.sleepDebt > 10) {
    alerts.push({
      id: "severe-sleep-debt",
      severity: "critical",
      title: {
        en: "Severe Sleep Debt: Recovery Needed",
        tr: "Ciddi Uyku Borcu: Toparlanma Gerekli",
      },
      message: {
        en: `You're ${ctx.sleep.sleepDebt.toFixed(1)}h behind on sleep this week. This affects cognitive function, immunity, and physical recovery.`,
        tr: `Bu hafta ${ctx.sleep.sleepDebt.toFixed(1)} saat uyku borcun var. Bu bilişsel işlev, bağışıklık ve fiziksel toparlanmayı etkiler.`,
      },
      modules: ["sleep"],
      action: {
        en: "Aim for 9 hours tonight. Skip intense exercise, focus on gentle stretching.",
        tr: "Bu gece 9 saat hedefle. Yoğun egzersiz yapma, hafif esneme yap.",
      },
      herb: {
        en: "Valerian root (300-600mg) + Magnesium glycinate (400mg) before bed for deep sleep support",
        tr: "Kediotu kökü (300-600mg) + Magnezyum glisin (400mg) yatmadan önce derin uyku desteği için",
      },
    });
  }

  // Rule 5: Low energy trend + training day = Overtraining risk
  const avgEnergy = ctx.nutrition.recentCheckIns.length > 0
    ? ctx.nutrition.recentCheckIns.reduce((a, b) => a + b.energy, 0) / ctx.nutrition.recentCheckIns.length
    : -1;

  if (avgEnergy >= 0 && avgEnergy < 3 && hasHeavyTraining) {
    alerts.push({
      id: "low-energy-overtraining",
      severity: "warning",
      title: {
        en: "Low Energy + Training: Overtraining Risk",
        tr: "Düşük Enerji + Antrenman: Aşırı Antrenman Riski",
      },
      message: {
        en: "Your energy levels have been low this week. Combined with heavy training, you may be overtraining.",
        tr: "Bu hafta enerji seviyen düşük. Ağır antrenmanla birlikte aşırı antrenman yapıyor olabilirsin.",
      },
      modules: ["fitness", "nutrition"],
      action: {
        en: "Take a deload day. Focus on mobility and light cardio.",
        tr: "Bir deload günü yap. Hareketlilik ve hafif kardiyo üzerine odaklan.",
      },
      herb: {
        en: "Eleuthero (Siberian ginseng) 300mg — combats fatigue without overstimulation (Grade B)",
        tr: "Eleuthero (Sibirya ginsengi) 300mg — aşırı uyarım olmadan yorgunlukla savaşır (Derece B)",
      },
    });
  }

  // Rule 6: Supplements not taken + training day = Suboptimal performance
  const untakenSupps = ctx.supplements.filter((s) => !s.takenToday);
  if (untakenSupps.length > 0 && hasHeavyTraining) {
    alerts.push({
      id: "missed-supps-training",
      severity: "info",
      title: {
        en: "Supplements Pending Before Training",
        tr: "Antrenman Öncesi Takviyeler Bekliyor",
      },
      message: {
        en: `You haven't taken ${untakenSupps.length} supplement${untakenSupps.length > 1 ? "s" : ""} today: ${untakenSupps.map(s => s.name).join(", ")}. Consider taking them before your workout.`,
        tr: `Bugün ${untakenSupps.length} takviyeni almadın: ${untakenSupps.map(s => s.name).join(", ")}. Antrenman öncesi almayı düşün.`,
      },
      modules: ["supplements", "fitness"],
    });
  }

  // Sort: critical first, then warning, then info
  const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return alerts;
}
