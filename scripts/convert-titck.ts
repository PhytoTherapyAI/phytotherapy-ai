/**
 * TİTCK Drug List Converter
 * ─────────────────────────
 * Reads scripts/titck-input.xlsx (TİTCK Excel export)
 * Outputs public/drugs-tr.json for Turkish drug autocomplete
 *
 * Usage:  npm run convert-drugs
 * Update: Replace scripts/titck-input.xlsx → re-run
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

// ── Column mapping (TİTCK Excel headers) ──
const COL_BRAND = "ÜRÜN ADI";
const COL_GENERIC = "ETKİN MADDE";
const COL_COMPANY = "FİRMA";

// ── Paths ──
const INPUT_FILE = path.join(__dirname, "titck-input.xlsx");
const OUTPUT_FILE = path.join(__dirname, "..", "public", "drugs-tr.json");

interface DrugEntry {
  brandName: string;
  genericName: string;
  company: string;
}

function main() {
  // Check input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`);
    console.error(`   Place the TİTCK Excel file at scripts/titck-input.xlsx`);
    process.exit(1);
  }

  console.log(`📖 Reading ${INPUT_FILE}...`);
  const workbook = XLSX.readFile(INPUT_FILE);

  // Use first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    console.error("❌ No sheets found in workbook");
    process.exit(1);
  }

  const sheet = workbook.Sheets[sheetName];
  const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`📋 Sheet "${sheetName}" — ${rows.length} rows found`);

  // Validate headers
  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);
    const missing: string[] = [];
    if (!headers.includes(COL_BRAND)) missing.push(COL_BRAND);
    if (!headers.includes(COL_GENERIC)) missing.push(COL_GENERIC);
    if (!headers.includes(COL_COMPANY)) missing.push(COL_COMPANY);

    if (missing.length > 0) {
      console.error(`❌ Missing columns: ${missing.join(", ")}`);
      console.error(`   Found columns: ${headers.join(", ")}`);
      console.error(`   Update COL_BRAND/COL_GENERIC/COL_COMPANY in this script if headers differ.`);
      process.exit(1);
    }
  }

  // Extract & clean
  const seen = new Set<string>();
  const drugs: DrugEntry[] = [];

  for (const row of rows) {
    const brandName = String(row[COL_BRAND] || "").trim();
    const genericName = String(row[COL_GENERIC] || "").trim();
    const company = String(row[COL_COMPANY] || "").trim();

    // Skip empty rows
    if (!brandName) continue;

    // Deduplicate by brand name (case-insensitive)
    const key = brandName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    drugs.push({ brandName, genericName, company });
  }

  // Sort alphabetically by brand name (Turkish locale)
  drugs.sort((a, b) => a.brandName.localeCompare(b.brandName, "tr"));

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(drugs, null, 2), "utf-8");

  console.log(`✅ Wrote ${drugs.length} drugs to ${OUTPUT_FILE}`);
  console.log(`   (${rows.length - drugs.length} duplicates/empty rows skipped)`);
}

main();
