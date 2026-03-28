"use client";

import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, Database, Users, FlaskConical, Clock, Lock, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface PrivacySetting { id: string; en: string; tr: string; descEn: string; descTr: string; enabled: boolean; category: string; }

export default function PrivacyControlsPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [settings, setSettings] = useState<PrivacySetting[]>([
    { id: "research_optin", en: "Research Contribution", tr: "Araştırma Katilimi", descEn: "Allow anonymized data for medical research", descTr: "Anonimlestirilmis verilerinizin tibbi araştırmalarda kullanilmasina izin verin", enabled: false, category: "data" },
    { id: "doctor_sharing", en: "Doctor Data Sharing", tr: "Doktor Veri Paylaşımi", descEn: "Allow your doctor to view your health data", descTr: "Doktorunuzun saglik verilerinizi görüntülemesine izin verin", enabled: true, category: "sharing" },
    { id: "family_view", en: "Family Member Visibility", tr: "Aile Uyesi Gorunurlugu", descEn: "Allow family members to see your health summary", descTr: "Aile uyelerinin saglik ozetinizi gormesine izin verin", enabled: true, category: "sharing" },
    { id: "analytics", en: "Usage Analytics", tr: "Kullanim Analitigi", descEn: "Help improve the app with anonymous usage data", descTr: "Anonim kullanim verileriyle uygulamayi iyilestirmeye yardim edin", enabled: true, category: "data" },
    { id: "ai_training", en: "AI Model Training", tr: "AI Model Egitimi", descEn: "Allow data for AI improvement (always anonymized)", descTr: "AI iyilestirmesi için veri kullanilmasina izin verin (her zaman anonim)", enabled: false, category: "data" },
    { id: "location", en: "Location Services", tr: "Konum Hizmetleri", descEn: "Enable location for pharmacy finder feature", descTr: "Eczane bulucu ozelligi için konumu etkinlestirin", enabled: false, category: "device" },
  ]);

  const [retentionPeriod, setRetentionPeriod] = useState("24");

  useEffect(() => {
    const saved = localStorage.getItem("privacy_settings");
    if (saved) { try { setSettings(JSON.parse(saved)); } catch {} }
    const ret = localStorage.getItem("data_retention");
    if (ret) setRetentionPeriod(ret);
  }, []);

  const toggle = (id: string) => {
    setSettings(prev => {
      const next = prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
      localStorage.setItem("privacy_settings", JSON.stringify(next));
      return next;
    });
  };

  const setRetention = (months: string) => {
    setRetentionPeriod(months);
    localStorage.setItem("data_retention", months);
  };

  const categories = [
    { id: "data", en: "Data & Research", tr: "Veri ve Araştırma", icon: <Database className="w-4 h-4" /> },
    { id: "sharing", en: "Sharing & Access", tr: "Paylaşım ve Erisim", icon: <Users className="w-4 h-4" /> },
    { id: "device", en: "Device Permissions", tr: "Cihaz Izinleri", icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-slate-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Gizlilik Kontrolleri" : "Privacy Controls"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "Verilerinizin nasil kullanildigini kontrol edin" : "Control how your data is used"}</p>
          </div>
        </div>

        <Card className="p-4 mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-700 text-sm">{isTr ? "KVKK Uyumlu" : "GDPR/KVKK Compliant"}</h3>
              <p className="text-xs text-green-600 mt-1">{isTr ? "Verileriniz sifrelenerek saklanir. Türkiye sunucularinda barindiriliyor." : "Your data is stored encrypted. Hosted on servers compliant with regulations."}</p>
            </div>
          </div>
        </Card>

        {categories.map(cat => (
          <div key={cat.id} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">{cat.icon} {isTr ? cat.tr : cat.en}</h2>
            <div className="space-y-2">
              {settings.filter(s => s.category === cat.id).map(s => (
                <Card key={s.id} className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => toggle(s.id)}>
                  <div className={"p-2 rounded-lg " + (s.enabled ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400")}>{s.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{isTr ? s.tr : s.en}</div>
                    <div className="text-xs text-gray-500">{isTr ? s.descTr : s.descEn}</div>
                  </div>
                  {s.enabled ? <ToggleRight className="w-8 h-8 text-blue-500" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                </Card>
              ))}
            </div>
          </div>
        ))}

        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> {isTr ? "Veri Saklama Süresi" : "Data Retention Period"}</h2>
          <div className="grid grid-cols-3 gap-2">
            {[{ val: "6", en: "6 months", tr: "6 ay" }, { val: "12", en: "12 months", tr: "12 ay" }, { val: "24", en: "24 months", tr: "24 ay" }].map(opt => (
              <Button key={opt.val} variant={retentionPeriod === opt.val ? "default" : "outline"} size="sm" onClick={() => setRetention(opt.val)} className="w-full">{isTr ? opt.tr : opt.en}</Button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{isTr ? "Bu sure sonunda verileriniz otomatik silinir." : "Your data will be automatically deleted after this period."}</p>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" /> {isTr ? "Verilerimi İndir" : "Export Data"}</Button>
          <Button variant="outline" className="flex-1 text-red-500 border-red-200 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-2" /> {isTr ? "Hesabimi Sil" : "Delete Account"}</Button>
        </div>
      </div>
    </div>
  );
}