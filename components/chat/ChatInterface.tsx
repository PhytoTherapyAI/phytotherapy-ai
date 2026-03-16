"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Trash2, Phone, Paperclip, Camera, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble, ChatMessage } from "./MessageBubble";
import { useAuth } from "@/lib/auth-context";
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
}

export function ChatInterface({ className, onMessagesChange, loadConversation }: ChatInterfaceProps) {
  const { isAuthenticated, session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      // Determine type
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      if (!isPdf && !isImage) {
        alert(`File "${file.name}" is not supported. Please use PDF, JPG, or PNG.`);
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
  }, []);

  const removeFile = useCallback((id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    const hasFiles = attachedFiles.length > 0;
    if ((!trimmed && !hasFiles) || isStreaming) return;

    // Red flag check — client-side
    const redFlag = checkRedFlags(trimmed);
    if (redFlag.isEmergency) {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const emergencyMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `🚨 **${redFlag.language === "tr" ? "ACİL UYARI" : "EMERGENCY WARNING"}**\n\n${getEmergencyMessage(redFlag.language)}`,
      };
      setMessages((prev) => [...prev, userMsg, emergencyMsg]);
      setInput("");
      return;
    }

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
          content:
            "🔒 **Personalized recommendations require a health profile.**\n\nTo ensure your safety, I need to know your medications, allergies, and health conditions before giving personal advice.\n\n👉 **[Sign up](/auth/login)** — it takes less than 2 minutes!\n\nIn the meantime, I can answer general health questions like:\n- \"Does omega-3 reduce inflammation?\"\n- \"What is the evidence for turmeric?\"\n- \"How does valerian root work for sleep?\"",
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
          content:
            "🔒 **You've reached your free query limit.**\n\nGuest users can ask up to 5 questions. To continue with unlimited access and personalized recommendations:\n\n👉 **[Create a free account](/auth/login)**\n\nYour data is encrypted and you can delete it anytime.",
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
      ? `${trimmed || "Analyze this file"}${fileNames.length > 0 ? `\n\n📎 ${fileNames.join(", ")}` : ""}`
      : trimmed;

    // Add user message
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

    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    // Capture files before clearing
    const filesToSend = [...attachedFiles];

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

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: trimmed || `Please analyze the uploaded file(s): ${fileNames.join(", ")}`,
          history: historyForApi,
          files: filesPayload,
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
                content: "⚠️ Could not connect to the server. Please check your internet connection and try again.",
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, isAuthenticated, session, messages, attachedFiles]);

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
      {/* Static Emergency Banner */}
      <div className="flex items-center gap-2.5 rounded-t-xl border border-b-0 bg-red-50/80 px-4 py-2.5 dark:bg-red-950/30">
        <Phone className="h-3.5 w-3.5 shrink-0 text-red-600" />
        <p className="text-xs text-red-700 dark:text-red-400">
          If you are experiencing a life-threatening emergency, call{" "}
          <a href="tel:112" className="font-semibold underline">112</a> /{" "}
          <a href="tel:911" className="font-semibold underline">911</a> immediately.
        </p>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto border border-b-0 bg-background p-4 space-y-4"
        style={{ minHeight: "400px", maxHeight: "60vh" }}
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-emerald-100 p-4 dark:bg-emerald-900">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Ask me anything about health & herbs</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              I use PubMed research to give you evidence-based answers about supplements, herbs, and nutrition.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input area */}
      <div className="rounded-b-xl border bg-card p-3">
        {/* Guest limit indicator */}
        {!isAuthenticated && (
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {remaining > 0
                ? `${remaining} free ${remaining === 1 ? "query" : "queries"} remaining`
                : "Free queries used up"}
            </span>
            <a href="/auth/login" className="text-emerald-600 hover:underline">
              Sign up for unlimited
            </a>
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
              className="h-11 w-11 text-muted-foreground hover:text-emerald-600"
              title="Attach file (PDF, JPG, PNG)"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isStreaming}
              className="h-11 w-11 text-muted-foreground hover:text-emerald-600"
              title="Take photo"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={attachedFiles.length > 0
              ? "Add a message or just send the file..."
              : "Ask a health question (e.g., 'Does omega-3 reduce inflammation?')"
            }
            rows={1}
            className="max-h-[150px] min-h-[44px] flex-1 resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex gap-1">
            {messages.length > 0 && !isStreaming && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-11 w-11 text-muted-foreground hover:text-destructive"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={sendMessage}
              disabled={isStreaming || (!input.trim() && attachedFiles.length === 0)}
              className="h-11 w-11 bg-emerald-600 hover:bg-emerald-700"
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
