import { describe, expect, it } from "vitest";
import { canonicalKey, parseSolutionDisplay } from "./canonicalizer.js";
import { ExploreTracker, buildSolutionKeySet } from "./explore-tracker.js";

const puzzle = {
  cards: [1, 1, 2, 6],
  cards_label: "1,1,2,6",
  solution_count: 2,
  min_steps: 3,
  solutions: ["((1+1)×2×6)", "((1+1+2)×6)"],
};

describe("explore-tracker", () => {
  it("buildSolutionKeySet size matches solution_count", () => {
    const keys = buildSolutionKeySet(puzzle);
    expect(keys.size).toBe(2);
  });

  it("tryAdd new key increments x", () => {
    const tracker = new ExploreTracker(puzzle);
    const key = canonicalKey(parseSolutionDisplay("((1+1)×2×6)"));
    const r = tracker.tryAdd(key);
    expect(r.added).toBe(true);
    expect(r.x).toBe(1);
    expect(tracker.getProgress()).toEqual({ x: 1, y: 2 });
  });

  it("duplicate does not increment x", () => {
    const tracker = new ExploreTracker(puzzle);
    const key = canonicalKey(parseSolutionDisplay("((1+1)×2×6)"));
    tracker.tryAdd(key);
    const r = tracker.tryAdd(key);
    expect(r.added).toBe(false);
    expect(r.reason).toBe("duplicate");
    expect(r.x).toBe(1);
  });

  it("not-in-puzzle-set does not increment x", () => {
    const tracker = new ExploreTracker(puzzle);
    const foreign = canonicalKey(parseSolutionDisplay("(1+2+3+4)"));
    const r = tracker.tryAdd(foreign);
    expect(r.added).toBe(false);
    expect(r.reason).toBe("not-in-puzzle-set");
    expect(r.x).toBe(0);
  });

  it("x never exceeds solution_count", () => {
    const tracker = new ExploreTracker(puzzle);
    for (const s of puzzle.solutions) {
      tracker.tryAdd(canonicalKey(parseSolutionDisplay(s)));
    }
    expect(tracker.getProgress().x).toBeLessThanOrEqual(puzzle.solution_count);
    const extra = tracker.tryAdd("fake-key-not-in-set");
    expect(extra.x).toBeLessThanOrEqual(puzzle.solution_count);
  });
});
