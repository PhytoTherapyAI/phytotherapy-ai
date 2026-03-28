// ============================================
// Premium Publisher Portal — Data Schema
// Business model: Credit-based publishing for verified professionals
// ============================================

// ── Content Types ──
export type ContentType = "article" | "video" | "case_study"
export type ContentStatus = "draft" | "pending_review" | "published" | "rejected" | "archived"
export type SubscriptionTier = "free" | "starter" | "professional" | "enterprise"

// ── Published Content Schema ──
export interface PublishedContent {
  id: string
  authorId: string
  type: ContentType
  title: string
  slug: string
  summary: string              // 160 chars max, used as preview
  body: string                 // Rich text HTML content
  coverImageUrl?: string
  videoUrl?: string            // YouTube/Vimeo embed URL
  videoDuration?: number       // seconds
  tags: string[]
  category: string
  status: ContentStatus
  language: "en" | "tr"
  // Engagement
  viewCount: number
  likeCount: number
  bookmarkCount: number
  // Review
  reviewedBy?: string
  reviewNote?: string
  // Monetization
  creditsUsed: number          // 1 credit = 1 article, 2 credits = 1 video
  isSponsored: boolean
  // Timestamps
  createdAt: string
  publishedAt?: string
  updatedAt: string
}

// ── Publisher Profile (extends ProfessionalProfile) ──
export interface PublisherProfile {
  userId: string
  isVerified: boolean
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt?: string
  // Credits
  creditsTotal: number         // total purchased
  creditsUsed: number          // total spent
  creditsRemaining: number     // total - used
  // Stats
  totalPublished: number
  totalViews: number
  totalLikes: number
  followerCount: number
  // Payment
  lastPaymentDate?: string
  lastPaymentAmount?: number
  paymentMethod?: string       // "iyzico" | "stripe"
  iyzipaySubscriptionId?: string
}

// ── Pricing Plans ──
export interface PricingPlan {
  id: SubscriptionTier
  name: { en: string; tr: string }
  description: { en: string; tr: string }
  price: { monthly: number; yearly: number; currency: string }
  credits: number              // monthly credits
  features: { en: string; tr: string }[]
  highlighted: boolean
  badge?: { en: string; tr: string }
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: { en: "Observer", tr: "Gözlemci" },
    description: { en: "Read content and build your profile", tr: "İçerik oku ve profilini oluştur" },
    price: { monthly: 0, yearly: 0, currency: "TRY" },
    credits: 0,
    features: [
      { en: "Read all expert content", tr: "Tüm uzman içeriklerini oku" },
      { en: "Professional profile page", tr: "Profesyonel profil sayfası" },
      { en: "Verification badge", tr: "Doğrulama rozeti" },
    ],
    highlighted: false,
  },
  {
    id: "starter",
    name: { en: "Starter", tr: "Başlangıç" },
    description: { en: "Start sharing your expertise", tr: "Uzmanlığını paylaşmaya başla" },
    price: { monthly: 299, yearly: 2899, currency: "TRY" },
    credits: 3,
    features: [
      { en: "3 articles/month", tr: "Ayda 3 makale" },
      { en: "Basic analytics", tr: "Temel analitik" },
      { en: "'Expert Content' badge on articles", tr: "Makalelerde 'Uzman İçeriği' rozeti" },
      { en: "Author profile card", tr: "Yazar profil kartı" },
    ],
    highlighted: false,
  },
  {
    id: "professional",
    name: { en: "Professional", tr: "Profesyonel" },
    description: { en: "Full publishing power with video", tr: "Video dahil tam yayın gücü" },
    price: { monthly: 699, yearly: 6499, currency: "TRY" },
    credits: 10,
    features: [
      { en: "10 credits/month (1 article = 1, 1 video = 2)", tr: "Ayda 10 kredi (1 makale = 1, 1 video = 2)" },
      { en: "Video upload support", tr: "Video yükleme desteği" },
      { en: "Advanced analytics & engagement metrics", tr: "Gelişmiş analitik ve etkileşim metrikleri" },
      { en: "Priority content review (24h)", tr: "Öncelikli içerik incelemesi (24 saat)" },
      { en: "Contact button on articles", tr: "Makalelerde iletişim butonu" },
      { en: "Monthly performance report", tr: "Aylık performans raporu" },
    ],
    highlighted: true,
    badge: { en: "Most Popular", tr: "En Popüler" },
  },
  {
    id: "enterprise",
    name: { en: "Enterprise", tr: "Kurumsal" },
    description: { en: "For clinics and health institutions", tr: "Klinikler ve sağlık kurumları için" },
    price: { monthly: 1999, yearly: 18999, currency: "TRY" },
    credits: 50,
    features: [
      { en: "50 credits/month", tr: "Ayda 50 kredi" },
      { en: "Multiple author accounts", tr: "Çoklu yazar hesabı" },
      { en: "Branded content pages", tr: "Markalı içerik sayfaları" },
      { en: "API access for content syndication", tr: "İçerik dağıtımı için API erişimi" },
      { en: "Dedicated account manager", tr: "Özel hesap yöneticisi" },
      { en: "Custom analytics dashboard", tr: "Özel analitik paneli" },
    ],
    highlighted: false,
  },
]

// ── Content Categories ──
export const CONTENT_CATEGORIES = [
  { id: "phytotherapy", label: { en: "Phytotherapy", tr: "Fitoterapi" }, icon: "Leaf" },
  { id: "nutrition", label: { en: "Nutrition", tr: "Beslenme" }, icon: "Apple" },
  { id: "mental_health", label: { en: "Mental Health", tr: "Mental Sağlık" }, icon: "Brain" },
  { id: "chronic_disease", label: { en: "Chronic Disease", tr: "Kronik Hastalık" }, icon: "Activity" },
  { id: "drug_interactions", label: { en: "Drug Interactions", tr: "İlaç Etkileşimleri" }, icon: "Pill" },
  { id: "womens_health", label: { en: "Women's Health", tr: "Kadın Sağlığı" }, icon: "Heart" },
  { id: "pediatrics", label: { en: "Pediatrics", tr: "Pediatri" }, icon: "Baby" },
  { id: "sports_medicine", label: { en: "Sports Medicine", tr: "Spor Hekimliği" }, icon: "Dumbbell" },
  { id: "integrative", label: { en: "Integrative Medicine", tr: "Bütünleştirici Tıp" }, icon: "Sparkles" },
  { id: "research", label: { en: "Research & Evidence", tr: "Araştırma & Kanıt" }, icon: "BookOpen" },
]

// ── Credit Costs ──
export const CREDIT_COSTS: Record<ContentType, number> = {
  article: 1,
  video: 2,
  case_study: 1,
}

// ── Mock Content ──
export const MOCK_CONTENT: Partial<PublishedContent>[] = [
  {
    id: "1", authorId: "1", type: "article", title: "Berberine vs Metformin: A Comparative Analysis",
    summary: "Evidence-based comparison of berberine and metformin for blood sugar management in Type 2 Diabetes.",
    tags: ["berberine", "metformin", "diabetes", "evidence-based"], category: "phytotherapy",
    status: "published", language: "en", viewCount: 1247, likeCount: 89, bookmarkCount: 34,
    creditsUsed: 1, isSponsored: false, publishedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "2", authorId: "2", type: "article", title: "İlaç-Bitki Etkileşimlerinde Güncel Yaklaşımlar",
    summary: "Klinik pratikte sık karşılaşılan ilaç-bitki etkileşimleri ve eczacının rolü.",
    tags: ["etkileşim", "eczacılık", "güvenlik"], category: "drug_interactions",
    status: "published", language: "tr", viewCount: 892, likeCount: 67, bookmarkCount: 21,
    creditsUsed: 1, isSponsored: false, publishedAt: "2026-03-20T14:00:00Z",
  },
  {
    id: "3", authorId: "1", type: "video", title: "Understanding Ashwagandha: Mechanisms & Clinical Evidence",
    summary: "A comprehensive video review of KSM-66 ashwagandha research for stress and anxiety.",
    tags: ["ashwagandha", "adaptogens", "stress", "anxiety"], category: "phytotherapy",
    status: "published", language: "en", viewCount: 3421, likeCount: 245, bookmarkCount: 89,
    videoUrl: "https://www.youtube.com/embed/placeholder", videoDuration: 1200,
    creditsUsed: 2, isSponsored: false, publishedAt: "2026-03-10T09:00:00Z",
  },
]

// ── Payment Flow (Iyzico/Stripe) ──
// After successful payment:
// 1. Webhook receives payment confirmation
// 2. Verify payment signature (prevent tampering)
// 3. Lookup user by payment metadata (userId)
// 4. Update publisher_profiles:
//    - subscriptionTier = purchased tier
//    - subscriptionExpiresAt = now + 30 days (monthly) or + 365 days (yearly)
//    - creditsTotal += plan.credits
//    - creditsRemaining += plan.credits
//    - lastPaymentDate = now
//    - lastPaymentAmount = amount
// 5. Create payment_history record
// 6. Send confirmation email
// 7. Unlock publishing UI
