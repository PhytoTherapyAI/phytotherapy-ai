"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Save,
  Trash2,
  MessageSquare,
  Clock,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useRouter } from "next/navigation";

interface DiaryEntry {
  id: string;
  text: string;
  mood: string;
  timestamp: string;
}

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😤", label: "Stressed" },
  { emoji: "🤒", label: "Sick" },
  { emoji: "💪", label: "Energetic" },
  { emoji: "😰", label: "Anxious" },
];

const STORAGE_KEY = "phyto_voice_diary";

function loadEntries(): DiaryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntries(entries: DiaryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function VoiceDiaryPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = tx("common.locale", lang);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentText(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "aborted") {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, [lang]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // Update language before starting
      recognitionRef.current.lang = tx("common.locale", lang);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        // Already started
      }
    }
  }, [isRecording, lang]);

  const handleSave = () => {
    if (!currentText.trim()) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      text: currentText.trim(),
      mood: selectedMood,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setCurrentText("");
    setSelectedMood("");
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  const handleSendToAssistant = (text: string) => {
    const encoded = encodeURIComponent(text);
    router.push(`/health-assistant?q=${encoded}`);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(tx("common.locale", lang), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
          <Mic className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("voice.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("voice.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Speech not supported warning */}
      {!isSupported && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          {tx("voice.speechNotSupported", lang)}
        </div>
      )}

      {/* Recording Area */}
      <div className="mb-6 rounded-lg border p-4">
        {/* Record Button */}
        {isSupported && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={toggleRecording}
              className={`flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all ${
                isRecording
                  ? "animate-pulse border-red-400 bg-red-100 text-red-600 dark:border-red-500 dark:bg-red-950 dark:text-red-400"
                  : "border-purple-300 bg-purple-50 text-purple-600 hover:border-purple-400 hover:bg-purple-100 dark:border-purple-600 dark:bg-purple-950 dark:text-purple-400 dark:hover:border-purple-500"
              }`}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
          </div>
        )}

        <p className="mb-3 text-center text-xs text-muted-foreground">
          {isRecording ? tx("voice.recording", lang) : tx("voice.record", lang)}
        </p>

        {/* Text Area */}
        <textarea
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder={tx("voice.speakOrType", lang)}
          rows={4}
          className="w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
        />

        {/* Mood Selector */}
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            <Smile className="mr-1 inline h-3.5 w-3.5" />
            {tx("voice.mood", lang)}
          </p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(({ emoji, label }) => (
              <button
                key={label}
                onClick={() => setSelectedMood(selectedMood === emoji ? "" : emoji)}
                className={`rounded-lg border px-3 py-1.5 text-lg transition-colors ${
                  selectedMood === emoji
                    ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950"
                    : "hover:bg-muted/50"
                }`}
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!currentText.trim()}
          className="mt-4 w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Save className="h-4 w-4" />
          {tx("voice.save", lang)}
        </Button>
      </div>

      {/* Entries List */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          {tx("voice.entries", lang)}
        </h2>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Mic className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {tx("voice.noEntries", lang)}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {entry.mood && <span className="text-lg">{entry.mood}</span>}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed">{entry.text}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendToAssistant(entry.text)}
                  className="mt-2 gap-1 text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  <MessageSquare className="h-3 w-3" />
                  {tx("voice.sendToAssistant", lang)}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
