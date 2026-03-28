import { test, expect } from "@playwright/test";

const PAGES = [
  "/",
  "/about",
  "/health-assistant",
  "/interaction-checker",
  "/medical-analysis",
  "/body-analysis",
  "/symptom-checker",
  "/food-interaction",
  "/supplement-compare",
  "/sleep-analysis",
  "/mental-wellness",
  "/nutrition",
  "/gut-health",
  "/skin-health",
  "/pain-diary",
  "/voice-diary",
  "/anxiety-toolkit",
  "/depression-screening",
  "/first-aid",
  "/breathing-exercises",
  "/enterprise",
  "/courses",
  "/chronic-care",
  "/allergy-map",
  "/travel-health",
  "/vaccination",
  "/rehabilitation",
  "/seasonal-health",
  "/pharmacogenetics",
  "/elder-care",
  "/child-health",
  "/sports-performance",
  "/caffeine-tracker",
  "/alcohol-tracker",
  "/smoking-cessation",
  "/eye-health",
  "/ear-health",
  "/dental-health",
  "/hair-nail-health",
  "/kidney-dashboard",
  "/liver-monitor",
  "/thyroid-dashboard",
  "/cardiovascular-risk",
  "/lung-monitor",
  "/adhd-management",
  "/ptsd-support",
  "/addiction-recovery",
  "/mens-health",
  "/sexual-health",
  "/cancer-screening",
  "/medical-dictionary",
  "/drug-info",
  "/rare-diseases",
  "/auth/login",
];

for (const page of PAGES) {
  test(`Page ${page} loads successfully`, async ({ page: p }) => {
    const response = await p.goto(page);
    expect(response?.status()).toBe(200);
    // Check no error boundary is shown
    const errorText = await p.locator("text=Something went wrong").count();
    expect(errorText).toBe(0);
  });
}
