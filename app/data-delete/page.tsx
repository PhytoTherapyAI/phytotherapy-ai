"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft, XCircle, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

export default function DataDeletePage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [step, setStep] = useState(1);
  const [deleteText, setDeleteText] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const dataCategories = [
    { en: "Health profile & medications", tr: "Sağlık profili ve ilaclar", count: 12 },
    { en: "Chat history & AI conversations", tr: "Sohbet geçmişi ve AI konusmalari", count: 47 },
    { en: "Blood test results", tr: "Kan tahlili sonuçlari", count: 3 },
    { en: "Calendar events & reminders", tr: "Takvim etkinlikleri ve hatirlaticilar", count: 28 },
    { en: "Supplement tracking data", tr: "Takviye takip verileri", count: 15 },
    { en: "Family member profiles", tr: "Aile uyesi profilleri", count: 2 },
    { en: "Health scores & analytics", tr: "Sağlık skorlari ve analizler", count: 90 },
    { en: "Consent & legal records", tr: "Onay ve yasal kayitlar", count: 1 },
  ];

  const handleDelete = () => { if (deleteText === "DELETE" && confirmed) setDeleted(true); };

  if (deleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{isTr ? "Hesabiniz Silindi" : "Account Deleted"}</h2>
          <p className="text-sm text-gray-500 mb-4">{isTr ? "Tum verileriniz 30 gun icinde kalici olarak silinecektir." : "All your data will be permanently deleted within 30 days."}</p>
          <Badge className="bg-yellow-100 text-yellow-700">30 {isTr ? "gun bekleme suresi" : "day grace period"}</Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Hesabi Sil" : "Delete Account"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "KVKK kapsaminda veri silme hakki" : "GDPR/KVKK right to data deletion"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " + (step >= s ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500")}>{s}</div>
              {s < 3 && <div className={"w-12 h-0.5 " + (step > s ? "bg-red-500" : "bg-gray-200")} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-700 dark:text-red-400">{isTr ? "Dikkat: Bu islem geri alinamaz" : "Warning: This action is irreversible"}</h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{isTr ? "Hesabinizi sildiginizde tum veriler kalici olarak silinecektir." : "When you delete your account, all data will be permanently removed."}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> {isTr ? "Silinecek Veriler" : "Data to be Deleted"}</h3>
              <div className="space-y-2">
                {dataCategories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm">{isTr ? cat.tr : cat.en}</span>
                    <Badge variant="outline">{cat.count} {isTr ? "kayit" : "records"}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-700">{isTr ? "Alternatif: Veri İndirme" : "Alternative: Export Data"}</h3>
                  <p className="text-sm text-blue-600 mt-1">{isTr ? "Silmeden once verilerinizi indirebilirsiniz." : "You can download your data before deleting."}</p>
                  <Button variant="outline" size="sm" className="mt-2">{isTr ? "Verilerimi İndir" : "Export My Data"}</Button>
                </div>
              </div>
            </Card>
            <Button className="w-full bg-red-500 hover:bg-red-600" onClick={() => setStep(2)}>{isTr ? "Devam Et" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Card className="p-6">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-center mb-2">{isTr ? "Onay Gerekli" : "Confirmation Required"}</h3>
              <p className="text-sm text-gray-500 text-center mb-6">{isTr ? "Devam etmek icin asagiya DELETE yazin." : "Type DELETE below to confirm."}</p>
              <input className="w-full rounded-lg border-2 border-red-200 px-4 py-3 text-center text-lg font-mono tracking-widest dark:bg-gray-800 dark:border-red-800 focus:border-red-500 focus:outline-none" placeholder="DELETE" value={deleteText} onChange={e => setDeleteText(e.target.value.toUpperCase())} />
              {deleteText === "DELETE" && <div className="flex items-center gap-2 mt-4 text-green-600"><CheckCircle2 className="w-4 h-4" /><span className="text-sm">{isTr ? "Onay kodu dogru" : "Confirmation code correct"}</span></div>}
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> {isTr ? "Geri" : "Back"}</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" disabled={deleteText !== "DELETE"} onClick={() => setStep(3)}>{isTr ? "Son Adim" : "Final Step"} <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card className="p-6 border-red-300 bg-red-50 dark:bg-red-900/20">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center text-red-700 mb-2">{isTr ? "Son Onay" : "Final Confirmation"}</h3>
              <p className="text-sm text-center text-gray-600 mb-6">{isTr ? "Bu butona bastiginizda hesabiniz silinmek uzere isaretlenecektir." : "Clicking this button will mark your account for deletion."}</p>
              <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />
                <span className="text-sm">{isTr ? "Tum verilerimin kalici olarak silinecegini anliyorum." : "I understand all my data will be permanently deleted."}</span>
              </label>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" /> {isTr ? "Geri" : "Back"}</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={!confirmed} onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" /> {isTr ? "Hesabimi Sil" : "Delete My Account"}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}