import type { PuzzleRecord } from "../types/game.js";
import {
  canonicalKey,
  parseSolutionDisplay,
} from "./canonicalizer.js";

export class ExploreTracker {
  private readonly discoveredKeys = new Set<string>();
  private readonly puzzle: PuzzleRecord;
  private readonly solutionKeys: Set<string>;
  private attempts = 0;

  constructor(puzzle: PuzzleRecord) {
    this.puzzle = puzzle;
    this.solutionKeys = buildSolutionKeySet(puzzle);
  }

  getProgress(): { x: number; y: number } {
    return { x: this.discoveredKeys.size, y: this.puzzle.solution_count };
  }

  getAttempts(): number {
    return this.attempts;
  }

  tryAdd(key: string): {
    added: boolean;
    x: number;
    reason?: "duplicate" | "not-in-puzzle-set" | "at-cap";
  } {
    this.attempts += 1;
    const xBefore = this.discoveredKeys.size;

    if (!this.solutionKeys.has(key)) {
      return { added: false, x: xBefore, reason: "not-in-puzzle-set" };
    }

    if (this.discoveredKeys.has(key)) {
      return { added: false, x: xBefore, reason: "duplicate" };
    }

    if (this.discoveredKeys.size >= this.puzzle.solution_count) {
      return { added: false, x: xBefore, reason: "at-cap" };
    }

    this.discoveredKeys.add(key);
    const x = this.discoveredKeys.size;
    return { added: true, x };
  }
}

export function buildSolutionKeySet(puzzle: PuzzleRecord): Set<string> {
  const keys = new Set<string>();
  for (const display of puzzle.solutions) {
    try {
      const node = parseSolutionDisplay(display);
      keys.add(canonicalKey(node));
    } catch {
      // skip malformed entries
    }
  }
  return keys;
}
