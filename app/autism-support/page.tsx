"use client";

import { useState } from "react";
import { Brain, Calendar, ClipboardList, AlertTriangle, BookOpen, Plus, Check, Clock, Smile, Frown, Meh, Volume2, Sun, Zap, Eye, Hand, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface RoutineItem { id: string; time: string; activity: string; completed: boolean; }
interface BehaviorNote { id: string; date: string; mood: "happy" | "neutral" | "upset"; note: string; }

const SENSORY_TRIGGERS = [
  { id: "1", cat: "Auditory", en: "Loud noises / crowds", tr: "Yuksek ses / kalabalik", severity: "high" as const, icon: <Volume2 className="w-4 h-4" /> },
  { id: "2", cat: "Visual", en: "Bright fluorescent lights", tr: "Parlak floresan isiklar", severity: "medium" as const, icon: <Sun className="w-4 h-4" /> },
  { id: "3", cat: "Tactile", en: "Certain fabric textures", tr: "Bazi kumas dokulari", severity: "medium" as const, icon: <Hand className="w-4 h-4" /> },
  { id: "4", cat: "Visual", en: "Rapid screen transitions", tr: "Hizli ekran gecisleri", severity: "low" as const, icon: <Eye className="w-4 h-4" /> },
  { id: "5", cat: "Sensory", en: "Strong smells (perfume, food)", tr: "Sert kokular (parfum, yiyecek)", severity: "high" as const, icon: <Zap className="w-4 h-4" /> },
  { id: "6", cat: "Auditory", en: "Sudden unexpected sounds", tr: "Ani beklenmedik sesler", severity: "high" as const, icon: <Volume2 className="w-4 h-4" /> },
  { id: "7", cat: "Tactile", en: "Tags on clothing", tr: "Kiyafet etiketleri", severity: "low" as const, icon: <Hand className="w-4 h-4" /> },
];

const DEFAULT_ROUTINES: RoutineItem[] = [
  { id: "1", time: "07:00", activity: "Wake up + sensory-friendly dressing", completed: false },
  { id: "2", time: "07:30", activity: "Breakfast (preferred foods)", completed: false },
  { id: "3", time: "08:00", activity: "Visual schedule review", completed: false },
  { id: "4", time: "09:00", activity: "Occupational therapy session", completed: false },
  { id: "5", time: "10:30", activity: "Sensory break (10 min)", completed: false },
  { id: "6", time: "12:00", activity: "Lunch + social skills practice", completed: false },
  { id: "7", time: "14:00", activity: "Speech therapy", completed: false },
  { id: "8", time: "15:30", activity: "Free play / special interest time", completed: false },
  { id: "9", time: "17:00", activity: "Wind-down routine begins", completed: false },
  { id: "10", time: "19:00", activity: "Bedtime routine (visual checklist)", completed: false },
];

const THERAPY_SCHEDULE = [
  { day: "Mon", sessions: ["OT 09:00", "Speech 14:00"] },
  { day: "Tue", sessions: ["ABA 10:00"] },
  { day: "Wed", sessions: ["OT 09:00", "Social 15:00"] },
  { day: "Thu", sessions: ["Speech 14:00"] },
  { day: "Fri", sessions: ["ABA 10:00", "Music 16:00"] },
  { day: "Sat", sessions: [] },
  { day: "Sun", sessions: [] },
];

export default function AutismSupportPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [activeSection, setActiveSection] = useState("routine");
  const [routines, setRoutines] = useState<RoutineItem[]>(DEFAULT_ROUTINES);
  const [notes, setNotes] = useState<BehaviorNote[]>([
    { id: "1", date: "2026-03-27", mood: "happy", note: isTr ? "Sabah rutini sorunsuz tamamlandi" : "Morning routine completed without issues" },
    { id: "2", date: "2026-03-26", mood: "neutral", note: isTr ? "Ogle yemeginde yeni yiyecek denedi" : "Tried new food at lunch" },
    { id: "3", date: "2026-03-25", mood: "upset", note: isTr ? "Okuldaki gosteri sesi tetikledi" : "School assembly noise was triggering" },
  ]);
  const [newNote, setNewNote] = useState("");
  const [newNoteMood, setNewNoteMood] = useState<"happy" | "neutral" | "upset">("neutral");
  const toggleRoutine = (id: string) => setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  const completedCount = routines.filter(r => r.completed).length;
  const progressPct = Math.round((completedCount / routines.length) * 100);
  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [{ id: Date.now().toString(), date: new Date().toISOString().split("T")[0], mood: newNoteMood, note: newNote.trim() }, ...prev]);
    setNewNote("");
  };
  const sections = [
    { id: "routine", icon: <ClipboardList className="w-4 h-4" />, label: isTr ? "Rutin Takip" : "Routine Tracker" },
    { id: "sensory", icon: <AlertTriangle className="w-4 h-4" />, label: isTr ? "Duyusal Tetikler" : "Sensory Triggers" },
    { id: "therapy", icon: <Calendar className="w-4 h-4" />, label: isTr ? "Terapi Takvimi" : "Therapy Calendar" },
    { id: "behavior", icon: <BookOpen className="w-4 h-4" />, label: isTr ? "Davranis Notlari" : "Behavioral Notes" },
    { id: "resources", icon: <Brain className="w-4 h-4" />, label: isTr ? "Kaynaklar" : "Resources" },
  ];
  const moodIcon = (m: string) => m === "happy" ? <Smile className="w-5 h-5 text-green-500" /> : m === "upset" ? <Frown className="w-5 h-5 text-red-500" /> : <Meh className="w-5 h-5 text-yellow-500" />;
  const sevColor = (s: string) => s === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : s === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Otizm Destek Merkezi" : "Autism Support Center"}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{isTr ? "Ebeveynler icin gunluk takip ve destek araclari" : "Daily tracking and support tools for parents"}</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {sections.map(s => (<Button key={s.id} variant={activeSection === s.id ? "default" : "outline"} size="sm" onClick={() => setActiveSection(s.id)} className="flex items-center gap-1.5 whitespace-nowrap">{s.icon} {s.label}</Button>))}
        </div>

        {activeSection === "routine" && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{isTr ? "Gunluk Ilerleme" : "Daily Progress"}</h2>
                <Badge variant="outline" className="text-purple-600">{completedCount}/{routines.length}</Badge>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2"><div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: progressPct + "%" }} /></div>
              <p className="text-xs text-gray-500">{progressPct}% {isTr ? "tamamlandi" : "completed"}</p>
            </Card>
            <div className="space-y-2">
              {routines.map(item => (
                <Card key={item.id} className={"p-3 flex items-center gap-3 cursor-pointer " + (item.completed ? "bg-green-50 dark:bg-green-900/20 border-green-200" : "")} onClick={() => toggleRoutine(item.id)}>
                  <div className={"w-6 h-6 rounded-full border-2 flex items-center justify-center " + (item.completed ? "bg-green-500 border-green-500" : "border-gray-300")}>{item.completed && <Check className="w-4 h-4 text-white" />}</div>
                  <Clock className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-500 w-12">{item.time}</span>
                  <span className={"text-sm flex-1 " + (item.completed ? "line-through text-gray-400" : "")}>{item.activity}</span>
                </Card>))}
            </div>
          </div>
        )}

        {activeSection === "sensory" && (
          <div className="space-y-4">
            <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <h2 className="text-lg font-semibold mb-1">{isTr ? "Duyusal Tetikleyiciler" : "Sensory Trigger Profile"}</h2>
              <p className="text-sm text-gray-600">{isTr ? "Bilinen tetikleyicileri takip edin." : "Track known triggers and prepare for new environments."}</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SENSORY_TRIGGERS.map(tr => (
                <Card key={tr.id} className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">{tr.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{isTr ? tr.tr : tr.en}</span><Badge className={sevColor(tr.severity)}>{tr.severity}</Badge></div>
                    <span className="text-xs text-gray-500">{tr.cat}</span>
                  </div>
                </Card>))}
            </div>
            <Card className="p-4 border-dashed border-2 flex items-center justify-center gap-2 text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"><Plus className="w-4 h-4" /> {isTr ? "Yeni tetikleyici ekle" : "Add new trigger"}</Card>
          </div>
        )}

        {activeSection === "therapy" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">{isTr ? "Haftalik Terapi Programi" : "Weekly Therapy Schedule"}</h2>
              <div className="grid grid-cols-7 gap-2">
                {THERAPY_SCHEDULE.map(day => (
                  <div key={day.day} className="text-center">
                    <div className="text-xs font-bold text-gray-500 mb-2">{day.day}</div>
                    {day.sessions.length > 0 ? day.sessions.map((s, i) => (<div key={i} className="text-[10px] md:text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 rounded px-1 py-1 mb-1">{s}</div>)) : <div className="text-[10px] text-gray-300">--</div>}
                  </div>))}
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[{ label: isTr ? "Mesleki Terapi" : "Occupational Therapy", count: 2, color: "text-blue-600" }, { label: isTr ? "Konusma Terapisi" : "Speech Therapy", count: 2, color: "text-green-600" }, { label: isTr ? "ABA Terapi" : "ABA Therapy", count: 2, color: "text-orange-600" }].map(th => (
                <Card key={th.label} className="p-4 text-center"><div className={"text-2xl font-bold " + th.color}>{th.count}x</div><div className="text-sm text-gray-600">{th.label} / {isTr ? "hafta" : "week"}</div></Card>))}
            </div>
          </div>
        )}

        {activeSection === "behavior" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3">{isTr ? "Yeni Not Ekle" : "Add New Note"}</h2>
              <div className="flex gap-2 mb-3">{(["happy", "neutral", "upset"] as const).map(m => (<Button key={m} variant={newNoteMood === m ? "default" : "outline"} size="sm" onClick={() => setNewNoteMood(m)}>{moodIcon(m)}</Button>))}</div>
              <div className="flex gap-2">
                <input className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder={isTr ? "Bugunun notlarini yazin..." : "Write observations..."} value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} />
                <Button onClick={addNote} size="sm"><Plus className="w-4 h-4" /></Button>
              </div>
            </Card>
            <div className="space-y-2">
              {notes.map(n => (
                <Card key={n.id} className="p-3 flex items-start gap-3">{moodIcon(n.mood)}<div className="flex-1"><p className="text-sm">{n.note}</p><span className="text-xs text-gray-400">{n.date}</span></div>
                  <Button variant="ghost" size="sm" onClick={() => setNotes(prev => prev.filter(x => x.id !== n.id))}><Trash2 className="w-3.5 h-3.5 text-gray-400" /></Button></Card>))}
            </div>
          </div>
        )}

        {activeSection === "resources" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: isTr ? "Gorsel Program Olusturucu" : "Visual Schedule Builder", desc: isTr ? "Gorsel kartlarla gunluk program" : "Create daily schedules with visual cards", color: "from-blue-500 to-blue-600" },
              { title: isTr ? "Sosyal Hikaye Sablonlari" : "Social Story Templates", desc: isTr ? "Yeni durumlara hazirlama" : "Preparation stories for new situations", color: "from-green-500 to-green-600" },
              { title: isTr ? "Sakinlesme Stratejileri" : "Calming Strategies", desc: isTr ? "Duyusal yuklenme icin teknikler" : "Techniques for sensory overload", color: "from-purple-500 to-purple-600" },
              { title: isTr ? "Ebeveyn Toplulugu" : "Parent Community", desc: isTr ? "Ailelerle deneyim paylasin" : "Share experiences with families", color: "from-orange-500 to-orange-600" },
              { title: isTr ? "IEP / BEP Takipci" : "IEP Goal Tracker", desc: isTr ? "Bireysel egitim plani hedefleri" : "Track education plan goals", color: "from-pink-500 to-pink-600" },
              { title: isTr ? "Terapi Ilerleme Raporu" : "Therapy Progress Report", desc: isTr ? "Terapistler icin ilerleme ozeti" : "Progress summary for therapists", color: "from-teal-500 to-teal-600" },
            ].map(res => (<Card key={res.title} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"><div className={"h-2 bg-gradient-to-r " + res.color} /><div className="p-4"><h3 className="font-semibold text-sm mb-1">{res.title}</h3><p className="text-xs text-gray-500">{res.desc}</p></div></Card>))}
          </div>
        )}
      </div>
    </div>
  );
}