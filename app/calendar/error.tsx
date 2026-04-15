// © 2026 DoctoPal — All Rights Reserved
"use client";

import { PageError } from "@/components/error/PageError";
import { CalendarDays } from "lucide-react";

export default function CalendarError({
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
      icon={<CalendarDays className="h-12 w-12 text-blue-500/60" />}
      title="Calendar unavailable"
      description="We couldn't load your health calendar. Your schedule data is safe — try refreshing."
      retryLabel="Reload Calendar"
    />
  );
}
