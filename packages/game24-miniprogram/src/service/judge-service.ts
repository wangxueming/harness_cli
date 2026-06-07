import type {
  BoardState,
  ExprNode,
  GameSessionMeta,
  JudgeResult,
} from "../types/game.js";
import {
  canonicalDisplay,
  canonicalKey,
} from "./canonicalizer.js";
import { remainingCount } from "./merge-engine.js";
import { equals24 } from "./rational-math.js";

function collectSourceCardIds(node: ExprNode): string[] {
  if (node.kind === "num") {
    return node.sourceCardId ? [node.sourceCardId] : [];
  }
  return [
    ...collectSourceCardIds(node.left),
    ...collectSourceCardIds(node.right),
  ];
}

function collectUsedFaces(
  board: BoardState,
  node: ExprNode
): Map<string, "A" | "B"> {
  const used = new Map<string, "A" | "B">();

  function walk(n: ExprNode) {
    if (n.kind === "num" && n.sourceCardId) {
      const card = board.cards.find((c) => c.id === n.sourceCardId);
      if (card) used.set(card.id, card.visibleFace);
      return;
    }
    if (n.kind !== "num") {
      walk(n.left);
      walk(n.right);
    }
  }

  walk(node);
  return used;
}

export function shouldAutoJudge(board: BoardState): boolean {
  return remainingCount(board) === 1;
}

export function evaluate(
  board: BoardState,
  meta: GameSessionMeta
): JudgeResult {
  if (!shouldAutoJudge(board)) {
    return { outcome: "pending" };
  }

  const root = board.nodes[0]!;
  const value = evalRoot(root);

  if (meta.gameMode === "dual-face") {
    const usedIds = collectSourceCardIds(root);
    const unique = new Set(usedIds);
    if (unique.size !== board.cards.length) {
      return {
        outcome: "invalid-usage",
        message: "双面牌模式下四张牌各用且仅用一次（每牌恰好一面）",
        countAttempt: true,
      };
    }
    const faces = collectUsedFaces(board, root);
    if (faces.size !== board.cards.length) {
      return {
        outcome: "invalid-usage",
        message: "双面牌模式下四张牌各用且仅用一次（每牌恰好一面）",
        countAttempt: true,
      };
    }
  } else {
    const usedIds = collectSourceCardIds(root);
    const unique = new Set(usedIds);
    if (unique.size !== board.cards.length) {
      return {
        outcome: "invalid-usage",
        message: "四张牌必须各用且仅用一次",
        countAttempt: true,
      };
    }
  }

  if (!equals24(value)) {
    return {
      outcome: "wrong",
      message: "结果不是 24，请继续尝试",
      countAttempt: true,
    };
  }

  const key = canonicalKey(root);
  const display = canonicalDisplay(root);
  return { outcome: "correct", canonicalKey: key, display, countAttempt: true };
}

function evalRoot(node: ExprNode): { num: number; den: number } {
  if (node.kind === "num") return node.value;
  const l = evalRoot(node.left);
  const r = evalRoot(node.right);
  switch (node.kind) {
    case "+":
      return {
        num: l.num * r.den + r.num * l.den,
        den: l.den * r.den,
      };
    case "-":
      return {
        num: l.num * r.den - r.num * l.den,
        den: l.den * r.den,
      };
    case "×":
      return { num: l.num * r.num, den: l.den * r.den };
    case "÷":
      return { num: l.num * r.den, den: l.den * r.num };
  }
}
