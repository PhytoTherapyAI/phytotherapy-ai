"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  Tag,
  TrendingUp,
  Loader2,
  Plus,
  Search,
  LogIn,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { createBrowserClient } from "@/lib/supabase";

interface DiaryEntry {
  id: string;
  user_id: string;
  date: string;
  content: string;
  mood: number;
  tags: TagItem[];
  created_at: string;
}

interface TagItem {
  label: string;
  category: TagCategory;
}

type TagCategory = "symptom" | "mood" | "medication" | "exercise" | "food" | "sleep";

const TAG_COLORS: Record<TagCategory, string> = {
  symptom: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  mood: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  medication: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  exercise: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  food: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  sleep: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

const MOOD_EMOJIS = [
  { value: 1, emoji: "\uD83D\uDE2B", label: { en: "Terrible", tr: "Berbat" } },
  { value: 2, emoji: "\uD83D\uDE1F", label: { en: "Bad", tr: "Kotu" } },
  { value: 3, emoji: "\uD83D\uDE10", label: { en: "Okay", tr: "Idare eder" } },
  { value: 4, emoji: "\uD83D\uDE42", label: { en: "Good", tr: "Iyi" } },
  { value: 5, emoji: "\uD83D\uDE04", label: { en: "Great", tr: "Harika" } },
];

const KEYWORD_MAP: Record<string, TagCategory> = {
  headache: "symptom", migraine: "symptom", nausea: "symptom", pain: "symptom",
  fatigue: "symptom", dizziness: "symptom", fever: "symptom", cough: "symptom",
  cramp: "symptom", bloating: "symptom", rash: "symptom", allergy: "symptom",
  "bas ağrısi": "symptom", mide: "symptom", bulantı: "symptom", ağrı: "symptom",
  yorgunluk: "symptom", ates: "symptom", oksuruk: "symptom", sisman: "symptom",
  happy: "mood", sad: "mood", anxious: "mood", stressed: "mood", calm: "mood",
  angry: "mood", depressed: "mood", nervous: "mood", relaxed: "mood",
  mutlu: "mood", uzgun: "mood", stresli: "mood", sakin: "mood", sinirli: "mood",
  endiseli: "mood", kaygı: "mood",
  ibuprofen: "medication", paracetamol: "medication", aspirin: "medication",
  metformin: "medication", vitamin: "medication", supplement: "medication",
  ilac: "medication", hap: "medication", tablet: "medication", takviye: "medication",
  walked: "exercise", running: "exercise", yoga: "exercise", gym: "exercise",
  workout: "exercise", swim: "exercise", cycling: "exercise", stretch: "exercise",
  yuruyus: "exercise", spor: "exercise", kosu: "exercise", egzersiz: "exercise",
  ate: "food", breakfast: "food", lunch: "food", dinner: "food", coffee: "food",
  sugar: "food", protein: "food", salad: "food", fruit: "food",
  kahvalti: "food", ogle: "food", aksam: "food", kahve: "food", seker: "food",
  slept: "sleep", insomnia: "sleep", nap: "sleep", tired: "sleep",
  uyku: "sleep", uykusuz: "sleep", uyudum: "sleep", yorgun: "sleep",
};

function autoDetectTags(text: string): TagItem[] {
  const lower = text.toLowerCase();
  const found: TagItem[] = [];
  const seen = new Set<string>();
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword) && !seen.has(keyword)) {
      seen.add(keyword);
      found.push({ label: keyword, category });
    }
  }
  return found;
}

function getLocalEntries(): DiaryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("health_diary_entries") || "[]");
  } catch { return []; }
}

function setLocalEntries(entries: DiaryEntry[]) {
  localStorage.setItem("health_diary_entries", JSON.stringify(entries));
}

export default function HealthDiaryPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const t = (en: string, tr: string) => (lang === "tr" ? tr : en);

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(3);
  const [detectedTags, setDetectedTags] = useState<TagItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [insightText, setInsightText] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    if (isAuthenticated && session?.user?.id) {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from("health_diary_entries")
          .select("*")
          .eq("user_id", session.user.id)
          .order("date", { ascending: false });
        if (error) throw error;
        setEntries(data || []);
        setUseLocalStorage(false);
      } catch {
        setEntries(getLocalEntries());
        setUseLocalStorage(true);
      }
    } else {
      setEntries(getLocalEntries());
      setUseLocalStorage(true);
    }
    setLoading(false);
  }, [isAuthenticated, session]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  useEffect(() => {
    setDetectedTags(autoDetectTags(content));
  }, [content]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const tags = autoDetectTags(content);
    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      user_id: session?.user?.id || "local",
      date,
      content: content.trim(),
      mood,
      tags,
      created_at: new Date().toISOString(),
    };

    if (!useLocalStorage && isAuthenticated && session?.user?.id) {
      try {
        const supabase = createBrowserClient();
        const { error } = await supabase.from("health_diary_entries").insert({
          user_id: session.user.id,
          date: newEntry.date,
          content: newEntry.content,
          mood: newEntry.mood,
          tags: newEntry.tags,
        });
        if (error) throw error;
      } catch {
        const local = getLocalEntries();
        local.unshift(newEntry);
        setLocalEntries(local);
      }
    } else {
      const local = getLocalEntries();
      local.unshift(newEntry);
      setLocalEntries(local);
    }

    setContent("");
    setMood(3);
    setDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
    setSaving(false);
    loadEntries();
  };

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.label.toLowerCase().includes(q))
      );
    }
    if (selectedTagFilter) {
      result = result.filter((e) =>
        e.tags.some((t) => t.category === selectedTagFilter)
      );
    }
    return result;
  }, [entries, searchQuery, selectedTagFilter]);

  const tagCloud = useMemo(() => {
    const counts: Record<string, { count: number; category: TagCategory }> = {};
    entries.forEach((e) =>
      e.tags.forEach((tag) => {
        const key = tag.label;
        if (!counts[key]) counts[key] = { count: 0, category: tag.category };
        counts[key].count++;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20);
  }, [entries]);

  const runInsightAnalysis = useCallback(() => {
    setInsightLoading(true);
    setShowInsights(true);
    setTimeout(() => {
      const symptomEntries = entries.filter((e) => e.tags.some((t) => t.category === "symptom"));
      const sleepEntries = entries.filter((e) => e.tags.some((t) => t.category === "sleep"));
      const moodAvg = entries.length
        ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1)
        : "N/A";
      const topSymptoms = Object.entries(
        symptomEntries.flatMap((e) => e.tags.filter((t) => t.category === "symptom").map((t) => t.label))
          .reduce((acc: Record<string, number>, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 3);

      const insights: string[] = [];
      if (entries.length < 5) {
        insights.push(t(
          "Keep writing! At least 5 entries are needed for meaningful patterns.",
          "Yazmaya devam et! Anlamli oruntular için en az 5 girdi gerekli."
        ));
      } else {
        insights.push(t(
          `Average mood over ${entries.length} entries: ${moodAvg}/5`,
          `${entries.length} girdi uzerinden ortalama ruh hali: ${moodAvg}/5`
        ));
        if (topSymptoms.length > 0) {
          insights.push(t(
            `Most frequent symptoms: ${topSymptoms.map(([s, c]) => `${s} (${c}x)`).join(", ")}`,
            `En sik belirtiler: ${topSymptoms.map(([s, c]) => `${s} (${c}x)`).join(", ")}`
          ));
        }
        if (sleepEntries.length > 0 && symptomEntries.length > 0) {
          insights.push(t(
            "Sleep mentions correlate with symptom entries - consider tracking sleep quality more closely.",
            "Uyku ile belirtiler arasinda korelasyon var - uyku kalitesini daha yakindan takip etmeyi deneyin."
          ));
        }
        const lowMoodDays = entries.filter((e) => e.mood <= 2);
        if (lowMoodDays.length > entries.length * 0.3) {
          insights.push(t(
            "Over 30% of your entries have low mood scores. Consider discussing this with your doctor.",
            "Girdilerinizin %30'undan fazlasi düşük ruh hali skoru iceriyor. Bunu doktorunuzla gorusmeyi dusunun."
          ));
        }
      }
      setInsightText(insights.join("\n\n"));
      setInsightLoading(false);
    }, 800);
  }, [entries, t]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center space-y-4 max-w-md">
          <BookOpen className="w-16 h-16 mx-auto text-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("Health Diary", "Sağlık Günlüğü")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t("Sign in to start your health diary.", "Sağlık günlüğünuze başlamak için giriş yapın.")}
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            <LogIn className="w-4 h-4 mr-2" />
            {t("Sign In", "Giriş Yap")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("Health Diary", "Sağlık Günlüğü")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("Track your daily health journey", "Günlük sağlık yolculugunuzu takip edin")}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {showForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {showForm ? t("Cancel", "Iptal") : t("New Entry", "Yeni Girdi")}
          </Button>
        </div>

        {/* New Entry Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Mood Selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("How are you feeling?", "Nasil hissediyorsunuz?")}
              </p>
              <div className="flex gap-2">
                {MOOD_EMOJIS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                      mood === m.value
                        ? "bg-emerald-100 dark:bg-emerald-900/50 ring-2 ring-emerald-500 scale-110"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title={m.label[lang === "tr" ? "tr" : "en"]}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      {m.label[lang === "tr" ? "tr" : "en"]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t(
                "Write about your day... How did you feel? Any symptoms? What did you eat? How was your sleep?",
                "Gununuz hakkinda yazın... Nasil hissettiniz? Belirti var mi? Ne yediniz? Uykunuz nasil?"
              )}
              rows={6}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />

            {/* Auto-detected Tags */}
            {detectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                {detectedTags.map((tag, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${TAG_COLORS[tag.category]}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4 mr-2" />
              )}
              {t("Save Entry", "Girdiyi Kaydet")}
            </Button>
          </div>
        )}

        {/* Search + Insights Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search entries...", "Girdilerde ara...")}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <Button
            variant="outline"
            onClick={runInsightAnalysis}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t("AI Insights", "AI Analiz")}
          </Button>
        </div>

        {/* AI Insights Panel */}
        {showInsights && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-200">
                  {t("Pattern Insights", "Oruntu Analizi")}
                </h3>
              </div>
              <button onClick={() => setShowInsights(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            {insightLoading ? (
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("Analyzing your entries...", "Girdileriniz analiz ediliyor...")}
              </div>
            ) : (
              <div className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-line leading-relaxed">
                {insightText}
              </div>
            )}
          </div>
        )}

        {/* Tag Cloud */}
        {tagCloud.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {t("Top Topics", "One Cikan Konular")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tagCloud.map(([label, { count, category }]) => (
                <button
                  key={label}
                  onClick={() =>
                    setSelectedTagFilter(
                      selectedTagFilter === category ? null : category
                    )
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    TAG_COLORS[category]
                  } ${
                    selectedTagFilter === category
                      ? "ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500"
                      : "hover:opacity-80"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
              {selectedTagFilter && (
                <button
                  onClick={() => setSelectedTagFilter(null)}
                  className="px-3 py-1 rounded-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 underline"
                >
                  {t("Clear filter", "Filtreyi temizle")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t(`Entries (${filteredEntries.length})`, `Girdiler (${filteredEntries.length})`)}
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {searchQuery || selectedTagFilter
                  ? t("No entries match your search.", "Aramanizla eslesen girdi yok.")
                  : t("No entries yet. Start writing!", "Henuz girdi yok. Yazmaya başlayin!")}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} lang={lang} t={t} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  lang,
  t,
}: {
  entry: DiaryEntry;
  lang: string;
  t: (en: string, tr: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const moodEmoji = MOOD_EMOJIS.find((m) => m.value === entry.mood)?.emoji || "\uD83D\uDE10";
  const preview = entry.content.length > 120 ? entry.content.slice(0, 120) + "..." : entry.content;
  const dateStr = new Date(entry.date).toLocaleDateString(tx("common.locale", lang as "en" | "tr"), {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">{moodEmoji}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {dateStr}
            </span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {expanded ? entry.content : preview}
          </p>
          {entry.content.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  {t("Show less", "Daha az")}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  {t("Show more", "Daha fazla")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.tags.map((tag, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TAG_COLORS[tag.category]}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
