"use client";

import { useState } from "react";
import { Download, Database, FileText, MessageSquare, Pill, Heart, Calendar, Users, Activity, Shield, Loader2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface DataCategory { id: string; icon: React.ReactNode; en: string; tr: string; descEn: string; descTr: string; count: number; size: string; selected: boolean; }

export default function DataExportPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [categories, setCategories] = useState<DataCategory[]>([
    { id: "profile", icon: <Heart className="w-5 h-5" />, en: "Health Profile", tr: "Sağlık Profili", descEn: "Personal info, conditions, allergies", descTr: "Kişisel bilgiler, hastalıklar, alerjiler", count: 1, size: "2 KB", selected: true },
    { id: "medications", icon: <Pill className="w-5 h-5" />, en: "Medications", tr: "İlaçlar", descEn: "Current and past medications", descTr: "Mevcut ve gecmis ilaclar", count: 8, size: "4 KB", selected: true },
    { id: "chat", icon: <MessageSquare className="w-5 h-5" />, en: "Chat History", tr: "Sohbet Geçmişi", descEn: "All AI conversations", descTr: "Tum AI konusmalari", count: 47, size: "128 KB", selected: true },
    { id: "blood", icon: <Activity className="w-5 h-5" />, en: "Blood Tests", tr: "Kan Tahlilleri", descEn: "Lab results and analyses", descTr: "Laboratuvar sonuçlari", count: 3, size: "15 KB", selected: true },
    { id: "calendar", icon: <Calendar className="w-5 h-5" />, en: "Calendar Data", tr: "Takvim Verileri", descEn: "Events, reminders, tracking", descTr: "Etkinlikler, hatirlaticilar", count: 28, size: "12 KB", selected: true },
    { id: "supplements", icon: <FileText className="w-5 h-5" />, en: "Supplement Log", tr: "Takviye Kayitlari", descEn: "Supplement intake history", descTr: "Takviye kullanim geçmişi", count: 156, size: "22 KB", selected: true },
    { id: "family", icon: <Users className="w-5 h-5" />, en: "Family Profiles", tr: "Aile Profilleri", descEn: "Family member health data", descTr: "Aile uyesi saglik verileri", count: 2, size: "6 KB", selected: true },
    { id: "scores", icon: <Activity className="w-5 h-5" />, en: "Health Scores", tr: "Sağlık Skorlari", descEn: "Daily scores, bio age", descTr: "Günlük skorlar, biyolojik yas", count: 90, size: "18 KB", selected: true },
    { id: "consent", icon: <Shield className="w-5 h-5" />, en: "Consent Records", tr: "Onay Kayitlari", descEn: "Legal agreements", descTr: "Yasal sozlesmeler", count: 1, size: "1 KB", selected: true },
  ]);
  const toggleCategory = (id: string) => setCategories(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  const selectAll = (val: boolean) => setCategories(prev => prev.map(c => ({ ...c, selected: val })));
  const selectedCount = categories.filter(c => c.selected).length;
  const totalRecords = categories.filter(c => c.selected).reduce((sum, c) => sum + c.count, 0);
  const handleExport = async () => { setExporting(true); await new Promise(r => setTimeout(r, 2000)); setExporting(false); setExported(true); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Verilerimi İndir" : "Export My Data"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "KVKK kapsaminda veri tasima hakki" : "GDPR/KVKK right to data portability"}</p>
          </div>
        </div>
        <Card className="p-4 mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-700">{isTr ? "Veri Formati: JSON" : "Data Format: JSON"}</h3>
              <p className="text-sm text-blue-600 mt-1">{isTr ? "Verileriniz JSON formatinda indirilecektir." : "Your data will be exported in JSON format."}</p>
            </div>
          </div>
        </Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isTr ? "Veri Kategorileri" : "Data Categories"}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => selectAll(true)}>{isTr ? "Tumunu Sec" : "Select All"}</Button>
            <Button variant="outline" size="sm" onClick={() => selectAll(false)}>{isTr ? "Temizle" : "Clear"}</Button>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          {categories.map(cat => (
            <Card key={cat.id} className={"p-4 flex items-center gap-4 cursor-pointer transition-all " + (cat.selected ? "border-blue-300 bg-blue-50/50 dark:bg-blue-900/10" : "opacity-60")} onClick={() => toggleCategory(cat.id)}>
              <input type="checkbox" checked={cat.selected} readOnly className="w-5 h-5 rounded" />
              <div className={"p-2 rounded-lg " + (cat.selected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400")}>{cat.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{isTr ? cat.tr : cat.en}</div>
                <div className="text-xs text-gray-500">{isTr ? cat.descTr : cat.descEn}</div>
              </div>
              <div className="text-right">
                <Badge variant="outline">{cat.count} {isTr ? "kayit" : "records"}</Badge>
                <div className="text-xs text-gray-400 mt-1">{cat.size}</div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div><span className="text-sm font-medium">{isTr ? "Secili:" : "Selected:"} {selectedCount}/{categories.length}</span><p className="text-xs text-gray-500">{totalRecords} {isTr ? "kayit" : "records"}</p></div>
            <div className="flex items-center gap-2 text-xs text-gray-400"><Clock className="w-3.5 h-3.5" />{isTr ? "~5 saniye" : "~5 seconds"}</div>
          </div>
        </Card>
        {exported ? (
          <Card className="p-6 text-center border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-1">{isTr ? "Tamamlandı" : "Export Complete"}</h3>
            <p className="text-sm text-gray-500 mb-4">{isTr ? "Verileriniz indirildi." : "Your data has been downloaded."}</p>
            <Button variant="outline" onClick={() => setExported(false)}>{isTr ? "Tekrar İndir" : "Download Again"}</Button>
          </Card>
        ) : (
          <Button className="w-full bg-blue-500 hover:bg-blue-600" disabled={selectedCount === 0 || exporting} onClick={handleExport}>
            {exporting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isTr ? "Hazırlanıyor..." : "Preparing..."}</> : <><Download className="w-4 h-4 mr-2" /> {isTr ? "JSON Olarak İndir" : "Download as JSON"}</>}
          </Button>
        )}
      </div>
    </div>
  );
}