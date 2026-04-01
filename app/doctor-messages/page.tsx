// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus, Send, Search, Shield, Stethoscope,
  MessageCircle, Droplets, Pill, Leaf, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { DoctorShell } from "@/components/doctor/DoctorShell";

export default function DoctorMessagesPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const quickTopics = [
    { id: "blood", emoji: "🩸", label: isTr ? "Tahlil Yorumlatma" : "Blood Test Review", icon: Droplets },
    { id: "side", emoji: "💊", label: isTr ? "İlaç Yan Etkisi" : "Drug Side Effect", icon: Pill },
    { id: "supp", emoji: "🌿", label: isTr ? "Takviye Danışmanlığı" : "Supplement Advice", icon: Leaf },
  ];

  return (
    <DoctorShell>
      <div className="min-h-[70vh] bg-stone-50 dark:bg-background">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">

          {/* Trust Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400">
              {isTr ? "Tüm görüşmeleriniz uçtan uca şifrelenir ve tıbbi sır olarak saklanır" : "All conversations are end-to-end encrypted and stored as medical confidential"}
            </span>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input placeholder={isTr ? "Doktor, uzmanlık veya konu ara..." : "Search doctor, specialty or topic..."}
              className="w-full rounded-2xl border bg-white dark:bg-card pl-11 pr-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </motion.div>

          {/* Empty State - Hero */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center text-center py-8">

            {/* Icon with glow */}
            <div className="relative mb-6">
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Stethoscope className="h-10 w-10 text-primary/60" />
                <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md">
                  <MessageCircle className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-2">
              {isTr ? "Sağlık Ekibinizle İletişime Geçin" : "Connect With Your Health Team"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
              {isTr
                ? "Tahlil sonuçlarınızı danışın, ilaç etkileşimlerini sorun veya yeni bir tedavi planı oluşturun."
                : "Discuss your test results, ask about drug interactions, or create a new treatment plan."}
            </p>

            {/* Quick Topic Chips */}
            <div className="w-full max-w-sm space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {isTr ? "Hızlı Konu Seç" : "Quick Topic Select"}
              </p>
              {quickTopics.map((topic, i) => (
                <motion.button key={topic.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ x: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border bg-white dark:bg-card p-4 text-left transition-all ${
                    selectedTopic === topic.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/30"
                  }`}>
                  <span className="text-xl">{topic.emoji}</span>
                  <span className="text-sm font-medium flex-1">{topic.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              ))}
            </div>

            {/* CTA if topic selected */}
            <AnimatePresence>
              {selectedTopic && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="mt-6 w-full max-w-sm">
                  <Button className="w-full gap-2 rounded-2xl py-6 text-sm shadow-lg shadow-primary/20">
                    <MessageSquarePlus className="h-4 w-4" />
                    {isTr ? "Yeni Danışmanlık Başlat" : "Start New Consultation"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FAB */}
          <motion.button whileTap={{ scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary/90 transition-colors">
            <MessageSquarePlus className="h-6 w-6" />
          </motion.button>
        </div>
      </div>
    </DoctorShell>
  );
}
