// © 2026 DoctoPal — All Rights Reserved
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/onboarding",
        "/auth/",
        "/admin/",
        "/select-profile",
        "/data-delete",
        "/data-export",
        "/privacy-controls",
      ],
    },
    sitemap: "https://doctopal.com/sitemap.xml",
  };
}
