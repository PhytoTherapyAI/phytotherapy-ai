// © 2026 Doctopal — All Rights Reserved
"use client";

import { Bell, MapPin, Camera } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const PERMISSION_CARDS = [
  {
    icon: Bell,
    titleKey: "onb.permNotifTitle",
    descKey: "onb.permNotifDesc",
    whenKey: "onb.permNotifWhen",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: MapPin,
    titleKey: "onb.permLocationTitle",
    descKey: "onb.permLocationDesc",
    whenKey: "onb.permLocationWhen",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Camera,
    titleKey: "onb.permCameraTitle",
    descKey: "onb.permCameraDesc",
    whenKey: "onb.permCameraWhen",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
];

export function PermissionPreframeStep() {
  const { lang } = useLang();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {tx("onb.permSubtitle", lang)}
      </p>

      <div className="space-y-3">
        {PERMISSION_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.titleKey}
              className={`flex items-start gap-3 rounded-xl border p-4 ${card.bg}`}
            >
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm`}>
                <Icon className={`h-4.5 w-4.5 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{tx(card.titleKey, lang)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tx(card.descKey, lang)}</p>
                <span className="mt-1.5 inline-block rounded-full bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {tx(card.whenKey, lang)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground/70 italic mt-2">
        {tx("onb.permNote", lang)}
      </p>
    </div>
  );
}
