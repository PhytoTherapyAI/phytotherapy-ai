// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Smart Tool Navigation — Hierarchy-aware back navigation
// Maps any tool page to its parent category for breadcrumbs + back button
// ============================================

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { TOOL_CATEGORIES, type ToolCategory, type ToolModule } from "@/lib/tools-hierarchy";

export interface ToolBreadcrumb {
  /** Current tool module (null if on category or non-tool page) */
  currentTool: ToolModule | null;
  /** Parent category (null if not in a tool) */
  parentCategory: ToolCategory | null;
  /** Full breadcrumb path */
  breadcrumbs: Array<{ label: { en: string; tr: string }; href: string }>;
  /** Smart back URL — parent category or /tools */
  backUrl: string;
  /** Whether user is on a tool page */
  isToolPage: boolean;
}

// Pre-build a lookup: href → { module, category }
const TOOL_LOOKUP = new Map<string, { module: ToolModule; category: ToolCategory }>();

for (const category of TOOL_CATEGORIES) {
  for (const mod of category.modules) {
    // Normalize href (remove trailing slash)
    const normalizedHref = mod.href.replace(/\/$/, "");
    TOOL_LOOKUP.set(normalizedHref, { module: mod, category });
  }
}

/**
 * Hook: returns breadcrumb + smart back navigation for current route
 */
export function useToolNavigation(): ToolBreadcrumb {
  const pathname = usePathname();

  return useMemo(() => {
    // Normalize pathname
    const path = pathname.replace(/\/$/, "") || "/";

    // Check if current path matches a tool
    const match = TOOL_LOOKUP.get(path);

    if (!match) {
      // Check if we're on a category page (e.g., /tools)
      const isToolsHub = path === "/tools";
      return {
        currentTool: null,
        parentCategory: null,
        breadcrumbs: isToolsHub
          ? [{ label: { en: "Tools", tr: "Araçlar" }, href: "/tools" }]
          : [],
        backUrl: "/dashboard",
        isToolPage: false,
      };
    }

    const { module: currentTool, category: parentCategory } = match;

    return {
      currentTool,
      parentCategory,
      breadcrumbs: [
        { label: { en: "Tools", tr: "Araçlar" }, href: "/tools" },
        { label: parentCategory.title, href: `/tools?category=${parentCategory.slug}` },
        { label: currentTool.title, href: currentTool.href },
      ],
      backUrl: `/tools?category=${parentCategory.slug}`,
      isToolPage: true,
    };
  }, [pathname]);
}

/**
 * Get parent category for a given tool href (server-side safe)
 */
export function getToolParent(href: string): { category: ToolCategory; module: ToolModule } | null {
  const normalized = href.replace(/\/$/, "");
  const match = TOOL_LOOKUP.get(normalized);
  return match ? { category: match.category, module: match.module } : null;
}
