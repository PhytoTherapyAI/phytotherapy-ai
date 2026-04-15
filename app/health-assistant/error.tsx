// © 2026 DoctoPal — All Rights Reserved
"use client";

import { PageError } from "@/components/error/PageError";
import { Sparkles } from "lucide-react";

export default function HealthAssistantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      error={error}
      reset={reset}
      icon={<Sparkles className="h-12 w-12 text-primary/60" />}
      title="Health Assistant unavailable"
      description="The AI assistant encountered an issue. Your conversation history is safe — try again or come back later."
      retryLabel="Restart Chat"
    />
  );
}
