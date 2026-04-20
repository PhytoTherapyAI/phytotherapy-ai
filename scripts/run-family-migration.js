// Run this script once to create family_members tables in Supabase
// Usage: node scripts/run-family-migration.js

const { createClient } = require("@supabase/supabase-js")

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!serviceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required")
}

const supabase = createClient(
  "https://huiiqbslahqkadchzyig.supabase.co",
  serviceKey
)

async function run() {
  console.log("Creating family_members table...")

  // Try to query - if table exists, skip
  const { error: checkError } = await supabase.from("family_members").select("id").limit(1)
  if (!checkError) {
    console.log("Table already exists!")
    return
  }

  console.log("Table doesn't exist. Please run the following SQL in Supabase Dashboard > SQL Editor:")
  console.log("File: supabase/migrations/sprint11_family_profiles.sql")
  console.log("")
  console.log("Or go to: https://supabase.com/dashboard/project/huiiqbslahqkadchzyig/sql/new")

  // Try using rpc if available
  const { error } = await supabase.rpc("exec", {
    sql: `CREATE TABLE IF NOT EXISTS family_members (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      birth_date DATE,
      age INTEGER,
      gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
      relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'child', 'parent', 'sibling', 'other')),
      is_minor BOOLEAN DEFAULT FALSE,
      is_pregnant BOOLEAN DEFAULT FALSE,
      is_breastfeeding BOOLEAN DEFAULT FALSE,
      alcohol_use TEXT DEFAULT 'none',
      smoking_use TEXT DEFAULT 'none',
      kidney_disease BOOLEAN DEFAULT FALSE,
      liver_disease BOOLEAN DEFAULT FALSE,
      chronic_conditions TEXT[] DEFAULT '{}',
      supplements TEXT[] DEFAULT '{}',
      height_cm INTEGER,
      weight_kg DECIMAL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  })

  if (error) {
    console.log("RPC not available:", error.message)
    console.log("\nPlease manually run the SQL migration in Supabase Dashboard.")
  } else {
    console.log("Table created successfully!")
  }
}

run()
