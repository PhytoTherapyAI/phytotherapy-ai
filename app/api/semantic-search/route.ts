// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Semantic Search API — Vector Similarity Search
// POST /api/semantic-search
// ============================================
//
// Flow:
// 1. User query → Gemini embedding (768-dim)
// 2. Embedding → Supabase pgvector cosine similarity
// 3. Results ranked by similarity score
// 4. Fallback: keyword search if vector search unavailable
//

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit } from "@/lib/rate-limit"
import { generateEmbedding, type SemanticSearchResult } from "@/lib/embeddings"

// ── Fallback keyword search data ──
// Used when pgvector is not yet set up or embedding fails
const FALLBACK_DATA: SemanticSearchResult[] = [
  // Supplements with Turkish symptom mappings
  { contentType: "supplement", contentId: "curcumin", title: "Curcumin (Turmeric)", titleTr: "Kurkumin (Zerdeçal)", description: "Anti-inflammatory, joint pain, digestive support", descriptionTr: "Anti-inflamatuar, eklem ağrısı, sindirim desteği", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["inflammation", "joint pain", "stomach", "mide", "iltihap", "eklem ağrısı", "hazımsızlık", "dispepsi"], dosage: "500-1000mg/day", evidence: "B" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "berberine", title: "Berberine", titleTr: "Berberin", description: "Blood sugar management, metabolic support", descriptionTr: "Kan şekeri yönetimi, metabolik destek", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["blood sugar", "diabetes", "diyabet", "şeker", "metabolizma", "cholesterol", "kolesterol"], dosage: "500mg 2-3x/day", evidence: "A" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "valerian", title: "Valerian Root", titleTr: "Kediotu Kökü", description: "Sleep support, mild sedative", descriptionTr: "Uyku desteği, hafif sakinleştirici", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["insomnia", "sleep", "uyku", "uyuyamıyorum", "uykusuzluk", "anxiety", "anksiyete"], dosage: "300-600mg/night", evidence: "B" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "ashwagandha", title: "Ashwagandha KSM-66", titleTr: "Ashwagandha KSM-66", description: "Stress, anxiety, adaptogen", descriptionTr: "Stres, anksiyete, adaptogen", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["stress", "anxiety", "stres", "anksiyete", "gerginlik", "endişe", "cortisol", "fatigue", "yorgunluk"], dosage: "300-600mg/day", evidence: "B" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "peppermint", title: "Peppermint Oil", titleTr: "Nane Yağı", description: "IBS, digestive discomfort, bloating", descriptionTr: "IBS, sindirim rahatsızlığı, şişkinlik", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["ibs", "bloating", "stomach", "şişkinlik", "mide", "mide yanması", "gaz", "cramp", "kramp", "hazımsızlık", "gastrit"], dosage: "0.2-0.4ml enteric-coated", evidence: "A" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "melatonin", title: "Melatonin", titleTr: "Melatonin", description: "Sleep onset, jet lag, circadian rhythm", descriptionTr: "Uykuya dalma, jet lag, sirkadyen ritim", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["sleep", "insomnia", "uyku", "uyuyamıyorum", "jet lag", "gece", "uyanma"], dosage: "0.5-3mg/night", evidence: "A" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "magnesium", title: "Magnesium Glycinate", titleTr: "Magnezyum Glisinat", description: "Muscle relaxation, sleep, stress", descriptionTr: "Kas gevşemesi, uyku, stres", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["muscle", "cramp", "kas", "kramp", "sleep", "uyku", "stress", "stres", "headache", "baş ağrısı", "anxiety"], dosage: "200-400mg/day", evidence: "B" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "omega3", title: "Omega-3 (EPA/DHA)", titleTr: "Omega-3 (EPA/DHA)", description: "Heart, brain, inflammation", descriptionTr: "Kalp, beyin, iltihap", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["heart", "kalp", "cholesterol", "kolesterol", "brain", "beyin", "depression", "depresyon", "inflammation", "triglycerides"], dosage: "1-2g/day", evidence: "A" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "ginger", title: "Ginger Extract", titleTr: "Zencefil Ekstresi", description: "Nausea, digestion, anti-inflammatory", descriptionTr: "Bulantı, sindirim, anti-inflamatuar", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["nausea", "bulantı", "mide bulantısı", "vomiting", "kusma", "motion sickness", "digestion", "sindirim"], dosage: "250mg 4x/day", evidence: "A" }, similarity: 0, isAiMatch: false },
  { contentType: "supplement", contentId: "quercetin", title: "Quercetin", titleTr: "Kuersetin", description: "Allergy, inflammation, immune", descriptionTr: "Alerji, iltihap, bağışıklık", href: "/supplement-compare", category: "supplement", metadata: { symptoms: ["allergy", "alerji", "histamine", "hayfever", "saman nezlesi", "inflammation", "immune", "bağışıklık"], dosage: "500mg 2x/day", evidence: "B" }, similarity: 0, isAiMatch: false },
  // Conditions
  { contentType: "condition", contentId: "insomnia", title: "Insomnia (Sleep Disorders)", titleTr: "Uykusuzluk (Uyku Bozuklukları)", description: "Sleep analysis, CBT-I, natural remedies", descriptionTr: "Uyku analizi, BDT-I, doğal çözümler", href: "/sleep-analysis", category: "sleep", metadata: { symptoms: ["uyuyamıyorum", "insomnia", "uykusuzluk", "sleep", "uyku", "gece uyanma"] }, similarity: 0, isAiMatch: false },
  { contentType: "condition", contentId: "anxiety", title: "Anxiety Disorders", titleTr: "Anksiyete Bozuklukları", description: "GAD-7 screening", descriptionTr: "GAD-7 tarama", href: "/clinical-tests", category: "mental", metadata: { symptoms: ["anxiety", "anksiyete", "endişe", "panik", "gerginlik", "stress", "stres"] }, similarity: 0, isAiMatch: false },
  { contentType: "condition", contentId: "depression", title: "Depression", titleTr: "Depresyon", description: "PHQ-9 screening, mood tracking", descriptionTr: "PHQ-9 tarama, ruh hali takibi", href: "/clinical-tests", category: "mental", metadata: { symptoms: ["depression", "depresyon", "sad", "üzgün", "mutsuz", "umutsuz", "hopeless", "mood"] }, similarity: 0, isAiMatch: false },
  { contentType: "condition", contentId: "dyspepsia", title: "Dyspepsia (Indigestion)", titleTr: "Dispepsi (Hazımsızlık)", description: "Gut health, nutrition, supplements", descriptionTr: "Bağırsak sağlığı, beslenme, takviyeler", href: "/gut-health", category: "digestive", metadata: { symptoms: ["mide yanması", "heartburn", "indigestion", "hazımsızlık", "dispepsi", "bloating", "şişkinlik", "gastrit", "reflü", "reflux", "mide ağrısı"] }, similarity: 0, isAiMatch: false },
  { contentType: "condition", contentId: "migraine", title: "Migraine", titleTr: "Migren", description: "Trigger diary, attack tracking, prevention", descriptionTr: "Tetikleyici günlüğü, atak takibi, önleme", href: "/migraine-dashboard", category: "neurological", metadata: { symptoms: ["migraine", "migren", "headache", "baş ağrısı", "aura", "bulantı", "nausea", "light sensitivity"] }, similarity: 0, isAiMatch: false },
]

// ── Fallback keyword search ──
function keywordSearch(query: string): SemanticSearchResult[] {
  const q = query.toLowerCase()
  const scored = FALLBACK_DATA.map(item => {
    let score = 0
    // Title match
    if (item.title.toLowerCase().includes(q)) score += 5
    if (item.titleTr?.toLowerCase().includes(q)) score += 5
    // Description match
    if (item.description?.toLowerCase().includes(q)) score += 3
    if (item.descriptionTr?.toLowerCase().includes(q)) score += 3
    // Symptom/metadata match (most important for natural language)
    const symptoms = (item.metadata?.symptoms as string[]) || []
    symptoms.forEach(s => {
      if (s.toLowerCase().includes(q) || q.includes(s.toLowerCase())) score += 4
    })
    // Partial word match
    const words = q.split(/\s+/)
    words.forEach(word => {
      if (word.length < 3) return
      if (item.title.toLowerCase().includes(word)) score += 2
      if (item.titleTr?.toLowerCase().includes(word)) score += 2
      symptoms.forEach(s => { if (s.includes(word)) score += 3 })
    })
    return { ...item, similarity: Math.min(score / 15, 0.99), isAiMatch: false }
  })
  return scored.filter(s => s.similarity > 0.1).sort((a, b) => b.similarity - a.similarity).slice(0, 8)
}

// ── API Route ──

export async function POST(req: Request) {
  // Rate limit: 30 searches per minute
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
  const { allowed } = checkRateLimit(`semantic-search:${ip}`, 30, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  try {
    const { query, filter, limit = 8 } = await req.json()
    if (!query || typeof query !== "string" || query.length < 2) {
      return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 })
    }

    // Try vector search first
    let results: SemanticSearchResult[] = []
    let searchMethod: "vector" | "keyword" = "keyword"

    try {
      // 1. Generate query embedding
      const queryEmbedding = await generateEmbedding(query)

      // 2. Search via Supabase pgvector
      const supabase = createServerClient()
      const { data, error } = await supabase.rpc("search_embeddings", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.3,
        match_count: limit,
        filter_type: filter || null,
      })

      if (!error && data && data.length > 0) {
        interface SearchRow { content_type: string; content_id: string; title: string; title_tr?: string; description?: string; description_tr?: string; href: string; category: string; metadata?: Record<string, unknown>; similarity: number }
        results = data.map((row: SearchRow) => ({
          contentType: row.content_type,
          contentId: row.content_id,
          title: row.title,
          titleTr: row.title_tr,
          description: row.description,
          descriptionTr: row.description_tr,
          href: row.href,
          category: row.category,
          metadata: row.metadata || {},
          similarity: row.similarity,
          isAiMatch: true,
        }))
        searchMethod = "vector"
      }
    } catch (vectorError) {
      // Vector search failed (pgvector not set up, embedding error, etc.)
      // Fall through to keyword search
      console.warn("[SEMANTIC-SEARCH] Vector search failed, using keyword fallback:", vectorError)
    }

    // 3. Fallback to keyword search if vector search returned nothing
    if (results.length === 0) {
      results = keywordSearch(query)
      searchMethod = "keyword"
    }

    return NextResponse.json({
      results,
      query,
      method: searchMethod,
      count: results.length,
    })

  } catch (error) {
    console.error("[SEMANTIC-SEARCH] Error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
