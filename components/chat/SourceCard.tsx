"use client";

import { ExternalLink, BookOpen } from "lucide-react";

interface Source {
  title: string;
  url: string;
  year: string;
}

interface SourceCardProps {
  sources: Source[];
}

export function SourceCard({ sources }: SourceCardProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        Sources ({sources.length})
      </h4>
      <div className="space-y-1.5">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted"
          >
            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
            <span className="line-clamp-2 text-muted-foreground hover:text-foreground">
              {source.title}
              {source.year && <span className="ml-1 text-emerald-600">({source.year})</span>}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
