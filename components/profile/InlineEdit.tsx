// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";

export function InlineEdit({ value, onSave, type = "text", placeholder, lang, options, disabled = false }: {
  value?: string | number | null;
  onSave: (val: string) => Promise<void>;
  type?: "text" | "number" | "chips";
  placeholder?: string;
  lang: "en" | "tr";
  options?: { value: string; label: string }[];
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const [saving, setSaving] = useState(false);
  const addLabel = lang === "tr" ? "+ Ekle" : "+ Add";

  // Read-only mode: no edit interactions, just display
  if (disabled) {
    return <span className="font-medium text-muted-foreground">{value ? String(value) : "—"}</span>;
  }

  if (!editing && !value) {
    return <button onClick={() => setEditing(true)} className="text-sm font-medium text-primary hover:underline cursor-pointer">{addLabel}</button>;
  }
  if (!editing) {
    return <span className="font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => { setDraft(String(value ?? "")); setEditing(true); }}>{String(value)}</span>;
  }

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false); setEditing(false);
  };

  if (type === "chips" && options) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {options.map(o => (
          <button key={o.value} type="button" onClick={async () => { setSaving(true); await onSave(o.value); setSaving(false); setEditing(false); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${draft === o.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {o.label}
          </button>
        ))}
        <button onClick={() => setEditing(false)} className="flex items-center justify-center w-7 h-7 min-w-[44px] min-h-[44px] rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-bold transition-colors ml-1">✗</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input type={type === "number" ? "number" : "text"} value={draft} onChange={e => setDraft(e.target.value)}
        placeholder={placeholder} autoFocus className="h-7 rounded-md border px-2 text-sm w-32 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none" />
      <button onClick={save} disabled={saving} className="flex items-center justify-center w-8 h-8 min-w-[44px] min-h-[44px] rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 text-lg font-bold transition-colors">{saving ? "..." : "✓"}</button>
      <button onClick={() => setEditing(false)} className="flex items-center justify-center w-8 h-8 min-w-[44px] min-h-[44px] rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-lg font-bold transition-colors">✗</button>
    </div>
  );
}
