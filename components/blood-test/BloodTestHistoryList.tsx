// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { tx, type Lang } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BloodTestSummaryItem {
  id: string;
  created_at: string;
  summary: string | null;
  overall_urgency: "routine" | "soon" | "urgent" | null;
  abnormal_count: number;
  supplement_count: number;
}

interface Props {
  lang: Lang;
  targetUserId?: string;
}

const URGENCY_CONFIG: Record<
  "routine" | "soon" | "urgent",
  {
    labelKey: string;
    className: string;
    icon: typeof CheckCircle;
  }
> = {
  routine: {
    labelKey: "mhx.urgencyRoutine",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
    icon: CheckCircle,
  },
  soon: {
    labelKey: "mhx.urgencySoon",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
    icon: Clock,
  },
  urgent: {
    labelKey: "mhx.urgencyUrgent",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
    icon: AlertTriangle,
  },
};

function relativeDate(iso: string, lang: Lang): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return lang === "tr" ? "Bugün" : "Today";
  if (days === 1) return lang === "tr" ? "Dün" : "Yesterday";
  if (days < 7) return lang === "tr" ? `${days} gün önce` : `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return lang === "tr" ? `${weeks} hafta önce` : `${weeks} weeks ago`;
  return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BloodTestHistoryList({ lang, targetUserId }: Props) {
  const { session } = useAuth();
  const [items, setItems] = useState<BloodTestSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Sprint 25 Commit 5 — delete flow state (ConversationHistory pattern mirror).
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(
    async (currentSkip: number, reset = false) => {
      if (!session?.access_token) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          skip: String(currentSkip),
          take: "10",
          ...(targetUserId ? { targetUserId } : {}),
        });
        const res = await fetch(`/api/blood-tests/list?${params}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (reset) {
          setItems((data.items as BloodTestSummaryItem[]) ?? []);
        } else {
          setItems((prev) => [...prev, ...((data.items as BloodTestSummaryItem[]) ?? [])]);
        }
        setHasMore(Boolean(data.hasMore));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [session?.access_token, targetUserId],
  );

  useEffect(() => {
    setSkip(0);
    void fetchItems(0, true);
  }, [fetchItems]);

  const handleLoadMore = () => {
    const nextSkip = skip + 10;
    setSkip(nextSkip);
    void fetchItems(nextSkip);
  };

  // Sprint 25 Commit 5 — optimistic delete with rollback (ConversationHistory mirror).
  // Snapshot current list first so a 4xx/5xx response can restore exact ordering.
  // Cleanup expanded state if the deleted row was the active accordion.
  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId || !session?.access_token) return;
    const idToDelete = pendingDeleteId;
    const snapshot = items;
    setIsDeleting(true);

    // Optimistic remove + collapse if expanded
    setItems((prev) => prev.filter((it) => it.id !== idToDelete));
    if (expanded === idToDelete) setExpanded(null);

    try {
      const params = new URLSearchParams(
        targetUserId ? { targetUserId } : {},
      );
      const queryStr = params.toString();
      const res = await fetch(
        `/api/blood-tests/${idToDelete}${queryStr ? `?${queryStr}` : ""}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      );

      if (!res.ok) {
        setItems(snapshot);
        toast.error(tx("mhx.deleteError", lang));
        return;
      }

      toast.success(tx("mhx.deleteSuccess", lang));
    } catch (err) {
      console.error("Failed to delete blood test:", err);
      setItems(snapshot);
      toast.error(tx("mhx.deleteError", lang));
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, session?.access_token, items, expanded, targetUserId]);

  if (loading && items.length === 0) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">{tx("mhx.empty", lang)}</p>;
  }

  return (
    <>
      <div className="space-y-3">
      {items.map((item) => {
        const urgency = item.overall_urgency ?? "routine";
        const cfg = URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.routine;
        const Icon = cfg.icon;
        const isExpanded = expanded === item.id;

        return (
          <div key={item.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-stretch">
              <button
                onClick={() => setExpanded(isExpanded ? null : item.id)}
                className="flex-1 min-w-0 flex items-start gap-3 p-3 text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{relativeDate(item.created_at, lang)}</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border shrink-0",
                        cfg.className,
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {tx(cfg.labelKey, lang)}
                    </span>
                  </div>
                  {item.summary && (
                    <p className={cn("text-sm text-foreground", !isExpanded && "line-clamp-2")}>{item.summary}</p>
                  )}
                  {(item.abnormal_count > 0 || item.supplement_count > 0) && (
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {item.abnormal_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {tx("mhx.abnormalCount", lang).replace("{n}", String(item.abnormal_count))}
                        </span>
                      )}
                      {item.supplement_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {tx("mhx.supplementCount", lang).replace("{n}", String(item.supplement_count))}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
              </button>
              {/* Sprint 25 Commit 5 — delete trigger. e.stopPropagation prevents accordion expand. */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDeleteId(item.id);
                }}
                aria-label={tx("mhx.deleteAria", lang)}
                className="shrink-0 flex items-center justify-center min-h-11 min-w-11 px-3 text-muted-foreground/50 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full text-sm text-primary hover:underline py-2 disabled:opacity-50"
        >
          {loading ? tx("mhx.loading", lang) : tx("mhx.loadMore", lang)}
        </button>
      )}
      </div>

      {/* Sprint 25 Commit 5 — delete confirm Dialog (ConversationHistory pattern mirror). */}
      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(v) => {
          if (!v && !isDeleting) setPendingDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-600" />
              {tx("mhx.deleteConfirmTitle", lang)}
            </DialogTitle>
            <DialogDescription>
              {tx("mhx.deleteConfirmDesc", lang)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingDeleteId(null)}
              disabled={isDeleting}
            >
              {tx("mhx.deleteCancel", lang)}
            </Button>
            <Button
              size="sm"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5">{tx("mhx.deleteConfirmAction", lang)}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
