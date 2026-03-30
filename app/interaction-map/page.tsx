// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState, useMemo } from "react";
import { Network, Loader2, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";

interface MapNode {
  id: string;
  label: string;
  dosage?: string;
}

interface MapEdge {
  source: string;
  target: string;
  severity: "safe" | "caution" | "dangerous";
  description: string;
  mechanism: string;
}

interface MapResult {
  nodes: MapNode[];
  edges: MapEdge[];
  summary: string;
}

const SEVERITY_COLORS = {
  safe: { stroke: "#22c55e", bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-400" },
  caution: { stroke: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400" },
  dangerous: { stroke: "#ef4444", bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400" },
};

const SEVERITY_ICONS = {
  safe: CheckCircle2,
  caution: AlertTriangle,
  dangerous: ShieldAlert,
};

export default function InteractionMapPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MapResult | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<MapEdge | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setSelectedEdge(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/interaction-map", {
        method: "POST",
        headers,
        body: JSON.stringify({ lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate node positions in a circle
  const nodePositions = useMemo(() => {
    if (!data) return {};
    const cx = 250, cy = 200, r = 150;
    const positions: Record<string, { x: number; y: number }> = {};
    data.nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / data.nodes.length - Math.PI / 2;
      positions[node.id] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
    return positions;
  }, [data]);

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-950">
          <Network className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("intMap.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("intMap.subtitle", lang)}
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-center text-sm dark:border-amber-800 dark:bg-amber-950/20">
          <p className="mb-3">
            {tx("intMap.loginRequired", lang)}
          </p>
          <Link href="/auth/login">
            <Button size="sm">{tx("nav.getStarted", lang)}</Button>
          </Link>
        </div>
      )}

      {isAuthenticated && !data && (
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            {tx("intMap.description", lang)}
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("intMap.generating", lang)}
              </>
            ) : (
              <>
                <Network className="h-4 w-4" />
                {tx("intMap.generateBtn", lang)}
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* SVG Graph */}
          <div className="rounded-xl border bg-background p-4 overflow-x-auto">
            <svg viewBox="0 0 500 400" className="mx-auto w-full max-w-lg">
              {/* Edges */}
              {data.edges.map((edge, i) => {
                const from = nodePositions[edge.source];
                const to = nodePositions[edge.target];
                if (!from || !to) return null;
                const colors = SEVERITY_COLORS[edge.severity];
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={colors.stroke}
                    strokeWidth={edge.severity === "dangerous" ? 3 : edge.severity === "caution" ? 2 : 1}
                    strokeDasharray={edge.severity === "safe" ? "4,4" : undefined}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onClick={() => setSelectedEdge(edge)}
                    opacity={selectedEdge && selectedEdge !== edge ? 0.2 : 1}
                  />
                );
              })}

              {/* Nodes */}
              {data.nodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={28}
                      fill="var(--background)"
                      stroke="var(--border)"
                      strokeWidth={2}
                      className="drop-shadow-sm"
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-[10px] font-medium"
                      style={{ fontSize: "10px" }}
                    >
                      {node.label.length > 12
                        ? node.label.slice(0, 11) + "…"
                        : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="mt-3 flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-4 bg-green-500" style={{ display: "inline-block" }} /> {tx("intMap.safe", lang)}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-4 bg-amber-500" style={{ display: "inline-block" }} /> {tx("intMap.caution", lang)}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-4 bg-red-500" style={{ display: "inline-block" }} /> {tx("intMap.dangerous", lang)}
              </span>
            </div>
          </div>

          {/* Selected Edge Detail */}
          {selectedEdge && (
            <div className={`rounded-lg border p-4 ${SEVERITY_COLORS[selectedEdge.severity].bg}`}>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = SEVERITY_ICONS[selectedEdge.severity];
                  return <Icon className={`h-4 w-4 ${SEVERITY_COLORS[selectedEdge.severity].text}`} />;
                })()}
                <span className="text-sm font-bold">
                  {selectedEdge.source} ↔ {selectedEdge.target}
                </span>
              </div>
              <p className="text-sm mb-1">{selectedEdge.description}</p>
              {selectedEdge.mechanism && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">{tx("foodInt.mechanism", lang)}:</span>{" "}
                  {selectedEdge.mechanism}
                </p>
              )}
            </div>
          )}

          {/* Interactions List */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold">{tx("intMap.allInteractions", lang)}</h3>
            <div className="space-y-2">
              {data.edges
                .sort((a, b) => {
                  const order = { dangerous: 0, caution: 1, safe: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map((edge, i) => {
                  const Icon = SEVERITY_ICONS[edge.severity];
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedEdge(edge)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50 ${
                        selectedEdge === edge ? "bg-muted" : ""
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${SEVERITY_COLORS[edge.severity].text}`} />
                      <span className="font-medium">{edge.source} ↔ {edge.target}</span>
                      <span className="flex-1 truncate text-muted-foreground">{edge.description}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="rounded-lg border p-4">
              <p className="text-sm">{data.summary}</p>
            </div>
          )}

          {/* Refresh */}
          <Button
            variant="outline"
            onClick={() => { setData(null); setSelectedEdge(null); }}
            className="w-full"
          >
            {tx("intMap.regenerate", lang)}
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
