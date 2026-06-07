import type { LevelTier } from "../types/game.js";

export function tierForLevel(levelNumber: number): LevelTier {
  if (levelNumber <= 20) return "novice";
  if (levelNumber <= 80) return "standard";
  return "expert";
}

export function solutionCountRangeForTier(
  tier: LevelTier
): { min: number; max: number } {
  switch (tier) {
    case "novice":
      return { min: 5, max: Number.POSITIVE_INFINITY };
    case "standard":
      return { min: 2, max: 4 };
    case "expert":
      return { min: 1, max: 1 };
  }
}

export function matchesTierSolutionCount(
  tier: LevelTier,
  solutionCount: number
): boolean {
  const { min, max } = solutionCountRangeForTier(tier);
  return solutionCount >= min && solutionCount <= max;
}
