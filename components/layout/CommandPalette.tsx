// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/components/layout/language-toggle"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/components/layout/theme-provider"
import { useEffectivePremium } from "@/lib/use-effective-premium"
import { TOOL_CATEGORIES, searchModules } from "@/lib/tools-hierarchy"
import {
  PALETTE_REGISTRY,
  PALETTE_CATEGORY_LABELS,
  visibleEntries,
  matchPaletteEntry,
  type PaletteEntry,
  type PaletteCategory,
} from "@/lib/command-palette-registry"
import { Badge } from "@/components/ui/badge"
import {
  Search, X, ArrowRight, Stethoscope, FileText, Leaf, Clock,
  User, Pill, Brain, Sparkles, Star, Hash, CornerDownLeft,
  Command, LayoutDashboard, Shield, Zap, Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react"
import { tx } from "@/lib/translations"

// ── Search Data (mock content + supplements + doctors + palette registry) ──

interface SearchItem {
  id: string
  type: "doctor" | "article" | "supplement" | "tool" | "page" | "legal" | "action" | "setting"
  title: string
  subtitle?: string
  href: string
  icon?: string
  image?: string
  meta?: string
  /** For registry entries with action dispatch instead of navigation */
  action?: "signout" | "toggle-language" | "toggle-theme"
}

// Doctor search is placeholder — will be populated from Supabase in production
const DOCTORS_DB: SearchItem[] = []

const ARTICLES_DB: SearchItem[] = [
  { id: "a1", type: "article", title: "Berberine vs Metformin: A Comparative Analysis", subtitle: "Evidence-based comparison for blood sugar management", href: "/expert-content", meta: "5 min read" },
  { id: "a2", type: "article", title: "İlaç-Bitki Etkileşimlerinde Güncel Yaklaşımlar", subtitle: "Klinik pratikte sık karşılaşılan etkileşimler", href: "/expert-content", meta: "4 dk okuma" },
  { id: "a3", type: "article", title: "Understanding Ashwagandha: Mechanisms & Evidence", subtitle: "KSM-66 research for stress and anxiety", href: "/expert-content", meta: "8 min read" },
  { id: "a4", type: "article", title: "Omega-3 Fatty Acids in Cardiovascular Prevention", subtitle: "Latest meta-analysis findings from 2026", href: "/expert-content", meta: "6 min read" },
  { id: "a5", type: "article", title: "Zerdeçal ve Kurkumin: Bilimsel Gerçekler", subtitle: "Anti-inflamatuar etki mekanizmaları", href: "/expert-content", meta: "5 dk okuma" },
  { id: "a6", type: "article", title: "Diyabet Yönetiminde Fitoterapi Yaklaşımları", subtitle: "Kan şekeri kontrolü için bitkisel destekler", href: "/expert-content", meta: "7 dk okuma" },
]

const SUPPLEMENTS_DB: SearchItem[] = [
  { id: "s1", type: "supplement", title: "Curcumin (Zerdeçal)", subtitle: "Anti-inflammatory, Grade B evidence", href: "/supplement-compare", meta: "500-1000mg/day" },
  { id: "s2", type: "supplement", title: "Berberine", subtitle: "Blood sugar support, Grade A evidence", href: "/supplement-compare", meta: "500mg 2-3x/day" },
  { id: "s3", type: "supplement", title: "Ashwagandha KSM-66", subtitle: "Stress & anxiety, Grade B evidence", href: "/supplement-compare", meta: "300-600mg/day" },
  { id: "s4", type: "supplement", title: "Omega-3 (EPA/DHA)", subtitle: "Heart health, Grade A evidence", href: "/supplement-compare", meta: "1-2g/day" },
  { id: "s5", type: "supplement", title: "Magnesium Glycinate", subtitle: "Sleep, muscle, stress support", href: "/supplement-compare", meta: "200-400mg/day" },
  { id: "s6", type: "supplement", title: "Vitamin D3", subtitle: "Bone, immune, mood support", href: "/supplement-compare", meta: "2000-4000 IU/day" },
  { id: "s7", type: "supplement", title: "Probiotics", subtitle: "Gut health, immune support", href: "/supplement-compare", meta: "10B CFU/day" },
  { id: "s8", type: "supplement", title: "Valerian Root (Kediotu)", subtitle: "Sleep support, Grade B evidence", href: "/supplement-compare", meta: "300-600mg/night" },
  { id: "s9", type: "supplement", title: "St. John's Wort (Sarı Kantaron)", subtitle: "Mild depression, MANY interactions", href: "/interaction-checker", meta: "⚠️ Check interactions" },
  { id: "s10", type: "supplement", title: "Quercetin", subtitle: "Allergy, anti-inflammatory", href: "/supplement-compare", meta: "500mg 2x/day" },
]

// Build tool search items from hierarchy
function getToolItems(): SearchItem[] {
  return TOOL_CATEGORIES.flatMap(cat =>
    cat.modules.filter(m => !m.hidden).map(mod => ({
      id: `tool-${mod.id}`,
      type: "tool" as const,
      title: mod.title.en,
      subtitle: cat.title.en,
      href: mod.href,
      meta: mod.title.tr,
    }))
  )
}

const ALL_TOOLS = getToolItems()

// ── Search Function with Highlighting ──

interface SearchResult {
  category: string
  categoryLabel: { en: string; tr: string }
  icon: LucideIcon
  items: (SearchItem & { highlightedTitle: string })[]
  isAiMatch?: boolean
}

interface PaletteFilterContext {
  isAuthenticated: boolean
  isPremium: boolean
}

function performSearch(query: string, lang: string, ctx: PaletteFilterContext): SearchResult[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  const langKey = (lang === "tr" ? "tr" : "en") as "tr" | "en"

  const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  const highlight = (text: string): string => {
    const safe = escapeHtml(text)
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return safe.replace(regex, '<mark class="bg-primary/20 text-foreground rounded px-0.5">$1</mark>')
  }

  const matchItem = (item: SearchItem): boolean => {
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle?.toLowerCase().includes(q) ?? false) ||
      (item.meta?.toLowerCase().includes(q) ?? false)
    )
  }

  const results: SearchResult[] = []

  // ── Session 39/40: PAGES / LEGAL / ACTIONS / SETTINGS (registry-backed) ──
  const registryCtx = { lang: langKey, isAuthenticated: ctx.isAuthenticated, isPremium: ctx.isPremium }
  const visible = visibleEntries(registryCtx)
  const registryMatch = visible.filter((e) => matchPaletteEntry(e, query, langKey))

  const toSearchItem = (entry: PaletteEntry): SearchItem => {
    const typeMap: Record<PaletteCategory, SearchItem["type"]> = {
      pages: "page",
      legal: "legal",
      actions: "action",
      settings: "setting",
    }
    return {
      id: entry.id,
      type: typeMap[entry.category],
      title: entry.title[langKey],
      subtitle: entry.description?.[langKey],
      href: entry.href ?? "",
      action: entry.action,
    }
  }

  const buildRegistryGroup = (
    category: PaletteCategory,
    icon: LucideIcon,
    limit: number,
  ): SearchResult | null => {
    const subset = registryMatch.filter((e) => e.category === category)
    if (subset.length === 0) return null
    return {
      category,
      categoryLabel: PALETTE_CATEGORY_LABELS[category],
      icon,
      items: subset.slice(0, limit).map((e) => {
        const item = toSearchItem(e)
        return { ...item, highlightedTitle: highlight(item.title) }
      }),
    }
  }

  // Order matters — Pages first (most common), then Legal, Actions, Settings
  const pagesGroup = buildRegistryGroup("pages", LayoutDashboard, 5)
  if (pagesGroup) results.push(pagesGroup)

  const legalGroup = buildRegistryGroup("legal", Shield, 5)
  if (legalGroup) results.push(legalGroup)

  const actionsGroup = buildRegistryGroup("actions", Zap, 5)
  if (actionsGroup) results.push(actionsGroup)

  const settingsGroup = buildRegistryGroup("settings", SettingsIcon, 5)
  if (settingsGroup) results.push(settingsGroup)

  // ── Existing categories (unchanged) ──

  // Doctors
  const doctors = DOCTORS_DB.filter(matchItem)
  if (doctors.length > 0) {
    results.push({
      category: "doctors",
      categoryLabel: { en: "Expert Doctors", tr: "Uzman Doktorlar" },
      icon: Stethoscope,
      items: doctors.slice(0, 3).map(d => ({ ...d, highlightedTitle: highlight(d.title) })),
    })
  }

  // Articles
  const articles = ARTICLES_DB.filter(matchItem)
  if (articles.length > 0) {
    results.push({
      category: "articles",
      categoryLabel: { en: "Articles & Content", tr: "Makaleler & İçerikler" },
      icon: FileText,
      items: articles.slice(0, 3).map(a => ({ ...a, highlightedTitle: highlight(a.title) })),
    })
  }

  // Supplements
  const supplements = SUPPLEMENTS_DB.filter(matchItem)
  if (supplements.length > 0) {
    results.push({
      category: "supplements",
      categoryLabel: { en: "Supplements & Herbs", tr: "Takviye & Bitkiler" },
      icon: Leaf,
      items: supplements.slice(0, 4).map(s => ({ ...s, highlightedTitle: highlight(s.title) })),
    })
  }

  // Tools
  const tools = ALL_TOOLS.filter(matchItem)
  if (tools.length > 0) {
    results.push({
      category: "tools",
      categoryLabel: { en: "Health Tools", tr: "Sağlık Araçları" },
      icon: Sparkles,
      items: tools.slice(0, 4).map(t => ({ ...t, highlightedTitle: highlight(t.title) })),
    })
  }

  return results
}

// ── Component ──

export function CommandPalette() {
  const { lang, setLang } = useLang()
  const router = useRouter()
  const { isAuthenticated, signOut } = useAuth()
  const { toggleTheme } = useTheme()
  const effectivePremium = useEffectivePremium()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchMethod, setSearchMethod] = useState<"local" | "ai">("local")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(timer)
  }, [query])

  // Local search (instant) — registry visibility (auth/premium) filtered in
  const paletteCtx = useMemo(
    () => ({ isAuthenticated, isPremium: effectivePremium.isPremium }),
    [isAuthenticated, effectivePremium.isPremium],
  )
  const localResults = useMemo(
    () => performSearch(debouncedQuery, lang, paletteCtx),
    [debouncedQuery, lang, paletteCtx],
  )

  // Semantic search (API, debounced)
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setSemanticResults([])
      setSearchMethod("local")
      return
    }
    let cancelled = false
    const fetchSemantic = async () => {
      setIsSearching(true)
      try {
        const res = await fetch("/api/semantic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: debouncedQuery, limit: 6 }),
        })
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled) return
        if (data.results?.length > 0) {
          // Convert API results to SearchResult format
          const grouped: Record<string, (SearchItem & { highlightedTitle: string })[]> = {}
          interface SemanticResult {
            contentId: string
            contentType: string
            title: string
            titleTr?: string
            description?: string
            descriptionTr?: string
            href: string
            similarity: number
            metadata?: { dosage?: string; evidence?: string }
          }
          data.results.forEach((r: SemanticResult) => {
            const type = r.contentType === "doctor" ? "doctors" : r.contentType === "article" ? "articles" : r.contentType === "supplement" || r.contentType === "herb" ? "supplements" : "tools"
            if (!grouped[type]) grouped[type] = []
            grouped[type].push({
              id: `ai-${r.contentId}`,
              type: r.contentType as SearchItem["type"],
              title: lang === "tr" && r.titleTr ? r.titleTr : r.title,
              subtitle: lang === "tr" && r.descriptionTr ? r.descriptionTr : r.description || "",
              href: r.href,
              meta: r.metadata?.dosage || r.metadata?.evidence ? `${r.metadata.evidence || ""} · ${r.metadata.dosage || ""}` : `${Math.round(r.similarity * 100)}% match`,
              highlightedTitle: lang === "tr" && r.titleTr ? r.titleTr : r.title,
              image: r.contentType === "doctor" ? r.title.split(" ").map((w: string) => w[0]).slice(0, 2).join("") : undefined,
            })
          })
          const categoryIcons: Record<string, LucideIcon> = { doctors: Stethoscope, articles: FileText, supplements: Leaf, tools: Sparkles, conditions: Brain }
          const categoryLabels: Record<string, { en: string; tr: string }> = {
            doctors: { en: "Expert Doctors", tr: "Uzman Doktorlar" },
            articles: { en: "Articles & Content", tr: "Makaleler & İçerikler" },
            supplements: { en: "Supplements & Herbs", tr: "Takviye & Bitkiler" },
            tools: { en: "Health Tools", tr: "Sağlık Araçları" },
            conditions: { en: "Conditions", tr: "Durumlar" },
          }
          const aiResults: SearchResult[] = Object.entries(grouped).map(([cat, items]) => ({
            category: cat,
            categoryLabel: categoryLabels[cat] || { en: cat, tr: cat },
            icon: categoryIcons[cat] || Sparkles,
            items,
            isAiMatch: true,
          }))
          setSemanticResults(aiResults)
          setSearchMethod(data.method === "vector" ? "ai" : "local")
        }
      } catch { /* silent fail, local results still work */ }
      if (!cancelled) setIsSearching(false)
    }
    fetchSemantic()
    return () => { cancelled = true }
  }, [debouncedQuery, lang])

  // Merge results: semantic first (if available), then local
  const results = semanticResults.length > 0 ? semanticResults : localResults
  const flatItems = useMemo(() => results.flatMap(r => r.items), [results])

  // Cmd+K / Ctrl+K to open + custom event from trigger button
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    const customHandler = () => setOpen(true)
    window.addEventListener("keydown", handler)
    window.addEventListener("open-command-palette", customHandler)
    return () => {
      window.removeEventListener("keydown", handler)
      window.removeEventListener("open-command-palette", customHandler)
    }
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  // Keyboard navigation — Session 41 F-S-001 + F-S-003:
  // Tab / Shift+Tab mirror ArrowDown / ArrowUp (Spotlight / Raycast / VSCode
  // muscle memory). Selection auto-scrolls into view via the effect below.
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const forward = e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)
    const backward = e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)
    if (forward) {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1))
    } else if (backward) {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && flatItems[selectedIndex]) {
      e.preventDefault()
      selectItem(flatItems[selectedIndex])
    }
  }, [flatItems, selectedIndex])

  // Session 41 F-S-001: scroll the selected item into view on Arrow/Tab nav
  // so keyboard users can see where the focus ring is sitting even when the
  // 60vh results pane overflows.
  useEffect(() => {
    if (!open) return
    const selected = document.querySelector<HTMLElement>(
      "[data-palette-item][data-palette-selected='true']",
    )
    selected?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex, open])

  // Session 39/40: dispatch either action OR navigation based on entry shape.
  const selectItem = useCallback((item: SearchItem) => {
    setOpen(false)
    if (item.action === "signout") {
      void signOut()
      return
    }
    if (item.action === "toggle-language") {
      setLang(lang === "tr" ? "en" : "tr")
      return
    }
    if (item.action === "toggle-theme") {
      toggleTheme()
      return
    }
    if (item.href) router.push(item.href)
  }, [router, signOut, setLang, lang, toggleTheme])

  // Backward-compat: legacy quick-access buttons still call navigate(href).
  const navigate = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  // Reset selection when results change
  useEffect(() => { setSelectedIndex(0) }, [results])

  const t = {
    placeholder: tx("cmdPalette.placeholder", lang),
    shortcut: tx("cmdPalette.or", lang),
    no_results: tx("cmdPalette.noResults", lang),
    try_different: tx("cmdPalette.tryDifferent", lang),
    quick: tx("cmdPalette.quickAccess", lang),
    navigate: tx("cmdPalette.navigate", lang),
    select: tx("cmdPalette.select", lang),
    close: tx("cmdPalette.close", lang),
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div ref={overlayRef} className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)} />

      {/* Modal */}
      <div className="relative mx-auto mt-[12vh] w-[95%] max-w-2xl animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200">
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            {isSearching && (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
            {query && (
              <button onClick={() => setQuery("")} className="p-1 rounded hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {debouncedQuery.length >= 2 ? (
              results.length > 0 ? (
                <div className="py-2">
                  {results.filter(Boolean).map(group => {
                    const GroupIcon = group.icon || Sparkles
                    return (
                      <div key={group.category}>
                        {/* Category Header */}
                        <div className="flex items-center gap-2 px-4 py-2">
                          <GroupIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {group.categoryLabel[lang as "en" | "tr"]}
                          </span>
                          {group.isAiMatch && (
                            <Badge className="text-[9px] bg-violet-500/10 text-violet-600 border-violet-500/30 gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />AI
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[9px] ml-auto">{group.items.length}</Badge>
                        </div>

                        {/* Items */}
                        {group.items.map((item, idx) => {
                          const globalIdx = flatItems.indexOf(item)
                          const isSelected = globalIdx === selectedIndex
                          return (
                            <button key={item.id} onClick={() => selectItem(item)}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              data-palette-item=""
                              data-palette-selected={isSelected ? "true" : "false"}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/50"}`}>

                              {/* Avatar/Icon */}
                              {item.type === "doctor" ? (
                                // Session 42 F-S-009: 9×9 avatar with text-xs
                                // clipped 2-letter initials on small screens.
                                // Drop one step (text-[10px]) on mobile so the
                                // initials fit; sm: returns to text-xs.
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary shrink-0 tracking-tight">
                                  {item.image}
                                </div>
                              ) : item.type === "supplement" ? (
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                  <Leaf className="w-4 h-4 text-emerald-600" />
                                </div>
                              ) : item.type === "article" ? (
                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                              ) : item.type === "page" ? (
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                                </div>
                              ) : item.type === "legal" ? (
                                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                  <Shield className="w-4 h-4 text-amber-600" />
                                </div>
                              ) : item.type === "action" ? (
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                  <Zap className="w-4 h-4 text-emerald-600" />
                                </div>
                              ) : item.type === "setting" ? (
                                <div className="w-9 h-9 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0">
                                  <SettingsIcon className="w-4 h-4 text-slate-600" />
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                  <Sparkles className="w-4 h-4 text-violet-600" />
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate"
                                  dangerouslySetInnerHTML={{ __html: item.highlightedTitle }} />
                                {item.subtitle && (
                                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                                )}
                              </div>

                              {/* Meta */}
                              {item.meta && (
                                <span className="text-[11px] text-muted-foreground shrink-0">{item.meta}</span>
                              )}

                              {/* Arrow */}
                              {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t.no_results}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{t.try_different}</p>
                </div>
              )
            ) : (
              /* Quick Access (empty state) */
              <div className="py-3">
                <div className="flex items-center gap-2 px-4 py-2">
                  <Star className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t.quick}</span>
                </div>
                {[
                  { label: tx("cmdPalette.healthAssistant", lang), href: "/health-assistant", icon: "💬" },
                  { label: tx("cmdPalette.interactionChecker", lang), href: "/interaction-checker", icon: "⚕️" },
                  { label: tx("cmdPalette.bloodTest", lang), href: "/blood-test", icon: "🩸" },
                  { label: tx("cmdPalette.clinicalTests", lang), href: "/clinical-tests", icon: "📋" },
                  { label: tx("cmdPalette.allTools", lang), href: "/tools", icon: "🔧" },
                ].map(item => (
                  <button key={item.href} onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/50 transition-colors">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer with keyboard hints */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5">↑↓</kbd> {t.navigate}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5"><CornerDownLeft className="w-2.5 h-2.5 inline" /></kbd> {t.select}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5">ESC</kbd> {t.close}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">doctopal.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Trigger Button (for header) ──
export function CommandPaletteTrigger({ onClick }: { onClick?: () => void }) {
  const { lang } = useLang()
  return (
    <button onClick={() => { onClick?.(); window.dispatchEvent(new Event("open-command-palette")) }}
      className="hidden lg:flex items-center gap-2 h-8 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
      title="Cmd+K">
      <Search className="w-3.5 h-3.5" />
      <span className="text-xs">{tx("cmdPalette.search", lang)}</span>
      <kbd className="ml-2 flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">
        <Command className="w-2.5 h-2.5" />K
      </kbd>
    </button>
  )
}
