// © 2026 DoctoPal — All Rights Reserved
//
// Left-sticky sidebar (≥lg) + mobile collapsible button list (<lg). Each
// entry is a lucide-icon + label + active-tab emerald vurgu pair.
//
// Reproductive tab is gender-gated — rendered only when profile.gender is
// NOT 'male'. Everything else is always visible (auth gate lives on the
// page level, not per-tab here).
"use client"

import { useState } from "react"
import {
  User, Heart, Stethoscope, Pill, Leaf, AlertTriangle,
  Syringe, Users, Baby, FileText, Shield, ChevronDown,
  type LucideIcon,
} from "lucide-react"
import { type ProfileTabId } from "./useProfileTab"

interface TabDef {
  id: ProfileTabId
  icon: LucideIcon
  label: { tr: string; en: string }
  /** Only rendered when gate returns true. Undefined → always rendered. */
  gate?: (ctx: { gender: string | null }) => boolean
}

const TABS: TabDef[] = [
  { id: "genel",          icon: User,            label: { tr: "Genel", en: "General" } },
  { id: "vucut-yasam",    icon: Heart,           label: { tr: "Vücut & Yaşam", en: "Body & Lifestyle" } },
  { id: "tibbi-gecmis",   icon: Stethoscope,     label: { tr: "Tıbbi Geçmiş", en: "Medical History" } },
  { id: "ilaclar",        icon: Pill,            label: { tr: "İlaçlar", en: "Medications" } },
  { id: "takviyeler",     icon: Leaf,            label: { tr: "Takviyeler", en: "Supplements" } },
  { id: "alerjiler",      icon: AlertTriangle,   label: { tr: "Alerjiler", en: "Allergies" } },
  { id: "asilar",         icon: Syringe,         label: { tr: "Aşılar", en: "Vaccines" } },
  { id: "aile-oykusu",    icon: Users,           label: { tr: "Aile Öyküsü", en: "Family History" } },
  { id: "ureme",          icon: Baby,            label: { tr: "Üreme Sağlığı", en: "Reproductive Health" },
                          gate: ({ gender }) => gender !== "male" },
  { id: "saglik-raporu",  icon: FileText,        label: { tr: "Sağlık Raporu", en: "Health Report" } },
  { id: "gizlilik",       icon: Shield,          label: { tr: "Gizlilik & Rıza", en: "Privacy & Consent" } },
]

interface ProfileSidebarProps {
  activeTab: ProfileTabId
  onSelect: (next: ProfileTabId) => void
  lang: "tr" | "en"
  /** Shown at the top of the sidebar above the tab list. */
  header: React.ReactNode
  /** Used to gate `ureme` tab. Pass null if not loaded yet. */
  gender: string | null
}

export function ProfileSidebar({ activeTab, onSelect, lang, header, gender }: ProfileSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const tabs = TABS.filter((t) => !t.gate || t.gate({ gender }))
  const activeTabDef = tabs.find((t) => t.id === activeTab) ?? tabs[0]

  const handleSelect = (id: ProfileTabId) => {
    onSelect(id)
    // Mobile: collapse the list after the user picks a tab.
    setMobileOpen(false)
  }

  return (
    <>
      {/* Desktop / tablet: sticky sidebar. */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-20 self-start">
        {header}
        <nav className="mt-4 space-y-1" aria-label={lang === "tr" ? "Profil bölümleri" : "Profile sections"}>
          {tabs.map((t) => (
            <SidebarItem
              key={t.id}
              icon={t.icon}
              label={t.label[lang]}
              active={t.id === activeTab}
              onClick={() => handleSelect(t.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile: collapsible button at the top — shows current tab +
          chevron; click expands the list; selecting a tab collapses again.
          Custom (not <details>) because the chevron rotation + list
          height transition is smoother this way. */}
      <div className="lg:hidden mb-4">
        {header}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="mt-3 w-full inline-flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm"
          aria-expanded={mobileOpen}
        >
          <span className="inline-flex items-center gap-2">
            <activeTabDef.icon className="h-4 w-4 text-emerald-600" />
            {activeTabDef.label[lang]}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
            mobileOpen ? "max-h-[700px] opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="space-y-1 rounded-xl border border-border bg-card p-2" aria-label={lang === "tr" ? "Profil bölümleri" : "Profile sections"}>
            {tabs.map((t) => (
              <SidebarItem
                key={t.id}
                icon={t.icon}
                label={t.label[lang]}
                active={t.id === activeTab}
                onClick={() => handleSelect(t.id)}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group w-full inline-flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-foreground"
        }`}
      />
      <span className="truncate">{label}</span>
    </button>
  )
}
