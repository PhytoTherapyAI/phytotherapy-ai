// © 2026 Doctopal — Google People API Profile Fetcher

interface GoogleDate {
  year?: number;
  month?: number;
  day?: number;
}

interface GoogleProfileResult {
  name: string;
  birthDate: string | null; // YYYY-MM-DD
  gender: string | null;    // "male" | "female" | "other" | null
}

function parseBirthday(date?: GoogleDate): string | null {
  if (!date?.year || !date?.month || !date?.day) return null;
  const m = date.month < 10 ? `0${date.month}` : `${date.month}`;
  const d = date.day < 10 ? `0${date.day}` : `${date.day}`;
  return `${date.year}-${m}-${d}`;
}

function mapGender(value?: string): string | null {
  if (!value) return null;
  const map: Record<string, string> = {
    male: "male",
    female: "female",
    unspecified: "prefer_not_to_say",
  };
  return map[value] ?? "other";
}

/**
 * Fetch profile data from Google People API using the OAuth provider token.
 * Returns null on any error — callers should handle gracefully.
 */
export async function fetchGoogleProfile(providerToken: string): Promise<GoogleProfileResult | null> {
  try {
    const res = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=names,birthdays,genders",
      {
        headers: { Authorization: `Bearer ${providerToken}` },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    return {
      name: data.names?.[0]?.givenName ?? data.names?.[0]?.displayName ?? "",
      birthDate: parseBirthday(data.birthdays?.[0]?.date),
      gender: mapGender(data.genders?.[0]?.value),
    };
  } catch {
    return null;
  }
}
