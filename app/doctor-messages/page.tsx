// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import { MessageSquare, Send, Search, Shield, Clock, User, CheckCheck, Paperclip, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Message { id: string; from: string; to: string; text: string; time: string; read: boolean; }
interface Conversation { id: string; name: string; avatar: string; lastMessage: string; time: string; unread: number; }

export default function DoctorMessagesPage() {
  const { lang } = useLang();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversations] = useState<Conversation[]>([]);
  const [messages] = useState<Message[]>([]);

  const activeConvo = conversations.find(c => c.id === selectedConvo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tx("doctorMessages.title", lang)}</h1>
            <div className="flex items-center gap-2 mt-0.5"><Badge className="bg-green-100 text-green-700"><Shield className="w-3 h-3 mr-1" />KVKK</Badge><span className="text-xs text-gray-500">{tx("doctorMessages.encrypted", lang)}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder={tx("doctorMessages.searchDoctors", lang)} /></div>
            {conversations.map(c => (
              <Card key={c.id} className={"p-3 cursor-pointer hover:shadow-md transition-shadow " + (selectedConvo === c.id ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20" : "")} onClick={() => setSelectedConvo(c.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><span className="font-medium text-sm truncate">{c.name}</span><span className="text-xs text-gray-400">{c.time}</span></div>
                    <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">{c.unread}</div>}
                </div>
              </Card>
            ))}
          </div>

          <div className="md:col-span-2">
            {selectedConvo ? (
              <Card className="flex flex-col h-[500px]">
                <div className="p-4 border-b flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{activeConvo?.avatar}</div>
                  <div><div className="font-medium text-sm">{activeConvo?.name}</div><div className="text-xs text-green-500">{tx("common.online", lang)}</div></div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={"flex " + (m.from === "patient" ? "justify-end" : "justify-start")}>
                      <div className={"max-w-[80%] rounded-2xl px-4 py-2 " + (m.from === "patient" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800")}>
                        <p className="text-sm">{m.text}</p>
                        <div className={"flex items-center gap-1 mt-1 " + (m.from === "patient" ? "justify-end" : "")}><span className={"text-[10px] " + (m.from === "patient" ? "text-blue-200" : "text-gray-400")}>{m.time}</span>{m.from === "patient" && <CheckCheck className={"w-3 h-3 " + (m.read ? "text-blue-200" : "text-blue-400")} />}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t flex gap-2">
                  <Button variant="ghost" size="sm"><Paperclip className="w-4 h-4" /></Button>
                  <input className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder={tx("doctorMessages.typeMessage", lang)} value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                  <Button size="sm" disabled={!newMessage.trim()}><Send className="w-4 h-4" /></Button>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-[500px] text-gray-400">
                <div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">{tx("doctorMessages.selectConversation", lang)}</p></div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
