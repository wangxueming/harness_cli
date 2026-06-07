import { describe, expect, it } from "vitest";
import { isCardInNormalRange } from "../config/game-config.js";
import {
  buildPhysicalCards,
  pickForChallenge,
  pickForMainline,
} from "./level-selector.js";

describe("level-selector", () => {
  it("pickForMainline returns cards within 1-10 for normal mode", () => {
    const { puzzle, cards } = pickForMainline(10, "normal");
    expect(puzzle.cards.every(isCardInNormalRange)).toBe(true);
    expect(cards).toHaveLength(4);
    expect(cards[0]!.faceA).toBe(puzzle.cards[0]);
  });

  it("dual-face assigns distinct faceB", () => {
    const { cards } = pickForMainline(5, "dual-face");
    expect(cards.every((c) => c.faceB >= 1 && c.faceB <= 10)).toBe(true);
  });

  it("pickForChallenge uses label when provided", () => {
    const { puzzle } = pickForChallenge(99, "1,1,2,6");
    expect(puzzle.cards_label).toBe("1,1,2,6");
  });

  it("buildPhysicalCards is deterministic", () => {
    const a = buildPhysicalCards(
      {
        cards: [3, 8, 3, 8],
        cards_label: "3,8,3,8",
        solution_count: 1,
        min_steps: 3,
        solutions: [],
      },
      "dual-face",
      7
    );
    const b = buildPhysicalCards(
      {
        cards: [3, 8, 3, 8],
        cards_label: "3,8,3,8",
        solution_count: 1,
        min_steps: 3,
        solutions: [],
      },
      "dual-face",
      7
    );
    expect(a.map((c) => c.faceB)).toEqual(b.map((c) => c.faceB));
  });
});
