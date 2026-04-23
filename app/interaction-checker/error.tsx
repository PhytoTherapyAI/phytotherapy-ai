// © 2026 DoctoPal — All Rights Reserved
"use client";

import { PageError } from "@/components/error/PageError";
import { Shield } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

export default function InteractionCheckerError({
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
      icon={<Shield className="h-12 w-12 text-pink-500/60" />}
      title={tx("error.interactionCheckerUnavailable", lang)}
      description={tx("error.interactionCheckerUnavailableDesc", lang)}
    />
  );
}
