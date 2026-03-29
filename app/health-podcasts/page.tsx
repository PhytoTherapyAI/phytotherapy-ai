"use client";

import { useState } from "react";
import {
  Headphones,
  Star,
  ExternalLink,
  Search,
  Filter,
  Globe,
  Heart,
  Brain,
  Dumbbell,
  Apple,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface Podcast {
  id: number;
  name: string;
  host: string;
  descEn: string;
  descTr: string;
  category: string;
  language: "en" | "tr" | "both";
  rating: number;
  episodes: number;
  link: string;
  featured?: boolean;
}

const CATEGORIES: Record<string, { en: string; tr: string; icon: React.ReactNode }> = {
  all: { en: "All", tr: "Tumunu", icon: <Filter className="w-4 h-4" /> },
  nutrition: { en: "Nutrition", tr: "Beslenme", icon: <Apple className="w-4 h-4" /> },
  mental: { en: "Mental Health", tr: "Mental Sağlık", icon: <Brain className="w-4 h-4" /> },
  fitness: { en: "Fitness", tr: "Fitness", icon: <Dumbbell className="w-4 h-4" /> },
  general: { en: "General Health", tr: "Genel Sağlık", icon: <Heart className="w-4 h-4" /> },
};

const PODCASTS: Podcast[] = [
  { id: 1, name: "Huberman Lab", host: "Dr. Andrew Huberman", descEn: "Stanford neuroscientist explores neuroscience, health optimization, and peak performance with actionable protocols.", descTr: "Stanford norobilimlcisi norobillim, sağlık optimizasyonu ve zirvede performans konularini uygulanabilir protokollerle kesfediyor.", category: "general", language: "en", rating: 4.9, episodes: 200, link: "#", featured: true },
  { id: 2, name: "The Peter Attia Drive", host: "Dr. Peter Attia", descEn: "Deep dives into longevity, metabolic health, and the science of living longer and better.", descTr: "Uzun yasam, metabolik sağlık ve daha uzun ve daha iyi yasama biliminin derinlemesine incelemesi.", category: "general", language: "en", rating: 4.8, episodes: 300, link: "#", featured: true },
  { id: 3, name: "Found My Fitness", host: "Dr. Rhonda Patrick", descEn: "Covers nutrition, aging, and genetics with a focus on scientific evidence and longevity research.", descTr: "Bilimsel kanitlara ve uzun yasam araştırmalarina odaklanarak beslenme, yaslanma ve genetik konularini kapsar.", category: "nutrition", language: "en", rating: 4.7, episodes: 180, link: "#" },
  { id: 4, name: "The Model Health Show", host: "Shawn Stevenson", descEn: "Health, fitness, and nutrition advice with a focus on practical lifestyle changes.", descTr: "Pratik yasam tarzi değişikliklerine odaklanan sağlık, fitness ve beslenme tavsiyeleri.", category: "fitness", language: "en", rating: 4.6, episodes: 600, link: "#" },
  { id: 5, name: "Sağlık Sohbetleri", host: "Phytotherapy.ai", descEn: "Turkish health discussions covering everyday wellness topics and preventive medicine. Coming soon!", descTr: "Günlük sağlık konulari ve koruyucu hekim konularini kapsayan Turkce sağlık sohbetleri. Yakında!", category: "general", language: "tr", rating: 0, episodes: 0, link: "#" },
  { id: 6, name: "The Happiness Lab", host: "Dr. Laurie Santos", descEn: "Yale professor explores the science of happiness and evidence-based well-being strategies.", descTr: "Yale profesoru mutluluk bilimini ve kanita dayali iyi olma stratejilerini kesfediyor.", category: "mental", language: "en", rating: 4.7, episodes: 120, link: "#" },
  { id: 7, name: "Feel Better, Live More", host: "Dr. Rangan Chatterjee", descEn: "UK doctor discusses holistic health, covering sleep, movement, nutrition, and purpose.", descTr: "Ingiliz doktor butunsel sağlığı tartisiyor: uyku, hareket, beslenme ve amac.", category: "general", language: "en", rating: 4.6, episodes: 350, link: "#" },
  { id: 8, name: "Beslenme ve Diyet Podcast", host: "Phytotherapy.ai", descEn: "Turkish nutrition podcast covering diet myths, healthy recipes, and dietary science. Coming soon!", descTr: "Beslenme mitlerini, sağlıkli tarifleri ve diyet bilimini kapsayan Turkce podcast. Yakında!", category: "nutrition", language: "tr", rating: 0, episodes: 0, link: "#" },
  { id: 9, name: "The Mindful Kind", host: "Rachael Kable", descEn: "Mindfulness and mental wellness practices for everyday life, with guided exercises.", descTr: "Günlük yasam için farkindalilik ve mental sağlık uygulamalari, rehberli egzersizlerle.", category: "mental", language: "en", rating: 4.5, episodes: 300, link: "#" },
  { id: 10, name: "Mind Pump", host: "Sal Di Stefano", descEn: "Fitness industry experts discuss training, nutrition, and debunk common workout myths.", descTr: "Fitness sektoru uzmanlari antrenman, beslenme konularini tartisiyor ve yaygin egzersiz mitlerini curtuyor.", category: "fitness", language: "en", rating: 4.5, episodes: 2000, link: "#" },
  { id: 11, name: "Fitoterapi Dunyasi", host: "Phytotherapy.ai", descEn: "Explores evidence-based herbal medicine, plant-drug interactions, and traditional remedies. Coming soon!", descTr: "Kanita dayali bitkisel tip, bitki-ilac etkilesimleri ve geleneksel tedavileri kesfeder. Yakında!", category: "general", language: "tr", rating: 0, episodes: 0, link: "#", featured: true },
  { id: 12, name: "Therapy Chat", host: "Laura Reagan", descEn: "Mental health discussions including trauma, anxiety, depression, and therapeutic approaches.", descTr: "Travma, anksiyete, depresyon ve terapotik yaklasimlar dahil mental sağlık tartismalari.", category: "mental", language: "en", rating: 4.4, episodes: 400, link: "#" },
  { id: 13, name: "NutritionFacts Podcast", host: "Dr. Michael Greger", descEn: "Evidence-based nutrition research, disease prevention through diet, and plant-based health.", descTr: "Kanita dayali beslenme araştırmalari, diyetle hastalık onleme ve bitki bazli sağlık.", category: "nutrition", language: "en", rating: 4.6, episodes: 250, link: "#" },
  { id: 14, name: "Spor ve Yasam", host: "Phytotherapy.ai", descEn: "Turkish fitness coaching covering workout routines, recovery, and sports nutrition. Coming soon!", descTr: "Antrenman rutinleri, toparlanma ve spor beslenmesini kapsayan Turkce fitness koclugu. Yakında!", category: "fitness", language: "tr", rating: 0, episodes: 0, link: "#" },
  { id: 15, name: "The Doctor's Kitchen", host: "Dr. Rupy Aujla", descEn: "NHS doctor combines culinary medicine with evidence-based nutrition for disease prevention.", descTr: "NHS doktoru mutfak tibbini hastalık onleme için kanita dayali beslenmeyle birlestiriyor.", category: "nutrition", language: "en", rating: 4.5, episodes: 180, link: "#" },
  { id: 16, name: "Zihin ve Beden", host: "Phytotherapy.ai", descEn: "Turkish podcast on mind-body connection, meditation, stress management, and holistic health. Coming soon!", descTr: "Zihin-beden baglantisi, meditasyon, stres yönetimi ve butunsel sağlık uzerine Turkce podcast. Yakında!", category: "mental", language: "tr", rating: 0, episodes: 0, link: "#" },
];

export default function HealthPodcastsPage() {
  const { lang } = useLang();
  const t = lang === "tr";
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = PODCASTS.filter(p => {
    if (category !== "all" && p.category !== category) return false;
    if (search) {
      const s = search.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.host.toLowerCase().includes(s);
    }
    return true;
  });

  const featured = PODCASTS.filter(p => p.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Headphones className="w-5 h-5" />
            <span className="font-semibold">{t ? "Sağlık Podcast Önerileri" : "Health Podcast Recommendations"}</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {t ? "Dinlerken ogren, sağlığın için en iyi podcast'ler" : "Learn while you listen, the best podcasts for your health"}
          </p>
        </div>

        {featured.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {t ? "One Cikanlar" : "Featured"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {featured.map(p => (
                <Card key={p.id} className="p-4 border-yellow-500/20 bg-yellow-500/5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />{p.rating}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{p.host}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{t ? p.descTr : p.descEn}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t ? "Podcast veya sunucu ara..." : "Search podcasts or hosts..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <Button
                key={key}
                variant={category === key ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(key)}
                className="gap-1 shrink-0"
              >
                {val.icon}
                {t ? val.tr : val.en}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(p => (
            <Card key={p.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Headphones className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{p.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      {p.language === "both" ? "TR/EN" : p.language.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {t ? CATEGORIES[p.category].tr : CATEGORIES[p.category].en}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.host}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t ? p.descTr : p.descEn}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" /> {p.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.episodes} {t ? "bolum" : "episodes"}
                    </span>
                    <a href={p.link} className="text-xs text-indigo-500 hover:underline flex items-center gap-1 ml-auto">
                      <ExternalLink className="w-3 h-3" />
                      {t ? "Dinle" : "Listen"}
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="p-8 text-center">
              <Headphones className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">{t ? "Podcast bulunamadı" : "No podcasts found"}</p>
            </Card>
          )}
        </div>

        <Card className="p-4 bg-indigo-500/5 border-indigo-500/20">
          <p className="text-sm text-muted-foreground text-center">
            {t
              ? "Bir podcast oneriniz mi var? Bize bildirin ve listemize ekleyelim!"
              : "Have a podcast recommendation? Let us know and we'll add it to our list!"}
          </p>
        </Card>
      </div>
    </div>
  );
}
