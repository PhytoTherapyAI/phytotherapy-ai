// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import { User, Leaf, Loader2, FileText, Image as ImageIcon, BookOpen, ShieldCheck, Send, CheckCircle2, Copy, Check, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { AILoadingState } from "@/components/chat/AILoadingState";
import { SmartSuggestions } from "@/components/chat/SmartSuggestions";
import { AIDisclaimer } from "@/components/ai/AIDisclaimer";
import { YellowCodeCard } from "@/components/ai/YellowCodeCard";
import { useAuth } from "@/lib/auth-context";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  /** Special rendering hint — used for system messages that need JSX (e.g. consent-required CTA). */
  kind?: "consent_required" | "management_required";
  /** Display language for kind-based system messages */
  lang?: "en" | "tr";
  /** If set on a consent_required / management_required message, indicates we're acting on
   *  a family member's profile — changes wording. For management_required, always set. */
  targetName?: string;
  /** Present on management_required — used by the "Request permission" button to POST
   *  a custom notification to the family member. */
  targetUserId?: string;
  groupId?: string;
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
  /** Called when user clicks "Grant consent" inside a consent_required bubble */
  onRequestConsent?: () => void;
  /** Sprint 12 — Regenerate: only on the last completed assistant message */
  onRegenerate?: () => void;
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

export function MessageBubble({ message, isLast, onSendFollowUp, onRequestConsent, onRegenerate }: MessageBubbleProps) {
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
                    // eslint-disable-next-line @next/next/no-img-element -- Chat message attachment thumb (data URL), next/image client-side preview için tasarlanmadı
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
          ) : message.kind === "management_required" ? (
            <ManagementRequiredMessage
              lang={message.lang ?? (isTr ? "tr" : "en")}
              targetName={message.targetName}
              targetUserId={message.targetUserId}
              groupId={message.groupId}
            />
          ) : message.kind === "consent_required" ? (
            <ConsentRequiredMessage
              lang={message.lang ?? (isTr ? "tr" : "en")}
              onRequestConsent={onRequestConsent}
              targetName={message.targetName}
            />
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

        {/* Sprint 12 — Action footer: Copy (her assistant) + Regenerate (sadece son assistant) */}
        {!isUser && !message.isStreaming && message.content.trim().length > 0 && message.kind !== "consent_required" && message.kind !== "management_required" && (
          <div className="flex items-center gap-3 mt-1">
            <CopyButton text={mainContent} lang={lang} />
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label={tx("chat.regenerate", lang)}
              >
                <RotateCcw className="h-3 w-3" />
                {tx("chat.regenerate", lang)}
              </button>
            )}
          </div>
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
 * Sprint 12 — Copy to clipboard for assistant messages. ChatGPT-grade UX
 * eksikliği kapatma — kullanıcı yanıtı kopyalayıp WhatsApp'tan doktora veya
 * notlarına aktarabilsin diye. 2 saniye "Kopyalandı" feedback'i sonra Copy
 * icon'una geri döner.
 */
function CopyButton({ text, lang }: { text: string; lang: "en" | "tr" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API başarısız (HTTP context, izin yok) — silent fail; modern
      // browser'larda HTTPS'te garanti var, dev localhost'ta zaten çalışır.
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      aria-label={copied ? tx("chat.copied", lang) : tx("chat.copy", lang)}
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? tx("chat.copied", lang) : tx("chat.copy", lang)}
    </button>
  );
}

/**
 * Simple markdown-like renderer for assistant messages.
 * Handles: **bold**, headers, bullet lists, links, line breaks, <details> blocks,
 * markdown tables (Sprint 12), and the <!--YELLOW_CODE--> marker (FAZ 5) that
 * renders a YellowCodeCard above the text.
 */
function FormattedContent({ content }: { content: string }) {
  // FAZ 5: Extract yellow-code marker (rendered as a card above text, then stripped from content)
  const isYellowCode = /<!--YELLOW_CODE-->/i.test(content);
  const workingContent = content.replace(/<!--YELLOW_CODE-->\n?/gi, "");

  // Extract <details> blocks and render them separately
  const detailsRegex = /<details>([\s\S]*?)<\/details>/gi;
  const parts: Array<{ type: "text" | "details"; content: string }> = [];
  let lastIndex = 0;
  let match;

  // Check if content has details tags
  const hasDetails = /<details>/i.test(workingContent);

  if (hasDetails) {
    // Split into text parts and details parts
    while ((match = detailsRegex.exec(workingContent)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: workingContent.slice(lastIndex, match.index) });
      }
      parts.push({ type: "details", content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < workingContent.length) {
      parts.push({ type: "text", content: workingContent.slice(lastIndex) });
    }
  } else {
    parts.push({ type: "text", content: workingContent });
  }

  return (
    <div className="space-y-1">
      {isYellowCode && <YellowCodeCard />}
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

/**
 * Sprint 12 — Markdown tablo render helper.
 *
 * Tablo formatı (GitHub Flavored Markdown):
 *   | Kolon 1 | Kolon 2 |
 *   |---------|---------|
 *   | Veri 1  | Veri 2  |
 *
 * Separator satırı (`|---|---|`) opsiyonel ama varsa atlanır. Hücre içi
 * `formatInline` ile bold + link parse edilir. Boş tablo (1 satır veya
 * sıfır kolon) null döner — caller paragraph fallback'ine düşer.
 */
function renderTable(lines: string[], keyPrefix: string): React.ReactNode | null {
  // Separator satırlarını filter et (sadece -, |, : ve whitespace içerenler)
  const dataLines = lines.filter((l) => !/^\s*\|?[-:\s|]+\|?\s*$/.test(l));
  if (dataLines.length < 2) return null;

  const rows = dataLines.map((l) => {
    const cells = l.split("|");
    // Başında ve sonunda boş cell'leri kırp (`| a | b |` → ["", " a ", " b ", ""])
    if (cells[0].trim() === "") cells.shift();
    if (cells.length > 0 && cells[cells.length - 1].trim() === "") cells.pop();
    return cells.map((c) => c.trim());
  });

  if (rows.length < 2 || rows[0].length === 0) return null;

  const [headers, ...body] = rows;

  return (
    <div key={keyPrefix} className="overflow-x-auto my-3 rounded-lg border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left p-2 border-b border-border font-medium text-foreground"
              >
                {formatInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              {row.map((cell, j) => (
                <td key={j} className="p-2 text-muted-foreground align-top">
                  {formatInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders plain text/markdown lines */
function TextBlock({ content }: { content: string }) {
  const lines = content.split("\n");
  const rendered: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Sprint 21 — Code block: ```lang\n...\n``` (multi-line, table pattern mirror)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.replace(/^```\s*/, "").trim();
      const codeLines: string[] = [];
      let j = i + 1;
      let foundClosing = false;
      while (j < lines.length) {
        if (lines[j].trim().startsWith("```")) {
          foundClosing = true;
          break;
        }
        codeLines.push(lines[j]);
        j++;
      }
      if (foundClosing) {
        rendered.push(
          <pre
            key={i}
            className="my-2 p-3 rounded-lg bg-muted overflow-x-auto text-xs font-mono border border-border whitespace-pre"
          >
            {lang && (
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                {lang}
              </div>
            )}
            <code>{codeLines.join("\n")}</code>
          </pre>,
        );
        i = j; // closing ``` line'ı atla (dış for++ ile sonraki satıra geçer)
        continue;
      }
      // foundClosing yoksa fallback: normal paragraph render et
    }

    // Sprint 12 — Markdown tablo: ardışık `|` ile başlayan satırları topla
    if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 2) {
      const tableLines: string[] = [trimmed];
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (next.startsWith("|") && next.endsWith("|") && next.length > 2) {
          tableLines.push(next);
          j++;
        } else {
          break;
        }
      }
      const tableNode = renderTable(tableLines, `table-${i}`);
      if (tableNode) {
        rendered.push(tableNode);
        i = j - 1; // dış for loop tarafından i++ yapılacak, j'ye al
        continue;
      }
      // renderTable null döndüyse fallback olarak normal paragraph render et
    }

    // Empty line
    if (trimmed === "") {
      rendered.push(<div key={i} className="h-2" />);
      continue;
    }

    // Skip raw HTML tag lines
    if (/^<\/?(details|summary)>/i.test(trimmed)) {
      continue;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      rendered.push(
        <h4 key={i} className="mt-2 text-sm font-semibold">
          {formatInline(trimmed.slice(4))}
        </h4>,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      rendered.push(
        <h3 key={i} className="mt-3 text-base font-semibold">
          {formatInline(trimmed.slice(3))}
        </h3>,
      );
      continue;
    }

    // Bullet points
    if (trimmed.match(/^[-•*]\s/)) {
      rendered.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="mt-1 text-primary">•</span>
          <span className="text-sm">{formatInline(trimmed.replace(/^[-•*]\s/, ""))}</span>
        </div>,
      );
      continue;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)[.)]\s/);
    if (numMatch) {
      rendered.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="mt-0 min-w-[1.25rem] text-sm font-medium text-primary">
            {numMatch[1]}.
          </span>
          <span className="text-sm">{formatInline(trimmed.replace(/^\d+[.)]\s/, ""))}</span>
        </div>,
      );
      continue;
    }

    // Regular paragraph
    rendered.push(
      <p key={i} className="text-sm">
        {formatInline(trimmed)}
      </p>,
    );
  }

  return <>{rendered}</>;
}

function formatInline(text: string): React.ReactNode {
  // Process **bold**, *italic*, `inline code`, [links](url), and ✅❌⚠️ emoji.
  // Sprint 21 — italic + inline code eklendi (4-way earliest-match comparison).
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold (öncelikli — italic'ten önce, ** çift yıldız)
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Link — accepts absolute (https://...) OR relative (/path, /path#anchor)
    const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/);
    // Inline code — backtick (örn: `aspirin`)
    const codeMatch = remaining.match(/`([^`\n]+)`/);
    // Italic — tek yıldız, ama bold (** çift) ile çakışmasın (negative lookbehind/lookahead)
    const italicMatch = remaining.match(/(?<!\*)\*([^*\n]+)\*(?!\*)/);

    // En küçük index olan match'i seç
    const boldIdx = boldMatch?.index ?? Infinity;
    const linkIdx = linkMatch?.index ?? Infinity;
    const codeIdx = codeMatch?.index ?? Infinity;
    const italicIdx = italicMatch?.index ?? Infinity;
    const minIdx = Math.min(boldIdx, linkIdx, codeIdx, italicIdx);

    if (minIdx === Infinity) {
      parts.push(remaining);
      break;
    }

    if (minIdx === boldIdx && boldMatch) {
      parts.push(remaining.substring(0, boldIdx));
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldIdx + boldMatch[0].length);
    } else if (minIdx === linkIdx && linkMatch) {
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
    } else if (minIdx === codeIdx && codeMatch) {
      parts.push(remaining.substring(0, codeIdx));
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded text-[0.85em] bg-muted font-mono border border-border/50"
        >
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.substring(codeIdx + codeMatch[0].length);
    } else if (italicMatch) {
      parts.push(remaining.substring(0, italicIdx));
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.substring(italicIdx + italicMatch[0].length);
    }
  }

  return <>{parts}</>;
}

/** Renders a KVKK consent-required block. Two modes:
 *  1) targetName set → someone else's consent is missing (no button, just info)
 *  2) targetName unset → caller's own consent is missing (button opens popup)
 */
function ConsentRequiredMessage({
  lang,
  onRequestConsent,
  targetName,
}: {
  lang: "en" | "tr";
  onRequestConsent?: () => void;
  targetName?: string;
}) {
  const tr = lang === "tr";
  const isForTarget = !!targetName;

  return (
    <div className="space-y-3 text-sm text-foreground">
      <div className="flex items-center gap-2 text-primary font-semibold">
        <ShieldCheck className="h-4 w-4" />
        <span>{tr ? "Açık Rıza Gerekli" : "Explicit Consent Required"}</span>
      </div>

      {isForTarget ? (
        <>
          <p>
            {tr ? (
              <>
                Bu aile üyesinin (<strong>{targetName}</strong>) henüz{" "}
                <strong>Yapay Zeka İşleme Açık Rızası</strong> bulunmuyor. AI asistanını
                bu kişi adına kullanabilmeniz için, ilgili kişinin kendi hesabından giriş
                yaparak rıza vermesi gerekmektedir.
              </>
            ) : (
              <>
                This family member (<strong>{targetName}</strong>) has not yet granted{" "}
                <strong>AI Processing Consent</strong>. To use the AI assistant on their
                behalf, they must log in to their own account and grant consent.
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {tr
              ? "KVKK Md.6 uyarınca başkası adına açık rıza verilemez — rıza bizzat ilgili kişi tarafından verilmelidir."
              : "Under KVKK Art.6, consent cannot be granted on behalf of another person — it must come directly from the individual."}
          </p>
        </>
      ) : (
        <>
          <p>
            {tr ? (
              <>
                Yapay zeka asistanını kullanabilmeniz için önce{" "}
                <strong>Yapay Zeka İşleme Açık Rızası</strong> vermeniz gerekmektedir.
              </>
            ) : (
              <>
                To use the AI assistant, you must first provide{" "}
                <strong>AI Processing Explicit Consent</strong>.
              </>
            )}
          </p>
          <p>
            {tr
              ? "Aşağıdaki butona tıklayarak rızanızı hemen verebilirsiniz. Temel hizmetler (ilaç takibi, takvim) rıza olmadan çalışmaya devam eder."
              : "You can grant consent right now by clicking the button below. Basic services (medication tracking, calendar) continue to work without consent."}
          </p>
          {onRequestConsent ? (
            <button
              type="button"
              onClick={onRequestConsent}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              {tr ? "Rıza Ver" : "Grant Consent"}
            </button>
          ) : (
            <Link
              href="/profile#privacy-settings"
              className="inline-block text-primary underline font-medium hover:text-primary/80"
            >
              {tr ? "Gizlilik Ayarları" : "Privacy Settings"}
            </Link>
          )}
          <p className="text-xs text-muted-foreground">
            {tr
              ? "KVKK Md.6 uyarınca sağlık verileriniz ancak açık rızanızla yapay zeka sistemi tarafından işlenebilir."
              : "Under KVKK Art.6, your health data can only be processed by the AI system with your explicit consent."}
          </p>
        </>
      )}
    </div>
  );
}

/** Renders a "management permission not granted" block — shown when the caller
 *  is acting on a family member who hasn't toggled `allows_management` on.
 *  Explains the gate (consent-style copy) and offers a "Request permission"
 *  button that POSTs a custom family_notifications row to the target. The
 *  target sees it in their notification bell and can grant access from their
 *  own Sharing Preferences. */
function ManagementRequiredMessage({
  lang,
  targetName,
  targetUserId,
  groupId,
}: {
  lang: "en" | "tr";
  targetName?: string;
  targetUserId?: string;
  groupId?: string;
}) {
  const tr = lang === "tr";
  const name = targetName || (tr ? "Bu aile üyesi" : "This family member");
  const { user, profile, session } = useAuth();

  // Per-(caller, target) dedupe across reloads. Cleared when target grants
  // access (we leave that to a server-driven refresh) or manually from devtools.
  const storageKey =
    user?.id && targetUserId ? `mgmt_request_${user.id}_${targetUserId}` : null;

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      if (localStorage.getItem(storageKey) === "1") setSent(true);
    } catch {
      /* localStorage unavailable — ok */
    }
  }, [storageKey]);

  const canSend = !!(targetUserId && groupId && session?.access_token && !sent && !sending);

  async function handleSend() {
    if (!canSend || !session?.access_token) return;
    setSending(true);
    setErr(null);
    try {
      const callerDisplay =
        profile?.full_name?.trim() ||
        user?.email?.split("@")[0] ||
        (tr ? "Aile üyeniz" : "A family member");
      const message = tr
        ? `${callerDisplay} sizden yöneticilik izni talep ediyor. Paylaşım Ayarları'ndan izin verebilirsiniz.`
        : `${callerDisplay} is requesting management permission. You can grant it from Sharing Preferences.`;

      const res = await fetch("/api/family/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          groupId,
          toUserId: targetUserId,
          type: "custom",
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error || (tr ? "Talep gönderilemedi" : "Failed to send request"));
        return;
      }

      if (storageKey && typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, "1");
        } catch {
          /* noop */
        }
      }
      setSent(true);
    } catch {
      setErr(tr ? "Sunucu hatası" : "Server error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3 text-sm text-foreground">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
        <ShieldCheck className="h-4 w-4" />
        <span>{tr ? "Yöneticilik İzni Gerekli" : "Management Permission Required"}</span>
      </div>

      <p>
        {tr ? (
          <>
            <strong>{name}</strong> size <strong>yöneticilik izni</strong> vermemiş.
            Bu kişinin profili üzerinden AI asistanını, SBAR raporunu veya diğer aksiyonları
            kullanabilmeniz için, ilgili kişinin kendi hesabından{" "}
            <strong>Paylaşım Ayarları</strong> üzerinden
            &ldquo;Aile yöneticilerine düzenleme izni&rdquo; seçeneğini açması gerekmektedir.
          </>
        ) : (
          <>
            <strong>{name}</strong> has not granted you{" "}
            <strong>management permission</strong>. To use the AI assistant, SBAR report or other
            actions on their profile, they need to log in to their own account and enable{" "}
            &ldquo;Allow admins to edit my profile&rdquo; in{" "}
            <strong>Sharing Preferences</strong>.
          </>
        )}
      </p>

      {/* Request-permission CTA — only shown when we have both IDs. */}
      {targetUserId && groupId && (
        <div className="pt-1">
          {sent ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {tr ? "Talep gönderildi" : "Request sent"}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending
                ? (tr ? "Gönderiliyor…" : "Sending…")
                : tr
                  ? `${name}'a İzin Talebi Gönder`
                  : `Request permission from ${name}`}
            </button>
          )}
          {err && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{err}</p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {tr
          ? "Güvenlik ve gizlilik gereği bu izin yalnızca profil sahibi tarafından verilebilir — başkası adına açılamaz."
          : "For security and privacy, only the profile owner can grant this permission — it cannot be toggled on someone else's behalf."}
      </p>
    </div>
  );
}
