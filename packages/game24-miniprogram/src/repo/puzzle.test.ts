import { describe, expect, it } from "vitest";
import { tierForLevel } from "../config/level-curve.js";
import { isCardInNormalRange } from "../config/game-config.js";
import { PuzzleIndex } from "./puzzle-index.js";
import { PuzzleRepo } from "./puzzle-repo.js";

describe("puzzle repo/index", () => {
  const repo = new PuzzleRepo();

  it("loadAll returns records", () => {
    const all = repo.loadAll();
    expect(all.length).toBeGreaterThan(1000);
  });

  it("getByLabel finds known puzzle", () => {
    const p = repo.getByLabel("1,1,2,6");
    expect(p).toBeDefined();
    expect(p!.solution_count).toBe(2);
  });

  it("normalModePool filters cards <= 10", () => {
    const index = new PuzzleIndex(repo.loadAll());
    const pool = index.normalModePool("novice");
    expect(pool.length).toBeGreaterThan(0);
    for (const p of pool) {
      expect(p.cards.every(isCardInNormalRange)).toBe(true);
      expect(p.solution_count).toBeGreaterThanOrEqual(5);
    }
  });

  it("pickForLevel is deterministic", () => {
    const index = new PuzzleIndex(repo.loadAll());
    const a = index.pickForLevel(5);
    const b = index.pickForLevel(5);
    expect(a.cards_label).toBe(b.cards_label);
  });

  it("tier buckets align with level curve", () => {
    const index = new PuzzleIndex(repo.loadAll());
    const level21 = index.pickForLevel(21);
    expect(tierForLevel(21)).toBe("standard");
    expect(level21.solution_count).toBeGreaterThanOrEqual(2);
    expect(level21.solution_count).toBeLessThanOrEqual(4);
  });
});
