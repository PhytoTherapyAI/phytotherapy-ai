"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Phone, Plus, Trash2, Edit3, Save, X, Shield, Star, User,
  Heart, Stethoscope, Users, GripVertical, AlertTriangle, Check,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phoneNumber: string
  isPrimary: boolean
  priority: number
}

const RELATIONSHIPS = [
  { id: "spouse", icon: Heart, label: { en: "Spouse / Partner", tr: "Eş / Partner" } },
  { id: "parent", icon: Users, label: { en: "Parent", tr: "Anne / Baba" } },
  { id: "child", icon: User, label: { en: "Child", tr: "Çocuk" } },
  { id: "sibling", icon: Users, label: { en: "Sibling", tr: "Kardeş" } },
  { id: "doctor", icon: Stethoscope, label: { en: "Doctor", tr: "Doktor" } },
  { id: "friend", icon: User, label: { en: "Friend", tr: "Arkadaş" } },
  { id: "other", icon: User, label: { en: "Other", tr: "Diğer" } },
]

export default function EmergencyContactsPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", relationship: "spouse", phoneNumber: "" })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem(`emergency_contacts_${user?.id || "guest"}`)
    if (data) setContacts(JSON.parse(data))
  }, [user])

  const save = (updated: EmergencyContact[]) => {
    setContacts(updated)
    localStorage.setItem(`emergency_contacts_${user?.id || "guest"}`, JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addContact = () => {
    if (!form.name || !form.phoneNumber) return
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: form.name,
      relationship: form.relationship,
      phoneNumber: form.phoneNumber,
      isPrimary: contacts.length === 0,
      priority: contacts.length + 1,
    }
    save([...contacts, newContact])
    setForm({ name: "", relationship: "spouse", phoneNumber: "" })
    setShowForm(false)
  }

  const updateContact = () => {
    if (!editingId || !form.name || !form.phoneNumber) return
    save(contacts.map(c => c.id === editingId ? { ...c, name: form.name, relationship: form.relationship, phoneNumber: form.phoneNumber } : c))
    setEditingId(null)
    setForm({ name: "", relationship: "spouse", phoneNumber: "" })
  }

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id)
    if (updated.length > 0 && !updated.some(c => c.isPrimary)) updated[0].isPrimary = true
    save(updated.map((c, i) => ({ ...c, priority: i + 1 })))
  }

  const setPrimary = (id: string) => {
    save(contacts.map(c => ({ ...c, isPrimary: c.id === id })))
  }

  const startEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id)
    setForm({ name: contact.name, relationship: contact.relationship, phoneNumber: contact.phoneNumber })
    setShowForm(true)
  }

  const getRelIcon = (relId: string) => {
    const rel = RELATIONSHIPS.find(r => r.id === relId)
    return rel?.icon || User
  }

  const t = (key: string) => {
    const keyMap: Record<string, string> = {
      title: "emergencyContacts.title",
      subtitle: "emergencyContacts.subtitle",
      add: "emergencyContacts.add",
      save: "emergencyContacts.save",
      cancel: "emergencyContacts.cancel",
      name: "emergencyContacts.name",
      relationship: "emergencyContacts.relationship",
      phone: "emergencyContacts.phone",
      primary: "emergencyContacts.primary",
      set_primary: "emergencyContacts.setPrimary",
      empty: "emergencyContacts.empty",
      saved: "emergencyContacts.saved",
      tip: "emergencyContacts.tip",
      max: "emergencyContacts.max",
    }
    const txKey = keyMap[key]
    return txKey ? tx(txKey, lang) : key
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 md:px-8 py-8">
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />{tx("emergencyContacts.backToProfile", lang)}
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Saved toast */}
        {saved && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4" />{t("saved")}
          </div>
        )}

        {/* Add button */}
        {contacts.length < 5 && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", relationship: "spouse", phoneNumber: "" }) }}
            className="w-full mb-6 gap-2" variant={contacts.length === 0 ? "default" : "outline"}>
            <Plus className="w-4 h-4" />{t("add")}
          </Button>
        )}
        {contacts.length >= 5 && (
          <p className="text-xs text-muted-foreground text-center mb-4">{t("max")}</p>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-5 mb-6 border-primary/30">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("name")} *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={tx("emergencyContacts.namePlaceholder", lang)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t("relationship")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {RELATIONSHIPS.map(rel => {
                    const Icon = rel.icon
                    return (
                      <button key={rel.id} onClick={() => setForm({ ...form, relationship: rel.id })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                          form.relationship === rel.id ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/30"
                        }`}>
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {rel.label[lang as "en" | "tr"]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("phone")} *</label>
                <Input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                  type="tel" placeholder="+90 5XX XXX XX XX" className="font-mono" />
              </div>
              <div className="flex gap-2">
                <Button onClick={editingId ? updateContact : addContact} disabled={!form.name || !form.phoneNumber} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />{t("save")}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }} className="gap-2">
                  <X className="w-4 h-4" />{t("cancel")}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Contact List */}
        {contacts.length === 0 && !showForm ? (
          <Card className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("empty")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {contacts.sort((a, b) => a.priority - b.priority).map((contact, idx) => {
              const RelIcon = getRelIcon(contact.relationship)
              const relLabel = RELATIONSHIPS.find(r => r.id === contact.relationship)?.label[lang as "en" | "tr"] || contact.relationship
              return (
                <Card key={contact.id} className={`p-4 ${contact.isPrimary ? "border-red-500/30 bg-red-500/5" : ""}`}>
                  <div className="flex items-start gap-3">
                    {/* Priority number */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      contact.isPrimary ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{contact.name}</span>
                        {contact.isPrimary && (
                          <Badge className="bg-red-500/10 text-red-600 border-red-500/30 text-[10px] gap-0.5">
                            <Star className="w-2.5 h-2.5" />{t("primary")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <RelIcon className="w-3.5 h-3.5" />
                        <span>{relLabel}</span>
                        <span className="font-mono text-xs">{contact.phoneNumber}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <a href={`tel:${contact.phoneNumber}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-500/10">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(contact)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      {!contact.isPrimary && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setPrimary(contact.id)} title={t("set_primary")}>
                          <Star className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10" onClick={() => deleteContact(contact.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Tip */}
        <Card className="p-4 mt-6 border-amber-500/20 bg-amber-500/5">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{t("tip")}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
