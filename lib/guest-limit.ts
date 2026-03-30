// © 2026 Phytotherapy.ai — All Rights Reserved
// Guest query limit system
// Tracks queries in localStorage for unauthenticated users

const GUEST_QUERY_KEY = "phytotherapy_guest_queries";
const GUEST_SESSION_KEY = "phytotherapy_guest_session";
const MAX_GUEST_QUERIES = 5;

interface GuestQueryData {
  count: number;
  queries: { text: string; timestamp: string }[];
}

export function getGuestSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getGuestQueryData(): GuestQueryData {
  if (typeof window === "undefined") return { count: 0, queries: [] };

  try {
    const data = localStorage.getItem(GUEST_QUERY_KEY);
    if (!data) return { count: 0, queries: [] };
    return JSON.parse(data) as GuestQueryData;
  } catch {
    return { count: 0, queries: [] };
  }
}

export function getGuestQueryCount(): number {
  return getGuestQueryData().count;
}

export function getRemainingGuestQueries(): number {
  return Math.max(0, MAX_GUEST_QUERIES - getGuestQueryCount());
}

export function canGuestQuery(): boolean {
  return getGuestQueryCount() < MAX_GUEST_QUERIES;
}

export function recordGuestQuery(queryText: string): void {
  if (typeof window === "undefined") return;

  const data = getGuestQueryData();
  data.count += 1;
  data.queries.push({ text: queryText, timestamp: new Date().toISOString() });
  localStorage.setItem(GUEST_QUERY_KEY, JSON.stringify(data));
}

export function isPersonalQuery(query: string): boolean {
  const personalIndicators = [
    // English
    "i take", "i use", "i'm on", "my medication", "my medicine",
    "i have", "my blood", "my test", "for me", "should i",
    "can i take", "is it safe for me", "my condition", "my allergy",
    "i'm pregnant", "i'm breastfeeding", "my doctor",
    "recommend me", "suggest for me", "what should i",
    // Turkish
    "kullanıyorum", "ilacım", "tahlilim", "bana öner",
    "alerjim", "hamileyim", "emziriyorum", "doktorum",
    "ne kullanmalıyım", "benim için", "almam gereken",
  ];

  const lower = query.toLowerCase();
  return personalIndicators.some((indicator) => lower.includes(indicator));
}

export const MAX_QUERIES = MAX_GUEST_QUERIES;
