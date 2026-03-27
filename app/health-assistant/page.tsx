"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Pill, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationHistory } from "@/components/chat/ConversationHistory";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { useDailyMedCheck } from "@/lib/daily-med-check";
import { createBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const EXAMPLE_QUESTION_KEYS = ["ha.ex1", "ha.ex2", "ha.ex3", "ha.ex4", "ha.ex5", "ha.ex6"];

export default function HealthAssistantPage() {
  const { lang } = useLang();
  const router = useRouter();
  const {
    isAuthenticated, isLoading, profile,
    needsMedicationUpdate,
    refreshProfile,
  } = useAuth();
  const { needsDailyCheck, confirmDaily, needsOnboardingRefresh } = useDailyMedCheck();

  const [loadConversation, setLoadConversation] = useState<{
    query: string;
    response: string | null;
  } | null>(null);
  const [confirmingDaily, setConfirmingDaily] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const handleSelectConversation = (query: string, response: string | null) => {
    setLoadConversation({ query, response });
  };

  const handleNewConversation = () => {
    setLoadConversation(null);
    setChatKey((prev) => prev + 1);
  };

  // Show daily blocker
  const showDailyBlocker =
    isAuthenticated &&
    !isLoading &&
    profile?.onboarding_complete &&
    !needsMedicationUpdate &&
    !needsOnboardingRefresh &&
    needsDailyCheck;

  const handleDailyConfirm = useCallback(async () => {
    if (!profile) return;
    setConfirmingDaily(true);
    try {
      const supabase = createBrowserClient();
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", profile.id);
      confirmDaily();
      await refreshProfile();
    } catch (err) {
      console.error("Failed to confirm daily med check:", err);
    } finally {
      setConfirmingDaily(false);
    }
  }, [profile, confirmDaily, refreshProfile]);

  const handleDailyUpdate = () => {
    router.push("/profile?tab=medications");
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden">
      {/* Left Sidebar — conversation history (desktop only) */}
      {isAuthenticated && (
        <div className="hidden w-64 shrink-0 lg:block">
          <ConversationHistory
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            sidebar
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
                  {tx('ha.title', lang)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {tx('ha.subtitle', lang)}
                </p>
              </div>
            </div>
            {/* Mobile: drawer toggle */}
            <div className="lg:hidden">
              <ConversationHistory
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
              />
            </div>
          </div>

          {/* Example Questions */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {tx('ha.tryAsking', lang)}
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTION_KEYS.map((key) => {
                const q = tx(key, lang);
                return (
                  <button
                    key={key}
                    className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    onClick={() => {
                      const textarea = document.querySelector("textarea");
                      if (textarea) {
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                          window.HTMLTextAreaElement.prototype,
                          "value"
                        )?.set;
                        nativeInputValueSetter?.call(textarea, q);
                        textarea.dispatchEvent(new Event("input", { bubbles: true }));
                        textarea.dispatchEvent(new Event("change", { bubbles: true }));
                        textarea.focus();
                      }
                    }}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Interface with Daily Check Overlay */}
          <div className="relative">
            <ChatInterface
              key={chatKey}
              className="h-[calc(100vh-280px)] min-h-[500px]"
              loadConversation={loadConversation}
            />

            {/* Daily medication check blocker overlay */}
            {showDailyBlocker && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                <div className="mx-4 max-w-sm rounded-xl border bg-card p-6 shadow-lg">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      {tx("dailyMed.blockerTitle", lang)}
                    </h3>
                  </div>
                  <p className="mb-5 text-sm text-muted-foreground">
                    {tx("dailyMed.blockerDesc", lang)}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="outline"
                      onClick={handleDailyConfirm}
                      disabled={confirmingDaily}
                      className="gap-2"
                    >
                      {confirmingDaily ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {tx("dailyMed.confirmSame", lang)}
                    </Button>
                    <Button
                      onClick={handleDailyUpdate}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {tx("dailyMed.update", lang)}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            ⚠️ {tx('disclaimer.tool', lang)}
          </p>
        </div>
      </main>
    </div>
  );
}
