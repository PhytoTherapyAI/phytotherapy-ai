// © 2026 DoctoPal — All Rights Reserved
"use client";

import { User, Leaf, Loader2, FileText, Image as ImageIcon, BookOpen } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { AILoadingState } from "@/components/chat/AILoadingState";
import { SmartSuggestions } from "@/components/chat/SmartSuggestions";
import { AIDisclaimer } from "@/components/ai/AIDisclaimer";

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
  isLast?: boolean;
  onSendFollowUp?: (text: string) => void;
}

// Generate follow-up suggestions from AI response content
function getFollowUps(content: string, lang: string): string[] {
  if (!content || content.length < 50) return [];
  const suggestions: string[] = [];
  const isTr = lang === "tr";

  // Check content topics and suggest relevant follow-ups
  const lower = content.toLowerCase();
  if (lower.includes("dose") || lower.includes("doz") || lower.includes("mg")) {
    suggestions.push(isTr ? "Sabah mı, akşam mı alınmalı?" : "Should I take it morning or evening?");
  }
  if (lower.includes("interaction") || lower.includes("etkileşim") || lower.includes("avoid") || lower.includes("kaçın")) {
    suggestions.push(isTr ? "Güvenli bitkisel alternatifler neler?" : "What are safe herbal alternatives?");
  }
  if (lower.includes("supplement") || lower.includes("takviye") || lower.includes("herb") || lower.includes("bitki")) {
    suggestions.push(isTr ? "Olası yan etkileri neler?" : "What are the possible side effects?");
  }
  if (lower.includes("sleep") || lower.includes("uyku")) {
    suggestions.push(isTr ? "Uyku kalitemi artırmak için başka ne yapabilirim?" : "What else can I do to improve my sleep?");
  }
  if (lower.includes("stress") || lower.includes("stres") || lower.includes("anxiety") || lower.includes("anksiyete")) {
    suggestions.push(isTr ? "Doğal stres yönetimi için ne önerirsin?" : "What do you recommend for natural stress management?");
  }
  if (lower.includes("vaccine") || lower.includes("aşı") || lower.includes("tetanus") || lower.includes("tetanoz") || lower.includes("rabies") || lower.includes("kuduz")) {
    suggestions.push(isTr ? "Aşı profilimi güncelle" : "Update my vaccine profile");
  }

  // Always add a general follow-up if we have less than 2
  if (suggestions.length < 2) {
    suggestions.push(isTr ? "Bu konuda daha fazla bilgi ver" : "Tell me more about this");
  }
  if (suggestions.length < 2) {
    suggestions.push(isTr ? "PubMed'de güncel araştırmalar ne diyor?" : "What do recent PubMed studies say?");
  }

  return suggestions.slice(0, 3);
}

export function MessageBubble({ message, isLast, onSendFollowUp }: MessageBubbleProps) {
  const { lang } = useLang();
  const isUser = message.role === "user";
  const showSuggestions = isLast && !isUser && !message.isStreaming && message.content.length > 50 && onSendFollowUp;
  const isTr = lang === "tr";

  // Split main content from sources section (separated by "---")
  const hrSplit = message.content.split(/\n---\n/);
  const mainContent = hrSplit[0];
  const sourcesContent = hrSplit.length > 1 ? hrSplit.slice(1).join("\n---\n") : null;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} ${showSuggestions ? "relative pb-14" : ""}`}>
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

      {/* Message content + sources wrapper */}
      <div className="max-w-[85%] flex flex-col gap-2">
        {/* Main bubble */}
        <div
          className={`rounded-2xl px-4 py-3 animate-scale-in ${
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
              <FormattedContent content={mainContent} />
            </div>
          )}

          {message.isStreaming && message.content !== "" && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded-full bg-primary" />
          )}
        </div>

        {/* Sources panel — rendered outside the main bubble */}
        {!isUser && sourcesContent && sourcesContent.trim().length > 0 && (
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 text-xs">
            <p className="font-semibold text-primary mb-2 flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {isTr ? "Kaynaklar" : "Sources"}
            </p>
            <div className="space-y-1">
              <FormattedContent content={sourcesContent} />
            </div>
          </div>
        )}

        {/* AI disclaimer + right-to-object — MANDATORY on every completed assistant message (TCK Md.90, KVKK Md.11/1-g) */}
        {!isUser && !message.isStreaming && message.content.trim().length > 0 && (
          <AIDisclaimer responseId={message.id} compact />
        )}
      </div>

      {/* Smart follow-up suggestions — only on last assistant message */}
      {showSuggestions && (
        <div className="absolute bottom-0 left-10 right-0">
          <SmartSuggestions
            suggestions={getFollowUps(message.content, lang)}
            onSelect={onSendFollowUp}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Simple markdown-like renderer for assistant messages.
 * Handles: **bold**, headers, bullet lists, links, line breaks, <details> blocks
 */
function FormattedContent({ content }: { content: string }) {
  // Extract <details> blocks first and render them separately
  const detailsRegex = /<details>([\s\S]*?)<\/details>/gi;
  const parts: Array<{ type: "text" | "details"; content: string }> = [];
  let lastIndex = 0;
  let match;

  const cleanContent = content.replace(/<\/?details>/gi, "").replace(/<\/?summary>/gi, "");
  // Check if content has details tags
  const hasDetails = /<details>/i.test(content);

  if (hasDetails) {
    let remaining = content;
    // Split into text parts and details parts
    while ((match = detailsRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: "details", content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({ type: "text", content: content.slice(lastIndex) });
    }
  } else {
    parts.push({ type: "text", content });
  }

  return (
    <div className="space-y-1">
      {parts.map((part, pi) => {
        if (part.type === "details") {
          return <DetailsBlock key={`d-${pi}`} content={part.content} />;
        }
        return <TextBlock key={`t-${pi}`} content={part.content} />;
      })}
    </div>
  );
}

/** Renders a collapsible <details> section (e.g., Sources/Kaynaklar) */
function DetailsBlock({ content }: { content: string }) {
  // Extract summary text
  const summaryMatch = content.match(/<summary>([\s\S]*?)<\/summary>/i);
  const summaryText = summaryMatch ? summaryMatch[1].replace(/[▾▸]/g, "").trim() : "Details";
  const bodyContent = content.replace(/<summary>[\s\S]*?<\/summary>/i, "").trim();

  return (
    <details className="mt-2 rounded-lg border border-primary/15 bg-primary/5 overflow-hidden">
      <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors select-none flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
        {summaryText}
      </summary>
      <div className="px-3 pb-2.5 pt-1 space-y-1.5 border-t border-primary/10">
        <TextBlock content={bodyContent} />
      </div>
    </details>
  );
}

/** Renders plain text/markdown lines */
function TextBlock({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        // Empty line
        if (trimmed === "") return <div key={i} className="h-2" />;

        // Skip raw HTML tag lines
        if (/^<\/?(details|summary)>/i.test(trimmed)) return null;

        // Headers
        if (trimmed.startsWith("### "))
          return <h4 key={i} className="mt-2 text-sm font-semibold">{formatInline(trimmed.slice(4))}</h4>;
        if (trimmed.startsWith("## "))
          return <h3 key={i} className="mt-3 text-base font-semibold">{formatInline(trimmed.slice(3))}</h3>;

        // Bullet points
        if (trimmed.match(/^[-•*]\s/))
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-1 text-primary">•</span>
              <span className="text-sm">{formatInline(trimmed.replace(/^[-•*]\s/, ""))}</span>
            </div>
          );

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)[.)]\s/);
        if (numMatch)
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-0 min-w-[1.25rem] text-sm font-medium text-primary">{numMatch[1]}.</span>
              <span className="text-sm">{formatInline(trimmed.replace(/^\d+[.)]\s/, ""))}</span>
            </div>
          );

        // Regular paragraph
        return <p key={i} className="text-sm">{formatInline(trimmed)}</p>;
      })}
    </>
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
    // Link — accepts absolute (https://...) OR relative (/path, /path#anchor)
    const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/);

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
      const isRelative = linkMatch[2].startsWith("/");
      parts.push(remaining.substring(0, linkIdx));
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target={isRelative ? "_self" : "_blank"}
          rel={isRelative ? undefined : "noopener noreferrer"}
          className="text-primary underline hover:text-primary/80 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(linkIdx + linkMatch[0].length);
    }
  }

  return <>{parts}</>;
}
