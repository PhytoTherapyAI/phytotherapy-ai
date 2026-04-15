// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Loader2, Trash2, Paperclip, Camera, X, FileText, Image as ImageIcon, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble, ChatMessage } from "./MessageBubble";
import { AIGeneratedBadge } from "@/components/ai/AIDisclaimer";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { checkRedFlags, getEmergencyMessage } from "@/lib/safety-filter";
import {
  canGuestQuery,
  getRemainingGuestQueries,
  recordGuestQuery,
  isPersonalQuery,
} from "@/lib/guest-limit";

interface AttachedFile {
  id: string;
  file: File;
  name: string;
  type: "pdf" | "image";
  preview?: string; // base64 data URL for image preview
  base64?: string;  // base64 content for API
}

const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.heic";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix to get raw base64
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ChatInterfaceProps {
  className?: string;
  onMessagesChange?: (messages: ChatMessage[]) => void;
  loadConversation?: { query: string; response: string | null } | null;
  initialQuery?: string;
}

export function ChatInterface({ className, onMessagesChange, loadConversation, initialQuery }: ChatInterfaceProps) {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang()
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  // Model selection removed — single model (claude-haiku-4-5)
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialQueryFiredRef = useRef(false);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversation from history
  useEffect(() => {
    if (loadConversation) {
      const loaded: ChatMessage[] = [
        {
          id: crypto.randomUUID(),
          role: "user",
          content: loadConversation.query,
        },
      ];
      if (loadConversation.response) {
        loaded.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: loadConversation.response,
        });
      }
      setMessages(loaded);
    }
  }, [loadConversation]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" ${tx("chat.fileTooLarge", lang)}`);
        continue;
      }

      // Determine type
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      if (!isPdf && !isImage) {
        alert(`"${file.name}" ${tx("chat.fileUnsupported", lang)}`);
        continue;
      }

      const base64 = await fileToBase64(file);
      const preview = isImage ? `data:${file.type};base64,${base64}` : undefined;

      setAttachedFiles((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          type: isPdf ? "pdf" : "image",
          preview,
          base64,
        },
      ]);
    }
  }, [lang]);

  const removeFile = useCallback((id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    const hasFiles = attachedFiles.length > 0;
    if ((!trimmed && !hasFiles) || isStreaming) return;

    // Turkey 112 Triage Protocol — client-side safety check
    const triageResult = checkRedFlags(trimmed);

    // KIRMIZI KOD — Hayati tehlike, popup + block, AI cevap vermez
    if (triageResult.type === "red_code") {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const emergencyMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getEmergencyMessage(triageResult.language),
      };
      setMessages((prev) => [...prev, userMsg, emergencyMsg]);
      setInput("");
      return;
    }

    // SARI KOD + YEŞİL KOD — AI cevap verir (sarı kodda server-side disclaimer eklenir)

    // Guest mode checks
    if (!isAuthenticated) {
      // Check if personal query
      if (isPersonalQuery(trimmed)) {
        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: trimmed,
        };
        const blockMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: tx("chat.personalProfileRequired", lang),
        };
        setMessages((prev) => [...prev, userMsg, blockMsg]);
        setInput("");
        return;
      }

      // Check query limit
      if (!canGuestQuery()) {
        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: trimmed,
        };
        const limitMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: tx("chat.queryLimitReached", lang),
        };
        setMessages((prev) => [...prev, userMsg, limitMsg]);
        setInput("");
        return;
      }

      recordGuestQuery(trimmed);
    }

    // Build display content for user message
    const fileNames = attachedFiles.map((f) => f.name);
    const displayContent = hasFiles
      ? `${trimmed || tx("chat.analyzeFile", lang)}${fileNames.length > 0 ? `\n\n📎 ${fileNames.join(", ")}` : ""}`
      : trimmed;

    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    // Capture files before clearing
    const filesToSend = [...attachedFiles];

    // Add user message and assistant placeholder
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: displayContent,
      attachments: attachedFiles.map((f) => ({
        name: f.name,
        type: f.type,
        preview: f.preview,
      })),
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setAttachedFiles([]);
    setIsStreaming(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      // Send only the last 6 messages as history
      const historyForApi = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Include file data if present
      const filesPayload = filesToSend.length > 0
        ? filesToSend.map((f) => ({
            name: f.name,
            type: f.type,
            mimeType: f.file.type,
            base64: f.base64,
          }))
        : undefined;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed || `${tx("chat.analyzeFile", lang)} ${fileNames.join(", ")}`,
          history: historyForApi,
          files: filesPayload,
          lang,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullText } : m
          )
        );
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: tx("chat.connectionError", lang),
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, isAuthenticated, session, messages, attachedFiles, lang]);

  // Auto-fire from URL ?q= parameter
  useEffect(() => {
    if (initialQuery && !initialQueryFiredRef.current) {
      initialQueryFiredRef.current = true;
      setInput(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // When input is set from initialQuery, trigger send
  const initialQueryRef = useRef(initialQuery);
  useEffect(() => {
    if (
      initialQueryRef.current &&
      input === initialQueryRef.current &&
      !isStreaming &&
      messages.length === 0
    ) {
      initialQueryRef.current = undefined;
      const timer = setTimeout(() => sendMessage(), 150);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const remaining = getRemainingGuestQueries();

  return (
    <div className={`flex flex-col ${className || ""}`}>
      {/* AI Response badge — shown when conversation has started */}
      {messages.length > 0 && (
        <div className="flex justify-center pt-2 pb-1">
          <AIGeneratedBadge />
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-t-xl border border-b-0 bg-background p-4 space-y-4"
        style={{ minHeight: "400px", maxHeight: "60vh" }}
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-lavender/10 to-primary/10 p-5 glow-lavender">
              <svg className="h-10 w-10 text-lavender" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold font-heading">
              {tx('chat.emptyTitle', lang)}
            </h3>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              {lang === "tr"
                ? "Sana \u00F6zel kan\u0131ta dayal\u0131 yan\u0131tlar sunmak i\u00E7in PubMed, Cochrane ve d\u00FCnyan\u0131n sayg\u0131n hakemli t\u0131p dergilerini saniyeler i\u00E7inde tar\u0131yorum."
                : "I scan PubMed, Cochrane, and the world\u2019s leading peer-reviewed medical journals in seconds to deliver evidence-based answers tailored to you."}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLast={idx === messages.length - 1}
            onSendFollowUp={(text) => {
              // Set input via DOM (same pattern as example questions) then trigger send
              const textarea = document.querySelector("textarea");
              if (textarea) {
                const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                setter?.call(textarea, text);
                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                // Small delay to let React state update, then click send
                setTimeout(() => {
                  const sendBtn = document.querySelector("[data-send-btn]") as HTMLButtonElement;
                  sendBtn?.click();
                }, 50);
              }
            }}
          />
        ))}

      </div>

      {/* Input area */}
      <div className="rounded-b-xl border bg-card p-3">
        {/* Guest limit indicator */}
        {!isAuthenticated && (
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {remaining > 0
                ? `${remaining} ${tx('chat.freeRemaining', lang)}`
                : tx('chat.freeUsedUp', lang)}
            </span>
            <Link href="/auth/login" className="text-primary hover:underline">
              {tx('chat.signUpUnlimited', lang)}
            </Link>
          </div>
        )}

        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachedFiles.map((f) => (
              <div
                key={f.id}
                className="group relative flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5"
              >
                {f.type === "pdf" ? (
                  <FileText className="h-4 w-4 text-red-500" />
                ) : f.preview ? (
                  <img
                    src={f.preview}
                    alt={f.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                )}
                <span className="max-w-[120px] truncate text-xs">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFileSelect(e.target.files);
            e.target.value = ""; // Reset so same file can be re-selected
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            handleFileSelect(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex items-end gap-2">
          {/* File upload buttons */}
          <div className="flex gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className="h-11 w-11 text-muted-foreground hover:text-primary"
              title={tx("chat.attachFile", lang)}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isStreaming}
              className="h-11 w-11 text-muted-foreground hover:text-primary"
              title={tx("chat.takePhoto", lang)}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isStreaming}
              className="h-11 w-11 text-muted-foreground hover:text-lavender"
              title={lang === "tr" ? "Sesli mesaj" : "Voice message"}
              onClick={() => {
                // Web Speech API (progressive enhancement)
                interface SRAlternative { transcript: string }
                interface SRResultItem { [index: number]: SRAlternative }
                interface SRResultList { [index: number]: SRResultItem }
                interface SRResult { results: SRResultList }
                interface SR { lang: string; interimResults: boolean; onresult: (event: SRResult) => void; start: () => void }
                interface SRConstructor { new (): SR }
                const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
                const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
                if (!SpeechRecognition) return;
                const recognition = new SpeechRecognition();
                recognition.lang = lang === "tr" ? "tr-TR" : "en-US";
                recognition.interimResults = false;
                recognition.onresult = (event: SRResult) => {
                  const transcript = event.results[0][0].transcript;
                  setInput((prev) => prev + (prev ? " " : "") + transcript);
                };
                recognition.start();
              }}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={attachedFiles.length > 0
              ? tx('chat.placeholderFile', lang)
              : tx('chat.placeholderDefault', lang)
            }
            rows={1}
            className="max-h-[150px] min-h-[44px] flex-1 resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex gap-1">
            {messages.length > 0 && !isStreaming && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-11 w-11 text-muted-foreground hover:text-destructive"
                title={tx("chat.clearChat", lang)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              data-send-btn
              onClick={sendMessage}
              disabled={isStreaming || (!input.trim() && attachedFiles.length === 0)}
              className="h-11 w-11 bg-primary hover:bg-primary/90"
              size="icon"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
