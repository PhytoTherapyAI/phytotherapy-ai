// © 2026 Doctopal — All Rights Reserved
"use client";

import { tx } from "@/lib/translations";

type Chronotype = "bear" | "wolf" | "dolphin" | "lion";

interface ChronotypeCardProps {
  chronotype: string;  // from API: "early_bird", "intermediate", "night_owl"
  lang: "en" | "tr";
}

const ANIMAL_MAP: Record<string, Chronotype> = {
  early_bird: "lion",
  intermediate: "bear",
  night_owl: "wolf",
};

const ANIMALS: Record<Chronotype, { emoji: string; gradient: string }> = {
  bear: { emoji: "🐻", gradient: "from-amber-400 to-orange-500" },
  wolf: { emoji: "🐺", gradient: "from-indigo-500 to-purple-600" },
  dolphin: { emoji: "🐬", gradient: "from-cyan-400 to-blue-500" },
  lion: { emoji: "🦁", gradient: "from-yellow-400 to-amber-500" },
};

export function ChronotypeCard({ chronotype, lang }: ChronotypeCardProps) {
  const animal = ANIMAL_MAP[chronotype] || "bear";
  const config = ANIMALS[animal];

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${config.gradient} p-4 text-white shadow-lg`}>
      {/* Background emoji */}
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-15 select-none">
        {config.emoji}
      </div>

      <div className="relative space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          {tx("sleep.chronotypeAnimal", lang)}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-3xl">{config.emoji}</span>
          <h3 className="text-xl font-bold">{tx(`sleep.${animal}`, lang)}</h3>
        </div>
        <p className="text-xs leading-relaxed opacity-90">
          {tx(`sleep.${animal}Desc`, lang)}
        </p>
      </div>
    </div>
  );
}
