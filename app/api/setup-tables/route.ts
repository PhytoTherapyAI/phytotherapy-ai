// © 2026 Doctopal — All Rights Reserved
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "public" } }
)

export async function POST(request: Request) {
  // Security: Only allow in development or with admin secret
  const authHeader = request.headers.get("authorization")
  const adminSecret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: string[] = []

  // Check if family_members table exists
  const { error: checkErr } = await supabaseAdmin.from("family_members").select("id").limit(1)

  if (checkErr?.message?.includes("does not exist") || checkErr?.code === "42P01") {
    // Create via raw SQL using supabase-js rpc won't work, so we create via insert pattern
    // Instead, we'll create a minimal version using the REST API
    results.push("family_members table not found — attempting creation via SQL...")

    // Use the Supabase Management API to run SQL
    const projectRef = "huiiqbslahqkadchzyig"
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    try {
      const sqlRes = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/`, {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "create_family_tables",
        }),
      })

      if (!sqlRes.ok) {
        // RPC doesn't exist, try creating table via the database API
        results.push("RPC not available. Creating table directly...")

        // We need to use pg directly - but since we can't, let's create via Supabase Dashboard
        // For now, provide the SQL to run
        results.push("Please run the SQL in Supabase Dashboard > SQL Editor:")
        results.push("File: supabase/migrations/sprint11_family_profiles.sql")
        results.push(`URL: https://supabase.com/dashboard/project/${projectRef}/sql/new`)
      }
    } catch (e) {
      results.push(`Error: ${e}`)
    }
  } else if (checkErr) {
    results.push(`Unexpected error: ${checkErr.message}`)
  } else {
    results.push("family_members table already exists!")
  }

  return NextResponse.json({ results })
}
