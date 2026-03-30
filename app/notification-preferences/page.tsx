"use client";

import { useState } from "react";
import { Bell, Pill, Clock, Calendar, Users, Trophy, Mail, Smartphone, Volume2, BellOff, Check, AlertTriangle, Droplets, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface NotifSetting { id: string; en: string; tr: string; descEn: string; descTr: string; icon: React.ReactNode; enabled: boolean; category: string; }

export default function NotificationPreferencesPage() {
  const { lang } = useLang();
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: "med_reminder", en: "Medication Reminders", tr: "İlaç Hatirlatmalari", descEn: "Daily medication intake alerts", descTr: "Günlük ilac alma uyarıları", icon: <Pill className="w-5 h-5" />, enabled: true, category: "health" },
    { id: "supplement", en: "Supplement Reminders", tr: "Takviye Hatirlatmalari", descEn: "Supplement cycle and dosage alerts", descTr: "Takviye döngüsü ve doz uyarıları", icon: <Droplets className="w-5 h-5" />, enabled: true, category: "health" },
    { id: "washout", en: "Washout Alerts", tr: "Washout Uyarılari", descEn: "Supplement washout period notifications", descTr: "Takviye ara donem bildirimleri", icon: <Clock className="w-5 h-5" />, enabled: true, category: "health" },
    { id: "blood_test", en: "Blood Test Reminders", tr: "Kan Tahlili Hatirlatmalari", descEn: "Periodic blood test notifications", descTr: "Periyodik kan tahlili bildirimleri", icon: <Calendar className="w-5 h-5" />, enabled: true, category: "health" },
    { id: "water", en: "Water Intake", tr: "Su Icme Hatirlatmasi", descEn: "Hourly hydration reminders", descTr: "Saatlik su icme hatirlatmalari", icon: <Droplets className="w-5 h-5" />, enabled: false, category: "health" },
    { id: "appointment", en: "Appointment Reminders", tr: "Randevu Hatirlatmalari", descEn: "Doctor appointment notifications", descTr: "Doktor randevu bildirimleri", icon: <Calendar className="w-5 h-5" />, enabled: true, category: "calendar" },
    { id: "family", en: "Family Alerts", tr: "Aile Uyarılari", descEn: "Family member health notifications", descTr: "Aile uyesi sağlık bildirimleri", icon: <Users className="w-5 h-5" />, enabled: true, category: "social" },
    { id: "challenge", en: "Challenge Updates", tr: "Meydan Okuma Guncelemeleri", descEn: "Boss fight and challenge progress", descTr: "Boss fight ve meydan okuma ilerlemesi", icon: <Trophy className="w-5 h-5" />, enabled: false, category: "social" },
    { id: "newsletter", en: "Health Newsletter", tr: "Sağlık Bulteni", descEn: "Weekly health tips and research", descTr: "Haftalık sağlık ipuclari ve araştırmalar", icon: <Mail className="w-5 h-5" />, enabled: false, category: "marketing" },
    { id: "goals", en: "Goal Progress", tr: "Hedef İlerlemesi", descEn: "Weekly goal progress summary", descTr: "Haftalık hedef ilerleme ozeti", icon: <Target className="w-5 h-5" />, enabled: true, category: "health" },
    { id: "morning", en: "Morning Summary", tr: "Sabah Özeti", descEn: "Daily health summary card", descTr: "Günlük sağlık ozet karti", icon: <Bell className="w-5 h-5" />, enabled: true, category: "health" },
    { id: "interaction", en: "Interaction Alerts", tr: "Etkileşim Uyarılari", descEn: "New drug-supplement interaction warnings", descTr: "Yeni ilac-takviye etkilesim uyarıları", icon: <AlertTriangle className="w-5 h-5" />, enabled: true, category: "health" },
  ]);

  const toggle = (id: string) => setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  const enabledCount = settings.filter(s => s.enabled).length;
  const categories = [
    { id: "health", en: "Health & Tracking", tr: "Sağlık ve Takip" },
    { id: "calendar", en: "Calendar", tr: "Takvim" },
    { id: "social", en: "Social & Challenges", tr: "Sosyal ve Meydan Okumalar" },
    { id: "marketing", en: "Marketing", tr: "Pazarlama" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-amber-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tx("notifPref.title", lang)}</h1>
            <p className="text-sm text-gray-500">{enabledCount}/{settings.length} {tx("notifPref.active", lang)}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => setSettings(prev => prev.map(s => ({ ...s, enabled: true })))}><Bell className="w-4 h-4 mr-1" /> {tx("notifPref.enableAll", lang)}</Button>
          <Button variant="outline" size="sm" onClick={() => setSettings(prev => prev.map(s => ({ ...s, enabled: false })))}><BellOff className="w-4 h-4 mr-1" /> {tx("notifPref.disableAll", lang)}</Button>
        </div>

        {categories.map(cat => (
          <div key={cat.id} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{cat[lang as "en" | "tr"]}</h2>
            <div className="space-y-2">
              {settings.filter(s => s.category === cat.id).map(s => (
                <Card key={s.id} className={"p-4 flex items-center gap-4 cursor-pointer transition-all " + (s.enabled ? "" : "opacity-50")} onClick={() => toggle(s.id)}>
                  <div className={"p-2 rounded-lg " + (s.enabled ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" : "bg-gray-100 text-gray-400")}>{s.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{s[lang as "en" | "tr"]}</div>
                    <div className="text-xs text-gray-500">{s[lang === "tr" ? "descTr" : "descEn"]}</div>
                  </div>
                  <div className={"w-12 h-7 rounded-full flex items-center transition-all px-1 " + (s.enabled ? "bg-amber-500 justify-end" : "bg-gray-300 justify-start")}>
                    <div className="w-5 h-5 rounded-full bg-white shadow" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">{tx("notifPref.pushTitle", lang)}</h3>
              <p className="text-xs text-gray-500 mt-1">{tx("notifPref.pushDesc", lang)}</p>
              <Button size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600">{tx("notifPref.grantPermission", lang)}</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}