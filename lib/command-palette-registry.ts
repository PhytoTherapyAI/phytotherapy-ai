// © 2026 DoctoPal — All Rights Reserved
// Session 39/40: Global command palette registry (⌘K) — source of truth for
// PAGES / LEGAL / ACTIONS / SETTINGS entries. Tools are NOT duplicated here;
// they come from lib/tools-hierarchy.ts via CommandPalette's existing
// getToolItems() helper (80 entries, TR+EN already wired).
//
// Adding a new entry: push to PALETTE_REGISTRY with TR/EN title + keywords.
// Matching uses substring includes on title+keywords in the active language,
// so keywords should cover common misspellings / slang (lowercase).
//
// Route slugs verified against actual `app/**/page.tsx` directory — do NOT
// trust spec-ish slugs like /kullanim-kosullari; use /terms (real path).

export type PaletteCategory =
  | "pages"
  | "legal"
  | "actions"
  | "settings"
  | "profile-fields";

export type PaletteAction =
  | "signout"
  | "toggle-language"
  | "toggle-theme";

export interface PaletteEntry {
  /** Unique id — "page:panel", "legal:aydinlatma", "action:signout" */
  id: string;
  category: PaletteCategory;
  title: { tr: string; en: string };
  description?: { tr: string; en: string };
  /** Lowercase match tokens for each language. Include synonyms + slang. */
  keywords: { tr: string[]; en: string[] };
  /** Either href (navigate) OR action (dispatch) — exactly one should be set. */
  href?: string;
  action?: PaletteAction;
  /** True → entry only shown when useEffectivePremium().isPremium is true. */
  premium?: boolean;
  /** True → entry only shown when user is authenticated. */
  authOnly?: boolean;
  /** True → entry only shown when user is a guest (not logged in). */
  guestOnly?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// REGISTRY — 30 entries (12 pages + 6 legal + 6 actions + 6 settings)
// ═══════════════════════════════════════════════════════════════════════
export const PALETTE_REGISTRY: PaletteEntry[] = [
  // ───────────────────── PAGES (12) ─────────────────────
  {
    id: "page:panel",
    category: "pages",
    title: { tr: "Panel", en: "Dashboard" },
    description: { tr: "Günün özeti, hatırlatıcılar, hızlı erişim", en: "Today's overview, reminders, quick access" },
    keywords: { tr: ["panel", "anasayfa", "ana sayfa", "dashboard", "özet"], en: ["dashboard", "home", "overview", "panel"] },
    href: "/",
    authOnly: true,
  },
  {
    id: "page:health-assistant",
    category: "pages",
    title: { tr: "Sağlık Asistanı", en: "Health Assistant" },
    description: { tr: "AI sohbet — ilaç, semptom, takviye sorularını sor", en: "AI chat — ask about medications, symptoms, supplements" },
    keywords: { tr: ["ai", "asistan", "chat", "sohbet", "soru", "yapay zeka", "claude"], en: ["ai", "assistant", "chat", "ask", "claude"] },
    href: "/health-assistant",
  },
  {
    id: "page:calendar",
    category: "pages",
    title: { tr: "Takvim", en: "Calendar" },
    description: { tr: "İlaç zamanı, su takibi, günlük kayıtlar", en: "Medication times, hydration, daily logs" },
    keywords: { tr: ["takvim", "calendar", "ilaç hatırlatıcı", "su", "randevu"], en: ["calendar", "schedule", "reminder"] },
    href: "/calendar",
    authOnly: true,
  },
  {
    id: "page:family",
    category: "pages",
    title: { tr: "Hane", en: "Household" },
    description: { tr: "Aile üyeleri, davet, paylaşım ayarları", en: "Family members, invites, sharing settings" },
    keywords: { tr: ["hane", "aile", "üye", "davet", "paylaşım", "profil seç"], en: ["family", "household", "members", "invite", "sharing"] },
    href: "/family",
    authOnly: true,
  },
  {
    id: "page:family-health-tree",
    category: "pages",
    title: { tr: "Aile Sağlık Ağacı", en: "Family Health Tree" },
    description: { tr: "Kalıtsal risk değerlendirmesi, aile sağlık öyküsü", en: "Hereditary risk assessment, family history" },
    keywords: { tr: ["aile", "ağaç", "kalıtsal", "genetik", "risk", "kanser geçmişi", "anne", "baba"], en: ["family", "tree", "hereditary", "genetic", "risk"] },
    href: "/family-health-tree",
    authOnly: true,
  },
  {
    id: "page:profile",
    category: "pages",
    title: { tr: "Profil", en: "Profile" },
    description: { tr: "İlaçlar, alerjiler, kronik durumlar, yaşam tarzı", en: "Medications, allergies, chronic conditions, lifestyle" },
    keywords: { tr: ["profil", "bilgi", "ilaç", "alerji", "kronik", "yaşam"], en: ["profile", "info", "medications", "allergies", "chronic"] },
    href: "/profile",
    authOnly: true,
  },
  {
    id: "page:interaction-checker",
    category: "pages",
    title: { tr: "Etkileşim Denetleyici", en: "Interaction Checker" },
    description: { tr: "İlaç-bitki-takviye etkileşim kontrolü", en: "Drug-herb-supplement interaction check" },
    keywords: { tr: ["etkileşim", "denetle", "çakışma", "ilaç", "bitki", "takviye"], en: ["interaction", "checker", "drug", "herb", "supplement"] },
    href: "/interaction-checker",
  },
  {
    id: "page:medical-analysis",
    category: "pages",
    title: { tr: "Tıbbi Analiz", en: "Medical Analysis" },
    description: { tr: "Kan tahlili, radyoloji, trend grafiği", en: "Blood tests, radiology, trend charts" },
    keywords: { tr: ["tıbbi", "analiz", "kan", "tahlil", "radyoloji", "trend", "grafik"], en: ["medical", "analysis", "blood", "radiology", "trends"] },
    href: "/medical-analysis",
  },
  {
    id: "page:history",
    category: "pages",
    title: { tr: "Sorgu Geçmişi", en: "Query History" },
    description: { tr: "Geçmiş AI sohbetleri, analiz sonuçları", en: "Past AI chats and analysis results" },
    keywords: { tr: ["geçmiş", "sorgu", "tarihçe", "history", "eski"], en: ["history", "past", "previous", "archive"] },
    href: "/history",
    authOnly: true,
  },
  {
    id: "page:tools",
    category: "pages",
    title: { tr: "Tüm Araçlar", en: "All Tools" },
    description: { tr: "60+ sağlık aracının tam listesi", en: "Full catalog of 60+ health tools" },
    keywords: { tr: ["araç", "araçlar", "tool", "katalog", "liste"], en: ["tools", "all tools", "catalog", "list"] },
    href: "/tools",
  },
  {
    id: "page:pricing",
    category: "pages",
    title: { tr: "Premium Planlar", en: "Premium Plans" },
    description: { tr: "Bireysel ve aile abonelik seçenekleri", en: "Individual and family subscription plans" },
    keywords: { tr: ["premium", "abonelik", "fiyat", "ücret", "plan", "paket"], en: ["premium", "pricing", "subscription", "plans"] },
    href: "/pricing",
  },
  {
    id: "page:about",
    category: "pages",
    title: { tr: "Hakkımızda", en: "About" },
    description: { tr: "DoctoPal ekibi ve misyonu", en: "The DoctoPal team and mission" },
    keywords: { tr: ["hakkında", "hakkımızda", "ekip", "misyon", "kurucu"], en: ["about", "team", "mission", "founders"] },
    href: "/about",
  },

  // ───────────────────── LEGAL (6) ─────────────────────
  {
    id: "legal:aydinlatma",
    category: "legal",
    title: { tr: "Aydınlatma Metni (KVKK Md.10)", en: "Privacy Notice (KVKK Art.10)" },
    description: { tr: "Kişisel verilerin işlenmesi hakkında bilgilendirme", en: "Disclosure on personal data processing" },
    keywords: { tr: ["aydınlatma", "kvkk", "gizlilik", "veri koruma", "md.10", "özel nitelikli", "sağlık verisi"], en: ["privacy", "notice", "kvkk", "disclosure", "data protection"] },
    href: "/aydinlatma",
  },
  {
    id: "legal:terms",
    category: "legal",
    title: { tr: "Kullanım Koşulları", en: "Terms of Use" },
    description: { tr: "Hizmet sözleşmesi, sorumluluklar, kısıtlamalar", en: "Service agreement, responsibilities, limitations" },
    keywords: { tr: ["kullanım", "koşul", "şartlar", "sözleşme", "hizmet"], en: ["terms", "conditions", "service", "agreement"] },
    href: "/terms",
  },
  {
    id: "legal:security",
    category: "legal",
    title: { tr: "Güvenlik", en: "Security" },
    description: { tr: "9 katmanlı güvenlik mimarisi, şifreleme, RLS", en: "9-layer security architecture, encryption, RLS" },
    keywords: { tr: ["güvenlik", "şifreleme", "koruma", "veri güvenliği"], en: ["security", "encryption", "protection"] },
    href: "/security",
  },
  {
    id: "legal:privacy-controls",
    category: "legal",
    title: { tr: "Rıza Ayarları", en: "Consent Settings" },
    description: { tr: "AI işleme, veri aktarımı, SBAR raporu rızaları", en: "AI processing, data transfer, SBAR report consents" },
    keywords: { tr: ["rıza", "onay", "iptal", "geri al", "açık rıza"], en: ["consent", "settings", "withdraw", "revoke"] },
    href: "/privacy-controls",
    authOnly: true,
  },
  {
    id: "legal:mesafeli-satis",
    category: "legal",
    title: { tr: "Mesafeli Satış Sözleşmesi", en: "Distance Sales Contract" },
    description: { tr: "Premium abonelik satış şartları, cayma hakkı", en: "Premium subscription sales terms, right of withdrawal" },
    keywords: { tr: ["mesafeli", "satış", "sözleşme", "cayma", "fatura", "premium"], en: ["distance", "sales", "contract", "withdrawal"] },
    href: "/mesafeli-satis",
  },
  {
    id: "legal:abonelik-sozlesmesi",
    category: "legal",
    title: { tr: "Abonelik Sözleşmesi", en: "Subscription Agreement" },
    description: { tr: "Premium üyelik hakları, ödeme, iptal koşulları", en: "Premium membership rights, payment, cancellation" },
    keywords: { tr: ["abonelik", "sözleşme", "premium", "ödeme", "iptal"], en: ["subscription", "agreement", "payment", "cancellation"] },
    href: "/abonelik-sozlesmesi",
  },

  // ───────────────────── ACTIONS (6) ─────────────────────
  {
    id: "action:ask-ai",
    category: "actions",
    title: { tr: "AI Asistana Soru Sor", en: "Ask the AI Assistant" },
    description: { tr: "Sağlık asistanında yeni sohbet başlat", en: "Start a new chat in the health assistant" },
    keywords: { tr: ["sor", "soru", "ai", "asistan", "chat", "sohbet", "yardım"], en: ["ask", "question", "ai", "assistant", "chat", "help"] },
    href: "/health-assistant",
  },
  {
    id: "action:add-family-history",
    category: "actions",
    title: { tr: "+ Aile Öyküsü Ekle", en: "+ Add Family History" },
    description: { tr: "Akraba hastalık geçmişi ekle (anne, baba, kardeş…)", en: "Add a relative's condition history" },
    keywords: { tr: ["ekle", "aile", "öykü", "geçmiş", "anne", "baba", "kanser", "yeni"], en: ["add", "family", "history", "relative", "new"] },
    // F-PALETTE-001 (Session 45): deep-link with section anchor + auto-open
    // flag. The page consumes both via useSearchParams and strips ?new=true
    // after firing so refresh doesn't re-open the modal.
    href: "/family-health-tree?section=history&new=true",
    authOnly: true,
  },
  {
    id: "action:add-medication",
    category: "actions",
    title: { tr: "+ İlaç Ekle", en: "+ Add Medication" },
    description: { tr: "Profile yeni ilaç tanımla (doz, sıklık)", en: "Add a new medication to your profile" },
    keywords: { tr: ["ilaç", "ekle", "yeni", "doz", "reçete"], en: ["medication", "add", "new", "dose", "prescription"] },
    href: "/profile?section=medications",
    authOnly: true,
  },
  {
    id: "action:check-interaction",
    category: "actions",
    title: { tr: "Etkileşim Kontrol Et", en: "Check Interactions" },
    description: { tr: "İlaç + bitki + takviye kombinasyonunu değerlendir", en: "Evaluate drug + herb + supplement combination" },
    keywords: { tr: ["kontrol", "etkileşim", "çakışma", "denetle"], en: ["check", "interaction", "validate"] },
    href: "/interaction-checker",
  },
  {
    id: "action:upload-blood-test",
    category: "actions",
    title: { tr: "Kan Tahlili Yükle", en: "Upload Blood Test" },
    description: { tr: "PDF veya fotoğraf yükle, yapay zeka yorumlasın", en: "Upload PDF or photo for AI analysis" },
    keywords: { tr: ["kan", "tahlil", "yükle", "pdf", "sonuç", "lab"], en: ["blood", "test", "upload", "pdf", "lab"] },
    href: "/blood-test",
    authOnly: true,
  },
  {
    id: "action:emergency-id",
    category: "actions",
    title: { tr: "Acil Durum Kartım", en: "My Emergency Card" },
    description: { tr: "Kan grubu, alerjiler, acil kontak bilgileri", en: "Blood type, allergies, emergency contacts" },
    keywords: { tr: ["acil", "durum", "kart", "kan grubu", "alerji", "kontak"], en: ["emergency", "card", "blood type", "contact"] },
    href: "/emergency-id",
    authOnly: true,
  },

  // ───────────────────── SETTINGS (6) ─────────────────────
  {
    id: "settings:profile",
    category: "settings",
    title: { tr: "Profil Ayarları", en: "Profile Settings" },
    description: { tr: "Ad, cinsiyet, yaş, yaşam tarzı", en: "Name, gender, age, lifestyle" },
    keywords: { tr: ["profil", "ayar", "kişisel", "bilgi"], en: ["profile", "settings", "personal", "info"] },
    href: "/profile",
    authOnly: true,
  },
  {
    id: "settings:privacy-controls",
    category: "settings",
    title: { tr: "Veri ve Rıza Yönetimi", en: "Data & Consent Management" },
    description: { tr: "Rızaları görüntüle, iptal et, veri indir/sil", en: "View, revoke consents, export/delete data" },
    keywords: { tr: ["veri", "rıza", "iptal", "sil", "indir", "export", "kvkk"], en: ["data", "consent", "revoke", "delete", "export"] },
    href: "/privacy-controls",
    authOnly: true,
  },
  {
    id: "settings:premium",
    category: "settings",
    title: { tr: "Premium Planlarını İncele", en: "View Premium Plans" },
    description: { tr: "Bireysel ve aile paketleri, fiyatlandırma", en: "Individual and family plans, pricing" },
    keywords: { tr: ["premium", "abonelik", "ücret", "paket", "plan", "upgrade"], en: ["premium", "subscription", "plans", "upgrade"] },
    href: "/pricing",
  },
  {
    id: "settings:language",
    category: "settings",
    title: { tr: "Dil — TR ⇄ EN Değiştir", en: "Language — Toggle TR ⇄ EN" },
    description: { tr: "Arayüz dilini değiştir", en: "Switch interface language" },
    keywords: { tr: ["dil", "türkçe", "ingilizce", "english", "language"], en: ["language", "turkish", "english", "locale"] },
    action: "toggle-language",
  },
  {
    id: "settings:theme",
    category: "settings",
    title: { tr: "Tema — Açık ⇄ Koyu Değiştir", en: "Theme — Toggle Light ⇄ Dark" },
    description: { tr: "Açık/koyu mod arası geçiş", en: "Switch between light and dark mode" },
    keywords: { tr: ["tema", "koyu", "karanlık", "açık", "mod", "dark", "light"], en: ["theme", "dark", "light", "mode"] },
    action: "toggle-theme",
  },
  {
    id: "settings:signout",
    category: "settings",
    title: { tr: "Çıkış Yap", en: "Sign Out" },
    description: { tr: "Oturumu kapat", en: "End your session" },
    keywords: { tr: ["çıkış", "çıkış yap", "oturum", "logout", "signout"], en: ["sign out", "logout", "exit", "quit"] },
    action: "signout",
    authOnly: true,
  },

  // ───────────── PROFILE FIELDS (10) — Session 45 ─────────────
  // Deep links into specific profile sections. Each href uses a hash
  // anchor consumed by app/profile/page.tsx's mount-effect, which
  // smooth-scrolls to the target and flashes a 2 s emerald ring on
  // arrival. Anchor IDs live on the section wrappers (medications,
  // medical-history, allergy-card, vaccines, vucut-olculeri, kan-grubu,
  // takviyelerim, yasam-tarzi, ureme-sagligi). All entries are authOnly.
  {
    id: "profile:body-measurements",
    category: "profile-fields",
    title: { tr: "Vücut Ölçüleri", en: "Body Measurements" },
    description: { tr: "Boy, kilo, BMI bilgilerini düzenle", en: "Edit height, weight, BMI" },
    keywords: { tr: ["boy", "kilo", "yaş", "bmi", "ölçü", "vücut", "kg", "cm"], en: ["height", "weight", "bmi", "age", "body", "measurements"] },
    href: "/profile#vucut-olculeri",
    authOnly: true,
  },
  {
    id: "profile:allergies",
    category: "profile-fields",
    title: { tr: "Alerjilerim", en: "My Allergies" },
    description: { tr: "Alerji listesini düzenle, reaksiyon tipini güncelle", en: "Edit allergy list, update reaction types" },
    keywords: { tr: ["alerji", "alerjilerim", "reaksiyon", "anafilaksi"], en: ["allergy", "allergies", "reaction", "anaphylaxis"] },
    href: "/profile#allergy-card",
    authOnly: true,
  },
  {
    id: "profile:medications",
    category: "profile-fields",
    title: { tr: "İlaçlarım", en: "My Medications" },
    description: { tr: "Aktif ilaçları, dozları, sıklıkları yönet", en: "Manage active medications, doses, frequencies" },
    keywords: { tr: ["ilaç", "ilaçlarım", "ilaclarim", "doz", "reçete", "medication"], en: ["medication", "medications", "drugs", "dose", "prescription"] },
    href: "/profile#medications",
    authOnly: true,
  },
  {
    id: "profile:vaccines",
    category: "profile-fields",
    title: { tr: "Aşı Kayıtlarım", en: "Vaccination Records" },
    description: { tr: "Aşı geçmişi ve takvim", en: "Vaccination history and schedule" },
    keywords: { tr: ["aşı", "aşılar", "asilarim", "asi", "asilar"], en: ["vaccine", "vaccines", "vaccination", "shots", "immunization"] },
    href: "/profile#vaccines",
    authOnly: true,
  },
  {
    id: "profile:blood-group",
    category: "profile-fields",
    title: { tr: "Kan Grubu", en: "Blood Type" },
    description: { tr: "Kan grubunu seç ve epidemiyolojik içgörüyü gör", en: "Select blood type and view epidemiological insight" },
    keywords: { tr: ["kan grubu", "kan", "rh"], en: ["blood", "blood type", "blood group", "rh"] },
    href: "/profile#kan-grubu",
    authOnly: true,
  },
  {
    id: "profile:chronic-conditions",
    category: "profile-fields",
    title: { tr: "Kronik Hastalıklar", en: "Chronic Conditions" },
    description: { tr: "Kalp, diyabet, tiroid, astım gibi kronik tanılar", en: "Cardiac, diabetes, thyroid, asthma and other chronic diagnoses" },
    keywords: { tr: ["kronik", "hastalık", "tanı", "diyabet", "hipertansiyon", "astım", "tiroid"], en: ["chronic", "condition", "diagnosis", "diabetes", "hypertension", "asthma", "thyroid"] },
    href: "/profile#medical-history",
    authOnly: true,
  },
  {
    id: "profile:surgery",
    category: "profile-fields",
    title: { tr: "Cerrahi Geçmiş", en: "Surgical History" },
    description: { tr: "Geçirilmiş ameliyatları kaydet (bariatrik, vb.)", en: "Record past surgeries (bariatric, etc.)" },
    keywords: { tr: ["cerrahi", "ameliyat", "operasyon", "bariatrik"], en: ["surgery", "surgical", "operation", "bariatric"] },
    href: "/profile#medical-history",
    authOnly: true,
  },
  {
    id: "profile:supplements",
    category: "profile-fields",
    title: { tr: "Takviyelerim", en: "My Supplements" },
    description: { tr: "Vitamin, mineral, bitkisel takviyeler", en: "Vitamins, minerals, herbal supplements" },
    keywords: { tr: ["takviye", "takviyelerim", "vitamin", "mineral", "bitkisel"], en: ["supplement", "supplements", "vitamin", "mineral", "herbal"] },
    href: "/profile#takviyelerim",
    authOnly: true,
  },
  {
    id: "profile:lifestyle",
    category: "profile-fields",
    title: { tr: "Yaşam Tarzı", en: "Lifestyle" },
    description: { tr: "Sigara, alkol, diyet, egzersiz, uyku", en: "Smoking, alcohol, diet, exercise, sleep" },
    keywords: { tr: ["yaşam", "tarz", "sigara", "alkol", "diyet", "egzersiz", "uyku"], en: ["lifestyle", "smoking", "alcohol", "diet", "exercise", "sleep"] },
    href: "/profile#yasam-tarzi",
    authOnly: true,
  },
  {
    id: "profile:reproductive-health",
    category: "profile-fields",
    title: { tr: "Üreme Sağlığı", en: "Reproductive Health" },
    description: { tr: "Hamilelik, emzirme durumu (kadın profil)", en: "Pregnancy, breastfeeding status (female profile)" },
    keywords: { tr: ["hamilelik", "emzirme", "üreme", "gebelik"], en: ["pregnancy", "breastfeeding", "reproductive", "gestation"] },
    href: "/profile#ureme-sagligi",
    authOnly: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// SEARCH HELPERS
// ═══════════════════════════════════════════════════════════════════════

export interface PaletteSearchContext {
  lang: "tr" | "en";
  isAuthenticated: boolean;
  isPremium: boolean;
}

/**
 * Filter registry entries by visibility flags (auth / premium / guest).
 * Does NOT filter by query — callers do that via matchPaletteEntry().
 */
export function visibleEntries(ctx: PaletteSearchContext): PaletteEntry[] {
  return PALETTE_REGISTRY.filter((e) => {
    if (e.authOnly && !ctx.isAuthenticated) return false;
    if (e.guestOnly && ctx.isAuthenticated) return false;
    if (e.premium && !ctx.isPremium) return false;
    return true;
  });
}

/**
 * Lowercase substring match on title + description + keywords.
 *
 * Session 39/40 hotfix: keywords are now searched in BOTH languages so users
 * can type in either TR or EN regardless of active UI locale
 * (e.g. UI in TR + query "privacy" → matches legal:aydinlatma via EN
 * keywords; UI in EN + query "takvim" → matches page:calendar via TR
 * keywords). Title and description remain active-language only since
 * those are what the UI renders.
 */
export function matchPaletteEntry(entry: PaletteEntry, query: string, lang: "tr" | "en"): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  const title = entry.title[lang].toLowerCase();
  if (title.includes(q)) return true;
  const desc = entry.description?.[lang]?.toLowerCase();
  if (desc && desc.includes(q)) return true;
  const allKeywords = [...entry.keywords.tr, ...entry.keywords.en];
  return allKeywords.some((kw) => kw.toLowerCase().includes(q));
}

export const PALETTE_CATEGORY_LABELS: Record<PaletteCategory, { tr: string; en: string }> = {
  pages: { tr: "Sayfalar", en: "Pages" },
  legal: { tr: "Yasal", en: "Legal" },
  actions: { tr: "Hızlı Aksiyonlar", en: "Quick Actions" },
  settings: { tr: "Ayarlar", en: "Settings" },
  "profile-fields": { tr: "Profil Alanları", en: "Profile Fields" },
};
