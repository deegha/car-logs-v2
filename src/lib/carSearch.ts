const CURRENT_YEAR = new Date().getFullYear();

/**
 * Splits a raw search string into an optional year token and remaining text terms.
 *
 * "2019 Toyota Camry" → { yearToken: 2019, terms: ["Toyota", "Camry"] }
 * "BMW"               → { yearToken: null,  terms: ["BMW"] }
 * "2020"              → { yearToken: 2020,  terms: [] }
 */
export function parseSearch(q: string): { yearToken: number | null; terms: string[] } {
  const trimmed = q.trim();
  if (!trimmed) return { yearToken: null, terms: [] };

  let yearToken: number | null = null;
  let rest = trimmed;

  const match = trimmed.match(/\b((19|20)\d{2})\b/);
  if (match) {
    const y = parseInt(match[1], 10);
    if (y >= 1950 && y <= CURRENT_YEAR + 1) {
      yearToken = y;
      rest =
        trimmed.slice(0, match.index) +
        trimmed.slice((match.index ?? 0) + match[0].length);
    }
  }

  const terms = rest
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return { yearToken, terms };
}

/**
 * Builds a Prisma `where` fragment for full-text search across title, make, model and year.
 *
 * Each text term is ANDed so every word must appear in at least one of the three fields.
 * A year token (e.g. 2019) is ANDed as an exact year match.
 * Always returns an { AND: [...] } wrapper so the fragment can be safely spread alongside
 * other top-level where conditions (e.g. a separate year-range filter) without key collisions.
 */
export function buildSearchWhere(search: string): Record<string, unknown> {
  const { yearToken, terms } = parseSearch(search);
  const conditions: Record<string, unknown>[] = [];

  if (yearToken !== null) {
    conditions.push({ year: yearToken });
  }

  for (const term of terms) {
    conditions.push({
      OR: [
        { title: { contains: term } },
        { make: { contains: term } },
        { model: { contains: term } },
      ],
    });
  }

  if (conditions.length === 0) return {};
  return { AND: conditions };
}
