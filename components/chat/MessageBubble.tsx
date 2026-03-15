"use client";

import { User, Leaf, Loader2 } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-emerald-100 dark:bg-emerald-900"
            : "bg-emerald-600"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        ) : (
          <Leaf className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-emerald-600 text-white"
            : "border bg-card"
        }`}
      >
        {message.isStreaming && message.content === "" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        ) : (
          <div
            className={`prose prose-sm max-w-none ${
              isUser
                ? "prose-invert"
                : "prose-emerald dark:prose-invert"
            }`}
          >
            <FormattedContent content={message.content} />
          </div>
        )}

        {message.isStreaming && message.content !== "" && (
          <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded-full bg-emerald-500" />
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
              <span className="mt-1 text-emerald-500">•</span>
              <span className="text-sm">{formatInline(line.replace(/^[-•*]\s/, ""))}</span>
            </div>
          );

        // Numbered lists
        const numMatch = line.match(/^(\d+)[.)]\s/);
        if (numMatch)
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-0 min-w-[1.25rem] text-sm font-medium text-emerald-600">{numMatch[1]}.</span>
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
          className="text-emerald-600 underline hover:text-emerald-700"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(linkIdx + linkMatch[0].length);
    }
  }

  return <>{parts}</>;
}
