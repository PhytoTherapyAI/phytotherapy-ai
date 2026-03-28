import { test, expect } from "@playwright/test";

test("Health check API returns results", async ({ request }) => {
  const res = await request.get("/api/health-check");
  expect(res.status()).toBe(200);
  const data = await res.json();
  expect(data.results).toBeDefined();
  expect(data.results.length).toBeGreaterThan(0);
  expect(data.timestamp).toBeDefined();
});

test("Market intelligence API returns data", async ({ request }) => {
  const res = await request.get("/api/market-intelligence?section=overview");
  expect(res.status()).toBe(200);
});

test("Blood analysis API rejects empty input", async ({ request }) => {
  const res = await request.post("/api/blood-analysis", { data: {} });
  expect(res.status()).toBe(400);
});

test("Interaction API rejects empty input", async ({ request }) => {
  const res = await request.post("/api/interaction", { data: {} });
  expect(res.status()).toBe(400);
});

test("Chat API rejects empty input", async ({ request }) => {
  const res = await request.post("/api/chat", { data: {} });
  // Should return 400 or 401 (if auth required), not 500
  expect([400, 401]).toContain(res.status());
});

test("Health score API responds", async ({ request }) => {
  const res = await request.get("/api/health-score");
  // GET without auth should return 400 or 401, not 500
  expect(res.status()).toBeLessThan(500);
});
