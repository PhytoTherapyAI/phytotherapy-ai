// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Health Analytics Engine — Mock Data + Algorithms
// ============================================
// Generates realistic health timelines showing supplement
// correlations, peer benchmarks, anomaly detection, and predictions.

export interface HealthTimeline {
  date: string;
  day: number;
  supplements: string[];
  crp?: number;
  hba1c?: number;
  deepSleep?: number;
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
  energyScore?: number;
  moodScore?: number;
  fastingGlucose?: number;
}

export interface PeerBenchmark {
  metric: string;
  metricTr: string;
  unit: string;
  userValue: number;
  peerAverage: number;
  peerTop10: number;
  peerBottom10: number;
  percentile: number;
  peerCount: number;
  lowerIsBetter: boolean;
}

export interface Anomaly {
  date: string;
  day: number;
  metric: string;
  metricTr: string;
  value: number;
  expected: number;
  deviation: number;
  severity: "info" | "warning" | "alert";
  possibleCause: string;
  possibleCauseTr: string;
}

export interface Prediction {
  metric: string;
  metricTr: string;
  unit: string;
  currentValue: number;
  predictedValue3m: number;
  predictedValue6m: number;
  confidence: number;
  trend: "improving" | "stable" | "declining";
  message: string;
  messageTr: string;
}

export interface SupplementPeriod {
  name: string;
  nameTr: string;
  startDay: number;
  color: string;
  colorBg: string;
}

// ── Supplement periods ────────────────────────
const SUPPLEMENT_PERIODS: SupplementPeriod[] = [
  { name: "Curcumin", nameTr: "Kurkumin", startDay: 15, color: "#10b981", colorBg: "rgba(16,185,129,0.08)" },
  { name: "Valerian Root", nameTr: "Kediotu", startDay: 30, color: "#6366f1", colorBg: "rgba(99,102,241,0.08)" },
  { name: "Berberine", nameTr: "Berberin", startDay: 45, color: "#a855f7", colorBg: "rgba(168,85,247,0.08)" },
];

// ── Random with seed for reproducibility ──────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gaussianNoise(rand: () => number, stddev: number): number {
  const u1 = rand();
  const u2 = rand();
  return stddev * Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
}

// ── Generate Health Timeline ──────────────────
export function generateHealthTimeline(userId: string, months: number = 6): HealthTimeline[] {
  const seed = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) || 42;
  const rand = seededRandom(seed);
  const days = months * 30;
  const timeline: HealthTimeline[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];

    const supplements: string[] = [];
    if (d >= 15) supplements.push("Curcumin");
    if (d >= 30) supplements.push("Valerian Root");
    if (d >= 45) supplements.push("Berberine");

    // CRP: baseline 3.2, drops after curcumin (day 15) to ~1.8 over 60 days
    let crp = 3.2;
    if (d >= 15) {
      const progress = Math.min((d - 15) / 60, 1);
      crp = 3.2 - 1.4 * progress;
    }
    crp += gaussianNoise(rand, 0.15);
    crp = Math.max(0.3, Math.round(crp * 100) / 100);

    // HbA1c: baseline 6.8, gradual improvement after berberine (day 45)
    let hba1c = 6.8;
    if (d >= 45) {
      const progress = Math.min((d - 45) / 90, 1);
      hba1c = 6.8 - 0.7 * progress;
    }
    hba1c += gaussianNoise(rand, 0.05);
    hba1c = Math.max(5.0, Math.round(hba1c * 100) / 100);

    // Deep sleep: baseline 1.2h, increases after valerian (day 30)
    let deepSleep = 1.2;
    if (d >= 30) {
      const progress = Math.min((d - 30) / 45, 1);
      deepSleep = 1.2 + 0.9 * progress;
    }
    deepSleep += gaussianNoise(rand, 0.15);
    deepSleep = Math.max(0.3, Math.round(deepSleep * 100) / 100);

    // Heart rate: baseline 74, slight improvement over time
    let heartRate = 74 - (d / days) * 4;
    heartRate += gaussianNoise(rand, 2);
    heartRate = Math.round(Math.max(56, Math.min(90, heartRate)));

    // Blood pressure
    let systolic = 132 - (d / days) * 8;
    systolic += gaussianNoise(rand, 3);
    systolic = Math.round(Math.max(110, Math.min(150, systolic)));
    let diastolic = 85 - (d / days) * 5;
    diastolic += gaussianNoise(rand, 2);
    diastolic = Math.round(Math.max(65, Math.min(95, diastolic)));

    // Energy score: baseline 5, improves with supplements
    let energyScore = 5;
    if (d >= 15) energyScore += Math.min((d - 15) / 60, 1) * 1.5;
    if (d >= 30) energyScore += Math.min((d - 30) / 45, 1) * 1.0;
    energyScore += gaussianNoise(rand, 0.5);
    energyScore = Math.max(1, Math.min(10, Math.round(energyScore * 10) / 10));

    // Mood score
    let moodScore = 5.5;
    if (d >= 30) moodScore += Math.min((d - 30) / 60, 1) * 1.5;
    moodScore += gaussianNoise(rand, 0.4);
    moodScore = Math.max(1, Math.min(10, Math.round(moodScore * 10) / 10));

    // Fasting glucose: baseline 126, drops after berberine
    let fastingGlucose = 126;
    if (d >= 45) {
      const progress = Math.min((d - 45) / 75, 1);
      fastingGlucose = 126 - 15 * progress;
    }
    fastingGlucose += gaussianNoise(rand, 3);
    fastingGlucose = Math.round(Math.max(80, Math.min(160, fastingGlucose)));

    // Inject anomalies
    if (d === 67) heartRate = 98; // unexpected HR spike
    if (d === 82) deepSleep = 0.4; // sleep disruption
    if (d === 110) crp = 4.1; // CRP spike (possible infection)

    timeline.push({
      date: dateStr,
      day: d,
      supplements,
      crp,
      hba1c,
      deepSleep,
      heartRate,
      systolic,
      diastolic,
      energyScore,
      moodScore,
      fastingGlucose,
    });
  }

  return timeline;
}

export function getSupplementPeriods(): SupplementPeriod[] {
  return SUPPLEMENT_PERIODS;
}

// ── Peer Benchmarks ───────────────────────────
export function generatePeerBenchmarks(userTimeline: HealthTimeline[]): PeerBenchmark[] {
  const recent = userTimeline.slice(-14);
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const userCrp = avg(recent.map((d) => d.crp ?? 3));
  const userHba1c = avg(recent.map((d) => d.hba1c ?? 6.5));
  const userSleep = avg(recent.map((d) => d.deepSleep ?? 1.5));
  const userEnergy = avg(recent.map((d) => d.energyScore ?? 5));
  const userHR = avg(recent.map((d) => d.heartRate ?? 72));
  const userSystolic = avg(recent.map((d) => d.systolic ?? 125));

  return [
    {
      metric: "CRP", metricTr: "CRP", unit: "mg/L",
      userValue: round2(userCrp), peerAverage: 2.8, peerTop10: 0.9, peerBottom10: 5.2,
      percentile: clampPercentile(100 - ((userCrp - 0.5) / 5.5) * 100),
      peerCount: 1247, lowerIsBetter: true,
    },
    {
      metric: "HbA1c", metricTr: "HbA1c", unit: "%",
      userValue: round2(userHba1c), peerAverage: 6.5, peerTop10: 5.4, peerBottom10: 7.8,
      percentile: clampPercentile(100 - ((userHba1c - 5.0) / 3.5) * 100),
      peerCount: 1247, lowerIsBetter: true,
    },
    {
      metric: "Deep Sleep", metricTr: "Derin Uyku", unit: "h",
      userValue: round2(userSleep), peerAverage: 1.5, peerTop10: 2.3, peerBottom10: 0.7,
      percentile: clampPercentile(((userSleep - 0.3) / 2.5) * 100),
      peerCount: 1247, lowerIsBetter: false,
    },
    {
      metric: "Energy", metricTr: "Enerji", unit: "/10",
      userValue: round2(userEnergy), peerAverage: 5.8, peerTop10: 8.2, peerBottom10: 3.4,
      percentile: clampPercentile(((userEnergy - 1) / 9) * 100),
      peerCount: 1247, lowerIsBetter: false,
    },
    {
      metric: "Resting HR", metricTr: "Dinlenme Nabzı", unit: "bpm",
      userValue: Math.round(userHR), peerAverage: 72, peerTop10: 58, peerBottom10: 85,
      percentile: clampPercentile(100 - ((userHR - 50) / 45) * 100),
      peerCount: 1247, lowerIsBetter: true,
    },
    {
      metric: "Systolic BP", metricTr: "Sistolik KB", unit: "mmHg",
      userValue: Math.round(userSystolic), peerAverage: 128, peerTop10: 115, peerBottom10: 145,
      percentile: clampPercentile(100 - ((userSystolic - 100) / 55) * 100),
      peerCount: 1247, lowerIsBetter: true,
    },
  ];
}

// ── Anomaly Detection ─────────────────────────
export function detectAnomalies(timeline: HealthTimeline[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const metrics: Array<{
    key: keyof HealthTimeline;
    label: string;
    labelTr: string;
    causes: Record<string, [string, string]>;
  }> = [
    {
      key: "heartRate", label: "Heart Rate", labelTr: "Kalp Atış Hızı",
      causes: {
        high: ["Possible stress, caffeine, or physical activity", "Olası stres, kafein veya fiziksel aktivite"],
        low: ["Good cardiovascular adaptation", "İyi kardiyovasküler adaptasyon"],
      },
    },
    {
      key: "deepSleep", label: "Deep Sleep", labelTr: "Derin Uyku",
      causes: {
        high: ["Excellent recovery after physical activity", "Fiziksel aktivite sonrası mükemmel toparlanma"],
        low: ["Possible stress, late screen time, or caffeine", "Olası stres, geç ekran süresi veya kafein"],
      },
    },
    {
      key: "crp", label: "CRP", labelTr: "CRP",
      causes: {
        high: ["Possible acute infection or inflammation", "Olası akut enfeksiyon veya iltihaplanma"],
        low: ["Effective anti-inflammatory protocol", "Etkili anti-inflamatuar protokol"],
      },
    },
    {
      key: "energyScore", label: "Energy Score", labelTr: "Enerji Skoru",
      causes: {
        high: ["Supplement synergy or good recovery", "Takviye sinerjisi veya iyi toparlanma"],
        low: ["Sleep disruption or overtraining", "Uyku bozukluğu veya aşırı antrenman"],
      },
    },
  ];

  for (const m of metrics) {
    const values = timeline.map((d) => d[m.key] as number | undefined).filter((v): v is number => v != null);
    if (values.length < 21) continue;

    for (let i = 14; i < timeline.length; i++) {
      const val = timeline[i][m.key] as number | undefined;
      if (val == null) continue;

      const window = timeline.slice(Math.max(0, i - 14), i);
      const windowVals = window.map((d) => d[m.key] as number | undefined).filter((v): v is number => v != null);
      if (windowVals.length < 7) continue;

      const mean = windowVals.reduce((a, b) => a + b, 0) / windowVals.length;
      const variance = windowVals.reduce((a, b) => a + (b - mean) ** 2, 0) / windowVals.length;
      const std = Math.sqrt(variance) || 0.1;
      const zScore = (val - mean) / std;

      if (Math.abs(zScore) > 2) {
        const direction = zScore > 0 ? "high" : "low";
        const causePair = m.causes[direction] || ["Unknown cause", "Bilinmeyen neden"];
        anomalies.push({
          date: timeline[i].date,
          day: timeline[i].day,
          metric: m.label,
          metricTr: m.labelTr,
          value: round2(val),
          expected: round2(mean),
          deviation: round2(Math.abs(zScore)),
          severity: Math.abs(zScore) > 3 ? "alert" : Math.abs(zScore) > 2.5 ? "warning" : "info",
          possibleCause: causePair[0],
          possibleCauseTr: causePair[1],
        });
      }
    }
  }

  // Sort by severity then date
  const severityOrder = { alert: 0, warning: 1, info: 2 };
  anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.day - a.day);
  return anomalies.slice(0, 20);
}

// ── Predictions (Linear Regression) ───────────
export function generatePredictions(timeline: HealthTimeline[]): Prediction[] {
  const last90 = timeline.slice(-90);
  if (last90.length < 30) return [];

  const metrics: Array<{
    key: keyof HealthTimeline;
    label: string;
    labelTr: string;
    unit: string;
    goodDirection: "down" | "up";
    msgTemplates: [string, string, string, string]; // improving/declining en/tr
  }> = [
    {
      key: "crp", label: "CRP", labelTr: "CRP", unit: "mg/L", goodDirection: "down",
      msgTemplates: [
        "Your inflammation markers are trending down — keep up the anti-inflammatory protocol",
        "CRP is rising — consider reviewing supplement timing and stress levels",
        "Iltihaplanma belirtecleriniz dusuyor — anti-inflamatuar protokole devam edin",
        "CRP yukseliyor — takviye zamanlamasini ve stres seviyelerini gozden gecirin",
      ],
    },
    {
      key: "hba1c", label: "HbA1c", labelTr: "HbA1c", unit: "%", goodDirection: "down",
      msgTemplates: [
        "Blood sugar control is improving — berberine protocol is showing results",
        "HbA1c is trending up — discuss adjustment with your healthcare provider",
        "Kan sekeri kontrolu iyilesiyor — berberin protokolu sonuc veriyor",
        "HbA1c yukseliyor — sağlık uzmaninizla görüşün",
      ],
    },
    {
      key: "deepSleep", label: "Deep Sleep", labelTr: "Derin Uyku", unit: "h", goodDirection: "up",
      msgTemplates: [
        "Sleep quality is improving — valerian root is supporting deep sleep cycles",
        "Deep sleep is decreasing — check sleep hygiene and supplement timing",
        "Uyku kalitesi iyilesiyor — kediotu derin uyku dongulerine destek oluyor",
        "Derin uyku azaliyor — uyku hijyenini ve takviye zamanlamasini kontrol edin",
      ],
    },
    {
      key: "energyScore", label: "Energy", labelTr: "Enerji", unit: "/10", goodDirection: "up",
      msgTemplates: [
        "Energy levels are steadily increasing — great overall progress",
        "Energy is declining — consider recovery days and sleep optimization",
        "Enerji seviyeleri istikrarli sekilde artiyor — harika genel ilerleme",
        "Enerji dusuyor — dinlenme gunleri ve uyku optimizasyonunu dusunun",
      ],
    },
  ];

  return metrics.map((m) => {
    const vals = last90.map((d, i) => ({ x: i, y: d[m.key] as number | undefined })).filter((v): v is { x: number; y: number } => v.y != null);
    if (vals.length < 20) {
      return {
        metric: m.label, metricTr: m.labelTr, unit: m.unit,
        currentValue: 0, predictedValue3m: 0, predictedValue6m: 0,
        confidence: 0, trend: "stable" as const,
        message: "", messageTr: "",
      };
    }

    const { slope, intercept, r2 } = linearRegression(vals);
    const currentValue = vals[vals.length - 1].y;
    const predicted3m = intercept + slope * (vals.length + 90);
    const predicted6m = intercept + slope * (vals.length + 180);

    const improving = (m.goodDirection === "down" && slope < -0.001) || (m.goodDirection === "up" && slope > 0.001);
    const declining = (m.goodDirection === "down" && slope > 0.001) || (m.goodDirection === "up" && slope < -0.001);
    const trend: "improving" | "stable" | "declining" = improving ? "improving" : declining ? "declining" : "stable";

    const msgIdx = improving ? 0 : 1;
    return {
      metric: m.label,
      metricTr: m.labelTr,
      unit: m.unit,
      currentValue: round2(currentValue),
      predictedValue3m: round2(predicted3m),
      predictedValue6m: round2(predicted6m),
      confidence: round2(Math.max(0.3, Math.min(0.95, r2 + 0.2))),
      trend,
      message: m.msgTemplates[msgIdx],
      messageTr: m.msgTemplates[msgIdx + 2],
    };
  }).filter((p) => p.confidence > 0);
}

// ── Cosine Similarity ─────────────────────────
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

// ── What-If Simulator ─────────────────────────
export function simulateOmega3Addition(timeline: HealthTimeline[]): HealthTimeline[] {
  const last90 = timeline.slice(-90);
  return last90.map((day, i) => {
    const progress = Math.min(i / 60, 1);
    return {
      ...day,
      crp: round2(Math.max(0.5, (day.crp ?? 2) - 0.4 * progress)),
      energyScore: round2(Math.min(10, (day.energyScore ?? 5) + 0.8 * progress)),
      moodScore: round2(Math.min(10, (day.moodScore ?? 5) + 0.5 * progress)),
    };
  });
}

// ── Helpers ───────────────────────────────────
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clampPercentile(p: number): number {
  return Math.round(Math.max(1, Math.min(99, p)));
}

function linearRegression(data: Array<{ x: number; y: number }>): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const { x, y } of data) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (const { x, y } of data) {
    const yPred = slope * x + intercept;
    ssRes += (y - yPred) ** 2;
    ssTot += (y - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}
