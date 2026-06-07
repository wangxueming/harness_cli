import { describe, expect, it } from "vitest";
import type { PhysicalCard } from "../types/game.js";
import {
  apply,
  canMerge,
  createInitialBoard,
  flipCard,
  remainingCount,
} from "./merge-engine.js";

function makeCards(values: number[]): PhysicalCard[] {
  return values.map((v, i) => ({
    id: `c${i}`,
    faceA: v,
    faceB: v + 1,
    visibleFace: "A" as const,
    consumed: false,
    expr: { kind: "num" as const, value: { num: v, den: 1 }, sourceCardId: `c${i}` },
  }));
}

describe("merge-engine", () => {
  it("merges two cards reducing count", () => {
    const board = createInitialBoard(makeCards([1, 2, 3, 4]));
    expect(remainingCount(board)).toBe(4);
    const next = apply(board, "c0", "c1", "+");
    expect(remainingCount(next)).toBe(3);
    expect(next.cards.find((c) => c.id === "c0")!.consumed).toBe(true);
    expect(next.cards.find((c) => c.id === "c1")!.consumed).toBe(true);
  });

  it("canMerge rejects same id", () => {
    const board = createInitialBoard(makeCards([1, 2, 3, 4]));
    expect(canMerge(board, "c0", "c0", "+")).toBe(false);
  });

  it("flipCard toggles visible face when not consumed", () => {
    const board = createInitialBoard(makeCards([3, 8, 3, 8]));
    const flipped = flipCard(board, "c0");
    expect(flipped.cards[0]!.visibleFace).toBe("B");
    expect(flipped.nodes[0]!.kind).toBe("num");
    if (flipped.nodes[0]!.kind === "num") {
      expect(flipped.nodes[0]!.value.num).toBe(4);
    }
  });

  it("flipCard ignores consumed cards", () => {
    let board = createInitialBoard(makeCards([1, 2, 3, 4]));
    board = apply(board, "c0", "c1", "+");
    const flipped = flipCard(board, "c0");
    expect(flipped).toEqual(board);
  });
});
