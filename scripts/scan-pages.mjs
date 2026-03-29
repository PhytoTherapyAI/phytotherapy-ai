/**
 * Programmatic page scanner — checks all tool URLs for:
 * 1. Empty pages (< 100 chars of content)
 * 2. Raw translation keys (e.g., "tools.xxx" or "common.xxx" visible as text)
 * 3. HTTP errors (500, crash)
 */

const BASE = "http://localhost:3000";

// Extract all hrefs from tools-hierarchy.ts
import { readFileSync } from "fs";
const src = readFileSync("lib/tools-hierarchy.ts", "utf-8");
const hrefRegex = /href:\s*"([^"]+)"/g;
const hrefs = new Set();
let match;
while ((match = hrefRegex.exec(src)) !== null) {
  hrefs.add(match[1]);
}

// Add important non-tool pages
const extraPages = [
  "/", "/login", "/profile", "/dashboard", "/about",
  "/health-guides", "/medication-hub", "/tools",
  "/calendar", "/chat", "/history", "/settings",
  "/courses", "/enterprise", "/research-hub",
];
extraPages.forEach(p => hrefs.add(p));

const allUrls = [...hrefs].sort();
console.log(`\n📋 Scanning ${allUrls.length} URLs...\n`);

const results = { ok: 0, empty: 0, rawKeys: 0, error: 0, crashed: 0 };
const issues = [];

// Process in batches of 10
const BATCH = 10;
for (let i = 0; i < allUrls.length; i += BATCH) {
  const batch = allUrls.slice(i, i + BATCH);
  const promises = batch.map(async (url) => {
    try {
      const res = await fetch(`${BASE}${url}`, {
        headers: { "Accept": "text/html" },
        redirect: "follow",
      });

      if (res.status >= 500) {
        issues.push({ url, type: "CRASH", detail: `HTTP ${res.status}` });
        results.crashed++;
        return;
      }

      if (res.status >= 400) {
        issues.push({ url, type: "ERROR", detail: `HTTP ${res.status}` });
        results.error++;
        return;
      }

      const html = await res.text();

      // Check for very short content (possible empty page)
      // Strip HTML tags and check text length
      const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      if (text.length < 200) {
        issues.push({ url, type: "EMPTY", detail: `Only ${text.length} chars of text` });
        results.empty++;
        return;
      }

      // Check for raw translation keys visible in HTML
      const rawKeyPattern = /(?:tools\.|common\.|auth\.|nav\.)[a-zA-Z_.]+(?=<|"|\s)/g;
      const rawKeys = html.match(rawKeyPattern);
      if (rawKeys && rawKeys.length > 2) {
        issues.push({ url, type: "RAW_KEYS", detail: `${rawKeys.length} raw keys: ${rawKeys.slice(0, 3).join(", ")}...` });
        results.rawKeys++;
        return;
      }

      results.ok++;
    } catch (err) {
      issues.push({ url, type: "FETCH_ERROR", detail: err.message });
      results.crashed++;
    }
  });

  await Promise.all(promises);
  process.stdout.write(`  Scanned ${Math.min(i + BATCH, allUrls.length)}/${allUrls.length}\r`);
}

console.log("\n");
console.log("═══════════════════════════════════════");
console.log("  SCAN RESULTS");
console.log("═══════════════════════════════════════");
console.log(`  ✅ OK:          ${results.ok}`);
console.log(`  📭 Empty:       ${results.empty}`);
console.log(`  🔤 Raw Keys:    ${results.rawKeys}`);
console.log(`  ⚠️  HTTP Error:  ${results.error}`);
console.log(`  💥 Crash:       ${results.crashed}`);
console.log(`  📋 Total:       ${allUrls.length}`);
console.log("═══════════════════════════════════════\n");

if (issues.length > 0) {
  console.log("ISSUES FOUND:");
  console.log("─────────────");
  for (const issue of issues.sort((a, b) => a.type.localeCompare(b.type))) {
    const icon = issue.type === "CRASH" ? "💥" : issue.type === "EMPTY" ? "📭" : issue.type === "RAW_KEYS" ? "🔤" : "⚠️";
    console.log(`  ${icon} [${issue.type}] ${issue.url} — ${issue.detail}`);
  }
} else {
  console.log("🎉 No issues found!");
}
