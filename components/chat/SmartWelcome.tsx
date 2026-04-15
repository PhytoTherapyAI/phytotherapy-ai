// © 2026 DoctoPal — All Rights Reserved
// Behavioral Chat Welcome — replaces static example questions
// 1. Contextual greeting (time + mock sleep data)
// 2. Smart personalized chips (curiosity gap)
// 3. Did You Know glassmorphism card (variable reward)

"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, Moon, Dumbbell, Pill, Brain, Leaf, Lightbulb, Mic } from "lucide-react";
import { tx } from "@/lib/translations";

interface SmartWelcomeProps {
  lang: "en" | "tr";
  userName?: string;
  onSelectPrompt: (prompt: string) => void;
  medications?: string[];
  sleepHours?: number;
}

// ── Did You Know facts (rotate on each page load) ──
const DID_YOU_KNOW = [
  { en: "Studies show morning Ashwagandha (300mg) reduces cortisol 20% more effectively than evening dosing.", tr: "Araştırmalar, sabah alınan Ashwagandha'nın (300mg) kortizolü akşam dozuna göre %20 daha etkili dengelediğini gösteriyor.", icon: "leaf", evidence: "B" },
  { en: "Chamomile tea 30 minutes before bed increases sleep quality by 28% according to a 2019 meta-analysis.", tr: "2019 meta-analizine göre yatmadan 30 dakika önce papatya çayı uyku kalitesini %28 artırıyor.", icon: "moon", evidence: "A" },
  { en: "Combining turmeric with black pepper increases curcumin absorption by 2,000%.", tr: "Zerdeçalı karabiber ile birlikte almak kurkumin emilimini %2.000 artırıyor.", icon: "leaf", evidence: "A" },
  { en: "Rhodiola rosea can reduce perceived fatigue by 20% during high-stress periods.", tr: "Rhodiola rosea yoğun stres dönemlerinde algılanan yorgunluğu %20 azaltabilir.", icon: "brain", evidence: "B" },
  { en: "Omega-3 EPA at 1g/day shows antidepressant effects comparable to low-dose SSRIs.", tr: "Günde 1g Omega-3 EPA, düşük doz SSRI'lara benzer antidepresan etki gösteriyor.", icon: "brain", evidence: "A" },
  { en: "Magnesium glycinate before bed improves sleep onset by 17 minutes on average.", tr: "Yatmadan önce magnezyum glisin ortalama 17 dakika daha hızlı uykuya geçişi sağlıyor.", icon: "moon", evidence: "B" },
  { en: "Berberine (500mg 2x/day) matches metformin in blood sugar control for mild insulin resistance.", tr: "Berberin (günde 2x500mg), hafif insülin direncinde kan şekeri kontrolünde metformine eşdeğer etki gösteriyor.", icon: "leaf", evidence: "A" },
];

const ICON_MAP: Record<string, React.ElementType> = {
  leaf: Leaf, moon: Moon, brain: Brain, pill: Pill, dumbbell: Dumbbell,
};

function getTimeGreeting(lang: "en" | "tr", name?: string): { greeting: string; emoji: string } {
  const hour = new Date().getHours();
  const n = name || (lang === "tr" ? "" : "");

  if (hour < 6) return { greeting: lang === "tr" ? `Gece kuşu musun ${n}? 🦉` : `Night owl, ${n}? 🦉`, emoji: "🌙" };
  if (hour < 12) return { greeting: lang === "tr" ? `Günaydın${n ? ` ${n}` : ""}` : `Good morning${n ? `, ${n}` : ""}`, emoji: "☀️" };
  if (hour < 17) return { greeting: lang === "tr" ? `İyi günler${n ? ` ${n}` : ""}` : `Good afternoon${n ? `, ${n}` : ""}`, emoji: "🌤️" };
  if (hour < 21) return { greeting: lang === "tr" ? `İyi akşamlar${n ? ` ${n}` : ""}` : `Good evening${n ? `, ${n}` : ""}`, emoji: "🌅" };
  return { greeting: lang === "tr" ? `İyi geceler${n ? ` ${n}` : ""}` : `Good night${n ? `, ${n}` : ""}`, emoji: "🌙" };
}

function getContextualMessage(lang: "en" | "tr", sleepHours?: number): string | null {
  const hour = new Date().getHours();

  if (sleepHours && sleepHours < 6) {
    return lang === "tr"
      ? `Dün gece ${sleepHours} saat uyuduğunu fark ettim. Uykunu derinleştirecek adaptojenleri konuşalım mı?`
      : `I noticed you slept ${sleepHours} hours last night. Want to discuss adaptogens to deepen your sleep?`;
  }

  if (hour >= 14 && hour <= 16) {
    return tx("smartWelcome.afternoonEnergy", lang);
  }

  if (hour >= 21) {
    return tx("smartWelcome.bedtimeApproaching", lang);
  }

  return null;
}

function getSmartChips(lang: "en" | "tr", meds?: string[], sleepHours?: number): Array<{ emoji: string; text: string }> {
  const chips: Array<{ emoji: string; text: string }> = [];
  const hour = new Date().getHours();

  // Medication-aware chips
  if (meds && meds.length > 0) {
    const medName = meds[0];
    chips.push({
      emoji: "🧬",
      text: lang === "tr"
        ? `Kullandığım ${medName} ile etkileşen bitki çayları neler?`
        : `What herbal teas interact with my ${medName}?`,
    });
  }

  // Sleep-aware chips
  if (sleepHours && sleepHours < 6) {
    chips.push({
      emoji: "😴",
      text: tx("smartWelcome.chipLowSleep", lang),
    });
  }

  // Time-aware chips
  if (hour < 10) {
    chips.push({
      emoji: "☀️",
      text: tx("smartWelcome.chipMorning", lang),
    });
  } else if (hour >= 14 && hour < 17) {
    chips.push({
      emoji: "⚡",
      text: tx("smartWelcome.chipAfternoon", lang),
    });
  } else if (hour >= 20) {
    chips.push({
      emoji: "🌙",
      text: tx("smartWelcome.chipEvening", lang),
    });
  }

  // Always include curiosity gap chips
  chips.push({
    emoji: "✨",
    text: tx("smartWelcome.chipInsight", lang),
  });

  chips.push({
    emoji: "🔬",
    text: tx("smartWelcome.chipPubmed", lang),
  });

  return chips.slice(0, 4);
}

export function SmartWelcome({ lang, userName, onSelectPrompt, medications, sleepHours }: SmartWelcomeProps) {
  const [factIndex] = useState(() => Math.floor(Math.random() * DID_YOU_KNOW.length));
  const fact = DID_YOU_KNOW[factIndex];
  const FactIcon = ICON_MAP[fact.icon] || Leaf;

  const { greeting, emoji } = getTimeGreeting(lang, userName);
  const contextMessage = getContextualMessage(lang, sleepHours);
  const smartChips = useMemo(() => getSmartChips(lang, medications, sleepHours), [lang, medications, sleepHours]);

  return (
    <div className="space-y-4 mb-4">
      {/* ── Contextual Greeting ── */}
      <div className="rounded-2xl bg-gradient-to-r from-lavender/5 via-transparent to-sage/5 border border-lavender/10 p-4 dark:from-lavender/10 dark:to-sage/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lavender to-purple-600 text-white shadow-soft-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold">
              {emoji} {greeting}
            </h2>
            {contextMessage && (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{contextMessage}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed">
              {lang === "tr"
                ? "Sana özel kanıta dayalı yanıtlar sunmak için PubMed, Cochrane ve dünyanın saygın hakemli tıp dergilerini saniyeler içinde tarıyorum."
                : "I scan PubMed, Cochrane, and the world's leading peer-reviewed medical journals in seconds to deliver evidence-based answers tailored to you."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Smart Personalized Chips ── */}
      <div className="flex flex-wrap gap-2">
        {smartChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(chip.text)}
            className="group flex items-center gap-1.5 rounded-full border border-lavender/20 bg-lavender/5 px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:border-lavender/40 hover:bg-lavender/10 hover:shadow-soft active:scale-95 dark:border-lavender/30 dark:bg-lavender/10"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-sm">{chip.emoji}</span>
            <span className="line-clamp-1">{chip.text}</span>
          </button>
        ))}
      </div>

      {/* ── Did You Know Card (glassmorphism) ── */}
      <div className="glass-card rounded-2xl p-3.5 glow-lavender">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lavender/10 dark:bg-lavender/20">
            <Lightbulb className="h-4 w-4 text-lavender" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-lavender">
                {lang === "tr" ? "Biliyor muydunuz?" : "Did You Know?"}
              </p>
              <span className="rounded bg-lavender/10 px-1 py-0.5 text-[9px] font-bold text-lavender dark:bg-lavender/20">
                Grade {fact.evidence}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {fact[lang]}
            </p>
          </div>
          <FactIcon className="h-4 w-4 shrink-0 text-lavender/40 mt-1" />
        </div>
      </div>
    </div>
  );
}
