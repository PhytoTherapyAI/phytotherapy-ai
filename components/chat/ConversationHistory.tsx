"use client";

import { useState, useEffect, useCallback } from "react";
import { History, MessageSquare, ChevronRight, ChevronLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { createBrowserClient } from "@/lib/supabase";

interface ConversationEntry {
  id: string;
  query_text: string;
  query_type: string;
  response_text: string | null;
  created_at: string;
}

interface ConversationHistoryProps {
  onSelectConversation: (query: string, response: string | null) => void;
}

export function ConversationHistory({ onSelectConversation }: ConversationHistoryProps) {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang()
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated || !session?.user?.id) return;

    setIsLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("query_history")
        .select("id, query_text, query_type, response_text, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching history:", error);
        return;
      }

      setConversations(data || []);
    } catch (err) {
      console.error("Failed to fetch conversation history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, session?.user?.id]);

  // Fetch when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return tx("time.justNow", lang);
    if (diffMins < 60) return `${diffMins} ${tx("time.minsAgo", lang)}`;
    if (diffHours < 24) return `${diffHours} ${tx("time.hoursAgo", lang)}`;
    if (diffDays < 7) return `${diffDays} ${tx("time.daysAgo", lang)}`;
    return date.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric" });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "interaction": return "💊";
      case "blood_test": return "🩸";
      default: return "💬";
    }
  };

  const truncate = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen).trim() + "...";
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        title={tx("chat.historyTitle", lang)}
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">{tx('ch.history', lang)}</span>
        {isOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>

      {/* Slide-out panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative ml-auto flex h-full w-80 flex-col border-l bg-background shadow-xl sm:w-96">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h3 className="font-semibold" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>{tx('ch.title', lang)}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">{tx('ch.empty', lang)}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {tx('ch.emptyDesc', lang)}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.query_text, conv.response_text);
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-sm">{getTypeIcon(conv.query_type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug">
                            {truncate(conv.query_text, 80)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(conv.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {conversations.length > 0 && (
              <div className="border-t px-4 py-2">
                <p className="text-center text-xs text-muted-foreground">
                  {tx('ch.showingLast', lang)} {conversations.length} {tx('ch.conversations', lang)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
