// © 2026 DoctoPal — All Rights Reserved
// Creator Studio — SaaS Growth Redesign with Dopamine Analytics + Decoy Pricing
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { InnovationShell } from "@/components/innovation/InnovationShell"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VideoUrlInput } from "@/components/content/VideoUrlInput"
import { SeoAssistant } from "@/components/content/SeoAssistant"
import {
  PRICING_PLANS, CONTENT_CATEGORIES, CREDIT_COSTS, MOCK_CONTENT,
  type ContentType, type SubscriptionTier,
} from "@/lib/publisher-data"
import {
  PenTool, Video, FileText, Crown, Check, Lock, Eye, Heart,
  Bookmark, Plus, Send, ArrowLeft, BarChart3, Star,
  Sparkles, BookOpen, Leaf, Apple, Brain, Activity, Pill, Baby, Dumbbell,
  Image as ImageIcon, Link2, Tag, Globe, Bold, Italic, List, Heading,
  Quote, Code, TrendingUp, Flame, Rocket,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts"

const CATEGORY_ICONS: Record<string, any> = { Leaf, Apple, Brain, Activity, Pill, Heart, Baby, Dumbbell, Sparkles, BookOpen }

// Mock analytics data
const ANALYTICS_CHART = [
  { day: "Mon", views: 1200 }, { day: "Tue", views: 1800 }, { day: "Wed", views: 2400 },
  { day: "Thu", views: 1900 }, { day: "Fri", views: 3100 }, { day: "Sat", views: 2800 },
  { day: "Sun", views: 3400 },
]

type View = "dashboard" | "editor" | "pricing" | "analytics"

export default function CreatorStudioPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [view, setView] = useState<View>("dashboard")
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [credits, setCredits] = useState(0)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
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
      article: { en: "Article", tr: "Makale" },
      video: { en: "Video", tr: "Video" },
      case_study: { en: "Case Study", tr: "Vaka Çalışması" },
      publish: { en: "Submit for Review", tr: "İncelemeye Gönder" },
      save_draft: { en: "Save Draft", tr: "Taslak Kaydet" },
      title_ph: { en: "Article title...", tr: "Makale başlığı..." },
      summary_ph: { en: "Brief summary (max 160 chars)...", tr: "Kısa özet (maks 160 karakter)..." },
      body_ph: { en: "Write your content here...", tr: "İçeriğinizi buraya yazın..." },
      category: { en: "Category", tr: "Kategori" },
      tags_label: { en: "Tags", tr: "Etiketler" },
      cover_image: { en: "Cover Image URL", tr: "Kapak Görseli URL" },
      per_month: { en: "/month", tr: "/ay" },
      per_year: { en: "/year", tr: "/yıl" },
      select_plan: { en: "Select Plan", tr: "Planı Seç" },
      current: { en: "Current Plan", tr: "Mevcut Plan" },
      monthly: { en: "Monthly", tr: "Aylık" },
      yearly: { en: "Yearly", tr: "Yıllık" },
      save_pct: { en: "Save ~25%", tr: "~%25 Tasarruf" },
      cost: { en: "credit", tr: "kredi" },
      published: { en: "Published", tr: "Yayında" },
      draft: { en: "Draft", tr: "Taslak" },
      pending: { en: "Under Review", tr: "İnceleniyor" },
      views: { en: "views", tr: "görüntülenme" },
    }
    return map[key]?.[lang] || key
  }

  const addTag = () => {
    if (tagInput && tags.length < 5 && !tags.includes(tagInput.toLowerCase())) {
      setTags([...tags, tagInput.toLowerCase()]); setTagInput("")
    }
  }

  const creditCost = CREDIT_COSTS[editorType]
  const canPublish = tier !== "free" && credits >= creditCost

  // ── Analytics View ──
  if (view === "analytics") {
    return (
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
        <button onClick={() => setView("dashboard")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />{t("dashboard")}
        </button>

        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          {isTr ? "İçerik Analitiği" : "Content Analytics"}
        </h1>

        {/* Dopamine KPI Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { emoji: "👁️", label: isTr ? "Toplam Okunma" : "Total Views", value: "12.4K", trend: "+24%", color: "text-blue-500" },
            { emoji: "🔖", label: isTr ? "Kaydedilme" : "Bookmarks", value: "840", trend: "+18%", color: "text-amber-500" },
            { emoji: "🔥", label: isTr ? "Zirvedeki İçerik" : "Top Content", value: "Berberine vs Metformin", trend: "#1", color: "text-red-500" },
          ].map((kpi, i) => (
            <motion.div key={i} className="rounded-2xl border bg-card p-4 shadow-soft"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <span className="text-lg">{kpi.emoji}</span>
              <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
              <p className="text-xl font-bold mt-0.5">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className={`h-3 w-3 ${kpi.color}`} />
                <span className={`text-[10px] font-bold ${kpi.color}`}>{kpi.trend}</span>
                <span className="text-[9px] text-muted-foreground">{isTr ? "bu hafta" : "this week"}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Area Chart */}
        <div className="rounded-2xl border bg-card p-5 shadow-soft mb-6">
          <h3 className="text-sm font-bold mb-3">{isTr ? "Haftalık Okunma Trendi" : "Weekly View Trend"}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ANALYTICS_CHART}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3c7a52" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3c7a52" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" }} />
              <Area type="monotone" dataKey="views" stroke="#3c7a52" strokeWidth={2} fill="url(#viewsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top content list */}
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{isTr ? "En Çok Okunan" : "Most Read"}</h3>
        <div className="space-y-2">
          {MOCK_CONTENT.filter(c => c.status === "published").map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-soft">
              <span className="text-lg font-bold text-muted-foreground/30 w-6 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{c.viewCount?.toLocaleString()}</span>
                  <span className="flex items-center gap-0.5"><Bookmark className="h-2.5 w-2.5" />{c.bookmarkCount}</span>
                </div>
              </div>
              {i === 0 && <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[9px] shrink-0">🔥 Trend</Badge>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Pricing View (Decoy Effect + Anchoring) ──
  if (view === "pricing") {
    return (
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
        <button onClick={() => setView("dashboard")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />{t("dashboard")}
        </button>
        <div className="text-center mb-8">
          <Crown className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">{t("pricing")}</h1>
          {/* Premium billing toggle */}
          <div className="inline-flex items-center gap-1 mt-4 bg-muted rounded-full p-1">
            <button onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${billingCycle === "monthly" ? "bg-card shadow-md font-medium" : "text-muted-foreground"}`}>
              {t("monthly")}
            </button>
            <button onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${billingCycle === "yearly" ? "bg-card shadow-md font-medium" : "text-muted-foreground"}`}>
              {t("yearly")} <span className="ml-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">{t("save_pct")}</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING_PLANS.map((plan, idx) => {
            const price = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly
            const yearlyMonthly = Math.round(plan.price.yearly / 12)
            const isCurrentPlan = plan.id === tier
            const isPopular = plan.highlighted
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={isPopular ? { scale: 1.08, y: -4 } : { scale: 1.03, y: -2 }}>
              <Card className={`p-5 relative transition-all ${
                isPopular ? "border-primary shadow-xl ring-2 ring-primary/20 scale-105 z-10" : "hover:shadow-soft-lg"
              }`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground shadow-lg">
                    <Star className="h-3 w-3 fill-current" /> {isTr ? "En Popüler" : "Most Popular"}
                  </div>
                )}
                <h3 className="font-bold text-lg mt-1">{plan.name[lang as "en" | "tr"]}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{plan.description[lang as "en" | "tr"]}</p>
                <div className="mt-4 mb-4">
                  {billingCycle === "yearly" && plan.price.monthly > 0 && (
                    <span className="text-sm text-muted-foreground line-through mr-2">₺{plan.price.monthly.toLocaleString()}</span>
                  )}
                  <span className="text-3xl font-bold">₺{billingCycle === "yearly" && plan.price.yearly > 0 ? yearlyMonthly.toLocaleString() : price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{t("per_month")}</span>
                </div>
                <ul className="space-y-1.5 mb-5">
                  {plan.features.map((f, i) => (
                    <motion.li key={i} className="flex items-start gap-1.5 text-xs"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.08 + i * 0.04 }}>
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f[lang as "en" | "tr"]}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button className={`w-full rounded-xl ${isPopular ? "" : ""}`}
                  variant={isPopular ? "default" : "outline"} disabled={isCurrentPlan}
                  onClick={() => { setTier(plan.id); setCredits(plan.credits); setView("dashboard") }}>
                  {isCurrentPlan ? t("current") : t("select_plan")}
                </Button>
                </motion.div>
              </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Editor View ──
  if (view === "editor") {
    return (
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
        <button onClick={() => setView("dashboard")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />{t("dashboard")}
        </button>
        {!canPublish && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-6 text-center dark:border-amber-800 dark:bg-amber-950/20">
            <Lock className="w-7 h-7 text-amber-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">{isTr ? "Yayınlamak İçin Yükselt" : "Upgrade to Publish"}</h3>
            <p className="text-xs text-muted-foreground mb-3">{isTr ? "İçerik yayınlamak için krediye ihtiyacınız var." : "You need credits to publish content."}</p>
            <Button onClick={() => setView("pricing")} className="rounded-xl gap-2"><Crown className="w-4 h-4" />{t("pricing")}</Button>
          </div>
        )}
        <div className="flex gap-3 mb-6">
          {(["article", "video", "case_study"] as ContentType[]).map(type => (
            <button key={type} onClick={() => setEditorType(type)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${editorType === type ? "border-primary bg-primary/5 font-medium" : "hover:border-primary/30"}`}>
              {type === "article" ? <PenTool className="w-4 h-4" /> : type === "video" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {t(type)}
              <Badge variant="outline" className="text-[10px]">{CREDIT_COSTS[type]} {t("cost")}</Badge>
            </button>
          ))}
        </div>
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-5">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("title_ph")}
              className="h-14 text-xl font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary" />
            <div><Textarea value={summary} onChange={e => setSummary(e.target.value.slice(0, 160))} placeholder={t("summary_ph")} rows={2} /><p className="text-xs text-muted-foreground text-right mt-1">{summary.length}/160</p></div>
            {editorType === "video" && <VideoUrlInput value={videoUrl} onChange={(url) => setVideoUrl(url)} lang={lang} />}
            <div><label className="text-sm font-medium mb-1 block">{t("cover_image")}</label><div className="flex gap-2"><ImageIcon className="w-5 h-5 text-muted-foreground mt-2.5" /><Input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." className="flex-1" /></div></div>
            <div className="flex items-center gap-1 border rounded-lg p-1.5 bg-muted/30">
              {[Bold, Italic, Heading, List, Quote, Code, Link2, ImageIcon].map((Icon, i) => (
                <button key={i} className="p-2 rounded hover:bg-muted transition-colors"><Icon className="w-4 h-4 text-muted-foreground" /></button>
              ))}
            </div>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder={t("body_ph")} rows={16} className="min-h-[300px] text-base leading-relaxed font-serif" />
            <div><label className="text-sm font-medium mb-2 block">{t("category")}</label><div className="flex flex-wrap gap-2">
              {CONTENT_CATEGORIES.map(cat => { const Icon = CATEGORY_ICONS[cat.icon] || Sparkles; return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/30"}`}>
                  <Icon className="w-3.5 h-3.5" />{cat.label[lang as "en" | "tr"]}
                </button>)})}</div></div>
            <div><label className="text-sm font-medium mb-2 block">{t("tags_label")}</label><div className="flex gap-2 items-center flex-wrap">
              {tags.map(tag => (<Badge key={tag} variant="outline" className="gap-1">#{tag}<button onClick={() => setTags(tags.filter(t => t !== tag))}>×</button></Badge>))}
              {tags.length < 5 && (<div className="flex gap-1"><Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder={tx("creatorStudio.addTag", lang)} className="h-8 w-32 text-xs" /><Button variant="ghost" size="sm" onClick={addTag} className="h-8"><Tag className="w-3 h-3" /></Button></div>)}
            </div></div>
          </div>
          <div className="hidden lg:block w-72 shrink-0 sticky top-20 self-start">
            <SeoAssistant title={title} summary={summary} body={body} tags={tags} lang={lang} onTitleSuggestion={(s) => setTitle(s)} />
          </div>
        </div>
        <div className="flex gap-3 mt-8 pt-6 border-t">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setView("dashboard")}>{t("save_draft")}</Button>
          <Button className="flex-1 rounded-xl" disabled={!canPublish || !title || !body || !selectedCategory}
            onClick={() => { setCredits(c => c - creditCost); setView("dashboard") }}>
            <Send className="w-4 h-4 mr-2" />{t("publish")}
          </Button>
        </div>
      </div>
    )
  }

  // ── Dashboard View ──
  return (
    <InnovationShell>
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      {/* Header */}
      <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenTool className="w-6 h-6 text-primary" />{t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("subtitle")}</p>
        </div>
        {/* Upgrade capsule (replaces "0 Credits" negative text) */}
        <button onClick={() => setView("pricing")}
          className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/10 animate-[softPulse_3s_ease-in-out_infinite]">
          <Rocket className="h-3.5 w-3.5" />
          {isTr ? "Etkini Büyüt" : "Amplify Your Impact"}
        </button>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b pb-3">
        {([
          { key: "dashboard" as View, icon: FileText, label: t("dashboard") },
          { key: "analytics" as View, icon: BarChart3, label: t("analytics") },
          { key: "pricing" as View, icon: Crown, label: t("pricing") },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              view === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon className="h-3.5 w-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Content list */}
      {MOCK_CONTENT.length > 0 ? (
        <div className="space-y-3">
          {MOCK_CONTENT.map((content, i) => (
            <motion.div key={content.id} className="rounded-2xl border bg-card p-4 shadow-soft transition-all hover:shadow-soft-md"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
              whileHover={{ x: 4 }}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${content.type === "video" ? "bg-red-500/10" : "bg-primary/10"}`}>
                  {content.type === "video" ? <Video className="w-5 h-5 text-red-500" /> : <FileText className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold truncate">{content.title}</h3>
                    <Badge className={`text-[9px] shrink-0 ${content.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {content.status === "published" ? t("published") : content.status === "draft" ? t("draft") : t("pending")}
                    </Badge>
                    {i === 0 && content.status === "published" && (
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[9px] shrink-0">🔥 Trend</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{content.summary}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{content.viewCount?.toLocaleString()} {t("views")}</span>
                    <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{content.likeCount}</span>
                    <span className="flex items-center gap-0.5"><Bookmark className="w-3 h-3" />{content.bookmarkCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-soft">
          <PenTool className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{isTr ? "Henüz içerik yok. Oluşturmaya başla!" : "No content yet. Start creating!"}</p>
        </div>
      )}

      {/* Magic Pen FAB */}
      <motion.button onClick={() => setView("editor")}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.12, rotate: 15 }} whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-700 text-white shadow-lg shadow-primary/30 md:bottom-6">
        <PenTool className="h-5 w-5" />
      </motion.button>

      <style jsx>{`
        @keyframes softPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(60,122,82,0.3); } 50% { box-shadow: 0 0 0 6px rgba(60,122,82,0); } }
      `}</style>
      <p className="mt-8 text-center text-[10px] text-muted-foreground/40">{tx("disclaimer.tool", lang)}</p>
    </div>
    </InnovationShell>
  )
}
