"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MOCK_CONTENT, CONTENT_CATEGORIES } from "@/lib/publisher-data"
import {
  Search, Eye, Heart, Bookmark, Clock, BadgeCheck, Video, FileText,
  MessageCircle, Share2, ChevronRight, Filter, Leaf, Apple, Brain,
  Activity, Pill, Baby, Dumbbell, Sparkles, BookOpen,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, any> = { Leaf, Apple, Brain, Activity, Pill, Heart: Heart, Baby, Dumbbell, Sparkles, BookOpen }

// Mock author data
const AUTHORS: Record<string, { name: string; title: string; specialty: string; verified: boolean; avatar: string }> = {
  "1": { name: "Prof. Dr. Ayşe Kara", title: "Prof.Dr.", specialty: "Endocrinology", verified: true, avatar: "AK" },
  "2": { name: "Ecz. Mehmet Demir", title: "Ecz.", specialty: "Clinical Pharmacy", verified: true, avatar: "MD" },
}

export default function ExpertContentPage() {
  const { lang } = useLang()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState<"all" | "article" | "video">("all")

  const filtered = MOCK_CONTENT.filter(c => {
    if (c.status !== "published") return false
    if (selectedCategory !== "all" && c.category !== selectedCategory) return false
    if (selectedType !== "all" && c.type !== selectedType) return false
    if (search) {
      const q = search.toLowerCase()
      return c.title?.toLowerCase().includes(q) || c.tags?.some(t => t.includes(q))
    }
    return true
  })

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Expert Content", tr: "Uzman İçerikleri" },
      subtitle: { en: "Articles and videos by verified health professionals", tr: "Onaylı sağlık profesyonellerinden makale ve videolar" },
      all: { en: "All", tr: "Tümü" },
      articles: { en: "Articles", tr: "Makaleler" },
      videos: { en: "Videos", tr: "Videolar" },
      search_ph: { en: "Search articles, topics...", tr: "Makale, konu ara..." },
      read_more: { en: "Read More", tr: "Devamını Oku" },
      watch: { en: "Watch", tr: "İzle" },
      verified: { en: "Verified Expert", tr: "Onaylı Uzman" },
      expert_content: { en: "Expert Content", tr: "Uzman İçeriği" },
      contact: { en: "Contact", tr: "İletişim" },
      views: { en: "views", tr: "görüntülenme" },
      min_read: { en: "min read", tr: "dk okuma" },
      no_content: { en: "No content found for this filter.", tr: "Bu filtre için içerik bulunamadı." },
    }
    return map[key]?.[lang] || key
  }

  const formatDate = (date?: string) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Search + filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 h-11 rounded-xl" placeholder={t("search_ph")} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button size="sm" variant={selectedType === "all" ? "default" : "outline"} onClick={() => setSelectedType("all")}>{t("all")}</Button>
            <Button size="sm" variant={selectedType === "article" ? "default" : "outline"} onClick={() => setSelectedType("article")}>
              <FileText className="w-3.5 h-3.5 mr-1" />{t("articles")}
            </Button>
            <Button size="sm" variant={selectedType === "video" ? "default" : "outline"} onClick={() => setSelectedType("video")}>
              <Video className="w-3.5 h-3.5 mr-1" />{t("videos")}
            </Button>
            <span className="w-px bg-border mx-1" />
            {CONTENT_CATEGORIES.slice(0, 5).map(cat => (
              <Button key={cat.id} size="sm" variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? "all" : cat.id)} className="whitespace-nowrap">
                {cat.label[lang as "en" | "tr"]}
              </Button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("no_content")}</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {filtered.map(content => {
              const author = AUTHORS[content.authorId || "1"]
              const isVideo = content.type === "video"
              const readTime = Math.ceil((content.summary?.length || 100) / 20)
              return (
                <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  {/* Video thumbnail placeholder */}
                  {isVideo && (
                    <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                      {content.videoDuration && (
                        <Badge className="absolute bottom-3 right-3 bg-black/70 text-white text-xs">
                          {Math.floor(content.videoDuration / 60)}:{String(content.videoDuration % 60).padStart(2, "0")}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    {/* Expert Content badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] gap-1">
                        <Sparkles className="w-3 h-3" />{t("expert_content")}
                      </Badge>
                      {content.isSponsored && (
                        <Badge variant="outline" className="text-[10px]">Sponsored</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {content.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{content.summary}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {content.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
                      ))}
                    </div>

                    {/* Author card */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {author?.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{author?.name}</span>
                            {author?.verified && (
                              <BadgeCheck className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{author?.specialty}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <MessageCircle className="w-3 h-3" />{t("contact")}
                      </Button>
                    </div>

                    {/* Engagement stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{content.viewCount?.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{content.likeCount}</span>
                      <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{content.bookmarkCount}</span>
                      {!isVideo && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} {t("min_read")}</span>}
                      <span className="ml-auto">{formatDate(content.publishedAt)}</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
