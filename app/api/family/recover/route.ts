// © 2026 DoctoPal — All Rights Reserved
//
// F-FAMILY-AUTO-RECOVER-001 (Sprint 4 Commit 2)
//
// POST /api/family/recover — orphan state recovery.
//
// Orphan state: `family_members` row'unda `group_id` set (user'ın
// accepted membership'i) ama `family_groups`'ta o id ile parent
// row YOK. /api/family GET handler bu durumda `group: null,
// members: [...], isOrphan: true` döner (Sprint 3 Commit 6,
// `76e7c11`); UI tarafı amber banner gösterir (Sprint 4 Commit 1,
// `932b641`).
//
// Bu endpoint orphan'ı heal eder: family_groups'a missing row'u
// idempotent INSERT eder, sonraki /api/family GET çağrısı normal
// path'e gider, banner kaybolur.
//
// Idempotent: row zaten varsa 200 + `{ recovered: false,
// alreadyExists: true }` döner — frontend race kondisyonu vs
// retry mantıklı handle edilir.
//
// Auth pattern (CLAUDE.md "Endpoint Reuse — Auth Pattern Da
// Kopyala", Sprint 2): service role + Bearer token validate +
// manual auth check. Aynı pattern app/api/family/route.ts'te de
// kullanılıyor; RLS bypass'lı service role + getUser(token) ile
// caller kimliği netleşir.

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function POST(req: Request) {
  // ── Stage 1: Auth ──────────────────────────────────────────
  const auth = req.headers.get("authorization") ?? ""
  if (!auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = auth.replace("Bearer ", "")
  const supabase = getServiceClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ── Stage 2: User'ın accepted membership'ini bul ──────────
  // /api/family GET ile aynı sorgu — user'ın hangi grup'a ait
  // olduğunu netleştir. .single() kullanıyoruz çünkü orphan
  // recovery contract'ı tek-grup varsayımı; multi-membership
  // durumunda "first one wins" pragma (gerçek senaryoda nadir,
  // /api/family GET zaten en kalabalık grubu seçiyor).
  const { data: membership, error: mErr } = await supabase
    .from("family_members")
    .select("group_id")
    .eq("user_id", user.id)
    .eq("invite_status", "accepted")
    .limit(1)
    .maybeSingle()

  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 })
  }
  if (!membership?.group_id) {
    // Orphan değil — user'ın hiç membership'i yok. Recovery
    // anlamsız; UI tarafı normal "Hane Oluştur" CTA göstermeli.
    return NextResponse.json(
      { error: "No accepted membership to recover" },
      { status: 404 },
    )
  }

  const groupId = membership.group_id

  // ── Stage 3: family_groups row var mı? ────────────────────
  const { data: existing, error: existErr } = await supabase
    .from("family_groups")
    .select("id")
    .eq("id", groupId)
    .maybeSingle()

  if (existErr) {
    return NextResponse.json({ error: existErr.message }, { status: 500 })
  }

  if (existing) {
    // Zaten var — idempotent başarı. Race kondisyonu (eş zamanlı
    // recovery) veya retry — frontend için sorun yok, refetch
    // tetiklenmez ama state zaten doğru.
    return NextResponse.json({ recovered: false, alreadyExists: true, groupId })
  }

  // ── Stage 4: INSERT family_groups row ─────────────────────
  // Schema (20260409_family_fix_policies.sql:7-11 + 20260419
  // family_premium.sql):
  //   id UUID DEFAULT gen_random_uuid() PRIMARY KEY
  //   owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
  //   name TEXT NOT NULL DEFAULT 'Ailem'
  //   created_at TIMESTAMPTZ DEFAULT NOW()
  //   plan_type TEXT DEFAULT 'free'
  //   max_members INTEGER DEFAULT 2 (or 6 — schema check)
  //
  // Recovery'de explicit id (orphan group_id ile aynı) — yeni
  // UUID üretmiyoruz, mevcut family_members.group_id ile
  // referansını kuruyor. Owner_id auth context'ten — user
  // kendi hanesini geri alıyor varsayımı.
  //
  // name "Hanem" — schema default 'Ailem' var ama UI metinleri
  // "Hane & Aile" terminolojisi kullanıyor (app/family/page.tsx
  // line 535 "Hane & Aile"). User UI'dan sonra değiştirebilir.
  const { error: insertErr } = await supabase
    .from("family_groups")
    .insert({
      id: groupId,
      owner_id: user.id,
      name: "Hanem",
      plan_type: "free",
      max_members: 6,
      created_at: new Date().toISOString(),
    })

  if (insertErr) {
    // Race kondisyonu fallback: bu noktaya geldiyse Stage 3
    // existing check empty döndü ama INSERT 23505 unique violation
    // verirse — başka bir request araya girdi (idempotency
    // garantisi). Treat as success.
    if (insertErr.code === "23505") {
      return NextResponse.json({ recovered: false, alreadyExists: true, groupId })
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({ recovered: true, groupId })
}
