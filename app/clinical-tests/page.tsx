// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { CLINICAL_TESTS, TEST_CATEGORIES } from "@/lib/clinical-tests-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Search, CloudRain, Wind, Zap, Gauge, Moon, Smile, Wine,
  ClipboardList, Clock, ArrowRight, ShieldCheck,
} from "lucide-react"

const ICON_MAP: Record<string, any> = {
  CloudRain, Wind, Zap, Gauge, Moon, Smile, Wine,
}

export default function ClinicalTestsPage() {
  const { lang } = useLang()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filtered = CLINICAL_TESTS.filter(test => {
    const matchesCategory = selectedCategory === "all" || test.category === selectedCategory
    const matchesSearch = !search ||
      test.title.en.toLowerCase().includes(search.toLowerCase()) ||
      test.title.tr.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get past results for each test
  const getLastScore = (testId: string) => {
    try {
      interface HistoryEntry { testId: string; score: number; date: string }
      const history: HistoryEntry[] = JSON.parse(localStorage.getItem("clinical_test_history") || "[]")
      return history.find((h: HistoryEntry) => h.testId === testId)
    } catch { return null }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 mb-4">
            <ClipboardList className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {tx("clinicalTests.title", lang)}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            {tx("clinicalTests.subtitle", lang)}
          </p>
        </div>

        {/* Important notice */}
        <Card className="p-4 mb-8 border-amber-500/30 bg-amber-500/5">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {tx("clinicalTests.screeningDisclaimer", lang)}
            </p>
          </div>
        </Card>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 h-11 rounded-xl"
            placeholder={tx("clinicalTests.searchPlaceholder", lang)}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TEST_CATEGORIES.map(cat => (
            <Button key={cat.id} size="sm" variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)} className="whitespace-nowrap">
              {cat.label[lang as "en" | "tr"]}
            </Button>
          ))}
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(test => {
            const Icon = ICON_MAP[test.icon] || ClipboardList
            const lastResult = getLastScore(test.id)
            return (
              <Link key={test.id} href={`/clinical-tests/${test.id}`}>
                <Card className="h-full p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  style={{ borderTopColor: test.color, borderTopWidth: "3px" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${test.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: test.color }} />
                    </div>
                    {lastResult && (
                      <Badge variant="outline" className="text-[10px]">
                        {tx("clinicalTests.last", lang)}: {lastResult.score}/{test.maxScore}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {test.title[lang as "en" | "tr"]}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {test.description[lang as "en" | "tr"]}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {test.estimatedMinutes} {tx("clinicalTests.min", lang)}
                      </span>
                      <span>{test.questionCount} {tx("clinicalTests.questionShort", lang)}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{tx("clinicalTests.noTestsFound", lang)}</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-4 text-xs text-muted-foreground">
            <span>{CLINICAL_TESTS.length} {tx("clinicalTests.tests", lang)}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{tx("clinicalTests.intlStandards", lang)}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{tx("clinicalTests.free", lang)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
