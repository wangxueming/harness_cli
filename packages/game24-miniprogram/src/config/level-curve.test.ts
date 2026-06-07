import { describe, expect, it } from "vitest";
import {
  matchesTierSolutionCount,
  solutionCountRangeForTier,
  tierForLevel,
} from "./level-curve.js";

describe("level-curve", () => {
  it("tierForLevel boundaries", () => {
    expect(tierForLevel(1)).toBe("novice");
    expect(tierForLevel(20)).toBe("novice");
    expect(tierForLevel(21)).toBe("standard");
    expect(tierForLevel(80)).toBe("standard");
    expect(tierForLevel(81)).toBe("expert");
    expect(tierForLevel(999)).toBe("expert");
  });

  it("solution count ranges per tier", () => {
    expect(solutionCountRangeForTier("novice")).toEqual({
      min: 5,
      max: Number.POSITIVE_INFINITY,
    });
    expect(solutionCountRangeForTier("standard")).toEqual({ min: 2, max: 4 });
    expect(solutionCountRangeForTier("expert")).toEqual({ min: 1, max: 1 });
  });

  it("matchesTierSolutionCount", () => {
    expect(matchesTierSolutionCount("novice", 5)).toBe(true);
    expect(matchesTierSolutionCount("novice", 4)).toBe(false);
    expect(matchesTierSolutionCount("standard", 3)).toBe(true);
    expect(matchesTierSolutionCount("standard", 5)).toBe(false);
    expect(matchesTierSolutionCount("expert", 1)).toBe(true);
    expect(matchesTierSolutionCount("expert", 2)).toBe(false);
  });
});
