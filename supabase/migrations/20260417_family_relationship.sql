-- Migration: FAZ 5 — Add kinship (relationship) column to family_members
-- Date: 2026-04-17
-- Context: FAZ 1-4 left family_members with { role, nickname, allows_management }
-- which describes AUTHORITY inside the household (owner/admin/member) but NOT
-- the actual kinship (parent, child, spouse, etc.). The family health tree
-- (FAZ 5) needs kinship to group members into generations.

ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS relationship TEXT;

-- Enumerated values — keeps UI dropdowns and the AI prompt aligned.
ALTER TABLE public.family_members
  DROP CONSTRAINT IF EXISTS family_members_relationship_check;

ALTER TABLE public.family_members
  ADD CONSTRAINT family_members_relationship_check
  CHECK (
    relationship IS NULL
    OR relationship IN (
      'self',
      'spouse',
      'parent',
      'child',
      'sibling',
      'grandparent',
      'grandchild',
      'other'
    )
  );

-- Mark every owner as 'self' so the tree renders on day 1 for existing groups.
UPDATE public.family_members
  SET relationship = 'self'
  WHERE role = 'owner' AND relationship IS NULL;

-- Reload PostgREST cache so the new column is queryable immediately.
NOTIFY pgrst, 'reload schema';
