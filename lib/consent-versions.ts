// © 2026 DoctoPal — All Rights Reserved
// Merkezi versiyon tanımları — metin değiştiğinde bump edilmeli
// Kullanıcılar eski versiyona sahipse yeniden onay istenecek

export const CONSENT_VERSIONS = {
  aydinlatma: "v2.2",
  ai_processing: "v2.0",
  data_transfer: "v2.0",
  sbar_report: "v2.0",
  payment_processing: "v2.1",
} as const;

export const CURRENT_AYDINLATMA_VERSION = CONSENT_VERSIONS.aydinlatma;
