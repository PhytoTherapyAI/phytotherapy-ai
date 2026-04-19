// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Pill, CheckCircle2, RefreshCw, Loader2, UserCircle } from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationHistory } from "@/components/chat/ConversationHistory";
import { SmartWelcome } from "@/components/chat/SmartWelcome";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/lib/family-context";
import { useActiveProfile } from "@/lib/use-active-profile";
import { useDailyMedCheck } from "@/lib/daily-med-check";
import { createBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LocalizedTitle } from "@/components/layout/LocalizedTitle";

export default function HealthAssistantPage() {
  const { lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? undefined;
  const {
    isAuthenticated, isLoading, profile, user,
    needsMedicationUpdate,
    refreshProfile,
  } = useAuth();
  const { activeUserId, isOwnProfile } = useActiveProfile();
  const { familyMembers, setActiveProfile } = useFamily();
  const { needsDailyCheck, confirmDaily, needsOnboardingRefresh } = useDailyMedCheck();

  const activeMember = !isOwnProfile
    ? familyMembers.find(m => m.user_id === activeUserId)
    : null;
  const activeMemberName = activeMember?.nickname
    || (activeMember?.profile?.display_name as string | undefined)
    || null;

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
      <LocalizedTitle tr="Sağlık Asistanı" en="AI Health Assistant" />
      {/* Left Sidebar — conversation history (desktop only).
          Hidden when viewing a family member's profile: query_history is keyed
          by the authenticated user, so showing the caller's own history on
          someone else's profile screen would leak their searches (KVKK). */}
      {isAuthenticated && isOwnProfile && (
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
        <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
          {/* Active family member context banner */}
          {!isOwnProfile && activeUserId && (
            <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm text-emerald-800 dark:text-emerald-200">
                <UserCircle className="h-4 w-4 shrink-0" />
                <span>
                  {tx("family.askingFor", lang).replace("{name}", activeMemberName || (lang === "tr" ? "aile üyesi" : "family member"))}
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (user?.id) await setActiveProfile(user.id)
                }}
                className="shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                {tx("family.switchBack", lang)}
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
                    {tx('ha.title', lang)}
                  </h1>
                  <InfoTooltip title="Health Assistant" description="Ask any health question. AI searches PubMed and gives evidence-based, personalized answers." />
                </div>
                <p className="text-sm text-muted-foreground">
                  {tx('ha.subtitle', lang)}
                </p>
              </div>
            </div>
            {/* Mobile: drawer toggle — same privacy rule as the desktop sidebar. */}
            {isOwnProfile && (
              <div className="lg:hidden">
                <ConversationHistory
                  onSelectConversation={handleSelectConversation}
                  onNewConversation={handleNewConversation}
                />
              </div>
            )}
          </div>

          {/* Smart Welcome — contextual greeting + personalized chips + did you know.
              userName follows the active profile so "Günaydın İpek" doesn't show up
              on Taha's screen. */}
          <SmartWelcome
            lang={lang}
            userName={
              isOwnProfile
                ? profile?.full_name?.split(" ")[0]
                : activeMember?.profile?.full_name?.split(" ")[0] || activeMemberName || undefined
            }
            medications={undefined}
            onSelectPrompt={(prompt) => {
              const textarea = document.querySelector("textarea");
              if (textarea) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLTextAreaElement.prototype, "value"
                )?.set;
                nativeInputValueSetter?.call(textarea, prompt);
                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                textarea.dispatchEvent(new Event("change", { bubbles: true }));
                textarea.focus();
              }
            }}
          />

          {/* Chat Interface with Daily Check Overlay */}
          <div className="relative">
            <ChatInterface
              key={chatKey}
              className="h-[calc(100vh-280px)] min-h-[500px]"
              loadConversation={loadConversation}
              initialQuery={urlQuery}
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
