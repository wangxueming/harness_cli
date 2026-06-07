import { describe, expect, it } from "vitest";
import { buildPhysicalCards } from "./level-selector.js";
import { showAnswer } from "./hint-service.js";

const puzzle = {
  cards: [3, 8, 3, 8],
  cards_label: "3,8,3,8",
  solution_count: 1,
  min_steps: 3,
  solutions: ["((3+3)×(8÷8))"],
};

describe("hint-service", () => {
  it("returns raw solutions for normal mode", () => {
    const cards = buildPhysicalCards(puzzle, "normal", 1);
    expect(showAnswer(puzzle, cards)).toEqual(puzzle.solutions);
  });

  it("annotates dual-face visible sides", () => {
    const cards = buildPhysicalCards(puzzle, "dual-face", 1);
    const flipped = cards.map((c, i) =>
      i === 1 ? { ...c, visibleFace: "B" as const } : c
    );
    const answers = showAnswer(puzzle, flipped);
    expect(answers[0]).toContain("(A)");
    expect(answers[0]).toContain("(B)");
  });
});
