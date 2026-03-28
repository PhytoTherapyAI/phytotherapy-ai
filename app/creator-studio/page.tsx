"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VideoUrlInput } from "@/components/content/VideoUrlInput"
import { type ParsedVideo } from "@/lib/video-utils"
import {
  PRICING_PLANS, CONTENT_CATEGORIES, CREDIT_COSTS, MOCK_CONTENT,
  type ContentType, type SubscriptionTier, type PricingPlan,
} from "@/lib/publisher-data"
import {
  PenTool, Video, FileText, Crown, Zap, Check, Lock, Eye, Heart,
  Bookmark, ChevronRight, Plus, Send, ArrowLeft, BarChart3, Star,
  Leaf, Apple, Brain, Activity, Pill, Baby, Dumbbell, Sparkles, BookOpen,
  Image as ImageIcon, Link2, Tag, Globe, Bold, Italic, List, Heading,
  Quote, Code,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, any> = { Leaf, Apple, Brain, Activity, Pill, Heart: Heart, Baby, Dumbbell, Sparkles, BookOpen }

type View = "dashboard" | "editor" | "pricing" | "analytics"

export default function CreatorStudioPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [view, setView] = useState<View>("dashboard")
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [credits, setCredits] = useState(0)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  // Editor state
  const [editorType, setEditorType] = useState<ContentType>("article")
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [body, setBody] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [coverImage, setCoverImage] = useState("")

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Creator Studio", tr: "İçerik Stüdyosu" },
      subtitle: { en: "Write articles, upload videos, share your expertise", tr: "Makale yaz, video yükle, uzmanlığını paylaş" },
      dashboard: { en: "My Content", tr: "İçeriklerim" },
      new_content: { en: "New Content", tr: "Yeni İçerik" },
      pricing: { en: "Plans & Credits", tr: "Planlar & Krediler" },
      analytics: { en: "Analytics", tr: "Analitik" },
      credits_remaining: { en: "Credits Remaining", tr: "Kalan Kredi" },
      article: { en: "Article", tr: "Makale" },
      video: { en: "Video", tr: "Video" },
      case_study: { en: "Case Study", tr: "Vaka Çalışması" },
      publish: { en: "Submit for Review", tr: "İncelemeye Gönder" },
      save_draft: { en: "Save Draft", tr: "Taslak Kaydet" },
      title_ph: { en: "Article title...", tr: "Makale başlığı..." },
      summary_ph: { en: "Brief summary (max 160 chars)...", tr: "Kısa özet (maks 160 karakter)..." },
      body_ph: { en: "Write your content here...", tr: "İçeriğinizi buraya yazın..." },
      video_url: { en: "YouTube or Vimeo URL", tr: "YouTube veya Vimeo URL" },
      category: { en: "Category", tr: "Kategori" },
      tags_label: { en: "Tags", tr: "Etiketler" },
      cover_image: { en: "Cover Image URL", tr: "Kapak Görseli URL" },
      upgrade: { en: "Upgrade to Publish", tr: "Yayınlamak İçin Yükselt" },
      no_credits: { en: "You need credits to publish content. Choose a plan below.", tr: "İçerik yayınlamak için krediye ihtiyacınız var. Aşağıdan bir plan seçin." },
      per_month: { en: "/month", tr: "/ay" },
      per_year: { en: "/year", tr: "/yıl" },
      select_plan: { en: "Select Plan", tr: "Planı Seç" },
      current: { en: "Current Plan", tr: "Mevcut Plan" },
      monthly: { en: "Monthly", tr: "Aylık" },
      yearly: { en: "Yearly", tr: "Yıllık" },
      save_pct: { en: "Save ~25%", tr: "~%25 Tasarruf" },
      cost: { en: "credit", tr: "kredi" },
      empty: { en: "No content yet. Start creating!", tr: "Henüz içerik yok. Oluşturmaya başla!" },
      views: { en: "views", tr: "görüntülenme" },
      published: { en: "Published", tr: "Yayında" },
      draft: { en: "Draft", tr: "Taslak" },
      pending: { en: "Under Review", tr: "İnceleniyor" },
    }
    return map[key]?.[lang] || key
  }

  const addTag = () => {
    if (tagInput && tags.length < 5 && !tags.includes(tagInput.toLowerCase())) {
      setTags([...tags, tagInput.toLowerCase()])
      setTagInput("")
    }
  }

  const creditCost = CREDIT_COSTS[editorType]
  const canPublish = tier !== "free" && credits >= creditCost

  // ── Pricing View ──
  if (view === "pricing") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          <button onClick={() => setView("dashboard")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />{t("dashboard")}
          </button>
          <div className="text-center mb-8">
            <Crown className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold">{t("pricing")}</h1>
            {/* Billing toggle */}
            <div className="inline-flex items-center gap-2 mt-4 bg-muted rounded-full p-1">
              <button onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${billingCycle === "monthly" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>
                {t("monthly")}
              </button>
              <button onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${billingCycle === "yearly" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>
                {t("yearly")} <Badge className="ml-1 text-[10px] bg-green-500/10 text-green-600">{t("save_pct")}</Badge>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING_PLANS.map(plan => {
              const price = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly
              const isCurrentPlan = plan.id === tier
              return (
                <Card key={plan.id} className={`p-5 relative ${plan.highlighted ? "border-primary shadow-lg ring-1 ring-primary/20" : ""}`}>
                  {plan.badge && (
                    <Badge className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px]">
                      {plan.badge[lang as "en" | "tr"]}
                    </Badge>
                  )}
                  <h3 className="font-bold text-lg">{plan.name[lang as "en" | "tr"]}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description[lang as "en" | "tr"]}</p>
                  <div className="mt-4 mb-4">
                    <span className="text-3xl font-bold">₺{price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">{billingCycle === "monthly" ? t("per_month") : t("per_year")}</span>
                  </div>
                  {plan.credits > 0 && (
                    <Badge variant="outline" className="mb-4">{plan.credits} {t("credits_remaining")}{t("per_month")}</Badge>
                  )}
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{f[lang as "en" | "tr"]}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} disabled={isCurrentPlan}
                    onClick={() => { setTier(plan.id); setCredits(plan.credits); setView("dashboard") }}>
                    {isCurrentPlan ? t("current") : t("select_plan")}
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Editor View ──
  if (view === "editor") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          <button onClick={() => setView("dashboard")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />{t("dashboard")}
          </button>

          {/* Paywall check */}
          {!canPublish && (
            <Card className="p-6 mb-6 border-amber-500/30 bg-amber-500/5 text-center">
              <Lock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">{t("upgrade")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("no_credits")}</p>
              <Button onClick={() => setView("pricing")}><Crown className="w-4 h-4 mr-2" />{t("pricing")}</Button>
            </Card>
          )}

          {/* Content type selector */}
          <div className="flex gap-3 mb-6">
            {(["article", "video", "case_study"] as ContentType[]).map(type => (
              <button key={type} onClick={() => setEditorType(type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${editorType === type ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/30"}`}>
                {type === "article" ? <PenTool className="w-4 h-4" /> : type === "video" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {t(type)}
                <Badge variant="outline" className="text-[10px]">{CREDIT_COSTS[type]} {t("cost")}</Badge>
              </button>
            ))}
          </div>

          {/* Editor form */}
          <div className="space-y-5">
            {/* Title */}
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("title_ph")}
              className="h-14 text-xl font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary" />

            {/* Summary */}
            <div>
              <Textarea value={summary} onChange={e => setSummary(e.target.value.slice(0, 160))} placeholder={t("summary_ph")} rows={2} />
              <p className="text-xs text-muted-foreground text-right mt-1">{summary.length}/160</p>
            </div>

            {/* Smart Video URL Input with Live Preview */}
            {editorType === "video" && (
              <VideoUrlInput
                value={videoUrl}
                onChange={(url, parsed) => setVideoUrl(url)}
                lang={lang}
              />
            )}

            {/* Cover image */}
            <div>
              <label className="text-sm font-medium mb-1 block">{t("cover_image")}</label>
              <div className="flex gap-2">
                <ImageIcon className="w-5 h-5 text-muted-foreground mt-2.5" />
                <Input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." className="flex-1" />
              </div>
            </div>

            {/* Rich text toolbar */}
            <div className="flex items-center gap-1 border rounded-lg p-1.5 bg-muted/30">
              {[
                { icon: Bold, label: "Bold" }, { icon: Italic, label: "Italic" },
                { icon: Heading, label: "Heading" }, { icon: List, label: "List" },
                { icon: Quote, label: "Quote" }, { icon: Code, label: "Code" },
                { icon: Link2, label: "Link" }, { icon: ImageIcon, label: "Image" },
              ].map(btn => (
                <button key={btn.label} className="p-2 rounded hover:bg-muted transition-colors" title={btn.label}>
                  <btn.icon className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Body */}
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder={t("body_ph")}
              rows={16} className="min-h-[300px] text-base leading-relaxed font-serif" />

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("category")}</label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_CATEGORIES.map(cat => {
                  const Icon = CATEGORY_ICONS[cat.icon] || Sparkles
                  return (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"}`}>
                      <Icon className="w-3.5 h-3.5" />{cat.label[lang as "en" | "tr"]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("tags_label")}</label>
              <div className="flex gap-2 items-center flex-wrap">
                {tags.map(tag => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    #{tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
                  </Badge>
                ))}
                {tags.length < 5 && (
                  <div className="flex gap-1">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add tag..." className="h-8 w-32 text-xs" />
                    <Button variant="ghost" size="sm" onClick={addTag} className="h-8"><Tag className="w-3 h-3" /></Button>
                  </div>
                )}
              </div>
            </div>

            {/* Language */}
            <div className="flex gap-2">
              <Globe className="w-4 h-4 text-muted-foreground mt-1" />
              <Badge variant="outline">{lang === "tr" ? "Türkçe" : "English"}</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setView("dashboard")}>
              {t("save_draft")}
            </Button>
            <Button className="flex-1" disabled={!canPublish || !title || !body || !selectedCategory}
              onClick={() => { setCredits(c => c - creditCost); setView("dashboard") }}>
              <Send className="w-4 h-4 mr-2" />{t("publish")} ({creditCost} {t("cost")})
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Dashboard View (default) ──
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <PenTool className="w-6 h-6 text-primary" />{t("title")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("credits_remaining")}</p>
              <p className="text-lg font-bold text-primary">{credits}</p>
            </div>
            <Badge variant="outline" className="capitalize">{tier}</Badge>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 mb-8">
          <Button onClick={() => setView("editor")} className="gap-2"><Plus className="w-4 h-4" />{t("new_content")}</Button>
          <Button variant="outline" onClick={() => setView("pricing")} className="gap-2"><Crown className="w-4 h-4" />{t("pricing")}</Button>
          <Button variant="outline" onClick={() => setView("analytics")} className="gap-2"><BarChart3 className="w-4 h-4" />{t("analytics")}</Button>
        </div>

        {/* Content list */}
        {MOCK_CONTENT.length > 0 ? (
          <div className="space-y-4">
            {MOCK_CONTENT.map(content => (
              <Card key={content.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${content.type === "video" ? "bg-red-500/10" : "bg-primary/10"}`}>
                    {content.type === "video" ? <Video className="w-5 h-5 text-red-500" /> : <FileText className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{content.title}</h3>
                      <Badge className={`text-[10px] ${content.status === "published" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {content.status === "published" ? t("published") : content.status === "draft" ? t("draft") : t("pending")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{content.summary}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{content.viewCount?.toLocaleString()} {t("views")}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{content.likeCount}</span>
                      <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{content.bookmarkCount}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <PenTool className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("empty")}</p>
            <Button className="mt-4" onClick={() => setView("editor")}><Plus className="w-4 h-4 mr-2" />{t("new_content")}</Button>
          </Card>
        )}
      </div>
    </div>
  )
}
