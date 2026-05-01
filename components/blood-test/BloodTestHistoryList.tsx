// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { tx, type Lang } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

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
    <div className="space-y-3">
      {items.map((item) => {
        const urgency = item.overall_urgency ?? "routine";
        const cfg = URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.routine;
        const Icon = cfg.icon;
        const isExpanded = expanded === item.id;

        return (
          <div key={item.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : item.id)}
              className="w-full flex items-start gap-3 p-3 text-left hover:bg-accent/50 transition-colors"
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
  );
}
