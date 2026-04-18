// © 2026 DoctoPal — All Rights Reserved
// Blood test trend aggregation — returns per-parameter time series from the last N tests,
// normalised into { parameter, values: [{ date, value, unit, status }] }[].
//
// Source: blood_tests.test_data (JSONB) from /api/blood-test-pdf or manual entry.
// test_data shape varies slightly (manual form vs PDF extraction), so we normalise here.
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const maxDuration = 30;

interface MarkerDatum { name?: string; marker?: string; value: string | number; unit?: string; status?: string }

interface TrendValue { date: string; value: number; unit: string; status: string }
interface TrendSeries { parameter: string; values: TrendValue[] }

function normaliseMarkerName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function parseStatus(raw: string | undefined): string {
  const s = (raw || "normal").toLowerCase();
  if (s === "high" || s === "elevated" || s === "above") return "high";
  if (s === "low" || s === "below" || s === "deficient") return "low";
  if (s === "critical") return "critical";
  return "normal";
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "all"; // "3m" | "1y" | "all"
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10) || 10, 50);

  try {
    const supabase = createServerClient();
    const token = auth.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "auth_required" }, { status: 401 });
    }

    // Range filter
    const sinceIso = (() => {
      if (range === "3m") return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      if (range === "1y") return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      return null;
    })();

    let query = supabase
      .from("blood_tests")
      .select("test_data, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (sinceIso) query = query.gte("created_at", sinceIso);

    const { data, error } = await query;
    if (error) {
      console.error("[trends] Supabase error:", error.message);
      return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
    }

    // Aggregate markers across tests
    const seriesMap = new Map<string, TrendValue[]>();
    for (const test of data || []) {
      const testData = test.test_data as unknown;
      // test_data may be: (a) an array of markers, (b) an object with { results: [...] },
      // (c) an object grouped by category { lipid: [...], vitamin: [...] }
      let markers: MarkerDatum[] = [];
      if (Array.isArray(testData)) {
        markers = testData as MarkerDatum[];
      } else if (testData && typeof testData === "object") {
        const obj = testData as Record<string, unknown>;
        if (Array.isArray(obj.results)) {
          markers = obj.results as MarkerDatum[];
        } else {
          // Category-grouped shape: flatten all arrays
          for (const val of Object.values(obj)) {
            if (Array.isArray(val)) markers.push(...(val as MarkerDatum[]));
          }
        }
      }

      for (const m of markers) {
        const name = normaliseMarkerName(String(m.name || m.marker || ""));
        if (!name) continue;
        const numeric = typeof m.value === "number" ? m.value : parseFloat(String(m.value));
        if (!Number.isFinite(numeric)) continue;

        const entry: TrendValue = {
          date: test.created_at,
          value: numeric,
          unit: m.unit || "",
          status: parseStatus(m.status),
        };
        if (!seriesMap.has(name)) seriesMap.set(name, []);
        seriesMap.get(name)!.push(entry);
      }
    }

    // Only include markers with at least 2 data points (trend requires history)
    const series: TrendSeries[] = Array.from(seriesMap.entries())
      .filter(([, values]) => values.length >= 2)
      .map(([parameter, values]) => ({ parameter, values }))
      .sort((a, b) => a.parameter.localeCompare(b.parameter));

    return NextResponse.json({
      success: true,
      testCount: (data || []).length,
      range,
      series,
    });
  } catch (error) {
    console.error("[blood-test-trends] error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
