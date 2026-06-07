import type { PhysicalCard, PuzzleRecord } from "../types/game.js";

const FACE_SUFFIX = { A: "(A)", B: "(B)" } as const;

function visibleNumber(card: PhysicalCard): number {
  return card.visibleFace === "A" ? card.faceA : card.faceB;
}

function annotateSolution(
  solution: string,
  cards: PhysicalCard[],
  puzzle: PuzzleRecord
): string {
  const values = puzzle.cards;
  const faceMap = new Map<number, ("A" | "B")[]>();
  cards.forEach((card, i) => {
    const puzzleVal = values[i]!;
    const list = faceMap.get(puzzleVal) ?? [];
    list.push(card.visibleFace);
    faceMap.set(puzzleVal, list);
  });

  const usedCount = new Map<number, number>();

  return solution.replace(/\b(\d+|J|Q|K)\b/g, (match) => {
    const num =
      match === "J" ? 11 : match === "Q" ? 12 : match === "K" ? 13 : Number(match);
    const idx = usedCount.get(num) ?? 0;
    usedCount.set(num, idx + 1);

    const cardIndex = findCardIndexForValue(cards, puzzle, num, idx);
    if (cardIndex < 0) return match;
    const card = cards[cardIndex]!;
    if (card.faceA === card.faceB && card.visibleFace === "A") return match;
    return `${visibleNumber(card)}${FACE_SUFFIX[card.visibleFace]}`;
  });
}

function findCardIndexForValue(
  cards: PhysicalCard[],
  puzzle: PuzzleRecord,
  value: number,
  occurrence: number
): number {
  let seen = 0;
  for (let i = 0; i < puzzle.cards.length; i++) {
    if (puzzle.cards[i] === value) {
      if (seen === occurrence) return i;
      seen++;
    }
  }
  return -1;
}

export function showAnswer(
  puzzle: PuzzleRecord,
  cards?: PhysicalCard[]
): string[] {
  if (!cards || cards.every((c) => c.faceA === c.faceB)) {
    return [...puzzle.solutions];
  }
  return puzzle.solutions.map((s) => annotateSolution(s, cards, puzzle));
}
