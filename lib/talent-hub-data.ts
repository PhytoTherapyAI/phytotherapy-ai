// ============================================
// Healthcare Talent Hub — Data Schema & Constants
// ============================================

export interface ProfessionalProfile {
  id: string
  userId: string
  // Step 1: Personal & Contact
  fullName: string
  title: string // Dr., Ecz., Dyt., Prof.Dr., Doç.Dr. etc.
  email: string
  phone: string
  city: string
  country: string
  avatarUrl?: string
  linkedinUrl?: string
  bio: { en: string; tr: string }
  // Step 2: Specialty & Academic
  profession: string // "physician" | "pharmacist" | "dietitian" | "psychologist" | "nurse" | "physiotherapist" | "other"
  specialty: string // e.g. "Internal Medicine", "Dermatology"
  subspecialty?: string
  academicTitle: string // "None" | "MD" | "PhD" | "Assoc.Prof" | "Prof"
  licenseNumber?: string
  institutionCurrent: string
  // Step 3: Experience & Education
  experienceYears: number
  education: { institution: string; degree: string; field: string; year: number }[]
  positions: { institution: string; role: string; startYear: number; endYear?: number; current: boolean }[]
  publications?: number
  languages: string[]
  // Step 4: Skills & Certifications
  skills: string[]
  certifications: { name: string; issuer: string; year: number }[]
  specialInterests: string[]
  // Meta
  isVerified: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

// ── Profession Options ──
export const PROFESSIONS = [
  { id: "physician", label: { en: "Physician (MD)", tr: "Hekim (Tıp Doktoru)" }, icon: "Stethoscope" },
  { id: "pharmacist", label: { en: "Pharmacist", tr: "Eczacı" }, icon: "Pill" },
  { id: "dietitian", label: { en: "Dietitian / Nutritionist", tr: "Diyetisyen / Beslenme Uzmanı" }, icon: "Apple" },
  { id: "psychologist", label: { en: "Psychologist", tr: "Psikolog" }, icon: "Brain" },
  { id: "psychiatrist", label: { en: "Psychiatrist", tr: "Psikiyatrist" }, icon: "Brain" },
  { id: "nurse", label: { en: "Nurse", tr: "Hemşire" }, icon: "Heart" },
  { id: "physiotherapist", label: { en: "Physiotherapist", tr: "Fizyoterapist" }, icon: "Activity" },
  { id: "dentist", label: { en: "Dentist", tr: "Diş Hekimi" }, icon: "Smile" },
  { id: "midwife", label: { en: "Midwife", tr: "Ebe" }, icon: "Baby" },
  { id: "other", label: { en: "Other Health Professional", tr: "Diğer Sağlık Profesyoneli" }, icon: "UserPlus" },
]

// ── Specialty Options ──
export const SPECIALTIES = [
  { id: "internal_medicine", label: { en: "Internal Medicine", tr: "İç Hastalıkları" } },
  { id: "family_medicine", label: { en: "Family Medicine", tr: "Aile Hekimliği" } },
  { id: "cardiology", label: { en: "Cardiology", tr: "Kardiyoloji" } },
  { id: "endocrinology", label: { en: "Endocrinology", tr: "Endokrinoloji" } },
  { id: "neurology", label: { en: "Neurology", tr: "Nöroloji" } },
  { id: "psychiatry", label: { en: "Psychiatry", tr: "Psikiyatri" } },
  { id: "dermatology", label: { en: "Dermatology", tr: "Dermatoloji" } },
  { id: "pediatrics", label: { en: "Pediatrics", tr: "Pediatri" } },
  { id: "obstetrics", label: { en: "Obstetrics & Gynecology", tr: "Kadın Hastalıkları ve Doğum" } },
  { id: "oncology", label: { en: "Oncology", tr: "Onkoloji" } },
  { id: "nephrology", label: { en: "Nephrology", tr: "Nefroloji" } },
  { id: "pulmonology", label: { en: "Pulmonology", tr: "Göğüs Hastalıkları" } },
  { id: "gastroenterology", label: { en: "Gastroenterology", tr: "Gastroenteroloji" } },
  { id: "rheumatology", label: { en: "Rheumatology", tr: "Romatoloji" } },
  { id: "sports_medicine", label: { en: "Sports Medicine", tr: "Spor Hekimliği" } },
  { id: "clinical_pharmacy", label: { en: "Clinical Pharmacy", tr: "Klinik Eczacılık" } },
  { id: "clinical_nutrition", label: { en: "Clinical Nutrition", tr: "Klinik Beslenme" } },
  { id: "clinical_psychology", label: { en: "Clinical Psychology", tr: "Klinik Psikoloji" } },
  { id: "physical_therapy", label: { en: "Physical Therapy", tr: "Fizik Tedavi" } },
  { id: "other", label: { en: "Other", tr: "Diğer" } },
]

// ── Academic Titles ──
export const ACADEMIC_TITLES = [
  { id: "none", label: { en: "No Academic Title", tr: "Akademik Ünvan Yok" } },
  { id: "md", label: { en: "MD", tr: "Uzm. Dr." } },
  { id: "phd", label: { en: "PhD", tr: "Dr. (PhD)" } },
  { id: "md_phd", label: { en: "MD, PhD", tr: "Uzm. Dr., PhD" } },
  { id: "assoc_prof", label: { en: "Associate Professor", tr: "Doç. Dr." } },
  { id: "professor", label: { en: "Professor", tr: "Prof. Dr." } },
]

// ── Skill Tags ──
export const SKILL_TAGS = [
  // Integrative Medicine
  { id: "phytotherapy", label: { en: "Phytotherapy", tr: "Fitoterapi" }, category: "integrative" },
  { id: "acupuncture", label: { en: "Acupuncture", tr: "Akupunktur" }, category: "integrative" },
  { id: "homeopathy", label: { en: "Homeopathy", tr: "Homeopati" }, category: "integrative" },
  { id: "aromatherapy", label: { en: "Aromatherapy", tr: "Aromaterapi" }, category: "integrative" },
  { id: "functional_medicine", label: { en: "Functional Medicine", tr: "Fonksiyonel Tıp" }, category: "integrative" },
  { id: "ayurveda", label: { en: "Ayurveda", tr: "Ayurveda" }, category: "integrative" },
  { id: "traditional_chinese", label: { en: "Traditional Chinese Medicine", tr: "Geleneksel Çin Tıbbı" }, category: "integrative" },
  // Clinical Skills
  { id: "drug_interactions", label: { en: "Drug-Herb Interactions", tr: "İlaç-Bitki Etkileşimleri" }, category: "clinical" },
  { id: "clinical_nutrition", label: { en: "Clinical Nutrition", tr: "Klinik Beslenme" }, category: "clinical" },
  { id: "chronic_disease", label: { en: "Chronic Disease Management", tr: "Kronik Hastalık Yönetimi" }, category: "clinical" },
  { id: "diabetes_management", label: { en: "Diabetes Management", tr: "Diyabet Yönetimi" }, category: "clinical" },
  { id: "cardiovascular", label: { en: "Cardiovascular Health", tr: "Kardiyovasküler Sağlık" }, category: "clinical" },
  { id: "mental_health", label: { en: "Mental Health", tr: "Mental Sağlık" }, category: "clinical" },
  { id: "pediatric_nutrition", label: { en: "Pediatric Nutrition", tr: "Pediatrik Beslenme" }, category: "clinical" },
  { id: "geriatric_care", label: { en: "Geriatric Care", tr: "Geriatrik Bakım" }, category: "clinical" },
  { id: "womens_health", label: { en: "Women's Health", tr: "Kadın Sağlığı" }, category: "clinical" },
  // Research & Tech
  { id: "clinical_research", label: { en: "Clinical Research", tr: "Klinik Araştırma" }, category: "research" },
  { id: "pubmed_literacy", label: { en: "PubMed / Evidence Analysis", tr: "PubMed / Kanıt Analizi" }, category: "research" },
  { id: "health_tech", label: { en: "Health Technology", tr: "Sağlık Teknolojisi" }, category: "research" },
  { id: "telemedicine", label: { en: "Telemedicine", tr: "Telemedisin" }, category: "research" },
  { id: "ai_health", label: { en: "AI in Healthcare", tr: "Sağlıkta Yapay Zeka" }, category: "research" },
]

export const SKILL_CATEGORIES = [
  { id: "integrative", label: { en: "Integrative Medicine", tr: "Bütünleştirici Tıp" } },
  { id: "clinical", label: { en: "Clinical Skills", tr: "Klinik Beceriler" } },
  { id: "research", label: { en: "Research & Technology", tr: "Araştırma & Teknoloji" } },
]

export const LANGUAGES = [
  { id: "tr", label: { en: "Turkish", tr: "Türkçe" } },
  { id: "en", label: { en: "English", tr: "İngilizce" } },
  { id: "ar", label: { en: "Arabic", tr: "Arapça" } },
  { id: "de", label: { en: "German", tr: "Almanca" } },
  { id: "fr", label: { en: "French", tr: "Fransızca" } },
  { id: "ru", label: { en: "Russian", tr: "Rusça" } },
  { id: "es", label: { en: "Spanish", tr: "İspanyolca" } },
  { id: "fa", label: { en: "Persian", tr: "Farsça" } },
]

// ── Mock Data ──
export const MOCK_PROFILES: Partial<ProfessionalProfile>[] = [
  {
    id: "1", fullName: "Prof. Dr. Ayşe Kara", title: "Prof.Dr.", profession: "physician",
    specialty: "endocrinology", academicTitle: "professor", city: "Istanbul", country: "Turkey",
    experienceYears: 22, institutionCurrent: "Istanbul University Faculty of Medicine",
    skills: ["phytotherapy", "diabetes_management", "clinical_research", "drug_interactions"],
    certifications: [{ name: "Phytotherapy Certificate", issuer: "TTB", year: 2019 }],
    languages: ["tr", "en", "de"], isVerified: true, isPublic: true,
    bio: { en: "Endocrinologist specializing in integrative diabetes management with 22 years of experience.", tr: "22 yıllık deneyimle bütünleştirici diyabet yönetiminde uzmanlaşmış endokrinolog." },
  },
  {
    id: "2", fullName: "Ecz. Mehmet Demir", title: "Ecz.", profession: "pharmacist",
    specialty: "clinical_pharmacy", academicTitle: "phd", city: "Ankara", country: "Turkey",
    experienceYears: 12, institutionCurrent: "Hacettepe University Pharmacy",
    skills: ["drug_interactions", "phytotherapy", "functional_medicine", "pubmed_literacy"],
    certifications: [{ name: "Clinical Pharmacy Residency", issuer: "Hacettepe University", year: 2018 }],
    languages: ["tr", "en"], isVerified: true, isPublic: true,
    bio: { en: "Clinical pharmacist focused on drug-herb interactions and evidence-based phytotherapy.", tr: "İlaç-bitki etkileşimleri ve kanıta dayalı fitoterapiye odaklanan klinik eczacı." },
  },
  {
    id: "3", fullName: "Dyt. Zeynep Aydın", title: "Dyt.", profession: "dietitian",
    specialty: "clinical_nutrition", academicTitle: "md", city: "Izmir", country: "Turkey",
    experienceYears: 8, institutionCurrent: "Ege University Hospital",
    skills: ["clinical_nutrition", "chronic_disease", "pediatric_nutrition", "womens_health"],
    certifications: [{ name: "Sports Nutrition Certificate", issuer: "ISSN", year: 2021 }],
    languages: ["tr", "en"], isVerified: false, isPublic: true,
    bio: { en: "Clinical dietitian with expertise in chronic disease nutrition and pediatric care.", tr: "Kronik hastalık beslenme ve pediatrik bakım konusunda uzman klinik diyetisyen." },
  },
]
