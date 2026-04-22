// © 2026 DoctoPal — All Rights Reserved
// Session 44 Faz 2 C2.2: DailyLogsContext — single source of truth for
// medication + supplement completion state across dashboard and calendar.
//
// Why this exists:
//   Before, app/page.tsx (dashboard) and app/calendar/page.tsx each held
//   their own `completedTaskIds: Set<string>` and wrote to daily_logs via
//   inline Supabase calls. Cross-view sync was a `daily-log-changed`
//   window event that triggered each consumer's own refetch — which
//   meant up to N independent INSERTs running in parallel could race
//   the UNIQUE constraint, plus every silent catch swallowed the failure.
//
//   Faz 0 production diagnosis (Session 44) confirmed: UNIQUE is in place,
//   but client INSERTs were never reaching the DB on tested rows. The
//   silent catches hid every cause. This context centralizes the write
//   path so a single error reporter (lib/mutation-errors.ts) handles
//   every failure with a toast + Sentry capture.
//
// Storage shape:
//   Set<DailyLogKey> where DailyLogKey = `${ItemType}:${itemId}`. O(1)
//   membership for the per-render `isCompleted(type, id)` lookup. The
//   Set is rebuilt whenever the active profile or today's date changes,
//   or when another writer fires `daily-log-changed`.
//
// Optimistic + rollback pattern (per Session 44 rules):
//   1. setCompleted flips the Set immediately (UI updates).
//   2. Sentry breadcrumb tags the optimistic op (visible in error trail
//      if the user closes the tab before DB ack).
//   3. INSERT (done=true) or DELETE (done=false) hits Supabase. UNIQUE
//      constraint is verified to exist (Faz 0), so no fallback UPDATE.
//   4. On error: Set rolls back to pre-flip snapshot, reportMutationError
//      fires (toast + Sentry), and the function rethrows so the caller
//      can short-circuit further chained logic. Silent failure is gone.
//   5. On success: dispatch `daily-log-changed` so other mounted views
//      (e.g. calendar's local task arrays) refetch their derived state.
//
// Hook ergonomics:
//   Two surfaces. `useDailyLogs()` returns the full API for callers that
//   need bulk reads. `useDailyLog(type, id)` is a memoized convenience
//   for one row — { completed, toggle, loading } — so a checkbox
//   component stays a one-liner.
//
// Provider mounting:
//   Mount on each page that uses it (dashboard + calendar), wrapped
//   alongside WaterIntakeProvider. The provider short-circuits to a
//   no-op state when there is no active user, so guest pages pay zero
//   network or storage cost.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { useActiveProfile } from "@/lib/use-active-profile";
import { useLang } from "@/components/layout/language-toggle";
import { createBrowserClient } from "@/lib/supabase";
import { reportMutationError } from "@/lib/mutation-errors";

// ─── Types ─────────────────────────────────────────────────────────────

export type ItemType = "medication" | "supplement";
export type DailyLogKey = `${ItemType}:${string}`;

export function makeKey(type: ItemType, id: string): DailyLogKey {
  return `${type}:${id}` as DailyLogKey;
}

interface DailyLogsContextValue {
  /** O(1) membership check against today's completed set. */
  isCompleted: (type: ItemType, id: string) => boolean;
  /**
   * Optimistic toggle. INSERT on done=true, DELETE on done=false.
   * Throws on DB failure (after toast + Sentry capture + rollback).
   * `itemName` is persisted so reports/exports can show what was logged.
   */
  setCompleted: (
    type: ItemType,
    id: string,
    itemName: string,
    done: boolean,
  ) => Promise<void>;
  /** True while the initial fetch (or a manual refetch) is in flight. */
  loading: boolean;
  /** Force re-read today's completion state from Supabase. */
  refetch: () => Promise<void>;
}

const DEFAULT_VALUE: DailyLogsContextValue = {
  isCompleted: () => false,
  setCompleted: async () => {},
  loading: false,
  refetch: async () => {},
};

const DailyLogsContext = createContext<DailyLogsContextValue>(DEFAULT_VALUE);

// ─── Helpers ───────────────────────────────────────────────────────────

/** Local YYYY-MM-DD (matches existing dashboard + calendar conventions). */
function getLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Provider ──────────────────────────────────────────────────────────

export function DailyLogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { activeUserId, canEdit } = useActiveProfile();
  const { lang } = useLang();

  // The user we read/write completion FOR (active profile, falls back to self).
  const targetUserId = activeUserId || user?.id || null;
  const today = getLocalDate();

  const [completed, setCompletedState] = useState<Set<DailyLogKey>>(new Set());
  const [loading, setLoading] = useState(false);

  // Ref mirror — read inside async callbacks without stale closure.
  const completedRef = useRef(completed);
  completedRef.current = completed;

  const supabase = useMemo(() => createBrowserClient(), []);

  const refetch = useCallback(async () => {
    if (!targetUserId) {
      setCompletedState(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("item_type, item_id, completed")
        .eq("user_id", targetUserId)
        .eq("log_date", today)
        .eq("completed", true);

      if (error) {
        // Read failure: don't toast — read errors should not break the page,
        // but we want them in Sentry for visibility.
        reportMutationError(error, {
          op: "dailyLogs.refetch",
          userId: user?.id,
          activeProfileId: activeUserId ?? undefined,
          lang,
          extra: { date: today },
        });
        return;
      }

      const next = new Set<DailyLogKey>();
      for (const row of data ?? []) {
        const r = row as { item_type: string; item_id: string };
        if (r.item_type === "medication" || r.item_type === "supplement") {
          next.add(makeKey(r.item_type, r.item_id));
        }
      }
      setCompletedState(next);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, today, supabase, lang, user?.id, activeUserId]);

  // Initial fetch + refetch when target profile or date changes.
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Cross-view sync: any writer dispatches `daily-log-changed`, all
  // mounted providers re-read.
  useEffect(() => {
    const handler = () => {
      void refetch();
    };
    window.addEventListener("daily-log-changed", handler);
    return () => window.removeEventListener("daily-log-changed", handler);
  }, [refetch]);

  const isCompleted = useCallback((type: ItemType, id: string): boolean => {
    return completedRef.current.has(makeKey(type, id));
  }, []);

  const setCompleted = useCallback(
    async (type: ItemType, id: string, itemName: string, done: boolean): Promise<void> => {
      if (!targetUserId) {
        // No active profile — nothing to write. Caller likely should not
        // have invoked this, but fail soft.
        return;
      }

      // Family member view requires explicit edit permission. RLS would
      // also block server-side, but we short-circuit so we do not show
      // a misleading toast for a deliberate UI gate.
      if (!canEdit) {
        // Surfacing as a permission-style toast is honest about why
        // the click did not stick.
        reportMutationError(
          { code: "42501", status: 403, message: "edit not permitted for active profile" },
          { op: "dailyLogs.setCompleted", userId: user?.id, activeProfileId: activeUserId ?? undefined, lang, extra: { type, id, done } },
        );
        return;
      }

      const key = makeKey(type, id);
      // Snapshot for rollback. Set is intentionally cloned so the
      // original is preserved by reference.
      const snapshot = new Set(completedRef.current);

      // Optimistic flip — UI sees the change instantly.
      setCompletedState((prev) => {
        const next = new Set(prev);
        if (done) next.add(key); else next.delete(key);
        return next;
      });

      // Sentry breadcrumb: if the user closes the tab before the DB ack,
      // the optimistic intent is preserved in any later error trail.
      import("@sentry/nextjs")
        .then((Sentry) => {
          Sentry.addBreadcrumb({
            category: "dailyLogs",
            level: "info",
            message: "optimistic setCompleted",
            data: { type, id, done, target: targetUserId, date: today },
          });
        })
        .catch(() => {});

      try {
        if (done) {
          // INSERT — UNIQUE(user_id, log_date, item_type, item_id) is
          // confirmed in production (Faz 0 SQL S1). No UPDATE fallback;
          // duplicate violation would be a real bug worth seeing.
          const { error } = await supabase.from("daily_logs").insert({
            user_id: targetUserId,
            log_date: today,
            item_type: type,
            item_id: id,
            item_name: itemName,
            completed: true,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("daily_logs")
            .delete()
            .eq("user_id", targetUserId)
            .eq("log_date", today)
            .eq("item_type", type)
            .eq("item_id", id);
          if (error) throw error;
        }
      } catch (err) {
        // Rollback BEFORE reporting so the toast accompanies a UI that
        // already matches reality.
        setCompletedState(snapshot);
        reportMutationError(err, {
          op: "dailyLogs.setCompleted",
          userId: user?.id,
          activeProfileId: activeUserId ?? undefined,
          lang,
          extra: { type, id, done, itemName, date: today },
        });
        throw err;
      }

      // Notify other mounted views ONLY after DB acked. Optimistic
      // dispatch would race the writer's own listener back into a
      // stale read.
      window.dispatchEvent(new Event("daily-log-changed"));
    },
    [targetUserId, canEdit, today, supabase, lang, user?.id, activeUserId],
  );

  const value = useMemo<DailyLogsContextValue>(
    () => ({ isCompleted, setCompleted, loading, refetch }),
    [isCompleted, setCompleted, loading, refetch],
  );

  return <DailyLogsContext.Provider value={value}>{children}</DailyLogsContext.Provider>;
}

// ─── Hooks ─────────────────────────────────────────────────────────────

export function useDailyLogs(): DailyLogsContextValue {
  return useContext(DailyLogsContext);
}

/**
 * Ergonomic single-row hook. For checkbox components that just need
 * "am I done, click to toggle me, am I waiting".
 */
export function useDailyLog(type: ItemType, id: string, itemName: string) {
  const { isCompleted, setCompleted, loading } = useDailyLogs();
  const completed = isCompleted(type, id);

  const toggle = useCallback(async () => {
    await setCompleted(type, id, itemName, !completed);
  }, [setCompleted, type, id, itemName, completed]);

  return { completed, toggle, loading };
}
