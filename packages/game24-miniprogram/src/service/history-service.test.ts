import { describe, expect, it } from "vitest";
import type { PhysicalCard } from "../types/game.js";
import { createInitialBoard, apply } from "./merge-engine.js";
import { append, initialHistory, jumpTo } from "./history-service.js";

function makeCards(values: number[]): PhysicalCard[] {
  return values.map((v, i) => ({
    id: `c${i}`,
    faceA: v,
    faceB: v,
    visibleFace: "A" as const,
    consumed: false,
    expr: { kind: "num" as const, value: { num: v, den: 1 }, sourceCardId: `c${i}` },
  }));
}

function mergedNodeId(board: { nodeIds: string[] }): string {
  return board.nodeIds[board.nodeIds.length - 1]!;
}

describe("history-service", () => {
  it("append and jumpTo truncates later steps", () => {
    let board = createInitialBoard(makeCards([1, 2, 3, 4]));
    let steps = initialHistory(board);
    board = apply(board, "c0", "c1", "+");
    steps = append(steps, board, "1+2=3");
    board = apply(board, mergedNodeId(board), "c2", "×");
    steps = append(steps, board, "3×3=9");

    expect(steps.length).toBe(3);
    const jumped = jumpTo(steps, 0);
    expect(jumped.steps.length).toBe(1);
    expect(jumped.board.nodes.length).toBe(4);
    expect(jumped.board.cards.every((c) => !c.consumed)).toBe(true);
  });
});
