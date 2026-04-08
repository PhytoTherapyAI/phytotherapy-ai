// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import { ExternalLink, BookOpen, ChevronDown } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Source {
  title: string;
  url: string;
  year: string;
}

interface SourceCardProps {
  sources: Source[];
}

export function SourceCard({ sources }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useLang();

  if (sources.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted/50"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>{tx("chat.sources", lang)} ({sources.length})</span>
        <ChevronDown
          className={`ml-auto h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-1.5 space-y-1 rounded-lg border bg-muted/20 p-2">
          {sources.map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted"
            >
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <span className="line-clamp-2 text-muted-foreground hover:text-foreground">
                {source.title}
                {source.year && (
                  <span className="ml-1 text-primary">({source.year})</span>
                )}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
