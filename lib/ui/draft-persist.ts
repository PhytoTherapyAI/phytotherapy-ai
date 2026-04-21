// © 2026 DoctoPal — All Rights Reserved
// Session 42 F-D-006: draft-persist helpers extracted from Session 39's
// FamilyHistorySection so any form with a "tab-switch can unmount me"
// problem can share the same sessionStorage-backed rescue path.
//
// Why sessionStorage: tab-scoped → drafts don't leak across tabs/windows
// (a tab-level edit attempt shouldn't auto-fill another tab). Survives
// visibility flips / auth re-validation that briefly remount the parent.
//
// Usage pattern (mirrors the original FamilyHistorySection wiring):
//
//   const [form, setForm] = useState<Form>(EMPTY);
//   const open = ...;                            // drawer/modal open flag
//
//   // Persist every keystroke while the form surface is open.
//   useEffect(() => {
//     if (!open) return;
//     persistDraft("doctopal:myForm:draft", form);
//   }, [form, open]);
//
//   // Restore when the user reopens.
//   const openForm = () => {
//     const draft = readDraft<Form>("doctopal:myForm:draft");
//     setForm(draft ?? EMPTY);
//     setOpen(true);
//   };
//
//   // Clear on save/cancel.
//   const closeForm = () => {
//     clearDraft("doctopal:myForm:draft");
//     setForm(EMPTY);
//     setOpen(false);
//   };
//
// The key argument is mandatory so different forms don't collide. Use
// a stable namespace (e.g. "doctopal:profile:medicationAdd").

export function readDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function persistDraft<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded / private mode — swallow; form keeps working in memory
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // sessionStorage unavailable — ignore
  }
}

// Well-known keys — keep them here so they're discoverable in one place
// and consumers don't drift typos.
export const DRAFT_KEYS = {
  familyHistory: "doctopal:familyHistory:draft",
  profileMedicationAdd: "doctopal:profile:medicationAdd:draft",
} as const;
