export type ShareQuery = {
  mode?: string;
  level?: string;
  label?: string;
};

export function buildSharePath(level: number, label: string): string {
  const query = new URLSearchParams({
    mode: "challenge",
    level: String(level),
    label,
  });
  return `/pages/challenge/challenge?${query.toString()}`;
}

export function parseEntryQuery(
  query: Record<string, string | undefined>
): ShareQuery {
  return {
    mode: query.mode,
    level: query.level,
    label: query.label,
  };
}

export function isChallengeEntry(query: ShareQuery): boolean {
  return query.mode === "challenge";
}

export function parseLevelNumber(query: ShareQuery, fallback = 1): number {
  const n = Number(query.level);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
