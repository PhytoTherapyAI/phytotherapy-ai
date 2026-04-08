// © 2026 DoctoPal — All Rights Reserved
// Behavioral Empty State — encourages action instead of showing "no data"

"use client";

import { type ElementType } from "react";
import { Leaf, Lock } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description: string;
  actionButtonText?: string;
  onAction?: () => void;
  actionHref?: string;
  trustNote?: string;
}

export function EmptyState({
  icon: Icon = Leaf,
  title,
  description,
  actionButtonText,
  onAction,
  actionHref,
  trustNote,
}: EmptyStateProps) {
  const { lang } = useLang();

  const defaultTrust = lang === "tr"
    ? "Verileriniz cihazınızda şifrelenir ve sadece sizin içindir."
    : "Your data is encrypted on your device and is only for you.";

  const ButtonTag = actionHref ? "a" : "button";
  const buttonProps = actionHref
    ? { href: actionHref }
    : { onClick: onAction, type: "button" as const };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Watermark icon with soft glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-150" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/5 to-sage/5">
          <Icon className="h-14 w-14 text-primary/15 dark:text-primary/20" strokeWidth={1.2} />
        </div>
      </div>

      {/* Encouraging title */}
      <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
        {title}
      </h3>

      {/* Empathetic subtitle */}
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Pulsing CTA button */}
      {actionButtonText && (onAction || actionHref) && (
        <ButtonTag
          {...buttonProps}
          className="relative rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-soft-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95 animate-[softPulse_3s_ease-in-out_infinite]"
        >
          {actionButtonText}
        </ButtonTag>
      )}

      {/* Trust micro-note */}
      <p className="mt-5 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
        <Lock className="h-3 w-3" />
        {trustNote || defaultTrust}
      </p>

      <style jsx>{`
        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(60, 122, 82, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(60, 122, 82, 0); }
        }
      `}</style>
    </div>
  );
}
