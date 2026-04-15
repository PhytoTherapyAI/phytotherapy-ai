// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useEffect, useState } from "react";
import { tx } from "@/lib/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle, Shield, Trash2, Plus, Check, Save, Phone, Edit3, Star,
} from "lucide-react";

interface EmergencyContact {
  id: string; name: string; relationship: string; phoneNumber: string; isPrimary: boolean; priority: number;
}

const EC_RELATIONSHIPS = [
  { id: "spouse", label: { en: "Spouse", tr: "Eş" } },
  { id: "parent", label: { en: "Parent", tr: "Anne/Baba" } },
  { id: "child", label: { en: "Child", tr: "Çocuk" } },
  { id: "sibling", label: { en: "Sibling", tr: "Kardeş" } },
  { id: "doctor", label: { en: "Doctor", tr: "Doktor" } },
  { id: "friend", label: { en: "Friend", tr: "Arkadaş" } },
  { id: "other", label: { en: "Other", tr: "Diğer" } },
];

export function EmergencyContactsSection({ lang, userId }: { lang: "en" | "tr"; userId: string }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", relationship: "spouse", phoneNumber: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem(`emergency_contacts_${userId}`);
      if (data) setContacts(JSON.parse(data));
    } catch { /* corrupted */ }
  }, [userId]);

  const persist = (updated: EmergencyContact[]) => {
    setContacts(updated);
    localStorage.setItem(`emergency_contacts_${userId}`, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addContact = () => {
    if (!form.name || !form.phoneNumber) return;
    persist([...contacts, {
      id: Date.now().toString(), name: form.name, relationship: form.relationship,
      phoneNumber: form.phoneNumber, isPrimary: contacts.length === 0, priority: contacts.length + 1,
    }]);
    setForm({ name: "", relationship: "spouse", phoneNumber: "" });
    setShowForm(false);
  };

  const updateContact = () => {
    if (!editingId) return;
    persist(contacts.map(c => c.id === editingId ? { ...c, ...form } : c));
    setEditingId(null);
    setForm({ name: "", relationship: "spouse", phoneNumber: "" });
    setShowForm(false);
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    if (updated.length > 0 && !updated.some(c => c.isPrimary)) updated[0].isPrimary = true;
    persist(updated.map((c, i) => ({ ...c, priority: i + 1 })));
  };

  const setPrimary = (id: string) => persist(contacts.map(c => ({ ...c, isPrimary: c.id === id })));

  const startEdit = (c: EmergencyContact) => {
    setEditingId(c.id);
    setForm({ name: c.name, relationship: c.relationship, phoneNumber: c.phoneNumber });
    setShowForm(true);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-500" />
              {tx("profile.emergencyContacts", lang)}
            </CardTitle>
            <CardDescription>{tx("profile.emergencyDesc", lang)}</CardDescription>
          </div>
          {contacts.length < 5 && !showForm && (
            <Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", relationship: "spouse", phoneNumber: "" }); }}>
              <Plus className="h-4 w-4 mr-1" />{tx("profile.add", lang)}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {saved && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-1.5 rounded-lg">
            <Check className="h-3 w-3" />{tx("profile.saved", lang)}
          </div>
        )}

        {showForm && (
          <div className="space-y-3 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
            <div>
              <Label className="text-xs">{tx("profile.fullName", lang)} *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={tx("profile.fullNamePlaceholder", lang)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{tx("profile.relationship", lang)}</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mt-1">
                {EC_RELATIONSHIPS.map(rel => (
                  <button key={rel.id} onClick={() => setForm({ ...form, relationship: rel.id })}
                    className={`px-2 py-1.5 rounded-md border text-xs transition-all ${
                      form.relationship === rel.id ? "border-primary bg-primary/10 font-medium" : "hover:border-primary/30"
                    }`}>
                    {rel.label[lang]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">{tx("profile.phone", lang)} *</Label>
              <Input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                type="tel" placeholder="+90 5XX XXX XX XX" className="mt-1 font-mono" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={editingId ? updateContact : addContact} disabled={!form.name || !form.phoneNumber} className="gap-1">
                <Save className="h-3.5 w-3.5" />{tx("profile.save", lang)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                {tx("profile.cancel", lang)}
              </Button>
            </div>
          </div>
        )}

        {contacts.length === 0 && !showForm && (
          <div className="text-center py-6">
            <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{tx("profile.noEmergency", lang)}</p>
          </div>
        )}

        {contacts.sort((a, b) => a.priority - b.priority).map((contact, idx) => {
          const relLabel = EC_RELATIONSHIPS.find(r => r.id === contact.relationship)?.label[lang] || contact.relationship;
          return (
            <div key={contact.id} className={`flex items-center gap-3 p-3 rounded-lg border ${contact.isPrimary ? "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/10" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                contact.isPrimary ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{contact.name}</span>
                  {contact.isPrimary && (
                    <Badge className="text-[9px] bg-red-100 text-red-600 border-0 px-1.5">{tx("profile.primary", lang)}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{relLabel} · <span className="font-mono">{contact.phoneNumber}</span></p>
              </div>
              <div className="flex items-center gap-0.5">
                <a href={`tel:${contact.phoneNumber}`}>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600"><Phone className="h-3.5 w-3.5" /></Button>
                </a>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(contact)}><Edit3 className="h-3 w-3" /></Button>
                {!contact.isPrimary && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPrimary(contact.id)} title={tx("profile.setPrimary", lang)}>
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteContact(contact.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {contacts.length > 0 && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            {tx("profile.emergencyNote", lang)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
