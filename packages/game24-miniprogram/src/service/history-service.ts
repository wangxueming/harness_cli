import type { BoardState, HistoryStep } from "../types/game.js";
import { cloneBoard } from "./merge-engine.js";

export function append(
  steps: HistoryStep[],
  board: BoardState,
  label: string
): HistoryStep[] {
  const snapshot = cloneBoard(board);
  const next: HistoryStep = {
    index: steps.length,
    label,
    board: snapshot,
  };
  return [...steps, next];
}

export function jumpTo(
  steps: HistoryStep[],
  index: number
): { steps: HistoryStep[]; board: BoardState } {
  if (index < 0 || index >= steps.length) {
    throw new Error(`invalid history index: ${index}`);
  }
  const kept = steps.slice(0, index + 1);
  const board = cloneBoard(kept[index]!.board);
  return { steps: kept, board };
}

export function initialHistory(board: BoardState): HistoryStep[] {
  return append([], board, "开局");
}
