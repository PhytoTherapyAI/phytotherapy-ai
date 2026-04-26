// © 2026 DoctoPal — All Rights Reserved
//
// Sidebar content: profile header (avatar/name) + nav list. Container
// agnostic — the parent (ProfileShellV2) wraps it in a desktop sticky
// <aside> for ≥md viewports OR in a MobileDrawer for <md viewports.
// Either way the JSX rendered here is identical.
//
// Reproductive tab is gender-gated — rendered only when profile.gender
// is NOT 'male'. Everything else is always visible (auth gate lives at
// the page level, not per-tab here).
//
// F-MOBILE-001: removed the legacy "<lg accordion mobile fallback".
// The mobile pattern is now the slide-in drawer — see ProfileShellV2
// for the wiring.
"use client"

import {
  User, Heart, Stethoscope, Pill, Leaf, AlertTriangle,
  Syringe, Users, Baby, FileText, Shield,
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

/**
 * Look up the visible tab definition for a given id, applying the
 * same gating rules as the sidebar. Used by the parent shell to
 * render the active tab's icon + label inside the mobile hamburger
 * trigger without duplicating the tab metadata.
 */
export function resolveActiveTab(
  id: ProfileTabId,
  gender: string | null,
): { icon: LucideIcon; label: { tr: string; en: string } } {
  const visible = TABS.filter((t) => !t.gate || t.gate({ gender }))
  const found = visible.find((t) => t.id === id) ?? visible[0]
  return { icon: found.icon, label: found.label }
}

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
  const tabs = TABS.filter((t) => !t.gate || t.gate({ gender }))

  return (
    <div>
      {header}
      <nav
        className="mt-4 space-y-1"
        aria-label={lang === "tr" ? "Profil bölümleri" : "Profile sections"}
      >
        {tabs.map((t) => (
          <SidebarItem
            key={t.id}
            icon={t.icon}
            label={t.label[lang]}
            active={t.id === activeTab}
            onClick={() => onSelect(t.id)}
          />
        ))}
      </nav>
    </div>
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
