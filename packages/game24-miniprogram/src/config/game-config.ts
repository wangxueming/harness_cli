import type { Operator } from "../types/game.js";

export const OPERATORS: readonly Operator[] = ["+", "-", "×", "÷"] as const;

export const CARD_FACE_MIN = 1;
export const CARD_FACE_MAX = 10;

/** Salt for deterministic dual-face B-side generation. */
export const DUAL_FACE_SEED_SALT = "game24-dual-face-v1";

export function isCardInNormalRange(n: number): boolean {
  return n >= CARD_FACE_MIN && n <= CARD_FACE_MAX;
}
