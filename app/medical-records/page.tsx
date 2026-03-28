"use client";

import { FileText, FolderOpen, QrCode, Shield, Share2, Search } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const FEATURES = [
  {
    icon: <FolderOpen className="w-6 h-6" />,
    titleEn: "All Documents in One Place",
    titleTr: "Tum Belgeler Tek Yerde",
    descEn: "Upload and organize lab results, prescriptions, discharge notes, and imaging reports",
    descTr: "Tahlil sonuçlari, receteler, epikriz ve görüntüleme raporlarini yukleyin ve duzenleyin",
  },
  {
    icon: <Search className="w-6 h-6" />,
    titleEn: "Smart Search",
    titleTr: "Akilli Arama",
    descEn: "AI-powered search across all your medical documents — find anything instantly",
    descTr: "Tum tibbi belgelerinizde AI destekli arama — aninda bulun",
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    titleEn: "QR Code Sharing",
    titleTr: "QR Kod ile Paylaşım",
    descEn: "Share specific records with your doctor via secure QR code — no email needed",
    descTr: "Belirli kayitlari güvenli QR kod ile doktorunuzla paylasin — e-posta gerekmez",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    titleEn: "Encrypted Storage",
    titleTr: "Sifreli Depolama",
    descEn: "All documents encrypted at rest and in transit — your data stays yours",
    descTr: "Tum belgeler beklemede ve aktarimda sifrelenir — veriniz sizindir",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    titleEn: "Family Access",
    titleTr: "Aile Erisimi",
    descEn: "Share records with family members or caregivers with granular permissions",
    descTr: "Kayitlari aile uyeleri veya bakicilarla detayli izinlerle paylasin",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    titleEn: "Timeline View",
    titleTr: "Zaman Cizelgesi Gorunumu",
    descEn: "See your complete medical history as a visual timeline",
    descTr: "Tam tibbi geçmişinizi gorsel bir zaman cizelgesi olarak görün",
  },
];

export default function MedicalRecordsPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-600 dark:text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("records.title", lang)}</h1>
          <div className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            {tx("records.comingSoon", lang)}
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            {lang === "tr"
              ? "Tum tibbi belgeleriniz tek bir yerde, güvenli ve düzenli. QR kodla doktorunuzla aninda paylasin."
              : "All your medical documents in one place, secure and organized. Share instantly with your doctor via QR code."}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="text-slate-600 dark:text-slate-400 mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {lang === "tr" ? f.titleTr : f.titleEn}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lang === "tr" ? f.descTr : f.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-700 dark:text-slate-400 font-medium">
              {lang === "tr"
                ? "Belge organizatoru yakinda geliyor. Su an kan tahlillerinizi ve radyoloji raporlarinizi Tibbi Analiz sayfamizdan yukleyebilirsiniz."
                : "Document organizer coming soon. You can currently upload blood tests and radiology reports from our Medical Analysis page."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
