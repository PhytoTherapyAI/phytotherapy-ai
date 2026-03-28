"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import { useLang } from "@/components/layout/language-toggle"
import { TOOL_CATEGORIES, searchModules, TOTAL_MODULE_COUNT, type ToolCategory } from "@/lib/tools-hierarchy"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search, Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  HeartPulse, Users, BarChart3, ShieldCheck, Stethoscope, MessageCircle,
  ChevronRight, Sparkles, X, ArrowRight,
} from "lucide-react"

const ICON_MAP: Record<string, any> = {
  Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  HeartPulse, Users, BarChart3, ShieldCheck, Stethoscope, MessageCircle,
}

interface MegaMenuProps {
  open: boolean
  onClose: () => void
}

export function MegaMenu({ open, onClose }: MegaMenuProps) {
  const { lang } = useLang()
  const [search, setSearch] = useState("")
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return null
    return searchModules(search)
  }, [search])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    if (open) setTimeout(() => document.addEventListener("mousedown", handler), 0)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-x-0 top-[64px] z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
      <div ref={panelRef} className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 pr-10 h-10 rounded-lg"
            placeholder={lang === "tr" ? "Araç ara..." : "Search tools..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchResults ? (
          <div className="divide-y divide-border max-h-[50vh] overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {lang === "tr" ? "Sonuç bulunamadı" : "No results found"}
              </p>
            ) : (
              searchResults.slice(0, 12).map(result => (
                <Link key={result.href} href={result.href} onClick={onClose}
                  className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded transition-colors">
                  <div>
                    <p className="text-sm font-medium">{result.title[lang]}</p>
                    <p className="text-xs text-muted-foreground">{result.categoryTitle[lang]}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
              {TOOL_CATEGORIES.map(cat => {
                const Icon = ICON_MAP[cat.icon] || Sparkles
                const isHovered = hoveredCategory === cat.id
                return (
                  <div key={cat.id} className="relative"
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}>
                    <Link href={cat.modules[0]?.href || `/${cat.slug}`} onClick={onClose}
                      className={`block p-3 rounded-lg border transition-all ${isHovered ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${cat.bgLight} ${cat.bgDark} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" style={{ color: cat.color }} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{cat.title[lang]}</h4>
                          <p className="text-[10px] text-muted-foreground">{cat.modules.length} {lang === "tr" ? "araç" : "tools"}</p>
                        </div>
                      </div>
                    </Link>

                    {/* Hover popover with modules */}
                    {isHovered && (
                      <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-card border border-border rounded-lg shadow-lg p-2 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => setHoveredCategory(cat.id)}
                        onMouseLeave={() => setHoveredCategory(null)}>
                        <div className="max-h-[240px] overflow-y-auto">
                          {cat.modules.map(mod => (
                            <Link key={mod.id} href={mod.href} onClick={onClose}
                              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 text-sm transition-colors">
                              <span className="text-foreground truncate">{mod.title[lang]}</span>
                              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {TOTAL_MODULE_COUNT} {lang === "tr" ? "araç" : "tools"} · {TOOL_CATEGORIES.length} {lang === "tr" ? "kategori" : "categories"}
              </span>
              <Link href="/tools" onClick={onClose}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                {lang === "tr" ? "Tüm Araçlar" : "All Tools"} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
