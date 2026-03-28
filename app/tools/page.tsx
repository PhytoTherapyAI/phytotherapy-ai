"use client"

import { useState, useMemo } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { TOOL_CATEGORIES, searchModules, TOTAL_MODULE_COUNT } from "@/lib/tools-hierarchy"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Search, Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  HeartPulse, Users, BarChart3, ShieldCheck, Stethoscope, MessageCircle,
  ChevronRight, Sparkles, ArrowRight,
} from "lucide-react"

// Icon mapping from string to component
const ICON_MAP: Record<string, any> = {
  Microscope, Pill, Leaf, Brain, UtensilsCrossed, Moon, Dumbbell,
  HeartPulse, Users, BarChart3, ShieldCheck, Stethoscope, MessageCircle,
}

export default function ToolsHubPage() {
  const { lang } = useLang()
  const [search, setSearch] = useState("")

  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return null
    return searchModules(search)
  }, [search])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {lang === "tr" ? "Sağlık Araçları" : "Health Tools"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            {lang === "tr"
              ? `${TOOL_CATEGORIES.length} kategori, ${TOTAL_MODULE_COUNT}+ araç — ihtiyacınız olan her şey tek panoda`
              : `${TOOL_CATEGORIES.length} categories, ${TOTAL_MODULE_COUNT}+ tools — everything you need in one hub`}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            className="pl-11 h-12 text-base rounded-xl"
            placeholder={lang === "tr" ? "Araç ara... (ör: migren, uyku, ilaç)" : "Search tools... (e.g. migraine, sleep, drug)"}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="p-3 divide-y divide-border">
              {searchResults.slice(0, 8).map(result => (
                <Link key={result.href} href={result.href}
                  className="flex items-center justify-between py-2.5 px-2 rounded hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{result.title[lang]}</p>
                    <p className="text-xs text-muted-foreground">{result.categoryTitle[lang]}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
              {searchResults.length > 8 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{searchResults.length - 8} {lang === "tr" ? "daha" : "more"}
                </p>
              )}
            </Card>
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <p className="text-center text-muted-foreground mb-8">
            {lang === "tr" ? "Sonuç bulunamadı" : "No results found"}
          </p>
        )}

        {/* Category Grid */}
        {!searchResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TOOL_CATEGORIES.map(cat => {
              const Icon = ICON_MAP[cat.icon] || Sparkles
              return (
                <Card key={cat.id}
                  className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ borderTopColor: cat.color, borderTopWidth: "3px" }}
                >
                  <Link href={`/${cat.slug}`} className="block p-5">
                    {/* Icon + Count */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl ${cat.bgLight} ${cat.bgDark} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {cat.modules.length} {lang === "tr" ? "araç" : "tools"}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {cat.title[lang]}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {cat.description[lang]}
                    </p>

                    {/* Module preview (first 4) */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {cat.modules.slice(0, 4).map(mod => (
                        <span key={mod.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {mod.title[lang]}
                        </span>
                      ))}
                      {cat.modules.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          +{cat.modules.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-end mt-3">
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}

        {/* Stats footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
            <span>{TOOL_CATEGORIES.length} {lang === "tr" ? "kategori" : "categories"}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{TOTAL_MODULE_COUNT} {lang === "tr" ? "araç" : "tools"}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{lang === "tr" ? "Sürekli güncelleniyor" : "Continuously updated"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
