// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { TOOL_CATEGORIES, searchModules } from "@/lib/tools-hierarchy"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search, ChevronDown, ChevronUp, Microscope, Pill, Leaf, Brain,
  UtensilsCrossed, Moon, Dumbbell, HeartPulse, Users, BarChart3,
  ShieldCheck, Stethoscope, MessageCircle, Sparkles, ChevronRight, X,
} from "lucide-react"

const ICON_MAP: Record<string, any> = {
  Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  HeartPulse, Users, BarChart3, ShieldCheck, Stethoscope, MessageCircle,
}

interface MobileMegaMenuProps {
  onNavigate: () => void
}

export function MobileMegaMenu({ onNavigate }: MobileMegaMenuProps) {
  const { lang } = useLang()
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return null
    return searchModules(search)
  }, [search])

  return (
    <div className="py-2">
      {/* Search */}
      <div className="relative px-3 mb-3">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 pr-9 h-9 rounded-lg text-sm"
          placeholder={tx("mobileMega.searchPlaceholder", lang)}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-6 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {searchResults ? (
        <div className="px-3">
          {searchResults.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3 text-center">
              {tx("mobileMega.noResults", lang)}
            </p>
          ) : (
            searchResults.slice(0, 10).map(result => (
              <Link key={result.href} href={result.href} onClick={onNavigate}
                className="flex items-center justify-between py-2.5 px-2 rounded-md hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{result.title[lang]}</p>
                  <p className="text-[11px] text-muted-foreground">{result.categoryTitle[lang]}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      ) : (
        /* Accordion Categories */
        <div className="space-y-0.5">
          {TOOL_CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.icon] || Sparkles
            const isExpanded = expanded === cat.id
            return (
              <div key={cat.id}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isExpanded ? "bg-muted/50" : "hover:bg-muted/30"}`}
                >
                  <div className={`w-8 h-8 rounded-lg ${cat.bgLight} ${cat.bgDark} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium">{cat.title[lang]}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] mr-1">{cat.modules.length}</Badge>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="bg-muted/20 py-1 px-4 pl-[60px]">
                    {cat.modules.map(mod => (
                      <Link key={mod.id} href={mod.href} onClick={onNavigate}
                        className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors">
                        <span className="text-sm text-foreground">{mod.title[lang]}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* All Tools link */}
      <div className="px-4 pt-3 mt-2 border-t border-border">
        <Link href="/tools" onClick={onNavigate}
          className="block text-center text-sm font-medium text-primary py-2">
          {tx("mobileMega.viewAll", lang)}
        </Link>
      </div>
    </div>
  )
}
