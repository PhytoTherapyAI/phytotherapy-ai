import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
  // Filter out known noise errors
  beforeSend(event) {
    const msg = event.exception?.values?.[0]?.value || "";
    // Supabase auth lock contention — benign, happens on rapid navigation
    if (msg.includes("Lock was stolen by another request")) return null;
    // AbortError from navigation cancelling in-flight requests — expected behavior
    if (msg.includes("AbortError") || msg.includes("The operation was aborted")) return null;
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
