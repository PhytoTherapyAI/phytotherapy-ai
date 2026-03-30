// © 2026 Phytotherapy.ai — All Rights Reserved
// Apple-style "Close the Rings" habit progress visualization

"use client";

interface Ring {
  label: string;
  emoji: string;
  current: number;
  target: number;
  color: string;
}

interface HabitRingsProps {
  rings: Ring[];
}

function RingBar({ ring }: { ring: Ring }) {
  const pct = Math.min((ring.current / ring.target) * 100, 100);
  const isDone = ring.current >= ring.target;

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7 text-center">{ring.emoji}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">{ring.label}</span>
          <span className={`text-[10px] font-bold ${isDone ? "text-emerald-500" : "text-muted-foreground"}`}>
            {ring.current}/{ring.target} {isDone ? "✓" : ""}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: isDone
                ? "linear-gradient(90deg, #22c55e, #10b981)"
                : `linear-gradient(90deg, ${ring.color}, ${ring.color}dd)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function HabitRings({ rings }: HabitRingsProps) {
  const total = rings.reduce((a, r) => a + r.target, 0);
  const done = rings.reduce((a, r) => a + Math.min(r.current, r.target), 0);
  const overallPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3">
      {/* Overall */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {overallPct === 100 ? "🎉 All Done!" : "Today's Progress"}
        </span>
        <span className={`text-sm font-bold ${overallPct === 100 ? "text-emerald-500" : "text-foreground"}`}>
          {overallPct}%
        </span>
      </div>

      {/* Individual rings */}
      <div className="space-y-2.5">
        {rings.map((ring) => (
          <RingBar key={ring.label} ring={ring} />
        ))}
      </div>
    </div>
  );
}
