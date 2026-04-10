-- © 2026 DoctoPal — Sociodemographic columns for profile enrichment
-- Fixes bug where these fields were being saved as "meta:key=value" entries in supplements array

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS insurance_type TEXT,
  ADD COLUMN IF NOT EXISTS work_schedule TEXT,
  ADD COLUMN IF NOT EXISTS wearable_device BOOLEAN DEFAULT false;

-- Backfill: extract meta: entries from existing supplements arrays into proper columns
UPDATE user_profiles
SET
  city = COALESCE(
    city,
    (SELECT regexp_replace(s, '^meta:city=', '') FROM unnest(supplements) s WHERE s LIKE 'meta:city=%' LIMIT 1)
  ),
  marital_status = COALESCE(
    marital_status,
    (SELECT regexp_replace(s, '^meta:marital=', '') FROM unnest(supplements) s WHERE s LIKE 'meta:marital=%' LIMIT 1)
  ),
  insurance_type = COALESCE(
    insurance_type,
    (SELECT regexp_replace(s, '^meta:insurance=', '') FROM unnest(supplements) s WHERE s LIKE 'meta:insurance=%' LIMIT 1)
  ),
  work_schedule = COALESCE(
    work_schedule,
    (SELECT regexp_replace(s, '^meta:work=', '') FROM unnest(supplements) s WHERE s LIKE 'meta:work=%' LIMIT 1)
  ),
  wearable_device = COALESCE(
    wearable_device,
    EXISTS (SELECT 1 FROM unnest(supplements) s WHERE s = 'meta:wearable=yes')
  )
WHERE supplements IS NOT NULL
  AND array_length(supplements, 1) > 0
  AND EXISTS (SELECT 1 FROM unnest(supplements) s WHERE s LIKE 'meta:%');

-- Clean up: remove meta: entries from supplements arrays
UPDATE user_profiles
SET supplements = ARRAY(SELECT s FROM unnest(supplements) s WHERE s NOT LIKE 'meta:%')
WHERE supplements IS NOT NULL
  AND EXISTS (SELECT 1 FROM unnest(supplements) s WHERE s LIKE 'meta:%');
