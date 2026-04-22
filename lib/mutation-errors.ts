// © 2026 DoctoPal — All Rights Reserved
// Session 44 Faz 2 C2.1: centralized mutation error reporter.
//
// Replaces the silent `catch {}` blocks that masked write failures during
// Session 43 production diagnosis — when the client optimistically showed
// a tick/glass but no row ever landed in Supabase, the user only found out
// on refresh. Every DB write now goes through a catch that:
//
//   1. Shows a language-aware toast (sonner) so the user sees feedback.
//   2. Captures the exception to Sentry with operation + context tags.
//   3. Leaves the decision to rollback/rethrow up to the caller.
//
// Typical usage in an optimistic handler:
//
//   try {
//     await supabase.from("daily_logs").insert({ ... });
//   } catch (err) {
//     // rollback local state first so UI matches reality
//     setState(prevSnapshot);
//     reportMutationError(err, { op: "setCompleted", lang, userId });
//     // rethrow if the caller cares (e.g. await chain)
//     throw err;
//   }

import { toast } from "sonner";
import { tx } from "@/lib/translations";

export type MutationLang = "tr" | "en";

export interface MutationErrorContext {
  /** Short operation name. Becomes a Sentry tag → groupable. */
  op: string;
  /** Authenticated user id (NOT the active family profile). */
  userId?: string;
  /** Active profile id if different from userId. Helps debug family flows. */
  activeProfileId?: string;
  /** Language for the user-facing toast. */
  lang: MutationLang;
  /** Free-form extras sent to Sentry only. Never shown to user. */
  extra?: Record<string, unknown>;
}

type ErrorCategory = "permission" | "network" | "unknown";

function categorize(err: unknown): ErrorCategory {
  if (!err) return "unknown";
  const e = err as { code?: string | number; status?: number; message?: string };
  // Supabase RLS rejection / HTTP auth codes
  if (
    e.code === "PGRST301" ||
    e.code === "42501" ||
    e.status === 401 ||
    e.status === 403 ||
    e.status === 406
  ) {
    return "permission";
  }
  // Network / offline / timeout signatures
  if (typeof e.message === "string" && /network|fetch|timeout|failed to fetch|offline/i.test(e.message)) {
    return "network";
  }
  return "unknown";
}

function messageFor(category: ErrorCategory, lang: MutationLang): string {
  const key =
    category === "permission" ? "mutation.permissionDenied"
    : category === "network"    ? "mutation.networkError"
    : "mutation.saveError";
  return tx(key, lang);
}

/**
 * Report a failed DB mutation. Toast + Sentry capture — never re-throws,
 * never rolls back; callers decide both.
 */
export function reportMutationError(err: unknown, ctx: MutationErrorContext): void {
  const category = categorize(err);
  const message = messageFor(category, ctx.lang);

  toast.error(message);

  // Dynamic import mirrors components/error/PageError.tsx — keeps Sentry
  // out of bundles that never hit this path.
  import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.captureException(err, {
        tags: { mutation_op: ctx.op, category },
        extra: {
          userId: ctx.userId,
          activeProfileId: ctx.activeProfileId,
          ...ctx.extra,
        },
      });
    })
    .catch(() => {
      // Sentry unavailable — user already saw the toast.
    });
}
