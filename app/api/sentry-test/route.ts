// © 2026 DoctoPal — All Rights Reserved
// Test endpoint to verify Sentry error tracking is working
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    // Capture a test message
    Sentry.captureMessage("Sentry test — DoctoPal error tracking is working!", "info");

    // Also throw a real error to test exception capture
    throw new Error("DoctoPal Sentry Test Error — please ignore. Timestamp: " + new Date().toISOString());
  } catch (error) {
    Sentry.captureException(error);

    // Flush to ensure it's sent before response
    await Sentry.flush(2000);

    return NextResponse.json({
      success: true,
      message: "Test error sent to Sentry! Check https://phytotherapyai.sentry.io for the error.",
      timestamp: new Date().toISOString(),
    });
  }
}
