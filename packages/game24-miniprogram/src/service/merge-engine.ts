import type {
  BoardState,
  ExprNode,
  Operator,
  PhysicalCard,
} from "../types/game.js";
import { add, div, fromInt, mul, sub } from "./rational-math.js";

function visibleValue(card: PhysicalCard): number {
  return card.visibleFace === "A" ? card.faceA : card.faceB;
}

function leafForCard(card: PhysicalCard): ExprNode {
  return {
    kind: "num",
    value: fromInt(visibleValue(card)),
    sourceCardId: card.id,
  };
}

export function createInitialBoard(cards: PhysicalCard[]): BoardState {
  const boardCards = cards.map((c) => ({
    ...c,
    expr: leafForCard(c),
    consumed: false,
  }));
  return {
    nodes: boardCards.map((c) => c.expr),
    nodeIds: boardCards.map((c) => c.id),
    cards: boardCards,
  };
}

function findNodeIndex(board: BoardState, id: string): number {
  return board.nodeIds.indexOf(id);
}

function evalNode(node: ExprNode): ReturnType<typeof fromInt> {
  if (node.kind === "num") return node.value;
  const l = evalNode(node.left);
  const r = evalNode(node.right);
  switch (node.kind) {
    case "+":
      return add(l, r);
    case "-":
      return sub(l, r);
    case "×":
      return mul(l, r);
    case "÷":
      return div(l, r);
  }
}

function combine(left: ExprNode, right: ExprNode, op: Operator): ExprNode {
  return { kind: op, left, right };
}

function markSubtreeConsumed(cards: PhysicalCard[], node: ExprNode): void {
  if (node.kind === "num" && node.sourceCardId) {
    const card = cards.find((c) => c.id === node.sourceCardId);
    if (card) {
      card.consumed = true;
      card.expr = node;
    }
    return;
  }
  if (node.kind !== "num") {
    markSubtreeConsumed(cards, node.left);
    markSubtreeConsumed(cards, node.right);
  }
}

export function remainingCount(board: BoardState): number {
  return board.nodes.length;
}

export function canMerge(
  board: BoardState,
  idA: string,
  idB: string,
  _op: Operator
): boolean {
  if (idA === idB) return false;
  const i = findNodeIndex(board, idA);
  const j = findNodeIndex(board, idB);
  if (i < 0 || j < 0) return false;
  if (board.nodes.length < 2) return false;
  return true;
}

export function apply(
  board: BoardState,
  idA: string,
  idB: string,
  op: Operator
): BoardState {
  if (!canMerge(board, idA, idB, op)) {
    throw new Error("cannot merge");
  }
  const i = findNodeIndex(board, idA);
  const j = findNodeIndex(board, idB);
  const left = board.nodes[i]!;
  const right = board.nodes[j]!;
  const merged = combine(left, right, op);

  const cards = board.cards.map((c) => ({
    ...c,
    expr: { ...c.expr },
  }));

  markSubtreeConsumed(cards, left);
  markSubtreeConsumed(cards, right);

  const survivorId = `m-${idA}-${idB}-${op}`;
  const newNodes = board.nodes.filter((_, idx) => idx !== i && idx !== j);
  const newIds = board.nodeIds.filter((_, idx) => idx !== i && idx !== j);
  newNodes.push(merged);
  newIds.push(survivorId);

  return { nodes: newNodes, nodeIds: newIds, cards };
}

export function flipCard(board: BoardState, cardId: string): BoardState {
  const cards = board.cards.map((c) => ({ ...c, expr: { ...c.expr } }));
  const card = cards.find((c) => c.id === cardId);
  if (!card || card.consumed) return board;

  card.visibleFace = card.visibleFace === "A" ? "B" : "A";
  const newLeaf = leafForCard(card);
  card.expr = newLeaf;

  const nodeIdx = board.nodeIds.indexOf(cardId);
  const nodes = [...board.nodes];
  if (nodeIdx >= 0) {
    nodes[nodeIdx] = newLeaf;
  }

  return { nodes, nodeIds: [...board.nodeIds], cards };
}

export function formatMergeLabel(
  left: ExprNode,
  right: ExprNode,
  op: Operator,
  result: ExprNode
): string {
  const fmt = (n: ExprNode): string => {
    if (n.kind === "num") return String(n.value.num / n.value.den);
    return "?";
  };
  const rv = evalNode(result);
  const val = rv.den === 1 ? String(rv.num) : `${rv.num}/${rv.den}`;
  return `${fmt(left)}${op}${fmt(right)}=${val}`;
}

export function cloneBoard(board: BoardState): BoardState {
  return {
    nodes: board.nodes.map(cloneExpr),
    nodeIds: [...board.nodeIds],
    cards: board.cards.map((c) => ({
      ...c,
      expr: cloneExpr(c.expr),
    })),
  };
}

function cloneExpr(node: ExprNode): ExprNode {
  if (node.kind === "num") return { ...node, value: { ...node.value } };
  return {
    kind: node.kind,
    left: cloneExpr(node.left),
    right: cloneExpr(node.right),
  };
}

export function displayValueForNode(node: ExprNode): string {
  const v = evalNode(node);
  if (v.den === 1) return String(v.num);
  return `${v.num}/${v.den}`;
}
