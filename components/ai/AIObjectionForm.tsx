// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.11/1-g — Right to object to automated-processing decisions
"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

interface AIObjectionFormProps {
  responseId?: string;
  onClose: () => void;
}

const OBJECTION_CATEGORIES = {
  tr: [
    { value: "incorrect", label: "AI yanıtı yanlış/hatalı bilgi içeriyor" },
    { value: "incomplete", label: "Bilgi eksik veya yetersiz" },
    { value: "harmful", label: "Zararlı veya tehlikeli bilgi" },
    { value: "diagnosis", label: "AI teşhis koymaya çalışıyor" },
    { value: "prescription", label: "AI reçete yazmaya çalışıyor" },
    { value: "other", label: "Diğer" },
  ],
  en: [
    { value: "incorrect", label: "AI response contains incorrect information" },
    { value: "incomplete", label: "Information is incomplete or insufficient" },
    { value: "harmful", label: "Harmful or dangerous information" },
    { value: "diagnosis", label: "AI is attempting to diagnose" },
    { value: "prescription", label: "AI is attempting to prescribe" },
    { value: "other", label: "Other" },
  ],
};

export function AIObjectionForm({ responseId, onClose }: AIObjectionFormProps) {
  const { lang } = useLang();
  const tr = lang === "tr";
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = tr ? OBJECTION_CATEGORIES.tr : OBJECTION_CATEGORIES.en;

  async function handleSubmit() {
    if (!category) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback/objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId,
          category,
          text: text.trim().slice(0, 2000),
          timestamp: new Date().toISOString(),
          lang,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitted(true);
    } catch (err) {
      console.error("[Objection] submit failed:", err);
      setError(tr ? "Gönderim başarısız oldu. Lütfen tekrar deneyin." : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-2 flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-xs text-green-700 dark:text-green-400">
        <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          {tr
            ? "İtirazınız kaydedildi. En kısa sürede değerlendirilecektir."
            : "Your objection has been recorded and will be reviewed shortly."}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="text-[11px] leading-snug font-medium text-muted-foreground">
        {tr
          ? "KVKK Md.11/1-g kapsamında otomatik işleme dayalı kararlara itiraz hakkınız bulunmaktadır."
          : "Under KVKK Article 11/1-g, you have the right to object to decisions based on automated processing."}
      </p>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2 text-xs"
      >
        <option value="">{tr ? "İtiraz nedeninizi seçin..." : "Select reason..."}</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 2000))}
        placeholder={tr ? "Açıklama (opsiyonel)..." : "Explanation (optional)..."}
        className="w-full rounded-md border bg-background px-3 py-2 text-xs resize-none"
        rows={2}
        maxLength={2000}
      />

      {error && (
        <p className="text-[11px] text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!category || loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <Send className="h-3 w-3" />
          {loading ? (tr ? "Gönderiliyor..." : "Sending...") : (tr ? "Gönder" : "Submit")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {tr ? "İptal" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
