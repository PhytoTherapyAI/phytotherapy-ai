"use client";

import { useState, useRef } from "react";
import { Stethoscope, Loader2, LogIn, Printer, ClipboardList, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface StructuredDescription {
  mainComplaint: string;
  onset: string;
  location: string;
  duration: string;
  character: string;
  aggravating: string;
  relieving: string;
  severity: string;
  associated: string;
  timeline: string;
}

interface DoctorCommResult {
  structuredDescription: StructuredDescription;
  questionsToAsk: string[];
  tipsForVisit: string[];
  whatToBring: string[];
  redFlags: string | null;
}

export default function DoctorCommunicationPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const printRef = useRef<HTMLDivElement>(null);

  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DoctorCommResult | null>(null);

  const handleSubmit = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 5) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/doctor-communication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ symptoms_description: symptoms.trim(), lang }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html><head><title>${lang === "tr" ? "Doktor Ziyareti Notları" : "Doctor Visit Notes"}</title>
          <style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:700px;margin:0 auto}h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:1.5rem;border-bottom:1px solid #ddd;padding-bottom:.3rem}.field{margin:.5rem 0}.label{font-weight:600;color:#555}.value{margin-left:.5rem}ul{padding-left:1.5rem}li{margin:.3rem 0}.red{color:#dc2626;font-weight:600}</style>
          </head><body>${printRef.current.innerHTML}</body></html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tx("doctorcomm.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{tx("doctorcomm.subtitle", lang)}</p>
          <Button onClick={() => window.location.href = "/auth"} className="gap-2">
            <LogIn className="w-4 h-4" />
            {tx("tool.loginRequired", lang)}
          </Button>
        </div>
      </div>
    );
  }

  const descLabels: Record<string, { en: string; tr: string }> = {
    mainComplaint: { en: "Main Complaint", tr: "Ana Şikayet" },
    onset: { en: "When It Started", tr: "Ne Zaman Başladı" },
    location: { en: "Location", tr: "Konum" },
    duration: { en: "Duration", tr: "Süre" },
    character: { en: "Character", tr: "Nitelik" },
    aggravating: { en: "What Makes It Worse", tr: "Artıran Faktörler" },
    relieving: { en: "What Helps", tr: "Azaltan Faktörler" },
    severity: { en: "Severity", tr: "Şiddet" },
    associated: { en: "Associated Symptoms", tr: "Eşlik Eden Belirtiler" },
    timeline: { en: "Pattern/Timeline", tr: "Seyir" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("doctorcomm.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("doctorcomm.subtitle", lang)}</p>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-sky-100 dark:border-gray-700 p-6 mb-6">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={tx("doctorcomm.describe", lang)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || symptoms.trim().length < 5}
            className="mt-3 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <MessageCircle className="w-5 h-5 mr-2" />}
            {tx("doctorcomm.coach", lang)}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Red Flags */}
            {result.redFlags && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800 p-6">
                <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  {lang === "tr" ? "Dikkat Edilmesi Gerekenler" : "Red Flags"}
                </h3>
                <p className="text-red-700 dark:text-red-300">{result.redFlags}</p>
              </div>
            )}

            {/* Print Button */}
            <div className="flex justify-end">
              <Button onClick={handlePrint} variant="outline" className="gap-2 text-sm">
                <Printer className="w-4 h-4" />
                {lang === "tr" ? "Yazdır" : "Print"}
              </Button>
            </div>

            {/* Printable Content */}
            <div ref={printRef}>
              {/* Structured Description */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-sky-100 dark:border-gray-700 p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {lang === "tr" ? "Yapılandırılmış Anlatım" : "Structured Description"}
                  </h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(result.structuredDescription).map(([key, value]) => {
                    if (!value) return null;
                    const label = descLabels[key]?.[lang] || key;
                    return (
                      <div key={key} className="field">
                        <span className="label text-sm font-medium text-gray-500 dark:text-gray-400">{label}: </span>
                        <span className="value text-gray-800 dark:text-gray-200">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Questions to Ask */}
              {result.questionsToAsk && result.questionsToAsk.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-sky-100 dark:border-gray-700 p-6 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {lang === "tr" ? "Doktorunuza Sorun" : "Questions to Ask"}
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {result.questionsToAsk.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-sky-500 font-bold mt-0.5">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips + What to Bring */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.tipsForVisit && result.tipsForVisit.length > 0 && (
                  <div className="bg-sky-50 dark:bg-sky-900/10 rounded-2xl border border-sky-200 dark:border-sky-800 p-5">
                    <h3 className="font-semibold text-sky-800 dark:text-sky-400 mb-2 text-sm">
                      {lang === "tr" ? "Ziyaret İpuçları" : "Visit Tips"}
                    </h3>
                    <ul className="space-y-1">
                      {result.tipsForVisit.map((t, i) => (
                        <li key={i} className="text-sm text-sky-700 dark:text-sky-300 flex items-start gap-1.5">
                          <span>•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.whatToBring && result.whatToBring.length > 0 && (
                  <div className="bg-sky-50 dark:bg-sky-900/10 rounded-2xl border border-sky-200 dark:border-sky-800 p-5">
                    <h3 className="font-semibold text-sky-800 dark:text-sky-400 mb-2 text-sm">
                      {lang === "tr" ? "Yanınıza Alın" : "What to Bring"}
                    </h3>
                    <ul className="space-y-1">
                      {result.whatToBring.map((w, i) => (
                        <li key={i} className="text-sm text-sky-700 dark:text-sky-300 flex items-start gap-1.5">
                          <span>•</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{lang === "tr" ? "Semptomlarınızı anlatın" : "Describe your symptoms above"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
