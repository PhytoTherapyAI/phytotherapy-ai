"use client";

import { useState, useEffect, useRef } from "react";
import { Accessibility, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Stretch {
  name: { en: string; tr: string };
  instructions: { en: string; tr: string };
  holdSeconds: number;
  targetArea: string;
}

interface PainPoint {
  id: string;
  label: { en: string; tr: string };
  stretches: Stretch[];
}

const PAIN_POINTS: PainPoint[] = [
  {
    id: "neck", label: { en: "Neck", tr: "Boyun" },
    stretches: [
      { name: { en: "Neck Side Tilt", tr: "Boyun Yana Egilme" }, instructions: { en: "Tilt head to the right, hold. Repeat left. Keep shoulders down.", tr: "Basi saga yatirin, tutun. Sola tekrarlayin. Omuzlari asagida tutun." }, holdSeconds: 20, targetArea: "neck" },
      { name: { en: "Chin Tuck", tr: "Cene Cekilmesi" }, instructions: { en: "Pull chin straight back creating a double chin. Hold.", tr: "Ceneyi duzce geriye cekin, cift cene oluşturun. Tutun." }, holdSeconds: 10, targetArea: "neck" },
      { name: { en: "Neck Rotation", tr: "Boyun Dondurmesi" }, instructions: { en: "Slowly rotate head to look over right shoulder, then left.", tr: "Basi yavasca saga cevirin sag omzun uzerinden bakin, sonra sola." }, holdSeconds: 15, targetArea: "neck" },
    ],
  },
  {
    id: "shoulders", label: { en: "Shoulders", tr: "Omuzlar" },
    stretches: [
      { name: { en: "Cross-Body Shoulder", tr: "Capraz Omuz Germesi" }, instructions: { en: "Bring right arm across body, use left hand to pull closer. Repeat other side.", tr: "Sag kolu vücudun onunden geçirin, sol elle yaklastirin. Diger tarafta tekrarlayin." }, holdSeconds: 20, targetArea: "shoulders" },
      { name: { en: "Doorway Stretch", tr: "Kapi Esigi Germesi" }, instructions: { en: "Place forearms on door frame, lean forward gently.", tr: "Onkollari kapi kasasina koyun, yavasca one egilin." }, holdSeconds: 20, targetArea: "shoulders" },
    ],
  },
  {
    id: "back", label: { en: "Back", tr: "Sirt" },
    stretches: [
      { name: { en: "Cat-Cow Stretch", tr: "Kedi-Inek Germesi" }, instructions: { en: "On all fours, arch back up (cat), then dip down (cow). Repeat slowly.", tr: "Dort ayak uzerinde sirtsi yuvarlayiniz (kedi), sonra asagi bırakıniz (inek). Yavasca tekrarlayin." }, holdSeconds: 30, targetArea: "back" },
      { name: { en: "Child's Pose", tr: "Cocuk Pozisyonu" }, instructions: { en: "Kneel, sit on heels, stretch arms forward on floor.", tr: "Dizleriniz uzerinde, topuklarin uzerine oturun, kollarinizi yerde one uzatin." }, holdSeconds: 30, targetArea: "back" },
      { name: { en: "Seated Spinal Twist", tr: "Oturarak Omurga Burgusu" }, instructions: { en: "Sit, cross right leg over left, twist torso to right. Repeat other side.", tr: "Oturun, sag bacagi solun uzerine koyun, govdeyi saga cevirin. Diger tarafta tekrarlayin." }, holdSeconds: 20, targetArea: "back" },
    ],
  },
  {
    id: "hips", label: { en: "Hips", tr: "Kalca" },
    stretches: [
      { name: { en: "Hip Flexor Stretch", tr: "Kalca Fleksor Germesi" }, instructions: { en: "Kneel on right knee, left foot forward. Lean hips forward gently.", tr: "Sag diz uzerinde dizin, sol ayak one. Kalcalari yavasca one itin." }, holdSeconds: 25, targetArea: "hips" },
      { name: { en: "Pigeon Pose", tr: "Guvercin Pozisyonu" }, instructions: { en: "From plank, bring right knee to right wrist, extend left leg back.", tr: "Plank'tan sag dizi sag bilege getirin, sol bacagi arkaya uzatin." }, holdSeconds: 30, targetArea: "hips" },
    ],
  },
  {
    id: "legs", label: { en: "Legs", tr: "Bacaklar" },
    stretches: [
      { name: { en: "Standing Quad Stretch", tr: "Ayakta Quadriceps Germesi" }, instructions: { en: "Stand on left leg, pull right heel to buttock. Hold.", tr: "Sol bacak uzerinde durun, sag topugu kalcaya cekin. Tutun." }, holdSeconds: 20, targetArea: "legs" },
      { name: { en: "Hamstring Stretch", tr: "Arka Bacak Germesi" }, instructions: { en: "Sit, extend right leg, reach for toes. Keep back straight.", tr: "Oturun, sag bacagi uzatin, ayak parmaklarina uzanin. Sirti duz tutun." }, holdSeconds: 25, targetArea: "legs" },
      { name: { en: "Calf Stretch", tr: "Baldir Germesi" }, instructions: { en: "Face wall, step right foot back, press heel down. Lean into wall.", tr: "Duvara donun, sag ayagi geriye atin, topugu bastirin. Duvara doğru egilin." }, holdSeconds: 20, targetArea: "legs" },
    ],
  },
];

export default function StretchingPage() {
  const { lang } = useLang();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [currentStretch, setCurrentStretch] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const routine = PAIN_POINTS
    .filter((p) => selectedAreas.includes(p.id))
    .flatMap((p) => p.stretches);

  const current = routine[currentStretch];

  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && isRunning) {
      setIsRunning(false);
      setCompleted((c) => new Set(c).add(currentStretch));
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timer, currentStretch]);

  const toggleArea = (id: string) => {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
    setCurrentStretch(0);
    setCompleted(new Set());
    setIsRunning(false);
  };

  const startTimer = () => {
    if (current) {
      setTimer(current.holdSeconds);
      setIsRunning(true);
    }
  };

  const nextStretch = () => {
    if (currentStretch < routine.length - 1) {
      setCurrentStretch((c) => c + 1);
      setIsRunning(false);
      setTimer(0);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Accessibility className="w-10 h-10 text-teal-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("stretch.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("stretch.subtitle", lang)}</p>
      </div>

      {/* Pain Point Selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {tx("stretch.selectPainPoints", lang)}
        </p>
        <div className="flex flex-wrap gap-2">
          {PAIN_POINTS.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleArea(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedAreas.includes(p.id) ? "bg-teal-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"}`}
            >
              {p.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {routine.length > 0 && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-4">
            {routine.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${completed.has(i) ? "bg-teal-500" : i === currentStretch ? "bg-teal-300" : "bg-gray-200 dark:bg-gray-700"}`} />
            ))}
          </div>

          {/* Current Stretch */}
          {current && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{currentStretch + 1} / {routine.length}</span>
                {completed.has(currentStretch) && <CheckCircle2 className="w-5 h-5 text-teal-500" />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{current.name[lang]}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{current.instructions[lang]}</p>

              {/* Timer */}
              <div className="text-center mb-4">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${isRunning ? "border-teal-500" : "border-gray-300 dark:border-gray-600"}`}>
                  <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                    {timer > 0 ? timer : current.holdSeconds}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{tx("stretch.seconds", lang)}</p>
              </div>

              <div className="flex gap-3">
                {!isRunning ? (
                  <Button onClick={startTimer} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                    <Play className="w-4 h-4 mr-2" /> {tx("stretch.start", lang)}
                  </Button>
                ) : (
                  <Button onClick={() => setIsRunning(false)} variant="outline" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" /> {tx("stretch.pause", lang)}
                  </Button>
                )}
                <Button onClick={() => { setTimer(0); setIsRunning(false); }} variant="outline" size="icon">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {completed.has(currentStretch) && currentStretch < routine.length - 1 && (
                <Button onClick={nextStretch} className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white">
                  {tx("stretch.nextStretch", lang)} →
                </Button>
              )}
            </div>
          )}

          {completed.size === routine.length && (
            <div className="text-center p-6 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
              <CheckCircle2 className="w-10 h-10 text-teal-500 mx-auto mb-2" />
              <p className="font-semibold text-teal-800 dark:text-teal-300">
                {tx("stretch.routineComplete", lang)}
              </p>
            </div>
          )}
        </>
      )}

      {selectedAreas.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">{tx("stretch.selectToStart", lang)}</p>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
