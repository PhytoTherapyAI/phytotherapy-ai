// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  PROFESSIONS, SPECIALTIES, ACADEMIC_TITLES, SKILL_TAGS, SKILL_CATEGORIES,
  LANGUAGES, MOCK_PROFILES, type ProfessionalProfile,
} from "@/lib/talent-hub-data"
import {
  Users, Search, Plus, ChevronRight, ChevronLeft, Check, MapPin,
  Briefcase, GraduationCap, Award, Star, Shield, BadgeCheck, Building2,
  Globe, BookOpen, Stethoscope, Pill, Brain, Apple, Heart, Activity,
  UserPlus, Smile, Baby, X,
} from "lucide-react"
import { tx } from "@/lib/translations"

const ICON_MAP: Record<string, any> = { Stethoscope, Pill, Brain, Apple, Heart, Activity, UserPlus, Smile, Baby }

const STEPS = [
  { id: 1, label: { en: "Personal Info", tr: "Kişisel Bilgiler" }, icon: Users },
  { id: 2, label: { en: "Specialty", tr: "Uzmanlık" }, icon: Briefcase },
  { id: 3, label: { en: "Experience", tr: "Deneyim" }, icon: GraduationCap },
  { id: 4, label: { en: "Skills", tr: "Yetenekler" }, icon: Award },
]

interface FormData {
  fullName: string; title: string; email: string; phone: string; city: string; bio: string
  profession: string; specialty: string; academicTitle: string; licenseNumber: string; institution: string
  experienceYears: number; languages: string[]
  education: { institution: string; degree: string; field: string; year: string }[]
  skills: string[]; certifications: { name: string; issuer: string; year: string }[]
}

const INITIAL_FORM: FormData = {
  fullName: "", title: "", email: "", phone: "", city: "", bio: "",
  profession: "", specialty: "", academicTitle: "none", licenseNumber: "", institution: "",
  experienceYears: 0, languages: [],
  education: [{ institution: "", degree: "", field: "", year: "" }],
  skills: [], certifications: [{ name: "", issuer: "", year: "" }],
}

export default function TalentHubPage() {
  const { lang } = useLang()
  const [view, setView] = useState<"browse" | "create">("browse")
  const [search, setSearch] = useState("")
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({ ...INITIAL_FORM })
  const [submitted, setSubmitted] = useState(false)

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Healthcare Talent Hub", tr: "Sağlık Profesyonelleri Yetenek Ağı" },
      subtitle: { en: "Connect with verified health professionals specializing in integrative medicine", tr: "Bütünleştirici tıp alanında uzmanlaşmış doğrulanmış sağlık profesyonelleriyle bağlantı kurun" },
      browse: { en: "Browse Professionals", tr: "Profesyonelleri Gözat" },
      create: { en: "Create Your Profile", tr: "Profilini Oluştur" },
      next: { en: "Next Step", tr: "Sonraki Adım" },
      back: { en: "Back", tr: "Geri" },
      submit: { en: "Submit Profile", tr: "Profili Gönder" },
      search: { en: "Search by name, specialty, or skill...", tr: "İsim, uzmanlık veya yetenek ile ara..." },
      years_exp: { en: "years experience", tr: "yıl deneyim" },
      verified: { en: "Verified", tr: "Doğrulanmış" },
      view_profile: { en: "View Profile", tr: "Profili Gör" },
      success: { en: "Profile submitted for review!", tr: "Profil inceleme için gönderildi!" },
      success_msg: { en: "Our team will verify your credentials within 48 hours.", tr: "Ekibimiz belgelerinizi 48 saat içinde doğrulayacaktır." },
    }
    return map[key]?.[lang] || key
  }

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))
  const toggleSkill = (skillId: string) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId) ? prev.skills.filter(s => s !== skillId) : [...prev.skills, skillId],
    }))
  }
  const toggleLanguage = (langId: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(langId) ? prev.languages.filter(l => l !== langId) : [...prev.languages, langId],
    }))
  }

  // ── Profile Card Component ──
  const ProfileCard = ({ profile }: { profile: Partial<ProfessionalProfile> }) => {
    const profData = PROFESSIONS.find(p => p.id === profile.profession)
    const specData = SPECIALTIES.find(s => s.id === profile.specialty)
    return (
      <Card className="p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
            {profile.fullName?.charAt(0)}{profile.fullName?.split(" ").pop()?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{profile.fullName}</h3>
              {profile.isVerified && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px] gap-0.5">
                  <BadgeCheck className="w-3 h-3" />{t("verified")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {specData?.label[lang as "en" | "tr"]} · {profData?.label[lang as "en" | "tr"]}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {profile.bio?.[lang as "en" | "tr"]}
            </p>
            {/* Skills */}
            <div className="flex flex-wrap gap-1 mt-3">
              {profile.skills?.slice(0, 4).map(skillId => {
                const skill = SKILL_TAGS.find(s => s.id === skillId)
                return skill ? (
                  <Badge key={skillId} variant="outline" className="text-[10px]">
                    {skill.label[lang as "en" | "tr"]}
                  </Badge>
                ) : null
              })}
              {(profile.skills?.length || 0) > 4 && (
                <Badge variant="outline" className="text-[10px]">+{(profile.skills?.length || 0) - 4}</Badge>
              )}
            </div>
            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.city}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{profile.experienceYears} {t("years_exp")}</span>
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{profile.languages?.length} {tx("talent.languages", lang)}</span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t("success")}</h2>
          <p className="text-muted-foreground mb-6">{t("success_msg")}</p>
          <Button onClick={() => { setView("browse"); setSubmitted(false) }}>{t("browse")}</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{t("subtitle")}</p>
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{tx("talent.sampleData", lang)}</span>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3 justify-center mb-8">
          <Button variant={view === "browse" ? "default" : "outline"} onClick={() => setView("browse")}>
            <Search className="w-4 h-4 mr-2" />{t("browse")}
          </Button>
          <Button variant={view === "create" ? "default" : "outline"} onClick={() => { setView("create"); setStep(1) }}>
            <Plus className="w-4 h-4 mr-2" />{t("create")}
          </Button>
        </div>

        {/* ═══ BROWSE VIEW ═══ */}
        {view === "browse" && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10 h-11 rounded-xl" placeholder={t("search")} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="space-y-4">
              {MOCK_PROFILES.filter(p => {
                if (!search) return true
                const q = search.toLowerCase()
                return p.fullName?.toLowerCase().includes(q) || p.specialty?.toLowerCase().includes(q) ||
                  p.skills?.some(s => s.toLowerCase().includes(q))
              }).length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">{tx("talent.noProfessionals", lang)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{tx("talent.beFirst", lang)}</p>
                </Card>
              ) : (
                MOCK_PROFILES.filter(p => {
                  if (!search) return true
                  const q = search.toLowerCase()
                  return p.fullName?.toLowerCase().includes(q) || p.specialty?.toLowerCase().includes(q) ||
                    p.skills?.some(s => s.toLowerCase().includes(q))
                }).map(p => <ProfileCard key={p.id} profile={p} />)
              )}
            </div>
          </>
        )}

        {/* ═══ CREATE VIEW — MULTI-STEP WIZARD ═══ */}
        {view === "create" && (
          <div className="max-w-2xl mx-auto">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const isActive = step === s.id
                const isDone = step > s.id
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className={`flex items-center gap-2 ${isActive ? "text-primary" : isDone ? "text-green-500" : "text-muted-foreground"}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-green-500 text-white" : "bg-muted"
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-medium hidden sm:block">{s.label[lang as "en" | "tr"]}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-green-500" : "bg-muted"}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-muted rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
            </div>

            {/* ── Step 1: Personal ── */}
            {step === 1 && (
              <Card className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">{tx("talent.personalInfo", lang)}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-medium mb-1 block">{tx("talent.fullName", lang)} *</label>
                    <Input value={form.fullName} onChange={e => updateForm("fullName", e.target.value)} placeholder="Dr. Ayşe Kara" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-medium mb-1 block">{tx("talent.titleLabel", lang)}</label>
                    <Input value={form.title} onChange={e => updateForm("title", e.target.value)} placeholder="Prof. Dr. / Ecz. / Dyt." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{tx("talent.email", lang)} *</label>
                    <Input type="email" value={form.email} onChange={e => updateForm("email", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{tx("talent.phone", lang)}</label>
                    <Input value={form.phone} onChange={e => updateForm("phone", e.target.value)} placeholder="+90 5XX XXX XXXX" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{tx("talent.city", lang)} *</label>
                  <Input value={form.city} onChange={e => updateForm("city", e.target.value)} placeholder="Istanbul" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{tx("talent.shortBio", lang)}</label>
                  <Textarea value={form.bio} onChange={e => updateForm("bio", e.target.value)} rows={3}
                    placeholder={tx("talent.bioPlaceholder", lang)} />
                </div>
              </Card>
            )}

            {/* ── Step 2: Specialty ── */}
            {step === 2 && (
              <Card className="p-6 space-y-5">
                <h2 className="text-lg font-semibold">{tx("talent.specialtyTitle", lang)}</h2>
                <div>
                  <label className="text-sm font-medium mb-2 block">{tx("talent.profession", lang)} *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROFESSIONS.map(p => {
                      const Icon = ICON_MAP[p.icon] || Users
                      return (
                        <button key={p.id} onClick={() => updateForm("profession", p.id)}
                          className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all text-sm ${
                            form.profession === p.id ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/30"
                          }`}>
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          {p.label[lang as "en" | "tr"]}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{tx("talent.specialty", lang)} *</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {SPECIALTIES.map(s => (
                      <button key={s.id} onClick={() => updateForm("specialty", s.id)}
                        className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                          form.specialty === s.id ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/30"
                        }`}>
                        {s.label[lang as "en" | "tr"]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{tx("talent.academicTitle", lang)}</label>
                    <div className="space-y-1">
                      {ACADEMIC_TITLES.map(at => (
                        <button key={at.id} onClick={() => updateForm("academicTitle", at.id)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                            form.academicTitle === at.id ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/30"
                          }`}>
                          {at.label[lang as "en" | "tr"]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{tx("talent.licenseNumber", lang)}</label>
                    <Input value={form.licenseNumber} onChange={e => updateForm("licenseNumber", e.target.value)} />
                    <label className="text-sm font-medium mb-1 mt-4 block">{tx("talent.institution", lang)}</label>
                    <Input value={form.institution} onChange={e => updateForm("institution", e.target.value)} />
                  </div>
                </div>
              </Card>
            )}

            {/* ── Step 3: Experience ── */}
            {step === 3 && (
              <Card className="p-6 space-y-5">
                <h2 className="text-lg font-semibold">{tx("talent.experienceTitle", lang)}</h2>
                <div>
                  <label className="text-sm font-medium mb-1 block">{tx("talent.totalExperience", lang)}</label>
                  <Input type="number" min={0} max={60} value={form.experienceYears || ""} onChange={e => updateForm("experienceYears", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{tx("talent.education", lang)}</label>
                  {form.education.map((edu, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                      <Input className="col-span-2" placeholder={tx("talent.institutionPlaceholder", lang)} value={edu.institution}
                        onChange={e => { const ed = [...form.education]; ed[i] = { ...ed[i], institution: e.target.value }; updateForm("education", ed) }} />
                      <Input placeholder={tx("talent.degree", lang)} value={edu.degree}
                        onChange={e => { const ed = [...form.education]; ed[i] = { ...ed[i], degree: e.target.value }; updateForm("education", ed) }} />
                      <Input placeholder={tx("talent.year", lang)} value={edu.year}
                        onChange={e => { const ed = [...form.education]; ed[i] = { ...ed[i], year: e.target.value }; updateForm("education", ed) }} />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => updateForm("education", [...form.education, { institution: "", degree: "", field: "", year: "" }])}>
                    <Plus className="w-3 h-3 mr-1" />{tx("talent.addEducation", lang)}
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{tx("talent.languagesLabel", lang)}</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l.id} onClick={() => toggleLanguage(l.id)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          form.languages.includes(l.id) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"
                        }`}>
                        {l.label[lang as "en" | "tr"]}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* ── Step 4: Skills ── */}
            {step === 4 && (
              <Card className="p-6 space-y-5">
                <h2 className="text-lg font-semibold">{tx("talent.skillsTitle", lang)}</h2>
                {SKILL_CATEGORIES.map(cat => (
                  <div key={cat.id}>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{cat.label[lang as "en" | "tr"]}</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_TAGS.filter(s => s.category === cat.id).map(skill => (
                        <button key={skill.id} onClick={() => toggleSkill(skill.id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                            form.skills.includes(skill.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary/30 hover:bg-primary/5"
                          }`}>
                          {form.skills.includes(skill.id) && <Check className="w-3 h-3 inline mr-1" />}
                          {skill.label[lang as "en" | "tr"]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium mb-2 block">{tx("talent.certifications", lang)}</label>
                  {form.certifications.map((cert, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                      <Input placeholder={tx("talent.certName", lang)} value={cert.name}
                        onChange={e => { const c = [...form.certifications]; c[i] = { ...c[i], name: e.target.value }; updateForm("certifications", c) }} />
                      <Input placeholder={tx("talent.certIssuer", lang)} value={cert.issuer}
                        onChange={e => { const c = [...form.certifications]; c[i] = { ...c[i], issuer: e.target.value }; updateForm("certifications", c) }} />
                      <Input placeholder={tx("talent.year", lang)} value={cert.year}
                        onChange={e => { const c = [...form.certifications]; c[i] = { ...c[i], year: e.target.value }; updateForm("certifications", c) }} />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => updateForm("certifications", [...form.certifications, { name: "", issuer: "", year: "" }])}>
                    <Plus className="w-3 h-3 mr-1" />{tx("talent.addCertificate", lang)}
                  </Button>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" />{t("back")}
              </Button>
              {step < 4 ? (
                <Button onClick={() => setStep(s => Math.min(4, s + 1))}>
                  {t("next")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={() => setSubmitted(true)} className="bg-green-600 hover:bg-green-700 text-white">
                  <Check className="w-4 h-4 mr-1" />{t("submit")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
