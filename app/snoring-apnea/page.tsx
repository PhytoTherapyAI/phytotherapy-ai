"use client";

import { useState } from "react";
import { Moon, AlertTriangle, CheckCircle2, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SnoringResult {
  score: number;
  risk: string;
  riskLabel: string;
  recommendation: string;
}

const QUESTIONS = [
  { en: "S - Do you Snore loudly (louder than talking or loud enough to be heard through closed doors)?", tr: "S - Yuksek sesle horluyor musunuz (konusmadan yuksek veya kapali kapilar ardisndan duyulabilir)?" },
  { en: "T - Do you often feel Tired, fatigued, or sleepy during daytime?", tr: "T - Gun icerisinde sik sik yorgun, bitkin veya uykulu hissediyor musunuz?" },
  { en: "O - Has anyone Observed you stop breathing during your sleep?", tr: "O - Uykunuz sirasinda nefes durmanizi birisi Gozlemledi mi?" },
  { en: "P - Do you have or are being treated for high blood Pressure?", tr: "P - Yuksek tansiyonunuz var mi veya tedavi goruyor musunuz?" },
  { en: "B - Is your BMI more than 35 kg/m2?", tr: "B - Vucut kitle indeksiniz 35 kg/m2'den fazla mi?" },
  { en: "A - Is your Age over 50 years old?", tr: "A - Yasiniz 50'nin uzerinde mi?" },
  { en: "N - Is your Neck circumference greater than 40 cm (15.7 in)?", tr: "N - Boyun cevreniz 40 cm'den fazla mi?" },
  { en: "G - Is your Gender male?", tr: "G - Cinsiyetiniz erkek mi?" },
];

export default function SnoringApneaPage() {
  const { lang } = useLang();
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(8).fill(null));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SnoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = answers.every((a) => a !== null);

  const handleCalculate = async () => {
    if (!allAnswered) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/snoring-apnea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answers as boolean[], lang }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const riskColor = (r: string) => {
    if (r === "low") return "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
    if (r === "moderate") return "bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-400";
    return "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Moon className="w-10 h-10 text-blue-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("snoring.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("snoring.subtitle", lang)}</p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-400">
          {lang === "tr"
            ? "STOP-BANG, obstruktif uyku apnesi riskini degerlendirmek icin klinik olarak dogrulanmis bir tarama aracidir."
            : "STOP-BANG is a clinically validated screening tool for assessing obstructive sleep apnea risk."}
        </p>
      </div>

      {/* Questionnaire */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 space-y-4">
        {QUESTIONS.map((q, i) => (
          <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">{q[lang]}</p>
            <div className="flex gap-3">
              <button
                onClick={() => { const a = [...answers]; a[i] = true; setAnswers(a); setResult(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${answers[i] === true ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500"}`}
              >
                {lang === "tr" ? "Evet" : "Yes"}
              </button>
              <button
                onClick={() => { const a = [...answers]; a[i] = false; setAnswers(a); setResult(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${answers[i] === false ? "bg-gray-600 text-white" : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500"}`}
              >
                {lang === "tr" ? "Hayir" : "No"}
              </button>
            </div>
          </div>
        ))}

        <Button onClick={handleCalculate} disabled={!allAnswered || isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {tx("snoring.calculate", lang)}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">{error}</div>}

      {/* Result */}
      {result && (
        <div className={`${riskColor(result.risk)} border-2 rounded-xl p-6 text-center`}>
          <p className="text-5xl font-bold mb-2">{result.score}/8</p>
          <p className="text-lg font-semibold mb-3">{result.riskLabel}</p>
          <p className="text-sm">{result.recommendation}</p>
          {result.risk === "high" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {lang === "tr" ? "Uyku laboratuvari degerlendirmesi onerilir" : "Sleep lab evaluation recommended"}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
