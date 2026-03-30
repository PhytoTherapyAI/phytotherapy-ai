// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { User, Leaf, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { AILoadingState } from "@/components/chat/AILoadingState";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  attachments?: Array<{
    name: string;
    type: "pdf" | "image";
    preview?: string;
  }>;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { lang } = useLang();
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary/10"
            : "bg-primary"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary" />
        ) : (
          <Leaf className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 animate-scale-in ${
          isUser
            ? "bg-primary text-white shadow-sm"
            : "border-l-2 border-l-primary/30 border border-border bg-card shadow-sm"
        }`}
      >
        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.attachments.map((att, i) => (
              <div key={i} className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                isUser ? "bg-primary/70" : "bg-muted"
              }`}>
                {att.type === "pdf" ? (
                  <FileText className="h-3.5 w-3.5" />
                ) : att.preview ? (
                  <img src={att.preview} alt={att.name} className="h-6 w-6 rounded object-cover" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
                <span className="max-w-[100px] truncate">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {message.isStreaming && message.content === "" ? (
          <AILoadingState hasFile={!!message.attachments?.length} />
        ) : (
          <div
            className={`prose prose-sm max-w-none ${
              isUser
                ? "prose-invert"
                : "dark:prose-invert"
            }`}
          >
            <FormattedContent content={message.content} />
          </div>
        )}

        {message.isStreaming && message.content !== "" && (
          <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded-full bg-primary" />
        )}
      </div>
    </div>
  );
}

/**
 * Simple markdown-like renderer for assistant messages.
 * Handles: **bold**, headers, bullet lists, links, line breaks
 */
function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Empty line = paragraph break
        if (line.trim() === "") return <div key={i} className="h-2" />;

        // Headers
        if (line.startsWith("### "))
          return <h4 key={i} className="mt-2 text-sm font-semibold">{formatInline(line.slice(4))}</h4>;
        if (line.startsWith("## "))
          return <h3 key={i} className="mt-3 text-base font-semibold">{formatInline(line.slice(3))}</h3>;

        // Bullet points
        if (line.match(/^[-•*]\s/))
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-1 text-primary">•</span>
              <span className="text-sm">{formatInline(line.replace(/^[-•*]\s/, ""))}</span>
            </div>
          );

        // Numbered lists
        const numMatch = line.match(/^(\d+)[.)]\s/);
        if (numMatch)
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-0 min-w-[1.25rem] text-sm font-medium text-primary">{numMatch[1]}.</span>
              <span className="text-sm">{formatInline(line.replace(/^\d+[.)]\s/, ""))}</span>
            </div>
          );

        // Regular paragraph
        return <p key={i} className="text-sm">{formatInline(line)}</p>;
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  // Process **bold**, [links](url), and ✅❌⚠️ emoji
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Link
    const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);

    // Find which comes first
    const boldIdx = boldMatch?.index ?? Infinity;
    const linkIdx = linkMatch?.index ?? Infinity;

    if (boldIdx === Infinity && linkIdx === Infinity) {
      parts.push(remaining);
      break;
    }

    if (boldIdx <= linkIdx && boldMatch) {
      parts.push(remaining.substring(0, boldIdx));
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldIdx + boldMatch[0].length);
    } else if (linkMatch) {
      parts.push(remaining.substring(0, linkIdx));
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(linkIdx + linkMatch[0].length);
    }
  }

  return <>{parts}</>;
}
