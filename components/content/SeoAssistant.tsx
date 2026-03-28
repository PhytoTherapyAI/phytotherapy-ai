"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles, Search, Eye, AlertTriangle, Check, X, TrendingUp,
  Lightbulb, Type, FileText, Hash, Clock, Gauge, ChevronDown,
  ChevronUp, Loader2, Wand2, RefreshCw,
} from "lucide-react"

// ── SEO Analysis Engine ──

interface SeoIssue {
  type: "error" | "warning" | "success" | "info"
  category: "title" | "content" | "readability" | "keyword" | "structure"
  message: { en: string; tr: string }
  impact: number // 0-10 impact on score
}

interface SeoAnalysis {
  score: number
  wordCount: number
  sentenceCount: number
  avgSentenceLength: number
  avgWordsPerSentence: number
  readingTimeMinutes: number
  titleLength: number
  summaryLength: number
  headingCount: number
  keywordsFound: string[]
  keywordsMissing: string[]
  issues: SeoIssue[]
  readabilityLevel: "easy" | "moderate" | "hard"
}

// Medical keywords that should be simplified for patients
const COMPLEX_TERMS: Record<string, { simple: { en: string; tr: string } }> = {
  "hypertension": { simple: { en: "high blood pressure", tr: "yüksek tansiyon" } },
  "hyperlipidemia": { simple: { en: "high cholesterol", tr: "yüksek kolesterol" } },
  "myocardial infarction": { simple: { en: "heart attack", tr: "kalp krizi" } },
  "cerebrovascular accident": { simple: { en: "stroke", tr: "inme/felç" } },
  "hepatotoxicity": { simple: { en: "liver damage", tr: "karaciğer hasarı" } },
  "nephrotoxicity": { simple: { en: "kidney damage", tr: "böbrek hasarı" } },
  "pharmacokinetics": { simple: { en: "how the body processes the drug", tr: "vücudun ilacı işleme şekli" } },
  "contraindication": { simple: { en: "reason not to use", tr: "kullanılmaması gereken durum" } },
  "etiology": { simple: { en: "cause", tr: "neden" } },
  "pathogenesis": { simple: { en: "how the disease develops", tr: "hastalığın gelişim süreci" } },
  "hiperkolesterolemi": { simple: { en: "high cholesterol", tr: "yüksek kolesterol" } },
  "hipertansiyon": { simple: { en: "high blood pressure", tr: "yüksek tansiyon" } },
  "hepatotoksisite": { simple: { en: "liver damage", tr: "karaciğer hasarı" } },
  "nefrotoksisite": { simple: { en: "kidney damage", tr: "böbrek hasarı" } },
  "farmakokinetik": { simple: { en: "drug processing", tr: "ilaç işleme" } },
  "kontrendikasyon": { simple: { en: "reason not to use", tr: "kullanım engeli" } },
}

// Common health SEO keywords
const SUGGESTED_KEYWORDS = [
  "treatment", "symptoms", "causes", "side effects", "dosage", "natural remedy",
  "evidence-based", "clinical study", "patient guide", "how to", "benefits", "risks",
  "tedavi", "belirtiler", "nedenler", "yan etkiler", "doz", "doğal çözüm",
  "kanıta dayalı", "klinik çalışma", "hasta rehberi", "nasıl", "faydalar", "riskler",
]

function analyzeSeo(title: string, summary: string, body: string, tags: string[], lang: string): SeoAnalysis {
  const fullText = `${title} ${summary} ${body}`.toLowerCase()
  const words = body.split(/\s+/).filter(w => w.length > 0)
  const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const wordCount = words.length
  const sentenceCount = sentences.length
  const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))
  const headingCount = (body.match(/^#{1,3}\s/gm) || []).length + (body.match(/<h[1-3]/gi) || []).length

  const issues: SeoIssue[] = []
  let score = 100

  // Title checks
  if (!title) {
    issues.push({ type: "error", category: "title", message: { en: "Title is missing", tr: "Başlık eksik" }, impact: 20 })
    score -= 20
  } else if (title.length < 30) {
    issues.push({ type: "warning", category: "title", message: { en: "Title is too short (aim for 50-60 chars)", tr: "Başlık çok kısa (50-60 karakter hedefle)" }, impact: 10 })
    score -= 10
  } else if (title.length > 70) {
    issues.push({ type: "warning", category: "title", message: { en: "Title is too long (max 60-70 chars for Google)", tr: "Başlık çok uzun (Google için maks 60-70 karakter)" }, impact: 5 })
    score -= 5
  } else {
    issues.push({ type: "success", category: "title", message: { en: "Title length is optimal", tr: "Başlık uzunluğu ideal" }, impact: 0 })
  }

  // Summary (meta description)
  if (!summary) {
    issues.push({ type: "error", category: "content", message: { en: "Summary/meta description is missing", tr: "Özet/meta açıklama eksik" }, impact: 15 })
    score -= 15
  } else if (summary.length < 100) {
    issues.push({ type: "warning", category: "content", message: { en: "Summary too short (aim for 150-160 chars)", tr: "Özet çok kısa (150-160 karakter hedefle)" }, impact: 5 })
    score -= 5
  } else {
    issues.push({ type: "success", category: "content", message: { en: "Summary length is good", tr: "Özet uzunluğu iyi" }, impact: 0 })
  }

  // Word count
  if (wordCount < 100) {
    issues.push({ type: "error", category: "content", message: { en: `Too short (${wordCount} words). Aim for 800+ words.`, tr: `Çok kısa (${wordCount} kelime). 800+ kelime hedefle.` }, impact: 20 })
    score -= 20
  } else if (wordCount < 500) {
    issues.push({ type: "warning", category: "content", message: { en: `Short content (${wordCount} words). 800+ recommended.`, tr: `Kısa içerik (${wordCount} kelime). 800+ önerilir.` }, impact: 10 })
    score -= 10
  } else if (wordCount >= 800) {
    issues.push({ type: "success", category: "content", message: { en: `Good length (${wordCount} words)`, tr: `İyi uzunluk (${wordCount} kelime)` }, impact: 0 })
  }

  // Readability — sentence length
  if (avgWordsPerSentence > 25) {
    issues.push({ type: "warning", category: "readability", message: { en: "Sentences are too long. Patients may struggle to follow. Keep under 20 words.", tr: "Cümleler çok uzun. Hastalar takip etmekte zorlanabilir. 20 kelimenin altında tut." }, impact: 10 })
    score -= 10
  } else if (avgWordsPerSentence > 20) {
    issues.push({ type: "info", category: "readability", message: { en: "Sentence length is borderline. Try to simplify some sentences.", tr: "Cümle uzunluğu sınırda. Bazı cümleleri basitleştirmeyi dene." }, impact: 5 })
    score -= 5
  }

  // Headings / structure
  if (wordCount > 300 && headingCount === 0) {
    issues.push({ type: "warning", category: "structure", message: { en: "No headings found. Add H2/H3 for better structure.", tr: "Başlık bulunamadı. Daha iyi yapı için H2/H3 ekle." }, impact: 10 })
    score -= 10
  }

  // Complex medical terms
  const foundComplex: string[] = []
  Object.keys(COMPLEX_TERMS).forEach(term => {
    if (fullText.includes(term.toLowerCase())) foundComplex.push(term)
  })
  if (foundComplex.length > 3) {
    issues.push({ type: "warning", category: "readability", message: { en: `${foundComplex.length} complex medical terms detected. Consider adding plain-language explanations.`, tr: `${foundComplex.length} karmaşık tıbbi terim tespit edildi. Sade dil açıklamaları eklemeyi düşün.` }, impact: 8 })
    score -= 8
  }

  // Keywords
  const keywordsFound: string[] = []
  const keywordsMissing: string[] = []
  const relevantKeywords = SUGGESTED_KEYWORDS.filter(k => lang === "tr" ? !k.match(/^[a-z]/) || k.length > 5 : k.match(/^[a-z]/))
  relevantKeywords.slice(0, 8).forEach(kw => {
    if (fullText.includes(kw.toLowerCase())) keywordsFound.push(kw)
    else keywordsMissing.push(kw)
  })
  tags.forEach(tag => {
    if (fullText.includes(tag.toLowerCase())) {
      if (!keywordsFound.includes(tag)) keywordsFound.push(tag)
    }
  })

  if (keywordsFound.length === 0 && wordCount > 50) {
    issues.push({ type: "warning", category: "keyword", message: { en: "No SEO keywords detected. Add relevant health terms.", tr: "SEO anahtar kelimesi tespit edilmedi. İlgili sağlık terimleri ekle." }, impact: 10 })
    score -= 10
  }

  const readabilityLevel: "easy" | "moderate" | "hard" = avgWordsPerSentence <= 15 ? "easy" : avgWordsPerSentence <= 22 ? "moderate" : "hard"

  return {
    score: Math.max(0, Math.min(100, score)),
    wordCount,
    sentenceCount,
    avgSentenceLength: avgWordsPerSentence,
    avgWordsPerSentence,
    readingTimeMinutes: readingTime,
    titleLength: title.length,
    summaryLength: summary.length,
    headingCount,
    keywordsFound,
    keywordsMissing: keywordsMissing.slice(0, 6),
    issues: issues.sort((a, b) => b.impact - a.impact),
    readabilityLevel,
  }
}

// ── Title Generator (client-side) ──
function generateTitles(topic: string, lang: string): string[] {
  if (!topic) return []
  const base = topic.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, "").trim()
  if (lang === "tr") {
    return [
      `${base}: Bilmeniz Gereken Her Şey`,
      `${base} Hakkında Doktorunuzun Size Söylemediği 5 Şey`,
      `${base} İçin Kanıta Dayalı Rehber (2026)`,
      `${base}: Belirtiler, Tedavi ve Doğal Çözümler`,
      `${base} — Uzman Görüşü ve Güncel Araştırmalar`,
    ]
  }
  return [
    `${base}: Everything You Need to Know`,
    `5 Things Your Doctor Didn't Tell You About ${base}`,
    `Evidence-Based Guide to ${base} (2026)`,
    `${base}: Symptoms, Treatment & Natural Remedies`,
    `${base} — Expert Opinion & Latest Research`,
  ]
}

// ── Component ──

interface SeoAssistantProps {
  title: string
  summary: string
  body: string
  tags: string[]
  lang: string
  onTitleSuggestion?: (title: string) => void
}

export function SeoAssistant({ title, summary, body, tags, lang, onTitleSuggestion }: SeoAssistantProps) {
  const [expanded, setExpanded] = useState<string | null>("score")
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)

  // Debounced analysis
  const analysis = useMemo(() => analyzeSeo(title, summary, body, tags, lang), [title, summary, body, tags, lang])

  const handleGenerateTitles = () => {
    setGenerating(true)
    setTimeout(() => {
      const keyword = tags[0] || title.split(" ").slice(0, 3).join(" ") || "Health"
      setSuggestedTitles(generateTitles(keyword, lang))
      setGenerating(false)
      setExpanded("titles")
    }, 800)
  }

  const scoreColor = analysis.score >= 80 ? "#22C55E" : analysis.score >= 60 ? "#F59E0B" : analysis.score >= 40 ? "#F97316" : "#EF4444"
  const circumference = 2 * Math.PI * 36

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "AI SEO Copilot", tr: "AI SEO Yardımcısı" },
      score: { en: "SEO Score", tr: "SEO Skoru" },
      keywords: { en: "Keywords", tr: "Anahtar Kelimeler" },
      readability: { en: "Readability", tr: "Okunabilirlik" },
      issues: { en: "Issues & Suggestions", tr: "Sorunlar & Öneriler" },
      titles: { en: "Title Suggestions", tr: "Başlık Önerileri" },
      generate: { en: "Generate Titles", tr: "Başlık Öner" },
      generating: { en: "Generating...", tr: "Oluşturuluyor..." },
      use_this: { en: "Use this", tr: "Bunu kullan" },
      words: { en: "words", tr: "kelime" },
      sentences: { en: "sentences", tr: "cümle" },
      min_read: { en: "min read", tr: "dk okuma" },
      headings: { en: "headings", tr: "başlık" },
      found: { en: "Found", tr: "Bulunan" },
      missing: { en: "Missing", tr: "Eksik" },
      easy: { en: "Easy to read", tr: "Kolay okunur" },
      moderate: { en: "Moderate", tr: "Orta düzey" },
      hard: { en: "Hard to read", tr: "Zor okunur" },
      complex_terms: { en: "Complex Terms", tr: "Karmaşık Terimler" },
      simplify_hint: { en: "Consider using simpler language for patients", tr: "Hastalar için daha basit dil kullanmayı düşünün" },
    }
    return map[key]?.[lang] || key
  }

  const Section = ({ id, icon: Icon, label, children, badge }: { id: string; icon: any; label: string; children: React.ReactNode; badge?: React.ReactNode }) => {
    const isOpen = expanded === id
    return (
      <div className="border-b border-border last:border-0">
        <button onClick={() => setExpanded(isOpen ? null : id)}
          className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
            {badge}
          </div>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        {isOpen && <div className="pb-3 px-1">{children}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-0 rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold">{t("title")}</span>
          <Badge variant="outline" className="text-[9px] ml-auto">BETA</Badge>
        </div>
      </div>

      <div className="px-3">
        {/* Score Section */}
        <Section id="score" icon={Gauge} label={t("score")}
          badge={<Badge className="text-[10px]" style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}>{analysis.score}</Badge>}>
          <div className="flex items-center gap-4">
            {/* Circular Score */}
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/20" />
                <circle cx="40" cy="40" r="36" fill="none" strokeWidth="5" strokeLinecap="round"
                  stroke={scoreColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (analysis.score / 100) * circumference}
                  style={{ transition: "stroke-dashoffset 0.6s ease-out" }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: scoreColor }}>
                {analysis.score}
              </span>
            </div>
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <span className="text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" />{analysis.wordCount} {t("words")}</span>
              <span className="text-muted-foreground flex items-center gap-1"><Type className="w-3 h-3" />{analysis.sentenceCount} {t("sentences")}</span>
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{analysis.readingTimeMinutes} {t("min_read")}</span>
              <span className="text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" />{analysis.headingCount} {t("headings")}</span>
            </div>
          </div>
        </Section>

        {/* Keywords */}
        <Section id="keywords" icon={Search} label={t("keywords")}
          badge={<Badge variant="outline" className="text-[10px]">{analysis.keywordsFound.length}/{analysis.keywordsFound.length + analysis.keywordsMissing.length}</Badge>}>
          {analysis.keywordsFound.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{t("found")}</p>
              <div className="flex flex-wrap gap-1">
                {analysis.keywordsFound.map(kw => (
                  <Badge key={kw} className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
          {analysis.keywordsMissing.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{t("missing")}</p>
              <div className="flex flex-wrap gap-1">
                {analysis.keywordsMissing.map(kw => (
                  <Badge key={kw} variant="outline" className="text-[10px] text-muted-foreground">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Readability */}
        <Section id="readability" icon={Eye} label={t("readability")}
          badge={
            <Badge className={`text-[10px] ${
              analysis.readabilityLevel === "easy" ? "bg-green-500/10 text-green-600" :
              analysis.readabilityLevel === "moderate" ? "bg-amber-500/10 text-amber-600" :
              "bg-red-500/10 text-red-600"
            }`}>{t(analysis.readabilityLevel)}</Badge>
          }>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{lang === "tr" ? "Ort. cümle uzunluğu" : "Avg. sentence length"}</span>
              <span className="font-medium">{analysis.avgWordsPerSentence} {t("words")}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (analysis.avgWordsPerSentence / 30) * 100)}%`,
                  backgroundColor: analysis.avgWordsPerSentence <= 15 ? "#22C55E" : analysis.avgWordsPerSentence <= 22 ? "#F59E0B" : "#EF4444",
                }} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("simplify_hint")}
            </p>
          </div>
        </Section>

        {/* Issues */}
        <Section id="issues" icon={AlertTriangle} label={t("issues")}
          badge={
            <Badge variant="outline" className="text-[10px]">
              {analysis.issues.filter(i => i.type === "error" || i.type === "warning").length}
            </Badge>
          }>
          <div className="space-y-1.5">
            {analysis.issues.map((issue, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                issue.type === "error" ? "bg-red-500/5" :
                issue.type === "warning" ? "bg-amber-500/5" :
                issue.type === "success" ? "bg-green-500/5" : "bg-blue-500/5"
              }`}>
                {issue.type === "error" ? <X className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" /> :
                 issue.type === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> :
                 issue.type === "success" ? <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" /> :
                 <Lightbulb className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />}
                <span className="text-muted-foreground">{issue.message[lang as "en" | "tr"]}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Title Generator */}
        <Section id="titles" icon={Wand2} label={t("titles")}>
          <Button size="sm" variant="outline" className="w-full mb-3 gap-2" onClick={handleGenerateTitles} disabled={generating}>
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {generating ? t("generating") : t("generate")}
          </Button>
          {suggestedTitles.length > 0 && (
            <div className="space-y-1.5">
              {suggestedTitles.map((st, i) => (
                <button key={i} onClick={() => onTitleSuggestion?.(st)}
                  className="w-full text-left p-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-xs group">
                  <span className="text-foreground">{st}</span>
                  <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 ml-2">
                    {t("use_this")} →
                  </span>
                </button>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}
