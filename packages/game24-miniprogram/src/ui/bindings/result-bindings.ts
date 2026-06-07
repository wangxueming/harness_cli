import { buildSharePath } from "../../config/share-routes.js";
import { formatElapsed } from "./play-bindings.js";

export function buildResultViewModel(query: Record<string, string | undefined>): {
  elapsedText: string;
  hintUsed: boolean;
  levelNumber: number;
  cardsLabel: string;
  sharePath: string;
} {
  const elapsed = Number(query.elapsed) || 0;
  const levelNumber = Math.max(1, Number(query.level) || 1);
  const cardsLabel = query.label ?? "";
  const hintUsed = query.hintUsed === "1" || query.hintUsed === "true";
  return {
    elapsedText: formatElapsed(elapsed),
    hintUsed,
    levelNumber,
    cardsLabel,
    sharePath: buildSharePath(levelNumber, cardsLabel),
  };
}

export function buildShareMessage(levelNumber: number): { title: string; path: string } {
  return {
    title: `来挑战第 ${levelNumber} 关 24 点！`,
    path: "",
  };
}

export function resultContinuePath(): string {
  return "/pages/home/home";
}
