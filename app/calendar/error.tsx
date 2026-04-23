// © 2026 DoctoPal — All Rights Reserved
"use client";

import { PageError } from "@/components/error/PageError";
import { CalendarDays } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

export default function CalendarError({
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
      icon={<CalendarDays className="h-12 w-12 text-blue-500/60" />}
      title={tx("error.calendarUnavailable", lang)}
      description={tx("error.calendarUnavailableDesc", lang)}
    />
  );
}
