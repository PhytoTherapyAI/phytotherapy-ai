// © 2026 DoctoPal — All Rights Reserved
"use client";

import { PageError } from "@/components/error/PageError";
import { Shield } from "lucide-react";

export default function InteractionCheckerError({
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
      icon={<Shield className="h-12 w-12 text-pink-500/60" />}
      title="Interaction Checker unavailable"
      description="We couldn't load the interaction analysis tool. Your medication data is safe. Please try again."
      retryLabel="Retry Analysis"
    />
  );
}
