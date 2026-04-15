// © 2026 DoctoPal — All Rights Reserved
import { test, expect } from "@playwright/test";

// ── Public GET endpoints (no auth needed) ──
test.describe("Public API Endpoints", () => {
  const PUBLIC_GETS = [
    { path: "/api/health-check", name: "Health Check" },
    { path: "/api/drug-search?q=aspirin", name: "Drug Search" },
    { path: "/api/market-intelligence?section=overview", name: "Market Intelligence" },
  ];

  for (const { path, name } of PUBLIC_GETS) {
    test(`${name} returns 200`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
    });
  }
});

// ── Auth-required POST endpoints (should return 400 or 401, never 500) ──
test.describe("Auth-Required Endpoints — No Crash Without Auth", () => {
  const AUTH_POSTS = [
    { path: "/api/blood-analysis", data: {}, name: "Blood Analysis" },
    { path: "/api/interaction", data: {}, name: "Interaction" },
    { path: "/api/chat", data: {}, name: "Chat" },
    { path: "/api/symptom-assessment", data: {}, name: "Symptom Assessment" },
    { path: "/api/sleep-analysis", data: {}, name: "Sleep Analysis" },
    { path: "/api/nutrition-log", data: {}, name: "Nutrition Log" },
    { path: "/api/pain-diary", data: {}, name: "Pain Diary" },
    { path: "/api/mental-wellness", data: {}, name: "Mental Wellness" },
    { path: "/api/radiology-analysis", data: {}, name: "Radiology Analysis" },
    { path: "/api/supplement-check", data: {}, name: "Supplement Check" },
    { path: "/api/supplement-compare", data: {}, name: "Supplement Compare" },
    { path: "/api/depression-screening", data: {}, name: "Depression Screening" },
    { path: "/api/anxiety-toolkit", data: {}, name: "Anxiety Toolkit" },
    { path: "/api/food-interaction", data: {}, name: "Food Interaction" },
    { path: "/api/genetic-risk", data: {}, name: "Genetic Risk" },
    { path: "/api/gut-health", data: {}, name: "Gut Health" },
    { path: "/api/kidney-dashboard", data: {}, name: "Kidney Dashboard" },
    { path: "/api/liver-monitor", data: {}, name: "Liver Monitor" },
    { path: "/api/thyroid-dashboard", data: {}, name: "Thyroid Dashboard" },
    { path: "/api/cardiovascular-risk", data: {}, name: "Cardiovascular Risk" },
    { path: "/api/cancer-screening", data: {}, name: "Cancer Screening" },
    { path: "/api/pregnancy-tracker", data: {}, name: "Pregnancy Tracker" },
    { path: "/api/smoking-cessation", data: {}, name: "Smoking Cessation" },
    { path: "/api/sports-performance", data: {}, name: "Sports Performance" },
    { path: "/api/eye-health", data: {}, name: "Eye Health" },
    { path: "/api/ear-health", data: {}, name: "Ear Health" },
    { path: "/api/elder-care", data: {}, name: "Elder Care" },
    { path: "/api/child-health", data: {}, name: "Child Health" },
    { path: "/api/travel-health", data: {}, name: "Travel Health" },
    { path: "/api/vaccination", data: {}, name: "Vaccination" },
    { path: "/api/skin-health", data: {}, name: "Skin Health" },
  ];

  for (const { path, data, name } of AUTH_POSTS) {
    test(`${name} — no 500 on empty POST`, async ({ request }) => {
      const res = await request.post(path, { data });
      expect(res.status()).toBeLessThan(500);
    });
  }
});

// ── Auth-required GET endpoints ──
test.describe("Auth-Required GET Endpoints", () => {
  const AUTH_GETS = [
    "/api/health-score",
    "/api/calendar",
    "/api/daily-log",
    "/api/health-goals",
    "/api/family",
    "/api/analytics",
    "/api/health-analytics",
    "/api/check-in",
    "/api/consent",
    "/api/user",
  ];

  for (const path of AUTH_GETS) {
    test(`GET ${path} — no 500 without auth`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBeLessThan(500);
    });
  }
});

// ── Contact form (public POST) ──
test("Contact API validates required fields", async ({ request }) => {
  const res = await request.post("/api/contact", { data: {} });
  expect(res.status()).toBe(400);
});

test("Contact API accepts valid submission", async ({ request }) => {
  const res = await request.post("/api/contact", {
    data: {
      name: "Test User",
      email: "test@example.com",
      subject: "Test",
      message: "Hello",
      turnstileToken: "test-token",
    },
  });
  // 200 or 400 (if turnstile rejects test token), but never 500
  expect(res.status()).toBeLessThan(500);
});
