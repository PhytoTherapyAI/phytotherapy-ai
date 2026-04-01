// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useRef } from "react";
import { Flower2, Play, Pause, RotateCcw, AlertTriangle, ChevronDown, ChevronUp, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface YogaGuide {
  condition: { en: string; tr: string };
  grade: string;
  description: { en: string; tr: string };
  poses: Array<{ name: { en: string; tr: string }; duration: string; note: { en: string; tr: string } }>;
}

const YOGA_GUIDES: YogaGuide[] = [
  {
    condition: { en: "Back Pain", tr: "Bel Ağrısi" },
    grade: "A",
    description: { en: "Strong evidence (RCTs) for yoga improving chronic low back pain. Comparable to physical therapy.", tr: "Yoganin kronik bel ağrısini iyilestirdigi için guclu kanit (RCT'ler). Fizyoterapiye denk." },
    poses: [
      { name: { en: "Cat-Cow", tr: "Kedi-Inek" }, duration: "2 min", note: { en: "Gentle spinal flexion-extension", tr: "Hafif omurga fleksiyon-ekstensiyon" } },
      { name: { en: "Sphinx Pose", tr: "Sfenks Pozu" }, duration: "1 min", note: { en: "Mild backbend, good for disc issues", tr: "Hafif sirt bukulmesi, disk sorunları için iyi" } },
      { name: { en: "Supine Twist", tr: "Sirt Ustu Burgu" }, duration: "1 min each side", note: { en: "Releases lower back tension", tr: "Alt sirt gerginliğini serbest birakir" } },
      { name: { en: "Bridge Pose", tr: "Kopru Pozu" }, duration: "30 sec x3", note: { en: "Strengthens glutes and core", tr: "Kalca ve karni guclendirir" } },
    ],
  },
  {
    condition: { en: "Anxiety", tr: "Anksiyete" },
    grade: "B",
    description: { en: "Moderate evidence for yoga reducing anxiety symptoms. Breath-focused styles most effective.", tr: "Yoganin anksiyete semptomlarini azalttigi için orta düzeyde kanit. Nefes odakli stiller en etkili." },
    poses: [
      { name: { en: "Legs Up The Wall", tr: "Bacaklar Duvarda" }, duration: "5 min", note: { en: "Activates parasympathetic nervous system", tr: "Parasempatik sinir sistemini aktive eder" } },
      { name: { en: "Forward Fold", tr: "One Egilme" }, duration: "1 min", note: { en: "Calming, increases blood flow to brain", tr: "Sakinlestirici, beyine kan akisini arttırır" } },
      { name: { en: "Savasana with 4-7-8 Breath", tr: "Savasana + 4-7-8 Nefes" }, duration: "5 min", note: { en: "Deep relaxation with counted breathing", tr: "Sayimli nefesle derin gevsetme" } },
    ],
  },
  {
    condition: { en: "Hypertension", tr: "Hipertansiyon" },
    grade: "B",
    description: { en: "Moderate evidence for yoga reducing blood pressure. Avoid inversions if BP uncontrolled.", tr: "Yoganin tansiyonu dusürdügu için orta düzeyde kanit. Tansiyon kontrol altinda degilse ters duruslardari kacinin." },
    poses: [
      { name: { en: "Seated Forward Bend", tr: "Oturarak One Egilme" }, duration: "2 min", note: { en: "Gentle, no strain", tr: "Hafif, zorlanma yok" } },
      { name: { en: "Corpse Pose (Savasana)", tr: "Olum Pozu (Savasana)" }, duration: "10 min", note: { en: "Proven to reduce systolic BP 4-5 mmHg", tr: "Sistolik tansiyonu 4-5 mmHg dusürdügu kanitlanmistir" } },
    ],
  },
];

const MEDITATION_TECHNIQUES = [
  { name: { en: "Box Breathing (4-4-4-4)", tr: "Kutu Nefesi (4-4-4-4)" }, duration: 16, desc: { en: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Used by Navy SEALs for stress.", tr: "4s nefes al, 4s tut, 4s ver, 4s tut. Stres için Navy SEALs tarafindan kullanilir." } },
  { name: { en: "Body Scan", tr: "Vücut Taraması" }, duration: 300, desc: { en: "Systematically focus attention from toes to head, releasing tension.", tr: "Sistematik olarak dikkati ayak parmaklarından başa yönlendirin, gerginliği serbest bırakın." } },
  { name: { en: "Loving-Kindness (Metta)", tr: "Sevgi-Sefkat (Metta)" }, duration: 300, desc: { en: "Send goodwill to self, loved ones, then all beings.", tr: "Kendinize, sevdiklerinize, sonra tum varliklara iyi niyet gonderin." } },
];

const DANGEROUS_POSES_OSTEOPOROSIS = [
  { en: "Forward folds with rounding spine", tr: "Sirti yuvarlayarak one egilme" },
  { en: "Full spinal twists", tr: "Tam omurga burgusu" },
  { en: "Sit-ups/crunches", tr: "Mekikler" },
  { en: "Headstand/Shoulderstand", tr: "Bas ustu/Omuz ustu durus" },
];

export default function YogaMeditationPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hasOsteoporosis = Array.isArray(profile?.chronic_conditions) && profile.chronic_conditions.some((c: string) => c.toLowerCase().includes("osteoporosis"));

  useEffect(() => {
    if (timerRunning && meditationTimer > 0) {
      intervalRef.current = setInterval(() => setMeditationTimer((t) => t - 1), 1000);
    } else if (meditationTimer === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, meditationTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Flower2 className="w-10 h-10 text-purple-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("yoga.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("yoga.subtitle", lang)}</p>
      </div>

      {/* Osteoporosis Warning */}
      {hasOsteoporosis && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                {tx("yoga.osteoWarning", lang)}
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                {tx("yoga.avoidPoses", lang)}
              </p>
              <ul className="space-y-1">
                {DANGEROUS_POSES_OSTEOPOROSIS.map((p, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {p[lang]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Yoga Guides */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {tx("yoga.evidenceBased", lang)}
      </h2>
      <div className="space-y-3 mb-10">
        {YOGA_GUIDES.map((g, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button onClick={() => setExpandedGuide(expandedGuide === i ? null : i)} className="w-full p-5 text-left flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900 dark:text-white">{g.condition[lang]}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${g.grade === "A" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {tx("common.evidence", lang)} {g.grade}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{g.poses.length} {tx("yoga.poses", lang)}</p>
              </div>
              {expandedGuide === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedGuide === i && (
              <div className="px-5 pb-5 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{g.description[lang]}</p>
                {g.poses.map((p, j) => (
                  <div key={j} className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{p.name[lang]}</span>
                      <span className="text-xs text-purple-600 dark:text-purple-400">{p.duration}</span>
                    </div>
                    <p className="text-xs text-gray-500">{p.note[lang]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Meditation Timer */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {tx("yoga.meditationTimer", lang)}
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="space-y-3 mb-6">
          {MEDITATION_TECHNIQUES.map((m, i) => (
            <button
              key={i}
              onClick={() => { setSelectedMeditation(i); setMeditationTimer(m.duration); setTimerRunning(false); }}
              className={`w-full text-left p-4 rounded-lg border transition ${selectedMeditation === i ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-gray-200 dark:border-gray-700"}`}
            >
              <p className="font-medium text-sm text-gray-900 dark:text-white">{m.name[lang]}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.desc[lang]}</p>
            </button>
          ))}
        </div>

        {selectedMeditation !== null && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-purple-300 dark:border-purple-700 mb-4">
              <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white">{formatTime(meditationTimer)}</span>
            </div>
            <div className="flex gap-3 justify-center">
              {!timerRunning ? (
                <Button onClick={() => setTimerRunning(true)} className="bg-purple-600 hover:bg-purple-700 text-white" disabled={meditationTimer === 0}>
                  <Play className="w-4 h-4 mr-2" /> {tx("yoga.start", lang)}
                </Button>
              ) : (
                <Button onClick={() => setTimerRunning(false)} variant="outline">
                  <Pause className="w-4 h-4 mr-2" /> {tx("yoga.pause", lang)}
                </Button>
              )}
              <Button onClick={() => { setMeditationTimer(MEDITATION_TECHNIQUES[selectedMeditation].duration); setTimerRunning(false); }} variant="outline" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
