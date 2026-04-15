// © 2026 DoctoPal — All Rights Reserved
// KVKK 2026/347 — Privacy settings UI for granting/withdrawing the 3 onboarding consents
"use client";

import { useEffect, useState } from "react";
import { Sparkles, Globe, FileText, ShieldCheck, Loader2, Check, X, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";

interface ConsentState {
  aydinlatma_acknowledged: boolean;
  aydinlatma_version: string | null;
  aydinlatma_timestamp: string | null;
  consent_ai_processing: boolean;
  consent_data_transfer: boolean;
  consent_sbar_report: boolean;
  consent_timestamp: string | null;
}

const CONSENT_DEFS = [
  {
    key: "consent_ai_processing" as const,
    icon: Sparkles,
    tr: {
      title: "AI İşleme Açık Rızası",
      desc: "Sağlık verilerimin yapay zeka sistemi tarafından kişiselleştirilmiş bilgilendirme amacıyla işlenmesine açık rıza veriyorum.",
      impact: "Rıza geri çekilirse: AI sağlık asistanı ve etkileşim kontrolü devre dışı kalır.",
    },
    en: {
      title: "AI Processing Explicit Consent",
      desc: "I give explicit consent for my health data to be processed by the AI system for personalized health information.",
      impact: "If withdrawn: AI health assistant and interaction checker will be disabled.",
    },
  },
  {
    key: "consent_data_transfer" as const,
    icon: Globe,
    tr: {
      title: "Yurt Dışı Aktarım Açık Rızası",
      desc: "Sağlık verilerimin anonimleştirilerek AB (İrlanda) ve ABD sunucularında işlenmesine açık rıza veriyorum.",
      impact: "Rıza geri çekilirse: AI özellikleri kullanılamaz (AI API ABD'dedir).",
    },
    en: {
      title: "International Transfer Explicit Consent",
      desc: "I give explicit consent for my anonymized health data to be processed on EU (Ireland) and US servers.",
      impact: "If withdrawn: AI features will be unavailable (AI API is hosted in the US).",
    },
  },
  {
    key: "consent_sbar_report" as const,
    icon: FileText,
    tr: {
      title: "SBAR Raporu Açık Rızası",
      desc: "Sağlık verilerimin SBAR raporu oluşturulması amacıyla işlenmesine açık rıza veriyorum.",
      impact: "Rıza geri çekilirse: SBAR PDF raporu oluşturulamaz.",
    },
    en: {
      title: "SBAR Report Explicit Consent",
      desc: "I give explicit consent for my health data to be processed for SBAR report generation.",
      impact: "If withdrawn: SBAR PDF report cannot be generated.",
    },
  },
];

export function PrivacySettings() {
  const { lang } = useLang();
  const tr = lang === "tr";
  const [state, setState] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function getToken() {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  }

  async function loadConsents() {
    try {
      const token = await getToken();
      const res = await fetch("/api/privacy-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState(data);
      setError(null);
    } catch (err) {
      console.error("[PrivacySettings] load error:", err);
      setError(tr ? "Rıza bilgileri yüklenemedi" : "Failed to load consent status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConsents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(consentType: string, current: boolean) {
    const newValue = !current;
    const confirmWithdraw = tr
      ? "Bu rızayı geri çekmek istediğinize emin misiniz? İlgili özellik devre dışı kalacaktır."
      : "Are you sure you want to withdraw this consent? The related feature will be disabled.";
    if (!newValue && !window.confirm(confirmWithdraw)) return;

    setSaving(consentType);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/privacy-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ consent_type: consentType, granted: newValue }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      // Optimistic update
      setState((prev) => prev ? { ...prev, [consentType]: newValue, consent_timestamp: new Date().toISOString() } : prev);
    } catch (err) {
      console.error("[PrivacySettings] toggle error:", err);
      const msg = err instanceof Error ? err.message : "Unknown";
      setError(tr ? `Güncelleme başarısız: ${msg}` : `Update failed: ${msg}`);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {tr ? "Rıza bilgileri yükleniyor..." : "Loading consent status..."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">
            {tr ? "Gizlilik Ayarları & Rıza Yönetimi" : "Privacy Settings & Consent Management"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tr
              ? "KVKK Md.11 uyarınca açık rızanızı istediğiniz zaman geri çekebilirsiniz."
              : "Under KVKK Art.11, you can withdraw your explicit consent anytime."}
          </p>
        </div>
      </div>

      {/* Aydınlatma status */}
      {state?.aydinlatma_acknowledged && (
        <div className="rounded-lg border border-green-200 bg-green-50/40 dark:bg-green-950/10 dark:border-green-900 p-3 flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-medium text-green-800 dark:text-green-300">
              {tr ? "Aydınlatma Metni Okundu" : "Privacy Notice Acknowledged"}
            </p>
            <p className="text-green-700/70 dark:text-green-400/70 mt-0.5">
              {tr ? "Sürüm: " : "Version: "}{state.aydinlatma_version || "—"}
              {state.aydinlatma_timestamp && ` · ${new Date(state.aydinlatma_timestamp).toLocaleDateString(tr ? "tr-TR" : "en-US")}`}
            </p>
          </div>
        </div>
      )}

      {/* Consent cards */}
      <div className="space-y-3">
        {CONSENT_DEFS.map((def) => {
          const value = (state?.[def.key] as boolean) ?? false;
          const copy = tr ? def.tr : def.en;
          const Icon = def.icon;
          const isSaving = saving === def.key;

          return (
            <div
              key={def.key}
              className={`rounded-lg border p-4 transition-colors ${
                value ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 shrink-0 ${value ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h4 className="text-sm font-semibold">{copy.title}</h4>
                    <button
                      type="button"
                      onClick={() => toggle(def.key, value)}
                      disabled={isSaving}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                        value
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : value ? (
                        <>
                          <Check className="h-3 w-3" />
                          {tr ? "Aktif" : "Active"}
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" />
                          {tr ? "Pasif" : "Inactive"}
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{copy.desc}</p>
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{copy.impact}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t">
        {tr
          ? "Rıza değişiklikleri audit log'a kaydedilir (KVKK Md.12). Temel hizmetler (ilaç takibi, takvim, aile profili) rıza durumundan bağımsız çalışır."
          : "Consent changes are recorded in the audit log (KVKK Art.12). Basic services (medication tracking, calendar, family profiles) work regardless of consent status."}
      </p>
    </div>
  );
}
