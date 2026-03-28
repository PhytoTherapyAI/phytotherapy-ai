"use client";

import { useState } from "react";
import { Users, Copy, UserPlus, Bell, Check, Clock, Heart, Shield, Send, Pill, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface Buddy { id: string; name: string; avatar: string; compliance: number; lastActive: string; missedToday: boolean; }

export default function MedicationBuddyPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [inviteCode] = useState("PHYTO-" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);
  const [buddyCode, setBuddyCode] = useState("");
  const [buddies] = useState<Buddy[]>([
    { id: "1", name: "Ayse K.", avatar: "AK", compliance: 94, lastActive: "2 min ago", missedToday: false },
    { id: "2", name: "Mehmet O.", avatar: "MO", compliance: 78, lastActive: "1 hour ago", missedToday: true },
  ]);

  const copyCode = () => { navigator.clipboard.writeText(inviteCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-pink-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "İlaç Arkadasi" : "Medication Buddy"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "Birlikte takip edin, birbirinizi motive edin" : "Track together, motivate each other"}</p>
          </div>
        </div>

        <Card className="p-6 mb-6 text-center border-pink-200 bg-pink-50 dark:bg-pink-900/20">
          <h2 className="text-lg font-semibold mb-2">{isTr ? "Davet Kodunuz" : "Your Invite Code"}</h2>
          <div className="flex items-center justify-center gap-3 mb-3">
            <code className="text-2xl font-mono font-bold tracking-widest text-pink-600">{inviteCode}</code>
            <Button variant="outline" size="sm" onClick={copyCode}>{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</Button>
          </div>
          <p className="text-xs text-gray-500">{isTr ? "Bu kodu arkadasinizla paylasin" : "Share this code with your buddy"}</p>
        </Card>

        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-sm mb-3">{isTr ? "Arkadas Kodu Gir" : "Enter Buddy Code"}</h3>
          <div className="flex gap-2">
            <input className="flex-1 rounded-lg border px-3 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-700" placeholder="PHYTO-XXXXXX" value={buddyCode} onChange={e => setBuddyCode(e.target.value.toUpperCase())} />
            <Button disabled={buddyCode.length < 8}><UserPlus className="w-4 h-4 mr-1" /> {isTr ? "Ekle" : "Add"}</Button>
          </div>
        </Card>

        <h2 className="text-lg font-semibold mb-3">{isTr ? "Arkadaslariniz" : "Your Buddies"} ({buddies.length})</h2>
        <div className="space-y-3 mb-6">
          {buddies.map(b => (
            <Card key={b.id} className={"p-4 " + (b.missedToday ? "border-red-200" : "")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 font-bold">{b.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.name}</span>
                    {b.missedToday && <Badge className="bg-red-100 text-red-700">{isTr ? "İlaç kacirdi!" : "Missed dose!"}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {b.compliance}% {isTr ? "uyum" : "compliance"}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {b.lastActive}</span>
                  </div>
                </div>
                {b.missedToday && <Button size="sm" variant="outline" className="text-pink-600"><Send className="w-4 h-4 mr-1" /> {isTr ? "Hatirlatma Gonder" : "Send Reminder"}</Button>}
              </div>
              <div className="mt-3"><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className={"h-2 rounded-full " + (b.compliance >= 90 ? "bg-green-500" : b.compliance >= 70 ? "bg-yellow-500" : "bg-red-500")} style={{ width: b.compliance + "%" }} /></div></div>
            </Card>
          ))}
        </div>

        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> {isTr ? "Gizlilik Notu" : "Privacy Note"}</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>{isTr ? "Arkadaslariniz sadece uyum yuzdelerini gorur" : "Buddies can only see compliance percentages"}</li>
            <li>{isTr ? "İlaç isimleri ve dozlari paylasiliamaz" : "Medication names and dosages are not shared"}</li>
            <li>{isTr ? "Istediginiz zaman arkadasi cikarabilirsiniz" : "You can remove a buddy at any time"}</li>
          </ul>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: <Heart className="w-6 h-6 text-pink-500" />, title: isTr ? "Birlikte Daha Iyi" : "Better Together", desc: isTr ? "Buddy kullananlar %34 daha iyi uyum gosteriyor" : "Buddy users show 34% better compliance" },
            { icon: <Bell className="w-6 h-6 text-amber-500" />, title: isTr ? "Nazik Hatirlatma" : "Gentle Reminders", desc: isTr ? "Kacirilan dozlarda otomatik bildirim" : "Automatic notification for missed doses" },
            { icon: <Shield className="w-6 h-6 text-blue-500" />, title: isTr ? "Tam Gizlilik" : "Full Privacy", desc: isTr ? "Sağlık verileriniz asla paylasiliamaz" : "Your health data is never shared" },
          ].map(f => (
            <Card key={f.title} className="p-4 text-center">{f.icon}<h4 className="font-semibold text-sm mt-2">{f.title}</h4><p className="text-xs text-gray-500 mt-1">{f.desc}</p></Card>
          ))}
        </div>
      </div>
    </div>
  );
}