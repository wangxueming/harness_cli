import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PuzzleRecord } from "../types/game.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const DEFAULT_DATA_PATH = path.join(packageRoot, "data/puzzles.jsonl");

let cached: PuzzleRecord[] | null = null;

function parseLine(line: string): PuzzleRecord | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as PuzzleRecord;
}

export class PuzzleRepo {
  private readonly dataPath: string;

  constructor(dataPath: string = DEFAULT_DATA_PATH) {
    this.dataPath = dataPath;
  }

  loadAll(): PuzzleRecord[] {
    if (cached) return cached;
    const raw = fs.readFileSync(this.dataPath, "utf8");
    const records = raw
      .split("\n")
      .map(parseLine)
      .filter((r): r is PuzzleRecord => r !== null);
    cached = records;
    return records;
  }

  getByLabel(label: string): PuzzleRecord | undefined {
    return this.loadAll().find((p) => p.cards_label === label);
  }

  /** Test helper — clears module cache. */
  static resetCache(): void {
    cached = null;
  }
}

export const defaultPuzzleRepo = new PuzzleRepo();
