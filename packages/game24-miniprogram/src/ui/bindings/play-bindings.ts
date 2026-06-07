import type { Operator } from "../../types/game.js";
import type { GameSessionState } from "../../runtime/game-session-controller.js";
import { displayValueForNode } from "../../service/merge-engine.js";

export type CardView = {
  id: string;
  displayValue: string;
  selected: boolean;
  consumed: boolean;
  showFlipHint: boolean;
  flipping: boolean;
};

export type HistoryLabelView = {
  index: number;
  label: string;
  active: boolean;
};

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function buildPlayViewModel(state: GameSessionState): {
  elapsedText: string;
  showExploreProgress: boolean;
  exploreX: number;
  exploreY: number;
  cardViews: CardView[];
  historyLabels: HistoryLabelView[];
  feedback: string;
  operators: Operator[];
} {
  const activeIds = new Set(state.board.nodeIds);
  const cardViews: CardView[] = state.board.cards
    .filter((c) => activeIds.has(c.id) || !c.consumed)
    .map((card) => {
      const nodeIdx = state.board.nodeIds.indexOf(card.id);
      const node = nodeIdx >= 0 ? state.board.nodes[nodeIdx] : card.expr;
      return {
        id: card.id,
        displayValue: displayValueForNode(node!),
        selected: state.selectedIds.includes(card.id),
        consumed: card.consumed && !activeIds.has(card.id),
        showFlipHint:
          state.meta.gameMode === "dual-face" && !card.consumed,
        flipping: state.flippingCardId === card.id,
      };
    });

  // Include merge result nodes not tied to original card id
  for (let i = 0; i < state.board.nodeIds.length; i++) {
    const id = state.board.nodeIds[i]!;
    if (state.board.cards.some((c) => c.id === id)) continue;
    cardViews.push({
      id,
      displayValue: displayValueForNode(state.board.nodes[i]!),
      selected: state.selectedIds.includes(id),
      consumed: false,
      showFlipHint: false,
      flipping: false,
    });
  }

  const historyLabels = state.history.map((h, index) => ({
    index,
    label: h.label,
    active: index === state.history.length - 1,
  }));

  const progress = state.explore?.getProgress() ?? { x: 0, y: 0 };

  return {
    elapsedText: formatElapsed(state.elapsed),
    showExploreProgress: state.meta.playMode === "explore",
    exploreX: progress.x,
    exploreY: progress.y,
    cardViews,
    historyLabels,
    feedback: state.feedback,
    operators: ["+", "-", "×", "÷"],
  };
}

export function parsePlayQuery(query: Record<string, string | undefined>): {
  level: number;
  gameMode: "normal" | "dual-face";
  playMode: "free" | "explore";
} {
  return {
    level: Math.max(1, Number(query.level) || 1),
    gameMode: query.gameMode === "dual-face" ? "dual-face" : "normal",
    playMode: query.playMode === "explore" ? "explore" : "free",
  };
}
