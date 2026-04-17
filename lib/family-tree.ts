// © 2026 DoctoPal — All Rights Reserved
// Pure helpers that turn a FamilyMember[] list into the grouped structure
// the /family-health-tree page renders. No React, no Supabase — testable.

import type { FamilyMember, FamilyRelationship } from "@/types/family"

export type Generation = "grandparent" | "parent" | "self" | "child"

export interface FamilyTreeCondition {
  name: string
  /** Critical = red highlight in UI (anaphylaxis/pregnancy/kidney-liver etc.) */
  severity: "critical" | "moderate" | "mild"
  /** Came from the user's own "family:" prefix (inherited history) */
  fromFamilyPrefix: boolean
}

export interface FamilyTreeNode {
  /** Stable id for React keys — member.id or synthetic "gp-<condition>" */
  id: string
  userId?: string | null
  name: string
  relationship: FamilyRelationship
  avatar: { style: string; seed: string } | null
  conditions: FamilyTreeCondition[]
  isSelf: boolean
  /** True when this node is synthesized from aggregated "family:" history
   *  (no real user row behind it). */
  isAggregate: boolean
}

export interface TreeGeneration {
  generation: Generation
  members: FamilyTreeNode[]
}

const RELATIONSHIP_TO_GENERATION: Record<FamilyRelationship, Generation> = {
  grandparent: "grandparent",
  parent: "parent",
  self: "self",
  spouse: "self",
  sibling: "self",
  child: "child",
  grandchild: "child",
  other: "self",
}

/** Known prefixes inside user_profiles.chronic_conditions */
const FAMILY_PREFIX = "family:"
const SURGERY_PREFIX = "surgery:"

/**
 * Split a raw chronic_conditions array into the three categories the rest
 * of the app already uses. surgery: entries are dropped for the tree.
 */
export function splitConditions(raw: string[] | null | undefined): {
  own: string[]
  inherited: string[]
} {
  if (!Array.isArray(raw)) return { own: [], inherited: [] }
  const own: string[] = []
  const inherited: string[] = []
  for (const r of raw) {
    if (typeof r !== "string") continue
    if (r.startsWith(FAMILY_PREFIX)) inherited.push(r.slice(FAMILY_PREFIX.length))
    else if (r.startsWith(SURGERY_PREFIX)) continue
    else own.push(r)
  }
  return { own, inherited }
}

const CRITICAL_KEYWORDS = [
  // EN
  "cancer", "stroke", "heart attack", "alzheimer", "kidney",
  "pregnancy", "anaphylaxis",
  // TR
  "kanser", "felç", "kalp krizi", "alzheimer", "böbrek",
  "hamilelik", "anafilaksi",
]

function classifySeverity(condition: string): "critical" | "moderate" | "mild" {
  const lower = condition.toLowerCase()
  if (CRITICAL_KEYWORDS.some(k => lower.includes(k))) return "critical"
  // Default to moderate for any known condition — UI will colour accordingly.
  return "moderate"
}

/**
 * Collapse all "family:" prefixed items (inherited history from every
 * household member's profile) into a single aggregated grandparent bucket.
 * The returned nodes are synthetic — each represents "N of your family
 * members reported this condition in their ancestry".
 */
export function aggregateGrandparentConditions(members: FamilyMember[]): FamilyTreeNode[] {
  const counts = new Map<string, number>()
  for (const m of members) {
    const { inherited } = splitConditions(m.profile?.chronic_conditions)
    for (const c of inherited) {
      counts.set(c, (counts.get(c) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([condition, count]) => ({
      id: `gp-${condition}`,
      userId: null,
      name: condition,
      relationship: "grandparent" as FamilyRelationship,
      avatar: null,
      conditions: [
        { name: condition, severity: classifySeverity(condition), fromFamilyPrefix: true },
      ],
      isSelf: false,
      isAggregate: true,
      /** Number of household members whose profile lists this in family: */
      occurrenceCount: count,
    }) as FamilyTreeNode & { occurrenceCount: number })
}

/**
 * Convert a single accepted FamilyMember into a FamilyTreeNode.
 */
function memberToNode(
  member: FamilyMember,
  ownerUserId: string | null
): FamilyTreeNode {
  const { own } = splitConditions(member.profile?.chronic_conditions)
  return {
    id: member.id,
    userId: member.user_id ?? undefined,
    name:
      member.nickname ||
      member.profile?.display_name ||
      member.profile?.full_name ||
      "—",
    relationship: (member.relationship as FamilyRelationship | null) ?? "other",
    avatar:
      member.profile?.avatar_style && member.profile?.avatar_seed
        ? { style: member.profile.avatar_style, seed: member.profile.avatar_seed }
        : null,
    conditions: own.map(c => ({
      name: c,
      severity: classifySeverity(c),
      fromFamilyPrefix: false,
    })),
    isSelf: !!(ownerUserId && member.user_id === ownerUserId),
    isAggregate: false,
  }
}

/**
 * Build the 4-generation structure for the tree page.
 * - grandparents: aggregated "family:" history across everyone
 * - parents: members tagged relationship='parent'
 * - self: owner + spouse + sibling + other (central band)
 * - children: child + grandchild
 *
 * `ownerUserId` is used to flag the node that should render with a star.
 */
export function buildFamilyTree(
  members: FamilyMember[],
  ownerUserId: string | null
): TreeGeneration[] {
  const grandparents = aggregateGrandparentConditions(members)
  const parents: FamilyTreeNode[] = []
  const self: FamilyTreeNode[] = []
  const children: FamilyTreeNode[] = []

  for (const m of members) {
    if (!m.user_id) continue
    const node = memberToNode(m, ownerUserId)
    const rel = node.relationship
    const gen = RELATIONSHIP_TO_GENERATION[rel] ?? "self"
    if (rel === "grandparent") {
      grandparents.push(node)
    } else if (gen === "parent") {
      parents.push(node)
    } else if (gen === "child") {
      children.push(node)
    } else {
      self.push(node)
    }
  }

  // Self first, then spouses, then siblings, then others.
  const selfOrder: Record<FamilyRelationship, number> = {
    self: 0, spouse: 1, sibling: 2, other: 3,
    parent: 99, child: 99, grandparent: 99, grandchild: 99,
  }
  self.sort((a, b) => (selfOrder[a.relationship] ?? 99) - (selfOrder[b.relationship] ?? 99))

  return [
    { generation: "grandparent", members: grandparents },
    { generation: "parent",      members: parents },
    { generation: "self",        members: self },
    { generation: "child",       members: children },
  ]
}

/**
 * Minimal payload the /api/family-health-tree endpoint already expects
 * (relation + conditions). Used by the page to trigger AI analysis.
 */
export interface ApiFamilyMemberPayload {
  relation: string
  conditions: string[]
}

export function toApiPayload(generations: TreeGeneration[]): ApiFamilyMemberPayload[] {
  const out: ApiFamilyMemberPayload[] = []
  for (const gen of generations) {
    for (const node of gen.members) {
      if (node.conditions.length === 0) continue
      out.push({
        relation: node.relationship,
        conditions: node.conditions.map(c => c.name),
      })
    }
  }
  return out
}
