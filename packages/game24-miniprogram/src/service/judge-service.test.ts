import { describe, expect, it } from "vitest";
import type { GameSessionMeta } from "../types/game.js";
import { createInitialBoard, apply } from "./merge-engine.js";
import { evaluate, shouldAutoJudge } from "./judge-service.js";

function mergedNodeId(board: { nodeIds: string[] }): string {
  return board.nodeIds[board.nodeIds.length - 1]!;
}

const baseMeta: GameSessionMeta = {
  kind: "mainline",
  gameMode: "normal",
  playMode: "free",
  levelNumber: 1,
  puzzle: {
    cards: [1, 1, 2, 6],
    cards_label: "1,1,2,6",
    solution_count: 2,
    min_steps: 3,
    solutions: ["((1+1)×2×6)", "((1+1+2)×6)"],
  },
  hintUsed: false,
  startedAt: Date.now(),
  scoreWrites: true,
  progressWrites: true,
};

describe("judge-service", () => {
  it("shouldAutoJudge only when one node remains", () => {
    const board = createInitialBoard(
      [1, 2, 3, 4].map((v, i) => ({
        id: `c${i}`,
        faceA: v,
        faceB: v,
        visibleFace: "A" as const,
        consumed: false,
        expr: { kind: "num" as const, value: { num: v, den: 1 }, sourceCardId: `c${i}` },
      }))
    );
    expect(shouldAutoJudge(board)).toBe(false);
  });

  it("evaluates correct 24 solution via merges", () => {
    let board = createInitialBoard(
      [1, 1, 2, 6].map((v, i) => ({
        id: `c${i}`,
        faceA: v,
        faceB: v,
        visibleFace: "A" as const,
        consumed: false,
        expr: { kind: "num" as const, value: { num: v, den: 1 }, sourceCardId: `c${i}` },
      }))
    );
    board = apply(board, "c0", "c1", "+");
    board = apply(board, mergedNodeId(board), "c2", "+");
    board = apply(board, mergedNodeId(board), "c3", "×");
    expect(shouldAutoJudge(board)).toBe(true);
    const result = evaluate(board, baseMeta);
    expect(result.outcome).toBe("correct");
  });

  it("evaluates wrong result", () => {
    let board = createInitialBoard(
      [1, 2, 3, 4].map((v, i) => ({
        id: `c${i}`,
        faceA: v,
        faceB: v,
        visibleFace: "A" as const,
        consumed: false,
        expr: { kind: "num" as const, value: { num: v, den: 1 }, sourceCardId: `c${i}` },
      }))
    );
    board = apply(board, "c0", "c1", "+");
    board = apply(board, mergedNodeId(board), "c2", "+");
    board = apply(board, mergedNodeId(board), "c3", "+");
    expect(shouldAutoJudge(board)).toBe(true);
    const result = evaluate(board, baseMeta);
    expect(result.outcome).toBe("wrong");
  });
});
