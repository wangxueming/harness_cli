/** Frozen: Req 13, 16 §3 */
export type ScoreRecord = { wins: number; attempts: number };

export type GameMode = "normal" | "dual-face";
export type PlayMode = "free" | "explore";
export type Operator = "+" | "-" | "×" | "÷";

export type Rational = { num: number; den: number };

export type ExprNode =
  | { kind: "num"; value: Rational; sourceCardId?: string }
  | { kind: "+"; left: ExprNode; right: ExprNode }
  | { kind: "-"; left: ExprNode; right: ExprNode }
  | { kind: "×"; left: ExprNode; right: ExprNode }
  | { kind: "÷"; left: ExprNode; right: ExprNode };

export type PhysicalCard = {
  id: string;
  faceA: number;
  faceB: number;
  visibleFace: "A" | "B";
  consumed: boolean;
  expr: ExprNode;
};

export type BoardState = {
  /** Mergeable expressions on the field (1–4 items). */
  nodes: ExprNode[];
  /** Parallel mergeable slot ids aligned with nodes. */
  nodeIds: string[];
  cards: PhysicalCard[];
};

export type HistoryStep = {
  index: number;
  label: string;
  board: BoardState;
};

export type PuzzleRecord = {
  cards: number[];
  cards_label: string;
  solution_count: number;
  min_steps: number | null;
  solutions: string[];
};

export type LevelTier = "novice" | "standard" | "expert";

export type SessionKind = "mainline" | "challenge";

export type GameSessionMeta = {
  kind: SessionKind;
  gameMode: GameMode;
  playMode: PlayMode;
  levelNumber: number;
  puzzle: PuzzleRecord;
  hintUsed: boolean;
  startedAt: number;
  scoreWrites: boolean;
  progressWrites: boolean;
};

export type UserPrefs = {
  gameMode?: GameMode;
  playMode?: PlayMode;
};

export type PersistedState = {
  score: ScoreRecord;
  mainlineLevel: number;
  prefs: UserPrefs;
};

export type SessionPhase = "playing" | "judged" | "finished";

export type JudgeResult =
  | { outcome: "pending" }
  | { outcome: "wrong"; message: string; countAttempt: true }
  | {
      outcome: "correct";
      canonicalKey: string;
      display: string;
      countAttempt: true;
    }
  | { outcome: "invalid-usage"; message: string; countAttempt?: true };

export type ExploreAddResult = {
  added: boolean;
  x: number;
  reason?: "duplicate" | "not-in-puzzle-set" | "at-cap";
};

export type SoundEvent = "merge" | "correct" | "wrong" | "flip";

export type PersistencePort = {
  loadState(): PersistedState;
  recordWin(): ScoreRecord;
  recordAttempt(): ScoreRecord;
  advanceMainlineLevel(): number;
};

export type AudioPort = {
  play(event: SoundEvent): void;
};
