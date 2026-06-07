import { isCardInNormalRange } from "../config/game-config.js";
import {
  matchesTierSolutionCount,
  tierForLevel,
} from "../config/level-curve.js";
import type { LevelTier, PuzzleRecord } from "../types/game.js";
import { PuzzleRepo } from "./puzzle-repo.js";

export class PuzzleIndex {
  private readonly byTierAndCount = new Map<string, PuzzleRecord[]>();

  constructor(records: PuzzleRecord[]) {
    for (const record of records) {
      if (record.solution_count <= 0) continue;
      for (const tier of ["novice", "standard", "expert"] as LevelTier[]) {
        if (!matchesTierSolutionCount(tier, record.solution_count)) continue;
        const key = bucketKey(tier, record.solution_count);
        const list = this.byTierAndCount.get(key) ?? [];
        list.push(record);
        this.byTierAndCount.set(key, list);
      }
    }
  }

  bucket(tier: LevelTier, count: number): PuzzleRecord[] {
    return [...(this.byTierAndCount.get(bucketKey(tier, count)) ?? [])];
  }

  normalModePool(tier: LevelTier): PuzzleRecord[] {
    const seen = new Set<string>();
    const pool: PuzzleRecord[] = [];
    for (const [key, records] of this.byTierAndCount) {
      if (!key.startsWith(`${tier}:`)) continue;
      for (const record of records) {
        if (!record.cards.every(isCardInNormalRange)) continue;
        if (seen.has(record.cards_label)) continue;
        seen.add(record.cards_label);
        pool.push(record);
      }
    }
    return pool.sort((a, b) => a.cards_label.localeCompare(b.cards_label));
  }

  pickForLevel(levelNumber: number): PuzzleRecord {
    const tier = tierForLevel(levelNumber);
    let pool = this.normalModePool(tier);
    if (pool.length === 0) {
      for (const fallback of ["standard", "novice", "expert"] as LevelTier[]) {
        pool = this.normalModePool(fallback);
        if (pool.length > 0) break;
      }
    }
    if (pool.length === 0) {
      throw new Error(`No puzzles in pool for level ${levelNumber}`);
    }
    return pool[(levelNumber - 1) % pool.length]!;
  }
}

function bucketKey(tier: LevelTier, count: number): string {
  return `${tier}:${count}`;
}

let indexCache: PuzzleIndex | null = null;

export function getPuzzleIndex(repo: PuzzleRepo = new PuzzleRepo()): PuzzleIndex {
  if (!indexCache) {
    indexCache = new PuzzleIndex(repo.loadAll());
  }
  return indexCache;
}

export function resetPuzzleIndexCache(): void {
  indexCache = null;
}
