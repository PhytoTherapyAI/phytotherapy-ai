// © 2026 DoctoPal — All Rights Reserved
import type { MetadataRoute } from "next";
import { TOOL_CATEGORIES } from "@/lib/tools-hierarchy";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://doctopal.com";

  // ── 1. Static pages ──
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/enterprise`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/courses`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/security`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/accessibility`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/intended-purpose`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // ── 2. Core tools (high priority) ──
  const coreTools: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/health-assistant`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/interaction-checker`, changeFrequency: "weekly", priority: 0.9 },
  ];

  // ── 3. All visible tools from tools-hierarchy ──
  const toolPages: MetadataRoute.Sitemap = TOOL_CATEGORIES.flatMap(cat =>
    cat.modules
      .filter(m => !m.hidden)
      .map(m => ({
        url: `${baseUrl}${m.href}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  );

  // ── 4. Auth-gated pages (still indexable for SEO) ──
  const authPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/calendar`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/profile`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/settings`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/family`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/doctor`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/badges`, changeFrequency: "weekly", priority: 0.4 },
  ];

  // ── 5. Medical content pages (SEO-valuable) ──
  const medicalPages: MetadataRoute.Sitemap = [
    "/first-aid", "/cancer-support",
    "/autism-support",
    "/smoking-cessation", "/alcohol-tracker",
    "/military-health", "/hajj-health",
    "/seasonal-food", "/detox-facts",
    "/rare-diseases",
  ].map(path => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Deduplicate by URL
  const allPages = [...staticPages, ...coreTools, ...toolPages, ...authPages, ...medicalPages];
  const seen = new Set<string>();
  return allPages.filter(page => {
    if (seen.has(page.url)) return false;
    seen.add(page.url);
    return true;
  });
}
