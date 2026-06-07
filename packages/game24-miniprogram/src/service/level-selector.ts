import {
  CARD_FACE_MAX,
  CARD_FACE_MIN,
  DUAL_FACE_SEED_SALT,
} from "../config/game-config.js";
import type { GameMode, PhysicalCard, PuzzleRecord } from "../types/game.js";
import { getPuzzleIndex } from "../repo/puzzle-index.js";
import { PuzzleRepo } from "../repo/puzzle-repo.js";
import { fromInt } from "./rational-math.js";

function seededFaceB(levelNumber: number, index: number): number {
  let hash = 2166136261;
  const seed = `${DUAL_FACE_SEED_SALT}:${levelNumber}:${index}`;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const range = CARD_FACE_MAX - CARD_FACE_MIN + 1;
  return CARD_FACE_MIN + (Math.abs(hash) % range);
}

export function buildPhysicalCards(
  puzzle: PuzzleRecord,
  gameMode: GameMode,
  levelNumber: number
): PhysicalCard[] {
  return puzzle.cards.map((faceA, i) => {
    const faceB =
      gameMode === "dual-face" ? seededFaceB(levelNumber, i) : faceA;
    const id = `c${i}`;
    const value = faceA;
    return {
      id,
      faceA,
      faceB,
      visibleFace: "A" as const,
      consumed: false,
      expr: {
        kind: "num" as const,
        value: fromInt(value),
        sourceCardId: id,
      },
    };
  });
}

export function pickForMainline(
  levelNumber: number,
  gameMode: GameMode,
  repo: PuzzleRepo = new PuzzleRepo()
): { puzzle: PuzzleRecord; cards: PhysicalCard[] } {
  const index = getPuzzleIndex(repo);
  const puzzle = index.pickForLevel(levelNumber);
  const cards = buildPhysicalCards(puzzle, gameMode, levelNumber);
  return { puzzle, cards };
}

export function pickForChallenge(
  levelNumber: number,
  sharedLabel?: string,
  gameMode: GameMode = "normal",
  repo: PuzzleRepo = new PuzzleRepo()
): { puzzle: PuzzleRecord; cards: PhysicalCard[] } {
  let puzzle: PuzzleRecord | undefined;
  if (sharedLabel) {
    puzzle = repo.getByLabel(sharedLabel);
  }
  if (!puzzle) {
    puzzle = getPuzzleIndex(repo).pickForLevel(levelNumber);
  }
  const cards = buildPhysicalCards(puzzle, gameMode, levelNumber);
  return { puzzle, cards };
}
