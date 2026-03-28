"use client";

import { useState } from "react";
import { Heart, Trophy, Users, Footprints, Droplets, Flame, Medal, TrendingUp, Star, Award, Target, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface LeaderboardEntry { rank: number; name: string; avatar: string; dept: string; points: number; streak: number; }
interface Challenge { id: string; en: string; tr: string; type: string; participants: number; daysLeft: number; prize: string; }

export default function EmployeeWellnessPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [activeTab, setActiveTab] = useState("challenges");

  const challenges: Challenge[] = [
    { id: "1", en: "10K Steps Daily Challenge", tr: "Günlük 10K Adim", type: "steps", participants: 124, daysLeft: 12, prize: "500 TL Gift Card" },
    { id: "2", en: "Water Intake Champion", tr: "Su Icme Sampiyonu", type: "water", participants: 89, daysLeft: 5, prize: "Smart Bottle" },
    { id: "3", en: "Medication Compliance Sprint", tr: "İlaç Uyumu Yarisi", type: "meds", participants: 67, daysLeft: 18, prize: "Health Kit" },
    { id: "4", en: "Healthy Eating Week", tr: "Sağlıkli Beslenme Haftasi", type: "food", participants: 156, daysLeft: 3, prize: "Organic Box" },
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "Elif T.", avatar: "ET", dept: "Engineering", points: 2450, streak: 28 },
    { rank: 2, name: "Can A.", avatar: "CA", dept: "Marketing", points: 2380, streak: 21 },
    { rank: 3, name: "Zeynep K.", avatar: "ZK", dept: "HR", points: 2290, streak: 14 },
    { rank: 4, name: "Burak S.", avatar: "BS", dept: "Sales", points: 2150, streak: 19 },
    { rank: 5, name: "Ayse M.", avatar: "AM", dept: "Finance", points: 2080, streak: 12 },
    { rank: 6, name: "Mehmet D.", avatar: "MD", dept: "Engineering", points: 1950, streak: 7 },
    { rank: 7, name: "Selin Y.", avatar: "SY", dept: "Design", points: 1870, streak: 15 },
  ];

  const deptStats = [
    { dept: "Engineering", avgPoints: 2200, participation: 92 },
    { dept: "Marketing", avgPoints: 2100, participation: 88 },
    { dept: "HR", avgPoints: 2050, participation: 95 },
    { dept: "Sales", avgPoints: 1900, participation: 78 },
    { dept: "Finance", avgPoints: 1850, participation: 82 },
  ];

  const rankIcon = (r: number) => r === 1 ? <Crown className="w-5 h-5 text-yellow-500" /> : r === 2 ? <Medal className="w-5 h-5 text-gray-400" /> : r === 3 ? <Medal className="w-5 h-5 text-amber-600" /> : <span className="text-sm font-bold text-gray-400 w-5 text-center">{r}</span>;
  const challengeIcon = (t: string) => t === "steps" ? <Footprints className="w-5 h-5" /> : t === "water" ? <Droplets className="w-5 h-5" /> : t === "meds" ? <Heart className="w-5 h-5" /> : <Flame className="w-5 h-5" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "Kurumsal Sağlık Programı" : "Corporate Wellness"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "Meydan okumalar, liderlik tablosu, departman yarislari" : "Challenges, leaderboard, department competitions"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-3 text-center"><Users className="w-5 h-5 text-orange-500 mx-auto mb-1" /><div className="text-xl font-bold">342</div><div className="text-xs text-gray-500">{isTr ? "Katilimci" : "Participants"}</div></Card>
          <Card className="p-3 text-center"><Target className="w-5 h-5 text-green-500 mx-auto mb-1" /><div className="text-xl font-bold">86%</div><div className="text-xs text-gray-500">{isTr ? "Katilim Orani" : "Participation"}</div></Card>
          <Card className="p-3 text-center"><TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" /><div className="text-xl font-bold">+12%</div><div className="text-xs text-gray-500">{isTr ? "Sağlık Skoru" : "Health Score"}</div></Card>
          <Card className="p-3 text-center"><Award className="w-5 h-5 text-purple-500 mx-auto mb-1" /><div className="text-xl font-bold">4</div><div className="text-xs text-gray-500">{isTr ? "Aktif Yarisma" : "Active Challenges"}</div></Card>
        </div>

        <div className="flex gap-2 mb-6">{[{id:"challenges",l:isTr?"Yarismar":"Challenges"},{id:"leaderboard",l:isTr?"Liderlik":"Leaderboard"},{id:"departments",l:isTr?"Departmanlar":"Departments"}].map(t=>(<Button key={t.id} variant={activeTab===t.id?"default":"outline"} size="sm" onClick={()=>setActiveTab(t.id)}>{t.l}</Button>))}</div>

        {activeTab === "challenges" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map(c => (
              <Card key={c.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">{challengeIcon(c.type)}</div>
                  <div className="flex-1"><h3 className="font-semibold text-sm">{isTr ? c.tr : c.en}</h3><div className="flex items-center gap-2 mt-0.5"><Badge variant="outline" className="text-xs">{c.participants} {isTr ? "katilimci" : "joined"}</Badge><Badge className="bg-orange-100 text-orange-700 text-xs">{c.daysLeft}d left</Badge></div></div>
                </div>
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500"><Star className="w-3 h-3 inline mr-1" />{c.prize}</span><Button size="sm">{isTr ? "Katil" : "Join"}</Button></div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <Card className="p-4">
            <div className="space-y-2">
              {leaderboard.map(e => (
                <div key={e.rank} className={"flex items-center gap-3 p-3 rounded-lg " + (e.rank <= 3 ? "bg-orange-50 dark:bg-orange-900/10" : "")}>
                  {rankIcon(e.rank)}
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">{e.avatar}</div>
                  <div className="flex-1"><div className="font-medium text-sm">{e.name}</div><div className="text-xs text-gray-500">{e.dept}</div></div>
                  <div className="text-right"><div className="font-bold text-sm">{e.points} pts</div><div className="text-xs text-gray-400">{e.streak}d streak</div></div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "departments" && (
          <div className="space-y-3">
            {deptStats.map((d, i) => (
              <Card key={d.dept} className="p-4 flex items-center gap-4">
                <div className="text-lg font-bold text-gray-400 w-6">#{i + 1}</div>
                <div className="flex-1"><div className="font-medium text-sm">{d.dept}</div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-orange-500 h-2 rounded-full" style={{width: d.participation + "%"}} /></div></div>
                <div className="text-right"><div className="font-bold text-sm">{d.avgPoints} pts</div><div className="text-xs text-gray-400">{d.participation}% {isTr ? "katilim" : "participation"}</div></div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}