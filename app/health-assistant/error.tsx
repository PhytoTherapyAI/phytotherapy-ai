// © 2026 DoctoPal — All Rights Reserved
"use client";

import { PageError } from "@/components/error/PageError";
import { Sparkles } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

export default function HealthAssistantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLang();
  return (
    <PageError
      error={error}
      reset={reset}
      icon={<Sparkles className="h-12 w-12 text-primary/60" />}
      title={tx("error.healthAssistantUnavailable", lang)}
      description={tx("error.healthAssistantUnavailableDesc", lang)}
    />
  );
}
