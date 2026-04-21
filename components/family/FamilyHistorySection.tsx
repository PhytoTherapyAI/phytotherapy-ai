// © 2026 DoctoPal — All Rights Reserved
// FamilyHistorySection — CRUD UI for family_history_entries.
// Session 39 C2. Consumed by app/family-health-tree/page.tsx.
// KVKK note: 3rd-party health data (anne/baba/kardeş disease history) —
// collected under user's AI Processing consent per Aydınlatma v2.2 §2-b2.
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  AlertCircle,
  Users,
  X,
  Save,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { createBrowserClient } from "@/lib/supabase";

interface FamilyHistoryEntry {
  id: string;
  person_relation: string;
  condition_name: string;
  age_at_diagnosis: number | null;
  age_at_death: number | null;
  is_deceased: boolean;
  notes: string | null;
  created_at: string;
}

interface FormState {
  id?: string;
  person_relation: string;
  condition_name: string;
  age_at_diagnosis: string; // kept as string for input binding
  age_at_death: string;
  is_deceased: boolean;
  notes: string;
}

const EMPTY_FORM: FormState = {
  person_relation: "",
  condition_name: "",
  age_at_diagnosis: "",
  age_at_death: "",
  is_deceased: false,
  notes: "",
};

// Session 39 hotfix: modal form state persists across tab switches via
// sessionStorage (parent page's authLoading/familyLoading flips can
// unmount this section while the user is away). Draft is cleared on
// save/cancel/close; restored only when the user re-opens the modal.
const DRAFT_STORAGE_KEY = "doctopal:familyHistory:draft";

function readDraft(): FormState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FormState;
  } catch {
    return null;
  }
}

function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // sessionStorage unavailable (private mode quota, etc.) — swallow
  }
}

const RELATION_OPTIONS_TR = [
  "Anne",
  "Baba",
  "Kardeş (kız)",
  "Kardeş (erkek)",
  "Hala",
  "Teyze",
  "Amca",
  "Dayı",
  "Dede (anne tarafı)",
  "Dede (baba tarafı)",
  "Nine (anne tarafı)",
  "Nine (baba tarafı)",
  "Kuzen",
  "Diğer",
];

const RELATION_OPTIONS_EN = [
  "Mother",
  "Father",
  "Sister",
  "Brother",
  "Paternal aunt",
  "Maternal aunt",
  "Paternal uncle",
  "Maternal uncle",
  "Maternal grandfather",
  "Paternal grandfather",
  "Maternal grandmother",
  "Paternal grandmother",
  "Cousin",
  "Other",
];

export function FamilyHistorySection() {
  const { user, isAuthenticated } = useAuth();
  const { lang } = useLang();
  const tr = lang === "tr";
  const relationOptions = tr ? RELATION_OPTIONS_TR : RELATION_OPTIONS_EN;

  const [entries, setEntries] = useState<FamilyHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const sb = createBrowserClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchEntries = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/family-history", { headers });
      if (!res.ok) {
        // If migration not yet applied, table may not exist — graceful degrade
        if (res.status === 500) {
          setEntries([]);
          setError(tr
            ? "Aile öyküsü tablosu henüz hazır değil. Lütfen yönetici ile iletişime geç."
            : "Family history table not ready yet. Please contact admin.");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setEntries(json.entries ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, getAuthHeaders, tr]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Session 39 hotfix: persist form draft while modal is open so tab
  // switches (which can unmount this section via parent loading flip)
  // don't discard the user's input. Cleared on close/save — see clearDraft.
  useEffect(() => {
    if (!formOpen) return;
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formState));
    } catch {
      // quota exceeded / private mode — non-fatal, form still works
    }
  }, [formState, formOpen]);

  const openAddForm = () => {
    const draft = readDraft();
    // Only restore an add-mode draft (no id); an edit-mode draft belongs
    // to a specific entry and shouldn't leak into a fresh Add form.
    if (draft && !draft.id) {
      setFormState(draft);
    } else {
      setFormState(EMPTY_FORM);
    }
    setFormOpen(true);
  };

  const openEditForm = (entry: FamilyHistoryEntry) => {
    const draft = readDraft();
    // Restore only if the draft belongs to THIS entry — otherwise show the
    // current server values so the user isn't confused by stale data.
    if (draft && draft.id === entry.id) {
      setFormState(draft);
    } else {
      setFormState({
        id: entry.id,
        person_relation: entry.person_relation,
        condition_name: entry.condition_name,
        age_at_diagnosis: entry.age_at_diagnosis != null ? String(entry.age_at_diagnosis) : "",
        age_at_death: entry.age_at_death != null ? String(entry.age_at_death) : "",
        is_deceased: entry.is_deceased,
        notes: entry.notes ?? "",
      });
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormState(EMPTY_FORM);
    clearDraft();
  };

  const handleSave = async () => {
    if (!formState.person_relation.trim() || !formState.condition_name.trim()) {
      setError(tr ? "Yakınlık ve hastalık adı zorunlu" : "Relation and condition required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const payload = {
        id: formState.id,
        person_relation: formState.person_relation.trim(),
        condition_name: formState.condition_name.trim(),
        age_at_diagnosis: formState.age_at_diagnosis ? parseInt(formState.age_at_diagnosis, 10) : null,
        age_at_death: formState.is_deceased && formState.age_at_death
          ? parseInt(formState.age_at_death, 10)
          : null,
        is_deceased: formState.is_deceased,
        notes: formState.notes.trim() || null,
      };
      const method = formState.id ? "PATCH" : "POST";
      const res = await fetch("/api/family-history", {
        method,
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      closeForm();
      await fetchEntries();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/family-history?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setConfirmDeleteId(null);
      await fetchEntries();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base sm:text-lg font-bold">
            {tr ? "Aile Sağlık Öyküsü" : "Family Health History"}
          </h2>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {tr ? "Ekle" : "Add"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {tr
          ? "Akrabalarında gördüğün kronik hastalık/kanser/erken kalp krizi gibi sağlık öykülerini buraya ekle. Bu bilgi genetik risk değerlendirmesi ve AI asistanın kişiselleştirilmiş önerileri için kullanılır. KVKK: özel nitelikli sağlık verisi, açık rıza kapsamında."
          : "Add chronic disease, cancer, early heart attack and similar health histories you see in your relatives. This is used for genetic risk assessment and personalized AI recommendations. KVKK: special category health data, under explicit consent."}
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 p-2.5 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {tr
              ? "Henüz aile öyküsü eklenmemiş. Bir hastalık geçmişi eklediğinde AI asistan bunu değerlendirmelerinde kullanır."
              : "No family history added yet. Once you add a condition, the AI assistant will factor it into its recommendations."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-border bg-background/60 p-3 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {e.person_relation}
                  {typeof e.age_at_diagnosis === "number" && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      {tr ? `(${e.age_at_diagnosis} yaşında tanı)` : `(diagnosed at ${e.age_at_diagnosis})`}
                    </span>
                  )}
                </p>
                <p className="text-sm mt-0.5">{e.condition_name}</p>
                {e.is_deceased && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {typeof e.age_at_death === "number"
                      ? (tr ? `${e.age_at_death} yaşında vefat` : `passed away at ${e.age_at_death}`)
                      : (tr ? "Vefat etti" : "Deceased")}
                  </p>
                )}
                {e.notes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{e.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEditForm(e)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={tr ? "Düzenle" : "Edit"}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(e.id)}
                  className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"
                  aria-label={tr ? "Sil" : "Delete"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Add/Edit Modal ── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(ev) => ev.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-5"
            >
              <button
                type="button"
                onClick={closeForm}
                className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                aria-label={tr ? "Kapat" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-base font-bold mb-4">
                {formState.id
                  ? (tr ? "Öyküyü Düzenle" : "Edit Entry")
                  : (tr ? "Aile Öyküsü Ekle" : "Add Family History")}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr ? "Yakınlık" : "Relation"} <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formState.person_relation}
                    onChange={(ev) => setFormState({ ...formState, person_relation: ev.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
                  >
                    <option value="">{tr ? "Seç..." : "Select..."}</option>
                    {relationOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr ? "Hastalık/Durum" : "Condition"} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formState.condition_name}
                    onChange={(ev) => setFormState({ ...formState, condition_name: ev.target.value })}
                    placeholder={tr ? "Meme kanseri, tip 2 diyabet..." : "Breast cancer, type 2 diabetes..."}
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr ? "Tanı Yaşı (opsiyonel)" : "Age at Diagnosis (optional)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={formState.age_at_diagnosis}
                    onChange={(ev) => setFormState({ ...formState, age_at_diagnosis: ev.target.value })}
                    placeholder={tr ? "örn. 48" : "e.g. 48"}
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="is_deceased"
                    type="checkbox"
                    checked={formState.is_deceased}
                    onChange={(ev) => setFormState({ ...formState, is_deceased: ev.target.checked })}
                    className="h-4 w-4 rounded border-border"
                  />
                  <label htmlFor="is_deceased" className="text-xs font-medium">
                    {tr ? "Vefat etti" : "Deceased"}
                  </label>
                </div>

                {formState.is_deceased && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      {tr ? "Vefat Yaşı (opsiyonel)" : "Age at Death (optional)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={formState.age_at_death}
                      onChange={(ev) => setFormState({ ...formState, age_at_death: ev.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {tr ? "Not (opsiyonel)" : "Notes (optional)"}
                  </label>
                  <textarea
                    value={formState.notes}
                    onChange={(ev) => setFormState({ ...formState, notes: ev.target.value })}
                    placeholder={tr
                      ? "İki taraflı, premenopozal tanı, vb."
                      : "Bilateral, premenopausal diagnosis, etc."}
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm min-h-[60px]"
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  {tr ? "İptal" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !formState.person_relation.trim() || !formState.condition_name.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {tr ? "Kaydet" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(ev) => ev.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-5"
            >
              <h3 className="text-base font-bold mb-2">
                {tr ? "Öyküyü sil?" : "Delete entry?"}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {tr
                  ? "Bu işlem geri alınamaz. AI artık bu öyküyü değerlendirmelerinde kullanmayacak."
                  : "This cannot be undone. The AI will no longer factor this entry into its recommendations."}
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  {tr ? "Vazgeç" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                  disabled={deletingId === confirmDeleteId}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  {deletingId === confirmDeleteId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  {tr ? "Sil" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
