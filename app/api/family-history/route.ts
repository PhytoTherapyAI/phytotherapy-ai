// © 2026 DoctoPal — All Rights Reserved
// Family history entries API — CRUD for first/second-degree relative disease history.
// Session 39 C2. Requires migration 20260421_family_history_entries.sql applied.
// RLS own_* policies enforce per-user data isolation; service-role not used here.

import { NextRequest, NextResponse } from "next/server";
import { apiHandler, parseBody, type AuthResult } from "@/lib/api-helpers";

interface FamilyHistoryEntryInput {
  id?: string;
  person_relation?: string;
  condition_name?: string;
  age_at_diagnosis?: number | null;
  age_at_death?: number | null;
  is_deceased?: boolean;
  notes?: string | null;
}

// ── GET: list user's family history entries ──
export const GET = apiHandler(
  async (request: NextRequest, auth: AuthResult | null) => {
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await auth.supabase
      .from("family_history_entries")
      .select("id, person_relation, condition_name, age_at_diagnosis, age_at_death, is_deceased, notes, created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entries: data ?? [] });
  },
  { rateLimit: { max: 60, windowMs: 60_000 } },
);

// ── POST: create new entry ──
export const POST = apiHandler(
  async (request: NextRequest, auth: AuthResult | null) => {
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await parseBody<FamilyHistoryEntryInput>(request);

    const relation = (body.person_relation || "").trim();
    const condition = (body.condition_name || "").trim();
    if (!relation || relation.length > 50) {
      return NextResponse.json({ error: "person_relation required (1-50 chars)" }, { status: 400 });
    }
    if (!condition || condition.length > 200) {
      return NextResponse.json({ error: "condition_name required (1-200 chars)" }, { status: 400 });
    }

    const insert = {
      user_id: auth.user.id,
      person_relation: relation,
      condition_name: condition,
      age_at_diagnosis: typeof body.age_at_diagnosis === "number" ? body.age_at_diagnosis : null,
      age_at_death: typeof body.age_at_death === "number" ? body.age_at_death : null,
      is_deceased: !!body.is_deceased,
      notes: body.notes?.trim() || null,
    };

    const { data, error } = await auth.supabase
      .from("family_history_entries")
      .insert(insert)
      .select("id, person_relation, condition_name, age_at_diagnosis, age_at_death, is_deceased, notes, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entry: data }, { status: 201 });
  },
  { rateLimit: { max: 20, windowMs: 60_000 } },
);

// ── PATCH: update existing entry (partial) ──
export const PATCH = apiHandler(
  async (request: NextRequest, auth: AuthResult | null) => {
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await parseBody<FamilyHistoryEntryInput>(request);

    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.person_relation === "string") {
      const relation = body.person_relation.trim();
      if (!relation || relation.length > 50) {
        return NextResponse.json({ error: "person_relation must be 1-50 chars" }, { status: 400 });
      }
      patch.person_relation = relation;
    }
    if (typeof body.condition_name === "string") {
      const condition = body.condition_name.trim();
      if (!condition || condition.length > 200) {
        return NextResponse.json({ error: "condition_name must be 1-200 chars" }, { status: 400 });
      }
      patch.condition_name = condition;
    }
    if ("age_at_diagnosis" in body) {
      patch.age_at_diagnosis = typeof body.age_at_diagnosis === "number" ? body.age_at_diagnosis : null;
    }
    if ("age_at_death" in body) {
      patch.age_at_death = typeof body.age_at_death === "number" ? body.age_at_death : null;
    }
    if (typeof body.is_deceased === "boolean") {
      patch.is_deceased = body.is_deceased;
    }
    if ("notes" in body) {
      patch.notes = body.notes?.trim() || null;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "no fields to update" }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from("family_history_entries")
      .update(patch)
      .eq("id", body.id)
      .eq("user_id", auth.user.id) // defense-in-depth alongside RLS
      .select("id, person_relation, condition_name, age_at_diagnosis, age_at_death, is_deceased, notes, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entry: data });
  },
  { rateLimit: { max: 30, windowMs: 60_000 } },
);

// ── DELETE: remove entry by id ──
export const DELETE = apiHandler(
  async (request: NextRequest, auth: AuthResult | null) => {
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }
    const { error } = await auth.supabase
      .from("family_history_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  },
  { rateLimit: { max: 20, windowMs: 60_000 } },
);
