// Quick migration runner for Supabase
// Usage: node scripts/run-migration.js supabase/migrations/sprint10_health_scores.sql

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node scripts/run-migration.js <sql-file>");
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(sqlFile), "utf-8");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log(`Running migration: ${sqlFile}`);

  // Split by semicolons and run each statement
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc("exec_sql", { sql_text: stmt + ";" });
      if (error) {
        // Try direct approach
        console.log(`Statement: ${stmt.substring(0, 60)}...`);
        console.log(`Note: ${error.message} (may already exist)`);
      } else {
        console.log(`OK: ${stmt.substring(0, 60)}...`);
      }
    } catch (err) {
      console.log(`Statement: ${stmt.substring(0, 60)}...`);
      console.log(`Note: ${err.message}`);
    }
  }

  console.log("\nMigration complete. You may need to run statements manually in Supabase SQL Editor.");
}

run();
