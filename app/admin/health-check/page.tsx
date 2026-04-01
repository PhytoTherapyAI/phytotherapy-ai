// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ── Types ────────────────────────────────────────── */

interface HealthResult {
  service: string;
  status: "ok" | "error" | "warning";
  message: string;
  responseTime?: number;
}

interface HealthCheckResponse {
  healthy: boolean;
  hasWarnings: boolean;
  timestamp: string;
  results: HealthResult[];
}

interface PageCheckResult {
  path: string;
  status: "ok" | "error" | "pending" | "warning";
  statusCode?: number;
  responseTime?: number;
}

/* ── All known pages ──────────────────────────────── */

const ALL_PAGES = [
  "/", "/about", "/dashboard", "/health-assistant", "/calendar",
  "/interaction-checker", "/family", "/medical-analysis", "/body-analysis",
  "/symptom-checker", "/food-interaction", "/supplement-compare",
  "/interaction-map", "/health-goals", "/prospectus-reader", "/sleep-analysis",
  "/mental-wellness", "/nutrition", "/womens-health", "/chronic-care",
  "/allergy-map", "/appointment-prep", "/travel-health", "/vaccination",
  "/rehabilitation", "/seasonal-health", "/gut-health", "/skin-health",
  "/pharmacogenetics", "/pain-diary", "/elder-care", "/child-health",
  "/sports-performance", "/voice-diary", "/caffeine-tracker",
  "/alcohol-tracker", "/smoking-cessation", "/breathing-exercises",
  "/posture-ergonomics", "/screen-time", "/intermittent-fasting",
  "/sun-exposure", "/water-quality", "/eye-health", "/ear-health",
  "/dental-health", "/hair-nail-health", "/diabetic-foot",
  "/kidney-dashboard", "/liver-monitor", "/thyroid-dashboard",
  "/cardiovascular-risk", "/lung-monitor", "/anxiety-toolkit",
  "/depression-screening", "/adhd-management", "/ptsd-support",
  "/addiction-recovery", "/pregnancy-tracker", "/postpartum-support",
  "/menopause-panel", "/mens-health", "/sexual-health", "/student-health",
  "/military-health", "/retirement-health", "/new-parent-health",
  "/air-quality", "/noise-exposure", "/jet-lag", "/shift-worker",
  "/cancer-screening", "/family-health-tree", "/checkup-planner",
  "/genetic-risk", "/medical-dictionary", "/drug-info",
  "/doctor-communication", "/health-news-verifier", "/first-aid",
  "/health-forum", "/health-challenges", "/support-groups", "/grief-support",
  "/pharmacy-finder", "/insurance-guide", "/medical-records",
  "/emergency-id", "/health-spending", "/wearable-hub", "/proactive-ai",
  "/ar-scanner", "/clinical-trials", "/second-opinion", "/cross-allergy",
  "/detox-facts", "/label-reader", "/anti-inflammatory", "/hydration",
  "/dream-diary", "/snoring-apnea", "/circadian-rhythm", "/stretching",
  "/walking-tracker", "/yoga-meditation", "/rare-diseases", "/donation",
  "/accessibility", "/immigrant-health", "/pet-health", "/enterprise",
  "/courses", "/medication-hub", "/health-guides",
  "/auth/login", "/profile", "/onboarding",
];

/* ── Helpers ──────────────────────────────────────── */

const statusIcon = (s: string) => {
  if (s === "ok") return "✓";
  if (s === "error") return "✗";
  return "!";
};

const statusColor = (s: string) => {
  if (s === "ok") return "#22c55e";
  if (s === "error") return "#ef4444";
  return "#eab308";
};

const statusBg = (s: string) => {
  if (s === "ok") return "rgba(34,197,94,0.08)";
  if (s === "error") return "rgba(239,68,68,0.08)";
  return "rgba(234,179,8,0.08)";
};

/* ── Component ────────────────────────────────────── */

export default function HealthCheckPage() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [pages, setPages] = useState<PageCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filter, setFilter] = useState<"all" | "ok" | "error" | "warning">("all");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Run health check ──── */
  const runHealthCheck = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health-check");
      const data: HealthCheckResponse = await res.json();
      setHealth(data);
    } catch {
      setHealth({
        healthy: false,
        hasWarnings: false,
        timestamp: new Date().toISOString(),
        results: [
          {
            service: "Health Check API",
            status: "error",
            message: "Failed to reach /api/health-check",
          },
        ],
      });
    }
    setLoading(false);
  }, []);

  /* ── Run page checks in batches of 10 ──── */
  const runPageChecks = useCallback(async () => {
    setPagesLoading(true);
    setPages(ALL_PAGES.map((p) => ({ path: p, status: "pending" })));

    const results: PageCheckResult[] = [];
    const batchSize = 10;

    for (let i = 0; i < ALL_PAGES.length; i += batchSize) {
      const batch = ALL_PAGES.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (path) => {
          const start = Date.now();
          try {
            const res = await fetch(path, {
              method: "GET",
              redirect: "follow",
              signal: AbortSignal.timeout(10000),
            });
            return {
              path,
              status: res.status === 200 ? "ok" : res.status === 307 || res.status === 308 ? "ok" : "warning",
              statusCode: res.status,
              responseTime: Date.now() - start,
            } as PageCheckResult;
          } catch {
            return {
              path,
              status: "error",
              responseTime: Date.now() - start,
            } as PageCheckResult;
          }
        })
      );

      for (const r of batchResults) {
        if (r.status === "fulfilled") results.push(r.value);
        else results.push({ path: "unknown", status: "error" });
      }

      // Update state after each batch for progressive UI
      setPages([...results, ...ALL_PAGES.slice(i + batchSize).map((p) => ({ path: p, status: "pending" as const }))]);
    }

    setPages(results);
    setPagesLoading(false);
  }, []);

  /* ── Auto-refresh ──── */
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(runHealthCheck, 60000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, runHealthCheck]);

  /* ── Derived stats ──── */
  const okCount = pages.filter((p) => p.status === "ok").length;
  const errorCount = pages.filter((p) => p.status === "error").length;
  const warningCount = pages.filter((p) => p.status === "warning").length;

  const filteredPages =
    filter === "all" ? pages : pages.filter((p) => p.status === filter);

  /* ── Styles ──── */
  const card: React.CSSProperties = {
    background: "#1e1e2e",
    border: "1px solid #2e2e3e",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  };

  const btn = (variant: "primary" | "secondary" | "ghost"): React.CSSProperties => ({
    padding: "10px 20px",
    borderRadius: 8,
    border: variant === "ghost" ? "1px solid #3e3e4e" : "none",
    background:
      variant === "primary"
        ? "#6366f1"
        : variant === "secondary"
          ? "#374151"
          : "transparent",
    color: "#e2e8f0",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "opacity 0.15s",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "#e2e8f0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Header ──────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1e2e 0%, #16162a 100%)",
          borderBottom: "1px solid #2e2e3e",
          padding: "32px 0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  margin: 0,
                  color: "#f1f5f9",
                }}
              >
                System Health Check
              </h1>
              <p
                style={{
                  color: "#94a3b8",
                  margin: "4px 0 0",
                  fontSize: 14,
                }}
              >
                Doctopal Service Status Dashboard
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#94a3b8",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={{ accentColor: "#6366f1" }}
                />
                Auto-refresh (60s)
              </label>
              <button
                onClick={runHealthCheck}
                disabled={loading}
                style={{ ...btn("primary"), opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Checking..." : "Run Health Check"}
              </button>
              <button
                onClick={runPageChecks}
                disabled={pagesLoading}
                style={{
                  ...btn("secondary"),
                  opacity: pagesLoading ? 0.6 : 1,
                }}
              >
                {pagesLoading ? "Scanning..." : "Check All Pages"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* ── Overall Banner ──────────────── */}
        {health && (
          <div
            style={{
              ...card,
              borderLeft: `4px solid ${health.healthy ? "#22c55e" : "#ef4444"}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 32,
                  color: health.healthy ? "#22c55e" : "#ef4444",
                }}
              >
                {health.healthy ? "✓" : "✗"}
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  {health.healthy
                    ? "All Systems Operational"
                    : "Issues Detected"}
                </h2>
                {health.hasWarnings && health.healthy && (
                  <p style={{ margin: "2px 0 0", color: "#eab308", fontSize: 13 }}>
                    Some warnings detected
                  </p>
                )}
              </div>
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              Last checked:{" "}
              {new Date(health.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* ── Service Results Table ──────── */}
        {health && (
          <div style={card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>
              Service Status
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #2e2e3e",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 500 }}>
                      Service
                    </th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 500 }}>
                      Status
                    </th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 500 }}>
                      Message
                    </th>
                    <th style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 500, textAlign: "right" }}>
                      Response Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {health.results.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid #1a1a2e",
                        background: statusBg(r.status),
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 12px",
                          fontWeight: 500,
                        }}
                      >
                        {r.service}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            background: `${statusColor(r.status)}22`,
                            color: statusColor(r.status),
                          }}
                        >
                          {statusIcon(r.status)}{" "}
                          {r.status === "ok"
                            ? "OK"
                            : r.status === "error"
                              ? "ERROR"
                              : "WARNING"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "#94a3b8",
                          maxWidth: 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.message}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "#64748b",
                          textAlign: "right",
                          fontFamily: "monospace",
                        }}
                      >
                        {r.responseTime != null ? `${r.responseTime}ms` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Page Checks ───────────────── */}
        {pages.length > 0 && (
          <div style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                Page Status ({okCount}/{ALL_PAGES.length} OK
                {errorCount > 0 && `, ${errorCount} errors`}
                {warningCount > 0 && `, ${warningCount} warnings`})
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                {(["all", "ok", "error", "warning"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      ...btn("ghost"),
                      padding: "6px 14px",
                      fontSize: 12,
                      background: filter === f ? "#374151" : "transparent",
                    }}
                  >
                    {f === "all"
                      ? `All (${pages.length})`
                      : f === "ok"
                        ? `OK (${okCount})`
                        : f === "error"
                          ? `Errors (${errorCount})`
                          : `Warnings (${warningCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            {pagesLoading && (
              <div
                style={{
                  height: 4,
                  background: "#2e2e3e",
                  borderRadius: 2,
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${((pages.filter((p) => p.status !== "pending").length) / ALL_PAGES.length) * 100}%`,
                    background: "#6366f1",
                    borderRadius: 2,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 8,
              }}
            >
              {filteredPages.map((p) => (
                <div
                  key={p.path}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background:
                      p.status === "pending" ? "#1a1a2e" : statusBg(p.status),
                    border: "1px solid #2e2e3e",
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        color:
                          p.status === "pending"
                            ? "#64748b"
                            : statusColor(p.status),
                        fontWeight: 700,
                        fontSize: 14,
                        width: 16,
                        textAlign: "center",
                      }}
                    >
                      {p.status === "pending" ? "..." : statusIcon(p.status)}
                    </span>
                    <code style={{ color: "#cbd5e1", fontFamily: "monospace", fontSize: 12 }}>
                      {p.path}
                    </code>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#64748b",
                      fontSize: 11,
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.statusCode && <span>{p.statusCode}</span>}
                    {p.responseTime != null && <span>{p.responseTime}ms</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ───────────────── */}
        {!health && pages.length === 0 && (
          <div
            style={{
              ...card,
              textAlign: "center",
              padding: 64,
              color: "#64748b",
            }}
          >
            <p style={{ fontSize: 48, margin: "0 0 16px" }}>
              {/* Shield icon via text */}
              &#x1F6E1;&#xFE0F;
            </p>
            <h2 style={{ fontSize: 20, color: "#94a3b8", marginBottom: 8 }}>
              No checks run yet
            </h2>
            <p style={{ fontSize: 14, marginBottom: 24 }}>
              Click &quot;Run Health Check&quot; to test services or &quot;Check All
              Pages&quot; to verify all routes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
