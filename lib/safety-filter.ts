// © 2026 Doctopal — All Rights Reserved
const RED_FLAGS_EN = [
  "chest pain",
  "heart attack",
  "shortness of breath",
  "can't breathe",
  "loss of consciousness",
  "unconscious",
  "seizure",
  "stroke",
  "heavy bleeding",
  "suicidal",
  "suicide",
  "poisoning",
  "overdose",
  "sudden vision loss",
  "paralysis",
  "anaphylaxis",
];

const RED_FLAGS_TR = [
  "göğüs ağrısı",
  "göğsüm ağrıyor",
  "göğsüm acıyor",
  "kalp krizi",
  "nefes darlığı",
  "nefes alamıyorum",
  "nefes alamıyor",
  "bilinç kaybı",
  "bayıldı",
  "bayılma",
  "nöbet",
  "felç",
  "inme",
  "kanama",
  "ağır kanama",
  "intihar",
  "kendime zarar",
  "zehirlenme",
  "zehirlendim",
  "doz aşımı",
  "ani görme kaybı",
  "anafilaksi",
  "alerji şoku",
];

export interface RedFlagResult {
  isEmergency: boolean;
  language: "en" | "tr";
  matchedFlags: string[];
}

export function checkRedFlags(input: string): RedFlagResult {
  const lower = input.toLowerCase();
  const enMatches = RED_FLAGS_EN.filter((flag) => lower.includes(flag));
  const trMatches = RED_FLAGS_TR.filter((flag) => lower.includes(flag));

  return {
    isEmergency: enMatches.length > 0 || trMatches.length > 0,
    language: trMatches.length > 0 ? "tr" : "en",
    matchedFlags: [...enMatches, ...trMatches],
  };
}

export function getEmergencyMessage(language: "en" | "tr"): string {
  if (language === "tr") {
    return "DİKKAT: Belirttiğiniz şikayetler acil tıbbi müdahale gerektiren bir durumun habercisi olabilir. Lütfen derhal 112'yi arayın veya en yakın acil servise başvurun. Bu durumda hiçbir bitkisel takviye kullanılamaz.";
  }
  return "WARNING: The symptoms you described may indicate a medical emergency. Please call 911 (or 112) immediately or go to the nearest emergency room. No herbal supplements should be used in this situation.";
}
