// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Phone, Shield, Heart, Stethoscope, Users, User, Star,
  ChevronDown, ChevronUp, Plus, AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { tx, type Lang } from "@/lib/translations"

interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phoneNumber: string
  isPrimary: boolean
  priority: number
}

const REL_ICONS: Record<string, any> = {
  spouse: Heart, parent: Users, child: User, sibling: Users,
  doctor: Stethoscope, friend: User, other: User,
}

const REL_LABELS: Record<string, Record<string, string>> = {
  spouse: { en: "Spouse", tr: "Eş" },
  parent: { en: "Parent", tr: "Anne/Baba" },
  child: { en: "Child", tr: "Çocuk" },
  sibling: { en: "Sibling", tr: "Kardeş" },
  doctor: { en: "Doctor", tr: "Doktor" },
  friend: { en: "Friend", tr: "Arkadaş" },
  other: { en: "Other", tr: "Diğer" },
}

interface SOSCardProps {
  userId?: string
  lang?: string
  compact?: boolean
}

export function SOSCard({ userId, lang = "en", compact = false }: SOSCardProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    try {
      const data = localStorage.getItem(`emergency_contacts_${userId || "guest"}`)
      if (data) setContacts(JSON.parse(data))
    } catch { /* corrupted localStorage */ }
  }, [userId])

  const primary = contacts.find(c => c.isPrimary) || contacts[0]
  const others = contacts.filter(c => c.id !== primary?.id)

  if (contacts.length === 0) {
    return (
      <Link href="/emergency-contacts">
        <Card className="p-4 border-dashed border-red-300 dark:border-red-800 hover:border-red-400 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {tx("sos.addContact", lang as Lang)}
              </p>
              <p className="text-xs text-muted-foreground">
                {tx("sos.quickAccess", lang as Lang)}
              </p>
            </div>
            <Plus className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
        </Card>
      </Link>
    )
  }

  if (compact) {
    // Minimal version: just primary contact call button
    return (
      <a href={`tel:${primary?.phoneNumber}`}>
        <Card className="p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">{primary?.name}</p>
              <p className="text-[11px] text-muted-foreground">{REL_LABELS[primary?.relationship || "other"]?.[lang]}</p>
            </div>
            <Badge className="ml-auto bg-red-500/10 text-red-600 border-red-500/30 text-[10px]">SOS</Badge>
          </div>
        </Card>
      </a>
    )
  }

  // Full SOS card with expandable contact list
  return (
    <Card className="overflow-hidden border-red-200 dark:border-red-800">
      {/* Header — soft gradient, not scary */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-amber-950/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {tx("sos.emergency", lang as Lang)}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {contacts.length} {tx("sos.contactsSaved", lang as Lang)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="tel:112">
              <Button size="sm" className="h-8 gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs">
                <Phone className="w-3.5 h-3.5" /> 112
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Primary contact — always visible */}
      {primary && (
        <a href={`tel:${primary.phoneNumber}`} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border">
          <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
            {(() => { const Icon = REL_ICONS[primary.relationship] || User; return <Icon className="w-4 h-4 text-red-600" /> })()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{primary.name}</span>
              <Badge className="bg-red-500/10 text-red-600 text-[9px] gap-0.5">
                <Star className="w-2 h-2" />{tx("sos.primary", lang as Lang)}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{REL_LABELS[primary.relationship]?.[lang]} · {primary.phoneNumber}</span>
          </div>
          <Phone className="w-4 h-4 text-green-600" />
        </a>
      )}

      {/* Other contacts — expandable */}
      {others.length > 0 && (
        <>
          <button onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {others.length} {tx("sos.moreContacts", lang as Lang)}
          </button>
          {expanded && (
            <div className="border-t border-border">
              {others.map(contact => {
                const Icon = REL_ICONS[contact.relationship] || User
                return (
                  <a key={contact.id} href={`tel:${contact.phoneNumber}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm">{contact.name}</span>
                      <span className="text-xs text-muted-foreground block">{REL_LABELS[contact.relationship]?.[lang]}</span>
                    </div>
                    <Phone className="w-3.5 h-3.5 text-green-600" />
                  </a>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Footer link */}
      <Link href="/emergency-contacts" className="block text-center py-2.5 text-[11px] text-primary hover:underline border-t border-border">
        {tx("sos.manageContacts", lang as Lang)}
      </Link>
    </Card>
  )
}
